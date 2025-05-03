const CreatedThread = require('../../Domains/thread/entities/CreatedThread')
const ThreadRepository = require('../../Domains/thread/ThreadRepository')
const CreatedThreadComment = require('../../Domains/thread/entities/CreatedThreadComment')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const GetThreadWithComments = require('../../Domains/thread/entities/GetThreadWithComments')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addThread(addThread) {
    const { title, body, owner } = addThread
    const id = `thread-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, owner',
      values: [id, title, body, owner]
    }

    const result = await this._pool.query(query)

    return new CreatedThread({ ...result.rows[0] })
  }

  async verifyAvailableThread(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak tersedia')
    }
  }

  async verifyAvailableComment(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak tersedia')
    }
  }

  async verifyOwnerComment(payload) {
    const { threadId, authId, commentId } = payload
    const query = {
      text: `
      SELECT
      t.id as id,
      c.id as comment_id,
      c."owner" as comment_owner
    FROM threads t 
    JOIN "comments" c
    ON t.id = c.thread_id
    WHERE 
      t.id = $1 AND
      c."owner" = $2 and 
      c.id = $3
      `,
      values: [threadId, authId, commentId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('Owner comment tidak tersedia')
    }
  }

  async addComment(addComment) {
    const { content, owner, threadId } = addComment
    const id = `comment-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId]
    }

    const result = await this._pool.query(query)

    return new CreatedThreadComment({ ...result.rows[0] })
  }

  async getThread(payload) {
    const { threadId } = payload
    const query = {
      text: `
      SELECT
      t.id as thread_id,
      t.title as thread_title,
      t.body as thread_body,
      u.username as thread_owner,
      t.created_at as thread_date,
      c.id as comment_id,
      u2.username  as comment_owner,
      c.created_at as comment_date,
      c.content as comment_content
    FROM
      threads t 
    INNER JOIN 
      users u 
    ON t."owner" = u.id 
    LEFT JOIN "comments" c 
    ON c.thread_id = t.id
    LEFT JOIN users u2 on u2.id = c."owner" 
    WHERE t.id = $1
    ORDER BY c.created_at ASC
      `,
      values: [threadId]
    }

    const result = await this._pool.query(query)

    return new GetThreadWithComments(result.rows)
  }

  async deleteComment(payload) {
    const { threadId, commentId } = payload
    const comment = '**komentar telah dihapus**'
    const query = {
      text: 'UPDATE comments set content = $1 WHERE id = $2 AND thread_id = $3 RETURNING id',
      values: [comment, commentId, threadId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Comment gagal dihapus')
    }
  }
}

module.exports = ThreadRepositoryPostgres

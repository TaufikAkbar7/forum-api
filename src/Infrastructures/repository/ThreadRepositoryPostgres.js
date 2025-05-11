const CreatedThread = require('../../Domains/thread/entities/CreatedThread')
const ThreadRepository = require('../../Domains/thread/ThreadRepository')
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

  async verifyOwnerComment(payload) {
    const { threadId, authId, commentId } = payload
    const query = {
      text: `
      SELECT
        t.id as id,
        c.id as comment_id,
        c."owner" as comment_owner
      FROM threads t 
      JOIN "comments" c ON t.id = c.thread_id
      WHERE 
        t.id = $1 AND
        c."owner" = $2 AND 
        c.id = $3
      `,
      values: [threadId, authId, commentId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('Owner comment tidak tersedia')
    }
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
        c.content as comment_content,
        c.is_delete as comment_is_delete,
        c2.id as reply_id,
        c2.parent_id as reply_comment_id,
        c2."content" as reply_content,
        c2.created_at as reply_date,
        c2.is_delete as reply_is_delete,
        u3.username as reply_owner
      FROM threads t 
      INNER JOIN users u ON t."owner" = u.id 
      LEFT JOIN (
        SELECT * FROM comments
        WHERE parent_id IS NULL
      ) c ON c.thread_id = t.id
      LEFT JOIN users u2 ON u2.id = c."owner"
      LEFT JOIN "comments" c2 ON c2.parent_id = c.id 
      LEFT JOIN users u3 ON u3.id = c2."owner" 
      WHERE t.id = $1
      ORDER BY c.created_at ASC, c2.created_at ASC
      `,
      values: [threadId]
    }

    const result = await this._pool.query(query)

    return new GetThreadWithComments(result.rows)
  }
}

module.exports = ThreadRepositoryPostgres

const CreatedThreadComment = require('../../Domains/comment/entities/CreatedThreadComment')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const CommentRepository = require('../../Domains/comment/CommentRepository')

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
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
    return result.rows
  }

  async addComment(addComment) {
    const { content, owner, threadId, commentId } = addComment
    const id = `comment-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, threadId, commentId]
    }

    const result = await this._pool.query(query)

    return new CreatedThreadComment({ ...result.rows[0] })
  }

  async deleteComment(payload) {
    const { threadId, commentId } = payload
    const query = {
      text: 'UPDATE comments set is_delete = true WHERE id = $1 AND thread_id = $2 RETURNING id',
      values: [commentId, threadId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Comment gagal dihapus')
    }
  }
}

module.exports = CommentRepositoryPostgres

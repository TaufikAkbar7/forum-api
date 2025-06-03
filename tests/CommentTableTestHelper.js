/* istanbul ignore file */
const NotFoundError = require('../src/Commons/exceptions/NotFoundError');
const CreatedThreadComment = require('../src/Domains/comment/entities/CreatedThreadComment');
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
    async verifyAvailableComment(id) {
        const query = {
          text: 'SELECT id FROM comments WHERE id = $1',
          values: [id]
        }
    
        const result = await pool.query(query)
    
        if (!result.rowCount) {
          throw new NotFoundError('Comment tidak tersedia')
        }
      },
    
      async addComment(addComment) {
        const { id, content, owner, threadId, commentId } = addComment
    
        const query = {
          text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
          values: [id, content, owner, threadId, commentId]
        }
    
        const result = await pool.query(query)
    
        return new CreatedThreadComment({ ...result.rows[0] })
      },
    
      async deleteComment(payload) {
        const { threadId, commentId } = payload
        const query = {
          text: 'UPDATE comments set is_delete = true WHERE id = $1 AND thread_id = $2 RETURNING id',
          values: [commentId, threadId]
        }
    
        const result = await pool.query(query)
    
        if (!result.rowCount) {
          throw new NotFoundError('Comment gagal dihapus')
        }
      },

      async getCommentById(id) {
        const query = {
          text: 'SELECT * FROM comments WHERE id = $1',
          values: [id],
        };
    
        const result = await pool.query(query);
    
        return result.rows[0];
      },

      async cleanTable() {
        await pool.query('DELETE FROM comments WHERE 1=1');
      },
}

module.exports = CommentTableTestHelper;
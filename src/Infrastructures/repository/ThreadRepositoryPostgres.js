const CreatedThread = require('../../Domains/thread/entities/CreatedThread')
const ThreadRepository = require('../../Domains/thread/ThreadRepository')

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
}

module.exports = ThreadRepositoryPostgres

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const CommentRepositoryPostgres = require('../CommentRespositoryPostgres')
const CreatedThreadComment = require('../../../Domains/comment/entities/CreatedThreadComment')

describe('CommentRepositoryPostgres', () => {
  const fakeIdGenerator = () => '123'
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addComment', () => {
    it('should success add comment', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      await expect(ThreadTableTestHelper.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError)

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      const result = await commentRepositoryPostgres.addComment({
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      expect(result).toStrictEqual(new CreatedThreadComment({
        content: 'test comment',
        owner: 'user-123',
        id: 'comment-123'
      }))
    })

    it('should success add replies', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const userDicoding = await UsersTableTestHelper.findUsersById('user-123')
      expect(userDicoding).toHaveLength(1)

      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'joi',
        password: 'secret_password'
      })
      const userJoi = await UsersTableTestHelper.findUsersById('user-234')
      expect(userJoi).toHaveLength(1)

      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      await expect(ThreadTableTestHelper.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError)

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      await CommentTableTestHelper.addComment({
        id: 'comment-155',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      await expect(CommentTableTestHelper.verifyAvailableComment('comment-155')).resolves.not.toThrowError(NotFoundError)

      const result = await commentRepositoryPostgres.addComment({
        content: 'test replies',
        owner: 'user-234',
        threadId: 'thread-123',
        commentId: 'comment-123'
      })

      expect(result).toStrictEqual(new CreatedThreadComment({
        content: 'test replies',
        owner: 'user-234',
        id: 'comment-123'
      }))
    })
  })

  describe('verifyAvailableComment', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await expect(
        commentRepositoryPostgres.verifyAvailableComment('comment-123')
      ).rejects.toThrowError(new NotFoundError('Comment tidak tersedia'))
    })

    it('should success when comment available', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      await expect(ThreadTableTestHelper.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError)

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      await commentRepositoryPostgres.addComment({
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-123')).resolves.not.toThrowError(NotFoundError)
    })
  })

  describe('deleteComment', () => {
    it('should throw NotFoundError when fail delete comment', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      await expect(ThreadTableTestHelper.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError)

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      await expect(
        commentRepositoryPostgres.deleteComment({
          threadId: 'thread-123',
          commentId: 'comment-123'
        })
      ).rejects.toThrowError(new NotFoundError('Comment gagal dihapus'))
    })

    it('should return undefined when success delete comment', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      await expect(ThreadTableTestHelper.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError)

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      await expect(CommentTableTestHelper.verifyAvailableComment('comment-123')).resolves.not.toThrowError(NotFoundError)

      const result = await commentRepositoryPostgres.deleteComment({
        threadId: 'thread-123',
        commentId: 'comment-123'
      })

      const getComment = await CommentTableTestHelper.getCommentById('comment-123')

      expect(getComment.is_delete).toBe(true)
      expect(result).toBe(undefined)
    })
  })
})

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const pool = require('../../database/postgres/pool')
const CreateThread = require('../../../Domains/thread/entities/CreateThread')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const GetThread = require('../../../Domains/thread/entities/GetThread')
const CreatedThread = require('../../../Domains/thread/entities/CreatedThread')

describe('ThreadRepositoryPostgres', () => {
  const fakeIdGenerator = () => '123'
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread', () => {
    it('should success add thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })

      // Assert
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      const newThread = new CreateThread({
        title: 'test thread',
        body: 'test body thread',
        owner: `user-123`
      })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      )

      // Action
      const result = await threadRepositoryPostgres.addThread(newThread)

      // Assert
      expect(result).toStrictEqual(
        new CreatedThread({
          id: 'thread-123',
          title: 'test thread',
          owner: 'user-123'
        })
      )
      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-322')
      ).rejects.toThrowError(new NotFoundError('Thread tidak tersedia'))
    })
  })

  describe('verifyAvailableThread', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-322')
      ).rejects.toThrowError(new NotFoundError('Thread tidak tersedia'))
    })

    it('should success when thread available', async () => {
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

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)
    })

    it('should return id when thread available', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      )
      await threadRepositoryPostgres.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      const thread =
        await threadRepositoryPostgres.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)
      expect(thread).toStrictEqual([{ id: 'thread-123' }])
    })
  })

  describe('verifyOwnerComment', () => {
    it('should throw AuthorizationError when owner comment not found', async () => {
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

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      await expect(
        threadRepositoryPostgres.verifyOwnerComment({
          threadId: 'thread-123',
          authId: 'user-234',
          commentId: 'comment-234'
        })
      ).rejects.toThrowError(
        new AuthorizationError('Owner comment tidak tersedia')
      )
    })

    it('should have length 1 when owner comment found', async () => {
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

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      const comment = await threadRepositoryPostgres.verifyOwnerComment({
        threadId: 'thread-123',
        authId: 'user-123',
        commentId: 'comment-123'
      })

      expect(comment).toHaveLength(1)
    })
  })

  describe('getThread', () => {
    it('should return thread with empty comment and replies', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(0)
      expect(getThread.thread).toStrictEqual({
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        date: getThread.thread.date,
        username: 'dicoding',
        comments: []
      })
    })

    it('should return thread with comment and empty replies', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const comment =
        await CommentTableTestHelper.verifyAvailableComment('comment-123')
      expect(comment).toHaveLength(1)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(1)
      expect(getThread.thread.comments[0].replies).toBeDefined()
      expect(getThread.thread.comments[0].replies).toHaveLength(0)
      expect(getThread.thread).toStrictEqual({
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        date: getThread.thread.date,
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: getThread.thread.comments[0].date,
            content: 'test comment',
            replies: []
          }
        ]
      })
    })

    it('should return thread with comment and replies', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password'
      })
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      await ThreadTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123'
      })

      const thread =
        await ThreadTableTestHelper.verifyAvailableThread('thread-123')
      expect(thread).toHaveLength(1)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const comment =
        await CommentTableTestHelper.verifyAvailableComment('comment-123')
      expect(comment).toHaveLength(1)

      await CommentTableTestHelper.addComment({
        id: 'comment-1234',
        content: 'test replies',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123'
      })
      const replies =
        await CommentTableTestHelper.verifyAvailableComment('comment-1234')
      expect(replies).toHaveLength(1)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(1)
      expect(getThread.thread.comments[0].replies).toBeDefined()
      expect(getThread.thread.comments[0].replies).toHaveLength(1)
      expect(getThread.thread).toStrictEqual({
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        date: getThread.thread.date,
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: getThread.thread.comments[0].date,
            content: 'test comment',
            replies: [
              {
                id: 'comment-1234',
                username: 'dicoding',
                date: getThread.thread.comments[0].replies[0].date,
                content: 'test replies'
              }
            ]
          }
        ]
      })
    })
  })
})

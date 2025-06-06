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
const GetThreadWithComments = require('../../../Domains/thread/entities/GetThreadWithComments')

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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)
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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)

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

    it('should not throw auth error when owner comment exist', async () => {
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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      await threadRepositoryPostgres.verifyOwnerComment({
        threadId: 'thread-123',
        authId: 'user-123',
        commentId: 'comment-123'
      })

      await expect(
        threadRepositoryPostgres.verifyOwnerComment({
          threadId: 'thread-123',
          authId: 'user-123',
          commentId: 'comment-123'
        })
      ).resolves.not.toThrowError(AuthorizationError)
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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(0)
      expect(getThread).toStrictEqual(
        new GetThreadWithComments([
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: getThread.thread.date,
            comment_id: null,
            comment_content: null,
            comment_owner: null,
            comment_date: null,
            comment_is_delete: false,
            comment_parent_id: null
          }
        ])
      )
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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      await expect(
        CommentTableTestHelper.verifyAvailableComment('comment-123')
      ).resolves.not.toThrowError(NotFoundError)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(1)
      expect(getThread.thread.comments[0].replies).toBeDefined()
      expect(getThread.thread.comments[0].replies).toHaveLength(0)
      expect(getThread).toStrictEqual(
        new GetThreadWithComments([
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: getThread.thread.date,
            comment_id: 'comment-123',
            comment_content: 'test comment',
            comment_owner: 'dicoding',
            comment_date: getThread.thread.comments[0].date,
            comment_is_delete: false,
            comment_parent_id: null
          }
        ])
      )
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

      await expect(
        ThreadTableTestHelper.verifyAvailableThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError)

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'test comment',
        owner: 'user-123',
        threadId: 'thread-123'
      })

      await expect(
        CommentTableTestHelper.verifyAvailableComment('comment-123')
      ).resolves.not.toThrowError(NotFoundError)

      await CommentTableTestHelper.addComment({
        id: 'comment-1234',
        content: 'test replies',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123'
      })
      await expect(
        CommentTableTestHelper.verifyAvailableComment('comment-1234')
      ).resolves.not.toThrowError(NotFoundError)

      const registerThread = new GetThread({ threadId: 'thread-123' })
      const getThread = await threadRepositoryPostgres.getThread(registerThread)
      expect(getThread).toBeDefined()
      expect(getThread.thread.comments).toBeDefined()
      expect(getThread.thread.comments).toHaveLength(1)
      expect(getThread.thread.comments[0].replies).toBeDefined()
      expect(getThread.thread.comments[0].replies).toHaveLength(1)
      expect(getThread).toStrictEqual(
        new GetThreadWithComments([
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: getThread.thread.date,
            comment_id: 'comment-123',
            comment_content: 'test comment',
            comment_owner: 'dicoding',
            comment_date: getThread.thread.comments[0].date,
            comment_is_delete: false,
            comment_parent_id: null
          },
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: getThread.thread.date,
            comment_id: 'comment-1234',
            comment_content: 'test replies',
            comment_owner: 'dicoding',
            comment_date: getThread.thread.comments[0].replies[0].date,
            comment_is_delete: false,
            comment_parent_id: 'comment-123'
          }
        ])
      )
    })
  })
})

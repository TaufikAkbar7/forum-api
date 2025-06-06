const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper')
const ServerTestHelper = require('../../../../tests/ServerTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')

describe('/thread endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    it('should response 201', async () => {
      const payload = {
        title: 'title thread',
        body: 'body thread'
      }
      // eslint-disable-next-line no-undef
      const server = await createServer(container)

      const { accessToken } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
    })
    it('should response 401 when request missing authentication', async () => {
      const payload = {
        title: 'title thread',
        body: 'body thread'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request not contain needed property', async () => {
      const payload = {
        title: 'title thread'
      }
      const server = await createServer(container)

      const { accessToken } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena properti yang dibutuhkan tidak ada'
      )
    })

    it('should response 400 when request not match type specification', async () => {
      const payload = {
        title: 2,
        body: true
      }
      const server = await createServer(container)

      const { accessToken } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena tipe data tidak sesuai'
      )
    })
  })

  describe('when GET /threads/{id}', () => {
    it('should response 200 and array of thread', async () => {
      const threadId = 'thread-123'

      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: 'user-123' })
      const server = await createServer(container)

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()
    })
  })

  describe('when POST /threads/{id}/comments', () => {
    it('should response 201', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: 'test comment'
      }

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()
    })

    it('should response 404 when thread not found', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: 'test comment'
      }
      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-456/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Thread tidak tersedia')
    })

    it('should response 401 when request missing authentication', async () => {
      const threadId = 'thread-123'
      const userId = 'user-123'
      const payload = {
        content: 'test comment'
      }

      const server = await createServer(container)
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-456/comments`,
        payload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request not contain needed property', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: null
      }

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena properti yang dibutuhkan tidak ada'
      )
    })

    it('should response 400 when request not match type specification', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: 2
      }

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena tipe data tidak sesuai'
      )
    })
  })

  describe('when DELETE /threads/{id}/comments/{commentId}', () => {
    it('should response 200', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when thread not found', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-99/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Thread tidak tersedia')
    })
    it('should response 404 when comment not found', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-2334`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Comment tidak tersedia')
    })
    it('should response 403 when user not comment owner', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await UsersTableTestHelper.addUser({
        id: 'user-444',
        username: 'agent',
        password: 'secret',
        fullname: 'agent super'
      })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: 'user-444',
        threadId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Owner comment tidak tersedia')
    })

    it('should response 401 when request missing authentication', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server
      })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })
  })

  describe('when POST /threads/{id}/comments/{commentId}/replies', () => {
    it('should response 201', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: 'test replies'
      }
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply).toBeDefined()
    })

    it('should response 404 when thread not found', async () => {
      const threadId = 'thread-123'
      const payload = {
        content: 'test comment'
      }
      const commentId = 'comment-123'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-233/comments/${commentId}/replies`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Thread tidak tersedia')
    })

    it('should response 401 when request missing authentication', async () => {
      const threadId = 'thread-123'
      const userId = 'user-123'
      const commentId = 'comment-123'
      const payload = {
        content: 'test comment'
      }

      const server = await createServer(container)
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request not contain needed property', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const payload = {
        content: null
      }

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena properti yang dibutuhkan tidak ada'
      )
    })

    it('should response 400 when request not match type specification', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const payload = {
        content: 2
      }

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(
        'tidak dapat membuat data baru karena tipe data tidak sesuai'
      )
    })
  })

  describe('when DELETE /threads/{id}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'comment-1234'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })
      await CommentTableTestHelper.addComment({
        id: replyId,
        content: 'test comment',
        owner: userId,
        threadId,
        commentId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when thread not found', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'comment-1234'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })
      await CommentTableTestHelper.addComment({
        id: replyId,
        content: 'test comment',
        owner: userId,
        threadId,
        commentId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-99/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Thread tidak tersedia')
    })
    it('should response 404 when comment not found', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'comment-1234'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })
      await CommentTableTestHelper.addComment({
        id: replyId,
        content: 'test comment',
        owner: userId,
        threadId,
        commentId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/comment-444`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Comment tidak tersedia')
    })
    it('should response 403 when user not comment owner', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'comment-1234'

      const server = await createServer(container)
      const { accessToken, userId } =
        await ServerTestHelper.getAccessTokenAndUserIdHelper({ server })
      await UsersTableTestHelper.addUser({
        id: 'user-444',
        username: 'agent',
        password: 'secret',
        fullname: 'agent super'
      })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })
      await CommentTableTestHelper.addComment({
        id: replyId,
        content: 'test comment',
        owner: 'user-444',
        threadId,
        commentId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Owner comment tidak tersedia')
    })

    it('should response 401 when request missing authentication', async () => {
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'comment-1234'

      const server = await createServer(container)
      const { userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server
      })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({
        id: commentId,
        content: 'test comment',
        owner: userId,
        threadId
      })
      await CommentTableTestHelper.addComment({
        id: replyId,
        content: 'test comment',
        owner: userId,
        threadId,
        commentId
      })

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toEqual('Unauthorized')
      expect(responseJson.message).toEqual('Missing authentication')
    })
  })
})

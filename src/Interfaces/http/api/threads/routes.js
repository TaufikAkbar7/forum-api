const routes = handler => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt'
    }
  },
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: handler.postThreadCommentsHandler,
    options: {
      auth: 'forumapi_jwt'
    }
  },
  {
    method: 'GET',
    path: '/threads/{id}',
    handler: handler.getThreadHandler
  },
  {
    method: 'DELETE',
    path: '/threads/{id}/comments/{commentId}',
    handler: handler.deleteThreadCommentHandler,
    options: {
      auth: 'forumapi_jwt'
    }
  }
]

module.exports = routes

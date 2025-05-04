const AddRepliesCommentUseCase = require('../../../../Applications/use_case/AddRepliesCommentUseCase')
const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase')
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase')
const DeleteRepliesCommentUseCase = require('../../../../Applications/use_case/DeleteRepliesCommentUseCase')
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase')
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase')

class ThreadsHandler {
  constructor(container) {
    this._container = container

    this.postThreadHandler = this.postThreadHandler.bind(this)
    this.postThreadCommentsHandler = this.postThreadCommentsHandler.bind(this)
    this.getThreadHandler = this.getThreadHandler.bind(this)
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this)
    this.postRepliesCommentHandler = this.postRepliesCommentHandler.bind(this)
    this.deleteRepliesCommentHandler =
      this.deleteRepliesCommentHandler.bind(this)
  }

  async postThreadHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner: credentialId
    })

    const response = h.response({
      status: 'success',
      data: {
        addedThread
      }
    })
    response.code(201)
    return response
  }

  async postThreadCommentsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params
    const addThreadCommentUseCase = this._container.getInstance(
      AddThreadCommentUseCase.name
    )
    const addedComment = await addThreadCommentUseCase.execute({
      ...request.payload,
      threadId: id,
      owner: credentialId
    })

    const response = h.response({
      status: 'success',
      data: {
        addedComment
      }
    })
    response.code(201)
    return response
  }

  async getThreadHandler(request, h) {
    const { id } = request.params
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name)
    const thread = await getThreadUseCase.execute({
      threadId: id
    })

    const response = h.response({
      status: 'success',
      data: thread
    })
    response.code(200)
    return response
  }

  async deleteThreadCommentHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id: threadId, commentId } = request.params
    const deletedThreadUseCase = this._container.getInstance(
      DeleteThreadCommentUseCase.name
    )
    await deletedThreadUseCase.execute({
      threadId,
      commentId,
      authId: credentialId
    })

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }

  async postRepliesCommentHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id, commentId } = request.params
    const addRepliesCommentUseCase = this._container.getInstance(
      AddRepliesCommentUseCase.name
    )
    const addedReply = await addRepliesCommentUseCase.execute({
      ...request.payload,
      commentId,
      threadId: id,
      owner: credentialId
    })

    const response = h.response({
      status: 'success',
      data: {
        addedReply
      }
    })
    response.code(201)
    return response
  }

  async deleteRepliesCommentHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id, replyId } = request.params
    const deleteRepliesCommentUseCase = this._container.getInstance(
      DeleteRepliesCommentUseCase.name
    )
    await deleteRepliesCommentUseCase.execute({
      commentId: replyId,
      threadId: id,
      authId: credentialId
    })

    const response = h.response({
      status: 'success'
    })
    response.code(200)
    return response
  }
}

module.exports = ThreadsHandler

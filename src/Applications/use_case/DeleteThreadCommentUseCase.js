const DeleteThreadComment = require('../../Domains/comment/entities/DeleteThreadComment')

class DeleteThreadCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
  }

  async execute(useCasePayload) {
    const registerThread = new DeleteThreadComment(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    await this._commentRepository.verifyAvailableComment(
      useCasePayload.commentId
    )
    await this._threadRepository.verifyOwnerComment(useCasePayload)
    return this._commentRepository.deleteComment(registerThread)
  }
}

module.exports = DeleteThreadCommentUseCase

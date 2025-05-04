const DeleteThreadComment = require('../../Domains/thread/entities/DeleteThreadComment')

class DeleteRepliesCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    const registerThread = new DeleteThreadComment(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    await this._threadRepository.verifyAvailableComment(
      useCasePayload.commentId
    )
    await this._threadRepository.verifyOwnerComment(useCasePayload)
    return this._threadRepository.deleteComment(registerThread)
  }
}

module.exports = DeleteRepliesCommentUseCase

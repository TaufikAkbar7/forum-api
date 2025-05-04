const CreateThreadComment = require('../../Domains/thread/entities/CreateThreadComment')

class AddRepliesCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    const registerThread = new CreateThreadComment(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    await this._threadRepository.verifyAvailableComment(
      useCasePayload.commentId
    )
    return this._threadRepository.addComment(registerThread)
  }
}

module.exports = AddRepliesCommentUseCase

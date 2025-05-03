const CreateThreadComment = require('../../Domains/thread/entities/CreateThreadComment')

class AddThreadCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    const registerThread = new CreateThreadComment(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    return this._threadRepository.addComment(registerThread)
  }
}

module.exports = AddThreadCommentUseCase

const CreateThreadComment = require('../../Domains/comment/entities/CreateThreadComment')

class AddThreadCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
  }

  async execute(useCasePayload) {
    const registerThread = new CreateThreadComment(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    return this._commentRepository.addComment(registerThread)
  }
}

module.exports = AddThreadCommentUseCase

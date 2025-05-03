const GetThread = require('../../Domains/thread/entities/GetThread')

class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    const registerThread = new GetThread(useCasePayload)
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId)
    return this._threadRepository.getThread(registerThread)
  }
}

module.exports = GetThreadUseCase

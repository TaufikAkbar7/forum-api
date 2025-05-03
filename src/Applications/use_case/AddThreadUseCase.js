const CreateThread = require('../../Domains/thread/entities/CreateThread')

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    const registerThread = new CreateThread(useCasePayload)
    return this._threadRepository.addThread(registerThread)
  }
}

module.exports = AddThreadUseCase

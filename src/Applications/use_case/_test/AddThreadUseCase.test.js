const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const payload = {
      title: 'title thread',
      body: 'body thread',
      owner: 'user-123'
    }
    const exampleReturn = {
      id: 'thread-123',
      title: 'title thread',
      owner: 'user-123'
    }

    const mockThreadRepo = new ThreadRepository()

    mockThreadRepo.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleReturn))

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepo
    })
    const createdThread = await getThreadUseCase.execute(payload)

    expect(createdThread).toStrictEqual(exampleReturn)
    expect(mockThreadRepo.addThread).toBeCalledWith(payload)
  })
})

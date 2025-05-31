const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const GetThreadUseCase = require('../GetThreadUseCase')
const GetThread = require('../../../Domains/thread/entities/GetThread')

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const payload = {
      threadId: 'thread-123'
    }
    const exampleAvailThread = ['thread-123']
    const exampleGetThread = {
      id: 'thread-123',
      title: 'title thread',
      body: 'body thread',
      date: new Date().toISOString(),
      username: 'dicoding',
      comments: []
    }

    const mockGetThread = new GetThread(payload)
    const mockThreadRepo = new ThreadRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleAvailThread))
    mockThreadRepo.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleGetThread))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepo
    })
    const result = await getThreadUseCase.execute(payload)

    expect(result).toStrictEqual(exampleGetThread)
    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockThreadRepo.getThread).toBeCalledWith(mockGetThread)
  })
})

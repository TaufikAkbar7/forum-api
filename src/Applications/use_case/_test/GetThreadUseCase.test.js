const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const GetThreadUseCase = require('../GetThreadUseCase')
const GetThread = require('../../../Domains/thread/entities/GetThread')

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const payload = {
      threadId: 'thread-123'
    }

    const mockGetThread = new GetThread(payload)
    const mockThreadRepo = new ThreadRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(payload))
    mockThreadRepo.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockGetThread))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepo
    })
    const result = await getThreadUseCase.execute(payload)

    expect(result).toStrictEqual(new GetThread(payload))
    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockThreadRepo.getThread).toBeCalledWith(mockGetThread)
  })
})

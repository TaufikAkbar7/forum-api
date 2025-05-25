const CreateThread = require('../../../Domains/thread/entities/CreateThread')
const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const payload = {
      title: 'title thread',
      body: 'body thread',
      owner: 'user-123'
    }

    const mockCreatedThread = new CreateThread(payload)
    const mockThreadRepo = new ThreadRepository()

    mockThreadRepo.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread))

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepo
    })
    const createdThread = await getThreadUseCase.execute(payload)

    expect(createdThread).toStrictEqual(new CreateThread(payload))
    expect(mockThreadRepo.addThread).toBeCalledWith(payload)
  })
})

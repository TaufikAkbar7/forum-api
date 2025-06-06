const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const GetThreadUseCase = require('../GetThreadUseCase')
const GetThread = require('../../../Domains/thread/entities/GetThread')
const GetThreadWithComments = require('../../../Domains/thread/entities/GetThreadWithComments')

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const payload = {
      threadId: 'thread-123'
    }
    const date = new Date()

    const mockGetThread = new GetThread(payload)
    const mockThreadRepo = new ThreadRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepo.getThread = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new GetThreadWithComments([
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: date,
            comment_id: 'comment-123',
            comment_content: 'test comment',
            comment_owner: 'dicoding',
            comment_date: date,
            comment_is_delete: false,
            comment_parent_id: null
          },
          {
            thread_id: 'thread-123',
            thread_title: 'title thread',
            thread_body: 'body thread',
            thread_owner: 'dicoding',
            thread_date: date,
            comment_id: 'comment-1234',
            comment_content: 'test replies',
            comment_owner: 'dicoding',
            comment_date: date,
            comment_is_delete: false,
            comment_parent_id: 'comment-123'
          }
        ])
      )
    )

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepo
    })

    const result = await getThreadUseCase.execute(payload)

    expect(result).toStrictEqual(
      new GetThreadWithComments([
        {
          thread_id: 'thread-123',
          thread_title: 'title thread',
          thread_body: 'body thread',
          thread_owner: 'dicoding',
          thread_date: date,
          comment_id: 'comment-123',
          comment_content: 'test comment',
          comment_owner: 'dicoding',
          comment_date: date,
          comment_is_delete: false,
          comment_parent_id: null
        },
        {
          thread_id: 'thread-123',
          thread_title: 'title thread',
          thread_body: 'body thread',
          thread_owner: 'dicoding',
          thread_date: date,
          comment_id: 'comment-1234',
          comment_content: 'test replies',
          comment_owner: 'dicoding',
          comment_date: date,
          comment_is_delete: false,
          comment_parent_id: 'comment-123'
        }
      ])
    )
    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockThreadRepo.getThread).toBeCalledWith(mockGetThread)
  })
})

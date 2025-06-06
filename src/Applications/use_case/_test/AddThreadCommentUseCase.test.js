const CreateThreadComment = require('../../../Domains/comment/entities/CreateThreadComment')
const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const CommentRepository = require('../../../Domains/comment/CommentRepository')
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase')
const CreatedThreadComment = require('../../../Domains/comment/entities/CreatedThreadComment')

describe('AddThreadCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      content: 'body thread',
      owner: 'user-123'
    }
    const exampleCommentCreated = {
      id: 'comment-123',
      content: 'test replies',
      owner: 'user-123'
    }
    const exampleAvailThread = ['thread-123']

    const mockCreateCommentThread = new CreateThreadComment(payload)
    const mockThreadRepo = new ThreadRepository()
    const mockCommentRepo = new CommentRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleAvailThread))
    mockCommentRepo.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new CreatedThreadComment({
          id: 'comment-123',
          content: 'test replies',
          owner: 'user-123'
        })
      )
    )

    const getAddThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo
    })
    const result = await getAddThreadCommentUseCase.execute(payload)

    expect(result).toStrictEqual(
      new CreatedThreadComment(exampleCommentCreated)
    )
    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockCommentRepo.addComment).toBeCalledWith(mockCreateCommentThread)
  })
})

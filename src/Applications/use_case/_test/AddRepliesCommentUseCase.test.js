const CreateThreadComment = require('../../../Domains/comment/entities/CreateThreadComment')
const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const CommentRepository = require('../../../Domains/comment/CommentRepository')
const AddRepliesCommentUseCase = require('../AddRepliesCommentUseCase')

describe('AddRepliesCommentUseCase', () => {
  it('should orchestrating the add replies action correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      content: 'test replies',
      owner: 'user-123',
      commentId: 'comment-123'
    }
    const exampleCommentCreated = {
      id: 'comment-123',
      content: 'test replies',
      owner: 'user-123'
    }
    const exampleAvailThread = ['thread-123']
    const exampleAvailComment = ['comment-123']

    const mockCreateRepliesThread = new CreateThreadComment(payload)
    const mockThreadRepo = new ThreadRepository()
    const mockCommentRepo = new CommentRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleAvailThread))
    mockCommentRepo.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleAvailComment))
    mockCommentRepo.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(exampleCommentCreated))

    const getAddRepliesCommentUseCase = new AddRepliesCommentUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo
    })
    const result = await getAddRepliesCommentUseCase.execute(payload)

    expect(result).toStrictEqual(exampleCommentCreated)
    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockThreadRepo.verifyAvailableThread.mock.calls[0]).toEqual(
      exampleAvailThread
    )
    expect(mockCommentRepo.verifyAvailableComment).toBeCalledWith(
      payload.commentId
    )
    expect(mockCommentRepo.verifyAvailableComment.mock.calls[0]).toEqual(
      exampleAvailComment
    )
    expect(mockCommentRepo.addComment).toBeCalledWith(mockCreateRepliesThread)
  })
})

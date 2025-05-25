const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const CommentRepository = require('../../../Domains/comment/CommentRepository')
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase')
const DeleteThreadComment = require('../../../Domains/comment/entities/DeleteThreadComment')

describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      authId: 'user-123'
    }

    const mockDeleteCommentThread = new DeleteThreadComment(payload)
    const mockThreadRepo = new ThreadRepository()
    const mockCommentRepo = new CommentRepository()

    mockThreadRepo.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(payload))
    mockCommentRepo.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(payload))
    mockThreadRepo.verifyOwnerComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(payload))
    mockCommentRepo.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDeleteCommentThread))

    const deletedThreadUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo
    })
    await deletedThreadUseCase.execute(payload)

    expect(mockThreadRepo.verifyAvailableThread).toBeCalledWith(
      payload.threadId
    )
    expect(mockCommentRepo.verifyAvailableComment).toBeCalledWith(
      payload.commentId
    )
    expect(mockThreadRepo.verifyOwnerComment).toBeCalledWith(payload)
    expect(mockCommentRepo.deleteComment).toBeCalledWith(
      mockDeleteCommentThread
    )
  })
})

const ThreadRepository = require('../../../Domains/thread/ThreadRepository')
const CommentRepository = require('../../../Domains/comment/CommentRepository')
const DeleteRepliesCommentUseCase = require('../DeleteRepliesCommentUseCase')
const DeleteThreadComment = require('../../../Domains/comment/entities/DeleteThreadComment')

describe('DeleteRepliesCommentUseCase', () => {
  it('should orchestrating the delete replies action correctly', async () => {
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
      .mockImplementation(() => Promise.resolve())
    mockCommentRepo.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepo.verifyOwnerComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepo.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve())

    const deletedThreadUseCase = new DeleteRepliesCommentUseCase({
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

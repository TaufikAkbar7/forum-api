const DeleteThreadComment = require('../DeleteThreadComment')

describe('a DeleteThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'dicoding',
      title: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new DeleteThreadComment(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: 'dicoding',
      authId: {}
    }

    // Action and Assert
    expect(() => new DeleteThreadComment(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create deleteThreadComment object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      authId: 'user-123'
    }

    // Action
    const result = new DeleteThreadComment(payload)

    // Assert
    expect(result).toEqual(payload)
  })
})

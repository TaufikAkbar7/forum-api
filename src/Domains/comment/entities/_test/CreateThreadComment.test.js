const CreateThreadComment = require('../CreateThreadComment')

describe('a CreateThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'dicoding',
      title: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new CreateThreadComment(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      content: 'dicoding',
      owner: {}
    }

    // Action and Assert
    expect(() => new CreateThreadComment(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create createThreadComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'title thread',
      owner: 'user-123',
      commentId: 'comment-123'
    }

    // Action
    const result = new CreateThreadComment(payload)

    // Assert
    expect(result).toEqual(payload)
  })
})

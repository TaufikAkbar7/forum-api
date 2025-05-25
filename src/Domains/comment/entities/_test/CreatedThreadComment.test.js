const CreatedThreadComment = require('../CreatedThreadComment')

describe('a CreatedThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'dicoding',
      title: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new CreatedThreadComment(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      owner: {}
    }

    // Action and Assert
    expect(() => new CreatedThreadComment(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create createdThreadComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment xxx',
      owner: 'user-123'
    }

    // Action
    const result = new CreatedThreadComment(payload)

    // Assert
    expect(result).toEqual(payload)
  })
})

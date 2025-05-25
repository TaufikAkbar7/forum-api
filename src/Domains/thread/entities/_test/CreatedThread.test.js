const CreatedThread = require('../CreatedThread')

describe('a CreatedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'dicoding',
      title: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'dicoding',
      owner: {}
    }

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create createThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'title thread',
      owner: 'user-123'
    }

    // Action
    const result = new CreatedThread(payload)

    // Assert
    expect(result).toEqual(payload)
  })
})

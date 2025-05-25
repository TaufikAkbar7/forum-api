const CreateThread = require('../CreateThread')

describe('a CreateThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new CreateThread(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: 'dicoding',
      owner: {}
    }

    // Action and Assert
    expect(() => new CreateThread(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create createThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'title thread',
      body: 'body thread',
      owner: 'user-123'
    }

    // Action
    const result = new CreateThread(payload)

    // Assert
    expect(result).toEqual(payload)
  })
})

const GetThread = require('../GetThread')

describe('a GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123
    }

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create getThread object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123'
    }

    // Action
    const { threadId } = new GetThread(payload)

    // Assert
    expect(threadId).toEqual(payload.threadId)
  })
})

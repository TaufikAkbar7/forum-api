const GetThreadWithComments = require('../GetThreadWithComments')

describe('a GetThreadWithComments entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      thread_id: '123',
      thread_title: 'Dicoding Indonesia'
    }

    // Action and Assert
    expect(() => new GetThreadWithComments([payload])).toThrowError(
      'COMMON.NOT_CONTAIN_NEEDED_PROPERTY'
    )
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread_id: 123,
      thread_title: 'xx',
      thread_body: 222,
      thread_owner: '123',
      thread_date: 'xx'
    }

    // Action and Assert
    expect(() => new GetThreadWithComments([payload])).toThrowError(
      'COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION'
    )
  })

  it('should create getThreadWithComments object correctly', () => {
    // Arrange
    const payload = {
      thread_id: 'thread-123',
      thread_title: 'title thread',
      thread_body: 'body thread',
      thread_owner: 'dicoding',
      thread_date: new Date(),
      comment_id: 'comment-123',
      comment_content: 'test comment',
      comment_owner: 'dicoding',
      comment_date: new Date(),
      comment_is_delete: false,
      reply_comment_id: 'comment-123',
      reply_id: 'comment-1234',
      reply_content: 'test replies',
      reply_owner: 'dicoding',
      reply_date: new Date(),
      reply_is_delete: false
    }
    const exampleResult = {
      id: 'thread-123',
      title: 'title thread',
      body: 'body thread',
      date: payload.thread_date,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: payload.comment_date,
          content: 'test comment',
          replies: [
            {
              id: 'comment-1234',
              username: 'dicoding',
              date: payload.reply_date,
              content: 'test replies'
            }
          ]
        }
      ]
    }

    // Action
    const { thread } = new GetThreadWithComments([payload])

    // Assert
    expect(thread).toStrictEqual(exampleResult)
  })
})

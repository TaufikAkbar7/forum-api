class CreateThreadComment {
  constructor(payload) {
    this._verifyPayload(payload)

    const { threadId, content, owner, commentId } = payload

    this.threadId = threadId
    this.content = content
    this.owner = owner
    this.commentId = commentId
  }

  _verifyPayload({ threadId, content, owner }) {
    if (!threadId || !content || !owner) {
      throw new Error('COMMON.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof threadId !== 'string' ||
      typeof content !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = CreateThreadComment

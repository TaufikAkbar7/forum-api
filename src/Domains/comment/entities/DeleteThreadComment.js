class DeleteThreadComment {
  constructor(payload) {
    this._verifyPayload(payload)

    const { threadId, commentId, authId } = payload

    this.threadId = threadId
    this.commentId = commentId
    this.authId = authId
  }

  _verifyPayload({ threadId, commentId, authId }) {
    if (!threadId || !commentId || !authId) {
      throw new Error('COMMON.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof threadId !== 'string' ||
      typeof commentId !== 'string' ||
      typeof authId !== 'string'
    ) {
      throw new Error('COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteThreadComment

class GetThreadWithComments {
  constructor(payload) {
    this._verifyPayload(payload)

    const thread = this._mappingResponse(payload)

    this.thread = thread
  }

  _verifyPayload(data) {
    const {
      thread_id,
      thread_title,
      thread_body,
      thread_owner,
      thread_date,
      comment_id,
      comment_owner,
      comment_date,
      comment_content
    } = data[0]
    if (
      !thread_id ||
      !thread_title ||
      !thread_body ||
      !thread_owner ||
      !thread_date ||
      !comment_id ||
      !comment_owner ||
      !comment_date ||
      !comment_content
    ) {
      throw new Error('COMMON.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof thread_id !== 'string' ||
      typeof thread_title !== 'string' ||
      typeof thread_body !== 'string' ||
      typeof thread_owner !== 'string' ||
      typeof thread_date !== 'object' ||
      typeof comment_id !== 'string' ||
      typeof comment_owner !== 'string' ||
      typeof comment_content !== 'string' ||
      typeof comment_date !== 'object'
    ) {
      throw new Error('COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }

  _mappingResponse(data = []) {
    const mappingResults = data.reduce((acc, item) => {
      let obj = acc
      if (!obj) {
        obj = {
          id: item.thread_id,
          title: item.thread_title,
          body: item.thread_body,
          date: item.thread_date,
          username: item.thread_owner,
          comments: []
        }
      }
      if (
        item.comment_id &&
        item.comment_owner &&
        item.comment_date &&
        item.comment_content
      ) {
        obj.comments.push({
          id: item.comment_id,
          username: item.comment_owner,
          date: item.comment_date,
          content: item.comment_content
        })
      }
      return obj
    }, null)
    return mappingResults
  }
}

module.exports = GetThreadWithComments

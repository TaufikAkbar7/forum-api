class GetThreadWithComments {
  constructor(payload) {
    this._verifyPayload(payload)

    const thread = this._mappingResponse(payload)

    this.thread = thread
  }

  _verifyPayload(data) {
    const { thread_id, thread_title, thread_body, thread_owner, thread_date } =
      data[0]
    if (
      !thread_id ||
      !thread_title ||
      !thread_body ||
      !thread_owner ||
      !thread_date
    ) {
      throw new Error('COMMON.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof thread_id !== 'string' ||
      typeof thread_title !== 'string' ||
      typeof thread_body !== 'string' ||
      typeof thread_owner !== 'string' ||
      typeof thread_date !== 'object'
    ) {
      throw new Error('COMMON.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }

  _mappingResponse(data) {
    const result = {
      id: data[0].thread_id,
      title: data[0].thread_title,
      body: data[0].thread_body,
      date: data[0].thread_date,
      username: data[0].thread_owner,
      comments: []
    }

    // handle comments is empty array
    if (data.length === 1 && !data[0].comment_id) {
      return result
    }

    const commentMap = {}

    for (const item of data) {
      const {
        comment_id,
        comment_owner,
        comment_date,
        comment_content,
        comment_is_delete,
        comment_parent_id
      } = item

      const commentObj = {
        id: comment_id,
        username: comment_owner,
        date: comment_date,
        content: comment_is_delete
          ? '**komentar telah dihapus**'
          : comment_content
      }

      if (!comment_parent_id) {
        // comment without reply
        commentMap[comment_id] = { ...commentObj, replies: [] }
        result.comments.push(commentMap[comment_id])
      }
      if (comment_parent_id && commentMap[comment_parent_id]) {
        // reply, then check if parent exists
        commentMap[comment_parent_id].replies.push({
          ...commentObj,
          content: comment_is_delete
            ? '**balasan telah dihapus**'
            : comment_content
        })
      }
    }

    return result
  }
}

module.exports = GetThreadWithComments

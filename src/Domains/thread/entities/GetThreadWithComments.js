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
        const comment = {
          id: item.comment_id,
          username: item.comment_owner,
          date: item.comment_date,
          content: item.comment_is_delete
            ? '**komentar telah dihapus**'
            : item.comment_content,
          replies: []
        }

        if (!item.reply_comment_id) {
          obj.comments.push(comment)
        } else {
          const isCommentExists = obj.comments.findIndex(
            com => com.id === item.comment_id
          )
          const reply = item.reply_is_delete
            ? '**balasan telah dihapus**'
            : item.reply_content

          if (isCommentExists >= 0) {
            obj.comments[isCommentExists].replies.push({
              id: item.reply_id,
              username: item.reply_owner,
              date: item.reply_date,
              content: reply
            })
          } else {
            obj.comments.push({
              ...comment,
              replies: [
                {
                  id: item.reply_id,
                  username: item.reply_owner,
                  date: item.reply_date,
                  content: reply
                }
              ]
            })
          }
        }
      }
      return obj
    }, null)

    return mappingResults
  }
}

module.exports = GetThreadWithComments

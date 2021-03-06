function getPostIdFromElement(element) {
  let isRoot = element.classList.contains('post')
  let rootElement = isRoot ? element : element.closest(`.post`)
  let postId = rootElement.dataset.id
  return postId
}

function createPostHtml(post) {
  let isRetweet = post.retweetData !== undefined
  let retweetBy = isRetweet ? post.postedBy.username : null

  post = isRetweet ? post.retweetData : post

  const { postedBy } = post
  if (!postedBy) {
    return
  }

  let displayname = postedBy.firstname + ' ' + postedBy.lastname
  let timestamp = timeDifference(new Date(), new Date(post.createdAt))
  let retweetText = ''
  if (isRetweet) {
    retweetText = `<span>
                  <i class="fas fa-retweet"></i> Retweeted by
                  <a href="/profile/${retweetBy}">@${retweetBy}</a> 
                  </span>`
  }

  let replyFlag = ''
  if (post.replyTo) {
    if (!post.replyTo._id) {
      alertifyError(
        'Xin lỗi, bài viết không còn tồn tại (Reply by is not populated!)'
      )
      return
    }
    if (!post.replyTo.postedBy._id) {
      alertifyError(
        'Xin lỗi, bài viết không còn tồn tại (Posted by is not populated!)'
      )
      return
    }
    let replyToUsername = post.replyTo.postedBy.username
    replyFlag = ` <div class="reply_flag">
                  Replying to @<a class="displayName" href="/profile/${replyToUsername}">${replyToUsername}</a>
                </div>`
  }

  let buttons = ''
  let isDisabled = false
  let pinnedPostText = ''
  let dataTarget = '#confirmPinModal'
  if (userLoggedIn._id === postedBy._id) {
    let pinnedClass = ''
    if (post.pinned) {
      pinnedClass = 'active'
      dataTarget = '#unpinModal'
      pinnedPostText = `<i class="fas fa-thumbtack"></i> <span>Pinned post</span>`
    }
    buttons = `
        <button class="pin-button ${pinnedClass} button__open-modal--pin" data-bs-toggle="modal" data-bs-target="${dataTarget}" data-id="${post._id}">
          <i class="remove-pointer-events fas fa-thumbtack"></i>
        </button>
        <button class="button__open-modal--delete" data-bs-toggle="modal" data-bs-target="#deletePostModal" data-id="${post._id}">
          <i class="remove-pointer-events fas fa-times"></i>
        </button>
      `

    isDisabled = true
  }
  return `
      <div class="post" data-id="${post._id}">
      <div class="post__action-container">${retweetText}</div>
      <div class="post__main-content-container">
          <div class="user__image-container">
            <img src="/assets/images/users/profilePics/${
              postedBy.profilePic
            }" alt="User's profile picture" />
          </div>
          <div class="post__content-container">
            <div class="pinned-post__text">${pinnedPostText}</div>
            <div class="post__header">
              <a class="displayName" href="/profile/${
                postedBy.username
              }">${displayname}</a>
              <span class="username">@${postedBy.username}</span>
              <span class="date">${timestamp}</span>
              ${buttons}
            </div>
            ${replyFlag}
            <div class="post__body">
              <span>${post.content}</span>
            </div>
            <div class="post__footer">
              <div class="post__button-container">
                <div class="post__button-container__content">
                  <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
                    <i class="far fa-comment"></i>
                  </button>  
                </div>
              </div>
              <div class="post__button-container green">
                <div class="post__button-container__content ${
                  post.retweetUsers.includes(userLoggedIn._id) && 'active'
                } ${isDisabled && 'remove-pointer-events'} ">
                  <button class="retweet-button">
                    <i class="fas fa-retweet"></i>
                  </button>
                  <span class="number-retweets">${
                    post.retweetUsers.length || ''
                  }</span>
                </div>
              </div>
              <div class="post__button-container red">
                <div class="post__button-container__content ${
                  post.likes.includes(userLoggedIn._id) ? 'active' : ''
                }">
                  <button class="like-button">
                    <i class="far fa-heart"></i>
                  </button>  
                  <span class="number-likes">${post.likes.length || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
}

function clearInput(inputElement) {
  inputElement.value = ''
}

function outputPost(post, container) {
  const html = createPostHtml(post)
  container.insertAdjacentHTML('afterbegin', html)
}

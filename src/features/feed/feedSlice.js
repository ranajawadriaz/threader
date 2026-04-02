import { createSlice, nanoid } from '@reduxjs/toolkit'
import { initialPosts } from '../../data/mockData'

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: initialPosts,
  },
  reducers: {
    addPost: (state, action) => {
      const { authorId, author, username, avatarColor, content, image, topic } =
        action.payload

      const nextPost = {
        id: nanoid(),
        authorId,
        author,
        username,
        avatarColor: avatarColor || '#64748b',
        createdAt: 'now',
        topic: topic || '',
        content,
        image: image || '',
        likes: [],
        commentCount: 0,
        repostCount: 0,
        shareCount: 0,
      }

      state.posts.unshift(nextPost)
    },
    toggleLike: (state, action) => {
      const { postId, userId } = action.payload
      const post = state.posts.find((entry) => entry.id === postId)

      if (!post || !userId) {
        return
      }

      const alreadyLiked = post.likes.includes(userId)

      if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id !== userId)
      } else {
        post.likes.push(userId)
      }
    },
    bumpComment: (state, action) => {
      const post = state.posts.find((entry) => entry.id === action.payload)
      if (post) {
        post.commentCount += 1
      }
    },
    bumpRepost: (state, action) => {
      const post = state.posts.find((entry) => entry.id === action.payload)
      if (post) {
        post.repostCount += 1
      }
    },
    bumpShare: (state, action) => {
      const post = state.posts.find((entry) => entry.id === action.payload)
      if (post) {
        post.shareCount += 1
      }
    },
  },
})

export const { addPost, toggleLike, bumpComment, bumpRepost, bumpShare } =
  feedSlice.actions

export const selectPosts = (state) => state.feed.posts

export default feedSlice.reducer

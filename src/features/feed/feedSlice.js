import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

function upsertPost(posts, nextPost) {
  const index = posts.findIndex((post) => post.id === nextPost.id)

  if (index >= 0) {
    posts[index] = nextPost
    return
  }

  posts.unshift(nextPost)
}

function toErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (_, thunkApi) => {
  try {
    const response = await api.get('/threads')
    return response.threads
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: toErrorMessage(error, 'Unable to load the home feed.'),
    })
  }
})

export const addPost = createAsyncThunk('feed/addPost', async (payload, thunkApi) => {
  try {
    const response = await api.post('/threads', payload)
    return response.thread
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: toErrorMessage(error, 'Unable to publish your thread.'),
    })
  }
})

export const toggleLike = createAsyncThunk('feed/toggleLike', async ({ postId }, thunkApi) => {
  try {
    const response = await api.post(`/threads/${postId}/like`, {})
    return response.thread
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: toErrorMessage(error, 'Unable to update the like state.'),
    })
  }
})

export const bumpRepost = createAsyncThunk('feed/bumpRepost', async (postId, thunkApi) => {
  try {
    const response = await api.post(`/threads/${postId}/repost`, {})
    return response.thread
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: toErrorMessage(error, 'Unable to repost this thread.'),
    })
  }
})

export const bumpShare = createAsyncThunk('feed/bumpShare', async (postId, thunkApi) => {
  try {
    const response = await api.post(`/threads/${postId}/share`, {})
    return response.thread
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: toErrorMessage(error, 'Unable to share this thread.'),
    })
  }
})

export const fetchComments = createAsyncThunk(
  'feed/fetchComments',
  async (postId, thunkApi) => {
    try {
      const response = await api.get(`/threads/${postId}/comments`)
      return {
        postId,
        comments: response.comments,
      }
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load replies for this thread.'),
      })
    }
  },
)

export const bumpComment = createAsyncThunk(
  'feed/bumpComment',
  async ({ postId, content }, thunkApi) => {
    try {
      const response = await api.post(`/threads/${postId}/comments`, { content })
      return {
        postId,
        comment: response.comment,
        thread: response.thread,
      }
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to post your reply.'),
      })
    }
  },
)

export const deleteThread = createAsyncThunk(
  'feed/deleteThread',
  async (postId, thunkApi) => {
    try {
      await api.delete(`/threads/${postId}`)
      return postId
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to delete this thread.'),
      })
    }
  },
)

const initialState = {
  posts: [],
  commentsByPostId: {},
  status: 'idle',
  createStatus: 'idle',
  commentStatus: 'idle',
  error: null,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.posts = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Unable to load the home feed.'
      })
      .addCase(addPost.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(addPost.fulfilled, (state, action) => {
        upsertPost(state.posts, action.payload)
        state.createStatus = 'succeeded'
        state.error = null
      })
      .addCase(addPost.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload?.message || 'Unable to publish your thread.'
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        upsertPost(state.posts, action.payload)
      })
      .addCase(bumpRepost.fulfilled, (state, action) => {
        upsertPost(state.posts, action.payload)
      })
      .addCase(bumpShare.fulfilled, (state, action) => {
        upsertPost(state.posts, action.payload)
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsByPostId[action.payload.postId] = action.payload.comments
      })
      .addCase(bumpComment.pending, (state) => {
        state.commentStatus = 'loading'
        state.error = null
      })
      .addCase(bumpComment.fulfilled, (state, action) => {
        const currentComments = state.commentsByPostId[action.payload.postId] || []
        state.commentsByPostId[action.payload.postId] = [...currentComments, action.payload.comment]
        upsertPost(state.posts, action.payload.thread)
        state.commentStatus = 'succeeded'
        state.error = null
      })
      .addCase(bumpComment.rejected, (state, action) => {
        state.commentStatus = 'failed'
        state.error = action.payload?.message || 'Unable to post your reply.'
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload)
        delete state.commentsByPostId[action.payload]
      })
  },
})

export const selectPosts = (state) => state.feed.posts
export const selectFeedError = (state) => state.feed.error
export const selectFeedStatus = (state) => state.feed.status
export const selectCreatePostStatus = (state) => state.feed.createStatus
export const selectCommentStatus = (state) => state.feed.commentStatus
export const selectCommentsForPost = (state, postId) =>
  state.feed.commentsByPostId[postId] || []

export default feedSlice.reducer

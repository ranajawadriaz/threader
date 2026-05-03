import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'
import { setCurrentUser } from '../auth/authSlice'

function toErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

function upsertConversationToTop(conversations, nextConversation) {
  const existingIndex = conversations.findIndex((entry) => entry.id === nextConversation.id)

  if (existingIndex >= 0) {
    conversations.splice(existingIndex, 1)
  }

  conversations.unshift(nextConversation)
}

export const fetchSidebar = createAsyncThunk(
  'social/fetchSidebar',
  async (_, thunkApi) => {
    try {
      const response = await api.get('/meta/sidebar')
      return response
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load trending topics and suggestions.'),
      })
    }
  },
)

export const toggleFollow = createAsyncThunk(
  'social/toggleFollow',
  async (userId, thunkApi) => {
    try {
      const response = await api.post(`/users/${userId}/follow`, {})
      thunkApi.dispatch(setCurrentUser(response.currentUser))
      return response
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to update the follow state.'),
      })
    }
  },
)

export const fetchProfileBundle = createAsyncThunk(
  'social/fetchProfileBundle',
  async (username, thunkApi) => {
    try {
      const currentUser = thunkApi.getState().auth.currentUser
      const normalizedUsername = String(username || '').trim().toLowerCase().replace(/^@/, '')
      const isOwnProfile = !normalizedUsername || normalizedUsername === currentUser?.username
      const response = await api.get(
        isOwnProfile
          ? '/users/me/profile'
          : `/users/username/${normalizedUsername}/profile`,
      )

      if (isOwnProfile) {
        thunkApi.dispatch(setCurrentUser(response.user))
      }

      return {
        ...response,
        isOwnProfile,
      }
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load your profile right now.'),
      })
    }
  },
)

export const fetchConversations = createAsyncThunk(
  'social/fetchConversations',
  async ({ tab = 'inbox', q = '' } = {}, thunkApi) => {
    try {
      const query = new URLSearchParams({ tab, q })
      const response = await api.get(`/conversations?${query.toString()}`)
      return response.conversations
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load your conversations.'),
      })
    }
  },
)

export const fetchConversationMessages = createAsyncThunk(
  'social/fetchConversationMessages',
  async (conversationId, thunkApi) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`)
      return response
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load this conversation.'),
      })
    }
  },
)

export const createConversation = createAsyncThunk(
  'social/createConversation',
  async (payload, thunkApi) => {
    try {
      const response = await api.post('/conversations', payload)
      return response
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to start a new conversation.'),
      })
    }
  },
)

export const sendMessage = createAsyncThunk(
  'social/sendMessage',
  async ({ conversationId, content }, thunkApi) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { content })
      return {
        conversationId,
        ...response,
      }
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to send your message.'),
      })
    }
  },
)

export const acceptConversationRequest = createAsyncThunk(
  'social/acceptConversationRequest',
  async (conversationId, thunkApi) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/accept`, {})
      return response.conversation
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to accept this message request.'),
      })
    }
  },
)

export const ignoreConversationRequest = createAsyncThunk(
  'social/ignoreConversationRequest',
  async (conversationId, thunkApi) => {
    try {
      await api.post(`/conversations/${conversationId}/ignore`, {})
      return conversationId
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to ignore this message request.'),
      })
    }
  },
)

export const fetchNotifications = createAsyncThunk(
  'social/fetchNotifications',
  async (tab = 'all', thunkApi) => {
    try {
      const response = await api.get(`/notifications?tab=${tab}`)
      return response.items
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to load your activity right now.'),
      })
    }
  },
)

const initialState = {
  trends: [],
  suggestions: [],
  sidebarStatus: 'idle',
  conversations: [],
  conversationsStatus: 'idle',
  activeConversationId: null,
  activeMessagesStatus: 'idle',
  sendingMessageByConversationId: {},
  messagesByConversationId: {},
  notifications: [],
  notificationsStatus: 'idle',
  profile: {
    user: null,
    isOwnProfile: true,
    threads: [],
    replies: [],
    media: [],
    reposts: [],
  },
  profileStatus: 'idle',
  error: null,
}

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload
    },
    dropConversationMessage: (state, action) => {
      const { conversationId, messageId } = action.payload

      state.messagesByConversationId[conversationId] = (
        state.messagesByConversationId[conversationId] || []
      ).filter((message) => message.id !== messageId)
    },
    dismissNotification: (state, action) => {
      state.notifications = state.notifications.filter((item) => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSidebar.pending, (state) => {
        state.sidebarStatus = 'loading'
      })
      .addCase(fetchSidebar.fulfilled, (state, action) => {
        state.trends = action.payload.trends
        state.suggestions = action.payload.suggestions
        state.sidebarStatus = 'succeeded'
        state.error = null
      })
      .addCase(fetchSidebar.rejected, (state, action) => {
        state.sidebarStatus = 'failed'
        state.error = action.payload?.message || 'Unable to load sidebar data.'
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.suggestions = state.suggestions.map((suggestion) =>
          suggestion.id === action.payload.profile.id
            ? { ...suggestion, isFollowing: action.payload.isFollowing }
            : suggestion,
        )
      })
      .addCase(fetchProfileBundle.pending, (state) => {
        state.profileStatus = 'loading'
      })
      .addCase(fetchProfileBundle.fulfilled, (state, action) => {
        state.profile = {
          user: action.payload.user,
          isOwnProfile: action.payload.isOwnProfile,
          threads: action.payload.threads,
          replies: action.payload.replies,
          media: action.payload.media,
          reposts: action.payload.reposts,
        }
        state.profileStatus = 'succeeded'
        state.error = null
      })
      .addCase(fetchProfileBundle.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.error = action.payload?.message || 'Unable to load your profile.'
      })
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = 'loading'
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload
        state.conversationsStatus = 'succeeded'
        state.error = null
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = 'failed'
        state.error = action.payload?.message || 'Unable to load your conversations.'
      })
      .addCase(fetchConversationMessages.pending, (state, action) => {
        state.activeConversationId = action.meta.arg
        state.activeMessagesStatus = 'loading'
        state.error = null
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        const { conversation, messages } = action.payload
        state.activeConversationId = conversation.id
        state.messagesByConversationId[conversation.id] = messages
        upsertConversationToTop(state.conversations, conversation)
        state.activeMessagesStatus = 'succeeded'
        state.error = null
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.activeMessagesStatus = 'failed'
        state.error = action.payload?.message || 'Unable to load this conversation.'
      })
      .addCase(createConversation.pending, (state) => {
        state.error = null
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        const { conversation, message } = action.payload
        upsertConversationToTop(state.conversations, conversation)

        state.activeConversationId = conversation.id
        state.messagesByConversationId[conversation.id] = message ? [message] : []
        state.activeMessagesStatus = 'succeeded'
        state.error = null
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload?.message || 'Unable to start a new conversation.'
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, optimisticMessage } = action.meta.arg
        state.sendingMessageByConversationId[conversationId] = true
        state.error = null

        if (optimisticMessage) {
          const currentMessages = state.messagesByConversationId[conversationId] || []
          state.messagesByConversationId[conversationId] = [...currentMessages, optimisticMessage]
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, conversation, message } = action.payload
        const optimisticMessageId = action.meta.arg.optimisticMessage?.id
        const currentMessages = (state.messagesByConversationId[conversationId] || []).filter(
          (entry) => entry.id !== optimisticMessageId,
        )
        state.messagesByConversationId[conversationId] = [...currentMessages, message]
        upsertConversationToTop(state.conversations, conversation)
        delete state.sendingMessageByConversationId[conversationId]
        state.error = null
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { conversationId, optimisticMessage } = action.meta.arg
        const errorMessage = action.payload?.message || 'Unable to send your message.'

        if (optimisticMessage) {
          state.messagesByConversationId[conversationId] = (
            state.messagesByConversationId[conversationId] || []
          ).map((entry) =>
            entry.id === optimisticMessage.id
              ? {
                  ...entry,
                  pending: false,
                  failed: true,
                  time: 'Not sent',
                  errorMessage,
                }
              : entry,
          )
        }

        delete state.sendingMessageByConversationId[conversationId]
        state.error = errorMessage
      })
      .addCase(acceptConversationRequest.fulfilled, (state, action) => {
        upsertConversationToTop(state.conversations, action.payload)
        state.error = null
      })
      .addCase(ignoreConversationRequest.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter((entry) => entry.id !== action.payload)
        delete state.messagesByConversationId[action.payload]
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = null
        }
        state.error = null
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsStatus = 'loading'
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload
        state.notificationsStatus = 'succeeded'
        state.error = null
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsStatus = 'failed'
        state.error = action.payload?.message || 'Unable to load your activity.'
      })
  },
})

export const { dismissNotification, dropConversationMessage, setActiveConversationId } = socialSlice.actions

export const selectSidebarTrends = (state) => state.social.trends
export const selectSidebarSuggestions = (state) => state.social.suggestions
export const selectSidebarStatus = (state) => state.social.sidebarStatus
export const selectProfileBundle = (state) => state.social.profile
export const selectProfileStatus = (state) => state.social.profileStatus
export const selectConversations = (state) => state.social.conversations
export const selectConversationsStatus = (state) => state.social.conversationsStatus
export const selectActiveConversationId = (state) => state.social.activeConversationId
export const selectActiveMessagesStatus = (state) => state.social.activeMessagesStatus
export const selectMessagesForConversation = (state, conversationId) =>
  state.social.messagesByConversationId[conversationId] || []
export const selectIsSendingMessage = (state, conversationId) =>
  Boolean(state.social.sendingMessageByConversationId[conversationId])
export const selectSocialError = (state) => state.social.error
export const selectNotifications = (state) => state.social.notifications
export const selectNotificationsStatus = (state) => state.social.notificationsStatus

export default socialSlice.reducer
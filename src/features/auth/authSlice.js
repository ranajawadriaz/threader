import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

function toErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

export const hydrateSession = createAsyncThunk(
  'auth/hydrateSession',
  async (_, thunkApi) => {
    try {
      const response = await api.get('/auth/me')
      return response.user
    } catch (error) {
      if (error.status === 401) {
        return thunkApi.rejectWithValue({ silent: true })
      }

      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to restore your session.'),
      })
    }
  },
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkApi) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.user
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(
          error,
          'Incorrect credentials. Try username/email and password again.',
        ),
      })
    }
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (form, thunkApi) => {
    try {
      const response = await api.post('/auth/register', form)
      return response.user
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to create your account right now.'),
      })
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout', {})
})

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, thunkApi) => {
    try {
      const response = await api.patch('/users/me', payload)
      return response.user
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: toErrorMessage(error, 'Unable to update your profile right now.'),
      })
    }
  },
)

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
      state.isAuthenticated = Boolean(action.payload)
      state.isInitialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.isInitialized = true
        state.isLoading = false
        state.error = null
      })
      .addCase(hydrateSession.rejected, (state, action) => {
        state.currentUser = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.isLoading = false
        state.error = action.payload?.silent ? null : action.payload?.message || null
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.isInitialized = true
        state.isLoading = false
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Unable to log in.'
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.isInitialized = true
        state.isLoading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Unable to create your account.'
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.isLoading = false
        state.error = null
      })
      .addCase(logout.rejected, (state) => {
        state.currentUser = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.isLoading = false
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Unable to update your profile.'
      })
  },
})

export const { clearAuthError, setCurrentUser } = authSlice.actions

export const selectAuthError = (state) => state.auth.error
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthInitialized = (state) => state.auth.isInitialized
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectCurrentUser = (state) => state.auth.currentUser

export default authSlice.reducer

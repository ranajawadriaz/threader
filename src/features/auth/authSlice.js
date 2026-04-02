import { createSlice, nanoid } from '@reduxjs/toolkit'

const AUTH_STORAGE_KEY = 'threader_auth_state'

const seedUsers = [
  {
    id: 'u1',
    fullName: 'Rana Jawad Riaz',
    username: 'rana_jawad_riaz',
    email: 'rana@threader.app',
    password: '12345678',
    bio: 'Building Threader in public.',
    privateAccount: false,
    avatarColor: '#8892a6',
  },
]

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue)

    if (!parsed || !Array.isArray(parsed.users)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

const persistAuth = (state) => {
  if (typeof window === 'undefined') {
    return
  }

  const dataToPersist = {
    users: state.users,
    currentUserId: state.currentUserId,
    isAuthenticated: state.isAuthenticated,
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(dataToPersist))
}

const storedAuth = readStoredAuth()

const initialState = {
  users: storedAuth?.users?.length ? storedAuth.users : seedUsers,
  currentUserId: storedAuth?.currentUserId ?? null,
  isAuthenticated: storedAuth?.isAuthenticated ?? false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const identity = action.payload?.identity?.trim().toLowerCase()
      const password = action.payload?.password ?? ''

      const user = state.users.find(
        (entry) =>
          entry.username.toLowerCase() === identity ||
          entry.email.toLowerCase() === identity,
      )

      if (!user || user.password !== password) {
        state.error = 'Incorrect credentials. Try username/email and password again.'
        return
      }

      state.error = null
      state.currentUserId = user.id
      state.isAuthenticated = true
      persistAuth(state)
    },
    register: (state, action) => {
      const fullName = action.payload?.fullName?.trim() ?? ''
      const username = action.payload?.username?.trim() ?? ''
      const email = action.payload?.email?.trim() ?? ''
      const password = action.payload?.password ?? ''
      const privateAccount = Boolean(action.payload?.privateAccount)

      if (!fullName || !username || !email || !password) {
        state.error = 'Please fill all required fields.'
        return
      }

      const normalizedUsername = username.toLowerCase()
      const normalizedEmail = email.toLowerCase()

      const hasUsername = state.users.some(
        (entry) => entry.username.toLowerCase() === normalizedUsername,
      )
      if (hasUsername) {
        state.error = 'Username already exists. Choose another one.'
        return
      }

      const hasEmail = state.users.some(
        (entry) => entry.email.toLowerCase() === normalizedEmail,
      )
      if (hasEmail) {
        state.error = 'Email already exists. Use another email.'
        return
      }

      const createdUser = {
        id: nanoid(),
        fullName,
        username,
        email,
        password,
        privateAccount,
        bio: 'New to Threader. Say hello.',
        avatarColor: '#64748b',
      }

      state.users.unshift(createdUser)
      state.currentUserId = createdUser.id
      state.isAuthenticated = true
      state.error = null
      persistAuth(state)
    },
    logout: (state) => {
      state.currentUserId = null
      state.isAuthenticated = false
      state.error = null
      persistAuth(state)
    },
    updateProfile: (state, action) => {
      const user = state.users.find((entry) => entry.id === state.currentUserId)

      if (!user) {
        return
      }

      const { fullName, bio, privateAccount } = action.payload

      if (typeof fullName === 'string' && fullName.trim()) {
        user.fullName = fullName.trim()
      }

      if (typeof bio === 'string') {
        user.bio = bio.trim()
      }

      if (typeof privateAccount === 'boolean') {
        user.privateAccount = privateAccount
      }

      persistAuth(state)
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
})

export const { login, register, logout, updateProfile, clearAuthError } =
  authSlice.actions

export const selectAuthError = (state) => state.auth.error
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) =>
  state.auth.users.find((entry) => entry.id === state.auth.currentUserId) ?? null

export default authSlice.reducer

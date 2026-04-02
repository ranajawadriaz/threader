import { createSlice } from '@reduxjs/toolkit'

const THEME_STORAGE_KEY = 'threader_theme_mode'

const readStoredMode = () => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const mode = window.localStorage.getItem(THEME_STORAGE_KEY)
  return mode === 'light' ? 'light' : 'dark'
}

const persistMode = (mode) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mode: readStoredMode(),
    isAgentOpen: false,
    isMobileNavHidden: false,
  },
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      persistMode(state.mode)
    },
    setMode: (state, action) => {
      state.mode = action.payload === 'light' ? 'light' : 'dark'
      persistMode(state.mode)
    },
    toggleAgent: (state) => {
      state.isAgentOpen = !state.isAgentOpen
    },
    closeAgent: (state) => {
      state.isAgentOpen = false
    },
    setMobileNavHidden: (state, action) => {
      state.isMobileNavHidden = Boolean(action.payload)
    },
  },
})

export const {
  toggleMode,
  setMode,
  toggleAgent,
  closeAgent,
  setMobileNavHidden,
} = uiSlice.actions

export const selectThemeMode = (state) => state.ui.mode
export const selectAgentOpen = (state) => state.ui.isAgentOpen
export const selectMobileNavHidden = (state) => state.ui.isMobileNavHidden

export default uiSlice.reducer

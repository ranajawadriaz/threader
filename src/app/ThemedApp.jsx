import { useEffect, useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import App from '../App'
import { hydrateSession } from '../features/auth/authSlice'
import { selectThemeMode } from '../features/ui/uiSlice'
import { buildThreaderTheme } from '../theme/threaderTheme'

function ThemedApp() {
  const dispatch = useDispatch()
  const mode = useSelector(selectThemeMode)
  const theme = useMemo(() => buildThreaderTheme(mode), [mode])

  useEffect(() => {
    dispatch(hydrateSession())
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

export default ThemedApp

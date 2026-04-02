import { useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useSelector } from 'react-redux'
import App from '../App'
import { selectThemeMode } from '../features/ui/uiSlice'
import { buildThreaderTheme } from '../theme/threaderTheme'

function ThemedApp() {
  const mode = useSelector(selectThemeMode)
  const theme = useMemo(() => buildThreaderTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

export default ThemedApp

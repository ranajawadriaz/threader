import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAuthError,
  login,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
} from '../../features/auth/authSlice'
import BrandMark from '../../components/layout/BrandMark'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authError = useSelector(selectAuthError)
  const authLoading = useSelector(selectAuthLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [credentials, setCredentials] = useState({
    identity: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(
    () => () => {
      dispatch(clearAuthError())
    },
    [dispatch],
  )

  const onChange = (event) => {
    const { name, value } = event.target

    setCredentials((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (authError) {
      dispatch(clearAuthError())
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()

    if (authLoading) {
      return
    }

    dispatch(login(credentials))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2.3}>
          <BrandMark />

          <Box>
            <Typography variant="h4" sx={{ mb: 0.7 }}>
              Welcome back
            </Typography>
            <Typography color="text.secondary">
              Log in with your username or email and keep your threads moving.
            </Typography>
          </Box>

          {authError ? <Alert severity="error">{authError}</Alert> : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.5}>
              <TextField
                required
                name="identity"
                value={credentials.identity}
                onChange={onChange}
                label="Username or email"
                autoComplete="username"
                disabled={authLoading}
              />
              <TextField
                required
                name="password"
                value={credentials.password}
                onChange={onChange}
                label="Password"
                type="password"
                autoComplete="current-password"
                disabled={authLoading}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={authLoading}
                startIcon={
                  authLoading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />
                }
              >
                {authLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </Stack>
          </Box>

          <Typography color="text.secondary">
            New to Threader?{' '}
            <Typography
              component={RouterLink}
              to="/register"
              sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 700 }}
            >
              Create account
            </Typography>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default LoginPage

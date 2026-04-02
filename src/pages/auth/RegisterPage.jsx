import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAuthError,
  register,
  selectAuthError,
  selectIsAuthenticated,
} from '../../features/auth/authSlice'
import BrandMark from '../../components/layout/BrandMark'

function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    privateAccount: false,
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

  const onTextChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (authError) {
      dispatch(clearAuthError())
    }
  }

  const onPrivacyChange = (event) => {
    setForm((previous) => ({
      ...previous,
      privateAccount: event.target.checked,
    }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    dispatch(register(form))
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
          maxWidth: 560,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2.1}>
          <BrandMark />

          <Box>
            <Typography variant="h4" sx={{ mb: 0.7 }}>
              Create account
            </Typography>
            <Typography color="text.secondary">
              Join Threader with your identity and start posting instantly.
            </Typography>
          </Box>

          {authError ? <Alert severity="error">{authError}</Alert> : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.4}>
              <TextField
                required
                name="fullName"
                value={form.fullName}
                onChange={onTextChange}
                label="Full name"
              />
              <TextField
                required
                name="username"
                value={form.username}
                onChange={onTextChange}
                label="Username"
              />
              <TextField
                required
                name="email"
                value={form.email}
                onChange={onTextChange}
                label="Email"
                type="email"
              />
              <TextField
                required
                name="password"
                value={form.password}
                onChange={onTextChange}
                label="Password"
                type="password"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.privateAccount}
                    onChange={onPrivacyChange}
                    color="secondary"
                  />
                }
                label="Private account"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<PersonAddRoundedIcon />}
              >
                Register
              </Button>
            </Stack>
          </Box>

          <Typography color="text.secondary">
            Already have an account?{' '}
            <Typography
              component={RouterLink}
              to="/login"
              sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 700 }}
            >
              Log in
            </Typography>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default RegisterPage

import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser, updateProfile } from '../features/auth/authSlice'
import { selectThemeMode, toggleMode } from '../features/ui/uiSlice'

const settingRows = [
  { label: 'Follow and invite friends', icon: <GroupAddRoundedIcon /> },
  { label: 'Notifications', icon: <NotificationsNoneRoundedIcon /> },
  { label: 'Saved', icon: <BookmarkBorderRoundedIcon /> },
  { label: 'Liked', icon: <FavoriteBorderRoundedIcon /> },
  { label: 'Archive', icon: <ArchiveRoundedIcon /> },
  { label: 'Privacy', icon: <LockOutlinedIcon /> },
  { label: 'Content preferences', icon: <AutoFixHighRoundedIcon /> },
  { label: 'Accessibility', icon: <AccessibilityNewRoundedIcon /> },
  { label: 'Account status', icon: <VerifiedUserRoundedIcon /> },
  { label: 'Account', icon: <PersonOutlineRoundedIcon /> },
  { label: 'Language', icon: <LanguageRoundedIcon /> },
]

function SettingsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const mode = useSelector(selectThemeMode)
  const currentUser = useSelector(selectCurrentUser)
  const [notice, setNotice] = useState('')
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'English'
    }

    return window.localStorage.getItem('threader_language') || 'English'
  })

  const updateNotice = (message) => {
    setNotice(message)
  }

  const onSettingClick = (label) => {
    switch (label) {
      case 'Follow and invite friends':
        navigate('/messages')
        return
      case 'Notifications':
        navigate('/activity')
        return
      case 'Privacy':
        setIsPrivacyOpen(true)
        return
      case 'Language':
        setIsLanguageOpen(true)
        return
      case 'Account':
        navigate('/profile')
        return
      case 'Saved':
        updateNotice('Saved threads will appear here after backend integration.')
        return
      case 'Liked':
        updateNotice('Liked threads view is ready for backend integration.')
        return
      case 'Archive':
        updateNotice('Archive is available once backend storage is connected.')
        return
      case 'Content preferences':
        updateNotice('Content preferences will be configurable in the next iteration.')
        return
      case 'Accessibility':
        updateNotice('Accessibility controls will be expanded in the next iteration.')
        return
      case 'Account status':
        updateNotice('Your account is currently in good standing.')
        return
      default:
        updateNotice(`${label} opened`)
    }
  }

  const onPrivacyChange = (isPrivate) => {
    dispatch(updateProfile({ privateAccount: isPrivate }))
    updateNotice(isPrivate ? 'Private account enabled' : 'Public account enabled')
  }

  const onLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('threader_language', nextLanguage)
    }

    setIsLanguageOpen(false)
    updateNotice(`Language changed to ${nextLanguage}`)
  }

  const onLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.2, sm: 2 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: { xs: 38, sm: 48 }, lineHeight: 1 }}>
          Settings
        </Typography>
      </Stack>

      <Stack spacing={0.4}>
        {settingRows.map((item) => (
          <Button
            key={item.label}
            fullWidth
            variant="text"
            onClick={() => onSettingClick(item.label)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.4,
              justifyContent: 'flex-start',
              py: 1.2,
              px: 1,
              borderRadius: 2,
              color: 'text.primary',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {item.icon}
            <Typography sx={{ flex: 1, textAlign: 'left' }}>{item.label}</Typography>
          </Button>
        ))}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <FormControlLabel
        control={<Switch checked={mode === 'dark'} onChange={() => dispatch(toggleMode())} />}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            {mode === 'dark' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
            <Typography>{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Typography>
          </Stack>
        }
      />

      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutRoundedIcon />}
        onClick={onLogout}
        sx={{ mt: 1.5 }}
      >
        Log out
      </Button>

      <Dialog open={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Privacy</DialogTitle>
        <DialogContent>
          <FormControlLabel
            sx={{ mt: 0.6, alignItems: 'flex-start', m: 0 }}
            control={
              <Switch
                checked={Boolean(currentUser?.privateAccount)}
                onChange={(event) => onPrivacyChange(event.target.checked)}
              />
            }
            label={
              <Stack spacing={0.2}>
                <Typography fontWeight={700}>Private account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Only approved followers can interact with your posts.
                </Typography>
              </Stack>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPrivacyOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Choose language</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ mt: 0.5 }}>
            {['English', 'Urdu', 'Spanish', 'Arabic'].map((option) => (
              <Button
                key={option}
                variant={language === option ? 'contained' : 'outlined'}
                onClick={() => onLanguageSelect(option)}
              >
                {option}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLanguageOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2500}
        onClose={() => setNotice('')}
        message={notice}
      />
    </Paper>
  )
}

export default SettingsPage

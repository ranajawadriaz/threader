import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
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
import { logout } from '../features/auth/authSlice'
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
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.4,
              py: 1.2,
              px: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.03)',
              },
            }}
          >
            {item.icon}
            <Typography sx={{ flex: 1 }}>{item.label}</Typography>
          </Box>
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
    </Paper>
  )
}

export default SettingsPage

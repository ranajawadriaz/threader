import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import BrandMark from './BrandMark'
import AgentFab from '../agent/AgentFab'
import { suggestedProfiles, trends } from '../../data/mockData'

const navItems = [
  { label: 'Home', path: '/home', icon: <HomeRoundedIcon /> },
  { label: 'Messages', path: '/messages', icon: <SendRoundedIcon /> },
  { label: 'Post', path: '/create', icon: <AddRoundedIcon /> },
  { label: 'Activity', path: '/activity', icon: <FavoriteRoundedIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonRoundedIcon /> },
]

function RightPanel() {
  return (
    <Stack spacing={2.2} sx={{ position: 'sticky', top: 20 }}>
      <Paper
        elevation={0}
        sx={{ p: 2.2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <TrendingUpRoundedIcon fontSize="small" />
          <Typography variant="h6" fontSize={18}>
            Trending now
          </Typography>
        </Stack>
        <Stack spacing={1.3}>
          {trends.map((trend) => (
            <Box key={trend.id}>
              <Typography fontWeight={600}>{trend.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {trend.volume}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2.2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Typography variant="h6" fontSize={18} sx={{ mb: 1.4 }}>
          Suggested for you
        </Typography>
        <List disablePadding>
          {suggestedProfiles.map((profile) => (
            <ListItem key={profile.id} disablePadding sx={{ mb: 1.2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: '100%' }}>
                <Avatar sx={{ bgcolor: profile.color, width: 34, height: 34 }}>
                  {profile.name.slice(0, 1).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap fontWeight={700} fontSize={14}>
                    {profile.name}
                  </Typography>
                  <Typography noWrap variant="caption" color="text.secondary">
                    {profile.handle}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined">
                  Follow
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Stack>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [hideMobileNav, setHideMobileNav] = useState(false)
  const allowNavAutoHide = location.pathname === '/home'

  const navigateTo = (path) => {
    setHideMobileNav(false)
    navigate(path)
  }

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const scrollingDown = currentY > lastY
      const nextHidden = scrollingDown && currentY > 140

      setHideMobileNav(nextHidden)
      lastY = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navValue = useMemo(() => {
    const matching = navItems.find((item) => item.path === location.pathname)
    return matching ? matching.path : false
  }, [location.pathname])

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        sx={{
          maxWidth: 1480,
          mx: 'auto',
          px: { xs: 0.8, sm: 2, md: 3 },
          display: 'flex',
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          component="aside"
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: 260,
            minHeight: '100vh',
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            flexDirection: 'column',
            gap: 1,
            bgcolor: 'background.paper',
          }}
        >
          <BrandMark />
          <Divider sx={{ my: 1.2 }} />
          <List disablePadding>
            {navItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigateTo(item.path)}
                    selected={active}
                    sx={{
                      borderRadius: 3,
                      mb: 0.4,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(0, 212, 184, 0.14)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>

          <Box sx={{ mt: 'auto', p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Use the AI button to draft posts, summarize threads, and automate routine actions.
            </Typography>
          </Box>
        </Paper>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: { xs: '100%', lg: 760 },
            pb: { xs: 11, md: 3 },
            pt: { xs: 1, sm: 1.4, md: 2 },
          }}
        >
          <Outlet />
        </Box>

        <Box component="aside" sx={{ display: { xs: 'none', lg: 'block' }, width: 330, pt: 2 }}>
          <RightPanel />
        </Box>
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 10,
          right: 10,
          bottom: 8,
          display: { xs: 'block', md: 'none' },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.96),
          color: 'text.primary',
          transform:
            allowNavAutoHide && hideMobileNav
              ? 'translateY(130px)'
              : 'translateY(0)',
          transition: 'transform 220ms ease',
          zIndex: 1300,
          overflow: 'hidden',
        }}
      >
        <BottomNavigation
          value={navValue}
          showLabels
          onChange={(_, next) => navigateTo(next)}
          sx={{ bgcolor: 'transparent' }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={
                item.path === '/activity' ? (
                  <Badge color="error" variant="dot">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
            />
          ))}
        </BottomNavigation>
      </Paper>

      {allowNavAutoHide && hideMobileNav && location.pathname !== '/create' ? (
        <Fab
          color="primary"
          onClick={() => navigateTo('/create')}
          sx={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 22,
            display: { xs: 'inline-flex', md: 'none' },
            zIndex: 1301,
            bgcolor: 'primary.main',
            color: 'background.default',
          }}
        >
          <AddRoundedIcon />
        </Fab>
      ) : null}

      <AgentFab />
    </Box>
  )
}

export default AppShell

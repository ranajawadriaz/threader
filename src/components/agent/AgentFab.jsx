import {
  Box,
  Button,
  Drawer,
  Fab,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { alpha, useTheme } from '@mui/material/styles'
import { closeAgent, selectAgentOpen, toggleAgent } from '../../features/ui/uiSlice'

const quickActions = [
  {
    title: 'Create a thread',
    subtitle: 'Generate or refine a draft from one sentence.',
  },
  {
    title: 'Polish this image',
    subtitle: 'Pick upload, camera, or AI-generated image.',
  },
  {
    title: 'Message a friend',
    subtitle: 'Draft a direct message in your writing style.',
  },
]

function AgentFab() {
  const dispatch = useDispatch()
  const open = useSelector(selectAgentOpen)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <>
      <Fab
        color="secondary"
        aria-label="open-threader-agent"
        onClick={() => dispatch(toggleAgent())}
        sx={{
          position: 'fixed',
          right: 22,
          bottom: { xs: 90, md: 30 },
          zIndex: 1350,
          color: 'secondary.contrastText',
          boxShadow: (currentTheme) =>
            currentTheme.palette.mode === 'dark'
              ? '0 16px 28px rgba(0, 212, 184, 0.35)'
              : '0 14px 24px rgba(10, 143, 125, 0.28)',
        }}
      >
        <SmartToyOutlinedIcon />
      </Fab>

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={() => dispatch(closeAgent())}
      >
        <Box
          sx={{
            width: { xs: '100vw', sm: 450 },
            minHeight: { xs: 420, md: '100%' },
            p: 3,
            color: 'text.primary',
            background: (currentTheme) =>
              currentTheme.palette.mode === 'dark'
                ? 'linear-gradient(170deg, rgba(7,10,15,0.98), rgba(16,22,31,0.97))'
                : 'linear-gradient(170deg, rgba(255,255,255,0.98), rgba(239,244,251,0.96))',
          }}
        >
          <Stack spacing={0.8}>
            <Typography variant="h5" fontWeight={800}>
              Threader Agent
            </Typography>
            <Typography color="text.secondary">
              Chat-first control for posting, messaging, and app actions.
            </Typography>
          </Stack>

          <List sx={{ mt: 3, mb: 2 }}>
            {quickActions.map((item) => (
              <ListItem
                key={item.title}
                sx={{
                  mb: 1,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (currentTheme) =>
                    alpha(
                      currentTheme.palette.background.paper,
                      currentTheme.palette.mode === 'dark' ? 0.2 : 0.82,
                    ),
                }}
              >
                <ListItemText primary={item.title} secondary={item.subtitle} />
              </ListItem>
            ))}
          </List>

          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" startIcon={<AutoAwesomeRoundedIcon />}>
              Start chat
            </Button>
            <Button variant="outlined" onClick={() => dispatch(closeAgent())}>
              Later
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}

export default AgentFab

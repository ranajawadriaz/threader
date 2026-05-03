import { useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Fab,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import { API_BASE_URL } from '../../lib/api'
import { hydrateSession } from '../../features/auth/authSlice'
import { fetchFeed } from '../../features/feed/feedSlice'
import {
  fetchConversations,
  fetchNotifications,
  fetchProfileBundle,
  fetchSidebar,
} from '../../features/social/socialSlice'
import { closeAgent, selectAgentOpen, toggleAgent } from '../../features/ui/uiSlice'

const quickActions = [
  'Create a thread about shipping a design system tonight',
  'Message mara_codes about a weekend collab',
  'Comment on the first 3 home posts with related replies',
  'Update my profile picture with an AI-generated neon portrait',
]

function summarizeResults(result) {
  if (!Array.isArray(result?.results) || !result.results.length) {
    return result?.summary || 'Done.'
  }

  return result.results
    .map((entry) => {
      if (entry.type === 'create_thread') {
        return 'Published a new thread.'
      }

      if (entry.type === 'send_message') {
        return `Sent a message to @${entry.conversation.username}.`
      }

      if (entry.type === 'comment_threads') {
        return `Posted ${entry.comments.length} related comments.`
      }

      if (entry.type === 'update_profile') {
        return 'Updated your profile.'
      }

      if (entry.type === 'update_profile_image_ai') {
        return 'Updated your profile picture.'
      }

      if (entry.type === 'delete_threads') {
        return `Deleted ${entry.deletedThreadIds.length} thread(s).`
      }

      if (entry.type === 'follow_user') {
        return entry.alreadyFollowing
          ? `You were already following @${entry.username}.`
          : `Followed @${entry.username}.`
      }

      return result.summary || 'Done.'
    })
    .join(' ')
}

function AgentFab() {
  const dispatch = useDispatch()
  const open = useSelector(selectAgentOpen)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const inputRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [statusText, setStatusText] = useState('Ready')
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Tell me what you want to do in Threader. I can create threads, send messages, comment on recent posts, update your profile, and generate AI images when you explicitly ask for them.',
    },
  ])

  const panelWidth = useMemo(() => ({ xs: '100vw', sm: 460 }), [])
  const isMessagesRoute = location.pathname.startsWith('/messages')
  const fabBottom = { xs: 112, md: 30 }

  const refreshApplicationData = () => {
    dispatch(hydrateSession())
    dispatch(fetchFeed())
    dispatch(fetchSidebar())
    dispatch(fetchProfileBundle())
    dispatch(fetchNotifications('all'))
    dispatch(fetchConversations({ tab: 'inbox', q: '' }))
  }

  const handleEvent = (event) => {
    if (event.type === 'status') {
      setStatusText(event.message)
      setSteps((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${previous.length}`,
          label: event.label,
          status: event.status,
        },
      ])
      return
    }

    if (event.type === 'complete') {
      setStatusText('Completed')
      setMessages((previous) => [
        ...previous,
        {
          id: `complete-${Date.now()}`,
          role: 'assistant',
          text: summarizeResults(event.result),
        },
      ])
      setIsRunning(false)
      refreshApplicationData()
      return
    }

    if (event.type === 'error') {
      setStatusText('Failed')
      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: event.message || 'The agent could not complete that request.',
        },
      ])
      setIsRunning(false)
    }
  }

  const onSubmit = async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt || isRunning) {
      return
    }

    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmedPrompt,
      },
    ])
    setPrompt('')
    setSteps([])
    setStatusText('Connecting')
    setIsRunning(true)

    try {
      const response = await fetch(`${API_BASE_URL}/agent/execute`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Unable to start the Threader Agent right now.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) {
            continue
          }

          handleEvent(JSON.parse(line))
        }
      }
    } catch (error) {
      handleEvent({
        type: 'error',
        message: error.message,
      })
    }
  }

  return (
    <>
      {isMessagesRoute ? null : (
        <Fab
          color="secondary"
          aria-label="open-threader-agent"
          onClick={() => dispatch(toggleAgent())}
          sx={{
            position: 'fixed',
            right: 22,
            bottom: fabBottom,
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
      )}

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={() => dispatch(closeAgent())}
      >
        <Box
          sx={{
            width: panelWidth,
            minHeight: { xs: 520, md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
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
              Chat-first control for posting, messaging, profile updates, and other app actions.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={isRunning ? statusText || 'Working' : statusText}
              color={isRunning ? 'secondary' : 'default'}
            />
            <Button size="small" variant="outlined" onClick={refreshApplicationData}>
              Refresh app data
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {quickActions.map((action) => (
              <Button
                key={action}
                size="small"
                variant="outlined"
                onClick={() => {
                  setPrompt(action)
                  inputRef.current?.focus()
                }}
              >
                {action}
              </Button>
            ))}
          </Stack>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 260,
              p: 1.4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (currentTheme) =>
                alpha(
                  currentTheme.palette.background.paper,
                  currentTheme.palette.mode === 'dark' ? 0.18 : 0.82,
                ),
              overflowY: 'auto',
            }}
          >
            <Stack spacing={1.2}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    px: 1.2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'secondary.main' : 'action.hover',
                    color: message.role === 'user' ? 'secondary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-line' }}>{message.text}</Typography>
                </Box>
              ))}

              {steps.length ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <Typography fontWeight={700} sx={{ mb: 0.8 }}>
                    Live steps
                  </Typography>
                  <Stack spacing={0.7}>
                    {steps.map((step) => (
                      <Stack key={step.id} direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          {step.status === 'completed' ? (
                            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 16 }} />
                          ) : (
                            <CircularProgress size={14} thickness={5} color="secondary" />
                          )}
                        </Box>
                        <Chip
                          size="small"
                          color={step.status === 'completed' ? 'success' : 'secondary'}
                          label={step.status === 'completed' ? 'done' : 'working'}
                        />
                        <Typography variant="body2">{step.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          </Paper>

          <TextField
            inputRef={inputRef}
            multiline
            maxRows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask Threader Agent to do something in the app"
          />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={
                isRunning ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />
              }
              onClick={onSubmit}
              disabled={isRunning || !prompt.trim()}
            >
              {isRunning ? 'Working...' : 'Run'}
            </Button>
            <Button variant="outlined" startIcon={<AutoAwesomeRoundedIcon />} onClick={() => inputRef.current?.focus()}>
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

import { useMemo, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded'
import { conversations } from '../data/mockData'

function MessagesPage() {
  const [tab, setTab] = useState('inbox')
  const [query, setQuery] = useState('')

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return conversations
      .filter((entry) => (tab === 'requests' ? entry.request : !entry.request))
      .filter((entry) => {
        if (!normalized) {
          return true
        }

        return (
          entry.name.toLowerCase().includes(normalized) ||
          entry.username.toLowerCase().includes(normalized)
        )
      })
  }, [query, tab])

  return (
    <Stack spacing={1.4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" sx={{ fontSize: { xs: 38, sm: 52 }, lineHeight: 1 }}>
              Messages
            </Typography>
            <NotificationsOffRoundedIcon sx={{ color: 'text.secondary' }} />
          </Stack>

          <IconButton aria-label="new-message">
            <EditNoteRoundedIcon />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          sx={{ mt: 1.4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mt: 1.4 }}>
          <Tab value="inbox" label="Inbox" />
          <Tab value="requests" label="Requests" />
        </Tabs>
      </Paper>

      {filteredConversations.length ? (
        filteredConversations.map((conversation) => (
          <Paper
            elevation={0}
            key={conversation.id}
            sx={{
              p: 1.4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1.3} alignItems="center">
              <Badge
                color="secondary"
                badgeContent={conversation.unread || null}
                overlap="circular"
              >
                <Avatar sx={{ bgcolor: conversation.avatarColor }}>
                  {conversation.name.slice(0, 1)}
                </Avatar>
              </Badge>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={700} noWrap>
                    {conversation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    @{conversation.username}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {conversation.time}
                  </Typography>
                </Stack>
                <Typography color="text.secondary" noWrap>
                  {conversation.message}
                </Typography>
              </Box>

              {conversation.request ? (
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained">
                    Accept
                  </Button>
                  <Button size="small" variant="outlined">
                    Ignore
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        ))
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ mb: 0.7 }}>
            Never miss a message
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Turn on notifications for your inbox and requests.
          </Typography>
          <Button size="large" variant="contained">
            Turn on notifications
          </Button>
        </Paper>
      )}
    </Stack>
  )
}

export default MessagesPage

import { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { selectCurrentUser } from '../features/auth/authSlice'
import { api } from '../lib/api'
import { toggleAgent } from '../features/ui/uiSlice'
import {
  acceptConversationRequest,
  createConversation,
  dropConversationMessage,
  fetchConversationMessages,
  fetchConversations,
  selectActiveMessagesStatus,
  ignoreConversationRequest,
  selectActiveConversationId,
  selectConversations,
  selectConversationsStatus,
  selectIsSendingMessage,
  selectMessagesForConversation,
  selectSocialError,
  sendMessage,
  setActiveConversationId,
} from '../features/social/socialSlice'

const EMPTY_MESSAGES = []

function MessagesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [tab, setTab] = useState('inbox')
  const [query, setQuery] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeState, setComposeState] = useState({ username: '', message: '' })
  const [composeMatches, setComposeMatches] = useState([])
  const [composeLookupStatus, setComposeLookupStatus] = useState('idle')
  const [composeError, setComposeError] = useState('')
  const [composeSubmitStatus, setComposeSubmitStatus] = useState('idle')
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [messageDraft, setMessageDraft] = useState('')
  const currentUser = useSelector(selectCurrentUser)
  const conversations = useSelector(selectConversations)
  const conversationsStatus = useSelector(selectConversationsStatus)
  const activeConversationId = useSelector(selectActiveConversationId)
  const activeMessagesStatus = useSelector(selectActiveMessagesStatus)
  const socialError = useSelector(selectSocialError)
  const activeMessages = useSelector((state) =>
    activeConversationId ? selectMessagesForConversation(state, activeConversationId) : EMPTY_MESSAGES,
  )
  const isSendingMessage = useSelector((state) =>
    activeConversationId ? selectIsSendingMessage(state, activeConversationId) : false,
  )
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || null
  const normalizedComposeUsername = composeState.username.trim().toLowerCase().replace(/^@/, '')
  const matchedRecipient =
    selectedRecipient ||
    composeMatches.find((entry) => entry.username === normalizedComposeUsername) ||
    null
  const isIncomingRequest = activeConversation?.requestDirection === 'incoming'
  const isOutgoingRequest = activeConversation?.requestDirection === 'outgoing'
  const canSendInActiveConversation = Boolean(activeConversation) && !isIncomingRequest
  const showConversationList = !isMobile || !activeConversation
  const showConversationPanel = !isMobile || Boolean(activeConversation)

  useEffect(() => {
    dispatch(fetchConversations({ tab, q: query }))
  }, [dispatch, query, tab])

  useEffect(() => {
    if (!isComposeOpen) {
      return
    }

    if (!normalizedComposeUsername) {
      setComposeMatches([])
      setSelectedRecipient(null)
      setComposeLookupStatus('idle')
      return
    }

    let isCancelled = false
    const timeoutId = setTimeout(async () => {
      setComposeLookupStatus('loading')

      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(normalizedComposeUsername)}`)

        if (isCancelled) {
          return
        }

        setComposeMatches(response.users)
        setComposeLookupStatus('succeeded')

        const exactMatch = response.users.find(
          (entry) => entry.username === normalizedComposeUsername,
        ) || null

        setSelectedRecipient((previous) =>
          previous?.username === normalizedComposeUsername ? previous : exactMatch,
        )
      } catch {
        if (isCancelled) {
          return
        }

        setComposeMatches([])
        setComposeLookupStatus('failed')
      }
    }, 180)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [isComposeOpen, normalizedComposeUsername])

  const filteredConversations = conversations

  const onSelectConversation = (conversationId) => {
    dispatch(setActiveConversationId(conversationId))
    dispatch(fetchConversationMessages(conversationId))
  }

  const onBackToConversationList = () => {
    setMessageDraft('')
    dispatch(setActiveConversationId(null))
  }

  const closeComposeDialog = (options = {}) => {
    if (composeSubmitStatus === 'loading' && !options.force) {
      return
    }

    setIsComposeOpen(false)
    setComposeState({ username: '', message: '' })
    setComposeMatches([])
    setComposeLookupStatus('idle')
    setComposeError('')
    setSelectedRecipient(null)
  }

  const dispatchOptimisticMessage = (content) => {
    if (!activeConversationId || !currentUser) {
      return
    }

    const trimmedMessage = content.trim()

    if (!trimmedMessage) {
      return
    }

    dispatch(
      sendMessage({
        conversationId: activeConversationId,
        content: trimmedMessage,
        optimisticMessage: {
          id: `temp-${Date.now()}`,
          content: trimmedMessage,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          avatarColor: currentUser.avatarColor,
          time: 'Sending...',
          pending: true,
          failed: false,
        },
      }),
    )
  }

  const onSendMessage = () => {
    if (!activeConversationId || !messageDraft.trim() || !currentUser || !canSendInActiveConversation) {
      return
    }

    const trimmedMessage = messageDraft.trim()

    setMessageDraft('')
    dispatchOptimisticMessage(trimmedMessage)
  }

  const onRetryFailedMessage = (message) => {
    if (!activeConversationId) {
      return
    }

    dispatch(
      dropConversationMessage({
        conversationId: activeConversationId,
        messageId: message.id,
      }),
    )
    dispatchOptimisticMessage(message.content)
  }

  const onAcceptConversation = async (conversationId) => {
    const result = await dispatch(acceptConversationRequest(conversationId))

    if (!acceptConversationRequest.fulfilled.match(result)) {
      return
    }

    setTab('inbox')
    dispatch(fetchConversations({ tab: 'inbox', q: query }))
    dispatch(fetchConversationMessages(conversationId))
  }

  const onIgnoreConversation = async (conversationId) => {
    const result = await dispatch(ignoreConversationRequest(conversationId))

    if (!ignoreConversationRequest.fulfilled.match(result)) {
      return
    }

    dispatch(fetchConversations({ tab, q: query }))
  }

  const onCreateConversation = async () => {
    if (!matchedRecipient) {
      setComposeError('Select a username from the list before starting the conversation.')
      return
    }

    if (!composeState.message.trim()) {
      setComposeError('Write a first message before sending the request.')
      return
    }

    setComposeSubmitStatus('loading')

    try {
      const response = await dispatch(
        createConversation({
          username: matchedRecipient.username,
          message: composeState.message.trim(),
        }),
      ).unwrap()

      setTab('inbox')
      setQuery('')
      closeComposeDialog({ force: true })
      dispatch(fetchConversations({ tab: 'inbox', q: '' }))
      dispatch(fetchConversationMessages(response.conversation.id))
    } catch (error) {
      setComposeError(error?.message || 'Unable to start a new conversation.')
    } finally {
      setComposeSubmitStatus('idle')
    }
  }

  return (
    <Stack spacing={1.4}>
      {socialError ? <Alert severity="error">{socialError}</Alert> : null}

      {showConversationList ? (
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
              <NotificationsOffRoundedIcon sx={{ color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/settings')} />
            </Stack>

            <Stack direction="row" spacing={0.4} alignItems="center">
              <IconButton aria-label="open-threader-agent-inline" onClick={() => dispatch(toggleAgent())}>
                <SmartToyOutlinedIcon />
              </IconButton>
              <IconButton aria-label="new-message" onClick={() => setIsComposeOpen(true)}>
                <EditNoteRoundedIcon />
              </IconButton>
            </Stack>
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
      ) : null}

      {filteredConversations.length || conversationsStatus === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.4,
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          }}
        >
          {showConversationList ? (
            <Stack spacing={1.2}>
              {filteredConversations.map((conversation) => (
                <Paper
                  elevation={0}
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  sx={{
                    p: 1.4,
                    border: '1px solid',
                    borderColor: activeConversationId === conversation.id ? 'secondary.main' : 'divider',
                    bgcolor: activeConversationId === conversation.id ? 'rgba(0, 212, 184, 0.08)' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'transform 180ms ease, border-color 180ms ease, background-color 180ms ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      borderColor: 'secondary.main',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Badge
                      color="secondary"
                      badgeContent={conversation.unread || null}
                      overlap="circular"
                    >
                      <Avatar src={conversation.avatarUrl} sx={{ bgcolor: conversation.avatarColor }}>
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

                      {conversation.requestDirection === 'outgoing' ? (
                        <Chip label="Pending approval" size="small" sx={{ mt: 0.8 }} />
                      ) : null}
                    </Box>

                    {conversation.canAcceptRequest ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(event) => {
                            event.stopPropagation()
                            onAcceptConversation(conversation.id)
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(event) => {
                            event.stopPropagation()
                            onIgnoreConversation(conversation.id)
                          }}
                        >
                          Ignore
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                </Paper>
              ))}

              {conversationsStatus === 'loading' && !filteredConversations.length
                ? Array.from({ length: 3 }, (_, index) => (
                    <Paper
                      key={`conversation-skeleton-${index}`}
                      elevation={0}
                      sx={{
                        p: 1.4,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="52%" height={26} />
                          <Skeleton variant="text" width="88%" height={22} />
                        </Box>
                      </Stack>
                    </Paper>
                  ))
                : null}
            </Stack>
          ) : null}

          {showConversationPanel ? (
            <Paper
              elevation={0}
              sx={{
                p: 1.6,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                minHeight: 420,
              }}
            >
              {activeConversation ? (
                <Fade in key={activeConversation.id} timeout={220}>
                  <Stack spacing={1.4} sx={{ height: '100%' }}>
                    <Box>
                      <LinearProgress
                        color="secondary"
                        sx={{
                          mb: 1.2,
                          borderRadius: 999,
                          opacity: activeMessagesStatus === 'loading' ? 1 : 0,
                          transition: 'opacity 180ms ease',
                        }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        {isMobile ? (
                          <IconButton aria-label="back to conversations" onClick={onBackToConversationList}>
                            <ArrowBackRoundedIcon />
                          </IconButton>
                        ) : null}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700}>{activeConversation.name}</Typography>
                          <Typography color="text.secondary">@{activeConversation.username}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }} />
                        <IconButton
                          aria-label="open-threader-agent-inline"
                          onClick={() => dispatch(toggleAgent())}
                        >
                          <SmartToyOutlinedIcon />
                        </IconButton>
                      </Stack>
                    </Box>

                    {isIncomingRequest ? (
                      <Alert
                        severity="info"
                        action={
                          <Stack direction="row" spacing={1}>
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => onAcceptConversation(activeConversation.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => onIgnoreConversation(activeConversation.id)}
                            >
                              Ignore
                            </Button>
                          </Stack>
                        }
                      >
                        Accept this message request to reply to @{activeConversation.username}.
                      </Alert>
                    ) : null}

                    {isOutgoingRequest ? (
                      <Alert severity="info">
                        Your request is waiting for @{activeConversation.username} to accept it.
                      </Alert>
                    ) : null}

                    <Stack spacing={1} sx={{ flex: 1, minHeight: 240, overflowY: 'auto', pr: 0.6 }}>
                      {activeMessagesStatus === 'loading' && !activeMessages.length
                        ? Array.from({ length: 4 }, (_, index) => (
                            <Stack key={`message-skeleton-${index}`} spacing={0.6} sx={{ maxWidth: '72%' }}>
                              <Skeleton variant="rounded" height={58} />
                              <Skeleton variant="text" width={80} height={18} />
                            </Stack>
                          ))
                        : activeMessages.map((message) => {
                            const isIncoming = message.username === activeConversation.username

                            return (
                              <Box
                                key={message.id}
                                sx={{
                                  alignSelf: isIncoming ? 'flex-start' : 'flex-end',
                                  maxWidth: { xs: '90%', sm: '84%' },
                                  px: { xs: 1.45, sm: 1.7 },
                                  py: { xs: 1.15, sm: 1.25 },
                                  borderRadius: { xs: 1.5, sm: 2 },
                                  bgcolor: isIncoming ? 'action.hover' : 'secondary.main',
                                  color: isIncoming ? 'text.primary' : 'secondary.contrastText',
                                  opacity: message.pending ? 0.8 : 1,
                                  transform: message.pending ? 'translateY(4px)' : 'translateY(0)',
                                  border: message.failed ? '1px solid rgba(255, 99, 132, 0.45)' : 'none',
                                  transition: 'opacity 180ms ease, transform 180ms ease',
                                }}
                              >
                                <Typography
                                  sx={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.55,
                                    overflowWrap: 'anywhere',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {message.content}
                                </Typography>
                                {message.pending ? (
                                  <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.4 }}>
                                    <CircularProgress size={12} color="inherit" />
                                    <Typography variant="caption" sx={{ opacity: 0.76 }}>
                                      Sending...
                                    </Typography>
                                  </Stack>
                                ) : message.failed ? (
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.82 }}>
                                      {message.errorMessage || 'Not sent'}
                                    </Typography>
                                    <Button
                                      size="small"
                                      color="inherit"
                                      onClick={() => onRetryFailedMessage(message)}
                                    >
                                      Retry
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Typography variant="caption" sx={{ opacity: 0.72 }}>
                                    {message.time}
                                  </Typography>
                                )}
                              </Box>
                            )
                          })}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        position: { xs: 'sticky', md: 'static' },
                        bottom: { xs: 108, md: 'auto' },
                        zIndex: 2,
                        pt: 1,
                        pb: { xs: 0.6, md: 0 },
                        bgcolor: 'background.paper',
                      }}
                    >
                      <TextField
                        fullWidth
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        placeholder={
                          isIncomingRequest
                            ? 'Accept the request to reply'
                            : isOutgoingRequest
                              ? 'Waiting for them to accept your request'
                              : 'Write a message'
                        }
                        disabled={isSendingMessage || !canSendInActiveConversation}
                      />
                      <Button
                        variant="contained"
                        onClick={onSendMessage}
                        disabled={!messageDraft.trim() || isSendingMessage || !canSendInActiveConversation}
                        startIcon={
                          isSendingMessage ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <SendRoundedIcon />
                          )
                        }
                      >
                        {isSendingMessage ? 'Sending...' : 'Send'}
                      </Button>
                    </Stack>
                  </Stack>
                </Fade>
              ) : (
                <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                  <Typography variant="h5">Select a conversation</Typography>
                  <Typography color="text.secondary">Your messages will appear here.</Typography>
                </Stack>
              )}
            </Paper>
          ) : null}
        </Box>
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

      <Dialog open={isComposeOpen} onClose={closeComposeDialog} fullWidth maxWidth="sm">
        <DialogTitle>New message</DialogTitle>
        <DialogContent>
          <Stack spacing={1.3} sx={{ mt: 0.4 }}>
            {composeError ? <Alert severity="error">{composeError}</Alert> : null}

            <Autocomplete
              fullWidth
              autoHighlight
              options={composeMatches}
              loading={composeLookupStatus === 'loading'}
              value={selectedRecipient}
              inputValue={composeState.username}
              filterOptions={(options) => options}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option?.username || ''}
              noOptionsText={
                normalizedComposeUsername
                  ? 'No matching usernames found.'
                  : 'Start typing a username.'
              }
              onChange={(_, nextValue) => {
                setSelectedRecipient(nextValue)
                setComposeState((previous) => ({
                  ...previous,
                  username: nextValue?.username || previous.username,
                }))
                setComposeError('')
              }}
              onInputChange={(_, nextValue, reason) => {
                setComposeState((previous) => ({ ...previous, username: nextValue }))

                if (reason === 'input') {
                  setSelectedRecipient(null)
                }

                if (composeError) {
                  setComposeError('')
                }
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props

                return (
                  <Box component="li" key={key} {...optionProps}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: '100%' }}>
                      <Avatar src={option.avatarUrl} sx={{ bgcolor: option.color, width: 34, height: 34 }}>
                        {option.name.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap>
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          @{option.username}
                        </Typography>
                      </Box>
                      {option.privateAccount ? (
                        <Chip icon={<LockRoundedIcon />} label="Private" size="small" />
                      ) : null}
                    </Stack>
                  </Box>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Username"
                  placeholder="mara_codes"
                  helperText={
                    composeLookupStatus === 'loading'
                      ? 'Looking up usernames...'
                      : matchedRecipient
                        ? `Message @${matchedRecipient.username}`
                        : 'Pick an existing username from the list.'
                  }
                />
              )}
            />
            <TextField
              label="Message"
              multiline
              minRows={4}
              value={composeState.message}
              onChange={(event) =>
                setComposeState((previous) => ({ ...previous, message: event.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeComposeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onCreateConversation}
            disabled={composeSubmitStatus === 'loading'}
            startIcon={
              composeSubmitStatus === 'loading' ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {composeSubmitStatus === 'loading' ? 'Sending...' : 'Start conversation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default MessagesPage

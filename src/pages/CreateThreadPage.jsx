import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  addPost,
  selectCreatePostStatus,
  selectFeedError,
} from '../features/feed/feedSlice'

function CreateThreadPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const createStatus = useSelector(selectCreatePostStatus)
  const feedError = useSelector(selectFeedError)
  const contentFieldRef = useRef(null)
  const imageFieldRef = useRef(null)
  const linkFieldRef = useRef(null)

  const [form, setForm] = useState({
    content: '',
    topic: '',
    image: '',
    link: '',
  })
  const [error, setError] = useState('')
  const isPosting = createStatus === 'loading'

  if (!currentUser) {
    return null
  }

  useEffect(() => {
    const focusField = location.state?.focus

    if (focusField === 'image') {
      imageFieldRef.current?.focus()
      return
    }

    if (focusField === 'link') {
      linkFieldRef.current?.focus()
      return
    }

    if (focusField === 'content') {
      contentFieldRef.current?.focus()
    }
  }, [location.state])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (error) {
      setError('')
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()

    if (isPosting) {
      return
    }

    if (!form.content.trim()) {
      setError('Write something before posting your thread.')
      return
    }

    dispatch(
      addPost({
        content: form.content.trim(),
        image: form.image.trim(),
        topic: form.topic.trim(),
        link: form.link.trim(),
      }),
    )
      .unwrap()
      .then(() => navigate('/home'))
  }

  const appendToContent = (value) => {
    setForm((previous) => ({
      ...previous,
      content: `${previous.content}${value}`,
    }))
    contentFieldRef.current?.focus()
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.4, sm: 2.2 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.6}>
        <Collapse in={isPosting}>
          <LinearProgress color="secondary" sx={{ borderRadius: 999 }} />
        </Collapse>

        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar src={currentUser.avatarUrl} sx={{ bgcolor: currentUser.avatarColor }}>
            {currentUser.fullName.slice(0, 1)}
          </Avatar>
          <Box>
            <Typography fontWeight={700}>{currentUser.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              Add a topic and publish to your audience.
            </Typography>
          </Box>
        </Stack>

        {error ? <Alert severity="warning">{error}</Alert> : null}
        {feedError && !error ? <Alert severity="error">{feedError}</Alert> : null}

        <Box component="form" onSubmit={onSubmit}>
          <Stack
            spacing={1.3}
            sx={{
              opacity: isPosting ? 0.8 : 1,
              transition: 'opacity 180ms ease',
            }}
          >
            <TextField
              multiline
              minRows={5}
              inputRef={contentFieldRef}
              name="content"
              value={form.content}
              onChange={onChange}
              placeholder="What is new?"
              disabled={isPosting}
            />
            <TextField
              name="topic"
              value={form.topic}
              onChange={onChange}
              label="Topic"
              placeholder="frontend, design, build-in-public"
              disabled={isPosting}
            />
            <TextField
              name="image"
              inputRef={imageFieldRef}
              value={form.image}
              onChange={onChange}
              label="Image URL"
              placeholder="https://..."
              disabled={isPosting}
            />
            <TextField
              name="link"
              inputRef={linkFieldRef}
              value={form.link}
              onChange={onChange}
              label="Link"
              placeholder="Optional link"
              disabled={isPosting}
            />

            <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
              <IconButton
                size="small"
                aria-label="insert-image"
                onClick={() => imageFieldRef.current?.focus()}
                disabled={isPosting}
              >
                <ImageOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="insert-gif"
                onClick={() => {
                  if (!form.link) {
                    setForm((previous) => ({ ...previous, link: 'https://giphy.com/' }))
                  }
                  linkFieldRef.current?.focus()
                }}
                disabled={isPosting}
              >
                <GifBoxOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="insert-list"
                onClick={() => appendToContent(form.content ? '\n- ' : '- ')}
                disabled={isPosting}
              >
                <FormatListBulletedRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="mention-people"
                onClick={() => appendToContent(form.content.endsWith(' ') || !form.content ? '@' : ' @')}
                disabled={isPosting}
              >
                <AlternateEmailRoundedIcon fontSize="small" />
              </IconButton>

              {form.topic ? (
                <Chip label={`#${form.topic.replace(/\s+/g, '')}`} size="small" color="secondary" />
              ) : null}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {isPosting ? 'Publishing your thread...' : 'Reply options'}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                disabled={isPosting}
                startIcon={
                  isPosting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />
                }
              >
                {isPosting ? 'Publishing...' : 'Post'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default CreateThreadPage

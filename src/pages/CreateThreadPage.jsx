import { useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
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
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '../features/auth/authSlice'
import { addPost } from '../features/feed/feedSlice'

function CreateThreadPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const [form, setForm] = useState({
    content: '',
    topic: '',
    image: '',
    link: '',
  })
  const [error, setError] = useState('')

  if (!currentUser) {
    return null
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (error) {
      setError('')
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()

    if (!form.content.trim()) {
      setError('Write something before posting your thread.')
      return
    }

    dispatch(
      addPost({
        authorId: currentUser.id,
        author: currentUser.username,
        username: currentUser.username,
        avatarColor: currentUser.avatarColor,
        content: form.content.trim(),
        image: form.image.trim(),
        topic: form.topic.trim(),
      }),
    )

    navigate('/home')
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
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar sx={{ bgcolor: currentUser.avatarColor }}>{currentUser.fullName.slice(0, 1)}</Avatar>
          <Box>
            <Typography fontWeight={700}>{currentUser.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              Add a topic and publish to your audience.
            </Typography>
          </Box>
        </Stack>

        {error ? <Alert severity="warning">{error}</Alert> : null}

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={1.3}>
            <TextField
              multiline
              minRows={5}
              name="content"
              value={form.content}
              onChange={onChange}
              placeholder="What is new?"
            />
            <TextField
              name="topic"
              value={form.topic}
              onChange={onChange}
              label="Topic"
              placeholder="frontend, design, build-in-public"
            />
            <TextField
              name="image"
              value={form.image}
              onChange={onChange}
              label="Image URL"
              placeholder="https://..."
            />
            <TextField
              name="link"
              value={form.link}
              onChange={onChange}
              label="Link"
              placeholder="Optional link"
            />

            <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
              <IconButton size="small" aria-label="insert-image">
                <ImageOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="insert-gif">
                <GifBoxOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="insert-list">
                <FormatListBulletedRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="mention-people">
                <AlternateEmailRoundedIcon fontSize="small" />
              </IconButton>

              {form.topic ? (
                <Chip label={`#${form.topic.replace(/\s+/g, '')}`} size="small" color="secondary" />
              ) : null}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Reply options
              </Typography>
              <Button type="submit" variant="contained" startIcon={<SendRoundedIcon />}>
                Post
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default CreateThreadPage

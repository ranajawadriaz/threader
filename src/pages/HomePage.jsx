import { useState } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ThreadCard from '../components/thread/ThreadCard'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  bumpComment,
  bumpRepost,
  bumpShare,
  selectPosts,
  toggleLike,
} from '../features/feed/feedSlice'

function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const posts = useSelector(selectPosts)
  const [toast, setToast] = useState('')

  if (!currentUser) {
    return null
  }

  const onLike = (postId) => {
    dispatch(toggleLike({ postId, userId: currentUser.id }))
  }

  const onComment = (postId) => {
    dispatch(bumpComment(postId))
    setToast('Comment draft opened')
  }

  const onRepost = (postId) => {
    dispatch(bumpRepost(postId))
    setToast('Thread reposted to your audience')
  }

  const onShare = (postId) => {
    dispatch(bumpShare(postId))
    setToast('Share sheet opened for friends')
  }

  return (
    <Stack spacing={1.4}>
      <Paper
        elevation={0}
        sx={{
          py: 1.4,
          px: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography align="center" fontWeight={700}>
          For you
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.3, sm: 1.8 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/create')}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar sx={{ bgcolor: currentUser.avatarColor }}>{currentUser.fullName.slice(0, 1)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              What is new?
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small">
                <ImageOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <GifBoxOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <FormatListBulletedRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <PlaceOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {posts.map((post) => (
        <ThreadCard
          key={post.id}
          post={post}
          currentUserId={currentUser.id}
          onLike={() => onLike(post.id)}
          onComment={() => onComment(post.id)}
          onRepost={() => onRepost(post.id)}
          onShare={() => onShare(post.id)}
        />
      ))}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2200}
        onClose={() => setToast('')}
        message={toast}
      />
    </Stack>
  )
}

export default HomePage

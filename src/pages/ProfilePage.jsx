import { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { profileChecklist } from '../data/mockData'
import { selectCurrentUser, updateProfile } from '../features/auth/authSlice'
import { selectPosts } from '../features/feed/feedSlice'
import ThreadCard from '../components/thread/ThreadCard'

function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const posts = useSelector(selectPosts)

  const [tab, setTab] = useState('threads')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [editState, setEditState] = useState({
    fullName: currentUser?.fullName ?? '',
    bio: currentUser?.bio ?? '',
  })

  const ownPosts = useMemo(() => {
    if (!currentUser) {
      return []
    }

    return posts.filter((post) => post.authorId === currentUser.id)
  }, [currentUser, posts])

  if (!currentUser) {
    return null
  }

  const onSaveProfile = () => {
    dispatch(updateProfile(editState))
    setIsEditOpen(false)
    setNotice('Profile updated')
  }

  const onShareProfile = async () => {
    const profileUrl = `https://threader.app/${currentUser.username}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentUser.username} on Threader`,
          text: 'Check my Threader profile',
          url: profileUrl,
        })
        return
      }

      await navigator.clipboard.writeText(profileUrl)
      setNotice('Profile link copied')
    } catch {
      setNotice('Unable to share right now')
    }
  }

  return (
    <Stack spacing={1.4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.2 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: 44, sm: 56 }, lineHeight: 1 }}>
              {currentUser.username}
            </Typography>
            <Typography variant="h6" sx={{ mb: 0.6 }}>
              {currentUser.fullName}
            </Typography>
            <Typography color="text.secondary">{currentUser.bio}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.8, fontSize: 44 }}>
              0 followers
            </Typography>
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <Avatar sx={{ width: 94, height: 94, bgcolor: currentUser.avatarColor }}>
              {currentUser.fullName.slice(0, 1)}
            </Avatar>
            <Stack direction="row" spacing={0.4}>
              <IconButton>
                <BarChartRoundedIcon />
              </IconButton>
              <IconButton onClick={() => navigate('/settings')}>
                <SettingsRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}>
          <Button variant="outlined" fullWidth onClick={() => setIsEditOpen(true)}>
            Edit profile
          </Button>
          <Button variant="outlined" fullWidth onClick={onShareProfile}>
            Share profile
          </Button>
        </Stack>

        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mt: 1.5 }} variant="fullWidth">
          <Tab value="threads" label="Threads" />
          <Tab value="replies" label="Replies" />
          <Tab value="media" label="Media" />
          <Tab value="reposts" label="Reposts" />
        </Tabs>
      </Paper>

      {tab === 'threads' ? (
        <>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.4, sm: 1.8 },
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5">Finish your profile</Typography>
              <Typography color="text.secondary">4 left</Typography>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.1 }}>
              {profileChecklist.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <Typography fontWeight={700} sx={{ mb: 0.4 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
                    {item.subtitle}
                  </Typography>
                  <Button size="small" variant="contained">
                    {item.cta}
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>

          {ownPosts.length ? (
            ownPosts.map((post) => (
              <ThreadCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onLike={() => {}}
                onComment={() => {}}
                onRepost={() => {}}
                onShare={() => {}}
              />
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5">Create your first thread</Typography>
              <Typography color="text.secondary" sx={{ mb: 1.2 }}>
                Your profile feed is waiting for your first post.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/create')}>
                New thread
              </Button>
            </Paper>
          )}
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ mb: 0.7 }}>
            {tab} will appear here
          </Typography>
          <Typography color="text.secondary">This tab is ready for backend integration later.</Typography>
        </Paper>
      )}

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4} sx={{ mt: 0.4 }}>
            <TextField
              label="Full name"
              value={editState.fullName}
              onChange={(event) =>
                setEditState((previous) => ({ ...previous, fullName: event.target.value }))
              }
            />
            <TextField
              label="Bio"
              multiline
              minRows={3}
              value={editState.bio}
              onChange={(event) =>
                setEditState((previous) => ({ ...previous, bio: event.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onSaveProfile}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2400}
        onClose={() => setNotice('')}
        message={notice}
      />
    </Stack>
  )
}

export default ProfilePage

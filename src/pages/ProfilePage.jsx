import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
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
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectCurrentUser, updateProfile } from '../features/auth/authSlice'
import { deleteThread } from '../features/feed/feedSlice'
import {
  fetchProfileBundle,
  selectProfileBundle,
  selectProfileStatus,
  toggleFollow,
} from '../features/social/socialSlice'
import ThreadCard from '../components/thread/ThreadCard'

const AVATAR_PALETTE = [
  '#2fa2ff',
  '#665cff',
  '#03c08c',
  '#ef4444',
  '#f43f5e',
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
]

function hashText(value) {
  return Array.from(value).reduce(
    (hash, character) => hash + character.charCodeAt(0),
    0,
  )
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getInitials(value) {
  const tokens = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!tokens.length) {
    return 'T'
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase()
  }

  return `${tokens[0][0] || ''}${tokens[tokens.length - 1][0] || ''}`.toUpperCase()
}

function pickAvatarColor(seedText = '', preferredColor = '') {
  if (preferredColor) {
    return preferredColor
  }

  const seed = seedText.trim() || 'threader'
  return AVATAR_PALETTE[hashText(seed) % AVATAR_PALETTE.length]
}

function createGeneratedAvatarDataUrl({ fullName = '', username = '', color = '' } = {}) {
  const label = fullName.trim() || username.trim() || 'Threader'
  const backgroundColor = pickAvatarColor(label || username, color)
  const initials = getInitials(label)
  const safeLabel = escapeXml(label)
  const safeInitials = escapeXml(initials)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${safeLabel}">
      <rect width="160" height="160" rx="38" fill="${backgroundColor}" />
      <circle cx="126" cy="38" r="16" fill="rgba(255,255,255,0.18)" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Verdana, Arial, sans-serif" font-size="56" font-weight="700" letter-spacing="1">${safeInitials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file.'))
    reader.readAsDataURL(file)
  })
}

function ProfilePage() {
  const { username: routeUsername } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const profile = useSelector(selectProfileBundle)
  const profileStatus = useSelector(selectProfileStatus)
  const fileInputRef = useRef(null)

  const [tab, setTab] = useState('threads')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [isFollowPending, setIsFollowPending] = useState(false)
  const [editState, setEditState] = useState({
    fullName: currentUser?.fullName ?? '',
    bio: currentUser?.bio ?? '',
  })
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '')

  const normalizedRouteUsername = routeUsername?.trim().toLowerCase().replace(/^@/, '') || ''
  const isOwnProfileRoute = !normalizedRouteUsername || normalizedRouteUsername === currentUser?.username
  const isLoadedPublicProfile = profile.user?.username === normalizedRouteUsername
  const profileUser = isOwnProfileRoute
    ? currentUser
    : isLoadedPublicProfile
      ? profile.user
      : null
  const viewedThreads = !isOwnProfileRoute && !isLoadedPublicProfile ? [] : profile.threads
  const viewedReplies = !isOwnProfileRoute && !isLoadedPublicProfile ? [] : profile.replies
  const viewedMedia = !isOwnProfileRoute && !isLoadedPublicProfile ? [] : profile.media
  const viewedReposts = !isOwnProfileRoute && !isLoadedPublicProfile ? [] : profile.reposts

  useEffect(() => {
    if (!currentUser) {
      return
    }

    dispatch(fetchProfileBundle(normalizedRouteUsername || undefined))
  }, [currentUser, dispatch, normalizedRouteUsername])

  useEffect(() => {
    setEditState({
      fullName: profileUser?.fullName ?? '',
      bio: profileUser?.bio ?? '',
    })
    setAvatarUrl(profileUser?.avatarUrl ?? '')
  }, [profileUser])

  const ownPosts = useMemo(() => viewedThreads, [viewedThreads])
  const mediaPosts = useMemo(() => viewedMedia, [viewedMedia])
  const repostedPosts = useMemo(() => viewedReposts, [viewedReposts])

  if (!currentUser) {
    return null
  }

  if (profileStatus === 'loading' && !profileUser) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <CircularProgress color="secondary" />
      </Paper>
    )
  }

  if (!profileUser) {
    return null
  }

  const isOwnProfile = Boolean(profileUser.isOwnProfile ?? isOwnProfileRoute)
  const defaultAvatarUrl = createGeneratedAvatarDataUrl({
    fullName: profileUser.fullName,
    username: profileUser.username,
    color: profileUser.avatarColor,
  })
  const hasCustomProfilePhoto = Boolean(profileUser.avatarPrompt) || (
    Boolean(profileUser.avatarUrl) && profileUser.avatarUrl !== defaultAvatarUrl
  )
  const remainingFollowCount = Math.max(10 - (profileUser.followingCount || 0), 0)
  const checklistItems = [
    ownPosts.length
      ? null
      : {
          id: 'c1',
          title: 'Create thread',
          subtitle: 'Say what is on your mind or share a recent highlight.',
          cta: 'Create',
        },
    remainingFollowCount === 0
      ? null
      : {
          id: 'c2',
          title: 'Follow 10 profiles',
          subtitle: `Follow ${remainingFollowCount} more ${remainingFollowCount === 1 ? 'profile' : 'profiles'} to fill your feed with threads that match your interests.`,
          cta: 'Follow',
        },
    hasCustomProfilePhoto
      ? null
      : {
          id: 'c3',
          title: 'Add profile photo',
          subtitle: 'A profile picture helps people recognize you faster.',
          cta: 'Upload',
        },
  ].filter(Boolean)

  const onSaveProfile = () => {
    dispatch(updateProfile(editState))
      .unwrap()
      .then(() => {
        dispatch(fetchProfileBundle())
        setIsEditOpen(false)
        setNotice('Profile updated')
      })
  }

  const onSaveAvatar = () => {
    dispatch(updateProfile({ avatarUrl, avatarPrompt: '' }))
      .unwrap()
      .then(() => {
        setIsAvatarOpen(false)
        setNotice('Profile photo updated')
      })
  }

  const onAvatarFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.size > 1_500_000) {
      setNotice('Choose an image under 1.5 MB.')
      event.target.value = ''
      return
    }

    try {
      const nextAvatarUrl = await readFileAsDataUrl(file)
      setAvatarUrl(nextAvatarUrl)
      setNotice('Photo ready to save')
    } catch {
      setNotice('Unable to read that image file')
    }

    event.target.value = ''
  }

  const onChecklistAction = (itemId) => {
    if (itemId === 'c1') {
      navigate('/create')
      return
    }

    if (itemId === 'c2') {
      navigate('/home')
      return
    }

    setIsAvatarOpen(true)
  }

  const onShareProfile = async () => {
    const profileUrl = `https://threader.app/profile/${profileUser.username}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileUser.username} on Threader`,
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

  const onDeleteOwnThread = (postId) => {
    dispatch(deleteThread(postId))
      .unwrap()
      .then(() => {
        dispatch(fetchProfileBundle(normalizedRouteUsername || undefined))
        setNotice('Thread deleted')
      })
  }

  const onToggleFollow = async () => {
    if (isOwnProfile || isFollowPending) {
      return
    }

    setIsFollowPending(true)

    try {
      await dispatch(toggleFollow(profileUser.id)).unwrap()
      await dispatch(fetchProfileBundle(normalizedRouteUsername)).unwrap()
    } finally {
      setIsFollowPending(false)
    }
  }

  const renderEmptyState = (title, subtitle, actionLabel, actionHandler) => (
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
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: actionLabel ? 1.2 : 0 }}>
        {subtitle}
      </Typography>
      {actionLabel ? (
        <Button variant="contained" onClick={actionHandler}>
          {actionLabel}
        </Button>
      ) : null}
    </Paper>
  )

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
          <Box sx={{ minWidth: 0, flex: 1, pr: { xs: 0.7, sm: 1.2 } }}>
            <Typography
              variant="h4"
              sx={{
                mb: 0.5,
                fontSize: { xs: 30, sm: 56 },
                lineHeight: { xs: 1.06, sm: 1 },
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {profileUser.username}
            </Typography>
            <Typography variant="h6" sx={{ mb: 0.6 }}>
              {profileUser.fullName}
            </Typography>
            <Typography color="text.secondary">{profileUser.bio}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.8, fontSize: { xs: 34, sm: 44 }, lineHeight: 1 }}>
              {profileUser.followersCount} followers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              {profileUser.followingCount} following
            </Typography>
          </Box>

          <Stack spacing={1} alignItems="flex-end" sx={{ flexShrink: 0 }}>
            <Avatar
              src={profileUser.avatarUrl}
              sx={{ width: { xs: 74, sm: 94 }, height: { xs: 74, sm: 94 }, bgcolor: profileUser.avatarColor }}
            >
              {profileUser.fullName.slice(0, 1)}
            </Avatar>
            {isOwnProfile ? (
              <Stack direction="row" spacing={0.4}>
                <IconButton onClick={() => setIsAvatarOpen(true)}>
                  <PhotoCameraRoundedIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/settings')}>
                  <SettingsRoundedIcon />
                </IconButton>
              </Stack>
            ) : null}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}>
          {isOwnProfile ? (
            <>
              <Button variant="outlined" fullWidth onClick={() => setIsEditOpen(true)}>
                Edit profile
              </Button>
              <Button variant="outlined" fullWidth startIcon={<ShareRoundedIcon />} onClick={onShareProfile}>
                Share profile
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={profileUser.isFollowing ? 'contained' : 'outlined'}
                fullWidth
                onClick={onToggleFollow}
                startIcon={
                  isFollowPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PersonAddAltRoundedIcon />
                  )
                }
              >
                {isFollowPending
                  ? 'Updating...'
                  : profileUser.isFollowing
                    ? 'Following'
                    : 'Follow'}
              </Button>
              <Button variant="outlined" fullWidth startIcon={<ShareRoundedIcon />} onClick={onShareProfile}>
                Share profile
              </Button>
            </>
          )}
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
          {isOwnProfile && profileStatus !== 'loading' && checklistItems.length ? (
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
                <Typography color="text.secondary">
                  {checklistItems.length} left
                </Typography>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.1 }}>
                {checklistItems.map((item) => (
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
                    <Button size="small" variant="contained" onClick={() => onChecklistAction(item.id)}>
                      {item.cta}
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Paper>
          ) : null}

          {profileStatus === 'loading' ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CircularProgress color="secondary" />
            </Paper>
          ) : null}

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
                onDelete={isOwnProfile ? () => onDeleteOwnThread(post.id) : undefined}
                onOpenAuthor={() => navigate(`/profile/${post.username}`)}
              />
            ))
          ) : (
            renderEmptyState(
              isOwnProfile ? 'Create your first thread' : 'No threads yet',
              isOwnProfile
                ? 'Your profile feed is waiting for your first post.'
                : `${profileUser.fullName} has not posted any threads yet.`,
              isOwnProfile ? 'New thread' : null,
              isOwnProfile ? () => navigate('/create') : undefined,
            )
          )}
        </>
      ) : tab === 'media' ? (
        mediaPosts.length ? (
          mediaPosts.map((post) => (
            <ThreadCard
              key={post.id}
              post={post}
              currentUserId={currentUser.id}
              onLike={() => {}}
              onComment={() => {}}
              onRepost={() => {}}
              onShare={() => {}}
              onDelete={isOwnProfile ? () => onDeleteOwnThread(post.id) : undefined}
              onOpenAuthor={() => navigate(`/profile/${post.username}`)}
            />
          ))
        ) : (
          renderEmptyState(
            'No media threads yet',
            isOwnProfile
              ? 'Threads with images will appear here.'
              : `${profileUser.fullName} has not shared image posts yet.`,
          )
        )
      ) : tab === 'replies' ? (
        viewedReplies.length ? (
          viewedReplies.map((reply) => (
            <Stack key={reply.id} spacing={1.1}>
              {reply.thread ? (
                <ThreadCard
                  post={reply.thread}
                  currentUserId={currentUser.id}
                  onLike={() => {}}
                  onComment={() => {}}
                  onRepost={() => {}}
                  onShare={() => {}}
                  onOpenAuthor={() => navigate(`/profile/${reply.thread.username}`)}
                />
              ) : null}

              <Paper
                elevation={0}
                sx={{
                  ml: { xs: 2, sm: 6 },
                  px: 1.6,
                  py: 1.4,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '3px solid',
                  borderLeftColor: 'secondary.main',
                  bgcolor: 'rgba(0, 212, 184, 0.06)',
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <Avatar
                    src={profileUser.avatarUrl}
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: profileUser.avatarColor,
                      flexShrink: 0,
                    }}
                  >
                    {profileUser.fullName.slice(0, 1)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.2, sm: 0.8 }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ mb: 0.5 }}
                    >
                      <Typography fontWeight={700}>
                        {isOwnProfile ? 'You replied' : `${profileUser.fullName} replied`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{profileUser.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reply.createdAt}
                      </Typography>
                    </Stack>

                    <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                      {reply.content}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          ))
        ) : (
          renderEmptyState(
            'No replies yet',
            isOwnProfile
              ? 'Reply to a thread to see it here.'
              : `${profileUser.fullName} has not replied yet.`,
          )
        )
      ) : repostedPosts.length ? (
        repostedPosts.map((post) => (
          <ThreadCard
            key={post.id}
            post={post}
            currentUserId={currentUser.id}
            onLike={() => {}}
            onComment={() => {}}
            onRepost={() => {}}
            onShare={() => {}}
            onOpenAuthor={() => navigate(`/profile/${post.username}`)}
          />
        ))
      ) : (
        renderEmptyState(
          'No reposts yet',
          isOwnProfile
            ? 'Reposted threads will appear here.'
            : `${profileUser.fullName} has not reposted anything yet.`,
        )
      )}

      <Dialog open={isOwnProfile && isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth>
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

      <Dialog open={isOwnProfile && isAvatarOpen} onClose={() => setIsAvatarOpen(false)} fullWidth>
        <DialogTitle>Update profile photo</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4} sx={{ mt: 0.4 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar src={avatarUrl} sx={{ width: 58, height: 58, bgcolor: currentUser.avatarColor }}>
                {currentUser.fullName.slice(0, 1)}
              </Avatar>
              <Stack spacing={0.8}>
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                  Upload image
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, or WebP up to 1.5 MB.
                </Typography>
              </Stack>
            </Stack>

            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*"
              onChange={onAvatarFileChange}
            />

            <TextField
              label="Image URL"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
            <Typography variant="body2" color="text.secondary">
              Upload a photo directly or paste an image URL. The agent can still generate one from a prompt if you want.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAvatarOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onSaveAvatar}>
            Save photo
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

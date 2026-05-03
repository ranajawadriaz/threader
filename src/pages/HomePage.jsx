import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  CircularProgress,
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
import CommentsDialog from '../components/thread/CommentsDialog'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  fetchComments,
  fetchFeed,
  bumpComment,
  bumpRepost,
  bumpShare,
  selectCommentsForPost,
  selectCommentStatus,
  selectFeedStatus,
  selectPosts,
  toggleLike,
} from '../features/feed/feedSlice'

const EMPTY_COMMENTS = []

function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const posts = useSelector(selectPosts)
  const feedStatus = useSelector(selectFeedStatus)
  const commentStatus = useSelector(selectCommentStatus)
  const [toast, setToast] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const comments = useSelector((state) =>
    selectedPost ? selectCommentsForPost(state, selectedPost.id) : EMPTY_COMMENTS,
  )

  if (!currentUser) {
    return null
  }

  useEffect(() => {
    if (feedStatus === 'idle') {
      dispatch(fetchFeed())
    }
  }, [dispatch, feedStatus])

  const onLike = (postId) => {
    dispatch(toggleLike({ postId }))
  }

  const onComment = (postId) => {
    const post = posts.find((entry) => entry.id === postId) || null
    setSelectedPost(post)
    setCommentDraft('')

    if (post) {
      dispatch(fetchComments(post.id))
    }
  }

  const onRepost = (postId) => {
    dispatch(bumpRepost(postId))
    setToast('Thread reposted to your audience')
  }

  const onShare = (postId) => {
    dispatch(bumpShare(postId))
    setToast('Share sheet opened for friends')
  }

  const onSubmitComment = async () => {
    if (!selectedPost || !commentDraft.trim()) {
      return
    }

    await dispatch(
      bumpComment({
        postId: selectedPost.id,
        content: commentDraft.trim(),
      }),
    )

    setCommentDraft('')
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
          <Avatar src={currentUser.avatarUrl} sx={{ bgcolor: currentUser.avatarColor }}>
            {currentUser.fullName.slice(0, 1)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              What is new?
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={(event) => {
                event.stopPropagation()
                navigate('/create', { state: { focus: 'image' } })
              }}>
                <ImageOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(event) => {
                event.stopPropagation()
                navigate('/create', { state: { focus: 'link' } })
              }}>
                <GifBoxOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(event) => {
                event.stopPropagation()
                navigate('/create', { state: { focus: 'content' } })
              }}>
                <FormatListBulletedRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(event) => {
                event.stopPropagation()
                navigate('/create', { state: { focus: 'link' } })
              }}>
                <PlaceOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {feedStatus === 'loading' && !posts.length ? (
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

      {posts.map((post) => (
        <ThreadCard
          key={post.id}
          post={post}
          currentUserId={currentUser.id}
          onLike={() => onLike(post.id)}
          onComment={() => onComment(post.id)}
          onRepost={() => onRepost(post.id)}
          onShare={() => onShare(post.id)}
          onOpenAuthor={() => navigate(`/profile/${post.username}`)}
        />
      ))}

      <CommentsDialog
        open={Boolean(selectedPost)}
        post={selectedPost}
        comments={comments}
        draft={commentDraft}
        onDraftChange={setCommentDraft}
        onClose={() => {
          setSelectedPost(null)
          setCommentDraft('')
        }}
        onSubmit={onSubmitComment}
        isSubmitting={commentStatus === 'loading'}
      />

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

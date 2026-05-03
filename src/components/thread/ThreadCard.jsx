import { useState } from 'react'
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'

function ActionIcon({ icon, count, active = false, onClick, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.4}>
      <IconButton
        size="small"
        aria-label={label}
        onClick={onClick}
        sx={{
          color: active ? 'secondary.main' : 'text.secondary',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.06)',
          },
        }}
      >
        {icon}
      </IconButton>
      <Typography variant="caption" color="text.secondary">
        {count}
      </Typography>
    </Stack>
  )
}

function ThreadCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onRepost,
  onShare,
  onDelete,
  onOpenAuthor,
}) {
  const [hasImageError, setHasImageError] = useState(false)
  const isLiked = post.likes.includes(currentUserId)
  const canDelete = typeof onDelete === 'function' && currentUserId === post.authorId
  const onMenuClick = canDelete ? onDelete : onShare
  const canOpenAuthor = typeof onOpenAuthor === 'function'

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar
          src={post.avatarUrl}
          onClick={canOpenAuthor ? onOpenAuthor : undefined}
          sx={{
            bgcolor: post.avatarColor,
            width: 42,
            height: 42,
            cursor: canOpenAuthor ? 'pointer' : 'default',
          }}
        >
          {post.author.slice(0, 1).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              onClick={canOpenAuthor ? onOpenAuthor : undefined}
              sx={{
                minWidth: 0,
                cursor: canOpenAuthor ? 'pointer' : 'default',
                '&:hover .thread-author-link': canOpenAuthor
                  ? {
                      color: 'secondary.main',
                    }
                  : undefined,
              }}
            >
              <Typography className="thread-author-link" fontWeight={700} noWrap>
                {post.author}
              </Typography>
              <Typography className="thread-author-link" variant="body2" color="text.secondary" noWrap>
                @{post.username}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {post.createdAt}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={onMenuClick}>
              <MoreHorizRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          {post.topic ? (
            <Chip
              label={post.topic}
              size="small"
              sx={{ mt: 1, mb: 1.25, bgcolor: 'rgba(0, 212, 184, 0.12)' }}
            />
          ) : null}

          <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
            {post.content}
          </Typography>

          {post.image && !hasImageError ? (
            <Box
              component="img"
              src={post.image}
              alt={`${post.author} thread visual`}
              onError={() => setHasImageError(true)}
              sx={{
                mt: 1.5,
                width: '100%',
                maxHeight: 420,
                objectFit: 'cover',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ) : post.image ? (
            <Box
              sx={{
                mt: 1.5,
                px: 1.4,
                py: 1.2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                This visual could not be loaded.
              </Typography>
            </Box>
          ) : null}

          {post.link ? (
            <Typography
              component="a"
              href={post.link}
              target="_blank"
              rel="noreferrer"
              sx={{ mt: 1.2, display: 'inline-block', color: 'secondary.main', textDecoration: 'none' }}
            >
              {post.link}
            </Typography>
          ) : null}

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.25 }}>
            <ActionIcon
              label="like thread"
              icon={
                isLiked ? (
                  <FavoriteRoundedIcon fontSize="small" />
                ) : (
                  <FavoriteBorderRoundedIcon fontSize="small" />
                )
              }
              count={post.likes.length}
              active={isLiked}
              onClick={onLike}
            />
            <ActionIcon
              label="comment thread"
              icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
              count={post.commentCount}
              onClick={onComment}
            />
            <ActionIcon
              label="repost thread"
              icon={<RepeatRoundedIcon fontSize="small" />}
              count={post.repostCount}
              onClick={onRepost}
            />
            <ActionIcon
              label="share thread"
              icon={<SendRoundedIcon fontSize="small" />}
              count={post.shareCount}
              onClick={onShare}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default ThreadCard

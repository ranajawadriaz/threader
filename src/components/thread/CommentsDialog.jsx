import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

function CommentsDialog({
  open,
  post,
  comments,
  draft,
  onDraftChange,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Replies</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.4}>
          {post ? (
            <Box>
              <Typography fontWeight={700}>{post.author}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.6, whiteSpace: 'pre-line' }}>
                {post.content}
              </Typography>
            </Box>
          ) : null}

          <TextField
            multiline
            minRows={3}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Write a reply"
          />

          <Stack spacing={1.2}>
            {comments.length ? (
              comments.map((comment) => (
                <Stack key={comment.id} direction="row" spacing={1.2} alignItems="flex-start">
                  <Avatar src={comment.avatarUrl} sx={{ bgcolor: comment.avatarColor, width: 36, height: 36 }}>
                    {comment.author.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Typography fontWeight={700}>{comment.author}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{comment.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comment.createdAt}
                      </Typography>
                    </Stack>
                    <Typography sx={{ mt: 0.4, whiteSpace: 'pre-line' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">No replies yet. Start the conversation.</Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting || !draft.trim()}>
          Reply
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommentsDialog
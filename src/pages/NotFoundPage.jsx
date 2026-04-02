import { Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.2}>
        <Typography variant="h4">Page not found</Typography>
        <Typography color="text.secondary">The page you requested does not exist.</Typography>
        <Button variant="contained" onClick={() => navigate('/home')}>
          Go home
        </Button>
      </Stack>
    </Paper>
  )
}

export default NotFoundPage

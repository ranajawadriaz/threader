import { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { activityItems } from '../data/mockData'

function ActivityPage() {
  const [tab, setTab] = useState('all')

  const filteredItems = useMemo(() => {
    if (tab === 'all') {
      return activityItems
    }

    return activityItems.filter((item) => item.type === tab)
  }, [tab])

  return (
    <Stack spacing={1.4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.4, sm: 2 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" sx={{ fontSize: { xs: 38, sm: 52 }, lineHeight: 1 }}>
            Activity
          </Typography>
          <NotificationsOffRoundedIcon sx={{ color: 'text.secondary' }} />
        </Stack>

        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mt: 1.5 }}>
          <Tab value="all" label="All" />
          <Tab value="follows" label="Follows" />
          <Tab value="conversations" label="Conversations" />
        </Tabs>
      </Paper>

      {filteredItems.map((item) => (
        <Paper
          elevation={0}
          key={item.id}
          sx={{
            p: 1.35,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="flex-start">
            <Avatar sx={{ bgcolor: item.avatarColor, width: 40, height: 40 }}>
              {item.displayName.slice(0, 1).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Typography fontWeight={700}>
                  {item.displayName}
                </Typography>
                {item.verified ? <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#1d9bf0' }} /> : null}
                <Typography color="text.secondary">{item.time}</Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton size="small">
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography color="text.secondary">{item.action}</Typography>
              <Typography sx={{ mt: 0.4 }}>{item.excerpt}</Typography>

              {item.previewImage ? (
                <Box
                  component="img"
                  src={item.previewImage}
                  alt="activity preview"
                  sx={{
                    mt: 1,
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    objectFit: 'cover',
                  }}
                />
              ) : null}

              {item.action === 'Follow suggestion' ? (
                <Button size="small" variant="contained" sx={{ mt: 1.1 }}>
                  Follow
                </Button>
              ) : (
                <Chip size="small" label="View" sx={{ mt: 1.1 }} />
              )}
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default ActivityPage

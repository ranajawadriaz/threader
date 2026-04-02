import { Box, Typography } from '@mui/material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'

function BrandMark({ compact = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: compact ? 34 : 42,
          height: compact ? 34 : 42,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: 'background.default',
          boxShadow: '0 10px 30px rgba(0, 212, 184, 0.25)',
        }}
      >
        <BoltRoundedIcon fontSize={compact ? 'small' : 'medium'} />
      </Box>

      {!compact ? (
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 800 }}>
            Threader
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Social in motion
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

export default BrandMark

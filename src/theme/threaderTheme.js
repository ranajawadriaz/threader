import { createTheme } from '@mui/material/styles'

export const buildThreaderTheme = (mode) => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#f8f9fb' : '#101217',
      },
      secondary: {
        main: isDark ? '#00d4b8' : '#0a8f7d',
      },
      background: {
        default: isDark ? '#050608' : '#eff2f7',
        paper: isDark ? '#0f1116' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f3f6ff' : '#11141b',
        secondary: isDark ? '#8f97a8' : '#4a5568',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)',
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily: 'Space Grotesk, Sora, sans-serif',
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(circle at 12% 10%, rgba(0, 186, 255, 0.12), transparent 30%), radial-gradient(circle at 82% 14%, rgba(255, 255, 255, 0.07), transparent 34%), linear-gradient(180deg, #050608 0%, #090b10 100%)'
              : 'radial-gradient(circle at 12% 10%, rgba(16, 24, 40, 0.08), transparent 32%), radial-gradient(circle at 90% 20%, rgba(0, 173, 150, 0.14), transparent 32%), linear-gradient(180deg, #f3f6fc 0%, #edf2f9 100%)',
            backgroundAttachment: 'fixed',
          },
          '*::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.14)'
              : 'rgba(17, 20, 27, 0.2)',
            borderRadius: '999px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
          },
        },
      },
    },
  })
}

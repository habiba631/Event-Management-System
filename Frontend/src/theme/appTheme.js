import { createTheme } from '@mui/material/styles'

const roleAvatarGradients = {
  customer: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  organizer: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  admin: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
}

export function createAppTheme() {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#4338ca',
        light: '#6366f1',
        dark: '#312e81',
      },
      secondary: {
        main: '#0f766e',
        light: '#14b8a6',
        dark: '#115e59',
      },
      error: {
        main: '#e11d48',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#3b82f6',
      },
      success: {
        main: '#10b981',
      },
      background: {
        default: '#f4f6fb',
        paper: 'rgba(255, 255, 255, 0.94)',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundAttachment: 'fixed',
            backgroundImage:
              'radial-gradient(1100px 520px at 8% -8%, rgba(67, 56, 202, 0.2), transparent 52%),' +
              'radial-gradient(880px 480px at 96% 4%, rgba(15, 118, 110, 0.16), transparent 48%),' +
              'radial-gradient(700px 420px at 50% 100%, rgba(217, 119, 6, 0.09), transparent 42%),' +
              'linear-gradient(185deg, #eef2ff 0%, #faf8f5 48%, #ecfdf5 100%)',
            backgroundColor: '#f8fafc',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            boxShadow: '0 6px 28px rgba(15, 23, 42, 0.055)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
          },
        },
      },
    },
  })
}

export { roleAvatarGradients }

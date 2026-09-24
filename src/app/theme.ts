import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#176b5b', dark: '#104c43', contrastText: '#fff' },
    secondary: { main: '#d9763d' },
    background: { default: '#f5f4ef', paper: '#fff' },
    warning: { main: '#b56a12' },
    error: { main: '#b5363e' },
    success: { main: '#39865c' },
    info: { main: '#3575a8' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 750, letterSpacing: '-0.04em' },
    h2: { fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 750, letterSpacing: '-0.025em' },
    h3: { fontSize: '1.2rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 44, borderRadius: 12 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #e5e2d8', boxShadow: '0 8px 30px rgba(35,52,47,.06)' } } },
    MuiTextField: { defaultProps: { size: 'small' } },
  },
})

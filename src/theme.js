import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6fa5',
      light: '#7b9ed1',
      dark: '#1a447b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
      contrastText: '#000000',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  typography: {
    fontFamily: [
      '"Roboto"',
      '"Helvetica"',
      '"Arial"',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
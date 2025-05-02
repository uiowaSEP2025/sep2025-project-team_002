import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Define custom color palette
const colors = {
  primary: {
    main: '#3a86ff',
    light: '#61a0ff',
    dark: '#2a6bc9',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff006e',
    light: '#ff4b93',
    dark: '#c5004d',
    contrastText: '#ffffff',
  },
  success: {
    main: '#06d6a0',
    light: '#52e3be',
    dark: '#00a376',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffbe0b',
    light: '#ffce4b',
    dark: '#d99e00',
    contrastText: '#000000',
  },
  error: {
    main: '#ef476f',
    light: '#f47a97',
    dark: '#b8264a',
    contrastText: '#ffffff',
  },
  info: {
    main: '#8338ec',
    light: '#a168f1',
    dark: '#6020b8',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    dark: '#1a1a2e',
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#4a4e69',
    disabled: '#9a9ca5',
  },
};

// Create the theme
const theme = createTheme({
  palette: {
    ...colors,
    mode: 'light',
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 12px 24px rgba(0, 0, 0, 0.05)',
    '0px 16px 32px rgba(0, 0, 0, 0.05)',
    '0px 20px 40px rgba(0, 0, 0, 0.05)',
    ...Array(17).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '8px 20px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: alpha(colors.primary.main, 0.9),
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(colors.text.primary, 0.1),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 30,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          maxWidth: '100%',
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          maxWidth: '100%',
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          maxWidth: '100%',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
          maxWidth: '100%',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: 'fixed',
          width: '100%',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
  },
});

export default theme;

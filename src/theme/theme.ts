import { createTheme } from '@mui/material/styles';

// Brand Colors (from src/index.css)
// background: #051426 (213 77% 8%)
// card: #0A2647 (212 75% 16%)
// primary: #2C74B3 (208 60% 44%)
// muted: #0f3057 (213 70% 20%)
// accent: #144272 (211 70% 26%)
// border: #1e4b85 (214 63% 32%)

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2C74B3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#144272', // Using accent as secondary
            contrastText: '#ffffff',
        },
        background: {
            default: '#051426',
            paper: '#0A2647', // Card color
        },
        text: {
            primary: '#ffffff',
            secondary: '#94A3B8', // Muted foreground approximation
        },
        divider: '#1e4b85', // Border color
        error: {
            main: '#ef4444', // Tailwind destructive
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8, // --radius: 0.75rem (12px) but 8 is standard MUI. Let's stick to MUI standard or match? 12px is nice.
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    border: '1px solid #1e4b85',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default MUI overlay in dark mode to keep flat look
                }
            }
        }
    },
});

export default theme;

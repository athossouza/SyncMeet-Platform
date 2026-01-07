import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
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
            main: '#ef4444',
        }
    },
    typography: {
        fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif', // Match Light Theme Preference (Roboto First)
        h1: { fontWeight: 700 }, // Keep original headers
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 16, // Synced with Light Theme
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '24px', // Pill shape synced
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.3)', // Subtle shadow on hover for dark mode
                    }
                },
                containedPrimary: {
                    backgroundColor: '#2C74B3',
                    color: '#ffffff',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px', // Synced
                    border: '1px solid #1e4b85',
                    backgroundColor: '#0A2647',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default MUI overlay
                    boxShadow: 'none',
                },
                elevation1: {
                    border: '1px solid #1e4b85', // Replace shadow with border in dark mode
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '24px', // Synced
                    '&.Mui-selected': {
                        backgroundColor: '#144272', // Secondary
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#1e4b85',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#ffffff',
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: '#94A3B8',
                },
            },
        },
    },
});

export default darkTheme;

import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0b57d0', // Google Blue
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#c2e7ff', // Pastel Blue (Active States)
            contrastText: '#001d35',
        },
        background: {
            default: '#F6F8FC', // Light Blue/Grey tint
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1f1f1f',
            secondary: '#444746',
        },
        divider: '#747775',
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 16, // Global shape
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '24px', // Pill shape
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#0b57d0',
                    color: '#ffffff',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: 'none', // Flat design
                    border: '1px solid #e0e2e7', // Subtle border for definition
                },
                elevation1: {
                    boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '24px', // Pill shape for list items (Sidebar)
                    '&.Mui-selected': {
                        backgroundColor: '#c2e7ff',
                        color: '#001d35',
                        '&:hover': {
                            backgroundColor: '#b3d7ef',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#001d35',
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: '#444746',
                },
            },
        },
    },
});

export default lightTheme;

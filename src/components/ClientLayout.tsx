import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Container,
    Divider,
    Stack
} from '@mui/material'
import { Logout as LogoutIcon, Dashboard as DashboardIcon } from '@mui/icons-material'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { signOut, profile } = useAuth()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        handleMenuClose()
        signOut()
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar position="sticky" elevation={0} sx={{
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
                backdropFilter: 'blur(8px)',
                background: 'rgba(5, 20, 38, 0.8)' // transparent background.default
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/portal"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                textDecoration: 'none',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
                            Sync Meet
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            {profile?.role === 'admin' && (
                                <Button
                                    component={RouterLink}
                                    to="/admin"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DashboardIcon />}
                                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                                >
                                    Painel Admin
                                </Button>
                            )}

                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                <Avatar
                                    src={profile?.avatar_url || undefined}
                                    alt={profile?.email || ''}
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                >
                                    {profile?.email?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Stack>

                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleMenuClose}
                            onClick={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                        borderLeft: '1px solid',
                                        borderTop: '1px solid',
                                        borderColor: 'divider'
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {profile?.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {profile?.role}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                Sair
                            </MenuItem>
                        </Menu>

                    </Toolbar>
                </Container>
            </AppBar>

            {/* Main Content */}
            <Container component="main" maxWidth="xl" sx={{ flex: 1, py: 4 }}>
                {children}
            </Container>
        </Box>
    )
}

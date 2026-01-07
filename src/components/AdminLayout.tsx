import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useThemeToggle } from '@/context/ThemeContext'
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Button,
    Snackbar,
    Alert,
    CircularProgress,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material'
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Group as GroupIcon, // Users icon equivalent
    Logout as LogoutIcon,
    Sync as SyncIcon,
    ArrowBack as ArrowBackIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material'

const DRAWER_WIDTH = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { signOut } = useAuth()
    const { toggleTheme, mode } = useThemeToggle()
    const location = useLocation()
    const [isSyncing, setIsSyncing] = useState(false)
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: 'success' | 'error' | 'info' | 'warning';
        message: string;
    }>({ open: false, severity: 'info', message: '' });

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/sync', { method: 'POST' })
            if (res.ok) {
                setSnackbar({
                    open: true,
                    severity: 'success',
                    message: 'Sincronização Concluída: Os dados foram atualizados com sucesso.'
                })
            } else {
                throw new Error('Falha na sincronização')
            }
        } catch (error) {
            console.error(error)
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'Erro na Sincronização: Verifique se o servidor de sync está rodando.'
            })
        } finally {
            setIsSyncing(false)
        }
    }

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
        { name: 'Organizações', href: '/admin/organizations', icon: <BusinessIcon /> },
        { name: 'Todas as Sessões', href: '/admin/sessions', icon: <GroupIcon /> },
    ]

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar (Permanent Drawer) */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' },
                }}
            >
                <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center">
                        <DashboardIcon sx={{ color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="text.primary" noWrap>
                            Sync Meet
                        </Typography>
                    </Stack>
                    <Tooltip title={mode === 'dark' ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}>
                        <IconButton onClick={toggleTheme} size="small">
                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ overflow: 'auto', flex: 1, py: 2 }}>
                    <List>
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        component={RouterLink}
                                        to={item.href}
                                        selected={isActive}
                                        sx={{
                                            mx: 1,
                                            borderRadius: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.05)'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={1}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color={isSyncing ? "primary" : "success"}
                            startIcon={isSyncing ? <CircularProgress size={20} /> : <SyncIcon />}
                            onClick={handleSync}
                            disabled={isSyncing}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                        </Button>

                        <Button
                            fullWidth
                            component={RouterLink}
                            to="/portal"
                            startIcon={<ArrowBackIcon />}
                            color="inherit"
                            sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none' }}
                        >
                            Voltar ao Portal
                        </Button>

                        <Button
                            fullWidth
                            startIcon={<LogoutIcon />}
                            color="error"
                            onClick={signOut}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            Sair
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', maxHeight: '100vh' }}>
                {children}
            </Box>

            {/* Global Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

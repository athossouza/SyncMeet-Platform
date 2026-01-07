import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    TextField,
    Typography,
    Stack,
    CircularProgress,
    InputAdornment,
    Alert
} from '@mui/material'
import {
    Email as EmailIcon,
    Lock as LockIcon,
    ArrowForward as ArrowForwardIcon,
    CloudUpload as CloudUploadIcon, // Upload icon
    PlaylistPlay as PlaylistIcon, // Playlist icon
    TimerOff as TimerOffIcon // Zero time/operation icon
} from '@mui/icons-material'
import { Footer } from '@/components/Footer'
import { useThemeToggle } from '@/context/ThemeContext'
import {
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material'
import {
    IconButton,
    Tooltip
} from '@mui/material'

export default function LandingPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { toggleTheme, mode } = useThemeToggle()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            navigate('/')

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Falha ao entrar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Theme Toggle */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <Tooltip title={mode === 'dark' ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
            {/* Main Hero Content */}
            <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
                <Grid container spacing={8} alignItems="center">

                    {/* Left Column: Branding Text */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: { xs: 'center', lg: 'left' } }}>
                            <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 50,
                                border: '1px solid',
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover',
                                color: 'primary.light',
                                mb: 3
                            }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Portal do Cliente
                                </Typography>
                            </Box>

                            <Typography variant="h2" component="h1" fontWeight={800} sx={{ mb: 2, lineHeight: 1.1 }}>
                                Sua Evolução,<br />
                                <Box component="span" sx={{ color: 'primary.main' }}>Centralizada e Automatizada</Box>
                            </Typography>

                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                                Chega de informações dispersas. Documentos, gravações e planos de ação sincronizados em uma única plataforma inteligente.
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Right Column: Login Card */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card sx={{
                            maxWidth: 450,
                            mx: 'auto',
                            bgcolor: 'background.paper',
                            backgroundImage: 'none',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 4,
                            p: 2
                        }}>
                            <CardContent>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Login
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Entre com suas credenciais de acesso
                                </Typography>

                                <form onSubmit={handleLogin}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="E-mail"
                                            variant="outlined"
                                            fullWidth
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon color="action" />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <TextField
                                            label="Senha"
                                            variant="outlined"
                                            fullWidth
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon color="action" />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        {error && (
                                            <Alert severity="error" variant="outlined">
                                                {error}
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                                            sx={{ py: 1.5, fontSize: '1rem' }}
                                        >
                                            {loading ? 'Acessando...' : 'Acessar Portal'}
                                        </Button>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Value Proposition Section */}
            <Box sx={{
                py: 10,
                bgcolor: 'background.paper', // Slightly lighter than default background
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            O que o Sync Meet resolve?
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Uma plataforma unificada para garantir que a estratégia desenhada nas mentorias seja executada com precisão.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <CloudUploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
                                title: 'Upload Automatizado',
                                desc: 'Adeus upload manual. Suas gravações vão direto para o YouTube como "Não Listado". Zero consumo de espaço.'
                            },
                            {
                                icon: <PlaylistIcon sx={{ fontSize: 32, color: 'secondary.main' }} />,
                                title: 'Playlists Organizadas',
                                desc: 'O sistema cria e alimenta playlists no YouTube automaticamente por cliente. O mentor não perde tempo organizando pastas.'
                            },
                            {
                                icon: <TimerOffIcon sx={{ fontSize: 32, color: 'success.main' }} />,
                                title: 'Operação Zero',
                                desc: 'Elimine o gargalo operacional. O mentor foca 100% na entrega e na estratégia, enquanto o Sync Meet cuida da logística.'
                            }
                        ].map((card, idx) => (
                            <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                <Card sx={{
                                    height: '100%',
                                    bgcolor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: 'primary.main'
                                    }
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3
                                        }}>
                                            {card.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {card.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Footer />
        </Box>
    )
}

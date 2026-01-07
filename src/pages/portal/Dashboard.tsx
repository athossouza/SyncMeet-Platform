import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { useAuth } from '@/context/AuthContext'
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography,
    Button,
    Divider,
    Paper,
    useTheme
} from '@mui/material'
import {
    CalendarToday as CalendarIcon,
    VideoLibrary as VideoIcon,
    Description as FileIcon,
    ArrowForward as ArrowForwardIcon,
    Business as BusinessIcon,
    Videocam as MeetIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ClientDashboard() {
    const { profile } = useAuth()
    const theme = useTheme()

    const { data: sessions, isLoading, error } = useQuery({
        queryKey: ['client-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*, organizations (name)')
                .order('date', { ascending: false })

            if (error) throw error
            return data as Session[]
        },
    })

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>Loading...</Box>
    if (error) return <Typography color="error">Erro ao carregar sessões.</Typography>

    // Group sessions by Month Year
    const groupedSessions: Record<string, Session[]> = {}

    sessions?.forEach(session => {
        const monthYear = format(new Date(session.date), 'MMMM yyyy', { locale: ptBR })
        const formattedGroup = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

        if (!groupedSessions[formattedGroup]) {
            groupedSessions[formattedGroup] = []
        }
        groupedSessions[formattedGroup].push(session)
    })

    const groups = Object.keys(groupedSessions)

    return (
        <Box>
            <Box mb={6}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Minhas Sessões
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Acesse suas mentorias gravadas e documentos de apoio.
                </Typography>
            </Box>

            {sessions?.length === 0 ? (
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Typography color="text.secondary">Nenhuma sessão encontrada.</Typography>
                </Paper>
            ) : (
                groups.map(group => (
                    <Box key={group} mb={6}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                {group}
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        </Stack>

                        <Grid container spacing={3}>
                            {groupedSessions[group].map((session) => {
                                const isFuture = new Date(session.date) > new Date()
                                const hasContent = !!session.video_embed_url || !!session.doc_embed_url || !!session.summary_html
                                const isPastEmpty = !isFuture && !hasContent

                                // --- 1. SESSÃO PASSADA SEM CONTEÚDO ---
                                if (isPastEmpty) {
                                    return (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
                                            <Card sx={{
                                                height: '100%',
                                                opacity: 0.6,
                                                bgcolor: 'background.paper',
                                                transition: 'opacity 0.2s',
                                                '&:hover': { opacity: 1 }
                                            }}>
                                                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                    <Stack direction="row" justifyContent="space-between" mb={2}>
                                                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary' }}>
                                                            <CalendarIcon fontSize="small" />
                                                        </Box>
                                                        <Chip label="Sessão Extra" size="small" sx={{ bgcolor: 'action.selected', color: 'text.disabled', fontSize: '0.7rem' }} />
                                                    </Stack>

                                                    <Typography variant="h6" fontWeight="bold" gutterBottom color="text.secondary">
                                                        {session.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                                        {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                                    </Typography>

                                                    {profile?.role === 'admin' && session.organizations?.name && (
                                                        <Chip
                                                            icon={<BusinessIcon sx={{ fontSize: '12px !important' }} />}
                                                            label={session.organizations.name}
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            sx={{ alignSelf: 'flex-start', mb: 2, height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    )}

                                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="caption" color="text.disabled">
                                                            Esta sessão não possui gravação.
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )
                                }

                                // --- 2. SESSÃO FUTURA ---
                                if (isFuture) {
                                    return (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    bgcolor: (theme) => theme.palette.mode === 'light' ? '#eff6ff' : 'rgba(44, 116, 179, 0.05)',
                                                    borderColor: 'primary.main',
                                                    borderWidth: 1,
                                                }}
                                            >
                                                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                    <Stack direction="row" justifyContent="space-between" mb={2}>
                                                        <Box sx={{
                                                            p: 1,
                                                            borderRadius: 2, // Gmail standard for small shapes
                                                            bgcolor: 'primary.main',
                                                            color: 'primary.contrastText',
                                                            display: 'flex'
                                                        }}>
                                                            <CalendarIcon fontSize="small" />
                                                        </Box>
                                                        <Chip
                                                            label="Agendada"
                                                            size="small"
                                                            color="primary"
                                                            variant={theme.palette.mode === 'light' ? 'filled' : 'outlined'}
                                                            sx={{
                                                                fontWeight: 600,
                                                                bgcolor: theme.palette.mode === 'light' ? 'primary.light' : undefined,
                                                                color: theme.palette.mode === 'light' ? 'primary.contrastText' : undefined
                                                            }}
                                                        />
                                                    </Stack>

                                                    <Box mb={2}>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                                                            {session.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                                                            {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                                        </Typography>
                                                    </Box>

                                                    {/* Admin Organization Tag */}
                                                    {profile?.role === 'admin' && session.organizations?.name && (
                                                        <Box mb={2}>
                                                            <Chip
                                                                icon={<BusinessIcon sx={{ fontSize: '12px !important' }} />}
                                                                label={session.organizations.name}
                                                                size="small"
                                                                color="primary"
                                                                sx={{ height: 24, fontWeight: 500 }}
                                                            />
                                                        </Box>
                                                    )}

                                                    <Box mt="auto">
                                                        {session.meet_link ? (
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<MeetIcon />}
                                                                href={session.meet_link}
                                                                target="_blank"
                                                                disableElevation
                                                                sx={{
                                                                    py: 1.2,
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Entrar no Meet
                                                            </Button>
                                                        ) : (
                                                            <Paper
                                                                variant="outlined"
                                                                sx={{
                                                                    py: 1,
                                                                    textAlign: 'center',
                                                                    bgcolor: 'action.hover',
                                                                    borderStyle: 'dashed'
                                                                }}
                                                            >
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Link não disponível ainda
                                                                </Typography>
                                                            </Paper>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )
                                }

                                // --- 3. SESSÃO PADRÃO ---
                                return (
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
                                        <Card sx={{
                                            height: '100%',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8]
                                            }
                                        }}>
                                            <CardActionArea component={RouterLink} to={`/portal/session/${session.id}`} sx={{ height: '100%' }}>
                                                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>

                                                    <Stack direction="row" justifyContent="space-between" mb={3}>
                                                        <Box sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: session.video_embed_url ? 'rgba(52, 211, 153, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                                            color: session.video_embed_url ? '#34d399' : '#38bdf8'
                                                        }}>
                                                            {session.video_embed_url ? <VideoIcon fontSize="small" /> : <FileIcon fontSize="small" />}
                                                        </Box>
                                                        <Chip
                                                            label={session.video_embed_url ? "Gravada" : "Nota"}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                                color: 'text.secondary',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Stack>

                                                    <Box mb={2}>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            {session.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ flex: 1, mb: 3 }}>
                                                        {session.summary_text && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 3,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                {session.summary_text}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    <Divider sx={{ mb: 2 }} />

                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" spacing={1}>
                                                            {profile?.role === 'admin' && session.organizations?.name && (
                                                                <Chip
                                                                    icon={<BusinessIcon sx={{ fontSize: '12px !important' }} />}
                                                                    label={session.organizations.name}
                                                                    size="small"
                                                                    color="warning"
                                                                    variant="outlined"
                                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                                />
                                                            )}
                                                            {/* Material Tag if needed */}
                                                        </Stack>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: '0.8rem', fontWeight: 600 }}>
                                                            {!!session.video_embed_url ? "Assistir" : "Acessar"} <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                                                        </Box>
                                                    </Stack>

                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Box>
                ))
            )}
        </Box>
    )
}

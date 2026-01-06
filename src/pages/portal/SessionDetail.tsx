import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, Profile } from '@/types'
import {
    Box,
    Button,
    Grid,
    Stack,
    Typography,
    Paper,
    Tab,
    Tabs,
    IconButton,
    Avatar,
    Chip,
    Divider,
    Collapse,
    CircularProgress
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    CalendarToday as CalendarIcon,
    AccessTime as ClockIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Help as HelpIcon,
    Videocam as MeetIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CustomVideoPlayer from '@/components/CustomVideoPlayer'
import SessionEditor from '@/components/SessionEditor'

// Helper to extract ID from URL if youtube_video_id is missing
const extractYoutubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export default function SessionDetail() {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<'notes' | 'transcription'>('notes')
    const [isNotesExpanded, setIsNotesExpanded] = useState(true) // Default to true for better visibility
    const [isEditing, setIsEditing] = useState(false)

    // Fetch Session
    const { data: session, isLoading } = useQuery({
        queryKey: ['session', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', id!)
                .single()

            if (error) throw error
            return data as Session
        },
        enabled: !!id,
    })

    // Fetch Current User Profile to check Admin
    const { data: userProfile } = useQuery({
        queryKey: ['hasAdminAccess'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            return profile as Profile
        }
    })

    const isAdmin = userProfile?.role === 'admin' || userProfile?.email === 'athos@atveza.com'

    const handleSaveNotes = async (newHtml: string) => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .update({ summary_html: newHtml })
                .eq('id', id!)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                console.warn("Save successful but NO rows updated. RLS Policy likely blocking update.")
                alert("Atenção: A alteração não foi salva. Você pode não ter permissão de edição (RLS).")
                return
            }

            queryClient.invalidateQueries({ queryKey: ['session', id] })
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to save notes:', error)
            alert('Erro ao salvar as notas.')
        }
    }

    const contentParts = useMemo(() => {
        if (!session?.summary_html) return { notes: null, transcript: null }

        // Find the "Transcrição" Header block
        const splitRegex = /<p class="title"[^>]*>(?:(?!<\/p>)[\s\S])*Transcri(?:ç|&ccedil;)(?:ã|&atilde;)o[\s\S]*?<\/p>/i
        const match = session.summary_html.match(splitRegex)

        if (match && match.index !== undefined) {
            return {
                notes: session.summary_html.substring(0, match.index),
                transcript: session.summary_html.substring(match.index)
            }
        }

        return { notes: session.summary_html, transcript: null }
    }, [session?.summary_html])

    if (isLoading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <CircularProgress />
        </Box>
    )

    if (!session) return <Typography>Sessão não encontrada</Typography>

    // Helper to format duration
    const formatDuration = (seconds?: number, start?: string, end?: string) => {
        if (seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60
            if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
            return `${minutes}m ${secs}s`
        }
        if (start && end) {
            const diff = new Date(end).getTime() - new Date(start).getTime()
            const mins = Math.floor(diff / 60000)
            return `~${mins} min (Agendado)`
        }
        return '--'
    }

    const hasVideo = !!(session.youtube_video_id || session.video_embed_url)

    // -- Sub-Components (Inline for easier state access) --

    const VideoSection = (
        <Box sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            bgcolor: 'black',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 3
        }}>
            {hasVideo ? (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <CustomVideoPlayer
                        videoId={session.youtube_video_id || extractYoutubeId(session.video_embed_url) || ''}
                    />
                </Box>
            ) : (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: 'text.disabled' }}
                >
                    <Typography>Nenhum vídeo disponível</Typography>
                </Stack>
            )}
        </Box>
    )

    const DetailsSection = (
        <Paper
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper', // Ensure distinct card background
                borderColor: 'divider'
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                    Detalhes da Sessão
                </Typography>
            </Box>
            <Stack spacing={3} sx={{ p: 3, flex: 1, overflowY: 'auto' }}>

                {/* Date & Time Grid */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CalendarIcon fontSize="small" sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Data
                                </Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <ClockIcon fontSize="small" sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Horário
                                </Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="medium" color="text.primary">
                                {format(new Date(session.date), "HH:mm", { locale: ptBR })}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider />

                {/* Duration */}
                <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Duração Real
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                        {formatDuration(session.duration_seconds, session.date, session.end_date)}
                    </Typography>
                </Box>

                <Divider />

                {/* Attendees */}
                {session.attendees && session.attendees.length > 0 && (
                    <Box flex={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                Participantes
                            </Typography>
                            <Chip label={session.attendees.length} size="small" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Stack>

                        <Stack spacing={1.5} mt={2}>
                            {session.attendees.map((attendee, index) => {
                                const isAccepted = attendee.responseStatus === 'accepted'
                                const initial = (attendee.displayName || attendee.email).charAt(0).toUpperCase()

                                return (
                                    <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
                                        <Box position="relative">
                                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'background.default', color: 'text.primary', border: '1px solid', borderColor: 'divider' }}>
                                                {initial}
                                            </Avatar>
                                            {isAccepted ? (
                                                <CheckCircleIcon sx={{ position: 'absolute', bottom: -2, right: -2, fontSize: 14, color: 'success.main', bgcolor: 'background.paper', borderRadius: '50%' }} />
                                            ) : attendee.responseStatus === 'needsAction' && (
                                                <HelpIcon sx={{ position: 'absolute', bottom: -2, right: -2, fontSize: 14, color: 'warning.main', bgcolor: 'background.paper', borderRadius: '50%' }} />
                                            )}
                                        </Box>
                                        <Box minWidth={0}>
                                            <Typography variant="body2" fontWeight={500} noWrap title={attendee.displayName || attendee.email} color="text.primary">
                                                {attendee.displayName || attendee.email.split('@')[0]}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {isAccepted ? 'Confirmado' : 'Convidado'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    </Box>
                )}

                {/* Meet Link Fallback */}
                {!hasVideo && session.meet_link && (
                    <Box pt={2}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<MeetIcon />}
                            href={session.meet_link}
                            target="_blank"
                            sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                        >
                            Acessar Sala do Meet
                        </Button>
                    </Box>
                )}
            </Stack>
        </Paper>
    )

    const NotesSection = (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box
                onClick={() => hasVideo && setIsNotesExpanded(!isNotesExpanded)}
                sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderBottom: isNotesExpanded ? '1px solid' : 'none',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: hasVideo ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                    '&:hover': hasVideo ? { bgcolor: 'action.selected' } : {}
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 0.5, bgcolor: 'primary.main', borderRadius: 0.5, color: 'primary.contrastText', display: 'flex' }}>
                        <DownloadIcon fontSize="small" sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        Notas & Resumo
                    </Typography>
                    {hasVideo && (
                        <Typography variant="caption" color="text.secondary">
                            {isNotesExpanded ? '(Clique para esconder)' : '(Clique para expandir)'}
                        </Typography>
                    )}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                    {isAdmin && (isNotesExpanded || !hasVideo) && (
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}

                    {(isNotesExpanded || !hasVideo) && contentParts.transcript && !isEditing && (
                        <Box onClick={(e) => e.stopPropagation()}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, val) => setActiveTab(val)}
                                sx={{ minHeight: 32, '.MuiTab-root': { minHeight: 32, fontSize: '0.75rem', py: 0.5 } }}
                                indicatorColor="primary"
                            >
                                <Tab label="Anotações" value="notes" />
                                <Tab label="Transcrição" value="transcription" />
                            </Tabs>
                        </Box>
                    )}

                    {hasVideo && (isNotesExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
                </Stack>
            </Box>

            <Collapse in={isNotesExpanded || !hasVideo}>
                <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: 400 }}>
                    {isEditing ? (
                        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                            <SessionEditor
                                content={session.summary_html || ''}
                                onSave={handleSaveNotes}
                                onCancel={() => setIsEditing(false)}
                            />
                        </Box>
                    ) : session.summary_html ? (
                        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                            {/* "Paper" Document Design for Notes */}
                            <Paper
                                elevation={3}
                                sx={{
                                    bgcolor: '#ffffff', // White paper look
                                    color: '#1e293b', // Slate-800 for text (high contrast on white)
                                    p: { xs: 3, md: 5 }, // Generous padding like a document
                                    borderRadius: 1,
                                    minHeight: '60vh',
                                    typography: 'body1',
                                    '& *': { color: 'inherit !important' }, // Force distinct color
                                    '& h1, & h2, & h3, & h4, & h5, & h6': { color: '#0f172a !important', my: 2, fontWeight: 700 }, // Slate-900 headers
                                    '& p': { mb: 2, lineHeight: 1.7 },
                                    '& ul, & ol': { pl: 3, mb: 2 },
                                    '& li': { mb: 0.5 },
                                    '& strong, & b': { fontWeight: 'bold', color: '#0f172a !important' },
                                    '& a': { color: '#2563eb !important', textDecoration: 'underline' }, // Blue-600 links
                                    '& blockquote': { borderLeft: '4px solid #cbd5e1', pl: 2, color: '#475569 !important', fontStyle: 'italic' }
                                }}
                            >
                                <Box
                                    dangerouslySetInnerHTML={{
                                        __html: activeTab === 'notes' ? contentParts.notes! : contentParts.transcript!
                                    }}
                                />
                            </Paper>
                        </Box>
                    ) : session.doc_embed_url ? (
                        <iframe
                            src={session.doc_embed_url}
                            width="100%"
                            height="800px"
                            title="Session Document"
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <Stack justifyContent="center" alignItems="center" height={300} color="text.secondary">
                            <Typography>Nenhum documento anexado a esta sessão.</Typography>
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Paper>
    )

    return (
        <Box pb={8}>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    component={RouterLink}
                    to="/portal"
                    sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
                >
                    Voltar
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {session.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {format(new Date(session.date), "PPPP", { locale: ptBR })}
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                {hasVideo ? (
                    <>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            {VideoSection}
                        </Grid>
                        <Grid size={{ xs: 12, lg: 4 }}>
                            {DetailsSection}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            {NotesSection}
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            {NotesSection}
                        </Grid>
                        <Grid size={{ xs: 12, lg: 4 }} sx={{ height: 'fit-content' }}>
                            {DetailsSection}
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    )
}

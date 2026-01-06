import { useState } from 'react'
import { SessionScheduler } from "@/components/SessionScheduler"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Organization, Session } from '@/types'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Stack,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Snackbar
} from '@mui/material'
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    VideoLibrary as VideoIcon
} from '@mui/icons-material'
import SessionEditor from '@/components/SessionEditor'

export default function AdminSessions() {
    const [isOpen, setIsOpen] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)

    const [newItem, setNewItem] = useState({
        title: '',
        date: '',
        end_date: '',
        organization_id: '',
        video_embed_url: '',
        summary_text: '',
        summary_html: '',
        attendees_text: ''
    })

    // Snackbar State (Replaces AlertBanner)
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: 'success' | 'error' | 'warning' | 'info';
        message: string;
    }>({ open: false, severity: 'info', message: '' });

    const queryClient = useQueryClient()

    // Fetch Sessions
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['admin-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select(`*, organizations (name)`)
                .order('date', { ascending: false })
            if (error) throw error
            return data as Session[]
        },
    })

    // Fetch Orgs
    const { data: orgs } = useQuery({
        queryKey: ['organizations-list'],
        queryFn: async () => {
            const { data } = await supabase.from('organizations').select('id, name')
            return data as Organization[]
        },
    })

    // Helper to parse emails
    const parseAttendees = (text: string) => {
        if (!text) return []
        const emails = text.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.length > 0)
        return emails.map(email => ({
            email,
            responseStatus: 'needsAction'
        }))
    }

    // Validation
    const validateForm = () => {
        if (!newItem.organization_id) {
            setSnackbar({ open: true, severity: 'error', message: 'Selecione uma organização.' })
            return false
        }
        if (!newItem.title) {
            setSnackbar({ open: true, severity: 'error', message: 'O título é obrigatório.' })
            return false
        }
        if (!newItem.date) {
            setSnackbar({ open: true, severity: 'error', message: 'A data é obrigatória.' })
            return false
        }

        const parsedAttendees = parseAttendees(newItem.attendees_text)
        if (parsedAttendees.length === 0) {
            setSnackbar({ open: true, severity: 'error', message: 'A sessão deve ter pelo menos um participante (e-mail).' })
            return false
        }
        // Simplified Logic: Video URL is strictly YouTube if present
        if (newItem.video_embed_url) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
            if (!youtubeRegex.test(newItem.video_embed_url)) {
                setSnackbar({ open: true, severity: 'error', message: 'URL do vídeo inválida (Use YouTube).' })
                return false
            }
        } else {
            // Require Summary if Video is missing
            const hasSummary = newItem.summary_html && newItem.summary_html !== '<p></p>'
            if (!hasSummary) {
                setSnackbar({ open: true, severity: 'error', message: 'Vídeo ou Resumo são obrigatórios.' })
                return false;
            }
        }

        return true
    }

    // Create Session Mutation
    const createSession = useMutation({
        mutationFn: async (data: typeof newItem) => {
            const payload = {
                title: data.title,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                organization_id: data.organization_id,
                video_embed_url: data.video_embed_url || null,
                summary_text: data.summary_text || null,
                summary_html: data.summary_html || null,
                attendees: parseAttendees(data.attendees_text)
            }
            const { error } = await supabase.from('sessions').insert(payload)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setIsOpen(false)
            resetForm()
            fetch('/api/ai-summary', { method: 'POST' }).catch(console.error)
            setSnackbar({ open: true, severity: 'success', message: 'Sessão criada com sucesso!' })
        },
        onError: (err: any) => {
            setSnackbar({ open: true, severity: 'error', message: err.message || 'Erro ao criar sessão' })
        }
    })

    // Update Session Mutation
    const updateSession = useMutation({
        mutationFn: async (data: typeof newItem & { id: string }) => {
            const { error } = await supabase.from('sessions').update({
                title: data.title,
                date: new Date(data.date).toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                organization_id: data.organization_id,
                video_embed_url: data.video_embed_url,
                summary_text: data.summary_text,
                summary_html: data.summary_html,
                attendees: parseAttendees(data.attendees_text)
            }).eq('id', data.id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setIsOpen(false)
            resetForm()
            setSnackbar({ open: true, severity: 'success', message: 'Sessão atualizada!' })
        },
        onError: (err: any) => {
            setSnackbar({ open: true, severity: 'error', message: err.message || 'Erro ao atualizar' })
        }
    })

    // Delete Session
    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('sessions').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setSnackbar({ open: true, severity: 'success', message: 'Sessão excluída.' })
        }
    })

    const resetForm = () => {
        setIsEdit(false)
        setEditId(null)
        setNewItem({
            title: '',
            date: '',
            end_date: '',
            organization_id: '',
            video_embed_url: '',
            summary_text: '',
            summary_html: '',
            attendees_text: ''
        })
    }

    const handleSave = () => {
        if (!validateForm()) return

        // Warning if no video is provided
        if (!newItem.video_embed_url) {
            if (!confirm('Esta sessão não possui URL de vídeo. Deseja salvar apenas com o resumo/notas?')) {
                return
            }
        }

        if (isEdit && editId) {
            updateSession.mutate({ ...newItem, id: editId })
        } else {
            createSession.mutate(newItem)
        }
    }

    const handleEdit = (session: Session) => {
        setIsEdit(true)
        setEditId(session.id)

        const attendeesText = session.attendees
            ? session.attendees.map(a => a.email).join('\n')
            : ''

        setNewItem({
            title: session.title,
            date: session.date, // Keep ISO string for now, Scheduler might need Date obj
            end_date: session.end_date || '',
            organization_id: session.organization_id,
            video_embed_url: session.video_embed_url || '',
            summary_text: session.summary_text || '',
            summary_html: session.summary_html || session.summary_text || '',
            attendees_text: attendeesText
        })
        setIsOpen(true)
    }

    if (isLoading) return (
        <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
        </Box>
    )

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Sessões
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gerencie todas as mentorias e reuniões gravadas.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        resetForm()
                        setIsOpen(true)
                    }}
                >
                    Nova Sessão
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell>Título</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Organização</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Nenhuma sessão encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions?.map((session) => (
                                <TableRow
                                    key={session.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.2s',
                                        cursor: 'default' // Or pointer if intended to be clickable
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {session.title}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                            {session.video_embed_url && (
                                                <VideoIcon color="primary" sx={{ fontSize: 16 }} />
                                            )}
                                            {session.attendees && session.attendees.length > 0 && (
                                                <Chip
                                                    label={`${session.attendees.length} Part.`}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>
                                        {new Date(session.date).toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                        {session.organizations?.name || session.organization_id}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleEdit(session)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja excluir?')) {
                                                    deleteSession.mutate(session.id)
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form */}
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{isEdit ? 'Editar Sessão' : 'Nova Sessão'}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Preencha os detalhes da mentoria.
                    </DialogContentText>

                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel id="org-select-label">Organização</InputLabel>
                            <Select
                                labelId="org-select-label"
                                value={newItem.organization_id}
                                label="Organização"
                                onChange={(e) => setNewItem({ ...newItem, organization_id: e.target.value })}
                            >
                                {orgs?.map((org) => (
                                    <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Título"
                            fullWidth
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        />

                        {/* Custom Scheduler Component - Kept as is but wrapped in Box */}
                        {/* Custom Scheduler Component */}
                        <SessionScheduler
                            date={newItem.date ? new Date(newItem.date) : undefined}
                            setDate={(date) => setNewItem(prev => ({ ...prev, date: date ? date.toISOString() : '' }))}
                            endDate={newItem.end_date ? new Date(newItem.end_date) : undefined}
                            setEndDate={(date) => setNewItem(prev => ({ ...prev, end_date: date ? date.toISOString() : '' }))}
                        />

                        <TextField
                            label="URL do Vídeo (YouTube)"
                            fullWidth
                            placeholder="https://..."
                            value={newItem.video_embed_url}
                            onChange={(e) => setNewItem({ ...newItem, video_embed_url: e.target.value })}
                            helperText="Opcional se houver resumo."
                        />

                        <TextField
                            label="Participantes (E-mails)"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="um@email.com, outro@email.com"
                            value={newItem.attendees_text}
                            onChange={(e) => setNewItem({ ...newItem, attendees_text: e.target.value })}
                            helperText="Separe por vírgula ou nova linha."
                        />

                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ bg: 'background.paper', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2">Resumo / Notas</Typography>
                            </Box>
                            <Box sx={{ minHeight: 200, bgcolor: 'background.default', color: 'text.primary' }}>
                                {/* SessionEditor is likely using Tiptap which needs its own styling context or just works. 
                                   Since it's a custom component, we assume it handles its own internal styles but we provide a wrapper. */}
                                <SessionEditor
                                    content={newItem.summary_html}
                                    onChange={(html) => setNewItem({ ...newItem, summary_html: html })}
                                    hideActions={true}
                                />
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={createSession.isPending || updateSession.isPending}
                    >
                        {createSession.isPending || updateSession.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Box>
    )
}

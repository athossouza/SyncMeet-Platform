import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AlertBanner } from "@/components/ui/alert-banner"
import { SessionScheduler } from "@/components/SessionScheduler"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Organization, Session } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Added import
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Video, Pencil, Trash2 } from 'lucide-react'
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

    // Alert Banner State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        variant: 'default' | 'success' | 'destructive' | 'warning';
        title: string;
        description?: string;
        primaryAction?: { label: string; onClick: () => void };
        secondaryAction?: { label: string; onClick: () => void };
    } | null>(null);

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

    // Validation Logic
    const validateForm = (onConfirm?: () => void) => {
        // Strict check for organization_id
        if (!newItem.organization_id || !newItem.organization_id.trim()) {
            console.error('❌ Validation Failed: Organization ID is missing', newItem)
            setAlertConfig({
                isOpen: true,
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Por favor, selecione uma organização.',
                onDismiss: () => setAlertConfig(null)
            } as any)
            return false
        }
        if (!newItem.title) {
            setAlertConfig({
                isOpen: true,
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O título da sessão é obrigatório.',
                onDismiss: () => setAlertConfig(null)
            } as any)
            return false
        }

        const attendees = parseAttendees(newItem.attendees_text)
        if (attendees.length === 0) {
            setAlertConfig({
                isOpen: true,
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'É necessário adicionar pelo menos um participante (e-mail).',
                onDismiss: () => setAlertConfig(null)
            } as any)
            return false
        }

        // Date Validation
        if (!newItem.date) {
            setAlertConfig({
                isOpen: true,
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'A data de início é obrigatória.',
                onDismiss: () => setAlertConfig(null)
            } as any)
            return false
        }

        // Video URL Validation
        if (newItem.video_embed_url) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
            if (!youtubeRegex.test(newItem.video_embed_url)) {
                setAlertConfig({
                    isOpen: true,
                    variant: 'destructive',
                    title: 'Erro de URL',
                    description: 'A URL do vídeo deve ser do YouTube (youtube.com ou youtu.be).',
                    onDismiss: () => setAlertConfig(null)
                } as any)
                return false
            }
        } else {
            // No Video Logic
            const hasSummary = newItem.summary_html && newItem.summary_html.trim() !== '' && newItem.summary_html !== '<p></p>'
            if (!hasSummary) {
                setAlertConfig({
                    isOpen: true,
                    variant: 'destructive',
                    title: 'Conteúdo Obrigatório',
                    description: 'Se não houver vídeo, é obrigatório adicionar um Resumo/Notas.',
                    onDismiss: () => setAlertConfig(null)
                } as any)
                return false
            }

            // If callback provided (for confirm flow), trigger warning
            if (onConfirm) {
                setAlertConfig({
                    isOpen: true,
                    variant: 'warning',
                    title: 'Ausência de Vídeo',
                    description: 'Você não informou uma URL de vídeo. Deseja criar a sessão assim mesmo?',
                    primaryAction: {
                        label: 'Sim, criar sessão',
                        onClick: () => {
                            console.log('✅ User confirmed creation via Alert')
                            if (onConfirm) onConfirm()
                            setAlertConfig(null)
                        }
                    },
                    secondaryAction: {
                        label: 'Cancelar',
                        onClick: () => setAlertConfig(null)
                    },
                    onDismiss: () => setAlertConfig(null)
                } as any)
                return false // Wait for user interaction
            }
        }

        return true
    }

    // Create Session Mutation
    const createSession = useMutation({
        mutationFn: async (data: typeof newItem) => {
            // Remove client-side auto-generation of summary_text to allow AI Edge Function to run
            let finalSummaryText = data.summary_text

            if (!data.organization_id || !data.organization_id.trim()) {
                throw new Error('Internal Error: Organization ID is missing in mutation payload.')
            }

            const payload = {
                title: data.title,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                organization_id: data.organization_id,
                video_embed_url: data.video_embed_url || null,
                summary_text: finalSummaryText || null,
                summary_html: data.summary_html || null,
                attendees: parseAttendees(data.attendees_text)
            }

            const { error } = await supabase.from('sessions').insert(payload)
            if (error) {
                console.error('Error creating session:', error)
                throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setIsOpen(false)
            resetForm()
            // Trigger AI Summary (Backend)
            fetch('/api/ai-summary', { method: 'POST' }).catch(err => console.error('Failed to trigger AI:', err))
        },
        onError: (error) => {
            console.error('Error creating session:', error)
            // @ts-ignore
            window._lastSessionError = error
        }
    })

    // Delete Session Mutation
    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('sessions').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
        },
    })

    // Update Session Mutation
    const updateSession = useMutation({
        mutationFn: async (data: typeof newItem & { id: string }) => {
            if (!data.id) return

            // Remove client-side auto-generation of summary_text to allow AI Edge Function to run
            let finalSummaryText = data.summary_text


            const { error } = await supabase.from('sessions').update({
                title: data.title,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                organization_id: data.organization_id,
                video_embed_url: data.video_embed_url,
                summary_text: finalSummaryText,
                summary_html: data.summary_html,
                attendees: parseAttendees(data.attendees_text)
            }).eq('id', data.id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setIsOpen(false)
            resetForm()
            // Trigger AI Summary (Backend)
            fetch('/api/ai-summary', { method: 'POST' }).catch(err => console.error('Failed to trigger AI:', err))
        },
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
        setAlertConfig(null) // Reset alerts on new form
    }

    const handleCreate = () => {
        const proceed = () => {
            if (isEdit && editId) {
                updateSession.mutate({ ...newItem, id: editId })
            } else {
                createSession.mutate(newItem)
            }
        }

        // Pass 'proceed' as callback for the confirmation flow.
        const isValid = validateForm(proceed)

        if (isValid) {
            proceed()
        }
    }

    const handleEdit = (session: Session) => {
        setIsEdit(true)
        setEditId(session.id)
        // Convert ISO date back to datetime-local format (YYYY-MM-DDTHH:mm)
        const dateObj = new Date(session.date)
        const dateStr = dateObj.toISOString().slice(0, 16)

        let endDateStr = ''
        if (session.end_date) {
            const endDateObj = new Date(session.end_date)
            endDateStr = endDateObj.toISOString().slice(0, 16)
        }

        // Convert attendees array to text
        const attendeesText = session.attendees
            ? session.attendees.map(a => a.email).join('\n')
            : ''

        setNewItem({
            title: session.title,
            date: dateStr,
            end_date: endDateStr,
            organization_id: session.organization_id,
            video_embed_url: session.video_embed_url || '',
            summary_text: session.summary_text || '',
            summary_html: session.summary_html || session.summary_text || '',
            attendees_text: attendeesText
        })
        setIsOpen(true)
    }

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Sessões</h2>
                    <p className="text-muted-foreground">Gerencie todas as mentorias e reuniões gravadas.</p>
                </div>

                {/* Global Alert Banner - Fixed Position */}
                <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[9999] pointer-events-none">
                    <div className="pointer-events-auto">
                        <AnimatePresence>
                            {alertConfig && alertConfig.isOpen && (
                                <AlertBanner
                                    variant={alertConfig.variant}
                                    title={alertConfig.title}
                                    description={alertConfig.description}
                                    primaryAction={alertConfig.primaryAction}
                                    secondaryAction={alertConfig.secondaryAction}
                                    onDismiss={() => setAlertConfig(null)}
                                    className="shadow-2xl border-2 bg-background/95 backdrop-blur-sm"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nova Sessão
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-card-foreground border-slate-800 bg-slate-950">
                        {/* Alert Layer - Absolute Top Center */}


                        {/* Scrollable Content Wrapper */}
                        <div className="flex-1 overflow-y-auto p-6 w-full">
                            <DialogHeader>
                                <DialogTitle>{isEdit ? 'Editar Sessão' : 'Nova Sessão'}</DialogTitle>
                                <DialogDescription>
                                    {isEdit ? 'Atualize os dados da sessão.' : 'Preencha os dados da sessão.'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-200 font-medium">Organização</Label>
                                    <Select
                                        onValueChange={(val) => setNewItem({ ...newItem, organization_id: val })}
                                        value={newItem.organization_id}
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100 hover:border-blue-500/50 focus:ring-blue-500/20 transition-all">
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                            {orgs?.map((org) => (
                                                <SelectItem key={org.id} value={org.id} className="focus:bg-blue-500/20 focus:text-blue-100">
                                                    {org.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-200 font-medium">Título</Label>
                                    <Input
                                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    />
                                </div>

                                <SessionScheduler
                                    date={newItem.date ? new Date(newItem.date) : undefined}
                                    setDate={(date) => setNewItem(prev => ({ ...prev, date: date ? date.toISOString() : '' }))}
                                    endDate={newItem.end_date ? new Date(newItem.end_date) : undefined}
                                    setEndDate={(date) => setNewItem(prev => ({ ...prev, end_date: date ? date.toISOString() : '' }))}
                                />

                                <div className="space-y-2">
                                    <Label className="text-slate-200 font-medium">URL do Vídeo (Youtube)</Label>
                                    <Input
                                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        value={newItem.video_embed_url}
                                        onChange={e => setNewItem({ ...newItem, video_embed_url: e.target.value })}
                                        placeholder="https://www.youtube.com/embed/..."
                                    />
                                    <p className="text-[10px] text-slate-400">Obrigatório ser link do YouTube. Se vazio, exibe apenas resumo.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-200 font-medium">Participantes (E-mails)</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={newItem.attendees_text}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItem({ ...newItem, attendees_text: e.target.value })}
                                            placeholder="email@exemplo.com&#10;outro@empresa.com"
                                            className="min-h-[100px] font-mono text-xs bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 text-right">
                                            Separe por linha, vírgula ou ponto e vírgula.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-200 font-medium">Notas & Resumo (Rich Text)</Label>
                                    <div className="border border-slate-700 rounded-md overflow-hidden min-h-[250px] bg-slate-50 text-slate-900 shadow-sm">
                                        <SessionEditor
                                            content={newItem.summary_html}
                                            onChange={(html) => setNewItem({ ...newItem, summary_html: html })}
                                            hideActions={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-slate-700 bg-transparent hover:bg-white/5 text-slate-300">Cancelar</Button>
                                <Button onClick={handleCreate} disabled={createSession.isPending || updateSession.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {createSession.isPending || updateSession.isPending ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Sessão')}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/10">
                            <TableHead className="text-slate-300">Título</TableHead>
                            <TableHead className="text-slate-300">Data</TableHead>
                            <TableHead className="text-slate-300">Organização</TableHead>
                            <TableHead className="text-right text-slate-300">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Carregando...</TableCell>
                            </TableRow>
                        ) : sessions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Nenhuma sessão encontrada.</TableCell>
                            </TableRow>
                        ) : (
                            sessions?.map((session) => (
                                <TableRow key={session.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-slate-200">
                                        <div className="flex items-center gap-2">
                                            {session.title}
                                            <div className="flex items-center gap-1">
                                                {session.video_embed_url && (
                                                    <Video className="h-3 w-3 text-blue-400" />
                                                )}
                                                {session.attendees && session.attendees.length > 0 && (
                                                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">
                                                        {session.attendees.length} Part.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{new Date(session.date).toLocaleString()}</TableCell>
                                    <TableCell className="text-slate-400 font-mono text-xs">{session.organizations?.name || session.organization_id}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-white/10 text-slate-400 hover:text-white"
                                                onClick={() => handleEdit(session)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                                onClick={() => {
                                                    setAlertConfig({
                                                        isOpen: true,
                                                        variant: 'warning',
                                                        title: 'Excluir Sessão',
                                                        description: 'Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e removerá todo o histórico.',
                                                        primaryAction: {
                                                            label: 'Sim, excluir',
                                                            onClick: () => {
                                                                deleteSession.mutate(session.id)
                                                                setAlertConfig(null)
                                                            }
                                                        },
                                                        secondaryAction: {
                                                            label: 'Cancelar',
                                                            onClick: () => setAlertConfig(null)
                                                        },
                                                        onDismiss: () => setAlertConfig(null)
                                                    } as any)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

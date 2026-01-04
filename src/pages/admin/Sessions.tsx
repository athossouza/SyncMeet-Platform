import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Organization } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Loader2, MoreHorizontal, Video, FileText } from 'lucide-react'

export default function AdminSessions() {
    const [isOpen, setIsOpen] = useState(false)
    const [newItem, setNewItem] = useState({
        title: '',
        date: '',
        organization_id: '',
        video_embed_url: '',
        doc_embed_url: '',
        summary_text: ''
    })

    const queryClient = useQueryClient()

    // Fetch Sessions (with Org info)
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['admin-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select(`
          *,
          organizations (name)
        `)
                .order('date', { ascending: false })
            if (error) throw error
            return data
        },
    })

    // Fetch Orgs for Dropdown
    const { data: orgs } = useQuery({
        queryKey: ['organizations-list'],
        queryFn: async () => {
            const { data } = await supabase.from('organizations').select('id, name')
            return data as Organization[]
        },
    })

    // Create Session Mutation
    const createSession = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('sessions').insert({
                title: newItem.title,
                date: new Date(newItem.date).toISOString(),
                organization_id: newItem.organization_id,
                video_embed_url: newItem.video_embed_url,
                doc_embed_url: newItem.doc_embed_url,
                summary_text: newItem.summary_text
            })
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setIsOpen(false)
            setNewItem({
                title: '',
                date: '',
                organization_id: '',
                video_embed_url: '',
                doc_embed_url: '',
                summary_text: ''
            })
        },
    })

    const handleCreate = () => {
        createSession.mutate()
    }

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Sessões</h2>
                    <p className="text-muted-foreground">Gerencie todas as mentorias e reuniões gravadas.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nova Sessão
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl text-card-foreground">
                        <DialogHeader>
                            <DialogTitle>Nova Sessão</DialogTitle>
                            <DialogDescription>Preencha os dados da sessão.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Organização</Label>
                                <Select
                                    onValueChange={(val) => setNewItem({ ...newItem, organization_id: val })}
                                    value={newItem.organization_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgs?.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data/Hora</Label>
                                    <Input type="datetime-local" value={newItem.date} onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>URL do Vídeo (Embed)</Label>
                                <Input value={newItem.video_embed_url} onChange={e => setNewItem({ ...newItem, video_embed_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>URL do Documento (Embed)</Label>
                                <Input value={newItem.doc_embed_url} onChange={e => setNewItem({ ...newItem, doc_embed_url: e.target.value })} placeholder="https://docs.google.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Resumo</Label>
                                <Textarea value={newItem.summary_text} onChange={e => setNewItem({ ...newItem, summary_text: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={createSession.isPending}>
                                {createSession.isPending ? 'Criando...' : 'Criar Sessão'}
                            </Button>
                        </DialogFooter>
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
                            sessions?.map((session: any) => (
                                <TableRow key={session.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-slate-200">
                                        <div className="flex items-center gap-2">
                                            {session.title}
                                            <div className="flex items-center gap-1">
                                                {session.video_embed_url && (
                                                    <Video className="h-3 w-3 text-blue-400" />
                                                )}
                                                {session.doc_embed_url && (
                                                    <FileText className="h-3 w-3 text-amber-400" />
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{new Date(session.date).toLocaleString()}</TableCell>
                                    <TableCell className="text-slate-400 font-mono text-xs">{session.organizations?.name || session.organization_id}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-slate-400 hover:text-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
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

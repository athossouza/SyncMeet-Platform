import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Organization } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Loader2 } from 'lucide-react'

export default function AdminOrganizations() {
    const [isOpen, setIsOpen] = useState(false)
    const [newOrgName, setNewOrgName] = useState('')
    const [newOrgDomain, setNewOrgDomain] = useState('')
    const queryClient = useQueryClient()

    // Fetch Organizations
    const { data: orgs, isLoading } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as Organization[]
        },
    })

    // Create Organization Mutation
    const createOrg = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('organizations').insert({
                name: newOrgName,
                domain: newOrgDomain.replace('@', ''), // Ensure smooth domain handling
            })
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
            setIsOpen(false)
            setNewOrgName('')
            setNewOrgDomain('')
        },
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        createOrg.mutate()
    }

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Organizações</h2>
                    <p className="text-muted-foreground">Gerencie as empresas clientes e seus domínios.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nova Organização
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Organização</DialogTitle>
                            <DialogDescription>
                                Crie uma nova organização para permitir que usuários desse domínio acessem o portal.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Empresa</Label>
                                <Input id="name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Ex: Acme Corp" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domínio (sem @)</Label>
                                <Input id="domain" value={newOrgDomain} onChange={(e) => setNewOrgDomain(e.target.value)} placeholder="ex: acme.com" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate}>Criar Organização</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/10">
                            <TableHead className="text-slate-300">Nome</TableHead>
                            <TableHead className="text-slate-300">Domínio</TableHead>
                            <TableHead className="text-slate-300">Criado em</TableHead>
                            <TableHead className="text-right text-slate-300">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Carregando...</TableCell>
                            </TableRow>
                        ) : orgs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Nenhuma organização encontrada.</TableCell>
                            </TableRow>
                        ) : (
                            orgs?.map((org) => (
                                <TableRow key={org.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-slate-200">{org.name}</TableCell>
                                    <TableCell className="text-slate-400">{org.domain}</TableCell>
                                    <TableCell className="text-slate-400">{new Date(org.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-slate-400 hover:text-white">
                                            <Plus className="h-4 w-4" />
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

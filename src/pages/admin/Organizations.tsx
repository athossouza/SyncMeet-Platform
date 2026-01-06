import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Organization } from '@/types'
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
    CircularProgress
} from '@mui/material'
import {
    Add as AddIcon
} from '@mui/icons-material'

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

    if (isLoading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress color="primary" />
        </Box>
    )

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Organizações
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gerencie as empresas clientes e seus domínios.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsOpen(true)}
                >
                    Nova Organização
                </Button>
            </Stack>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleCreate}>
                    <DialogTitle>Adicionar Organização</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Crie uma nova organização para permitir que usuários desse domínio acessem o portal.
                        </DialogContentText>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                autoFocus
                                id="name"
                                label="Nome da Empresa"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newOrgName}
                                onChange={(e) => setNewOrgName(e.target.value)}
                                placeholder="Ex: Acme Corp"
                                required
                            />
                            <TextField
                                id="domain"
                                label="Domínio (sem @)"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newOrgDomain}
                                onChange={(e) => setNewOrgDomain(e.target.value)}
                                placeholder="ex: acme.com"
                                required
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setIsOpen(false)} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={createOrg.isPending}>
                            {createOrg.isPending ? 'Criando...' : 'Criar Organização'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Domínio</TableCell>
                            <TableCell>Criado em</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orgs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    Nenhuma organização encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orgs?.map((org) => (
                                <TableRow
                                    key={org.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.2s',
                                        cursor: 'default'
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                        {org.name}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{org.domain}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary">
                                            <AddIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

import { useNavigate } from 'react-router-dom'
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Grid,
    Typography,
    Stack
} from '@mui/material'
import {
    Business as BusinessIcon,
    Group as GroupIcon
} from '@mui/icons-material'

export default function AdminDashboard() {
    const navigate = useNavigate()

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back. Here's an overview of Sync Meet.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Organizations Card */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardActionArea onClick={() => navigate('/admin/organizations')} sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                        Organizações
                                    </Typography>
                                    <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
                                </Stack>

                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                    Clientes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Adicionar e gerenciar empresas
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Sessions Card */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardActionArea onClick={() => navigate('/admin/sessions')} sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                        Todas as Sessões
                                    </Typography>
                                    <GroupIcon color="secondary" sx={{ fontSize: 28 }} />
                                </Stack>

                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                    Conteúdo
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Revisar e editar sessões
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}

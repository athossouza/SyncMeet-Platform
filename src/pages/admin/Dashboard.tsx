import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-2">Welcome back. Here's an overview of Sync Meet.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card border-white/10 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/admin/organizations')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Organizações
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Clientes</div>
                        <p className="text-xs text-slate-400">
                            Adicionar e gerenciar empresas
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-white/10 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/admin/sessions')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Todas as Sessões
                        </CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Conteúdo</div>
                        <p className="text-xs text-slate-400">
                            Revisar e editar sessões
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

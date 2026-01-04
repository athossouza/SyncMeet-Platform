import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    LogOut,
    Building2,
    RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { signOut } = useAuth()
    const location = useLocation()
    const [isSyncing, setIsSyncing] = useState(false)

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('http://localhost:3000/api/sync', { method: 'POST' })
            if (res.ok) {
                alert('Sincronização concluída com sucesso!')
            } else {
                throw new Error('Falha na sincronização')
            }
        } catch (error) {
            console.error(error)
            alert('Erro ao sincronizar. Verifique se o servidor de sync está rodando.')
        } finally {
            setIsSyncing(false)
        }
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Organizações', href: '/admin/organizations', icon: Building2 },
        { name: 'Todas as Sessões', href: '/admin/sessions', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="text-lg font-bold text-foreground">SessionOS Admin</span>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-6">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    isActive
                                        ? "bg-primary/20 text-blue-400"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={cn(
                            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isSyncing
                                ? "text-blue-400 bg-blue-400/10 cursor-not-allowed"
                                : "text-green-400 hover:bg-green-400/10 hover:text-green-300"
                        )}
                    >
                        <RefreshCw className={cn("mr-3 h-5 w-5", isSyncing && "animate-spin")} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </button>

                    <Link
                        to="/portal"
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Voltar ao Portal
                    </Link>
                    <button
                        onClick={signOut}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

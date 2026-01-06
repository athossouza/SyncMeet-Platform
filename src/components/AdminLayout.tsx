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
import { AnimatePresence } from 'framer-motion'
import { AlertBanner } from '@/components/ui/alert-banner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { signOut } = useAuth()
    const location = useLocation()
    const [isSyncing, setIsSyncing] = useState(false)
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        variant: 'default' | 'success' | 'destructive' | 'warning';
        title: string;
        description?: string;
    } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/sync', { method: 'POST' })
            if (res.ok) {
                setAlertConfig({
                    isOpen: true,
                    variant: 'success',
                    title: 'Sincronização Concluída',
                    description: 'Os dados foram atualizados com sucesso.'
                })
                // Auto dismiss after 3s
                setTimeout(() => setAlertConfig(null), 3000)
            } else {
                throw new Error('Falha na sincronização')
            }
        } catch (error) {
            console.error(error)
            setAlertConfig({
                isOpen: true,
                variant: 'destructive',
                title: 'Erro na Sincronização',
                description: 'Verifique se o servidor de sync está rodando.'
            })
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
        <div className="h-screen overflow-hidden bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
                <div className="flex h-16 items-center px-6 border-b border-border/40">
                    <LayoutDashboard className="h-6 w-6 mr-3 text-primary" />
                    <span className="text-lg font-bold text-foreground">Sync Meet Admin</span>
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
            <main className="flex-1 overflow-y-auto relative">

                {/* Global Alert Toast */}
                <div className="fixed top-4 right-4 z-50 w-full max-w-sm pointer-events-none">
                    <div className="pointer-events-auto">
                        <AnimatePresence>
                            {alertConfig && alertConfig.isOpen && (
                                <AlertBanner
                                    variant={alertConfig.variant}
                                    title={alertConfig.title}
                                    description={alertConfig.description}
                                    onDismiss={() => setAlertConfig(null)}
                                    className="shadow-xl"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

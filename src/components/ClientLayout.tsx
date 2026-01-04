import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { signOut, profile } = useAuth()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/portal" className="text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
                        Sync Meet
                    </Link>

                    <div className="flex items-center gap-4">
                        {profile?.role === 'admin' && (
                            <Button variant="outline" size="sm" asChild className="hidden md:flex border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                <Link to="/admin">
                                    Painel Admin
                                </Link>
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile?.avatar_url} alt={profile?.email} />
                                        <AvatarFallback>{profile?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{profile?.email}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {profile?.role}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}

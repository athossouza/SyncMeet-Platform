import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Footer } from '@/components/Footer'

export default function LandingPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            navigate('/')

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Falha ao entrar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#051426] flex flex-col font-sans text-white selection:bg-blue-500/30">
            {/* Header (Removed as per request) */}
            <div className="py-8"></div>

            {/* Main Hero Content */}
            <main className="flex-1 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-12 relative z-10">

                {/* Left Column: Branding Text */}
                <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium uppercase tracking-wider mb-2">
                        <span>Portal do Cliente</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                            Sua Evolução,
                        </span>
                        <br />
                        <span className="text-blue-500">Centralizada e Automatizada</span>
                    </h1>

                    <p className="text-lg text-neutral-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Chega de informações dispersas. Documentos, gravações e planos de ação sincronizados em uma única plataforma inteligente.
                    </p>
                </div>

                {/* Right Column: Login Card */}
                <div className="flex-1 w-full max-w-md">
                    <Card className="border-white/10 bg-[#0A2647]/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="space-y-1 pb-2">
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">Login</CardTitle>
                            <CardDescription className="text-neutral-400">
                                Entre com suas credenciais de acesso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-neutral-300">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-neutral-900/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-neutral-300">Senha</Label>
                                        <a href="#" className="text-xs text-blue-400 hover:text-blue-300 hidden">Esqueceu?</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-neutral-900/50 border-white/10 text-white focus-visible:ring-blue-500"
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Acessando...
                                        </>
                                    ) : (
                                        'Acessar Portal'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center pt-2 pb-6">
                            <p className="text-xs text-neutral-500">
                                Dúvidas? Contate seu gestor de conta.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </main>

            {/* Value Proposition Section */}
            <section className="py-24 bg-[#0A2647]/30 border-y border-white/5 relative z-10 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 mb-4">
                            O que o Sync Meet resolve?
                        </h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                            Uma plataforma unificada para garantir que a estratégia desenhada nas mentorias
                            seja executada com precisão.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 border border-white/10 bg-[#0A2647]/50 backdrop-blur-sm hover:shadow-[0_2px_12px_rgba(44,116,179,0.1)] hover:-translate-y-1 will-change-transform">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Upload Automatizado</h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    Adeus upload manual. Suas gravações vão direto para o YouTube como "Não Listado". Zero consumo de espaço e zero tempo perdido aguardando barra de progresso.
                                </p>
                            </div>

                            <div className="absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Card 2 */}
                        <div className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 border border-white/10 bg-[#0A2647]/50 backdrop-blur-sm hover:shadow-[0_2px_12px_rgba(44,116,179,0.1)] hover:-translate-y-1 will-change-transform">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Playlists Organizadas</h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    O sistema cria e alimenta playlists no YouTube automaticamente por cliente. O mentor não perde tempo organizando pastas e o cliente acha tudo na hora.
                                </p>
                            </div>

                            <div className="absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Card 3 */}
                        <div className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 border border-white/10 bg-[#0A2647]/50 backdrop-blur-sm hover:shadow-[0_2px_12px_rgba(44,116,179,0.1)] hover:-translate-y-1 will-change-transform">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Operação Zero para o Mentor</h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    Elimine o gargalo operacional. O mentor foca 100% na entrega e na estratégia, enquanto o Sync Meet cuida de toda a logística e distribuição do conteúdo.
                                </p>
                            </div>

                            <div className="absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

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
                            Inteligência Operacional
                        </span>
                        <br />
                        <span className="text-blue-500">em Suporte B2B</span>
                    </h1>

                    <p className="text-lg text-neutral-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Acesse seus dashboards, cronogramas de mentorias e
                        ativos digitais em um ambiente seguro e centralizado.
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
                        <div className="p-8 rounded-2xl bg-[#051426] border border-white/10 hover:border-blue-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /><line x1="3.27 16.05" x2="2.72" y2="12" /></svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Centralização de Ativos</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Chega de links perdidos no WhatsApp. Acesse gravações, documentos estratégicos e planos de ação em um único cofre digital seguro.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 rounded-2xl bg-[#051426] border border-white/10 hover:border-blue-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Memória Estratégica</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Histórico completo de cada decisão tomada. Revise sessões passadas com resumos inteligentes e não perca o fio da meada.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 rounded-2xl bg-[#051426] border border-white/10 hover:border-blue-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Ritmo e Execução</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Visualize o cronograma de próximas sessões e acompanhe a evolução do projeto passo a passo, mantendo o time alinhado.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

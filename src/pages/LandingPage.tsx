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
            {/* Header */}
            <header className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <div className="w-28 md:w-32">
                    <img
                        src="/logo.png"
                        alt="ATVEZA"
                        className="w-full h-auto opacity-90"
                    />
                </div>
                {/* Optional: Add 'Contact' or 'About' link if needed */}
            </header>

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

            <Footer />
        </div>
    )
}

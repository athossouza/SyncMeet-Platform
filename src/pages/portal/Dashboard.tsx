import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { Loader2, CalendarDays, Video, FileText, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale' // Import locale
import { cn } from '@/lib/utils'

export default function ClientDashboard() {
    const { data: sessions, isLoading, error } = useQuery({
        queryKey: ['client-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .order('date', { ascending: false })

            if (error) throw error
            return data as Session[]
        },
    })

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    if (error) return <div className="text-destructive">Erro ao carregar sessões.</div>

    // Group sessions by Month Year
    const groupedSessions: Record<string, Session[]> = {}

    sessions?.forEach(session => {
        const monthYear = format(new Date(session.date), 'MMMM yyyy', { locale: ptBR })
        // Capitalize first letter
        const formattedGroup = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

        if (!groupedSessions[formattedGroup]) {
            groupedSessions[formattedGroup] = []
        }
        groupedSessions[formattedGroup].push(session)
    })

    const groups = Object.keys(groupedSessions)

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Minhas Sessões</h1>
                <p className="text-neutral-400">Acesse suas mentorias gravadas e documentos de apoio.</p>
            </div>

            {sessions?.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-card/50 rounded-xl border border-white/10 border-dashed">
                    <p className="text-muted-foreground">Nenhuma sessão encontrada.</p>
                </div>
            ) : (
                groups.map(group => (
                    <div key={group} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-white/90">{group}</h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groupedSessions[group].map((session) => {
                                const isFuture = new Date(session.date) > new Date()
                                const hasContent = !!session.video_embed_url || !!session.doc_embed_url
                                const isPastEmpty = !isFuture && !hasContent

                                // --- 1. SESSÃO PASSADA SEM CONTEÚDO (Extra/Cancelada/Não gravada) ---
                                if (isPastEmpty) {
                                    return (
                                        <div key={session.id} className="relative p-5 rounded-xl border border-white/5 bg-white/5 opacity-60 hover:opacity-100 transition-opacity flex flex-col h-full group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-slate-500">
                                                    <CalendarDays className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-slate-500">
                                                    Sessão Extra
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg text-slate-300 mb-1">{session.title}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                                {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-white/5 text-xs text-slate-500">
                                                Esta sessão não possui gravação ou documentos anexados.
                                            </div>
                                        </div>
                                    )
                                }

                                // --- 2. SESSÃO FUTURA (Agendada) ---
                                if (isFuture) {
                                    return (
                                        <div key={session.id} className={cn(
                                            "relative p-5 rounded-xl border border-blue-500/20 bg-blue-900/10 flex flex-col h-full",
                                            "hover:border-blue-500/40 transition-colors"
                                        )}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400">
                                                    <CalendarDays className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-400 capitalize">
                                                    Agendada
                                                </span>
                                            </div>
                                            <div className="space-y-1 mb-4">
                                                <h3 className="font-semibold text-lg text-blue-100">{session.title}</h3>
                                                <p className="text-xs text-blue-300 uppercase tracking-wider">
                                                    {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                            <div className="mt-auto">
                                                {session.meet_link ? (
                                                    <a
                                                        href={session.meet_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
                                                    >
                                                        <Video className="w-4 h-4" /> Entrar no Meet
                                                    </a>
                                                ) : (
                                                    <div className="text-xs text-blue-400/60 text-center py-2">Link não disponível ainda</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }

                                // --- 3. SESSÃO PASSADA COM CONTEÚDO (Padrão) ---
                                return (
                                    <Link
                                        to={`/portal/session/${session.id}`}
                                        key={session.id}
                                        className={cn(
                                            "group relative p-5 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                                            // Base styles (Dark Navy with blur)
                                            "border border-white/10 bg-[#0A2647]/50 backdrop-blur-sm",
                                            // Hover effects
                                            "hover:shadow-[0_2px_12px_rgba(44,116,179,0.2)]",
                                            "hover:-translate-y-1 will-change-transform",
                                            "flex flex-col h-full"
                                        )}
                                    >
                                        {/* Background Noise/Grid Effect (Fades in on hover) */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                                "pointer-events-none"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
                                        </div>

                                        {/* Card Content */}
                                        <div className="relative flex flex-col h-full space-y-4">

                                            {/* Header: Icon + Status */}
                                            <div className="flex items-center justify-between">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                                                    "bg-white/10 group-hover:bg-primary/20 text-emerald-400"
                                                )}>
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors duration-300",
                                                    "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200"
                                                )}>
                                                    Gravada
                                                </span>
                                            </div>

                                            {/* Title & Date */}
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-lg text-white group-hover:text-blue-100 transition-colors">
                                                    {session.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                    {format(new Date(session.date), "d 'de' MMMM, yyyy • HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>

                                            {/* Description (Summary) - Flex grow to push CTA down */}
                                            <div className="flex-1">
                                                {session.summary_text && (
                                                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                                                        {session.summary_text}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Footer: Tags + CTA */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                                <div className="flex gap-2">
                                                    {/* Auto-generated tags based on content */}
                                                    {session.doc_embed_url && (
                                                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-slate-400 border border-white/5 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> Material
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                                    Assistir <ArrowRight className="ml-1 w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gradient Gloss Overlay on Hover */}
                                        <div
                                            className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                                        />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

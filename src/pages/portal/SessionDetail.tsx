import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Download, CheckCircle2, Clock, Calendar, HelpCircle, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CustomVideoPlayer from '@/components/CustomVideoPlayer'
import SessionEditor from '@/components/SessionEditor'

// Helper to extract ID from URL if youtube_video_id is missing
const extractYoutubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export default function SessionDetail() {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<'notes' | 'transcription'>('notes')
    const [isNotesExpanded, setIsNotesExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Fetch Session
    const { data: session, isLoading } = useQuery({
        queryKey: ['session', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', id!)
                .single()

            if (error) throw error
            return data as Session
        },
        enabled: !!id,
    })

    // Fetch Current User Profile to check Admin
    const { data: userProfile } = useQuery({
        queryKey: ['hasAdminAccess'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            // Check profiles table (assuming it exists and matches types)
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            return profile as Profile
        }
    })

    const isAdmin = userProfile?.role === 'admin' || userProfile?.email === 'athos@atveza.com' // Fallback for specific user

    const handleSaveNotes = async (newHtml: string) => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .update({ summary_html: newHtml })
                .eq('id', id!)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                console.warn("Save successful but NO rows updated. RLS Policy likely blocking update.")
                alert("Atenção: A alteração não foi salva. Você pode não ter permissão de edição (RLS).")
                return
            }

            // Invalidate query to refresh UI
            queryClient.invalidateQueries({ queryKey: ['session', id] })
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to save notes:', error)
            alert('Erro ao salvar as notas.')
        }
    }

    const contentParts = useMemo(() => {
        if (!session?.summary_html) return { notes: null, transcript: null }

        // Find the "Transcrição" Header block (usually <p class="title">...Transcrição...</p>)
        const splitRegex = /<p class="title"[^>]*>(?:(?!<\/p>)[\s\S])*Transcri(?:ç|&ccedil;)(?:ã|&atilde;)o[\s\S]*?<\/p>/i
        const match = session.summary_html.match(splitRegex)

        if (match && match.index !== undefined) {
            return {
                notes: session.summary_html.substring(0, match.index),
                transcript: session.summary_html.substring(match.index)
            }
        }

        return { notes: session.summary_html, transcript: null }
    }, [session?.summary_html])

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    if (!session) return <div>Sessão não encontrada</div>

    // Helper to format duration
    const formatDuration = (seconds?: number, start?: string, end?: string) => {
        if (seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60
            if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
            return `${minutes}m ${secs}s`
        }
        // Fallback to schedule range
        if (start && end) {
            const diff = new Date(end).getTime() - new Date(start).getTime()
            const mins = Math.floor(diff / 60000)
            return `~${mins} min (Agendado)`
        }
        return '--'
    }

    return (
        <div className="space-y-6 flex flex-col pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/portal">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">{session.title}</h1>
                    <p className="text-sm text-gray-400">
                        {format(new Date(session.date), "PPPP", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 space-y-6">

                {/* Top Row: Video + Participation Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                    {/* Video Area (Left - 2/3) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-black aspect-video rounded-lg overflow-hidden shadow-lg relative border border-white/10 flex flex-col">
                            {session.youtube_video_id || session.video_embed_url ? (
                                <CustomVideoPlayer
                                    videoId={session.youtube_video_id || extractYoutubeId(session.video_embed_url) || ''}
                                    className="w-full h-full absolute inset-0"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                                    <p>Nenhum vídeo disponível</p>
                                    {session.meet_link && (
                                        <Button asChild variant="outline" className="mt-2 border-white/10 hover:bg-white/5">
                                            <a href={session.meet_link} target="_blank" rel="noreferrer">
                                                Acessar Sala do Meet
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participation Info (Right - 1/3) */}
                    <div className="flex flex-col h-full lg:h-0 lg:min-h-full">
                        <div className="bg-card rounded-lg border border-white/10 shadow-sm flex flex-col overflow-hidden h-full">
                            <div className="p-4 border-b border-white/10 bg-card/50 px-6">
                                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                                    Detalhes da Sessão
                                </h3>
                            </div>
                            <div className="p-4 px-6 flex flex-col gap-6 flex-1 overflow-hidden">

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4 shrink-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            <Calendar className="w-3 h-3" /> Data
                                        </div>
                                        <div className="text-xl text-slate-100 font-bold tracking-tight">
                                            {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" /> Horário
                                        </div>
                                        <div className="text-xl text-slate-100 font-medium tracking-tight">
                                            {format(new Date(session.date), "HH:mm", { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-1 pt-4 border-t border-white/5 shrink-0">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Duração Real</label>
                                    <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                                        {formatDuration(session.duration_seconds, session.date, session.end_date)}
                                    </div>
                                </div>

                                {/* Attendees */}
                                {session.attendees && session.attendees.length > 0 && (
                                    <div className="flex flex-col flex-1 min-h-0 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-3 shrink-0">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Participantes</label>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 border border-white/5 px-2 py-0.5 rounded-full">{session.attendees.length}</span>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-2">
                                            {session.attendees.map((attendee, index) => {
                                                const isAccepted = attendee.responseStatus === 'accepted'

                                                return (
                                                    <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                                        <div className="relative shrink-0">
                                                            <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold border border-white/10 group-hover:border-white/20 transition-colors">
                                                                {(attendee.displayName || attendee.email).charAt(0).toUpperCase()}
                                                            </div>
                                                            {isAccepted && (
                                                                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 ring-2 ring-card">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                                                                </div>
                                                            )}
                                                            {!isAccepted && attendee.responseStatus === 'needsAction' && (
                                                                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 ring-2 ring-card">
                                                                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="truncate font-medium text-slate-200 group-hover:text-white transition-colors" title={attendee.displayName || attendee.email}>
                                                                {attendee.displayName || attendee.email.split('@')[0]}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 truncate">
                                                                {isAccepted ? 'Confirmado' : 'Convidado'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Doc/Resource Area - COLLAPSIBLE */}
                <div className={`bg-card rounded-lg border border-white/10 shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-auto`}>
                    <div
                        className="p-4 border-b border-white/10 bg-card font-medium text-sm flex justify-between items-center text-white cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-500/10 text-blue-400 p-1.5 rounded">
                                <Download className="w-4 h-4" />
                            </span>
                            <span>Notas & Resumo</span>
                            <span className="text-xs text-slate-500 ml-2">
                                {isNotesExpanded ? '(Clique para esconder)' : '(Clique para expandir)'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Edit Button (Admin Only) */}
                            {isAdmin && isNotesExpanded && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsEditing(true)
                                    }}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )}

                            {/* Tab Switcher (Only if Transcript exists and is expanded) */}
                            {isNotesExpanded && contentParts.transcript && !isEditing && (
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setActiveTab('notes')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'notes'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        Anotações
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('transcription')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'transcription'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        Transcrição
                                    </button>
                                </div>
                            )}

                            {isNotesExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                    </div>

                    {/* Content Area */}
                    {isNotesExpanded && (
                        <div className="flex-1 bg-white relative animate-in fade-in slide-in-from-top-2 duration-300">
                            {isEditing ? (
                                <div className="w-full bg-slate-100/50 flex flex-col items-center py-8">
                                    <div className="w-full max-w-[850px] bg-[#EFF6FF] shadow-xl rounded-xl border border-[#DBEAFE] p-8">
                                        <SessionEditor
                                            content={session.summary_html || ''} // TODO: Handle splitting transcript? Edit Full HTML? 
                                            // Ideally we edit the active tab... but transcript is usually separate.
                                            // Simplification: We edit the WHOLE summary_html field, so we must be careful.
                                            // The user says "Notas e Resumo".
                                            // If I edit `session.summary_html`, it includes transcript if it was there?
                                            // `summary_html` usually IS the whole thing.
                                            // Let's pass the FULL `session.summary_html` to the editor.
                                            // But wait, the view splits it using Regex.
                                            onSave={handleSaveNotes}
                                            onCancel={() => setIsEditing(false)}
                                        />
                                    </div>
                                </div>
                            ) : session.summary_html ? (
                                <div className="w-full bg-slate-100/50 flex flex-col items-center py-8">
                                    <div className="w-full max-w-[850px] bg-[#EFF6FF] shadow-xl rounded-xl border border-[#DBEAFE] p-8 md:p-16 prose prose-slate prose-lg focus:outline-none !text-slate-900 prose-headings:!text-slate-900 prose-p:!text-slate-800 prose-li:!text-slate-800 prose-strong:!text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500 transition-all font-sans [&_p]:min-h-[1.5em] [&_p:empty]:h-[1.5em]">
                                        <div dangerouslySetInnerHTML={{
                                            __html: activeTab === 'notes' ? contentParts.notes! : contentParts.transcript!
                                        }} />
                                    </div>
                                </div>
                            ) : session.doc_embed_url ? (
                                <iframe
                                    src={session.doc_embed_url}
                                    className="w-full h-[800px]"
                                    title="Session Document"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-8 text-center bg-[#0f172a] text-slate-400">
                                    <p>Nenhum documento anexado a esta sessão.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

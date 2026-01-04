export type Role = 'admin' | 'client'

export interface Organization {
    id: string
    name: string
    domain: string
    created_at: string
}

export interface Profile {
    id: string
    organization_id: string | null
    email: string
    role: Role
    avatar_url?: string
    created_at: string
}

export interface Session {
    id: string
    organization_id: string
    google_event_id?: string
    title: string
    date: string
    end_date?: string
    attendees?: {
        displayName?: string
        email: string
        responseStatus: string
    }[]
    meet_link?: string
    video_embed_url?: string
    duration_seconds?: number
    doc_embed_url?: string
    summary_text?: string
    summary_html?: string
    created_at: string
}

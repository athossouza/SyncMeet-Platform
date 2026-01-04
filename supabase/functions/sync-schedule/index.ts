import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { google } from "npm:googleapis@126.0.1"

// Environment Variables required:
// - SUPABASE_URL (Auto)
// - SUPABASE_SERVICE_ROLE_KEY (Auto)
// - GOOGLE_SERVICE_ACCOUNT_JSON (Must be set in Secrets)

const SERVICE_ACCOUNT_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")
const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID")

serve(async (req) => {
    try {
        console.log("⏰ Sync Schedule Triggered")

        if (!SERVICE_ACCOUNT_JSON) {
            throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON secret")
        }
        if (!CALENDAR_ID) {
            throw new Error("Missing GOOGLE_CALENDAR_ID secret")
        }

        // 1. Initialize Supabase Admin Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Initialize Google Calendar Client
        const credentials = JSON.parse(SERVICE_ACCOUNT_JSON)
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar.readonly']
        )
        const calendar = google.calendar({ version: 'v3', auth })

        // 3. Fetch Events (Last 1 month + Future 3 months)
        const now = new Date()
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const threeMonthsFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

        const res = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: oneMonthAgo.toISOString(),
            timeMax: threeMonthsFuture.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = res.data.items || []
        console.log(`📅 Found ${events.length} events`)

        // 4. Process Events
        for (const event of events) {
            if (!event.start?.dateTime && !event.start?.date) continue

            const startStr = event.start.dateTime || event.start.date
            // Basic filtering logic (matches local script)
            const title = event.summary || 'Sem título'

            // Extract Client Logic (naive approach same as script)
            // e.g. "Mentoria do [Hercules]" -> Client = Hercules
            // For now, defaulting to a known Organization or creating strictly if match found
            // This logic mirrors snippet: let orgName = title.split('-')[0].trim() ...

            let orgName = 'Desconhecido'
            if (title.includes('-')) orgName = title.split('-')[0].trim()
            if (title.includes('Mentoria')) orgName = title.replace('Mentoria', '').trim()

            // Note: In a real scenario, we'd need robust Organisation matching.
            // Here we assume the "Organization/Client" exists or we skip for safety to avoid dupes?
            // Actually, for sync, we should be idempotent.

            // Check if Organization ends with "LLC" or something? No, let's just stick to the script logic:
            // "Mentoria ATVEZA" -> Org "ATVEZA"

            // UPSERT Session
            // We use 'google_event_id' as unique key if available, assuming schema supports it.
            // If not, we rely on existing log logic. But Edge needs to be smart.

            // NOTE: The previous script did a lot of checks. 
            // Here we will do a simplified Sync: Update metadata if match found.

            const { data: existingSession } = await supabase
                .from('sessions')
                .select('id, organization_id')
                .eq('google_event_id', event.id)
                .single()

            // If we don't handle Organization creation here, we might miss new clients.
            // But avoiding complex logic in v1 Edge Function is wise.
            // Let's at least UPDATE existing sessions with new times/titles.

            if (existingSession) {
                await supabase.from('sessions').update({
                    title: title,
                    date: startStr,
                    end_date: event.end?.dateTime || event.end?.date,
                    meet_link: event.hangoutLink
                }).eq('id', existingSession.id)
                console.log(`Updated session: ${title}`)
            } else {
                // Insert logic would go here.
                // For now, logging.
                console.log(`New event found (not synced): ${title}`)
            }
        }

        return new Response(JSON.stringify({ success: true, processed: events.length }), {
            headers: { "Content-Type": "application/json" },
        })

    } catch (error) {
        console.error("Sync Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})

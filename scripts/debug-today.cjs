const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { google } = require('googleapis')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// --- Configuration ---
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function getAuth() {
    const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/service-account.json'
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        return new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_PATH,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
            projectId: 'projetosyncmeet',
        })
    }
    throw new Error('No Service Account found')
}

async function debugToday() {
    console.log('--- DEBUG: SYNC DIAGNOSIS FOR TODAY ---')

    // 1. Fetch Organizations
    const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, domain')

    const clientOrgs = organizations.filter(org => org.domain !== 'atveza.com')
    console.log(`Knowledge Base: ${clientOrgs.length} Client Domains loaded.`)
    clientOrgs.forEach(o => console.log(` - @${o.domain} (${o.name})`))

    // 2. Auth Google
    const auth = await getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    // 3. Fetch TODAY (Start of day to End of day? No, just list recently)
    // Let's look at the last 7 days to be safe
    const timeMin = new Date()
    timeMin.setDate(timeMin.getDate() - 7)

    console.log(`\nFetching events since: ${timeMin.toISOString()}...`)

    const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
    })

    const events = response.data.items || []
    console.log(`Found ${events.length} events in the last 7 days.`)

    // 4. Analyze specifically "Today" or recent ones
    const now = new Date()
    events.forEach(event => {
        const start = event.start.dateTime || event.start.date
        const summary = event.summary
        const attendees = event.attendees || []

        // Simple check: is it "today" or "yesterday" or "tomorrow"?
        // Just print everything found in the window
        console.log(`\n[EVENT] ${start} - "${summary}"`)

        // Match Check
        let matched = false
        let matchReason = ""

        if (attendees.length === 0) {
            matchReason = "❌ SKIP: No attendees found."
        } else {
            const domains = attendees.map(a => a.email ? a.email.split('@')[1] : 'unknown')
            console.log(`    Attendees: ${attendees.map(a => a.email).join(', ')}`)

            for (const d of domains) {
                const org = clientOrgs.find(o => o.domain === d)
                if (org) {
                    matched = true
                    matchReason = `✅ MATCH: Found domain @${d} -> ${org.name}`
                    break
                }
            }
            if (!matched) {
                matchReason = `❌ SKIP: No attendee domain matches known clients.`
            }
        }

        console.log(`    Result: ${matchReason}`)
    })
    console.log('\n--- END DEBUG ---')
}

debugToday().catch(console.error)

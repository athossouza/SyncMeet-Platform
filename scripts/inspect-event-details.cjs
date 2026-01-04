const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { google } = require('googleapis')

// --- Configuration ---
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const TARGET_TITLE = "Mentoria ATVEZA (teste)"

// Use Google Default Credentials (ADC)
const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    projectId: 'projetosyncmeet',
})

const calendar = google.calendar({ version: 'v3', auth })

async function inspectEvent() {
    try {
        console.log('🔄 Authenticating...')
        const authClient = await auth.getClient()

        console.log(`📅 Searching for event: "${TARGET_TITLE}"...`)

        // Calculate time range (wide range to find it)
        const now = new Date()
        const timeMin = new Date('2025-12-01').toISOString()
        const timeMax = new Date('2026-02-01').toISOString()

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []
        const targetEvent = events.find(e => e.summary === TARGET_TITLE)

        if (targetEvent) {
            console.log('✅ Event Found!')
            console.log(JSON.stringify(targetEvent, null, 2))
        } else {
            console.log('❌ Event NOT found with that exact title.')
            console.log('Found events:', events.map(e => e.summary))
        }

    } catch (error) {
        console.error('❌ Error:', error)
    }
}

inspectEvent()

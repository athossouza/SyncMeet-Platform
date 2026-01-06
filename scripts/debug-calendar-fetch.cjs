const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { google } = require('googleapis')
const fs = require('fs')

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/service-account.json' // Support local fallback if mapped
const TOKEN_PATH = path.join(__dirname, '../token.json')
const CREDENTIALS_PATH = path.join(__dirname, '../client_secret.json')

async function getAuth() {
    // 1. Try Service Account (Preferred for Servers)
    // Adjusted check for local dev
    const localServiceAccount = path.resolve(__dirname, '../service-account.json')

    if (fs.existsSync(localServiceAccount)) {
        console.log('🔑 Using Service Account credentials (Local)...')
        return new google.auth.GoogleAuth({
            keyFile: localServiceAccount,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
            projectId: 'projetosyncmeet',
        })
    }

    // 2. Try User OAuth Token
    if (fs.existsSync(TOKEN_PATH) && fs.existsSync(CREDENTIALS_PATH)) {
        console.log('👤 Using OAuth User Token...')
        const content = fs.readFileSync(CREDENTIALS_PATH)
        const keys = JSON.parse(content)
        const { client_secret, client_id, redirect_uris } = keys.installed || keys.web
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
        const tokenContent = fs.readFileSync(TOKEN_PATH)
        oAuth2Client.setCredentials(JSON.parse(tokenContent))
        return oAuth2Client
    }
    throw new Error('No valid Google credentials found.')
}

async function debugFetch() {
    const auth = await getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const timeMin = new Date('2025-03-19T00:00:00Z')
    console.log(`fetching events since ${timeMin.toISOString()}...`)

    const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin.toISOString(),
        maxResults: 50, // Same as current script
        singleEvents: true,
        orderBy: 'startTime',
    })

    const events = response.data.items || []
    console.log(`Found ${events.length} events.`)
    if (events.length > 0) {
        console.log(`First Event: ${events[0].start.dateTime || events[0].start.date} - ${events[0].summary}`)
        console.log(`Last Event:  ${events[events.length - 1].start.dateTime || events[events.length - 1].start.date} - ${events[events.length - 1].summary}`)
    }

    if (response.data.nextPageToken) {
        console.log('⚠️  NEXT PAGE TOKEN FOUND! (Pagination is required but missing in main script)')
    } else {
        console.log('No next page token.')
    }
}

debugFetch().catch(console.error)

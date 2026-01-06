const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { google } = require('googleapis')
const fs = require('fs')

const TOKEN_PATH = path.join(__dirname, '../token.json')
const CREDENTIALS_PATH = path.join(__dirname, '../client_secret.json')

async function debugOAuth() {
    console.log('--- DEBUG: OAUTH TOKEN VALIDITY CHECK ---')

    if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(CREDENTIALS_PATH)) {
        console.error('❌ Missing token.json or client_secret.json')
        return
    }

    console.log('👤 Using OAuth User Token...')
    const content = fs.readFileSync(CREDENTIALS_PATH)
    const keys = JSON.parse(content)
    const { client_secret, client_id, redirect_uris } = keys.installed || keys.web
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    const tokenContent = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(tokenContent))

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

    // Try a simple list
    try {
        const timeMin = new Date()
        timeMin.setDate(timeMin.getDate() - 1)
        console.log(`Fetching events since: ${timeMin.toISOString()}...`)

        const response = await calendar.events.list({
            calendarId: 'primary', // Or specific ID
            timeMin: timeMin.toISOString(),
            maxResults: 10,
            singleEvents: true,
        })
        console.log(`✅ SUCCESS! Found ${response.data.items.length} events using token.json`)
    } catch (e) {
        console.error('❌ FAILED with token.json:')
        console.error(e.message)
    }
}

debugOAuth().catch(console.error)

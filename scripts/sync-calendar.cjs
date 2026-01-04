const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { google } = require('googleapis')
const { createClient } = require('@supabase/supabase-js')

// --- Configuration ---
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
// Fallback to VITE_SUPABASE_ANON_KEY if SERVICE_ROLE is missing, though SERVICE_ROLE is preferable
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

// --- Validation ---
if (!CALENDAR_ID || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing required environment variables.')
    console.error('Required: GOOGLE_CALENDAR_ID, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

// --- Initialization ---
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Use Google Default Credentials (ADC)
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
    ],
    projectId: 'projetosyncmeet',
})

const calendar = google.calendar({ version: 'v3', auth })
const drive = google.drive({ version: 'v3', auth })
const youtube = google.youtube({ version: 'v3', auth })

async function syncEvents() {
    try {
        console.log('🔄 Authenticating with Google (ADC)...')

        // Attempt to get client credentials
        const authClient = await auth.getClient()
        const projectId = await auth.getProjectId()
        console.log(`✅ Authenticated. Project ID: ${projectId}`)

        // --- 1. Fetch Organizations for Matching ---
        console.log('🏢 Fetching organizations...')
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, domain, youtube_playlist_id')

        if (orgError) {
            console.error('❌ Error fetching organizations:', orgError)
            throw new Error(`Error fetching organizations: ${orgError.message}`)
        }

        // Filter out the user's own organization if needed, or keeping it is fine 
        // but we specifically look for CLIENT domains in attendees.
        // Let's create a map or list to check against.
        const clientOrgs = organizations.filter(org => org.domain !== 'atveza.com') // Assuming atveza.com is the host
        console.log(`ℹ️  Tracking ${clientOrgs.length} client domains: ${clientOrgs.map(o => o.domain).join(', ')}`)

        // --- 2. Fetch Calendar Events ---
        // Calculate time range (e.g., last 30 days to next 30 days)
        const now = new Date()
        const timeMin = new Date(now)
        timeMin.setDate(now.getDate() - 30) // Look back 30 days

        console.log(`📅 Fetching events from ${CALENDAR_ID}...`)

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: timeMin.toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []
        console.log(`🔎 Found ${events.length} events.`)

        if (events.length === 0) {
            console.log('No upcoming events found.')
            return
        }

        let syncedCount = 0

        // --- 3. Process & Filter Events ---
        for (const event of events) {
            const title = event.summary
            if (!title) continue

            const description = event.description || ''
            const startTimeVal = event.start.dateTime || event.start.date
            if (!startTimeVal) continue
            const startTime = new Date(startTimeVal).toISOString()

            const videoLink = event.hangoutLink
            const attendees = event.attendees || []
            const attachments = event.attachments || []

            // Extract Links from Attachments
            let recordingLink = null
            let docLinkRaw = null
            let durationSeconds = null
            let summaryHtml = null

            // 1. Try to find Recording in Attachments
            const recordingAttachment = attachments.find(att =>
                att.mimeType?.startsWith('video/') ||
                att.title?.includes('Recording')
            )
            if (recordingAttachment) {
                if (recordingAttachment.fileId) {
                    recordingLink = `https://drive.google.com/file/d/${recordingAttachment.fileId}/preview`

                    // FETCH DURATION
                    try {
                        const meta = await drive.files.get({
                            fileId: recordingAttachment.fileId,
                            fields: 'videoMediaMetadata'
                        })
                        if (meta.data.videoMediaMetadata?.durationMillis) {
                            durationSeconds = Math.round(meta.data.videoMediaMetadata.durationMillis / 1000)
                        }
                    } catch (err) {
                        console.error(`    ⚠️ Failed to fetch metadata: ${err.message}`)
                    }
                } else {
                    recordingLink = recordingAttachment.fileUrl
                }
            }

            // 2. Try to find Document in Attachments
            const docAttachment = attachments.find(att =>
                att.mimeType?.includes('document') ||
                att.mimeType?.includes('pdf')
            )
            if (docAttachment) {
                if (docAttachment.fileId) {
                    if (docAttachment.mimeType?.includes('google-apps.document')) {
                        docLinkRaw = `https://docs.google.com/document/d/${docAttachment.fileId}/preview`

                        // FETCH CONTENT
                        try {
                            const contentResp = await drive.files.export({
                                fileId: docAttachment.fileId,
                                mimeType: 'text/html'
                            })
                            summaryHtml = contentResp.data
                        } catch (err) {
                            console.error(`    ⚠️ Failed to download doc content: ${err.message}`)
                        }
                    } else {
                        docLinkRaw = `https://drive.google.com/file/d/${docAttachment.fileId}/preview`
                    }
                } else {
                    docLinkRaw = docAttachment.fileUrl
                }
            }

            // Fallback: Check Description if not found in attachments (Legacy support)
            if (!docLinkRaw) {
                const docMatch = description.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/)
                docLinkRaw = docMatch ? docMatch[0] : null
            }

            const docLink = docLinkRaw

            // --- DOMAIN MATCHING LOGIC ---
            // We look for an attendee that matches one of our Client Organizations domains
            let matchedOrgId = null
            let matchedOrgName = null

            for (const attendee of attendees) {
                if (!attendee.email) continue

                const attendeeDomain = attendee.email.split('@')[1]

                // Find existing org with this domain
                const org = clientOrgs.find(o => o.domain === attendeeDomain)
                if (org) {
                    matchedOrgId = org.id
                    matchedOrgName = org.name
                    break // Found a match, stop looking
                }
            }

            // If no client attendee found, SKIP this event
            if (!matchedOrgId) {
                continue
            }

            console.log(`\nProcessing: ${title} (${startTime})`)
            console.log(`  ✅ Linked to Client: ${matchedOrgName}`)

            // Prepare Data Object
            const sessionData = {
                google_event_id: event.id,
                title: title,
                date: startTime,
                end_date: event.end?.dateTime || event.end?.date || null,
                organization_id: matchedOrgId,
                video_embed_url: recordingLink, // The actual Recording file (Drive)
                duration_seconds: durationSeconds,
                meet_link: videoLink, // The Google Meet Join Link
                doc_embed_url: docLink,
                summary_html: summaryHtml,
                summary_text: description,
                attendees: attendees.map(a => ({ email: a.email, responseStatus: a.responseStatus, displayName: a.displayName }))
            }

            // 4. Upsert Session (Check if exists by Google ID OR Date+Title)
            let matchQuery = supabase.from('sessions').select('id, google_event_id, youtube_video_id').eq('google_event_id', event.id).maybeSingle()

            // If google_event_id isn't in DB yet (legacy), try finding by date + title
            let { data: existing, error: matchError } = await matchQuery

            if (!existing) {
                const { data: legacyMatch } = await supabase
                    .from('sessions')
                    .select('id, google_event_id, youtube_video_id')
                    .eq('date', startTime)
                    .eq('title', title)
                    .maybeSingle()

                if (legacyMatch) existing = legacyMatch
            }

            // --- YOUTUBE INTEGRATION ---
            // Only if we have a recording file from Drive
            if (recordingAttachment && recordingAttachment.fileId) {
                // If we already have a YouTube ID in DB, we skip upload
                if (!existing?.youtube_video_id && !sessionData.youtube_video_id) {
                    try {
                        const playlistId = await getOrCreatePlaylist(matchedOrgId, matchedOrgName)
                        if (playlistId) {
                            console.log(`    🎥 Starting upload to YouTube (Playlist: ${matchedOrgName})...`)
                            const youtubeId = await uploadVideoToYoutube(
                                recordingAttachment.fileId,
                                title,
                                playlistId
                            )
                            if (youtubeId) {
                                console.log(`    ✅ Uploaded to YouTube: ${youtubeId}`)
                                sessionData.youtube_video_id = youtubeId
                                sessionData.video_embed_url = `https://www.youtube.com/embed/${youtubeId}`
                            }
                        }
                    } catch (ytErr) {
                        console.error(`    ⚠️ YouTube Upload Failed: ${ytErr.message}`)
                    }
                } else if (existing?.youtube_video_id) {
                    // Preserve existing YT data if we are just updating
                    // Actually, if existing has YT ID, we should probably ensure sessionData uses it
                    // to avoid overwriting with Drive link if that was the fallback logic
                    sessionData.youtube_video_id = existing.youtube_video_id
                    sessionData.video_embed_url = `https://www.youtube.com/embed/${existing.youtube_video_id}`
                }
            }


            if (existing) {
                console.log('  🔄 Updating existing session...')
                const { error: updateError } = await supabase
                    .from('sessions')
                    .update(sessionData)
                    .eq('id', existing.id)

                if (updateError) console.error('  ❌ Error updating:', updateError.message)
                else console.log('  ✅ Session updated!')
            } else {
                console.log('  ✨ Creating new session...')
                const { error: insertError } = await supabase
                    .from('sessions')
                    .insert(sessionData)

                if (insertError) console.error('  ❌ Error inserting:', insertError.message)
                else {
                    console.log('  ✅ Session created!')
                    syncedCount++
                }
            }

        }

        console.log(`\n🎉 Sync complete. ${syncedCount} new sessions created.`)

    } catch (error) {
        console.error('❌ Error during sync execution:', error)
        throw error // Re-throw so the API knows it failed
    }
}

// Allow running directly
if (require.main === module) {
    syncEvents().catch(console.error)
}

module.exports = { syncEvents }

// --- Helpers ---

async function getOrCreatePlaylist(orgId, orgName) {
    // 1. Check if DB has it already (we need to re-fetch org to be sure or cache it)
    // For simplicity, let's query DB for this orgId
    const { data: org } = await supabase.from('organizations').select('youtube_playlist_id').eq('id', orgId).single()

    if (org?.youtube_playlist_id) return org.youtube_playlist_id

    // 2. Check/Create on YouTube
    // Verify if exists by title? No, let's just create.
    try {
        const res = await youtube.playlists.insert({
            part: 'snippet,status',
            resource: {
                snippet: { title: orgName },
                status: { privacyStatus: 'unlisted' }
            }
        })
        const playlistId = res.data.id
        console.log(`    ✨ Created YouTube Playlist: ${orgName} (${playlistId})`)

        // Save to DB
        await supabase.from('organizations').update({ youtube_playlist_id: playlistId }).eq('id', orgId)

        return playlistId
    } catch (e) {
        console.error(`    ❌ Failed to create playlist: ${e.message}`)
        if (e.response) console.error('    Details:', JSON.stringify(e.response.data, null, 2))
        return null
    }
}

async function uploadVideoToYoutube(driveFileId, title, playlistId) {
    try {
        // Stream from Drive
        const driveRes = await drive.files.get(
            { fileId: driveFileId, alt: 'media' },
            { responseType: 'stream' }
        )

        // Upload to YouTube
        const ytRes = await youtube.videos.insert({
            part: 'snippet,status',
            media: { body: driveRes.data },
            resource: {
                snippet: { title: title, categoryId: '22' }, // 22 = People & Blogs
                status: { privacyStatus: 'unlisted' }
            }
        })

        const videoId = ytRes.data.id

        // Add to Playlist
        await youtube.playlistItems.insert({
            part: 'snippet',
            resource: {
                snippet: {
                    playlistId: playlistId,
                    resourceId: { kind: 'youtube#video', videoId: videoId }
                }
            }
        })

        return videoId
    } catch (e) {
        throw e
    }
}

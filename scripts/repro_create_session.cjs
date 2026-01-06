const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function reproduceError() {
    console.log('🔄 Attempting to replicate Session Creation Error...')

    // 1. Get an Organization ID
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
    if (!orgs || orgs.length === 0) {
        console.error('❌ No organizations found to test with.')
        return
    }
    const orgId = orgs[0].id
    console.log(`organization_id: ${orgId}`)

    // 2. Prepare Payload (matching AdminSessions.tsx)
    const payload = {
        title: 'Repro Test Session',
        date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3600000).toISOString(),
        organization_id: "", // INTENTIONALLY EMPTY STRING
        video_embed_url: '', // Empty string as in the screenshot
        summary_text: 'Test summary',
        summary_html: '<p>Debug content</p>',
        attendees: [{ email: 'test@example.com', responseStatus: 'needsAction' }]
    }

    console.log('📦 Payload:', payload)

    // 3. Attempt Insert
    const { data, error } = await supabase.from('sessions').insert(payload).select()

    if (error) {
        console.error('❌ INSERT FAILED!')
        console.error('Error Code:', error.code)
        console.error('Error Message:', error.message)
        console.error('Error Details:', error.details)
        console.error('Error Hint:', error.hint)
    } else {
        console.log('✅ INSERT SUCCESSFUL!', data)
        // Cleanup
        await supabase.from('sessions').delete().eq('id', data[0].id)
        console.log('🧹 Cleanup: Deleted test session.')
    }
}

reproduceError()

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, 'sb_publishable_pocpB3DHMqEvKsZSoqZADQ_PwhHYkCa')

async function reproduceAsUser() {
    console.log('👤 Authenticating as User...')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'athos@atveza.com',
        password: '@Ahs221400'
    })

    if (authError) {
        console.error('❌ Login Failed:', authError.message)
        return
    }

    console.log('✅ Logged in as:', authData.user.email)
    console.log('🆔 User ID:', authData.user.id)

    // 1. Get an Organization ID (as user)
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id, name').limit(1)

    if (orgError) {
        console.error('❌ Failed to fetch organizations:', orgError.message)
        // If we can't fetch orgs, we likely can't insert sessions either.
        // It might be RLS blocking 'select' too.
        if (orgError.code === '42501') console.log('🔒 Permission Denied (RLS) on Organizations')
        return
    }

    if (!orgs || orgs.length === 0) {
        console.error('❌ No organizations found for this user.')
        return
    }

    const orgId = orgs[0].id
    console.log(`organization_id: ${orgId} (${orgs[0].name})`)

    // 2. Prepare Payload
    const payload = {
        title: 'DEBUG USER REPRO',
        date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3600000).toISOString(),
        organization_id: orgId,
        video_embed_url: '',
        summary_text: '',
        summary_html: '<p>Debug content user</p>',
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
        await supabase.from('sessions').delete().eq('id', data[0].id)
        console.log('🧹 Cleanup: Deleted test session.')
    }
}

reproduceAsUser()

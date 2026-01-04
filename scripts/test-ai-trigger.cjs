const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function triggerAI() {
    console.log('🔍 Looking for a session to update...')

    // Find a session that has summary_html
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .not('summary_html', 'is', null)
        .limit(1)

    if (error || !sessions || sessions.length === 0) {
        console.error('❌ No sessions with summary_html found.')
        return
    }

    const session = sessions[0]
    console.log(`🎯 Target Session: ${session.title} (${session.id})`)
    console.log(`📝 Current Summary Text: ${session.summary_text || '(Empty)'}`)

    // Update summary_html slightly to trigger the webhook
    // We append a comment at the end
    const newHtml = session.summary_html + '<!-- Trigger AI Update -->'

    const { error: updateError } = await supabase
        .from('sessions')
        .update({ summary_html: newHtml })
        .eq('id', session.id)

    if (updateError) {
        console.error('❌ Update failed:', updateError)
    } else {
        console.log('✅ Session updated! Webhook should fire now.')
        console.log('⏳ Waiting 10 seconds for Edge Function...')

        await new Promise(r => setTimeout(r, 10000))

        const { data: updatedSession } = await supabase
            .from('sessions')
            .select('summary_text')
            .eq('id', session.id)
            .single()

        console.log('--- Result ---')
        console.log('📝 New Summary Text:', updatedSession.summary_text)

        if (updatedSession.summary_text && updatedSession.summary_text !== session.summary_text) {
            console.log('🎉 SUCCESS: AI Summary generated!')
        } else {
            console.log('⚠️ WARNING: Summary text did not change. Check Edge Function logs.')
        }
    }
}

triggerAI()

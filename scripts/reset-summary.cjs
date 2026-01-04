const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function resetAndInspect() {
    const sessionId = '3a30584d-609e-4386-b257-5f27aeaa2f3b'

    // 1. Get current HTML
    const { data: session } = await supabase
        .from('sessions')
        .select('summary_html')
        .eq('id', sessionId)
        .single()

    console.log('--- 📄 REAL CONTENT IN DB ---')
    console.log('Length:', session.summary_html ? session.summary_html.length : 0)
    // console.log(session.summary_html ? session.summary_html.substring(0, 500) + '...' : 'NULL')

    // 2. Clear summary_text to allow AI re-run
    const { error } = await supabase
        .from('sessions')
        .update({ summary_text: null })
        .eq('id', sessionId)

    if (!error) console.log('✅ summary_text cleared.')
    else console.error('Error clearing:', error)
}

resetAndInspect()

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function readSummary() {
    console.log('🔍 Reading session summary...')

    // ID used in curl: 3a30584d-609e-4386-b257-5f27aeaa2f3b
    const { data: session } = await supabase
        .from('sessions')
        .select('title, summary_text')
        .eq('id', '3a30584d-609e-4386-b257-5f27aeaa2f3b')
        .single()

    if (session) {
        console.log('--- SESSION DATA ---')
        console.log('Title:', session.title)
        console.log('Summary Text (New):', session.summary_text)
    } else {
        console.log('Session not found.')
    }
}

readSummary()

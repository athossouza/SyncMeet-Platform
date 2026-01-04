const { createClient } = require('@supabase/supabase-js')
const axios = require('axios')
require('dotenv').config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testEdgeFunction() {
    const sessionId = '3a30584d-609e-4386-b257-5f27aeaa2f3b'

    // 1. Get real data
    const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

    // Simulate Webhook Payload
    const payload = {
        type: 'UPDATE',
        table: 'sessions',
        record: session, // This contains the real summary_html (~19KB)
        old_record: session
    }

    console.log(`🚀 Sending payload (~${JSON.stringify(payload).length} bytes) to Edge Function...`)

    try {
        const response = await axios.post(
            'https://dpalspcavpcfamivjlbm.supabase.co/functions/v1/ai-summary',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        )
        console.log('✅ Success:', response.data)
    } catch (error) {
        console.error('❌ Error calling Edge Function:')
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Data:', error.response.data)
        } else {
            console.error(error.message)
        }
    }
}

testEdgeFunction()

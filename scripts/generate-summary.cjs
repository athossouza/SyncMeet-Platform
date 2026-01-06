const { createClient } = require('@supabase/supabase-js')
const { OpenAI } = require('openai')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
    console.error('❌ Missing required environment variables.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

async function generateSummaries() {
    console.log('🔄 Checking for sessions needing AI summary...')

    // Fetch sessions with summary_html but NO summary_text
    // Or where summary_text is null/empty
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('id, title, summary_html')
        .not('summary_html', 'is', null)
        .is('summary_text', null)
        .limit(5) // Process in batches to avoid timeouts

    if (error) {
        console.error('Error fetching sessions:', error)
        return
    }

    if (!sessions || sessions.length === 0) {
        console.log('✅ No pending sessions found.')
        return
    }

    console.log(`📝 Found ${sessions.length} sessions to process.`)

    for (const session of sessions) {
        console.log(`   > Processing: ${session.title}`)

        try {
            // Remove HTML tags for token efficiency
            const cleanText = session.summary_html.replace(/<[^>]*>?/gm, "")

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert copywriter. Analyze the meeting notes and generate a SINGLE, punchy, attention-grabbing phrase (max 25 words) that captures the main topic or outcome of this session in Portuguese. Do NOT use quotes." },
                    { role: "user", content: cleanText }
                ],
                model: "gpt-4o-mini",
            })

            const summaryText = completion.choices[0].message.content

            // Update DB
            const { error: updateError } = await supabase
                .from('sessions')
                .update({ summary_text: summaryText })
                .eq('id', session.id)

            if (updateError) {
                console.error(`     ❌ Failed to save summary: ${updateError.message}`)
            } else {
                console.log(`     ✅ Saved summary: "${summaryText}"`)
            }

        } catch (err) {
            console.error(`     ⚠️ AI/Processing Error: ${err.message}`)
        }
    }
}

// Allow running directly
if (require.main === module) {
    generateSummaries().catch(console.error)
}

module.exports = { generateSummaries }

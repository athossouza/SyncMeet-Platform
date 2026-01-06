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

const SESSION_ID = 'ff2301db-18c2-4dd7-8642-5d86c08dd1cd';

async function debugSummary() {
    console.log(`🔍 Inspecting Session: ${SESSION_ID}`)

    const { data: session, error } = await supabase
        .from('sessions')
        .select('id, title, summary_html, summary_text')
        .eq('id', SESSION_ID)
        .single()

    if (error) {
        console.error('❌ Error fetching session:', error)
        return
    }

    if (!session) {
        console.error('❌ Session not found')
        return
    }

    console.log(`   Title: ${session.title}`)
    console.log(`   HTML Length: ${session.summary_html ? session.summary_html.length : 'NULL'}`)
    console.log(`   Current Summary Text: '${session.summary_text}' (Type: ${typeof session.summary_text})`)

    if (!session.summary_html) {
        console.log('❌ Cannot generate: Missing summary_html')
        return
    }

    if (session.summary_text && session.summary_text.trim().length > 0) {
        console.log('⚠️  Summary text already exists. Forcing regeneration...')
    }

    console.log('🧠 Generating Summary via OpenAI...')
    try {
        const cleanText = session.summary_html.replace(/<[^>]*>?/gm, "")
        console.log(`   Clean Text Length: ${cleanText.length} chars`)

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert copywriter. Analyze the meeting notes and generate a SINGLE, punchy, attention-grabbing phrase (max 25 words) that captures the main topic or outcome of this session in Portuguese. Do NOT use quotes." },
                { role: "user", content: cleanText }
            ],
            model: "gpt-4o-mini",
        })

        const summaryText = completion.choices[0].message.content
        console.log(`   ✅ Generated: "${summaryText}"`)

        // Update DB
        const { error: updateError } = await supabase
            .from('sessions')
            .update({ summary_text: summaryText })
            .eq('id', session.id)

        if (updateError) {
            console.error(`   ❌ Failed to save summary: ${updateError.message}`)
        } else {
            console.log(`   ✅ Saved to Database!`)
        }

    } catch (err) {
        console.error(`   ❌ AI/Processing Error: ${err.message}`)
        if (err.response) {
            console.error(err.response.data)
        }
    }
}

debugSummary().catch(console.error)

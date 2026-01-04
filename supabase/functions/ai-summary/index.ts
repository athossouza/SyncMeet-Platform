import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { OpenAI } from "npm:openai@4.24.1"

// Environment Variables:
// - OPENAI_API_KEY
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

serve(async (req) => {
    try {
        const payload = await req.json()

        // Webhook Payload structure: { type: 'UPDATE', table: 'sessions', record: { ... }, old_record: { ... } }
        const { record } = payload

        if (!record || !record.summary_html || record.summary_text) {
            return new Response("Skipped: No summary_html or summary_text already exists", { status: 200 })
        }

        console.log(`🤖 Generating summary for Session ${record.id}`)

        const openai = new OpenAI({
            apiKey: Deno.env.get("OPENAI_API_KEY"),
        })

        // Remove HTML tags for token efficiency
        const cleanText = record.summary_html.replace(/<[^>]*>?/gm, "")

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert copywriter. Analyze the meeting notes and generate a SINGLE, punchy, attention-grabbing phrase (max 25 words) that captures the main topic or outcome of this session in Portuguese. Do NOT use quotes." },
                { role: "user", content: cleanText }
            ],
            model: "gpt-4o-mini",
        })

        const summaryText = completion.choices[0].message.content

        // Update DB
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { error } = await supabase
            .from('sessions')
            .update({ summary_text: summaryText })
            .eq('id', record.id)

        if (error) throw error

        console.log(`✅ Summary saved: ${summaryText}`)

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        })

    } catch (error) {
        console.error("AI Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})

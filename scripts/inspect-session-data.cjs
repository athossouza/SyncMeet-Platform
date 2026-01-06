const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSessions() {
    console.log('🔍 Inspecting Sessions Data...');

    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('id, title, summary_text, summary_html')
        .limit(5);

    if (error) {
        console.error('❌ Error fetching sessions:', error);
        return;
    }

    if (!sessions || sessions.length === 0) {
        console.log('⚠️ No sessions found.');
        return;
    }

    console.log(`✅ Found ${sessions.length} sessions. Displaying sample:`);
    sessions.forEach(s => {
        console.log('------------------------------------------------');
        console.log(`ID: ${s.id}`);
        console.log(`Title: ${s.title}`);
        console.log(`Summary Text (Len): ${s.summary_text ? s.summary_text.length : 0}`);
        console.log(`Summary HTML (Len): ${s.summary_html ? s.summary_html.length : 0}`);
        if (s.summary_html) console.log(`HTML Preview: ${s.summary_html.substring(0, 50)}...`);
    });
}

inspectSessions();

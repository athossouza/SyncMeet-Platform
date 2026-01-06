const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys. URL:', supabaseUrl, 'Key:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSession() {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', '5ff036c6-233c-4cbc-a240-16c63b75178f')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Session Data:', JSON.stringify(data, null, 2));
    }
}

fetchSession();

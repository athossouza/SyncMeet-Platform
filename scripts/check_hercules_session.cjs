require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

// Use Service Role Key to bypass RLS for verification
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const HERCULES_ORG_ID = '7bbf39b2-4137-426f-b224-ddf38bfc2717';

async function checkSession() {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('organization_id', HERCULES_ORG_ID)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching sessions:', error);
    } else {
        console.log('Most recent session for HERCULES:', data);
    }
}

checkSession();

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Use ANON key to simulate client-side/user interaction
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const TARGET_ORG_ID = '7bbf39b2-4137-426f-b224-ddf38bfc2717'; // HERCULES

async function testCreate() {
    console.log('Logging in as athos@atveza.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'athos@atveza.com',
        password: '@Ahs221400'
    });

    if (authError) {
        console.error('Login failed:', authError);
        return;
    }
    console.log('Login successful. User ID:', authData.user.id);

    const payload = {
        organization_id: TARGET_ORG_ID,
        title: 'Test Session for Hercules',
        date: new Date().toISOString(),
        summary_html: '<p>Test summary content for other org</p>',
        summary_text: 'Test summary content for other org'
    };

    console.log('Attempting to create session for different organization:', TARGET_ORG_ID);

    const { data, error } = await supabase
        .from('sessions')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('FAILED to create session:', error);
        // If RLS error, it usually looks like code '42501' (insufficient_privilege) or similar.
    } else {
        console.log('SUCCESS! Session created:', data);
    }
}

testCreate();

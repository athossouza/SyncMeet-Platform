require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
    if (orgError) console.error('Org Error:', orgError);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('email', 'athos@atveza.com')
        .single();

    if (profileError) console.error('Profile Error:', profileError);

    console.log('Organizations found:', orgs);
    console.log('User Profile:', JSON.stringify(profile, null, 2));

    // If only one org exists (likely ATVEZA), create a dummy one for testing
    if (orgs && orgs.length === 1) {
        console.log('Only one org found. Creating a test organization...');
        const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({ name: 'Test Org Non-Atveza', slug: 'test-org-non-atveza' })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create test org:', createError);
        } else {
            console.log('Created new test org:', newOrg);
        }
    }
}

check();

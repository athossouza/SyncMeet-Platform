require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRLS() {
    const { data, error } = await supabase
        .rpc('get_policies_for_table', { table_name: 'sessions' });

    // Since we probably don't have that RPC, let's just try to insert as a non-admin user simulation if possible,
    // or better, just read the schema.sql file again if it has policies defined.
    // If schema.sql is not up to date with DB, we might miss things.
    // We can query pg_policies via SQL if we have direct access, but we only have supabase client.
    // Supabase JS doesn't expose policy management easily.

    // Alternative: Check the profile role again to be sure.
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'athos@atveza.com').single();
    console.log('User Role:', profile?.role);
}

checkRLS();

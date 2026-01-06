const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addColumn() {
    console.log('🔍 Checking if summary_html column exists...');

    // Try to select the column to see if it exists
    const { data, error } = await supabase.from('sessions').select('summary_html').limit(1);

    if (error && error.code === 'PGRST100') { // Check for column not found error code (approximate)
        console.log('⚠️ Column likely missing. Attempting to add it via SQL...');
        // Using RPC or raw SQL if enabled. Since we don't have direct SQL access usually, 
        // we might need to rely on the user running this in their dashboard, 
        // OR if we have a function for 'exec_sql' (common in these setups).
        // Checking schema.sql, there is no exec_sql function.

        console.log('❌ Cannot alter table via client. PLEASE RUN THIS SQL IN SUPABASE DASHBOARD:');
        console.log('ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS summary_html TEXT;');
    } else if (error) {
        console.error('❌ Error checking column:', error);
    } else {
        console.log('✅ Column summary_html ALREADY EXISTS.');
    }
}

// Since I can't effectively run DDL via the JS client without a helper, 
// I will try to use the `rpc` if available, or just log the needed change for the user 
// if I confirm it's missing.

// However, I can try to Infer it from the error of the failed insert.
// Let's rely on the previous finding: Schema.sql didn't have it.
// I will create a migration file `scripts/add_summary_html.sql` and ask user to run it?
// Or I can try to deploy it?
// Actually, earlier I saw `scripts/run-migration.cjs` in the user's open files list.
// Let's see if I can use that.

addColumn();

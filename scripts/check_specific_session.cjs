require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecificSession() {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('title', 'Browser Test Session Success');

    if (error) {
        console.error('Error fetching sessions:', error);
    } else {
        console.log('Sessions with title "Browser Test Session Success":', data);
    }
}

checkSpecificSession();

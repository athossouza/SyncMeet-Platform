const { Client } = require('pg');

// Connection String from .env
const connectionString = 'postgresql://postgres.dpalspcavpcfamivjlbm:H9w5U2c%3FidnMw%25f@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
});

const defaultAttendees = [
    { email: 'jean.fredel@herculesmotores.com.br', responseStatus: 'accepted' },
    { email: 'ian.rocha@herculesmotores.com.br', responseStatus: 'accepted' },
    { email: 'kauane.miranda@herculesmotores.com.br', responseStatus: 'accepted' },
    { email: 'athos@atveza.com', responseStatus: 'accepted' }
];

async function run() {
    try {
        console.log('Connecting to Database...');
        await client.connect();

        console.log('Finding Orphan Sessions (Empty Attendees)...');

        // Select count first
        const checkRes = await client.query(`
            SELECT count(*) 
            FROM public.sessions 
            WHERE attendees IS NULL OR jsonb_array_length(attendees) = 0
        `);

        const count = checkRes.rows[0].count;
        console.log(`found ${count} orphan sessions.`);

        if (parseInt(count) > 0) {
            console.log('Updating Orphan Sessions...');
            const updateRes = await client.query(`
                UPDATE public.sessions
                SET attendees = $1
                WHERE attendees IS NULL OR jsonb_array_length(attendees) = 0
            `, [JSON.stringify(defaultAttendees)]);

            console.log(`✅ Updated ${updateRes.rowCount} sessions with default attendees.`);
        } else {
            console.log('No orphan sessions found to update.');
        }

    } catch (err) {
        console.error('❌ Error fixing sessions:', err);
    } finally {
        await client.end();
    }
}

run();

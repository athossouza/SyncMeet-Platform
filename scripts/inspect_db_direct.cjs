require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.SUPABASE_URL_ACCESS,
});

async function inspectColumns() {
    try {
        await client.connect();
        console.log('Connected to Database via Postgres Client');

        const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'sessions' AND table_schema = 'public';
    `);

        console.log('--- Columns in sessions table ---');
        console.table(res.rows);

        // Also check for triggers
        const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'sessions';
    `);

        console.log('--- Triggers on sessions table ---');
        console.table(triggers.rows);

    } catch (err) {
        console.error('Database inspection error:', err);
    } finally {
        await client.end();
    }
}

inspectColumns();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection String from .env
const connectionString = 'postgresql://postgres.dpalspcavpcfamivjlbm:H9w5U2c%3FidnMw%25f@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
});

const sqlFilePath = path.join(__dirname, '../supabase/policies/strict_participant_access.sql');

async function run() {
    try {
        console.log('Connecting to Supabase Database...');
        await client.connect();

        console.log('Reading SQL file...');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);

        console.log('✅ Policy Applied Successfully.');
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.dpalspcavpcfamivjlbm:H9w5U2c%3FidnMw%25f@aws-1-us-east-1.pooler.supabase.com:6543/postgres'

const client = new Client({
    connectionString,
})

async function runMigration() {
    try {
        await client.connect()
        console.log('🔌 Connected to Database.')

        const sql = fs.readFileSync(path.join(__dirname, 'migration_add_summary_html.sql'), 'utf8');

        console.log('🚧 Running Migration...')
        await client.query(sql)
        console.log('✅ Migration Executed Successfully!')

    } catch (err) {
        console.error('❌ Migration Failed:', err)
    } finally {
        await client.end()
    }
}

runMigration()

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection String from .env
const connectionString = 'postgresql://postgres.dpalspcavpcfamivjlbm:H9w5U2c%3FidnMw%25f@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function backup() {
    try {
        console.log('Connecting to Database...');
        await client.connect();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const data = {};

        console.log('Backing up Organizations...');
        const orgs = await client.query('SELECT * FROM public.organizations');
        data.organizations = orgs.rows;

        console.log('Backing up Profiles...');
        const profiles = await client.query('SELECT * FROM public.profiles');
        data.profiles = profiles.rows;

        console.log('Backing up Sessions...');
        const sessions = await client.query('SELECT * FROM public.sessions');
        data.sessions = sessions.rows;

        const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

        console.log(`✅ Backup successful! Saved to: ${backupFile}`);
        console.log(`   - Organizations: ${data.organizations.length}`);
        console.log(`   - Profiles: ${data.profiles.length}`);
        console.log(`   - Sessions: ${data.sessions.length}`);

    } catch (err) {
        console.error('❌ Backup failed:', err);
    } finally {
        await client.end();
    }
}

backup();

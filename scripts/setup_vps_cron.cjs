const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();

const CRON_JOB = '0 22 * * * cd /root/syncmeet && docker exec syncmeet node scripts/sync-calendar.cjs >> /var/log/syncmeet_cron.log 2>&1';

conn.on('ready', () => {
    console.log('SSH Ready. Setting up Cron Job...');

    // Check existing cron
    conn.exec('crontab -l', (err, stream) => {
        if (err) throw err;
        let existingCron = '';

        stream.on('data', (data) => {
            existingCron += data.toString();
        }).on('close', () => {

            // Check if job exists
            if (existingCron.includes('syncmeet_cron.log')) {
                console.log('Cron job already exists. Skipping.');
                conn.end();
                return;
            }

            // Append new job
            const newCron = existingCron + '\n' + CRON_JOB + '\n';

            // Write back (using echo piping to crontab -)
            // Need to escape newlines properly or write to tmp file
            const cmd = `echo "${newCron.replace(/\n/g, '\\n')}" | crontab -`;

            conn.exec(cmd, (err, stream2) => {
                if (err) throw err;
                stream2.on('close', (code) => {
                    console.log('Cron updated. Exit code:', code);
                    conn.end();
                });
            });
        });
    });
}).connect(config);

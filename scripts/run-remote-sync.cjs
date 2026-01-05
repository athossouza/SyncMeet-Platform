const { Client } = require('ssh2');
const path = require('path');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Ready. Uploading Sync Script...');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const localPath = path.join(__dirname, '../scripts/sync-calendar.cjs');
        const remotePath = '/root/syncmeet/scripts/sync-calendar.cjs';

        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) {
                console.error('Upload failed:', err);
                conn.end();
                return;
            }
            console.log('Script uploaded. Executing...');

            // Execute inside the container
            const cmd = 'docker exec syncmeet node scripts/sync-calendar.cjs';

            conn.exec(cmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    conn.end();
                }).on('data', (data) => {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', (data) => {
                    console.log('STDERR: ' + data);
                });
            });
        });
    });
}).connect(config);

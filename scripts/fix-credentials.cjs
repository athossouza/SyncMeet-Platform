const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();
console.log('Connecting to FIX credentials...');

conn.on('ready', () => {
    console.log('SSH Ready. Renaming bad service-account.json...');

    // 1. Rename on Host (for future builds)
    const hostCmd = 'mv /root/syncmeet/service-account.json /root/syncmeet/service-account.json.INVALID_BACKUP';

    // 2. Delete inside Container (immediate fix)
    const containerCmd = 'docker exec syncmeet rm /app/service-account.json';

    conn.exec(`${hostCmd} && ${containerCmd}`, (err, stream) => {
        if (err) {
            console.log('Error executing fix commands (might already be done?):', err);
        }

        stream.on('close', (code, signal) => {
            console.log(`Fix executed. Exit code: ${code}`);
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data.toString());
        });
    });
}).connect(config);

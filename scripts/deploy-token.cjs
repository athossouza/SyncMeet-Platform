const { Client } = require('ssh2');
const path = require('path');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const localPath = path.join(__dirname, '../token.json');
const remotePath = '/root/syncmeet/token.json';

const conn = new Client();
console.log('Connecting to deploy token...');

conn.on('ready', () => {
    console.log('SSH Ready. Uploading token.json...');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        // 1. Upload to Host
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) throw err;
            console.log('File uploaded to host. Updating container...');

            // 2. CP to container
            const cpCmd = `docker cp ${remotePath} syncmeet:/app/token.json`;
            const checkCmd = `docker exec syncmeet ls -l /app/token.json`;

            conn.exec(`${cpCmd} && ${checkCmd}`, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    console.log(`Token updated in container. Exit code: ${code}`);
                    conn.end();
                }).on('data', (data) => {
                    console.log(data.toString());
                }).stderr.on('data', (data) => {
                    console.log('STDERR: ' + data.toString());
                });
            });
        });
    });
}).connect(config);

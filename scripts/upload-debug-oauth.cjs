const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const localScriptPath = path.join(__dirname, 'debug-oauth.cjs');
const remoteScriptPath = '/root/syncmeet/scripts/debug-oauth.cjs';

const conn = new Client();
console.log('Connecting to deploy debug oauth script...');

conn.on('ready', () => {
    console.log('SSH Ready. Uploading...');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        // 1. Upload
        sftp.fastPut(localScriptPath, remoteScriptPath, (err) => {
            if (err) throw err;
            console.log('File uploaded. Copying to container...');

            // 2. CP to container & Run
            const setCmd = `chmod +x ${remoteScriptPath}`;
            const cpCmd = `docker cp ${remoteScriptPath} syncmeet:/app/scripts/`;
            const runCmd = `docker exec syncmeet node scripts/debug-oauth.cjs`;

            conn.exec(`${setCmd} && ${cpCmd} && ${runCmd}`, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    console.log('Debug execution finished.');
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

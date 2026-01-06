const { Client } = require('ssh2');
const path = require('path');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const localPkg = path.join(__dirname, '../package.json');
const localLock = path.join(__dirname, '../package-lock.json');

const conn = new Client();
console.log('Connecting to deploy package.json...');

conn.on('ready', () => {
    console.log('SSH Ready. Uploading...');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        sftp.fastPut(localPkg, '/root/syncmeet/package.json', (err) => {
            if (err) throw err;
            sftp.fastPut(localLock, '/root/syncmeet/package-lock.json', (err) => {
                if (err) throw err;
                console.log('Files uploaded.');
                conn.end();
            });
        });
    });
}).connect(config);

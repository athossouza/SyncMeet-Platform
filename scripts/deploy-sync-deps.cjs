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
    console.log('SSH Ready. Deploying Sync Dependencies...');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const files = [
            { local: '../token.json', remote: '/root/syncmeet/token.json' },
            { local: '../client_secret.json', remote: '/root/syncmeet/client_secret.json' },
            { local: '../package.json', remote: '/root/syncmeet/package.json' },
            { local: 'sync-calendar.cjs', remote: '/root/syncmeet/scripts/sync-calendar.cjs' }
        ];

        let uploaded = 0;
        const uploadNext = () => {
            if (uploaded >= files.length) {
                console.log('Files uploaded. Rebuilding Container...');
                // Rebuild to ensure packaged scripts/deps are up to date (mostly for sync-calendar copy if it's copied in Dockerfile)
                // Actually, local bind mounts might differ, but safe to rebuild.
                conn.exec('cd /root/syncmeet && docker compose build syncmeet && docker compose up -d --force-recreate syncmeet', (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code) => {
                        console.log('Rebuild finished: ' + code);
                        conn.end();
                    }).on('data', d => console.log(d.toString()));
                });
                return;
            }
            const f = files[uploaded];
            const localPath = path.join(__dirname, f.local);
            console.log(`Uploading ${f.local} -> ${f.remote}`);

            sftp.fastPut(localPath, f.remote, (err) => {
                if (err) {
                    console.error('Error uploading ' + f.remote, err);
                    // Continue anyway? No, critical.
                    conn.end();
                } else {
                    console.log('✅ Uploaded ' + f.remote);
                    uploaded++;
                    uploadNext();
                }
            });
        };
        uploadNext();
    });
}).connect(config);

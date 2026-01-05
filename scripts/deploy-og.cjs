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
    console.log('SSH Ready. Deploying OG Image...');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const files = [
            { local: '../public/og-preview.png', remote: '/root/syncmeet/public/og-preview.png' },
            { local: '../index.html', remote: '/root/syncmeet/index.html' }
        ];

        let uploaded = 0;
        const uploadNext = () => {
            if (uploaded >= files.length) {
                console.log('Files uploaded. Rebuilding...');
                // We need to rebuild because index.html is copied to dist during build NOT just static serving if we want to be sure? 
                // Actually in Vite, public folder files are copied to root dist. index.html is transformed.
                // So yes, build is needed.
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
            sftp.fastPut(localPath, f.remote, (err) => {
                if (err) console.error('Error uploading ' + f.remote, err);
                else console.log('Uploaded ' + f.remote);
                uploaded++;
                uploadNext();
            });
        };
        uploadNext();
    });
}).connect(config);

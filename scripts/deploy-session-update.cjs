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
    console.log('SSH Ready. Deploying Session Updates...');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        // Ensure components directory exists
        conn.exec('mkdir -p /root/syncmeet/src/components/ui', (err) => {
            if (err) console.error(err);

            const files = [
                { local: '../src/pages/admin/Sessions.tsx', remote: '/root/syncmeet/src/pages/admin/Sessions.tsx' },
                { local: '../src/pages/portal/SessionDetail.tsx', remote: '/root/syncmeet/src/pages/portal/SessionDetail.tsx' },
                { local: '../src/components/SessionEditor.tsx', remote: '/root/syncmeet/src/components/SessionEditor.tsx' },
                { local: '../src/components/ui/alert-banner.tsx', remote: '/root/syncmeet/src/components/ui/alert-banner.tsx' },
                { local: '../src/components/ui/calendar.tsx', remote: '/root/syncmeet/src/components/ui/calendar.tsx' },
                { local: '../src/components/ui/popover.tsx', remote: '/root/syncmeet/src/components/ui/popover.tsx' },
                { local: '../src/components/SessionScheduler.tsx', remote: '/root/syncmeet/src/components/SessionScheduler.tsx' },
                { local: '../package.json', remote: '/root/syncmeet/package.json' },
                { local: '../package-lock.json', remote: '/root/syncmeet/package-lock.json' },
                { local: '../server.cjs', remote: '/root/syncmeet/server.cjs' },
                { local: '../scripts/sync-calendar.cjs', remote: '/root/syncmeet/scripts/sync-calendar.cjs' },
                { local: '../scripts/setup_vps_cron.cjs', remote: '/root/syncmeet/scripts/setup_vps_cron.cjs' },
                { local: '../scripts/generate-summary.cjs', remote: '/root/syncmeet/scripts/generate-summary.cjs' },
                { local: '../src/components/AdminLayout.tsx', remote: '/root/syncmeet/src/components/AdminLayout.tsx' },
                { local: '../docker-compose.yml', remote: '/root/syncmeet/docker-compose.yml' },
                { local: '../src/pages/admin/Dashboard.tsx', remote: '/root/syncmeet/src/pages/admin/Dashboard.tsx' }, // Fixed path if it was wrong
                { local: '../src/types/index.ts', remote: '/root/syncmeet/src/types/index.ts' }
            ];

            let uploaded = 0;
            const uploadNext = () => {
                if (uploaded >= files.length) {
                    console.log('Files uploaded. Rebuilding Docker Container...');
                    // We need to ensure npm install runs during build or manually
                    // If Dockerfile has 'COPY package*.json ./', then 'RUN npm install', a rebuild should pick it up.
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
    });
}).connect(config);

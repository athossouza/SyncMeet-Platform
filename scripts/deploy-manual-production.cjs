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
    console.log('SSH Ready. Deploying Full Production Update...');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const files = [
            // Core Config
            { local: '../package.json', remote: '/root/syncmeet/package.json' },
            { local: '../package-lock.json', remote: '/root/syncmeet/package-lock.json' },
            { local: '../vite.config.ts', remote: '/root/syncmeet/vite.config.ts' },
            { local: '../docker-compose.yml', remote: '/root/syncmeet/docker-compose.yml' },
            { local: '../src/index.css', remote: '/root/syncmeet/src/index.css' },
            { local: '../src/main.tsx', remote: '/root/syncmeet/src/main.tsx' },

            // New Theme System
            { local: '../src/theme/darkTheme.ts', remote: '/root/syncmeet/src/theme/darkTheme.ts' },
            { local: '../src/theme/lightTheme.ts', remote: '/root/syncmeet/src/theme/lightTheme.ts' },
            { local: '../src/context/ThemeContext.tsx', remote: '/root/syncmeet/src/context/ThemeContext.tsx' },

            // Components
            { local: '../src/components/AdminLayout.tsx', remote: '/root/syncmeet/src/components/AdminLayout.tsx' },
            { local: '../src/components/ClientLayout.tsx', remote: '/root/syncmeet/src/components/ClientLayout.tsx' },
            { local: '../src/components/CustomVideoPlayer.tsx', remote: '/root/syncmeet/src/components/CustomVideoPlayer.tsx' },
            { local: '../src/components/Footer.tsx', remote: '/root/syncmeet/src/components/Footer.tsx' },
            { local: '../src/components/SessionEditor.tsx', remote: '/root/syncmeet/src/components/SessionEditor.tsx' },
            { local: '../src/components/SessionScheduler.tsx', remote: '/root/syncmeet/src/components/SessionScheduler.tsx' },

            // Pages - Admin
            { local: '../src/pages/admin/Dashboard.tsx', remote: '/root/syncmeet/src/pages/admin/Dashboard.tsx' },
            { local: '../src/pages/admin/Organizations.tsx', remote: '/root/syncmeet/src/pages/admin/Organizations.tsx' },
            { local: '../src/pages/admin/Sessions.tsx', remote: '/root/syncmeet/src/pages/admin/Sessions.tsx' },

            // Pages - Portal
            { local: '../src/pages/portal/Dashboard.tsx', remote: '/root/syncmeet/src/pages/portal/Dashboard.tsx' },
            { local: '../src/pages/portal/SessionDetail.tsx', remote: '/root/syncmeet/src/pages/portal/SessionDetail.tsx' },

            // Public Pages
            { local: '../src/pages/LandingPage.tsx', remote: '/root/syncmeet/src/pages/LandingPage.tsx' },
            { local: '../src/App.tsx', remote: '/root/syncmeet/src/App.tsx' }
        ];

        // Ensure directories exist first
        const dirs = [
            '/root/syncmeet/src/theme',
            '/root/syncmeet/src/context',
            '/root/syncmeet/src/components',
            '/root/syncmeet/src/pages/admin',
            '/root/syncmeet/src/pages/portal'
        ];

        let dirIndex = 0;
        const ensureDirs = () => {
            if (dirIndex >= dirs.length) {
                // Start uploading files
                uploadFiles();
                return;
            }
            const dir = dirs[dirIndex];
            conn.exec(`mkdir -p ${dir}`, (err) => {
                if (err) console.error(`Error creating dir ${dir}:`, err);
                else console.log(`Ensure dir: ${dir}`);
                dirIndex++;
                ensureDirs();
            });
        };

        let uploaded = 0;
        const uploadFiles = () => {
            if (uploaded >= files.length) {
                console.log('Files uploaded. Cleaning everything (node_modules, dist) and Rebuilding...');
                conn.exec('cd /root/syncmeet && docker compose down && rm -rf dist && docker compose build --no-cache syncmeet && docker compose up -d --force-recreate syncmeet', (err, stream) => {
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
                uploadFiles();
            });
        };

        // Start
        ensureDirs();
    });
}).connect(config);

const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    // Find container with image name containing 'traefik' and restart it
    conn.exec('docker ps --filter "ancestor=traefik:v2.5" --format "{{.Names}}"', (err, stream) => {
        if (err) throw err;
        let p = '';
        stream.on('data', d => p += d);
        stream.on('close', () => {
            const name = p.trim();
            if (!name) {
                // Try just 'traefik'
                conn.exec('docker ps --filter "ancestor=traefik" --format "{{.Names}}"', (err2, stream2) => {
                    let p2 = '';
                    stream2.on('data', d => p2 += d);
                    stream2.on('close', () => {
                        const name2 = p2.trim();
                        if (name2) restart(name2);
                        else console.log('Traefik container not found to restart.');
                    });
                });
            } else {
                restart(name);
            }
        });
    });

    function restart(name) {
        console.log(`Restarting Traefik container: ${name}...`);
        conn.exec(`docker restart ${name}`, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code) => {
                console.log(`Restarted ${name}. Exit code: ${code}`);
                conn.end();
            });
        });
    }

}).connect(config);

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
    // 1. List containers to find Traefik name
    conn.exec('docker ps --format "{{.ID}} {{.Names}} {{.Image}}"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (data) => {
            output += data.toString();
        }).on('close', () => {
            console.log('Containers:\n' + output);

            // 2. Fetch logs for Traefik (assuming standard name or keyword)
            const traefikLine = output.split('\n').find(l => l.includes('traefik'));
            if (traefikLine) {
                const containerName = traefikLine.split(' ')[1];
                console.log(`fetching logs for ${containerName}...`);
                conn.exec(`docker logs ${containerName} --tail 100`, (err2, stream2) => {
                    if (err2) throw err2;
                    stream2.on('data', d => console.log(d.toString()));
                    stream2.on('close', () => conn.end());
                });
            } else {
                console.log('Traefik container not found.');
                conn.end();
            }
        });
    });
}).connect(config);

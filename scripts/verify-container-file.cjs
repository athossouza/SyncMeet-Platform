const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();
console.log('Connecting to verify container content...');

conn.on('ready', () => {
    console.log('SSH Ready. Executing cat inside container...');
    conn.exec('docker exec syncmeet cat /app/src/components/SessionScheduler.tsx', (err, stream) => {
        if (err) throw err;
        let content = '';
        stream.on('data', (data) => {
            content += data.toString();
        }).on('close', () => {
            console.log('--- CONTAINER FILE START ---');
            if (content.includes('Agendamento (v6)')) {
                console.log('FOUND: "Agendamento (v6)"');
            } else {
                console.log('MISSING: "Agendamento (v6)"');
            }

            if (content.includes('dangerouslySetInnerHTML')) {
                console.log('FOUND: "dangerouslySetInnerHTML"');
            } else {
                console.log('MISSING: "dangerouslySetInnerHTML"');
            }
            console.log('--- CONTAINER FILE END ---');
            conn.end();
        });
    });
}).connect(config);

const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();
console.log('Connecting to inspect credentials...');

conn.on('ready', () => {
    console.log('SSH Ready. Reading service-account.json...');

    // Check Host File
    conn.exec('cat /root/syncmeet/service-account.json', (err, stream) => {
        if (err) throw err;
        let content = '';
        stream.on('data', (d) => content += d.toString());
        stream.on('close', () => {
            console.log('--- CONTENT START ---');
            console.log(content);
            console.log('--- CONTENT END ---');
            conn.end();
        });
    });
}).connect(config);

const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();
console.log('Connecting to Install OpenAI...');

conn.on('ready', () => {
    console.log('SSH Ready. Installing openai...');

    // Install in /app
    const cmd = `docker exec syncmeet npm install openai`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`Install finished. Exit code: ${code}`);
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data.toString());
        });
    });
}).connect(config);

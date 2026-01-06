const { Client } = require('ssh2');

const config = {
    host: '31.97.21.53',
    port: 22,
    username: 'root',
    password: '@Ahs221400#123'
};

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready. debugging...');

    const cmd = 'docker ps -a | grep syncmeet && echo "---" && docker logs syncmeet --tail 50';

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);

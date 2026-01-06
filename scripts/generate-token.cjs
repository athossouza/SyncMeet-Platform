const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Path to client credentials (downloaded from Google Cloud Console)
const KEY_PATH = path.join(__dirname, '../client_secret.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload'
];

async function main() {
    let keys;
    try {
        const content = fs.readFileSync(KEY_PATH);
        keys = JSON.parse(content);
    } catch (err) {
        console.error('❌ Error loading client_secret.json:', err.message);
        console.log('Please ensure client_secret.json is in the root directory.');
        return;
    }

    const { client_secret, client_id, redirect_uris } = keys.installed || keys.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we already have a token
    if (fs.existsSync(TOKEN_PATH)) {
        console.log('⚠️  token.json already exists. Proceeding will OVERWRITE it.');
        // return; // Allow overwrite
    }

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // Check for code argument
    let codeArg = process.argv[2];

    // Ignore flag if present as first arg
    if (codeArg === '--url-only') {
        codeArg = undefined;
    }

    if (codeArg) {
        console.log(`Using code from argument: ${codeArg.substring(0, 10)}...`);
        try {
            const { tokens } = await oAuth2Client.getToken(codeArg);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('✅ Token stored to', TOKEN_PATH);
            process.exit(0);
        } catch (err) {
            console.error('❌ Error retrieving access token', err);
            // Don't exit with error to allow fallback to interactive if needed? 
            // No, for automation, explicit failure is better.
            if (err.message.includes('invalid_grant')) {
                console.error('Code expired or invalid.');
            }
            process.exit(1);
        }
    }

    console.log('⚠️  Authorize this app by visiting this url:', authUrl);

    if (process.argv.includes('--url-only')) {
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('✅ Token stored to', TOKEN_PATH);
        } catch (err) {
            console.error('❌ Error retrieving access token', err);
        }
    });
}

main();

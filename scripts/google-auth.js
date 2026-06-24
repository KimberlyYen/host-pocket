/**
 * One-time OAuth setup — run: npm run google:auth
 * Prints a refresh token to paste into .env as GOOGLE_REFRESH_TOKEN
 */
require('dotenv').config();
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        console.error(`Missing ${name} in .env`);
        process.exit(1);
    }
    return value;
}

async function main() {
    const clientId = requireEnv('GOOGLE_CLIENT_ID');
    const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES
    });

    console.log('\n1. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n--- Google Cloud Console setup ---');
    console.log(`Client ID: ${clientId}`);
    console.log(`Redirect URI (copy exactly into OAuth client): ${REDIRECT_URI}`);
    console.log('Credentials → your OAuth 2.0 Client ID → Authorized redirect URIs');
    console.log('---\n');
    console.log('2. Authorize with the Google account that will host meetings.');
    console.log('3. Paste the authorization code below.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await new Promise((resolve) => {
        rl.question('Authorization code: ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
        console.error('\nNo refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and run again with prompt=consent.');
        process.exit(1);
    }

    console.log('\nAdd this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nDone. Restart the server with: npm start\n');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

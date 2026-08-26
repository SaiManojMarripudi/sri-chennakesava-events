const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

const {
    google
} = require('googleapis');


dotenv.config();


// ==========================================
// PATHS
// ==========================================

const clientPath =
    path.resolve(
        __dirname,
        '../',
        process.env.GOOGLE_OAUTH_CLIENT_PATH ||
        './config/google-oauth-client.json'
    );


const tokenPath =
    path.resolve(
        __dirname,
        '../',
        process.env.GOOGLE_OAUTH_TOKEN_PATH ||
        './config/google-oauth-token.json'
    );


const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI;


// ==========================================
// LOAD OAUTH CLIENT
// ==========================================

function loadOAuthClientConfig() {

    if (
        !fs.existsSync(clientPath)
    ) {

        throw new Error(
            `Google OAuth client file not found: ${clientPath}`
        );

    }


    const credentials =
        JSON.parse(
            fs.readFileSync(
                clientPath,
                'utf8'
            )
        );


    const config =
        credentials.web ||
        credentials.installed;


    if (
        !config ||
        !config.client_id ||
        !config.client_secret
    ) {

        throw new Error(
            'Invalid Google OAuth client JSON.'
        );

    }


    if (!redirectUri) {

        throw new Error(
            'GOOGLE_OAUTH_REDIRECT_URI is missing from .env'
        );

    }


    return {
        clientId:
            config.client_id,

        clientSecret:
            config.client_secret
    };

}


// ==========================================
// CREATE OAUTH CLIENT
// ==========================================

function createOAuthClient() {

    const {
        clientId,
        clientSecret
    } =
        loadOAuthClientConfig();


    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

}


// ==========================================
// OAUTH SCOPES
// ==========================================

const GOOGLE_SCOPES = [

    'https://www.googleapis.com/auth/drive',

    'https://www.googleapis.com/auth/spreadsheets'

];


// ==========================================
// TEMPORARY AUTH STATE
// ==========================================

const pendingStates =
    new Map();


// ==========================================
// GENERATE AUTHORIZATION URL
// ==========================================

function generateAuthorizationUrl() {

    const state =
        crypto
            .randomBytes(32)
            .toString('hex');


    pendingStates.set(
        state,
        Date.now()
    );


    const oauth2Client =
        createOAuthClient();


    const authorizationUrl =
        oauth2Client.generateAuthUrl({

            access_type:
                'offline',

            prompt:
                'consent',

            include_granted_scopes:
                true,

            scope:
                GOOGLE_SCOPES,

            state

        });


    return {
        authorizationUrl,
        state
    };

}


// ==========================================
// HANDLE OAUTH CALLBACK
// ==========================================

async function handleOAuthCallback({
    code,
    state
}) {

    if (
        !code
    ) {

        throw new Error(
            'Google authorization code is missing.'
        );

    }


    if (
        !state
    ) {

        throw new Error(
            'Google OAuth state is missing.'
        );

    }


    if (
        !pendingStates.has(state)
    ) {

        throw new Error(
            'Invalid or expired Google OAuth state.'
        );

    }


    pendingStates.delete(state);


    const oauth2Client =
        createOAuthClient();


    const {
        tokens
    } =
        await oauth2Client.getToken(
            code
        );


    if (
        !tokens.refresh_token
    ) {

        throw new Error(
            'Google did not return a refresh token. Please authorize again with consent.'
        );

    }


    oauth2Client.setCredentials(
        tokens
    );


    fs.writeFileSync(

        tokenPath,

        JSON.stringify(
            tokens,
            null,
            2
        ),

        {
            encoding: 'utf8',
            mode: 0o600
        }

    );


    return tokens;

}


// ==========================================
// LOAD SAVED OAUTH CLIENT
// ==========================================

function getAuthenticatedOAuthClient() {

    if (
        !fs.existsSync(tokenPath)
    ) {

        return null;

    }


    const oauth2Client =
        createOAuthClient();


    const tokens =
        JSON.parse(
            fs.readFileSync(
                tokenPath,
                'utf8'
            )
        );


    oauth2Client.setCredentials(
        tokens
    );


    return oauth2Client;

}


// ==========================================
// CHECK AUTHENTICATION
// ==========================================

function isGoogleAuthorized() {

    return fs.existsSync(
        tokenPath
    );

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    GOOGLE_SCOPES,

    generateAuthorizationUrl,

    handleOAuthCallback,

    getAuthenticatedOAuthClient,

    isGoogleAuthorized

};
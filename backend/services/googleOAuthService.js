const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

const {
    google
} = require('googleapis');


dotenv.config();


// ==========================================
// PRODUCTION / LOCAL OAUTH CONFIGURATION
// ==========================================
//
// Production:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN
//   GOOGLE_OAUTH_REDIRECT_URI
//
// Local development:
//   google-oauth-client.json
//   google-oauth-token.json
//
// Production environment variables take priority.
// Local files remain available as fallback.
//

const clientIdFromEnv =
    process.env.GOOGLE_OAUTH_CLIENT_ID;


const clientSecretFromEnv =
    process.env.GOOGLE_OAUTH_CLIENT_SECRET;


const refreshTokenFromEnv =
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN;


const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI;


// ==========================================
// LOCAL FILE PATHS
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


// ==========================================
// CHECK PRODUCTION OAUTH CONFIGURATION
// ==========================================

function hasProductionOAuthConfig() {

    return Boolean(
        clientIdFromEnv &&
        clientSecretFromEnv &&
        refreshTokenFromEnv
    );

}


// ==========================================
// LOAD OAUTH CLIENT CONFIGURATION
// ==========================================

function loadOAuthClientConfig() {

    // ======================================
    // PRODUCTION ENVIRONMENT
    // ======================================

    if (
        clientIdFromEnv &&
        clientSecretFromEnv
    ) {

        if (
            !redirectUri
        ) {

            throw new Error(
                'GOOGLE_OAUTH_REDIRECT_URI is missing.'
            );

        }


        return {

            clientId:
                clientIdFromEnv,

            clientSecret:
                clientSecretFromEnv

        };

    }


    // ======================================
    // LOCAL FILE FALLBACK
    // ======================================

    if (
        !fs.existsSync(
            clientPath
        )
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


    if (
        !redirectUri
    ) {

        throw new Error(
            'GOOGLE_OAUTH_REDIRECT_URI is missing.'
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
        !pendingStates.has(
            state
        )
    ) {

        throw new Error(
            'Invalid or expired Google OAuth state.'
        );

    }


    pendingStates.delete(
        state
    );


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


    // ======================================
    // SAVE TOKEN FOR LOCAL DEVELOPMENT
    // ======================================
    //
    // In Railway production, the refresh token
    // should be stored in:
    //
    // GOOGLE_OAUTH_REFRESH_TOKEN
    //
    // and should NOT depend on local files.
    //

    if (
        !hasProductionOAuthConfig()
    ) {

        fs.writeFileSync(

            tokenPath,

            JSON.stringify(
                tokens,
                null,
                2
            ),

            {

                encoding:
                    'utf8',

                mode:
                    0o600

            }

        );

    }


    return tokens;

}


// ==========================================
// LOAD AUTHENTICATED OAUTH CLIENT
// ==========================================

function getAuthenticatedOAuthClient() {

    // ======================================
    // PRODUCTION ENVIRONMENT
    // ======================================

    if (
        hasProductionOAuthConfig()
    ) {

        const oauth2Client =
            createOAuthClient();


        oauth2Client.setCredentials({

            refresh_token:
                refreshTokenFromEnv

        });


        return oauth2Client;

    }


    // ======================================
    // LOCAL TOKEN FILE
    // ======================================

    if (
        !fs.existsSync(
            tokenPath
        )
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

    // ======================================
    // PRODUCTION
    // ======================================

    if (
        hasProductionOAuthConfig()
    ) {

        return true;

    }


    // ======================================
    // LOCAL
    // ======================================

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
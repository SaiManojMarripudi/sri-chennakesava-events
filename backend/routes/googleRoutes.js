const express = require('express');

const {
    generateAuthorizationUrl,
    handleOAuthCallback,
    isGoogleAuthorized
} = require('../services/googleOAuthService');


const router =
    express.Router();


// ==========================================
// START GOOGLE AUTHORIZATION
// ==========================================

router.get(
    '/authorize',
    (req, res) => {

        try {

            const {
                authorizationUrl
            } =
                generateAuthorizationUrl();


            return res.redirect(
                authorizationUrl
            );

        } catch (error) {

            console.error(
                'Google authorization start error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to start Google authorization.'

            });

        }

    }
);


// ==========================================
// GOOGLE OAUTH CALLBACK
// ==========================================

router.get(
    '/oauth2callback',
    async (req, res) => {

        try {

            const {
                code,
                state,
                error
            } = req.query;


            if (error) {

                return res.status(400).send(
                    `
                    <h2>Google Authorization Failed</h2>
                    <p>${error}</p>
                    `
                );

            }


            await handleOAuthCallback({

                code,

                state

            });


            return res.status(200).send(
                `
                <!DOCTYPE html>

                <html>

                    <head>

                        <title>
                            Google Authorization
                        </title>

                    </head>

                    <body>

                        <h2>
                            Google authorization successful ✅
                        </h2>

                        <p>
                            Your SRI CHENNAKESAVA EVENTS
                            Google account is now connected
                            to the backend.
                        </p>

                        <p>
                            You can close this window.
                        </p>

                    </body>

                </html>
                `
            );

        } catch (error) {

            console.error(
                'Google OAuth callback error:',
                error
            );


            return res.status(500).send(
                `
                <h2>
                    Google Authorization Failed
                </h2>

                <p>
                    ${error.message}
                </p>
                `
            );

        }

    }
);


// ==========================================
// GOOGLE AUTH STATUS
// ==========================================

router.get(
    '/status',
    (req, res) => {

        return res.json({

            success: true,

            authorized:
                isGoogleAuthorized()

        });

    }
);


module.exports = router;
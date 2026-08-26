const jwt = require('jsonwebtoken');

const {
    pool
} = require('../config/db');


// ==========================================
// AUTHENTICATION + ACTIVE ADMIN VERIFICATION
// ==========================================

const authenticateAdmin = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        // ==========================================
        // CHECK AUTHORIZATION HEADER
        // ==========================================

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    'Authentication required.'

            });

        }


        // ==========================================
        // CHECK BEARER FORMAT
        // ==========================================

        if (
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid authorization format.'

            });

        }


        // ==========================================
        // EXTRACT TOKEN
        // ==========================================

        const token =
            authHeader.split(' ')[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    'Authentication token is missing.'

            });

        }


        // ==========================================
        // CHECK JWT SECRET
        // ==========================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is missing from .env'
            );

            return res.status(500).json({

                success: false,

                message:
                    'Authentication configuration is missing.'

            });

        }


        // ==========================================
        // VERIFY JWT
        // ==========================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ==========================================
        // VERIFY ADMIN ID FROM DATABASE
        // ==========================================

        const [admins] =
            await pool.execute(
                `
                SELECT
                    admin_id,
                    full_name,
                    email,
                    is_active

                FROM admin_users

                WHERE admin_id = ?

                LIMIT 1
                `,
                [decoded.admin_id]
            );


        // ==========================================
        // ADMIN DOES NOT EXIST
        // ==========================================

        if (admins.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    'Admin account not found.'

            });

        }


        const admin =
            admins[0];


        // ==========================================
        // ADMIN ACCOUNT INACTIVE
        // ==========================================

        if (admin.is_active !== 1) {

            return res.status(401).json({

                success: false,

                message:
                    'Admin account is inactive.'

            });

        }


        // ==========================================
        // STORE CURRENT ADMIN
        // ==========================================

        req.admin = {

            admin_id:
                admin.admin_id,

            full_name:
                admin.full_name,

            email:
                admin.email

        };


        // ==========================================
        // CONTINUE
        // ==========================================

        next();


    } catch (error) {

        console.error(
            'Authentication error:',
            error.message
        );


        // ==========================================
        // EXPIRED TOKEN
        // ==========================================

        if (
            error.name ===
            'TokenExpiredError'
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'Authentication token has expired.'

            });

        }


        // ==========================================
        // INVALID TOKEN
        // ==========================================

        if (
            error.name ===
            'JsonWebTokenError'
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid authentication token.'

            });

        }


        // ==========================================
        // OTHER SERVER/DATABASE ERROR
        // ==========================================

        return res.status(500).json({

            success: false,

            message:
                'Unable to verify authentication right now.'

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    authenticateAdmin
};
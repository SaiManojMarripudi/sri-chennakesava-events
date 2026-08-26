const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const enquiryRoutes = require('./routes/enquiryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const googleRoutes =
    require('./routes/googleRoutes');

const customerRoutes =
    require('./routes/customerRoutes');

const launchRoutes =
    require('./routes/launchRoutes');

const {
    testDatabaseConnection
} = require('./config/db');


// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();


// ==========================================
// CREATE EXPRESS APPLICATION
// ==========================================

const app = express();

const PORT =
    process.env.PORT || 5000;


// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [

    // Local development
    'http://localhost:3000',
    'http://localhost:5173',

    // Railway production frontend
    'https://sri-chennakesava-events-production.up.railway.app'

];


// Add FRONTEND_URL from environment variables
// when it is configured.
if (
    process.env.FRONTEND_URL
) {

    const configuredOrigins =
        process.env.FRONTEND_URL
            .split(',')
            .map(
                origin =>
                    origin.trim()
            )
            .filter(Boolean);


    configuredOrigins.forEach(
        origin => {

            if (
                !allowedOrigins.includes(
                    origin
                )
            ) {

                allowedOrigins.push(
                    origin
                );

            }

        }
    );

}


// ==========================================
// CORS MIDDLEWARE
// ==========================================

app.use(
    cors({

        origin: (
            requestOrigin,
            callback
        ) => {

            // ======================================
            // ALLOW NON-BROWSER REQUESTS
            // ======================================

            if (
                !requestOrigin
            ) {

                return callback(
                    null,
                    true
                );

            }


            // ======================================
            // ALLOW APPROVED FRONTEND ORIGINS
            // ======================================

            if (
                allowedOrigins.includes(
                    requestOrigin
                )
            ) {

                return callback(
                    null,
                    true
                );

            }


            // ======================================
            // REJECT UNKNOWN ORIGINS
            // ======================================

            return callback(
                null,
                false
            );

        },


        methods: [

            'GET',

            'POST',

            'PATCH',

            'PUT',

            'DELETE',

            'OPTIONS'

        ],


        allowedHeaders: [

            'Content-Type',

            'Authorization'

        ],


        credentials: false

    })
);


// ==========================================
// PARSE JSON REQUEST BODIES
// ==========================================

app.use(
    express.json()
);


// ==========================================
// PARSE URL-ENCODED REQUEST BODIES
// ==========================================

app.use(
    express.urlencoded({

        extended: true

    })
);


// ==========================================
// API ROUTES
// ==========================================

// Admin authentication
app.use(
    '/api/admin',
    adminRoutes
);


// Enquiries
app.use(
    '/api/enquiries',
    enquiryRoutes
);


// Orders
app.use(
    '/api/orders',
    orderRoutes
);


// Customers
app.use(
    '/api/customers',
    customerRoutes
);


// Launch
app.use(
    '/api/launch',
    launchRoutes
);


// Google
app.use(
    '/api/google',
    googleRoutes
);


// ==========================================
// TEST ROUTE
// ==========================================

app.get(
    '/',
    (req, res) => {

        res.json({

            success: true,

            message:
                'SRI CHENNAKESAVA EVENTS backend is running.'

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    async () => {

        console.log(
            `SRI CHENNAKESAVA EVENTS backend running on port ${PORT}`
        );


        console.log(
            'Allowed CORS origins:',
            allowedOrigins
        );


        await testDatabaseConnection();

    }
);
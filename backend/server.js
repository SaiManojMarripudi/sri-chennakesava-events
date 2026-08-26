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

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
)
    .split(',')
    .map(
        origin =>
            origin.trim()
    )
    .filter(Boolean);


app.use(
    cors({
        origin: (
            requestOrigin,
            callback
        ) => {

            // Allow non-browser requests
            // such as PowerShell/Postman.
            if (!requestOrigin) {

                return callback(
                    null,
                    true
                );

            }


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
        ]

    })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
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

app.use(
    '/api/customers',
    customerRoutes
);

app.use(
    '/api/launch',
    launchRoutes
);

app.use(
    '/api/google',
    googleRoutes
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get('/', (req, res) => {

    res.json({
        success: true,
        message:
            'SRI CHENNAKESAVA EVENTS backend is running.'
    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, async () => {

    console.log(
        `SRI CHENNAKESAVA EVENTS backend running on port ${PORT}`
    );

    await testDatabaseConnection();

});
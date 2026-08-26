const express = require('express');

const {
    loginAdmin,
    getDashboardSummary,
    getRecentEnquiries,
    getRecentOrders,
    getUpcomingEvents,
    getRecentActivity
} = require('../controllers/adminController');

const {
    authenticateAdmin
} = require('../middleware/authMiddleware');

const router = express.Router();


// ==========================================
// ADMIN LOGIN
// PUBLIC
// ==========================================

router.post(
    '/login',
    loginAdmin
);


// ==========================================
// ADMIN DASHBOARD SUMMARY
// ADMIN ONLY
// ==========================================

router.get(
    '/dashboard/summary',
    authenticateAdmin,
    getDashboardSummary
);

// ==========================================
// RECENT ENQUIRIES
// ADMIN ONLY
// ==========================================

router.get(
    '/dashboard/recent-enquiries',
    authenticateAdmin,
    getRecentEnquiries
);

// ==========================================
// RECENT ORDERS
// ADMIN ONLY
// ==========================================

router.get(
    '/dashboard/recent-orders',
    authenticateAdmin,
    getRecentOrders
);

// ==========================================
// UPCOMING EVENTS
// ADMIN ONLY
// ==========================================

router.get(
    '/dashboard/upcoming-events',
    authenticateAdmin,
    getUpcomingEvents
);

// ==========================================
// RECENT ACTIVITY
// ADMIN ONLY
// ==========================================

router.get(
    '/dashboard/recent-activity',
    authenticateAdmin,
    getRecentActivity
);




module.exports = router;
const express = require('express');

const {
    createEnquiry,
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus
} = require('../controllers/enquiryController');

const {
    authenticateAdmin
} = require('../middleware/authMiddleware');

const router = express.Router();


// ==========================================
// GET ALL ENQUIRIES
// ADMIN ONLY
// ==========================================

router.get(
    '/',
    authenticateAdmin,
    getAllEnquiries
);


// ==========================================
// UPDATE ENQUIRY STATUS
// ADMIN ONLY
// ==========================================

router.patch(
    '/:id/status',
    authenticateAdmin,
    updateEnquiryStatus
);


// ==========================================
// GET SINGLE ENQUIRY
// ADMIN ONLY
// ==========================================

router.get(
    '/:id',
    authenticateAdmin,
    getEnquiryById
);


// ==========================================
// CREATE ENQUIRY
// PUBLIC
// ==========================================

router.post(
    '/',
    createEnquiry
);


module.exports = router;
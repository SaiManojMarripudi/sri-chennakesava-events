const express = require('express');

const {

    createOrderFromEnquiry,

    getAllOrders,

    getOrderById,

    updateOrderStatus,

    updateOrderBooking,

    confirmBookingDetails,

    generateBookingNumber,

    updateOrderAgreement,

    getOrderPayments,

    addOrderPayment

} = require('../controllers/orderController');

const {

    authenticateAdmin

} = require('../middleware/authMiddleware');

const router =
    express.Router();


// ==========================================
// GET ALL ORDERS
// ADMIN ONLY
// ==========================================

router.get(

    '/',

    authenticateAdmin,

    getAllOrders

);


// ==========================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ==========================================

router.patch(

    '/:id/status',

    authenticateAdmin,

    updateOrderStatus

);


// ==========================================
// UPDATE ORDER BOOKING DETAILS
// ADMIN ONLY
// ==========================================

router.patch(

    '/:id/booking',

    authenticateAdmin,

    updateOrderBooking

);

// ==========================================
// CONFIRM BOOKING DETAILS
// ADMIN ONLY
// ==========================================

router.patch(
    '/:id/booking-details',
    authenticateAdmin,
    confirmBookingDetails
);

// ==========================================
// GENERATE OFFICIAL BOOKING NUMBER
// ADMIN ONLY
// ==========================================

router.patch(

    '/:id/booking-number',

    authenticateAdmin,

    generateBookingNumber

);

// ==========================================
// UPDATE BOOKING AGREEMENT
// ADMIN ONLY
// ==========================================

router.patch(

    '/:id/agreement',

    authenticateAdmin,

    updateOrderAgreement

);

// ==========================================
// GET ORDER PAYMENTS
// ADMIN ONLY
// ==========================================

router.get(

    '/:id/payments',

    authenticateAdmin,

    getOrderPayments

);


// ==========================================
// ADD ORDER PAYMENT
// ADMIN ONLY
// ==========================================

router.post(

    '/:id/payments',

    authenticateAdmin,

    addOrderPayment

);


// ==========================================
// GET SINGLE ORDER
// ADMIN ONLY
// ==========================================

router.get(

    '/:id',

    authenticateAdmin,

    getOrderById

);


// ==========================================
// CREATE ORDER FROM ACCEPTED ENQUIRY
// ADMIN ONLY
// ==========================================

router.post(

    '/from-enquiry/:enquiryId',

    authenticateAdmin,

    createOrderFromEnquiry

);


module.exports = router;
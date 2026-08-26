const express = require('express');

const {

    getAllCustomers,

    getCustomerById

} = require('../controllers/customerController');

const {

    authenticateAdmin

} = require('../middleware/authMiddleware');

const router =
    express.Router();


// ==========================================
// GET ALL CUSTOMERS
// ADMIN ONLY
// ==========================================

router.get(

    '/',

    authenticateAdmin,

    getAllCustomers

);


// ==========================================
// GET SINGLE CUSTOMER
// ADMIN ONLY
// ==========================================

router.get(

    '/:id',

    authenticateAdmin,

    getCustomerById

);


module.exports = router;
const express =
    require('express');

const {

    getLaunchStatus,
    startWebsiteLaunch,
    completeWebsiteLaunch

} = require(
    '../controllers/launchController'
);


const {

    authenticateAdmin

} = require(
    '../middleware/authMiddleware'
);


const router =
    express.Router();


// ==========================================
// GET WEBSITE LAUNCH STATUS
// PUBLIC
// ==========================================

router.get(
    '/status',
    getLaunchStatus
);


// ==========================================
// START WEBSITE LAUNCH
// ADMIN ONLY
// ==========================================

router.post(
    '/start',
    authenticateAdmin,
    startWebsiteLaunch
);


// ==========================================
// COMPLETE WEBSITE LAUNCH
// ADMIN ONLY
// ==========================================

router.post(
    '/complete',
    authenticateAdmin,
    completeWebsiteLaunch
);


module.exports =
    router;
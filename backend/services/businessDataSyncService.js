const {
    syncCustomers,
    syncEnquiries,
    syncOrders,
    syncPayments,
    syncNotifications,
    syncOrderStatusHistory,
    syncUpcomingEvents,
    syncBookingAgreements,
    syncDashboard
} = require('./googleSheetsService');


// ==========================================
// CONFIGURATION
// ==========================================

const MAX_RETRIES = 3;

const INITIAL_RETRY_DELAY_MS = 2000;

const MAX_RETRY_DELAY_MS = 15000;


// ==========================================
// SYNC STATE
// ==========================================
//
// Prevents overlapping sync operations for
// the same sheet.
//
// Example:
//
// syncOrders() starts
// syncOrders() called again
//
// The second request is marked as pending
// and runs again after the first finishes.
//

const syncState = new Map();


// ==========================================
// WAIT / DELAY
// ==========================================

function wait(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


// ==========================================
// CALCULATE RETRY DELAY
// ==========================================

function getRetryDelay(
    attempt
) {

    const delay =
        INITIAL_RETRY_DELAY_MS *
        Math.pow(
            2,
            attempt - 1
        );


    return Math.min(
        delay,
        MAX_RETRY_DELAY_MS
    );

}


// ==========================================
// RUN SAFE SYNC WITH RETRY
// ==========================================

async function runSync(
    syncName,
    syncFunction
) {

    // ======================================
    // GET CURRENT STATE
    // ======================================

    let state =
        syncState.get(
            syncName
        );


    // ======================================
    // IF ALREADY RUNNING
    // ======================================

    if (
        state &&
        state.running
    ) {

        console.log(
            `[Google Sheets] ${syncName} is already running. Queuing another run.`
        );


        state.pending = true;


        return {

            success:
                true,

            queued:
                true,

            message:
                `${syncName} is already running. Another sync has been queued.`

        };

    }


    // ======================================
    // CREATE STATE
    // ======================================

    state = {

        running:
            true,

        pending:
            false

    };


    syncState.set(
        syncName,
        state
    );


    try {

        // ==================================
        // RETRY LOOP
        // ==================================

        let lastError =
            null;


        for (
            let attempt = 1;
            attempt <= MAX_RETRIES + 1;
            attempt++
        ) {

            try {

                console.log(
                    `[Google Sheets] ${syncName} started. Attempt ${attempt}/${MAX_RETRIES + 1}`
                );


                const result =
                    await syncFunction();


                console.log(
                    `[Google Sheets] ${syncName} completed.`,
                    result
                );


                return {

                    success:
                        true,

                    attempt,

                    ...(
                        result || {}
                    )

                };

            } catch (error) {

                lastError =
                    error;


                console.error(
                    `[Google Sheets] ${syncName} failed on attempt ${attempt}:`,
                    error.message
                );


                // ==========================
                // NO MORE RETRIES
                // ==========================

                if (
                    attempt >
                    MAX_RETRIES
                ) {

                    break;

                }


                const retryDelay =
                    getRetryDelay(
                        attempt
                    );


                console.log(
                    `[Google Sheets] ${syncName} retrying in ${retryDelay} ms...`
                );


                await wait(
                    retryDelay
                );

            }

        }


        // ==================================
        // FINAL FAILURE
        // ==================================

        console.error(
            `[Google Sheets] ${syncName} failed after ${MAX_RETRIES + 1} attempts.`
        );


        return {

            success:
                false,

            attempts:
                MAX_RETRIES + 1,

            error:
                lastError
                    ? lastError.message
                    : 'Unknown Google Sheets synchronization error.'

        };

    } finally {

        // ==================================
        // GET FINAL STATE
        // ==================================

        const finalState =
            syncState.get(
                syncName
            );


        // ==================================
        // REMOVE CURRENT STATE
        // ==================================

        syncState.delete(
            syncName
        );


        // ==================================
        // RUN QUEUED SYNC
        // ==================================

        if (
            finalState &&
            finalState.pending
        ) {

            console.log(
                `[Google Sheets] ${syncName} had a queued change. Running another synchronization.`
            );


            // Do not await.
            //
            // This keeps the original business
            // operation independent from Google Sheets.

            runSync(
                syncName,
                syncFunction
            ).catch(
                error => {

                    console.error(
                        `[Google Sheets] Queued ${syncName} failed:`,
                        error.message
                    );

                }
            );

        }

    }

}


// ==========================================
// SYNC CUSTOMER DATA
// ==========================================

function syncCustomerData() {

    return runSync(
        'Customers sync',
        syncCustomers
    );

}


// ==========================================
// SYNC ENQUIRY DATA
// ==========================================

function syncEnquiryData() {

    return runSync(
        'Enquiries sync',
        syncEnquiries
    );

}


// ==========================================
// SYNC ORDER DATA
// ==========================================

function syncOrderData() {

    return runSync(
        'Orders sync',
        syncOrders
    );

}


// ==========================================
// SYNC PAYMENT DATA
// ==========================================

function syncPaymentData() {

    return runSync(
        'Payments sync',
        syncPayments
    );

}


// ==========================================
// SYNC NOTIFICATION DATA
// ==========================================

function syncNotificationData() {

    return runSync(
        'Notifications sync',
        syncNotifications
    );

}


// ==========================================
// SYNC ORDER STATUS HISTORY
// ==========================================

function syncOrderStatusData() {

    return runSync(
        'Order Status History sync',
        syncOrderStatusHistory
    );

}


// ==========================================
// SYNC UPCOMING EVENTS
// ==========================================

function syncUpcomingEventData() {

    return runSync(
        'Upcoming Events sync',
        syncUpcomingEvents
    );

}


// ==========================================
// SYNC BOOKING AGREEMENTS
// ==========================================

function syncBookingAgreementData() {

    return runSync(
        'Booking Agreements sync',
        syncBookingAgreements
    );

}


// ==========================================
// SYNC DASHBOARD
// ==========================================

function syncDashboardData() {

    return runSync(
        'Dashboard sync',
        syncDashboard
    );

}


// ==========================================
// SYNC EVERYTHING
// ==========================================

async function syncEverything() {

    console.log(
        '=========================================='
    );

    console.log(
        'GOOGLE SHEETS — FULL BUSINESS SYNC'
    );

    console.log(
        '=========================================='
    );


    const results = {};


    // ======================================
    // CUSTOMERS
    // ======================================

    results.customers =
        await syncCustomerData();


    // ======================================
    // ENQUIRIES
    // ======================================

    results.enquiries =
        await syncEnquiryData();


    // ======================================
    // ORDERS
    // ======================================

    results.orders =
        await syncOrderData();


    // ======================================
    // PAYMENTS
    // ======================================

    results.payments =
        await syncPaymentData();


    // ======================================
    // NOTIFICATIONS
    // ======================================

    results.notifications =
        await syncNotificationData();


    // ======================================
    // ORDER STATUS HISTORY
    // ======================================

    results.orderStatusHistory =
        await syncOrderStatusData();


    // ======================================
    // UPCOMING EVENTS
    // ======================================

    results.upcomingEvents =
        await syncUpcomingEventData();


    // ======================================
    // BOOKING AGREEMENTS
    // ======================================

    results.bookingAgreements =
        await syncBookingAgreementData();


    // ======================================
    // DASHBOARD
    // ======================================

    results.dashboard =
        await syncDashboardData();


    console.log(
        '=========================================='
    );

    console.log(
        'GOOGLE SHEETS — FULL BUSINESS SYNC DONE'
    );

    console.log(
        '=========================================='
    );


    return results;

}


// ==========================================
// GET SYNC STATUS
// ==========================================
//
// Useful for debugging/admin monitoring.
//

function getSyncStatus() {

    const status = {};


    for (
        const [
            syncName,
            state
        ]
        of syncState.entries()
    ) {

        status[syncName] = {

            running:
                state.running,

            pending:
                state.pending

        };

    }


    return status;

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    syncCustomerData,

    syncEnquiryData,

    syncOrderData,

    syncPaymentData,

    syncNotificationData,

    syncOrderStatusData,

    syncUpcomingEventData,

    syncBookingAgreementData,

    syncDashboardData,

    syncEverything,

    getSyncStatus

};
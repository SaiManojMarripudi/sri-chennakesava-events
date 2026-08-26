const dotenv = require('dotenv');

dotenv.config();


const {
    google
} = require('googleapis');


const {
    pool
} = require('../config/db');


const {
    getAuthenticatedOAuthClient
} = require('./googleOAuthService');


// ==========================================
// GOOGLE OAUTH 2.0
// ==========================================

const auth =
    getAuthenticatedOAuthClient();


if (!auth) {

    throw new Error(
        'Google account is not authorized. ' +
        'Open http://localhost:5000/api/google/authorize first.'
    );

}


// ==========================================
// GOOGLE CLIENTS
// ==========================================

const drive =
    google.drive({
        version: 'v3',
        auth
    });


const sheets =
    google.sheets({
        version: 'v4',
        auth
    });


// ==========================================
// CONFIGURATION
// ==========================================

const DRIVE_FOLDER_ID =
    process.env.GOOGLE_DRIVE_FOLDER_ID;


const SPREADSHEET_ID =
    process.env.GOOGLE_BUSINESS_SPREADSHEET_ID;


const SPREADSHEET_NAME =
    process.env.GOOGLE_BUSINESS_SPREADSHEET_NAME ||
    'SRI CHENNAKESAVA EVENTS - Business Data';


// ==========================================
// REQUIRED SHEETS
// ==========================================

const REQUIRED_SHEETS = [

    'Dashboard',

    'Enquiries',

    'Orders',

    'Upcoming Events',

    'Customers',

    'Payments',

    'Notifications',

    'Order Status History',

    'Booking Agreements'

];


// ==========================================
// CUSTOMER SHEET HEADERS
// ==========================================

const CUSTOMER_HEADERS = [

    'Customer ID',
    'Full Name',
    'Phone',
    'Email',
    'Created At',
    'Updated At'

];


// ==========================================
// FORMAT DATABASE VALUE
// ==========================================

function formatSheetValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }


    if (
        value instanceof Date
    ) {

        return value.toISOString();

    }


    return String(value);

}


// ==========================================
// GET BUSINESS SPREADSHEET ID
// ==========================================

async function getBusinessSpreadsheetId() {

    if (
        SPREADSHEET_ID
    ) {

        return SPREADSHEET_ID;

    }


    const spreadsheet =
        await findBusinessSpreadsheet();


    if (
        !spreadsheet ||
        !spreadsheet.id
    ) {

        throw new Error(
            'Business spreadsheet was not found.'
        );

    }


    return spreadsheet.id;

}


// ==========================================
// FIND EXISTING SPREADSHEET
// ==========================================

async function findBusinessSpreadsheet() {

    if (
        !DRIVE_FOLDER_ID
    ) {

        throw new Error(
            'GOOGLE_DRIVE_FOLDER_ID is missing from .env'
        );

    }


    const response =
        await drive.files.list({

            q:
                `'${DRIVE_FOLDER_ID}' in parents ` +
                `and name = '${SPREADSHEET_NAME}' ` +
                `and mimeType = 'application/vnd.google-apps.spreadsheet' ` +
                `and trashed = false`,

            spaces:
                'drive',

            fields:
                'files(id,name,mimeType,parents)',

            pageSize:
                10

        });


    if (
        !response.data.files ||
        response.data.files.length === 0
    ) {

        return null;

    }


    return response.data.files[0];

}


// ==========================================
// CREATE BUSINESS SPREADSHEET
// ==========================================

async function createBusinessSpreadsheet() {

    if (
        !DRIVE_FOLDER_ID
    ) {

        throw new Error(
            'GOOGLE_DRIVE_FOLDER_ID is missing from .env'
        );

    }


    const existingSpreadsheet =
        await findBusinessSpreadsheet();


    if (
        existingSpreadsheet
    ) {

        console.log(
            'Business spreadsheet already exists.'
        );


        console.log(
            `Spreadsheet ID: ${existingSpreadsheet.id}`
        );


        return existingSpreadsheet;

    }


    const response =
        await sheets.spreadsheets.create({

            requestBody: {

                properties: {

                    title:
                        SPREADSHEET_NAME

                }

            }

        });


    const spreadsheetId =
        response.data.spreadsheetId;


    if (
        !spreadsheetId
    ) {

        throw new Error(
            'Google did not return a spreadsheet ID.'
        );

    }


    await drive.files.update({

        fileId:
            spreadsheetId,

        addParents:
            DRIVE_FOLDER_ID,

        fields:
            'id,name,parents'

    });


    console.log(
        'Business spreadsheet created successfully.'
    );


    console.log(
        `Spreadsheet ID: ${spreadsheetId}`
    );


    return {

        id:
            spreadsheetId,

        name:
            SPREADSHEET_NAME,

        mimeType:
            'application/vnd.google-apps.spreadsheet'

    };

}


// ==========================================
// INITIALIZE REQUIRED SHEETS
// ==========================================

async function initializeBusinessSheets(
    spreadsheetId
) {

    if (
        !spreadsheetId
    ) {

        throw new Error(
            'Spreadsheet ID is required.'
        );

    }


    const spreadsheet =
        await sheets.spreadsheets.get({

            spreadsheetId,

            fields:
                'sheets.properties'

        });


    const existingNames =
        (
            spreadsheet.data.sheets ||
            []
        )
            .map(
                sheet =>
                    sheet.properties.title
            );


    const missingSheets =
        REQUIRED_SHEETS.filter(
            name =>
                !existingNames.includes(name)
        );


    if (
        missingSheets.length === 0
    ) {

        console.log(
            'All required Google Sheets tabs already exist.'
        );


        return;

    }


    const requests =
        missingSheets.map(
            title => ({

                addSheet: {

                    properties: {

                        title

                    }

                }

            })
        );


    await sheets.spreadsheets.batchUpdate({

        spreadsheetId,

        requestBody: {

            requests

        }

    });


    console.log(
        'Google Sheets tabs initialized successfully.'
    );


    console.log(
        missingSheets
    );

}


// ==========================================
// INITIALIZE COMPLETE BUSINESS WORKBOOK
// ==========================================

async function initializeBusinessSpreadsheet() {

    const spreadsheet =
        await createBusinessSpreadsheet();


    await initializeBusinessSheets(
        spreadsheet.id
    );


    return spreadsheet;

}


// ==========================================
// FIND SHEET ID BY NAME
// ==========================================

async function getSheetIdByName(
    spreadsheetId,
    sheetName
) {

    const response =
        await sheets.spreadsheets.get({

            spreadsheetId,

            fields:
                'sheets.properties'

        });


    const sheet =
        (
            response.data.sheets ||
            []
        )
            .find(
                item =>
                    item.properties.title ===
                    sheetName
            );


    if (
        !sheet
    ) {

        throw new Error(
            `Google Sheet tab "${sheetName}" was not found.`
        );

    }


    return sheet.properties.sheetId;

}


// ==========================================
// SYNC CUSTOMERS
// ==========================================

async function syncCustomers() {

    console.log(
        'Starting Customers Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY CUSTOMERS TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Customers'
    );


    // ======================================
    // READ MYSQL CUSTOMERS
    // ======================================

    const [
        customers
    ] =
        await pool.execute(
            `
            SELECT

                customer_id,
                full_name,
                phone,
                email,
                created_at,
                updated_at

            FROM customers

            ORDER BY
                customer_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        CUSTOMER_HEADERS

    ];


    for (
        const customer
        of customers
    ) {

        values.push([

            formatSheetValue(
                customer.customer_id
            ),

            formatSheetValue(
                customer.full_name
            ),

            formatSheetValue(
                customer.phone
            ),

            formatSheetValue(
                customer.email
            ),

            formatSheetValue(
                customer.created_at
            ),

            formatSheetValue(
                customer.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Customers!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Customers!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Customers sync completed. ${customers.length} customers synchronized.`
    );


    return {

        success:
            true,

        count:
            customers.length

    };

}

// ==========================================
// ENQUIRY SHEET HEADERS
// ==========================================

const ENQUIRY_HEADERS = [

    'Enquiry ID',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Email',
    'Event Type',
    'Event Date',
    'Guest Count',
    'Budget',
    'Event Location',
    'Message',
    'Status',
    'Submitted At',
    'Updated At'

];


// ==========================================
// SYNC ENQUIRIES
// ==========================================

async function syncEnquiries() {

    console.log(
        'Starting Enquiries Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY ENQUIRIES TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Enquiries'
    );


    // ======================================
    // READ MYSQL ENQUIRIES
    // ======================================

    const [
        enquiries
    ] =
        await pool.execute(
            `
            SELECT

                e.enquiry_id,
                e.customer_id,

                c.full_name,
                c.phone,
                c.email,

                e.event_type,
                e.event_date,
                e.guest_count,
                e.budget,
                e.event_location,
                e.message,

                e.status,
                e.submitted_at,
                e.updated_at

            FROM enquiries e

            INNER JOIN customers c
                ON e.customer_id =
                   c.customer_id

            ORDER BY
                e.enquiry_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        ENQUIRY_HEADERS

    ];


    for (
        const enquiry
        of enquiries
    ) {

        values.push([

            formatSheetValue(
                enquiry.enquiry_id
            ),

            formatSheetValue(
                enquiry.customer_id
            ),

            formatSheetValue(
                enquiry.full_name
            ),

            formatSheetValue(
                enquiry.phone
            ),

            formatSheetValue(
                enquiry.email
            ),

            formatSheetValue(
                enquiry.event_type
            ),

            formatSheetValue(
                enquiry.event_date
            ),

            formatSheetValue(
                enquiry.guest_count
            ),

            formatSheetValue(
                enquiry.budget
            ),

            formatSheetValue(
                enquiry.event_location
            ),

            formatSheetValue(
                enquiry.message
            ),

            formatSheetValue(
                enquiry.status
            ),

            formatSheetValue(
                enquiry.submitted_at
            ),

            formatSheetValue(
                enquiry.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Enquiries!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Enquiries!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Enquiries sync completed. ${enquiries.length} enquiries synchronized.`
    );


    return {

        success:
            true,

        count:
            enquiries.length

    };

}

// ==========================================
// ORDER SHEET HEADERS
// ==========================================

const ORDER_HEADERS = [

    'Order ID',
    'Booking Number',
    'Enquiry ID',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Email',
    'Event Type',
    'Event Date',
    'Guest Count',
    'Budget',
    'Total Amount',
    'Payment Status',
    'Agreement Status',
    'Agreement Date',
    'Agreement Notes',
    'Booking Details Status',
    'Event Location',
    'Message',
    'Status',
    'Accepted At',
    'Completed At',
    'Admin Notes',
    'Created At',
    'Updated At'

];


// ==========================================
// SYNC ORDERS
// ==========================================

async function syncOrders() {

    console.log(
        'Starting Orders Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY ORDERS TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Orders'
    );


    // ======================================
    // READ MYSQL ORDERS
    // ======================================

    const [
        orders
    ] =
        await pool.execute(
            `
            SELECT

                o.order_id,
                o.booking_number,
                o.enquiry_id,
                o.customer_id,

                c.full_name,
                c.phone,
                c.email,

                o.event_type,
                o.event_date,
                o.guest_count,
                o.budget,
                o.total_amount,

                o.payment_status,

                o.agreement_status,
                o.agreement_date,
                o.agreement_notes,

                o.booking_details_status,

                o.event_location,
                o.message,

                o.status,
                o.accepted_at,
                o.completed_at,
                o.admin_notes,

                o.created_at,
                o.updated_at

            FROM orders o

            INNER JOIN customers c
                ON o.customer_id =
                   c.customer_id

            ORDER BY
                o.order_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        ORDER_HEADERS

    ];


    for (
        const order
        of orders
    ) {

        values.push([

            formatSheetValue(
                order.order_id
            ),

            formatSheetValue(
                order.booking_number
            ),

            formatSheetValue(
                order.enquiry_id
            ),

            formatSheetValue(
                order.customer_id
            ),

            formatSheetValue(
                order.full_name
            ),

            formatSheetValue(
                order.phone
            ),

            formatSheetValue(
                order.email
            ),

            formatSheetValue(
                order.event_type
            ),

            formatSheetValue(
                order.event_date
            ),

            formatSheetValue(
                order.guest_count
            ),

            formatSheetValue(
                order.budget
            ),

            formatSheetValue(
                order.total_amount
            ),

            formatSheetValue(
                order.payment_status
            ),

            formatSheetValue(
                order.agreement_status
            ),

            formatSheetValue(
                order.agreement_date
            ),

            formatSheetValue(
                order.agreement_notes
            ),

            formatSheetValue(
                order.booking_details_status
            ),

            formatSheetValue(
                order.event_location
            ),

            formatSheetValue(
                order.message
            ),

            formatSheetValue(
                order.status
            ),

            formatSheetValue(
                order.accepted_at
            ),

            formatSheetValue(
                order.completed_at
            ),

            formatSheetValue(
                order.admin_notes
            ),

            formatSheetValue(
                order.created_at
            ),

            formatSheetValue(
                order.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Orders!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Orders!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Orders sync completed. ${orders.length} orders synchronized.`
    );


    return {

        success:
            true,

        count:
            orders.length

    };

}

// ==========================================
// PAYMENT SHEET HEADERS
// ==========================================

const PAYMENT_HEADERS = [

    'Payment ID',
    'Order ID',
    'Booking Number',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Event Type',
    'Event Date',
    'Amount',
    'Payment Type',
    'Payment Method',
    'Payment Date',
    'Notes',
    'Created By',
    'Created At',
    'Updated At'

];


// ==========================================
// SYNC PAYMENTS
// ==========================================

async function syncPayments() {

    console.log(
        'Starting Payments Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY PAYMENTS TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Payments'
    );


    // ======================================
    // READ MYSQL PAYMENTS
    // ======================================

    const [
        payments
    ] =
        await pool.execute(
            `
            SELECT

                p.payment_id,
                p.order_id,

                o.booking_number,

                o.customer_id,

                c.full_name,
                c.phone,

                o.event_type,
                o.event_date,

                p.amount,
                p.payment_type,
                p.payment_method,
                p.payment_date,
                p.notes,

                a.full_name AS created_by_name,

                p.created_at,
                p.updated_at

            FROM payments p

            INNER JOIN orders o
                ON p.order_id =
                   o.order_id

            INNER JOIN customers c
                ON o.customer_id =
                   c.customer_id

            LEFT JOIN admin_users a
                ON p.created_by =
                   a.admin_id

            ORDER BY
                p.payment_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        PAYMENT_HEADERS

    ];


    for (
        const payment
        of payments
    ) {

        values.push([

            formatSheetValue(
                payment.payment_id
            ),

            formatSheetValue(
                payment.order_id
            ),

            formatSheetValue(
                payment.booking_number
            ),

            formatSheetValue(
                payment.customer_id
            ),

            formatSheetValue(
                payment.full_name
            ),

            formatSheetValue(
                payment.phone
            ),

            formatSheetValue(
                payment.event_type
            ),

            formatSheetValue(
                payment.event_date
            ),

            formatSheetValue(
                payment.amount
            ),

            formatSheetValue(
                payment.payment_type
            ),

            formatSheetValue(
                payment.payment_method
            ),

            formatSheetValue(
                payment.payment_date
            ),

            formatSheetValue(
                payment.notes
            ),

            formatSheetValue(
                payment.created_by_name
            ),

            formatSheetValue(
                payment.created_at
            ),

            formatSheetValue(
                payment.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Payments!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Payments!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Payments sync completed. ${payments.length} payments synchronized.`
    );


    return {

        success:
            true,

        count:
            payments.length

    };

}

// ==========================================
// NOTIFICATION SHEET HEADERS
// ==========================================

const NOTIFICATION_HEADERS = [

    'Notification ID',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Enquiry ID',
    'Order ID',
    'Notification Type',
    'Channel',
    'Recipient',
    'Message',
    'Status',
    'Provider Message ID',
    'Error Message',
    'Sent At',
    'Delivered At',
    'Failed At',
    'Created At',
    'Updated At'

];


// ==========================================
// SYNC NOTIFICATIONS
// ==========================================

async function syncNotifications() {

    console.log(
        'Starting Notifications Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY NOTIFICATIONS TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Notifications'
    );


    // ======================================
    // READ MYSQL NOTIFICATIONS
    // ======================================

    const [
        notifications
    ] =
        await pool.execute(
            `
            SELECT

                n.notification_id,
                n.customer_id,

                c.full_name,
                c.phone,

                n.enquiry_id,
                n.order_id,

                n.notification_type,
                n.channel,
                n.recipient,
                n.message,
                n.status,

                n.provider_message_id,
                n.error_message,

                n.sent_at,
                n.delivered_at,
                n.failed_at,

                n.created_at,
                n.updated_at

            FROM customer_notifications n

            INNER JOIN customers c
                ON n.customer_id =
                   c.customer_id

            ORDER BY
                n.notification_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        NOTIFICATION_HEADERS

    ];


    for (
        const notification
        of notifications
    ) {

        values.push([

            formatSheetValue(
                notification.notification_id
            ),

            formatSheetValue(
                notification.customer_id
            ),

            formatSheetValue(
                notification.full_name
            ),

            formatSheetValue(
                notification.phone
            ),

            formatSheetValue(
                notification.enquiry_id
            ),

            formatSheetValue(
                notification.order_id
            ),

            formatSheetValue(
                notification.notification_type
            ),

            formatSheetValue(
                notification.channel
            ),

            formatSheetValue(
                notification.recipient
            ),

            formatSheetValue(
                notification.message
            ),

            formatSheetValue(
                notification.status
            ),

            formatSheetValue(
                notification.provider_message_id
            ),

            formatSheetValue(
                notification.error_message
            ),

            formatSheetValue(
                notification.sent_at
            ),

            formatSheetValue(
                notification.delivered_at
            ),

            formatSheetValue(
                notification.failed_at
            ),

            formatSheetValue(
                notification.created_at
            ),

            formatSheetValue(
                notification.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Notifications!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Notifications!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Notifications sync completed. ${notifications.length} notifications synchronized.`
    );


    return {

        success:
            true,

        count:
            notifications.length

    };

}

// ==========================================
// ORDER STATUS HISTORY SHEET HEADERS
// ==========================================

const ORDER_STATUS_HISTORY_HEADERS = [

    'History ID',
    'Order ID',
    'Old Status',
    'New Status',
    'Changed By',
    'Admin Name',
    'Notes',
    'Changed At'

];


// ==========================================
// SYNC ORDER STATUS HISTORY
// ==========================================

async function syncOrderStatusHistory() {

    console.log(
        'Starting Order Status History Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY SHEET TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Order Status History'
    );


    // ======================================
    // READ MYSQL STATUS HISTORY
    // ======================================

    const [
        history
    ] =
        await pool.execute(
            `
            SELECT

                h.history_id,
                h.order_id,
                h.old_status,
                h.new_status,
                h.changed_by,

                a.full_name AS admin_name,

                h.notes,
                h.changed_at

            FROM order_status_history h

            LEFT JOIN admin_users a
                ON h.changed_by =
                   a.admin_id

            ORDER BY
                h.history_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        ORDER_STATUS_HISTORY_HEADERS

    ];


    for (
        const item
        of history
    ) {

        values.push([

            formatSheetValue(
                item.history_id
            ),

            formatSheetValue(
                item.order_id
            ),

            formatSheetValue(
                item.old_status
            ),

            formatSheetValue(
                item.new_status
            ),

            formatSheetValue(
                item.changed_by
            ),

            formatSheetValue(
                item.admin_name
            ),

            formatSheetValue(
                item.notes
            ),

            formatSheetValue(
                item.changed_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Order Status History!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Order Status History!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Order Status History sync completed. ${history.length} records synchronized.`
    );


    return {

        success:
            true,

        count:
            history.length

    };

}

// ==========================================
// UPCOMING EVENTS SHEET HEADERS
// ==========================================

const UPCOMING_EVENTS_HEADERS = [

    'Order ID',
    'Booking Number',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Email',
    'Event Type',
    'Event Date',
    'Guest Count',
    'Budget',
    'Total Amount',
    'Payment Status',
    'Agreement Status',
    'Booking Details Status',
    'Event Location',
    'Order Status',
    'Created At',
    'Updated At'

];


// ==========================================
// SYNC UPCOMING EVENTS
// ==========================================

async function syncUpcomingEvents() {

    console.log(
        'Starting Upcoming Events Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY SHEET TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Upcoming Events'
    );


    // ======================================
    // READ MYSQL UPCOMING EVENTS
    // ======================================

    const [
        events
    ] =
        await pool.execute(
            `
            SELECT

                o.order_id,
                o.booking_number,
                o.customer_id,

                c.full_name,
                c.phone,
                c.email,

                o.event_type,
                o.event_date,
                o.guest_count,
                o.budget,
                o.total_amount,

                o.payment_status,
                o.agreement_status,
                o.booking_details_status,

                o.event_location,

                o.status,

                o.created_at,
                o.updated_at

            FROM orders o

            INNER JOIN customers c
                ON o.customer_id =
                   c.customer_id

            WHERE

                (
                    o.status = 'Confirmed'
                    OR
                    o.status = 'Upcoming'
                )

                AND o.event_date >= CURDATE()

                AND o.booking_details_status =
                    'Confirmed'

                AND o.agreement_status =
                    'Signed'

                AND o.booking_number IS NOT NULL

                AND TRIM(
                    o.booking_number
                ) <> ''

            ORDER BY
                o.event_date ASC,
                o.order_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        UPCOMING_EVENTS_HEADERS

    ];


    for (
        const event
        of events
    ) {

        values.push([

            formatSheetValue(
                event.order_id
            ),

            formatSheetValue(
                event.booking_number
            ),

            formatSheetValue(
                event.customer_id
            ),

            formatSheetValue(
                event.full_name
            ),

            formatSheetValue(
                event.phone
            ),

            formatSheetValue(
                event.email
            ),

            formatSheetValue(
                event.event_type
            ),

            formatSheetValue(
                event.event_date
            ),

            formatSheetValue(
                event.guest_count
            ),

            formatSheetValue(
                event.budget
            ),

            formatSheetValue(
                event.total_amount
            ),

            formatSheetValue(
                event.payment_status
            ),

            formatSheetValue(
                event.agreement_status
            ),

            formatSheetValue(
                event.booking_details_status
            ),

            formatSheetValue(
                event.event_location
            ),

            formatSheetValue(
                event.status
            ),

            formatSheetValue(
                event.created_at
            ),

            formatSheetValue(
                event.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Upcoming Events!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Upcoming Events!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Upcoming Events sync completed. ${events.length} upcoming events synchronized.`
    );


    return {

        success:
            true,

        count:
            events.length

    };

}

// ==========================================
// BOOKING AGREEMENTS SHEET HEADERS
// ==========================================

const BOOKING_AGREEMENTS_HEADERS = [

    'Order ID',
    'Booking Number',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Email',
    'Event Type',
    'Event Date',
    'Booking Details Status',
    'Agreement Status',
    'Agreement Date',
    'Agreement Notes',
    'Order Status',
    'Created At',
    'Updated At'

];


// ==========================================
// SYNC BOOKING AGREEMENTS
// ==========================================

async function syncBookingAgreements() {

    console.log(
        'Starting Booking Agreements Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY SHEET TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Booking Agreements'
    );


    // ======================================
    // READ MYSQL BOOKING AGREEMENTS
    // ======================================

    const [
        agreements
    ] =
        await pool.execute(
            `
            SELECT

                o.order_id,
                o.booking_number,
                o.customer_id,

                c.full_name,
                c.phone,
                c.email,

                o.event_type,
                o.event_date,

                o.booking_details_status,

                o.agreement_status,
                o.agreement_date,
                o.agreement_notes,

                o.status,

                o.created_at,
                o.updated_at

            FROM orders o

            INNER JOIN customers c
                ON o.customer_id =
                   c.customer_id

            ORDER BY
                o.order_id ASC
            `
        );


    // ======================================
    // PREPARE SHEET DATA
    // ======================================

    const values = [

        BOOKING_AGREEMENTS_HEADERS

    ];


    for (
        const agreement
        of agreements
    ) {

        values.push([

            formatSheetValue(
                agreement.order_id
            ),

            formatSheetValue(
                agreement.booking_number
            ),

            formatSheetValue(
                agreement.customer_id
            ),

            formatSheetValue(
                agreement.full_name
            ),

            formatSheetValue(
                agreement.phone
            ),

            formatSheetValue(
                agreement.email
            ),

            formatSheetValue(
                agreement.event_type
            ),

            formatSheetValue(
                agreement.event_date
            ),

            formatSheetValue(
                agreement.booking_details_status
            ),

            formatSheetValue(
                agreement.agreement_status
            ),

            formatSheetValue(
                agreement.agreement_date
            ),

            formatSheetValue(
                agreement.agreement_notes
            ),

            formatSheetValue(
                agreement.status
            ),

            formatSheetValue(
                agreement.created_at
            ),

            formatSheetValue(
                agreement.updated_at
            )

        ]);

    }


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Booking Agreements!A:Z'

    });


    // ======================================
    // WRITE NEW DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Booking Agreements!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        `Booking Agreements sync completed. ${agreements.length} records synchronized.`
    );


    return {

        success:
            true,

        count:
            agreements.length

    };

}

// ==========================================
// DASHBOARD SHEET HEADERS
// ==========================================

const DASHBOARD_HEADERS = [
    'Metric',
    'Value'
];


// ==========================================
// SYNC DASHBOARD
// ==========================================

async function syncDashboard() {

    console.log(
        'Starting Dashboard Google Sheets sync...'
    );


    // ======================================
    // GET SPREADSHEET
    // ======================================

    const spreadsheetId =
        await getBusinessSpreadsheetId();


    // ======================================
    // VERIFY DASHBOARD TAB
    // ======================================

    await getSheetIdByName(
        spreadsheetId,
        'Dashboard'
    );


    // ======================================
    // GET DASHBOARD DATA FROM MYSQL
    // ======================================

    const [enquiryCounts] =
        await pool.execute(
            `
            SELECT

                COUNT(*) AS total,

                SUM(
                    status = 'Pending'
                ) AS pending,

                SUM(
                    status = 'Accepted'
                ) AS accepted,

                SUM(
                    status = 'Rejected'
                ) AS rejected

            FROM enquiries
            `
        );


    const [orderCounts] =
        await pool.execute(
            `
            SELECT

                COUNT(*) AS total,

                SUM(
                    status = 'Confirmed'
                ) AS confirmed,

                SUM(
                    status IN (
                        'Confirmed',
                        'Upcoming'
                    )
                    AND event_date >= CURDATE()
                    AND booking_details_status = 'Confirmed'
                    AND agreement_status = 'Signed'
                    AND booking_number IS NOT NULL
                    AND TRIM(booking_number) <> ''
                ) AS upcoming,

                SUM(
                    status = 'Completed'
                ) AS completed,

                SUM(
                    status = 'Cancelled'
                ) AS cancelled

            FROM orders
            `
        );


    const [customerCounts] =
        await pool.execute(
            `
            SELECT
                COUNT(*) AS total

            FROM customers
            `
        );


    const [financialSummary] =
        await pool.execute(
            `
            SELECT

                COALESCE(
                    SUM(
                        CASE
                            WHEN status != 'Cancelled'
                            THEN COALESCE(
                                total_amount,
                                0
                            )
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_booking_value,

                COALESCE(
                    (
                        SELECT
                            SUM(p.amount)

                        FROM payments p

                        INNER JOIN orders po
                            ON p.order_id =
                               po.order_id

                        WHERE po.status != 'Cancelled'
                    ),
                    0
                ) AS total_paid

            FROM orders
            `
        );


    // ======================================
    // EXTRACT RESULTS
    // ======================================

    const enquiries =
        enquiryCounts[0];


    const orders =
        orderCounts[0];


    const customers =
        customerCounts[0];


    const financials =
        financialSummary[0];


    // ======================================
    // CALCULATE FINANCIAL VALUES
    // ======================================

    const totalBookingValue =
        Number(
            financials.total_booking_value
        ) || 0;


    const totalPaid =
        Number(
            financials.total_paid
        ) || 0;


    const outstandingBalance =
        totalBookingValue -
        totalPaid;


    // ======================================
    // PREPARE DASHBOARD DATA
    // ======================================

    const values = [

        DASHBOARD_HEADERS,

        [
            'Total Enquiries',
            Number(enquiries.total) || 0
        ],

        [
            'Pending Enquiries',
            Number(enquiries.pending) || 0
        ],

        [
            'Accepted Enquiries',
            Number(enquiries.accepted) || 0
        ],

        [
            'Rejected Enquiries',
            Number(enquiries.rejected) || 0
        ],

        [
            'Total Orders',
            Number(orders.total) || 0
        ],

        [
            'Confirmed Orders',
            Number(orders.confirmed) || 0
        ],

        [
            'Upcoming Events',
            Number(orders.upcoming) || 0
        ],

        [
            'Completed Orders',
            Number(orders.completed) || 0
        ],

        [
            'Cancelled Orders',
            Number(orders.cancelled) || 0
        ],

        [
            'Total Customers',
            Number(customers.total) || 0
        ],

        [
            'Total Booking Value',
            totalBookingValue
        ],

        [
            'Total Paid',
            totalPaid
        ],

        [
            'Outstanding Balance',
            outstandingBalance
        ]

    ];


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({

        spreadsheetId,

        range:
            'Dashboard!A:Z'

    });


    // ======================================
    // WRITE DASHBOARD DATA
    // ======================================

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:
            'Dashboard!A1',

        valueInputOption:
            'RAW',

        requestBody: {

            values

        }

    });


    console.log(
        'Dashboard sync completed successfully.'
    );


    return {

        success:
            true

    };

}

// ==========================================
// TEST GOOGLE DRIVE CONNECTION
// ==========================================

async function testGoogleDriveConnection() {

    try {

        const response =
            await drive.files.list({

                pageSize:
                    10,

                fields:
                    'files(id,name,mimeType,parents)'

            });


        console.log(
            'Google Drive connection successful.'
        );


        console.log(
            'Accessible files/folders:'
        );


        console.log(
            response.data.files
        );


        return true;

    } catch (error) {

        console.error(
            'Google Drive connection failed.'
        );


        console.error(
            error.message
        );


        return false;

    }

}


// ==========================================
// TEST GOOGLE SHEETS CONNECTION
// ==========================================

async function testGoogleSheetsConnection() {

    try {

        const response =
            await sheets.spreadsheets.create({

                requestBody: {

                    properties: {

                        title:
                            'SCE Temporary Connection Test'

                    }

                }

            });


        const spreadsheetId =
            response.data.spreadsheetId;


        if (
            spreadsheetId
        ) {

            await drive.files.delete({

                fileId:
                    spreadsheetId

            });

        }


        console.log(
            'Google Sheets connection successful.'
        );


        return true;

    } catch (error) {

        console.error(
            'Google Sheets connection failed.'
        );


        console.error(
            error.message
        );


        return false;

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    auth,

    drive,

    sheets,

    testGoogleDriveConnection,

    testGoogleSheetsConnection,

    findBusinessSpreadsheet,

    createBusinessSpreadsheet,

    initializeBusinessSheets,

    initializeBusinessSpreadsheet,

    getSheetIdByName,

    syncCustomers,

    syncEnquiries,

    syncOrders,

    syncPayments,

    syncNotifications,

    syncOrderStatusHistory,

    syncUpcomingEvents,

    syncBookingAgreements,

    syncDashboard

};
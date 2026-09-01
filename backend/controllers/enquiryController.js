const { pool } = require('../config/db');

const {
    sendCustomerNotification
} = require('../services/notificationService');

const {
    syncCustomerData,
    syncEnquiryData,
    syncNotificationData,
    syncDashboardData
} = require('../services/businessDataSyncService');

const {
    sendNewEnquiryEmail
} = require(
    '../services/gmailService'
);

const {
    enquiryReceivedMessage,
    enquiryAcceptedMessage,
    enquiryRejectedMessage
} = require('../services/notificationTemplates');

// ==========================================
// CREATE ENQUIRY
// ==========================================

const createEnquiry = async (req, res) => {

    // Get submitted data from the request
    const {
        full_name,
        phone,
        email,
        event_type,
        event_date,
        guest_count,
        budget,
        event_location,
        message
    } = req.body;


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
        !full_name ||
        !phone ||
        !event_type ||
        !event_date
    ) {

        return res.status(400).json({
            success: false,
            message:
                'Name, phone, event type and event date are required.'
        });

    }


    // ==========================================
    // START DATABASE CONNECTION
    // ==========================================

    let connection;

    try {

        connection = await pool.getConnection();


        // ==========================================
        // START TRANSACTION
        // ==========================================

        await connection.beginTransaction();


        // ==========================================
        // FIND EXISTING CUSTOMER
        // ==========================================

        const [existingCustomers] = await connection.execute(
            `
            SELECT customer_id
            FROM customers
            WHERE phone = ?
            LIMIT 1
            `,
            [phone]
        );


        let customerId;


        // ==========================================
        // EXISTING CUSTOMER
        // ==========================================

        if (existingCustomers.length > 0) {

            customerId = existingCustomers[0].customer_id;


            // Update customer information
            await connection.execute(
                `
                UPDATE customers
                SET
                    full_name = ?,
                    email = ?
                WHERE customer_id = ?
                `,
                [
                    full_name,
                    email || null,
                    customerId
                ]
            );

        }


        // ==========================================
        // NEW CUSTOMER
        // ==========================================

        else {

            const [customerResult] = await connection.execute(
                `
                INSERT INTO customers
                (
                    full_name,
                    phone,
                    email
                )
                VALUES (?, ?, ?)
                `,
                [
                    full_name,
                    phone,
                    email || null
                ]
            );

            customerId = customerResult.insertId;

        }


        // ==========================================
        // CREATE ENQUIRY
        // ==========================================

        const [enquiryResult] = await connection.execute(
            `
            INSERT INTO enquiries
            (
                customer_id,
                event_type,
                event_date,
                guest_count,
                budget,
                event_location,
                message
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                customerId,
                event_type,
                event_date,
                guest_count || null,
                budget || null,
                event_location || null,
                message || null
            ]
        );


        const enquiryId = enquiryResult.insertId;


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await connection.commit();

        // ==========================================
        // CUSTOMER NOTIFICATION
        // ==========================================

        try {

            const notificationMessage =
                enquiryReceivedMessage({

                    enquiry_id:
                        enquiryId,

                    full_name:
                        full_name,

                    phone:
                        phone,

                    email:
                        email,

                    event_type:
                        event_type,

                    event_date:
                        event_date,

                    guest_count:
                        guest_count,

                    budget:
                        budget,

                    event_location:
                        event_location

                });


            await sendCustomerNotification({

                customerId:
                    customerId,

                enquiryId:
                    enquiryId,

                notificationType:
                    'ENQUIRY_RECEIVED',

                recipient:
                    phone,

                message:
                    notificationMessage

            });

        } catch (notificationError) {

            console.error(
                'Enquiry notification error:',
                notificationError
            );

        }

        // ==========================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ==========================================

        syncCustomerData();

        syncEnquiryData();

        syncNotificationData();

        syncDashboardData();


        // ==========================================
        // BUSINESS EMAIL NOTIFICATION
        // ==========================================

        try {

            await sendNewEnquiryEmail({

                enquiry_id:
                    enquiryId,

                full_name:
                    full_name,

                phone:
                    phone,

                email:
                    email,

                event_type:
                    event_type,

                event_date:
                    event_date,

                guest_count:
                    guest_count,

                budget:
                    budget,

                event_location:
                    event_location,

                message:
                    message

            });

        } catch (emailError) {

            console.error(
                'New enquiry email notification error:',
                emailError
            );

        }

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                'Your enquiry has been submitted successfully.',

            enquiry_id: enquiryId,

            customer_id: customerId,

            status: 'Pending'

        });


    } catch (error) {


        // ==========================================
        // ROLLBACK IF SOMETHING FAILS
        // ==========================================

        if (connection) {

            await connection.rollback();

        }


        console.error(
            'Create enquiry error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to submit your enquiry right now.'

        });


    } finally {


        // ==========================================
        // RELEASE DATABASE CONNECTION
        // ==========================================

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// GET ALL ENQUIRIES
// ==========================================

const getAllEnquiries = async (req, res) => {

    try {

        const [enquiries] = await pool.execute(
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
                ON e.customer_id = c.customer_id

            ORDER BY
                e.submitted_at DESC
            `
        );


        return res.status(200).json({

            success: true,

            count: enquiries.length,

            enquiries: enquiries

        });


    } catch (error) {

        console.error(
            'Get all enquiries error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve enquiries right now.'

        });

    }

};

// ==========================================
// GET SINGLE ENQUIRY BY ID
// ==========================================

const getEnquiryById = async (req, res) => {

    try {

        const enquiryId = Number(req.params.id);


        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!Number.isInteger(enquiryId) || enquiryId <= 0) {

            return res.status(400).json({

                success: false,

                message: 'Invalid enquiry ID.'

            });

        }


        // ==========================================
        // FIND ENQUIRY
        // ==========================================

        const [enquiries] = await pool.execute(
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
                ON e.customer_id = c.customer_id

            WHERE e.enquiry_id = ?

            LIMIT 1
            `,
            [enquiryId]
        );


        // ==========================================
        // ENQUIRY NOT FOUND
        // ==========================================

        if (enquiries.length === 0) {

            return res.status(404).json({

                success: false,

                message: 'Enquiry not found.'

            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            enquiry: enquiries[0]

        });


    } catch (error) {

        console.error(
            'Get enquiry by ID error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve the enquiry right now.'

        });

    }

};

// ==========================================
// UPDATE ENQUIRY STATUS
// ==========================================

const updateEnquiryStatus = async (req, res) => {

    let connection;

    try {

        const enquiryId =
            Number(req.params.id);

        const { status } = req.body;


        // ==========================================
        // VALIDATE ENQUIRY ID
        // ==========================================

        if (
            !Number.isInteger(enquiryId) ||
            enquiryId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid enquiry ID.'

            });

        }


        // ==========================================
        // ALLOWED STATUSES
        // ==========================================

        const allowedStatuses = [
            'Pending',
            'Accepted',
            'Rejected'
        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid status. Allowed values are Pending, Accepted and Rejected.'

            });

        }


        // ==========================================
        // GET DATABASE CONNECTION
        // ==========================================

        connection =
            await pool.getConnection();


        // ==========================================
        // FIND CURRENT ENQUIRY
        // ==========================================

        const [existingEnquiries] =
            await connection.execute(
                `
                SELECT
                    enquiry_id,
                    status

                FROM enquiries

                WHERE enquiry_id = ?

                LIMIT 1
                `,
                [enquiryId]
            );


        // ==========================================
        // ENQUIRY NOT FOUND
        // ==========================================

        if (
            existingEnquiries.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Enquiry not found.'

            });

        }


        const oldStatus =
            existingEnquiries[0].status;


        // ==========================================
        // NO CHANGE
        // ==========================================

        if (oldStatus === status) {

            return res.status(200).json({

                success: true,

                message:
                    `Enquiry is already ${status}.`,

                enquiry_id:
                    enquiryId,

                old_status:
                    oldStatus,

                new_status:
                    status

            });

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        const [updateResult] =
            await connection.execute(
                `
                UPDATE enquiries

                SET
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP

                WHERE enquiry_id = ?
                `,
                [
                    status,
                    enquiryId
                ]
            );


        // ==========================================
        // VERIFY UPDATE
        // ==========================================

        if (
            updateResult.affectedRows === 0
        ) {

            return res.status(500).json({

                success: false,

                message:
                    'Enquiry status could not be updated.'

            });

        }

        // ==========================================
        // CUSTOMER STATUS NOTIFICATION
        // ==========================================

        try {

            const [
                customerEnquiries
            ] = await connection.execute(
                `
                SELECT

                    e.enquiry_id,
                    e.event_type,
                    e.event_date,
                    e.guest_count,
                    e.budget,
                    e.event_location,
                    e.message,

                    c.customer_id,
                    c.full_name,
                    c.phone,
                    c.email

                FROM enquiries e

                INNER JOIN customers c
                    ON e.customer_id =
                    c.customer_id

                WHERE e.enquiry_id = ?

                LIMIT 1
                `,
                [
                    enquiryId
                ]
            );


            if (
                customerEnquiries.length > 0
            ) {

                const enquiry =
                    customerEnquiries[0];


                let notificationType =
                    null;

                let notificationMessage =
                    null;


                // ======================================
                // ACCEPTED
                // ======================================

                if (
                    status === 'Accepted'
                ) {

                    notificationType =
                        'ENQUIRY_ACCEPTED';


                    notificationMessage =
                        enquiryAcceptedMessage(
                            enquiry
                        );

                }


                // ======================================
                // REJECTED
                // ======================================

                else if (
                    status === 'Rejected'
                ) {

                    notificationType =
                        'ENQUIRY_REJECTED';


                    notificationMessage =
                        enquiryRejectedMessage(
                            enquiry
                        );

                }


                if (
                    notificationType &&
                    notificationMessage
                ) {

                    await sendCustomerNotification({

                        customerId:
                            enquiry.customer_id,

                        enquiryId:
                            enquiry.enquiry_id,

                        notificationType,

                        recipient:
                            enquiry.phone,

                        message:
                            notificationMessage

                    });

                }

            }

        } catch (notificationError) {

            console.error(
                'Enquiry status notification error:',
                notificationError
            );

        }

        // ==========================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ==========================================

        syncEnquiryData();

        syncNotificationData();

        syncDashboardData();

        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                'Enquiry status updated successfully.',

            enquiry_id:
                enquiryId,

            old_status:
                oldStatus,

            new_status:
                status

        });


    } catch (error) {

        console.error(
            'Update enquiry status error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to update enquiry status right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createEnquiry,
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus
};
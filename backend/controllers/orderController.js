const { pool } = require('../config/db');

const {
    sendCustomerNotification
} = require('../services/notificationService');

const {
    orderConfirmedMessage,
    orderUpcomingMessage,
    orderCancelledMessage,
    orderCompletedMessage,
    bookingDetailsConfirmedMessage,
    bookingNumberGeneratedMessage,
    agreementSignedMessage,
    paymentReceivedMessage
} = require('../services/notificationTemplates');

const {
    syncEnquiryData,
    syncOrderData,
    syncOrderStatusData,
    syncNotificationData,
    syncBookingAgreementData,
    syncUpcomingEventData,
    syncDashboardData,
    syncPaymentData
} = require('../services/businessDataSyncService');


// ==========================================
// CREATE ORDER FROM ACCEPTED ENQUIRY
// ==========================================

const createOrderFromEnquiry = async (req, res) => {

    let connection;

    try {

        const enquiryId =
            Number(req.params.enquiryId);


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
        // GET DATABASE CONNECTION
        // ==========================================

        connection =
            await pool.getConnection();


        // ==========================================
        // START TRANSACTION
        // ==========================================

        await connection.beginTransaction();


        // ==========================================
        // GET ENQUIRY
        // ==========================================

        const [enquiries] =
            await connection.execute(
                `
                SELECT
                    e.enquiry_id,
                    e.customer_id,
                    e.event_type,
                    e.event_date,
                    e.guest_count,
                    e.budget,
                    e.event_location,
                    e.message,
                    e.status,

                    c.full_name,
                    c.phone,
                    c.email

                FROM enquiries e

                INNER JOIN customers c
                    ON e.customer_id = c.customer_id

                WHERE e.enquiry_id = ?

                LIMIT 1

                FOR UPDATE
                `,
                [enquiryId]
            );


        // ==========================================
        // ENQUIRY NOT FOUND
        // ==========================================

        if (enquiries.length === 0) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    'Enquiry not found.'

            });

        }


        const enquiry =
            enquiries[0];


        // ==========================================
        // CHECK ENQUIRY STATUS
        // ==========================================

        if (
            enquiry.status !== 'Accepted'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    `Only Accepted enquiries can be converted into orders. Current status: ${enquiry.status}.`

            });

        }


        // ==========================================
        // CHECK FOR EXISTING ORDER
        // ==========================================

        const [existingOrders] =
            await connection.execute(
                `
                SELECT
                    order_id,
                    status

                FROM orders

                WHERE enquiry_id = ?

                LIMIT 1
                `,
                [enquiryId]
            );


        if (
            existingOrders.length > 0
        ) {

            await connection.rollback();

            return res.status(409).json({

                success: false,

                message:
                    'An order already exists for this enquiry.',

                order_id:
                    existingOrders[0].order_id,

                status:
                    existingOrders[0].status

            });

        }


        // ==========================================
        // CREATE ORDER
        // ==========================================

        const [orderResult] =
            await connection.execute(
                `
                INSERT INTO orders
                (
                    enquiry_id,
                    customer_id,
                    event_type,
                    event_date,
                    guest_count,
                    budget,
                    event_location,
                    message,
                    status
                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    enquiry.enquiry_id,
                    enquiry.customer_id,
                    enquiry.event_type,
                    enquiry.event_date,
                    enquiry.guest_count || null,
                    enquiry.budget || null,
                    enquiry.event_location || null,
                    enquiry.message || null,
                    'Confirmed'
                ]
            );


        const orderId =
            orderResult.insertId;


        // ==========================================
        // CREATE INITIAL ORDER STATUS HISTORY
        // ==========================================

        await connection.execute(
            `
            INSERT INTO order_status_history
            (
                order_id,
                old_status,
                new_status,
                changed_by,
                notes
            )

            VALUES (?, ?, ?, ?, ?)
            `,
            [
                orderId,
                null,
                'Confirmed',
                req.admin.admin_id,
                'Order created from accepted enquiry.'
            ]
        );


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await connection.commit();


        // ==========================================
        // CUSTOMER ORDER CONFIRMED NOTIFICATION
        // ==========================================

        try {

            await sendCustomerNotification({

                customerId:
                    enquiry.customer_id,

                enquiryId:
                    enquiry.enquiry_id,

                orderId:
                    orderId,

                notificationType:
                    'ORDER_CONFIRMED',

                recipient:
                    enquiry.phone,

                message:
                    orderConfirmedMessage({

                        booking_number:
                            null,

                        event_type:
                            enquiry.event_type,

                        event_date:
                            enquiry.event_date,

                        event_location:
                            enquiry.event_location,

                        total_amount:
                            null

                    })

            });

        } catch (notificationError) {

            console.error(
                'Order confirmed notification error:',
                notificationError
            );

        }


        // ==========================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ==========================================

        syncEnquiryData();

        syncOrderData();

        syncOrderStatusData();

        syncNotificationData();

        syncDashboardData();


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                'Order created successfully.',

            order_id:
                orderId,

            enquiry_id:
                enquiry.enquiry_id,

            customer_id:
                enquiry.customer_id,

            status:
                'Confirmed'

        });


    } catch (error) {

        // ==========================================
        // ROLLBACK
        // ==========================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    'Order rollback error:',
                    rollbackError
                );

            }

        }


        console.error(
            'Create order error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to create the order right now.'

        });

    } finally {

        // ==========================================
        // RELEASE CONNECTION
        // ==========================================

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// GET ALL ORDERS
// ==========================================

const getAllOrders = async (req, res) => {

    try {

        const [orders] =
            await pool.execute(
                `
                SELECT
                    o.order_id,
                    o.enquiry_id,
                    o.customer_id,

                    c.full_name,
                    c.phone,
                    c.email,

                    o.event_type,
                    o.event_date,
                    o.guest_count,
                    o.budget,
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
                    ON o.customer_id = c.customer_id

                ORDER BY
                    o.created_at DESC
                `
            );


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            orders:
                orders

        });


    } catch (error) {

        console.error(
            'Get all orders error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve orders right now.'

        });

    }

};


// ==========================================
// GET SINGLE ORDER BY ID
// ==========================================

const getOrderById = async (req, res) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ==========================================
        // GET DATABASE CONNECTION
        // ==========================================

        connection =
            await pool.getConnection();


        // ==========================================
        // GET ORDER DETAILS
        // ==========================================

        const [orders] =
            await connection.execute(
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
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1
                `,
                [orderId]
            );


        // ==========================================
        // ORDER NOT FOUND
        // ==========================================

        if (orders.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const order =
            orders[0];


        // ==========================================
        // GET ORDER PAYMENTS
        // ==========================================

        const [payments] =
            await connection.execute(
                `
                SELECT
                    p.payment_id,
                    p.order_id,
                    p.amount,
                    p.payment_type,
                    p.payment_method,
                    p.payment_date,
                    p.notes,
                    p.created_by,
                    p.created_at,
                    p.updated_at,

                    a.full_name AS created_by_name

                FROM payments p

                LEFT JOIN admin_users a
                    ON p.created_by = a.admin_id

                WHERE p.order_id = ?

                ORDER BY
                    p.payment_date ASC,
                    p.payment_id ASC
                `,
                [orderId]
            );


        // ==========================================
        // CALCULATE PAYMENT SUMMARY
        // ==========================================

        const totalAmount =
            order.total_amount === null
                ? null
                : Number(
                    order.total_amount
                );


        const totalPaid =
            payments.reduce(
                (
                    total,
                    payment
                ) => {

                    return (
                        total +
                        Number(
                            payment.amount
                        )
                    );

                },
                0
            );


        const balance =
            totalAmount === null
                ? null
                : Math.max(
                    totalAmount -
                    totalPaid,
                    0
                );


        // ==========================================
        // GET ORDER STATUS HISTORY
        // ==========================================

        const [history] =
            await connection.execute(
                `
                SELECT
                    h.history_id,
                    h.order_id,
                    h.old_status,
                    h.new_status,
                    h.changed_by,
                    h.notes,
                    h.changed_at,

                    a.full_name AS changed_by_name

                FROM order_status_history h

                LEFT JOIN admin_users a
                    ON h.changed_by = a.admin_id

                WHERE h.order_id = ?

                ORDER BY
                    h.changed_at ASC,
                    h.history_id ASC
                `,
                [orderId]
            );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            order:
                order,

            payment_summary: {

                total_amount:
                    totalAmount,

                total_paid:
                    totalPaid,

                balance:
                    balance

            },

            payments:
                payments,

            status_history:
                history

        });


    } catch (error) {

        console.error(
            'Get order by ID error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve the order right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (req, res) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);

        const {
            status,
            notes
        } = req.body;


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ==========================================
        // ALLOWED ORDER STATUSES
        // ==========================================

        const allowedStatuses = [
            'Confirmed',
            'Upcoming',
            'Completed',
            'Cancelled'
        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid status. Allowed values are Confirmed, Upcoming, Completed and Cancelled.'

            });

        }


        // ==========================================
        // VALIDATE NOTES
        // ==========================================

        if (
            notes !== undefined &&
            notes !== null &&
            typeof notes !== 'string'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Notes must be a text value.'

            });

        }


        // ==========================================
        // GET DATABASE CONNECTION
        // ==========================================

        connection =
            await pool.getConnection();


        // ==========================================
        // START TRANSACTION
        // ==========================================

        await connection.beginTransaction();


        // ==========================================
        // GET CURRENT ORDER
        // ==========================================

        const [orders] =
            await connection.execute(
                `
                SELECT
                    order_id,
                    status

                FROM orders

                WHERE order_id = ?

                LIMIT 1

                FOR UPDATE
                `,
                [orderId]
            );


        // ==========================================
        // ORDER NOT FOUND
        // ==========================================

        if (orders.length === 0) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const oldStatus =
            orders[0].status;


        // ==========================================
        // ORDER STATUS TRANSITION RULES
        // ==========================================

        const allowedTransitions = {

            Confirmed: [
                'Upcoming',
                'Cancelled'
            ],

            Upcoming: [
                'Completed',
                'Cancelled'
            ],

            Completed: [],

            Cancelled: []

        };


        // ==========================================
        // CHECK STATUS TRANSITION
        // ==========================================

        if (
            oldStatus !== status &&
            !allowedTransitions[oldStatus].includes(status)
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    `Invalid status transition: ${oldStatus} → ${status}.`

            });

        }


        // ==========================================
        // NO CHANGE
        // ==========================================

        if (
            oldStatus === status
        ) {

            await connection.rollback();

            return res.status(200).json({

                success: true,

                message:
                    `Order is already ${status}.`,

                order_id:
                    orderId,

                old_status:
                    oldStatus,

                new_status:
                    status

            });

        }


        // ==========================================
        // UPDATE ORDER
        // ==========================================

        if (
            status === 'Completed'
        ) {

            await connection.execute(
                `
                UPDATE orders

                SET
                    status = ?,
                    completed_at = CURRENT_TIMESTAMP

                WHERE order_id = ?
                `,
                [
                    status,
                    orderId
                ]
            );

        } else {

            await connection.execute(
                `
                UPDATE orders

                SET
                    status = ?

                WHERE order_id = ?
                `,
                [
                    status,
                    orderId
                ]
            );

        }


        // ==========================================
        // CREATE STATUS HISTORY
        // ==========================================

        await connection.execute(
            `
            INSERT INTO order_status_history
            (
                order_id,
                old_status,
                new_status,
                changed_by,
                notes
            )

            VALUES (?, ?, ?, ?, ?)
            `,
            [
                orderId,
                oldStatus,
                status,
                req.admin.admin_id,
                notes || null
            ]
        );


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await connection.commit();


        // ==========================================
        // CUSTOMER ORDER STATUS NOTIFICATION
        // ==========================================

        try {

            const [
                customerOrders
            ] = await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.booking_number,
                    o.enquiry_id,
                    o.customer_id,
                    o.event_type,
                    o.event_date,
                    o.event_location,
                    o.total_amount,

                    c.full_name,
                    c.phone,
                    c.email

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id =
                    c.customer_id

                WHERE o.order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


            if (
                customerOrders.length > 0
            ) {

                const order =
                    customerOrders[0];


                let notificationType =
                    null;

                let notificationMessage =
                    null;


                // ======================================
                // UPCOMING
                // ======================================

                if (
                    status === 'Upcoming'
                ) {

                    notificationType =
                        'ORDER_UPCOMING';


                    notificationMessage =
                        orderUpcomingMessage(
                            order
                        );

                }


                // ======================================
                // CANCELLED
                // ======================================

                else if (
                    status === 'Cancelled'
                ) {

                    notificationType =
                        'ORDER_CANCELLED';


                    notificationMessage =
                        orderCancelledMessage(
                            order
                        );

                }


                // ======================================
                // COMPLETED
                // ======================================

                else if (
                    status === 'Completed'
                ) {

                    notificationType =
                        'ORDER_COMPLETED';


                    notificationMessage =
                        orderCompletedMessage(
                            order
                        );

                }


                if (
                    notificationType &&
                    notificationMessage
                ) {

                    await sendCustomerNotification({

                        customerId:
                            order.customer_id,

                        enquiryId:
                            order.enquiry_id,

                        orderId:
                            order.order_id,

                        notificationType,

                        recipient:
                            order.phone,

                        message:
                            notificationMessage

                    });

                }

            }

        } catch (notificationError) {

            console.error(
                'Order status notification error:',
                notificationError
            );

        }


        // ==========================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ==========================================

        syncOrderData();

        syncOrderStatusData();

        syncUpcomingEventData();

        syncNotificationData();

        syncDashboardData();


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                'Order status updated successfully.',

            order_id:
                orderId,

            old_status:
                oldStatus,

            new_status:
                status

        });


    } catch (error) {

        // ==========================================
        // ROLLBACK
        // ==========================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    'Order status rollback error:',
                    rollbackError
                );

            }

        }


        console.error(
            'Update order status error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to update order status right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// UPDATE ORDER BOOKING DETAILS
// ADMIN ONLY
// ==========================================

const updateOrderBooking = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        const {
            booking_number,
            total_amount
        } = req.body;


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ======================================
        // VALIDATE BOOKING NUMBER
        // ======================================

        if (
            booking_number !== undefined &&
            booking_number !== null &&
            typeof booking_number !== 'string'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Booking number must be a text value.'

            });

        }


        // ======================================
        // VALIDATE TOTAL AMOUNT
        // ======================================

        if (
            total_amount !== undefined &&
            total_amount !== null
        ) {

            const amount =
                Number(total_amount);


            if (
                !Number.isFinite(amount) ||
                amount < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Total amount must be a valid non-negative number.'

                });

            }

        }


        // ======================================
        // DATABASE CONNECTION
        // ======================================

        connection =
            await pool.getConnection();


        // ======================================
        // CHECK ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT
                    order_id,
                    booking_number,
                    total_amount,
                    payment_status

                FROM orders

                WHERE order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        // ======================================
        // BUILD UPDATE
        // ======================================

        const fields = [];

        const values = [];


        if (
            booking_number !== undefined
        ) {

            fields.push(
                'booking_number = ?'
            );

            values.push(
                booking_number === ''
                    ? null
                    : booking_number.trim()
            );

        }


        if (
            total_amount !== undefined
        ) {

            fields.push(
                'total_amount = ?'
            );

            values.push(
                total_amount === null ||
                total_amount === ''
                    ? null
                    : Number(total_amount)
            );

        }


        // ======================================
        // NOTHING TO UPDATE
        // ======================================

        if (
            fields.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'No booking details were provided.'

            });

        }


        // ======================================
        // UPDATE ORDER
        // ======================================

        values.push(
            orderId
        );


        await connection.execute(
            `
            UPDATE orders

            SET
                ${fields.join(', ')}

            WHERE order_id = ?
            `,
            values
        );


        // ======================================
        // GET UPDATED ORDER
        // ======================================

        const [updatedOrders] =
            await connection.execute(
                `
                SELECT
                    order_id,
                    booking_number,
                    total_amount,
                    payment_status

                FROM orders

                WHERE order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        // ======================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ======================================

        syncOrderData();

        syncBookingAgreementData();

        syncDashboardData();


        return res.status(200).json({

            success: true,

            message:
                'Booking details updated successfully.',

            booking:
                updatedOrders[0]

        });


    } catch (error) {

        // ======================================
        // DUPLICATE BOOKING NUMBER
        // ======================================

        if (
            error.code ===
            'ER_DUP_ENTRY'
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'This booking number is already in use.'

            });

        }


        console.error(
            'Update booking details error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to update booking details right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// CONFIRM BOOKING DETAILS
// ADMIN ONLY
// ==========================================

const confirmBookingDetails = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ======================================
        // DATABASE CONNECTION
        // ======================================

        connection =
            await pool.getConnection();


        // ======================================
        // GET ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.booking_number,
                    o.customer_id,

                    c.phone,
                    c.full_name,
                    c.email,

                    o.event_type,
                    o.event_date,
                    o.guest_count,
                    o.event_location,
                    o.total_amount,
                    o.booking_details_status

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1

                FOR UPDATE
                `,
                [
                    orderId
                ]
            );


        // ======================================
        // ORDER NOT FOUND
        // ======================================

        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const order =
            orders[0];


        // ======================================
        // ALREADY CONFIRMED
        // ======================================

        if (
            order.booking_details_status ===
            'Confirmed'
        ) {

            return res.status(200).json({

                success: true,

                message:
                    'Booking details are already confirmed.',

                order_id:
                    orderId,

                booking_details_status:
                    'Confirmed'

            });

        }


        // ======================================
        // REQUIRED BOOKING DETAILS
        // ======================================

        const missingFields = [];


        if (
            !order.event_type ||
            !order.event_type.trim()
        ) {

            missingFields.push(
                'Event Type'
            );

        }


        if (
            !order.event_date
        ) {

            missingFields.push(
                'Event Date'
            );

        }


        if (
            !order.guest_count ||
            !order.guest_count.trim()
        ) {

            missingFields.push(
                'Guest Count'
            );

        }


        if (
            !order.event_location ||
            !order.event_location.trim()
        ) {

            missingFields.push(
                'Event Location'
            );

        }


        if (
            order.total_amount === null ||
            order.total_amount === undefined ||
            Number(order.total_amount) <= 0
        ) {

            missingFields.push(
                'Total Amount'
            );

        }


        // ======================================
        // MISSING DETAILS
        // ======================================

        if (
            missingFields.length > 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Complete all required booking details before confirming.',

                missing_fields:
                    missingFields

            });

        }


        // ======================================
        // CONFIRM BOOKING DETAILS
        // ======================================

        await connection.execute(
            `
            UPDATE orders

            SET
                booking_details_status = 'Confirmed'

            WHERE order_id = ?
            `,
            [
                orderId
            ]
        );


        // ======================================
        // GET UPDATED ORDER
        // ======================================

        const [updatedOrders] =
            await connection.execute(
                `
                SELECT

                    order_id,
                    booking_number,
                    total_amount,
                    booking_details_status,
                    agreement_status,
                    payment_status

                FROM orders

                WHERE order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        // ==========================================
        // CUSTOMER BOOKING DETAILS CONFIRMED
        // NOTIFICATION
        // ==========================================

        try {

            const confirmedOrder =
                updatedOrders[0];


            await sendCustomerNotification({

                customerId:
                    order.customer_id,

                orderId:
                    order.order_id,

                notificationType:
                    'BOOKING_DETAILS_CONFIRMED',

                recipient:
                    order.phone,

                message:
                    bookingDetailsConfirmedMessage({

                        booking_number:
                            confirmedOrder.booking_number,

                        event_type:
                            order.event_type,

                        event_date:
                            order.event_date,

                        guest_count:
                            order.guest_count,

                        event_location:
                            order.event_location,

                        total_amount:
                            confirmedOrder.total_amount

                    })

            });

        } catch (notificationError) {

            console.error(
                'Booking details confirmation notification error:',
                notificationError
            );

        }


        // ======================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ======================================

        syncOrderData();

        syncBookingAgreementData();

        syncNotificationData();

        syncDashboardData();


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                'Booking details confirmed successfully.',

            order:
                updatedOrders[0]

        });


    } catch (error) {

        console.error(
            'Confirm booking details error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to confirm booking details right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// GENERATE OFFICIAL BOOKING NUMBER
// ADMIN ONLY
// ==========================================

const generateBookingNumber = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        connection =
            await pool.getConnection();


        // ======================================
        // START TRANSACTION
        // ======================================

        await connection.beginTransaction();


        // ======================================
        // GET + LOCK ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.booking_number,
                    o.booking_details_status,
                    o.agreement_status,

                    o.customer_id,
                    o.event_type,
                    o.event_date,

                    c.phone,
                    c.full_name,
                    c.email

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1

                FOR UPDATE
                `,
                [
                    orderId
                ]
            );


        // ======================================
        // ORDER NOT FOUND
        // ======================================

        if (
            orders.length === 0
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const order =
            orders[0];


        // ======================================
        // BOOKING DETAILS MUST BE CONFIRMED
        // ======================================

        if (
            order.booking_details_status !==
            'Confirmed'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'Booking details must be confirmed before generating the official booking number.'

            });

        }


        // ======================================
        // AGREEMENT MUST BE SIGNED
        // ======================================

        if (
            order.agreement_status !==
            'Signed'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'The booking agreement must be signed before generating the official booking number.'

            });

        }


        // ======================================
        // BOOKING NUMBER ALREADY EXISTS
        // ======================================

        if (
            order.booking_number
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'An official booking number has already been assigned to this order.',

                booking_number:
                    order.booking_number

            });

        }


        // ======================================
        // LOCK SEQUENCE ROW
        // ======================================

        const [sequenceRows] =
            await connection.execute(
                `
                SELECT

                    id,
                    last_number

                FROM booking_number_sequence

                WHERE id = 1

                LIMIT 1

                FOR UPDATE
                `
            );


        // ======================================
        // SEQUENCE ROW NOT FOUND
        // ======================================

        if (
            sequenceRows.length === 0
        ) {

            await connection.rollback();

            return res.status(500).json({

                success: false,

                message:
                    'Booking number sequence is not configured.'

            });

        }


        const currentNumber =
            Number(
                sequenceRows[0].last_number
            );


        const nextNumber =
            currentNumber + 1;


        // ======================================
        // GENERATE OFFICIAL NUMBER
        // ======================================

        const bookingNumber =
            `SCE-2026-${String(
                nextNumber
            ).padStart(
                3,
                '0'
            )}`;


        // ======================================
        // UPDATE SEQUENCE
        // ======================================

        await connection.execute(
            `
            UPDATE booking_number_sequence

            SET
                last_number = ?

            WHERE id = 1
            `,
            [
                nextNumber
            ]
        );


        // ======================================
        // SAVE BOOKING NUMBER
        // ======================================

        await connection.execute(
            `
            UPDATE orders

            SET
                booking_number = ?

            WHERE order_id = ?
            `,
            [
                bookingNumber,
                orderId
            ]
        );


        // ======================================
        // COMMIT TRANSACTION
        // ======================================

        await connection.commit();


        // ==========================================
        // CUSTOMER BOOKING NUMBER GENERATED
        // NOTIFICATION
        // ==========================================

        try {

            await sendCustomerNotification({

                customerId:
                    order.customer_id,

                orderId:
                    order.order_id,

                notificationType:
                    'BOOKING_NUMBER_GENERATED',

                recipient:
                    order.phone,

                message:
                    bookingNumberGeneratedMessage({

                        booking_number:
                            bookingNumber,

                        event_type:
                            order.event_type,

                        event_date:
                            order.event_date

                    })

            });

        } catch (notificationError) {

            console.error(
                'Booking number notification error:',
                notificationError
            );

        }


        // ======================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ======================================

        syncOrderData();

        syncBookingAgreementData();

        syncUpcomingEventData();

        syncNotificationData();

        syncDashboardData();


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                'Official booking number generated successfully.',

            order_id:
                orderId,

            booking_number:
                bookingNumber

        });


    } catch (error) {

        // ======================================
        // ROLLBACK
        // ======================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    'Booking number rollback error:',
                    rollbackError
                );

            }

        }


        console.error(
            'Generate booking number error:',
            error
        );


        // ======================================
        // DUPLICATE BOOKING NUMBER
        // ======================================

        if (
            error.code ===
            'ER_DUP_ENTRY'
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'Unable to generate a unique booking number. Please try again.'

            });

        }


        return res.status(500).json({

            success: false,

            message:
                'Unable to generate the official booking number right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// UPDATE BOOKING AGREEMENT
// ADMIN ONLY
// ==========================================

const updateOrderAgreement = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        const {
            agreement_status,
            agreement_date,
            agreement_notes
        } = req.body;


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ======================================
        // VALIDATE AGREEMENT STATUS
        // ======================================

        if (
            agreement_status !== 'Pending' &&
            agreement_status !== 'Signed'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Agreement status must be Pending or Signed.'

            });

        }


        // ======================================
        // VALIDATE AGREEMENT DATE
        // ======================================

        if (
            agreement_date !== undefined &&
            agreement_date !== null &&
            agreement_date !== ''
        ) {

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(
                    agreement_date
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Agreement date must be in YYYY-MM-DD format.'

                });

            }

        }


        // ======================================
        // SIGNED AGREEMENT REQUIRES DATE
        // ======================================

        if (
            agreement_status === 'Signed' &&
            (
                agreement_date === undefined ||
                agreement_date === null ||
                agreement_date === ''
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Agreement date is required when the agreement is signed.'

            });

        }


        // ======================================
        // DATABASE CONNECTION
        // ======================================

        connection =
            await pool.getConnection();


        // ======================================
        // CHECK ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.customer_id,

                    c.phone,
                    c.full_name,
                    c.email,

                    o.booking_number,
                    o.event_type,
                    o.event_date,

                    o.agreement_status,
                    o.agreement_date,
                    o.agreement_notes,
                    o.booking_details_status

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        // ======================================
        // ORDER NOT FOUND
        // ======================================

        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const oldAgreementStatus =
            orders[0].agreement_status;


        // ======================================
        // BOOKING DETAILS MUST BE CONFIRMED
        // ======================================

        if (
            orders[0].booking_details_status !==
            'Confirmed'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Booking details must be confirmed before signing the agreement.'

            });

        }


        // ======================================
        // PREVENT SIGNED → PENDING
        // ======================================

        if (
            oldAgreementStatus === 'Signed' &&
            agreement_status === 'Pending'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'A signed agreement cannot be changed back to Pending.'

            });

        }


        // ======================================
        // PREVENT CHANGES TO SIGNED AGREEMENT
        // ======================================

        if (
            oldAgreementStatus === 'Signed'
        ) {

            if (
                agreement_date !==
                undefined &&
                agreement_date !==
                orders[0].agreement_date
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'The signed agreement date cannot be changed.'

                });

            }

        }


        // ======================================
        // BUILD UPDATE
        // ======================================

        let finalAgreementDate =
            agreement_date;


        let finalAgreementNotes =
            agreement_notes;


        if (
            agreement_status === 'Pending'
        ) {

            finalAgreementDate =
                null;

            finalAgreementNotes =
                agreement_notes ||
                null;

        }


        // ======================================
        // UPDATE AGREEMENT
        // ======================================

        await connection.execute(
            `
            UPDATE orders

            SET

                agreement_status = ?,

                agreement_date = ?,

                agreement_notes = ?

            WHERE order_id = ?
            `,
            [
                agreement_status,
                finalAgreementDate,
                finalAgreementNotes ||
                    null,
                orderId
            ]
        );


        // ======================================
        // GET UPDATED AGREEMENT
        // ======================================

        const [updatedOrders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.customer_id,

                    c.phone,
                    c.full_name,
                    c.email,

                    o.booking_number,
                    o.event_type,
                    o.event_date,

                    o.agreement_status,
                    o.agreement_date,
                    o.agreement_notes

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        // ==========================================
        // CUSTOMER AGREEMENT SIGNED
        // NOTIFICATION
        // ==========================================

        if (
            agreement_status === 'Signed' &&
            oldAgreementStatus !== 'Signed'
        ) {

            try {

                const updatedOrder =
                    updatedOrders[0];


                await sendCustomerNotification({

                    customerId:
                        updatedOrder.customer_id,

                    orderId:
                        updatedOrder.order_id,

                    notificationType:
                        'AGREEMENT_SIGNED',

                    recipient:
                        updatedOrder.phone,

                    message:
                        agreementSignedMessage({

                            booking_number:
                                updatedOrder.booking_number,

                            event_type:
                                updatedOrder.event_type,

                            event_date:
                                updatedOrder.event_date

                        })

                });

            } catch (notificationError) {

                console.error(
                    'Agreement signed notification error:',
                    notificationError
                );

            }

        }


        // ======================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ======================================

        syncOrderData();

        syncBookingAgreementData();

        syncNotificationData();

        syncDashboardData();


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                'Booking agreement updated successfully.',

            order_id:
                updatedOrders[0].order_id,

            agreement_status:
                updatedOrders[0].agreement_status,

            agreement_date:
                updatedOrders[0].agreement_date,

            agreement_notes:
                updatedOrders[0].agreement_notes

        });


    } catch (error) {

        console.error(
            'Update booking agreement error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to update the booking agreement right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// GET ORDER PAYMENTS
// ADMIN ONLY
// ==========================================

const getOrderPayments = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        connection =
            await pool.getConnection();


        // ======================================
        // CHECK ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT
                    order_id,
                    total_amount,
                    payment_status

                FROM orders

                WHERE order_id = ?

                LIMIT 1
                `,
                [
                    orderId
                ]
            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        // ======================================
        // GET PAYMENTS
        // ======================================

        const [payments] =
            await connection.execute(
                `
                SELECT
                    p.payment_id,
                    p.order_id,
                    p.amount,
                    p.payment_type,
                    p.payment_method,
                    p.payment_date,
                    p.notes,
                    p.created_by,
                    p.created_at,
                    p.updated_at,

                    a.full_name AS created_by_name

                FROM payments p

                LEFT JOIN admin_users a
                    ON p.created_by = a.admin_id

                WHERE p.order_id = ?

                ORDER BY
                    p.payment_date ASC,
                    p.payment_id ASC
                `,
                [
                    orderId
                ]
            );


        // ======================================
        // CALCULATE TOTAL PAID
        // ======================================

        const totalPaid =
            payments.reduce(
                (
                    total,
                    payment
                ) => {

                    return (
                        total +
                        Number(
                            payment.amount
                        )
                    );

                },
                0
            );


        const totalAmount =
            orders[0].total_amount === null
                ? null
                : Number(
                    orders[0].total_amount
                );


        const balance =
            totalAmount === null
                ? null
                : Math.max(
                    totalAmount -
                    totalPaid,
                    0
                );


        return res.status(200).json({

            success: true,

            order: {

                order_id:
                    orders[0].order_id,

                total_amount:
                    totalAmount,

                payment_status:
                    orders[0].payment_status

            },

            summary: {

                total_amount:
                    totalAmount,

                total_paid:
                    totalPaid,

                balance:
                    balance

            },

            payments:
                payments

        });


    } catch (error) {

        console.error(
            'Get order payments error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve order payments right now.'

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// ADD ORDER PAYMENT
// ADMIN ONLY
// ==========================================

const addOrderPayment = async (
    req,
    res
) => {

    let connection;

    try {

        const orderId =
            Number(req.params.id);


        const {
            amount,
            payment_type,
            payment_method,
            payment_date,
            notes
        } = req.body;


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid order ID.'

            });

        }


        // ======================================
        // VALIDATE AMOUNT
        // ======================================

        const paymentAmount =
            Number(amount);


        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Payment amount must be greater than zero.'

            });

        }


        // ======================================
        // VALIDATE PAYMENT TYPE
        // ======================================

        const allowedPaymentTypes = [

            'Advance',
            'Partial',
            'Final'

        ];


        if (
            !allowedPaymentTypes.includes(
                payment_type
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid payment type.'

            });

        }


        // ======================================
        // VALIDATE PAYMENT METHOD
        // ======================================

        const allowedPaymentMethods = [

            'Cash',
            'UPI',
            'Bank Transfer',
            'Card',
            'Other'

        ];


        if (
            !allowedPaymentMethods.includes(
                payment_method
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid payment method.'

            });

        }


        // ======================================
        // VALIDATE PAYMENT DATE
        // ======================================

        if (
            !payment_date ||
            typeof payment_date !== 'string'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Payment date is required.'

            });

        }


        // ======================================
        // VALIDATE NOTES
        // ==========================================

        if (
            notes !== undefined &&
            notes !== null &&
            typeof notes !== 'string'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Notes must be a text value.'

            });

        }


        // ======================================
        // DATABASE CONNECTION
        // ======================================

        connection =
            await pool.getConnection();


        // ======================================
        // START TRANSACTION
        // ======================================

        await connection.beginTransaction();


        // ======================================
        // GET ORDER
        // ======================================

        const [orders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.booking_number,
                    o.customer_id,

                    c.phone,
                    c.full_name,
                    c.email,

                    o.event_type,
                    o.event_date,

                    o.total_amount,
                    o.payment_status,
                    o.booking_details_status,
                    o.agreement_status

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                WHERE o.order_id = ?

                LIMIT 1

                FOR UPDATE
                `,
                [
                    orderId
                ]
            );


        if (
            orders.length === 0
        ) {

            await connection.rollback();


            return res.status(404).json({

                success: false,

                message:
                    'Order not found.'

            });

        }


        const order =
            orders[0];


        // ======================================
        // BOOKING DETAILS MUST BE CONFIRMED
        // ======================================

        if (
            order.booking_details_status !==
            'Confirmed'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'Booking details must be confirmed before recording a payment.'

            });

        }


        // ======================================
        // AGREEMENT MUST BE SIGNED
        // ======================================

        if (
            order.agreement_status !==
            'Signed'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'The booking agreement must be signed before recording a payment.'

            });

        }


        // ======================================
        // OFFICIAL BOOKING NUMBER REQUIRED
        // ======================================

        if (
            !order.booking_number ||
            !order.booking_number.trim()
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'The official booking number must be generated before recording a payment.'

            });

        }


        // ======================================
        // TOTAL AMOUNT REQUIRED
        // ======================================

        if (
            order.total_amount === null
        ) {

            await connection.rollback();


            return res.status(400).json({

                success: false,

                message:
                    'Please set the total booking amount before recording a payment.'

            });

        }


        const totalAmount =
            Number(
                order.total_amount
            );


        // ======================================
        // GET EXISTING PAYMENTS
        // ======================================

        const [existingPayments] =
            await connection.execute(
                `
                SELECT
                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total_paid

                FROM payments

                WHERE order_id = ?
                `,
                [
                    orderId
                ]
            );


        const totalPaid =
            Number(
                existingPayments[0].total_paid
            );


        const newTotalPaid =
            totalPaid +
            paymentAmount;


        // ======================================
        // PREVENT OVERPAYMENT
        // ======================================

        if (
            newTotalPaid >
            totalAmount
        ) {

            await connection.rollback();


            const balance =
                Math.max(
                    totalAmount -
                    totalPaid,
                    0
                );


            return res.status(400).json({

                success: false,

                message:
                    `Payment exceeds the remaining balance of ₹${balance.toFixed(2)}.`,

                total_amount:
                    totalAmount,

                total_paid:
                    totalPaid,

                balance:
                    balance

            });

        }


        // ======================================
        // INSERT PAYMENT
        // ======================================

        const [paymentResult] =
            await connection.execute(
                `
                INSERT INTO payments
                (
                    order_id,
                    amount,
                    payment_type,
                    payment_method,
                    payment_date,
                    notes,
                    created_by
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    orderId,
                    paymentAmount,
                    payment_type,
                    payment_method,
                    payment_date,
                    notes || null,
                    req.admin.admin_id
                ]
            );


        // ======================================
        // CALCULATE PAYMENT STATUS
        // ======================================

        let newPaymentStatus =
            'Unpaid';


        if (
            newTotalPaid >=
            totalAmount
        ) {

            newPaymentStatus =
                'Paid';

        } else if (
            newTotalPaid > 0
        ) {

            newPaymentStatus =
                'Partially Paid';

        }


        // ======================================
        // UPDATE ORDER PAYMENT STATUS
        // ======================================

        await connection.execute(
            `
            UPDATE orders

            SET
                payment_status = ?

            WHERE order_id = ?
            `,
            [
                newPaymentStatus,
                orderId
            ]
        );


        // ======================================
        // COMMIT
        // ======================================

        await connection.commit();


        // ==========================================
        // CUSTOMER PAYMENT RECEIVED NOTIFICATION
        // ==========================================

        try {

            await sendCustomerNotification({

                customerId:
                    order.customer_id,

                orderId:
                    order.order_id,

                notificationType:
                    'PAYMENT_RECEIVED',

                recipient:
                    order.phone,

                message:
                    paymentReceivedMessage({

                        booking_number:
                            order.booking_number,

                        event_type:
                            order.event_type,

                        payment_amount:
                            paymentAmount,

                        payment_type:
                            payment_type,

                        payment_method:
                            payment_method,

                        total_amount:
                            totalAmount,

                        total_paid:
                            newTotalPaid,

                        balance:
                            Math.max(
                                totalAmount -
                                newTotalPaid,
                                0
                            ),

                        payment_status:
                            newPaymentStatus

                    })

            });

        } catch (notificationError) {

            console.error(
                'Payment received notification error:',
                notificationError
            );

        }


        // ======================================
        // GOOGLE SHEETS AUTOMATIC SYNC
        // ======================================

        syncPaymentData();

        syncOrderData();

        syncNotificationData();

        syncDashboardData();


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        return res.status(201).json({

            success: true,

            message:
                'Payment added successfully.',

            payment_id:
                paymentResult.insertId,

            order_id:
                orderId,

            total_amount:
                totalAmount,

            total_paid:
                newTotalPaid,

            balance:
                Math.max(
                    totalAmount -
                    newTotalPaid,
                    0
                ),

            payment_status:
                newPaymentStatus

        });


    } catch (error) {

        // ======================================
        // ROLLBACK
        // ======================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    'Payment rollback error:',
                    rollbackError
                );

            }

        }


        console.error(
            'Add order payment error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to add the payment right now.'

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

};
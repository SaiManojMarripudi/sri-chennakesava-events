const { pool } = require('../config/db');


// ==========================================
// GET ALL CUSTOMERS
// ADMIN ONLY
// ==========================================

const getAllCustomers = async (req, res) => {

    try {

        const [customers] =
            await pool.execute(
                `
                SELECT

                    c.customer_id,
                    c.full_name,
                    c.phone,
                    c.email,
                    c.created_at,
                    c.updated_at,

                    COUNT(
                        DISTINCT o.order_id
                    ) AS total_orders,

                    COUNT(
                        DISTINCT CASE
                            WHEN o.status IN (
                                'Confirmed',
                                'Upcoming'
                            )
                            THEN o.order_id
                        END
                    ) AS upcoming_orders,

                    COUNT(
                        DISTINCT CASE
                            WHEN o.status = 'Completed'
                            THEN o.order_id
                        END
                    ) AS completed_orders

                FROM customers c

                LEFT JOIN orders o
                    ON c.customer_id = o.customer_id

                GROUP BY
                    c.customer_id,
                    c.full_name,
                    c.phone,
                    c.email,
                    c.created_at,
                    c.updated_at

                ORDER BY
                    c.created_at DESC
                `
            );


        return res.status(200).json({

            success: true,

            count:
                customers.length,

            customers:
                customers

        });


    } catch (error) {

        console.error(
            'Get all customers error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve customers right now.'

        });

    }

};


// ==========================================
// GET SINGLE CUSTOMER
// ADMIN ONLY
// ==========================================

const getCustomerById = async (req, res) => {

    let connection;

    try {

        const customerId =
            Number(req.params.id);


        // ==========================================
        // VALIDATE CUSTOMER ID
        // ==========================================

        if (
            !Number.isInteger(customerId) ||
            customerId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Invalid customer ID.'

            });

        }


        connection =
            await pool.getConnection();


        // ==========================================
        // GET CUSTOMER DETAILS
        // ==========================================

        const [customers] =
            await connection.execute(
                `
                SELECT

                    c.customer_id,
                    c.full_name,
                    c.phone,
                    c.email,
                    c.created_at,
                    c.updated_at

                FROM customers c

                WHERE c.customer_id = ?

                LIMIT 1
                `,
                [customerId]
            );


        // ==========================================
        // CUSTOMER NOT FOUND
        // ==========================================

        if (
            customers.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Customer not found.'

            });

        }


        const customer =
            customers[0];


        // ==========================================
        // GET CUSTOMER ORDERS
        // ==========================================

        const [orders] =
            await connection.execute(
                `
                SELECT

                    o.order_id,
                    o.booking_number,
                    o.event_type,
                    o.event_date,
                    o.guest_count,
                    o.budget,
                    o.total_amount,
                    o.payment_status,
                    o.booking_details_status,
                    o.agreement_status,
                    o.agreement_date,
                    o.event_location,
                    o.status,
                    o.accepted_at,
                    o.completed_at,
                    o.created_at,
                    o.updated_at

                FROM orders o

                WHERE o.customer_id = ?

                ORDER BY
                    o.event_date DESC,
                    o.order_id DESC
                `,
                [customerId]
            );


        // ==========================================
        // GET CUSTOMER PAYMENTS
        // ==========================================

        const [payments] =
            await connection.execute(
                `
                SELECT

                    p.payment_id,
                    p.order_id,
                    o.booking_number,
                    o.event_type,
                    o.status AS order_status,

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

                INNER JOIN orders o
                    ON p.order_id = o.order_id

                LEFT JOIN admin_users a
                    ON p.created_by = a.admin_id

                WHERE o.customer_id = ?

                ORDER BY
                    p.payment_date DESC,
                    p.payment_id DESC
                `,
                [customerId]
            );


        // ==========================================
        // CALCULATE CUSTOMER PAYMENT TOTAL
        // EXCLUDE CANCELLED ORDERS
        // ==========================================

        const totalPaid =
            payments.reduce(
                (
                    total,
                    payment
                ) => {

                    // Cancelled orders must not
                    // contribute to financial totals.

                    if (
                        payment.order_status ===
                        'Cancelled'
                    ) {

                        return total;

                    }


                    return (
                        total +
                        Number(
                            payment.amount
                        )
                    );

                },
                0
            );

        
        // ==========================================
        // CALCULATE TOTAL BOOKING VALUE
        // EXCLUDE CANCELLED ORDERS
        // ==========================================

        const totalBookingValue =
            orders.reduce(
                (
                    total,
                    order
                ) => {

                    // Cancelled orders must not
                    // contribute to financial totals.

                    if (
                        order.status ===
                        'Cancelled'
                    ) {

                        return total;

                    }


                    if (
                        order.total_amount ===
                        null
                    ) {

                        return total;

                    }


                    return (
                        total +
                        Number(
                            order.total_amount
                        )
                    );

                },
                0
            );

        
        // ==========================================
        // CALCULATE OUTSTANDING BALANCE
        // ==========================================

        const outstandingBalance =
            Math.max(
                totalBookingValue -
                totalPaid,
                0
            );

            
        // ==========================================
        // CALCULATE CUSTOMER SUMMARY
        // ==========================================

        const summary = {

            total_orders:
                orders.length,

            upcoming_orders:
                orders.filter(
                    order =>
                        (
                            order.status ===
                            'Confirmed'
                        ) ||
                        (
                            order.status ===
                            'Upcoming'
                        )
                ).length,

            completed_orders:
                orders.filter(
                    order =>
                        order.status ===
                        'Completed'
                ).length,

            cancelled_orders:
                orders.filter(
                    order =>
                        order.status ===
                        'Cancelled'
                ).length,

            total_booking_value:
                totalBookingValue,

            total_paid:
                totalPaid,
            
            outstanding_balance:
                outstandingBalance
            

        };


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            customer:
                customer,

            summary:
                summary,

            orders:
                orders,

            payments:
                payments

        });


    } catch (error) {

        console.error(
            'Get customer by ID error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve customer details right now.'

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

    getAllCustomers,

    getCustomerById

};
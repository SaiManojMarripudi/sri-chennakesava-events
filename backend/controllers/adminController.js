const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('../config/db');


// ==========================================
// ADMIN LOGIN
// ==========================================

const loginAdmin = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    'Email and password are required.'

            });

        }


        // ==========================================
        // FIND ADMIN
        // ==========================================

        const [admins] =
            await pool.execute(
                `
                SELECT
                    admin_id,
                    full_name,
                    email,
                    password_hash,
                    is_active

                FROM admin_users

                WHERE email = ?

                LIMIT 1
                `,
                [email]
            );


        // ==========================================
        // ADMIN NOT FOUND
        // ==========================================

        if (admins.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password.'

            });

        }


        const admin =
            admins[0];


        // ==========================================
        // CHECK ACTIVE STATUS
        // ==========================================

        if (admin.is_active !== 1) {

            return res.status(403).json({

                success: false,

                message:
                    'This admin account is inactive.'

            });

        }


        // ==========================================
        // VERIFY PASSWORD
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password_hash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password.'

            });

        }


        // ==========================================
        // CHECK JWT SECRET
        // ==========================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is missing from .env'
            );


            return res.status(500).json({

                success: false,

                message:
                    'Authentication configuration is missing.'

            });

        }


        // ==========================================
        // CREATE JWT TOKEN
        // ==========================================

        const token =
            jwt.sign(

                {

                    admin_id:
                        admin.admin_id,

                    email:
                        admin.email,

                    full_name:
                        admin.full_name

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        '8h'

                }

            );


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                'Admin login successful.',

            token:
                token,

            admin: {

                admin_id:
                    admin.admin_id,

                full_name:
                    admin.full_name,

                email:
                    admin.email

            }

        });


    } catch (error) {

        console.error(
            'Admin login error:',
            error
        );


        // Temporary detailed error during setup
        return res.status(500).json({

            success: false,

            message:
                'Unable to login right now.'

        });

    }

};


// ==========================================
// ADMIN DASHBOARD SUMMARY
// ==========================================

const getDashboardSummary = async (req, res) => {

    try {

        // ==========================================
        // ENQUIRY COUNTS
        // ==========================================

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


        // ==========================================
        // ORDER COUNTS
        // ==========================================

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


        // ==========================================
        // CUSTOMER COUNT
        // ==========================================

        const [customerCounts] =
            await pool.execute(
                `
                SELECT

                    COUNT(*) AS total

                FROM customers
                `
            );


        // ==========================================
        // FINANCIAL SUMMARY
        //
        // CANCELLED ORDERS ARE EXCLUDED
        // ==========================================

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


        // ==========================================
        // EXTRACT RESULTS
        // ==========================================

        const enquiries =
            enquiryCounts[0];


        const orders =
            orderCounts[0];


        const customers =
            customerCounts[0];


        const financials =
            financialSummary[0];


        // ==========================================
        // CONVERT FINANCIAL VALUES TO NUMBERS
        // ==========================================

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


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,


            // ======================================
            // ENQUIRIES
            // ======================================

            enquiries: {

                total:
                    Number(
                        enquiries.total
                    ) || 0,

                pending:
                    Number(
                        enquiries.pending
                    ) || 0,

                accepted:
                    Number(
                        enquiries.accepted
                    ) || 0,

                rejected:
                    Number(
                        enquiries.rejected
                    ) || 0

            },


            // ======================================
            // ORDERS
            // ======================================

            orders: {

                total:
                    Number(
                        orders.total
                    ) || 0,

                confirmed:
                    Number(
                        orders.confirmed
                    ) || 0,

                upcoming:
                    Number(
                        orders.upcoming
                    ) || 0,

                completed:
                    Number(
                        orders.completed
                    ) || 0,

                cancelled:
                    Number(
                        orders.cancelled
                    ) || 0

            },


            // ======================================
            // CUSTOMERS
            // ======================================

            customers: {

                total:
                    Number(
                        customers.total
                    ) || 0

            },


            // ======================================
            // FINANCIAL SUMMARY
            // ======================================

            financials: {

                total_booking_value:
                    totalBookingValue,

                total_paid:
                    totalPaid,

                outstanding_balance:
                    outstandingBalance

            }

        });


    } catch (error) {

        console.error(
            'Get dashboard summary error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve dashboard summary right now.'

        });

    }

};


// ==========================================
// RECENT ENQUIRIES
// ==========================================

const getRecentEnquiries = async (req, res) => {

    try {

        const [enquiries] =
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
                    e.submitted_at DESC

                LIMIT 5
                `
            );


        return res.status(200).json({

            success: true,

            count:
                enquiries.length,

            enquiries:
                enquiries

        });


    } catch (error) {

        console.error(
            'Get recent enquiries error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve recent enquiries right now.'

        });

    }

};


// ==========================================
// RECENT ORDERS
// ==========================================

const getRecentOrders = async (req, res) => {

    try {

        const [orders] =
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
                    o.created_at DESC

                LIMIT 5
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
            'Get recent orders error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve recent orders right now.'

        });

    }

};


// ==========================================
// UPCOMING EVENTS
// ==========================================

const getUpcomingEvents = async (req, res) => {

    try {

        const [events] =
            await pool.execute(
                `
                SELECT

                    o.order_id,
                    o.enquiry_id,
                    o.customer_id,

                    c.full_name,
                    c.phone,
                    c.email,

                    o.booking_number,

                    o.event_type,
                    o.event_date,
                    o.guest_count,
                    o.budget,
                    o.total_amount,
                    o.payment_status,
                    o.event_location,

                    o.status,
                    o.created_at,
                    o.updated_at

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id =
                       c.customer_id

                WHERE

                    o.status IN (
                        'Confirmed',
                        'Upcoming'
                    )

                    AND o.event_date >= CURDATE()

                    AND o.booking_details_status = 'Confirmed'

                    AND o.agreement_status = 'Signed'

                    AND o.booking_number IS NOT NULL

                    AND TRIM(o.booking_number) <> ''

                ORDER BY
                    o.event_date ASC,
                    o.order_id ASC

                LIMIT 10
                `
            );


        return res.status(200).json({

            success: true,

            count:
                events.length,

            events:
                events

        });


    } catch (error) {

        console.error(
            'Get upcoming events error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve upcoming events right now.'

        });

    }

};


// ==========================================
// RECENT ACTIVITY
// ==========================================

const getRecentActivity = async (req, res) => {

    try {

        const [activity] =
            await pool.execute(
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
                    ON h.changed_by =
                       a.admin_id

                ORDER BY
                    h.changed_at DESC,
                    h.history_id DESC

                LIMIT 10
                `
            );


        return res.status(200).json({

            success: true,

            count:
                activity.length,

            activity:
                activity

        });


    } catch (error) {

        console.error(
            'Get recent activity error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve recent activity right now.'

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    loginAdmin,

    getDashboardSummary,

    getRecentEnquiries,

    getRecentOrders,

    getUpcomingEvents,

    getRecentActivity

};
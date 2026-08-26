// ==========================================
// ADMIN DASHBOARD
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// RENDER DASHBOARD
// ==========================================

export function renderDashboard() {

    return `

        <div
            class="admin-dashboard-page"
        >

            <main
                class="admin-dashboard-main"
            >

                <!-- ==================================
                     PAGE HEADING
                     ================================== -->

                <section
                    class="admin-page-heading"
                >

                    <div>

                        <h2>
                            Dashboard
                        </h2>


                        <p>
                            Overview of your event business.
                        </p>

                    </div>

                </section>


                <!-- ==================================
                     SUMMARY
                     ================================== -->

                <section
                    class="admin-summary-grid"
                    id="admin-summary"
                >

                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Total Enquiries
                        </span>


                        <strong
                            id="summary-total-enquiries"
                        >
                            —
                        </strong>

                    </div>


                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Pending Enquiries
                        </span>


                        <strong
                            id="summary-pending-enquiries"
                        >
                            —
                        </strong>

                    </div>


                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Accepted Enquiries
                        </span>


                        <strong
                            id="summary-accepted-enquiries"
                        >
                            —
                        </strong>

                    </div>

                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Rejected Enquiries
                        </span>


                        <strong
                            id="summary-rejected-enquiries"
                        >
                            —
                        </strong>

                    </div>

                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Total Orders
                        </span>


                        <strong
                            id="summary-total-orders"
                        >
                            —
                        </strong>

                    </div>


                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Upcoming Events
                        </span>


                        <strong
                            id="summary-upcoming-orders"
                        >
                            —
                        </strong>

                    </div>


                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Completed Orders
                        </span>


                        <strong
                            id="summary-completed-orders"
                        >
                            —
                        </strong>

                    </div>

                    <div
                        class="admin-stat-card"
                    >

                        <span>
                            Cancelled Orders
                        </span>


                        <strong
                            id="summary-cancelled-orders"
                        >
                            —
                        </strong>

                    </div>

                </section>


                <!-- ==================================
                     BUSINESS OVERVIEW
                     ================================== -->

                <section
                    class="admin-dashboard-section"
                >

                    <div
                        class="admin-section-header"
                    >

                        <div>

                            <h3>
                                Business Overview
                            </h3>


                            <p>
                                Current customer and financial summary.
                            </p>

                        </div>

                    </div>


                    <div
                        class="admin-summary-grid"
                        id="admin-business-summary"
                    >

                        <div
                            class="admin-stat-card"
                        >

                            <span>
                                Total Customers
                            </span>


                            <strong
                                id="summary-total-customers"
                            >
                                —
                            </strong>

                        </div>


                        <div
                            class="admin-stat-card"
                        >

                            <span>
                                Total Booking Value
                            </span>


                            <strong
                                id="summary-total-booking-value"
                            >
                                —
                            </strong>

                        </div>


                        <div
                            class="admin-stat-card"
                        >

                            <span>
                                Total Paid
                            </span>


                            <strong
                                id="summary-total-paid"
                            >
                                —
                            </strong>

                        </div>


                        <div
                            class="admin-stat-card"
                        >

                            <span>
                                Outstanding Balance
                            </span>


                            <strong
                                id="summary-outstanding-balance"
                            >
                                —
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- ==================================
                     RECENT ENQUIRIES
                     ================================== -->

                <section
                    class="admin-dashboard-section"
                >

                    <div
                        class="admin-section-header"
                    >

                        <div>

                            <h3>
                                Recent Enquiries
                            </h3>


                            <p>
                                Latest customer enquiries.
                            </p>

                        </div>

                    </div>


                    <div
                        class="admin-table-container"
                        id="admin-recent-enquiries"
                    >

                        <div
                            class="admin-loading"
                        >
                            Loading enquiries...
                        </div>

                    </div>

                </section>


                <!-- ==================================
                     RECENT ORDERS
                     ================================== -->

                <section
                    class="admin-dashboard-section"
                >

                    <div
                        class="admin-section-header"
                    >

                        <div>

                            <h3>
                                Recent Orders
                            </h3>


                            <p>
                                Latest event bookings.
                            </p>

                        </div>

                    </div>


                    <div
                        class="admin-table-container"
                        id="admin-recent-orders"
                    >

                        <div
                            class="admin-loading"
                        >
                            Loading orders...
                        </div>

                    </div>

                </section>

            </main>

        </div>

    `;

}


// ==========================================
// GET ADMIN TOKEN
// ==========================================

function getAdminToken() {

    return sessionStorage.getItem(
        'sce_admin_token'
    );

}


// ==========================================
// AUTHENTICATED API REQUEST
// ==========================================

async function adminFetch(
    endpoint
) {

    const token =
        getAdminToken();


    if (!token) {

        window.location.href =
            '/admin';


        throw new Error(
            'Authentication required.'
        );

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                method:
                    'GET',

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }
        );


    const result =
        await response.json();


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        sessionStorage.removeItem(
            'sce_admin_token'
        );


        sessionStorage.removeItem(
            'sce_admin'
        );


        window.location.href =
            '/admin';


        throw new Error(
            result.message ||
            'Authentication expired.'
        );

    }


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'Unable to retrieve dashboard data.'
        );

    }


    return result;

}


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

export async function loadDashboardData() {

    try {

        const [
            summary,
            recentEnquiries,
            recentOrders
        ] = await Promise.all([

            adminFetch(
                '/api/admin/dashboard/summary'
            ),

            adminFetch(
                '/api/admin/dashboard/recent-enquiries'
            ),

            adminFetch(
                '/api/admin/dashboard/recent-orders'
            )

        ]);


        // ==================================
        // SUMMARY
        // ==================================

        renderSummary(
            summary
        );


        // ==================================
        // RECENT ENQUIRIES
        // ==================================

        renderRecentEnquiries(
            recentEnquiries.enquiries
        );


        // ==================================
        // RECENT ORDERS
        // ==================================

        renderRecentOrders(
            recentOrders.orders
        );


    } catch (error) {

        console.error(
            'Dashboard loading error:',
            error
        );

    }

}


// ==========================================
// RENDER SUMMARY
// ==========================================

function renderSummary(
    data
) {

    const enquiries =
        data.enquiries || {};


    const orders =
        data.orders || {};


    const customers =
        data.customers || {};


    const financials =
        data.financials || {};


    // ======================================
    // EXISTING SUMMARY
    // ======================================

    setText(
        'summary-total-enquiries',
        enquiries.total ?? 0
    );


    setText(
        'summary-pending-enquiries',
        enquiries.pending ?? 0
    );


    setText(
        'summary-accepted-enquiries',
        enquiries.accepted ?? 0
    );

    setText(
        'summary-rejected-enquiries',
        enquiries.rejected ?? 0
    );

    setText(
        'summary-total-orders',
        orders.total ?? 0
    );


    setText(
        'summary-upcoming-orders',
        orders.upcoming ?? 0
    );


    setText(
        'summary-completed-orders',
        orders.completed ?? 0
    );

    setText(
        'summary-cancelled-orders',
        orders.cancelled ?? 0
    );


    // ======================================
    // BUSINESS OVERVIEW
    // ======================================

    setText(
        'summary-total-customers',
        customers.total ?? 0
    );


    setText(
        'summary-total-booking-value',
        formatCurrency(
            financials.total_booking_value
        )
    );


    setText(
        'summary-total-paid',
        formatCurrency(
            financials.total_paid
        )
    );


    setText(
        'summary-outstanding-balance',
        formatCurrency(
            financials.outstanding_balance
        )
    );

}


// ==========================================
// RENDER RECENT ENQUIRIES
// ==========================================

function renderRecentEnquiries(
    enquiries
) {

    const container =
        document.getElementById(
            'admin-recent-enquiries'
        );


    if (!container) {
        return;
    }


    if (
        !enquiries ||
        enquiries.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >
                No enquiries found.
            </div>

        `;


        return;

    }


    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table"
            >

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>


                        <th>
                            Customer
                        </th>


                        <th>
                            Event
                        </th>


                        <th>
                            Date
                        </th>


                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${enquiries.map(
                        enquiry => `

                        <tr>

                            <td>

                                #${escapeHtml(
                                    enquiry.enquiry_id
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    enquiry.full_name
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    enquiry.event_type
                                )}

                            </td>


                            <td>

                                ${formatDate(
                                    enquiry.event_date
                                )}

                            </td>


                            <td>

                                ${statusBadge(
                                    enquiry.status
                                )}

                            </td>

                        </tr>

                    `
                    ).join('')}

                </tbody>

            </table>

        </div>

    `;

}


// ==========================================
// RENDER RECENT ORDERS
// ==========================================

function renderRecentOrders(
    orders
) {

    const container =
        document.getElementById(
            'admin-recent-orders'
        );


    if (!container) {
        return;
    }


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >
                No orders found.
            </div>

        `;


        return;

    }


    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table"
            >

                <thead>

                    <tr>

                        <th>
                            Booking
                        </th>


                        <th>
                            Customer
                        </th>


                        <th>
                            Event
                        </th>


                        <th>
                            Date
                        </th>


                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${orders.map(
                        order => `

                        <tr>

                            <td>

                                ${escapeHtml(
                                    order.booking_number ||
                                    '—'
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    order.full_name
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    order.event_type
                                )}

                            </td>


                            <td>

                                ${formatDate(
                                    order.event_date
                                )}

                            </td>


                            <td>

                                ${statusBadge(
                                    order.status
                                )}

                            </td>

                        </tr>

                    `
                    ).join('')}

                </tbody>

            </table>

        </div>

    `;

}


// ==========================================
// HELPER — SET TEXT
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            String(value);

    }

}


// ==========================================
// HELPER — CURRENCY
// ==========================================

function formatCurrency(
    value
) {

    const amount =
        Number(value);


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return '₹0';

    }


    return `₹${amount.toLocaleString(
        'en-IN',
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;

}


// ==========================================
// HELPER — STATUS BADGE
// ==========================================

function statusBadge(
    status
) {

    const safeStatus =
        escapeHtml(
            status || 'Unknown'
        );


    const className =
        String(
            status || 'unknown'
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                '-'
            );


    return `

        <span
            class="admin-status-badge status-${className}"
        >
            ${safeStatus}
        </span>

    `;

}


// ==========================================
// HELPER — DATE
// ==========================================

function formatDate(
    value
) {

    if (!value) {

        return '—';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHtml(
            String(value)
        );

    }


    return date.toLocaleDateString(
        'en-IN',
        {

            day:
                '2-digit',

            month:
                'short',

            year:
                'numeric'

        }
    );

}


// ==========================================
// HELPER — ESCAPE HTML
// ==========================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }


    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}
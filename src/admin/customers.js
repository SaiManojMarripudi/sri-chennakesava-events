// ==========================================
// ADMIN CUSTOMERS MANAGEMENT
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// OPEN ORDER DETAILS
// ==========================================

function openCustomerOrder(
    orderId
) {

    if (!orderId) {
        return;
    }


    window.location.href =
        `/admin/orders?open=${encodeURIComponent(
            orderId
        )}`;

}


let allCustomers = [];


// ==========================================
// RENDER CUSTOMERS PAGE
// ==========================================

export function renderCustomers() {

    return `

        <div class="admin-customers-page">

            <main class="admin-dashboard-main">

                <section class="admin-page-heading">

                    <div>

                        <h2>
                            Customers
                        </h2>

                        <p>
                            Manage customer information and booking history.
                        </p>

                    </div>

                </section>


                <!-- ==================================
                     SEARCH CONTROLS
                     ================================== -->

                <section class="admin-enquiry-controls">

                    <div class="admin-search-wrapper">

                        <label for="customer-search">
                            Search
                        </label>

                        <input
                            type="search"
                            id="customer-search"
                            placeholder="Search name, email or phone..."
                            autocomplete="off"
                        >

                    </div>

                </section>


                <!-- ==================================
                     CUSTOMERS TABLE
                     ================================== -->

                <section class="admin-dashboard-section">

                    <div class="admin-section-header">

                        <div>

                            <h3>
                                Customers
                            </h3>

                            <p id="customer-count">
                                Loading...
                            </p>

                        </div>

                    </div>


                    <div
                        id="admin-customers-table"
                        class="admin-table-container"
                    >

                        <div class="admin-loading">
                            Loading customers...
                        </div>

                    </div>

                </section>

            </main>


            <!-- ==================================
                 CUSTOMER DETAILS MODAL
                 ================================== -->

            <div
                id="customer-details-modal"
                class="admin-modal"
                hidden
            >

                <div
                    class="admin-modal-overlay"
                    id="customer-modal-overlay"
                ></div>


                <div
                    class="admin-modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="customer-modal-title"
                >

                    <div class="admin-modal-header">

                        <div>

                            <h3 id="customer-modal-title">
                                Customer Details
                            </h3>

                            <p id="customer-modal-subtitle">
                                Customer information
                            </p>

                        </div>


                        <button
                            type="button"
                            id="customer-modal-close"
                            class="admin-modal-close"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="customer-modal-content"
                        class="admin-modal-content"
                    ></div>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// INITIALIZE CUSTOMERS
// ==========================================

export function initializeCustomers() {

    // ======================================
    // CHECK ADMIN SESSION
    // ======================================

    const token =
        getAdminToken();


    if (!token) {

        console.error(
            'Customers: Admin token not found.'
        );

        handleAuthenticationFailure(
            'Authentication required.'
        );

        return;

    }


    // ======================================
    // SEARCH
    // ======================================

    const searchInput =
        document.getElementById(
            'customer-search'
        );


    if (searchInput) {

        searchInput.addEventListener(
            'input',
            applyCustomerFilters
        );

    }


    // ======================================
    // CLOSE MODAL
    // ======================================

    const closeButton =
        document.getElementById(
            'customer-modal-close'
        );


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeCustomerModal
        );

    }


    // ======================================
    // MODAL OVERLAY
    // ======================================

    const overlay =
        document.getElementById(
            'customer-modal-overlay'
        );


    if (overlay) {

        overlay.addEventListener(
            'click',
            closeCustomerModal
        );

    }


    // ======================================
    // ESCAPE KEY
    // ======================================

    document.addEventListener(
        'keydown',
        handleEscapeKey
    );


    // ======================================
    // LOAD CUSTOMERS
    // ======================================

    loadCustomers();

}


// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    const container =
        document.getElementById(
            'admin-customers-table'
        );


    if (!container) {

        return;

    }


    try {

        const result =
            await adminFetch(
                '/api/customers'
            );


        allCustomers =
            result.customers || [];


        applyCustomerFilters();


    } catch (error) {

        console.error(
            'Unable to load customers:',
            error
        );


        container.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load customers
                </strong>


                <p>

                    ${escapeHtml(
                        error.message ||
                        'Something went wrong.'
                    )}

                </p>

            </div>

        `;

    }

}


// ==========================================
// FILTER CUSTOMERS
// ==========================================

function applyCustomerFilters() {

    const searchInput =
        document.getElementById(
            'customer-search'
        );


    const search =
        (
            searchInput?.value ||
            ''
        )
        .trim()
        .toLowerCase();


    const filtered =
        allCustomers.filter(
            customer => {

                if (!search) {

                    return true;

                }


                return (

                    String(
                        customer.full_name ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        customer.email ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        customer.phone ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    renderCustomersTable(
        filtered
    );

}


// ==========================================
// RENDER CUSTOMERS TABLE
// ==========================================

function renderCustomersTable(
    customers
) {

    const container =
        document.getElementById(
            'admin-customers-table'
        );


    const count =
        document.getElementById(
            'customer-count'
        );


    if (!container) {

        return;

    }


    if (count) {

        count.textContent =
            `${customers.length} ${
                customers.length === 1
                    ? 'customer'
                    : 'customers'
            }`;

    }


    if (
        !customers ||
        customers.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >

                No customers match your search.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table admin-customers-table"
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
                            Contact
                        </th>

                        <th>
                            Orders
                        </th>

                        <th>
                            Upcoming
                        </th>

                        <th>
                            Completed
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${customers.map(
                        customer => `

                        <tr>

                            <td>

                                #${escapeHtml(
                                    customer.customer_id
                                )}

                            </td>


                            <td>

                                <strong>

                                    ${escapeHtml(
                                        customer.full_name
                                    )}

                                </strong>

                            </td>


                            <td>

                                <div
                                    class="admin-contact-cell"
                                >

                                    <span>

                                        ${escapeHtml(
                                            customer.phone ||
                                            '—'
                                        )}

                                    </span>


                                    <small>

                                        ${escapeHtml(
                                            customer.email ||
                                            '—'
                                        )}

                                    </small>

                                </div>

                            </td>


                            <td>

                                ${escapeHtml(
                                    customer.total_orders ??
                                    0
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    customer.upcoming_orders ??
                                    0
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    customer.completed_orders ??
                                    0
                                )}

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="admin-view-button"
                                    data-customer-id="${escapeAttribute(
                                        customer.customer_id
                                    )}"
                                >
                                    View
                                </button>

                            </td>

                        </tr>

                    `
                    ).join('')}

                </tbody>

            </table>

        </div>

    `;


    // ======================================
    // VIEW BUTTONS
    // ======================================

    container
        .querySelectorAll(
            '.admin-view-button'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        openCustomerModal(
                            button.dataset.customerId
                        );

                    }
                );

            }
        );

}


// ==========================================
// OPEN CUSTOMER MODAL
// ==========================================

export async function openCustomerModal(
    customerId
) {

    const modal =
        document.getElementById(
            'customer-details-modal'
        );


    const content =
        document.getElementById(
            'customer-modal-content'
        );


    if (
        !modal ||
        !content
    ) {

        return;

    }


    modal.hidden = false;


    content.innerHTML = `

        <div
            class="admin-loading"
        >
            Loading customer details...
        </div>

    `;


    try {

        const result =
            await adminFetch(
                `/api/customers/${customerId}`
            );


        const customer =
            result.customer;


        const summary =
            result.summary || {};


        const orders =
            result.orders || [];


        const payments =
            result.payments || [];


        if (!customer) {

            throw new Error(
                'Customer details were not found.'
            );

        }


        // ==================================
        // MODAL HEADER
        // ==================================

        const subtitle =
            document.getElementById(
                'customer-modal-subtitle'
            );


        if (subtitle) {

            subtitle.textContent =
                `Customer #${customer.customer_id}`;

        }


        // ==================================
        // CUSTOMER DETAILS
        // ==================================

        content.innerHTML = `

            <div
                class="admin-detail-grid"
            >

                ${detailItem(
                    'Customer Name',
                    customer.full_name
                )}


                ${detailItem(
                    'Phone',
                    customer.phone
                )}


                ${detailItem(
                    'Email',
                    customer.email
                )}


                ${detailItem(
                    'Customer Since',
                    formatDateTime(
                        customer.created_at
                    )
                )}

            </div>


            <!-- ==================================
                 CUSTOMER SUMMARY
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Customer Summary
                </h4>


                <div
                    class="admin-detail-grid"
                    style="margin-top:12px;"
                >

                    ${detailItem(
                        'Total Orders',
                        summary.total_orders ?? 0
                    )}


                    ${detailItem(
                        'Upcoming Orders',
                        summary.upcoming_orders ?? 0
                    )}


                    ${detailItem(
                        'Completed Orders',
                        summary.completed_orders ?? 0
                    )}


                    ${detailItem(
                        'Cancelled Orders',
                        summary.cancelled_orders ?? 0
                    )}


                    ${detailItem(
                        'Total Booking Value',
                        formatCurrency(
                            summary.total_booking_value
                        )
                    )}


                    ${detailItem(
                        'Total Paid',
                        formatCurrency(
                            summary.total_paid
                        )
                    )}


                    ${detailItem(
                        'Outstanding Balance',
                        formatCurrency(
                            summary.outstanding_balance
                        )
                    )}

                </div>

            </div>


            <!-- ==================================
                 BOOKING HISTORY
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Booking History
                </h4>


                ${
                    orders.length === 0

                        ? `

                            <div
                                class="admin-status-note"
                                style="margin-top:12px;"
                            >
                                No bookings found.
                            </div>

                        `

                        : `

                            <div
                                class="admin-table-scroll"
                                style="margin-top:12px;"
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
                                                Event
                                            </th>

                                            <th>
                                                Event Date
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Agreement
                                            </th>

                                            <th>
                                                Action
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
                                                        `#${order.order_id}`
                                                    )}

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        order.event_type ||
                                                        '—'
                                                    )}

                                                </td>


                                                <td>

                                                    ${formatDate(
                                                        order.event_date
                                                    )}

                                                </td>


                                                <td>

                                                    ${formatCurrency(
                                                        order.total_amount
                                                    )}

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        order.payment_status ||
                                                        'Unpaid'
                                                    )}

                                                </td>

                                                <td>

                                                    ${statusBadge(
                                                        order.agreement_status ||
                                                        'Pending'
                                                    )}

                                                </td>

                                                <td>

                                                    ${statusBadge(
                                                        order.status
                                                    )}

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        class="admin-view-button customer-order-view-button"
                                                        data-order-id="${escapeAttribute(
                                                            order.order_id
                                                        )}"
                                                    >
                                                        View Order
                                                    </button>

                                                </td>

                                            </tr>

                                        `
                                        ).join('')}

                                    </tbody>

                                </table>

                            </div>

                        `
                }

            </div>


            <!-- ==================================
                 PAYMENT HISTORY
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Payment History
                </h4>


                ${
                    payments.length === 0

                        ? `

                            <div
                                class="admin-status-note"
                                style="margin-top:12px;"
                            >
                                No payments recorded.
                            </div>

                        `

                        : `

                            <div
                                class="admin-table-scroll"
                                style="margin-top:12px;"
                            >

                                <table
                                    class="admin-table"
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Booking
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Method
                                            </th>

                                            <th>
                                                Recorded By
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        ${payments.map(
                                            payment => `

                                            <tr>

                                                <td>

                                                    ${formatDate(
                                                        payment.payment_date
                                                    )}

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        payment.booking_number ||
                                                        `#${payment.order_id}`
                                                    )}

                                                </td>


                                                <td>

                                                    <strong>

                                                        ${formatCurrency(
                                                            payment.amount
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        payment.payment_type
                                                    )}

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        payment.payment_method
                                                    )}

                                                </td>


                                                <td>

                                                    ${escapeHtml(
                                                        payment.created_by_name ||
                                                        'Admin'
                                                    )}

                                                </td>

                                            </tr>

                                        `
                                        ).join('')}

                                    </tbody>

                                </table>

                            </div>

                        `
                }

            </div>

        `;


        // ==================================
        // CUSTOMER BOOKING VIEW ORDER BUTTONS
        // ==================================

        content
            .querySelectorAll(
                '.customer-order-view-button'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            openCustomerOrder(
                                button.dataset.orderId
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            'Unable to load customer details:',
            error
        );


        content.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load customer
                </strong>


                <p>

                    ${escapeHtml(
                        error.message ||
                        'Something went wrong.'
                    )}

                </p>

            </div>

        `;

    }

}


// ==========================================
// CLOSE CUSTOMER MODAL
// ==========================================

function closeCustomerModal() {

    const modal =
        document.getElementById(
            'customer-details-modal'
        );


    if (modal) {

        modal.hidden = true;

    }

}


// ==========================================
// ESCAPE KEY
// ==========================================

function handleEscapeKey(
    event
) {

    if (
        event.key === 'Escape'
    ) {

        closeCustomerModal();

    }

}


// ==========================================
// AUTHENTICATED API REQUEST
// ==========================================

async function adminFetch(
    endpoint,
    options = {}
) {

    const token =
        getAdminToken();


    if (!token) {

        handleAuthenticationFailure(
            'Authentication required.'
        );


        throw new Error(
            'Authentication required.'
        );

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                ...options,

                headers: {

                    ...(options.headers || {}),

                    Authorization:
                        `Bearer ${token}`

                }

            }
        );


    let result;


    try {

        result =
            await response.json();

    } catch (error) {

        throw new Error(
            'Invalid response from server.'
        );

    }


    // ======================================
    // AUTHENTICATION FAILURE
    // ======================================

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        handleAuthenticationFailure(
            result.message
        );


        throw new Error(
            result.message ||
            'Authentication expired.'
        );

    }


    // ======================================
    // API ERROR
    // ======================================

    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'Request failed.'
        );

    }


    return result;

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
// AUTHENTICATION FAILURE
// ==========================================

function handleAuthenticationFailure(
    message
) {

    console.error(
        message ||
        'Authentication failed.'
    );


    sessionStorage.removeItem(
        'sce_admin_token'
    );


    sessionStorage.removeItem(
        'sce_admin'
    );


    window.location.href =
        '/admin';

}


// ==========================================
// DETAIL ITEM
// ==========================================

function detailItem(
    label,
    value
) {

    return `

        <div
            class="admin-detail-item"
        >

            <span>

                ${escapeHtml(
                    label
                )}

            </span>


            <strong>

                ${escapeHtml(

                    value === null ||
                    value === undefined ||
                    value === ''

                        ? '—'

                        : value

                )}

            </strong>

        </div>

    `;

}


// ==========================================
// STATUS BADGE
// ==========================================

function statusBadge(
    status
) {

    const safeStatus =
        escapeHtml(
            status ||
            'Unknown'
        );


    const className =
        String(
            status ||
            'unknown'
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
// CURRENCY FORMAT
// ==========================================

function formatCurrency(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return '—';

    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return '—';

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
// DATE FORMAT
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
// DATE + TIME FORMAT
// ==========================================

function formatDateTime(
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


    return date.toLocaleString(
        'en-IN',
        {

            day:
                '2-digit',

            month:
                'short',

            year:
                'numeric',

            hour:
                '2-digit',

            minute:
                '2-digit'

        }
    );

}


// ==========================================
// ESCAPE ATTRIBUTE
// ==========================================

function escapeAttribute(
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


// ==========================================
// ESCAPE HTML
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
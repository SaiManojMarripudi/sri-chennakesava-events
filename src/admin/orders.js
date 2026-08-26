// ==========================================
// ADMIN ORDERS MANAGEMENT
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';

let allOrders = [];


// ==========================================
// RENDER ORDERS PAGE
// ==========================================

export function renderOrders() {

    return `

        <div class="admin-orders-page">

            <main class="admin-dashboard-main">

                <section class="admin-page-heading">

                    <div>

                        <h2>
                            Orders
                        </h2>

                        <p>
                            Manage confirmed bookings and event orders.
                        </p>

                    </div>

                </section>


                <!-- ==================================
                     FILTER CONTROLS
                     ================================== -->

                <section class="admin-enquiry-controls">

                    <div class="admin-search-wrapper">

                        <label for="order-search">
                            Search
                        </label>

                        <input
                            type="search"
                            id="order-search"
                            placeholder="Search customer, email, phone or event..."
                            autocomplete="off"
                        >

                    </div>


                    <div class="admin-filter-wrapper">

                        <label for="order-status-filter">
                            Status
                        </label>

                        <select id="order-status-filter">

                            <option value="All">
                                All
                            </option>

                            <option value="Confirmed">
                                Confirmed
                            </option>

                            <option value="Upcoming">
                                Upcoming
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>

                        </select>

                    </div>

                </section>


                <!-- ==================================
                     ORDERS TABLE
                     ================================== -->

                <section class="admin-dashboard-section">

                    <div class="admin-section-header">

                        <div>

                            <h3>
                                Event Orders
                            </h3>

                            <p id="order-count">
                                Loading...
                            </p>

                        </div>

                    </div>


                    <div
                        id="admin-orders-table"
                        class="admin-table-container"
                    >

                        <div class="admin-loading">
                            Loading orders...
                        </div>

                    </div>

                </section>

            </main>


            <!-- ==================================
                 ORDER DETAILS MODAL
                 ================================== -->

            <div
                id="order-details-modal"
                class="admin-modal"
                hidden
            >

                <div
                    class="admin-modal-overlay"
                    id="order-modal-overlay"
                ></div>


                <div
                    class="admin-modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-modal-title"
                >

                    <div class="admin-modal-header">

                        <div>

                            <h3 id="order-modal-title">
                                Order Details
                            </h3>

                            <p id="order-modal-subtitle">
                                Order information
                            </p>

                        </div>


                        <button
                            type="button"
                            id="order-modal-close"
                            class="admin-modal-close"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="order-modal-content"
                        class="admin-modal-content"
                    ></div>


                    <div
                        id="order-modal-actions"
                        class="admin-modal-actions"
                    ></div>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// INITIALIZE ORDERS
// ==========================================

export function initializeOrders() {

    const token =
        getAdminToken();


    // ======================================
    // CHECK AUTHENTICATION
    // ======================================

    if (!token) {

        window.location.href =
            '/admin';

        return;

    }


    // ======================================
    // SEARCH
    // ======================================

    const searchInput =
        document.getElementById(
            'order-search'
        );


    if (searchInput) {

        searchInput.addEventListener(
            'input',
            applyOrderFilters
        );

    }


    // ======================================
    // STATUS FILTER
    // ======================================

    const statusFilter =
        document.getElementById(
            'order-status-filter'
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            'change',
            applyOrderFilters
        );

    }


    // ======================================
    // CLOSE MODAL
    // ======================================

    const closeButton =
        document.getElementById(
            'order-modal-close'
        );


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeOrderModal
        );

    }


    // ======================================
    // MODAL OVERLAY
    // ======================================

    const overlay =
        document.getElementById(
            'order-modal-overlay'
        );


    if (overlay) {

        overlay.addEventListener(
            'click',
            closeOrderModal
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
    // LOAD ORDERS
    // ======================================

    loadOrders();


    // ======================================
    // OPEN ORDER FROM URL
    // ======================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const openOrderId =
        params.get('open');

    if (openOrderId) {

        setTimeout(
            () => {

                openOrderModal(
                    openOrderId
                );

            },
            300
        );

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.getElementById(
            'admin-orders-table'
        );


    if (!container) {
        return;
    }


    try {

        const result =
            await adminFetch(
                '/api/orders'
            );


        allOrders =
            result.orders || [];


        applyOrderFilters();


    } catch (error) {

        console.error(
            'Unable to load orders:',
            error
        );


        container.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load orders
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
// FILTER ORDERS
// ==========================================

function applyOrderFilters() {

    const searchInput =
        document.getElementById(
            'order-search'
        );


    const statusFilter =
        document.getElementById(
            'order-status-filter'
        );


    const search =
        (
            searchInput?.value ||
            ''
        )
        .trim()
        .toLowerCase();


    const status =
        statusFilter?.value ||
        'All';


    const filtered =
        allOrders.filter(
            order => {

                const matchesSearch =
                    !search ||

                    String(
                        order.full_name ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.email ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.phone ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.event_type ||
                        ''
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesStatus =
                    status === 'All' ||
                    order.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderOrdersTable(
        filtered
    );

}


// ==========================================
// RENDER ORDERS TABLE
// ==========================================

function renderOrdersTable(
    orders
) {

    const container =
        document.getElementById(
            'admin-orders-table'
        );


    const count =
        document.getElementById(
            'order-count'
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            `${orders.length} ${
                orders.length === 1
                    ? 'order'
                    : 'orders'
            }`;

    }


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >

                No orders match your search.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table admin-orders-table"
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
                            Event
                        </th>

                        <th>
                            Event Date
                        </th>

                        <th>
                            Status
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

                                #${escapeHtml(
                                    order.order_id
                                )}

                            </td>


                            <td>

                                <strong>

                                    ${escapeHtml(
                                        order.full_name
                                    )}

                                </strong>

                            </td>


                            <td>

                                <div
                                    class="admin-contact-cell"
                                >

                                    <span>

                                        ${escapeHtml(
                                            order.phone ||
                                            '—'
                                        )}

                                    </span>


                                    <small>

                                        ${escapeHtml(
                                            order.email ||
                                            '—'
                                        )}

                                    </small>

                                </div>

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

                                ${statusBadge(
                                    order.status
                                )}

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="admin-view-button"
                                    data-order-id="${escapeHtml(
                                        order.order_id
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

                        openOrderModal(
                            button.dataset.orderId
                        );

                    }
                );

            }
        );

}


// ==========================================
// OPEN ORDER MODAL
// ==========================================

export async function openOrderModal(
    orderId
) {

    const modal =
        document.getElementById(
            'order-details-modal'
        );


    const content =
        document.getElementById(
            'order-modal-content'
        );


    const actions =
        document.getElementById(
            'order-modal-actions'
        );


    if (
        !modal ||
        !content ||
        !actions
    ) {

        return;

    }


    modal.hidden = false;


    content.innerHTML = `

        <div
            class="admin-loading"
        >

            Loading order details...

        </div>

    `;


    actions.innerHTML = '';


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}`
            );


        const order =
            result.order;


        const history =
            result.status_history ||
            [];


        const payments =
            result.payments ||
            [];


        const paymentSummary =
            result.payment_summary ||
            {

                total_amount:
                    order?.total_amount === null ||
                    order?.total_amount === undefined
                        ? null
                        : Number(
                            order.total_amount
                        ),

                total_paid:
                    0,

                balance:
                    order?.total_amount === null ||
                    order?.total_amount === undefined
                        ? null
                        : Number(
                            order.total_amount
                        )

            };


        if (!order) {

            throw new Error(
                'Order details were not found.'
            );

        }


        const subtitle =
            document.getElementById(
                'order-modal-subtitle'
            );


        if (subtitle) {

            subtitle.textContent =
                `Order #${order.order_id}`;

        }


        // ==================================
        // ORDER DETAILS
        // ==================================

        content.innerHTML = `

            <!-- ==================================
                 CUSTOMER + EVENT DETAILS
                 ================================== -->

            <div
                class="admin-detail-grid"
            >

                ${detailItem(
                    'Customer Name',
                    order.full_name
                )}


                ${detailItem(
                    'Phone',
                    order.phone
                )}


                ${detailItem(
                    'Email',
                    order.email
                )}


                ${detailItem(
                    'Event Type',
                    order.event_type
                )}


                ${detailItem(
                    'Event Date',
                    formatDate(
                        order.event_date
                    )
                )}


                ${detailItem(
                    'Guest Count',
                    order.guest_count
                )}


                ${detailItem(
                    'Budget',
                    order.budget
                )}


                ${detailItem(
                    'Event Location',
                    order.event_location
                )}


                ${detailItem(
                    'Status',
                    order.status
                )}


                ${detailItem(
                    'Created',
                    formatDateTime(
                        order.created_at
                    )
                )}

            </div>


            <!-- ==================================
                 BOOKING DETAILS
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Booking Details
                </h4>


                <!-- ==================================
                    BOOKING DETAILS STATUS
                    ================================== -->

                <div
                    style="
                        margin-top:12px;
                        padding:12px 14px;
                        border-radius:8px;
                        background:${
                            order.booking_details_status === 'Confirmed'
                                ? '#ecfdf5'
                                : '#fff7ed'
                        };
                        border:1px solid ${
                            order.booking_details_status === 'Confirmed'
                                ? '#10b981'
                                : '#f59e0b'
                        };
                        color:${
                            order.booking_details_status === 'Confirmed'
                                ? '#065f46'
                                : '#9a3412'
                        };
                    "
                >

                    <strong>
                        ${
                            order.booking_details_status === 'Confirmed'
                                ? '✓ Booking Details Confirmed'
                                : '⚠ Booking Details Pending'
                        }
                    </strong>


                    <div
                        style="
                            margin-top:4px;
                            font-size:13px;
                        "
                    >

                        ${
                            order.booking_details_status === 'Confirmed'
                                ? 'The booking details have been confirmed by the admin.'
                                : 'Complete and verify the booking details before proceeding with the agreement or payments.'
                        }

                    </div>

                </div>


                <div
                    class="admin-detail-grid"
                    style="margin-top:12px;"
                >

                    ${detailItem(
                        'Booking Number',
                        order.booking_number
                    )}


                    ${detailItem(
                        'Total Booking Amount',
                        formatCurrency(
                            paymentSummary.total_amount
                        )
                    )}

                </div>


                <div
                    id="booking-edit-container"
                    style="margin-top:16px;"
                ></div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:12px;
                    "
                >

                    <button
                        type="button"
                        class="admin-action-button"
                        id="edit-booking-button"
                    >
                        Edit Booking
                    </button>


                    ${
                        order.booking_details_status === 'Confirmed'

                            ? `

                                <div
                                    class="admin-status-note"
                                    style="
                                        display:flex;
                                        align-items:center;
                                        padding:10px 14px;
                                    "
                                >
                                    ✓ Booking Details Confirmed
                                </div>

                            `

                            : `

                                <button
                                    type="button"
                                    class="admin-action-button"
                                    id="confirm-booking-details-button"
                                >
                                    Confirm Booking Details
                                </button>

                            `
                    }

                </div>

            </div>

            
            <!-- ==================================
                 BOOKING AGREEMENT
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Booking Agreement
                </h4>

                <div
                    class="admin-detail-grid"
                    style="margin-top:12px;"
                >

                    ${detailItem(
                        'Agreement Status',
                        order.agreement_status || 'Pending'
                    )}

                    ${detailItem(
                        'Agreement Date',
                        formatDate(
                            order.agreement_date
                        )
                    )}

                    ${detailItem(
                        'Agreement Notes',
                        order.agreement_notes
                    )}

                </div>

                <div
                    id="agreement-form-container"
                    style="margin-top:16px;"
                ></div>

                ${
                    order.agreement_status === 'Signed'

                        ? `

                            <div
                                class="admin-status-note"
                                style="
                                    margin-top:12px;
                                    padding:12px 14px;
                                "
                            >

                                ✓ <strong>Booking Agreement Signed</strong>

                                <div
                                    style="
                                        margin-top:5px;
                                        font-size:13px;
                                    "
                                >
                                    The physical booking agreement has been
                                    signed by the client.
                                </div>

                            </div>


                            ${
                                order.booking_number

                                    ? `

                                        <div
                                            style="
                                                margin-top:14px;
                                                padding:14px;
                                                border:1px solid #10b981;
                                                border-radius:8px;
                                                background:#ecfdf5;
                                                color:#065f46;
                                            "
                                        >

                                            <div
                                                style="
                                                    font-size:13px;
                                                    font-weight:600;
                                                    margin-bottom:5px;
                                                "
                                            >
                                                Official Booking Number
                                            </div>

                                            <div
                                                style="
                                                    font-size:20px;
                                                    font-weight:700;
                                                    letter-spacing:0.5px;
                                                "
                                            >
                                                ${escapeHtml(
                                                    order.booking_number
                                                )}
                                            </div>

                                            <div
                                                style="
                                                    margin-top:5px;
                                                    font-size:13px;
                                                "
                                            >
                                                ✓ Booking officially confirmed
                                            </div>

                                        </div>

                                    `

                                    : `

                                        <div
                                            style="
                                                margin-top:14px;
                                                padding:14px;
                                                border:1px solid #f59e0b;
                                                border-radius:8px;
                                                background:#fff7ed;
                                                color:#9a3412;
                                            "
                                        >

                                            <strong>
                                                Official Booking Number Not Assigned
                                            </strong>

                                            <div
                                                style="
                                                    margin-top:5px;
                                                    font-size:13px;
                                                "
                                            >
                                                The agreement is signed. Generate
                                                the official booking number to
                                                finalize this booking.
                                            </div>

                                            <button
                                                type="button"
                                                class="admin-action-button"
                                                id="generate-booking-number-button"
                                                style="margin-top:12px;"
                                            >
                                                Generate Official Booking Number
                                            </button>

                                        </div>

                                    `

                            }

                        `

                        : order.booking_details_status !== 'Confirmed'

                            ? `

                                <div
                                    class="admin-status-note"
                                    style="
                                        margin-top:12px;
                                        padding:12px;
                                    "
                                >

                                    🔒 <strong>Agreement Locked</strong>

                                    <div
                                        style="
                                            margin-top:4px;
                                            font-size:13px;
                                        "
                                    >

                                        Confirm the Booking Details before
                                        marking the physical agreement as signed.

                                    </div>

                                </div>

                            `

                            : `

                                <button
                                    type="button"
                                    class="admin-action-button"
                                    id="sign-agreement-button"
                                    style="margin-top:12px;"
                                >
                                    Mark Agreement as Signed
                                </button>

                            `
                }

            </div>

            <!-- ==================================
                 PAYMENT SUMMARY
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Payment Summary
                </h4>


                <div
                    class="admin-detail-grid"
                    style="margin-top:12px;"
                >

                    ${detailItem(
                        'Total Amount',
                        formatCurrency(
                            paymentSummary.total_amount
                        )
                    )}


                    ${detailItem(
                        'Total Paid',
                        formatCurrency(
                            paymentSummary.total_paid
                        )
                    )}


                    ${detailItem(
                        'Balance',
                        formatCurrency(
                            paymentSummary.balance
                        )
                    )}


                    ${detailItem(
                        'Payment Status',
                        order.payment_status ||
                        'Unpaid'
                    )}

                </div>

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


                <p
                    style="margin-top:6px;"
                >

                    ${
                        payments.length === 0
                            ? 'No payments recorded yet.'
                            : `${payments.length} payment${
                                payments.length === 1
                                    ? ''
                                    : 's'
                            } recorded.`
                    }

                </p>


                ${renderPaymentHistory(
                    payments
                )}


                <div
                    id="payment-form-container"
                    style="margin-top:16px;"
                ></div>


                <button
                    type="button"
                    class="admin-action-button"
                    id="add-payment-button"
                    style="margin-top:12px;"
                    ${
                        order.booking_details_status !== 'Confirmed' ||
                        order.agreement_status !== 'Signed' ||
                        !order.booking_number ||
                        paymentSummary.total_amount === null ||
                        Number(
                            paymentSummary.balance || 0
                        ) <= 0
                            ? 'disabled'
                            : ''
                    }
                >
                    Add Payment
                </button>


                ${
                    order.booking_details_status !== 'Confirmed'

                        ? `

                            <div
                                class="admin-status-note"
                                style="
                                    margin-top:10px;
                                    padding:12px 14px;
                                    background:#fff7ed;
                                    border:1px solid #f59e0b;
                                    color:#9a3412;
                                "
                            >

                                🔒 <strong>Payment Entry Locked</strong>

                                <div
                                    style="
                                        margin-top:5px;
                                        font-size:13px;
                                    "
                                >

                                    Confirm the Booking Details before
                                    recording a payment.

                                </div>

                            </div>

                        `

                        : order.agreement_status !== 'Signed'

                            ? `

                                <div
                                    class="admin-status-note"
                                    style="
                                        margin-top:10px;
                                        padding:12px 14px;
                                        background:#fff7ed;
                                        border:1px solid #f59e0b;
                                        color:#9a3412;
                                    "
                                >

                                    🔒 <strong>Payment Entry Locked</strong>

                                    <div
                                        style="
                                            margin-top:5px;
                                            font-size:13px;
                                        "
                                    >

                                        Complete and sign the physical
                                        booking agreement before recording
                                        a payment.

                                    </div>

                                </div>

                            `

                            : !order.booking_number

                                ? `

                                    <div
                                        class="admin-status-note"
                                        style="
                                            margin-top:10px;
                                            padding:12px 14px;
                                            background:#fff7ed;
                                            border:1px solid #f59e0b;
                                            color:#9a3412;
                                        "
                                    >

                                        🔒 <strong>Payment Entry Locked</strong>

                                        <div
                                            style="
                                                margin-top:5px;
                                                font-size:13px;
                                            "
                                        >

                                            Generate the official booking number
                                            before recording a payment.

                                        </div>

                                    </div>

                                `

                                : ''
                }

            </div>


            <!-- ==================================
                 CUSTOMER MESSAGE
                 ================================== -->

            <div
                class="admin-detail-message"
                style="margin-top:28px;"
            >

                <h4>
                    Customer Message
                </h4>


                <p>

                    ${escapeHtml(
                        order.message ||
                        'No message provided.'
                    )}

                </p>

            </div>


            <!-- ==================================
                 STATUS HISTORY
                 ================================== -->

            <div
                class="admin-order-history"
                style="margin-top:28px;"
            >

                <h4>
                    Status History
                </h4>


                ${
                    history.length > 0

                        ? history.map(
                            item => `

                                <div
                                    class="admin-history-item"
                                >

                                    <div>

                                        <strong>

                                            ${escapeHtml(
                                                item.new_status
                                            )}

                                        </strong>


                                        <span>

                                            ${
                                                item.old_status
                                                    ? `${escapeHtml(
                                                        item.old_status
                                                    )} → `
                                                    : ''
                                            }


                                            ${escapeHtml(
                                                item.new_status
                                            )}

                                        </span>

                                    </div>


                                    <div>

                                        <small>

                                            ${escapeHtml(
                                                item.changed_by_name ||
                                                'System'
                                            )}

                                        </small>


                                        <small>

                                            ${formatDateTime(
                                                item.changed_at
                                            )}

                                        </small>

                                    </div>


                                    ${
                                        item.notes
                                            ? `

                                                <p>

                                                    ${escapeHtml(
                                                        item.notes
                                                    )}

                                                </p>

                                            `
                                            : ''
                                    }

                                </div>

                            `
                        ).join('')

                        : `

                            <div
                                class="admin-status-note"
                            >

                                No status history available.

                            </div>

                        `
                }

            </div>

        `;


        // ==================================
        // EDIT BOOKING BUTTON
        // ==================================

        const editBookingButton =
            document.getElementById(
                'edit-booking-button'
            );


        if (editBookingButton) {

            editBookingButton.addEventListener(
                'click',
                () => {

                    renderBookingForm(
                        order
                    );

                }
            );

        }

        // ==================================
        // CONFIRM BOOKING DETAILS BUTTON
        // ==================================

        const confirmBookingDetailsButton =
            document.getElementById(
                'confirm-booking-details-button'
            );


        if (confirmBookingDetailsButton) {

            confirmBookingDetailsButton.addEventListener(
                'click',
                () => {

                    confirmBookingDetails(
                        order.order_id
                    );

                }
            );

        }
        // ==================================
        // AGREEMENT BUTTON
        // ==================================

        const signAgreementButton =
            document.getElementById(
                'sign-agreement-button'
            );

        if (signAgreementButton) {

            signAgreementButton.addEventListener(
                'click',
                () => {

                    renderAgreementForm(
                        order
                    );

                }
            );

        }

        // ==========================================
        // GENERATE OFFICIAL BOOKING NUMBER
        // ==========================================

        const generateBookingNumberButton =
            document.getElementById(
                'generate-booking-number-button'
            );


        if (generateBookingNumberButton) {

            generateBookingNumberButton.addEventListener(
                'click',
                () => {

                    generateBookingNumber(
                        order.order_id
                    );

                }
            );

        }

        // ==================================
        // ADD PAYMENT BUTTON
        // ==================================

        const addPaymentButton =
            document.getElementById(
                'add-payment-button'
            );


        if (
            addPaymentButton &&
            !addPaymentButton.disabled
        ) {

            addPaymentButton.addEventListener(
                'click',
                () => {

                    renderPaymentForm(
                        order,
                        paymentSummary
                    );

                }
            );

        }


        // ==================================
        // STATUS ACTIONS
        // ==================================

        renderOrderActions(
            order,
            actions
        );


    } catch (error) {

        console.error(
            'Unable to load order details:',
            error
        );


        content.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load order
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
// RENDER BOOKING FORM
// ==========================================

function renderBookingForm(
    order
) {

    const container =
        document.getElementById(
            'booking-edit-container'
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <form
            id="booking-edit-form"
            style="
                border:1px solid #ddd;
                border-radius:10px;
                padding:16px;
            "
        >

            <div
                style="
                    display:grid;
                    gap:14px;
                "
            >

                <div>

                    <label
                        for="booking-total-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Total Booking Amount
                    </label>


                    <input
                        type="number"
                        id="booking-total-input"
                        min="0"
                        step="0.01"
                        value="${
                            order.total_amount === null ||
                            order.total_amount === undefined
                                ? ''
                                : escapeAttribute(
                                    Number(
                                        order.total_amount
                                    ).toFixed(2)
                                )
                        }"
                        placeholder="75000"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >

                </div>


                <div
                    id="booking-form-message"
                    style="display:none;"
                ></div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="submit"
                        class="admin-action-button"
                    >
                        Save Booking
                    </button>


                    <button
                        type="button"
                        class="admin-action-button"
                        id="cancel-booking-edit"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </form>

    `;


    const form =
        document.getElementById(
            'booking-edit-form'
        );


    const cancelButton =
        document.getElementById(
            'cancel-booking-edit'
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                container.innerHTML =
                    '';

            }
        );

    }


    if (form) {

        form.addEventListener(
            'submit',
            event => {

                event.preventDefault();

                saveBookingDetails(
                    order.order_id
                );

            }
        );

    }

}


// ==========================================
// SAVE BOOKING DETAILS
// ==========================================

async function saveBookingDetails(
    orderId
) {

    const totalInput =
        document.getElementById(
            'booking-total-input'
        );


    const message =
        document.getElementById(
            'booking-form-message'
        );


    if (!totalInput) {

        return;

    }

    const totalValue =
        totalInput.value.trim();


    if (totalValue === '') {

        showInlineMessage(
            message,
            'error',
            'Please enter the total booking amount.'
        );

        return;

    }


    const totalAmount =
        Number(
            totalValue
        );


    if (
        !Number.isFinite(
            totalAmount
        ) ||
        totalAmount < 0
    ) {

        showInlineMessage(
            message,
            'error',
            'Please enter a valid booking amount.'
        );

        return;

    }


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/booking`,
                {

                    method:
                        'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            total_amount:
                                totalAmount

                        })

                }
            );


        console.log(
            'Booking details updated:',
            result
        );


        await loadOrders();


        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to update booking details:',
            error
        );


        showInlineMessage(
            message,
            'error',
            error.message ||
                'Unable to update booking details.'
        );

    }

}

// ==========================================
// CONFIRM BOOKING DETAILS
// ==========================================

async function confirmBookingDetails(
    orderId
) {

    const confirmed =
        window.confirm(
            'Confirm that all booking details have been reviewed and are correct?'
        );


    if (!confirmed) {

        return;

    }


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/booking-details`,
                {

                    method:
                        'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    }

                }
            );


        console.log(
            'Booking details confirmed:',
            result
        );


        // ======================================
        // REFRESH ORDERS
        // ======================================

        await loadOrders();


        // ======================================
        // REFRESH MODAL
        // ======================================

        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to confirm booking details:',
            error
        );


        window.alert(
            error.message ||
            'Unable to confirm booking details.'
        );

    }

}


// ==========================================
// RENDER AGREEMENT FORM
// ==========================================

function renderAgreementForm(
    order
) {

    const container =
        document.getElementById(
            'agreement-form-container'
        );

    if (!container) {
        return;
    }


    const today =
        getTodayForDateInput();


    container.innerHTML = `

        <form
            id="agreement-form"
            style="
                border:1px solid #ddd;
                border-radius:10px;
                padding:16px;
            "
        >

            <div
                style="
                    display:grid;
                    gap:14px;
                "
            >

                <div>

                    <label
                        for="agreement-date-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Agreement Date
                    </label>

                    <input
                        type="date"
                        id="agreement-date-input"
                        value="${escapeAttribute(
                            today
                        )}"
                        required
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >

                </div>


                <div>

                    <label
                        for="agreement-notes-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Agreement Notes
                    </label>

                    <textarea
                        id="agreement-notes-input"
                        rows="3"
                        placeholder="Example: Physical agreement signed by client."
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                            resize:vertical;
                        "
                    ></textarea>

                </div>


                <div
                    id="agreement-form-message"
                    style="display:none;"
                ></div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="submit"
                        class="admin-action-button"
                    >
                        Mark as Signed
                    </button>


                    <button
                        type="button"
                        class="admin-action-button"
                        id="cancel-agreement"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </form>

    `;


    const form =
        document.getElementById(
            'agreement-form'
        );


    const cancelButton =
        document.getElementById(
            'cancel-agreement'
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                container.innerHTML = '';

            }
        );

    }


    if (form) {

        form.addEventListener(
            'submit',
            event => {

                event.preventDefault();

                saveAgreement(
                    order.order_id
                );

            }
        );

    }

}


// ==========================================
// SAVE AGREEMENT
// ==========================================

async function saveAgreement(
    orderId
) {

    const dateInput =
        document.getElementById(
            'agreement-date-input'
        );


    const notesInput =
        document.getElementById(
            'agreement-notes-input'
        );


    const message =
        document.getElementById(
            'agreement-form-message'
        );


    if (
        !dateInput ||
        !notesInput
    ) {

        return;

    }


    if (!dateInput.value) {

        showInlineMessage(
            message,
            'error',
            'Please select the agreement date.'
        );

        return;

    }


    const confirmed =
        window.confirm(
            'Confirm that the physical booking agreement has been signed by the client?'
        );


    if (!confirmed) {

        return;

    }


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/agreement`,
                {

                    method:
                        'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            agreement_status:
                                'Signed',

                            agreement_date:
                                dateInput.value,

                            agreement_notes:
                                notesInput.value
                                    .trim() ||
                                null

                        })

                }
            );


        console.log(
            'Agreement updated:',
            result
        );


        await loadOrders();


        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to update agreement:',
            error
        );


        showInlineMessage(
            message,
            'error',
            error.message ||
                'Unable to update booking agreement.'
        );

    }

}

// ==========================================
// GENERATE OFFICIAL BOOKING NUMBER
// ==========================================

async function generateBookingNumber(
    orderId
) {

    const confirmed =
        window.confirm(
            'Generate the official booking number for this signed agreement?'
        );


    if (!confirmed) {

        return;

    }


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/booking-number`,
                {

                    method:
                        'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    }

                }
            );


        console.log(
            'Official booking number generated:',
            result
        );


        // ======================================
        // REFRESH ORDERS
        // ======================================

        await loadOrders();


        // ======================================
        // REFRESH CURRENT ORDER
        // ======================================

        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to generate official booking number:',
            error
        );


        window.alert(
            error.message ||
            'Unable to generate the official booking number.'
        );

    }

}

// ==========================================
// RENDER PAYMENT HISTORY
// ==========================================

function renderPaymentHistory(
    payments
) {

    if (
        !payments ||
        payments.length === 0
    ) {

        return `

            <div
                class="admin-status-note"
                style="margin-top:12px;"
            >

                No payments recorded yet.

            </div>

        `;

    }


    return `

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

                        <th>
                            Notes
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

                                <strong>

                                    ${formatCurrency(
                                        Number(
                                            payment.amount
                                        )
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


                            <td>

                                ${escapeHtml(
                                    payment.notes ||
                                    '—'
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
// RENDER PAYMENT FORM
// ==========================================

function renderPaymentForm(
    order,
    paymentSummary
) {

    const container =
        document.getElementById(
            'payment-form-container'
        );


    if (!container) {
        return;
    }


    const balance =
        Number(
            paymentSummary.balance ||
            0
        );


    const today =
        getTodayForDateInput();


    container.innerHTML = `

        <form
            id="payment-form"
            style="
                border:1px solid #ddd;
                border-radius:10px;
                padding:16px;
            "
        >

            <div
                style="
                    display:grid;
                    gap:14px;
                "
            >

                <div>

                    <label
                        for="payment-amount-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Payment Amount
                    </label>


                    <input
                        type="number"
                        id="payment-amount-input"
                        min="0.01"
                        max="${escapeAttribute(
                            balance.toFixed(2)
                        )}"
                        step="0.01"
                        placeholder="Amount received"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >


                    <small>

                        Remaining balance:
                        ${formatCurrency(
                            balance
                        )}

                    </small>

                </div>


                <div>

                    <label
                        for="payment-type-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Payment Type
                    </label>


                    <select
                        id="payment-type-input"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >

                        <option value="Advance">
                            Advance
                        </option>

                        <option value="Partial">
                            Partial
                        </option>

                        <option value="Final">
                            Final
                        </option>

                    </select>

                </div>


                <div>

                    <label
                        for="payment-method-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Payment Method
                    </label>


                    <select
                        id="payment-method-input"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >

                        <option value="Cash">
                            Cash
                        </option>

                        <option value="UPI">
                            UPI
                        </option>

                        <option value="Bank Transfer">
                            Bank Transfer
                        </option>

                        <option value="Card">
                            Card
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                </div>


                <div>

                    <label
                        for="payment-date-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Payment Date
                    </label>


                    <input
                        type="date"
                        id="payment-date-input"
                        value="${escapeAttribute(
                            today
                        )}"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                        "
                    >

                </div>


                <div>

                    <label
                        for="payment-notes-input"
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:600;
                        "
                    >
                        Notes
                    </label>


                    <textarea
                        id="payment-notes-input"
                        rows="3"
                        placeholder="Optional payment notes"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                            resize:vertical;
                        "
                    ></textarea>

                </div>


                <div
                    id="payment-form-message"
                    style="display:none;"
                ></div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="submit"
                        class="admin-action-button"
                    >
                        Save Payment
                    </button>


                    <button
                        type="button"
                        class="admin-action-button"
                        id="cancel-payment"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </form>

    `;


    const form =
        document.getElementById(
            'payment-form'
        );


    const cancelButton =
        document.getElementById(
            'cancel-payment'
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                container.innerHTML =
                    '';

            }
        );

    }


    if (form) {

        form.addEventListener(
            'submit',
            event => {

                event.preventDefault();

                savePayment(
                    order.order_id
                );

            }
        );

    }

}


// ==========================================
// SAVE PAYMENT
// ==========================================

async function savePayment(
    orderId
) {

    const amountInput =
        document.getElementById(
            'payment-amount-input'
        );


    const typeInput =
        document.getElementById(
            'payment-type-input'
        );


    const methodInput =
        document.getElementById(
            'payment-method-input'
        );


    const dateInput =
        document.getElementById(
            'payment-date-input'
        );


    const notesInput =
        document.getElementById(
            'payment-notes-input'
        );


    const message =
        document.getElementById(
            'payment-form-message'
        );


    if (
        !amountInput ||
        !typeInput ||
        !methodInput ||
        !dateInput ||
        !notesInput
    ) {

        return;

    }


    const amount =
        Number(
            amountInput.value
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        showInlineMessage(
            message,
            'error',
            'Please enter a valid payment amount.'
        );

        return;

    }


    if (
        !dateInput.value
    ) {

        showInlineMessage(
            message,
            'error',
            'Please select the payment date.'
        );

        return;

    }


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/payments`,
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            amount:

                                amount,

                            payment_type:

                                typeInput.value,

                            payment_method:

                                methodInput.value,

                            payment_date:

                                dateInput.value,

                            notes:

                                notesInput.value
                                    .trim() ||
                                null

                        })

                }
            );


        console.log(
            'Payment added:',
            result
        );


        await loadOrders();


        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to add payment:',
            error
        );


        showInlineMessage(
            message,
            'error',
            error.message ||
                'Unable to add payment.'
        );

    }

}


// ==========================================
// INLINE FORM MESSAGE
// ==========================================

function showInlineMessage(
    element,
    type,
    message
) {

    if (!element) {
        return;
    }


    element.style.display =
        'block';


    element.style.padding =
        '10px';


    element.style.borderRadius =
        '6px';


    element.style.marginTop =
        '4px';


    if (
        type === 'error'
    ) {

        element.style.background =
            '#fee2e2';

        element.style.color =
            '#991b1b';

    } else {

        element.style.background =
            '#dcfce7';

        element.style.color =
            '#166534';

    }


    element.textContent =
        message;

}


// ==========================================
// RENDER ORDER ACTIONS
// ==========================================

function renderOrderActions(
    order,
    actions
) {

    // ======================================
    // TERMINAL STATES
    // ======================================

    if (
        order.status === 'Completed' ||
        order.status === 'Cancelled'
    ) {

        actions.innerHTML = `

            <div
                class="admin-status-note"
            >

                This order is already

                <strong>

                    ${escapeHtml(
                        order.status
                    )}

                </strong>.

            </div>

        `;

        return;

    }


    let buttons = '';


    // ======================================
    // CONFIRMED → UPCOMING
    // ======================================

    if (
        order.status === 'Confirmed'
    ) {

        buttons += `

            <button
                type="button"
                class="admin-action-button admin-update-order-button"
                data-status="Upcoming"
            >

                Mark Upcoming

            </button>

        `;

    }


    // ======================================
    // UPCOMING → COMPLETED
    // ======================================

    if (
        order.status === 'Upcoming'
    ) {

        buttons += `

            <button
                type="button"
                class="admin-action-button admin-complete-order-button"
                data-status="Completed"
            >

                Mark Completed

            </button>

        `;

    }


    // ======================================
    // CANCEL ORDER
    // ======================================

    buttons += `

        <button
            type="button"
            class="admin-action-button admin-cancel-order-button"
            data-status="Cancelled"
        >

            Cancel Order

        </button>

    `;


    actions.innerHTML =
        buttons;


    // ======================================
    // ACTION BUTTON EVENTS
    // ======================================

    actions
        .querySelectorAll(
            '[data-status]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        updateOrderStatus(
                            order.order_id,
                            button.dataset.status
                        );

                    }
                );

            }
        );

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    const actions =
        document.getElementById(
            'order-modal-actions'
        );


    if (!actions) {
        return;
    }


    let notes = '';


    // ======================================
    // CANCELLATION NOTES
    // ======================================

    if (
        newStatus === 'Cancelled'
    ) {

        notes =
            window.prompt(
                'Enter cancellation notes (optional):',
                ''
            );

    }


    // ======================================
    // USER CANCELLED PROMPT
    // ======================================

    if (
        notes === null
    ) {

        return;

    }


    // ======================================
    // COMPLETION CONFIRMATION
    // ======================================

    if (
        newStatus === 'Completed'
    ) {

        const confirmed =
            window.confirm(
                'Mark this order as completed?'
            );


        if (!confirmed) {

            return;

        }

    }


    // ======================================
    // CANCELLATION CONFIRMATION
    // ======================================

    if (
        newStatus === 'Cancelled'
    ) {

        const confirmed =
            window.confirm(
                'Cancel this order?'
            );


        if (!confirmed) {

            return;

        }

    }


    // ======================================
    // LOADING
    // ======================================

    actions.innerHTML = `

        <div
            class="admin-loading"
        >

            Updating order...

        </div>

    `;


    try {

        const result =
            await adminFetch(
                `/api/orders/${orderId}/status`,
                {

                    method:
                        'PATCH',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus,

                            notes:
                                notes ||
                                null

                        })

                }
            );


        console.log(
            'Order status updated:',
            result
        );


        // ==================================
        // REFRESH ORDERS
        // ==================================

        await loadOrders();


        // ==================================
        // REFRESH MODAL
        // ==================================

        await openOrderModal(
            orderId
        );


    } catch (error) {

        console.error(
            'Unable to update order:',
            error
        );


        actions.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Update failed
                </strong>


                <p>

                    ${escapeHtml(
                        error.message ||
                        'Unable to update order status.'
                    )}

                </p>

            </div>

        `;

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
// CLOSE ORDER MODAL
// ==========================================

function closeOrderModal() {

    const modal =
        document.getElementById(
            'order-details-modal'
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

        closeOrderModal();

    }

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
// TODAY FOR DATE INPUT
// ==========================================

function getTodayForDateInput() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            '0'
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

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
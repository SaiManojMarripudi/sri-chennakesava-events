// ==========================================
// ADMIN UPCOMING EVENTS
// ==========================================

import {
    openOrderModal
} from './orders.js';


import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// RENDER UPCOMING EVENTS PAGE
// ==========================================

export function renderUpcomingEvents() {

    return `

        <div
            class="admin-upcoming-events-page"
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
                            Upcoming Events
                        </h2>


                        <p>
                            Top 10 upcoming events sorted by event date.
                        </p>

                    </div>

                </section>


                <!-- ==================================
                     UPCOMING EVENTS
                     ================================== -->

                <section
                    class="admin-dashboard-section"
                >

                    <div
                        class="admin-section-header"
                    >

                        <div>

                            <h3>
                                Upcoming Event Schedule
                            </h3>


                            <p
                                id="upcoming-events-count"
                            >
                                Loading...
                            </p>

                        </div>

                    </div>


                    <div
                        id="admin-upcoming-events-table"
                        class="admin-table-container"
                    >

                        <div
                            class="admin-loading"
                        >
                            Loading upcoming events...
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

                    <div
                        class="admin-modal-header"
                    >

                        <div>

                            <h3
                                id="order-modal-title"
                            >
                                Order Details
                            </h3>


                            <p
                                id="order-modal-subtitle"
                            >
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
// INITIALIZE UPCOMING EVENTS
// ==========================================

export function initializeUpcomingEvents() {

    const token =
        getAdminToken();


    if (!token) {

        window.location.href =
            '/admin';

        return;

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
    // LOAD EVENTS
    // ======================================

    loadUpcomingEvents();

}


// ==========================================
// LOAD UPCOMING EVENTS
// ==========================================

async function loadUpcomingEvents() {

    const container =
        document.getElementById(
            'admin-upcoming-events-table'
        );


    if (!container) {
        return;
    }


    try {

        const result =
            await adminFetch(
                '/api/admin/dashboard/upcoming-events'
            );


        const events =
            result.events || [];


        renderUpcomingEventsTable(
            events
        );


    } catch (error) {

        console.error(
            'Unable to load upcoming events:',
            error
        );


        container.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load upcoming events
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
// RENDER TOP 10 UPCOMING EVENTS
// ==========================================

function renderUpcomingEventsTable(
    events
) {

    const container =
        document.getElementById(
            'admin-upcoming-events-table'
        );


    const count =
        document.getElementById(
            'upcoming-events-count'
        );


    if (!container) {
        return;
    }


    const now =
        new Date();


    // ======================================
    // FILTER + SORT + LIMIT
    // ======================================

    const upcomingEvents =
        (events || [])

            .filter(
                event => {

                    if (
                        !event.event_date
                    ) {

                        return false;

                    }


                    const eventDate =
                        new Date(
                            event.event_date
                        );


                    if (
                        Number.isNaN(
                            eventDate.getTime()
                        )
                    ) {

                        return false;

                    }


                    // Remove past events

                    if (
                        eventDate < now
                    ) {

                        return false;

                    }


                    // Remove completed events

                    if (
                        event.status ===
                        'Completed'
                    ) {

                        return false;

                    }


                    // Remove cancelled events

                    if (
                        event.status ===
                        'Cancelled'
                    ) {

                        return false;

                    }


                    return true;

                }
            )


            // ==================================
            // SORT NEAREST EVENT FIRST
            // ==================================

            .sort(
                (
                    first,
                    second
                ) => {

                    return (
                        new Date(
                            first.event_date
                        ).getTime()

                        -

                        new Date(
                            second.event_date
                        ).getTime()
                    );

                }
            )


            // ==================================
            // TOP 10 ONLY
            // ==================================

            .slice(
                0,
                10
            );


    // ======================================
    // COUNT
    // ======================================

    if (count) {

        count.textContent =
            `${upcomingEvents.length} ${
                upcomingEvents.length === 1
                    ? 'upcoming event'
                    : 'upcoming events'
            }`;

    }


    // ======================================
    // NO EVENTS
    // ======================================

    if (
        upcomingEvents.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >

                No upcoming events found.

            </div>

        `;


        return;

    }


    // ======================================
    // EVENTS TABLE
    // ======================================

    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table admin-upcoming-events-table"
            >

                <thead>

                    <tr>

                        <th>
                            #
                        </th>


                        <th>
                            Booking
                        </th>


                        <th>
                            Customer
                        </th>


                        <th>
                            Event Type
                        </th>


                        <th>
                            Event Date
                        </th>


                        <th>
                            Guests
                        </th>


                        <th>
                            Location
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
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${upcomingEvents.map(
                        (
                            event,
                            index
                        ) => `

                        <tr>

                            <td>

                                <strong>
                                    ${index + 1}
                                </strong>

                            </td>


                            <!-- ==========================
                                 BOOKING NUMBER
                                 ========================== -->

                            <td>

                                <strong>

                                    ${escapeHtml(
                                        event.booking_number ||
                                        '—'
                                    )}

                                </strong>

                            </td>


                            <!-- ==========================
                                 CUSTOMER
                                 ========================== -->

                            <td>

                                ${escapeHtml(
                                    event.full_name ||
                                    '—'
                                )}

                            </td>


                            <!-- ==========================
                                 EVENT TYPE
                                 ========================== -->

                            <td>

                                ${escapeHtml(
                                    event.event_type ||
                                    '—'
                                )}

                            </td>


                            <!-- ==========================
                                 EVENT DATE
                                 ========================== -->

                            <td>

                                <strong>

                                    ${formatDate(
                                        event.event_date
                                    )}

                                </strong>

                            </td>


                            <!-- ==========================
                                 GUESTS
                                 ========================== -->

                            <td>

                                ${escapeHtml(
                                    event.guest_count ??
                                    '—'
                                )}

                            </td>


                            <!-- ==========================
                                 LOCATION
                                 ========================== -->

                            <td>

                                ${escapeHtml(
                                    event.event_location ||
                                    '—'
                                )}

                            </td>


                            <!-- ==========================
                                 TOTAL AMOUNT
                                 ========================== -->

                            <td>

                                <strong>

                                    ${formatCurrency(
                                        event.total_amount
                                    )}

                                </strong>

                            </td>


                            <!-- ==========================
                                 PAYMENT STATUS
                                 ========================== -->

                            <td>

                                ${paymentStatusBadge(
                                    event.payment_status
                                )}

                            </td>


                            <!-- ==========================
                                 ORDER STATUS
                                 ========================== -->

                            <td>

                                ${statusBadge(
                                    event.status
                                )}

                            </td>


                            <!-- ==========================
                                 ACTION
                                 ========================== -->

                            <td>

                                <button
                                    type="button"
                                    class="admin-view-button upcoming-event-view-button"
                                    data-order-id="${escapeHtml(
                                        event.order_id
                                    )}"
                                >
                                    View Details
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
    // VIEW DETAILS BUTTONS
    // ======================================

    container
        .querySelectorAll(
            '.upcoming-event-view-button'
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
// PAYMENT STATUS BADGE
// ==========================================

function paymentStatusBadge(
    status
) {

    const safeStatus =
        escapeHtml(
            status ||
            'Unpaid'
        );


    const normalizedStatus =
        String(
            status ||
            'Unpaid'
        )
        .toLowerCase()
        .replace(
            /\s+/g,
            '-'
        );


    return `

        <span
            class="admin-status-badge status-${normalizedStatus}"
        >

            ${safeStatus}

        </span>

    `;

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
// AUTHENTICATED API REQUEST
// ==========================================

async function adminFetch(
    endpoint
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

                method:
                    'GET',

                headers: {

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
            'Unable to retrieve upcoming events.'
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
// FORMAT CURRENCY
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
        Number.isNaN(
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
// FORMAT DATE
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
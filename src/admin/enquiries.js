// ==========================================
// ADMIN ENQUIRIES MANAGEMENT
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// ENQUIRY DATA
// ==========================================

let allEnquiries = [];


// ==========================================
// RENDER ENQUIRIES PAGE
// ==========================================

export function renderEnquiries() {

    return `

        <div class="admin-enquiries-page">

            <main class="admin-dashboard-main">

                <!-- PAGE HEADING -->

                <section class="admin-page-heading">

                    <div>

                        <h2>
                            Enquiries
                        </h2>

                        <p>
                            Manage customer enquiries and booking requests.
                        </p>

                    </div>

                </section>


                <!-- FILTER BAR -->

                <section class="admin-enquiry-controls">

                    <div class="admin-search-wrapper">

                        <label
                            for="enquiry-search"
                        >
                            Search
                        </label>


                        <input
                            type="search"
                            id="enquiry-search"
                            placeholder="Search customer, email, phone or event..."
                            autocomplete="off"
                        >

                    </div>


                    <div class="admin-filter-wrapper">

                        <label
                            for="enquiry-status-filter"
                        >
                            Status
                        </label>


                        <select
                            id="enquiry-status-filter"
                        >

                            <option value="All">
                                All
                            </option>


                            <option value="Pending">
                                Pending
                            </option>


                            <option value="Accepted">
                                Accepted
                            </option>


                            <option value="Rejected">
                                Rejected
                            </option>

                        </select>

                    </div>

                </section>


                <!-- ENQUIRIES TABLE -->

                <section
                    class="admin-dashboard-section"
                >

                    <div
                        class="admin-section-header"
                    >

                        <div>

                            <h3>
                                Customer Enquiries
                            </h3>


                            <p
                                id="enquiry-count"
                            >
                                Loading...
                            </p>

                        </div>

                    </div>


                    <div
                        id="admin-enquiries-table"
                        class="admin-table-container"
                    >

                        <div
                            class="admin-loading"
                        >
                            Loading enquiries...
                        </div>

                    </div>

                </section>

            </main>


            <!-- ==================================
                 ENQUIRY DETAILS MODAL
                 ================================== -->

            <div
                id="enquiry-details-modal"
                class="admin-modal"
                hidden
            >

                <div
                    class="admin-modal-overlay"
                    id="enquiry-modal-overlay"
                ></div>


                <div
                    class="admin-modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="enquiry-modal-title"
                >

                    <div
                        class="admin-modal-header"
                    >

                        <div>

                            <h3
                                id="enquiry-modal-title"
                            >
                                Enquiry Details
                            </h3>


                            <p
                                id="enquiry-modal-subtitle"
                            >
                                Customer enquiry information
                            </p>

                        </div>


                        <button
                            type="button"
                            id="enquiry-modal-close"
                            class="admin-modal-close"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="enquiry-modal-content"
                        class="admin-modal-content"
                    ></div>


                    <div
                        id="enquiry-modal-actions"
                        class="admin-modal-actions"
                    ></div>

                </div>

            </div>

        </div>

    `;
}


// ==========================================
// INITIALIZE ENQUIRIES
// ==========================================

export function initializeEnquiries() {

    const token =
        getAdminToken();


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
            'enquiry-search'
        );


    if (searchInput) {

        searchInput.addEventListener(
            'input',
            applyEnquiryFilters
        );

    }


    // ======================================
    // STATUS FILTER
    // ======================================

    const statusFilter =
        document.getElementById(
            'enquiry-status-filter'
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            'change',
            applyEnquiryFilters
        );

    }


    // ======================================
    // CLOSE MODAL
    // ======================================

    const modalClose =
        document.getElementById(
            'enquiry-modal-close'
        );


    if (modalClose) {

        modalClose.addEventListener(
            'click',
            closeEnquiryModal
        );

    }


    const modalOverlay =
        document.getElementById(
            'enquiry-modal-overlay'
        );


    if (modalOverlay) {

        modalOverlay.addEventListener(
            'click',
            closeEnquiryModal
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
    // LOAD ENQUIRIES
    // ======================================

    loadEnquiries();

}


// ==========================================
// LOAD ALL ENQUIRIES
// ==========================================

async function loadEnquiries() {

    const container =
        document.getElementById(
            'admin-enquiries-table'
        );


    if (!container) {
        return;
    }


    try {

        const result =
            await adminFetch(
                '/api/enquiries'
            );


        allEnquiries =
            result.enquiries || [];


        applyEnquiryFilters();


    } catch (error) {

        console.error(
            'Unable to load enquiries:',
            error
        );


        container.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load enquiries
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
// FILTER ENQUIRIES
// ==========================================

function applyEnquiryFilters() {

    const searchInput =
        document.getElementById(
            'enquiry-search'
        );


    const statusFilter =
        document.getElementById(
            'enquiry-status-filter'
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
        allEnquiries.filter(
            enquiry => {

                const matchesSearch =
                    !search ||

                    String(
                        enquiry.full_name || ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        enquiry.email || ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        enquiry.phone || ''
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        enquiry.event_type || ''
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesStatus =
                    status === 'All' ||
                    enquiry.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderEnquiryTable(
        filtered
    );

}


// ==========================================
// RENDER ENQUIRY TABLE
// ==========================================

function renderEnquiryTable(
    enquiries
) {

    const container =
        document.getElementById(
            'admin-enquiries-table'
        );


    const count =
        document.getElementById(
            'enquiry-count'
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            `${enquiries.length} ${
                enquiries.length === 1
                    ? 'enquiry'
                    : 'enquiries'
            }`;

    }


    if (
        !enquiries ||
        enquiries.length === 0
    ) {

        container.innerHTML = `

            <div
                class="admin-empty"
            >
                No enquiries match your search.
            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div
            class="admin-table-scroll"
        >

            <table
                class="admin-table admin-enquiries-table"
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

                    ${enquiries.map(
                        enquiry => `

                        <tr>

                            <td>

                                #${escapeHtml(
                                    enquiry.enquiry_id
                                )}

                            </td>


                            <td>

                                <strong>

                                    ${escapeHtml(
                                        enquiry.full_name
                                    )}

                                </strong>

                            </td>


                            <td>

                                <div
                                    class="admin-contact-cell"
                                >

                                    <span>

                                        ${escapeHtml(
                                            enquiry.phone ||
                                            '—'
                                        )}

                                    </span>


                                    <small>

                                        ${escapeHtml(
                                            enquiry.email ||
                                            '—'
                                        )}

                                    </small>

                                </div>

                            </td>


                            <td>

                                ${escapeHtml(
                                    enquiry.event_type ||
                                    '—'
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


                            <td>

                                <button
                                    type="button"
                                    class="admin-view-button"
                                    data-enquiry-id="${escapeHtml(
                                        enquiry.enquiry_id
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

                        const enquiryId =
                            button.dataset
                                .enquiryId;


                        openEnquiryModal(
                            enquiryId
                        );

                    }
                );

            }
        );

}


// ==========================================
// OPEN ENQUIRY MODAL
// ==========================================

async function openEnquiryModal(
    enquiryId
) {

    const modal =
        document.getElementById(
            'enquiry-details-modal'
        );


    const content =
        document.getElementById(
            'enquiry-modal-content'
        );


    const actions =
        document.getElementById(
            'enquiry-modal-actions'
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
            Loading enquiry details...
        </div>

    `;


    actions.innerHTML = '';


    try {

        const result =
            await adminFetch(
                `/api/enquiries/${enquiryId}`
            );


        const enquiry =
            result.enquiry;


        if (!enquiry) {

            throw new Error(
                'Enquiry details were not found.'
            );

        }


        const subtitle =
            document.getElementById(
                'enquiry-modal-subtitle'
            );


        if (subtitle) {

            subtitle.textContent =
                `Enquiry #${enquiry.enquiry_id}`;

        }


        // ==================================
        // ENQUIRY DETAILS
        // ==================================

        content.innerHTML = `

            <div
                class="admin-detail-grid"
            >

                ${detailItem(
                    'Customer Name',
                    enquiry.full_name
                )}


                ${detailItem(
                    'Phone',
                    enquiry.phone
                )}


                ${detailItem(
                    'Email',
                    enquiry.email
                )}


                ${detailItem(
                    'Event Type',
                    enquiry.event_type
                )}


                ${detailItem(
                    'Event Date',
                    formatDate(
                        enquiry.event_date
                    )
                )}


                ${detailItem(
                    'Guest Count',
                    enquiry.guest_count
                )}


                ${detailItem(
                    'Budget',
                    enquiry.budget
                )}


                ${detailItem(
                    'Event Location',
                    enquiry.event_location
                )}


                ${detailItem(
                    'Status',
                    enquiry.status
                )}

            </div>


            <div
                class="admin-detail-message"
            >

                <h4>
                    Customer Message
                </h4>


                <p>

                    ${escapeHtml(
                        enquiry.message ||
                        'No message provided.'
                    )}

                </p>

            </div>

        `;


        // ==================================
        // ENQUIRY ACTIONS
        // ==================================

        if (
            enquiry.status === 'Pending'
        ) {

            actions.innerHTML = `

                <button
                    type="button"
                    class="admin-action-button admin-accept-button"
                    data-action="Accepted"
                    data-enquiry-id="${escapeHtml(
                        enquiry.enquiry_id
                    )}"
                >
                    Accept Enquiry
                </button>


                <button
                    type="button"
                    class="admin-action-button admin-reject-button"
                    data-action="Rejected"
                    data-enquiry-id="${escapeHtml(
                        enquiry.enquiry_id
                    )}"
                >
                    Reject Enquiry
                </button>

            `;


            const actionButtons =
                actions.querySelectorAll(
                    '.admin-action-button'
                );


            actionButtons.forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            updateEnquiryStatus(
                                button.dataset.enquiryId,
                                button.dataset.action
                            );

                        }
                    );

                }
            );


        } else if (
            enquiry.status === 'Accepted'
        ) {

            actions.innerHTML = `

                <button
                    type="button"
                    id="create-order-button"
                    class="admin-action-button admin-create-order-button"
                    data-enquiry-id="${escapeHtml(
                        enquiry.enquiry_id
                    )}"
                >
                    Create Order
                </button>

            `;


            const createOrderButton =
                document.getElementById(
                    'create-order-button'
                );


            if (createOrderButton) {

                createOrderButton.addEventListener(
                    'click',
                    () => {

                        createOrderFromEnquiry(
                            createOrderButton.dataset.enquiryId
                        );

                    }
                );

            }


        } else {

            actions.innerHTML = `

                <div
                    class="admin-status-note"
                >

                    This enquiry is already

                    <strong>
                        ${escapeHtml(
                            enquiry.status
                        )}
                    </strong>.

                </div>

            `;

        }


    } catch (error) {

        console.error(
            'Unable to load enquiry details:',
            error
        );


        content.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to load enquiry
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
// UPDATE ENQUIRY STATUS
// ==========================================

async function updateEnquiryStatus(
    enquiryId,
    newStatus
) {

    const actions =
        document.getElementById(
            'enquiry-modal-actions'
        );


    if (!actions) {
        return;
    }


    // ======================================
    // SHOW LOADING STATE
    // ======================================

    actions.innerHTML = `

        <div
            class="admin-loading"
        >
            Updating enquiry...
        </div>

    `;


    try {

        // ==================================
        // ONE PATCH REQUEST ONLY
        // ==================================

        const result =
            await adminFetch(
                `/api/enquiries/${enquiryId}/status`,
                {

                    method: 'PATCH',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })

                }
            );


        console.log(
            'Enquiry status updated:',
            result
        );


        // ==================================
        // REFRESH ENQUIRY LIST
        // ==================================

        await loadEnquiries();


        // ==================================
        // CLOSE MODAL
        // ==================================

        closeEnquiryModal();


    } catch (error) {

        console.error(
            'Unable to update enquiry status:',
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
                        'Unable to update status.'
                    )}

                </p>

            </div>

        `;

    }

}


// ==========================================
// CREATE ORDER FROM ACCEPTED ENQUIRY
// ==========================================

async function createOrderFromEnquiry(
    enquiryId
) {

    const actions =
        document.getElementById(
            'enquiry-modal-actions'
        );


    if (!actions) {
        return;
    }


    // ======================================
    // CONFIRM ACTION
    // ======================================

    const confirmed =
        window.confirm(
            'Create an order from this accepted enquiry?'
        );


    if (!confirmed) {
        return;
    }


    // ======================================
    // SHOW LOADING
    // ======================================

    actions.innerHTML = `

        <div
            class="admin-loading"
        >
            Creating order...
        </div>

    `;


    try {

        // ==================================
        // CREATE ORDER
        // ==================================

        const result =
            await adminFetch(
                `/api/orders/from-enquiry/${enquiryId}`,
                {
                    method: 'POST'
                }
            );


        console.log(
            'Order created successfully:',
            result
        );


        // ==================================
        // GET CREATED ORDER ID
        // ==================================

        const orderId =
            result.order_id;


        if (!orderId) {

            throw new Error(
                'Order was created, but the order ID was not returned by the server.'
            );

        }


        // ==================================
        // SHOW SUCCESS
        // ==================================

        actions.innerHTML = `

            <div
                class="admin-order-success"
            >

                <strong>
                    Order created successfully.
                </strong>


                <p>

                    Order #${escapeHtml(
                        orderId
                    )}

                    has been created.

                </p>

            </div>

        `;


        // ==================================
        // CLOSE ENQUIRY MODAL
        // ==================================

        setTimeout(
            () => {

                closeEnquiryModal();


                // ==================================
                // OPEN CREATED ORDER
                // ==================================

                window.location.href =
                    `/admin/orders?open=${encodeURIComponent(
                        orderId
                    )}`;

            },
            800
        );


    } catch (error) {

        console.error(
            'Unable to create order:',
            error
        );


        actions.innerHTML = `

            <div
                class="admin-error-state"
            >

                <strong>
                    Unable to create order
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
// LOGOUT
// ==========================================

function logoutAdmin() {

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
// CLOSE ENQUIRY MODAL
// ==========================================

function closeEnquiryModal() {

    const modal =
        document.getElementById(
            'enquiry-details-modal'
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

        closeEnquiryModal();

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
                    value || '—'
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

            day: '2-digit',

            month: 'short',

            year: 'numeric'

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
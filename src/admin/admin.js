// ==========================================
// ADMIN APPLICATION
// ==========================================

import './admin.css';

import {
    renderAdminLogin,
    initializeAdminLogin
} from './auth.js';

import {
    renderDashboard,
    loadDashboardData
} from './dashboard.js';

import {
    renderEnquiries,
    initializeEnquiries
} from './enquiries.js';

import {
    renderOrders,
    initializeOrders
} from './orders.js';

import {
    renderUpcomingEvents,
    initializeUpcomingEvents
} from './upcoming-events.js';

import {
    renderCustomers,
    initializeCustomers
} from './customers.js';

import {
    renderLaunch,
    initializeLaunch
} from './launch.js';

import {
    renderAdminLayout,
    initializeAdminLayout
} from './AdminLayout.js';


// ==========================================
// ADMIN APPLICATION
// ==========================================

export function renderAdminApp() {

    const app =
        document.getElementById('app');


    if (!app) {
        return;
    }


    // ======================================
    // CURRENT ADMIN ROUTE
    // ======================================

    const currentPath =
        window.location.pathname;

    console.log(
        'ADMIN CURRENT PATH:',
        currentPath
    );


    // ======================================
    // ADMIN CUSTOMERS
    // ======================================

    if (
        currentPath === '/admin/customers' ||
        currentPath.startsWith(
            '/admin/customers/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderCustomers()
            );


        initializeAdminLayout();


        initializeCustomers();


        return;
    }


    // ======================================
    // ADMIN UPCOMING EVENTS
    // ======================================

    if (
        currentPath === '/admin/upcoming-events' ||
        currentPath.startsWith(
            '/admin/upcoming-events/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderUpcomingEvents()
            );


        initializeAdminLayout();


        initializeUpcomingEvents();


        return;
    }


    // ======================================
    // ADMIN ORDERS
    // ======================================

    if (
        currentPath === '/admin/orders' ||
        currentPath.startsWith(
            '/admin/orders/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderOrders()
            );


        initializeAdminLayout();


        initializeOrders();


        return;
    }


    // ======================================
    // ADMIN ENQUIRIES
    // ======================================

    if (
        currentPath === '/admin/enquiries' ||
        currentPath.startsWith(
            '/admin/enquiries/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderEnquiries()
            );


        initializeAdminLayout();


        initializeEnquiries();


        return;
    }


    // ======================================
    // ADMIN LAUNCH CONTROL
    // ======================================

    if (
        currentPath === '/admin/launch' ||
        currentPath.startsWith(
            '/admin/launch/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderLaunch()
            );


        initializeAdminLayout();


        initializeLaunch();


        return;
    }

    // ======================================
    // ADMIN DASHBOARD
    // ======================================

    if (
        currentPath === '/admin/dashboard' ||
        currentPath.startsWith(
            '/admin/dashboard/'
        )
    ) {

        app.innerHTML =
            renderAdminLayout(
                renderDashboard()
            );


        initializeAdminLayout();


        initializeDashboard();


        return;
    }


    // ======================================
    // ADMIN LOGIN
    // ======================================

    app.innerHTML =
        renderAdminLogin();


    initializeAdminLogin();

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

function initializeDashboard() {

    const adminData =
        sessionStorage.getItem(
            'sce_admin'
        );


    // ======================================
    // LOAD ADMIN INFORMATION
    // ======================================

    if (adminData) {

        try {

            const admin =
                JSON.parse(adminData);


            const adminName =
                document.getElementById(
                    'admin-user-name'
                );


            if (adminName) {

                adminName.textContent =
                    admin.full_name ||
                    'Admin';

            }

        } catch (error) {

            console.error(
                'Unable to read admin information:',
                error
            );

        }

    }


    // ======================================
    // LOAD DASHBOARD DATA
    // ======================================

    loadDashboardData();

}
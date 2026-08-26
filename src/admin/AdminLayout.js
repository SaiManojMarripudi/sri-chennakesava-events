// ==========================================
// ADMIN LAYOUT
// ==========================================

import {
    renderAdminNavigation,
    initializeAdminNavigation
} from './navigation.js';


// ==========================================
// RENDER ADMIN LAYOUT
// ==========================================

export function renderAdminLayout(
    pageContent
) {

    return `

        <div class="admin-app">

            <!-- ==================================
                 ADMIN HEADER
                 ================================== -->

            <header class="admin-header">

                <div class="admin-header-brand">

                    <img
                        src="public/logo/sce-logo.png"
                        alt="SRI CHENNAKESAVA EVENTS"
                    >


                    <div class="admin-header-brand-text">

                        <h1>
                            SRI CHENNAKESAVA EVENTS
                        </h1>


                        <span>
                            Admin Panel
                        </span>

                    </div>

                </div>


                <div class="admin-header-user">

                    <span
                        id="admin-user-name"
                    >
                        Admin
                    </span>


                    <button
                        id="admin-logout-button"
                        type="button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <!-- ==================================
                 ADMIN NAVIGATION
                 ================================== -->

            ${renderAdminNavigation()}


            <!-- ==================================
                 ADMIN CONTENT
                 ================================== -->

            <main class="admin-page-content">

                ${pageContent}

            </main>

        </div>

    `;

}


// ==========================================
// INITIALIZE ADMIN LAYOUT
// ==========================================

export function initializeAdminLayout() {

    // ======================================
    // ADMIN INFORMATION
    // ======================================

    const adminData =
        sessionStorage.getItem(
            'sce_admin'
        );


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
    // LOGOUT
    // ======================================

    const logoutButton =
        document.getElementById(
            'admin-logout-button'
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            'click',
            () => {

                sessionStorage.removeItem(
                    'sce_admin_token'
                );


                sessionStorage.removeItem(
                    'sce_admin'
                );


                window.location.href =
                    '/admin';

            }
        );

    }


    // ======================================
    // NAVIGATION
    // ======================================

    initializeAdminNavigation();

}
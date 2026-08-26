// ==========================================
// ADMIN NAVIGATION
// ==========================================

export function renderAdminNavigation() {

    const currentPath =
        window.location.pathname;


    const isDashboard =
        currentPath === '/admin/dashboard' ||
        currentPath.startsWith('/admin/dashboard/');


    const isEnquiries =
        currentPath === '/admin/enquiries' ||
        currentPath.startsWith('/admin/enquiries/');


    const isOrders =
        currentPath === '/admin/orders' ||
        currentPath.startsWith('/admin/orders/');


    const isUpcomingEvents =
        currentPath === '/admin/upcoming-events' ||
        currentPath.startsWith('/admin/upcoming-events/');


    // ==========================================
    // CUSTOMERS
    // ==========================================

    const isCustomers =
        currentPath === '/admin/customers' ||
        currentPath.startsWith('/admin/customers/');
    
    return `

        <nav
            class="admin-navigation"
            aria-label="Admin navigation"
        >

            <!-- ==================================
                 DASHBOARD
                 ================================== -->

            <a
                href="/admin/dashboard"
                data-admin-route="/admin/dashboard"
                class="${
                    isDashboard
                        ? 'active'
                        : ''
                }"
            >
                Dashboard
            </a>


            <!-- ==================================
                 ENQUIRIES
                 ================================== -->

            <a
                href="/admin/enquiries"
                data-admin-route="/admin/enquiries"
                class="${
                    isEnquiries
                        ? 'active'
                        : ''
                }"
            >
                Enquiries
            </a>


            <!-- ==================================
                 ORDERS
                 ================================== -->

            <a
                href="/admin/orders"
                data-admin-route="/admin/orders"
                class="${
                    isOrders
                        ? 'active'
                        : ''
                }"
            >
                Orders
            </a>


            <!-- ==================================
                 UPCOMING EVENTS
                 ================================== -->

            <a
                href="/admin/upcoming-events"
                data-admin-route="/admin/upcoming-events"
                class="${
                    isUpcomingEvents
                        ? 'active'
                        : ''
                }"
            >
                Upcoming Events
            </a>


            <!-- ==================================
                 CUSTOMERS
                 ================================== -->

            <a
                href="/admin/customers"
                data-admin-route="/admin/customers"
                class="${
                    isCustomers
                        ? 'active'
                        : ''
                }"
            >
                Customers
            </a>
            
        </nav>

    `;

}


// ==========================================
// INITIALIZE ADMIN NAVIGATION
// ==========================================

export function initializeAdminNavigation() {

    const navigation =
        document.querySelector(
            '.admin-navigation'
        );


    if (!navigation) {
        return;
    }


    navigation
        .querySelectorAll(
            '[data-admin-route]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    'click',
                    event => {

                        const route =
                            link.dataset.adminRoute;


                        if (!route) {
                            return;
                        }


                        if (
                            !route.startsWith(
                                '/admin/'
                            )
                        ) {

                            return;

                        }


                        event.preventDefault();


                        window.location.href =
                            route;

                    }
                );

            }
        );

}
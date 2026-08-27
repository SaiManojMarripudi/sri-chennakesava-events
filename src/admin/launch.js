// ==========================================
// WEBSITE LAUNCH CONTROL
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// RENDER LAUNCH PAGE
// ==========================================

export function renderLaunch() {

    return `

        <div class="admin-launch-page">

            <main class="admin-dashboard-main">

                <!-- ==================================
                     PAGE HEADING
                     ================================== -->

                <section class="admin-page-heading">

                    <div>

                        <h2>
                            Website Launch Control
                        </h2>

                        <p>
                            Launch the public SRI CHENNAKESAVA EVENTS website.
                        </p>

                    </div>

                </section>


                <!-- ==================================
                     LAUNCH CONTROL
                     ================================== -->

                <section class="admin-dashboard-section">

                    <div
                        class="admin-launch-card"
                        id="launch-control-card"
                    >

                        <div
                            id="launch-status"
                            class="admin-launch-status"
                        >
                            Checking website status...
                        </div>


                        <div
                            id="launch-content"
                            class="admin-launch-content"
                        >

                            <div
                                class="admin-launch-icon"
                            >
                                🚀
                            </div>


                            <h3>
                                Website is Private
                            </h3>


                            <p>
                                The public website is currently
                                unavailable.
                            </p>


                            <button
                                type="button"
                                id="launch-website-button"
                                class="admin-launch-button"
                            >
                                🚀 Launch Website
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    `;

}


// ==========================================
// INITIALIZE LAUNCH PAGE
// ==========================================

export function initializeLaunch() {

    console.log(
        'LAUNCH PAGE INITIALIZED'
    );

    console.log(
        'LAUNCH TOKEN EXISTS:',
        Boolean(
            sessionStorage.getItem(
                'sce_admin_token'
            )
        )
    );

    const token =
        getAdminToken();

    console.log(
        'LAUNCH ADMIN FETCH:',
        endpoint,
        'TOKEN:',
        Boolean(token)
    );

    if (!token) {

        window.location.href =
            '/admin';

        return;

    }


    loadLaunchStatus();

}


// ==========================================
// LOAD LAUNCH STATUS
// ==========================================

async function loadLaunchStatus() {

    try {

        const result =
            await adminFetch(
                '/api/launch/status'
            );


        const launch =
            result.launch;


        updateLaunchUI(
            launch
        );

    } catch (error) {

        console.error(
            'Unable to load launch status:',
            error
        );


        const status =
            document.getElementById(
                'launch-status'
            );


        if (status) {

            status.textContent =
                error.message ||
                'Unable to load website status.';

        }

    }

}


// ==========================================
// UPDATE LAUNCH UI
// ==========================================

function updateLaunchUI(
    launch
) {

    const statusElement =
        document.getElementById(
            'launch-status'
        );


    const content =
        document.getElementById(
            'launch-content'
        );


    if (
        !statusElement ||
        !content
    ) {

        return;

    }


    if (
        launch.status === 'LIVE'
    ) {

        statusElement.textContent =
            '🌐 Website is LIVE';


        content.innerHTML = `

            <div
                class="admin-launch-live"
            >

                <div
                    class="admin-launch-live-icon"
                >
                    ✨
                </div>


                <h3>
                    SRI CHENNAKESAVA EVENTS
                    IS LIVE
                </h3>


                <p>
                    Your website is now available
                    to the public.
                </p>

            </div>

        `;


        return;

    }


    if (
        launch.status === 'LAUNCHING'
    ) {

        statusElement.textContent =
            '🚀 Website Launching...';


        content.innerHTML = `

            <div
                class="admin-launch-countdown"
            >

                <div
                    id="launch-countdown-number"
                >
                    10
                </div>


                <p>
                    GET READY
                </p>

            </div>

        `;


        return;

    }


    statusElement.textContent =
        '🔒 Website is PRIVATE';


    content.innerHTML = `

        <div
            class="admin-launch-icon"
        >
            🚀
        </div>


        <h3>
            Website is Private
        </h3>


        <p>
            The public website is currently
            unavailable.
        </p>


        <button
            type="button"
            id="launch-website-button"
            class="admin-launch-button"
        >
            🚀 Launch Website
        </button>

    `;


    const launchButton =
        document.getElementById(
            'launch-website-button'
        );


    if (launchButton) {

        launchButton.addEventListener(
            'click',
            startLaunch
        );

    }

}


// ==========================================
// START WEBSITE LAUNCH
// ==========================================

async function startLaunch() {

    const launchButton =
        document.getElementById(
            'launch-website-button'
        );


    if (launchButton) {

        launchButton.disabled = true;

    }


    try {

        const result =
            await adminFetch(
                '/api/launch/start',
                {
                    method: 'POST'
                }
            );


        startCountdown(
            result.launch_started_at
        );

    } catch (error) {

        console.error(
            'Unable to start website launch:',
            error
        );


        alert(
            error.message ||
            'Unable to start website launch.'
        );


        if (launchButton) {

            launchButton.disabled =
                false;

        }

    }

}


// ==========================================
// START COUNTDOWN
// ==========================================

function startCountdown(
    launchStartedAt
) {

    let secondsRemaining =
        10;


    const numberElement =
        document.getElementById(
            'launch-countdown-number'
        );


    if (!numberElement) {

        return;

    }


    const interval =
        setInterval(
            async () => {

                secondsRemaining--;


                numberElement.textContent =
                    String(
                        Math.max(
                            secondsRemaining,
                            0
                        )
                    );


                if (
                    secondsRemaining <= 0
                ) {

                    clearInterval(
                        interval
                    );


                    await completeLaunch();

                }

            },
            1000
        );

}


// ==========================================
// COMPLETE LAUNCH
// ==========================================

async function completeLaunch() {

    try {

        const result =
            await adminFetch(
                '/api/launch/complete',
                {
                    method: 'POST'
                }
            );


        updateLaunchUI({

            status:
                result.status

        });

    } catch (error) {

        console.error(
            'Unable to complete website launch:',
            error
        );


        alert(
            error.message ||
            'Unable to complete website launch.'
        );

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

                ...options,

                headers: {

                    ...(options.headers || {}),

                    Authorization:
                        `Bearer ${token}`

                }

            }
        );
    console.log(
        'LAUNCH API RESPONSE:',
        endpoint,
        response.status
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
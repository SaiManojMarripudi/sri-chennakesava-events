// ==========================================
// ADMIN LOGIN
// ==========================================

import {
    API_BASE_URL
} from '../config/api.js';


// ==========================================
// RENDER LOGIN
// ==========================================

export function renderAdminLogin() {

    return `
        <div class="admin-login-page">

            <div class="admin-login-card">

                <div class="admin-login-logo">
                    <img
                        src="/logo/sce-logo.png"
                        alt="SRI CHENNAKESAVA EVENTS"
                    >
                </div>

                <div class="admin-login-header">

                    <h1>
                        Admin Login
                    </h1>

                    <p>
                        SRI CHENNAKESAVA EVENTS
                    </p>

                </div>


                <form
                    id="admin-login-form"
                    class="admin-login-form"
                >

                    <div class="admin-form-group">

                        <label for="admin-email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="admin-email"
                            name="email"
                            placeholder="Enter your email"
                            autocomplete="email"
                            required
                        >

                    </div>


                    <div class="admin-form-group">

                        <label for="admin-password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="admin-password"
                            name="password"
                            placeholder="Enter your password"
                            autocomplete="current-password"
                            required
                        >

                    </div>


                    <div
                        id="admin-login-error"
                        class="admin-login-message"
                        hidden
                    ></div>


                    <button
                        type="submit"
                        class="admin-login-button"
                    >
                        Login
                    </button>

                </form>


                <div class="admin-login-footer">

                    <span>
                        SRI CHENNAKESAVA EVENTS
                    </span>

                </div>

            </div>

        </div>
    `;
}


// ==========================================
// INITIALIZE LOGIN
// ==========================================

export function initializeAdminLogin() {

    const loginForm =
        document.getElementById(
            'admin-login-form'
        );

    if (!loginForm) {
        return;
    }


    const emailInput =
        document.getElementById(
            'admin-email'
        );

    const passwordInput =
        document.getElementById(
            'admin-password'
        );

    const errorMessage =
        document.getElementById(
            'admin-login-error'
        );

    const loginButton =
        loginForm.querySelector(
            '.admin-login-button'
        );


    // ======================================
    // FORM SUBMISSION
    // ======================================

    loginForm.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ==================================
            // CLEAR PREVIOUS ERROR
            // ==================================

            errorMessage.textContent = '';

            errorMessage.hidden = true;


            // ==================================
            // VALIDATE
            // ==================================

            if (!email || !password) {

                errorMessage.textContent =
                    'Email and password are required.';

                errorMessage.hidden = false;

                return;
            }


            // ==================================
            // DISABLE BUTTON
            // ==================================

            loginButton.disabled = true;

            loginButton.textContent =
                'Signing in...';


            try {

                // ==================================
                // LOGIN REQUEST
                // ==================================

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/login`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const result =
                    await response.json();


                // ==================================
                // SERVER ERROR
                // ==================================

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        'Unable to login.'
                    );

                }


                // ==================================
                // VERIFY TOKEN
                // ==================================

                if (!result.token) {

                    throw new Error(
                        'Authentication token was not received.'
                    );

                }


                // ==================================
                // STORE AUTHENTICATION DATA
                // ==================================

                sessionStorage.setItem(
                    'sce_admin_token',
                    result.token
                );

                sessionStorage.setItem(
                    'sce_admin',
                    JSON.stringify(
                        result.admin
                    )
                );


                // ==================================
                // OPEN DASHBOARD
                // ==================================

                window.location.href =
                    '/admin/dashboard';


            } catch (error) {

                console.error(
                    'Admin login error:',
                    error
                );


                errorMessage.textContent =
                    error.message ||
                    'Unable to login right now.';


                errorMessage.hidden = false;


                loginButton.disabled = false;

                loginButton.textContent =
                    'Login';

            }

        }
    );

}
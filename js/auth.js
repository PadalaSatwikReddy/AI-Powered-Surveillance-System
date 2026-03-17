// js/auth.js

// Hardcoded Authorized Users
const AUTHORIZED_USERS = ['satwik', 'ganesh', 'siva', 'jaswanth'];
const MASTER_PASSCODE = 'admin';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('loginError');

    // Simple security check to redirect if already logged in
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        if (localStorage.getItem('smartSurveil_User')) {
            window.location.href = 'dashboard.html';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            // Input Validation
            if (!username || !password) {
                showError('Please fill in all fields.');
                return;
            }

            // Auth Check
            if (AUTHORIZED_USERS.includes(username) && password === MASTER_PASSCODE) {
                // Success

                // Capitalize first letter for display
                const displayUser = username.charAt(0).toUpperCase() + username.slice(1);

                // Log to mock database
                logLoginEvent(displayUser);

                // Setup Session
                localStorage.setItem('smartSurveil_User', displayUser);
                localStorage.setItem('smartSurveil_LoginTime', new Date().toISOString());

                // Redirect with visual feedback
                const btn = loginForm.querySelector('button');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>AUTHENTICATING...</span>';
                btn.style.background = 'var(--accent-green)';
                btn.style.boxShadow = '0 0 15px var(--accent-green)';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);

            } else {
                // Failure
                showError('ACCESS DENIED: Invalid Credentials');

                // Visual glitch effect
                const container = document.querySelector('.login-container');
                container.classList.add('glow-red');
                setTimeout(() => {
                    container.classList.remove('glow-red');
                }, 500);
            }
        });
    }
});

function showError(msg) {
    const errorMsg = document.getElementById('loginError');
    errorMsg.textContent = msg;
    // Shake animation or highlight could be added here
}

// Function to log login events to Firebase Realtime Database
function logLoginEvent(user) {
    const eventLog = {
        time: new Date().toLocaleTimeString(),
        type: 'SYSTEM_LOGIN',
        location: 'SYS_MAIN',
        user: user,
        severity: 'info',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    firebase.database().ref('logs').push(eventLog);
    console.log("Logged login activity to Firebase for:", user);
}

// Global Auth Check for dashboard pages
function requireAuth() {
    const user = localStorage.getItem('smartSurveil_User');
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

// Global Logout function
function logout() {
    localStorage.removeItem('smartSurveil_User');
    localStorage.removeItem('smartSurveil_LoginTime');
    window.location.href = 'index.html';
}

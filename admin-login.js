// Admin login page JavaScript
let adminCredentials = {};
let regularUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'admin-dashboard.html';
        return;
    }
    loadAdminCredentials();
    loadRegularUsers();
});

function loadAdminCredentials() {
    const credentialPath = window.location.pathname.toLowerCase().includes('/admin/') ? '../config/admin-credentials.json' : 'config/admin-credentials.json';
    fetch(credentialPath)
        .then(response => response.json())
        .then(data => {
            const savedAdmins = JSON.parse(localStorage.getItem('adminCredentials') || 'null');
            adminCredentials = savedAdmins || data;
            if (savedAdmins) {
                adminCredentials = {...data, ...savedAdmins};
            }
        })
        .catch(error => {
            console.error('Error loading admin credentials:', error);
            adminCredentials = {
                "admin": {
                    "username": "admin",
                    "password": "admin123",
                    "email": "admin@cheeseboy.com"
                },
                "superadmin": {
                    "username": "superadmin",
                    "password": "super123",
                    "email": "superadmin@cheeseboy.com"
                }
            };
        });
}

function loadRegularUsers() {
    const savedUsers = JSON.parse(localStorage.getItem('regularUsers') || 'null');
    if (savedUsers && savedUsers.length) {
        regularUsers = savedUsers;
    } else {
        regularUsers = [
            {
                id: 'u1',
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@example.com',
                password: 'alice123',
                joinDate: '2024-01-10T00:00:00Z',
                status: 'active'
            },
            {
                id: 'u2',
                firstName: 'Bob',
                lastName: 'Smith',
                email: 'bob@example.com',
                password: 'bob123',
                joinDate: '2024-01-12T00:00:00Z',
                status: 'active'
            },
            {
                id: 'u3',
                firstName: 'Carol',
                lastName: 'Williams',
                email: 'carol@example.com',
                password: 'carol123',
                joinDate: '2024-01-14T00:00:00Z',
                status: 'inactive'
            }
        ];
        localStorage.setItem('regularUsers', JSON.stringify(regularUsers));
    }
}

function showTab(tabName, evt) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');

    const activeButton = Array.from(buttons).find(btn => btn.dataset.tab === tabName);
    if (activeButton) activeButton.classList.add('active');
}

// Login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value.trim();
        const password = this.querySelector('input[type="password"]').value.trim();

        if (!email || !password) {
            alert('Please fill in both email and password.');
            return;
        }

        const adminEntry = Object.values(adminCredentials).find(creds => creds.email === email && creds.password === password);
        if (adminEntry) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminEmail', email);
            sessionStorage.setItem('adminUsername', adminEntry.username || adminEntry.email);
            logAdminLogin(email, adminEntry.username || adminEntry.email);
            window.location.href = 'admin-dashboard.html';
            return;
        }

        const userEntry = regularUsers.find(user => user.email === email && user.password === password);
        if (userEntry) {
            sessionStorage.setItem('userLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', `${userEntry.firstName} ${userEntry.lastName}`);
            alert('Regular user login detected. Redirecting to account page.');
            window.location.href = 'account.html';
            return;
        }

        alert('Invalid credentials. Please check whether you are signing in as admin or customer.');
    });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Admin signup is not available. Please contact system administrator.');
    });
}

function logAdminLogin(email, username) {
    const now = new Date();
    const loginLog = {
        timestamp: now.toISOString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        email: email,
        username: username,
        deviceInfo: navigator.userAgent,
        location: null // Will be updated if geolocation is granted
    };

    // Request geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                loginLog.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                saveLoginLog(loginLog);
            },
            function(error) {
                console.log('Geolocation error:', error.message);
                saveLoginLog(loginLog);
            },
            { timeout: 10000 }
        );
    } else {
        saveLoginLog(loginLog);
    }
}

function saveLoginLog(loginLog) {
    const logs = JSON.parse(localStorage.getItem('adminLoginLogs') || '[]');
    logs.push(loginLog);
    localStorage.setItem('adminLoginLogs', JSON.stringify(logs));
}
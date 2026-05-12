// Account page JavaScript

let adminCredentials = {
    admin: { username: 'admin', email: 'admin@cheeseboy.com', password: 'admin123' },
    superadmin: { username: 'superadmin', email: 'superadmin@cheeseboy.com', password: 'super123' }
};

document.addEventListener('DOMContentLoaded', function() {
    loadAdminCredentials();
    setupAccountPage();
});

function setupAccountPage() {
    const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
    const profileTabButton = document.getElementById('profile-tab-button');

    if (isLoggedIn) {
        profileTabButton.style.display = 'inline-block';
        showTab('profile');
        renderUserProfile();
    } else {
        profileTabButton.style.display = 'none';
        showTab('login');
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const saveBtn = document.getElementById('profile-save-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (saveBtn) saveBtn.addEventListener('click', handleSaveProfileSettings);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');

    const button = Array.from(document.querySelectorAll('.tab-button')).find(btn => btn.dataset.tab === tabName);
    if (button) button.classList.add('active');

    updateSignupCategoryLinks(tabName);
}

function updateSignupCategoryLinks(activeTab) {
    const categoryLinks = Array.from(document.querySelectorAll('nav ul li a'))
        .filter(link => ['women.html', 'men.html', 'kids.html', 'beauty.html'].includes(link.getAttribute('href')));

    categoryLinks.forEach(link => {
        const parent = link.parentElement;
        if (!parent) return;
        parent.style.display = activeTab === 'signup' ? 'none' : '';
    });
}

function loadAdminCredentials() {
    fetch('config/admin-credentials.json')
        .then(response => response.json())
        .then(data => {
            const savedAdmins = JSON.parse(localStorage.getItem('adminCredentials') || 'null');
            adminCredentials = savedAdmins || data;
            if (savedAdmins) {
                adminCredentials = { ...data, ...savedAdmins };
            }
        })
        .catch(() => {
            adminCredentials = {
                admin: { username: 'admin', email: 'admin@cheeseboy.com', password: 'admin123' },
                superadmin: { username: 'superadmin', email: 'superadmin@cheeseboy.com', password: 'super123' }
            };
        });
}

function handleLogin(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value.trim();

    const adminEntry = Object.values(adminCredentials).find(creds => creds.email === email && creds.password === password);
    if (adminEntry) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminEmail', adminEntry.email);
        sessionStorage.setItem('adminUsername', adminEntry.username || adminEntry.email);
        window.location.href = 'admin-dashboard.html';
        return;
    }

    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');
    const userEntry = regularUsers.find(user => user.email === email && user.password === password);

    if (userEntry) {
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userEmail', userEntry.email);
        sessionStorage.setItem('userName', `${userEntry.firstName} ${userEntry.lastName}`);
        sessionStorage.setItem('userStatus', userEntry.status || 'active');
        window.location.href = 'account.html';
        return;
    }

    alert('Invalid user credentials. Please try again.');
}

function handleSignup(e) {
    e.preventDefault();
    const form = this;
    const firstName = form.querySelector('input[type="text"]').value.trim();
    const lastName = form.querySelectorAll('input[type="text"]')[1].value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value.trim();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('Please complete all sign-up fields.');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');
    if (regularUsers.some(user => user.email === email) || Object.values(adminCredentials).some(creds => creds.email === email)) {
        alert('A user with this email already exists.');
        return;
    }

    const newUser = {
        id: `u${Date.now()}`,
        firstName,
        lastName,
        email,
        password,
        joinDate: new Date().toISOString(),
        status: 'active'
    };
    regularUsers.push(newUser);
    localStorage.setItem('regularUsers', JSON.stringify(regularUsers));

    sessionStorage.setItem('userLoggedIn', 'true');
    sessionStorage.setItem('userEmail', newUser.email);
    sessionStorage.setItem('userName', `${newUser.firstName} ${newUser.lastName}`);
    sessionStorage.setItem('userStatus', newUser.status);
    window.location.href = 'account.html';
}

function renderUserProfile() {
    const name = sessionStorage.getItem('userName') || 'User';
    const email = sessionStorage.getItem('userEmail') || 'user@example.com';
    const status = sessionStorage.getItem('userStatus') || 'active';

    const nameField = document.getElementById('profile-name');
    const emailField = document.getElementById('profile-email');
    const statusField = document.getElementById('profile-status');

    if (nameField) nameField.textContent = name;
    if (emailField) emailField.textContent = email;
    if (statusField) statusField.textContent = status;

    const settings = getUserSettings(email);
    document.getElementById('profile-setting-notifications').checked = settings.notifications || false;
    document.getElementById('profile-setting-emails').checked = settings.emails || false;
    document.getElementById('profile-setting-darkmode').checked = settings.darkMode || false;
}

function handleSaveProfileSettings(e) {
    e.preventDefault();
    const email = sessionStorage.getItem('userEmail');
    if (!email) return;

    const settings = {
        notifications: document.getElementById('profile-setting-notifications')?.checked || false,
        emails: document.getElementById('profile-setting-emails')?.checked || false,
        darkMode: document.getElementById('profile-setting-darkmode')?.checked || false
    };
    saveUserSettings(email, settings);
    alert('Profile settings saved.');
}

function handleLogout(e) {
    e.preventDefault();
    sessionStorage.removeItem('userLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userStatus');
    window.location.href = 'account.html';
}

function getUserSettings(email) {
    const allSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    return allSettings[email] || {};
}

function saveUserSettings(email, settings) {
    const allSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    allSettings[email] = settings;
    localStorage.setItem('userSettings', JSON.stringify(allSettings));
}

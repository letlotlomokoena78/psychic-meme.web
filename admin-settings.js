// Admin settings page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminLogin()) return;
    renderAdminSettings();
});

function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'account.html';
        return false;
    }
    return true;
}

function renderAdminSettings() {
    const username = sessionStorage.getItem('adminUsername') || 'Admin';
    const email = sessionStorage.getItem('adminEmail') || 'admin@cheeseboy.com';

    const infoPanel = document.getElementById('admin-info');
    const usernameField = document.getElementById('settings-username');
    const emailField = document.getElementById('settings-email');

    if (infoPanel) {
        infoPanel.innerHTML = `
            <p><strong>Logged in as:</strong> ${username}</p>
            <p><strong>Email:</strong> ${email}</p>
        `;
    }

    if (usernameField) usernameField.textContent = username;
    if (emailField) emailField.textContent = email;

    const notifications = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    document.getElementById('setting-notifications').checked = notifications.notificationsEnabled || false;
    document.getElementById('setting-email-reports').checked = notifications.emailReportsEnabled || false;

    document.getElementById('setting-notifications')?.addEventListener('change', saveAdminSettings);
    document.getElementById('setting-email-reports')?.addEventListener('change', saveAdminSettings);
    document.getElementById('change-password-btn')?.addEventListener('click', handleChangePassword);
}

function saveAdminSettings() {
    const settings = {
        notificationsEnabled: document.getElementById('setting-notifications')?.checked || false,
        emailReportsEnabled: document.getElementById('setting-email-reports')?.checked || false
    };
    localStorage.setItem('adminSettings', JSON.stringify(settings));
}

function handleChangePassword() {
    alert('Password change is not supported in this demo. Please contact your system administrator for assistance.');
}

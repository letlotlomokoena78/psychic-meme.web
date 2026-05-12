// Admin dashboard JavaScript

function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'account.html';
        return false;
    }
    return true;
}

function displayAdminInfo() {
    const adminUsername = sessionStorage.getItem('adminUsername') || 'Admin';
    const adminEmail = sessionStorage.getItem('adminEmail') || '';

    const adminInfo = document.getElementById('admin-info');
    if (adminInfo) {
        adminInfo.innerHTML = `
            <p><strong>Logged in as:</strong> ${adminUsername}</p>
            <p><strong>Email:</strong> ${adminEmail}</p>
        `;
    }
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-btn');
    if (!logoutButton) return;
    logoutButton.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('adminUsername');
        window.location.href = 'account.html';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminLogin()) return;
    displayAdminInfo();
    setupLogoutButton();
});
document.addEventListener('DOMContentLoaded', function() {
    const skipPages = ['account.html', 'account.html', 'seller-login.html', 'third-party-login.html'];
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments.length ? pathSegments[pathSegments.length - 1].toLowerCase() : 'index.html';
    const isAdminArea = window.location.pathname.toLowerCase().includes('/admin/');

    if (skipPages.includes(currentPage)) {
        return;
    }

    const userLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (!userLoggedIn && !adminLoggedIn) {
        window.location.href = isAdminArea ? '../account.html' : 'account.html';
    }
});

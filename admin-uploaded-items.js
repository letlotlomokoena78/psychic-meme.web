// Admin uploaded items review JavaScript

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    displayAdminInfo();
    loadUploadedItems();
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
});

function checkAdminLogin() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'account.html';
    }
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

function getUploadedItems() {
    const adminProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const sellerProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');

    return [
        ...adminProducts.map(item => ({ ...item, source: 'Admin' })),
        ...sellerProducts.map(item => ({ ...item, source: 'Seller' }))
    ];
}

function loadUploadedItems() {
    const items = getUploadedItems();
    const info = document.getElementById('uploaded-items-count');
    const grid = document.getElementById('uploaded-items-grid');

    if (info) {
        info.innerHTML = `<p><strong>Total uploaded items:</strong> ${items.length}</p>`;
    }

    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = '<p>No uploaded items are available yet.</p>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="uploaded-item-card">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/250x300?text=No+Image'">
            <div class="uploaded-item-info">
                <h4>${item.name}</h4>
                <p><strong>Category:</strong> ${item.category || 'General'}</p>
                <p><strong>Type:</strong> ${item.productType || 'General'}</p>
                <p><strong>Price:</strong> ${localStorage.getItem('userCurrencySymbol') || '$'}${parseFloat(item.price || 0).toFixed(2)}</p>
                <p><strong>Source:</strong> ${item.source}</p>
                ${item.sellerEmail ? `<p><strong>Seller:</strong> ${item.sellerEmail}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminUsername');
    window.location.href = 'account.html';
}

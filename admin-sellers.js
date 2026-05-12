// Admin seller management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadSellerAccounts();
});

function getStoredSellers() {
    return JSON.parse(localStorage.getItem('sellers') || '[]');
}

function saveSellers(sellers) {
    localStorage.setItem('sellers', JSON.stringify(sellers));
}

function loadSellerAccounts() {
    const sellers = getStoredSellers();
    const totalSellers = sellers.length;
    const approved = sellers.filter(s => s.status === 'approved').length;
    const pending = sellers.filter(s => s.status === 'pending').length;

    document.getElementById('total-sellers').textContent = totalSellers;
    document.getElementById('approved-sellers').textContent = approved;
    document.getElementById('pending-sellers').textContent = pending;
    displaySellerAccounts(sellers);
}

function displaySellerAccounts(sellers) {
    const sellerAccountsList = document.getElementById('seller-accounts-list');

    if (!sellerAccountsList) return;
    if (sellers.length === 0) {
        sellerAccountsList.innerHTML = '<p>No seller accounts found.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Interest</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    sellers.forEach(seller => {
        tableHTML += `
            <tr>
                <td>${seller.company}</td>
                <td>${seller.email}</td>
                <td>${seller.category}</td>
                <td>${seller.interestRate}%</td>
                <td>${seller.status}</td>
                <td>
                    ${seller.status === 'pending' ? `<button onclick="approveSeller('${seller.id}')" class="upload-btn">Approve</button>` : ''}
                    <button onclick="deleteSeller('${seller.id}')" class="delete-btn">Remove</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    sellerAccountsList.innerHTML = tableHTML;
}

function approveSeller(sellerId) {
    const sellers = getStoredSellers();
    const index = sellers.findIndex(s => s.id === sellerId);
    if (index === -1) return;

    sellers[index].status = 'approved';
    saveSellers(sellers);
    loadSellerAccounts();
    alert('Seller approved successfully.');
}

function deleteSeller(sellerId) {
    if (!confirm('Delete this seller account?')) return;
    const sellers = getStoredSellers();
    const filtered = sellers.filter(s => s.id !== sellerId);
    saveSellers(filtered);
    loadSellerAccounts();
    alert('Seller account removed.');
}

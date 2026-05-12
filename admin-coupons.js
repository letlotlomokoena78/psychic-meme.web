// Admin coupon management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadCoupons();
    setupCouponForm();
});

function setupCouponForm() {
    const form = document.getElementById('add-coupon-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addCoupon();
        });
    }
}

function addCoupon() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const discount = parseFloat(document.getElementById('coupon-discount').value);
    const expiry = document.getElementById('coupon-expiry').value;
    const usageLimit = parseInt(document.getElementById('coupon-usage-limit').value) || 1;

    if (!code || isNaN(discount) || !expiry) {
        alert('Please fill in all required fields.');
        return;
    }

    const coupons = getStoredCoupons();
    if (coupons.some(c => c.code === code)) {
        alert('Coupon code already exists.');
        return;
    }

    coupons.push({
        id: `coupon-${Date.now()}`,
        code,
        discount,
        expiry,
        usageLimit,
        used: 0
    });

    saveCoupons(coupons);
    document.getElementById('add-coupon-form').reset();
    loadCoupons();
    alert('Coupon created successfully.');
}

function getStoredCoupons() {
    return JSON.parse(localStorage.getItem('coupons') || '[]');
}

function saveCoupons(coupons) {
    localStorage.setItem('coupons', JSON.stringify(coupons));
}

function loadCoupons() {
    const coupons = getStoredCoupons();
    const couponsList = document.getElementById('coupons-list');

    if (!couponsList) return;

    if (coupons.length === 0) {
        couponsList.innerHTML = '<p>No coupons created yet.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Expiry</th>
                    <th>Usage</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    coupons.forEach(coupon => {
        tableHTML += `
            <tr>
                <td>${coupon.code}</td>
                <td>${coupon.discount}%</td>
                <td>${new Date(coupon.expiry).toLocaleDateString()}</td>
                <td>${coupon.used}/${coupon.usageLimit}</td>
                <td>
                    <button onclick="deleteCoupon('${coupon.id}')" class="delete-btn">Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    couponsList.innerHTML = tableHTML;
}

function deleteCoupon(couponId) {
    if (!confirm('Delete this coupon?')) return;
    const coupons = getStoredCoupons();
    const filtered = coupons.filter(c => c.id !== couponId);
    saveCoupons(filtered);
    loadCoupons();
    alert('Coupon deleted.');
}

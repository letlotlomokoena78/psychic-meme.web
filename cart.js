// Cart page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    document.getElementById('apply-coupon-btn')?.addEventListener('click', applyCoupon);
    document.getElementById('checkout-btn')?.addEventListener('click', checkoutCart);
    renderReceipt();
});

function renderCart() {
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const coupon = JSON.parse(localStorage.getItem('cartCoupon') || 'null');
    const cartItemsWrapper = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const shippingElement = document.getElementById('cart-shipping');
    const totalElement = document.getElementById('cart-total');
    const couponMessage = document.getElementById('coupon-message');
    const currencySymbol = localStorage.getItem('userCurrencySymbol') || '$';

    if (!cartItemsWrapper) return;

    if (items.length === 0) {
        cartItemsWrapper.innerHTML = '<p>Your cart is empty.</p>';
        subtotalElement.textContent = `${currencySymbol}0.00`;
        taxElement.textContent = `${currencySymbol}0.00`;
        shippingElement.textContent = `${currencySymbol}0.00`;
        totalElement.textContent = `${currencySymbol}0.00`;
        if (couponMessage) couponMessage.textContent = '';
        updateCartCount();
        return;
    }

    cartItemsWrapper.innerHTML = '';
    let subtotal = 0;

    items.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${currencySymbol}${item.price.toFixed(2)} x ${quantity}</p>
                <p>Item total: ${currencySymbol}${itemTotal.toFixed(2)}</p>
                <button onclick="removeCartItem(${index})" class="delete-btn">Remove</button>
            </div>
        `;
        cartItemsWrapper.appendChild(cartItem);
    });

    const shipping = items.length > 0 ? 5.00 : 0.00;
    const discountRate = coupon?.discount || 0;
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.05;
    const total = discountedSubtotal + tax + shipping;

    subtotalElement.textContent = `${currencySymbol}${discountedSubtotal.toFixed(2)}`;
    taxElement.textContent = `${currencySymbol}${tax.toFixed(2)}`;
    shippingElement.textContent = `${currencySymbol}${shipping.toFixed(2)}`;
    totalElement.textContent = `${currencySymbol}${total.toFixed(2)}`;

    if (couponMessage) {
        couponMessage.textContent = coupon ? `Coupon ${coupon.code} applied. You saved ${currencySymbol}${discountAmount.toFixed(2)}.` : '';
    }
    updateCartCount();
}

function removeCartItem(index) {
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    items.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(items));
    renderCart();
    updateCartCount();
}

function applyCoupon() {
    const code = document.getElementById('coupon-code')?.value.trim();
    const couponMessage = document.getElementById('coupon-message');

    if (!code) {
        if (couponMessage) couponMessage.textContent = 'Please enter a coupon code.';
        return;
    }

    const validCoupons = {
        CHEESE10: 0.10,
        GOLD15: 0.15,
        SELLER5: 0.05
    };

    const discount = validCoupons[code.toUpperCase()];
    if (!discount) {
        localStorage.removeItem('cartCoupon');
        renderCart();
        if (couponMessage) couponMessage.textContent = 'Invalid coupon code.';
        return;
    }

    localStorage.setItem('cartCoupon', JSON.stringify({ code: code.toUpperCase(), discount }));
    renderCart();
    updateCartCount();

    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const discountAmount = subtotal * discount;

    if (couponMessage) couponMessage.textContent = `Coupon applied. You saved $${discountAmount.toFixed(2)}.`;
}

function checkoutCart() {
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (items.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    const userEmail = sessionStorage.getItem('userEmail') || prompt('Enter your email address for receipt:');
    if (!userEmail) {
        alert('Email is required for receipt delivery.');
        return;
    }

    const coupon = JSON.parse(localStorage.getItem('cartCoupon') || 'null');
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const discountRate = coupon?.discount || 0;
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    const shipping = items.length > 0 ? 5.00 : 0.00;
    const tax = discountedSubtotal * 0.05;
    const total = discountedSubtotal + tax + shipping;
    const receipt = {
        id: `R-${Date.now()}`,
        date: new Date().toLocaleString(),
        email: userEmail,
        coupon: coupon?.code || null,
        discountAmount: discountAmount.toFixed(2),
        items,
        subtotal: discountedSubtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2)
    };

    localStorage.setItem('latestReceipt', JSON.stringify(receipt));
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCoupon');
    renderCart();
    updateCartCount();
    renderReceipt();
    sendReceiptEmail(receipt);
    alert('Purchase complete! Receipt has been generated and queued for email delivery.');
}

function renderReceipt() {
    const receiptText = document.getElementById('receipt-content');
    const receipt = JSON.parse(localStorage.getItem('latestReceipt') || 'null');
    if (!receipt) {
        if (receiptText) receiptText.textContent = 'No receipt generated yet.';
        return;
    }

    const lines = [`Receipt ID: ${receipt.id}`, `Date: ${receipt.date}`, `Email: ${receipt.email}`, '', 'Items:'];
    receipt.items.forEach(item => {
        const quantity = item.quantity || 1;
        lines.push(`- ${item.name} ($${item.price.toFixed(2)} x ${quantity}) = $${(item.price * quantity).toFixed(2)}`);
    });
    lines.push('', `Subtotal: $${receipt.subtotal}`, `Tax: $${receipt.tax}`, `Shipping: $${receipt.shipping}`, `Total: $${receipt.total}`);

    receiptText.textContent = lines.join('\n');
}

function sendReceiptEmail(receipt) {
    const subject = encodeURIComponent('Your Cheeseboy Fashion Receipt');
    const body = encodeURIComponent(`Hello,\n\nThank you for your purchase. Here is your receipt:\n\nReceipt ID: ${receipt.id}\nDate: ${receipt.date}\n\nItems:\n${receipt.items.map(item => `- ${item.name} ($${item.price.toFixed(2)} x ${item.quantity || 1})`).join('\n')}\n\nSubtotal: $${receipt.subtotal}\nTax: $${receipt.tax}\nShipping: $${receipt.shipping}\nTotal: $${receipt.total}\n\nIf you have any questions, reply to this email.\n\nBest,\nCheeseboy Fashion`);
    window.location.href = `mailto:${receipt.email}?subject=${subject}&body=${body}`;
}

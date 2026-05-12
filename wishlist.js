// Wishlist page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
});

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadWishlist() {
    const wishlist = getWishlist();
    const wishlistItems = document.getElementById('wishlist-items');

    if (!wishlistItems) return;

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    wishlistItems.innerHTML = '';

    wishlist.forEach(item => {
        const productCard = document.createElement('div');
        productCard.className = 'product';
        productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/250x300?text=No+Image'">
            <h4>${item.name}</h4>
            <p>${item.price}</p>
            <button onclick="addToCartFromWishlist('${item.id}')">Add to Cart</button>
            <button onclick="removeFromWishlist('${item.id}')" class="remove-btn">Remove</button>
        `;
        wishlistItems.appendChild(productCard);
    });
}

function addToCartFromWishlist(itemId) {
    const wishlist = getWishlist();
    const item = wishlist.find(i => i.id === itemId);
    if (!item) return;

    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    cart.push({...item, quantity: 1});
    localStorage.setItem('cartItems', JSON.stringify(cart));
    alert(`${item.name} added to cart.`);
    updateCartCount();
}

function removeFromWishlist(itemId) {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(i => i.id !== itemId);
    saveWishlist(filtered);
    loadWishlist();
    alert('Item removed from wishlist.');
}

// Function to add to wishlist from product pages (to be called from other scripts)
function addToWishlist(product) {
    const wishlist = getWishlist();
    if (wishlist.some(i => i.id === product.id)) {
        alert('Item already in wishlist.');
        return;
    }
    wishlist.push(product);
    saveWishlist(wishlist);
    alert(`${product.name} added to wishlist.`);
}

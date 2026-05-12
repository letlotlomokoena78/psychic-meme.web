// Sales page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadSales();
});

function loadSales() {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const salesGrid = document.getElementById('sales-grid');

    if (sales.length === 0) {
        salesGrid.innerHTML = '<p>No sales available at the moment.</p>';
        return;
    }

    salesGrid.innerHTML = '';

    sales.forEach((sale, index) => {
        const saleCard = document.createElement('div');
        saleCard.className = 'product-card';
        saleCard.innerHTML = `
            <img src="${sale.image}" alt="${sale.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <h3>${sale.title}</h3>
            <p class="original-price">Original: $${sale.originalPrice}</p>
            <p class="sale-price">Sale: $${sale.salePrice}</p>
            <p class="discount">${sale.discount}% OFF</p>
            <p>${sale.description}</p>
            <button onclick="addToCart(${index})">Add to Cart</button>
        `;
        salesGrid.appendChild(saleCard);
    });
}

function addToCart(saleIndex) {
    // Simple cart functionality - could be expanded
    alert('Item added to cart! (This is a demo)');
}
// Simple JavaScript for interactivity

document.addEventListener('DOMContentLoaded', async function() {
    setupSearch();
    setupHeroButton();
    setupHoverEffects();
    updateAdminNavVisibility();
    await loadCategories();
    loadMiniCatalogue();
    renderStorefrontProducts();
    setupAddToCart();
    updateCartCount();
    setupStickyCartIcon();
    setupGeolocationCurrency();
});

function setupSearch() {
    const searchButton = document.querySelector('.search-bar button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const query = document.querySelector('.search-bar input').value;
            alert('Searching for: ' + query);
        });
    }
}

function setupHeroButton() {
    const heroBtn = document.querySelector('.hero .btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', function() {
            const categoriesSection = document.querySelector('.categories');
            if (categoriesSection) {
                window.scrollTo({ top: categoriesSection.offsetTop, behavior: 'smooth' });
            }
        });
    }
}

function setupHoverEffects() {
    document.querySelectorAll('.category, .product').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function setupAddToCart() {
    document.querySelectorAll('.product button').forEach(button => {
        const label = button.textContent.trim().toLowerCase();
        if (!label.includes('add to cart')) return;
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            addToCartFromButton(this);
        });
    });
}

function addToCartFromButton(button) {
    const card = button.closest('.product');
    if (!card) {
        alert('Added to cart!');
        return;
    }

    const name = card.querySelector('h4')?.textContent || card.querySelector('h3')?.textContent || 'Item';
    const priceText = card.querySelector('p')?.textContent || '$0.00';
    const price = parseFloat(priceText.replace(/[^0-9\.]/g, '')) || 0;
    const image = card.querySelector('img')?.src || 'https://via.placeholder.com/300x400?text=Cart+Item';

    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    cartItems.push({
        id: Date.now() + Math.random(),
        name,
        price,
        image,
        quantity: 1
    });
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    alert(`${name} added to cart!`);
}

function updateAdminNavVisibility() {
    const adminLoginLinks = document.querySelectorAll('nav a[href$="account.html"]');
    const adminDashboardLinks = document.querySelectorAll('nav a[href$="admin.html"]');
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

    adminLoginLinks.forEach(link => {
        if (isAdminLoggedIn) {
            link.href = 'admin.html';
        } else {
            link.href = 'account.html';
        }
        link.style.display = 'inline-block';
    });

    adminDashboardLinks.forEach(link => {
        link.style.display = isAdminLoggedIn ? 'inline-block' : 'none';
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = count;
    });
    updateStickyCartIcon();
}

function getStoredCategories() {
    const stored = JSON.parse(localStorage.getItem('categories') || 'null');
    return Array.isArray(stored) ? stored : null;
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
    window.siteCategories = categories;
    populateCategorySelectors();
}

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-');
}

function resolveRootPath(resource) {
    return window.location.pathname.toLowerCase().includes('/admin/') ? `../${resource}` : resource;
}

async function fetchCategoryFile() {
    try {
        const response = await fetch(resolveRootPath('categories.json'));
        if (!response.ok) throw new Error('Failed to load category file');
        const data = await response.json();
        return Array.isArray(data) ? data : null;
    } catch (error) {
        return null;
    }
}

async function loadCategories() {
    let categories = getStoredCategories();
    if (!categories) {
        categories = await fetchCategoryFile();
    }
    if (!categories || !categories.length) {
        categories = [
            { id: 'women', title: 'Women' },
            { id: 'men', title: 'Men' },
            { id: 'kids', title: 'Kids' },
            { id: 'beauty', title: 'Beauty' }
        ];
    }
    window.siteCategories = categories;
    populateCategorySelectors();
}

function populateCategorySelectors() {
    const selectors = document.querySelectorAll('#product-category, #seller-product-category, #catalogue-category');
    selectors.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select Category</option>' +
            window.siteCategories.map(category => `\n            <option value="${category.id}">${category.title}</option>`).join('');
    });
}

function getPageCategory() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('women.html')) return 'women';
    if (path.endsWith('men.html')) return 'men';
    if (path.endsWith('kids.html')) return 'kids';
    if (path.endsWith('beauty.html')) return 'beauty';
    if (path.endsWith('sales.html')) return 'sales';
    return null;
}

function getStorefrontProducts() {
    const adminProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const sellerProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    return [
        ...adminProducts.map(item => ({ ...item, source: 'Admin' })),
        ...sellerProducts.map(item => ({ ...item, source: 'Seller', productType: item.productType || 'General' }))
    ];
}

function renderStorefrontProducts() {
    const category = getPageCategory();
    if (!category) return;

    const productGrid = document.querySelector('.featured-products .product-grid');
    if (!productGrid) return;

    const products = getStorefrontProducts();
    const categoryProducts = products.filter(product => product.category === category);
    if (!categoryProducts.length) return;

    categoryProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product';
        productCard.dataset.productType = product.productType || 'General';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x300?text=No+Image'">
            <h4>${product.name}</h4>
            <p class="product-type">${product.productType ? product.productType : 'General'}</p>
            <p>${localStorage.getItem('userCurrencySymbol') || '$'}${product.price.toFixed(2)}</p>
            <button type="button">Add to Cart</button>
        `;
        productGrid.appendChild(productCard);
    });
    setupAddToCart();
}

function setupStickyCartIcon() {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const existingSticky = document.querySelector('.sticky-cart');

    if (!userLoggedIn || adminLoggedIn) {
        if (existingSticky) existingSticky.remove();
        return;
    }

    if (existingSticky) return;

    const sticky = document.createElement('a');
    sticky.href = 'cart.html';
    sticky.className = 'sticky-cart';
    sticky.innerHTML = `
        <span class="cart-icon">🛒</span>
        <span class="cart-count-bubble" id="sticky-cart-count">0</span>
        <span class="cart-discount" id="sticky-cart-discount">0%</span>
    `;
    document.body.appendChild(sticky);
    updateStickyCartIcon();
}

function updateStickyCartIcon() {
    const countElement = document.getElementById('sticky-cart-count');
    const discountElement = document.getElementById('sticky-cart-discount');
    if (!countElement || !discountElement) return;

    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const coupon = JSON.parse(localStorage.getItem('cartCoupon') || 'null');
    const count = cart.reduce((sum, item) => sum + ((item.quantity || 1)), 0);
    const subtotal = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.quantity || 1)), 0);
    const discountAmount = coupon?.discount ? subtotal * coupon.discount : 0;
    const currencySymbol = localStorage.getItem('userCurrencySymbol') || '$';
    const discountText = discountAmount > 0 ? `${currencySymbol}${discountAmount.toFixed(2)} OFF` : 'No discount';

    countElement.textContent = count;
    discountElement.textContent = discountText;
}

function ensureCatalogueSampleData() {
    const savedCatalog = JSON.parse(localStorage.getItem('catalogueItems') || 'null');
    if (!savedCatalog) {
        const sampleCatalog = [
            { id: 'cat1', title: 'Women', image: 'https://via.placeholder.com/350x250?text=Women', page: 'women.html' },
            { id: 'cat2', title: 'Men', image: 'https://via.placeholder.com/350x250?text=Men', page: 'men.html' },
            { id: 'cat3', title: 'Kids', image: 'https://via.placeholder.com/350x250?text=Kids', page: 'kids.html' },
            { id: 'cat4', title: 'Beauty', image: 'https://via.placeholder.com/350x250?text=Beauty', page: 'beauty.html' }
        ];
        localStorage.setItem('catalogueItems', JSON.stringify(sampleCatalog));
        return sampleCatalog;
    }
    return savedCatalog;
}

function loadMiniCatalogue() {
    const grid = document.getElementById('mini-catalogue-grid');
    if (!grid) return;

    if (window.innerWidth < 1024) {
        grid.innerHTML = '<p>Mini catalogue is available on desktop screens.</p>';
        return;
    }

    const catalogueItems = ensureCatalogueSampleData();
    grid.innerHTML = catalogueItems.map(item => `
        <div class="mini-category-card">
            <a href="${item.page}">
                <img src="${item.image}" alt="${item.title}">
                <div class="mini-category-card-text">
                    <h3>${item.title}</h3>
                    <p>Browse the latest ${item.title} collection</p>
                </div>
            </a>
        </div>
    `).join('');
}

// Simple hover effects for category and product cards
window.addEventListener('resize', loadMiniCatalogue);

// Auto theme switching based on time
function updateTheme() {
    const now = new Date();
    const hour = now.getHours();
    const isDark = hour >= 19 || hour < 5;
    document.body.classList.toggle('dark', isDark);
}

updateTheme();
setInterval(updateTheme, 60000);

// Load advert videos
function loadAdvertVideos() {
    const videos = JSON.parse(localStorage.getItem('advertVideos')) || [];
    const videoElement = document.getElementById('advert-video');
    if (videoElement && videos.length > 0) {
        let currentIndex = 0;
        videoElement.src = videos[currentIndex].url;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % videos.length;
            videoElement.src = videos[currentIndex].url;
        }, 10000);
    }
}

loadAdvertVideos();
window.addEventListener('videosUpdated', function() {
    loadAdvertVideos();
});

function setupGeolocationCurrency() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Rough check for South Africa coordinates
                const isSouthAfrica = lat >= -35 && lat <= -22 && lon >= 16 && lon <= 33;

                const currency = isSouthAfrica ? 'ZAR' : 'USD';
                const symbol = isSouthAfrica ? 'R' : '$';

                localStorage.setItem('userCurrency', currency);
                localStorage.setItem('userCurrencySymbol', symbol);

                updatePricesOnPage(symbol);
            },
            function(error) {
                console.log('Geolocation error:', error.message);
                // Default to USD
                localStorage.setItem('userCurrency', 'USD');
                localStorage.setItem('userCurrencySymbol', '$');
                updatePricesOnPage('$');
            },
            { timeout: 10000 }
        );
    } else {
        // Default to USD if geolocation not supported
        localStorage.setItem('userCurrency', 'USD');
        localStorage.setItem('userCurrencySymbol', '$');
        updatePricesOnPage('$');
    }
}

function updatePricesOnPage(symbol) {
    // Update all price displays on the page
    document.querySelectorAll('.product p, .cart-item-price, .total-price').forEach(priceElement => {
        const text = priceElement.textContent;
        if (text.includes('$') || text.includes('R')) {
            const numericValue = text.replace(/[^0-9\.]/g, '');
            if (numericValue) {
                priceElement.textContent = `${symbol}${numericValue}`;
            }
        }
    });
}
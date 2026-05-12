// Seller portal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('seller-login-form')) {
        setupSellerForms();
    }
    if (document.getElementById('seller-add-product-form')) {
        setupSellerDashboard();
    }
});

function getStoredSellers() {
    const sellers = JSON.parse(localStorage.getItem('sellers') || 'null');
    return sellers || [];
}

function saveSellers(sellers) {
    localStorage.setItem('sellers', JSON.stringify(sellers));
}

function getSellerProducts() {
    return JSON.parse(localStorage.getItem('sellerProducts') || '[]');
}

function saveSellerProducts(products) {
    localStorage.setItem('sellerProducts', JSON.stringify(products));
}

function setupSellerForms() {
    document.getElementById('seller-login-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSellerLogin();
    });

    document.getElementById('seller-passkey-btn')?.addEventListener('click', function() {
        handleSellerPasskey();
    });

    document.getElementById('seller-application-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        submitSellerApplication();
    });
}

async function hashString(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256$${hashHex}`;
}

async function handleSellerLogin() {
    const email = document.getElementById('seller-email').value.trim();
    const password = document.getElementById('seller-password').value.trim();
    const sellers = getStoredSellers();
    const hashedInput = await hashString(password);

    const seller = sellers.find(s => s.email === email && (s.password === password || s.password === hashedInput || s.password === `sha256$${s.password}`));

    if (seller && seller.status === 'approved') {
        sessionStorage.setItem('sellerLoggedIn', 'true');
        sessionStorage.setItem('sellerEmail', seller.email);
        sessionStorage.setItem('sellerCompany', seller.company);
        sessionStorage.setItem('sellerInterest', seller.interestRate);
        window.location.href = 'seller-dashboard.html';
    } else if (seller && seller.status === 'pending') {
        alert('Your seller application is still pending approval.');
    } else {
        alert('Seller login failed. Please verify your credentials or apply to sell.');
    }
}

function handleSellerPasskey() {
    const email = document.getElementById('seller-email').value.trim();
    if (!email) {
        alert('Enter your seller email first.');
        return;
    }
    const passkey = prompt('Enter your seller passkey:');
    if (!passkey) {
        return;
    }
    const sellers = getStoredSellers();
    const seller = sellers.find(s => s.email === email && s.passkey === passkey);
    if (seller && seller.status === 'approved') {
        sessionStorage.setItem('sellerLoggedIn', 'true');
        sessionStorage.setItem('sellerEmail', seller.email);
        sessionStorage.setItem('sellerCompany', seller.company);
        sessionStorage.setItem('sellerInterest', seller.interestRate);
        window.location.href = 'seller-dashboard.html';
    } else {
        alert('Passkey validation failed.');
    }
}

function submitSellerApplication() {
    const company = document.getElementById('seller-company').value.trim();
    const email = document.getElementById('seller-app-email').value.trim();
    const category = document.getElementById('seller-category').value.trim();
    const interest = parseFloat(document.getElementById('seller-interest').value);
    const description = document.getElementById('seller-description').value.trim();

    if (!company || !email || !category || isNaN(interest)) {
        alert('Please enter all required seller details.');
        return;
    }

    const sellers = getStoredSellers();
    if (sellers.some(s => s.email === email)) {
        alert('A seller with this email already exists.');
        return;
    }

    sellers.push({
        id: `seller-${Date.now()}`,
        company,
        email,
        category,
        interestRate: interest,
        description,
        status: 'pending',
        passkey: `SELLER-${Math.floor(Math.random() * 900000 + 100000)}`
    });
    saveSellers(sellers);
    document.getElementById('seller-application-form').reset();
    alert('Seller application submitted. Your seller passkey is stored for review. Admin approval is required.');
}

function setupSellerDashboard() {
    const isSellerLoggedIn = sessionStorage.getItem('sellerLoggedIn') === 'true';
    if (!isSellerLoggedIn) {
        window.location.href = 'seller-login.html';
        return;
    }

    const sellerCompany = sessionStorage.getItem('sellerCompany');
    const sellerEmail = sessionStorage.getItem('sellerEmail');
    const sellerInterest = sessionStorage.getItem('sellerInterest');

    document.getElementById('seller-summary').textContent = `Welcome back, ${sellerCompany} (${sellerEmail})`;
    document.getElementById('seller-interest-rate').textContent = `${sellerInterest || 0}%`;
    document.getElementById('seller-logout-btn')?.addEventListener('click', handleSellerLogout);
    document.getElementById('seller-add-product-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSellerAddProduct();
    });
    setupSellerImageUpload();
    loadSellerDashboard();
}

function setupSellerImageUpload() {
    const uploadArea = document.getElementById('seller-image-upload-area');
    const fileInput = document.getElementById('seller-product-image-file');
    const browseBtn = document.getElementById('seller-browse-btn');
    const preview = document.getElementById('seller-image-preview');
    const urlInput = document.getElementById('seller-product-image-url');

    if (!uploadArea) return;

    // Browse button click
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        handleSellerFileSelect(e.target.files[0]);
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleSellerFileSelect(files[0]);
        }
    });

    // URL input change
    urlInput.addEventListener('input', function() {
        if (urlInput.value.trim()) {
            preview.src = urlInput.value;
            preview.style.display = 'block';
            fileInput.value = '';
        } else {
            preview.style.display = 'none';
        }
    });
}

function handleSellerFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('seller-image-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('seller-product-image-url').value = '';
    };
    reader.readAsDataURL(file);
}

function handleSellerLogout() {
    sessionStorage.removeItem('sellerLoggedIn');
    sessionStorage.removeItem('sellerEmail');
    sessionStorage.removeItem('sellerCompany');
    sessionStorage.removeItem('sellerInterest');
    window.location.href = 'seller-login.html';
}

function handleSellerAddProduct() {
    const name = document.getElementById('seller-product-name').value.trim();
    const category = document.getElementById('seller-product-category').value;
    const productType = document.getElementById('seller-product-type').value.trim();
    const price = parseFloat(document.getElementById('seller-product-price').value);
    const urlImage = document.getElementById('seller-product-image-url').value.trim();
    const fileInput = document.getElementById('seller-product-image-file');
    const fee = parseFloat(document.getElementById('seller-interest-fee').value);
    const description = document.getElementById('seller-product-description').value.trim();
    const sellerEmail = sessionStorage.getItem('sellerEmail');

    let image = urlImage || 'https://via.placeholder.com/300x400?text=No+Image';

    // If a file was selected, use the data URL
    if (fileInput.files.length > 0) {
        const preview = document.getElementById('seller-image-preview');
        image = preview.src;
    }

    if (!name || !category || !productType || isNaN(price) || isNaN(fee)) {
        alert('Fill in all product information.');
        return;
    }

    const products = getSellerProducts();
    products.push({
        id: `sellerprod-${Date.now()}`,
        sellerEmail,
        category,
        productType,
        name,
        price,
        image,
        interestFee: fee,
        description,
        dateAdded: new Date().toISOString()
    });
    saveSellerProducts(products);
    document.getElementById('seller-add-product-form').reset();
    document.getElementById('seller-image-preview').style.display = 'none';
    loadSellerDashboard();
    alert('Seller product added with interest fee.');
}

function loadSellerDashboard() {
    const sellerEmail = sessionStorage.getItem('sellerEmail');
    const products = getSellerProducts().filter(p => p.sellerEmail === sellerEmail);
    const productList = document.getElementById('seller-products-list');
    const totalListings = document.getElementById('seller-listings');
    const orders = document.getElementById('seller-orders');

    if (!productList) return;
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p>No seller listings yet.</p>';
    } else {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card-admin';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="category">Category: ${product.category}</p>
                    <p class="product-type">Type: ${product.productType || 'General'}</p>
                    <p class="category">Interest Fee: ${product.interestFee}%</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="description">${product.description || 'No description'}</p>
                    <div class="product-actions">
                        <button onclick="deleteSellerProduct('${product.id}')" class="delete-btn">Remove</button>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    if (totalListings) totalListings.textContent = products.length;
    if (orders) orders.textContent = '0';
}

function deleteSellerProduct(productId) {
    const products = getSellerProducts();
    const filtered = products.filter(product => product.id !== productId);
    saveSellerProducts(filtered);
    loadSellerDashboard();
    alert('Seller product removed.');
}

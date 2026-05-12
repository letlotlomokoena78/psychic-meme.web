// Admin product management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    loadProducts();
    setupProductForm();
});

function checkAdminLogin() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'account.html';
    }
}

function setupProductForm() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', addProduct);

    setupImageUpload();
}

function setupImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('product-image-file');
    const browseBtn = document.getElementById('browse-btn');
    const preview = document.getElementById('image-preview');
    const urlInput = document.getElementById('product-image-url');

    // Browse button click
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files[0]);
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
            handleFileSelect(files[0]);
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

function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('image-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('product-image-url').value = '';
    };
    reader.readAsDataURL(file);
}

function addProduct(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const type = document.getElementById('product-type').value.trim();
    const price = document.getElementById('product-price').value;
    const urlImage = document.getElementById('product-image-url').value.trim();
    const fileInput = document.getElementById('product-image-file');
    const description = document.getElementById('product-description').value;

    let image = urlImage || 'https://via.placeholder.com/300x400?text=No+Image';

    // If a file was selected, use the data URL
    if (fileInput.files.length > 0) {
        const preview = document.getElementById('image-preview');
        image = preview.src;
    }

    const product = {
        id: Date.now(),
        name: name,
        category: category,
        productType: type,
        price: parseFloat(price),
        image: image,
        description: description,
        dateAdded: new Date().toISOString()
    };

    // Get existing products
    const products = JSON.parse(localStorage.getItem('products') || '[]');

    // Add new product
    products.push(product);

    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Reset form
    document.getElementById('add-product-form').reset();
    document.getElementById('image-preview').style.display = 'none';

    // Reload products list
    loadProducts();

    alert('Product added successfully!');
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productsList = document.getElementById('products-list');

    if (products.length === 0) {
        productsList.innerHTML = '<p>No products added yet.</p>';
        return;
    }

    productsList.innerHTML = '';

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card-admin';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <p class="product-type">${product.productType ? `Type: ${product.productType}` : 'Type: General'}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="description">${product.description || 'No description'}</p>
                <div class="product-actions">
                    <button onclick="editProduct(${product.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);

    if (product) {
        // Populate form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-type').value = product.productType || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image-url').value = product.image;
        document.getElementById('product-description').value = product.description;

        // Change form to update mode
        const form = document.getElementById('add-product-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Product';

        // Remove existing event listener and add update listener
        form.removeEventListener('submit', addProduct);
        form.addEventListener('submit', function updateHandler(e) {
            e.preventDefault();
            updateProduct(productId);
            form.removeEventListener('submit', updateHandler);
            form.addEventListener('submit', addProduct);
            submitBtn.textContent = 'Add Product';
            form.reset();
        });
    }
}

function updateProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const index = products.findIndex(p => p.id === productId);

    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            productType: document.getElementById('product-type').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            image: document.getElementById('product-image-url').value.trim() || products[index].image,
            description: document.getElementById('product-description').value
        };

        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        alert('Product updated successfully!');
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const filteredProducts = products.filter(p => p.id !== productId);

        localStorage.setItem('products', JSON.stringify(filteredProducts));
        loadProducts();
        alert('Product deleted successfully!');
    }
}
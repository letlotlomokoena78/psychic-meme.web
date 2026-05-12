// Admin catalogue management JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    await loadCategories();
    loadCatalogue();
    setupCategoryForm();
    setupCatalogueForm();
});

function setupCategoryForm() {
    const form = document.getElementById('add-category-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addCategory();
        });
    }
}

function setupCatalogueForm() {
    const form = document.getElementById('add-catalogue-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addCatalogueEntry();
        });
    }
}

function addCatalogueEntry() {
    const title = document.getElementById('catalogue-title').value.trim();
    const category = document.getElementById('catalogue-category').value;
    const image = document.getElementById('catalogue-image').value.trim() || 'https://via.placeholder.com/350x250?text=No+Image';
    const page = document.getElementById('catalogue-page').value.trim();

    if (!title || !category || !page) {
        alert('Please fill in all required fields.');
        return;
    }

    const catalogue = getStoredCatalogue();
    catalogue.push({
        id: `cat-${Date.now()}`,
        title,
        category,
        image,
        page
    });

    saveCatalogue(catalogue);
    document.getElementById('add-catalogue-form').reset();
    loadCatalogue();
    alert('Catalogue entry added successfully.');
}

function addCategory() {
    const title = document.getElementById('category-title').value.trim();
    if (!title) {
        alert('Please enter a category title.');
        return;
    }

    const categories = getStoredCategories();
    const id = slugify(title);
    if (categories.some(category => category.id === id)) {
        alert('This category already exists.');
        return;
    }

    categories.push({ id, title });
    saveCategories(categories);
    document.getElementById('add-category-form').reset();
    alert('Category added successfully.');
}

function getStoredCategories() {
    return JSON.parse(localStorage.getItem('categories') || '[]');
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
    populateCategorySelectors();
}

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-');
}

function getStoredCatalogue() {
    return JSON.parse(localStorage.getItem('catalogueItems') || '[]');
}

function saveCatalogue(catalogue) {
    localStorage.setItem('catalogueItems', JSON.stringify(catalogue));
}

function loadCatalogue() {
    const catalogue = getStoredCatalogue();
    const catalogueList = document.getElementById('catalogue-list');

    if (!catalogueList) return;

    if (catalogue.length === 0) {
        catalogueList.innerHTML = '<p>No catalogue entries yet.</p>';
        return;
    }

    catalogueList.innerHTML = '';

    catalogue.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.className = 'catalogue-card-admin';
        entryCard.innerHTML = `
            <img src="${entry.image}" alt="${entry.title}" onerror="this.src='https://via.placeholder.com/350x250?text=No+Image'">
            <div class="catalogue-info">
                <h4>${entry.title}</h4>
                <p>Category: ${entry.category}</p>
                <p>Page: ${entry.page}</p>
                <div class="catalogue-actions">
                    <button onclick="deleteCatalogueEntry('${entry.id}')" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
        catalogueList.appendChild(entryCard);
    });
}

function deleteCatalogueEntry(entryId) {
    if (!confirm('Delete this catalogue entry?')) return;
    const catalogue = getStoredCatalogue();
    const filtered = catalogue.filter(e => e.id !== entryId);
    saveCatalogue(filtered);
    loadCatalogue();
    alert('Catalogue entry deleted.');
}

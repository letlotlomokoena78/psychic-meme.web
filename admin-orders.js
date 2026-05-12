// Admin order management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    createSampleOrders();
    loadOrders();
    updateOrderStats();
    startOrderMonitoring();
});

function startOrderMonitoring() {
    autoProcessOrders();
    setInterval(() => {
        autoProcessOrders();
        loadOrders();
        updateOrderStats();
    }, 10000); // Refresh every 10 seconds
}

function autoProcessOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const now = Date.now();
    let modified = false;

    orders.forEach(order => {
        const orderDate = new Date(order.date).getTime();
        const ageDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        const currentStatus = (order.status || 'pending').toLowerCase();

        if (currentStatus === 'pending' && ageDays >= 7) {
            order.status = 'completed';
            order.autoNote = `Auto-completed after ${ageDays} days`;
            modified = true;
        }

        if (currentStatus === 'completed' && ageDays >= 30 && !order.archived) {
            order.archived = true;
            order.autoNote = 'Archived after 30 days';
            modified = true;
        }
    });

    if (modified) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
        return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        const itemsCount = order.items ? order.items.length : 0;
        const statusClass = order.status ? order.status.toLowerCase() : 'pending';

        tableHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${itemsCount} items</td>
                <td>$${order.total ? order.total.toFixed(2) : '0.00'}</td>
                <td>
                    <span class="status-${statusClass}">${order.status || 'Pending'}</span>
                    ${order.autoNote ? `<div class="auto-note">${order.autoNote}</div>` : ''}
                </td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewOrderDetails('${order.id}')" class="view-btn">View</button>
                    <button onclick="updateOrderStatus('${order.id}')" class="update-btn">Update</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    ordersList.innerHTML = tableHTML;
}

function updateOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => (order.status || 'pending').toLowerCase() === 'pending').length;
    const completedOrders = orders.filter(order => (order.status || '').toLowerCase() === 'completed').length;
    const totalRevenue = orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    if (order) {
        let detailsHTML = `
            <div class="order-details-modal">
                <div class="modal-content">
                    <h3>Order Details - ${order.id}</h3>
                    <div class="order-info">
                        <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
                        <p><strong>Address:</strong> ${order.customerAddress || 'N/A'}</p>
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                        <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
                        <p><strong>Total:</strong> $${order.total ? order.total.toFixed(2) : '0.00'}</p>
                        ${order.autoNote ? `<p><strong>Auto Note:</strong> ${order.autoNote}</p>` : ''}

        detailsHTML += `
                        </ul>
                    </div>
                    <button onclick="closeOrderDetails()" class="close-btn">Close</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    }
}

function closeOrderDetails() {
    const modal = document.querySelector('.order-details-modal');
    if (modal) {
        modal.remove();
    }
}

function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex !== -1) {
        const currentStatus = orders[orderIndex].status || 'pending';
        const newStatus = currentStatus.toLowerCase() === 'pending' ? 'completed' : 'pending';

        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));

        loadOrders();
        updateOrderStats();
        alert(`Order status updated to ${newStatus}`);
    }
}

// Sample data for demo purposes
function createSampleOrders() {
    const sampleOrders = [
        {
            id: 'ORD-001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '+1234567890',
            customerAddress: '123 Main St, City, State 12345',
            items: [
                { name: 'Summer Dress', price: 49.99, quantity: 1 },
                { name: 'Sandals', price: 29.99, quantity: 1 }
            ],
            total: 79.98,
            status: 'completed',
            date: '2024-01-15T10:30:00Z'
        },
        {
            id: 'ORD-002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            customerPhone: '+1234567891',
            customerAddress: '456 Oak Ave, City, State 12346',
            items: [
                { name: 'Jeans', price: 59.99, quantity: 2 },
                { name: 'T-Shirt', price: 19.99, quantity: 1 }
            ],
            total: 139.97,
            status: 'pending',
            date: '2024-01-16T14:20:00Z'
        }
    ];

    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(sampleOrders));
    }
}

// Initialize sample data if no orders exist
createSampleOrders();
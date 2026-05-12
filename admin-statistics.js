// Admin statistics JavaScript

document.addEventListener('DOMContentLoaded', function() {
    generateSampleData();
    loadStatistics();
    startStatisticsRefresh();
});

function startStatisticsRefresh() {
    setInterval(() => {
        loadStatistics();
    }, 10000); // Refresh stats every 10 seconds
}

function loadStatistics() {
    // Load data from localStorage and calculate statistics
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');

    // Calculate total revenue
    const totalRevenue = orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate total users
    const totalUsers = regularUsers.length;

    // Calculate conversion rate (simplified - orders per 100 users)
    const conversionRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0;

    // Update overview stats
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('conversion-rate').textContent = `${conversionRate}%`;

    // Update change metrics
    updateTrendMetrics(orders, regularUsers, conversionRate);

    // Generate category sales data
    generateCategorySales(orders);

    // Generate monthly revenue data
    generateMonthlyRevenue(orders);

    // Generate top products
    generateTopProducts(orders);

    // Update user activity (simulated data)
    updateUserActivity();

    // Update summary graph and summary diagram
    renderSummaryGraph(orders);
    updateSummaryDiagram(totalRevenue, totalOrders, totalUsers, conversionRate);

    // Update recent activity list using orders
    updateRecentActivity(orders);
}

function updateTrendMetrics(orders, regularUsers, conversionRate) {
    const monthlyRevenue = getMonthlyRevenueMap(orders);
    const months = Object.keys(monthlyRevenue);
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2] || currentMonth;
    const currentRevenue = monthlyRevenue[currentMonth] || 0;
    const previousRevenue = monthlyRevenue[previousMonth] || 0;
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const ordersByMonth = getMonthlyOrderCount(orders);
    const currentOrders = ordersByMonth[currentMonth] || 0;
    const previousOrders = ordersByMonth[previousMonth] || 0;
    const ordersChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    const activeUsers = regularUsers.filter(user => user.status === 'active').length;
    const lastMonthUsers = regularUsers.filter(user => {
        const joinDate = new Date(user.joinDate);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return joinDate.getFullYear() === lastMonth.getFullYear() && joinDate.getMonth() === lastMonth.getMonth();
    }).length;
    const usersChange = lastMonthUsers > 0 ? ((activeUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

    document.getElementById('revenue-change').textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% from last month`;
    document.getElementById('orders-change').textContent = `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}% from last month`;
    document.getElementById('users-change').textContent = `${usersChange >= 0 ? '+' : ''}${usersChange.toFixed(1)}% from last month`;
    document.getElementById('conversion-change').textContent = `${Math.max(Math.min(conversionRate - 2, 999), -999).toFixed(1)}% from last month`;
}

function getMonthlyRevenueMap(orders) {
    const monthlyRevenue = {};
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyRevenue[monthKey] = 0;
    }

    orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .forEach(order => {
            const orderDate = new Date(order.date);
            const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
            if (monthlyRevenue.hasOwnProperty(monthKey)) {
                monthlyRevenue[monthKey] += order.total || 0;
            }
        });

    return monthlyRevenue;
}

function getMonthlyOrderCount(orders) {
    const monthlyOrders = {};
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyOrders[monthKey] = 0;
    }

    orders.forEach(order => {
        const orderDate = new Date(order.date);
        const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyOrders.hasOwnProperty(monthKey)) {
            monthlyOrders[monthKey] += 1;
        }
    });

    return monthlyOrders;
}

function renderSummaryGraph(orders) {
    const svg = document.getElementById('summary-line-chart');
    if (!svg) return;

    const revenueMap = getMonthlyRevenueMap(orders);
    const orderMap = getMonthlyOrderCount(orders);
    const months = Object.keys(revenueMap);
    const revenueValues = Object.values(revenueMap);
    const orderValues = months.map(month => orderMap[month] || 0);
    const maxRevenue = Math.max(...revenueValues, 1);
    const maxOrders = Math.max(...orderValues, 1);
    const width = 600;
    const height = 260;
    const padding = 40;

    const revenuePoints = months.map((month, index) => {
        const x = padding + (index / (months.length - 1)) * (width - padding * 2);
        const y = height - padding - (revenueValues[index] / maxRevenue) * (height - padding * 2);
        return `${x},${y}`;
    });

    const orderPoints = months.map((month, index) => {
        const x = padding + (index / (months.length - 1)) * (width - padding * 2);
        const y = height - padding - (orderValues[index] / maxOrders) * (height - padding * 2);
        return `${x},${y}`;
    });

    const revenueCircles = revenuePoints.map(point => {
        const [x, y] = point.split(',');
        return `<circle cx="${x}" cy="${y}" r="4" class="chart-dot revenue-dot"/>`;
    }).join('');

    const orderCircles = orderPoints.map(point => {
        const [x, y] = point.split(',');
        return `<circle cx="${x}" cy="${y}" r="4" class="chart-dot order-dot"/>`;
    }).join('');

    svg.innerHTML = `
        <defs>
            <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fff" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="260" fill="transparent" />
        <g class="grid-lines">
            ${[1,2,3,4].map(i => `<line x1="${padding}" y1="${padding + i * 40}" x2="${width - padding}" y2="${padding + i * 40}" stroke="#eee" stroke-width="1" />`).join('')}
            ${months.map((_, index) => {
                const x = padding + (index / (months.length - 1)) * (width - padding * 2);
                return `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="#eee" stroke-width="1" />`;
            }).join('')}
        </g>
        <polyline points="${revenuePoints.join(' ')}" class="chart-line revenue-line" />
        <polyline points="${orderPoints.join(' ')}" class="chart-line order-line" />
        ${revenueCircles}
        ${orderCircles}
        ${months.map((month, index) => {
            const x = padding + (index / (months.length - 1)) * (width - padding * 2);
            return `<text x="${x}" y="${height - 10}" class="chart-label" text-anchor="middle">${month}</text>`;
        }).join('')}
    `;
}

function updateSummaryDiagram(revenue, orders, users, conversion) {
    const revenueNode = document.getElementById('summary-revenue');
    const ordersNode = document.getElementById('summary-orders');
    const usersNode = document.getElementById('summary-users');
    const conversionNode = document.getElementById('summary-conversion');
    if (revenueNode) revenueNode.textContent = `$${revenue.toFixed(2)}`;
    if (ordersNode) ordersNode.textContent = orders;
    if (usersNode) usersNode.textContent = users;
    if (conversionNode) conversionNode.textContent = `${conversion}%`;
}

function updateRecentActivity(orders) {
    const recentActivityList = document.getElementById('recent-activity-list');
    if (!recentActivityList) return;

    const activity = [];
    orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .forEach(order => {
            const status = (order.status || 'pending').toLowerCase();
            activity.push({
                time: new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Order ${order.id} by ${order.customerName || 'Customer'} is ${status}`
            });
        });

    if (activity.length === 0) {
        recentActivityList.innerHTML = '<div class="activity-item"><span class="activity-time">-</span><span>No recent order activity</span></div>';
        return;
    }

    recentActivityList.innerHTML = activity.map(evt => `
        <div class="activity-item">
            <span class="activity-time">${evt.time}</span>
            <span>${evt.text}</span>
        </div>
    `).join('');
}

function generateCategorySales(orders) {
    const categorySales = {
        women: 0,
        men: 0,
        kids: 0,
        beauty: 0
    };

    // Calculate sales by category from completed orders
    orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    // Simple categorization based on item name keywords
                    const name = item.name.toLowerCase();
                    if (name.includes('dress') || name.includes('skirt') || name.includes('blouse')) {
                        categorySales.women += item.price * item.quantity;
                    } else if (name.includes('jean') || name.includes('shirt') || name.includes('jacket')) {
                        categorySales.men += item.price * item.quantity;
                    } else if (name.includes('kid') || name.includes('children') || name.includes('toy')) {
                        categorySales.kids += item.price * item.quantity;
                    } else if (name.includes('makeup') || name.includes('cosmetic') || name.includes('beauty')) {
                        categorySales.beauty += item.price * item.quantity;
                    }
                });
            }
        });

    // Update chart bars
    const totalSales = Object.values(categorySales).reduce((sum, val) => sum + val, 0);
    if (totalSales > 0) {
        Object.keys(categorySales).forEach(category => {
            const percentage = (categorySales[category] / totalSales) * 100;
            const barElement = document.querySelector(`.${category}-bar`);
            if (barElement) {
                barElement.style.height = `${Math.max(percentage, 10)}%`;
                barElement.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} (${percentage.toFixed(0)}%)`;
            }
        });
    }
}

function generateMonthlyRevenue(orders) {
    const monthlyRevenue = {};
    const currentDate = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyRevenue[monthKey] = 0;
    }

    // Calculate revenue by month
    orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .forEach(order => {
            const orderDate = new Date(order.date);
            const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
            if (monthlyRevenue.hasOwnProperty(monthKey)) {
                monthlyRevenue[monthKey] += order.total || 0;
            }
        });

    // Update monthly revenue display
    const revenueChart = document.querySelector('.revenue-chart');
    if (revenueChart) {
        revenueChart.innerHTML = '';
        Object.entries(monthlyRevenue).forEach(([month, revenue]) => {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month';
            monthDiv.textContent = `${month}: $${revenue.toFixed(0)}`;
            revenueChart.appendChild(monthDiv);
        });
    }
}

function generateTopProducts(orders) {
    const productSales = {};

    // Aggregate sales by product
    orders
        .filter(order => (order.status || '').toLowerCase() === 'completed')
        .forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (!productSales[item.name]) {
                        productSales[item.name] = { revenue: 0, count: 0 };
                    }
                    productSales[item.name].revenue += item.price * item.quantity;
                    productSales[item.name].count += item.quantity;
                });
            }
        });

    // Sort by revenue and get top 4
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 4);

    // Update top products display
    const topProductsList = document.getElementById('top-products');
    if (topProductsList) {
        topProductsList.innerHTML = '';
        topProducts.forEach(([name, data]) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-stat';
            productDiv.innerHTML = `
                <span>${name}</span>
                <span>$${data.revenue.toFixed(0)} (${data.count} sales)</span>
            `;
            topProductsList.appendChild(productDiv);
        });
    }
}

function updateUserActivity() {
    // Simulated user activity data
    const pageViews = Math.floor(Math.random() * 2000) + 1000;
    const uniqueVisitors = Math.floor(pageViews * 0.7);
    const bounceRate = Math.floor(Math.random() * 20) + 25;
    const sessionMinutes = Math.floor(Math.random() * 3) + 2;
    const sessionSeconds = Math.floor(Math.random() * 60);

    document.getElementById('page-views').textContent = pageViews.toLocaleString();
    document.getElementById('unique-visitors').textContent = uniqueVisitors.toLocaleString();
    document.getElementById('bounce-rate').textContent = `${bounceRate}%`;
    document.getElementById('session-duration').textContent = `${sessionMinutes}m ${sessionSeconds}s`;
}

// Generate some sample data for demonstration
function generateSampleData() {
    if (!localStorage.getItem('sampleDataGenerated')) {
        // Sample orders data
        const sampleOrders = [];
        const categories = ['women', 'men', 'kids', 'beauty'];
        const products = {
            women: ['Summer Dress', 'Evening Gown', 'Blouse', 'Skirt'],
            men: ['Business Shirt', 'Casual Jeans', 'Leather Jacket', 'Polo Shirt'],
            kids: ['Kids T-Shirt', 'Children Jeans', 'School Uniform', 'Play Dress'],
            beauty: ['Lipstick', 'Foundation', 'Mascara', 'Perfume']
        };

        // Generate orders for the last 6 months
        for (let i = 0; i < 50; i++) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 180));

            const category = categories[Math.floor(Math.random() * categories.length)];
            const product = products[category][Math.floor(Math.random() * products[category].length)];
            const price = Math.floor(Math.random() * 100) + 20;
            const quantity = Math.floor(Math.random() * 3) + 1;

            sampleOrders.push({
                id: `ORD-${String(i + 1).padStart(3, '0')}`,
                customerName: `Customer ${i + 1}`,
                customerEmail: `customer${i + 1}@example.com`,
                items: [{
                    name: product,
                    price: price,
                    quantity: quantity
                }],
                total: price * quantity,
                status: Math.random() > 0.3 ? 'completed' : 'pending',
                date: orderDate.toISOString()
            });
        }

        localStorage.setItem('orders', JSON.stringify(sampleOrders));
        localStorage.setItem('sampleDataGenerated', 'true');
    }
}

// Generate sample data on first load
generateSampleData();
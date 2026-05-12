// Admin user management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    setupUserForm();
    updateUserStats();
});

function setupUserForm() {
    const form = document.getElementById('add-admin-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addAdminUser();
        });
    }
}

function getStoredAdminCredentials() {
    const savedData = JSON.parse(localStorage.getItem('adminCredentials') || 'null');
    return savedData || {};
}

function getDefaultAdminCredentials() {
    return fetch('config/admin-credentials.json')
        .then(res => res.json())
        .catch(() => ({
            admin: {
                username: 'admin',
                email: 'admin@cheeseboy.com',
                password: 'admin123'
            },
            superadmin: {
                username: 'superadmin',
                email: 'superadmin@cheeseboy.com',
                password: 'super123'
            }
        }));
}

function addAdminUser() {
    const username = document.getElementById('admin-username').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    const role = document.getElementById('admin-role').value;

    if (!username || !email || !password) {
        alert('Username, email, and password are required.');
        return;
    }

    const existingCredentials = getStoredAdminCredentials();

    const mergedCredentials = {...existingCredentials};

    const existingUser = Object.values(mergedCredentials).find(user =>
        user.username === username || user.email === email
    );

    if (existingUser) {
        alert('Username or email already exists!');
        return;
    }

    if (Object.keys(mergedCredentials).length >= 10) {
        alert('Maximum of 10 admin accounts reached. Remove an admin before adding another.');
        return;
    }

    mergedCredentials[username] = {
        username,
        email,
        password,
        role: role === 'superadmin' ? 'superadmin' : 'admin'
    };

    localStorage.setItem('adminCredentials', JSON.stringify(mergedCredentials));
    document.getElementById('add-admin-form').reset();
    loadUsers();
    updateUserStats();
    alert('Admin user added successfully!');
}

function loadUsers() {
    getDefaultAdminCredentials()
        .then(defaultAdmins => {
            const savedAdmins = getStoredAdminCredentials();
            const mergedAdmins = {...defaultAdmins, ...savedAdmins};
            displayAdminUsers(mergedAdmins);
        })
        .catch(error => {
            console.error('Error loading admin users:', error);
            displayAdminUsers(getStoredAdminCredentials());
        });

    loadRegularUsers();
}

function displayAdminUsers(adminData) {
    const adminUsersList = document.getElementById('admin-users-list');
    if (!adminUsersList) return;

    const adminUsers = Object.values(adminData);

    if (adminUsers.length === 0) {
        adminUsersList.innerHTML = '<p>No admin users found.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    adminUsers.forEach(user => {
        const role = user.role === 'superadmin' || user.username === 'superadmin' ? 'Super Admin' : 'Admin';
        tableHTML += `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${role}</td>
                <td>
                    <button onclick="editUser('${user.username}')" class="edit-btn">Edit</button>
                    ${user.username !== 'admin' ? `<button onclick="deleteUser('${user.username}')" class="delete-btn">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    adminUsersList.innerHTML = tableHTML;
}

function loadRegularUsers() {
    const regularUsersList = document.getElementById('regular-users-list');
    if (!regularUsersList) return;

    let regularUsers = JSON.parse(localStorage.getItem('regularUsers') || 'null');
    if (!regularUsers) {
        const sampleUsers = [
            {
                id: 'u1',
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@example.com',
                password: 'alice123',
                joinDate: '2024-01-10T00:00:00Z',
                status: 'active'
            },
            {
                id: 'u2',
                firstName: 'Bob',
                lastName: 'Smith',
                email: 'bob@example.com',
                password: 'bob123',
                joinDate: '2024-01-12T00:00:00Z',
                status: 'active'
            },
            {
                id: 'u3',
                firstName: 'Carol',
                lastName: 'Williams',
                email: 'carol@example.com',
                password: 'carol123',
                joinDate: '2024-01-14T00:00:00Z',
                status: 'inactive'
            }
        ];
        localStorage.setItem('regularUsers', JSON.stringify(sampleUsers));
        regularUsers = sampleUsers;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    regularUsers.forEach(user => {
        tableHTML += `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${new Date(user.joinDate).toLocaleDateString()}</td>
                <td><span class="status-${user.status}">${user.status}</span></td>
                <td>
                    <button onclick="viewUserDetails('${user.id}')" class="view-btn">View</button>
                    <button onclick="toggleUserStatus('${user.id}')" class="update-btn">
                        ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    regularUsersList.innerHTML = tableHTML;
}

function updateUserStats() {
    getDefaultAdminCredentials().then(defaultAdmins => {
        const savedAdmins = getStoredAdminCredentials();
        const mergedAdmins = {...defaultAdmins, ...savedAdmins};
        const adminCount = Object.keys(mergedAdmins).length;
        const adminCountElement = document.getElementById('admin-users');
        if (adminCountElement) {
            adminCountElement.textContent = adminCount;
        }
    });

    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');
    const totalUsers = regularUsers.length;
    const activeUsers = regularUsers.filter(user => user.status === 'active').length;
    const newUsersThisMonth = regularUsers.filter(user => {
        const joinDate = new Date(user.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length;

    const totalUsersElement = document.getElementById('total-users');
    const activeUsersElement = document.getElementById('active-users');
    const newUsersElement = document.getElementById('new-users');

    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    if (activeUsersElement) activeUsersElement.textContent = activeUsers;
    if (newUsersElement) newUsersElement.textContent = newUsersThisMonth;
}

function editUser(username) {
    alert(`Edit user functionality for ${username} would be implemented here.`);
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete admin user ${username}?`)) {
        const savedAdmins = getStoredAdminCredentials();
        if (savedAdmins[username]) {
            delete savedAdmins[username];
            localStorage.setItem('adminCredentials', JSON.stringify(savedAdmins));
            loadUsers();
            updateUserStats();
            alert(`Admin user ${username} has been removed.`);
        } else {
            alert('Cannot delete built-in default admin from configuration.');
        }
    }
}

function viewUserDetails(userId) {
    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');
    const user = regularUsers.find(u => u.id === userId);

    if (user) {
        alert(`User Details:\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nJoined: ${new Date(user.joinDate).toLocaleDateString()}\nStatus: ${user.status}`);
    }
}

function toggleUserStatus(userId) {
    const regularUsers = JSON.parse(localStorage.getItem('regularUsers') || '[]');
    const index = regularUsers.findIndex(u => u.id === userId);

    if (index !== -1) {
        regularUsers[index].status = regularUsers[index].status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('regularUsers', JSON.stringify(regularUsers));
        loadRegularUsers();
        updateUserStats();
    }
}
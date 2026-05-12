// Admin login logs JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadLoginLogs();
});

function loadLoginLogs() {
    const logs = JSON.parse(localStorage.getItem('adminLoginLogs') || '[]');
    const logsList = document.getElementById('login-logs-list');

    if (!logsList) return;

    if (logs.length === 0) {
        logsList.innerHTML = '<p>No login logs available.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Admin Email</th>
                    <th>Username</th>
                    <th>Location</th>
                    <th>Device Info</th>
                </tr>
            </thead>
            <tbody>
    `;

    logs.forEach(log => {
        const locationStr = log.location ?
            `${log.location.latitude.toFixed(4)}, ${log.location.longitude.toFixed(4)}` :
            'Not available';

        tableHTML += `
            <tr>
                <td>${log.date}</td>
                <td>${log.time}</td>
                <td>${log.email}</td>
                <td>${log.username}</td>
                <td>${locationStr}</td>
                <td>${log.deviceInfo.substring(0, 50)}...</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    logsList.innerHTML = tableHTML;
}

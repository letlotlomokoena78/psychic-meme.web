// Third party login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupThirdPartyLogin();
});

function setupThirdPartyLogin() {
    const googleBtn = document.getElementById('google-login');
    const facebookBtn = document.getElementById('facebook-login');
    const twitterBtn = document.getElementById('twitter-login');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            handleThirdPartyLogin('Google');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            handleThirdPartyLogin('Facebook');
        });
    }

    if (twitterBtn) {
        twitterBtn.addEventListener('click', function() {
            handleThirdPartyLogin('Twitter');
        });
    }
}

function handleThirdPartyLogin(provider) {
    // This is a demo implementation
    // In a real application, you would integrate with OAuth providers
    alert(`${provider} login is not implemented yet. This is a placeholder for OAuth integration.`);

    // For demo purposes, simulate a successful login
    const user = {
        id: `third-party-${Date.now()}`,
        name: `Demo ${provider} User`,
        email: `demo@${provider.toLowerCase()}.com`,
        provider: provider,
        loggedIn: true
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('isLoggedIn', 'true');

    // Redirect to account page
    window.location.href = 'account.html';
}

// === Public site main.js ===

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {

    // Example: navigation links
    const membershipLink = document.querySelector('a[href="membership.html"]');
    if (membershipLink) {
        membershipLink.addEventListener('click', (e) => {
            // You could add analytics, modal pop-ups, etc.
            console.log("Navigating to membership page");
        });
    }

    // Example: login button
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("Login functionality is available on the private site.");
        });
    }

    // Example: subscribe button (if present)
    const subscribeBtn = document.querySelector('#subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async () => {
            alert("Subscription page is coming soon. Monthly subscription: $10.");
        });
    }

    // Smooth scroll for internal links (optional)
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

});

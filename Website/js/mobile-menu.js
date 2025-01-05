// Mobile Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);

    // Toggle menu
    menuToggle.addEventListener('click', function() {
        body.classList.toggle('menu-open');
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        body.classList.remove('menu-open');
    });

    // Close menu when clicking menu items
    const menuItems = document.querySelectorAll('.primary-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            body.classList.remove('menu-open');
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            body.classList.remove('menu-open');
        }
    });

    // Prevent scrolling when menu is open
    function preventDefault(e) {
        e.preventDefault();
    }

    function disableScroll() {
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
    }

    function enableScroll() {
        document.body.removeEventListener('touchmove', preventDefault);
    }

    // Toggle scroll lock with menu
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('menu-open')) {
                disableScroll();
            } else {
                enableScroll();
            }
        });
    });

    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
});

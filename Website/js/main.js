// TROT Website JavaScript

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// FAQ Accordion
document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
        if (detail.open) {
            document.querySelectorAll('details').forEach(otherDetail => {
                if (otherDetail !== detail) {
                    otherDetail.open = false;
                }
            });
        }
    });
});

// Sticky Navigation
const nav = document.querySelector('.documentation-nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('sticky');
        } else {
            nav.classList.remove('sticky');
        }
    });
}

// Copy Code Blocks
document.querySelectorAll('pre.wp-block-code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    
    block.appendChild(button);
    
    button.addEventListener('click', async () => {
        const code = block.querySelector('code').textContent;
        await navigator.clipboard.writeText(code);
        
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
});

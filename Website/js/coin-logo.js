// Coin Logo Interaction
document.addEventListener('DOMContentLoaded', () => {
    const coin = document.querySelector('.coin');
    
    // Add 3D rotation on mouse move
    coin.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = coin.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        coin.style.transform = `
            rotateY(${x * 30}deg)
            rotateX(${-y * 30}deg)
        `;
    });
    
    // Reset rotation when mouse leaves
    coin.addEventListener('mouseleave', () => {
        coin.style.transform = '';
    });
});

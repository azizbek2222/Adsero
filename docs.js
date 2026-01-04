// Koddan nusxa olish funksiyasi
function copyCode(elementId) {
    const codeText = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.background = "#28a745";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "";
        }, 2000);
    }).catch(err => {
        console.error('Copy error:', err);
    });
}

// Sahifa yuklanganda bajariladigan logikalar
document.addEventListener('DOMContentLoaded', () => {
    console.log("Adsero Documentation loaded.");
    
    // Smooth scroll navigation
    document.querySelectorAll('.sidebar nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
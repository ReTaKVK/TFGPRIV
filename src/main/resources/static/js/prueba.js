document.addEventListener('DOMContentLoaded', function() {
// Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1500);
    }

// Add parallax items to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && !document.querySelector('.hero-parallax')) {
        const parallaxContainer = document.createElement('div');
        parallaxContainer.className = 'hero-parallax';

        for (let i = 0; i < 4; i++) {
            const parallaxItem = document.createElement('div');
            parallaxItem.className = 'parallax-item';
            parallaxItem.innerHTML = '<i class="bi bi-car-front"></i>';
            parallaxContainer.appendChild(parallaxItem);
        }

        heroSection.appendChild(parallaxContainer);
    }

// Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

// Scroll reveal animation
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');

        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }

// Add reveal class to elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.classList.contains('reveal')) {
            section.classList.add('reveal');
        }

        const cards = section.querySelectorAll('.card');
        cards.forEach((card, index) => {
            if (!card.classList.contains('reveal')) {
                card.classList.add('reveal');
                card.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    });

    window.addEventListener('scroll', reveal);
    reveal(); // Para elementos visibles al cargar la página

// Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
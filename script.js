// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-menu-open');
            
            // Toggle hamburger icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinkItems = document.querySelectorAll('.nav-links a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('mobile-menu-open');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Form handling
document.querySelector('.contact-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const phone = this.querySelector('input[type="tel"]').value;
    const service = this.querySelector('select').value;
    const message = this.querySelector('textarea').value;
    
    // Basic validation
    if (!name || !email || !phone || !service || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Show success message
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Message Sent!';
    button.style.background = '#10b981';
    
    // Reset form
    this.reset();
    
    // Reset button after 3 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#1e40af';
    }, 3000);
    
    // In a real implementation, you would send this data to your server
    console.log('Form submitted:', { name, email, phone, service, message });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .value, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Click to call functionality for mobile
document.addEventListener('DOMContentLoaded', function() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Track phone call clicks (for analytics)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'phone_call', {
                    'event_category': 'contact',
                    'event_label': 'header_phone'
                });
            }
        });
    });
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Emergency service highlighting
document.addEventListener('DOMContentLoaded', function() {
    const emergencyCard = document.querySelector('.service-card.emergency');
    if (emergencyCard) {
        // Add pulsing effect
        setInterval(() => {
            emergencyCard.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.3)';
            setTimeout(() => {
                emergencyCard.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }, 1000);
        }, 3000);
    }
});

// Scroll to top functionality
window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
        if (!document.querySelector('.scroll-to-top')) {
            const scrollBtn = document.createElement('button');
            scrollBtn.className = 'scroll-to-top';
            scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            scrollBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #1e40af;
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            `;
            
            scrollBtn.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            scrollBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.background = '#1d4ed8';
            });
            
            scrollBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.background = '#1e40af';
            });
            
            document.body.appendChild(scrollBtn);
        }
    } else {
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollBtn) {
            scrollBtn.remove();
        }
    }
});

// Add loading state to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('btn-primary') && this.closest('form')) {
                return; // Let form handle this
            }
            
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
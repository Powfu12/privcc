/**
 * 1CARD - Premium Prepaid Credit Cards Landing Page
 * JavaScript - Interactive Elements & Animations
 * Production-Ready Code with Optimizations
 */

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCardFlip();
    initializeFAQ();
    initializeScrollAnimations();
    initializeButtons();
    initializeScrollToTop();
});

// ==================== NAVIGATION ====================
/**
 * Initialize mobile hamburger menu functionality
 */
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideNav = navMenu.contains(e.target);
        const isClickInsideHamburger = hamburger.contains(e.target);
        
        if (!isClickInsideNav && !isClickInsideHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close menu on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ==================== CARD SPIN ANIMATION ====================
/**
 * Initialize 3D card spin functionality
 * Card automatically spins continuously
 */
function initializeCardFlip() {
    // Card spins automatically via CSS animation
    // No user interaction needed
}

// ==================== FAQ ACCORDION ====================
/**
 * Initialize FAQ accordion functionality
 */
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Allow keyboard navigation
    faqQuestions.forEach((question, index) => {
        question.addEventListener('keydown', function(e) {
            let nextQuestion;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                nextQuestion = faqQuestions[index + 1];
                if (nextQuestion) nextQuestion.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                nextQuestion = faqQuestions[index - 1];
                if (nextQuestion) nextQuestion.focus();
            }
        });
    });
}

// ==================== SCROLL ANIMATIONS ====================
/**
 * Initialize scroll-based animations for elements
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe step cards and pricing cards
    const animatedElements = document.querySelectorAll('.step-card, .pricing-card, .review-card');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
}

// ==================== BUTTON EVENT LISTENERS ====================
/**
 * Initialize all CTA button click handlers
 */
function initializeButtons() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    const reviewsBtn = document.getElementById('reviewsBtn');
    const pricingCtaButtons = document.querySelectorAll('.pricing-cta');
    const finalCtaButton = document.querySelector('.final-cta .cta-primary');

    // Shop Now button
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function() {
            handleShopNowClick();
        });
    }

    // Reviews button
    if (reviewsBtn) {
        reviewsBtn.addEventListener('click', function() {
            scrollToSection('#reviews');
        });
    }

    // Pricing CTA buttons
    pricingCtaButtons.forEach(button => {
        button.addEventListener('click', function() {
            handlePricingClick(this);
        });
    });

    // Final CTA button
    if (finalCtaButton) {
        finalCtaButton.addEventListener('click', function() {
            handleShopNowClick();
        });
    }
}

/**
 * Handle Shop Now button click
 */
function handleShopNowClick() {
    
    // Simulate navigation after a brief delay
    setTimeout(function() {
        // In production, replace with actual checkout URL
        console.log('Redirecting to checkout page');
        // window.location.href = 'https://your-checkout-page.com';
    }, 2000);
}

/**
 * Handle pricing package selection
 */
function handlePricingClick(element) {
    const priceCard = element.closest('.pricing-card');
    const packageName = priceCard.querySelector('h3').textContent;
    const price = priceCard.querySelector('.price').textContent;
    
    
    // In production, add to cart or redirect to checkout
    console.log(`Package selected: ${packageName} - ${price}`);
}

/**
 * Smooth scroll to a specific section
 */
function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== SCROLL TO TOP ====================
/**
 * Initialize scroll-to-top button functionality
 */
function initializeScrollToTop() {
    // Create scroll-to-top button if it doesn't exist
    if (!document.querySelector('.scroll-to-top')) {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==================== NOTIFICATION SYSTEM ====================
/**
 * Display a notification message to the user
 * @param {string} message - The notification message
 * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background-color: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-height: 50px;
    `;

    // Add icon
    const icon = document.createElement('i');
    icon.className = `fas ${getNotificationIcon(type)}`;
    notification.appendChild(icon);

    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);

    // Add to container
    notificationContainer.appendChild(notification);

    // Remove notification after duration
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, duration);
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type) {
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    return colors[type] || colors.info;
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ==================== FORM VALIDATION ====================
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate form inputs
 */
function validateForm(formElement) {
    let isValid = true;
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            markFieldAsInvalid(input);
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            markFieldAsInvalid(input);
            isValid = false;
        } else {
            markFieldAsValid(input);
        }
    });

    return isValid;
}

/**
 * Mark field as invalid
 */
function markFieldAsInvalid(field) {
    field.style.borderColor = '#f44336';
    field.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.2)';
}

/**
 * Mark field as valid
 */
function markFieldAsValid(field) {
    field.style.borderColor = '#4caf50';
    field.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.2)';
}

// ==================== ANALYTICS & TRACKING ====================
/**
 * Track user interactions for analytics
 */
function trackEvent(eventName, eventData = {}) {
    // Log event (in production, send to analytics service like Google Analytics)
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Send to Google Analytics
    // if (window.gtag) {
    //     gtag('event', eventName, eventData);
    // }
}

// Track CTA clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cta-primary') || e.target.classList.contains('cta-secondary')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('cta_click', { button: buttonText });
    }
});

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.tagName === 'FORM') {
        trackEvent('form_submit', { form: e.target.name || 'unknown' });
    }
});

// ==================== PERFORMANCE OPTIMIZATIONS ====================
/**
 * Lazy load images (if images are added)
 */
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Debounce function to limit function calls
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format price with currency
 */
function formatPrice(price, currency = '€') {
    return `${currency}${parseFloat(price).toFixed(2)}`;
}

/**
 * Get current date in formatted string
 */
function getCurrentDate() {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ==================== ACCESSIBILITY FEATURES ====================
/**
 * Add ARIA attributes for better accessibility
 */
function initializeAccessibility() {
    // Add ARIA labels to buttons without text
    document.querySelectorAll('button i:only-child').forEach(icon => {
        const button = icon.parentElement;
        if (!button.getAttribute('aria-label')) {
            const text = button.textContent || icon.className;
            button.setAttribute('aria-label', text);
        }
    });

    // Add role="main" to main content areas
    const mainSections = document.querySelectorAll('section');
    mainSections.forEach((section, index) => {
        if (index === 0) {
            section.setAttribute('role', 'main');
        }
    });

    // Ensure all interactive elements are keyboard accessible
    document.querySelectorAll('button, a[href], input').forEach(element => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    });
}

// ==================== DEVELOPMENT MODE ====================
/**
 * Log browser and performance information
 */
function logPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const connectTime = timing.responseEnd - timing.requestStart;
        const renderTime = timing.domComplete - timing.domLoading;

        console.log('=== Performance Metrics ===');
        console.log(`Total Load Time: ${loadTime}ms`);
        console.log(`Connection Time: ${connectTime}ms`);
        console.log(`Render Time: ${renderTime}ms`);
    }
}

// ==================== INITIALIZATION COMPLETE ====================
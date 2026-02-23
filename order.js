// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAftSnrCDt34hbl0_HCOfFB9ehUdiXL3sw",
    authDomain: "onecard-ce39b.firebaseapp.com",
    databaseURL: "https://onecard-ce39b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "onecard-ce39b",
    storageBucket: "onecard-ce39b.firebasestorage.app",
    messagingSenderId: "163529886210",
    appId: "1:163529886210:web:76196a43671fec10afb51b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Current step
let currentStep = 1;

// Store form data
const formData = {
    personalInfo: {},
    shippingInfo: {},
    paymentMethod: '',
    payOnDelivery: false,
    orderDetails: {
        package: 'Basic Package',
        packagePrice: 100,
        shippingPrice: 20,
        totalPrice: 120
    }
};

// Detect package type from page
function detectPackageType() {
    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    if (filename === 'orderstandard.html') {
        formData.orderDetails = {
            package: 'Standard Package',
            packagePrice: 150,
            shippingPrice: 20,
            totalPrice: 170
        };
    } else if (filename === 'orderpro.html') {
        formData.orderDetails = {
            package: 'Professional Package',
            packagePrice: 250,
            shippingPrice: 20,
            totalPrice: 270
        };
    }
    // Default is Basic Package (already set)
}

// Initialize package type
detectPackageType();

// ==================== FIELD VALIDATION RULES ====================
const fieldRules = {
    fullName: {
        pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{2,100}$/,
        message: 'Full name must be 2–100 letters (no numbers or special characters)'
    },
    phone: {
        pattern: /^[\+]?[\d\s\-\(\)]{7,20}$/,
        message: 'Enter a valid phone number (7–20 digits, spaces, +, -, or parentheses)'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        message: 'Enter a valid email address (e.g. name@example.com)'
    },
    telegram: {
        pattern: /^@[A-Za-z0-9_]{4,32}$/,
        message: 'Telegram username must start with @ and be 5–32 characters (letters, numbers, underscores only)'
    },
    address: {
        pattern: /^.{5,200}$/,
        message: 'Enter a valid street address (at least 5 characters)'
    },
    city: {
        pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]{2,100}$/,
        message: 'City name must be at least 2 letters (no numbers)'
    },
    postalCode: {
        pattern: /^[A-Za-z0-9\s\-]{3,10}$/,
        message: 'Enter a valid postal code (3–10 characters, letters and numbers only)'
    },
    state: {
        pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]{2,100}$/,
        message: 'State/Province must be at least 2 letters (no numbers)'
    }
};

// ==================== INITIALIZE EVENT LISTENERS ====================
// Modules load after DOM, so we can attach directly
console.log('Order system loading...');

// Wait a bit to ensure DOM is ready
setTimeout(function() {
    console.log('Attaching button listeners...');

    // Get all buttons with data attributes
    const nextButtons = document.querySelectorAll('button[data-next-step]');
    const prevButtons = document.querySelectorAll('button[data-prev-step]');
    const confirmButton = document.querySelector('button[data-confirm-order]');

    console.log('Found buttons:', {
        next: nextButtons.length,
        prev: prevButtons.length,
        confirm: confirmButton ? 1 : 0
    });

    // Attach next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const step = parseInt(this.getAttribute('data-next-step'));
            console.log('Next button clicked, going to step:', step);
            nextStep(step);
        });
    });

    // Attach previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const step = parseInt(this.getAttribute('data-prev-step'));
            console.log('Prev button clicked, going to step:', step);
            prevStep(step);
        });
    });

    // Attach confirm button
    if (confirmButton) {
        confirmButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Confirm button clicked');
            confirmOrder();
        });
    }

    // Set up character filtering and blur validation
    setupCharacterFiltering();
    setupBlurValidation();

    console.log('All button listeners attached successfully!');
}, 100);

// ==================== STEP NAVIGATION ====================
function nextStep(step) {
    console.log('Next step:', step, 'Current:', currentStep);

    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
        return;
    }

    // Save current step data
    saveStepData(currentStep);

    // Move to next step
    currentStep = step;
    showStep(step);
    updateProgress(step);
}

function prevStep(step) {
    console.log('Previous step:', step);
    currentStep = step;
    showStep(step);
    updateProgress(step);
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });

    // Show current step
    const stepElement = document.getElementById('step' + step);
    if (stepElement) {
        stepElement.classList.add('active');
    }

    // Show Telegram modal the first time user enters the payment step
    if (step === 3 && !window.telegramConfirmed) {
        setTimeout(showTelegramModal, 350);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== TELEGRAM MODAL ====================
function showTelegramModal() {
    const overlay = document.getElementById('telegramModal');
    if (!overlay) return;
    overlay.classList.add('active');

    const continueBtn = document.getElementById('telegramModalContinue');
    if (continueBtn) {
        continueBtn.onclick = function() {
            hideTelegramModal();
            window.telegramConfirmed = true;
        };
    }
}

function hideTelegramModal() {
    const overlay = document.getElementById('telegramModal');
    if (overlay) overlay.classList.remove('active');
}

function updateProgress(step) {
    // Update progress bar
    const progress = ((step - 1) / 3) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((s, index) => {
        if (index + 1 <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

// ==================== VALIDATION ====================
function showFieldError(input, message) {
    clearFieldError(input);
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    errorSpan.id = 'error-' + input.id;
    input.parentNode.appendChild(errorSpan);
    input.classList.add('error');
}

function clearFieldError(input) {
    const existing = document.getElementById('error-' + input.id);
    if (existing) existing.remove();
    input.classList.remove('error');
}

function validateField(input) {
    const value = input.value.trim();
    const rule = fieldRules[input.id];

    if (!value) {
        showFieldError(input, 'This field is required');
        return false;
    }

    if (rule && rule.pattern && !rule.pattern.test(value)) {
        showFieldError(input, rule.message);
        return false;
    }

    clearFieldError(input);
    return true;
}

function validateStep(step) {
    const stepElement = document.getElementById('step' + step);
    const inputs = stepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
        // Clear error as user corrects the field
        input.addEventListener('input', function() {
            if (this.value.trim()) clearFieldError(this);
        }, { once: true });
    });

    // Check radio buttons for payment step
    if (step === 3) {
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        if (!paymentSelected) {
            showNotification('Please select a payment method', 'error');
            return false;
        }
    }

    if (!isValid) {
        showNotification('Please fix the errors highlighted below', 'error');
    }

    return isValid;
}

// ==================== CHARACTER FILTERING ====================
function setupCharacterFiltering() {
    // Full Name: letters, spaces, hyphens, apostrophes only
    const fullName = document.getElementById('fullName');
    if (fullName) {
        fullName.addEventListener('input', function() {
            const pos = this.selectionStart;
            const cleaned = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, '');
            if (cleaned !== this.value) {
                this.value = cleaned;
                this.setSelectionRange(pos - 1, pos - 1);
            }
        });
    }

    // Phone: digits, +, -, spaces, parentheses only
    const phone = document.getElementById('phone');
    if (phone) {
        phone.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d\s\+\-\(\)]/g, '');
        });
    }

    // Telegram: auto-prefix @, block spaces and invalid chars
    const telegram = document.getElementById('telegram');
    if (telegram) {
        telegram.addEventListener('focus', function() {
            if (!this.value) this.value = '@';
        });
        telegram.addEventListener('blur', function() {
            if (this.value === '@') this.value = '';
        });
        telegram.addEventListener('input', function() {
            let val = this.value.replace(/[^@A-Za-z0-9_]/g, '');
            // Ensure exactly one @ at the start
            val = val.replace(/@/g, '');
            val = '@' + val;
            this.value = val;
        });
    }

    // City: letters, spaces, hyphens, apostrophes, dots only
    const city = document.getElementById('city');
    if (city) {
        city.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]/g, '');
        });
    }

    // Postal Code: uppercase alphanumeric, spaces, hyphens
    const postalCode = document.getElementById('postalCode');
    if (postalCode) {
        postalCode.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-z0-9\s\-]/g, '').toUpperCase();
        });
    }

    // State/Province: letters, spaces, hyphens, apostrophes, dots only
    const state = document.getElementById('state');
    if (state) {
        state.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]/g, '');
        });
    }
}

// ==================== BLUR-TIME VALIDATION ====================
function setupBlurValidation() {
    Object.keys(fieldRules).forEach(function(fieldId) {
        const input = document.getElementById(fieldId);
        if (!input) return;

        input.addEventListener('blur', function() {
            if (this.value.trim()) validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.value.trim()) clearFieldError(this);
        });
    });
}

// ==================== SAVE STEP DATA ====================
function saveStepData(step) {
    if (step === 1) {
        // Personal Information
        formData.personalInfo = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            telegram: document.getElementById('telegram').value
        };
    } else if (step === 2) {
        // Shipping Information
        formData.shippingInfo = {
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            state: document.getElementById('state').value,
            country: document.getElementById('country').value
        };
    } else if (step === 3) {
        // Payment Method
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        formData.paymentMethod = paymentMethod ? paymentMethod.value : '';

        // Update confirmation page
        updateConfirmationPage();
    } else if (step === 4) {
        // Pay on Delivery option
        const payOnDeliveryCheckbox = document.getElementById('payOnDelivery');
        formData.payOnDelivery = payOnDeliveryCheckbox ? payOnDeliveryCheckbox.checked : false;
        
        // Update prices if pay on delivery is selected
        updatePricesForPayOnDelivery();
    }
}

// ==================== UPDATE CONFIRMATION PAGE ====================
function updateConfirmationPage() {
    // Personal Info
    document.getElementById('confirmName').textContent = formData.personalInfo.fullName;
    document.getElementById('confirmPhone').textContent = formData.personalInfo.phone;
    document.getElementById('confirmEmail').textContent = formData.personalInfo.email;
    document.getElementById('confirmTelegram').textContent = formData.personalInfo.telegram;

    // Shipping Info
    document.getElementById('confirmAddress').textContent = formData.shippingInfo.address;
    document.getElementById('confirmCity').textContent = formData.shippingInfo.city;
    document.getElementById('confirmPostal').textContent = formData.shippingInfo.postalCode;
    document.getElementById('confirmState').textContent = formData.shippingInfo.state;
    document.getElementById('confirmCountry').textContent = formData.shippingInfo.country;

    // Payment Method
    document.getElementById('confirmPayment').textContent = formData.paymentMethod;
    
    // Set up pay on delivery checkbox listener
    const payOnDeliveryCheckbox = document.getElementById('payOnDelivery');
    if (payOnDeliveryCheckbox) {
        payOnDeliveryCheckbox.addEventListener('change', updatePricesForPayOnDelivery);
    }
}

// ==================== UPDATE PRICES FOR PAY ON DELIVERY ====================
function updatePricesForPayOnDelivery() {
    const payOnDeliveryCheckbox = document.getElementById('payOnDelivery');
    const isPayOnDelivery = payOnDeliveryCheckbox ? payOnDeliveryCheckbox.checked : false;
    
    const priceSummary = document.querySelector('.price-summary');
    if (!priceSummary) return;
    
    const packagePriceRow = priceSummary.querySelector('.price-row:first-child');
    const totalRow = priceSummary.querySelector('.price-row.total');
    
    if (!packagePriceRow || !totalRow) return;
    
    const originalPackagePrice = formData.orderDetails.packagePrice;
    const shippingPrice = formData.orderDetails.shippingPrice;
    
    if (isPayOnDelivery) {
        // Cross out the original package price
        const packageLabel = packagePriceRow.querySelector('span:first-child');
        const packageValue = packagePriceRow.querySelector('span:last-child');
        
        packageLabel.innerHTML = `${formData.orderDetails.package}`;
        // Cross out the package price
        packageValue.textContent = `€${originalPackagePrice.toFixed(2)}`;
        packageValue.classList.add('price-modified');
        
        // Update total to €20 (just the shipping fee) and highlight it
        const totalValue = totalRow.querySelector('span:last-child');
        totalValue.textContent = '€20.00';
        totalValue.classList.remove('price-modified');
        totalValue.classList.add('price-highlight');
        
        // Update form data
        formData.orderDetails.totalPrice = 20;
        formData.payOnDelivery = true;
    } else {
        // Restore original display
        const packageLabel = packagePriceRow.querySelector('span:first-child');
        const packageValue = packagePriceRow.querySelector('span:last-child');
        
        packageLabel.textContent = `${formData.orderDetails.package}`;
        packageValue.textContent = `€${originalPackagePrice.toFixed(2)}`;
        packageValue.classList.remove('price-modified');
        
        // Update total to original amount
        const originalTotal = originalPackagePrice + shippingPrice;
        const totalValue = totalRow.querySelector('span:last-child');
        totalValue.textContent = `€${originalTotal.toFixed(2)}`;
        totalValue.classList.remove('price-modified', 'price-highlight');
        
        // Update form data
        formData.orderDetails.totalPrice = originalTotal;
        formData.payOnDelivery = false;
    }
}

// ==================== CONFIRM ORDER ====================
async function confirmOrder() {
    try {
        // Generate order code
        const orderCode = generateOrderCode();

        // Prepare order data for Firebase
        const orderData = {
            orderCode: orderCode,
            personalInfo: formData.personalInfo,
            shippingInfo: formData.shippingInfo,
            paymentMethod: formData.paymentMethod,
            orderDetails: formData.orderDetails,
            orderDate: new Date().toISOString(),
            status: 'Pending'
        };

        // Save to Firebase
        const ordersRef = ref(database, 'orders');
        const newOrderRef = push(ordersRef);
        await set(newOrderRef, orderData);

// Crypto and Credit Card use the Helio checkout flow
if (formData.paymentMethod === 'Crypto' || formData.paymentMethod === 'Credit Card') {
    let cryptoPage = 'index.html';

    // Use a dedicated crypto page for Basic package
    if (formData.orderDetails.package === 'Basic Package') {
        cryptoPage = 'crypto-confirmbasic.html';
    }
        // Use a dedicated crypto page for Standard package
    if (formData.orderDetails.package === 'Standard Package') {
        // If pay on delivery is selected, use the delivery confirmation page
        if (formData.payOnDelivery) {
            cryptoPage = 'crypto-confirmdelivery.html';
        } else {
            cryptoPage = 'crypto-confirmstandard.html';
        }
    }
        // Use a dedicated crypto page for Professional package
    if (formData.orderDetails.package === 'Professional Package') {
        // If pay on delivery is selected, use the delivery confirmation page
        if (formData.payOnDelivery) {
            cryptoPage = 'crypto-confirmdelivery.html';
        } else {
            cryptoPage = 'crypto-confirmpro.html';
        }
    }

    const cryptoUrl = `${cryptoPage}?orderCode=${orderCode}&package=${encodeURIComponent(
        formData.orderDetails.package
    )}&totalPrice=${formData.orderDetails.totalPrice}&name=${encodeURIComponent(
        formData.personalInfo.fullName
    )}&email=${encodeURIComponent(formData.personalInfo.email)}&payOnDelivery=${formData.payOnDelivery}`;

    window.location.href = cryptoUrl;
} else {
    // Show success page for voucher/card payment methods
    document.getElementById('orderCode').textContent = orderCode;

    // Hide step 4, show success
    document.getElementById('step4').classList.remove('active');
    document.getElementById('stepSuccess').classList.add('active');

    // Update progress to 100%
    document.getElementById('progressFill').style.width = '100%';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Copy order code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', function() {
            const code = document.getElementById('orderCode').textContent;
            const btn = this;
            function onCopied() {
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(function() { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
            }
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(onCopied);
            } else {
                const ta = document.createElement('textarea');
                ta.value = code;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                onCopied();
            }
        });
    }

    // Start 24-hour payment countdown
    startCountdown(orderCode);

    showNotification('Order placed! Contact @onecardadmin on Telegram with your order code to pay.', 'success');
}

    } catch (error) {
        console.error('Error saving order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

// ==================== 24-HOUR COUNTDOWN ====================
function startCountdown(orderCode) {
    const storageKey = 'order_deadline_' + orderCode;
    let deadline = localStorage.getItem(storageKey);

    if (!deadline) {
        deadline = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        localStorage.setItem(storageKey, String(deadline));
    }

    deadline = parseInt(deadline);

    function tick() {
        const remaining = deadline - Date.now();
        const cdHours   = document.getElementById('cdHours');
        const cdMinutes = document.getElementById('cdMinutes');
        const cdSeconds = document.getElementById('cdSeconds');
        const card      = document.getElementById('countdownCard');

        if (!cdHours) return; // page changed, stop ticking

        if (remaining <= 0) {
            cdHours.textContent   = '00';
            cdMinutes.textContent = '00';
            cdSeconds.textContent = '00';
            if (card) card.classList.add('expired');
            return;
        }

        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);

        cdHours.textContent   = String(h).padStart(2, '0');
        cdMinutes.textContent = String(m).padStart(2, '0');
        cdSeconds.textContent = String(s).padStart(2, '0');

        setTimeout(tick, 1000);
    }

    tick();
}

// ==================== GENERATE ORDER CODE ====================
function generateOrderCode() {
    const prefix = '1CARD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 1rem;
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

    // Remove notification after 4 seconds
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 4000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#d4af37',
        error: '#f44336',
        warning: '#ff9800',
        info: '#d4af37'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ==================== ANIMATION STYLES ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    input.error {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
    }
`;
document.head.appendChild(style);

console.log('Order system initialized');

// ==================== PAYMENT METHOD HINTS ====================
(function () {
    var hints = {
        'Crypto':       'pmHintCrypto',
        'Credit Card':  'pmHintCC',
        'CryptoVoucher':'pmHintCV',
        'Paysafecard':  'pmHintPS'
    };

    function showHint(value) {
        Object.values(hints).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('visible');
        });
        if (value && hints[value]) {
            var target = document.getElementById(hints[value]);
            if (target) target.classList.add('visible');
        }
    }

    document.addEventListener('change', function (e) {
        if (e.target && e.target.name === 'payment') {
            showHint(e.target.value);
        }
    });
})();

// ==================== MOBILE TRUST BAR — HIDE ON SUCCESS ====================
(function () {
    var bar = document.getElementById('mobileTrustBar');
    if (!bar) return;

    var observer = new MutationObserver(function () {
        var success = document.getElementById('stepSuccess');
        if (success && success.classList.contains('active')) {
            bar.classList.add('hidden');
        }
    });

    var form = document.getElementById('orderForm');
    if (form) {
        observer.observe(form, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
})();

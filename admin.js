// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getDatabase,
    ref,
    onValue,
    update,
    off
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyAftSnrCDt34hbl0_HCOfFB9ehUdiXL3sw",
    authDomain: "onecard-ce39b.firebaseapp.com",
    databaseURL: "https://onecard-ce39b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "onecard-ce39b",
    storageBucket: "onecard-ce39b.firebasestorage.app",
    messagingSenderId: "360886935026",
    appId: "1:360886935026:web:03e68ac6e50e34e50b1fc3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Admin Configuration
const ADMIN_PASSWORD = "onecard2024admin"; // Change this to a secure password
const AUTH_KEY = "onecard_admin_auth";

// Global State
let ordersListener = null;
let allOrders = [];
let filteredOrders = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const ordersContainer = document.getElementById('ordersContainer');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');

// Statistics Elements
const totalOrdersEl = document.getElementById('totalOrders');
const totalRevenueEl = document.getElementById('totalRevenue');
const pendingPaymentsEl = document.getElementById('pendingPayments');
const shippedOrdersEl = document.getElementById('shippedOrders');

// Authentication
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuthenticated) {
        showDashboard();
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = adminPassword.value;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        showDashboard();
        loginError.textContent = '';
        adminPassword.value = '';
    } else {
        loginError.textContent = 'Invalid password';
        adminPassword.value = '';
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    cleanupListeners();
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
});

function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    initializeDashboard();
}

// Dashboard Initialization
function initializeDashboard() {
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    ordersContainer.innerHTML = '';

    // Clean up existing listener
    cleanupListeners();

    // Set up real-time listener
    const ordersRef = ref(database, 'orders');
    ordersListener = onValue(ordersRef, (snapshot) => {
        const ordersData = snapshot.val();

        if (!ordersData) {
            allOrders = [];
            filteredOrders = [];
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
            updateStatistics();
            return;
        }

        // Convert to array with Firebase keys
        allOrders = Object.entries(ordersData).map(([key, order]) => ({
            firebaseKey: key,
            ...order
        }));

        // Sort by date (newest first)
        allOrders.sort((a, b) => {
            const dateA = new Date(a.orderDate || a.createdAt || 0);
            const dateB = new Date(b.orderDate || b.createdAt || 0);
            return dateB - dateA;
        });

        // Apply filters
        applyFilters();

        loadingState.style.display = 'none';
    }, (error) => {
        console.error('Error fetching orders:', error);
        showToast('Error loading orders. Please refresh.', 'error');
        loadingState.style.display = 'none';
    });
}

function cleanupListeners() {
    if (ordersListener) {
        const ordersRef = ref(database, 'orders');
        off(ordersRef);
        ordersListener = null;
    }
}

// Filter and Search
statusFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

function applyFilters() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();

    filteredOrders = allOrders.filter(order => {
        // Status filter
        const statusMatch = statusValue === 'all' || getOrderStatus(order) === statusValue;

        // Search filter
        const searchMatch = !searchValue ||
            (order.personalInfo?.fullName || '').toLowerCase().includes(searchValue) ||
            (order.personalInfo?.email || '').toLowerCase().includes(searchValue) ||
            (order.personalInfo?.phone || '').toLowerCase().includes(searchValue) ||
            (order.orderCode || '').toLowerCase().includes(searchValue);

        return statusMatch && searchMatch;
    });

    renderOrders();
    updateStatistics();
}

// Get Order Status (with migration from old status system)
function getOrderStatus(order) {
    // If new status exists, use it
    if (order.orderStatus) {
        return order.orderStatus;
    }

    // Migrate old status to new system
    if (order.status === 'Paid' || order.paymentStatus === 'Completed') {
        return 'Delivery Paid'; // Default for paid orders
    }

    return 'Waiting to Pay Delivery'; // Default for pending orders
}

// Render Orders
function renderOrders() {
    ordersContainer.innerHTML = '';

    if (filteredOrders.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

// Create Order Card
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const status = getOrderStatus(order);
    const statusClass = getStatusClass(status);

    const orderDate = new Date(order.orderDate || order.createdAt || Date.now());
    const formattedDate = orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const totalPrice = order.orderDetails?.totalPrice || order.totalPrice || 0;
    const packageName = order.orderDetails?.package || order.package || 'N/A';

    card.innerHTML = `
        <div class="order-header">
            <div class="order-header-left">
                <div class="order-code">${escapeHtml(order.orderCode || 'N/A')}</div>
                <div class="order-date">${formattedDate}</div>
            </div>
            <div class="order-header-right">
                <div class="order-total">€${totalPrice.toFixed(2)}</div>
            </div>
        </div>

        <div class="order-body">
            <!-- Customer Info -->
            <div class="info-section">
                <div class="info-label">Customer</div>
                <div class="info-content">
                    <div class="info-row">
                        <span class="info-icon">👤</span>
                        <span class="info-text">${escapeHtml(order.personalInfo?.fullName || 'N/A')}</span>
                        <button class="copy-btn" data-copy="${escapeHtml(order.personalInfo?.fullName || '')}" title="Copy name">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📧</span>
                        <span class="info-text">${escapeHtml(order.personalInfo?.email || 'N/A')}</span>
                        <button class="copy-btn" data-copy="${escapeHtml(order.personalInfo?.email || '')}" title="Copy email">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📱</span>
                        <span class="info-text">${escapeHtml(order.personalInfo?.phone || 'N/A')}</span>
                        <button class="copy-btn" data-copy="${escapeHtml(order.personalInfo?.phone || '')}" title="Copy phone">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                    ${order.personalInfo?.telegram ? `
                    <div class="info-row">
                        <span class="info-icon">✈️</span>
                        <span class="info-text">${escapeHtml(order.personalInfo.telegram)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Shipping Info -->
            <div class="info-section">
                <div class="info-label">Shipping Address</div>
                <div class="info-content">
                    <div class="shipping-address">
                        ${escapeHtml(order.shippingInfo?.address || 'N/A')}<br>
                        ${escapeHtml(order.shippingInfo?.city || '')}, ${escapeHtml(order.shippingInfo?.state || '')} ${escapeHtml(order.shippingInfo?.postalCode || '')}<br>
                        ${escapeHtml(order.shippingInfo?.country || '')}
                    </div>
                    <button class="copy-btn copy-btn-full" data-copy="${getFullShippingAddress(order)}" title="Copy full address">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Address
                    </button>
                </div>
            </div>

            <!-- Order Details -->
            <div class="info-section">
                <div class="info-label">Order Details</div>
                <div class="info-content">
                    <div class="package-name">${escapeHtml(packageName)}</div>
                    <div class="payment-method">Payment: ${escapeHtml(order.paymentMethod || 'N/A')}</div>
                </div>
            </div>

            <!-- Status Management -->
            <div class="info-section">
                <div class="info-label">Order Status</div>
                <div class="status-controls">
                    <select class="status-select ${statusClass}" data-order-key="${order.firebaseKey}">
                        <option value="Waiting to Pay Delivery" ${status === 'Waiting to Pay Delivery' ? 'selected' : ''}>Waiting to Pay Delivery</option>
                        <option value="Delivery Paid" ${status === 'Delivery Paid' ? 'selected' : ''}>Delivery Paid</option>
                        <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Paid Full" ${status === 'Paid Full' ? 'selected' : ''}>Paid Full</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // Attach copy button listeners
    const copyButtons = card.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            copyToClipboard(textToCopy);
        });
    });

    // Attach status change listener
    const statusSelect = card.querySelector('.status-select');
    statusSelect.addEventListener('change', (e) => {
        updateOrderStatus(order.firebaseKey, e.target.value);
    });

    return card;
}

// Get Full Shipping Address for Clipboard
function getFullShippingAddress(order) {
    const si = order.shippingInfo || {};
    return `${order.personalInfo?.fullName || 'N/A'}
${si.address || ''}
${si.city || ''}, ${si.state || ''} ${si.postalCode || ''}
${si.country || ''}
Phone: ${order.personalInfo?.phone || 'N/A'}`;
}

// Update Order Status
async function updateOrderStatus(firebaseKey, newStatus) {
    try {
        const orderRef = ref(database, `orders/${firebaseKey}`);
        await update(orderRef, {
            orderStatus: newStatus,
            lastUpdated: new Date().toISOString()
        });

        showToast(`Status updated to: ${newStatus}`, 'success');

        // Statistics will update automatically via real-time listener
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
    }
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied ✓', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast('Failed to copy', 'error');
    }
}

// Update Statistics
function updateStatistics() {
    const total = allOrders.length;
    let revenue = 0;
    let pending = 0;
    let shipped = 0;

    allOrders.forEach(order => {
        const status = getOrderStatus(order);
        const price = order.orderDetails?.totalPrice || order.totalPrice || 0;

        // Revenue only from Delivery Paid and Paid Full
        if (status === 'Delivery Paid' || status === 'Paid Full') {
            revenue += price;
        }

        // Count pending
        if (status === 'Waiting to Pay Delivery') {
            pending++;
        }

        // Count shipped
        if (status === 'Shipped') {
            shipped++;
        }
    });

    totalOrdersEl.textContent = total;
    totalRevenueEl.textContent = `€${revenue.toFixed(2)}`;
    pendingPaymentsEl.textContent = pending;
    shippedOrdersEl.textContent = shipped;
}

// Get Status Class for Styling
function getStatusClass(status) {
    switch (status) {
        case 'Waiting to Pay Delivery':
            return 'status-waiting';
        case 'Delivery Paid':
            return 'status-delivery-paid';
        case 'Shipped':
            return 'status-shipped';
        case 'Paid Full':
            return 'status-paid-full';
        default:
            return 'status-waiting';
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast toast-${type} toast-show`;

    setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3000);
}

// HTML Escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
checkAuth();

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupListeners);
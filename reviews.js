// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, query, orderByChild, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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

console.log('🔥 Firebase Initialized for Reviews');

// State
let selectedRating = 0;
let uploadedImage = null;
let uploadedImageFile = null;

// ==================== UTILITIES ====================
function generateReviewId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `REV-${timestamp}-${random}`;
}

function createStarsHTML(ratingNumber) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="fas fa-star star ${i <= ratingNumber ? 'filled' : ''}"></i>`;
    }
    return starsHTML;
}

function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function hasLiked(reviewId) {
    return localStorage.getItem('liked_' + reviewId) === 'true';
}

function markLiked(reviewId) {
    localStorage.setItem('liked_' + reviewId, 'true');
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(.98)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// ==================== STAR RATING ====================
const ratingLabelEl = document.getElementById('ratingLabel');
const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        selectedRating = parseInt(this.getAttribute('data-rating'));

        document.querySelectorAll('.star-btn').forEach((star, index) => {
            if (index < selectedRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        ratingLabelEl.textContent = `${selectedRating} star${selectedRating > 1 ? 's' : ''} - ${starLabels[selectedRating - 1]}`;
    });
});

// ==================== IMAGE UPLOAD ====================
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImageBtn');

imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }

    uploadedImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

removeImageBtn.addEventListener('click', function() {
    imageUpload.value = '';
    uploadedImageFile = null;
    uploadedImage = null;
    imagePreview.style.display = 'none';
    previewImg.src = '';
});

// ==================== CREATE REVIEW CARD ====================
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    const authorName = review.authorName || 'Customer';
    const authorInitial = authorName.charAt(0).toUpperCase();

    const dateObj = new Date(review.timestamp || Date.now());
    const dateStr = dateObj.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const likesCount = review.likes ? Number(review.likes) : 0;
    const userAlreadyLiked = hasLiked(review.reviewId);

    card.innerHTML = `
        <div class="review-header">
            <div class="review-author">
                <div class="author-avatar">${escapeHTML(authorInitial)}</div>
                <div class="author-info">
                    <h4>${escapeHTML(authorName)}</h4>
                    <div class="review-date">${escapeHTML(dateStr)}</div>
                </div>
            </div>
            <div class="review-rating">
                ${createStarsHTML(review.rating || 0)}
            </div>
        </div>

        <div class="review-body">
            <div class="review-content">
                <p class="review-text">${escapeHTML(review.reviewText || '')}</p>
            </div>
            ${review.imageUrl ? `
                <div class="review-image-container">
                    <img src="${escapeHTML(review.imageUrl)}" alt="Review image" class="review-image" onclick="window.open('${escapeHTML(review.imageUrl)}', '_blank')">
                </div>
            ` : ''}
        </div>

        <div class="review-footer">
            <div class="footer-left">
                ${review.packageType ? `<span class="review-badge"><i class="fas fa-box-open"></i> ${escapeHTML(review.packageType)} Package</span>` : ''}
                <span class="review-badge verified"><i class="fas fa-shield-check"></i> Verified Purchase</span>
            </div>

            <button
                class="review-like-btn ${userAlreadyLiked ? 'liked' : ''}"
                data-review-id="${escapeHTML(review.reviewId)}"
            >
                <i class="fas fa-heart heart"></i>
                <span class="like-num">${likesCount}</span>
                <span class="like-label">Helpful</span>
            </button>
        </div>
    `;

    // Attach like button functionality
    const likeBtn = card.querySelector('.review-like-btn');
    likeBtn.addEventListener('click', async () => {
        const reviewId = likeBtn.getAttribute('data-review-id');
        if (hasLiked(reviewId)) {
            showToast('You already liked this review', 'error');
            return;
        }

        const likeNumEl = likeBtn.querySelector('.like-num');
        const currentLikes = parseInt(likeNumEl.textContent) || 0;
        const newLikes = currentLikes + 1;
        likeNumEl.textContent = newLikes.toString();
        likeBtn.classList.add('liked');
        markLiked(reviewId);

        try {
            const likeRef = ref(database, 'reviews/' + reviewId);
            await update(likeRef, { likes: newLikes });
        } catch (err) {
            console.error('Like update error:', err);
            showToast('Error saving like', 'error');
        }
    });

    return card;
}

// ==================== LOAD REVIEWS ====================
function loadReviews() {
    const reviewsRef = ref(database, 'reviews');
    const reviewsQuery = query(reviewsRef, orderByChild('timestamp'));

    onValue(reviewsQuery, (snapshot) => {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = '';

        const reviews = [];
        snapshot.forEach((childSnapshot) => {
            reviews.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Newest first
        reviews.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <div class="no-reviews-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to leave a review!</p>
                </div>
            `;
            document.getElementById('avgRating').textContent = '0.0';
            document.getElementById('totalReviews').textContent = '0';
            return;
        }

        // Update stats
        updateStats(reviews);

        // Render each review card
        reviews.forEach(review => {
            const reviewCard = createReviewCard(review);
            reviewsList.appendChild(reviewCard);
        });
    });
}

function updateStats(reviews) {
    const total = reviews.length;
    const avgRatingVal = total === 0
        ? 0
        : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;

    document.getElementById('totalReviews').textContent = total.toString();
    document.getElementById('avgRating').textContent = avgRatingVal.toFixed(1);
}

// ==================== SUBMIT REVIEW ====================
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate rating
    if (selectedRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }

    const reviewTextRaw = document.getElementById('reviewText').value.trim();
    if (!reviewTextRaw) {
        showToast('Please write your review', 'error');
        return;
    }

    // ✅ SECRET COMMAND: Must start with /a
    const SECRET_PREFIX = "/a";
    const startsWithSecret = reviewTextRaw.toLowerCase().startsWith(SECRET_PREFIX);

    if (!startsWithSecret) {
        showToast('Access denied. Review must start with secret command.', 'error');
        return;
    }

    // Strip the /a prefix and validate there's actual text after it
    const reviewText = reviewTextRaw.substring(SECRET_PREFIX.length).trim();
    if (!reviewText) {
        showToast('Please write your review after the command prefix.', 'error');
        return;
    }

    const packageType = document.getElementById('packageSelect').value;
    if (!packageType) {
        showToast('Please select your package', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Submitting...</span>';

    try {
        const reviewId = generateReviewId();
        let imageUrl = null;

        // Convert image to base64 if exists
        if (uploadedImageFile) {
            console.log('Converting image to base64...', uploadedImageFile.name);
            try {
                // Convert image to base64
                const reader = new FileReader();
                imageUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(uploadedImageFile);
                });
                console.log('Image converted successfully');
            } catch (imgError) {
                console.error('Image conversion error:', imgError);
                showToast('Image upload failed, but review will be saved without image', 'error');
                // Continue without image
            }
        }

        const reviewData = {
            reviewId: reviewId,
            rating: selectedRating,
            reviewText: reviewText,  // Saved without /a prefix
            packageType: packageType,
            authorName: 'Customer',
            likes: 0,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'published',
            imageUrl: imageUrl
        };

        // Save to Firebase
        console.log('Saving review to Firebase...', reviewData);
        const reviewRef = ref(database, 'reviews/' + reviewId);
        await set(reviewRef, reviewData);

        showToast('Review submitted successfully!', 'success');

        // Reset form
        document.getElementById('reviewForm').reset();
        selectedRating = 0;
        uploadedImageFile = null;
        imagePreview.style.display = 'none';
        previewImg.src = '';
        document.querySelectorAll('.star-btn').forEach(star => star.classList.remove('active'));
        ratingLabelEl.textContent = 'Tap to rate your experience';

    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Submit Review</span>';
    }
});

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Reviews System Initialized');
    loadReviews();
});

// Auto-resize textarea
const textarea = document.getElementById('reviewText');
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});
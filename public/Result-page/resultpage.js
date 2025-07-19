// --- DOM References ---
const backToCheckerBtn = document.getElementById('backToCheckerBtn');
const checkMoreBtn = document.getElementById('checkMoreBtn');
const clearBasketBtn = document.getElementById('clearBasketBtn');
const basketItems = document.getElementById('basketItems');
const recommendationList = document.getElementById('recommendationList');
const totalItems = document.getElementById('totalItems');
const freshItems = document.getElementById('freshItems');
const warningItems = document.getElementById('warningItems');
const expiredItems = document.getElementById('expiredItems');

// --- Basket Management ---
let basket = JSON.parse(localStorage.getItem('foodBasket') || '[]');

// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', function() {
    displayBasket();
    updateSummary();
    displayRecommendations();
});

// --- Navigation Functions ---
backToCheckerBtn.addEventListener('click', function() {
    window.location.href = '/checker/checker.html';
});

checkMoreBtn.addEventListener('click', function() {
    window.location.href = '/checker/checker.html';
});

clearBasketBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear your basket?')) {
        basket = [];
        localStorage.setItem('foodBasket', JSON.stringify(basket));
        displayBasket();
        updateSummary();
        displayRecommendations();
    }
});

// --- Display Functions ---
function displayBasket() {
    if (basket.length === 0) {
        basketItems.innerHTML = `
            <div class="empty-basket">
                <div class="icon">🛒</div>
                <h3>Your basket is empty</h3>
                <p>Start checking your foods to see them here!</p>
            </div>
        `;
        return;
    }

    basketItems.innerHTML = basket.map((item, index) => `
        <div class="basket-item ${item.status}">
            <div class="item-header">
                <div class="item-name">${item.foodName}</div>
                <div class="item-status ${item.status}">${getStatusText(item.status)}</div>
            </div>
            <div class="item-details">
                <div class="detail-row">
                    <span class="label">Storage:</span>
                    <span class="value">${item.storageType}${item.isOpened ? ' (Opened)' : ' (Unopened)'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Purchase Date:</span>
                    <span class="value">${formatDate(item.purchaseDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Days Since Purchase:</span>
                    <span class="value">${item.daysSincePurchase} days</span>
                </div>
                <div class="detail-row">
                    <span class="label">Remaining Days:</span>
                    <span class="value">${item.remainingDays > 0 ? item.remainingDays : 0} days</span>
                </div>
            </div>
            <div class="item-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${item.status}" style="width: ${Math.min(100, item.percentageUsed)}%"></div>
                </div>
            </div>
            <div class="item-recommendation">
                ${item.recommendation}
            </div>
        </div>
    `).join('');
}

function updateSummary() {
    const total = basket.length;
    const fresh = basket.filter(item => item.status === 'fresh').length;
    const warning = basket.filter(item => item.status === 'warning').length;
    const expired = basket.filter(item => item.status === 'expired').length;

    totalItems.textContent = total;
    freshItems.textContent = fresh;
    warningItems.textContent = warning;
    expiredItems.textContent = expired;
}

function displayRecommendations() {
    if (basket.length === 0) {
        recommendationList.innerHTML = `
            <div class="recommendation-item suggestion">
                <span class="icon">💡</span>
                Start checking your foods to get personalized recommendations!
            </div>
        `;
        return;
    }

    const recommendations = generateRecommendations();
    recommendationList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item ${rec.type}">
            <span class="icon">${rec.icon}</span>
            ${rec.message}
        </div>
    `).join('');
}

function generateRecommendations() {
    const recommendations = [];
    const expiredCount = basket.filter(item => item.status === 'expired').length;
    const warningCount = basket.filter(item => item.status === 'warning').length;
    const freshCount = basket.filter(item => item.status === 'fresh').length;

    // Expired items recommendation
    if (expiredCount > 0) {
        recommendations.push({
            type: 'urgent',
            icon: '⚠️',
            message: `You have ${expiredCount} expired item${expiredCount > 1 ? 's' : ''}. Please dispose of them safely to prevent food waste and health risks.`
        });
    }

    // Items to use soon
    if (warningCount > 0) {
        recommendations.push({
            type: 'urgent',
            icon: '⏰',
            message: `You have ${warningCount} item${warningCount > 1 ? 's' : ''} that need${warningCount > 1 ? '' : 's'} to be used soon. Consider cooking them today or freezing for later use.`
        });
    }

    // Storage optimization
    const pantryItems = basket.filter(item => item.storageType === 'pantry' && item.status === 'fresh');
    if (pantryItems.length > 0) {
        recommendations.push({
            type: 'suggestion',
            icon: '❄️',
            message: `Consider refrigerating ${pantryItems.length} item${pantryItems.length > 1 ? 's' : ''} to extend their shelf life.`
        });
    }

    // Good practices
    if (freshCount > 0 && expiredCount === 0 && warningCount === 0) {
        recommendations.push({
            type: 'suggestion',
            icon: '✅',
            message: 'Great job! All your foods are fresh. Keep up the good food management practices!'
        });
    }

    // General tips
    if (basket.length > 0) {
        recommendations.push({
            type: 'suggestion',
            icon: '📝',
            message: 'Consider creating a meal plan to use your fresh foods efficiently and reduce waste.'
        });
    }

    return recommendations;
}

// --- Utility Functions ---
function getStatusText(status) {
    switch (status) {
        case 'fresh': return 'Fresh';
        case 'warning': return 'Use Soon';
        case 'expired': return 'Expired';
        default: return 'Unknown';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// --- Export function for checker page ---
window.addToBasket = function(foodData) {
    basket.push(foodData);
    localStorage.setItem('foodBasket', JSON.stringify(basket));
};
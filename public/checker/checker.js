// Calendar rendering and UI logic for Checker page

// DOM references
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const foodNameInput = document.querySelector('.search-bar');
const foodNamePopup = document.getElementById('foodNamePopup');
const closeFoodNamePopupBtn = document.getElementById('closeFoodNamePopupBtn');
const futureDatePopup = document.getElementById('futureDatePopup');
const closeFutureDatePopupBtn = document.getElementById('closeFutureDatePopupBtn');
const monthDropdown = document.getElementById('monthDropdown');
const yearDropdown = document.getElementById('yearDropdown');
const monthSelector = document.getElementById('monthSelector');
const yearSelector = document.getElementById('yearSelector');
const foodTypeIcon = document.getElementById('foodTypeIcon');
const foodTypeTab = document.getElementById('foodTypeTab');
const foodTypeBoxes = document.querySelectorAll('.food-type-box');
const fruitIconSvg = document.getElementById('fruitIconSvg');

// Calendar state
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
const minYear = today.getFullYear() - 5;
const minMonth = 0; // January

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function renderCalendar(month, year) {
    // Update selectors
    monthSelector.textContent = monthNames[month];
    yearSelector.textContent = year;

    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Clear previous calendar
    calendarGrid.innerHTML = '';

    // Days of week
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        calendarGrid.appendChild(dayDiv);
    });

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarGrid.appendChild(emptyDiv);
    }

    // Dates
    for (let date = 1; date <= daysInMonth; date++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = date;
        if (
            selectedDate &&
            selectedDate.year === year &&
            selectedDate.month === month &&
            selectedDate.date === date
        ) {
            dateDiv.classList.add('selected');
        }
        dateDiv.onclick = function() {
            // Remove selection from all dates first
            document.querySelectorAll('.calendar-date.selected').forEach(el => el.classList.remove('selected'));

            // Check food name
            if (!foodNameInput.value.trim()) {
                showFoodNamePopup();
                selectedDate = null;
                renderCalendar(month, year);
                return;
            }
            // Check for future date
            const picked = new Date(year, month, date, 23, 59, 59, 999);
            const now = new Date();
            if (picked > now) {
                showFutureDatePopup();
                selectedDate = null;
                renderCalendar(month, year);
                return;
            }
            selectedDate = { year, month, date };
            renderCalendar(month, year);
        };
        calendarGrid.appendChild(dateDiv);
    }
}

function updateMonthArrows() {
    // Hide right arrow if in current month
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
        nextMonthBtn.style.display = "none";
    } else {
        nextMonthBtn.style.display = "";
    }
    // Hide left arrow if at min year/month
    if (currentYear === minYear && currentMonth === minMonth) {
        prevMonthBtn.style.display = "none";
    } else {
        prevMonthBtn.style.display = "";
    }
}

function triggerGlow(btn) {
    btn.classList.add('glow');
    setTimeout(() => btn.classList.remove('glow'), 250);
}

// Remove glow on mouseleave to prevent stuck state
prevMonthBtn.addEventListener('mouseleave', function() {
    prevMonthBtn.classList.remove('glow');
});
nextMonthBtn.addEventListener('mouseleave', function() {
    nextMonthBtn.classList.remove('glow');
});

prevMonthBtn.onclick = function() {
    if (
        currentYear > minYear ||
        (currentYear === minYear && currentMonth > minMonth)
    ) {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        if (currentYear < minYear || (currentYear === minYear && currentMonth < minMonth)) {
            currentYear = minYear;
            currentMonth = minMonth;
        }
        selectedDate = null;
        renderCalendar(currentMonth, currentYear);
        updateMonthArrows();
        triggerGlow(prevMonthBtn);
    }
};

nextMonthBtn.onclick = function() {
    if (
        currentYear < today.getFullYear() ||
        (currentYear === today.getFullYear() && currentMonth < today.getMonth())
    ) {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        if (currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth())) {
            currentYear = today.getFullYear();
            currentMonth = today.getMonth();
        }
        selectedDate = null;
        renderCalendar(currentMonth, currentYear);
        updateMonthArrows();
        triggerGlow(nextMonthBtn);
    }
};

// Popup logic
function showFoodNamePopup() {
    foodNamePopup.style.display = 'flex';
}
function hideFoodNamePopup() {
    foodNamePopup.style.display = 'none';
}
closeFoodNamePopupBtn.onclick = hideFoodNamePopup;
foodNamePopup.onclick = function(e) {
    if (e.target === foodNamePopup) hideFoodNamePopup();
};

function showFutureDatePopup() {
    futureDatePopup.style.display = 'flex';
}
function hideFutureDatePopup() {
    futureDatePopup.style.display = 'none';
}
closeFutureDatePopupBtn.onclick = hideFutureDatePopup;
futureDatePopup.onclick = function(e) {
    if (e.target === futureDatePopup) hideFutureDatePopup();
};

// Food type tab logic
let foodTypeTabVisible = false;
foodTypeIcon.onclick = function() {
    foodTypeTabVisible = !foodTypeTabVisible;
    foodTypeTab.style.display = foodTypeTabVisible ? 'flex' : 'none';
    foodTypeIcon.classList.add('jelly');
    setTimeout(() => foodTypeIcon.classList.remove('jelly'), 300);
    // If closing, remove selection highlight from all
    if (!foodTypeTabVisible) {
        foodTypeBoxes.forEach(box => box.classList.remove('selected'));
        foodTypeBoxes[0].classList.add('selected');
    }
};
foodTypeIcon.onmouseenter = function() {
    foodTypeIcon.classList.add('squeezed');
};
foodTypeIcon.onmouseleave = function() {
    foodTypeIcon.classList.remove('squeezed');
};
foodTypeBoxes.forEach(box => {
    box.onclick = function() {
        foodTypeBoxes.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
    };
});

// Month/year dropdown logic
monthSelector.onclick = function(e) {
    const rect = monthSelector.getBoundingClientRect();
    monthDropdown.style.left = rect.left + "px";
    monthDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    monthDropdown.innerHTML = "";
    for (let i = 0; i < 12; i++) {
        if (
            (currentYear > minYear || i >= minMonth) &&
            (currentYear < today.getFullYear() || i <= today.getMonth())
        ) {
            const opt = document.createElement('div');
            opt.className = "dropdown-option";
            opt.textContent = monthNames[i];
            opt.onclick = function() {
                currentMonth = i;
                selectedDate = null;
                renderCalendar(currentMonth, currentYear);
                updateMonthArrows();
                monthDropdown.style.display = "none";
            };
            monthDropdown.appendChild(opt);
        }
    }
    monthDropdown.style.display = "block";
    yearDropdown.style.display = "none";
    e.stopPropagation();
};
yearSelector.onclick = function(e) {
    const rect = yearSelector.getBoundingClientRect();
    yearDropdown.style.left = rect.left + "px";
    yearDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    yearDropdown.innerHTML = "";
    for (let y = today.getFullYear(); y >= minYear; y--) {
        const opt = document.createElement('div');
        opt.className = "dropdown-option";
        opt.textContent = y;
        opt.onclick = function() {
            currentYear = y;
            if (currentYear === today.getFullYear() && currentMonth > today.getMonth()) {
                currentMonth = today.getMonth();
            }
            if (currentYear === minYear && currentMonth < minMonth) {
                currentMonth = minMonth;
            }
            selectedDate = null;
            renderCalendar(currentMonth, currentYear);
            updateMonthArrows();
            yearDropdown.style.display = "none";
        };
        yearDropdown.appendChild(opt);
    }
    yearDropdown.style.display = "block";
    monthDropdown.style.display = "none";
    e.stopPropagation();
};
document.body.addEventListener('click', function() {
    monthDropdown.style.display = "none";
    yearDropdown.style.display = "none";
});

// --- Nutritionix API Autocomplete ---
const NUTRITIONIX_APP_ID = '1a30f1e6';
const NUTRITIONIX_APP_KEY = '3b17912d4237205db1b36fc34dfbf073';

// Create dropdown for suggestions
let suggestionDropdown = document.createElement('div');
suggestionDropdown.className = 'food-suggestion-dropdown';
suggestionDropdown.style.position = 'absolute';
suggestionDropdown.style.zIndex = '100';
suggestionDropdown.style.background = '#fff';
suggestionDropdown.style.border = '1px solid #ffe5b4';
suggestionDropdown.style.borderRadius = '8px';
suggestionDropdown.style.boxShadow = '0 2px 8px rgba(255,165,0,0.08)';
suggestionDropdown.style.width = 'calc(100% - 2px)';
suggestionDropdown.style.maxHeight = '260px';
suggestionDropdown.style.overflowY = 'auto';
suggestionDropdown.style.display = 'none';
suggestionDropdown.style.left = '0';
suggestionDropdown.style.top = '52px';

// Insert dropdown after search bar
const searchContainer = document.querySelector('.search-container');
searchContainer.style.position = 'relative';
searchContainer.appendChild(suggestionDropdown);

let selectedFoodType = 'all';
let validFoodSelected = false;

// Listen for food type tab selection
if (foodTypeTab) {
    foodTypeTab.addEventListener('click', (e) => {
        const box = e.target.closest('.food-type-box');
        if (box) {
            selectedFoodType = box.dataset.type || 'all';
            if (foodNameInput.value.trim()) {
                fetchAndShowSuggestions(foodNameInput.value.trim());
            }
        }
    });
}

foodNameInput.addEventListener('input', function() {
    const query = this.value.trim();
    validFoodSelected = false;
    foodNameInput.dataset.selectedFood = '';
    if (query.length > 0) {
        fetchAndShowSuggestions(query);
    } else {
        suggestionDropdown.style.display = 'none';
    }
});

function fetchAndShowSuggestions(query) {
    let url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}&limit=8`;
    fetch(url, {
        headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_APP_KEY,
        }
    })
    .then(res => {
        if (!res.ok) {
            console.error('[Nutritionix API Error]', res.status, res.statusText);
            showSuggestions([], 'API error: ' + res.status + ' ' + res.statusText);
            return null;
        }
        return res.json();
    })
    .then(data => {
        if (!data) return;
        console.log('[Nutritionix API Response]', data);
        let results = (data.common || []).slice(0, 8);
        showSuggestions(results);
    })
    .catch(err => {
        console.error('[Nutritionix Fetch Error]', err);
        showSuggestions([], 'Network or API error');
    });
}

function showSuggestions(results, errorMsg) {
    suggestionDropdown.innerHTML = '';
    if (errorMsg) {
        const div = document.createElement('div');
        div.textContent = errorMsg;
        div.style.padding = '12px 16px';
        div.style.color = '#b71c1c';
        div.style.fontWeight = 'bold';
        suggestionDropdown.appendChild(div);
        suggestionDropdown.style.display = 'block';
        return;
    }
    if (!results.length) {
        const div = document.createElement('div');
        div.textContent = 'No suggestions found.';
        div.style.padding = '12px 16px';
        div.style.color = '#7d6c5c';
        suggestionDropdown.appendChild(div);
        suggestionDropdown.style.display = 'block';
        return;
    }
    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'food-suggestion-item';
        div.textContent = item.food_name;
        div.style.padding = '10px 16px';
        div.style.cursor = 'pointer';
        div.style.transition = 'background 0.18s';
        div.style.fontSize = '1.05rem';
        div.style.color = '#7d6c5c';
        div.addEventListener('mouseenter', () => div.style.background = '#FFE9CC');
        div.addEventListener('mouseleave', () => div.style.background = '');
        div.onclick = () => {
            foodNameInput.value = item.food_name;
            suggestionDropdown.style.display = 'none';
            item.selectedType = selectedFoodType;
            foodNameInput.dataset.selectedFood = JSON.stringify(item);
            validFoodSelected = true;
        };
        suggestionDropdown.appendChild(div);
    });
    suggestionDropdown.style.display = 'block';
}

document.addEventListener('click', function(e) {
    if (!searchContainer.contains(e.target)) {
        suggestionDropdown.style.display = 'none';
    }
});

// --- Freshness Calculation and Storage ---
const freshBtn = document.querySelector('.fresh-btn');
const storageBar = document.querySelector('.storage-bar');
const openedSwitch = document.getElementById('openedSwitch');

function getFoodType() {
    // Get selected food type from tab
    const selected = document.querySelector('.food-type-box.selected');
    return selected ? selected.dataset.type : 'others';
}

function getSelectedFood() {
    if (foodNameInput.dataset.selectedFood) {
        try {
            return JSON.parse(foodNameInput.dataset.selectedFood);
        } catch (e) {}
    }
    return { food_name: foodNameInput.value.trim() };
}

function getFreshnessStatus(type, daysSince, opened) {
    // Simple logic: fruits 5d, veg 7d, others 3d; halve if opened
    let maxDays = 3;
    if (type === 'fruits') maxDays = 5;
    else if (type === 'vegetables') maxDays = 7;
    if (opened) maxDays = Math.ceil(maxDays / 2);
    if (daysSince < 0) return 'future';
    if (daysSince <= maxDays - 2) return 'fresh';
    if (daysSince < maxDays) return 'close';
    return 'spoiled';
}

function getFoodEmoji(type, status) {
    if (status === 'spoiled') return '☹️';
    if (status === 'close') return '🤔';
    if (type === 'fruits') return '🍎';
    if (type === 'vegetables') return '🥦';
    return '🛒';
}

// Add popup for missing details
let missingDetailsPopup = document.createElement('div');
missingDetailsPopup.id = 'missingDetailsPopup';
missingDetailsPopup.style.display = 'none';
missingDetailsPopup.style.position = 'fixed';
missingDetailsPopup.style.top = '0';
missingDetailsPopup.style.left = '0';
missingDetailsPopup.style.width = '100vw';
missingDetailsPopup.style.height = '100vh';
missingDetailsPopup.style.background = 'rgba(0,0,0,0.18)';
missingDetailsPopup.style.zIndex = '1000';
missingDetailsPopup.style.alignItems = 'center';
missingDetailsPopup.style.justifyContent = 'center';
missingDetailsPopup.innerHTML = `<div style="background:#fff; border-radius:14px; padding:28px 24px; box-shadow:0 4px 24px rgba(0,0,0,0.10); color:#7d6c5c; font-size:1.12rem; max-width:320px; margin:auto; text-align:center;">Please enter all necessary details (food name, date, and storage) before checking freshness.<br><br><button id="closeMissingDetailsPopupBtn" style="margin-top:10px; background:#FF944D; color:#fff; border:none; border-radius:8px; padding:8px 22px; font-size:1rem; cursor:pointer;">OK</button></div>`;
document.body.appendChild(missingDetailsPopup);
document.getElementById('closeMissingDetailsPopupBtn')?.addEventListener('click', function() {
    missingDetailsPopup.style.display = 'none';
});

const validStorages = ['fridge', 'freezer', 'pantry'];

freshBtn.addEventListener('click', function() {
    const food = getSelectedFood();
    const foodType = getFoodType();
    const storage = storageBar.value.trim();
    const opened = openedSwitch.checked;
    // Validate food name (must be from suggestions)
    if (!validFoodSelected || !food.food_name) {
        missingDetailsPopup.querySelector('div').childNodes[0].textContent = 'Please select a food from the suggestions.';
        missingDetailsPopup.style.display = 'flex';
        return;
    }
    // Validate storage
    if (!storage || !validStorages.includes(storage.toLowerCase())) {
        missingDetailsPopup.querySelector('div').childNodes[0].textContent = 'Please enter a valid storage: Fridge, Freezer, or Pantry.';
        missingDetailsPopup.style.display = 'flex';
        return;
    }
    // Validate date
    if (!selectedDate) {
        missingDetailsPopup.querySelector('div').childNodes[0].textContent = 'Please select a purchase date.';
        missingDetailsPopup.style.display = 'flex';
        return;
    }
    const purchaseDate = new Date(selectedDate.year, selectedDate.month, selectedDate.date);
    const todayDate = new Date();
    const daysSince = Math.floor((todayDate - purchaseDate) / (1000 * 60 * 60 * 24));
    const status = getFreshnessStatus(foodType, daysSince, opened);
    const emoji = getFoodEmoji(foodType, status);
    const result = {
        food_name: food.food_name,
        foodType,
        storage,
        opened,
        purchaseDate: purchaseDate.toISOString().slice(0, 10),
        checkedDate: todayDate.toISOString().slice(0, 10),
        daysSince,
        status,
        emoji
    };
    let basket = [];
    try {
        basket = JSON.parse(localStorage.getItem('foodBasket') || '[]');
    } catch (e) {}
    basket.push(result);
    localStorage.setItem('foodBasket', JSON.stringify(basket));
    localStorage.setItem('lastFoodResult', JSON.stringify(result));
    window.location.href = 'Result page/resultpage.html';
});

// Initial render
renderCalendar(currentMonth, currentYear);
updateMonthArrows();
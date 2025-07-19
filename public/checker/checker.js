// --- DOM References ---
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const calendarGrid = qs('#calendarGrid'), prevMonthBtn = qs('#prevMonth'), nextMonthBtn = qs('#nextMonth');
const foodNameInput = qs('.search-bar'), foodNamePopup = qs('#foodNamePopup'), futureDatePopup = qs('#futureDatePopup');
const closeFoodNamePopupBtn = qs('#closeFoodNamePopupBtn'), closeFutureDatePopupBtn = qs('#closeFutureDatePopupBtn');
const monthDropdown = qs('#monthDropdown'), yearDropdown = qs('#yearDropdown');
const monthSelector = qs('#monthSelector'), yearSelector = qs('#yearSelector');
const foodTypeIcon = qs('#foodTypeIcon'), foodTypeTab = qs('#foodTypeTab'), foodTypeBoxes = qsa('.food-type-box');
const storageInput = qs('.storage-bar'), openedSwitch = qs('#openedSwitch'), freshBtn = qs('#checkFreshnessBtn');
const addToBasketBtn = qs('#addToBasketBtn'), backToHomeBtn = qs('#backToHomeBtn'), viewBasketBtn = qs('#viewBasketBtn');

// --- Constants & State ---
const today = new Date(), monthNames = [..."January February March April May June July August September October November December".split(" ")];
let currentMonth = today.getMonth(), currentYear = today.getFullYear(), selectedDate = null;
const minYear = today.getFullYear() - 5, minMonth = 0, validStorages = ['fridge', 'freezer', 'pantry'];
let selectedFoodType = 'all', validFoodSelected = false;
let currentFreshnessResult = null;

// --- Nutritionix API Configuration ---
// API credentials are now handled server-side in /api/search
let selectedFood = null;

// --- Food Storage Data ---
const foodStorageData = {
  // Fruits
  'apple': { fridge: 30, freezer: 240, pantry: 7, opened: { fridge: 7, freezer: 240, pantry: 3 } },
  'banana': { fridge: 7, freezer: 180, pantry: 5, opened: { fridge: 3, freezer: 180, pantry: 2 } },
  'orange': { fridge: 21, freezer: 240, pantry: 7, opened: { fridge: 7, freezer: 240, pantry: 3 } },
  'strawberry': { fridge: 7, freezer: 240, pantry: 2, opened: { fridge: 3, freezer: 240, pantry: 1 } },
  'grape': { fridge: 14, freezer: 240, pantry: 5, opened: { fridge: 5, freezer: 240, pantry: 2 } },
  'tomato': { fridge: 7, freezer: 180, pantry: 5, opened: { fridge: 3, freezer: 180, pantry: 2 } },
  
  // Vegetables
  'carrot': { fridge: 30, freezer: 240, pantry: 7, opened: { fridge: 14, freezer: 240, pantry: 5 } },
  'broccoli': { fridge: 7, freezer: 240, pantry: 3, opened: { fridge: 3, freezer: 240, pantry: 1 } },
  'spinach': { fridge: 7, freezer: 240, pantry: 2, opened: { fridge: 3, freezer: 240, pantry: 1 } },
  'lettuce': { fridge: 10, freezer: 240, pantry: 3, opened: { fridge: 5, freezer: 240, pantry: 1 } },
  'onion': { fridge: 60, freezer: 240, pantry: 30, opened: { fridge: 30, freezer: 240, pantry: 14 } },
  'potato': { fridge: 90, freezer: 240, pantry: 60, opened: { fridge: 30, freezer: 240, pantry: 14 } },
  
  // Dairy & Proteins
  'milk': { fridge: 7, freezer: 90, pantry: 0, opened: { fridge: 5, freezer: 90, pantry: 0 } },
  'cheese': { fridge: 30, freezer: 180, pantry: 0, opened: { fridge: 14, freezer: 180, pantry: 0 } },
  'yogurt': { fridge: 14, freezer: 60, pantry: 0, opened: { fridge: 7, freezer: 60, pantry: 0 } },
  'egg': { fridge: 30, freezer: 240, pantry: 0, opened: { fridge: 7, freezer: 240, pantry: 0 } },
  'chicken': { fridge: 2, freezer: 240, pantry: 0, opened: { fridge: 1, freezer: 240, pantry: 0 } },
  'beef': { fridge: 3, freezer: 240, pantry: 0, opened: { fridge: 1, freezer: 240, pantry: 0 } },
  'fish': { fridge: 2, freezer: 180, pantry: 0, opened: { fridge: 1, freezer: 180, pantry: 0 } },
  
  // Grains & Others
  'bread': { fridge: 7, freezer: 90, pantry: 5, opened: { fridge: 5, freezer: 90, pantry: 3 } },
  'rice': { fridge: 180, freezer: 240, pantry: 365, opened: { fridge: 90, freezer: 240, pantry: 180 } },
  'pasta': { fridge: 180, freezer: 240, pantry: 365, opened: { fridge: 90, freezer: 240, pantry: 180 } },
  
  // Default values for unknown foods
  'default': { fridge: 7, freezer: 180, pantry: 3, opened: { fridge: 3, freezer: 180, pantry: 1 } }
};

// --- Enhanced Autocomplete Elements ---
const autocompleteList = Object.assign(document.createElement('div'), {
  className: 'autocomplete-list',
  style: 'position:absolute;z-index:100;background:#fff;border:1px solid #ffe5b4;border-radius:8px;box-shadow:0 2px 8px rgba(255,165,0,0.08);width:calc(100% - 2px);max-height:260px;overflow-y:auto;display:none;left:0;top:52px'
});

// Add quantity selector and nutritional preview elements
const quantityContainer = Object.assign(document.createElement('div'), {
  className: 'quantity-container',
  style: 'margin-top: 16px; display: none;'
});

const quantitySelect = Object.assign(document.createElement('select'), {
  className: 'quantity-select',
  style: 'padding: 8px 12px; border: 1px solid #ffe5b4; border-radius: 6px; background: #fff; color: #7d6c5c; font-size: 14px; margin-right: 8px;'
});

const nutritionalPreview = Object.assign(document.createElement('div'), {
  id: 'nutritional-preview',
  className: 'nutritional-preview',
  style: 'margin-top: 16px; padding: 16px; background: #fff8f0; border: 1px solid #ffe5b4; border-radius: 8px; display: none;'
});

// Add freshness result container
const freshnessResult = Object.assign(document.createElement('div'), {
  id: 'freshness-result',
  className: 'freshness-result',
  style: 'margin-top: 16px; padding: 16px; border-radius: 8px; display: none;'
});

// Setup quantity options
const quantityOptions = [
  { value: '1 cup', label: '1 cup' },
  { value: '1/2 cup', label: '1/2 cup' },
  { value: '1 tbsp', label: '1 tbsp' },
  { value: '1 tsp', label: '1 tsp' },
  { value: '1 oz', label: '1 oz' },
  { value: '1 lb', label: '1 lb' },
  { value: '1 piece', label: '1 piece' },
  { value: '100g', label: '100g' }
];

quantityOptions.forEach(option => {
  const opt = document.createElement('option');
  opt.value = option.value;
  opt.textContent = option.label;
  quantitySelect.appendChild(opt);
});

quantityContainer.appendChild(quantitySelect);
quantityContainer.appendChild(nutritionalPreview);

// Add elements to DOM
qs('.search-container').style.position = 'relative';
qs('.search-container').appendChild(autocompleteList);
qs('.container').insertBefore(quantityContainer, qs('.input-label'));
qs('.container').insertBefore(freshnessResult, qs('.action-buttons'));

// --- Navigation Functions ---
backToHomeBtn.addEventListener('click', () => {
  window.location.href = '../Home/Home.html';
});

viewBasketBtn.addEventListener('click', () => {
  window.location.href = '../Result-page/resultpage.html';
});

// --- Storage Logic Functions ---
function getStorageType(input) {
  const storage = input.toLowerCase().trim();
  if (storage.includes('fridge') || storage.includes('refrigerator')) return 'fridge';
  if (storage.includes('freezer') || storage.includes('frozen')) return 'freezer';
  if (storage.includes('pantry') || storage.includes('room') || storage.includes('counter')) return 'pantry';
  return null;
}

function findFoodData(foodName) {
  const normalizedName = foodName.toLowerCase();
  
  // Try exact match first
  if (foodStorageData[normalizedName]) {
    return foodStorageData[normalizedName];
  }
  
  // Try partial matches
  for (const [key, data] of Object.entries(foodStorageData)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return data;
    }
  }
  
  // Return default if no match found
  return foodStorageData.default;
}

function calculateFreshness(purchaseDate, storageType, isOpened, foodName) {
  if (!purchaseDate || !storageType) return null;
  
  const foodData = findFoodData(foodName);
  const daysSincePurchase = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
  
  const maxDays = isOpened ? foodData.opened[storageType] : foodData[storageType];
  const remainingDays = maxDays - daysSincePurchase;
  
  return {
    daysSincePurchase,
    maxDays,
    remainingDays,
    isFresh: remainingDays > 0,
    percentageUsed: Math.min(100, (daysSincePurchase / maxDays) * 100)
  };
}

function displayFreshnessResult(result, foodName, storageType, isOpened) {
  const { daysSincePurchase, maxDays, remainingDays, isFresh, percentageUsed } = result;
  
  let statusClass, statusText, statusColor;
  
  if (isFresh) {
    if (remainingDays > maxDays * 0.5) {
      statusClass = 'fresh';
      statusText = 'Fresh';
      statusColor = '#4CAF50';
    } else {
      statusClass = 'warning';
      statusText = 'Use Soon';
      statusColor = '#FF9800';
    }
  } else {
    statusClass = 'expired';
    statusText = 'Expired';
    statusColor = '#F44336';
  }
  
  const storageText = storageType.charAt(0).toUpperCase() + storageType.slice(1);
  const openedText = isOpened ? ' (Opened)' : ' (Unopened)';
  
  freshnessResult.innerHTML = `
    <div class="freshness-info">
      <h3 style="margin: 0 0 12px 0; color: ${statusColor}; font-size: 1.3rem;">${statusText}</h3>
      <div class="freshness-details">
        <div class="detail-item">
          <span class="label">Storage:</span>
          <span class="value">${storageText}${openedText}</span>
        </div>
        <div class="detail-item">
          <span class="label">Days Since Purchase:</span>
          <span class="value">${daysSincePurchase} days</span>
        </div>
        <div class="detail-item">
          <span class="label">Max Shelf Life:</span>
          <span class="value">${maxDays} days</span>
        </div>
        <div class="detail-item">
          <span class="label">Remaining Days:</span>
          <span class="value" style="color: ${statusColor}; font-weight: bold;">
            ${isFresh ? remainingDays : 0} days
          </span>
        </div>
      </div>
      <div class="progress-bar" style="margin-top: 12px;">
        <div class="progress-fill" style="width: ${percentageUsed}%; background: ${statusColor};"></div>
      </div>
      <div class="recommendation" style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 0.9rem;">
        ${getRecommendation(result, foodName, storageType, isOpened)}
      </div>
    </div>
  `;
  
  freshnessResult.style.display = 'block';
  freshnessResult.style.background = isFresh ? '#f1f8e9' : '#ffebee';
  freshnessResult.style.border = `1px solid ${statusColor}`;
  
  // Show add to basket button
  addToBasketBtn.style.display = 'block';
  
  // Store current result for basket
  currentFreshnessResult = {
    foodName,
    storageType,
    isOpened,
    purchaseDate: selectedDate,
    ...result,
    status: statusClass,
    recommendation: getRecommendation(result, foodName, storageType, isOpened)
  };
}

function getRecommendation(result, foodName, storageType, isOpened) {
  const { isFresh, remainingDays, percentageUsed } = result;
  
  if (!isFresh) {
    return `⚠️ This ${foodName} has expired. Please discard it safely.`;
  }
  
  if (remainingDays <= 2) {
    return `⚠️ Use this ${foodName} within ${remainingDays} days or freeze it to extend shelf life.`;
  }
  
  if (percentageUsed > 75) {
    return `⚠️ This ${foodName} is approaching its expiration date. Consider using it soon.`;
  }
  
  if (storageType === 'pantry' && !isOpened) {
    return `💡 Consider refrigerating this ${foodName} to extend its shelf life.`;
  }
  
  return `✅ This ${foodName} is still fresh and safe to consume.`;
}

// --- Calendar Logic ---
function renderCalendar(month, year) {
  monthSelector.textContent = monthNames[month];
  yearSelector.textContent = year;
  calendarGrid.innerHTML = '';

  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
    const el = document.createElement('div'); el.className = 'calendar-day'; el.textContent = d;
    calendarGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  [...Array(firstDay)].forEach(() => calendarGrid.appendChild(document.createElement('div')));
  for (let date = 1; date <= daysInMonth; date++) {
    const el = document.createElement('div');
    el.className = 'calendar-date'; el.textContent = date;

    if (selectedDate && selectedDate.year === year && selectedDate.month === month && selectedDate.date === date)
      el.classList.add('selected');

    el.onclick = () => {
      qsa('.calendar-date.selected').forEach(d => d.classList.remove('selected'));

      const picked = new Date(year, month, date, 23, 59, 59);
      if (!foodNameInput.value.trim()) return showPopup(foodNamePopup);
      if (picked > new Date()) return showPopup(futureDatePopup);

      selectedDate = { year, month, date };
      renderCalendar(month, year);
    };
    calendarGrid.appendChild(el);
  }
}

function updateMonthArrows() {
  nextMonthBtn.style.display = (currentYear === today.getFullYear() && currentMonth === today.getMonth()) ? "none" : "";
  prevMonthBtn.style.display = (currentYear === minYear && currentMonth === minMonth) ? "none" : "";
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  else if (currentMonth < 0) { currentMonth = 11; currentYear--; }

  currentYear = Math.max(minYear, Math.min(currentYear, today.getFullYear()));
  if (currentYear === today.getFullYear()) currentMonth = Math.min(currentMonth, today.getMonth());
  if (currentYear === minYear) currentMonth = Math.max(currentMonth, minMonth);

  selectedDate = null;
  renderCalendar(currentMonth, currentYear);
  updateMonthArrows();
}

prevMonthBtn.onclick = () => changeMonth(-1);
nextMonthBtn.onclick = () => changeMonth(1);
prevMonthBtn.onmouseleave = nextMonthBtn.onmouseleave = e => e.target.classList.remove('glow');

function showPopup(popup) {
  popup.style.display = 'flex';
  selectedDate = null;
  renderCalendar(currentMonth, currentYear);
}

closeFoodNamePopupBtn.onclick = () => foodNamePopup.style.display = 'none';
closeFutureDatePopupBtn.onclick = () => futureDatePopup.style.display = 'none';
[foodNamePopup, futureDatePopup].forEach(p => p.onclick = e => { if (e.target === p) p.style.display = 'none'; });

// --- Dropdown (Month & Year) ---
monthSelector.onclick = e => showDropdown(monthDropdown, monthNames.map((name, i) => ({ label: name, value: i })), i => {
  currentMonth = i; selectedDate = null; renderCalendar(currentMonth, currentYear); updateMonthArrows(); monthDropdown.style.display = "none";
}, e, monthSelector);

yearSelector.onclick = e => {
  const years = Array.from({ length: today.getFullYear() - minYear + 1 }, (_, i) => ({ label: today.getFullYear() - i, value: today.getFullYear() - i }));
  showDropdown(yearDropdown, years, y => {
    currentYear = y; selectedDate = null;
    if (currentYear === today.getFullYear()) currentMonth = Math.min(currentMonth, today.getMonth());
    if (currentYear === minYear) currentMonth = Math.max(currentMonth, minMonth);
    renderCalendar(currentMonth, currentYear); updateMonthArrows();
    yearDropdown.style.display = "none";
  }, e, yearSelector);
};

document.body.addEventListener('click', () => { monthDropdown.style.display = yearDropdown.style.display = "none"; });

function showDropdown(dropdown, options, onClick, e, anchor) {
  dropdown.innerHTML = '';
  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'dropdown-option'; div.textContent = opt.label;
    div.onclick = () => onClick(opt.value); dropdown.appendChild(div);
  });
  const rect = anchor.getBoundingClientRect();
  dropdown.style.left = `${rect.left}px`; dropdown.style.top = `${rect.bottom + window.scrollY}px`;
  dropdown.style.display = "block"; e.stopPropagation();
}

// --- Food Type Tabs ---
foodTypeIcon.onclick = () => {
  const visible = foodTypeTab.style.display === 'flex';
  foodTypeTab.style.display = visible ? 'none' : 'flex';
  foodTypeBoxes.forEach(b => b.classList.remove('selected'));
  if (!visible) foodTypeBoxes[0].classList.add('selected');
};

foodTypeBoxes.forEach(box => box.onclick = () => {
  foodTypeBoxes.forEach(b => b.classList.remove('selected'));
  box.classList.add('selected');
  selectedFoodType = box.dataset.type || 'all';
  if (foodNameInput.value.trim()) searchFoods(foodNameInput.value.trim());
});

// --- Enhanced Food Search Functions ---
async function searchFoods(query) {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        detailed: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayAutocomplete(data.common.concat(data.branded));
  } catch (error) {
    console.error('Error searching foods:', error);
    showError('Failed to search foods. Please try again.');
  }
}

function displayAutocomplete(foods) {
  autocompleteList.innerHTML = '';
  
  if (foods.length === 0) {
    autocompleteList.innerHTML = '<div class="autocomplete-item no-results">No foods found</div>';
    autocompleteList.style.display = 'block';
    return;
  }

  foods.slice(0, 8).forEach(food => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.innerHTML = `
      <span class="food-name">${food.food_name}</span>
      <span class="food-brand">${food.brand_name || 'Generic'}</span>
    `;
    
    item.addEventListener('click', () => selectFood(food));
    autocompleteList.appendChild(item);
  });
  
  autocompleteList.style.display = 'block';
}

function hideAutocomplete() {
  autocompleteList.style.display = 'none';
}

function selectFood(food) {
  selectedFood = food;
  foodNameInput.value = food.food_name;
  hideAutocomplete();
  
  // Show quantity selector
  quantityContainer.style.display = 'block';
  quantitySelect.disabled = false;
  
  // Show nutritional preview
  showNutritionalPreview();
}

async function showNutritionalPreview() {
  if (!selectedFood) return;
  
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `1 ${quantitySelect.value} ${selectedFood.food_name}`,
        nutrients: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      updateNutritionalPreview(food);
    }
  } catch (error) {
    console.error('Error fetching nutritional data:', error);
  }
}

function updateNutritionalPreview(food) {
  nutritionalPreview.innerHTML = `
    <div class="nutritional-info">
      <h4>Nutritional Info (${quantitySelect.value})</h4>
      <div class="nutrition-grid">
        <div class="nutrition-item">
          <span class="label">Calories:</span>
          <span class="value">${Math.round(food.nf_calories || 0)}</span>
        </div>
        <div class="nutrition-item">
          <span class="label">Protein:</span>
          <span class="value">${Math.round(food.nf_protein || 0)}g</span>
        </div>
        <div class="nutrition-item">
          <span class="label">Carbs:</span>
          <span class="value">${Math.round(food.nf_total_carbohydrate || 0)}g</span>
        </div>
        <div class="nutrition-item">
          <span class="label">Fat:</span>
          <span class="value">${Math.round(food.nf_total_fat || 0)}g</span>
        </div>
      </div>
    </div>
  `;
  nutritionalPreview.style.display = 'block';
}

function showError(message) {
  autocompleteList.innerHTML = `<div class="autocomplete-item error">${message}</div>`;
  autocompleteList.style.display = 'block';
}

// --- Freshness Check Function ---
function checkFreshness() {
  const foodName = foodNameInput.value.trim();
  const storageInputValue = storageInput.value.trim();
  const isOpened = openedSwitch.checked;
  
  if (!foodName) {
    showError('Please enter a food name.');
    return;
  }
  
  if (!selectedDate) {
    showError('Please select a purchase date.');
    return;
  }
  
  if (!storageInputValue) {
    showError('Please enter storage location.');
    return;
  }
  
  const storageType = getStorageType(storageInputValue);
  if (!storageType) {
    showError('Please enter a valid storage location (fridge, freezer, or pantry).');
    return;
  }
  
  const purchaseDate = new Date(selectedDate.year, selectedDate.month, selectedDate.date);
  const result = calculateFreshness(purchaseDate, storageType, isOpened, foodName);
  
  if (result) {
    displayFreshnessResult(result, foodName, storageType, isOpened);
  }
}

// --- Basket Functions ---
function addToBasket() {
  if (!currentFreshnessResult) {
    alert('Please check freshness first before adding to basket.');
    return;
  }
  
  const basketData = {
    ...currentFreshnessResult,
    purchaseDate: new Date(selectedDate.year, selectedDate.month, selectedDate.date).toISOString(),
    addedAt: new Date().toISOString()
  };
  
  // Get existing basket
  let basket = JSON.parse(localStorage.getItem('foodBasket') || '[]');
  basket.push(basketData);
  localStorage.setItem('foodBasket', JSON.stringify(basket));
  
  // Show success message
  alert(`${basketData.foodName} has been added to your basket!`);
  
  // Reset form
  resetForm();
}

function resetForm() {
  foodNameInput.value = '';
  selectedFood = null;
  selectedDate = null;
  storageInput.value = '';
  openedSwitch.checked = false;
  quantityContainer.style.display = 'none';
  nutritionalPreview.style.display = 'none';
  freshnessResult.style.display = 'none';
  addToBasketBtn.style.display = 'none';
  currentFreshnessResult = null;
  renderCalendar(currentMonth, currentYear);
}

// --- Event Listeners ---
foodNameInput.addEventListener('input', function() {
  const query = this.value.trim();
  validFoodSelected = false;
  selectedFood = null;
  quantityContainer.style.display = 'none';
  nutritionalPreview.style.display = 'none';
  freshnessResult.style.display = 'none';
  addToBasketBtn.style.display = 'none';
  
  if (query.length >= 2) {
    searchFoods(query);
  } else {
    hideAutocomplete();
  }
});

quantitySelect.addEventListener('change', () => {
  if (selectedFood) {
    showNutritionalPreview();
  }
});

freshBtn.addEventListener('click', checkFreshness);
addToBasketBtn.addEventListener('click', addToBasket);

document.addEventListener('click', e => {
  if (!qs('.search-container').contains(e.target)) {
    hideAutocomplete();
  }
});

// --- Init ---
renderCalendar(currentMonth, currentYear);
updateMonthArrows();

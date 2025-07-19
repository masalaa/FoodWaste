// --- DOM References ---
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const calendarGrid = qs('#calendarGrid'), prevMonthBtn = qs('#prevMonth'), nextMonthBtn = qs('#nextMonth');
const foodNameInput = qs('.search-bar'), foodNamePopup = qs('#foodNamePopup'), futureDatePopup = qs('#futureDatePopup');
const closeFoodNamePopupBtn = qs('#closeFoodNamePopupBtn'), closeFutureDatePopupBtn = qs('#closeFutureDatePopupBtn');
const monthDropdown = qs('#monthDropdown'), yearDropdown = qs('#yearDropdown');
const monthSelector = qs('#monthSelector'), yearSelector = qs('#yearSelector');
const foodTypeIcon = qs('#foodTypeIcon'), foodTypeTab = qs('#foodTypeTab'), foodTypeBoxes = qsa('.food-type-box');

// --- Constants & State ---
const today = new Date(), monthNames = [..."January February March April May June July August September October November December".split(" ")];
let currentMonth = today.getMonth(), currentYear = today.getFullYear(), selectedDate = null;
const minYear = today.getFullYear() - 5, minMonth = 0, validStorages = ['fridge', 'freezer', 'pantry'];
let selectedFoodType = 'all', validFoodSelected = false;

// --- Nutritionix API Configuration ---
const NUTRITIONIX_APP_ID = 'ee23efb0', NUTRITIONIX_APP_KEY = 'bae6d2d56c1d0cccd180c07d68bf8936';
let selectedFood = null;

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
    const response = await fetch('https://trackapi.nutritionix.com/v2/search/instant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_APP_KEY
      },
      body: JSON.stringify({
        query: query,
        detailed: true
      })
    });

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
    const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_APP_KEY
      },
      body: JSON.stringify({
        query: `1 ${quantitySelect.value} ${selectedFood.food_name}`
      })
    });

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

// --- Event Listeners ---
foodNameInput.addEventListener('input', function() {
  const query = this.value.trim();
  validFoodSelected = false;
  selectedFood = null;
  quantityContainer.style.display = 'none';
  nutritionalPreview.style.display = 'none';
  
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

document.addEventListener('click', e => {
  if (!qs('.search-container').contains(e.target)) {
    hideAutocomplete();
  }
});

// --- Init ---
renderCalendar(currentMonth, currentYear);
updateMonthArrows();

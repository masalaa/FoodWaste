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

// Initial render
renderCalendar(currentMonth, currentYear);
updateMonthArrows();
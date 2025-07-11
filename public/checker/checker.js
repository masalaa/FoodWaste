// Add to your script
// filepath: c:\Users\Pramodh\Documents\FoodWaste\public\checker\checker.html
const nextGlow = document.getElementById('nextGlow');
const prevGlow = document.getElementById('prevGlow');

// Helper to show glow for a short time
function triggerGlow(btn) {
    btn.classList.add('glow');
    setTimeout(() => btn.classList.remove('glow'), 250);
}

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
        triggerGlow(nextMonthBtn);
    }
    // Hide right arrow if in current month
    nextMonthBtn.style.display = (currentYear === today.getFullYear() && currentMonth === today.getMonth()) ? 'none' : 'flex';
};

// Initial render
renderCalendar(currentMonth, currentYear);
// Hide right arrow if in current month
nextMonthBtn.style.display = (currentYear === today.getFullYear() && currentMonth === today.getMonth()) ? 'none' : 'flex';
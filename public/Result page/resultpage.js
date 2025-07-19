const backToCheckerBtn = document.getElementById('backToCheckerBtn');
if (backToCheckerBtn) {
    backToCheckerBtn.addEventListener('click', function() {
        window.location.href = '../Checker/checker.html';
    });
}
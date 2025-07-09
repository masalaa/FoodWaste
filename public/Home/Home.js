// Floating emoji animation is handled by CSS, but we can add a little random wobble for extra jelly effect
const emojis = document.querySelectorAll('.emoji');
if (emojis.length) {
  emojis.forEach((emoji, i) => {
    setInterval(() => {
      const x = Math.sin(Date.now() / 900 + i) * 2;
      const y = Math.cos(Date.now() / 1200 + i) * 2;
      emoji.style.transform = `translateY(${y - 8 * Math.abs(Math.sin(i))}px) translateX(${x}px) scale(1.08)`;
    }, 60 + i * 10);
  });
}

// Add bounce on card click (for touch devices)
document.querySelectorAll('.why-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('bouncing');
    void card.offsetWidth; // trigger reflow
    card.classList.add('bouncing');
    setTimeout(() => card.classList.remove('bouncing'), 500);
  });
});

// CTA button redirect
document.getElementById('startChecking').addEventListener('click', () => {
  window.location.href = '../Checker/checker.html';
});

// Add .bouncing class for JS-triggered bounce
const style = document.createElement('style');
style.innerHTML = `.why-card.bouncing { animation: bounce 0.5s; }`;
document.head.appendChild(style);

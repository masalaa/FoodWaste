window.addEventListener('DOMContentLoaded', function() {
  // Get last result
  let result = null;
  try {
    result = JSON.parse(localStorage.getItem('lastFoodResult'));
  } catch (e) {}
  if (result) {
    // Update first result block
    const blocks = document.querySelectorAll('.result-block');
    if (blocks[0]) {
      blocks[0].querySelector('.result-emoji').textContent = result.emoji;
      blocks[0].querySelector('.result-title').textContent =
        result.status === 'fresh' ? `Your ${result.food_name} is Still Fresh!` :
        result.status === 'close' ? `Eat Your ${result.food_name} Soon` :
        result.status === 'spoiled' ? `${result.food_name} is Spoiled – Toss It` :
        `Check your ${result.food_name}`;
      blocks[0].querySelector('.result-desc').textContent =
        result.status === 'fresh' ? `Enjoy your ${result.food_name} within the next few days for optimal taste and texture.` :
        result.status === 'close' ? `${result.food_name} is close to spoiling. Consume it as soon as possible!` :
        result.status === 'spoiled' ? `The ${result.food_name} has spoiled and is not safe to eat. Please discard it immediately to avoid health risks.` :
        '';
    }
    // Hide other blocks
    for (let i = 1; i < blocks.length; ++i) blocks[i].style.display = 'none';
  }

  // Basket modal logic
  const basketBtn = document.querySelector('.check-another');
  const basketModal = document.getElementById('basketModal');
  const basketList = document.getElementById('basketList');
  const closeBasketBtn = document.getElementById('closeBasketBtn');
  const clearBasketBtn = document.getElementById('clearBasketBtn');

  function renderBasket() {
    let basket = [];
    try { basket = JSON.parse(localStorage.getItem('foodBasket') || '[]'); } catch (e) {}
    if (basket.length === 0) {
      basketList.innerHTML = '<div>No items in your basket yet.</div>';
    } else {
      basketList.innerHTML = basket.map((item, idx) =>
        `<div style='margin-bottom:16px; border-bottom:1px solid #ffe5b4; padding-bottom:10px; position:relative;'>
          <div style='font-size:1.5rem;'>${item.emoji}</div>
          <div><b>${item.food_name}</b> (${item.foodType}, ${item.opened ? 'Opened' : 'Unopened'})</div>
          <div>Storage: ${item.storage}</div>
          <div>Purchased: ${item.purchaseDate}</div>
          <div>Checked: ${item.checkedDate}</div>
          <div>Status: <b>${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</b></div>
          <button data-idx='${idx}' class='removeBasketItemBtn' style='position:absolute; top:8px; right:8px; background:#ff3b3b; color:#fff; border:none; border-radius:6px; padding:2px 10px; font-size:0.95rem; cursor:pointer;'>Remove</button>
        </div>`
      ).join('');
    }
  }

  basketBtn.onclick = function() {
    renderBasket();
    basketModal.style.display = 'flex';
  };
  closeBasketBtn.onclick = function() {
    basketModal.style.display = 'none';
  };
  clearBasketBtn.onclick = function() {
    localStorage.setItem('foodBasket', '[]');
    renderBasket();
  };
  basketModal.addEventListener('click', function(e) {
    if (e.target.classList.contains('removeBasketItemBtn')) {
      let idx = parseInt(e.target.getAttribute('data-idx'));
      let basket = [];
      try { basket = JSON.parse(localStorage.getItem('foodBasket') || '[]'); } catch (e) {}
      basket.splice(idx, 1);
      localStorage.setItem('foodBasket', JSON.stringify(basket));
      renderBasket();
    }
  });
}); 
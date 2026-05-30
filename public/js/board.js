/* ============================================
   СУЕТАПОЛИЯ — Board Renderer
   ============================================ */

const COLOR_MAP = {
  brown: 'var(--property-brown)',
  lightblue: 'var(--property-lightblue)',
  pink: 'var(--property-pink)',
  orange: 'var(--property-orange)',
  red: 'var(--property-red)',
  yellow: 'var(--property-yellow)',
  green: 'var(--property-green)',
  darkblue: 'var(--property-darkblue)',
};

function getTileSide(index) {
  if (index <= 10) return 'bottom';
  if (index <= 19) return 'left';
  if (index <= 30) return 'top';
  return 'right';
}

function isCorner(index) {
  return [0, 10, 20, 30].includes(index);
}

function renderBoard() {
  const board = document.getElementById('board');
  const center = document.getElementById('board-center');
  board.innerHTML = '';

  BOARD_TILES.forEach((tile, i) => {
    const el = document.createElement('div');
    const side = getTileSide(i);
    const corner = isCorner(i);

    el.className = `tile ${side} ${tile.type}${corner ? ' corner' : ''}`;
    el.setAttribute('data-pos', i);
    el.setAttribute('data-id', tile.id);

    let html = '';
    if (tile.color) {
      el.style.setProperty('--bar-color', COLOR_MAP[tile.color]);
      html += `<div class="tile-color-bar"></div>`;
    }
    
    // Icon goes outside tile-content (so it doesn't rotate on side tiles)
    if (tile.icon) html += `<span class="tile-icon">${tile.icon}</span>`;
    
    let content = '';
    content += `<span class="tile-name">${tile.name.replace(/ /g, '<br>')}</span>`;
    if (tile.price) content += `<span class="tile-price">$${tile.price}</span>`;
    html += `<div class="tile-content">${content}</div>`;
    
    if (tile.type === 'property') html += `<div class="houses-row" data-tile-id="${tile.id}"></div>`;

    el.innerHTML = html;
    el.addEventListener('click', () => showTilePopup(tile));
    board.appendChild(el);
  });

  if (center) board.appendChild(center);
}

/* ===== PROPERTY POPUP ===== */
function showTilePopup(tile) {
  // Remove existing popup
  const old = document.getElementById('tile-popup');
  if (old) old.remove();

  const popup = document.createElement('div');
  popup.id = 'tile-popup';
  popup.className = 'tile-popup';

  let content = '';

  if (tile.type === 'property') {
    const colorHex = COLOR_MAP[tile.color] || '#888';
    content = `
      <div class="popup-color-header" style="background: ${colorHex}">
        <span class="popup-title">${tile.name}</span>
      </div>
      <div class="popup-body">
        <div class="popup-price">Цена: <b>$${tile.price}</b></div>
        <div class="popup-section-title">Рента:</div>
        <table class="popup-rent-table">
          <tr><td>Без домов</td><td>$${tile.rent[0]}</td></tr>
          <tr><td>🏠 1 дом</td><td>$${tile.rent[1]}</td></tr>
          <tr><td>🏠🏠 2 дома</td><td>$${tile.rent[2]}</td></tr>
          <tr><td>🏠🏠🏠 3 дома</td><td>$${tile.rent[3]}</td></tr>
          <tr><td>🏠🏠🏠🏠 4 дома</td><td>$${tile.rent[4]}</td></tr>
          <tr><td>🏨 Отель</td><td>$${tile.rent[5]}</td></tr>
        </table>
        <div class="popup-build">Стройка: <b>$${tile.buildCost}</b> / дом</div>
        <div class="popup-group">Группа: <span class="popup-group-dot" style="background:${colorHex}"></span></div>
      </div>
    `;
  } else if (tile.type === 'railroad') {
    content = `
      <div class="popup-color-header" style="background: #555">
        <span class="popup-title">${tile.icon} ${tile.name}</span>
      </div>
      <div class="popup-body">
        <div class="popup-price">Цена: <b>$${tile.price}</b></div>
        <div class="popup-section-title">Рента:</div>
        <table class="popup-rent-table">
          <tr><td>1 транспорт</td><td>$25</td></tr>
          <tr><td>2 транспорта</td><td>$50</td></tr>
          <tr><td>3 транспорта</td><td>$100</td></tr>
          <tr><td>4 транспорта</td><td>$200</td></tr>
        </table>
      </div>
    `;
  } else if (tile.type === 'utility') {
    content = `
      <div class="popup-color-header" style="background: #3a7a3a">
        <span class="popup-title">${tile.icon} ${tile.name}</span>
      </div>
      <div class="popup-body">
        <div class="popup-price">Цена: <b>$${tile.price}</b></div>
        <div class="popup-section-title">Рента:</div>
        <table class="popup-rent-table">
          <tr><td>1 коммуналка</td><td>x4 от кубиков</td></tr>
          <tr><td>2 коммуналки</td><td>x10 от кубиков</td></tr>
        </table>
      </div>
    `;
  } else if (tile.type === 'casino_slots') {
    content = `
      <div class="popup-color-header" style="background: linear-gradient(135deg, #f1c40f, #e67e22)">
        <span class="popup-title">🎰 Слоты</span>
      </div>
      <div class="popup-body">
        <p>Поставь сумму и крутани!</p>
        <table class="popup-rent-table">
          <tr><td>❌ Ничего (55%)</td><td>Потеря</td></tr>
          <tr><td>2 одинаковых (25%)</td><td>x1</td></tr>
          <tr><td>🍒🍒🍒 (10%)</td><td>x3</td></tr>
          <tr><td>💎💎💎 (6%)</td><td>x5</td></tr>
          <tr><td>👑👑👑 (3%)</td><td>x8</td></tr>
          <tr><td>🌟🌟🌟 (1%)</td><td>x20!</td></tr>
        </table>
      </div>
    `;
  } else if (tile.type === 'casino_wheel') {
    content = `
      <div class="popup-color-header" style="background: linear-gradient(135deg, #9b59b6, #3498db)">
        <span class="popup-title">🎡 Колесо Фортуны</span>
      </div>
      <div class="popup-body">
        <p>Крутани и испытай удачу!</p>
        <table class="popup-rent-table">
          <tr><td>💀 Пусто (40%)</td><td>x0</td></tr>
          <tr><td>🔄 Возврат (20%)</td><td>x1</td></tr>
          <tr><td>💵 (18%)</td><td>x2</td></tr>
          <tr><td>💰 (12%)</td><td>x3</td></tr>
          <tr><td>🔥 (7%)</td><td>x5</td></tr>
          <tr><td>🏆 Джекпот (3%)</td><td>x10!</td></tr>
        </table>
      </div>
    `;
  } else {
    content = `
      <div class="popup-color-header" style="background: #444">
        <span class="popup-title">${tile.icon || ''} ${tile.name}</span>
      </div>
      <div class="popup-body">
        <p>${tile.description || ''}</p>
        ${tile.amount ? `<p>Сумма: <b>$${tile.amount}</b></p>` : ''}
      </div>
    `;
  }

  content += `<button class="popup-close" onclick="this.parentElement.remove()">✕</button>`;
  popup.innerHTML = content;
  document.body.appendChild(popup);

  // Close on outside click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
}

/* ===== HOUSES DISPLAY ===== */
function updateHouses(tileId, count) {
  const container = document.querySelector(`.houses-row[data-tile-id="${tileId}"]`);
  if (!container) return;

  if (count === 5) {
    container.innerHTML = '<div class="hotel-icon">🏨</div>';
  } else {
    container.innerHTML = Array(count).fill('<div class="house-icon">🏠</div>').join('');
  }
}

/* ===== TOKEN MOVEMENT ===== */
function moveTokenSmooth(tokenEl, fromPos, toPos, callback) {
  let current = fromPos;
  const totalTiles = 40;

  function step() {
    current = (current + 1) % totalTiles;
    const targetTile = document.querySelector(`.tile[data-pos="${current}"]`);
    if (!targetTile) return;

    const boardRect = document.getElementById('board').getBoundingClientRect();
    const tileRect = targetTile.getBoundingClientRect();

    tokenEl.style.left = (tileRect.left - boardRect.left + tileRect.width / 2 - 10) + 'px';
    tokenEl.style.top = (tileRect.top - boardRect.top + tileRect.height / 2 - 10) + 'px';

    playSound('step');

    if (current === toPos) {
      setTimeout(() => {
        if (callback) callback();
      }, 200);
    } else {
      setTimeout(step, 150);
    }
  }

  setTimeout(step, 200);
}

// Initialize board on load (called from app.js)

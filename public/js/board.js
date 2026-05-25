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
  board.innerHTML = '';

  BOARD_TILES.forEach((tile, i) => {
    const el = document.createElement('div');
    const side = getTileSide(i);
    const corner = isCorner(i);

    el.className = `tile ${side} ${tile.type}${corner ? ' corner' : ''}`;
    el.setAttribute('data-pos', i);
    el.setAttribute('data-id', tile.id);

    let html = '';

    // Color bar for properties
    if (tile.color) {
      html += `<div class="tile-color-bar" style="--bar-color: ${COLOR_MAP[tile.color]}"></div>`;
    }

    // Icon
    if (tile.icon) {
      html += `<span class="tile-icon">${tile.icon}</span>`;
    }

    // Name
    html += `<span class="tile-name">${tile.name}</span>`;

    // Price
    if (tile.price) {
      html += `<span class="tile-price">$${tile.price}</span>`;
    }

    el.innerHTML = html;

    // Click handler for tile info
    el.addEventListener('click', () => showTileInfo(tile));

    board.appendChild(el);
  });
}

function showTileInfo(tile) {
  console.log('Tile clicked:', tile);
  // TODO: Show popup with tile details
}

// Initialize board on load
document.addEventListener('DOMContentLoaded', renderBoard);

/* ============================================
   СУЕТАПОЛИЯ — Main App
   ============================================ */

let currentPlayer = { name: '', tokenId: -1, position: 0, money: 1000, inJail: false, jailTurns: 0, jailFreeCards: 0 };
let gameSettings = {
  budget: 1000, characters: true, auctions: false,
  doubleStart: false, pahanBank: false, pahanPool: 0, turnTimer: 0,
};
let turnTimerInterval = null, turnTimeLeft = 0;
let isMoving = false;
let doublesCount = 0;
let lastDiceTotal = 0;
const tileHouses = {}; // tileId -> 0-5 (0=none, 1-4=houses, 5=hotel)

/* ===== SOUND SYSTEM (Web Audio) ===== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function getAudio() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

function playSound(type) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.value = 0.15;
    switch(type) {
      case 'step':
        osc.type='sine'; osc.frequency.value=440;
        gain.gain.setValueAtTime(0.1,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);
        osc.start(); osc.stop(ctx.currentTime+0.08); break;
      case 'dice':
        osc.type='triangle'; osc.frequency.value=200;
        osc.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.3);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
        osc.start(); osc.stop(ctx.currentTime+0.3); break;
      case 'buy':
        osc.type='sine'; osc.frequency.value=523;
        setTimeout(()=>{const o2=ctx.createOscillator();const g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.type='sine';o2.frequency.value=659;g2.gain.value=0.12;g2.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o2.start();o2.stop(ctx.currentTime+0.2);},100);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);
        osc.start(); osc.stop(ctx.currentTime+0.15); break;
      case 'jail':
        osc.type='sawtooth'; osc.frequency.value=300;
        osc.frequency.exponentialRampToValueAtTime(100,ctx.currentTime+0.5);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
        osc.start(); osc.stop(ctx.currentTime+0.5); break;
      case 'cash':
        osc.type='sine'; osc.frequency.value=880;
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
        osc.start(); osc.stop(ctx.currentTime+0.12); break;
      case 'lose':
        osc.type='sawtooth'; osc.frequency.value=200;
        osc.frequency.exponentialRampToValueAtTime(80,ctx.currentTime+0.4);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
        osc.start(); osc.stop(ctx.currentTime+0.4); break;
      case 'jackpot':
        osc.type='sine'; osc.frequency.value=523;
        osc.frequency.setValueAtTime(523,ctx.currentTime);
        osc.frequency.setValueAtTime(659,ctx.currentTime+0.1);
        osc.frequency.setValueAtTime(784,ctx.currentTime+0.2);
        osc.frequency.setValueAtTime(1047,ctx.currentTime+0.3);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
        osc.start(); osc.stop(ctx.currentTime+0.5); break;
    }
  } catch(e) {}
}

const DICE_ROTATIONS = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(-90deg) rotateY(0deg)',
  3: 'rotateX(0deg) rotateY(-90deg)',
  4: 'rotateX(0deg) rotateY(90deg)',
  5: 'rotateX(90deg) rotateY(0deg)',
  6: 'rotateX(180deg) rotateY(0deg)',
};

document.addEventListener('DOMContentLoaded', () => {
  startPreroll();
  document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  setTheme(localStorage.getItem('suetapoliya-theme') || 'neon');
});

function startPreroll() {
  document.getElementById('nickname-screen').style.display = '';
  initNicknameScreen();
}

function initNicknameScreen() {
  const grid = document.getElementById('token-grid'), ni = document.getElementById('nick-input'), rb = document.getElementById('nick-ready-btn');
  grid.innerHTML = PLAYER_TOKENS.map(t => `<div class="token-option" data-token-id="${t.id}"><div class="tok-color-big" style="background:${t.cssColor}"></div><span class="tok-label">${t.label}</span></div>`).join('');
  grid.addEventListener('click', e => { const o=e.target.closest('.token-option'); if(!o)return; grid.querySelectorAll('.token-option').forEach(x=>x.classList.remove('selected')); o.classList.add('selected'); currentPlayer.tokenId=parseInt(o.dataset.tokenId); check(); });
  ni.addEventListener('input', () => { currentPlayer.name=ni.value.trim(); check(); });
  function check() { rb.disabled = !(currentPlayer.name.length>=2 && currentPlayer.tokenId>=0); }
  rb.addEventListener('click', () => { document.getElementById('nickname-screen').style.display='none'; document.getElementById('lobby-screen').style.display=''; initLobby(); });
}

function initLobby() {
  initOG('budget-options', v => gameSettings.budget=parseInt(v));
  initOG('timer-options', v => gameSettings.turnTimer=parseInt(v));
  document.getElementById('lobby-start-btn').addEventListener('click', () => {
    gameSettings.characters = document.getElementById('toggle-characters').checked;
    gameSettings.auctions = document.getElementById('toggle-auctions').checked;
    gameSettings.doubleStart = document.getElementById('toggle-double-start').checked;
    gameSettings.pahanBank = document.getElementById('toggle-pahan').checked;
    document.getElementById('lobby-screen').style.display='none';
    document.getElementById('app').style.display='';
    initGame();
  });
}
function initOG(id, cb) {
  const bs = document.querySelectorAll(`#${id} .lobby-opt`);
  bs.forEach(b => b.addEventListener('click', () => { bs.forEach(x=>x.classList.remove('active')); b.classList.add('active'); cb(b.dataset.value); }));
}

function initGame() {
  currentPlayer.money = gameSettings.budget;
  currentPlayer.position = 0;
  renderBoard(); renderPlayers();
  placeToken(0);
  document.getElementById('roll-btn').addEventListener('click', rollDice3D);
  document.getElementById('build-btn').addEventListener('click', showBuildPanel);
  document.getElementById('chat-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', e => { if(e.key==='Enter') sendChat(); });
  document.querySelectorAll('.emoji-btn').forEach(b => b.addEventListener('click', () => addChatMessage(currentPlayer.name, b.textContent)));
  const tk = PLAYER_TOKENS[currentPlayer.tokenId];
  addChatMessage('🎲', `${currentPlayer.name} зашёл в игру!`);
  addChatMessage('⚙️', `Бюджет: $${gameSettings.budget}`);
  if (gameSettings.characters) { const c=CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)]; addChatMessage('🃏',`${currentPlayer.name} получил: ${c.icon} ${c.name} — ${c.description}`); }
  if (gameSettings.doubleStart) addChatMessage('⚙️','Двойная Суета ($400) ✅');
  if (gameSettings.pahanBank) addChatMessage('⚙️','Налоги у Пахана ✅');
  if (gameSettings.turnTimer>0) { addChatMessage('⚙️',`Таймер: ${gameSettings.turnTimer}с`); startTurnTimer(); }
}

function setTheme(t) { document.body.setAttribute('data-theme',t); localStorage.setItem('suetapoliya-theme',t); document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===t)); }

function renderPlayers() {
  const list = document.getElementById('players-list'), tk = PLAYER_TOKENS[currentPlayer.tokenId];
  list.innerHTML = [
    { name:currentPlayer.name, token:tk, money:currentPlayer.money, active:true },
    { name:'Ожидание...', token:{cssColor:'#555'}, money:0, active:false },
  ].map(p => `<div class="player-info ${p.active?'active':''}"><div class="player-color-dot" style="background:${p.token.cssColor}"></div><span class="player-name">${p.name}</span><span class="player-money">${p.money?'$'+p.money:''}</span></div>`).join('');
}

/* ===== PLAYER TOKEN ON BOARD ===== */
function placeToken(position) {
  const old = document.querySelector('.player-board-token');
  if (old) old.remove();

  const tile = document.querySelector(`.tile[data-pos="${position}"]`);
  if (!tile) return;

  const tk = PLAYER_TOKENS[currentPlayer.tokenId];
  const token = document.createElement('div');
  token.className = 'player-board-token';
  token.style.background = tk.cssColor;
  token.style.setProperty('--token-color', tk.cssColor);
  tile.appendChild(token);
}

async function moveToken(from, to, total) {
  isMoving = true;
  const steps = to > from ? to - from : (40 - from + to);
  let pos = from;

  for (let i = 0; i < steps; i++) {
    pos = (pos + 1) % 40;
    placeToken(pos);
    playSound('step');
    if (pos === 0 && i > 0) {
      // Passed СУЕТА (start)
      const bonus = gameSettings.doubleStart ? 400 : 200;
      currentPlayer.money += bonus;
      addChatMessage('💸', `${currentPlayer.name} прошёл СУЕТУ! +$${bonus}`);
      renderPlayers();
    }
    await sleep(120);
  }

  currentPlayer.position = to;
  isMoving = false;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ===== LANDING LOGIC ===== */
const tileOwners = {}; // tileId -> playerName

function handleLanding(position) {
  const tile = BOARD_TILES[position];
  if (!tile) return;

  switch (tile.type) {
    case 'property':
    case 'railroad':
    case 'utility':
      if (tileOwners[tile.id]) {
        if (tileOwners[tile.id] !== currentPlayer.name) {
          const rent = calcRent(tile);
          currentPlayer.money -= rent;
          addChatMessage('💸', `${currentPlayer.name} платит аренду за «${tile.name}»: -$${rent}`);
          renderPlayers();
        } else {
          addChatMessage('🏠', `${currentPlayer.name} на своей «${tile.name}»`);
        }
      } else {
        showBuyPanel(tile);
      }
      break;
    case 'tax':
      currentPlayer.money -= tile.amount;
      if (gameSettings.pahanBank) {
        gameSettings.pahanPool = (gameSettings.pahanPool || 0) + tile.amount;
        addChatMessage('💸', `${currentPlayer.name} платит ${tile.name}: -$${tile.amount} (в банк Пахана)`);
      } else {
        addChatMessage('💸', `${currentPlayer.name} платит ${tile.name}: -$${tile.amount}`);
      }
      renderPlayers();
      break;
    case 'chance':
      const cc = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      applyCard(cc);
      addChatMessage('⚡', `ДВИЖ: ${cc.text}`);
      break;
    case 'chest':
      const ch = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
      applyCard(ch);
      addChatMessage('📦', `ТЕМКА: ${ch.text}`);
      break;
    case 'corner':
      if (position === 30) {
        goToJail();
      } else if (position === 20) {
        const pool = gameSettings.pahanPool || 0;
        if (pool > 0) {
          currentPlayer.money += pool;
          gameSettings.pahanPool = 0;
          addChatMessage('🤙', `${currentPlayer.name} забрал у Пахана $${pool}!`);
          renderPlayers();
        } else {
          addChatMessage('🤙', `${currentPlayer.name} у Пахана! Пусто.`);
        }
      }
      break;
    case 'casino_slots':
      playCasinoSlots();
      break;
    case 'casino_wheel':
      playCasinoWheel();
      break;
  }
}

function calcRent(tile) {
  if (tile.type === 'property') {
    const houses = tileHouses[tile.id] || 0;
    if (houses > 0 && tile.rent) return tile.rent[houses];
    const base = tile.rent ? tile.rent[0] : 0;
    if (tile.group) {
      const groupTiles = BOARD_TILES.filter(t => t.group === tile.group);
      const allOwned = groupTiles.every(t => tileOwners[t.id] === tileOwners[tile.id]);
      if (allOwned) return base * 2;
    }
    return base;
  }
  if (tile.type === 'railroad') {
    const owned = BOARD_TILES.filter(t => t.type === 'railroad' && tileOwners[t.id] === tileOwners[tile.id]).length;
    return [0, 25, 50, 100, 200][owned] || 25;
  }
  if (tile.type === 'utility') {
    const owned = BOARD_TILES.filter(t => t.type === 'utility' && tileOwners[t.id] === tileOwners[tile.id]).length;
    return lastDiceTotal * (owned >= 2 ? 10 : 4);
  }
  return 0;
}

function applyCard(card) {
  switch (card.action) {
    case 'collect':
      currentPlayer.money += card.amount;
      renderPlayers();
      break;
    case 'pay':
      currentPlayer.money -= card.amount;
      renderPlayers(); checkBankruptcy();
      break;
    case 'move':
      const oldPos = currentPlayer.position;
      currentPlayer.position = card.target;
      placeToken(card.target);
      if (card.collect) { currentPlayer.money += card.collect; renderPlayers(); }
      if (card.target < oldPos && card.target !== 10) {
        const bonus = gameSettings.doubleStart ? 400 : 200;
        currentPlayer.money += bonus;
        addChatMessage('💸', `Прошёл СУЕТУ! +$${bonus}`);
        renderPlayers();
      }
      handleLanding(card.target);
      break;
    case 'jail':
      goToJail();
      break;
    case 'jailFree':
      currentPlayer.jailFreeCards++;
      addChatMessage('🎫', `${currentPlayer.name} получил карту выхода из тюрьмы!`);
      break;
    case 'back':
      const newPos = (currentPlayer.position - card.steps + 40) % 40;
      currentPlayer.position = newPos;
      placeToken(newPos);
      handleLanding(newPos);
      break;
    case 'payAll': case 'collectAll':
      // Single-player: just collect/pay fixed amount
      const amt = card.amount * 1; // 1 other player placeholder
      if (card.action === 'collectAll') currentPlayer.money += amt;
      else currentPlayer.money -= amt;
      renderPlayers(); checkBankruptcy();
      break;
  }
}

/* ===== JAIL ===== */
function goToJail() {
  currentPlayer.inJail = true;
  currentPlayer.jailTurns = 0;
  currentPlayer.position = 10;
  placeToken(10);
  doublesCount = 0;
  playSound('jail');
  addChatMessage('👮', `${currentPlayer.name} идёт В ТЮРЬМУ!`);
}

function showJailPanel() {
  const old = document.getElementById('buy-panel'); if (old) old.remove();
  const hasFreeCard = currentPlayer.jailFreeCards > 0;
  const panel = document.createElement('div');
  panel.id = 'buy-panel'; panel.className = 'buy-panel';
  panel.innerHTML = `
    <div class="buy-panel-inner">
      <div class="buy-title">⛓️ Тюрьма</div>
      <div class="buy-price">Ход ${currentPlayer.jailTurns + 1} из 3</div>
      <div class="buy-rent">Выкуп: $50 ${hasFreeCard ? '| 🎫 Есть карта!' : ''}</div>
      <div class="buy-buttons">
        <button class="buy-btn buy-yes" ${currentPlayer.money < 50 ? 'disabled' : ''}>Заплатить $50</button>
        ${hasFreeCard ? '<button class="buy-btn buy-yes" id="jail-card">🎫 Карта</button>' : ''}
        <button class="buy-btn buy-no">🎲 Бросить дубль</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  panel.querySelector('.buy-yes').addEventListener('click', () => {
    currentPlayer.money -= 50;
    currentPlayer.inJail = false;
    currentPlayer.jailTurns = 0;
    addChatMessage('💰', `${currentPlayer.name} заплатил $50 за выход!`);
    renderPlayers(); panel.remove();
  });
  const cardBtn = panel.querySelector('#jail-card');
  if (cardBtn) cardBtn.addEventListener('click', () => {
    currentPlayer.jailFreeCards--;
    currentPlayer.inJail = false;
    currentPlayer.jailTurns = 0;
    addChatMessage('🎫', `${currentPlayer.name} использовал карту!`);
    panel.remove();
  });
  panel.querySelector('.buy-no').addEventListener('click', () => {
    panel.remove();
    rollDiceForJail();
  });
}

function rollDiceForJail() {
  const v1 = Math.floor(Math.random()*6)+1, v2 = Math.floor(Math.random()*6)+1;
  addChatMessage('🎲', `${currentPlayer.name} бросил ${v1}+${v2}`);
  if (v1 === v2) {
    currentPlayer.inJail = false; currentPlayer.jailTurns = 0;
    addChatMessage('🔥', `Дубль! ${currentPlayer.name} выходит из тюрьмы!`);
    const total = v1+v2;
    const newPos = (currentPlayer.position + total) % 40;
    moveToken(currentPlayer.position, newPos, total).then(() => handleLanding(newPos));
  } else {
    currentPlayer.jailTurns++;
    if (currentPlayer.jailTurns >= 3) {
      currentPlayer.money -= 50;
      currentPlayer.inJail = false; currentPlayer.jailTurns = 0;
      addChatMessage('💰', `3 попытки! ${currentPlayer.name} платит $50 принудительно`);
      renderPlayers(); checkBankruptcy();
    } else {
      addChatMessage('⛓️', `Не дубль. Осталось ${3-currentPlayer.jailTurns} попытки.`);
    }
  }
}

/* ===== CASINO ===== */
function playCasinoSlots() {
  const old = document.getElementById('buy-panel'); if (old) old.remove();
  const panel = document.createElement('div');
  panel.id = 'buy-panel'; panel.className = 'buy-panel';
  const bet = Math.min(100, currentPlayer.money);
  panel.innerHTML = `
    <div class="buy-panel-inner">
      <div class="buy-title">🎰 СЛОТЫ</div>
      <div class="buy-price">Ставка: $${bet}</div>
      <div class="buy-rent" id="slots-result" style="font-size:2em;min-height:40px">❓❓❓</div>
      <div class="buy-buttons">
        <button class="buy-btn buy-yes" ${currentPlayer.money < bet ? 'disabled' : ''}>Крутить 🎰</button>
        <button class="buy-btn buy-no">Уйти</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('.buy-yes').addEventListener('click', () => {
    const symbols = ['🍒','🍋','💎','7️⃣','🔔','🍀'];
    const s1=symbols[Math.floor(Math.random()*6)], s2=symbols[Math.floor(Math.random()*6)], s3=symbols[Math.floor(Math.random()*6)];
    document.getElementById('slots-result').textContent = `${s1} ${s2} ${s3}`;
    currentPlayer.money -= bet;
    if (s1===s2 && s2===s3) {
      const win = bet * 10;
      currentPlayer.money += win;
      addChatMessage('🎰', `ДЖЕКПОТ!!! ${s1}${s2}${s3} +$${win}!`);
    } else if (s1===s2 || s2===s3 || s1===s3) {
      const win = bet * 3;
      currentPlayer.money += win;
      addChatMessage('🎰', `Пара! ${s1}${s2}${s3} +$${win}`);
    } else {
      addChatMessage('🎰', `${s1}${s2}${s3} — мимо. -$${bet}`);
    }
    renderPlayers(); checkBankruptcy();
    setTimeout(() => panel.remove(), 1500);
  });
  panel.querySelector('.buy-no').addEventListener('click', () => panel.remove());
}

function playCasinoWheel() {
  const old = document.getElementById('buy-panel'); if (old) old.remove();
  const segments = [
    { text: '+$300', value: 300 }, { text: '-$100', value: -100 },
    { text: '+$50', value: 50 }, { text: 'x2 аренда', value: 0, special: 'doubleRent' },
    { text: '+$200', value: 200 }, { text: '-$200', value: -200 },
    { text: '+$500', value: 500 }, { text: '$0', value: 0 },
  ];
  const panel = document.createElement('div');
  panel.id = 'buy-panel'; panel.className = 'buy-panel';
  panel.innerHTML = `
    <div class="buy-panel-inner">
      <div class="buy-title">🎡 КОЛЕСО ФОРТУНЫ</div>
      <div class="buy-rent" id="wheel-result" style="font-size:1.5em;min-height:40px">Крутите!</div>
      <div class="buy-buttons">
        <button class="buy-btn buy-yes">Крутить 🎡</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('.buy-yes').addEventListener('click', () => {
    const seg = segments[Math.floor(Math.random()*segments.length)];
    document.getElementById('wheel-result').textContent = seg.text;
    currentPlayer.money += seg.value;
    if (seg.value > 0) addChatMessage('🎡', `Колесо: ${seg.text}! 🎉`);
    else if (seg.value < 0) addChatMessage('🎡', `Колесо: ${seg.text} 😢`);
    else addChatMessage('🎡', `Колесо: ${seg.text}`);
    renderPlayers(); checkBankruptcy();
    setTimeout(() => panel.remove(), 1500);
  });
}

/* ===== BANKRUPTCY CHECK ===== */
function checkBankruptcy() {
  if (currentPlayer.money < 0) {
    addChatMessage('💀', `${currentPlayer.name} в долгах! ($${currentPlayer.money})`);
  }
}

function showBuyPanel(tile) {
  // Remove old panel
  const old = document.getElementById('buy-panel');
  if (old) old.remove();

  const panel = document.createElement('div');
  panel.id = 'buy-panel';
  panel.className = 'buy-panel';
  panel.innerHTML = `
    <div class="buy-panel-inner">
      <div class="buy-title">🏠 ${tile.name}</div>
      <div class="buy-price">Цена: <strong>$${tile.price}</strong></div>
      ${tile.rent ? `<div class="buy-rent">Аренда: $${tile.rent[0]}</div>` : ''}
      <div class="buy-buttons">
        <button class="buy-btn buy-yes" ${currentPlayer.money < tile.price ? 'disabled' : ''}>Купить 💰</button>
        <button class="buy-btn buy-no">Пропустить ❌</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  panel.querySelector('.buy-yes').addEventListener('click', () => {
    currentPlayer.money -= tile.price;
    tileOwners[tile.id] = currentPlayer.name;
    playSound('buy');
    addChatMessage('🏠', `${currentPlayer.name} купил «${tile.name}» за $${tile.price}!`);
    renderPlayers();
    markOwned(tile);
    renderMyProperties();
    panel.remove();
  });

  panel.querySelector('.buy-no').addEventListener('click', () => {
    addChatMessage('❌', `${currentPlayer.name} пропустил «${tile.name}»`);
    panel.remove();
  });
}

function markOwned(tile) {
  const el = document.querySelector(`.tile[data-pos="${BOARD_TILES.indexOf(tile)}"]`);
  if (!el) return;
  const tk = PLAYER_TOKENS[currentPlayer.tokenId];

  // Glowing border
  el.classList.add('owned');
  el.style.setProperty('--owner-color', tk.cssColor);

  // Thick owner bar on outer edge
  let bar = el.querySelector('.tile-owner-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'tile-owner-bar';
    el.appendChild(bar);
  }
  bar.style.background = tk.cssColor;

  // Colored dot in corner
  let dot = el.querySelector('.tile-owner-dot');
  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'tile-owner-dot';
    el.appendChild(dot);
  }
  dot.style.background = tk.cssColor;
}

/* ===== 3D DICE ROLL ===== */
function rollDice3D() {
  if (isMoving) return;

  // Jail check
  if (currentPlayer.inJail) {
    showJailPanel();
    return;
  }

  const die1 = document.getElementById('die3d-1');
  const die2 = document.getElementById('die3d-2');
  const btn = document.getElementById('roll-btn');

  btn.disabled = true;
  playSound('dice');
  die1.classList.add('rolling');
  die2.classList.add('rolling');

  setTimeout(async () => {
    const v1 = Math.floor(Math.random()*6)+1;
    const v2 = Math.floor(Math.random()*6)+1;

    die1.classList.remove('rolling');
    die2.classList.remove('rolling');
    die1.style.transform = DICE_ROTATIONS[v1];
    die2.style.transform = DICE_ROTATIONS[v2];

    const total = v1+v2, dbl = v1===v2;
    lastDiceTotal = total;
    addChatMessage('🎲',`${currentPlayer.name} выбросил ${v1}+${v2}=${total}${dbl?' (🔥 ДУБЛЬ!)':''}`);

    // Doubles tracking
    if (dbl) {
      doublesCount++;
      if (doublesCount >= 3) {
        addChatMessage('🚨', '3 дубля подряд! В ТЮРЬМУ!');
        goToJail();
        btn.disabled = false;
        return;
      }
    } else {
      doublesCount = 0;
    }

    // Move token
    const newPos = (currentPlayer.position + total) % 40;
    await moveToken(currentPlayer.position, newPos, total);

    // Handle landing
    handleLanding(newPos);

    // Double = extra turn
    if (dbl && !currentPlayer.inJail) {
      addChatMessage('🔥', 'Дубль! Бросай ещё раз!');
    } else {
      doublesCount = 0;
    }

    btn.disabled = false;
    if (gameSettings.turnTimer>0) startTurnTimer();
  }, 1500);
}

function startTurnTimer() {
  const el = document.getElementById('turn-timer');
  if (turnTimerInterval) clearInterval(turnTimerInterval);
  turnTimeLeft = gameSettings.turnTimer;
  el.textContent = `⏱️ ${turnTimeLeft}с`; el.classList.remove('warning');
  turnTimerInterval = setInterval(() => {
    turnTimeLeft--;
    el.textContent = `⏱️ ${turnTimeLeft}с`;
    if (turnTimeLeft<=10) el.classList.add('warning');
    if (turnTimeLeft<=0) { clearInterval(turnTimerInterval); el.textContent='⏱️ Время!'; addChatMessage('⏱️',`Время хода ${currentPlayer.name} истекло!`); }
  }, 1000);
}

function sendChat() { const i=document.getElementById('chat-input'),t=i.value.trim(); if(!t)return; addChatMessage(currentPlayer.name,t); i.value=''; }
function addChatMessage(s,t) {
  const c=document.getElementById('chat-messages'),m=document.createElement('div');
  m.className='chat-msg'; m.innerHTML=`<span class="sender">${s}:</span> ${t}`;
  c.appendChild(m); c.scrollTop=c.scrollHeight;
  // Also add to board game-log (newest on top)
  const log = document.getElementById('game-log');
  if (log) {
    const entry = document.createElement('div');
    entry.className = 'game-log-msg';
    entry.textContent = `${s} ${t}`;
    log.prepend(entry);
    log.scrollTop = 0;
    // Keep only last 20 messages
    while (log.children.length > 20) log.removeChild(log.lastChild);
  }
}

/* ===== MY PROPERTIES PANEL ===== */
function togglePropsPanel() {
  const header = document.querySelector('.props-header');
  const list = document.getElementById('my-props-list');
  header.classList.toggle('open');
  list.classList.toggle('collapsed');
}

function renderMyProperties() {
  const list = document.getElementById('my-props-list');
  const count = document.getElementById('props-count');
  const myTiles = BOARD_TILES.filter(t => tileOwners[t.id] === currentPlayer.name);
  count.textContent = `(${myTiles.length})`;

  if (myTiles.length === 0) {
    list.innerHTML = '<div class="props-empty">Пока ничего 🏚️</div>';
    return;
  }

  const COLOR_MAP = { brown:'#8B5E3C', lightblue:'#00bcd4', pink:'#e91e90', orange:'#ff9800', red:'#f44336', yellow:'#ffeb3b', green:'#4caf50', darkblue:'#1565c0' };

  // Check monopolies
  const groupCounts = {};
  BOARD_TILES.forEach(t => {
    if (t.group) {
      if (!groupCounts[t.group]) groupCounts[t.group] = { total: 0, owned: 0 };
      groupCounts[t.group].total++;
      if (tileOwners[t.id] === currentPlayer.name) groupCounts[t.group].owned++;
    }
  });

  list.innerHTML = myTiles.map(t => {
    const color = t.color ? COLOR_MAP[t.color] || '#888' : '#888';
    const houses = tileHouses[t.id] || 0;
    const isMonopoly = t.group && groupCounts[t.group] && groupCounts[t.group].owned === groupCounts[t.group].total;
    // Calculate actual rent at current level
    let currentRent = 0;
    if (t.rent) {
      if (houses > 0) currentRent = t.rent[houses];
      else if (isMonopoly) currentRent = t.rent[0] * 2;
      else currentRent = t.rent[0];
    }
    // House label
    const houseLabel = houses === 5 ? '🏨' : houses > 0 ? '🏠'.repeat(houses) : (isMonopoly ? '★' : '');
    const houseText = houses === 5 ? 'Отель' : houses > 0 ? `${houses} дом` : (isMonopoly ? 'Монополия' : '');
    return `<div class="prop-item ${isMonopoly ? 'monopoly' : ''}" onclick="highlightTile(${BOARD_TILES.indexOf(t)})">
      <div class="prop-color-big" style="background:${color}"></div>
      <div class="prop-info">
        <span class="prop-name">${t.name}</span>
        ${houseText ? `<span class="prop-house-label">${houseLabel} ${houseText}</span>` : ''}
        ${currentRent ? `<span class="prop-rent-val">Рента: $${currentRent}</span>` : ''}
      </div>
      <span class="prop-price">$${t.price}</span>
    </div>`;
  }).join('');
}

function highlightTile(pos) {
  const tile = document.querySelector(`.tile[data-pos="${pos}"]`);
  if (!tile) return;
  tile.style.transition = 'transform 0.2s, box-shadow 0.2s';
  tile.style.transform = 'scale(1.15)';
  tile.style.boxShadow = '0 0 25px rgba(255,255,255,0.4)';
  tile.style.zIndex = '50';
  setTimeout(() => {
    tile.style.transform = '';
    tile.style.boxShadow = '';
    tile.style.zIndex = '';
  }, 1500);
}

/* ===== BUILD HOUSES/HOTELS ===== */
function showBuildPanel() {
  const old = document.getElementById('buy-panel'); if (old) old.remove();

  // Find monopolies
  const myProps = BOARD_TILES.filter(t => t.type === 'property' && tileOwners[t.id] === currentPlayer.name && t.group);
  const groups = {};
  myProps.forEach(t => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  });

  // Filter to full monopolies only
  const buildable = [];
  Object.entries(groups).forEach(([group, tiles]) => {
    const totalInGroup = BOARD_TILES.filter(t => t.group === group).length;
    if (tiles.length === totalInGroup) {
      tiles.forEach(t => {
        const houses = tileHouses[t.id] || 0;
        if (houses < 5) buildable.push(t);
      });
    }
  });

  if (buildable.length === 0) {
    addChatMessage('🏗️', 'Нет монополий для строительства!');
    return;
  }

  const COLOR_MAP = { brown:'#8B5E3C', lightblue:'#00bcd4', pink:'#e91e90', orange:'#ff9800', red:'#f44336', yellow:'#ffeb3b', green:'#4caf50', darkblue:'#1565c0' };

  const panel = document.createElement('div');
  panel.id = 'buy-panel'; panel.className = 'buy-panel';
  panel.innerHTML = `
    <div class="buy-panel-inner" style="min-width:300px">
      <div class="buy-title">🏗️ Строительство</div>
      <div style="max-height:300px;overflow-y:auto;margin:8px 0">
        ${buildable.map(t => {
          const houses = tileHouses[t.id] || 0;
          const cost = t.buildCost;
          const nextLevel = houses < 4 ? `🏠 Дом ${houses+1}` : '🏨 Отель';
          const color = COLOR_MAP[t.color] || '#888';
          const nextRent = t.rent[houses + 1] || '???';
          return `<div class="prop-item" style="margin:4px 0;padding:8px" data-build-id="${t.id}">
            <div class="prop-color-big" style="background:${color}"></div>
            <div class="prop-info">
              <span class="prop-name">${t.name}</span>
              <span class="prop-rent">${'🏠'.repeat(Math.min(houses,4))}${houses===5?'🏨':''} → ${nextLevel} | Рента: $${nextRent}</span>
            </div>
            <button class="buy-btn buy-yes" style="flex:0;padding:6px 12px;font-size:0.8em" ${currentPlayer.money < cost ? 'disabled' : ''}>$${cost}</button>
          </div>`;
        }).join('')}
      </div>
      <div class="buy-buttons">
        <button class="buy-btn buy-no" style="flex:1">Закрыть</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  panel.querySelectorAll('[data-build-id]').forEach(row => {
    const btn = row.querySelector('.buy-yes');
    btn.addEventListener('click', () => {
      const tileId = parseInt(row.dataset.buildId);
      const tile = BOARD_TILES.find(t => t.id === tileId);
      if (!tile) return;
      const cost = tile.buildCost;
      if (currentPlayer.money < cost) return;
      currentPlayer.money -= cost;
      tileHouses[tileId] = (tileHouses[tileId] || 0) + 1;
      const houses = tileHouses[tileId];
      const label = houses === 5 ? '🏨 Отель' : `🏠 Дом ${houses}`;
      playSound('buy');
      addChatMessage('🏗️', `${currentPlayer.name} построил ${label} на «${tile.name}» за $${cost}`);
      renderPlayers();
      updateTileHouses(tile);
      renderMyProperties();
      panel.remove();
      showBuildPanel(); // Reopen to continue building
    });
  });

  panel.querySelector('.buy-no').addEventListener('click', () => panel.remove());
}

function updateTileHouses(tile) {
  const pos = BOARD_TILES.indexOf(tile);
  const el = document.querySelector(`.tile[data-pos="${pos}"]`);
  if (!el) return;
  const houses = tileHouses[tile.id] || 0;

  // Remove old houses indicator
  let indicator = el.querySelector('.tile-houses');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'tile-houses';
    el.appendChild(indicator);
  }

  if (houses === 5) {
    indicator.textContent = '🏨';
    indicator.title = 'Отель';
  } else if (houses > 0) {
    indicator.textContent = '🏠'.repeat(houses);
    indicator.title = `${houses} дом(а)`;
  } else {
    indicator.textContent = '';
  }
}

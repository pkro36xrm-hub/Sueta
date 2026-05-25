/* ============================================
   СУЕТАПОЛИЯ — Main App
   ============================================ */

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Theme switching
document.addEventListener('DOMContentLoaded', () => {
  const switcher = document.getElementById('theme-switcher');
  const saved = localStorage.getItem('suetapoliya-theme') || 'neon';
  setTheme(saved);

  switcher.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-btn');
    if (!btn) return;
    const theme = btn.dataset.theme;
    setTheme(theme);
  });

  // Demo players
  renderDemoPlayers();

  // Dice roll
  document.getElementById('roll-btn').addEventListener('click', rollDice);

  // Chat
  document.getElementById('chat-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });

  // Quick emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addChatMessage('Ты', btn.textContent);
    });
  });
});

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('suetapoliya-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
}

// Demo players for visual preview
function renderDemoPlayers() {
  const list = document.getElementById('players-list');
  const demo = [
    { name: 'Игрок 1', token: '🔴', money: 1500, active: true },
    { name: 'Игрок 2', token: '🔵', money: 1500, active: false },
    { name: 'Игрок 3', token: '🟢', money: 1500, active: false },
  ];

  list.innerHTML = demo.map(p => `
    <div class="player-info ${p.active ? 'active' : ''}">
      <span class="player-token-display">${p.token}</span>
      <span class="player-name">${p.name}</span>
      <span class="player-money">$${p.money}</span>
    </div>
  `).join('');
}

// Dice roll animation
function rollDice() {
  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  const btn = document.getElementById('roll-btn');

  btn.disabled = true;
  die1.classList.add('rolling');
  die2.classList.add('rolling');

  let count = 0;
  const interval = setInterval(() => {
    die1.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    die2.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    count++;
    if (count > 15) {
      clearInterval(interval);
      const v1 = Math.floor(Math.random() * 6);
      const v2 = Math.floor(Math.random() * 6);
      die1.textContent = DICE_FACES[v1];
      die2.textContent = DICE_FACES[v2];
      die1.classList.remove('rolling');
      die2.classList.remove('rolling');
      btn.disabled = false;

      const total = (v1 + 1) + (v2 + 1);
      addChatMessage('🎲', `Выпало ${v1 + 1} + ${v2 + 1} = ${total}`);
    }
  }, 80);
}

// Chat
function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  addChatMessage('Ты', text);
  input.value = '';
}

function addChatMessage(sender, text) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<span class="sender">${sender}:</span> ${text}`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

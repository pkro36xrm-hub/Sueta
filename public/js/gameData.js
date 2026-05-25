/* ============================================
   СУЕТАПОЛИЯ — Game Data
   All board tiles, cards, characters
   ============================================ */

const BOARD_TILES = [
  // BOTTOM ROW (right to left): index 0-10
  { id: 0, type: 'corner', name: 'СТАРТ', icon: '🟢', description: 'Получи зарплату' },
  { id: 1, type: 'property', name: 'Табачка', color: 'brown', price: 60, rent: [2,10,30,90,160,250], buildCost: 50, group: 'brown' },
  { id: 2, type: 'chest', name: 'Казна', icon: '🔵' },
  { id: 3, type: 'property', name: 'Разливайка', color: 'brown', price: 60, rent: [4,20,60,180,320,450], buildCost: 50, group: 'brown' },
  { id: 4, type: 'tax', name: 'Налоговая', icon: '🏛️', amount: 200 },
  { id: 5, type: 'railroad', name: 'Таксопарк', icon: '🚗', price: 200 },
  { id: 6, type: 'property', name: 'Шаурмячная', color: 'lightblue', price: 100, rent: [6,30,90,270,400,550], buildCost: 50, group: 'lightblue' },
  { id: 7, type: 'chance', name: 'Шанс', icon: '🟡' },
  { id: 8, type: 'property', name: 'Барбершоп', color: 'lightblue', price: 100, rent: [6,30,90,270,400,550], buildCost: 50, group: 'lightblue' },
  { id: 9, type: 'property', name: 'Комп-клуб', color: 'lightblue', price: 120, rent: [8,40,100,300,450,600], buildCost: 50, group: 'lightblue' },
  { id: 10, type: 'corner', name: 'Тюрьма', icon: '🚔', description: 'Просто в гостях' },

  // LEFT COLUMN (bottom to top): index 11-20
  { id: 11, type: 'property', name: 'Кальянная', color: 'pink', price: 140, rent: [10,50,150,450,625,750], buildCost: 100, group: 'pink' },
  { id: 12, type: 'utility', name: 'Электросети', icon: '⚡', price: 150 },
  { id: 13, type: 'property', name: 'Тату-салон', color: 'pink', price: 140, rent: [10,50,150,450,625,750], buildCost: 100, group: 'pink' },
  { id: 14, type: 'property', name: 'Караоке', color: 'pink', price: 160, rent: [12,60,180,500,700,900], buildCost: 100, group: 'pink' },
  { id: 15, type: 'railroad', name: 'Грузоперевозки', icon: '🚛', price: 200 },
  { id: 16, type: 'property', name: 'Бар', color: 'orange', price: 180, rent: [14,70,200,550,750,950], buildCost: 100, group: 'orange' },
  { id: 17, type: 'chest', name: 'Казна', icon: '🔵' },
  { id: 18, type: 'property', name: 'Лаунж-бар', color: 'orange', price: 180, rent: [14,70,200,550,750,950], buildCost: 100, group: 'orange' },
  { id: 19, type: 'property', name: 'Антикафе', color: 'orange', price: 200, rent: [16,80,220,600,800,1000], buildCost: 100, group: 'orange' },
  { id: 20, type: 'corner', name: 'Парковка', icon: '🅿️', description: 'Бесплатная стоянка' },

  // TOP ROW (left to right): index 21-30
  { id: 21, type: 'property', name: 'Ночной клуб', color: 'red', price: 220, rent: [18,90,250,700,875,1050], buildCost: 150, group: 'red' },
  { id: 22, type: 'chance', name: 'Шанс', icon: '🟡' },
  { id: 23, type: 'property', name: 'Букмекерская', color: 'red', price: 220, rent: [18,90,250,700,875,1050], buildCost: 150, group: 'red' },
  { id: 24, type: 'property', name: 'Боулинг', color: 'red', price: 240, rent: [20,100,300,750,925,1100], buildCost: 150, group: 'red' },
  { id: 25, type: 'railroad', name: 'Маршрутки', icon: '🚐', price: 200 },
  { id: 26, type: 'property', name: 'Алкомаркет', color: 'yellow', price: 260, rent: [22,110,330,800,975,1150], buildCost: 150, group: 'yellow' },
  { id: 27, type: 'property', name: 'Автосалон', color: 'yellow', price: 260, rent: [22,110,330,800,975,1150], buildCost: 150, group: 'yellow' },
  { id: 28, type: 'utility', name: 'Провайдер', icon: '🌐', price: 150 },
  { id: 29, type: 'property', name: 'ТЦ', color: 'yellow', price: 280, rent: [24,120,360,850,1025,1200], buildCost: 150, group: 'yellow' },
  { id: 30, type: 'corner', name: 'В ТЮРЬМУ', icon: '👮', description: 'Иди в тюрьму!' },

  // RIGHT COLUMN (top to bottom): index 31-39
  { id: 31, type: 'property', name: 'Фитнес-сеть', color: 'green', price: 300, rent: [26,130,390,900,1100,1275], buildCost: 200, group: 'green' },
  { id: 32, type: 'property', name: 'Ресторан', color: 'green', price: 300, rent: [26,130,390,900,1100,1275], buildCost: 200, group: 'green' },
  { id: 33, type: 'chest', name: 'Казна', icon: '🔵' },
  { id: 34, type: 'property', name: 'Отель', color: 'green', price: 320, rent: [28,150,450,1000,1200,1400], buildCost: 200, group: 'green' },
  { id: 35, type: 'railroad', name: 'Сеть автомоек', icon: '🧽', price: 200 },
  { id: 36, type: 'casino_slots', name: 'Слоты', icon: '🎰', description: 'Крутани слоты!' },
  { id: 37, type: 'property', name: 'Нефтянка', color: 'darkblue', price: 350, rent: [35,175,500,1100,1300,1500], buildCost: 200, group: 'darkblue' },
  { id: 38, type: 'casino_wheel', name: 'Колесо', icon: '🎡', description: 'Крутани колесо!' },
  { id: 39, type: 'property', name: 'Криптобиржа', color: 'darkblue', price: 400, rent: [50,200,600,1400,1700,2000], buildCost: 200, group: 'darkblue' },
];

// Chance cards
const CHANCE_CARDS = [
  { text: 'Иди на СТАРТ. Получи $200', action: 'move', target: 0, collect: 200 },
  { text: 'Иди в ТЮРЬМУ', action: 'jail' },
  { text: 'Ремонт: $25 за дом, $100 за отель', action: 'repair', house: 25, hotel: 100 },
  { text: 'Назад на 3 клетки', action: 'back', steps: 3 },
  { text: 'Выиграл спор! Получи $150', action: 'collect', amount: 150 },
  { text: 'Заплати каждому по $50', action: 'payAll', amount: 50 },
  { text: 'Бесплатный выход из тюрьмы', action: 'jailFree' },
  { text: 'Иди на ближайший транспорт, плати x2', action: 'nearestRailroad' },
  { text: 'Получи $100 — дивиденды', action: 'collect', amount: 100 },
  { text: 'Штраф за превышение — $15', action: 'pay', amount: 15 },
];

const CHEST_CARDS = [
  { text: 'Возврат налогов! Получи $200', action: 'collect', amount: 200 },
  { text: 'Штраф $100', action: 'pay', amount: 100 },
  { text: 'День рождения! $50 от каждого', action: 'collectAll', amount: 50 },
  { text: 'Продал акции — $100', action: 'collect', amount: 100 },
  { text: 'Визит к врачу — $150', action: 'pay', amount: 150 },
  { text: 'Нашёл на улице $25', action: 'collect', amount: 25 },
  { text: 'Ремонт: $40 за дом, $115 за отель', action: 'repair', house: 40, hotel: 115 },
  { text: 'Бесплатный выход из тюрьмы', action: 'jailFree' },
  { text: 'Иди на СТАРТ', action: 'move', target: 0, collect: 200 },
  { text: 'Наследство — $100', action: 'collect', amount: 100 },
];

// Characters
const CHARACTERS = [
  { id: 'raider', name: 'Рейдер', icon: '🦈', ability: 'Захват', description: '1 раз за игру забирает любую чужую улицу с домами/отелями. Монополия делится.', usesPerGame: 1 },
  { id: 'roof', name: 'Крышеватель', icon: '🕵️', ability: 'Доля', description: 'Ставит крышу на 1 чужую улицу навсегда. Получает 50% ренты.', usesPerGame: 1 },
  { id: 'lucky', name: 'Везунчик', icon: '🎲', ability: 'Перебросить', description: 'Перебрасывает кубики. Обязан принять 2-й бросок.', usesPerGame: 3 },
  { id: 'banker', name: 'Банкир', icon: '🏦', ability: 'Проценты', description: '+30% при проходе Старта, +10% к получаемой ренте.', usesPerGame: -1 },
  { id: 'arsonist', name: 'Поджигатель', icon: '🔥', ability: 'Пожар', description: 'Сжигает 1 дом на чужой улице. Перерыв 3 хода.', usesPerGame: 2 },
  { id: 'armor', name: 'Бронежилет', icon: '🛡️', ability: 'Пас', description: 'Не платит ренту на чужой улице/ЖД/коммуналке.', usesPerGame: 3 },
  { id: 'trader', name: 'Торгаш', icon: '🤝', ability: 'Скидка', description: 'Покупает недвижимость у банка со скидкой 20%.', usesPerGame: -1 },
  { id: 'oligarch', name: 'Олигарх', icon: '💰', ability: 'Большой старт', description: 'Начинает с +50% капитала.', usesPerGame: -1 },
  { id: 'builder', name: 'Застройщик', icon: '🏗️', ability: 'Дешёвая стройка', description: 'Строит дома/отели за 70% стоимости.', usesPerGame: -1 },
  { id: 'collector', name: 'Коллектор', icon: '🧲', ability: 'Штраф', description: 'Забирает 25% денег у любого игрока.', usesPerGame: 2 },
  { id: 'cashier', name: 'Кассирша', icon: '💋', ability: 'Сбор', description: 'Получает 100% налогов вместо банка.', usesPerGame: -1 },
  { id: 'boss', name: 'Авторитет', icon: '👑', ability: 'Закон не писан', description: 'Бесплатно из тюрьмы. Получает деньги от выкупов.', usesPerGame: -1 },
];

// Slots symbols and payouts
const SLOTS_CONFIG = {
  symbols: ['🍒', '💎', '👑', '🌟', '7️⃣', '🍋'],
  payouts: {
    'none': 0,       // 55%
    'two': 1,        // 25% - return bet
    'cherry': 3,     // 10%
    'diamond': 5,    // 6%
    'crown': 8,      // 3%
    'star': 20,      // 1% - MEGA JACKPOT
  }
};

// Wheel of Fortune sectors
const WHEEL_CONFIG = [
  { label: '💀 0x', multiplier: 0, chance: 40, color: '#e74c3c' },
  { label: '🔄 1x', multiplier: 1, chance: 20, color: '#95a5a6' },
  { label: '💵 2x', multiplier: 2, chance: 18, color: '#2ecc71' },
  { label: '💰 3x', multiplier: 3, chance: 12, color: '#3498db' },
  { label: '🔥 5x', multiplier: 5, chance: 7, color: '#9b59b6' },
  { label: '🏆 10x', multiplier: 10, chance: 3, color: '#f1c40f' },
];

// Player colors/tokens
const PLAYER_TOKENS = ['🔴','🔵','🟢','🟡','🟣','🟠','⚪','🟤'];

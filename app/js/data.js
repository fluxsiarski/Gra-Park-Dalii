// data.js — katalog ubrań, sprite'y Dalii, reguły odblokowań

export const DALIA = {
  sit: 'assets/img/dalia/sit-front.png',
  happy: 'assets/img/dalia/sit-happy.png',
  bow: 'assets/img/dalia/bow.png',
  bowLow: 'assets/img/dalia/bow-low.png',
  sleep: 'assets/img/dalia/sleep-curl.png',
  run: 'assets/img/dalia/run3.png',
  jump: 'assets/img/dalia/jump.png',
  topDown: 'assets/img/dalia/top-down.png',
  alert: 'assets/img/dalia/alert.png',
};

// Memory — wszystkie zdjęcia priorytetowe; Move-set Dalii zostaje wyłącznie rezerwą
export const MEMORY_FOOD = [
  { id: 'chipsy',       src: 'assets/img/memory/food/chipsy-fromage.webp', tier: 'food' },
  { id: 'przetwory',    src: 'assets/img/memory/food/malinowe-przetwory.webp', tier: 'food' },
  { id: 'mcflurry',     src: 'assets/img/memory/food/mcflurry.png', tier: 'food' },
  { id: 'chalwa',       src: 'assets/img/memory/food/chalwa.jpg', tier: 'food' },
  { id: 'yerbata',      src: 'assets/img/memory/food/yerbata-card.jpg', tier: 'food' },
];

export const MEMORY_1670 = [
  { id: 'foto-5821', src: 'assets/img/memory/photos-1670/img-5821-card.jpg', tier: 'photo' },
  { id: 'foto-5841', src: 'assets/img/memory/photos-1670/img-5841-card.jpg', tier: 'photo' },
];

export const MEMORY_FEATURED = [
  { id: 'volkswagen', src: 'assets/img/memory/featured/volkswagen.jpeg', tier: 'featured' },
  { id: 'karuzela', src: 'assets/img/memory/featured/karuzela.jpg', tier: 'featured' },
  { id: 'dalia-mokra', src: 'assets/img/memory/featured/dalia-mokra.jpg', tier: 'featured' },
];

export const MEMORY_PAIRS = 10;
export const MEMORY_REWARD_PER_PAIR = 5;
export const MEMORY_BONUS_MOVES = 24;
export const MEMORY_BONUS = 15;

// Bonus smaczków za zapisanie looka
export const LOOK_BONUS = 15;

// Kategorie ubrań
export const CATS = [
  { id: 'bottom', label: 'Spodnie' },
  { id: 'top', label: 'Góra' },
  { id: 'hat', label: 'Czapki' },
  { id: 'glasses', label: 'Okulary' },
  { id: 'acc', label: 'Dodatki' },
];

// unlockAt = lifetime smaczków potrzebne do odblokowania
// svg = id symbolu z js/svg.js (później podmienisz na img: 'assets/img/clothes/x.png')
export const ITEMS = [
  // — Spodnie —
  { id: 'b-flare-blue',  cat: 'bottom', name: 'Dzwony jeans',   unlockAt: 0,   svg: 'i-flare' },
  { id: 'b-cream-pants', cat: 'bottom', name: 'Kremowe rurki',  unlockAt: 0,   svg: 'i-pants' },
  { id: 'b-plaid',       cat: 'bottom', name: 'Krata retro',    unlockAt: 12,  svg: 'i-plaid-pants' },
  { id: 'b-corduroy',    cat: 'bottom', name: 'Welur brąz',     unlockAt: 28,  svg: 'i-corduroy' },
  { id: 'b-skirt',       cat: 'bottom', name: 'Spódnica A',     unlockAt: 48,  svg: 'i-skirt' },
  { id: 'b-overall',     cat: 'bottom', name: 'Ogrodniczki',    unlockAt: 75,  svg: 'i-overall' },

  // — Góra —
  { id: 't-blouse-w',    cat: 'top', name: 'Bluzka kokardka', unlockAt: 0,   svg: 'i-blouse' },
  { id: 't-turtle',      cat: 'top', name: 'Golf musztarda',  unlockAt: 0,   svg: 'i-turtleneck' },
  { id: 't-stripe',      cat: 'top', name: 'Marynarka paski', unlockAt: 16,  svg: 'i-stripe-top' },
  { id: 't-cardigan',    cat: 'top', name: 'Cardigan róż',    unlockAt: 34,  svg: 'i-cardigan' },
  { id: 't-dress-vtg',   cat: 'top', name: 'Sukienka vintage',unlockAt: 58,  svg: 'i-dress' },
  { id: 't-jacket',      cat: 'top', name: 'Jeansowa kurtka', unlockAt: 88,  svg: 'i-jacket' },

  // — Czapki —
  { id: 'h-beret',   cat: 'hat', name: 'Beret',        unlockAt: 8,   svg: 'i-beret' },
  { id: 'h-bucket',  cat: 'hat', name: 'Bucket hat',   unlockAt: 24,  svg: 'i-bucket' },
  { id: 'b-bakerboy',cat: 'hat', name: 'Kaszkiet',     unlockAt: 44,  svg: 'i-bakerboy' },
  { id: 'h-sun',     cat: 'hat', name: 'Kapelusz',     unlockAt: 70,  svg: 'i-sunhat' },

  // — Okulary —
  { id: 'g-cateye',  cat: 'glasses', name: 'Cat-eye',    unlockAt: 6,   svg: 'i-cateye' },
  { id: 'g-round',   cat: 'glasses', name: 'Okrągłe',    unlockAt: 20,  svg: 'i-round-glasses' },
  { id: 'g-sun',     cat: 'glasses', name: 'Przeciwsłoneczne', unlockAt: 40, svg: 'i-sunglasses' },
  { id: 'g-heart',   cat: 'glasses', name: 'Serduszka',  unlockAt: 64,  svg: 'i-heart-glasses' },

  // — Dodatki —
  { id: 'a-scarf-o', cat: 'acc', name: 'Chusta nektaryna', unlockAt: 10,  svg: 'i-neckerchief' },
  { id: 'a-bag',     cat: 'acc', name: 'Torebka retro',    unlockAt: 30,  svg: 'i-bag' },
  { id: 'a-socks',   cat: 'acc', name: 'Skarpetki lacze',  unlockAt: 52,  svg: 'i-socks' },
  { id: 'a-pearl',   cat: 'acc', name: 'Perły',            unlockAt: 80,  svg: 'i-pearls' },
];

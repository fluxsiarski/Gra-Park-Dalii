// memory.js — Memory: produkty, fotografie 1670 i zdjęcia wyróżnione
import { store } from './store.js';
import {
  MEMORY_FOOD, MEMORY_1670, MEMORY_FEATURED, MEMORY_PAIRS,
  MEMORY_REWARD_PER_PAIR, MEMORY_BONUS_MOVES, MEMORY_BONUS,
} from './data.js';

const $ = (s) => document.querySelector(s);

let first = null, lock = false, moves = 0, matched = 0;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildMemoryDeck() {
  const faces = [...MEMORY_FOOD, ...MEMORY_1670, ...MEMORY_FEATURED];
  if (faces.length !== MEMORY_PAIRS) {
    console.warn(`Memory deck: oczekiwano ${MEMORY_PAIRS} par, jest ${faces.length}`);
  }
  return shuffle(faces.flatMap((item) => [item, item]));
}

function imgHtml(item) {
  return `
    <span class="mem-photo-bg" aria-hidden="true" style="background-image:url('${item.src}')"></span>
    <img class="mem-img mem-img-${item.tier}" src="${item.src}" alt="" loading="eager">`;
}

function newGame() {
  first = null;
  lock = false;
  moves = 0;
  matched = 0;
  $('#mem-moves').textContent = '0';
  $('#mem-over').classList.add('hidden');

  const deck = buildMemoryDeck();
  const grid = $('#mem-grid');
  grid.innerHTML = '';

  deck.forEach((item) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mem-card';
    card.dataset.id = item.id;
    card.dataset.tier = item.tier;
    card.innerHTML = `
      <div class="mem-inner">
        <div class="mem-face mem-back"><span class="mem-back-paw" aria-hidden="true"></span></div>
        <div class="mem-face mem-front">${imgHtml(item)}</div>
      </div>`;
    card.addEventListener('click', () => flip(card));
    grid.appendChild(card);
  });
}

function celebrate(card) {
  card.classList.add('matched', 'match-celebrate');
  setTimeout(() => card.classList.remove('match-celebrate'), 700);
}

function flip(card) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');

  if (!first) {
    first = card;
    return;
  }

  lock = true;
  moves++;
  $('#mem-moves').textContent = moves;
  const second = card;
  const same = first.dataset.id === second.dataset.id;

  if (same) {
    celebrate(first);
    celebrate(second);
    first = null;
    matched++;
    lock = false;
    if (matched === MEMORY_PAIRS) finish();
  } else {
    const f = first;
    first = null;
    f.classList.add('mem-wrong');
    second.classList.add('mem-wrong');
    setTimeout(() => {
      f.classList.remove('flipped', 'mem-wrong');
      second.classList.remove('flipped', 'mem-wrong');
      lock = false;
    }, 850);
  }
}

function finish() {
  const gain = MEMORY_PAIRS * MEMORY_REWARD_PER_PAIR + (moves <= MEMORY_BONUS_MOVES ? MEMORY_BONUS : 0);
  store.addTreats(gain);
  store.setMemoryMoves(moves);
  $('#mem-final').textContent = moves;
  $('#mem-gain').textContent = gain;
  const best = store.s.best.memoryMoves;
  $('#memory-best').textContent = best != null ? `Rekord: ${best}` : '—';
  setTimeout(() => $('#mem-over').classList.remove('hidden'), 700);
}

function refreshBest() {
  const best = store.s.best.memoryMoves;
  $('#memory-best').textContent = best != null ? `Rekord: ${best}` : '—';
}

export function initMemory({ onScreen }) {
  $('#btn-mem-again').addEventListener('click', newGame);

  onScreen('screen-memory', {
    onEnter() {
      newGame();
      refreshBest();
    },
  });
}

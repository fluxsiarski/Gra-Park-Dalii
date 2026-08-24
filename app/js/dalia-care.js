// dalia-care.js — Domek Dalii (prototyp w stylu Pou).
// Jeden ekran routera (#screen-dalia-care) z czterema pokojami przełączanymi
// wewnętrznie. Całkowicie odseparowany od istniejących gier: własny stan
// (dalia-care-store), współdzielone smaczki (store.spendTreats), własne CSS.

import { careStore } from './dalia-care-store.js';
import { store } from './store.js';
import { createDaliaRig } from './dalia-rig.js';

const $ = (s, r = document) => r.querySelector(s);

// Przedmioty jedzenia: koszt w smaczkach + ile sytości dają.
const FOODS = [
  { id: 'chalwa', name: 'Chałwa', cost: 3, satiety: 14, img: 'assets/img/memory/food/chalwa.jpg' },
  { id: 'chipsy', name: 'Chipsy', cost: 4, satiety: 20, img: 'assets/img/memory/food/chipsy-fromage.webp' },
  { id: 'maliny', name: 'Maliny', cost: 5, satiety: 26, img: 'assets/img/memory/food/malinowe-przetwory.webp' },
  { id: 'mcflurry', name: 'McFlurry', cost: 6, satiety: 30, img: 'assets/img/memory/food/mcflurry.png' },
];

const clamp = (v) => Math.max(0, Math.min(100, v));
const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initDaliaCare({ toast, onScreen, go }) {
  const screen = $('#screen-dalia-care');
  if (!screen) return;

  const room = $('#care-room');
  const bg = $('#care-room-bg');
  const veil = $('#care-night-veil');
  const stage = $('#care-stage');
  const fx = $('#care-fx');
  const dirt = $('#care-dirt');
  const rig = createDaliaRig('#care-rig');
  const dalia = rig.el; // element klikalny (kontener rigu)
  const zzz = $('#care-zzz');
  const bubble = $('#care-bubble');
  const tools = $('#care-tools');
  const nav = $('#care-nav');
  const roomName = $('#care-room-name');

  const bars = {
    satiety: $('#bar-satiety'),
    cleanliness: $('#bar-cleanliness'),
    happiness: $('#bar-happiness'),
    energy: $('#bar-energy'),
  };

  let uiTimer = null;
  let reactTimer = null;
  let bubbleTimer = null;
  let currentRoom = 'living';

  const ROOM_LABELS = {
    living: 'Salon',
    kitchen: 'Kuchnia',
    bath: 'Łazienka',
    bedroom: 'Sypialnia',
  };

  /* ---------- pomocnicze: rig + reakcje ---------- */

  // Stan spoczynkowy rigu dobierany po potrzebach: sleep / sad / idle.
  function restBaseState() {
    const s = careStore.s;
    if (s.asleep || s.energy < 20) return 'sleep';
    const low = Math.min(s.satiety, s.cleanliness, s.happiness);
    if (low < 28) return 'sad';
    return 'idle';
  }

  // Ustawia rig w stan spoczynku odpowiadający potrzebom.
  function restIdle() {
    rig.setBase(restBaseState());
    rig.setHappiness(careStore.s.happiness / 100);
  }

  // Krótka reakcja rigu. kind: 'happy' | 'eat' | 'bow' | 'shake' | 'sad'
  function react(kind, ms = 1100) {
    clearTimeout(reactTimer);
    if (kind === 'sad') {
      // smutek to stan bazowy, nie impuls — pokaż na chwilę mocniej
      rig.setBase('sad');
    } else {
      rig.react(kind, ms);
    }
    reactTimer = setTimeout(restIdle, ms);
  }

  function bubbleSay(text) {
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 1800);
  }

  /* ---------- paski potrzeb ---------- */

  function renderBars() {
    const s = careStore.s;
    ['satiety', 'cleanliness', 'happiness', 'energy'].forEach((k) => {
      const v = clamp(s[k]);
      bars[k].style.width = v + '%';
      const parent = bars[k].parentElement.parentElement;
      parent.classList.toggle('is-low', v < 30);
    });
  }

  function renderTreats() {
    const el = $('#treats-care');
    if (el) el.textContent = store.s.treats;
  }

  function renderDirt() {
    const c = careStore.s.cleanliness;
    // Im mniejsza czystość, tym mocniej widać plamki brudu.
    const amount = clamp(100 - c) / 100;
    dirt.style.opacity = amount.toFixed(2);
    dirt.classList.toggle('hidden', currentRoom !== 'bath' && amount < 0.15);
  }

  function fullRender() {
    careStore.refresh();
    renderBars();
    renderTreats();
    renderDirt();
    updateSleepVisual();
    restIdle();
  }

  /* ---------- pokoje ---------- */

  function switchRoom(next) {
    if (!ROOM_LABELS[next]) return;
    currentRoom = next;
    careStore.setRoom(next);
    room.dataset.room = next;
    roomName.textContent = ROOM_LABELS[next];

    nav.querySelectorAll('.care-nav-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.room === next);
    });

    buildTools(next);
    renderDirt();
    updateSleepVisual();
    restIdle();
  }

  function buildTools(r) {
    tools.innerHTML = '';
    if (r === 'living') buildLiving();
    else if (r === 'kitchen') buildKitchen();
    else if (r === 'bath') buildBath();
    else if (r === 'bedroom') buildBedroom();
  }

  /* --- Salon --- */
  function buildLiving() {
    const row = document.createElement('div');
    row.className = 'care-actions';
    row.innerHTML = `
      <button class="care-action" data-act="pet" type="button">
        <span>✋</span><small>Pogłaszcz</small>
      </button>
      <button class="care-action" data-act="play" type="button">
        <span>🎾</span><small>Pobaw się</small>
      </button>
      <button class="care-action" data-act="games" type="button">
        <span>🎮</span><small>Salon Gier</small>
      </button>
      <button class="care-action" data-act="park" type="button">
        <span>🌳</span><small>Park Dalii</small>
      </button>`;
    tools.appendChild(row);

    row.querySelector('[data-act="pet"]').addEventListener('click', () => {
      careStore.bump('happiness', 6);
      react('shake', 900);
      bubbleSay('❤️');
      afterAction();
    });
    row.querySelector('[data-act="play"]').addEventListener('click', () => {
      if (careStore.s.energy < 8) { bubbleSay('za zmęczona…'); react('sad', 900); return; }
      careStore.bump('happiness', 12);
      careStore.bump('energy', -6);
      react('bow', 1000);
      bubbleSay('hau hau!');
      afterAction();
    });
    row.querySelector('[data-act="games"]').addEventListener('click', () => go('screen-salon'));
    row.querySelector('[data-act="park"]').addEventListener('click', () => go('screen-hub'));
  }

  /* --- Kuchnia --- */
  function buildKitchen() {
    const shelf = document.createElement('div');
    shelf.className = 'care-shelf';
    shelf.innerHTML = FOODS.map((f) => `
      <button class="care-food" data-food="${f.id}" type="button"
        aria-label="Nakarm: ${f.name}, koszt ${f.cost} smaczków">
        <img src="${f.img}" alt="" draggable="false">
        <strong>${f.name}</strong>
        <span class="care-food-cost"><svg viewBox="0 0 100 60"><use href="#i-treat"/></svg>${f.cost}</span>
      </button>`).join('');
    tools.appendChild(shelf);

    shelf.querySelectorAll('.care-food').forEach((btn) => {
      const food = FOODS.find((f) => f.id === btn.dataset.food);
      enableFeedDrag(btn, food);
      btn.addEventListener('click', () => feed(food, btn));
    });
  }

  function feed(food, btn) {
    if (careStore.s.satiety >= 99) { bubbleSay('najedzona!'); react('happy', 800); return; }
    if (!store.spendTreats(food.cost)) {
      bubbleSay('brak smaczków');
      if (toast) toast('Za mało smaczków na ' + food.name);
      return;
    }
    careStore.bump('satiety', food.satiety);
    careStore.bump('happiness', 3);
    react('eat', 1200);
    spawnCrumbs();
    bubbleSay('mniam!');
    afterAction();
  }

  // Prosty drag przedmiotu do Dalii (touch + mysz). Upuszczenie na stage = feed.
  function enableFeedDrag(btn, food) {
    let ghost = null;
    let active = false;

    const start = (x, y, e) => {
      active = true;
      ghost = btn.querySelector('img').cloneNode(true);
      ghost.className = 'care-drag-ghost';
      document.body.appendChild(ghost);
      moveGhost(x, y);
      if (e.cancelable) e.preventDefault();
    };
    const moveGhost = (x, y) => {
      if (!ghost) return;
      ghost.style.left = x + 'px';
      ghost.style.top = y + 'px';
    };
    const end = (x, y) => {
      if (!active) return;
      active = false;
      if (ghost) { ghost.remove(); ghost = null; }
      const r = stage.getBoundingClientRect();
      const dr = dalia.getBoundingClientRect();
      const overDalia = x >= dr.left - 30 && x <= dr.right + 30 && y >= dr.top - 30 && y <= dr.bottom + 30;
      const overStage = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      if (overDalia || overStage) feed(food, btn);
    };

    btn.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      start(t.clientX, t.clientY, e);
    }, { passive: false });
    btn.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      moveGhost(t.clientX, t.clientY);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      end(t.clientX, t.clientY);
    });

    // Mysz: drag opcjonalny — klik i tak karmi (obsłużony osobno).
    btn.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      start(e.clientX, e.clientY, e);
      const onMove = (ev) => moveGhost(ev.clientX, ev.clientY);
      const onUp = (ev) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        // klik obsłuży feed, więc tu tylko sprzątamy ghost bez podwójnego karmienia
        active = false;
        if (ghost) { ghost.remove(); ghost = null; }
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }

  function spawnCrumbs() {
    if (prefersReduced()) return;
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('span');
      c.className = 'care-crumb';
      c.style.left = (45 + Math.random() * 10) + '%';
      c.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      c.style.animationDelay = (Math.random() * 0.15) + 's';
      fx.appendChild(c);
      setTimeout(() => c.remove(), 900);
    }
  }

  /* --- Łazienka --- */
  function buildBath() {
    const row = document.createElement('div');
    row.className = 'care-actions';
    row.innerHTML = `
      <button class="care-action" data-act="soap" type="button">
        <span>🧼</span><small>Namydl</small>
      </button>
      <button class="care-action care-action-wide" data-act="rinse" type="button">
        <span>🚿</span><small>Spłucz</small>
      </button>`;
    tools.appendChild(row);

    // Głaskanie mydłem: przeciąganie po Dalii tworzy pianę i czyści.
    enableScrub();

    row.querySelector('[data-act="soap"]').addEventListener('click', () => {
      spawnFoam(6);
      careStore.bump('cleanliness', 10);
      react('shake', 800);
      renderDirt();
      afterAction();
    });
    row.querySelector('[data-act="rinse"]').addEventListener('click', () => {
      rinse();
    });
  }

  let scrubBound = false;
  function enableScrub() {
    if (scrubBound) return;
    scrubBound = true;
    let scrubbing = false;
    let acc = 0;
    const onMove = (x, y) => {
      if (currentRoom !== 'bath') return;
      const dr = dalia.getBoundingClientRect();
      const over = x >= dr.left && x <= dr.right && y >= dr.top && y <= dr.bottom;
      if (!over) return;
      acc += 1;
      if (acc % 3 === 0) {
        spawnFoamAt(x, y);
        careStore.bump('cleanliness', 2);
        renderDirt();
        renderBars();
      }
    };
    stage.addEventListener('pointerdown', (e) => { scrubbing = true; onMove(e.clientX, e.clientY); });
    stage.addEventListener('pointermove', (e) => { if (scrubbing) onMove(e.clientX, e.clientY); });
    window.addEventListener('pointerup', () => { if (scrubbing) { scrubbing = false; afterAction(); } });
    stage.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
      if (currentRoom === 'bath' && e.cancelable) e.preventDefault();
    }, { passive: false });
  }

  function rinse() {
    careStore.bump('cleanliness', 24);
    fx.querySelectorAll('.care-foam').forEach((f) => f.remove());
    spawnDrops();
    react('shake', 1000);
    bubbleSay('czysta! ✨');
    renderDirt();
    afterAction();
  }

  function spawnFoam(n) {
    const r = stage.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      spawnFoamAt(r.left + r.width * (0.4 + Math.random() * 0.2), r.top + r.height * (0.4 + Math.random() * 0.25));
    }
  }
  function spawnFoamAt(x, y) {
    const r = stage.getBoundingClientRect();
    const b = document.createElement('span');
    b.className = 'care-foam';
    b.style.left = (x - r.left) + 'px';
    b.style.top = (y - r.top) + 'px';
    b.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
    fx.appendChild(b);
    setTimeout(() => b.remove(), 2600);
  }
  function spawnDrops() {
    if (prefersReduced()) return;
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('span');
      d.className = 'care-drop';
      d.style.left = (30 + Math.random() * 40) + '%';
      d.style.animationDelay = (Math.random() * 0.4) + 's';
      fx.appendChild(d);
      setTimeout(() => d.remove(), 1100);
    }
  }

  /* --- Sypialnia --- */
  function buildBedroom() {
    const row = document.createElement('div');
    row.className = 'care-actions';
    row.innerHTML = `
      <button class="care-action care-action-wide" data-act="light" type="button">
        <span id="care-light-ico">💡</span><small id="care-light-lbl">Zgaś światło</small>
      </button>`;
    tools.appendChild(row);
    syncLightBtn();
    row.querySelector('[data-act="light"]').addEventListener('click', toggleSleep);
  }

  function syncLightBtn() {
    const ico = $('#care-light-ico');
    const lbl = $('#care-light-lbl');
    if (!ico || !lbl) return;
    if (careStore.s.asleep) { ico.textContent = '🌙'; lbl.textContent = 'Obudź (zapal)'; }
    else { ico.textContent = '💡'; lbl.textContent = 'Zgaś światło'; }
  }

  function toggleSleep() {
    const goingToSleep = !careStore.s.asleep;
    careStore.setAsleep(goingToSleep);
    if (goingToSleep) {
      bubbleSay('dobranoc… 🌙');
    } else {
      // Przedwczesne wybudzenie pogarsza nastrój (jak w Pou).
      if (careStore.s.energy < 90) careStore.bump('happiness', -6);
      bubbleSay('ziew…');
    }
    updateSleepVisual();
    syncLightBtn();
    fullRender();
  }

  function updateSleepVisual() {
    const sleeping = careStore.s.asleep;
    room.classList.toggle('is-night', sleeping && currentRoom === 'bedroom');
    veil.classList.toggle('show', sleeping && currentRoom === 'bedroom');
    zzz.classList.toggle('show', sleeping);
    if (sleeping) rig.setBase('sleep');
  }

  /* ---------- wspólne po akcji ---------- */
  function afterAction() {
    renderBars();
    renderTreats();
    renderDirt();
  }

  // Tap na Dalię w salonie = reakcja radości.
  dalia.addEventListener('click', () => {
    if (currentRoom === 'bath') return; // w łazience obsługuje scrub
    if (careStore.s.asleep) { bubbleSay('śpi… 💤'); return; }
    careStore.bump('happiness', 3);
    rig.poke();
    react('happy', 800);
    bubbleSay('❤️');
    afterAction();
  });

  /* ---------- pętla rigu (oddech, mruganie, kołysanie w środku) ---------- */
  function startIdle() {
    rig.start();
    restIdle();
  }
  function stopIdle() {
    rig.stop();
  }

  /* ---------- nawigacja pokojami ---------- */
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.care-nav-btn');
    if (!btn) return;
    switchRoom(btn.dataset.room);
  });

  /* ---------- lifecycle ---------- */
  onScreen('screen-dalia-care', {
    onEnter() {
      fullRender();
      switchRoom(careStore.s.room || 'living');
      startIdle();
      clearInterval(uiTimer);
      // Delikatny, ciągły decay gdy ekran otwarty (co 20 s).
      uiTimer = setInterval(() => {
        careStore.refresh();
        renderBars();
        renderDirt();
        if (!careStore.s.asleep && currentRoom !== 'bath') restIdle();
      }, 20000);
    },
    onLeave() {
      stopIdle();
      clearInterval(uiTimer);
      clearTimeout(reactTimer);
      clearTimeout(bubbleTimer);
      careStore.refresh(); // zapisuje lastUpdated
    },
  });

  // Odświeżanie chipu smaczków, gdy zmienią się gdziekolwiek.
  document.addEventListener('treats', renderTreats);
}

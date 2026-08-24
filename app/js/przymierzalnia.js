// przymierzalnia.js — lookboard stylistki: komponuj looki vintage
import { store } from './store.js';
import { ITEMS, CATS, LOOK_BONUS } from './data.js';
import { svgUse } from './svg.js';

const $ = (s) => document.querySelector(s);

// pozycje slotów w % (spójne z CSS)
const SLOT_POS = {
  hat:     { top: '13%', left: '50%', w: 46 },
  glasses: { top: '30%', left: '50%', w: 44 },
  top:     { top: '50%', left: '50%', w: 56 },
  bottom:  { top: '76%', left: '50%', w: 54 },
  acc:     { top: '62%', left: '82%', w: 34 },
};

let activeCat = 'bottom';
const board = { bottom: null, top: null, hat: null, glasses: null, acc: null };
let toastApi = () => {};
const toast = (m) => toastApi(m);

/* Grafika itemu: używa opcjonalnego item.img, a bez niego gotowego SVG.
   Dzięki temu brak nieobowiązkowych PNG nie generuje serii błędów 404. */
function itemArt(item) {
  if (!item.img) {
    const u = svgUse(item.svg);
    u.style.width = '100%';
    if (item.cat === 'glasses') u.setAttribute('viewBox', '0 0 120 70');
    else if (item.cat === 'acc') u.setAttribute('viewBox', '0 0 100 80');
    return u;
  }

  const img = document.createElement('img');
  img.alt = item.name;
  img.src = item.img;
  img.onerror = () => {
    const u = svgUse(item.svg);
    u.style.width = '100%';
    if (item.cat === 'glasses') u.setAttribute('viewBox', '0 0 120 70');
    else if (item.cat === 'acc') u.setAttribute('viewBox', '0 0 100 80');
    img.replaceWith(u);
  };
  return img;
}

function isUnlocked(item) { return store.s.totalEarned >= item.unlockAt; }

function renderTabs() {
  const tabs = $('#przy-tabs');
  tabs.innerHTML = '';
  for (const c of CATS) {
    const b = document.createElement('button');
    b.className = 'tab' + (c.id === activeCat ? ' active' : '');
    b.textContent = c.label;
    b.addEventListener('click', () => { activeCat = c.id; renderTabs(); renderItems(); });
    tabs.appendChild(b);
  }
}

function renderItems() {
  const strip = $('#items-strip');
  strip.innerHTML = '';
  for (const item of ITEMS.filter(i => i.cat === activeCat)) {
    const card = document.createElement('button');
    card.className = 'item-card';
    if (board[activeCat]?.id === item.id) card.classList.add('selected');

    const art = document.createElement('div');
    art.className = 'item-art';
    art.appendChild(itemArt(item));
    card.appendChild(art);

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;
    card.appendChild(name);

    if (!isUnlocked(item)) {
      card.classList.add('locked');
      const lock = svgUse('i-lock', 'item-lock');
      lock.setAttribute('viewBox', '0 0 100 110');
      card.appendChild(lock);
      name.textContent = `odblokuj za ${item.unlockAt} smaczków`;
      card.addEventListener('click', () => {
        card.classList.remove('shake'); void card.offsetWidth;
        card.classList.add('shake');
        toast(`Zbierz razem ${item.unlockAt} smaczków, aby odblokować!`);
      });
    } else {
      card.addEventListener('click', () => toggleEquip(item));
    }
    strip.appendChild(card);
  }
}

function toggleEquip(item) {
  board[item.cat] = board[item.cat]?.id === item.id ? null : item;
  renderBoard();
  renderItems();
}

function renderBoard() {
  for (const slot of Object.keys(SLOT_POS)) {
    const el = document.querySelector(`.slot-${slot}`);
    el.innerHTML = '';
    const item = board[slot];
    if (!item) continue;
    const holder = document.createElement('div');
    holder.style.width = '100%';
    holder.appendChild(itemArt(item));
    el.appendChild(holder);
  }
  $('#btn-save-look').disabled = !(board.bottom && board.top);
}

function saveLook() {
  if (!(board.bottom && board.top)) return;
  const items = {};
  for (const k of Object.keys(board)) if (board[k]) items[k] = board[k].id;
  store.saveLook(null, items);
  toast(`Look zapisany! +${LOOK_BONUS} smaczków`);
}

/* ---------- galeria ---------- */
function renderGallery() {
  const list = $('#gallery-list');
  list.innerHTML = '';
  const looks = store.s.looks;
  if (!looks.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--ink-soft);font-weight:600;padding:20px">Jeszcze pusto. Zapisz pierwszy look!</p>';
    return;
  }
  for (const look of [...looks].reverse()) {
    const row = document.createElement('div');
    row.className = 'look-row';
    const mini = document.createElement('div');
    mini.className = 'look-mini';
    for (const cat of Object.keys(SLOT_POS)) {
      const id = look.items[cat];
      if (!id) continue;
      const item = ITEMS.find(i => i.id === id);
      if (!item) continue;
      const u = svgUse(item.svg);
      const p = SLOT_POS[cat];
      u.style.cssText = `top:${p.top};left:${p.left};width:${p.w}%;`;
      u.setAttribute('viewBox', cat === 'glasses' ? '0 0 120 70' : cat === 'acc' ? '0 0 100 80' : '0 0 100 120');
      mini.appendChild(u);
    }
    row.appendChild(mini);
    const info = document.createElement('div');
    info.className = 'look-info';
    info.innerHTML = `<div class="look-name">${escapeHtml(look.name)}</div>
      <div class="look-date">${new Date(look.ts).toLocaleDateString('pl-PL')}</div>`;
    row.appendChild(info);
    const del = document.createElement('button');
    del.className = 'look-del';
    del.textContent = 'Usun';
    del.addEventListener('click', () => { store.deleteLook(look.id); renderGallery(); });
    row.appendChild(del);
    list.appendChild(row);
  }
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

export function initPrzy(ctxApi) {
  toastApi = ctxApi.toast;

  renderTabs(); renderItems(); renderBoard();

  $('#btn-save-look').addEventListener('click', saveLook);
  $('#btn-gallery').addEventListener('click', () => { renderGallery(); showGallery(true); });
  $('#btn-gallery-close').addEventListener('click', () => showGallery(false));
  // panel galerii: klik w tlo zamyka
  $('#gallery-panel').addEventListener('click', e => {
    if (e.target.id === 'gallery-panel') showGallery(false);
  });
}

function showGallery(on) {
  $('#gallery-panel').classList.toggle('hidden', !on);
}

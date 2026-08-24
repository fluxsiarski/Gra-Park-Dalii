// app.js — router ekranów, hub z parkiem, stan globalny UI
import { mountSvg } from './svg.js';
import { store } from './store.js';
import { initSpacer } from './game-spacer.js';
import { initFlappy } from './game-flappy.js';
import { initPlatform } from './game-platform.js';
import { initPrzy } from './przymierzalnia.js';
import { initMemory } from './memory.js';
import { initIntro } from './game-intro.js';
import { initEarth } from './game-earth.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

export { $, $$ };

/* ---------- toast ---------- */
let toastTimer;
export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- router ---------- */
const hooks = {}; // screenId -> { onEnter, onLeave }
export function onScreen(id, fn) { hooks[id] = fn; }

let current = null;
export function go(id) {
  if (current === id) return;
  if (current && hooks[current]?.onLeave) hooks[current].onLeave();
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  current = id;
  if (hooks[id]?.onEnter) hooks[id].onEnter();
}

/* ---------- chipy smaczków ---------- */
export function refreshTreats() {
  ['hub', 'spacer'].forEach(id => {
    const el = $('#treats-' + id);
    if (el) el.textContent = store.s.treats;
  });
}

/* ---------- park (SVG scene) ---------- */
function buildPark() {
  $('#park-scene').innerHTML = `
<svg viewBox="0 0 400 780" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FDF3E1"/><stop offset="1" stop-color="#F4E4CB"/>
    </linearGradient>
  </defs>
  <rect width="400" height="780" fill="url(#sky)"/>
  <circle cx="295" cy="185" r="38" fill="#F5D98C"/>
  <g class="cloud c1"><ellipse cx="80" cy="105" rx="44" ry="16" fill="#FFF9EC"/><ellipse cx="112" cy="95" rx="30" ry="14" fill="#FFF9EC"/></g>

  <path d="M0 300 Q200 250 400 310 L400 780 L0 780 Z" fill="#B7C4A1"/>
  <path d="M0 360 Q220 320 400 380 L400 780 L0 780 Z" fill="#A3B489"/>

  <!-- drzewa -->
  <g stroke="#6B4226" stroke-width="10" stroke-linecap="round">
    <line x1="52" y1="420" x2="52" y2="330"/>
    <line x1="352" y1="450" x2="352" y2="350"/>
  </g>
  <circle cx="52" cy="308" r="52" fill="#7C8F62"/>
  <circle cx="24" cy="332" r="34" fill="#8AA06D"/>
  <circle cx="84" cy="330" r="36" fill="#6E8157"/>
  <circle cx="352" cy="328" r="56" fill="#7C8F62"/>
  <circle cx="318" cy="352" r="34" fill="#6E8157"/>
  <circle cx="386" cy="354" r="32" fill="#8AA06D"/>

  <!-- ścieżka -->
  <path d="M170 780 Q150 600 205 480 Q235 420 210 370 Q190 330 215 300"
    fill="none" stroke="#EAD9BF" stroke-width="42" stroke-linecap="round"/>
  <path d="M170 780 Q150 600 205 480 Q235 420 210 370"
    fill="none" stroke="#DECBA8" stroke-width="4" stroke-dasharray="1 26" stroke-linecap="round"/>

  <!-- ławka -->
  <g transform="translate(96,560)">
    <rect x="-6" y="18" width="8" height="34" fill="#8A5A34"/>
    <rect x="66" y="18" width="8" height="34" fill="#8A5A34"/>
    <rect x="-12" y="8" width="94" height="12" rx="5" fill="#A9713F"/>
    <rect x="-12" y="-16" width="94" height="10" rx="5" fill="#A9713F"/>
    <line x1="0" y1="-6" x2="0" y2="8" stroke="#8A5A34" stroke-width="7"/>
    <line x1="68" y1="-6" x2="68" y2="8" stroke="#8A5A34" stroke-width="7"/>
  </g>

  <!-- kwiatki -->
  <g>
    ${flowers()}
  </g>
</svg>`;
}

function flowers() {
  const pts = [[40,520],[70,640],[130,700],[300,560],[340,650],[260,720],[60,740],[330,740],[240,500]];
  const cols = ['#E88A96','#F0CE8E','#E88A96','#C7D2B4'];
  let out = '';
  pts.forEach(([x,y],i)=>{
    out += `<g transform="translate(${x},${y})">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#7C8F62" stroke-width="3"/>
      <circle cx="0" cy="-4" r="5.5" fill="${cols[i%4]}"/>
      <circle cx="-6" cy="0" r="4.5" fill="${cols[i%4]}"/>
      <circle cx="6" cy="0" r="4.5" fill="${cols[i%4]}"/>
    </g>`;
  });
  return out;
}

/* ---------- tło hubu (park / zdjęcia miejsc) ---------- */
const HUB_BGS = [
  { id: 'park', name: 'Park Dalii' },
  { id: 'bulwar', name: 'Bulwar Wrocław', src: 'assets/img/places/bulwar-wroclaw.jpg', pos: '62% 38%' },
  { id: 'karuzela', name: 'Karuzela', src: 'assets/img/places/karuzela-park.jpg', pos: '50% 40%' },
  { id: 'teatr', name: 'Teatr Lalek', src: 'assets/img/places/teatr-lalek-jesien.jpg', pos: '55% 42%' },
];

function hubBgById(id) {
  return HUB_BGS.find(bg => bg.id === id) || HUB_BGS[0];
}

function applyHubBg(id) {
  const bg = hubBgById(id);
  const hub = $('#screen-hub');
  const park = $('#park-scene');
  const layer = $('#park-photo-layer');
  const img = $('#park-photo');
  const blur = $('#park-photo-blur');
  const ico = $('#hub-place-ico');

  if (!bg.src) {
    hub.classList.remove('hub-photo');
    park.classList.remove('hidden');
    layer.classList.add('hidden');
    img.removeAttribute('src');
    blur.style.backgroundImage = '';
    ico.classList.remove('is-photo');
    ico.style.backgroundImage = '';
  } else {
    hub.classList.add('hub-photo');
    park.classList.add('hidden');
    layer.classList.remove('hidden');
    img.src = bg.src;
    img.style.objectPosition = bg.pos;
    blur.style.backgroundImage = `url("${bg.src}")`;
    blur.style.backgroundPosition = bg.pos;
    ico.classList.add('is-photo');
    ico.style.backgroundImage = `url("${bg.src}")`;
    ico.style.backgroundPosition = bg.pos;
  }

  store.setHubBg(bg.id);
  $$('.place-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.bg === bg.id);
  });
}

function renderPlaceGrid() {
  const grid = $('#place-grid');
  const current = store.s.hubBg;
  grid.innerHTML = HUB_BGS.map(bg => {
    const thumb = bg.src
      ? `<img class="place-thumb" src="${bg.src}" alt="">`
      : `<span class="place-thumb place-thumb-park"></span>`;
    return `<button class="place-card${bg.id === current ? ' selected' : ''}" type="button" data-bg="${bg.id}">
      ${thumb}
      <strong>${bg.name}</strong>
    </button>`;
  }).join('');
}

function setPlacePanel(open) {
  $('#place-panel').classList.toggle('hidden', !open);
}

function initPlacePicker() {
  HUB_BGS.forEach(bg => {
    if (!bg.src) return;
    const preload = new Image();
    preload.src = bg.src;
  });
  renderPlaceGrid();
  applyHubBg(store.s.hubBg);

  $('#hub-place-btn').addEventListener('click', () => setPlacePanel(true));
  $('#place-panel-close').addEventListener('click', () => setPlacePanel(false));
  $('#place-panel-backdrop').addEventListener('click', () => setPlacePanel(false));
  $('#place-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.place-card');
    if (!card) return;
    applyHubBg(card.dataset.bg);
    setPlacePanel(false);
  });
}

/* ---------- Dalia na hubie ---------- */
const IDLE_POSES = ['assets/img/dalia/sit-front.png', 'assets/img/dalia/sit-happy.png'];
let idleTimer, zzzTimer;

function startDaliaIdle() {
  const img = $('#dalia-main');
  let i = 0;
  clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    // 80% siedzi spokojnie, 20% radosna mina
    img.src = Math.random() < 0.2 ? 'assets/img/dalia/sit-happy.png' : IDLE_POSES[i++ % 2];
  }, 2600);

  // czasem drzemie
  clearInterval(zzzTimer);
  zzzTimer = setInterval(() => {
    if (Math.random() < 0.3) {
      img.src = 'assets/img/dalia/sleep-curl.png';
      $('#dalia-zzz').classList.add('show');
      setTimeout(() => {
        $('#dalia-zzz').classList.remove('show');
        img.src = IDLE_POSES[0];
      }, 4200);
    }
  }, 14000);
}

function wrapPhoneFrame() {
  if (window.innerWidth >= 560) {
    const frame = document.createElement('div');
    frame.className = 'phone-frame';
    [...document.body.children].forEach(ch => frame.appendChild(ch));
    document.body.appendChild(frame);
  }
}

/* ---------- boot ---------- */
function boot() {
  mountSvg();
  buildPark();
  initPlacePicker();
  refreshTreats();

  $$('[data-go]').forEach(el => {
    el.addEventListener('click', () => go(el.dataset.go));
  });

  initSpacer({ onScreen });
  initFlappy({ onScreen });
  initPlatform({ onScreen });
  initPrzy({ toast, onScreen });
  initMemory({ toast, onScreen });
  initIntro({ onScreen, go });
  initEarth({ onScreen });

  document.addEventListener('treats', refreshTreats);
  startDaliaIdle();

  wrapPhoneFrame();
  go('screen-intro');

  // PWA: ścieżki względne działają lokalnie i w podkatalogu GitHub Pages.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }
}

boot();

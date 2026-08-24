// game-flappy.js — Flappy Dalia: lot z jetpackiem przez park
import { store } from './store.js';

const $ = (s) => document.querySelector(s);

let cv, ctx, wrap, img;
let W = 390, H = 700, dpr = 1;
let state = 'ready';
let dog, obstacles = [], score = 0, rafId = 0, lastT = 0;

const GRAVITY = 1180;
const FLAP_V = -410;
const GROUND_H = 42;
const MAX_PARTICLES = 72;
const particles = Array.from({ length: MAX_PARTICLES }, () => ({
  active: false,
  type: 0,
  tone: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  size: 0,
  rot: 0,
  vr: 0,
  age: 0,
  life: 0,
}));
const nozzle = { x: 0, y: 0, rot: 0 };
let particleCursor = 0, sparkBudget = 0, smokeBudget = 0;

function resize() {
  const rect = cv.getBoundingClientRect();
  W = Math.max(280, rect.width);
  H = Math.max(420, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (dog) {
    dog.x = W * .25;
    dog.y = Math.min(dog.y, H - GROUND_H - dog.h);
  }
  if (state !== 'playing') draw(performance.now());
}

function dogSize() {
  const w = Math.min(112, Math.max(82, W * .25));
  return { w, h: w * (484 / 720) };
}

function resetWorld() {
  const size = dogSize();
  dog = { x: W * .25, y: H * .43, vy: 0, w: size.w, h: size.h, rot: 0 };
  score = 0;
  obstacles = [];
  clearParticles();
  const spacing = Math.max(220, W * .64);
  for (let i = 0; i < 4; i++) obstacles.push(makeObstacle(W + 130 + i * spacing));
  updateHud();
}

function makeObstacle(x) {
  const gap = Math.max(150, Math.min(190, H * .27) - Math.min(score, 20) * 1.25);
  const margin = 76 + gap / 2;
  const maxY = H - GROUND_H - margin;
  const gapY = margin + Math.random() * Math.max(20, maxY - margin);
  return {
    x,
    w: Math.max(62, Math.min(78, W * .18)),
    gap,
    gapY,
    passed: false,
    style: Math.floor(Math.random() * 3),
  };
}

function speed() {
  return Math.min(235, 145 + score * 3.2);
}

function flap() {
  if (state !== 'playing') return;
  dog.vy = FLAP_V;
  dog.rot = -.28;
  emitBurst();
}

function start() {
  resetWorld();
  state = 'playing';
  $('#flappy-start').classList.add('hidden');
  $('#flappy-over').classList.add('hidden');
  lastT = performance.now();
  cancelAnimationFrame(rafId);
  rafId = 0;
  rafId = requestAnimationFrame(loop);
}

function gameOver() {
  if (state !== 'playing') return;
  state = 'over';
  store.setBestFlappy(score);
  $('#flappy-final').textContent = score;
  $('#flappy-best').textContent = store.s.best.flappy || 0;
  $('#flappy-over').classList.remove('hidden');
}

function stop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  state = 'ready';
  $('#flappy-over').classList.add('hidden');
  $('#flappy-start').classList.remove('hidden');
  resetWorld();
  draw(performance.now());
}

function update(dt) {
  dog.vy += GRAVITY * dt;
  dog.y += dog.vy * dt;
  dog.rot = Math.min(.62, dog.rot + 1.7 * dt);

  const dx = speed() * dt;
  for (const o of obstacles) {
    o.x -= dx;
    if (!o.passed && o.x + o.w < dog.x) {
      o.passed = true;
      score++;
      updateHud();
    }
  }

  if (obstacles[0].x + obstacles[0].w < -10) {
    obstacles.shift();
    const last = obstacles[obstacles.length - 1];
    obstacles.push(makeObstacle(last.x + Math.max(220, W * .64)));
  }

  if (dog.y < -dog.h * .25 || dog.y + dog.h > H - GROUND_H || hitsObstacle()) gameOver();
}

function clearParticles() {
  for (const p of particles) p.active = false;
  particleCursor = 0;
  sparkBudget = 0;
  smokeBudget = 0;
}

function nozzlePose() {
  const rot = dog.rot;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  // Końcówka płomienia jest częścią sprite'a; nowe cząstki startują tuż za nią.
  const localX = -dog.w * .305;
  const localY = -dog.h * .105;
  nozzle.x = dog.x + dog.w / 2 + localX * cos - localY * sin;
  nozzle.y = dog.y + dog.h / 2 + localX * sin + localY * cos;
  nozzle.rot = rot;
  return nozzle;
}

function takeParticle() {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const index = (particleCursor + i) % MAX_PARTICLES;
    if (!particles[index].active) {
      particleCursor = (index + 1) % MAX_PARTICLES;
      return particles[index];
    }
  }
  const p = particles[particleCursor];
  particleCursor = (particleCursor + 1) % MAX_PARTICLES;
  return p;
}

function emitParticle(type, burst, pose) {
  const p = takeParticle();
  const spread = type === 0 ? (burst ? .42 : .25) : .48;
  const angle = pose.rot + Math.PI + (Math.random() - .5) * spread;
  const plumeSpeed = type === 0
    ? (burst ? 175 + Math.random() * 125 : 95 + Math.random() * 80)
    : (burst ? 80 + Math.random() * 65 : 48 + Math.random() * 45);
  const jitter = (Math.random() - .5) * (burst ? 7 : 4);

  p.active = true;
  p.type = type;
  p.tone = Math.floor(Math.random() * 3);
  p.x = pose.x - Math.sin(angle) * jitter;
  p.y = pose.y + Math.cos(angle) * jitter;
  p.vx = Math.cos(angle) * plumeSpeed;
  p.vy = Math.sin(angle) * plumeSpeed + dog.vy * (type === 0 ? .1 : .06);
  p.size = type === 0
    ? (burst ? 1.3 + Math.random() * 2.1 : .8 + Math.random() * 1.4)
    : (burst ? 4.5 + Math.random() * 5 : 3.5 + Math.random() * 4);
  p.rot = angle;
  p.vr = (Math.random() - .5) * (type === 0 ? 9 : 3);
  p.age = 0;
  p.life = type === 0
    ? (burst ? .3 + Math.random() * .24 : .2 + Math.random() * .2)
    : (burst ? .58 + Math.random() * .34 : .5 + Math.random() * .3);
}

function emitBurst() {
  const pose = nozzlePose();
  for (let i = 0; i < 9; i++) emitParticle(0, true, pose);
  for (let i = 0; i < 3; i++) emitParticle(1, true, pose);
}

function emitTrail(dt) {
  const pose = nozzlePose();
  sparkBudget += dt * (dog.vy < 0 ? 20 : 14);
  smokeBudget += dt * 4.5;
  while (sparkBudget >= 1) {
    emitParticle(0, false, pose);
    sparkBudget--;
  }
  while (smokeBudget >= 1) {
    emitParticle(1, false, pose);
    smokeBudget--;
  }
}

function updateParticles(dt) {
  if (state === 'playing') emitTrail(dt);
  for (const p of particles) {
    if (!p.active) continue;
    p.age += dt;
    if (p.age >= p.life) {
      p.active = false;
      continue;
    }
    if (p.type === 0) {
      p.vy += 72 * dt;
      p.vx *= Math.max(0, 1 - 1.2 * dt);
    } else {
      p.vy -= 12 * dt;
      p.vx *= Math.max(0, 1 - .8 * dt);
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
  }
}

function activeParticleCount() {
  let count = 0;
  for (const p of particles) if (p.active) count++;
  return count;
}

function hitsObstacle() {
  const hit = {
    x: dog.x + dog.w * .13,
    y: dog.y + dog.h * .18,
    w: dog.w * .74,
    h: dog.h * .64,
  };
  for (const o of obstacles) {
    if (hit.x + hit.w <= o.x || hit.x >= o.x + o.w) continue;
    const topH = o.gapY - o.gap / 2;
    const bottomY = o.gapY + o.gap / 2;
    if (hit.y < topH || hit.y + hit.h > bottomY) return true;
  }
  return false;
}

function loop(t) {
  rafId = 0;
  if (state !== 'playing' && (state !== 'over' || !activeParticleCount())) return;
  const dt = Math.min(.032, Math.max(0, (t - lastT) / 1000));
  lastT = t;
  if (state === 'playing') update(dt);
  updateParticles(dt);
  draw(t);
  if (state === 'playing' || activeParticleCount()) rafId = requestAnimationFrame(loop);
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  drawSky(t);
  drawParticles();
  for (const o of obstacles) drawObstacle(o);
  drawGround(t);
  drawDog(t);
}

function drawParticles() {
  const sparkColors = ['#FFD94D', '#FF9F24', '#F35F22'];

  for (const p of particles) {
    if (!p.active || p.type !== 1) continue;
    const progress = p.age / p.life;
    const alpha = Math.min(1, p.age * 12) * (1 - progress) * .2;
    const size = p.size * (1 + progress * 1.25);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.tone === 0 ? '#554D49' : p.tone === 1 ? '#6B625D' : '#81766E';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size * 1.18, size * .72, p.rot, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  for (const p of particles) {
    if (!p.active || p.type !== 0) continue;
    const progress = p.age / p.life;
    const alpha = Math.min(1, p.age * 25) * Math.pow(1 - progress, 1.35);
    const length = p.size * (2.8 - progress * 1.25);
    const dx = Math.cos(p.rot) * length;
    const dy = Math.sin(p.rot) * length;
    ctx.globalAlpha = alpha * .84;
    ctx.strokeStyle = sparkColors[p.tone];
    ctx.lineWidth = p.size * (1 - progress * .55);
    ctx.beginPath();
    ctx.moveTo(p.x - dx * .25, p.y - dy * .25);
    ctx.lineTo(p.x + dx, p.y + dy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}

function drawSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#9ED6EA');
  g.addColorStop(.68, '#EAF1D6');
  g.addColorStop(1, '#C9D29E');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,.72)';
  for (let i = 0; i < 4; i++) {
    const x = ((i * 137 - t * .012) % (W + 160)) - 60;
    const y = 58 + (i % 3) * 92;
    cloud(x, y, 24 + (i % 2) * 8);
  }

  ctx.fillStyle = '#B6C58E';
  ctx.beginPath();
  ctx.moveTo(0, H - 110);
  for (let x = 0; x <= W; x += 30) {
    ctx.lineTo(x, H - 105 - Math.sin(x * .025 + t * .0002) * 20);
  }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
}

function cloud(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r, y - r * .2, r * .78, 0, Math.PI * 2);
  ctx.arc(x + r * 1.7, y, r * .62, 0, Math.PI * 2);
  ctx.fill();
}

function drawObstacle(o) {
  const topH = o.gapY - o.gap / 2;
  const bottomY = o.gapY + o.gap / 2;
  tower(o.x, 0, o.w, topH, true, o.style);
  tower(o.x, bottomY, o.w, H - GROUND_H - bottomY, false, o.style);
}

function tower(x, y, w, h, upside, style) {
  if (h <= 0) return;
  const palettes = [
    ['#7C8F62', '#5E7348', '#A9BA8E'],
    ['#B9855A', '#8A5A34', '#D4AB78'],
    ['#7A91A3', '#526B7A', '#AFC0CB'],
  ];
  const [main, dark, light] = palettes[style];
  ctx.fillStyle = dark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = main;
  ctx.fillRect(x + 7, y, w - 14, h);
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.fillRect(x + 12, y, 8, h);

  const capH = 22;
  const capY = upside ? Math.max(0, y + h - capH) : y;
  ctx.fillStyle = dark;
  roundRect(x - 7, capY, w + 14, capH, 8);
  ctx.fill();
  ctx.fillStyle = light;
  roundRect(x - 2, capY + 4, w + 4, 8, 4);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.23)';
  for (let yy = y + 38; yy < y + h - 26; yy += 48) {
    ctx.fillRect(x + w * .42, yy, w * .3, 5);
  }
}

function drawGround(t) {
  ctx.fillStyle = '#718456';
  ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
  ctx.fillStyle = '#91A96B';
  ctx.fillRect(0, H - GROUND_H, W, 10);
  ctx.fillStyle = '#C6D68C';
  for (let x = -((t * .08) % 26); x < W; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, H - GROUND_H + 10);
    ctx.lineTo(x + 7, H - GROUND_H - 5);
    ctx.lineTo(x + 12, H - GROUND_H + 10);
    ctx.fill();
  }
}

function drawDog(t) {
  if (!dog) return;
  const bob = state === 'ready' ? Math.sin(t / 280) * 7 : 0;
  ctx.save();
  ctx.translate(dog.x + dog.w / 2, dog.y + dog.h / 2 + bob);
  ctx.rotate(state === 'ready' ? -.06 : dog.rot);
  ctx.shadowColor = 'rgba(45,30,20,.24)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 7;
  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, -dog.w / 2, -dog.h / 2, dog.w, dog.h);
  } else {
    ctx.fillStyle = '#5C3B24';
    roundRect(-dog.w / 2, -dog.h / 2, dog.w, dog.h, 22);
    ctx.fill();
  }
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function updateHud() {
  $('#flappy-score').textContent = score;
}

function bindInput() {
  cv.addEventListener('pointerdown', e => {
    if (state !== 'playing') return;
    e.preventDefault();
    flap();
  });
  window.addEventListener('keydown', e => {
    if (!$('#screen-flappy').classList.contains('active')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });
  $('#btn-flappy-go').addEventListener('click', start);
  $('#btn-flappy-again').addEventListener('click', start);
}

export function initFlappy({ onScreen }) {
  cv = $('#flappy-canvas');
  ctx = cv.getContext('2d');
  wrap = $('.flappy-wrap');
  img = new Image();
  img.src = 'assets/img/dalia/jetpack.png';
  img.onload = () => { if (state !== 'playing') draw(performance.now()); };
  bindInput();
  resetWorld();

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  window.addEventListener('resize', resize);

  onScreen('screen-flappy', {
    onEnter() {
      resize();
      $('#flappy-best-start').textContent = store.s.best.flappy || 0;
      stop();
    },
    onLeave() { stop(); },
  });

  window.__flappy = {
    state: () => state,
    score: () => score,
    snapshot: () => ({
      state,
      score,
      dog: dog && { x: dog.x, y: dog.y, vy: dog.vy, w: dog.w, h: dog.h, rot: dog.rot },
      nozzle: dog && (() => {
        const pose = nozzlePose();
        return { x: pose.x, y: pose.y, rot: pose.rot };
      })(),
      particles: activeParticleCount(),
      obstacles: obstacles.map(o => ({ x: o.x, w: o.w, gap: o.gap, gapY: o.gapY })),
    }),
    start,
    flap,
    end: gameOver,
  };
}

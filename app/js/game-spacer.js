// game-spacer.js — "Spacer": Dalia zbiera przysmaki (snake)
import { store } from './store.js';
import { DALIA } from './data.js';

const $ = (s) => document.querySelector(s);

const COLS = 13, ROWS = 17;
let cv, ctx, W = 390, H = 700, cell = 20, dpr = 1;
let board = { x: 0, y: 0, w: 0, h: 0, radius: 22 };

// stan gry
let snake, dir, nextDirs, treat, obstacles, running = false, paused = false;
let treatsRun = 0, level = 1, tickMs = 260, acc = 0, lastT = 0;
let previousSnake = [];
let headImg = null, tonguePhase = 0;
let rafId = null;
let hintTimer = null, lastDrawT = 0;
const particles = [];
const floaters = [];

function resize() {
  const rect = cv.getBoundingClientRect();
  W = Math.max(280, rect.width);
  H = Math.max(420, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const sidePadding = W < 340 ? 10 : 14;
  const verticalRoom = Math.max(ROWS * 17, H - 150);
  cell = Math.floor(Math.min((W - sidePadding * 2) / COLS, verticalRoom / ROWS));
  board.w = cell * COLS;
  board.h = cell * ROWS;
  board.x = Math.round((W - board.w) / 2);
  board.y = Math.round((H - board.h) / 2 + 12);
  board.radius = Math.min(24, cell * .8);

  if (!running && snake && obstacles) draw(performance.now());
}

function resetGame() {
  const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
  snake = [{x: cx, y: cy}, {x: cx, y: cy + 1}, {x: cx, y: cy + 2}];
  previousSnake = snake.map(s => ({ ...s }));
  dir = {x: 0, y: -1};
  nextDirs = [];
  treatsRun = 0; level = 1; tickMs = 260; acc = 0;
  particles.length = 0;
  floaters.length = 0;
  obstacles = makeObstacles();
  spawnTreat();
  updateHud();
}

function makeObstacles() {
  const obs = new Map();
  const count = Math.min(4 + level * 2, 12);
  let guard = 200;
  while (obs.size < count && guard--) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const cy = Math.floor(ROWS / 2);
    if (Math.abs(y - cy) <= 3 && x >= 4 && x <= 8) continue; // strefa startu
    if (obs.has(x + ',' + y)) continue;
    const types = ['bench', 'tree', 'puddle'];
    obs.set(x + ',' + y, { x, y, type: types[Math.floor(Math.random() * types.length)] });
  }
  return obs;
}

function spawnTreat() {
  let guard = 300;
  while (guard--) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const k = x + ',' + y;
    if (obstacles.has(k)) continue;
    if (snake.some(s => s.x === x && s.y === y)) continue;
    treat = { x, y };
    return;
  }
  treat = { x: 0, y: 0 };
}

function step() {
  // kierunek z kolejki swipe
  while (nextDirs.length) {
    const d = nextDirs.shift();
    if (d.x === -dir.x && d.y === -dir.y) continue; // nie zawracaj
    dir = d; break;
  }
  previousSnake = snake.map(s => ({ ...s }));
  const head = snake[0];
  const nx = head.x + dir.x, ny = head.y + dir.y;

  // ściany / ogon / przeszkody śmiertelne
  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return gameOver();
  if (snake.some((s, i) => i < snake.length - 1 && s.x === nx && s.y === ny)) return gameOver();
  const obKey = obstacles.get(nx + ',' + ny);
  if (obKey && obKey.type !== 'puddle') return gameOver();

  snake.unshift({ x: nx, y: ny });

  if (treat && nx === treat.x && ny === treat.y) {
    treatsRun++;
    level = Math.floor(treatsRun / 5) + 1;
    tickMs = Math.max(120, 260 - (level - 1) * 14);
    emitTreatBurst(nx, ny);
    spawnTreat();
    if ((treatsRun % 5) === 0) mergeObstacles();
    pulse = 1;
    updateHud();
  } else {
    // kałuża spowalnia na tym polu
    snake.pop();
    if (obKey && obKey.type === 'puddle') acc -= tickMs * 0.5;
  }
}

function mergeObstacles() {
  for (const o of makeObstacles().values()) {
    const k = o.x + ',' + o.y;
    const hitsTreat = treat && treat.x === o.x && treat.y === o.y;
    if (!hitsTreat && !obstacles.has(k) && !snake.some(s => s.x === o.x && s.y === o.y)) {
      obstacles.set(k, o);
    }
  }
}

let pulse = 0;

function draw(t) {
  const dt = lastDrawT ? Math.min(.05, Math.max(0, (t - lastDrawT) / 1000)) : 0;
  lastDrawT = t;
  if (!paused) updateEffects(dt);

  ctx.clearRect(0, 0, W, H);
  drawParkBackdrop(t);
  drawBoard(t);

  ctx.save();
  roundedRectPath(board.x, board.y, board.w, board.h, board.radius);
  ctx.clip();

  for (const o of obstacles.values()) drawObstacle(o, board.x, board.y, t);
  if (treat) drawTreat(t);
  drawSnake(t);
  drawEffects();

  ctx.restore();

  const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, H * .72);
  vignette.addColorStop(0, 'rgba(26,48,32,0)');
  vignette.addColorStop(1, 'rgba(26,48,32,.14)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function fluffy(x, y, r, color, seed) {
  ctx.save();
  ctx.shadowColor = 'rgba(45,27,17,.18)';
  ctx.shadowBlur = r * .25;
  ctx.shadowOffsetY = r * .12;
  ctx.fillStyle = color;
  ctx.beginPath();
  const bumps = 12;
  for (let a = 0; a <= bumps; a++) {
    const ang = (a / bumps) * Math.PI * 2;
    const rr = r * (1 + 0.1 * Math.sin(seed / 700 + a * 2.7));
    const px = x + Math.cos(ang) * rr;
    const py = y + Math.sin(ang) * rr;
    if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,218,174,.15)';
  ctx.beginPath();
  ctx.ellipse(x - r * .2, y - r * .28, r * .42, r * .22, -.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(48,28,17,.22)';
  ctx.lineWidth = Math.max(1, r * .07);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = seed / 900 + i * Math.PI * 2 / 3;
    const px = x + Math.cos(a) * r * .38;
    const py = y + Math.sin(a) * r * .38;
    ctx.beginPath();
    ctx.arc(px, py, r * .16, a, a + Math.PI * 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHead(h, t) {
  const cx = h.x;
  const cy = h.y;
  const ang = Math.atan2(dir.y, dir.x) + Math.PI / 2;

  // jezyk co jakis czas
  tonguePhase = (t % 3400) / 3400;
  if (tonguePhase > 0.86) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.strokeStyle = '#E06A6A'; ctx.lineWidth = cell * .12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, cell * .34); ctx.lineTo(0, cell * .58); ctx.stroke();
    ctx.restore();
  }

  if (headImg && headImg.complete && headImg.naturalWidth) {
    const w = cell * 1.34;
    const hgt = w * (headImg.naturalHeight / headImg.naturalWidth);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.shadowColor = 'rgba(43,27,18,.28)';
    ctx.shadowBlur = cell * .22;
    ctx.shadowOffsetY = cell * .14;
    ctx.drawImage(headImg, -w / 2, -hgt / 2, w, hgt);
    ctx.restore();
  } else {
    fluffy(cx, cy, cell * .5, '#5C3B24', t);
    ctx.fillStyle = '#3B2415';
    const e = cell * .13;
    const ex = Math.cos(ang - Math.PI/2) * cell * .18, ey = Math.sin(ang - Math.PI/2) * cell * .18;
    ctx.beginPath(); ctx.arc(cx + ex, cy + ey, e, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - ex, cy - ey, e, 0, 7); ctx.fill();
  }
}

function drawBone(x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-.42);
  ctx.shadowColor = 'rgba(58,40,24,.28)';
  ctx.shadowBlur = s * .28;
  ctx.shadowOffsetY = s * .14;
  const boneGrad = ctx.createLinearGradient(0, -s, 0, s);
  boneGrad.addColorStop(0, '#FFF9E9');
  boneGrad.addColorStop(1, '#E9D2AA');
  ctx.fillStyle = boneGrad;
  ctx.strokeStyle = 'rgba(105,73,43,.48)'; ctx.lineWidth = Math.max(1, s * .075);
  const w = s * .34, l = s * .62;
  ctx.beginPath();
  ctx.arc(-l, -w * .7, w * .75, 0, 7);
  ctx.arc(-l, w * .7, w * .75, 0, 7);
  ctx.rect(-l, -w * .7, l * 2, w * 1.4);
  ctx.arc(l, -w * .7, w * .75, 0, 7);
  ctx.arc(l, w * .7, w * .75, 0, 7);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawObstacle(o, offX, offY, t) {
  const x = offX + o.x * cell, y = offY + o.y * cell;
  const c = cell / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(39,58,35,.2)';
  ctx.beginPath();
  ctx.ellipse(x + c, y + cell * .76, cell * .4, cell * .14, 0, 0, Math.PI * 2);
  ctx.fill();

  if (o.type === 'bench') {
    ctx.strokeStyle = '#4E493D';
    ctx.lineWidth = Math.max(1.2, cell * .07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + cell * .2, y + cell * .54); ctx.lineTo(x + cell * .16, y + cell * .86);
    ctx.moveTo(x + cell * .8, y + cell * .54); ctx.lineTo(x + cell * .84, y + cell * .86);
    ctx.stroke();
    const wood = ctx.createLinearGradient(x, y, x, y + cell);
    wood.addColorStop(0, '#C78A50'); wood.addColorStop(1, '#8A542D');
    ctx.fillStyle = wood;
    roundedRectPath(x + cell * .07, y + cell * .2, cell * .86, cell * .18, cell * .07); ctx.fill();
    roundedRectPath(x + cell * .06, y + cell * .45, cell * .88, cell * .2, cell * .07); ctx.fill();
    ctx.strokeStyle = 'rgba(83,48,25,.5)'; ctx.lineWidth = Math.max(1, cell * .035);
    for (const yy of [.29, .54]) {
      ctx.beginPath(); ctx.moveTo(x + cell * .15, y + cell * yy); ctx.lineTo(x + cell * .85, y + cell * yy); ctx.stroke();
    }
  } else if (o.type === 'tree') {
    ctx.fillStyle = '#70472A';
    roundedRectPath(x + c - cell * .085, y + cell * .48, cell * .17, cell * .39, cell * .06); ctx.fill();
    const crown = ctx.createRadialGradient(x + c - cell * .14, y + c * .26, 0, x + c, y + c * .55, c * .9);
    crown.addColorStop(0, '#B9CD84'); crown.addColorStop(.48, '#789D5D'); crown.addColorStop(1, '#476F49');
    ctx.fillStyle = crown;
    const sway = Math.sin(t / 900 + o.x * 3 + o.y) * cell * .018;
    ctx.beginPath(); ctx.arc(x + c + sway, y + c * .68, c * .78, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + c - c * .42 + sway, y + c * .72, c * .48, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + c + c * .42 + sway, y + c * .76, c * .45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(229,241,178,.36)';
    ctx.beginPath(); ctx.arc(x + c - c * .25 + sway, y + c * .4, c * .22, 0, Math.PI * 2); ctx.fill();
  } else {
    const water = ctx.createRadialGradient(x + c * .72, y + c * .65, 0, x + c, y + c, c);
    water.addColorStop(0, 'rgba(181,225,224,.9)');
    water.addColorStop(1, 'rgba(70,139,151,.75)');
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.ellipse(x + c, y + c, c * .88, c * .56, .22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(238,255,246,.66)'; ctx.lineWidth = Math.max(1, cell * .045);
    const ripple = .42 + Math.sin(t / 430 + o.x) * .07;
    ctx.beginPath(); ctx.ellipse(x + c, y + c, c * ripple, c * ripple * .48, .22, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.52)';
    ctx.beginPath(); ctx.ellipse(x + c * .68, y + c * .68, c * .18, c * .07, .18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawParkBackdrop(t) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#A9C98C');
  bg.addColorStop(.52, '#89AE73');
  bg.addColorStop(1, '#6F9663');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(246,229,161,.12)';
  ctx.beginPath(); ctx.arc(W * .85, H * .1, W * .28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(42,81,48,.09)';
  ctx.beginPath(); ctx.arc(W * .08, H * .86, W * .32, 0, Math.PI * 2); ctx.fill();

  // Dekoracyjne listki poza planszą dają wrażenie żywego parku bez obciążania DOM.
  for (let i = 0; i < 18; i++) {
    const x = ((i * 83 + 31) % 101) / 100 * W;
    const y = ((i * 47 + 17) % 103) / 102 * H;
    if (x > board.x - 7 && x < board.x + board.w + 7 && y > board.y - 7 && y < board.y + board.h + 7) continue;
    const sway = Math.sin(t / 900 + i) * 2;
    ctx.fillStyle = i % 3 ? 'rgba(230,240,176,.3)' : 'rgba(255,225,150,.38)';
    ctx.beginPath();
    ctx.ellipse(x + sway, y, 3.2, 6.2, (i % 5) * .55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoard(t) {
  ctx.save();
  ctx.shadowColor = 'rgba(37,62,39,.35)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  roundedRectPath(board.x, board.y, board.w, board.h, board.radius);
  ctx.fillStyle = '#71985D';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRectPath(board.x, board.y, board.w, board.h, board.radius);
  ctx.clip();
  const grass = ctx.createLinearGradient(board.x, board.y, board.x + board.w, board.y + board.h);
  grass.addColorStop(0, '#9EBD79');
  grass.addColorStop(.52, '#88AD6C');
  grass.addColorStop(1, '#7A9F64');
  ctx.fillStyle = grass;
  ctx.fillRect(board.x, board.y, board.w, board.h);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,220,.035)';
        ctx.fillRect(board.x + x * cell, board.y + y * cell, cell, cell);
      }
      const seed = (x * 19 + y * 31) % 37;
      if (seed === 3 || seed === 11) {
        const fx = board.x + x * cell + cell * (.25 + (seed % 3) * .18);
        const fy = board.y + y * cell + cell * .72;
        ctx.strokeStyle = 'rgba(55,101,57,.34)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx, fy + 3); ctx.lineTo(fx, fy - 2); ctx.stroke();
        ctx.fillStyle = seed === 3 ? 'rgba(255,238,169,.72)' : 'rgba(239,217,236,.64)';
        ctx.beginPath(); ctx.arc(fx, fy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  const sheen = ctx.createLinearGradient(board.x, board.y, board.x + board.w, board.y);
  sheen.addColorStop(0, 'rgba(255,255,255,.06)');
  sheen.addColorStop(.5 + Math.sin(t / 5000) * .1, 'rgba(255,255,255,.015)');
  sheen.addColorStop(1, 'rgba(39,75,43,.05)');
  ctx.fillStyle = sheen; ctx.fillRect(board.x, board.y, board.w, board.h);
  ctx.restore();

  ctx.save();
  roundedRectPath(board.x, board.y, board.w, board.h, board.radius);
  ctx.strokeStyle = 'rgba(232,242,194,.56)';
  ctx.lineWidth = 3;
  ctx.stroke();
  roundedRectPath(board.x + 5, board.y + 5, board.w - 10, board.h - 10, Math.max(10, board.radius - 5));
  ctx.strokeStyle = 'rgba(54,91,52,.28)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawTreat(t) {
  const px = board.x + treat.x * cell + cell / 2;
  const py = board.y + treat.y * cell + cell / 2 + Math.sin(t / 280) * cell * .055;
  const glow = cell * (.58 + Math.sin(t / 350) * .045);
  ctx.fillStyle = 'rgba(255,226,137,.18)';
  ctx.beginPath(); ctx.arc(px, py, glow, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const a = t / 700 + i * Math.PI * 2 / 3;
    const r = cell * .42;
    ctx.fillStyle = 'rgba(255,245,190,.75)';
    ctx.beginPath(); ctx.arc(px + Math.cos(a) * r, py + Math.sin(a) * r, Math.max(1, cell * .045), 0, Math.PI * 2); ctx.fill();
  }
  const s = cell * (pulse > 0 ? 1 + pulse * .22 : 1) * .58;
  pulse = Math.max(0, pulse - .07);
  drawBone(px, py, s);
}

function drawSnake(t) {
  if (!snake || !snake.length) return;
  const rawProgress = running ? Math.min(1, acc / tickMs) : 1;
  const progress = 1 - Math.pow(1 - rawProgress, 3);
  const points = snake.map((segment, i) => {
    const from = previousSnake[Math.min(i, previousSnake.length - 1)] || segment;
    return {
      x: board.x + (from.x + (segment.x - from.x) * progress + .5) * cell,
      y: board.y + (from.y + (segment.y - from.y) * progress + .5) * cell,
    };
  });

  if (points.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y + cell * .09);
    for (let i = points.length - 2; i >= 0; i--) ctx.lineTo(points[i].x, points[i].y + cell * .09);
    ctx.strokeStyle = 'rgba(46,28,18,.2)';
    ctx.lineWidth = cell * .57;
    ctx.stroke();
    const fur = ctx.createLinearGradient(points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);
    fur.addColorStop(0, '#4F301E');
    fur.addColorStop(.55, '#68422A');
    fur.addColorStop(1, '#7A5033');
    ctx.strokeStyle = fur;
    ctx.lineWidth = cell * .43;
    ctx.stroke();
    ctx.restore();
  }

  for (let i = points.length - 1; i >= 1; i--) {
    const taper = i / Math.max(points.length - 1, 1);
    const radius = cell * (.43 - taper * .08);
    const wobble = Math.sin(t / 190 + i * 1.25) * cell * .025;
    fluffy(points[i].x + wobble, points[i].y, radius, i % 2 ? '#654129' : '#70492E', t + i * 410);
  }

  const head = points[0];
  ctx.fillStyle = 'rgba(46,30,18,.22)';
  ctx.beginPath();
  ctx.ellipse(head.x, head.y + cell * .34, cell * .42, cell * .16, 0, 0, Math.PI * 2);
  ctx.fill();
  drawHead(head, t);
}

function emitTreatBurst(x, y) {
  for (let i = 0; i < 16; i++) {
    const angle = Math.PI * 2 * i / 16 + Math.random() * .22;
    const speed = 1.1 + Math.random() * 1.55;
    particles.push({
      x: x + .5, y: y + .5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - .25,
      age: 0, life: .5 + Math.random() * .35,
      size: .045 + Math.random() * .055,
      gold: i % 3 !== 0,
    });
  }
  floaters.push({ x: x + .5, y: y + .25, age: 0, life: .85 });
  if (particles.length > 48) particles.splice(0, particles.length - 48);
}

function updateEffects(dt) {
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 1.7 * dt;
  }
  for (const f of floaters) {
    f.age += dt;
    f.y -= .5 * dt;
  }
  while (particles.length && particles[0].age >= particles[0].life) particles.shift();
  while (floaters.length && floaters[0].age >= floaters[0].life) floaters.shift();
}

function drawEffects() {
  for (const p of particles) {
    const life = 1 - p.age / p.life;
    const px = board.x + p.x * cell;
    const py = board.y + p.y * cell;
    ctx.globalAlpha = Math.max(0, life);
    ctx.fillStyle = p.gold ? '#FFE394' : '#FFF9E4';
    ctx.beginPath(); ctx.arc(px, py, cell * p.size * (1 + life * .35), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of floaters) {
    const life = 1 - f.age / f.life;
    ctx.globalAlpha = Math.sin(Math.min(1, life) * Math.PI);
    ctx.fillStyle = '#FFF5C7';
    ctx.font = `800 ${Math.max(13, cell * .55)}px "Baloo 2", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+1', board.x + f.x * cell, board.y + f.y * cell);
  }
  ctx.globalAlpha = 1;
}

function roundedRectPath(x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loop(t) {
  if (!running) return;
  rafId = requestAnimationFrame(loop);
  if (paused) { lastT = t; return; }
  const dt = Math.min(100, t - lastT); lastT = t;
  acc += dt;
  while (acc >= tickMs) {
    acc -= tickMs;
    step();
    if (!running) return;
  }
  draw(t);
}

function gameOver() {
  if (!running) return;
  running = false;
  paused = false;
  cancelAnimationFrame(rafId);
  rafId = null;
  store.addTreats(treatsRun);
  store.setBestSpacer(treatsRun);
  $('#spacer-score').textContent = treatsRun;
  $('#spacer-gain').textContent = treatsRun;
  $('#spacer-best').textContent = store.s.best.spacer || 0;
  $('#spacer-best-over').textContent = store.s.best.spacer || 0;
  $('#btn-spacer-pause').classList.add('hidden');
  $('#spacer-pause').classList.add('hidden');
  $('#spacer-hint').classList.add('hide');
  $('#spacer-over').classList.remove('hidden');
  draw(performance.now());
}

function start() {
  resetGame();
  $('#spacer-start').classList.add('hidden');
  $('#spacer-over').classList.add('hidden');
  $('#spacer-pause').classList.add('hidden');
  $('#btn-spacer-pause').classList.remove('hidden');
  $('#spacer-hint').classList.remove('hide');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => $('#spacer-hint').classList.add('hide'), 3400);
  running = true; paused = false; lastT = performance.now();
  lastDrawT = lastT;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  cancelAnimationFrame(rafId);
  rafId = null;
  $('#spacer-pause').classList.remove('hidden');
  $('#btn-spacer-pause').classList.add('hidden');
  $('#spacer-hint').classList.add('hide');
  draw(performance.now());
}

function resumeGame() {
  if (!running || !paused) return;
  paused = false;
  $('#spacer-pause').classList.add('hidden');
  $('#btn-spacer-pause').classList.remove('hidden');
  lastT = performance.now();
  lastDrawT = lastT;
  rafId = requestAnimationFrame(loop);
}

function updateHud() {
  const scoreEl = $('#spacer-run-score');
  const levelEl = $('#spacer-level');
  if (scoreEl) scoreEl.textContent = treatsRun;
  if (levelEl) levelEl.textContent = level;
}

/* --- sterowanie swipe + klawiatura --- */
let tStart = null;
function bindInput() {
  cv.addEventListener('touchstart', e => {
    tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  cv.addEventListener('touchmove', e => {
    if (!tStart) return;
    const dx = e.touches[0].clientX - tStart.x;
    const dy = e.touches[0].clientY - tStart.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    pushDir(Math.abs(dx) > Math.abs(dy)
      ? { x: Math.sign(dx), y: 0 }
      : { x: 0, y: Math.sign(dy) });
    tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('keydown', e => {
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && running) {
      e.preventDefault();
      if (paused) resumeGame(); else pauseGame();
      return;
    }
    const m = {
      ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1},
      ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
      w: {x:0,y:-1}, s: {x:0,y:1}, a: {x:-1,y:0}, d: {x:1,y:0},
    };
    if (m[e.key] && running && !paused) {
      e.preventDefault();
      pushDir(m[e.key]);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !paused) pauseGame();
  });
}

function pushDir(d) {
  if (!running || paused) return;
  if (nextDirs.length < 3) nextDirs.push(d);
}

export function initSpacer({ onScreen }) {
  cv = $('#spacer-canvas');
  ctx = cv.getContext('2d');
  headImg = new Image();
  headImg.src = DALIA.topDown;
  headImg.addEventListener('load', () => {
    if (!running && snake) draw(performance.now());
  });

  $('#btn-spacer-go').addEventListener('click', start);
  $('#btn-spacer-again').addEventListener('click', start);
  $('#btn-spacer-pause').addEventListener('click', pauseGame);
  $('#btn-spacer-resume').addEventListener('click', resumeGame);
  bindInput();
  window.addEventListener('resize', resize);

  onScreen('screen-spacer', {
    onEnter() {
      resetGame();
      resize();
      running = false;
      paused = false;
      draw(0);
      $('#spacer-best').textContent = store.s.best.spacer || 0;
      $('#spacer-best-over').textContent = store.s.best.spacer || 0;
      $('#spacer-start').classList.remove('hidden');
      $('#spacer-over').classList.add('hidden');
      $('#spacer-pause').classList.add('hidden');
      $('#btn-spacer-pause').classList.add('hidden');
      $('#spacer-hint').classList.add('hide');
      $('#treats-spacer').textContent = store.s.treats;
    },
    onLeave() {
      running = false;
      paused = false;
      clearTimeout(hintTimer);
      cancelAnimationFrame(rafId);
      rafId = null;
    },
  });
}

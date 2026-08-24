// game-platform.js — Dalia Skacze: mobilny endless runner po trawiastych platformach
import { store } from './store.js';

const $ = (s) => document.querySelector(s);

let cv, ctx, wrap, dogSprite;
let W = 390, H = 700, dpr = 1, rafId = 0, lastT = 0;
let state = 'ready';
let dog, platforms = [], bones = [];
let distance = 0, score = 0, boneCount = 0, shownScore = -1;
let jumpBuffer = 0, coyote = 0, nextPlatformId = 0;

const GRAVITY = 1550;
const JUMP_V = -650;
const COYOTE_TIME = .11;
const BUFFER_TIME = .13;

function groundY() {
  return H - Math.max(88, Math.min(116, H * .145));
}

function dogSize() {
  const w = Math.min(116, Math.max(88, W * .27));
  return { w, h: w * .76 };
}

function resize() {
  const rect = cv.getBoundingClientRect();
  const oldGround = groundY();
  W = Math.max(280, rect.width);
  H = Math.max(410, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const newGround = groundY();
  const shift = newGround - oldGround;
  platforms.forEach(p => { p.top += shift; });
  bones.forEach(b => { b.y += shift; });
  if (dog) {
    dog.x = W * .26;
    dog.y += shift;
    if (dog.grounded) dog.y = newGround - dog.h;
  }
  if (state !== 'playing') draw(performance.now());
}

function resetWorld() {
  const size = dogSize();
  distance = 0;
  score = 0;
  boneCount = 0;
  shownScore = -1;
  jumpBuffer = 0;
  coyote = COYOTE_TIME;
  nextPlatformId = 0;
  dog = {
    x: W * .26,
    y: groundY() - size.h,
    vy: 0,
    w: size.w,
    h: size.h,
    grounded: true,
  };
  platforms = [{
    id: nextPlatformId++,
    x: -240,
    w: W + 510,
    top: groundY(),
  }];
  bones = [{
    x: dog.x + 175,
    y: groundY() - 40,
    r: 15,
    collected: false,
    phase: 0,
  }];
  fillWorld();
  updateHud(true);
}

function difficulty() {
  return Math.min(1, distance / 6500);
}

function speed() {
  return 190 + difficulty() * 82;
}

function fillWorld() {
  let last = platforms[platforms.length - 1];
  while (last.x + last.w < distance + W * 2.3) {
    const hard = difficulty();
    const gap = 78 + Math.random() * (32 + hard * 25);
    const width = Math.max(205, 370 - hard * 95 + Math.random() * 120);
    const p = {
      id: nextPlatformId++,
      x: last.x + last.w + gap,
      w: width,
      top: groundY(),
    };
    platforms.push(p);

    const count = Math.random() < .42 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const high = Math.random() < .44;
      bones.push({
        x: p.x + p.w * ((i + 1) / (count + 1)),
        y: p.top - (high ? 103 : 41),
        r: 15,
        collected: false,
        phase: Math.random() * Math.PI * 2,
      });
    }
    if (Math.random() < .34) {
      bones.push({
        x: last.x + last.w + gap * .52,
        y: p.top - 101,
        r: 15,
        collected: false,
        phase: Math.random() * Math.PI * 2,
      });
    }
    last = p;
  }
}

function platformAt(worldX) {
  return platforms.find(p => worldX >= p.x + 4 && worldX <= p.x + p.w - 4);
}

function requestJump() {
  if (state !== 'playing') return;
  jumpBuffer = BUFFER_TIME;
  if (dog.grounded || coyote > 0) doJump();
}

function doJump() {
  dog.vy = JUMP_V;
  dog.grounded = false;
  coyote = 0;
  jumpBuffer = 0;
}

function start() {
  resetWorld();
  state = 'playing';
  $('#platform-start').classList.add('hidden');
  $('#platform-over').classList.add('hidden');
  $('#btn-platform-jump').classList.remove('hidden');
  lastT = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function gameOver() {
  if (state !== 'playing') return;
  state = 'over';
  cancelAnimationFrame(rafId);
  store.setBestPlatform(score);
  $('#platform-final').textContent = score;
  $('#platform-final-bones').textContent = boneCount;
  $('#platform-best').textContent = store.s.best.platform || 0;
  $('#platform-over').classList.remove('hidden');
  $('#btn-platform-jump').classList.add('hidden');
  draw(performance.now());
}

function stop() {
  cancelAnimationFrame(rafId);
  state = 'ready';
  $('#platform-over').classList.add('hidden');
  $('#platform-start').classList.remove('hidden');
  $('#btn-platform-jump').classList.add('hidden');
  resetWorld();
  draw(performance.now());
}

function update(dt) {
  const wasGrounded = dog.grounded;
  const previousBottom = dog.y + dog.h;
  distance += speed() * dt;
  jumpBuffer = Math.max(0, jumpBuffer - dt);

  if (dog.grounded) {
    coyote = COYOTE_TIME;
  } else {
    coyote = Math.max(0, coyote - dt);
  }

  dog.vy += GRAVITY * dt;
  dog.y += dog.vy * dt;
  dog.grounded = false;

  const worldFoot = distance + dog.x + dog.w * .5;
  const under = platformAt(worldFoot);
  if (under && dog.vy >= 0 && previousBottom <= under.top + 9 && dog.y + dog.h >= under.top) {
    dog.y = under.top - dog.h;
    dog.vy = 0;
    dog.grounded = true;
    coyote = COYOTE_TIME;
  } else if (wasGrounded && !under) {
    coyote = COYOTE_TIME;
  }

  if (jumpBuffer > 0 && (dog.grounded || coyote > 0)) doJump();

  collectBones();
  platforms = platforms.filter(p => p.x + p.w > distance - 260);
  bones = bones.filter(b => b.x > distance - 120 && !b.collected);
  fillWorld();

  score = Math.floor(distance / 18) + boneCount * 15;
  updateHud();
  if (dog.y > H + 24) gameOver();
}

function collectBones() {
  const hit = {
    x: distance + dog.x + dog.w * .15,
    y: dog.y + dog.h * .14,
    w: dog.w * .72,
    h: dog.h * .72,
  };
  for (const bone of bones) {
    if (bone.collected) continue;
    if (hit.x < bone.x + bone.r && hit.x + hit.w > bone.x - bone.r &&
        hit.y < bone.y + bone.r && hit.y + hit.h > bone.y - bone.r) {
      bone.collected = true;
      boneCount++;
    }
  }
}

function loop(t) {
  if (state !== 'playing') return;
  const dt = Math.min(.032, Math.max(0, (t - lastT) / 1000));
  lastT = t;
  update(dt);
  draw(t);
  if (state === 'playing') rafId = requestAnimationFrame(loop);
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  drawSky(t);
  drawScenery();
  drawPitDepth();
  drawPlatforms();
  drawBones(t);
  drawDog(t);
}

function drawSky(t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#8FD4ED');
  sky.addColorStop(.64, '#DDF0D6');
  sky.addColorStop(1, '#F7D99E');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,240,170,.86)';
  ctx.beginPath();
  ctx.arc(W - 58, 72, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.74)';
  for (let i = 0; i < 4; i++) {
    const loopW = W + 190;
    const x = ((i * 157 - distance * .12) % loopW + loopW) % loopW - 70;
    cloud(x, 72 + (i % 2) * 76, 22 + (i % 3) * 4);
  }

  ctx.fillStyle = '#AFC98C';
  ctx.beginPath();
  ctx.moveTo(0, groundY() - 62);
  for (let x = 0; x <= W + 36; x += 36) {
    const world = x + distance * .16;
    ctx.lineTo(x, groundY() - 58 - Math.sin(world * .018) * 24);
  }
  ctx.lineTo(W, groundY() + 14);
  ctx.lineTo(0, groundY() + 14);
  ctx.fill();

  if (state === 'ready') {
    ctx.fillStyle = 'rgba(74,52,42,.08)';
    ctx.fillRect(0, 0, W, H);
  }
}

function cloud(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r, y - r * .22, r * .78, 0, Math.PI * 2);
  ctx.arc(x + r * 1.72, y, r * .62, 0, Math.PI * 2);
  ctx.fill();
}

function drawScenery() {
  const gy = groundY();

  // Płot jest zakotwiczony w warstwie świata, więc przesuwa się bez przeskoków.
  const fenceScroll = distance * .24;
  const fenceStart = Math.floor((fenceScroll - 80) / 86) - 1;
  ctx.fillStyle = '#C8A875';
  ctx.fillRect(0, gy - 69, W, 7);
  ctx.fillRect(0, gy - 43, W, 7);
  for (let i = fenceStart; i < fenceStart + Math.ceil(W / 86) + 4; i++) {
    const x = i * 86 - fenceScroll;
    ctx.fillStyle = i % 2 ? '#A97C4D' : '#B78A57';
    roundRect(x, gy - 91, 12, 83, 4);
    ctx.fill();
    ctx.fillStyle = '#D3B889';
    ctx.beginPath();
    ctx.moveTo(x, gy - 91);
    ctx.lineTo(x + 6, gy - 100);
    ctx.lineTo(x + 12, gy - 91);
    ctx.fill();
  }

  // Drzewa i krzewy używają stałych indeksów świata oraz osobnej prędkości parallax.
  const treeScroll = distance * .48;
  const spacing = 205;
  const first = Math.floor((treeScroll - 100) / spacing) - 1;
  for (let i = first; i < first + Math.ceil(W / spacing) + 4; i++) {
    const x = i * spacing - treeScroll;
    const tall = i % 3 !== 0;
    if (tall) {
      ctx.fillStyle = '#795337';
      roundRect(x + 30, gy - 117, 13, 111, 5);
      ctx.fill();
      ctx.fillStyle = i % 2 ? '#668452' : '#718F58';
      ctx.beginPath();
      ctx.moveTo(x - 6, gy - 91);
      ctx.bezierCurveTo(x - 4, gy - 133, x + 21, gy - 155, x + 46, gy - 148);
      ctx.bezierCurveTo(x + 77, gy - 153, x + 94, gy - 122, x + 77, gy - 95);
      ctx.bezierCurveTo(x + 61, gy - 76, x + 10, gy - 72, x - 6, gy - 91);
      ctx.fill();
      ctx.fillStyle = 'rgba(190,211,132,.35)';
      ctx.beginPath();
      ctx.moveTo(x + 15, gy - 124);
      ctx.quadraticCurveTo(x + 40, gy - 146, x + 64, gy - 119);
      ctx.quadraticCurveTo(x + 39, gy - 127, x + 15, gy - 124);
      ctx.fill();
    } else {
      ctx.fillStyle = '#76965B';
      ctx.beginPath();
      ctx.moveTo(x - 8, gy - 7);
      ctx.quadraticCurveTo(x, gy - 53, x + 33, gy - 43);
      ctx.quadraticCurveTo(x + 55, gy - 69, x + 82, gy - 36);
      ctx.quadraticCurveTo(x + 99, gy - 20, x + 92, gy - 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#E9C56E';
      for (let k = 0; k < 3; k++) {
        const fx = x + 25 + k * 20;
        const fy = gy - 28 - (k % 2) * 9;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      }
    }
  }
}

function drawPitDepth() {
  const gy = groundY();
  const pit = ctx.createLinearGradient(0, gy, 0, H);
  pit.addColorStop(0, '#6F6957');
  pit.addColorStop(.16, '#574E43');
  pit.addColorStop(1, '#2F2930');
  ctx.fillStyle = pit;
  ctx.fillRect(0, gy, W, H - gy);

  ctx.fillStyle = 'rgba(174,196,154,.2)';
  ctx.fillRect(0, gy, W, 8);
}

function drawPlatforms() {
  for (const p of platforms) {
    const x = p.x - distance;
    if (x > W + 30 || x + p.w < -30) continue;
    const visibleX = Math.max(-10, x);
    const visibleW = Math.min(W + 20, x + p.w) - visibleX;

    const dirt = ctx.createLinearGradient(0, p.top, 0, H);
    dirt.addColorStop(0, '#9A663B');
    dirt.addColorStop(1, '#68452D');
    ctx.fillStyle = dirt;
    ctx.fillRect(visibleX, p.top, visibleW, H - p.top);

    ctx.save();
    ctx.beginPath();
    ctx.rect(visibleX, p.top + 12, visibleW, H - p.top - 12);
    ctx.clip();
    ctx.strokeStyle = 'rgba(74,43,27,.22)';
    ctx.lineWidth = 3;
    const textureStart = Math.floor((Math.max(distance, p.x) - p.x) / 58) * 58;
    for (let wx = p.x + textureStart; wx < p.x + p.w; wx += 58) {
      const xx = wx - distance;
      if (xx > W + 30) break;
      const yy = p.top + 34 + ((p.id * 23 + Math.floor((wx - p.x) / 58) * 17) % 74);
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx + 18, yy + 9);
      ctx.stroke();
    }
    ctx.restore();

    // Ciemniejsze ściany na obu krawędziach jasno pokazują początek przepaści.
    ctx.fillStyle = '#573622';
    if (x > -12 && x < W) ctx.fillRect(x, p.top + 8, 9, H - p.top);
    if (x + p.w > 0 && x + p.w < W + 12) ctx.fillRect(x + p.w - 9, p.top + 8, 9, H - p.top);

    ctx.fillStyle = '#6D8E49';
    roundRect(x, p.top - 8, p.w, 19, 8);
    ctx.fill();
    ctx.fillStyle = '#9EC66A';
    roundRect(x, p.top - 10, p.w, 10, 7);
    ctx.fill();

    ctx.fillStyle = '#B9D77F';
    for (let xx = x + 8; xx < x + p.w - 5; xx += 23) {
      ctx.beginPath();
      ctx.moveTo(xx, p.top - 9);
      ctx.lineTo(xx + 5, p.top - 18 - ((p.id + xx) % 5));
      ctx.lineTo(xx + 9, p.top - 8);
      ctx.fill();
    }
  }
}

function drawBones(t) {
  for (const bone of bones) {
    if (bone.collected) continue;
    const x = bone.x - distance;
    if (x < -35 || x > W + 35) continue;
    const bob = Math.sin(t / 210 + bone.phase) * 5;
    ctx.save();
    ctx.translate(x, bone.y + bob);
    ctx.rotate(Math.sin(t / 330 + bone.phase) * .16);
    ctx.shadowColor = 'rgba(74,52,42,.22)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#FFF7DC';
    ctx.strokeStyle = '#C9A76D';
    ctx.lineWidth = 2;
    ctx.fillRect(-13, -6, 26, 12);
    for (const [bx, by] of [[-13,-6],[-13,6],[13,-6],[13,6]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.strokeRect(-13, -6, 26, 12);
    ctx.restore();
  }
}

function drawDog(t) {
  if (!dog || !dogSprite) return;
  const angle = dog.grounded ? 0 : Math.max(-.14, Math.min(.16, dog.vy / 2500));
  const under = platformAt(distance + dog.x + dog.w * .5);

  if (under) {
    const air = Math.max(0, under.top - (dog.y + dog.h));
    const scale = Math.max(.38, 1 - air / 260);
    ctx.fillStyle = `rgba(53,35,24,${.2 * scale})`;
    ctx.beginPath();
    ctx.ellipse(dog.x + dog.w * .5, under.top + 3, dog.w * .39 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const spriteW = dog.w * 1.1;
  const spriteH = dog.h * 1.2;
  const left = dog.x + (dog.w - spriteW) / 2;
  const top = dog.y + dog.h - spriteH + (dog.grounded ? 2 : 0);
  dogSprite.style.width = `${spriteW}px`;
  dogSprite.style.height = `${spriteH}px`;
  dogSprite.style.opacity = state === 'playing' ? '1' : '0';
  dogSprite.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${angle}rad)`;
  dogSprite.classList.toggle('is-jumping', !dog.grounded);
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

function updateHud(force = false) {
  if (force || score !== shownScore) {
    $('#platform-score').textContent = score;
    $('#platform-bones').textContent = boneCount;
    shownScore = score;
  }
}

function bindInput() {
  cv.addEventListener('pointerdown', (e) => {
    if (state !== 'playing') return;
    e.preventDefault();
    requestJump();
  });
  $('#btn-platform-jump').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    requestJump();
  });
  window.addEventListener('keydown', (e) => {
    if (!$('#screen-platform').classList.contains('active')) return;
    if (e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyW') return;
    e.preventDefault();
    if (state === 'ready' || state === 'over') start();
    else requestJump();
  });
  $('#btn-platform-go').addEventListener('click', start);
  $('#btn-platform-again').addEventListener('click', start);
}

export function initPlatform({ onScreen }) {
  cv = $('#platform-canvas');
  ctx = cv.getContext('2d');
  wrap = $('.platform-wrap');
  dogSprite = $('#platform-dog-sprite');

  bindInput();
  resetWorld();
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  window.addEventListener('resize', resize);

  onScreen('screen-platform', {
    onEnter() {
      resize();
      $('#platform-best-start').textContent = store.s.best.platform || 0;
      stop();
    },
    onLeave() { stop(); },
  });

  window.__platform = {
    state: () => state,
    score: () => score,
    jump: requestJump,
    start,
    end: gameOver,
    snapshot: () => ({
      state, score, boneCount, distance,
      dog: dog && { x: dog.x, y: dog.y, vy: dog.vy, grounded: dog.grounded, w: dog.w, h: dog.h },
      platforms: platforms.map(p => ({ x: p.x - distance, w: p.w, top: p.top })),
      bones: bones.filter(b => !b.collected).map(b => ({ x: b.x - distance, y: b.y, r: b.r })),
    }),
    nearGap() {
      const worldFoot = distance + dog.x + dog.w * .5;
      const p = platforms.find(item => item.x + item.w > worldFoot + 80);
      if (p) distance = Math.max(0, p.x + p.w - dog.x - dog.w * .5 - 95);
    },
    nearBone() {
      const b = bones.find(item => !item.collected && item.x > distance + dog.x);
      if (b) {
        b.x = distance + dog.x + dog.w * .5;
        b.y = dog.y + dog.h * .5;
      }
    },
  };
}

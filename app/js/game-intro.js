// game-intro.js — retro intro: pseudo-3D jazda VW T1 (styl automatów lat 80.)
// Trasa: Trzebnica (ratusz) -> Warszawa (PKiN) -> Wrocław (most Grunwaldzki)
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- pixel-art helpers ---------- */
function pxCanvas(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  c.R = (x, y, w2, h2, col) => { c.fillStyle = col; c.fillRect(x, y, w2, h2); };
  return cv;
}

function flipH(cv) {
  const f = pxCanvas(cv.width, cv.height);
  const c = f.getContext('2d');
  c.translate(cv.width, 0); c.scale(-1, 1);
  c.drawImage(cv, 0, 0);
  return f;
}

/* ---------- VW T1 — widok od tyłu (24x20) ---------- */
const BP = {
  K: '#2E2A27', C: '#F2E8C9', c: '#DFD2A6', B: '#9CC3D3', b: '#7EA9BC',
  G: '#7FA3B2', g: '#A9CBD6', W: '#F4F1E8', R: '#D95B43', Y: '#E8B54A',
  D: '#3A3634', S: '#B9BEC4',
};

function busRear() {
  const cv = pxCanvas(24, 20); const c = cv.getContext('2d'); const R = c.R;
  const { K, C, B, b, G, g, W, R: Rl, S } = BP;
  // dach (kremowy)
  R(7, 0, 10, 1, C); R(5, 1, 14, 1, C); R(3, 2, 18, 2, C); R(2, 4, 20, 1, C);
  // górna część nadwozia
  R(1, 5, 22, 3, C);
  R(1, 5, 1, 13, K); R(22, 5, 1, 13, K);
  // tylna szyba
  R(2, 8, 20, 1, K); R(2, 12, 20, 1, K);
  R(3, 9, 18, 3, G); R(4, 9, 4, 1, g);
  R(11, 8, 2, 5, K);
  // pas kremowy pod szybą
  R(1, 13, 22, 1, C);
  // niebieski pas + niebieski klin V do góry (jak w T1)
  R(1, 14, 22, 3, B); R(1, 17, 22, 1, b);
  R(1, 14, 5, 1, C); R(18, 14, 5, 1, C);
  R(1, 15, 2, 1, C); R(21, 15, 2, 1, C);
  // emblem VW
  R(11, 14, 2, 1, K); R(10, 15, 4, 2, K); R(11, 17, 2, 1, K); R(11, 15, 1, 1, S);
  // lampy
  R(2, 17, 3, 1, Rl); R(19, 17, 3, 1, Rl);
  // zderzak
  R(1, 18, 22, 1, W); R(2, 19, 20, 1, W);
  return cv;
}

/* ---------- VW T1 — widok z boku, przód w lewo (36x16) ---------- */
function busSide() {
  const cv = pxCanvas(36, 16); const c = cv.getContext('2d'); const R = c.R;
  const { K, C, c: Cs, B, b, G, g, W, R: Rl, Y, D, S } = BP;
  // dach
  R(8, 0, 24, 1, C); R(6, 1, 28, 1, C); R(5, 2, 29, 1, C);
  // nadwozie góra (krem)
  R(4, 3, 31, 6, C);
  R(3, 4, 1, 5, C); R(2, 6, 1, 4, C);
  // okna
  R(5, 4, 4, 3, G); R(11, 4, 4, 3, G); R(17, 4, 4, 3, G); R(23, 4, 4, 3, G); R(29, 4, 3, 3, G);
  R(6, 4, 2, 1, g);
  R(4, 3, 31, 1, Cs); R(4, 7, 31, 1, Cs);
  // listwa
  R(4, 8, 31, 1, K);
  // dół (niebieski)
  R(4, 9, 31, 4, B);
  R(4, 9, 4, 1, C); R(4, 10, 2, 1, C);
  R(13, 9, 1, 4, b); R(24, 9, 1, 4, b);
  // przód: reflektor + zderzak
  R(2, 7, 1, 1, Y); R(2, 10, 2, 2, W);
  // tył: krawędź + lampa + zderzak
  R(35, 4, 1, 9, C); R(35, 8, 1, 2, Rl); R(34, 10, 2, 2, W);
  // podwozie
  R(4, 13, 31, 1, K);
  // koła
  R(8, 12, 5, 4, D); R(9, 13, 3, 2, S);
  R(26, 12, 5, 4, D); R(27, 13, 3, 2, S);
  return cv;
}

/* ---------- KD Impuls (Koleje Dolnośląskie) — widok od tyłu (36x24, długi) ---------- */
function trainRear() {
  const cv = pxCanvas(36, 24); const c = cv.getContext('2d'); const R = c.R;
  const Wt = '#F4F6F2', w = '#DDE2E0', K = '#23262B', G = '#9FB6C8', g = '#C6D8E4',
    Y = '#F2C230', Rl = '#C2372F', D = '#3A3E44', S = '#9AA1A8';
  // dach
  R(2, 0, 32, 2, w); R(1, 2, 34, 1, S);
  // korpus biały
  R(1, 3, 34, 13, Wt);
  R(0, 3, 1, 13, w); R(35, 3, 1, 13, w);
  // czarna maska czołowa (zwężana)
  R(9, 4, 18, 1, K); R(8, 5, 20, 5, K);
  // szyba + odblask
  R(9, 5, 18, 4, G); R(10, 5, 8, 1, g);
  // logo KD (czerwone z białym znakiem)
  R(4, 11, 7, 3, Rl); R(5, 12, 1, 1, Wt); R(8, 12, 1, 1, Wt);
  // tablica kierunkowa
  R(14, 11, 14, 2, K); R(16, 11, 7, 1, g);
  // żółta fala KD (wznosi się ku prawej)
  R(1, 15, 15, 2, Y); R(16, 14, 11, 2, Y); R(27, 13, 7, 2, Y);
  // ciemna spodnica + swiatla (tylne = czerwone)
  R(1, 17, 34, 2, K);
  R(3, 17, 4, 1, Rl); R(29, 17, 4, 1, Rl);
  // wózek + koła
  R(3, 19, 30, 2, D);
  R(5, 21, 6, 3, D); R(25, 21, 6, 3, D);
  R(6, 22, 4, 1, S); R(26, 22, 4, 1, S);
  return cv;
}

/* ---------- drzewo liściaste (16x20) ---------- */
function sprTree() {
  const cv = pxCanvas(16, 20); const c = cv.getContext('2d'); const R = c.R;
  const D = '#4E7C3A', d = '#5E9445', h = '#74AC55', T = '#6B452C', t = '#7E5537';
  // korona
  R(4, 0, 8, 2, D); R(2, 2, 12, 3, D); R(1, 5, 14, 5, D); R(2, 10, 12, 3, D);
  R(5, 1, 6, 2, d); R(3, 3, 9, 4, d); R(3, 8, 11, 3, d);
  R(4, 3, 5, 3, h); R(6, 2, 3, 1, h);
  // pień
  R(7, 13, 2, 6, T); R(7, 13, 1, 6, t);
  return cv;
}

/* deterministyczny pseudo-los (stabilny między klatkami) */
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- sosna (14x22) ---------- */
function sprPine() {
  const cv = pxCanvas(14, 22); const c = cv.getContext('2d'); const R = c.R;
  const D = '#2E6644', d = '#3B7A52', T = '#6B452C';
  R(6, 0, 2, 2, D);
  R(5, 2, 4, 2, D); R(6, 2, 1, 2, d);
  R(4, 4, 6, 3, D); R(5, 4, 2, 3, d);
  R(3, 7, 8, 3, D); R(4, 7, 3, 3, d);
  R(2, 10, 10, 3, D); R(3, 10, 4, 3, d);
  R(1, 13, 12, 3, D); R(2, 13, 5, 3, d);
  R(2, 16, 10, 2, D); R(3, 16, 4, 2, d);
  R(6, 18, 2, 4, T);
  return cv;
}

/* ---------- kęps pszenicy (12x14) ---------- */
function sprWheat() {
  const cv = pxCanvas(12, 14); const c = cv.getContext('2d'); const R = c.R;
  const Y = '#EFC94C', y = '#D9AC38', O = '#B9862B';
  // kłosy
  R(1, 0, 2, 4, Y); R(4, 1, 2, 4, Y); R(7, 0, 2, 4, Y); R(9, 2, 2, 3, Y);
  // źdźbła
  R(2, 4, 1, 8, y); R(5, 5, 1, 8, y); R(8, 4, 1, 8, y); R(10, 5, 1, 7, y);
  R(3, 6, 1, 7, O); R(6, 7, 1, 6, O); R(9, 6, 1, 7, O);
  // podstawa
  R(2, 12, 9, 2, O);
  return cv;
}

/* ---------- krzak z jagodami (14x10) ---------- */
function sprBush() {
  const cv = pxCanvas(14, 10); const c = cv.getContext('2d'); const R = c.R;
  const D = '#4E7C3A', d = '#5E9445', B = '#D95B43';
  R(4, 0, 6, 2, D); R(2, 2, 10, 3, D); R(0, 4, 14, 3, D); R(2, 7, 10, 2, d);
  R(5, 1, 3, 2, d); R(3, 3, 5, 2, d);
  R(3, 4, 1, 1, B); R(9, 2, 1, 1, B); R(11, 5, 1, 1, B);
  return cv;
}

/* ---------- głaz (12x8) ---------- */
function sprRock() {
  const cv = pxCanvas(12, 8); const c = cv.getContext('2d'); const R = c.R;
  const L = '#A8ADB3', M = '#8E949A', D = '#6E747A';
  R(3, 0, 6, 1, L); R(1, 1, 9, 3, L); R(0, 3, 12, 3, M); R(1, 6, 10, 1, D);
  R(2, 1, 3, 1, '#C4C9CE');
  return cv;
}

/* ---------- KD Impuls — wagon środkowy (36x24, długi) ---------- */
function trainCar() {
  const cv = pxCanvas(36, 24); const c = cv.getContext('2d'); const R = c.R;
  const Wt = '#F4F6F2', w = '#DDE2E0', K = '#23262B', G = '#9FB6C8', g = '#C6D8E4',
    Y = '#F2C230', D = '#3A3E44', S = '#9AA1A8';
  // dach
  R(2, 0, 32, 2, w); R(1, 2, 34, 1, S);
  // korpus biały
  R(1, 3, 34, 13, Wt);
  R(0, 3, 1, 13, w); R(35, 3, 1, 13, w);
  // pas okien
  R(3, 6, 30, 3, K);
  R(4, 6, 5, 2, G); R(11, 6, 5, 2, G); R(20, 6, 5, 2, G); R(27, 6, 5, 2, G);
  R(4, 6, 1, 1, g); R(27, 6, 1, 1, g);
  // drzwi z małymi szybami
  R(10, 9, 3, 7, w); R(23, 9, 3, 7, w);
  R(10, 10, 3, 2, G); R(23, 10, 3, 2, G);
  // żółta fala KD
  R(1, 15, 15, 2, Y); R(16, 14, 11, 2, Y); R(27, 13, 7, 2, Y);
  // spodnica
  R(1, 17, 34, 2, K);
  // wózek + koła
  R(3, 19, 30, 2, D);
  R(5, 21, 6, 3, D); R(25, 21, 6, 3, D);
  R(6, 22, 4, 1, S); R(26, 22, 4, 1, S);
  return cv;
}

/* ---------- Ratusz w Trzebnicy (34x30) ---------- */
function sprRatusz() {
  const cv = pxCanvas(34, 30); const c = cv.getContext('2d'); const R = c.R;
  const Wt = '#F7F1E2', w = '#E7DCC4', Rf = '#C2472F', r = '#A63A28',
    K = '#3A2E28', F = '#FDFBF2', E = '#E3D5B8', G = '#5B4A3E',
    S = '#C9C2B4', s = '#B8B1A4';
  // główny blok
  R(11, 10, 22, 20, Wt);
  R(33, 10, 1, 20, w);
  R(11, 27, 22, 3, E);
  // dach głównego bloku
  R(11, 7, 22, 3, Rf); R(12, 6, 20, 1, Rf); R(11, 9, 22, 1, r);
  // wieża zegarowa
  R(3, 6, 8, 24, Wt); R(10, 6, 1, 24, w); R(3, 27, 8, 3, E);
  R(6, 0, 2, 1, Rf); R(5, 1, 4, 1, Rf); R(4, 2, 6, 2, Rf); R(3, 4, 8, 2, r);
  R(3, 6, 8, 1, r);
  // zegar
  R(4, 9, 7, 5, r);
  R(5, 10, 5, 3, F);
  R(7, 10, 1, 2, K); R(8, 11, 1, 1, K);
  // ryzalit (szczyt) z 3 oknami
  R(17, 4, 12, 6, Wt);
  R(16, 3, 14, 1, Rf); R(18, 2, 10, 1, Rf); R(21, 1, 4, 1, Rf);
  R(18, 5, 2, 1, K); R(22, 5, 2, 1, K); R(26, 5, 2, 1, K);
  R(18, 6, 2, 2, G); R(22, 6, 2, 2, G); R(26, 6, 2, 2, G);
  // okna fasady (2 kolumny x 3 rzędy)
  [13, 18, 23].forEach((y) => { R(13, y, 2, 3, G); R(30, y, 2, 3, G); });
  // wejście + schody
  R(21, 24, 4, 1, K); R(21, 25, 4, 5, K);
  R(19, 28, 8, 1, S); R(18, 29, 10, 1, s);
  return cv;
}

/* ---------- Pałac Kultury i Nauki (26x34) ---------- */
function sprPkin() {
  const cv = pxCanvas(26, 34); const c = cv.getContext('2d'); const R = c.R;
  const S = '#D9CDB0', s = '#C4B896', K = '#8A7F68', k = '#6E6450';
  // iglica
  R(12, 0, 2, 2, k); R(12, 2, 2, 3, S);
  // korona
  R(10, 5, 6, 3, S); R(10, 5, 6, 1, s);
  R(9, 8, 8, 2, S);
  // górny człon
  R(9, 10, 8, 6, S); R(9, 10, 8, 1, s);
  [10, 12, 14].forEach((x) => R(x, 11, 1, 4, K));
  // środkowy człon
  R(6, 16, 14, 8, S); R(6, 16, 14, 1, s);
  R(6, 20, 14, 1, s);
  [7, 9, 11, 13, 15, 17].forEach((x) => R(x, 17, 1, 6, K));
  // cokół
  R(3, 24, 20, 10, S); R(3, 24, 20, 1, s);
  for (let x = 5; x <= 21; x += 2) R(x, 25, 1, 7, K);
  R(10, 28, 6, 1, s); R(11, 30, 4, 4, k);
  // skrzydła boczne
  R(0, 28, 3, 6, S); R(23, 28, 3, 6, S);
  R(1, 29, 1, 3, K); R(24, 29, 1, 3, K);
  return cv;
}

/* ---------- Most Grunwaldzki (36x22) ---------- */
function sprMost() {
  const cv = pxCanvas(36, 22); const c = cv.getContext('2d'); const R = c.R;
  const N = '#3F6FA8', n = '#32598A', D = '#9AA1A8', d = '#7F868D',
    Wt = '#7FA7B5', w = '#A9CBD6';
  // pylony (portale)
  const py = (x) => { R(x, 4, 4, 2, N); R(x, 6, 1, 7, N); R(x + 3, 6, 1, 7, n); };
  py(8); py(24);
  // liny nośne — lewe
  [[0, 12], [1, 11], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7], [7, 6], [8, 5], [9, 4]]
    .forEach(([x, y]) => R(x, y, 1, 1, N));
  // lina środkowa (wisi)
  const mid = [[10, 5], [11, 6], [12, 6], [13, 7], [14, 8], [15, 8], [16, 9], [17, 9],
    [18, 9], [19, 9], [20, 8], [21, 8], [22, 7], [23, 6]];
  mid.forEach(([x, y]) => { R(x, y, 1, 1, N); if (y < 11) R(x, y, 1, 12 - y, n); });
  // liny prawe
  [[24, 4], [25, 5], [26, 6], [27, 7], [28, 8], [29, 9], [30, 10], [31, 10], [32, 11],
    [33, 11], [34, 12], [35, 12]].forEach(([x, y]) => R(x, y, 1, 1, N));
  // pomost
  R(0, 12, 36, 1, d); R(0, 13, 36, 3, D); R(0, 16, 36, 2, d);
  // autka
  R(5, 14, 2, 1, '#D95B43'); R(14, 13, 2, 1, '#F2E8C9');
  R(20, 14, 2, 1, '#E8B54A'); R(29, 13, 2, 1, '#F4F1E8');
  // woda + odbicia
  R(0, 18, 36, 4, Wt);
  R(2, 19, 3, 1, w); R(9, 20, 3, 1, w); R(16, 19, 3, 1, w); R(24, 20, 3, 1, w); R(31, 19, 2, 1, w);
  R(9, 18, 1, 3, n); R(25, 18, 1, 3, n);
  return cv;
}

/* ---------- retro słońce w pasy ---------- */
function makeSun() {
  const cv = pxCanvas(80, 80); const c = cv.getContext('2d');
  c.fillStyle = '#F5B93E'; c.beginPath(); c.arc(40, 40, 36, 0, 7); c.fill();
  c.fillStyle = '#FFD84D'; c.beginPath(); c.arc(40, 40, 31, 0, 7); c.fill();
  c.globalCompositeOperation = 'destination-out';
  c.fillRect(0, 46, 80, 3); c.fillRect(0, 55, 80, 4); c.fillRect(0, 64, 80, 6);
  c.globalCompositeOperation = 'source-over';
  return cv;
}

/* ---------- znak drogowy (biały napis na zielonym) ---------- */
function makeSign(txt) {
  const cv = pxCanvas(84, 32); const c = cv.getContext('2d'); const R = c.R;
  R(40, 20, 4, 12, '#8A9096'); R(40, 20, 1, 12, '#A7ADB3');
  R(0, 0, 84, 20, '#EDEFEA');
  R(2, 2, 80, 16, '#0E7A3E');
  c.fillStyle = '#FFFFFF';
  c.font = '8px "Press Start 2P", monospace';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(txt, 42, 11);
  return cv;
}

/* ---------- billboardy ze zdjęciami (rama pixel-art, foto bez pikselozy) ---------- */
const BB_PHOTOS = [
  { src: 'assets/img/billboards/goggles.jpg' },
  { src: 'assets/img/billboards/couple.jpg' },
  { src: 'assets/img/billboards/theater.jpg' },
  { src: 'assets/img/billboards/kayak.jpg' },
  { src: 'assets/img/billboards/heart.jpg' },
];

function shuffleSeed(arr, seed) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(hash(seed + i * 19) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBillboardSlots() {
  const n = BB_PHOTOS.length;
  const order = [
    ...shuffleSeed([...Array(n).keys()], 4),
    ...shuffleSeed([...Array(n).keys()], 11),
  ];
  // od początku trasy, omijając znaki i zabytki
  const zs = [38, 95, 250, 325, 510, 585, 775];
  return zs.map((z, i) => ({
    z,
    side: (i % 2 === 0 ? 1 : -1) * (hash(i + 3) > 0.82 ? -1 : 1),
    idx: order[i % order.length],
  }));
}
const BB_SLOTS = buildBillboardSlots();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(src));
    im.src = src;
  });
}

function loadBillboardPhotos() {
  return Promise.all(BB_PHOTOS.map((p) => loadImage(p.src).then((img) => {
    p.img = img;
    const ar = img.width / img.height;
    p.bh = ar < 1 ? 3.15 : 2.22;
    p.bw = p.bh * ar;
  }).catch((e) => console.warn('billboard:', e)))).then(() => {
    billboardsReady = BB_PHOTOS.some((p) => p.img);
  });
}

function drawCover(c, img, dx, dy, dw, dh) {
  const ir = img.width / img.height, tr = dw / dh;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / tr;
    sy = (img.height - sh) / 2;
  }
  c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawBillboard(it, x, gy, s) {
  const p = BB_PHOTOS[it.idx];
  if (!p || !p.img) return;
  const w = p.bw * s, h = p.bh * s;
  const frame = Math.max(2, 0.10 * s);
  const postW = Math.max(2, 0.09 * s);
  const postH = h + frame + 0.28 * s;
  const fx = x - w / 2, fy = gy - h;
  ctx.fillStyle = 'rgba(40,60,30,.22)';
  ctx.beginPath(); ctx.ellipse(x, gy, w * 0.42, Math.max(1.5, h * 0.04), 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5C4638';
  ctx.fillRect(x - w * 0.36, gy - postH, postW, postH);
  ctx.fillRect(x + w * 0.36 - postW, gy - postH, postW, postH);
  ctx.fillStyle = '#7A5E4A';
  ctx.fillRect(x - w * 0.36, gy - postH, Math.max(1, postW * 0.35), postH);
  ctx.fillRect(x + w * 0.36 - postW, gy - postH, Math.max(1, postW * 0.35), postH);
  const ox = fx - frame, oy = fy - frame;
  const ow = w + frame * 2, oh = h + frame * 2;
  ctx.fillStyle = '#2A2420'; ctx.fillRect(ox, oy, ow, oh);
  ctx.fillStyle = '#C9A15B';
  ctx.fillRect(ox + 1, oy + 1, ow - 2, oh - 2);
  ctx.fillStyle = '#2A2420'; ctx.fillRect(fx, fy, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawCover(ctx, p.img, fx, fy, w, h);
  ctx.imageSmoothingEnabled = false;
  const t = Math.max(1, 0.055 * s);
  ctx.fillStyle = '#E8B54A';
  ctx.fillRect(fx, fy, w, t);
  ctx.fillRect(fx, fy + h - t, w, t);
  ctx.fillRect(fx, fy, t, h);
  ctx.fillRect(fx + w - t, fy, t, h);
  const bulbs = p.bw > p.bh ? 7 : 5;
  const bs = Math.max(2, 0.08 * s);
  const by = oy - bs - 1;
  ctx.fillStyle = '#2A2420';
  ctx.fillRect(ox, by - 1, ow, bs + 2);
  for (let i = 0; i < bulbs; i++) {
    const bx = ox + (i + 0.5) * (ow / bulbs) - bs / 2;
    ctx.fillStyle = i % 2 ? '#E8B54A' : '#F5D76A';
    ctx.fillRect(bx, by, bs, bs);
  }
}

/* ---------- trasa ---------- */
const PLACES = [
  { name: 'TRZEBNICA', sub: 'RATUSZ', side: -1, z: 190, bw: 4.6, bh: 4.1, make: sprRatusz },
  { name: 'WARSZAWA', sub: 'PAŁAC KULTURY', side: 1, z: 450, bw: 4.0, bh: 5.3, make: sprPkin },
  { name: 'WROCŁAW', sub: 'MOST GRUNWALDZKI', side: -1, z: 710, bw: 6.8, bh: 4.2, make: sprMost },
];
const SIGN_W = 1.9, SIGN_BEFORE = 55;

/* ---------- stan ---------- */
const CAM_H = 1.9, ROAD_W = 0.80, SPEED = 36, DRAW_Z = 200, STRIPE = 8, RUMBLE = 4, ZBOOST = 0.65;
const SLOW = 15, SLOW_BEFORE = 100, SLOW_AFTER = 40; // strefa zwalniania przy zabytku
const BALLAST_HW = 0.55, TIE_HW = 0.40, TIE_GAP = 8, TIE_LEN = 3.4, RAIL_GAUGE = 0.42;
const CAR_W = 0.84, CAR_H = 0.56; // wagon: szerokość / wysokość w jednostkach świata
// rozsiane struktury 3D (jak drzewa): [typ, co ile m slot, seed hasha, szansa, offset od drogi, skala]
const SCATTER = [
  { kind: 't', gap: 27, seed: 0, keep: 0.74, off: [0.55, 2.45], sc: [0.75, 1.30] }, // drzewo liściaste
  { kind: 'p', gap: 31, seed: 101, keep: 0.55, off: [0.70, 2.60], sc: [0.80, 1.25] }, // sosna
  { kind: 'w', gap: 12, seed: 211, keep: 0.80, off: [0.25, 1.60], sc: [0.65, 1.05], clump: true }, // pszenica (kępy)
  { kind: 'u', gap: 37, seed: 307, keep: 0.62, off: [0.40, 2.20], sc: [0.70, 1.20] }, // krzak
  { kind: 'r', gap: 53, seed: 409, keep: 0.50, off: [0.35, 2.00], sc: [0.60, 1.10] }, // głaz
];
let cv, ctx, BUS_REAR, BUS_SIDE_L, BUS_SIDE_R, TRAIN_REAR, TRAIN_CAR, TREE, PINE, WHEAT, BUSH, ROCK, SUN;
let spritesReady = false, billboardsReady = false;
let vehicle = localStorage.getItem('dalia-veh') || 'bus';
let mode = 'title', camZ = 0, speed = 9, busX = 0, targetX = 0, steerV = 0;
let W = 390, H = 844, dpr = 1, FOCAL = 260, horizonY = 320;
let raf = null, lastT = 0, running = false, drag = false, finishTimer = null, flash = null, go = null;
let steerIn = 0, lastInputT = 0;
const keys = { l: false, r: false };
const clouds = [
  { x: 40, y: 52, w: 74 }, { x: 240, y: 96, w: 56 }, { x: 140, y: 150, w: 64 },
];

function sizeCanvas() {
  const r = cv.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  FOCAL = H * 0.31;
  horizonY = H * 0.38;
}

function reset() {
  camZ = 0; speed = 9; busX = 0; targetX = 0; steerV = 0; flash = null;
  for (const p of PLACES) p.passed = false;
}

/* ---------- render: niebo ---------- */
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, horizonY);
  g.addColorStop(0, '#5FB6E6'); g.addColorStop(1, '#C9EAF5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizonY + 1);
  if (SUN) ctx.drawImage(SUN, W * 0.7 - 40, horizonY - 92, 80, 80);
  const span = W + 180;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  for (const cl of clouds) {
    const x = (((cl.x - camZ * 0.06) % span) + span) % span - 90;
    ctx.fillRect(x, cl.y, cl.w, 10);
    ctx.fillRect(x + 8, cl.y - 8, cl.w * 0.55, 9);
  }
  ctx.fillStyle = '#A8C08A';
  ctx.beginPath(); ctx.ellipse(W * 0.16, horizonY + 2, W * 0.44, 30, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W * 0.86, horizonY + 2, W * 0.4, 22, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#93AC77';
  ctx.beginPath(); ctx.ellipse(W * 0.52, horizonY + 3, W * 0.52, 16, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7FA05F'; ctx.fillRect(0, horizonY, W, 2);
}

/* ---------- render: droga (scanline, prostokątny retro styl) ---------- */
function drawRoad() {
  const cx = W / 2;
  const train = vehicle === 'train';
  for (let y = Math.ceil(horizonY); y < H; y++) {
    const zRel = (CAM_H * FOCAL) / (y - horizonY);
    const z = camZ + zRel;
    const s = FOCAL / zRel;
    const st = Math.floor(z / STRIPE) % 2;
    ctx.fillStyle = st ? '#8FBF6B' : '#84B25F';
    ctx.fillRect(0, y, W, 1);
    if (train) {
      const bw = BALLAST_HW * s;
      ctx.fillStyle = st ? '#9C9C99' : '#94948F';
      ctx.fillRect(cx - bw, y, bw * 2, 1);
      if (z % TIE_GAP < TIE_LEN) {
        const tw = TIE_HW * s;
        ctx.fillStyle = '#5E4A38';
        ctx.fillRect(cx - tw, y, tw * 2, 1);
      }
      const rw = Math.max(1, 0.055 * s);
      for (const side of [-1, 1]) {
        const rx = cx + side * RAIL_GAUGE * 0.5 * s;
        ctx.fillStyle = '#70777D';
        ctx.fillRect(rx - rw, y, rw * 2, 1);
        ctx.fillStyle = '#E9ECEF';
        ctx.fillRect(rx - rw * 0.45, y, rw * 0.9, 1);
      }
      continue;
    }
    const half = ROAD_W * s;
    const rw = Math.max(2, half * 0.10);
    ctx.fillStyle = Math.floor(z / RUMBLE) % 2 ? '#C2472F' : '#EDEDE7';
    ctx.fillRect(cx - half - rw, y, rw, 1);
    ctx.fillRect(cx + half, y, rw, 1);
    ctx.fillStyle = st ? '#5A5A62' : '#55555D';
    ctx.fillRect(cx - half, y, half * 2, 1);
    const lw = Math.max(1, half * 0.045);
    ctx.fillStyle = 'rgba(240,240,232,.85)';
    ctx.fillRect(cx - half + lw, y, lw, 1);
    ctx.fillRect(cx + half - lw * 2, y, lw, 1);
    if (z % 12 < 4.4) {
      const cw = Math.min(5, Math.max(1, half * 0.04));
      ctx.fillRect(cx - cw, y, cw * 2, 1);
    }
  }
}

/* ---------- render: słupki, znaki i zabytki ---------- */
function vegHidesBillboard(z, side, kind) {
  // drzewa, sosny i krzaki zasłaniały zdjęcia — wycięcie korytarza po tej samej stronie
  if (kind !== 't' && kind !== 'p' && kind !== 'u') return false;
  return BB_SLOTS.some((s) => {
    if (s.side !== side) return false;
    const dz = s.z - z; // >0 = roślina bliżej kamery niż tablica
    return dz >= -22 && dz <= 52;
  });
}

function drawRoadside() {
  // słupki co 30 m (czuc prędkości)
  for (let z = Math.floor(camZ / 30) * 30; z < camZ + DRAW_Z; z += 30) {
    const zRel = z - camZ; if (zRel < 0.6) continue;
    const s = FOCAL / zRel;
    const y = horizonY + CAM_H * s;
    const ph = 0.5 * s, pw = Math.max(1, 0.07 * s);
    for (const side of [-1, 1]) {
      const x = W / 2 + side * (ROAD_W + 0.22) * s;
      ctx.fillStyle = '#9FA6AC'; ctx.fillRect(x - pw / 2, y - ph, pw, ph);
      ctx.fillStyle = '#EDEDE7'; ctx.fillRect(x - pw / 2, y - ph, pw, ph * 0.25);
    }
  }
  // znaki + zabytki + struktury 3D, od dalekich
  const items = [];
  for (const p of PLACES) {
    if (!p.spr) continue;
    items.push({ z: p.z, p, kind: 'b' });
    items.push({ z: p.z - SIGN_BEFORE, p, kind: 's' });
  }
  if (billboardsReady) {
    for (const slot of BB_SLOTS) {
      const p = BB_PHOTOS[slot.idx];
      if (!p || !p.img) continue;
      items.push({ kind: 'bb', z: slot.z, side: slot.side, idx: slot.idx, bw: p.bw, bh: p.bh });
    }
  }
  if (spritesReady) {
    for (const cfg of SCATTER) {
      const b = cfg.seed;
      for (let i = Math.floor((camZ - 20) / cfg.gap); i <= Math.floor((camZ + DRAW_Z) / cfg.gap); i++) {
        for (const side of [-1, 1]) {
          const sb = side === 1 ? b + 50 : b;
          if (hash(i * 2 + sb) > cfg.keep) continue;
          const z0 = i * cfg.gap;
          if (vegHidesBillboard(z0, side, cfg.kind)) continue;
          items.push({
            kind: cfg.kind, z: z0, side,
            off: cfg.off[0] + hash(i * 2 + sb + 7) * (cfg.off[1] - cfg.off[0]),
            sc: cfg.sc[0] + hash(i * 2 + sb + 13) * (cfg.sc[1] - cfg.sc[0]),
          });
          if (cfg.clump) { // pszenica rośnie w kępach po 1-3 kępsów
            const n = Math.floor(hash(i * 2 + sb + 29) * 3);
            for (let j = 1; j <= n; j++) {
              const zj = z0 + (hash(i * 7 + sb + j * 31) - 0.5) * cfg.gap * 0.8;
              if (vegHidesBillboard(zj, side, cfg.kind)) continue;
              items.push({
                kind: cfg.kind, side, z: zj,
                off: clamp(cfg.off[0] + hash(i * 7 + sb + j * 47) * (cfg.off[1] - cfg.off[0]), 0.2, 3),
                sc: cfg.sc[0] + hash(i * 7 + sb + j * 61) * (cfg.sc[1] - cfg.sc[0]),
              });
            }
          }
        }
      }
    }
  }
  // billboard trochę „bliżej” w sortowaniu, żeby resztki roślin nie malowały się na zdjęciu
  items.sort((a, b) => {
    const za = a.z - (a.kind === 'bb' ? 10 : 0);
    const zb = b.z - (b.kind === 'bb' ? 10 : 0);
    return zb - za;
  });
  for (const it of items) {
    const boosted = it.kind === 's' || it.kind === 'b' || it.kind === 'bb';
    const zRel = (it.z - camZ) * (boosted ? ZBOOST : 1);
    if (zRel > DRAW_Z * ZBOOST || zRel < 1.2) continue;
    const s = FOCAL / zRel;
    const gy = horizonY + CAM_H * s;
    let x;
    if (it.kind === 's') x = W / 2 + it.p.side * (ROAD_W + 1.1) * s;
    else if (it.kind === 'b') x = W / 2 + it.p.side * (ROAD_W + 0.6 + it.p.bw / 2) * s;
    else if (it.kind === 'bb') x = W / 2 + it.side * (ROAD_W + 0.65 + it.bw / 2) * s;
    else x = W / 2 + it.side * (ROAD_W + it.off) * s;
    let w, h;
    switch (it.kind) {
      case 't': // drzewo liściaste
        w = 1.35 * it.sc * s; h = 1.7 * it.sc * s;
        ctx.fillStyle = 'rgba(40,60,30,.22)';
        ctx.beginPath(); ctx.ellipse(x, gy, w * 0.45, Math.max(1, h * 0.05), 0, 0, 7); ctx.fill();
        ctx.drawImage(TREE, x - w / 2, gy - h, w, h);
        break;
      case 'p': // sosna
        w = 1.15 * it.sc * s; h = 1.95 * it.sc * s;
        ctx.fillStyle = 'rgba(40,60,30,.22)';
        ctx.beginPath(); ctx.ellipse(x, gy, w * 0.4, Math.max(1, h * 0.04), 0, 0, 7); ctx.fill();
        ctx.drawImage(PINE, x - w / 2, gy - h, w, h);
        break;
      case 'w': // kęps pszenicy
        w = 0.55 * it.sc * s; h = 0.68 * it.sc * s;
        ctx.drawImage(WHEAT, x - w / 2, gy - h, w, h);
        break;
      case 'u': // krzak
        w = 0.95 * it.sc * s; h = 0.68 * it.sc * s;
        ctx.fillStyle = 'rgba(40,60,30,.18)';
        ctx.beginPath(); ctx.ellipse(x, gy, w * 0.42, Math.max(1, h * 0.06), 0, 0, 7); ctx.fill();
        ctx.drawImage(BUSH, x - w / 2, gy - h, w, h);
        break;
      case 'r': // głaz
        w = 0.6 * it.sc * s; h = 0.4 * it.sc * s;
        ctx.drawImage(ROCK, x - w / 2, gy - h, w, h);
        break;
      case 'bb':
        drawBillboard(it, x, gy, s);
        break;
      case 's': {
        w = SIGN_W * s; h = w * (it.p.sign.height / it.p.sign.width);
        ctx.drawImage(it.p.sign, x - w / 2, gy - h, w, h);
        break;
      }
      default: { // zabytek
        w = it.p.bw * s; h = it.p.bh * s;
        ctx.fillStyle = 'rgba(40,60,30,.25)';
        ctx.beginPath(); ctx.ellipse(x, gy, w * 0.45, Math.max(2, h * 0.04), 0, 0, 7); ctx.fill();
        ctx.drawImage(it.p.spr, x - w / 2, gy - h, w, h);
      }
    }
  }
}

/* ---------- render: wagony składu (przed wagonem tylnym) ---------- */
const CAR_N = 5; // dłuższy skład: pięć wagonów przed wagonem tylnym
function drawTrainCars(t) {
  if (vehicle !== 'train' || !TRAIN_CAR) return;
  // kolejne wagoniki o tyle dalej, żeby na ekranie tworzyły sprzęgnięty skład
  const k = CAM_H / (CAM_H - CAR_H);
  for (let n = CAR_N; n >= 1; n--) {
    const zRel = 1.7 * Math.pow(k, n);
    const s = FOCAL / zRel;
    const gy = horizonY + CAM_H * s;
    const bob = Math.sin(t * 0.02 + n * 1.9) * 0.8;
    const w = CAR_W * s, h = CAR_H * s;
    ctx.fillStyle = 'rgba(30,40,20,.28)';
    ctx.beginPath(); ctx.ellipse(W / 2, gy + 2, w * 0.55, Math.max(1.5, h * 0.05), 0, 0, 7); ctx.fill();
    ctx.drawImage(TRAIN_CAR, W / 2 - w / 2, gy - h + bob, w, h);
  }
}

/* ---------- render: VW T1 ---------- */
function drawBus(t) {
  const s = FOCAL / 1.7;
  const gy = horizonY + CAM_H * s;
  const bx = W / 2 + busX * s;
  const bob = Math.sin(t * 0.02) * 1.5;
  const sv = steerV;
  const isTrain = vehicle === 'train';
  let spr, rot;
  if (!isTrain && Math.abs(sv) > 0.5) {
    spr = sv > 0 ? BUS_SIDE_R : BUS_SIDE_L;
    rot = (Math.abs(sv) - 0.5) * 0.24 * Math.sign(sv);
  } else {
    spr = isTrain ? TRAIN_REAR : BUS_REAR;
    rot = sv * (isTrain ? 0.05 : 0.18);
  }
  const w = (spr === BUS_SIDE_L || spr === BUS_SIDE_R ? 1.0 : spr === TRAIN_REAR ? CAR_W : 0.5) * s;
  const h = w * (spr.height / spr.width);
  ctx.fillStyle = 'rgba(30,40,20,.3)';
  ctx.beginPath(); ctx.ellipse(bx, gy + 3, w * 0.55, 7, 0, 0, 7); ctx.fill();
  ctx.save();
  ctx.translate(bx, gy + bob);
  ctx.rotate(rot);
  ctx.drawImage(spr, -w / 2, -h, w, h);
  ctx.restore();
}

/* ---------- render: HUD ---------- */
function txt(str, x, y, size, col, align = 'center') {
  ctx.font = size + 'px "Press Start 2P", monospace';
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(20,24,40,.9)';
  ctx.fillText(str, x + 2, y + 2);
  ctx.fillStyle = col;
  ctx.fillText(str, x, y);
}

function drawHud(t) {
  if (mode === 'title') return;
  const next = PLACES.find((p) => !p.passed);
  if (next) {
    const d = Math.max(0, next.z - camZ);
    const ds = d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m';
    txt(next.name + '  ' + ds, W / 2, 30, 10, '#FFFFFF');
  }
  txt(Math.round(speed * 3.6) + ' km/h', 14, H - 18, 8, '#FFFFFF', 'left');
  if (flash) {
    const k = (t - flash.t0) / 1900;
    if (k < 1) {
      const a = k < 0.15 ? k / 0.15 : 1 - Math.max(0, k - 0.6) / 0.4;
      ctx.globalAlpha = clamp(a, 0, 1);
      txt('~ ' + flash.name + ' ~', W / 2, H * 0.3, 20, '#FFD84D');
      txt(flash.sub, W / 2, H * 0.3 + 26, 9, '#FFFFFF');
      ctx.globalAlpha = 1;
    } else flash = null;
  }
}

/* ---------- logika ---------- */
function update(dt, t) {
  let target = mode === 'title' ? 9 : mode === 'finish' ? 26 : SPEED;
  if (mode === 'drive') {
    const zone = PLACES.find((p) => camZ > p.z - SLOW_BEFORE && camZ < p.z + SLOW_AFTER);
    if (zone) target = SLOW;
  }
  speed += (target - speed) * Math.min(1, dt * 1.4);
  camZ += speed * dt;
  if (mode === 'drive') {
    if (vehicle === 'train') {
      targetX = 0;
      steerIn = 0;
    } else {
      if (keys.l) targetX -= 1.5 * dt;
      if (keys.r) targetX += 1.5 * dt;
      targetX = clamp(targetX, -0.55, 0.55);
      const idle = !keys.l && !keys.r && t - lastInputT > 700;
      if (idle) steerIn *= Math.max(0, 1 - dt * 5);
    }
  } else {
    steerIn = 0;
  }
  const prevX = busX;
  busX += (targetX - busX) * Math.min(1, dt * 7);
  const vx = (busX - prevX) / Math.max(dt, 0.001);
  const svTarget = steerIn !== 0 ? steerIn : clamp(vx / 1.1, -1, 1);
  steerV += (svTarget - steerV) * Math.min(1, dt * 10);
  for (const p of PLACES) {
    if (!p.passed && camZ > p.z - 1.2) {
      p.passed = true;
      flash = { name: p.name, sub: p.sub, t0: t };
    }
  }
  if (mode === 'drive' && camZ > PLACES[2].z + 170) finish();
}

function render(t) {
  drawSky();
  drawRoad();
  drawRoadside();
  drawTrainCars(t);
  if (BUS_REAR) drawBus(t);
  drawHud(t);
}

function loop(t) {
  if (!running) return;
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
  lastT = t;
  update(dt, t);
  render(t);
}

/* ---------- tryby ---------- */
function startDrive() {
  if (mode !== 'title') return;
  reset(); // START zawsze od początku trasy — animacja tytułowa niczego nie „przejeżdża"
  mode = 'drive';
  $('#intro-title').classList.add('hidden');
  $('#btn-intro-skip').classList.remove('hidden');
}

function finish() {
  mode = 'finish';
  $('#btn-intro-skip').classList.add('hidden');
  $('#intro-finish').classList.remove('hidden');
  finishTimer = setTimeout(toHub, 2600);
}

function toHub() {
  clearTimeout(finishTimer);
  go('screen-dalia-care');
}

/* ---------- sterowanie ---------- */
function bindInput() {
  const point = (e) => {
    const r = cv.getBoundingClientRect();
    targetX = clamp(((e.clientX - r.left) / r.width - 0.5) * 1.9, -0.55, 0.55);
    if (Math.abs(targetX - busX) > 0.06) {
      steerIn = Math.sign(targetX - busX);
      lastInputT = performance.now();
    }
  };
  cv.addEventListener('touchstart', (e) => point(e.touches[0]), { passive: true });
  cv.addEventListener('touchmove', (e) => point(e.touches[0]), { passive: true });
  cv.addEventListener('mousedown', (e) => { drag = true; point(e); });
  window.addEventListener('mousemove', (e) => { if (drag) point(e); });
  window.addEventListener('mouseup', () => { drag = false; });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.l = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.r = true;
    if (keys.l || keys.r) { steerIn = keys.r ? 1 : -1; lastInputT = performance.now(); }
    if ((e.key === 'Enter' || e.key === ' ') && mode === 'title') startDrive();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.l = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.r = false;
    steerIn = keys.r ? 1 : keys.l ? -1 : 0;
    lastInputT = performance.now();
  });
}

/* ---------- budowa sprite'ów (po załadowaniu fontu) ---------- */
function buildSprites() {
  BUS_REAR = busRear();
  BUS_SIDE_L = busSide();
  BUS_SIDE_R = flipH(BUS_SIDE_L);
  TRAIN_REAR = trainRear();
  TRAIN_CAR = trainCar();
  TREE = sprTree();
  PINE = sprPine();
  WHEAT = sprWheat();
  BUSH = sprBush();
  ROCK = sprRock();
  SUN = makeSun();
  for (const p of PLACES) { p.spr = p.make(); p.sign = makeSign(p.name); }
  spritesReady = true;
}

/* ---------- init ---------- */
export function initIntro({ onScreen, go: goFn }) {
  cv = $('#intro-canvas');
  ctx = cv.getContext('2d');
  go = goFn;
  const fontsReady = document.fonts?.ready || Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1600))]).then(buildSprites);
  loadBillboardPhotos();

  $('#btn-intro-start').addEventListener('click', startDrive);
  $('#btn-intro-skip').addEventListener('click', toHub);
  document.querySelectorAll('.veh-card').forEach((b) => {
    b.classList.toggle('selected', b.dataset.veh === vehicle);
    b.addEventListener('click', () => {
      vehicle = b.dataset.veh;
      localStorage.setItem('dalia-veh', vehicle);
      document.querySelectorAll('.veh-card').forEach((x) => x.classList.toggle('selected', x === b));
    });
  });
  bindInput();
  window.addEventListener('resize', sizeCanvas);
  // mini-hook do testów e2e (zrzuty puppeteer): odczyt pozycji/trybu + przeskoki trasy
  window.__intro = {
    z: () => Math.round(camZ),
    m: () => mode,
    warp: (v) => { camZ = v; },
    bb: () => ({ ready: billboardsReady, slots: BB_SLOTS.map((s) => ({ z: s.z, side: s.side, idx: s.idx })) }),
  };

  onScreen('screen-intro', {
    onEnter() {
      sizeCanvas();
      reset();
      mode = 'title';
      $('#intro-title').classList.remove('hidden');
      $('#intro-finish').classList.add('hidden');
      $('#btn-intro-skip').classList.add('hidden');
      running = true; lastT = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    },
    onLeave() {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
    },
  });
}

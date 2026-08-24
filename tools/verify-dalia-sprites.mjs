#!/usr/bin/env node
// verify-dalia-sprites.mjs — bramka jakości sprite'ów Dalii.
//
// Twardo odrzuca grafikę, która:
//   1) DOTYKA KRAWĘDZI kadru (nieprzezroczyste piksele przy brzegu = ucięcie)
//   2) NIE jest jedną spójną bryłą (porozrywane fragmenty jak stary expr-drool)
//   3) ma RESZTKI zielonego tła / halo (chroma residue)
//   4) ma podejrzanie mały fill (pusty/uszkodzony kadr)
//
// Zero zależności npm — korzysta z ImageMagick (magick), który jest w repo pipeline.
// Użycie:
//   node tools/verify-dalia-sprites.mjs                 (sprawdza app/assets/img/dalia-rig)
//   node tools/verify-dalia-sprites.mjs <dir-or-files>  (dowolne pliki/katalog)

import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DIR = join(ROOT, 'app/assets/img/dalia-rig');

// --- progi ---
const EDGE_ALPHA = 12;          // px alfa >tego uznajemy za "obecny piksel" (0..255)
const EDGE_MARGIN_MAXFILL = 0.004; // maks. udział krawędziowych pikseli, powyżej = ucięcie
const MIN_FILL = 0.03;          // min. udział niepustych pikseli w kadrze
const MAX_FILL = 0.92;          // max. udział (za dużo = tło nieusunięte)
const GREEN_MAX_FRAC = 0.002;   // maks. udział "zielonych" pikseli (chroma residue)
const BLOB_MAX_EXTRA = 0.02;    // dopuszczalny udział pikseli poza największą bryłą

function magick(args) {
  return execFileSync('magick', args, { encoding: 'binary', maxBuffer: 1 << 28 });
}
function identify(fmt, file) {
  return execFileSync('magick', ['identify', '-format', fmt, file], { encoding: 'utf8' }).trim();
}

// Zwraca surowe bajty alfy (grayscale) + wymiary.
function readAlpha(file) {
  const dims = identify('%w %h', file).split(' ').map(Number);
  const [w, h] = dims;
  const raw = execFileSync('magick', [file, '-alpha', 'extract', '-depth', '8', 'gray:-'],
    { maxBuffer: 1 << 28 });
  return { w, h, a: raw };
}

// Udział pikseli, których kolor jest "zielony ekranowy" (G wyraźnie > R i B).
function greenFraction(file) {
  // maska: G - max(R,B) > próg  ->  biały; policz średnią
  const out = execFileSync('magick', [
    file,
    '(', '+clone', '-channel', 'G', '-separate', '+channel', ')',
    '(', file, '-channel', 'R', '-separate', '+channel', ')',
    '(', file, '-channel', 'B', '-separate', '+channel', ')',
    '-delete', '0',
    '(', '-clone', '1', '-clone', '2', '-evaluate-sequence', 'max', ')',
    '-delete', '1,2',
    '-compose', 'minus_src', '-composite',
    '-threshold', '18%',
    // uwzględnij tylko piksele nieprzezroczyste
    '(', file, '-alpha', 'extract', '-threshold', '5%', ')',
    '-compose', 'multiply', '-composite',
    '-format', '%[fx:mean]', 'info:',
  ], { encoding: 'utf8' }).trim();
  return parseFloat(out) || 0;
}

function analyze(file) {
  const errs = [];
  const { w, h, a } = readAlpha(file);
  const N = w * h;
  let fill = 0;
  let edgeHits = 0;
  // bbox
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = a[y * w + x];
      if (v > EDGE_ALPHA) {
        fill++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edgeHits++;
      }
    }
  }
  const fillFrac = fill / N;
  const edgeFrac = edgeHits / (2 * (w + h));

  // 1) ucięcie na krawędzi
  if (edgeFrac > EDGE_MARGIN_MAXFILL) {
    errs.push(`UCIĘCIE: sylwetka dotyka krawędzi kadru (edgeFrac=${edgeFrac.toFixed(4)})`);
  }
  // bbox styka się z brzegiem?
  if (minX <= 0 || minY <= 0 || maxX >= w - 1 || maxY >= h - 1) {
    errs.push(`UCIĘCIE: bounding box dotyka brzegu (bbox=${minX},${minY}..${maxX},${maxY} w kadrze ${w}x${h})`);
  }
  // 2) fill w rozsądnym zakresie
  if (fillFrac < MIN_FILL) errs.push(`PUSTY/USZKODZONY: fill=${(fillFrac * 100).toFixed(1)}% < ${MIN_FILL * 100}%`);
  if (fillFrac > MAX_FILL) errs.push(`TŁO NIEUSUNIĘTE: fill=${(fillFrac * 100).toFixed(1)}% > ${MAX_FILL * 100}%`);

  // 3) spójność bryły — flood fill od najgęstszego punktu; policz odsetek poza największą bryłą
  const blobExtra = largestBlobExtra(a, w, h);
  if (blobExtra > BLOB_MAX_EXTRA) {
    errs.push(`FRAGMENTY: ${(blobExtra * 100).toFixed(1)}% pikseli poza główną bryłą (>${BLOB_MAX_EXTRA * 100}%)`);
  }

  // 4) zielone resztki
  const green = greenFraction(file);
  if (green > GREEN_MAX_FRAC) {
    errs.push(`CHROMA: pozostałości zielonego tła (${(green * 100).toFixed(2)}%)`);
  }

  return { w, h, fillFrac, edgeFrac, blobExtra, green, errs };
}

// BFS największej spójnej bryły w masce alfa; zwraca udział pikseli POZA nią.
function largestBlobExtra(a, w, h) {
  const N = w * h;
  const mask = new Uint8Array(N);
  let total = 0;
  for (let i = 0; i < N; i++) { if (a[i] > EDGE_ALPHA) { mask[i] = 1; total++; } }
  if (total === 0) return 0;
  // downsample dla szybkości przy dużych kadrach
  const step = Math.max(1, Math.floor(Math.sqrt(N) / 512));
  const visited = new Uint8Array(N);
  const stack = new Int32Array(N);
  let best = 0, seen = 0;
  for (let start = 0; start < N; start++) {
    if (!mask[start] || visited[start]) continue;
    let sp = 0; stack[sp++] = start; visited[start] = 1; let size = 0;
    while (sp > 0) {
      const p = stack[--sp]; size++;
      const x = p % w, y = (p / w) | 0;
      // 4-sąsiedztwo
      if (x > 0) { const q = p - 1; if (mask[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (x < w - 1) { const q = p + 1; if (mask[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (y > 0) { const q = p - w; if (mask[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (y < h - 1) { const q = p + w; if (mask[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
    }
    seen += size;
    if (size > best) best = size;
  }
  return (total - best) / total;
}

function collectFiles(target) {
  const files = [];
  if (statSync(target).isDirectory()) {
    for (const f of readdirSync(target)) {
      if (/\.(png|webp)$/i.test(f)) files.push(join(target, f));
    }
  } else {
    files.push(target);
  }
  return files.sort();
}

// --- main ---
const args = process.argv.slice(2);
const targets = args.length ? args.map(a => resolve(a)) : [DEFAULT_DIR];
let files = [];
for (const t of targets) {
  if (!existsSync(t)) { console.error(`Brak: ${t}`); process.exit(2); }
  files = files.concat(collectFiles(t));
}

let failed = 0;
console.log(`Sprawdzam ${files.length} plik(ów)...\n`);
for (const f of files) {
  const r = analyze(f);
  const name = basename(f);
  if (r.errs.length === 0) {
    console.log(`  OK   ${name}  (${r.w}x${r.h}, fill ${(r.fillFrac * 100).toFixed(1)}%)`);
  } else {
    failed++;
    console.log(`  FAIL ${name}`);
    for (const e of r.errs) console.log(`         - ${e}`);
  }
}
console.log('');
if (failed) {
  console.log(`BRAMKA: ${failed}/${files.length} plików odrzuconych.`);
  process.exit(1);
} else {
  console.log(`BRAMKA: wszystkie ${files.length} sprite'y przeszły.`);
}

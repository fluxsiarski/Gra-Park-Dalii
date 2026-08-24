// sw.js — cache-first service worker: gra działa offline po pierwszym wejściu
// CacheStorage jest wspólny dla całej domeny (np. zielvik.github.io), dlatego
// usuwamy wyłącznie cache należące do tej gry.
const CACHE_PREFIX = 'gra-park-dalii-';
const CACHE = `${CACHE_PREFIX}v27`;
const ASSETS = [
  './', './index.html', './manifest.json',
  './css/style.css', './css/dalia-care.css',
  './js/app.js', './js/data.js', './js/store.js', './js/svg.js',
  './js/game-spacer.js', './js/game-flappy.js', './js/game-platform.js', './js/przymierzalnia.js', './js/memory.js', './js/game-intro.js',
  './js/game-earth.js', './js/vendor/three.module.js', './js/vendor/three.core.js',
  './js/dalia-care.js', './js/dalia-care-store.js', './js/dalia-rig.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/img/earth/earth-blue-marble-2048.png',
  './assets/img/vehicles/vw-t1.jpeg', './assets/img/vehicles/kd-impuls.jpeg',
  './assets/img/billboards/goggles.jpg', './assets/img/billboards/couple.jpg',
  './assets/img/billboards/theater.jpg', './assets/img/billboards/kayak.jpg',
  './assets/img/billboards/heart.jpg',
  './assets/img/dalia/jetpack.png', './assets/img/dalia/platform-run.webp',
  './assets/img/dalia/platform-run.png', './assets/img/dalia/platform-jump.png',
  './assets/img/dalia/sit-front.png', './assets/img/dalia/sit-happy.png',
  './assets/img/dalia/expr-happy.png', './assets/img/dalia/expr-drool.png',
  './assets/img/dalia/expr-cry.png', './assets/img/dalia/expr-surprise.png',
  './assets/img/dalia/bow-low.png', './assets/img/dalia/sleep-curl.png',
  './assets/img/dalia/jump.png', './assets/img/dalia/head-tongue.png',
  './assets/img/dalia-rig/dalia-sit.png', './assets/img/dalia-rig/dalia-blink.png',
  './assets/img/dalia-rig/dalia-eat.png', './assets/img/dalia-rig/dalia-sad.png',
  './assets/img/dalia-rig/dalia-bow.png', './assets/img/dalia-rig/dalia-sleep.png',
  './assets/img/memory/food/chipsy-fromage.webp',
  './assets/img/memory/food/malinowe-przetwory.webp',
  './assets/img/memory/food/mcflurry.png',
  './assets/img/memory/food/chalwa.jpg',
  './assets/img/memory/food/yerbata-card.jpg',
  './assets/img/memory/photos-1670/img-5821-card.jpg',
  './assets/img/memory/photos-1670/img-5841-card.jpg',
  './assets/img/memory/featured/volkswagen.jpeg',
  './assets/img/memory/featured/karuzela.jpg',
  './assets/img/memory/featured/dalia-mokra.jpg',
  './assets/img/places/bulwar-wroclaw.jpg',
  './assets/img/places/karuzela-park.jpg',
  './assets/img/places/teatr-lalek-jesien.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Wideo korzysta z zapytań Range — odtwarzamy je bezpośrednio z sieci.
  if (e.request.headers.has('range') || new URL(e.request.url).pathname.endsWith('.mp4')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // runtime cache: obrazy Dalii/ubrań i fonty
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => hit))
  );
});

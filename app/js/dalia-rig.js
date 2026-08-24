// dalia-rig.js — silnik animacji Dalii dla Domku.
//
// Filozofia: NIE tniemy psa na kawałki. Każdy stan to KOMPLETNY, zwalidowany
// sprite (bramka verify-dalia-sprites) -> nigdy nic się nie utnie. "Życie"
// dodajemy proceduralnie w kodzie, dokładnie jak w grach tego repo:
//   - oddech: powolna skala Y + unoszenie (sin)  [jak bob w Flappy/Spacer]
//   - squash&stretch przy podskoku/reakcji
//   - mikro-przechylenia głowy przez lekki skew całej sylwetki (sin)
//   - mruganie: krótki swap sprite -> blink -> sprite (ta sama sylwetka)
//   - efekty CSS (serca, zzz, piana) rysowane osobno w warstwie fx
//
// Render: pojedynczy <img> w kontenerze, transform składany na GPU (translate3d,
// scale), sterowany jedną pętlą requestAnimationFrame. Respektuje reduced-motion.

const SPRITES = {
  idle: 'assets/img/dalia-rig/dalia-sit.png',
  blink: 'assets/img/dalia-rig/dalia-blink.png',
  happy: 'assets/img/dalia-rig/dalia-eat.png',   // otwarty pyszczek = radość/jedzenie
  eat: 'assets/img/dalia-rig/dalia-eat.png',
  sad: 'assets/img/dalia-rig/dalia-sad.png',
  bow: 'assets/img/dalia-rig/dalia-bow.png',
  sleep: 'assets/img/dalia-rig/dalia-sleep.png',
};

// Kolejność preloadu (idle i blink najpierw — najczęściej widoczne).
const PRELOAD = ['idle', 'blink', 'happy', 'sad', 'bow', 'sleep'];

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createDaliaRig(mount) {
  // Struktura DOM: .rig > .rig-dog(img) ; efekty wchodzą do osobnej warstwy w care.
  const root = typeof mount === 'string' ? document.querySelector(mount) : mount;
  root.classList.add('rig');
  root.innerHTML = `
    <div class="rig-shadow" aria-hidden="true"></div>
    <img class="rig-dog" alt="Dalia" draggable="false"
         src="${SPRITES.idle}">
  `;
  const dog = root.querySelector('.rig-dog');

  // preload
  const cache = {};
  PRELOAD.forEach((k) => { const im = new Image(); im.src = SPRITES[k]; cache[k] = im; });

  // --- stan animacji ---
  let baseState = 'idle';   // stan spoczynkowy (idle/sad/sleep)
  let shownKey = 'idle';    // aktualnie pokazywany sprite
  let raf = 0;
  let t0 = performance.now();

  // parametry ruchu ciągłego
  let breatheAmp = 0.018;   // amplituda oddechu (skala)
  let breathePeriod = 3200; // ms
  let swayAmp = 0.6;        // stopnie kołysania
  let energy = 1;           // 0..1 wpływa na tempo/amplitudę (radość, sen)

  // jednorazowe impulsy (reakcje)
  let bounce = 0;           // 0..1 zanikający impuls podskoku
  let bounceVel = 0;
  let wiggle = 0;           // zanikający impuls machania
  let squash = 0;           // zanikający squash&stretch

  // mruganie
  let nextBlink = 1200 + Math.random() * 3000;
  let blinkUntil = 0;
  let doubleBlink = false;

  // chwilowa zmiana ekspresji (np. na reakcję), po czasie wraca do baseState
  let exprKey = null;
  let exprUntil = 0;

  function setSprite(key) {
    if (shownKey === key) return;
    const src = SPRITES[key] || SPRITES.idle;
    dog.src = src;
    shownKey = key;
  }

  // Publiczne API rigu
  const api = {
    el: root,

    // Ustawia stan spoczynkowy: 'idle' | 'sad' | 'sleep'
    setBase(state) {
      if (!['idle', 'sad', 'sleep'].includes(state)) state = 'idle';
      baseState = state;
      if (state === 'sleep') { energy = 0.35; breathePeriod = 5200; breatheAmp = 0.03; swayAmp = 0; }
      else if (state === 'sad') { energy = 0.7; breathePeriod = 3600; breatheAmp = 0.015; swayAmp = 0.35; }
      else { energy = 1; breathePeriod = 3200; breatheAmp = 0.018; swayAmp = 0.6; }
    },

    // Ustawia poziom radości 0..1 (wpływa na tempo ogona/kołysania).
    setHappiness(h) {
      if (baseState !== 'sleep') energy = 0.6 + Math.max(0, Math.min(1, h)) * 0.6;
    },

    // Krótka reakcja z konkretną ekspresją + impulsem ruchu.
    // kind: 'happy' | 'eat' | 'bow' | 'surprise'(->happy) | 'shake'
    react(kind, ms = 1100) {
      const now = performance.now();
      if (kind === 'eat') { exprKey = 'eat'; kickBounce(0.7); kickSquash(0.5); }
      else if (kind === 'bow') { exprKey = 'bow'; kickBounce(1); }
      else if (kind === 'shake') { exprKey = 'happy'; kickWiggle(1); }
      else { exprKey = 'happy'; kickBounce(0.6); kickWiggle(0.5); }
      exprUntil = now + ms;
    },

    // Natychmiastowy nod/tap feedback bez zmiany ekspresji.
    poke() { kickBounce(0.45); kickWiggle(0.4); },

    start() { if (!raf) { t0 = performance.now(); loop(t0); } },
    stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    destroy() { api.stop(); root.innerHTML = ''; root.classList.remove('rig'); },
  };

  function kickBounce(v) { bounce = Math.max(bounce, v); bounceVel = Math.max(bounceVel, v * 6); }
  function kickWiggle(v) { wiggle = Math.max(wiggle, v); }
  function kickSquash(v) { squash = Math.max(squash, v); }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const t = now - t0;
    const dt = Math.min(48, now - (loop._last || now)); loop._last = now;

    // --- wybór sprite'a ---
    // priorytet: chwilowa ekspresja > mruganie > stan bazowy
    let want = baseState === 'sleep' ? 'sleep' : baseState === 'sad' ? 'sad' : 'idle';
    if (exprKey && now < exprUntil) {
      want = exprKey;
    } else if (exprKey && now >= exprUntil) {
      exprKey = null;
    }

    // mruganie tylko w spoczynku (nie podczas snu / ekspresji)
    if (!exprKey && baseState === 'idle') {
      if (now >= blinkUntil && t > nextBlink && want === 'idle') {
        // rozpocznij mrugnięcie
        blinkUntil = now + 110;
        nextBlink = t + 2200 + Math.random() * 4200;
        doubleBlink = Math.random() < 0.25;
      }
      if (now < blinkUntil) want = 'blink';
      else if (doubleBlink && now < blinkUntil + 220) {
        // druga faza podwójnego mrugnięcia
        const phase = now - blinkUntil;
        want = (phase > 110 && phase < 190) ? 'blink' : 'idle';
        if (phase >= 220) doubleBlink = false;
      }
    }
    setSprite(want);

    // --- ruch ciągły ---
    if (reduced()) {
      dog.style.transform = 'translate3d(0,0,0)';
    } else {
      // oddech: delikatne unoszenie + skala Y (klatka piersiowa)
      const br = Math.sin((t / breathePeriod) * Math.PI * 2);
      const breatheY = -br * 4 * energy;
      const scaleY = 1 + br * breatheAmp * energy;
      const scaleX = 1 - br * breatheAmp * 0.6 * energy;

      // kołysanie (mikro-przechylenie sylwetki)
      const sway = Math.sin((t / (breathePeriod * 1.3)) * Math.PI * 2) * swayAmp * energy;

      // impuls machania (wiggle) — szybkie wychylenia obrotu
      let wig = 0;
      if (wiggle > 0.001) {
        wig = Math.sin(t / 60) * 5 * wiggle;
        wiggle *= Math.pow(0.0025, dt / 1000); // szybki zanik
      }

      // impuls podskoku (sprężyna)
      let jumpY = 0;
      if (bounce > 0.001 || Math.abs(bounceVel) > 0.001) {
        // prosta sprężyna tłumiona
        const k = 90, damp = 12;
        const acc = -k * bounce - damp * bounceVel;
        bounceVel += acc * (dt / 1000);
        bounce += bounceVel * (dt / 1000);
        jumpY = -Math.abs(bounce) * 46;
        if (Math.abs(bounce) < 0.002 && Math.abs(bounceVel) < 0.01) { bounce = 0; bounceVel = 0; }
      }

      // squash&stretch przy lądowaniu/jedzeniu
      let sqX = 1, sqY = 1;
      if (squash > 0.001) {
        sqY = 1 - squash * 0.12;
        sqX = 1 + squash * 0.10;
        squash *= Math.pow(0.02, dt / 1000);
        if (squash < 0.01) squash = 0;
      }

      const tx = 0;
      const ty = breatheY + jumpY;
      const rot = sway + wig;
      dog.style.transform =
        `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${(scaleX * sqX).toFixed(4)}, ${(scaleY * sqY).toFixed(4)})`;

      // cień reaguje na podskok (mniejszy/jaśniejszy w górze)
      const shadow = root.querySelector('.rig-shadow');
      if (shadow) {
        const lift = Math.min(1, Math.abs(jumpY) / 46);
        shadow.style.transform = `translateX(-50%) scaleX(${(1 - lift * 0.28).toFixed(3)})`;
        shadow.style.opacity = (0.32 - lift * 0.14).toFixed(3);
      }
    }
  }

  api.setBase('idle');
  return api;
}

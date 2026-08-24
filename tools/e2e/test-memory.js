const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8642';
fs.mkdirSync(OUT, { recursive: true });

const EXPECTED = new Set([
  'chipsy', 'przetwory', 'mcflurry', 'chalwa', 'yerbata',
  'foto-5821', 'foto-5841',
  'volkswagen', 'karuzela', 'dalia-mokra',
]);

function analyzeDeck(ids) {
  const unique = [...new Set(ids)];
  const counts = ids.reduce((all, id) => ({ ...all, [id]: (all[id] || 0) + 1 }), {});
  const missing = [...EXPECTED].filter((id) => !unique.includes(id));
  const unexpected = unique.filter((id) => !EXPECTED.has(id));
  const invalidCounts = Object.entries(counts).filter(([, count]) => count !== 2);
  return { totalCards: ids.length, unique: unique.length, missing, unexpected, invalidCounts };
}

(async () => {
  const errors = [];
  const consoleErrs = [];
  const failedReqs = [];

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => failedReqs.push(r.url()));
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() === 404 && u.includes('/assets/img/memory/')) failedReqs.push(`${r.status()} ${u}`);
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(600);

  // Pomiń intro: START → POMIŃ (skip widoczny dopiero po starcie trasy)
  const onIntro = await page.$eval('#screen-intro', (el) => el.classList.contains('active'));
  if (onIntro) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }

  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });

  // Salon → Memory
  await page.click('#screen-hub [data-go="screen-salon"]'); await sleep(350);
  await page.click('#screen-salon [data-go="screen-memory"]'); await sleep(450);
  await shot('mem-board-start.png');

  async function readDeck() {
    return page.evaluate(() => [...document.querySelectorAll('.mem-card')].map((c) => c.dataset.id));
  }

  // weryfikacja pełnego składu w kilku restartach
  for (let round = 0; round < 5; round++) {
    const ids = await readDeck();
    const a = analyzeDeck(ids);
    if (a.totalCards !== 20) errors.push(`Runda ${round}: oczekiwano 20 kart, jest ${a.totalCards}`);
    if (a.unique !== 10) errors.push(`Runda ${round}: oczekiwano 10 par, jest ${a.unique}`);
    if (a.missing.length) errors.push(`Runda ${round}: brak ${a.missing.join(', ')}`);
    if (a.unexpected.length) errors.push(`Runda ${round}: nieoczekiwane ${a.unexpected.join(', ')}`);
    if (a.invalidCounts.length) errors.push(`Runda ${round}: błędne liczby kopii ${JSON.stringify(a.invalidCounts)}`);
    if (round < 4) {
      await page.click('#screen-memory .btn-back'); await sleep(250);
      await page.click('#screen-salon [data-go="screen-memory"]'); await sleep(350);
    }
  }

  // kadrowanie — odkryj po jednej karcie z każdego tieru
  await page.click('#screen-memory .btn-back'); await sleep(200);
  await page.click('#screen-salon [data-go="screen-memory"]'); await sleep(350);
  await page.evaluate(() => {
    const tiers = ['food', 'photo', 'featured'];
    for (const tier of tiers) {
      const card = document.querySelector(`.mem-card[data-tier="${tier}"]`);
      if (card) card.click();
    }
  });
  await sleep(500);
  await shot('mem-flipped-sample.png');

  // dopasuj wszystkie pary
  await page.click('#screen-memory .btn-back'); await sleep(200);
  await page.click('#screen-salon [data-go="screen-memory"]'); await sleep(350);
  await page.evaluate(async () => {
    const cards = [...document.querySelectorAll('.mem-card')];
    const byId = {};
    for (const c of cards) (byId[c.dataset.id] ||= []).push(c);
    for (const pair of Object.values(byId)) {
      pair[0].click();
      pair[1].click();
      await new Promise((r) => setTimeout(r, 420));
    }
  });
  await sleep(1200);
  await shot('mem-complete.png');

  const overHidden = await page.$eval('#mem-over', (el) => el.classList.contains('hidden'));
  if (overHidden) errors.push('Overlay końcowy nie pojawił się');

  const gain = await page.$eval('#mem-gain', (el) => el.textContent);
  const moves = await page.$eval('#mem-final', (el) => el.textContent);
  const best = await page.$eval('#memory-best', (el) => el.textContent);
  console.log('Moves:', moves, 'Gain:', gain, 'Best:', best);

  const gainNum = Number(gain);
  if (!(gainNum === 50 || gainNum === 65)) {
    errors.push(`Nagroda ${gainNum} — oczekiwano 50 lub 65 (10×5 + ewent. bonus)`);
  }
  if (!best.includes('Rekord')) errors.push(`Rekord nie ustawiony: "${best}"`);

  // Jeszcze raz + powrót do Salonu
  await page.click('#btn-mem-again'); await sleep(350);
  const cardsAfter = await readDeck();
  if (cardsAfter.length !== 20) errors.push('Restart nie rozdał 20 kart');

  await page.click('#screen-memory .btn-back'); await sleep(350);
  const salonActive = await page.$eval('#screen-salon', (el) => el.classList.contains('active'));
  if (!salonActive) errors.push('Powrót do Salonu nie zadziałał');

  await shot('mem-back-salon.png');
  await browser.close();

  const mem404 = failedReqs.filter((u) => u.includes('memory'));
  console.log('\n=== MEMORY E2E ===');
  console.log('JS errors:', errors.length ? errors : 'none');
  console.log('Console errors:', consoleErrs.length ? consoleErrs : 'none');
  console.log('Memory 404:', mem404.length ? mem404 : 'none');
  console.log('Screenshots:', OUT);

  if (errors.length || mem404.length) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });

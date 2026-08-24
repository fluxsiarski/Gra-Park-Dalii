const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/tmp/olivia-hub-bg';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8765';
fs.mkdirSync(OUT, { recursive: true });

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
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && (u.includes('/assets/img/places/') || u.includes('/js/') || u.includes('/css/'))) {
      failedReqs.push(`${r.status()} ${u}`);
    }
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(500);

  const onIntro = await page.$eval('#screen-intro', (el) => el.classList.contains('active'));
  if (onIntro) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }

  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });

  const hubOn = await page.$eval('#screen-hub', (el) => el.classList.contains('active'));
  if (!hubOn) errors.push('hub nieaktywny po skipie intro');

  const defaultState = await page.evaluate(() => ({
    photo: document.querySelector('#screen-hub').classList.contains('hub-photo'),
    parkHidden: document.querySelector('#park-scene').classList.contains('hidden'),
    layerHidden: document.querySelector('#park-photo-layer').classList.contains('hidden'),
    saved: JSON.parse(localStorage.getItem('dalia-save-v1') || '{}').hubBg || null,
  }));
  if (defaultState.photo || defaultState.parkHidden || !defaultState.layerHidden) {
    errors.push('domyślne tło nie jest parkiem SVG: ' + JSON.stringify(defaultState));
  }
  await shot('hub-park.png');

  await page.click('#hub-place-btn'); await sleep(350);
  const panelOpen = await page.$eval('#place-panel', (el) => !el.classList.contains('hidden'));
  if (!panelOpen) errors.push('panel miejsc nie otworzył się');
  const cards = await page.$$eval('.place-card', (els) => els.map((el) => el.dataset.bg));
  if (cards.join(',') !== 'park,bulwar,karuzela,teatr') {
    errors.push('nieoczekiwane karty miejsc: ' + cards.join(','));
  }
  await shot('hub-picker.png');

  async function pick(id, file) {
    await page.click(`.place-card[data-bg="${id}"]`); await sleep(450);
    const st = await page.evaluate((want) => {
      const img = document.querySelector('#park-photo');
      const cs = img ? getComputedStyle(img) : {};
      return {
        hubPhoto: document.querySelector('#screen-hub').classList.contains('hub-photo'),
        parkHidden: document.querySelector('#park-scene').classList.contains('hidden'),
        layerHidden: document.querySelector('#park-photo-layer').classList.contains('hidden'),
        src: img.getAttribute('src'),
        objectFit: cs.objectFit,
        opacity: parseFloat(cs.opacity),
        w: img.clientWidth,
        h: img.clientHeight,
        nw: img.naturalWidth,
        nh: img.naturalHeight,
        saved: JSON.parse(localStorage.getItem('dalia-save-v1') || '{}').hubBg,
        selected: document.querySelector(`.place-card[data-bg="${want}"]`)?.classList.contains('selected') || false,
        panelHidden: document.querySelector('#place-panel').classList.contains('hidden'),
        daliaH: document.querySelector('#dalia-main').clientHeight,
      };
    }, id);
    if (!st.hubPhoto) errors.push(`${id}: brak klasy hub-photo`);
    if (!st.parkHidden) errors.push(`${id}: park SVG nadal widoczny`);
    if (st.layerHidden) errors.push(`${id}: warstwa zdjęcia ukryta`);
    if (st.objectFit !== 'cover') errors.push(`${id}: object-fit=${st.objectFit}`);
    if (!(st.opacity > 0.7 && st.opacity < 0.95)) errors.push(`${id}: opacity=${st.opacity}`);
    if (st.saved !== id) errors.push(`${id}: save=${st.saved}`);
    if (!st.panelHidden) errors.push(`${id}: panel nie zamknął się`);
    if (st.daliaH < 180) errors.push(`${id}: Dalia za mała ${st.daliaH}`);
    const displayed = st.w / st.h;
    const natural = st.nw / st.nh;
    if (Math.abs(displayed - natural) < 0.02) errors.push(`${id}: zdjęcie wygląda na rozciągnięte do naturalnego ratio w pionowym evencie`);
    await shot(file);
    return st;
  }

  await pick('bulwar', 'hub-bulwar.png');
  await page.click('#hub-place-btn'); await sleep(250);
  await pick('karuzela', 'hub-karuzela.png');
  await page.click('#hub-place-btn'); await sleep(250);
  await pick('teatr', 'hub-teatr.png');

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(500);
  const onIntro2 = await page.$eval('#screen-intro', (el) => el.classList.contains('active'));
  if (onIntro2) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }
  const restored = await page.evaluate(() => ({
    saved: JSON.parse(localStorage.getItem('dalia-save-v1') || '{}').hubBg,
    src: document.querySelector('#park-photo').getAttribute('src') || '',
    hubPhoto: document.querySelector('#screen-hub').classList.contains('hub-photo'),
  }));
  if (restored.saved !== 'teatr' || !restored.hubPhoto || !restored.src.includes('teatr-lalek')) {
    errors.push('tło nie przetrwało reloadu: ' + JSON.stringify(restored));
  }
  await shot('hub-teatr-reload.png');

  await page.click('#hub-place-btn'); await sleep(250);
  await page.click('.place-card[data-bg="park"]'); await sleep(350);
  const backToPark = await page.evaluate(() => ({
    photo: document.querySelector('#screen-hub').classList.contains('hub-photo'),
    parkHidden: document.querySelector('#park-scene').classList.contains('hidden'),
    saved: JSON.parse(localStorage.getItem('dalia-save-v1') || '{}').hubBg,
  }));
  if (backToPark.photo || backToPark.parkHidden || backToPark.saved !== 'park') {
    errors.push('powrót do parku nie zadziałał: ' + JSON.stringify(backToPark));
  }
  await shot('hub-park-back.png');

  await page.click('#screen-hub [data-go="screen-salon"]'); await sleep(300);
  const salon = await page.$eval('#screen-salon', (el) => el.classList.contains('active'));
  if (!salon) errors.push('Salon Gier nie otworzył się z hubu');

  await browser.close();

  console.log(JSON.stringify({
    errors,
    consoleErrs: consoleErrs.slice(0, 3),
    failedReqs,
    out: OUT,
  }, null, 2));
  if (errors.length || failedReqs.length) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8642';
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
    if (r.status() >= 400 && u.includes('/assets/img/billboards/')) {
      failedReqs.push(`${r.status()} ${u}`);
    }
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(800);

  const bb = await page.waitForFunction(() => window.__intro && window.__intro.bb().ready, { timeout: 5000 })
    .then(() => page.evaluate(() => window.__intro.bb()))
    .catch(() => null);

  if (!bb) errors.push('billboards nie załadowały się');
  else {
    console.log('SLOTS', JSON.stringify(bb.slots));
    const idxs = bb.slots.slice(0, 5).map((s) => s.idx).sort();
    if (idxs.join(',') !== '0,1,2,3,4') errors.push('pierwsze 5 slotów nie pokrywają wszystkich zdjęć: ' + idxs);
    const sides = new Set(bb.slots.map((s) => s.side));
    if (sides.size < 2) errors.push('billboardy tylko po jednej stronie');
    if (bb.slots[0].z > 50) errors.push('pierwszy billboard za daleko od startu: ' + bb.slots[0].z);
  }

  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });

  async function driveAndShoot(veh, prefix) {
    await page.evaluate((v) => {
      localStorage.setItem('dalia-veh', v);
      document.querySelectorAll('.veh-card').forEach((b) => {
        if (b.dataset.veh === v) b.click();
      });
    }, veh);
    await sleep(200);
    const selected = await page.$eval(`.veh-card[data-veh="${veh}"]`, (el) => el.classList.contains('selected'));
    if (!selected) errors.push(`${veh}: karta nie selected`);

    const titleHidden = await page.$eval('#intro-title', (el) => el.classList.contains('hidden'));
    if (!titleHidden) {
      await page.click('#btn-intro-start');
      await sleep(400);
    }
    await page.evaluate(() => { window.__intro.warp(0); });
    await sleep(250);
    await shot(`${prefix}-start.png`);

    const slots = bb ? bb.slots : [];
    for (const slot of slots) {
      await page.evaluate((z) => { window.__intro.warp(z - 22); }, slot.z);
      await sleep(180);
      const z = await page.evaluate(() => window.__intro.z());
      await shot(`${prefix}-bb-${slot.idx}-z${slot.z}.png`);
      const sample = await page.evaluate(() => {
        const cv = document.querySelector('#intro-canvas');
        const c = cv.getContext('2d');
        const { width: w, height: h } = cv;
        const data = c.getImageData(0, Math.floor(h * 0.28), w, Math.floor(h * 0.5)).data;
        const colors = new Set();
        for (let i = 0; i < data.length; i += 16) {
          colors.add(`${data[i] >> 4}${data[i + 1] >> 4}${data[i + 2] >> 4}`);
        }
        return { unique: colors.size, z: window.__intro.z() };
      });
      console.log(prefix, 'idx', slot.idx, 'z', slot.z, 'cam', z, 'colors', sample.unique);
      if (sample.unique < 40) errors.push(`${prefix} idx ${slot.idx}: za mało kolorów (${sample.unique}) — foto może nie być narysowane`);
    }
  }

  await driveAndShoot('bus', 'bb-bus');
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(800);
  await page.waitForFunction(() => window.__intro && window.__intro.bb().ready, { timeout: 5000 }).catch(() => {});
  await driveAndShoot('train', 'bb-train');

  console.log('FAILED REQS', failedReqs);
  console.log('CONSOLE', consoleErrs);
  console.log('ERRORS', errors);
  await browser.close();
  if (errors.length || failedReqs.length || consoleErrs.length) process.exit(1);
  console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });

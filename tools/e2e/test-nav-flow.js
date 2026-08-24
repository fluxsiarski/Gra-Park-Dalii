// test-nav-flow.js — weryfikuje nowy przepływ nawigacji:
// intro -> Domek (główny hub) -> Park (button) -> powrót do Domku
// oraz Domek -> Salon Gier -> powrót do Domku.

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/tmp/olivia-nav-flow';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8779';
fs.mkdirSync(OUT, { recursive: true });

const activeId = (page) =>
  page.evaluate(() => (document.querySelector('.screen.active') || {}).id || null);

(async () => {
  const errors = [];
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(300);

  const shot = (name) => page.screenshot({ path: path.join(OUT, name) });

  // intro -> główny hub
  if (await page.$eval('#screen-intro', (el) => el.classList.contains('active'))) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(2900); // czeka na finish->toHub
  }
  let cur = await activeId(page);
  if (cur !== 'screen-dalia-care') errors.push(`Po intro spodziewano się screen-dalia-care, jest: ${cur}`);
  await shot('01-po-intro.png');

  // Domek -> Park (kafelek w salonie)
  await page.waitForSelector('#care-tools [data-act="park"]', { timeout: 3000 }).catch(() => {});
  const hasPark = await page.$('#care-tools [data-act="park"]');
  if (!hasPark) errors.push('Brak kafelka Park w salonie Domku');
  else {
    await page.click('#care-tools [data-act="park"]'); await sleep(500);
    cur = await activeId(page);
    if (cur !== 'screen-hub') errors.push(`Po kliknięciu Park spodziewano się screen-hub, jest: ${cur}`);
    await shot('02-park.png');

    // Park -> powrót do Domku
    await page.click('#screen-hub [data-go="screen-dalia-care"]'); await sleep(500);
    cur = await activeId(page);
    if (cur !== 'screen-dalia-care') errors.push(`Powrót z Parku: spodziewano się screen-dalia-care, jest: ${cur}`);
    await shot('03-powrot-do-domku.png');
  }

  // Domek -> Salon Gier -> powrót do Domku
  await page.waitForSelector('#care-tools [data-act="games"]', { timeout: 3000 }).catch(() => {});
  await page.click('#care-tools [data-act="games"]'); await sleep(500);
  cur = await activeId(page);
  if (cur !== 'screen-salon') errors.push(`Salon: spodziewano się screen-salon, jest: ${cur}`);
  await shot('04-salon.png');

  await page.click('#screen-salon .btn-back'); await sleep(500);
  cur = await activeId(page);
  if (cur !== 'screen-dalia-care') errors.push(`Powrót z Salonu: spodziewano się screen-dalia-care, jest: ${cur}`);
  await shot('05-powrot-z-salonu.png');

  await browser.close();

  if (errors.length) {
    console.error('NAV FLOW BŁĘDY:\n' + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('NAV FLOW OK — zrzuty w ' + OUT);
})();

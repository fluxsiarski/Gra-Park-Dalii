const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('console', m => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
  page.on('pageerror', e => console.log('JS ERR:', e.message));
  await page.goto('http://localhost:8642/', { waitUntil: 'networkidle0' });
  await sleep(600);
  const shot = (n) => page.screenshot({ path: '/var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode/' + n });

  await page.click('#btn-enter'); await sleep(700);
  await shot('v-hub.png');

  // ---- przymierzalnia: zloz look i zapisz ----
  await page.click('[data-go="screen-przy"]'); await sleep(500);
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find(t => t.textContent.includes('S')).click());
  await sleep(200);
  let unlocked = await page.$$('.item-card:not(.locked)');
  await unlocked[0].click(); await sleep(250);
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find(t => t.textContent.includes('G')).click());
  await sleep(200);
  unlocked = await page.$$('.item-card:not(.locked)');
  await unlocked[0].click(); await sleep(250);
  // doloz czapke (odblokowana od 8 smaczkow — jeszcze zamknieta; ok)
  await shot('v-przy.png');
  await page.click('#btn-save-look'); await sleep(500);
  await shot('v-saved.png');
  // zaloz bandane Dalii
  await page.evaluate(() => [...document.querySelectorAll('.acc-chip')].find(c => c.textContent.trim().startsWith('Bandana')).click());
  await sleep(300);

  // ---- hub: dalia z bandana ----
  await page.click("#screen-przy [data-go=\"screen-hub\"]"); await sleep(800);
  await shot('v-hub-bandana.png');

  // ---- memory: klikaj pary programowo ----
  await page.click("#screen-hub [data-go=\"screen-memory\"]"); await sleep(400);
  await page.evaluate(async () => {
    const cards = [...document.querySelectorAll('.mem-card')];
    const byFace = {};
    for (const c of cards) (byFace[c.dataset.face] ||= []).push(c);
    for (const [face, pair] of Object.entries(byFace)) {
      pair[0].click(); pair[1].click();
      await new Promise(r => setTimeout(r, 550));
    }
  });
  await sleep(1400);
  await shot('v-memory-done.png');

  // ---- spacer: szybka gra do konca ----
  await page.click("#mem-over [data-go=\"screen-hub\"]"); await sleep(400);
  await page.click("#screen-hub [data-go=\"screen-spacer\"]"); await sleep(400);
  await page.click('#btn-spacer-go'); await sleep(300);
  for (let i = 0; i < 14; i++) {
    const dirs = [[195,700,195,540],[195,540,330,540],[330,540,330,700],[195,700,60,700]];
    const [x1,y1,x2,y2] = dirs[i % 4];
    await page.touchscreen.touchStart(x1, y1);
    await page.touchscreen.touchMove(x2, y2);
    await page.touchscreen.touchEnd();
    await sleep(650);
    const over = await page.$eval('#spacer-over', el => !el.classList.contains('hidden'));
    if (over) break;
  }
  await sleep(400);
  await shot('v-gameover.png');

  const treats = await page.$eval('#treats-hub', el => el.textContent).catch(()=> '?');
  console.log('TREATS ON HUB:', treats);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

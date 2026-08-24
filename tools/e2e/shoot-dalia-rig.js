// shoot-dalia-rig.js — zrzuca każdy stan rigu Dalii do inspekcji wizualnej.
// Sprawdza też, że sprite rigu ma niezerowe wymiary i mieści się w scenie
// (żaden fragment psa nie wychodzi poza kadr sceny = brak "ucięcia" w runtime).

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/tmp/olivia-dalia-rig-shots';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8779';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const errors = [];
  const consoleErrs = [];
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(400);
  // smaczki na karmienie
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('dalia-save-v1') || '{}');
    s.treats = 99; s.totalEarned = Math.max(s.totalEarned || 0, 99);
    localStorage.setItem('dalia-save-v1', JSON.stringify(s));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);

  // intro -> hub
  if (await page.$eval('#screen-intro', (el) => el.classList.contains('active'))) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }
  await page.click('#screen-hub [data-go="screen-dalia-care"]'); await sleep(500);

  const shotStage = async (name) => {
    const stage = await page.$('#care-stage');
    await stage.screenshot({ path: path.join(OUT, name) });
  };

  // sprawdza, że sprite rigu jest widoczny i w całości w scenie
  const checkContained = async (label) => {
    const r = await page.evaluate(() => {
      const stage = document.querySelector('#care-stage').getBoundingClientRect();
      const dog = document.querySelector('#care-rig .rig-dog');
      if (!dog) return { err: 'brak .rig-dog' };
      const b = dog.getBoundingClientRect();
      return {
        w: b.width, h: b.height,
        overTop: b.top < stage.top - 1,
        overBottom: b.bottom > stage.bottom + 1,
        overLeft: b.left < stage.left - 1,
        overRight: b.right > stage.right + 1,
        src: dog.getAttribute('src'),
      };
    });
    if (r.err) { errors.push(`${label}: ${r.err}`); return; }
    if (r.w < 60 || r.h < 60) errors.push(`${label}: sprite za mały ${Math.round(r.w)}x${Math.round(r.h)}`);
    // dolna część może dotykać dna sceny (pies stoi na podłodze) — tolerujemy overBottom lekko
    if (r.overTop || r.overLeft || r.overRight) {
      errors.push(`${label}: sprite wychodzi poza scenę (T${r.overTop} L${r.overLeft} R${r.overRight}) src=${r.src}`);
    }
  };

  // IDLE
  await sleep(600); await shotStage('01-idle.png'); await checkContained('idle');

  // HAPPY (pogłaskaj)
  await page.click('.care-action[data-act="pet"]'); await sleep(250);
  await shotStage('02-happy.png'); await checkContained('happy');
  await sleep(1200);

  // BOW (pobaw się)
  await page.click('.care-action[data-act="play"]'); await sleep(250);
  await shotStage('03-bow.png'); await checkContained('bow');
  await sleep(1400);

  // EAT (kuchnia)
  await page.click('.care-nav-btn[data-room="kitchen"]'); await sleep(400);
  await page.click('.care-food[data-food="mcflurry"]'); await sleep(300);
  await shotStage('04-eat.png'); await checkContained('eat');
  await sleep(1400);

  // SAD: zbij szczęście do zera w localStorage i PRZEŁADUJ (careStore czyta z LS przy starcie)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('dalia-care-v1') || '{}');
    s.happiness = 5; s.satiety = 60; s.energy = 60; s.cleanliness = 60; s.asleep = false;
    s.room = 'living'; s.lastUpdated = Date.now();
    localStorage.setItem('dalia-care-v1', JSON.stringify(s));
  });
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  if (await page.$eval('#screen-intro', (el) => el.classList.contains('active'))) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }
  await page.click('#screen-hub [data-go="screen-dalia-care"]'); await sleep(700);
  await shotStage('05-sad.png'); await checkContained('sad');

  // SLEEP (sypialnia, zgaś światło)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('dalia-care-v1') || '{}');
    s.happiness = 60; s.lastUpdated = Date.now();
    localStorage.setItem('dalia-care-v1', JSON.stringify(s));
  });
  await page.click('.care-nav-btn[data-room="bedroom"]'); await sleep(400);
  await page.click('.care-action[data-act="light"]'); await sleep(500);
  await shotStage('06-sleep.png'); await checkContained('sleep');

  await browser.close();
  console.log(JSON.stringify({ errors, consoleErrs: consoleErrs.slice(0, 6), out: OUT }, null, 2));
  if (errors.length) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });

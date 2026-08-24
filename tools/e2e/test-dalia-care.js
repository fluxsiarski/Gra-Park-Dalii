const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = '/tmp/olivia-dalia-care';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8765';
fs.mkdirSync(OUT, { recursive: true });

const readCare = () => JSON.parse(localStorage.getItem('dalia-care-v1') || '{}');

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
    if (r.status() >= 400 && (u.includes('/assets/img/') || u.includes('/js/') || u.includes('/css/'))) {
      failedReqs.push(`${r.status()} ${u}`);
    }
  });

  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(400);

  // Zapewnij trochę smaczków, żeby móc karmić.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('dalia-save-v1') || '{}');
    s.treats = 50; s.totalEarned = Math.max(s.totalEarned || 0, 50);
    localStorage.setItem('dalia-save-v1', JSON.stringify(s));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);

  // Intro -> hub
  const onIntro = await page.$eval('#screen-intro', (el) => el.classList.contains('active'));
  if (onIntro) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }

  // Wejście do Domku z huba
  await page.click('#screen-hub [data-go="screen-dalia-care"]'); await sleep(400);
  const careOn = await page.$eval('#screen-dalia-care', (el) => el.classList.contains('active'));
  if (!careOn) errors.push('Domek Dalii nie otworzył się z huba');
  await shot('care-living.png');

  // Chip smaczków widoczny i > 0
  const treats0 = await page.$eval('#treats-care', (el) => parseInt(el.textContent, 10));
  if (!(treats0 >= 50)) errors.push('chip smaczków w Domku nie pokazuje wspólnego stanu: ' + treats0);

  // Rig Dalii obecny, widoczny i w całości w scenie (brak ucięcia w runtime)
  const rigCheck = await page.evaluate(() => {
    const dog = document.querySelector('#care-rig .rig-dog');
    if (!dog) return { ok: false, reason: 'brak .rig-dog' };
    const stage = document.querySelector('#care-stage').getBoundingClientRect();
    const b = dog.getBoundingClientRect();
    return {
      ok: b.width > 60 && b.height > 60 && b.top >= stage.top - 1 && b.left >= stage.left - 1 && b.right <= stage.right + 1,
      w: Math.round(b.width), h: Math.round(b.height), src: dog.getAttribute('src'),
    };
  });
  if (!rigCheck.ok) errors.push('rig Dalii niepoprawny: ' + JSON.stringify(rigCheck));

  // --- Salon: pogłaszcz podnosi szczęście ---
  const hap0 = await page.evaluate(readCare).then((s) => s.happiness);
  await page.click('.care-action[data-act="pet"]'); await sleep(200);
  const hap1 = await page.evaluate(readCare).then((s) => s.happiness);
  if (!(hap1 > hap0)) errors.push(`głaskanie nie podniosło szczęścia: ${hap0} -> ${hap1}`);

  // --- Kuchnia: karmienie wydaje wspólne smaczki i syci ---
  await page.click('.care-nav-btn[data-room="kitchen"]'); await sleep(300);
  const kitchenOn = await page.$eval('#care-room', (el) => el.dataset.room === 'kitchen');
  if (!kitchenOn) errors.push('nie przełączono na kuchnię');
  await shot('care-kitchen.png');

  const sat0 = await page.evaluate(readCare).then((s) => s.satiety);
  const t0 = await page.evaluate(() => JSON.parse(localStorage.getItem('dalia-save-v1')).treats);
  await page.click('.care-food[data-food="mcflurry"]'); await sleep(300);
  const sat1 = await page.evaluate(readCare).then((s) => s.satiety);
  const t1 = await page.evaluate(() => JSON.parse(localStorage.getItem('dalia-save-v1')).treats);
  if (!(sat1 > sat0)) errors.push(`karmienie nie podniosło sytości: ${sat0} -> ${sat1}`);
  if (!(t1 === t0 - 6)) errors.push(`karmienie nie wydało 6 smaczków: ${t0} -> ${t1}`);

  // --- Łazienka: mydło podnosi czystość ---
  await page.click('.care-nav-btn[data-room="bath"]'); await sleep(300);
  const bathOn = await page.$eval('#care-room', (el) => el.dataset.room === 'bath');
  if (!bathOn) errors.push('nie przełączono na łazienkę');
  const clean0 = await page.evaluate(readCare).then((s) => s.cleanliness);
  await page.click('.care-action[data-act="soap"]'); await sleep(200);
  const clean1 = await page.evaluate(readCare).then((s) => s.cleanliness);
  if (!(clean1 > clean0)) errors.push(`mydło nie podniosło czystości: ${clean0} -> ${clean1}`);
  await shot('care-bath.png');

  // --- Sypialnia: sen zmienia stan asleep ---
  await page.click('.care-nav-btn[data-room="bedroom"]'); await sleep(300);
  const bedroomOn = await page.$eval('#care-room', (el) => el.dataset.room === 'bedroom');
  if (!bedroomOn) errors.push('nie przełączono na sypialnię');
  await page.click('.care-action[data-act="light"]'); await sleep(300);
  const asleep = await page.evaluate(readCare).then((s) => s.asleep);
  if (!asleep) errors.push('zgaszenie światła nie uśpiło Dalii');
  const nightVeil = await page.$eval('#care-night-veil', (el) => el.classList.contains('show'));
  if (!nightVeil) errors.push('brak nocnej zasłony w sypialni');
  await shot('care-bedroom.png');
  // Obudź z powrotem
  await page.click('.care-action[data-act="light"]'); await sleep(200);

  // --- Trwałość stanu po reloadzie ---
  const before = await page.evaluate(readCare);
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);
  const onIntro2 = await page.$eval('#screen-intro', (el) => el.classList.contains('active'));
  if (onIntro2) {
    await page.click('#btn-intro-start'); await sleep(350);
    await page.click('#btn-intro-skip'); await sleep(500);
  }
  const after = await page.evaluate(readCare);
  if (Math.abs((after.satiety || 0) - (before.satiety || 0)) > 5) {
    errors.push('sytość nie przetrwała reloadu: ' + JSON.stringify({ before: before.satiety, after: after.satiety }));
  }

  // --- Powrót do huba (po reloadzie jesteśmy na hubie, wejdź ponownie) ---
  await page.click('#screen-hub [data-go="screen-dalia-care"]'); await sleep(350);
  const careReentered = await page.$eval('#screen-dalia-care', (el) => el.classList.contains('active'));
  if (!careReentered) errors.push('ponowne wejście do Domku nie zadziałało');
  await page.click('#screen-dalia-care .care-back'); await sleep(300);
  const hubBack = await page.$eval('#screen-hub', (el) => el.classList.contains('active'));
  if (!hubBack) errors.push('powrót z Domku do huba nie zadziałał');

  await browser.close();

  console.log(JSON.stringify({
    errors,
    consoleErrs: consoleErrs.slice(0, 5),
    failedReqs,
    out: OUT,
  }, null, 2));
  if (errors.length || failedReqs.length) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

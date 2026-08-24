const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('dalia-save-v1', JSON.stringify({
      treats:100,totalEarned:100,
      looks:[{id:'L1',name:'A',items:[],ts:1},{id:'L2',name:'B',items:[],ts:2},{id:'L3',name:'C',items:[],ts:3},{id:'L4',name:'D',items:[],ts:4}],
      daliaAcc:{bandana:true,cap:true,glasses:true,scarf:true}, equippedAcc:'bandana',
      best:{spacer:0,memoryMoves:null}, introSeen:true }));
  });
  await page.goto('http://localhost:8642/index.html', { waitUntil: 'networkidle0' });
  await sleep(900);
  const r = await page.evaluate(() => {
    const g = el => { if (!el) return null; const b = el.getBoundingClientRect();
      return { x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1) }; };
    const stage = document.querySelector('.dalia-stage');
    const img = stage && stage.querySelector('img');
    return { stage: g(stage), img: g(img), src: img && img.src.split('/').pop(), overlay: g(document.querySelector('.acc-overlay')) };
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();

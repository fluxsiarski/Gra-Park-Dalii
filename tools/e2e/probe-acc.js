const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  for (const acc of ['bandana','cap','glasses','scarf']) {
    await page.evaluateOnNewDocument((a) => {
      localStorage.setItem('dalia-save-v1', JSON.stringify({
        treats: 100, totalEarned: 100,
        looks: [{id:'L1',name:'A',items:[],ts:1},{id:'L2',name:'B',items:[],ts:2},{id:'L3',name:'C',items:[],ts:3},{id:'L4',name:'D',items:[],ts:4}],
        daliaAcc: { bandana:true, cap:true, glasses:true, scarf:true },
        equippedAcc: a,
        best: { spacer: 0, memoryMoves: null },
        introSeen: true,
      }));
    }, acc);
    await page.goto('http://localhost:8642/index.html', { waitUntil: 'networkidle0' });
    await sleep(900);
    await page.screenshot({ path: '/var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode/acc-' + acc + '.png' });
    console.log('shot:', acc);
  }
  await browser.close();
})();

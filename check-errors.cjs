const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', err => {
    console.error(`PAGE ERROR:`, err.toString());
  });
  
  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED:`, request.url(), request.failure().errorText);
  });
  
  try {
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle2' });
    console.log("Page loaded successfully.");
    // wait a bit for react to mount
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error("Navigation failed:", e);
  }
  
  await browser.close();
})();

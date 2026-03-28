const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const waitForRender = async () => {
    await new Promise(r => setTimeout(r, 6000));
  };
  
  try {
    // 1. Dark Mode (Default Desktop)
    console.log('Capturing Dark Mode...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('kanban-theme-mode', 'dark');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForRender();
    await page.screenshot({ path: path.join(dir, 'kanban-dark.png') });
    console.log('Saved kanban-dark.png');
    
    // 2. Light Mode (Desktop)
    console.log('Capturing Light Mode...');
    await page.evaluate(() => {
      localStorage.setItem('kanban-theme-mode', 'light');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForRender();
    await page.screenshot({ path: path.join(dir, 'kanban-light.png') });
    console.log('Saved kanban-light.png');
    
    // 3. Mobile View (Dark mode)
    console.log('Capturing Mobile View...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.evaluate(() => {
      localStorage.setItem('kanban-theme-mode', 'dark');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForRender();
    await page.screenshot({ path: path.join(dir, 'kanban-mobile.png') });
    console.log('Saved kanban-mobile.png');

  } catch (error) {
    console.error('Error generating screenshots:', error);
  } finally {
    await browser.close();
    console.log('Screenshot generation complete.');
  }
})();

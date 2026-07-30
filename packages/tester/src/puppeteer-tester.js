const puppeteer = require('puppeteer');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { buildExperience } = require('./experience-builder.js');

async function runTester(experienceCode, experiencePath, client) {
  const distPath = path.resolve(__dirname, '../../dist', experienceCode, 'main.js');

  if (!fs.existsSync(distPath)) {
    console.log('Building experience first...');
    await buildExperience(experienceCode, experiencePath);
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log(`[page:${msg.type()}] ${msg.text()}`));
  page.on('error', err => console.error('[page:error]', err));
  page.on('pageerror', err => console.error('[page:pageerror]', err));

  const injectBundle = async () => {
    const bundle = fs.readFileSync(distPath, 'utf-8');

    console.log(`\nNavigating to ${client.url}...`);
    try {
      await page.goto(client.url, { waitUntil: 'domcontentloaded' });
    } catch (err) {
      console.error('Navigation failed:', err.message);
      return;
    }

    console.log(`Injecting ${experienceCode}...`);
    await page.addScriptTag({ content: bundle });
    console.log('✓ Injected\n');
  };

  await injectBundle();

  console.log(`Watching ${experiencePath}/src for changes...`);
  console.log('Press Ctrl+C to stop\n');

  const watcher = chokidar.watch(path.join(experiencePath, 'src'));

  watcher.on('change', async (file) => {
    try {
      console.log(`\n📝 ${path.basename(file)} changed, rebuilding...`);
      await buildExperience(experienceCode, experiencePath);
      console.log('✓ Rebuilt, reloading...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await injectBundle();
    } catch (err) {
      console.error('✗ Rebuild failed:', err.message);
    }
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    watcher.close();
    browser.close();
    process.exit(0);
  });
}

module.exports = { runTester };

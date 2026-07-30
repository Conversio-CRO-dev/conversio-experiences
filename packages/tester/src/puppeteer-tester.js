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

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[PAGE] ${msg.text()}`));
  page.on('error', err => console.error('[PAGE ERROR]', err));

  const injectBundle = async () => {
    const bundle = fs.readFileSync(distPath, 'utf-8');

    console.log(`\nInjecting into ${client.name}...`);
    await page.goto(client.url, { waitUntil: 'domContentLoaded' });

    await page.evaluate(code => {
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
    }, bundle);
  };

  await injectBundle();

  console.log(`\nWatching for changes in ${experiencePath}/src...`);
  console.log('Press Ctrl+C to stop\n');

  const watcher = chokidar.watch(path.join(experiencePath, 'src'));

  watcher.on('change', async () => {
    try {
      console.log('Rebuilding...');
      await buildExperience(experienceCode, experiencePath);
      await injectBundle();
      console.log('Injected.\n');
    } catch (err) {
      console.error('Rebuild failed:', err.message);
    }
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    watcher.close();
    await browser.close();
    process.exit(0);
  });
}

module.exports = { runTester };

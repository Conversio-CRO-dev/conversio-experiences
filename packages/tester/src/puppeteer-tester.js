const puppeteer = require('puppeteer');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { buildExperience } = require('./experience-builder.js');

// Builds the experience, opens the site and injects the built file. Rebuilds and reloads on save.
async function runTester(code, variation, url) {
  let built = await buildExperience(code, variation);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log(`[page:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.error('[page:error]', err.message));

  const injectBundle = async () => {
    const bundle = fs.readFileSync(built.file, 'utf-8');

    console.log(`\nNavigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    } catch (err) {
      console.error('Navigation failed:', err.message);
      return;
    }

    await page.addScriptTag({ content: bundle });
    console.log(`Injected ${path.basename(path.dirname(built.file))}/${path.basename(built.file)}\n`);
  };

  await injectBundle();

  console.log(`Watching ${built.target.folder}/src for changes...`);
  console.log('Press Ctrl+C to stop\n');

  const watcher = chokidar.watch(path.join(built.target.folder, 'src'), { ignoreInitial: true });

  watcher.on('change', async (file) => {
    try {
      console.log(`\n${path.basename(file)} changed, rebuilding...`);
      built = await buildExperience(code, variation);
      console.log('Rebuilt, reloading...');
      await injectBundle();
    } catch (err) {
      console.error('Rebuild failed:', err.message);
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

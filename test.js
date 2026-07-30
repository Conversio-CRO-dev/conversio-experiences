#!/usr/bin/env node

const puppeteer = require('puppeteer');
const sass = require('sass');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const clients = require('./clients.json');

function getClientUrl() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const prefix = branch.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();

    if (prefix && clients[prefix]) {
      return { url: clients[prefix], branch, prefix };
    }

    return { url: null, branch, prefix };
  } catch (_) {
    return { url: null, branch: null, prefix: null };
  }
}

const [,, experienceCode, urlArg] = process.argv;

if (!experienceCode) {
  console.log('\nUsage:   node test.js <CODE> [url]');
  console.log('Example: node test.js CNV001');
  console.log('         node test.js CNV001 https://www.example.com/some-page\n');
  process.exit(1);
}

const experiencePath = path.join(__dirname, 'experiences', experienceCode);
const jsPath = path.join(experiencePath, 'src', 'index.js');
const scssPath = path.join(experiencePath, 'src', 'styles.scss');

if (!fs.existsSync(experiencePath)) {
  console.error(`\nExperience not found: experiences/${experienceCode}`);
  process.exit(1);
}

if (!fs.existsSync(jsPath)) {
  console.error(`\nJS file not found: experiences/${experienceCode}/src/index.js`);
  process.exit(1);
}

const { url: clientUrl, branch, prefix } = getClientUrl();
const url = urlArg || clientUrl;

if (!url) {
  console.error(`\nNo URL found for branch "${branch}" (prefix: ${prefix}).`);
  console.error(`Add it to clients.json or pass a URL manually:\n`);
  console.error(`  node test.js ${variation} https://www.example.com\n`);
  process.exit(1);
}

function getJS() {
  let code = fs.readFileSync(jsPath, 'utf8');
  // Remove import/export statements for direct injection
  code = code.replace(/^import\s+.*?from\s+['"].*?['"];?$/gm, '');
  code = code.replace(/^export\s+/gm, '');
  return code;
}

function getCSS() {
  if (!fs.existsSync(scssPath)) return null;
  const content = fs.readFileSync(scssPath, 'utf8').trim();
  if (!content) return null;

  try {
    const result = sass.compile(scssPath);
    return result.css;
  } catch (err) {
    console.error('SCSS compile error:', err.message);
    return null;
  }
}

async function inject(page) {
  const js = getJS();
  const css = getCSS();

  if (css) {
    await page.addStyleTag({ content: css });
  }

  await page.addScriptTag({ content: js });

  const label = css ? 'JS + CSS' : 'JS only (no SCSS found or empty)';
  console.log(`  Injected ${experienceCode} [${label}]`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const [page] = await browser.pages();

  page.on('console', (msg) => {
    console.log(`  [page:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`  [page:error] ${err.message}`);
  });

  page.on('load', async () => {
    try {
      await inject(page);
    } catch (err) {
      console.error('  Injection failed:', err.message);
    }
  });

  console.log(`\n  Opening: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const watchPaths = [jsPath, scssPath].filter(fs.existsSync);

  chokidar.watch(watchPaths, { ignoreInitial: true }).on('change', async (file) => {
    console.log(`\n  Changed: ${path.basename(file)} — reloading...`);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
    } catch (_) {}
  });

  browser.on('disconnected', () => {
    console.log('\n  Browser closed. Stopping.\n');
    process.exit(0);
  });

  console.log(`
  Branch:      ${branch}
  Client:      ${prefix} → ${url}
  Experience:  ${experienceCode}
  JS:          experiences/${experienceCode}/src/index.js
  SCSS:        ${fs.existsSync(scssPath) ? `experiences/${experienceCode}/src/styles.scss` : 'none'}

  Watching for file changes — saves auto-reload.
  Close the browser to stop.
  `);
})();

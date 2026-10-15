#!/usr/bin/env node

const puppeteer = require('puppeteer');
const sass = require('sass');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { locate, resolveClient, checkSource, root } = require('./scripts/lib/experience.js');

const [, , experienceCode, variationOrUrl, urlArg] = process.argv;

if (!experienceCode) {
  console.log('\nUsage:   node test.js <CODE> [variation] [url]');
  console.log('Example: node test.js FN092 variation-1');
  console.log('         node test.js FN092 control');
  console.log('         node test.js FN092 variation-1 https://www.example.com/some-page\n');
  process.exit(1);
}

// The second argument is a variation folder, or a URL when the default variation is wanted.
let variation;
let givenUrl = urlArg;
if (variationOrUrl && /^https?:\/\//.test(variationOrUrl)) {
  givenUrl = variationOrUrl;
} else {
  variation = variationOrUrl;
}

let target;
try {
  target = locate(experienceCode, variation);
} catch (err) {
  console.error(`\n${err.message}\n`);
  process.exit(1);
}

const client = resolveClient(experienceCode, givenUrl);
if (!client.url) {
  console.error(`\nNo site found for ${experienceCode} (prefix: ${client.prefix || 'none'}, branch: ${client.branch || 'none'}).`);
  console.error('Add the prefix to clients.json or pass a URL:\n');
  console.error(`  node test.js ${experienceCode} ${target.variation || ''} https://www.example.com\n`);
  process.exit(1);
}

const label = target.variation || '(single folder)';
const relativeJs = path.relative(root, target.js);
const relativeScss = path.relative(root, target.scss);

function getJS() {
  const code = fs.readFileSync(target.js, 'utf8');
  const { problems, warnings } = checkSource(code);

  warnings.forEach((w) => console.warn(`  Warning: ${w}`));
  if (problems.length) {
    throw new Error(problems.join(' '));
  }
  return code;
}

function getCSS() {
  if (!fs.existsSync(target.scss)) return null;
  const content = fs.readFileSync(target.scss, 'utf8').trim();
  if (!content) return null;

  try {
    return sass.compile(target.scss).css;
  } catch (err) {
    console.error('  SCSS compile error:', err.message);
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
  console.log(`  Injected ${experienceCode} [${label}] [${css ? 'JS + CSS' : 'JS only'}]`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
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
      console.error('  Not injected:', err.message);
    }
  });

  console.log(`\n  Opening: ${client.url}`);
  await page.goto(client.url, { waitUntil: 'domcontentloaded' });

  const watchPaths = [target.js, target.scss].filter(fs.existsSync);

  chokidar.watch(watchPaths, { ignoreInitial: true }).on('change', async (file) => {
    console.log(`\n  Changed: ${path.basename(file)}, reloading...`);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
    } catch (_) {}
  });

  browser.on('disconnected', () => {
    console.log('\n  Browser closed. Stopping.\n');
    process.exit(0);
  });

  console.log(`
  Experience:  ${experienceCode} [${label}]
  Site:        ${client.prefix || 'url'} (from ${client.source}) ${client.url}
  JS:          ${relativeJs}
  SCSS:        ${fs.existsSync(target.scss) ? relativeScss : 'none'}

  Watching for file changes: saves auto-reload.
  Close the browser to stop.
  `);
})();

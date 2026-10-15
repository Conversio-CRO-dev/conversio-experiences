const fs = require('fs');
const path = require('path');
const { experienceDir, resolveClient, root } = require('./lib/experience.js');
const { writeGuide } = require('./lib/guide.js');

const args = process.argv.slice(2);
const code = args.find(a => !a.startsWith('--'));

function option(name) {
  const match = args.find(a => a.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3).trim() : '';
}

if (!code) {
  console.log(`
Usage:
  npm run guide -- <CODE> [--asana="<ticket link>"] [--figma="<frame link>"]

Example:
  npm run guide -- FN092 --asana="https://app.asana.com/..." --figma="https://www.figma.com/design/..."

Rewrites experiences/<CODE>/guide.html, the step-by-step page for that experience. The scaffold makes
it for you. Run this to add the Asana and Figma links, or to make the page for an older experience.
It starts again each time, so pass both links every time. Several Figma links: put them in the quotes,
with a space between them.
  `);
  process.exit(1);
}

const folder = experienceDir(code);

if (!fs.existsSync(folder)) {
  console.error(`Error: Experience not found: experiences/${code}`);
  process.exit(1);
}

const { url, prefix } = resolveClient(code);

try {
  const file = writeGuide(folder, { code, prefix, site: url, asana: option('asana'), figma: option('figma') });
  console.log(`Wrote ${path.relative(root, file)}. Open it in a browser.`);
} catch (err) {
  console.error(`Could not write the guide: ${err.message}`);
  process.exit(1);
}

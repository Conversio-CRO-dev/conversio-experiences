const fs = require('fs');
const path = require('path');
const { buildExperience } = require('../packages/tester/src/experience-builder.js');
const { folderNames, root } = require('./lib/experience.js');

const [code, variation] = process.argv.slice(2);

if (!code) {
  console.log('Usage: npm run build:experience -- <CODE> [variation]');
  console.log('Example: npm run build:experience -- FN092 variation-1');
  console.log('         npm run build:experience -- FN092          (every variation and the control)');
  process.exit(1);
}

(async () => {
  let names;
  try {
    names = variation ? [variation] : folderNames(code);
  } catch (err) {
    console.error(`Build failed: ${err.message}`);
    process.exit(1);
  }

  for (const name of names) {
    console.log(`Building ${code}${name ? ' ' + name : ''}...`);

    let result;
    try {
      result = await buildExperience(code, name || undefined);
    } catch (err) {
      console.error(`Build failed: ${err.message}`);
      process.exit(1);
    }

    console.log(`  Output: ${path.relative(root, result.file)}`);

    // Dynamic Yield and Adobe Target do not support ${...} in the code that is pasted.
    if (fs.readFileSync(result.file, 'utf8').indexOf('${') !== -1) {
      console.warn('  Warning: the built file contains ${...}. Dynamic Yield and Adobe Target do not support it.');
    }
  }
})();

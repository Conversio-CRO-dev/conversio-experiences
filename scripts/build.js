const fs = require('fs');
const path = require('path');
const { buildExperience } = require('../packages/tester/src/experience-builder.js');
const { folderNames, locate, checkSource, compileCss, root } = require('./lib/experience.js');

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

    let files;
    let result;
    let css;
    try {
      files = locate(code, name || undefined);
      result = await buildExperience(code, name || undefined);
      css = compileCss(files.scss);
    } catch (err) {
      console.error(`Build failed: ${err.message}`);
      process.exit(1);
    }

    // What gets pasted into the testing tool: the source file as it is, plus this CSS file.
    // main.js is a bundled copy that only the tester package uses.
    const cssFile = path.join(path.dirname(result.file), 'styles.css');
    if (css) {
      fs.writeFileSync(cssFile, css);
    } else {
      fs.rmSync(cssFile, { force: true });
    }

    console.log(`  JS to paste:  ${path.relative(root, files.js)}`);
    console.log(`  CSS to paste: ${css ? path.relative(root, cssFile) : 'none (no styles in this folder)'}`);

    const { problems, warnings } = checkSource(fs.readFileSync(files.js, 'utf8'));
    problems.concat(warnings).forEach((message) => console.warn(`  Warning: ${message}`));
  }
})();

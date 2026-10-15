const fs = require('fs');
const path = require('path');
const { clients, experienceDir, prefixOf } = require('./lib/experience.js');
const { writeGuide } = require('./lib/guide.js');

const args = process.argv.slice(2);
const experienceCode = args.find(a => !a.startsWith('--'));
const clientMatch = args.find(a => a.startsWith('--client='));

// The value of --name=value. Links have "=" in them, so keep everything after the first one.
function option(name) {
  const match = args.find(a => a.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3).trim() : '';
}

if (!experienceCode || !/^[A-Za-z][A-Za-z0-9._-]*$/.test(experienceCode)) {
  console.log(`
Usage:
  npm run scaffold -- <CODE> [--client=<PREFIX>] [--asana="<ticket link>"] [--figma="<frame link>"]

Example:
  npm run scaffold -- FN092

The client comes from the leading letters of the code (FN092 is FN). Pass --client=<PREFIX> if the
code does not start with the client's prefix. Prefixes are in clients.json:
  ${Object.keys(clients).join(', ')}

The Asana and Figma links are optional. They go into guide.html, the step-by-step page the scaffold
makes for the experience.
  `);
  process.exit(1);
}

const client = clientMatch ? clientMatch.split('=')[1].toUpperCase() : prefixOf(experienceCode);

if (!clients[client]) {
  console.error(`Error: no client with prefix "${client}" in clients.json.`);
  console.error('Add it there (prefix: site URL), or pass --client=<PREFIX> with one that exists.');
  process.exit(1);
}

const experiencePath = experienceDir(experienceCode);

if (fs.existsSync(experiencePath)) {
  console.error(`Error: Experience "${experienceCode}" already exists`);
  process.exit(1);
}

fs.mkdirSync(experiencePath, { recursive: true });

const variations = ['variation-1', 'variation-2', 'control'];

const packageJson = {
  name: `experience-${experienceCode.toLowerCase()}`,
  version: '0.1.0',
  description: `Conversio CRO experience: ${experienceCode}`,
  client: client,
  scripts: {
    'build': `npm run build:experience -- ${experienceCode}`,
    'build:v1': `npm run build:experience -- ${experienceCode} variation-1`,
    'build:v2': `npm run build:experience -- ${experienceCode} variation-2`,
    'build:control': `npm run build:experience -- ${experienceCode} control`,
    'test:v1': `node test.js ${experienceCode} variation-1`,
    'test:v2': `node test.js ${experienceCode} variation-2`,
    'test:control': `node test.js ${experienceCode} control`,
  },
  private: true,
};

fs.writeFileSync(
  path.join(experiencePath, 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
);

variations.forEach((variation) => {
  const varPath = path.join(experiencePath, variation);
  const srcPath = path.join(varPath, 'src');

  fs.mkdirSync(srcPath, { recursive: true });

  const indexJs = `console.log('${experienceCode} - ${variation} loaded');
`;

  fs.writeFileSync(path.join(srcPath, 'index.js'), indexJs);

  const stylesScss = `// ${experienceCode} - ${variation} Styles
`;

  fs.writeFileSync(path.join(srcPath, 'styles.scss'), stylesScss);

  const webpackConfig = `const baseConfig = require('../../../config/webpack.experience.js');

module.exports = {
  ...baseConfig('${experienceCode}', '${variation}'),
  // Override base config here if needed
};
`;

  fs.writeFileSync(path.join(varPath, 'webpack.config.js'), webpackConfig);
});

const readme = `# ${experienceCode}

Experience for: **${client}** (${clients[client]})

## Structure

\`\`\`
${experienceCode}/
├── variation-1/src/index.js, styles.scss
├── variation-2/src/index.js, styles.scss   (delete if the ticket has one variation)
├── control/src/index.js                    (tracking only, no page changes)
└── guide.html                              (step-by-step page for this experience, open it in a browser)
\`\`\`

## Develop

\`\`\`bash
npm run test:v1       # or test:v2, test:control
\`\`\`

## Build

\`\`\`bash
npm run build         # every folder: compiles the CSS to dist/${experienceCode}/<folder>/styles.css
npm run build:v1      # or build:v2, build:control
\`\`\`

## Ship

Paste <folder>/src/index.js into the testing tool exactly as it is, and dist/${experienceCode}/<folder>/styles.css if the build wrote one.

## Conventions

See CLAUDE.md in the repo root: naming, tracking, what a finished experience looks like.
`;

fs.writeFileSync(path.join(experiencePath, 'README.md'), readme);

// The step-by-step page for this experience. A problem with it must not undo the scaffold.
let guideNote = 'guide.html';
try {
  writeGuide(experiencePath, {
    code: experienceCode,
    prefix: client,
    site: clients[client],
    asana: option('asana'),
    figma: option('figma'),
  });
} catch (err) {
  guideNote = `(guide.html was not written: ${err.message})`;
}

console.log(`
Created: ${experiencePath}

Structure:
  ${experienceCode}/
  ├── variation-1/
  ├── variation-2/
  ├── control/
  └── ${guideNote}

Next:
  Open experiences/${experienceCode}/guide.html in a browser. It is filled in for this experience.
  node test.js ${experienceCode} variation-1
`);

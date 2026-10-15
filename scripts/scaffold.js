const fs = require('fs');
const path = require('path');
const { clients, experienceDir, prefixOf } = require('./lib/experience.js');

const args = process.argv.slice(2);
const experienceCode = args.find(a => !a.startsWith('--'));
const clientMatch = args.find(a => a.startsWith('--client='));

if (!experienceCode || !/^[A-Za-z][A-Za-z0-9._-]*$/.test(experienceCode)) {
  console.log(`
Usage:
  npm run scaffold -- <CODE> [--client=<PREFIX>]

Example:
  npm run scaffold -- FN092

The client comes from the leading letters of the code (FN092 is FN). Pass --client=<PREFIX> if the
code does not start with the client's prefix. Prefixes are in clients.json:
  ${Object.keys(clients).join(', ')}
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
└── control/src/index.js                    (tracking only, no page changes)
\`\`\`

## Develop

\`\`\`bash
npm run test:v1       # or test:v2, test:control
\`\`\`

## Build

\`\`\`bash
npm run build         # every folder: dist/${experienceCode}/<folder>/main.js
npm run build:v1      # or build:v2, build:control
\`\`\`

## Conventions

See CLAUDE.md in the repo root: naming, tracking, what a finished experience looks like.
`;

fs.writeFileSync(path.join(experiencePath, 'README.md'), readme);

console.log(`
Created: ${experiencePath}

Structure:
  ${experienceCode}/
  ├── variation-1/
  ├── variation-2/
  └── control/

Next:
  node test.js ${experienceCode} variation-1
`);

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const codeMatch = args.find(a => !a.startsWith('--'));
const clientMatch = args.find(a => a.startsWith('--client='));

if (!codeMatch || !clientMatch) {
  console.log(`
Usage:
  npm run scaffold -- WN003 --client=warner-hotels

Available clients:
  - warner-hotels
  - team-sport
  - laithwaites
  - finisterre
  `);
  process.exit(1);
}

const experienceCode = codeMatch;
const client = clientMatch.split('=')[1];
const experiencePath = path.resolve(__dirname, '../experiences', experienceCode);

if (fs.existsSync(experiencePath)) {
  console.error(`Error: Experience "${experienceCode}" already exists`);
  process.exit(1);
}

fs.mkdirSync(experiencePath, { recursive: true });
fs.mkdirSync(path.join(experiencePath, 'src'), { recursive: true });

const packageJson = {
  name: `experience-${experienceCode.toLowerCase()}`,
  version: '0.1.0',
  description: `Conversio CRO experience: ${experienceCode}`,
  client: client,
  scripts: {
    build: 'npm run build:experience -- ' + experienceCode,
    test: 'npm run tester -- test ' + experienceCode,
  },
  private: true,
  dependencies: {
    '@conversio/helpers': '*',
  },
};

fs.writeFileSync(
  path.join(experiencePath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

const indexJs = `import { init, elementReady, fireDataLayerEvent } from '@conversio/helpers';

const runExperience = () => {
  console.log('${experienceCode} loaded');

  // Find key page elements
  elementReady('body')
    .then(() => {
      console.log('DOM ready');
      // Add your experience code here
    })
    .catch(err => console.error(err));
};

init(5, runExperience);
`;

fs.writeFileSync(path.join(experiencePath, 'src', 'index.js'), indexJs);

const stylesScss = `// Add your styles here
// Styles will be injected into the page when the experience loads

body {
  // Example style
}
`;

fs.writeFileSync(path.join(experiencePath, 'src', 'styles.scss'), stylesScss);

const webpackConfig = `const path = require('path');
const baseConfig = require('../../config/webpack.experience.js');

module.exports = {
  ...baseConfig('${experienceCode}'),
  // Override base config here if needed
};
`;

fs.writeFileSync(path.join(experiencePath, 'webpack.config.js'), webpackConfig);

const readme = `# ${experienceCode}

Experience for: **${client}**

## Development

\`\`\`bash
npm run test
\`\`\`

This launches a Puppeteer browser with hot-reload. Edit files in \`src/\` and they'll auto-inject.

## Build

\`\`\`bash
npm run build
\`\`\`

Output: \`dist/${experienceCode}/main.js\`

## Structure

- \`src/index.js\` - Entry point, wrapped in \`init()\` helper
- \`src/styles.scss\` - Styles (auto-injected via webpack)
- \`webpack.config.js\` - Extends shared config

## Conventions

- Use \`elementReady(selector)\` to wait for DOM elements
- Use \`fireDataLayerEvent(name, data)\` for tracking
- Avoid selectors on hashed \`css-*\` classes; prefer stable classes or \`data-testid\`
`;

fs.writeFileSync(path.join(experiencePath, 'README.md'), readme);

console.log(`
Created: ${experiencePath}

Next:
  cd experiences/${experienceCode}
  npm install
  npm run test
`);

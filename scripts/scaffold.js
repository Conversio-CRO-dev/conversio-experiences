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

const variations = ['variation-1', 'variation-2', 'control'];

const packageJson = {
  name: `experience-${experienceCode.toLowerCase()}`,
  version: '0.1.0',
  description: `Conversio CRO experience: ${experienceCode}`,
  client: client,
  scripts: {
    'build:v1': `npm run build:experience -- ${experienceCode} variation-1`,
    'build:v2': `npm run build:experience -- ${experienceCode} variation-2`,
    'build:control': `npm run build:experience -- ${experienceCode} control`,
    'test:v1': `node test.js ${experienceCode} variation-1`,
    'test:v2': `node test.js ${experienceCode} variation-2`,
    'test:control': `node test.js ${experienceCode} control`,
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

variations.forEach((variation) => {
  const varPath = path.join(experiencePath, variation);
  const srcPath = path.join(varPath, 'src');

  fs.mkdirSync(srcPath, { recursive: true });

  const indexJs = `console.log('${experienceCode} - ${variation} loaded');

// Write your plain JavaScript here
// No imports needed - just vanilla JS

// Example: Wait for an element
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(\`Element "\${selector}" not found after \${timeout}ms\`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
};

// Example: Modify the page
waitForElement('body')
  .then(() => {
    console.log('Body found, ready to modify');
    // Add your code here
  })
  .catch(err => console.error('Error:', err));

// Example: Send tracking event
if (window.dataLayer) {
  window.dataLayer.push({
    event: 'conversioEvent',
    conversioEventName: '${experienceCode.toUpperCase()}_${variation.toUpperCase()}_LOADED',
  });
}
`;

  fs.writeFileSync(path.join(srcPath, 'index.js'), indexJs);

  const stylesScss = `// ${experienceCode} - ${variation} Styles
// Auto-compiled and injected into the page

// Use SCSS features: variables, mixins, nesting
// Or plain CSS - both work!

// Example variables
$primary-color: #667eea;
$padding-m: 20px;

// Your styles here
// .my-element {
//   background: $primary-color;
//   padding: $padding-m;
//
//   &:hover {
//     opacity: 0.9;
//   }
// }
`;

  fs.writeFileSync(path.join(srcPath, 'styles.scss'), stylesScss);

  const webpackConfig = `const path = require('path');
const baseConfig = require('../../../config/webpack.experience.js');

module.exports = {
  ...baseConfig('${experienceCode}', '${variation}'),
  // Override base config here if needed
};
`;

  fs.writeFileSync(path.join(varPath, 'webpack.config.js'), webpackConfig);
});

const readme = `# ${experienceCode}

Experience for: **${client}**

## Structure

\`\`\`
${experienceCode}/
├── variation-1/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
├── variation-2/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
├── control/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
└── package.json
\`\`\`

## Development

Test a specific variation:

\`\`\`bash
npm run test:v1    # Test variation 1
npm run test:v2    # Test variation 2
npm run test:control  # Test control
\`\`\`

## Build

Build a specific variation:

\`\`\`bash
npm run build:v1    # Build variation 1
npm run build:v2    # Build variation 2
npm run build:control  # Build control
\`\`\`

## Conventions

- Use \`elementReady(selector)\` to wait for DOM elements
- Use \`fireDataLayerEvent(name, data)\` for tracking
- Avoid selectors on hashed \`css-*\` classes; prefer stable classes or \`data-testid\`
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
  cd experiences/${experienceCode}
  npm install
  npm run test:v1
`);

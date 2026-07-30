const fs = require('fs');
const path = require('path');
const { buildExperience } = require('../packages/tester/src/experience-builder.js');

const experienceCode = process.argv[2];

if (!experienceCode) {
  console.log('Usage: npm run build:experience -- <CODE>');
  console.log('Example: npm run build:experience -- WN003');
  process.exit(1);
}

const experiencePath = path.resolve(__dirname, '../experiences', experienceCode);

if (!fs.existsSync(experiencePath)) {
  console.error(`Error: Experience "${experienceCode}" not found`);
  process.exit(1);
}

console.log(`Building ${experienceCode}...`);

buildExperience(experienceCode, experiencePath)
  .then(() => {
    console.log(`\nSuccess! Output: dist/${experienceCode}/main.js`);
  })
  .catch(err => {
    console.error('Build failed:', err.message);
    process.exit(1);
  });

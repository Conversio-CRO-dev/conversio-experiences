const path = require('path');
const { resolveClient, root } = require('../../../scripts/lib/experience.js');
const { buildExperience } = require('./experience-builder.js');
const { runTester } = require('./puppeteer-tester.js');

const [command, code, variationOrUrl, urlArg] = process.argv.slice(2);

if (!command || !code) {
  console.log(`
Conversio CRO Tester CLI. Builds the experience with webpack, then (for test) injects the built file,
which is what gets pasted into the testing tool. For quick work while building, use: node test.js

Usage:
  tester build <CODE> [variation]
  tester test <CODE> [variation] [url]

Examples:
  tester build FN092 variation-1
  tester test FN092 control
  `);
  process.exit(1);
}

let variation;
let givenUrl = urlArg;
if (variationOrUrl && /^https?:\/\//.test(variationOrUrl)) {
  givenUrl = variationOrUrl;
} else {
  variation = variationOrUrl;
}

if (command === 'build') {
  buildExperience(code, variation)
    .then((result) => {
      console.log(`\nBuilt: ${path.relative(root, result.file)}`);
    })
    .catch((err) => {
      console.error('Build failed:', err.message);
      process.exit(1);
    });
} else if (command === 'test') {
  const client = resolveClient(code, givenUrl);

  if (!client.url) {
    console.error(`Error: no site found for ${code}. Add its prefix to clients.json or pass a URL.`);
    process.exit(1);
  }

  console.log(`Testing ${code}${variation ? ' ' + variation : ''} on ${client.url}...`);
  runTester(code, variation, client.url).catch((err) => {
    console.error('Tester failed:', err.stack || err.message || err);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

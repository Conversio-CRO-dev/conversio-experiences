const fs = require('fs');
const path = require('path');
const { loadClients } = require('./clients.js');
const { buildExperience } = require('./experience-builder.js');
const { runTester } = require('./puppeteer-tester.js');

const args = process.argv.slice(2);
const command = args[0];
const experienceCode = args[1];

if (!command || !experienceCode) {
  console.log(`
Conversio CRO Tester CLI

Usage:
  tester build <CODE>           Build an experience
  tester test <CODE>            Test an experience locally

Examples:
  tester build WN003
  tester test WN003
  `);
  process.exit(1);
}

const experiencePath = path.resolve(__dirname, '../../experiences', experienceCode);
if (!fs.existsSync(experiencePath)) {
  console.error(`Error: Experience "${experienceCode}" not found at ${experiencePath}`);
  console.error('Run: npm run scaffold -- <CODE> --client=<CLIENT>');
  process.exit(1);
}

const pkgPath = path.join(experiencePath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const clientCode = pkg.client;

if (!clientCode) {
  console.error(`Error: No client defined in ${pkgPath}`);
  console.error('Add "client" field to package.json');
  process.exit(1);
}

const clients = loadClients();
const client = clients[clientCode];

if (!client) {
  console.error(`Error: Client "${clientCode}" not found in config/clients.json`);
  process.exit(1);
}

if (command === 'build') {
  buildExperience(experienceCode, experiencePath)
    .then(() => {
      console.log(`\nBuilt: dist/${experienceCode}/main.js`);
    })
    .catch(err => {
      console.error('Build failed:', err.message);
      process.exit(1);
    });
} else if (command === 'test') {
  console.log(`Testing ${experienceCode} on ${client.name}...`);
  runTester(experienceCode, experiencePath, client)
    .catch(err => {
      console.error('Tester failed:', err.message);
      process.exit(1);
    });
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

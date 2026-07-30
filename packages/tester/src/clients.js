const fs = require('fs');
const path = require('path');

function loadClients() {
  const monorepoRoot = path.resolve(__dirname, '../../..');
  const clientsPath = path.resolve(monorepoRoot, 'config/clients.json');
  const data = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));
  return data.clients;
}

module.exports = { loadClients };

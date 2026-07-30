const fs = require('fs');
const path = require('path');

function loadClients() {
  const clientsPath = path.resolve(__dirname, '../../config/clients.json');
  const data = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));
  return data.clients;
}

module.exports = { loadClients };

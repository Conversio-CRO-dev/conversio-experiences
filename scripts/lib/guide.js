// Makes experiences/<ID>/guide.html: the step-by-step page for one experience, filled in from its
// test ID, the client site and, if they are given, the Asana and Figma links. The page itself is
// scripts/templates/experience-guide.html. Used by the scaffold and by `npm run guide`.

const fs = require('fs');
const path = require('path');

const template = path.join(__dirname, '..', 'templates', 'experience-guide.html');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// What the {{TOKENS}} in the template become. Without links, the prompts tell Claude where to look.
function guideValues({ code, prefix, site, asana, figma }) {
  return {
    ID: code,
    PREFIX: prefix || '',
    SITE: site || `not set for ${prefix || code} in clients.json: add the URL at the end of the test command`,
    ASANA_LINE: asana
      ? `Asana ticket: ${asana}`
      : `Asana ticket: the one for ${code}. Search Asana for the test ID. If you cannot find it, ask me.`,
    FIGMA_LINE: figma
      ? `Figma: ${figma}`
      : 'Figma: the frame links are in the ticket. If they are not, ask me.',
  };
}

function buildGuide(options) {
  const values = guideValues(options);

  return fs.readFileSync(template, 'utf8').replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`unknown token ${match} in the guide template`);
    return escapeHtml(values[key]);
  });
}

// Writes guide.html into the experience's folder and returns the path.
function writeGuide(folder, options) {
  const file = path.join(folder, 'guide.html');
  fs.writeFileSync(file, buildGuide(options));
  return file;
}

module.exports = { buildGuide, writeGuide };

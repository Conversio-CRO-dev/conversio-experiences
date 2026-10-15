// Finds an experience on disk and works out which client site to open for it.
// Used by test.js, scripts/build.js and the tester package, so they all agree.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const clients = require(path.join(root, 'clients.json'));

const VARIATION_FOLDERS = ['variation-1', 'variation-2', 'control'];

function experienceDir(code) {
  return path.join(root, 'experiences', code);
}

// Older experiences keep src/ at the top of their folder. Newer ones have a folder per variation.
function isSingleFolder(code) {
  return fs.existsSync(path.join(experienceDir(code), 'src', 'index.js'));
}

// The folders that can be built or tested: ['variation-1', 'control', ...], or [null] for a single folder.
function folderNames(code) {
  if (!fs.existsSync(experienceDir(code))) {
    throw new Error(`Experience not found: experiences/${code}`);
  }
  if (isSingleFolder(code)) return [null];

  return VARIATION_FOLDERS.filter((name) =>
    fs.existsSync(path.join(experienceDir(code), name, 'src', 'index.js'))
  );
}

function locate(code, variation) {
  const names = folderNames(code);
  const single = names[0] === null;
  const name = single ? null : variation || 'variation-1';

  if (!single && names.indexOf(name) === -1) {
    throw new Error(
      `No "${name}" folder in experiences/${code}. Available: ${names.join(', ') || 'none'}`
    );
  }

  const folder = single ? experienceDir(code) : path.join(experienceDir(code), name);

  return {
    code,
    variation: name,
    folder,
    js: path.join(folder, 'src', 'index.js'),
    scss: path.join(folder, 'src', 'styles.scss'),
  };
}

function prefixOf(text) {
  const match = String(text || '').match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : '';
}

function currentBranch() {
  try {
    return execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {
    return '';
  }
}

function packageClient(code) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(experienceDir(code), 'package.json'), 'utf8'));
    return String(pkg.client || '').toUpperCase();
  } catch (_) {
    return '';
  }
}

// Which site to open, in this order: a URL passed in, the experience's own "client" in its
// package.json (only if it is a prefix in clients.json), the leading letters of the
// experience code (FN092 is FN), then the leading letters of the branch name.
function resolveClient(code, urlArg) {
  if (urlArg) return { url: urlArg, prefix: null, source: 'url argument' };

  const branch = currentBranch();
  const candidates = [
    ['the experience package.json', packageClient(code)],
    ['the experience code', prefixOf(code)],
    ['the branch name', prefixOf(branch)],
  ];

  for (const [source, prefix] of candidates) {
    if (prefix && clients[prefix]) return { url: clients[prefix], prefix, source, branch };
  }

  return { url: null, prefix: prefixOf(code), source: null, branch };
}

// test.js injects plain JavaScript, so imports cannot work there. Say so, rather than strip them
// and leave something undefined at run time.
function checkSource(code) {
  const problems = [];
  const warnings = [];

  if (/^\s*(import\s[^;]*\sfrom\s|import\s*['"]|export\s)/m.test(code)) {
    problems.push(
      'import/export found. Experiences are plain JavaScript with no imports: write the helper in the file.'
    );
  }
  if (code.indexOf('${') !== -1) {
    warnings.push(
      'found ${...}. Dynamic Yield and Adobe Target do not support it. Use string concatenation, or check the built file has none.'
    );
  }

  return { problems, warnings };
}

module.exports = {
  root,
  clients,
  VARIATION_FOLDERS,
  experienceDir,
  folderNames,
  locate,
  prefixOf,
  resolveClient,
  checkSource,
};

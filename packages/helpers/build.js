const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(distDir, file);
  fs.copyFileSync(src, dest);
  console.log(`Built: ${file}`);
});

console.log(`\nHelpers built to ${distDir}`);

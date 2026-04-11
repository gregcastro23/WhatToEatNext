const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /Cosmic Paycheck/gi, replacement: 'Cosmic Yield' },
  { regex: /\bAdept\b/g, replacement: 'Premium' },
  { regex: /\badept\b/g, replacement: 'premium' },
  { regex: /☉/g, replacement: '🝇' },
  { regex: /☽/g, replacement: '🝑' },
  { regex: /⊕/g, replacement: '🝙' },
  { regex: /☿/g, replacement: '🝉' },
  { regex: /adept-table/g, replacement: 'premium-table' } // Just in case for adept-table
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.sql') || filePath.endsWith('.md')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk('./src').concat(walk('./database'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

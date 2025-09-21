const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'dist-scripts');

function renameJsToCjs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      renameJsToCjs(full);
    } else if (stat.isFile() && entry.endsWith('.js')) {
      const target = full.replace(/\.js$/, '.cjs');
      fs.renameSync(full, target);
    }
  }
}

function rewriteRelativeRequiresToCjs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      rewriteRelativeRequiresToCjs(full);
    } else if (stat.isFile() && entry.endsWith('.cjs')) {
      let code = fs.readFileSync(full, 'utf8');
      // Replace require('./x') or require('../x') (without extension) to .cjs
      code = code.replace(/require\((['"])(\.\.\/|\.\/[^\n'"()]+?)(\1)\)/g, (m, q, rel, q2) => {
        // If already has extension, leave it
        if (/\.(cjs|js|mjs|json)$/i.test(rel)) return m;
        return `require(${q}${rel}.cjs${q})`;
      });
      fs.writeFileSync(full, code, 'utf8');
    }
  }
}

renameJsToCjs(OUT_DIR);
rewriteRelativeRequiresToCjs(OUT_DIR);
console.log('Renamed compiled .js files to .cjs and rewrote relative requires under dist-scripts');

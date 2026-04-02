const fs = require('fs');
const { execSync } = require('child_process');

let out = '';
try { execSync('yarn tsc --noEmit'); } catch(e) { out = e.stdout ? e.stdout.toString() : ''; }

const lines = out.split('\n');
const fixes = {}; 

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Destructuring error
  const matchProp = line.match(/^(.+?)(?::|\()(\d+)[,:](\d+)(?:\)|)\s*(?:-|:)\s*error TS2339: Property '(_[^']+)' does not exist/);
  if (matchProp) {
    const file = matchProp[1];
    const row = parseInt(matchProp[2], 10);
    const varName = matchProp[4]; 
    const originalProp = varName.substring(1);
    if (!fixes[file]) fixes[file] = [];
    fixes[file].push({ type: 'prop', line: row, varName, originalProp });
  }
  
  // Import error
  const matchImport = line.match(/^(.+?)(?::|\()(\d+)[,:](\d+)(?:\)|)\s*(?:-|:)\s*error TS2724: '[^']+' has no exported member named '(_[^']+)'. Did you mean '([^']+)'/);
  if (matchImport) {
    const file = matchImport[1];
    const row = parseInt(matchImport[2], 10);
    const varName = matchImport[4];
    const originalProp = matchImport[5];
    if (!fixes[file]) fixes[file] = [];
    fixes[file].push({ type: 'import', line: row, varName, originalProp });
  }

  // TS2552: Cannot find name
  const matchName = line.match(/^(.+?)(?::|\()(\d+)[,:](\d+)(?:\)|)\s*(?:-|:)\s*error TS2552: Cannot find name '(_[^']+)'. Did you mean '([^']+)'/);
  if (matchName) {
    const file = matchName[1];
    const row = parseInt(matchName[2], 10);
    const varName = matchName[4];
    const originalProp = matchName[5];
    if (!fixes[file]) fixes[file] = [];
    fixes[file].push({ type: 'name', line: row, varName, originalProp });
  }
}

for (const [file, fileFixes] of Object.entries(fixes)) {
  let content = fs.readFileSync(file, 'utf8');
  let fileLines = content.split('\n');
  
  fileFixes.sort((a, b) => b.line - a.line).forEach(fix => {
    const idx = fix.line - 1;
    let l = fileLines[idx];
    
    if (fix.type === 'prop') {
      const regex = new RegExp(`\\b${fix.varName}\\b`);
      l = l.replace(regex, `${fix.originalProp}: ${fix.varName}`);
    } else if (fix.type === 'import') {
      const regex = new RegExp(`\\b${fix.varName}\\b`);
      l = l.replace(regex, `${fix.originalProp} as ${fix.varName}`);
    } else if (fix.type === 'name') {
      const regex = new RegExp(`\\b${fix.varName}\\b`);
      l = l.replace(regex, fix.originalProp);
    }
    
    fileLines[idx] = l;
  });
  
  fs.writeFileSync(file, fileLines.join('\n'), 'utf8');
}

console.log(`Applied automatic tsc fixes to ${Object.keys(fixes).length} files.`);

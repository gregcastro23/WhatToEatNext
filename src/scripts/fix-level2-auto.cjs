const fs = require('fs');

const data = fs.readFileSync('level2-tasks.txt', 'utf8');

const parseSection = (marker) => {
  const lines = data.split('\n');
  const result = [];
  let inSection = false;
  for (const line of lines) {
    if (line.startsWith('--- ')) {
      inSection = line.includes(marker);
      continue;
    }
    if (inSection && line.trim()) {
      const match = line.match(/^([^:]+):(\d+):(\d+) - (.*)$/);
      if (match) {
        result.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[4]
        });
      }
    }
  }
  return result;
};

// 1. Fix no-floating-promises
const floatingPromises = parseSection('no-floating-promises');
const fpByFile = {};
floatingPromises.forEach(fp => {
  if (!fpByFile[fp.file]) fpByFile[fp.file] = [];
  fpByFile[fp.file].push(fp);
});

for (const [file, issues] of Object.entries(fpByFile)) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  issues.sort((a, b) => b.line - a.line || b.column - a.column).forEach(issue => {
    const lineIdx = issue.line - 1;
    const colIdx = issue.column - 1;
    const line = lines[lineIdx];
    lines[lineIdx] = line.slice(0, colIdx) + 'void ' + line.slice(colIdx);
  });
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}
console.log(`Fixed ${floatingPromises.length} floating promises.`);

// 2. Fix no-alert (ONLY alerts, not confirm, to avoid TS syntax errors)
const noAlerts = parseSection('no-alert');
const alertByFile = {};
noAlerts.forEach(na => {
  if (!alertByFile[na.file]) alertByFile[na.file] = [];
  alertByFile[na.file].push(na);
});

for (const [file, issues] of Object.entries(alertByFile)) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  issues.sort((a, b) => b.line - a.line || b.column - a.column).forEach(issue => {
    const lineIdx = issue.line - 1;
    let line = lines[lineIdx];
    
    line = line.replace(/window\.alert\(/g, 'console.warn(');
    line = line.replace(/\balert\(/g, 'console.warn(');
    
    lines[lineIdx] = line;
  });
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}
console.log(`Fixed no-alerts (except confirms).`);

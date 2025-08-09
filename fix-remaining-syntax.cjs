#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Get files with remaining TS1136 errors
const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS1136"', {
  encoding: 'utf8',
});
const errorLines = output.split('\n').filter(line => line.includes('TS1136'));

const fileErrors = {};
errorLines.forEach(line => {
  const match = line.match(/^(.+\.tsx?)\((\d+),\d+\):/);
  if (match) {
    const [, filePath, lineNum] = match;
    if (!fileErrors[filePath]) fileErrors[filePath] = [];
    fileErrors[filePath].push(parseInt(lineNum));
  }
});

for (const [filePath, lines] of Object.entries(fileErrors)) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const contentLines = content.split('\n');

    let modified = false;
    lines.forEach(lineNum => {
      const line = contentLines[lineNum - 1];
      if (line && line.includes('{,')) {
        contentLines[lineNum - 1] = line.replace(/\{,/g, '{');
        modified = true;
        console.log(`Fixed line ${lineNum} in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, contentLines.join('\n'));
    }
  } catch (error) {
    console.log(`Error processing ${filePath}:`, error.message);
  }
}

console.log('Syntax fix complete');

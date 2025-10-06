#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all TypeScript and JavaScript files in src directory
async function findFiles() {
  const pattern = 'src/**/*.{ts,tsx,js,jsx}';
  const files = await glob(pattern, { cwd: process.cwd() });
  return files;
}

// Fix trailing commas in a file
function fixTrailingCommas(content) {
  // Pattern 1: Trailing commas in function calls/statements
  // Match: console.log('something'),
  // But NOT: console.log('something', arg),
  content = content.replace(/(\w+)\s*\(\s*[^)]*[^,]\s*\)\s*,/g, '$1);');

  // Pattern 2: Trailing commas in variable declarations
  // Match: const x = value,
  content = content.replace(/(\w+)\s*=\s*[^;]*[^,]\s*,/g, '$1;');

  // Pattern 3: Trailing commas in object property assignments
  // Match: prop: value,
  // But be careful not to break valid object syntax
  content = content.replace(/(\w+|'[^']*'|"[^"]*")\s*:\s*[^,}]*[^,]\s*,/g, '$1;');

  return content;
}

// Process all files
async function processFiles() {
  const files = await findFiles();
  let totalFixed = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fixedContent = fixTrailingCommas(content);

      if (content !== fixedContent) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        console.log(`Fixed: ${file}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nTotal files fixed: ${totalFixed}`);
}

processFiles().catch(console.error);

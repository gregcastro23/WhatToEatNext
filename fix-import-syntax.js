#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Files to process
const patterns = [
  'src/**/*.ts',
  'src/**/*.tsx'
];

console.log('🔧 Starting Phase 2: Import Resolution - Syntax Fixes');

async function fixFile(filePath) {
  console.log(`📝 Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Fix octal literals (01, 02, 03, etc. -> 0, 1, 0, 2, 0, 3)
  const octalRegex = /\b0([0-7])\b/g;
  if (octalRegex.test(content)) {
    content = content.replace(octalRegex, '0, $1');
    modified = true;
  }

  // Pattern 2: Add missing semicolons after logger calls and assignments
  const missingSemicolonRegex = /(_logger\.(warn|info|error|debug)\([^)]+\))\s*$/gm;
  if (missingSemicolonRegex.test(content)) {
    content = content.replace(missingSemicolonRegex, '$1;');
    modified = true;
  }

  // Pattern 3: Fix malformed return statements
  const returnRegex = /return\s*\{\s*$/gm;
  if (returnRegex.test(content)) {
    // This is harder to fix automatically, skip for now
  }

  // Pattern 4: Fix missing commas in function parameters
  const paramCommaRegex = /\(\s*([^)]+)\s*\)\s*;/g;
  // This is complex, skip for now

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
}

async function main() {
  try {
    const files = await glob(patterns, { ignore: ['node_modules/**'] });
    console.log(`Found ${files.length} TypeScript files to process`);

    for (const file of files.slice(0, 10)) { // Process first 10 files for testing
      await fixFile(file);
    }

    console.log('✅ Phase 2 syntax fixes completed for sample files');
  } catch (error) {
    console.error('❌ Error during Phase 2 fixes:', error);
  }
}

main();

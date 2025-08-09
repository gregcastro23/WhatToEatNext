#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with floating promise issues
function getFilesWithFloatingPromises() {
  try {
    const output = execSync('yarn lint --format=compact 2>&1 | grep "no-floating-promises"', {
      encoding: 'utf8',
    });
    const lines = output.split('\n').filter(line => line.trim());
    const files = new Set();

    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    });

    return Array.from(files);
  } catch (error) {
    console.log('No floating promise issues found or error occurred');
    return [];
  }
}

// Fix floating promises in a file
function fixFloatingPromisesInFile(filePath) {
  console.log(`Processing: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: useEffect with async function call
    const useEffectPattern =
      /(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\(\);(\s*\/\/ [^\n]*)?(\s*}\s*,\s*\[\]?\);)/g;
    content = content.replace(useEffectPattern, (match, indent, funcName, comment, closing) => {
      if (
        funcName.includes('load') ||
        funcName.includes('fetch') ||
        funcName.includes('refresh') ||
        funcName.includes('update')
      ) {
        modified = true;
        return `${indent}void ${funcName}();${comment || ''}${closing}`;
      }
      return match;
    });

    // Pattern 2: setInterval with async function
    const setIntervalPattern = /setInterval\(([a-zA-Z_][a-zA-Z0-9_]*),/g;
    content = content.replace(setIntervalPattern, (match, funcName) => {
      modified = true;
      return `setInterval(() => void ${funcName}(),`;
    });

    // Pattern 3: Standalone async function calls (not in assignments or returns)
    const standaloneAsyncPattern = /^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\(\);(\s*\/\/.*)?$/gm;
    content = content.replace(standaloneAsyncPattern, (match, indent, funcName, comment) => {
      // Skip if it's already voided or awaited
      if (match.includes('void ') || match.includes('await ')) {
        return match;
      }

      // Check if this looks like an async function call
      if (
        funcName.includes('load') ||
        funcName.includes('fetch') ||
        funcName.includes('refresh') ||
        funcName.includes('update') ||
        funcName.includes('init') ||
        funcName.includes('start') ||
        funcName.includes('execute') ||
        funcName.includes('run') ||
        funcName.includes('process')
      ) {
        modified = true;
        return `${indent}void ${funcName}();${comment || ''}`;
      }
      return match;
    });

    // Pattern 4: Script execution at top level
    const topLevelPattern = /^([a-zA-Z_][a-zA-Z0-9_]*)\(\);(\s*\/\/.*)?$/gm;
    content = content.replace(topLevelPattern, (match, funcName, comment) => {
      if (
        filePath.includes('scripts/') &&
        (funcName.includes('main') || funcName.includes('run') || funcName.includes('execute'))
      ) {
        modified = true;
        return `void ${funcName}();${comment || ''}`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Fixed floating promises in ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`  - No automatic fixes applied to ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding files with floating promise issues...');
  const files = getFilesWithFloatingPromises();

  if (files.length === 0) {
    console.log('✅ No floating promise issues found!');
    return;
  }

  console.log(`📝 Found ${files.length} files with floating promise issues`);

  let fixedCount = 0;
  files.forEach(file => {
    if (fixFloatingPromisesInFile(file)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`  - Files processed: ${files.length}`);
  console.log(`  - Files modified: ${fixedCount}`);

  // Run linter again to check remaining issues
  console.log('\n🔍 Checking remaining floating promise issues...');
  try {
    const remainingOutput = execSync('yarn lint 2>&1 | grep -c "no-floating-promises"', {
      encoding: 'utf8',
    });
    const remainingCount = parseInt(remainingOutput.trim()) || 0;
    console.log(`📈 Remaining floating promise issues: ${remainingCount}`);
  } catch (error) {
    console.log('✅ No remaining floating promise issues found!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFloatingPromisesInFile, getFilesWithFloatingPromises };

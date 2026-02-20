#!/usr/bin/env node

/**
 * Fix Remaining Interface Errors - Final Cleanup
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixRemainingInterfaceErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`Fixing remaining interface errors in: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix double commas in interfaces
  if (content.includes(',,')) {
    content = content.replace(/,,/g, ',');
    modified = true;
    console.log(`  ✅ Fixed double commas`);
  }

  // Fix comma followed by semicolon in interfaces
  if (content.includes(',;')) {
    content = content.replace(/,;/g, ';');
    modified = true;
    console.log(`  ✅ Fixed comma-semicolon syntax`);
  }

  // Fix trailing comma before closing brace in interfaces
  const trailingCommaPattern = /,(\s*\n\s*})/g;
  if (trailingCommaPattern.test(content)) {
    content = content.replace(trailingCommaPattern, '$1');
    modified = true;
    console.log(`  ✅ Fixed trailing commas before closing braces`);
  }

  // Fix semicolon in middle of interface followed by comma
  const semicolonCommaPattern = /;,/g;
  if (semicolonCommaPattern.test(content)) {
    content = content.replace(semicolonCommaPattern, ';');
    modified = true;
    console.log(`  ✅ Fixed semicolon-comma patterns`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Successfully fixed ${filePath}`);
    return true;
  }

  return false;
}

function getFilesFromBuildErrors() {
  try {
    execSync('yarn build', { stdio: 'pipe', timeout: 30000 });
    return [];
  } catch (error) {
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
    const fileMatches = errorOutput.match(/\.\/src\/[^\s]+\.tsx?/g);
    if (fileMatches) {
      return [...new Set(fileMatches.map(f => f.replace('./', '')))];
    }
    return [];
  }
}

console.log('Fixing remaining interface syntax errors...');

const errorFiles = getFilesFromBuildErrors();
console.log(`Found ${errorFiles.length} files with remaining errors`);

let totalFixed = 0;

for (const filePath of errorFiles) {
  if (fixRemainingInterfaceErrors(filePath)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files`);

// Test build
console.log('\nTesting build...');
try {
  execSync('yarn build', { stdio: 'pipe', timeout: 60000 });
  console.log('🎉 Build successful!');
  console.log('✅ All interface syntax errors fixed');
} catch (error) {
  console.log('❌ Some build issues remain');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  console.log('Remaining errors:');
  console.log(errorOutput.split('\n').slice(0, 20).join('\n'));
}

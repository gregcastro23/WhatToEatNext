#!/usr/bin/env node

/**
 * Fix Object Literal Syntax Errors
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixObjectLiteralSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`Fixing object literal syntax in: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix object literal with opening brace followed by comma
  if (content.includes('= {,')) {
    content = content.replace(/=\s*{\s*,/g, '= {');
    modified = true;
    console.log(`  ✅ Fixed object literal opening brace syntax`);
  }

  // Fix type annotation with opening brace followed by comma
  if (content.includes(': {,')) {
    content = content.replace(/:\s*{\s*,/g, ': {');
    modified = true;
    console.log(`  ✅ Fixed type annotation opening brace syntax`);
  }

  // Fix any other patterns of brace-comma
  const braceCommaPattern = /{\s*,/g;
  if (braceCommaPattern.test(content)) {
    content = content.replace(braceCommaPattern, '{');
    modified = true;
    console.log(`  ✅ Fixed brace-comma patterns`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Successfully fixed ${filePath}`);
    return true;
  }

  return false;
}

function getAllTSFiles() {
  const files = [];

  function walkDir(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = `${dir}/${item}`;
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  walkDir('src');
  return files;
}

console.log('Fixing object literal syntax errors...');

const allFiles = getAllTSFiles();
console.log(`Checking ${allFiles.length} TypeScript files...`);

let totalFixed = 0;

for (const filePath of allFiles) {
  if (fixObjectLiteralSyntax(filePath)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files`);

// Test build
console.log('\nTesting build...');
try {
  execSync('yarn build', { stdio: 'pipe', timeout: 90000 });
  console.log('🎉 Build successful!');
  console.log('✅ All object literal syntax errors fixed');
  console.log('✅ Ready to proceed with ESLint mass reduction');
} catch (error) {
  console.log('❌ Some build issues remain');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  console.log('Remaining errors:');
  console.log(errorOutput.split('\n').slice(0, 25).join('\n'));
}

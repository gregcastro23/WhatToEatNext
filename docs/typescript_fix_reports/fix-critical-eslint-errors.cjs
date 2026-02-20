#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing critical ESLint errors...');

// Get files with critical ESLint errors
const getFilesWithCriticalErrors = () => {
  try {
    const output = execSync('yarn lint:quick 2>&1 | grep -E "no-var|no-const-assign|no-redeclare|no-empty|no-case-declarations" | cut -d":" -f1 | sort | uniq', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return output.trim().split('\n').filter(line => line.trim() && !line.includes('warning'));
  } catch (error) {
    return [];
  }
};

// Fix critical ESLint errors
const fixCriticalErrors = (content) => {
  let fixed = content;

  // Fix no-var errors: var -> let/const
  // Simple var declarations that can be const
  fixed = fixed.replace(/\bvar\s+(\w+)\s*=\s*([^;]+);/g, (match, varName, value) => {
    // If it's a simple assignment that doesn't change, use const
    if (value.match(/^['"`].*['"`]$/) || value.match(/^\d+$/) || value.match(/^true|false$/)) {
      return `const ${varName} = ${value};`;
    }
    return `let ${varName} = ${value};`;
  });

  // Fix no-const-assign errors by changing const to let where reassignment occurs
  // Look for patterns like: const x = ...; x = ...;
  const constReassignPattern = /const\s+(\w+)\s*=\s*([^;]+);[\s\S]*?\1\s*=\s*[^;]+;/g;
  fixed = fixed.replace(constReassignPattern, (match) => {
    return match.replace(/^const\s+/, 'let ');
  });

  // Fix no-redeclare errors by removing duplicate declarations
  // Pattern: let x = ...; let x = ...; -> let x = ...; x = ...;
  fixed = fixed.replace(/(\w+)\s+(\w+)\s*=\s*([^;]+);\s*\1\s+\2\s*=\s*([^;]+);/g,
    '$1 $2 = $3; $2 = $4;');

  // Fix no-empty errors by adding comments to empty blocks
  fixed = fixed.replace(/{\s*}/g, '{ /* empty */ }');

  // Fix no-case-declarations by wrapping case blocks
  fixed = fixed.replace(/case\s+[^:]+:\s*(let|const|var)\s+/g, (match) => {
    return match.replace(/(case\s+[^:]+:)\s*/, '$1 { ');
  });

  // Add closing braces for case declarations (simple heuristic)
  fixed = fixed.replace(/(case\s+[^:]+:\s*{\s*(let|const|var)\s+[^}]+)\s*break;/g, '$1 } break;');

  return fixed;
};

const filesToFix = getFilesWithCriticalErrors();
console.log(`Found ${filesToFix.length} files with critical ESLint errors`);

let totalFixed = 0;

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCriticalErrors(content);

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ Fixed critical errors in ${filePath}`);
      totalFixed++;
    } else {
      console.log(`ℹ️  No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed critical errors in ${totalFixed} files`);

// Verify the fixes
console.log('\n🔍 Verifying fixes...');
try {
  const afterCount = execSync('yarn lint:quick 2>&1 | grep -E "error" | wc -l', {
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim();

  console.log(`ESLint errors after fix: ${afterCount}`);
} catch (error) {
  console.log('Could not verify error count');
}

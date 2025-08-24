#!/usr/bin/env node

/**
 * Fix Syntax Errors from Automated Type Fixes
 *
 * This script repairs malformed syntax created by automated sed commands
 * that incorrectly applied type assertions.
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get files with TS1003 syntax errors
function getFilesWithSyntaxErrors() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS1003" | cut -d\'(\' -f1 | sort | uniq', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    console.log('No TS1003 errors found');
    return [];
  }
}

// Fix malformed type assertions
function fixSyntaxErrors(content) {
  let fixed = content;

  // Pattern 1: Fix malformed property access like "obj).(prop as Type)"
  // Replace with proper chaining: "obj)?.(prop as Type)"
  fixed = fixed.replace(/\)\.\(/g, ')?.(');

  // Pattern 2: Fix double type assertions like "(obj as Type).(prop as Type)"
  // Replace with proper optional chaining
  fixed = fixed.replace(/\(([^)]+) as Record<string, unknown>\)\.([^)]+) as Record<string, unknown>\)/g,
    '(($1 as Record<string, unknown>)?.$2 as Record<string, unknown>)');

  // Pattern 3: Fix nested property access chains
  // Convert: (obj as Type).prop1 && (obj as Type).(prop2 as Type).prop3
  // To: (obj as Type)?.prop1 && ((obj as Type)?.prop2 as Type)?.prop3
  fixed = fixed.replace(/\(([^)]+) as Record<string, unknown>\)\.([^)]+) as Record<string, unknown>\)\.([^)]+)/g,
    '(($1 as Record<string, unknown>)?.$2 as Record<string, unknown>)?.$3');

  // Pattern 4: Fix simple malformed access patterns
  fixed = fixed.replace(/\(([^)]+)\)\.\(([^)]+)\)/g, '($1)?.($2)');

  // Pattern 5: Ensure proper optional chaining
  fixed = fixed.replace(/\) as Record<string, unknown>\)\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    ') as Record<string, unknown>)?.$1');

  return fixed;
}

// Process a single file
function processFile(filePath) {
  try {
    console.log(`Fixing syntax errors in ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixSyntaxErrors(content);

    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✓ Fixed syntax errors in ${filePath}`);
      return true;
    } else {
      console.log(`  - No syntax fixes needed in ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Fixing syntax errors from automated type fixes...');

  const files = getFilesWithSyntaxErrors();
  console.log(`Found ${files.length} files with TS1003 syntax errors`);

  if (files.length === 0) {
    console.log('✅ No syntax errors to fix!');
    return;
  }

  let fixedCount = 0;

  for (const filePath of files) {
    if (processFile(filePath)) {
      fixedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Files fixed: ${fixedCount}`);

  // Verify the fix
  console.log('\n🔍 Verifying syntax fixes...');
  try {
    const remainingErrors = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS1003" | wc -l', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log(`  Remaining TS1003 errors: ${remainingErrors.trim()}`);
  } catch (error) {
    console.log('  ✅ No remaining TS1003 errors!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, fixSyntaxErrors, processFile };

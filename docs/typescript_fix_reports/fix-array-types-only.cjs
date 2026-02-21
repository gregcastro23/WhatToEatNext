#!/usr/bin/env node

/**
 * Fix Array Types Only
 *
 * Focuses specifically on array type patterns which are the safest to change
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixArrayTypesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Only fix array type patterns - these are the safest
    const replacements = [
      // any[] -> unknown[]
      {
        pattern: /\bany\[\]/g,
        replacement: 'unknown[]',
        description: 'any[] to unknown[]',
      },
      // Array<any> -> Array<unknown>
      {
        pattern: /Array<any>/g,
        replacement: 'Array<unknown>',
        description: 'Array<any> to Array<unknown>',
      },
    ];

    for (const { pattern, replacement, description } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`  ✓ ${description}: ${matches.length} fixes`);
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.array-types-backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split('/').pop()}`);

      // Test TypeScript compilation immediately
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        return fixes;
      } catch (error) {
        console.log('❌ TypeScript compilation failed - restoring backup');
        fs.writeFileSync(filePath, originalContent);
        return 0;
      }
    }

    return fixes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function getFilesWithArrayTypes() {
  try {
    // Find files that specifically have array type issues
    const output = execSync(
      'grep -r "\\bany\\[\\]\\|Array<any>" src --include="*.ts" --include="*.tsx" -l',
      { encoding: 'utf8' },
    );
    return output
      .trim()
      .split('\n')
      .filter(f => f);
  } catch (error) {
    console.log('No files found with array type issues');
    return [];
  }
}

console.log('🔧 Fix Array Types Only (Safest Approach)');
console.log('==========================================');

const files = getFilesWithArrayTypes();
console.log(`📊 Found ${files.length} files with array type issues`);

let totalFixes = 0;
let successfulFiles = 0;

for (const filePath of files.slice(0, 20)) {
  // Process up to 20 files
  console.log(`\n🎯 Processing ${filePath.split('/').pop()}`);
  const fixes = fixArrayTypesInFile(filePath);
  if (fixes > 0) {
    totalFixes += fixes;
    successfulFiles++;
  }
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Files processed: ${Math.min(files.length, 20)}`);
console.log(`   Files successfully fixed: ${successfulFiles}`);
console.log(`   Total array type fixes applied: ${totalFixes}`);

if (totalFixes > 0) {
  // Final check
  try {
    const lintOutput = execSync(
      'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
      { encoding: 'utf8' },
    );
    const remainingIssues = parseInt(lintOutput.trim());
    console.log(`📊 Remaining explicit-any issues: ${remainingIssues}`);
    console.log(`🎉 Successfully reduced explicit-any issues by ${totalFixes}!`);

    // Calculate percentage reduction
    const originalCount = 1792; // From our analysis
    const reductionPercentage = ((totalFixes / originalCount) * 100).toFixed(1);
    console.log(`📈 Reduction: ${reductionPercentage}% of total explicit-any issues`);
  } catch (error) {
    console.log('Could not count remaining issues');
  }
} else {
  console.log('⚠️  No array type fixes were successfully applied');
  console.log('   This suggests the array types may be needed for functionality');
}

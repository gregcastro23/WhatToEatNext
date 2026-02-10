#!/usr/bin/env node

/**
 * Fix Remaining Syntax Issues Script
 *
 * Targets specific remaining syntax patterns after emergency repair:
 * - TS1005: ',' expected
 * - TS1128: Declaration or statement expected
 * - TS1109: Expression expected
 * - TS1003: Identifier expected
 * - Missing closing parentheses/brackets
 * - Malformed JSX patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_FILES_PER_BATCH = 20;
const BACKUP_DIR = '.remaining-syntax-backup';

// Create backup directory
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${BACKUP_DIR}-${timestamp}`;

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  return backupPath;
}

// Get current TypeScript error count
function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Get files with specific error types
function getFilesWithSpecificErrors() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS(1005|1128|1109|1003|1382|17002)" | cut -d"(" -f1 | sort | uniq', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return output.trim().split('\n').filter(file => file.trim());
  } catch (error) {
    console.log('No files with specific errors found');
    return [];
  }
}

// Fix remaining syntax issues
function fixRemainingSyntaxIssues(content) {
  let fixed = content;
  let fixCount = 0;

  // Pattern 1: Fix semicolon in ternary expressions - `: value; // comment` → `: value, // comment`
  const ternaryPattern = /:\s*([^;,\n]+);\s*(\/\/[^\n]*)?$/gm;
  const ternaryMatches = fixed.match(ternaryPattern);
  if (ternaryMatches) {
    fixed = fixed.replace(ternaryPattern, ': $1, $2');
    fixCount += ternaryMatches.length;
    console.log(`    Fixed ${ternaryMatches.length} ternary semicolon patterns`);
  }

  // Pattern 2: Fix missing closing parentheses in object literals
  const missingParenPattern = /(\w+):\s*\(([^)]+as\s+const)\s*;\s*$/gm;
  const missingParenMatches = fixed.match(missingParenPattern);
  if (missingParenMatches) {
    fixed = fixed.replace(missingParenPattern, '$1: ($2)');
    fixCount += missingParenMatches.length;
    console.log(`    Fixed ${missingParenMatches.length} missing parentheses patterns`);
  }

  // Pattern 3: Fix malformed array/object closing - `});` → `})`
  const malformedClosingPattern = /\}\s*;\s*\)/g;
  const malformedClosingMatches = fixed.match(malformedClosingPattern);
  if (malformedClosingMatches) {
    fixed = fixed.replace(malformedClosingPattern, '})');
    fixCount += malformedClosingMatches.length;
    console.log(`    Fixed ${malformedClosingMatches.length} malformed closing patterns`);
  }

  // Pattern 4: Fix JSX expression issues - `{>` → `{'>'}`
  const jsxExpressionPattern = /\{\s*>\s*\}/g;
  const jsxExpressionMatches = fixed.match(jsxExpressionPattern);
  if (jsxExpressionMatches) {
    fixed = fixed.replace(jsxExpressionPattern, "{'>'}");
    fixCount += jsxExpressionMatches.length;
    console.log(`    Fixed ${jsxExpressionMatches.length} JSX expression patterns`);
  }

  // Pattern 5: Fix missing JSX closing tags - detect unclosed div tags
  const unclosedDivPattern = /<div([^>]*)>\s*(?!.*<\/div>)/g;
  const unclosedDivMatches = fixed.match(unclosedDivPattern);
  if (unclosedDivMatches) {
    // This is complex, so we'll just log it for manual review
    console.log(`    Found ${unclosedDivMatches.length} potentially unclosed div tags (manual review needed)`);
  }

  // Pattern 6: Fix identifier issues - `const as` → `const result as`
  const identifierPattern = /const\s+as\s+/g;
  const identifierMatches = fixed.match(identifierPattern);
  if (identifierMatches) {
    fixed = fixed.replace(identifierPattern, 'const result as ');
    fixCount += identifierMatches.length;
    console.log(`    Fixed ${identifierMatches.length} identifier patterns`);
  }

  // Pattern 7: Fix function parameter syntax - `(param,)` → `(param)`
  const trailingCommaPattern = /\(([^)]*),\s*\)/g;
  const trailingCommaMatches = fixed.match(trailingCommaPattern);
  if (trailingCommaMatches) {
    fixed = fixed.replace(trailingCommaPattern, '($1)');
    fixCount += trailingCommaMatches.length;
    console.log(`    Fixed ${trailingCommaMatches.length} trailing comma patterns`);
  }

  // Pattern 8: Fix declaration syntax - `export {` without closing
  const exportPattern = /export\s*\{\s*$/gm;
  const exportMatches = fixed.match(exportPattern);
  if (exportMatches) {
    fixed = fixed.replace(exportPattern, 'export {');
    console.log(`    Found ${exportMatches.length} incomplete export statements (manual review needed)`);
  }

  // Pattern 9: Fix statement syntax - `;` at start of line
  const leadingSemicolonPattern = /^\s*;/gm;
  const leadingSemicolonMatches = fixed.match(leadingSemicolonPattern);
  if (leadingSemicolonMatches) {
    fixed = fixed.replace(leadingSemicolonPattern, '');
    fixCount += leadingSemicolonMatches.length;
    console.log(`    Fixed ${leadingSemicolonMatches.length} leading semicolon patterns`);
  }

  // Pattern 10: Fix expression syntax - `= ;` → `= null;`
  const emptyAssignmentPattern = /=\s*;/g;
  const emptyAssignmentMatches = fixed.match(emptyAssignmentPattern);
  if (emptyAssignmentMatches) {
    fixed = fixed.replace(emptyAssignmentPattern, '= null;');
    fixCount += emptyAssignmentMatches.length;
    console.log(`    Fixed ${emptyAssignmentMatches.length} empty assignment patterns`);
  }

  return { content: fixed, fixCount };
}

// Process a single file
function processFile(filePath, backupPath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ File not found: ${filePath}`);
      return { processed: false, fixes: 0 };
    }

    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`  Processing ${filePath}...`);

    // Create backup
    const relativePath = path.relative('.', filePath);
    const backupFilePath = path.join(backupPath, relativePath);
    const backupDir = path.dirname(backupFilePath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupFilePath, content);

    // Apply syntax fixes
    const result = fixRemainingSyntaxIssues(content);

    if (result.fixCount > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`    ✅ Applied ${result.fixCount} syntax fixes to ${filePath}`);
      return { processed: true, fixes: result.fixCount };
    } else {
      console.log(`    ℹ️ No fixable patterns found in ${filePath}`);
      return { processed: false, fixes: 0 };
    }

  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return { processed: false, fixes: 0 };
  }
}

// Validate build after fixes
function validateBuild() {
  try {
    console.log('\n🔍 Validating TypeScript compilation...');
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('⚠️ TypeScript compilation still has errors');
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Fixing Remaining Syntax Issues - TS1005, TS1128, TS1109, TS1003');
  console.log('=' .repeat(70));

  // Get initial error count
  const initialErrors = getTypeScriptErrorCount();
  console.log(`📊 Initial TypeScript errors: ${initialErrors}`);

  if (initialErrors === 0) {
    console.log('✅ No TypeScript errors found!');
    return;
  }

  // Create backup
  const backupPath = createBackup();
  console.log(`📁 Created backup at: ${backupPath}`);

  // Get files with specific errors
  const errorFiles = getFilesWithSpecificErrors();
  console.log(`📁 Files with target errors: ${errorFiles.length}`);

  if (errorFiles.length === 0) {
    console.log('⚠️ No files with target errors detected');
    return;
  }

  let totalProcessed = 0;
  let totalFixes = 0;
  let batchCount = 0;

  console.log(`\n🔧 Processing files in batches of ${MAX_FILES_PER_BATCH}...`);

  // Process files in batches
  for (let i = 0; i < errorFiles.length; i += MAX_FILES_PER_BATCH) {
    batchCount++;
    const batch = errorFiles.slice(i, i + MAX_FILES_PER_BATCH);

    console.log(`\n📦 Batch ${batchCount}: Processing ${batch.length} files`);

    for (const filePath of batch) {
      const result = processFile(filePath, backupPath);
      if (result.processed) {
        totalProcessed++;
      }
      totalFixes += result.fixes;
    }

    // Validate build every batch
    console.log(`\n🔍 Validating batch ${batchCount}...`);
    const buildValid = validateBuild();

    if (!buildValid) {
      console.log('⚠️ Build validation failed, continuing with next batch...');
    }

    // Check progress
    const currentErrors = getTypeScriptErrorCount();
    const reduction = initialErrors - currentErrors;
    const percentage = Math.round((reduction / initialErrors) * 100);

    console.log(`📈 Progress: ${reduction} errors fixed (${percentage}% reduction)`);
    console.log(`   Current errors: ${currentErrors}`);
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Remaining Syntax Issues Fix Summary');
  console.log('='.repeat(70));

  const finalErrors = getTypeScriptErrorCount();
  const totalReduction = initialErrors - finalErrors;
  const reductionPercentage = Math.round((totalReduction / initialErrors) * 100);

  console.log(`Files processed: ${totalProcessed}`);
  console.log(`Total syntax fixes applied: ${totalFixes}`);
  console.log(`Backup location: ${backupPath}`);
  console.log(`\nError Reduction:`);
  console.log(`  Before: ${initialErrors} TypeScript errors`);
  console.log(`  After: ${finalErrors} TypeScript errors`);
  console.log(`  Reduction: ${totalReduction} errors (${reductionPercentage}%)`);

  // Final build validation
  console.log('\n🔍 Final validation...');
  const finalBuildValid = validateBuild();

  if (finalBuildValid) {
    console.log('✅ Remaining syntax issues fix completed successfully!');
  } else {
    console.log('⚠️ Build still has errors - may need additional targeted fixes');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Review the backup if any issues arise');
  console.log('2. Run additional targeted fixes for specific error types');
  console.log('3. Continue with systematic TypeScript error elimination');
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  getTypeScriptErrorCount,
  getFilesWithSpecificErrors,
  processFile,
  fixRemainingSyntaxIssues
};

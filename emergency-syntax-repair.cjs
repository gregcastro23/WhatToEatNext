#!/usr/bin/env node

/**
 * Emergency Syntax Repair Script
 *
 * Fixes malformed `,;` syntax patterns that are causing massive TypeScript errors:
 * - `{;` → `{`
 * - `[;` → `[`
 * - `,;` → `,`
 * - Other malformed comma-semicolon combinations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_FILES_PER_BATCH = 25;
const BACKUP_DIR = '.emergency-syntax-backup';

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
    // Handle grep exit code 1 (no matches = 0 errors)
    return error.status === 1 ? 0 : -1;
  }
}

// Get files with TypeScript errors
function getFilesWithErrors() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | cut -d"(" -f1 | sort | uniq', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return output.trim().split('\n').filter(file => file.trim());
  } catch (error) {
    console.log('No files with errors found');
    return [];
  }
}

// Fix malformed syntax patterns
function fixMalformedSyntax(content) {
  let fixed = content;
  let fixCount = 0;

  // Pattern 1: Object literal with semicolon - `{;` → `{`
  const objectSemicolonPattern = /\{\s*;/g;
  const objectMatches = fixed.match(objectSemicolonPattern);
  if (objectMatches) {
    fixed = fixed.replace(objectSemicolonPattern, '{');
    fixCount += objectMatches.length;
    console.log(`    Fixed ${objectMatches.length} malformed object literals ({;)`);
  }

  // Pattern 2: Array literal with semicolon - `[;` → `[`
  const arraySemicolonPattern = /\[\s*;/g;
  const arrayMatches = fixed.match(arraySemicolonPattern);
  if (arrayMatches) {
    fixed = fixed.replace(arraySemicolonPattern, '[');
    fixCount += arrayMatches.length;
    console.log(`    Fixed ${arrayMatches.length} malformed array literals ([;)`);
  }

  // Pattern 3: Comma followed by semicolon - `,;` → `,`
  const commaSemicolonPattern = /,\s*;/g;
  const commaMatches = fixed.match(commaSemicolonPattern);
  if (commaMatches) {
    fixed = fixed.replace(commaSemicolonPattern, ',');
    fixCount += commaMatches.length;
    console.log(`    Fixed ${commaMatches.length} malformed comma-semicolon patterns (,;)`);
  }

  // Pattern 4: Function parameter defaults with semicolon - `= {},;` → `= {},`
  const paramDefaultPattern = /=\s*\{\s*\}\s*,\s*;/g;
  const paramMatches = fixed.match(paramDefaultPattern);
  if (paramMatches) {
    fixed = fixed.replace(paramDefaultPattern, '= {},');
    fixCount += paramMatches.length;
    console.log(`    Fixed ${paramMatches.length} malformed parameter defaults`);
  }

  // Pattern 5: Property assignment with semicolon - `: value,;` → `: value,`
  const propertyPattern = /:\s*([^,;]+),\s*;/g;
  const propertyMatches = fixed.match(propertyPattern);
  if (propertyMatches) {
    fixed = fixed.replace(propertyPattern, ': $1,');
    fixCount += propertyMatches.length;
    console.log(`    Fixed ${propertyMatches.length} malformed property assignments`);
  }

  // Pattern 6: Destructuring with semicolon - `{ prop },;` → `{ prop },`
  const destructuringPattern = /\{\s*([^}]+)\s*\}\s*,\s*;/g;
  const destructuringMatches = fixed.match(destructuringPattern);
  if (destructuringMatches) {
    fixed = fixed.replace(destructuringPattern, '{ $1 },');
    fixCount += destructuringMatches.length;
    console.log(`    Fixed ${destructuringMatches.length} malformed destructuring patterns`);
  }

  // Pattern 7: Function call arguments with semicolon - `(arg,;)` → `(arg,)`
  const functionCallPattern = /\(([^)]*),\s*;\s*\)/g;
  const functionCallMatches = fixed.match(functionCallPattern);
  if (functionCallMatches) {
    fixed = fixed.replace(functionCallPattern, '($1)');
    fixCount += functionCallMatches.length;
    console.log(`    Fixed ${functionCallMatches.length} malformed function call arguments`);
  }

  // Pattern 8: Trailing semicolon in arrays - `[item,;]` → `[item]`
  const trailingArrayPattern = /\[([^\]]*),\s*;\s*\]/g;
  const trailingArrayMatches = fixed.match(trailingArrayPattern);
  if (trailingArrayMatches) {
    fixed = fixed.replace(trailingArrayPattern, '[$1]');
    fixCount += trailingArrayMatches.length;
    console.log(`    Fixed ${trailingArrayMatches.length} malformed array trailing patterns`);
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
    const result = fixMalformedSyntax(content);

    if (result.fixCount > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`    ✅ Applied ${result.fixCount} syntax fixes to ${filePath}`);
      return { processed: true, fixes: result.fixCount };
    } else {
      console.log(`    ℹ️ No malformed patterns found in ${filePath}`);
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
  console.log('🚨 Emergency Syntax Repair - Fixing Malformed `,;` Patterns');
  console.log('=' .repeat(60));

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

  // Get files with errors
  const errorFiles = getFilesWithErrors();
  console.log(`📁 Files with errors: ${errorFiles.length}`);

  if (errorFiles.length === 0) {
    console.log('⚠️ No files with errors detected');
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
  console.log('\n' + '='.repeat(60));
  console.log('📊 Emergency Syntax Repair Summary');
  console.log('='.repeat(60));

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
    console.log('✅ Emergency syntax repair completed successfully!');
  } else {
    console.log('⚠️ Build still has errors - may need additional repair cycles');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Review the backup if any issues arise');
  console.log('2. Run additional targeted fixes for remaining errors');
  console.log('3. Continue with systematic TypeScript error elimination');
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  getTypeScriptErrorCount,
  getFilesWithErrors,
  processFile,
  fixMalformedSyntax
};

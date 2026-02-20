#!/usr/bin/env node

/**
 * Single File Auto-Fix Script
 * Called when a specific file is saved and needs linting fixes
 */

const AutoLintFixer = require('./src/scripts/auto-lint-fixer.cjs');

async function fixFileOnSave(filePath) {
  if (!filePath) {
    console.error('❌ No file path provided');
    console.error('Usage: node fix-file-on-save.cjs <file-path>');
    process.exit(1);
  }

  console.log(`🔧 Auto-fixing file: ${filePath}`);

  const fixer = new AutoLintFixer();

  try {
    const result = await fixer.fixFile(filePath);

    if (result.success) {
      console.log(`✅ Successfully auto-fixed: ${filePath}`);
      console.log(`   Duration: ${result.duration}ms`);

      if (result.results.eslintFix?.success) {
        console.log('   ✓ ESLint auto-fix applied');
      }

      if (result.results.patternFixes?.modified) {
        console.log('   ✓ Safe pattern fixes applied');
      }

      console.log('   ✓ All validations passed');
    } else if (result.rolledBack) {
      console.log(`⚠️  Auto-fix failed but file was safely restored: ${filePath}`);
      console.log(`   Reason: ${result.reason}`);
    } else {
      console.error(`❌ Auto-fix failed: ${filePath}`);
      console.error(`   Reason: ${result.reason || result.error}`);
    }
  } catch (error) {
    console.error(`💥 Fatal error fixing ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];
fixFileOnSave(filePath);

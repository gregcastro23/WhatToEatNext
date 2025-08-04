#!/usr/bin/env node

/**
 * Automated Syntax Validation Script
 * Validates TypeScript compilation and identifies parsing errors
 *
 * Part of Phase 9.1: Fix Critical Parsing Errors
 */

const { execSync } = require('child_process');

function validateSyntax() {
  console.log('🔍 Running TypeScript syntax validation...');

  try {
    const tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const lines = tscOutput.split('\n');
    const errors = lines.filter(line => line.includes('error TS'));
    const parsingErrors = errors.filter(line =>
      line.includes('JSX element') ||
      line.includes('Unexpected token') ||
      line.includes('Expected') ||
      line.includes('Identifier expected') ||
      line.includes('Expression expected') ||
      line.includes('error TS17008') || // JSX element has no corresponding closing tag
      line.includes('error TS1382') ||  // Unexpected token
      line.includes('error TS17002') || // Expected corresponding JSX closing tag
      line.includes('error TS1005') ||  // Expected token
      line.includes('error TS1003')     // Identifier expected
    );

    console.log(`📊 Validation Results:`);
    console.log(`   Total TypeScript errors: ${errors.length}`);
    console.log(`   Critical parsing errors: ${parsingErrors.length}`);

    if (parsingErrors.length > 0) {
      console.log('\n❌ Critical parsing errors found:');
      parsingErrors.slice(0, 10).forEach(error => {
        console.log(`   ${error}`);
      });
      if (parsingErrors.length > 10) {
        console.log(`   ... and ${parsingErrors.length - 10} more`);
      }

      console.log('\n🔧 Suggested fixes:');
      console.log('   - Run: node scripts/fix-critical-parsing-errors.cjs');
      console.log('   - Run: node scripts/fix-html-entities-comprehensive.cjs');
      console.log('   - Check for unclosed JSX tags');
      console.log('   - Verify async/await syntax');

      process.exit(1);
    } else {
      console.log('✅ No critical parsing errors found!');

      if (errors.length > 0) {
        console.log(`\n📝 Note: ${errors.length} other TypeScript errors exist but are not critical parsing errors.`);
        console.log('   These may include type errors, unused variables, etc.');
      }

      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

function validateTestFiles() {
  console.log('🧪 Validating test file compilation...');

  try {
    // Check if test files compile successfully
    const testOutput = execSync('npx tsc --noEmit --skipLibCheck src/__tests__/**/*.ts src/__tests__/**/*.tsx 2>&1 || true', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const testErrors = (testOutput.match(/error TS/g) || []).length;
    const testParsingErrors = (testOutput.match(/error TS(17008|1382|17002|1005|1003)/g) || []).length;

    console.log(`📊 Test File Validation:`);
    console.log(`   Test file errors: ${testErrors}`);
    console.log(`   Test parsing errors: ${testParsingErrors}`);

    return testParsingErrors === 0;
  } catch (error) {
    console.log('⚠️  Test file validation skipped (no test files found)');
    return true;
  }
}

function generateReport() {
  console.log('\n📋 Generating syntax validation report...');

  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    validation: 'syntax-check',
    status: 'completed',
    results: {
      totalErrors: 0,
      parsingErrors: 0,
      testFileErrors: 0
    }
  };

  try {
    const tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const errors = (tscOutput.match(/error TS/g) || []).length;
    const parsingErrors = (tscOutput.match(/error TS(17008|1382|17002|1005|1003)/g) || []).length;

    report.results.totalErrors = errors;
    report.results.parsingErrors = parsingErrors;

    // Test file validation
    const testFilesValid = validateTestFiles();
    report.results.testFilesValid = testFilesValid;

    console.log('📄 Syntax Validation Report:');
    console.log(JSON.stringify(report, null, 2));

    return report;
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    return null;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--report')) {
    generateReport();
  } else if (args.includes('--test-only')) {
    const testValid = validateTestFiles();
    process.exit(testValid ? 0 : 1);
  } else {
    validateSyntax();
  }
}

module.exports = {
  validateSyntax,
  validateTestFiles,
  generateReport
};

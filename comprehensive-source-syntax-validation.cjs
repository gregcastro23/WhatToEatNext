#!/usr/bin/env node

/**
 * Comprehensive Source File Syntax Validation
 *
 * This script orchestrates all syntax validation subtasks:
 * 1. Scan all source files for syntax issues
 * 2. Fix malformed property access patterns
 * 3. Correct template literal expressions
 * 4. Validate console statement formatting
 *
 * Part of Phase 9.3: Source File Syntax Validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import our validation modules
const { SyntaxValidator } = require('./scan-source-syntax-issues.cjs');
const { PropertyAccessFixer } = require('./fix-malformed-property-access.cjs');
const { TemplateLiteralFixer } = require('./fix-template-literal-expressions.cjs');
const { ConsoleFormattingValidator } = require('./validate-console-statement-formatting.cjs');

class ComprehensiveSyntaxValidator {
  constructor() {
    this.results = {
      overallSummary: {
        totalFilesScanned: 0,
        totalIssuesFound: 0,
        totalIssuesFixed: 0,
        validationsPassed: 0,
        validationsFailed: 0
      },
      subtaskResults: {
        syntaxScan: null,
        propertyAccessFix: null,
        templateLiteralFix: null,
        consoleValidation: null
      },
      finalValidation: {
        typeScriptErrors: 0,
        buildSuccess: false,
        syntaxErrorsRemaining: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current TypeScript error count
   */
  async getTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      return { errorCount, output };
    } catch (error) {
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      return { errorCount, output: error.stdout || '' };
    }
  }

  /**
   * Run comprehensive syntax validation
   */
  async runComprehensiveValidation(dryRun = true) {
    console.log('🚀 COMPREHENSIVE SOURCE FILE SYNTAX VALIDATION');
    console.log('=' .repeat(60));
    console.log(`🔄 Mode: ${dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
    console.log(`📅 Started: ${new Date().toISOString()}`);

    // Get initial TypeScript error count
    console.log('\n📊 Initial TypeScript Error Assessment...');
    const initialErrors = await this.getTypeScriptErrorCount();
    console.log(`📈 Initial TypeScript errors: ${initialErrors.errorCount}`);

    try {
      // Subtask 1: Scan all source files for syntax issues
      console.log('\n' + '='.repeat(60));
      console.log('📋 SUBTASK 1: Scanning Source Files for Syntax Issues');
      console.log('='.repeat(60));

      const syntaxValidator = new SyntaxValidator();
      this.results.subtaskResults.syntaxScan = await syntaxValidator.runScan();

      if (this.results.subtaskResults.syntaxScan.filesWithIssues > 0) {
        this.results.overallSummary.validationsFailed++;
        console.log(`❌ SUBTASK 1 RESULT: Found syntax issues in ${this.results.subtaskResults.syntaxScan.filesWithIssues} files`);
      } else {
        this.results.overallSummary.validationsPassed++;
        console.log('✅ SUBTASK 1 RESULT: No syntax issues found');
      }

      // Subtask 2: Fix malformed property access patterns
      console.log('\n' + '='.repeat(60));
      console.log('🔧 SUBTASK 2: Fixing Malformed Property Access Patterns');
      console.log('='.repeat(60));

      const propertyFixer = new PropertyAccessFixer();
      // Set dry run mode for property fixer
      const originalDryRun = require('./fix-malformed-property-access.cjs').CONFIG.dryRun;
      require('./fix-malformed-property-access.cjs').CONFIG.dryRun = dryRun;

      this.results.subtaskResults.propertyAccessFix = await propertyFixer.runFixes();

      // Restore original dry run setting
      require('./fix-malformed-property-access.cjs').CONFIG.dryRun = originalDryRun;

      const propertyFixes = Object.values(this.results.subtaskResults.propertyAccessFix.fixesByType)
        .reduce((sum, count) => sum + count, 0);

      if (propertyFixes > 0) {
        this.results.overallSummary.totalIssuesFixed += propertyFixes;
        console.log(`✅ SUBTASK 2 RESULT: Applied ${propertyFixes} property access fixes`);
      } else {
        console.log('✅ SUBTASK 2 RESULT: No malformed property access patterns found');
      }

      // Subtask 3: Correct template literal expressions
      console.log('\n' + '='.repeat(60));
      console.log('🔧 SUBTASK 3: Correcting Template Literal Expressions');
      console.log('='.repeat(60));

      const templateFixer = new TemplateLiteralFixer();
      // Set dry run mode for template fixer
      const originalTemplateDryRun = require('./fix-template-literal-expressions.cjs').CONFIG.dryRun;
      require('./fix-template-literal-expressions.cjs').CONFIG.dryRun = dryRun;

      this.results.subtaskResults.templateLiteralFix = await templateFixer.runFixes();

      // Restore original dry run setting
      require('./fix-template-literal-expressions.cjs').CONFIG.dryRun = originalTemplateDryRun;

      const templateFixes = Object.values(this.results.subtaskResults.templateLiteralFix.fixesByType)
        .reduce((sum, count) => sum + count, 0);

      if (templateFixes > 0) {
        this.results.overallSummary.totalIssuesFixed += templateFixes;
        console.log(`✅ SUBTASK 3 RESULT: Applied ${templateFixes} template literal fixes`);
      } else {
        console.log('✅ SUBTASK 3 RESULT: No template literal issues found that need fixing');
      }

      // Subtask 4: Validate console statement formatting
      console.log('\n' + '='.repeat(60));
      console.log('🔍 SUBTASK 4: Validating Console Statement Formatting');
      console.log('='.repeat(60));

      const consoleValidator = new ConsoleFormattingValidator();
      // Set dry run mode for console validator
      const originalConsoleDryRun = require('./validate-console-statement-formatting.cjs').CONFIG.dryRun;
      require('./validate-console-statement-formatting.cjs').CONFIG.dryRun = dryRun;

      this.results.subtaskResults.consoleValidation = await consoleValidator.runValidation();

      // Restore original dry run setting
      require('./validate-console-statement-formatting.cjs').CONFIG.dryRun = originalConsoleDryRun;

      const consoleFixes = Object.values(this.results.subtaskResults.consoleValidation.fixesByType)
        .reduce((sum, count) => sum + count, 0);

      if (consoleFixes > 0) {
        this.results.overallSummary.totalIssuesFixed += consoleFixes;
        console.log(`✅ SUBTASK 4 RESULT: Applied ${consoleFixes} console formatting fixes`);
      } else {
        console.log('✅ SUBTASK 4 RESULT: All console statements are properly formatted');
      }

      // Final validation
      console.log('\n' + '='.repeat(60));
      console.log('🏁 FINAL VALIDATION');
      console.log('='.repeat(60));

      const finalErrors = await this.getTypeScriptErrorCount();
      this.results.finalValidation.typeScriptErrors = finalErrors.errorCount;
      this.results.finalValidation.buildSuccess = finalErrors.errorCount === 0;

      // Calculate overall statistics
      this.results.overallSummary.totalFilesScanned = Math.max(
        this.results.subtaskResults.syntaxScan?.totalFilesScanned || 0,
        this.results.subtaskResults.propertyAccessFix?.totalFilesProcessed || 0,
        this.results.subtaskResults.templateLiteralFix?.totalFilesProcessed || 0,
        this.results.subtaskResults.consoleValidation?.totalFilesProcessed || 0
      );

      const syntaxIssues = Object.values(this.results.subtaskResults.syntaxScan?.summary || {})
        .reduce((sum, count) => sum + count, 0);
      this.results.overallSummary.totalIssuesFound = syntaxIssues;

      // Generate comprehensive summary
      this.generateComprehensiveSummary();

      // Save results
      this.saveResults();

      return this.results;

    } catch (error) {
      console.error('❌ FATAL ERROR during comprehensive validation:', error.message);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Generate comprehensive summary
   */
  generateComprehensiveSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE SYNTAX VALIDATION SUMMARY');
    console.log('='.repeat(60));

    console.log(`📁 Total files scanned: ${this.results.overallSummary.totalFilesScanned}`);
    console.log(`🔍 Total syntax issues found: ${this.results.overallSummary.totalIssuesFound}`);
    console.log(`🔧 Total issues fixed: ${this.results.overallSummary.totalIssuesFixed}`);
    console.log(`✅ Validations passed: ${this.results.overallSummary.validationsPassed}`);
    console.log(`❌ Validations failed: ${this.results.overallSummary.validationsFailed}`);

    console.log('\n📋 Subtask Results:');

    // Syntax scan results
    if (this.results.subtaskResults.syntaxScan) {
      const scan = this.results.subtaskResults.syntaxScan;
      console.log(`  1. Syntax Scan: ${scan.filesWithIssues} files with issues (${scan.totalFilesScanned} scanned)`);

      for (const [category, count] of Object.entries(scan.summary)) {
        if (count > 0) {
          console.log(`     • ${category}: ${count} issues`);
        }
      }
    }

    // Property access fix results
    if (this.results.subtaskResults.propertyAccessFix) {
      const propFix = this.results.subtaskResults.propertyAccessFix;
      const totalFixes = Object.values(propFix.fixesByType).reduce((sum, count) => sum + count, 0);
      console.log(`  2. Property Access: ${propFix.filesModified} files modified, ${totalFixes} fixes applied`);
    }

    // Template literal fix results
    if (this.results.subtaskResults.templateLiteralFix) {
      const templateFix = this.results.subtaskResults.templateLiteralFix;
      const totalFixes = Object.values(templateFix.fixesByType).reduce((sum, count) => sum + count, 0);
      console.log(`  3. Template Literals: ${templateFix.filesModified} files modified, ${totalFixes} fixes applied`);
    }

    // Console validation results
    if (this.results.subtaskResults.consoleValidation) {
      const consoleFix = this.results.subtaskResults.consoleValidation;
      const totalFixes = Object.values(consoleFix.fixesByType).reduce((sum, count) => sum + count, 0);
      console.log(`  4. Console Formatting: ${consoleFix.filesModified} files modified, ${totalFixes} fixes applied`);
      console.log(`     • Valid console statements: ${consoleFix.validationResults.validConsoleStatements}`);
      console.log(`     • Malformed statements: ${consoleFix.validationResults.malformedConsoleStatements}`);
    }

    console.log('\n🏁 Final Status:');
    console.log(`📊 TypeScript errors: ${this.results.finalValidation.typeScriptErrors}`);
    console.log(`🏗️  Build success: ${this.results.finalValidation.buildSuccess ? 'YES' : 'NO'}`);

    // Overall assessment
    const overallSuccess = this.results.overallSummary.validationsFailed === 0 &&
                          this.results.finalValidation.typeScriptErrors === 0;

    if (overallSuccess) {
      console.log('\n🎉 OVERALL RESULT: SUCCESS - All syntax validations passed!');
    } else {
      console.log('\n⚠️  OVERALL RESULT: Issues found that need attention');

      if (this.results.overallSummary.validationsFailed > 0) {
        console.log(`   • ${this.results.overallSummary.validationsFailed} validation(s) failed`);
      }

      if (this.results.finalValidation.typeScriptErrors > 0) {
        console.log(`   • ${this.results.finalValidation.typeScriptErrors} TypeScript errors remain`);
      }
    }

    console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  }

  /**
   * Save comprehensive results
   */
  saveResults() {
    try {
      const outputFile = 'comprehensive-syntax-validation-report.json';
      fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Comprehensive results saved to: ${outputFile}`);
    } catch (error) {
      console.error('❌ Failed to save comprehensive results:', error.message);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  if (dryRun) {
    console.log('ℹ️  Running in DRY RUN mode. Use --execute to apply fixes.');
  }

  try {
    const validator = new ComprehensiveSyntaxValidator();
    const results = await validator.runComprehensiveValidation(dryRun);

    // Exit with appropriate code
    const overallSuccess = results.overallSummary.validationsFailed === 0 &&
                          results.finalValidation.typeScriptErrors === 0;

    if (overallSuccess) {
      console.log('\n✅ SUCCESS: Comprehensive syntax validation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  ISSUES FOUND: Review the detailed report for specific actions needed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ComprehensiveSyntaxValidator };

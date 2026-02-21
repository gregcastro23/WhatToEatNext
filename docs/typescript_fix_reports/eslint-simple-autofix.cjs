#!/usr/bin/env node

/**
 * ESLint Simple Auto-Fix
 *
 * Uses standard ESLint --fix functionality with safety checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SimpleAutoFix {
  constructor() {
    this.fixedFiles = 0;
    this.processedFiles = 0;
    this.logFile = 'eslint-simple-autofix.log';

    this.log('ESLint Simple Auto-Fix Started');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async getInitialStats() {
    try {
      this.log('Getting initial linting statistics...');

      const output = execSync('yarn lint --format=json 2>/dev/null', {
        encoding: 'utf8',
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024
      });

      const results = JSON.parse(output);
      const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
      const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
      const fixableErrors = results.reduce((sum, result) => sum + (result.fixableErrorCount || 0), 0);
      const fixableWarnings = results.reduce((sum, result) => sum + (result.fixableWarningCount || 0), 0);

      return {
        totalErrors,
        totalWarnings,
        fixableErrors,
        fixableWarnings,
        totalFixable: fixableErrors + fixableWarnings
      };
    } catch (error) {
      this.log(`Error getting initial stats: ${error.message}`);
      return null;
    }
  }

  async applyAutoFixes() {
    try {
      this.log('Applying ESLint auto-fixes...');

      // Apply fixes to all files
      const output = execSync('yarn lint --fix', {
        encoding: 'utf8',
        timeout: 300000, // 5 minutes
        maxBuffer: 10 * 1024 * 1024
      });

      this.log('Auto-fixes applied successfully');
      return true;
    } catch (error) {
      // ESLint returns non-zero exit code even when fixes are applied if there are remaining issues
      this.log(`ESLint completed with remaining issues (expected): ${error.message}`);
      return true;
    }
  }

  async validateBuild() {
    try {
      this.log('Validating TypeScript compilation...');

      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000
      });

      this.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      this.log(`❌ TypeScript compilation failed: ${error.message}`);
      return false;
    }
  }

  async getFinalStats() {
    try {
      this.log('Getting final linting statistics...');

      const output = execSync('yarn lint --format=json 2>/dev/null', {
        encoding: 'utf8',
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024
      });

      const results = JSON.parse(output);
      const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
      const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
      const fixableErrors = results.reduce((sum, result) => sum + (result.fixableErrorCount || 0), 0);
      const fixableWarnings = results.reduce((sum, result) => sum + (result.fixableWarningCount || 0), 0);

      return {
        totalErrors,
        totalWarnings,
        fixableErrors,
        fixableWarnings,
        totalFixable: fixableErrors + fixableWarnings
      };
    } catch (error) {
      this.log(`Error getting final stats: ${error.message}`);
      return null;
    }
  }

  generateReport(initialStats, finalStats) {
    const report = {
      timestamp: new Date().toISOString(),
      initialStats,
      finalStats,
      improvements: null,
      success: false
    };

    if (initialStats && finalStats) {
      report.improvements = {
        errorsFixed: initialStats.totalErrors - finalStats.totalErrors,
        warningsFixed: initialStats.totalWarnings - finalStats.totalWarnings,
        fixableIssuesResolved: initialStats.totalFixable - finalStats.totalFixable
      };

      report.success = report.improvements.fixableIssuesResolved > 0;
    }

    fs.writeFileSync('eslint-simple-autofix-report.json', JSON.stringify(report, null, 2));

    this.log('='.repeat(60));
    this.log('ESLint Simple Auto-Fix Completed');

    if (initialStats && finalStats) {
      this.log(`Initial: ${initialStats.totalErrors} errors, ${initialStats.totalWarnings} warnings`);
      this.log(`Final: ${finalStats.totalErrors} errors, ${finalStats.totalWarnings} warnings`);

      if (report.improvements) {
        this.log(`Fixed: ${report.improvements.errorsFixed} errors, ${report.improvements.warningsFixed} warnings`);
        this.log(`Auto-fixable issues resolved: ${report.improvements.fixableIssuesResolved}`);
      }
    }

    this.log('='.repeat(60));

    return report;
  }
}

// Main execution
async function main() {
  const fixer = new SimpleAutoFix();

  try {
    // Get initial stats
    const initialStats = await fixer.getInitialStats();
    if (initialStats) {
      fixer.log(`Initial status: ${initialStats.totalErrors} errors, ${initialStats.totalWarnings} warnings`);
      fixer.log(`Auto-fixable issues: ${initialStats.totalFixable} (${initialStats.fixableErrors} errors, ${initialStats.fixableWarnings} warnings)`);
    }

    // Apply auto-fixes
    const fixSuccess = await fixer.applyAutoFixes();
    if (!fixSuccess) {
      fixer.log('Auto-fix application failed');
      return;
    }

    // Validate build
    const buildValid = await fixer.validateBuild();

    // Get final stats
    const finalStats = await fixer.getFinalStats();
    if (finalStats) {
      fixer.log(`Final status: ${finalStats.totalErrors} errors, ${finalStats.totalWarnings} warnings`);
      fixer.log(`Remaining auto-fixable issues: ${finalStats.totalFixable}`);
    }

    if (!buildValid) {
      fixer.log('⚠️  Build validation failed - manual review may be needed');
    }

    // Generate report
    fixer.generateReport(initialStats, finalStats);

  } catch (error) {
    fixer.log(`Fatal error: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleAutoFix };

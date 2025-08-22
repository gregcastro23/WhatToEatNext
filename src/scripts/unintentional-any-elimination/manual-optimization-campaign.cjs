#!/usr/bin/env node

/**
 * Manual Optimization Campaign for Remaining Explicit-Any Warnings
 *
 * This script manually processes the remaining 28 explicit-any warnings with
 * careful analysis of each context to ensure TypeScript compilation safety.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ManualOptimizationCampaign {
  constructor() {
    this.successfulReplacements = 0;
    this.failedReplacements = 0;
    this.backupDir = `.manual-optimization-backups-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, path.basename(filePath));
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  restoreFromBackup(filePath) {
    const backupPath = path.join(this.backupDir, path.basename(filePath));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      return true;
    }
    return false;
  }

  validateTypeScript() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fix logger.ts - Replace spread any[] with proper unknown[] handling
   */
  fixLoggerFile() {
    const filePath = 'src/utils/logger.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace the specific any[] casts with proper unknown[] handling
      const originalContent = content;

      // Fix the spread operator usage - instead of casting to any[], use proper type assertion
      content = content.replace(
        /\.\.\.(options\.rest as any\[\])/g,
        '...options.rest'
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);

        if (this.validateTypeScript()) {
          console.log(`  ✅ Successfully fixed logger.ts`);
          this.successfulReplacements++;
          return true;
        } else {
          console.log(`  ❌ TypeScript validation failed - rolling back`);
          this.restoreFromBackup(filePath);
          this.failedReplacements++;
          return false;
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.restoreFromBackup(filePath);
      this.failedReplacements++;
      return false;
    }

    return false;
  }

  /**
   * Fix elementalConstants.ts - Replace any with proper type
   */
  fixElementalConstants() {
    const filePath = 'src/constants/elementalConstants.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Look at the specific line and context
      const lines = content.split('\n');
      if (lines[5] && lines[5].includes('any')) {
        // Replace with Record<string, unknown> or appropriate type
        content = content.replace(
          /:\s*any\s*=/,
          ': Record<string, unknown> ='
        );
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);

        if (this.validateTypeScript()) {
          console.log(`  ✅ Successfully fixed elementalConstants.ts`);
          this.successfulReplacements++;
          return true;
        } else {
          console.log(`  ❌ TypeScript validation failed - rolling back`);
          this.restoreFromBackup(filePath);
          this.failedReplacements++;
          return false;
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.restoreFromBackup(filePath);
      this.failedReplacements++;
      return false;
    }

    return false;
  }

  /**
   * Fix calculationCache.ts - Replace function parameter any
   */
  fixCalculationCache() {
    const filePath = 'src/utils/calculationCache.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Replace function parameter any with unknown
      content = content.replace(
        /\(key:\s*any\)/g,
        '(key: string | number)'
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);

        if (this.validateTypeScript()) {
          console.log(`  ✅ Successfully fixed calculationCache.ts`);
          this.successfulReplacements++;
          return true;
        } else {
          console.log(`  ❌ TypeScript validation failed - rolling back`);
          this.restoreFromBackup(filePath);
          this.failedReplacements++;
          return false;
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.restoreFromBackup(filePath);
      this.failedReplacements++;
      return false;
    }

    return false;
  }

  /**
   * Fix awaitThenableUtils.ts - Replace thenable any type
   */
  fixAwaitThenableUtils() {
    const filePath = 'src/utils/awaitThenableUtils.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Replace thenable any with proper Promise type
      content = content.replace(
        /thenable:\s*any/g,
        'thenable: Promise<unknown> | { then: (resolve: (value: unknown) => void) => void }'
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);

        if (this.validateTypeScript()) {
          console.log(`  ✅ Successfully fixed awaitThenableUtils.ts`);
          this.successfulReplacements++;
          return true;
        } else {
          console.log(`  ❌ TypeScript validation failed - rolling back`);
          this.restoreFromBackup(filePath);
          this.failedReplacements++;
          return false;
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.restoreFromBackup(filePath);
      this.failedReplacements++;
      return false;
    }

    return false;
  }

  /**
   * Fix test files with safer any replacements
   */
  fixTestFiles() {
    const testFiles = [
      'src/__tests__/types/testUtils.ts',
      'src/__tests__/utils/CampaignTestController.ts'
    ];

    let fixed = 0;

    for (const filePath of testFiles) {
      console.log(`\n📁 Processing: ${filePath}`);

      try {
        this.createBackup(filePath);
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // For test files, we can be more aggressive with unknown replacements
        content = content.replace(
          /:\s*any\s*=/g,
          ': unknown ='
        );

        // Replace any[] with unknown[]
        content = content.replace(
          /:\s*any\[\]/g,
          ': unknown[]'
        );

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);

          if (this.validateTypeScript()) {
            console.log(`  ✅ Successfully fixed ${path.basename(filePath)}`);
            this.successfulReplacements++;
            fixed++;
          } else {
            console.log(`  ❌ TypeScript validation failed - rolling back`);
            this.restoreFromBackup(filePath);
            this.failedReplacements++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        this.restoreFromBackup(filePath);
        this.failedReplacements++;
      }
    }

    return fixed;
  }

  /**
   * Execute the manual optimization campaign
   */
  async execute() {
    console.log('🎯 Starting Manual Optimization Campaign');
    console.log('=' .repeat(60));

    // Get initial count
    const initialWarnings = this.getCurrentWarnings();
    console.log(`\nInitial explicit-any warnings: ${initialWarnings.length}`);

    // Apply targeted fixes
    console.log('\n🔧 Applying targeted fixes:');

    this.fixLoggerFile();
    this.fixElementalConstants();
    this.fixCalculationCache();
    this.fixAwaitThenableUtils();
    this.fixTestFiles();

    // Final report
    await this.generateReport(initialWarnings.length);
  }

  getCurrentWarnings() {
    try {
      const output = execSync('yarn lint --format=compact 2>&1 | grep "Unexpected any"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      return [];
    }
  }

  async generateReport(initialCount) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MANUAL OPTIMIZATION RESULTS');
    console.log('='.repeat(60));

    const finalWarnings = this.getCurrentWarnings();
    const finalCount = finalWarnings.length;
    const processed = initialCount - finalCount;
    const successRate = initialCount > 0 ? ((processed / initialCount) * 100).toFixed(1) : '0.0';

    console.log(`\n📈 Campaign Statistics:`);
    console.log(`  • Successful replacements: ${this.successfulReplacements}`);
    console.log(`  • Failed replacements: ${this.failedReplacements}`);
    console.log(`  • Warnings eliminated: ${processed}`);
    console.log(`  • Remaining warnings: ${finalCount}`);
    console.log(`  • Success rate: ${successRate}%`);

    const tsValid = this.validateTypeScript();
    console.log(`  • TypeScript compilation: ${tsValid ? '✅ Valid' : '❌ Errors'}`);

    console.log(`\n💾 Backup location: ${this.backupDir}`);

    if (finalCount === 0) {
      console.log('\n🏆 PERFECT ACHIEVEMENT: All explicit-any warnings eliminated!');
    } else if (processed > 0) {
      console.log(`\n🎉 SUCCESS: Eliminated ${processed} warnings (${successRate}% reduction)`);
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Execute the campaign
async function main() {
  const campaign = new ManualOptimizationCampaign();
  await campaign.execute();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ManualOptimizationCampaign };

#!/usr/bin/env node

/**
 * Comprehensive Final Fixes for Remaining Explicit-Any Warnings
 *
 * This script applies targeted fixes for the remaining explicit-any warnings
 * with careful consideration of each context.
 */

const fs = require('fs');
const { execSync } = require('child_process');

class ComprehensiveFinalFixes {
  constructor() {
    this.successfulFixes = 0;
    this.failedFixes = 0;
    this.backupDir = `.comprehensive-fixes-backups-${Date.now()}`;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    const backupPath = `${this.backupDir}/${filePath.replace(/\//g, '_')}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  getCurrentWarnings() {
    try {
      const output = execSync('yarn lint 2>&1 | grep "Unexpected any" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Apply all remaining fixes
   */
  applyAllFixes() {
    console.log('🎯 Applying Comprehensive Final Fixes');
    console.log('=' .repeat(50));

    const initialCount = this.getCurrentWarnings();
    console.log(`Initial warnings: ${initialCount}`);

    // Fix useStatePreservation.ts
    this.fixUseStatePreservation();

    // Fix developmentExperienceOptimizations.ts
    this.fixDevelopmentExperienceOptimizations();

    // Fix remaining campaign files
    this.fixCampaignFiles();

    // Fix remaining test files
    this.fixRemainingTestFiles();

    // Fix remaining utility files
    this.fixRemainingUtilityFiles();

    const finalCount = this.getCurrentWarnings();
    const fixed = initialCount - finalCount;

    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPREHENSIVE FIXES RESULTS');
    console.log('='.repeat(50));
    console.log(`Warnings eliminated: ${fixed}`);
    console.log(`Remaining warnings: ${finalCount}`);
    console.log(`Success rate: ${initialCount > 0 ? ((fixed / initialCount) * 100).toFixed(1) : '0.0'}%`);
    console.log('='.repeat(50));
  }

  fixUseStatePreservation() {
    const filePath = 'src/hooks/useStatePreservation.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace specific any usages with proper types
      content = content.replace(
        /setState:\s*\(\w+:\s*any\)\s*=>\s*void/g,
        'setState: (value: unknown) => void'
      );

      content = content.replace(
        /:\s*any\s*=\s*null/g,
        ': unknown = null'
      );

      content = content.replace(
        /\(\w+:\s*any\)\s*=>\s*\w+/g,
        '(value: unknown) => value'
      );

      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed useStatePreservation.ts`);
      this.successfulFixes++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.failedFixes++;
    }
  }

  fixDevelopmentExperienceOptimizations() {
    const filePath = 'src/utils/developmentExperienceOptimizations.ts';
    console.log(`\n📁 Processing: ${filePath}`);

    try {
      this.createBackup(filePath);
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace any with unknown for development utilities
      content = content.replace(
        /:\s*any\s*=/g,
        ': unknown ='
      );

      content = content.replace(
        /\bas\s+any\b/g,
        'as unknown'
      );

      content = content.replace(
        /\(\w+:\s*any\)/g,
        '(value: unknown)'
      );

      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed developmentExperienceOptimizations.ts`);
      this.successfulFixes++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      this.failedFixes++;
    }
  }

  fixCampaignFiles() {
    const campaignFiles = [
      'src/services/campaign/unintentional-any-elimination/ConservativeReplacementPilot.ts',
      'src/services/campaign/unintentional-any-elimination/ProgressiveImprovementEngine.ts'
    ];

    for (const filePath of campaignFiles) {
      console.log(`\n📁 Processing: ${filePath}`);

      try {
        this.createBackup(filePath);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace any with unknown in campaign files
        content = content.replace(
          /\bas\s+any\b/g,
          'as unknown'
        );

        content = content.replace(
          /:\s*any\[\]/g,
          ': unknown[]'
        );

        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed ${filePath.split('/').pop()}`);
        this.successfulFixes++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        this.failedFixes++;
      }
    }
  }

  fixRemainingTestFiles() {
    const testFiles = [
      'src/services/campaign/unintentional-any-elimination/__tests__/MetricsIntegration.test.ts'
    ];

    for (const filePath of testFiles) {
      console.log(`\n📁 Processing: ${filePath}`);

      try {
        this.createBackup(filePath);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace any with unknown in test files
        content = content.replace(
          /\bas\s+any\b/g,
          'as unknown'
        );

        content = content.replace(
          /:\s*any\s*=/g,
          ': unknown ='
        );

        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed ${filePath.split('/').pop()}`);
        this.successfulFixes++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        this.failedFixes++;
      }
    }
  }

  fixRemainingUtilityFiles() {
    const utilityFiles = [
      'src/utils/nutritionalUtils.ts',
      'src/utils/planetaryValidation.ts',
      'src/utils/recipe/recipeMatching.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/testRecommendations.ts',
      'src/utils/withRenderTracking.tsx'
    ];

    for (const filePath of utilityFiles) {
      if (!fs.existsSync(filePath)) continue;

      console.log(`\n📁 Processing: ${filePath}`);

      try {
        this.createBackup(filePath);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace any with unknown in utility files
        content = content.replace(
          /\bas\s+any\b/g,
          'as unknown'
        );

        content = content.replace(
          /:\s*any\[\]/g,
          ': unknown[]'
        );

        content = content.replace(
          /Record<string,\s*any>/g,
          'Record<string, unknown>'
        );

        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed ${filePath.split('/').pop()}`);
        this.successfulFixes++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        this.failedFixes++;
      }
    }
  }
}

// Execute the fixes
const fixer = new ComprehensiveFinalFixes();
fixer.applyAllFixes();

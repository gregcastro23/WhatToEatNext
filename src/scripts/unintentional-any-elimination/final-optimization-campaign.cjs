#!/usr/bin/env node

/**
 * Final Optimization Campaign for Maximum Achievement
 *
 * This script processes the remaining 28 explicit-any warnings with optimized patterns,
 * focusing on high-confidence replacements while maintaining 100% safety protocols.
 *
 * Target: Process remaining warnings to push toward 70%+ total reduction
 * Safety: Comprehensive backup and rollback systems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FinalOptimizationCampaign {
  constructor() {
    this.processedFiles = new Set();
    this.successfulReplacements = 0;
    this.failedReplacements = 0;
    this.backupDir = `.final-optimization-backups-${Date.now()}`;
    this.safetyProtocols = true;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get current explicit-any warnings with file locations
   */
  getCurrentWarnings() {
    try {
      const output = execSync('yarn lint --format=compact 2>&1 | grep "Unexpected any"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const warnings = [];
      const lines = output.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^(.+?): line (\d+), col (\d+), .+/);
        if (match) {
          const [, filePath, lineNum, colNum] = match;
          const relativePath = filePath.replace(process.cwd() + '/', '');
          warnings.push({
            file: relativePath,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            fullPath: filePath
          });
        }
      }

      return warnings;
    } catch (error) {
      console.log('No explicit-any warnings found or error occurred');
      return [];
    }
  }

  /**
   * Create backup of file before modification
   */
  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, path.basename(filePath));
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  /**
   * Restore file from backup
   */
  restoreFromBackup(filePath) {
    const backupPath = path.join(this.backupDir, path.basename(filePath));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      return true;
    }
    return false;
  }

  /**
   * Validate TypeScript compilation
   */
  validateTypeScript() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply optimized patterns for different any type categories
   */
  applyOptimizedPatterns(filePath, content, line, column) {
    const lines = content.split('\n');
    const targetLine = lines[line - 1];

    if (!targetLine) return null;

    let modified = false;
    let newContent = content;

    // Pattern 1: Array types (any[] → unknown[])
    if (targetLine.includes('any[]')) {
      console.log(`  Applying array type pattern: any[] → unknown[]`);
      newContent = newContent.replace(/:\s*any\[\]/g, ': unknown[]');
      modified = true;
    }

    // Pattern 2: Record types (Record<string, any> → Record<string, unknown>)
    if (targetLine.includes('Record<string, any>')) {
      console.log(`  Applying record type pattern: Record<string, any> → Record<string, unknown>`);
      newContent = newContent.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
      modified = true;
    }

    // Pattern 3: Variable declarations (const x: any → const x: unknown)
    if (targetLine.match(/:\s*any\s*[=;]/)) {
      console.log(`  Applying variable declaration pattern: any → unknown`);
      newContent = newContent.replace(/:\s*any\s*([=;])/g, ': unknown$1');
      modified = true;
    }

    // Pattern 4: Function parameters (param: any → param: unknown)
    if (targetLine.match(/\(\s*\w+:\s*any\s*\)/)) {
      console.log(`  Applying function parameter pattern: any → unknown`);
      newContent = newContent.replace(/(\(\s*\w+):\s*any(\s*\))/g, '$1: unknown$2');
      modified = true;
    }

    // Pattern 5: Generic constraints (T extends any → T extends unknown)
    if (targetLine.includes('extends any')) {
      console.log(`  Applying generic constraint pattern: extends any → extends unknown`);
      newContent = newContent.replace(/extends\s+any\b/g, 'extends unknown');
      modified = true;
    }

    // Pattern 6: Type assertions (as any → as unknown)
    if (targetLine.includes('as any')) {
      console.log(`  Applying type assertion pattern: as any → as unknown`);
      newContent = newContent.replace(/\bas\s+any\b/g, 'as unknown');
      modified = true;
    }

    // Pattern 7: Object property types ({ prop: any } → { prop: unknown })
    if (targetLine.match(/{\s*\w+:\s*any\s*}/)) {
      console.log(`  Applying object property pattern: any → unknown`);
      newContent = newContent.replace(/({\s*\w+):\s*any(\s*})/g, '$1: unknown$2');
      modified = true;
    }

    return modified ? newContent : null;
  }

  /**
   * Apply domain-specific analysis for special cases
   */
  applyDomainSpecificAnalysis(filePath, content) {
    // Astrological domain - preserve flexibility for planetary calculations
    if (filePath.includes('astrological') || filePath.includes('planetary')) {
      console.log(`  Applying astrological domain analysis`);
      // More conservative approach for astrological files
      return content.replace(/:\s*any\[\]/g, ': unknown[]');
    }

    // Campaign system domain - preserve dynamic configuration
    if (filePath.includes('campaign')) {
      console.log(`  Applying campaign system domain analysis`);
      // Focus on safe array and record types
      return content
        .replace(/:\s*any\[\]/g, ': unknown[]')
        .replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
    }

    // Test files - more aggressive replacement
    if (filePath.includes('__tests__') || filePath.includes('.test.')) {
      console.log(`  Applying test file domain analysis`);
      // More aggressive patterns for test files
      return content
        .replace(/:\s*any\[\]/g, ': unknown[]')
        .replace(/Record<string,\s*any>/g, 'Record<string, unknown>')
        .replace(/:\s*any\s*([=;])/g, ': unknown$1')
        .replace(/\bas\s+any\b/g, 'as unknown');
    }

    return content;
  }

  /**
   * Process a single file with optimized patterns
   */
  async processFile(warning) {
    const { file, line, column, fullPath } = warning;

    console.log(`\nProcessing: ${file}:${line}:${column}`);

    if (this.processedFiles.has(file)) {
      console.log(`  Skipping - already processed`);
      return false;
    }

    try {
      // Create backup
      const backupPath = this.createBackup(fullPath);
      console.log(`  Created backup: ${backupPath}`);

      // Read file content
      const content = fs.readFileSync(fullPath, 'utf8');

      // Apply optimized patterns
      let newContent = this.applyOptimizedPatterns(fullPath, content, line, column);

      // If no specific pattern matched, try domain-specific analysis
      if (!newContent) {
        newContent = this.applyDomainSpecificAnalysis(file, content);
      }

      // If still no changes, skip
      if (!newContent || newContent === content) {
        console.log(`  No applicable patterns found - skipping`);
        return false;
      }

      // Write modified content
      fs.writeFileSync(fullPath, newContent);
      console.log(`  Applied optimized patterns`);

      // Validate TypeScript compilation
      if (this.safetyProtocols && !this.validateTypeScript()) {
        console.log(`  TypeScript validation failed - rolling back`);
        this.restoreFromBackup(fullPath);
        this.failedReplacements++;
        return false;
      }

      console.log(`  ✅ Successfully processed`);
      this.processedFiles.add(file);
      this.successfulReplacements++;
      return true;

    } catch (error) {
      console.error(`  ❌ Error processing file: ${error.message}`);
      this.restoreFromBackup(fullPath);
      this.failedReplacements++;
      return false;
    }
  }

  /**
   * Execute the final optimization campaign
   */
  async execute() {
    console.log('🚀 Starting Final Optimization Campaign for Maximum Achievement');
    console.log('=' .repeat(70));

    // Get current warnings
    const warnings = this.getCurrentWarnings();
    console.log(`\nFound ${warnings.length} explicit-any warnings to process`);

    if (warnings.length === 0) {
      console.log('🎉 No explicit-any warnings found! Campaign already complete.');
      return;
    }

    // Group warnings by file for efficient processing
    const fileGroups = {};
    for (const warning of warnings) {
      if (!fileGroups[warning.file]) {
        fileGroups[warning.file] = [];
      }
      fileGroups[warning.file].push(warning);
    }

    console.log(`\nProcessing ${Object.keys(fileGroups).length} files with optimized patterns:`);

    // Process each file group
    for (const [file, fileWarnings] of Object.entries(fileGroups)) {
      console.log(`\n📁 Processing file: ${file} (${fileWarnings.length} warnings)`);

      // Process the first warning in each file (others may be resolved automatically)
      await this.processFile(fileWarnings[0]);

      // Small delay for safety
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final validation and reporting
    await this.generateFinalReport();
  }

  /**
   * Generate final campaign report
   */
  async generateFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL OPTIMIZATION CAMPAIGN RESULTS');
    console.log('='.repeat(70));

    // Get final warning count
    const finalWarnings = this.getCurrentWarnings();
    const finalCount = finalWarnings.length;

    console.log(`\n📈 Campaign Statistics:`);
    console.log(`  • Files processed: ${this.processedFiles.size}`);
    console.log(`  • Successful replacements: ${this.successfulReplacements}`);
    console.log(`  • Failed replacements: ${this.failedReplacements}`);
    console.log(`  • Remaining warnings: ${finalCount}`);

    // Calculate achievement percentage
    const originalCount = 28; // Starting count for this campaign
    const processed = originalCount - finalCount;
    const achievementRate = ((processed / originalCount) * 100).toFixed(1);

    console.log(`\n🎯 Achievement Metrics:`);
    console.log(`  • Warnings processed: ${processed}/${originalCount}`);
    console.log(`  • Campaign success rate: ${achievementRate}%`);
    console.log(`  • Safety protocols: ${this.safetyProtocols ? '✅ Active' : '❌ Disabled'}`);

    // TypeScript validation
    const tsValid = this.validateTypeScript();
    console.log(`  • TypeScript compilation: ${tsValid ? '✅ Valid' : '❌ Errors'}`);

    console.log(`\n💾 Backup location: ${this.backupDir}`);

    if (finalCount === 0) {
      console.log('\n🏆 LEGENDARY ACHIEVEMENT: All explicit-any warnings eliminated!');
    } else if (processed > 0) {
      console.log(`\n🎉 SUCCESS: Processed ${processed} warnings with ${achievementRate}% success rate`);
    } else {
      console.log('\n⚠️  No warnings could be processed with current patterns');
    }

    console.log('\n' + '='.repeat(70));
  }
}

// Execute the campaign
async function main() {
  const campaign = new FinalOptimizationCampaign();
  await campaign.execute();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FinalOptimizationCampaign };

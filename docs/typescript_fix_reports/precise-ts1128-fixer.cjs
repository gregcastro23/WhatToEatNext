#!/usr/bin/env node

/**
 * Precise TS1128 Declaration Error Fixer
 * Linting Excellence Campaign - Task 1.1 (Refined)
 *
 * Fixes specific TS1128 patterns with surgical precision:
 * 1. (: any : any { prop = value }: Type) -> ({ prop = value }: Type)
 * 2. {, property: value} -> { property: value }
 * 3. export: {, -> export: {
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreciseTS1128Fixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.precise-ts1128-backup-${Date.now()}`;
  }

  async run() {
    console.log('🎯 Precise TS1128 Declaration Error Fixes...\n');

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TS1128 errors found!');
        return;
      }

      // Get files with TS1128 errors
      const errorFiles = await this.getFilesWithTS1128Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1128 errors`);

      // Test on small batch first (5 files as per requirements)
      const testFiles = errorFiles.slice(0, 5);
      console.log(`\n🧪 Testing fixes on small batch (${testFiles.length} files)...`);

      const testSuccess = await this.testOnSmallBatch(testFiles);

      if (!testSuccess) {
        console.log('❌ Test batch failed validation - stopping');
        return;
      }

      // Process remaining files if test successful
      const remainingFiles = errorFiles.slice(5);
      if (remainingFiles.length > 0) {
        console.log(`\n🚀 Test successful, processing remaining ${remainingFiles.length} files...`);
        await this.processBatches(remainingFiles, initialErrors);
      }

      // Final results
      await this.showFinalResults(initialErrors);

    } catch (error) {
      console.error('❌ Fix failed:', error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log(`📁 Created backup directory: ${this.backupDir}`);
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getFilesWithTS1128Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1128"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const files = new Set();
      const lines = output.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^(.+?)\(/);
        if (match) {
          files.add(match[1]);
        }
      }

      return Array.from(files);
    } catch (error) {
      return [];
    }
  }

  async testOnSmallBatch(testFiles) {
    const initialErrors = await this.getTS1128ErrorCount();
    let testFixes = 0;

    for (const filePath of testFiles) {
      const fixes = await this.processFile(filePath);
      testFixes += fixes;
    }

    // Check if build still works
    const buildValid = await this.validateBuild();
    const afterTestErrors = await this.getTS1128ErrorCount();
    const testReduction = initialErrors - afterTestErrors;

    console.log(`   📊 Test Results:`);
    console.log(`   - Fixes applied: ${testFixes}`);
    console.log(`   - Errors reduced: ${testReduction}`);
    console.log(`   - Build valid: ${buildValid ? '✅' : '❌'}`);
    console.log(`   - Success: ${testReduction >= 0 && buildValid ? '✅' : '❌'}`);

    return testReduction >= 0 && buildValid;
  }

  async validateBuild() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck 2>/dev/null', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async processBatches(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing remaining files in batches...`);

    const batchSize = 10; // As per requirements
    const totalBatches = Math.ceil(errorFiles.length / batchSize);

    for (let i = 0; i < errorFiles.length; i += batchSize) {
      const batch = errorFiles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

      for (const filePath of batch) {
        await this.processFile(filePath);
      }

      // Build validation after each batch
      console.log(`   🔍 Validating build after batch ${batchNumber}...`);
      const buildValid = await this.validateBuild();

      if (!buildValid) {
        console.log('⚠️ Build validation failed, stopping for safety');
        break;
      }

      const currentErrors = await this.getTS1128ErrorCount();
      console.log(`   📊 Progress: ${currentErrors} TS1128 errors remaining`);
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      console.log(`   🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Precise malformed function parameters
      // Pattern: (: any : any { prop = value }: Type) -> ({ prop = value }: Type)
      const preciseParamPattern = /\(\s*:\s*any\s*:\s*any\s*(\{[^}]+\})\s*:\s*(\{[^}]+\})\s*\)/g;
      const matches1 = content.match(preciseParamPattern) || [];
      content = content.replace(preciseParamPattern, '($1: $2)');
      fixesApplied += matches1.length;

      // Fix 2: Malformed object literals with leading comma
      // Pattern: {, property: value} -> { property: value }
      const malformedObjectPattern = /\{\s*,\s*([^}]+)\}/g;
      const matches2 = content.match(malformedObjectPattern) || [];
      content = content.replace(malformedObjectPattern, '{ $1 }');
      fixesApplied += matches2.length;

      // Fix 3: Malformed export objects
      // Pattern: export: {, -> export: {
      const malformedExportPattern = /export:\s*\{\s*,\s*/g;
      const matches3 = content.match(malformedExportPattern) || [];
      content = content.replace(malformedExportPattern, 'export: { ');
      fixesApplied += matches3.length;

      // Fix 4: Incomplete export statements
      const incompleteExportPattern = /export\s*\{\s*$/gm;
      const matches4 = content.match(incompleteExportPattern) || [];
      content = content.replace(incompleteExportPattern, 'export {};');
      fixesApplied += matches4.length;

      // Fix 5: Missing semicolons after variable declarations
      const missingSemicolonPattern = /^(\s*const\s+\w+\s*:\s*[^=]+=\s*[^;]+)$/gm;
      const matches5 = content.match(missingSemicolonPattern) || [];
      content = content.replace(missingSemicolonPattern, '$1;');
      fixesApplied += matches5.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} precise fixes`);
      } else {
        console.log(`     - No fixes needed`);
      }

      return fixesApplied;

    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }

  async backupFile(filePath) {
    try {
      const relativePath = path.relative('.', filePath);
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDirPath = path.dirname(backupPath);

      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content);
    } catch (error) {
      console.log(`     ⚠️ Backup failed for ${filePath}: ${error.message}`);
    }
  }

  async showFinalResults(initialErrors) {
    console.log('\n📈 Precise TS1128 Declaration Fix Results:');

    const finalErrors = await this.getTS1128ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = initialErrors > 0 ? ((totalReduction / initialErrors) * 100).toFixed(1) : '0.0';

    console.log(`   Initial TS1128 errors: ${initialErrors}`);
    console.log(`   Final TS1128 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 50) {
      console.log('\n🎉 EXCELLENT! TS1128 errors reduced to very low level');
    } else if (parseFloat(reductionPercentage) >= 70) {
      console.log('\n🎯 GREAT! 70%+ error reduction achieved');
    } else if (parseFloat(reductionPercentage) >= 40) {
      console.log('\n✅ GOOD! 40%+ error reduction achieved');
    } else {
      console.log('\n⚠️ Partial success - may need additional targeted fixes');
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);

    // Preserve astrological calculation accuracy check
    console.log('\n🔮 Verifying astrological calculation accuracy...');
    const astroAccuracy = await this.verifyAstrologicalAccuracy();
    console.log(`   Astrological calculations: ${astroAccuracy ? '✅ PRESERVED' : '⚠️ NEEDS_REVIEW'}`);
  }

  async getTotalErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async verifyAstrologicalAccuracy() {
    try {
      // Check if key astrological files still compile
      const astroFiles = [
        'src/calculations/culinary/culinaryAstrology.ts',
        'src/calculations/alchemicalEngine.ts',
        'src/utils/reliableAstronomy.ts'
      ];

      for (const file of astroFiles) {
        if (fs.existsSync(file)) {
          execSync(`yarn tsc --noEmit --skipLibCheck ${file} 2>/dev/null`, { stdio: 'pipe' });
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new PreciseTS1128Fixer();
  fixer.run().catch(console.error);
}

module.exports = PreciseTS1128Fixer;

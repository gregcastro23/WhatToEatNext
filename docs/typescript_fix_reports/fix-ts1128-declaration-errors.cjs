#!/usr/bin/env node

/**
 * Targeted TS1128 Declaration Error Fixer
 *
 * Fixes common TS1128 patterns:
 * 1. Malformed function parameters: (: any : any { prop }) -> ({ prop }: any)
 * 2. Missing semicolons after statements
 * 3. Incomplete function declarations
 * 4. Malformed destructuring patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1128DeclarationErrorFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.ts1128-backup-${Date.now()}`;
  }

  async run() {
    console.log('🎯 Starting TS1128 Declaration Error Fixes...\n');

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

      // Process files in small batches
      await this.processBatches(errorFiles, initialErrors);

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

  async processBatches(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing files in small batches...`);

    const batchSize = 8; // Small batches for safety
    const totalBatches = Math.ceil(errorFiles.length / batchSize);
    let processedCount = 0;

    for (let i = 0; i < errorFiles.length; i += batchSize) {
      const batch = errorFiles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

      for (const filePath of batch) {
        await this.processFile(filePath);
        processedCount++;

        // Validation checkpoint every 4 files
        if (processedCount % 4 === 0) {
          const currentErrors = await this.getTS1128ErrorCount();
          console.log(`   📊 Progress: ${currentErrors} TS1128 errors remaining`);

          // Safety check - if errors increased significantly, stop
          if (currentErrors > initialErrorCount * 1.2) {
            console.log('⚠️ Error count increased significantly, stopping for safety');
            return;
          }
        }
      }
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      console.log(`   🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Malformed function parameters (: any : any { prop }) -> ({ prop }: any)
      const malformedParamPattern = /\(\s*:\s*any\s*:\s*any\s*\{\s*([^}]+)\s*\}\s*\)/g;
      const matches1 = content.match(malformedParamPattern) || [];
      content = content.replace(malformedParamPattern, '({ $1 }: any)');
      fixesApplied += matches1.length;

      // Fix 2: Double closing braces/parentheses at end of blocks
      const doubleClosingPattern = /\}\s*\}\s*;?\s*$/gm;
      const matches2 = content.match(doubleClosingPattern) || [];
      content = content.replace(doubleClosingPattern, '};');
      fixesApplied += matches2.length;

      // Fix 3: Incomplete export statements
      const incompleteExportPattern = /export\s*\{\s*$/gm;
      const matches3 = content.match(incompleteExportPattern) || [];
      content = content.replace(incompleteExportPattern, 'export {};');
      fixesApplied += matches3.length;

      // Fix 4: Missing semicolons after variable declarations
      const missingSemicolonPattern = /^(\s*const\s+\w+\s*=\s*[^;]+)$/gm;
      const matches4 = content.match(missingSemicolonPattern) || [];
      content = content.replace(missingSemicolonPattern, '$1;');
      fixesApplied += matches4.length;

      // Fix 5: Malformed destructuring in function parameters
      const malformedDestructuringPattern = /\(\s*\{\s*(\w+)\s*=\s*([^}]+)\s*\}\s*:\s*\{\s*\w+\?\s*:\s*\w+\s*\}\s*\)/g;
      const matches5 = content.match(malformedDestructuringPattern) || [];
      content = content.replace(malformedDestructuringPattern, '({ $1 = $2 }: { $1?: any })');
      fixesApplied += matches5.length;

      // Fix 6: Extra closing brackets/braces
      const extraClosingPattern = /\}\s*\)\s*;?\s*\}\s*;?\s*$/gm;
      const matches6 = content.match(extraClosingPattern) || [];
      content = content.replace(extraClosingPattern, '});');
      fixesApplied += matches6.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} declaration fixes`);
      } else {
        console.log(`     - No declaration fixes needed`);
      }

    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
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
    console.log('\n📈 TS1128 Declaration Fix Results:');

    const finalErrors = await this.getTS1128ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = ((totalReduction / initialErrors) * 100).toFixed(1);

    console.log(`   Initial TS1128 errors: ${initialErrors}`);
    console.log(`   Final TS1128 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 50) {
      console.log('\n🎉 EXCELLENT! TS1128 errors reduced to very low level');
    } else if (reductionPercentage >= 70) {
      console.log('\n🎯 GREAT! 70%+ error reduction achieved');
    } else if (reductionPercentage >= 40) {
      console.log('\n✅ GOOD! 40%+ error reduction achieved');
    } else {
      console.log('\n⚠️ Partial success - may need additional targeted fixes');
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);
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
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1128DeclarationErrorFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1128DeclarationErrorFixer;

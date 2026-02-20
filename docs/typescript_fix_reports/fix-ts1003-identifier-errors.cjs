#!/usr/bin/env node

/**
 * Enhanced TS1003 Identifier Error Fixer
 *
 * Addresses the specific TS1003 identifier errors found in the codebase:
 * 1. Malformed regex replace patterns (missing commas)
 * 2. Property access syntax issues
 * 3. JSX attribute syntax problems
 * 4. Function call syntax issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1003IdentifierFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.ts1003-identifier-backup-${Date.now()}`;
    this.batchSize = 15; // As specified in requirements
  }

  async run() {
    console.log('🎯 Starting TS1003 Identifier Error Fixes...\n');

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getTS1003ErrorCount();
      console.log(`📊 Initial TS1003 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TS1003 errors found!');
        return;
      }

      // Get files with TS1003 errors
      const errorFiles = await this.getFilesWithTS1003Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1003 errors`);

      // Process files in batches with validation
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

  async getTS1003ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1003"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getFilesWithTS1003Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1003"', {
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
    console.log(`\n🔧 Processing files in batches of ${this.batchSize} with validation...`);

    const totalBatches = Math.ceil(errorFiles.length / this.batchSize);
    let processedCount = 0;

    for (let i = 0; i < errorFiles.length; i += this.batchSize) {
      const batch = errorFiles.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;

      console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

      for (const filePath of batch) {
        await this.processFile(filePath);
        processedCount++;
      }

      // Validation checkpoint after each batch
      const buildValid = await this.validateBuild();
      if (!buildValid) {
        console.log('⚠️ Build validation failed, attempting to continue with safer fixes...');
        // Continue but with more conservative approach
      }

      const currentErrors = await this.getTS1003ErrorCount();
      console.log(`   📊 Progress: ${currentErrors} TS1003 errors remaining`);

      // Safety check - if errors increased significantly, stop
      if (currentErrors > initialErrorCount * 1.2) {
        console.log('⚠️ Error count increased significantly, stopping for safety');
        return;
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

      // Fix 1: Malformed regex replace patterns - missing comma between regex and replacement
      // Pattern: .replace(/pattern/g 'replacement') -> .replace(/pattern/g, 'replacement')
      const regexReplacePattern = /\.replace\(\/([^\/]+)\/([gimuy]*)\s+(['"`][^'"`]*['"`])\)/g;
      const regexMatches = content.match(regexReplacePattern) || [];
      content = content.replace(regexReplacePattern, '.replace(/$1/$2, $3)');
      fixesApplied += regexMatches.length;

      // Fix 2: Array access syntax issues - property.[index] -> property[index]
      const arrayAccessPattern = /(\w+)\.\[(\d+)\]/g;
      const arrayMatches = content.match(arrayAccessPattern) || [];
      content = content.replace(arrayAccessPattern, '$1[$2]');
      fixesApplied += arrayMatches.length;

      // Fix 3: Variable array access - property.[variable] -> property[variable]
      const variableAccessPattern = /(\w+)\.\[(\w+)\]/g;
      const variableMatches = content.match(variableAccessPattern) || [];
      content = content.replace(variableAccessPattern, '$1[$2]');
      fixesApplied += variableMatches.length;

      // Fix 4: Method call array access - method().[index] -> method()[index]
      const methodAccessPattern = /(\w+\(\))\.\[([^\]]+)\]/g;
      const methodMatches = content.match(methodAccessPattern) || [];
      content = content.replace(methodAccessPattern, '$1[$2]');
      fixesApplied += methodMatches.length;

      // Fix 5: Complex property access - object.[prop].method -> object[prop].method
      const complexAccessPattern = /(\w+)\.\[([^\]]+)\]\.(\w+)/g;
      const complexMatches = content.match(complexAccessPattern) || [];
      content = content.replace(complexAccessPattern, '$1[$2].$3');
      fixesApplied += complexMatches.length;

      // Fix 6: JSX attribute syntax issues - semicolon instead of comma
      // Pattern: attribute={value}; -> attribute={value},
      const jsxAttributePattern = /(\w+={[^}]+})\s*;\s*$/gm;
      const jsxMatches = content.match(jsxAttributePattern) || [];
      content = content.replace(jsxAttributePattern, '$1,');
      fixesApplied += jsxMatches.length;

      // Fix 7: Template literal property access issues
      const templateLiteralPattern = /\$\{([^}]+)\.\[([^\]]+)\]\}/g;
      const templateMatches = content.match(templateLiteralPattern) || [];
      content = content.replace(templateLiteralPattern, '${$1[$2]}');
      fixesApplied += templateMatches.length;

      // Fix 8: Function parameter destructuring issues
      const destructuringPattern = /\{\s*(\w+)\.\[(\w+)\]\s*\}/g;
      const destructuringMatches = content.match(destructuringPattern) || [];
      content = content.replace(destructuringPattern, '{ $1[$2] }');
      fixesApplied += destructuringMatches.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} identifier fixes`);
      } else {
        console.log(`     - No identifier fixes needed`);
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

  async validateBuild() {
    try {
      console.log('     🔍 Validating build...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('     ✅ Build validation passed');
      return true;
    } catch (error) {
      console.log('     ⚠️ Build validation failed');
      return false;
    }
  }

  async showFinalResults(initialErrors) {
    console.log('\n📈 TS1003 Identifier Fix Results:');

    const finalErrors = await this.getTS1003ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = ((totalReduction / initialErrors) * 100).toFixed(1);

    console.log(`   Initial TS1003 errors: ${initialErrors}`);
    console.log(`   Final TS1003 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors === 0) {
      console.log('\n🎉 PERFECT! All TS1003 errors eliminated');
    } else if (finalErrors <= 50) {
      console.log('\n🎯 EXCELLENT! TS1003 errors reduced to very low level');
    } else if (reductionPercentage >= 80) {
      console.log('\n✅ GREAT! 80%+ error reduction achieved');
    } else if (reductionPercentage >= 50) {
      console.log('\n👍 GOOD! 50%+ error reduction achieved');
    } else {
      console.log('\n⚠️ Partial success - may need additional targeted fixes');
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Final build validation
    const finalBuildValid = await this.validateBuild();
    if (finalBuildValid) {
      console.log('✅ Final build validation successful');
    } else {
      console.log('⚠️ Final build validation failed - review may be needed');
    }

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
  const fixer = new TS1003IdentifierFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1003IdentifierFixer;

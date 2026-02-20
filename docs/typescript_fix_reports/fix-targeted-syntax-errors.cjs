#!/usr/bin/env node

/**
 * Targeted Syntax Error Fixer for Phase 12.1
 *
 * Focuses on the most common and safe-to-fix syntax errors:
 * - Missing commas in function calls
 * - Malformed JSX attributes
 * - Simple identifier issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TargetedSyntaxFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.targeted-syntax-backup-${Date.now()}`;
  }

  async run() {
    console.log('🎯 Starting Targeted Syntax Error Fixes...\n');

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getErrorCount();
      console.log(`📊 Initial TypeScript errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TypeScript errors found!');
        return;
      }

      // Get files with specific fixable errors
      const errorFiles = await this.getFilesWithFixableErrors();
      console.log(`🔍 Found ${errorFiles.length} files with fixable syntax errors`);

      // Process files one by one with validation
      await this.processFiles(errorFiles, initialErrors);

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

  async getErrorCount() {
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

  async getFilesWithFixableErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS(1005|1003|1382|1381)"', {
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

  async processFiles(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing files with conservative fixes...`);

    let processedCount = 0;

    for (const filePath of errorFiles.slice(0, 10)) { // Process only first 10 files for safety
      await this.processFile(filePath);
      processedCount++;

      // Validation checkpoint every 3 files
      if (processedCount % 3 === 0) {
        const buildValid = await this.validateBuild();
        if (!buildValid) {
          console.log('⚠️ Build validation failed, stopping for safety');
          return;
        }

        const currentErrors = await this.getErrorCount();
        console.log(`   📊 Progress: ${currentErrors} errors remaining`);

        // Safety check - if errors increased, stop
        if (currentErrors > initialErrorCount * 1.05) {
          console.log('⚠️ Error count increased, stopping for safety');
          return;
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

      // Apply conservative fixes

      // Fix 1: Missing commas in replace function calls
      const pattern1 = /\.replace\(\/\\s\+\/g\s+'-'\)/g;
      const matches1 = content.match(pattern1) || [];
      content = content.replace(pattern1, ".replace(/\\s+/g, '-')");
      fixesApplied += matches1.length;

      // Fix 2: Malformed function parameters - remove extra colons
      const pattern2 = /function\s+\w+\([^)]*:\s*any\s*:\s*any\s*\{/g;
      const matches2 = content.match(pattern2) || [];
      content = content.replace(pattern2, (match) => {
        return match.replace(/:\s*any\s*:\s*any\s*\{/, '(props: any) {');
      });
      fixesApplied += matches2.length;

      // Fix 3: Missing semicolons that should be commas in JSX
      const pattern3 = /data-testid=\{[^}]+\};/g;
      const matches3 = content.match(pattern3) || [];
      content = content.replace(pattern3, (match) => match.replace('};', '}'));
      fixesApplied += matches3.length;

      // Fix 4: Simple identifier issues - extra spaces
      const pattern4 = /\{\s*'\s*>\s*'\s*\}/g;
      const matches4 = content.match(pattern4) || [];
      content = content.replace(pattern4, "{'>'} ");
      fixesApplied += matches4.length;

      // Fix 5: Simple brace issues
      const pattern5 = /\{\s*'\s*\}\s*'\s*\}/g;
      const matches5 = content.match(pattern5) || [];
      content = content.replace(pattern5, "{'}'} ");
      fixesApplied += matches5.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} conservative fixes`);
      } else {
        console.log(`     - No fixes needed`);
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
      execSync('yarn build', { stdio: 'pipe' });
      console.log('     ✅ Build validation passed');
      return true;
    } catch (error) {
      console.log('     ⚠️ Build validation failed');
      return false;
    }
  }

  async showFinalResults(initialErrors) {
    console.log('\n📈 Targeted Fix Results:');

    const finalErrors = await this.getErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = ((totalReduction / initialErrors) * 100).toFixed(1);

    console.log(`   Initial errors: ${initialErrors}`);
    console.log(`   Final errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 100) {
      console.log('\n🎉 SUCCESS! Target achieved: TypeScript errors reduced to <100');
    } else if (reductionPercentage >= 50) {
      console.log('\n✅ GOOD! 50%+ error reduction achieved');
    } else if (reductionPercentage >= 20) {
      console.log('\n📈 PROGRESS! 20%+ error reduction achieved');
    } else {
      console.log('\n⚠️ Minimal progress - may need different approach');
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Final build validation
    const finalBuildValid = await this.validateBuild();
    if (finalBuildValid) {
      console.log('✅ Final build validation successful');
    } else {
      console.log('⚠️ Final build validation failed - review may be needed');
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TargetedSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = TargetedSyntaxFixer;

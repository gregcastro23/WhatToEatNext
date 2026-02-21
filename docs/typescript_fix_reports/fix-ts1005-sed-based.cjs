#!/usr/bin/env node

/**
 * SED-Based TS1005 Fixes
 *
 * This script uses sed commands to fix TS1005 patterns:
 * 1. } catch (error): any { -> } catch (error) {
 * 2. test('...': any, async () => { -> test('...', async () => {
 * 3. it('...': any, async () => { -> it('...', async () => {
 *
 * Safety: Process files one at a time with build validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005SedFixer {
  constructor(options = {}) {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.dryRun = options.dryRun || false;
    this.maxFiles = options.maxFiles || 15; // Process up to 15 files as per task requirements
  }

  async run() {
    const mode = this.dryRun ? 'DRY-RUN' : 'EXECUTION';
    console.log(`🔧 Starting TS1005 SED-Based Fixes (${mode})...\n`);

    if (this.dryRun) {
      console.log('🔍 DRY-RUN MODE: No files will be modified, only showing what would be changed\n');
    }

    try {
      const initialErrors = this.getTS1005ErrorCount();
      console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TS1005 errors found!');
        return;
      }

      // Get files with errors
      const errorFiles = await this.getFilesWithTS1005Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1005 errors`);

      // Apply sed-based fixes
      console.log(`\n🛠️ Applying sed-based fixes (processing up to ${this.maxFiles} files)...`);

      let processedCount = 0;
      let totalFixesApplied = 0;

      for (const filePath of errorFiles) {
        if (processedCount >= this.maxFiles) {
          console.log(`\n⏸️ Stopping after processing ${this.maxFiles} files as per task requirements`);
          break;
        }

        processedCount++;
        console.log(`\n📦 Processing file ${processedCount}/${Math.min(errorFiles.length, this.maxFiles)}: ${path.basename(filePath)}`);

        const fixes = await this.fixFileWithSed(filePath);
        totalFixesApplied += fixes;

        if (fixes > 0 && !this.dryRun) {
          console.log(`   🔍 Validating build after ${fixes} fixes...`);
          const buildSuccess = this.validateBuild();
          if (!buildSuccess) {
            console.log('   ⚠️ Build validation failed, reverting file...');
            execSync(`git checkout -- "${filePath}"`);
            console.log('   ⚠️ Continuing with next file...');
            continue;
          } else {
            console.log('   ✅ Build validation passed');
          }

          // Check progress
          const currentErrors = this.getTS1005ErrorCount();
          console.log(`   📊 Current TS1005 errors: ${currentErrors}`);
        } else if (fixes > 0 && this.dryRun) {
          console.log(`   🔍 DRY-RUN: Would validate build after ${fixes} fixes`);
        }
      }

      // Final results
      if (!this.dryRun) {
        const finalErrors = this.getTS1005ErrorCount();
        const reduction = initialErrors - finalErrors;
        const percentage = reduction > 0 ? ((reduction / initialErrors) * 100).toFixed(1) : '0.0';

        console.log(`\n📈 Final Results:`);
        console.log(`   Initial errors: ${initialErrors}`);
        console.log(`   Final errors: ${finalErrors}`);
        console.log(`   Errors fixed: ${reduction}`);
        console.log(`   Reduction: ${percentage}%`);
        console.log(`   Files processed: ${this.fixedFiles.length}`);
        console.log(`   Total fixes applied: ${this.totalFixes}`);
      } else {
        console.log(`\n📈 DRY-RUN Results:`);
        console.log(`   Initial errors: ${initialErrors}`);
        console.log(`   Potential fixes: ${this.totalFixes}`);
        console.log(`   Files that would be processed: ${this.fixedFiles.length}`);
        console.log(`   \n✅ DRY-RUN COMPLETE - No files were modified`);
        console.log(`   To apply these fixes, run without --dry-run flag`);
      }

    } catch (error) {
      console.error('❌ Error during fixing:', error.message);
    }
  }

  getTS1005ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  validateBuild() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFilesWithTS1005Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"', {
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

  async fixFileWithSed(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      // Count errors before fixing
      const errorsBefore = this.getFileTS1005ErrorCount(filePath);

      if (errorsBefore === 0) {
        console.log(`   ℹ️ ${path.basename(filePath)}: No TS1005 errors found`);
        return 0;
      }

      console.log(`   🔍 ${path.basename(filePath)}: ${errorsBefore} TS1005 errors found`);

      if (!this.dryRun) {
        // Apply sed fixes
        try {
          // Fix 1: } catch (error): any { -> } catch (error) {
          execSync(`sed -i '' 's/} catch (error): any {/} catch (error) {/g' "${filePath}"`, {
            stdio: 'pipe'
          });

          // Fix 2: test('...': any, async () => { -> test('...', async () => {
          execSync(`sed -i '' "s/test('\\([^']*\\)': any, async () =>/test('\\1', async () =>/g" "${filePath}"`, {
            stdio: 'pipe'
          });

          // Fix 3: it('...': any, async () => { -> it('...', async () => {
          execSync(`sed -i '' "s/it('\\([^']*\\)': any, async () =>/it('\\1', async () =>/g" "${filePath}"`, {
            stdio: 'pipe'
          });

        } catch (sedError) {
          console.log(`   ⚠️ SED command failed: ${sedError.message}`);
          return 0;
        }
      }

      // Count errors after fixing
      const errorsAfter = this.dryRun ? 0 : this.getFileTS1005ErrorCount(filePath);
      const fixesApplied = errorsBefore - errorsAfter;

      if (fixesApplied > 0) {
        if (!this.dryRun) {
          console.log(`   ✅ ${path.basename(filePath)}: ${fixesApplied} fixes applied`);
        } else {
          console.log(`   🔍 ${path.basename(filePath)}: ${errorsBefore} fixes would be applied (DRY-RUN)`);
        }
        this.fixedFiles.push(filePath);
        this.totalFixes += this.dryRun ? errorsBefore : fixesApplied;
        return this.dryRun ? errorsBefore : fixesApplied;
      } else if (!this.dryRun) {
        console.log(`   ℹ️ ${path.basename(filePath)}: No fixes applied`);
      }

      return 0;

    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  getFileTS1005ErrorCount(filePath) {
    try {
      const output = execSync(`yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | grep "${filePath}" | wc -l`, {
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
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const maxFiles = args.includes('--max-files') ?
    parseInt(args[args.indexOf('--max-files') + 1]) || 15 : 15;

  const fixer = new TS1005SedFixer({ dryRun, maxFiles });
  fixer.run().catch(console.error);
}

module.exports = TS1005SedFixer;

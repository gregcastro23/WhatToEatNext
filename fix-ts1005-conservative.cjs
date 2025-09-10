#!/usr/bin/env node

/**
 * Conservative TS1005 Fixes
 *
 * This script fixes only the most obvious and safe TS1005 patterns:
 * 1. catch (error): any { -> catch (error) {
 * 2. test('...': any, async () => { -> test('...', async () => {
 * 3. it('...': any, async () => { -> it('...', async () => {
 *
 * Safety: Process 3 files at a time with build validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005ConservativeFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.batchSize = 3; // Very small batch size for maximum safety
  }

  async run() {
    console.log('🔧 Starting TS1005 Conservative Fixes...\n');

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

      // Apply conservative fixes
      console.log('\n🛠️ Applying conservative fixes...');

      for (let i = 0; i < errorFiles.length; i += this.batchSize) {
        const batch = errorFiles.slice(i, i + this.batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(errorFiles.length/this.batchSize)} (${batch.length} files)`);

        let batchFixes = 0;
        for (const filePath of batch) {
          const fixes = await this.fixFileConservative(filePath);
          batchFixes += fixes;
        }

        // Validate build after each batch
        if (batchFixes > 0) {
          console.log(`   🔍 Validating build after ${batchFixes} fixes...`);
          const buildSuccess = this.validateBuild();
          if (!buildSuccess) {
            console.log('   ⚠️ Build validation failed, reverting batch...');
            execSync('git checkout -- .');
            break;
          } else {
            console.log('   ✅ Build validation passed');
          }
        }

        // Check progress after each batch
        const currentErrors = this.getTS1005ErrorCount();
        console.log(`   📊 Current TS1005 errors: ${currentErrors}`);

        // Safety check - if errors increase, stop
        if (currentErrors > initialErrors) {
          console.log('⚠️ Error count increased, stopping fixes');
          break;
        }
      }

      // Final results
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

  async fixFileConservative(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: catch (error): any { -> catch (error) {
      // This is a very specific and safe pattern
      const catchPattern = /catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*\{/g;
      const catchMatches = content.match(catchPattern);
      if (catchMatches) {
        content = content.replace(catchPattern, 'catch ($1) {');
        fixesApplied += catchMatches.length;
      }

      // Fix 2: test('...': any, async () => { -> test('...', async () => {
      // Very specific pattern for malformed test signatures
      const testPattern = /test\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
      const testMatches = content.match(testPattern);
      if (testMatches) {
        content = content.replace(testPattern, 'test($1, async () =>');
        fixesApplied += testMatches.length;
      }

      // Fix 3: it('...': any, async () => { -> it('...', async () => {
      // Very specific pattern for malformed it signatures
      const itPattern = /it\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
      const itMatches = content.match(itPattern);
      if (itMatches) {
        content = content.replace(itPattern, 'it($1, async () =>');
        fixesApplied += itMatches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`   ✅ ${path.basename(filePath)}: ${fixesApplied} fixes applied`);
        return fixesApplied;
      }

      return 0;

    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005ConservativeFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005ConservativeFixer;

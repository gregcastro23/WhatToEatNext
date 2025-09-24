#!/usr/bin/env node

/**
 * Minimal TS1005 Fixes
 *
 * This script fixes only the most obvious syntax errors:
 * 1. } catch (error): any { -> } catch (error) {
 * 2. test('...': any, async () => { -> test('...', async () => {
 * 3. it('...': any, async () => { -> it('...', async () => {
 *
 * These are clear syntax errors that need fixing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005MinimalFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log('🎯 Starting TS1005 Minimal Fixes...\n');

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

      // Apply minimal fixes
      console.log('\n🛠️ Applying minimal fixes...');
      for (const filePath of errorFiles) {
        await this.fixFileMinimal(filePath);
      }

      // Final results
      const finalErrors = this.getTS1005ErrorCount();
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);

      console.log(`\n📈 Results:`);
      console.log(`   Initial errors: ${initialErrors}`);
      console.log(`   Final errors: ${finalErrors}`);
      console.log(`   Errors fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.fixedFiles.length}`);

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

  async fixFileMinimal(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: } catch (error): any { -> } catch (error) {
      // This is a clear syntax error - catch clauses cannot have return type annotations
      const beforeCatch = content;
      content = content.replace(/catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*\{/g, 'catch ($1) {');
      if (content !== beforeCatch) {
        const matches = beforeCatch.match(/catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*\{/g);
        fixesApplied += matches ? matches.length : 0;
      }

      // Fix 2: test('...': any, async () => { -> test('...', async () => {
      // The 'any' parameter is incorrect Jest syntax
      const beforeTest = content;
      content = content.replace(/test\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g, 'test($1, async () =>');
      if (content !== beforeTest) {
        const matches = beforeTest.match(/test\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g);
        fixesApplied += matches ? matches.length : 0;
      }

      // Fix 3: it('...': any, async () => { -> it('...', async () => {
      // The 'any' parameter is incorrect Jest syntax
      const beforeIt = content;
      content = content.replace(/it\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g, 'it($1, async () =>');
      if (content !== beforeIt) {
        const matches = beforeIt.match(/it\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g);
        fixesApplied += matches ? matches.length : 0;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`   ✅ ${path.basename(filePath)}: ${fixesApplied} fixes applied`);
      }

    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005MinimalFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005MinimalFixer;

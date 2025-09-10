#!/usr/bin/env node

/**
 * TS1005 Catch Block Fixer
 *
 * This script fixes only one specific pattern:
 * } catch (error): any { -> } catch (error) {
 *
 * This is the safest possible fix for TS1005 errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005CatchFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log('🔧 Starting TS1005 Catch Block Fixes...\n');

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

      // Apply catch block fixes
      console.log('\n🛠️ Applying catch block fixes...');

      for (const filePath of errorFiles) {
        await this.fixCatchBlocks(filePath);
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

  async fixCatchBlocks(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix: } catch (error): any { -> } catch (error) {
      // This is the most specific and safe pattern possible
      const catchPattern = /(\}\s*catch\s*\(\s*[^)]+\s*\))\s*:\s*any\s*(\{)/g;
      const matches = content.match(catchPattern);
      if (matches) {
        content = content.replace(catchPattern, '$1 $2');
        fixesApplied += matches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`   ✅ ${path.basename(filePath)}: ${fixesApplied} catch block fixes applied`);
      }

    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005CatchFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005CatchFixer;

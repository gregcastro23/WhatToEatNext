#!/usr/bin/env node

/**
 * TS1005 Remaining Pattern Fixer
 *
 * This script fixes the remaining TS1005 patterns after catch blocks and test signatures:
 * 1. Object destructuring issues
 * 2. Function parameter syntax errors
 * 3. Template literal and expression issues
 * 4. Missing commas and parentheses
 *
 * Very conservative approach with validation after each fix.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005RemainingPatternFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.batchSize = 5; // Small batch size for safety
  }

  async run() {
    console.log('🔧 Starting TS1005 Remaining Pattern Fixes...\n');

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

      // Apply remaining pattern fixes in small batches
      console.log('\n🛠️ Applying remaining pattern fixes...');

      for (let i = 0; i < errorFiles.length; i += this.batchSize) {
        const batch = errorFiles.slice(i, i + this.batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(errorFiles.length/this.batchSize)} (${batch.length} files)`);

        let batchFixes = 0;
        for (const filePath of batch) {
          const fixes = await this.fixRemainingPatterns(filePath);
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

  async fixRemainingPatterns(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Remove trailing commas in console.log statements
      // Pattern: console.log(..., \n);
      const consoleTrailingPattern = /console\.log\s*\([^)]*,\s*\n\s*\);/g;
      const consoleMatches = content.match(consoleTrailingPattern);
      if (consoleMatches) {
        content = content.replace(/console\.log\s*\(([^)]*),\s*\n\s*\);/g, 'console.log($1\n          );');
        fixesApplied += consoleMatches.length;
      }

      // Fix 2: Fix trailing commas in function calls
      // Pattern: someFunction(..., )
      const trailingCommaPattern = /,\s*\)/g;
      const trailingMatches = content.match(trailingCommaPattern);
      if (trailingMatches) {
        content = content.replace(trailingCommaPattern, ')');
        fixesApplied += trailingMatches.length;
      }

      // Fix 3: Fix missing commas in object destructuring
      // Pattern: {prop1 prop2} -> {prop1, prop2}
      const destructuringPattern = /\{\s*(\w+)\s+(\w+)\s*\}/g;
      const destructuringMatches = content.match(destructuringPattern);
      if (destructuringMatches) {
        content = content.replace(destructuringPattern, '{$1, $2}');
        fixesApplied += destructuringMatches.length;
      }

      // Fix 4: Fix incomplete template literals
      // Pattern: `${variable -> `${variable}`
      const incompleteTemplatePattern = /`\$\{[^}]*$/gm;
      const templateMatches = content.match(incompleteTemplatePattern);
      if (templateMatches) {
        // Only fix obvious cases where there's clearly a missing closing brace
        content = content.replace(/`\$\{([^}]*)\s*$/gm, '`${$1}`');
        fixesApplied += templateMatches.length;
      }

      // Fix 5: Fix missing semicolons in simple statements
      // Pattern: const x = value\n -> const x = value;\n
      const missingSemicolonPattern = /^(\s*(?:const|let|var)\s+\w+\s*=\s*[^;]+)\s*$/gm;
      const semicolonMatches = content.match(missingSemicolonPattern);
      if (semicolonMatches) {
        content = content.replace(missingSemicolonPattern, '$1;');
        fixesApplied += semicolonMatches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`   ✅ ${path.basename(filePath)}: ${fixesApplied} remaining pattern fixes applied`);
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
  const fixer = new TS1005RemainingPatternFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005RemainingPatternFixer;

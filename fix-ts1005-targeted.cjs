#!/usr/bin/env node

/**
 * Targeted TS1005 Comma and Expression Fixes
 *
 * This script focuses on specific, safe patterns that cause TS1005 errors:
 * - Incorrect catch clause type annotations
 * - Malformed test function parameters
 * - Date string formatting issues
 * - Simple comma placement errors
 *
 * Target: ~450 → ~150 errors (67% reduction)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005TargetedFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.safetyChecks = true;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🎯 Starting TS1005 Targeted Comma and Expression Fixes...\n');

    try {
      // Step 1: Get current error count
      const initialErrors = this.getTS1005ErrorCount();
      console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TS1005 errors found!');
        return;
      }

      // Step 2: Get files with TS1005 errors
      const errorFiles = await this.getFilesWithTS1005Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1005 errors`);

      // Step 3: Apply targeted fixes
      console.log('\n🛠️ Applying targeted fixes...');
      await this.applyTargetedFixes(errorFiles);

      // Step 4: Validate results
      const finalErrors = this.getTS1005ErrorCount();
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);

      console.log(`\n📈 Results:`);
      console.log(`   Initial errors: ${initialErrors}`);
      console.log(`   Final errors: ${finalErrors}`);
      console.log(`   Errors fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.fixedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);

      if (finalErrors <= 150) {
        console.log('🎉 Target achieved! TS1005 errors reduced to target level.');
      }

    } catch (error) {
      console.error('❌ Error during TS1005 fixing:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get current TS1005 error count
   */
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

  /**
   * Get list of files with TS1005 errors
   */
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

  /**
   * Apply targeted fixes to files
   */
  async applyTargetedFixes(files) {
    const batchSize = 10; // Smaller batches for safety

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)} (${batch.length} files)`);

      for (const filePath of batch) {
        await this.fixFileTargeted(filePath);
      }

      // Validate build after each batch
      if (this.safetyChecks) {
        console.log('🔍 Running safety check...');
        if (!this.validateBuild()) {
          console.log('⚠️ Build validation failed, stopping fixes');
          break;
        }
      }
    }
  }

  /**
   * Apply targeted fixes to a specific file
   */
  async fixFileTargeted(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️ File not found: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Incorrect catch clause type annotations
      // catch (error): any { -> catch (error) {
      const catchFixes = content.match(/catch\s*\([^)]+\)\s*:\s*any\s*\{/g);
      if (catchFixes) {
        content = content.replace(/catch\s*\(([^)]+)\)\s*:\s*any\s*\{/g, 'catch ($1) {');
        fixesApplied += catchFixes.length;
      }

      // Fix 2: Incorrect test function parameters
      // test('...', any, async () => { -> test('...', async () => {
      const testFixes = content.match(/test\s*\([^,]+,\s*any\s*,\s*async\s*\(\s*\)\s*=>/g);
      if (testFixes) {
        content = content.replace(/test\s*\(([^,]+),\s*any\s*,\s*async\s*\(\s*\)\s*=>/g, 'test($1, async () =>');
        fixesApplied += testFixes.length;
      }

      // Fix 3: Malformed date strings with extra spaces/commas
      // '2024-06-21T12: 0, 0:00Z' -> '2024-06-21T12:00:00Z'
      const dateFixes = content.match(/new Date\('[^']*:\s*\d+,\s*\d+:[^']*'\)/g);
      if (dateFixes) {
        content = content.replace(/new Date\('([^']*?):\s*(\d+),\s*(\d+):([^']*?)'\)/g, 'new Date(\'$1:$2:$3:$4\')');
        fixesApplied += dateFixes.length;
      }

      // Fix 4: Simple comma spacing in function calls
      // someFunction(param1,param2) -> someFunction(param1, param2)
      content = content.replace(/(\w+)\(([^)]*?)(\w+),(\w+)([^)]*?)\)/g, (match, func, before, param1, param2, after) => {
        if (!before.includes(',') && !after.includes(',')) {
          fixesApplied++;
          return `${func}(${before}${param1}, ${param2}${after})`;
        }
        return match;
      });

      // Fix 5: Object literal trailing commas in wrong positions
      // { prop1: value1, } -> { prop1: value1 }
      const trailingCommaFixes = content.match(/\{\s*[^}]*,\s*\}/g);
      if (trailingCommaFixes) {
        content = content.replace(/(\{[^}]*),(\s*\})/g, '$1$2');
        fixesApplied += trailingCommaFixes.length;
      }

      // Fix 6: Array literal trailing commas in wrong positions
      // [item1, item2, ] -> [item1, item2]
      const arrayTrailingCommaFixes = content.match(/\[\s*[^\]]*,\s*\]/g);
      if (arrayTrailingCommaFixes) {
        content = content.replace(/(\[[^\]]*),(\s*\])/g, '$1$2');
        fixesApplied += arrayTrailingCommaFixes.length;
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

  /**
   * Validate that the build still works
   */
  validateBuild() {
    try {
      console.log('   🔍 Checking TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('   ✅ Build validation passed');
      return true;
    } catch (error) {
      console.log('   ❌ Build validation failed');
      return false;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005TargetedFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005TargetedFixer;

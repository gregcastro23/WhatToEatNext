#!/usr/bin/env node

/**
 * Comprehensive TS1005 Comma and Expression Fixes
 *
 * This script systematically fixes TS1005 errors related to:
 * - Misplaced commas in string literals
 * - Incorrect comma placement in comparison operators
 * - Malformed function parameter lists
 * - Object literal syntax errors
 * - Array expression issues
 *
 * Target: ~450 → ~150 errors (67% reduction)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TS1005ComprehensiveFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.errorPatterns = [];
    this.safetyChecks = true;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔧 Starting TS1005 Comprehensive Comma and Expression Fixes...\n');

    try {
      // Step 1: Get current error count
      const initialErrors = this.getTS1005ErrorCount();
      console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log('✅ No TS1005 errors found!');
        return;
      }

      // Step 2: Analyze error patterns
      console.log('\n🔍 Analyzing error patterns...');
      await this.analyzeErrorPatterns();

      // Step 3: Apply fixes in batches
      console.log('\n🛠️ Applying fixes...');
      await this.applyFixesInBatches();

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
   * Analyze error patterns to understand what needs fixing
   */
  async analyzeErrorPatterns() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const lines = output.trim().split('\n').filter(line => line.trim());
      const fileErrors = {};

      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1005: (.+)$/);
        if (match) {
          const [, filePath, lineNum, colNum, message] = match;
          if (!fileErrors[filePath]) {
            fileErrors[filePath] = [];
          }
          fileErrors[filePath].push({
            line: parseInt(lineNum),
            column: parseInt(colNum),
            message: message.trim()
          });
        }
      }

      this.errorPatterns = fileErrors;
      console.log(`   Found errors in ${Object.keys(fileErrors).length} files`);
    } catch (error) {
      console.log('   No TS1005 errors found or analysis failed');
    }
  }

  /**
   * Apply fixes in batches to prevent overwhelming the system
   */
  async applyFixesInBatches() {
    const files = Object.keys(this.errorPatterns);
    const batchSize = 15; // Process 15 files at a time

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)} (${batch.length} files)`);

      for (const filePath of batch) {
        await this.fixFileTS1005Errors(filePath);
      }

      // Validate build after each batch
      if (this.safetyChecks && (i + batchSize) % 30 === 0) {
        console.log('🔍 Running safety check...');
        if (!this.validateBuild()) {
          console.log('⚠️ Build validation failed, stopping fixes');
          break;
        }
      }
    }
  }

  /**
   * Fix TS1005 errors in a specific file
   */
  async fixFileTS1005Errors(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️ File not found: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Pattern 1: Fix misplaced commas in string literals
      // 'memory, optimization' -> 'memory optimization'
      content = content.replace(/'([^']*),\s*([^']*)'/g, (match, part1, part2) => {
        if (this.isValidStringCommaReplacement(part1, part2)) {
          fixesApplied++;
          return `'${part1} ${part2}'`;
        }
        return match;
      });

      // Pattern 2: Fix comparison operators with commas
      // length >, 0 -> length > 0
      content = content.replace(/(\w+)\s*,\s*([><=!]+)\s*(\w+)/g, (match, var1, op, var2) => {
        if (this.isValidComparisonFix(var1, op, var2)) {
          fixesApplied++;
          return `${var1} ${op} ${var2}`;
        }
        return match;
      });

      // Pattern 3: Fix template literal commas
      // `memory, optimization` -> `memory optimization`
      content = content.replace(/`([^`]*),\s*([^`]*)`/g, (match, part1, part2) => {
        if (this.isValidTemplateCommaReplacement(part1, part2)) {
          fixesApplied++;
          return `\`${part1} ${part2}\``;
        }
        return match;
      });

      // Pattern 4: Fix function call commas in strings
      // console.log('Step 1: Detecting memory, leaks...') -> console.log('Step 1: Detecting memory leaks...')
      content = content.replace(/console\.log\('([^']*),\s*([^']*)'\)/g, (match, part1, part2) => {
        if (this.isValidConsoleLogFix(part1, part2)) {
          fixesApplied++;
          return `console.log('${part1} ${part2}')`;
        }
        return match;
      });

      // Pattern 5: Fix array/object literal trailing commas in wrong positions
      content = content.replace(/,\s*([><=!]+)\s*/g, (match, operator) => {
        if (this.isValidOperatorFix(operator)) {
          fixesApplied++;
          return ` ${operator} `;
        }
        return match;
      });

      // Pattern 6: Fix malformed conditional expressions
      // if(condition >, value) -> if(condition > value)
      content = content.replace(/if\s*\(\s*([^,]+),\s*([><=!]+)\s*([^)]+)\)/g, (match, condition, op, value) => {
        if (this.isValidConditionalFix(condition, op, value)) {
          fixesApplied++;
          return `if(${condition} ${op} ${value})`;
        }
        return match;
      });

      // Pattern 7: Fix method call parameter commas
      // method(param1, param2,) -> method(param1, param2)
      content = content.replace(/(\w+)\(([^)]*),\s*\)/g, (match, methodName, params) => {
        if (params.trim()) {
          fixesApplied++;
          return `${methodName}(${params})`;
        }
        return match;
      });

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
   * Validation functions for safe replacements
   */
  isValidStringCommaReplacement(part1, part2) {
    // Only replace if it looks like descriptive text, not code
    const codePatterns = /[{}[\]();=]/;
    return !codePatterns.test(part1) && !codePatterns.test(part2) &&
           part1.length > 0 && part2.length > 0;
  }

  isValidComparisonFix(var1, op, var2) {
    // Ensure it's a valid comparison operator
    const validOps = ['>', '<', '>=', '<=', '==', '===', '!=', '!=='];
    return validOps.includes(op) && /^\w+$/.test(var1) && /^\w+$/.test(var2);
  }

  isValidTemplateCommaReplacement(part1, part2) {
    // Similar to string replacement but for template literals
    const codePatterns = /[{}[\]();=]/;
    return !codePatterns.test(part1) && !codePatterns.test(part2);
  }

  isValidConsoleLogFix(part1, part2) {
    // Only fix console.log strings that look like descriptive messages
    return part1.length > 0 && part2.length > 0 &&
           !part1.includes('${') && !part2.includes('${');
  }

  isValidOperatorFix(operator) {
    const validOps = ['>', '<', '>=', '<=', '==', '===', '!=', '!=='];
    return validOps.includes(operator);
  }

  isValidConditionalFix(condition, op, value) {
    const validOps = ['>', '<', '>=', '<=', '==', '===', '!=', '!=='];
    return validOps.includes(op) && condition.trim() && value.trim();
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
  const fixer = new TS1005ComprehensiveFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005ComprehensiveFixer;

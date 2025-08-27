#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Fix Specific Syntax Errors Script
 * Targets the exact syntax patterns causing TS1005 and TS1003 errors
 */

class SpecificSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.backupDir = '.specific-syntax-backup';
  }

  async run() {
    console.log('🔧 Starting Specific Syntax Error Fixing...');
    console.log('Target: Fix malformed expressions and function parameters');

    try {
      // Create backup directory
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Get files with syntax errors
      const errorFiles = await this.getFilesWithSyntaxErrors();
      console.log(`Found ${errorFiles.length} files with syntax errors`);

      // Fix each file
      for (const file of errorFiles) {
        await this.fixSyntaxInFile(file);
      }

      // Final validation
      await this.validateFixes();

      console.log('✅ Specific syntax error fixing completed!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Error during fixing process:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get files that have syntax errors
   */
  async getFilesWithSyntaxErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const lines = error.stdout.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('error TS1005') || line.includes('error TS1003') || line.includes('error TS1128')) {
          const match = line.match(/^([^:]+):/);
          if (match && fs.existsSync(match[1])) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    }
  }

  /**
   * Fix syntax errors in a specific file
   */
  async fixSyntaxInFile(filePath) {
    try {
      console.log(`🔧 Fixing syntax in ${filePath}`);

      // Create backup
      const backupPath = path.join(this.backupDir, path.basename(filePath));
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content);

      let fixed = content;
      let modified = false;

      // Fix Pattern 1: Malformed property access like ((0 as any)?.4 || 0)
      const malformedPropertyPattern = /\(\((\d+(?:\.\d+)?)\s+as\s+any\)\?\.\s*(\d+(?:\.\d+)?)\s*\|\|\s*(\d+(?:\.\d+)?)\)/g;
      const newFixed1 = fixed.replace(malformedPropertyPattern, (match, num1, num2, num3) => {
        // This should be a decimal number like 0.4
        return `${num1}.${num2}`;
      });
      if (newFixed1 !== fixed) {
        fixed = newFixed1;
        modified = true;
        console.log(`  ✓ Fixed malformed property access pattern`);
      }

      // Fix Pattern 2: Malformed function parameters like createElementalProperties(defaultElements: ElementalProperties = {...})
      const malformedParameterPattern = /createElementalProperties\(defaultElements:\s*ElementalProperties\s*=\s*\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}\)/g;
      const newFixed2 = fixed.replace(malformedParameterPattern, 'createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })');
      if (newFixed2 !== fixed) {
        fixed = newFixed2;
        modified = true;
        console.log(`  ✓ Fixed malformed function parameter pattern`);
      }

      // Fix Pattern 3: Malformed property access like recipe.((monicaOptimization as any)?.optimizationScore || 0)
      const malformedRecipePattern = /(\w+)\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))/g;
      const newFixed3 = fixed.replace(malformedRecipePattern, (match, obj, expr) => {
        // Extract the property name and fix the expression
        const propMatch = expr.match(/\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/);
        if (propMatch) {
          const [, propName, accessPath, fallback] = propMatch;
          return `(${obj}.${propName} as any)?.${accessPath} || ${fallback}`;
        }
        return match;
      });
      if (newFixed3 !== fixed) {
        fixed = newFixed3;
        modified = true;
        console.log(`  ✓ Fixed malformed recipe property access pattern`);
      }

      // Fix Pattern 4: Malformed expressions with missing parentheses
      const missingParenPattern = /(\w+):\s*([^,\n}]+as\s+any\)\?\.[^,\n}]+)\s*\|\|\s*([^,\n}]+)\s*\*\s*([\d.]+),/g;
      const newFixed4 = fixed.replace(missingParenPattern, (match, prop, expr, fallback, multiplier) => {
        return `${prop}: (${expr} || ${fallback}) * ${multiplier},`;
      });
      if (newFixed4 !== fixed) {
        fixed = newFixed4;
        modified = true;
        console.log(`  ✓ Fixed missing parentheses pattern`);
      }

      // Fix Pattern 5: Malformed type assertions in object properties
      const malformedTypeAssertionPattern = /(\w+):\s*([^,\n}]+)\s+-\s+\(\([^)]+\s+as\s+any\)\?\.\s*(\d+(?:\.\d+)?)\s*\|\|\s*(\d+(?:\.\d+)?)\)\s*\*\s*([\d.]+)/g;
      const newFixed5 = fixed.replace(malformedTypeAssertionPattern, (match, prop, base, decimal1, decimal2, multiplier) => {
        // Reconstruct as a proper decimal subtraction
        const decimalValue = `${decimal1 === '0' ? '0' : decimal1}.${decimal2}`;
        return `${prop}: ${base} - ${decimalValue} * ${multiplier}`;
      });
      if (newFixed5 !== fixed) {
        fixed = newFixed5;
        modified = true;
        console.log(`  ✓ Fixed malformed type assertion in object property`);
      }

      // Fix Pattern 6: Malformed function call patterns
      const malformedFunctionCallPattern = /\(\(\) => \(\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}\)\)\(/g;
      const newFixed6 = fixed.replace(malformedFunctionCallPattern, '(() => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }))(');
      if (newFixed6 !== fixed) {
        fixed = newFixed6;
        modified = true;
        console.log(`  ✓ Fixed malformed function call pattern`);
      }

      // Fix Pattern 7: Broken conditional expressions
      const brokenConditionalPattern = /\?\s*\.\s*(\w+)/g;
      const newFixed7 = fixed.replace(brokenConditionalPattern, '?.$1');
      if (newFixed7 !== fixed) {
        fixed = newFixed7;
        modified = true;
        console.log(`  ✓ Fixed broken conditional expressions`);
      }

      if (modified) {
        fs.writeFileSync(filePath, fixed);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed syntax errors in ${filePath}`);
      } else {
        console.log(`  - No changes needed in ${filePath}`);
      }

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log('\n🔍 Validating syntax fixes...');

    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('✅ TypeScript compilation successful - Zero errors achieved!');
      return true;

    } catch (error) {
      const errorCount = (error.stdout.match(/error TS/g) || []).length;
      console.log(`⚠️  ${errorCount} TypeScript errors remaining`);

      // Get error breakdown
      const syntaxErrors = (error.stdout.match(/error TS1005|error TS1003|error TS1128|error TS1068|error TS1434/g) || []).length;
      const otherErrors = errorCount - syntaxErrors;

      console.log(`  - Syntax errors: ${syntaxErrors}`);
      console.log(`  - Other errors: ${otherErrors}`);

      if (syntaxErrors === 0) {
        console.log('🎯 All syntax errors fixed!');
      } else if (syntaxErrors < 50) {
        console.log('🎯 Significant progress on syntax errors');
      }

      return syntaxErrors === 0;
    }
  }

  /**
   * Print summary of fixes applied
   */
  printSummary() {
    console.log('\n📊 Specific Syntax Fix Summary:');
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log(`Backup directory: ${this.backupDir}`);
    console.log('\n🎯 Target: Zero TypeScript compilation errors');
    console.log('✅ Specific syntax fixing process completed');
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new SpecificSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = SpecificSyntaxFixer;

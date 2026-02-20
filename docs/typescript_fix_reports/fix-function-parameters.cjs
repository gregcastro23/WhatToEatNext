#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { globSync } = require('glob');

/**
 * Fix Function Parameters Script
 * Fixes the specific pattern: createElementalProperties(defaultElements: ElementalProperties = {...})
 */

class FunctionParameterFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.backupDir = '.function-parameter-backup';
  }

  async run() {
    console.log('🔧 Starting Function Parameter Fixing...');
    console.log('Target: Fix malformed function parameter patterns');

    try {
      // Create backup directory
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Get all TypeScript files
      const files = globSync('src/**/*.{ts,tsx}', {
        ignore: ['node_modules/**', '.next/**', 'dist/**']
      });

      console.log(`Processing ${files.length} TypeScript files...`);

      // Fix each file
      for (const file of files) {
        await this.fixFunctionParameters(file);
      }

      // Final validation
      await this.validateFixes();

      console.log('✅ Function parameter fixing completed!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Error during fixing process:', error.message);
      process.exit(1);
    }
  }

  /**
   * Fix function parameters in a file
   */
  async fixFunctionParameters(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Pattern: createElementalProperties(defaultElements: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
      const malformedParameterPattern = /createElementalProperties\(defaultElements:\s*ElementalProperties\s*=\s*\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}\)/g;

      const newContent = content.replace(malformedParameterPattern, 'createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })');

      if (newContent !== content) {
        content = newContent;
        modified = true;
      }

      // Also fix any variations with different spacing or values
      const variationPattern = /createElementalProperties\(defaultElements:\s*ElementalProperties\s*=\s*\{[^}]+\}\)/g;
      const newContent2 = content.replace(variationPattern, 'createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })');

      if (newContent2 !== content) {
        content = newContent2;
        modified = true;
      }

      if (modified) {
        // Create backup
        const backupPath = path.join(this.backupDir, path.basename(filePath));
        fs.writeFileSync(backupPath, originalContent);

        // Write fixed content
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed function parameters in ${filePath}`);
      }

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log('\n🔍 Validating function parameter fixes...');

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
    console.log('\n📊 Function Parameter Fix Summary:');
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log(`Backup directory: ${this.backupDir}`);
    console.log('\n🎯 Target: Zero TypeScript compilation errors');
    console.log('✅ Function parameter fixing process completed');
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new FunctionParameterFixer();
  fixer.run().catch(console.error);
}

module.exports = FunctionParameterFixer;

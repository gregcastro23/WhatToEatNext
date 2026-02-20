#!/usr/bin/env node

/**
 * Fix Critical Syntax Errors - Phase 12.2 Prerequisite
 *
 * Fixes all critical syntax errors preventing build compilation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CriticalSyntaxFixer {
  constructor() {
    this.backupDir = `.critical-syntax-backup-${Date.now()}`;
    this.logFile = `critical-syntax-fixes-${Date.now()}.md`;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    this.log('Critical Syntax Fixer Started');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logEntry);
  }

  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath.replace(/\//g, '_'));
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.log(`File not found: ${filePath}`);
      return false;
    }

    this.log(`Fixing: ${filePath}`);
    this.createBackup(filePath);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix specific issues found in build errors

    // 1. Fix malformed decimal numbers (0.10.15 -> 0.15)
    if (content.includes('0.10.15')) {
      content = content.replace(/0\.10\.15/g, '0.15');
      modified = true;
      this.log(`  ✅ Fixed malformed decimal: 0.10.15 -> 0.15`);
    }

    // 2. Fix octal literals in slice() calls (05 -> 5)
    const octalInSlice = /\.slice\(0([0-9]+)\)/g;
    if (octalInSlice.test(content)) {
      content = content.replace(octalInSlice, (match, digits) => {
        const decimal = parseInt(digits, 10);
        return `.slice(${decimal})`;
      });
      modified = true;
      this.log(`  ✅ Fixed octal literals in slice() calls`);
    }

    // 3. Fix interface syntax errors (extra commas)
    const interfaceCommaFix = /(\w+):\s*([^,\n}]+);,/g;
    if (interfaceCommaFix.test(content)) {
      content = content.replace(interfaceCommaFix, '$1: $2;');
      modified = true;
      this.log(`  ✅ Fixed interface syntax (removed extra commas)`);
    }

    // 4. Fix trailing commas in object properties
    const trailingCommaFix = /(\w+):\s*([^,\n}]+),\s*\n\s*(\w+):/g;
    if (trailingCommaFix.test(content)) {
      content = content.replace(trailingCommaFix, '$1: $2,\n  $3:');
      modified = true;
      this.log(`  ✅ Fixed trailing commas in objects`);
    }

    // 5. Fix all remaining octal literals
    const octalPatterns = [
      { pattern: /\b00\b/g, replacement: '0' },
      { pattern: /\b01\b/g, replacement: '1' },
      { pattern: /\b02\b/g, replacement: '2' },
      { pattern: /\b03\b/g, replacement: '3' },
      { pattern: /\b04\b/g, replacement: '4' },
      { pattern: /\b05\b/g, replacement: '5' },
      { pattern: /\b06\b/g, replacement: '6' },
      { pattern: /\b07\b/g, replacement: '7' },
      { pattern: /\b010\b/g, replacement: '10' },
      { pattern: /\b011\b/g, replacement: '11' },
      { pattern: /\b012\b/g, replacement: '12' },
      { pattern: /\b015\b/g, replacement: '15' },
      { pattern: /\b020\b/g, replacement: '20' }
    ];

    for (const { pattern, replacement } of octalPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.log(`  ✅ Successfully fixed ${filePath}`);
      return true;
    } else {
      this.log(`  ℹ️ No changes needed for ${filePath}`);
      return false;
    }
  }

  validateBuild() {
    try {
      this.log('Validating build...');
      execSync('yarn build', { stdio: 'pipe', timeout: 60000 });
      this.log('✅ Build validation passed');
      return true;
    } catch (error) {
      this.log('❌ Build validation failed');
      // Extract specific error details
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      const lines = errorOutput.split('\n').slice(0, 20); // First 20 lines
      this.log('Build errors:');
      lines.forEach(line => {
        if (line.trim()) {
          this.log(`  ${line}`);
        }
      });
      return false;
    }
  }

  execute() {
    this.log('Starting Critical Syntax Error Fixes');

    // Files identified from build errors
    const criticalFiles = [
      'src/calculations/alchemicalTransformation.ts',
      'src/constants/alchemicalPillars.ts',
      'src/services/AlchemicalRecommendationService.ts',
      'src/services/UnifiedIngredientService.ts',
      'src/services/UnifiedRecipeService.ts'
    ];

    let totalFixed = 0;

    for (const filePath of criticalFiles) {
      if (this.fixFile(filePath)) {
        totalFixed++;
      }
    }

    this.log(`\nFixed ${totalFixed} critical files`);

    // Validate build after fixes
    const buildValid = this.validateBuild();

    if (buildValid) {
      this.log('\n🎉 Critical syntax errors fixed successfully!');
      this.log('✅ Build is now stable');
      return true;
    } else {
      this.log('\n⚠️ Some build issues remain');
      this.log(`Backup available at: ${this.backupDir}`);
      return false;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new CriticalSyntaxFixer();
  const success = fixer.execute();
  process.exit(success ? 0 : 1);
}

module.exports = CriticalSyntaxFixer;

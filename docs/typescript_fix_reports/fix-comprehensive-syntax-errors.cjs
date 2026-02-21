#!/usr/bin/env node

/**
 * Comprehensive syntax error fix for all files affected by the cleanup script
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  execute() {
    console.log('🔧 Running comprehensive syntax error fix...\n');

    // Find all TypeScript/JavaScript files that might have syntax errors
    const files = this.findAllSourceFiles();

    for (const filePath of files) {
      this.fixSyntaxInFile(filePath);
    }

    console.log(`\n✅ Fixed syntax errors in ${this.fixedFiles.length} files (${this.totalFixes} total fixes)`);
  }

  findAllSourceFiles() {
    const dirs = ['src'];
    const files = [];

    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath);
        }
      }
    };

    for (const dir of dirs) {
      scanDir(dir);
    }

    return files;
  }

  fixSyntaxInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let changes = 0;

    // Fix 1: Object literal syntax "= {;" -> "= {"
    const objectLiteralFix = fixed.replace(/=\s*\{\s*;/g, '= {');
    if (objectLiteralFix !== fixed) {
      fixed = objectLiteralFix;
      changes++;
    }

    // Fix 2: Array literal syntax "= [;" -> "= ["
    const arrayLiteralFix = fixed.replace(/=\s*\[\s*;/g, '= [');
    if (arrayLiteralFix !== fixed) {
      fixed = arrayLiteralFix;
      changes++;
    }

    // Fix 3: Function parameter syntax "= (;" -> "= ("
    const functionParamFix = fixed.replace(/=\s*\(\s*;/g, '= (');
    if (functionParamFix !== fixed) {
      fixed = functionParamFix;
      changes++;
    }

    // Fix 4: Arrow function syntax ") =>;" -> ") =>"
    const arrowFunctionFix = fixed.replace(/\)\s*=>\s*;/g, ') =>');
    if (arrowFunctionFix !== fixed) {
      fixed = arrowFunctionFix;
      changes++;
    }

    // Fix 5: Property ending with semicolon in objects "property;" -> "property"
    const propertyFix = fixed.replace(/(\w+:\s*[^,}]+);(\s*[,}])/g, '$1$2');
    if (propertyFix !== fixed) {
      fixed = propertyFix;
      changes++;
    }

    // Fix 6: Interface/type syntax issues
    const interfaceFix = fixed.replace(/interface\s+(\w+)\s*\{\s*;/g, 'interface $1 {');
    if (interfaceFix !== fixed) {
      fixed = interfaceFix;
      changes++;
    }

    // Fix 7: Conditional expression syntax "condition;" -> "condition"
    const conditionalFix = fixed.replace(/(\?\s*[^:]+:\s*[^;]+);(\s*[?:])/g, '$1$2');
    if (conditionalFix !== fixed) {
      fixed = conditionalFix;
      changes++;
    }

  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new ComprehensiveSyntaxFixer();
  fixer.execute();
}

module.exports = ComprehensiveSyntaxFixer;

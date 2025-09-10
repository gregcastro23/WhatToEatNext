#!/usr/bin/env node

/**
 * Fix syntax errors introduced by the strategic cleanup script
 */

const fs = require('fs');
const path = require('path');

class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = [];
  }

  execute() {
    console.log('🔧 Fixing syntax errors introduced by cleanup script...\n');

    const filesToFix = [
      'src/app/alchm-kitchen/SignVectorPanel.tsx',
      'src/context/AstrologicalContext.tsx',
      'src/contexts/AlchemicalContext/provider.tsx',
      'src/utils/logger.ts',
      'src/utils/signVectors.ts'
    ];

    for (const filePath of filesToFix) {
      if (fs.existsSync(filePath)) {
        this.fixSyntaxInFile(filePath);
      }
    }

    console.log(`✅ Fixed syntax errors in ${this.fixedFiles.length} files`);
  }

  fixSyntaxInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let changes = 0;

    // Fix pattern: "= {;" -> "= {"
    const objectLiteralPattern = /=\s*\{;/g;
    if (objectLiteralPattern.test(fixed)) {
      fixed = fixed.replace(objectLiteralPattern, '= {');
      changes++;
    }

    // Fix pattern: "}) {;" -> "}) {"
    const functionPattern = /\)\s*\{\s*;/g;
    if (functionPattern.test(fixed)) {
      fixed = fixed.replace(functionPattern, ') {');
      changes++;
    }

    // Fix pattern: "const func = (;" -> "const func = ("
    const functionDefPattern = /=\s*\(\s*;/g;
    if (functionDefPattern.test(fixed)) {
      fixed = fixed.replace(functionDefPattern, '= (');
      changes++;
    }

    // Fix pattern: ") => {;" -> ") => {"
    const arrowFunctionPattern = /\)\s*=>\s*\{\s*;/g;
    if (arrowFunctionPattern.test(fixed)) {
      fixed = fixed.replace(arrowFunctionPattern, ') => {');
      changes++;
    }

    // Fix pattern: ") =>;" -> ") =>"
    const arrowPattern = /\)\s*=>\s*;/g;
    if (arrowPattern.test(fixed)) {
      fixed = fixed.replace(arrowPattern, ') =>');
      changes++;
    }

    // Fix pattern: "property,;" -> "property,"
    const propertyPattern = /,\s*;/g;
    if (propertyPattern.test(fixed)) {
      fixed = fixed.replace(propertyPattern, ',');
      changes++;
    }

    // Fix pattern: "};" at end of object literals that should just be "}"
    const objectEndPattern = /\}\s*;(\s*[,\)\]\}])/g;
    if (objectEndPattern.test(fixed)) {
      fixed = fixed.replace(objectEndPattern, '}$1');
      changes++;
    }

    if (changes > 0) {
      fs.writeFileSync(filePath, fixed);
      console.log(`📝 Fixed ${changes} syntax errors in ${filePath}`);
      this.fixedFiles.push(filePath);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new SyntaxErrorFixer();
  fixer.execute();
}

module.exports = SyntaxErrorFixer;

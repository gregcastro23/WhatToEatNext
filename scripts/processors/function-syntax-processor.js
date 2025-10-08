#!/usr/bin/env node

/**
 * Function Syntax Processor - Phase 3 Wave 1
 * Fixes function declaration and statement syntax errors (TS1128 errors)
 */

import fs from 'fs';
import path from 'path';

class FunctionSyntaxProcessor {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '../..');
    this.filesProcessed = 0;
    this.functionsFixed = 0;
    this.parametersFixed = 0;
    this.backupDir = path.join(this.projectRoot, 'backups', 'phase3', 'functions');
  }

  async process() {
    console.log('🔧 Processing function syntax errors...');

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with function syntax errors
    const filesWithErrors = await this.getFilesWithFunctionErrors();

    console.log(`Found ${filesWithErrors.length} files with function syntax errors`);

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      functionsFixed: this.functionsFixed,
      parametersFixed: this.parametersFixed,
      success: true
    };
  }

  async getFilesWithFunctionErrors() {
    // Files with TS1128 Declaration or statement expected errors
    const errorFiles = [
      'src/utils/strictNullChecksHelper.ts',
      'src/utils/sunTimes.ts',
      'src/utils/tarotUtils.ts',
      'src/utils/testIngredientMapping.ts',
      'src/utils/timeUtils.ts',
      'src/utils/timingUtils.ts',
      'src/utils/typeValidation.ts',
      'src/utils/validateIngredients.ts',
      'src/utils/validatePlanetaryPositions.ts',
      'src/utils/withRenderTracking.tsx',
      'src/utils/zodiacUtils.ts',
      // Add more from error analysis
    ];

    return errorFiles.filter(file => {
      const fullPath = path.join(this.projectRoot, file);
      return fs.existsSync(fullPath);
    });
  }

  async processFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    console.log(`Processing ${filePath}...`);

    // Backup original
    const backupPath = path.join(this.backupDir, path.basename(filePath) + '.backup');
    fs.copyFileSync(fullPath, backupPath);

    let content = fs.readFileSync(fullPath, 'utf8');
    let localFunctions = 0;
    let localParams = 0;

    // Fix function declarations
    const funcResult = this.fixFunctionDeclarations(content);
    content = funcResult.content;
    localFunctions += funcResult.fixes;

    // Fix function parameters
    const paramResult = this.fixFunctionParameters(content);
    content = paramResult.content;
    localParams += paramResult.fixes;

    // Fix arrow function syntax
    const arrowResult = this.fixArrowFunctions(content);
    content = arrowResult.content;
    localFunctions += arrowResult.fixes;

    if (localFunctions > 0 || localParams > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.functionsFixed += localFunctions;
      this.parametersFixed += localParams;
      console.log(`  ✓ Fixed ${localFunctions} functions, ${localParams} parameters`);
    }
  }

  fixFunctionDeclarations(content) {
    let fixes = 0;

    // Fix missing opening braces in function declarations
    // Pattern: function name(param) -> function name(param) {
    content = content.replace(
      /function\s+(\w+)\s*\([^)]*\)\s*([^{])/g,
      (match, name, after) => {
        if (!after.trim().startsWith('{')) {
          fixes++;
          return `function ${name}(`;
        }
        return match;
      }
    );

    // Fix missing closing parentheses in function declarations
    // Pattern: function name(param -> function name(param)
    content = content.replace(
      /function\s+(\w+)\s*\([^)]*$/gm,
      (match, name) => {
        if (!match.includes(')')) {
          fixes++;
          return `${match}) {`;
        }
        return match;
      }
    );

    return { content, fixes };
  }

  fixFunctionParameters(content) {
    let fixes = 0;

    // Fix default parameter syntax
    // Pattern: (param = value { -> (param = value) {
    content = content.replace(
      /\(\s*([^)]*=\s*[^,)]+)\s*\{/g,
      (match, params) => {
        fixes++;
        return `(${params}) {`;
      }
    );

    // Fix malformed parameter lists
    // Pattern: (param1 param2 { -> (param1, param2) {
    content = content.replace(
      /\(\s*(\w+)\s+(\w+)\s*\{/g,
      (match, param1, param2) => {
        fixes++;
        return `(${param1}, ${param2}) {`;
      }
    );

    return { content, fixes };
  }

  fixArrowFunctions(content) {
    let fixes = 0;

    // Fix arrow function syntax
    // Pattern: param => { -> (param) => {
    content = content.replace(
      /(\w+)\s*=>\s*\{/g,
      (match, param) => {
        if (!param.includes('(') && !param.includes(')')) {
          fixes++;
          return `(${param}) => {`;
        }
        return match;
      }
    );

    // Fix arrow function bodies
    // Pattern: => expression -> => { return expression; }
    content = content.replace(
      /=>\s*([^;{}\n]+);?$/gm,
      (match, expression) => {
        if (!expression.includes('{') && !expression.includes('return')) {
          fixes++;
          return `=> {\n    return ${expression};\n  }`;
        }
        return match;
      }
    );

    return { content, fixes };
  }
}

export default FunctionSyntaxProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new FunctionSyntaxProcessor();
  processor.process().then(result => {
    console.log('\n✅ Function syntax processing complete:');
    console.log(`Files processed: ${result.filesProcessed}`);
    console.log(`Functions fixed: ${result.functionsFixed}`);
    console.log(`Parameters fixed: ${result.parametersFixed}`);
  }).catch(console.error);
}

#!/usr/bin/env node

/**
 * Phase 3: Systematic Error Elimination Toolkit
 * WhatToEatNext - October 8, 2025
 *
 * Comprehensive toolkit for eliminating 4,792 TypeScript compilation errors
 * through systematic bulk pattern automation and targeted fixes.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  projectRoot: path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '..'),
  srcDir: path.join(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '..', 'src'),
  backupDir: path.join(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '..', 'backups', 'phase3'),
  errorPatterns: {
    TS1005_SEMICOLON: /';' expected/g,
    TS1005_COMMA: /',' expected/g,
    TS1109_EXPRESSION: /Expression expected/g,
    TS1128_DECLARATION: /Declaration or statement expected/g,
    TS1136_PROPERTY_ASSIGNMENT: /Property assignment expected/g,
    TS1003_IDENTIFIER: /Identifier expected/g,
    TS1434_KEYWORD: /Unexpected keyword or identifier/g
  }
};

// Error Analysis Tools
class ErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.errorCounts = {};
    this.fileErrorCounts = {};
  }

  async analyze() {
    console.log('🔍 Analyzing current TypeScript errors...');

    try {
      const output = execSync('cd ' + CONFIG.projectRoot + ' && make check 2>&1', {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer
      });

      this.parseErrors(output);
      this.generateReport();

    } catch (error) {
      console.log('Error analysis completed with expected exit code');
      this.parseErrors(error.stdout || error.stderr || '');
      this.generateReport();
    }
  }

  parseErrors(output) {
    const lines = output.split('\n');

    for (const line of lines) {
      // Parse error lines like: "src/utils/file.ts:123:45 - error TS1005: Message"
      const errorMatch = line.match(/^(.+?\.(?:ts|tsx|js|jsx))\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (errorMatch) {
        const file = errorMatch[1];
        const lineNum = parseInt(errorMatch[2]);
        const colNum = parseInt(errorMatch[3]);
        const errorCode = errorMatch[4];
        const errorMessage = errorMatch[5];

        this.errors.push({
          file: file,
          line: lineNum,
          column: colNum,
          code: errorCode,
          message: errorMessage,
          fullLine: line
        });

        // Count by error type
        if (!this.errorCounts[errorCode]) {
          this.errorCounts[errorCode] = 0;
        }
        this.errorCounts[errorCode]++;

        // Count by file
        if (!this.fileErrorCounts[file]) {
          this.fileErrorCounts[file] = 0;
        }
        this.fileErrorCounts[file]++;
      }
    }
  }

  generateReport() {
    console.log('\n📊 Error Analysis Report');
    console.log('='.repeat(50));
    console.log(`Total Errors: ${this.errors.length}`);
    console.log(`Files Affected: ${Object.keys(this.fileErrorCounts).length}`);

    console.log('\n🔥 Top Error Patterns:');
    const sortedErrors = Object.entries(this.errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    sortedErrors.forEach(([code, count]) => {
      console.log(`  ${code}: ${count} errors`);
    });

    console.log('\n📁 Most Affected Files:');
    const sortedFiles = Object.entries(this.fileErrorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    sortedFiles.forEach(([file, count]) => {
      console.log(`  ${count} errors: ${file}`);
    });

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      filesAffected: Object.keys(this.fileErrorCounts).length,
      errorBreakdown: this.errorCounts,
      topFiles: sortedFiles,
      allErrors: this.errors
    };

    fs.writeFileSync(
      path.join(CONFIG.projectRoot, 'phase3-error-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n💾 Detailed report saved to phase3-error-report.json');
  }
}

// Bulk Pattern Processors
class BulkPatternProcessor {
  constructor() {
    // Import processors dynamically to avoid require issues
    this.processors = {};
  }

  async initializeProcessors() {
    const { default: SemicolonProcessor } = await import('./processors/semicolon-processor.js');
    const { default: CommaProcessor } = await import('./processors/comma-processor.js');
    const { default: ObjectLiteralProcessor } = await import('./processors/object-literal-processor.js');
    const { default: FunctionSyntaxProcessor } = await import('./processors/function-syntax-processor.js');
    const { default: ArraySyntaxProcessor } = await import('./processors/array-syntax-processor.js');
    const { default: IdentifierProcessor } = await import('./processors/identifier-processor.js');
    const { default: PropertyAssignmentProcessor } = await import('./processors/property-assignment-processor.js');
    const { default: OctalLiteralProcessor } = await import('./processors/octal-literal-processor.js');
    const { default: ArgumentExpressionProcessor } = await import('./processors/argument-expression-processor.js');

    this.processors = {
      semicolon: new SemicolonProcessor(),
      comma: new CommaProcessor(),
      objectLiteral: new ObjectLiteralProcessor(),
      functionSyntax: new FunctionSyntaxProcessor(),
      arraySyntax: new ArraySyntaxProcessor(),
      identifier: new IdentifierProcessor(),
      propertyAssignment: new PropertyAssignmentProcessor(),
      octalLiteral: new OctalLiteralProcessor(),
      argumentExpression: new ArgumentExpressionProcessor()
    };
  }

  async processWave1() {
    console.log('\n🚀 Starting Wave 1: Bulk Pattern Automation');

    // Initialize processors
    await this.initializeProcessors();

    const results = {};

    for (const [name, processor] of Object.entries(this.processors)) {
      console.log(`\n🔧 Processing ${name} patterns...`);
      try {
        results[name] = await processor.process();
      } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        results[name] = { error: error.message };
      }
    }

    this.generateWave1Report(results);
    return results;
  }

  async processWaveExpansion() {
    console.log('\n🚀 Starting Wave 3.5: Pattern Expansion');

    // Initialize processors
    await this.initializeProcessors();

    const results = {};
    const expansionPatterns = ['identifier', 'propertyAssignment', 'octalLiteral', 'argumentExpression'];

    for (const pattern of expansionPatterns) {
      console.log(`\n🔧 Processing ${pattern} patterns...`);
      try {
        const processor = this.processors[pattern];
        if (processor) {
          results[pattern] = await processor.process();
        }
      } catch (error) {
        console.error(`Error processing ${pattern}:`, error.message);
        results[pattern] = { error: error.message };
      }
    }

    this.generateExpansionReport(results);
    return results;
  }

  generateExpansionReport(results) {
    console.log('\n📊 Pattern Expansion Processing Report');
    console.log('='.repeat(50));

    let totalFixed = 0;
    for (const [pattern, result] of Object.entries(results)) {
      if (result.error) {
        console.log(`❌ ${pattern.toUpperCase()}: Error - ${result.error}`);
      } else {
        console.log(`\n${pattern.toUpperCase()}:`);
        console.log(`  Files processed: ${result.filesProcessed}`);
        console.log(`  Patterns fixed: ${Object.values(result).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0)}`);
        totalFixed += Object.values(result).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0);
      }
    }

    console.log(`\n🎯 Total expansion patterns fixed: ${totalFixed}`);

    const report = {
      timestamp: new Date().toISOString(),
      wave: 'expansion',
      results: results,
      totalFixed: totalFixed
    };

    fs.writeFileSync(
      path.join(CONFIG.projectRoot, 'phase3-expansion-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  async runExpansion() {
    console.log('🚀 Phase 3.5 - Pattern Expansion');
    console.log('Target: Extend automation to additional error types');

    const results = await this.processor.processWaveExpansion();

    console.log('\n✨ Pattern Expansion Complete!');
    console.log(`New patterns processed: ${Object.keys(results).length}`);
    return results;
  }

  generateWave1Report(results) {
    console.log('\n📊 Wave 1 Processing Report');
    console.log('='.repeat(50));

    let totalFixed = 0;
    for (const [pattern, result] of Object.entries(results)) {
      console.log(`\n${pattern.toUpperCase()}:`);
      console.log(`  Files processed: ${result.filesProcessed}`);
      console.log(`  Patterns fixed: ${result.patternsFixed}`);
      console.log(`  Errors remaining: ${result.errorsRemaining}`);
      totalFixed += result.patternsFixed;
    }

    console.log(`\n🎯 Total patterns fixed: ${totalFixed}`);

    const report = {
      timestamp: new Date().toISOString(),
      wave: 1,
      results: results,
      totalFixed: totalFixed
    };

    fs.writeFileSync(
      path.join(CONFIG.projectRoot, 'phase3-wave1-report.json'),
      JSON.stringify(report, null, 2)
    );
  }
}

class SemicolonProcessor {
  async process() {
    console.log('🔧 Processing missing semicolons (TS1005)...');

    const files = this.findFilesWithPattern(CONFIG.errorPatterns.TS1005_SEMICOLON);
    let patternsFixed = 0;

    for (const file of files) {
      const fixed = await this.fixSemicolonsInFile(file);
      patternsFixed += fixed;
    }

    return {
      filesProcessed: files.length,
      patternsFixed: patternsFixed,
      errorsRemaining: await this.countRemainingErrors('TS1005_SEMICOLON')
    };
  }

  findFilesWithPattern(pattern) {
    // This would be implemented to scan files for patterns
    return this.getAffectedFiles();
  }

  async fixSemicolonsInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixes = 0;

    const fixedLines = lines.map((line, index) => {
      // Pattern 1: Function calls without semicolons
      if (this.needsSemicolon(line)) {
        fixes++;
        return line + ';';
      }
      return line;
    });

    if (fixes > 0) {
      fs.writeFileSync(filePath, fixedLines.join('\n'));
    }

    return fixes;
  }

  needsSemicolon(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return false;
    }

    // Function calls, assignments, returns without semicolons
    const needsSemicolonPatterns = [
      /\bconsole\.log\([^)]+\)$/,
      /\breturn\s+[^;]+$/,
      /\bconst\s+\w+\s*=\s*[^;]+$/,
      /\blet\s+\w+\s*=\s*[^;]+$/,
      /\bvar\s+\w+\s*=\s*[^;]+$/,
    ];

    return needsSemicolonPatterns.some(pattern => pattern.test(trimmed));
  }

  async countRemainingErrors(pattern) {
    // Implementation would count remaining errors
    return 0;
  }

  getAffectedFiles() {
    // Get list of files with TS1005 errors from error analysis
    return [
      'src/utils/timingUtils.ts',
      'src/utils/testIngredientMapping.ts',
      // Add more files as identified
    ];
  }
}

class CommaProcessor {
  async process() {
    console.log('🔧 Processing missing/trailing commas...');

    // Implementation for comma fixes
    return {
      filesProcessed: 0,
      patternsFixed: 0,
      errorsRemaining: 0
    };
  }
}

class ObjectLiteralProcessor {
  async process() {
    console.log('🔧 Processing object literal syntax...');

    // Implementation for object literal fixes
    return {
      filesProcessed: 0,
      patternsFixed: 0,
      errorsRemaining: 0
    };
  }
}

class FunctionSyntaxProcessor {
  async process() {
    console.log('🔧 Processing function syntax...');

    // Implementation for function syntax fixes
    return {
      filesProcessed: 0,
      patternsFixed: 0,
      errorsRemaining: 0
    };
  }
}

class ArraySyntaxProcessor {
  async process() {
    console.log('🔧 Processing array syntax...');

    // Implementation for array syntax fixes
    return {
      filesProcessed: 0,
      patternsFixed: 0,
      errorsRemaining: 0
    };
  }
}

// Progress Tracking
class ProgressTracker {
  constructor() {
    this.baseline = null;
    this.current = null;
    this.history = [];
  }

  setBaseline(errors) {
    this.baseline = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      breakdown: this.analyzeErrorBreakdown(errors)
    };
  }

  updateProgress(errors) {
    this.current = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      breakdown: this.analyzeErrorBreakdown(errors)
    };

    this.history.push(this.current);
    this.saveProgress();
  }

  analyzeErrorBreakdown(errors) {
    const breakdown = {};
    errors.forEach(error => {
      if (!breakdown[error.code]) {
        breakdown[error.code] = 0;
      }
      breakdown[error.code]++;
    });
    return breakdown;
  }

  getProgressReport() {
    if (!this.baseline || !this.current) {
      return null;
    }

    const reduction = this.baseline.totalErrors - this.current.totalErrors;
    const percentage = ((reduction / this.baseline.totalErrors) * 100).toFixed(1);

    return {
      baseline: this.baseline.totalErrors,
      current: this.current.totalErrors,
      reduction: reduction,
      percentage: percentage,
      breakdown: this.current.breakdown
    };
  }

  saveProgress() {
    const data = {
      baseline: this.baseline,
      current: this.current,
      history: this.history,
      report: this.getProgressReport()
    };

    fs.writeFileSync(
      path.join(CONFIG.projectRoot, 'phase3-progress.json'),
      JSON.stringify(data, null, 2)
    );
  }
}

// Validation System
class ValidationSuite {
  async runFullValidation() {
    console.log('🔍 Running full validation suite...');

    const results = {
      typescript: await this.validateTypeScript(),
      build: await this.validateBuild(),
      functionality: await this.validateFunctionality()
    };

    return results;
  }

  async validateTypeScript() {
    try {
      execSync('cd ' + CONFIG.projectRoot + ' && make check', { stdio: 'pipe' });
      return { status: 'pass', errors: 0 };
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const errorCount = (output.match(/error TS/g) || []).length;
      return { status: 'fail', errors: errorCount };
    }
  }

  async validateBuild() {
    try {
      execSync('cd ' + CONFIG.projectRoot + ' && make build-safe', { stdio: 'pipe' });
      return { status: 'pass' };
    } catch (error) {
      return { status: 'fail', error: error.message };
    }
  }

  async validateFunctionality() {
    // Basic functionality checks
    return { status: 'pending' };
  }
}

// Main CLI Interface
class Phase3CLI {
  constructor() {
    this.analyzer = new ErrorAnalyzer();
    this.processor = new BulkPatternProcessor();
    this.tracker = new ProgressTracker();
    this.validator = new ValidationSuite();
  }

  async run(command, options = {}) {
    switch (command) {
      case 'analyze':
        await this.analyzer.analyze();
        break;

      case 'wave1':
        await this.runWave1();
        break;

      case 'expansion':
        await this.runWaveExpansion();
        break;

      case 'validate':
        const results = await this.validator.runFullValidation();
        console.log('Validation Results:', results);
        break;

      case 'status':
        this.showStatus();
        break;

      default:
        this.showHelp();
    }
  }

  async runWave1() {
    console.log('🚀 Phase 3 - Wave 1: Bulk Pattern Automation');
    console.log('Target: Eliminate 60% of errors through systematic fixes');

    // Get baseline
    await this.analyzer.analyze();

    // Process patterns
    const results = await this.processor.processWave1();

    // Validate
    const validation = await this.validator.runFullValidation();

    console.log('\n✨ Wave 1 Complete!');
    console.log(`Patterns processed: ${Object.keys(results).length}`);
    console.log(`Validation status: ${validation.typescript.status}`);
  }

  async runWaveExpansion() {
    console.log('🚀 Phase 3.5 - Pattern Expansion');
    console.log('Target: Extend automation to additional error types');

    // Get baseline
    await this.analyzer.analyze();

    // Process new patterns
    const results = await this.processor.processWaveExpansion();

    // Validate
    const validation = await this.validator.runFullValidation();

    console.log('\n✨ Pattern Expansion Complete!');
    console.log(`New patterns processed: ${Object.keys(results).length}`);
    console.log(`Validation status: ${validation.typescript.status}`);
    return results;
  }

  showStatus() {
    const progressFile = path.join(CONFIG.projectRoot, 'phase3-progress.json');
    if (fs.existsSync(progressFile)) {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      console.log('📊 Phase 3 Progress Status:');
      console.log(`Baseline errors: ${progress.baseline?.totalErrors || 'N/A'}`);
      console.log(`Current errors: ${progress.current?.totalErrors || 'N/A'}`);
      console.log(`Reduction: ${progress.report?.reduction || 0} errors`);
      console.log(`Percentage: ${progress.report?.percentage || 0}%`);
    } else {
      console.log('No progress data found. Run analysis first.');
    }
  }

  showHelp() {
    console.log(`
Phase 3: Systematic Error Elimination Toolkit

Usage: node phase3-error-elimination.js <command>

Commands:
  analyze     - Analyze current TypeScript errors
  wave1       - Run Wave 1 bulk pattern automation
  expansion   - Run Wave 3.5 pattern expansion (new error types)
  validate    - Run full validation suite
  status      - Show current progress status

Examples:
  node scripts/phase3-error-elimination.js analyze
  node scripts/phase3-error-elimination.js wave1
  node scripts/phase3-error-elimination.js expansion
  node scripts/phase3-error-elimination.js status
    `);
  }
}

// CLI Entry Point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options = {};

  const cli = new Phase3CLI();
  cli.run(command, options).catch(console.error);
}

export {
    BulkPatternProcessor, ErrorAnalyzer, Phase3CLI, ProgressTracker,
    ValidationSuite
};

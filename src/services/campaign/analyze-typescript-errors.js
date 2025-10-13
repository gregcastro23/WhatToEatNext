#!/usr/bin/env node

/**
 * CLI script for TypeScript Error Analyzer (JavaScript version)
 *
 * Usage:
 *   node src/services/campaign/analyze-typescript-errors.js [options]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class TypeScriptErrorAnalyzer {
  constructor() {
    this.HIGH_PRIORITY_ERRORS = ['TS2352', 'TS2345', 'TS2698', 'TS2304', 'TS2362'];
    this.MEDIUM_PRIORITY_ERRORS = ['TS2322', 'TS2740', 'TS2339', 'TS2741', 'TS2688'];
    this.LOW_PRIORITY_ERRORS = ['TS2820', 'TS2588', 'TS2300'];
  }

  async analyzeErrors() {
    console.log('🔍 Analyzing TypeScript errors...');

    const errors = await this.getTypeScriptErrors();
    const distribution = this.createErrorDistribution(errors);
    const recommendations = this.generateRecommendations(distribution);

    return {
      distribution,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  async getTypeScriptErrors() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000,
      });

      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.parseErrorsFromOutput(output);
    }
  }

  parseErrorsFromOutput(output) {
    const lines = output.split('\n');
    const errors = [];

    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s*(.+)$/);
      if (match) {
        const [, filePath, lineNum, colNum, code, message] = match;

        const cleanFilePath = filePath.replace(/^.*?\/WhatToEatNext\//, '');

        const error = {
          filePath: cleanFilePath,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code,
          message: message.trim(),
          category: this.categorizeError(code),
          priority: this.calculateErrorPriority(code, cleanFilePath, message),
          severity: this.determineSeverity(code, message),
        };

        errors.push(error);
      }
    }

    console.log(`📊 Found ${errors.length} TypeScript errors`);
    return errors;
  }

  categorizeError(code) {
    const categories = {
      TS2352: 'TS2352_TYPE_CONVERSION',
      TS2345: 'TS2345_ARGUMENT_MISMATCH',
      TS2698: 'TS2698_SPREAD_TYPE',
      TS2304: 'TS2304_CANNOT_FIND_NAME',
      TS2362: 'TS2362_ARITHMETIC_OPERATION',
    };

    return categories[code] || 'OTHER';
  }

  calculateErrorPriority(code, filePath, message) {
    let priority = 0;

    if (this.HIGH_PRIORITY_ERRORS.includes(code)) {
      priority += 15;
    } else if (this.MEDIUM_PRIORITY_ERRORS.includes(code)) {
      priority += 10;
    } else if (this.LOW_PRIORITY_ERRORS.includes(code)) {
      priority += 5;
    }

    if (filePath.includes('/types/')) priority += 8;
    if (filePath.includes('/services/')) priority += 7;
    if (filePath.includes('/components/')) priority += 6;
    if (filePath.includes('/utils/')) priority += 4;
    if (filePath.includes('/data/')) priority += 3;

    if (message.includes('not assignable')) priority += 5;
    if (message.includes('Cannot find')) priority += 6;
    if (message.includes('not exported')) priority += 7;
    if (message.includes('missing')) priority += 4;
    if (message.includes('Conversion of type')) priority += 8;
    if (message.includes('Argument of type')) priority += 6;

    return priority;
  }

  determineSeverity(code, message) {
    if (this.HIGH_PRIORITY_ERRORS.includes(code)) {
      return 'HIGH';
    }

    if (this.MEDIUM_PRIORITY_ERRORS.includes(code)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  createErrorDistribution(errors) {
    const errorsByCategory = {
      TS2352_TYPE_CONVERSION: [],
      TS2345_ARGUMENT_MISMATCH: [],
      TS2698_SPREAD_TYPE: [],
      TS2304_CANNOT_FIND_NAME: [],
      TS2362_ARITHMETIC_OPERATION: [],
      OTHER: [],
    };

    const errorsByFile = {};

    for (const error of errors) {
      errorsByCategory[error.category].push(error);

      if (!errorsByFile[error.filePath]) {
        errorsByFile[error.filePath] = [];
      }
      errorsByFile[error.filePath].push(error);
    }

    const priorityRanking = [...errors].sort((a, b) => b.priority - a.priority);

    const highImpactFiles = Object.entries(errorsByFile)
      .filter(([, fileErrors]) => fileErrors.length > 10)
      .map(([filePath, fileErrors]) => ({
        filePath,
        errorCount: fileErrors.length,
        categories: [...new Set(fileErrors.map(e => e.category))],
        averagePriority: fileErrors.reduce((sum, e) => sum + e.priority, 0) / fileErrors.length,
      }))
      .sort((a, b) => b.errorCount - a.errorCount);

    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsByFile,
      priorityRanking,
      highImpactFiles,
    };
  }

  generateRecommendations(distribution) {
    const recommendations = [];

    const categories = [
      {
        key: 'TS2352_TYPE_CONVERSION',
        priority: 1,
        desc: 'Fix type conversion errors - often caused by incorrect type assertions or unsafe casts',
        rate: 0.9,
      },
      {
        key: 'TS2345_ARGUMENT_MISMATCH',
        priority: 2,
        desc: 'Fix argument type mismatches - usually requires type assertions or interface updates',
        rate: 0.85,
      },
      {
        key: 'TS2304_CANNOT_FIND_NAME',
        priority: 3,
        desc: 'Fix missing imports and undefined references - often cascades to fix other errors',
        rate: 1.2,
      },
      {
        key: 'TS2698_SPREAD_TYPE',
        priority: 4,
        desc: 'Fix spread operator type errors - requires careful type analysis',
        rate: 0.8,
      },
      {
        key: 'TS2362_ARITHMETIC_OPERATION',
        priority: 5,
        desc: 'Fix arithmetic operation type errors - usually requires number type assertions',
        rate: 0.9,
      },
    ];

    for (const cat of categories) {
      const count = distribution.errorsByCategory[cat.key].length;
      if (count > 0) {
        recommendations.push({
          category: cat.key,
          errorCount: count,
          priority: cat.priority,
          description: cat.desc,
          estimatedReduction: Math.round(count * cat.rate),
        });
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  displayResults(result) {
    console.log('\n📊 TYPESCRIPT ERROR ANALYSIS RESULTS');
    console.log('=====================================');

    console.log(`\n📈 Total Errors: ${result.distribution.totalErrors}`);

    console.log('\n🏷️  Errors by Category:');
    Object.entries(result.distribution.errorsByCategory).forEach(([category, errors]) => {
      if (errors.length > 0) {
        console.log(`  ${category}: ${errors.length} errors`);
      }
    });

    console.log('\n🔥 High-Impact Files (>10 errors):');
    result.distribution.highImpactFiles.slice(0, 10).forEach(file => {
      console.log(
        `  ${file.filePath}: ${file.errorCount} errors (avg priority: ${file.averagePriority.toFixed(1)})`,
      );
      console.log(`    Categories: ${file.categories.join(', ')}`);
    });

    console.log('\n💡 Recommended Fix Order:');
    result.recommendations.forEach(rec => {
      console.log(`  ${rec.priority}. ${rec.category}: ${rec.errorCount} errors`);
      console.log(`     Expected reduction: ~${rec.estimatedReduction} errors`);
      console.log(`     ${rec.description}\n`);
    });

    const totalEstimatedReduction = result.recommendations.reduce(
      (sum, rec) => sum + rec.estimatedReduction,
      0,
    );

    console.log(`📉 Estimated total error reduction: ${totalEstimatedReduction} errors`);
    console.log(
      `📊 Estimated remaining errors: ${result.distribution.totalErrors - totalEstimatedReduction}`,
    );
    console.log(`⏰ Analysis completed at: ${new Date(result.timestamp).toLocaleString()}`);
  }

  async saveAnalysis(result, outputPath) {
    const defaultPath = path.join(process.cwd(), '.typescript-error-analysis.json');
    const filePath = outputPath || defaultPath;

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(result, null, 2));
      console.log(`\n💾 Analysis saved to: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to save analysis: ${error}`);
    }
  }

  async getCurrentErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
TypeScript Error Analyzer CLI

Usage:
  node src/services/campaign/analyze-typescript-errors.js [options]

Options:
  --save          Save analysis results to .typescript-error-analysis.json
  --json          Output results in JSON format
  --count-only    Only show current error count
  --help          Show this help message

Examples:
  # Basic analysis
  node src/services/campaign/analyze-typescript-errors.js
  
  # Save results to file
  node src/services/campaign/analyze-typescript-errors.js --save
  
  # Get current error count only
  node src/services/campaign/analyze-typescript-errors.js --count-only
  
  # JSON output for automation
  node src/services/campaign/analyze-typescript-errors.js --json
`);
    process.exit(0);
  }

  const analyzer = new TypeScriptErrorAnalyzer();

  try {
    if (args.includes('--count-only')) {
      const count = await analyzer.getCurrentErrorCount();
      if (args.includes('--json')) {
        console.log(
          JSON.stringify({ currentErrorCount: count, timestamp: new Date().toISOString() }),
        );
      } else {
        console.log(`Current TypeScript errors: ${count}`);
      }
      return;
    }

    console.log('🚀 Starting TypeScript Error Analysis...');
    const result = await analyzer.analyzeErrors();

    if (args.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      analyzer.displayResults(result);
    }

    if (args.includes('--save')) {
      await analyzer.saveAnalysis(result);
    }
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { TypeScriptErrorAnalyzer };

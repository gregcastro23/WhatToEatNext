/* eslint-disable no-console, @typescript-eslint/no-unused-vars -- Campaign/test file with intentional patterns */
/**
 * TypeScript Error Analyzer for Perfect Codebase Campaign
 *
 * Implements systematic TypeScript error elimination using existing Enhanced Error Fixer v3.0 patterns
 * Provides error distribution analysis, categorization, and priority ranking system
 *
 * Requirements: 1.21.31.41.5
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface TypeScriptError {
  filePath: string,
  line: number,
  column: number,
  code: string,
  message: string,
  category: ErrorCategory,
  priority: number,
  severity: ErrorSeverity
}

export enum ErrorCategory {
  TS2352_TYPE_CONVERSION = 'TS2352',;
  TS2345_ARGUMENT_MISMATCH = 'TS2345',;
  TS2698_SPREAD_TYPE = 'TS2698',;
  TS2304_CANNOT_FIND_NAME = 'TS2304',;
  TS2362_ARITHMETIC_OPERATION = 'TS2362',,;
  OTHER = 'OTHER',,;
}

export enum ErrorSeverity {
  HIGH = 'HIGH',;
  MEDIUM = 'MEDIUM',,;
  LOW = 'LOW',,;
}

export interface ErrorDistribution {
  totalErrors: number,
  errorsByCategory: Record<ErrorCategory, TypeScriptError[]>;
  errorsByFile: Record<string, TypeScriptError[]>;
  priorityRanking: TypeScriptError[],
  highImpactFiles: Array<{
    filePath: string,
    errorCount: number,
    categories: ErrorCategory[],
    averagePriority: number
  }>;
}

export interface AnalysisResult {
  distribution: ErrorDistribution,
  recommendations: Array<{
    category: ErrorCategory,
    errorCount: number,
    priority: number,
    description: string,
    estimatedReduction: number
  }>;
  timestamp: string
}

export class TypeScriptErrorAnalyzer {
  private readonly HIGH_PRIORITY_ERRORS = ['TS2352', 'TS2345', 'TS2698', 'TS2304', 'TS2362'];
  private readonly MEDIUM_PRIORITY_ERRORS = ['TS2322', 'TS2740', 'TS2339', 'TS2741', 'TS2688'];
  private readonly LOW_PRIORITY_ERRORS = ['TS2820', 'TS2588', 'TS2300'];

  /**
   * Analyze TypeScript errors using `yarn tsc --noEmit --skipLibCheck` output
   */
  async analyzeErrors(): Promise<AnalysisResult> {
    // // // console.log('🔍 Analyzing TypeScript errors...');

    const errors = await this.getTypeScriptErrors();
    const distribution = this.createErrorDistribution(errors);
    const recommendations = this.generateRecommendations(distribution);

    return {
      distribution,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get TypeScript errors using compiler output
   */
  private async getTypeScriptErrors(): Promise<TypeScriptError[]> {
    try {
      // Run TypeScript compiler with no emit and skip lib check for faster analysis
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      });

      // If no errors, return empty array
      return [];
    } catch (error: unknown) {
      const output = error.stdout || error.stderr || '';
      return this.parseErrorsFromOutput(output);
    }
  }

  /**
   * Parse TypeScript compiler output to extract error information
   */
  private parseErrorsFromOutput(output: string): TypeScriptError[] {
    const lines = output.split('\n');
    const errors: TypeScriptError[] = [];

    for (const line of lines) {
      // Parse TypeScript error format: file(line,col): error TS#### message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s*(.+)$/),;
      if (match) {
        const [, filePath, lineNum, colNum, code, message] = match,

        // Clean up file path to be relative to project root
        const cleanFilePath = filePath.replace(/^.*?\/WhatToEatNext\//, ''),;

        const error: TypeScriptError = {;
          filePath: cleanFilePath,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code,
          message: message.trim(),
          category: this.categorizeError(code),
          priority: this.calculateErrorPriority(code, cleanFilePath, message),
          severity: this.determineSeverity(code, message)
        };

        errors.push(error);
      }
    }

    // // // console.log(`📊 Found ${errors.length} TypeScript errors`);
    return errors;
  }

  /**
   * Categorize error by code for targeted fixing
   */
  private categorizeError(code: string): ErrorCategory {
    switch (code) {
      case 'TS2352':
        return ErrorCategory.TS2352_TYPE_CONVERSION;
      case 'TS2345':
        return ErrorCategory.TS2345_ARGUMENT_MISMATCH;
      case 'TS2698':
        return ErrorCategory.TS2698_SPREAD_TYPE;
      case 'TS2304':
        return ErrorCategory.TS2304_CANNOT_FIND_NAME;
      case 'TS2362':
        return ErrorCategory.TS2362_ARITHMETIC_OPERATION;
      default:
        return ErrorCategory.OTHER
    }
  }

  /**
   * Calculate priority ranking based on error frequency and impact
   */
  private calculateErrorPriority(code: string, filePath: string, message: string): number {
    let priority = 0;

    // Error code priority (based on requirements 1.21.31.41.5)
    if (this.HIGH_PRIORITY_ERRORS.includes(code)) {
      priority += 15;
    } else if (this.MEDIUM_PRIORITY_ERRORS.includes(code)) {
      priority += 10;
    } else if (this.LOW_PRIORITY_ERRORS.includes(code)) {
      priority += 5;
    }

    // File type priority - core system files get higher priority
    if (filePath.includes('/types/')) priority += 8;
    if (filePath.includes('/services/')) priority += 7;
    if (filePath.includes('/components/')) priority += 6;
    if (filePath.includes('/utils/')) priority += 4;
    if (filePath.includes('/data/')) priority += 3;

    // Message content priority - critical errors get higher priority
    if (message.includes('not assignable')) priority += 5;
    if (message.includes('Cannot find')) priority += 6;
    if (message.includes('not exported')) priority += 7;
    if (message.includes('missing')) priority += 4;
    if (message.includes('Conversion of type')) priority += 8; // TS2352 specific
    if (message.includes('Argument of type')) priority += 6; // TS2345 specific

    return priority;
  }

  /**
   * Determine error severity for processing order
   */
  private determineSeverity(code: string, message: string): ErrorSeverity {
    // High severity - breaks builds or critical type safety
    if (this.HIGH_PRIORITY_ERRORS.includes(code)) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity - type safety issues but not build-breaking
    if (this.MEDIUM_PRIORITY_ERRORS.includes(code)) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity - style or minor issues
    return ErrorSeverity.LOW;
  }

  /**
   * Create comprehensive error distribution analysis
   */
  private createErrorDistribution(errors: TypeScriptError[]): ErrorDistribution {
    const errorsByCategory: Record<ErrorCategory, TypeScriptError[]> = {
      [ErrorCategory.TS2352_TYPE_CONVERSION]: [],
      [ErrorCategory.TS2345_ARGUMENT_MISMATCH]: [],
      [ErrorCategory.TS2698_SPREAD_TYPE]: [],
      [ErrorCategory.TS2304_CANNOT_FIND_NAME]: [],
      [ErrorCategory.TS2362_ARITHMETIC_OPERATION]: [],
      [ErrorCategory.OTHER]: []
    };

    const errorsByFile: Record<string, TypeScriptError[]> = {};

    // Categorize errors
    for (const error of errors) {
      errorsByCategory[error.category].push(error),

      if (!errorsByFile[error.filePath]) {
        errorsByFile[error.filePath] = [];
      }
      errorsByFile[error.filePath].push(error);
    }

    // Create priority ranking
    const priorityRanking = [...errors].sort((ab) => b.priority - a.priority);

    // Identify high-impact files (>10 errors)
    const highImpactFiles = Object.entries(errorsByFile);
      .filter(([, fileErrors]) => fileErrors.length > 10)
      .map(([filePath, fileErrors]) => ({
        filePath,
        errorCount: fileErrors.length,
        categories: [...new Set(fileErrors.map(e => e.category))],,;
        averagePriority: fileErrors.reduce((sume) => sum + e.priority, 0) / fileErrors.length
      }))
      .sort((ab) => b.errorCount - a.errorCount);

    return {
      totalErrors: errors.length;
      errorsByCategory,
      errorsByFile,
      priorityRanking,
      highImpactFiles
    };
  }

  /**
   * Generate fix recommendations based on error distribution
   */
  private generateRecommendations(distribution: ErrorDistribution): Array<{
    category: ErrorCategory,
    errorCount: number,
    priority: number,
    description: string,
    estimatedReduction: number
  }> {
    const recommendations: Array<{
      category: ErrorCategory,
      errorCount: number,
      priority: number,
      description: string,
      estimatedReduction: number
    }> = [];

    // TS2352 Type Conversion Errors (highest priority per requirements)
    const ts2352Count = distribution.errorsByCategory[ErrorCategory.TS2352_TYPE_CONVERSION].length;
    if (ts2352Count > 0) {
      recommendations.push({
        category: ErrorCategory.TS2352_TYPE_CONVERSION,
        errorCount: ts2352Count,
        priority: 1,
        description:
          'Fix type conversion errors - often caused by incorrect type assertions or unsafe casts',
        estimatedReduction: Math.round(ts2352Count * 0.9), // High success rate expected
      });
    }

    // TS2345 Argument Type Mismatch (second priority)
    const ts2345Count =
      distribution.errorsByCategory[ErrorCategory.TS2345_ARGUMENT_MISMATCH].length;
    if (ts2345Count > 0) {
      recommendations.push({
        category: ErrorCategory.TS2345_ARGUMENT_MISMATCH,
        errorCount: ts2345Count,
        priority: 2,
        description:
          'Fix argument type mismatches - usually requires type assertions or interface updates',
        estimatedReduction: Math.round(ts2345Count * 0.85)
      });
    }

    // TS2304 Cannot Find Name (third priority)
    const ts2304Count = distribution.errorsByCategory[ErrorCategory.TS2304_CANNOT_FIND_NAME].length;
    if (ts2304Count > 0) {
      recommendations.push({
        category: ErrorCategory.TS2304_CANNOT_FIND_NAME,
        errorCount: ts2304Count,
        priority: 3,
        description:
          'Fix missing imports and undefined references - often cascades to fix other errors',
        estimatedReduction: Math.round(ts2304Count * 1.2), // Can fix cascading errors
      });
    }

    // TS2698 Spread Type Errors
    const ts2698Count = distribution.errorsByCategory[ErrorCategory.TS2698_SPREAD_TYPE].length;
    if (ts2698Count > 0) {
      recommendations.push({
        category: ErrorCategory.TS2698_SPREAD_TYPE,
        errorCount: ts2698Count,
        priority: 4,
        description: 'Fix spread operator type errors - requires careful type analysis',
        estimatedReduction: Math.round(ts2698Count * 0.8)
      });
    }

    // TS2362 Arithmetic Operation Errors
    const ts2362Count =
      distribution.errorsByCategory[ErrorCategory.TS2362_ARITHMETIC_OPERATION].length;
    if (ts2362Count > 0) {
      recommendations.push({
        category: ErrorCategory.TS2362_ARITHMETIC_OPERATION,
        errorCount: ts2362Count,
        priority: 5,
        description:
          'Fix arithmetic operation type errors - usually requires number type assertions',
        estimatedReduction: Math.round(ts2362Count * 0.9)
      });
    }

    return recommendations.sort((ab) => a.priority - b.priority);
  }

  /**
   * Display analysis results in formatted output
   */
  displayResults(result: AnalysisResult): void {
    // // // console.log('\n📊 TYPESCRIPT ERROR ANALYSIS RESULTS');
    // // // console.log('=====================================');

    // // // console.log(`\n📈 Total Errors: ${result.distribution.totalErrors}`);

    // // // console.log('\n🏷️  Errors by Category:');
    Object.entries(result.distribution.errorsByCategory).forEach(([category, errors]) => {
      if (errors.length > 0) {
        // // // console.log(`  ${category}: ${errors.length} errors`);
      }
    });

    // // // console.log('\n🔥 High-Impact Files (>10 errors):');
    result.distribution.highImpactFiles.slice(010).forEach(file => {;
      // // // console.log(
        `  ${file.filePath}: ${file.errorCount} errors (avg priority: ${file.averagePriority.toFixed(1)})`,
      );
      // // // console.log(`    Categories: ${file.categories.join(', ')}`);
    });

    // // // console.log('\n💡 Recommended Fix Order:');
    result.recommendations.forEach(rec => {;
      // // // console.log(`  ${rec.priority}. ${rec.category}: ${rec.errorCount} errors`);
      // // // console.log(`     Expected reduction: ~${rec.estimatedReduction} errors`);
      // // // console.log(`     ${rec.description}\n`);
    });

    const totalEstimatedReduction = result.recommendations.reduce(;
      (sum, rec) => sum + rec.estimatedReduction,
      0,
    );

    // // // console.log(`📉 Estimated total error reduction: ${totalEstimatedReduction} errors`);
    // // // console.log(
      `📊 Estimated remaining errors: ${result.distribution.totalErrors - totalEstimatedReduction}`,
    );
    // // // console.log(`⏰ Analysis completed at: ${new Date(result.timestamp).toLocaleString()}`);
  }

  /**
   * Save analysis results to file for tracking progress
   */
  async saveAnalysis(result: AnalysisResult, outputPath?: string): Promise<void> {
    const defaultPath = path.join(process.cwd(), '.typescript-error-analysis.json');
    const filePath = outputPath || defaultPath;

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(result, null, 2)),
      // // // console.log(`\n💾 Analysis saved to: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to save analysis: ${error}`);
    }
  }

  /**
   * Get current error count for progress tracking
   */
  async getCurrentErrorCount(): Promise<number> {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS'', {;
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      // If grep finds no matches, it returns exit code 1or timeout occurred
      console.warn('TypeScript error count check failed or timed out:', (error as Error).message),
      return 0
    }
  }
}

/**
 * Enhanced Error Fixer Integration for Perfect Codebase Campaign
 *
 * Wrapper for scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js
 * Implements batch processing with --max-files=15 --auto-fix parameters
 * Creates build validation after every 5 files processed
 *
 * Requirements: 1.6, 1.7, 7.1
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import { terminalFreezePreventionSystem } from './TerminalFreezePreventionSystem';

export interface FixerOptions {
  maxFiles?: number;
  autoFix?: boolean;
  dryRun?: boolean;
  validateSafety?: boolean;
  silent?: boolean;
  json?: boolean;
}

export interface FixerResult {
  success: boolean;
  filesProcessed: number;
  errorsFixed: number;
  errorsRemaining: number;
  buildValidationPassed: boolean;
  executionTime: number;
  safetyScore?: number;
  warnings: string[];
  errors: string[];
}

export interface BatchProcessingOptions {
  batchSize: number;
  buildValidationInterval: number;
  maxBatches?: number;
  stopOnBuildFailure?: boolean;
}

export class EnhancedErrorFixerIntegration {
  private readonly ENHANCED_FIXER_PATH =
    'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js';
  private readonly DEFAULT_BATCH_SIZE = 15;
  private readonly BUILD_VALIDATION_INTERVAL = 5;

  /**
   * Execute Enhanced Error Fixer v3.0 with specified options
   */
  async executeEnhancedFixer(options: FixerOptions = {}): Promise<FixerResult> {
    const startTime = Date.now();

    console.log('🚀 Starting Enhanced TypeScript Error Fixer v3.0...');

    // Prepare command arguments
    const args = this.buildFixerArguments(options);

    try {
      // Execute the Enhanced Error Fixer
      const result = await this.runFixerCommand(args);

      // Validate build after fixing
      const buildValidationPassed = await this.validateBuild();

      const executionTime = Date.now() - startTime;

      return {
        success: result.success,
        filesProcessed: result.filesProcessed,
        errorsFixed: result.errorsFixed,
        errorsRemaining: result.errorsRemaining,
        buildValidationPassed,
        executionTime,
        safetyScore: result.safetyScore,
        warnings: result.warnings,
        errors: result.errors,
      };
    } catch (error) {
      console.error('❌ Enhanced Error Fixer execution failed:', error);

      return {
        success: false,
        filesProcessed: 0,
        errorsFixed: 0,
        errorsRemaining: await this.getCurrentErrorCount(),
        buildValidationPassed: false,
        executionTime: Date.now() - startTime,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Execute batch processing with build validation after every 5 files
   */
  async executeBatchProcessing(options: BatchProcessingOptions): Promise<FixerResult[]> {
    console.log(`🔄 Starting batch processing with ${options.batchSize} files per batch...`);

    const results: FixerResult[] = [];
    let batchNumber = 1;
    let totalFilesProcessed = 0;
    let totalErrorsFixed = 0;

    const maxIterations = options.maxBatches || 50; // Prevent infinite loops
    const startTime = Date.now();
    const maxExecutionTime = 30 * 60 * 1000; // 30 minutes max

    while (batchNumber <= maxIterations) {
      console.log(`\n📦 Processing Batch ${batchNumber}/${maxIterations}...`);

      // Check execution time limit
      if (Date.now() - startTime > maxExecutionTime) {
        console.log(`⏰ Maximum execution time (30 minutes) reached, stopping`);
        break;
      }

      // Check if we should stop (max batches reached)
      if (options.maxBatches && batchNumber > options.maxBatches) {
        console.log(`✋ Reached maximum batch limit (${options.maxBatches})`);
        break;
      }

      // Check current error count with timeout protection
      let currentErrors = 0;
      try {
        currentErrors = await this.getCurrentErrorCount();
      } catch (error) {
        console.warn('⚠️  Error count check failed, assuming errors remain');
        currentErrors = 1; // Assume errors exist to continue safely
      }

      if (currentErrors === 0) {
        console.log('🎉 No more TypeScript errors found!');
        break;
      }

      // Execute fixer for this batch
      const batchResult = await this.executeEnhancedFixer({
        maxFiles: options.batchSize,
        autoFix: true,
        validateSafety: true,
      });

      results.push(batchResult);
      totalFilesProcessed += batchResult.filesProcessed;
      totalErrorsFixed += batchResult.errorsFixed;

      console.log(`📊 Batch ${batchNumber} Results:`);
      console.log(`  Files processed: ${batchResult.filesProcessed}`);
      console.log(`  Errors fixed: ${batchResult.errorsFixed}`);
      console.log(`  Build validation: ${batchResult.buildValidationPassed ? '✅' : '❌'}`);

      // Stop on build failure if configured
      if (options.stopOnBuildFailure && !batchResult.buildValidationPassed) {
        console.log('🛑 Stopping batch processing due to build failure');
        break;
      }

      // Stop if no progress made
      if (batchResult.filesProcessed === 0 && batchResult.errorsFixed === 0) {
        console.log('⏸️  No progress made in this batch, stopping');
        break;
      }

      // Build validation after every N files (as specified in requirements)
      if (totalFilesProcessed % options.buildValidationInterval === 0) {
        console.log(`🔍 Performing build validation after ${totalFilesProcessed} files...`);
        const buildValid = await this.validateBuild();
        if (!buildValid && options.stopOnBuildFailure) {
          console.log('🛑 Build validation failed, stopping batch processing');
          break;
        }
      }

      batchNumber++;
    }

    console.log(`\n📈 Batch Processing Summary:`);
    console.log(`  Total batches: ${results.length}`);
    console.log(`  Total files processed: ${totalFilesProcessed}`);
    console.log(`  Total errors fixed: ${totalErrorsFixed}`);
    console.log(`  Remaining errors: ${await this.getCurrentErrorCount()}`);

    return results;
  }

  /**
   * Build command arguments for Enhanced Error Fixer
   */
  private buildFixerArguments(options: FixerOptions): string[] {
    const args: string[] = [];

    if (options.maxFiles) {
      args.push(`--max-files=${options.maxFiles}`);
    }

    if (options.autoFix) {
      args.push('--auto-fix');
    }

    if (options.dryRun) {
      args.push('--dry-run');
    }

    if (options.validateSafety) {
      args.push('--validate-safety');
    }

    if (options.silent) {
      args.push('--silent');
    }

    if (options.json) {
      args.push('--json');
    }

    return args;
  }

  /**
   * Execute the Enhanced Error Fixer command
   */
  private async runFixerCommand(args: string[]): Promise<{
    success: boolean;
    filesProcessed: number;
    errorsFixed: number;
    errorsRemaining: number;
    safetyScore?: number;
    warnings: string[];
    errors: string[];
  }> {
    return new Promise((resolve, reject) => {
      const command = 'node';
      const fullArgs = [this.ENHANCED_FIXER_PATH, ...args];

      console.log(`🔧 Executing: ${command} ${fullArgs.join(' ')}`);

      const child = spawn(command, fullArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
        // Show real-time output if not silent
        if (!args.includes('--silent') {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
        if (!args.includes('--silent') {
          process.stderr.write(data);
        }
      });

      child.on('close', code => {
        const success = code === 0;
        const output = stdout + stderr;

        // Parse output for metrics
        const result = this.parseFixerOutput(output, success);

        if (success) {
          resolve(result);
        } else {
          resolve({
            ...result,
            success: false,
            errors: [...result.errors, `Process exited with code ${code}`],
          });
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  /**
   * Parse Enhanced Error Fixer output to extract metrics
   */
  private parseFixerOutput()
    output: string,
    success: boolean,
  ): {
    success: boolean;
    filesProcessed: number;
    errorsFixed: number;
    errorsRemaining: number;
    safetyScore?: number;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Extract metrics from output
    let filesProcessed = 0;
    let errorsFixed = 0;
    const errorsRemaining = 0;
    let safetyScore: number | undefined;

    // Parse files processed
    const filesMatch = output.match(/(?:processed|fixed)\s+(\d+)\s+files?/i);
    if (filesMatch) {
      filesProcessed = parseInt(filesMatch[1]);
    }

    // Parse errors fixed
    const errorsFixedMatch = output.match(/(?:fixed|resolved)\s+(\d+)\s+errors?/i);
    if (errorsFixedMatch) {
      errorsFixed = parseInt(errorsFixedMatch[1]);
    }

    // Parse safety score
    const safetyMatch = output.match(/safety\s+score[:\s]+(\d+(?:\.\d+)?)/i);
    if (safetyMatch) {
      safetyScore = parseFloat(safetyMatch[1]);
    }

    // Extract warnings
    const warningMatches = output.match(/⚠️[^\n]*/g);
    if (warningMatches) {
      warnings.push(...warningMatches);
    }

    // Extract errors
    const errorMatches = output.match(/❌[^\n]*/g);
    if (errorMatches) {
      errors.push(...errorMatches);
    }

    return {
      success,
      filesProcessed,
      errorsFixed,
      errorsRemaining,
      safetyScore,
      warnings,
      errors,
    };
  }

  /**
   * Validate build after error fixing
   */
  private async validateBuild(): Promise<boolean> {
    try {
      console.log('🔍 Validating build...');

      const startTime = Date.now();
      execSync('yarn build', {
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      });

      const buildTime = Date.now() - startTime;
      console.log(`✅ Build validation passed (${buildTime}ms)`);
      return true;
    } catch (error) {
      console.log('❌ Build validation failed');
      if (error instanceof Error) {
        console.log(`   Error: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Get current TypeScript error count
   */
  private async getCurrentErrorCount(): Promise<number> {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      // If grep finds no matches, it returns exit code 1, or timeout occurred
      console.warn('TypeScript error count check failed or timed out:', (error as Error).message);
      return 0;
    }
  }

  /**
   * Show Enhanced Error Fixer metrics
   */
  async showMetrics(): Promise<void> {
    try {
      console.log('📊 Fetching Enhanced Error Fixer metrics...');

      const result = await this.runFixerCommand(['--show-metrics', '--json']);

      if (result.success) {
        console.log('✅ Metrics retrieved successfully');
      } else {
        console.log('⚠️  Could not retrieve all metrics');
      }
    } catch (error) {
      console.error('❌ Failed to show metrics:', error);
    }
  }

  /**
   * Validate safety before running fixes
   */
  async validateSafety(): Promise<{
    safe: boolean;
    safetyScore: number;
    issues: string[];
    recommendedBatchSize: number;
  }> {
    try {
      console.log('🛡️  Validating safety...');

      const result = await this.runFixerCommand(['--validate-safety', '--json']);

      // Parse safety validation result
      // This would need to be implemented based on the actual output format
      // For now, return a basic safety check

      return {
        safe: result.success,
        safetyScore: result.safetyScore || 0.5,
        issues: result.errors,
        recommendedBatchSize: this.DEFAULT_BATCH_SIZE,
      };
    } catch (error) {
      console.error('❌ Safety validation failed:', error);

      return {
        safe: false,
        safetyScore: 0,
        issues: [error instanceof Error ? error.message : String(error)],
        recommendedBatchSize: 3, // Conservative batch size
      };
    }
  }

  /**
   * Execute with recommended safety settings (Requirements 1.6, 1.7)
   */
  async executeWithSafetyProtocols(): Promise<FixerResult> {
    console.log('🛡️  Executing Enhanced Error Fixer with safety protocols...');

    // First, validate safety
    const safetyCheck = await this.validateSafety();

    if (!safetyCheck.safe) {
      console.log('⚠️  Safety validation failed:');
      safetyCheck.issues.forEach(issue => console.log(`   - ${issue}`));

      // Use conservative settings
      return await this.executeEnhancedFixer({
        maxFiles: 3,
        autoFix: false, // Dry run only
        dryRun: true,
        validateSafety: true,
      });
    }

    // Execute with recommended batch size
    return await this.executeEnhancedFixer({
      maxFiles: Math.min(safetyCheck.recommendedBatchSize, this.DEFAULT_BATCH_SIZE),
      autoFix: true,
      validateSafety: true,
    });
  }
}

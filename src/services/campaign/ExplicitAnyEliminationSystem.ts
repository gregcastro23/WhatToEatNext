/**
 * Explicit-Any Elimination System for Perfect Codebase Campaign
 *
 * Integration for scripts/typescript-fixes/fix-explicit-any-systematic.js
 * Implements batch processing with --max-files=25 --auto-fix parameters
 * Creates progress tracking for 75.5% reduction campaign continuation
 *
 * Requirements: 1.8, 7.2
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ExplicitAnyOptions {
  maxFiles?: number;
  autoFix?: boolean;
  dryRun?: boolean;
  aggressive?: boolean;
  validateSafety?: boolean;
  silent?: boolean;
  json?: boolean;
}

export interface ExplicitAnyResult {
  success: boolean;
  filesProcessed: number;
  explicitAnyFixed: number;
  explicitAnyRemaining: number;
  reductionPercentage: number;
  buildValidationPassed: boolean;
  executionTime: number;
  safetyScore?: number;
  warnings: string[];
  errors: string[];
}

export interface CampaignProgress {
  totalExplicitAnyStart: number;
  totalExplicitAnyRemaining: number;
  reductionAchieved: number;
  reductionPercentage: number;
  campaignTarget: number; // 75.5% reduction target
  isTargetMet: boolean;
}

export class ExplicitAnyEliminationSystem {
  private readonly EXPLICIT_ANY_FIXER_PATH =
    'scripts/typescript-fixes/fix-explicit-any-systematic.js';
  private readonly DEFAULT_BATCH_SIZE = 25;
  private readonly CAMPAIGN_TARGET_PERCENTAGE = 75.5; // Continue 75.5% reduction campaign
  private readonly PROGRESS_FILE = '.explicit-any-campaign-progress.json';

  /**
   * Execute Explicit-Any Systematic Fixer with specified options
   */
  async executeExplicitAnyFixer(options: ExplicitAnyOptions = {}): Promise<ExplicitAnyResult> {
    const startTime = Date.now();

    console.log('🎯 Starting Explicit-Any Elimination System...');

    // Get baseline count
    const initialCount = await this.getCurrentExplicitAnyCount();

    // Prepare command arguments
    const args = this.buildFixerArguments(options);

    try {
      // Execute the Explicit-Any Fixer
      const result = await this.runFixerCommand(args);

      // Get final count
      const finalCount = await this.getCurrentExplicitAnyCount();
      const explicitAnyFixed = Math.max(0, initialCount - finalCount);

      // Validate build after fixing
      const buildValidationPassed = await this.validateBuild();

      // Calculate reduction percentage
      const reductionPercentage = initialCount > 0 ? (explicitAnyFixed / initialCount) * 100 : 0;

      const executionTime = Date.now() - startTime;

      return {
        success: result.success,
        filesProcessed: result.filesProcessed,
        explicitAnyFixed,
        explicitAnyRemaining: finalCount,
        reductionPercentage,
        buildValidationPassed,
        executionTime,
        safetyScore: result.safetyScore,
        warnings: result.warnings,
        errors: result.errors,
      };
    } catch (error) {
      console.error('❌ Explicit-Any Elimination execution failed:', error);

      return {
        success: false,
        filesProcessed: 0,
        explicitAnyFixed: 0,
        explicitAnyRemaining: await this.getCurrentExplicitAnyCount(),
        reductionPercentage: 0,
        buildValidationPassed: false,
        executionTime: Date.now() - startTime,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Execute batch processing for systematic explicit-any elimination
   */
  async executeBatchProcessing(maxBatches?: number): Promise<ExplicitAnyResult[]> {
    console.log(`🔄 Starting systematic explicit-any batch processing...`);

    const results: ExplicitAnyResult[] = [];
    let batchNumber = 1;
    let totalFilesProcessed = 0;
    let totalExplicitAnyFixed = 0;

    // Load or initialize campaign progress
    const campaignProgress = await this.loadCampaignProgress();

    const maxIterations = maxBatches || 30; // Prevent infinite loops
    const startTime = Date.now();
    const maxExecutionTime = 20 * 60 * 1000; // 20 minutes max

    while (batchNumber <= maxIterations) {
      console.log(`\n📦 Processing Explicit-Any Batch ${batchNumber}/${maxIterations}...`);

      // Check execution time limit
      if (Date.now() - startTime > maxExecutionTime) {
        console.log(`⏰ Maximum execution time (20 minutes) reached, stopping`);
        break;
      }

      // Check if we should stop (max batches reached)
      if (maxBatches && batchNumber > maxBatches) {
        console.log(`✋ Reached maximum batch limit (${maxBatches})`);
        break;
      }

      // Check current explicit-any count with timeout protection
      let currentCount = 0;
      try {
        currentCount = await this.getCurrentExplicitAnyCount();
      } catch (error) {
        console.warn('⚠️  Explicit-any count check failed, assuming warnings remain');
        currentCount = 1; // Assume warnings exist to continue safely
      }

      if (currentCount === 0) {
        console.log('🎉 No more explicit-any warnings found!');
        break;
      }

      // Execute fixer for this batch
      const batchResult = await this.executeExplicitAnyFixer({
        maxFiles: this.DEFAULT_BATCH_SIZE,
        autoFix: true,
        validateSafety: true,
      });

      results.push(batchResult);
      totalFilesProcessed += batchResult.filesProcessed;
      totalExplicitAnyFixed += batchResult.explicitAnyFixed;

      console.log(`📊 Batch ${batchNumber} Results:`);
      console.log(`  Files processed: ${batchResult.filesProcessed}`);
      console.log(`  Explicit-any fixed: ${batchResult.explicitAnyFixed}`);
      console.log(`  Reduction: ${batchResult.reductionPercentage.toFixed(1)}%`);
      console.log(`  Build validation: ${batchResult.buildValidationPassed ? '✅' : '❌'}`);

      // Update campaign progress
      await this.updateCampaignProgress(totalExplicitAnyFixed);

      // Check if campaign target is met
      const updatedProgress = await this.loadCampaignProgress();
      if (updatedProgress.isTargetMet) {
        console.log(
          `🎯 Campaign target of ${this.CAMPAIGN_TARGET_PERCENTAGE}% reduction achieved!`,
        );
        break;
      }

      // Stop if no progress made
      if (batchResult.filesProcessed === 0 && batchResult.explicitAnyFixed === 0) {
        console.log('⏸️  No progress made in this batch, stopping');
        break;
      }

      // Stop on build failure
      if (!batchResult.buildValidationPassed) {
        console.log('🛑 Build validation failed, stopping batch processing');
        break;
      }

      batchNumber++;
    }

    // Final campaign progress report
    const finalProgress = await this.loadCampaignProgress();
    console.log(`\n📈 Campaign Progress Summary:`);
    console.log(`  Total batches: ${results.length}`);
    console.log(`  Total files processed: ${totalFilesProcessed}`);
    console.log(`  Total explicit-any fixed: ${totalExplicitAnyFixed}`);
    console.log(`  Campaign reduction: ${finalProgress.reductionPercentage.toFixed(1)}%`);
    console.log(
      `  Target (${this.CAMPAIGN_TARGET_PERCENTAGE}%): ${finalProgress.isTargetMet ? '✅' : '❌'}`,
    );
    console.log(`  Remaining explicit-any: ${finalProgress.totalExplicitAnyRemaining}`);

    return results;
  }

  /**
   * Build command arguments for Explicit-Any Fixer
   */
  private buildFixerArguments(options: ExplicitAnyOptions): string[] {
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

    if (options.aggressive) {
      args.push('--aggressive');
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
   * Execute the Explicit-Any Fixer command
   */
  private async runFixerCommand(args: string[]): Promise<{
    success: boolean;
    filesProcessed: number;
    safetyScore?: number;
    warnings: string[];
    errors: string[];
  }> {
    return new Promise((resolve, reject) => {
      const command = 'node';
      const fullArgs = [this.EXPLICIT_ANY_FIXER_PATH, ...args];

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
        if (!args.includes('--silent')) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
        if (!args.includes('--silent')) {
          process.stderr.write(data);
        }
      });

      child.on('close', code => {
        const success = code === 0;
        const output = stdout + stderr;

        // Parse output for metrics
        const result = this.parseFixerOutput(output, success);

        resolve(result);
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  /**
   * Parse Explicit-Any Fixer output to extract metrics
   */
  private parseFixerOutput(
    output: string,
    success: boolean,
  ): {
    success: boolean;
    filesProcessed: number;
    safetyScore?: number;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Extract metrics from output
    let filesProcessed = 0;
    let safetyScore: number | undefined;

    // Parse files processed
    const filesMatch = output.match(/(?:processed|fixed)\s+(\d+)\s+files?/i);
    if (filesMatch) {
      filesProcessed = parseInt(filesMatch[1]);
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
      safetyScore,
      warnings,
      errors,
    };
  }

  /**
   * Validate build after explicit-any fixing
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
   * Get current explicit-any warning count
   */
  async getCurrentExplicitAnyCount(): Promise<number> {
    try {
      const output = execSync('yarn lint 2>&1 | grep -c "@typescript-eslint/no-explicit-any"', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      // If grep finds no matches, it returns exit code 1, or timeout occurred
      console.warn('Explicit-any count check failed or timed out:', (error as Error).message);
      return 0;
    }
  }

  /**
   * Load campaign progress from file
   */
  private async loadCampaignProgress(): Promise<CampaignProgress> {
    try {
      if (fs.existsSync(this.PROGRESS_FILE)) {
        const data = await fs.promises.readFile(this.PROGRESS_FILE, 'utf8');
        const progress = JSON.parse(data);

        // Recalculate current status
        const currentCount = await this.getCurrentExplicitAnyCount();
        const reductionAchieved = progress.totalExplicitAnyStart - currentCount;
        const reductionPercentage =
          progress.totalExplicitAnyStart > 0
            ? (reductionAchieved / progress.totalExplicitAnyStart) * 100
            : 0;

        return {
          ...progress,
          totalExplicitAnyRemaining: currentCount,
          reductionAchieved,
          reductionPercentage,
          isTargetMet: reductionPercentage >= this.CAMPAIGN_TARGET_PERCENTAGE,
        };
      }
    } catch (error) {
      console.log(`⚠️  Could not load campaign progress: ${error}`);
    }

    // Initialize new campaign progress
    const currentCount = await this.getCurrentExplicitAnyCount();
    return {
      totalExplicitAnyStart: currentCount,
      totalExplicitAnyRemaining: currentCount,
      reductionAchieved: 0,
      reductionPercentage: 0,
      campaignTarget: this.CAMPAIGN_TARGET_PERCENTAGE,
      isTargetMet: false,
    };
  }

  /**
   * Update campaign progress
   */
  private async updateCampaignProgress(additionalFixed: number): Promise<void> {
    try {
      const progress = await this.loadCampaignProgress();

      // Update progress
      const currentCount = await this.getCurrentExplicitAnyCount();
      const totalReductionAchieved = progress.totalExplicitAnyStart - currentCount;
      const reductionPercentage =
        progress.totalExplicitAnyStart > 0
          ? (totalReductionAchieved / progress.totalExplicitAnyStart) * 100
          : 0;

      const updatedProgress: CampaignProgress = {
        ...progress,
        totalExplicitAnyRemaining: currentCount,
        reductionAchieved: totalReductionAchieved,
        reductionPercentage,
        isTargetMet: reductionPercentage >= this.CAMPAIGN_TARGET_PERCENTAGE,
      };

      await fs.promises.writeFile(this.PROGRESS_FILE, JSON.stringify(updatedProgress, null, 2));

      console.log(`📊 Campaign Progress Updated:`);
      console.log(
        `   Reduction: ${reductionPercentage.toFixed(1)}% (target: ${this.CAMPAIGN_TARGET_PERCENTAGE}%)`,
      );
      console.log(`   Remaining: ${currentCount} explicit-any warnings`);
    } catch (error) {
      console.error(`❌ Failed to update campaign progress: ${error}`);
    }
  }

  /**
   * Show campaign progress and metrics
   */
  async showCampaignProgress(): Promise<CampaignProgress> {
    const progress = await this.loadCampaignProgress();

    console.log('\n📊 EXPLICIT-ANY ELIMINATION CAMPAIGN PROGRESS');
    console.log('=============================================');
    console.log(`🎯 Campaign Target: ${progress.campaignTarget}% reduction`);
    console.log(`📈 Current Progress: ${progress.reductionPercentage.toFixed(1)}%`);
    console.log(`✅ Target Met: ${progress.isTargetMet ? 'Yes' : 'No'}`);
    console.log(`🔢 Starting Count: ${progress.totalExplicitAnyStart}`);
    console.log(`🔢 Current Count: ${progress.totalExplicitAnyRemaining}`);
    console.log(`🔧 Total Fixed: ${progress.reductionAchieved}`);

    if (progress.isTargetMet) {
      console.log(`🎉 Congratulations! Campaign target achieved!`);
    } else {
      const remaining =
        Math.ceil((progress.campaignTarget / 100) * progress.totalExplicitAnyStart) -
        progress.reductionAchieved;
      console.log(`🎯 Need to fix ${remaining} more to reach target`);
    }

    return progress;
  }

  /**
   * Reset campaign progress (for testing or restart)
   */
  async resetCampaignProgress(): Promise<void> {
    try {
      if (fs.existsSync(this.PROGRESS_FILE)) {
        await fs.promises.unlink(this.PROGRESS_FILE);
        console.log('🔄 Campaign progress reset');
      }
    } catch (error) {
      console.error(`❌ Failed to reset campaign progress: ${error}`);
    }
  }

  /**
   * Execute with campaign continuation (Requirements 1.8, 7.2)
   */
  async executeCampaignContinuation(): Promise<ExplicitAnyResult[]> {
    console.log('🎯 Continuing 75.5% Explicit-Any Reduction Campaign...');

    // Show current progress
    const progress = await this.showCampaignProgress();

    if (progress.isTargetMet) {
      console.log('✅ Campaign target already achieved!');
      return [];
    }

    // Calculate how many more we need to fix
    const targetCount = Math.ceil((progress.campaignTarget / 100) * progress.totalExplicitAnyStart);
    const remainingToFix = targetCount - progress.reductionAchieved;

    console.log(`🎯 Need to fix approximately ${remainingToFix} more explicit-any warnings`);

    // Execute batch processing until target is met
    const results = await this.executeBatchProcessing();

    // Final progress check
    await this.showCampaignProgress();

    return results;
  }
}

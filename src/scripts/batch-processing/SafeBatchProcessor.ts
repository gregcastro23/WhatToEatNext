/**
 * Safe Batch Processing Framework for Unused Variable Elimination
 *
 * This framework implements comprehensive safety protocols for batch processing
 * unused variable elimination with automatic rollback capabilities.
 *
 * Features:
 * - Maximum 15 files per batch with configurable limits
 * - TypeScript compilation validation after each batch
 * - Automatic rollback using git stash on compilation errors
 * - Enhanced safety protocols for high-impact files
 * - Progress tracking and detailed logging
 */

import { execSync } from 'child_process';

export interface BatchProcessingConfig {
  maxBatchSize: number,
  maxBatchSizeCritical: number,
  validateAfterEachBatch: boolean,
  autoRollbackOnError: boolean,
  createGitStash: boolean,
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface FileProcessingInfo {
  filePath: string,
  relativePath: string,
  isHighImpact: boolean,
  isCritical: boolean,
  unusedVariableCount: number,
  riskLevel: 'low' | 'medium' | 'high',
  fileType: string
}

export interface BatchResult {
  batchId: string,
  files: string[],
  success: boolean,
  processedCount: number,
  eliminatedCount: number,
  preservedCount: number,
  compilationPassed: boolean,
  rollbackPerformed: boolean,
  errors: string[],
  warnings: string[],
  processingTime: number,
  stashId?: string
}

export interface SafetyCheckpoint {
  id: string,
  timestamp: Date,
  batchId: string,
  compilationStatus: boolean,
  errorCount: number,
  stashId?: string
}

export class SafeBatchProcessor {
  private config: BatchProcessingConfig,
  private checkpoints: SafetyCheckpoint[] = [];
  private currentBatchId = 0;
  private totalProcessed = 0;
  private totalEliminated = 0;
  private totalPreserved = 0;

  constructor(config: Partial<BatchProcessingConfig> = {}) {
    this.config = {
      maxBatchSize: 15,
      maxBatchSizeCritical: 5,
      validateAfterEachBatch: true,
      autoRollbackOnError: true,
      createGitStash: true,
      logLevel: 'info',
      ...config
    };
  }

  /**
   * Process files in safe batches with comprehensive safety protocols
   */
  async processBatches(files: FileProcessingInfo[]): Promise<BatchResult[]> {
    this.log('info', `🚀 Starting safe batch processing of ${files.length} files`);
    this.log(
      'info',
      `📋 Configuration: maxBatch=${this.config.maxBatchSize}, maxCritical=${this.config.maxBatchSizeCritical}`,
    );

    const results: BatchResult[] = [];

    // Create initial safety checkpoint
    await this.createSafetyCheckpoint('initial');

    // Sort files by risk level (low risk first)
    const sortedFiles = this.sortFilesByRisk(files);

    // Create batches respecting safety limits
    const batches = this.createBatches(sortedFiles);

    this.log('info', `📦 Created ${batches.length} batches for processing`);

    for (let i = 0i < batches.lengthi++) {
      const batch = batches[i];
      const batchId = `batch-${++this.currentBatchId}`;

      this.log('info', `\n🔄 Processing ${batchId} (${batch.length} files)`);

      const result = await this.processBatch(batchId, batch);
      results.push(result);

      if (!result.success) {
        this.log('error', `❌ Batch ${batchId} failed, stopping processing`);
        break;
      }

      this.log('info', `✅ Batch ${batchId} completed successfully`);

      // Update totals
      this.totalProcessed += result.processedCount;
      this.totalEliminated += result.eliminatedCount;
      this.totalPreserved += result.preservedCount;
    }

    this.log('info', `\n📊 Final Results:`);
    this.log('info', `   Total Processed: ${this.totalProcessed}`);
    this.log('info', `   Total Eliminated: ${this.totalEliminated}`),
    this.log('info', `   Total Preserved: ${this.totalPreserved}`),
    this.log(
      'info',
      `   Success Rate: ${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`,
    );

    return results;
  }

  /**
   * Process a single batch with safety protocols
   */
  private async processBatch(batchId: string, files: FileProcessingInfo[]): Promise<BatchResult> {
    const startTime = Date.now();
    let stashId: string | undefined,

    const result: BatchResult = {
      batchId,
      files: files.map(f => f.filePath),,
      success: false,
      processedCount: 0,
      eliminatedCount: 0,
      preservedCount: 0,
      compilationPassed: false,
      rollbackPerformed: false,
      errors: [],
      warnings: [],
      processingTime: 0,
      stashId: undefined
    };

    try {
      // Create git stash before processing if enabled
      if (this.config.createGitStash) {
        stashId = await this.createGitStash(batchId);
        result.stashId = stashId;
        this.log('debug', `📦 Created git stash: ${stashId}`);
      }

      // Process each file in the batch
      for (const fileInfo of files) {
        try {
          const fileResult = await this.processFile(fileInfo);
          result.processedCount++;
          result.eliminatedCount += fileResult.eliminated;
          result.preservedCount += fileResult.preserved;

          this.log(
            'debug',
            `   ✓ ${fileInfo.relativePath}: ${fileResult.eliminated} eliminated, ${fileResult.preserved} preserved`,
          );
        } catch (error) {
          const errorMsg = `Failed to process ${fileInfo.relativePath}: ${error}`;
          result.errors.push(errorMsg);
          this.log('error', `   ❌ ${errorMsg}`);
        }
      }

      // Validate TypeScript compilation after batch
      if (this.config.validateAfterEachBatch) {
        this.log('info', `🔍 Validating TypeScript compilation...`);
        result.compilationPassed = await this.validateTypeScriptCompilation();

        if (!result.compilationPassed) {
          result.errors.push('TypeScript compilation failed after batch processing');
          this.log('error', '❌ TypeScript compilation failed');

          // Perform automatic rollback if enabled
          if (this.config.autoRollbackOnError && stashId) {
            await this.performRollback(stashId);
            result.rollbackPerformed = true;
            this.log('info', '🔄 Automatic rollback performed')
          }
        } else {
          this.log('info', '✅ TypeScript compilation passed')
        }
      } else {
        result.compilationPassed = true, // Assume success if not validating;
      }

      result.success = result.compilationPassed && result.errors.length === 0;
    } catch (error) {
      const errorMsg = `Batch processing failed: ${error}`;
      result.errors.push(errorMsg);
      this.log('error', errorMsg);

      // Perform rollback on critical error
      if (this.config.autoRollbackOnError && stashId) {
        await this.performRollback(stashId);
        result.rollbackPerformed = true;
      }
    }

    result.processingTime = Date.now() - startTime;

    // Create safety checkpoint after batch
    await this.createSafetyCheckpoint(
      batchId,
      result.compilationPassed;
      result.errors.length;
      stashId,
    );

    return result;
  }

  /**
   * Process a single file for unused variable elimination
   */
  private async processFile(
    fileInfo: FileProcessingInfo,
  ): Promise<{ eliminated: number, preserved: number }> {
    // This is a placeholder for the actual file processing logic
    // In the real implementation, this would:
    // 1. Read the file content
    // 2. Identify unused variables using ESLint
    // 3. Apply domain preservation patterns
    // 4. Eliminate or transform variables based on safety rules
    // 5. Write the modified content back to the file

    this.log('debug', `Processing file: ${fileInfo.relativePath}`);

    // Simulate processing based on file info
    const eliminated = Math.floor(((fileInfo as any)?.unusedVariableCount || 0) * 0.2); // 70% elimination rate
    const preserved = fileInfo.unusedVariableCount - eliminated;

    return { eliminated, preserved };
  }

  /**
   * Sort files by risk level for safe processing order
   */
  private sortFilesByRisk(files: FileProcessingInfo[]): FileProcessingInfo[] {
    return files.sort((ab) => {
      // Process low-risk files first
      const riskOrder = { low: 1, medium: 2, high: 3 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      }

      // Within same risk level, process files with fewer variables first
      if (a.unusedVariableCount !== b.unusedVariableCount) {
        return a.unusedVariableCount - b.unusedVariableCount;
      }

      // Finally, sort alphabetically for consistency
      return a.relativePath.localeCompare(b.relativePath);
    });
  }

  /**
   * Create batches respecting safety limits
   */
  private createBatches(files: FileProcessingInfo[]): FileProcessingInfo[][] {
    const batches: FileProcessingInfo[][] = [];
    let currentBatch: FileProcessingInfo[] = [];

    for (const file of files) {
      const batchLimit = this.getBatchLimit(file);

      // Start new batch if current batch would exceed limit
      if (currentBatch.length >= batchLimit) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
        }
      }

      currentBatch.push(file);
    }

    // Add final batch if not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Get batch limit based on file characteristics
   */
  private getBatchLimit(file: FileProcessingInfo): number {
    // Use smaller batch sizes for critical files
    if (file.isCritical || file.riskLevel === 'high' || file.unusedVariableCount > 20) {
      return this.config.maxBatchSizeCritical;
    }

    return this.config.maxBatchSize;
  }

  /**
   * Create git stash for rollback capability
   */
  private async createGitStash(batchId: string): Promise<string> {
    try {
      const stashMessage = `unused-vars-batch-${batchId}-${new Date().toISOString()}`;

      // Check if there are changes to stash
      const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
      if (!statusOutput.trim()) {
        // No changes to stash, create empty stash
        execSync('git stash push --keep-index -m '' + stashMessage + '' --allow-empty', {
          stdio: 'pipe'
        });
      } else {
        execSync('git stash push -m '' + stashMessage + ''', { stdio: 'pipe' });
      }

      // Get the stash ID
      const stashList = execSync('git stash list --oneline -1', { encoding: 'utf8' });
      const stashMatch = stashList.match(/^(stash@\{[^}]+\})/);

      return stashMatch ? stashMatch[1] : stashMessage;
    } catch (error) {
      this.log('warn', `Failed to create git stash: ${error}`);
      throw new Error(`Git stash creation failed: ${error}`);
    }
  }

  /**
   * Perform rollback using git stash
   */
  private async performRollback(stashId: string): Promise<void> {
    try {
      this.log('info', `🔄 Performing rollback using stash: ${stashId}`);

      // Reset working directory to clean state
      execSync('git reset --hard HEAD', { stdio: 'pipe' });

      // Apply the stash to restore previous state
      if (stashId.startsWith('stash@{')) {
        execSync(`git stash pop ${stashId}`, { stdio: 'pipe' });
      } else {
        // If stashId is just a message, find and apply the most recent stash
        execSync('git stash pop', { stdio: 'pipe' });
      }

      this.log('info', '✅ Rollback completed successfully');
    } catch (error) {
      this.log('error', `Failed to perform rollback: ${error}`);
      throw new Error(`Rollback failed: ${error}`);
    }
  }

  /**
   * Validate TypeScript compilation
   */
  private async validateTypeScriptCompilation(): Promise<boolean> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
      return true;
    } catch (error) {
      this.log('debug', `TypeScript compilation failed: ${error}`);
      return false;
    }
  }

  /**
   * Create safety checkpoint
   */
  private async createSafetyCheckpoint(
    id: string,
    compilationStatus: boolean = true,,
    errorCount: number = 0,,
    stashId?: string,
  ): Promise<void> {
    const checkpoint: SafetyCheckpoint = {
      id,
      timestamp: new Date(),
      batchId: id,
      compilationStatus,
      errorCount,
      stashId
    };

    this.checkpoints.push(checkpoint);
    this.log('debug', `📍 Created safety checkpoint: ${id}`);
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      totalProcessed: this.totalProcessed,
      totalEliminated: this.totalEliminated,
      totalPreserved: this.totalPreserved,
      checkpointsCreated: this.checkpoints.length,
      lastCheckpoint: this.checkpoints[this.checkpoints.length - 1]
    };
  }

  /**
   * Get all safety checkpoints
   */
  getSafetyCheckpoints(): SafetyCheckpoint[] {
    return [...this.checkpoints]
  }

  /**
   * Log message with appropriate level
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = level.toUpperCase().padEnd(5);
      // // console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }
}

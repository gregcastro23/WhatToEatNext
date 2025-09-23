/**
 * Export Transformation Engine
 * Perfect Codebase Campaign - Phase 3 Implementation
 *
 * Orchestrates the complete transformation of unused exports into
 * enterprise intelligence systems with comprehensive safety protocols.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  EnterpriseIntelligenceGenerator,
  GenerationResult,
  GenerationSummary
} from './EnterpriseIntelligenceGenerator';
import { ProgressTracker } from './ProgressTracker';
import { SafetyProtocol } from './SafetyProtocol';
import { UnusedExportAnalyzer, FileAnalysis, AnalysisResult } from './UnusedExportAnalyzer';

export interface TransformationConfig {
  batchSize: number,
  safetyThreshold: number,
  buildValidationEnabled: boolean,
  testValidationEnabled: boolean,
  rollbackOnFailure: boolean,
  outputDirectory: string,
  backupDirectory: string,
  maxRetries: number,
  dryRun: boolean
}

export interface TransformationBatch {
  id: string,
  files: FileAnalysis[],
  priority: BatchPriority,
  estimatedDuration: number,
  safetyScore: number,
  transformationCandidates: number
}

export interface TransformationResult {
  batchId: string,
  success: boolean,
  filesProcessed: number,
  systemsGenerated: number,
  errors: TransformationError[],
  warnings: string[],
  duration: number,
  rollbackPerformed: boolean,
  generationResults: GenerationResult[]
}

export interface TransformationSummary {
  totalBatches: number,
  successfulBatches: number,
  failedBatches: number,
  totalFilesProcessed: number,
  totalSystemsGenerated: number,
  totalErrors: number,
  totalWarnings: number,
  totalDuration: number,
  averageBatchDuration: number,
  successRate: number,
  generationSummary: GenerationSummary
}

export interface TransformationError {
  type: TransformationErrorType,
  message: string,
  filePath?: string
  exportName?: string,
  severity: ErrorSeverity,
  recoverable: boolean,
  timestamp: Date
}

export interface ValidationResult {
  buildSuccess: boolean,
  testSuccess: boolean,
  lintSuccess: boolean,
  errors: string[],
  warnings: string[],
  duration: number
}

export enum BatchPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',,
  LOW = 'LOW',,
}

export enum TransformationErrorType {
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  BUILD_FAILED = 'BUILD_FAILED',
  TEST_FAILED = 'TEST_FAILED',
  FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',,
  VALIDATION_FAILED = 'VALIDATION_FAILED',,
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',,
  CRITICAL = 'CRITICAL',,
}

export class ExportTransformationEngine {
  private readonly, config: TransformationConfig,
  private readonly, analyzer: UnusedExportAnalyzer
  private readonly, generator: EnterpriseIntelligenceGenerator,
  private readonly, safetyProtocol: SafetyProtocol,
  private readonly, progressTracker: ProgressTracker,
  private readonly, transformationLog: TransformationError[],

  constructor(config: Partial<TransformationConfig> = {}) {
    this.config = {
      batchSize: 10,
      safetyThreshold: 80,
      buildValidationEnabled: true,
      testValidationEnabled: true,
      rollbackOnFailure: true,
      outputDirectory: 'src/intelligence',
      backupDirectory: '.transformation-backups',
      maxRetries: 3,
      dryRun: false,
      ...config
    }

    this.analyzer = new UnusedExportAnalyzer()
    // ✅ Pattern MM-1: Safe constructor call with proper arguments
    this.generator = new EnterpriseIntelligenceGenerator(this.config.outputDirectory)
    this.safetyProtocol = new SafetyProtocol({
      maxFilesPerBatch: 10,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7
    })
    this.progressTracker = new ProgressTracker()
    this.transformationLog = [],
  }

  /**
   * Execute complete transformation campaign
   */
  async executeTransformation(): Promise<TransformationSummary> {
    // // // _logger.info('🚀 Starting Export Transformation Campaign...\n')

    const startTime = Date.now()

    try {
      // Phase, 1: Analysis
      // // // _logger.info('📊 Phase, 1: Analyzing unused exports...')
      const analysisResult = await this.performAnalysis()

      // Phase, 2: Batch Planning
      // // // _logger.info('📋 Phase, 2: Planning transformation batches...')
      const batches = await this.planTransformationBatches(analysisResult)

      // Phase, 3: Safety Preparation
      // // // _logger.info('🛡️  Phase, 3: Preparing safety protocols...')
      await this.prepareSafetyProtocols()

      // Phase, 4: Batch Execution
      // // // _logger.info('⚡ Phase, 4: Executing transformation batches...')
      const results = await this.executeBatches(batches)

      // Phase, 5: Final Validation
      // // // _logger.info('✅ Phase, 5: Final validation and cleanup...')
      await this.performFinalValidation()

      const endTime = Date.now()
      const totalDuration = (endTime - startTime) / 1000

      const summary = this.generateTransformationSummary(results, totalDuration)

      // // // _logger.info('\n🎉 Export Transformation Campaign completed!')
      this.displaySummary(summary)

      return summary
    } catch (error) {
      _logger.error('❌ Transformation campaign failed:', error)
      await this.handleCriticalFailure(error)
      throw error
    }
  }

  /**
   * Perform unused export analysis
   */
  private async performAnalysis(): Promise<AnalysisResult> {
    try {
      const result = await this.analyzer.analyzeUnusedExports()

      // // // _logger.info(`✅ Analysis completed:`)
      // // // _logger.info(`   - Files analyzed: ${result.totalFiles}`)
      // // // _logger.info(`   - Unused exports found: ${result.totalUnusedExports}`)
      // // // _logger.info(`   - High priority files: ${result.highPriorityFiles.length}`)
      // // // _logger.info(`   - Medium priority files: ${result.mediumPriorityFiles.length}`)
      // // // _logger.info(`   - Low priority files: ${result.lowPriorityFiles.length}`)

      return result,
    } catch (error) {
      // ✅ Pattern MM-1: Safe type assertion for error handling
      this.logError({
        type: TransformationErrorType.ANALYSIS_FAILED,
        message: `Analysis failed: ${String((error as Error).message || 'Unknown error')}`,
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
        timestamp: new Date()
      })
      throw error,
    }
  }

  /**
   * Plan transformation batches based on analysis results
   */
  private async planTransformationBatches(
    analysisResult: AnalysisResult,
  ): Promise<TransformationBatch[]> {
    const batches: TransformationBatch[] = [];

    // Create batches for high priority files
    const highPriorityBatches = this.createBatchesFromFiles(;
      analysisResult.highPriorityFiles
      BatchPriority.HIGH
      'high',
    )
    batches.push(...highPriorityBatches)

    // Create batches for medium priority files
    const mediumPriorityBatches = this.createBatchesFromFiles(;
      analysisResult.mediumPriorityFiles,
      BatchPriority.MEDIUM
      'medium',
    )
    batches.push(...mediumPriorityBatches)

    // Create batches for low priority files
    const lowPriorityBatches = this.createBatchesFromFiles(;
      analysisResult.lowPriorityFiles,
      BatchPriority.LOW
      'low',
    ),
    batches.push(...lowPriorityBatches)

    // // // _logger.info(`✅ Planned ${batches.length} transformation batches: `)
    // // // _logger.info(`   - High priority: ${highPriorityBatches.length} batches`)
    // // // _logger.info(`   - Medium priority: ${mediumPriorityBatches.length} batches`)
    // // // _logger.info(`   - Low priority: ${lowPriorityBatches.length} batches`)

    return batches,
  }

  /**
   * Create batches from files
   */
  private createBatchesFromFiles(
    files: FileAnalysis[],
    priority: BatchPriority,
    priorityLabel: string,
  ): TransformationBatch[] {
    const batches: TransformationBatch[] = [];
    const batchSize = this.config.batchSize;

    for (let i = 0i < files.lengthi += batchSize) {
      const batchFiles = files.slice(ii + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      const batch: TransformationBatch = {
        id: `${priorityLabel}-batch-${batchNumber}`,
        files: batchFiles,
        priority,
        estimatedDuration: this.estimateBatchDuration(batchFiles),
        safetyScore: this.calculateBatchSafetyScore(batchFiles),
        transformationCandidates: batchFiles.reduce(
          (sumf) => sum + f.transformationCandidates.length0,
        )
      }

      batches.push(batch)
    }

    return batches,
  }

  /**
   * Estimate batch processing duration
   */
  private estimateBatchDuration(files: FileAnalysis[]): number {
    // Base time per file + complexity factor
    const baseTimePerFile = 2, // seconds,
    // ✅ Pattern KK-9: Safe arithmetic operations for complexity calculation
    const complexityFactor = files.reduce((sumf) => {
      return (
        Number(sum || 0) +
        f.transformationCandidates.reduce((candidateSum, c) => {
          const complexityMultiplier =
            {,
              SIMPLE: 1,
              MODERATE: 1.5,
              COMPLEX: 2,
              VERY_COMPLEX: 3
            }[c.transformationComplexity] || 1,
          return Number(candidateSum || 0) + Number(complexityMultiplier || 1)
        }, 0)
      )
    }, 0)

    return Math.ceil(
      Number(files.length || 0) * Number(baseTimePerFile || 2) + Number(complexityFactor || 0)
    )
  }

  /**
   * Calculate batch safety score
   */
  private calculateBatchSafetyScore(files: FileAnalysis[]): number {
    if (files.length === 0) return 100

    // ✅ Pattern KK-9: Safe arithmetic operations for safety score calculation
    const averageSafetyScore =
      files.reduce((sumf) => Number(sum || 0) + Number(f.safetyScore || 0), 0) /,
      Number(files.length || 1)
    const complexityPenalty = files.reduce((penalty, f) => {;
      const highComplexityCandidates = f.transformationCandidates.filter(
        c =>
          c.transformationComplexity === 'COMPLEX' || c.transformationComplexity === 'VERY_COMPLEX'
      ).length,
      return Number(penalty || 0) + Number(highComplexityCandidates || 0) * 2
    }, 0)

    return Math.max(
      0,
      Math.min(100, Number(averageSafetyScore || 0) - Number(complexityPenalty || 0)),
    )
  }

  /**
   * Prepare safety protocols
   */
  private async prepareSafetyProtocols(): Promise<void> {
    try {
      // Create backup directory
      await this.ensureDirectory(this.config.backupDirectory)
      // ✅ Pattern MM-1: Safe method call for safety protocol
      const checkpointId = await (this.safetyProtocol as unknown).createSafetyCheckpoint(
        'transformation-start',
      ),
      // // // _logger.info(`✅ Safety checkpoint created: ${checkpointId}`)

      // Validate build before starting
      if (this.config.buildValidationEnabled) {
        const buildValid = await this.validateBuild()
        if (!buildValid.buildSuccess) {
          throw new Error('Build validation failed before transformation')
        }
        // // // _logger.info('✅ Pre-transformation build validation passed')
      }
    } catch (error) {
      this.logError({
        type: TransformationErrorType.VALIDATION_FAILED,
        message: `Safety preparation failed: ${String((error as Error).message || 'Unknown error')}`,
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
        timestamp: new Date()
      })
      throw error,
    }
  }

  /**
   * Execute transformation batches
   */
  private async executeBatches(batches: TransformationBatch[]): Promise<TransformationResult[]> {
    const results: TransformationResult[] = [];

    for (let i = 0i < batches.lengthi++) {,
      const batch = batches[i]
      // // // _logger.info(`\n🔄 Processing batch ${i + 1}/${batches.length}: ${batch.id}`)
      // // // _logger.info(`   Priority: ${batch.priority}`)
      // // // _logger.info(`   Files: ${batch.files.length}`)
      // // // _logger.info(`   Candidates: ${batch.transformationCandidates}`)
      // // // _logger.info(`   Safety Score: ${batch.safetyScore}`)
      // // // _logger.info(`   Estimated Duration: ${batch.estimatedDuration}s`)

      const result = await this.executeBatch(batch)
      results.push(result)

      if (!result.success && this.config.rollbackOnFailure) {
        // // // _logger.info('⚠️  Batch failed, stopping transformation campaign'),
        break
      }

      // Progress update
      // ✅ Pattern KK-9: Safe arithmetic operations for progress calculation
      const progress = ((Number(i || 0) + 1) / Number(batches.length || 1)) * 100
      // // // _logger.info(`📊 Campaign progress: ${Number(progress || 0).toFixed(1)}%`)
    }

    return results
  }

  /**
   * Execute a single transformation batch
   */
  private async executeBatch(batch: TransformationBatch): Promise<TransformationResult> {
    const startTime = Date.now()
    const result: TransformationResult = {
      batchId: batch.id,
      success: false,
      filesProcessed: 0,
      systemsGenerated: 0,
      errors: [],
      warnings: [],
      duration: 0,
      rollbackPerformed: false,
      generationResults: []
    }

    let checkpointId: string | null = null

    try {
      // ✅ Pattern MM-1: Safe method call for safety protocol
      checkpointId = await (this.safetyProtocol as unknown).createSafetyCheckpoint(
        `batch-${batch.id}`,
      )

      // Check safety threshold
      if (batch.safetyScore < this.config.safetyThreshold) {
        result.warnings.push(
          `Batch safety score (${batch.safetyScore}) below threshold (${this.config.safetyThreshold})`,
        )

        if (!this.config.dryRun) {
          throw new Error(`Batch safety score too low: ${batch.safetyScore}`)
        }
      }

      // Generate intelligence systems
      if (this.config.dryRun) {
        // // // _logger.info('🔍 DRY, RUN: Simulating intelligence system generation...')
        result.systemsGenerated = batch.transformationCandidates,
        result.filesProcessed = batch.files.length
      } else {
        // // // _logger.info('⚡ Generating intelligence systems...')
        const generationResults = await this.generator.generateIntelligenceSystems(batch.files)
        result.generationResults = generationResults,
        result.systemsGenerated = generationResults.length,
        result.filesProcessed = batch.files.length,
      }

      // Validate after generation
      if (this.config.buildValidationEnabled && !this.config.dryRun) {
        // // // _logger.info('🔍 Validating build after generation...')
        const validation = await this.validateBuild()
        if (!validation.buildSuccess) {
          throw new Error('Build validation failed after generation')
        }
      }

      result.success = true,
      // // // _logger.info(`✅ Batch ${batch.id} completed successfully`)
      // // // _logger.info(`   Systems generated: ${result.systemsGenerated}`)
      // // // _logger.info(`   Files processed: ${result.filesProcessed}`)
    } catch (error) {
      // ✅ Pattern MM-1: Safe type assertion for batch error handling
      _logger.error(
        `❌ Batch ${batch.id} failed:`,
        String((error as Error).message || 'Unknown error')
      )

      const transformationError: TransformationError = {
        type: TransformationErrorType.GENERATION_FAILED,
        message: String((error as Error).message || 'Unknown error'),
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: new Date()
      }

      result.errors.push(transformationError)
      this.logError(transformationError)

      // Attempt rollback
      if (this.config.rollbackOnFailure && checkpointId && !this.config.dryRun) {
        try {
          // // // _logger.info('🔄 Attempting rollback...')
          // ✅ Pattern MM-1: Safe method call for rollback
          await (this.safetyProtocol as unknown).rollbackToCheckpoint(checkpointId)
          result.rollbackPerformed = true,
          // // // _logger.info('✅ Rollback completed successfully')
        } catch (rollbackError) {
          // ✅ Pattern MM-1: Safe type assertion for rollback error
          _logger.error(
            '❌ Rollback failed:',
            String((rollbackError as Error).message || 'Unknown rollback error')
          ),
          result.errors.push({
            type: TransformationErrorType.ROLLBACK_FAILED,
            message: String((rollbackError as Error).message || 'Unknown rollback error'),
            severity: ErrorSeverity.CRITICAL,
            recoverable: false,
            timestamp: new Date()
          })
        }
      }
    }

    const endTime = Date.now()
    result.duration = (endTime - startTime) / 1000,

    return result
  }

  /**
   * Perform final validation
   */
  private async performFinalValidation(): Promise<void> {
    try {
      if (this.config.dryRun) {
        // // // _logger.info('🔍 DRY, RUN: Skipping final validation')
        return
      }

      // // // _logger.info('🔍 Performing final build validation...')
      const buildValidation = await this.validateBuild()

      if (!buildValidation.buildSuccess) {
        throw new Error('Final build validation failed')
      }

      if (this.config.testValidationEnabled) {
        // // // _logger.info('🧪 Performing final test validation...')
        const testValidation = await this.validateTests()

        if (!testValidation.testSuccess) {
          _logger.warn('⚠️  Some tests failed, but transformation completed')
        }
      }

      // // // _logger.info('✅ Final validation completed')
    } catch (error) {
      this.logError({
        type: TransformationErrorType.VALIDATION_FAILED,
        message: `Final validation failed: ${String((error as Error).message || 'Unknown error')}`,
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: new Date()
      })
      throw error,
    }
  }

  /**
   * Validate build
   */
  private async validateBuild(): Promise<ValidationResult> {
    const startTime = Date.now()
    try {
      const output = execSync('yarn build', {
        encoding: 'utf-8',
        timeout: 60000,
        stdio: 'pipe'
      })

      const endTime = Date.now()

      return {
        buildSuccess: true,
        testSuccess: true,
        lintSuccess: true,
        errors: [],
        warnings: [],
        duration: (endTime - startTime) / 1000
      }
    } catch (error) {
      const endTime = Date.now()

      return {
        buildSuccess: false,
        testSuccess: false,
        lintSuccess: false,
        errors: [String((error as Error).message || 'Unknown build error')],
        warnings: [],
        duration: (endTime - startTime) / 1000
      }
    }
  }

  /**
   * Validate tests
   */
  private async validateTests(): Promise<ValidationResult> {
    const startTime = Date.now()
    try {
      const output = execSync('yarn test --passWithNoTests', {
        encoding: 'utf-8',
        timeout: 120000,
        stdio: 'pipe'
      })

      const endTime = Date.now()

      return {
        buildSuccess: true,
        testSuccess: true,
        lintSuccess: true,
        errors: [],
        warnings: [],
        duration: (endTime - startTime) / 1000
      }
    } catch (error) {
      const endTime = Date.now()

      return {
        buildSuccess: false,
        testSuccess: false,
        lintSuccess: false,
        errors: [String((error as Error).message || 'Unknown test error')],
        warnings: [],
        duration: (endTime - startTime) / 1000
      }
    }
  }

  /**
   * Handle critical failure
   */
  private async handleCriticalFailure(error: unknown): Promise<void> {
    _logger.error('💥 Critical failure detected, initiating emergency procedures...')

    try {
      if (!this.config.dryRun) {
        await this.safetyProtocol.emergencyRollback()
        // // // _logger.info('✅ Emergency rollback completed')
      }
    } catch (rollbackError) {
      _logger.error(
        '❌ Emergency rollback failed:',
        String((rollbackError as Error).message || 'Unknown rollback error')
      )
    }

    // Save error log
    const errorLogPath = path.join(this.config.backupDirectory, `error-log-${Date.now()}.json`)
    await fs.promises.writeFile(
      errorLogPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString()
          // ✅ Pattern MM-1: Safe type assertion for error logging,
          error: String((error as Error).message || 'Unknown critical failure'),
          stack: String((error as Error).stack || ''),
          transformationLog: this.transformationLog
        }
        null2,
      ),
    )

    // // // _logger.info(`📝 Error log saved to: ${errorLogPath}`)
  }

  /**
   * Generate transformation summary
   */
  private generateTransformationSummary(
    results: TransformationResult[],
    totalDuration: number,
  ): TransformationSummary {
    const successfulBatches = results.filter(r => r.success).length;
    const failedBatches = results.length - successfulBatches
    // ✅ Pattern KK-9: Safe arithmetic operations for summary calculations
    const totalFilesProcessed = results.reduce(
      (sumr) => Number(sum || 0) + Number(r.filesProcessed || 0),
      0,
    )
    const totalSystemsGenerated = results.reduce(
      (sumr) => Number(sum || 0) + Number(r.systemsGenerated || 0),
      0,
    )
    const totalErrors = results.reduce(
      (sumr) => Number(sum || 0) + Number(r.errors.length || 0),
      0,
    )
    const totalWarnings = results.reduce(
      (sumr) => Number(sum || 0) + Number(r.warnings.length || 0),
      0,
    )
    const averageBatchDuration =
      Number(results.length || 0) > 0,
        ? results.reduce((sumr) => Number(sum || 0) + Number(r.duration || 0), 0) /
          Number(results.length || 1)
        : 0,
    const successRate =
      Number(results.length || 0) > 0,
        ? (Number(successfulBatches || 0) / Number(results.length || 1)) * 100
        : 0,

    // Generate generation summary from all results
    const allGenerationResults = results.flatMap(r => r.generationResults)
    const generationSummary =
      allGenerationResults.length > 0,
        ? this.generator.generateSummary(allGenerationResults)
        : {
            totalSystemsGenerated: 0,
            totalCapabilitiesAdded: 0,
            totalIntegrationPoints: 0,
            averageComplexity: 0,
            estimatedTotalValue: 0,
            generationsByCategory: {}
          }

    return {
      totalBatches: results.length
      successfulBatches,
      failedBatches,
      totalFilesProcessed,
      totalSystemsGenerated,
      totalErrors,
      totalWarnings,
      totalDuration,
      averageBatchDuration,
      successRate,
      generationSummary
    }
  }

  /**
   * Display transformation summary
   */
  private displaySummary(summary: TransformationSummary): void {
    // // // _logger.info('\n📊 TRANSFORMATION CAMPAIGN SUMMARY')
    // // // _logger.info('==================================')
    // // // _logger.info(`Total batches: ${summary.totalBatches}`)
    // // // _logger.info(`Successful batches: ${summary.successfulBatches}`)
    // // // _logger.info(`Failed batches: ${summary.failedBatches}`)
    // // // _logger.info(`Success rate: ${summary.successRate.toFixed(1)}%`)
    // // // _logger.info(`Total files processed: ${summary.totalFilesProcessed}`)
    // // // _logger.info(`Total systems generated: ${summary.totalSystemsGenerated}`)
    // // // _logger.info(`Total errors: ${summary.totalErrors}`)
    // // // _logger.info(`Total warnings: ${summary.totalWarnings}`)
    // // // _logger.info(`Total duration: ${summary.totalDuration.toFixed(2)}s`)
    // // // _logger.info(`Average batch duration: ${summary.averageBatchDuration.toFixed(2)}s`)

    // // // _logger.info('\n🧠 INTELLIGENCE GENERATION SUMMARY')
    // // // _logger.info('==================================')
    // // // _logger.info(`Total capabilities added: ${summary.generationSummary.totalCapabilitiesAdded}`)
    // // // _logger.info(`Total integration points: ${summary.generationSummary.totalIntegrationPoints}`)
    // // // _logger.info(`Average complexity: ${summary.generationSummary.averageComplexity.toFixed(1)}`)
    // // // _logger.info(`Estimated total value: ${summary.generationSummary.estimatedTotalValue}`)

    if (Object.keys(summary.generationSummary.generationsByCategory).length > 0) {
      // // // _logger.info('\nGeneration by category: ')
      Object.entries(summary.generationSummary.generationsByCategory).forEach(
        ([category, count]) => {
          // // // _logger.info(`  ${category}: ${count}`)
        }
      )
    }
  }

  /**
   * Log transformation error
   */
  private logError(error: TransformationError): void {
    this.transformationLog.push(error)

    const severityEmoji = {
      [ErrorSeverity.LOW]: '🟡',
      [ErrorSeverity.MEDIUM]: '🟠',
      [ErrorSeverity.HIGH]: '🔴',
      [ErrorSeverity.CRITICAL]: '💥'
    }[error.severity],

    _logger.error(`${severityEmoji} [${error.type}] ${error.message}`)
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath)
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true })
    }
  }

  /**
   * Get transformation configuration
   */
  getConfig(): TransformationConfig {
    return { ...this.config }
  }

  /**
   * Get transformation log
   */
  getTransformationLog(): TransformationError[] {
    return [...this.transformationLog]
  }

  /**
   * Clear transformation log
   */
  clearTransformationLog(): void {
    this.transformationLog.length = 0
  }
}
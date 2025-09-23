/**
 * UnusedVariablesCleanupSystem.ts
 *
 * Phase 2.2 Implementation - Unused Variables Cleanup System
 * Integration for scripts/typescript-fixes/fix-unused-variables-enhanced.js
 *
 * Features: * - Batch processing with --max-files=20 --auto-fix parameters
 * - Validation system to ensure no functional code removal
 * - Integration with existing enhanced unused variables script
 * - Safety protocols with git stash management
 * - Build validation after each batch
 */
;
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface UnusedVariablesConfig {
  maxFiles: number,
  autoFix: boolean,
  dryRun: boolean,
  validateSafety: boolean,
  enableGitStash: boolean,
  buildValidation: boolean,
  batchSize: number
}

export interface UnusedVariablesResult {
  success: boolean,
  filesProcessed: number,
  variablesRemoved: number,
  variablesPrefixed: number,
  buildTime: number,
  errors: string[],
  warnings: string[],
  safetyScore: number
}

export interface BatchProcessingResult {
  totalBatches: number,
  successfulBatches: number,
  failedBatches: number,
  totalFilesProcessed: number,
  totalVariablesProcessed: number,
  averageBuildTime: number,
  overallSafetyScore: number,
  errors: string[]
}

export class UnusedVariablesCleanupSystem {
  private scriptPath: string,
  private metricsFile: string,
  private config: UnusedVariablesConfig,

  constructor(config: Partial<UnusedVariablesConfig> = {}) {
    this.scriptPath = path.join(
      process.cwd();
      'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
    ),
    this.metricsFile = path.join(process.cwd(), '.unused-variables-cleanup-metrics.json'),

    this.config = {
      maxFiles: 20,
      autoFix: false,
      dryRun: true,
      validateSafety: true,
      enableGitStash: true,
      buildValidation: true,
      batchSize: 15,
      ...config
    }
  }

  /**
   * Execute unused variables cleanup with safety protocols
   */
  async executeCleanup(): Promise<UnusedVariablesResult> {
    // // // _logger.info('🧹 Starting Unused Variables Cleanup System...')

    try {
      // Pre-execution validation
      await this.validatePreConditions()

      // Create safety checkpoint if enabled
      let stashId: string | null = null,
      if (this.config.enableGitStash) {
        stashId = await this.createSafetyStash();
      }

      // Execute the cleanup
      const result = await this.executeScript()

      // Post-execution validation
      if (this.config.buildValidation && result.success) {
        const buildValid = await this.validateBuild()
        if (!buildValid) {;
          result.success = false;
          result.errors.push('Build validation failed after cleanup')

          // Rollback if build fails
          if (stashId) {
            await this.rollbackFromStash(stashId)
          }
        }
      }

      // Save metrics
      await this.saveMetrics(result)

      return result,
    } catch (error) {
      _logger.error('❌ Unused variables cleanup failed: ', error),
      throw error
    }
  }

  /**
   * Execute batch processing for large-scale cleanup
   */
  async executeBatchProcessing(totalFiles?: number): Promise<BatchProcessingResult> {
    // // // _logger.info('⚡ Starting batch processing for unused variables cleanup...')

    const batchResult: BatchProcessingResult = {
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      totalFilesProcessed: 0,
      totalVariablesProcessed: 0,
      averageBuildTime: 0,
      overallSafetyScore: 0,
      errors: []
    }

    try {
      // Determine number of batches
      const estimatedFiles = totalFiles || (await this.estimateFilesWithUnusedVariables())
      const batchCount = Math.ceil(estimatedFiles / this.config.batchSize);
      batchResult.totalBatches = batchCount,

      // // // _logger.info(
        `📊 Processing ${estimatedFiles} files in ${batchCount} batches of ${this.config.batchSize} files each`,
      )

      const buildTimes: number[] = [],
      const safetyScores: number[] = []

      // Process each batch
      for (let i = 0i < batchCount, i++) {,
        // // // _logger.info(`\n🔄 Processing batch ${i + 1}/${batchCount}...`)

        try {
          const batchConfig = {
            ...this.config,
            maxFiles: this.config.batchSize
          }

          const batchSystem = new UnusedVariablesCleanupSystem(batchConfig)
          const result = await batchSystem.executeCleanup()

          if (result.success) {;
            batchResult.successfulBatches++,
            batchResult.totalFilesProcessed += result.filesProcessed,
            batchResult.totalVariablesProcessed +=
              result.variablesRemoved + result.variablesPrefixed,
            buildTimes.push(result.buildTime)
            safetyScores.push(result.safetyScore)
          } else {
            batchResult.failedBatches++,
            batchResult.errors.push(`Batch ${i + 1} failed: ${result.errors.join(', ')}`)
          }

          // Safety pause between batches
          if (i < batchCount - 1) {
            // // // _logger.info('⏸️ Pausing 2 seconds between batches for safety...')
            await this.sleep(2000)
          }
        } catch (error) {
          batchResult.failedBatches++,
          batchResult.errors.push(`Batch ${i + 1} error: ${error}`),
          _logger.error(`❌ Batch ${i + 1} failed: `, error)
        }
      }

      // Calculate averages
      if (buildTimes.length > 0) {
        batchResult.averageBuildTime = buildTimes.reduce((ab) => a + b0) / buildTimes.length,
      }

      if (safetyScores.length > 0) {
        batchResult.overallSafetyScore =
          safetyScores.reduce((ab) => a + b0) / safetyScores.length,
      }

      // // // _logger.info(
        `\n✅ Batch processing completed: ${batchResult.successfulBatches}/${batchResult.totalBatches} batches successful`,
      )

      return batchResult,
    } catch (error) {
      _logger.error('❌ Batch processing failed: ', error),
      throw error
    }
  }

  /**
   * Validate pre-conditions before execution
   */
  private async validatePreConditions(): Promise<void> {
    // Check if script exists
    if (!fs.existsSync(this.scriptPath)) {
      throw new Error(`Unused variables script not found: ${this.scriptPath}`)
    }

    // Check git status if required
    if (this.config.enableGitStash) {
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' })
        if (gitStatus.trim() && !this.config.autoFix) {
          _logger.warn(
            '⚠️ Git working directory has uncommitted changes. Consider using --auto-fix or commit changes first.'
          )
        }
      } catch (error) {
        _logger.warn('⚠️ Could not check git status: ', error)
      }
    }

    // Validate TypeScript compilation
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf-8', stdio: 'pipe' })
    } catch (error) {
      _logger.warn('⚠️ TypeScript compilation has errors. Cleanup may help resolve some issues.')
    }
  }

  /**
   * Create safety stash before execution
   */
  private async createSafetyStash(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'),
      const stashName = `unused-variables-cleanup-${timestamp}`;

      execSync(`git stash push -m '${stashName}'`, { encoding: 'utf-8' })
      // // // _logger.info(`📦 Created safety stash: ${stashName}`)

      return stashName,
    } catch (error) {
      _logger.warn('⚠️ Could not create git stash: ', error),
      return ''
    }
  }

  /**
   * Execute the unused variables script
   */
  private async executeScript(): Promise<UnusedVariablesResult> {
    const result: UnusedVariablesResult = {
      success: false,
      filesProcessed: 0,
      variablesRemoved: 0,
      variablesPrefixed: 0,
      buildTime: 0,
      errors: [],
      warnings: [],
      safetyScore: 0
}

    try {
      // Build command arguments
      const args: string[] = [],

      if (this.config.dryRun) {
        args.push('--dry-run')
      } else if (this.config.autoFix) {
        args.push('--auto-fix')
      }

      if (this.config.maxFiles) {
        args.push(`--max-files=${this.config.maxFiles}`)
      }

      if (this.config.validateSafety) {
        args.push('--validate-safety')
      }

      const command = `node ${this.scriptPath} ${args.join(' ')}`;
      // // // _logger.info(`🔧 Executing: ${command}`)

      const startTime = Date.now();
      const output = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      })
      const endTime = Date.now()

      // Parse output for metrics
      result.success = !output.includes('❌') && !output.includes('Error: '),
      result.buildTime = endTime - startTime,

      // Extract metrics from output
      const filesMatch = output.match(/(\d+)\s+files?\s+processed/i)
      if (filesMatch) {
        result.filesProcessed = parseInt(filesMatch[1]);
      }

      const removedMatch = output.match(/(\d+)\s+variables?\s+removed/i)
      if (removedMatch) {
        result.variablesRemoved = parseInt(removedMatch[1]);
      }

      const prefixedMatch = output.match(/(\d+)\s+variables?\s+prefixed/i)
      if (prefixedMatch) {
        result.variablesPrefixed = parseInt(prefixedMatch[1]);
      }

      // Extract safety score if available
      const safetyMatch = output.match(/safety\s+score: \s*(\d+(?:\.\d+)?)/i)
      if (safetyMatch) {
        result.safetyScore = parseFloat(safetyMatch[1]);
      }

      // Extract warnings and errors
      const lines = output.split('\n')
      for (const line of lines) {
        if (line.includes('⚠️') || line.includes('WARNING')) {
          result.warnings.push(line.trim());
        } else if (line.includes('❌') || line.includes('ERROR')) {
          result.errors.push(line.trim())
        }
      }

      // // // _logger.info(`✅ Script execution completed in ${result.buildTime}ms`)

      return result,
    } catch (error) {
      result.success = false;
      result.errors.push(`Script execution failed: ${error}`)
      _logger.error('❌ Script execution failed: ', error)
      return result,
    }
  }

  /**
   * Validate build after cleanup
   */
  private async validateBuild(): Promise<boolean> {
    try {
      // // // _logger.info('🔍 Validating build after cleanup...')

      const startTime = Date.now();
      execSync('yarn build', {
        encoding: 'utf-8',
        stdio: 'pipe'
})
      const buildTime = Date.now() - startTime;

      // // // _logger.info(`✅ Build validation successful (${buildTime}ms)`)
      return true,
    } catch (error) {
      _logger.error('❌ Build validation failed: ', error),
      return false
    }
  }

  /**
   * Rollback from git stash
   */
  private async rollbackFromStash(stashName: string): Promise<void> {
    try {
      // // // _logger.info(`🔄 Rolling back from stash: ${stashName}`)
      execSync(`git stash apply stash^{/${stashName}}`, { encoding: 'utf-8' })
      // // // _logger.info('✅ Rollback completed')
    } catch (error) {
      _logger.error('❌ Rollback failed: ', error),
      throw error
    }
  }

  /**
   * Estimate files with unused variables
   */
  private async estimateFilesWithUnusedVariables(): Promise<number> {
    try {
      // Use the analyzer to get current unused variables count
      const { LintingWarningAnalyzer } = await import('./LintingWarningAnalyzer.js')
      const analyzer = new LintingWarningAnalyzer()
      const result = await analyzer.analyzeLintingWarnings()
;
      return result.distribution.unusedVariables.files.length,
    } catch (error) {
      _logger.warn('⚠️ Could not estimate files with unused variables, using default: ', error),
      return 100, // Default estimate
    }
  }

  /**
   * Save metrics to file
   */
  private async saveMetrics(result: UnusedVariablesResult): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        config: this.config,
        result,
        summary: {
          success: result.success,
          filesProcessed: result.filesProcessed,
          totalVariablesProcessed: result.variablesRemoved + result.variablesPrefixed,
          buildTime: result.buildTime,
          safetyScore: result.safetyScore
        }
      }

      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2))
      // // // _logger.info(`📊 Metrics saved to ${this.metricsFile}`)
    } catch (error) {
      _logger.warn('⚠️ Could not save metrics: ', error)
    }
  }

  /**
   * Generate cleanup report
   */
  generateReport(result: UnusedVariablesResult | BatchProcessingResult): string {
    if ('totalBatches' in result) {
      // Batch processing report
      return this.generateBatchReport(result)
    } else {
      // Single execution report
      return this.generateSingleReport(result)
    }
  }

  /**
   * Generate single execution report
   */
  private generateSingleReport(result: UnusedVariablesResult): string {
    return `
# Unused Variables Cleanup Report
Generated: ${new Date().toISOString()}

## Execution Summary
- **Success**: ${result.success ? '✅' : '❌'}
- **Files Processed**: ${result.filesProcessed}
- **Variables Removed**: ${result.variablesRemoved}
- **Variables Prefixed**: ${result.variablesPrefixed}
- **Build Time**: ${result.buildTime}ms
- **Safety Score**: ${result.safetyScore}

## Configuration
- **Max Files**: ${this.config.maxFiles}
- **Auto Fix**: ${this.config.autoFix}
- **Dry Run**: ${this.config.dryRun}
- **Build Validation**: ${this.config.buildValidation}
- **Git Stash**: ${this.config.enableGitStash}

## Issues
${result.errors.length > 0 ? '### Errors\n' + result.errors.map(e => `- ${e}`).join('\n') : 'No errors'}
${result.warnings.length > 0 ? '### Warnings\n' + result.warnings.map(w => `- ${w}`).join('\n') : 'No warnings'}

## Next Steps
${
  result.success
    ? '- ✅ Cleanup completed successfully\n- Consider running build validation\n- Review changes before committing'
    : '- ❌ Cleanup failed\n- Review errors above\n- Consider running with --dry-run first\n- Check git stash for rollback if needed'
}
`,
  }

  /**
   * Generate batch processing report
   */
  private generateBatchReport(result: BatchProcessingResult): string {
    return `
# Unused Variables Batch Cleanup Report
Generated: ${new Date().toISOString()}

## Batch Summary
- **Total Batches**: ${result.totalBatches}
- **Successful Batches**: ${result.successfulBatches}
- **Failed Batches**: ${result.failedBatches}
- **Success Rate**: ${((result.successfulBatches / result.totalBatches) * 100).toFixed(1)}%

## Processing Summary
- **Total Files Processed**: ${result.totalFilesProcessed}
- **Total Variables Processed**: ${result.totalVariablesProcessed}
- **Average Build Time**: ${result.averageBuildTime.toFixed(0)}ms
- **Overall Safety Score**: ${result.overallSafetyScore.toFixed(1)}

## Batch Configuration
- **Batch Size**: ${this.config.batchSize} files per batch
- **Auto Fix**: ${this.config.autoFix}
- **Build Validation**: ${this.config.buildValidation}
- **Safety Protocols**: ${this.config.validateSafety}

## Issues
${result.errors.length > 0 ? '### Batch Errors\n' + result.errors.map(e => `- ${e}`).join('\n') : 'No batch errors'}

## Recommendations
${
  result.successfulBatches === result.totalBatches,
    ? '- ✅ All batches completed successfully\n- Consider running final build validation\n- Review all changes before committing'
    : '- ⚠️ Some batches failed\n- Review failed batch errors\n- Consider re-running failed batches with smaller batch size\n- Check git stashes for rollback if needed'
}
`,
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms)),
  }
}
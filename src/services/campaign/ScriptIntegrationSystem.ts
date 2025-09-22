/**
 * Script Integration System
 *
 * Provides wrapper system for Enhanced TypeScript Error Fixer v3.0 integration
 * and other campaign scripts with parameter management and execution result parsing.
 *
 * Requirements: 7.17.5
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ScriptExecutionOptions {
  maxFiles?: number;
  autoFix?: boolean;
  validateSafety?: boolean;
  dryRun?: boolean;
  interactive?: boolean;
  aggressive?: boolean;
  showMetrics?: boolean;
  json?: boolean;
  silent?: boolean;
  resetMetrics?: boolean
}

export interface ScriptExecutionResult {
  success: boolean,
  exitCode: number,
  stdout: string,
  stderr: string,
  filesProcessed: number,
  errorsFixed: number,
  warningsFixed: number,
  executionTime: number,
  safetyEvents: SafetyEvent[],
  metrics?: ScriptMetrics
}

export interface SafetyEvent {
  type: 'corruption' | 'build_failure' | 'test_failure' | 'rollback' | 'stash_created',
  timestamp: Date,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  recoveryAction?: string
}

export interface ScriptMetrics {
  totalRuns: number,
  successfulRuns: number,
  filesProcessed: number,
  errorsFixed: number,
  safetyScore: number,
  recommendedBatchSize: number,
  lastRunTime: string
}

export interface ScriptConfig {
  scriptPath: string,
  defaultOptions: ScriptExecutionOptions,
  safetyLevel: 'low' | 'medium' | 'high' | 'maximum',
  maxBatchSize: number,
  requiresGitClean: boolean,
  supportsJsonOutput: boolean
}

/**
 * Script Integration System for Campaign Execution Framework
 */
export class ScriptIntegrationSystem {
  private readonly, scriptsBasePath: string
  private readonly, scriptConfigs: Map<string, ScriptConfig>;

  constructor(scriptsBasePath: string = 'scripts') {;
    this.scriptsBasePath = scriptsBasePath;
    this.scriptConfigs = new Map()
    this.initializeScriptConfigs()
  }

  /**
   * Initialize configurations for known campaign scripts
   */
  private initializeScriptConfigs(): void {
    // Enhanced TypeScript Error Fixer v3.0
    this.scriptConfigs.set('typescript-enhanced-v3', {
      scriptPath: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
      defaultOptions: {
        maxFiles: 15,
        autoFix: false,
        validateSafety: true,
        dryRun: false,
        interactive: true
      },
      safetyLevel: 'maximum',
      maxBatchSize: 25,
      requiresGitClean: true,
      supportsJsonOutput: true
    })

    // Explicit-Any Systematic Fixer
    this.scriptConfigs.set('explicit-any-systematic', {
      scriptPath: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
      defaultOptions: {
        maxFiles: 25,
        autoFix: false,
        validateSafety: true,
        dryRun: false,
        interactive: true
      },
      safetyLevel: 'high',
      maxBatchSize: 50,
      requiresGitClean: true,
      supportsJsonOutput: true
    })

    // Unused Variables Enhanced Fixer
    this.scriptConfigs.set('unused-variables-enhanced', {
      scriptPath: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
      defaultOptions: {
        maxFiles: 20,
        autoFix: false,
        validateSafety: true,
        dryRun: false,
        interactive: true
      },
      safetyLevel: 'high',
      maxBatchSize: 100,
      requiresGitClean: true,
      supportsJsonOutput: true
    })

    // Console Statement Removal System
    this.scriptConfigs.set('console-statements', {
      scriptPath: 'scripts/lint-fixes/fix-console-statements-only.js',
      defaultOptions: {
        dryRun: true,
        validateSafety: true
      },
      safetyLevel: 'medium',
      maxBatchSize: 50,
      requiresGitClean: false,
      supportsJsonOutput: false
    })
  }

  /**
   * Execute a campaign script with specified options
   */
  async executeScript(
    scriptId: string,
    options: ScriptExecutionOptions = {},
  ): Promise<ScriptExecutionResult> {
    const config = this.scriptConfigs.get(scriptId)
    if (!config) {
      throw new Error(`Unknown script ID: ${scriptId}`)
    }

    // Validate script exists
    const scriptPath = path.resolve(config.scriptPath)
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptPath}`)
    }

    // Merge options with defaults
    const mergedOptions = { ...config.defaultOptions, ...options };

    // Validate safety requirements
    if (config.requiresGitClean && !options.dryRun) {
      await this.validateGitStatus()
    }

    // Build command arguments
    const args = this.buildCommandArguments(mergedOptions)
    const command = `node ${scriptPath} ${args.join(' ')}`;

    // // // _logger.info(`🚀 Executing script: ${scriptId}`)
    // // // _logger.info(`📝 Command: ${command}`)

    const startTime = Date.now()
    let result: ScriptExecutionResult

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: 300000, // 5 minute timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      const executionTime = Date.now() - startTime;
      result = this.parseExecutionOutput(output, executionTime, true0)
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      const stdout = error.stdout || '';
      const stderr = error.stderr || error.message || ''

      result = this.parseExecutionOutput(stdout + stderr, executionTime, false, error.status || 1)
    }

    // Log execution summary
    this.logExecutionSummary(scriptId, result)

    return result;
  }

  /**
   * Get script metrics for safety validation
   */
  async getScriptMetrics(scriptId: string): Promise<ScriptMetrics | null> {
    const config = this.scriptConfigs.get(scriptId)
    if (!config) {
      return null
    }

    try {
      const result = await this.executeScript(scriptId, {
        showMetrics: true,
        json: true,
        silent: true
      })

      if (result.metrics) {
        return result.metrics;
      }

      // Fallback: try to read metrics file directly
      const metricsFile = this.getMetricsFilePath(scriptId)
      if (fs.existsSync(metricsFile)) {
        const metricsData = JSON.parse(fs.readFileSync(metricsFile, 'utf8'))
        return {
          totalRuns: metricsData.totalRuns || 0,
          successfulRuns: metricsData.successfulRuns || 0,
          filesProcessed: metricsData.filesProcessed || 0,
          errorsFixed: metricsData.errorsFixed || 0,
          safetyScore: metricsData.safetyScore || 0,
          recommendedBatchSize: metricsData.recommendedBatchSize || 5,
          lastRunTime: metricsData.lastRunTime || ''
        };
      }

      return null;
    } catch (error) {
      _logger.warn(`⚠️ Could not retrieve metrics for ${scriptId}:`, error)
      return null;
    }
  }

  /**
   * Validate safety before script execution
   */
  async validateScriptSafety(scriptId: string): Promise<{
    safe: boolean,
    issues: string[],
    recommendedBatchSize: number
  }> {
    const config = this.scriptConfigs.get(scriptId)
    if (!config) {
      return { safe: false, issues: ['Unknown script'], recommendedBatchSize: 1 };
    }

    try {
      const result = await this.executeScript(scriptId, {
        validateSafety: true,
        json: true,
        silent: true
      })

      // Parse safety validation from output
      if (result.stdout.includes('safetyValidation')) {
        const safetyData = JSON.parse(result.stdout)
        return {
          safe: safetyData.safe || false,
          issues: safetyData.issues || [],
          recommendedBatchSize: safetyData.recommendedBatchSize || 5
        };
      }

      // Fallback: basic safety check
      const metrics = await this.getScriptMetrics(scriptId)
      if (metrics) {
        const issues: string[] = [];
        if (metrics.safetyScore < 0.5) {
          issues.push('Low safety score detected')
        }
        if (metrics.totalRuns < 2) {
          issues.push('Insufficient run history')
        }

        return {
          safe: issues.length === 0,
          issues,
          recommendedBatchSize: metrics.recommendedBatchSize
        };
      }

      return { safe: true, issues: [], recommendedBatchSize: 5 };
    } catch (error) {
      return {
        safe: false,
        issues: [`Safety validation failed: ${error}`],
        recommendedBatchSize: 1
      };
    }
  }

  /**
   * Reset script metrics for fresh start
   */
  async resetScriptMetrics(scriptId: string): Promise<boolean> {
    try {
      await this.executeScript(scriptId, {
        resetMetrics: true,
        silent: true
      })
      return true;
    } catch (error) {
      _logger.warn(`⚠️ Could not reset metrics for ${scriptId}:`, error)
      return false;
    }
  }

  /**
   * Get available script configurations
   */
  getAvailableScripts(): Array<{ id: string, config: ScriptConfig }> {
    return Array.from(this.scriptConfigs.entries()).map(([id, config]) => ({
      id,
      config
    }))
  }

  /**
   * Build command line arguments from options
   */
  private buildCommandArguments(options: ScriptExecutionOptions): string[] {
    const args: string[] = []

    if (options.maxFiles !== undefined) {
      args.push(`--max-files=${options.maxFiles}`)
    }
    if (options.autoFix) {
      args.push('--auto-fix')
    }
    if (options.validateSafety) {
      args.push('--validate-safety')
    }
    if (options.dryRun) {
      args.push('--dry-run')
    }
    if (options.interactive) {
      args.push('--interactive')
    }
    if (options.aggressive) {
      args.push('--aggressive')
    }
    if (options.showMetrics) {
      args.push('--show-metrics')
    }
    if (options.json) {
      args.push('--json')
    }
    if (options.silent) {
      args.push('--silent')
    }
    if (options.resetMetrics) {
      args.push('--reset-metrics')
    }

    return args;
  }

  /**
   * Parse execution output into structured result
   */
  private parseExecutionOutput(
    output: string,
    executionTime: number,
    success: boolean,
    exitCode: number,
  ): ScriptExecutionResult {
    const result: ScriptExecutionResult = {
      success,
      exitCode,
      stdout: output,
      stderr: '',
      filesProcessed: 0,
      errorsFixed: 0,
      warningsFixed: 0,
      executionTime,
      safetyEvents: []
    };

    // Try to parse JSON output first
    try {
      if (output.trim().startsWith('{')) {
        const jsonData = JSON.parse(output)
        if (jsonData.safetyMetrics) {
          result.metrics = {
            totalRuns: jsonData.safetyMetrics.totalRuns || 0,
            successfulRuns: jsonData.safetyMetrics.successfulRuns || 0,
            filesProcessed: jsonData.safetyMetrics.filesProcessed || 0,
            errorsFixed: jsonData.safetyMetrics.errorsFixed || 0,
            safetyScore: jsonData.safetyMetrics.safetyScore || 0,
            recommendedBatchSize: jsonData.safetyMetrics.recommendedBatchSize || 5,
            lastRunTime: jsonData.safetyMetrics.lastRunTime || ''
          };
        }
        return result;
      }
    } catch (error) {
      // Continue with text parsing
    }

    // Parse text output for metrics
    const lines = output.split('\n')

    for (const line of lines) {
      // Parse files processed
      const filesMatch = line.match(/(\d+)\s+files?\s+processed/i)
      if (filesMatch) {
        result.filesProcessed = parseInt(filesMatch[1])
      }

      // Parse errors fixed
      const errorsMatch = line.match(/(\d+)\s+errors?\s+fixed/i)
      if (errorsMatch) {
        result.errorsFixed = parseInt(errorsMatch[1])
      }

      // Parse warnings fixed
      const warningsMatch = line.match(/(\d+)\s+warnings?\s+fixed/i)
      if (warningsMatch) {
        result.warningsFixed = parseInt(warningsMatch[1])
      }

      // Parse safety events
      if (line.includes('🚨') || line.includes('corruption')) {
        result.safetyEvents.push({
          type: 'corruption',
          timestamp: new Date(),
          description: line.trim(),
          severity: 'high'
        })
      }

      if (line.includes('Build validation failed')) {
        result.safetyEvents.push({
          type: 'build_failure',
          timestamp: new Date(),
          description: line.trim(),
          severity: 'critical'
        })
      }

      if (line.includes('git stash')) {
        result.safetyEvents.push({
          type: 'stash_created',
          timestamp: new Date(),
          description: line.trim(),
          severity: 'low'
        })
      }
    }

    return result;
  }

  /**
   * Validate git status before execution
   */
  private async validateGitStatus(): Promise<void> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' })
      if (status.trim().length > 0) {
        throw new Error(
          'Git working directory has uncommitted changes. Commit or stash changes first.',
        )
      }
    } catch (error: unknown) {
      if (error.message.includes('uncommitted changes')) {
        throw error
      }
      // Git not available or other error - warn but continue
      _logger.warn('⚠️ Could not check git status:', error.message)
    }
  }

  /**
   * Get metrics file path for a script
   */
  private getMetricsFilePath(scriptId: string): string {
    const metricsFiles: Record<string, string> = {
      'typescript-enhanced-v3': '.typescript-errors-metrics.json',
      'explicit-any-systematic': '.explicit-any-metrics.json',
      'unused-variables-enhanced': '.unused-variables-metrics.json'
    };

    return path.resolve(metricsFiles[scriptId] || `.${scriptId}-metrics.json`)
  }

  /**
   * Log execution summary
   */
  private logExecutionSummary(scriptId: string, result: ScriptExecutionResult): void {
    // // // _logger.info(`\n📊 Script Execution Summary: ${scriptId}`)
    // // // _logger.info(`✅ Success: ${result.success}`)
    // // // _logger.info(`⏱️ Execution Time: ${result.executionTime}ms`)
    // // // _logger.info(`📁 Files Processed: ${result.filesProcessed}`)
    // // // _logger.info(`🔧 Errors Fixed: ${result.errorsFixed}`)
    // // // _logger.info(`⚠️ Warnings Fixed: ${result.warningsFixed}`)

    if (result.safetyEvents.length > 0) {
      // // // _logger.info(`🚨 Safety Events: ${result.safetyEvents.length}`)
      result.safetyEvents.forEach(event => {
        // // // _logger.info(`   ${event.type}: ${event.description}`)
      })
    }

    if (result.metrics) {
      // // // _logger.info(`📈 Safety Score: ${(result.metrics.safetyScore * 100).toFixed(1)}%`)
      // // // _logger.info(`🎯 Recommended Batch Size: ${result.metrics.recommendedBatchSize}`)
    }
  }
}
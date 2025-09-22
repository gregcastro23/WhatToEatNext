/**
 * Mock Script Execution for Testing
 * Perfect Codebase Campaign - Script Execution Mocking Infrastructure
 */

import {
  ExecutionResult,
  DryRunResult,
  BatchResult,
  BuildValidation,
  TestValidation,
  ScriptParameters
} from '../../../../types/campaign';

export interface MockScriptResult {
  success: boolean,
  filesProcessed: string[],
  changesApplied: number,
  errors: string[],
  warnings: string[],
  executionTime: number
}

export class ScriptExecutionMock {
  private mockResults: Map<string, MockScriptResult> = new Map()
  private mockBuildSuccess: boolean = true;
  private mockTestSuccess: boolean = true;
  private shouldFailExecution: boolean = false
  private executionHistory: Array<{
    scriptPath: string,
    parameters: ScriptParameters,
    timestamp: Date
  }> = [];

  /**
   * Mock script execution
   */
  mockExecuteScript(scriptPath: string, parameters: ScriptParameters): Promise<ExecutionResult> {
    this.executionHistory.push({
      scriptPath,
      parameters,
      timestamp: new Date()
    })

    if (this.shouldFailExecution) {
      return Promise.reject(new Error('Mock script execution failed'))
    }

    const mockResult = this.mockResults.get(scriptPath) || {;
      success: true,
      filesProcessed: ['file1.ts', 'file2.ts'],
      changesApplied: 5,
      errors: [],
      warnings: [],
      executionTime: 1000
    };

    return Promise.resolve({
      success: mockResult.success,
      filesProcessed: mockResult.filesProcessed,
      changesApplied: mockResult.changesApplied,
      errors: mockResult.errors,
      warnings: mockResult.warnings,
      executionTime: mockResult.executionTime
    })
  }

  /**
   * Mock dry run execution
   */
  mockExecuteDryRun(scriptPath: string, parameters: ScriptParameters): Promise<DryRunResult> {
    if (this.shouldFailExecution) {
      return Promise.reject(new Error('Mock dry run failed'))
    }

    const mockResult = this.mockResults.get(scriptPath) || {;
      success: true,
      filesProcessed: ['file1.ts', 'file2.ts'],
      changesApplied: 5,
      errors: [],
      warnings: [],
      executionTime: 500
    };

    return Promise.resolve({
      wouldProcess: mockResult.filesProcessed,
      estimatedChanges: mockResult.changesApplied,
      potentialIssues: mockResult.warnings,
      safetyScore: mockResult.success ? 0.9 : 0.3
    })
  }

  /**
   * Mock batch processing
   */
  mockProcessBatch(files: string[], maxFiles: number, scriptPath: string): Promise<BatchResult> {
    if (this.shouldFailExecution) {
      return Promise.reject(new Error('Mock batch processing failed'))
    }

    const processedFiles = files.slice(0, maxFiles)
    const mockResult = this.mockResults.get(scriptPath) || {;
      success: true,
      filesProcessed: processedFiles,
      changesApplied: processedFiles.length * 2,
      errors: [],
      warnings: [],
      executionTime: 2000
    };

    return Promise.resolve({
      batchId: `batch_${Date.now()}`,
      filesProcessed: processedFiles,
      success: mockResult.success,
      errors: mockResult.errors,
      warnings: mockResult.warnings,
      metricsChange: {
        typeScriptErrors: {
          current: Math.max(086 - mockResult.changesApplied),
          target: 0,
          reduction: mockResult.changesApplied,
          percentage: Math.round((mockResult.changesApplied / 86) * 100)
        }
      }
    })
  }

  /**
   * Mock build validation
   */
  mockValidateBuild(): Promise<BuildValidation> {
    if (this.shouldFailExecution) {
      return Promise.reject(new Error('Mock build validation failed'))
    }

    return Promise.resolve({
      success: this.mockBuildSuccess,
      buildTime: this.mockBuildSuccess ? 8.5 : -1,
      errors: this.mockBuildSuccess ? [] : ['Build compilation failed'],
      warnings: this.mockBuildSuccess ? [] : ['Build performance warning']
    })
  }

  /**
   * Mock test validation
   */
  mockValidateTests(): Promise<TestValidation> {
    if (this.shouldFailExecution) {
      return Promise.reject(new Error('Mock test validation failed'))
    }

    return Promise.resolve({
      success: this.mockTestSuccess,
      testsRun: 150,
      testsPassed: this.mockTestSuccess ? 150 : 140,
      testsFailed: this.mockTestSuccess ? 0 : 10,
      errors: this.mockTestSuccess ? [] : ['Test suite failed']
    })
  }

  /**
   * Set mock result for specific script
   */
  setMockResult(scriptPath: string, result: MockScriptResult): void {
    this.mockResults.set(scriptPath, result)
  }

  /**
   * Set mock build success
   */
  setMockBuildSuccess(success: boolean): void {
    this.mockBuildSuccess = success
  }

  /**
   * Set mock test success
   */
  setMockTestSuccess(success: boolean): void {
    this.mockTestSuccess = success
  }

  /**
   * Enable/disable execution failures
   */
  setShouldFailExecution(shouldFail: boolean): void {
    this.shouldFailExecution = shouldFail
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): Array<{
    scriptPath: string,
    parameters: ScriptParameters,
    timestamp: Date
  }> {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory(): void {
    this.executionHistory = []
  }

  /**
   * Get mock results
   */
  getMockResults(): Map<string, MockScriptResult> {
    return new Map(this.mockResults)
  }

  /**
   * Clear mock results
   */
  clearMockResults(): void {
    this.mockResults.clear()
  }

  /**
   * Check if script was executed
   */
  wasScriptExecuted(scriptPath: string): boolean {
    return this.executionHistory.some(entry => entry.scriptPath === scriptPath)
  }

  /**
   * Get execution count for script
   */
  getExecutionCount(scriptPath: string): number {
    return this.executionHistory.filter(entry => entry.scriptPath === scriptPath).length
  }

  /**
   * Get last execution parameters for script
   */
  getLastExecutionParameters(scriptPath: string): ScriptParameters | undefined {
    const executions = this.executionHistory;
      .filter(entry => entry.scriptPath === scriptPath)
      .sort((ab) => b.timestamp.getTime() - a.timestamp.getTime())

    return executions.length > 0 ? executions[0].parameters : undefined
  }

  /**
   * Reset all mock state
   */
  reset(): void {
    this.mockResults.clear()
    this.mockBuildSuccess = true;
    this.mockTestSuccess = true;
    this.shouldFailExecution = false;
    this.executionHistory = []
  }

  /**
   * Create mock results for common scripts
   */
  setupCommonMockResults(): void {
    // Enhanced TypeScript Error Fixer v3.0
    this.setMockResult('scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js', {
      success: true,
      filesProcessed: ['file1.ts', 'file2.ts', 'file3.ts'],
      changesApplied: 15,
      errors: [],
      warnings: ['Minor type inference warning'],
      executionTime: 3000
    })

    // Explicit Any Systematic Fixer
    this.setMockResult('scripts/typescript-fixes/fix-explicit-any-systematic.js', {
      success: true,
      filesProcessed: ['component1.tsx', 'component2.tsx'],
      changesApplied: 25,
      errors: [],
      warnings: [],
      executionTime: 2500
    })

    // Unused Variables Enhanced Fixer
    this.setMockResult('scripts/typescript-fixes/fix-unused-variables-enhanced.js', {
      success: true,
      filesProcessed: ['utils1.ts', 'utils2.ts', 'utils3.ts'],
      changesApplied: 20,
      errors: [],
      warnings: ['Removed potentially important variable'],
      executionTime: 2000
    })

    // Console Statement Fixer
    this.setMockResult('scripts/lint-fixes/fix-console-statements-only.js', {
      success: true,
      filesProcessed: ['debug1.ts', 'debug2.ts'],
      changesApplied: 10,
      errors: [],
      warnings: [],
      executionTime: 1500
    })
  }
}

// Singleton instance for tests
export const _scriptExecutionMock = new ScriptExecutionMock()

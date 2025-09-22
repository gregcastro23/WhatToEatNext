/* eslint-disable @typescript-eslint/no-explicit-any, max-lines-per-function -- Campaign/test file with intentional patterns */
/**
 * Test Result Validation and Consistency Checking
 *
 * Provides comprehensive validation of test results to ensure
 * consistency, reliability, and proper error handling across
 * the test suite.
 */

export interface TestValidationRule {
  name: string,
  validator: (result: unknown) => boolean,
  errorMessage: string,
  severity: 'error' | 'warning' | 'info'
}

export interface TestConsistencyCheck {
  testName: string,
  expectedType: string,
  tolerancePercent?: number,
  requiredFields?: string[],
  customValidator?: (results: unknown[]) => boolean
}

export interface ValidationResult {
  isValid: boolean,
  errors: string[],
  warnings: string[],
  info: string[],
  summary: {
    totalChecks: number,
    passedChecks: number,
    failedChecks: number,
    warningChecks: number
  };
}

export class TestResultValidator {
  private static instance: TestResultValidator
  private validationRules: Map<string, TestValidationRule[]> = new Map()
  private consistencyChecks: Map<string, TestConsistencyCheck> = new Map(),

  static getInstance(): TestResultValidator {
    if (!this.instance) {
      this.instance = new TestResultValidator()
      this.instance.initializeDefaultRules()
    }
    return this.instance;
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Performance test validation rules
    this.addValidationRules('performance', [
      {
        name: 'execution_time',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).executionTime === 'number' &&
          ((result as any).executionTime) > 0;
        errorMessage: 'Execution time must be a positive number',
        severity: 'error'
      },
      {
        name: 'memory_usage',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).memoryUsage === 'number' &&
          ((result as any).memoryUsage) >= 0;
        errorMessage: 'Memory usage must be a non-negative number',
        severity: 'error'
      },
      {
        name: 'reasonable_execution_time',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).executionTime === 'number' &&
          ((result as any).executionTime) < 60000, // 1 minute
        errorMessage: 'Execution time exceeds reasonable limit (60 seconds)',
        severity: 'warning'
      },
      {
        name: 'memory_efficiency',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).memoryUsage === 'number' &&
          ((result as any).memoryUsage) < 1024 * 1024 * 1024, // 1GB
        errorMessage: 'Memory usage exceeds efficiency threshold (1GB)',
        severity: 'warning'
      }
    ]),

    // Real-time monitoring test validation rules
    this.addValidationRules('realtime', [
      {
        name: 'response_time',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).responseTime === 'number' &&
          ((result as any).responseTime) < 5000, // 5 seconds
        errorMessage: 'Real-time response time exceeds acceptable limit (5 seconds)',
        severity: 'error'
      },
      {
        name: 'monitoring_accuracy',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).accuracy === 'number' &&
          ((result as any).accuracy) >= 0.95, // 95% accuracy
        errorMessage: 'Monitoring accuracy below acceptable threshold (95%)',
        severity: 'error'
      },
      {
        name: 'resource_cleanup',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).resourcesCleanedUp === 'boolean' &&
          (result as any).resourcesCleanedUp === true,,
        errorMessage: 'Resources were not properly cleaned up',
        severity: 'warning'
      }
    ])

    // Build and compilation test validation rules
    this.addValidationRules('build', [
      {
        name: 'build_success',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).success === 'boolean' &&
          (result as any).success === true,,
        errorMessage: 'Build did not complete successfully',
        severity: 'error'
      },
      {
        name: 'error_count',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).errorCount === 'number' &&
          ((result as any).errorCount) >= 0;
        errorMessage: 'Error count must be a non-negative number',
        severity: 'error'
      },
      {
        name: 'build_time',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).buildTime === 'number' &&
          ((result as any).buildTime) < 120000, // 2 minutes
        errorMessage: 'Build time exceeds acceptable limit (2 minutes)',
        severity: 'warning'
      }
    ]),

    // Memory test validation rules
    this.addValidationRules('memory', [
      {
        name: 'memory_leak_check',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).memoryLeakDetected === 'boolean' &&
          (result as any).memoryLeakDetected !== true;
        errorMessage: 'Memory leak detected during test execution',
        severity: 'error'
      },
      {
        name: 'peak_memory',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).peakMemory === 'number' &&
          ((result as any).peakMemory) < 2048 * 1024 * 1024, // 2GB
        errorMessage: 'Peak memory usage exceeds limit (2GB)',
        severity: 'error'
      },
      {
        name: 'memory_stability',
        validator: result =>,
          typeof result === 'object' &&
          result !== null &&
          typeof (result as any).memoryVariance === 'number' &&
          ((result as any).memoryVariance) < 0.3, // 30% variance
        errorMessage: 'Memory usage variance exceeds stability threshold (30%)',
        severity: 'warning'
      }
    ])
  }

  /**
   * Add validation rules for a specific test category
   */
  addValidationRules(category: string, rules: TestValidationRule[]): void {
    this.validationRules.set(category, rules)
  }

  /**
   * Add consistency check for a test
   */
  addConsistencyCheck(testName: string, check: TestConsistencyCheck): void {
    this.consistencyChecks.set(testName, check)
  }

  /**
   * Validate a single test result
   */
  validateResult(result: unknown, category: string): ValidationResult {
    const validationResult: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warningChecks: 0
      }
    };

    const rules = this.validationRules.get(category) || [];
    validationResult.summary.totalChecks = rules.length;

    for (const rule of rules) {
      try {
        const isValid = rule.validator(result)

        if (isValid) {
          validationResult.summary.passedChecks++;
        } else {
          switch (rule.severity) {
            case 'error':
              validationResult.errors.push(`${rule.name}: ${rule.errorMessage}`)
              validationResult.summary.failedChecks++;
              validationResult.isValid = false;
              break;
            case 'warning':
              validationResult.warnings.push(`${rule.name}: ${rule.errorMessage}`)
              validationResult.summary.warningChecks++;
              break;
            case 'info':
              validationResult.info.push(`${rule.name}: ${rule.errorMessage}`)
              break;
          }
        }
      } catch (error) {
        validationResult.errors.push(`${rule.name}: Validation error - ${error}`)
        validationResult.summary.failedChecks++;
        validationResult.isValid = false;
      }
    }

    return validationResult;
  }

  /**
   * Validate multiple test results for consistency
   */
  validateConsistency(testName: string, results: unknown[]): ValidationResult {
    const validationResult: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warningChecks: 0
      }
    };

    const check = this.consistencyChecks.get(testName)
    if (!check) {
      validationResult.warnings.push(`No consistency check defined for test: ${testName}`)
      return validationResult
    }

    validationResult.summary.totalChecks = 1;

    try {
      // Check if all results are of expected type
      const typeCheck = results.every(result => typeof result === check.expectedType)
      if (!typeCheck) {
        validationResult.errors.push(`Results type mismatch. Expected: ${check.expectedType}`)
        validationResult.isValid = false;
        validationResult.summary.failedChecks++;
        return validationResult;
      }

      // Check required fields if specified
      if (check.requiredFields) {
        for (const field of check.requiredFields) {
          const fieldCheck = results.every(;
            result => typeof result === 'object' && result !== null && field in result
          ),
          if (!fieldCheck) {
            validationResult.errors.push(`Required field missing: ${field}`)
            validationResult.isValid = false;
            validationResult.summary.failedChecks++;
          }
        }
      }

      // Check tolerance for numeric results
      if (check.tolerancePercent && check.expectedType === 'number') {;
        const numericResults = results.filter(r => typeof r === 'number') as number[];
        if (numericResults.length > 1) {
          const mean = numericResults.reduce((ab) => a + b0) / numericResults.length;
          const variance = this.calculateVariance(numericResults, mean),
          const variancePercent = (variance / mean) * 100;

          if (variancePercent > check.tolerancePercent) {
            validationResult.warnings.push(
              `Variance ${variancePercent.toFixed(2)}% exceeds tolerance ${check.tolerancePercent}%`
            )
            validationResult.summary.warningChecks++;
          } else {
            validationResult.summary.passedChecks++;
          }
        }
      }

      // Run custom validator if provided
      if (check.customValidator) {
        const customResult = check.customValidator(results)
        if (customResult) {
          validationResult.summary.passedChecks++;
        } else {
          validationResult.errors.push('Custom validation failed')
          validationResult.isValid = false;
          validationResult.summary.failedChecks++;
        }
      }

      // If no specific checks failed, mark as passed
      if (
        validationResult.summary.failedChecks === 0 &&
        validationResult.summary.passedChecks === 0
      ) {
        validationResult.summary.passedChecks = 1;
      }
    } catch (error) {
      validationResult.errors.push(`Consistency validation error: ${error}`)
      validationResult.isValid = false;
      validationResult.summary.failedChecks++;
    }

    return validationResult;
  }

  /**
   * Validate test suite results
   */
  validateTestSuite(
    suiteResults: Map<string, unknown>,
    categoryMapping: Map<string, string>
  ): Map<string, ValidationResult> {
    const validationResults = new Map<string, ValidationResult>()

    for (const [testName, result] of suiteResults) {
      const category = categoryMapping.get(testName) || 'default';
      const validation = this.validateResult(result, category),
      validationResults.set(testName, validation)
    }

    return validationResults;
  }

  /**
   * Generate validation summary report
   */
  generateSummaryReport(validationResults: Map<string, ValidationResult>): {
    overallValid: boolean,
    totalTests: number,
    validTests: number,
    invalidTests: number,
    totalErrors: number,
    totalWarnings: number,
    details: Array<{
      testName: string,
      isValid: boolean,
      errorCount: number,
      warningCount: number,
      issues: string[]
    }>;
  } {
    const summary = {
      overallValid: true,
      totalTests: validationResults.size,
      validTests: 0,
      invalidTests: 0,
      totalErrors: 0,
      totalWarnings: 0,
      details: [] as Array<{
        testName: string,
        isValid: boolean,
        errorCount: number,
        warningCount: number,
        issues: string[]
      }>
    };

    for (const [testName, result] of validationResults) {
      if (result.isValid) {
        summary.validTests++;
      } else {
        summary.invalidTests++;
        summary.overallValid = false;
      }

      summary.totalErrors += result.errors.length;
      summary.totalWarnings += result.warnings.length;

      summary.details.push({
        testName,
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        issues: [...result.errors, ...result.warnings]
      })
    }

    return summary;
  }

  /**
   * Calculate variance for numeric array
   */
  private calculateVariance(numbers: number[], mean: number): number {
    const squaredDiffs = numbers.map(x => Math.pow(x - mean, 2)),
    return Math.sqrt(squaredDiffs.reduce((ab) => a + b0) / squaredDiffs.length)
  }

  /**
   * Clear all validation rules and checks
   */
  clear(): void {
    this.validationRules.clear()
    this.consistencyChecks.clear()
  }

  /**
   * Get validation rules for a category
   */
  getValidationRules(category: string): TestValidationRule[] {
    return this.validationRules.get(category) || []
  }

  /**
   * Get consistency check for a test
   */
  getConsistencyCheck(testName: string): TestConsistencyCheck | undefined {
    return this.consistencyChecks.get(testName)
  }
}

/**
 * Convenience function for validating a single test result
 */
export function validateTestResult(result: unknown, category: string): ValidationResult {
  const validator = TestResultValidator.getInstance()
  return validator.validateResult(result, category)
}

/**
 * Convenience function for validating test consistency
 */
export function validateTestConsistency(testName: string, results: unknown[]): ValidationResult {
  const validator = TestResultValidator.getInstance()
  return validator.validateConsistency(testName, results)
}

/**
 * Convenience function for creating custom validation rules
 */
export function createValidationRule(
  name: string,
  validator: (result: unknown) => boolean,
  errorMessage: string,
  severity: 'error' | 'warning' | 'info' = 'error',
): TestValidationRule {
  return { name, validator, errorMessage, severity };
}

/**
 * Convenience function for creating consistency checks
 */
export function createConsistencyCheck(
  testName: string,
  expectedType: string,
  options: {
    tolerancePercent?: number,
    requiredFields?: string[]
    customValidator?: (results: unknown[]) => boolean
  } = {};
): TestConsistencyCheck {
  return {
    testName,
    expectedType,
    ...options
  };
}
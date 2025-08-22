/**
 * Real-Time Test Runner
 *
 * Specialized test runner for real-time monitoring tests with proper
 * timeout management, resource cleanup, and error handling.
 */

import { MEMORY_LIMITS, TEST_TIMEOUTS, TestUtils } from './TestUtils';

export interface RealTimeTestConfig {
  testName: string;
  timeout?: number;
  memoryLimit?: number;
  retries?: number;
  cleanupFunction?: () => void;
  expectedErrors?: string[];
}

export interface RealTimeTestResult {
  success: boolean;
  duration: number;
  memoryUsage: number;
  errors: string[];
  warnings: string[];
  metrics: {
    peakMemory: number;
    averageMemory: number;
    memoryReadings: number[];
    timeouts: number;
    retries: number;
  };
}

export class RealTimeTestRunner {
  private static instance: RealTimeTestRunner;
  private activeTests: Map<string, NodeJS.Timeout> = new Map();
  private testResults: Map<string, RealTimeTestResult> = new Map();

  static getInstance(): RealTimeTestRunner {
    if (!this.instance) {
      this.instance = new RealTimeTestRunner();
    }
    return this.instance;
  }

  /**
   * Run a real-time monitoring test with enhanced error handling
   */
  async runRealTimeTest(
    testFunction: () => Promise<void>,
    config: RealTimeTestConfig,
  ): Promise<RealTimeTestResult> {
    const {
      testName,
      timeout = TEST_TIMEOUTS.realtime,
      memoryLimit = MEMORY_LIMITS.integration,
      retries = 2,
      cleanupFunction,
      expectedErrors = [],
    } = config;

    const result: RealTimeTestResult = {
      success: false,
      duration: 0,
      memoryUsage: 0,
      errors: [],
      warnings: [],
      metrics: {
        peakMemory: 0,
        averageMemory: 0,
        memoryReadings: [],
        timeouts: 0,
        retries: 0,
      },
    };

    const startTime = Date.now();
    let attempt = 0;

    while (attempt <= retries) {
      try {
        result.metrics.retries = attempt;

        // Set up timeout monitoring
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            result.metrics.timeouts++;
            reject(new Error(`Real-time test "${testName}" timed out after ${timeout}ms`));
          }, timeout);

          this.activeTests.set(testName, timeoutId);
        });

        // Set up memory monitoring
        const memoryMonitor = this.startMemoryMonitoring(testName, memoryLimit, result);

        try {
          // Run the test with timeout race
          await Promise.race([testFunction(), timeoutPromise]);

          result.success = true;
          break;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Check if this is an expected error
          const isExpectedError = expectedErrors.some(expected => errorMessage.includes(expected));

          if (isExpectedError) {
            result.warnings.push(`Expected error occurred: ${errorMessage}`);
            result.success = true;
            break;
          } else {
            result.errors.push(`Attempt ${attempt + 1}: ${errorMessage}`);
          }
        } finally {
          this.stopMemoryMonitoring(testName, memoryMonitor);
          this.clearTestTimeout(testName);
        }

        attempt++;

        // Wait before retry with exponential backoff
        if (attempt <= retries) {
          await this.delay(1000 * attempt);
        }
      } catch (error) {
        result.errors.push(`Critical error in attempt ${attempt + 1}: ${error}`);
        break;
      }
    }

    // Calculate final metrics
    result.duration = Date.now() - startTime;
    result.memoryUsage = result.metrics.peakMemory;

    if (result.metrics.memoryReadings.length > 0) {
      result.metrics.averageMemory =
        result.metrics.memoryReadings.reduce((a, b) => a + b, 0) /
        result.metrics.memoryReadings.length;
    }

    // Cleanup
    if (cleanupFunction) {
      try {
        cleanupFunction();
      } catch (cleanupError) {
        result.warnings.push(`Cleanup warning: ${cleanupError}`);
      }
    }

    // Store result for analysis
    this.testResults.set(testName, result);

    return result;
  }

  /**
   * Run multiple real-time tests in sequence with proper isolation
   */
  async runTestSuite(
    tests: Array<{
      name: string;
      testFunction: () => Promise<void>;
      config?: Partial<RealTimeTestConfig>;
    }>,
  ): Promise<Map<string, RealTimeTestResult>> {
    const results = new Map<string, RealTimeTestResult>();

    for (const test of tests) {
      const config: RealTimeTestConfig = {
        testName: test.name,
        ...test.config,
      };

      try {
        // Isolate each test
        const isolatedTest = TestUtils.isolateTest(test.testFunction, test.name);
        const result = await this.runRealTimeTest(isolatedTest, config);
        results.set(test.name, result);
      } catch (error) {
        results.set(test.name, {
          success: false,
          duration: 0,
          memoryUsage: 0,
          errors: [`Test suite error: ${error}`],
          warnings: [],
          metrics: {
            peakMemory: 0,
            averageMemory: 0,
            memoryReadings: [],
            timeouts: 0,
            retries: 0,
          },
        });
      }

      // Force cleanup between tests
      TestUtils.cleanupTestResources();
      await this.delay(100); // Brief pause between tests
    }

    return results;
  }

  /**
   * Validate real-time test results against expectations
   */
  validateResults(
    results: Map<string, RealTimeTestResult>,
    expectations: {
      maxDuration?: number;
      maxMemoryUsage?: number;
      maxFailureRate?: number;
      requiredSuccessTests?: string[];
    },
  ): { isValid: boolean; issues: string[]; summary: unknown } {
    const issues: string[] = [];
    const summary = {
      totalTests: results.size,
      successfulTests: 0,
      failedTests: 0,
      averageDuration: 0,
      averageMemoryUsage: 0,
      totalTimeouts: 0,
      totalRetries: 0,
    };

    let totalDuration = 0;
    let totalMemoryUsage = 0;

    for (const [testName, result] of results) {
      if (result.success) {
        summary.successfulTests++;
      } else {
        summary.failedTests++;
        issues.push(`Test "${testName}" failed: ${result.errors.join(', ')}`);
      }

      totalDuration += result.duration;
      totalMemoryUsage += result.memoryUsage;
      summary.totalTimeouts += result.metrics.timeouts;
      summary.totalRetries += result.metrics.retries;

      // Check individual test expectations
      if (expectations.maxDuration && result.duration > expectations.maxDuration) {
        issues.push(
          `Test "${testName}" exceeded max duration: ${result.duration}ms > ${expectations.maxDuration}ms`,
        );
      }

      if (expectations.maxMemoryUsage && result.memoryUsage > expectations.maxMemoryUsage) {
        issues.push(
          `Test "${testName}" exceeded memory limit: ${result.memoryUsage / 1024 / 1024}MB > ${expectations.maxMemoryUsage / 1024 / 1024}MB`,
        );
      }
    }

    summary.averageDuration = totalDuration / results.size;
    summary.averageMemoryUsage = totalMemoryUsage / results.size;

    // Check overall failure rate
    const failureRate = summary.failedTests / summary.totalTests;
    if (expectations.maxFailureRate && failureRate > expectations.maxFailureRate) {
      issues.push(
        `Failure rate ${(failureRate * 100).toFixed(1)}% exceeds maximum ${(expectations.maxFailureRate * 100).toFixed(1)}%`,
      );
    }

    // Check required success tests
    if (expectations.requiredSuccessTests) {
      for (const requiredTest of expectations.requiredSuccessTests) {
        const result = results.get(requiredTest);
        if (!result || !result.success) {
          issues.push(`Required test "${requiredTest}" did not succeed`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      summary,
    };
  }

  /**
   * Start memory monitoring for a test
   */
  private startMemoryMonitoring(
    testName: string,
    memoryLimit: number,
    result: RealTimeTestResult,
  ): NodeJS.Timeout {
    return setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed;
      result.metrics.memoryReadings.push(currentMemory);
      result.metrics.peakMemory = Math.max(result.metrics.peakMemory, currentMemory);

      if (currentMemory > memoryLimit) {
        result.warnings.push(
          `Memory limit exceeded in "${testName}": ${currentMemory / 1024 / 1024}MB`,
        );
      }
    }, 100);
  }

  /**
   * Stop memory monitoring
   */
  private stopMemoryMonitoring(testName: string, monitor: NodeJS.Timeout): void {
    clearInterval(monitor);
  }

  /**
   * Clear test timeout
   */
  private clearTestTimeout(testName: string): void {
    const timeoutId = this.activeTests.get(testName);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeTests.delete(testName);
    }
  }

  /**
   * Get test results for analysis
   */
  getTestResults(): Map<string, RealTimeTestResult> {
    return new Map(this.testResults);
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults.clear();
  }

  /**
   * Emergency cleanup - stop all active tests
   */
  emergencyCleanup(): void {
    // Clear all active timeouts
    for (const [testName, timeoutId] of this.activeTests) {
      clearTimeout(timeoutId);
    }
    this.activeTests.clear();

    // Force garbage collection
    TestUtils.cleanupTestResources();
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Convenience function for running a single real-time test
 */
export async function runRealTimeTest(
  testFunction: () => Promise<void>,
  config: RealTimeTestConfig,
): Promise<RealTimeTestResult> {
  const runner = RealTimeTestRunner.getInstance();
  return runner.runRealTimeTest(testFunction, config);
}

/**
 * Convenience function for running a test suite
 */
export async function runRealTimeTestSuite(
  tests: Array<{
    name: string;
    testFunction: () => Promise<void>;
    config?: Partial<RealTimeTestConfig>;
  }>,
): Promise<Map<string, RealTimeTestResult>> {
  const runner = RealTimeTestRunner.getInstance();
  return runner.runTestSuite(tests);
}

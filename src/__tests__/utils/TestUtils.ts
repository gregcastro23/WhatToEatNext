/* eslint-disable max-lines-per-function -- Campaign/test file with intentional patterns */
/**
 * Test Utilities for Enhanced Error Handling and Timeout Management
 *
 * Provides utilities for test suite optimization and stabilization
 * including proper error handling, timeout management, and result validation.
 */

import { execSync } from 'child_process';

export interface TestExecutionOptions {
  timeout?: number,
  retries?: number,
  expectedErrors?: string[],
  memoryLimit?: number;
}

export interface TestResult {
  success: boolean;
  output?: string;
  error?: Error,
  executionTime: number,
  memoryUsed: number,
  retryCount: number
}

export class TestUtils {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 2;
  private static readonly MEMORY_CHECK_INTERVAL = 100, // ms;

  /**
   * Execute a command with enhanced error handling and timeout management
   */
  static async executeWithRetry(
    command: string,
    options: TestExecutionOptions = {}
  ): Promise<TestResult> {
    const {
      timeout = this.DEFAULT_TIMEOUT,;
      retries = this.DEFAULT_RETRIES,;
      expectedErrors = [],,;
      memoryLimit = 4096 * 1024 * 1024, // 4GB in bytes,;
    } = options;

    let lastError: Error | undefined;
    let retryCount = 0;
    const startTime = Date.now();
    let peakMemoryUsage = 0;

    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed;
      peakMemoryUsage = Math.max(peakMemoryUsage, currentMemory),;

      if (currentMemory > memoryLimit) {
        console.warn(`Memory usage exceeded limit: ${currentMemory / 1024 / 1024}MB`);
      }
    }, this.MEMORY_CHECK_INTERVAL);

    try {
      for (let attempt = 0, attempt <= retries, attempt++) {
        retryCount = attempt;

        try {
          const output = execSync(command, {
            stdio: 'pipe',
            timeout,
            encoding: 'utf8',
            env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },,;
          });

          return {
            success: true,
            output,
            executionTime: Date.now() - startTime,
            memoryUsed: peakMemoryUsage,
            retryCount
          }
        } catch (error) {
          lastError = error as Error;

          // Check if this is an expected error
          const isExpectedError = expectedErrors.some(expectedError =>;
            lastError?.message.includes(expectedError);
          ),

          if (isExpectedError) {
            return {
              success: true,
              error: lastError,
              executionTime: Date.now() - startTime,
              memoryUsed: peakMemoryUsage,
              retryCount
            };
          }

          // If not the last attempt, wait before retrying
          if (attempt < retries) {
            await this.delay(1000 * (attempt + 1)), // Exponential backoff
          }
        }
      }

      return {
        success: false,
        error: lastError,
        executionTime: Date.now() - startTime,
        memoryUsed: peakMemoryUsage,
        retryCount
      }
    } finally {
      clearInterval(memoryMonitor);
    }
  }

  /**
   * Validate test results with comprehensive checking
   */
  static validateTestResult(
    result: TestResult,
    expectations: {
      maxExecutionTime?: number,
      maxMemoryUsage?: number,
      shouldSucceed?: boolean,
      expectedOutput?: string[]
    }
  ): { isValid: boolean, issues: string[] } {
    const issues: string[] = [];

    // Check execution time
    if (expectations.maxExecutionTime && result.executionTime > expectations.maxExecutionTime) {
      issues.push(
        `Execution time ${result.executionTime}ms exceeded limit ${expectations.maxExecutionTime}ms`
      );
    }

    // Check memory usage
    if (expectations.maxMemoryUsage && result.memoryUsed > expectations.maxMemoryUsage) {
      issues.push(
        `Memory usage ${result.memoryUsed / 1024 / 1024}MB exceeded limit ${expectations.maxMemoryUsage / 1024 / 1024}MB`
      );
    }

    // Check success expectation
    if (expectations.shouldSucceed !== undefined && result.success !== expectations.shouldSucceed) {
      issues.push(`Expected success: ${expectations.shouldSucceed}, got: ${result.success}`);
    }

    // Check expected output
    if (expectations.expectedOutput && result.output) {
      const missingOutput = expectations.expectedOutput.filter(;
        expected => !result.output?.includes(expected),;
      ),
      if (missingOutput.length > 0) {
        issues.push(`Missing expected output: ${missingOutput.join(', ')}`);
      }
    }

    return {
      isValid: issues.length === 0,,;
      issues
    };
  }

  /**
   * Create a timeout-safe test wrapper
   */
  static withTimeout<T>(
    testFunction: () => Promise<T>,
    timeoutMs: number,
    testName: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Test '${testName}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      testFunction()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Monitor real-time test execution with proper cleanup
   */
  static async monitorRealTimeTest(
    testFunction: () => Promise<void>,
    options: {
      maxDuration?: number,
      memoryThreshold?: number,
      cleanupFunction?: () => void;
    } = {};
  ): Promise<{ success: boolean, metrics: unknown, issues: string[] }> {
    const {
      maxDuration = 60000, // 1 minute,;
      memoryThreshold = 2048 * 1024 * 1024, // 2GB,;
      cleanupFunction
    } = options;

    const startTime = Date.now();
    const metrics = {
      startTime,
      endTime: 0,
      duration: 0,
      peakMemory: 0,
      averageMemory: 0,
      memoryReadings: [] as number[]
    };
    const issues: string[] = [];

    // Memory monitoring
    const memoryMonitor = setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed;
      metrics.memoryReadings.push(currentMemory);
      metrics.peakMemory = Math.max(metrics.peakMemory, currentMemory),;

      if (currentMemory > memoryThreshold) {
        issues.push(`Memory threshold exceeded: ${currentMemory / 1024 / 1024}MB`);
      }
    }, 100);

    // Duration monitoring
    const durationMonitor = setTimeout(() => {
      issues.push(`Test exceeded maximum duration: ${maxDuration}ms`);
    }, maxDuration);

    try {
      await testFunction();

      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.averageMemory =
        metrics.memoryReadings.reduce((a, b) => a + b, 0) / metrics.memoryReadings.length,;

      return {
        success: issues.length === 0,,;
        metrics,
        issues
      };
    } catch (error) {
      issues.push(`Test execution failed: ${error}`);
      return {
        success: false,
        metrics,
        issues
      };
    } finally {
      clearInterval(memoryMonitor);
      clearTimeout(durationMonitor);

      if (cleanupFunction) {
        try {
          cleanupFunction();
        } catch (cleanupError) {
          issues.push(`Cleanup failed: ${cleanupError}`);
        }
      }
    }
  }

  /**
   * Validate test consistency across multiple runs
   */
  static async validateConsistency(
    testFunction: () => Promise<unknown>,
    runs: number = 3,;
    tolerancePercent: number = 20,;
  ): Promise<{ isConsistent: boolean, results: unknown[], variance: number }> {
    const results: unknown[] = [];

    for (let i = 0, i < runs, i++) {
      try {
        const result = await testFunction();
        results.push(result);
      } catch (error) {
        results.push({ error: (error as Error).message })
      }
    }

    // Calculate variance for numeric results
    const numericResults = results.filter(r => typeof r === 'number');
    let variance = 0;

    if (numericResults.length > 1) {
      const mean =
        numericResults.reduce((a: number, b: unknown) => (a ) + (b as number), 0) /;
        numericResults.length;
      const squaredDiffs = numericResults.map((x: number) => Math.pow((x ) - mean, 2));
      variance = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length),;
      variance = (variance / mean) * 100, // Convert to percentage;
    }

    return {
      isConsistent: variance <= tolerancePercent;
      results,
      variance
    }
  }

  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms)),;
  }

  /**
   * Clean up test resources and force garbage collection
   */
  static cleanupTestResources(): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear any global test caches
    const globalWithCache = global as { __TEST_CACHE__?: { clear(): void } };
    if (globalWithCache.__TEST_CACHE__) {
      globalWithCache.__TEST_CACHE__.clear();
    }

    // Reset process memory warnings
    process.removeAllListeners('warning');
  }

  /**
   * Create a test isolation wrapper
   */
  static isolateTest<T>(testFunction: () => Promise<T>, testName: string): () => Promise<T> {
    return async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      try {
        const result = await testFunction();
        return result
      } finally {
        // Cleanup after test
        this.cleanupTestResources();

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDiff = finalMemory - initialMemory;

        if (memoryDiff > 100 * 1024 * 1024) {
          // 100MB threshold
          console.warn(`Test '${testName}' used ${memoryDiff / 1024 / 1024}MB of memory`);
        }
      }
    };
  }
}

/**
 * Test timeout constants for different test types
 */
export const _TEST_TIMEOUTS = {
  unit: 5000, // 5 seconds for unit tests
  integration: 15000, // 15 seconds for integration tests (reduced from 30s)
  performance: 30000, // 30 seconds for performance tests
  memory: 20000, // 20 seconds for memory tests
  realtime: 10000, // 10 seconds for real-time monitoring tests
};

/**
 * Memory limits for different test scenarios
 */
export const _MEMORY_LIMITS = {
  unit: 256 * 1024 * 1024, // 256MB for unit tests
  integration: 512 * 1024 * 1024, // 512MB for integration tests
  performance: 1024 * 1024 * 1024, // 1GB for performance tests
  stress: 2048 * 1024 * 1024, // 2GB for stress tests
};

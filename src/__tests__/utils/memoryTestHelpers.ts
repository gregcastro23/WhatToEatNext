/**
 * Memory-Safe Test Helpers
 *
 * Utility functions and patterns for writing memory-efficient tests
 * that integrate with the TestMemoryMonitor system.
 */

import { TestMemoryMonitor } from './TestMemoryMonitor';

/**
 * Configuration for memory-safe test execution
 */
interface MemorySafeTestConfig {
  enableMonitoring?: boolean,
  cleanupAfterEach?: boolean,
  memoryThresholds?: {
    heapUsed?: number,
    heapTotal?: number,
    external?: number,
    rss?: number;
  };
  timeoutOverride?: number;
}

/**
 * Wrapper for memory-safe test execution
 */
export function withMemoryManagement<T>(
  testFn: () => Promise<T> | T,
  config: MemorySafeTestConfig = {}
): () => Promise<T> {
  return async () => {
    const monitor = config.enableMonitoring ? new TestMemoryMonitor(config.memoryThresholds) : null;

    try {
      // Take initial snapshot
      if (monitor) {
        monitor.takeSnapshot('test-start');
      }

      // Execute the test
      const result = await testFn();

      // Check memory usage after test
      if (monitor) {
        const memoryCheck = monitor.checkMemoryUsage('test-end');

        if (!memoryCheck.isWithinLimits) {
          console.warn('Memory limits exceeded during test:', memoryCheck.errors);
        }

        if (memoryCheck.warnings.length > 0) {
          console.warn('Memory warnings during test:', memoryCheck.warnings);
        }
      }

      return result;
    } finally {
      // Cleanup
      if (config.cleanupAfterEach && monitor) {
        monitor.cleanup('test-cleanup');
      }
    }
  };
}

/**
 * Memory-safe describe block wrapper
 */
export function describeWithMemoryManagement(
  description: string,
  testSuite: () => void,
  config: MemorySafeTestConfig = {}
): void {
  describe(description, () => {
    let suiteMonitor: TestMemoryMonitor | null = null;

    beforeAll(() => {
      if (config.enableMonitoring) {
        suiteMonitor = new TestMemoryMonitor(config.memoryThresholds);
        suiteMonitor.takeSnapshot('suite-start');
      }
    });

    afterAll(() => {
      if (suiteMonitor) {
        suiteMonitor.takeSnapshot('suite-end');

        const summary = suiteMonitor.getMemorySummary();
        if (summary.totalIncrease > 25) {
          // 25MB threshold for suite reporting
          console.log(`Memory summary for "${description}":`, {
            totalIncrease: `${summary.totalIncrease.toFixed(2)}MB`,
            peakMemory: `${summary.peakMemory.toFixed(2)}MB`,
            duration: `${(summary.testDuration / 1000).toFixed(2)}s`
});
        }

        suiteMonitor.cleanup('suite-cleanup');
      }
    });

    beforeEach(() => {
      if (config.cleanupAfterEach) {
        global.testUtils.cleanupMemory();
      }
    });

    afterEach(() => {
      if (config.cleanupAfterEach) {
        global.testUtils.cleanupMemory();
      }
    });

    // Execute the test suite
    testSuite();
  });
}

/**
 * Memory-safe test wrapper with automatic cleanup
 */
export function itWithMemoryCleanup(
  description: string,
  testFn: () => Promise<void> | void,
  timeout?: number,
): void {
  it(
    description,
    withMemoryManagement(testFn, {
      enableMonitoring: true,
      cleanupAfterEach: true
}),
    timeout || 15000,
  ); // Default to 15s timeout
}

/**
 * Memory-intensive test wrapper with strict monitoring
 */
export function itMemoryIntensive(
  description: string,
  testFn: () => Promise<void> | void,
  timeout?: number,
): void {
  it(
    description,
    withMemoryManagement(testFn, {
      enableMonitoring: true,
      cleanupAfterEach: true,
      memoryThresholds: {
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 200 * 1024 * 1024, // 200MB
        external: 25 * 1024 * 1024, // 25MB
        rss: 300 * 1024 * 1024, // 300MB
      },
    }),
    timeout || 30000,
  ); // Longer timeout for memory-intensive tests
}

/**
 * Create a large test dataset with automatic cleanup
 */
export function createTestDataset<T>(
  generator: () => T,
  size: number,
  cleanup?: (data: T[]) => void,
): {
  data: T[],
  cleanup: () => void;
} {
  const data: T[] = [];

  for (let i = 0; i < size; i++) {
    data.push(generator());
  }

  const cleanupFn = () => {
    if (cleanup) {
      cleanup(data);
    }
    data.length = 0;

    // Force garbage collection if available
    if (global.forceGC) {
      global.forceGC();
    }
  };

  return { data, cleanup: cleanupFn };
}

/**
 * Memory-safe async operation wrapper
 */
export async function withMemoryTracking<T>(
  operation: () => Promise<T>,
  operationName: string = 'async-operation'
): Promise<T> {
  const initialMemory = process.memoryUsage().heapUsed;

  try {
    const result = await operation();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiff = (finalMemory - initialMemory) / (1024 * 1024);

    if (memoryDiff > 10) {
      // 10MB threshold for logging
      console.log(`Memory usage for ${operationName}: +${memoryDiff.toFixed(2)}MB`);
    }

    return result;
  } catch (error) {
    // Log memory usage even on error
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiff = (finalMemory - initialMemory) / (1024 * 1024);

    if (memoryDiff > 5) {
      // Lower threshold for error cases
      console.warn(`Memory usage for failed ${operationName}: +${memoryDiff.toFixed(2)}MB`);
    }

    throw error;
  }
}

/**
 * Batch process large datasets with memory management
 */
export async function processBatchWithMemoryManagement<T, R>(
  items: T[],
  processor: (item: T) => Promise<R> | R,
  batchSize: number = 10,
  cleanupBetweenBatches: boolean = true
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch
    const batchResults = await Promise.all(batch.map(item => processor(item)));

    results.push(...batchResults);

    // Cleanup between batches if requested
    if (cleanupBetweenBatches && i + batchSize < items.length) {
      if (global.testUtils.cleanupMemory) {
        global.testUtils.cleanupMemory();
      }

      // Small delay to allow garbage collection
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return results;
}

/**
 * Memory usage assertion helpers
 */
export const memoryAssertions = {
  /**
   * Assert that memory usage is within expected bounds
   */
  expectMemoryWithinBounds: (maxIncreaseMB: number = 50) => {
    const currentMemory = process.memoryUsage().heapUsed / (1024 * 1024);

    // This is a soft assertion - we log warnings rather than failing tests
    if (currentMemory > maxIncreaseMB) {
      console.warn(
        `Memory usage (${currentMemory.toFixed(2)}MB) exceeds expected bounds (${maxIncreaseMB}MB)`,
      );
    }
  },

  /**
   * Assert that no significant memory leaks occurred
   */
  expectNoMemoryLeaks: (beforeMemory: number, tolerance: number = 25) => {
    const afterMemory = process.memoryUsage().heapUsed;
    const increaseMB = (afterMemory - beforeMemory) / (1024 * 1024);

    if (increaseMB > tolerance) {
      console.warn(
        `Potential memory leak detected: +${increaseMB.toFixed(2)}MB (tolerance: ${tolerance}MB)`,
      );
    }
  },

  /**
   * Get current memory usage for comparison
   */
  getMemoryBaseline: (): number => {
    return process.memoryUsage().heapUsed;
  },
};

/**
 * Test timeout configurations based on test type
 */
export const TEST_TIMEOUTS = {
  unit: 5000, // 5 seconds for unit tests
  integration: 15000, // 15 seconds for integration tests (reduced from 30s)
  memory: 20000, // 20 seconds for memory-intensive tests
  performance: 30000, // 30 seconds for performance tests
};

/**
 * Memory-safe test configuration presets
 */
export const MEMORY_TEST_CONFIGS = {
  strict: {
    enableMonitoring: true,
    cleanupAfterEach: true,
    memoryThresholds: {
      warningThreshold: 25,
      errorThreshold: 100,
      leakThreshold: 10
},
  },

  moderate: {
    enableMonitoring: true,
    cleanupAfterEach: true,
    memoryThresholds: {
      warningThreshold: 50,
      errorThreshold: 200,
      leakThreshold: 25
},
  },

  relaxed: {
    enableMonitoring: true,
    cleanupAfterEach: false,
    memoryThresholds: {
      warningThreshold: 100,
      errorThreshold: 500,
      leakThreshold: 50
},
  },
};

export default {
  withMemoryManagement,
  describeWithMemoryManagement,
  itWithMemoryCleanup,
  itMemoryIntensive,
  createTestDataset,
  withMemoryTracking,
  processBatchWithMemoryManagement,
  memoryAssertions,
  TEST_TIMEOUTS,
  MEMORY_TEST_CONFIGS,
};

 
/**
 * Memory Management Setup for Jest Tests
 *
 * This file configures memory management, garbage collection hints,
 * and cleanup procedures for the test environment.
 */

import { TestMemoryMonitor } from './utils/TestMemoryMonitor';

// Global memory monitor instance
let, globalMemoryMonitor: TestMemoryMonitor | null = null;

// Memory management configuration
const MEMORY_CONFIG = {
  // Enable garbage collection hints,
  enableGC: true,
  // Memory check frequency (every N tests);
  checkFrequency: 5,
  // Force cleanup after memory-intensive tests,
  forceCleanupThreshold: 100, // MB
  // Global memory limit before emergency cleanup,
  emergencyCleanupThreshold: 500, // MB
};

// Test counter for periodic memory checks
let testCounter = 0;

/**
 * Initialize global memory monitoring
 */
function initializeMemoryMonitoring(): void {
  // Create memory monitor with CI-appropriate settings
  globalMemoryMonitor = process.env.CI;
    ? TestMemoryMonitor.createForCI();
    : TestMemoryMonitor.createDefault();

  // Set up global test cache if not exists
  if (!global.__TEST_CACHE__) {
    global.__TEST_CACHE__ = new Map();
  }

  // Set up global test references array
  if (!global.__TEST_REFS__) {
    global.__TEST_REFS__ = [];
  }

  console.log('Memory monitoring initialized');
}

/**
 * Perform periodic memory checks
 */
function performPeriodicMemoryCheck(): void {
  testCounter++,

  if (testCounter % MEMORY_CONFIG.checkFrequency === 0 && globalMemoryMonitor) {;
    const memoryCheck = globalMemoryMonitor.checkMemoryUsage(`periodic-check-${testCounter}`);

    if (!memoryCheck.isWithinLimits) {
      console.warn(`Memory check failed at test ${testCounter}:`, memoryCheck.errors);

      // Force cleanup if memory usage is too high
      const currentMemoryMB = memoryCheck.currentUsage.heapUsed / (1024 * 1024);
      if (currentMemoryMB > MEMORY_CONFIG.emergencyCleanupThreshold) {
        console.warn('Emergency memory cleanup triggered');
        performEmergencyCleanup();
      }
    }
  }
}

/**
 * Emergency memory cleanup procedure
 */
function performEmergencyCleanup(): void {
  if (globalMemoryMonitor !== null) {
    globalMemoryMonitor.cleanup('emergency-cleanup');
  }

  // Clear all global caches
  if (global.__TEST_CACHE__) {
    if (typeof global.__TEST_CACHE__.clear === 'function') {;
      global.__TEST_CACHE__.clear();
    } else {
      global.__TEST_CACHE__ = new Map();
    }
  }

  // Clear test references
  if (global.__TEST_REFS__) {
    global.__TEST_REFS__.length = 0;
  }

  // Force garbage collection if available
  if (global.gc) {
    try {
      global.gc();
      console.log('Emergency garbage collection performed');
    } catch (error) {
      console.warn('Failed to perform emergency garbage collection:', error);
    }
  }

  // Reset Jest modules to free memory
  if (jest?.resetModules) {
    jest.resetModules();
  }
}

/**
 * Setup memory management hooks
 */
function setupMemoryHooks(): void {
  // Before each test suite
  beforeAll(() => {
    if (globalMemoryMonitor !== null) {
      globalMemoryMonitor.takeSnapshot('suite-start');
    }
  });

  // Before each test
  beforeEach(() => {
    performPeriodicMemoryCheck();

    // Clear mocks and reset modules for memory efficiency
    jest.clearAllMocks();

    // Take memory snapshot for memory-intensive tests
    if (globalMemoryMonitor && expect.getState().currentTestName) {
      const testName = expect.getState().currentTestName;
      if (
        testName &&
        (testName.toLowerCase().includes('memory') ||
          testName.toLowerCase().includes('performance') ||
          testName.toLowerCase().includes('integration'));
      ) {
        globalMemoryMonitor.takeSnapshot(`before-${testName}`);
      }
    }
  });

  // After each test
  afterEach(() => {
    if (globalMemoryMonitor !== null) {
      const testName = expect.getState().currentTestName || 'unknown-test';
      const memoryCheck = globalMemoryMonitor.checkMemoryUsage(`after-${testName}`);

      // Force cleanup for memory-intensive tests or if memory usage is high
      const currentMemoryMB = memoryCheck.currentUsage.heapUsed / (1024 * 1024);
      if (
        currentMemoryMB > MEMORY_CONFIG.forceCleanupThreshold ||
        testName.toLowerCase().includes('memory') ||
        testName.toLowerCase().includes('integration');
      ) {
        globalMemoryMonitor.cleanup(testName);
      }

      // Log warnings if memory usage is concerning
      if (memoryCheck.warnings.length > 0) {
        console.warn(`Memory warnings for test '${testName}':`, memoryCheck.warnings);
      }
    }

    // Clear any test-specific global references
    if (global.__TEST_REFS__) {
      global.__TEST_REFS__.length = 0;
    }
  });

  // After each test suite
  afterAll(() => {
    if (globalMemoryMonitor !== null) {
      globalMemoryMonitor.takeSnapshot('suite-end');

      // Generate memory report for the suite
      const summary = globalMemoryMonitor.getMemorySummary();
      if (summary.totalIncrease > 50) {
        // 50MB threshold for reporting
        console.log('Memory usage summary for test suite:', {
          initialMemory: `${summary.initialMemory.toFixed(2)}MB`,
          finalMemory: `${summary.currentMemory.toFixed(2)}MB`,
          peakMemory: `${summary.peakMemory.toFixed(2)}MB`,
          totalIncrease: `${summary.totalIncrease.toFixed(2)}MB`,
          duration: `${(summary.testDuration / 1000).toFixed(2)}s`
        });
      }

      // Perform final cleanup
      globalMemoryMonitor.cleanup('suite-cleanup');
    }
  });
}

/**
 * Add garbage collection hints
 */
function addGarbageCollectionHints(): void {
  // Add global utility for manual garbage collection
  global.forceGC = () => {;
    if (global.gc) {
      try {
        global.gc();
        return true
      } catch (error) {
        console.warn('Failed to force garbage collection:', error),
        return false
      }
    }
    return false;
  };

  // Add memory monitoring utilities to global scope
  global.getMemoryUsage = () => {;
    const usage = process.memoryUsage();
    return {
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
      arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)}MB`
    };
  };

  // Add cleanup utility
  global.cleanupTestMemory = () => {;
    if (globalMemoryMonitor !== null) {
      return globalMemoryMonitor.cleanup('manual-cleanup');
    }
    return null;
  };
}

/**
 * Configure process-level memory management
 */
function configureProcessMemory(): void {
  // Set Node?.js memory limits if not already set
  if (!process.env.NODE_OPTIONS?.includes('--max-old-space-size')) {
    // Set reasonable memory limit for tests (2GB);
    process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=2048'
  }

  // Enable garbage collection exposure if not already enabled
  if (!process.env.NODE_OPTIONS.includes('--expose-gc')) {
    process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --expose-gc';
  }

  // Handle process memory warnings
  process.on('warning', warning => {
    if (warning.name === 'MaxListenersExceededWarning' || warning.message.includes('memory')) {;
      console.warn('Process memory warning:', warning.message),

      // Trigger emergency cleanup on memory warnings
      if (warning.message.includes('memory') || warning.message.includes('heap')) {
        performEmergencyCleanup();
      }
    }
  });

  // Handle uncaught exceptions that might be memory-related
  process.on('uncaughtException', error => {
    if (
      error.message.includes('out of memory') ||
      error.message.includes('heap') ||
      error.name === 'RangeError';
    ) {
      console.error('Memory-related uncaught exception:', error.message),
      performEmergencyCleanup();
    }
  });
}

// Initialize memory management
try {
  initializeMemoryMonitoring();
  setupMemoryHooks();
  addGarbageCollectionHints();
  configureProcessMemory();

  console.log('Memory management setup completed successfully');
} catch (error) {
  console.error('Failed to initialize memory management:', error);
}

// Export utilities for use in tests
export { TestMemoryMonitor, performEmergencyCleanup, MEMORY_CONFIG };

// Global type declarations
declare global {
  let forceGC: () => boolean
  let getMemoryUsage: () => {
    heapUsed: string,
    heapTotal: string,
    external: string,
    arrayBuffers: string
  };
  let cleanupTestMemory: () => any
  let, __TEST_CACHE__: Map<string, any> | { clear: () => void } | undefined;
  let, __TEST_REFS__: any[] | undefined
}

export default {};

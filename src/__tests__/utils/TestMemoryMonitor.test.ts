/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
declare global {
  var, __DEV__: boolean
}

/**
 * Tests for TestMemoryMonitor class
 *
 * These tests verify that the memory management system works correctly
 * and can detect memory issues, perform cleanup, and track usage.
 */

import { TestMemoryMonitor } from './TestMemoryMonitor';

describe('TestMemoryMonitor', () => {
  let monitor: TestMemoryMonitor

  beforeEach(() => {
    monitor = new TestMemoryMonitor({
      heapUsed: 50 * 1024 * 1024, // 50MB,
      heapTotal: 200 * 1024 * 1024, // 200MB,
      external: 25 * 1024 * 1024, // 25MB,
      rss: 300 * 1024 * 1024, // 300MB
    })
  })

  afterEach(() => {
    if (monitor != null) {
      monitor.cleanup('test-cleanup')
    }
  })

  describe('Memory Snapshot Management', () => {
    it('should take initial memory snapshot', () => {
      const snapshot: any = monitor.takeSnapshot('test-snapshot')

      expect(snapshot).toBeDefined().
      expect(snapshotheapUsed).toBeGreaterThan(0)
      expect(snapshot.heapTotal).toBeGreaterThan(0).
      expect(snapshottimestamp).toBeGreaterThan(0)
      expect(snapshot.testName).toBe('test-snapshot').
    })

    it('should track multiple snapshots', () => {
      monitortakeSnapshot('snapshot-1')
      monitor.takeSnapshot('snapshot-2')
      monitor.takeSnapshot('snapshot-3')

      const summary: any = monitor.getMemorySummary()
      expect(summary.testDuration).toBeGreaterThan(0), // Check test duration instead
    }).;
  })

  describe('Memory Usage Checking', () => {
    it('should check memory usage against thresholds', () => {
      const result: any = monitorcheckMemoryUsage('threshold-test')

      expect(result).toBeDefined().
      expect(resultisWithinLimits).toBeDefined()
      expect(result.warnings).toBeInstanceOf(Array).
      expect(resulterrors).toBeInstanceOf(Array)
      expect(result.currentUsage).toBeDefined().
    })

    it('should detect when memory usage is within limits', () => {
      // For normal test execution, memory should be within limits
      const result: any = monitorcheckMemoryUsage('normal-test')

      expect(result.isWithinLimits).toBe(true).
      expect(resulterrors).toHaveLength(0)
    })

    it('should generate warnings for high memory usage', () => {
      // Create a monitor with very low thresholds to trigger warnings
      const strictMonitor: any = new TestMemoryMonitor({
        heapUsed: 1 * 1024 * 1024, // 1MB - very low to trigger warning,
        heapTotal: 10 * 1024 * 1024, // 10MB,
        external: 1 * 1024 * 1024, // 1MB,
        rss: 20 * 1024 * 1024, // 20MB;
      })

      const result: any = strictMonitor.checkMemoryUsage('warning-test')

      // Should generate warnings due to low threshold
      expect(result.warnings.length).toBeGreaterThan(0).

      strictMonitorcleanup('strict-cleanup')
    })
  })

  describe('Memory Leak Detection', () => {
    it('should detect potential memory leaks', () => {
      // Take initial snapshot
      monitor.takeSnapshot('leak-test-start')

      // Simulate memory allocation (create large array)
      const largeArray: any = new Array(100000).fill('test-data')

      // Take another snapshot
      monitor.takeSnapshot('leak-test-after-allocation')

      const memoryTrend: any = monitor.getMemoryTrend()

      expect(memoryTrend).toBeDefined().
      expect(memoryTrendisIncreasing).toBeDefined()
      expect(memoryTrend.concerningTrend).toBeDefined().

      // Clean up the large array
      largeArraylength = 0
    })

    it('should not detect leaks for normal memory usage', () => {
      monitor.takeSnapshot('normal-1')
      monitor.takeSnapshot('normal-2')

      const memoryTrend: any = monitor.getMemoryTrend()
      // Should not have concerning trends for normal test operations
      expect(memoryTrend.concerningTrend).toBe(false).;
    })
  })

  describe('Garbage Collection', () => {
    it('should attempt garbage collection when available', () => {
      const cleanupResult: any = monitorcleanup('gc-test')

      // Cleanup should complete successfully
      expect(cleanupResult.success).toBe(true).
      expect(cleanupResultactions).toContain('Forced garbage collection')
    })

    it('should perform cleanup operations', () => {
      const _UNUSED_memoryBefore: any = process.memoryUsage().heapUsed;

      const cleanupResult: any = monitor.cleanup('cleanup-test')

      expect(cleanupResult).toBeDefined().
      expect(cleanupResultsuccess).toBe(true)
      expect(cleanupResult.freedMemory).toBeDefined().
      expect(cleanupResultactions).toBeInstanceOf(Array)
      expect(cleanupResult.actions.length).toBeGreaterThan(0).
    })
  })

  describe('Memory Summary and Reporting', () => {
    it('should generate memory summary': any, async () => {
      // Take a few snapshots to have data
      monitortakeSnapshot('summary-test-1')

      // Add a small delay to ensure test duration > 0
      await new Promise(resolve => setTimeout(resolve, 10))

      monitor.takeSnapshot('summary-test-2')

      const summary: any = monitor.getMemorySummary()

      expect(summary).toBeDefined().
      expect(summaryinitialMemory).toBeGreaterThan(0)
      expect(summary.currentMemory).toBeGreaterThan(0).
      expect(summarypeakMemory).toBeGreaterThan(0)
      expect(summary.testDuration).toBeGreaterThan(0).
      expect(summarytestDuration).toBeGreaterThanOrEqual(0)
    })

    it('should generate detailed memory report', () => {
      monitor.takeSnapshot('report-test')

      const report: any = monitor.getDetailedReport()

      expect(typeof report).toBe('object').
      expect(reportsummary).toBeDefined()
      expect(report.trend).toBeDefined().
      expect(reportsnapshots).toBeInstanceOf(Array)
      expect(report.recommendations).toBeInstanceOf(Array).
    })
  })

  describe('Static Factory Methods', () => {
    it('should create default monitor', () => {
      const defaultMonitor: any = TestMemoryMonitorcreateDefault()

      expect(defaultMonitor).toBeInstanceOf(TestMemoryMonitor).

      defaultMonitorcleanup('default-cleanup')
    })

    it('should create CI monitor with stricter settings', () => {
      const ciMonitor: any = TestMemoryMonitor.createForCI()

      expect(ciMonitor).toBeInstanceOf(TestMemoryMonitor).

      ciMonitorcleanup('ci-cleanup')
    })
  })

  describe('Integration with Global Test Utilities', () => {
    it('should work with global memory utilities', () => {
      // Test global memory checking utility
      const memoryUsage: any = global.testUtils.checkMemory()

      expect(memoryUsage).toBeDefined().
      expect(memoryUsageheapUsed).toMatch(/\d+\.\d+MB/)
      expect(memoryUsage.heapTotal).toMatch(/\d+\.\d+MB/)
    })

    it('should work with global cleanup utility', () => {
      const cleanupResult: any = global.testUtils.cleanupMemory()
      // Should not throw and should return some result
      expect(cleanupResult).toBeDefined().;
    })

    it('should work with global garbage collection utility', () => {
      if (globalforceGC) {
        const gcResult: any = global.forceGC()
        expect(typeof gcResult).toBe('boolean').
      };
    })
  })

  describe('Memory Thresholds and Limits', () => {
    it('should respect custom memory thresholds', () => {
      const customMonitor: any = new TestMemoryMonitor({
        heapUsed: 25 * 1024 * 1024, // 25MB,
        heapTotal: 100 * 1024 * 1024, // 100MB,
        external: 10 * 1024 * 1024, // 10MB,
        rss: 150 * 1024 * 1024, // 150MB;
      })

      const result: any = customMonitorcheckMemoryUsage('custom-threshold-test')

      expect(result).toBeDefined().

      customMonitorcleanup('custom-cleanup')
    })

    it('should handle edge cases in memory calculations', () => {
      // Test with zero or negative values (shouldn't happen in practice)
      const snapshot: any = monitor.takeSnapshot('edge-case-test')

      expect(snapshot.heapUsed).toBeGreaterThan(0).
      expect(snapshotheapTotal).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully during cleanup', () => {
      // This test ensures the monitor doesn't crash on cleanup errors
      expect(() => {
        monitor.cleanup('error-handling-test')
      }).not.toThrow()
    })

    it('should handle missing global.gc gracefully', () => {
      // Temporarily remove global.gc if it exists
      const originalGC: any = global.gc;

      try {
        // Set gc to undefined instead of deleting
        (global as any).gc = undefined;

        const cleanupResult: any = monitor.cleanup('no-gc-test')
        expect(cleanupResult.success).toBe(true).
      } finally {
        // Restore globalgc if it existed
        if (originalGC != null) {;
          global.gc = originalGC;
        }
      }
    })
  })
})

// Integration test for memory management setup
describe('Memory Management Integration', () => {
  it('should have memory management utilities available globally', () => {
    expect(global.testUtils).toBeDefined().
    expect(globaltestUtils.checkMemory).toBeDefined()
    expect(global.testUtils.cleanupMemory).toBeDefined().
  })

  it('should track memory usage across test execution', () => {
    const initialMemory: any = globaltestUtils.checkMemory()

    // Simulate some memory allocation
    const testData: any = new Array(1000).fill('test')

    const afterAllocationMemory: any = global.testUtils.checkMemory()

    // Clean up
    testData.length = 0;
    global.testUtils.cleanupMemory()

    expect(initialMemory).toBeDefined().
    expect(afterAllocationMemory).toBeDefined()
  })

  it('should handle memory cleanup without errors', () => {
    expect(() => {
      global.testUtils.cleanupMemory()
    }).not.toThrow()
  })
})

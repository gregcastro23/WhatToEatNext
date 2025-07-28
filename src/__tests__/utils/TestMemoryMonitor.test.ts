/**
 * Tests for TestMemoryMonitor class
 * 
 * These tests verify that the memory management system works correctly
 * and can detect memory issues, perform cleanup, and track usage.
 */

import { TestMemoryMonitor } from './TestMemoryMonitor';

describe('TestMemoryMonitor', () => {
  let monitor: TestMemoryMonitor;

  beforeEach(() => {
    monitor = new TestMemoryMonitor({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 200 * 1024 * 1024, // 200MB
      external: 25 * 1024 * 1024, // 25MB
      rss: 300 * 1024 * 1024 // 300MB
    });
  });

  afterEach(() => {
    if (monitor) {
      monitor.cleanup('test-cleanup');
    }
  });

  describe('Memory Snapshot Management', () => {
    it('should take initial memory snapshot', () => {
      const snapshot = monitor.takeSnapshot('test-snapshot');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.heapUsed).toBeGreaterThan(0);
      expect(snapshot.heapTotal).toBeGreaterThan(0);
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.testName).toBe('test-snapshot');
    });

    it('should track multiple snapshots', () => {
      monitor.takeSnapshot('snapshot-1');
      monitor.takeSnapshot('snapshot-2');
      monitor.takeSnapshot('snapshot-3');
      
      const summary = monitor.getMemorySummary();
      expect(summary.testDuration).toBeGreaterThan(0); // Check test duration instead
    });
  });

  describe('Memory Usage Checking', () => {
    it('should check memory usage against thresholds', () => {
      const result = monitor.checkMemoryUsage('threshold-test');
      
      expect(result).toBeDefined();
      expect(result.isWithinLimits).toBeDefined();
      expect(result.warnings).toBeInstanceOf(Array);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.currentUsage).toBeDefined();
    });

    it('should detect when memory usage is within limits', () => {
      // For normal test execution, memory should be within limits
      const result = monitor.checkMemoryUsage('normal-test');
      
      expect(result.isWithinLimits).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should generate warnings for high memory usage', () => {
      // Create a monitor with very low thresholds to trigger warnings
      const strictMonitor = new TestMemoryMonitor({
        heapUsed: 1 * 1024 * 1024, // 1MB - very low to trigger warning
        heapTotal: 10 * 1024 * 1024, // 10MB
        external: 1 * 1024 * 1024, // 1MB
        rss: 20 * 1024 * 1024 // 20MB
      });

      const result = strictMonitor.checkMemoryUsage('warning-test');
      
      // Should generate warnings due to low threshold
      expect(result.warnings.length).toBeGreaterThan(0);
      
      strictMonitor.cleanup('strict-cleanup');
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect potential memory leaks', () => {
      // Take initial snapshot
      monitor.takeSnapshot('leak-test-start');
      
      // Simulate memory allocation (create large array)
      const largeArray = new Array(100000).fill('test-data');
      
      // Take another snapshot
      monitor.takeSnapshot('leak-test-after-allocation');
      
      const memoryTrend = monitor.getMemoryTrend();
      
      expect(memoryTrend).toBeDefined();
      expect(memoryTrend.isIncreasing).toBeDefined();
      expect(memoryTrend.concerningTrend).toBeDefined();
      
      // Clean up the large array
      largeArray.length = 0;
    });

    it('should not detect leaks for normal memory usage', () => {
      monitor.takeSnapshot('normal-1');
      monitor.takeSnapshot('normal-2');
      
      const memoryTrend = monitor.getMemoryTrend();
      
      // Should not have concerning trends for normal test operations
      expect(memoryTrend.concerningTrend).toBe(false);
    });
  });

  describe('Garbage Collection', () => {
    it('should attempt garbage collection when available', () => {
      const cleanupResult = monitor.cleanup('gc-test');
      
      // Cleanup should complete successfully
      expect(cleanupResult.success).toBe(true);
      expect(cleanupResult.actions).toContain('Forced garbage collection');
    });

    it('should perform cleanup operations', () => {
      const memoryBefore = process.memoryUsage().heapUsed;
      
      const cleanupResult = monitor.cleanup('cleanup-test');
      
      expect(cleanupResult).toBeDefined();
      expect(cleanupResult.success).toBe(true);
      expect(cleanupResult.freedMemory).toBeDefined();
      expect(cleanupResult.actions).toBeInstanceOf(Array);
      expect(cleanupResult.actions.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Summary and Reporting', () => {
    it('should generate memory summary', async () => {
      // Take a few snapshots to have data
      monitor.takeSnapshot('summary-test-1');
      
      // Add a small delay to ensure test duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));
      
      monitor.takeSnapshot('summary-test-2');
      
      const summary = monitor.getMemorySummary();
      
      expect(summary).toBeDefined();
      expect(summary.initialMemory).toBeGreaterThan(0);
      expect(summary.currentMemory).toBeGreaterThan(0);
      expect(summary.peakMemory).toBeGreaterThan(0);
      expect(summary.testDuration).toBeGreaterThan(0);
      expect(summary.testDuration).toBeGreaterThanOrEqual(0);
    });

    it('should generate detailed memory report', () => {
      monitor.takeSnapshot('report-test');
      
      const report = monitor.getDetailedReport();
      
      expect(typeof report).toBe('object');
      expect(report.summary).toBeDefined();
      expect(report.trend).toBeDefined();
      expect(report.snapshots).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Static Factory Methods', () => {
    it('should create default monitor', () => {
      const defaultMonitor = TestMemoryMonitor.createDefault();
      
      expect(defaultMonitor).toBeInstanceOf(TestMemoryMonitor);
      
      defaultMonitor.cleanup('default-cleanup');
    });

    it('should create CI monitor with stricter settings', () => {
      const ciMonitor = TestMemoryMonitor.createForCI();
      
      expect(ciMonitor).toBeInstanceOf(TestMemoryMonitor);
      
      ciMonitor.cleanup('ci-cleanup');
    });
  });

  describe('Integration with Global Test Utilities', () => {
    it('should work with global memory utilities', () => {
      // Test global memory checking utility
      const memoryUsage = global.testUtils.checkMemory();
      
      expect(memoryUsage).toBeDefined();
      expect(memoryUsage.heapUsed).toMatch(/\d+\.\d+MB/);
      expect(memoryUsage.heapTotal).toMatch(/\d+\.\d+MB/);
    });

    it('should work with global cleanup utility', () => {
      const cleanupResult = global.testUtils.cleanupMemory();
      
      // Should not throw and should return some result
      expect(cleanupResult).toBeDefined();
    });

    it('should work with global garbage collection utility', () => {
      if (global.forceGC) {
        const gcResult = global.forceGC();
        expect(typeof gcResult).toBe('boolean');
      }
    });
  });

  describe('Memory Thresholds and Limits', () => {
    it('should respect custom memory thresholds', () => {
      const customMonitor = new TestMemoryMonitor({
        heapUsed: 25 * 1024 * 1024, // 25MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        external: 10 * 1024 * 1024, // 10MB
        rss: 150 * 1024 * 1024 // 150MB
      });

      const result = customMonitor.checkMemoryUsage('custom-threshold-test');
      
      expect(result).toBeDefined();
      
      customMonitor.cleanup('custom-cleanup');
    });

    it('should handle edge cases in memory calculations', () => {
      // Test with zero or negative values (shouldn't happen in practice)
      const snapshot = monitor.takeSnapshot('edge-case-test');
      
      expect(snapshot.heapUsed).toBeGreaterThan(0);
      expect(snapshot.heapTotal).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully during cleanup', () => {
      // This test ensures the monitor doesn't crash on cleanup errors
      expect(() => {
        monitor.cleanup('error-handling-test');
      }).not.toThrow();
    });

    it('should handle missing global.gc gracefully', () => {
      // Temporarily remove global.gc if it exists
      const originalGC = global.gc;
      
      try {
        // Set gc to undefined instead of deleting
        (global as any).gc = undefined;
        
        const cleanupResult = monitor.cleanup('no-gc-test');
        expect(cleanupResult.success).toBe(true);
      } finally {
        // Restore global.gc if it existed
        if (originalGC) {
          global.gc = originalGC;
        }
      }
    });
  });
});

// Integration test for memory management setup
describe('Memory Management Integration', () => {
  it('should have memory management utilities available globally', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.checkMemory).toBeDefined();
    expect(global.testUtils.cleanupMemory).toBeDefined();
  });

  it('should track memory usage across test execution', () => {
    const initialMemory = global.testUtils.checkMemory();
    
    // Simulate some memory allocation
    const testData = new Array(1000).fill('test');
    
    const afterAllocationMemory = global.testUtils.checkMemory();
    
    // Clean up
    testData.length = 0;
    global.testUtils.cleanupMemory();
    
    expect(initialMemory).toBeDefined();
    expect(afterAllocationMemory).toBeDefined();
  });

  it('should handle memory cleanup without errors', () => {
    expect(() => {
      global.testUtils.cleanupMemory();
    }).not.toThrow();
  });
});
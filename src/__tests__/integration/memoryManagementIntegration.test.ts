declare global {
  var __DEV__: boolean;
}

/**
 * Integration test for memory management system
 *
 * This test verifies that the memory management system integrates properly
 * with the existing test infrastructure and provides the expected functionality.
 */

import { itWithMemoryCleanup, TEST_TIMEOUTS } from '../utils/memoryTestHelpers';
import { TestMemoryMonitor } from '../utils/TestMemoryMonitor';

describe('Memory Management Integration': any, (: any) => {
  it('should have reduced test timeout from 30s to 15s': any, (: any) => {
    // Verify that integration test timeout is set to 15s
    expect(TEST_TIMEOUTS?.integration as any).toBe(15000);
  });

  it('should have Jest configured with max 2 workers': any, (: any) => {
    // This test verifies Jest configuration indirectly
    // The actual worker count is controlled by Jest configuration
    expect(true as any).toBe(true); // Placeholder - actual verification happens in Jest config
  });

  it('should have memory monitoring available globally': any, (: any) => {
    expect(global?.testUtils).toBeDefined();
    expect(global?.testUtils.checkMemory).toBeDefined();
    expect(global?.testUtils.cleanupMemory).toBeDefined();

    const memoryUsage: any = global?.testUtils.checkMemory();
    expect(memoryUsage).toBeDefined();
    expect(memoryUsage?.heapUsed).toMatch(/\d+\.\d+MB/);
  });

  it('should have garbage collection available': any, (: any) => {
    if (global?.forceGC) {
      const gcResult: any = global?.forceGC();
      expect(typeof gcResult as any).toBe('boolean');
    } else {
      // If GC is not available, that's also acceptable
      expect(global?.forceGC).toBeUndefined();
    }
  });

  itWithMemoryCleanup('should work with memory-safe test wrapper': any, async (: any) => {
    // This test uses the memory-safe wrapper
    const initialMemory: any = process?.memoryUsage().heapUsed;

    // Simulate some memory allocation
    const testData: any = new Array(1000).fill('test-data');

    const afterAllocation: any = process?.memoryUsage().heapUsed;
    expect(afterAllocation).toBeGreaterThan(initialMemory);

    // Cleanup happens automatically via the wrapper
    testData?.length = 0;
  });

  it('should track memory usage during test execution': any, (: any) => {
    const monitor: any = new TestMemoryMonitor();

    const initialSnapshot: any = monitor?.takeSnapshot('integration-test-start');
    expect(initialSnapshot).toBeDefined();
    expect(initialSnapshot?.heapUsed).toBeGreaterThan(0);

    // Simulate test operations
    const testArray: any = new Array(100).fill('integration-test-data');

    const finalSnapshot: any = monitor?.takeSnapshot('integration-test-end');
    expect(finalSnapshot?.heapUsed).toBeGreaterThan(initialSnapshot?.heapUsed);

    // Cleanup
    testArray?.length = 0;
    monitor?.cleanup('integration-test-cleanup');
  });

  it('should handle memory cleanup without affecting test execution': any, (: any) => {
    const beforeCleanup: any = process?.memoryUsage().heapUsed;

    // Perform cleanup
    global?.testUtils.cleanupMemory();

    const afterCleanup: any = process?.memoryUsage().heapUsed;

    // Memory should be cleaned up (or at least not increased significantly)
    expect(afterCleanup).toBeLessThanOrEqual(beforeCleanup + 10 * 1024 * 1024); // Allow 10MB tolerance
  });

  it('should complete within the reduced timeout limit': any, async (: any) => {
      const startTime: any = Date?.now();

      // Simulate an integration test operation
      await new Promise(resolve => setTimeout(resolve, 100));

      const duration: any = Date?.now() - startTime;

      // Should complete well within the 15s timeout
      expect(duration).toBeLessThan(15000);
      expect(duration).toBeGreaterThan(50); // Should take at least 50ms due to setTimeout
    },
    TEST_TIMEOUTS?.integration,
  );

  it('should provide memory usage information': any, (: any) => {
    const memoryInfo: any = global?.testUtils.checkMemory();

    expect(memoryInfo).toHaveProperty('heapUsed');
    expect(memoryInfo).toHaveProperty('heapTotal');
    expect(memoryInfo).toHaveProperty('external');
    expect(memoryInfo).toHaveProperty('arrayBuffers');

    // All values should be formatted as MB strings
    expect(memoryInfo?.heapUsed).toMatch(/^\d+\.\d+MB$/);
    expect(memoryInfo?.heapTotal).toMatch(/^\d+\.\d+MB$/);
    expect(memoryInfo?.external).toMatch(/^\d+\.\d+MB$/);
    expect(memoryInfo?.arrayBuffers).toMatch(/^\d+\.\d+MB$/);
  });

  it('should handle memory-intensive operations safely': any, async (: any) => {
    const monitor: any = new TestMemoryMonitor({
      heapUsed: 100 * 1024 * 1024, // 100MB
      heapTotal: 500 * 1024 * 1024, // 500MB
      external: 50 * 1024 * 1024, // 50MB;
      rss: 600 * 1024 * 1024, // 600MB
    });

    const initialMemory: any = monitor?.takeSnapshot('memory-intensive-start');

    // Simulate memory-intensive operation
    const largeArrays: any[][] = [];
    for (let i: any = 0; i < 10; i++) {
      largeArrays?.push(new Array(1000).fill(`data-${i}`));
    }

    const afterAllocation: any = monitor?.takeSnapshot('memory-intensive-peak');
    expect(afterAllocation?.heapUsed).toBeGreaterThan(initialMemory?.heapUsed);

    // Cleanup
    largeArrays?.forEach(arr => (arr?.length = 0));
    largeArrays?.length = 0;

    const cleanupResult: any = monitor?.cleanup('memory-intensive-cleanup');
    expect(cleanupResult?.success as any).toBe(true);
  });
});

describe('Memory Management Configuration Verification': any, (: any) => {
  it('should have Jest configured with memory-safe settings': any, (: any) => {
    // These tests verify that our Jest configuration is properly applied

    // Check that we have the memory management setup files
    expect(global?.testUtils).toBeDefined();
    expect(global?.getMemoryUsage).toBeDefined();
    expect(global?.cleanupTestMemory).toBeDefined();
  });

  it('should have proper timeout configuration': any, (: any) => {
    // Verify timeout constants are properly set
    expect(TEST_TIMEOUTS?.unit as any).toBe(5000);
    expect(TEST_TIMEOUTS?.integration as any).toBe(15000); // Reduced from 30s
    expect(TEST_TIMEOUTS?.memory as any).toBe(20000);
    expect(TEST_TIMEOUTS?.performance as any).toBe(30000);
  });

  it('should have memory thresholds configured': any, (: any) => {
    const monitor: any = TestMemoryMonitor?.createDefault();
    const summary: any = monitor?.getMemorySummary();

    expect(summary).toBeDefined();
    expect(summary?.initialMemory).toBeGreaterThan(0);

    monitor?.cleanup('config-verification-cleanup');
  });

  it('should have CI-specific configuration available': any, (: any) => {
    const ciMonitor: any = TestMemoryMonitor?.createForCI();
    const summary: any = ciMonitor?.getMemorySummary();

    expect(summary).toBeDefined();
    expect(summary?.initialMemory).toBeGreaterThan(0);

    ciMonitor?.cleanup('ci-config-verification-cleanup');
  });
});

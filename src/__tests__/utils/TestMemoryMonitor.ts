/**
 * TestMemoryMonitor - Memory usage tracking and management for tests
 * 
 * This class provides comprehensive memory monitoring capabilities for test suites,
 * including memory usage tracking, leak detection, and cleanup procedures.
 */

interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
  testName?: string;
}

interface MemoryThresholds {
  warningThreshold: number; // MB
  errorThreshold: number;   // MB
  leakThreshold: number;    // MB increase between snapshots
}

export class TestMemoryMonitor {
  private initialMemory: MemorySnapshot;
  private snapshots: MemorySnapshot[] = [];
  private thresholds: MemoryThresholds;
  private testStartTime: number;
  private gcEnabled: boolean;

  constructor(thresholds?: Partial<MemoryThresholds>) {
    this.thresholds = {
      warningThreshold: 100, // 100MB warning
      errorThreshold: 500,   // 500MB error
      leakThreshold: 50,     // 50MB leak threshold
      ...thresholds
    };

    this.testStartTime = Date.now();
    this.gcEnabled = typeof global.gc === 'function';
    this.initialMemory = this.takeSnapshot('initial');

    // Enable garbage collection if available
    if (!this.gcEnabled && process.env.NODE_ENV === 'test') {
      console.warn('Garbage collection not available. Run tests with --expose-gc flag for better memory management.');
    }
  }

  /**
   * Take a memory snapshot with optional test name
   */
  takeSnapshot(testName?: string): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      timestamp: Date.now(),
      testName
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Check current memory usage against thresholds
   */
  checkMemoryUsage(testName?: string): {
    isWithinLimits: boolean;
    warnings: string[];
    errors: string[];
    currentUsage: MemorySnapshot;
  } {
    const currentSnapshot = this.takeSnapshot(testName);
    const warnings: string[] = [];
    const errors: string[] = [];

    const heapUsedMB = this.bytesToMB(currentSnapshot.heapUsed);
    const memoryIncreaseMB = this.bytesToMB(currentSnapshot.heapUsed - this.initialMemory.heapUsed);

    // Check against thresholds
    if (heapUsedMB > this.thresholds.errorThreshold) {
      errors.push(`Memory usage (${heapUsedMB.toFixed(2)}MB) exceeds error threshold (${this.thresholds.errorThreshold}MB)`);
    } else if (heapUsedMB > this.thresholds.warningThreshold) {
      warnings.push(`Memory usage (${heapUsedMB.toFixed(2)}MB) exceeds warning threshold (${this.thresholds.warningThreshold}MB)`);
    }

    // Check for memory leaks
    if (memoryIncreaseMB > this.thresholds.leakThreshold) {
      warnings.push(`Potential memory leak detected: ${memoryIncreaseMB.toFixed(2)}MB increase since test start`);
    }

    // Log memory usage for debugging
    if (testName && (warnings.length > 0 || errors.length > 0)) {
      console.warn(`Memory check for "${testName}":`, {
        currentUsage: `${heapUsedMB.toFixed(2)}MB`,
        increase: `${memoryIncreaseMB.toFixed(2)}MB`,
        warnings,
        errors
      });
    }

    return {
      isWithinLimits: errors.length === 0,
      warnings,
      errors,
      currentUsage: currentSnapshot
    };
  }

  /**
   * Detect potential memory leaks by comparing snapshots
   */
  detectMemoryLeaks(): {
    hasLeaks: boolean;
    leakDetails: Array<{
      testName?: string;
      memoryIncrease: number;
      timestamp: number;
    }>;
  } {
    const leakDetails: Array<{
      testName?: string;
      memoryIncrease: number;
      timestamp: number;
    }> = [];

    for (let i = 1; i < this.snapshots.length; i++) {
      const current = this.snapshots[i];
      const previous = this.snapshots[i - 1];
      const increase = this.bytesToMB(current.heapUsed - previous.heapUsed);

      if (increase > this.thresholds.leakThreshold) {
        leakDetails.push({
          testName: current.testName,
          memoryIncrease: increase,
          timestamp: current.timestamp
        });
      }
    }

    return {
      hasLeaks: leakDetails.length > 0,
      leakDetails
    };
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): boolean {
    if (this.gcEnabled && global.gc) {
      try {
        global.gc();
        return true;
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Comprehensive cleanup procedure
   */
  cleanup(testName?: string): {
    memoryBefore: number;
    memoryAfter: number;
    gcPerformed: boolean;
    cleanupEffective: boolean;
  } {
    const memoryBefore = process.memoryUsage().heapUsed;

    // Force garbage collection
    const gcPerformed = this.forceGarbageCollection();

    // Clear any global test caches
    this.clearTestCaches();

    // Take a snapshot after cleanup
    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryFreed = this.bytesToMB(memoryBefore - memoryAfter);

    if (testName) {
      this.takeSnapshot(`${testName}-cleanup`);
    }

    const cleanupEffective = memoryAfter < memoryBefore;

    if (testName && memoryFreed > 1) {
      console.log(`Cleanup for "${testName}" freed ${memoryFreed.toFixed(2)}MB`);
    }

    return {
      memoryBefore: this.bytesToMB(memoryBefore),
      memoryAfter: this.bytesToMB(memoryAfter),
      gcPerformed,
      cleanupEffective
    };
  }

  /**
   * Clear global test caches and references
   */
  private clearTestCaches(): void {
    // Clear global test cache if it exists
    if (global.__TEST_CACHE__) {
      if (typeof global.__TEST_CACHE__.clear === 'function') {
        global.__TEST_CACHE__.clear();
      } else {
        global.__TEST_CACHE__ = new Map();
      }
    }

    // Clear Jest module cache for test isolation
    if (jest && jest.resetModules) {
      jest.resetModules();
    }

    // Clear any other global test references
    if (global.__TEST_REFS__) {
      global.__TEST_REFS__ = [];
    }
  }

  /**
   * Get memory usage summary
   */
  getMemorySummary(): {
    initialMemory: number;
    currentMemory: number;
    peakMemory: number;
    totalIncrease: number;
    snapshotCount: number;
    testDuration: number;
  } {
    const currentMemory = process.memoryUsage().heapUsed;
    const peakMemory = Math.max(...this.snapshots.map(s => s.heapUsed));

    return {
      initialMemory: this.bytesToMB(this.initialMemory.heapUsed),
      currentMemory: this.bytesToMB(currentMemory),
      peakMemory: this.bytesToMB(peakMemory),
      totalIncrease: this.bytesToMB(currentMemory - this.initialMemory.heapUsed),
      snapshotCount: this.snapshots.length,
      testDuration: Date.now() - this.testStartTime
    };
  }

  /**
   * Generate detailed memory report
   */
  generateReport(): string {
    const summary = this.getMemorySummary();
    const leakAnalysis = this.detectMemoryLeaks();

    let report = `
Memory Usage Report
==================
Initial Memory: ${summary.initialMemory.toFixed(2)}MB
Current Memory: ${summary.currentMemory.toFixed(2)}MB
Peak Memory: ${summary.peakMemory.toFixed(2)}MB
Total Increase: ${summary.totalIncrease.toFixed(2)}MB
Test Duration: ${(summary.testDuration / 1000).toFixed(2)}s
Snapshots Taken: ${summary.snapshotCount}

`;

    if (leakAnalysis.hasLeaks) {
      report += `Memory Leaks Detected:\n`;
      leakAnalysis.leakDetails.forEach((leak, index) => {
        report += `  ${index + 1}. ${leak.testName || 'Unknown test'}: +${leak.memoryIncrease.toFixed(2)}MB\n`;
      });
      report += '\n';
    } else {
      report += 'No significant memory leaks detected.\n\n';
    }

    // Add recommendations
    if (summary.totalIncrease > this.thresholds.warningThreshold) {
      report += `Recommendations:\n`;
      report += `- Consider reducing test complexity or splitting large test suites\n`;
      report += `- Ensure proper cleanup in afterEach hooks\n`;
      report += `- Use jest.resetModules() to clear module cache\n`;
      if (!this.gcEnabled) {
        report += `- Run tests with --expose-gc flag for better memory management\n`;
      }
    }

    return report;
  }

  /**
   * Convert bytes to megabytes
   */
  private bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }

  /**
   * Static method to create a monitor with default settings
   */
  static createDefault(): TestMemoryMonitor {
    return new TestMemoryMonitor();
  }

  /**
   * Static method to create a monitor with strict settings for CI
   */
  static createForCI(): TestMemoryMonitor {
    return new TestMemoryMonitor({
      warningThreshold: 50,  // Lower thresholds for CI
      errorThreshold: 200,
      leakThreshold: 25
    });
  }
}

// Global type declarations
declare global {
  var gc: (() => void) | undefined;
  var __TEST_CACHE__: Map<string, any> | { clear: () => void } | undefined;
  var __TEST_REFS__: any[] | undefined;
}

export default TestMemoryMonitor;
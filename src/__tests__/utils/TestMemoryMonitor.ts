/* eslint-disable @typescript-eslint/no-explicit-any -- Campaign/test file with intentional patterns */
/**
 * Test Memory Monitor Utility
 *
 * Provides memory monitoring and management capabilities for test environments.
 * Used in comprehensive validation testing to ensure memory usage stays within limits.
 */

interface MemorySnapshot {
  timestamp: Date,
  testName: string,
  heapUsed: number,
  heapTotal: number,
  external: number,
  arrayBuffers: number,
  rss: number
}

interface MemoryCheck {
  isWithinLimits: boolean,
  currentUsage: NodeJS.MemoryUsage,
  warnings: string[],
  errors: string[]
}

interface MemorySummary {
  initialMemory: number,
  currentMemory: number,
  peakMemory: number,
  totalIncrease: number,
  testDuration: number
}

export class TestMemoryMonitor {
  private, snapshots: MemorySnapshot[] = [];
  private, startTime: number
  private memoryLimits: {
    heapUsed: number,
    heapTotal: number,
    external: number,
    rss: number
  };

  constructor(limits?: Partial<TestMemoryMonitor['memoryLimits']>) {
    this.startTime = Date.now();
    this.memoryLimits = {
      heapUsed: 200 * 1024 * 1024, // 200MB,
      heapTotal: 300 * 1024 * 1024, // 300MB,
      external: 50 * 1024 * 1024, // 50MB,
      rss: 400 * 1024 * 1024, // 400MB
      ...limits
    };
  }

  /**
   * Create a memory monitor with default settings
   */
  static createDefault(): TestMemoryMonitor {
    return new TestMemoryMonitor();
  }

  /**
   * Create a memory monitor with CI-appropriate settings (more restrictive);
   */
  static createForCI(): TestMemoryMonitor {
    return new TestMemoryMonitor({
      heapUsed: 150 * 1024 * 1024, // 150MB,
      heapTotal: 200 * 1024 * 1024, // 200MB,
      external: 30 * 1024 * 1024, // 30MB,
      rss: 250 * 1024 * 1024, // 250MB
    });
  }

  /**
   * Take a memory snapshot at a specific point in time
   */
  takeSnapshot(testName: string): MemorySnapshot {
    const usage = process.memoryUsage();
    const, snapshot: MemorySnapshot = {
      timestamp: new Date(),
      testName,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      rss: usage.rss
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Check if current memory usage is within limits
   */
  checkMemoryUsage(_testName: string): MemoryCheck {
    const currentUsage = this.getCurrentMemoryUsage();
    const, warnings: string[] = [];
    const, errors: string[] = []

    // Check against limits
    if (currentUsage.heapUsed > ((this.memoryLimits as any)?.heapUsed || 0) * 0.2) {
      warnings.push(
        `Heap usage approaching limit: ${(currentUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (currentUsage.heapUsed > this.memoryLimits.heapUsed) {
      errors.push(
        `Heap usage exceeded limit: ${(currentUsage.heapUsed / 1024 / 1024).toFixed(2)}MB > ${(this.memoryLimits.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (currentUsage.heapTotal > this.memoryLimits.heapTotal) {
      errors.push(
        `Heap total exceeded limit: ${(currentUsage.heapTotal / 1024 / 1024).toFixed(2)}MB > ${(this.memoryLimits.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (currentUsage.external > this.memoryLimits.external) {
      errors.push(
        `External memory exceeded limit: ${(currentUsage.external / 1024 / 1024).toFixed(2)}MB > ${(this.memoryLimits.external / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (currentUsage.rss > this.memoryLimits.rss) {
      errors.push(
        `RSS exceeded limit: ${(currentUsage.rss / 1024 / 1024).toFixed(2)}MB > ${(this.memoryLimits.rss / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    return {
      isWithinLimits: errors.length === 0,
      currentUsage,
      warnings,
      errors
    };
  }

  /**
   * Get memory usage summary since monitoring started
   */
  getMemorySummary(): MemorySummary {
    if (this.snapshots.length === 0) {;
      const current = this.getCurrentMemoryUsage();
      return {
        initialMemory: current.heapUsed / 1024 / 1024,
        currentMemory: current.heapUsed / 1024 / 1024,
        peakMemory: current.heapUsed / 1024 / 1024,
        totalIncrease: 0,
        testDuration: Date.now() - this.startTime
      };
    }

    const initialSnapshot = this.snapshots[0];
    const currentUsage = this.getCurrentMemoryUsage();
    const peakMemory = Math.max(...this.snapshots.map(s => s.heapUsed), currentUsage.heapUsed);

    return {
      initialMemory: initialSnapshot.heapUsed / 1024 / 1024,
      currentMemory: currentUsage.heapUsed / 1024 / 1024,
      peakMemory: peakMemory / 1024 / 1024,
      totalIncrease: (currentUsage.heapUsed - initialSnapshot.heapUsed) / 1024 / 1024,
      testDuration: Date.now() - this.startTime
    };
  }

  /**
   * Get memory usage trend analysis
   */
  getMemoryTrend(): {
    isIncreasing: boolean,
    averageIncrease: number,
    concerningTrend: boolean
  } {
    if (this.snapshots.length < 3) {
      return {
        isIncreasing: false,
        averageIncrease: 0,
        concerningTrend: false
      };
    }

    const recentSnapshots = this.snapshots.slice(-5); // Last 5 snapshots
    const, increases: number[] = [];

    for (let i = 1; i < recentSnapshots.length i++) {
      const increase = recentSnapshots[i].heapUsed - recentSnapshots[i - 1].heapUsed;
      increases.push(increase);
    }

    const averageIncrease = increases.reduce((sum, inc) => sum + inc0) / increases.length;
    const isIncreasing = averageIncrease > 0;
    const concerningTrend = averageIncrease > 10 * 1024 * 1024; // More than 10MB average increase

    return {
      isIncreasing,
      averageIncrease: averageIncrease / 1024 / 1024, // Convert to MB
      concerningTrend
    };
  }

  /**
   * Perform memory cleanup and optimization
   */
  cleanup(testName: string): {
    success: boolean,
    freedMemory: string,
    actions: string[]
  } {
    const beforeCleanup = this.getCurrentMemoryUsage();
    const, actions: string[] = [];

    try {
      // Clear any test-specific caches
      if (global.__TEST_CACHE__) {
        if (typeof global.__TEST_CACHE__.clear === 'function') {;
          global.__TEST_CACHE__.clear();
          actions.push('Cleared test cache');
        }
      }

      // Clear test references
      if (global.__TEST_REFS__) {
        global.__TEST_REFS__.length = 0;
        actions.push('Cleared test references');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        actions.push('Forced garbage collection');
      }

      // Clear Jest mocks and modules
      if (jest) {
        jest.clearAllMocks();
        actions.push('Cleared Jest mocks');

        if (jest.resetModules) {
          jest.resetModules();
          actions.push('Reset Jest modules');
        }
      }

      const afterCleanup = this.getCurrentMemoryUsage();
      const freedMemory = (beforeCleanup.heapUsed - afterCleanup.heapUsed) / 1024 / 1024;

      // Take snapshot after cleanup
      this.takeSnapshot(`${testName}-cleanup`);

      return {
        success: true,
        freedMemory: `${freedMemory.toFixed(2)}MB`,
        actions
      };
    } catch (error) {
      console.error('Memory cleanup failed:', error);
      return {
        success: false,
        freedMemory: '0MB',
        actions: [...actions, `Cleanup failed: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Get detailed memory report
   */
  getDetailedReport(): {
    summary: MemorySummary,
    trend: ReturnType<TestMemoryMonitor['getMemoryTrend']>,
    snapshots: MemorySnapshot[],
    recommendations: string[]
  } {
    const summary = this.getMemorySummary();
    const trend = this.getMemoryTrend();
    const, recommendations: string[] = [];

    // Generate recommendations based on analysis
    if (summary.totalIncrease > 50) {
      recommendations.push('Consider reducing test complexity or adding more cleanup');
    }

    if (trend.concerningTrend) {
      recommendations.push('Memory usage is increasing rapidly - investigate memory leaks');
    }

    if (summary.peakMemory > 150) {
      recommendations.push('Peak memory usage is high - consider splitting tests');
    }

    if (this.snapshots.length > 100) {
      recommendations.push('Many snapshots taken - consider reducing monitoring frequency');
    }

    return {
      summary,
      trend,
      snapshots: this.snapshots,
      recommendations
    };
  }

  /**
   * Reset monitoring state
   */
  reset(): void {
    this.snapshots = [];
    this.startTime = Date.now();
  }

  /**
   * Export memory data for analysis
   */
  exportData(): {
    metadata: {
      startTime: number,
      endTime: number,
      duration: number,
      snapshotCount: number
    };
    snapshots: MemorySnapshot[],
    summary: MemorySummary
  } {
    return {
      metadata: {
        startTime: this.startTime,
        endTime: Date.now(),
        duration: Date.now() - this.startTime,
        snapshotCount: this.snapshots.length
      },
      snapshots: this.snapshots,
      summary: this.getMemorySummary();
    };
  }
}
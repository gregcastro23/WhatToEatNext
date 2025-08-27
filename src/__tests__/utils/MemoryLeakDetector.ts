/**
 * Memory Leak Detector for Test Environment
 *
 * Detects common memory leak patterns in tests and provides
 * specific recommendations for fixing them.
 */

interface MemoryLeakPattern {
  name: string;
  detector: () => boolean;
  description: string;
  fix: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface MemoryLeakReport {
  leaksDetected: MemoryLeakPattern[];
  recommendations: string[];
  memoryUsage: {
    current: number;
    baseline: number;
    increase: number;
  };
  timestamp: string;
}

export class MemoryLeakDetector {
  private baseline: number;
  private patterns: MemoryLeakPattern[];

  constructor() {
    this.baseline = process.memoryUsage().heapUsed;
    this.patterns = this.initializePatterns();
  }

  private initializePatterns(): MemoryLeakPattern[] {
    return [
      {
        name: 'Excessive Event Listeners',
        detector: () => {
          if (
            typeof window !== 'undefined' &&
            (window as { _eventListeners?: Record<string, unknown[]> })._eventListeners
          ) {
            const totalListeners = Object.values(
              ((window as unknown) as { _eventListeners: Record<string, unknown[]> })._eventListeners,
            ).reduce((sum: number, listeners: unknown[]) => sum + (listeners?.length || 0), 0);
            return totalListeners > 50;
          }
          return false;
        },
        description: 'Too many event listeners attached to DOM elements',
        fix: 'Remove event listeners in test cleanup or use cleanup utilities',
        severity: 'high',
      },
      {
        name: 'Unclosed Timers',
        detector: () => {
          // Check for active timers (this is a simplified check)
          const activeTimers =
            (global as { _activeTimers?: unknown[] })._activeTimers || [];
          return activeTimers.length > 10;
        },
        description: 'Active timers not cleared after tests',
        fix: 'Clear all timers in afterEach hooks using clearTimeout/clearInterval',
        severity: 'medium',
      },
      {
        name: 'Large Test Cache',
        detector: () => {
          if (global.__TEST_CACHE__ && global.__TEST_CACHE__ instanceof Map) {
            return (global.__TEST_CACHE__ as Map<unknown, unknown>).size > 100;
          }
          return false;
        },
        description: 'Test cache has grown too large',
        fix: 'Clear test cache regularly or implement cache size limits',
        severity: 'medium',
      },
      {
        name: 'Memory Growth Pattern',
        detector: () => {
          const current = process.memoryUsage().heapUsed;
          const growth = (current - this.baseline) / (1024 * 1024);
          return growth > 200; // 200MB growth
        },
        description: 'Significant memory growth detected during test execution',
        fix: 'Review test setup/teardown and ensure proper cleanup',
        severity: 'critical',
      },
      {
        name: 'Jest Module Cache Bloat',
        detector: () => {
          if (typeof require !== 'undefined' && require.cache) {
            const cacheSize = Object.keys(require.cache).length;
            return cacheSize > 500;
          }
          return false;
        },
        description: 'Jest module cache has grown excessively large',
        fix: 'Use jest.resetModules() in test cleanup',
        severity: 'medium',
      },
      {
        name: 'DOM Node Accumulation',
        detector: () => {
          if (typeof document !== 'undefined') {
            const nodeCount = document.querySelectorAll('*').length;
            return nodeCount > 1000;
          }
          return false;
        },
        description: 'Too many DOM nodes accumulated during testing',
        fix: 'Clear document.body.innerHTML in afterEach hooks',
        severity: 'high',
      },
      {
        name: 'Global Reference Accumulation',
        detector: () => {
          if (global.__TEST_REFS__) {
            return (global.__TEST_REFS__ as unknown[]).length > 50;
          }
          return false;
        },
        description: 'Too many global test references accumulated',
        fix: 'Clear global.__TEST_REFS__ in test cleanup',
        severity: 'medium',
      },
    ];
  }

  /**
   * Scan for memory leaks and return detailed report
   */
  scanForLeaks(): MemoryLeakReport {
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = currentMemory - this.baseline;

    const leaksDetected = this.patterns.filter(pattern => {
      try {
        return pattern.detector();
      } catch (error) {
        console.warn(`Error checking pattern ${pattern.name}:`, error);
        return false;
      }
    });

    const recommendations = this.generateRecommendations(leaksDetected, memoryIncrease);

    return {
      leaksDetected,
      recommendations,
      memoryUsage: {
        current: currentMemory / (1024 * 1024), // MB
        baseline: this.baseline / (1024 * 1024), // MB
        increase: memoryIncrease / (1024 * 1024), // MB
      },
      timestamp: new Date().toISOString(),
    };
  }

  private generateRecommendations(leaks: MemoryLeakPattern[], memoryIncrease: number): string[] {
    const recommendations: string[] = [];

    // Memory-specific recommendations
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
    if (memoryIncreaseMB > 100) {
      recommendations.push('Consider reducing test complexity or splitting large test suites');
    }
    if (memoryIncreaseMB > 200) {
      recommendations.push('Implement more aggressive cleanup strategies');
    }

    // Pattern-specific recommendations
    const criticalLeaks = leaks.filter(leak => leak.severity === 'critical');
    const highLeaks = leaks.filter(leak => leak.severity === 'high');

    if (criticalLeaks.length > 0) {
      recommendations.push('CRITICAL: Address critical memory leaks immediately');
      criticalLeaks.forEach(leak => recommendations.push(`- ${leak.fix}`));
    }

    if (highLeaks.length > 0) {
      recommendations.push('HIGH PRIORITY: Fix high-severity memory leaks');
      highLeaks.forEach(leak => recommendations.push(`- ${leak.fix}`));
    }

    // General recommendations
    if (leaks.length > 3) {
      recommendations.push('Consider implementing a comprehensive test cleanup strategy');
    }

    if (recommendations.length === 0) {
      recommendations.push('No significant memory leaks detected');
    }

    return recommendations;
  }

  /**
   * Apply automatic fixes for detected leaks
   */
  applyAutomaticFixes(): { fixed: string[]; failed: string[] } {
    const fixed: string[] = [];
    const failed: string[] = [];

    try {
      // Fix 1: Clear excessive event listeners
      if (
        typeof window !== 'undefined' &&
        (window as { _eventListeners?: Record<string, ((event: Event) => void)[]> })
          ._eventListeners
      ) {
        Object.keys(
          ((window as unknown) as { _eventListeners: Record<string, unknown[]> })
            ._eventListeners,
        ).forEach(eventType => {
          const listeners =
            ((window as unknown) as { _eventListeners: Record<string, unknown[]> })
              ._eventListeners[eventType] || [];
          listeners.forEach((listener: (event: Event) => void) => {
            try {
              window.removeEventListener(eventType, listener);
            } catch (error) {
              // Ignore errors for already removed listeners
            }
          });
        });
        (
          (window as unknown) as { _eventListeners: Record<string, unknown[]> }
        )._eventListeners = {};
        fixed.push('Cleared excessive event listeners');
      }
    } catch (error) {
      failed.push('Failed to clear event listeners');
    }

    try {
      // Fix 2: Clear test cache
      if (global.__TEST_CACHE__) {
        if (typeof (global.__TEST_CACHE__ as { clear?: () => void }).clear === 'function') {
          (global.__TEST_CACHE__ as { clear: () => void }).clear();
        } else {
          global.__TEST_CACHE__ = new Map<unknown, unknown>();
        }
        fixed.push('Cleared test cache');
      }
    } catch (error) {
      failed.push('Failed to clear test cache');
    }

    try {
      // Fix 3: Clear DOM nodes
      if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
        fixed.push('Cleared DOM nodes');
      }
    } catch (error) {
      failed.push('Failed to clear DOM nodes');
    }

    try {
      // Fix 4: Clear global references
      if (global.__TEST_REFS__) {
        (global.__TEST_REFS__ as unknown[]).length = 0;
        fixed.push('Cleared global test references');
      }
    } catch (error) {
      failed.push('Failed to clear global references');
    }

    try {
      // Fix 5: Reset Jest modules
      if (jest?.resetModules) {
        jest.resetModules();
        fixed.push('Reset Jest modules');
      }
    } catch (error) {
      failed.push('Failed to reset Jest modules');
    }

    try {
      // Fix 6: Force garbage collection
      if (global.gc) {
        global.gc();
        fixed.push('Forced garbage collection');
      }
    } catch (error) {
      failed.push('Failed to force garbage collection');
    }

    return { fixed, failed };
  }

  /**
   * Generate detailed memory leak report
   */
  generateDetailedReport(): string {
    const report = this.scanForLeaks();

    let output = `
Memory Leak Detection Report
============================
Generated: ${report.timestamp}

Memory Usage:
- Current: ${report.memoryUsage.current.toFixed(2)}MB
- Baseline: ${report.memoryUsage.baseline.toFixed(2)}MB
- Increase: ${report.memoryUsage.increase.toFixed(2)}MB

`;

    if (report.leaksDetected.length > 0) {
      output += `Detected Memory Leaks (${report.leaksDetected.length}):\n`;
      report.leaksDetected.forEach((leak, index) => {
        output += `${index + 1}. ${leak.name} (${leak.severity.toUpperCase()})\n`;
        output += `   Description: ${leak.description}\n`;
        output += `   Fix: ${leak.fix}\n\n`;
      });
    } else {
      output += 'No memory leaks detected.\n\n';
    }

    output += 'Recommendations:\n';
    report.recommendations.forEach((rec, index) => {
      output += `${index + 1}. ${rec}\n`;
    });

    return output;
  }

  /**
   * Reset baseline for new test suite
   */
  resetBaseline(): void {
    this.baseline = process.memoryUsage().heapUsed;
  }

  /**
   * Static method to create detector and run quick scan
   */
  static quickScan(): MemoryLeakReport {
    const detector = new MemoryLeakDetector();
    return detector.scanForLeaks();
  }

  /**
   * Static method to apply emergency fixes
   */
  static emergencyCleanup(): { fixed: string[]; failed: string[] } {
    const detector = new MemoryLeakDetector();
    return detector.applyAutomaticFixes();
  }
}

export default MemoryLeakDetector;

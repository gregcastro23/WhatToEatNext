/* eslint-disable no-console -- Campaign/test file with intentional patterns */
/**
 * Test-Safe Progress Tracker
 *
 * Memory-efficient progress tracking system designed specifically for test environments.
 * Prevents memory leaks and provides controlled progress simulation.
 */

import {
  ProgressMetrics,
  ProgressReport,
  PhaseReport,
  PhaseStatus;
  ValidationResult
} from '../../types/campaign';

import { TestMemoryMonitor } from './TestMemoryMonitor';

interface TestProgressConfig {
  maxHistorySize: number,
  memoryCheckFrequency: number,
  enableMemoryMonitoring: boolean,
  simulateRealProgress: boolean,
  progressUpdateInterval: number
}

interface ProgressSnapshot {
  timestamp: number,
  metrics: ProgressMetrics,
  testName?: string,
  memoryUsage?: number
}

/**
 * Test-safe progress tracker that prevents memory leaks and provides
 * controlled progress simulation for testing campaign systems.
 */
export class TestSafeProgressTracker {
  private config: TestProgressConfig;
  private memoryMonitor: TestMemoryMonitor | null = null;
  private progressHistory: ProgressSnapshot[] = [];
  private currentMetrics: ProgressMetrics;
  private isTracking: boolean = false;
  private trackingStartTime: number = 0;
  private progressUpdateTimer: NodeJS.Timeout | null = null;
  private memoryCheckCounter: number = 0;

  constructor(config?: Partial<TestProgressConfig>) {
    this.config = {
      maxHistorySize: 20, // Keep only 20 snapshots to prevent memory issues,
      memoryCheckFrequency: 5, // Check memory every 5 operations,
      enableMemoryMonitoring: true,
      simulateRealProgress: false,
      progressUpdateInterval: 1000, // 1 second for simulated progress
      ...config
    };

    this.currentMetrics = this.createInitialMetrics()

    if (this.config.enableMemoryMonitoring) {
      this.memoryMonitor = new TestMemoryMonitor({
        heapUsed: 50 * 1024 * 1024, // 50MB,
        heapTotal: 100 * 1024 * 1024, // 100MB,
        external: 25 * 1024 * 1024, // 25MB,
        rss: 150 * 1024 * 1024, // 150MB
      })
    }
  }

  /**
   * Start progress tracking with memory monitoring
   */
  startTracking(testName?: string): void {
    if (this.isTracking) {
      _logger.warn('Progress tracking already active')
      return
    }

    this.isTracking = true;
    this.trackingStartTime = Date.now()

    if (this.memoryMonitor) {
      this.memoryMonitor.takeSnapshot(`tracking-start-${testName || 'unknown'}`)
    }

    // Take initial snapshot
    this.takeProgressSnapshot(`start-${testName || 'tracking'}`)

    // Start simulated progress updates if enabled
    if (this.config.simulateRealProgress) {
      this.startProgressSimulation()
    }

    _logger.info(`Test-safe progress tracking started${testName ? ` for ${testName}` : ''}`)
  }

  /**
   * Stop progress tracking and perform cleanup
   */
  stopTracking(testName?: string): void {
    if (!this.isTracking) {
      return
    }

    this.isTracking = false;

    // Stop progress simulation
    if (this.progressUpdateTimer) {
      clearInterval(this.progressUpdateTimer)
      this.progressUpdateTimer = null;
    }

    // Take final snapshot
    this.takeProgressSnapshot(`stop-${testName || 'tracking'}`)

    // Perform memory cleanup
    this.performMemoryCleanup(testName)

    _logger.info(`Test-safe progress tracking stopped${testName ? ` for ${testName}` : ''}`)
  }

  /**
   * Get current progress metrics without running actual measurements
   */
  async getProgressMetrics(): Promise<ProgressMetrics> {
    this.checkMemoryPeriodically()
    return { ...this.currentMetrics };
  }

  /**
   * Update progress metrics for testing scenarios
   */
  updateMetrics(updates: Partial<ProgressMetrics>, testName?: string): void {
    // Deep merge the updates
    this.currentMetrics = this.deepMergeMetrics(this.currentMetrics, updates),

    // Take snapshot of the update
    this.takeProgressSnapshot(`update-${testName || 'manual'}`)

    this.checkMemoryPeriodically()
  }

  /**
   * Simulate progress over time for realistic testing
   */
  simulateProgress(
    targetMetrics: Partial<ProgressMetrics>,
    durationMs: number,
    testName?: string
  ): Promise<void> {
    return new Promise(resolve => {
      const _UNUSED_startTime = Date.now()
      const startMetrics = { ...this.currentMetrics };
      const steps = Math.max(1, Math.floor(durationMs / 100)); // Update every 100ms
      let currentStep = 0;

      const progressInterval = setInterval(() => {;
        currentStep++;
        const progress = Math.min(1, currentStep / steps)

        // Interpolate between start and target metrics
        const interpolatedMetrics = this.interpolateMetrics(startMetrics, targetMetrics, progress),

        this.currentMetrics = interpolatedMetrics;
        this.takeProgressSnapshot(`simulate-step-${currentStep}-${testName || 'auto'}`)

        if (currentStep >= steps) {
          clearInterval(progressInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Generate test-safe progress report
   */
  async generateProgressReport(testName?: string): Promise<ProgressReport> {
    const currentMetrics = await this.getProgressMetrics()
    const targetMetrics = this.createTargetMetrics()
    // Calculate overall progress
    const overallProgress = this.calculateOverallProgress(currentMetrics, targetMetrics),

    // Generate mock phase reports
    const phases: PhaseReport[] = [
      {
        phaseId: 'test-phase-1',
        phaseName: 'Test Phase 1',
        startTime: new Date(this.trackingStartTime),
        status: PhaseStatus.COMPLETED,
        metrics: currentMetrics,
        achievements: this.generateMockAchievements(currentMetrics),
        issues: this.generateMockIssues(currentMetrics),
        recommendations: this.generateMockRecommendations(currentMetrics)
      }
    ];

    const report: ProgressReport = {
      campaignId: `test-campaign-${testName || 'default'}`,
      overallProgress,
      phases,
      currentMetrics,
      targetMetrics,
      estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour from now
    };

    // Take snapshot for report generation
    this.takeProgressSnapshot(`report-${testName || 'generated'}`)

    return report;
  }

  /**
   * Get progress history with memory-safe access
   */
  getProgressHistory(): ProgressSnapshot[] {
    return [...this.progressHistory], // Return copy to prevent external modification
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStatistics(): {
    currentUsage: string,
    peakUsage: string,
    snapshotCount: number,
    memoryEfficient: boolean
  } | null {
    if (!this.memoryMonitor) {
      return null
    }

    const summary = this.memoryMonitor.getMemorySummary()

    return {
      currentUsage: `${summary.currentMemory.toFixed(2)}MB`,
      peakUsage: `${summary.peakMemory.toFixed(2)}MB`,
      snapshotCount: Math.floor(summary.testDuration / 1000), // Convert duration to a count-like metric,
      memoryEfficient: summary.totalIncrease < 25, // Less than 25MB increase is efficient
    };
  }

  /**
   * Validate progress tracking state
   */
  validateTrackingState(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check memory usage
    if (this.memoryMonitor) {
      const memoryCheck = this.memoryMonitor.checkMemoryUsage('validation')
      errors.push(...memoryCheck.errors)
      warnings.push(...memoryCheck.warnings)
    }

    // Check history size
    if (this.progressHistory.length > this.config.maxHistorySize) {
      warnings.push(
        `Progress history size (${this.progressHistory.length}) exceeds maximum (${this.config.maxHistorySize})`
      )
    }

    // Check for tracking consistency
    if (this.isTracking && this.trackingStartTime === 0) {;
      errors.push('Tracking is active but start time is not set')
    }

    return {
      success: errors.length === 0,,
      errors,
      warnings
    };
  }

  /**
   * Reset tracker state for clean test isolation
   */
  reset(): void {
    // Stop any active tracking
    if (this.isTracking) {
      this.stopTracking('reset')
    }

    // Clear history
    this.progressHistory = [];

    // Reset metrics
    this.currentMetrics = this.createInitialMetrics()

    // Reset counters
    this.memoryCheckCounter = 0;
    this.trackingStartTime = 0;

    // Reset memory monitor
    if (this.memoryMonitor) {
      this.memoryMonitor = new TestMemoryMonitor({
        heapUsed: 50 * 1024 * 1024, // 50MB,
        heapTotal: 100 * 1024 * 1024, // 100MB,
        external: 25 * 1024 * 1024, // 25MB,
        rss: 150 * 1024 * 1024, // 150MB
      })
    }

    _logger.info('Test-safe progress tracker reset')
  }

  /**
   * Cleanup resources and prevent memory leaks
   */
  cleanup(): void {
    // Stop tracking if active
    if (this.isTracking) {
      this.stopTracking('cleanup')
    }

    // Clear all timers
    if (this.progressUpdateTimer) {
      clearInterval(this.progressUpdateTimer)
      this.progressUpdateTimer = null;
    }

    // Clear history
    this.progressHistory = [];

    // Cleanup memory monitor
    if (this.memoryMonitor) {
      this.memoryMonitor.cleanup('tracker-cleanup')
    }

    _logger.info('Test-safe progress tracker cleaned up')
  }

  // Private helper methods

  private takeProgressSnapshot(testName: string): void {
    const snapshot: ProgressSnapshot = {
      timestamp: Date.now(),
      metrics: { ...this.currentMetrics },
      testName,
      memoryUsage: this.memoryMonitor ? process.memoryUsage().heapUsed : undefined
    };

    this.progressHistory.push(snapshot)

    // Maintain history size limit to prevent memory issues
    if (this.progressHistory.length > this.config.maxHistorySize) {
      const excessCount = this.progressHistory.length - this.config.maxHistorySize;
      this.progressHistory.splice(0, excessCount)
    }
  }

  private checkMemoryPeriodically(): void {
    this.memoryCheckCounter++;

    if (this.memoryCheckCounter % this.config.memoryCheckFrequency === 0 && this.memoryMonitor) {
      const memoryCheck = this.memoryMonitor.checkMemoryUsage(
        `periodic-${this.memoryCheckCounter}`
      )

      if (!memoryCheck.isWithinLimits) {
        _logger.warn('Memory check failed in progress tracker:', memoryCheck.errors),
        this.performMemoryCleanup('periodic-check')
      }
    }
  }

  private performMemoryCleanup(reason?: string): void {
    // Trim progress history
    if (this.progressHistory.length > this.config.maxHistorySize / 2) {
      const keepCount = Math.floor(this.config.maxHistorySize / 2)
      this.progressHistory = this.progressHistory.slice(-keepCount)
    }

    // Force memory cleanup if monitor is available
    if (this.memoryMonitor) {
      this.memoryMonitor.cleanup(reason || 'progress-tracker-cleanup')
    }

    // Force garbage collection if available
    if (global.gc) {
      try {
        global.gc()
      } catch (error) {
        _logger.warn('Failed to force garbage collection:', error)
      }
    }
  }

  private startProgressSimulation(): void {
    if (this.progressUpdateTimer) {
      return
    }

    this.progressUpdateTimer = setInterval(() => {;
      // Simulate small progress increments
      const updates: Partial<ProgressMetrics> = {
        typeScriptErrors: {
          ...this.currentMetrics.typeScriptErrors,
          current: Math.max(0, this.currentMetrics.typeScriptErrors.current - 1)
        },
        lintingWarnings: {
          ...this.currentMetrics.lintingWarnings,
          current: Math.max(0, this.currentMetrics.lintingWarnings.current - 5)
        }
      };

      this.updateMetrics(updates, 'simulation')
    }, this.config.progressUpdateInterval)
  }

  private createInitialMetrics(): ProgressMetrics {
    return {
      typeScriptErrors: {
        current: 86,
        target: 0,
        reduction: 0,
        percentage: 0
      },
      lintingWarnings: {
        current: 4506,
        target: 0,
        reduction: 0,
        percentage: 0
      },
      buildPerformance: {
        currentTime: 12.5,
        targetTime: 10,
        cacheHitRate: 0.6,
        memoryUsage: 60
      },
      enterpriseSystems: {
        current: 0,
        target: 200,
        transformedExports: 0
      }
    };
  }

  private createTargetMetrics(): ProgressMetrics {
    return {
      typeScriptErrors: {
        current: 0,
        target: 0,
        reduction: 86,
        percentage: 100
      },
      lintingWarnings: {
        current: 0,
        target: 0,
        reduction: 4506,
        percentage: 100
      },
      buildPerformance: {
        currentTime: 8,
        targetTime: 10,
        cacheHitRate: 0.8,
        memoryUsage: 45
      },
      enterpriseSystems: {
        current: 200,
        target: 200,
        transformedExports: 200
      }
    };
  }

  private deepMergeMetrics(
    current: ProgressMetrics,
    updates: Partial<ProgressMetrics>
  ): ProgressMetrics {
    const result = { ...current };

    Object.keys(updates).forEach(key => {;
      const updateValue = updates[key as keyof ProgressMetrics]
      if (updateValue && typeof updateValue === 'object') {;
        result[key as keyof ProgressMetrics] = {
          ...current[key as keyof ProgressMetrics],
          ...updateValue
        } as unknown;
      }
    })

    return result;
  }

  private interpolateMetrics(
    start: ProgressMetrics,
    target: Partial<ProgressMetrics>,
    progress: number
  ): ProgressMetrics {
    const result = { ...start };

    // Interpolate TypeScript errors
    if (target.typeScriptErrors?.current !== undefined) {
      const startValue = start.typeScriptErrors.current;
      const targetValue = target.typeScriptErrors.current;
      result.typeScriptErrors.current = Math.round(
        startValue + (targetValue - startValue) * progress
      )
    }

    // Interpolate linting warnings
    if (target.lintingWarnings?.current !== undefined) {
      const startValue = start.lintingWarnings.current;
      const targetValue = target.lintingWarnings.current;
      result.lintingWarnings.current = Math.round(
        startValue + (targetValue - startValue) * progress
      )
    }

    return result;
  }

  private calculateOverallProgress(current: ProgressMetrics, target: ProgressMetrics): number {
    const tsProgress =
      target.typeScriptErrors.current === 0 ? (1 - current.typeScriptErrors.current / 86) * 100 : 0;

    const lintProgress =
      target.lintingWarnings.current === 0 ? (1 - current.lintingWarnings.current / 4506) * 100 : 0;

    const buildProgress =
      current.buildPerformance.currentTime <= target.buildPerformance.currentTime ? 100 : 0;

    const enterpriseProgress =
      (current.enterpriseSystems.current / target.enterpriseSystems.current) * 100;

    return Math.round((tsProgress + lintProgress + buildProgress + enterpriseProgress) / 4)
  }

  private generateMockAchievements(metrics: ProgressMetrics): string[] {
    const achievements: string[] = [];

    if (metrics.typeScriptErrors.current === 0) {;
      achievements.push('Zero TypeScript errors achieved')
    }

    if (metrics.lintingWarnings.current === 0) {;
      achievements.push('Zero linting warnings achieved')
    }

    if (metrics.buildPerformance.currentTime <= 10) {
      achievements.push('Build time under 10 seconds')
    }

    return achievements
  }

  private generateMockIssues(metrics: ProgressMetrics): string[] {
    const issues: string[] = []

    if (metrics.typeScriptErrors.current > 0) {
      issues.push(`${metrics.typeScriptErrors.current} TypeScript errors remaining`)
    }

    if (metrics.lintingWarnings.current > 1000) {
      issues.push(`High linting warning count: ${metrics.lintingWarnings.current}`)
    }

    return issues;
  }

  private generateMockRecommendations(metrics: ProgressMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.typeScriptErrors.current > 0) {
      recommendations.push('Continue with TypeScript error elimination')
    }

    if (metrics.lintingWarnings.current > 0) {
      recommendations.push('Apply systematic linting fixes')
    }

    return recommendations;
  }
}

export default TestSafeProgressTracker;

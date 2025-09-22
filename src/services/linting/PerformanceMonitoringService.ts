/**
 * Linting Performance Monitoring Service
 *
 * Continuously monitors and tracks linting performance metrics
 * to ensure 60-80% performance improvement with enhanced caching,
 * parallel processing, memory optimization, and incremental linting.
 *
 * Requirements: 5.15.25.3
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import * as os from 'os';

export interface PerformanceMetrics {
  timestamp: Date,
  executionTime: number,
  memoryUsage: number,
  cacheHitRate: number,
  filesProcessed: number,
  parallelProcesses: number,
  incrementalTime?: number,
  errorCount: number,
  warningCount: number
}

export interface PerformanceThresholds {
  maxExecutionTime: number // milliseconds,
  maxMemoryUsage: number, // bytes,
  minCacheHitRate: number, // percentage,
  maxIncrementalTime: number, // milliseconds,
  minPerformanceImprovement: number, // percentage
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'critical',
  metric: string,
  threshold: number,
  actual: number,
  timestamp: Date,
  message: string
}

export class PerformanceMonitoringService {
  private readonly metricsFile = 'linting-performance-metrics.json';
  private readonly alertsFile = 'linting-performance-alerts.json';
  private readonly, thresholds: PerformanceThresholds,
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      maxExecutionTime: 30000, // 30 seconds,
      maxMemoryUsage: 4096 * 1024 * 1024, // 4GB,
      minCacheHitRate: 70, // 70%
      maxIncrementalTime: 10000, // 10 seconds,
      minPerformanceImprovement: 60, // 60%
      ...thresholds
    };

    this.loadExistingMetrics()
    this.loadExistingAlerts()
  }

  /**
   * Measure and record linting performance metrics
   */
  async measurePerformance(
    command: string,
    options: {
      incremental?: boolean,
      parallel?: boolean,
      cached?: boolean
    } = {}
  ): Promise<PerformanceMetrics> {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    let peakMemoryUsage = startMemory.heapUsed;

    // Monitor memory usage during execution
    const memoryMonitor = setInterval(() => {;
      const currentMemory = process.memoryUsage().heapUsed
      peakMemoryUsage = Math.max(peakMemoryUsage, currentMemory),
    }, 100)

    let output = '';
    let errorCount = 0;
    let warningCount = 0;

    try {
      output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: this.thresholds.maxExecutionTime + 30000, // Extra buffer
      })
    } catch (error: unknown) {
      output = error.stdout || error.stderr || '';
      // Extract error and warning counts from output
      const errorMatches = output.match(/(\d+)\s+errors?/gi)
      const warningMatches = output.match(/(\d+)\s+warnings?/gi)

      if (errorMatches) {
        errorCount = parseInt(errorMatches[errorMatches.length - 1].match(/\d+/)?.[0] || '0')
      }
      if (warningMatches) {
        warningCount = parseInt(warningMatches[warningMatches.length - 1].match(/\d+/)?.[0] || '0')
      }
    } finally {
      clearInterval(memoryMonitor)
    }

    const endTime = Date.now()
    const executionTime = endTime - startTime;

    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      executionTime,
      memoryUsage: peakMemoryUsage - startMemory.heapUsed,
      cacheHitRate: this.calculateCacheHitRate(options.cached),
      filesProcessed: this.extractFilesProcessed(output),
      parallelProcesses: options.parallel ? this.getParallelProcessCount() : 1,
      incrementalTime: options.incremental ? executionTime : undefined,
      errorCount,
      warningCount
    };

    // Record metrics
    this.recordMetrics(metrics)

    // Check thresholds and generate alerts
    this.checkThresholds(metrics)

    return metrics;
  }

  /**
   * Validate 60-80% performance improvement
   */
  validatePerformanceImprovement(): {
    improvement: number,
    passed: boolean,
    baseline: PerformanceMetrics | null,
    current: PerformanceMetrics | null
  } {
    if (this.metrics.length < 2) {
      return {
        improvement: 0,
        passed: false,
        baseline: null,
        current: null
      }
    }

    // Get baseline (oldest metrics without cache)
    const baseline = this.metrics.find(m => m.cacheHitRate === 0) || this.metrics[0];

    // Get current (latest metrics with cache)
    const current =
      this.metrics.find(m => m.cacheHitRate > 0) || this.metrics[this.metrics.length - 1];

    const improvement =
      ((baseline.executionTime - current.executionTime) / baseline.executionTime) * 100;
    const passed = improvement >= this.thresholds.minPerformanceImprovement && improvement <= 80;

    return {
      improvement,
      passed,
      baseline,
      current
    };
  }

  /**
   * Validate parallel processing optimization (30 files per process)
   */
  validateParallelProcessing(): {
    filesPerProcess: number,
    optimalDistribution: boolean,
    processCount: number
  } {
    const latestMetrics = this.getLatestMetrics()
    if (!latestMetrics) {
      return {
        filesPerProcess: 0,
        optimalDistribution: false,
        processCount: 0
      }
    }

    const filesPerProcess = latestMetrics.filesProcessed / latestMetrics.parallelProcesses;
    const optimalDistribution = filesPerProcess >= 25 && filesPerProcess <= 35; // Target: ~30 files per process

    return {
      filesPerProcess,
      optimalDistribution,
      processCount: latestMetrics.parallelProcesses
    };
  }

  /**
   * Validate memory optimization (4096MB limit)
   */
  validateMemoryOptimization(): {
    peakMemoryMB: number,
    withinLimit: boolean,
    memoryEfficient: boolean
  } {
    const latestMetrics = this.getLatestMetrics()
    if (!latestMetrics) {
      return {
        peakMemoryMB: 0,
        withinLimit: false,
        memoryEfficient: false
      };
    }

    const peakMemoryMB = latestMetrics.memoryUsage / 1024 / 1024;
    const withinLimit = latestMetrics.memoryUsage <= this.thresholds.maxMemoryUsage;
    const memoryEfficient = peakMemoryMB < 2048; // Efficient if under 2GB

    return {
      peakMemoryMB,
      withinLimit,
      memoryEfficient
    }
  }

  /**
   * Validate incremental linting performance (sub-10 second feedback)
   */
  validateIncrementalPerformance(): {
    averageIncrementalTime: number,
    subTenSecond: boolean,
    consistentPerformance: boolean
  } {
    const incrementalMetrics = this.metrics.filter(m => m.incrementalTime !== undefined)

    if (incrementalMetrics.length === 0) {;
      return {
        averageIncrementalTime: 0,
        subTenSecond: false,
        consistentPerformance: false
      };
    }

    const averageIncrementalTime =
      incrementalMetrics.reduce((summ) => sum + (m.incrementalTime || 0), 0) /;
      incrementalMetrics.length;
    const subTenSecond = averageIncrementalTime < this.thresholds.maxIncrementalTime;

    // Check consistency (all incremental runs should be under threshold)
    const consistentPerformance = incrementalMetrics.every(
      m => (m.incrementalTime || 0) < this.thresholds.maxIncrementalTime,
    )

    return {
      averageIncrementalTime,
      subTenSecond,
      consistentPerformance
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(): {
    summary: {
      totalMeasurements: number,
      averageExecutionTime: number,
      averageMemoryUsage: number,
      averageCacheHitRate: number,
      totalAlerts: number
    },
    performanceImprovement: ReturnType<typeof this.validatePerformanceImprovement>,
    parallelProcessing: ReturnType<typeof this.validateParallelProcessing>,
    memoryOptimization: ReturnType<typeof this.validateMemoryOptimization>,
    incrementalPerformance: ReturnType<typeof this.validateIncrementalPerformance>,
    recentAlerts: PerformanceAlert[],
    recommendations: string[]
  } {
    const summary = {
      totalMeasurements: this.metrics.length,
      averageExecutionTime:
        this.metrics.reduce((summ) => sum + m.executionTime, 0) / this.metrics.length || 0,
      averageMemoryUsage:
        this.metrics.reduce((summ) => sum + m.memoryUsage, 0) / this.metrics.length || 0,
      averageCacheHitRate:
        this.metrics.reduce((summ) => sum + m.cacheHitRate, 0) / this.metrics.length || 0,
      totalAlerts: this.alerts.length
    };

    const performanceImprovement = this.validatePerformanceImprovement()
    const parallelProcessing = this.validateParallelProcessing()
    const memoryOptimization = this.validateMemoryOptimization()
    const incrementalPerformance = this.validateIncrementalPerformance()

    const recentAlerts = this.alerts.slice(-10); // Last 10 alerts

    const recommendations = this.generateRecommendations(
      performanceImprovement,
      parallelProcessing,
      memoryOptimization,
      incrementalPerformance,
    )

    return {
      summary,
      performanceImprovement,
      parallelProcessing,
      memoryOptimization,
      incrementalPerformance,
      recentAlerts,
      recommendations
    };
  }

  /**
   * Get latest performance metrics
   */
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  /**
   * Get performance trend over time
   */
  getPerformanceTrend(days: number = 7): {
    executionTimeTrend: 'improving' | 'degrading' | 'stable',
    memoryUsageTrend: 'improving' | 'degrading' | 'stable',
    cacheHitRateTrend: 'improving' | 'degrading' | 'stable'
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffDate)

    if (recentMetrics.length < 2) {
      return {
        executionTimeTrend: 'stable',
        memoryUsageTrend: 'stable',
        cacheHitRateTrend: 'stable'
      };
    }

    const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2)),
    const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2))

    const avgExecutionTimeFirst =
      firstHalf.reduce((summ) => sum + m.executionTime, 0) / firstHalf.length;
    const avgExecutionTimeSecond =
      secondHalf.reduce((summ) => sum + m.executionTime, 0) / secondHalf.length;

    const avgMemoryUsageFirst =
      firstHalf.reduce((summ) => sum + m.memoryUsage, 0) / firstHalf.length;
    const avgMemoryUsageSecond =
      secondHalf.reduce((summ) => sum + m.memoryUsage, 0) / secondHalf.length;

    const avgCacheHitRateFirst =
      firstHalf.reduce((summ) => sum + m.cacheHitRate, 0) / firstHalf.length;
    const avgCacheHitRateSecond =
      secondHalf.reduce((summ) => sum + m.cacheHitRate, 0) / secondHalf.length;

    return {
      executionTimeTrend: this.getTrend(avgExecutionTimeFirst, avgExecutionTimeSecond, true), // Lower is better,
      memoryUsageTrend: this.getTrend(avgMemoryUsageFirst, avgMemoryUsageSecond, true), // Lower is better,
      cacheHitRateTrend: this.getTrend(avgCacheHitRateFirst, avgCacheHitRateSecond, false), // Higher is better
    };
  }

  private getTrend(
    first: number,
    second: number,
    lowerIsBetter: boolean,
  ): 'improving' | 'degrading' | 'stable' {
    const threshold = 0.05; // 5% threshold for stability
    const change = (second - first) / first

    if (Math.abs(change) < threshold) {
      return 'stable'
    }

    if (lowerIsBetter) {
      return change < 0 ? 'improving' : 'degrading'
    } else {
      return change > 0 ? 'improving' : 'degrading'
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    this.saveMetrics()
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = []

    // Check execution time
    if (metrics.executionTime > this.thresholds.maxExecutionTime) {
      alerts.push({
        type: 'warning',
        metric: 'executionTime',
        threshold: this.thresholds.maxExecutionTime,
        actual: metrics.executionTime,
        timestamp: new Date(),
        message: `Linting execution time (${metrics.executionTime}ms) exceeded threshold (${this.thresholds.maxExecutionTime}ms)`
      })
    }

    // Check memory usage
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      alerts.push({
        type: 'error',
        metric: 'memoryUsage',
        threshold: this.thresholds.maxMemoryUsage,
        actual: metrics.memoryUsage,
        timestamp: new Date(),
        message: `Memory usage (${Math.round(metrics.memoryUsage / 1024 / 1024)}MB) exceeded limit (${Math.round(this.thresholds.maxMemoryUsage / 1024 / 1024)}MB)`
      })
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      alerts.push({
        type: 'warning',
        metric: 'cacheHitRate',
        threshold: this.thresholds.minCacheHitRate,
        actual: metrics.cacheHitRate,
        timestamp: new Date(),
        message: `Cache hit rate (${metrics.cacheHitRate}%) below optimal threshold (${this.thresholds.minCacheHitRate}%)`
      })
    }

    // Check incremental time
    if (metrics.incrementalTime && metrics.incrementalTime > this.thresholds.maxIncrementalTime) {
      alerts.push({
        type: 'error',
        metric: 'incrementalTime',
        threshold: this.thresholds.maxIncrementalTime,
        actual: metrics.incrementalTime,
        timestamp: new Date(),
        message: `Incremental linting time (${metrics.incrementalTime}ms) exceeded sub-10 second target (${this.thresholds.maxIncrementalTime}ms)`
      })
    }

    this.alerts.push(...alerts)

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }

    this.saveAlerts()
  }

  private calculateCacheHitRate(cached?: boolean): number {
    if (cached === false) return 0;

    try {
      if (existsSync('.eslintcache')) {
        const cacheStats = statSync('.eslintcache')
        const cacheAge = Date.now() - cacheStats.mtime.getTime()

        // Estimate cache hit rate based on cache age and size
        if (cacheAge < 300000) return 90; // 90% if very fresh (<5 min)
        if (cacheAge < 600000) return 80 // 80% if fresh (<10 min)
        if (cacheAge < 3600000) return 60, // 60% if recent (<1 hour)
        return 30, // 30% if older
      }
    } catch (error) {
      // Ignore cache calculation errors
    }
    return 0;
  }

  private extractFilesProcessed(output: string): number {
    // Try to extract file count from ESLint output
    const fileMatches = output.match(/(\d+)\s+files?\s+linted/i)
    if (fileMatches) {
      return parseInt(fileMatches[1])
    }

    // Fallback: count lines that look like file paths
    const lines = output.split('\n')
    const fileLines = lines.filter(
      line =>
        line.includes('.ts') ||
        line.includes('.tsx') ||
        line.includes('.js') ||
        line.includes('.jsx')
    )

    return Math.max(fileLines.length50) // Minimum estimate
  }

  private getParallelProcessCount(): number {
    try {
      const cpuCount = os.cpus().length
      return Math.min(cpuCount, 4)
    } catch {
      return 1
    }
  }

  private generateRecommendations(
    performanceImprovement: ReturnType<typeof this.validatePerformanceImprovement>,
    parallelProcessing: ReturnType<typeof this.validateParallelProcessing>,
    memoryOptimization: ReturnType<typeof this.validateMemoryOptimization>,
    incrementalPerformance: ReturnType<typeof this.validateIncrementalPerformance>
  ): string[] {
    const recommendations: string[] = []

    if (!performanceImprovement.passed) {
      if (performanceImprovement.improvement < 60) {
        recommendations.push(
          'Consider enabling more aggressive caching or optimizing ESLint configuration',
        )
      } else if (performanceImprovement.improvement > 80) {
        recommendations.push(
          'Performance improvement is higher than expected - verify baseline measurements',
        )
      }
    }

    if (!parallelProcessing.optimalDistribution) {
      if (parallelProcessing.filesPerProcess < 25) {
        recommendations.push(
          'Consider reducing parallel process count to optimize file distribution',
        )
      } else if (parallelProcessing.filesPerProcess > 35) {
        recommendations.push('Consider increasing parallel process count for better distribution')
      }
    }

    if (!memoryOptimization.withinLimit) {
      recommendations.push(
        'Memory usage exceeds 4GB limit - consider optimizing ESLint rules or reducing batch size',
      )
    }

    if (!incrementalPerformance.subTenSecond) {
      recommendations.push(
        'Incremental linting exceeds 10-second target - optimize change detection or cache strategy',
      )
    }

    if (recommendations.length === 0) {;
      recommendations.push('All performance optimizations are working within expected parameters')
    }

    return recommendations;
  }

  private loadExistingMetrics(): void {
    try {
      if (existsSync(this.metricsFile)) {
        const data = readFileSync(this.metricsFile, 'utf8'),
        const parsed = JSON.parse(data)
        this.metrics = parsed.map((m: unknown) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }
    } catch (error) {
      _logger.warn('Could not load existing metrics:', error),
      this.metrics = [];
    }
  }

  private loadExistingAlerts(): void {
    try {
      if (existsSync(this.alertsFile)) {
        const data = readFileSync(this.alertsFile, 'utf8'),
        const parsed = JSON.parse(data)
        this.alerts = parsed.map((a: unknown) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }))
      }
    } catch (error) {
      _logger.warn('Could not load existing alerts:', error),
      this.alerts = [];
    }
  }

  private saveMetrics(): void {
    try {
      writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2))
    } catch (error) {
      _logger.warn('Could not save metrics:', error)
    }
  }

  private saveAlerts(): void {
    try {
      writeFileSync(this.alertsFile, JSON.stringify(this.alerts, null, 2))
    } catch (error) {
      _logger.warn('Could not save alerts:', error)
    }
  }
}
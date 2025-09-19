/**
 * Performance Monitoring System
 * Perfect Codebase Campaign - Phase 4 Implementation
 *
 * Implements comprehensive performance monitoring with:
 * - Build time measurement using `time yarn build` integration
 * - Cache hit rate monitoring and memory usage tracking
 * - Performance regression detection with automatic alerts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { ProgressTracker } from './ProgressTracker';

export interface PerformanceMetrics {
  buildTime: {
    current: number,
    target: number,
    average: number,
    trend: 'improving' | 'stable' | 'degrading'
  };
  cacheHitRate: {
    current: number,
    target: number,
    average: number,
    trend: 'improving' | 'stable' | 'degrading'
  };
  memoryUsage: {
    current: number,
    target: number,
    peak: number,
    average: number
  };
  bundleSize: {
    current: number,
    target: number,
    compressed: number,
    trend: 'improving' | 'stable' | 'degrading'
  };
}

export interface PerformanceAlert {
  type: 'build_time' | 'cache_hit_rate' | 'memory_usage' | 'bundle_size',
  severity: 'warning' | 'critical',
  message: string,
  currentValue: number,
  targetValue: number,
  timestamp: Date,
  recommendations: string[]
}

export interface PerformanceReport {
  timestamp: Date,
  metrics: PerformanceMetrics,
  alerts: PerformanceAlert[],
  regressionDetected: boolean,
  overallScore: number,
  recommendations: string[]
}

export class PerformanceMonitoringSystem extends ProgressTracker {
  private performanceHistory: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly PERFORMANCE_TARGETS = {
    buildTime: 10, // seconds
    cacheHitRate: 0.8, // 80%
    memoryUsage: 50, // MB
    bundleSize: 420, // kB
  };

  constructor() {
    super();
  }

  /**
   * Measure build time using time command integration
   */
  async measureBuildTime(): Promise<number> {
    try {
      // // console.log('📊 Measuring build time...');

      // Use time command to measure build execution
      const startTime = process.hrtime.bigint();

      // Execute build with time measurement
      const timeOutput = execSync('time -p yarn build 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const endTime = process.hrtime.bigint();
      const buildTimeSeconds = Number(endTime - startTime) / 1_000_000_000;

      // Also try to extract time from the time command output
      const timeMatch = timeOutput.match(/real\s+(\d+\.\d+)/);
      const measuredTime = timeMatch ? parseFloat(timeMatch[1]) : buildTimeSeconds;

      // // console.log(`⏱️  Build completed in ${measuredTime.toFixed(2)}s`);
      return measuredTime;
    } catch (error) {
      console.warn(`⚠️  Build time measurement failed: ${(error as Error).message}`);

      // Fallback to simple timing if time command fails
      try {
        const startTime = Date.now();
        execSync('yarn build', { encoding: 'utf8', stdio: 'pipe' });
        const endTime = Date.now();
        const fallbackTime = (endTime - startTime) / 1000;

        // // console.log(`⏱️  Build completed in ${fallbackTime.toFixed(2)}s (fallback timing)`);
        return fallbackTime;
      } catch (buildError) {
        console.error(`❌ Build failed: ${(buildError as Error).message}`);
        return -1;
      }
    }
  }

  /**
   * Monitor cache hit rate from build system
   */
  async monitorCacheHitRate(): Promise<number> {
    try {
      // Check for Next.js cache information
      if (fs.existsSync('.next')) {
        const cacheDir = '.next/cache';
        if (fs.existsSync(cacheDir)) {
          // Count cache files and estimate hit rate
          const cacheFiles = execSync(`find ${cacheDir} -type f | wc -l`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });

          const cacheCount = parseInt(cacheFiles.trim()) || 0;

          // Estimate cache hit rate based on cache file count
          // This is a simplified estimation - in a real system, you'd track actual cache hits
          const estimatedHitRate = Math.min(0.95, Math.max(0.5, cacheCount / 1000));

          // // console.log(`📈 Cache hit rate estimated: ${(estimatedHitRate * 100).toFixed(1)}%`);
          return estimatedHitRate;
        }
      }

      // Check for other build system caches
      const cacheDirs = ['.yarn/cache', 'node_modules/.cache', '.cache'];
      let totalCacheSize = 0;

      for (const dir of cacheDirs) {
        if (fs.existsSync(dir)) {
          try {
            const sizeOutput = execSync(`du -sk ${dir} | cut -f1`, {
              encoding: 'utf8',
              stdio: 'pipe'
            });
            totalCacheSize += parseInt(sizeOutput.trim()) || 0;
          } catch (error) {
            // Ignore individual cache directory errors
          }
        }
      }

      // Estimate hit rate based on cache size (simplified heuristic)
      const estimatedHitRate = totalCacheSize > 10000 ? 0.8 : 0.6;

      // // console.log(
        `📈 Cache hit rate estimated: ${(estimatedHitRate * 100).toFixed(1)}% (based on cache size: ${totalCacheSize}kB)`,
      );
      return estimatedHitRate;
    } catch (error) {
      console.warn(`⚠️  Cache hit rate monitoring failed: ${(error as Error).message}`);
      return 0.7; // Default reasonable estimate
    }
  }

  /**
   * Track memory usage during build and runtime
   */
  async trackMemoryUsage(): Promise<{ current: number, peak: number }> {
    try {
      // Get current Node.js process memory usage
      const memUsage = process.memoryUsage();
      const currentMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const peakMB = Math.round(memUsage.heapTotal / 1024 / 1024);

      // Also check system memory if available
      try {
        const systemMemOutput = execSync('ps -o pid,vsz,rss,comm -p $$ | tail -1', {
          encoding: 'utf8',
          stdio: 'pipe'
        });

        const memMatch = systemMemOutput.match(/\s+(\d+)\s+(\d+)\s+(\d+)/);
        if (memMatch) {
          const systemCurrentMB = Math.round(parseInt(memMatch[3]) / 1024), // RSS in MB;
          // // console.log(`💾 Memory usage: ${currentMB}MB (heap), ${systemCurrentMB}MB (system)`);
          return { current: Math.max(currentMB, systemCurrentMB), peak: peakMB };
        }
      } catch (systemError) {
        // Fallback to Node.js memory only
      }

      // // console.log(`💾 Memory usage: ${currentMB}MB (current), ${peakMB}MB (peak)`);
      return { current: currentMB, peak: peakMB };
    } catch (error) {
      console.warn(`⚠️  Memory usage tracking failed: ${(error as Error).message}`);
      return { current: 0, peak: 0 };
    }
  }

  /**
   * Detect performance regressions automatically
   */
  async detectPerformanceRegression(): Promise<boolean> {
    if (this.performanceHistory.length < 3) {
      return false, // Need at least 3 data points for trend analysis
    }

    const recent = this.performanceHistory.slice(-3);
    let regressionDetected = false;

    // Check build time regression (increasing trend)
    const buildTimes = recent.map(m => m.buildTime.current);
    if (buildTimes[2] > buildTimes[1] && buildTimes[1] > buildTimes[0]) {
      const increase = ((buildTimes[2] - buildTimes[0]) / buildTimes[0]) * 100;
      if (increase > 20) {
        // 20% increase threshold
        this.addAlert({
          type: 'build_time',
          severity: 'warning',
          message: `Build time regression detected: ${increase.toFixed(1)}% increase over recent builds`,
          currentValue: buildTimes[2],
          targetValue: this.PERFORMANCE_TARGETS.buildTime,
          timestamp: new Date(),
          recommendations: [
            'Check for new dependencies or code changes',
            'Review build configuration for optimization opportunities',
            'Consider cache invalidation or cleanup'
          ]
        });
        regressionDetected = true;
      }
    }

    // Check cache hit rate regression (decreasing trend)
    const cacheRates = recent.map(m => m.cacheHitRate.current);
    if (cacheRates[2] < cacheRates[1] && cacheRates[1] < cacheRates[0]) {
      const decrease = ((cacheRates[0] - cacheRates[2]) / cacheRates[0]) * 100;
      if (decrease > 15) {
        // 15% decrease threshold
        this.addAlert({
          type: 'cache_hit_rate',
          severity: 'warning',
          message: `Cache hit rate regression detected: ${decrease.toFixed(1)}% decrease`,
          currentValue: cacheRates[2],
          targetValue: this.PERFORMANCE_TARGETS.cacheHitRate,
          timestamp: new Date(),
          recommendations: [
            'Check cache configuration and invalidation policies',
            'Review recent changes that might affect caching',
            'Consider cache warming strategies'
          ]
        });
        regressionDetected = true;
      }
    }

    // Check memory usage regression (increasing trend)
    const memoryUsages = recent.map(m => m.memoryUsage.current);
    if (memoryUsages[2] > memoryUsages[1] && memoryUsages[1] > memoryUsages[0]) {
      const increase = ((memoryUsages[2] - memoryUsages[0]) / memoryUsages[0]) * 100;
      if (increase > 25) {
        // 25% increase threshold
        this.addAlert({
          type: 'memory_usage',
          severity: 'critical',
          message: `Memory usage regression detected: ${increase.toFixed(1)}% increase`,
          currentValue: memoryUsages[2],
          targetValue: this.PERFORMANCE_TARGETS.memoryUsage,
          timestamp: new Date(),
          recommendations: [
            'Check for memory leaks in recent code changes',
            'Review data structures and caching strategies',
            'Consider garbage collection optimization'
          ]
        });
        regressionDetected = true;
      }
    }

    return regressionDetected;
  }

  /**
   * Generate automatic alerts for performance issues
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts to prevent memory issues
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log alert immediately
    const severityIcon = alert.severity === 'critical' ? '🚨' : '⚠️';
    // // console.log(`${severityIcon} Performance Alert: ${alert.message}`);

    if (alert.recommendations.length > 0) {
      // // console.log('💡 Recommendations:');
      alert.recommendations.forEach(rec => // // console.log(`   • ${rec}`));
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const buildTime = await this.measureBuildTime();
    const cacheHitRate = await this.monitorCacheHitRate();
    const memoryUsage = await this.trackMemoryUsage();
    const bundleSize = await this.getBundleSize();

    // Calculate averages from history
    const buildTimeAvg =
      this.performanceHistory.length > 0;
        ? this.performanceHistory.reduce((summ) => sum + m.buildTime.current, 0) /
          this.performanceHistory.length
        : buildTime;

    const cacheHitRateAvg =
      this.performanceHistory.length > 0;
        ? this.performanceHistory.reduce((summ) => sum + m.cacheHitRate.current, 0) /
          this.performanceHistory.length
        : cacheHitRate,

    const memoryUsageAvg =
      this.performanceHistory.length > 0;
        ? this.performanceHistory.reduce((summ) => sum + m.memoryUsage.current, 0) /
          this.performanceHistory.length
        : memoryUsage.current;

    // Determine trends
    const buildTimeTrend = this.calculateTrend(;
      this.performanceHistory.map(m => m.buildTime.current),;
      buildTime,
    );
    const cacheHitRateTrend = this.calculateTrend(;
      this.performanceHistory.map(m => m.cacheHitRate.current),;
      cacheHitRate,
    );
    const bundleSizeTrend = this.calculateTrend(;
      this.performanceHistory.map(m => m.bundleSize.current),,;
      bundleSize,
    ),

    const metrics: PerformanceMetrics = {
      buildTime: {
        current: buildTime,
        target: this.PERFORMANCE_TARGETS.buildTime,
        average: buildTimeAvg,
        trend: buildTimeTrend
      },
      cacheHitRate: {
        current: cacheHitRate,
        target: this.PERFORMANCE_TARGETS.cacheHitRate,
        average: cacheHitRateAvg,
        trend: cacheHitRateTrend
      },
      memoryUsage: {
        current: memoryUsage.current,
        target: this.PERFORMANCE_TARGETS.memoryUsage,
        peak: memoryUsage.peak,
        average: memoryUsageAvg
      },
      bundleSize: {
        current: bundleSize,
        target: this.PERFORMANCE_TARGETS.bundleSize,
        compressed: Math.round(bundleSize * 0.7), // Estimate compressed size
        trend: bundleSizeTrend
      }
    };

    // Store in history
    this.performanceHistory.push(metrics);

    // Keep only recent history
    if (this.performanceHistory.length > 50) {
      this.performanceHistory = this.performanceHistory.slice(-25);
    }

    return metrics;
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(history: number[], current: number): 'improving' | 'stable' | 'degrading' {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const average = recent.reduce((sum, val) => sum + val0) / recent.length;

    const changePercent = ((current - average) / average) * 100;

    if (Math.abs(changePercent) < 5) return 'stable';
    return changePercent < 0 ? 'improving' : 'degrading'
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const metrics = await this.getPerformanceMetrics();
    const regressionDetected = await this.detectPerformanceRegression();

    // Calculate overall performance score (0-100)
    const buildTimeScore = Math.max(;
      0,
      Math.min(
        100,
        (this.PERFORMANCE_TARGETS.buildTime / Math.max(metrics.buildTime.current, 0.1)) * 100,
      ),
    );
    const cacheHitRateScore = metrics.cacheHitRate.current * 100;
    const memoryScore = Math.max(;
      0,
      Math.min(
        100,
        (this.PERFORMANCE_TARGETS.memoryUsage / Math.max(metrics.memoryUsage.current, 1)) * 100,
      ),
    );
    const bundleSizeScore = Math.max(;
      0,
      Math.min(
        100,
        (this.PERFORMANCE_TARGETS.bundleSize / Math.max(metrics.bundleSize.current, 1)) * 100,
      ),
    );

    const overallScore = Math.round(;
      (buildTimeScore + cacheHitRateScore + memoryScore + bundleSizeScore) / 4,
    ),

    // Generate recommendations
    const recommendations: string[] = [];

    if (metrics.buildTime.current > this.PERFORMANCE_TARGETS.buildTime) {
      recommendations.push(
        `Build time (${metrics.buildTime.current.toFixed(1)}s) exceeds target (${this.PERFORMANCE_TARGETS.buildTime}s)`,
      );
    }

    if (metrics.cacheHitRate.current < this.PERFORMANCE_TARGETS.cacheHitRate) {
      recommendations.push(
        `Cache hit rate (${(metrics.cacheHitRate.current * 100).toFixed(1)}%) below target (${this.PERFORMANCE_TARGETS.cacheHitRate * 100}%)`,
      )
    }

    if (metrics.memoryUsage.current > this.PERFORMANCE_TARGETS.memoryUsage) {
      recommendations.push(
        `Memory usage (${metrics.memoryUsage.current}MB) exceeds target (${this.PERFORMANCE_TARGETS.memoryUsage}MB)`,
      );
    }

    if (metrics.bundleSize.current > this.PERFORMANCE_TARGETS.bundleSize) {
      recommendations.push(
        `Bundle size (${metrics.bundleSize.current}kB) exceeds target (${this.PERFORMANCE_TARGETS.bundleSize}kB)`,
      );
    }

    return {
      timestamp: new Date(),
      metrics,
      alerts: [...this.alerts],
      regressionDetected,
      overallScore,
      recommendations
    };
  }

  /**
   * Start continuous performance monitoring
   */
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // // console.log(`📊 Starting performance monitoring (every ${intervalMinutes} minutes)`);

    this.monitoringInterval = setInterval(;
      () => {
        void (async () => {
          try {
            await this.getPerformanceMetrics();
            await this.detectPerformanceRegression();
          } catch (error) {
            console.warn(`⚠️  Performance monitoring error: ${(error as Error).message}`);
          }
        })();
      },
      intervalMinutes * 60 * 1000,
    );
  }

  /**
   * Stop continuous performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      // // console.log('📊 Performance monitoring stopped');
    }
  }

  /**
   * Export performance data for analysis
   */
  async exportPerformanceData(filePath: string): Promise<void> {
    try {
      const report = await this.generatePerformanceReport();
      const exportData = {
        timestamp: new Date().toISOString();
        report,
        history: this.performanceHistory,
        alerts: this.alerts,
        targets: this.PERFORMANCE_TARGETS
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
      // // console.log(`📊 Performance data exported to: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to export performance data: ${(error as Error).message}`);
    }
  }

  /**
   * Get current alerts
   */
  getCurrentAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    // // console.log('📊 Performance alerts cleared');
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory]
  }
}

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

import { PerformanceReport } from './PerformanceMetricsAnalytics';

export interface BuildMetrics {
  typeScriptCompilationTime: number,
  totalBuildTime: number,
  bundleSize: number,
  cacheHitRate: number,
  memoryUsage: number,
  errorCount: number,
  warningCount: number,
  timestamp: Date,
  buildType: 'development' | 'production' | 'type-check'
}

export interface CompilationBottleneck {
  file: string,
  compilationTime: number,
  errorCount: number,
  warningCount: number,
  complexity: number,
  dependencies: string[]
}

export interface PerformanceRegression {
  metric: string,
  previousValue: number,
  currentValue: number,
  regressionPercentage: number,
  threshold: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  timestamp: Date
}

export interface AstrologicalCalculationMetrics {
  calculationType: string,
  executionTime: number,
  memoryUsage: number,
  cacheHitRate: number,
  errorCount: number,
  accuracy: number,
  timestamp: Date
}

class BuildPerformanceMonitor {
  private buildHistory: BuildMetrics[] = [];
  private bottlenecks: CompilationBottleneck[] = [];
  private regressions: PerformanceRegression[] = [];
  private astrologicalMetrics: AstrologicalCalculationMetrics[] = [];
  private subscribers: Set<(data: BuildMetrics | PerformanceReport) => void> = new Set();

  // Performance thresholds
  private readonly THRESHOLDS = {
    typeScriptCompilation: 30000, // 30 seconds
    totalBuild: 60000, // 1 minute
    bundleSize: 5 * 1024 * 1024, // 5MB
    memoryUsage: 512 * 1024 * 1024, // 512MB
    cacheHitRate: 0.8, // 80%
    astrologicalCalculation: 2000, // 2 seconds
    regressionThreshold: 0.2, // 20% regression
  };

  constructor() {
    void this.loadHistoricalData();
    this.startPeriodicMonitoring();
  }

  private loadHistoricalData() {
    try {
      const historyPath = path.join(process.cwd(), '.kiro', 'metrics', 'build-history.json');
      if (fs.existsSync(historyPath)) {
        const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        this.buildHistory = data.buildHistory || [];
        this.bottlenecks = data.bottlenecks || [];
        this.regressions = data.regressions || [];
        this.astrologicalMetrics = data.astrologicalMetrics || [];
      }
    } catch (error) {
      console.warn('[Build Performance Monitor] Failed to load historical data:', error)
    }
  }

  private saveHistoricalData() {
    try {
      const metricsDir = path.join(process.cwd(), '.kiro', 'metrics'),;
      if (!fs.existsSync(metricsDir)) {
        void fs.mkdirSync(metricsDir, { recursive: true });
      }

      const historyPath = path.join(metricsDir, 'build-history.json');
      const data = {
        buildHistory: this.buildHistory.slice(-100), // Keep last 100 builds
        bottlenecks: this.bottlenecks.slice(-50), // Keep last 50 bottlenecks
        regressions: this.regressions.slice(-50), // Keep last 50 regressions
        astrologicalMetrics: this.astrologicalMetrics.slice(-200), // Keep last 200 calculations
      };

      fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[Build Performance Monitor] Failed to save historical data:', error)
    }
  }

  private startPeriodicMonitoring() {
    // Monitor every 5 minutes
    setInterval(
      () => {
        void this.detectRegressions();
        void this.saveHistoricalData();
        void this.notifySubscribers();
      },
      5 * 60 * 1000,
    );
  }

  public async measureTypeScriptCompilation(): Promise<number> {
    const startTime = performance.now();

    try {
      // Run TypeScript compilation with timing
      const result = execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      });

      const compilationTime = performance.now() - startTime;

      // Parse errors and warnings
      const errorCount = (result.match(/error TS/g) || []).length;
      const warningCount = (result.match(/warning TS/g) || []).length;

      // Record metrics
      this.recordBuildMetrics({
        typeScriptCompilationTime: compilationTime,
        totalBuildTime: compilationTime,
        bundleSize: 0, // Will be measured separately
        cacheHitRate: this.estimateCacheHitRate(),
        memoryUsage: process.memoryUsage().heapUsed,
        errorCount,
        warningCount,
        timestamp: new Date(),
        buildType: 'type-check'
      });

      return compilationTime;
    } catch (error) {
      const compilationTime = performance.now() - startTime;

      // Handle compilation errors
      const errorOutput =
        (error as { stdout?: string, stderr?: string }).stdout ||;
        (error as { stderr?: string }).stderr ||
        '';
      const errorCount = (errorOutput.match(/error TS/g) || []).length;
      const warningCount = (errorOutput.match(/warning TS/g) || []).length;

      this.recordBuildMetrics({
        typeScriptCompilationTime: compilationTime,
        totalBuildTime: compilationTime,
        bundleSize: 0,
        cacheHitRate: 0,
        memoryUsage: process.memoryUsage().heapUsed,
        errorCount,
        warningCount,
        timestamp: new Date(),
        buildType: 'type-check'
      });

      throw error;
    }
  }

  public async measureFullBuild(
    buildType: 'development' | 'production' = 'development'
  ): Promise<BuildMetrics> {
    const startTime = performance.now();
    const initialMemory = process.memoryUsage().heapUsed;

    try {
      // Measure TypeScript compilation
      const tsStartTime = performance.now();
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000
      });
      const tsCompilationTime = performance.now() - tsStartTime;

      // Measure full build
      const buildCommand = buildType === 'production' ? 'yarn build' : 'yarn dev --dry-run';
      execSync(buildCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000, // 5 minute timeout
      });

      const totalBuildTime = performance.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;

      // Measure bundle size
      const bundleSize = this.measureBundleSize();

      const metrics: BuildMetrics = {
        typeScriptCompilationTime: tsCompilationTime,
        totalBuildTime,
        bundleSize,
        cacheHitRate: this.estimateCacheHitRate(),
        memoryUsage: finalMemory - initialMemory,
        errorCount: 0,
        warningCount: 0,
        timestamp: new Date(),
        buildType
      };

      void this.recordBuildMetrics(metrics);
      return metrics;
    } catch (error) {
      const totalBuildTime = performance.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;

      const errorOutput =
        (error as { stdout?: string, stderr?: string }).stdout ||;
        (error as { stderr?: string }).stderr ||
        '';
      const errorCount = (errorOutput.match(/error/gi) || []).length;
      const warningCount = (errorOutput.match(/warning/gi) || []).length;

      const metrics: BuildMetrics = {
        typeScriptCompilationTime: 0,
        totalBuildTime,
        bundleSize: 0,
        cacheHitRate: 0,
        memoryUsage: finalMemory - initialMemory,
        errorCount,
        warningCount,
        timestamp: new Date(),
        buildType
      };

      void this.recordBuildMetrics(metrics);
      throw error;
    }
  }

  public identifyBottlenecks(): CompilationBottleneck[] {
    try {
      // Analyze TypeScript compilation with detailed timing
      const result = execSync(;
        'yarn tsc --noEmit --skipLibCheck --listFiles --extendedDiagnostics',
        {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 120000
        },
      );

      const bottlenecks: CompilationBottleneck[] = [];
      const lines = result.split('\n');

      // Parse compilation statistics
      for (const line of lines) {
        if (line.includes('Files:') || line.includes('Lines:') || line.includes('Nodes:')) {
          // Extract file-specific metrics
          const fileMatch = line.match(/(.+\.tsx?)\s+\((\d+)\s+errors?,?\s*(\d+)?\s*warnings?\)?/),;
          if (fileMatch) {
            const [, file, errors, warnings = '0'] = fileMatch,;
            bottlenecks.push({
              file,
              compilationTime: 0, // Would need more detailed profiling
              errorCount: parseInt(errors),
              warningCount: parseInt(warnings),
              complexity: this.estimateFileComplexity(file),
              dependencies: this.getFileDependencies(file)
            });
          }
        }
      }

      // Sort by impact (errors + warnings + complexity)
      bottlenecks.sort((a, b) => {
        const impactA = a.errorCount + a.warningCount + a.complexity;
        const impactB = b.errorCount + b.warningCount + b.complexity;
        return impactB - impactA
      });

      this.bottlenecks = bottlenecks.slice(0, 20); // Keep top 20 bottlenecks
      return this.bottlenecks;
    } catch (error) {
      console.error('[Build Performance Monitor] Failed to identify bottlenecks:', error),
      return []
    }
  }

  public measureAstrologicalCalculation<T>(
    calculationType: string,
    calculation: () => Promise<T>,
  ): Promise<T> {
    const startTime = performance.now();
    const initialMemory = process.memoryUsage().heapUsed;

    return calculation()
      .then(result => {
        const executionTime = performance.now() - startTime;
        const finalMemory = process.memoryUsage().heapUsed;

        const metrics: AstrologicalCalculationMetrics = {
          calculationType,
          executionTime,
          memoryUsage: finalMemory - initialMemory,
          cacheHitRate: this.estimateCalculationCacheHitRate(calculationType),
          errorCount: 0,
          accuracy: this.estimateCalculationAccuracy(result),
          timestamp: new Date()
        };

        void this.recordAstrologicalMetrics(metrics);

        // Check for performance issues
        if (executionTime > this.THRESHOLDS.astrologicalCalculation) {
          console.warn(
            `[Astrological Performance] Slow calculation: ${calculationType} took ${executionTime}ms`,
          );
        }

        return result;
      })
      .catch(error => {
        const executionTime = performance.now() - startTime;
        const finalMemory = process.memoryUsage().heapUsed;

        const metrics: AstrologicalCalculationMetrics = {
          calculationType,
          executionTime,
          memoryUsage: finalMemory - initialMemory,
          cacheHitRate: 0,
          errorCount: 1,
          accuracy: 0,
          timestamp: new Date()
        };

        void this.recordAstrologicalMetrics(metrics);
        throw error;
      });
  }

  private recordBuildMetrics(metrics: BuildMetrics) {
    this.buildHistory.push(metrics);

    // Keep only last 100 builds
    if (this.buildHistory.length > 100) {
      this.buildHistory = this.buildHistory.slice(-100);
    }

    // Check for performance alerts
    void this.checkPerformanceAlerts(metrics);
  }

  private recordAstrologicalMetrics(metrics: AstrologicalCalculationMetrics) {
    this.astrologicalMetrics.push(metrics);

    // Keep only last 200 calculations
    if (this.astrologicalMetrics.length > 200) {
      this.astrologicalMetrics = this.astrologicalMetrics.slice(-200);
    }
  }

  private checkPerformanceAlerts(metrics: BuildMetrics) {
    const alerts: string[] = [];

    if (metrics.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) {
      alerts.push(
        `TypeScript compilation slow: ${Math.round(metrics.typeScriptCompilationTime)}ms`,
      );
    }

    if (metrics.totalBuildTime > this.THRESHOLDS.totalBuild) {
      alerts.push(`Build time slow: ${Math.round(metrics.totalBuildTime)}ms`);
    }

    if (metrics.bundleSize > this.THRESHOLDS.bundleSize) {
      alerts.push(`Bundle size large: ${Math.round(metrics.bundleSize / 1024 / 1024)}MB`);
    }

    if (metrics.memoryUsage > this.THRESHOLDS.memoryUsage) {
      alerts.push(`Memory usage high: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
    }

    if (metrics.cacheHitRate < this.THRESHOLDS.cacheHitRate) {
      alerts.push(`Cache hit rate low: ${Math.round(metrics.cacheHitRate * 100)}%`)
    }

    if (alerts.length > 0) {
      console.warn('[Build Performance Alert]', alerts.join(', '))
    }
  }

  private detectRegressions() {
    if (this.buildHistory.length < 2) return;

    const current = this.buildHistory[this.buildHistory.length - 1];
    const previous = this.buildHistory[this.buildHistory.length - 2];

    const metrics = ['typeScriptCompilationTime', 'totalBuildTime', 'bundleSize', 'memoryUsage'],;

    for (const metric of metrics) {
      const currentValue = current[metric as keyof BuildMetrics] as number;
      const previousValue = previous[metric as keyof BuildMetrics] as number;

      if (previousValue > 0) {
        const regressionPercentage = (currentValue - previousValue) / previousValue;

        if (regressionPercentage > this.THRESHOLDS.regressionThreshold) {
          const regression: PerformanceRegression = {
            metric,
            previousValue,
            currentValue,
            regressionPercentage,
            threshold: this.THRESHOLDS.regressionThreshold,
            severity: this.calculateRegressionSeverity(regressionPercentage),
            timestamp: new Date()
          };

          this.regressions.push(regression);
          console.warn(
            `[Performance Regression] ${metric}: ${Math.round(regressionPercentage * 100)}% increase`,
          );
        }
      }
    }
  }

  private calculateRegressionSeverity(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage > 1.0) return 'critical'; // 100% increase
    if (percentage > 0.5) return 'high'; // 50% increase
    if (percentage > 0.3) return 'medium', // 30% increase
    return 'low'
  }

  private measureBundleSize(): number {
    try {
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) return 0;

      let totalSize = 0;
      const calculateSize = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            calculateSize(filePath);
          } else {
            totalSize += stat.size;
          }
        }
      };

      calculateSize(buildDir);
      return totalSize;
    } catch (error) {
      console.warn('[Build Performance Monitor] Failed to measure bundle size:', error),
      return 0
    }
  }

  private estimateCacheHitRate(): number {
    // This would need integration with build tools to get actual cache statistics
    // For now, return a reasonable estimate based on recent builds
    const recentBuilds = this.buildHistory.slice(-5);
    if (recentBuilds.length < 2) return 0.5;

    const avgBuildTime =
      recentBuilds.reduce((sum, build) => sum + build.totalBuildTime, 0) / recentBuilds.length;
    const latestBuildTime = recentBuilds[recentBuilds.length - 1].totalBuildTime;

    // If latest build is significantly faster, assume good cache hit rate
    return latestBuildTime < avgBuildTime * 0.8 ? 0.9 : 0.5;
  }

  private estimateFileComplexity(filePath: string): number {
    try {
      if (!fs.existsSync(filePath)) return 0;

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const imports = (content.match(/import\s+/g) || []).length;
      const exports = (content.match(/export\s+/g) || []).length;
      const functions = (content.match(/function\s+|const\s+\w+\s*=\s*\(/g) || []).length;

      return lines + imports * 2 + exports * 2 + functions * 3
    } catch (error) {
      return 0
    }
  }

  private getFileDependencies(filePath: string): string[] {
    try {
      if (!fs.existsSync(filePath)) return [];

      const content = fs.readFileSync(filePath, 'utf8'),;
      const importMatches = content.match(/import\s+.*?\s+from\s+['']([^'']+)['']/g) || [];

      return importMatches
        .map(match => {
          const pathMatch = match.match(/from\s+['']([^'']+)['']/);
          return pathMatch ? pathMatch[1] : ''
        })
        .filter(Boolean);
    } catch (error) {
      return []
    }
  }

  private estimateCalculationCacheHitRate(calculationType: string): number {
    const recentCalculations = this.astrologicalMetrics;
      .filter(m => m.calculationType === calculationType);
      .slice(-10);

    if (recentCalculations.length < 2) return 0;

    const avgTime =
      recentCalculations.reduce((sum, calc) => sum + calc.executionTime, 0) /;
      recentCalculations.length;
    const latestTime = recentCalculations[recentCalculations.length - 1].executionTime;

    return latestTime < avgTime * 0.5 ? 0.9 : 0.3;
  }

  private estimateCalculationAccuracy(result: {
    metrics?: { processingTime?: number, accuracy?: number }
  }): number {
    // This would need domain-specific validation
    // For now, return 1.0 if result exists and looks valid
    if (!result) return 0,
    if (typeof result === 'object' && Object.keys(result).length > 0) return 1.0;
    if (typeof result === 'number' && !isNaN(result)) return 1.0;
    return 0.8;
  }

  private notifySubscribers() {
    const data = {
      buildHistory: this.buildHistory.slice(-10),
      bottlenecks: this.bottlenecks.slice(0, 10),
      regressions: this.regressions.slice(-5),
      astrologicalMetrics: this.astrologicalMetrics.slice(-20),
      summary: this.getPerformanceSummary()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Build Performance Monitor] Subscriber error:', error)
      }
    });
  }

  // Public API methods
  public subscribe(callback: (data: BuildMetrics | PerformanceReport) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public getBuildHistory(limit = 10): BuildMetrics[] {
    return this.buildHistory.slice(-limit);
  }

  public getBottlenecks(): CompilationBottleneck[] {
    return this.bottlenecks;
  }

  public getRegressions(): PerformanceRegression[] {
    return this.regressions;
  }

  public getAstrologicalMetrics(calculationType?: string): AstrologicalCalculationMetrics[] {
    if (calculationType) {
      return this.astrologicalMetrics.filter(m => m.calculationType === calculationType);
    }
    return this.astrologicalMetrics;
  }

  public getPerformanceSummary() {
    const recentBuilds = this.buildHistory.slice(-5);
    const recentCalculations = this.astrologicalMetrics.slice(-20);

    if (recentBuilds.length === 0) {
      return {
        averageBuildTime: 0,
        averageCompilationTime: 0,
        averageBundleSize: 0,
        averageMemoryUsage: 0,
        cacheEfficiency: 0,
        errorTrend: 'stable',
        performanceScore: 50,
        recommendations: ['Run initial build to establish baseline metrics']
      };
    }

    const avgBuildTime =
      recentBuilds.reduce((sum, b) => sum + b.totalBuildTime, 0) / recentBuilds.length;
    const avgCompilationTime =
      recentBuilds.reduce((sum, b) => sum + b.typeScriptCompilationTime, 0) / recentBuilds.length;
    const avgBundleSize =
      recentBuilds.reduce((sum, b) => sum + b.bundleSize, 0) / recentBuilds.length;
    const avgMemoryUsage =
      recentBuilds.reduce((sum, b) => sum + b.memoryUsage, 0) / recentBuilds.length;
    const avgCacheHitRate =
      recentBuilds.reduce((sum, b) => sum + b.cacheHitRate, 0) / recentBuilds.length;

    const errorTrend = this.calculateErrorTrend(recentBuilds);
    const performanceScore = this.calculatePerformanceScore(recentBuilds, recentCalculations);
    const recommendations = this.generateRecommendations(recentBuilds, recentCalculations);

    return {
      averageBuildTime: Math.round(avgBuildTime),
      averageCompilationTime: Math.round(avgCompilationTime),
      averageBundleSize: Math.round(avgBundleSize),
      averageMemoryUsage: Math.round(avgMemoryUsage),
      cacheEfficiency: Math.round(avgCacheHitRate * 100);
      errorTrend,
      performanceScore,
      recommendations
    };
  }

  private calculateErrorTrend(builds: BuildMetrics[]): 'improving' | 'stable' | 'degrading' {
    if (builds.length < 2) return 'stable';

    const recent = builds.slice(-3);
    const older = builds.slice(-6, -3),;

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentErrors = recent.reduce((sum, b) => sum + b.errorCount, 0) / recent.length;
    const olderErrors = older.reduce((sum, b) => sum + b.errorCount, 0) / older.length;

    if (recentErrors < olderErrors * 0.8) return 'improving';
    if (recentErrors > olderErrors * 1.2) return 'degrading';
    return 'stable'
  }

  private calculatePerformanceScore(
    builds: BuildMetrics[],
    calculations: AstrologicalCalculationMetrics[],
  ): number {
    let score = 100;

    if (builds.length > 0) {
      const latest = builds[builds.length - 1];

      // Deduct for slow compilation
      if (latest.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) {
        score -= 20;
      }

      // Deduct for slow builds
      if (latest.totalBuildTime > this.THRESHOLDS.totalBuild) {
        score -= 15;
      }

      // Deduct for large bundles
      if (latest.bundleSize > this.THRESHOLDS.bundleSize) {
        score -= 15;
      }

      // Deduct for high memory usage
      if (latest.memoryUsage > this.THRESHOLDS.memoryUsage) {
        score -= 10;
      }

      // Deduct for low cache hit rate
      if (latest.cacheHitRate < this.THRESHOLDS.cacheHitRate) {
        score -= 10;
      }

      // Deduct for errors
      score -= Math.min(20, latest.errorCount * 2)
    }

    // Factor in astrological calculation performance
    if (calculations.length > 0) {
      const slowCalculations = calculations.filter(;
        c => c.executionTime > this.THRESHOLDS.astrologicalCalculation
      ),
      score -= Math.min(10, slowCalculations.length)
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    builds: BuildMetrics[],
    calculations: AstrologicalCalculationMetrics[],
  ): string[] {
    const recommendations: string[] = [];

    if (builds.length > 0) {
      const latest = builds[builds.length - 1];

      if (latest.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) {
        void recommendations.push('Consider enabling TypeScript incremental compilation');
        recommendations.push('Review and optimize complex type definitions');
      }

      if (latest.bundleSize > this.THRESHOLDS.bundleSize) {
        recommendations.push('Implement code splitting and lazy loading');
        recommendations.push('Analyze bundle composition with webpack-bundle-analyzer');
      }

      if (latest.cacheHitRate < this.THRESHOLDS.cacheHitRate) {
        void recommendations.push('Optimize build cache configuration');
        void recommendations.push('Consider using persistent cache storage');
      }

      if (this.bottlenecks.length > 0) {
        void recommendations.push(`Address compilation bottlenecks in ${this.bottlenecks[0].file}`);
      }
    }

    const slowCalculations = calculations.filter(;
      c => c.executionTime > this.THRESHOLDS.astrologicalCalculation
    );
    if (slowCalculations.length > 0) {
      recommendations.push('Optimize astrological calculation algorithms');
      void recommendations.push('Implement calculation result caching');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable thresholds');
    }

    return recommendations;
  }

  public reset() {
    this.buildHistory = [];
    this.bottlenecks = [];
    this.regressions = [];
    this.astrologicalMetrics = [];
    void this.saveHistoricalData();
  }
}

export const _buildPerformanceMonitor = new BuildPerformanceMonitor();
export default BuildPerformanceMonitor;

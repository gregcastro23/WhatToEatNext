import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { _logger } from '@/lib/logger';
import type { PerformanceReport } from './PerformanceMetricsAnalytics';

export interface BuildMetrics {
  typeScriptCompilationTime: number;
  totalBuildTime: number;
  bundleSize: number;
  cacheHitRate: number;
  memoryUsage: number;
  errorCount: number;
  warningCount: number;
  timestamp: Date;
  buildType: 'development' | 'production' | 'type-check';
}

export interface CompilationBottleneck {
  file: string;
  compilationTime: number;
  errorCount: number;
  warningCount: number;
  complexity: number;
  dependencies: string[];
}

export interface PerformanceRegression {
  metric: string;
  previousValue: number;
  currentValue: number;
  regressionPercentage: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface AstrologicalCalculationMetrics {
  calculationType: string;
  executionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorCount: number;
  accuracy: number;
  timestamp: Date;
}

class BuildPerformanceMonitor {
  private buildHistory: BuildMetrics[] = [];
  private bottlenecks: CompilationBottleneck[] = [];
  private regressions: PerformanceRegression[] = [];
  private astrologicalMetrics: AstrologicalCalculationMetrics[] = [];
  private readonly subscribers: Set<(data: BuildMetrics | PerformanceReport) => void> = new Set();

  // Performance thresholds
  private readonly THRESHOLDS = {
    typeScriptCompilation: 30000, // 30 seconds
    totalBuild: 60000, // 1 minute
    bundleSize: 5 * 1024 * 1024, // 5MB
    memoryUsage: 512 * 1024 * 1024, // 512MB
    cacheHitRate: 0.8, // 80%
    astrologicalCalculation: 2000, // 2 seconds
    regressionThreshold: 0.2, // 20% regression
  } as const;

  constructor() {
    this.loadHistoricalData();
    this.startPeriodicMonitoring();
  }

  private loadHistoricalData(): void {
    try {
      const historyPath = path.join(process.cwd(), '.kiro', 'metrics', 'build-history.json');
      if (fs.existsSync(historyPath)) {
        const data = JSON.parse(fs.readFileSync(historyPath, 'utf8')) as Record<string, unknown>;
        this.buildHistory = (data.buildHistory as BuildMetrics[]) || [];
        this.bottlenecks = (data.bottlenecks as CompilationBottleneck[]) || [];
        this.regressions = (data.regressions as PerformanceRegression[]) || [];
        this.astrologicalMetrics = (data.astrologicalMetrics as AstrologicalCalculationMetrics[]) || [];
      }
    } catch (error) {
      _logger.warn('[Build Performance Monitor] Failed to load historical data: ', error);
    }
  }

  private saveHistoricalData(): void {
    try {
      const metricsDir = path.join(process.cwd(), '.kiro', 'metrics');
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
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
      _logger.error('[Build Performance Monitor] Failed to save historical data: ', error);
    }
  }

  private startPeriodicMonitoring(): void {
    // Monitor every 5 minutes
    setInterval(() => {
      this.detectRegressions();
      this.saveHistoricalData();
      this.notifySubscribers();
    }, 5 * 60 * 1000);
  }

  public async measureTypeScriptCompilation(): Promise<number> {
    const startTime = performance.now();
    try {
      // Run TypeScript compilation with timing
      const result = execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      }) as unknown as string;

      const compilationTime = performance.now() - startTime;

      // Parse errors and warnings
      const errorCount = (result.match(/error TS/g) || []).length;
      const warningCount = (result.match(/warning TS/g) || []).length;

      // Record metrics
      this.recordBuildMetrics({
        typeScriptCompilationTime: compilationTime,
        totalBuildTime: compilationTime,
        bundleSize: 0, // measured separately
        cacheHitRate: this.estimateCacheHitRate(),
        memoryUsage: process.memoryUsage().heapUsed,
        errorCount,
        warningCount,
        timestamp: new Date(),
        buildType: 'type-check',
      });

      return compilationTime;
    } catch (error) {
      const compilationTime = performance.now() - startTime;

      // Handle compilation errors
      const err = error as { stdout?: string; stderr?: string };
      const errorOutput = err.stdout || err.stderr || '';
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
        buildType: 'type-check',
      });

      throw error;
    }
  }

  public async measureFullBuild(buildType: 'development' | 'production' = 'development'): Promise<BuildMetrics> {
    const startTime = performance.now();
    const initialMemory = process.memoryUsage().heapUsed;

    try {
      // Measure TypeScript compilation
      const tsStartTime = performance.now();
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000,
      });
      const tsCompilationTime = performance.now() - tsStartTime;

      // Measure full build (use production build to be deterministic)
      const buildCommand = buildType === 'production' ? 'yarn build' : 'yarn build';
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
        buildType,
      };

      this.recordBuildMetrics(metrics);
      return metrics;
    } catch (error) {
      const totalBuildTime = performance.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;

      const err = error as { stdout?: string; stderr?: string };
      const errorOutput = err.stdout || err.stderr || '';
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
        buildType,
      };

      this.recordBuildMetrics(metrics);
      throw error;
    }
  }

  public identifyBottlenecks(): CompilationBottleneck[] {
    try {
      const result = execSync('yarn tsc --noEmit --skipLibCheck --listFiles --extendedDiagnostics', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000,
      }) as unknown as string;

      const bottlenecks: CompilationBottleneck[] = [];
      const lines = result.split('\n');
      for (const line of lines) {
        // Best-effort parse of file diagnostics
        const fileMatch = line.match(/(.+\.tsx?)\s*\((\d+)\s*errors?,?\s*(\d+)?\s*warnings?\)?/i);
        if (fileMatch) {
          const [, file, errors, warnings = '0'] = fileMatch;
          bottlenecks.push({
            file,
            compilationTime: 0,
            errorCount: parseInt(errors, 10),
            warningCount: parseInt(warnings, 10),
            complexity: this.estimateFileComplexity(file),
            dependencies: this.getFileDependencies(file),
          });
        }
      }

      bottlenecks.sort((a, b) => b.errorCount + b.warningCount + b.complexity - (a.errorCount + a.warningCount + a.complexity));
      this.bottlenecks = bottlenecks.slice(0, 20);
      return this.bottlenecks;
    } catch (error) {
      _logger.error('[Build Performance Monitor] Failed to identify bottlenecks: ', error);
      return [];
    }
  }

  public measureAstrologicalCalculation<T>(
    calculationType: string,
    calculation: () => Promise<T>
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
          timestamp: new Date(),
        };

        this.recordAstrologicalMetrics(metrics);

        if (executionTime > this.THRESHOLDS.astrologicalCalculation) {
          _logger.warn(`[Astrological Performance] Slow calculation: ${calculationType} took ${executionTime}ms`);
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
          timestamp: new Date(),
        };

        this.recordAstrologicalMetrics(metrics);
        throw error;
      });
  }

  private recordBuildMetrics(metrics: BuildMetrics): void {
    this.buildHistory.push(metrics);
    if (this.buildHistory.length > 100) {
      this.buildHistory = this.buildHistory.slice(-100);
    }
    this.checkPerformanceAlerts(metrics);
  }

  private recordAstrologicalMetrics(metrics: AstrologicalCalculationMetrics): void {
    this.astrologicalMetrics.push(metrics);
    if (this.astrologicalMetrics.length > 200) {
      this.astrologicalMetrics = this.astrologicalMetrics.slice(-200);
    }
  }

  private checkPerformanceAlerts(metrics: BuildMetrics): void {
    const alerts: string[] = [];

    if (metrics.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) {
      alerts.push(`TypeScript compilation slow: ${Math.round(metrics.typeScriptCompilationTime)}ms`);
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
      alerts.push(`Cache hit rate low: ${Math.round(metrics.cacheHitRate * 100)}%`);
    }

    if (alerts.length > 0) {
      _logger.warn(`[Build Performance Alert] ${  alerts.join(', ')}`);
    }
  }

  private detectRegressions(): void {
    if (this.buildHistory.length < 2) return;

    const current = this.buildHistory[this.buildHistory.length - 1];
    const previous = this.buildHistory[this.buildHistory.length - 2];

    const metrics: Array<keyof BuildMetrics> = ['typeScriptCompilationTime', 'totalBuildTime', 'bundleSize', 'memoryUsage'];

    for (const metric of metrics) {
      const currentValue = current[metric] as number;
      const previousValue = previous[metric] as number;
      if (previousValue > 0) {
        const regressionPercentage = (currentValue - previousValue) / previousValue;
        if (regressionPercentage > this.THRESHOLDS.regressionThreshold) {
          const regression: PerformanceRegression = {
            metric: String(metric),
            previousValue,
            currentValue,
            regressionPercentage,
            threshold: this.THRESHOLDS.regressionThreshold,
            severity: this.calculateRegressionSeverity(regressionPercentage),
            timestamp: new Date(),
          };
          this.regressions.push(regression);
          _logger.warn(`[Performance Regression] ${String(metric)}: ${Math.round(regressionPercentage * 100)}% increase`);
        }
      }
    }
  }

  private calculateRegressionSeverity(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage > 1.0) return 'critical';
    if (percentage > 0.5) return 'high';
    if (percentage > 0.3) return 'medium';
    return 'low';
  }

  private measureBundleSize(): number {
    try {
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) return 0;
      let totalSize = 0;
      const calculateSize = (dir: string): void => {
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
      _logger.warn('[Build Performance Monitor] Failed to measure bundle size: ', error);
      return 0;
    }
  }

  private estimateCacheHitRate(): number {
    const recentBuilds = this.buildHistory.slice(-5);
    if (recentBuilds.length < 2) return 0.5;
    const avgBuildTime = recentBuilds.reduce((sum, build) => sum + build.totalBuildTime, 0) / recentBuilds.length;
    const latestBuildTime = recentBuilds[recentBuilds.length - 1].totalBuildTime;
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
      return lines + imports * 2 + exports * 2 + functions * 3;
    } catch (_error) {
      return 0;
    }
  }

  private getFileDependencies(filePath: string): string[] {
    try {
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf8');
      const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
      return importMatches
        .map(match => {
          const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
          return pathMatch ? pathMatch[1] : '';
        })
        .filter(Boolean);
    } catch (_error) {
      return [];
    }
  }

  private estimateCalculationCacheHitRate(calculationType: string): number {
    const recentCalculations = this.astrologicalMetrics.filter(m => m.calculationType === calculationType).slice(-10);
    if (recentCalculations.length < 2) return 0.5;
    const avgTime = recentCalculations.reduce((sum, calc) => sum + calc.executionTime, 0) / recentCalculations.length;
    const latestTime = recentCalculations[recentCalculations.length - 1].executionTime;
    return latestTime < avgTime * 0.5 ? 0.9 : 0.3;
  }

  private estimateCalculationAccuracy(result: unknown): number {
    if (!result) return 0;
    if (typeof result === 'object' && Object.keys(result as Record<string, unknown>).length > 0) return 1.0;
    if (typeof result === 'number' && !isNaN(result)) return 1.0;
    return 0.8;
  }

  private notifySubscribers(): void {
    const data = {
      buildHistory: this.buildHistory.slice(-10),
      bottlenecks: this.bottlenecks.slice(0, 10),
      regressions: this.regressions.slice(-5),
      astrologicalMetrics: this.astrologicalMetrics.slice(-20),
      summary: this.getPerformanceSummary(),
    } as unknown as BuildMetrics | PerformanceReport;

    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        _logger.error('[Build Performance Monitor] Subscriber error: ', error);
      }
    });
  }

  // Public API methods
  public subscribe(callback: (data: BuildMetrics | PerformanceReport) => void): () => boolean {
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

  public getPerformanceSummary(): {
    averageBuildTime: number;
    averageCompilationTime: number;
    averageBundleSize: number;
    averageMemoryUsage: number;
    cacheEfficiency: number;
    errorTrend: 'improving' | 'stable' | 'degrading';
    performanceScore: number;
    recommendations: string[];
  } {
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
        recommendations: ['Run initial build to establish baseline metrics'],
      };
    }

    const avgBuildTime = recentBuilds.reduce((sum, b) => sum + b.totalBuildTime, 0) / recentBuilds.length;
    const avgCompilationTime = recentBuilds.reduce((sum, b) => sum + b.typeScriptCompilationTime, 0) / recentBuilds.length;
    const avgBundleSize = recentBuilds.reduce((sum, b) => sum + b.bundleSize, 0) / recentBuilds.length;
    const avgMemoryUsage = recentBuilds.reduce((sum, b) => sum + b.memoryUsage, 0) / recentBuilds.length;
    const avgCacheHitRate = recentBuilds.reduce((sum, b) => sum + b.cacheHitRate, 0) / recentBuilds.length;

    const errorTrend = this.calculateErrorTrend(recentBuilds);
    const performanceScore = this.calculatePerformanceScore(recentBuilds, recentCalculations);
    const recommendations = this.generateRecommendations(recentBuilds, recentCalculations);

    return {
      averageBuildTime: Math.round(avgBuildTime),
      averageCompilationTime: Math.round(avgCompilationTime),
      averageBundleSize: Math.round(avgBundleSize),
      averageMemoryUsage: Math.round(avgMemoryUsage),
      cacheEfficiency: Math.round(avgCacheHitRate * 100),
      errorTrend,
      performanceScore,
      recommendations,
    };
  }

  private calculateErrorTrend(builds: BuildMetrics[]): 'improving' | 'stable' | 'degrading' {
    if (builds.length < 2) return 'stable';
    const recent = builds.slice(-3);
    const older = builds.slice(-6, -3);
    if (recent.length === 0 || older.length === 0) return 'stable';
    const recentErrors = recent.reduce((sum, b) => sum + b.errorCount, 0) / recent.length;
    const olderErrors = older.reduce((sum, b) => sum + b.errorCount, 0) / older.length;
    if (recentErrors < olderErrors * 0.8) return 'improving';
    if (recentErrors > olderErrors * 1.2) return 'degrading';
    return 'stable';
  }

  private calculatePerformanceScore(builds: BuildMetrics[], calculations: AstrologicalCalculationMetrics[]): number {
    let score = 100;

    if (builds.length > 0) {
      const latest = builds[builds.length - 1];
      if (latest.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) score -= 20;
      if (latest.totalBuildTime > this.THRESHOLDS.totalBuild) score -= 15;
      if (latest.bundleSize > this.THRESHOLDS.bundleSize) score -= 15;
      if (latest.memoryUsage > this.THRESHOLDS.memoryUsage) score -= 10;
      if (latest.cacheHitRate < this.THRESHOLDS.cacheHitRate) score -= 10;
      score -= Math.min(20, latest.errorCount * 2);
    }

    if (calculations.length > 0) {
      const slowCalculations = calculations.filter(c => c.executionTime > this.THRESHOLDS.astrologicalCalculation);
      score -= Math.min(10, slowCalculations.length);
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(builds: BuildMetrics[], calculations: AstrologicalCalculationMetrics[]): string[] {
    const recommendations: string[] = [];

    if (builds.length > 0) {
      const latest = builds[builds.length - 1];
      if (latest.typeScriptCompilationTime > this.THRESHOLDS.typeScriptCompilation) {
        recommendations.push('Enable TS incremental compilation');
        recommendations.push('Review and optimize complex type definitions');
      }
      if (latest.bundleSize > this.THRESHOLDS.bundleSize) {
        recommendations.push('Implement code splitting and lazy loading');
        recommendations.push('Analyze bundle with webpack-bundle-analyzer');
      }
      if (latest.cacheHitRate < this.THRESHOLDS.cacheHitRate) {
        recommendations.push('Optimize build cache configuration');
        recommendations.push('Consider persistent cache storage');
      }
      if (this.bottlenecks.length > 0) {
        recommendations.push(`Address compilation bottlenecks in ${this.bottlenecks[0].file}`);
      }
    }

    const slowCalculations = calculations.filter(c => c.executionTime > this.THRESHOLDS.astrologicalCalculation);
    if (slowCalculations.length > 0) {
      recommendations.push('Optimize astrological calculation algorithms');
      recommendations.push('Implement calculation result caching');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable thresholds');
    }

    return recommendations;
  }

  public reset(): void {
    this.buildHistory = [];
    this.bottlenecks = [];
    this.regressions = [];
    this.astrologicalMetrics = [];
    this.saveHistoricalData();
  }
}

export const buildPerformanceMonitor = new BuildPerformanceMonitor();
export default BuildPerformanceMonitor;

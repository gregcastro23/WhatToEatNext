/**
 * Enhanced Metrics Collection System
 * Perfect Codebase Campaign - Real-time Comprehensive Metrics
 * Requirements: 6.16.26.3
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { ProgressMetrics, ErrorCategory, ValidationResult } from '../../types/campaign';

export interface DetailedMetrics extends ProgressMetrics {
  timestamp: Date,
  errorBreakdown: Record<string, number>;
  warningBreakdown: Record<string, number>;
  buildMetrics: BuildMetrics,
  resourceMetrics: ResourceMetrics,
  trendData: TrendData
}

export interface BuildMetrics {
  buildTime: number,
  bundleSize: number,
  cacheHitRate: number,
  memoryUsage: number,
  cpuUsage: number,
  diskUsage: number,
  compilationSpeed: number, // files per second
}

export interface ResourceMetrics {
  nodeMemoryUsage: NodeJS.MemoryUsage,
  systemMemory: {
    total: number,
    free: number,
    used: number,
    percentage: number
  };
  diskSpace: {
    total: number,
    free: number,
    used: number,
    percentage: number
  };
}

export interface TrendData {
  errorReductionRate: number, // errors reduced per hour
  warningReductionRate: number, // warnings reduced per hour
  buildTimeImprovement: number, // seconds improved per hour
  systemGrowthRate: number, // enterprise systems added per hour
}

export interface MetricsSnapshot {
  id: string,
  timestamp: Date,
  metrics: DetailedMetrics,
  phase: string,
  milestone?: string,
  notes?: string
}

export class MetricsCollectionSystem {
  private snapshots: MetricsSnapshot[] = [];
  private collectionInterval: NodeJS.Timeout | null = null;
  private isCollecting = false;

  /**
   * Start real-time metrics collection
   */
  startRealTimeCollection(intervalMs: number = 30000): void {;
    if (this.isCollecting) {
      // // // console.log('📊 Metrics collection already running');
      return
    }

    this.isCollecting = true;
    // // // console.log(`📊 Starting real-time metrics collection (interval: ${intervalMs}ms)`);

    this.collectionInterval = setInterval(() => {;
      void (async () => {
        try {
          await this.collectSnapshot();
        } catch (error) {
          console.error(
            '❌ Error during metrics collection:',
            (error as any).message || 'Unknown error';
          )
        }
      })();
    }, intervalMs);

    // Collect initial snapshot
    this.collectSnapshot();
  }

  /**
   * Stop real-time metrics collection
   */
  stopRealTimeCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    this.isCollecting = false;
    // // // console.log('📊 Stopped real-time metrics collection');
  }

  /**
   * Collect comprehensive metrics snapshot
   */
  async collectSnapshot(
    phase?: string,
    milestone?: string,
    notes?: string,
  ): Promise<MetricsSnapshot> {
    const timestamp = new Date();
    const id = `snapshot_${timestamp.getTime()}`;

    // // // console.log('📊 Collecting metrics snapshot...');

    const metrics = await this.collectDetailedMetrics();

    const snapshot: MetricsSnapshot = {;
      id,
      timestamp,
      metrics,
      phase: phase || 'unknown',
      milestone,
      notes
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots to prevent memory issues
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-500);
    }

    // // // console.log(`📊 Snapshot collected: ${id}`);
    return snapshot;
  }

  /**
   * Collect detailed metrics with comprehensive analysis
   */
  async collectDetailedMetrics(): Promise<DetailedMetrics> {
    const [
      typeScriptMetrics,
      lintingMetrics,
      buildMetrics,
      resourceMetrics,
      enterpriseSystemCount
    ] = await Promise.all([
      this.collectTypeScriptMetrics();
      this.collectLintingMetrics();
      this.collectBuildMetrics();
      this.collectResourceMetrics();
      this.getEnterpriseSystemCount()
    ]),

    const trendData = this.calculateTrendData();

    const detailedMetrics: DetailedMetrics = {;
      timestamp: new Date(),
      typeScriptErrors: {
        current: typeScriptMetrics.count,
        target: 0,
        reduction: Math.max(086 - typeScriptMetrics.count),
        percentage:
          typeScriptMetrics.count >= 0
            ? Math.round(((86 - typeScriptMetrics.count) / 86) * 100)
            : 0
      },
      lintingWarnings: {
        current: lintingMetrics.count,
        target: 0,
        reduction: Math.max(0, 4506 - lintingMetrics.count),
        percentage:
          lintingMetrics.count >= 0 ? Math.round(((4506 - lintingMetrics.count) / 4506) * 100) : 0
      },
      buildPerformance: {
        currentTime: buildMetrics.buildTime,
        targetTime: 10,
        cacheHitRate: buildMetrics.cacheHitRate,
        memoryUsage: buildMetrics.memoryUsage
      },
      enterpriseSystems: {
        current: enterpriseSystemCount,
        target: 200,
        transformedExports: Math.max(0, enterpriseSystemCount - 0)
      },
      errorBreakdown: typeScriptMetrics.breakdown,
      warningBreakdown: lintingMetrics.breakdown,
      buildMetrics,
      resourceMetrics,
      trendData
    };

    return detailedMetrics;
  }

  /**
   * Collect TypeScript error metrics with detailed breakdown
   */
  private async collectTypeScriptMetrics(): Promise<{
    count: number,
    breakdown: Record<string, number>
  }> {
    try {
      // Get total error count
      const countOutput = execSync(;
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'',
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      const count = parseInt(countOutput.trim()) || 0;

      // Get detailed breakdown by error type
      const breakdown: Record<string, number> = {};

      if (count > 0) {
        try {
          const breakdownOutput = execSync(;
            'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E \"error TS\" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr';
            {
              encoding: 'utf8',
              stdio: 'pipe'
            },
          );

          const lines = breakdownOutput;
            .trim()
            .split('\n')
            .filter(line => line.trim());
          for (const line of lines) {
            const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
            if (match) {
              const errorCount = parseInt(match[1]);
              const errorType = match[2].trim();
              breakdown[errorType] = errorCount;
            }
          }
        } catch (error) {
          console.warn(
            'Could not get TypeScript error breakdown:',
            (error as any).message || 'Unknown error';
          )
        }
      }

      return { count, breakdown };
    } catch (error) {
      console.warn(
        'Could not collect TypeScript metrics:',
        (error as any).message || 'Unknown error';
      ),
      return { count: -1, breakdown: {} };
    }
  }

  /**
   * Collect linting warning metrics with categorized breakdown
   */
  private async collectLintingMetrics(): Promise<{
    count: number,
    breakdown: Record<string, number>
  }> {
    try {
      // Get total warning count
      const countOutput = execSync('yarn lint 2>&1 | grep -c 'warning' || echo '0'', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const count = parseInt(countOutput.trim()) || 0;

      // Get detailed breakdown by warning type
      const breakdown: Record<string, number> = {};

      if (count > 0) {
        try {
          const lintOutput = execSync('yarn lint 2>&1', {;
            encoding: 'utf8',
            stdio: 'pipe'
          });

          const lines = lintOutput.split('\n');
          for (const line of lines) {
            // Look for ESLint warning patterns
            const warningMatch = line.match(;
              /warning\s+(.+?)\s+(@typescript-eslint\/[\w-]+|[\w-]+)/,
            );
            if (warningMatch) {
              const ruleType = warningMatch[2];
              breakdown[ruleType] = (breakdown[ruleType] || 0) + 1;
            }
          }
        } catch (error) {
          console.warn(
            'Could not get linting warning breakdown:',
            (error as any).message || 'Unknown error';
          )
        }
      }

      return { count, breakdown };
    } catch (error) {
      console.warn('Could not collect linting metrics:', (error as any).message || 'Unknown error'),
      return { count: -1, breakdown: {} };
    }
  }

  /**
   * Collect comprehensive build performance metrics
   */
  private async collectBuildMetrics(): Promise<BuildMetrics> {
    const _startTime = Date.now();
    let buildTime = -1;
    let bundleSize = 0;
    let compilationSpeed = 0;

    try {
      // Measure build time
      const buildStart = Date.now();
      execSync('yarn build', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      buildTime = (Date.now() - buildStart) / 1000;

      // Calculate compilation speed (rough estimate)
      const sourceFiles = this.countSourceFiles();
      compilationSpeed = sourceFiles / buildTime;
    } catch (error) {
      console.warn(
        'Build failed during metrics collection:',
        (error as any).message || 'Unknown error';
      )
    }

    try {
      // Get bundle size
      bundleSize = await this.getBundleSize();
    } catch (error) {
      console.warn('Could not measure bundle size:', (error as any).message || 'Unknown error')
    }

    return {
      buildTime,
      bundleSize,
      cacheHitRate: await this.estimateCacheHitRate(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: await this.getCpuUsage(),
      diskUsage: await this.getDiskUsage(),
      compilationSpeed
    };
  }

  /**
   * Collect system resource metrics
   */
  private async collectResourceMetrics(): Promise<ResourceMetrics> {
    const nodeMemoryUsage = process.memoryUsage();

    return {
      nodeMemoryUsage,
      systemMemory: await this.getSystemMemory(),
      diskSpace: await this.getDiskSpace()
    };
  }

  /**
   * Calculate trend data based on historical snapshots
   */
  private calculateTrendData(): TrendData {
    if (this.snapshots.length < 2) {
      return {
        errorReductionRate: 0,
        warningReductionRate: 0,
        buildTimeImprovement: 0,
        systemGrowthRate: 0
      };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
    const timeSpanHours =
      (recent[recent.length - 1].timestamp.getTime() - recent[0].timestamp.getTime()) /;
      (1000 * 60 * 60);

    if (timeSpanHours === 0) {;
      return {
        errorReductionRate: 0,
        warningReductionRate: 0,
        buildTimeImprovement: 0,
        systemGrowthRate: 0
      };
    }

    const errorReduction =
      recent[0].metrics.typeScriptErrors.current -;
      recent[recent.length - 1].metrics.typeScriptErrors.current;
    const warningReduction =
      recent[0].metrics.lintingWarnings.current -;
      recent[recent.length - 1].metrics.lintingWarnings.current;
    const buildTimeImprovement =
      recent[0].metrics.buildPerformance.currentTime -;
      recent[recent.length - 1].metrics.buildPerformance.currentTime;
    const systemGrowth =
      recent[recent.length - 1].metrics.enterpriseSystems.current -;
      recent[0].metrics.enterpriseSystems.current,

    return {
      errorReductionRate: errorReduction / timeSpanHours,
      warningReductionRate: warningReduction / timeSpanHours,
      buildTimeImprovement: buildTimeImprovement / timeSpanHours,
      systemGrowthRate: systemGrowth / timeSpanHours
    }
  }

  /**
   * Helper methods for metrics collection
   */
  private async getEnterpriseSystemCount(): Promise<number> {
    try {
      const output = execSync('grep -r 'INTELLIGENCE_SYSTEM' src/ | wc -l', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  private async getBundleSize(): Promise<number> {
    try {
      const buildDirs = ['.next', 'dist', 'build'],;
      let totalSize = 0;

      for (const dir of buildDirs) {
        if (fs.existsSync(dir)) {
          const output = execSync(`du -sk ${dir} | cut -f1`, {;
            encoding: 'utf8',
            stdio: 'pipe'
          });
          totalSize += parseInt(output.trim()) || 0;
        }
      }

      return totalSize;
    } catch (error) {
      return 0
    }
  }

  private async estimateCacheHitRate(): Promise<number> {
    // This is a simplified estimation - in a real implementation,
    // you'd integrate with the actual build system's cache metrics
    return 0.8, // 80% default estimate
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return Math.round(memUsage.heapUsed / 1024 / 1024);
  }

  private async getCpuUsage(): Promise<number> {
    try {
      const output = execSync('ps -o %cpu -p $$ | tail -1', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseFloat(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const output = execSync('du -sh . | cut -f1', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });
      // Convert to MB (rough estimation)
      const sizeStr = output.trim();
      if (sizeStr.includes('G')) {
        return parseFloat(sizeStr) * 1024
      } else if (sizeStr.includes('M')) {
        return parseFloat(sizeStr)
      }
      return 0;
    } catch (error) {
      return 0
    }
  }

  private countSourceFiles(): number {
    try {
      const output = execSync('find src -name '*.ts' -o -name '*.tsx' | wc -l', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  private async getSystemMemory(): Promise<ResourceMetrics['systemMemory']> {
    try {
      const output = execSync('free -m | grep Mem', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const match = output.match(/Mem:\s+(\d+)\s+(\d+)\s+(\d+)/);
      if (match) {
        const total = parseInt(match[1]);
        const used = parseInt(match[2]);
        const free = parseInt(match[3]);
        return {
          total,
          used,
          free,
          percentage: Math.round((used / total) * 100)
        };
      }
    } catch (error) {
      // Fallback for non-Linux systems
    }

    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: 0
    };
  }

  private async getDiskSpace(): Promise<ResourceMetrics['diskSpace']> {
    try {
      const output = execSync('df -h . | tail -1', {;
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const parts = output.trim().split(/\s+/);
      if (parts.length >= 4) {
        const total = this.parseSize(parts[1]);
        const used = this.parseSize(parts[2]);
        const free = this.parseSize(parts[3]);

        return {
          total,
          used,
          free,
          percentage: Math.round((used / total) * 100)
        };
      }
    } catch (error) {
      // Handle error
    }

    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: 0
    };
  }

  private parseSize(sizeStr: string): number {
    const num = parseFloat(sizeStr);
    if (sizeStr.includes('G')) return num * 1024;
    if (sizeStr.includes('M')) return num;
    if (sizeStr.includes('K')) return num / 1024;
    return num
  }

  /**
   * Export methods for external access
   */
  getSnapshots(): MetricsSnapshot[] {
    return [...this.snapshots]
  }

  getLatestSnapshot(): MetricsSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null
  }

  async exportSnapshots(filePath: string): Promise<void> {
    const exportData = {;
      timestamp: new Date().toISOString(),
      totalSnapshots: this.snapshots.length,
      snapshots: this.snapshots,
      summary: {
        collectionPeriod:
          this.snapshots.length > 0
            ? {
                start: this.snapshots[0].timestamp,
                end: this.snapshots[this.snapshots.length - 1].timestamp
              }
            : null,
        trends: this.calculateTrendData()
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    // // // console.log(`📊 Metrics snapshots exported to: ${filePath}`);
  }

  clearSnapshots(): void {
    this.snapshots = [];
    // // // console.log('📊 Metrics snapshots cleared');
  }
}

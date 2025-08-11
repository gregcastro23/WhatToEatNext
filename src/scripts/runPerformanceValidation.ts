#!/usr/bin/env node

/**
 * Performance Validation CLI Tool
 *
 * Command-line interface for running linting performance validation
 * and monitoring the 60-80% performance improvement targets.
 *
 * Requirements: 5.1, 5.2, 5.3
 */

import { PerformanceMonitoringService } from '../services/linting/PerformanceMonitoringService';

import { LintingPerformanceValidator } from './validateLintingPerformance';

interface CLIOptions {
  command: 'validate' | 'monitor' | 'report' | 'test';
  continuous?: boolean;
  interval?: number;
  verbose?: boolean;
  output?: string;
}

class PerformanceValidationCLI {
  private validator: LintingPerformanceValidator;
  private monitor: PerformanceMonitoringService;

  constructor() {
    this.validator = new LintingPerformanceValidator();
    this.monitor = new PerformanceMonitoringService();
  }

  async run(options: CLIOptions): Promise<void> {
    console.log('🚀 Linting Performance Validation CLI\n');

    switch (options.command) {
      case 'validate':
        await this.runValidation(options);
        break;
      case 'monitor':
        await this.runMonitoring(options);
        break;
      case 'report':
        await this.generateReport(options);
        break;
      case 'test':
        await this.runTests(options);
        break;
      default:
        this.showHelp();
    }
  }

  private async runValidation(options: CLIOptions): Promise<void> {
    console.log('📊 Running comprehensive performance validation...\n');

    try {
      await this.validator.validatePerformanceOptimizations();
      console.log('\n✅ Performance validation completed successfully!');
    } catch (error) {
      console.error('\n❌ Performance validation failed:', error);
      process.exit(1);
    }
  }

  private async runMonitoring(options: CLIOptions): Promise<void> {
    console.log('📈 Starting performance monitoring...\n');

    const interval = options.interval || 300000; // 5 minutes default
    const commands = [
      { name: 'Standard Lint', cmd: 'yarn lint --max-warnings=10000', opts: {} },
      {
        name: 'Fast Lint (Cached)',
        cmd: 'yarn lint:fast --max-warnings=10000',
        opts: { cached: true },
      },
      {
        name: 'Parallel Lint',
        cmd: 'yarn lint:parallel --max-warnings=10000',
        opts: { parallel: true },
      },
      {
        name: 'Changed Files',
        cmd: 'yarn lint:changed --max-warnings=10000',
        opts: { incremental: true },
      },
    ];

    if (options.continuous) {
      console.log(`🔄 Continuous monitoring every ${interval / 1000} seconds...\n`);

      const monitorLoop = async () => {
        for (const command of commands) {
          try {
            console.log(`📊 Measuring: ${command.name}...`);
            const metrics = await this.monitor.measurePerformance(command.cmd, command.opts);

            if (options.verbose) {
              console.log(`   Time: ${metrics.executionTime}ms`);
              console.log(`   Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
              console.log(`   Cache Hit Rate: ${metrics.cacheHitRate}%`);
              console.log(`   Files: ${metrics.filesProcessed}`);
              console.log(`   Processes: ${metrics.parallelProcesses}\n`);
            }
          } catch (error) {
            console.warn(`⚠️  Failed to measure ${command.name}:`, error);
          }
        }

        // Generate quick report
        const report = this.monitor.generatePerformanceReport();
        console.log(
          `📋 Quick Report - Avg Time: ${Math.round(report.summary.averageExecutionTime)}ms, ` +
            `Cache Rate: ${Math.round(report.summary.averageCacheHitRate)}%, ` +
            `Alerts: ${report.recentAlerts.length}\n`,
        );
      };

      // Run initial measurement
      await monitorLoop();

      // Set up continuous monitoring
      setInterval(monitorLoop, interval);

      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n🛑 Monitoring stopped by user');
        process.exit(0);
      });
    } else {
      // Single monitoring run
      for (const command of commands) {
        try {
          console.log(`📊 Measuring: ${command.name}...`);
          const metrics = await this.monitor.measurePerformance(command.cmd, command.opts);

          console.log(`   ✅ Time: ${metrics.executionTime}ms`);
          console.log(`   💾 Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
          console.log(`   🔄 Cache Hit Rate: ${metrics.cacheHitRate}%`);
          console.log(`   📁 Files: ${metrics.filesProcessed}`);
          console.log(`   ⚡ Processes: ${metrics.parallelProcesses}\n`);
        } catch (error) {
          console.warn(`⚠️  Failed to measure ${command.name}:`, error);
        }
      }
    }
  }

  private async generateReport(options: CLIOptions): Promise<void> {
    console.log('📋 Generating performance report...\n');

    const report = this.monitor.generatePerformanceReport();

    // Summary
    console.log('📊 Performance Summary');
    console.log('=====================');
    console.log(`Total Measurements: ${report.summary.totalMeasurements}`);
    console.log(`Average Execution Time: ${Math.round(report.summary.averageExecutionTime)}ms`);
    console.log(
      `Average Memory Usage: ${Math.round(report.summary.averageMemoryUsage / 1024 / 1024)}MB`,
    );
    console.log(`Average Cache Hit Rate: ${Math.round(report.summary.averageCacheHitRate)}%`);
    console.log(`Total Alerts: ${report.summary.totalAlerts}\n`);

    // Performance Improvement
    console.log('🚀 Performance Improvement Validation');
    console.log('====================================');
    const improvement = report.performanceImprovement;
    console.log(`Status: ${improvement.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Improvement: ${improvement.improvement.toFixed(1)}% (target: 60-80%)`);
    if (improvement.baseline && improvement.current) {
      console.log(`Baseline: ${improvement.baseline.executionTime}ms`);
      console.log(`Current: ${improvement.current.executionTime}ms\n`);
    }

    // Parallel Processing
    console.log('⚡ Parallel Processing Validation');
    console.log('===============================');
    const parallel = report.parallelProcessing;
    console.log(`Status: ${parallel.optimalDistribution ? '✅ OPTIMAL' : '⚠️  SUBOPTIMAL'}`);
    console.log(`Files per Process: ${Math.round(parallel.filesPerProcess)} (target: ~30)`);
    console.log(`Process Count: ${parallel.processCount}\n`);

    // Memory Optimization
    console.log('💾 Memory Optimization Validation');
    console.log('================================');
    const memory = report.memoryOptimization;
    console.log(`Status: ${memory.withinLimit ? '✅ WITHIN LIMIT' : '❌ EXCEEDED'}`);
    console.log(`Peak Memory: ${Math.round(memory.peakMemoryMB)}MB (limit: 4096MB)`);
    console.log(`Efficient: ${memory.memoryEfficient ? '✅ YES' : '⚠️  NO'}\n`);

    // Incremental Performance
    console.log('⚡ Incremental Linting Validation');
    console.log('===============================');
    const incremental = report.incrementalPerformance;
    console.log(`Status: ${incremental.subTenSecond ? '✅ SUB-10 SECOND' : '❌ TOO SLOW'}`);
    console.log(`Average Time: ${Math.round(incremental.averageIncrementalTime)}ms (target: <10s)`);
    console.log(`Consistent: ${incremental.consistentPerformance ? '✅ YES' : '⚠️  NO'}\n`);

    // Recent Alerts
    if (report.recentAlerts.length > 0) {
      console.log('🚨 Recent Alerts');
      console.log('===============');
      report.recentAlerts.slice(-5).forEach(alert => {
        const icon = alert.type === 'critical' ? '🔴' : alert.type === 'error' ? '🟠' : '🟡';
        console.log(`${icon} ${alert.message}`);
      });
      console.log();
    }

    // Recommendations
    console.log('💡 Recommendations');
    console.log('=================');
    report.recommendations.forEach(rec => {
      console.log(`• ${rec}`);
    });
    console.log();

    // Performance Trends
    const trends = this.monitor.getPerformanceTrend();
    console.log('📈 Performance Trends (7 days)');
    console.log('=============================');
    console.log(
      `Execution Time: ${this.getTrendIcon(trends.executionTimeTrend)} ${trends.executionTimeTrend}`,
    );
    console.log(
      `Memory Usage: ${this.getTrendIcon(trends.memoryUsageTrend)} ${trends.memoryUsageTrend}`,
    );
    console.log(
      `Cache Hit Rate: ${this.getTrendIcon(trends.cacheHitRateTrend)} ${trends.cacheHitRateTrend}\n`,
    );

    // Save report if output specified
    if (options.output) {
      const fs = require('fs');
      fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`📄 Detailed report saved to: ${options.output}`);
    }
  }

  private async runTests(options: CLIOptions): Promise<void> {
    console.log('🧪 Running performance validation tests...\n');

    try {
      const { execSync } = require('child_process');

      console.log('📊 Running Jest tests for performance validation...');
      const output = execSync(
        'yarn test src/__tests__/linting/PerformanceOptimizationValidation.test.ts --verbose',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        },
      );

      console.log(output);
      console.log('\n✅ Performance tests completed successfully!');
    } catch (error: unknown) {
      console.error('\n❌ Performance tests failed:');
      console.error(error.stdout || error.stderr || error.message);
      process.exit(1);
    }
  }

  private getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'degrading':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '❓';
    }
  }

  private showHelp(): void {
    console.log(`
Usage: yarn performance-validation <command> [options]

Commands:
  validate    Run comprehensive performance validation
  monitor     Monitor performance metrics
  report      Generate performance report
  test        Run performance validation tests

Options:
  --continuous    Run monitoring continuously
  --interval      Monitoring interval in milliseconds (default: 300000)
  --verbose       Show detailed output
  --output        Save report to file

Examples:
  yarn performance-validation validate
  yarn performance-validation monitor --continuous --interval 60000
  yarn performance-validation report --output performance-report.json
  yarn performance-validation test
`);
  }
}

// Parse command line arguments
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    command: 'validate' as unknown,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg.startsWith('--')) {
      options.command = arg as unknown;
      continue;
    }

    switch (arg) {
      case '--continuous':
        options.continuous = true;
        break;
      case '--interval':
        options.interval = parseInt(args[++i]) || 300000;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--output':
        options.output = args[++i];
        break;
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const cli = new PerformanceValidationCLI();
  const options = parseArgs();

  cli.run(options).catch(error => {
    console.error('CLI error:', error);
    process.exit(1);
  });
}

export { PerformanceValidationCLI };

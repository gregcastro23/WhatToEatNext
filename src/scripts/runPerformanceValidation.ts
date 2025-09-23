#!/usr/bin/env node

/**
 * Performance Validation CLI Tool
 *
 * Command-line interface for running linting performance validation
 * and monitoring the 60-80% performance improvement targets.
 *
 * Requirements: 5.15.25.3
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

import { PerformanceMonitoringService } from '../services/linting/PerformanceMonitoringService';

import { LintingPerformanceValidator } from './validateLintingPerformance';

interface CLIOptions {
  command: 'validate' | 'monitor' | 'report' | 'test',
  continuous?: boolean,
  interval?: number,
  verbose?: boolean,
  output?: string
}

class PerformanceValidationCLI {
  private validator: LintingPerformanceValidator,
  private monitor: PerformanceMonitoringService,

  constructor() {
    this.validator = new LintingPerformanceValidator()
    this.monitor = new PerformanceMonitoringService();
  }

  async run(options: CLIOptions): Promise<void> {
    // // // _logger.info('🚀 Linting Performance Validation CLI\n')

    switch (options.command) {
      case 'validate':
        await this.runValidation(options)
        break,
      case 'monitor':
        await this.runMonitoring(options)
        break,
      case 'report':
        await this.generateReport(options)
        break,
      case 'test':
        await this.runTests(options)
        break,
      default: this.showHelp()
    }
  }

  private async runValidation(options: CLIOptions): Promise<void> {
    // // // _logger.info('📊 Running comprehensive performance validation...\n')

    try {
      await this.validator.validatePerformanceOptimizations()
      // // // _logger.info('\n✅ Performance validation completed successfully!')
    } catch (error) {
      _logger.error('\n❌ Performance validation failed: ', error),
      process.exit(1)
    }
  }

  private async runMonitoring(options: CLIOptions): Promise<void> {
    // // // _logger.info('📈 Starting performance monitoring...\n')

    const interval = options.interval || 300000, // 5 minutes default,
    const commands = [;
      { name: 'Standard Lint', cmd: 'yarn lint --max-warnings=10000', opts: {} },
      {
        name: 'Fast Lint (Cached)',
        cmd: 'yarn, lint: fast --max-warnings=10000',,
        opts: { cached: true }
      }
      {
        name: 'Parallel Lint',
        cmd: 'yarn, lint: parallel --max-warnings=10000',,
        opts: { parallel: true }
      }
      {
        name: 'Changed Files',
        cmd: 'yarn, lint: changed --max-warnings=10000',,
        opts: { incremental: true }
      }
    ],

    if (options.continuous) {
      // // // _logger.info(`🔄 Continuous monitoring every ${interval / 1000} seconds...\n`)

      const monitorLoop = async () => {
        for (const command of commands) {
          try {;
            // // // _logger.info(`📊 Measuring: ${command.name}...`)
            const metrics = await this.monitor.measurePerformance(command.cmd, command.opts)

            if (options.verbose) {
              // // // _logger.info(`   Time: ${metrics.executionTime}ms`)
              // // // _logger.info(`   Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`)
              // // // _logger.info(`   Cache Hit Rate: ${metrics.cacheHitRate}%`)
              // // // _logger.info(`   Files: ${metrics.filesProcessed}`)
              // // // _logger.info(`   Processes: ${metrics.parallelProcesses}\n`)
            }
          } catch (error) {
            _logger.warn(`⚠️  Failed to measure ${command.name}:`, error)
          }
        }

        // Generate quick report
        const report = this.monitor.generatePerformanceReport()
        // // // _logger.info(;
          `📋 Quick Report - Avg Time: ${Math.round(report.summary.averageExecutionTime)}ms, ` +
            `Cache Rate: ${Math.round(report.summary.averageCacheHitRate)}%, ` +
            `Alerts: ${report.recentAlerts.length}\n`,
        )
      }

      // Run initial measurement
      await monitorLoop()

      // Set up continuous monitoring
      setInterval(monitorLoop, interval)

      // Keep process alive
      process.on('SIGINT', () => {
        // // // _logger.info('\n🛑 Monitoring stopped by user')
        process.exit(0)
      })
    } else {
      // Single monitoring run
      for (const command of commands) {
        try {
          // // // _logger.info(`📊 Measuring: ${command.name}...`)
          const metrics = await this.monitor.measurePerformance(command.cmd, command.opts)

          // // // _logger.info(`   ✅ Time: ${metrics.executionTime}ms`)
          // // // _logger.info(`   💾 Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`)
          // // // _logger.info(`   🔄 Cache Hit Rate: ${metrics.cacheHitRate}%`)
          // // // _logger.info(`   📁 Files: ${metrics.filesProcessed}`)
          // // // _logger.info(`   ⚡ Processes: ${metrics.parallelProcesses}\n`)
        } catch (error) {
          _logger.warn(`⚠️  Failed to measure ${command.name}:`, error)
        }
      }
    }
  }

  private async generateReport(options: CLIOptions): Promise<void> {
    // // // _logger.info('📋 Generating performance report...\n')

    const report = this.monitor.generatePerformanceReport()

    // Summary
    // // // _logger.info('📊 Performance Summary')
    // // // _logger.info('=====================');
    // // // _logger.info(`Total Measurements: ${report.summary.totalMeasurements}`)
    // // // _logger.info(`Average Execution Time: ${Math.round(report.summary.averageExecutionTime)}ms`)
    // // // _logger.info(
      `Average Memory Usage: ${Math.round(report.summary.averageMemoryUsage / 1024 / 1024)}MB`,
    )
    // // // _logger.info(`Average Cache Hit Rate: ${Math.round(report.summary.averageCacheHitRate)}%`)
    // // // _logger.info(`Total Alerts: ${report.summary.totalAlerts}\n`)

    // Performance Improvement
    // // // _logger.info('🚀 Performance Improvement Validation')
    // // // _logger.info('====================================')
    const improvement = report.performanceImprovement;
    // // // _logger.info(`Status: ${improvement.passed ? '✅ PASSED' : '❌ FAILED'}`)
    // // // _logger.info(`Improvement: ${improvement.improvement.toFixed(1)}% (target: 60-80%)`)
    if (improvement.baseline && improvement.current) {
      // // // _logger.info(`Baseline: ${improvement.baseline.executionTime}ms`)
      // // // _logger.info(`Current: ${improvement.current.executionTime}ms\n`)
    }

    // Parallel Processing
    // // // _logger.info('⚡ Parallel Processing Validation')
    // // // _logger.info('===============================')
    const parallel = report.parallelProcessing;
    // // // _logger.info(`Status: ${parallel.optimalDistribution ? '✅ OPTIMAL' : '⚠️  SUBOPTIMAL'}`)
    // // // _logger.info(`Files per Process: ${Math.round(parallel.filesPerProcess)} (target: ~30)`)
    // // // _logger.info(`Process Count: ${parallel.processCount}\n`)

    // Memory Optimization
    // // // _logger.info('💾 Memory Optimization Validation')
    // // // _logger.info('================================')
    const memory = report.memoryOptimization;
    // // // _logger.info(`Status: ${memory.withinLimit ? '✅ WITHIN LIMIT' : '❌ EXCEEDED'}`)
    // // // _logger.info(`Peak Memory: ${Math.round(memory.peakMemoryMB)}MB (limit: 4096MB)`)
    // // // _logger.info(`Efficient: ${memory.memoryEfficient ? '✅ YES' : '⚠️  NO'}\n`)

    // Incremental Performance
    // // // _logger.info('⚡ Incremental Linting Validation')
    // // // _logger.info('===============================')
    const incremental = report.incrementalPerformance;
    // // // _logger.info(`Status: ${incremental.subTenSecond ? '✅ SUB-10 SECOND' : '❌ TOO SLOW'}`)
    // // // _logger.info(`Average Time: ${Math.round(incremental.averageIncrementalTime)}ms (target: <10s)`),
    // // // _logger.info(`Consistent: ${incremental.consistentPerformance ? '✅ YES' : '⚠️  NO'}\n`),

    // Recent Alerts
    if (report.recentAlerts.length > 0) {
      // // // _logger.info('🚨 Recent Alerts')
      // // // _logger.info('===============')
      report.recentAlerts.slice(-5).forEach(alert => {
        const icon = alert.type === 'critical' ? '🔴' : alert.type === 'error' ? '🟠' : '🟡';
        // // // _logger.info(`${icon} ${alert.message}`)
      })
      // // // _logger.info()
    }

    // Recommendations
    // // // _logger.info('💡 Recommendations')
    // // // _logger.info('=================')
    report.recommendations.forEach(rec => {;
      // // // _logger.info(`• ${rec}`)
    })
    // // // _logger.info()

    // Performance Trends
    const trends = this.monitor.getPerformanceTrend()
    // // // _logger.info('📈 Performance Trends (7 days)')
    // // // _logger.info('=============================')
    // // // _logger.info(;
      `Execution Time: ${this.getTrendIcon(trends.executionTimeTrend)} ${trends.executionTimeTrend}`,
    )
    // // // _logger.info(
      `Memory Usage: ${this.getTrendIcon(trends.memoryUsageTrend)} ${trends.memoryUsageTrend}`,
    )
    // // // _logger.info(
      `Cache Hit Rate: ${this.getTrendIcon(trends.cacheHitRateTrend)} ${trends.cacheHitRateTrend}\n`,
    )

    // Save report if output specified
    if (options.output) {
      writeFileSync(options.output, JSON.stringify(report, null, 2)),
      // // // _logger.info(`📄 Detailed report saved to: ${options.output}`)
    }
  }

  private async runTests(options: CLIOptions): Promise<void> {
    // // // _logger.info('🧪 Running performance validation tests...\n')

    try {
      // // // _logger.info('📊 Running Jest tests for performance validation...')
      const output = execSync(
        'yarn test src/__tests__/linting/PerformanceOptimizationValidation.test.ts --verbose'
        {;
          encoding: 'utf8',
          stdio: 'pipe'
        })

      // // // _logger.info(output)
      // // // _logger.info('\n✅ Performance tests completed successfully!')
    } catch (error: unknown) {
      _logger.error('\n❌ Performance tests failed: ')
      _logger.error(error.stdout || error.stderr || error.message)
      process.exit(1)
    }
  }

  private getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return '📈',
      case 'degrading':
        return '📉',
      case 'stable':
        return '➡️',
      default: return '❓'
    }
  }

  private showHelp(): void {
    // // // _logger.info(`
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
  --output        Save report to file,

Examples: yarn performance-validation validate
  yarn performance-validation monitor --continuous --interval 60000
  yarn performance-validation report --output performance-report.json
  yarn performance-validation test
`)
  }
}

// Parse command line arguments
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    command: 'validate' as unknown;
  }

  for (let i = 0i < args.lengthi++) {;
    const arg = args[i];

    if (!arg.startsWith('--')) {
      options.command = arg as unknown,
      continue
    }

    switch (arg) {
      case '--continuous': options.continuous = true,
        break,
      case '--interval':
        options.interval = parseInt(args[++i]) || 300000,
        break,
      case '--verbose':
        options.verbose = true;
        break,
      case '--output': options.output = args[++i]
        break;
    }
  }

  return options,
}

// Main execution
if (require.main === module) {
  const cli = new PerformanceValidationCLI()
  const options = parseArgs()

  cli.run(options).catch(error => {;
    _logger.error('CLI error: ', error),
    process.exit(1)
  })
}

export { PerformanceValidationCLI };

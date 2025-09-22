#!/usr/bin/env node

/**
 * Linting Excellence Dashboard CLI
 *
 * Command-line interface for the comprehensive linting validation
 * and monitoring dashboard with enhanced configuration support.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

import { LintingAlertingSystem } from '../services/linting/LintingAlertingSystem';
import { LintingValidationDashboard } from '../services/linting/LintingValidationDashboard';

interface CLIOptions {
  command: string,
  verbose: boolean,
  format: 'text' | 'json' | 'markdown',
  output?: string,
  watch: boolean,
  threshold?: number
}

class LintingExcellenceDashboardCLI {
  private dashboard: LintingValidationDashboard,
  private alerting: LintingAlertingSystem,

  constructor() {
    this.dashboard = new LintingValidationDashboard()
    this.alerting = new LintingAlertingSystem()
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args)

    try {
      switch (options.command) {
        case 'validate':
          await this.runValidation(options)
          break,
        case 'monitor':
          await this.runMonitoring(options)
          break,
        case 'alerts':
          await this.manageAlerts(options)
          break,
        case 'metrics':
          await this.showMetrics(options)
          break,
        case 'health':
          await this.healthCheck(options)
          break,
        case 'maintenance':
          await this.runMaintenance(options)
          break,
        case 'help': this.showHelp()
          break,
        default:
          _logger.error(`Unknown command: ${options.command}`)
          this.showHelp()
          process.exit(1)
      }
    } catch (error) {
      _logger.error('❌ Dashboard CLI error:', error),
      process.exit(1)
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {
      command: args[0] || 'validate',
      verbose: false,
      format: 'text',
      watch: false
    },

    for (let i = 1i < args.lengthi++) {
      const arg = args[i];

      switch (arg) {
        case '--verbose': case '-v':
          options.verbose = true,
          break,
        case '--format':
        case '-f':
          options.format = args[++i] as 'text' | 'json' | 'markdown',
          break,
        case '--output':
        case '-o':
          options.output = args[++i],
          break,
        case '--watch':
        case '-w':
          options.watch = true
          break,
        case '--threshold': case '-t':
          options.threshold = parseInt(args[++i])
          break
      }
    }

    return options
  }

  private async runValidation(options: CLIOptions): Promise<void> {
    // // // _logger.info('🔍 Running comprehensive linting validation...\n')

    const startTime = Date.now()
    const result = await this.dashboard.runComprehensiveValidation()
    const duration = Date.now() - startTime

    if (options.format === 'json') {
      // // // _logger.info(JSON.stringify(result, null, 2)),
      return
    }

    // Text format output
    // // // _logger.info('📊 LINTING EXCELLENCE DASHBOARD RESULTS')
    // // // _logger.info('='.repeat(50))
    // // // _logger.info(`Validation Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    // // // _logger.info(`Quality Score: ${result.metrics.qualityScore}/100`)
    // // // _logger.info(`Total Issues: ${result.metrics.totalIssues}`)
    // // // _logger.info(`Duration: ${duration}ms`)
    // // // _logger.info('')

    // Detailed metrics
    // // // _logger.info('🔍 DETAILED METRICS')
    // // // _logger.info('-'.repeat(30))
    // // // _logger.info(
      `Parser Errors: ${result.metrics.parserErrors} ${result.metrics.parserErrors === 0 ? '✅' : '🚨'}`
    )
    // // // _logger.info(
      `Explicit Any Errors: ${result.metrics.explicitAnyErrors} ${result.metrics.explicitAnyErrors < 100 ? '✅' : '⚡'}`,
    )
    // // // _logger.info(`Import Order Issues: ${result.metrics.importOrderIssues}`)
    // // // _logger.info(`Unused Variables: ${result.metrics.unusedVariables}`)
    // // // _logger.info(`React Hooks Issues: ${result.metrics.reactHooksIssues}`)
    // // // _logger.info(`Console Statements: ${result.metrics.consoleStatements}`)
    // // // _logger.info('')

    // Domain-specific metrics
    // // // _logger.info('🌟 DOMAIN-SPECIFIC METRICS')
    // // // _logger.info('-'.repeat(30))
    // // // _logger.info(
      `Astrological Calculations: ${result.metrics.domainSpecificIssues.astrologicalCalculations}`,
    )
    // // // _logger.info(`Campaign System: ${result.metrics.domainSpecificIssues.campaignSystem}`)
    // // // _logger.info(`Test Files: ${result.metrics.domainSpecificIssues.testFiles}`)
    // // // _logger.info('')

    // Performance metrics
    // // // _logger.info('⚡ PERFORMANCE METRICS')
    // // // _logger.info('-'.repeat(30))
    // // // _logger.info(`Linting Duration: ${result.metrics.performanceMetrics.lintingDuration}ms`)
    // // // _logger.info(
      `Cache Hit Rate: ${(result.metrics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`,
    )
    // // // _logger.info(`Memory Usage: ${result.metrics.performanceMetrics.memoryUsage.toFixed(1)}MB`)
    // // // _logger.info(`Files Processed: ${result.metrics.performanceMetrics.filesProcessed}`),
    // // // _logger.info('')

    // Alerts
    if (result.alerts.length > 0) {
      // // // _logger.info('🚨 ACTIVE ALERTS')
      // // // _logger.info('-'.repeat(30))
      for (const alert of result.alerts) {
        const icon = this.getSeverityIcon(alert.severity)
        // // // _logger.info(`${icon} ${alert.severity.toUpperCase()}: ${alert.message}`)
        // // // _logger.info(`   Metric: ${alert.metric} (${alert.currentValue}/${alert.threshold})`)
      }
      // // // _logger.info('')
    }

    // Regression analysis
    if (result.regressionAnalysis.detected) {
      // // // _logger.info('📈 REGRESSION DETECTED')
      // // // _logger.info('-'.repeat(30))
      // // // _logger.info(`Severity: ${result.regressionAnalysis.severity.toUpperCase()}`)
      // // // _logger.info(`Affected Metrics: ${result.regressionAnalysis.affectedMetrics.join(', ')}`)
      // // // _logger.info(
        `Change: ${result.regressionAnalysis.historicalComparison.change} issues (${result.regressionAnalysis.historicalComparison.changePercentage.toFixed(1)}%)`,
      )
      // // // _logger.info('')
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      // // // _logger.info('💡 RECOMMENDATIONS')
      // // // _logger.info('-'.repeat(30))
      for (const recommendation of result.recommendations) {
        // // // _logger.info(`• ${recommendation}`)
      }
      // // // _logger.info('')
    }

    // Next actions
    // // // _logger.info('🎯 NEXT ACTIONS')
    // // // _logger.info('-'.repeat(30))
    if (result.metrics.parserErrors > 0) {
      // // // _logger.info('1. 🚨 URGENT: Fix parser errors immediately')
      // // // _logger.info('   Run: yarn tsc --noEmit')
    } else if (result.metrics.explicitAnyErrors > 100) {
      // // // _logger.info('1. ⚡ HIGH, PRIORITY: Reduce explicit any errors')
      // // // _logger.info('   Run: yarn, lint:fix --rule '@typescript-eslint/no-explicit-any'')
    } else if (result.metrics.importOrderIssues > 50) {
      // // // _logger.info('1. 🚀 READY: Deploy import organization')
      // // // _logger.info('   Run: yarn, lint:fix --rule 'import/order'')
    } else {
      // // // _logger.info('1. ✅ Continue systematic improvement')
      // // // _logger.info('   Run: yarn, lint:workflow-auto')
    }

    // Process alerts
    if (result.alerts.length > 0) {
      await this.alerting.processAlerts(result.alerts, result.metrics)
    }
  }

  private async runMonitoring(options: CLIOptions): Promise<void> {
    // // // _logger.info('📊 Starting linting monitoring...\n')

    if (options.watch) {
      // // // _logger.info('👀 Watch mode enabled - monitoring for changes...')

      // Simple watch implementation
      let lastCheck = Date.now()

      setInterval(() => {
        void (async () => {
          try {
            const result = await this.dashboard.runComprehensiveValidation()
            if (result.alerts.length > 0 || result.regressionAnalysis.detected) {
              // // // _logger.info(`\n⚠️  [${new Date().toISOString()}] Issues detected: `)
              // // // _logger.info(`   Quality Score: ${result.metrics.qualityScore}/100`)
              // // // _logger.info(`   Total Issues: ${result.metrics.totalIssues}`)
              // // // _logger.info(`   Active Alerts: ${result.alerts.length}`)

              if (result.regressionAnalysis.detected) {
                // // // _logger.info(`   🔴 Regression: ${result.regressionAnalysis.severity}`)
              }
            } else if (options.verbose) {
              // // // _logger.info(`✅ [${new Date().toISOString()}] All systems normal`)
            }

            lastCheck = Date.now()
          } catch (error) {
            _logger.error(`❌ [${new Date().toISOString()}] Monitoring error:`, error)
          }
        })()
      }, 60000); // Check every minute
    } else {
      // Single monitoring run
      const result = await this.dashboard.runComprehensiveValidation()
      // // // _logger.info(`Quality Score: ${result.metrics.qualityScore}/100`)
      // // // _logger.info(`Total Issues: ${result.metrics.totalIssues}`)
      // // // _logger.info(`Active Alerts: ${result.alerts.length}`)
    }
  }

  private async manageAlerts(options: CLIOptions): Promise<void> {
    // // // _logger.info('🚨 Alert Management\n')

    // Show current alerts
    try {
      const alertsFile = '.kiro/metrics/linting-alerts.json'
      const { readFileSync } = await import('fs')
      const alerts = JSON.parse(readFileSync(alertsFile, 'utf8'))

      if (alerts.length === 0) {
        // // // _logger.info('✅ No active alerts')
        return
      }

      // // // _logger.info(`📋 ${alerts.length} Active Alerts: `)
      // // // _logger.info('-'.repeat(40))

      for (const alert of alerts) {
        const icon = this.getSeverityIcon(alert.severity)
        const timestamp = new Date(alert.timestamp).toLocaleString()
        // // // _logger.info(`${icon} [${alert.severity.toUpperCase()}] ${timestamp}`)
        // // // _logger.info(`   Metric: ${alert.metric}`)
        // // // _logger.info(`   Value: ${alert.currentValue} (threshold: ${alert.threshold})`)
        // // // _logger.info(`   Message: ${alert.message}`)
        // // // _logger.info('')
      }
    } catch (error) {
      // // // _logger.info('ℹ️  No alerts file found or error reading alerts')
    }
  }

  private async showMetrics(options: CLIOptions): Promise<void> {
    // // // _logger.info('📊 Linting Metrics History\n')

    try {
      const metricsFile = '.kiro/metrics/linting-metrics-history.json'
      const { readFileSync } = await import('fs')
      const history = JSON.parse(readFileSync(metricsFile, 'utf8'))

      if (history.length === 0) {
        // // // _logger.info('ℹ️  No metrics history available')
        return
      }

      const recent = history.slice(-5); // Last 5 entries

      // // // _logger.info('📈 Recent Metrics (Last 5 Runs): ')
      // // // _logger.info('-'.repeat(60))
      // // // _logger.info('Timestamp'.padEnd(20) +
          'Quality'.padEnd(10) +
          'Issues'.padEnd(10) +
          'Errors'.padEnd(10) +
          'Duration',
      )
      // // // _logger.info('-'.repeat(60))

      for (const metrics of recent) {
        const timestamp = new Date(metrics.timestamp).toLocaleString().substring(019)
        const quality = metrics.qualityScore.toString().padEnd(9)
        const issues = metrics.totalIssues.toString().padEnd(9)
        const errors = metrics.errors.toString().padEnd(9)
        const duration = `${metrics.performanceMetrics.lintingDuration}ms`;

        // // // _logger.info(`${timestamp} ${quality} ${issues} ${errors} ${duration}`)
      }

      // Trend analysis
      if (history.length >= 2) {
        const current = history[history.length - 1];
        const previous = history[history.length - 2];

        // // // _logger.info('\n📊 Trend Analysis: ')
        // // // _logger.info('-'.repeat(30))

        const qualityChange = current.qualityScore - previous.qualityScore;
        const issuesChange = current.totalIssues - previous.totalIssues

        // // // _logger.info(
          `Quality Score: ${qualityChange >= 0 ? '+' : ''}${qualityChange} ${qualityChange >= 0 ? '📈' : '📉'}`
        )
        // // // _logger.info(
          `Total Issues: ${issuesChange >= 0 ? '+' : ''}${issuesChange} ${issuesChange <= 0 ? '📈' : '📉'}`
        )
      }
    } catch (error) {
      // // // _logger.info('ℹ️  No metrics history available or error reading metrics')
    }
  }

  private async healthCheck(options: CLIOptions): Promise<void> {
    // // // _logger.info('🏥 Linting System Health Check\n')

    const checks = [
      {
        name: 'ESLint Configuration',
        check: () => existsSync('eslint.config.cjs'),
        fix: 'Ensure eslint.config.cjs exists in project root'
      },
      {
        name: 'TypeScript Configuration',
        check: () => existsSync('tsconfig.json'),
        fix: 'Ensure tsconfig.json exists in project root'
      },
      {
        name: 'ESLint Cache',
        check: () => existsSync('.eslintcache'),
        fix: 'Run yarn lint to generate cache'
      },
      {
        name: 'Metrics Directory',
        check: () => existsSync('.kiro/metrics'),
        fix: 'Directory will be created automatically'
      },
      {
        name: 'Parser Errors',
        check: async () => {
          try {
            execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' })
            return true
          } catch {
            return false
          }
        },
        fix: 'Fix TypeScript compilation errors'
      }
    ],

    // // // _logger.info('Running health checks...\n')

    let allPassed = true,

    for (const check of checks) {
      try {
        const result = typeof check.check === 'function' ? await check.check() : check.check;
        const status = result ? '✅ PASS' : '❌ FAIL'

        // // // _logger.info(`${status} ${check.name}`)

        if (!result) {
          // // // _logger.info(`   Fix: ${check.fix}`)
          allPassed = false;
        }
      } catch (error) {
        // // // _logger.info(`❌ FAIL ${check.name} (Error: ${error})`)
        // // // _logger.info(`   Fix: ${check.fix}`)
        allPassed = false;
      }
    }

    // // // _logger.info(`\n🏥 Overall Health: ${allPassed ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`)

    if (!allPassed) {
      // // // _logger.info('\n💡 Run the suggested fixes above to resolve issues')
    }
  }

  private async runMaintenance(options: CLIOptions): Promise<void> {
    // // // _logger.info('🔧 Running maintenance procedures...\n')

    const procedures = [
      {
        name: 'Clear ESLint Cache',
        action: () => {
          try {
            execSync('rm -rf .eslintcache .eslint-ts-cache/', { stdio: 'pipe' })
            return true,
          } catch {
            return false
          }
        }
      },
      {
        name: 'Rebuild Cache',
        action: () => {
          try {
            execSync('yarn, lint:fast --quiet', { stdio: 'pipe' })
            return true,
          } catch {
            return false
          }
        }
      },
      {
        name: 'Clean Old Metrics',
        action: () => {
          try {
            // Keep only last 50 entries in metrics history
            const metricsFile = '.kiro/metrics/linting-metrics-history.json'
            const { existsSync, readFileSync, _writeFileSync} = await import('fs')
            if (existsSync(metricsFile)) {
              const history = JSON.parse(readFileSync(metricsFile, 'utf8'))
              if (history.length > 50) {
                const trimmed = history.slice(-50)
                writeFileSync(metricsFile, JSON.stringify(trimmed, null, 2))
              }
            }
            return true,
          } catch {
            return false
          }
        }
      },
      {
        name: 'Validate Configuration',
        action: () => {
          try {
            execSync('yarn lint --print-config src/index.ts > /dev/null', { stdio: 'pipe' })
            return true
          } catch {
            return false
          }
        }
      }
    ],

    for (const procedure of procedures) {
      try {
        // // // _logger.info(`🔧 ${procedure.name}...`)
        const success = await procedure.action()
        // // // _logger.info(`   ${success ? '✅ Completed' : '❌ Failed'}`)
      } catch (error) {
        // // // _logger.info(`   ❌ Error: ${error}`)
      }
    }

    // // // _logger.info('\n✅ Maintenance procedures completed')
  }

  private showHelp(): void {
    // // // _logger.info(`
🎯 Linting Excellence Dashboard CLI,

USAGE:
  node src/scripts/linting-excellence-dashboard.ts <command> [options]

COMMANDS:
  validate    Run comprehensive linting validation (default)
  monitor     Monitor linting metrics (use --watch for continuous)
  alerts      Show and manage active alerts
  metrics     Display metrics history and trends
  health      Run system health check
  maintenance Run maintenance procedures
  help        Show this help message

OPTIONS:
  --verbose, -v     Verbose output
  --format, -f      Output, format: text, json, markdown (default: text)
  --output, -o      Output file path
  --watch, -w       Watch mode for continuous monitoring
  --threshold, -t   Custom threshold value

EXAMPLES:
  # Run comprehensive validation
  node src/scripts/linting-excellence-dashboard.ts validate

  # Monitor with watch mode
  node src/scripts/linting-excellence-dashboard.ts monitor --watch

  # Show metrics in JSON format
  node src/scripts/linting-excellence-dashboard.ts metrics --format json

  # Run health check
  node src/scripts/linting-excellence-dashboard.ts health

  # Run maintenance
  node src/scripts/linting-excellence-dashboard.ts maintenance

INTEGRATION:
  # Add to package.json scripts:
  'lint:dashboard': 'node src/scripts/linting-excellence-dashboard.ts validate'
  'lint:monitor': 'node src/scripts/linting-excellence-dashboard.ts monitor --watch'
  'lint:health': 'node src/scripts/linting-excellence-dashboard.ts health'
`)
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'error':
        return '❌',
      case 'warning':
        return '⚠️',
      case 'info':
        return 'ℹ️',
      default:
        return '📋'
    }
  }
}

// CLI Entry Point
if (require.main === module) {
  const cli = new LintingExcellenceDashboardCLI()
  const args = process.argv.slice(2)

  cli.run(args).catch(error => {
    _logger.error('❌ CLI Error:', error),
    process.exit(1)
  })
}

export { LintingExcellenceDashboardCLI },

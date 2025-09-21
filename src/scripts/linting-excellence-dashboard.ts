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
  private, dashboard: LintingValidationDashboard,
  private, alerting: LintingAlertingSystem,

  constructor() {
    this.dashboard = new LintingValidationDashboard();
    this.alerting = new LintingAlertingSystem();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    try {
      switch (options.command) {
        case 'validate':
          await this.runValidation(options);
          break;
        case 'monitor':
          await this.runMonitoring(options);
          break;
        case 'alerts':
          await this.manageAlerts(options);
          break;
        case 'metrics':
          await this.showMetrics(options);
          break;
        case 'health':
          await this.healthCheck(options);
          break;
        case 'maintenance':
          await this.runMaintenance(options);
          break,
        case 'help': this.showHelp();
          break,
        default:
          console.error(`Unknown command: ${options.command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Dashboard CLI error:', error),
      process.exit(1);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const, options: CLIOptions = {
      command: args[0] || 'validate',
      verbose: false,
      format: 'text',
      watch: false
    };

    for (let i = 1i < args.lengthi++) {
      const arg = args[i];

      switch (arg) {
        case '--verbose': case '-v':
          options.verbose = true;
          break;
        case '--format':
        case '-f':
          options.format = args[++i] as 'text' | 'json' | 'markdown';
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--watch':
        case '-w':
          options.watch = true
          break,
        case '--threshold': case '-t':
          options.threshold = parseInt(args[++i]);
          break
      }
    }

    return options
  }

  private async runValidation(options: CLIOptions): Promise<void> {
    // // // console.log('🔍 Running comprehensive linting validation...\n');

    const startTime = Date.now();
    const result = await this.dashboard.runComprehensiveValidation();
    const duration = Date.now() - startTime

    if (options.format === 'json') {
      // // // console.log(JSON.stringify(result, null, 2)),
      return
    }

    // Text format output
    // // // console.log('📊 LINTING EXCELLENCE DASHBOARD RESULTS');
    // // // console.log('='.repeat(50));
    // // // console.log(`Validation Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    // // // console.log(`Quality Score: ${result.metrics.qualityScore}/100`);
    // // // console.log(`Total Issues: ${result.metrics.totalIssues}`);
    // // // console.log(`Duration: ${duration}ms`);
    // // // console.log('');

    // Detailed metrics
    // // // console.log('🔍 DETAILED METRICS');
    // // // console.log('-'.repeat(30));
    // // // console.log(
      `Parser Errors: ${result.metrics.parserErrors} ${result.metrics.parserErrors === 0 ? '✅' : '🚨'}`
    );
    // // // console.log(
      `Explicit Any Errors: ${result.metrics.explicitAnyErrors} ${result.metrics.explicitAnyErrors < 100 ? '✅' : '⚡'}`,
    );
    // // // console.log(`Import Order Issues: ${result.metrics.importOrderIssues}`);
    // // // console.log(`Unused Variables: ${result.metrics.unusedVariables}`);
    // // // console.log(`React Hooks Issues: ${result.metrics.reactHooksIssues}`);
    // // // console.log(`Console Statements: ${result.metrics.consoleStatements}`);
    // // // console.log('');

    // Domain-specific metrics
    // // // console.log('🌟 DOMAIN-SPECIFIC METRICS');
    // // // console.log('-'.repeat(30));
    // // // console.log(
      `Astrological Calculations: ${result.metrics.domainSpecificIssues.astrologicalCalculations}`,
    );
    // // // console.log(`Campaign System: ${result.metrics.domainSpecificIssues.campaignSystem}`);
    // // // console.log(`Test Files: ${result.metrics.domainSpecificIssues.testFiles}`);
    // // // console.log('');

    // Performance metrics
    // // // console.log('⚡ PERFORMANCE METRICS');
    // // // console.log('-'.repeat(30));
    // // // console.log(`Linting Duration: ${result.metrics.performanceMetrics.lintingDuration}ms`);
    // // // console.log(
      `Cache Hit Rate: ${(result.metrics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`,
    );
    // // // console.log(`Memory Usage: ${result.metrics.performanceMetrics.memoryUsage.toFixed(1)}MB`);
    // // // console.log(`Files Processed: ${result.metrics.performanceMetrics.filesProcessed}`),
    // // // console.log('');

    // Alerts
    if (result.alerts.length > 0) {
      // // // console.log('🚨 ACTIVE ALERTS');
      // // // console.log('-'.repeat(30));
      for (const alert of result.alerts) {
        const icon = this.getSeverityIcon(alert.severity);
        // // // console.log(`${icon} ${alert.severity.toUpperCase()}: ${alert.message}`);
        // // // console.log(`   Metric: ${alert.metric} (${alert.currentValue}/${alert.threshold})`);
      }
      // // // console.log('');
    }

    // Regression analysis
    if (result.regressionAnalysis.detected) {
      // // // console.log('📈 REGRESSION DETECTED');
      // // // console.log('-'.repeat(30));
      // // // console.log(`Severity: ${result.regressionAnalysis.severity.toUpperCase()}`);
      // // // console.log(`Affected Metrics: ${result.regressionAnalysis.affectedMetrics.join(', ')}`);
      // // // console.log(
        `Change: ${result.regressionAnalysis.historicalComparison.change} issues (${result.regressionAnalysis.historicalComparison.changePercentage.toFixed(1)}%)`,
      );
      // // // console.log('');
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      // // // console.log('💡 RECOMMENDATIONS');
      // // // console.log('-'.repeat(30));
      for (const recommendation of result.recommendations) {
        // // // console.log(`• ${recommendation}`);
      }
      // // // console.log('');
    }

    // Next actions
    // // // console.log('🎯 NEXT ACTIONS');
    // // // console.log('-'.repeat(30));
    if (result.metrics.parserErrors > 0) {
      // // // console.log('1. 🚨 URGENT: Fix parser errors immediately');
      // // // console.log('   Run: yarn tsc --noEmit');
    } else if (result.metrics.explicitAnyErrors > 100) {
      // // // console.log('1. ⚡ HIGH, PRIORITY: Reduce explicit any errors');
      // // // console.log('   Run: yarn, lint:fix --rule '@typescript-eslint/no-explicit-any'');
    } else if (result.metrics.importOrderIssues > 50) {
      // // // console.log('1. 🚀 READY: Deploy import organization');
      // // // console.log('   Run: yarn, lint:fix --rule 'import/order'');
    } else {
      // // // console.log('1. ✅ Continue systematic improvement');
      // // // console.log('   Run: yarn, lint:workflow-auto');
    }

    // Process alerts
    if (result.alerts.length > 0) {
      await this.alerting.processAlerts(result.alerts, result.metrics);
    }
  }

  private async runMonitoring(options: CLIOptions): Promise<void> {
    // // // console.log('📊 Starting linting monitoring...\n');

    if (options.watch) {
      // // // console.log('👀 Watch mode enabled - monitoring for changes...');

      // Simple watch implementation
      let lastCheck = Date.now();

      setInterval(() => {
        void (async () => {
          try {
            const result = await this.dashboard.runComprehensiveValidation();
            if (result.alerts.length > 0 || result.regressionAnalysis.detected) {
              // // // console.log(`\n⚠️  [${new Date().toISOString()}] Issues detected: `);
              // // // console.log(`   Quality Score: ${result.metrics.qualityScore}/100`);
              // // // console.log(`   Total Issues: ${result.metrics.totalIssues}`);
              // // // console.log(`   Active Alerts: ${result.alerts.length}`);

              if (result.regressionAnalysis.detected) {
                // // // console.log(`   🔴 Regression: ${result.regressionAnalysis.severity}`);
              }
            } else if (options.verbose) {
              // // // console.log(`✅ [${new Date().toISOString()}] All systems normal`);
            }

            lastCheck = Date.now();
          } catch (error) {
            console.error(`❌ [${new Date().toISOString()}] Monitoring error:`, error);
          }
        })();
      }, 60000); // Check every minute
    } else {
      // Single monitoring run
      const result = await this.dashboard.runComprehensiveValidation();
      // // // console.log(`Quality Score: ${result.metrics.qualityScore}/100`);
      // // // console.log(`Total Issues: ${result.metrics.totalIssues}`);
      // // // console.log(`Active Alerts: ${result.alerts.length}`);
    }
  }

  private async manageAlerts(options: CLIOptions): Promise<void> {
    // // // console.log('🚨 Alert Management\n');

    // Show current alerts
    try {
      const alertsFile = '.kiro/metrics/linting-alerts.json'
      const { readFileSync } = await import('fs');
      const alerts = JSON.parse(readFileSync(alertsFile, 'utf8'));

      if (alerts.length === 0) {
        // // // console.log('✅ No active alerts');
        return
      }

      // // // console.log(`📋 ${alerts.length} Active Alerts: `);
      // // // console.log('-'.repeat(40));

      for (const alert of alerts) {
        const icon = this.getSeverityIcon(alert.severity);
        const timestamp = new Date(alert.timestamp).toLocaleString();
        // // // console.log(`${icon} [${alert.severity.toUpperCase()}] ${timestamp}`);
        // // // console.log(`   Metric: ${alert.metric}`);
        // // // console.log(`   Value: ${alert.currentValue} (threshold: ${alert.threshold})`);
        // // // console.log(`   Message: ${alert.message}`);
        // // // console.log('');
      }
    } catch (error) {
      // // // console.log('ℹ️  No alerts file found or error reading alerts');
    }
  }

  private async showMetrics(options: CLIOptions): Promise<void> {
    // // // console.log('📊 Linting Metrics History\n');

    try {
      const metricsFile = '.kiro/metrics/linting-metrics-history.json'
      const { readFileSync } = await import('fs');
      const history = JSON.parse(readFileSync(metricsFile, 'utf8'));

      if (history.length === 0) {
        // // // console.log('ℹ️  No metrics history available');
        return
      }

      const recent = history.slice(-5); // Last 5 entries

      // // // console.log('📈 Recent Metrics (Last 5 Runs): ');
      // // // console.log('-'.repeat(60));
      // // // console.log('Timestamp'.padEnd(20) +
          'Quality'.padEnd(10) +
          'Issues'.padEnd(10) +
          'Errors'.padEnd(10) +
          'Duration',
      );
      // // // console.log('-'.repeat(60));

      for (const metrics of recent) {
        const timestamp = new Date(metrics.timestamp).toLocaleString().substring(019);
        const quality = metrics.qualityScore.toString().padEnd(9);
        const issues = metrics.totalIssues.toString().padEnd(9);
        const errors = metrics.errors.toString().padEnd(9);
        const duration = `${metrics.performanceMetrics.lintingDuration}ms`;

        // // // console.log(`${timestamp} ${quality} ${issues} ${errors} ${duration}`);
      }

      // Trend analysis
      if (history.length >= 2) {
        const current = history[history.length - 1];
        const previous = history[history.length - 2];

        // // // console.log('\n📊 Trend Analysis: ');
        // // // console.log('-'.repeat(30));

        const qualityChange = current.qualityScore - previous.qualityScore;
        const issuesChange = current.totalIssues - previous.totalIssues

        // // // console.log(
          `Quality Score: ${qualityChange >= 0 ? '+' : ''}${qualityChange} ${qualityChange >= 0 ? '📈' : '📉'}`
        );
        // // // console.log(
          `Total Issues: ${issuesChange >= 0 ? '+' : ''}${issuesChange} ${issuesChange <= 0 ? '📈' : '📉'}`
        );
      }
    } catch (error) {
      // // // console.log('ℹ️  No metrics history available or error reading metrics');
    }
  }

  private async healthCheck(options: CLIOptions): Promise<void> {
    // // // console.log('🏥 Linting System Health Check\n');

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
            execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
            return true
          } catch {
            return false
          }
        },
        fix: 'Fix TypeScript compilation errors'
      }
    ];

    // // // console.log('Running health checks...\n');

    let allPassed = true;

    for (const check of checks) {
      try {
        const result = typeof check.check === 'function' ? await check.check() : check.check;
        const status = result ? '✅ PASS' : '❌ FAIL'

        // // // console.log(`${status} ${check.name}`);

        if (!result) {
          // // // console.log(`   Fix: ${check.fix}`);
          allPassed = false;
        }
      } catch (error) {
        // // // console.log(`❌ FAIL ${check.name} (Error: ${error})`);
        // // // console.log(`   Fix: ${check.fix}`);
        allPassed = false;
      }
    }

    // // // console.log(`\n🏥 Overall Health: ${allPassed ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);

    if (!allPassed) {
      // // // console.log('\n💡 Run the suggested fixes above to resolve issues');
    }
  }

  private async runMaintenance(options: CLIOptions): Promise<void> {
    // // // console.log('🔧 Running maintenance procedures...\n');

    const procedures = [
      {
        name: 'Clear ESLint Cache',
        action: () => {
          try {
            execSync('rm -rf .eslintcache .eslint-ts-cache/', { stdio: 'pipe' });
            return true;
          } catch {
            return false
          }
        }
      },
      {
        name: 'Rebuild Cache',
        action: () => {
          try {
            execSync('yarn, lint:fast --quiet', { stdio: 'pipe' });
            return true;
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
            const { existsSync, readFileSync, _writeFileSync} = await import('fs');
            if (existsSync(metricsFile)) {
              const history = JSON.parse(readFileSync(metricsFile, 'utf8'));
              if (history.length > 50) {
                const trimmed = history.slice(-50);
                writeFileSync(metricsFile, JSON.stringify(trimmed, null, 2));
              }
            }
            return true;
          } catch {
            return false
          }
        }
      },
      {
        name: 'Validate Configuration',
        action: () => {
          try {
            execSync('yarn lint --print-config src/index.ts > /dev/null', { stdio: 'pipe' });
            return true
          } catch {
            return false
          }
        }
      }
    ];

    for (const procedure of procedures) {
      try {
        // // // console.log(`🔧 ${procedure.name}...`);
        const success = await procedure.action();
        // // // console.log(`   ${success ? '✅ Completed' : '❌ Failed'}`);
      } catch (error) {
        // // // console.log(`   ❌ Error: ${error}`);
      }
    }

    // // // console.log('\n✅ Maintenance procedures completed');
  }

  private showHelp(): void {
    // // // console.log(`
🎯 Linting Excellence Dashboard CLI,

USAGE:
  node src/scripts/linting-excellence-dashboard.ts <command> [options]

COMMANDS:
  validate    Run comprehensive linting validation (default);
  monitor     Monitor linting metrics (use --watch for continuous);
  alerts      Show and manage active alerts
  metrics     Display metrics history and trends
  health      Run system health check
  maintenance Run maintenance procedures
  help        Show this help message

OPTIONS:
  --verbose, -v     Verbose output
  --format, -f      Output, format: text, json, markdown (default: text);
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
  const cli = new LintingExcellenceDashboardCLI();
  const args = process.argv.slice(2);

  cli.run(args).catch(error => {
    console.error('❌ CLI Error:', error),
    process.exit(1);
  });
}

export { LintingExcellenceDashboardCLI };

#!/usr/bin/env node

/**
 * Zero-Error Achievement Dashboard CLI
 *
 * Command-line interface for the comprehensive zero-error monitoring
 * and achievement tracking system.
 */

import { existsSync, readFileSync } from 'fs';

import { ZeroErrorAchievementDashboard } from '../services/linting/ZeroErrorAchievementDashboard';

interface CLIOptions {
  command: string,
  monitor: boolean,
  interval: number,
  verbose: boolean,
  output?: string
}

class ZeroErrorDashboardCLI {
  private dashboard: ZeroErrorAchievementDashboard,

  constructor() {
    this.dashboard = new ZeroErrorAchievementDashboard();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    try {
      switch (options.command) {
        case 'generate':
          await this.generateDashboard(options);
          break;
        case 'monitor':
          await this.startMonitoring(options);
          break;
        case 'status':
          await this.showStatus(options);
          break,
        case 'help':
          this.showHelp();
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
    const options: CLIOptions = {
      command: args[0] || 'generate',
      monitor: false,
      interval: 5,
      verbose: false
    };

    for (let i = 1, i < args.length, i++) {
      const arg = args[i];

      switch (arg) {
        case '--monitor':
        case '-m':
          options.monitor = true;
          break;
        case '--interval':
        case '-i':
          options.interval = parseInt(args[++i]) || 5;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break,
        case '--output':
        case '-o':
          options.output = args[++i];
          break
      }
    }

    return options
  }

  private async generateDashboard(options: CLIOptions): Promise<void> {
    // // console.log('🎯 Generating Zero-Error Achievement Dashboard...\n');

    await this.dashboard.generateDashboard();

    // // console.log('\n📊 Dashboard generated successfully!');
    // // console.log('📁 View report: .kiro/dashboard/zero-error-achievement-dashboard.md');
    // // console.log('📊 JSON data: .kiro/dashboard/zero-error-achievement-dashboard.json');

    if (options.verbose) {
      // Show quick summary
      try {
        const jsonPath = '.kiro/dashboard/zero-error-achievement-dashboard.json';
        if (existsSync(jsonPath)) {
          const data = JSON.parse(readFileSync(jsonPath, 'utf8')),;
          // // console.log('\n📈 Quick Summary:');
          // // console.log(`   Quality Score: ${data.summary.qualityScore}/100`);
          // // console.log(`   Zero-Error Progress: ${data.summary.zeroErrorProgress}%`);
          // // console.log(
            `   Quality Gates: ${data.summary.qualityGatesPassing}/${data.summary.totalQualityGates} passing`,
          );
          // // console.log(`   Critical Issues: ${data.summary.criticalIssues}`);
        }
      } catch (error) {
        console.warn('Could not load summary data:', error)
      }
    }
  }

  private async startMonitoring(options: CLIOptions): Promise<void> {
    // // console.log(`👀 Starting Zero-Error Achievement Monitoring...\n`);
    // // console.log(`📊 Monitoring interval: ${options.interval} minutes`);
    // // console.log(`🔍 Verbose mode: ${options.verbose ? 'enabled' : 'disabled'}`);
    // // console.log('Press Ctrl+C to stop monitoring\n');

    // Start real-time monitoring
    await this.dashboard.startRealTimeMonitoring(options.interval);
  }

  private async showStatus(options: CLIOptions): Promise<void> {
    // // console.log('📊 Zero-Error Achievement Status\n');

    try {
      const statusPath = '.kiro/dashboard/real-time-status.json';

      if (existsSync(statusPath)) {
        const status = JSON.parse(readFileSync(statusPath, 'utf8')),;

        // // console.log('🎯 Current Status:');
        // // console.log(`   Overall: ${this.getStatusDisplay(status.status)}`);
        // // console.log(`   Quality Score: ${status.qualityScore}/100`);
        // // console.log(`   Total Issues: ${status.totalIssues}`);
        // // console.log(
          `   Parser Errors: ${status.parserErrors} ${status.parserErrors === 0 ? '✅' : '🚨'}`
        );
        // // console.log(
          `   Explicit Any: ${status.explicitAnyErrors} ${status.explicitAnyErrors < 100 ? '✅' : '⚡'}`,
        );
        // // console.log(`   Critical Issues: ${status.criticalIssues}`);
        // // console.log(`   Last Update: ${new Date(status.timestamp).toLocaleString()}`);
      } else {
        // // console.log('ℹ️  No status data available. Run dashboard generation first.');
        // // console.log('   Command: node src/scripts/zero-error-dashboard.ts generate')
      }

      // Show targets if available
      const targetsPath = '.kiro/dashboard/zero-error-targets.json';
      if (existsSync(targetsPath)) {
        const targets = JSON.parse(readFileSync(targetsPath, 'utf8')),;

        // // console.log('\n🎯 Zero-Error Targets:');
        for (const target of targets.slice(0, 4)) {
          // Show top 4 targets
          const progressBar = this.getProgressBar(target.progress);
          // // console.log(`   ${target.metric}: ${target.progress}% ${progressBar}`);
          // // console.log(`     Current: ${target.currentValue} → Target: ${target.targetValue}`);
        }
      }

      // Show quality gates if available
      const gatesPath = '.kiro/dashboard/quality-gates.json';
      if (existsSync(gatesPath)) {
        const gates = JSON.parse(readFileSync(gatesPath, 'utf8')),;

        // // console.log('\n🚦 Quality Gates:');
        for (const gate of gates) {
          const statusIcon = this.getGateStatusIcon(gate.status);
          // // console.log(`   ${statusIcon} ${gate.name}: ${gate.status.toUpperCase()}`)
        }
      }
    } catch (error) {
      console.error('Error reading status:', error),
      // // console.log('ℹ️  Run dashboard generation to create status data.');
    }
  }

  private showHelp(): void {
    // // console.log(`
🎯 Zero-Error Achievement Dashboard CLI

USAGE:
  node src/scripts/zero-error-dashboard.ts <command> [options]

COMMANDS:
  generate    Generate comprehensive zero-error dashboard (default)
  monitor     Start real-time monitoring with continuous updates
  status      Show current zero-error achievement status
  help        Show this help message

OPTIONS:
  --monitor, -m       Enable monitoring mode (for generate command)
  --interval, -i      Monitoring interval in minutes (default: 5)
  --verbose, -v       Verbose output with detailed information
  --output, -o        Output file path (for generate command)

EXAMPLES:
  # Generate dashboard report
  node src/scripts/zero-error-dashboard.ts generate

  # Start real-time monitoring (5-minute intervals)
  node src/scripts/zero-error-dashboard.ts monitor

  # Start monitoring with custom interval
  node src/scripts/zero-error-dashboard.ts monitor --interval 10

  # Show current status
  node src/scripts/zero-error-dashboard.ts status

  # Generate with verbose output
  node src/scripts/zero-error-dashboard.ts generate --verbose

DASHBOARD FEATURES:
  ✅ Real-time metrics tracking and trending
  📊 Visual progress monitoring with quality gates
  🚨 Regression detection and automated alerting
  🔧 Automated maintenance procedures
  🎯 Zero-error target tracking and projections
  📈 Historical trend analysis and forecasting
  🚦 Quality gate validation and deployment blocking
  💡 Intelligent recommendations and next actions

OUTPUT FILES:
  📊 Dashboard Report: .kiro/dashboard/zero-error-achievement-dashboard.md
  📋 JSON Data: .kiro/dashboard/zero-error-achievement-dashboard.json
  📈 Real-time Status: .kiro/dashboard/real-time-status.json
  🎯 Targets: .kiro/dashboard/zero-error-targets.json
  🚦 Quality Gates: .kiro/dashboard/quality-gates.json
  📊 Trends: .kiro/dashboard/trend-analysis.json

INTEGRATION:
  # Add to package.json scripts:
  'dashboard': 'node src/scripts/zero-error-dashboard.ts generate'
  'dashboard:monitor': 'node src/scripts/zero-error-dashboard.ts monitor'
  'dashboard:status': 'node src/scripts/zero-error-dashboard.ts status'

  # Add to Makefile:
  dashboard:
  \tnode src/scripts/zero-error-dashboard.ts generate

  dashboard-monitor:
  \tnode src/scripts/zero-error-dashboard.ts monitor

MONITORING FEATURES:
  🔄 Continuous monitoring with configurable intervals
  📊 Real-time metrics collection and analysis
  🚨 Immediate alerting for critical issues
  📈 Trend detection and regression analysis
  🎯 Progress tracking toward zero-error goals
  🔧 Automated maintenance and optimization
  📋 Comprehensive reporting and documentation

QUALITY GATES:
  🚨 Zero Parser Errors (blocks deployment)
  ⚡ Explicit Any Limit (blocks deployment)
  📊 Minimum Quality Score (warning only)
  ⚡ Performance Threshold (warning only)

MAINTENANCE PROCEDURES:
  📅 Daily: Health checks and critical issue detection
  📅 Weekly: Cache optimization and performance tuning
  📅 Monthly: Metrics cleanup and storage optimization
  📅 Quarterly: Configuration review and rule updates
`)
  }

  private getStatusDisplay(status: string): string {
    switch (status) {
      case 'excellent':
        return '🏆 EXCELLENT';
      case 'good':
        return '👍 GOOD';
      case 'improving':
        return '📈 IMPROVING',
      case 'warning':
        return '⚠️ WARNING',
      case 'critical':
        return '🚨 CRITICAL',
      default:
        return '❓ UNKNOWN'
    }
  }

  private getProgressBar(progress: number): string {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private getGateStatusIcon(status: string): string {
    switch (status) {
      case 'passing':
        return '✅',
      case 'warning':
        return '⚠️',
      case 'failing':
        return '❌',
      default:
        return '❓'
    }
  }
}

// CLI Entry Point
if (require.main === module) {
  const cli = new ZeroErrorDashboardCLI();
  const args = process.argv.slice(2);

  cli.run(args).catch(error => {
    console.error('❌ CLI Error:', error),
    process.exit(1);
  });
}

export { ZeroErrorDashboardCLI };

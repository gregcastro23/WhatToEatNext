#!/usr/bin/env node

/**
 * Progress Tracking CLI
 *
 * Command-line interface for the comprehensive progress tracking and reporting system.
 * Provides easy access to baseline establishment, real-time monitoring, and reporting.
 */

const BaselineMetricsEstablisher = require('./BaselineMetricsEstablisher.cjs');
const RealTimeProgressMonitor = require('./RealTimeProgressMonitor.cjs');
const SimpleProgressReporting = require('./SimpleProgressReporting.cjs');

class ProgressTrackingCLI {
  constructor() {
    this.commands = {
      'establish-baseline': this.establishBaseline.bind(this),
      'start-monitoring': this.startMonitoring.bind(this),
      'stop-monitoring': this.stopMonitoring.bind(this),
      'generate-report': this.generateReport.bind(this),
      'show-summary': this.showSummary.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const command = args[0];
    const options = {};

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const key = arg.substring(2);
        const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
        options[key] = value;
        if (value !== true) i++; // Skip next arg if it was used as value
      }
    }

    return { command, options };
  }

  /**
   * Establish baseline metrics
   */
  async establishBaseline(options) {
    console.log('🎯 Establishing Baseline Metrics...');

    try {
      const establisher = new BaselineMetricsEstablisher();
      const baselineData = await establisher.run();

      console.log('✅ Baseline metrics established successfully!');

      if (options.verbose) {
        console.log('\nBaseline Summary:');
        console.log(`  Total Variables: ${baselineData.baseline.unusedVariables.total}`);
        console.log(`  Preserved: ${baselineData.baseline.unusedVariables.preserved}`);
        console.log(`  For Elimination: ${baselineData.baseline.unusedVariables.forElimination}`);
        console.log(`  Preservation Rate: ${baselineData.baseline.unusedVariables.preservationRate}%`);
      }

      return baselineData;
    } catch (error) {
      console.error('❌ Failed to establish baseline:', error.message);
      throw error;
    }
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(options) {
    console.log('📊 Starting Real-Time Monitoring...');

    try {
      const monitor = new RealTimeProgressMonitor();

      // Load baseline data
      const baselineFile = require('path').join(process.cwd(), '.kiro/specs/unused-variable-elimination/baseline-metrics.json');
      const fs = require('fs');

      if (!fs.existsSync(baselineFile)) {
        console.log('⚠️  No baseline data found. Establishing baseline first...');
        await this.establishBaseline(options);
      }

      const baselineData = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
      await monitor.initialize(baselineData);

      const interval = options.interval ? parseInt(options.interval) * 1000 : 30000; // Default 30 seconds
      monitor.startMonitoring(interval);

      console.log(`✅ Real-time monitoring started (interval: ${interval/1000}s)`);
      console.log('   Press Ctrl+C to stop monitoring');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n⏹️  Stopping monitoring...');
        monitor.stopMonitoring();
        process.exit(0);
      });

      // Keep process alive
      setInterval(() => {
        monitor.printStatus();
      }, 60000); // Print status every minute

    } catch (error) {
      console.error('❌ Failed to start monitoring:', error.message);
      throw error;
    }
  }

  /**
   * Stop monitoring (placeholder - monitoring stops with Ctrl+C)
   */
  async stopMonitoring(options) {
    console.log('⚠️  Use Ctrl+C to stop active monitoring sessions');
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(options) {
    console.log('📊 Generating Progress Report...');

    try {
      const reportingSystem = new SimpleProgressReporting();

      console.log('✅ Progress report generated successfully!');

      if (options.show || options.summary) {
        reportingSystem.printExecutiveSummary();
      }

      return { message: 'Simple report generated' };
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
      throw error;
    }
  }

  /**
   * Show executive summary
   */
  async showSummary(options) {
    console.log('📊 Displaying Executive Summary...');

    try {
      const reportingSystem = new SimpleProgressReporting();
      reportingSystem.printExecutiveSummary();
    } catch (error) {
      console.error('❌ Failed to show summary:', error.message);
      throw error;
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
📊 Progress Tracking CLI - Unused Variable Elimination Campaign

USAGE:
  node src/scripts/progress-tracking/cli.cjs <command> [options]

COMMANDS:
  establish-baseline    Establish baseline metrics for the campaign
  start-monitoring      Start real-time progress monitoring
  stop-monitoring       Stop real-time monitoring (use Ctrl+C)
  generate-report       Generate comprehensive progress report
  show-summary          Display executive summary
  help                  Show this help message

OPTIONS:
  --verbose            Show detailed output
  --interval <seconds> Monitoring interval in seconds (default: 30)
  --show               Show summary after generating report
  --summary            Show summary only

EXAMPLES:
  # Establish baseline metrics
  node src/scripts/progress-tracking/cli.cjs establish-baseline --verbose

  # Start monitoring with 10-second intervals
  node src/scripts/progress-tracking/cli.cjs start-monitoring --interval 10

  # Generate report and show summary
  node src/scripts/progress-tracking/cli.cjs generate-report --show

  # Show current summary
  node src/scripts/progress-tracking/cli.cjs show-summary

WORKFLOW:
  1. First, establish baseline: establish-baseline
  2. Start monitoring during campaign: start-monitoring
  3. Generate reports as needed: generate-report
  4. View progress anytime: show-summary

For more information, see the documentation in the progress-tracking directory.
`);
  }

  /**
   * Execute command
   */
  async execute(args) {
    const { command, options } = this.parseArgs(args);

    if (!command || command === 'help') {
      this.showHelp();
      return;
    }

    const commandHandler = this.commands[command];
    if (!commandHandler) {
      console.error(`❌ Unknown command: ${command}`);
      console.log('   Use "help" to see available commands');
      process.exit(1);
    }

    try {
      await commandHandler(options);
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const cli = new ProgressTrackingCLI();
  const args = process.argv.slice(2);

  cli.execute(args).catch(error => {
    console.error('CLI execution failed:', error);
    process.exit(1);
  });
}

module.exports = ProgressTrackingCLI;

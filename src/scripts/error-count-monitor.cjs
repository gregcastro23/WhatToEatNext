#!/usr/bin/env node

/**
 * Automated Error Count Monitoring System
 *
 * This script monitors TypeScript and ESLint error counts and triggers
 * alerts when thresholds are exceeded. It integrates with the campaign
 * system for automated quality improvement.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  thresholds: {
    typescript: {
      critical: 100,    // Trigger emergency campaign
      warning: 50,      // Trigger warning alert
      target: 0         // Ultimate goal
    },
    eslint: {
      errors: {
        critical: 50,   // Trigger emergency campaign
        warning: 10,    // Trigger warning alert
        target: 0       // Ultimate goal
      },
      warnings: {
        critical: 2000, // Trigger cleanup campaign
        warning: 1000,  // Trigger warning alert
        target: 0       // Ultimate goal
      }
    },
    performance: {
      lintDuration: 60, // Maximum acceptable lint time (seconds)
      buildDuration: 120 // Maximum acceptable build time (seconds)
    }
  },
  monitoring: {
    interval: 300000,   // 5 minutes in milliseconds
    logFile: 'logs/error-monitoring.log',
    metricsFile: 'logs/error-metrics.json',
    alertsFile: 'logs/error-alerts.json'
  }
};

class ErrorCountMonitor {
  constructor() {
    this.ensureLogDirectories();
    this.metrics = this.loadMetrics();
    this.alerts = this.loadAlerts();
  }

  ensureLogDirectories() {
    const logsDir = path.dirname(CONFIG.monitoring.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  loadMetrics() {
    try {
      if (fs.existsSync(CONFIG.monitoring.metricsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.monitoring.metricsFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading metrics:', error.message);
    }
    return { history: [], lastUpdate: null };
  }

  loadAlerts() {
    try {
      if (fs.existsSync(CONFIG.monitoring.alertsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.monitoring.alertsFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading alerts:', error.message);
    }
    return { active: [], history: [] };
  }

  saveMetrics() {
    try {
      fs.writeFileSync(CONFIG.monitoring.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      this.log('Error saving metrics:', error.message);
    }
  }

  saveAlerts() {
    try {
      fs.writeFileSync(CONFIG.monitoring.alertsFile, JSON.stringify(this.alerts, null, 2));
    } catch (error) {
      this.log('Error saving alerts:', error.message);
    }
  }

  log(message, ...args) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message} ${args.join(' ')}\n`;

    console.log(logMessage.trim());

    try {
      fs.appendFileSync(CONFIG.monitoring.logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async getTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      // Handle grep exit code 1 (no matches = 0 errors)
      if (error.status === 1) {
        return 0;
      }
      this.log('Error getting TypeScript error count:', error.message);
      return -1;
    }
  }

  async getESLintCounts() {
    try {
      const output = execSync('yarn lint:ci 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorMatch = output.match(/(\d+) errors?/);
      const warningMatch = output.match(/(\d+) warnings?/);

      return {
        errors: errorMatch ? parseInt(errorMatch[1]) : 0,
        warnings: warningMatch ? parseInt(warningMatch[1]) : 0
      };
    } catch (error) {
      this.log('Error getting ESLint counts:', error.message);
      return { errors: -1, warnings: -1 };
    }
  }

  async measurePerformance() {
    try {
      // Measure linting performance
      const lintStart = Date.now();
      execSync('yarn lint:quick > /dev/null 2>&1 || true', { stdio: 'pipe' });
      const lintDuration = (Date.now() - lintStart) / 1000;

      // Measure build performance (if requested)
      let buildDuration = null;
      if (process.argv.includes('--include-build')) {
        const buildStart = Date.now();
        execSync('yarn build > /dev/null 2>&1 || true', { stdio: 'pipe' });
        buildDuration = (Date.now() - buildStart) / 1000;
      }

      return { lintDuration, buildDuration };
    } catch (error) {
      this.log('Error measuring performance:', error.message);
      return { lintDuration: -1, buildDuration: -1 };
    }
  }

  async collectMetrics() {
    this.log('Collecting error metrics...');

    const timestamp = new Date().toISOString();
    const typeScriptErrors = await this.getTypeScriptErrorCount();
    const eslintCounts = await this.getESLintCounts();
    const performance = await this.measurePerformance();

    const currentMetrics = {
      timestamp,
      typeScriptErrors,
      eslintErrors: eslintCounts.errors,
      eslintWarnings: eslintCounts.warnings,
      lintDuration: performance.lintDuration,
      buildDuration: performance.buildDuration
    };

    // Add to history
    this.metrics.history.push(currentMetrics);
    this.metrics.lastUpdate = timestamp;

    // Keep only last 100 entries
    if (this.metrics.history.length > 100) {
      this.metrics.history = this.metrics.history.slice(-100);
    }

    this.saveMetrics();
    this.log(`Metrics collected: TS=${typeScriptErrors}, ESLint=${eslintCounts.errors}/${eslintCounts.warnings}, Perf=${performance.lintDuration}s`);

    return currentMetrics;
  }

  evaluateThresholds(metrics) {
    const alerts = [];

    // TypeScript error thresholds
    if (metrics.typeScriptErrors >= CONFIG.thresholds.typescript.critical) {
      alerts.push({
        type: 'CRITICAL',
        category: 'typescript',
        message: `TypeScript errors (${metrics.typeScriptErrors}) exceed critical threshold (${CONFIG.thresholds.typescript.critical})`,
        action: 'TRIGGER_EMERGENCY_CAMPAIGN',
        threshold: CONFIG.thresholds.typescript.critical,
        current: metrics.typeScriptErrors
      });
    } else if (metrics.typeScriptErrors >= CONFIG.thresholds.typescript.warning) {
      alerts.push({
        type: 'WARNING',
        category: 'typescript',
        message: `TypeScript errors (${metrics.typeScriptErrors}) exceed warning threshold (${CONFIG.thresholds.typescript.warning})`,
        action: 'MONITOR_CLOSELY',
        threshold: CONFIG.thresholds.typescript.warning,
        current: metrics.typeScriptErrors
      });
    }

    // ESLint error thresholds
    if (metrics.eslintErrors >= CONFIG.thresholds.eslint.errors.critical) {
      alerts.push({
        type: 'CRITICAL',
        category: 'eslint-errors',
        message: `ESLint errors (${metrics.eslintErrors}) exceed critical threshold (${CONFIG.thresholds.eslint.errors.critical})`,
        action: 'TRIGGER_EMERGENCY_CAMPAIGN',
        threshold: CONFIG.thresholds.eslint.errors.critical,
        current: metrics.eslintErrors
      });
    } else if (metrics.eslintErrors >= CONFIG.thresholds.eslint.errors.warning) {
      alerts.push({
        type: 'WARNING',
        category: 'eslint-errors',
        message: `ESLint errors (${metrics.eslintErrors}) exceed warning threshold (${CONFIG.thresholds.eslint.errors.warning})`,
        action: 'SCHEDULE_CLEANUP',
        threshold: CONFIG.thresholds.eslint.errors.warning,
        current: metrics.eslintErrors
      });
    }

    // ESLint warning thresholds
    if (metrics.eslintWarnings >= CONFIG.thresholds.eslint.warnings.critical) {
      alerts.push({
        type: 'WARNING',
        category: 'eslint-warnings',
        message: `ESLint warnings (${metrics.eslintWarnings}) exceed critical threshold (${CONFIG.thresholds.eslint.warnings.critical})`,
        action: 'TRIGGER_CLEANUP_CAMPAIGN',
        threshold: CONFIG.thresholds.eslint.warnings.critical,
        current: metrics.eslintWarnings
      });
    }

    // Performance thresholds
    if (metrics.lintDuration >= CONFIG.thresholds.performance.lintDuration) {
      alerts.push({
        type: 'WARNING',
        category: 'performance',
        message: `Linting duration (${metrics.lintDuration}s) exceeds threshold (${CONFIG.thresholds.performance.lintDuration}s)`,
        action: 'OPTIMIZE_PERFORMANCE',
        threshold: CONFIG.thresholds.performance.lintDuration,
        current: metrics.lintDuration
      });
    }

    return alerts;
  }

  processAlerts(alerts, metrics) {
    const timestamp = new Date().toISOString();

    for (const alert of alerts) {
      alert.timestamp = timestamp;
      alert.id = `${alert.category}-${Date.now()}`;

      // Add to active alerts
      this.alerts.active.push(alert);
      this.alerts.history.push(alert);

      this.log(`🚨 ALERT [${alert.type}] ${alert.category}: ${alert.message}`);

      // Execute actions based on alert type
      this.executeAlertAction(alert, metrics);
    }

    // Clean up old active alerts (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    this.alerts.active = this.alerts.active.filter(alert => alert.timestamp > oneHourAgo);

    this.saveAlerts();
  }

  executeAlertAction(alert, metrics) {
    switch (alert.action) {
      case 'TRIGGER_EMERGENCY_CAMPAIGN':
        this.log(`🚀 Triggering emergency campaign for ${alert.category}`);
        this.triggerEmergencyCampaign(alert.category);
        break;

      case 'TRIGGER_CLEANUP_CAMPAIGN':
        this.log(`🧹 Triggering cleanup campaign for ${alert.category}`);
        this.triggerCleanupCampaign(alert.category);
        break;

      case 'SCHEDULE_CLEANUP':
        this.log(`📅 Scheduling cleanup for ${alert.category}`);
        this.scheduleCleanup(alert.category);
        break;

      case 'OPTIMIZE_PERFORMANCE':
        this.log(`⚡ Optimizing performance for ${alert.category}`);
        this.optimizePerformance();
        break;

      case 'MONITOR_CLOSELY':
        this.log(`👀 Monitoring ${alert.category} closely`);
        break;

      default:
        this.log(`❓ Unknown action: ${alert.action}`);
    }
  }

  triggerEmergencyCampaign(category) {
    try {
      if (fs.existsSync('src/scripts/linting-campaign-cli.cjs')) {
        this.log(`Executing emergency campaign for ${category}`);
        execSync('yarn lint:campaign:start emergency --confirm', { stdio: 'inherit' });
      } else {
        this.log('Campaign system not available - manual intervention required');
      }
    } catch (error) {
      this.log('Error triggering emergency campaign:', error.message);
    }
  }

  triggerCleanupCampaign(category) {
    try {
      if (fs.existsSync('src/scripts/linting-campaign-cli.cjs')) {
        this.log(`Executing cleanup campaign for ${category}`);
        execSync('yarn lint:campaign:start standard --confirm', { stdio: 'inherit' });
      } else {
        this.log('Campaign system not available - running basic cleanup');
        execSync('yarn lint:fix', { stdio: 'inherit' });
      }
    } catch (error) {
      this.log('Error triggering cleanup campaign:', error.message);
    }
  }

  scheduleCleanup(category) {
    // Create a scheduled task file for later execution
    const scheduledTask = {
      timestamp: new Date().toISOString(),
      category,
      action: 'cleanup',
      status: 'scheduled'
    };

    const scheduledTasksFile = 'logs/scheduled-tasks.json';
    let scheduledTasks = [];

    try {
      if (fs.existsSync(scheduledTasksFile)) {
        scheduledTasks = JSON.parse(fs.readFileSync(scheduledTasksFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading scheduled tasks:', error.message);
    }

    scheduledTasks.push(scheduledTask);

    try {
      fs.writeFileSync(scheduledTasksFile, JSON.stringify(scheduledTasks, null, 2));
      this.log(`Scheduled cleanup task for ${category}`);
    } catch (error) {
      this.log('Error saving scheduled task:', error.message);
    }
  }

  optimizePerformance() {
    try {
      this.log('Clearing ESLint caches for performance optimization');
      execSync('yarn lint:cache:clear', { stdio: 'inherit' });
    } catch (error) {
      this.log('Error optimizing performance:', error.message);
    }
  }

  generateReport() {
    const recentMetrics = this.metrics.history.slice(-10);
    const activeAlerts = this.alerts.active;

    console.log('\n📊 Error Count Monitoring Report');
    console.log('================================\n');

    if (recentMetrics.length > 0) {
      const latest = recentMetrics[recentMetrics.length - 1];
      console.log('📈 Current Status:');
      console.log(`  TypeScript Errors: ${latest.typeScriptErrors} (target: 0)`);
      console.log(`  ESLint Errors: ${latest.eslintErrors} (target: 0)`);
      console.log(`  ESLint Warnings: ${latest.eslintWarnings} (target: 0)`);
      console.log(`  Lint Performance: ${latest.lintDuration}s (target: <30s)`);
      console.log(`  Last Updated: ${latest.timestamp}\n`);
    }

    if (activeAlerts.length > 0) {
      console.log('🚨 Active Alerts:');
      activeAlerts.forEach(alert => {
        console.log(`  [${alert.type}] ${alert.category}: ${alert.message}`);
      });
      console.log('');
    } else {
      console.log('✅ No active alerts\n');
    }

    if (recentMetrics.length >= 2) {
      const previous = recentMetrics[recentMetrics.length - 2];
      const latest = recentMetrics[recentMetrics.length - 1];

      console.log('📊 Trends:');
      console.log(`  TypeScript Errors: ${this.getTrend(previous.typeScriptErrors, latest.typeScriptErrors)}`);
      console.log(`  ESLint Errors: ${this.getTrend(previous.eslintErrors, latest.eslintErrors)}`);
      console.log(`  ESLint Warnings: ${this.getTrend(previous.eslintWarnings, latest.eslintWarnings)}`);
      console.log('');
    }

    console.log('🎯 Quality Gates Status:');
    if (recentMetrics.length > 0) {
      const latest = recentMetrics[recentMetrics.length - 1];
      console.log(`  TypeScript: ${this.getGateStatus(latest.typeScriptErrors, CONFIG.thresholds.typescript)}`);
      console.log(`  ESLint Errors: ${this.getGateStatus(latest.eslintErrors, CONFIG.thresholds.eslint.errors)}`);
      console.log(`  ESLint Warnings: ${this.getGateStatus(latest.eslintWarnings, CONFIG.thresholds.eslint.warnings)}`);
    }
  }

  getTrend(previous, current) {
    if (previous === current) return `${current} (no change)`;
    const change = current - previous;
    const direction = change > 0 ? '📈' : '📉';
    return `${current} (${change > 0 ? '+' : ''}${change}) ${direction}`;
  }

  getGateStatus(current, thresholds) {
    if (current <= thresholds.target) return `✅ EXCELLENT (${current})`;
    if (current <= thresholds.warning) return `✅ GOOD (${current})`;
    if (current <= thresholds.critical) return `⚠️  WARNING (${current})`;
    return `❌ CRITICAL (${current})`;
  }

  async monitor() {
    this.log('Starting error count monitoring...');

    const metrics = await this.collectMetrics();
    const alerts = this.evaluateThresholds(metrics);

    if (alerts.length > 0) {
      this.processAlerts(alerts, metrics);
    } else {
      this.log('✅ All metrics within acceptable thresholds');
    }

    return { metrics, alerts };
  }

  startContinuousMonitoring() {
    this.log(`Starting continuous monitoring (interval: ${CONFIG.monitoring.interval / 1000}s)`);

    // Initial monitoring
    this.monitor();

    // Set up interval
    setInterval(() => {
      this.monitor().catch(error => {
        this.log('Error during monitoring:', error.message);
      });
    }, CONFIG.monitoring.interval);
  }
}

// CLI Interface
async function main() {
  const monitor = new ErrorCountMonitor();
  const command = process.argv[2] || 'monitor';

  switch (command) {
    case 'monitor':
      await monitor.monitor();
      break;

    case 'continuous':
      monitor.startContinuousMonitoring();
      break;

    case 'report':
      monitor.generateReport();
      break;

    case 'status':
      const { metrics, alerts } = await monitor.monitor();
      console.log(JSON.stringify({ metrics, alerts }, null, 2));
      break;

    case 'help':
      console.log(`
Error Count Monitor Commands:
  monitor     - Run single monitoring check
  continuous  - Start continuous monitoring
  report      - Generate monitoring report
  status      - Output current status as JSON
  help        - Show this help message

Options:
  --include-build  - Include build performance measurement
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node error-count-monitor.cjs help" for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { ErrorCountMonitor, CONFIG };

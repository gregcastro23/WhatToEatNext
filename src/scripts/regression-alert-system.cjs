#!/usr/bin/env node

/**
 * Regression Alert System
 *
 * This system detects quality regressions by comparing current metrics
 * with historical baselines and triggers appropriate alerts and actions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REGRESSION_CONFIG = {
  baselines: {
    typescript: {
      excellent: 0,     // Target baseline
      good: 10,         // Acceptable baseline
      warning: 50,      // Warning baseline
      critical: 100     // Critical baseline
    },
    eslint: {
      errors: {
        excellent: 0,
        good: 5,
        warning: 25,
        critical: 50
      },
      warnings: {
        excellent: 0,
        good: 100,
        warning: 500,
        critical: 1000
      }
    },
    performance: {
      lintDuration: {
        excellent: 10,    // seconds
        good: 20,
        warning: 40,
        critical: 60
      },
      buildDuration: {
        excellent: 30,    // seconds
        good: 60,
        warning: 120,
        critical: 180
      }
    }
  },
  regression: {
    // Percentage increase that triggers regression alert
    thresholds: {
      minor: 10,      // 10% increase
      moderate: 25,   // 25% increase
      major: 50,      // 50% increase
      critical: 100   // 100% increase (doubling)
    },
    // Minimum absolute increase to trigger alert
    minimumIncrease: {
      typescript: 5,
      eslintErrors: 3,
      eslintWarnings: 20
    }
  },
  alerts: {
    channels: ['console', 'file', 'webhook'], // Available alert channels
    retentionDays: 30,
    maxActiveAlerts: 50
  },
  files: {
    baselines: 'logs/quality-baselines.json',
    regressions: 'logs/regression-alerts.json',
    history: 'logs/regression-history.json',
    config: 'logs/regression-config.json'
  }
};

class RegressionAlertSystem {
  constructor() {
    this.ensureDirectories();
    this.baselines = this.loadBaselines();
    this.regressions = this.loadRegressions();
    this.history = this.loadHistory();
  }

  ensureDirectories() {
    const logsDir = 'logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  loadBaselines() {
    try {
      if (fs.existsSync(REGRESSION_CONFIG.files.baselines)) {
        return JSON.parse(fs.readFileSync(REGRESSION_CONFIG.files.baselines, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading baselines:', error.message);
    }
    return {
      established: false,
      timestamp: null,
      metrics: null,
      source: 'default'
    };
  }

  loadRegressions() {
    try {
      if (fs.existsSync(REGRESSION_CONFIG.files.regressions)) {
        return JSON.parse(fs.readFileSync(REGRESSION_CONFIG.files.regressions, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading regressions:', error.message);
    }
    return { active: [], resolved: [] };
  }

  loadHistory() {
    try {
      if (fs.existsSync(REGRESSION_CONFIG.files.history)) {
        return JSON.parse(fs.readFileSync(REGRESSION_CONFIG.files.history, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading history:', error.message);
    }
    return { entries: [] };
  }

  saveBaselines() {
    try {
      fs.writeFileSync(REGRESSION_CONFIG.files.baselines, JSON.stringify(this.baselines, null, 2));
    } catch (error) {
      this.log('Error saving baselines:', error.message);
    }
  }

  saveRegressions() {
    try {
      fs.writeFileSync(REGRESSION_CONFIG.files.regressions, JSON.stringify(this.regressions, null, 2));
    } catch (error) {
      this.log('Error saving regressions:', error.message);
    }
  }

  saveHistory() {
    try {
      fs.writeFileSync(REGRESSION_CONFIG.files.history, JSON.stringify(this.history, null, 2));
    } catch (error) {
      this.log('Error saving history:', error.message);
    }
  }

  log(message, ...args) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] REGRESSION: ${message} ${args.join(' ')}`;
    console.log(logMessage);

    try {
      fs.appendFileSync('logs/regression-alerts.log', logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async getCurrentMetrics() {
    try {
      // Get TypeScript errors
      const tsOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      const typeScriptErrors = parseInt(tsOutput.trim()) || 0;

      // Get ESLint counts
      const lintOutput = execSync('yarn lint:ci 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorMatch = lintOutput.match(/(\d+) errors?/);
      const warningMatch = lintOutput.match(/(\d+) warnings?/);
      const eslintErrors = errorMatch ? parseInt(errorMatch[1]) : 0;
      const eslintWarnings = warningMatch ? parseInt(warningMatch[1]) : 0;

      // Measure performance
      const lintStart = Date.now();
      execSync('yarn lint:quick > /dev/null 2>&1 || true', { stdio: 'pipe' });
      const lintDuration = (Date.now() - lintStart) / 1000;

      return {
        timestamp: new Date().toISOString(),
        typeScriptErrors,
        eslintErrors,
        eslintWarnings,
        lintDuration,
        buildDuration: null // Only measured when requested
      };
    } catch (error) {
      this.log('Error getting current metrics:', error.message);
      return null;
    }
  }

  establishBaseline(metrics, source = 'manual') {
    this.baselines = {
      established: true,
      timestamp: new Date().toISOString(),
      metrics: { ...metrics },
      source
    };

    this.saveBaselines();
    this.log(`Baseline established from $) {source}:`, JSON.stringify(metrics));
  }

  calculateRegressionSeverity(baseline, current, metric) {
    if (baseline <= 0) return null; // Can't calculate percentage for zero baseline

    const increase = current - baseline;
    const percentageIncrease = (increase / baseline) * 100;

    // Check minimum absolute increase threshold
    const minIncrease = REGRESSION_CONFIG.regression.minimumIncrease[metric] || 1;
    if (increase < minIncrease) return null;

    // Determine severity based on percentage increase
    if (percentageIncrease >= REGRESSION_CONFIG.regression.thresholds.critical) {
      return 'CRITICAL';
    } else if (percentageIncrease >= REGRESSION_CONFIG.regression.thresholds.major) {
      return 'MAJOR';
    } else if (percentageIncrease >= REGRESSION_CONFIG.regression.thresholds.moderate) {
      return 'MODERATE';
    } else if (percentageIncrease >= REGRESSION_CONFIG.regression.thresholds.minor) {
      return 'MINOR';
    }

    return null;
  }

  detectRegressions(currentMetrics) {
    if (!this.baselines.established) {
      this.log('No baseline established - cannot detect regressions');
      return [];
    }

    const baseline = this.baselines.metrics;
    const regressions = [];

    // Check TypeScript errors
    const tsSeverity = this.calculateRegressionSeverity(
      baseline.typeScriptErrors,
      currentMetrics.typeScriptErrors,
      'typescript'
    );

    if (tsSeverity) {
      regressions.push({
        id: `ts-${Date.now()}`,
        type: 'typescript',
        severity: tsSeverity,
        baseline: baseline.typeScriptErrors,
        current: currentMetrics.typeScriptErrors,
        increase: currentMetrics.typeScriptErrors - baseline.typeScriptErrors,
        percentage: ((currentMetrics.typeScriptErrors - baseline.typeScriptErrors) / baseline.typeScriptErrors * 100).toFixed(1),
        message: `TypeScript errors increased from ${baseline.typeScriptErrors} to ${currentMetrics.typeScriptErrors}`,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // Check ESLint errors
    const eslintErrorsSeverity = this.calculateRegressionSeverity(
      baseline.eslintErrors,
      currentMetrics.eslintErrors,
      'eslintErrors'
    );

    if (eslintErrorsSeverity) {
      regressions.push({
        id: `eslint-errors-${Date.now()}`,
        type: 'eslint-errors',
        severity: eslintErrorsSeverity,
        baseline: baseline.eslintErrors,
        current: currentMetrics.eslintErrors,
        increase: currentMetrics.eslintErrors - baseline.eslintErrors,
        percentage: ((currentMetrics.eslintErrors - baseline.eslintErrors) / baseline.eslintErrors * 100).toFixed(1),
        message: `ESLint errors increased from ${baseline.eslintErrors} to ${currentMetrics.eslintErrors}`,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // Check ESLint warnings
    const eslintWarningsSeverity = this.calculateRegressionSeverity(
      baseline.eslintWarnings,
      currentMetrics.eslintWarnings,
      'eslintWarnings'
    );

    if (eslintWarningsSeverity) {
      regressions.push({
        id: `eslint-warnings-${Date.now()}`,
        type: 'eslint-warnings',
        severity: eslintWarningsSeverity,
        baseline: baseline.eslintWarnings,
        current: currentMetrics.eslintWarnings,
        increase: currentMetrics.eslintWarnings - baseline.eslintWarnings,
        percentage: ((currentMetrics.eslintWarnings - baseline.eslintWarnings) / baseline.eslintWarnings * 100).toFixed(1),
        message: `ESLint warnings increased from ${baseline.eslintWarnings} to ${currentMetrics.eslintWarnings}`,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // Check performance regression
    if (baseline.lintDuration && currentMetrics.lintDuration) {
      const perfIncrease = currentMetrics.lintDuration - baseline.lintDuration;
      const perfPercentage = (perfIncrease / baseline.lintDuration) * 100;

      if (perfPercentage >= 50 && perfIncrease >= 10) { // 50% increase and at least 10 seconds
        regressions.push({
          id: `performance-$) {Date.now()}`,
          type: 'performance',
          severity: perfPercentage >= 100 ? 'MAJOR' : 'MODERATE',
          baseline: baseline.lintDuration,
          current: currentMetrics.lintDuration,
          increase: perfIncrease,
          percentage: perfPercentage.toFixed(1),
          message: `Linting performance degraded from ${baseline.lintDuration}s to ${currentMetrics.lintDuration}s`,
          timestamp: new Date().toISOString(),
          status: 'active'
        });
      }
    }

    return regressions;
  }

  processRegressions(regressions, currentMetrics) {
    for (const regression of regressions) {
      // Add to active regressions
      this.regressions.active.push(regression);

      // Add to history
      this.history.entries.push({
        ...regression,
        detectedAt: new Date().toISOString(),
        metrics: currentMetrics
      });

      // Send alerts
      this.sendAlert(regression);

      // Execute automated responses
      this.executeRegressionResponse(regression);
    }

    // Clean up old active regressions
    this.cleanupOldRegressions();

    // Save state
    this.saveRegressions();
    this.saveHistory();
  }

  sendAlert(regression) {
    const alertMessage = this.formatAlertMessage(regression);

    // Console alert
    console.log(`\n🚨 REGRESSION DETECTED [$) {regression.severity}]`);
    console.log(alertMessage);

    // File alert
    this.log(`REGRESSION [${regression.severity}] ${regression.type}: $) {regression.message}`);

    // Webhook alert (if configured)
    this.sendWebhookAlert(regression);
  }

  formatAlertMessage(regression) {
    const severityEmoji = {
      'MINOR': '⚠️',
      'MODERATE': '🔶',
      'MAJOR': '🔴',
      'CRITICAL': '💥'
    };

    return `
${severityEmoji[regression.severity]} ${regression.severity} REGRESSION DETECTED

Type: ${regression.type}
Message: ${regression.message}
Increase: +${regression.increase} (+${regression.percentage}%)
Baseline: ${regression.baseline}
Current: ${regression.current}
Detected: ${regression.timestamp}

Recommended Actions:
${this.getRecommendedActions(regression)}
    `.trim();
  }

  getRecommendedActions(regression) {
    const actions = [];

    switch (regression.type) {
      case 'typescript':
        actions.push('- Run `yarn lint:fix:any` to auto-fix TypeScript issues');
        actions.push('- Check recent commits for type-related changes');
        if (regression.severity === 'CRITICAL') {
          actions.push('- Consider triggering emergency campaign: `yarn lint:campaign:start emergency`');
        }
        break;

      case 'eslint-errors':
        actions.push('- Run `yarn lint:fix` to auto-fix ESLint errors');
        actions.push('- Review recent code changes for linting violations');
        if (regression.severity === 'MAJOR' || regression.severity === 'CRITICAL') {
          actions.push('- Consider triggering cleanup campaign: `yarn lint:campaign:start standard`');
        }
        break;

      case 'eslint-warnings':
        actions.push('- Run `yarn lint:fix` to auto-fix ESLint warnings');
        actions.push('- Schedule cleanup campaign for systematic improvement');
        break;

      case 'performance':
        actions.push('- Clear ESLint caches: `yarn lint:cache:clear`');
        actions.push('- Check for large file additions or complex rule changes');
        actions.push('- Consider optimizing ESLint configuration');
        break;
    }

    return actions.join('\n');
  }

  sendWebhookAlert(regression) {
    // Placeholder for webhook integration
    // This could integrate with Slack, Discord, email, etc.
    const webhookUrl = process.env.REGRESSION_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        const payload = { text: `Regression Alert, ${regression.severity} ${regression.type}`,
          attachments: [{
            color: this.getSeverityColor(regression.severity),
            fields: [
              { title: 'Type', value: regression.type, short: true },
              { title: 'Severity', value: regression.severity, short: true },
              { title: 'Increase', value: `+${regression.increase} (+${regression.percentage}%)`, short: true },
              { title: 'Message', value: regression.message, short: false }
            ]
          }]
        };

        // Note: In a real implementation, you would use a proper HTTP client
        this.log(`Webhook alert would be sent to: $) {webhookUrl}`);
        this.log(`Payload: $) {JSON.stringify(payload)}`);
      } catch (error) {
        this.log('Error sending webhook alert:', error.message);
      }
    }
  }

  getSeverityColor(severity) {
    const colors = {
      'MINOR': '#ffcc00',
      'MODERATE': '#ff9900',
      'MAJOR': '#ff3300',
      'CRITICAL': '#cc0000'
    };
    return colors[severity] || '#cccccc';
  }

  executeRegressionResponse(regression) {
    // Automated responses based on severity and type
    if (regression.severity === 'CRITICAL') {
      this.log(`Executing critical regression response for $) {regression.type}`);

      if (regression.type === 'typescript' || regression.type === 'eslint-errors') {
        // Trigger emergency campaign if available
        try {
          if (fs.existsSync('src/scripts/linting-campaign-cli.cjs')) {
            this.log('Triggering emergency campaign due to critical regression');
            execSync('yarn lint:campaign:start emergency --confirm', { stdio: 'inherit' });
          }
        } catch (error) {
          this.log('Error triggering emergency campaign:', error.message);
        }
      }
    } else if (regression.severity === 'MAJOR') {
      this.log(`Executing major regression response for ${regression.type}`);

      // Schedule cleanup campaign
      try {
        if (fs.existsSync('src/scripts/linting-campaign-cli.cjs')) {
          this.log('Scheduling cleanup campaign due to major regression');
          // Create scheduled task instead of immediate execution
          this.scheduleCleanupCampaign(regression);
        }
      } catch (error) {
        this.log('Error scheduling cleanup campaign:', error.message);
      }
    }
  }

  scheduleCleanupCampaign(regression) {
    const scheduledTask = {
      id: `cleanup-${regression.id}`,
      type: 'cleanup-campaign',
      trigger: 'regression',
      regression: regression.id,
      scheduledAt: new Date().toISOString(),
      status: 'scheduled'
    };

    const scheduledTasksFile = 'logs/scheduled-regression-responses.json';
    let tasks = [];

    try {
      if (fs.existsSync(scheduledTasksFile)) {
        tasks = JSON.parse(fs.readFileSync(scheduledTasksFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading scheduled tasks:', error.message);
    }

    tasks.push(scheduledTask);

    try {
      fs.writeFileSync(scheduledTasksFile, JSON.stringify(tasks, null, 2));
      this.log(`Scheduled cleanup campaign for regression $) {regression.id}`);
    } catch (error) {
      this.log('Error saving scheduled task:', error.message);
    }
  }

  cleanupOldRegressions() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - REGRESSION_CONFIG.alerts.retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    // Move old active regressions to resolved
    const oldRegressions = this.regressions.active.filter(r => r.timestamp < cutoffISO);
    this.regressions.resolved.push(...oldRegressions.map(r => ({ ...r, resolvedAt: new Date().toISOString(), status: 'auto-resolved' })));
    this.regressions.active = this.regressions.active.filter(r => r.timestamp >= cutoffISO);

    // Limit active regressions
    if (this.regressions.active.length > REGRESSION_CONFIG.alerts.maxActiveAlerts) {
      const excess = this.regressions.active.splice(0, this.regressions.active.length - REGRESSION_CONFIG.alerts.maxActiveAlerts);
      this.regressions.resolved.push(...excess.map(r => ({ ...r, resolvedAt: new Date().toISOString(), status: 'auto-resolved' })));
    }

    // Clean up history
    this.history.entries = this.history.entries.filter(entry => entry.detectedAt >= cutoffISO);
  }

  async checkForRegressions() {
    this.log('Checking for quality regressions...');

    const currentMetrics = await this.getCurrentMetrics();
    if (!currentMetrics) {
      this.log('Failed to get current metrics');
      return { regressions: [], metrics: null };
    }

    const regressions = this.detectRegressions(currentMetrics);

    if (regressions.length > 0) {
      this.log(`Detected $) {regressions.length} regression(s)`);
      this.processRegressions(regressions, currentMetrics);
    } else {
      this.log('No regressions detected');
    }

    return { regressions, metrics: currentMetrics };
  }

  generateRegressionReport() {
    console.log('\n📊 Regression Alert System Report');
    console.log('==================================\n');

    // Baseline status
    if (this.baselines.established) {
      console.log('📈 Baseline Status: ESTABLISHED');
      console.log(`  Established: $) {this.baselines.timestamp}`);
      console.log(`  Source: $) {this.baselines.source}`);
      console.log(`  TypeScript Errors: $) {this.baselines.metrics.typeScriptErrors}`);
      console.log(`  ESLint Errors: $) {this.baselines.metrics.eslintErrors}`);
      console.log(`  ESLint Warnings: $) {this.baselines.metrics.eslintWarnings}`);
      console.log(`  Lint Duration: $) {this.baselines.metrics.lintDuration}s\n`);
    } else {
      console.log('📈 Baseline Status: NOT ESTABLISHED');
      console.log('  Run with --establish-baseline to set current state as baseline\n');
    }

    // Active regressions
    if (this.regressions.active.length > 0) {
      console.log(`🚨 Active Regressions: $) {this.regressions.active.length}`);
      this.regressions.active.forEach(regression => {
        console.log(`  [${regression.severity}] $) {regression.type}: $) {regression.message}`);
        console.log(`    Increase: +${regression.increase} (+$) {regression.percentage}%)`);
        console.log(`    Detected: $) {regression.timestamp}`);
      });
      console.log('');
    } else {
      console.log('✅ Active Regressions: None\n');
    }

    // Recent history
    const recentHistory = this.history.entries.slice(-5);
    if (recentHistory.length > 0) {
      console.log('📋 Recent Regression History:');
      recentHistory.forEach(entry => {
        console.log(`  ${entry.detectedAt}: [${entry.severity}] $) {entry.type} (+$) {entry.percentage}%)`);
      });
      console.log('');
    }

    // Statistics
    const totalRegressions = this.history.entries.length;
    const criticalCount = this.history.entries.filter(e => e.severity === 'CRITICAL').length;
    const majorCount = this.history.entries.filter(e => e.severity === 'MAJOR').length;

    console.log('📊 Statistics:');
    console.log(`  Total Regressions Detected: ${totalRegressions}`);
    console.log(`  Critical: ${criticalCount}`);
    console.log(`  Major: ${majorCount}`);
    console.log(`  Active Alerts: ${this.regressions.active.length}`);
    console.log(`  Resolved Alerts: ${this.regressions.resolved.length}`);
  }
}

// CLI Interface
async function main() {
  const alertSystem = new RegressionAlertSystem();
  const command = process.argv[2] || 'check';

  switch (command) {
    case 'check':
      await alertSystem.checkForRegressions();
      break;

    case 'establish-baseline': {
      const metrics = await alertSystem.getCurrentMetrics();
      if (metrics) {
        alertSystem.establishBaseline(metrics, 'cli');
        console.log('✅ Baseline established successfully');
      } else {
        console.error('❌ Failed to get current metrics for baseline');
        process.exit(1);
      }
    }
      break;

    case 'report':
      alertSystem.generateRegressionReport();
      break;

    case 'status': {
      const { regressions, metrics } = await alertSystem.checkForRegressions();
      console.log(JSON.stringify({
        regressions,
        metrics,
        baseline: alertSystem.baselines,
        activeAlerts: alertSystem.regressions.active.length
      }, null, 2));
    }
      break;

    case 'clear-alerts':
      alertSystem.regressions.active = [];
      alertSystem.saveRegressions();
      console.log('✅ Active alerts cleared');
      break;

    case 'help':
      console.log(`)
Regression Alert System Commands:
  check              - Check for regressions against baseline
  establish-baseline - Set current metrics as baseline
  report            - Generate regression report
  status            - Output current status as JSON
  clear-alerts      - Clear all active alerts
  help              - Show this help message

Environment Variables:
  REGRESSION_WEBHOOK_URL - Webhook URL for alerts (optional)
      `);
      break;

    default:
      console.error(`Unknown command: $) {command}`);
      console.error('Run "node regression-alert-system.cjs help" for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { RegressionAlertSystem, REGRESSION_CONFIG };

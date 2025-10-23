#!/usr/bin/env node

/**
 * Progress Monitoring CLI Tool
 *
 * Real-time monitoring and alerting for unintentional any elimination progress
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL) || 30,
  alertThreshold: parseInt(process.env.ALERT_THRESHOLD) || 100,
  historyFile: process.env.HISTORY_FILE || './logs/progress-history.json',
  alertsFile: process.env.ALERTS_FILE || './logs/alerts.json',
  maxHistoryEntries: parseInt(process.env.MAX_HISTORY) || 1000
};

// Ensure log directory exists
const logDir = path.dirname(CONFIG.historyFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Load or initialize history
function loadHistory() {
  if (fs.existsSync(CONFIG.historyFile)) {
    try {
      const data = fs.readFileSync(CONFIG.historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load history, starting fresh:', error.message);
    }
  }
  return [];
}

// Save history
function saveHistory(history) {
  try {
    // Keep only the most recent entries
    const trimmedHistory = history.slice(-CONFIG.maxHistoryEntries);
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(trimmedHistory, null, 2));
  } catch (error) {
    console.error('Failed to save history:', error.message);
  }
}

// Load or initialize alerts
function loadAlerts() {
  if (fs.existsSync(CONFIG.alertsFile)) {
    try {
      const data = fs.readFileSync(CONFIG.alertsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load alerts, starting fresh:', error.message);
    }
  }
  return [];
}

// Save alerts
function saveAlerts(alerts) {
  try {
    fs.writeFileSync(CONFIG.alertsFile, JSON.stringify(alerts, null, 2));
  } catch (error) {
    console.error('Failed to save alerts:', error.message);
  }
}

// Get current metrics
function getCurrentMetrics() {
  const timestamp = new Date().toISOString();

  try {
    const typeScriptErrors = getTypeScriptErrorCount();
    const explicitAnyWarnings = getExplicitAnyCount();
    const buildStatus = getBuildStatus();

    return {
      timestamp,
      typeScriptErrors,
      explicitAnyWarnings,
      buildStatus,
      total: typeScriptErrors + explicitAnyWarnings
    };
  } catch (error) {
    return {
      timestamp,
      error: error.message,
      typeScriptErrors: -1,
      explicitAnyWarnings: -1,
      buildStatus: 'unknown',
      total: -1
    };
  }
}

// Get TypeScript error count
function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Get explicit-any warning count
function getExplicitAnyCount() {
  try {
    const output = execSync('yarn lint --format=unix 2>/dev/null | grep -c "@typescript-eslint/no-explicit-any"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Get build status
function getBuildStatus() {
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    return 'passing';
  } catch (error) {
    return 'failing';
  }
}

// Calculate trends
function calculateTrends(history, currentMetrics) {
  if (history.length < 2) {
    return {
      typeScriptErrorTrend: 'stable',
      explicitAnyTrend: 'stable',
      totalTrend: 'stable',
      velocity: 0
    };
  }

  const previous = history[history.length - 1];
  const current = currentMetrics;

  const typeScriptErrorDelta = current.typeScriptErrors - previous.typeScriptErrors;
  const explicitAnyDelta = current.explicitAnyWarnings - previous.explicitAnyWarnings;
  const totalDelta = current.total - previous.total;

  // Calculate velocity (errors per hour)
  const timeDelta = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60 * 60);
  const velocity = timeDelta > 0 ? totalDelta / timeDelta : 0;

  return {
    typeScriptErrorTrend: typeScriptErrorDelta < 0 ? 'improving' : typeScriptErrorDelta > 0 ? 'degrading' : 'stable',
    explicitAnyTrend: explicitAnyDelta < 0 ? 'improving' : explicitAnyDelta > 0 ? 'degrading' : 'stable',
    totalTrend: totalDelta < 0 ? 'improving' : totalDelta > 0 ? 'degrading' : 'stable',
    velocity,
    deltas: {
      typeScriptErrors: typeScriptErrorDelta,
      explicitAnyWarnings: explicitAnyDelta,
      total: totalDelta
    }
  };
}

// Check for alerts
function checkAlerts(currentMetrics, trends, history, existingAlerts) {
  const newAlerts = [];

  // Threshold alerts
  if (currentMetrics.typeScriptErrors > CONFIG.alertThreshold) {
    newAlerts.push({
      id: `threshold-ts-${Date.now()}`,
      timestamp: currentMetrics.timestamp,
      type: 'threshold',
      severity: 'high',
      message: `TypeScript errors (${currentMetrics.typeScriptErrors}) exceed threshold (${CONFIG.alertThreshold})`,
      metrics: currentMetrics
    });
  }

  if (currentMetrics.explicitAnyWarnings > CONFIG.alertThreshold) {
    newAlerts.push({
      id: `threshold-any-${Date.now()}`,
      timestamp: currentMetrics.timestamp,
      type: 'threshold',
      severity: 'medium',
      message: `Explicit-any warnings (${currentMetrics.explicitAnyWarnings}) exceed threshold (${CONFIG.alertThreshold})`,
      metrics: currentMetrics
    });
  }

  // Trend alerts
  if (trends.totalTrend === 'degrading' && Math.abs(trends.deltas.total) > 10) {
    newAlerts.push({
      id: `trend-degrading-${Date.now()}`,
      timestamp: currentMetrics.timestamp,
      type: 'trend',
      severity: 'medium',
      message: `Quality degrading: ${trends.deltas.total} more errors/warnings`,
      trends,
      metrics: currentMetrics
    });
  }

  // Build failure alerts
  if (currentMetrics.buildStatus === 'failing') {
    newAlerts.push({
      id: `build-failing-${Date.now()}`,
      timestamp: currentMetrics.timestamp,
      type: 'build',
      severity: 'high',
      message: 'Build is currently failing',
      metrics: currentMetrics
    });
  }

  // Velocity alerts (rapid changes)
  if (Math.abs(trends.velocity) > 50) {
    newAlerts.push({
      id: `velocity-${Date.now()}`,
      timestamp: currentMetrics.timestamp,
      type: 'velocity',
      severity: 'medium',
      message: `Rapid change detected: ${trends.velocity.toFixed(1)} errors/hour`,
      trends,
      metrics: currentMetrics
    });
  }

  return newAlerts;
}

// Display metrics
function displayMetrics(currentMetrics, trends, alerts) {
  console.clear();
  console.log('='.repeat(80));
  console.log('UNINTENTIONAL ANY ELIMINATION - PROGRESS MONITOR');
  console.log('='.repeat(80));
  console.log(`Last Updated: ${currentMetrics.timestamp}`);
  console.log();

  // Current metrics
  console.log('CURRENT METRICS:');
  console.log(`  TypeScript Errors:     ${currentMetrics.typeScriptErrors.toString().padStart(6)}`);
  console.log(`  Explicit-Any Warnings: ${currentMetrics.explicitAnyWarnings.toString().padStart(6)}`);
  console.log(`  Total Issues:          ${currentMetrics.total.toString().padStart(6)}`);
  console.log(`  Build Status:          ${currentMetrics.buildStatus.toUpperCase()}`);
  console.log();

  // Trends
  console.log('TRENDS:');
  console.log(`  TypeScript Errors:     ${getTrendIcon(trends.typeScriptErrorTrend)} ${trends.typeScriptErrorTrend.toUpperCase()}`);
  console.log(`  Explicit-Any Warnings: ${getTrendIcon(trends.explicitAnyTrend)} ${trends.explicitAnyTrend.toUpperCase()}`);
  console.log(`  Overall:               ${getTrendIcon(trends.totalTrend)} ${trends.totalTrend.toUpperCase()}`);
  console.log(`  Velocity:              ${trends.velocity.toFixed(1)} errors/hour`);
  console.log();

  // Deltas
  if (trends.deltas) {
    console.log('CHANGES:');
    console.log(`  TypeScript Errors:     ${formatDelta(trends.deltas.typeScriptErrors)}`);
    console.log(`  Explicit-Any Warnings: ${formatDelta(trends.deltas.explicitAnyWarnings)}`);
    console.log(`  Total:                 ${formatDelta(trends.deltas.total)}`);
    console.log();
  }

  // Active alerts
  if (alerts.length > 0) {
    console.log('ACTIVE ALERTS:');
    alerts.slice(-5).forEach(alert => {
      const severityIcon = getSeverityIcon(alert.severity);
      console.log(`  ${severityIcon} ${alert.message}`);
    });
    console.log();
  }

  console.log(`Monitoring every ${CONFIG.monitoringInterval} seconds...`);
  console.log('Press Ctrl+C to stop');
}

// Helper functions
function getTrendIcon(trend) {
  switch (trend) {
    case 'improving': return '📈';
    case 'degrading': return '📉';
    case 'stable': return '➡️';
    default: return '❓';
  }
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return 'ℹ️';
    default: return '📋';
  }
}

function formatDelta(delta) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return delta.toString();
  return '0';
}

// Generate summary report
function generateSummaryReport(history, alerts) {
  if (history.length === 0) {
    return 'No historical data available';
  }

  const latest = history[history.length - 1];
  const oldest = history[0];

  const totalImprovement = {
    typeScriptErrors: oldest.typeScriptErrors - latest.typeScriptErrors,
    explicitAnyWarnings: oldest.explicitAnyWarnings - latest.explicitAnyWarnings,
    total: oldest.total - latest.total
  };

  const timeSpan = new Date(latest.timestamp) - new Date(oldest.timestamp);
  const days = timeSpan / (1000 * 60 * 60 * 24);

  const report = {
    monitoringPeriod: {
      start: oldest.timestamp,
      end: latest.timestamp,
      durationDays: days.toFixed(1)
    },
    currentStatus: latest,
    totalImprovement,
    averageDaily: {
      typeScriptErrors: days > 0 ? (totalImprovement.typeScriptErrors / days).toFixed(1) : 0,
      explicitAnyWarnings: days > 0 ? (totalImprovement.explicitAnyWarnings / days).toFixed(1) : 0,
      total: days > 0 ? (totalImprovement.total / days).toFixed(1) : 0
    },
    alertsSummary: {
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    }
  };

  return report;
}

// Main monitoring loop
async function startMonitoring(options = {}) {
  const {
    interval = CONFIG.monitoringInterval,
    threshold = CONFIG.alertThreshold,
    silent = false
  } = options;

  let history = loadHistory();
  let alerts = loadAlerts();

  console.log('Starting progress monitoring...');
  console.log(`Interval: ${interval} seconds`);
  console.log(`Alert threshold: ${threshold}`);
  console.log();

  const monitor = () => {
    try {
      const currentMetrics = getCurrentMetrics();
      const trends = calculateTrends(history, currentMetrics);
      const newAlerts = checkAlerts(currentMetrics, trends, history, alerts);

      // Add to history
      history.push(currentMetrics);

      // Add new alerts
      alerts.push(...newAlerts);

      // Save data
      saveHistory(history);
      saveAlerts(alerts);

      // Display (unless silent)
      if (!silent) {
        displayMetrics(currentMetrics, trends, alerts);
      }

      // Log new alerts
      newAlerts.forEach(alert => {
        console.log(`\n🚨 ALERT: ${alert.message}`);
      });

    } catch (error) {
      console.error('Monitoring error:', error.message);
    }
  };

  // Initial monitoring
  monitor();

  // Set up interval
  const intervalId = setInterval(monitor, interval * 1000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nGenerating final summary...');

    const summary = generateSummaryReport(history, alerts);
    console.log('\n=== MONITORING SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));

    console.log('\nMonitoring stopped');
    clearInterval(intervalId);
    process.exit(0);
  });

  // Keep process alive
  return new Promise(() => {});
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse options
  const options = {};
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  switch (command) {
    case 'start':
      startMonitoring({
        interval: parseInt(options.interval) || CONFIG.monitoringInterval,
        threshold: parseInt(options.threshold) || CONFIG.alertThreshold,
        silent: options.silent || false
      });
      break;

    case 'status':
      const currentMetrics = getCurrentMetrics();
      const history = loadHistory();
      const trends = calculateTrends(history, currentMetrics);

      console.log('=== CURRENT STATUS ===');
      console.log(JSON.stringify({ currentMetrics, trends }, null, 2));
      break;

    case 'history':
      const historyData = loadHistory();
      const limit = parseInt(options.limit) || 10;

      console.log(`=== HISTORY (last ${limit} entries) ===`);
      console.log(JSON.stringify(historyData.slice(-limit), null, 2));
      break;

    case 'alerts':
      const alertsData = loadAlerts();
      const alertLimit = parseInt(options.limit) || 10;

      console.log(`=== ALERTS (last ${alertLimit} entries) ===`);
      console.log(JSON.stringify(alertsData.slice(-alertLimit), null, 2));
      break;

    case 'summary':
      const summaryHistory = loadHistory();
      const summaryAlerts = loadAlerts();
      const summary = generateSummaryReport(summaryHistory, summaryAlerts);

      console.log('=== SUMMARY REPORT ===');
      console.log(JSON.stringify(summary, null, 2));
      break;

    case 'clear':
      if (options.history) {
        fs.writeFileSync(CONFIG.historyFile, '[]');
        console.log('History cleared');
      }
      if (options.alerts) {
        fs.writeFileSync(CONFIG.alertsFile, '[]');
        console.log('Alerts cleared');
      }
      if (!options.history && !options.alerts) {
        console.log('Specify --history or --alerts to clear data');
      }
      break;

    default:
      console.log(`
Progress Monitoring CLI Tool

USAGE:
  node progress-monitor.cjs <command> [options]

COMMANDS:
  start [--interval=<seconds>] [--threshold=<n>] [--silent]
    Start real-time monitoring

  status
    Show current status and trends

  history [--limit=<n>]
    Show historical data

  alerts [--limit=<n>]
    Show recent alerts

  summary
    Generate comprehensive summary report

  clear [--history] [--alerts]
    Clear stored data

OPTIONS:
  --interval=<seconds>    Monitoring interval (default: ${CONFIG.monitoringInterval})
  --threshold=<n>         Alert threshold (default: ${CONFIG.alertThreshold})
  --limit=<n>             Limit number of entries shown (default: 10)
  --silent                Suppress real-time display
  --history               Clear history data
  --alerts                Clear alerts data

EXAMPLES:
  # Start monitoring with 60-second intervals
  node progress-monitor.cjs start --interval=60

  # Show current status
  node progress-monitor.cjs status

  # Show last 20 history entries
  node progress-monitor.cjs history --limit=20

  # Generate summary report
  node progress-monitor.cjs summary

  # Clear all alerts
  node progress-monitor.cjs clear --alerts
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  startMonitoring,
  getCurrentMetrics,
  calculateTrends,
  checkAlerts,
  generateSummaryReport
};

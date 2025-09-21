#!/usr/bin/env node

/**
 * Continuous Monitoring System for Explicit Any Prevention
 *
 * Monitors explicit-any count trends and triggers campaigns when thresholds are breached
 * Protects the exceptional 36.78% reduction achievement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ContinuousMonitoringSystem {
  constructor() {
    this.baselineCount = 275; // Current achievement level
    this.metricsFile = '.kiro/specs/unintentional-any-elimination/monitoring-metrics.json';
    this.alertsFile = '.kiro/specs/unintentional-any-elimination/monitoring-alerts.json';

    this.thresholds = {
      warning: 280,      // 5 above baseline
      critical: 300,     // 25 above baseline
      emergency: 350,    // 75 above baseline
      campaignTrigger: 290 // Auto-trigger campaign
    };

    this.ensureDirectories();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      alert: '🚨'
    }[level];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  ensureDirectories() {
    const dir = path.dirname(this.metricsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  getCurrentExplicitAnyCount() {
    try {
      const output = execSync('yarn lint --format=compact 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      this.log(`Error counting explicit-any warnings: ${error}`, 'error');
      return -1;
    }
  }

  loadMetricsHistory() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.log(`Error loading metrics history: ${error}`, 'error');
    }

    return {
      baseline: this.baselineCount,
      measurements: [],
      trends: {},
      alerts: []
    };
  }

  saveMetricsHistory(metrics) {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      this.log(`Error saving metrics history: ${error}`, 'error');
    }
  }

  loadAlerts() {
    try {
      if (fs.existsSync(this.alertsFile)) {
        const data = fs.readFileSync(this.alertsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.log(`Error loading alerts: ${error}`, 'error');
    }

    return {
      active: [],
      history: []
    };
  }

  saveAlerts(alerts) {
    try {
      fs.writeFileSync(this.alertsFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      this.log(`Error saving alerts: ${error}`, 'error');
    }
  }

  calculateTrends(measurements) {
    if (measurements.length < 2) {
      return { direction: 'stable', rate: 0, confidence: 'low' };
    }

    const recent = measurements.slice(-7); // Last 7 measurements
    if (recent.length < 2) {
      return { direction: 'stable', rate: 0, confidence: 'low' };
    }

    const first = recent[0].count;
    const last = recent[recent.length - 1].count;
    const change = last - first;
    const rate = change / recent.length;

    let direction = 'stable';
    if (Math.abs(rate) > 0.5) {
      direction = rate > 0 ? 'increasing' : 'decreasing';
    }

    const confidence = recent.length >= 5 ? 'high' : recent.length >= 3 ? 'medium' : 'low';

    return { direction, rate, confidence, change };
  }

  generateAlert(level, message, count, trend) {
    return {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      count,
      baseline: this.baselineCount,
      change: count - this.baselineCount,
      trend,
      acknowledged: false
    };
  }

  checkThresholds(count, trend) {
    const alerts = this.loadAlerts();
    const newAlerts = [];

    // Emergency threshold
    if (count >= this.thresholds.emergency) {
      const alert = this.generateAlert(
        'emergency',
        `EMERGENCY: Explicit-any count (${count}) has reached emergency threshold (${this.thresholds.emergency}). Immediate campaign required.`,
        count,
        trend
      );
      newAlerts.push(alert);
      this.log(alert.message, 'alert');
    }
    // Critical threshold
    else if (count >= this.thresholds.critical) {
      const alert = this.generateAlert(
        'critical',
        `CRITICAL: Explicit-any count (${count}) has exceeded critical threshold (${this.thresholds.critical}). Campaign strongly recommended.`,
        count,
        trend
      );
      newAlerts.push(alert);
      this.log(alert.message, 'error');
    }
    // Warning threshold
    else if (count >= this.thresholds.warning) {
      const alert = this.generateAlert(
        'warning',
        `WARNING: Explicit-any count (${count}) has exceeded warning threshold (${this.thresholds.warning}). Monitor closely.`,
        count,
        trend
      );
      newAlerts.push(alert);
      this.log(alert.message, 'warn');
    }

    // Trend-based alerts
    if (trend.direction === 'increasing' && trend.confidence === 'high' && trend.rate > 1) {
      const alert = this.generateAlert(
        'trend',
        `TREND ALERT: Explicit-any count is increasing rapidly (${trend.rate.toFixed(1)} per measurement). Intervention may be needed.`,
        count,
        trend
      );
      newAlerts.push(alert);
      this.log(alert.message, 'warn');
    }

    // Auto-campaign trigger
    if (count >= this.thresholds.campaignTrigger) {
      const alert = this.generateAlert(
        'campaign',
        `AUTO-CAMPAIGN: Explicit-any count (${count}) has reached campaign trigger threshold (${this.thresholds.campaignTrigger}). Consider running elimination campaign.`,
        count,
        trend
      );
      newAlerts.push(alert);
      this.log(alert.message, 'warn');
    }

    // Save new alerts
    if (newAlerts.length > 0) {
      alerts.active.push(...newAlerts);
      alerts.history.push(...newAlerts);
      this.saveAlerts(alerts);
    }

    return newAlerts;
  }

  async runMonitoringCheck() {
    this.log('📊 Running Continuous Monitoring Check', 'info');
    this.log('='.repeat(60), 'info');

    // Get current count
    const currentCount = this.getCurrentExplicitAnyCount();
    if (currentCount === -1) {
      this.log('Failed to get current explicit-any count', 'error');
      return false;
    }

    // Load metrics history
    const metrics = this.loadMetricsHistory();

    // Add new measurement
    const measurement = {
      timestamp: new Date().toISOString(),
      count: currentCount,
      change: currentCount - this.baselineCount,
      percentage: ((this.baselineCount - currentCount) / 435) * 100 // From original 435
    };

    metrics.measurements.push(measurement);

    // Keep only last 30 measurements
    if (metrics.measurements.length > 30) {
      metrics.measurements = metrics.measurements.slice(-30);
    }

    // Calculate trends
    const trend = this.calculateTrends(metrics.measurements);
    metrics.trends = {
      ...trend,
      lastUpdated: new Date().toISOString()
    };

    // Save updated metrics
    this.saveMetricsHistory(metrics);

    // Log current status
    this.log(`📈 Current Status:`, 'info');
    this.log(`   Current count: ${currentCount}`, 'info');
    this.log(`   Baseline: ${this.baselineCount}`, 'info');
    this.log(`   Change: ${measurement.change} (${measurement.change >= 0 ? '+' : ''}${measurement.change})`, measurement.change > 0 ? 'warn' : 'success');
    this.log(`   Achievement: ${measurement.percentage.toFixed(2)}% reduction from original`, 'success');
    this.log(`   Trend: ${trend.direction} (${trend.rate.toFixed(2)}/measurement, ${trend.confidence} confidence)`, trend.direction === 'increasing' ? 'warn' : 'info');

    // Check thresholds and generate alerts
    const newAlerts = this.checkThresholds(currentCount, trend);

    // Generate monitoring report
    this.generateMonitoringReport(metrics, newAlerts);

    return true;
  }

  generateMonitoringReport(metrics, newAlerts) {
    const latestMeasurement = metrics.measurements[metrics.measurements.length - 1];
    const trend = metrics.trends;

    const report = `# Continuous Monitoring Report

## Current Status
- **Current Count:** ${latestMeasurement.count} explicit-any warnings
- **Baseline Achievement:** ${this.baselineCount} warnings (36.78% reduction from original 435)
- **Change from Baseline:** ${latestMeasurement.change >= 0 ? '+' : ''}${latestMeasurement.change} warnings
- **Current Achievement:** ${latestMeasurement.percentage.toFixed(2)}% reduction from original
- **Status:** ${this.getStatusLevel(latestMeasurement.count)}

## Trend Analysis
- **Direction:** ${trend.direction}
- **Rate:** ${trend.rate.toFixed(2)} warnings per measurement
- **Confidence:** ${trend.confidence}
- **Recent Change:** ${trend.change || 0} warnings over last ${Math.min(7, metrics.measurements.length)} measurements

## Threshold Status
- **Warning (${this.thresholds.warning}):** ${latestMeasurement.count >= this.thresholds.warning ? '⚠️ EXCEEDED' : '✅ OK'}
- **Critical (${this.thresholds.critical}):** ${latestMeasurement.count >= this.thresholds.critical ? '❌ EXCEEDED' : '✅ OK'}
- **Emergency (${this.thresholds.emergency}):** ${latestMeasurement.count >= this.thresholds.emergency ? '🚨 EXCEEDED' : '✅ OK'}
- **Campaign Trigger (${this.thresholds.campaignTrigger}):** ${latestMeasurement.count >= this.thresholds.campaignTrigger ? '🔄 TRIGGERED' : '✅ OK'}

## Recent Measurements
${metrics.measurements.slice(-5).map(m =>
  `- ${m.timestamp.split('T')[0]}: ${m.count} warnings (${m.change >= 0 ? '+' : ''}${m.change})`
).join('\n')}

## Active Alerts
${newAlerts.length > 0
  ? newAlerts.map(alert => `- **${alert.level.toUpperCase()}:** ${alert.message}`).join('\n')
  : '- No active alerts'
}

## Recommendations
${this.generateRecommendations(latestMeasurement.count, trend)}

---
**Last Updated:** ${new Date().toISOString()}
**Monitoring System:** Continuous Explicit-Any Prevention
**Next Check:** Recommended within 24 hours
`;

    const reportPath = '.kiro/specs/unintentional-any-elimination/monitoring-report.md';
    fs.writeFileSync(reportPath, report);
    this.log(`📊 Monitoring report generated: ${reportPath}`, 'success');
  }

  getStatusLevel(count) {
    if (count >= this.thresholds.emergency) return '🚨 EMERGENCY';
    if (count >= this.thresholds.critical) return '❌ CRITICAL';
    if (count >= this.thresholds.warning) return '⚠️ WARNING';
    return '✅ GOOD';
  }

  generateRecommendations(count, trend) {
    const recommendations = [];

    if (count >= this.thresholds.emergency) {
      recommendations.push('**URGENT:** Run emergency any elimination campaign immediately');
      recommendations.push('**URGENT:** Review recent commits for any type introductions');
      recommendations.push('**URGENT:** Consider reverting recent changes if necessary');
    } else if (count >= this.thresholds.critical) {
      recommendations.push('**HIGH PRIORITY:** Run any elimination campaign within 24 hours');
      recommendations.push('**HIGH PRIORITY:** Review and strengthen pre-commit hooks');
      recommendations.push('**HIGH PRIORITY:** Analyze root cause of regression');
    } else if (count >= this.thresholds.warning) {
      recommendations.push('**RECOMMENDED:** Consider running any elimination campaign');
      recommendations.push('**RECOMMENDED:** Review recent code changes for any type additions');
      recommendations.push('**RECOMMENDED:** Ensure pre-commit hooks are functioning properly');
    } else {
      recommendations.push('**MAINTAIN:** Current levels are within acceptable range');
      recommendations.push('**MAINTAIN:** Continue regular monitoring');
    }

    if (trend.direction === 'increasing' && trend.confidence === 'high') {
      recommendations.push('**TREND:** Address increasing trend before it becomes critical');
      recommendations.push('**TREND:** Review development practices and training needs');
    }

    return recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : '- Continue current monitoring schedule';
  }

  async runDailyMonitoring() {
    this.log('🔄 Running Daily Monitoring Schedule', 'info');

    const success = await this.runMonitoringCheck();

    if (success) {
      this.log('✅ Daily monitoring completed successfully', 'success');
    } else {
      this.log('❌ Daily monitoring encountered errors', 'error');
    }

    return success;
  }
}

// Execute monitoring
if (require.main === module) {
  const monitor = new ContinuousMonitoringSystem();

  monitor.runMonitoringCheck()
    .then((success) => {
      if (success) {
        console.log('\n✅ Monitoring check completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Monitoring check failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Monitoring error:', error.message);
      process.exit(1);
    });
}

module.exports = { ContinuousMonitoringSystem };

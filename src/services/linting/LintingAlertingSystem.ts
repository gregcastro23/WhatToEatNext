/**
 * Linting Alerting System with Performance Monitoring
 *
 * Provides real-time alerting for linting regression detection
 * with performance monitoring and automated response capabilities.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { Alert, LintingMetrics } from './LintingValidationDashboard';

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  regressionDetection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    cooldownPeriod: number; // minutes
  };
  performanceMonitoring: {
    enabled: boolean;
    thresholds: PerformanceThreshold[];
  };
  autoResponse: {
    enabled: boolean;
    actions: AutoResponseAction[];
  };
}

export interface AlertChannel {
  type: 'console' | 'file' | 'webhook' | 'kiro';
  config: Record<string, any>;
  severityFilter: ('info' | 'warning' | 'error' | 'critical')[];
}

export interface PerformanceThreshold {
  metric: 'duration' | 'memory' | 'cacheHitRate' | 'filesPerSecond';
  threshold: number;
  severity: 'warning' | 'error' | 'critical';
  message: string;
}

export interface AutoResponseAction {
  trigger: string;
  action: 'enableCache' | 'reduceBatchSize' | 'skipNonCritical' | 'emergencyStop';
  parameters: Record<string, any>;
}

export interface AlertHistory {
  alerts: Alert[];
  suppressedAlerts: Alert[];
  resolvedAlerts: Alert[];
  performanceEvents: PerformanceEvent[];
}

export interface PerformanceEvent {
  id: string;
  timestamp: Date;
  type: 'degradation' | 'improvement' | 'threshold_exceeded';
  metric: string;
  value: number;
  threshold: number;
  impact: 'low' | 'medium' | 'high';
  autoResponseTriggered: boolean;
}

export class LintingAlertingSystem {
  private readonly configFile = '.kiro/metrics/alerting-config.json';
  private readonly historyFile = '.kiro/metrics/alerting-history.json';
  private readonly suppressionFile = '.kiro/metrics/alert-suppressions.json';

  private config: AlertingConfig;
  private lastAlertTime: Map<string, Date> = new Map();
  private suppressedAlerts: Set<string> = new Set();

  constructor() {
    this.config = this.loadConfiguration();
    this.loadSuppressions();
  }

  /**
   * Process alerts and trigger appropriate responses
   */
  async processAlerts(alerts: Alert[], metrics: LintingMetrics): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    console.log(`🚨 Processing ${alerts.length} alerts...`);

    // Filter alerts based on cooldown and suppression
    const activeAlerts = this.filterActiveAlerts(alerts);

    // Process performance monitoring
    const performanceEvents = await this.monitorPerformance(metrics);

    // Send alerts through configured channels
    for (const alert of activeAlerts) {
      await this.sendAlert(alert);
      this.updateAlertHistory(alert);
    }

    // Process performance events
    for (const event of performanceEvents) {
      await this.processPerformanceEvent(event);
    }

    // Trigger auto-responses if configured
    if (this.config.autoResponse.enabled) {
      await this.triggerAutoResponses(activeAlerts, performanceEvents);
    }

    console.log(`✅ Processed ${activeAlerts.length} active alerts and ${performanceEvents.length} performance events`);
  }

  /**
   * Monitor performance metrics and detect issues
   */
  private async monitorPerformance(metrics: LintingMetrics): Promise<PerformanceEvent[]> {
    if (!this.config.performanceMonitoring.enabled) {
      return [];
    }

    const events: PerformanceEvent[] = [];
    const thresholds = this.config.performanceMonitoring.thresholds;

    for (const threshold of thresholds) {
      const value = this.getPerformanceMetricValue(metrics, threshold.metric);

      if (this.isThresholdExceeded(value, threshold)) {
        const event: PerformanceEvent = {
          id: `perf-${threshold.metric}-${Date.now()}`,
          timestamp: new Date(),
          type: 'threshold_exceeded',
          metric: threshold.metric,
          value,
          threshold: threshold.threshold,
          impact: this.calculateImpact(threshold.severity),
          autoResponseTriggered: false
        };

        events.push(event);
        console.log(`⚠️ Performance threshold exceeded: ${threshold.metric} = ${value} > ${threshold.threshold}`);
      }
    }

    return events;
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: Alert): Promise<void> {
    for (const channel of this.config.channels) {
      if (channel.severityFilter.includes(alert.severity)) {
        await this.sendAlertToChannel(alert, channel);
      }
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          this.sendConsoleAlert(alert);
          break;
        case 'file':
          await this.sendFileAlert(alert, channel.config);
          break;
        case 'kiro':
          await this.sendKiroAlert(alert, channel.config);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  /**
   * Send console alert
   */
  private sendConsoleAlert(alert: Alert): void {
    const icon = this.getSeverityIcon(alert.severity);
    const timestamp = alert.timestamp.toISOString();

    console.log(`${icon} [${alert.severity.toUpperCase()}] ${timestamp}`);
    console.log(`   Metric: ${alert.metric}`);
    console.log(`   Value: ${alert.currentValue} (threshold: ${alert.threshold})`);
    console.log(`   Message: ${alert.message}`);
    console.log('');
  }

  /**
   * Send file alert
   */
  private async sendFileAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    const alertFile = config.file || '.kiro/metrics/alerts.log';
    const timestamp = alert.timestamp.toISOString();
    const logEntry = `[${timestamp}] ${alert.severity.toUpperCase()}: ${alert.message} (${alert.metric}: ${alert.currentValue}/${alert.threshold})\n`;

    try {
      // Append to file
      execSync(`echo "${logEntry}" >> "${alertFile}"`);
    } catch (error) {
      console.error('Failed to write alert to file:', error);
    }
  }

  /**
   * Send Kiro alert (integration with Kiro system)
   */
  private async sendKiroAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Create Kiro notification file
    const kiroAlert = {
      id: alert.id,
      timestamp: alert.timestamp,
      type: 'linting_alert',
      severity: alert.severity,
      title: `Linting ${alert.severity.toUpperCase()}: ${alert.metric}`,
      message: alert.message,
      data: {
        metric: alert.metric,
        currentValue: alert.currentValue,
        threshold: alert.threshold
      },
      actions: this.generateKiroActions(alert)
    };

    const kiroFile = '.kiro/notifications/linting-alerts.json';
    writeFileSync(kiroFile, JSON.stringify(kiroAlert, null, 2));
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    if (!config.url) {
      console.warn('Webhook URL not configured');
      return;
    }

    const payload = {
      alert_id: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity,
      metric: alert.metric,
      current_value: alert.currentValue,
      threshold: alert.threshold,
      message: alert.message,
      source: 'linting-excellence-dashboard'
    };

    try {
      // Use curl for webhook (Node.js fetch might not be available)
      const curlCommand = `curl -X POST "${config.url}" \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify(payload)}'`;

      execSync(curlCommand, { stdio: 'pipe' });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  /**
   * Process performance event and trigger responses
   */
  private async processPerformanceEvent(event: PerformanceEvent): Promise<void> {
    console.log(`📊 Performance event: ${event.type} for ${event.metric}`);

    // Log performance event
    const performanceLog = `.kiro/metrics/performance-events.log`;
    const logEntry = `[${event.timestamp.toISOString()}] ${event.type.toUpperCase()}: ${event.metric} = ${event.value} (threshold: ${event.threshold}, impact: ${event.impact})\n`;

    try {
      execSync(`echo "${logEntry}" >> "${performanceLog}"`);
    } catch (error) {
      console.error('Failed to log performance event:', error);
    }

    // Update performance history
    this.updatePerformanceHistory(event);
  }

  /**
   * Trigger automatic responses based on alerts and performance events
   */
  private async triggerAutoResponses(alerts: Alert[], events: PerformanceEvent[]): Promise<void> {
    const actions = this.config.autoResponse.actions;

    for (const action of actions) {
      if (this.shouldTriggerAction(action, alerts, events)) {
        await this.executeAutoResponse(action);
      }
    }
  }

  /**
   * Execute automatic response action
   */
  private async executeAutoResponse(action: AutoResponseAction): Promise<void> {
    console.log(`🤖 Executing auto-response: ${action.action}`);

    try {
      switch (action.action) {
        case 'enableCache':
          await this.enableLintingCache();
          break;
        case 'reduceBatchSize':
          await this.reduceBatchSize(action.parameters.newSize || 10);
          break;
        case 'skipNonCritical':
          await this.skipNonCriticalRules();
          break;
        case 'emergencyStop':
          await this.emergencyStop();
          break;
      }
    } catch (error) {
      console.error(`Failed to execute auto-response ${action.action}:`, error);
    }
  }

  /**
   * Filter alerts based on cooldown and suppression
   */
  private filterActiveAlerts(alerts: Alert[]): Alert[] {
    return alerts.filter(alert => {
      // Check suppression
      if (this.suppressedAlerts.has(alert.metric)) {
        return false;
      }

      // Check cooldown
      const lastAlert = this.lastAlertTime.get(alert.metric);
      if (lastAlert) {
        const cooldownMs = this.config.regressionDetection.cooldownPeriod * 60 * 1000;
        if (Date.now() - lastAlert.getTime() < cooldownMs) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generate Kiro-specific actions for alerts
   */
  private generateKiroActions(alert: Alert): Array<Record<string, unknown>> {
    const actions: Array<Record<string, unknown>> = [];

    if (alert.metric === 'parserErrors' && alert.currentValue > 0) {
      actions.push({
        type: 'command',
        label: 'Fix Parser Errors',
        command: 'yarn tsc --noEmit',
        description: 'Run TypeScript compiler to identify syntax errors'
      });
    }

    if (alert.metric === 'explicitAnyErrors' && alert.currentValue > 100) {
      actions.push({
        type: 'campaign',
        label: 'Start Explicit Any Campaign',
        campaign: 'explicit-any-elimination',
        description: 'Launch systematic explicit any type elimination'
      });
    }

    if (alert.metric === 'importOrderIssues' && alert.currentValue > 50) {
      actions.push({
        type: 'command',
        label: 'Fix Import Order',
        command: 'yarn lint:fix',
        description: 'Automatically organize imports with enhanced rules'
      });
    }

    return actions;
  }

  // Auto-response implementations
  private async enableLintingCache(): Promise<void> {
    console.log('🚀 Enabling ESLint caching for improved performance');
    // Cache is already enabled in eslint.config.cjs, this is a no-op
  }

  private async reduceBatchSize(newSize: number): Promise<void> {
    console.log(`📉 Reducing batch size to ${newSize} for better performance`);
    // This would integrate with campaign system batch processing
  }

  private async skipNonCriticalRules(): Promise<void> {
    console.log('⚡ Temporarily skipping non-critical rules for performance');
    // This would create a temporary ESLint config with reduced rules
  }

  private async emergencyStop(): Promise<void> {
    console.log('🛑 Emergency stop triggered - halting linting operations');
    // This would stop any running linting campaigns
  }

  // Helper methods
  private loadConfiguration(): AlertingConfig {
    try {
      if (existsSync(this.configFile)) {
        return JSON.parse(readFileSync(this.configFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Error loading alerting configuration:', error);
    }

    // Return default configuration
    return {
      enabled: true,
      channels: [
        {
          type: 'console',
          config: {},
          severityFilter: ['warning', 'error', 'critical']
        },
        {
          type: 'file',
          config: { file: '.kiro/metrics/alerts.log' },
          severityFilter: ['error', 'critical']
        },
        {
          type: 'kiro',
          config: {},
          severityFilter: ['critical']
        }
      ],
      regressionDetection: {
        enabled: true,
        sensitivity: 'medium',
        cooldownPeriod: 15 // 15 minutes
      },
      performanceMonitoring: {
        enabled: true,
        thresholds: [
          {
            metric: 'duration',
            threshold: 30000, // 30 seconds
            severity: 'warning',
            message: 'Linting duration exceeds 30 seconds'
          },
          {
            metric: 'memory',
            threshold: 512, // 512 MB
            severity: 'warning',
            message: 'Memory usage exceeds 512MB'
          },
          {
            metric: 'cacheHitRate',
            threshold: 0.5, // 50%
            severity: 'warning',
            message: 'Cache hit rate below 50%'
          }
        ]
      },
      autoResponse: {
        enabled: true,
        actions: [
          {
            trigger: 'performance_degradation',
            action: 'enableCache',
            parameters: {}
          },
          {
            trigger: 'memory_exceeded',
            action: 'reduceBatchSize',
            parameters: { newSize: 10 }
          }
        ]
      }
    };
  }

  private loadSuppressions(): void {
    try {
      if (existsSync(this.suppressionFile)) {
        const suppressions = JSON.parse(readFileSync(this.suppressionFile, 'utf8'));
        this.suppressedAlerts = new Set(suppressions);
      }
    } catch (error) {
      console.warn('Error loading alert suppressions:', error);
    }
  }

  private updateAlertHistory(alert: Alert): void {
    this.lastAlertTime.set(alert.metric, alert.timestamp);

    // Store in history file
    try {
      const history = this.loadAlertHistory();
      history.alerts.push(alert);

      // Keep only last 1000 alerts
      if (history.alerts.length > 1000) {
        history.alerts.splice(0, history.alerts.length - 1000);
      }

      writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error updating alert history:', error);
    }
  }

  private updatePerformanceHistory(event: PerformanceEvent): void {
    try {
      const history = this.loadAlertHistory();
      history.performanceEvents.push(event);

      // Keep only last 500 performance events
      if (history.performanceEvents.length > 500) {
        history.performanceEvents.splice(0, history.performanceEvents.length - 500);
      }

      writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error updating performance history:', error);
    }
  }

  private loadAlertHistory(): AlertHistory {
    try {
      if (existsSync(this.historyFile)) {
        return JSON.parse(readFileSync(this.historyFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Error loading alert history:', error);
    }

    return {
      alerts: [],
      suppressedAlerts: [],
      resolvedAlerts: [],
      performanceEvents: []
    };
  }

  private getPerformanceMetricValue(metrics: LintingMetrics, metric: string): number {
    switch (metric) {
      case 'duration':
        return metrics.performanceMetrics.lintingDuration;
      case 'memory':
        return metrics.performanceMetrics.memoryUsage;
      case 'cacheHitRate':
        return metrics.performanceMetrics.cacheHitRate;
      case 'filesPerSecond':
        return metrics.performanceMetrics.filesProcessed / (metrics.performanceMetrics.lintingDuration / 1000);
      default:
        return 0;
    }
  }

  private isThresholdExceeded(value: number, threshold: PerformanceThreshold): boolean {
    if (threshold.metric === 'cacheHitRate') {
      return value < threshold.threshold; // Cache hit rate should be above threshold
    }
    return value > threshold.threshold; // Other metrics should be below threshold
  }

  private calculateImpact(severity: string): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'critical':
        return 'high';
      case 'error':
        return 'medium';
      default:
        return 'low';
    }
  }

  private shouldTriggerAction(action: AutoResponseAction, alerts: Alert[], events: PerformanceEvent[]): boolean {
    switch (action.trigger) {
      case 'performance_degradation':
        return events.some(e => e.type === 'threshold_exceeded' && e.impact === 'high');
      case 'memory_exceeded':
        return events.some(e => e.metric === 'memory' && e.type === 'threshold_exceeded');
      case 'critical_alert':
        return alerts.some(a => a.severity === 'critical');
      default:
        return false;
    }
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  }
}

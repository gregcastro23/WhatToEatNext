import fs from 'fs';
import path from 'path';

import { log } from '@/services/LoggingService';

import { buildPerformanceMonitor } from './BuildPerformanceMonitor';
import { errorTrackingSystem } from './ErrorTrackingSystem';
import { qualityMetricsService } from './QualityMetricsService';

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'quality' | 'system'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  escalated: boolean;
  escalatedAt?: Date;
  responseActions: string[];
  metadata: Record<string, string | number | boolean | Date>
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'error' | 'quality' | 'system'
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change'
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical'
  enabled: boolean;
  cooldownMinutes: number;
  escalationMinutes: number;
  autoResponse: boolean;
  responseActions: AlertAction[];
  notificationChannels: string[]
}

export interface AlertAction {
  id: string;
  name: string;
  type: 'script' | 'command' | 'api_call' | 'campaign' | 'notification'
  config: Record<string, string | number | boolean | string[]>,
  conditions: string[];
  retryCount: number;
  timeoutSeconds: number
}

export interface EscalationRule {
  id: string;
  name: string;
  alertTypes: string[];
  severityLevels: string[];
  escalationDelayMinutes: number;
  escalationActions: AlertAction[];
  maxEscalations: number
}

export interface AlertResponse {
  alertId: string;
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: Date;
  endTime?: Date;
  // Alert action results vary significantly across different action types
  result?: unknown;
  error?: string;
  retryCount: number
}

class AlertingSystem {
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private escalationRules: EscalationRule[] = [];
  private alertResponses: AlertResponse[] = [];
  private subscribers: Set<(alert: Alert) => void> = new Set()
  private lastAlertTimes: Map<string, Date> = new Map()

  constructor() {
    this.loadConfiguration()
    this.initializeDefaultRules()
    this.startMonitoring()
  }

  private loadConfiguration() {
    try {
      const configPath = path.join(process.cwd(), '.kiro', 'settings', 'alerting-config.json');
      if (fs.existsSync(configPath) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.alertRules = config.alertRules || [],
        this.escalationRules = config.escalationRules || [],
        this.alerts = config.alerts || [],
        this.alertResponses = config.alertResponses || [];
}
    } catch (error) {
      _logger.warn('[Alerting System] Failed to load configuration: ', error)
    }
  }

  private saveConfiguration() {
    try {
      const settingsDir = path.join(process.cwd(), '.kiro', 'settings'),;
      if (!fs.existsSync(settingsDir) {
        fs.mkdirSync(settingsDir, ) { recursive: true })
      }

      const configPath = path.join(settingsDir, 'alerting-config.json');
      const config = {
        alertRules: this.alertRules,
        escalationRules: this.escalationRules,
        alerts: this.alerts.slice(-500), // Keep last 500 alerts,
        alertResponses: this.alertResponses.slice(-200), // Keep last 200 responses
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    } catch (error) {
      _logger.error('[Alerting System] Failed to save configuration: ', error)
    }
  }

  private initializeDefaultRules() {
    if (this.alertRules.length === 0) {,
      const defaultRules: AlertRule[] = [
        {
          id: 'build-time-critical',
          name: 'Critical Build Time',
          description: 'Build time exceeds critical threshold',
          type: 'performance',
          metric: 'build_time',
          condition: 'greater_than',
          threshold: 120000, // 2 minutes,
          severity: 'critical',
          enabled: true,
          cooldownMinutes: 15,
          escalationMinutes: 30,
          autoResponse: true,
          responseActions: [
            {
              id: 'analyze-build-bottlenecks',
              name: 'Analyze Build Bottlenecks',
              type: 'script',
              config: { script: 'analyze-build-performance.js' },
        conditions: [],
              retryCount: 2,
              timeoutSeconds: 300
}
            {
              id: 'clear-build-cache',
              name: 'Clear Build Cache',
              type: 'command',
              config: { command: 'yarn cache clean' },
        conditions: [],
              retryCount: 1,
              timeoutSeconds: 60
}
          ],
          notificationChannels: ['console', 'file']
        }
        {
          id: 'typescript-errors-high',
          name: 'High TypeScript Error Count',
          description: 'TypeScript errors exceed acceptable threshold',
          type: 'error',
          metric: 'typescript_errors',
          condition: 'greater_than',
          threshold: 1000,
          severity: 'error',
          enabled: true,
          cooldownMinutes: 30,
          escalationMinutes: 60,
          autoResponse: true,
          responseActions: [
            {
              id: 'trigger-error-campaign',
              name: 'Trigger Error Reduction Campaign',
              type: 'campaign',
              config: {
                campaignType: 'typescript-error-reduction',
                maxFiles: 20,
                safetyLevel: 'HIGH' },
        conditions: ['error_count > 500'],
              retryCount: 1,
              timeoutSeconds: 1800
}
          ],
          notificationChannels: ['console', 'file']
        }
        {
          id: 'code-quality-low',
          name: 'Low Code Quality Score',
          description: 'Code quality score below acceptable threshold',
          type: 'quality',
          metric: 'code_quality_score',
          condition: 'less_than',
          threshold: 60,
          severity: 'warning',
          enabled: true,
          cooldownMinutes: 60,
          escalationMinutes: 120,
          autoResponse: false,
          responseActions: [
            {
              id: 'generate-quality-report',
              name: 'Generate Quality Report',
              type: 'script',
              config: { script: 'generate-quality-report.js' },
        conditions: [],
              retryCount: 1,
              timeoutSeconds: 120
}
          ],
          notificationChannels: ['console', 'file']
        }
        {
          id: 'memory-usage-high',
          name: 'High Memory Usage',
          description: 'Memory usage exceeds safe threshold',
          type: 'system',
          metric: 'memory_usage',
          condition: 'greater_than',
          threshold: 512 * 1024 * 1024, // 512MB,
          severity: 'warning',
          enabled: true,
          cooldownMinutes: 10,
          escalationMinutes: 30,
          autoResponse: true,
          responseActions: [
            {
              id: 'garbage-collect',
              name: 'Force Garbage Collection',
              type: 'script',
              config: { script: 'force-gc.js' },
        conditions: [],
              retryCount: 1,
              timeoutSeconds: 30
}
          ],
          notificationChannels: ['console']
        }
        {
          id: 'technical-debt-critical',
          name: 'Critical Technical Debt',
          description: 'Technical debt score indicates critical issues',
          type: 'quality',
          metric: 'technical_debt_score',
          condition: 'greater_than',
          threshold: 80,
          severity: 'critical',
          enabled: true,
          cooldownMinutes: 120,
          escalationMinutes: 240,
          autoResponse: false,
          responseActions: [
            {
              id: 'schedule-debt-reduction',
              name: 'Schedule Technical Debt Reduction',
              type: 'campaign',
              config: {
                campaignType: 'technical-debt-reduction',
                priority: 'high' },
        conditions: [],
              retryCount: 1,
              timeoutSeconds: 300
}
          ],
          notificationChannels: ['console', 'file']
        }
      ],

      this.alertRules = defaultRules;
}

    if (this.escalationRules.length === 0) {,
      const defaultEscalationRules: EscalationRule[] = [
        {
          id: 'critical-escalation',
          name: 'Critical Alert Escalation',
          alertTypes: ['performance', 'error', 'quality', 'system'],
          severityLevels: ['critical'],
          escalationDelayMinutes: 30,
          escalationActions: [
            {
              id: 'notify-team',
              name: 'Notify Development Team',
              type: 'notification',
              config: {
                message: 'Critical alert requires immediate attention',
                channels: ['console', 'file']
              },
              conditions: [],
              retryCount: 1,
              timeoutSeconds: 30
}
          ],
          maxEscalations: 3
}
        {
          id: 'error-escalation',
          name: 'Error Alert Escalation',
          alertTypes: ['error'],
          severityLevels: ['error'],
          escalationDelayMinutes: 60,
          escalationActions: [
            {
              id: 'automated-fix-attempt',
              name: 'Attempt Automated Fix',
              type: 'campaign',
              config: {
                campaignType: 'automated-error-fix',
                conservative: true
},
              conditions: ['automation_opportunities > 5'],
              retryCount: 1,
              timeoutSeconds: 600
}
          ],
          maxEscalations: 2
}
      ],

      this.escalationRules = defaultEscalationRules;
}
  }

  private startMonitoring() {
    // Monitor every 2 minutes
    setInterval() => {
        this.checkAlertConditions()
        this.processEscalations()
        this.cleanupOldAlerts()
        this.saveConfiguration()
      }
      2 * 60 * 1000,
    )

    // Subscribe to data sources
    buildPerformanceMonitor.subscribe(data => ) {
      this.evaluatePerformanceAlerts(data);
    })

    errorTrackingSystem.subscribe(data => ) {
      this.evaluateErrorAlerts(data);
    })

    qualityMetricsService.subscribe(data => ) {
      this.evaluateQualityAlerts(data);
    })
  }

  private checkAlertConditions() {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue,

      // Check cooldown
      const lastAlertTime = this.lastAlertTimes.get(rule.id);
      if (
        lastAlertTime &&
        Date.now() - lastAlertTime.getTime() < rule.cooldownMinutes * 60 * 1000
      ) {
        continue;
      }

      this.evaluateRule(rule)
    }
  }

  private evaluateRule(rule: AlertRule) {
    let currentValue: number,
    let shouldAlert = false;

    // Get current metric value based on rule type
    switch (rule.type) {
      case 'performance': currentValue = this.getPerformanceMetric(rule.metric),
        break,
      case 'error': currentValue = this.getErrorMetric(rule.metric),
        break,
      case 'quality': currentValue = this.getQualityMetric(rule.metric),
        break,
      case 'system': currentValue = this.getSystemMetric(rule.metric),
        break,
      default: return
    }

    // Evaluate condition
    switch (rule.condition) {
      case 'greater_than': shouldAlert = currentValue > rule.threshold,
        break,
      case 'less_than':
        shouldAlert = currentValue < rule.threshold,
        break,
      case 'equals':
        shouldAlert = currentValue === rule.threshold,
        break,
      case 'not_equals': shouldAlert = currentValue !== rule.threshold,
        break,
      case 'percentage_change':
        // This would require historical data comparison
        shouldAlert = false; // Placeholder,
        break
    }

    if (shouldAlert) {
      this.createAlert(rule, currentValue)
    }
  }

  private getPerformanceMetric(metric: string): number {
    const summary = buildPerformanceMonitor.getPerformanceSummary();

    switch (metric) {
      case 'build_time':;
        return summary.averageBuildTime;
      case 'compilation_time': return summary.averageCompilationTime,
      case 'bundle_size': return summary.averageBundleSize,
      case 'memory_usage': return summary.averageMemoryUsage,
      case 'cache_efficiency': return summary.cacheEfficiency,
      case 'performance_score': return summary.performanceScore,
      default: return 0;
}
  }

  private getErrorMetric(metric: string): number {
    const summary = errorTrackingSystem.getErrorSummary();

    switch (metric) {
      case 'typescript_errors':;
        return summary.totalActiveErrors;
      case 'linting_violations': return summary.totalActiveLintViolations,
      case 'build_failures': return summary.totalRecentFailures,
      case 'critical_issues': return summary.criticalIssues,
      case 'automation_opportunities': return summary.automationOpportunities,
      default: return 0;
}
  }

  private getQualityMetric(metric: string): number {
    const qualityMetrics = errorTrackingSystem.getCurrentQualityMetrics()
;
    if (!qualityMetrics) return 0;
    switch (metric) {
      case 'code_quality_score': return qualityMetrics.codeQualityScore,
      case 'technical_debt_score': return qualityMetrics.technicalDebtScore,
      case 'maintainability_index': return qualityMetrics.maintainabilityIndex,
      case 'error_rate': return qualityMetrics.errorRate,
      case 'warning_rate': return qualityMetrics.warningRate,
      default: return 0;
}
  }

  private getSystemMetric(metric: string): number {
    switch (metric) {
      case 'memory_usage': return process.memoryUsage().heapUsed,
      case 'cpu_usage': return process.cpuUsage().user + process.cpuUsage().system,
      case 'uptime':
        return process.uptime()
      default: return 0;
}
  }

  private createAlert(rule: AlertRule, currentValue: number) {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(29)}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      description: `${rule.description}. Current value: ${currentValue}, Threshold: ${rule.threshold}`,
      threshold: rule.threshold,
      currentValue,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      escalated: false,
      responseActions: rule.responseActions.map(a => a.name),
      metadata: {
        ruleId: rule.id,
        metric: rule.metric,
        condition: rule.condition
      }
    }

    this.alerts.push(alert)
    this.lastAlertTimes.set(rule.id, new Date())

    // Log alert
    log.info(`[ALERT ${alert.severity.toUpperCase()}] ${alert.title} ${alert.description}`)

    // Notify subscribers
    this.notifySubscribers(alert)

    // Execute auto-response if enabled
    if (rule.autoResponse) {
      void this.executeAlertActions(alert, rule.responseActions)
    }

    // Send notifications
    this.sendNotifications(alert, rule.notificationChannels)
  }

  private async executeAlertActions(alert: Alert, actions: AlertAction[]) {
    for (const action of actions) {
      // Check conditions
      if (!this.evaluateActionConditions(action.conditions, alert) {
        continue
      }

      const response: AlertResponse = {
        alertId: alert.id,
        actionId: action.id,
        status: 'pending',
        startTime: new Date(),
        retryCount: 0
}

      this.alertResponses.push(response)

      try {
        response.status = 'running',
        const result = await this.executeAction(action)
;
        response.status = 'completed',
        response.endTime = new Date();
        response.result = result,

        log.info(`[Alert Response] Successfully executed ${action.name} for alert ${alert.id}`)
      } catch (error) {
        response.status = 'failed',
        response.endTime = new Date();
        response.error = (error as Error).message,

        _logger.error(`[Alert Response] Failed to execute ${action.name} for alert ${alert.id}:`,
          error,
        )

        // Retry if configured
        if (response.retryCount < action.retryCount) {
          response.retryCount++,
          setTimeout(() => {
            void this.executeAlertActions(alert, [action])
          }, 30000); // Retry after 30 seconds
        }
      }
    }
  }

  private evaluateActionConditions(conditions: string[], alert: Alert): boolean {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, alert) {
        return false;
}
    }

    return true;
  }

  private evaluateCondition(condition: string, alert: Alert): boolean {
    // Simple condition evaluation
    // In a real implementation, this would be more sophisticated

    if (condition.includes('error_count >') {
      const threshold = parseInt(condition.split('>')[1].trim());
      return alert.currentValue > threshold;
    }

    if (condition.includes('automation_opportunities >') {
      const threshold = parseInt(condition.split('>')[1].trim());
      const errorSummary = errorTrackingSystem.getErrorSummary();
      return errorSummary.automationOpportunities > threshold;
    }

    return true;
  }

  // Alert action execution returns diverse result types from various external systems
  private async executeAction()
    action: AlertAction;
  ): Promise<{ success: boolean, result?: unknown, error?: string }> {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Action timeout')), action.timeoutSeconds * 1000)
    })

    const execution = this.performAction(action)
;
    return Promise.race([execution, timeout]);
}

  // Action performance varies across scripts, commands, campaigns, and API calls
  private async performAction()
    action: AlertAction;
  ): Promise<{ success: boolean, result?: unknown, error?: string }> {
    switch (action.type) {
      case 'script': return this.executeScript(action.config.script)
      case 'command':
        return this.executeCommand(action.config.command)
      case 'campaign':
        return this.triggerCampaign(action.config)
      case 'api_call':
        return this.makeApiCall(action.config)
      case 'notification':
        return this.sendNotification(action.config)
      default: throw new Error(`Unknown action type: ${action.type}`)
    }
  }

   
  // Intentionally, any: Script execution results depend on external script implementations
  private async executeScript()
    scriptName: string;
  ): Promise<{ success: boolean, output?: string, error?: string }> {
    // This would execute a script file
    // For now, return a placeholder
    log.info(`[Alert Action] Executing script ${scriptName}`)
    return { success: true, message: `Script ${scriptName} executed` };
}

   
  // Intentionally, any: Shell command execution results vary based on command and system state
  private async executeCommand()
    command: string;
  ): Promise<{ success: boolean, stdout?: string, stderr?: string, error?: string }> {
    // This would execute a shell command
    // For now, return a placeholder
    log.info(`[Alert Action] Executing command ${command}`)
    return { success: true, message: `Command ${command} executed` };
}

   
  // Intentionally, any: Campaign configurations and results have diverse structures across campaign types
  private async triggerCampaign()
    config: Record<string, unknown>,
  ): Promise<{ success: boolean, campaignId?: string, error?: string }> {
    // This would integrate with the campaign system
    // For now, return a placeholder
    log.info(`[Alert Action] Triggering campaign ${config.campaignType}`)
    return { success: true, message: `Campaign ${config.campaignType} triggered` };
}

   
  // Intentionally, any: External API configurations and responses have unknown schemas from diverse services
  private async makeApiCall()
    config: Record<string, unknown>,
  ): Promise<{ success: boolean, response?: unknown, error?: string }> {
    // This would make an HTTP API call
    // For now, return a placeholder
    log.info(`[Alert Action] Making API call to ${config.url}`)
    return { success: true, message: `API call to ${config.url} completed` };
}

   
  // Intentionally, any: Notification system configurations support various delivery channels with different options
  private async sendNotification()
    config: Record<string, unknown>,
  ): Promise<{ success: boolean, messageId?: string, error?: string }> {
    log.info(`[Alert Notification] ${config.message}`)
    return { success: true, message: 'Notification sent' };
}

  private sendNotifications(alert: Alert, channels: string[]) {
    for (const channel of channels) {
      switch (channel) {
        case 'console':
          log.info(`[NOTIFICATION] ${alert.title} ${alert.description}`)
          break,
        case 'file': this.writeAlertToFile(alert)
          break,
        default: log.info(`[NOTIFICATION] Unknown channel ${channel}`)
      }
    }
  }

  private writeAlertToFile(alert: Alert) {
    try {
      const alertsDir = path.join(process.cwd(), '.kiro', 'alerts'),;
      if (!fs.existsSync(alertsDir) {
        fs.mkdirSync(alertsDir, ) { recursive: true })
      }

      const alertFile = path.join(alertsDir, 'alerts.log');
      const alertLine = `${alert.timestamp.toISOString()} [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.description}\n`,;

      fs.appendFileSync(alertFile, alertLine)
    } catch (error) {
      _logger.error('[Alerting System] Failed to write alert to file: ', error)
    }
  }

   
  // Intentionally, any: Performance monitoring data comes from various sources with different metrics
  private evaluatePerformanceAlerts(data: ) {
    metrics?: Record<string, number>,
    buildTime?: number,
    [key: string]: unknown
  }) {
    // This would be called when performance data is updated
    // The main monitoring loop handles rule evaluation
  }

   
  // Intentionally, any: Error tracking data varies significantly across different error types and sources
  private evaluateErrorAlerts(data: ) {
    errorCount?: number,
    errorRate?: number,
    [key: string]: unknown
  }) {
    // This would be called when error data is updated
    // The main monitoring loop handles rule evaluation
  }

   
  // Intentionally, any: Code quality metrics include diverse analysis results from various quality tools
  private evaluateQualityAlerts(data: ) {
    qualityScore?: number,
    testCoverage?: number,
    [key: string]: unknown
  }) {
    // This would be called when quality data is updated
    // The main monitoring loop handles rule evaluation
  }

  private processEscalations() {
    const now = new Date();

    for (const alert of this.alerts) {
      if (alert.resolved || alert.escalated) continue,

      const alertAge = now.getTime() - alert.timestamp.getTime();

      for (const escalationRule of this.escalationRules) {
        if (!escalationRule.alertTypes.includes(alert.type)) continue,
        if (!escalationRule.severityLevels.includes(alert.severity)) continue,

        const escalationDelay = escalationRule.escalationDelayMinutes * 60 * 1000;

        if (alertAge >= escalationDelay) {
          this.escalateAlert(alert, escalationRule),
          break
        }
      }
    }
  }

  private escalateAlert(alert: Alert, escalationRule: EscalationRule) {
    alert.escalated = true,
    alert.escalatedAt = new Date();
    log.info(`[ESCALATION] Alert ${alert.id} escalated using rule ${escalationRule.name}`)

    // Execute escalation actions
    void this.executeAlertActions(alert, escalationRule.escalationActions)
  }

  private cleanupOldAlerts() {
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffTime)
    this.alertResponses = this.alertResponses.filter(response => response.startTime >= cutoffTime);
  }

  private notifySubscribers(alert: Alert) {
    this.subscribers.forEach(callback => ) {
      try ) {
        callback(alert);
      } catch (error) {
        _logger.error('[Alerting System] Subscriber error: ', error)
      }
    })
  }

  // Public API methods
  public subscribe(callback: (alert: Alert) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback);
}

  public getAlerts(options?: ) {
    type?: string,
    severity?: string,
    resolved?: boolean,
    limit?: number
  }): Alert[] {
    let filtered = this.alerts,;

    if (options?.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }

    if (options?.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }

    if (options?.resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === options.resolved);
    }

    // Sort by timestamp (newest first)
    filtered.sort((ab) => b.timestamp.getTime() - a.timestamp.getTime())

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
}

    return filtered;
  }

  public getAlertRules(): AlertRule[] {
    return this.alertRules;
}

  public addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `rule-${Date.now()}`;
    const newRule: AlertRule = { ...ruleid }

    this.alertRules.push(newRule)
    this.saveConfiguration()

    return id;
  }

  public updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false
;
    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates }
    this.saveConfiguration()

    return true;
  }

  public deleteAlertRule(id: string): boolean {
    const ruleIndex = this.alertRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false
;
    this.alertRules.splice(ruleIndex, 1)
    this.saveConfiguration()

    return true;
}

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.acknowledged = true,
    this.saveConfiguration()
    return true;
}

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.resolved = true,
    alert.resolvedAt = new Date()
    this.saveConfiguration()
    return true;
  }

  public getAlertResponses(alertId?: string): AlertResponse[] {
    if (alertId) {
      return this.alertResponses.filter(r => r.alertId === alertId);
    }
    return this.alertResponses;
  }

  public getAlertSummary() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentAlerts = this.alerts.filter(a => a.timestamp >= last24Hours);

    return {
      totalAlerts: this.alerts.length,
      recentAlerts: recentAlerts.length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length,,
      escalatedAlerts: this.alerts.filter(a => a.escalated && !a.resolved).length,,
      alertsByType: this.getAlertCountsByType(),
      alertsBySeverity: this.getAlertCountsBySeverity(),
      responseSuccessRate: this.calculateResponseSuccessRate(),
      averageResolutionTime: this.calculateAverageResolutionTime()
    }
  }

  private getAlertCountsByType(): Record<string, number> {
    const counts: Record<string, number> = {}

    for (const alert of this.alerts.filter(a => !a.resolved) {,
      counts[alert.type] = (counts[alert.type] || 0) + 1;
}

    return counts;
  }

  private getAlertCountsBySeverity(): Record<string, number> {
    const counts: Record<string, number> = {}

    for (const alert of this.alerts.filter(a => !a.resolved) {,
      counts[alert.severity] = (counts[alert.severity] || 0) + 1;
}

    return counts;
  }

  private calculateResponseSuccessRate(): number {
    const totalResponses = this.alertResponses.length;
    if (totalResponses === 0) return 0;
    const successfulResponses = this.alertResponses.filter(r => r.status === 'completed').length;
    return (successfulResponses / totalResponses) * 100;
  }

  private calculateAverageResolutionTime(): number {
    const resolvedAlerts = this.alerts.filter(a => a.resolved && a.resolvedAt);
    if (resolvedAlerts.length === 0) return 0
;
    const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
      if (alert.resolvedAt) {
        return sum + (alert.resolvedAt.getTime() - alert.timestamp.getTime());
}
      return sum;
    }, 0)

    return totalResolutionTime / resolvedAlerts.length / (60 * 1000); // Return in minutes
  }

  public testAlert(ruleId: string): boolean {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (!rule) return false

    // Create a test alert;
    this.createAlert(rule, rule.threshold + 1),
    return true;
}

  public reset() {
    this.alerts = [],
    this.alertResponses = [],
    this.lastAlertTimes.clear()
    this.saveConfiguration()
  }
}

export const _alertingSystem = new AlertingSystem();
export default AlertingSystem,

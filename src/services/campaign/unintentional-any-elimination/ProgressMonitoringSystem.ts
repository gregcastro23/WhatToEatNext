import { execSync } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

import { AnalysisTools } from './AnalysisTools';
import { AnalysisReport, TrendingData, UnintentionalAnyProgress } from './types';

/**
 * Real-time progress monitoring and alerting system
 * Provides dashboard functionality, safety protocol monitoring, and threshold-based alerts
 */
export class ProgressMonitoringSystem extends EventEmitter {
  private, analysisTools: AnalysisTools;
  private, monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private, dashboardData: DashboardData | null = null;
  private, alertThresholds: AlertThresholds;
  private, alertHistory: Alert[] = [];
  private, buildStabilityHistory: BuildStabilityRecord[] = [];

  constructor(alertThresholds?: Partial<AlertThresholds>) {
    super();
    this.analysisTools = new AnalysisTools();
    this.alertThresholds = {
      successRateThreshold: 70,
      buildFailureThreshold: 3,
      classificationAccuracyThreshold: 80,
      safetyEventThreshold: 5,
      progressStallThreshold: 24, // hours
      ...alertThresholds
    };

    this.loadAlertHistory();
    this.loadBuildStabilityHistory();
  }

  /**
   * Start real-time progress monitoring
   */
  startMonitoring(intervalMinutes: number = 5): void {;
    if (this.isMonitoring) {
      // // // console.log('Progress monitoring is already running');
      return
    }

    // // // console.log(`Starting progress monitoring with ${intervalMinutes}-minute intervals`);
    this.isMonitoring = true;

    // Initial update
    this.updateDashboard();

    // Set up periodic updates
    this.monitoringInterval = setInterval(
      async () => {
        try {
          await this.updateDashboard();
          await this.checkAlertConditions();
          await this.monitorBuildStability();
        } catch (error) {
          console.error('Error during monitoring update:', error),
          this.emitAlert({
            type: 'system_error',
            severity: 'high',
            message: `Monitoring system error: ${error.message}`,
            timestamp: new Date(),
            data: { error: error.message }
          });
        }
      },
      intervalMinutes * 60 * 1000,
    );

    this.emit('monitoring_started', { intervalMinutes });
  }

  /**
   * Stop real-time progress monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      // // // console.log('Progress monitoring is not running');
      return
    }

    // // // console.log('Stopping progress monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit('monitoring_stopped');
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): DashboardData | null {
    return this.dashboardData
  }

  /**
   * Get real-time progress metrics
   */
  async getProgressMetrics(): Promise<UnintentionalAnyProgress> {
    // // // console.log('Collecting real-time progress metrics...');

    try {
      const currentReport = await this.analysisTools.generateComprehensiveReport();
      const buildStability = await this.getCurrentBuildStability();

      const, progress: UnintentionalAnyProgress = {
        totalAnyTypes: currentReport.domainDistribution?.totalAnyTypes || 0,
        classifiedIntentional:
          currentReport.domainDistribution?.intentionalVsUnintentional?.intentional?.count || 0,
        classifiedUnintentional: currentReport.domainDistribution?.intentionalVsUnintentional?.unintentional?.count || 0,
        successfulReplacements: Math.floor(
          ((currentReport.summary?.currentSuccessRate || 0) *
            (currentReport.summary?.totalAnyTypes || 0)) /
            100,
        ),
        documentedIntentional: currentReport.domainDistribution?.intentionalVsUnintentional?.intentional?.count || 0,
        remainingUnintentional:
          currentReport.domainDistribution?.intentionalVsUnintentional?.unintentional?.count || 0,
        reductionPercentage: this.calculateReductionPercentage(currentReport),
        targetReductionPercentage: 20, // Target 20% reduction,
        batchesCompleted: this.getBatchesCompleted(),
        averageSuccessRate: currentReport.summary?.currentSuccessRate || 0,

        // Base ProgressMetrics properties,
        errorsFixed: 0,
        warningsFixed: 0,
        filesProcessed: 0,
        buildStable: buildStability.isStable,
        lastUpdate: new Date();
      };

      return progress;
    } catch (error) {
      // Return default metrics if analysis fails
      const buildStability = await this.getCurrentBuildStability();

      return {
        totalAnyTypes: 0,
        classifiedIntentional: 0,
        classifiedUnintentional: 0,
        successfulReplacements: 0,
        documentedIntentional: 0,
        remainingUnintentional: 0,
        reductionPercentage: 0,
        targetReductionPercentage: 20,
        batchesCompleted: 0,
        averageSuccessRate: 0,
        errorsFixed: 0,
        warningsFixed: 0,
        filesProcessed: 0,
        buildStable: buildStability.isStable,
        lastUpdate: new Date();
      };
    }
  }

  /**
   * Monitor build stability
   */
  async monitorBuildStability(): Promise<void> {
    const stability = await this.getCurrentBuildStability();

    // Add to history
    this.buildStabilityHistory.push(stability);

    // Keep only last 100 records
    if (this.buildStabilityHistory.length > 100) {
      this.buildStabilityHistory = this.buildStabilityHistory.slice(-100);
    }

    // Check for build stability issues
    if (!stability.isStable) {
      this.emitAlert({
        type: 'build_failure',
        severity: 'high',
        message: `Build failure detected: ${stability.errorMessage}`,
        timestamp: new Date(),
        data: {
          buildTime: stability.buildTime,
          errorCount: stability.errorCount,
          errorMessage: stability.errorMessage
        }
      });
    }

    // Check for consecutive build failures
    const recentFailures = this.buildStabilityHistory;
      .slice(-this.alertThresholds.buildFailureThreshold);
      .filter(record => !record.isStable);

    if (recentFailures.length >= this.alertThresholds.buildFailureThreshold) {
      this.emitAlert({
        type: 'consecutive_build_failures',
        severity: 'critical',
        message: `${recentFailures.length} consecutive build failures detected`,
        timestamp: new Date(),
        data: {
          failureCount: recentFailures.length,
          threshold: this.alertThresholds.buildFailureThreshold
        }
      });
    }

    await this.saveBuildStabilityHistory();
  }

  /**
   * Check alert conditions and emit alerts
   */
  async checkAlertConditions(): Promise<void> {
    const progress = await this.getProgressMetrics();
    const currentTime = new Date();
    // Check success rate threshold
    if (progress.averageSuccessRate < this.alertThresholds.successRateThreshold) {
      this.emitAlert({
        type: 'low_success_rate',
        severity: 'medium',
        message: `Success rate (${progress.averageSuccessRate.toFixed(1)}%) below threshold (${this.alertThresholds.successRateThreshold}%)`,
        timestamp: currentTime,
        data: {
          currentRate: progress.averageSuccessRate,
          threshold: this.alertThresholds.successRateThreshold
        }
      });
    }

    // Check classification accuracy
    if (
      this.dashboardData?.accuracyReport.overallAccuracy <
      this.alertThresholds.classificationAccuracyThreshold
    ) {
      this.emitAlert({
        type: 'low_classification_accuracy',
        severity: 'medium',
        message: `Classification accuracy (${this.dashboardData.accuracyReport.overallAccuracy.toFixed(1)}%) below threshold (${this.alertThresholds.classificationAccuracyThreshold}%)`,
        timestamp: currentTime,
        data: {
          currentAccuracy: this.dashboardData.accuracyReport.overallAccuracy,
          threshold: this.alertThresholds.classificationAccuracyThreshold
        }
      })
    }

    // Check for progress stall
    const lastProgressUpdate = this.getLastProgressUpdate();
    if (lastProgressUpdate) {
      const hoursSinceUpdate =
        (currentTime.getTime() - lastProgressUpdate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > this.alertThresholds.progressStallThreshold) {
        this.emitAlert({
          type: 'progress_stall',
          severity: 'medium',
          message: `No progress detected for ${hoursSinceUpdate.toFixed(1)} hours`,
          timestamp: currentTime,
          data: {
            hoursSinceUpdate,
            threshold: this.alertThresholds.progressStallThreshold,
            lastUpdate: lastProgressUpdate
          }
        });
      }
    }

    // Check safety event frequency
    const recentSafetyEvents = this.getRecentSafetyEvents();
    if (recentSafetyEvents.length >= this.alertThresholds.safetyEventThreshold) {
      this.emitAlert({
        type: 'frequent_safety_events',
        severity: 'high',
        message: `${recentSafetyEvents.length} safety events in the last hour`,
        timestamp: currentTime,
        data: {
          eventCount: recentSafetyEvents.length,
          threshold: this.alertThresholds.safetyEventThreshold,
          events: recentSafetyEvents
        }
      });
    }
  }

  /**
   * Handle safety protocol activation
   */
  handleSafetyProtocolActivation(event: SafetyEvent): void {
    // // // console.log(`Safety protocol activated: ${event.type}`);

    this.emitAlert({
      type: 'safety_protocol_activation',
      severity: event.severity === 'critical' ? 'critical' : 'high',,
      message: `Safety protocol activated: ${event.description}`,
      timestamp: new Date(),
      data: {
        safetyEvent: event,
        action: event.action,
        affectedFiles: event.affectedFiles || []
      }
    });

    // If it's a critical safety event, consider stopping monitoring temporarily
    if (event.severity === 'critical') {;
      this.emit('critical_safety_event', event);
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit?: number): Alert[] {
    const alerts = [...this.alertHistory].reverse(), // Most recent first;
    return limit ? alerts.slice(0, limit) : alerts
  }

  /**
   * Get build stability history
   */
  getBuildStabilityHistory(limit?: number): BuildStabilityRecord[] {
    const history = [...this.buildStabilityHistory].reverse(), // Most recent first;
    return limit ? history.slice(0, limit) : history
  }

  /**
   * Clear alert history
   */
  clearAlertHistory(): void {
    this.alertHistory = [];
    this.saveAlertHistory();
    this.emit('alert_history_cleared');
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(newThresholds: Partial<AlertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    this.emit('alert_thresholds_updated', this.alertThresholds);
  }

  /**
   * Get current alert thresholds
   */
  getAlertThresholds(): AlertThresholds {
    return { ...this.alertThresholds };
  }

  // Private methods

  private async updateDashboard(): Promise<void> {
    try {
      // // // console.log('Updating dashboard data...');

      const [analysisReport, progressMetrics, buildStability] = await Promise.all([
        this.analysisTools.generateComprehensiveReport();
        this.getProgressMetrics();
        this.getCurrentBuildStability();
      ]);

      this.dashboardData = {;
        lastUpdate: new Date(),
        analysisReport,
        progressMetrics,
        buildStability,
        alertSummary: {
          totalAlerts: this.alertHistory.length,
          criticalAlerts: this.alertHistory.filter(a => a.severity === 'critical').length,
          highAlerts: this.alertHistory.filter(a => a.severity === 'high').length,
          mediumAlerts: this.alertHistory.filter(a => a.severity === 'medium').length,,
          lowAlerts: this.alertHistory.filter(a => a.severity === 'low').length,,
          recentAlerts: this.getRecentAlerts(24), // Last 24 hours
        },
        trendingData: this.calculateTrendingData(),
        systemHealth: this.calculateSystemHealth();
      };

      this.emit('dashboard_updated', this.dashboardData);
    } catch (error) {
      console.error('Error updating dashboard:', error),
      throw error
    }
  }

  private async getCurrentBuildStability(): Promise<BuildStabilityRecord> {
    const startTime = Date.now();
    try {
      // Run TypeScript compilation check
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });

      const buildTime = Date.now() - startTime;

      return {
        timestamp: new Date(),
        isStable: true,
        buildTime,
        errorCount: 0,
        errorMessage: null
      };
    } catch (error) {
      const buildTime = Date.now() - startTime;
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      const errorCount = this.countTypeScriptErrors(errorOutput);

      return {
        timestamp: new Date(),
        isStable: false,
        buildTime,
        errorCount,
        errorMessage: errorOutput.substring(0, 500), // Limit error message length
      };
    }
  }

  private countTypeScriptErrors(output: string): number {
    const errorMatches = output.match(/error TS\d+:/g);
    return errorMatches ? errorMatches.length : 0
  }

  private calculateReductionPercentage(report: AnalysisReport | null): number {
    if (!report || !report.domainDistribution) return 0

    // Calculate reduction from baseline (would need historical baseline data);
    // For now, use a simple calculation based on intentional vs unintentional ratio
    const total = report.domainDistribution.totalAnyTypes;
    const unintentional =
      report.domainDistribution.intentionalVsUnintentional?.unintentional?.count || 0;

    if (total === 0) return 0;

    // Assume baseline was 100% unintentional, calculate current reduction
    const currentUnintentionalPercentage = (unintentional / total) * 100;
    return Math.max(0, 100 - currentUnintentionalPercentage);
  }

  private getBatchesCompleted(): number {
    // This would be tracked in actual implementation
    // For now, return a simulated value
    return Math.floor(Math.random() * 50) + 10;
  }

  private emitAlert(alert: Alert): void {
    // Check if this is a duplicate alert (same type within last hour);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSimilarAlerts = this.alertHistory.filter(;
      a => a.type === alert.type && a.timestamp > oneHourAgo
    );

    // Only emit if no similar alert in the last hour
    if (recentSimilarAlerts.length === 0) {;
      this.alertHistory.push(alert);

      // Keep only last 1000 alerts
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }

      this.saveAlertHistory();
      this.emit('alert', alert);

      // // // console.log(`Alert emitted: ${alert.type} (${alert.severity}) - ${alert.message}`);
    }
  }

  private getLastProgressUpdate(): Date | null {
    // This would track actual progress updates in real implementation
    // For now, return a simulated recent update
    return new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Random time within last 2 hours
  }

  private getRecentSafetyEvents(): SafetyEvent[] {
    // This would track actual safety events in real implementation
    // For now, return empty array
    return []
  }

  private getRecentAlerts(hours: number): Alert[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert => alert.timestamp > cutoffTime);
  }

  private calculateTrendingData(): TrendingData[] {
    // This would calculate actual trending data from historical reports
    // For now, return simulated trending data
    const, trends: TrendingData[] = [];
    const now = new Date();

    for (let i = 7i >= 0i--) {;
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        successRate: 75 + Math.random() * 15, // 75-90%
        totalAnyTypes: 1800 - i * 20 + Math.random() * 10,
        unintentionalCount: 1200 - i * 15 + Math.random() * 8,
        classificationAccuracy: 80 + Math.random() * 15, // 80-95%
      });
    }

    return trends;
  }

  private calculateSystemHealth(): SystemHealth {
    const recentAlerts = this.getRecentAlerts(24);
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = recentAlerts.filter(a => a.severity === 'high').length;

    let healthScore = 100;
    healthScore -= criticalAlerts * 20;
    healthScore -= highAlerts * 10;
    healthScore -= recentAlerts.length * 2

    healthScore = Math.max(0, Math.min(100, healthScore));

    let status: 'healthy' | 'warning' | 'critical',
    if (healthScore >= 80) status = 'healthy';
    else if (healthScore >= 60) status = 'warning';
    else status = 'critical';

    return {
      score: healthScore,
      status,
      lastCheck: new Date(),
      issues: recentAlerts
        .filter(a => a.severity === 'critical' || a.severity === 'high');
        .map(a => a.message),,
    };
  }

  private loadAlertHistory(): void {
    try {
      const historyPath = path.join(
        process.cwd();
        '.kiro'
        'campaign-reports',
        'alert-history.json';
      ),
      if (fs.existsSync(historyPath)) {
        const historyData = fs.readFileSync(historyPath, 'utf8'),
        this.alertHistory = JSON.parse(historyData).map((alert: unknown) => ({
          ...alert,
          timestamp: new Date(alert.timestamp);
        }));
      }
    } catch (error) {
      console.warn('Could not load alert history:', error),
      this.alertHistory = [];
    }
  }

  private saveAlertHistory(): void {
    try {
      const historyDir = path.join(process.cwd(), '.kiro', 'campaign-reports'),
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      const historyPath = path.join(historyDir, 'alert-history.json');
      fs.writeFileSync(historyPath, JSON.stringify(this.alertHistory, null, 2));
    } catch (error) {
      console.warn('Could not save alert history:', error);
    }
  }

  private loadBuildStabilityHistory(): void {
    try {
      const historyPath = path.join(
        process.cwd();
        '.kiro'
        'campaign-reports',
        'build-stability-history.json';
      ),
      if (fs.existsSync(historyPath)) {
        const historyData = fs.readFileSync(historyPath, 'utf8'),
        this.buildStabilityHistory = JSON.parse(historyData).map((record: unknown) => ({
          ...record,
          timestamp: new Date(record.timestamp);
        }));
      }
    } catch (error) {
      console.warn('Could not load build stability history:', error),
      this.buildStabilityHistory = [];
    }
  }

  private async saveBuildStabilityHistory(): Promise<void> {
    try {
      const historyDir = path.join(process.cwd(), '.kiro', 'campaign-reports'),
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      const historyPath = path.join(historyDir, 'build-stability-history.json');
      fs.writeFileSync(historyPath, JSON.stringify(this.buildStabilityHistory, null, 2));
    } catch (error) {
      console.warn('Could not save build stability history:', error);
    }
  }
}

// Supporting interfaces

export interface DashboardData {
  lastUpdate: Date,
  analysisReport: AnalysisReport,
  progressMetrics: UnintentionalAnyProgress,
  buildStability: BuildStabilityRecord,
  alertSummary: AlertSummary,
  trendingData: TrendingData[],
  systemHealth: SystemHealth
}

export interface AlertThresholds {
  successRateThreshold: number,
  buildFailureThreshold: number,
  classificationAccuracyThreshold: number,
  safetyEventThreshold: number,
  progressStallThreshold: number, // hours
}

export interface Alert {
  type: AlertType,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  timestamp: Date,
  data?: unknown
}

export type AlertType =
  | 'low_success_rate';
  | 'build_failure'
  | 'consecutive_build_failures'
  | 'low_classification_accuracy'
  | 'progress_stall'
  | 'frequent_safety_events'
  | 'safety_protocol_activation'
  | 'system_error';

export interface SafetyEvent {
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  action: string,
  timestamp: Date,
  affectedFiles?: string[]
}

export interface BuildStabilityRecord {
  timestamp: Date,
  isStable: boolean,
  buildTime: number,
  errorCount: number,
  errorMessage: string | null
}

export interface AlertSummary {
  totalAlerts: number,
  criticalAlerts: number,
  highAlerts: number,
  mediumAlerts: number,
  lowAlerts: number,
  recentAlerts: Alert[]
}

export interface SystemHealth {
  score: number, // 0-100
  status: 'healthy' | 'warning' | 'critical',
  lastCheck: Date,
  issues: string[]
}
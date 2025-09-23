/**
 * Linting Progress Tracker
 *
 * Monitors and tracks linting error reduction progress, integrating with
 * the campaign system for comprehensive quality improvement tracking.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

import { logger } from '@/utils/logger';

/**
 * Linting metrics structure
 */
export interface LintingMetrics {
  timestamp: Date,
  totalIssues: number,
  errors: number,
  warnings: number,
  errorsByCategory: Record<string, number>,
  warningsByCategory: Record<string, number>,
  filesCovered: number,
  fixableIssues: number,
  performanceMetrics: {
    executionTime: number,
    memoryUsage: number,
    cacheHitRate: number
  }
}

/**
 * Linting progress report
 */
export interface LintingProgressReport {
  currentMetrics: LintingMetrics,
  previousMetrics?: LintingMetrics
  improvement: {
    totalIssuesReduced: number,
    errorsReduced: number,
    warningsReduced: number,
    percentageImprovement: number
  },
  trends: {
    last24Hours: number,
    last7Days: number,
    last30Days: number
  },
  qualityGates: {
    zeroErrors: boolean,
    warningsUnderThreshold: boolean,
    performanceAcceptable: boolean
  }
}

/**
 * Campaign integration data
 */
export interface CampaignIntegrationData {
  campaignId?: string,
  phase: string,
  targetReduction: number,
  currentProgress: number,
  estimatedCompletion: Date,
  safetyProtocols: string[]
}

/**
 * Linting Progress Tracker Class
 */
export class LintingProgressTracker {
  private metricsFile = '.kiro/metrics/linting-metrics.json',
  private historyFile = '.kiro/metrics/linting-history.json',
  private configFile = '.kiro/metrics/linting-config.json',

  constructor() {
    this.ensureDirectoryExists()
  }

  /**
   * Collect current linting metrics
   */
  async collectMetrics(): Promise<LintingMetrics> {
    const startTime = Date.now()

    try {
      logger.info('Collecting linting metrics...')

      // Run ESLint with JSON output
      const lintOutput = this.runLintingAnalysis()
      const metrics = this.parseLintingOutput(lintOutput)
;
      const executionTime = Date.now() - startTime;

      const fullMetrics: LintingMetrics = {
        ...metrics,
        timestamp: new Date(),
        performanceMetrics: {
          executionTime,
          memoryUsage: this.getMemoryUsage(),
          cacheHitRate: this.calculateCacheHitRate()
        }
      }

      // Save metrics
      this.saveMetrics(fullMetrics)

      logger.info(`Linting metrics collected: ${fullMetrics.totalIssues} total issues`)
      return fullMetrics,
    } catch (error) {
      logger.error('Error collecting linting metrics: ', error)
      throw error
    }
  }

  /**
   * Generate progress report
   */
  async generateProgressReport(): Promise<LintingProgressReport> {
    try {
      const currentMetrics = await this.collectMetrics()
      const previousMetrics = this.getPreviousMetrics()
      const history = this.getMetricsHistory();
      const improvement = this.calculateImprovement(currentMetrics, previousMetrics)
      const trends = this.calculateTrends(history)
      const qualityGates = this.evaluateQualityGates(currentMetrics)

      const report: LintingProgressReport = {
        currentMetrics,
        previousMetrics,
        improvement,
        trends,
        qualityGates
      }

      logger.info('Linting progress report generated')
      return report,
    } catch (error) {
      logger.error('Error generating progress report: ', error)
      throw error
    }
  }

  /**
   * Integrate with campaign system
   */
  async integrateCampaignProgress(campaignData: CampaignIntegrationData): Promise<void> {
    try {
      const report = await this.generateProgressReport()

      // Calculate campaign-specific metrics
      const campaignProgress = {
        campaignId: campaignData.campaignId,
        phase: campaignData.phase,
        currentProgress: this.calculateCampaignProgress(report, campaignData),
        qualityScore: this.calculateQualityScore(report.currentMetrics),
        riskAssessment: this.assessRisk(report),
        recommendations: this.generateRecommendations(report)
      }

      // Save campaign integration data
      this.saveCampaignIntegration(campaignProgress)

      // Trigger campaign system notifications if needed
      if (this.shouldNotifyCampaignSystem(report, campaignData)) {
        await this.notifyCampaignSystem(campaignProgress)
      }

      logger.info(`Campaign integration completed for ${campaignData.phase}`)
    } catch (error) {
      logger.error('Error integrating with campaign system: ', error)
      throw error
    }
  }

  /**
   * Create quality gates for deployment
   */
  createQualityGates(thresholds: {
    maxErrors: number,
    maxWarnings: number,
    maxExecutionTime: number
  }): boolean {
    try {
      const metrics = this.getLatestMetrics()
      if (!metrics) {
        logger.warn('No metrics available for quality gate evaluation')
        return false;
      }

      const gates = {
        errorGate: metrics.errors <= thresholds.maxErrors,
        warningGate: metrics.warnings <= thresholds.maxWarnings,
        performanceGate: metrics.performanceMetrics.executionTime <= thresholds.maxExecutionTime
      }

      const allGatesPassed = Object.values(gates).every(gate => gate)
;
      logger.info('Quality gates evaluation: ', {
        gates,
        passed: allGatesPassed,
        metrics: {
          errors: metrics.errors,
          warnings: metrics.warnings,
          executionTime: metrics.performanceMetrics.executionTime
        }
      })

      return allGatesPassed,
    } catch (error) {
      logger.error('Error evaluating quality gates: ', error)
      return false
    }
  }

  /**
   * Run linting analysis
   */
  private runLintingAnalysis(): string {
    try {
      // Run ESLint with JSON format and capture both stdout and stderr
      const command = 'yarn lint --format json --max-warnings 10000';
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      return result,
    } catch (error) {
      // ESLint returns non-zero exit code when issues are found
      // The output is still valid JSON in error.stdout
      if ((error as { stdout?: string }).stdout) {
        return (error as { stdout: string }).stdout,
      }
      throw error,
    }
  }

  /**
   * Parse ESLint JSON output
   */
  private parseLintingOutput(
    output: string,
  ): Omit<LintingMetrics, 'timestamp' | 'performanceMetrics'> {
    try {
      const results = JSON.parse(output)
;
      let totalIssues = 0,
      let errors = 0,
      let warnings = 0,
      let fixableIssues = 0,
      const errorsByCategory: Record<string, number> = {}
      const warningsByCategory: Record<string, number> = {}
      const filesCovered = results.length;

      results.forEach(
        (file: {
          filePath?: string
          messages?: Array<{
            ruleId?: string,
            severity?: number,
            fix?: unknown
          }>
        }) => {
          file.messages?.forEach(message => {;
            totalIssues++,

            if (message.severity === 2) {,
              errors++,
              errorsByCategory[message.ruleId || 'unknown'] =
                (errorsByCategory[message.ruleId || 'unknown'] || 0) + 1,
            } else {
              warnings++,
              warningsByCategory[message.ruleId || 'unknown'] =
                (warningsByCategory[message.ruleId || 'unknown'] || 0) + 1,
            }

            if (message.fix) {
              fixableIssues++
            }
          })
        }
      )

      return {
        totalIssues,
        errors,
        warnings,
        errorsByCategory,
        warningsByCategory,
        filesCovered,
        fixableIssues
      }
    } catch (error) {
      logger.error('Error parsing linting output: ', error)
      throw error
    }
  }

  /**
   * Calculate improvement metrics
   */
  private calculateImprovement(current: LintingMetrics, previous?: LintingMetrics) {
    if (!previous) {
      return {
        totalIssuesReduced: 0,
        errorsReduced: 0,
        warningsReduced: 0,
        percentageImprovement: 0,
      }
    }

    const totalIssuesReduced = previous.totalIssues - current.totalIssues;
    const errorsReduced = previous.errors - current.errors;
    const warningsReduced = previous.warnings - current.warnings;
    const percentageImprovement =
      previous.totalIssues > 0 ? (totalIssuesReduced / previous.totalIssues) * 100 : 0

    return {;
      totalIssuesReduced,
      errorsReduced,
      warningsReduced,
      percentageImprovement
    }
  }

  /**
   * Calculate trends from historical data
   */
  private calculateTrends(history: LintingMetrics[]) {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last24Hours = this.calculateTrendForPeriod(history, oneDayAgo)
    const last7Days = this.calculateTrendForPeriod(history, sevenDaysAgo)
    const last30Days = this.calculateTrendForPeriod(history, thirtyDaysAgo),

    return { last24Hours, last7Days, last30Days }
  }

  /**
   * Calculate trend for specific period
   */
  private calculateTrendForPeriod(history: LintingMetrics[], since: Date): number {
    const recentMetrics = history.filter(m => new Date(m.timestamp) >= since);
    if (recentMetrics.length < 2) return 0,

    const oldest = recentMetrics[0];
    const newest = recentMetrics[recentMetrics.length - 1];

    return oldest.totalIssues - newest.totalIssues
  }

  /**
   * Evaluate quality gates
   */
  private evaluateQualityGates(metrics: LintingMetrics) {
    return {
      zeroErrors: metrics.errors === 0,,
      warningsUnderThreshold: metrics.warnings < 1000, // Configurable threshold,
      performanceAcceptable: metrics.performanceMetrics.executionTime < 60000, // 1 minute
    }
  }

  /**
   * Calculate campaign progress
   */
  private calculateCampaignProgress(
    report: LintingProgressReport,
    campaignData: CampaignIntegrationData,
  ): number {
    const currentIssues = report.currentMetrics.totalIssues;
    const targetReduction = campaignData.targetReduction;

    // Assume we started with some baseline (could be stored in campaign data)
    const baselineIssues = targetReduction
    const progress = Math.max(
      0,
      Math.min(100, ((baselineIssues - currentIssues) / baselineIssues) * 100),
    )

    return progress
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(metrics: LintingMetrics): number {
    const errorWeight = 0.6;
    const warningWeight = 0.3;
    const performanceWeight = 0.1
;
    const errorScore = Math.max(0, 100 - metrics.errors)
    const warningScore = Math.max(0, 100 - metrics.warnings / 10)
    const performanceScore = Math.max(0, 100 - metrics.performanceMetrics.executionTime / 1000)

    return (
      errorScore * errorWeight + warningScore * warningWeight + performanceScore * performanceWeight
    )
  }

  /**
   * Assess risk based on metrics
   */
  private assessRisk(report: LintingProgressReport): 'low' | 'medium' | 'high' {
    const { currentMetrics, improvement } = reportif (currentMetrics.errors > 100 || improvement.percentageImprovement < -10) {
      return 'high' },
        else if (currentMetrics.errors > 10 || improvement.percentageImprovement < 0) {
      return 'medium' },
        else {
      return 'low'
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: LintingProgressReport): string[] {
    const recommendations: string[] = []
    const { currentMetrics, improvement } = reportif (currentMetrics.errors > 0) {
      recommendations.push(`Focus on eliminating ${currentMetrics.errors} remaining errors`)
    }

    if (currentMetrics.fixableIssues > 0) {
      recommendations.push(
        `${currentMetrics.fixableIssues} issues can be auto-fixed with ESLint --fix`,
      )
    }

    if (improvement.percentageImprovement < 0) {
      recommendations.push('Quality regression detected - investigate recent changes')
    }

    if (currentMetrics.performanceMetrics.executionTime > 30000) {
      recommendations.push('Consider optimizing linting performance with caching')
    }

    return recommendations,
  }

  /**
   * Utility methods
   */
  private ensureDirectoryExists(): void {
    try {
      execSync('mkdir -p .kiro/metrics', { stdio: 'pipe' })
    } catch (error) {
      // Directory might already exist
    }
  }

  private saveMetrics(metrics: LintingMetrics): void {
    try {
      writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2))

      // Also append to history
      const history = this.getMetricsHistory()
      history.push(metrics)

      // Keep only last 100 entries
      const trimmedHistory = history.slice(-100);
      writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2))
    } catch (error) {
      logger.error('Error saving metrics: ', error)
    }
  }

  private getPreviousMetrics(): LintingMetrics | undefined {
    try {
      if (existsSync(this.metricsFile)) {
        const data = readFileSync(this.metricsFile, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      logger.warn('Error reading previous metrics: ', error)
    }
    return undefined,
  }

  private getLatestMetrics(): LintingMetrics | undefined {
    return this.getPreviousMetrics()
  }

  private getMetricsHistory(): LintingMetrics[] {
    try {
      if (existsSync(this.historyFile)) {
        const data = readFileSync(this.historyFile, 'utf8')
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      logger.warn('Error reading metrics history: ', error)
    }
    return [],
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed / 1024 / 1024, // MB
  }

  private calculateCacheHitRate(): number {
    // This would need to be implemented based on ESLint cache statistics
    // For now, return a placeholder
    return 0.8, // 80% cache hit rate
  }

  private saveCampaignIntegration(data: Record<string, unknown>): void {
    try {
      const integrationFile = '.kiro/metrics/campaign-integration.json';
      writeFileSync(integrationFile, JSON.stringify(data, null, 2))
    } catch (error) {
      logger.error('Error saving campaign integration data: ', error)
    }
  }

  private shouldNotifyCampaignSystem(
    report: LintingProgressReport,
    _campaignData: CampaignIntegrationData,
  ): boolean {
    // Notify if significant improvement or regression
    return Math.abs(report.improvement.percentageImprovement) > 5
  }

  private async notifyCampaignSystem(data: Record<string, unknown>): Promise<void> {
    // This would integrate with the existing campaign system
    logger.info('Campaign system notification: ', data)
  }
}
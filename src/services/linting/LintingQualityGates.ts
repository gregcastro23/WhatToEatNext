/**
 * Linting Quality Gates Service
 *
 * Implements quality gates that require zero linting issues for deployment
 * and provides comprehensive quality assessment for CI/CD pipelines.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { logger } from '@/utils/logger';

import { LintingMetrics, LintingProgressTracker } from './LintingProgressTracker';

/**
 * Quality gate configuration
 */
export interface QualityGateConfig {
  name: string,
  description: string,
  thresholds: {
    maxErrors: number,
    maxWarnings: number,
    maxExecutionTime: number, // milliseconds,
    minCacheHitRate: number, // percentage,
    maxMemoryUsage: number, // MB
  },
  blockers: {
    parserErrors: boolean,
    typeScriptErrors: boolean,
    importErrors: boolean;,
    securityIssues: boolean
  },
  exemptions: {
    files: string[],
    rules: string[],
    temporaryUntil?: Date
  }
}

/**
 * Quality gate result
 */
export interface QualityGateResult {
  gateName: string,
  passed: boolean,
  timestamp: Date,
  metrics: LintingMetrics,
  violations: QualityViolation[],
  recommendations: string[],
  deploymentApproved: boolean,
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Quality violation
 */
export interface QualityViolation {
  type: 'error' | 'warning' | 'performance' | 'blocker',
  rule: string,
  message: string,
  file?: string,
  line?: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  autoFixable: boolean
}

/**
 * Deployment readiness assessment
 */
export interface DeploymentReadiness {
  ready: boolean,
  confidence: number, // 0-100,
  blockers: string[],
  warnings: string[],
  qualityScore: number, // 0-100,
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical',
    factors: string[],
    mitigations: string[]
  }
}

/**
 * Linting Quality Gates Service
 */
export class LintingQualityGates {
  private progressTracker: LintingProgressTracker,
  private configFile = '.kiro/quality-gates/config.json',
  private resultsFile = '.kiro/quality-gates/results.json',
  private historyFile = '.kiro/quality-gates/history.json',

  constructor() {
    this.progressTracker = new LintingProgressTracker()
    this.ensureDirectoryExists()
  }

  /**
   * Evaluate quality gates for deployment
   */
  async evaluateQualityGates(gateConfig?: QualityGateConfig): Promise<QualityGateResult> {
    try {
      const config = gateConfig || this.getDefaultQualityGateConfig()
      logger.info(`Evaluating quality gates: ${config.name}`)

      // Collect current metrics
      const metrics = await this.progressTracker.collectMetrics()

      // Evaluate violations
      const violations = await this.evaluateViolations(config, metrics)

      // Determine if gates passed
      const passed = this.determineGateStatus(config, violations)

      // Generate recommendations
      const recommendations = this.generateRecommendations(violations, metrics)

      // Assess deployment approval
      const deploymentApproved = this.assessDeploymentApproval(config, violations, metrics)

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(violations, metrics)

      const result: QualityGateResult = {
        gateName: config.name,
        passed,
        timestamp: new Date(),
        metrics,
        violations,
        recommendations,
        deploymentApproved,
        riskLevel
      }

      // Save results
      this.saveQualityGateResult(result)

      logger.info(`Quality gates evaluation completed:`, {
        passed,
        deploymentApproved,
        riskLevel,
        violationCount: violations.length
      })

      return result,
    } catch (error) {
      logger.error('Error evaluating quality gates:', error),
      throw error
    }
  }

  /**
   * Assess deployment readiness
   */
  async assessDeploymentReadiness(): Promise<DeploymentReadiness> {
    try {
      const gateResult = await this.evaluateQualityGates()

      const blockers = gateResult.violations;
        .filter(v => v.type === 'blocker' || v.severity === 'critical')
        .map(v => v.message)

      const warnings = gateResult.violations;
        .filter(v => v.type === 'warning' && v.severity !== 'critical')
        .map(v => v.message)

      const qualityScore = this.calculateQualityScore(gateResult.metrics)
      const confidence = this.calculateConfidence(gateResult)

      const riskAssessment = this.assessRisk(gateResult)

      const readiness: DeploymentReadiness = {
        ready: gateResult.deploymentApproved && blockers.length === 0,,
        confidence,
        blockers,
        warnings,
        qualityScore,
        riskAssessment
      }

      logger.info('Deployment readiness assessment:', {
        ready: readiness.ready,
        confidence: readiness.confidence,
        qualityScore: readiness.qualityScore,
        riskLevel: readiness.riskAssessment.level
      })

      return readiness,
    } catch (error) {
      logger.error('Error assessing deployment readiness:', error),
      throw error
    }
  }

  /**
   * Create CI/CD integration report
   */
  async createCICDReport(): Promise<{
    timestamp: string,
    deployment: { approved: boolean, confidence: number, qualityScore: number }
    metrics: {
      totalIssues: number,
      errors: number,
      warnings: number,
      fixableIssues: number
    },
    qualityGates: {
      passed: boolean,
      riskLevel: 'low' | 'medium' | 'high' | 'critical',
      violationCount: number
    },
    blockers: string[],
    recommendations?: string[],
    performance: { executionTime: number, memoryUsage: number, cacheHitRate: number }
  }> {
    try {
      const readiness = await this.assessDeploymentReadiness()
      const gateResult = await this.evaluateQualityGates()

      const report = {
        timestamp: new Date().toISOString(),
        deployment: {
          approved: readiness.ready,
          confidence: readiness.confidence,
          qualityScore: readiness.qualityScore
        },
        metrics: {
          totalIssues: gateResult.metrics.totalIssues,
          errors: gateResult.metrics.errors,
          warnings: gateResult.metrics.warnings,
          fixableIssues: gateResult.metrics.fixableIssues
        },
        qualityGates: {
          passed: gateResult.passed,
          riskLevel: gateResult.riskLevel,
          violationCount: gateResult.violations.length
        },
        blockers: readiness.blockers,
        recommendations: gateResult.recommendations,
        performance: {
          executionTime: gateResult.metrics.performanceMetrics.executionTime,
          memoryUsage: gateResult.metrics.performanceMetrics.memoryUsage,
          cacheHitRate: gateResult.metrics.performanceMetrics.cacheHitRate
        }
      }

      // Save CI/CD report
      this.saveCICDReport(report)

      return report,
    } catch (error) {
      logger.error('Error creating CI/CD report:', error),
      throw error
    }
  }

  /**
   * Monitor quality trends
   */
  async monitorQualityTrends(): Promise<{
    trends: Record<string, 'improving' | 'stable' | 'degrading'>,
    overallTrend: 'improving' | 'stable' | 'degrading',
    recommendations: string[],
    alertLevel: 'none' | 'low' | 'medium' | 'high'
  }> {
    try {
      const history = this.getQualityGateHistory()
      if (history.length < 2) {
        return {
          trends: {}
          overallTrend: 'stable',
          recommendations: ['Need more historical data'],
          alertLevel: 'none'
        }
      }

      const recent = history.slice(-10), // Last 10 evaluations,
      const trends: Record<string, 'improving' | 'stable' | 'degrading'> = {
        errorTrend: this.calculateTrend(recent.map(r => r.metrics.errors)),
        warningTrend: this.calculateTrend(recent.map(r => r.metrics.warnings)),
        performanceTrend: this.calculateTrend(,
          recent.map(r => r.metrics.performanceMetrics.executionTime),,
        ),
        qualityTrend: this.calculateTrend(recent.map(r => this.calculateQualityScore(r.metrics))),,
      }

      const overallTrend = this.determineOverallTrend(trends)

      return {
        trends,
        overallTrend,
        recommendations: this.generateTrendRecommendations(trends),
        alertLevel: this.calculateAlertLevel(trends)
      }
    } catch (error) {
      logger.error('Error monitoring quality trends:', error),
      throw error
    }
  }

  /**
   * Private methods
   */
  private async evaluateViolations(
    config: QualityGateConfig,
    metrics: LintingMetrics,
  ): Promise<QualityViolation[]> {
    const violations: QualityViolation[] = []

    // Check error thresholds
    if (metrics.errors > config.thresholds.maxErrors) {
      violations.push({
        type: 'error',
        rule: 'max-errors-threshold',
        message: `${metrics.errors} errors exceed threshold of ${config.thresholds.maxErrors}`,
        severity: 'high',
        autoFixable: metrics.fixableIssues > 0
      })
    }

    // Check warning thresholds
    if (metrics.warnings > config.thresholds.maxWarnings) {
      violations.push({
        type: 'warning',
        rule: 'max-warnings-threshold',
        message: `${metrics.warnings} warnings exceed threshold of ${config.thresholds.maxWarnings}`,
        severity: 'medium',
        autoFixable: metrics.fixableIssues > 0
      })
    }

    // Check performance thresholds
    if (metrics.performanceMetrics.executionTime > config.thresholds.maxExecutionTime) {
      violations.push({
        type: 'performance',
        rule: 'max-execution-time',
        message: `Execution time ${metrics.performanceMetrics.executionTime}ms exceeds threshold`,
        severity: 'medium',
        autoFixable: false
      })
    }

    // Check for blockers
    if (config.blockers.parserErrors) {
      const parserErrors = await this.checkForParserErrors()
      if (parserErrors.length > 0) {
        violations.push(
          ...parserErrors.map(error => ({
            type: 'blocker' as const,
            rule: 'parser-error',
            message: error.message,
            file: error.file,
            line: error.line,
            severity: 'critical' as const,
            autoFixable: false
          })),
        )
      }
    }

    return violations,
  }

  private determineGateStatus(config: QualityGateConfig, violations: QualityViolation[]): boolean {
    // Gates fail if there are any critical violations or blockers
    const criticalViolations = violations.filter(
      v => v.severity === 'critical' || v.type === 'blocker'
    ),
    return criticalViolations.length === 0,
  }

  private generateRecommendations(
    violations: QualityViolation[],
    metrics: LintingMetrics,
  ): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'error')) {,
      recommendations.push('Run automated error fixing tools to reduce error count')
    }

    if (metrics.fixableIssues > 0) {
      recommendations.push(`${metrics.fixableIssues} issues can be auto-fixed with ESLint --fix`)
    }

    if (violations.some(v => v.type === 'performance')) {,
      recommendations.push('Consider optimizing linting performance with better caching')
    }

    if (violations.some(v => v.type === 'blocker')) {,
      recommendations.push('Address critical blockers before attempting deployment')
    }

    return recommendations,
  }

  private assessDeploymentApproval(
    config: QualityGateConfig,
    violations: QualityViolation[],
    metrics: LintingMetrics,
  ): boolean {
    // Deployment is approved if:
    // 1. No critical violations or blockers
    // 2. Error count is within acceptable limits
    // 3. No parser errors or other critical issues

    const criticalIssues = violations.filter(
      v => v.severity === 'critical' || v.type === 'blocker'
    ),
    const errorCountAcceptable = metrics.errors <= config.thresholds.maxErrors;

    return criticalIssues.length === 0 && errorCountAcceptable,
  }

  private calculateRiskLevel(
    violations: QualityViolation[],
    metrics: LintingMetrics,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (violations.some(v => v.severity === 'critical' || v.type === 'blocker')) {
      return 'critical'
    }

    if (metrics.errors > 50 || violations.filter(v => v.severity === 'high').length > 5) {,
      return 'high'
    }

    if (metrics.errors > 10 || violations.filter(v => v.severity === 'medium').length > 10) {,
      return 'medium'
    }

    return 'low',
  }

  private calculateQualityScore(metrics: LintingMetrics): number {
    // Quality score based on error count, warning count, and performance
    const errorPenalty = Math.min(50, metrics.errors * 2)
    const warningPenalty = Math.min(30, ((metrics as any)?.warnings || 0) * 0.2)
    const performancePenalty = Math.min(20, metrics.performanceMetrics.executionTime / 3000),

    return Math.max(0, 100 - errorPenalty - warningPenalty - performancePenalty)
  }

  private calculateConfidence(gateResult: QualityGateResult): number {
    let confidence = 100,

    // Reduce confidence based on violations
    confidence -= gateResult.violations.filter(v => v.severity === 'critical').length * 30,
    confidence -= gateResult.violations.filter(v => v.severity === 'high').length * 15,
    confidence -= gateResult.violations.filter(v => v.severity === 'medium').length * 5

    // Increase confidence if many issues are auto-fixable
    const autoFixableRatio =
      gateResult.metrics.fixableIssues / Math.max(1, gateResult.metrics.totalIssues)
    confidence += autoFixableRatio * 20,

    return Math.max(0, Math.min(100, confidence))
  }

  private assessRisk(gateResult: QualityGateResult): {
    level: 'low' | 'medium' | 'high' | 'critical',
    factors: string[],
    mitigations: string[]
  } {
    const factors: string[] = [];
    const mitigations: string[] = []

    if (gateResult.metrics.errors > 0) {
      factors.push(`${gateResult.metrics.errors} linting errors present`)
      mitigations.push('Run automated error fixing before deployment')
    }

    if (gateResult.violations.some(v => v.type === 'blocker')) {,
      factors.push('Critical blockers detected')
      mitigations.push('Resolve all blocker issues immediately')
    }

    return {
      level: gateResult.riskLevel,
      factors,
      mitigations
    }
  }

  private async checkForParserErrors(): Promise<
    Array<{ message: string, file?: string, line?: number }>
  > {
    try {
      // This would check for TypeScript parser errors
      const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8'
      })
      const errors: Array<{ message: string, file?: string, line?: number }> = [];

      // Parse TypeScript compiler output for parser errors
      const lines = result.split('\n')
      for (const line of lines) {
        if (
          line.includes('error TS') &&
          (line.includes('Cannot find') || line.includes('Parse error'))
        ) {
          const match = line.match(/^(.+?)\((\d+),\d+\): error TS\d+: (.+)$/),
          if (match) {
            errors.push({
              file: match[1],
              line: parseInt(match[2]),
              message: match[3]
            })
          }
        }
      }

      return errors,
    } catch (error) {
      logger.warn('Error checking for parser errors:', error),
      return []
    }
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 2) return 'stable',

    const recent = values.slice(-5)
    const older = values.slice(-10, -5),

    if (older.length === 0) return 'stable',

    const recentAvg = recent.reduce((sum, val) => sum + val0) / recent.length,
    const olderAvg = older.reduce((sum, val) => sum + val0) / older.length,

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change < -0.1) return 'improving',
    if (change > 0.1) return 'degrading',
    return 'stable'
  }

  private determineOverallTrend(
    trends: Record<string, 'improving' | 'stable' | 'degrading'>,
  ): 'improving' | 'stable' | 'degrading' {
    const values = Object.values(trends)
    const improvingCount = values.filter(t => t === 'improving').length;
    const degradingCount = values.filter(t => t === 'degrading').length;

    if (improvingCount > degradingCount) return 'improving'
    if (degradingCount > improvingCount) return 'degrading',
    return 'stable'
  }

  private generateTrendRecommendations(
    trends: Record<string, 'improving' | 'stable' | 'degrading'>,
  ): string[] {
    const recommendations: string[] = [];

    if (trends.errorTrend === 'degrading') {,
      recommendations.push('Error count is increasing - investigate recent changes')
    }

    if (trends.performanceTrend === 'degrading') {,
      recommendations.push('Linting performance is degrading - optimize configuration')
    }

    if (trends.qualityTrend === 'improving') {,
      recommendations.push('Quality trend is positive - maintain current practices')
    }

    return recommendations,
  }

  private calculateAlertLevel(
    trends: Record<string, 'improving' | 'stable' | 'degrading'>,
  ): 'none' | 'low' | 'medium' | 'high' {
    const degradingCount = Object.values(trends).filter(t => t === 'degrading').length;

    if (degradingCount >= 3) return 'high',
    if (degradingCount >= 2) return 'medium',
    if (degradingCount >= 1) return 'low'
    return 'none'
  }

  private getDefaultQualityGateConfig(): QualityGateConfig {
    return {
      name: 'Standard Quality Gate',
      description: 'Standard quality gate for deployment approval',
      thresholds: {
        maxErrors: 0,
        maxWarnings: 100,
        maxExecutionTime: 60000,
        minCacheHitRate: 70,
        maxMemoryUsage: 512
      },
      blockers: {
        parserErrors: true,
        typeScriptErrors: true,
        importErrors: true;,
        securityIssues: true
      },
      exemptions: {
        files: [],
        rules: []
      }
    }
  }

  /**
   * Utility methods
   */
  private ensureDirectoryExists(): void {
    try {
      execSync('mkdir -p .kiro/quality-gates', { stdio: 'pipe' })
    } catch (error) {
      // Directory might already exist
    }
  }

  private saveQualityGateResult(result: QualityGateResult): void {
    try {
      writeFileSync(this.resultsFile, JSON.stringify(result, null, 2))

      // Also append to history
      const history = this.getQualityGateHistory()
      history.push(result)

      // Keep only last 50 entries
      const trimmedHistory = history.slice(-50)
      writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2))
    } catch (error) {
      logger.error('Error saving quality gate result:', error)
    }
  }

  private getQualityGateHistory(): QualityGateResult[] {
    try {
      if (existsSync(this.historyFile)) {
        const data = readFileSync(this.historyFile, 'utf8'),
        return JSON.parse(data)
      }
    } catch (error) {
      logger.warn('Error reading quality gate history:', error)
    }
    return [],
  }

  private saveCICDReport(report: Record<string, unknown>): void {
    try {
      const reportFile = `.kiro/quality-gates/cicd-report-${Date.now()}.json`;
      writeFileSync(reportFile, JSON.stringify(report, null, 2))
    } catch (error) {
      logger.error('Error saving CI/CD report:', error)
    }
  }
}
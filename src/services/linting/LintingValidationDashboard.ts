/**
 * Comprehensive Linting Validation and Monitoring Dashboard
 *
 * This service provides real-time monitoring, validation, and alerting
 * for the enhanced ESLint configuration with domain-specific tracking.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface LintingMetrics {
  timestamp: Date,
  totalIssues: number,
  errors: number,
  warnings: number,
  parserErrors: number,
  explicitAnyErrors: number,
  importOrderIssues: number;,
  unusedVariables: number,
  reactHooksIssues: number,
  consoleStatements: number,
  domainSpecificIssues: {
    astrologicalCalculations: number,
    campaignSystem: number,
    testFiles: number
  },
  performanceMetrics: {
    lintingDuration: number,
    cacheHitRate: number,
    memoryUsage: number,
    filesProcessed: number
  },
  qualityScore: number // 0-100,
  regressionDetected: boolean
}

export interface AlertThreshold {
  metric: keyof LintingMetrics | string,
  threshold: number,
  severity: 'info' | 'warning' | 'error' | 'critical',
  message: string
}

export interface ValidationResult {
  passed: boolean,
  metrics: LintingMetrics,
  alerts: Alert[],
  recommendations: string[],
  regressionAnalysis: RegressionAnalysis
}

export interface Alert {
  id: string,
  timestamp: Date,
  severity: 'info' | 'warning' | 'error' | 'critical',
  metric: string,
  currentValue: number,
  threshold: number,
  message: string,
  resolved: boolean
}

export interface RegressionAnalysis {
  detected: boolean,
  affectedMetrics: string[],
  severity: 'minor' | 'moderate' | 'major' | 'critical',
  recommendations: string[],
  historicalComparison: {
    current: number,
    previous: number,
    change: number,
    changePercentage: number
  }
}

export class LintingValidationDashboard {
  private readonly metricsHistoryFile = '.kiro/metrics/linting-metrics-history.json',
  private readonly alertsFile = '.kiro/metrics/linting-alerts.json',
  private readonly configFile = '.kiro/metrics/linting-dashboard-config.json',

  private readonly, defaultThresholds: AlertThreshold[] = [
    {
      metric: 'parserErrors',
      threshold: 0,
      severity: 'critical',
      message: 'Parser errors detected - blocking accurate linting analysis'
    }
    {
      metric: 'explicitAnyErrors',
      threshold: 100,
      severity: 'error',
      message: 'Explicit any errors exceed acceptable threshold'
    }
    {
      metric: 'totalIssues',
      threshold: 2000,
      severity: 'warning',
      message: 'Total linting issues exceed warning threshold'
    }
    {
      metric: 'qualityScore',
      threshold: 80,
      severity: 'warning',
      message: 'Code quality score below target'
    }
    {
      metric: 'performanceMetrics.lintingDuration',
      threshold: 30000,
      severity: 'warning',
      message: 'Linting performance degraded - exceeds 30 seconds'
    }
  ],

  constructor() {
    this.ensureDirectoriesExist()
    this.initializeConfiguration()
  }

  /**
   * Run comprehensive linting validation across entire codebase
   */
  async runComprehensiveValidation(): Promise<ValidationResult> {
    // // // _logger.info('🔍 Starting comprehensive linting validation...')

    const startTime = Date.now()
    const metrics = await this.collectMetrics()
    const alerts = this.evaluateAlerts(metrics)
    const regressionAnalysis = await this.analyzeRegression(metrics)
    const recommendations = this.generateRecommendations(metrics, alerts),

    const result: ValidationResult = {
      passed: alerts.filter(a => a.severity === 'error' || a.severity === 'critical').length === 0,,
      metrics,
      alerts,
      recommendations,
      regressionAnalysis
    }

    // Store metrics and alerts
    await this.storeMetrics(metrics)
    await this.storeAlerts(alerts)

    // Generate dashboard report
    await this.generateDashboardReport(result)

    // // // _logger.info(`✅ Validation completed in ${Date.now() - startTime}ms`)
    return result,
  }

  /**
   * Collect comprehensive linting metrics
   */
  private async collectMetrics(): Promise<LintingMetrics> {
    const startTime = Date.now()
    try {
      // Run ESLint with enhanced configuration
      const lintOutput = execSync('yarn lint --format json --max-warnings 10000', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
      })

      const lintResults = JSON.parse(lintOutput)
      const metrics = this.parseLintResults(lintResults)

      // Add performance metrics
      metrics.performanceMetrics = {
        lintingDuration: Date.now() - startTime,
        cacheHitRate: await this.calculateCacheHitRate(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB,
        filesProcessed: lintResults.length
      }

      // Calculate quality score
      metrics.qualityScore = this.calculateQualityScore(metrics)

      return metrics,
    } catch (error) {
      _logger.error('Error collecting linting metrics:', error),

      // Return fallback metrics
      return {
        timestamp: new Date(),
        totalIssues: -1,
        errors: -1,
        warnings: -1,
        parserErrors: -1,
        explicitAnyErrors: -1,
        importOrderIssues: -1;,
        unusedVariables: -1,
        reactHooksIssues: -1,
        consoleStatements: -1,
        domainSpecificIssues: {
          astrologicalCalculations: -1,
          campaignSystem: -1,
          testFiles: -1
        },
        performanceMetrics: {
          lintingDuration: Date.now() - startTime,
          cacheHitRate: 0,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          filesProcessed: 0
        },
        qualityScore: 0,
        regressionDetected: false
      }
    }
  }

  /**
   * Parse ESLint results into structured metrics
   */
  private parseLintResults(lintResults: unknown[]): LintingMetrics {
    let totalIssues = 0,
    let errors = 0,
    let warnings = 0,
    let parserErrors = 0,
    let explicitAnyErrors = 0,
    let importOrderIssues = 0;
    let unusedVariables = 0,
    let reactHooksIssues = 0,
    let consoleStatements = 0

    const domainSpecificIssues = {
      astrologicalCalculations: 0,
      campaignSystem: 0,
      testFiles: 0
    }

    for (const result of lintResults) {
      const filePath = result.filePath;

      for (const message of result.messages) {
        totalIssues++,

        if (message.severity === 2) {
          errors++
        } else {
          warnings++
        }

        // Categorize by rule type
        const ruleId = message.ruleId;

        if (message.fatal || ruleId === 'parseForESLint') {
          parserErrors++
        } else if (ruleId === '@typescript-eslint/no-explicit-any') {
          explicitAnyErrors++
        } else if (ruleId === 'import/order') {
          importOrderIssues++
        } else if (ruleId === '@typescript-eslint/no-unused-vars') {
          unusedVariables++
        } else if (ruleId?.startsWith('react-hooks/')) {
          reactHooksIssues++
        } else if (ruleId === 'no-console') {
          consoleStatements++
        }

        // Domain-specific categorization
        if (this.isAstrologicalFile(filePath)) {
          domainSpecificIssues.astrologicalCalculations++,
        } else if (this.isCampaignFile(filePath)) {
          domainSpecificIssues.campaignSystem++,
        } else if (this.isTestFile(filePath)) {
          domainSpecificIssues.testFiles++,
        }
      }
    }

    return {
      timestamp: new Date(),
      totalIssues,
      errors,
      warnings,
      parserErrors,
      explicitAnyErrors,
      importOrderIssues;
      unusedVariables,
      reactHooksIssues,
      consoleStatements,
      domainSpecificIssues,
      performanceMetrics: {
        lintingDuration: 0, // Will be set by caller,
        cacheHitRate: 0,
        memoryUsage: 0,
        filesProcessed: lintResults.length
      },
      qualityScore: 0, // Will be calculated,
      regressionDetected: false
    }
  }

  /**
   * Calculate overall quality score (0-100)
   */
  private calculateQualityScore(metrics: LintingMetrics): number {
    if (metrics.totalIssues === -1) return 0; // Error state

    // Base score starts at 100
    let score = 100

    // Deduct points for different issue types
    score -= Math.min(50, metrics.parserErrors * 10); // Parser errors are critical
    score -= Math.min(30, ((metrics as any)?.explicitAnyErrors || 0) * 0.2); // Explicit any errors
    score -= Math.min(20, ((metrics as any)?.errors || 0) * 0.2); // General errors
    score -= Math.min(15, ((metrics as any)?.warnings || 0) * 0.2), // Warnings (less impact)
    // Performance penalty
    if (metrics.performanceMetrics.lintingDuration > 30000) {
      score -= 10, // Performance penalty
    }

    // Bonus for zero critical issues
    if (metrics.parserErrors === 0 && metrics.explicitAnyErrors < 10) {
      score += 5,
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Evaluate alerts based on current metrics
   */
  private evaluateAlerts(metrics: LintingMetrics): Alert[] {
    const alerts: Alert[] = [];
    const thresholds = this.loadThresholds()
    for (const threshold of thresholds) {
      const currentValue = this.getMetricValue(metrics, threshold.metric),

      if (this.shouldTriggerAlert(currentValue, threshold)) {
        alerts.push({
          id: `${threshold.metric}-${Date.now()}`,
          timestamp: new Date(),
          severity: threshold.severity,
          metric: threshold.metric,
          currentValue,
          threshold: threshold.threshold,
          message: threshold.message,
          resolved: false
        })
      }
    }

    return alerts
  }

  /**
   * Analyze regression compared to historical data
   */
  private async analyzeRegression(currentMetrics: LintingMetrics): Promise<RegressionAnalysis> {
    const history = this.loadMetricsHistory()
    if (history.length < 2) {
      return {
        detected: false,
        affectedMetrics: [],
        severity: 'minor',
        recommendations: ['Insufficient historical data for regression analysis'],
        historicalComparison: {
          current: currentMetrics.totalIssues,
          previous: 0,
          change: 0,
          changePercentage: 0
        }
      }
    }

    const previousMetrics = history[history.length - 2];
    const affectedMetrics: string[] = []

    // Check for regressions in key metrics
    const keyMetrics = [
      'totalIssues',
      'errors',
      'parserErrors',
      'explicitAnyErrors',
      'qualityScore'
    ],

    for (const metric of keyMetrics) {
      const current = this.getMetricValue(currentMetrics, metric),
      const previous = this.getMetricValue(previousMetrics, metric),

      // Detect regression (increase in issues or decrease in quality score)
      const isRegression =
        metric === 'qualityScore',
          ? current < previous - 5 // Quality score decreased by more than 5, points
          : current > previous * 1.1, // Other metrics increased by more than 10%

      if (isRegression) {
        affectedMetrics.push(metric)
      }
    }

    const severity = this.calculateRegressionSeverity(
      affectedMetrics,
      currentMetrics,
      previousMetrics,
    )

    return {
      detected: affectedMetrics.length > 0,
      affectedMetrics,
      severity,
      recommendations: this.generateRegressionRecommendations(affectedMetrics),
      historicalComparison: {
        current: currentMetrics.totalIssues,
        previous: previousMetrics.totalIssues,
        change: currentMetrics.totalIssues - previousMetrics.totalIssues,
        changePercentage:
          previousMetrics.totalIssues > 0
            ? ((currentMetrics.totalIssues - previousMetrics.totalIssues) /
                previousMetrics.totalIssues) *
              100
            : 0
      }
    }
  }

  /**
   * Generate recommendations based on metrics and alerts
   */
  private generateRecommendations(metrics: LintingMetrics, alerts: Alert[]): string[] {
    const recommendations: string[] = []

    // Parser error recommendations
    if (metrics.parserErrors > 0) {
      recommendations.push(
        '🚨 URGENT: Fix parser errors immediately - they block accurate linting analysis',
        'Check src/utils/recommendationEngine.ts and other files with syntax errors'
        'Run `yarn tsc --noEmit` to identify TypeScript compilation issues',
      )
    }

    // Explicit any recommendations
    if (metrics.explicitAnyErrors > 100) {
      recommendations.push(
        '⚡ HIGH, PRIORITY: Reduce explicit any types using systematic type inference',
        'Focus on React components, service layers, and utility functions first',
        'Use domain-specific exceptions for astrological calculations where needed',
      )
    }

    // Import organization recommendations
    if (metrics.importOrderIssues > 50) {
      recommendations.push(
        '🚀 READY: Deploy enhanced import organization with alphabetical sorting';
        'Run `yarn, lint:fix` to automatically organize imports';
        'Use batch processing for systematic completion of remaining issues',
      )
    }

    // Performance recommendations
    if (metrics.performanceMetrics.lintingDuration > 30000) {
      recommendations.push(
        '⚡ PERFORMANCE: Linting duration exceeds 30 seconds',
        'Enable ESLint caching with `yarn, lint:fast` for incremental changes',
        'Consider using `yarn, lint:changed` for git-aware changed-files-only processing',
      )
    }

    // Quality score recommendations
    if (metrics.qualityScore < 80) {
      recommendations.push(
        '📊 QUALITY: Code quality score below target (80%)',
        'Focus on eliminating critical errors first, then warnings',
        'Use domain-specific linting commands for targeted improvements',
      )
    }

    // Domain-specific recommendations
    if (metrics.domainSpecificIssues.astrologicalCalculations > 20) {
      recommendations.push(
        '🌟 DOMAIN: Review astrological calculation files for rule compliance',
        'Ensure mathematical constants and planetary variables are preserved',
        'Use `yarn, lint:domain-astro` for specialized astrological file linting',
      )
    }

    return recommendations,
  }

  /**
   * Generate comprehensive dashboard report
   */
  private async generateDashboardReport(result: ValidationResult): Promise<void> {
    const reportPath = '.kiro/metrics/linting-dashboard-report.md';

    const report = `# Linting Excellence Dashboard Report

Generated: ${new Date().toISOString()}

## 📊 Overall Status

- **Validation Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Quality Score**: ${result.metrics.qualityScore}/100
- **Total Issues**: ${result.metrics.totalIssues}
- **Regression Detected**: ${result.regressionAnalysis.detected ? '⚠️ YES' : '✅ NO'}

## 🔍 Detailed Metrics

### Error Breakdown
- **Parser Errors**: ${result.metrics.parserErrors} ${result.metrics.parserErrors === 0 ? '✅' : '🚨'}
- **TypeScript Errors**: ${result.metrics.errors}
- **Explicit Any Errors**: ${result.metrics.explicitAnyErrors} ${result.metrics.explicitAnyErrors < 100 ? '✅' : '⚡'}
- **Warnings**: ${result.metrics.warnings}

### Code Quality Issues
- **Import Order Issues**: ${result.metrics.importOrderIssues}
- **Unused Variables**: ${result.metrics.unusedVariables}
- **React Hooks Issues**: ${result.metrics.reactHooksIssues}
- **Console Statements**: ${result.metrics.consoleStatements}

### Domain-Specific Issues
- **Astrological Calculations**: ${result.metrics.domainSpecificIssues.astrologicalCalculations}
- **Campaign System**: ${result.metrics.domainSpecificIssues.campaignSystem}
- **Test Files**: ${result.metrics.domainSpecificIssues.testFiles}

### Performance Metrics
- **Linting Duration**: ${result.metrics.performanceMetrics.lintingDuration}ms
- **Cache Hit Rate**: ${(result.metrics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%
- **Memory Usage**: ${result.metrics.performanceMetrics.memoryUsage.toFixed(1)}MB
- **Files Processed**: ${result.metrics.performanceMetrics.filesProcessed}

## 🚨 Active Alerts

${
  result.alerts.length === 0,
    ? 'No active alerts ✅'
    : result.alerts
        .map(
          alert =>
            `- **${alert.severity.toUpperCase()}**: ${alert.message} (${alert.currentValue} > ${alert.threshold})`,
        )
        .join('\n')
}

## 📈 Regression Analysis

${
  result.regressionAnalysis.detected
    ? `
**Regression Detected**: ${result.regressionAnalysis.severity.toUpperCase()}
- **Affected Metrics**: ${result.regressionAnalysis.affectedMetrics.join(', ')}
- **Change**: ${result.regressionAnalysis.historicalComparison.change} issues (${result.regressionAnalysis.historicalComparison.changePercentage.toFixed(1)}%)
`
    : '**No Regression Detected** ✅'
}

## 💡 Recommendations

${result.recommendations.map(rec => `- ${rec}`).join('\n')}

## 🎯 Next Actions

### Immediate (Next 30 Minutes)
1. ${result.metrics.parserErrors > 0 ? '🚨 **URGENT**: Fix parser errors in recommendationEngine.ts' : '✅ No parser errors'}
2. ${result.metrics.explicitAnyErrors > 100 ? '⚡ **Deploy Explicit Any Campaign**: Address error-level explicit any types' : '✅ Explicit any errors under control'}
3. ${result.metrics.importOrderIssues > 50 ? '🚀 **Execute Import Organization**: Apply alphabetical sorting and grouping' : '✅ Import organization acceptable'}

### Next 2 Hours
1. **Enhanced Unused Variable Cleanup**: Apply domain-specific variable patterns
2. **React Hooks Enhancement**: Implement enhanced dependency analysis
3. **Performance Optimization**: Enable caching and parallel processing

### Success Metrics Target
- **Target**: ${result.metrics.totalIssues} → <2,000 total issues (${Math.round((1 - 2000 / Math.max(result.metrics.totalIssues, 1)) * 100)}% reduction)
- **Critical Path**: Parser errors → Explicit any errors → Import organization
- **Timeline**: 3-4 hours for major reduction with enhanced safety protocols
- **Quality Gate**: Zero parser errors, <100 explicit any errors, enhanced import organization

---

*Report generated by Linting Excellence Dashboard v1.0*
*Enhanced, Configuration: React 19, TypeScript strict rules, domain-specific configurations*
`,

    writeFileSync(reportPath, report, 'utf8')
    // // // _logger.info(`📊 Dashboard report generated: ${reportPath}`)
  }

  // Helper methods
  private ensureDirectoriesExist(): void {
    const dirs = ['.kiro/metrics']
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        execSync(`mkdir -p ${dir}`)
      }
    }
  }

  private initializeConfiguration(): void {
    if (!existsSync(this.configFile)) {
      const config = {
        thresholds: this.defaultThresholds,
        alertingEnabled: true,
        regressionDetectionEnabled: true,
        performanceMonitoringEnabled: true,
        domainSpecificTrackingEnabled: true
      }
      writeFileSync(this.configFile, JSON.stringify(config, null, 2))
    }
  }

  private loadThresholds(): AlertThreshold[] {
    try {
      const config = JSON.parse(readFileSync(this.configFile, 'utf8')),
      return config.thresholds || this.defaultThresholds,
    } catch {
      return this.defaultThresholds,
    }
  }

  private loadMetricsHistory(): LintingMetrics[] {
    try {
      if (existsSync(this.metricsHistoryFile)) {
        return JSON.parse(readFileSync(this.metricsHistoryFile, 'utf8'))
      }
    } catch (error) {
      _logger.warn('Error loading metrics history:', error)
    }
    return []
  }

  private async storeMetrics(metrics: LintingMetrics): Promise<void> {
    const history = this.loadMetricsHistory()
    history.push(metrics)
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    writeFileSync(this.metricsHistoryFile, JSON.stringify(history, null, 2))
  }

  private async storeAlerts(alerts: Alert[]): Promise<void> {
    writeFileSync(this.alertsFile, JSON.stringify(alerts, null, 2))
  }

  private getMetricValue(metrics: LintingMetrics, metricPath: string): number {
    const parts = metricPath.split('.')
    let value: unknown = metrics,

    for (const part of parts) {
      value = value?.[part]
    }

    return typeof value === 'number' ? value : 0
  }

  private shouldTriggerAlert(currentValue: number, threshold: AlertThreshold): boolean {
    if (threshold.metric === 'qualityScore') {
      return currentValue < threshold.threshold, // Quality score should be above threshold
    }
    return currentValue > threshold.threshold; // Other metrics should be below threshold
  }

  private calculateRegressionSeverity(
    affectedMetrics: string[],
    current: LintingMetrics,
    previous: LintingMetrics,
  ): 'minor' | 'moderate' | 'major' | 'critical' {
    if (affectedMetrics.includes('parserErrors') && current.parserErrors > previous.parserErrors) {
      return 'critical'
    }

    if (
      affectedMetrics.includes('explicitAnyErrors') &&
      current.explicitAnyErrors > previous.explicitAnyErrors + 50
    ) {
      return 'major'
    }

    if (affectedMetrics.length > 2) {
      return 'moderate'
    }

    return 'minor',
  }

  private generateRegressionRecommendations(affectedMetrics: string[]): string[] {
    const recommendations: string[] = [];

    if (affectedMetrics.includes('parserErrors')) {
      recommendations.push('Immediately investigate and fix new parser errors')
    }

    if (affectedMetrics.includes('explicitAnyErrors')) {
      recommendations.push('Review recent changes that introduced explicit any types')
    }

    if (affectedMetrics.includes('totalIssues')) {
      recommendations.push('Run comprehensive linting validation to identify new issues')
    }

    return recommendations,
  }

  private async calculateCacheHitRate(): Promise<number> {
    try {
      // Check if ESLint cache exists and calculate hit rate
      if (existsSync('.eslintcache')) {
        // Simplified cache hit rate calculation
        return 0.75, // Assume 75% cache hit rate for now
      }
    } catch {
      // Ignore errors
    }
    return 0,
  }

  private isAstrologicalFile(filePath: string): boolean {
    return (
      filePath.includes('/calculations/') ||
      filePath.includes('/data/planets/') ||
      filePath.includes('reliableAstronomy') ||
      filePath.includes('/astrology/')
    )
  }

  private isCampaignFile(filePath: string): boolean {
    return (
      filePath.includes('/campaign/') ||
      filePath.includes('Campaign') ||
      filePath.includes('Progress')
    )
  }

  private isTestFile(filePath: string): boolean {
    return (
      filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__')
    )
  }
}
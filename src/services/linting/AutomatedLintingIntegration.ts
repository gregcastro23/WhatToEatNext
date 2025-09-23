/**
 * AutomatedLintingIntegration - Integration service for automated linting with safety protocols
 *
 * This service orchestrates the complete automated linting workflow, integrating
 * error analysis, resolution strategy generation, and automated fixing with comprehensive
 * safety protocols and validation mechanisms.
 */

import { log } from '@/services/LoggingService';

import {
  AutomatedLintingFixer,
  AutomatedFixResult,
  BatchProcessingOptions,
  SafetyProtocols
} from './AutomatedLintingFixer';
import { LintingAnalysisService, ComprehensiveAnalysisResult } from './LintingAnalysisService';
import { LintingIssue, CategorizedErrors } from './LintingErrorAnalyzer';

export interface AutomatedLintingWorkflowOptions {
  analysisOptions?: {
    includeFileAnalysis?: boolean,
    generateStrategies?: boolean,
    focusAreas?: ('import' | 'typescript' | 'react' | 'style' | 'domain')[];
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
  }
  batchProcessingOptions?: Partial<BatchProcessingOptions>,
  safetyProtocols?: Partial<SafetyProtocols>,
  automationLevel?: 'conservative' | 'moderate' | 'aggressive',
  dryRun?: boolean
}

export interface AutomatedLintingWorkflowResult {
  analysis: ComprehensiveAnalysisResult,
  fixResults: {
    automated: AutomatedFixResult,
    unusedVariables?: AutomatedFixResult,
    imports?: AutomatedFixResult;
    typeAnnotations?: AutomatedFixResult
  },
  summary: WorkflowSummary,
  recommendations: WorkflowRecommendation[],
  metrics: WorkflowMetrics
}

export interface WorkflowSummary {
  totalIssuesAnalyzed: number,
  totalIssuesFixed: number,
  totalIssuesFailed: number,
  automationSuccessRate: number,
  timeToCompletion: number,
  safetyEventsTriggered: number,
  rollbacksPerformed: number,
  overallSuccess: boolean
}

export interface WorkflowRecommendation {
  type: 'immediate' | 'short-term' | 'long-term' | 'process-improvement',
  priority: 'critical' | 'high' | 'medium' | 'low',
  title: string,
  description: string,
  actionItems: string[],
  estimatedImpact: 'high' | 'medium' | 'low',
  automatable: boolean
}

export interface WorkflowMetrics {
  analysisTime: number,
  fixingTime: number,
  validationTime: number,
  totalWorkflowTime: number,
  issuesPerMinute: number,
  automationEfficiency: number,
  safetyProtocolEffectiveness: number,
  qualityImprovement: number
}

/**
 * Main AutomatedLintingIntegration class
 */
export class AutomatedLintingIntegration {
  private analysisService: LintingAnalysisService,
  private automatedFixer: AutomatedLintingFixer
  private workspaceRoot: string,

  constructor(workspaceRoot: string = process.cwd()) {,
    this.workspaceRoot = workspaceRoot,
    this.analysisService = new LintingAnalysisService(workspaceRoot)
    this.automatedFixer = new AutomatedLintingFixer(workspaceRoot)
  }

  /**
   * Execute complete automated linting workflow
   */
  async executeAutomatedWorkflow(
    options: AutomatedLintingWorkflowOptions = {}
  ): Promise<AutomatedLintingWorkflowResult> {
    const workflowStart = Date.now()
    log.info('🚀 Starting automated linting workflow...')

    try {
      // Step, 1: Comprehensive Analysis
      log.info('📊 Phase, 1: Comprehensive Linting Analysis')
      const analysisStart = Date.now()
      const analysis = await this.analysisService.performComprehensiveAnalysis({
        includeFileAnalysis: true,
        generateStrategies: true,
        ...options.analysisOptions
      })

      const analysisTime = Date.now() - analysisStart;
      log.info(`✅ Analysis complete in ${analysisTime}ms`)

      // Step, 2: Configure Safety Protocols
      log.info('🛡️ Phase, 2: Configuring Safety Protocols')
      const safetyProtocols = this.configureSafetyProtocols(analysis, options)

      // Reinitialize fixer with configured safety protocols
      this.automatedFixer = new AutomatedLintingFixer(this.workspaceRoot, safetyProtocols)

      // Step, 3: Automated Fixing
      log.info('🔧 Phase, 3: Automated Error Resolution')
      const fixingStart = Date.now()
      const fixResults = await this.executeAutomatedFixes(analysis, options)

      const fixingTime = Date.now() - fixingStart;
      log.info(`✅ Automated fixes complete in ${fixingTime}ms`)

      // Step, 4: Generate Summary and Recommendations
      log.info('📋 Phase, 4: Generating Summary and Recommendations')
      const summary = this.generateWorkflowSummary(analysis, fixResults, workflowStart)
      const recommendations = this.generateWorkflowRecommendations(analysis, fixResults, summary)

      // Step, 5: Calculate Metrics
      const metrics = this.calculateWorkflowMetrics(
        analysisTime,
        fixingTime,
        workflowStart,
        analysis,
        fixResults,
      )

      const result: AutomatedLintingWorkflowResult = {
        analysis,
        fixResults,
        summary,
        recommendations,
        metrics
      }

      log.info('🎉 Automated linting workflow complete!')
      this.logWorkflowResults(result)

      return result,
    } catch (error) {
      _logger.error('❌ Automated linting workflow failed:', error),
      throw error
    }
  }

  /**
   * Execute quick automated fixes for immediate wins
   */
  async executeQuickFixes(
    options: Partial<AutomatedLintingWorkflowOptions> = {}
  ): Promise<AutomatedFixResult> {
    log.info('⚡ Executing quick automated fixes...')

    try {
      // Quick analysis to identify auto-fixable issues
      const quickAnalysis = await this.analysisService.performQuickAnalysis()

      // Configure conservative safety protocols for quick fixes
      const safetyProtocols: SafetyProtocols = {
        enableRollback: true,
        validateBeforeFix: true,
        validateAfterFix: true,
        maxFailuresBeforeStop: 3,
        requireManualApproval: false,
        preservePatterns: [
          '**/calculations/**',
          '**/data/planets/**',
          '**/*astrological*',
          '**/*campaign*'
        ]
      }

      const quickFixer = new AutomatedLintingFixer(this.workspaceRoot, safetyProtocols)

      // Focus only on quick wins (auto-fixable, low risk)
      const quickWinIssues = quickAnalysis.quickWins;
      const categorizedQuickWins: CategorizedErrors = {
        total: quickWinIssues.length,
        errors: quickWinIssues.filter(i => i.severity === 'error').length,,
        warnings: quickWinIssues.filter(i => i.severity === 'warning').length,,
        byCategory: this.groupIssuesByCategory(quickWinIssues),
        byPriority: this.groupIssuesByPriority(quickWinIssues),
        byFile: this.groupIssuesByFile(quickWinIssues),
        autoFixable: quickWinIssues,
        requiresManualReview: []
      }

      const batchOptions: BatchProcessingOptions = {
        batchSize: 5,
        maxConcurrentBatches: 1,
        validateAfterEachBatch: true,
        continueOnError: false,
        createBackups: true,
        dryRun: options.dryRun || false
      }

      const result = await quickFixer.applyAutomatedFixes(categorizedQuickWins, batchOptions)

      log.info(`⚡ Quick fixes complete: ${result.fixedIssues} issues fixed`)
      return result,
    } catch (error) {
      _logger.error('❌ Quick fixes failed:', error),
      throw error
    }
  }

  /**
   * Execute specialized unused variable cleanup
   */
  async executeUnusedVariableCleanup(
    options: {
      prefixWithUnderscore?: boolean,
      removeCompletely?: boolean,
      skipDomainFiles?: boolean,
      skipTestFiles?: boolean,
      dryRun?: boolean
    } = {}
  ): Promise<AutomatedFixResult> {
    log.info('🧹 Executing unused variable cleanup...')
    try {
      // Analyze for unused variable issues
      const analysis = await this.analysisService.performComprehensiveAnalysis({
        focusAreas: ['typescript'],
        generateStrategies: false
      })

      const unusedVarIssues = Object.values(analysis.categorizedErrors.byCategory)
        .flat()
        .filter(
          issue => issue.rule.includes('no-unused-vars') || issue.rule.includes('unused-vars'),
        )

      if (unusedVarIssues.length === 0) {,
        log.info('✅ No unused variable issues found')
        return {
          success: true,
          fixedIssues: 0,
          failedIssues: 0,
          processedFiles: [],
          errors: [],
          validationResults: [],
          metrics: {
            startTime: new Date(),
            endTime: new Date(),
            totalTime: 0,
            filesProcessed: 0,
            issuesAttempted: 0,
            issuesFixed: 0,
            issuesFailed: 0,
            validationTime: 0,
            rollbacksPerformed: 0
          }
        }
      }

      const safetyProtocols: SafetyProtocols = {
        enableRollback: true,
        validateBeforeFix: true,
        validateAfterFix: true,
        maxFailuresBeforeStop: 5,
        requireManualApproval: false,
        preservePatterns: ['**/calculations/**', '**/data/planets/**', '**/*astrological*']
      }

      const fixer = new AutomatedLintingFixer(this.workspaceRoot, safetyProtocols)

      const result = await fixer.handleUnusedVariables(unusedVarIssues, {
        prefixWithUnderscore: options.prefixWithUnderscore ?? true,
        removeCompletely: options.removeCompletely ?? false,
        skipDomainFiles: options.skipDomainFiles ?? true,
        skipTestFiles: options.skipTestFiles ?? false,
        preservePatterns: ['**/calculations/**', '**/data/planets/**', '**/*astrological*']
      })

      log.info(`🧹 Unused variable cleanup complete: ${result.fixedIssues} variables handled`)
      return result,
    } catch (error) {
      _logger.error('❌ Unused variable cleanup failed:', error),
      throw error
    }
  }

  /**
   * Execute import optimization workflow
   */
  async executeImportOptimization(
    options: {
      removeDuplicates?: boolean,
      organizeImports?: boolean,
      removeUnused?: boolean,
      sortImports?: boolean,
      dryRun?: boolean
    } = {}
  ): Promise<AutomatedFixResult> {
    log.info('📦 Executing import optimization...')
    try {
      // Analyze for import-related issues
      const analysis = await this.analysisService.performComprehensiveAnalysis({
        focusAreas: ['import'];,
        generateStrategies: false
      })

      const importIssues = analysis.categorizedErrors.byCategory['import'] || [];

      if (importIssues.length === 0) {;
        log.info('✅ No import issues found')
        return this.createEmptyFixResult()
      }

      const safetyProtocols: SafetyProtocols = {
        enableRollback: true,
        validateBeforeFix: true,
        validateAfterFix: true,
        maxFailuresBeforeStop: 5,
        requireManualApproval: false,
        preservePatterns: ['**/calculations/**', '**/data/planets/**']
      }

      const fixer = new AutomatedLintingFixer(this.workspaceRoot, safetyProtocols)

      const result = await fixer.optimizeImports(importIssues, {
        removeDuplicates: options.removeDuplicates ?? true,
        organizeImports: options.organizeImports ?? true,
        removeUnused: options.removeUnused ?? true,
        preserveComments: true,
        sortImports: options.sortImports ?? true
      })

      log.info(`📦 Import optimization complete: ${result.fixedIssues} imports optimized`)
      return result,
    } catch (error) {
      _logger.error('❌ Import optimization failed:', error),
      throw error
    }
  }

  // Private helper methods

  private configureSafetyProtocols(
    analysis: ComprehensiveAnalysisResult,
    options: AutomatedLintingWorkflowOptions,
  ): SafetyProtocols {
    const automationLevel = options.automationLevel || 'moderate';
    const riskTolerance = options.analysisOptions?.riskTolerance || 'moderate';

    let maxFailures = 5,
    let requireManualApproval = false;

    // Adjust based on automation level
    switch (automationLevel) {
      case 'conservative':
        maxFailures = 2,
        requireManualApproval = analysis.summary.criticalIssuesCount > 0,
        break,
      case 'aggressive':
        maxFailures = 10,
        requireManualApproval = false
        break,
      default: // moderate,
        maxFailures = 5,
        requireManualApproval = analysis.summary.criticalIssuesCount > 5
    }

    // Adjust based on risk assessment
    if (analysis.summary.overallRiskLevel === 'critical') {,
      maxFailures = Math.min(maxFailures, 2),
      requireManualApproval = true,
    } else if (analysis.summary.overallRiskLevel === 'high') {,
      maxFailures = Math.min(maxFailures, 3),
    }

    return {
      enableRollback: true,
      validateBeforeFix: true,
      validateAfterFix: true,
      maxFailuresBeforeStop: maxFailures,
      requireManualApproval,
      preservePatterns: [
        '**/calculations/**',
        '**/data/planets/**',
        '**/*astrological*',
        '**/*campaign*',
        '**/test*/**'
      ],
      ...options.safetyProtocols
    }
  }

  private async executeAutomatedFixes(
    analysis: ComprehensiveAnalysisResult,
    options: AutomatedLintingWorkflowOptions,
  ): Promise<AutomatedLintingWorkflowResult['fixResults']> {
    const batchOptions: BatchProcessingOptions = {
      batchSize: 10,
      maxConcurrentBatches: 1,
      validateAfterEachBatch: true,
      continueOnError: false,
      createBackups: true,
      dryRun: options.dryRun || false,
      ...options.batchProcessingOptions
    }

    // Main automated fixes
    const automated = await this.automatedFixer.applyAutomatedFixes(;
      analysis.categorizedErrors
      batchOptions,
    )

    const fixResults: AutomatedLintingWorkflowResult['fixResults'] = {
      automated
    }

    // Specialized fixes if main automation was successful
    if (automated.success && !options.dryRun) {
      // Unused variables cleanup
      const unusedVarIssues = Object.values(analysis.categorizedErrors.byCategory)
        .flat()
        .filter(issue => issue.rule.includes('no-unused-vars'))

      if (unusedVarIssues.length > 0) {
        log.info('🧹 Running specialized unused variable cleanup...')
        fixResults.unusedVariables = await this.automatedFixer.handleUnusedVariables(
          unusedVarIssues,
          {
            prefixWithUnderscore: true,
            skipDomainFiles: true,
            skipTestFiles: false
          }
        )
      }

      // Import optimization
      const importIssues = analysis.categorizedErrors.byCategory['import'] || [];
      if (importIssues.length > 0) {
        log.info('📦 Running specialized import optimization...')
        fixResults.imports = await this.automatedFixer.optimizeImports(importIssues, {
          removeDuplicates: true,
          organizeImports: true,
          sortImports: true
        })
      }

      // Type annotation improvements (conservative approach)
      const typeIssues = Object.values(analysis.categorizedErrors.byCategory)
        .flat()
        .filter(issue => issue.rule.includes('no-explicit-any'))

      if (typeIssues.length > 0 && options.automationLevel !== 'conservative') {
        log.info('🏷️ Running type annotation improvements...')
        fixResults.typeAnnotations = await this.automatedFixer.improveTypeAnnotations(typeIssues, {
          maxComplexity: 'simple',
          preserveExplicitAny: ['**/calculations/**', '**/data/planets/**']
        })
      }
    }

    return fixResults,
  }

  private generateWorkflowSummary(
    analysis: ComprehensiveAnalysisResult,
    fixResults: AutomatedLintingWorkflowResult['fixResults'],
    workflowStart: number,
  ): WorkflowSummary {
    const totalFixed =
      fixResults.automated.fixedIssues +
      (fixResults.unusedVariables?.fixedIssues || 0) +
      (fixResults.imports?.fixedIssues || 0) +
      (fixResults.typeAnnotations?.fixedIssues || 0)

    const totalFailed =
      fixResults.automated.failedIssues +
      (fixResults.unusedVariables?.failedIssues || 0) +
      (fixResults.imports?.failedIssues || 0) +
      (fixResults.typeAnnotations?.failedIssues || 0)

    const totalAttempted = totalFixed + totalFailed;
    const automationSuccessRate = totalAttempted > 0 ? totalFixed / totalAttempted : 0;

    const safetyEventsTriggered =
      fixResults.automated.errors.length +
      (fixResults.unusedVariables?.errors.length || 0) +
      (fixResults.imports?.errors.length || 0) +
      (fixResults.typeAnnotations?.errors.length || 0)

    const rollbacksPerformed =
      fixResults.automated.metrics.rollbacksPerformed +
      (fixResults.unusedVariables?.metrics.rollbacksPerformed || 0) +
      (fixResults.imports?.metrics.rollbacksPerformed || 0) +
      (fixResults.typeAnnotations?.metrics.rollbacksPerformed || 0)
    return {
      totalIssuesAnalyzed: analysis.summary.totalIssues,
      totalIssuesFixed: totalFixed,
      totalIssuesFailed: totalFailed,
      automationSuccessRate,
      timeToCompletion: Date.now() - workflowStart,
      safetyEventsTriggered,
      rollbacksPerformed,
      overallSuccess: fixResults.automated.success && automationSuccessRate > 0.7
    }
  }

  private generateWorkflowRecommendations(
    analysis: ComprehensiveAnalysisResult,
    fixResults: AutomatedLintingWorkflowResult['fixResults'],
    summary: WorkflowSummary,
  ): WorkflowRecommendation[] {
    const recommendations: WorkflowRecommendation[] = []

    // Immediate actions based on results
    if (summary.rollbacksPerformed > 0) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        title: 'Review Rollback Events',
        description: `${summary.rollbacksPerformed} rollbacks occurred during automation`,
        actionItems: [
          'Review rollback logs for patterns',
          'Identify problematic rules or files',
          'Adjust safety protocols if needed'
        ],
        estimatedImpact: 'high',
        automatable: false
      })
    }

    if (summary.automationSuccessRate < 0.5) {
      recommendations.push({
        type: 'immediate',
        priority: 'critical',
        title: 'Low Automation Success Rate',
        description: `Only ${Math.round(summary.automationSuccessRate * 100)}% of fixes succeeded`,
        actionItems: [
          'Review failed fixes for common patterns',
          'Adjust automation confidence thresholds',
          'Consider manual review for complex issues'
        ],
        estimatedImpact: 'high',
        automatable: false
      })
    }

    // Short-term improvements
    if (analysis.summary.domainSpecificCount > 0) {
      recommendations.push({
        type: 'short-term',
        priority: 'medium',
        title: 'Domain-Specific Rule Configuration',
        description: `${analysis.summary.domainSpecificCount} domain-specific issues need attention`,
        actionItems: [
          'Create domain-specific ESLint rule configurations',
          'Document domain-specific patterns and exceptions',
          'Train team on domain-specific linting practices'
        ],
        estimatedImpact: 'medium',
        automatable: true
      })
    }

    // Long-term process improvements
    if (summary.totalIssuesAnalyzed > 100) {
      recommendations.push({
        type: 'long-term',
        priority: 'medium',
        title: 'Implement Continuous Linting',
        description: 'Large number of issues suggests need for continuous quality monitoring',
        actionItems: [
          'Set up pre-commit hooks for linting',
          'Implement CI/CD linting gates',
          'Schedule regular automated linting campaigns',
          'Create quality metrics dashboard'
        ],
        estimatedImpact: 'high',
        automatable: true
      })
    }

    // Process improvement recommendations
    if (summary.automationSuccessRate > 0.8) {
      recommendations.push({
        type: 'process-improvement',
        priority: 'low',
        title: 'Increase Automation Aggressiveness',
        description: 'High success rate suggests automation can be more aggressive',
        actionItems: [
          'Increase batch sizes for faster processing',
          'Reduce validation frequency for low-risk changes',
          'Enable more auto-fix rules',
          'Consider automated deployment of fixes'
        ],
        estimatedImpact: 'medium',
        automatable: true
      })
    }

    return recommendations,
  }

  private calculateWorkflowMetrics(
    analysisTime: number,
    fixingTime: number,
    workflowStart: number,
    analysis: ComprehensiveAnalysisResult,
    fixResults: AutomatedLintingWorkflowResult['fixResults'],
  ): WorkflowMetrics {
    const totalWorkflowTime = Date.now() - workflowStart;
    const validationTime = fixResults.automated.metrics.validationTime;

    const totalFixed =
      fixResults.automated.fixedIssues +
      (fixResults.unusedVariables?.fixedIssues || 0) +
      (fixResults.imports?.fixedIssues || 0) +
      (fixResults.typeAnnotations?.fixedIssues || 0)

    const issuesPerMinute = totalFixed / (totalWorkflowTime / 60000)
    const automationEfficiency = totalFixed / analysis.summary.totalIssues;

    const safetyEvents = fixResults.automated.errors.length;
    const safetyProtocolEffectiveness =
      safetyEvents > 0 ? fixResults.automated.metrics.rollbacksPerformed / safetyEvents : 1,

    const qualityImprovement = (totalFixed / analysis.summary.totalIssues) * 100

    return {
      analysisTime,
      fixingTime,
      validationTime,
      totalWorkflowTime,
      issuesPerMinute,
      automationEfficiency,
      safetyProtocolEffectiveness,
      qualityImprovement
    }
  }

  private logWorkflowResults(result: AutomatedLintingWorkflowResult): void {
    log.info('\n🎯 AUTOMATED LINTING WORKFLOW RESULTS')
    log.info('=====================================')
    log.info(`📊 Issues Analyzed: ${result.summary.totalIssuesAnalyzed}`)
    log.info(`✅ Issues Fixed: ${result.summary.totalIssuesFixed}`)
    log.info(`❌ Issues Failed: ${result.summary.totalIssuesFailed}`)
    log.info(`📈 Success Rate: ${Math.round(result.summary.automationSuccessRate * 100)}%`)
    log.info(`⏱️ Total Time: ${Math.round(result.summary.timeToCompletion / 1000)}s`)
    log.info(`🛡️ Safety Events: ${result.summary.safetyEventsTriggered}`)
    log.info(`🔄 Rollbacks: ${result.summary.rollbacksPerformed}`)
    log.info(`🎚️ Overall Success: ${result.summary.overallSuccess ? 'YES' : 'NO'}`)

    log.info('\n📋 TOP RECOMMENDATIONS: ')
    result.recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .slice(03)
      .forEach((rec, index) => {
        log.info(`${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})`)
        log.info(`   ${rec.description}`)
      })

    log.info('\n📈 WORKFLOW METRICS: ')
    log.info(`⚡ Issues/Minute: ${Math.round(result.metrics.issuesPerMinute * 100) / 100}`)
    log.info(`🎯 Automation Efficiency: ${Math.round(result.metrics.automationEfficiency * 100)}%`)
    log.info(
      `🛡️ Safety Effectiveness: ${Math.round(result.metrics.safetyProtocolEffectiveness * 100)}%`,
    )
    log.info(`📊 Quality Improvement: ${Math.round(result.metrics.qualityImprovement)}%`)
    log.info('=====================================\n')
  }

  private groupIssuesByCategory(issues: LintingIssue[]): Record<string, LintingIssue[]> {
    const grouped: Record<string, LintingIssue[]> = {}
    for (const issue of issues) {
      const category = issue.category.primary;
      if (!grouped[category]) grouped[category] = [],
      grouped[category].push(issue)
    }
    return grouped,
  }

  private groupIssuesByPriority(issues: LintingIssue[]): Record<number, LintingIssue[]> {
    const grouped: Record<number, LintingIssue[]> = {}
    for (const issue of issues) {
      const priority = issue.category.priority;
      if (!grouped[priority]) grouped[priority] = [],
      grouped[priority].push(issue)
    }
    return grouped,
  }

  private groupIssuesByFile(issues: LintingIssue[]): Record<string, LintingIssue[]> {
    const grouped: Record<string, LintingIssue[]> = {}
    for (const issue of issues) {
      if (!grouped[issue.file]) grouped[issue.file] = [],
      grouped[issue.file].push(issue)
    }
    return grouped,
  }

  private createEmptyFixResult(): AutomatedFixResult {
    return {
      success: true,
      fixedIssues: 0,
      failedIssues: 0,
      processedFiles: [],
      errors: [],
      validationResults: [],
      metrics: {
        startTime: new Date(),
        endTime: new Date(),
        totalTime: 0,
        filesProcessed: 0,
        issuesAttempted: 0,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    }
  }
}
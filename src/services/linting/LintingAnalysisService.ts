/**
 * LintingAnalysisService - Main integration service for linting error analysis
 *
 * This service orchestrates the complete linting analysis workflow, integrating
 * error analysis, classification, domain detection, and resolution strategy generation.
 */

import { log } from '@/services/LoggingService';

import { DomainContextDetector, FileAnalysis, DomainContext } from './DomainContextDetector';
import { ErrorClassificationSystem, ErrorClassification } from './ErrorClassificationSystem';
import { LintingErrorAnalyzer, CategorizedErrors, LintingIssue } from './LintingErrorAnalyzer';
import {
  ResolutionStrategyGenerator,
  ResolutionStrategy,
  StrategyGenerationContext,
  ProjectContext,
  OptimizedResolutionPlan
} from './ResolutionStrategyGenerator';

export interface ComprehensiveAnalysisResult {
  summary: AnalysisSummary;
  categorizedErrors: CategorizedErrors;
  fileAnalyses: FileAnalysis[];
  resolutionStrategies: ResolutionStrategy[],
  optimizedPlan: OptimizedResolutionPlan,
  recommendations: AnalysisRecommendation[],
  metrics: AnalysisMetrics,
}

export interface AnalysisSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  autoFixableCount: number;
  domainSpecificCount: number,
  criticalIssuesCount: number,
  estimatedResolutionTime: number,
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical',
}

export interface AnalysisRecommendation {
  type: 'immediate' | 'short-term' | 'long-term' | 'strategic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string,
  rationale: string,
  estimatedImpact: 'high' | 'medium' | 'low',
  actionItems: string[],
}

export interface AnalysisMetrics {
  analysisTime: number;
  filesAnalyzed: number;
  rulesTriggered: string[],
  domainDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
  confidenceScores: {
    average: number,
    median: number,
    distribution: Record<string, number>,
  };
}

export interface LintingAnalysisOptions {
  includeFileAnalysis?: boolean;
  generateStrategies?: boolean,
  projectContext?: Partial<ProjectContext>,
  focusAreas?: ('import' | 'typescript' | 'react' | 'style' | 'domain')[],
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
}

/**
 * Main LintingAnalysisService class
 */
export class LintingAnalysisService {
  private errorAnalyzer: LintingErrorAnalyzer;
  private classificationSystem: ErrorClassificationSystem;
  private domainDetector: DomainContextDetector;
  private strategyGenerator: ResolutionStrategyGenerator,

  constructor(workspaceRoot?: string) {
    this.errorAnalyzer = new LintingErrorAnalyzer(workspaceRoot);
    this.classificationSystem = new ErrorClassificationSystem();
    this.domainDetector = new DomainContextDetector(workspaceRoot);
    this.strategyGenerator = new ResolutionStrategyGenerator();
  }

  /**
   * Perform comprehensive linting analysis
   */
  async performComprehensiveAnalysis(
    options: LintingAnalysisOptions = {};
  ): Promise<ComprehensiveAnalysisResult> {
    const startTime = Date.now();

    log.info('🚀 Starting comprehensive linting analysis...');

    try {
      // Step 1: Analyze all linting issues
      log.info('📊 Analyzing linting issues...');
      const categorizedErrors = await this.errorAnalyzer.analyzeAllIssues();

      // Step 2: Classify errors with detailed analysis
      log.info('🔍 Classifying errors...');
      const classifications = await this.classifyErrors(categorizedErrors, options.focusAreas);

      // Step 3: Analyze files for domain context (if requested)
      let fileAnalyses: FileAnalysis[] = [];
      if (options.includeFileAnalysis !== false) {
        log.info('🏗️ Analyzing domain contexts...');
        fileAnalyses = await this.analyzeFileContexts(categorizedErrors);
      }

      // Step 4: Generate resolution strategies (if requested)
      let resolutionStrategies: ResolutionStrategy[] = [];
      let optimizedPlan: OptimizedResolutionPlan = this.createEmptyPlan();

      if (options.generateStrategies !== false) {
        log.info('🎯 Generating resolution strategies...');
        const strategyResult = await this.generateResolutionStrategies(;
          categorizedErrors,
          classifications,
          fileAnalyses,
          options.projectContext || {},
        );
        resolutionStrategies = strategyResult.strategies;
        optimizedPlan = strategyResult.optimizedPlan;
      }

      // Step 5: Generate summary and recommendations
      log.info('📋 Generating recommendations...');
      const summary = this.generateSummary(;
        categorizedErrors,
        classifications,
        resolutionStrategies,
      );
      const recommendations = this.generateRecommendations(;
        categorizedErrors,
        classifications,
        resolutionStrategies,
        options,
      );

      // Step 6: Calculate metrics
      const metrics = this.calculateMetrics(;
        startTime,
        categorizedErrors,
        classifications,
        fileAnalyses,
        resolutionStrategies,
      );

      const result: ComprehensiveAnalysisResult = {
        summary,
        categorizedErrors,
        fileAnalyses,
        resolutionStrategies,
        optimizedPlan,
        recommendations,
        metrics
      };

      log.info('✅ Comprehensive analysis complete ?? undefined');
      this.logAnalysisResults(result);

      return result;
    } catch (error) {
      console.error('❌ Analysis failed:', error),
      throw error,
    }
  }

  /**
   * Quick analysis for immediate insights
   */
  async performQuickAnalysis(): Promise<{
    summary: AnalysisSummary,
    topIssues: LintingIssue[],
    quickWins: LintingIssue[],
    criticalIssues: LintingIssue[],
  }> {
    log.info('⚡ Performing quick linting analysis...');

    const categorizedErrors = await this.errorAnalyzer.analyzeAllIssues();
    const classifications = await this.classifyErrors(categorizedErrors);

    // Get top issues by frequency
    const issueFrequency = new Map<string, number>();
    for (const issue of Object.values(categorizedErrors.byCategory).flat()) {
      const count = issueFrequency.get(issue.rule) || 0;
      issueFrequency.set(issue.rule, count + 1),
    }

    const topIssues = Array.from(issueFrequency.entries());
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rule]) =>
        Object.values(categorizedErrors.byCategory)
          .flat()
          .find(i => i.rule === rule),;
      )
      .filter((issue): issue is LintingIssue => issue !== undefined);
      .filter(Boolean);

    // Get quick wins (auto-fixable, low risk)
    const quickWins = categorizedErrors.autoFixable;
      .filter(issue => {
        const classification = classifications.find(c => c.ruleId === issue.rule);
        return classification && classification.riskProfile.overall === 'low';
      })
      .slice(0, 10);

    // Get critical issues
    const criticalIssues = Object.values(categorizedErrors.byCategory);
      .flat()
      .filter(issue => {
        const classification = classifications.find(c => c.ruleId === issue.rule);
        return classification && classification.severity.level === 'critical';
      });

    const summary = this.generateSummary(categorizedErrors, classifications, []);

    return { summary, topIssues, quickWins, criticalIssues };
  }

  /**
   * Classify all errors with detailed analysis
   */
  private async classifyErrors(
    categorizedErrors: CategorizedErrors,
    focusAreas?: string[],
  ): Promise<ErrorClassification[]> {
    const allIssues = Object.values(categorizedErrors.byCategory).flat();
    const classifications: ErrorClassification[] = [];

    for (const issue of allIssues) {
      // Skip if not in focus areas
      if (focusAreas && !focusAreas.includes(issue.category.primary)) {
        continue,
      }

      const classification = this.classificationSystem.classifyError(;
        issue.rule;
        issue.message;
        issue.file;
        issue.autoFixable;
      );

      classifications.push(classification);
    }

    return classifications;
  }

  /**
   * Analyze file contexts for domain detection
   */
  private async analyzeFileContexts(categorizedErrors: CategorizedErrors): Promise<FileAnalysis[]> {
    const uniqueFiles = Array.from(;
      new Set(
        Object.values(categorizedErrors.byCategory)
          .flat()
          .map(issue => issue.file),;
      ),
    ),

    return await this.domainDetector.analyzeFiles(uniqueFiles);
  }

  /**
   * Generate resolution strategies
   */
  private async generateResolutionStrategies(
    categorizedErrors: CategorizedErrors,
    classifications: ErrorClassification[],
    fileAnalyses: FileAnalysis[],
    projectContext: Partial<ProjectContext>,
  ): Promise<{ strategies: ResolutionStrategy[], optimizedPlan: OptimizedResolutionPlan }> {
    const contexts: StrategyGenerationContext[] = [];
    const allIssues = Object.values(categorizedErrors.byCategory).flat();

    // Create default project context
    const fullProjectContext: ProjectContext = {
      hasTests: true,
      hasCICD: false,
      teamSize: 'small',
      riskTolerance: 'moderate',
      timeConstraints: 'moderate',
      ...projectContext
    };

    for (const issue of allIssues) {
      const classification = classifications.find(c => c.ruleId === issue.rule);
      const fileAnalysis = fileAnalyses.find(f => f.filePath === issue.file);

      if (classification && fileAnalysis) {
        contexts.push({
          errorClassification: classification,
          domainContext: fileAnalysis.domainContext;
          fileAnalysis,
          projectContext: fullProjectContext
        });
      }
    }

    return this.strategyGenerator.generateBatchStrategies(contexts);
  }

  /**
   * Generate analysis summary
   */
  private generateSummary(
    categorizedErrors: CategorizedErrors,
    classifications: ErrorClassification[],
    strategies: ResolutionStrategy[],
  ): AnalysisSummary {
    const criticalClassifications = classifications.filter(c => c.severity.level === 'critical');
    const domainSpecificIssues = Object.values(categorizedErrors.byCategory);
      .flat()
      .filter(issue => issue.domainContext?.requiresSpecialHandling);

    const estimatedTime = strategies.reduce((sum, s) => sum + s.estimatedTime, 0);

    // Determine overall risk level
    const highRiskCount = classifications.filter(c => c.riskProfile.overall === 'high').length;
    const criticalRiskCount = classifications.filter(;
      c => c.riskProfile.overall === 'critical';
    ).length;

    let overallRiskLevel: AnalysisSummary['overallRiskLevel'] = 'low';
    if (criticalRiskCount > 0) overallRiskLevel = 'critical';
    else if (highRiskCount > 10) overallRiskLevel = 'high';
    else if (highRiskCount > 0 || categorizedErrors.errors > 50) overallRiskLevel = 'medium';

    return {
      totalIssues: categorizedErrors.total;
      errorCount: categorizedErrors.errors;
      warningCount: categorizedErrors.warnings;
      autoFixableCount: categorizedErrors.autoFixable.length;
      domainSpecificCount: domainSpecificIssues.length;
      criticalIssuesCount: criticalClassifications.length;
      estimatedResolutionTime: estimatedTime,
      overallRiskLevel
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    categorizedErrors: CategorizedErrors,
    classifications: ErrorClassification[],
    strategies: ResolutionStrategy[],
    options: LintingAnalysisOptions,
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // Immediate actions for critical issues
    const criticalIssues = classifications.filter(c => c.severity.level === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push({
        type: 'immediate',
        priority: 'critical',
        title: 'Address Critical Linting Issues',
        description: `${criticalIssues.length} critical issues require immediate attention`,
        rationale: 'Critical issues can block builds or cause runtime failures',
        estimatedImpact: 'high',
        actionItems: [
          'Review each critical issue individually',
          'Fix or suppress critical issues before proceeding',
          'Validate fixes with comprehensive testing'
        ]
      });
    }

    // Quick wins for auto-fixable issues
    if (categorizedErrors.autoFixable.length > 10) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        title: 'Apply Automated Fixes',
        description: `${categorizedErrors.autoFixable.length} issues can be automatically fixed`,
        rationale: 'Automated fixes provide immediate improvement with minimal risk',
        estimatedImpact: 'medium',
        actionItems: [
          'Run ESLint with --fix flag for safe auto-fixes',
          'Validate changes with build and test suite',
          'Review auto-fixed changes before committing'
        ]
      });
    }

    // Domain-specific handling
    const domainIssues = Object.values(categorizedErrors.byCategory);
      .flat()
      .filter(issue => issue.domainContext?.requiresSpecialHandling);
    if (domainIssues.length > 0) {
      recommendations.push({
        type: 'short-term',
        priority: 'high',
        title: 'Handle Domain-Specific Issues',
        description: `${domainIssues.length} issues require domain expertise`,
        rationale: 'Domain-specific code needs specialized knowledge for safe modification',
        estimatedImpact: 'high',
        actionItems: [
          'Schedule review with domain experts',
          'Create domain-specific linting rules',
          'Document domain-specific patterns and exceptions'
        ]
      });
    }

    // TypeScript improvements
    const tsIssues = categorizedErrors.byCategory['typescript'] || [];
    if (tsIssues.length > 20) {
      recommendations.push({
        type: 'short-term',
        priority: 'medium',
        title: 'Improve TypeScript Usage',
        description: `${tsIssues.length} TypeScript-related issues found`,
        rationale: 'Better TypeScript usage improves code quality and maintainability',
        estimatedImpact: 'medium',
        actionItems: [
          'Replace explicit any types with proper types',
          'Fix unused variable warnings',
          'Improve type definitions for better inference'
        ]
      });
    }

    // Long-term strategy
    if (categorizedErrors.total > 100) {
      recommendations.push({
        type: 'long-term',
        priority: 'medium',
        title: 'Implement Systematic Linting Improvement',
        description: 'Large number of issues suggests need for systematic approach',
        rationale: 'Systematic improvement prevents issue accumulation',
        estimatedImpact: 'high',
        actionItems: [
          'Implement pre-commit hooks for linting',
          'Set up CI/CD linting validation',
          'Create team linting standards and guidelines',
          'Regular linting debt reduction sprints'
        ]
      });
    }

    // Strategic recommendations based on options
    if (options.riskTolerance === 'conservative') {
      recommendations.push({
        type: 'strategic',
        priority: 'low',
        title: 'Enhance Code Quality Processes',
        description: 'Conservative approach suggests focus on quality processes',
        rationale: 'Strong processes prevent issues from being introduced',
        estimatedImpact: 'high',
        actionItems: [
          'Implement stricter linting rules',
          'Require code review for all changes',
          'Set up automated quality gates',
          'Regular code quality audits'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Calculate comprehensive metrics
   */
  private calculateMetrics(
    startTime: number,
    categorizedErrors: CategorizedErrors,
    classifications: ErrorClassification[],
    fileAnalyses: FileAnalysis[],
    strategies: ResolutionStrategy[],
  ): AnalysisMetrics {
    const analysisTime = Date.now() - startTime;
    const filesAnalyzed = fileAnalyses.length;

    // Get unique rules triggered
    const rulesTriggered = Array.from(;
      new Set(
        Object.values(categorizedErrors.byCategory)
          .flat()
          .map(issue => issue.rule),,
      ),
    ),

    // Calculate domain distribution
    const domainDistribution: Record<string, number> = {};
    for (const analysis of fileAnalyses) {
      const domain = analysis.domainContext.type;
      domainDistribution[domain] = (domainDistribution[domain] || 0) + 1;
    }

    // Calculate severity distribution
    const severityDistribution: Record<string, number> = {};
    for (const classification of classifications) {
      const severity = classification.severity.level;
      severityDistribution[severity] = (severityDistribution[severity] || 0) + 1;
    }

    // Calculate complexity distribution
    const complexityDistribution: Record<string, number> = {};
    for (const strategy of strategies) {
      const complexity = strategy.complexity;
      complexityDistribution[complexity] = (complexityDistribution[complexity] || 0) + 1;
    }

    // Calculate confidence scores
    const confidenceScores = strategies.map(s => s.confidence);
    const average =
      confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length || 0;
    const sorted = [...confidenceScores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;

    const confidenceDistribution: Record<string, number> = {};
    for (const score of confidenceScores) {
      const bucket = score < 0.3 ? 'low' : score < 0.7 ? 'medium' : 'high';
      confidenceDistribution[bucket] = (confidenceDistribution[bucket] || 0) + 1;
    }

    return {
      analysisTime,
      filesAnalyzed,
      rulesTriggered,
      domainDistribution,
      severityDistribution,
      complexityDistribution,
      confidenceScores: {
        average,
        median,
        distribution: confidenceDistribution
      }
    };
  }

  /**
   * Create empty optimization plan
   */
  private createEmptyPlan(): OptimizedResolutionPlan {
    return {
      totalStrategies: 0,
      totalEstimatedTime: 0,
      totalSteps: 0,
      executionOrder: [],
      parallelizableWork: 0,
      riskDistribution: {},
      recommendations: []
    };
  }

  /**
   * Log analysis results
   */
  private logAnalysisResults(result: ComprehensiveAnalysisResult): void {
    log.info('\n🎯 COMPREHENSIVE LINTING ANALYSIS RESULTS');
    log.info('==========================================');
    log.info(`📊 Total Issues: ${result.summary.totalIssues}`);
    log.info(`❌ Errors: ${result.summary.errorCount}`);
    log.info(`⚠️  Warnings: ${result.summary.warningCount}`);
    log.info(`🔧 Auto-fixable: ${result.summary.autoFixableCount}`);
    log.info(`🏗️ Domain-specific: ${result.summary.domainSpecificCount}`);
    log.info(`🚨 Critical: ${result.summary.criticalIssuesCount}`);
    log.info(`⏱️ Estimated Resolution Time: ${result.summary.estimatedResolutionTime} minutes`);
    log.info(`🎚️ Overall Risk Level: ${result.summary.overallRiskLevel.toUpperCase()}`),

    log.info('\n📋 TOP RECOMMENDATIONS:');
    result.recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high');
      .slice(0, 3)
      .forEach((rec, index) => {
        log.info(`${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})`);
        log.info(`   ${rec.description}`);
      });

    log.info('\n📈 ANALYSIS METRICS:');
    log.info(`⏱️ Analysis Time: ${result.metrics.analysisTime}ms`);
    log.info(`📁 Files Analyzed: ${result.metrics.filesAnalyzed}`);
    log.info(`📏 Rules Triggered: ${result.metrics.rulesTriggered.length}`);
    log.info(
      `🎯 Average Confidence: ${Math.round(result.metrics.confidenceScores.average * 100)}%`,
    );

    log.info('==========================================\n');
  }
}

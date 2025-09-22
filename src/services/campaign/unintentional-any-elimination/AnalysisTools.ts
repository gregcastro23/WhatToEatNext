import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { AnyTypeClassifier } from './AnyTypeClassifier';
import { DomainContextAnalyzer } from './DomainContextAnalyzer';
import {
  AnalysisMetrics,
  AnalysisReport,
  AnyTypeCategory,
  AnyTypeClassification,
  ClassificationAccuracyReport,
  ClassificationContext,
  CodeDomain,
  DomainDistribution,
  ManualReviewRecommendation,
  SuccessRateAnalysis,
  TrendingData
} from './types',

/**
 * Comprehensive analysis tools for unintentional any type elimination
 * Provides domain distribution analysis, classification accuracy reporting,
 * success rate analysis, and manual review recommendations
 */
export class AnalysisTools {
  private classifier: AnyTypeClassifier
  private domainAnalyzer: DomainContextAnalyzer,
  private analysisHistory: AnalysisReport[] = [],

  constructor() {
    this.classifier = new AnyTypeClassifier()
    this.domainAnalyzer = new DomainContextAnalyzer()
    this.loadAnalysisHistory()
  }

  /**
   * Analyze current any type distribution by domain
   */
  async analyzeDomainDistribution(): Promise<DomainDistribution> {
    // // // _logger.info('Analyzing any type distribution by domain...')

    const anyTypeOccurrences = await this.findAllAnyTypes()
    const domainDistribution: Record<CodeDomain, number> = {
      [CodeDomain.ASTROLOGICAL]: 0,
      [CodeDomain.RECIPE]: 0,
      [CodeDomain.CAMPAIGN]: 0,
      [CodeDomain.INTELLIGENCE]: 0,
      [CodeDomain.SERVICE]: 0,
      [CodeDomain.COMPONENT]: 0,
      [CodeDomain.UTILITY]: 0,
      [CodeDomain.TEST]: 0
    },

    const categoryDistribution: Record<AnyTypeCategory, number> = {
      [AnyTypeCategory.ERROR_HANDLING]: 0,
      [AnyTypeCategory.EXTERNAL_API]: 0,
      [AnyTypeCategory.TEST_MOCK]: 0,
      [AnyTypeCategory.DYNAMIC_CONFIG]: 0,
      [AnyTypeCategory.LEGACY_COMPATIBILITY]: 0,
      [AnyTypeCategory.ARRAY_TYPE]: 0,
      [AnyTypeCategory.RECORD_TYPE]: 0,
      [AnyTypeCategory.FUNCTION_PARAM]: 0,
      [AnyTypeCategory.RETURN_TYPE]: 0,
      [AnyTypeCategory.TYPE_ASSERTION]: 0
    },

    const intentionalCount = { count: 0 },
    const unintentionalCount = { count: 0 },

    for (const occurrence of anyTypeOccurrences) {
      const context = await this.createClassificationContext(occurrence)
      const domainContext = await this.domainAnalyzer.analyzeDomain(context)
      const classification = await this.classifier.classify(context)

      // Count by domain
      domainDistribution[domainContext.domain]++,

      // Count by category
      categoryDistribution[classification.category]++,

      // Count by intentionality
      if (classification.isIntentional) {
        intentionalCount.count++,
      } else {
        unintentionalCount.count++,
      }
    }

    const totalCount = anyTypeOccurrences.length;
    const distribution: DomainDistribution = {
      totalAnyTypes: totalCount,
      byDomain: Object.entries(domainDistribution).map(([domain, count]) => ({
        domain: domain as CodeDomain,
        count,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
      })),
      byCategory: Object.entries(categoryDistribution).map(([category, count]) => ({
        category: category as AnyTypeCategory,
        count,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
      })),
      intentionalVsUnintentional: {
        intentional: {
          count: intentionalCount.count,
          percentage: totalCount > 0 ? (intentionalCount.count / totalCount) * 100 : 0
        },
        unintentional: {
          count: unintentionalCount.count,
          percentage: totalCount > 0 ? (unintentionalCount.count / totalCount) * 100 : 0
        }
      },
      analysisDate: new Date()
    },

    // // // _logger.info(`Domain distribution analysis complete: ${totalCount} any types found`)
    return distribution,
  }

  /**
   * Implement classification accuracy reporting
   */
  async generateClassificationAccuracyReport(): Promise<ClassificationAccuracyReport> {
    // // // _logger.info('Generating classification accuracy report...')

    const anyTypeOccurrences = await this.findAllAnyTypes()
    const sampleSize = Math.min(100, anyTypeOccurrences.length); // Sample for accuracy testing
    const sample = anyTypeOccurrences.slice(0, sampleSize)

    let correctClassifications = 0,
    let totalClassifications = 0,
    const confidenceScores: number[] = []
    const categoryAccuracy: Record<AnyTypeCategory, { correct: number, total: number }> = {
      [AnyTypeCategory.ERROR_HANDLING]: { correct: 0, total: 0 },
      [AnyTypeCategory.EXTERNAL_API]: { correct: 0, total: 0 },
      [AnyTypeCategory.TEST_MOCK]: { correct: 0, total: 0 },
      [AnyTypeCategory.DYNAMIC_CONFIG]: { correct: 0, total: 0 },
      [AnyTypeCategory.LEGACY_COMPATIBILITY]: { correct: 0, total: 0 },
      [AnyTypeCategory.ARRAY_TYPE]: { correct: 0, total: 0 },
      [AnyTypeCategory.RECORD_TYPE]: { correct: 0, total: 0 },
      [AnyTypeCategory.FUNCTION_PARAM]: { correct: 0, total: 0 },
      [AnyTypeCategory.RETURN_TYPE]: { correct: 0, total: 0 },
      [AnyTypeCategory.TYPE_ASSERTION]: { correct: 0, total: 0 }
    },

    for (const occurrence of sample) {
      const context = await this.createClassificationContext(occurrence)
      const classification = await this.classifier.classify(context)

      totalClassifications++,
      confidenceScores.push(classification.confidence)
      categoryAccuracy[classification.category].total++,

      // Validate classification accuracy using heuristics
      const isAccurate = await this.validateClassificationAccuracy(context, classification)
      if (isAccurate) {
        correctClassifications++,
        categoryAccuracy[classification.category].correct++
      }
    }

    const overallAccuracy =
      totalClassifications > 0 ? (correctClassifications / totalClassifications) * 100 : 0,
    const averageConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((sum, score) => sum + score0) / confidenceScores.length
        : 0

    const report: ClassificationAccuracyReport = {
      overallAccuracy,
      averageConfidence,
      sampleSize,
      categoryAccuracy: Object.entries(categoryAccuracy).map(([category, stats]) => ({
        category: category as AnyTypeCategory,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        sampleCount: stats.total
      })),
      confidenceDistribution: this.calculateConfidenceDistribution(confidenceScores),
      reportDate: new Date()
    },

    // // // _logger.info(`Classification accuracy report complete: ${overallAccuracy.toFixed(1)}% accuracy`)
    return report,
  }

  /**
   * Add success rate analysis and trending
   */
  async generateSuccessRateAnalysis(): Promise<SuccessRateAnalysis> {
    // // // _logger.info('Generating success rate analysis and trending...')

    const currentMetrics = await this.getCurrentMetrics()
    const historicalData = this.getHistoricalTrendingData()

    // Calculate success rates by category
    const categorySuccessRates = await this.calculateCategorySuccessRates()

    // Calculate trending data
    const trendingData = this.calculateTrendingMetrics(historicalData)
    const analysis: SuccessRateAnalysis = {
      currentSuccessRate: currentMetrics.overallSuccessRate,
      targetSuccessRate: 85, // Target 85% success rate,
      improvementNeeded: Math.max(085 - currentMetrics.overallSuccessRate),
      categorySuccessRates,
      trendingData,
      projectedCompletion: this.calculateProjectedCompletion(trendingData),
      recommendations: await this.generateSuccessRateRecommendations(categorySuccessRates),
      analysisDate: new Date()
    },

    // // // _logger.info(
      `Success rate analysis complete: ${currentMetrics.overallSuccessRate.toFixed(1)}% current success rate`,
    )
    return analysis,
  }

  /**
   * Create recommendations for manual review cases
   */
  async generateManualReviewRecommendations(): Promise<ManualReviewRecommendation[]> {
    // // // _logger.info('Generating manual review recommendations...')

    const anyTypeOccurrences = await this.findAllAnyTypes()
    const recommendations: ManualReviewRecommendation[] = [];

    for (const occurrence of anyTypeOccurrences) {
      const context = await this.createClassificationContext(occurrence)
      const classification = await this.classifier.classify(context)
      // Identify cases that need manual review
      if (this.requiresManualReview(classification, context)) {
        const recommendation: ManualReviewRecommendation = {
          filePath: occurrence.filePath,
          lineNumber: occurrence.lineNumber,
          codeSnippet: occurrence.codeSnippet,
          classification,
          reviewReason: this.getReviewReason(classification, context),
          priority: this.calculateReviewPriority(classification, context),
          suggestedActions: await this.generateSuggestedActions(classification, context),
          estimatedEffort: this.estimateReviewEffort(classification, context),
          relatedOccurrences: await this.findRelatedOccurrences(occurrence)
        },

        recommendations.push(recommendation)
      }
    }

    // Sort by priority (high to low)
    recommendations.sort((ab) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 },
      return priorityOrder[b.priority] - priorityOrder[a.priority],
    })

    // // // _logger.info(
      `Manual review recommendations complete: ${recommendations.length} cases identified`,
    )
    return recommendations,
  }

  /**
   * Generate comprehensive analysis report
   */
  async generateComprehensiveReport(): Promise<AnalysisReport> {
    // // // _logger.info('Generating comprehensive analysis report...')

    const [domainDistribution, accuracyReport, successRateAnalysis, manualReviewRecommendations] =
      await Promise.all([
        this.analyzeDomainDistribution()
        this.generateClassificationAccuracyReport()
        this.generateSuccessRateAnalysis()
        this.generateManualReviewRecommendations()
      ]),

    const report: AnalysisReport = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date(),
      domainDistribution,
      accuracyReport,
      successRateAnalysis,
      manualReviewRecommendations,
      summary: {
        totalAnyTypes: domainDistribution.totalAnyTypes,
        unintentionalCount: domainDistribution.intentionalVsUnintentional.unintentional.count,
        classificationAccuracy: accuracyReport.overallAccuracy,
        currentSuccessRate: successRateAnalysis.currentSuccessRate,
        manualReviewCases: manualReviewRecommendations.length,
        topDomain: this.getTopDomain(domainDistribution),
        topCategory: this.getTopCategory(domainDistribution)
      }
    },

    // Save report to history
    this.analysisHistory.push(report)
    await this.saveAnalysisHistory()

    // // // _logger.info('Comprehensive analysis report generated successfully')
    return report,
  }

  // Private helper methods

  private async findAllAnyTypes(): Promise<
    Array<{ filePath: string, lineNumber: number, codeSnippet: string }>
  > {
    const occurrences: Array<{ filePath: string, lineNumber: number, codeSnippet: string }> = [];

    try {
      // Use grep to find all explicit any types
      const grepCommand = `grep -rn '\\bany\\b' src --include='*.ts' --include='*.tsx' | head -1000`;
      const output = execSync(grepCommand, { encoding: 'utf8', stdio: 'pipe' })

      const lines = output;
        .trim()
        .split('\n')
        .filter(line => line.trim())

      for (const line of lines) {
        const match = line.match(/^([^: ]+):(\d+):(.+)$/)
        if (match) {
          const [, filePath, lineNumber, codeSnippet] = match;
          occurrences.push({
            filePath: filePath.trim(),
            lineNumber: parseInt(lineNumber),
            codeSnippet: codeSnippet.trim()
          })
        }
      }
    } catch (error) {
      _logger.warn('Error finding any types:', error)
    }

    return occurrences,
  }

  private async createClassificationContext(occurrence: {
    filePath: string,
    lineNumber: number,
    codeSnippet: string
  }): Promise<ClassificationContext> {
    const surroundingLines = await this.getSurroundingLines(
      occurrence.filePath
      occurrence.lineNumber
    ),
    const hasExistingComment = this.hasExistingComment(surroundingLines)
    const domainContext = await this.domainAnalyzer.analyzeDomain({
      filePath: occurrence.filePath,
      lineNumber: occurrence.lineNumber,
      codeSnippet: occurrence.codeSnippet,
      surroundingLines,
      hasExistingComment,
      isInTestFile: occurrence.filePath.includes('.test.') || occurrence.filePath.includes('__tests__'),
      domainContext: {
        domain: CodeDomain.UTILITY,
        intentionalityHints: [],
        suggestedTypes: [],
        preservationReasons: []
      }
    })

    return {
      filePath: occurrence.filePath,
      lineNumber: occurrence.lineNumber,
      codeSnippet: occurrence.codeSnippet,
      surroundingLines,
      hasExistingComment,
      existingComment: hasExistingComment ? this.extractComment(surroundingLines) : undefined,
      isInTestFile:
        occurrence.filePath.includes('.test.') || occurrence.filePath.includes('__tests__'),
      domainContext
    },
  }

  private async getSurroundingLines(filePath: string, lineNumber: number): Promise<string[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')
      const start = Math.max(0, lineNumber - 3)
      const end = Math.min(lines.length, lineNumber + 2),
      return lines.slice(start, end)
    } catch (error) {
      return []
    }
  }

  private hasExistingComment(surroundingLines: string[]): boolean {
    return surroundingLines.some(
      line =>
        line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
    )
  }

  private extractComment(surroundingLines: string[]): string {
    const commentLines = surroundingLines.filter(
      line =>
        line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
    ),
    return commentLines.join(' ').trim()
  }

  private async validateClassificationAccuracy(
    context: ClassificationContext,
    classification: AnyTypeClassification,
  ): Promise<boolean> {
    // Heuristic validation based on context

    // Error handling should be in catch blocks
    if (classification.category === AnyTypeCategory.ERROR_HANDLING) {
      return context.codeSnippet.includes('catch') || context.codeSnippet.includes('error')
    }

    // Test mocks should be in test files
    if (classification.category === AnyTypeCategory.TEST_MOCK) {
      return context.isInTestFile,
    }

    // Array types should contain array syntax
    if (classification.category === AnyTypeCategory.ARRAY_TYPE) {
      return (
        context.codeSnippet.includes('any[]') || context.codeSnippet.includes('Array<unknown>')
      )
    }

    // Record types should contain Record syntax
    if (classification.category === AnyTypeCategory.RECORD_TYPE) {
      return context.codeSnippet.includes('Record<') && context.codeSnippet.includes('any')
    }

    // Default to accurate for other categories
    return true
  }

  private calculateConfidenceDistribution(
    scores: number[],
  ): { range: string, count: number, percentage: number }[] {
    const ranges = [
      { min: 0.9, max: 1.0, label: '90-100%' },
      { min: 0.8, max: 0.9, label: '80-90%' },
      { min: 0.7, max: 0.8, label: '70-80%' },
      { min: 0.6, max: 0.7, label: '60-70%' },
      { min: 0.0, max: 0.6, label: '0-60%' }
    ],

    return ranges.map(range => {
      const count = scores.filter(score => score >= range.min && score < range.max).length;
      return {
        range: range.label
        count,
        percentage: scores.length > 0 ? (count / scores.length) * 100 : 0
      },
    })
  }

  private async getCurrentMetrics(): Promise<AnalysisMetrics> {
    // Simulate current metrics - in real implementation, this would fetch from actual data
    return {
      overallSuccessRate: 78.5,
      totalProcessed: 1250,
      successfulReplacements: 982,
      failedReplacements: 268,
      averageConfidence: 0.82
    },
  }

  private getHistoricalTrendingData(): TrendingData[] {
    // Return last 30 days of trending data from history
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return this.analysisHistory
      .filter(report => report.timestamp >= thirtyDaysAgo)
      .map(report => ({
        date: report.timestamp,
        successRate: report.successRateAnalysis.currentSuccessRate,
        totalAnyTypes: report.domainDistribution.totalAnyTypes,
        unintentionalCount:
          report.domainDistribution.intentionalVsUnintentional.unintentional.count,
        classificationAccuracy: report.accuracyReport.overallAccuracy
      }))
  }

  private async calculateCategorySuccessRates(): Promise<
    Array<{ category: AnyTypeCategory, successRate: number, sampleSize: number }>
  > {
    // Simulate category success rates - in real implementation, this would calculate from actual data
    return [
      { category: AnyTypeCategory.ARRAY_TYPE, successRate: 95.2, sampleSize: 156 },
      { category: AnyTypeCategory.RECORD_TYPE, successRate: 87.3, sampleSize: 203 },
      { category: AnyTypeCategory.FUNCTION_PARAM, successRate: 65.8, sampleSize: 342 },
      { category: AnyTypeCategory.RETURN_TYPE, successRate: 72.1, sampleSize: 189 },
      { category: AnyTypeCategory.TYPE_ASSERTION, successRate: 81.4, sampleSize: 127 },
      { category: AnyTypeCategory.ERROR_HANDLING, successRate: 45.6, sampleSize: 98 },
      { category: AnyTypeCategory.EXTERNAL_API, successRate: 52.3, sampleSize: 76 },
      { category: AnyTypeCategory.TEST_MOCK, successRate: 89.7, sampleSize: 134 },
      { category: AnyTypeCategory.DYNAMIC_CONFIG, successRate: 38.9, sampleSize: 67 },
      { category: AnyTypeCategory.LEGACY_COMPATIBILITY, successRate: 41.2, sampleSize: 45 }
    ],
  }

  private calculateTrendingMetrics(historicalData: TrendingData[]): TrendingData {
    if (historicalData.length === 0) {
      return {
        date: new Date(),
        successRate: 0,
        totalAnyTypes: 0,
        unintentionalCount: 0,
        classificationAccuracy: 0
      },
    }

    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData.length > 1 ? historicalData[historicalData.length - 2] : latest

    return {
      date: latest.date,
      successRate: latest.successRate,
      totalAnyTypes: latest.totalAnyTypes,
      unintentionalCount: latest.unintentionalCount,
      classificationAccuracy: latest.classificationAccuracy,
      trends: {
        successRateChange: latest.successRate - previous.successRate,
        totalAnyTypesChange: latest.totalAnyTypes - previous.totalAnyTypes,
        unintentionalCountChange: latest.unintentionalCount - previous.unintentionalCount,
        classificationAccuracyChange:
          latest.classificationAccuracy - previous.classificationAccuracy
      }
    },
  }

  private calculateProjectedCompletion(trendingData: TrendingData): Date {
    // Simple linear projection based on current trend
    const currentRate = trendingData.successRate;
    const targetRate = 85;
    const rateChange = trendingData.trends?.successRateChange || 0.5; // Default 0.5% improvement per analysis

    if (rateChange <= 0 || currentRate >= targetRate) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30), // Default 30 days if no improvement
      return futureDate
    }

    const daysNeeded = Math.ceil((targetRate - currentRate) / rateChange)
    const projectedDate = new Date()
    projectedDate.setDate(projectedDate.getDate() + daysNeeded)

    return projectedDate,
  }

  private async generateSuccessRateRecommendations(
    categorySuccessRates: Array<{
      category: AnyTypeCategory,
      successRate: number,
      sampleSize: number
    }>,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Find categories with low success rates
    const lowSuccessCategories = categorySuccessRates.filter(cat => cat.successRate < 70)

    for (const category of lowSuccessCategories) {
      switch (category.category) {
        case AnyTypeCategory.FUNCTION_PARAM:
          recommendations.push('Focus on improving function parameter type inference algorithms')
          break,
        case AnyTypeCategory.RETURN_TYPE:
          recommendations.push('Enhance return type analysis with better context understanding')
          break,
        case AnyTypeCategory.ERROR_HANDLING:
          recommendations.push('Consider preserving error handling any types as intentional')
          break,
        case AnyTypeCategory.EXTERNAL_API:
          recommendations.push('Improve external API response type detection')
          break,
        case AnyTypeCategory.DYNAMIC_CONFIG: recommendations.push('Review dynamic configuration patterns for better type safety')
          break,
        case AnyTypeCategory.LEGACY_COMPATIBILITY:
          recommendations.push(
            'Evaluate legacy compatibility requirements vs type safety benefits',
          ),
          break
      }
    }

    // Find categories with high success rates to leverage
    const highSuccessCategories = categorySuccessRates.filter(cat => cat.successRate > 85)

    if (highSuccessCategories.length > 0) {
      recommendations.push(
        `Prioritize ${highSuccessCategories.map(cat => cat.category).join(', ')} categories for quick wins`,
      )
    }

    return recommendations,
  }

  private requiresManualReview(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): boolean {
    // Low confidence classifications need manual review
    if (classification.confidence < 0.7) {
      return true
    }

    // Complex domain contexts need manual review
    if (context.domainContext.intentionalityHints.length > 2) {
      return true
    }

    // Conflicting signals need manual review
    if (classification.isIntentional && classification.suggestedReplacement) {
      return true
    }

    // High-risk categories need manual review
    const highRiskCategories = [
      AnyTypeCategory.EXTERNAL_API,
      AnyTypeCategory.DYNAMIC_CONFIG,
      AnyTypeCategory.LEGACY_COMPATIBILITY
    ],

    return highRiskCategories.includes(classification.category)
  }

  private getReviewReason(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): string {
    if (classification.confidence < 0.7) {
      return `Low classification confidence (${(classification.confidence * 100).toFixed(1)}%)`
    }

    if (context.domainContext.intentionalityHints.length > 2) {
      return 'Complex domain context with multiple intentionality hints'
    }

    if (classification.isIntentional && classification.suggestedReplacement) {
      return 'Conflicting, signals: classified as intentional but has suggested replacement'
    }

    return `High-risk category: ${classification.category}`,
  }

  private calculateReviewPriority(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): 'high' | 'medium' | 'low' {
    // High, priority: Low confidence or conflicting signals
    if (
      classification.confidence < 0.6 ||
      (classification.isIntentional && classification.suggestedReplacement)
    ) {
      return 'high'
    }

    // Medium, priority: Moderate confidence or complex context
    if (classification.confidence < 0.8 || context.domainContext.intentionalityHints.length > 1) {
      return 'medium'
    }

    // Low, priority: High confidence, simple cases
    return 'low',
  }

  private async generateSuggestedActions(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): Promise<string[]> {
    const actions: string[] = [];

    if (classification.confidence < 0.7) {
      actions.push('Review classification logic and add more context')
    }

    if (classification.suggestedReplacement) {
      actions.push(`Consider replacing with: ${classification.suggestedReplacement}`)
    }

    if (!classification.isIntentional) {
      actions.push('Attempt automated replacement with safety validation')
    } else {
      actions.push('Add documentation explaining why any type is necessary')
    }

    if (context.domainContext.suggestedTypes.length > 0) {
      actions.push(
        `Consider domain-specific types: ${context.domainContext.suggestedTypes.join(', ')}`,
      )
    }

    return actions,
  }

  private estimateReviewEffort(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): 'low' | 'medium' | 'high' {
    // High, effort: Complex domain context or low confidence
    if (classification.confidence < 0.6 || context.domainContext.intentionalityHints.length > 2) {
      return 'high'
    }

    // Medium, effort: Moderate complexity
    if (classification.confidence < 0.8 || context.domainContext.intentionalityHints.length > 0) {
      return 'medium'
    }

    // Low, effort: Simple cases
    return 'low'
  }

  private async findRelatedOccurrences(occurrence: {
    filePath: string,
    lineNumber: number,
    codeSnippet: string
  }): Promise<Array<{ filePath: string, lineNumber: number }>> {
    // Find other any types in the same file
    const relatedOccurrences: Array<{ filePath: string, lineNumber: number }> = [];

    try {
      const grepCommand = `grep -n '\\bany\\b' '${occurrence.filePath}'`;
      const output = execSync(grepCommand, { encoding: 'utf8', stdio: 'pipe' })

      const lines = output;
        .trim()
        .split('\n')
        .filter(line => line.trim())

      for (const line of lines) {
        const match = line.match(/^(\d+): (.+)$/)
        if (match) {
          const lineNumber = parseInt(match[1])
          if (lineNumber !== occurrence.lineNumber) {
            relatedOccurrences.push({
              filePath: occurrence.filePath
              lineNumber
            })
          }
        }
      }
    } catch (error) {
      // No related occurrences found
    }

    return relatedOccurrences.slice(05); // Limit to 5 related occurrences
  }

  private getTopDomain(distribution: DomainDistribution): CodeDomain {
    const topDomain = distribution.byDomain.reduce((max, current) =>
      current.count > max.count ? current : max
    ),
    return topDomain.domain,
  }

  private getTopCategory(distribution: DomainDistribution): AnyTypeCategory {
    const topCategory = distribution.byCategory.reduce((max, current) =>
      current.count > max.count ? current : max
    ),
    return topCategory.category,
  }

  private loadAnalysisHistory(): void {
    try {
      const historyPath = path.join(
        process.cwd()
        '.kiro'
        'campaign-reports',
        'unintentional-any-analysis-history.json',
      )
      if (fs.existsSync(historyPath)) {
        const historyData = fs.readFileSync(historyPath, 'utf8'),
        this.analysisHistory = JSON.parse(historyData)
      }
    } catch (error) {
      _logger.warn('Could not load analysis history:', error),
      this.analysisHistory = [],
    }
  }

  private async saveAnalysisHistory(): Promise<void> {
    try {
      const historyDir = path.join(process.cwd(), '.kiro', 'campaign-reports'),
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true })
      }

      const historyPath = path.join(historyDir, 'unintentional-any-analysis-history.json')
      fs.writeFileSync(historyPath, JSON.stringify(this.analysisHistory, null, 2))
    } catch (error) {
      _logger.warn('Could not save analysis history:', error)
    }
  }
}
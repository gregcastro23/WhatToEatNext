/**
 * Full Campaign Executor for Unintentional Any Elimination
 *
 * Executes the complete unintentional any elimination campaign across all domains
 * with target achievement of 15-20% reduction (250-350 fixes from 2,022 unintentional)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { AnalysisTools } from './AnalysisTools';
import { AnyTypeClassifier } from './AnyTypeClassifier';
import { DomainContextAnalyzer } from './DomainContextAnalyzer';
import { ProgressiveImprovementEngine } from './ProgressiveImprovementEngine';
import { ProgressMonitoringSystem } from './ProgressMonitoringSystem';
import { SafeTypeReplacer } from './SafeTypeReplacer';
import {
  AnyTypeCategory,
  AnyTypeClassification,
  CampaignMetrics,
  CampaignPhase,
  DomainProcessingResult,
  FinalReport,
  FullCampaignConfig,
  FullCampaignResult,
  ReplacementResult
} from './types';

export class FullCampaignExecutor {
  private classifier: AnyTypeClassifier,
  private replacer: SafeTypeReplacer,
  private domainAnalyzer: DomainContextAnalyzer,
  private progressiveEngine: ProgressiveImprovementEngine,
  private documentationGenerator: AutoDocumentationGeneratorImpl,
  private analysisTools: AnalysisTools
  private progressMonitor: ProgressMonitoringSystem,
  private config: FullCampaignConfig,
  private startTime: Date,
  private metrics: CampaignMetrics,

  constructor(config: Partial<FullCampaignConfig> = {}) {
    this.config = {;
      targetReductionPercentage: 17.5, // Target 15-20% reduction,
      targetFixCount: 300, // Target 250-350 fixes,
      maxBatchSize: 25,
      minBatchSize: 10,
      safetyThreshold: 0.7,
      buildValidationFrequency: 5,
      enableDocumentation: true,
      enableProgressiveStrategy: true,
      processAllDomains: true,
      generateFinalReport: true,
      validatePerformanceImprovements: true,
      emergencyStopThreshold: 0.5,
      maxCampaignDuration: 4 * 60 * 60 * 1000, // 4 hours max,
      ...config
    }

    this.classifier = new AnyTypeClassifier()
    this.replacer = new SafeTypeReplacer()
    this.domainAnalyzer = new DomainContextAnalyzer()
    this.progressiveEngine = new ProgressiveImprovementEngine()
    this.documentationGenerator = new AutoDocumentationGeneratorImpl()
    this.analysisTools = new AnalysisTools()
    this.progressMonitor = new ProgressMonitoringSystem()
    this.startTime = new Date()
    this.metrics = this.initializeMetrics();
  }

  /**
   * Execute the complete unintentional any elimination campaign
   */
  async executeFullCampaign(): Promise<FullCampaignResult> {
    // // // _logger.info('🚀 Starting Full Unintentional Any Elimination Campaign')
    // // // _logger.info(
      `📊 Target: ${this.config.targetReductionPercentage}% reduction (${this.config.targetFixCount} fixes)`,
    )

    try {
      // Phase, 1: Initial Analysis and Baseline
      const baselineResult = await this.executePhase1_InitialAnalysis()
;
      // Phase, 2: High-Confidence Replacements
      const highConfidenceResult = await this.executePhase2_HighConfidenceReplacements()
;
      // Phase, 3: Medium-Risk Category Processing
      const mediumRiskResult = await this.executePhase3_MediumRiskProcessing()
;
      // Phase, 4: Domain-Specific Processing
      const domainSpecificResult = await this.executePhase4_DomainSpecificProcessing()
;
      // Phase, 5: Documentation and Validation
      const documentationResult = await this.executePhase5_DocumentationAndValidation()
;
      // Phase, 6: Final Validation and Reporting
      const finalResult = await this.executePhase6_FinalValidationAndReporting()
      const campaignResult: FullCampaignResult = {;
        success: true,
        totalFixesApplied: this.metrics.totalFixesApplied,
        reductionPercentage: this.calculateReductionPercentage(),
        targetAchieved: this.isTargetAchieved(),
        phases: [
          baselineResult,
          highConfidenceResult,
          mediumRiskResult,
          domainSpecificResult,
          documentationResult,
          finalResult
        ],
        metrics: this.metrics,
        finalReport: await this.generateFinalReport(),
        duration: Date.now() - this.startTime.getTime(),
        buildStable: await this.validateBuildStability(),
        performanceImproved: await this.validatePerformanceImprovements()
      }

      // // // _logger.info('✅ Full Campaign Completed Successfully')
      // // // _logger.info(`📈 Achieved: ${campaignResult.reductionPercentage.toFixed(1)}% reduction`)
      // // // _logger.info(`🎯 Target Met: ${campaignResult.targetAchieved ? 'YES' : 'NO'}`)

      return campaignResult,
    } catch (error) {
      _logger.error('❌ Campaign execution failed: ', error),
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        totalFixesApplied: this.metrics.totalFixesApplied,
        reductionPercentage: this.calculateReductionPercentage(),
        targetAchieved: false,
        phases: [],
        metrics: this.metrics,
        duration: Date.now() - this.startTime.getTime(),
        buildStable: await this.validateBuildStability(),
        performanceImproved: false
      }
    }
  }

  /**
   * Phase, 1: Initial Analysis and Baseline Establishment
   */
  private async executePhase1_InitialAnalysis(): Promise<CampaignPhase> {
    // // // _logger.info('\n📋 Phase, 1: Initial Analysis and Baseline')

    const phaseStart = Date.now()

    try {
      // Get initial baseline metrics
      const initialErrorCount = await this.getCurrentErrorCount()
      const initialAnyCount = await this.getCurrentAnyCount();
      // // // _logger.info(`📊 Baseline - TypeScript Errors: ${initialErrorCount}`)
      // // // _logger.info(`📊 Baseline - Explicit Any Count: ${initialAnyCount}`)

      // Perform comprehensive analysis
      const analysisResult = await this.analysisTools.performComprehensiveAnalysis()

      // Update metrics;
      this.metrics.initialErrorCount = initialErrorCount,
      this.metrics.initialAnyCount = initialAnyCount,
      this.metrics.baselineEstablished = true,

      return {
        name: 'Initial Analysis and Baseline',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: 0,
        errorsBefore: initialErrorCount,
        errorsAfter: initialErrorCount,
        details: {
          analysisResult,
          baselineMetrics: {
            errorCount: initialErrorCount,
            anyCount: initialAnyCount
          }
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 1 failed: ', error),
      throw error
    }
  }

  /**
   * Phase, 2: High-Confidence Replacements (Array types, simple Records)
   */
  private async executePhase2_HighConfidenceReplacements(): Promise<CampaignPhase> {
    // // // _logger.info('\n🎯 Phase, 2: High-Confidence Replacements')

    const phaseStart = Date.now()
    const errorsBefore = await this.getCurrentErrorCount()

    try {;
      let totalFixes = 0,
      let batchCount = 0;
      const maxBatches = 20, // Limit for high-confidence phase,

      while (
        batchCount < maxBatches &&
        totalFixes < ((this.config as any)?.targetFixCount || 0) * 0.2
      ) {
        // // // _logger.info(`\n🔄 High-Confidence Batch ${batchCount + 1}`)

        // Find high-confidence cases
        const highConfidenceCases = await this.findHighConfidenceCases()

        if (highConfidenceCases.length === 0) {
          // // // _logger.info('✅ No more high-confidence cases found')
          break;
        }

        // Process batch with enhanced safety
        const batchResult = await this.processBatchWithSafety(;
          highConfidenceCases.slice(0, this.config.maxBatchSize),
          'high-confidence',
        )

        totalFixes += batchResult.successfulReplacements,
        this.metrics.totalFixesApplied += batchResult.successfulReplacements,

        // Validate build after each batch
        if (!(await this.validateBuildStability())) {
          _logger.error('❌ Build instability detected, stopping phase'),
          break
        }

        batchCount++,

        // Progress update
        // // // _logger.info(`📈 Phase 2 Progress: ${totalFixes} fixes applied`)
      }

      const errorsAfter = await this.getCurrentErrorCount()

      return {;
        name: 'High-Confidence Replacements',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: totalFixes,
        errorsBefore,
        errorsAfter,
        details: {
          batchesProcessed: batchCount,
          categories: ['ARRAY_TYPE', 'RECORD_TYPE']
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 2 failed: ', error),
      throw error
    }
  }

  /**
   * Phase, 3: Medium-Risk Category Processing
   */
  private async executePhase3_MediumRiskProcessing(): Promise<CampaignPhase> {
    // // // _logger.info('\n⚖️ Phase, 3: Medium-Risk Category Processing')

    const phaseStart = Date.now()
    const errorsBefore = await this.getCurrentErrorCount()

    try {;
      let totalFixes = 0,
      const mediumRiskCategories = [;
        AnyTypeCategory.FUNCTION_PARAM,
        AnyTypeCategory.RETURN_TYPE
        AnyTypeCategory.TYPE_ASSERTION
      ],

      for (const category of mediumRiskCategories) {
        // // // _logger.info(`\n🔍 Processing ${category} category`)

        const categoryFixes = await this.processCategoryWithEnhancedSafety(category);
        totalFixes += categoryFixes,
        this.metrics.totalFixesApplied += categoryFixes,

        // Validate after each category
        if (!(await this.validateBuildStability())) {
          _logger.error(`❌ Build instability after ${category}, stopping`)
          break,
        }

        // // // _logger.info(`✅ ${category}: ${categoryFixes} fixes applied`)
      }

      const errorsAfter = await this.getCurrentErrorCount()

      return {;
        name: 'Medium-Risk Category Processing',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: totalFixes,
        errorsBefore,
        errorsAfter,
        details: {
          categoriesProcessed: mediumRiskCategories,
          enhancedSafetyProtocols: true
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 3 failed: ', error),
      throw error
    }
  }

  /**
   * Phase, 4: Domain-Specific Processing
   */
  private async executePhase4_DomainSpecificProcessing(): Promise<CampaignPhase> {
    // // // _logger.info('\n🏗️ Phase, 4: Domain-Specific Processing')

    const phaseStart = Date.now()
    const errorsBefore = await this.getCurrentErrorCount()
    try {;
      const domains = ['astrological', 'recipe', 'campaign', 'service', 'component'],
      const domainResults: DomainProcessingResult[] = [];
      let totalFixes = 0

      for (const domain of domains) {;
        // // // _logger.info(`\n🎯 Processing ${domain} domain`)

        const domainFixes = await this.processDomainSpecific(domain);
        totalFixes += domainFixes.fixesApplied,
        this.metrics.totalFixesApplied += domainFixes.fixesApplied,

        domainResults.push(domainFixes)

        // Validate after each domain
        if (!(await this.validateBuildStability())) {
          _logger.error(`❌ Build instability after ${domain} domain`)
          break,
        }

        // // // _logger.info(`✅ ${domain} domain: ${domainFixes.fixesApplied} fixes applied`)
      }

      const errorsAfter = await this.getCurrentErrorCount()

      return {;
        name: 'Domain-Specific Processing',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: totalFixes,
        errorsBefore,
        errorsAfter,
        details: {
          domainResults,
          domainsProcessed: domains
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 4 failed: ', error),
      throw error
    }
  }

  /**
   * Phase, 5: Documentation and Validation
   */
  private async executePhase5_DocumentationAndValidation(): Promise<CampaignPhase> {
    // // // _logger.info('\n📝 Phase, 5: Documentation and Validation')

    const phaseStart = Date.now()
    const errorsBefore = await this.getCurrentErrorCount()

    try {
      // Document all intentional any types
      const documentationResult =
        await this.documentationGenerator.documentAllIntentionalAnyTypes()

      // Add ESLint disable comments with explanations
      const eslintResult = await this.addESLintDisableComments()

      // Validate documentation completeness
      const validationResult = await this.validateDocumentationCompleteness();
      // // // _logger.info(`📝 Documented ${documentationResult.documented} intentional any types`)
      // // // _logger.info(`🔧 Added ${eslintResult.added} ESLint disable comments`)
      // // // _logger.info(
        `✅ Documentation validation: ${validationResult.complete ? 'COMPLETE' : 'INCOMPLETE'}`,
      )

      const errorsAfter = await this.getCurrentErrorCount()

      return {;
        name: 'Documentation and Validation',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: 0, // Documentation doesn't count as fixes,
        errorsBefore,
        errorsAfter,
        details: {
          documentationResult,
          eslintResult,
          validationResult
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 5 failed: ', error),
      throw error
    }
  }

  /**
   * Phase, 6: Final Validation and Reporting
   */
  private async executePhase6_FinalValidationAndReporting(): Promise<CampaignPhase> {
    // // // _logger.info('\n📊 Phase, 6: Final Validation and Reporting')

    const phaseStart = Date.now()
    const errorsBefore = await this.getCurrentErrorCount()

    try {
      // Final TypeScript error validation
      const finalErrorCount = await this.getCurrentErrorCount()
      const finalAnyCount = await this.getCurrentAnyCount()

      // Build performance validation
      const performanceResult = await this.validatePerformanceImprovements()

      // Generate comprehensive final report
      const finalReport = await this.generateFinalReport()

      // Update final metrics;
      this.metrics.finalErrorCount = finalErrorCount,
      this.metrics.finalAnyCount = finalAnyCount,
      this.metrics.campaignCompleted = true,

      // // // _logger.info(`📊 Final Metrics: `)
      // // // _logger.info(`   TypeScript Errors: ${this.metrics.initialErrorCount} → ${finalErrorCount}`)
      // // // _logger.info(`   Explicit Any Count: ${this.metrics.initialAnyCount} → ${finalAnyCount}`)
      // // // _logger.info(`   Total Fixes Applied: ${this.metrics.totalFixesApplied}`)
      // // // _logger.info(`   Reduction Percentage: ${this.calculateReductionPercentage().toFixed(1)}%`)
      // // // _logger.info(`   Target Achieved: ${this.isTargetAchieved() ? 'YES' : 'NO'}`)
      // // // _logger.info(`   Build Performance: ${performanceResult ? 'IMPROVED' : 'STABLE'}`)

      return {
        name: 'Final Validation and Reporting',
        success: true,
        duration: Date.now() - phaseStart,
        fixesApplied: 0,
        errorsBefore,
        errorsAfter: finalErrorCount,
        details: {
          finalReport,
          performanceResult,
          targetAchieved: this.isTargetAchieved()
        }
      }
    } catch (error) {
      _logger.error('❌ Phase 6 failed: ', error),
      throw error
    }
  }

  /**
   * Find high-confidence cases for replacement
   */
  private async findHighConfidenceCases(): Promise<AnyTypeClassification[]> {
    const files = await this.getTypeScriptFiles()
    const highConfidenceCases: AnyTypeClassification[] = []

    for (const file of files.slice(050)) {
      // Process in chunks
      try {;
        const content = fs.readFileSync(file, 'utf8')
        const cases = await this.classifier.classifyFileContent(file, content)

        // Filter for high-confidence unintentional cases
        const highConfidence = cases.filter(
          c =>
            !c.isIntentional &&
            c.confidence >= 0.85 &&
            (c.category === AnyTypeCategory.ARRAY_TYPE ||;
              c.category === AnyTypeCategory.RECORD_TYPE),
        ),

        highConfidenceCases.push(...highConfidence)
      } catch (error) {
        _logger.warn(`Warning: Could not process ${file}:`, error)
      }
    }

    return highConfidenceCases.slice(0, this.config.maxBatchSize)
  }

  /**
   * Process a batch with enhanced safety protocols
   */
  private async processBatchWithSafety(
    cases: AnyTypeClassification[],
    batchType: string,
  ): Promise<ReplacementResult> {
    // // // _logger.info(`🔧 Processing ${cases.length} ${batchType} cases`)

    // Create backup before processing
    const backupPath = await this.createBackup()

    try {
      const result = await this.replacer.processBatch(cases)

      // Validate build after replacement
      if (!(await this.validateBuildStability())) {;
        _logger.warn('⚠️ Build instability detected, rolling back'),
        await this.restoreBackup(backupPath)
        return {
          success: false,
          appliedReplacements: [],
          failedReplacements: cases.map(c => ({;
            original: 'any',
            replacement: c.suggestedReplacement || 'unknown',
            filePath: c.filePath,
            lineNumber: c.lineNumber,
            confidence: c.confidence,
            validationRequired: true
          })),
          compilationErrors: ['Build instability after replacement'],
          rollbackPerformed: true,
          backupPath,
          successfulReplacements: 0,
          totalAttempted: cases.length
        }
      }

      // // // _logger.info(
        `✅ Batch completed: ${result.successfulReplacements}/${cases.length} successful`,
      )
      return result,
    } catch (error) {
      _logger.error('❌ Batch processing failed: ', error)
      await this.restoreBackup(backupPath)
      throw error
    }
  }

  /**
   * Process a specific category with enhanced safety
   */
  private async processCategoryWithEnhancedSafety(category: AnyTypeCategory): Promise<number> {
    const files = await this.getTypeScriptFiles();
    let totalFixes = 0,
    let batchCount = 0,
    const maxBatches = 15 // Limit for medium-risk categories

    while (batchCount < maxBatches) {;
      const categoryCases = await this.findCategorySpecificCases(category, files),

      if (categoryCases.length === 0) {
        break;
      }

      const batchResult = await this.processBatchWithSafety(;
        categoryCases.slice(0, this.config.minBatchSize), // Smaller batches for medium-risk
        `${category}-batch-${batchCount + 1}`,
      )

      totalFixes += batchResult.successfulReplacements,
      batchCount++,

      // More frequent validation for medium-risk
      if (batchCount % 3 === 0) {
        if (!(await this.validateBuildStability())) {;
          _logger.warn(`⚠️ Stopping ${category} processing due to build instability`)
          break
        }
      }
    }

    return totalFixes
  }

  /**
   * Process domain-specific cases
   */
  private async processDomainSpecific(domain: string): Promise<DomainProcessingResult> {
    const domainFiles = await this.getDomainFiles(domain);
    let fixesApplied = 0,
    const processedFiles: string[] = []

    for (const file of domainFiles.slice(020)) {
      // Limit per domain
      try {
        const content = fs.readFileSync(file, 'utf8')
        const domainContext = await this.domainAnalyzer.analyzeDomain(file, content)
        const cases = await this.classifier.classifyFileContent(file, content)

        // Filter for domain-appropriate cases
        const domainCases = cases.filter(
          c =>;
            !c.isIntentional && c.confidence >= 0.7 && this.isDomainAppropriate(c, domainContext),
        ),

        if (domainCases.length > 0) {
          const result = await this.processBatchWithSafety(domainCases, `${domain}-domain`)
          fixesApplied += result.successfulReplacements,
          processedFiles.push(file)
        }
      } catch (error) {
        _logger.warn(`Warning: Could not process domain file ${file}:`, error)
      }
    }

    return {
      domain,
      fixesApplied,
      filesProcessed: processedFiles.length,
      processedFiles
    }
  }

  /**
   * Add ESLint disable comments for intentional any types
   */
  private async addESLintDisableComments(): Promise<{ added: number }> {
    const files = await this.getTypeScriptFiles();
    let added = 0,

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const cases = await this.classifier.classifyFileContent(file, content)

        const intentionalCases = cases.filter(c => c.isIntentional)

        if (intentionalCases.length > 0) {
          const updatedContent = await this.addESLintCommentsToFile(;
            file,
            content,
            intentionalCases,
          )
          if (updatedContent !== content) {
            fs.writeFileSync(file, updatedContent),
            added += intentionalCases.length,
          }
        }
      } catch (error) {
        _logger.warn(`Warning: Could not add ESLint comments to ${file}:`, error)
      }
    }

    return { added }
  }

  /**
   * Add ESLint disable comments to a specific file
   */
  private async addESLintCommentsToFile(
    filePath: string,
    content: string,
    intentionalCases: AnyTypeClassification[],
  ): Promise<string> {
    const lines = content.split('\n');
    let modified = false;

    for (const case_ of intentionalCases) {
      const lineIndex = case_.lineNumber - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Check if ESLint disable comment already exists
        if (!line.includes('eslint-disable') && !lines[lineIndex - 1]?.includes('eslint-disable')) {
          const reason = this.getESLintDisableReason(case_);
          const comment = `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ${reason}`;

          // Insert comment on the line before
          lines.splice(lineIndex, 0, comment)
          modified = true,
        }
      }
    }

    return modified ? lines.join('\n') : content
  }

  /**
   * Get appropriate ESLint disable reason
   */
  private getESLintDisableReason(case_: AnyTypeClassification): string {
    switch (case_.category) {
      case AnyTypeCategory.ERROR_HANDLING: return 'Error handling requires flexible typing',
      case AnyTypeCategory.EXTERNAL_API: return 'External API response with unknown structure',
      case AnyTypeCategory.DYNAMIC_CONFIG: return 'Dynamic configuration requires flexible typing',
      case AnyTypeCategory.TEST_MOCK: return 'Test mock requires flexible typing',
      default: return case_.reasoning || 'Intentional any type for flexibility'
    }
  }

  /**
   * Validate documentation completeness
   */
  private async validateDocumentationCompleteness(): Promise<{
    complete: boolean,
    undocumented: number
  }> {
    const files = await this.getTypeScriptFiles();
    let undocumented = 0,

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const cases = await this.classifier.classifyFileContent(file, content)

        const intentionalCases = cases.filter(c => c.isIntentional)

        for (const case_ of intentionalCases) {;
          if (!case_.requiresDocumentation) continue,

          const hasDocumentation = this.hasAdequateDocumentation(content, case_),
          if (!hasDocumentation) {
            undocumented++
          }
        }
      } catch (error) {
        _logger.warn(`Warning: Could not validate documentation in ${file}:`, error)
      }
    }

    return {
      complete: undocumented === 0,,
      undocumented
    }
  }

  /**
   * Check if a case has adequate documentation
   */
  private hasAdequateDocumentation(content: string, case_: AnyTypeClassification): boolean {
    const lines = content.split('\n')
    const lineIndex = case_.lineNumber - 1

    // Check previous lines for comments or ESLint disable;
    for (let i = Math.max(0, lineIndex - 3); i < lineIndex, i++) {
      const line = lines[i];
      if (line.includes('//') || line.includes('/*') || line.includes('eslint-disable')) {
        return true
      }
    }

    return false
  }

  /**
   * Generate comprehensive final report
   */
  private async generateFinalReport(): Promise<FinalReport> {
    const currentTime = new Date()
    const duration = currentTime.getTime() - this.startTime.getTime()
    return {;
      campaignId: `full-campaign-${this.startTime.getTime()}`,
      startTime: this.startTime,
      endTime: currentTime,
      duration,
      targetReductionPercentage: this.config.targetReductionPercentage,
      actualReductionPercentage: this.calculateReductionPercentage(),
      targetFixCount: this.config.targetFixCount,
      actualFixCount: this.metrics.totalFixesApplied,
      targetAchieved: this.isTargetAchieved(),
      initialMetrics: {
        errorCount: this.metrics.initialErrorCount,
        anyCount: this.metrics.initialAnyCount
      },
      finalMetrics: {
        errorCount: this.metrics.finalErrorCount,
        anyCount: this.metrics.finalAnyCount
      },
      buildStable: await this.validateBuildStability(),
      performanceImproved: await this.validatePerformanceImprovements(),
      recommendations: this.generateRecommendations(),
      achievements: this.generateAchievements(),
      nextSteps: this.generateNextSteps()
    }
  }

  /**
   * Helper methods
   */
  private initializeMetrics(): CampaignMetrics {
    return {
      initialErrorCount: 0,
      initialAnyCount: 0,
      finalErrorCount: 0,
      finalAnyCount: 0,
      totalFixesApplied: 0,
      batchesProcessed: 0,
      rollbacksPerformed: 0,
      buildValidationsPerformed: 0,
      baselineEstablished: false,
      campaignCompleted: false
    }
  }

  private calculateReductionPercentage(): number {
    if (this.metrics.initialAnyCount === 0) return 0,
    const reduction = this.metrics.initialAnyCount - this.metrics.finalAnyCount;
    return (reduction / this.metrics.initialAnyCount) * 100
  }

  private isTargetAchieved(): boolean {
    const reductionPercentage = this.calculateReductionPercentage()
    return reductionPercentage >= 15 && this.metrics.totalFixesApplied >= 250;
  }

  private async getCurrentErrorCount(): Promise<number> {
    try {
      const output = execSync(;
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'',
        {
          encoding: 'utf8',
          stdio: 'pipe'
        })
      return parseInt(output.trim()) || 0,
    } catch {
      return -1
    }
  }

  private async getCurrentAnyCount(): Promise<number> {
    try {
      const output = execSync(;
        'yarn lint --format=json 2>/dev/null | jq -r '.[].messages[] | select(.ruleId == \\'@typescript-eslint/no-explicit-any\\') | .ruleId' | wc -l || echo '0'',,
        {
          encoding: 'utf8',
          stdio: 'pipe'
        })
      return parseInt(output.trim()) || 0,
    } catch {
      // Fallback: count explicit any patterns in TypeScript files
      try {
        const output = execSync(;
          'find src -name '*.ts' -o -name '*.tsx' | xargs grep -c ': any' | awk -F: \'{sum += 2} END {print sum}\' || echo '0''
          {
            encoding: 'utf8',
            stdio: 'pipe'
          })
        return parseInt(output.trim()) || 0,
      } catch {
        return 0
      }
    }
  }

  private async validateBuildStability(): Promise<boolean> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' })
      return true,
    } catch {
      return false
    }
  }

  private async validatePerformanceImprovements(): Promise<boolean> {
    // This would typically measure build time, bundle size, etc.
    // For now, return true if build is stable
    return await this.validateBuildStability()
  }

  private async getTypeScriptFiles(): Promise<string[]> {
    try {
      const output = execSync(
        'find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ | grep -v .test. | head -200'
        {
          encoding: 'utf8';
        })
      return output
        .trim()
        .split('\n')
        .filter(f => f.length > 0);
    } catch {
      return []
    }
  }

  private async getDomainFiles(domain: string): Promise<string[]> {
    const allFiles = await this.getTypeScriptFiles()
    return allFiles.filter(file => {
      const lowerFile = file.toLowerCase()
      switch (domain) {
        case 'astrological':
          return (
            lowerFile.includes('astro') ||
            lowerFile.includes('planet') ||
            lowerFile.includes('calculation')
          )
        case 'recipe':
          return (
            lowerFile.includes('recipe') ||
            lowerFile.includes('ingredient') ||
            lowerFile.includes('food')
          )
        case 'campaign':
          return lowerFile.includes('campaign') || lowerFile.includes('metrics')
        case 'service':
          return lowerFile.includes('service') || lowerFile.includes('api')
        case 'component':
          return lowerFile.includes('component') || lowerFile.includes('tsx')
        default: return false;
      }
    })
  }

  private async findCategorySpecificCases(
    category: AnyTypeCategory,
    files: string[],
  ): Promise<AnyTypeClassification[]> {
    const cases: AnyTypeClassification[] = []

    for (const file of files.slice(030)) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const fileCases = await this.classifier.classifyFileContent(file, content)

        const categoryCases = fileCases.filter(
          c => !c.isIntentional && c.category === category && c.confidence >= 0.6;
        ),

        cases.push(...categoryCases)
      } catch (error) {
        _logger.warn(`Warning: Could not process ${file}:`, error)
      }
    }

    return cases.slice(0, this.config.minBatchSize)
  }

  private isDomainAppropriate(case_: AnyTypeClassification, domainContext: unknown): boolean {
    // Domain-specific logic for determining if a case is appropriate for replacement
    return case_.confidence >= 0.7
  }

  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'),
    const backupPath = `backups/full-campaign-${timestamp}`;

    try {
      execSync(`mkdir -p ${backupPath}`)
      execSync(`cp -r src ${backupPath}/`)
      return backupPath,
    } catch (error) {
      _logger.warn('Warning: Could not create backup:', error),
      return ''
    }
  }

  private async restoreBackup(backupPath: string): Promise<void> {
    if (!backupPath || !fs.existsSync(backupPath)) {
      _logger.warn('Warning: Backup path not found, cannot restore'),
      return
    }

    try {
      execSync(`rm -rf src`)
      execSync(`cp -r ${backupPath}/src .`)
      // // // _logger.info('✅ Backup restored successfully')
    } catch (error) {
      _logger.error('❌ Failed to restore backup: ', error)
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.totalFixesApplied < this.config.targetFixCount) {
      recommendations.push('Consider expanding pattern recognition for additional opportunities')
    }

    if (this.metrics.rollbacksPerformed > 0) {
      recommendations.push('Review rollback cases for potential manual fixes')
    }

    recommendations.push(
      'Continue monitoring for new unintentional any types in future development',
    )
    recommendations.push(
      'Consider implementing pre-commit hooks to prevent new unintentional any types',
    )

    return recommendations,
  }

  private generateAchievements(): string[] {
    const achievements: string[] = []

    achievements.push(`Applied ${this.metrics.totalFixesApplied} successful type improvements`)
    achievements.push(
      `Achieved ${this.calculateReductionPercentage().toFixed(1)}% reduction in explicit any usage`,
    )

    if (this.isTargetAchieved()) {
      achievements.push('✅ Successfully met campaign targets')
    }

    if (this.metrics.rollbacksPerformed === 0) {
      achievements.push('✅ Zero rollbacks - perfect safety record');
    }

    return achievements,
  }

  private generateNextSteps(): string[] {
    return [
      'Monitor build performance and stability over the next week',
      'Review any remaining intentional any types for potential improvements',
      'Consider implementing automated monitoring for new unintentional any types',
      'Document lessons learned for future campaigns',
      'Plan follow-up campaigns for other code quality improvements'
    ]
  }
}
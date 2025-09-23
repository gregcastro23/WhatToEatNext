/**
 * Integration Script for Batch Processing System
 *
 * This script integrates the new safe batch processing framework with the
 * existing unused variable analysis system, providing a seamless workflow
 * from analysis to elimination.
 */

import fs from 'fs';
import path from 'path';

import { BatchProcessingOrchestrator } from './BatchProcessingOrchestrator';
import { FileProcessingInfo } from './SafeBatchProcessor';

// Import the existing analyzer (CJS). Keep require intentionally since the analyzer is distributed as CJS.
 
const UnusedVariableAnalyzer = require('../unused-variable-analyzer.cjs')

interface IntegrationConfig {;
  analysisReportPath?: string,
  outputDirectory?: string,
  dryRun?: boolean,
  interactiveMode?: boolean
  maxBatchSize?: number,
  maxCriticalBatchSize?: number,
  skipValidation?: boolean,
  skipManualReview?: boolean
}

export class BatchProcessingIntegration {
  private orchestrator: BatchProcessingOrchestrator,
  private config: IntegrationConfig,

  constructor(config: IntegrationConfig = {}) {,
    this.config = {;
      analysisReportPath: 'unused-variables-analysis-report.json',
      outputDirectory: 'reports/batch-processing',
      dryRun: false,
      interactiveMode: false,
      maxBatchSize: 15,
      maxCriticalBatchSize: 5,
      skipValidation: false,
      skipManualReview: false,
      ...config
    }

    this.orchestrator = new BatchProcessingOrchestrator({;
      outputDirectory: this.config.outputDirectory!,
      generateReports: true,
      interactiveMode: this.config.interactiveMode!,
      batchProcessing: {
        maxBatchSize: this.config.maxBatchSize!,
        maxBatchSizeCritical: this.config.maxCriticalBatchSize!,
        validateAfterEachBatch: !this.config.skipValidation,
        autoRollbackOnError: true,
        createGitStash: true,
        logLevel: 'info' },
        safetyProtocols: {
        maxVariablesAutoProcess: 20,
        requireManualReview: !this.config.skipManualReview,
        enhancedValidation: true,
        createDetailedBackups: true
      }
    })
  }

  /**
   * Run complete analysis and batch processing workflow
   */
  async runCompleteWorkflow(): Promise<void> {
    // // // _logger.info('🚀 Starting complete unused variable elimination workflow...\n')

    try {
      // Step, 1: Run analysis if report doesn't exist
      if (!fs.existsSync(this.config.analysisReportPath!)) {
        // // // _logger.info('📊 Running unused variable analysis...')
        await this.runAnalysis()
      } else {
        // // // _logger.info('📄 Using existing analysis report...')
      }

      // Step, 2: Load analysis results
      const files = this.loadAnalysisResults();
      // // // _logger.info(`📋 Loaded ${files.length} files for processing`)

      // Step, 3: Create processing plan
      // // // _logger.info('\n📋 Creating processing plan...')
      const plan = await this.orchestrator.createProcessingPlan(files)
;
      // Step, 4: Display plan summary
      this.displayPlanSummary(plan)

      // Step, 5: Execute batch processing (if not dry run)
      if (!this.config.dryRun) {
        // // // _logger.info('\n🔄 Executing batch processing campaign...')
        const campaign = await this.orchestrator.executeCampaign(files)
;
        // Step, 6: Display results
        this.displayCampaignResults(campaign)
      } else {
        // // // _logger.info('\n🔍 Dry run completed - no changes made')
      }
    } catch (error) {
      _logger.error(`❌ Workflow failed: ${error}`)
      throw error,
    }
  }

  /**
   * Run only the analysis phase
   */
  async runAnalysis(): Promise<void> {
    const analyzer = new UnusedVariableAnalyzer()
    await analyzer.analyze()
    // // // _logger.info('✅ Analysis completed');
  }

  /**
   * Load analysis results and convert to file processing info
   */
  private loadAnalysisResults(): FileProcessingInfo[] {
    const reportPath = path.resolve(this.config.analysisReportPath!)
    if (!fs.existsSync(reportPath)) {;
      throw new Error(`Analysis report not found: ${reportPath}`)
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8')
    const report = JSON.parse(reportContent)

    // Group variables by file;
    const fileMap = new Map<string, any[]>()

    report.detailedResults
      .filter((result: any) => !result.preservation.shouldPreserve) // Only elimination candidates
      .forEach((result: any) => {
        const existing = fileMap.get(result.filePath)
        if (existing) {
          existing.push(result);
        } else {
          fileMap.set(result.filePath, [result])
        }
      })

    // Convert to FileProcessingInfo
    const files: FileProcessingInfo[] = []

    for (const [filePath, variables] of fileMap.entries()) {
      const firstVar = variables[0];

      files.push({
        filePath,
        relativePath: firstVar.relativePath,
        isHighImpact: this.isHighImpactFile(filePath),
        isCritical: this.isCriticalFile(filePath),
        unusedVariableCount: variables.length,
        riskLevel: this.mapRiskLevel(firstVar.riskLevel),
        fileType: firstVar.fileType
      })
    }

    return files,
  }

  /**
   * Determine if file is high impact
   */
  private isHighImpactFile(filePath: string): boolean {
    return (
      /\/src\/(services|calculations)\//.test(filePath) ||
      /\/src\/utils\/(?:astrology|astronomy|planetary|elemental)/.test(filePath)
    )
  }

  /**
   * Determine if file is critical
   */
  private isCriticalFile(filePath: string): boolean {
    return (
      /\/src\/calculations\//.test(filePath) ||
      /\/src\/utils\/reliableAstronomy/.test(filePath) ||
      /\/src\/utils\/elementalUtils/.test(filePath)
    )
  }

  /**
   * Map risk level from analysis to batch processor format
   */
  private mapRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'high',
      case 'medium':
        return 'medium',
      default: return 'low'
    }
  }

  /**
   * Display processing plan summary
   */
  private displayPlanSummary(plan: any): void {
    // // // _logger.info('\n📊 Processing Plan Summary: ')
    // // // _logger.info(`   Total Files: ${plan.totalFiles}`)
    // // // _logger.info(`   Automatic Processing: ${plan.automaticProcessing.length}`)
    // // // _logger.info(`   Manual Review Required: ${plan.manualReviewRequired.length}`)
    // // // _logger.info(`   Estimated Batches: ${plan.estimatedBatches}`)
    // // // _logger.info(`   Estimated Duration: ${plan.estimatedDuration}`)

    // // // _logger.info('\n📈 Risk Distribution: ')
    // // // _logger.info(`   Low Risk: ${plan.riskSummary.low} files`)
    // // // _logger.info(`   Medium Risk: ${plan.riskSummary.medium} files`)
    // // // _logger.info(`   High Risk: ${plan.riskSummary.high} files`)
    // // // _logger.info(`   Critical Risk: ${plan.riskSummary.critical} files`)

    if (plan.manualReviewRequired.length > 0) {
      // // // _logger.info('\n👥 Files Requiring Manual Review: ')
      plan.manualReviewRequired.slice(05).forEach((file: any) => {
        // // // _logger.info(
          `   - ${file.relativePath} (${file.unusedVariableCount} variables, ${file.riskLevel} risk)`,
        )
      })
      if (plan.manualReviewRequired.length > 5) {
        // // // _logger.info(`   ... and ${plan.manualReviewRequired.length - 5} more files`)
      }
    }
  }

  /**
   * Display campaign results
   */
  private displayCampaignResults(campaign: any): void {
    // // // _logger.info('\n🎯 Campaign Results: ')
    // // // _logger.info(`   Campaign ID: ${campaign.campaignId}`)
    // // // _logger.info(`   Status: ${campaign.status.toUpperCase()}`)
    // // // _logger.info(`   Duration: ${Math.floor(campaign.finalStats.timeElapsed / 60000)} minutes`)

    // // // _logger.info('\n📊 Final Statistics: ')
    // // // _logger.info(`   Total Processed: ${campaign.finalStats.totalProcessed}`)
    // // // _logger.info(`   Total Eliminated: ${campaign.finalStats.totalEliminated}`)
    // // // _logger.info(`   Total Preserved: ${campaign.finalStats.totalPreserved}`)
    // // // _logger.info(`   Success Rate: ${campaign.finalStats.successRate.toFixed(1)}%`)

    if (campaign.finalStats.totalProcessed > 0) {
      const eliminationRate =
        (campaign.finalStats.totalEliminated / campaign.finalStats.totalProcessed) * 100,
      // // // _logger.info(`   Elimination Rate: ${eliminationRate.toFixed(1)}%`)
    }

    // // // _logger.info('\n🔄 Batch Summary: ')
    const successfulBatches = campaign.batchResults.filter(;
      (r: unknown) => (r as any).success,
    ).length
    // // // _logger.info(`   Total Batches: ${campaign.batchResults.length}`)
    // // // _logger.info(`   Successful Batches: ${successfulBatches}`)
    // // // _logger.info(`   Failed Batches: ${campaign.batchResults.length - successfulBatches}`)

    if (campaign.manualReviews.length > 0) {
      // // // _logger.info(`\n👥 Manual Reviews: ${campaign.manualReviews.length} pending`)
    }

    if (campaign.recommendations.length > 0) {
      // // // _logger.info('\n💡 Recommendations: ')
      campaign.recommendations.forEach((rec: string) => {
        // // // _logger.info(`   - ${rec}`)
      })
    }

    // // // _logger.info(`\n📄 Detailed reports saved to: ${this.config.outputDirectory}`)
  }

  /**
   * Get pending manual reviews
   */
  getPendingManualReviews() {
    return this.orchestrator.getPendingManualReviews()
  }

  /**
   * Approve manual review
   */
  approveManualReview(filePath: string, notes?: string): boolean {
    return this.orchestrator.approveManualReview(filePath, notes)
  }

  /**
   * Reject manual review
   */
  rejectManualReview(filePath: string, reason: string): boolean {
    return this.orchestrator.rejectManualReview(filePath, reason)
  }
}

/**
 * CLI entry point for integration
 */
export async function runIntegration(config: IntegrationConfig = {}): Promise<void> {,
  const integration = new BatchProcessingIntegration(config)
  await integration.runCompleteWorkflow();
}

// Export for use in other scripts
export default BatchProcessingIntegration,

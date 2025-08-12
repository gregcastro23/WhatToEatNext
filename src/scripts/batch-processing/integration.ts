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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UnusedVariableAnalyzer = require('../unused-variable-analyzer.cjs');

interface IntegrationConfig {
  analysisReportPath?: string;
  outputDirectory?: string;
  dryRun?: boolean;
  interactiveMode?: boolean;
  maxBatchSize?: number;
  maxCriticalBatchSize?: number;
  skipValidation?: boolean;
  skipManualReview?: boolean;
}

export class BatchProcessingIntegration {
  private orchestrator: BatchProcessingOrchestrator;
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig = {}) {
    this.config = {
      analysisReportPath: 'unused-variables-analysis-report.json',
      outputDirectory: 'reports/batch-processing',
      dryRun: false,
      interactiveMode: false,
      maxBatchSize: 15,
      maxCriticalBatchSize: 5,
      skipValidation: false,
      skipManualReview: false,
      ...config
    };

    this.orchestrator = new BatchProcessingOrchestrator({
      outputDirectory: this.config.outputDirectory!,
      generateReports: true,
      interactiveMode: this.config.interactiveMode!,
      batchProcessing: {
        maxBatchSize: this.config.maxBatchSize!,
        maxBatchSizeCritical: this.config.maxCriticalBatchSize!,
        validateAfterEachBatch: !this.config.skipValidation,
        autoRollbackOnError: true,
        createGitStash: true,
        logLevel: 'info'
      },
      safetyProtocols: {
        maxVariablesAutoProcess: 20,
        requireManualReview: !this.config.skipManualReview,
        enhancedValidation: true,
        createDetailedBackups: true
      }
    });
  }

  /**
   * Run complete analysis and batch processing workflow
   */
  async runCompleteWorkflow(): Promise<void> {
    console.log('🚀 Starting complete unused variable elimination workflow...\n');

    try {
      // Step 1: Run analysis if report doesn't exist
      if (!fs.existsSync(this.config.analysisReportPath!)) {
        console.log('📊 Running unused variable analysis...');
        await this.runAnalysis();
      } else {
        console.log('📄 Using existing analysis report...');
      }

      // Step 2: Load analysis results
      const files = this.loadAnalysisResults();
      console.log(`📋 Loaded ${files.length} files for processing`);

      // Step 3: Create processing plan
      console.log('\n📋 Creating processing plan...');
      const plan = await this.orchestrator.createProcessingPlan(files);

      // Step 4: Display plan summary
      this.displayPlanSummary(plan);

      // Step 5: Execute batch processing (if not dry run)
      if (!this.config.dryRun) {
        console.log('\n🔄 Executing batch processing campaign...');
        const campaign = await this.orchestrator.executeCampaign(files);

        // Step 6: Display results
        this.displayCampaignResults(campaign);
      } else {
        console.log('\n🔍 Dry run completed - no changes made');
      }

    } catch (error) {
      console.error(`❌ Workflow failed: ${error}`);
      throw error;
    }
  }

  /**
   * Run only the analysis phase
   */
  async runAnalysis(): Promise<void> {
    const analyzer = new UnusedVariableAnalyzer();
    await analyzer.analyze();
    console.log('✅ Analysis completed');
  }

  /**
   * Load analysis results and convert to file processing info
   */
  private loadAnalysisResults(): FileProcessingInfo[] {
    const reportPath = path.resolve(this.config.analysisReportPath!);

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Analysis report not found: ${reportPath}`);
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportContent);

    // Group variables by file
    const fileMap = new Map<string, any[]>();

    report.detailedResults
      .filter((result: any) => !result.preservation.shouldPreserve) // Only elimination candidates
      .forEach((result: any) => {
        const existing = fileMap.get(result.filePath);
        if (existing) {
          existing.push(result);
        } else {
          fileMap.set(result.filePath, [result]);
        }
      });

    // Convert to FileProcessingInfo
    const files: FileProcessingInfo[] = [];

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
      });
    }

    return files;
  }

  /**
   * Determine if file is high impact
   */
  private isHighImpactFile(filePath: string): boolean {
    return /\/src\/(services|calculations)\//.test(filePath) ||
           /\/src\/utils\/(?:astrology|astronomy|planetary|elemental)/.test(filePath);
  }

  /**
   * Determine if file is critical
   */
  private isCriticalFile(filePath: string): boolean {
    return /\/src\/calculations\//.test(filePath) ||
           /\/src\/utils\/reliableAstronomy/.test(filePath) ||
           /\/src\/utils\/elementalUtils/.test(filePath);
  }

  /**
   * Map risk level from analysis to batch processor format
   */
  private mapRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  /**
   * Display processing plan summary
   */
  private displayPlanSummary(plan: any): void {
    console.log('\n📊 Processing Plan Summary:');
    console.log(`   Total Files: ${plan.totalFiles}`);
    console.log(`   Automatic Processing: ${plan.automaticProcessing.length}`);
    console.log(`   Manual Review Required: ${plan.manualReviewRequired.length}`);
    console.log(`   Estimated Batches: ${plan.estimatedBatches}`);
    console.log(`   Estimated Duration: ${plan.estimatedDuration}`);

    console.log('\n📈 Risk Distribution:');
    console.log(`   Low Risk: ${plan.riskSummary.low} files`);
    console.log(`   Medium Risk: ${plan.riskSummary.medium} files`);
    console.log(`   High Risk: ${plan.riskSummary.high} files`);
    console.log(`   Critical Risk: ${plan.riskSummary.critical} files`);

    if (plan.manualReviewRequired.length > 0) {
      console.log('\n👥 Files Requiring Manual Review:');
      plan.manualReviewRequired.slice(0, 5).forEach((file: any) => {
        console.log(`   - ${file.relativePath} (${file.unusedVariableCount} variables, ${file.riskLevel} risk)`);
      });
      if (plan.manualReviewRequired.length > 5) {
        console.log(`   ... and ${plan.manualReviewRequired.length - 5} more files`);
      }
    }
  }

  /**
   * Display campaign results
   */
  private displayCampaignResults(campaign: any): void {
    console.log('\n🎯 Campaign Results:');
    console.log(`   Campaign ID: ${campaign.campaignId}`);
    console.log(`   Status: ${campaign.status.toUpperCase()}`);
    console.log(`   Duration: ${Math.floor(campaign.finalStats.timeElapsed / 60000)} minutes`);

    console.log('\n📊 Final Statistics:');
    console.log(`   Total Processed: ${campaign.finalStats.totalProcessed}`);
    console.log(`   Total Eliminated: ${campaign.finalStats.totalEliminated}`);
    console.log(`   Total Preserved: ${campaign.finalStats.totalPreserved}`);
    console.log(`   Success Rate: ${campaign.finalStats.successRate.toFixed(1)}%`);

    if (campaign.finalStats.totalProcessed > 0) {
      const eliminationRate = (campaign.finalStats.totalEliminated / campaign.finalStats.totalProcessed) * 100;
      console.log(`   Elimination Rate: ${eliminationRate.toFixed(1)}%`);
    }

    console.log('\n🔄 Batch Summary:');
    const successfulBatches = campaign.batchResults.filter((r: any) => r.success).length;
    console.log(`   Total Batches: ${campaign.batchResults.length}`);
    console.log(`   Successful Batches: ${successfulBatches}`);
    console.log(`   Failed Batches: ${campaign.batchResults.length - successfulBatches}`);

    if (campaign.manualReviews.length > 0) {
      console.log(`\n👥 Manual Reviews: ${campaign.manualReviews.length} pending`);
    }

    if (campaign.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      campaign.recommendations.forEach((rec: string) => {
        console.log(`   - ${rec}`);
      });
    }

    console.log(`\n📄 Detailed reports saved to: ${this.config.outputDirectory}`);
  }

  /**
   * Get pending manual reviews
   */
  getPendingManualReviews() {
    return this.orchestrator.getPendingManualReviews();
  }

  /**
   * Approve manual review
   */
  approveManualReview(filePath: string, notes?: string): boolean {
    return this.orchestrator.approveManualReview(filePath, notes);
  }

  /**
   * Reject manual review
   */
  rejectManualReview(filePath: string, reason: string): boolean {
    return this.orchestrator.rejectManualReview(filePath, reason);
  }
}

/**
 * CLI entry point for integration
 */
export async function runIntegration(config: IntegrationConfig = {}): Promise<void> {
  const integration = new BatchProcessingIntegration(config);
  await integration.runCompleteWorkflow();
}

// Export for use in other scripts
export default BatchProcessingIntegration;

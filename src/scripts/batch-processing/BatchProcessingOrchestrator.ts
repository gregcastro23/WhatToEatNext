/**
 * Batch Processing Orchestrator for Unused Variable Elimination
 *
 * This orchestrator coordinates the safe batch processing framework with
 * enhanced safety protocols to provide a comprehensive solution for
 * unused variable elimination with maximum safety.
 *
 * Features:
 * - Integrates SafeBatchProcessor and EnhancedSafetyProtocols
 * - Provides unified interface for batch processing operations
 * - Handles manual review workflows
 * - Generates comprehensive progress reports
 * - Implements campaign-style execution with safety checkpoints
 */

import fs from 'fs';
import path from 'path';

import {
  EnhancedSafetyProtocols,
  FileRiskAssessment,
  HighImpactFileConfig,
  ManualReviewRequest
} from './EnhancedSafetyProtocols';
import {
  BatchProcessingConfig,
  BatchResult,
  FileProcessingInfo,
  SafeBatchProcessor
} from './SafeBatchProcessor';

export interface OrchestratorConfig {
  batchProcessing: Partial<BatchProcessingConfig>,
  safetyProtocols: Partial<HighImpactFileConfig>,
  outputDirectory: string,
  generateReports: boolean,
  interactiveMode: boolean
}

export interface ProcessingPlan {
  totalFiles: number,
  automaticProcessing: FileRiskAssessment[],
  manualReviewRequired: FileRiskAssessment[],
  estimatedBatches: number,
  estimatedDuration: string,
  riskSummary: {
    low: number,
    medium: number,
    high: number,
    critical: number
  };
}

export interface CampaignReport {
  campaignId: string,
  startTime: Date,
  endTime?: Date;
  status: 'planning' | 'executing' | 'paused' | 'completed' | 'failed',
  processingPlan: ProcessingPlan,
  batchResults: BatchResult[],
  manualReviews: ManualReviewRequest[],
  finalStats: {
    totalProcessed: number,
    totalEliminated: number,
    totalPreserved: number,
    successRate: number,
    timeElapsed: number
  };
  recommendations: string[]
}

export class BatchProcessingOrchestrator {
  private batchProcessor: SafeBatchProcessor,
  private safetyProtocols: EnhancedSafetyProtocols,
  private config: OrchestratorConfig,
  private currentCampaign?: CampaignReport,

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      batchProcessing: {},
      safetyProtocols: {},
      outputDirectory: 'reports/batch-processing',
      generateReports: true,
      interactiveMode: false,
      ...config
    };

    this.batchProcessor = new SafeBatchProcessor(this.config.batchProcessing);
    this.safetyProtocols = new EnhancedSafetyProtocols(this.config.safetyProtocols);

    // Ensure output directory exists
    if (this.config.generateReports && !fs.existsSync(this.config.outputDirectory)) {
      fs.mkdirSync(this.config.outputDirectory, { recursive: true });
    }
  }

  /**
   * Create a comprehensive processing plan
   */
  async createProcessingPlan(files: FileProcessingInfo[]): Promise<ProcessingPlan> {
    // // console.log('📋 Creating comprehensive processing plan...');

    const assessments = files.map(file =>;
      this.safetyProtocols.assessFileRisk(file.filePath, file.unusedVariableCount),
    );

    const automaticProcessing = assessments.filter(a => !a.requiresManualReview);
    const manualReviewRequired = assessments.filter(a => a.requiresManualReview);

    // Calculate risk summary
    const riskSummary = {
      low: assessments.filter(a => a.riskLevel === 'low').length,
      medium: assessments.filter(a => a.riskLevel === 'medium').length,
      high: assessments.filter(a => a.riskLevel === 'high').length,,
      critical: assessments.filter(a => a.riskLevel === 'critical').length,,
    };

    // Estimate number of batches
    const estimatedBatches = this.estimateBatchCount(automaticProcessing);

    // Estimate duration (rough calculation)
    const estimatedMinutes = estimatedBatches * 2 + manualReviewRequired.length * 5;
    const estimatedDuration = this.formatDuration(estimatedMinutes);

    const plan: ProcessingPlan = {
      totalFiles: files.length;
      automaticProcessing,
      manualReviewRequired,
      estimatedBatches,
      estimatedDuration,
      riskSummary
    };

    // // console.log(`📊 Processing Plan Summary:`);
    // // console.log(`   Total Files: ${plan.totalFiles}`);
    // // console.log(`   Automatic Processing: ${plan.automaticProcessing.length}`);
    // // console.log(`   Manual Review Required: ${plan.manualReviewRequired.length}`);
    // // console.log(`   Estimated Batches: ${plan.estimatedBatches}`);
    // // console.log(`   Estimated Duration: ${plan.estimatedDuration}`);
    // // console.log(
      `   Risk Distribution: Low(${riskSummary.low}) Medium(${riskSummary.medium}) High(${riskSummary.high}) Critical(${riskSummary.critical})`,
    );

    return plan;
  }

  /**
   * Execute the batch processing campaign
   */
  async executeCampaign(files: FileProcessingInfo[]): Promise<CampaignReport> {
    const campaignId = `unused-vars-campaign-${Date.now()}`;
    // // console.log(`🚀 Starting batch processing campaign: ${campaignId}`);

    // Create processing plan
    const processingPlan = await this.createProcessingPlan(files);

    // Initialize campaign report
    this.currentCampaign = {
      campaignId,
      startTime: new Date(),
      status: 'planning',
      processingPlan,
      batchResults: [],
      manualReviews: [],
      finalStats: {
        totalProcessed: 0,
        totalEliminated: 0,
        totalPreserved: 0,
        successRate: 0,
        timeElapsed: 0
      },
      recommendations: []
    };

    try {
      // Handle manual reviews first if in interactive mode
      if (this.config.interactiveMode && processingPlan.manualReviewRequired.length > 0) {
        await this.handleManualReviews(processingPlan.manualReviewRequired);
      }

      // Execute automatic processing
      this.currentCampaign.status = 'executing';
      const automaticFiles = this.convertAssessmentsToFileInfo(processingPlan.automaticProcessing);

      if (automaticFiles.length > 0) {
        // // console.log(`\n🔄 Processing ${automaticFiles.length} files automatically...`);
        const batchResults = await this.batchProcessor.processBatches(automaticFiles);
        this.currentCampaign.batchResults = batchResults;
      }

      // Calculate final statistics
      this.calculateFinalStats();

      // Generate recommendations
      this.generateRecommendations();

      this.currentCampaign.status = 'completed';
      this.currentCampaign.endTime = new Date();

      // // console.log(`\n✅ Campaign completed successfully: ${campaignId}`);
    } catch (error) {
      console.error(`❌ Campaign failed: ${error}`);
      this.currentCampaign.status = 'failed';
      this.currentCampaign.endTime = new Date();
      throw error;
    }

    // Generate reports if enabled
    if (this.config.generateReports) {
      await this.generateCampaignReport();
    }

    return this.currentCampaign;
  }

  /**
   * Handle manual review workflow
   */
  private async handleManualReviews(assessments: FileRiskAssessment[]): Promise<void> {
    // // console.log(`\n👥 Manual Review Required for ${assessments.length} files:`);

    for (const assessment of assessments) {
      const reviewRequest = this.safetyProtocols.createManualReviewRequest(assessment);
      if (this.currentCampaign) {
        this.currentCampaign.manualReviews.push(reviewRequest);
      }

      // // console.log(`\n📋 Manual Review: ${assessment.relativePath}`);
      // // console.log(`   Risk Level: ${assessment.riskLevel.toUpperCase()}`);
      // // console.log(`   Unused Variables: ${assessment.unusedVariableCount}`);
      // // console.log(`   Risk Factors:`);
      assessment.riskFactors.forEach(factor => // // console.log(`     - ${factor}`));
      // // console.log(`   Review Instructions:`);
      reviewRequest.reviewInstructions.forEach(instruction => // // console.log(`     - ${instruction}`));

      if (this.config.interactiveMode) {
        // In a real implementation, this would prompt for user input
        // For now, we'll simulate approval for non-critical files
        if (assessment.riskLevel !== 'critical') {
          this.safetyProtocols.approveManualReview(assessment.filePath, 'Auto-approved for demo')
        } else {
          // // console.log(`   ⚠️  CRITICAL FILE - Manual approval required before processing`);
        }
      }
    }
  }

  /**
   * Convert risk assessments back to file processing info
   */
  private convertAssessmentsToFileInfo(assessments: FileRiskAssessment[]): FileProcessingInfo[] {
    return assessments.map(assessment => ({
      filePath: assessment.filePath,
      relativePath: assessment.relativePath,
      isHighImpact: assessment.riskLevel === 'high' || assessment.riskLevel === 'critical',,
      isCritical: assessment.riskLevel === 'critical',,
      unusedVariableCount: assessment.unusedVariableCount,
      riskLevel: assessment.riskLevel,
      fileType: assessment.fileType
    }));
  }

  /**
   * Estimate number of batches needed
   */
  private estimateBatchCount(assessments: FileRiskAssessment[]): number {
    let batches = 0;
    let currentBatchSize = 0;
    let currentBatchLimit = 15;

    for (const assessment of assessments) {
      const fileLimit = assessment.recommendedBatchSize;

      if (currentBatchSize === 0) {
        currentBatchLimit = fileLimit;
      }

      if (currentBatchSize >= Math.min(currentBatchLimit, fileLimit)) {
        batches++;
        currentBatchSize = 1;
        currentBatchLimit = fileLimit;
      } else {
        currentBatchSize++
      }
    }

    if (currentBatchSize > 0) {
      batches++
    }

    return batches;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Calculate final campaign statistics
   */
  private calculateFinalStats(): void {
    if (!this.currentCampaign) return;

    const stats = this.batchProcessor.getProcessingStats();
    const successfulBatches = this.currentCampaign.batchResults.filter(r => r.success).length;
    const totalBatches = this.currentCampaign.batchResults.length;

    this.currentCampaign.finalStats = {
      totalProcessed: stats.totalProcessed,
      totalEliminated: stats.totalEliminated,
      totalPreserved: stats.totalPreserved,
      successRate: totalBatches > 0 ? (successfulBatches / totalBatches) * 100 : 0,
      timeElapsed: this.currentCampaign.endTime
        ? this.currentCampaign.endTime.getTime() - this.currentCampaign.startTime.getTime()
        : Date.now() - this.currentCampaign.startTime.getTime()
    };
  }

  /**
   * Generate campaign recommendations
   */
  private generateRecommendations(): void {
    if (!this.currentCampaign) return;

    const recommendations: string[] = [];
    const stats = this.currentCampaign.finalStats;

    // Success rate recommendations
    if (stats.successRate < 90) {
      recommendations.push('Consider reducing batch sizes for better success rate');
    }

    // Manual review recommendations
    if (this.currentCampaign.manualReviews.length > 0) {
      recommendations.push(
        `Complete ${this.currentCampaign.manualReviews.length} pending manual reviews`,
      );
    }

    // Processing efficiency recommendations
    if (stats.totalProcessed > 0) {
      const eliminationRate = (stats.totalEliminated / stats.totalProcessed) * 100;
      if (eliminationRate < 70) {
        recommendations.push(
          'Review preservation patterns - elimination rate is lower than expected',
        )
      }
    }

    // Failed batch recommendations
    const failedBatches = this.currentCampaign.batchResults.filter(r => !r.success);
    if (failedBatches.length > 0) {
      recommendations.push(
        `Investigate ${failedBatches.length} failed batches for root cause analysis`,
      );
    }

    this.currentCampaign.recommendations = recommendations;
  }

  /**
   * Generate comprehensive campaign report
   */
  private async generateCampaignReport(): Promise<void> {
    if (!this.currentCampaign) return;

    const reportPath = path.join(;
      this.config.outputDirectory;
      `${this.currentCampaign.campaignId}-report.json`,
    );

    const summaryPath = path.join(;
      this.config.outputDirectory;
      `${this.currentCampaign.campaignId}-summary.md`,
    );

    // Generate JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.currentCampaign, null, 2));

    // Generate Markdown summary
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summary);

    // // console.log(`📄 Campaign report saved to: ${reportPath}`);
    // // console.log(`📄 Campaign summary saved to: ${summaryPath}`);
  }

  /**
   * Generate Markdown summary report
   */
  private generateMarkdownSummary(): string {
    if (!this.currentCampaign) return '';

    const campaign = this.currentCampaign;
    const duration = campaign.endTime;
      ? campaign.endTime.getTime() - campaign.startTime.getTime()
      : 0,

    return `# Batch Processing Campaign Report

## Campaign Overview
- **Campaign ID**: ${campaign.campaignId}
- **Start Time**: ${campaign.startTime.toISOString()}
- **End Time**: ${campaign.endTime?.toISOString() || 'In Progress'}
- **Status**: ${campaign.status.toUpperCase()}
- **Duration**: ${this.formatDuration(Math.floor(duration / 60000))}

## Processing Plan
- **Total Files**: ${campaign.processingPlan.totalFiles}
- **Automatic Processing**: ${campaign.processingPlan.automaticProcessing.length}
- **Manual Review Required**: ${campaign.processingPlan.manualReviewRequired.length}
- **Estimated Batches**: ${campaign.processingPlan.estimatedBatches}

## Risk Distribution
- **Low Risk**: ${campaign.processingPlan.riskSummary.low} files
- **Medium Risk**: ${campaign.processingPlan.riskSummary.medium} files
- **High Risk**: ${campaign.processingPlan.riskSummary.high} files
- **Critical Risk**: ${campaign.processingPlan.riskSummary.critical} files

## Final Statistics
- **Total Processed**: ${campaign.finalStats.totalProcessed}
- **Total Eliminated**: ${campaign.finalStats.totalEliminated}
- **Total Preserved**: ${campaign.finalStats.totalPreserved}
- **Success Rate**: ${campaign.finalStats.successRate.toFixed(1)}%
- **Elimination Rate**: ${campaign.finalStats.totalProcessed > 0 ? ((campaign.finalStats.totalEliminated / campaign.finalStats.totalProcessed) * 100).toFixed(1) : 0}%

## Batch Results
${campaign.batchResults
  .map(
    (batch, index) => `
### Batch ${index + 1}: ${batch.batchId}
- **Files**: ${batch.files.length}
- **Success**: ${batch.success ? '✅' : '❌'}
- **Processed**: ${batch.processedCount}
- **Eliminated**: ${batch.eliminatedCount}
- **Preserved**: ${batch.preservedCount}
- **Compilation**: ${batch.compilationPassed ? '✅' : '❌'}
- **Processing Time**: ${batch.processingTime}ms
${batch.errors.length > 0 ? `- **Errors**: ${batch.errors.join(', ')}` : ''}
${batch.rollbackPerformed ? '- **Rollback**: Performed' : ''}
`,
  )
  .join('')}

## Manual Reviews
${
  campaign.manualReviews.length > 0
    ? campaign.manualReviews
        .map(
          review => `;
### ${path.relative(process.cwd(), review.filePath)}
- **Unused Variables**: ${review.unusedVariableCount}
- **Risk Factors**: ${review.riskFactors.join(', ')}
- **Approval Required**: ${review.approvalRequired ? 'Yes' : 'No'}
`,
        )
        .join('')
    : 'No manual reviews required.'
}

## Recommendations
${campaign.recommendations.map(rec => `- ${rec}`).join('\n')};

## Safety Checkpoints
${this.batchProcessor
  .getSafetyCheckpoints()
  .map(
    checkpoint => `;
### ${checkpoint.id}
- **Timestamp**: ${checkpoint.timestamp.toISOString()}
- **Compilation Status**: ${checkpoint.compilationStatus ? '✅' : '❌'}
- **Error Count**: ${checkpoint.errorCount}
${checkpoint.stashId ? `- **Stash ID**: ${checkpoint.stashId}` : ''}
`,
  )
  .join('')}
`;
  }

  /**
   * Get current campaign status
   */
  getCurrentCampaign(): CampaignReport | undefined {
    return this.currentCampaign;
  }

  /**
   * Get pending manual reviews
   */
  getPendingManualReviews(): ManualReviewRequest[] {
    return this.safetyProtocols.getPendingManualReviews();
  }

  /**
   * Approve a manual review
   */
  approveManualReview(filePath: string, reviewerNotes?: string): boolean {
    return this.safetyProtocols.approveManualReview(filePath, reviewerNotes)
  }

  /**
   * Reject a manual review
   */
  rejectManualReview(filePath: string, reason: string): boolean {
    return this.safetyProtocols.rejectManualReview(filePath, reason)
  }
}

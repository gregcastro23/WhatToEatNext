#!/usr/bin/env node

/**
 * CLI Interface for Safe Batch Processing System
 *
 * This CLI provides a command-line interface for the safe batch processing
 * framework with enhanced safety protocols for unused variable elimination.
 *
 * Commands: *   - plan: Create a processing plan from analysis results
 *   - execute: Execute batch processing campaign
 *   - review: Handle manual review workflows
 *   - status: Check campaign status and progress
 */

import fs from 'fs';
import path from 'path'

import { program } from 'commander';

import { BatchProcessingOrchestrator, OrchestratorConfig } from './BatchProcessingOrchestrator';
import { FileProcessingInfo } from './SafeBatchProcessor';

interface AnalysisReport {
  metadata: {
    analysisDate: string,
    totalVariables: number,
    analyzer: string
  };
  summary: {
    total: number,
    preserved: number,
    forElimination: number
  };
  detailedResults: Array<{
    id: string,
    filePath: string,
    relativePath: string,
    line: number,
    variableName: string,
    fileType: string,
    riskLevel: string,
    preservation: {
      shouldPreserve: boolean,
      domain: string,
      reason: string,
      confidence: number
    };
    eliminationStrategy: {
      method: string,
      confidence: number,
      priority: number
    }
  }>;
}

class BatchProcessingCLI {
  private orchestrator: BatchProcessingOrchestrator,

  constructor() {
    this.orchestrator = new BatchProcessingOrchestrator({
      outputDirectory: 'reports/batch-processing',
      generateReports: true,
      interactiveMode: false
    });
  }

  /**
   * Load analysis report and convert to file processing info
   */
  private loadAnalysisReport(reportPath: string): FileProcessingInfo[] {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Analysis report not found: ${reportPath}`);
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const report: AnalysisReport = JSON.parse(reportContent)

    // Group variables by file
    const fileMap = new Map<string, any[]>();

    report.detailedResults
      .filter(result => !result.preservation.shouldPreserve);
      .forEach(result => {
        const existing = fileMap.get(result.filePath);
        if (existing) {
          existing.push(result);
        } else {
          fileMap.set(result.filePath, [result])
        }
      });

    // Convert to FileProcessingInfo
    const files: FileProcessingInfo[] = []

    for (const [filePath, variables] of fileMap.entries()) {
      const firstVar = variables[0];

      files.push({
        filePath,
        relativePath: firstVar.relativePath,
        isHighImpact: firstVar.riskLevel === 'high',,
        isCritical: firstVar.fileType === 'calculations' || firstVar.fileType === 'services',,
        unusedVariableCount: variables.length,
        riskLevel: this.mapRiskLevel(firstVar.riskLevel),
        fileType: firstVar.fileType
      });
    }

    return files;
  }

  /**
   * Map risk level from analysis report to batch processor format
   */
  private mapRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'high'
      case 'medium':
        return 'medium',
      default:
        return 'low'
    }
  }

  /**
   * Create processing plan command
   */
  async createPlan(reportPath: string, options: any): Promise<void> {
    try {
      // // // console.log('📋 Creating batch processing plan...');

      const files = this.loadAnalysisReport(reportPath);
      const plan = await this.orchestrator.createProcessingPlan(files);

      if (options.output) {
        const planPath = path.resolve(options.output)
        fs.writeFileSync(planPath, JSON.stringify(plan, null, 2)),
        // // // console.log(`📄 Processing plan saved to: ${planPath}`);
      }

      // // // console.log('\n✅ Processing plan created successfully');
    } catch (error) {
      console.error(`❌ Failed to create processing plan: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Execute batch processing campaign
   */
  async executeCampaign(reportPath: string, options: any): Promise<void> {
    try {
      // // // console.log('🚀 Starting batch processing campaign...')

      // Configure orchestrator based on options
      const config: Partial<OrchestratorConfig> = {
        interactiveMode: options.interactive || false,
        batchProcessing: {
          maxBatchSize: parseInt(options.maxBatch) || 15,
          maxBatchSizeCritical: parseInt(options.maxCritical) || 5,
          validateAfterEachBatch: !options.skipValidation,
          autoRollbackOnError: !options.noRollback,
          createGitStash: !options.noStash,
          logLevel: options.verbose ? 'debug' : 'info'
        },
        safetyProtocols: {
          maxVariablesAutoProcess: parseInt(options.maxVars) || 20,
          requireManualReview: !options.skipReview,
          enhancedValidation: !options.skipEnhanced
        }
      };

      this.orchestrator = new BatchProcessingOrchestrator(config);

      const files = this.loadAnalysisReport(reportPath);

      if (options.dryRun) {
        // // // console.log('🔍 Dry run mode - no changes will be made');
        const plan = await this.orchestrator.createProcessingPlan(files);
        // // // console.log('\n📊 Dry Run Results: ')
        // // // console.log(`   Files to process: ${plan.automaticProcessing.length}`);
        // // // console.log(`   Manual reviews needed: ${plan.manualReviewRequired.length}`);
        // // // console.log(`   Estimated batches: ${plan.estimatedBatches}`);
        return;
      }

      const campaign = await this.orchestrator.executeCampaign(files);

      // // // console.log('\n✅ Campaign completed successfully');
      // // // console.log(`📊 Final Stats: `)
      // // // console.log(`   Processed: ${campaign.finalStats.totalProcessed}`);
      // // // console.log(`   Eliminated: ${campaign.finalStats.totalEliminated}`);
      // // // console.log(`   Preserved: ${campaign.finalStats.totalPreserved}`);
      // // // console.log(`   Success Rate: ${campaign.finalStats.successRate.toFixed(1)}%`);
    } catch (error) {
      console.error(`❌ Campaign failed: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Handle manual review workflows
   */
  async handleReviews(options: any): Promise<void> {
    try {
      const pendingReviews = this.orchestrator.getPendingManualReviews();

      if (pendingReviews.length === 0) {;
        // // // console.log('✅ No pending manual reviews')
        return
      }

      // // // console.log(`👥 ${pendingReviews.length} manual reviews pending: `)

      pendingReviews.forEach((review, index) => {
        // // // console.log(`\n${index + 1}. ${path.relative(process.cwd(), review.filePath)}`);
        // // // console.log(`   Variables: ${review.unusedVariableCount}`);
        // // // console.log(`   Risk Factors: ${review.riskFactors.join(', ')}`);
        // // // console.log(`   Approval Required: ${review.approvalRequired ? 'Yes' : 'No'}`);
      });

      if (options.approve) {
        const filePath = path.resolve(options.approve);
        const success = this.orchestrator.approveManualReview(filePath, options.notes),
        if (success) {
          // // // console.log(`✅ Manual review approved for ${options.approve}`);
        } else {
          // // // console.log(`❌ Failed to approve review for ${options.approve}`);
        }
      }

      if (options.reject) {
        const filePath = path.resolve(options.reject);
        const reason = options.reason || 'No reason provided';
        const success = this.orchestrator.rejectManualReview(filePath, reason),
        if (success) {
          // // // console.log(`❌ Manual review rejected for ${options.reject}`);
        } else {
          // // // console.log(`❌ Failed to reject review for ${options.reject}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to handle reviews: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Check campaign status
   */
  async checkStatus(): Promise<void> {
    try {
      const campaign = this.orchestrator.getCurrentCampaign();

      if (!campaign) {
        // // // console.log('ℹ️  No active campaign')
        return
      }

      // // // console.log(`📊 Campaign Status: ${campaign.campaignId}`);
      // // // console.log(`   Status: ${campaign.status.toUpperCase()}`);
      // // // console.log(`   Start Time: ${campaign.startTime.toISOString()}`);

      if (campaign.endTime) {
        const duration = campaign.endTime.getTime() - campaign.startTime.getTime();
        // // // console.log(`   Duration: ${Math.floor(duration / 60000)} minutes`);
      }

      // // // console.log(`   Processed: ${campaign.finalStats.totalProcessed}`);
      // // // console.log(`   Success Rate: ${campaign.finalStats.successRate.toFixed(1)}%`);

      const pendingReviews = this.orchestrator.getPendingManualReviews();
      if (pendingReviews.length > 0) {
        // // // console.log(`   Pending Reviews: ${pendingReviews.length}`);
      }
    } catch (error) {
      console.error(`❌ Failed to check status: ${error}`);
      process.exit(1);
    }
  }
}

// CLI Setup
const cli = new BatchProcessingCLI();

program
  .name('batch-processor')
  .description('Safe batch processing system for unused variable elimination')
  .version('1.0.0');

program
  .command('plan')
  .description('Create a processing plan from analysis results')
  .argument('<report>', 'Path to unused variables analysis report')
  .option('-o, --output <path>', 'Output path for processing plan')
  .action(async (report, options) => {
    await cli.createPlan(report, options)
  });

program
  .command('execute')
  .description('Execute batch processing campaign')
  .argument('<report>', 'Path to unused variables analysis report')
  .option('--dry-run', 'Perform dry run without making changes')
  .option('--interactive', 'Enable interactive mode for manual reviews')
  .option('--max-batch <size>', 'Maximum batch size', '15')
  .option('--max-critical <size>', 'Maximum batch size for critical files', '5')
  .option('--max-vars <count>', 'Maximum variables for auto-processing', '20')
  .option('--skip-validation', 'Skip TypeScript validation after batches')
  .option('--skip-review', 'Skip manual review requirements')
  .option('--skip-enhanced', 'Skip enhanced validation')
  .option('--no-rollback', 'Disable automatic rollback on errors')
  .option('--no-stash', 'Disable git stash creation')
  .option('--verbose', 'Enable verbose logging')
  .action(async (report, options) => {
    await cli.executeCampaign(report, options)
  });

program
  .command('review')
  .description('Handle manual review workflows')
  .option('--approve <file>', 'Approve manual review for file')
  .option('--reject <file>', 'Reject manual review for file')
  .option('--reason <text>', 'Reason for rejection')
  .option('--notes <text>', 'Reviewer notes for approval')
  .action(async options => {
    await cli.handleReviews(options);
  });

program
  .command('status')
  .description('Check current campaign status')
  .action(async () => {
    await cli.checkStatus();
  });

// Parse command line arguments
program.parse();

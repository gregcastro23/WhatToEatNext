/**
 * Validation Integration Module
 *
 * This module integrates the comprehensive validation framework with the existing
 * batch processing system to ensure seamless validation after each batch.
 *
 * Features:
 * - Integration with SafeBatchProcessor
 * - Automatic validation triggering after batch processing
 * - Rollback coordination with batch processing safety protocols
 * - Quality assurance reporting integration
 */

import { BatchResult } from '../batch-processing/SafeBatchProcessor';

import {
  ComprehensiveValidationFramework,
  ComprehensiveValidationResult,
  ValidationConfig
} from './ComprehensiveValidationFramework';

export interface ValidationIntegrationConfig {
  validationConfig: Partial<ValidationConfig>,
  enableAutomaticValidation: boolean,
  enableAutomaticRollback: boolean,
  qualityThreshold: number,
  criticalValidationTypes: string[],
  reportingEnabled: boolean,
  reportingPath?: string
}

export interface IntegratedBatchResult extends BatchResult {
  validationResult?: ComprehensiveValidationResult,
  qualityScore?: number,
  validationPassed?: boolean,
  validationRecommendations?: string[]
}

export interface QualityAssuranceReport {
  batchId: string,
  timestamp: Date,
  processedFiles: string[],
  batchResult: BatchResult,
  validationResult: ComprehensiveValidationResult,
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical',
  recommendations: string[],
  actionRequired: boolean,
  rollbackRecommended: boolean
}

export class ValidationIntegration {
  private validationFramework: ComprehensiveValidationFramework,
  private config: ValidationIntegrationConfig,
  private qualityReports: Map<string, QualityAssuranceReport> = new Map(),

  constructor(config: Partial<ValidationIntegrationConfig> = {}) {
    this.config = {
      validationConfig: {},
      enableAutomaticValidation: true,
      enableAutomaticRollback: true,
      qualityThreshold: 80,
      criticalValidationTypes: ['typescript-compilation', 'test-suite', 'react-component'],
      reportingEnabled: true,
      reportingPath: './validation-reports',
      ...config
    };

    this.validationFramework = new ComprehensiveValidationFramework(this.config.validationConfig);
  }

  /**
   * Integrate validation with batch processing result
   */
  async validateBatchResult(
    batchResult: BatchResult,
    processedFiles: string[],
  ): Promise<IntegratedBatchResult> {
    const integratedResult: IntegratedBatchResult = { ...batchResult };

    if (!this.config.enableAutomaticValidation) {
      // // console.log('🔍 Automatic validation disabled, skipping validation'),
      return integratedResult
    }

    // // console.log(`🔍 Starting integrated validation for batch ${batchResult.batchId}`);

    try {
      // Perform comprehensive validation
      const validationResult = await this.validationFramework.performComprehensiveValidation(;
        processedFiles,
        batchResult.batchId
      );

      // Integrate validation results
      integratedResult.validationResult = validationResult;
      integratedResult.qualityScore = validationResult.qualityScore;
      integratedResult.validationPassed = validationResult.overallPassed;
      integratedResult.validationRecommendations = validationResult.summary.recommendations;

      // Update batch success based on validation results
      if (!validationResult.overallPassed) {
        integratedResult.success = false;
        integratedResult.errors.push('Validation failed after batch processing');
      }

      // Check if rollback is needed based on validation
      if (validationResult.requiresRollback && this.config.enableAutomaticRollback) {
        integratedResult.rollbackPerformed = true;
        // // console.log('🔄 Validation requires rollback - coordinating with batch processor');
      }

      // Generate quality assurance report
      if (this.config.reportingEnabled) {
        const qualityReport = this.generateQualityAssuranceReport(;
          batchResult,
          validationResult,
          processedFiles,
        ),
        this.qualityReports.set(batchResult.batchId, qualityReport)
      }

      // // console.log(`✅ Integrated validation completed for batch ${batchResult.batchId}`);
      // // console.log(`📊 Quality Score: ${validationResult.qualityScore}/100`);
      // // console.log(`🎯 Validation Status: ${validationResult.overallPassed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ Integrated validation failed for batch ${batchResult.batchId}: ${error}`);

      integratedResult.success = false;
      integratedResult.errors.push(`Validation integration failed: ${error}`);
      integratedResult.validationPassed = false;
      integratedResult.qualityScore = 0;
    }

    return integratedResult;
  }

  /**
   * Validate multiple batch results in sequence
   */
  async validateBatchSequence(
    batchResults: BatchResult[],
    allProcessedFiles: string[],
  ): Promise<IntegratedBatchResult[]> {
    const integratedResults: IntegratedBatchResult[] = [];
    const cumulativeFiles: string[] = [];

    // // console.log(`🔍 Starting validation sequence for ${batchResults.length} batches`);

    for (let i = 0, i < batchResults.length, i++) {
      const batchResult = batchResults[i];
      const batchFiles = batchResult.files;

      // Add current batch files to cumulative list
      cumulativeFiles.push(...batchFiles);

      // // console.log(`\n🔍 Validating batch ${i + 1}/${batchResults.length}: ${batchResult.batchId}`);

      // Validate current batch with cumulative context
      const integratedResult = await this.validateBatchResult(batchResult, cumulativeFiles);
      integratedResults.push(integratedResult);

      // Stop sequence if critical validation failure occurs
      if (
        !integratedResult.validationPassed &&
        this.isCriticalFailure(integratedResult.validationResult)
      ) {
        // // console.log(
          `❌ Critical validation failure in batch ${batchResult.batchId}, stopping sequence`,
        );
        break;
      }

      // Check quality threshold
      if (
        integratedResult.qualityScore &&
        integratedResult.qualityScore < this.config.qualityThreshold
      ) {
        // // console.log(
          `⚠️ Quality score ${integratedResult.qualityScore} below threshold ${this.config.qualityThreshold}`,
        );
      }
    }

    // // console.log(`✅ Validation sequence completed for ${integratedResults.length} batches`);
    return integratedResults;
  }

  /**
   * Generate comprehensive quality assurance report
   */
  private generateQualityAssuranceReport(
    batchResult: BatchResult,
    validationResult: ComprehensiveValidationResult,
    processedFiles: string[],
  ): QualityAssuranceReport {
    const overallQuality = this.calculateOverallQuality(validationResult.qualityScore);
    const actionRequired =
      !validationResult.overallPassed ||;
      validationResult.qualityScore < this.config.qualityThreshold;
    const rollbackRecommended = validationResult.requiresRollback;

    const recommendations: string[] = [...validationResult.summary.recommendations];

    // Add specific recommendations based on quality score
    if (validationResult.qualityScore < 50) {
      recommendations.push('Consider reviewing the entire batch for potential issues');
      recommendations.push('Manual code review recommended before proceeding');
    } else if (validationResult.qualityScore < 80) {
      recommendations.push('Address validation warnings before proceeding to next batch');
      recommendations.push('Consider additional testing for affected components');
    }

    // Add recommendations based on validation failures
    const failedValidations = validationResult.validationResults.filter(r => !r.passed);
    for (const failure of failedValidations) {
      if (failure.validationType === 'typescript-compilation') {
        recommendations.push('Fix TypeScript compilation errors immediately');
      }
      if (failure.validationType === 'test-suite') {
        recommendations.push('Review and fix failing tests');
      }
      if (failure.validationType === 'react-component') {
        recommendations.push('Verify React component functionality');
      }
    }

    return {
      batchId: batchResult.batchId,
      timestamp: new Date(),
      processedFiles,
      batchResult,
      validationResult,
      overallQuality,
      recommendations: [...new Set(recommendations)],
      actionRequired,
      rollbackRecommended
    };
  }

  /**
   * Calculate overall quality rating
   */
  private calculateOverallQuality(qualityScore: number): QualityAssuranceReport['overallQuality'] {
    if (qualityScore >= 95) return 'excellent';
    if (qualityScore >= 85) return 'good';
    if (qualityScore >= 70) return 'acceptable';
    if (qualityScore >= 50) return 'poor';
    return 'critical'
  }

  /**
   * Check if validation failure is critical
   */
  private isCriticalFailure(validationResult?: ComprehensiveValidationResult): boolean {
    if (!validationResult) return false,

    return validationResult.validationResults.some(
      result =>;
        !result.passed && this.config.criticalValidationTypes.includes(result.validationType);
    )
  }

  /**
   * Get quality assurance report for a specific batch
   */
  getQualityReport(batchId: string): QualityAssuranceReport | undefined {
    return this.qualityReports.get(batchId);
  }

  /**
   * Get all quality assurance reports
   */
  getAllQualityReports(): QualityAssuranceReport[] {
    return Array.from(this.qualityReports.values());
  }

  /**
   * Generate summary report for all validated batches
   */
  generateSummaryReport(): string {
    const reports = this.getAllQualityReports();

    if (reports.length === 0) {
      return 'No quality assurance reports available'
    }

    const totalBatches = reports.length;
    const successfulBatches = reports.filter(r => r.validationResult.overallPassed).length;
    const averageQuality =
      reports.reduce((sum, r) => sum + r.validationResult.qualityScore, 0) / totalBatches;
    const qualityDistribution = this.calculateQualityDistribution(reports);
    const criticalIssues = reports.filter(r => r.overallQuality === 'critical').length;

    const summary = [
      '# Quality Assurance Summary Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Overview',
      `Total Batches Validated: ${totalBatches}`,
      `Successful Batches: ${successfulBatches} (${((successfulBatches / totalBatches) * 100).toFixed(1)}%)`,
      `Average Quality Score: ${averageQuality.toFixed(1)}/100`,
      `Critical Issues: ${criticalIssues}`,
      '',
      '## Quality Distribution',
      `Excellent (95-100): ${qualityDistribution.excellent}`,
      `Good (85-94): ${qualityDistribution.good}`,
      `Acceptable (70-84): ${qualityDistribution.acceptable}`,
      `Poor (50-69): ${qualityDistribution.poor}`,
      `Critical (0-49): ${qualityDistribution.critical}`,
      '',
      '## Batch Details'
    ];

    for (const report of reports) {
      summary.push(`### Batch ${report.batchId} - ${report.overallQuality.toUpperCase()}`);
      summary.push(`Quality Score: ${report.validationResult.qualityScore}/100`);
      summary.push(`Files Processed: ${report.processedFiles.length}`);
      summary.push(
        `Validation Status: ${report.validationResult.overallPassed ? 'PASSED' : 'FAILED'}`,
      );

      if (report.actionRequired) {
        summary.push('**Action Required:** Yes')
      }

      if (report.rollbackRecommended) {
        summary.push('**Rollback Recommended:** Yes')
      }

      if (report.recommendations.length > 0) {
        summary.push('**Recommendations:**');
        report.recommendations.forEach(rec => summary.push(`- ${rec}`));
      }

      summary.push('');
    }

    return summary.join('\n');
  }

  /**
   * Calculate quality distribution across all reports
   */
  private calculateQualityDistribution(reports: QualityAssuranceReport[]): Record<string, number> {
    const distribution = {
      excellent: 0,
      good: 0,
      acceptable: 0,
      poor: 0,
      critical: 0
    };

    for (const report of reports) {
      distribution[report.overallQuality]++
    }

    return distribution;
  }

  /**
   * Export quality reports to file system
   */
  async exportQualityReports(): Promise<void> {
    if (!this.config.reportingEnabled || !this.config.reportingPath) {
      // // console.log('📊 Quality reporting disabled, skipping export'),
      return
    }

    try {
      const fs = await import('fs');
      const path = await import('path');

      // Ensure reporting directory exists
      if (!fs.existsSync(this.config.reportingPath)) {
        fs.mkdirSync(this.config.reportingPath, { recursive: true });
      }

      // Export individual batch reports
      for (const report of this.getAllQualityReports()) {
        const reportPath = path.join(;
          this.config.reportingPath;
          `batch-${report.batchId}-quality-report.json`,
        );
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      }

      // Export summary report
      const summaryPath = path.join(this.config.reportingPath, 'quality-summary-report.md');
      const summaryContent = this.generateSummaryReport();
      fs.writeFileSync(summaryPath, summaryContent);

      // // console.log(`📊 Quality reports exported to ${this.config.reportingPath}`);
    } catch (error) {
      console.error(`❌ Failed to export quality reports: ${error}`);
    }
  }

  /**
   * Get validation framework instance for direct access
   */
  getValidationFramework(): ComprehensiveValidationFramework {
    return this.validationFramework;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ValidationIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update validation framework config if provided
    if (newConfig.validationConfig) {
      this.validationFramework = new ComprehensiveValidationFramework({
        ...this.config.validationConfig;
        ...newConfig.validationConfig
      });
    }
  }

  /**
   * Clear quality reports (useful for testing or reset)
   */
  clearQualityReports(): void {
    this.qualityReports.clear();
    // // console.log('🧹 Quality reports cleared');
  }

  /**
   * Get validation statistics
   */
  getValidationStatistics(): {
    totalBatches: number,
    successfulBatches: number,
    failedBatches: number,
    averageQualityScore: number,
    criticalFailures: number,
    rollbacksRecommended: number
  } {
    const reports = this.getAllQualityReports();
    const totalBatches = reports.length;
    const successfulBatches = reports.filter(r => r.validationResult.overallPassed).length;
    const failedBatches = totalBatches - successfulBatches;
    const averageQualityScore =
      totalBatches > 0;
        ? reports.reduce((sum, r) => sum + r.validationResult.qualityScore, 0) / totalBatches
        : 0,
    const criticalFailures = reports.filter(r => r.overallQuality === 'critical').length;
    const rollbacksRecommended = reports.filter(r => r.rollbackRecommended).length;

    return {
      totalBatches,
      successfulBatches,
      failedBatches,
      averageQualityScore,
      criticalFailures,
      rollbacksRecommended
    };
  }
}

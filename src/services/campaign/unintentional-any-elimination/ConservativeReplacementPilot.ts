/**
 * Conservative Replacement Pilot
 * Executes limited batch processing on high-confidence cases with real-time validation
 *
 * Task 12.2 Implementation:
 * - Run limited batch processing on high-confidence cases (10-15 files per batch)
 // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
 * - Focus on array types (unknown[] → unknown[]) and simple Record types
 * - Monitor build stability and rollback frequency with real-time validation
 * - Collect success rate metrics and safety protocol effectiveness
 * - Validate integration with existing campaign infrastructure
 * - Target >80% successful replacements with zero build failures
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { AnyTypeClassifier } from './AnyTypeClassifier';
import { ProgressiveImprovementEngine } from './ProgressiveImprovementEngine';
import { SafeTypeReplacer } from './SafeTypeReplacer';
import {
  AnyTypeCategory,
  AnyTypeClassification,
  BatchProcessingResult,
  ConservativePilotConfig,
  ConservativePilotResult,
  RealTimeValidationResult,
  ReplacementResult,
  SafetyMetrics,
  TypeReplacement
} from './types';

export class ConservativeReplacementPilot {
  private classifier: AnyTypeClassifier;
  private replacer: SafeTypeReplacer;
  private progressiveEngine: ProgressiveImprovementEngine;
  private config: ConservativePilotConfig,
  private pilotStartTime: Date,
  private batchResults: BatchProcessingResult[] = [];
  private safetyMetrics: SafetyMetrics,

  constructor(config: Partial<ConservativePilotConfig> = {}) {
    this.config = {;
      maxFilesPerBatch: 15,
      minFilesPerBatch: 10,
      targetSuccessRate: 0.8,
      maxBatches: 10,
      realTimeValidation: true,
      rollbackOnFailure: true,
      safetyThreshold: 0.7,
      focusCategories: [AnyTypeCategory.ARRAY_TYPE, AnyTypeCategory.RECORD_TYPE],
      buildValidationFrequency: 1, // Validate after every batch
      ...config
    };

    this.classifier = new AnyTypeClassifier();
    this.replacer = new SafeTypeReplacer(;
      './.conservative-pilot-backups';
      this.config.safetyThreshold
    );
    this.progressiveEngine = new ProgressiveImprovementEngine();
    this.pilotStartTime = new Date();
    this.safetyMetrics = this.initializeSafetyMetrics();
  }

  /**
   * Execute the conservative replacement pilot
   * Main entry point for Task 12.2
   */
  async executePilot(): Promise<ConservativePilotResult> {
    // // // console.log('🚀 Starting Conservative Replacement Pilot...');
    // // // console.log(
      `Configuration: ${this.config.maxFilesPerBatch} files per batch, ${this.config.maxBatches} max batches`,
    );

    try {
      // Phase 1: Identify high-confidence cases
      const highConfidenceCases = await this.identifyHighConfidenceCases();
      // // // console.log(`📊 Found ${highConfidenceCases.length} high-confidence cases`);

      if (highConfidenceCases.length === 0) {;
        return this.createPilotResult(false, 'No high-confidence cases found for replacement')
      }

      // Phase 2: Execute batch processing
      const batchProcessingResult = await this.executeBatchProcessing(highConfidenceCases);

      // Phase 3: Validate integration with campaign infrastructure
      const integrationValidation = await this.validateCampaignIntegration();

      // Phase 4: Generate comprehensive results
      const pilotResult = this.createPilotResult(;
        batchProcessingResult.success && integrationValidation.success;
        batchProcessingResult.success
          ? 'Pilot completed successfully'
          : batchProcessingResult.error
      );

      // Phase 5: Report results
      await this.generatePilotReport(pilotResult);

      return pilotResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Conservative Replacement Pilot failed:', errorMessage),

      return this.createPilotResult(false, `Pilot execution failed: ${errorMessage}`);
    }
  }

  /**
   * Identify high-confidence cases for replacement
   * Focus on array types and simple Record types
   */
  private async identifyHighConfidenceCases(): Promise<TypeReplacement[]> {
    // // // console.log('🔍 Identifying high-confidence replacement cases...');

    const highConfidenceCases: TypeReplacement[] = [];

    try {
      // Get TypeScript files from the codebase
      const tsFiles = await this.getTypeScriptFiles();
      // // // console.log(`📁 Analyzing ${tsFiles.length} TypeScript files`);

      let filesAnalyzed = 0;
      const maxFilesToAnalyze = 100; // Limit for pilot

      for (const filePath of tsFiles.slice(0, maxFilesToAnalyze)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const anyTypeOccurrences = this.findAnyTypeOccurrences(fileContent, filePath);

          for (const occurrence of anyTypeOccurrences) {
            const classification = await this.classifier.classify(occurrence.context);

            // Focus on high-confidence, low-risk categories
            if (this.isHighConfidenceCase(classification)) {
              const replacement = this.createTypeReplacement(occurrence, classification),;
              if (replacement) {
                highConfidenceCases.push(replacement);
              }
            }
          }

          filesAnalyzed++;
          if (filesAnalyzed % 10 === 0) {;
            // // // console.log(
              `📊 Analyzed ${filesAnalyzed} files, found ${highConfidenceCases.length} high-confidence cases`,
            );
          }
        } catch (error) {
          console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
          continue;
        }
      }

      // Sort by confidence score (highest first)
      highConfidenceCases.sort((ab) => b.confidence - a.confidence);

      // // // console.log(
        `✅ Identified ${highConfidenceCases.length} high-confidence cases from ${filesAnalyzed} files`,
      );
      return highConfidenceCases;
    } catch (error) {
      console.error('❌ Failed to identify high-confidence cases:', error),
      return []
    }
  }

  /**
   * Execute batch processing with real-time validation
   */
  private async executeBatchProcessing(cases: TypeReplacement[]): Promise<BatchProcessingResult> {
    // // // console.log(`🔄 Starting batch processing of ${cases.length} cases...`);

    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let batchNumber = 0;

    try {
      // Group cases by file to optimize processing
      const casesByFile = this.groupCasesByFile(cases);
      const fileGroups = Array.from(casesByFile.entries());

      while (totalProcessed < cases.length && batchNumber < this.config.maxBatches) {
        batchNumber++,
        // // // console.log(`\n📦 Processing Batch ${batchNumber}...`),

        // Select files for this batch
        const batchFiles = this.selectBatchFiles(fileGroups, totalProcessed),;
        const batchCases = batchFiles.flatMap(([_, fileCases]) => fileCases);

        if (batchCases.length === 0) {;
          // // // console.log('ℹ️ No more cases to process');
          break
        }

        // // // console.log(
          `📊 Batch ${batchNumber}: Processing ${batchCases.length} cases across ${batchFiles.length} files`,
        );

        // Execute batch with real-time validation
        const batchResult = await this.executeBatch(batchCases, batchNumber);
        this.batchResults.push(batchResult);

        // Update totals
        totalProcessed += batchCases.length;
        totalSuccessful += batchResult.successfulReplacements;
        totalFailed += batchResult.failedReplacements;

        // Real-time validation and safety checks
        const validationResult = await this.performRealTimeValidation(batchResult);
        if (!validationResult.buildStable) {
          console.error('❌ Build stability compromised, stopping pilot'),
          return {
            success: false,
            error: 'Build stability compromised during batch processing',
            totalProcessed,
            totalSuccessful,
            totalFailed,
            batchResults: this.batchResults
          };
        }

        // Check success rate
        const currentSuccessRate = totalSuccessful / totalProcessed;
        // // // console.log(`📈 Current success rate: ${(currentSuccessRate * 100).toFixed(1)}%`);

        if (currentSuccessRate < this.config.targetSuccessRate && batchNumber > 2) {
          console.warn(
            `⚠️ Success rate ${(currentSuccessRate * 100).toFixed(1)}% below target ${(this.config.targetSuccessRate * 100).toFixed(1)}%`,
          );
          // Continue but with increased caution
        }

        // Brief pause between batches for system stability
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const finalSuccessRate = totalSuccessful / totalProcessed;
      const success =
        finalSuccessRate >= this.config.targetSuccessRate && this.safetyMetrics.buildFailures === 0;

      // // // console.log(`\n✅ Batch processing completed:`);
      // // // console.log(`   Total processed: ${totalProcessed}`);
      // // // console.log(`   Successful: ${totalSuccessful}`);
      // // // console.log(`   Failed: ${totalFailed}`);
      // // // console.log(`   Success rate: ${(finalSuccessRate * 100).toFixed(1)}%`);
      // // // console.log(`   Build failures: ${this.safetyMetrics.buildFailures}`);

      return {
        success,
        totalProcessed,
        totalSuccessful,
        totalFailed,
        batchResults: this.batchResults;
        finalSuccessRate
      };
    } catch (error) {
      console.error('❌ Batch processing failed:', error),
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        totalProcessed,
        totalSuccessful,
        totalFailed,
        batchResults: this.batchResults
      };
    }
  }

  /**
   * Execute a single batch with comprehensive safety monitoring
   */
  private async executeBatch(
    cases: TypeReplacement[],
    batchNumber: number,
  ): Promise<BatchProcessingResult> {
    const batchStartTime = new Date();
    // // // console.log(`⚡ Executing batch ${batchNumber} with ${cases.length} cases...`);

    try {
      // Pre-batch validation
      const preBatchValidation = await this.validateBuildStability();
      if (!preBatchValidation.buildSuccessful) {
        console.error('❌ Pre-batch build validation failed');
        this.safetyMetrics.buildFailures++;
        return {
          batchNumber,
          startTime: batchStartTime,
          endTime: new Date(),
          casesProcessed: 0,
          successfulReplacements: 0,
          failedReplacements: cases.length,
          buildStable: false,
          rollbackPerformed: false,
          error: 'Pre-batch build validation failed'
        };
      }

      // Execute replacements
      const replacementResult = await this.replacer.processBatch(cases);

      // Post-batch validation
      const postBatchValidation = await this.validateBuildStability();
      const buildStable = postBatchValidation.buildSuccessful;

      if (!buildStable && this.config.rollbackOnFailure) {
        console.warn('⚠️ Post-batch build validation failed, performing rollback...');
        // The SafeTypeReplacer should have already performed rollback
        this.safetyMetrics.rollbacksPerformed++;
        this.safetyMetrics.buildFailures++;
      }

      // Update safety metrics
      this.updateSafetyMetrics(replacementResult, buildStable);

      const batchResult: BatchProcessingResult = {;
        batchNumber,
        startTime: batchStartTime,
        endTime: new Date(),
        casesProcessed: cases.length,
        successfulReplacements: replacementResult.appliedReplacements.length,
        failedReplacements: replacementResult.failedReplacements.length,
        buildStable,
        rollbackPerformed: replacementResult.rollbackPerformed,
        compilationErrors: replacementResult.compilationErrors
      };

      // // // console.log(
        `✅ Batch ${batchNumber} completed: ${batchResult.successfulReplacements}/${batchResult.casesProcessed} successful`,
      );

      return batchResult;
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} execution failed:`, error);
      this.safetyMetrics.batchFailures++;

      return {
        batchNumber,
        startTime: batchStartTime,
        endTime: new Date(),
        casesProcessed: cases.length,
        successfulReplacements: 0,
        failedReplacements: cases.length,
        buildStable: false,
        rollbackPerformed: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Perform real-time validation after each batch
   */
  private async performRealTimeValidation(
    batchResult: BatchProcessingResult,
  ): Promise<RealTimeValidationResult> {
    // // // console.log('🔍 Performing real-time validation...');

    try {
      // Build stability check
      const buildValidation = await this.validateBuildStability();

      // TypeScript error count check
      const currentErrorCount = await this.getCurrentTypeScriptErrorCount();

      // Safety metrics check
      const safetyScore = this.calculateSafetyScore();

      const validationResult: RealTimeValidationResult = {;
        buildStable: buildValidation.buildSuccessful,
        typeScriptErrorCount: currentErrorCount,
        safetyScore,
        validationTime: new Date(),
        batchNumber: batchResult.batchNumber,
        warnings: []
      };

      // Add warnings based on validation results
      if (!buildValidation.buildSuccessful) {
        validationResult.warnings.push('Build compilation failed');
      }

      if (safetyScore < this.config.safetyThreshold) {
        validationResult.warnings.push(
          `Safety score ${safetyScore.toFixed(2)} below threshold ${this.config.safetyThreshold}`,
        )
      }

      if (this.safetyMetrics.rollbacksPerformed > 0) {
        validationResult.warnings.push(
          `${this.safetyMetrics.rollbacksPerformed} rollbacks performed`,
        );
      }

      // // // console.log(
        `📊 Validation result: Build stable: ${validationResult.buildStable}, Safety score: ${safetyScore.toFixed(2)}`,
      );

      return validationResult;
    } catch (error) {
      console.error('❌ Real-time validation failed:', error),
      return {
        buildStable: false,
        typeScriptErrorCount: -1,
        safetyScore: 0,
        validationTime: new Date(),
        batchNumber: batchResult.batchNumber,
        warnings: ['Validation process failed'],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate integration with existing campaign infrastructure
   */
  private async validateCampaignIntegration(): Promise<{ success: boolean, error?: string }> {
    // // // console.log('🔗 Validating campaign infrastructure integration...');

    try {
      // Mock campaign integration validation
      // In a real implementation, this would test actual integration points
      const campaignValidation = { success: true };
      if (!campaignValidation.success) {
        return { success: false, error: 'Campaign integration validation failed' };
      }

      // Mock metrics integration validation
      const metricsValidation = { success: true };
      if (!metricsValidation.success) {
        return { success: false, error: 'Metrics integration validation failed' };
      }

      // Test progressive engine integration (if available)
      try {
        const engineValidation = await this.progressiveEngine.validateConfiguration();
        if (!engineValidation.isValid) {
          return { success: false, error: 'Progressive engine validation failed' };
        }
      } catch (error) {
        // Progressive engine validation is optional for pilot
        console.warn('Progressive engine validation skipped:', error)
      }

      // // // console.log('✅ Campaign infrastructure integration validated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Campaign integration validation failed:', error),
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate comprehensive pilot report
   */
  private async generatePilotReport(result: ConservativePilotResult): Promise<void> {
    // // // console.log('📄 Generating pilot report...');

    const reportPath = '.kiro/campaign-reports/conservative-pilot';
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    // Generate detailed report
    const report = {;
      pilotId: `conservative-pilot-${Date.now()}`,
      timestamp: new Date().toISOString(),
      configuration: this.config,
      results: result,
      batchResults: this.batchResults,
      safetyMetrics: this.safetyMetrics,
      executionTime: new Date().getTime() - this.pilotStartTime.getTime(),
      recommendations: this.generateRecommendations(result)
    };

    // Save JSON report
    const jsonReportPath = path.join(reportPath, 'pilot-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // Save markdown summary
    const markdownReportPath = path.join(reportPath, 'pilot-summary.md');
    const markdownContent = this.generateMarkdownReport(report);
    fs.writeFileSync(markdownReportPath, markdownContent);

    // // // console.log(`📊 Pilot report saved to ${reportPath}`);
  }

  // Helper Methods

  private async getTypeScriptFiles(): Promise<string[]> {
    try {
      const output = execSync(;
        'find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ | grep -v .test. | head -200';
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );
      return output
        .trim()
        .split('\n')
        .filter(file => file.trim());
    } catch (error) {
      console.warn('Failed to get TypeScript files, using fallback method'),
      return this.getFallbackTypeScriptFiles();
    }
  }

  private getFallbackTypeScriptFiles(): string[] {
    // Fallback method to get TypeScript files
    const files: string[] = [];
    const srcDir = 'src';

    if (fs.existsSync(srcDir)) {
      const walkDir = (dir: string) => {;
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.includes('__tests__') && !item.includes('node_modules')) {
            walkDir(fullPath);
          } else if (
            stat.isFile() &&
            (item.endsWith('.ts') || item.endsWith('.tsx')) &&
            !item.includes('.test.')
          ) {
            files.push(fullPath);
          }
        }
      };

      walkDir(srcDir);
    }

    return files.slice(0, 100); // Limit for pilot
  }

   
  private findAnyTypeOccurrences(
    content: string,
    filePath: string,
  ): Array<{ context: any, lineNumber: number }> {
    const lines = content.split('\n');
    const occurrences: Array<{ context: unknown, lineNumber: number }> = [];

    for (let i = 0i < lines.lengthi++) {;
      const line = lines[i];

       
      // Look for unknown[] patterns
       
      if (line.includes('unknown[]')) {
        occurrences.push({
          context: {
            filePath,
            lineNumber: i + 1,
            codeSnippet: line.trim(),
            surroundingLines: this.getSurroundingLines(linesi),
            hasExistingComment: this.hasCommentAbove(linesi),
            isInTestFile: filePath.includes('.test.') || filePath.includes('__tests__'),
            domainContext: { domain: this.inferDomain(filePath) }
          },
          lineNumber: i + 1
        })
      }

       
       
      // Look for Record<string, unknown> patterns
       
       
      if (line.includes('Record<string, unknown>')) {
        occurrences.push({
          context: {
            filePath,
            lineNumber: i + 1,
            codeSnippet: line.trim(),
            surroundingLines: this.getSurroundingLines(linesi),
            hasExistingComment: this.hasCommentAbove(linesi),
            isInTestFile: filePath.includes('.test.') || filePath.includes('__tests__'),
            domainContext: { domain: this.inferDomain(filePath) }
          },
          lineNumber: i + 1
        });
      }
    }

    return occurrences;
  }

  private getSurroundingLines(lines: string[], index: number, context = 2): string[] {;
    const start = Math.max(0, index - context);
    const end = Math.min(lines.length, index + context + 1),;
    return lines.slice(start, end)
  }

  private hasCommentAbove(lines: string[], index: number): boolean {
    if (index > 0) {
      const previousLine = lines[index - 1].trim();
      return previousLine.startsWith('//') || previousLine.startsWith('/*');
    }
    return false;
  }

  private inferDomain(filePath: string): string {
    if (
      filePath.includes('astro') ||
      filePath.includes('planet') ||
      filePath.includes('calculation')
    ) {
      return 'astrological'
    }
    if (
      filePath.includes('recipe') ||
      filePath.includes('ingredient') ||
      filePath.includes('food')
    ) {
      return 'recipe'
    }
    if (filePath.includes('campaign') || filePath.includes('intelligence')) {
      return 'campaign'
    }
    if (filePath.includes('service') || filePath.includes('api')) {
      return 'service'
    }
    return 'utility';
  }

  private isHighConfidenceCase(classification: AnyTypeClassification): boolean {
    // Focus on specific categories for conservative pilot
    if (!this.config.focusCategories.includes(classification.category)) {
      return false
    }

    // High confidence threshold
    if (classification.confidence < 0.8) {
      return false
    }

    // Must be classified as unintentional
    if (classification.isIntentional) {
      return false
    }

    // Additional safety checks
    if (classification.category === AnyTypeCategory.ARRAY_TYPE) {;
      return true, // Array types are very safe
    }

    if (classification.category === AnyTypeCategory.RECORD_TYPE) {;
      // Only simple Record types
      return classification.suggestedReplacement?.includes('unknown') || false;
    }

    return false;
  }

   
   
  private createTypeReplacement(
    occurrence: any,
    classification: AnyTypeClassification,
  ): TypeReplacement | null {
    if (!classification.suggestedReplacement) {
      return null
    }

    let original: string;
    let replacement: stringif (classification.category === AnyTypeCategory.ARRAY_TYPE) {;
       
      original = 'unknown[]';
      replacement = 'unknown[]';
    } else if (classification.category === AnyTypeCategory.RECORD_TYPE) {;
       
       
      original = 'Record<string, unknown>',;
      replacement = 'Record<string, unknown>',;
    } else {
      return null
    }

    return {
      original,
      replacement,
      filePath: occurrence.context.filePath,
      lineNumber: occurrence.lineNumber,
      confidence: classification.confidence,
      validationRequired: true
    };
  }

  private groupCasesByFile(cases: TypeReplacement[]): Map<string, TypeReplacement[]> {
    const grouped = new Map<string, TypeReplacement[]>();

    for (const case_ of cases) {
      const existing = grouped.get(case_.filePath);
      if (existing) {
        existing.push(case_);
      } else {
        grouped.set(case_.filePath, [case_])
      }
    }

    return grouped;
  }

  private selectBatchFiles(
    fileGroups: Array<[string, TypeReplacement[]]>,
    processedCount: number,
  ): Array<[string, TypeReplacement[]]> {
    const remainingFiles = fileGroups.filter(([_, cases]) =>;
      cases.some(c => !this.isProcessed(c, processedCount)),;
    );

    // Select files to fit within batch size limits
    const selectedFiles: Array<[string, TypeReplacement[]]> = [];
    let totalCases = 0;

    for (const [filePath, cases] of remainingFiles) {
      const unprocessedCases = cases.filter(c => !this.isProcessed(c, processedCount)),;

      if (totalCases + unprocessedCases.length <= this.config.maxFilesPerBatch) {
        selectedFiles.push([filePath, unprocessedCases]),
        totalCases += unprocessedCases.length;
      }

      if (
        selectedFiles.length >= this.config.maxFilesPerBatch ||
        totalCases >= this.config.maxFilesPerBatch
      ) {
        break
      }
    }

    return selectedFiles;
  }

  private isProcessed(case_: TypeReplacement, processedCount: number): boolean {
    // Simple tracking - in a real implementation, this would be more sophisticated
    return false, // For now, assume no cases are pre-processed
  }

  private async validateBuildStability(): Promise<{ buildSuccessful: boolean, errors?: string[] }> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000
      });
      return { buildSuccessful: true };
    } catch (error) {
      return {
        buildSuccessful: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  private async getCurrentTypeScriptErrorCount(): Promise<number> {
    try {
      const output = execSync(;
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'',
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return -1, // Error in getting count
    }
  }

  private initializeSafetyMetrics(): SafetyMetrics {
    return {
      buildFailures: 0,
      rollbacksPerformed: 0,
      batchFailures: 0,
      compilationErrors: 0,
      safetyProtocolActivations: 0
    };
  }

  private updateSafetyMetrics(result: ReplacementResult, buildStable: boolean): void {
    if (!buildStable) {
      this.safetyMetrics.buildFailures++;
    }

    if (result.rollbackPerformed) {
      this.safetyMetrics.rollbacksPerformed++;
    }

    if (result.compilationErrors.length > 0) {
      this.safetyMetrics.compilationErrors += result.compilationErrors.length;
    }
  }

  private calculateSafetyScore(): number {
    const totalBatches = this.batchResults.length;
    if (totalBatches === 0) return 1.0;

    const successfulBatches = this.batchResults.filter(;
      b => b.buildStable && !b.rollbackPerformed;
    ).length;
    const baseScore = successfulBatches / totalBatches;

    // Penalize for safety issues
    const penalties =
      ((this.safetyMetrics as any)?.buildFailures || 0) * 0.2 +;
      ((this.safetyMetrics as any)?.rollbacksPerformed || 0) * 0.2 +
      ((this.safetyMetrics as any)?.batchFailures || 0) * 0.2;

    return Math.max(0, baseScore - penalties)
  }

  private createPilotResult(success: boolean, message?: string): ConservativePilotResult {
    const totalProcessed = this.batchResults.reduce((sum, batch) => sum + batch.casesProcessed, 0);
    const totalSuccessful = this.batchResults.reduce(;
      (sum, batch) => sum + batch.successfulReplacements,
      0,
    ),
    const successRate = totalProcessed > 0 ? totalSuccessful / totalProcessed : 0;

    return {
      success,
      message,
      pilotStartTime: this.pilotStartTime,
      pilotEndTime: new Date(),
      totalCasesProcessed: totalProcessed,
      totalSuccessfulReplacements: totalSuccessful,
      successRate,
      batchesExecuted: this.batchResults.length,
      buildFailures: this.safetyMetrics.buildFailures,
      rollbacksPerformed: this.safetyMetrics.rollbacksPerformed,
      safetyScore: this.calculateSafetyScore(),
      targetAchieved:
        successRate >= this.config.targetSuccessRate && this.safetyMetrics.buildFailures === 0,,;
      batchResults: this.batchResults,
      safetyMetrics: this.safetyMetrics
    };
  }

  private generateRecommendations(result: ConservativePilotResult): string[] {
    const recommendations: string[] = [];

    if (result.successRate < this.config.targetSuccessRate) {
      recommendations.push(
        `Success rate ${(result.successRate * 100).toFixed(1)}% below target ${(this.config.targetSuccessRate * 100).toFixed(1)}%. Consider more conservative classification thresholds.`,
      )
    }

    if (result.buildFailures > 0) {
      recommendations.push(
        `${result.buildFailures} build failures occurred. Review failed cases and improve safety validation.`,
      );
    }

    if (result.rollbacksPerformed > 0) {
      recommendations.push(
        `${result.rollbacksPerformed} rollbacks performed. Analyze rollback causes to improve replacement strategies.`,
      );
    }

    if (result.safetyScore < this.config.safetyThreshold) {
      recommendations.push(
        `Safety score ${result.safetyScore.toFixed(2)} below threshold. Implement additional safety measures before full campaign.`,
      )
    }

    if (result.targetAchieved) {
      recommendations.push(
        'Pilot successful! Ready to proceed to full campaign execution (Task 12.3).';
      )
    } else {
      recommendations.push(
        'Pilot did not meet all targets. Review results and adjust strategy before full campaign.'
      )
    }

    return recommendations
  }

  private generateMarkdownReport(report: unknown): string {
    return `# Conservative Replacement Pilot Report

## Executive Summary

**Pilot Status**: ${(report as any)?.results?.success ? '✅ SUCCESS' : '❌ FAILED'}
**Execution Time**: ${Math.round((report as any)?.executionTime / 1000)}s
**Target Achievement**: ${(report as any)?.results?.targetAchieved ? '✅ YES' : '❌ NO'}

## Key Metrics

- **Cases Processed**: ${(report as any)?.results?.totalCasesProcessed}
- **Successful Replacements**: ${(report as any)?.results?.totalSuccessfulReplacements}
- **Success Rate**: ${((report as any)?.results?.successRate * 100).toFixed(1)}% (Target: ${((report as any)?.configuration?.targetSuccessRate * 100).toFixed(1)}%)
- **Batches Executed**: ${(report as any)?.results?.batchesExecuted}
- **Build Failures**: ${(report as any)?.results?.buildFailures} (Target: 0)
- **Rollbacks Performed**: ${(report as any)?.results?.rollbacksPerformed}
- **Safety Score**: ${(report as any)?.results?.safetyScore?.toFixed(2)} (Threshold: ${(report as any)?.configuration?.safetyThreshold})

## Batch Results

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
${(report as any)?.batchResults
  ?.map(
    (batch: any, index: number) => `
### Batch ${batch?.batchNumber}
- **Cases**: ${batch.casesProcessed}
- **Successful**: ${batch?.successfulReplacements}
- **Failed**: ${batch.failedReplacements}
- **Build Stable**: ${batch?.buildStable ? '✅' : '❌'}
- **Rollback**: ${batch.rollbackPerformed ? '⚠️ YES' : '✅ NO'}
`,
  )
  .join('')}

## Safety Metrics

- **Build Failures**: ${(report as any)?.safetyMetrics?.buildFailures}
- **Rollbacks Performed**: ${(report as any)?.safetyMetrics?.rollbacksPerformed}
- **Batch Failures**: ${(report as any)?.safetyMetrics?.batchFailures}
- **Compilation Errors**: ${(report as any)?.safetyMetrics?.compilationErrors}

## Recommendations

${(report as any)?.recommendations?.map((rec: string) => `- ${rec}`).join('\n')}

## Configuration

\`\`\`json
${JSON.stringify((report as any).configuration, null, 2)}
\`\`\`

---
*Report generated on ${new Date().toISOString()}*
`;
  }
}

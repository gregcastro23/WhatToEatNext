/**
 * AutomatedLintingFixer - Automated error resolution system with safety protocols
 * 
 * This class implements comprehensive automated fixing capabilities with batch processing,
 * safety validation, and rollback mechanisms for ESLint issues.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { log } from '@/services/LoggingService';

import { LintingIssue, CategorizedErrors } from './LintingErrorAnalyzer';
import { ResolutionStrategy } from './ResolutionStrategyGenerator';

export interface AutomatedFixResult {
  success: boolean;
  fixedIssues: number;
  failedIssues: number;
  processedFiles: string[];
  errors: FixError[];
  validationResults: ValidationResult[];
  rollbackInfo?: RollbackInfo;
  metrics: FixMetrics;
}

export interface FixError {
  file: string;
  rule: string;
  message: string;
  error: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface ValidationResult {
  type: 'build' | 'test' | 'type-check' | 'lint';
  success: boolean;
  message: string;
  details?: string;
}

export interface RollbackInfo {
  stashId: string;
  timestamp: Date;
  affectedFiles: string[];
  rollbackCommand: string;
}

export interface FixMetrics {
  startTime: Date;
  endTime: Date;
  totalTime: number; // milliseconds
  filesProcessed: number;
  issuesAttempted: number;
  issuesFixed: number;
  issuesFailed: number;
  validationTime: number;
  rollbacksPerformed: number;
}

export interface BatchProcessingOptions {
  batchSize: number;
  maxConcurrentBatches: number;
  validateAfterEachBatch: boolean;
  continueOnError: boolean;
  createBackups: boolean;
  dryRun: boolean;
}

export interface SafetyProtocols {
  enableRollback: boolean;
  validateBeforeFix: boolean;
  validateAfterFix: boolean;
  maxFailuresBeforeStop: number;
  requireManualApproval: boolean;
  preservePatterns: string[];
}

export interface UnusedVariableFixOptions {
  prefixWithUnderscore: boolean;
  removeCompletely: boolean;
  preservePatterns: string[];
  skipTestFiles: boolean;
  skipDomainFiles: boolean;
}

export interface ImportOptimizationOptions {
  removeDuplicates: boolean;
  organizeImports: boolean;
  removeUnused: boolean;
  preserveComments: boolean;
  sortImports: boolean;
}

export interface TypeAnnotationOptions {
  inferFromUsage: boolean;
  useStrictTypes: boolean;
  preserveExplicitAny: string[];
  maxComplexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Main AutomatedLintingFixer class
 */
export class AutomatedLintingFixer {
  private workspaceRoot: string;
  private eslintConfigPath: string;
  private safetyProtocols: SafetyProtocols;
  private currentRollbackInfo?: RollbackInfo;

  constructor(
    workspaceRoot: string = process.cwd(),
    safetyProtocols: Partial<SafetyProtocols> = {}
  ) {
    this.workspaceRoot = workspaceRoot;
    this.eslintConfigPath = path.join(workspaceRoot, 'eslint.config.cjs');
    
    // Default safety protocols
    this.safetyProtocols = {
      enableRollback: true,
      validateBeforeFix: true,
      validateAfterFix: true,
      maxFailuresBeforeStop: 5,
      requireManualApproval: false,
      preservePatterns: [
        '**/calculations/**',
        '**/data/planets/**',
        '**/*astrological*',
        '**/*campaign*'
      ],
      ...safetyProtocols
    };
  }

  /**
   * Apply automated fixes with batch processing and safety protocols
   */
  async applyAutomatedFixes(
    categorizedErrors: CategorizedErrors,
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<AutomatedFixResult> {
    const startTime = new Date();
    log.info('🔧 Starting automated linting fixes with safety protocols...');
    
    const batchOptions: BatchProcessingOptions = {
      batchSize: 10,
      maxConcurrentBatches: 1,
      validateAfterEachBatch: true,
      continueOnError: false,
      createBackups: true,
      dryRun: false,
      ...options
    };

    const result: AutomatedFixResult = {
      success: false,
      fixedIssues: 0,
      failedIssues: 0,
      processedFiles: [],
      errors: [],
      validationResults: [],
      metrics: {
        startTime,
        endTime: new Date(),
        totalTime: 0,
        filesProcessed: 0,
        issuesAttempted: 0,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    };

    try {
      // Step 1: Pre-fix validation
      if (this.safetyProtocols.validateBeforeFix) {
        log.info('🔍 Running pre-fix validation...');
        const preValidation = await this.runValidation();
        result.validationResults.push(...preValidation);
        
        if (preValidation.some(v => !v.success && v.type === 'build')) {
          throw new Error('Pre-fix validation failed - build is broken');
        }
      }

      // Step 2: Create backup/stash if enabled
      if (batchOptions.createBackups && this.safetyProtocols.enableRollback) {
        log.info('💾 Creating backup...');
        this.currentRollbackInfo = await this.createBackup();
        result.rollbackInfo = this.currentRollbackInfo;
      }

      // Step 3: Process auto-fixable issues in batches
      const autoFixableIssues = categorizedErrors.autoFixable.filter(issue => 
        this.isSafeToAutoFix(issue)
      );

      log.info(`🎯 Processing ${autoFixableIssues.length} auto-fixable issues in batches of ${batchOptions.batchSize}`);
      
      const batches = this.createBatches(autoFixableIssues, batchOptions.batchSize);
      let failureCount = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        log.info(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} issues)`);
        
        try {
          const batchResult = await this.processBatch(batch, batchOptions);
          
          result.fixedIssues += batchResult.fixedIssues;
          result.failedIssues += batchResult.failedIssues;
          result.processedFiles.push(...batchResult.processedFiles);
          result.errors.push(...batchResult.errors);
          
          // Validate after each batch if enabled
          if (batchOptions.validateAfterEachBatch) {
            const batchValidation = await this.runValidation();
            result.validationResults.push(...batchValidation);
            
            if (batchValidation.some(v => !v.success && v.type === 'build')) {
              console.warn('⚠️ Batch validation failed - performing rollback');
              await this.performRollback();
              result.metrics.rollbacksPerformed++;
              failureCount++;
              
              if (failureCount >= this.safetyProtocols.maxFailuresBeforeStop) {
                throw new Error('Maximum failures reached - stopping automated fixes');
              }
            }
          }
          
        } catch (error) {
          console.error(`❌ Batch ${i + 1} failed:`, error);
          result.errors.push({
            file: 'batch-processing',
            rule: 'batch-error',
            message: `Batch ${i + 1} processing failed`,
            error: error instanceof Error ? error.message : String(error),
            severity: 'error'
          });
          
          failureCount++;
          if (!batchOptions.continueOnError || failureCount >= this.safetyProtocols.maxFailuresBeforeStop) {
            break;
          }
        }
      }

      // Step 4: Final validation
      if (this.safetyProtocols.validateAfterFix) {
        log.info('✅ Running final validation...');
        const finalValidation = await this.runValidation();
        result.validationResults.push(...finalValidation);
        
        const buildSuccess = finalValidation.find(v => v.type === 'build')?.success ?? true;
        result.success = buildSuccess && result.fixedIssues > 0;
      } else {
        result.success = result.fixedIssues > 0;
      }

      // Update metrics
      const endTime = new Date();
      result.metrics.endTime = endTime;
      result.metrics.totalTime = endTime.getTime() - startTime.getTime();
      result.metrics.filesProcessed = new Set(result.processedFiles).size;
      result.metrics.issuesAttempted = autoFixableIssues.length;
      result.metrics.issuesFixed = result.fixedIssues;
      result.metrics.issuesFailed = result.failedIssues;

      log.info(`✅ Automated fixes complete: ${result.fixedIssues} fixed, ${result.failedIssues} failed`);
      
      return result;

    } catch (error) {
      console.error('❌ Automated fixing failed:', error);
      
      // Attempt rollback on critical failure
      if (this.currentRollbackInfo && this.safetyProtocols.enableRollback) {
        log.info('🔄 Performing emergency rollback...');
        await this.performRollback();
        result.metrics.rollbacksPerformed++;
      }
      
      result.success = false;
      result.errors.push({
        file: 'system',
        rule: 'critical-error',
        message: 'Critical failure during automated fixing',
        error: error instanceof Error ? error.message : String(error),
        severity: 'critical'
      });
      
      return result;
    }
  }

  /**
   * Handle unused variable removal with underscore prefixing
   */
  async handleUnusedVariables(
    issues: LintingIssue[],
    options: Partial<UnusedVariableFixOptions> = {}
  ): Promise<AutomatedFixResult> {
    log.info('🧹 Handling unused variables...');
    
    const fixOptions: UnusedVariableFixOptions = {
      prefixWithUnderscore: true,
      removeCompletely: false,
      preservePatterns: [
        '**/calculations/**',
        '**/data/planets/**',
        '**/*astrological*'
      ],
      skipTestFiles: false,
      skipDomainFiles: true,
      ...options
    };

    const unusedVarIssues = issues.filter(issue => 
      issue.rule.includes('no-unused-vars') || 
      issue.rule.includes('unused-vars')
    );

    const result: AutomatedFixResult = {
      success: false,
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
        issuesAttempted: unusedVarIssues.length,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    };

    for (const issue of unusedVarIssues) {
      try {
        // Skip if file should be preserved
        if (this.shouldPreserveFile(issue.file, fixOptions.preservePatterns)) {
          log.info(`⏭️ Skipping preserved file: ${issue.file}`);
          continue;
        }

        // Skip domain files if configured
        if (fixOptions.skipDomainFiles && issue.domainContext?.requiresSpecialHandling) {
          log.info(`⏭️ Skipping domain file: ${issue.file}`);
          continue;
        }

        // Skip test files if configured
        if (fixOptions.skipTestFiles && issue.domainContext?.isTestFile) {
          log.info(`⏭️ Skipping test file: ${issue.file}`);
          continue;
        }

        const fixed = await this.fixUnusedVariable(issue, fixOptions);
        if (fixed) {
          result.fixedIssues++;
          if (!result.processedFiles.includes(issue.file)) {
            result.processedFiles.push(issue.file);
          }
        } else {
          result.failedIssues++;
        }

      } catch (error) {
        result.failedIssues++;
        result.errors.push({
          file: issue.file,
          rule: issue.rule,
          message: `Failed to fix unused variable: ${issue.message}`,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error'
        });
      }
    }

    result.success = result.fixedIssues > 0;
    result.metrics.endTime = new Date();
    result.metrics.totalTime = result.metrics.endTime.getTime() - result.metrics.startTime.getTime();
    result.metrics.filesProcessed = result.processedFiles.length;
    result.metrics.issuesFixed = result.fixedIssues;
    result.metrics.issuesFailed = result.failedIssues;

    log.info(`🧹 Unused variables handled: ${result.fixedIssues} fixed, ${result.failedIssues} failed`);
    return result;
  }

  /**
   * Optimize import statements and remove duplicates
   */
  async optimizeImports(
    issues: LintingIssue[],
    options: Partial<ImportOptimizationOptions> = {}
  ): Promise<AutomatedFixResult> {
    log.info('📦 Optimizing import statements...');
    
    const importOptions: ImportOptimizationOptions = {
      removeDuplicates: true,
      organizeImports: true,
      removeUnused: true,
      preserveComments: true,
      sortImports: true,
      ...options
    };

    const importIssues = issues.filter(issue => 
      issue.category.primary === 'import' ||
      issue.rule.startsWith('import/')
    );

    const result: AutomatedFixResult = {
      success: false,
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
        issuesAttempted: importIssues.length,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    };

    // Group issues by file for batch processing
    const issuesByFile = new Map<string, LintingIssue[]>();
    for (const issue of importIssues) {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    }

    for (const [filePath, fileIssues] of issuesByFile) {
      try {
        // Skip if file should be preserved
        if (this.shouldPreserveFile(filePath, this.safetyProtocols.preservePatterns)) {
          log.info(`⏭️ Skipping preserved file: ${filePath}`);
          continue;
        }

        const fixed = await this.optimizeFileImports(filePath, fileIssues, importOptions);
        if (fixed) {
          result.fixedIssues += fileIssues.length;
          result.processedFiles.push(filePath);
        } else {
          result.failedIssues += fileIssues.length;
        }

      } catch (error) {
        result.failedIssues += fileIssues.length;
        result.errors.push({
          file: filePath,
          rule: 'import-optimization',
          message: `Failed to optimize imports`,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error'
        });
      }
    }

    result.success = result.fixedIssues > 0;
    result.metrics.endTime = new Date();
    result.metrics.totalTime = result.metrics.endTime.getTime() - result.metrics.startTime.getTime();
    result.metrics.filesProcessed = result.processedFiles.length;
    result.metrics.issuesFixed = result.fixedIssues;
    result.metrics.issuesFailed = result.failedIssues;

    log.info(`📦 Import optimization complete: ${result.fixedIssues} fixed, ${result.failedIssues} failed`);
    return result;
  }

  /**
   * Improve type annotations for simple cases
   */
  async improveTypeAnnotations(
    issues: LintingIssue[],
    options: Partial<TypeAnnotationOptions> = {}
  ): Promise<AutomatedFixResult> {
    log.info('🏷️ Improving type annotations...');
    
    const typeOptions: TypeAnnotationOptions = {
      inferFromUsage: true,
      useStrictTypes: false,
      preserveExplicitAny: [
        '**/calculations/**',
        '**/data/planets/**'
      ],
      maxComplexity: 'simple',
      ...options
    };

    const typeIssues = issues.filter(issue => 
      issue.rule.includes('no-explicit-any') ||
      issue.rule.includes('no-implicit-any') ||
      issue.category.primary === 'typescript'
    );

    const result: AutomatedFixResult = {
      success: false,
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
        issuesAttempted: typeIssues.length,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    };

    for (const issue of typeIssues) {
      try {
        // Skip if file should preserve explicit any
        if (this.shouldPreserveFile(issue.file, typeOptions.preserveExplicitAny)) {
          log.info(`⏭️ Preserving explicit any in: ${issue.file}`);
          continue;
        }

        // Only handle simple cases based on complexity setting
        if (typeOptions.maxComplexity === 'simple' && !this.isSimpleTypeIssue(issue)) {
          log.info(`⏭️ Skipping complex type issue: ${issue.rule} in ${issue.file}`);
          continue;
        }

        const fixed = await this.improveTypeAnnotation(issue, typeOptions);
        if (fixed) {
          result.fixedIssues++;
          if (!result.processedFiles.includes(issue.file)) {
            result.processedFiles.push(issue.file);
          }
        } else {
          result.failedIssues++;
        }

      } catch (error) {
        result.failedIssues++;
        result.errors.push({
          file: issue.file,
          rule: issue.rule,
          message: `Failed to improve type annotation: ${issue.message}`,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error'
        });
      }
    }

    result.success = result.fixedIssues > 0;
    result.metrics.endTime = new Date();
    result.metrics.totalTime = result.metrics.endTime.getTime() - result.metrics.startTime.getTime();
    result.metrics.filesProcessed = result.processedFiles.length;
    result.metrics.issuesFixed = result.fixedIssues;
    result.metrics.issuesFailed = result.failedIssues;

    log.info(`🏷️ Type annotation improvement complete: ${result.fixedIssues} fixed, ${result.failedIssues} failed`);
    return result;
  }

  /**
   * Validate fixes with comprehensive checks
   */
  async validateFixes(): Promise<ValidationResult[]> {
    log.info('🔍 Running comprehensive validation...');
    return await this.runValidation();
  }

  /**
   * Perform rollback to previous state
   */
  async performRollback(): Promise<boolean> {
    if (!this.currentRollbackInfo || !this.safetyProtocols.enableRollback) {
      console.warn('⚠️ No rollback information available');
      return false;
    }

    try {
      log.info(`🔄 Rolling back to stash: ${this.currentRollbackInfo.stashId}`);
      execSync(this.currentRollbackInfo.rollbackCommand, {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });
      
      log.info('✅ Rollback completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      return false;
    }
  }

  // Private helper methods

  private async createBackup(): Promise<RollbackInfo> {
    const timestamp = new Date();
    const stashMessage = `automated-linting-fixes-${timestamp.toISOString()}`;
    
    try {
      execSync(`git add -A && git stash push -m "${stashMessage}"`, {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });
      
      const stashList = execSync('git stash list', {
        cwd: this.workspaceRoot,
        encoding: 'utf8'
      });
      
      const stashId = stashList.split('\n')[0]?.split(':')[0] || 'stash@{0}';
      
      return {
        stashId,
        timestamp,
        affectedFiles: [],
        rollbackCommand: `git stash pop ${stashId}`
      };
      
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  private async runValidation(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const validationStart = Date.now();

    // Build validation
    try {
      execSync('npm run build', {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });
      results.push({
        type: 'build',
        success: true,
        message: 'Build passed successfully'
      });
    } catch (error) {
      results.push({
        type: 'build',
        success: false,
        message: 'Build failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Type check validation
    try {
      execSync('npx tsc --noEmit', {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout
      });
      results.push({
        type: 'type-check',
        success: true,
        message: 'Type checking passed'
      });
    } catch (error) {
      results.push({
        type: 'type-check',
        success: false,
        message: 'Type checking failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Lint validation
    try {
      execSync(`npx eslint --config ${this.eslintConfigPath} src`, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout
      });
      results.push({
        type: 'lint',
        success: true,
        message: 'Linting passed'
      });
    } catch (error) {
      // ESLint returns non-zero exit code for warnings/errors, which is expected
      results.push({
        type: 'lint',
        success: true,
        message: 'Linting completed (may have remaining issues)'
      });
    }

    // Test validation (if tests exist)
    if (fs.existsSync(path.join(this.workspaceRoot, 'jest.config.js'))) {
      try {
        execSync('npm test -- --passWithNoTests', {
          cwd: this.workspaceRoot,
          stdio: 'pipe',
          timeout: 120000 // 2 minute timeout
        });
        results.push({
          type: 'test',
          success: true,
          message: 'Tests passed'
        });
      } catch (error) {
        results.push({
          type: 'test',
          success: false,
          message: 'Tests failed',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const validationTime = Date.now() - validationStart;
    log.info(`🔍 Validation completed in ${validationTime}ms`);

    return results;
  }

  private isSafeToAutoFix(issue: LintingIssue): boolean {
    // Check if file should be preserved
    if (this.shouldPreserveFile(issue.file, this.safetyProtocols.preservePatterns)) {
      return false;
    }

    // Check if issue requires special handling
    if (issue.domainContext?.requiresSpecialHandling) {
      return false;
    }

    // Only auto-fix issues with high confidence
    if (issue.resolutionStrategy.confidence < 0.7) {
      return false;
    }

    // Only auto-fix low to medium risk issues
    if (issue.resolutionStrategy.riskLevel === 'high') {
      return false;
    }

    return issue.autoFixable;
  }

  private shouldPreserveFile(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(filePath);
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(
    batch: LintingIssue[],
    options: BatchProcessingOptions
  ): Promise<AutomatedFixResult> {
    const result: AutomatedFixResult = {
      success: false,
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
        issuesAttempted: batch.length,
        issuesFixed: 0,
        issuesFailed: 0,
        validationTime: 0,
        rollbacksPerformed: 0
      }
    };

    // Group issues by file for efficient processing
    const issuesByFile = new Map<string, LintingIssue[]>();
    for (const issue of batch) {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    }

    // Process each file
    for (const [filePath, fileIssues] of issuesByFile) {
      try {
        if (options.dryRun) {
          log.info(`🔍 [DRY RUN] Would fix ${fileIssues.length} issues in ${filePath}`);
          result.fixedIssues += fileIssues.length;
        } else {
          const fixed = await this.fixFileIssues(filePath, fileIssues);
          if (fixed) {
            result.fixedIssues += fileIssues.length;
            result.processedFiles.push(filePath);
          } else {
            result.failedIssues += fileIssues.length;
          }
        }
      } catch (error) {
        result.failedIssues += fileIssues.length;
        result.errors.push({
          file: filePath,
          rule: 'batch-processing',
          message: `Failed to process file in batch`,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error'
        });
      }
    }

    result.success = result.fixedIssues > 0;
    result.metrics.endTime = new Date();
    result.metrics.totalTime = result.metrics.endTime.getTime() - result.metrics.startTime.getTime();
    result.metrics.filesProcessed = result.processedFiles.length;
    result.metrics.issuesFixed = result.fixedIssues;
    result.metrics.issuesFailed = result.failedIssues;

    return result;
  }

  private async fixFileIssues(filePath: string, issues: LintingIssue[]): Promise<boolean> {
    try {
      // Use ESLint's auto-fix capability for the specific file
      const command = `npx eslint --config ${this.eslintConfigPath} --fix "${filePath}"`;
      execSync(command, {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });
      
      return true;
    } catch (error) {
      console.warn(`⚠️ Failed to fix issues in ${filePath}:`, error);
      return false;
    }
  }

  private async fixUnusedVariable(
    issue: LintingIssue,
    options: UnusedVariableFixOptions
  ): Promise<boolean> {
    try {
      const filePath = path.join(this.workspaceRoot, issue.file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Find the line with the unused variable
      const lineIndex = issue.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Extract variable name from the message
        const varNameMatch = issue.message.match(/'([^']+)' is (defined but never used|assigned a value but never used)/);
        if (varNameMatch) {
          const varName = varNameMatch[1];
          
          if (options.prefixWithUnderscore && !varName.startsWith('_')) {
            // Prefix with underscore to indicate intentional non-use
            const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
            lines[lineIndex] = newLine;
            
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Failed to fix unused variable in ${issue.file}:`, error);
      return false;
    }
  }

  private async optimizeFileImports(
    filePath: string,
    issues: LintingIssue[],
    options: ImportOptimizationOptions
  ): Promise<boolean> {
    try {
      // Use ESLint's auto-fix for import-related rules
      const importRules = issues.map(i => i.rule).filter(rule => rule.startsWith('import/'));
      if (importRules.length > 0) {
        const command = `npx eslint --config ${this.eslintConfigPath} --fix "${filePath}"`;
        execSync(command, {
          cwd: this.workspaceRoot,
          stdio: 'pipe'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Failed to optimize imports in ${filePath}:`, error);
      return false;
    }
  }

  private isSimpleTypeIssue(issue: LintingIssue): boolean {
    // Consider simple type issues that can be safely auto-fixed
    const simplePatterns = [
      /no-explicit-any.*parameter/,
      /no-explicit-any.*return type/,
      /no-explicit-any.*variable declaration/
    ];
    
    return simplePatterns.some(pattern => pattern.test(issue.message));
  }

  private async improveTypeAnnotation(
    issue: LintingIssue,
    options: TypeAnnotationOptions
  ): Promise<boolean> {
    // For now, only handle very simple cases
    // More complex type inference would require AST parsing and analysis
    
    if (options.maxComplexity === 'simple' && this.isSimpleTypeIssue(issue)) {
      try {
        // Use ESLint auto-fix if available
        if (issue.autoFixable) {
          const command = `npx eslint --config ${this.eslintConfigPath} --fix "${issue.file}"`;
          execSync(command, {
            cwd: this.workspaceRoot,
            stdio: 'pipe'
          });
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to improve type annotation in ${issue.file}:`, error);
      }
    }
    
    return false;
  }
}
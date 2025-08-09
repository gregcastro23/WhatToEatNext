/**
 * ConsoleStatementRemovalSystem.ts
 *
 * Phase 2.3 Implementation - Console Statement Removal System
 * Integration for scripts/lint-fixes/fix-console-statements-only.js
 *
 * Features:
 * - Dry-run validation before console statement removal
 * - Selective removal system preserving debug-critical statements
 * - Integration with existing console statement removal script
 * - Safety protocols with git stash management
 * - Build validation after removal
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ConsoleRemovalConfig {
  maxFiles: number;
  dryRun: boolean;
  autoFix: boolean;
  preserveDebugCritical: boolean;
  enableGitStash: boolean;
  buildValidation: boolean;
  batchSize: number;
  selectiveRemoval: boolean;
}

export interface ConsoleRemovalResult {
  success: boolean;
  filesProcessed: number;
  consoleStatementsRemoved: number;
  consoleStatementsPreserved: number;
  buildTime: number;
  errors: string[];
  warnings: string[];
  preservedFiles: string[];
}

export interface BatchRemovalResult {
  totalBatches: number;
  successfulBatches: number;
  failedBatches: number;
  totalFilesProcessed: number;
  totalConsoleStatementsProcessed: number;
  averageBuildTime: number;
  errors: string[];
  preservedCriticalStatements: number;
}

export interface ConsoleStatement {
  file: string;
  line: number;
  column: number;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  content: string;
  context: string;
  isCritical: boolean;
  shouldPreserve: boolean;
}

export class ConsoleStatementRemovalSystem {
  private scriptPath: string;
  private metricsFile: string;
  private config: ConsoleRemovalConfig;

  constructor(config: Partial<ConsoleRemovalConfig> = {}) {
    this.scriptPath = path.join(process.cwd(), 'scripts/lint-fixes/fix-console-statements-only.js');
    this.metricsFile = path.join(process.cwd(), '.console-removal-metrics.json');

    this.config = {
      maxFiles: 10,
      dryRun: true,
      autoFix: false,
      preserveDebugCritical: true,
      enableGitStash: true,
      buildValidation: true,
      batchSize: 8,
      selectiveRemoval: true,
      ...config,
    };
  }

  /**
   * Execute console statement removal with safety protocols
   */
  async executeRemoval(): Promise<ConsoleRemovalResult> {
    console.log('🔇 Starting Console Statement Removal System...');

    try {
      // Pre-execution validation
      await this.validatePreConditions();

      // Analyze console statements before removal
      const consoleAnalysis = await this.analyzeConsoleStatements();

      // Create safety checkpoint if enabled
      let stashId: string | null = null;
      if (this.config.enableGitStash) {
        stashId = await this.createSafetyStash();
      }

      // Execute the removal
      const result = await this.executeScript(consoleAnalysis);

      // Post-execution validation
      if (this.config.buildValidation && result.success) {
        const buildValid = await this.validateBuild();
        if (!buildValid) {
          result.success = false;
          result.errors.push('Build validation failed after console removal');

          // Rollback if build fails
          if (stashId) {
            await this.rollbackFromStash(stashId);
          }
        }
      }

      // Save metrics
      await this.saveMetrics(result);

      return result;
    } catch (error) {
      console.error('❌ Console statement removal failed:', error);
      throw error;
    }
  }

  /**
   * Execute batch processing for large-scale console removal
   */
  async executeBatchRemoval(totalFiles?: number): Promise<BatchRemovalResult> {
    console.log('⚡ Starting batch processing for console statement removal...');

    const batchResult: BatchRemovalResult = {
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      totalFilesProcessed: 0,
      totalConsoleStatementsProcessed: 0,
      averageBuildTime: 0,
      errors: [],
      preservedCriticalStatements: 0,
    };

    try {
      // Determine number of batches
      const estimatedFiles = totalFiles || (await this.estimateFilesWithConsoleStatements());
      const batchCount = Math.ceil(estimatedFiles / this.config.batchSize);
      batchResult.totalBatches = batchCount;

      console.log(
        `📊 Processing ${estimatedFiles} files in ${batchCount} batches of ${this.config.batchSize} files each`,
      );

      const buildTimes: number[] = [];

      // Process each batch
      for (let i = 0; i < batchCount; i++) {
        console.log(`\n🔄 Processing batch ${i + 1}/${batchCount}...`);

        try {
          const batchConfig = {
            ...this.config,
            maxFiles: this.config.batchSize,
          };

          const batchSystem = new ConsoleStatementRemovalSystem(batchConfig);
          const result = await batchSystem.executeRemoval();

          if (result.success) {
            batchResult.successfulBatches++;
            batchResult.totalFilesProcessed += result.filesProcessed;
            batchResult.totalConsoleStatementsProcessed += result.consoleStatementsRemoved;
            batchResult.preservedCriticalStatements += result.consoleStatementsPreserved;
            buildTimes.push(result.buildTime);
          } else {
            batchResult.failedBatches++;
            batchResult.errors.push(`Batch ${i + 1} failed: ${result.errors.join(', ')}`);
          }

          // Safety pause between batches
          if (i < batchCount - 1) {
            console.log('⏸️ Pausing 2 seconds between batches for safety...');
            await this.sleep(2000);
          }
        } catch (error) {
          batchResult.failedBatches++;
          batchResult.errors.push(`Batch ${i + 1} error: ${error}`);
          console.error(`❌ Batch ${i + 1} failed:`, error);
        }
      }

      // Calculate averages
      if (buildTimes.length > 0) {
        batchResult.averageBuildTime = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
      }

      console.log(
        `\n✅ Batch processing completed: ${batchResult.successfulBatches}/${batchResult.totalBatches} batches successful`,
      );

      return batchResult;
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      throw error;
    }
  }

  /**
   * Analyze console statements to identify critical ones
   */
  async analyzeConsoleStatements(): Promise<ConsoleStatement[]> {
    console.log('🔍 Analyzing console statements for critical preservation...');

    const statements: ConsoleStatement[] = [];
    const srcDir = path.join(process.cwd(), 'src');
    const files = this.getAllSourceFiles(srcDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileStatements = this.analyzeFileConsoleStatements(file, content);
        statements.push(...fileStatements);
      } catch (error) {
        console.warn(`⚠️ Could not analyze file ${file}:`, error);
      }
    }

    const criticalCount = statements.filter(s => s.isCritical).length;
    const totalCount = statements.length;

    console.log(`📊 Found ${totalCount} console statements, ${criticalCount} marked as critical`);

    return statements;
  }

  /**
   * Analyze console statements in a single file
   */
  private analyzeFileConsoleStatements(filePath: string, content: string): ConsoleStatement[] {
    const statements: ConsoleStatement[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Match console statements
      const consoleMatches = line.matchAll(/console\.(log|warn|error|info|debug)\s*\([^)]*\)/g);

      for (const match of consoleMatches) {
        const type = match[1] as 'log' | 'warn' | 'error' | 'info' | 'debug';
        const column = (match.index || 0) + 1;
        const content = match[0];

        // Get context (surrounding lines)
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length - 1, i + 2);
        const context = lines.slice(contextStart, contextEnd + 1).join('\n');

        // Determine if critical
        const isCritical = this.isConsoleStatementCritical(filePath, content, context, type);
        const shouldPreserve = this.config.preserveDebugCritical && isCritical;

        statements.push({
          file: filePath,
          line: lineNumber,
          column,
          type,
          content,
          context,
          isCritical,
          shouldPreserve,
        });
      }
    }

    return statements;
  }

  /**
   * Determine if a console statement is critical and should be preserved
   */
  private isConsoleStatementCritical(
    filePath: string,
    content: string,
    context: string,
    type: string,
  ): boolean {
    // Always preserve error statements
    if (type === 'error') {
      return true;
    }

    // Preserve statements in debug/test files
    const debugFiles = ['debug', 'test', 'spec', '.test.', '.spec.', 'logger'];
    if (debugFiles.some(pattern => filePath.toLowerCase().includes(pattern))) {
      return true;
    }

    // Preserve statements with error handling context
    const errorHandlingPatterns = [
      /try\s*{[\s\S]*?catch/i,
      /catch\s*\(/i,
      /error/i,
      /exception/i,
      /fail/i,
      /throw/i,
    ];

    if (errorHandlingPatterns.some(pattern => pattern.test(context))) {
      return true;
    }

    // Preserve statements with important debugging information
    const importantPatterns = [
      /api/i,
      /request/i,
      /response/i,
      /auth/i,
      /login/i,
      /security/i,
      /critical/i,
      /important/i,
    ];

    if (importantPatterns.some(pattern => pattern.test(content))) {
      return true;
    }

    // Preserve warn statements in production code
    if (type === 'warn' && !filePath.includes('test')) {
      return true;
    }

    return false;
  }

  /**
   * Get all source files recursively
   */
  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.getAllSourceFiles(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Validate pre-conditions before execution
   */
  private async validatePreConditions(): Promise<void> {
    // Check if script exists
    if (!fs.existsSync(this.scriptPath)) {
      throw new Error(`Console removal script not found: ${this.scriptPath}`);
    }

    // Check git status if required
    if (this.config.enableGitStash) {
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
        if (gitStatus.trim() && !this.config.autoFix) {
          console.warn(
            '⚠️ Git working directory has uncommitted changes. Consider using --auto-fix or commit changes first.',
          );
        }
      } catch (error) {
        console.warn('⚠️ Could not check git status:', error);
      }
    }
  }

  /**
   * Create safety stash before execution
   */
  private async createSafetyStash(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const stashName = `console-removal-${timestamp}`;

      execSync(`git stash push -m "${stashName}"`, { encoding: 'utf-8' });
      console.log(`📦 Created safety stash: ${stashName}`);

      return stashName;
    } catch (error) {
      console.warn('⚠️ Could not create git stash:', error);
      return '';
    }
  }

  /**
   * Execute the console removal script
   */
  private async executeScript(consoleAnalysis: ConsoleStatement[]): Promise<ConsoleRemovalResult> {
    const result: ConsoleRemovalResult = {
      success: false,
      filesProcessed: 0,
      consoleStatementsRemoved: 0,
      consoleStatementsPreserved: 0,
      buildTime: 0,
      errors: [],
      warnings: [],
      preservedFiles: [],
    };

    try {
      // Build command arguments
      const args: string[] = [];

      if (this.config.dryRun) {
        args.push('--dry-run');
      }

      if (this.config.maxFiles) {
        args.push('--max-files');
        args.push(this.config.maxFiles.toString());
      }

      const command = `node ${this.scriptPath} ${args.join(' ')}`;
      console.log(`🔧 Executing: ${command}`);

      const startTime = Date.now();
      const output = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });
      const endTime = Date.now();

      // Parse output for metrics
      result.success = !output.includes('❌') && !output.includes('Error:');
      result.buildTime = endTime - startTime;

      // Extract metrics from output
      const filesMatch = output.match(/Files processed:\s*(\d+)/i);
      if (filesMatch) {
        result.filesProcessed = parseInt(filesMatch[1]);
      }

      const statementsMatch = output.match(/Total console statements fixed:\s*(\d+)/i);
      if (statementsMatch) {
        result.consoleStatementsRemoved = parseInt(statementsMatch[1]);
      }

      // Calculate preserved statements
      const criticalStatements = consoleAnalysis.filter(s => s.shouldPreserve);
      result.consoleStatementsPreserved = criticalStatements.length;
      result.preservedFiles = [...new Set(criticalStatements.map(s => s.file))];

      // Extract warnings and errors
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('⚠️') || line.includes('WARNING')) {
          result.warnings.push(line.trim());
        } else if (line.includes('❌') || line.includes('ERROR')) {
          result.errors.push(line.trim());
        }
      }

      console.log(`✅ Script execution completed in ${result.buildTime}ms`);
      console.log(
        `📊 Removed: ${result.consoleStatementsRemoved}, Preserved: ${result.consoleStatementsPreserved}`,
      );

      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(`Script execution failed: ${error}`);
      console.error('❌ Script execution failed:', error);
      return result;
    }
  }

  /**
   * Validate build after console removal
   */
  private async validateBuild(): Promise<boolean> {
    try {
      console.log('🔍 Validating build after console removal...');

      const startTime = Date.now();
      execSync('yarn build', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      const buildTime = Date.now() - startTime;

      console.log(`✅ Build validation successful (${buildTime}ms)`);
      return true;
    } catch (error) {
      console.error('❌ Build validation failed:', error);
      return false;
    }
  }

  /**
   * Rollback from git stash
   */
  private async rollbackFromStash(stashName: string): Promise<void> {
    try {
      console.log(`🔄 Rolling back from stash: ${stashName}`);
      execSync(`git stash apply stash^{/${stashName}}`, { encoding: 'utf-8' });
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Estimate files with console statements
   */
  private async estimateFilesWithConsoleStatements(): Promise<number> {
    try {
      // Use the analyzer to get current console statements count
      const { LintingWarningAnalyzer } = await import('./LintingWarningAnalyzer.js');
      const analyzer = new LintingWarningAnalyzer();
      const result = await analyzer.analyzeLintingWarnings();

      return result.distribution.consoleStatements.files.length;
    } catch (error) {
      console.warn('⚠️ Could not estimate files with console statements, using default:', error);
      return 50; // Default estimate
    }
  }

  /**
   * Save metrics to file
   */
  private async saveMetrics(result: ConsoleRemovalResult): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        config: this.config,
        result,
        summary: {
          success: result.success,
          filesProcessed: result.filesProcessed,
          consoleStatementsRemoved: result.consoleStatementsRemoved,
          consoleStatementsPreserved: result.consoleStatementsPreserved,
          buildTime: result.buildTime,
          preservedFiles: result.preservedFiles.length,
        },
      };

      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
      console.log(`📊 Metrics saved to ${this.metricsFile}`);
    } catch (error) {
      console.warn('⚠️ Could not save metrics:', error);
    }
  }

  /**
   * Generate removal report
   */
  generateReport(result: ConsoleRemovalResult | BatchRemovalResult): string {
    if ('totalBatches' in result) {
      // Batch processing report
      return this.generateBatchReport(result);
    } else {
      // Single execution report
      return this.generateSingleReport(result);
    }
  }

  /**
   * Generate single execution report
   */
  private generateSingleReport(result: ConsoleRemovalResult): string {
    return `
# Console Statement Removal Report
Generated: ${new Date().toISOString()}

## Execution Summary
- **Success**: ${result.success ? '✅' : '❌'}
- **Files Processed**: ${result.filesProcessed}
- **Console Statements Removed**: ${result.consoleStatementsRemoved}
- **Console Statements Preserved**: ${result.consoleStatementsPreserved}
- **Build Time**: ${result.buildTime}ms
- **Files with Preserved Statements**: ${result.preservedFiles.length}

## Configuration
- **Max Files**: ${this.config.maxFiles}
- **Dry Run**: ${this.config.dryRun}
- **Preserve Debug Critical**: ${this.config.preserveDebugCritical}
- **Selective Removal**: ${this.config.selectiveRemoval}
- **Build Validation**: ${this.config.buildValidation}
- **Git Stash**: ${this.config.enableGitStash}

## Preserved Files
${
  result.preservedFiles.length > 0
    ? result.preservedFiles.map(f => `- ${f}`).join('\n')
    : 'No files had critical console statements preserved'
}

## Issues
${result.errors.length > 0 ? '### Errors\n' + result.errors.map(e => `- ${e}`).join('\n') : 'No errors'}
${result.warnings.length > 0 ? '### Warnings\n' + result.warnings.map(w => `- ${w}`).join('\n') : 'No warnings'}

## Next Steps
${
  result.success
    ? '- ✅ Console removal completed successfully\n- Review preserved critical statements\n- Run linting to verify improvements\n- Consider committing changes'
    : '- ❌ Console removal failed\n- Review errors above\n- Consider running with --dry-run first\n- Check git stash for rollback if needed'
}
`;
  }

  /**
   * Generate batch processing report
   */
  private generateBatchReport(result: BatchRemovalResult): string {
    return `
# Console Statement Batch Removal Report
Generated: ${new Date().toISOString()}

## Batch Summary
- **Total Batches**: ${result.totalBatches}
- **Successful Batches**: ${result.successfulBatches}
- **Failed Batches**: ${result.failedBatches}
- **Success Rate**: ${((result.successfulBatches / result.totalBatches) * 100).toFixed(1)}%

## Processing Summary
- **Total Files Processed**: ${result.totalFilesProcessed}
- **Total Console Statements Processed**: ${result.totalConsoleStatementsProcessed}
- **Critical Statements Preserved**: ${result.preservedCriticalStatements}
- **Average Build Time**: ${result.averageBuildTime.toFixed(0)}ms

## Batch Configuration
- **Batch Size**: ${this.config.batchSize} files per batch
- **Preserve Debug Critical**: ${this.config.preserveDebugCritical}
- **Selective Removal**: ${this.config.selectiveRemoval}
- **Build Validation**: ${this.config.buildValidation}

## Issues
${result.errors.length > 0 ? '### Batch Errors\n' + result.errors.map(e => `- ${e}`).join('\n') : 'No batch errors'}

## Recommendations
${
  result.successfulBatches === result.totalBatches
    ? '- ✅ All batches completed successfully\n- Review preserved critical statements\n- Run final linting validation\n- Consider committing all changes'
    : '- ⚠️ Some batches failed\n- Review failed batch errors\n- Consider re-running failed batches\n- Check git stashes for rollback if needed'
}
`;
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

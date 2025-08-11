#!/usr/bin/env node

/**
 * Conservative Replacement Pilot CLI
 * Command-line interface for executing Task 12.2
 *
 * Usage:
 *   node conservative-pilot.cjs [options]
 *
 * Options:
 *   --batch-size <number>     Maximum files per batch (default: 15)
 *   --max-batches <number>    Maximum number of batches (default: 10)
 *   --success-rate <number>   Target success rate (default: 0.8)
 *   --safety-threshold <number> Safety threshold (default: 0.7)
 *   --dry-run                 Analyze only, don't make changes
 *   --verbose                 Enable verbose logging
 *   --help                    Show help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEFAULT_CONFIG = {
  maxFilesPerBatch: 15,
  minFilesPerBatch: 10,
  targetSuccessRate: 0.8,
  maxBatches: 10,
  realTimeValidation: true,
  rollbackOnFailure: true,
  safetyThreshold: 0.7,
  focusCategories: ['array_type', 'record_type'],
  buildValidationFrequency: 1
};

class ConservativePilotCLI {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.verbose = false;
    this.dryRun = false;
    this.startTime = new Date();
  }

  parseArgs() {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--batch-size':
          this.config.maxFilesPerBatch = parseInt(args[++i]) || DEFAULT_CONFIG.maxFilesPerBatch;
          break;
        case '--max-batches':
          this.config.maxBatches = parseInt(args[++i]) || DEFAULT_CONFIG.maxBatches;
          break;
        case '--success-rate':
          this.config.targetSuccessRate = parseFloat(args[++i]) || DEFAULT_CONFIG.targetSuccessRate;
          break;
        case '--safety-threshold':
          this.config.safetyThreshold = parseFloat(args[++i]) || DEFAULT_CONFIG.safetyThreshold;
          break;
        case '--dry-run':
          this.dryRun = true;
          break;
        case '--verbose':
          this.verbose = true;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
        default:
          if (arg.startsWith('--')) {
            console.warn(`Unknown option: ${arg}`);
          }
          break;
      }
    }
  }

  showHelp() {
    console.log(`
Conservative Replacement Pilot CLI - Task 12.2

DESCRIPTION:
  Executes limited batch processing on high-confidence cases with real-time validation.
  Focuses on array types (any[] → unknown[]) and simple Record types.

USAGE:
  node conservative-pilot.cjs [options]

OPTIONS:
  --batch-size <number>      Maximum files per batch (default: ${DEFAULT_CONFIG.maxFilesPerBatch})
  --max-batches <number>     Maximum number of batches (default: ${DEFAULT_CONFIG.maxBatches})
  --success-rate <number>    Target success rate (default: ${DEFAULT_CONFIG.targetSuccessRate})
  --safety-threshold <number> Safety threshold (default: ${DEFAULT_CONFIG.safetyThreshold})
  --dry-run                  Analyze only, don't make changes
  --verbose                  Enable verbose logging
  --help                     Show this help message

EXAMPLES:
  # Run with default settings
  node conservative-pilot.cjs

  # Run with smaller batches and higher safety threshold
  node conservative-pilot.cjs --batch-size 10 --safety-threshold 0.8

  # Dry run to see what would be changed
  node conservative-pilot.cjs --dry-run --verbose

REQUIREMENTS:
  - Target >80% successful replacements with zero build failures
  - Focus on array types (any[] → unknown[]) and simple Record types
  - Monitor build stability and rollback frequency with real-time validation
  - Collect success rate metrics and safety protocol effectiveness
`);
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';

    if (level === 'verbose' && !this.verbose) {
      return;
    }

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validatePrerequisites() {
    this.log('Validating prerequisites...', 'verbose');

    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error('Must be run from project root directory');
    }

    // Check if TypeScript is available
    try {
      execSync('yarn tsc --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('TypeScript not available. Run "yarn install" first.');
    }

    // Check if source directory exists
    if (!fs.existsSync('src')) {
      throw new Error('Source directory not found');
    }

    // Validate initial build state
    this.log('Checking initial build state...', 'verbose');
    const initialBuildResult = await this.validateBuild();
    if (!initialBuildResult.success) {
      this.log(`Initial build has ${initialBuildResult.errorCount} TypeScript errors`, 'warn');
      this.log('Proceeding with pilot despite initial errors...', 'verbose');
    }

    this.log('Prerequisites validated', 'success');
  }

  async validateBuild() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000
      });

      return { success: true, errorCount: 0, output };
    } catch (error) {
      // Count TypeScript errors
      const errorOutput = error.stdout || error.message || '';
      const errorMatches = errorOutput.match(/error TS\d+/g);
      const errorCount = errorMatches ? errorMatches.length : 0;

      return {
        success: false,
        errorCount,
        output: errorOutput,
        error: error.message
      };
    }
  }

  async findHighConfidenceCases() {
    this.log('Identifying high-confidence replacement cases...', 'verbose');

    const cases = [];
    const tsFiles = await this.getTypeScriptFiles();

    this.log(`Analyzing ${tsFiles.length} TypeScript files`, 'verbose');

    let filesAnalyzed = 0;
    const maxFilesToAnalyze = 100; // Limit for pilot

    for (const filePath of tsFiles.slice(0, maxFilesToAnalyze)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileCases = this.findAnyTypesInFile(content, filePath);
        cases.push(...fileCases);

        filesAnalyzed++;
        if (filesAnalyzed % 20 === 0) {
          this.log(`Analyzed ${filesAnalyzed} files, found ${cases.length} cases`, 'verbose');
        }
      } catch (error) {
        this.log(`Failed to analyze ${filePath}: ${error.message}`, 'warn');
      }
    }

    // Sort by confidence (prioritize array types and simple patterns)
    cases.sort((a, b) => {
      // Array types get highest priority
      if (a.type === 'array' && b.type !== 'array') return -1;
      if (b.type === 'array' && a.type !== 'array') return 1;

      // Then Record types
      if (a.type === 'record' && b.type !== 'record') return -1;
      if (b.type === 'record' && a.type !== 'record') return 1;

      // Then by confidence
      return b.confidence - a.confidence;
    });

    this.log(`Found ${cases.length} high-confidence cases from ${filesAnalyzed} files`, 'success');
    return cases;
  }

  async getTypeScriptFiles() {
    try {
      const output = execSync('find src -name "*.ts" -o -name "*.tsx" | grep -v __tests__ | grep -v .test. | head -200', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim().split('\n').filter(file => file.trim());
    } catch (error) {
      this.log('Using fallback method to find TypeScript files', 'verbose');
      return this.getFallbackTypeScriptFiles();
    }
  }

  getFallbackTypeScriptFiles() {
    const files = [];
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('__tests__') && !item.includes('node_modules')) {
          walkDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx')) && !item.includes('.test.')) {
          files.push(fullPath);
        }
      }
    };

    walkDir('src');
    return files.slice(0, 100); // Limit for pilot
  }

  findAnyTypesInFile(content, filePath) {
    const lines = content.split('\n');
    const cases = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Look for any[] patterns (highest confidence)
      if (line.includes('any[]') && !this.isInComment(line) && !this.isInErrorHandling(line)) {
        cases.push({
          filePath,
          lineNumber,
          original: 'any[]',
          replacement: 'unknown[]',
          type: 'array',
          confidence: 0.95,
          line: line.trim(),
          reasoning: 'Array type replacement is very safe'
        });
      }

      // Look for Record<string, any> patterns (high confidence)
      if (line.includes('Record<string, any>') && !this.isInComment(line) && !this.isInErrorHandling(line)) {
        cases.push({
          filePath,
          lineNumber,
          original: 'Record<string, any>',
          replacement: 'Record<string, unknown>',
          type: 'record',
          confidence: 0.85,
          line: line.trim(),
          reasoning: 'Simple Record type replacement is generally safe'
        });
      }

      // Look for Record<number, any> patterns
      if (line.includes('Record<number, any>') && !this.isInComment(line) && !this.isInErrorHandling(line)) {
        cases.push({
          filePath,
          lineNumber,
          original: 'Record<number, any>',
          replacement: 'Record<number, unknown>',
          type: 'record',
          confidence: 0.85,
          line: line.trim(),
          reasoning: 'Simple Record type replacement is generally safe'
        });
      }
    }

    return cases;
  }

  isInComment(line) {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
  }

  isInErrorHandling(line) {
    return line.includes('catch') || line.includes('error') || line.includes('Error');
  }

  async executePilot(cases) {
    if (this.dryRun) {
      this.log('DRY RUN: Would process the following cases:', 'info');
      cases.slice(0, 20).forEach((case_, index) => {
        console.log(`  ${index + 1}. ${case_.filePath}:${case_.lineNumber} - ${case_.original} → ${case_.replacement}`);
      });
      if (cases.length > 20) {
        console.log(`  ... and ${cases.length - 20} more cases`);
      }
      return { success: true, dryRun: true };
    }

    this.log(`Starting batch processing of ${cases.length} cases...`, 'info');

    const results = {
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      batchResults: [],
      buildFailures: 0,
      rollbacksPerformed: 0
    };

    // Group cases by file for efficient processing
    const casesByFile = this.groupCasesByFile(cases);
    const fileGroups = Array.from(casesByFile.entries());

    let batchNumber = 0;
    let processedFiles = 0;

    while (processedFiles < fileGroups.length && batchNumber < this.config.maxBatches) {
      batchNumber++;
      this.log(`Processing Batch ${batchNumber}...`, 'info');

      // Select files for this batch
      const batchFiles = fileGroups.slice(processedFiles, processedFiles + this.config.maxFilesPerBatch);
      const batchCases = batchFiles.flatMap(([_, fileCases]) => fileCases);

      if (batchCases.length === 0) break;

      this.log(`Batch ${batchNumber}: Processing ${batchCases.length} cases across ${batchFiles.length} files`, 'verbose');

      // Execute batch
      const batchResult = await this.executeBatch(batchCases, batchNumber);
      results.batchResults.push(batchResult);

      // Update totals
      results.totalProcessed += batchResult.casesProcessed;
      results.totalSuccessful += batchResult.successfulReplacements;
      results.totalFailed += batchResult.failedReplacements;

      if (!batchResult.buildStable) {
        results.buildFailures++;
      }

      if (batchResult.rollbackPerformed) {
        results.rollbacksPerformed++;
      }

      // Real-time validation
      const validationResult = await this.performRealTimeValidation(batchResult);
      if (!validationResult.buildStable) {
        this.log('Build stability compromised, stopping pilot', 'error');
        break;
      }

      // Check success rate
      const currentSuccessRate = results.totalSuccessful / results.totalProcessed;
      this.log(`Current success rate: ${(currentSuccessRate * 100).toFixed(1)}%`, 'verbose');

      processedFiles += batchFiles.length;

      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalSuccessRate = results.totalSuccessful / results.totalProcessed;
    const success = finalSuccessRate >= this.config.targetSuccessRate && results.buildFailures === 0;

    this.log(`Batch processing completed:`, 'info');
    this.log(`  Total processed: ${results.totalProcessed}`, 'info');
    this.log(`  Successful: ${results.totalSuccessful}`, 'info');
    this.log(`  Failed: ${results.totalFailed}`, 'info');
    this.log(`  Success rate: ${(finalSuccessRate * 100).toFixed(1)}%`, 'info');
    this.log(`  Build failures: ${results.buildFailures}`, 'info');

    return { ...results, success, finalSuccessRate };
  }

  async executeBatch(cases, batchNumber) {
    const batchStartTime = new Date();
    this.log(`Executing batch ${batchNumber} with ${cases.length} cases...`, 'verbose');

    // Pre-batch validation
    const preBatchValidation = await this.validateBuild();
    if (!preBatchValidation.success) {
      this.log('Pre-batch build validation failed', 'error');
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

    // Create backups and apply replacements
    const backups = new Map();
    let successfulReplacements = 0;
    let failedReplacements = 0;

    try {
      // Group cases by file
      const casesByFile = this.groupCasesByFile(cases);

      for (const [filePath, fileCases] of casesByFile.entries()) {
        // Create backup
        const backupPath = await this.createBackup(filePath);
        backups.set(filePath, backupPath);

        // Apply replacements to file
        const fileResult = await this.applyReplacementsToFile(filePath, fileCases);
        successfulReplacements += fileResult.successful;
        failedReplacements += fileResult.failed;
      }

      // Post-batch validation
      const postBatchValidation = await this.validateBuild();
      const buildStable = postBatchValidation.success;

      if (!buildStable && this.config.rollbackOnFailure) {
        this.log('Post-batch build validation failed, performing rollback...', 'warn');
        await this.rollbackFiles(backups);
        return {
          batchNumber,
          startTime: batchStartTime,
          endTime: new Date(),
          casesProcessed: cases.length,
          successfulReplacements: 0,
          failedReplacements: cases.length,
          buildStable: false,
          rollbackPerformed: true,
          error: 'Build validation failed, rollback performed'
        };
      }

      return {
        batchNumber,
        startTime: batchStartTime,
        endTime: new Date(),
        casesProcessed: cases.length,
        successfulReplacements,
        failedReplacements,
        buildStable,
        rollbackPerformed: false
      };

    } catch (error) {
      this.log(`Batch ${batchNumber} execution failed: ${error.message}`, 'error');
      await this.rollbackFiles(backups);

      return {
        batchNumber,
        startTime: batchStartTime,
        endTime: new Date(),
        casesProcessed: cases.length,
        successfulReplacements: 0,
        failedReplacements: cases.length,
        buildStable: false,
        rollbackPerformed: true,
        error: error.message
      };
    }
  }

  async createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupDir = './.conservative-pilot-backups';

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, originalContent, 'utf8');

    return backupPath;
  }

  async applyReplacementsToFile(filePath, cases) {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let successful = 0;
    let failed = 0;

    // Sort by line number (descending to avoid line number shifts)
    cases.sort((a, b) => b.lineNumber - a.lineNumber);

    for (const case_ of cases) {
      try {
        const lineIndex = case_.lineNumber - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) {
          failed++;
          continue;
        }

        const originalLine = lines[lineIndex];
        const modifiedLine = originalLine.replace(case_.original, case_.replacement);

        if (originalLine === modifiedLine) {
          failed++;
          continue;
        }

        lines[lineIndex] = modifiedLine;
        successful++;

      } catch (error) {
        failed++;
      }
    }

    // Write modified content back to file
    const modifiedContent = lines.join('\n');
    fs.writeFileSync(filePath, modifiedContent, 'utf8');

    return { successful, failed };
  }

  async rollbackFiles(backups) {
    for (const [filePath, backupPath] of backups.entries()) {
      try {
        if (fs.existsSync(backupPath)) {
          const backupContent = fs.readFileSync(backupPath, 'utf8');
          fs.writeFileSync(filePath, backupContent, 'utf8');
        }
      } catch (error) {
        this.log(`Failed to rollback ${filePath}: ${error.message}`, 'error');
      }
    }
  }

  groupCasesByFile(cases) {
    const grouped = new Map();

    for (const case_ of cases) {
      if (!grouped.has(case_.filePath)) {
        grouped.set(case_.filePath, []);
      }
      grouped.get(case_.filePath).push(case_);
    }

    return grouped;
  }

  async performRealTimeValidation(batchResult) {
    this.log('Performing real-time validation...', 'verbose');

    try {
      const buildValidation = await this.validateBuild();
      const currentErrorCount = buildValidation.errorCount;

      return {
        buildStable: buildValidation.success,
        typeScriptErrorCount: currentErrorCount,
        validationTime: new Date(),
        batchNumber: batchResult.batchNumber,
        warnings: []
      };

    } catch (error) {
      this.log(`Real-time validation failed: ${error.message}`, 'error');
      return {
        buildStable: false,
        typeScriptErrorCount: -1,
        validationTime: new Date(),
        batchNumber: batchResult.batchNumber,
        warnings: ['Validation process failed'],
        error: error.message
      };
    }
  }

  async generateReport(result) {
    const reportDir = '.kiro/campaign-reports/conservative-pilot';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const executionTime = new Date().getTime() - this.startTime.getTime();
    const report = {
      pilotId: `conservative-pilot-${Date.now()}`,
      timestamp: new Date().toISOString(),
      configuration: this.config,
      dryRun: this.dryRun,
      executionTime,
      results: result,
      recommendations: this.generateRecommendations(result)
    };

    // Save JSON report
    const jsonReportPath = path.join(reportDir, 'cli-pilot-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // Save markdown summary
    const markdownReportPath = path.join(reportDir, 'cli-pilot-summary.md');
    const markdownContent = this.generateMarkdownReport(report);
    fs.writeFileSync(markdownReportPath, markdownContent);

    this.log(`Report saved to ${reportDir}`, 'success');
    return report;
  }

  generateRecommendations(result) {
    const recommendations = [];

    if (result.dryRun) {
      recommendations.push('Dry run completed successfully. Ready to execute actual replacements.');
      return recommendations;
    }

    const successRate = result.finalSuccessRate || 0;

    if (successRate >= this.config.targetSuccessRate && result.buildFailures === 0) {
      recommendations.push('✅ Pilot successful! All targets achieved. Ready for full campaign (Task 12.3).');
    } else {
      if (successRate < this.config.targetSuccessRate) {
        recommendations.push(`⚠️ Success rate ${(successRate * 100).toFixed(1)}% below target ${(this.config.targetSuccessRate * 100).toFixed(1)}%. Consider more conservative approach.`);
      }

      if (result.buildFailures > 0) {
        recommendations.push(`❌ ${result.buildFailures} build failures occurred. Review safety protocols before full campaign.`);
      }
    }

    if (result.rollbacksPerformed > 0) {
      recommendations.push(`⚠️ ${result.rollbacksPerformed} rollbacks performed. Analyze causes to improve replacement strategies.`);
    }

    return recommendations;
  }

  generateMarkdownReport(report) {
    const result = report.results;
    const successRate = result.finalSuccessRate || 0;

    return `# Conservative Replacement Pilot CLI Report

## Executive Summary

**Pilot Status**: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
**Execution Mode**: ${report.dryRun ? '🔍 DRY RUN' : '⚡ LIVE EXECUTION'}
**Execution Time**: ${Math.round(report.executionTime / 1000)}s
**Target Achievement**: ${result.success && result.buildFailures === 0 ? '✅ YES' : '❌ NO'}

## Key Metrics

- **Cases Processed**: ${result.totalProcessed || 0}
- **Successful Replacements**: ${result.totalSuccessful || 0}
- **Failed Replacements**: ${result.totalFailed || 0}
- **Success Rate**: ${(successRate * 100).toFixed(1)}% (Target: ${(report.configuration.targetSuccessRate * 100).toFixed(1)}%)
- **Build Failures**: ${result.buildFailures || 0} (Target: 0)
- **Rollbacks Performed**: ${result.rollbacksPerformed || 0}

## Batch Results

${result.batchResults ? result.batchResults.map(batch => `
### Batch ${batch.batchNumber}
- **Cases**: ${batch.casesProcessed}
- **Successful**: ${batch.successfulReplacements}
- **Failed**: ${batch.failedReplacements}
- **Build Stable**: ${batch.buildStable ? '✅' : '❌'}
- **Rollback**: ${batch.rollbackPerformed ? '⚠️ YES' : '✅ NO'}
`).join('') : 'No batch results available'}

## Configuration

\`\`\`json
${JSON.stringify(report.configuration, null, 2)}
\`\`\`

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
*CLI Version: Conservative Replacement Pilot v1.0*
`;
  }

  async run() {
    try {
      this.log('🚀 Conservative Replacement Pilot CLI Starting...', 'info');
      this.log(`Configuration: ${this.config.maxFilesPerBatch} files per batch, ${this.config.maxBatches} max batches`, 'verbose');

      this.parseArgs();
      await this.validatePrerequisites();

      // Phase 1: Identify high-confidence cases
      const cases = await this.findHighConfidenceCases();

      if (cases.length === 0) {
        this.log('No high-confidence cases found for replacement', 'warn');
        return;
      }

      // Phase 2: Execute pilot (or dry run)
      const result = await this.executePilot(cases);

      // Phase 3: Generate report
      const report = await this.generateReport(result);

      // Phase 4: Summary
      if (result.success) {
        this.log('🎉 Conservative Replacement Pilot completed successfully!', 'success');
        if (!this.dryRun) {
          this.log(`✅ Achieved ${(result.finalSuccessRate * 100).toFixed(1)}% success rate with ${result.buildFailures} build failures`, 'success');
        }
      } else {
        this.log('❌ Conservative Replacement Pilot did not meet all targets', 'error');
        if (!this.dryRun) {
          this.log(`⚠️ Success rate: ${(result.finalSuccessRate * 100).toFixed(1)}%, Build failures: ${result.buildFailures}`, 'warn');
        }
      }

      this.log(`📊 Full report available at: .kiro/campaign-reports/conservative-pilot/`, 'info');

    } catch (error) {
      this.log(`❌ Pilot execution failed: ${error.message}`, 'error');
      if (this.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const cli = new ConservativePilotCLI();
  cli.run().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = ConservativePilotCLI;

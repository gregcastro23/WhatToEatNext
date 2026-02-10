#!/usr/bin/env node

/**
 * Enhanced Error Analysis with Better ESLint Handling
 *
 * Handles large ESLint outputs more robustly
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedErrorAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      typeScriptErrors: {
        total: 0,
        byType: {},
        byFile: {},
        highImpactFiles: []
      },
      eslintIssues: {
        total: 0,
        byRule: {},
        bySeverity: {},
        byFile: {},
        autoFixable: 0,
        manualReview: 0
      },
      priorityMatrix: [],
      baselineMetrics: {},
      recommendations: []
    };
  }

  /**
   * Analyze ESLint issues with better buffer handling
   */
  async analyzeESLintIssuesRobust() {
    console.log('🔍 Analyzing ESLint issues (robust method)...');

    try {
      // Try multiple approaches for ESLint analysis
      let eslintResults = await this.tryESLintAnalysis();

      if (!eslintResults || eslintResults.length === 0) {
        console.log('⚠️ No ESLint results from JSON, trying text parsing...');
        eslintResults = await this.tryESLintTextAnalysis();
      }

      if (!eslintResults || eslintResults.length === 0) {
        console.log('⚠️ No ESLint results from text, trying file-by-file analysis...');
        eslintResults = await this.tryFileByFileAnalysis();
      }

      // Process results
      this.processESLintResults(eslintResults);

    } catch (error) {
      console.error('❌ Error in ESLint analysis:', error.message);
      // Try to get basic counts at least
      await this.getBasicESLintCounts();
    }
  }

  /**
   * Try ESLint JSON analysis
   */
  async tryESLintAnalysis() {
    try {
      // Write ESLint output to temporary file to avoid buffer issues
      const tempFile = 'temp-eslint-output.json';

      execSync(`yarn lint --format=json > ${tempFile} 2>/dev/null || echo "[]" > ${tempFile}`, {
        stdio: 'inherit',
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer
      });

      if (fs.existsSync(tempFile)) {
        const content = fs.readFileSync(tempFile, 'utf8');
        fs.unlinkSync(tempFile); // Clean up

        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.warn('⚠️ Could not parse ESLint JSON output');
          return null;
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ ESLint JSON analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Try ESLint text analysis
   */
  async tryESLintTextAnalysis() {
    try {
      const tempFile = 'temp-eslint-text.txt';

      execSync(`yarn lint > ${tempFile} 2>&1 || true`, {
        stdio: 'inherit'
      });

      if (fs.existsSync(tempFile)) {
        const content = fs.readFileSync(tempFile, 'utf8');
        fs.unlinkSync(tempFile); // Clean up

        return this.parseESLintTextOutput(content);
      }

      return null;
    } catch (error) {
      console.warn('⚠️ ESLint text analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Try file-by-file analysis for smaller chunks
   */
  async tryFileByFileAnalysis() {
    try {
      console.log('📁 Attempting file-by-file ESLint analysis...');

      // Get list of TypeScript/JavaScript files
      const files = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -20', {
        encoding: 'utf8'
      }).trim().split('\n').filter(f => f.trim());

      const results = [];
      let processedCount = 0;

      for (const file of files.slice(0, 10)) { // Limit to first 10 files for analysis
        try {
          const output = execSync(`yarn eslint "${file}" --format=json 2>/dev/null || echo "[]"`, {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 // 1MB per file
          });

          const fileResults = JSON.parse(output);
          if (Array.isArray(fileResults)) {
            results.push(...fileResults);
          }

          processedCount++;
          if (processedCount % 5 === 0) {
            console.log(`   Processed ${processedCount}/${files.length} files...`);
          }
        } catch (fileError) {
          console.warn(`   ⚠️ Could not analyze ${file}: ${fileError.message}`);
        }
      }

      console.log(`✅ Analyzed ${processedCount} files individually`);
      return results;

    } catch (error) {
      console.warn('⚠️ File-by-file analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Get basic ESLint counts as fallback
   */
  async getBasicESLintCounts() {
    try {
      console.log('📊 Getting basic ESLint counts...');

      // Count total issues
      const totalOutput = execSync('yarn lint 2>&1 | grep -E "error|warning" | wc -l || echo "0"', {
        encoding: 'utf8'
      });

      const total = parseInt(totalOutput.trim()) || 0;

      // Count errors vs warnings
      const errorOutput = execSync('yarn lint 2>&1 | grep -c "error" || echo "0"', {
        encoding: 'utf8'
      });

      const errors = parseInt(errorOutput.trim()) || 0;
      const warnings = total - errors;

      this.results.eslintIssues = {
        total,
        byRule: { 'unknown': total },
        bySeverity: { error: errors, warning: warnings },
        byFile: {},
        autoFixable: Math.floor(total * 0.3), // Estimate 30% auto-fixable
        manualReview: Math.ceil(total * 0.7)
      };

      console.log(`✅ Basic ESLint counts: ${total} total (${errors} errors, ${warnings} warnings)`);

    } catch (error) {
      console.warn('⚠️ Could not get basic ESLint counts:', error.message);
      this.results.eslintIssues = {
        total: 0,
        byRule: {},
        bySeverity: { error: 0, warning: 0 },
        byFile: {},
        autoFixable: 0,
        manualReview: 0
      };
    }
  }

  /**
   * Process ESLint results
   */
  processESLintResults(eslintResults) {
    if (!Array.isArray(eslintResults) || eslintResults.length === 0) {
      console.log('⚠️ No ESLint results to process');
      return;
    }

    const issuesByRule = {};
    const issuesBySeverity = { error: 0, warning: 0 };
    const issuesByFile = {};
    let autoFixableCount = 0;
    let totalIssues = 0;

    eslintResults.forEach(fileResult => {
      if (fileResult.messages && Array.isArray(fileResult.messages)) {
        const filePath = fileResult.filePath || 'unknown';
        issuesByFile[filePath] = fileResult.messages.length;

        fileResult.messages.forEach(message => {
          totalIssues++;

          // Count by rule
          const rule = message.ruleId || 'unknown';
          issuesByRule[rule] = (issuesByRule[rule] || 0) + 1;

          // Count by severity
          const severity = message.severity === 2 ? 'error' : 'warning';
          issuesBySeverity[severity]++;

          // Count auto-fixable
          if (message.fix || this.isAutoFixableRule(rule)) {
            autoFixableCount++;
          }
        });
      }
    });

    this.results.eslintIssues = {
      total: totalIssues,
      byRule: issuesByRule,
      bySeverity: issuesBySeverity,
      byFile: issuesByFile,
      autoFixable: autoFixableCount,
      manualReview: totalIssues - autoFixableCount
    };

    console.log(`✅ Processed ${totalIssues} ESLint issues from ${eslintResults.length} files`);
    console.log(`🔧 Auto-fixable: ${autoFixableCount}`);
    console.log(`👁️ Manual review: ${totalIssues - autoFixableCount}`);
  }

  /**
   * Parse ESLint text output
   */
  parseESLintTextOutput(textOutput) {
    const lines = textOutput.split('\n');
    const results = [];
    let currentFile = null;
    let currentMessages = [];

    lines.forEach(line => {
      // Check if line is a file path
      if (line.match(/^\/.*\.(ts|tsx|js|jsx)$/) || line.match(/^[^\/]*src\/.*\.(ts|tsx|js|jsx)$/)) {
        if (currentFile) {
          results.push({
            filePath: currentFile,
            messages: currentMessages
          });
        }
        currentFile = line.trim();
        currentMessages = [];
      } else if (line.match(/^\s+\d+:\d+/)) {
        // Parse error/warning line
        const match = line.match(/^\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([a-zA-Z0-9/@-]+)$/);
        if (match) {
          currentMessages.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            severity: match[3] === 'error' ? 2 : 1,
            message: match[4],
            ruleId: match[5]
          });
        }
      }
    });

    if (currentFile && currentMessages.length > 0) {
      results.push({
        filePath: currentFile,
        messages: currentMessages
      });
    }

    return results;
  }

  /**
   * Check if a rule is typically auto-fixable
   */
  isAutoFixableRule(rule) {
    const autoFixableRules = [
      '@typescript-eslint/no-unused-vars',
      'no-unused-vars',
      'prefer-const',
      'no-var',
      'quotes',
      'semi',
      'comma-dangle',
      'indent',
      'space-before-function-paren',
      'object-curly-spacing',
      'array-bracket-spacing',
      'import/order',
      'import/newline-after-import',
      'no-trailing-spaces',
      'eol-last'
    ];

    return autoFixableRules.includes(rule);
  }

  /**
   * Analyze TypeScript errors (same as before)
   */
  async analyzeTypeScriptErrors() {
    console.log('🔍 Analyzing TypeScript errors...');

    try {
      // Get TypeScript compilation errors
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const errorLines = tscOutput.split('\n').filter(line =>
        line.includes('error TS') && !line.includes('Found ')
      );

      this.results.typeScriptErrors.total = errorLines.length;

      // Parse errors by type
      const errorsByType = {};
      const errorsByFile = {};

      errorLines.forEach(line => {
        // Extract error code (e.g., TS2304, TS1005)
        const errorMatch = line.match(/error (TS\d+):/);
        if (errorMatch) {
          const errorCode = errorMatch[1];
          errorsByType[errorCode] = (errorsByType[errorCode] || 0) + 1;
        }

        // Extract file path
        const fileMatch = line.match(/^([^(]+)\(/);
        if (fileMatch) {
          const filePath = fileMatch[1].trim();
          errorsByFile[filePath] = (errorsByFile[filePath] || 0) + 1;
        }
      });

      this.results.typeScriptErrors.byType = errorsByType;
      this.results.typeScriptErrors.byFile = errorsByFile;

      // Identify high-impact files (>10 errors)
      this.results.typeScriptErrors.highImpactFiles = Object.entries(errorsByFile)
        .filter(([file, count]) => count >= 10)
        .sort(([,a], [,b]) => b - a)
        .map(([file, count]) => ({ file, errorCount: count }));

      console.log(`✅ Found ${this.results.typeScriptErrors.total} TypeScript errors`);
      console.log(`📊 Error types: ${Object.keys(errorsByType).length}`);
      console.log(`🎯 High-impact files: ${this.results.typeScriptErrors.highImpactFiles.length}`);

    } catch (error) {
      console.error('❌ Error analyzing TypeScript errors:', error.message);
      this.results.typeScriptErrors.analysisError = error.message;
    }
  }

  /**
   * Create priority matrix (enhanced)
   */
  createPriorityMatrix() {
    console.log('📊 Creating error priority matrix...');

    const priorityMatrix = [];

    // TypeScript error priorities
    const tsErrorPriorities = {
      'TS1005': { priority: 'CRITICAL', complexity: 'MEDIUM', buildImpact: 'HIGH', description: 'Syntax errors - prevent compilation' },
      'TS1128': { priority: 'CRITICAL', complexity: 'LOW', buildImpact: 'HIGH', description: 'Declaration errors - prevent compilation' },
      'TS1003': { priority: 'CRITICAL', complexity: 'MEDIUM', buildImpact: 'HIGH', description: 'Identifier expected errors' },
      'TS2304': { priority: 'HIGH', complexity: 'MEDIUM', buildImpact: 'HIGH', description: 'Cannot find name errors' },
      'TS2339': { priority: 'HIGH', complexity: 'MEDIUM', buildImpact: 'MEDIUM', description: 'Property access errors' },
      'TS2322': { priority: 'MEDIUM', complexity: 'HIGH', buildImpact: 'MEDIUM', description: 'Type assignment errors' },
      'TS2345': { priority: 'MEDIUM', complexity: 'MEDIUM', buildImpact: 'MEDIUM', description: 'Argument type errors' },
      'TS2571': { priority: 'LOW', complexity: 'LOW', buildImpact: 'LOW', description: 'Object literal errors' },
      'TS2698': { priority: 'MEDIUM', complexity: 'MEDIUM', buildImpact: 'MEDIUM', description: 'Spread syntax errors' },
      'TS2362': { priority: 'MEDIUM', complexity: 'MEDIUM', buildImpact: 'MEDIUM', description: 'Left-hand side assignment errors' }
    };

    Object.entries(this.results.typeScriptErrors.byType).forEach(([errorType, count]) => {
      const priority = tsErrorPriorities[errorType] || {
        priority: 'MEDIUM',
        complexity: 'MEDIUM',
        buildImpact: 'MEDIUM',
        description: 'Other TypeScript error'
      };

      priorityMatrix.push({
        type: 'TypeScript',
        errorType,
        count,
        ...priority,
        estimatedEffort: this.calculateEstimatedEffort(count, priority.complexity)
      });
    });

    // ESLint issue priorities
    const eslintPriorities = {
      '@typescript-eslint/no-unused-vars': { priority: 'MEDIUM', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true },
      '@typescript-eslint/no-explicit-any': { priority: 'MEDIUM', complexity: 'HIGH', buildImpact: 'LOW', autoFixable: false },
      'react-hooks/exhaustive-deps': { priority: 'HIGH', complexity: 'MEDIUM', buildImpact: 'MEDIUM', autoFixable: false },
      'no-console': { priority: 'LOW', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true },
      'prefer-const': { priority: 'LOW', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true },
      'no-var': { priority: 'MEDIUM', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true },
      'no-unused-vars': { priority: 'MEDIUM', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true },
      'eqeqeq': { priority: 'MEDIUM', complexity: 'LOW', buildImpact: 'LOW', autoFixable: true }
    };

    Object.entries(this.results.eslintIssues.byRule).forEach(([rule, count]) => {
      const priority = eslintPriorities[rule] || {
        priority: 'MEDIUM',
        complexity: 'MEDIUM',
        buildImpact: 'LOW',
        autoFixable: this.isAutoFixableRule(rule)
      };

      priorityMatrix.push({
        type: 'ESLint',
        errorType: rule,
        count,
        ...priority,
        estimatedEffort: this.calculateEstimatedEffort(count, priority.complexity, priority.autoFixable)
      });
    });

    // Sort by priority and impact
    priorityMatrix.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const impactOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

      const aPriorityScore = priorityOrder[a.priority] * 10 + impactOrder[a.buildImpact];
      const bPriorityScore = priorityOrder[b.priority] * 10 + impactOrder[b.buildImpact];

      return bPriorityScore - aPriorityScore;
    });

    this.results.priorityMatrix = priorityMatrix;
    console.log(`✅ Created priority matrix with ${priorityMatrix.length} entries`);
  }

  /**
   * Calculate estimated effort for fixing errors
   */
  calculateEstimatedEffort(count, complexity, autoFixable = false) {
    const baseMinutes = {
      'LOW': autoFixable ? 0.5 : 2,
      'MEDIUM': autoFixable ? 1 : 5,
      'HIGH': autoFixable ? 2 : 15
    };

    return Math.ceil(count * baseMinutes[complexity]);
  }

  /**
   * Generate baseline metrics
   */
  generateBaselineMetrics() {
    console.log('📈 Generating baseline metrics...');

    const baseline = {
      timestamp: new Date().toISOString(),
      typeScript: {
        totalErrors: this.results.typeScriptErrors.total,
        criticalErrors: this.getCriticalErrorCount(),
        highImpactFiles: this.results.typeScriptErrors.highImpactFiles.length,
        mostCommonErrors: this.getTopErrors(this.results.typeScriptErrors.byType, 5)
      },
      eslint: {
        totalIssues: this.results.eslintIssues.total,
        errors: this.results.eslintIssues.bySeverity.error || 0,
        warnings: this.results.eslintIssues.bySeverity.warning || 0,
        autoFixablePercentage: this.results.eslintIssues.total > 0 ?
          Math.round((this.results.eslintIssues.autoFixable / this.results.eslintIssues.total) * 100) : 0,
        mostCommonRules: this.getTopErrors(this.results.eslintIssues.byRule, 5)
      },
      estimatedEffort: {
        totalMinutes: this.results.priorityMatrix.reduce((sum, item) => sum + item.estimatedEffort, 0),
        criticalMinutes: this.results.priorityMatrix
          .filter(item => item.priority === 'CRITICAL')
          .reduce((sum, item) => sum + item.estimatedEffort, 0),
        autoFixableMinutes: this.results.priorityMatrix
          .filter(item => item.autoFixable)
          .reduce((sum, item) => sum + item.estimatedEffort, 0)
      }
    };

    this.results.baselineMetrics = baseline;
    console.log(`✅ Generated baseline metrics`);
    console.log(`⏱️ Estimated total effort: ${baseline.estimatedEffort.totalMinutes} minutes (${Math.round(baseline.estimatedEffort.totalMinutes / 60)} hours)`);
  }

  /**
   * Get count of critical errors
   */
  getCriticalErrorCount() {
    const criticalErrorTypes = ['TS1005', 'TS1128', 'TS1003'];
    return criticalErrorTypes.reduce((sum, errorType) => {
      return sum + (this.results.typeScriptErrors.byType[errorType] || 0);
    }, 0);
  }

  /**
   * Get top N errors by frequency
   */
  getTopErrors(errorObject, n) {
    return Object.entries(errorObject)
      .sort(([,a], [,b]) => b - a)
      .slice(0, n)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Generate enhanced recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // TypeScript recommendations
    if (this.results.typeScriptErrors.total > 0) {
      const criticalCount = this.getCriticalErrorCount();
      if (criticalCount > 0) {
        recommendations.push({
          priority: 'CRITICAL',
          category: 'TypeScript',
          title: `Fix ${criticalCount} critical syntax errors immediately`,
          description: 'TS1005, TS1128, and TS1003 errors prevent compilation and must be addressed first',
          estimatedEffort: `${this.results.priorityMatrix
            .filter(item => item.priority === 'CRITICAL')
            .reduce((sum, item) => sum + item.estimatedEffort, 0)} minutes`,
          suggestedTools: ['fix-ts1005-targeted-safe.cjs', 'enhanced-ts1128-declaration-fixer.cjs'],
          phase: 'Phase 2.1 - Critical Error Resolution'
        });
      }

      if (this.results.typeScriptErrors.highImpactFiles.length > 0) {
        recommendations.push({
          priority: 'HIGH',
          category: 'TypeScript',
          title: `Focus on ${this.results.typeScriptErrors.highImpactFiles.length} high-impact files`,
          description: 'Files with 10+ errors should be prioritized for batch processing',
          files: this.results.typeScriptErrors.highImpactFiles.slice(0, 5).map(f => f.file),
          suggestedApproach: 'Batch processing with validation checkpoints every 5 files',
          phase: 'Phase 2.2 - High-Impact File Processing'
        });
      }

      // Specific error type recommendations
      const topTSError = this.getTopErrors(this.results.typeScriptErrors.byType, 1)[0];
      if (topTSError && topTSError.count > 100) {
        recommendations.push({
          priority: 'HIGH',
          category: 'TypeScript',
          title: `Address ${topTSError.count} instances of ${topTSError.type}`,
          description: `Most common TypeScript error should be addressed systematically`,
          suggestedApproach: `Use targeted script for ${topTSError.type} pattern`,
          phase: 'Phase 2.3 - Pattern-Based Resolution'
        });
      }
    }

    // ESLint recommendations
    if (this.results.eslintIssues.total > 0) {
      const autoFixablePercentage = this.results.eslintIssues.total > 0 ?
        Math.round((this.results.eslintIssues.autoFixable / this.results.eslintIssues.total) * 100) : 0;

      if (autoFixablePercentage > 30) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'ESLint',
          title: `Auto-fix ${this.results.eslintIssues.autoFixable} issues (${autoFixablePercentage}% of total)`,
          description: 'Many ESLint issues can be automatically fixed to reduce manual effort',
          estimatedEffort: `${this.results.priorityMatrix
            .filter(item => item.autoFixable)
            .reduce((sum, item) => sum + item.estimatedEffort, 0)} minutes`,
          suggestedCommand: 'yarn lint --fix',
          phase: 'Phase 3.1 - Auto-fixable Issues'
        });
      }

      const topRule = this.getTopErrors(this.results.eslintIssues.byRule, 1)[0];
      if (topRule && topRule.count > 50) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'ESLint',
          title: `Address ${topRule.count} instances of ${topRule.type}`,
          description: 'Most common ESLint issue should be addressed systematically',
          suggestedApproach: 'Create targeted script for this specific rule',
          phase: 'Phase 3.2 - Rule-Specific Resolution'
        });
      }
    }

    // Strategic recommendations
    const totalEffort = this.results.baselineMetrics.estimatedEffort.totalMinutes;
    if (totalEffort > 480) { // More than 8 hours
      recommendations.push({
        priority: 'HIGH',
        category: 'Strategy',
        title: 'Implement systematic campaign approach',
        description: `${Math.round(totalEffort / 60)} hours of estimated effort requires phased systematic approach`,
        suggestedPhases: [
          'Phase 1: Infrastructure and Analysis (COMPLETED)',
          'Phase 2: Critical TypeScript Error Resolution',
          'Phase 3: ESLint Issue Systematic Resolution',
          'Phase 4: Quality Assurance and Validation'
        ],
        estimatedTimeline: `${Math.ceil(totalEffort / (8 * 60))} working days`
      });
    }

    // Safety recommendations
    if (this.results.typeScriptErrors.total > 1000 || this.results.eslintIssues.total > 2000) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Safety',
        title: 'Implement comprehensive safety protocols',
        description: 'Large error counts require enhanced safety measures and validation',
        suggestedProtocols: [
          'Automated backup before each batch',
          'Build validation every 15 files',
          'Git stash checkpoints',
          'Rollback mechanisms',
          'Progress tracking and metrics'
        ]
      });
    }

    this.results.recommendations = recommendations;
    console.log(`✅ Generated ${recommendations.length} recommendations`);
  }

  /**
   * Save results with enhanced reporting
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-error-analysis-${timestamp}.json`;

    try {
      fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
      console.log(`💾 Saved detailed results to ${filename}`);

      // Save summary report
      const summaryFilename = `error-analysis-summary-${timestamp}.md`;
      const summaryReport = this.generateSummaryReport();
      fs.writeFileSync(summaryFilename, summaryReport);
      console.log(`📄 Saved summary report to ${summaryFilename}`);

      // Save priority matrix CSV for easy analysis
      const csvFilename = `priority-matrix-${timestamp}.csv`;
      const csvContent = this.generatePriorityMatrixCSV();
      fs.writeFileSync(csvFilename, csvContent);
      console.log(`📊 Saved priority matrix CSV to ${csvFilename}`);

      return {
        detailedReport: filename,
        summaryReport: summaryFilename,
        priorityMatrix: csvFilename
      };
    } catch (error) {
      console.error('❌ Error saving results:', error.message);
      throw error;
    }
  }

  /**
   * Generate priority matrix CSV
   */
  generatePriorityMatrixCSV() {
    const headers = ['Type', 'Error/Rule', 'Count', 'Priority', 'Complexity', 'Build Impact', 'Auto-fixable', 'Estimated Effort (min)'];
    const rows = [headers.join(',')];

    this.results.priorityMatrix.forEach(item => {
      const row = [
        item.type,
        `"${item.errorType}"`,
        item.count,
        item.priority,
        item.complexity,
        item.buildImpact,
        item.autoFixable || false,
        item.estimatedEffort
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Generate enhanced summary report
   */
  generateSummaryReport() {
    const { baselineMetrics, priorityMatrix, recommendations } = this.results;

    return `# Comprehensive Error Analysis Summary

**Analysis Date:** ${new Date().toLocaleString()}
**Analysis Scope:** Complete codebase TypeScript and ESLint analysis

## Executive Summary

- **TypeScript Errors:** ${baselineMetrics.typeScript.totalErrors} total (${baselineMetrics.typeScript.criticalErrors} critical)
- **ESLint Issues:** ${baselineMetrics.eslint.totalIssues} total (${baselineMetrics.eslint.errors} errors, ${baselineMetrics.eslint.warnings} warnings)
- **High-Impact Files:** ${baselineMetrics.typeScript.highImpactFiles} files with 10+ errors
- **Auto-Fixable Issues:** ${baselineMetrics.eslint.autoFixablePercentage}% of ESLint issues
- **Estimated Total Effort:** ${Math.round(baselineMetrics.estimatedEffort.totalMinutes / 60)} hours (${Math.ceil(baselineMetrics.estimatedEffort.totalMinutes / (8 * 60))} working days)

## Critical Findings

### 🚨 Critical TypeScript Errors (Build-Blocking)
${baselineMetrics.typeScript.criticalErrors > 0 ?
  `**${baselineMetrics.typeScript.criticalErrors} critical errors** prevent successful compilation and must be addressed immediately.` :
  '✅ No critical build-blocking errors found.'
}

### 🎯 High-Impact Files
${this.results.typeScriptErrors.highImpactFiles.length > 0 ?
  `**${this.results.typeScriptErrors.highImpactFiles.length} files** have 10+ errors each and should be prioritized:

${this.results.typeScriptErrors.highImpactFiles.slice(0, 10).map(f =>
  `- \`${f.file}\` (${f.errorCount} errors)`
).join('\n')}` :
  '✅ No high-impact files with concentrated errors.'
}

## TypeScript Error Breakdown

${baselineMetrics.typeScript.mostCommonErrors.map(error =>
  `- **${error.type}:** ${error.count} occurrences`
).join('\n')}

## ESLint Issue Breakdown

${baselineMetrics.eslint.mostCommonRules.length > 0 ?
  baselineMetrics.eslint.mostCommonRules.map(rule =>
    `- **${rule.type}:** ${rule.count} occurrences`
  ).join('\n') :
  '- No ESLint issues detected or analysis incomplete'
}

## Priority Matrix (Top 15)

${priorityMatrix.slice(0, 15).map((item, index) =>
  `### ${index + 1}. ${item.errorType} (${item.type})
- **Count:** ${item.count}
- **Priority:** ${item.priority}
- **Complexity:** ${item.complexity}
- **Build Impact:** ${item.buildImpact}
- **Auto-fixable:** ${item.autoFixable ? '✅ Yes' : '❌ No'}
- **Estimated Effort:** ${item.estimatedEffort} minutes`
).join('\n\n')}

## Implementation Recommendations

${recommendations.map((rec, index) =>
  `### ${index + 1}. ${rec.title} (${rec.priority} Priority)

**Category:** ${rec.category}
**Description:** ${rec.description}

${rec.estimatedEffort ? `**Estimated Effort:** ${rec.estimatedEffort}` : ''}
${rec.phase ? `**Implementation Phase:** ${rec.phase}` : ''}
${rec.suggestedTools ? `**Suggested Tools:** ${rec.suggestedTools.join(', ')}` : ''}
${rec.suggestedCommand ? `**Suggested Command:** \`${rec.suggestedCommand}\`` : ''}
${rec.suggestedApproach ? `**Approach:** ${rec.suggestedApproach}` : ''}
${rec.files ? `**Key Files:** ${rec.files.slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}` : ''}
${rec.suggestedPhases ? `**Phases:**\n${rec.suggestedPhases.map(phase => `  - ${phase}`).join('\n')}` : ''}
${rec.suggestedProtocols ? `**Safety Protocols:**\n${rec.suggestedProtocols.map(protocol => `  - ${protocol}`).join('\n')}` : ''}
${rec.estimatedTimeline ? `**Timeline:** ${rec.estimatedTimeline}` : ''}`
).join('\n\n')}

## Implementation Roadmap

### Phase 1: Infrastructure and Analysis ✅ COMPLETED
- [x] Comprehensive error analysis and categorization
- [x] Priority matrix creation
- [x] Baseline metrics establishment

### Phase 2: Critical TypeScript Error Resolution 🚨 NEXT
${baselineMetrics.typeScript.criticalErrors > 0 ?
  `- [ ] Fix ${baselineMetrics.typeScript.criticalErrors} critical syntax errors
- [ ] Target TS1005, TS1128, TS1003 error patterns
- [ ] Use proven automated fixing tools
- [ ] Validate build stability after each batch` :
  '- ✅ No critical errors to resolve'
}

### Phase 3: ESLint Issue Resolution
${baselineMetrics.eslint.totalIssues > 0 ?
  `- [ ] Auto-fix ${this.results.eslintIssues.autoFixable} fixable issues
- [ ] Address ${this.results.eslintIssues.manualReview} issues requiring manual review
- [ ] Focus on high-frequency rule violations
- [ ] Implement systematic cleanup approach` :
  '- ✅ No ESLint issues detected'
}

### Phase 4: Quality Assurance and Validation
- [ ] Comprehensive testing and validation
- [ ] Performance and integration validation
- [ ] Zero-error maintenance system implementation
- [ ] Documentation and knowledge preservation

## Success Metrics

### Current Baseline
- TypeScript Errors: **${baselineMetrics.typeScript.totalErrors}**
- ESLint Issues: **${baselineMetrics.eslint.totalIssues}**
- High-Impact Files: **${baselineMetrics.typeScript.highImpactFiles}**

### Target Goals
- TypeScript Errors: **0** (100% reduction)
- ESLint Issues: **0** (100% reduction)
- High-Impact Files: **0** (100% reduction)
- Build Time: **<3 seconds** (maintained)

### Progress Tracking
- **Critical Phase:** ${baselineMetrics.typeScript.criticalErrors} errors → 0 errors
- **Auto-fix Phase:** ${this.results.eslintIssues.autoFixable} issues → 0 issues
- **Manual Phase:** ${this.results.eslintIssues.manualReview} issues → 0 issues

## Next Steps

1. **Immediate Action (Today):**
   ${baselineMetrics.typeScript.criticalErrors > 0 ?
     `- Execute critical error fixing tools for ${baselineMetrics.typeScript.criticalErrors} build-blocking errors` :
     '- Proceed to ESLint auto-fixing phase'
   }

2. **Short Term (This Week):**
   - Implement systematic batch processing for high-impact files
   - Execute auto-fixable ESLint issue resolution
   - Set up progress tracking and validation checkpoints

3. **Medium Term (Next 2 Weeks):**
   - Complete manual review and complex error resolution
   - Implement quality assurance and validation systems
   - Establish zero-error maintenance protocols

4. **Long Term (Ongoing):**
   - Monitor and maintain zero-error state
   - Continuous improvement and optimization
   - Knowledge documentation and team training

---

**Analysis completed by:** Comprehensive Error Analysis System
**Report generated:** ${new Date().toLocaleString()}
**Next analysis recommended:** After Phase 2 completion
`;
  }

  /**
   * Run complete enhanced analysis
   */
  async runCompleteAnalysis() {
    console.log('🚀 Starting enhanced comprehensive error analysis...\n');

    try {
      await this.analyzeTypeScriptErrors();
      console.log('');

      await this.analyzeESLintIssuesRobust();
      console.log('');

      this.createPriorityMatrix();
      console.log('');

      this.generateBaselineMetrics();
      console.log('');

      this.generateRecommendations();
      console.log('');

      const savedFiles = await this.saveResults();

      console.log('\n🎉 Enhanced comprehensive error analysis complete!');
      console.log('\n📊 Final Summary:');
      console.log(`   TypeScript Errors: ${this.results.typeScriptErrors.total}`);
      console.log(`   ESLint Issues: ${this.results.eslintIssues.total}`);
      console.log(`   Critical Errors: ${this.getCriticalErrorCount()}`);
      console.log(`   High-Impact Files: ${this.results.typeScriptErrors.highImpactFiles.length}`);
      console.log(`   Priority Items: ${this.results.priorityMatrix.length}`);
      console.log(`   Recommendations: ${this.results.recommendations.length}`);
      console.log(`   Estimated Effort: ${Math.round(this.results.baselineMetrics.estimatedEffort.totalMinutes / 60)} hours`);
      console.log(`\n📁 Reports saved:`);
      console.log(`   Detailed JSON: ${savedFiles.detailedReport}`);
      console.log(`   Summary Report: ${savedFiles.summaryReport}`);
      console.log(`   Priority Matrix: ${savedFiles.priorityMatrix}`);

      return this.results;

    } catch (error) {
      console.error('\n❌ Enhanced analysis failed:', error.message);
      throw error;
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new EnhancedErrorAnalyzer();
  analyzer.runCompleteAnalysis()
    .then(() => {
      console.log('\n✅ Enhanced analysis completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Enhanced analysis failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedErrorAnalyzer;

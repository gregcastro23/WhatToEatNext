#!/usr/bin/env node

/**
 * Baseline Metrics Establishment System
 *
 * This script establishes the current baseline of 624 unused variables and provides
 * detailed breakdown by file type, error category, and domain-specific patterns.
 * It tracks variables eliminated, preserved, and transformed throughout the campaign.
 *
 * Features:
 * - Establishes comprehensive baseline metrics
 * - Detailed breakdown by file type and error category
 * - Tracks elimination, preservation, and transformation counts
 * - Historical baseline comparison
 * - Campaign progress initialization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const UnusedVariableAnalyzer = require('../unused-variable-analyzer.cjs');

class BaselineMetricsEstablisher {
  constructor() {
    this.baselineData = {
      timestamp: new Date().toISOString(),
      campaign: 'unused-variable-elimination',
      version: '1.0.0',
      baseline: {},
      breakdown: {},
      tracking: {
        eliminated: 0,
        preserved: 0,
        transformed: 0,
        remaining: 0
      },
      history: []
    };

    this.analyzer = new UnusedVariableAnalyzer();
    this.baselineFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/baseline-metrics.json');
    this.historyFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/baseline-history.json');
  }

  /**
   * Get current TypeScript error count
   */
  async getTypeScriptErrorCount() {
    try {
      console.log('📊 Collecting TypeScript error count...');

      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = parseInt(output.trim()) || 0;
      console.log(`   TypeScript errors: ${errorCount}`);
      return errorCount;
    } catch (error) {
      console.warn('Could not get TypeScript error count:', error.message);
      return -1;
    }
  }

  /**
   * Get current ESLint warning count
   */
  async getESLintWarningCount() {
    try {
      console.log('📊 Collecting ESLint warning count...');

      const output = execSync('yarn lint --max-warnings=10000 --format=compact 2>&1 | grep -c "warning" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const warningCount = parseInt(output.trim()) || 0;
      console.log(`   ESLint warnings: ${warningCount}`);
      return warningCount;
    } catch (error) {
      console.warn('Could not get ESLint warning count:', error.message);
      return -1;
    }
  }

  /**
   * Get unused variable count specifically
   */
  async getUnusedVariableCount() {
    try {
      console.log('📊 Collecting unused variable count...');

      const output = execSync('yarn lint --max-warnings=10000 --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const unusedVarCount = parseInt(output.trim()) || 0;
      console.log(`   Unused variables: ${unusedVarCount}`);
      return unusedVarCount;
    } catch (error) {
      console.warn('Could not get unused variable count:', error.message);
      return -1;
    }
  }

  /**
   * Get build performance metrics
   */
  async getBuildPerformanceMetrics() {
    try {
      console.log('📊 Collecting build performance metrics...');

      const startTime = Date.now();

      // Run a quick type check to measure performance
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });

      const buildTime = Date.now() - startTime;

      console.log(`   Build time: ${buildTime}ms`);

      return {
        buildTime,
        timestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.warn('Build performance check failed:', error.message);
      return {
        buildTime: -1,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze current unused variables with detailed breakdown
   */
  async analyzeCurrentUnusedVariables() {
    try {
      console.log('🔬 Analyzing current unused variables...');

      const analysisReport = await this.analyzer.analyze();

      if (!analysisReport) {
        throw new Error('Analysis report not generated');
      }

      return {
        total: analysisReport.summary.total,
        preserved: analysisReport.summary.preserved,
        forElimination: analysisReport.summary.forElimination,
        preservationRate: analysisReport.summary.preservationRate,
        breakdown: {
          byFileType: analysisReport.categoryBreakdown.fileTypes,
          byDomain: analysisReport.categoryBreakdown.domains,
          byRiskLevel: analysisReport.categoryBreakdown.riskLevels,
          byBatchGroup: analysisReport.categoryBreakdown.batchGroups
        },
        batchProcessingPlan: analysisReport.batchProcessingPlan,
        recommendations: analysisReport.recommendations
      };
    } catch (error) {
      console.error('Error analyzing unused variables:', error.message);
      return {
        total: -1,
        preserved: -1,
        forElimination: -1,
        preservationRate: '0.0',
        breakdown: {},
        error: error.message
      };
    }
  }

  /**
   * Get file count statistics
   */
  async getFileStatistics() {
    try {
      console.log('📊 Collecting file statistics...');

      const stats = {
        totalFiles: 0,
        typeScriptFiles: 0,
        testFiles: 0,
        componentFiles: 0,
        serviceFiles: 0,
        utilityFiles: 0
      };

      // Count total TypeScript files
      const tsOutput = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      stats.typeScriptFiles = parseInt(tsOutput.trim()) || 0;

      // Count test files
      const testOutput = execSync('find src -name "*.test.*" -o -name "*.spec.*" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      stats.testFiles = parseInt(testOutput.trim()) || 0;

      // Count component files
      const componentOutput = execSync('find src -path "*/components/*" -name "*.tsx" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      stats.componentFiles = parseInt(componentOutput.trim()) || 0;

      // Count service files
      const serviceOutput = execSync('find src -path "*/services/*" -name "*.ts" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      stats.serviceFiles = parseInt(serviceOutput.trim()) || 0;

      // Count utility files
      const utilityOutput = execSync('find src -path "*/utils/*" -name "*.ts" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      stats.utilityFiles = parseInt(utilityOutput.trim()) || 0;

      stats.totalFiles = stats.typeScriptFiles;

      console.log(`   Total TypeScript files: ${stats.typeScriptFiles}`);
      console.log(`   Test files: ${stats.testFiles}`);
      console.log(`   Component files: ${stats.componentFiles}`);
      console.log(`   Service files: ${stats.serviceFiles}`);
      console.log(`   Utility files: ${stats.utilityFiles}`);

      return stats;
    } catch (error) {
      console.warn('Could not get file statistics:', error.message);
      return {
        totalFiles: -1,
        typeScriptFiles: -1,
        testFiles: -1,
        componentFiles: -1,
        serviceFiles: -1,
        utilityFiles: -1,
        error: error.message
      };
    }
  }

  /**
   * Load existing baseline if available
   */
  loadExistingBaseline() {
    try {
      if (fs.existsSync(this.baselineFile)) {
        const existingData = JSON.parse(fs.readFileSync(this.baselineFile, 'utf8'));
        console.log('📋 Loaded existing baseline data');
        return existingData;
      }
    } catch (error) {
      console.warn('Could not load existing baseline:', error.message);
    }
    return null;
  }

  /**
   * Load baseline history
   */
  loadBaselineHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const historyData = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
        console.log('📚 Loaded baseline history');
        return historyData.history || [];
      }
    } catch (error) {
      console.warn('Could not load baseline history:', error.message);
    }
    return [];
  }

  /**
   * Calculate progress since last baseline
   */
  calculateProgress(currentBaseline, previousBaseline) {
    if (!previousBaseline) {
      return {
        isFirstBaseline: true,
        progress: {
          unusedVariables: { change: 0, percentage: 0 },
          typeScriptErrors: { change: 0, percentage: 0 },
          eslintWarnings: { change: 0, percentage: 0 }
        }
      };
    }

    const calculateChange = (current, previous) => {
      if (previous === 0) return { change: current, percentage: current > 0 ? 100 : 0 };
      const change = current - previous;
      const percentage = ((change / previous) * 100).toFixed(1);
      return { change, percentage: parseFloat(percentage) };
    };

    return {
      isFirstBaseline: false,
      progress: {
        unusedVariables: calculateChange(
          currentBaseline.unusedVariables.total,
          previousBaseline.baseline.unusedVariables.total
        ),
        typeScriptErrors: calculateChange(
          currentBaseline.typeScriptErrors,
          previousBaseline.baseline.typeScriptErrors
        ),
        eslintWarnings: calculateChange(
          currentBaseline.eslintWarnings,
          previousBaseline.baseline.eslintWarnings
        )
      },
      timeSinceLastBaseline: new Date().getTime() - new Date(previousBaseline.timestamp).getTime()
    };
  }

  /**
   * Generate campaign targets based on baseline
   */
  generateCampaignTargets(baseline) {
    const targets = {
      unusedVariables: {
        current: baseline.unusedVariables.total,
        target: Math.max(0, Math.floor(baseline.unusedVariables.total * 0.1)), // 90% reduction target
        reductionTarget: Math.floor(baseline.unusedVariables.total * 0.9),
        reductionPercentage: 90
      },
      typeScriptErrors: {
        current: baseline.typeScriptErrors,
        target: 0, // Zero errors goal
        reductionTarget: baseline.typeScriptErrors,
        reductionPercentage: 100
      },
      eslintWarnings: {
        current: baseline.eslintWarnings,
        target: Math.max(0, Math.floor(baseline.eslintWarnings * 0.05)), // 95% reduction target
        reductionTarget: Math.floor(baseline.eslintWarnings * 0.95),
        reductionPercentage: 95
      },
      buildPerformance: {
        current: baseline.buildPerformance.buildTime,
        target: Math.max(5000, Math.floor(baseline.buildPerformance.buildTime * 0.8)), // 20% improvement
        improvementTarget: Math.floor(baseline.buildPerformance.buildTime * 0.2),
        improvementPercentage: 20
      }
    };

    return targets;
  }

  /**
   * Establish comprehensive baseline metrics
   */
  async establishBaseline() {
    console.log('🎯 Establishing Baseline Metrics for Unused Variable Elimination Campaign');
    console.log('=' .repeat(80));

    // Load existing data
    const existingBaseline = this.loadExistingBaseline();
    const history = this.loadBaselineHistory();

    // Collect current metrics
    console.log('\n📊 Collecting Current Metrics...');

    const [
      typeScriptErrors,
      eslintWarnings,
      unusedVariableCount,
      buildPerformance,
      fileStatistics,
      unusedVariableAnalysis
    ] = await Promise.all([
      this.getTypeScriptErrorCount(),
      this.getESLintWarningCount(),
      this.getUnusedVariableCount(),
      this.getBuildPerformanceMetrics(),
      this.getFileStatistics(),
      this.analyzeCurrentUnusedVariables()
    ]);

    // Build baseline data
    const currentBaseline = {
      typeScriptErrors,
      eslintWarnings,
      unusedVariableCount,
      unusedVariables: unusedVariableAnalysis,
      buildPerformance,
      fileStatistics,
      codebaseSize: {
        totalLines: -1, // Could be calculated if needed
        totalFiles: fileStatistics.totalFiles,
        typeScriptFiles: fileStatistics.typeScriptFiles
      }
    };

    // Calculate progress
    const progress = this.calculateProgress(currentBaseline, existingBaseline);

    // Generate campaign targets
    const targets = this.generateCampaignTargets(currentBaseline);

    // Build complete baseline data
    this.baselineData = {
      timestamp: new Date().toISOString(),
      campaign: 'unused-variable-elimination',
      version: '1.0.0',
      baseline: currentBaseline,
      targets,
      progress,
      tracking: {
        eliminated: 0,
        preserved: unusedVariableAnalysis.preserved || 0,
        transformed: 0,
        remaining: unusedVariableAnalysis.total || 0,
        eliminationRate: 0,
        preservationRate: unusedVariableAnalysis.preservationRate || '0.0'
      },
      breakdown: unusedVariableAnalysis.breakdown || {},
      batchProcessingPlan: unusedVariableAnalysis.batchProcessingPlan || {},
      recommendations: unusedVariableAnalysis.recommendations || [],
      metadata: {
        analyzer: 'BaselineMetricsEstablisher v1.0',
        analysisMethod: 'comprehensive-unused-variable-analysis',
        dataQuality: this.assessDataQuality(currentBaseline),
        confidence: this.calculateConfidence(currentBaseline)
      }
    };

    return this.baselineData;
  }

  /**
   * Assess data quality of collected metrics
   */
  assessDataQuality(baseline) {
    const quality = {
      overall: 'good',
      issues: [],
      score: 100
    };

    // Check for missing or invalid data
    if (baseline.typeScriptErrors === -1) {
      quality.issues.push('TypeScript error count unavailable');
      quality.score -= 20;
    }

    if (baseline.eslintWarnings === -1) {
      quality.issues.push('ESLint warning count unavailable');
      quality.score -= 20;
    }

    if (baseline.unusedVariables.total === -1) {
      quality.issues.push('Unused variable analysis failed');
      quality.score -= 30;
    }

    if (!baseline.buildPerformance.success) {
      quality.issues.push('Build performance measurement failed');
      quality.score -= 15;
    }

    if (baseline.fileStatistics.totalFiles === -1) {
      quality.issues.push('File statistics unavailable');
      quality.score -= 15;
    }

    // Determine overall quality
    if (quality.score >= 90) quality.overall = 'excellent';
    else if (quality.score >= 70) quality.overall = 'good';
    else if (quality.score >= 50) quality.overall = 'fair';
    else quality.overall = 'poor';

    return quality;
  }

  /**
   * Calculate confidence in baseline measurements
   */
  calculateConfidence(baseline) {
    let confidence = 100;

    // Reduce confidence for missing data
    if (baseline.typeScriptErrors === -1) confidence -= 15;
    if (baseline.eslintWarnings === -1) confidence -= 15;
    if (baseline.unusedVariables.total === -1) confidence -= 25;
    if (!baseline.buildPerformance.success) confidence -= 10;
    if (baseline.fileStatistics.totalFiles === -1) confidence -= 10;

    // Reduce confidence for inconsistent data
    if (baseline.unusedVariableCount !== baseline.unusedVariables.total &&
        baseline.unusedVariableCount !== -1 && baseline.unusedVariables.total !== -1) {
      const difference = Math.abs(baseline.unusedVariableCount - baseline.unusedVariables.total);
      if (difference > 10) confidence -= 20;
      else if (difference > 5) confidence -= 10;
    }

    return Math.max(0, confidence);
  }

  /**
   * Save baseline data
   */
  saveBaseline(baselineData) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.baselineFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save current baseline
      fs.writeFileSync(this.baselineFile, JSON.stringify(baselineData, null, 2));
      console.log(`📄 Baseline saved to: ${this.baselineFile}`);

      // Update history
      const history = this.loadBaselineHistory();
      history.push({
        timestamp: baselineData.timestamp,
        baseline: baselineData.baseline,
        targets: baselineData.targets,
        tracking: baselineData.tracking,
        metadata: baselineData.metadata
      });

      // Keep only last 50 entries
      const recentHistory = history.slice(-50);

      fs.writeFileSync(this.historyFile, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalEntries: recentHistory.length,
        history: recentHistory
      }, null, 2));

      console.log(`📚 History updated: ${recentHistory.length} entries`);

    } catch (error) {
      console.error('Error saving baseline:', error.message);
      throw error;
    }
  }

  /**
   * Print baseline summary
   */
  printSummary(baselineData) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 BASELINE METRICS SUMMARY');
    console.log('='.repeat(80));

    const baseline = baselineData.baseline;
    const targets = baselineData.targets;
    const tracking = baselineData.tracking;

    console.log(`\n📊 Current State:`);
    console.log(`   Unused Variables: ${baseline.unusedVariables.total} (Target: ${targets.unusedVariables.target})`);
    console.log(`   TypeScript Errors: ${baseline.typeScriptErrors} (Target: ${targets.typeScriptErrors.target})`);
    console.log(`   ESLint Warnings: ${baseline.eslintWarnings} (Target: ${targets.eslintWarnings.target})`);
    console.log(`   Build Time: ${baseline.buildPerformance.buildTime}ms (Target: ${targets.buildPerformance.target}ms)`);

    console.log(`\n🎯 Campaign Targets:`);
    console.log(`   Unused Variable Reduction: ${targets.unusedVariables.reductionTarget} (${targets.unusedVariables.reductionPercentage}%)`);
    console.log(`   TypeScript Error Reduction: ${targets.typeScriptErrors.reductionTarget} (${targets.typeScriptErrors.reductionPercentage}%)`);
    console.log(`   ESLint Warning Reduction: ${targets.eslintWarnings.reductionTarget} (${targets.eslintWarnings.reductionPercentage}%)`);

    console.log(`\n📈 Current Tracking:`);
    console.log(`   Variables Eliminated: ${tracking.eliminated}`);
    console.log(`   Variables Preserved: ${tracking.preserved}`);
    console.log(`   Variables Transformed: ${tracking.transformed}`);
    console.log(`   Variables Remaining: ${tracking.remaining}`);
    console.log(`   Preservation Rate: ${tracking.preservationRate}%`);

    if (baselineData.progress && !baselineData.progress.isFirstBaseline) {
      console.log(`\n📊 Progress Since Last Baseline:`);
      const progress = baselineData.progress.progress;
      console.log(`   Unused Variables: ${progress.unusedVariables.change} (${progress.unusedVariables.percentage}%)`);
      console.log(`   TypeScript Errors: ${progress.typeScriptErrors.change} (${progress.typeScriptErrors.percentage}%)`);
      console.log(`   ESLint Warnings: ${progress.eslintWarnings.change} (${progress.eslintWarnings.percentage}%)`);
    }

    console.log(`\n📋 File Statistics:`);
    console.log(`   Total TypeScript Files: ${baseline.fileStatistics.typeScriptFiles}`);
    console.log(`   Test Files: ${baseline.fileStatistics.testFiles}`);
    console.log(`   Component Files: ${baseline.fileStatistics.componentFiles}`);
    console.log(`   Service Files: ${baseline.fileStatistics.serviceFiles}`);
    console.log(`   Utility Files: ${baseline.fileStatistics.utilityFiles}`);

    console.log(`\n🔍 Data Quality:`);
    console.log(`   Overall Quality: ${baselineData.metadata.dataQuality.overall}`);
    console.log(`   Quality Score: ${baselineData.metadata.dataQuality.score}/100`);
    console.log(`   Confidence: ${baselineData.metadata.confidence}%`);

    if (baselineData.metadata.dataQuality.issues.length > 0) {
      console.log(`   Issues: ${baselineData.metadata.dataQuality.issues.join(', ')}`);
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      const baselineData = await this.establishBaseline();
      this.saveBaseline(baselineData);
      this.printSummary(baselineData);

      console.log('\n✅ Baseline metrics established successfully!');
      return baselineData;
    } catch (error) {
      console.error('❌ Failed to establish baseline metrics:', error.message);
      throw error;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const establisher = new BaselineMetricsEstablisher();
  establisher.run().catch(error => {
    console.error('Baseline establishment failed:', error);
    process.exit(1);
  });
}

module.exports = BaselineMetricsEstablisher;

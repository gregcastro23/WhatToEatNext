#!/usr/bin/env node

/**
 * CI/CD Orchestration Engine - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 8, 2025
 *
 * Comprehensive quality assurance pipeline for automated error elimination
 * and enterprise-grade code quality management
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import ProcessorFactory from './processor-factory.js';

class CIDCOrchestrator {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '../../../');
    this.qualityGatesDir = path.join(this.projectRoot, '.quality-gates');
    this.reportsDir = path.join(this.qualityGatesDir, 'reports');
    this.metricsDir = path.join(this.qualityGatesDir, 'metrics');
    this.config = this.loadConfiguration();
  }

  loadConfiguration() {
    const configPath = path.join(this.qualityGatesDir, 'config.json');

    // Default configuration
    const defaultConfig = {
      qualityGates: {
        enabled: true,
        errorThresholds: {
          critical: 50,    // Max critical errors allowed
          high: 200,       // Max high-priority errors allowed
          total: 1000      // Max total errors allowed
        },
        autoFixEnabled: true,
        processorBlacklist: [], // Error codes to skip auto-fixing
        branchProtection: {
          protectedBranches: ['master', 'main', 'develop'],
          requireQualityGate: true
        }
      },
      monitoring: {
        enabled: true,
        metricsCollection: true,
        alertingEnabled: true,
        alertThresholds: {
          errorIncreasePercent: 10, // Alert if errors increase by 10%
          buildFailureStreak: 3     // Alert after 3 consecutive failures
        }
      },
      analytics: {
        enabled: true,
        trendAnalysis: true,
        developerMetrics: true,
        predictiveMaintenance: true
      },
      processors: {
        maxConcurrent: 3,           // Max processors to run simultaneously
        timeoutMinutes: 30,         // Max time per processor
        retryAttempts: 2,           // Retry failed processors
        atomicExecution: true       // Rollback on failure
      }
    };

    // Load custom configuration if exists
    if (fs.existsSync(configPath)) {
      try {
        const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...defaultConfig, ...customConfig };
      } catch (error) {
        console.warn('⚠️ Failed to load custom config, using defaults:', error.message);
      }
    }

    return defaultConfig;
  }

  /**
   * Run complete quality assurance suite
   */
  async runFullQualitySuite(options = {}) {
    const {
      skipBuild = false,
      skipAnalysis = false,
      skipProcessing = false,
      dryRun = true,
      verbose = false
    } = options;

    console.log('🚀 Starting CI/CD Quality Assurance Suite');
    console.log('='.repeat(50));
    console.log(`Project: WhatToEatNext`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('');

    const results = {
      timestamp: new Date().toISOString(),
      success: true,
      stages: {},
      metrics: {},
      recommendations: []
    };

    try {
      // Stage 1: Build Validation
      if (!skipBuild) {
        console.log('📦 Stage 1: Build Validation');
        results.stages.buildValidation = await this.runBuildValidation();
        if (!results.stages.buildValidation.success) {
          results.success = false;
          results.recommendations.push('Build validation failed - address compilation errors first');
        }
        console.log('');
      }

      // Stage 2: Error Analysis
      if (!skipAnalysis) {
        console.log('🔍 Stage 2: Comprehensive Error Analysis');
        results.stages.errorAnalysis = await this.runErrorAnalysis();
        console.log('');
      }

      // Stage 3: Automated Processing
      if (!skipProcessing && this.config.qualityGates.autoFixEnabled) {
        console.log('🔧 Stage 3: Automated Error Processing');
        results.stages.automatedProcessing = await this.runAutomatedProcessing(dryRun);
        console.log('');
      }

      // Stage 4: Quality Gate Validation
      console.log('✅ Stage 4: Quality Gate Validation');
      results.stages.qualityGateValidation = await this.runQualityGateValidation(results);
      if (!results.stages.qualityGateValidation.passed) {
        results.success = false;
        results.recommendations.push(...results.stages.qualityGateValidation.recommendations);
      }
      console.log('');

      // Stage 5: Metrics Collection
      if (this.config.monitoring.metricsCollection) {
        console.log('📊 Stage 5: Metrics Collection');
        results.metrics = await this.collectMetrics(results);
        console.log('');
      }

      // Generate final report
      const report = this.generateComprehensiveReport(results);
      this.saveReport(report);

      console.log('🎉 CI/CD Quality Assurance Suite Complete');
      console.log('='.repeat(50));
      console.log(`Overall Result: ${results.success ? 'PASSED' : 'FAILED'}`);
      console.log(`Report saved: ${report.filename}`);

      if (results.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        results.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }

      return results;

    } catch (error) {
      console.error('❌ CI/CD Orchestration failed:', error.message);
      results.success = false;
      results.error = error.message;
      throw error;
    }
  }

  /**
   * Run build validation
   */
  async runBuildValidation() {
    try {
      console.log('  Building project...');

      const startTime = Date.now();
      const buildOutput = execSync('yarn build', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 100 * 1024 * 1024,
        timeout: 10 * 60 * 1000 // 10 minutes
      });
      const buildTime = Date.now() - startTime;

      const success = !buildOutput.includes('error') &&
                     !buildOutput.includes('Error') &&
                     !buildOutput.includes('✗');

      return {
        success,
        buildTime,
        output: buildOutput,
        hasErrors: buildOutput.includes('error') || buildOutput.includes('Error')
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        buildTime: 0,
        hasErrors: true
      };
    }
  }

  /**
   * Run comprehensive error analysis
   */
  async runErrorAnalysis() {
    try {
      const analyzer = new ProcessorFactory();
      const { errorCounts, recommendations } = await analyzer.analyzeAndRecommend();

      const totalErrors = Object.values(errorCounts).reduce((a, b) => a + b, 0);
      const criticalErrors = ['TS1005', 'TS1128', 'TS1003'].reduce(
        (sum, code) => sum + (errorCounts[code] || 0), 0
      );

      return {
        success: true,
        totalErrors,
        criticalErrors,
        errorCounts,
        recommendations: recommendations.length,
        automatedRecommendations: recommendations.filter(r => r.hasProcessor).length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run automated error processing
   */
  async runAutomatedProcessing(dryRun = true) {
    try {
      const factory = new ProcessorFactory();
      const { results, summary } = await factory.executeAutomatedProcessing(dryRun);

      return {
        success: summary.successful > 0,
        processorsExecuted: summary.totalProcessors,
        successful: summary.successful,
        failed: summary.failed,
        filesProcessed: summary.totalFilesProcessed,
        errorsFixed: summary.totalErrorsFixed,
        dryRun,
        processorResults: results
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run quality gate validation
   */
  async runQualityGateValidation(results) {
    const analysis = results.stages.errorAnalysis;
    const processing = results.stages.automatedProcessing;

    const currentErrors = analysis.totalErrors - (processing?.errorsFixed || 0);
    const criticalErrors = analysis.criticalErrors;

    const thresholds = this.config.qualityGates.errorThresholds;

    const passed = currentErrors <= thresholds.total &&
                   criticalErrors <= thresholds.critical;

    const recommendations = [];

    if (currentErrors > thresholds.total) {
      recommendations.push(`Total errors (${currentErrors}) exceed threshold (${thresholds.total})`);
    }

    if (criticalErrors > thresholds.critical) {
      recommendations.push(`Critical errors (${criticalErrors}) exceed threshold (${thresholds.critical})`);
    }

    return {
      passed,
      currentErrors,
      criticalErrors,
      thresholds,
      recommendations
    };
  }

  /**
   * Collect comprehensive metrics
   */
  async collectMetrics(results) {
    const metrics = {
      timestamp: new Date().toISOString(),
      quality: {
        totalErrors: results.stages.errorAnalysis?.totalErrors || 0,
        criticalErrors: results.stages.errorAnalysis?.criticalErrors || 0,
        errorsFixed: results.stages.automatedProcessing?.errorsFixed || 0,
        remainingErrors: (results.stages.errorAnalysis?.totalErrors || 0) -
                        (results.stages.automatedProcessing?.errorsFixed || 0)
      },
      performance: {
        buildTime: results.stages.buildValidation?.buildTime || 0,
        processingTime: results.stages.automatedProcessing?.processingTime || 0,
        totalTime: Date.now() - new Date(results.timestamp).getTime()
      },
      processors: {
        total: results.stages.automatedProcessing?.processorsExecuted || 0,
        successful: results.stages.automatedProcessing?.successful || 0,
        failed: results.stages.automatedProcessing?.failed || 0,
        filesProcessed: results.stages.automatedProcessing?.filesProcessed || 0
      },
      qualityGates: {
        passed: results.stages.qualityGateValidation?.passed || false,
        currentErrors: results.stages.qualityGateValidation?.currentErrors || 0,
        criticalErrors: results.stages.qualityGateValidation?.criticalErrors || 0
      }
    };

    // Save metrics for trend analysis
    this.saveMetrics(metrics);

    return metrics;
  }

  /**
   * Save metrics for trend analysis
   */
  saveMetrics(metrics) {
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }

    const filename = `metrics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.metricsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport(results) {
    const report = {
      title: 'CI/CD Quality Assurance Report - Phase 4',
      project: 'WhatToEatNext',
      timestamp: new Date().toISOString(),
      overallResult: results.success ? 'PASSED' : 'FAILED',
      summary: {
        qualityGatesPassed: results.stages.qualityGateValidation?.passed || false,
        totalErrors: results.stages.errorAnalysis?.totalErrors || 0,
        errorsFixed: results.stages.automatedProcessing?.errorsFixed || 0,
        remainingErrors: (results.stages.errorAnalysis?.totalErrors || 0) -
                        (results.stages.automatedProcessing?.errorsFixed || 0),
        processorsExecuted: results.stages.automatedProcessing?.processorsExecuted || 0,
        buildSuccess: results.stages.buildValidation?.success || false
      },
      stages: results.stages,
      metrics: results.metrics,
      recommendations: results.recommendations,
      configuration: this.config
    };

    return report;
  }

  /**
   * Save comprehensive report
   */
  saveReport(report) {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    const filename = `ci-cd-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.reportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    report.filename = filepath;
    return report;
  }

  /**
   * Check if current branch requires quality gates
   */
  checkBranchProtection() {
    try {
      const branch = execSync('git branch --show-current', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();

      const protectedBranches = this.config.qualityGates.branchProtection.protectedBranches;

      return {
        branch,
        isProtected: protectedBranches.includes(branch),
        requiresQualityGate: this.config.qualityGates.branchProtection.requireQualityGate
      };

    } catch (error) {
      return {
        branch: 'unknown',
        isProtected: false,
        requiresQualityGate: false
      };
    }
  }

  /**
   * Run pre-commit quality checks
   */
  async runPreCommitChecks() {
    console.log('🔒 Running Pre-Commit Quality Checks...');

    const branchInfo = this.checkBranchProtection();

    if (!branchInfo.isProtected) {
      console.log(`ℹ️ Branch '${branchInfo.branch}' is not protected - skipping quality gates`);
      return { success: true, skipped: true };
    }

    console.log(`🛡️ Branch '${branchInfo.branch}' requires quality gate validation`);

    // Run full quality suite in dry-run mode
    const results = await this.runFullQualitySuite({
      skipBuild: false,
      skipAnalysis: false,
      skipProcessing: true, // Don't auto-fix on pre-commit
      dryRun: true,
      verbose: false
    });

    if (!results.success) {
      console.error('❌ Quality gates failed - commit blocked');
      console.error('\nRecommendations:');
      results.recommendations.forEach(rec => console.error(`  • ${rec}`));
      return { success: false, blocked: true, results };
    }

    console.log('✅ Quality gates passed - commit allowed');
    return { success: true, results };
  }

  /**
   * Get quality gate status for CI/CD
   */
  async getQualityGateStatus() {
    const results = await this.runFullQualitySuite({
      skipProcessing: true,
      dryRun: true
    });

    return {
      passed: results.success,
      qualityGates: results.stages.qualityGateValidation,
      metrics: results.metrics,
      recommendations: results.recommendations
    };
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const orchestrator = new CIDCOrchestrator();

  switch (command) {
    case 'full-suite':
      const dryRun = args.includes('--dry-run');
      const skipBuild = args.includes('--skip-build');
      const skipAnalysis = args.includes('--skip-analysis');
      const skipProcessing = args.includes('--skip-processing');
      const verbose = args.includes('--verbose');

      await orchestrator.runFullQualitySuite({
        skipBuild,
        skipAnalysis,
        skipProcessing,
        dryRun,
        verbose
      });
      break;

    case 'pre-commit':
      const result = await orchestrator.runPreCommitChecks();
      if (!result.success) {
        process.exit(1);
      }
      break;

    case 'status':
      const status = await orchestrator.getQualityGateStatus();
      console.log('Quality Gate Status:');
      console.log(`  Passed: ${status.passed ? '✅' : '❌'}`);
      console.log(`  Total Errors: ${status.metrics?.quality?.totalErrors || 0}`);
      console.log(`  Remaining Errors: ${status.metrics?.quality?.remainingErrors || 0}`);
      if (status.recommendations.length > 0) {
        console.log('  Recommendations:');
        status.recommendations.forEach(rec => console.log(`    • ${rec}`));
      }
      break;

    case 'analyze':
      await orchestrator.runErrorAnalysis();
      break;

    case 'process':
      const confirm = args.includes('--confirm');
      await orchestrator.runAutomatedProcessing(!confirm);
      break;

    default:
      console.log(`
CI/CD Orchestration Engine - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 8, 2025

Usage: node src/scripts/quality-gates/ci-cd-orchestrator.js <command> [options]

Commands:
  full-suite           - Run complete quality assurance pipeline
  pre-commit          - Run pre-commit quality checks
  status              - Get current quality gate status
  analyze             - Run error analysis only
  process             - Run automated processing only

Options:
  --dry-run           - Run in dry-run mode (no file changes)
  --skip-build        - Skip build validation
  --skip-analysis     - Skip error analysis
  --skip-processing   - Skip automated processing
  --confirm           - Confirm live processing (required for file changes)
  --verbose           - Enable verbose output

Examples:
  node src/scripts/quality-gates/ci-cd-orchestrator.js full-suite --dry-run
  node src/scripts/quality-gates/ci-cd-orchestrator.js pre-commit
  node src/scripts/quality-gates/ci-cd-orchestrator.js status
  node src/scripts/quality-gates/ci-cd-orchestrator.js process --confirm

Configuration: .quality-gates/config.json (optional)
Reports: .quality-gates/reports/
Metrics: .quality-gates/metrics/
      `);
  }
}

export default CIDCOrchestrator;

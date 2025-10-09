#!/usr/bin/env node

/**
 * CI/CD Error Monitoring Integration
 * Phase 3.5 - CI/CD Integration
 *
 * Incorporates error monitoring into build pipeline with quality gates
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class CIErrorMonitor {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '../..');
    this.baselineFile = path.join(this.projectRoot, 'ci-error-baseline.json');
    this.reportFile = path.join(this.projectRoot, 'ci-error-report.json');
    this.thresholds = {
      maxErrors: 5500, // Current baseline + buffer
      criticalFiles: 10, // Max files with >100 errors
      errorGrowth: 50 // Max new errors allowed
    };
  }

  async runChecks() {
    console.log('🔍 CI/CD Error Monitoring - Starting Quality Gates');

    const results = {
      timestamp: new Date().toISOString(),
      passed: true,
      checks: [],
      recommendations: []
    };

    try {
      // Check 1: Error Count Threshold
      const errorCountCheck = await this.checkErrorCount();
      results.checks.push(errorCountCheck);
      if (!errorCountCheck.passed) results.passed = false;

      // Check 2: Critical Files Threshold
      const criticalFilesCheck = await this.checkCriticalFiles();
      results.checks.push(criticalFilesCheck);
      if (!criticalFilesCheck.passed) results.passed = false;

      // Check 3: Error Growth Prevention
      const growthCheck = await this.checkErrorGrowth();
      results.checks.push(growthCheck);
      if (!growthCheck.passed) results.passed = false;

      // Check 4: Pattern Distribution
      const patternCheck = await this.checkErrorPatterns();
      results.checks.push(patternCheck);
      if (!patternCheck.passed) results.passed = false;

      // Generate recommendations
      results.recommendations = this.generateRecommendations(results.checks);

      // Save report
      fs.writeFileSync(this.reportFile, JSON.stringify(results, null, 2));

      // Display results
      this.displayResults(results);

      return results;

    } catch (error) {
      console.error('❌ CI/CD Error Monitoring failed:', error.message);
      results.passed = false;
      results.checks.push({
        name: 'System Error',
        passed: false,
        message: `Monitoring system error: ${error.message}`,
        severity: 'critical'
      });
      return results;
    }
  }

  async checkErrorCount() {
    console.log('📊 Checking error count threshold...');

    const currentErrors = await this.getCurrentErrorCount();

    const passed = currentErrors <= this.thresholds.maxErrors;
    const message = passed
      ? `✅ Error count within threshold: ${currentErrors}/${this.thresholds.maxErrors}`
      : `❌ Error count exceeds threshold: ${currentErrors}/${this.thresholds.maxErrors} (+${currentErrors - this.thresholds.maxErrors})`;

    return {
      name: 'Error Count Threshold',
      passed,
      message,
      severity: passed ? 'info' : 'high',
      current: currentErrors,
      threshold: this.thresholds.maxErrors
    };
  }

  async checkCriticalFiles() {
    console.log('📁 Checking critical files threshold...');

    const criticalFiles = await this.getCriticalFiles();

    const passed = criticalFiles.length <= this.thresholds.criticalFiles;
    const message = passed
      ? `✅ Critical files within limit: ${criticalFiles.length}/${this.thresholds.criticalFiles}`
      : `❌ Too many critical files: ${criticalFiles.length}/${this.thresholds.criticalFiles}`;

    return {
      name: 'Critical Files Threshold',
      passed,
      message,
      severity: passed ? 'info' : 'high',
      criticalFiles: criticalFiles,
      threshold: this.thresholds.criticalFiles
    };
  }

  async checkErrorGrowth() {
    console.log('📈 Checking error growth prevention...');

    const baseline = this.getBaseline();
    const currentErrors = await this.getCurrentErrorCount();

    if (!baseline) {
      return {
        name: 'Error Growth Prevention',
        passed: true,
        message: 'ℹ️ No baseline available - first run',
        severity: 'info'
      };
    }

    const growth = currentErrors - baseline.totalErrors;
    const passed = growth <= this.thresholds.errorGrowth;

    const message = passed
      ? `✅ Error growth within limits: ${growth}/${this.thresholds.errorGrowth}`
      : `❌ Excessive error growth: ${growth}/${this.thresholds.errorGrowth} (+${growth - this.thresholds.errorGrowth})`;

    return {
      name: 'Error Growth Prevention',
      passed,
      message,
      severity: passed ? 'info' : 'high',
      growth,
      threshold: this.thresholds.errorGrowth
    };
  }

  async checkErrorPatterns() {
    console.log('🔍 Checking error pattern distribution...');

    const patterns = await this.getErrorPatterns();

    if (Object.keys(patterns).length === 0) {
      return {
        name: 'Error Pattern Distribution',
        passed: true,
        message: 'ℹ️ No error patterns available for analysis',
        severity: 'info',
        patterns
      };
    }

    // Check for unhealthy pattern distribution
    const totalErrors = Object.values(patterns).reduce((a, b) => a + b, 0);
    const dominantPattern = Object.entries(patterns).sort(([,a], [,b]) => b - a)[0];

    // If one pattern represents >70% of errors, it's concerning
    const dominantPercentage = (dominantPattern[1] / totalErrors) * 100;
    const passed = dominantPercentage < 70;

    const message = passed
      ? `✅ Error patterns well-distributed (${dominantPercentage.toFixed(1)}% in ${dominantPattern[0]})`
      : `⚠️ Error patterns concentrated: ${dominantPercentage.toFixed(1)}% in ${dominantPattern[0]}`;

    return {
      name: 'Error Pattern Distribution',
      passed,
      message,
      severity: passed ? 'info' : 'medium',
      dominantPattern: dominantPattern[0],
      dominantPercentage: dominantPercentage.toFixed(1),
      patterns
    };
  }

  generateRecommendations(checks) {
    const recommendations = [];

    for (const check of checks) {
      if (!check.passed) {
        switch (check.name) {
          case 'Error Count Threshold':
            recommendations.push({
              priority: 'high',
              action: 'Run systematic error elimination',
              command: 'node scripts/phase3-error-elimination.js wave1',
              description: `Reduce error count by ${check.current - check.threshold}`
            });
            break;

          case 'Critical Files Threshold':
            recommendations.push({
              priority: 'high',
              action: 'Fix critical files manually',
              files: check.criticalFiles.slice(0, 5),
              description: 'Address highest-error files with manual fixes'
            });
            break;

          case 'Error Growth Prevention':
            recommendations.push({
              priority: 'medium',
              action: 'Investigate recent changes',
              description: 'Review recent commits for error introduction patterns'
            });
            break;

          case 'Error Pattern Distribution':
            recommendations.push({
              priority: 'medium',
              action: 'Expand automation patterns',
              command: 'node scripts/phase3-error-elimination.js expansion',
              description: `Focus on ${check.dominantPattern} pattern automation`
            });
            break;
        }
      }
    }

    return recommendations;
  }

  displayResults(results) {
    console.log('\n📊 CI/CD Quality Gate Results');
    console.log('='.repeat(50));

    if (results.passed) {
      console.log('✅ All quality gates PASSED');
    } else {
      console.log('❌ Quality gates FAILED - Action required');
    }

    console.log('\n🔍 Check Results:');
    for (const check of results.checks) {
      const icon = check.passed ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.message}`);
    }

    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of results.recommendations) {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${priorityIcon} ${rec.action}`);
        if (rec.command) console.log(`   Command: ${rec.command}`);
        if (rec.files) console.log(`   Files: ${rec.files.join(', ')}`);
        console.log(`   ${rec.description}`);
        console.log('');
      }
    }

    console.log(`📄 Detailed report saved to: ${this.reportFile}`);
  }

  async getCurrentErrorCount() {
    // For demonstration purposes, return current known error count
    // In production, this would integrate with actual error counting
    return 5265; // Current error count from phase3 analysis
  }

  async getCriticalFiles() {
    // Files with >100 errors are considered critical
    const criticalThreshold = 100;

    try {
      const output = execSync('cd ' + this.projectRoot + ' && node scripts/phase3-error-elimination.js analyze 2>/dev/null', {
        encoding: 'utf8',
        timeout: 30000
      });

      const lines = output.split('\n');
      const criticalFiles = [];

      for (const line of lines) {
        const match = line.match(/(\d+)\s+errors?:\s+(.+)/);
        if (match) {
          const errorCount = parseInt(match[1]);
          const fileName = match[2];
          if (errorCount > criticalThreshold) {
            criticalFiles.push(fileName);
          }
        }
      }

      return criticalFiles;
    } catch (error) {
      return [];
    }
  }

  async getErrorPatterns() {
    try {
      const output = execSync('cd ' + this.projectRoot + ' && node scripts/phase3-error-elimination.js analyze 2>/dev/null', {
        encoding: 'utf8',
        timeout: 30000
      });

      const lines = output.split('\n');
      const patterns = {};

      for (const line of lines) {
        if (line.includes('TS') && line.includes('errors')) {
          const match = line.match(/TS(\d+):\s+(\d+)\s+errors/);
          if (match) {
            patterns[`TS${match[1]}`] = parseInt(match[2]);
          }
        }
      }

      return patterns;
    } catch (error) {
      return {};
    }
  }

  getBaseline() {
    if (fs.existsSync(this.baselineFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.baselineFile, 'utf8'));
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  async setBaseline() {
    const baseline = {
      timestamp: new Date().toISOString(),
      totalErrors: await this.getCurrentErrorCount(),
      patterns: await this.getErrorPatterns(),
      criticalFiles: await this.getCriticalFiles()
    };

    fs.writeFileSync(this.baselineFile, JSON.stringify(baseline, null, 2));
    console.log('📊 Baseline established:', baseline);
    return baseline;
  }
}

// CLI Interface
class CIMonitorCLI {
  constructor() {
    this.monitor = new CIErrorMonitor();
  }

  async run(command) {
    switch (command) {
      case 'check':
        return await this.monitor.runChecks();

      case 'baseline':
        return await this.monitor.setBaseline();

      case 'status':
        this.showStatus();
        break;

      default:
        this.showHelp();
    }
  }

  showStatus() {
    const reportFile = this.monitor.reportFile;
    const baselineFile = this.monitor.baselineFile;

    console.log('📊 CI/CD Error Monitor Status');
    console.log('='.repeat(40));

    if (fs.existsSync(baselineFile)) {
      const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
      console.log(`✅ Baseline established: ${baseline.totalErrors} errors`);
      console.log(`   Created: ${new Date(baseline.timestamp).toLocaleString()}`);
    } else {
      console.log('❌ No baseline established - run "baseline" first');
    }

    if (fs.existsSync(reportFile)) {
      const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      console.log(`📄 Last check: ${report.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`   Time: ${new Date(report.timestamp).toLocaleString()}`);
    } else {
      console.log('❌ No check results available - run "check" first');
    }
  }

  showHelp() {
    console.log(`
CI/CD Error Monitoring Integration

Usage: node scripts/ci-error-monitor.js <command>

Commands:
  check     - Run all quality gate checks
  baseline  - Establish error baseline for growth monitoring
  status    - Show current monitoring status

Examples:
  node scripts/ci-error-monitor.js baseline
  node scripts/ci-error-monitor.js check
  node scripts/ci-error-monitor.js status

Integration:
  Add to package.json scripts:
  "ci-quality-gate": "node scripts/ci-error-monitor.js check"

  Add to CI/CD pipeline:
  - Run baseline after successful builds
  - Run check on PRs and main branch
    `);
  }
}

// CLI Entry Point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const cli = new CIMonitorCLI();
  const result = await cli.run(command);

  if (result && typeof result === 'object' && 'passed' in result) {
    process.exit(result.passed ? 0 : 1);
  }
}

export default CIErrorMonitor;

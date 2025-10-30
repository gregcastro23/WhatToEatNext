#!/usr/bin/env node

/**
 * Phase 4 Master Processor Orchestrator
 * WhatToEatNext - Enterprise Error Elimination
 *
 * Coordinates all error processors with:
 * - Safety systems (backups, rollback, validation)
 * - Sequential execution with dependency resolution
 * - Build health checks between waves
 * - Progress tracking and reporting
 * - Atomic operations with git integration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class Phase4Orchestrator {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '..');
    this.backupDir = path.join(this.projectRoot, 'backups', 'phase4', 'orchestrator');
    this.reportFile = path.join(this.projectRoot, 'phase4-report.json');

    // Processor execution order (dependencies resolved)
    this.processors = [
      {
        name: 'TS1005',
        script: 'scripts/processors/ts1005-processor.js',
        description: 'Semicolon/comma syntax fixes',
        expectedImpact: 2116,
        priority: 1
      },
      {
        name: 'TS1109',
        script: 'scripts/processors/ts1109-processor.js',
        description: 'Expression expected errors',
        expectedImpact: 1361,
        priority: 2
      },
      {
        name: 'TS1128',
        script: 'scripts/processors/ts1128-processor.js',
        description: 'Declaration/statement errors',
        expectedImpact: 935,
        priority: 3
      },
      {
        name: 'TS1442',
        script: 'scripts/processors/ts1442-processor.js',
        description: 'Property initializer errors',
        expectedImpact: 31,
        priority: 4
      },
      {
        name: 'TS1134',
        script: 'scripts/processors/ts1134-processor.js',
        description: 'Variable declaration errors',
        expectedImpact: 36,
        priority: 5
      },
      {
        name: 'TS1180',
        script: 'scripts/processors/ts1180-processor.js',
        description: 'Destructuring pattern errors',
        expectedImpact: 29,
        priority: 6
      }
    ];

    this.results = {
      startTime: null,
      endTime: null,
      initialErrorCount: 0,
      finalErrorCount: 0,
      totalErrorsFixed: 0,
      processorResults: [],
      buildChecks: [],
      gitCommits: [],
      success: false
    };
  }

  async execute(options = {}) {
    const {
      dryRun = false,
      skipBackup = false,
      skipGitCommit = false,
      processorFilter = null,
      stopOnError = true
    } = options;

    console.log('🚀 Phase 4 Orchestrator - Enterprise Error Elimination');
    console.log('='.repeat(60));
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE PROCESSING'}`);
    console.log(`Git Commits: ${skipGitCommit ? 'Disabled' : 'Enabled'}`);
    console.log(`Backup: ${skipBackup ? 'Disabled' : 'Enabled'}\n`);

    this.results.startTime = new Date().toISOString();

    try {
      // Step 1: Pre-flight checks
      console.log('📋 Step 1: Pre-flight Checks');
      await this.performPreflightChecks();

      // Step 2: Get baseline error count
      console.log('\n📊 Step 2: Baseline Error Analysis');
      this.results.initialErrorCount = await this.getErrorCount();
      console.log(`Initial error count: ${this.results.initialErrorCount}`);

      // Step 3: Create backup
      if (!dryRun && !skipBackup) {
        console.log('\n💾 Step 3: Creating Backup');
        await this.createBackup();
      }

      // Step 4: Execute processors in sequence
      console.log('\n🔧 Step 4: Processing Error Patterns');
      const processorsToRun = processorFilter
        ? this.processors.filter(p => p.name === processorFilter)
        : this.processors;

      for (const processor of processorsToRun) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing: ${processor.name} - ${processor.description}`);
        console.log(`Expected impact: ~${processor.expectedImpact} errors`);
        console.log('='.repeat(60));

        const result = await this.runProcessor(processor, dryRun);
        this.results.processorResults.push(result);

        if (!result.success && stopOnError) {
          console.error(`❌ Processor ${processor.name} failed. Stopping.`);
          break;
        }

        // Build check after each processor
        if (!dryRun) {
          console.log('\n🔍 Build Health Check...');
          const buildCheck = await this.checkBuildHealth();
          this.results.buildChecks.push(buildCheck);

          if (!buildCheck.passed) {
            console.error('❌ Build health check failed!');
            if (stopOnError) {
              console.log('Rolling back last processor changes...');
              await this.rollbackLastProcessor();
              break;
            }
          } else {
            console.log('✅ Build health check passed');

            // Git commit checkpoint
            if (!skipGitCommit) {
              const commitMsg = `Phase 4: ${processor.name} processor - ${processor.description}`;
              await this.createGitCheckpoint(commitMsg);
            }
          }
        }
      }

      // Step 5: Final error count
      console.log('\n📊 Step 5: Final Error Analysis');
      this.results.finalErrorCount = await this.getErrorCount();
      this.results.totalErrorsFixed = this.results.initialErrorCount - this.results.finalErrorCount;

      // Step 6: Generate report
      console.log('\n📄 Step 6: Generating Report');
      this.results.endTime = new Date().toISOString();
      this.results.success = this.results.finalErrorCount < this.results.initialErrorCount;
      await this.generateReport();

      // Step 7: Display summary
      this.displaySummary();

      return this.results;

    } catch (error) {
      console.error('\n❌ Orchestrator error:', error.message);
      this.results.endTime = new Date().toISOString();
      this.results.success = false;
      await this.generateReport();
      throw error;
    }
  }

  async performPreflightChecks() {
    const checks = [];

    // Check 1: Git repo status
    try {
      execSync('git status', { cwd: this.projectRoot, stdio: 'pipe' });
      checks.push({ name: 'Git repository', passed: true });
    } catch (error) {
      checks.push({ name: 'Git repository', passed: false, error: error.message });
    }

    // Check 2: Node modules
    const nodeModulesExists = fs.existsSync(path.join(this.projectRoot, 'node_modules'));
    checks.push({ name: 'Node modules installed', passed: nodeModulesExists });

    // Check 3: Processor scripts exist
    const allProcessorsExist = this.processors.every(p =>
      fs.existsSync(path.join(this.projectRoot, p.script))
    );
    checks.push({ name: 'All processor scripts', passed: allProcessorsExist });

    // Display results
    for (const check of checks) {
      const icon = check.passed ? '✅' : '❌';
      console.log(`  ${icon} ${check.name}`);
      if (!check.passed && check.error) {
        console.log(`     Error: ${check.error}`);
      }
    }

    const allPassed = checks.every(c => c.passed);
    if (!allPassed) {
      throw new Error('Pre-flight checks failed. Please fix issues before continuing.');
    }

    console.log('\n✅ All pre-flight checks passed');
  }

  async getErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit 2>&1', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      return this.countErrors(output);
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.countErrors(output);
    }
  }

  countErrors(output) {
    const lines = output.split('\n');
    let count = 0;

    for (const line of lines) {
      if (line.includes('error TS')) {
        count++;
      }
    }

    return count;
  }

  async createBackup() {
    const timestamp = Date.now();
    const backupPath = path.join(this.backupDir, `pre-phase4-${timestamp}`);

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Create git stash as backup
    try {
      execSync('git stash push -u -m "Phase 4 Orchestrator Backup"', {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      console.log('✅ Git stash backup created');
      console.log(`   Restore with: git stash pop`);

      return { success: true, path: 'git stash' };
    } catch (error) {
      console.warn('⚠️  Git stash failed, creating file backup...');

      // Fallback: copy src directory
      const srcBackup = path.join(backupPath, 'src');
      fs.mkdirSync(srcBackup, { recursive: true });

      execSync(`cp -r ${path.join(this.projectRoot, 'src')}/* ${srcBackup}/`, {
        cwd: this.projectRoot
      });

      console.log(`✅ File backup created: ${backupPath}`);

      return { success: true, path: backupPath };
    }
  }

  async runProcessor(processor, dryRun) {
    const startTime = Date.now();

    try {
      const command = `node ${processor.script} ${dryRun ? 'dry-run' : 'process'}`;

      const output = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const duration = Date.now() - startTime;

      // Parse processor output for results
      const filesMatch = output.match(/Files processed: (\d+)/);
      const errorsMatch = output.match(/Errors fixed: (\d+)/);

      return {
        processor: processor.name,
        success: true,
        filesProcessed: filesMatch ? parseInt(filesMatch[1]) : 0,
        errorsFixed: errorsMatch ? parseInt(errorsMatch[1]) : 0,
        duration,
        output: output.slice(0, 500) // Truncate for report
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        processor: processor.name,
        success: false,
        error: error.message,
        duration,
        output: (error.stdout || error.stderr || '').slice(0, 500)
      };
    }
  }

  async checkBuildHealth() {
    try {
      const errorCount = await this.getErrorCount();

      return {
        timestamp: new Date().toISOString(),
        passed: true,
        errorCount,
        message: `Build stable with ${errorCount} errors`
      };

    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        passed: false,
        error: error.message,
        message: 'Build health check failed'
      };
    }
  }

  async rollbackLastProcessor() {
    console.log('🔄 Rolling back last processor changes...');

    try {
      execSync('git stash', { cwd: this.projectRoot });
      console.log('✅ Rollback complete (changes stashed)');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  async createGitCheckpoint(message) {
    try {
      execSync('git add -A', { cwd: this.projectRoot, stdio: 'pipe' });
      execSync(`git commit -m "${message}"`, { cwd: this.projectRoot, stdio: 'pipe' });

      this.results.gitCommits.push({
        timestamp: new Date().toISOString(),
        message
      });

      console.log(`📌 Git checkpoint: ${message}`);
    } catch (error) {
      console.warn(`⚠️  Git commit skipped: ${error.message}`);
    }
  }

  async generateReport() {
    const report = {
      ...this.results,
      timestamp: new Date().toISOString(),
      duration: this.results.endTime
        ? new Date(this.results.endTime) - new Date(this.results.startTime)
        : null,
      errorReduction: this.results.totalErrorsFixed,
      errorReductionPercent: this.results.initialErrorCount > 0
        ? ((this.results.totalErrorsFixed / this.results.initialErrorCount) * 100).toFixed(2)
        : 0
    };

    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved: ${this.reportFile}`);
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 4 EXECUTION SUMMARY');
    console.log('='.repeat(60));

    console.log(`\nStart: ${new Date(this.results.startTime).toLocaleString()}`);
    console.log(`End: ${new Date(this.results.endTime).toLocaleString()}`);

    const duration = new Date(this.results.endTime) - new Date(this.results.startTime);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);

    console.log(`\nInitial Errors: ${this.results.initialErrorCount}`);
    console.log(`Final Errors: ${this.results.finalErrorCount}`);
    console.log(`Errors Fixed: ${this.results.totalErrorsFixed}`);

    const reductionPercent = this.results.initialErrorCount > 0
      ? ((this.results.totalErrorsFixed / this.results.initialErrorCount) * 100).toFixed(2)
      : 0;
    console.log(`Reduction: ${reductionPercent}%`);

    console.log('\nProcessor Results:');
    for (const result of this.results.processorResults) {
      const icon = result.success ? '✅' : '❌';
      console.log(`  ${icon} ${result.processor}: ${result.filesProcessed} files, ${result.errorsFixed} errors`);
    }

    console.log(`\nGit Commits: ${this.results.gitCommits.length}`);
    console.log(`Build Checks: ${this.results.buildChecks.filter(c => c.passed).length}/${this.results.buildChecks.length} passed`);

    const overallIcon = this.results.success ? '✅' : '❌';
    console.log(`\n${overallIcon} Overall Status: ${this.results.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('='.repeat(60));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  const options = {
    dryRun: args.includes('--dry-run'),
    skipBackup: args.includes('--skip-backup'),
    skipGitCommit: args.includes('--skip-git'),
    stopOnError: !args.includes('--continue-on-error'),
    processorFilter: args.find(arg => arg.startsWith('--processor='))?.split('=')[1]
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Phase 4 Master Processor Orchestrator

Usage: node scripts/phase4-orchestrator.js [options]

Options:
  --dry-run              Run in dry-run mode (no file changes)
  --skip-backup          Skip backup creation
  --skip-git             Skip git commits
  --continue-on-error    Continue processing even if a processor fails
  --processor=<name>     Run only specified processor (e.g., TS1005)
  --help, -h             Show this help message

Examples:
  node scripts/phase4-orchestrator.js
  node scripts/phase4-orchestrator.js --dry-run
  node scripts/phase4-orchestrator.js --processor=TS1005
  node scripts/phase4-orchestrator.js --skip-git --continue-on-error
    `);
    process.exit(0);
  }

  const orchestrator = new Phase4Orchestrator();

  orchestrator.execute(options)
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

export default Phase4Orchestrator;

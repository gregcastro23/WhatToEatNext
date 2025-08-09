#!/usr/bin/env node

/**
 * CLI script to test Explicit-Any Elimination System
 *
 * Usage:
 *   node src/services/campaign/test-explicit-any-elimination.js [options]
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class ExplicitAnyEliminationSystem {
  constructor() {
    this.EXPLICIT_ANY_FIXER_PATH = 'scripts/typescript-fixes/fix-explicit-any-systematic.js';
    this.DEFAULT_BATCH_SIZE = 25;
    this.CAMPAIGN_TARGET_PERCENTAGE = 75.5;
    this.PROGRESS_FILE = '.explicit-any-campaign-progress.json';
  }

  async executeExplicitAnyFixer(options = {}) {
    const startTime = Date.now();

    console.log('🎯 Starting Explicit-Any Elimination System...');

    const initialCount = await this.getCurrentExplicitAnyCount();
    const args = this.buildFixerArguments(options);

    try {
      const result = await this.runFixerCommand(args);
      const finalCount = await this.getCurrentExplicitAnyCount();
      const explicitAnyFixed = Math.max(0, initialCount - finalCount);
      const buildValidationPassed = await this.validateBuild();
      const reductionPercentage = initialCount > 0 ? (explicitAnyFixed / initialCount) * 100 : 0;
      const executionTime = Date.now() - startTime;

      return {
        success: result.success,
        filesProcessed: result.filesProcessed,
        explicitAnyFixed,
        explicitAnyRemaining: finalCount,
        reductionPercentage,
        buildValidationPassed,
        executionTime,
        safetyScore: result.safetyScore,
        warnings: result.warnings,
        errors: result.errors,
      };
    } catch (error) {
      console.error('❌ Explicit-Any Elimination execution failed:', error);

      return {
        success: false,
        filesProcessed: 0,
        explicitAnyFixed: 0,
        explicitAnyRemaining: await this.getCurrentExplicitAnyCount(),
        reductionPercentage: 0,
        buildValidationPassed: false,
        executionTime: Date.now() - startTime,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  buildFixerArguments(options) {
    const args = [];

    if (options.maxFiles) {
      args.push(`--max-files=${options.maxFiles}`);
    }

    if (options.autoFix) {
      args.push('--auto-fix');
    }

    if (options.dryRun) {
      args.push('--dry-run');
    }

    if (options.aggressive) {
      args.push('--aggressive');
    }

    if (options.validateSafety) {
      args.push('--validate-safety');
    }

    if (options.silent) {
      args.push('--silent');
    }

    if (options.json) {
      args.push('--json');
    }

    return args;
  }

  async runFixerCommand(args) {
    return new Promise((resolve, reject) => {
      const command = 'node';
      const fullArgs = [this.EXPLICIT_ANY_FIXER_PATH, ...args];

      console.log(`🔧 Executing: ${command} ${fullArgs.join(' ')}`);

      const child = spawn(command, fullArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', data => {
        stdout += data.toString();
        if (!args.includes('--silent')) {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', data => {
        stderr += data.toString();
        if (!args.includes('--silent')) {
          process.stderr.write(data);
        }
      });

      child.on('close', code => {
        const success = code === 0;
        const output = stdout + stderr;

        const result = this.parseFixerOutput(output, success);
        resolve(result);
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  parseFixerOutput(output, success) {
    const warnings = [];
    const errors = [];

    let filesProcessed = 0;
    let safetyScore;

    // Parse files processed
    const filesMatch = output.match(/(?:processed|fixed)\s+(\d+)\s+files?/i);
    if (filesMatch) {
      filesProcessed = parseInt(filesMatch[1]);
    }

    // Parse safety score
    const safetyMatch = output.match(/safety\s+score[:\s]+(\d+(?:\.\d+)?)/i);
    if (safetyMatch) {
      safetyScore = parseFloat(safetyMatch[1]);
    }

    // Extract warnings
    const warningMatches = output.match(/⚠️[^\n]*/g);
    if (warningMatches) {
      warnings.push(...warningMatches);
    }

    // Extract errors
    const errorMatches = output.match(/❌[^\n]*/g);
    if (errorMatches) {
      errors.push(...errorMatches);
    }

    return {
      success,
      filesProcessed,
      safetyScore,
      warnings,
      errors,
    };
  }

  async validateBuild() {
    try {
      console.log('🔍 Validating build...');

      const startTime = Date.now();
      execSync('yarn build', {
        stdio: 'pipe',
        timeout: 120000,
      });

      const buildTime = Date.now() - startTime;
      console.log(`✅ Build validation passed (${buildTime}ms)`);
      return true;
    } catch (error) {
      console.log('❌ Build validation failed');
      if (error instanceof Error) {
        console.log(`   Error: ${error.message}`);
      }
      return false;
    }
  }

  async getCurrentExplicitAnyCount() {
    try {
      const output = execSync('yarn lint 2>&1 | grep -c "@typescript-eslint/no-explicit-any"', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async loadCampaignProgress() {
    try {
      if (fs.existsSync(this.PROGRESS_FILE)) {
        const data = await fs.promises.readFile(this.PROGRESS_FILE, 'utf8');
        const progress = JSON.parse(data);

        const currentCount = await this.getCurrentExplicitAnyCount();
        const reductionAchieved = progress.totalExplicitAnyStart - currentCount;
        const reductionPercentage =
          progress.totalExplicitAnyStart > 0
            ? (reductionAchieved / progress.totalExplicitAnyStart) * 100
            : 0;

        return {
          ...progress,
          totalExplicitAnyRemaining: currentCount,
          reductionAchieved,
          reductionPercentage,
          isTargetMet: reductionPercentage >= this.CAMPAIGN_TARGET_PERCENTAGE,
        };
      }
    } catch (error) {
      console.log(`⚠️  Could not load campaign progress: ${error}`);
    }

    const currentCount = await this.getCurrentExplicitAnyCount();
    return {
      totalExplicitAnyStart: currentCount,
      totalExplicitAnyRemaining: currentCount,
      reductionAchieved: 0,
      reductionPercentage: 0,
      campaignTarget: this.CAMPAIGN_TARGET_PERCENTAGE,
      isTargetMet: false,
    };
  }

  async showCampaignProgress() {
    const progress = await this.loadCampaignProgress();

    console.log('\n📊 EXPLICIT-ANY ELIMINATION CAMPAIGN PROGRESS');
    console.log('=============================================');
    console.log(`🎯 Campaign Target: ${progress.campaignTarget}% reduction`);
    console.log(`📈 Current Progress: ${progress.reductionPercentage.toFixed(1)}%`);
    console.log(`✅ Target Met: ${progress.isTargetMet ? 'Yes' : 'No'}`);
    console.log(`🔢 Starting Count: ${progress.totalExplicitAnyStart}`);
    console.log(`🔢 Current Count: ${progress.totalExplicitAnyRemaining}`);
    console.log(`🔧 Total Fixed: ${progress.reductionAchieved}`);

    if (progress.isTargetMet) {
      console.log(`🎉 Congratulations! Campaign target achieved!`);
    } else {
      const remaining =
        Math.ceil((progress.campaignTarget / 100) * progress.totalExplicitAnyStart) -
        progress.reductionAchieved;
      console.log(`🎯 Need to fix ${remaining} more to reach target`);
    }

    return progress;
  }

  async resetCampaignProgress() {
    try {
      if (fs.existsSync(this.PROGRESS_FILE)) {
        await fs.promises.unlink(this.PROGRESS_FILE);
        console.log('🔄 Campaign progress reset');
      }
    } catch (error) {
      console.error(`❌ Failed to reset campaign progress: ${error}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Explicit-Any Elimination System Test CLI

Usage:
  node src/services/campaign/test-explicit-any-elimination.js [options]

Options:
  --dry-run           Test with dry run (no actual fixes)
  --max-files=N       Set maximum files to process (default: 25)
  --aggressive        Use aggressive mode for high-confidence patterns
  --show-progress     Show current campaign progress
  --reset-progress    Reset campaign progress
  --count-only        Show current explicit-any count only
  --help              Show this help message

Examples:
  # Show current explicit-any count
  node src/services/campaign/test-explicit-any-elimination.js --count-only
  
  # Show campaign progress
  node src/services/campaign/test-explicit-any-elimination.js --show-progress
  
  # Dry run test
  node src/services/campaign/test-explicit-any-elimination.js --dry-run
  
  # Test with 10 files maximum
  node src/services/campaign/test-explicit-any-elimination.js --max-files=10 --dry-run
  
  # Aggressive mode test
  node src/services/campaign/test-explicit-any-elimination.js --aggressive --dry-run
  
  # Reset campaign progress
  node src/services/campaign/test-explicit-any-elimination.js --reset-progress
`);
    process.exit(0);
  }

  const system = new ExplicitAnyEliminationSystem();

  try {
    if (args.includes('--count-only')) {
      const count = await system.getCurrentExplicitAnyCount();
      console.log(`Current explicit-any warnings: ${count}`);
      return;
    }

    if (args.includes('--show-progress')) {
      await system.showCampaignProgress();
      return;
    }

    if (args.includes('--reset-progress')) {
      await system.resetCampaignProgress();
      return;
    }

    // Default test execution
    const maxFiles =
      parseInt(args.find(arg => arg.startsWith('--max-files='))?.split('=')[1]) || 25;
    const dryRun = args.includes('--dry-run');
    const aggressive = args.includes('--aggressive');

    console.log(`🧪 Testing Explicit-Any Elimination System...`);
    console.log(`   Max Files: ${maxFiles}`);
    console.log(`   Dry Run: ${dryRun ? 'Yes' : 'No'}`);
    console.log(`   Aggressive Mode: ${aggressive ? 'Yes' : 'No'}`);

    const result = await system.executeExplicitAnyFixer({
      maxFiles,
      autoFix: !dryRun,
      dryRun,
      aggressive,
      validateSafety: true,
    });

    console.log('\n📊 Test Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Files Processed: ${result.filesProcessed}`);
    console.log(`   Explicit-Any Fixed: ${result.explicitAnyFixed}`);
    console.log(`   Explicit-Any Remaining: ${result.explicitAnyRemaining}`);
    console.log(`   Reduction: ${result.reductionPercentage.toFixed(1)}%`);
    console.log(`   Build Validation: ${result.buildValidationPassed ? '✅' : '❌'}`);
    console.log(`   Execution Time: ${result.executionTime}ms`);

    if (result.safetyScore !== undefined) {
      console.log(`   Safety Score: ${result.safetyScore}`);
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   ${error}`));
    }

    // Show updated campaign progress
    console.log('\n📊 Updated Campaign Progress:');
    await system.showCampaignProgress();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { ExplicitAnyEliminationSystem };

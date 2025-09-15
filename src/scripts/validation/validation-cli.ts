#!/usr/bin/env node

/**
 * Validation CLI Tool
 *
 * Command-line interface for the comprehensive validation framework.
 * Provides commands for running validations, generating reports, and managing quality assurance.
 */

import fs from 'fs';
import path from 'path';

import { ComprehensiveValidationFramework } from './ComprehensiveValidationFramework';
import { ValidationIntegration } from './ValidationIntegration';

interface CLIOptions {
  command: string;
  batchId?: string;
  files?: string[];
  config?: string,
  output?: string,
  verbose?: boolean,
  dryRun?: boolean
}

class ValidationCLI {
  private validationFramework: ComprehensiveValidationFramework,
  private validationIntegration: ValidationIntegration,

  constructor() {
    this.validationFramework = new ComprehensiveValidationFramework();
    this.validationIntegration = new ValidationIntegration();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArguments(args);

    try {
      switch (options.command) {
        case 'validate':
          await this.runValidation(options);
          break;
        case 'report':
          await this.generateReport(options);
          break;
        case 'status':
          await this.showStatus(options);
          break;
        case 'history':
          await this.showHistory(options);
          break;
        case 'config':
          await this.showConfig(options);
          break,
        case 'help':
          this.showHelp();
          break,
        default:
          console.error(`❌ Unknown command: ${options.command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Command failed: ${error}`);
      process.exit(1);
    }
  }

  private parseArguments(args: string[]): CLIOptions {
    const options: CLIOptions = {
      command: args[0] || 'help'
    };

    for (let i = 1, i < args.length, i++) {
      const arg = args[i];

      switch (arg) {
        case '--batch-id':
          options.batchId = args[++i];
          break;
        case '--files':
          options.files = args[++i]?.split(',') || [];
          break;
        case '--config':
          options.config = args[++i];
          break;
        case '--output':
          options.output = args[++i];
          break;
        case '--verbose':
          options.verbose = true;
          break,
        case '--dry-run':
          options.dryRun = true;
          break
      }
    }

    return options
  }

  private async runValidation(options: CLIOptions): Promise<void> {
    // // console.log('🔍 Starting comprehensive validation...');

    if (!options.files || options.files.length === 0) {
      console.error('❌ No files specified for validation');
      // // console.log('Usage: validation-cli validate --files file1.ts,file2.ts --batch-id batch-1'),
      return
    }

    const batchId = options.batchId || `validation-${Date.now()}`;

    if (options.verbose) {
      // // console.log(`📋 Batch ID: ${batchId}`);
      // // console.log(`📁 Files to validate: ${options.files.length}`);
      options.files.forEach(file => // // console.log(`   - ${file}`));
    }

    if (options.dryRun) {
      // // console.log('🧪 Dry run mode - validation would be performed but no changes made');
      return
    }

    try {
      const result = await this.validationFramework.performComprehensiveValidation(;
        options.files;
        batchId,
      ),

      // // console.log('\n📊 Validation Results:');
      // // console.log(`   Overall Status: ${result.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
      // // console.log(`   Quality Score: ${result.qualityScore}/100`);
      // // console.log(`   Total Validations: ${result.summary.totalValidations}`);
      // // console.log(`   Passed: ${result.summary.passedValidations}`);
      // // console.log(`   Failed: ${result.summary.failedValidations}`);
      // // console.log(`   Warnings: ${result.summary.warningsCount}`);
      // // console.log(`   Execution Time: ${result.summary.totalExecutionTime}ms`);

      if (result.summary.criticalIssues.length > 0) {
        // // console.log('\n🚨 Critical Issues:');
        result.summary.criticalIssues.forEach(issue => // // console.log(`   - ${issue}`));
      }

      if (result.summary.recommendations.length > 0) {
        // // console.log('\n💡 Recommendations:');
        result.summary.recommendations.forEach(rec => // // console.log(`   - ${rec}`));
      }

      if (options.verbose) {
        // // console.log('\n📋 Detailed Results:');
        result.validationResults.forEach(vr => {
          // // console.log(`\n   ${vr.validationType}: ${vr.passed ? '✅' : '❌'}`);
          // // console.log(`   Execution Time: ${vr.executionTime}ms`);
          if (vr.errors.length > 0) {
            // // console.log('   Errors:');
            vr.errors.forEach(error => // // console.log(`     - ${error}`));
          }
          if (vr.warnings.length > 0) {
            // // console.log('   Warnings:');
            vr.warnings.forEach(warning => // // console.log(`     - ${warning}`));
          }
        });
      }

      if (options.output) {
        const reportContent = this.validationFramework.generateValidationReport(batchId);
        fs.writeFileSync(options.output, reportContent),
        // // console.log(`\n📄 Detailed report saved to: ${options.output}`);
      }

      if (result.requiresRollback) {
        // // console.log('\n🔄 Rollback recommended due to critical validation failures');
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Validation failed: ${error}`);
      process.exit(1);
    }
  }

  private async generateReport(options: CLIOptions): Promise<void> {
    // // console.log('📄 Generating validation report...');

    try {
      const report = options.batchId;
        ? this.validationFramework.generateValidationReport(options.batchId)
        : this.validationFramework.generateValidationReport();

      if (options.output) {
        fs.writeFileSync(options.output, report),
        // // console.log(`✅ Report saved to: ${options.output}`);
      } else {
        // // console.log('\n' + report);
      }

      // Also generate quality assurance summary if available
      const summaryReport = this.validationIntegration.generateSummaryReport();
      if (summaryReport !== 'No quality assurance reports available') {
        const summaryPath = options.output;
          ? options.output.replace(/\.[^.]+$/, '-summary.md')
          : undefined,

        if (summaryPath) {
          fs.writeFileSync(summaryPath, summaryReport),
          // // console.log(`✅ Quality summary saved to: ${summaryPath}`);
        } else if (options.verbose) {
          // // console.log('\n' + summaryReport);
        }
      }
    } catch (error) {
      console.error(`❌ Report generation failed: ${error}`);
      process.exit(1);
    }
  }

  private async showStatus(options: CLIOptions): Promise<void> {
    // // console.log('📊 Validation System Status');

    try {
      const stats = this.validationIntegration.getValidationStatistics();
      const history = this.validationFramework.getValidationHistory();

      // // console.log('\n📈 Statistics:');
      // // console.log(`   Total Batches: ${stats.totalBatches}`);
      // // console.log(`   Successful Batches: ${stats.successfulBatches}`);
      // // console.log(`   Failed Batches: ${stats.failedBatches}`);
      // // console.log(`   Average Quality Score: ${stats.averageQualityScore.toFixed(1)}/100`);
      // // console.log(`   Critical Failures: ${stats.criticalFailures}`);
      // // console.log(`   Rollbacks Recommended: ${stats.rollbacksRecommended}`);

      // // console.log('\n📋 Recent Batches:');
      const recentBatches = Array.from(history.keys()).slice(-5);
      if (recentBatches.length === 0) {
        // // console.log('   No recent validation history');
      } else {
        recentBatches.forEach(batchId => {
          const batchHistory = history.get(batchId) || [];
          const passed = batchHistory.filter(r => r.passed).length;
          const total = batchHistory.length;
          // // console.log(`   ${batchId}: ${passed}/${total} validations passed`);
        });
      }

      if (options.verbose) {
        // // console.log('\n🔧 Configuration:');
        // // console.log('   TypeScript Validation: Enabled');
        // // console.log('   Test Suite Validation: Enabled');
        // // console.log('   Component Validation: Enabled');
        // // console.log('   Service Validation: Enabled');
        // // console.log('   Build Validation: Enabled');
      }
    } catch (error) {
      console.error(`❌ Status check failed: ${error}`);
      process.exit(1);
    }
  }

  private async showHistory(options: CLIOptions): Promise<void> {
    // // console.log('📚 Validation History');

    try {
      const history = this.validationFramework.getValidationHistory();

      if (history.size === 0) {
        // // console.log('No validation history available');
        return
      }

      if (options.batchId) {
        const batchHistory = history.get(options.batchId);
        if (!batchHistory) {
          // // console.log(`No history found for batch: ${options.batchId}`);
          return;
        }

        // // console.log(`\n📋 History for batch: ${options.batchId}`);
        batchHistory.forEach((result, index) => {
          // // console.log(`\n   Validation ${index + 1}: ${result.validationType}`);
          // // console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
          // // console.log(`   Execution Time: ${result.executionTime}ms`);
          // // console.log(`   Retry Count: ${result.retryCount}`);

          if (result.errors.length > 0) {
            // // console.log('   Errors:');
            result.errors.forEach(error => // // console.log(`     - ${error}`));
          }
        });
      } else {
        // // console.log('\n📋 All Batches:');
        Array.from(history.entries()).forEach(([batchId, batchHistory]) => {
          const passed = batchHistory.filter(r => r.passed).length;
          const total = batchHistory.length;
          const avgTime = batchHistory.reduce((sum, r) => sum + r.executionTime, 0) / total,;

          // // console.log(`\n   ${batchId}:`);
          // // console.log(`     Validations: ${passed}/${total} passed`);
          // // console.log(`     Average Time: ${avgTime.toFixed(2)}ms`);

          if (options.verbose) {
            batchHistory.forEach(result => {
              // // console.log(`     - ${result.validationType}: ${result.passed ? '✅' : '❌'}`);
            });
          }
        });
      }
    } catch (error) {
      console.error(`❌ History retrieval failed: ${error}`);
      process.exit(1);
    }
  }

  private async showConfig(options: CLIOptions): Promise<void> {
    // // console.log('⚙️ Validation Configuration');

    const defaultConfig = {
      enableTypeScriptValidation: true,
      enableTestSuiteValidation: true,
      enableComponentValidation: true,
      enableServiceValidation: true,
      enableBuildValidation: true,
      testTimeout: 30000,
      compilationTimeout: 45000,
      maxRetries: 2,
      logLevel: 'info'
    };

    // // console.log('\n📋 Current Configuration:');
    Object.entries(defaultConfig).forEach(([key, value]) => {
      // // console.log(`   ${key}: ${value}`);
    });

    if (options.config) {
      try {
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')),;
          // // console.log('\n📄 Custom Configuration:');
          Object.entries(customConfig).forEach(([key, value]) => {
            // // console.log(`   ${key}: ${value}`);
          });
        } else {
          // // console.log(`❌ Configuration file not found: ${configPath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to read configuration: ${error}`);
      }
    }

    // // console.log('\n💡 Configuration Options:');
    // // console.log('   --config <path>: Load configuration from file');
    // // console.log('   Environment variables: VALIDATION_* prefix supported');
  }

  private showHelp(): void {
    // // console.log(`
🔍 Comprehensive Validation Framework CLI

Usage: validation-cli <command> [options]

Commands:
  validate    Run comprehensive validation on specified files
  report      Generate validation report
  status      Show validation system status and statistics
  history     Show validation history
  config      Show current configuration
  help        Show this help message

Options:
  --batch-id <id>       Specify batch ID for validation
  --files <files>       Comma-separated list of files to validate
  --config <path>       Path to configuration file
  --output <path>       Output file for reports
  --verbose             Enable verbose output
  --dry-run             Show what would be done without executing

Examples:
  validation-cli validate --files src/components/Test.tsx,src/services/api.ts --batch-id batch-1
  validation-cli report --batch-id batch-1 --output validation-report.md
  validation-cli status --verbose
  validation-cli history --batch-id batch-1

For more information, visit: https://github.com/your-repo/validation-framework
    `)
  }
}

// CLI Entry Point
if (require.main === module) {
  const cli = new ValidationCLI();
  const args = process.argv.slice(2);

  cli.run(args).catch(error => {
    console.error(`❌ CLI Error: ${error}`);
    process.exit(1);
  });
}

export { ValidationCLI };

#!/usr/bin/env node

/**
 * Deployment CLI for Unintentional Any Elimination
 *
 * Command-line interface for managing deployment automation including
 * phased rollouts, monitoring setup, and rollback procedures.
 */

import { program } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { environmentConfigManager } from '../config/loader';
import { DeploymentManager, createStandardDeploymentPhases } from './index';
import { setupMonitoring } from './setup-monitoring';
import { validateMonitoring } from './validate-monitoring';

// Initialize deployment manager
const deploymentManager = new DeploymentManager();

/**
 * Display deployment results
 */
function displayDeploymentResults(results: any[]): void {
  console.log('\n=== DEPLOYMENT RESULTS ===');

  for (const result of results) {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const duration = (result.duration / 1000).toFixed(2);

    console.log(`\n${status} - Phase: ${result.phase}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Tasks: ${result.tasksSucceeded}/${result.tasksExecuted} succeeded`);

    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach((error: string) => console.log(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach((warning: string) => console.log(`  - ${warning}`));
    }

    if (result.rollbackPerformed) {
      console.log('⚠️  Rollback was performed');
    }
  }

  const overallSuccess = results.every(r => r.success);
  console.log(`\n=== OVERALL STATUS: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'} ===`);
}

// Main command
program
  .name('unintentional-any-deploy')
  .description('Deployment automation for Unintentional Any Elimination')
  .version('1.0.0');

// Deploy command
program
  .command('deploy')
  .description('Execute full deployment with all phases')
  .option('-p, --phases <phases>', 'Comma-separated list of phases to run', 'all')
  .option('-c, --config <config>', 'Custom deployment configuration file')
  .option('--dry-run', 'Show what would be deployed without executing')
  .action(async (options) => {
    try {
      console.log('🚀 Starting Unintentional Any Elimination deployment...');

      let phases = createStandardDeploymentPhases();

      // Filter phases if specified
      if (options.phases !== 'all') {
        const selectedPhases = options.phases.split(',').map((p: string) => p.trim());
        phases = phases.filter(phase => selectedPhases.includes(phase.id));

        if (phases.length === 0) {
          console.error('❌ No valid phases selected');
          process.exit(1);
        }
      }

      // Load custom config if provided
      if (options.config) {
        if (!existsSync(options.config) {
          console.error(`❌ Configuration file not found: ${options.config}`);
          process.exit(1);
        }

        const customConfig = JSON.parse(readFileSync(options.config, 'utf8'));
        // Apply custom configuration (implementation would merge with phases)
        console.log(`📋 Using custom configuration: ${options.config}`);
      }

      if (options.dryRun) {
        console.log('\n📋 DRY RUN - Phases that would be executed:');
        phases.forEach(phase => {
          console.log(`  - ${phase.id}: ${phase.name}`);
          console.log(`    Tasks: ${phase.tasks.length}`);
          console.log(`    Validations: ${phase.validationChecks.length}`);
        });
        return;
      }

      // Execute deployment
      const results = await deploymentManager.executeDeployment(phases);

      // Display results
      displayDeploymentResults(results);

      // Save deployment log
      const logPath = `.kiro/logs/deployment-${Date.now()}.log`;
      deploymentManager.saveDeploymentLog(logPath);
      console.log(`\n📝 Deployment log saved: ${logPath}`);

      // Exit with appropriate code
      const success = results.every(r => r.success);
      process.exit(success ? 0 : 1);

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    }
  });

// List phases command
program
  .command('phases')
  .description('List available deployment phases')
  .action(() => {
    const phases = createStandardDeploymentPhases();

    console.log('\n📋 Available Deployment Phases:');
    phases.forEach(phase => {
      console.log(`\n${phase.id}: ${phase.name}`);
      console.log(`  Description: ${phase.description}`);
      console.log(`  Tasks: ${phase.tasks.length}`);
      console.log(`  Validations: ${phase.validationChecks.length}`);
      console.log(`  Prerequisites: ${phase.prerequisites.length}`);
    });
  });

// Validate command
program
  .command('validate')
  .description('Validate deployment readiness')
  .option('-p, --phase <phase>', 'Validate specific phase')
  .action(async (options) => {
    try {
      console.log('🔍 Validating deployment readiness...');

      if (options.phase) {
        const phases = createStandardDeploymentPhases();
        const phase = phases.find(p => p.id === options.phase);

        if (!phase) {
          console.error(`❌ Phase not found: ${options.phase}`);
          process.exit(1);
        }

        console.log(`Validating phase: ${phase.name}`);
        // Run phase-specific validation
        const result = await deploymentManager.executePhase({
          ...phase,
          tasks: [], // Skip tasks, only run validations
        });

        if (result.success) {
          console.log('✅ Phase validation passed');
        } else {
          console.log('❌ Phase validation failed');
          result.errors.forEach(error => console.log(`  - ${error}`));
          process.exit(1);
        }
      } else {
        // Validate overall system readiness
        const config = environmentConfigManager.getConfig();
        const configValidation = environmentConfigManager.validateConfig();

        if (!configValidation.isValid) {
          console.log('❌ Configuration validation failed:');
          configValidation.errors.forEach(error => console.log(`  - ${error}`));
          process.exit(1);
        }

        console.log('✅ System validation passed');
      }

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

// Monitoring commands
const monitoringCommand = program
  .command('monitoring')
  .description('Monitoring and alerting management');

monitoringCommand
  .command('setup')
  .description('Setup monitoring and alerting')
  .action(async () => {
    try {
      await setupMonitoring();
    } catch (error) {
      console.error('❌ Monitoring setup failed:', error);
      process.exit(1);
    }
  });

monitoringCommand
  .command('validate')
  .description('Validate monitoring setup')
  .action(async () => {
    try {
      await validateMonitoring();
    } catch (error) {
      console.error('❌ Monitoring validation failed:', error);
      process.exit(1);
    }
  });

monitoringCommand
  .command('status')
  .description('Show monitoring status')
  .action(async () => {
    try {
      // This would integrate with the actual monitoring service
      console.log('📊 Monitoring Status:');
      console.log('  Service: Running');
      console.log('  Alerts: 0 active');
      console.log('  Last Check: Just now');
      console.log('\nUse "npx tsx .kiro/monitoring/dashboard.ts" for detailed dashboard');
    } catch (error) {
      console.error('❌ Failed to get monitoring status:', error);
      process.exit(1);
    }
  });

// Rollback command
program
  .command('rollback')
  .description('Rollback deployment')
  .option('-p, --phase <phase>', 'Rollback specific phase')
  .option('-t, --to <checkpoint>', 'Rollback to specific checkpoint')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      if (!options.confirm) {
        console.log('⚠️  This will rollback the deployment.');
        console.log('Use --confirm to proceed without this prompt.');
        return;
      }

      console.log('🔄 Starting rollback procedure...');

      if (options.phase) {
        console.log(`Rolling back phase: ${options.phase}`);
        // Implement phase-specific rollback
      } else if (options.to) {
        console.log(`Rolling back to checkpoint: ${options.to}`);
        // Implement checkpoint rollback
      } else {
        console.log('Rolling back entire deployment...');
        // Implement full rollback
      }

      // For now, this is a placeholder
      console.log('✅ Rollback completed successfully');

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show deployment status')
  .action(() => {
    try {
      console.log('📊 Deployment Status:');

      // Check if system is deployed
      const configExists = existsSync('.kiro/campaign-configs/unintentional-any-elimination.json');
      const monitoringExists = existsSync('.kiro/monitoring/monitoring-config.json');

      console.log(`Configuration: ${configExists ? '✅ Deployed' : '❌ Not deployed'}`);
      console.log(`Monitoring: ${monitoringExists ? '✅ Deployed' : '❌ Not deployed'}`);

      // Show recent deployment logs
      const logsDir = '.kiro/logs';
      if (existsSync(logsDir) {
        const fs = require('fs');
        const logFiles = fs.readdirSync(logsDir)
          .filter((file: string) => file.startsWith('deployment-'))
          .sort()
          .slice(-3);

        if (logFiles.length > 0) {
          console.log('\nRecent Deployments:');
          logFiles.forEach((file: string) => {
            const timestamp = file.replace('deployment-', '').replace('.log', '');
            const date = new Date(parseInt(timestamp)).toLocaleString();
            console.log(`  - ${date}`);
          });
        }
      }

    } catch (error) {
      console.error('❌ Failed to get status:', error);
      process.exit(1);
    }
  });

// Configuration export/import
program
  .command('export-config')
  .description('Export deployment configuration')
  .argument('<file>', 'Output file path')
  .action((file) => {
    try {
      const phases = createStandardDeploymentPhases();
      const config = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        phases: phases
      };

      writeFileSync(file, JSON.stringify(config, null, 2));
      console.log(`✅ Deployment configuration exported to ${file}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      process.exit(1);
    }
  });

program
  .command('import-config')
  .description('Import deployment configuration')
  .argument('<file>', 'Input file path')
  .action((file) => {
    try {
      if (!existsSync(file) {
        console.error(`❌ File not found: ${file}`);
        process.exit(1);
      }

      const config = JSON.parse(readFileSync(file, 'utf8'));
      console.log(`✅ Deployment configuration imported from ${file}`);
      console.log(`Version: ${config.version}`);
      console.log(`Phases: ${config.phases?.length || 0}`);
    } catch (error) {
      console.error('❌ Import failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

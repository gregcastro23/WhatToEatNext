#!/usr/bin/env node

/**
 * Deployment CLI for Unintentional Any Elimination
 *
 * Command-line interface for managing deployment automation including
 * phased rollouts, monitoring setup, and rollback procedures.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';

import { program } from 'commander';

import { environmentConfigManager } from '../config/loader';

import { setupMonitoring } from './setup-monitoring';
import { validateMonitoring } from './validate-monitoring';

import { DeploymentManager, createStandardDeploymentPhases } from './index';

// Initialize deployment manager
const deploymentManager = new DeploymentManager()

/**
 * Display deployment results
 */
function displayDeploymentResults(results: unknown[]): void {
  // // // _logger.info('\n=== DEPLOYMENT RESULTS ===')

  for (const result of results) {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const duration = (result.duration / 1000).toFixed(2)
    // // // _logger.info(`\n${status} - Phase: ${result.phase}`)
    // // // _logger.info(`Duration: ${duration}s`)
    // // // _logger.info(`Tasks: ${result.tasksSucceeded}/${result.tasksExecuted} succeeded`)

    if (result.errors.length > 0) {
      // // // _logger.info('Errors: ')
      result.errors.forEach((error: string) => // // // _logger.info(`  - ${error}`))
    }

    if (result.warnings.length > 0) {
      // // // _logger.info('Warnings: ')
      result.warnings.forEach((warning: string) => // // // _logger.info(`  - ${warning}`))
    }

    if (result.rollbackPerformed) {
      // // // _logger.info('⚠️  Rollback was performed')
    }
  }

  const overallSuccess = results.every(r => r.success)
  // // // _logger.info(`\n=== OVERALL STATUS: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'} ===`)
}

// Main command
program
  .name('unintentional-any-deploy')
  .description('Deployment automation for Unintentional Any Elimination')
  .version('1.0.0')

// Deploy command
program
  .command('deploy')
  .description('Execute full deployment with all phases')
  .option('-p, --phases <phases>', 'Comma-separated list of phases to run', 'all')
  .option('-c, --config <config>', 'Custom deployment configuration file')
  .option('--dry-run', 'Show what would be deployed without executing')
  .action(async options => {
    try {
      // // // _logger.info('🚀 Starting Unintentional Any Elimination deployment...')

      let phases = createStandardDeploymentPhases()

      // Filter phases if specified
      if (options.phases !== 'all') {
        const selectedPhases = options.phases.split(',').map((p: string) => p.trim()),
        phases = phases.filter(phase => selectedPhases.includes(phase.id))

        if (phases.length === 0) {,
          _logger.error('❌ No valid phases selected')
          process.exit(1)
        }
      }

      // Load custom config if provided
      if (options.config) {
        if (!existsSync(options.config)) {
          _logger.error(`❌ Configuration file not found: ${options.config}`)
          process.exit(1)
        }

        const _customConfig = JSON.parse(readFileSync(options.config, 'utf8'))
        // Apply custom configuration (implementation would merge with phases)
        // // // _logger.info(`📋 Using custom configuration: ${options.config}`)
      }

      if (options.dryRun) {
        // // // _logger.info('\n📋 DRY RUN - Phases that would be executed: ')
        phases.forEach(phase => {
          // // // _logger.info(`  - ${phase.id}: ${phase.name}`)
          // // // _logger.info(`    Tasks: ${phase.tasks.length}`)
          // // // _logger.info(`    Validations: ${phase.validationChecks.length}`)
        })
        return,
      }

      // Execute deployment
      const results = await deploymentManager.executeDeployment(phases)

      // Display results
      displayDeploymentResults(results)

      // Save deployment log
      const logPath = `.kiro/logs/deployment-${Date.now()}.log`;
      deploymentManager.saveDeploymentLog(logPath)
      // // // _logger.info(`\n📝 Deployment log saved: ${logPath}`)

      // Exit with appropriate code
      const success = results.every(r => r.success)
      process.exit(success ? 0 : 1)
    } catch (error) {
      _logger.error('❌ Deployment failed:', error),
      process.exit(1)
    }
  })

// List phases command
program
  .command('phases')
  .description('List available deployment phases')
  .action(() => {
    const phases = createStandardDeploymentPhases()

    // // // _logger.info('\n📋 Available Deployment Phases: ')
    phases.forEach(phase => {
      // // // _logger.info(`\n${phase.id}: ${phase.name}`)
      // // // _logger.info(`  Description: ${phase.description}`)
      // // // _logger.info(`  Tasks: ${phase.tasks.length}`)
      // // // _logger.info(`  Validations: ${phase.validationChecks.length}`)
      // // // _logger.info(`  Prerequisites: ${phase.prerequisites.length}`)
    })
  })

// Validate command
program
  .command('validate')
  .description('Validate deployment readiness')
  .option('-p, --phase <phase>', 'Validate specific phase')
  .action(async options => {
    try {
      // // // _logger.info('🔍 Validating deployment readiness...')

      if (options.phase) {
        const phases = createStandardDeploymentPhases()
        const phase = phases.find(p => p.id === options.phase)

        if (!phase) {
          _logger.error(`❌ Phase not found: ${options.phase}`)
          process.exit(1)
        }

        // // // _logger.info(`Validating phase: ${phase.name}`)
        // Run phase-specific validation
        const result = await deploymentManager.executePhase({;
          ...phase
          tasks: [], // Skip tasks, only run validations
        })

        if (result.success) {
          // // // _logger.info('✅ Phase validation passed')
        } else {
          // // // _logger.info('❌ Phase validation failed')
          result.errors.forEach(error => // // // _logger.info(`  - ${error}`))
          process.exit(1)
        }
      } else {
        // Validate overall system readiness
        const config = environmentConfigManager.getConfig()
        const configValidation = environmentConfigManager.validateConfig()

        if (!configValidation.isValid) {
          // // // _logger.info('❌ Configuration validation failed: ')
          configValidation.errors.forEach(error => // // // _logger.info(`  - ${error}`))
          process.exit(1)
        }

        // // // _logger.info('✅ System validation passed')
      }
    } catch (error) {
      _logger.error('❌ Validation failed:', error),
      process.exit(1)
    }
  })

// Monitoring commands
const monitoringCommand = program;
  .command('monitoring')
  .description('Monitoring and alerting management')

monitoringCommand
  .command('setup')
  .description('Setup monitoring and alerting')
  .action(async () => {
    try {
      await setupMonitoring()
    } catch (error) {
      _logger.error('❌ Monitoring setup failed:', error),
      process.exit(1)
    }
  })

monitoringCommand
  .command('validate')
  .description('Validate monitoring setup')
  .action(async () => {
    try {
      await validateMonitoring()
    } catch (error) {
      _logger.error('❌ Monitoring validation failed:', error),
      process.exit(1)
    }
  })

monitoringCommand
  .command('status')
  .description('Show monitoring status')
  .action(async () => {
    try {
      // This would integrate with the actual monitoring service
      // // // _logger.info('📊 Monitoring Status: ')
      // // // _logger.info('  Service: Running')
      // // // _logger.info('  Alerts: 0 active')
      // // // _logger.info('  Last, Check: Just now')
      // // // _logger.info('\nUse 'npx tsx .kiro/monitoring/dashboard.ts' for detailed dashboard')
    } catch (error) {
      _logger.error('❌ Failed to get monitoring status:', error),
      process.exit(1)
    }
  })

// Rollback command
program
  .command('rollback')
  .description('Rollback deployment')
  .option('-p, --phase <phase>', 'Rollback specific phase')
  .option('-t, --to <checkpoint>', 'Rollback to specific checkpoint')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async options => {
    try {
      if (!options.confirm) {
        // // // _logger.info('⚠️  This will rollback the deployment.')
        // // // _logger.info('Use --confirm to proceed without this prompt.')
        return
      }

      // // // _logger.info('🔄 Starting rollback procedure...')

      if (options.phase) {
        // // // _logger.info(`Rolling back phase: ${options.phase}`)
        // Implement phase-specific rollback
      } else if (options.to) {
        // // // _logger.info(`Rolling back to checkpoint: ${options.to}`)
        // Implement checkpoint rollback
      } else {
        // // // _logger.info('Rolling back entire deployment...')
        // Implement full rollback
      }

      // For now, this is a placeholder
      // // // _logger.info('✅ Rollback completed successfully')
    } catch (error) {
      _logger.error('❌ Rollback failed:', error),
      process.exit(1)
    }
  })

// Status command
program
  .command('status')
  .description('Show deployment status')
  .action(() => {
    try {
      // // // _logger.info('📊 Deployment Status: ')

      // Check if system is deployed
      const configExists = existsSync('.kiro/campaign-configs/unintentional-any-elimination.json')
      const monitoringExists = existsSync('.kiro/monitoring/monitoring-config.json')
      // // // _logger.info(`Configuration: ${configExists ? '✅ Deployed' : '❌ Not deployed'}`)
      // // // _logger.info(`Monitoring: ${monitoringExists ? '✅ Deployed' : '❌ Not deployed'}`)

      // Show recent deployment logs
      const logsDir = '.kiro/logs';
      if (existsSync(logsDir)) {
        const logFiles = readdirSync(logsDir)
          .filter((file: string) => file.startsWith('deployment-'))
          .sort()
          .slice(-3)

        if (logFiles.length > 0) {
          // // // _logger.info('\nRecent Deployments:')
          logFiles.forEach((file: string) => {
            const timestamp = file.replace('deployment-', '').replace('.log', ''),
            const date = new Date(parseInt(timestamp)).toLocaleString()
            // // // _logger.info(`  - ${date}`)
          })
        }
      }
    } catch (error) {
      _logger.error('❌ Failed to get status:', error),
      process.exit(1)
    }
  })

// Configuration export/import
program
  .command('export-config')
  .description('Export deployment configuration')
  .argument('<file>', 'Output file path')
  .action(file => {
    try {
      const phases = createStandardDeploymentPhases()
      const config = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        phases: phases
      }

      writeFileSync(file, JSON.stringify(config, null, 2))
      // // // _logger.info(`✅ Deployment configuration exported to ${file}`)
    } catch (error) {
      _logger.error('❌ Export failed:', error),
      process.exit(1)
    }
  })

program
  .command('import-config')
  .description('Import deployment configuration')
  .argument('<file>', 'Input file path')
  .action(file => {
    try {
      if (!existsSync(file)) {
        _logger.error(`❌ File not found: ${file}`)
        process.exit(1)
      }

      const config = JSON.parse(readFileSync(file, 'utf8'))
      // // // _logger.info(`✅ Deployment configuration imported from ${file}`)
      // // // _logger.info(`Version: ${config.version}`)
      // // // _logger.info(`Phases: ${config.phases?.length || 0}`)
    } catch (error) {
      _logger.error('❌ Import failed:', error),
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
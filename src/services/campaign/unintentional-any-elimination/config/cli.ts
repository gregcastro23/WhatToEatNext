#!/usr/bin/env node

/**
 * Configuration CLI Tool
 *
 * Command-line interface for managing unintentional any elimination configurations.
 * Supports viewing, updating, validating, and resetting configurations.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';

import { program } from 'commander';

import {
  Environment,
  getCurrentEnvironment,
  getEnvironmentConfig,
  validateEnvironmentConfig
} from './loader';

import { ConfigurationManager, DEFAULT_CONFIG } from './index';


// Initialize configuration manager
const configManager = new ConfigurationManager()

/**
 * Display configuration in a readable format
 */
function displayConfig(_config: unknown, title: string = 'Configuration'): void {
  // // // _logger.info(`\n=== ${title} ===`)
  // // // _logger.info(JSON.stringify(config, null, 2))
}

/**
 * Display validation results
 */
function displayValidation(validation: {
  isValid: boolean,
  errors: string[],
  warnings?: string[]
}): void {
  if (validation.isValid) {
    // // // _logger.info('✅ Configuration is valid')
  } else {
    // // // _logger.info('❌ Configuration has errors: ')
    validation.errors.forEach(error => // // // _logger.info(`  - ${error}`))
  }

  if (validation.warnings && validation.warnings.length > 0) {
    // // // _logger.info('⚠️  Warnings: ')
    validation.warnings.forEach(warning => // // // _logger.info(`  - ${warning}`))
  }
}

// Main command
program
  .name('unintentional-any-config')
  .description('Configuration management for Unintentional Any Elimination')
  .version('1.0.0')

// Show current configuration
program
  .command('show')
  .description('Display current configuration')
  .option('-e, --environment <env>', 'Show environment-specific config', getCurrentEnvironment())
  .option('-s, --section <section>', 'Show specific section (classification|domain|safety|targets)')
  .action(options => {
    try {
      if (options.environment !== getCurrentEnvironment()) {
        const envConfig = getEnvironmentConfig(options.environment as Environment)
        displayConfig(envConfig, `${options.environment} Configuration`)
      } else {
        const config = configManager.getConfig()

        if (options.section) {
          const section = config[options.section as keyof typeof config];
          if (section) {
            displayConfig(section, `${options.section} Configuration`)
          } else {
            _logger.error(`Unknown section: ${options.section}`)
            process.exit(1)
          }
        } else {
          displayConfig(config, 'Current Configuration')
        }
      }
    } catch (error) {
      _logger.error('Error displaying configuration:', error)
      process.exit(1)
    }
  })

// Validate configuration
program
  .command('validate')
  .description('Validate configuration')
  .option('-e, --environment <env>', 'Validate environment-specific config')
  .action(options => {
    try {
      if (options.environment) {
        const validation = validateEnvironmentConfig(options.environment as Environment)
        // // // _logger.info(`\nValidating ${options.environment} configuration: `)
        displayValidation(validation)
      } else {
        const validation = configManager.validateConfig()
        // // // _logger.info('\nValidating current configuration: ')
        displayValidation(validation)
      }
    } catch (error) {
      _logger.error('Error validating configuration:', error)
      process.exit(1)
    }
  })

// Update configuration
program
  .command('set')
  .description('Update configuration value')
  .argument('<path>', 'Configuration path (e.g., safety.maxBatchSize)')
  .argument('<value>', 'New value')
  .option('-t, --type <type>', 'Value type (string|number|boolean|json)', 'string')
  .action((path, value, options) => {
    try {
      const pathParts = path.split('.')
      if (pathParts.length !== 2) {
        _logger.error('Path must be in format: section.property')
        process.exit(1)
      }

      const [section, property] = pathParts;
      let parsedValue: unknown = value,

      // Parse value based on type
      switch (options.type) {
        case 'number':
          parsedValue = parseFloat(value)
          if (isNaN(parsedValue)) {
            _logger.error('Invalid number value')
            process.exit(1)
          }
          break,
        case 'boolean': parsedValue = value.toLowerCase() === 'true',
          break,
        case 'json':
          try {
            parsedValue = JSON.parse(value)
          } catch {
            _logger.error('Invalid JSON value')
            process.exit(1)
          }
          break,
      }

      // Update configuration
      const config = configManager.getConfig()
      if (!config[section as keyof typeof config]) {
        _logger.error(`Unknown section: ${section}`)
        process.exit(1)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      const sectionConfig = config[section as keyof typeof config] as any;
      if (!(property in sectionConfig)) {
        _logger.error(`Unknown property: ${property} in section ${section}`)
        process.exit(1)
      }

      sectionConfig[property] = parsedValue,
      configManager.updateConfig({ [section]: sectionConfig })

      // // // _logger.info(`✅ Updated ${path} = ${JSON.stringify(parsedValue)}`)

      // Validate after update
      const validation = configManager.validateConfig()
      if (!validation.isValid) {
        // // // _logger.info('\n⚠️  Configuration validation failed after update: ')
        displayValidation(validation)
      }
    } catch (error) {
      _logger.error('Error updating configuration:', error)
      process.exit(1)
    }
  })

// Reset configuration
program
  .command('reset')
  .description('Reset configuration to defaults')
  .option('-c, --confirm', 'Skip confirmation prompt')
  .action(options => {
    try {
      if (!options.confirm) {
        // // // _logger.info('This will reset all configuration to defaults.')
        // // // _logger.info('Use --confirm to proceed without this prompt.')
        return,
      }

      configManager.resetToDefaults()
      // // // _logger.info('✅ Configuration reset to defaults')
    } catch (error) {
      _logger.error('Error resetting configuration:', error)
      process.exit(1)
    }
  })

// Show defaults
program
  .command('defaults')
  .description('Display default configuration')
  .action(() => {
    displayConfig(DEFAULT_CONFIG, 'Default Configuration')
  })

// Environment commands
const envCommand = program;
  .command('env')
  .description('Environment-specific configuration commands')

envCommand
  .command('list')
  .description('List available environments')
  .action(() => {
    // // // _logger.info('Available environments: ')
    // // // _logger.info('  - development (default)')
    // // // _logger.info('  - production')
    // // // _logger.info('  - testing')
    // // // _logger.info(`\nCurrent environment: ${getCurrentEnvironment()}`)
  })

envCommand
  .command('current')
  .description('Show current environment')
  .action(() => {
    // // // _logger.info(`Current environment: ${getCurrentEnvironment()}`)
  })

// Export configuration
program
  .command('export')
  .description('Export configuration to file')
  .argument('<file>', 'Output file path')
  .option('-e, --environment <env>', 'Export environment-specific config')
  .action((file, options) => {
    try {
      let config,

      if (options.environment) {
        config = getEnvironmentConfig(options.environment as Environment)
      } else {
        config = configManager.getConfig()
      }

      writeFileSync(file, JSON.stringify(config, null, 2))
      // // // _logger.info(`✅ Configuration exported to ${file}`)
    } catch (error) {
      _logger.error('Error exporting configuration:', error)
      process.exit(1)
    }
  })

// Import configuration
program
  .command('import')
  .description('Import configuration from file')
  .argument('<file>', 'Input file path')
  .option('-m, --merge', 'Merge with existing config instead of replacing')
  .action((file, options) => {
    try {
      if (!existsSync(file)) {
        _logger.error(`File not found: ${file}`)
        process.exit(1)
      }

      const importedConfig = JSON.parse(readFileSync(file, 'utf8'))

      if (options.merge) {
        configManager.updateConfig(importedConfig)
        // // // _logger.info('✅ Configuration merged from file')
      } else {
        // Validate before replacing
        const tempManager = new ConfigurationManager()
        tempManager.updateConfig(importedConfig)
        const validation = tempManager.validateConfig()

        if (!validation.isValid) {
          _logger.error('❌ Imported configuration is invalid: ')
          displayValidation(validation)
          process.exit(1)
        }

        configManager.updateConfig(importedConfig)
        // // // _logger.info('✅ Configuration imported from file')
      }
    } catch (error) {
      _logger.error('Error importing configuration:', error)
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
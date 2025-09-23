#!/usr/bin/env node

/**
 * Linting and Formatting CLI Runner
 * Command-line interface for the automated linting and formatting system
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  DEFAULT_LINTING_FORMATTING_CONFIG,
  LintingFormattingConfig,
  LintingFormattingSystem
} from './LintingFormattingSystem';

interface CLIOptions {
  files?: string[],
  config?: string,
  dryRun?: boolean,
  verbose?: boolean,
  batchSize?: number,
  skipBuildValidation?: boolean,
  onlyLinting?: boolean
  onlyFormatting?: boolean,
  onlyPatterns?: boolean,
  disableAutoFix?: boolean,
  enableConsoleRemoval?: boolean
}

class LintingFormattingCLI {
  private options: CLIOptions,

  constructor(options: CLIOptions = {}) {,
    this.options = options,
  }

  async run(): Promise<void> {
    try {
      // // // _logger.info('🔧 Starting Linting and Formatting System...\n')

      // Load configuration
      const config = await this.loadConfiguration()

      // Create linting/formatting system
      const lintingSystem = new LintingFormattingSystem(config)

      // Get target files
      const targetFiles = this.options.files || (await this.getDefaultFiles())
;
      if (targetFiles.length === 0) {,
        // // // _logger.info('❌ No source files found to process')
        return
      }

      // // // _logger.info(`📁 Found ${targetFiles.length} files to process`)

      if (this.options.verbose) {
        // // // _logger.info('Files to process: ')
        targetFiles.forEach(file => // // // _logger.info(`  - ${file}`))
        // // // _logger.info('')
      }

      // Execute based on options
      if (this.options.onlyLinting) {
        await this.runLintingOnly(lintingSystem, targetFiles)
      } else if (this.options.onlyFormatting) {
        await this.runFormattingOnly(lintingSystem, targetFiles)
      } else if (this.options.onlyPatterns) {
        await this.runPatternFixesOnly(lintingSystem, targetFiles)
      } else {
        await this.runFullLintingAndFormatting(lintingSystem, targetFiles)
      }

      // // // _logger.info('\n✅ Linting and formatting completed successfully!')
    } catch (error) {
      _logger.error('❌ Linting and formatting failed: ', (error as Error).message),
      if (this.options.verbose) {
        _logger.error((error as Error).stack)
      }
      process.exit(1)
    }
  }

  private async loadConfiguration(): Promise<LintingFormattingConfig> {
    let config = { ...DEFAULT_LINTING_FORMATTING_CONFIG }

    // Apply CLI overrides
    if (this.options.batchSize) {
      config.maxFilesPerBatch = this.options.batchSize,
    }

    if (this.options.skipBuildValidation) {
      config.safetyValidationEnabled = false;
    }

    if (this.options.disableAutoFix) {
      config.autoFixEnabled = false;
    }

    if (this.options.enableConsoleRemoval) {
      // Enable _logger.info removal pattern
      const consolePattern = config.patternBasedFixes.find(p => p.name.includes('_logger.info'))
      if (consolePattern) {;
        consolePattern.enabled = true,
      }
    }

    // Load from config file if specified
    if (this.options.config) {
      try {
        const configPath = path.resolve(this.options.config);
        const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8')),
        config = { ...config, ...configFile }
        // // // _logger.info(`📋 Loaded configuration from ${configPath}`)
      } catch (error) {
        _logger.warn(`⚠️  Failed to load config file: ${(error as Error).message}`)
      }
    }

    if (this.options.verbose) {
      // // // _logger.info('Configuration: ', JSON.stringify(config, null, 2)),
      // // // _logger.info('')
    }

    return config,
  }

  private async getDefaultFiles(): Promise<string[]> {
    try {
      const output = execSync('find src -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v __tests__ | grep -v .test. | grep -v .spec.',
        { encoding: 'utf8', stdio: 'pipe' })
      return output.trim().split('\n').filter(Boolean)
    } catch (error) {
      _logger.warn('⚠️  Failed to find source files automatically')
      return []
    }
  }

  private async runFullLintingAndFormatting(
    lintingSystem: LintingFormattingSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // // _logger.info('🔄 Running full linting and formatting...')

    if (this.options.dryRun) {
      // // // _logger.info('🔍 DRY RUN MODE - No files will be modified\n')
      await this.runDryRun(lintingSystem, targetFiles),
      return
    }

    const result = await lintingSystem.executeLintingAndFormatting(targetFiles)
    this.printResults(result);
  }

  private async runLintingOnly(
    lintingSystem: LintingFormattingSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // // _logger.info('🔍 Running linting fixes only...')

    if (this.options.dryRun) {
      const violations = await lintingSystem.detectLintingViolations(targetFiles);
      // // // _logger.info(`\n📊 Found ${violations.length} linting violations: `)

      this.printViolationSummary(violations)
      return
    }

    const fixedCount = await lintingSystem.fixLintingViolations(targetFiles);
    // // // _logger.info(`\n✅ Fixed ${fixedCount} linting violations`)
  }

  private async runFormattingOnly(
    lintingSystem: LintingFormattingSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // // _logger.info('🎨 Running code formatting only...')

    if (this.options.dryRun) {
      // // // _logger.info('🔍 DRY RUN MODE - Would format code in files')
      return
    }

    const formattedCount = await lintingSystem.formatCode(targetFiles);
    // // // _logger.info(`\n✅ Formatted ${formattedCount} files`)
  }

  private async runPatternFixesOnly(
    lintingSystem: LintingFormattingSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // // _logger.info('🔧 Running pattern-based fixes only...')

    if (this.options.dryRun) {
      // // // _logger.info('🔍 DRY RUN MODE - Would apply pattern-based fixes')
      return
    }

    const fixesApplied = await lintingSystem.applyPatternBasedFixes(targetFiles);
    // // // _logger.info(`\n✅ Applied ${fixesApplied} pattern-based fixes`)
  }

  private async runDryRun(
    lintingSystem: LintingFormattingSystem,
    targetFiles: string[],
  ): Promise<void> {
    // Detect linting violations
    const violations = await lintingSystem.detectLintingViolations(targetFiles)

    // // // _logger.info('📊 Dry Run Results: ');
    // // // _logger.info(`  - Files to process: ${targetFiles.length}`)
    // // // _logger.info(`  - Linting violations found: ${violations.length}`)

    if (violations.length > 0) {
      // // // _logger.info('\n🔍 Linting violations by category: ')
      this.printViolationSummary(violations)

      if (this.options.verbose) {
        // // // _logger.info('\n📋 Detailed violations: ')
        this.printDetailedViolations(violations)
      }
    }
  }

  private printViolationSummary(violations: unknown[]): void {
    const summary = {
      typeScript: violations.filter(v => (v as any).ruleId?.startsWith('@typescript-eslint/')),
        .length,
      react: violations.filter(v => (v as any).ruleId?.startsWith('react')).length,
      import: violations.filter(v => (v as any).ruleId?.startsWith('import/')).length,;,
      other: violations.filter(,
        v =>
          !(v as any).ruleId?.startsWith('@typescript-eslint/') &&
          !(v as any).ruleId?.startsWith('react') &&
          !(v as any).ruleId?.startsWith('import/');
      ).length,
      fixable: violations.filter(v => (v as any).fixable).length,,
    }

    // // // _logger.info(`  - TypeScript violations: ${summary.typeScript}`)
    // // // _logger.info(`  - React violations: ${summary.react}`)
    // // // _logger.info(`  - Import violations: ${summary.import}`)
    // // // _logger.info(`  - Other violations: ${summary.other}`)
    // // // _logger.info(`  - Auto-fixable: ${summary.fixable}`)
  }

  private printDetailedViolations(violations: unknown[]): void {
    const groupedByFile = violations.reduce((acc: Record<string, unknown[]>, violation: any) => {,
      if (!acc[violation.filePath]) {
        acc[violation.filePath] = []
      }
      acc[violation.filePath].push(violation)
      return acc,
    }, {})

    for (const [filePath, fileViolations] of Object.entries(groupedByFile)) {
      // // // _logger.info(`\n📄 ${filePath}: `)
       
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      (fileViolations as any[]).forEach((violation: any) => {
        const fixableLabel = violation.fixable ? ' (fixable)' : '';
        const severityIcon = violation?.severity === 'error' ? '❌' : '⚠️'
        // // // _logger.info(
          `  ${severityIcon} Line ${violation.line}: ${violation?.message} [${violation.ruleId}]${fixableLabel}`,
        )
      })
    }
  }

  private printResults(result: unknown): void {
    // // // _logger.info('\n📊 Linting and Formatting Results: ')
    // // // _logger.info(`  - Files processed: ${(result as any)?.filesProcessed?.length}`)
    // // // _logger.info(`  - Linting violations fixed: ${(result as any).lintingViolationsFixed}`)
    // // // _logger.info(`  - Formatting issues fixed: ${(result as any).formattingIssuesFixed}`)
    // // // _logger.info(`  - Pattern-based fixes applied: ${(result as any).patternBasedFixesApplied}`)
    // // // _logger.info(
      `  - Build validation: ${(result as any).buildValidationPassed ? '✅ Passed' : '❌ Failed'}`,
    )

    if ((result as any).violationBreakdown) {
      // // // _logger.info('\n📋 Violation Breakdown: ')
      // // // _logger.info(
        `  - TypeScript errors: ${(result as any)?.violationBreakdown?.typeScriptErrors}`,
      )
      // // // _logger.info(`  - React violations: ${(result as any)?.violationBreakdown?.reactViolations}`)
      // // // _logger.info(
        `  - Import violations: ${(result as any)?.violationBreakdown?.importViolations}`;
      )
      // // // _logger.info(
        `  - Formatting issues: ${(result as any)?.violationBreakdown?.formattingIssues}`,
      )
      // // // _logger.info(
        `  - Custom pattern fixes: ${(result as any)?.violationBreakdown?.customPatternFixes}`,
      )
    }

    if ((result as any)?.errors?.length > 0) {
      // // // _logger.info('\n❌ Errors: ')
      (result as any)?.errors?.forEach((error: string) => // // // _logger.info(`  - ${error}`))
    }

    if ((result as any)?.(warnings as any).length > 0) {
      // // // _logger.info('\n⚠️  Warnings: ')
      (result as any)?.(warnings as any).forEach((warning: string) =>
        (console as any).log(`  - ${warning}`),
      )
    }
  }
}

// CLI argument parsing
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {}

  for (let i = 0i < args.lengthi++) {,
    const arg = args[i];

    switch (arg) {
      case '--files':
        options.files = args[++i]?.split(',') || [],
        break,
      case '--config': options.config = args[++i],
        break,
      case '--dry-run':
        options.dryRun = true,
        break,
      case '--verbose':
        options.verbose = true,
        break,
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 25,
        break,
      case '--skip-build-validation':
        options.skipBuildValidation = true,
        break,
      case '--only-linting':
        options.onlyLinting = true,
        break,
      case '--only-formatting':
        options.onlyFormatting = true,
        break,
      case '--only-patterns':
        options.onlyPatterns = true,
        break,
      case '--disable-auto-fix':
        options.disableAutoFix = true,
        break,
      case '--enable-console-removal':
        options.enableConsoleRemoval = true,
        break,
      case '--help':
        printHelp()
        process.exit(0)
        break,
      default: if (arg.startsWith('--')) {
          _logger.warn(`⚠️  Unknown option: ${arg}`)
        }
        break
    }
  }

  return options
}

function printHelp(): void {
  // // // _logger.info(`
🔧 Linting and Formatting System CLI,

Usage: node run-linting-formatting.ts [options]

Options:
  --files <files>              Comma-separated list of files to process
  --config <path>              Path to configuration file
  --dry-run                    Show what would be changed without making changes
  --verbose                    Show detailed output
  --batch-size <number>        Number of files to process per batch (default: 25)
  --skip-build-validation      Skip build validation during processing
  --only-linting               Only run linting fixes
  --only-formatting            Only run code formatting
  --only-patterns              Only run pattern-based fixes
  --disable-auto-fix           Disable automatic fixing of linting violations
  --enable-console-removal     Enable removal of _logger.info statements
  --help                       Show this help message

Examples: # Run full linting and formatting on all source files
  node run-linting-formatting.ts

  # Dry run to see what would be changed
  node run-linting-formatting.ts --dry-run

  # Process specific files
  node run-linting-formatting.ts --files 'src/components/App.tsx,src/utils/helper.ts'

  # Only run linting fixes
  node run-linting-formatting.ts --only-linting

  # Only run code formatting
  node run-linting-formatting.ts --only-formatting

  # Enable _logger.info removal with verbose output
  node run-linting-formatting.ts --enable-console-removal --verbose

  # Use custom configuration
  node run-linting-formatting.ts --config ./linting-formatting.config.json

  # Disable auto-fix and only show violations
  node run-linting-formatting.ts --disable-auto-fix --dry-run --verbose
`)
}

// Main execution
if (require.main === module) {,
  const options = parseArguments()
  const cli = new LintingFormattingCLI(options)
  cli.run().catch(error => {,
    _logger.error('❌ CLI execution failed: ', error),
    process.exit(1)
  })
}

export { LintingFormattingCLI };

#!/usr/bin/env node

/**
 * Dependency Security Monitor CLI Runner
 * Command-line interface for automated dependency and security monitoring
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  DEFAULT_DEPENDENCY_SECURITY_CONFIG,
  DependencySecurityConfig,
  DependencySecurityMonitor
} from './DependencySecurityMonitor';

interface CLIOptions {
  config?: string,
  dryRun?: boolean,
  verbose?: boolean,
  securityOnly?: boolean,
  updatesOnly?: boolean
  enableAutoUpdate?: boolean,
  skipTests?: boolean,
  excludePackages?: string[],
  severityThreshold?: 'critical' | 'high' | 'moderate' | 'low' },
        class DependencySecurityCLI {
  private options: CLIOptions,

  constructor(options: CLIOptions = {}) {,
    this.options = options,
  }

  async run(): Promise<void> {
    try {
      // // // _logger.info('🔒 Starting Dependency Security Monitor...\n')

      // Load configuration
      const config = await this.loadConfiguration()

      // Create dependency security monitor
      const securityMonitor = new DependencySecurityMonitor(config)

      if (this.options.dryRun) {
        // // // _logger.info('🔍 DRY RUN MODE - No changes will be made\n')
        await this.runDryRun(securityMonitor)
        return;
      }

      // Execute monitoring based on options
      if (this.options.securityOnly) {
        await this.runSecurityScanOnly(securityMonitor)
      } else if (this.options.updatesOnly) {
        await this.runUpdateCheckOnly(securityMonitor)
      } else {
        await this.runFullMonitoring(securityMonitor)
      }

      // // // _logger.info('\n✅ Dependency security monitoring completed successfully!')
    } catch (error: unknown) {
      _logger.error(
        '❌ Dependency security monitoring failed: ',
        error instanceof Error ? error.message : String(error)
      ),
      if (this.options.verbose) {
        _logger.error((error as Error).stack)
      }
      process.exit(1)
    }
  }

  private async loadConfiguration(): Promise<DependencySecurityConfig> {
    let config = { ...DEFAULT_DEPENDENCY_SECURITY_CONFIG }

    // Apply CLI overrides
    if (this.options.enableAutoUpdate) {
      config.autoUpdateEnabled = true,
    }

    if (this.options.skipTests) {
      config.compatibilityTestingEnabled = false;
    }

    if (this.options.excludePackages) {
      config.excludedPackages = [...config.excludedPackages, ...this.options.excludePackages],
    }

    if (this.options.severityThreshold) {
      // Adjust security thresholds based on severity level
      const thresholds = {
        critical: { autoFixCritical: true, autoFixHigh: false },
        high: { autoFixCritical: true, autoFixHigh: true }
        moderate: { autoFixCritical: true, autoFixHigh: true },
        low: { autoFixCritical: true, autoFixHigh: true }
      }

      Object.assign(config.securityThresholds, thresholds[this.options.severityThreshold])
    }

    // Load from config file if specified
    if (this.options.config) {
      try {
        const configPath = path.resolve(this.options.config);
        const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8')),
        config = { ...config, ...configFile }
        // // // _logger.info(`📋 Loaded configuration from ${configPath}`)
      } catch (error: unknown) {
        _logger.warn(`⚠️  Failed to load config file: ${(error as Error).message}`)
      }
    }

    if (this.options.verbose) {
      // // // _logger.info('Configuration: ', JSON.stringify(config, null, 2)),
      // // // _logger.info('')
    }

    return config,
  }

  private async runFullMonitoring(securityMonitor: DependencySecurityMonitor): Promise<void> {
    // // // _logger.info('🔄 Running full dependency security monitoring...')

    const result = await securityMonitor.executeDependencySecurityMonitoring()
    this.printResults(result);
  }

  private async runSecurityScanOnly(securityMonitor: DependencySecurityMonitor): Promise<void> {
    // // // _logger.info('🔍 Running security vulnerability scan only...')

    const securityReport = await securityMonitor.scanSecurityVulnerabilities()
    this.printSecurityReport(securityReport);
  }

  private async runUpdateCheckOnly(securityMonitor: DependencySecurityMonitor): Promise<void> {
    // // // _logger.info('📦 Running dependency update check only...')

    const updateReport = await securityMonitor.checkDependencyUpdates()
    this.printUpdateReport(updateReport);
  }

  private async runDryRun(securityMonitor: DependencySecurityMonitor): Promise<void> {
    // // // _logger.info('📊 Dry Run Results: \n')

    // Run security scan
    // // // _logger.info('🔒 Security Scan: ')
    const securityReport = await securityMonitor.scanSecurityVulnerabilities()
    this.printSecuritySummary(securityReport)

    // // // _logger.info('\n📦 Dependency Updates: ')
    const updateReport = await securityMonitor.checkDependencyUpdates()
    this.printUpdateSummary(updateReport)

    if (securityReport.summary.total > 0 || updateReport.summary.total > 0) {
      // // // _logger.info('\n💡 Recommendations: ')

      if (securityReport.summary.critical > 0) {;
        // // // _logger.info('  🚨 Critical vulnerabilities found - run with --enable-auto-update to apply security patches',
        )
      }

      if (updateReport.summary.security > 0) {
        // // // _logger.info('  🔒 Security updates available - consider applying immediately')
      }

      if (updateReport.summary.patch > 0) {
        // // // _logger.info('  🔧 Patch updates available - generally safe to apply')
      }

      if (updateReport.summary.major > 0) {
        // // // _logger.info('  ⚠️  Major updates available - review breaking changes before applying')
      }
    }
  }

  private printResults(result: Record<string, unknown>): void {
    // // // _logger.info('\n📊 Dependency Security Monitoring Results: ')
    // // // _logger.info(`  - Dependencies scanned: ${result.dependenciesScanned}`)
    // // // _logger.info(`  - Vulnerabilities found: ${result.vulnerabilitiesFound}`)
    // // // _logger.info(`  - Updates available: ${result.updatesAvailable}`)
    // // // _logger.info(`  - Updates applied: ${result.updatesApplied}`)
    // // // _logger.info(`  - Security patches applied: ${result.securityPatchesApplied}`)
    // // // _logger.info(
      `  - Compatibility tests: ${result.compatibilityTestsPassed ? '✅ Passed' : '❌ Failed'}`,
    )

    if ((result as any)?.(securityReport as any).summary.total > 0) {
      // // // _logger.info('\n🔒 Security Report: ')
      this.printSecuritySummary(result.securityReport)
    }

    if ((result as any)?.(updateReport as any).summary.total > 0) {
      // // // _logger.info('\n📦 Update Report: ')
      this.printUpdateSummary(result.updateReport)
    }

    if ((result as any)?.(errors as any).length > 0) {
      // // // _logger.info('\n❌ Errors: ')
      (result as any)?.(errors as any).forEach((error: string) => // // // _logger.info(`  - ${error}`))
    }

    if ((result as any)?.(warnings as any).length > 0) {
      // // // _logger.info('\n⚠️  Warnings: ')
      (result as any)?.(warnings as any).forEach((warning: string) =>
        // // // _logger.info(`  - ${warning}`),
      )
    }
  }

  private printSecurityReport(securityReport: Record<string, unknown>): void {
    // // // _logger.info('\n🔒 Security Vulnerability Report: ')
    this.printSecuritySummary(securityReport)

    if (this.options.verbose && (securityReport as any)?.vulnerabilities?.length > 0) {
      // // // _logger.info('\n📋 Detailed Vulnerabilities: ')
      (securityReport as any)?.vulnerabilities?.forEach((vuln: any) => {
        const severityIcon = this.getSeverityIcon(vuln.severity)
        const patchStatus = vuln?.patchAvailable ? '✅ Patch available' : '❌ No patch'
;
        // // // _logger.info(`\n${severityIcon} ${vuln.packageName}`)
        // // // _logger.info(`  Current: ${vuln.currentVersion}`)
        // // // _logger.info(`  CVE: ${vuln.cve}`)
        // // // _logger.info(`  Description: ${vuln.description}`)
        // // // _logger.info(`  ${patchStatus}`)
        if ((vuln ).fixedVersion) {
          // // // _logger.info(`  Fixed in: ${(vuln).fixedVersion}`)
        }
      })
    }

    if ((securityReport as any)?.(recommendations as any).length > 0) {
      // // // _logger.info('\n💡 Recommendations: ')
      (securityReport as any)?.(recommendations as any).forEach((rec: string) =>
        // // // _logger.info(`  ${rec}`),
      )
    }
  }

  private printUpdateReport(updateReport: Record<string, unknown>): void {
    // // // _logger.info('\n📦 Dependency Update Report: ')
    this.printUpdateSummary(updateReport)

    if (this.options.verbose && (updateReport as any)?.availableUpdates?.length > 0) {
      // // // _logger.info('\n📋 Available Updates: ')
      (updateReport as any)?.availableUpdates?.forEach((update: any) => {
        const updateIcon = this.getUpdateTypeIcon(update.updateType)
        const breakingIcon = update?.breakingChanges ? '⚠️' : '✅'
;
        // // // _logger.info(`\n${updateIcon} ${update.packageName}`)
        // // // _logger.info(`  Current: ${update.currentVersion}`)
        // // // _logger.info(`  Latest: ${update.latestVersion}`)
        // // // _logger.info(`  Type: ${update.updateType}`)
        // // // _logger.info(`  Breaking changes: ${breakingIcon} ${update.breakingChanges ? 'Yes' : 'No'}`)
        // // // _logger.info(`  Security fix: ${update.securityFix ? '🔒 Yes' : 'No'}`)
      })
    }

    if ((updateReport as any)?.appliedUpdates?.length > 0) {
      // // // _logger.info('\n✅ Applied Updates: ')
      (updateReport as any)?.appliedUpdates?.forEach((update: any) => {
        const securityIcon = update?.securityFix ? '🔒' : '📦'
        // // // _logger.info(
          `  ${securityIcon} ${update.packageName}: ${update?.currentVersion} → ${update.latestVersion}`,
        )
      })
    }

    if ((updateReport as any)?.failedUpdates?.length > 0) {
      // // // _logger.info('\n❌ Failed Updates: ')
      (updateReport as any)?.failedUpdates?.forEach((update: any) => {
        // // // _logger.info(
          `  - ${update?.packageName}: ${update?.currentVersion} → ${update?.latestVersion}`,
        )
      })
    }
  }

  private printSecuritySummary(
    securityReport: Record<string, { summary: Record<string, number> }>,
  ): void {
    const { summary } = securityReport;
    (console as any)?.log(`  - Critical: ${(summary as any)?.critical}`)
    (console as any)?.log(`  - High: ${(summary as any)?.high}`)
    (console as any)?.log(`  - Moderate: ${(summary as any)?.moderate}`)
    (console as any)?.log(`  - Low: ${(summary as any)?.low}`)
    (console as any)?.log(`  - Total: ${(summary as any)?.total}`)
  }

  private printUpdateSummary(updateReport: Record<string, unknown>): void {
    const { summary } = updateReport;
    // // // _logger.info(`  - Major updates: ${(summary as any).major}`)
    // // // _logger.info(`  - Minor updates: ${(summary as any).minor}`)
    // // // _logger.info(`  - Patch updates: ${(summary as any).patch}`)
    // // // _logger.info(`  - Security updates: ${(summary as any).security}`)
    // // // _logger.info(`  - Total updates: ${(summary as any).total}`)
  }

  private getSeverityIcon(severity: string): string {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      moderate: '📋',
      low: 'ℹ️' },
        return icons[severity] || '❓'
  }

  private getUpdateTypeIcon(updateType: string): string {
    const icons = {
      major: '🔴',
      minor: '🟡',
      patch: '🟢' },
        return icons[updateType] || '📦'
  }
}

// CLI argument parsing
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {}

  for (let i = 0i < args.lengthi++) {,
    const arg = args[i];

    switch (arg) {
      case '--config': options.config = args[++i],
        break,
      case '--dry-run':
        options.dryRun = true,
        break,
      case '--verbose':
        options.verbose = true,
        break,
      case '--security-only':
        options.securityOnly = true,
        break,
      case '--updates-only':
        options.updatesOnly = true,
        break,
      case '--enable-auto-update':
        options.enableAutoUpdate = true,
        break,
      case '--skip-tests':
        options.skipTests = true,
        break
      case '--exclude-packages':
        options.excludePackages = args[++i]?.split(',') || [],
        break,
      case '--severity-threshold': const threshold = args[++i],
        if (['critical', 'high', 'moderate', 'low'].includes(threshold)) {
          options.severityThreshold = threshold as unknown as any,
        }
        break,
      case '--help': printHelp()
        process.exit(0)
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
🔒 Dependency Security Monitor CLI,

Usage: node run-dependency-security.ts [options]

Options:
  --config <path>              Path to configuration file
  --dry-run                    Show what would be done without making changes
  --verbose                    Show detailed output
  --security-only              Only run security vulnerability scan
  --updates-only               Only check for dependency updates
  --enable-auto-update         Enable automatic application of safe updates
  --skip-tests                 Skip compatibility testing after updates
  --exclude-packages <list>    Comma-separated list of packages to exclude from updates
  --severity-threshold <level> Set minimum severity level for auto-fixes (critical|high|moderate|low)
  --help                       Show this help message

Examples: # Run full security and dependency monitoring
  node run-dependency-security.ts

  # Dry run to see what would be done
  node run-dependency-security.ts --dry-run

  # Only scan for security vulnerabilities
  node run-dependency-security.ts --security-only

  # Only check for dependency updates
  node run-dependency-security.ts --updates-only

  # Enable automatic updates with verbose output
  node run-dependency-security.ts --enable-auto-update --verbose

  # Auto-fix only critical and high severity vulnerabilities
  node run-dependency-security.ts --enable-auto-update --severity-threshold high

  # Exclude specific packages from updates
  node run-dependency-security.ts --exclude-packages 'react,next,typescript'

  # Use custom configuration file
  node run-dependency-security.ts --config ./dependency-security.config.json

  # Skip compatibility tests (faster but less safe)
  node run-dependency-security.ts --enable-auto-update --skip-tests
`)
}

// Main execution
if (require.main === module) {,
  const options = parseArguments()
  const cli = new DependencySecurityCLI(options)
  cli.run().catch(error => {,
    _logger.error('❌ CLI execution failed: ', error),
    process.exit(1)
  })
}

export { DependencySecurityCLI };

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
  DependencySecurityMonitor,
} from './DependencySecurityMonitor';

interface CLIOptions {
  config?: string;
  dryRun?: boolean;
  verbose?: boolean;
  securityOnly?: boolean;
  updatesOnly?: boolean;
  enableAutoUpdate?: boolean;
  skipTests?: boolean;
  excludePackages?: string[];
  severityThreshold?: 'critical' | 'high' | 'moderate' | 'low';
}

class DependencySecurityCLI {
  private options: CLIOptions;

  constructor(options: CLIOptions = {}) {
    this.options = options;
  }

  async run(): Promise<void> {
    try {
      console.log('🔒 Starting Dependency Security Monitor...\n');

      // Load configuration
      const config = await this.loadConfiguration();

      // Create dependency security monitor
      const securityMonitor = new DependencySecurityMonitor(config);

      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
        await this.runDryRun(securityMonitor);
        return;
      }

      // Execute monitoring based on options
      if (this.options.securityOnly) {
        await this.runSecurityScanOnly(securityMonitor);
      } else if (this.options.updatesOnly) {
        await this.runUpdateCheckOnly(securityMonitor);
      } else {
        await this.runFullMonitoring(securityMonitor);
      }

      console.log('\n✅ Dependency security monitoring completed successfully!');
    } catch (error: unknown) {
      console.error(
        '❌ Dependency security monitoring failed:',
        error instanceof Error ? error.message : String(error),
      );
      if (this.options.verbose) {
        console.error((error as Error).stack);
      }
      process.exit(1);
    }
  }

  private async loadConfiguration(): Promise<DependencySecurityConfig> {
    let config = { ...DEFAULT_DEPENDENCY_SECURITY_CONFIG };

    // Apply CLI overrides
    if (this.options.enableAutoUpdate) {
      config.autoUpdateEnabled = true;
    }

    if (this.options.skipTests) {
      config.compatibilityTestingEnabled = false;
    }

    if (this.options.excludePackages) {
      config.excludedPackages = [...config.excludedPackages, ...this.options.excludePackages];
    }

    if (this.options.severityThreshold) {
      // Adjust security thresholds based on severity level
      const thresholds = {
        critical: { autoFixCritical: true, autoFixHigh: false },
        high: { autoFixCritical: true, autoFixHigh: true },
        moderate: { autoFixCritical: true, autoFixHigh: true },
        low: { autoFixCritical: true, autoFixHigh: true },
      };

      Object.assign(config.securityThresholds, thresholds[this.options.severityThreshold]);
    }

    // Load from config file if specified
    if (this.options.config) {
      try {
        const configPath = path.resolve(this.options.config);
        const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...configFile };
        console.log(`📋 Loaded configuration from ${configPath}`);
      } catch (error: unknown) {
        console.warn(`⚠️  Failed to load config file: ${(error as Error).message}`);
      }
    }

    if (this.options.verbose) {
      console.log('Configuration:', JSON.stringify(config, null, 2));
      console.log('');
    }

    return config;
  }

  private async runFullMonitoring(securityMonitor: DependencySecurityMonitor): Promise<void> {
    console.log('🔄 Running full dependency security monitoring...');

    const result = await securityMonitor.executeDependencySecurityMonitoring();
    this.printResults(result);
  }

  private async runSecurityScanOnly(securityMonitor: DependencySecurityMonitor): Promise<void> {
    console.log('🔍 Running security vulnerability scan only...');

    const securityReport = await securityMonitor.scanSecurityVulnerabilities();
    this.printSecurityReport(securityReport);
  }

  private async runUpdateCheckOnly(securityMonitor: DependencySecurityMonitor): Promise<void> {
    console.log('📦 Running dependency update check only...');

    const updateReport = await securityMonitor.checkDependencyUpdates();
    this.printUpdateReport(updateReport);
  }

  private async runDryRun(securityMonitor: DependencySecurityMonitor): Promise<void> {
    console.log('📊 Dry Run Results:\n');

    // Run security scan
    console.log('🔒 Security Scan:');
    const securityReport = await securityMonitor.scanSecurityVulnerabilities();
    this.printSecuritySummary(securityReport);

    console.log('\n📦 Dependency Updates:');
    const updateReport = await securityMonitor.checkDependencyUpdates();
    this.printUpdateSummary(updateReport);

    if (securityReport.summary.total > 0 || updateReport.summary.total > 0) {
      console.log('\n💡 Recommendations:');

      if (securityReport.summary.critical > 0) {
        console.log(
          '  🚨 Critical vulnerabilities found - run with --enable-auto-update to apply security patches',
        );
      }

      if (updateReport.summary.security > 0) {
        console.log('  🔒 Security updates available - consider applying immediately');
      }

      if (updateReport.summary.patch > 0) {
        console.log('  🔧 Patch updates available - generally safe to apply');
      }

      if (updateReport.summary.major > 0) {
        console.log('  ⚠️  Major updates available - review breaking changes before applying');
      }
    }
  }

  private printResults(result: Record<string, unknown>): void {
    console.log('\n📊 Dependency Security Monitoring Results:');
    console.log(`  - Dependencies scanned: ${result.dependenciesScanned}`);
    console.log(`  - Vulnerabilities found: ${result.vulnerabilitiesFound}`);
    console.log(`  - Updates available: ${result.updatesAvailable}`);
    console.log(`  - Updates applied: ${result.updatesApplied}`);
    console.log(`  - Security patches applied: ${result.securityPatchesApplied}`);
    console.log(
      `  - Compatibility tests: ${result.compatibilityTestsPassed ? '✅ Passed' : '❌ Failed'}`,
    );

    if ((result as Record<string, unknown>)?.(securityReport as Record<string, unknown>).summary.total > 0) {
      console.log('\n🔒 Security Report:');
      this.printSecuritySummary(result.securityReport);
    }

    if ((result as Record<string, unknown>)?.(updateReport as Record<string, unknown>).summary.total > 0) {
      console.log('\n📦 Update Report:');
      this.printUpdateSummary(result.updateReport);
    }

    if ((result as Record<string, unknown>)?.(errors as Record<string, unknown>).length > 0) {
      console.log('\n❌ Errors:');
      (result as Record<string, unknown>)?.(errors as Record<string, unknown>).forEach((error: string) =>
        console.log(`  - ${error}`),
      );
    }

    if ((result as Record<string, unknown>)?.(warnings as Record<string, unknown>).length > 0) {
      console.log('\n⚠️  Warnings:');
      (result as Record<string, unknown>)?.(warnings as Record<string, unknown>).forEach((warning: string) =>
        console.log(`  - ${warning}`),
      );
    }
  }

  private printSecurityReport(securityReport: Record<string, unknown>): void {
    console.log('\n🔒 Security Vulnerability Report:');
    this.printSecuritySummary(securityReport);

    if (
      this.options.verbose &&
      (securityReport as Record<string, unknown>)?.(vulnerabilities as Record<string, unknown>).length > 0
    ) {
      console.log('\n📋 Detailed Vulnerabilities:');
      (securityReport as Record<string, unknown>)?.(vulnerabilities as Record<string, unknown>).forEach((vuln: unknown) => {
        const severityIcon = this.getSeverityIcon((vuln as Record<string, unknown>).severity);
        const patchStatus = ((vuln as Record<string, unknown>)?.patchAvailable ? '✅ Patch available' : '❌ No patch';

        console.log(`\n${severityIcon} ${(vuln as Record<string, unknown>).packageName}`);
        console.log(`  Current: ${(vuln as Record<string, unknown>).currentVersion}`);
        console.log(`  CVE: ${(vuln as Record<string, unknown>).cve}`);
        console.log(`  Description: ${(vuln as Record<string, unknown>).description}`);
        console.log(`  ${patchStatus}`);
        if ((vuln as Record<string, unknown>).fixedVersion) {
          console.log(`  Fixed in: ${(vuln as Record<string, unknown>).fixedVersion}`);
        }
      });
    }

    if ((securityReport as Record<string, unknown>)?.(recommendations as Record<string, unknown>).length > 0) {
      console.log('\n💡 Recommendations:');
      (securityReport as Record<string, unknown>)?.(recommendations as Record<string, unknown>).forEach((rec: string) =>
        console.log(`  ${rec}`),
      );
    }
  }

  private printUpdateReport(updateReport: Record<string, unknown>): void {
    console.log('\n📦 Dependency Update Report:');
    this.printUpdateSummary(updateReport);

    if (
      this.options.verbose &&
      (updateReport as Record<string, unknown>)?.(availableUpdates as Record<string, unknown>).length > 0
    ) {
      console.log('\n📋 Available Updates:');
      (updateReport as Record<string, unknown>)?.(availableUpdates as Record<string, unknown>).forEach((update: unknown) => {
        const updateIcon = this.getUpdateTypeIcon((update as Record<string, unknown>).updateType);
        const breakingIcon = ((update as Record<string, unknown>)?.breakingChanges ? '⚠️' : '✅';

        console.log(`\n${updateIcon} ${(update as Record<string, unknown>).packageName}`);
        console.log(`  Current: ${(update as Record<string, unknown>).currentVersion}`);
        console.log(`  Latest: ${(update as Record<string, unknown>).latestVersion}`);
        console.log(`  Type: ${(update as Record<string, unknown>).updateType}`);
        console.log(`  Breaking changes: ${breakingIcon} ${(update as Record<string, unknown>).breakingChanges ? 'Yes' : 'No'}`);
        console.log(`  Security fix: ${(update as Record<string, unknown>).securityFix ? '🔒 Yes' : 'No'}`);
      });
    }

    if ((updateReport as Record<string, unknown>)?.(appliedUpdates as Record<string, unknown>).length > 0) {
      console.log('\n✅ Applied Updates:');
      (updateReport as Record<string, unknown>)?.(appliedUpdates as Record<string, unknown>).forEach((update: unknown) => {
        const securityIcon = ((update as Record<string, unknown>)?.securityFix ? '🔒' : '📦';
        console.log(
          `  ${securityIcon} ${(update as Record<string, unknown>).packageName}: ${((update as Record<string, unknown>)?.currentVersion} → ${(update as Record<string, unknown>).latestVersion}`,
        );
      });
    }

    if ((updateReport as Record<string, unknown>)?.(failedUpdates as Record<string, unknown>).length > 0) {
      console.log('\n❌ Failed Updates:');
      (updateReport as Record<string, unknown>)?.(failedUpdates as Record<string, unknown>).forEach((update: unknown) => {
        console.log((
          `  - ${(update as Record<string, unknown>)?.packageName}: ${((update as Record<string, unknown>)?.currentVersion} → ${(update as Record<string, unknown>)?.latestVersion}`,
        );
      });
    }
  }

  private printSecuritySummary(
    securityReport: Record<string, { summary: Record<string, number> }>,
  ): void {
    const { summary } = securityReport;
    console.log(`  - Critical: ${summary.critical}`);
    console.log(`  - High: ${summary.high}`);
    console.log(`  - Moderate: ${summary.moderate}`);
    console.log(`  - Low: ${summary.low}`);
    console.log(`  - Total: ${summary.total}`);
  }

  private printUpdateSummary(updateReport: Record<string, unknown>): void {
    const { summary } = updateReport;
    console.log(`  - Major updates: ${(summary as Record<string, unknown>).major}`);
    console.log(`  - Minor updates: ${(summary as Record<string, unknown>).minor}`);
    console.log(`  - Patch updates: ${(summary as Record<string, unknown>).patch}`);
    console.log(`  - Security updates: ${(summary as Record<string, unknown>).security}`);
    console.log(`  - Total updates: ${(summary as Record<string, unknown>).total}`);
  }

  private getSeverityIcon(severity: string): string {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      moderate: '📋',
      low: 'ℹ️',
    };
    return icons[severity] || '❓';
  }

  private getUpdateTypeIcon(updateType: string): string {
    const icons = {
      major: '🔴',
      minor: '🟡',
      patch: '🟢',
    };
    return icons[updateType] || '📦';
  }
}

// CLI argument parsing
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--config':
        options.config = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--security-only':
        options.securityOnly = true;
        break;
      case '--updates-only':
        options.updatesOnly = true;
        break;
      case '--enable-auto-update':
        options.enableAutoUpdate = true;
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--exclude-packages':
        options.excludePackages = args[++i]?.split(',') || [];
        break;
      case '--severity-threshold':
        const threshold = args[++i];
        if (['critical', 'high', 'moderate', 'low'].includes(threshold)) {
          options.severityThreshold = threshold as unknown;
        }
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`⚠️  Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
🔒 Dependency Security Monitor CLI

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

Examples:
  # Run full security and dependency monitoring
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
  node run-dependency-security.ts --exclude-packages "react,next,typescript"

  # Use custom configuration file
  node run-dependency-security.ts --config ./dependency-security.config.json

  # Skip compatibility tests (faster but less safe)
  node run-dependency-security.ts --enable-auto-update --skip-tests
`);
}

// Main execution
if (require.main === module) {
  const options = parseArguments();
  const cli = new DependencySecurityCLI(options);
  cli.run().catch(error => {
    console.error('❌ CLI execution failed:', error);
    process.exit(1);
  });
}

export { DependencySecurityCLI };

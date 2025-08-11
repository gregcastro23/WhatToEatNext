/**
 * Dependency and Security Monitoring System
 * Automated dependency update monitoring and security vulnerability scanning
 * Part of the Kiro Optimization Campaign System
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../utils/logger';

export interface DependencySecurityConfig {
  maxDependenciesPerBatch: number;
  safetyValidationEnabled: boolean;
  autoUpdateEnabled: boolean;
  securityScanEnabled: boolean;
  compatibilityTestingEnabled: boolean;
  updateStrategies: UpdateStrategy[];
  securityThresholds: SecurityThresholds;
  excludedPackages: string[];
}

export interface UpdateStrategy {
  name: string;
  description: string;
  pattern: RegExp;
  updateType: 'major' | 'minor' | 'patch' | 'none';
  requiresManualApproval: boolean;
  testingRequired: boolean;
}

export interface SecurityThresholds {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  autoFixCritical: boolean;
  autoFixHigh: boolean;
}

export interface DependencySecurityResult {
  dependenciesScanned: number;
  vulnerabilitiesFound: number;
  updatesAvailable: number;
  updatesApplied: number;
  securityPatchesApplied: number;
  compatibilityTestsPassed: boolean;
  errors: string[];
  warnings: string[];
  securityReport: SecurityReport;
  updateReport: UpdateReport;
}

export interface SecurityReport {
  vulnerabilities: SecurityVulnerability[];
  summary: SecuritySummary;
  recommendations: string[];
}

export interface SecurityVulnerability {
  packageName: string;
  currentVersion: string;
  vulnerableVersions: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  cve: string;
  description: string;
  fixedVersion?: string;
  patchAvailable: boolean;
}

export interface SecuritySummary {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  total: number;
}

export interface UpdateReport {
  availableUpdates: DependencyUpdate[];
  appliedUpdates: DependencyUpdate[];
  failedUpdates: DependencyUpdate[];
  summary: UpdateSummary;
}

export interface DependencyUpdate {
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  updateType: 'major' | 'minor' | 'patch';
  changelogUrl?: string;
  breakingChanges: boolean;
  securityFix: boolean;
  testingRequired: boolean;
}

export interface UpdateSummary {
  major: number;
  minor: number;
  patch: number;
  security: number;
  total: number;
}

export interface PackageInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  wantedVersion: string;
  type: 'dependencies' | 'devDependencies';
  homepage?: string;
  repository?: string;
}

export class DependencySecurityMonitor {
  private config: DependencySecurityConfig;
  private packageJsonPath: string;

  constructor(config: DependencySecurityConfig, packageJsonPath: string = 'package.json') {
    this.config = config;
    this.packageJsonPath = packageJsonPath;
  }

  /**
   * Execute comprehensive dependency and security monitoring
   */
  async executeDependencySecurityMonitoring(): Promise<DependencySecurityResult> {
    const startTime = Date.now();
    logger.info('Starting dependency and security monitoring');

    try {
      const result: DependencySecurityResult = {
        dependenciesScanned: 0,
        vulnerabilitiesFound: 0,
        updatesAvailable: 0,
        updatesApplied: 0,
        securityPatchesApplied: 0,
        compatibilityTestsPassed: true,
        errors: [],
        warnings: [],
        securityReport: {
          vulnerabilities: [],
          summary: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 },
          recommendations: [],
        },
        updateReport: {
          availableUpdates: [],
          appliedUpdates: [],
          failedUpdates: [],
          summary: { major: 0, minor: 0, patch: 0, security: 0, total: 0 },
        },
      };

      // Step 1: Scan for security vulnerabilities
      if (this.config.securityScanEnabled) {
        try {
          result.securityReport = await this.scanSecurityVulnerabilities();
          result.vulnerabilitiesFound = result.securityReport.summary.total;
        } catch (error) {
          result.errors.push(
            `Security scan failed: ${(error as Record<string, unknown>).message || 'Unknown error'}`,
          );
        }
      }

      // Step 2: Check for dependency updates
      try {
        result.updateReport = await this.checkDependencyUpdates();
        result.updatesAvailable = result.updateReport.summary.total;
        result.dependenciesScanned = await this.getDependencyCount();
      } catch (error) {
        result.errors.push(
          `Dependency update check failed: ${(error as Record<string, unknown>).message || 'Unknown error'}`,
        );
      }

      // Step 3: Apply security patches automatically if enabled
      if (this.config.autoUpdateEnabled) {
        try {
          const securityUpdates = await this.applySecurityPatches(
            result.securityReport.vulnerabilities,
          );
          result.securityPatchesApplied = securityUpdates.length;
          result.updateReport.appliedUpdates.push(...securityUpdates);
        } catch (error) {
          result.errors.push(
            `Security patch application failed: ${(error as Record<string, unknown>).message || 'Unknown error'}`,
          );
        }
      }

      // Step 4: Apply safe dependency updates
      if (this.config.autoUpdateEnabled) {
        try {
          const safeUpdates = await this.applySafeUpdates(result.updateReport.availableUpdates);
          result.updatesApplied = safeUpdates.length;
          result.updateReport.appliedUpdates.push(...safeUpdates);
        } catch (error) {
          result.errors.push(
            `Safe update application failed: ${(error as Record<string, unknown>).message || 'Unknown error'}`,
          );
        }
      }

      // Step 5: Run compatibility tests if enabled
      if (this.config.compatibilityTestingEnabled && result.updatesApplied > 0) {
        try {
          result.compatibilityTestsPassed = await this.runCompatibilityTests();
        } catch (error) {
          result.errors.push(
            `Compatibility testing failed: ${(error as Record<string, unknown>).message || 'Unknown error'}`,
          );
          result.compatibilityTestsPassed = false;
        }
      }

      const executionTime = Date.now() - startTime;
      logger.info(`Dependency and security monitoring completed in ${executionTime}ms`, {
        dependenciesScanned: result.dependenciesScanned,
        vulnerabilitiesFound: result.vulnerabilitiesFound,
        updatesApplied: result.updatesApplied,
      });

      return result;
    } catch (error) {
      logger.error('Dependency and security monitoring failed', error);
      return {
        dependenciesScanned: 0,
        vulnerabilitiesFound: 0,
        updatesAvailable: 0,
        updatesApplied: 0,
        securityPatchesApplied: 0,
        compatibilityTestsPassed: false,
        errors: [String((error as Record<string, unknown>).message || 'Unknown error')],
        warnings: [],
        securityReport: {
          vulnerabilities: [],
          summary: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 },
          recommendations: [],
        },
        updateReport: {
          availableUpdates: [],
          appliedUpdates: [],
          failedUpdates: [],
          summary: { major: 0, minor: 0, patch: 0, security: 0, total: 0 },
        },
      };
    }
  }

  /**
   * Scan for security vulnerabilities using yarn audit
   */
  async scanSecurityVulnerabilities(): Promise<SecurityReport> {
    try {
      const auditOutput = execSync('yarn audit --json', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      });

      const auditData = JSON.parse(auditOutput);
      const vulnerabilities: SecurityVulnerability[] = [];
      const summary: SecuritySummary = { critical: 0, high: 0, moderate: 0, low: 0, total: 0 };

      // Parse npm audit output
      if (auditData.vulnerabilities) {
        for (const [packageName, vulnData] of Object.entries(auditData.vulnerabilities)) {
          const vuln = vulnData as unknown as {
            via?: Array<{ range?: string; severity?: string; title?: string }>;
            range?: string;
            severity?: string;
            name?: string;
            [key: string]: unknown;
          };

          const vulnerability: SecurityVulnerability = {
            packageName,
            currentVersion: vuln.via?.[0]?.range || 'unknown',
            vulnerableVersions: vuln.range || 'unknown',
            severity: vuln.severity,
            cve: vuln.via?.[0]?.source || 'N/A',
            description: vuln.via?.[0]?.title || 'No description available',
            fixedVersion: vuln.fixAvailable?.version,
            patchAvailable: !!vuln.fixAvailable,
          };

          vulnerabilities.push(vulnerability);
          summary[vuln.severity]++;
          summary.total++;
        }
      }

      const recommendations = this.generateSecurityRecommendations(vulnerabilities, summary);

      return {
        vulnerabilities,
        summary,
        recommendations,
      };
    } catch (error) {
      logger.error('Security vulnerability scan failed', error);
      return {
        vulnerabilities: [],
        summary: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 },
        recommendations: ['Failed to scan for vulnerabilities. Please run yarn audit manually.'],
      };
    }
  }

  /**
   * Check for available dependency updates
   */
  async checkDependencyUpdates(): Promise<UpdateReport> {
    try {
      const outdatedOutput = execSync('yarn outdated --json', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      });

      const outdatedData = JSON.parse(outdatedOutput || '{}');
      const availableUpdates: DependencyUpdate[] = [];
      const summary: UpdateSummary = { major: 0, minor: 0, patch: 0, security: 0, total: 0 };

      for (const [packageName, updateInfo] of Object.entries(outdatedData)) {
        const info = updateInfo as unknown as {
          current?: string;
          wanted?: string;
          latest?: string;
          dependent?: string;
          location?: string;
          [key: string]: unknown;
        };

        const updateType = this.determineUpdateType(info.current, info.latest);
        const breakingChanges = updateType === 'major';

        const update: DependencyUpdate = {
          packageName,
          currentVersion: info.current,
          latestVersion: info.latest,
          updateType,
          changelogUrl: await this.getChangelogUrl(packageName),
          breakingChanges,
          securityFix: false, // Will be determined by cross-referencing with security scan
          testingRequired: breakingChanges || this.requiresTesting(packageName),
        };

        availableUpdates.push(update);
        summary[updateType]++;
        summary.total++;
      }

      return {
        availableUpdates,
        appliedUpdates: [],
        failedUpdates: [],
        summary,
      };
    } catch (error) {
      // yarn outdated returns non-zero exit code when updates are available
      if ((error as unknown as { stdout?: string }).stdout) {
        try {
          const outdatedData = JSON.parse((error as unknown as { stdout: string }).stdout || '{}');
          // Process the data as above
          return this.processOutdatedData(outdatedData);
        } catch (parseError) {
          logger.error('Failed to parse yarn outdated output', parseError);
        }
      }

      return {
        availableUpdates: [],
        appliedUpdates: [],
        failedUpdates: [],
        summary: { major: 0, minor: 0, patch: 0, security: 0, total: 0 },
      };
    }
  }

  /**
   * Apply security patches automatically
   */
  async applySecurityPatches(
    vulnerabilities: SecurityVulnerability[],
  ): Promise<DependencyUpdate[]> {
    const appliedUpdates: DependencyUpdate[] = [];

    for (const vuln of vulnerabilities) {
      if (!vuln.patchAvailable) continue;

      const shouldAutoFix = this.shouldAutoFixVulnerability(vuln.severity);
      if (!shouldAutoFix) continue;

      if (this.config.excludedPackages.includes(vuln.packageName)) {
        logger.info(`Skipping excluded package: ${vuln.packageName}`);
        continue;
      }

      try {
        // Apply the security fix
        const updateCommand = vuln.fixedVersion
          ? `yarn add ${vuln.packageName}@${vuln.fixedVersion}`
          : `yarn audit --fix`;

        execSync(updateCommand, {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 120000,
        });

        const update: DependencyUpdate = {
          packageName: vuln.packageName,
          currentVersion: vuln.currentVersion,
          latestVersion: vuln.fixedVersion || 'patched',
          updateType: 'patch',
          breakingChanges: false,
          securityFix: true,
          testingRequired: false,
        };

        appliedUpdates.push(update);
        logger.info(`Applied security patch for ${vuln.packageName}`);
      } catch (error) {
        logger.error(`Failed to apply security patch for ${vuln.packageName}`, error);
      }
    }

    return appliedUpdates;
  }

  /**
   * Apply safe dependency updates
   */
  async applySafeUpdates(availableUpdates: DependencyUpdate[]): Promise<DependencyUpdate[]> {
    const appliedUpdates: DependencyUpdate[] = [];

    for (const update of availableUpdates) {
      if (this.config.excludedPackages.includes(update.packageName)) {
        logger.info(`Skipping excluded package: ${update.packageName}`);
        continue;
      }

      const strategy = this.getUpdateStrategy(update);
      if (!strategy || strategy.updateType === 'none') continue;

      if (strategy.requiresManualApproval && update.updateType === 'major') {
        logger.info(`Skipping major update requiring manual approval: ${update.packageName}`);
        continue;
      }

      try {
        // Apply the update
        const updateCommand = `yarn add ${update.packageName}@${update.latestVersion}`;

        execSync(updateCommand, {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 120000,
        });

        appliedUpdates.push(update);
        logger.info(
          `Applied update for ${update.packageName}: ${update.currentVersion} → ${update.latestVersion}`,
        );

        // Run tests if required
        if (strategy.testingRequired && this.config.compatibilityTestingEnabled) {
          const testsPass = await this.runPackageTests(update.packageName);
          if (!testsPass) {
            logger.warn(`Tests failed after updating ${update.packageName}, consider rollback`);
          }
        }
      } catch (error) {
        logger.error(`Failed to apply update for ${update.packageName}`, error);
      }
    }

    return appliedUpdates;
  }

  /**
   * Run compatibility tests
   */
  async runCompatibilityTests(): Promise<boolean> {
    try {
      // Run TypeScript compilation check
      execSync('yarn build', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000,
      });

      // Run test suite
      execSync('yarn test', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000,
      });

      return true;
    } catch (error) {
      logger.error('Compatibility tests failed', error);
      return false;
    }
  }

  // Private helper methods

  private processOutdatedData(outdatedData: Record<string, unknown>): UpdateReport {
    const availableUpdates: DependencyUpdate[] = [];
    const summary: UpdateSummary = { major: 0, minor: 0, patch: 0, security: 0, total: 0 };

    for (const [packageName, updateInfo] of Object.entries(outdatedData)) {
      const info = updateInfo as unknown;

      const updateType = this.determineUpdateType(info.current, info.latest);

      const update: DependencyUpdate = {
        packageName,
        currentVersion: info.current,
        latestVersion: info.latest,
        updateType,
        breakingChanges: updateType === 'major',
        securityFix: false,
        testingRequired: updateType === 'major' || this.requiresTesting(packageName),
      };

      availableUpdates.push(update);
      summary[updateType]++;
      summary.total++;
    }

    return {
      availableUpdates,
      appliedUpdates: [],
      failedUpdates: [],
      summary,
    };
  }

  private determineUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' {
    const currentParts = current
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);
    const latestParts = latest
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);

    if (latestParts[0] > currentParts[0]) return 'major';
    if (latestParts[1] > currentParts[1]) return 'minor';
    return 'patch';
  }

  private shouldAutoFixVulnerability(severity: string): boolean {
    const { securityThresholds } = this.config;

    switch (severity) {
      case 'critical':
        return securityThresholds.autoFixCritical;
      case 'high':
        return securityThresholds.autoFixHigh;
      default:
        return false;
    }
  }

  private getUpdateStrategy(update: DependencyUpdate): UpdateStrategy | null {
    for (const strategy of this.config.updateStrategies) {
      if (strategy.pattern.test(update.packageName)) {
        return strategy;
      }
    }
    return null;
  }

  private requiresTesting(packageName: string): boolean {
    // Packages that typically require testing after updates
    const testingRequiredPatterns = [
      /^react/,
      /^next/,
      /^typescript/,
      /^@types\//,
      /^eslint/,
      /^jest/,
      /^babel/,
    ];

    return testingRequiredPatterns.some(pattern => pattern.test(packageName));
  }

  private async getChangelogUrl(packageName: string): Promise<string | undefined> {
    try {
      const packageInfo = execSync(`yarn info ${packageName} --json`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000,
      });

      const info = JSON.parse(packageInfo);
      return info.repository?.url || info.homepage;
    } catch (error) {
      return undefined;
    }
  }

  private async runPackageTests(packageName: string): Promise<boolean> {
    try {
      // Run a subset of tests related to the updated package
      execSync('yarn test --testNamePattern=".*" --bail', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async getDependencyCount(): Promise<number> {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      return deps.length + devDeps.length;
    } catch (error) {
      return 0;
    }
  }

  private generateSecurityRecommendations(
    vulnerabilities: SecurityVulnerability[],
    summary: SecuritySummary,
  ): string[] {
    const recommendations: string[] = [];

    if (summary.critical > 0) {
      recommendations.push(
        `🚨 ${summary.critical} critical vulnerabilities found - immediate action required`,
      );
    }

    if (summary.high > 0) {
      recommendations.push(
        `⚠️ ${summary.high} high severity vulnerabilities found - update as soon as possible`,
      );
    }

    if (summary.moderate > 0) {
      recommendations.push(`📋 ${summary.moderate} moderate vulnerabilities found - plan updates`);
    }

    const patchableVulns = vulnerabilities.filter(v => v.patchAvailable);
    if (patchableVulns.length > 0) {
      recommendations.push(`✅ ${patchableVulns.length} vulnerabilities have patches available`);
    }

    if (summary.total === 0) {
      recommendations.push('✅ No security vulnerabilities found');
    }

    return recommendations;
  }
}

/**
 * Default configuration for dependency and security monitoring
 */
export const DEFAULT_DEPENDENCY_SECURITY_CONFIG: DependencySecurityConfig = {
  maxDependenciesPerBatch: 10,
  safetyValidationEnabled: true,
  autoUpdateEnabled: false, // Disabled by default for safety
  securityScanEnabled: true,
  compatibilityTestingEnabled: true,
  updateStrategies: [
    {
      name: 'Security patches',
      description: 'Automatically apply security patches',
      pattern: /.*/,
      updateType: 'patch',
      requiresManualApproval: false,
      testingRequired: false,
    },
    {
      name: 'TypeScript ecosystem',
      description: 'Careful updates for TypeScript-related packages',
      pattern: /^(@types\/|typescript|ts-)/,
      updateType: 'minor',
      requiresManualApproval: true,
      testingRequired: true,
    },
    {
      name: 'React ecosystem',
      description: 'Careful updates for React-related packages',
      pattern: /^(react|@react|next)/,
      updateType: 'minor',
      requiresManualApproval: true,
      testingRequired: true,
    },
    {
      name: 'Development tools',
      description: 'Safe updates for development tools',
      pattern: /^(eslint|prettier|jest|babel)/,
      updateType: 'minor',
      requiresManualApproval: false,
      testingRequired: true,
    },
  ],
  securityThresholds: {
    critical: 0,
    high: 5,
    moderate: 10,
    low: 20,
    autoFixCritical: true,
    autoFixHigh: false,
  },
  excludedPackages: [
    // Packages to never auto-update
    'react',
    'react-dom',
    'next',
    'typescript',
  ],
};

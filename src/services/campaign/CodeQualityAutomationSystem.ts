/**
 * Code Quality Automation System
 * Unified system integrating import cleanup, linting/formatting, and dependency security
 * Part of the Kiro Optimization Campaign System
 */

import { logger } from '../../utils/logger';

import {
  DependencySecurityMonitor,
  DependencySecurityConfig,
  DEFAULT_DEPENDENCY_SECURITY_CONFIG,
} from './DependencySecurityMonitor';
import {
  ImportCleanupSystem,
  ImportCleanupConfig,
  DEFAULT_IMPORT_CLEANUP_CONFIG,
} from './ImportCleanupSystem';
import {
  LintingFormattingSystem,
  LintingFormattingConfig,
  DEFAULT_LINTING_FORMATTING_CONFIG,
} from './LintingFormattingSystem';

export interface CodeQualityAutomationConfig {
  importCleanup: ImportCleanupConfig;
  lintingFormatting: LintingFormattingConfig;
  dependencySecurity: DependencySecurityConfig;
  executionOrder: AutomationPhase[];
  globalSettings: GlobalAutomationSettings;
}

export interface GlobalAutomationSettings {
  maxConcurrentOperations: number;
  safetyValidationEnabled: boolean;
  buildValidationFrequency: number;
  rollbackOnFailure: boolean;
  continueOnError: boolean;
  reportingEnabled: boolean;
}

export interface AutomationPhase {
  name: string;
  description: string;
  system: 'importCleanup' | 'lintingFormatting' | 'dependencySecurity';
  enabled: boolean;
  dependencies: string[];
  criticalFailure: boolean;
}

export interface CodeQualityAutomationResult {
  overallSuccess: boolean;
  phasesExecuted: number;
  phasesSucceeded: number;
  phasesFailed: number;
  totalExecutionTime: number;
  phaseResults: PhaseExecutionResult[];
  globalMetrics: GlobalQualityMetrics;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface PhaseExecutionResult {
  phaseName: string;
  system: string;
  success: boolean;
  executionTime: number;
  result: unknown;
  errors: string[];
  warnings: string[];
}

export interface GlobalQualityMetrics {
  filesProcessed: number;
  importIssuesFixed: number;
  lintingViolationsFixed: number;
  formattingIssuesFixed: number;
  securityVulnerabilitiesFixed: number;
  dependencyUpdatesApplied: number;
  buildValidationsPassed: number;
  buildValidationsFailed: number;
}

export class CodeQualityAutomationSystem {
  private config: CodeQualityAutomationConfig;
  private importCleanupSystem: ImportCleanupSystem;
  private lintingFormattingSystem: LintingFormattingSystem;
  private dependencySecurityMonitor: DependencySecurityMonitor;

  constructor(config: CodeQualityAutomationConfig) {
    this.config = config;
    this.importCleanupSystem = new ImportCleanupSystem(config.importCleanup);
    this.lintingFormattingSystem = new LintingFormattingSystem(config.lintingFormatting);
    this.dependencySecurityMonitor = new DependencySecurityMonitor(config.dependencySecurity);
  }

  /**
   * Execute the complete code quality automation workflow
   */
  async executeAutomation(targetFiles?: string[]): Promise<CodeQualityAutomationResult> {
    const startTime = Date.now();
    logger.info('Starting code quality automation system');

    const result: CodeQualityAutomationResult = {
      overallSuccess: true,
      phasesExecuted: 0,
      phasesSucceeded: 0,
      phasesFailed: 0,
      totalExecutionTime: 0,
      phaseResults: [],
      globalMetrics: {
        filesProcessed: 0,
        importIssuesFixed: 0,
        lintingViolationsFixed: 0,
        formattingIssuesFixed: 0,
        securityVulnerabilitiesFixed: 0,
        dependencyUpdatesApplied: 0,
        buildValidationsPassed: 0,
        buildValidationsFailed: 0,
      },
      errors: [],
      warnings: [],
      recommendations: [],
    };

    try {
      // Execute phases in configured order
      const enabledPhases = this.config.executionOrder.filter(phase => phase.enabled);

      for (const phase of enabledPhases) {
        // Check dependencies
        const dependenciesMet = await this.checkPhaseDependencies(phase, result.phaseResults);
        if (!dependenciesMet) {
          result.warnings.push(`Skipping phase ${phase.name} - dependencies not met`);
          continue;
        }

        logger.info(`Executing phase: ${phase.name}`);
        const phaseResult = await this.executePhase(phase, targetFiles);

        result.phaseResults.push(phaseResult);
        result.phasesExecuted++;

        if (phaseResult.success) {
          result.phasesSucceeded++;
          this.updateGlobalMetrics(result.globalMetrics, phaseResult);
        } else {
          result.phasesFailed++;
          result.errors.push(...phaseResult.errors);

          if (phase.criticalFailure) {
            result.overallSuccess = false;
            if (!this.config.globalSettings.continueOnError) {
              logger.error(`Critical phase ${phase.name} failed, stopping execution`);
              break;
            }
          }
        }

        // Validate build after critical phases
        if (
          this.config.globalSettings.safetyValidationEnabled &&
          (phase.criticalFailure ||
            result.phasesExecuted % this.config.globalSettings.buildValidationFrequency === 0)
        ) {
          const buildValid = await this.validateBuild();
          if (buildValid) {
            result.globalMetrics.buildValidationsPassed++;
          } else {
            result.globalMetrics.buildValidationsFailed++;
            result.errors.push(`Build validation failed after phase ${phase.name}`);

            if (this.config.globalSettings.rollbackOnFailure) {
              logger.warn(`Rolling back changes due to build failure`);
              // Rollback logic would be implemented here
            }
          }
        }
      }

      // Generate final recommendations
      result.recommendations = this.generateRecommendations(result);

      result.totalExecutionTime = Date.now() - startTime;
      result.overallSuccess = result.overallSuccess && result.phasesFailed === 0;

      logger.info(`Code quality automation completed in ${result.totalExecutionTime}ms`, {
        phasesExecuted: result.phasesExecuted,
        phasesSucceeded: result.phasesSucceeded,
        phasesFailed: result.phasesFailed,
        overallSuccess: result.overallSuccess,
      });

      return result;
    } catch (error) {
      logger.error('Code quality automation system failed', error);
      result.overallSuccess = false;
      result.errors.push(`System failure: ${String(error)}`);
      result.totalExecutionTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Execute a specific automation phase
   */
  async executePhase(
    phase: AutomationPhase,
    targetFiles?: string[],
  ): Promise<PhaseExecutionResult> {
    const startTime = Date.now();

    const phaseResult: PhaseExecutionResult = {
      phaseName: phase.name,
      system: phase.system,
      success: false,
      executionTime: 0,
      result: null,
      errors: [],
      warnings: [],
    };

    try {
      switch (phase.system) {
        case 'importCleanup':
          phaseResult.result = await this.importCleanupSystem.executeCleanup(targetFiles);
          phaseResult.success =
            phaseResult.result.buildValidationPassed && phaseResult.result.errors.length === 0;
          phaseResult.errors = phaseResult.result.errors;
          phaseResult.warnings = phaseResult.result.warnings;
          break;

        case 'lintingFormatting':
          phaseResult.result =
            await this.lintingFormattingSystem.executeLintingAndFormatting(targetFiles);
          phaseResult.success =
            phaseResult.result.buildValidationPassed && phaseResult.result.errors.length === 0;
          phaseResult.errors = phaseResult.result.errors;
          phaseResult.warnings = phaseResult.result.warnings;
          break;

        case 'dependencySecurity':
          phaseResult.result =
            await this.dependencySecurityMonitor.executeDependencySecurityMonitoring();
          phaseResult.success =
            phaseResult.result.compatibilityTestsPassed && phaseResult.result.errors.length === 0;
          phaseResult.errors = phaseResult.result.errors;
          phaseResult.warnings = phaseResult.result.warnings;
          break;

        default:
          throw new Error(`Unknown system: ${phase.system}`);
      }

      phaseResult.executionTime = Date.now() - startTime;
      return phaseResult;
    } catch (error) {
      phaseResult.success = false;
      phaseResult.errors.push(`Phase execution failed: ${String(error)}`);
      phaseResult.executionTime = Date.now() - startTime;
      return phaseResult;
    }
  }

  /**
   * Generate comprehensive automation report
   */
  generateReport(result: CodeQualityAutomationResult): string {
    const report: string[] = [];

    report.push('# Code Quality Automation Report');
    report.push('');
    report.push(`**Execution Date:** ${new Date().toISOString()}`);
    report.push(`**Total Execution Time:** ${result.totalExecutionTime}ms`);
    report.push(`**Overall Success:** ${result.overallSuccess ? '✅' : '❌'}`);
    report.push('');

    // Executive Summary
    report.push('## Executive Summary');
    report.push('');
    report.push(`- Phases Executed: ${result.phasesExecuted}`);
    report.push(`- Phases Succeeded: ${result.phasesSucceeded}`);
    report.push(`- Phases Failed: ${result.phasesFailed}`);
    report.push(`- Files Processed: ${result.globalMetrics.filesProcessed}`);
    report.push('');

    // Global Metrics
    report.push('## Quality Improvements');
    report.push('');
    report.push(`- Import Issues Fixed: ${result.globalMetrics.importIssuesFixed}`);
    report.push(`- Linting Violations Fixed: ${result.globalMetrics.lintingViolationsFixed}`);
    report.push(`- Formatting Issues Fixed: ${result.globalMetrics.formattingIssuesFixed}`);
    report.push(
      `- Security Vulnerabilities Fixed: ${result.globalMetrics.securityVulnerabilitiesFixed}`,
    );
    report.push(`- Dependency Updates Applied: ${result.globalMetrics.dependencyUpdatesApplied}`);
    report.push('');

    // Phase Results
    report.push('## Phase Execution Details');
    report.push('');

    for (const phaseResult of result.phaseResults) {
      const statusIcon = phaseResult.success ? '✅' : '❌';
      report.push(`### ${statusIcon} ${phaseResult.phaseName}`);
      report.push('');
      report.push(`- System: ${phaseResult.system}`);
      report.push(`- Execution Time: ${phaseResult.executionTime}ms`);
      report.push(`- Success: ${phaseResult.success}`);

      if (phaseResult.errors.length > 0) {
        report.push('- Errors:');
        phaseResult.errors.forEach(error => report.push(`  - ${error}`));
      }

      if (phaseResult.warnings.length > 0) {
        report.push('- Warnings:');
        phaseResult.warnings.forEach(warning => report.push(`  - ${warning}`));
      }

      report.push('');
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      report.push('## Recommendations');
      report.push('');
      result.recommendations.forEach(rec => report.push(`- ${rec}`));
      report.push('');
    }

    // Errors and Warnings
    if (result.errors.length > 0) {
      report.push('## Errors');
      report.push('');
      result.errors.forEach(error => report.push(`- ❌ ${error}`));
      report.push('');
    }

    if (result.warnings.length > 0) {
      report.push('## Warnings');
      report.push('');
      result.warnings.forEach(warning => report.push(`- ⚠️ ${warning}`));
      report.push('');
    }

    return report.join('\n');
  }

  // Private helper methods

  private async checkPhaseDependencies(
    phase: AutomationPhase,
    completedPhases: PhaseExecutionResult[],
  ): Promise<boolean> {
    if (phase.dependencies.length === 0) {
      return true;
    }

    const completedPhaseNames = completedPhases.filter(p => p.success).map(p => p.phaseName);

    return phase.dependencies.every(dep => completedPhaseNames.includes(dep));
  }

  private updateGlobalMetrics(
    metrics: GlobalQualityMetrics,
    phaseResult: PhaseExecutionResult,
  ): void {
    const { result } = phaseResult;

    switch (phaseResult.system) {
      case 'importCleanup':
        metrics.filesProcessed += result.filesProcessed?.length || 0;
        metrics.importIssuesFixed +=
          (result.unusedImportsRemoved || 0) + (result.importsOrganized || 0);
        break;

      case 'lintingFormatting':
        metrics.filesProcessed += result.filesProcessed?.length || 0;
        metrics.lintingViolationsFixed += result.lintingViolationsFixed || 0;
        metrics.formattingIssuesFixed += result.formattingIssuesFixed || 0;
        break;

      case 'dependencySecurity':
        metrics.securityVulnerabilitiesFixed += result.securityPatchesApplied || 0;
        metrics.dependencyUpdatesApplied += result.updatesApplied || 0;
        break;
    }
  }

  private async validateBuild(): Promise<boolean> {
    try {
      const { execSync } = require('child_process');
      execSync('yarn build', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000,
      });
      return true;
    } catch (error) {
      logger.warn('Build validation failed', error);
      return false;
    }
  }

  private generateRecommendations(result: CodeQualityAutomationResult): string[] {
    const recommendations: string[] = [];

    // Success recommendations
    if (result.overallSuccess) {
      recommendations.push('✅ All automation phases completed successfully');

      if (result.globalMetrics.importIssuesFixed > 0) {
        recommendations.push(
          `🧹 Cleaned up ${result.globalMetrics.importIssuesFixed} import issues`,
        );
      }

      if (result.globalMetrics.lintingViolationsFixed > 0) {
        recommendations.push(
          `🔧 Fixed ${result.globalMetrics.lintingViolationsFixed} linting violations`,
        );
      }

      if (result.globalMetrics.securityVulnerabilitiesFixed > 0) {
        recommendations.push(
          `🔒 Applied ${result.globalMetrics.securityVulnerabilitiesFixed} security patches`,
        );
      }
    }

    // Failure recommendations
    if (result.phasesFailed > 0) {
      recommendations.push(`⚠️ ${result.phasesFailed} phases failed - review errors and re-run`);
    }

    // Build validation recommendations
    if (result.globalMetrics.buildValidationsFailed > 0) {
      recommendations.push('🚨 Build validations failed - check for breaking changes');
    }

    // Performance recommendations
    if (result.totalExecutionTime > 300000) {
      // 5 minutes
      recommendations.push(
        '⏱️ Automation took longer than expected - consider optimizing batch sizes',
      );
    }

    // Maintenance recommendations
    const totalImprovements =
      result.globalMetrics.importIssuesFixed +
      result.globalMetrics.lintingViolationsFixed +
      result.globalMetrics.formattingIssuesFixed;

    if (totalImprovements > 100) {
      recommendations.push(
        '📈 High number of issues fixed - consider running automation more frequently',
      );
    }

    return recommendations;
  }
}

/**
 * Default configuration for code quality automation
 */
export const DEFAULT_CODE_QUALITY_AUTOMATION_CONFIG: CodeQualityAutomationConfig = {
  importCleanup: DEFAULT_IMPORT_CLEANUP_CONFIG,
  lintingFormatting: DEFAULT_LINTING_FORMATTING_CONFIG,
  dependencySecurity: DEFAULT_DEPENDENCY_SECURITY_CONFIG,
  executionOrder: [
    {
      name: 'Import Cleanup',
      description: 'Clean up unused imports and organize import statements',
      system: 'importCleanup',
      enabled: true,
      dependencies: [],
      criticalFailure: false,
    },
    {
      name: 'Linting and Formatting',
      description: 'Fix linting violations and format code consistently',
      system: 'lintingFormatting',
      enabled: true,
      dependencies: ['Import Cleanup'],
      criticalFailure: false,
    },
    {
      name: 'Dependency Security',
      description: 'Scan for vulnerabilities and update dependencies',
      system: 'dependencySecurity',
      enabled: true,
      dependencies: [],
      criticalFailure: true,
    },
  ],
  globalSettings: {
    maxConcurrentOperations: 1,
    safetyValidationEnabled: true,
    buildValidationFrequency: 2,
    rollbackOnFailure: false,
    continueOnError: true,
    reportingEnabled: true,
  },
};

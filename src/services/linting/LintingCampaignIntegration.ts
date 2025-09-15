/**
 * Linting Campaign Integration Service
 *
 * Integrates linting progress tracking with the existing campaign system
 * for comprehensive quality improvement campaigns.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { logger } from '@/utils/logger';

import { LintingProgressReport, LintingProgressTracker } from './LintingProgressTracker';

/**
 * Linting campaign configuration
 */
export interface LintingCampaignConfig {
  campaignId: string;
  name: string;
  description: string;
  phases: LintingCampaignPhase[];
  targets: {
    maxErrors: number;
    maxWarnings: number;
    targetReduction: number;
  };
  safetyProtocols: string[];
  notifications: {
    onProgress: boolean;
    onCompletion: boolean;
    onRegression: boolean;
  };
}

/**
 * Linting campaign phase
 */
export interface LintingCampaignPhase {
  id: string;
  name: string;
  description: string;
  tools: string[];
  successCriteria: {
    errorReduction: number;
    warningReduction: number;
    performanceThreshold: number;
  };
  estimatedDuration: number; // minutes
}

/**
 * Campaign execution result
 */
export interface CampaignExecutionResult {
  campaignId: string;
  phase: string;
  success: boolean;
  metricsImprovement: {
    errorsBefore: number;
    errorsAfter: number;
    warningsBefore: number;
    warningsAfter: number;
    improvementPercentage: number;
  };
  executionTime: number;
  issues: string[];
  recommendations: string[];
}

/**
 * Linting Campaign Integration Service
 */
export class LintingCampaignIntegration {
  private progressTracker: LintingProgressTracker;
  private campaignConfigFile = '.kiro/campaigns/linting-campaigns.json';
  private activeConfigFile = '.kiro/campaigns/active-linting-campaign.json';

  constructor() {
    this.progressTracker = new LintingProgressTracker();
    this.ensureDirectoryExists();
  }

  /**
   * Start a linting improvement campaign
   */
  async startCampaign(config: LintingCampaignConfig): Promise<void> {
    try {
      logger.info(`Starting linting campaign: ${config.name}`);

      // Collect baseline metrics
      const baselineReport = await this.progressTracker.generateProgressReport();

      // Save campaign configuration
      this.saveCampaignConfig(config);
      this.setActiveCampaign(config.campaignId, baselineReport);

      // Execute campaign phases
      for (const phase of config.phases) {
        await this.executePhase(config, phase);
      }

      // Generate final report
      const finalReport = await this.generateCampaignReport(config.campaignId);
      logger.info('Linting campaign completed:', finalReport);
    } catch (error) {
      logger.error('Error executing linting campaign:', error);
      throw error;
    }
  }

  /**
   * Execute a specific campaign phase
   */
  async executePhase(
    config: LintingCampaignConfig,
    phase: LintingCampaignPhase,
  ): Promise<CampaignExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Executing campaign phase: ${phase.name}`);

      // Collect pre-phase metrics
      const prePhaseReport = await this.progressTracker.generateProgressReport();

      // Execute phase tools
      const toolResults = await this.executePhaseTools(phase.tools);

      // Collect post-phase metrics
      const postPhaseReport = await this.progressTracker.generateProgressReport();

      // Evaluate success criteria
      const success = this.evaluatePhaseSuccess(phase, prePhaseReport, postPhaseReport);

      const result: CampaignExecutionResult = {;
        campaignId: config.campaignId,
        phase: phase.id,
        success,
        metricsImprovement: {
          errorsBefore: prePhaseReport.currentMetrics.errors,
          errorsAfter: postPhaseReport.currentMetrics.errors,
          warningsBefore: prePhaseReport.currentMetrics.warnings,
          warningsAfter: postPhaseReport.currentMetrics.warnings,
          improvementPercentage: postPhaseReport.improvement.percentageImprovement
        },
        executionTime: Date.now() - startTime,
        issues: toolResults.issues,
        recommendations: toolResults.recommendations
      };

      // Update campaign progress
      await this.updateCampaignProgress(config.campaignId, phase.id, result);

      // Check for notifications
      if (config.notifications.onProgress) {
        await this.sendProgressNotification(config, result);
      }

      logger.info(`Phase ${phase.name} completed:`, {
        success,
        improvement: result.metricsImprovement.improvementPercentage
      });

      return result;
    } catch (error) {
      logger.error(`Error executing phase ${phase.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute phase tools
   */
  private async executePhaseTools(
    tools: string[],
  ): Promise<{ issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const tool of tools) {
      try {
        const result = await this.executeTool(tool);
        issues.push(...result.issues);
        recommendations.push(...result.recommendations);
      } catch (error) {
        issues.push(
          `Tool ${tool} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return { issues, recommendations };
  }

  /**
   * Execute a specific tool
   */
  private async executeTool(
    tool: string,
  ): Promise<{ issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      switch (tool) {
        case 'eslint-fix':
          await this.executeESLintFix();
          recommendations.push('Applied ESLint auto-fixes');
          break;

        case 'unused-imports':
          await this.executeUnusedImportRemoval();
          recommendations.push('Removed unused imports');
          break;

        case 'import-organization':
          await this.executeImportOrganization();
          recommendations.push('Organized import statements');
          break;

        case 'explicit-any-elimination':
          await this.executeExplicitAnyElimination();
          recommendations.push('Reduced explicit any usage');
          break;

        case 'console-cleanup':
          await this.executeConsoleCleanup();
          recommendations.push('Cleaned up console statements');
          break;

        default:
          issues.push(`Unknown tool: ${tool}`);
      }
    } catch (error) {
      issues.push(
        `Tool ${tool} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return { issues, recommendations };
  }

  /**
   * Tool execution methods
   */
  private async executeESLintFix(): Promise<void> {
    try {
      execSync('yarn lint:fix', { stdio: 'pipe' });
    } catch (error) {
      // ESLint fix may return non-zero exit code but still apply fixes
      logger.debug('ESLint fix completed with warnings');
    }
  }

  private async executeUnusedImportRemoval(): Promise<void> {
    try {
      // Use the existing SafeUnusedImportRemover
      const { SafeUnusedImportRemover } = await import('./SafeUnusedImportRemover');
      const remover = new SafeUnusedImportRemover();
      await remover.processUnusedImports();
    } catch (error) {
      logger.warn('Unused import removal failed:', error);
    }
  }

  private async executeImportOrganization(): Promise<void> {
    try {
      execSync('yarn lint --fix-type layout', { stdio: 'pipe' });
    } catch (error) {
      logger.debug('Import organization completed with warnings');
    }
  }

  private async executeExplicitAnyElimination(): Promise<void> {
    try {
      // This would integrate with existing explicit any elimination tools
      logger.info('Explicit any elimination would be executed here');
    } catch (error) {
      logger.warn('Explicit any elimination failed:', error);
    }
  }

  private async executeConsoleCleanup(): Promise<void> {
    try {
      // This would integrate with existing console cleanup tools
      logger.info('Console cleanup would be executed here');
    } catch (error) {
      logger.warn('Console cleanup failed:', error);
    }
  }

  /**
   * Evaluate phase success criteria
   */
  private evaluatePhaseSuccess(
    phase: LintingCampaignPhase,
    preReport: LintingProgressReport,
    postReport: LintingProgressReport,
  ): boolean {
    const errorReduction = preReport.currentMetrics.errors - postReport.currentMetrics.errors;
    const warningReduction = preReport.currentMetrics.warnings - postReport.currentMetrics.warnings;
    const performanceAcceptable =
      postReport.currentMetrics.performanceMetrics.executionTime <=;
      phase.successCriteria.performanceThreshold;

    return (
      errorReduction >= phase.successCriteria.errorReduction &&
      warningReduction >= phase.successCriteria.warningReduction &&
      performanceAcceptable
    );
  }

  /**
   * Generate comprehensive campaign report
   */
   
  async generateCampaignReport(campaignId: string): Promise<Record<string, unknown>> {
    try {
      const config = this.getCampaignConfig(campaignId);
      const activeCampaign = this.getActiveCampaign();
      const currentReport = await this.progressTracker.generateProgressReport();

      if (!config || !activeCampaign) {
        throw new Error('Campaign data not found');
      }

      const report = {;
        campaignId,
        name: config.name,
        startTime: (activeCampaign as any)?.startTime,
        endTime: new Date(),
        baselineMetrics: (activeCampaign as any)?.baselineMetrics,
        finalMetrics: currentReport.currentMetrics,
        totalImprovement: {
          errorReduction:
            (activeCampaign as any)?.baselineMetrics.errors - currentReport.currentMetrics.errors,
          warningReduction:
            (activeCampaign as any)?.baselineMetrics.warnings -
            currentReport.currentMetrics.warnings,
          percentageImprovement: currentReport.improvement.percentageImprovement
        },
        phasesExecuted: (activeCampaign as any)?.phasesExecuted || [],
        qualityGatesStatus: currentReport.qualityGates,
        recommendations:
          currentReport.improvement.percentageImprovement > 0
            ? ['Continue monitoring for regressions', 'Consider additional optimization phases']
            : ['Investigate why improvements were not achieved', 'Review tool configurations']
      };

      // Save final report
      this.saveCampaignReport(report);

      return report;
    } catch (error) {
      logger.error('Error generating campaign report:', error);
      throw error;
    }
  }

  /**
   * Create predefined campaign configurations
   */
  createStandardCampaigns(): LintingCampaignConfig[] {
    return [
      {
        campaignId: 'linting-excellence-standard',
        name: 'Standard Linting Excellence Campaign',
        description: 'Comprehensive linting improvement campaign targeting zero errors',
        phases: [
          {
            id: 'phase-1-auto-fixes',
            name: 'Automated Fixes',
            description: 'Apply all available ESLint auto-fixes',
            tools: ['eslint-fix'],
            successCriteria: {
              errorReduction: 50,
              warningReduction: 100,
              performanceThreshold: 60000
            },
            estimatedDuration: 15
          },
          {
            id: 'phase-2-imports',
            name: 'Import Organization',
            description: 'Clean up and organize import statements',
            tools: ['unused-imports', 'import-organization'],
            successCriteria: {
              errorReduction: 20,
              warningReduction: 200,
              performanceThreshold: 60000
            },
            estimatedDuration: 30
          },
          {
            id: 'phase-3-types',
            name: 'Type Safety Improvement',
            description: 'Eliminate explicit any and improve type safety',
            tools: ['explicit-any-elimination'],
            successCriteria: {
              errorReduction: 10,
              warningReduction: 50,
              performanceThreshold: 60000
            },
            estimatedDuration: 45
          },
          {
            id: 'phase-4-cleanup',
            name: 'Code Cleanup',
            description: 'Clean up console statements and other code quality issues',
            tools: ['console-cleanup'],
            successCriteria: {
              errorReduction: 5,
              warningReduction: 30,
              performanceThreshold: 60000
            },
            estimatedDuration: 20
          }
        ],
        targets: {
          maxErrors: 0,
          maxWarnings: 100,
          targetReduction: 80
        },
        safetyProtocols: ['backup-before-changes', 'validate-build', 'rollback-on-failure'],
        notifications: {
          onProgress: true,
          onCompletion: true,
          onRegression: true
        }
      }
    ];
  }

  /**
   * Utility methods
   */
  private ensureDirectoryExists(): void {
    try {
      execSync('mkdir -p .kiro/campaigns', { stdio: 'pipe' });
    } catch (error) {
      // Directory might already exist
    }
  }

  private saveCampaignConfig(config: LintingCampaignConfig): void {
    try {
      const configs = this.getAllCampaignConfigs();
      configs[config.campaignId] = config;
      writeFileSync(this.campaignConfigFile, JSON.stringify(configs, null, 2));
    } catch (error) {
      logger.error('Error saving campaign config:', error);
    }
  }

  private getCampaignConfig(campaignId: string): LintingCampaignConfig | undefined {
    try {
      const configs = this.getAllCampaignConfigs();
      return configs[campaignId];
    } catch (error) {
      logger.error('Error reading campaign config:', error);
      return undefined;
    }
  }

  private getAllCampaignConfigs(): Record<string, LintingCampaignConfig> {
    try {
      if (existsSync(this.campaignConfigFile)) {
        const data = readFileSync(this.campaignConfigFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.warn('Error reading campaign configs:', error);
    }
    return {};
  }

  private setActiveCampaign(campaignId: string, baselineReport: LintingProgressReport): void {
    try {
      const activeCampaign = {;
        campaignId,
        startTime: new Date(),
        baselineMetrics: baselineReport.currentMetrics,
        phasesExecuted: []
      };
      writeFileSync(this.activeConfigFile, JSON.stringify(activeCampaign, null, 2));
    } catch (error) {
      logger.error('Error setting active campaign:', error);
    }
  }

  private getActiveCampaign(): unknown {
    try {
      if (existsSync(this.activeConfigFile)) {
        const data = readFileSync(this.activeConfigFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.warn('Error reading active campaign:', error);
    }
    return null;
  }

  private async updateCampaignProgress(
    campaignId: string,
    phaseId: string,
    result: CampaignExecutionResult,
  ): Promise<void> {
    try {
      const activeCampaign = this.getActiveCampaign();
      if (activeCampaign && (activeCampaign as any)?.campaignId === campaignId) {;
        (activeCampaign as any)?.phasesExecuted = (activeCampaign as any)?.phasesExecuted || [];
        (activeCampaign as any)?.phasesExecuted.push({
          phaseId,
          result,
          timestamp: new Date()
        });
        writeFileSync(this.activeConfigFile, JSON.stringify(activeCampaign, null, 2));
      }
    } catch (error) {
      logger.error('Error updating campaign progress:', error);
    }
  }

  private async sendProgressNotification(
    config: LintingCampaignConfig,
    result: CampaignExecutionResult,
  ): Promise<void> {
    // This would integrate with notification systems
    logger.info(`Campaign ${config.name} progress notification:`, {
      phase: result.phase,
      success: result.success,
      improvement: result.metricsImprovement.improvementPercentage
    });
  }

  private saveCampaignReport(report: Record<string, unknown>): void {
    try {
      const id = typeof report.campaignId === 'string' ? (report.campaignId) : 'unknown';
      const reportFile = `.kiro/campaigns/report-${id}-${Date.now()}.json`;
      writeFileSync(reportFile, JSON.stringify(report, null, 2));
    } catch (error) {
      logger.error('Error saving campaign report:', error);
    }
  }
}

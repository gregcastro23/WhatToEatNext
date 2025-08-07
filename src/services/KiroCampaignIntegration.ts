/**
 * Kiro Campaign Integration Service
 * 
 * Provides comprehensive integration between Kiro IDE and the existing campaign system,
 * enabling real-time monitoring, control, and management of campaign operations
 * through Kiro's interface.
 */

import {
  CampaignConfig,
  CampaignPhase,
  ProgressMetrics,
  PhaseResult,
  SafetyEvent,
  PhaseStatus,
  ProgressReport,
  ValidationResult
} from '../types/campaign';

import { CampaignController } from './campaign/CampaignController';
import { CAMPAIGN_INTELLIGENCE_DEMO as CampaignIntelligenceSystem } from './campaign/CampaignIntelligenceSystem';
import { ProgressTracker } from './campaign/ProgressTracker';

// Re-export required types for external components
export type { CampaignPhase, ValidationResult } from '../types/campaign';

// ========== KIRO INTEGRATION TYPES ==========

export interface KiroCampaignStatus {
  campaignId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentPhase?: string;
  progress: number; // 0-100%
  metrics: ProgressMetrics;
  safetyEvents: SafetyEvent[];
  lastUpdate: Date;
  estimatedCompletion?: Date;
}

export interface KiroCampaignControlPanel {
  activeCampaigns: KiroCampaignStatus[];
  availablePhases: CampaignPhase[];
  systemHealth: SystemHealthStatus;
  quickActions: QuickAction[];
  recentResults: CampaignResult[];
}

export interface SystemHealthStatus {
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  typeScriptErrors: number;
  lintingWarnings: number;
  buildTime: number;
  lastHealthCheck: Date;
  healthTrends: HealthTrend[];
}

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  estimatedDuration: number; // minutes
  safetyLevel: 'low' | 'medium' | 'high' | 'maximum';
}

export interface CampaignResult {
  campaignId: string;
  phaseName: string;
  completedAt: Date;
  success: boolean;
  metricsImprovement: {
    errorsReduced: number;
    warningsReduced: number;
    buildTimeImproved: number;
  };
  duration: number; // minutes
}

export interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
  timeframe: string;
}

export interface CampaignExecutionRequest {
  phaseIds: string[];
  safetyLevel: 'conservative' | 'standard' | 'aggressive';
  batchSize?: number;
  dryRun?: boolean;
  approvalRequired?: boolean;
}

export interface CampaignSchedule {
  id: string;
  name: string;
  phases: string[];
  scheduledTime: Date;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

// ========== KIRO CAMPAIGN INTEGRATION SERVICE ==========

export class KiroCampaignIntegration {
  private campaignController: CampaignController;
  private progressTracker: ProgressTracker;
  private intelligenceSystem: typeof CampaignIntelligenceSystem;
  private activeCampaigns: Map<string, KiroCampaignStatus> = new Map();
  private campaignSchedules: Map<string, CampaignSchedule> = new Map();

  constructor() {
    this.campaignController = new CampaignController(this.getDefaultConfig());
    this.progressTracker = new ProgressTracker();
    this.intelligenceSystem = CampaignIntelligenceSystem as unknown as { initialize: (config: Record<string, unknown>) => Promise<void> };
  }

  // ========== REAL-TIME MONITORING ==========

  /**
   * Get comprehensive campaign control panel data
   */
  async getCampaignControlPanel(): Promise<KiroCampaignControlPanel> {
    const activeCampaigns = Array.from(this.activeCampaigns.values());
    const availablePhases = await this.getAvailablePhases();
    const systemHealth = await this.getSystemHealthStatus();
    const quickActions = this.getQuickActions();
    const recentResults = await this.getRecentCampaignResults();

    return {
      activeCampaigns,
      availablePhases,
      systemHealth,
      quickActions,
      recentResults
    };
  }

  /**
   * Get real-time campaign status
   */
  async getCampaignStatus(campaignId: string): Promise<KiroCampaignStatus | null> {
    const status = this.activeCampaigns.get(campaignId);
    if (!status) return null;

    // Update with latest metrics
    const currentMetrics = await this.progressTracker.getProgressMetrics();
    status.metrics = currentMetrics;
    status.lastUpdate = new Date();

    return status;
  }

  /**
   * Get system health status with trends
   */
  async getSystemHealthStatus(): Promise<SystemHealthStatus> {
    const metrics = await this.progressTracker.getProgressMetrics();
    const improvement = this.progressTracker.getMetricsImprovement();

    // Calculate overall health score
    const errorScore = Math.max(0, 100 - (metrics.typeScriptErrors.current / 10));
    const warningScore = Math.max(0, 100 - (metrics.lintingWarnings.current / 100));
    const buildScore = metrics.buildPerformance.currentTime <= 10 ? 100 : 
                      Math.max(0, 100 - ((metrics.buildPerformance.currentTime - 10) * 10));
    
    const overallScore = (errorScore + warningScore + buildScore) / 3;
    
    const overallHealth: SystemHealthStatus['overallHealth'] = 
      overallScore >= 90 ? 'excellent' :
      overallScore >= 70 ? 'good' :
      overallScore >= 50 ? 'warning' : 'critical';

    // Generate health trends
    const healthTrends: HealthTrend[] = [
      {
        metric: 'TypeScript Errors',
        trend: improvement.typeScriptErrorsReduced > 0 ? 'improving' : 
               improvement.typeScriptErrorsReduced < 0 ? 'declining' : 'stable',
        changePercentage: Math.abs(improvement.typeScriptErrorsReduced),
        timeframe: 'last 24 hours'
      },
      {
        metric: 'Linting Warnings',
        trend: improvement.lintingWarningsReduced > 0 ? 'improving' : 
               improvement.lintingWarningsReduced < 0 ? 'declining' : 'stable',
        changePercentage: Math.abs(improvement.lintingWarningsReduced),
        timeframe: 'last 24 hours'
      },
      {
        metric: 'Build Performance',
        trend: improvement.buildTimeImproved > 0 ? 'improving' : 
               improvement.buildTimeImproved < 0 ? 'declining' : 'stable',
        changePercentage: Math.abs(improvement.buildTimeImproved * 10),
        timeframe: 'last 24 hours'
      }
    ];

    return {
      overallHealth,
      typeScriptErrors: metrics.typeScriptErrors.current,
      lintingWarnings: metrics.lintingWarnings.current,
      buildTime: metrics.buildPerformance.currentTime,
      lastHealthCheck: new Date(),
      healthTrends
    };
  }

  // ========== CAMPAIGN CONTROL ==========

  /**
   * Start a new campaign with specified configuration
   */
  async startCampaign(request: CampaignExecutionRequest): Promise<string> {
    const campaignId = `campaign_${Date.now()}`;
    
    // Create campaign status
    const status: KiroCampaignStatus = {
      campaignId,
      status: 'running',
      currentPhase: request.phaseIds[0],
      progress: 0,
      metrics: await this.progressTracker.getProgressMetrics(),
      safetyEvents: [],
      lastUpdate: new Date()
    };

    this.activeCampaigns.set(campaignId, status);

    // Execute campaign phases
    try {
      const config = await this.createCampaignConfig(request);
      
      for (const phaseId of request.phaseIds) {
        const phase = config.phases.find(p => p.id === phaseId);
        if (!phase) continue;

        status.currentPhase = phaseId;
        status.lastUpdate = new Date();

        const result = await this.campaignController.executePhase(phase);
        
        // Update progress
        status.progress = ((request.phaseIds.indexOf(phaseId) + 1) / request.phaseIds.length) * 100;
        status.metrics = await this.progressTracker.getProgressMetrics();
        status.safetyEvents.push(...result.safetyEvents);

        if (!result.success) {
          status.status = 'failed';
          throw new Error(`Phase ${phaseId} failed: ${result.safetyEvents.map(e => e.description).join(', ')}`);
        }
      }

      status.status = 'completed';
      status.progress = 100;
      status.currentPhase = undefined;

    } catch (error) {
      status.status = 'failed';
      status.safetyEvents.push({
        type: 'BUILD_FAILURE' as SafetyEvent['type'],
        timestamp: new Date(),
        description: `Campaign failed: ${(error as Error).message}`,
        severity: 'ERROR' as SafetyEvent['severity'],
        action: 'CAMPAIGN_FAILED'
      });
    }

    return campaignId;
  }

  /**
   * Pause an active campaign
   */
  async pauseCampaign(campaignId: string): Promise<boolean> {
    const status = this.activeCampaigns.get(campaignId);
    if (!status || status.status !== 'running') return false;

    status.status = 'paused';
    status.lastUpdate = new Date();
    status.safetyEvents.push({
      type: 'CHECKPOINT_CREATED' as SafetyEvent['type'],
      timestamp: new Date(),
      description: 'Campaign paused by user',
      severity: 'INFO' as SafetyEvent['severity'],
      action: 'PAUSE'
    });

    return true;
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(campaignId: string): Promise<boolean> {
    const status = this.activeCampaigns.get(campaignId);
    if (!status || status.status !== 'paused') return false;

    status.status = 'running';
    status.lastUpdate = new Date();
    status.safetyEvents.push({
      type: 'CHECKPOINT_CREATED' as SafetyEvent['type'],
      timestamp: new Date(),
      description: 'Campaign resumed by user',
      severity: 'INFO' as SafetyEvent['severity'],
      action: 'RESUME'
    });

    return true;
  }

  /**
   * Stop and cleanup a campaign
   */
  async stopCampaign(campaignId: string): Promise<boolean> {
    const status = this.activeCampaigns.get(campaignId);
    if (!status) return false;

    status.status = 'completed';
    status.lastUpdate = new Date();
    status.safetyEvents.push({
      type: 'CHECKPOINT_CREATED' as SafetyEvent['type'],
      timestamp: new Date(),
      description: 'Campaign stopped by user',
      severity: 'WARNING' as SafetyEvent['severity'],
      action: 'STOP'
    });

    // Keep in history for a while before cleanup
    setTimeout(() => {
      this.activeCampaigns.delete(campaignId);
    }, 5 * 60 * 1000); // 5 minutes

    return true;
  }

  // ========== CAMPAIGN SCHEDULING ==========

  /**
   * Schedule a campaign for future execution
   */
  async scheduleCampaign(schedule: Omit<CampaignSchedule, 'id'>): Promise<string> {
    const scheduleId = `schedule_${Date.now()}`;
    const campaignSchedule: CampaignSchedule = {
      id: scheduleId,
      ...schedule,
      nextRun: this.calculateNextRun(schedule.scheduledTime, schedule.recurrence)
    };

    this.campaignSchedules.set(scheduleId, campaignSchedule);
    return scheduleId;
  }

  /**
   * Get all scheduled campaigns
   */
  getScheduledCampaigns(): CampaignSchedule[] {
    return Array.from(this.campaignSchedules.values());
  }

  /**
   * Update campaign schedule
   */
  async updateCampaignSchedule(scheduleId: string, updates: Partial<CampaignSchedule>): Promise<boolean> {
    const schedule = this.campaignSchedules.get(scheduleId);
    if (!schedule) return false;

    Object.assign(schedule, updates);
    
    if (updates.scheduledTime || updates.recurrence) {
      schedule.nextRun = this.calculateNextRun(schedule.scheduledTime, schedule.recurrence);
    }

    return true;
  }

  /**
   * Delete a scheduled campaign
   */
  async deleteScheduledCampaign(scheduleId: string): Promise<boolean> {
    return this.campaignSchedules.delete(scheduleId);
  }

  // ========== REPORTING AND ANALYSIS ==========

  /**
   * Generate comprehensive campaign report
   */
  async generateCampaignReport(campaignId?: string): Promise<ProgressReport> {
    if (campaignId) {
      const status = this.activeCampaigns.get(campaignId);
      if (status) {
        return {
          campaignId,
          overallProgress: status.progress,
          phases: [], // Would be populated with actual phase data
          currentMetrics: status.metrics,
          targetMetrics: await this.getTargetMetrics(),
          estimatedCompletion: status.estimatedCompletion || new Date()
        };
      }
    }

    return this.progressTracker.generateProgressReport();
  }

  /**
   * Get campaign result analysis and reporting
   */
  async getCampaignAnalysis(campaignId: string): Promise<{
    intelligence: any;
    recommendations: string[];
    nextSteps: string[];
  }> {
    const intelligence = await (this.intelligenceSystem as unknown as { generateComprehensiveIntelligence: (controller: unknown, options: Record<string, unknown>, context: Record<string, unknown>) => Promise<Record<string, unknown>> }).generateComprehensiveIntelligence(
      this.campaignController,
      {},
      {}
    );

    const recommendations = intelligence.intelligenceRecommendations;
    const nextSteps = this.generateNextSteps(intelligence);

    return {
      intelligence,
      recommendations,
      nextSteps
    };
  }

  // ========== HELPER METHODS ==========

  private async getAvailablePhases(): Promise<CampaignPhase[]> {
    const config = await CampaignController.loadConfiguration();
    return config.phases;
  }

  private getQuickActions(): QuickAction[] {
    return [
      {
        id: 'quick-typescript-fix',
        name: 'Quick TypeScript Fix',
        description: 'Fix high-priority TypeScript errors (batch of 15)',
        icon: 'typescript',
        enabled: true,
        estimatedDuration: 5,
        safetyLevel: 'high'
      },
      {
        id: 'linting-cleanup',
        name: 'Linting Cleanup',
        description: 'Clean up linting warnings (batch of 25)',
        icon: 'lint',
        enabled: true,
        estimatedDuration: 3,
        safetyLevel: 'medium'
      },
      {
        id: 'build-optimization',
        name: 'Build Optimization',
        description: 'Optimize build performance and bundle size',
        icon: 'build',
        enabled: true,
        estimatedDuration: 10,
        safetyLevel: 'low'
      },
      {
        id: 'full-campaign',
        name: 'Full Quality Campaign',
        description: 'Complete code quality improvement campaign',
        icon: 'campaign',
        enabled: true,
        estimatedDuration: 60,
        safetyLevel: 'maximum'
      }
    ];
  }

  private async getRecentCampaignResults(): Promise<CampaignResult[]> {
    // This would be populated from actual campaign history
    return [];
  }

  private async createCampaignConfig(request: CampaignExecutionRequest): Promise<CampaignConfig> {
    const baseConfig = await CampaignController.loadConfiguration();
    
    // Filter phases based on request
    const requestedPhases = baseConfig.phases.filter(phase => 
      request.phaseIds.includes(phase.id)
    );

    // Adjust safety settings based on request
    const safetySettings = {
      ...baseConfig.safetySettings,
      maxFilesPerBatch: request.batchSize || baseConfig.safetySettings.maxFilesPerBatch
    };

    if (request.safetyLevel === 'conservative') {
      safetySettings.maxFilesPerBatch = Math.min(safetySettings.maxFilesPerBatch, 10);
      safetySettings.buildValidationFrequency = 3;
    } else if (request.safetyLevel === 'aggressive') {
      safetySettings.maxFilesPerBatch = Math.max(safetySettings.maxFilesPerBatch, 25);
      safetySettings.buildValidationFrequency = 10;
    }

    return {
      ...baseConfig,
      phases: requestedPhases,
      safetySettings
    };
  }

  private calculateNextRun(scheduledTime: Date, recurrence?: string): Date {
    const nextRun = new Date(scheduledTime);
    
    if (recurrence === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (recurrence === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (recurrence === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    return nextRun;
  }

  private async getTargetMetrics(): Promise<ProgressMetrics> {
    return {
      typeScriptErrors: { current: 0, target: 0, reduction: 0, percentage: 100 },
      lintingWarnings: { current: 0, target: 0, reduction: 0, percentage: 100 },
      buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.9, memoryUsage: 40 },
      enterpriseSystems: { current: 200, target: 200, transformedExports: 200 }
    };
  }

  private generateNextSteps(intelligence: any): string[] {
    const nextSteps: string[] = [];
    
    if (intelligence.campaignMetrics.enterpriseReadiness < 0.9) {
      nextSteps.push('Continue campaign execution to reach enterprise readiness');
    }
    
    if (intelligence.campaignMetrics.errorReductionVelocity < 1) {
      nextSteps.push('Consider increasing batch size for higher throughput');
    }
    
    if (intelligence.campaignMetrics.buildStabilityScore < 0.9) {
      nextSteps.push('Focus on build stability improvements');
    }

    nextSteps.push('Monitor progress and adjust campaign strategy as needed');
    
    return nextSteps;
  }

  private getDefaultConfig(): CampaignConfig {
    return {
      phases: [],
      safetySettings: {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js'
      }
    };
  }
}

// Export singleton instance for use across the application
export const kiroCampaignIntegration = new KiroCampaignIntegration();
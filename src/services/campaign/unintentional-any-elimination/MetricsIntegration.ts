/**
 * Metrics Integration for Unintentional Any Elimination
 * Integrates unintentional any metrics with existing campaign reporting and dashboard systems
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { PhaseReport, PhaseStatus, ProgressReport } from '../../../types/campaign';
import { ProgressTracker } from '../ProgressTracker';


import { AutoDocumentationGenerator } from './AutoDocumentationGenerator';
import { DocumentationQualityAssurance } from './DocumentationQualityAssurance';
import { UnintentionalAnyMetrics, UnintentionalAnyProgressMetrics } from './types';

/**
 * Enhanced Progress Tracker with Unintentional Any Metrics
 */
export class UnintentionalAnyProgressTracker extends ProgressTracker {
  private documentationGenerator: AutoDocumentationGenerator;
  private qualityAssurance: DocumentationQualityAssurance;
  private baselineMetrics?: UnintentionalAnyMetrics,
  private metricsHistory: UnintentionalAnyMetrics[] = [];

  constructor() {
    super();
    this.documentationGenerator = new AutoDocumentationGenerator();
    this.qualityAssurance = new DocumentationQualityAssurance({
      sourceDirectories: ['src'],
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.ts';
        '**/*.test.tsx';
        '**/*.spec.ts';
        '**/*.spec.tsx'
      ]
    });
  }

  /**
   * Get comprehensive unintentional any metrics
   */
  async getUnintentionalAnyMetrics(): Promise<UnintentionalAnyMetrics> {
    try {
      // Get explicit-any warning count from linting
      const explicitAnyCount = await this.getExplicitAnyWarningCount();

      // Get documentation report
      const documentationReport = await this.qualityAssurance.performQualityAssurance();

      // Calculate metrics
      const intentionalAnyTypes = documentationReport.totalIntentionalAnyTypes;
      const unintentionalAnyTypes = Math.max(0, explicitAnyCount - intentionalAnyTypes);
      const documentedAnyTypes = Math.round(;
        (intentionalAnyTypes * documentationReport.documentationCoverage) / 100;
      );

      // Calculate reduction from baseline
      let reductionFromBaseline = 0;
      if (this.baselineMetrics) {
        const baselineTotal = this.baselineMetrics.totalAnyTypes;
        if (baselineTotal > 0) {
          reductionFromBaseline = ((baselineTotal - explicitAnyCount) / baselineTotal) * 100;
        }
      }

      const metrics: UnintentionalAnyMetrics = {
        totalAnyTypes: explicitAnyCount,
        intentionalAnyTypes,
        unintentionalAnyTypes,
        documentedAnyTypes,
        documentationCoverage: documentationReport.documentationCoverage;
        reductionFromBaseline,
        targetReduction: 15, // Default target, can be configured
      };

      // Store in history
      this.metricsHistory.push(metrics);
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-50);
      }

      return metrics;
    } catch (error) {
      console.warn(
        `Warning: Could not get unintentional any metrics: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        totalAnyTypes: 0,
        intentionalAnyTypes: 0,
        unintentionalAnyTypes: 0,
        documentedAnyTypes: 0,
        documentationCoverage: 0,
        reductionFromBaseline: 0,
        targetReduction: 15
      };
    }
  }

  /**
   * Get enhanced progress metrics that include unintentional any data
   */
  async getUnintentionalAnyProgressMetrics(): Promise<UnintentionalAnyProgressMetrics> {
    const baseMetrics = await this.getProgressMetrics();
    const unintentionalAnyMetrics = await this.getUnintentionalAnyMetrics();

    return {
      ...baseMetrics;
      unintentionalAnyMetrics
    };
  }

  /**
   * Set baseline metrics for comparison
   */
  async setBaselineMetrics(): Promise<void> {
    this.baselineMetrics = await this.getUnintentionalAnyMetrics();
    // console.log(`📊 Baseline metrics set:`, {
      totalAnyTypes: this.baselineMetrics.totalAnyTypes;
      intentionalAnyTypes: this.baselineMetrics.intentionalAnyTypes;
      unintentionalAnyTypes: this.baselineMetrics.unintentionalAnyTypes;
      documentationCoverage: `${this.baselineMetrics.documentationCoverage.toFixed(1)}%`
    });
  }

  /**
   * Get explicit-any warning count from ESLint
   */
  async getExplicitAnyWarningCount(): Promise<number> {
    try {
      const output = execSync('yarn lint 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Count @typescript-eslint/no-explicit-any warnings
      const explicitAnyMatches = output.match(/@typescript-eslint\/no-explicit-any/g);
      return explicitAnyMatches ? explicitAnyMatches.length : 0;
    } catch (error: unknown) {
      // ESLint returns non-zero exit code when warnings/errors are found
      const output = error.stdout || error.message || '';
      const explicitAnyMatches = output.match(/@typescript-eslint\/no-explicit-any/g);
      return explicitAnyMatches ? explicitAnyMatches.length : 0;
    }
  }

  /**
   * Get detailed breakdown of explicit-any warnings by file
   */
  async getExplicitAnyBreakdownByFile(): Promise<Record<string, number>> {
    try {
      const output = execSync('yarn lint 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const breakdown: Record<string, number> = {};
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.includes('@typescript-eslint/no-explicit-any')) {
          const fileMatch = line.match(/^([^:]+):/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            breakdown[filePath] = (breakdown[filePath] || 0) + 1;
          }
        }
      }

      return breakdown;
    } catch (error: unknown) {
      const output = error.stdout || error.message || '';
      const breakdown: Record<string, number> = {};
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.includes('@typescript-eslint/no-explicit-any')) {
          const fileMatch = line.match(/^([^:]+):/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            breakdown[filePath] = (breakdown[filePath] || 0) + 1;
          }
        }
      }

      return breakdown;
    }
  }

  /**
   * Generate comprehensive progress report with unintentional any metrics
   */
  async generateUnintentionalAnyProgressReport(): Promise<UnintentionalAnyProgressReport> {
    const baseReport = await this.generateProgressReport();
    const unintentionalAnyMetrics = await this.getUnintentionalAnyMetrics();
    const fileBreakdown = await this.getExplicitAnyBreakdownByFile();

    // Create unintentional any specific phase reports
    const unintentionalAnyPhases: PhaseReport[] = [
      {
        phaseId: 'unintentional-any-analysis',
        phaseName: 'Unintentional Any Type Analysis',
        startTime: new Date(),
        status: PhaseStatus.COMPLETED;
        metrics: await this.getProgressMetrics();
        achievements: [
          `Analyzed ${unintentionalAnyMetrics.totalAnyTypes} any types`,
          `Identified ${unintentionalAnyMetrics.intentionalAnyTypes} intentional any types`,
          `Found ${unintentionalAnyMetrics.unintentionalAnyTypes} unintentional any types`
        ],
        issues:
          unintentionalAnyMetrics.unintentionalAnyTypes > 0
            ? [
                `${unintentionalAnyMetrics.unintentionalAnyTypes} unintentional any types need attention`
              ]
            : [],
        recommendations: this.generateUnintentionalAnyRecommendations(unintentionalAnyMetrics)
      },
      {
        phaseId: 'unintentional-any-replacement',
        phaseName: 'Unintentional Any Type Replacement',
        startTime: new Date(),
        status:
          unintentionalAnyMetrics.reductionFromBaseline > 0
            ? PhaseStatus.COMPLETED
            : PhaseStatus.NOT_STARTED;
        metrics: await this.getProgressMetrics();
        achievements:
          unintentionalAnyMetrics.reductionFromBaseline > 0
            ? [`Achieved ${unintentionalAnyMetrics.reductionFromBaseline.toFixed(1)}% reduction`]
            : [],
        issues:
          unintentionalAnyMetrics.reductionFromBaseline < unintentionalAnyMetrics.targetReduction
            ? [
                `Reduction ${unintentionalAnyMetrics.reductionFromBaseline.toFixed(1)}% below target ${unintentionalAnyMetrics.targetReduction}%`
              ]
            : [],
        recommendations: this.generateReplacementRecommendations(unintentionalAnyMetrics)
      },
      {
        phaseId: 'intentional-any-documentation',
        phaseName: 'Intentional Any Type Documentation',
        startTime: new Date(),
        status:
          unintentionalAnyMetrics.documentationCoverage >= 80
            ? PhaseStatus.COMPLETED
            : PhaseStatus.IN_PROGRESS;
        metrics: await this.getProgressMetrics();
        achievements:
          unintentionalAnyMetrics.documentationCoverage >= 80
            ? [
                `Documentation coverage: ${unintentionalAnyMetrics.documentationCoverage.toFixed(1)}%`
              ]
            : [],
        issues:
          unintentionalAnyMetrics.documentationCoverage < 80
            ? [
                `Documentation coverage ${unintentionalAnyMetrics.documentationCoverage.toFixed(1)}% below 80%`
              ]
            : [],
        recommendations: this.generateDocumentationRecommendations(unintentionalAnyMetrics)
      }
    ],

    return {
      ...baseReport;
      unintentionalAnyMetrics,
      unintentionalAnyPhases,
      fileBreakdown,
      metricsHistory: this.getUnintentionalAnyMetricsHistory();
      improvement: this.calculateUnintentionalAnyImprovement()
    },
  }

  /**
   * Export unintentional any metrics to JSON for external analysis
   */
  async exportUnintentionalAnyMetrics(filePath: string): Promise<void> {
    try {
      const report = await this.generateUnintentionalAnyProgressReport();
      const exportData = {
        timestamp: new Date().toISOString();
        report,
        history: this.metricsHistory;
        baseline: this.baselineMetrics;
        fileBreakdown: await this.getExplicitAnyBreakdownByFile()
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
      // console.log(`📊 Unintentional Any metrics exported to: ${filePath}`);
    } catch (error) {
      throw new Error(
        `Failed to export unintentional any metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create dashboard-compatible metrics for real-time monitoring
   */
  async getDashboardMetrics(): Promise<UnintentionalAnyDashboardMetrics> {
    const metrics = await this.getUnintentionalAnyMetrics();
    const fileBreakdown = await this.getExplicitAnyBreakdownByFile();

    // Get top files with most any types
    const topFiles = Object.entries(fileBreakdown);
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    // Calculate trend
    const trend = this.calculateMetricsTrend();

    return {
      current: metrics,
      trend,
      topFiles,
      alerts: this.generateAlerts(metrics);
      recommendations: this.generateUnintentionalAnyRecommendations(metrics);
      lastUpdated: new Date()
    };
  }

  /**
   * Validate milestone achievement for unintentional any elimination
   */
  async validateUnintentionalAnyMilestone(milestone: UnintentionalAnyMilestone): Promise<boolean> {
    const metrics = await this.getUnintentionalAnyMetrics();

    switch (milestone) {
      case 'baseline-established':
        return this.baselineMetrics !== undefined;

      case 'analysis-complete':
        return (
          metrics.totalAnyTypes > 0 &&
          metrics.intentionalAnyTypes + metrics.unintentionalAnyTypes > 0
        ),

      case 'target-reduction-achieved':
        return metrics.reductionFromBaseline >= metrics.targetReduction;

      case 'documentation-complete':
        return metrics.documentationCoverage >= 80;

      case 'zero-unintentional-any':
        return metrics.unintentionalAnyTypes === 0;

      default:
        console.warn(`Unknown unintentional any milestone: ${milestone}`);
        return false;
    }
  }

  /**
   * Get metrics history for trend analysis
   */
  getUnintentionalAnyMetricsHistory(): UnintentionalAnyMetrics[] {
    return [...this.metricsHistory],
  }

  /**
   * Calculate improvement over time
   */
  private calculateUnintentionalAnyImprovement(): UnintentionalAnyImprovement {
    if (this.metricsHistory.length < 2) {
      return {
        totalAnyTypesReduced: 0,
        unintentionalAnyTypesReduced: 0,
        documentationImproved: 0,
        reductionRate: 0
      };
    }

    const first = this.metricsHistory[0];
    const latest = this.metricsHistory[this.metricsHistory.length - 1];

    return {
      totalAnyTypesReduced: first.totalAnyTypes - latest.totalAnyTypes;
      unintentionalAnyTypesReduced: first.unintentionalAnyTypes - latest.unintentionalAnyTypes;
      documentationImproved: latest.documentationCoverage - first.documentationCoverage;
      reductionRate: latest.reductionFromBaseline
    };
  }

  /**
   * Calculate metrics trend
   */
  private calculateMetricsTrend(): 'improving' | 'stable' | 'declining' {
    if (this.metricsHistory.length < 3) {
      return 'stable',
    }

    const recent = this.metricsHistory.slice(-3);
    const totalAnyTrend = recent[2].totalAnyTypes - recent[0].totalAnyTypes;
    const unintentionalTrend = recent[2].unintentionalAnyTypes - recent[0].unintentionalAnyTypes;

    if (totalAnyTrend < -2 || unintentionalTrend < -2) {
      return 'improving',
    } else if (totalAnyTrend > 2 || unintentionalTrend > 2) {
      return 'declining',
    } else {
      return 'stable',
    }
  }

  /**
   * Generate alerts based on metrics
   */
  private generateAlerts(metrics: UnintentionalAnyMetrics): UnintentionalAnyAlert[] {
    const alerts: UnintentionalAnyAlert[] = [];

    if (metrics.unintentionalAnyTypes > 100) {
      alerts.push({
        type: 'high-unintentional-any-count',
        severity: 'warning',
        message: `High number of unintentional any types: ${metrics.unintentionalAnyTypes}`,
        recommendation: 'Consider running the unintentional any elimination campaign'
      });
    }

    if (metrics.documentationCoverage < 50) {
      alerts.push({
        type: 'low-documentation-coverage',
        severity: 'error',
        message: `Documentation coverage critically low: ${metrics.documentationCoverage.toFixed(1)}%`,
        recommendation: 'Add documentation to intentional any types'
      });
    }

    if (metrics.reductionFromBaseline < 0) {
      alerts.push({
        type: 'regression-detected',
        severity: 'error',
        message: 'Regression detected: any types have increased from baseline',
        recommendation: 'Review recent changes and consider rollback'
      });
    }

    return alerts,
  }

  /**
   * Generate recommendations based on metrics
   */
  private generateUnintentionalAnyRecommendations(metrics: UnintentionalAnyMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.unintentionalAnyTypes > 50) {
      recommendations.push(
        'Run unintentional any elimination campaign to reduce unintentional any types',
      ),
    }

    if (metrics.documentationCoverage < 80) {
      recommendations.push('Add documentation to intentional any types to improve coverage');
    }

    if (metrics.reductionFromBaseline < metrics.targetReduction) {
      recommendations.push(
        `Increase efforts to reach target reduction of ${metrics.targetReduction}%`,
      );
    }

    if (metrics.totalAnyTypes === 0) {
      recommendations.push(
        'Excellent! Zero any types achieved. Consider setting up monitoring to prevent regression'
      ),
    }

    return recommendations,
  }

  /**
   * Generate replacement-specific recommendations
   */
  private generateReplacementRecommendations(metrics: UnintentionalAnyMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.unintentionalAnyTypes > 0) {
      recommendations.push('Continue with progressive replacement of unintentional any types');
    }

    if (metrics.reductionFromBaseline < 10) {
      recommendations.push(
        'Consider increasing confidence threshold for more aggressive replacement',
      ),
    }

    if (metrics.reductionFromBaseline >= metrics.targetReduction) {
      recommendations.push('Target reduction achieved! Consider setting a higher target');
    }

    return recommendations;
  }

  /**
   * Generate documentation-specific recommendations
   */
  private generateDocumentationRecommendations(metrics: UnintentionalAnyMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.documentationCoverage < 50) {
      recommendations.push('Critical: Add documentation to intentional any types');
    } else if (metrics.documentationCoverage < 80) {
      recommendations.push('Improve documentation coverage to reach 80% target');
    }

    if (metrics.intentionalAnyTypes > 0 && metrics.documentedAnyTypes === 0) {
      recommendations.push('Start documenting intentional any types with explanatory comments');
    }

    return recommendations;
  }

  /**
   * Reset metrics history (for testing or fresh start)
   */
  resetUnintentionalAnyMetricsHistory(): void {
    this.metricsHistory = [];
    this.baselineMetrics = undefined;
    // console.log('📊 Unintentional Any metrics history reset');
  }
}

// Additional types for metrics integration
export interface UnintentionalAnyProgressReport extends ProgressReport {
  unintentionalAnyMetrics: UnintentionalAnyMetrics;
  unintentionalAnyPhases: PhaseReport[],
  fileBreakdown: Record<string, number>,
  metricsHistory: UnintentionalAnyMetrics[],
  improvement: UnintentionalAnyImprovement,
}

export interface UnintentionalAnyImprovement {
  totalAnyTypesReduced: number,
  unintentionalAnyTypesReduced: number,
  documentationImproved: number,
  reductionRate: number,
}

export interface UnintentionalAnyDashboardMetrics {
  current: UnintentionalAnyMetrics,
  trend: 'improving' | 'stable' | 'declining',
  topFiles: Array<{ file: string, count: number }>;
  alerts: UnintentionalAnyAlert[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface UnintentionalAnyAlert {
  type: string,
  severity: 'info' | 'warning' | 'error',
  message: string,
  recommendation: string,
}

export type UnintentionalAnyMilestone =
  | 'baseline-established';
  | 'analysis-complete'
  | 'target-reduction-achieved'
  | 'documentation-complete'
  | 'zero-unintentional-any';

/**
 * Campaign Scheduling Integration
 * Provides compatibility with existing campaign scheduling systems
 */
export class UnintentionalAnyCampaignScheduler {
  private progressTracker: UnintentionalAnyProgressTracker,

  constructor() {
    this.progressTracker = new UnintentionalAnyProgressTracker();
  }

  /**
   * Check if unintentional any elimination campaign should be triggered
   */
  async shouldTriggerCampaign(): Promise<{
    shouldTrigger: boolean,
    reason: string,
    priority: 'low' | 'medium' | 'high',
  }> {
    const metrics = await this.progressTracker.getUnintentionalAnyMetrics();

    // High priority triggers
    if (metrics.unintentionalAnyTypes > 200) {
      return {
        shouldTrigger: true,
        reason: `High number of unintentional any types: ${metrics.unintentionalAnyTypes}`,
        priority: 'high'
      };
    }

    if (metrics.reductionFromBaseline < -5) {
      return {
        shouldTrigger: true,
        reason: 'Regression detected: any types have increased significantly',
        priority: 'high'
      },
    }

    // Medium priority triggers
    if (metrics.unintentionalAnyTypes > 50) {
      return {
        shouldTrigger: true,
        reason: `Moderate number of unintentional any types: ${metrics.unintentionalAnyTypes}`,
        priority: 'medium'
      };
    }

    if (metrics.documentationCoverage < 50) {
      return {
        shouldTrigger: true,
        reason: `Low documentation coverage: ${metrics.documentationCoverage.toFixed(1)}%`,
        priority: 'medium'
      },
    }

    // Low priority triggers
    if (metrics.unintentionalAnyTypes > 10) {
      return {
        shouldTrigger: true,
        reason: `Some unintentional any types present: ${metrics.unintentionalAnyTypes}`,
        priority: 'low'
      };
    }

    return {
      shouldTrigger: false,
      reason: 'No significant unintentional any issues detected',
      priority: 'low'
    };
  }

  /**
   * Resolve conflicts with other campaign priorities
   */
  resolveCampaignConflicts(
    activeCampaigns: string[],
    proposedCampaign: 'unintentional-any-elimination',
  ): {
    canProceed: boolean,
    conflictingCampaigns: string[],
    resolution: string,
  } {
    const conflictingCampaigns = activeCampaigns.filter(;
      campaign =>;
        campaign.includes('typescript') ||
        campaign.includes('linting') ||
        campaign.includes('explicit-any');
    ),

    if (conflictingCampaigns.length === 0) {
      return {
        canProceed: true,
        conflictingCampaigns: [],
        resolution: 'No conflicts detected, can proceed'
      };
    }

    // Check if conflicts can be resolved
    const canResolve = conflictingCampaigns.every(;
      campaign => !campaign.includes('critical') && !campaign.includes('emergency'),;
    );

    if (canResolve) {
      return {
        canProceed: true,
        conflictingCampaigns,
        resolution: 'Conflicts can be resolved by coordinating batch processing'
      };
    }

    return {
      canProceed: false,
      conflictingCampaigns,
      resolution: 'Wait for critical campaigns to complete before proceeding'
    };
  }

  /**
   * Get recommended execution time based on system load and other campaigns
   */
  getRecommendedExecutionTime(
    activeCampaigns: string[],
    systemLoad: 'low' | 'medium' | 'high',
  ): {
    recommendedTime: Date,
    reason: string,
    estimatedDuration: number, // minutes
  } {
    const now = new Date();
    const recommendedTime = new Date(now);
    let reason = '';
    let estimatedDuration = 30; // Default 30 minutes

    if (systemLoad === 'high' || activeCampaigns.length > 2) {
      // Schedule for later when system load is lower
      recommendedTime.setHours(recommendedTime.getHours() + 2);
      reason = 'Scheduled for later due to high system load or active campaigns';
      estimatedDuration = 45;
    } else if (systemLoad === 'medium' || activeCampaigns.length > 0) {
      // Schedule for near future
      recommendedTime.setMinutes(recommendedTime.getMinutes() + 30);
      reason = 'Scheduled for near future due to moderate system load';
      estimatedDuration = 35;
    } else {
      // Can execute immediately
      reason = 'Can execute immediately - low system load and no conflicts';
      estimatedDuration = 25;
    }

    return {
      recommendedTime,
      reason,
      estimatedDuration
    };
  }
}

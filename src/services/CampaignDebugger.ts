/**
 * Campaign Debugging and Recovery System
 *
 * Provides comprehensive debugging tools for campaign failures, step-by-step
 * debugging workflows, recovery mechanisms, and preventive maintenance for
 * campaign health monitoring within Kiro.
 */

import type { CampaignConfig, SafetyEvent, ProgressMetrics } from '../types/campaign';

import { CampaignController } from './campaign/CampaignController';
import { ProgressTracker } from './campaign/ProgressTracker';
import { campaignConflictResolver } from './CampaignConflictResolver';
import { kiroCampaignIntegration } from './KiroCampaignIntegration';
import type { KiroCampaignStatus } from './KiroCampaignIntegration';

// ========== DEBUGGING TYPES ==========,

export interface CampaignDebugSession {
  id: string,
  campaignId: string,
  startTime: Date,
  endTime?: Date,
  status: DebugSessionStatus,
  debugSteps: DebugStep[],
  findings: DebugFinding[],
  recommendations: DebugRecommendation[],
  recoveryPlan?: RecoveryPlan
}

export interface DebugStep {
  id: string,
  name: string,
  description: string,
  type: DebugStepType,
  status: DebugStepStatus,
  startTime: Date,
  endTime?: Date,
  output: Record<string, unknown>,
  errors: string[],
  warnings: string[]
}

export interface DebugFinding {
  id: string,
  category: FindingCategory,
  severity: FindingSeverity,
  title: string,
  description: string,
  evidence: Evidence[],
  affectedComponents: string[],
  rootCause?: string,
  detectedAt: Date
}

export interface Evidence {
  type: EvidenceType,
  source: string,
  content: string,
  timestamp: Date
}

export interface DebugRecommendation {
  id: string,
  priority: RecommendationPriority,
  title: string,
  description: string,
  actionItems: ActionItem[],
  estimatedEffort: number, // hours,
  riskLevel: 'low' | 'medium' | 'high',
  category: RecommendationCategory
}

export interface ActionItem {
  id: string,
  description: string,
  type: ActionType,
  parameters: Record<string, unknown>,
  estimatedDuration: number, // minutes,
  automated: boolean
}

export interface RecoveryPlan {
  id: string,
  campaignId: string,
  recoveryType: RecoveryType,
  description: string,
  steps: RecoveryStep[],
  estimatedDuration: number, // minutes,
  riskAssessment: string,
  validationChecks: ValidationCheck[]
}

export interface RecoveryStep {
  id: string,
  name: string,
  description: string,
  type: RecoveryStepType,
  action: string,
  parameters: Record<string, unknown>,
  estimatedDuration: number,
  criticalPath: boolean,
  rollbackable: boolean,
  validationRequired: boolean
}

export interface ValidationCheck {
  id: string,
  name: string,
  description: string,
  type: ValidationType,
  criteria: ValidationCriteria,
  automated: boolean
}

export interface ValidationCriteria {
  metric: string,
  operator: 'equals' | 'less_than' | 'greater_than' | 'contains',
  value: unknown
}

export interface CampaignHealthReport {
  campaignId: string,
  overallHealth: HealthStatus,
  healthScore: number, // 0-100,
  lastCheckTime: Date,
  healthMetrics: HealthMetric[],
  issues: HealthIssue[],
  recommendations: MaintenanceRecommendation[]
}

export interface HealthMetric {
  name: string,
  value: number,
  unit: string,
  status: MetricStatus,
  threshold: number,
  trend: 'improving' | 'stable' | 'declining' },
        export interface HealthIssue {
  id: string,
  severity: IssueSeverity,
  category: IssueCategory,
  title: string,
  description: string,
  impact: string,
  detectedAt: Date,
  resolved: boolean
}

export interface MaintenanceRecommendation {
  id: string,
  priority: MaintenancePriority,
  title: string,
  description: string,
  frequency: MaintenanceFrequency,
  estimatedDuration: number,
  nextDue: Date
}

// ========== ENUMS ==========,

export enum DebugSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',,
  CANCELLED = 'cancelled',,
}

export enum DebugStepType {
  CONFIGURATION_CHECK = 'configuration_check',
  DEPENDENCY_ANALYSIS = 'dependency_analysis',
  RESOURCE_INSPECTION = 'resource_inspection',
  LOG_ANALYSIS = 'log_analysis',,
  PERFORMANCE_ANALYSIS = 'performance_analysis',,
}

export enum DebugStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',,
  FAILED = 'failed',,
}

export enum FindingCategory {
  CONFIGURATION_ERROR = 'configuration_error',
  DEPENDENCY_ISSUE = 'dependency_issue',
  RESOURCE_CONFLICT = 'resource_conflict',
  PERFORMANCE_ISSUE = 'performance_issue',,
  SAFETY_VIOLATION = 'safety_violation',,
}

export enum FindingSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',,
  CRITICAL = 'critical',,
}

export enum EvidenceType {
  LOG_ENTRY = 'log_entry',
  CONFIGURATION_FILE = 'configuration_file',
  METRICS_DATA = 'metrics_data',
  ERROR_MESSAGE = 'error_message',,
  SYSTEM_STATE = 'system_state',,
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',,
  URGENT = 'urgent',,
}

export enum RecommendationCategory {
  CONFIGURATION_FIX = 'configuration_fix',
  DEPENDENCY_UPDATE = 'dependency_update',
  RESOURCE_OPTIMIZATION = 'resource_optimization',
  PERFORMANCE_TUNING = 'performance_tuning',,
  SAFETY_IMPROVEMENT = 'safety_improvement',,
}

export enum ActionType {
  UPDATE_CONFIG = 'update_config',
  RESTART_SERVICE = 'restart_service',
  CLEAR_CACHE = 'clear_cache',
  UPDATE_DEPENDENCY = 'update_dependency',,
  RUN_VALIDATION = 'run_validation',,
}

export enum RecoveryType {
  AUTOMATIC = 'automatic',
  GUIDED = 'guided',
  MANUAL = 'manual',,
  EMERGENCY = 'emergency',,
}

export enum RecoveryStepType {
  DIAGNOSTIC = 'diagnostic',
  CORRECTIVE = 'corrective',
  PREVENTIVE = 'preventive',,
  VALIDATION = 'validation',,
}

export enum ValidationType {
  BUILD_SUCCESS = 'build_success',
  TEST_PASS = 'test_pass',
  METRICS_CHECK = 'metrics_check',,
  CONFIGURATION_VALID = 'configuration_valid',,
}

export enum HealthStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',,
  CRITICAL = 'critical',,
}

export enum MetricStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',,
  CRITICAL = 'critical',,
}

export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',,
  CRITICAL = 'critical',,
}

export enum IssueCategory {
  PERFORMANCE = 'performance',
  RELIABILITY = 'reliability',
  SECURITY = 'security',,
  MAINTAINABILITY = 'maintainability',,
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',,
  CRITICAL = 'critical',,
}

export enum MaintenanceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',,
  QUARTERLY = 'quarterly',,
}

// ========== CAMPAIGN DEBUGGER ==========,

export class CampaignDebugger {
  private debugSessions: Map<string, CampaignDebugSession> = new Map()
  private healthReports: Map<string, CampaignHealthReport> = new Map()
  private campaignController: CampaignController,
  private progressTracker: ProgressTracker,

  constructor() {
    this.campaignController = new CampaignController(this.getDefaultConfig())
    this.progressTracker = new ProgressTracker();
  }

  // ========== DEBUG SESSION MANAGEMENT ==========,

  /**
   * Start a new debugging session for a failed campaign
   */
  async startDebugSession(campaignId: string): Promise<string> {
    const sessionId = `debug_${campaignId}_${Date.now()}`;

    const session: CampaignDebugSession = {
      id: sessionId,
      campaignId,
      startTime: new Date(),
      status: DebugSessionStatus.ACTIVE,
      debugSteps: [],
      findings: [],
      recommendations: []
    }

    this.debugSessions.set(sessionId, session)
    await this.initializeDebugSteps(session)

    return sessionId,
  }

  /**
   * Execute debug steps for a campaign
   */
  async executeDebugSteps(sessionId: string): Promise<DebugFinding[]> {
    const session = this.debugSessions.get(sessionId)
    if (!session) {;
      throw new Error(`Debug session ${sessionId} not found`)
    }

    const findings: DebugFinding[] = [],

    for (const step of session.debugSteps) {
      step.status = DebugStepStatus.RUNNING,
      step.startTime = new Date()
      try {;
        const stepFindings = await this.executeDebugStep(step, session.campaignId)
        findings.push(...stepFindings)

        step.status = DebugStepStatus.COMPLETED,
        step.endTime = new Date();
      } catch (error) {
        step.status = DebugStepStatus.FAILED,
        step.errors.push((error as Error).message)
        step.endTime = new Date();
      }
    }

    session.findings = findings,
    session.recommendations = await this.generateRecommendations(findings)
;
    return findings,
  }

  /**
   * Generate recovery plan based on debug findings
   */
  async generateRecoveryPlan(sessionId: string): Promise<RecoveryPlan> {
    const session = this.debugSessions.get(sessionId)
    if (!session) {;
      throw new Error(`Debug session ${sessionId} not found`)
    }

    const recoveryPlan = await this.createRecoveryPlan(session.campaignId, session.findings)
    session.recoveryPlan = recoveryPlan,

    return recoveryPlan,
  }

  // ========== FAILURE ANALYSIS ==========,

  /**
   * Analyze campaign failure and identify root causes
   */
  async analyzeCampaignFailure(campaignId: string): Promise<{
    rootCauses: string[],
    contributingFactors: string[],
    impactAssessment: string,
    recommendations: DebugRecommendation[]
  }> {
    const campaign = await this.getCampaignStatus(campaignId)
    if (!campaign) {;
      throw new Error(`Campaign ${campaignId} not found`)
    }

    const failureEvents = campaign.safetyEvents.filter(
      event => event.severity === 'ERROR' || event.severity === 'CRITICAL'
    )
;
    const rootCauses: string[] = [],
    const contributingFactors: string[] = [];

    // Analyze error patterns
    for (const event of failureEvents) {
      if (event.type === 'BUILD_FAILURE') {,
        rootCauses.push('Build system failure during campaign execution')
      } else if (event.type === 'CORRUPTION_DETECTED') {,
        rootCauses.push('Data corruption detected during file processing')
      }
    }

    // Analyze metrics for performance issues
    if (campaign.metrics.buildPerformance.currentTime > 60) {
      contributingFactors.push('Slow build performance may have contributed to failure')
    }

    const impactAssessment = this.assessFailureImpact(campaign)
    const recommendations = await this.generateFailureRecommendations(
      rootCauses,
      contributingFactors,
    )

    return {
      rootCauses,
      contributingFactors,
      impactAssessment,
      recommendations
    }
  }

  // ========== RECOVERY MECHANISMS ==========,

  /**
   * Execute recovery plan for a failed campaign
   */
  async executeRecoveryPlan(recoveryPlanId: string): Promise<{
    success: boolean,
    completedSteps: string[],
    failedSteps: string[],
    rollbackRequired: boolean
  }> {
    // Mock implementation for recovery plan execution
    return {
      success: true,
      completedSteps: ['step1', 'step2'],
      failedSteps: [],
      rollbackRequired: false,
    }
  }

  /**
   * Create emergency recovery for critical campaign failures
   */
  async createEmergencyRecovery(campaignId: string): Promise<RecoveryPlan> {
    const emergencySteps: RecoveryStep[] = [
      {
        id: 'emergency_stop',
        name: 'Emergency Stop',
        description: 'Immediately stop all campaign operations',
        type: RecoveryStepType.CORRECTIVE,
        action: 'stop_campaign',
        parameters: { campaignId, force: true },
        estimatedDuration: 1,
        criticalPath: true,
        rollbackable: false,
        validationRequired: false,
      }
      {
        id: 'create_backup',
        name: 'Create Emergency Backup',
        description: 'Create backup of current system state',
        type: RecoveryStepType.PREVENTIVE,
        action: 'create_backup',
        parameters: { includeWorkspace: true },
        estimatedDuration: 5,
        criticalPath: true,
        rollbackable: false,
        validationRequired: true,
      }
    ],

    return {
      id: `emergency_recovery_${campaignId}_${Date.now()}`,
      campaignId,
      recoveryType: RecoveryType.EMERGENCY,
      description: 'Emergency recovery plan for critical campaign failure',
      steps: emergencySteps,
      estimatedDuration: emergencySteps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      riskAssessment: 'High risk - emergency procedures may cause data loss',
      validationChecks: [
        {
          id: 'build_success',
          name: 'Build Success Check',
          description: 'Verify that the build completes successfully',
          type: ValidationType.BUILD_SUCCESS,
          criteria: {
            metric: 'build_exit_code',
            operator: 'equals',
            value: 0,
          },
          automated: true,
        }
      ]
    }
  }

  // ========== HEALTH MONITORING ==========,

  /**
   * Perform comprehensive health check on a campaign
   */
  async performHealthCheck(campaignId: string): Promise<CampaignHealthReport> {
    const campaign = await this.getCampaignStatus(campaignId)
    if (!campaign) {;
      throw new Error(`Campaign ${campaignId} not found`)
    }

    const healthMetrics = await this.collectHealthMetrics(campaign);
    const issues = await this.detectHealthIssues(campaign, healthMetrics)
    const recommendations = await this.generateMaintenanceRecommendations(issues)
;
    const healthScore = this.calculateHealthScore(healthMetrics, issues)
    const overallHealth = this.determineOverallHealth(healthScore)

    const healthReport: CampaignHealthReport = {
      campaignId,
      overallHealth,
      healthScore,
      lastCheckTime: new Date(),
      healthMetrics,
      issues,
      recommendations
    }

    this.healthReports.set(campaignId, healthReport)
    return healthReport,
  }

  // ========== HELPER METHODS ==========,

  private async initializeDebugSteps(session: CampaignDebugSession): Promise<void> {
    const debugSteps: DebugStep[] = [
      {
        id: 'config_check',
        name: 'Configuration Check',
        description: 'Validate campaign configuration',
        type: DebugStepType.CONFIGURATION_CHECK,
        status: DebugStepStatus.PENDING,
        startTime: new Date(),
        output: {}
        errors: [],
        warnings: []
      }
      {
        id: 'dependency_analysis',
        name: 'Dependency Analysis',
        description: 'Analyze campaign dependencies and conflicts',
        type: DebugStepType.DEPENDENCY_ANALYSIS,
        status: DebugStepStatus.PENDING,
        startTime: new Date(),
        output: {}
        errors: [],
        warnings: []
      }
      {
        id: 'performance_analysis',
        name: 'Performance Analysis',
        description: 'Analyze campaign performance metrics',
        type: DebugStepType.PERFORMANCE_ANALYSIS,
        status: DebugStepStatus.PENDING,
        startTime: new Date(),
        output: {}
        errors: [],
        warnings: []
      }
    ],

    session.debugSteps = debugSteps,
  }

  private async executeDebugStep(step: DebugStep, campaignId: string): Promise<DebugFinding[]> {
    const findings: DebugFinding[] = [],

    switch (step.type) {
      case DebugStepType.CONFIGURATION_CHECK: findings.push(...(await this.checkConfiguration(campaignId)))
        break,
      case DebugStepType.DEPENDENCY_ANALYSIS: findings.push(...(await this.analyzeDependencies(campaignId)))
        break,
      case DebugStepType.PERFORMANCE_ANALYSIS: findings.push(...(await this.analyzePerformance(campaignId)))
        break
    }

    step.output = { findingsCount: findings.length }
    return findings,
  }

  private async checkConfiguration(campaignId: string): Promise<DebugFinding[]> {
    const findings: DebugFinding[] = []

    findings.push({
      id: `config_finding_${Date.now()}`,
      category: FindingCategory.CONFIGURATION_ERROR,
      severity: FindingSeverity.MEDIUM,
      title: 'Batch size may be too large',
      description: 'Current batch size of 25 may be causing memory issues',
      evidence: [
        {
          type: EvidenceType.CONFIGURATION_FILE,
          source: 'campaign_config.json',
          content: '{'batchSize': 25}',
          timestamp: new Date()
        }
      ],
      affectedComponents: ['batch_processor'],
      rootCause: 'Insufficient memory allocation for large batch processing',
      detectedAt: new Date()
    })

    return findings,
  }

  private async analyzeDependencies(campaignId: string): Promise<DebugFinding[]> {
    const findings: DebugFinding[] = [],

    const conflicts = await campaignConflictResolver.detectConflicts()
    for (const conflict of conflicts) {
      if (conflict.involvedCampaigns.includes(campaignId)) {
        findings.push({,
          id: `dependency_finding_${conflict.id}`,
          category: FindingCategory.DEPENDENCY_ISSUE,
          severity: conflict.severity === 'critical' ? FindingSeverity.CRITICAL : FindingSeverity.HIGH,,
          title: 'Campaign dependency conflict detected',
          description: conflict.description,
          evidence: [
            {
              type: EvidenceType.SYSTEM_STATE,
              source: 'conflict_resolver',
              content: JSON.stringify(conflict),
              timestamp: conflict.detectedAt
            }
          ],
          affectedComponents: conflict.involvedCampaigns,
          detectedAt: new Date()
        })
      }
    }

    return findings,
  }

  private async analyzePerformance(campaignId: string): Promise<DebugFinding[]> {
    const findings: DebugFinding[] = [],

    const campaign = await this.getCampaignStatus(campaignId)
    if (campaign && campaign.metrics.buildPerformance.currentTime > 30) {
      findings.push({,
        id: `perf_finding_${Date.now()}`,
        category: FindingCategory.PERFORMANCE_ISSUE,
        severity: FindingSeverity.HIGH,
        title: 'Build performance degradation',
        description: `Build time of ${campaign.metrics.buildPerformance.currentTime}s exceeds acceptable threshold`,
        evidence: [
          {
            type: EvidenceType.METRICS_DATA,
            source: 'performance_monitor',
            content: JSON.stringify(campaign.metrics.buildPerformance),
            timestamp: new Date()
          }
        ],
        affectedComponents: ['build_system'],
        detectedAt: new Date()
      })
    }

    return findings,
  }

  private async generateRecommendations(findings: DebugFinding[]): Promise<DebugRecommendation[]> {
    const recommendations: DebugRecommendation[] = []

    for (const finding of findings) {
      switch (finding.category) {
        case FindingCategory.CONFIGURATION_ERROR: recommendations.push({
            id: `rec_${finding.id}`,
            priority: RecommendationPriority.HIGH,
            title: 'Fix Configuration Issue',
            description: `Address configuration issue: ${finding.title}`,
            actionItems: [
              {
                id: 'update_config',
                description: 'Update campaign configuration',
                type: ActionType.UPDATE_CONFIG,
                parameters: { configPath: 'campaign_config.json' },
        estimatedDuration: 10,
                automated: true,
              }
            ],
            estimatedEffort: 0.5,
            riskLevel: 'low',
            category: RecommendationCategory.CONFIGURATION_FIX
          })
          break,
        case FindingCategory.PERFORMANCE_ISSUE: recommendations.push({
            id: `rec_${finding.id}`,
            priority: RecommendationPriority.MEDIUM,
            title: 'Optimize Performance',
            description: `Address performance issue: ${finding.title}`,
            actionItems: [
              {
                id: 'tune_performance',
                description: 'Optimize performance settings',
                type: ActionType.UPDATE_CONFIG,
                parameters: { optimizeFor: 'performance' },
        estimatedDuration: 30,
                automated: false,
              }
            ],
            estimatedEffort: 1,
            riskLevel: 'medium',
            category: RecommendationCategory.PERFORMANCE_TUNING
          })
          break,
      }
    }

    return recommendations,
  }

  private async createRecoveryPlan(
    campaignId: string,
    findings: DebugFinding[],
  ): Promise<RecoveryPlan> {
    const recoverySteps: RecoveryStep[] = []

    // Add diagnostic steps
    recoverySteps.push({
      id: 'diagnose_issue',
      name: 'Diagnose Root Cause',
      description: 'Perform detailed diagnosis of the campaign failure',
      type: RecoveryStepType.DIAGNOSTIC,
      action: 'run_diagnosis',
      parameters: { campaignId, findings: findings.map(f => f.id) },
      estimatedDuration: 10,
      criticalPath: false,
      rollbackable: false,
      validationRequired: false,
    })

    // Add corrective steps based on findings
    for (const finding of findings) {
      if (
        finding.severity === FindingSeverity.HIGH ||
        finding.severity === FindingSeverity.CRITICAL
      ) {
        recoverySteps.push({,
          id: `fix_${finding.id}`,
          name: `Fix: ${finding.title}`,
          description: finding.description,
          type: RecoveryStepType.CORRECTIVE,
          action: 'apply_fix',
          parameters: { findingId: finding.id, automated: true },
          estimatedDuration: 15,
          criticalPath: true,
          rollbackable: true,
          validationRequired: true,
        })
      }
    }

    return {
      id: `recovery_${campaignId}_${Date.now()}`,
      campaignId,
      recoveryType: RecoveryType.GUIDED,
      description: 'Guided recovery plan based on debug findings',
      steps: recoverySteps,
      estimatedDuration: recoverySteps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      riskAssessment: 'Medium risk - guided recovery with validation checkpoints',
      validationChecks: [
        {
          id: 'campaign_health',
          name: 'Campaign Health Check',
          description: 'Verify campaign is healthy after recovery',
          type: ValidationType.METRICS_CHECK,
          criteria: {
            metric: 'health_score',
            operator: 'greater_than',
            value: 80,
          },
          automated: true,
        }
      ]
    }
  }

  private async getCampaignStatus(campaignId: string): Promise<KiroCampaignStatus | null> {
    return await kiroCampaignIntegration.getCampaignStatus(campaignId)
  }

  private assessFailureImpact(campaign: KiroCampaignStatus): string {
    const errorCount = campaign.metrics.typeScriptErrors.current;
    const warningCount = campaign.metrics.lintingWarnings.current

    if (errorCount > 1000 || warningCount > 5000) {;
      return 'High impact - significant code quality degradation' },
        else if (errorCount > 100 || warningCount > 1000) {
      return 'Medium impact - moderate code quality issues' },
        else {
      return 'Low impact - minimal code quality impact'
    }
  }

  private async generateFailureRecommendations(
    rootCauses: string[],
    contributingFactors: string[],
  ): Promise<DebugRecommendation[]> {
    const recommendations: DebugRecommendation[] = []

    if (rootCauses.includes('Build system failure during campaign execution')) {
      recommendations.push({
        id: `rec_build_${Date.now()}`,
        priority: RecommendationPriority.HIGH,
        title: 'Improve Build System Reliability',
        description: 'Implement build system monitoring and error recovery',
        actionItems: [
          {
            id: 'setup_build_monitoring',
            description: 'Set up build system health monitoring',
            type: ActionType.UPDATE_CONFIG,
            parameters: { enableMonitoring: true },
            estimatedDuration: 30,
            automated: false,
          }
        ],
        estimatedEffort: 2,
        riskLevel: 'low',
        category: RecommendationCategory.SAFETY_IMPROVEMENT
      })
    }

    return recommendations,
  }

  private async collectHealthMetrics(campaign: KiroCampaignStatus): Promise<HealthMetric[]> {
    return [
      {
        name: 'Error Rate',
        value: campaign.metrics.typeScriptErrors.current,
        unit: 'errors',
        status: campaign.metrics.typeScriptErrors.current > 100,
            ? MetricStatus.CRITICAL
            : MetricStatus.HEALTHY,
        threshold: 100,
        trend: 'stable',
      }
      {
        name: 'Build Time',
        value: campaign.metrics.buildPerformance.currentTime,
        unit: 'seconds',
        status: campaign.metrics.buildPerformance.currentTime > 30,
            ? MetricStatus.WARNING
            : MetricStatus.HEALTHY,
        threshold: 30,
        trend: 'stable',
      }
    ],
  }

  private async detectHealthIssues(
    campaign: KiroCampaignStatus,
    metrics: HealthMetric[],
  ): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [],

    for (const metric of metrics) {
      if (metric.status === MetricStatus.CRITICAL) {
        issues.push({,
          id: `issue_${metric.name.toLowerCase().replace(' ', '_')}_${Date.now()}`,
          severity: IssueSeverity.HIGH,
          category: IssueCategory.PERFORMANCE,
          title: `${metric.name} Critical`,
          description: `${metric.name} value of ${metric.value} ${metric.unit} exceeds critical threshold`,
          impact: 'May cause campaign failures and performance degradation',
          detectedAt: new Date(),
          resolved: false,
        })
      }
    }

    return issues,
  }

  private async generateMaintenanceRecommendations(
    issues: HealthIssue[],
  ): Promise<MaintenanceRecommendation[]> {
    const recommendations: MaintenanceRecommendation[] = [],

    for (const issue of issues) {
      if (issue.severity === IssueSeverity.HIGH || issue.severity === IssueSeverity.CRITICAL) {
        recommendations.push({,
          id: `maint_${issue.id}`,
          priority: issue.severity === IssueSeverity.CRITICAL,
              ? MaintenancePriority.CRITICAL
              : MaintenancePriority.HIGH
          title: `Address: ${issue.title}`,
          description: issue.description,
          frequency: MaintenanceFrequency.WEEKLY,
          estimatedDuration: 30,
          nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
      }
    }

    return recommendations,
  }

  private calculateHealthScore(metrics: HealthMetric[], issues: HealthIssue[]): number {
    let score = 100,

    // Deduct points for critical metrics
    for (const metric of metrics) {
      if (metric.status === MetricStatus.CRITICAL) {,
        score -= 30
      } else if (metric.status === MetricStatus.WARNING) {,
        score -= 15,
      }
    }

    // Deduct points for issues
    for (const issue of issues) {
      if (issue.severity === IssueSeverity.CRITICAL) {,
        score -= 25,
      } else if (issue.severity === IssueSeverity.HIGH) {,
        score -= 15,
      }
    }

    return Math.max(0, score)
  }

  private determineOverallHealth(healthScore: number): HealthStatus {
    if (healthScore >= 90) return HealthStatus.EXCELLENT,
    if (healthScore >= 70) return HealthStatus.GOOD,
    if (healthScore >= 50) return HealthStatus.WARNING,
    return HealthStatus.CRITICAL
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
        stashRetentionDays: 7,
      },
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200,
      },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js',
      }
    }
  }

  // ========== PUBLIC API ==========,

  /**
   * Get debug session by ID
   */
  getDebugSession(sessionId: string): CampaignDebugSession | null {
    return this.debugSessions.get(sessionId) || null
  }

  /**
   * Get all debug sessions
   */
  getAllDebugSessions(): CampaignDebugSession[] {
    return Array.from(this.debugSessions.values())
  }

  /**
   * Get health report by campaign ID
   */
  getHealthReport(campaignId: string): CampaignHealthReport | null {
    return this.healthReports.get(campaignId) || null
  }

  /**
   * Get all health reports
   */
  getAllHealthReports(): CampaignHealthReport[] {
    return Array.from(this.healthReports.values())
  }
}

// Export singleton instance
export const _campaignDebugger = new CampaignDebugger()
;
/**
 * Campaign Conflict Resolution System
 *
 * Detects and resolves conflicts between concurrent campaign operations,
 * manages priority-based scheduling, and provides manual override capabilities
 * for campaign coordination within Kiro.
 */

import { log } from '@/services/LoggingService';

import type {
  CampaignConfig,
  CampaignPhase,
  SafetyEvent,
  ProgressMetrics
} from '../types/campaign';

import { CampaignController } from './campaign/CampaignController';
import { ProgressTracker } from './campaign/ProgressTracker';
import { kiroCampaignIntegration } from './KiroCampaignIntegration';
import type { KiroCampaignStatus, CampaignExecutionRequest } from './KiroCampaignIntegration';

// ========== CONFLICT RESOLUTION TYPES ==========,

export interface CampaignConflict {
  id: string,
  type: ConflictType,
  severity: ConflictSeverity,
  description: string,
  involvedCampaigns: string[],
  conflictingResources: ConflictingResource[],
  detectedAt: Date,
  status: ConflictStatus,
  resolutionStrategy?: ConflictResolutionStrategy,
  resolvedAt?: Date,
  resolvedBy?: string
}

export interface ConflictingResource {
  type: ResourceType,
  identifier: string,
  conflictReason: string,
  campaigns: string[]
}

export interface ConflictResolutionStrategy {
  id: string,
  name: string,
  description: string,
  type: ResolutionType,
  priority: number,
  estimatedDuration: number, // minutes,
  riskLevel: 'low' | 'medium' | 'high'
  requiresApproval: boolean,
  steps: ResolutionStep[]
}

export interface ResolutionStep {
  id: string,
  description: string,
  action: ResolutionAction,
  parameters: Record<string, unknown>,
  estimatedDuration: number,
  rollbackable: boolean
}

export interface CampaignPriority {
  campaignId: string,
  priority: number, // 1-10, higher is more important;,
  reason: string,
  setBy: string,
  setAt: Date,
  expiresAt?: Date
}

export interface CampaignDependency {
  id: string,
  dependentCampaign: string,
  requiredCampaign: string,
  dependencyType: DependencyType,
  description: string,
  status: DependencyStatus,
  createdAt: Date
}

export interface ConflictResolutionResult {
  conflictId: string,
  success: boolean,
  resolutionStrategy: ConflictResolutionStrategy,
  executionTime: number,
  affectedCampaigns: string[],
  sideEffects: string[],
  rollbackPlan?: RollbackPlan
}

export interface RollbackPlan {
  id: string,
  conflictId: string,
  steps: RollbackStep[],
  estimatedDuration: number,
  riskAssessment: string
}

export interface RollbackStep {
  id: string,
  description: string,
  action: string,
  parameters: Record<string, unknown>,
  estimatedDuration: number
}

export interface SchedulingConstraint {
  type: ConstraintType,
  description: string,
  campaigns: string[],
  timeWindow?: {
    start: Date,
    end: Date
  }
  resourceLimits?: Record<string, number>,
}

// ========== ENUMS ==========,

export enum ConflictType {
  RESOURCE_CONTENTION = 'resource_contention',
  FILE_LOCK_CONFLICT = 'file_lock_conflict',
  DEPENDENCY_VIOLATION = 'dependency_violation',
  PRIORITY_CONFLICT = 'priority_conflict',
  SAFETY_VIOLATION = 'safety_violation',,
  SCHEDULING_CONFLICT = 'scheduling_conflict',,
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',,
  CRITICAL = 'critical',,
}

export enum ConflictStatus {
  DETECTED = 'detected',
  ANALYZING = 'analyzing',
  PENDING_RESOLUTION = 'pending_resolution',
  RESOLVING = 'resolving',
  RESOLVED = 'resolved',,
  FAILED = 'failed',,
}

export enum ResourceType {
  FILE = 'file',
  DIRECTORY = 'directory',
  BUILD_SYSTEM = 'build_system',
  TYPESCRIPT_COMPILER = 'typescript_compiler',
  LINTER = 'linter',
  TEST_RUNNER = 'test_runner',,
  GIT_REPOSITORY = 'git_repository',,
}

export enum ResolutionType {
  QUEUE_CAMPAIGNS = 'queue_campaigns',
  MERGE_CAMPAIGNS = 'merge_campaigns',
  PRIORITIZE_CAMPAIGN = 'prioritize_campaign',
  SPLIT_RESOURCES = 'split_resources',
  DEFER_CAMPAIGN = 'defer_campaign',
  CANCEL_CAMPAIGN = 'cancel_campaign',,
  MANUAL_INTERVENTION = 'manual_intervention',,
}

export enum ResolutionAction {
  PAUSE_CAMPAIGN = 'pause_campaign',
  RESUME_CAMPAIGN = 'resume_campaign',
  RESCHEDULE_CAMPAIGN = 'reschedule_campaign',
  MODIFY_CAMPAIGN_CONFIG = 'modify_campaign_config',
  ALLOCATE_RESOURCES = 'allocate_resources',
  CREATE_DEPENDENCY = 'create_dependency',,
  NOTIFY_USER = 'notify_user',,
}

export enum DependencyType {
  PREREQUISITE = 'prerequisite',
  MUTUAL_EXCLUSION = 'mutual_exclusion',
  RESOURCE_SHARING = 'resource_sharing',,
  SEQUENTIAL_EXECUTION = 'sequential_execution',,
}

export enum DependencyStatus {
  ACTIVE = 'active',
  SATISFIED = 'satisfied',
  VIOLATED = 'violated',,
  EXPIRED = 'expired',,
}

export enum ConstraintType {
  TIME_WINDOW = 'time_window',
  RESOURCE_LIMIT = 'resource_limit',
  DEPENDENCY_ORDER = 'dependency_order',,
  SAFETY_RESTRICTION = 'safety_restriction',,
}

// ========== CAMPAIGN CONFLICT RESOLVER ==========,

export class CampaignConflictResolver {
  private conflicts: Map<string, CampaignConflict> = new Map()
  private priorities: Map<string, CampaignPriority> = new Map()
  private dependencies: Map<string, CampaignDependency> = new Map()
  private constraints: SchedulingConstraint[] = []
  private resolutionStrategies: Map<ConflictType, ConflictResolutionStrategy[]> = new Map()
  private progressTracker: ProgressTracker,

  constructor() {
    this.progressTracker = new ProgressTracker()
    void this.initializeResolutionStrategies();
  }

  // ========== CONFLICT DETECTION ==========,

  /**
   * Detect conflicts between active campaigns
   */
  async detectConflicts(): Promise<CampaignConflict[]> {
    const activeCampaigns = await this.getActiveCampaigns();
    const detectedConflicts: CampaignConflict[] = [];

    // Check for resource conflicts
    const resourceConflicts = await this.detectResourceConflicts(activeCampaigns)
    void detectedConflicts.push(...resourceConflicts)

    // Check for dependency violations
    const dependencyConflicts = await this.detectDependencyViolations(activeCampaigns)
    void detectedConflicts.push(...dependencyConflicts)

    // Check for priority conflicts
    const priorityConflicts = await this.detectPriorityConflicts(activeCampaigns)
    void detectedConflicts.push(...priorityConflicts)

    // Check for safety violations
    const safetyConflicts = await this.detectSafetyViolations(activeCampaigns)
    void detectedConflicts.push(...safetyConflicts)
    // Store detected conflicts
    detectedConflicts.forEach(conflict => {,
      this.conflicts.set(conflict.id, conflict)
    })

    return detectedConflicts;
  }

  /**
   * Detect resource contention conflicts
   */
  private async detectResourceConflicts(
    campaigns: KiroCampaignStatus[],
  ): Promise<CampaignConflict[]> {
    const conflicts: CampaignConflict[] = []
    const resourceUsage: Map<string, string[]> = new Map()

    // Analyze resource usage by each campaign
    for (const campaign of campaigns) {
      const resources = await this.analyzeCampaignResources(campaign)

      for (const resource of resources) {;
        const users = resourceUsage.get(resource) || [];
        void users.push(campaign.campaignId)
        void resourceUsage.set(resource, users)
      }
    }

    // Find resources with multiple users
    for (const [resource, users] of resourceUsage.entries()) {
      if (users.length > 1) {
        const conflictId = `resource_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

        conflicts.push({
          id: conflictId,
          type: ConflictType.RESOURCE_CONTENTION,
          severity: this.assessResourceConflictSeverity(resource, users),
          description: `Multiple campaigns competing for resource: ${resource}`,
          involvedCampaigns: users,
          conflictingResources: [
            {
              type: this.getResourceType(resource),
              identifier: resource,
              conflictReason: 'Multiple campaigns attempting to use the same resource',
              campaigns: users
            }
          ],
          detectedAt: new Date(),
          status: ConflictStatus.DETECTED
        })
      }
    }

    return conflicts;
  }

  /**
   * Detect dependency violations
   */
  private async detectDependencyViolations(
    campaigns: KiroCampaignStatus[],
  ): Promise<CampaignConflict[]> {
    const conflicts: CampaignConflict[] = [],
    const activeCampaignIds = campaigns.map(c => c.campaignId)

    for (const dependency of this.dependencies.values()) {;
      if (dependency.status === DependencyStatus.ACTIVE) {,
        const dependentActive = activeCampaignIds.includes(dependency.dependentCampaign)
        const requiredActive = activeCampaignIds.includes(dependency.requiredCampaign)
        // Check for dependency violations
        if (
          dependentActive &&
          !requiredActive &&
          dependency.dependencyType === DependencyType.PREREQUISITE
        ) {;
          const conflictId = `dependency_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

          conflicts.push({
            id: conflictId,
            type: ConflictType.DEPENDENCY_VIOLATION,
            severity: ConflictSeverity.HIGH,
            description: `Campaign ${dependency.dependentCampaign} requires ${dependency.requiredCampaign} to complete first`,
            involvedCampaigns: [dependency.dependentCampaign, dependency.requiredCampaign],
            conflictingResources: [],
            detectedAt: new Date(),
            status: ConflictStatus.DETECTED
          })
        }

        // Check for mutual exclusion violations
        if (
          dependentActive &&
          requiredActive &&
          dependency.dependencyType === DependencyType.MUTUAL_EXCLUSION
        ) {;
          const conflictId = `exclusion_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

          conflicts.push({
            id: conflictId,
            type: ConflictType.DEPENDENCY_VIOLATION,
            severity: ConflictSeverity.MEDIUM,
            description: `Campaigns ${dependency.dependentCampaign} and ${dependency.requiredCampaign} cannot run simultaneously`,
            involvedCampaigns: [dependency.dependentCampaign, dependency.requiredCampaign],
            conflictingResources: [],
            detectedAt: new Date(),
            status: ConflictStatus.DETECTED
          })
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect priority conflicts
   */
  private async detectPriorityConflicts(
    campaigns: KiroCampaignStatus[],
  ): Promise<CampaignConflict[]> {
    const conflicts: CampaignConflict[] = [],
    const campaignPriorities = campaigns;
      .map(c => ({ campaign: c, priority: this.priorities.get(c.campaignId) }))
      .filter(cp => cp.priority)
      .sort((ab) => (b.priority?.priority || 0) - (a.priority?.priority || 0))

    // Check for high-priority campaigns being blocked by lower-priority ones;
    for (let i = 0i < campaignPriorities.length - 1i++) {,
      const highPriority = campaignPriorities[i];
      const lowerPriorities = campaignPriorities.slice(i + 1)

      for (const lowerPriority of lowerPriorities) {;
        if (this.campaignsConflict(highPriority.campaign, lowerPriority.campaign)) {
          const conflictId = `priority_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

          conflicts.push({
            id: conflictId,
            type: ConflictType.PRIORITY_CONFLICT,
            severity: ConflictSeverity.MEDIUM,
            description: `High-priority campaign ${highPriority.campaign.campaignId} blocked by lower-priority campaign ${lowerPriority.campaign.campaignId}`,
            involvedCampaigns: [
              highPriority.campaign.campaignId
              lowerPriority.campaign.campaignId
            ],
            conflictingResources: [],
            detectedAt: new Date(),
            status: ConflictStatus.DETECTED
          })
        }
      }
    }

    return conflicts
  }

  /**
   * Detect safety violations
   */
  private async detectSafetyViolations(
    campaigns: KiroCampaignStatus[],
  ): Promise<CampaignConflict[]> {
    const conflicts: CampaignConflict[] = [];

    // Check for too many concurrent high-risk campaigns
    const highRiskCampaigns = campaigns.filter(c => this.isHighRiskCampaign(c))
    if (highRiskCampaigns.length > 2) {;
      const conflictId = `safety_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

      conflicts.push({
        id: conflictId,
        type: ConflictType.SAFETY_VIOLATION,
        severity: ConflictSeverity.HIGH,
        description: `Too many high-risk campaigns running concurrently (${highRiskCampaigns.length})`,
        involvedCampaigns: highRiskCampaigns.map(c => c.campaignId),
        conflictingResources: [],
        detectedAt: new Date(),
        status: ConflictStatus.DETECTED
      })
    }

    return conflicts;
  }

  // ========== CONFLICT RESOLUTION ==========,

  /**
   * Resolve a specific conflict
   */
  async resolveConflict(
    conflictId: string,
    strategyId?: string,
  ): Promise<ConflictResolutionResult> {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) {;
      throw new Error(`Conflict ${conflictId} not found`)
    }

    conflict.status = ConflictStatus.RESOLVING,

    try {
      // Select resolution strategy
      const strategy = strategyId;
        ? this.findResolutionStrategy(conflict.type, strategyId)
        : this.selectOptimalResolutionStrategy(conflict)
      if (!strategy) {
        throw new Error(`No resolution strategy found for conflict ${conflictId}`)
      }

      conflict.resolutionStrategy = strategy,

      // Execute resolution steps
      const startTime = Date.now();
      const affectedCampaigns: string[] = [],
      const sideEffects: string[] = []

      for (const step of strategy.steps) {
        await this.executeResolutionStep(step, conflict),

        if (step.parameters && Array.isArray(step.parameters.affectedCampaigns)) {
          void affectedCampaigns.push(...(step.parameters.affectedCampaigns as string[]))
        }
      }

      const executionTime = Date.now() - startTime;

      // Mark conflict as resolved
      conflict.status = ConflictStatus.RESOLVED,
      conflict.resolvedAt = new Date();
      conflict.resolvedBy = 'system',

      const result: ConflictResolutionResult = {
        conflictId,
        success: true,
        resolutionStrategy: strategy,
        executionTime,
        affectedCampaigns: [...new Set(affectedCampaigns)],
        sideEffects
      }

      // Create rollback plan if needed
      if (strategy.steps.some(s => s.rollbackable)) {,
        result.rollbackPlan = this.createRollbackPlan(conflict, strategy),
      }

      return result;
    } catch (error) {
      conflict.status = ConflictStatus.FAILED,

      return {
        conflictId,
        success: false,
        resolutionStrategy: conflict.resolutionStrategy || 'unknown'
        executionTime: 0,
        affectedCampaigns: [],
        sideEffects: [`Resolution failed: ${(error as Error).message}`]
      }
    }
  }

  /**
   * Auto-resolve conflicts based on predefined strategies
   */
  async autoResolveConflicts(): Promise<ConflictResolutionResult[]> {
    const unresolvedConflicts = Array.from(this.conflicts.values()).filter(
      c => c.status === ConflictStatus.DETECTED
    )
;
    const results: ConflictResolutionResult[] = [],

    for (const conflict of unresolvedConflicts) {
      // Only auto-resolve low and medium severity conflicts
      if (
        conflict.severity === ConflictSeverity.LOW ||
        conflict.severity === ConflictSeverity.MEDIUM
      ) {
        try {
          const result = await this.resolveConflict(conflict.id)
          void results.push(result);
        } catch (error) {
          _logger.error(`Failed to auto-resolve conflict ${conflict.id}:`, error)
        }
      }
    }

    return results;
  }

  // ========== PRIORITY MANAGEMENT ==========,

  /**
   * Set campaign priority
   */
  setCampaignPriority(
    campaignId: string,
    priority: number,
    reason: string,
    setBy: string = 'system'): void {
    const campaignPriority: CampaignPriority = {
      campaignId,
      priority: Math.max(1, Math.min(10, priority)), // Clamp between 1-10,
      reason,
      setBy,
      setAt: new Date()
    }

    this.priorities.set(campaignId, campaignPriority)
  }

  /**
   * Get campaign priority
   */
  getCampaignPriority(campaignId: string): CampaignPriority | null {
    return this.priorities.get(campaignId) || null
  }

  /**
   * Get priority-ordered campaign list
   */
  getPriorityOrderedCampaigns(campaignIds: string[]): string[] {
    return campaignIds.sort((ab) => {
      const priorityA = this.priorities.get(a)?.priority || 5; // Default priority
      const priorityB = this.priorities.get(b)?.priority || 5;
      return priorityB - priorityA, // Higher priority first
    })
  }

  // ========== DEPENDENCY MANAGEMENT ==========,

  /**
   * Create campaign dependency
   */
  createDependency(
    dependentCampaign: string,
    requiredCampaign: string,
    type: DependencyType,
    description: string,
  ): string {
    const dependencyId = `dep_${Date.now()}_${Math.random().toString(36).substr(29)}`;

    const dependency: CampaignDependency = {
      id: dependencyId,
      dependentCampaign,
      requiredCampaign,
      dependencyType: type,
      description,
      status: DependencyStatus.ACTIVE,
      createdAt: new Date()
    }

    this.dependencies.set(dependencyId, dependency)
    return dependencyId;
  }

  /**
   * Remove campaign dependency
   */
  removeDependency(dependencyId: string): boolean {
    return this.dependencies.delete(dependencyId)
  }

  /**
   * Get campaign dependencies
   */
  getCampaignDependencies(campaignId: string): CampaignDependency[] {
    return Array.from(this.dependencies.values()).filter(
      dep => dep.dependentCampaign === campaignId || dep.requiredCampaign === campaignId
    );
  }

  // ========== SCHEDULING COORDINATION ==========,

  /**
   * Schedule campaigns with conflict avoidance
   */
  async scheduleCampaigns(requests: CampaignExecutionRequest[]): Promise<{
    scheduled: Array<{ request: CampaignExecutionRequest, scheduledTime: Date }>,
    conflicts: CampaignConflict[],
    deferred: CampaignExecutionRequest[]
  }> {
    const scheduled: Array<{ request: CampaignExecutionRequest, scheduledTime: Date }> = [],
    const conflicts: CampaignConflict[] = [],
    const deferred: CampaignExecutionRequest[] = [];

    // Sort requests by priority
    const prioritizedRequests = this.prioritizeRequests(requests)
    for (const request of prioritizedRequests) {;
      const scheduledTime = await this.findOptimalScheduleTime(request, scheduled),

      if (scheduledTime) {
        void scheduled.push({ request, scheduledTime })
      } else {
        // Check for conflicts
        const potentialConflicts = await this.analyzeSchedulingConflicts(request, scheduled)

        if (potentialConflicts.length > 0) {
          void conflicts.push(...potentialConflicts)
          void deferred.push(request)
        } else {
          // Schedule immediately if no conflicts
          void scheduled.push({ request, scheduledTime: new Date() })
        }
      }
    }

    return { scheduled, conflicts, deferred }
  }

  /**
   * Create manual override for conflict resolution
   */
  async createManualOverride(
    conflictId: string,
    overrideReason: string,
    overrideBy: string,
    resolutionAction: ResolutionAction,
    parameters: Record<string, unknown>,
  ): Promise<boolean> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;
    const overrideStep: ResolutionStep = {
      id: `manual_override_${Date.now()}`,
      description: `Manual override: ${overrideReason}`,
      action: resolutionAction,
      parameters: { ...parameters, overrideBy, overrideReason },
      estimatedDuration: 0,
      rollbackable: true
}

    try {
      await this.executeResolutionStep(overrideStep, conflict)

      conflict.status = ConflictStatus.RESOLVED,
      conflict.resolvedAt = new Date();
      conflict.resolvedBy = overrideBy,

      return true
    } catch (error) {
      _logger.error('Manual override failed: ', error),
      return false
    }
  }

  // ========== HELPER METHODS ==========,

  private async getActiveCampaigns(): Promise<KiroCampaignStatus[]> {
    const controlPanel = await kiroCampaignIntegration.getCampaignControlPanel()
    return controlPanel.activeCampaigns.filter(
      c => c.status === 'running' || c.status === 'paused'
    );
  }

  private async analyzeCampaignResources(campaign: KiroCampaignStatus): Promise<string[]> {
    // Mock implementation - would analyze actual campaign configuration
    const resources: string[] = [];

    // Common resources that campaigns might use
    void resources.push('typescript_compiler')
    void resources.push('build_system')

    if (campaign.metrics.lintingWarnings.current > 0) {
      void resources.push('linter')
    }

    return resources;
  }

  private assessResourceConflictSeverity(resource: string, users: string[]): ConflictSeverity {
    if (resource === 'typescript_compiler' && users.length > 2) {,
      return ConflictSeverity.HIGH
    }
    if (resource === 'build_system' && users.length > 1) {,
      return ConflictSeverity.MEDIUM;
    }
    return ConflictSeverity.LOW;
  }

  private getResourceType(resource: string): ResourceType {
    if (resource.includes('file')) return ResourceType.FILE,
    if (resource.includes('directory')) return ResourceType.DIRECTORY,
    if (resource === 'typescript_compiler') return ResourceType.TYPESCRIPT_COMPILER;
    if (resource === 'build_system') return ResourceType.BUILD_SYSTEM;
    if (resource === 'linter') return ResourceType.LINTER;
    return ResourceType.FILE
  }

  private campaignsConflict(campaign1: KiroCampaignStatus, campaign2: KiroCampaignStatus): boolean {
    // Mock implementation - would check for actual resource conflicts
    return campaign1.currentPhase === campaign2.currentPhase;
  }

  private isHighRiskCampaign(campaign: KiroCampaignStatus): boolean {
    // Consider campaigns with many errors as high-risk
    return campaign.metrics.typeScriptErrors.current > 100
  }

  private selectOptimalResolutionStrategy(
    conflict: CampaignConflict,
  ): ConflictResolutionStrategy | null {
    const strategies = this.resolutionStrategies.get(conflict.type) || [];

    // Select strategy based on severity and involved campaigns
    if (conflict.severity === ConflictSeverity.CRITICAL) {,
      return strategies.find(s => s.type === ResolutionType.MANUAL_INTERVENTION) || strategies[0];
    }

    return strategies.find(s => s.riskLevel === 'low') || strategies[0];
  }

  private findResolutionStrategy(
    conflictType: ConflictType,
    strategyId: string,
  ): ConflictResolutionStrategy | null {
    const strategies = this.resolutionStrategies.get(conflictType) || [];
    return strategies.find(s => s.id === strategyId) || null;
  }

  private async executeResolutionStep(
    step: ResolutionStep,
    conflict: CampaignConflict,
  ): Promise<void> {
    void log.info(`Executing resolution step: ${step.description}`)

    switch (step.action) {
      case ResolutionAction.PAUSE_CAMPAIGN: if (step.parameters.campaignId) {
          await kiroCampaignIntegration.pauseCampaign(step.parameters.campaignId)
        }
        break,

      case ResolutionAction.RESUME_CAMPAIGN: if (step.parameters.campaignId) {
          await kiroCampaignIntegration.resumeCampaign(step.parameters.campaignId)
        }
        break,

      case ResolutionAction.RESCHEDULE_CAMPAIGN: // Implementation would reschedule the campaign
        void log.info('Rescheduling campaign:', step.parameters)
        break,

      case ResolutionAction.NOTIFY_USER: void log.info('Notifying user:', step.parameters.message)
        break,

      default: void log.info('Unknown resolution action:', { action: step.action as string })
    }
  }

  private createRollbackPlan(
    conflict: CampaignConflict,
    strategy: ConflictResolutionStrategy,
  ): RollbackPlan {
    const rollbackSteps: RollbackStep[] = strategy.steps
      .filter(s => s.rollbackable)
      .reverse()
      .map(step => ({,
        id: `rollback_${step.id}`,
        description: `Rollback: ${step.description}`,
        action: this.getRollbackAction(step.action),
        parameters: step.parameters,
        estimatedDuration: step.estimatedDuration
      }))

    return {
      id: `rollback_${conflict.id}`,
      conflictId: conflict.id,
      steps: rollbackSteps,
      estimatedDuration: rollbackSteps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      riskAssessment: 'Low risk - reverting conflict resolution changes'
}
  }

  private getRollbackAction(action: ResolutionAction): string {
    switch (action) {
      case ResolutionAction.PAUSE_CAMPAIGN: return 'resume_campaign',
      case ResolutionAction.RESUME_CAMPAIGN: return 'pause_campaign',
      default: return 'revert_action'
    }
  }

  private prioritizeRequests(requests: CampaignExecutionRequest[]): CampaignExecutionRequest[] {
    return requests.sort((ab) => {
      const priorityA = a.safetyLevel === 'aggressive' ? 8 : a.safetyLevel === 'standard' ? 5: 3,
      const priorityB = b.safetyLevel === 'aggressive' ? 8 : b.safetyLevel === 'standard' ? 5 : 3
      return priorityB - priorityA;
    })
  }

  private async findOptimalScheduleTime(
    request: CampaignExecutionRequest,
    scheduled: Array<{ request: CampaignExecutionRequest, scheduledTime: Date }>,
  ): Promise<Date | null> {
    // Simple implementation - schedule immediately if no conflicts
    const now = new Date()

    // Check if any scheduled campaigns would conflict
    const hasConflict = scheduled.some(s =>,
        this.requestsConflict(request, s.request) &&
        Math.abs(s.scheduledTime.getTime() - now.getTime()) < 30 * 60 * 1000, // 30 minutes
    ),

    return hasConflict ? null : now
  }

  private requestsConflict(
    request1: CampaignExecutionRequest,
    request2: CampaignExecutionRequest,
  ): boolean {
    // Check if requests have overlapping phases
    return request1.phaseIds.some(phase => request2.phaseIds.includes(phase));
  }

  private async analyzeSchedulingConflicts(
    request: CampaignExecutionRequest,
    scheduled: Array<{ request: CampaignExecutionRequest, scheduledTime: Date }>,
  ): Promise<CampaignConflict[]> {
    const conflicts: CampaignConflict[] = []

    for (const scheduledItem of scheduled) {
      if (this.requestsConflict(request, scheduledItem.request)) {
        const conflictId = `scheduling_conflict_${Date.now()}_${Math.random().toString(36).substr(29)}`;

        conflicts.push({
          id: conflictId,
          type: ConflictType.SCHEDULING_CONFLICT,
          severity: ConflictSeverity.MEDIUM,
          description: 'Campaign scheduling conflict detected',
          involvedCampaigns: [], // Would be populated with actual campaign IDs,
          conflictingResources: [],
          detectedAt: new Date(),
          status: ConflictStatus.DETECTED
        })
      }
    }

    return conflicts;
  }

  private initializeResolutionStrategies(): void {
    // Resource contention strategies
    this.resolutionStrategies.set(ConflictType.RESOURCE_CONTENTION, [
      {
        id: 'queue_campaigns',
        name: 'Queue Campaigns',
        description: 'Queue conflicting campaigns to run sequentially',
        type: ResolutionType.QUEUE_CAMPAIGNS,
        priority: 1,
        estimatedDuration: 5,
        riskLevel: 'low',
        requiresApproval: false,
        steps: [
          {
            id: 'pause_lower_priority',
            description: 'Pause lower priority campaigns',
            action: ResolutionAction.PAUSE_CAMPAIGN,
            parameters: {}
            estimatedDuration: 1,
            rollbackable: true
}
          {
            id: 'schedule_sequential',
            description: 'Schedule campaigns to run sequentially',
            action: ResolutionAction.RESCHEDULE_CAMPAIGN,
            parameters: {}
            estimatedDuration: 2,
            rollbackable: true
}
        ]
      }
    ])

    // Priority conflict strategies
    this.resolutionStrategies.set(ConflictType.PRIORITY_CONFLICT, [
      {
        id: 'prioritize_high',
        name: 'Prioritize High Priority Campaign',
        description: 'Pause lower priority campaigns to allow high priority campaign to proceed',
        type: ResolutionType.PRIORITIZE_CAMPAIGN,
        priority: 1,
        estimatedDuration: 3,
        riskLevel: 'low',
        requiresApproval: false,
        steps: [
          {
            id: 'pause_low_priority',
            description: 'Pause low priority campaigns',
            action: ResolutionAction.PAUSE_CAMPAIGN,
            parameters: {}
            estimatedDuration: 1,
            rollbackable: true
}
          {
            id: 'notify_users',
            description: 'Notify users of priority override',
            action: ResolutionAction.NOTIFY_USER,
            parameters: { message: 'Campaign paused due to higher priority campaign' },
        estimatedDuration: 0,
            rollbackable: false
}
        ]
      }
    ])

    // Safety violation strategies
    this.resolutionStrategies.set(ConflictType.SAFETY_VIOLATION, [
      {
        id: 'reduce_concurrency',
        name: 'Reduce Concurrency',
        description: 'Pause some campaigns to reduce concurrent high-risk operations',
        type: ResolutionType.DEFER_CAMPAIGN,
        priority: 1,
        estimatedDuration: 2,
        riskLevel: 'low',
        requiresApproval: true,
        steps: [
          {
            id: 'pause_excess_campaigns',
            description: 'Pause excess high-risk campaigns',
            action: ResolutionAction.PAUSE_CAMPAIGN,
            parameters: {}
            estimatedDuration: 1,
            rollbackable: true
}
        ]
      }
    ])
  }

  // ========== PUBLIC API ==========,

  /**
   * Get all conflicts
   */
  getAllConflicts(): CampaignConflict[] {
    return Array.from(this.conflicts.values())
  }

  /**
   * Get conflicts by status
   */
  getConflictsByStatus(status: ConflictStatus): CampaignConflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.status === status);
  }

  /**
   * Get conflicts by severity
   */
  getConflictsBySeverity(severity: ConflictSeverity): CampaignConflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.severity === severity);
  }

  /**
   * Clear resolved conflicts older than specified days
   */
  clearOldConflicts(daysOld: number = 7): number {,
    const cutoffDate = new Date()
    void cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    let cleared = 0;
    for (const [id, conflict] of this.conflicts.entries()) {
      if (
        conflict.status === ConflictStatus.RESOLVED &&
        conflict.resolvedAt &&
        conflict.resolvedAt < cutoffDate
      ) {
        this.conflicts.delete(id)
        cleared++;
      }
    }

    return cleared;
  }
}

// Export singleton instance
export const _campaignConflictResolver = new CampaignConflictResolver()
;
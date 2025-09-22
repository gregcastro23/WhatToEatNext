/**
 * Campaign Infrastructure Types
 * Perfect Codebase Campaign - Type Definitions
 */

export interface CampaignConfig {
  phases: CampaignPhase[],
  safetySettings: SafetySettings,
  progressTargets: ProgressTargets,
  toolConfiguration: ToolConfiguration
}

export interface CampaignPhase {
  id: string,
  name: string,
  description: string,
  tools: ScriptTool[],
  successCriteria: SuccessCriteria,
  safetyCheckpoints: SafetyCheckpoint[]
}

export interface ScriptTool {
  scriptPath: string,
  parameters: ScriptParameters,
  batchSize: number,
  safetyLevel: SafetyLevel
}

export interface ScriptParameters {
  maxFiles?: number,
  autoFix?: boolean,
  validateSafety?: boolean,
  resetMetrics?: boolean,
  dryRun?: boolean,
  [key: string]: unknown // Enterprise intelligence: allow additional configuration options
}

export interface SuccessCriteria {
  typeScriptErrors?: number,
  lintingWarnings?: number,
  buildTime?: number,
  enterpriseSystems?: number,
  customValidation?: () => Promise<boolean>
}

export interface SafetyCheckpoint {
  id: string,
  timestamp: Date,
  stashId: string,
  metrics: ProgressMetrics,
  description: string
}

export interface ProgressMetrics {
  typeScriptErrors: {
    current: number,
    target: number,
    reduction: number,
    percentage: number
  },
  lintingWarnings: {
    current: number,
    target: number,
    reduction: number,
    percentage: number
  },
  buildPerformance: {
    currentTime: number,
    targetTime: number,
    cacheHitRate: number,
    memoryUsage: number
  },
  enterpriseSystems: {
    current: number,
    target: number,
    transformedExports: number
  },
}

export interface PhaseResult {
  phaseId: string,
  success: boolean,
  metricsImprovement: MetricsImprovement,
  filesProcessed: number,
  errorsFixed: number,
  warningsFixed: number,
  executionTime: number,
  safetyEvents: SafetyEvent[]
}

export interface MetricsImprovement {
  typeScriptErrorsReduced: number,
  lintingWarningsReduced: number,
  buildTimeImproved: number,
  enterpriseSystemsAdded: number
}

export interface SafetyEvent {
  type: SafetyEventType,
  timestamp: Date,
  description: string,
  severity: SafetyEventSeverity,
  action: string
}

export interface SafetySettings {
  maxFilesPerBatch: number,
  buildValidationFrequency: number,
  testValidationFrequency: number,
  corruptionDetectionEnabled: boolean,
  automaticRollbackEnabled: boolean,
  stashRetentionDays: number
}

export interface ProgressTargets {
  typeScriptErrors: number,
  lintingWarnings: number,
  buildTime: number,
  enterpriseSystems: number
}

export interface ToolConfiguration {
  enhancedErrorFixer: string,
  explicitAnyFixer: string,
  unusedVariablesFixer: string,
  consoleStatementFixer: string
}

export interface CorruptionReport {
  detectedFiles: string[],
  corruptionPatterns: CorruptionPattern[],
  severity: CorruptionSeverity,
  recommendedAction: RecoveryAction
}

export interface CorruptionPattern {
  pattern: string,
  description: string,
  files: string[]
}

export interface ValidationResult {
  success: boolean,
  errors: string[],
  warnings: string[],
  metrics?: ProgressMetrics
}

export interface BuildValidation {
  success: boolean,
  buildTime: number,
  errors: string[],
  warnings: string[]
}

export interface TestValidation {
  success: boolean,
  testsRun: number,
  testsPassed: number,
  testsFailed: number,
  errors: string[]
}

export interface DryRunResult {
  wouldProcess: string[],
  estimatedChanges: number,
  potentialIssues: string[],
  safetyScore: number
}

export interface ExecutionResult {
  success: boolean,
  filesProcessed: string[],
  changesApplied: number,
  errors: string[],
  warnings: string[],
  executionTime: number
}

export interface BatchResult {
  batchId: string,
  filesProcessed: string[],
  success: boolean,
  errors: string[],
  warnings: string[],
  metricsChange: Partial<ProgressMetrics>
}

export interface GitStash {
  id: string,
  description: string,
  timestamp: Date,
  branch: string,
  ref?: string // Git stash reference (e.g., stash@{0})
}

export interface PhaseReport {
  phaseId: string,
  phaseName: string,
  startTime: Date,
  endTime?: Date
  status: PhaseStatus,
  metrics: ProgressMetrics,
  achievements: string[],
  issues: string[],
  recommendations: string[]
}

export interface ProgressReport {
  campaignId: string,
  overallProgress: number,
  phases: PhaseReport[],
  currentMetrics: ProgressMetrics,
  targetMetrics: ProgressMetrics,
  estimatedCompletion: Date
}

// Enums
export enum SafetyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  MAXIMUM = 'MAXIMUM',
}

export enum SafetyEventType {
  CHECKPOINT_CREATED = 'CHECKPOINT_CREATED',
  ROLLBACK_TRIGGERED = 'ROLLBACK_TRIGGERED',
  CORRUPTION_DETECTED = 'CORRUPTION_DETECTED',
  BUILD_FAILURE = 'BUILD_FAILURE',
  TEST_FAILURE = 'TEST_FAILURE',
  EMERGENCY_RECOVERY = 'EMERGENCY_RECOVERY',
}

export enum SafetyEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum CorruptionSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RecoveryAction {
  CONTINUE = 'CONTINUE',
  RETRY = 'RETRY',
  ROLLBACK = 'ROLLBACK',
  EMERGENCY_RESTORE = 'EMERGENCY_RESTORE',
}

export enum PhaseStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum ErrorCategory {
  // High-priority TypeScript errors
  TS2352_TYPE_CONVERSION = 'TS2352',
  TS2345_ARGUMENT_MISMATCH = 'TS2345',
  TS2698_SPREAD_TYPE = 'TS2698',
  TS2304_CANNOT_FIND_NAME = 'TS2304',
  TS2362_ARITHMETIC_OPERATION = 'TS2362',

  // Linting categories
  EXPLICIT_ANY_WARNING = 'explicit-any',
  UNUSED_VARIABLES = 'unused-vars',
  CONSOLE_STATEMENTS = 'no-console',

  // Safety categories
  CORRUPTION_DETECTED = 'corruption',
  BUILD_FAILURE = 'build-fail',
  TEST_FAILURE = 'test-fail',
}

export type CheckpointId = string,
export type StashId = string,
export type Milestone = string,

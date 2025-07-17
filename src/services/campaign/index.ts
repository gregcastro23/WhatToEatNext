/**
 * Campaign Infrastructure - Main Exports
 * Perfect Codebase Campaign - Complete Infrastructure System
 */

export { CampaignController } from './CampaignController';
export { SafetyProtocol } from './SafetyProtocol';
export { ProgressTracker } from './ProgressTracker';

// Re-export types for convenience
export type {
  CampaignConfig,
  CampaignPhase,
  PhaseResult,
  ProgressMetrics,
  ValidationResult,
  SafetySettings,
  CorruptionReport,
  GitStash,
  SafetyEvent,
  PhaseReport,
  ProgressReport,
  CheckpointId,
  StashId,
  Milestone
} from '../../types/campaign';

export {
  SafetyLevel,
  SafetyEventType,
  SafetyEventSeverity,
  CorruptionSeverity,
  RecoveryAction,
  PhaseStatus,
  ErrorCategory
} from '../../types/campaign';
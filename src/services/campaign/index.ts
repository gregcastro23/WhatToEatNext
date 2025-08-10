/**
 * Campaign Infrastructure - Main Exports
 * Perfect Codebase Campaign - Complete Infrastructure System
 */

export { CampaignController } from './CampaignController';
export { ProgressTracker } from './ProgressTracker';
export { SafetyProtocol } from './SafetyProtocol';

// Unintentional Any Elimination System
export * from './unintentional-any-elimination';

// Re-export types for convenience
export type {
    CampaignConfig,
    CampaignPhase, CheckpointId, CorruptionReport,
    GitStash, Milestone, PhaseReport, PhaseResult,
    ProgressMetrics, ProgressReport, SafetyEvent, SafetySettings, StashId, ValidationResult
} from '../../types/campaign';

export {
    CorruptionSeverity, ErrorCategory, PhaseStatus, RecoveryAction, SafetyEventSeverity, SafetyEventType, SafetyLevel
} from '../../types/campaign';

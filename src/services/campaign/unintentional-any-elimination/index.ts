/**
 * Unintentional Any Elimination System
 * Entry point for the unintentional any type elimination campaign
 */

// Core components
export { AnyTypeClassifier } from './AnyTypeClassifier';
export { AutoDocumentationGenerator } from './AutoDocumentationGenerator';
export { DocumentationQualityAssurance } from './DocumentationQualityAssurance';
export { DomainContextAnalyzer } from './DomainContextAnalyzer';
export { ProgressiveImprovementEngine } from './ProgressiveImprovementEngine';
export { SafeTypeReplacer } from './SafeTypeReplacer';
export { UnintentionalAnyEliminationCampaign } from './UnintentionalAnyEliminationCampaign';

// Analysis and monitoring components
export { AnalysisTools } from './AnalysisTools';
export { ProgressMonitoringSystem } from './ProgressMonitoringSystem';

// Campaign integration components
export {
    UnintentionalAnyCampaignController, UnintentionalAnyIntegrationHelper, createUnintentionalAnyCampaignController
} from './CampaignIntegration';

export {
    UnintentionalAnyCampaignScheduler, UnintentionalAnyProgressTracker
} from './MetricsIntegration';

// Export types
export * from './types';

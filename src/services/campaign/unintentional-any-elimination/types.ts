/**
 * Unintentional Any Elimination System Types
 * TypeScript interfaces for classification, replacement, and progress tracking
 */

import { ProgressMetrics, SafetyEvent, ValidationResult } from '../../../types/campaign';

// Core Classification Types
export interface AnyTypeClassification {
  isIntentional: boolean;
  confidence: number; // 0-1 scale
  reasoning: string;
  suggestedReplacement?: string;
  requiresDocumentation: boolean;
  category: AnyTypeCategory;
}

export enum AnyTypeCategory {
  ERROR_HANDLING = 'error_handling',
  EXTERNAL_API = 'external_api',
  TEST_MOCK = 'test_mock',
  DYNAMIC_CONFIG = 'dynamic_config',
  LEGACY_COMPATIBILITY = 'legacy_compatibility',
  ARRAY_TYPE = 'array_type',
  RECORD_TYPE = 'record_type',
  FUNCTION_PARAM = 'function_param',
  RETURN_TYPE = 'return_type',
  TYPE_ASSERTION = 'type_assertion'
}

export interface ClassificationContext {
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  surroundingLines: string[];
  hasExistingComment: boolean;
  existingComment?: string;
  isInTestFile: boolean;
  domainContext: DomainContext;
}

// Type Replacement Types
export interface TypeReplacement {
  original: string;
  replacement: string;
  filePath: string;
  lineNumber: number;
  confidence: number;
  validationRequired: boolean;
}

export interface ReplacementResult {
  success: boolean;
  appliedReplacements: TypeReplacement[];
  failedReplacements: TypeReplacement[];
  compilationErrors: string[];
  rollbackPerformed: boolean;
  backupPath?: string;
}

export interface ReplacementStrategy {
  pattern: RegExp;
  replacement: (match: string, context: ClassificationContext) => string;
  validator: (context: ClassificationContext) => boolean;
  priority: number;
}

// Domain Context Types
export interface DomainContext {
  domain: CodeDomain;
  subDomain?: string;
  intentionalityHints: IntentionalityHint[];
  suggestedTypes: string[];
  preservationReasons: string[];
}

export enum CodeDomain {
  ASTROLOGICAL = 'astrological',
  RECIPE = 'recipe',
  CAMPAIGN = 'campaign',
  INTELLIGENCE = 'intelligence',
  SERVICE = 'service',
  COMPONENT = 'component',
  UTILITY = 'utility',
  TEST = 'test'
}

export interface IntentionalityHint {
  reason: string;
  confidence: number;
  suggestedAction: 'preserve' | 'replace' | 'document' | 'review';
}

// Data Models
export interface AnyTypeRecord {
  id: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  classification: AnyTypeClassification;
  domainContext: DomainContext;
  lastAnalyzed: Date;
  replacementHistory: ReplacementAttempt[];
  currentStatus: 'pending' | 'replaced' | 'documented' | 'preserved';
}

export interface ReplacementAttempt {
  timestamp: Date;
  originalType: string;
  attemptedReplacement: string;
  success: boolean;
  errorMessage?: string;
  rollbackReason?: string;
}

// Progress Tracking Types
export interface UnintentionalAnyProgress extends ProgressMetrics {
  totalAnyTypes: number;
  classifiedIntentional: number;
  classifiedUnintentional: number;
  successfulReplacements: number;
  documentedIntentional: number;
  remainingUnintentional: number;
  reductionPercentage: number;
  targetReductionPercentage: number;
  batchesCompleted: number;
  averageSuccessRate: number;
}

export interface BatchMetrics {
  batchNumber: number;
  filesProcessed: number;
  anyTypesAnalyzed: number;
  replacementsAttempted: number;
  replacementsSuccessful: number;
  compilationErrors: number;
  rollbacksPerformed: number;
  executionTime: number;
  safetyScore: number;
}

// Configuration Types
export interface UnintentionalAnyConfig {
  maxFilesPerBatch: number;
  targetReductionPercentage: number;
  confidenceThreshold: number;
  enableDomainAnalysis: boolean;
  enableDocumentation: boolean;
  safetyLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  validationFrequency: number;
}

export interface ClassificationRules {
  errorHandlingPatterns: RegExp[];
  externalApiPatterns: RegExp[];
  testMockPatterns: RegExp[];
  dynamicConfigPatterns: RegExp[];
  legacyCompatibilityPatterns: RegExp[];
}

// Campaign Integration Types
export interface UnintentionalAnyCampaignPhase {
  id: string;
  name: string;
  description: string;
  classifier: AnyTypeClassifier;
  replacer: SafeTypeReplacer;
  analyzer: DomainContextAnalyzer;
  config: UnintentionalAnyConfig;
}

export interface UnintentionalAnyCampaignResult {
  totalAnyTypesAnalyzed: number;
  intentionalTypesIdentified: number;
  unintentionalTypesReplaced: number;
  documentationAdded: number;
  reductionAchieved: number;
  safetyEvents: SafetyEvent[];
  validationResults: ValidationResult[];
  success: boolean;
  filesProcessed: number;
  errorsFixed: number;
  warningsFixed: number;
}

export interface UnintentionalAnyMetrics {
  totalAnyTypes: number;
  intentionalAnyTypes: number;
  unintentionalAnyTypes: number;
  documentedAnyTypes: number;
  documentationCoverage: number;
  reductionFromBaseline: number;
  targetReduction: number;
}

export interface UnintentionalAnyProgressMetrics extends ProgressMetrics {
  unintentionalAnyMetrics: UnintentionalAnyMetrics;
}

// Error Handling Types
export class ClassificationError extends Error {
  constructor(
    message: string,
    public readonly context: ClassificationContext,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ClassificationError';
  }
}

export class SafetyProtocolError extends Error {
  constructor(
    message: string,
    public readonly rollbackPath: string,
    public readonly affectedFiles: string[]
  ) {
    super(message);
    this.name = 'SafetyProtocolError';
  }
}

// Forward declarations for classes (to be implemented in separate files)
export interface AnyTypeClassifier {
  classify(context: ClassificationContext): Promise<AnyTypeClassification>;
  classifyBatch(contexts: ClassificationContext[]): Promise<AnyTypeClassification[]>;
}

export interface SafeTypeReplacer {
  applyReplacement(replacement: TypeReplacement): Promise<ReplacementResult>;
  processBatch(replacements: TypeReplacement[]): Promise<ReplacementResult>;
}

export interface DomainContextAnalyzer {
  analyzeDomain(context: ClassificationContext): Promise<DomainContext>;
  getDomainSpecificSuggestions(domain: CodeDomain, context: ClassificationContext): string[];
}

export interface ProgressiveImprovementEngine {
  executeBatch(config: UnintentionalAnyConfig): Promise<BatchMetrics>;
  executeFullCampaign(config: UnintentionalAnyConfig): Promise<UnintentionalAnyCampaignResult>;
}

// Documentation System Types
export interface DocumentationTemplate {
  category: AnyTypeCategory;
  domain: CodeDomain;
  template: string;
  eslintDisableComment?: string;
  explanation: string;
}

export interface DocumentationResult {
  filePath: string;
  lineNumber: number;
  originalCode: string;
  documentedCode: string;
  commentAdded: string;
  eslintDisableAdded?: string;
  success: boolean;
  error?: string;
}

export interface DocumentationValidation {
  hasComment: boolean;
  commentQuality: 'poor' | 'fair' | 'good' | 'excellent';
  hasEslintDisable: boolean;
  eslintDisableHasExplanation: boolean;
  isComplete: boolean;
  suggestions: string[];
}

export interface DocumentationReport {
  totalIntentionalAnyTypes: number;
  documentedTypes: number;
  undocumentedTypes: number;
  documentationCoverage: number; // percentage
  qualityBreakdown: Record<string, number>;
  undocumentedFiles: string[];
  recommendations: string[];
}

export interface AutoDocumentationGenerator {
  generateDocumentation(
    classification: AnyTypeClassification,
    context: ClassificationContext
  ): Promise<DocumentationResult>;

  validateDocumentation(
    context: ClassificationContext
  ): Promise<DocumentationValidation>;

  generateReport(): Promise<DocumentationReport>;
}

// Analysis and Reporting Types

export interface DomainDistribution {
  totalAnyTypes: number;
  byDomain: Array<{
    domain: CodeDomain;
    count: number;
    percentage: number;
  }>;
  byCategory: Array<{
    category: AnyTypeCategory;
    count: number;
    percentage: number;
  }>;
  intentionalVsUnintentional: {
    intentional: {
      count: number;
      percentage: number;
    };
    unintentional: {
      count: number;
      percentage: number;
    };
  };
  analysisDate: Date;
}

export interface ClassificationAccuracyReport {
  overallAccuracy: number;
  averageConfidence: number;
  sampleSize: number;
  categoryAccuracy: Array<{
    category: AnyTypeCategory;
    accuracy: number;
    sampleCount: number;
  }>;
  confidenceDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  reportDate: Date;
}

export interface SuccessRateAnalysis {
  currentSuccessRate: number;
  targetSuccessRate: number;
  improvementNeeded: number;
  categorySuccessRates: Array<{
    category: AnyTypeCategory;
    successRate: number;
    sampleSize: number;
  }>;
  trendingData: TrendingData;
  projectedCompletion: Date;
  recommendations: string[];
  analysisDate: Date;
}

export interface TrendingData {
  date: Date;
  successRate: number;
  totalAnyTypes: number;
  unintentionalCount: number;
  classificationAccuracy: number;
  trends?: {
    successRateChange: number;
    totalAnyTypesChange: number;
    unintentionalCountChange: number;
    classificationAccuracyChange: number;
  };
}

export interface ManualReviewRecommendation {
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  classification: AnyTypeClassification;
  reviewReason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedActions: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  relatedOccurrences: Array<{
    filePath: string;
    lineNumber: number;
  }>;
}

export interface AnalysisReport {
  id: string;
  timestamp: Date;
  domainDistribution: DomainDistribution;
  accuracyReport: ClassificationAccuracyReport;
  successRateAnalysis: SuccessRateAnalysis;
  manualReviewRecommendations: ManualReviewRecommendation[];
  summary: {
    totalAnyTypes: number;
    unintentionalCount: number;
    classificationAccuracy: number;
    currentSuccessRate: number;
    manualReviewCases: number;
    topDomain: CodeDomain;
    topCategory: AnyTypeCategory;
  };
}

export interface AnalysisMetrics {
  overallSuccessRate: number;
  totalProcessed: number;
  successfulReplacements: number;
  failedReplacements: number;
  averageConfidence: number;
}

// Progress Monitoring and Alerting Types

export interface DashboardData {
  lastUpdate: Date;
  analysisReport: AnalysisReport;
  progressMetrics: UnintentionalAnyProgress;
  buildStability: BuildStabilityRecord;
  alertSummary: AlertSummary;
  trendingData: TrendingData[];
  systemHealth: SystemHealth;
}

export interface AlertThresholds {
  successRateThreshold: number;
  buildFailureThreshold: number;
  classificationAccuracyThreshold: number;
  safetyEventThreshold: number;
  progressStallThreshold: number; // hours
}

export interface Alert {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  data?: unknown;
}

export type AlertType =
  | 'low_success_rate'
  | 'build_failure'
  | 'consecutive_build_failures'
  | 'low_classification_accuracy'
  | 'progress_stall'
  | 'frequent_safety_events'
  | 'safety_protocol_activation'
  | 'system_error';

export interface SafetyEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
  timestamp: Date;
  affectedFiles?: string[];
}

export interface BuildStabilityRecord {
  timestamp: Date;
  isStable: boolean;
  buildTime: number;
  errorCount: number;
  errorMessage: string | null;
}

export interface AlertSummary {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  recentAlerts: Alert[];
}

export interface SystemHealth {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: Date;
  issues: string[];
}

// Conservative Pilot Configuration Types
export interface ConservativePilotConfig {
  maxFilesPerBatch: number;
  minFilesPerBatch: number;
  targetSuccessRate: number;
  maxBatches: number;
  realTimeValidation: boolean;
  rollbackOnFailure: boolean;
  safetyThreshold: number;
  focusCategories: AnyTypeCategory[];
  buildValidationFrequency: number;
}

export interface PilotAnalysisConfig {
  maxFilesToAnalyze: number;
  sampleSizeForAccuracy: number;
  confidenceThreshold: number;
  enableTuning: boolean;
  generateDetailedReports: boolean;
  outputDirectory: string;
}

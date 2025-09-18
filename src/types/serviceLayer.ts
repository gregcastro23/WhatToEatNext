/**
 * Service Layer Type Definitions
 *
 * Comprehensive interfaces for service layer operations to replace
 * Record<string, any> patterns with structured, domain-specific types
 */

// Campaign and workflow service types
export interface CampaignConfig {
  campaignId: string,
  campaignType:
    | 'typescript-fixes'
    | 'linting-improvements'
    | 'explicit-any-reduction'
    | 'build-optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetFiles?: string[];
  maxFiles?: number;
  autoFix?: boolean;
  safetyLevel: 'conservative' | 'standard' | 'aggressive';
  timeoutMs?: number;
  enableBackup?: boolean;
  validationRequired?: boolean;
}

export interface CampaignMetrics {
  startTime: Date;
  endTime?: Date;
  filesProcessed: number,
  filesModified: number,
  errorsFixed: number,
  errorsIntroduced: number,
  buildStatus: 'unknown' | 'passing' | 'failing',
  testStatus: 'unknown' | 'passing' | 'failing',
  lintStatus: 'unknown' | 'passing' | 'failing',
  performanceMetrics: {
    averageProcessingTime: number,
    memoryUsage: number,
    cacheHitRate: number
  };
}

export interface CampaignResult {
  success: boolean,
  campaignId: string,
  metrics: CampaignMetrics,
  errors: CampaignError[],
  warnings: string[],
  recommendations: string[],
  artifacts: {
    backupPaths: string[],
    logFiles: string[],
    reportFiles: string[]
  };
}

export interface CampaignError {
  type: 'compilation' | 'runtime' | 'validation' | 'system',
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  file?: string;
  line?: number;
  column?: number;
  context?: string;
  timestamp: Date
}

// Quality gates and validation service types
export interface QualityGateConfig {
  gateId: string,
  name: string,
  description: string,
  enabled: boolean,
  threshold: {
    errorCount?: number;
    warningCount?: number;
    coveragePercentage?: number;
    performanceScore?: number;
    buildTime?: number;
  };
  blocksDeployment: boolean,
  notificationChannels: string[],
}

export interface QualityGateResult {
  gateId: string,
  passed: boolean,
  score: number,
  metrics: {
    errorCount: number,
    warningCount: number,
    coveragePercentage: number,
    performanceScore: number,
    buildTimeMs: number
  };
  violations: QualityViolation[],
  timestamp: Date,
  executionTime: number
}

export interface QualityViolation {
  type: 'error' | 'warning' | 'coverage' | 'performance' | 'security',
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  file?: string;
  rule?: string;
  suggestion?: string;
}

// Alerting and notification service types
export interface AlertConfig {
  alertId: string,
  name: string,
  description: string,
  enabled: boolean,
  channels: ('email' | 'slack' | 'webhook' | 'console')[],
  conditions: AlertCondition[],
  throttleMs?: number;
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface AlertCondition {
  metric: string,
  operator: '>' | '<' | '=' | '!=' | '>=' | '<=',
  threshold: number,
  window?: number; // Time window in seconds
}

export interface Alert {
  alertId: string,
  timestamp: Date,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  details: {
    metric: string,
    actualValue: number,
    thresholdValue: number,
    file?: string;
    context?: string;
  };
  resolved: boolean;
  resolvedAt?: Date;
}

// Recipe and data service types
export interface RecipeServiceConfig {
  cacheEnabled: boolean,
  cacheTtlSeconds: number,
  apiTimeout: number,
  enableValidation: boolean,
  dataSource: 'local' | 'spoonacular' | 'hybrid',
  fallbackEnabled: boolean,
}

export interface RecipeQueryParams {
  cuisine?: string;
  dietaryRestrictions?: string[];
  allergens?: string[];
  maxIngredients?: number;
  maxCookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  astrologicalContext?: {
    zodiacSign?: string;
    lunarPhase?: string;
    elementalPreferences?: string[];
  };
}

export interface RecipeServiceResult<T = unknown> {;
  success: boolean;
  data?: T;
  error?: {
    type: 'validation' | 'network' | 'parsing' | 'system',
    message: string,
    code?: string;
  };
  metadata: {
    source: string,
    cached: boolean,
    executionTime: number,
    timestamp: Date,
  };
}

// Enterprise intelligence service types
export interface EnterpriseServiceConfig {
  serviceId: string,
  enabled: boolean,
  analysisDepth: 'shallow' | 'standard' | 'deep',
  cacheResults: boolean,
  timeoutMs: number,
  retryAttempts: number,
  logLevel: 'debug' | 'info' | 'warn' | 'error',
  enablePredictiveAnalysis: boolean,
  enableMLInference: boolean
}

export interface EnterpriseAnalysisContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date,
  parameters: {
    analysisType: string,
    dataSource: string,
    filters: EnterpriseFilter[]
  };
  metadata: Record<string, string | number | boolean>;
}

export interface EnterpriseFilter {
  field: string,
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in',
  value: unknown
}

export interface EnterpriseServiceResult<T = unknown> {;
  success: boolean;
  data?: T;
  confidence: number,
  processingTime: number,
  cacheHit: boolean,
  warnings: string[],
  recommendations: string[],
  metadata: {
    version: string;
    model?: string;
    timestamp: Date
  };
}

// Linting service types
export interface LintingConfig {
  rules: LintingRule[],
  ignorePatterns: string[],
  fixableRules: string[],
  maxWarnings: number,
  enableAutoFix: boolean,
  reportFormat: 'json' | 'table' | 'compact' | 'stylish',
  outputPath?: string;
}

export interface LintingRule {
  ruleId: string,
  severity: 'off' | 'warn' | 'error',
  options?: unknown[];
  files?: string[];
  excludeFiles?: string[];
}

export interface LintingResult {
  success: boolean,
  filePath: string,
  errorCount: number,
  warningCount: number,
  fixableErrorCount: number,
  fixableWarningCount: number,
  messages: LintingMessage[],
  source?: string;
  output?: string;
}

export interface LintingMessage {
  ruleId: string,
  severity: 'error' | 'warning' | 'info',
  message: string,
  line: number,
  column: number,
  endLine?: number;
  endColumn?: number;
  fix?: {
    range: [number, number];
    text: string
  };
  suggestions?: LintingSuggestion[];
}

export interface LintingSuggestion {
  desc: string;
  messageId?: string;
  fix: {
    range: [number, number];
    text: string
  };
}

// Generic service response wrapper
export interface ServiceResponse<T = unknown> {;
  success: boolean;
  data?: T;
  error?: ServiceError;
  timestamp: Date;
  requestId?: string;
  executionTime?: number;
}

export interface ServiceError {
  code: string,
  message: string,
  type: 'validation' | 'authorization' | 'not_found' | 'rate_limit' | 'internal' | 'external',
  details?: Record<string, unknown>;
  retryable: boolean
}

// Configuration management types
export interface ServiceConfig {
  serviceName: string,
  version: string,
  environment: 'development' | 'staging' | 'production',
  features: ServiceFeature[],
  dependencies: ServiceDependency[],
  monitoring: MonitoringConfig,
  security: SecurityConfig
}

export interface ServiceFeature {
  name: string,
  enabled: boolean,
  configuration: Record<string, unknown>;
  dependencies?: string[];
}

export interface ServiceDependency {
  name: string,
  type: 'internal' | 'external',
  required: boolean,
  healthCheckUrl?: string;
  timeout?: number;
}

export interface MonitoringConfig {
  metricsEnabled: boolean,
  tracingEnabled: boolean,
  loggingLevel: 'debug' | 'info' | 'warn' | 'error',
  healthCheckInterval: number,
  alertingThresholds: Record<string, number>;
}

export interface SecurityConfig {
  authenticationRequired: boolean,
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute?: number;
  };
  validation: {
    inputSanitization: boolean,
    outputSanitization: boolean,
  };
  encryption: {
    enabled: boolean;
    algorithm?: string;
  };
}

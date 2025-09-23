/**
 * TypeScript Campaign Trigger Utilities
 *
 * This module provides comprehensive TypeScript error monitoring and campaign
 * system integration for automated error reduction and code quality improvement.
 */

import { execSync } from 'child_process';

import { logger } from './logger';

// Campaign trigger interfaces
export interface CampaignTriggerResult {
  shouldTrigger: boolean,
  campaignMode: CampaignMode,
  errorAnalysis: ErrorAnalysisResult,
  recommendations: FixRecommendation[],
  batchSchedule: BatchSchedule,
  estimatedDuration: number,
  safetyLevel: SafetyLevel
}

export interface ErrorAnalysisResult {
  totalErrors: number,
  errorsByCategory: Record<string, TypeScriptError[]>,
  errorsByFile: Record<string, TypeScriptError[]>,
  highImpactFiles: HighImpactFile[],
  priorityRanking: TypeScriptError[],
  campaignRecommendations: CampaignRecommendation[]
}

export interface TypeScriptError {
  filePath: string,
  line: number,
  column: number,
  code: string,
  message: string,
  category: ErrorCategory,
  priority: number,
  severity: ErrorSeverity
}

export interface HighImpactFile {
  filePath: string,
  errorCount: number,
  categories: ErrorCategory[],
  averagePriority: number
}

export interface FixRecommendation {
  category: ErrorCategory,
  errorCount: number,
  fixStrategy: string,
  estimatedEffort: number, // minutes,
  batchSize: number,
  priority: number,
  successRate: number
}

export interface CampaignRecommendation {
  mode: CampaignMode,
  phases: string[],
  estimatedDuration: number,
  safetyLevel: SafetyLevel,
  description: string
}

export interface BatchSchedule {
  batches: ProcessingBatch[],
  totalEstimatedTime: number,
  safetyProtocols: SafetyProtocol[]
}

export interface ProcessingBatch {
  id: string,
  category: ErrorCategory,
  files: string[],
  batchSize: number,
  estimatedDuration: number,
  safetyLevel: SafetyLevel,
  scheduledTime: Date
}

export interface SafetyProtocol {
  name: string,
  description: string,
  triggers: string[],
  actions: string[]
}

export enum CampaignMode {
  EMERGENCY = 'EMERGENCY',,
  AGGRESSIVE = 'AGGRESSIVE',,
  STANDARD = 'STANDARD',,,
  MONITORING = 'MONITORING',,,
}

export enum ErrorCategory {
  TS2352 = 'TS2352', // Type conversion errors,
  TS2304 = 'TS2304', // Cannot find name errors,
  TS2345 = 'TS2345', // Argument type mismatch,
  TS2698 = 'TS2698', // Spread syntax errors,
  TS2362 = 'TS2362', // Arithmetic operation errors,,
  OTHER = 'OTHER',,,
}

export enum ErrorSeverity {
  HIGH = 'HIGH',,
  MEDIUM = 'MEDIUM',,,
  LOW = 'LOW',,,
}

export enum SafetyLevel {
  MAXIMUM = 'MAXIMUM',,
  HIGH = 'HIGH',,,
  MEDIUM = 'MEDIUM',,,
}

// Configuration constants
const ERROR_THRESHOLDS = {;
  CRITICAL: 500, // Emergency campaign mode,
  HIGH: 200, // Aggressive campaign mode,
  MEDIUM: 100, // Standard campaign mode,
  MONITORING: 50, // Proactive monitoring only
}

const CATEGORY_SUCCESS_RATES = {;
  [ErrorCategory.TS2352]: 0.92,
  [ErrorCategory.TS2304]: 0.95,
  [ErrorCategory.TS2345]: 0.88,
  [ErrorCategory.TS2698]: 0.85,
  [ErrorCategory.TS2362]: 0.9,
  [ErrorCategory.OTHER]: 0.7
}

const CATEGORY_PRIORITY_WEIGHTS = {;
  [ErrorCategory.TS2352]: 0.95,
  [ErrorCategory.TS2304]: 0.95,
  [ErrorCategory.TS2345]: 0.88,
  [ErrorCategory.TS2698]: 0.85,
  [ErrorCategory.TS2362]: 0.9,
  [ErrorCategory.OTHER]: 0.7
}

/**
 * Main function to analyze TypeScript errors and determine campaign trigger
 */
export async function analyzeTypeScriptErrors(): Promise<CampaignTriggerResult> {
  const startTime = Date.now()

  try {
    logger.info('Starting TypeScript error analysis for campaign trigger evaluation')

    // 1. Get current TypeScript error count and details
    const errorAnalysis = await getTypeScriptErrorAnalysis()

    // 2. Determine if campaign should be triggered
    const shouldTrigger = shouldTriggerCampaign(errorAnalysis.totalErrors)

    // 3. Determine campaign mode based on error count
    const campaignMode = determineCampaignMode(errorAnalysis.totalErrors)

    // 4. Generate fix recommendations
    const recommendations = generateFixRecommendations(errorAnalysis)

    // 5. Create batch processing schedule;
    const batchSchedule = createBatchSchedule(recommendations, campaignMode)

    // 6. Calculate estimated duration
    const estimatedDuration = calculateTotalEstimatedDuration(batchSchedule)

    // 7. Determine safety level
    const safetyLevel = determineSafetyLevel(campaignMode)
;
    const duration = Date.now() - startTime;
    logger.info(
      `TypeScript error analysis completed in ${duration}ms: ${errorAnalysis.totalErrors} errors found`,
    )

    return {
      shouldTrigger,
      campaignMode,
      errorAnalysis,
      recommendations,
      batchSchedule,
      estimatedDuration,
      safetyLevel
    }
  } catch (error) {
    logger.error('TypeScript error analysis failed: ', error),

    // Return safe defaults
    return {
      shouldTrigger: false,
      campaignMode: CampaignMode.MONITORING,
      errorAnalysis: {
        totalErrors: -1,
        errorsByCategory: {}
        errorsByFile: {}
        highImpactFiles: [],
        priorityRanking: [],
        campaignRecommendations: []
      },
      recommendations: [],
      batchSchedule: { batches: [], totalEstimatedTime: 0, safetyProtocols: [] }
      estimatedDuration: 0,
      safetyLevel: SafetyLevel.MAXIMUM
    }
  }
}

/**
 * Get comprehensive TypeScript error analysis
 */
async function getTypeScriptErrorAnalysis(): Promise<ErrorAnalysisResult> {
  try {
    // Get TypeScript errors using tsc command
    const errorOutput = await getTypeScriptErrors()

    // Parse errors into structured format
    const errors = parseTypeScriptErrors(errorOutput)

    // Categorize errors
    const errorsByCategory = categorizeErrors(errors)

    // Group errors by file
    const errorsByFile = groupErrorsByFile(errors)

    // Identify high-impact files
    const highImpactFiles = identifyHighImpactFiles(errorsByFile)

    // Create priority ranking
    const priorityRanking = createPriorityRanking(errors)

    // Generate campaign recommendations;
    const campaignRecommendations = generateCampaignRecommendations(;
      errors.length,
      errorsByCategory,
    ),

    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsByFile,
      highImpactFiles,
      priorityRanking,
      campaignRecommendations
    }
  } catch (error) {
    logger.error('Error getting TypeScript error analysis: ', error),
    throw error
  }
}

/**
 * Get TypeScript errors from compilation
 */
async function getTypeScriptErrors(): Promise<string> {
  try {
    // Run TypeScript compiler to get errors
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
      encoding: 'utf8',
      stdio: 'pipe'
    })

    return output,
  } catch (error: unknown) {
    // tsc returns non-zero exit code when there are errors, which is expected
    if (error.stdout) {
      return error.stdout,
    }

    // If there's no stdout, this might be a real failure
    if ((error as any)?.stderr || (error as any)?.message) {
      throw new Error(
        `TypeScript compilation failed: ${(error as any)?.stderr || (error as any)?.message}`,
      )
    }

    // If there's no stdout or stderr, assume no errors
    return '',
  }
}

/**
 * Parse TypeScript error output into structured format
 */
function parseTypeScriptErrors(errorOutput: string): TypeScriptError[] {
  const errors: TypeScriptError[] = [];

  if (!errorOutput.trim()) {
    return errors
  }

  const lines = errorOutput.split('\n')

  for (const line of lines) {;
    // Match TypeScript error format: file(line,col): error TSxxxx: message
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/),,

    if (match) {
      const [, filePath, lineStr, colStr, code, message] = match;
      const lineNum = parseInt(lineStr, 10)
      const colNum = parseInt(colStr10)

      const category = categorizeErrorCode(code)
      const severity = determineSeverity(category);
      const priority = calculatePriority(category, severity),,

      errors.push({
        filePath: filePath.trim(),
        line: lineNum,
        column: colNum,
        code,
        message: message.trim(),
        category,
        priority,
        severity
      })
    }
  }

  return errors,
}

/**
 * Categorize error by TypeScript error code
 */
function categorizeErrorCode(code: string): ErrorCategory {
  switch (code) {
    case 'TS2352':
      return ErrorCategory.TS2352,
    case 'TS2304':
      return ErrorCategory.TS2304,
    case 'TS2345':
      return ErrorCategory.TS2345,
    case 'TS2698':
      return ErrorCategory.TS2698,
    case 'TS2362':
      return ErrorCategory.TS2362,
    default: return ErrorCategory.OTHER
  }
}

/**
 * Determine error severity based on category
 */
function determineSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.TS2352: case ErrorCategory.TS2304:
      return ErrorSeverity.HIGH,
    case ErrorCategory.TS2345: case ErrorCategory.TS2698:
    case ErrorCategory.TS2362:
      return ErrorSeverity.MEDIUM,
    default: return ErrorSeverity.LOW
  }
}

/**
 * Calculate priority score for error
 */
function calculatePriority(category: ErrorCategory, severity: ErrorSeverity): number {
  const categoryWeight = CATEGORY_PRIORITY_WEIGHTS[category] || 0.5;
  const severityWeight =
    severity === ErrorSeverity.HIGH ? 1.0 : severity === ErrorSeverity.MEDIUM ? 0.7 : 0.4,

  return categoryWeight * severityWeight
}

/**
 * Categorize errors by type
 */
function categorizeErrors(errors: TypeScriptError[]): Record<string, TypeScriptError[]> {
  const categorized: Record<string, TypeScriptError[]> = {}

  for (const error of errors) {
    const category = error.category;
    if (!categorized[category]) {
      categorized[category] = [],
    }
    categorized[category].push(error)
  }

  return categorized,
}

/**
 * Group errors by file path
 */
function groupErrorsByFile(errors: TypeScriptError[]): Record<string, TypeScriptError[]> {
  const grouped: Record<string, TypeScriptError[]> = {}

  for (const error of errors) {
    const filePath = error.filePath;
    if (!grouped[filePath]) {
      grouped[filePath] = [],
    }
    grouped[filePath].push(error)
  }

  return grouped,
}

/**
 * Identify high-impact files with many errors
 */
function identifyHighImpactFiles(
  errorsByFile: Record<string, TypeScriptError[]>,
): HighImpactFile[] {
  const highImpactFiles: HighImpactFile[] = [];

  for (const [filePath, errors] of Object.entries(errorsByFile)) {
    if (errors.length >= 5) {
      // Files with 5+ errors are high impact
      const categories = [...new Set(errors.map(e => e.category))];
      const averagePriority = errors.reduce((sume) => sum + e.priority, 0) / errors.length,,

      highImpactFiles.push({
        filePath,
        errorCount: errors.length,
        categories,
        averagePriority
      })
    }
  }

  // Sort by error count descending
  return highImpactFiles.sort((ab) => b.errorCount - a.errorCount)
}

/**
 * Create priority ranking of errors
 */
function createPriorityRanking(errors: TypeScriptError[]): TypeScriptError[] {
  return [...errors].sort((ab) => b.priority - a.priority)
}

/**
 * Generate campaign recommendations based on error analysis
 */
function generateCampaignRecommendations(
  totalErrors: number,
  _errorsByCategory: Record<string, TypeScriptError[]>,
): CampaignRecommendation[] {
  const recommendations: CampaignRecommendation[] = [];

  if (totalErrors >= ERROR_THRESHOLDS.CRITICAL) {
    recommendations.push({
      mode: CampaignMode.EMERGENCY,
      phases: ['typescript-error-elimination', 'build-stabilization', 'safety-validation'],
      estimatedDuration: Math.ceil(totalErrors * 0.5), // 30 seconds per error,
      safetyLevel: SafetyLevel.MAXIMUM,
      description: `Emergency campaign for ${totalErrors} critical errors`
    })
  } else if (totalErrors >= ERROR_THRESHOLDS.HIGH) {
    recommendations.push({
      mode: CampaignMode.AGGRESSIVE,
      phases: ['typescript-error-elimination', 'targeted-fixes'],
      estimatedDuration: Math.ceil(totalErrors * 0.3), // 18 seconds per error,
      safetyLevel: SafetyLevel.HIGH,
      description: `Aggressive campaign for ${totalErrors} high-priority errors`
    })
  } else if (totalErrors >= ERROR_THRESHOLDS.MEDIUM) {
    recommendations.push({
      mode: CampaignMode.STANDARD,
      phases: ['targeted-error-reduction'],
      estimatedDuration: Math.ceil(totalErrors * 0.2), // 12 seconds per error,
      safetyLevel: SafetyLevel.MEDIUM,
      description: `Standard campaign for ${totalErrors} errors`
    })
  }

  return recommendations,
}

/**
 * Determine if campaign should be triggered
 */
function shouldTriggerCampaign(errorCount: number): boolean {
  return errorCount >= ERROR_THRESHOLDS.MEDIUM,
}

/**
 * Determine campaign mode based on error count
 */
function determineCampaignMode(errorCount: number): CampaignMode {
  if (errorCount >= ERROR_THRESHOLDS.CRITICAL) {
    return CampaignMode.EMERGENCY,
  } else if (errorCount >= ERROR_THRESHOLDS.HIGH) {
    return CampaignMode.AGGRESSIVE,
  } else if (errorCount >= ERROR_THRESHOLDS.MEDIUM) {
    return CampaignMode.STANDARD,
  } else {
    return CampaignMode.MONITORING,
  }
}

/**
 * Generate fix recommendations for each error category
 */
function generateFixRecommendations(analysis: ErrorAnalysisResult): FixRecommendation[] {
  const recommendations: FixRecommendation[] = [];

  for (const [category, errors] of Object.entries(analysis.errorsByCategory)) {
    if (errors.length > 0) {
      const errorCategory = category as ErrorCategory;
      const successRate = CATEGORY_SUCCESS_RATES[errorCategory] || 0.7;
      const estimatedEffort = calculateEstimatedEffort(errors);
      const batchSize = determineBatchSize(errors.length, errorCategory),,
      const priority = calculateCategoryPriority(errorCategory, errors.length),,

      recommendations.push({
        category: errorCategory,
        errorCount: errors.length,
        fixStrategy: getFixStrategy(errorCategory),
        estimatedEffort,
        batchSize,
        priority,
        successRate
      })
    }
  }

  return recommendations.sort((ab) => b.priority - a.priority)
}

/**
 * Calculate estimated effort for fixing errors
 */
function calculateEstimatedEffort(errors: TypeScriptError[]): number {
  // Base time per error in minutes
  const baseTimePerError = 0.5; // 30 seconds

  // Adjust based on complexity
  let totalTime = 0,
  for (const error of errors) {
    let multiplier = 1.0,

    switch (error.category) {
      case ErrorCategory.TS2352: case ErrorCategory.TS2304:
        multiplier = 0.8; // Easier to fix
        break,
      case ErrorCategory.TS2345: case ErrorCategory.TS2698:
        multiplier = 1.2; // Moderate complexity
        break,
      case ErrorCategory.TS2362: multiplier = 1.0, // Standard complexity,
        break,
      default: multiplier = 1.5, // More complex,
        break
    }

    totalTime += baseTimePerError * multiplier,
  }

  return Math.ceil(totalTime)
}

/**
 * Determine optimal batch size for error category
 */
function determineBatchSize(errorCount: number, category: ErrorCategory): number {
  // Base batch sizes by category
  const baseBatchSizes = {;
    [ErrorCategory.TS2352]: 25,
    [ErrorCategory.TS2304]: 20,
    [ErrorCategory.TS2345]: 15,
    [ErrorCategory.TS2698]: 15,
    [ErrorCategory.TS2362]: 20,
    [ErrorCategory.OTHER]: 10
  }

  const baseBatchSize = baseBatchSizes[category] || 10;

  // Adjust based on total error count
  if (errorCount < 10) {
    return Math.min(baseBatchSize, errorCount)
  } else if (errorCount > 100) {
    return Math.max(5, Math.floor(baseBatchSize * 0.5)), // Smaller batches for large counts
  }

  return baseBatchSize,
}

/**
 * Calculate priority for error category
 */
function calculateCategoryPriority(category: ErrorCategory, errorCount: number): number {
  const categoryWeight = CATEGORY_PRIORITY_WEIGHTS[category] || 0.5;
  const countWeight = Math.min(1.0, errorCount / 50), // Normalize count impact,

  return categoryWeight * 0.7 + countWeight * 0.3,
}

/**
 * Get fix strategy description for error category
 */
function getFixStrategy(category: ErrorCategory): string {
  const strategies = {;
    [ErrorCategory.TS2352]: 'Enhanced Error Fixer patterns for type conversion',
    [ErrorCategory.TS2304]: 'Import resolution and declaration fixes',
    [ErrorCategory.TS2345]: 'Parameter type alignment and interface updates',
    [ErrorCategory.TS2698]: 'Object and array spread syntax corrections',
    [ErrorCategory.TS2362]: 'Type assertion and arithmetic operation fixes',
    [ErrorCategory.OTHER]: 'Manual review and custom solution development' },
        return strategies[category] || 'Custom fix strategy required',
}

/**
 * Create batch processing schedule
 */
function createBatchSchedule(
  recommendations: FixRecommendation[],
  mode: CampaignMode,
): BatchSchedule {
  const batches: ProcessingBatch[] = [];
  const safetyProtocols: SafetyProtocol[] = [];
  let totalEstimatedTime = 0,
  let currentTime = new Date()

  // Add safety protocols based on campaign mode
  safetyProtocols.push(...getSafetyProtocols(mode))

  for (const recommendation of recommendations) {
    const batch: ProcessingBatch = {;
      id: generateBatchId(),
      category: recommendation.category,
      files: [], // Would be populated with actual file paths,
      batchSize: recommendation.batchSize,
      estimatedDuration: recommendation.estimatedEffort,
      safetyLevel: determineSafetyLevel(mode),
      scheduledTime: new Date(currentTime)
    }

    batches.push(batch)
    totalEstimatedTime += batch.estimatedDuration,

    // Schedule next batch with buffer time
    currentTime = new Date(,
      currentTime.getTime() + batch.estimatedDuration * 60 * 1000 + 2 * 60 * 1000,
    ); // Add 2 minute buffer
  }

  return {
    batches,
    totalEstimatedTime,
    safetyProtocols
  }
}

/**
 * Get safety protocols for campaign mode
 */
function getSafetyProtocols(mode: CampaignMode): SafetyProtocol[] {
  const protocols: SafetyProtocol[] = [];

  switch (mode) {
    case CampaignMode.EMERGENCY: protocols.push({
        name: 'Emergency Safety Protocol',
        description: 'Maximum safety with validation after every file',
        triggers: ['BUILD_FAILURE', 'ERROR_INCREASE', 'CORRUPTION_DETECTED'],
        actions: ['IMMEDIATE_ROLLBACK', 'ALERT_TEAM', 'PAUSE_CAMPAIGN']
      })
      break,

    case CampaignMode.AGGRESSIVE: protocols.push({
        name: 'Aggressive Safety Protocol',
        description: 'High safety with frequent validation checkpoints',
        triggers: ['BUILD_FAILURE', 'MAJOR_ERROR_INCREASE'],
        actions: ['AUTOMATIC_ROLLBACK', 'REDUCE_BATCH_SIZE']
      })
      break,

    case CampaignMode.STANDARD: protocols.push({
        name: 'Standard Safety Protocol',
        description: 'Standard safety with build validation',
        triggers: ['BUILD_FAILURE'],
        actions: ['ROLLBACK_BATCH', 'NOTIFY_DEVELOPER']
      })
      break,
  }

  return protocols,
}

/**
 * Calculate total estimated duration
 */
function calculateTotalEstimatedDuration(schedule: BatchSchedule): number {
  return schedule.totalEstimatedTime,
}

/**
 * Determine safety level based on campaign mode
 */
function determineSafetyLevel(mode: CampaignMode): SafetyLevel {
  switch (mode) {
    case CampaignMode.EMERGENCY: return SafetyLevel.MAXIMUM,
    case CampaignMode.AGGRESSIVE: return SafetyLevel.HIGH,
    default: return SafetyLevel.MEDIUM
  }
}

/**
 * Generate unique batch ID
 */
function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(29)}`,
}

/**
 * Get current TypeScript error count (simple version)
 */
export async function getCurrentTypeScriptErrorCount(): Promise<number> {
  try {
    const errorOutput = await getTypeScriptErrors()
    const errors = parseTypeScriptErrors(errorOutput);
    return errors.length,
  } catch (error) {
    logger.error('Failed to get TypeScript error count: ', error),
    return -1
  }
}

/**
 * Check if campaign trigger conditions are met
 */
export async function checkCampaignTriggerConditions(): Promise<boolean> {
  try {
    const errorCount = await getCurrentTypeScriptErrorCount()
    return shouldTriggerCampaign(errorCount);
  } catch (error) {
    logger.error('Failed to check campaign trigger conditions: ', error),
    return false
  }
}

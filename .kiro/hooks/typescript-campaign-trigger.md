# TypeScript Campaign Trigger Hook

---

name: "TypeScript Campaign Trigger" triggers:

- typescript_errors: "> 100"
- build_failure: "type_errors"
- file_change: "src/\*_/_.ts"
- file_change: "src/\*_/_.tsx" scope: "codebase-quality" approval: manual
  rollback: campaign_stash priority: critical timeout: 600

---

## Overview

This hook automatically monitors TypeScript error thresholds and triggers
campaign system execution when error counts exceed acceptable limits. It
provides intelligent error analysis, campaign recommendations, and automated
batch processing scheduling to systematically reduce TypeScript errors in the
codebase.

## Trigger Conditions

### Error Threshold Triggers

- **TypeScript Error Count**: `> 100` errors
  - Monitors real-time TypeScript compilation errors
  - Analyzes error distribution and categorization
  - Triggers appropriate campaign phases based on error types
- **Build Failure**: Type-related build failures
  - Detects when builds fail due to TypeScript errors
  - Analyzes failure patterns and root causes
  - Recommends targeted campaign interventions

### File Change Triggers

- **TypeScript Files**: `src/**/*.ts`, `src/**/*.tsx`
  - Monitors changes to TypeScript source files
  - Tracks error introduction and resolution patterns
  - Provides proactive campaign recommendations

## Validation Actions

### 1. Error Distribution Analysis

```typescript
// Analyze current TypeScript error distribution
async function analyzeErrorDistribution(): Promise<ErrorAnalysisResult> {
  const analyzer = new TypeScriptErrorAnalyzer();
  const distribution = await analyzer.getErrorDistribution();

  return {
    totalErrors: distribution.totalErrors,
    errorsByCategory: distribution.errorsByCategory,
    highImpactFiles: distribution.highImpactFiles,
    priorityRanking: distribution.priorityRanking,
    campaignRecommendations: generateCampaignRecommendations(distribution),
  };
}
```

### 2. Campaign System Triggering

```typescript
// Trigger appropriate campaign phases based on error analysis
async function triggerCampaignSystem(
  analysis: ErrorAnalysisResult
): Promise<CampaignTriggerResult> {
  const campaignController = new CampaignController(getCampaignConfig());

  // Determine optimal campaign strategy
  const strategy = determineCampaignStrategy(analysis);

  // Execute campaign phases
  const results = await campaignController.executePhases(strategy.phases);

  return {
    strategy,
    results,
    estimatedCompletion: calculateEstimatedCompletion(results),
    safetyCheckpoints: results.map(r => r.safetyCheckpoints).flat(),
  };
}
```

### 3. Fix Recommendations Generation

```typescript
// Generate specific fix recommendations based on error patterns
async function generateFixRecommendations(
  analysis: ErrorAnalysisResult
): Promise<FixRecommendation[]> {
  const recommendations: FixRecommendation[] = [];

  // High-priority error categories
  const highPriorityCategories = [
    'TS2352',
    'TS2304',
    'TS2345',
    'TS2698',
    'TS2362',
  ];

  for (const category of highPriorityCategories) {
    const errors = analysis.errorsByCategory[category];
    if (errors && errors.length > 0) {
      recommendations.push({
        category,
        errorCount: errors.length,
        fixStrategy: getCategoryFixStrategy(category),
        estimatedEffort: calculateFixEffort(errors),
        batchSize: determineBatchSize(errors),
        priority: calculatePriority(category, errors.length),
      });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}
```

### 4. Batch Processing Scheduling

```typescript
// Schedule batch processing based on error complexity and system load
async function scheduleBatchProcessing(
  recommendations: FixRecommendation[]
): Promise<BatchSchedule> {
  const schedule: BatchSchedule = {
    batches: [],
    totalEstimatedTime: 0,
    safetyProtocols: [],
  };

  for (const recommendation of recommendations) {
    const batch: ProcessingBatch = {
      id: generateBatchId(),
      category: recommendation.category,
      files: getFilesForCategory(recommendation.category),
      batchSize: recommendation.batchSize,
      estimatedDuration: recommendation.estimatedEffort,
      safetyLevel: determineSafetyLevel(recommendation.category),
      scheduledTime: calculateOptimalScheduleTime(schedule.batches),
    };

    schedule.batches.push(batch);
    schedule.totalEstimatedTime += batch.estimatedDuration;
  }

  return schedule;
}
```

## Safety Protocols

### Campaign Stash Rollback

- Creates comprehensive git stash before campaign execution
- Automatically rolls back if campaign fails or introduces regressions
- Preserves all work-in-progress changes
- Logs all rollback actions with detailed campaign context

### Error Threshold Management

- **Critical Threshold**: >500 errors (emergency campaign mode)
- **High Threshold**: >200 errors (aggressive campaign mode)
- **Medium Threshold**: >100 errors (standard campaign mode)
- **Monitoring Threshold**: >50 errors (proactive monitoring)

### Campaign Safety Checkpoints

```typescript
interface CampaignSafetyProtocol {
  preExecutionValidation: boolean;
  buildValidationFrequency: number; // Files processed between builds
  errorRegressionDetection: boolean;
  automaticRollbackTriggers: RollbackTrigger[];
  manualApprovalRequired: boolean;
}

const SAFETY_PROTOCOLS: Record<string, CampaignSafetyProtocol> = {
  EMERGENCY: {
    preExecutionValidation: true,
    buildValidationFrequency: 1, // Validate after every file
    errorRegressionDetection: true,
    automaticRollbackTriggers: [
      'BUILD_FAILURE',
      'ERROR_INCREASE',
      'CORRUPTION_DETECTED',
    ],
    manualApprovalRequired: true,
  },
  AGGRESSIVE: {
    preExecutionValidation: true,
    buildValidationFrequency: 5,
    errorRegressionDetection: true,
    automaticRollbackTriggers: ['BUILD_FAILURE', 'MAJOR_ERROR_INCREASE'],
    manualApprovalRequired: true,
  },
  STANDARD: {
    preExecutionValidation: true,
    buildValidationFrequency: 10,
    errorRegressionDetection: true,
    automaticRollbackTriggers: ['BUILD_FAILURE'],
    manualApprovalRequired: false,
  },
};
```

## Implementation Details

### Hook Execution Flow

1. **Error Monitoring**: Continuous TypeScript error count monitoring
2. **Threshold Detection**: Trigger when error count exceeds thresholds
3. **Error Analysis**: Comprehensive error distribution analysis
4. **Campaign Planning**: Generate optimal campaign strategy
5. **User Approval**: Request manual approval for campaign execution
6. **Campaign Execution**: Execute campaign phases with safety protocols
7. **Progress Monitoring**: Real-time campaign progress tracking
8. **Result Reporting**: Generate comprehensive campaign results

### Error Analysis Integration

```typescript
interface ErrorAnalysisConfig {
  errorCategories: ErrorCategory[];
  priorityWeights: Record<ErrorCategory, number>;
  fileImpactThresholds: {
    highImpact: number; // Files with >10 errors
    mediumImpact: number; // Files with >5 errors
    lowImpact: number; // Files with >1 error
  };
  campaignTriggerRules: CampaignTriggerRule[];
}

const ERROR_ANALYSIS_CONFIG: ErrorAnalysisConfig = {
  errorCategories: ['TS2352', 'TS2304', 'TS2345', 'TS2698', 'TS2362', 'OTHER'],
  priorityWeights: {
    TS2352: 0.95, // 92% fix success rate
    TS2304: 0.95, // 95% fix success rate
    TS2345: 0.88, // 88% fix success rate
    TS2698: 0.85, // 85% fix success rate
    TS2362: 0.9, // 90% fix success rate
    OTHER: 0.7,
  },
  fileImpactThresholds: {
    highImpact: 10,
    mediumImpact: 5,
    lowImpact: 1,
  },
  campaignTriggerRules: [
    {
      condition: 'total_errors > 500',
      campaignMode: 'EMERGENCY',
      phases: ['typescript-error-elimination', 'build-stabilization'],
    },
    {
      condition: 'total_errors > 200',
      campaignMode: 'AGGRESSIVE',
      phases: ['typescript-error-elimination'],
    },
    {
      condition: 'total_errors > 100',
      campaignMode: 'STANDARD',
      phases: ['targeted-error-reduction'],
    },
  ],
};
```

### Campaign Integration Points

```typescript
interface CampaignIntegrationConfig {
  campaignController: string; // Path to campaign controller
  errorAnalyzer: string; // Path to error analyzer
  progressTracker: string; // Path to progress tracker
  safetyProtocols: string; // Path to safety protocols
  metricsCollector: string; // Path to metrics collector
}

const CAMPAIGN_INTEGRATION: CampaignIntegrationConfig = {
  campaignController: 'src/services/campaign/CampaignController.ts',
  errorAnalyzer: 'src/services/campaign/TypeScriptErrorAnalyzer.ts',
  progressTracker: 'src/services/campaign/ProgressTracker.ts',
  safetyProtocols: 'src/services/campaign/SafetyProtocol.ts',
  metricsCollector: 'src/services/campaign/MetricsCollectionSystem.ts',
};
```

## Configuration Options

### Threshold Settings

```yaml
error_thresholds:
  critical: 500 # Emergency campaign mode
  high: 200 # Aggressive campaign mode
  medium: 100 # Standard campaign mode
  monitoring: 50 # Proactive monitoring only
```

### Campaign Settings

```yaml
campaign_settings:
  auto_trigger_enabled: false # Require manual approval
  batch_size_limits:
    emergency: 5 # Very small batches for safety
    aggressive: 15 # Small batches
    standard: 25 # Standard batch size
  validation_frequency:
    emergency: 1 # Validate after every file
    aggressive: 5 # Validate every 5 files
    standard: 10 # Validate every 10 files
```

### Notification Settings

```yaml
notifications:
  threshold_exceeded: true
  campaign_started: true
  campaign_completed: true
  campaign_failed: true
  rollback_triggered: true
  channels: ['log', 'console', 'webhook']
```

### Rollback Settings

```yaml
rollback:
  strategy: campaign_stash
  auto_rollback_triggers:
    - BUILD_FAILURE
    - ERROR_REGRESSION
    - CORRUPTION_DETECTED
  manual_rollback_available: true
  stash_retention_days: 14
  max_stash_entries: 50
```

## Error Category Strategies

### High-Success Categories (>90% fix rate)

- **TS2352**: Type conversion errors - Enhanced Error Fixer patterns
- **TS2304**: Cannot find name errors - Import resolution and declaration fixes
- **TS2362**: Arithmetic operation errors - Type assertion and conversion fixes

### Medium-Success Categories (80-90% fix rate)

- **TS2345**: Argument type mismatch - Parameter type alignment
- **TS2698**: Spread syntax errors - Object and array spread fixes

### Complex Categories (<80% fix rate)

- **OTHER**: Miscellaneous errors requiring manual review and custom solutions

## Integration Points

### Campaign System Integration

- Integrates with existing CampaignController for orchestration
- Uses TypeScriptErrorAnalyzer for error categorization and analysis
- Coordinates with ProgressTracker for real-time progress monitoring
- Implements SafetyProtocol for comprehensive error prevention

### Build System Integration

- Monitors TypeScript compilation process for error detection
- Integrates with build pipeline for validation checkpoints
- Coordinates with CI/CD systems for deployment gate management
- Provides build performance metrics and optimization recommendations

### Development Workflow Integration

- Integrates with IDE and editor plugins for real-time error feedback
- Coordinates with git hooks for pre-commit error validation
- Provides developer dashboard for campaign progress monitoring
- Offers manual campaign trigger options for targeted fixes

## Troubleshooting

### Common Issues

1. **Campaign Trigger Loops**: Prevent infinite campaign triggering
2. **Build Performance Impact**: Minimize impact on development workflow
3. **Error Regression**: Detect and prevent error count increases
4. **Resource Consumption**: Monitor and limit campaign resource usage

### Debug Commands

```bash
# Manual campaign trigger
npm run campaign:trigger -- --mode=standard

# Error analysis only
npm run campaign:analyze-errors

# Campaign status check
npm run campaign:status

# Emergency rollback
npm run campaign:rollback -- --emergency
```

## References

### Campaign System Files

- `src/services/campaign/CampaignController.ts`: Main campaign orchestration
- `src/services/campaign/TypeScriptErrorAnalyzer.ts`: Error analysis and
  categorization
- `src/services/campaign/ProgressTracker.ts`: Real-time progress monitoring
- `src/types/campaign.ts`: Campaign system type definitions

### Error Analysis Documentation

- `.kiro/steering/campaign-integration.md`: Campaign system patterns and
  integration
- `src/services/campaign/README.md`: Comprehensive campaign system documentation
- `TYPESCRIPT_PHASES_TRACKER_UPDATED.md`: TypeScript error reduction tracking

### Safety and Recovery

- `src/services/campaign/SafetyProtocol.ts`: Safety protocol implementation
- `src/services/campaign/EmergencyRecoverySystem.ts`: Emergency recovery
  procedures
- `src/services/campaign/TROUBLESHOOTING_GUIDE.md`: Troubleshooting procedures

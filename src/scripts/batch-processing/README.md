# Safe Batch Processing Framework

This framework provides a comprehensive solution for safely processing unused variable elimination in batches with enhanced safety protocols and automatic rollback capabilities.

## Overview

The Safe Batch Processing Framework implements the requirements from task 3 of the unused variable elimination specification:

- **Task 3.1**: Safe batch processing framework with maximum 15 files per batch, TypeScript compilation validation, and automatic rollback using git stash
- **Task 3.2**: Enhanced safety protocols for high-impact files with smaller batch sizes (5-10 files) and manual review requirements

## Architecture

### Core Components

1. **SafeBatchProcessor** - Main batch processing engine with safety protocols
2. **EnhancedSafetyProtocols** - Risk assessment and manual review workflows
3. **BatchProcessingOrchestrator** - Coordinates the entire processing workflow
4. **Integration Layer** - Connects with existing unused variable analysis

### Key Features

- ✅ Maximum 15 files per batch (configurable)
- ✅ Smaller batch sizes (5-10 files) for critical system files
- ✅ TypeScript compilation validation after each batch
- ✅ Automatic rollback using git stash on compilation errors
- ✅ Manual review requirements for files with >20 unused variables
- ✅ Enhanced validation for service layer and core calculation files
- ✅ Comprehensive progress tracking and reporting
- ✅ Safety checkpoints and rollback mechanisms

## Usage

### Command Line Interface

The framework provides a comprehensive CLI for all operations:

```bash
# Create a processing plan
yarn batch-process:plan

# Execute batch processing (dry run)
yarn batch-process:execute:dry

# Execute batch processing (with changes)
yarn batch-process:execute

# Execute with enhanced safety (smaller batches)
yarn batch-process:execute:safe

# Handle manual reviews
yarn batch-process:review

# Check campaign status
yarn batch-process:status

# Run complete integration workflow
yarn batch-process:integration
```

### Programmatic Usage

```typescript
import { BatchProcessingOrchestrator } from './BatchProcessingOrchestrator';
import { FileProcessingInfo } from './SafeBatchProcessor';

// Configure the orchestrator
const orchestrator = new BatchProcessingOrchestrator({
  batchProcessing: {
    maxBatchSize: 15,
    maxBatchSizeCritical: 5,
    validateAfterEachBatch: true,
    autoRollbackOnError: true,
    createGitStash: true
  },
  safetyProtocols: {
    maxVariablesAutoProcess: 20,
    requireManualReview: true,
    enhancedValidation: true
  }
});

// Execute campaign
const files: FileProcessingInfo[] = loadFiles();
const campaign = await orchestrator.executeCampaign(files);
```

## Safety Protocols

### Risk Assessment

Files are automatically assessed for risk level based on multiple factors:

- **Critical Risk**: Core calculation files, files with >30 unused variables
- **High Risk**: Service layer files, files with >20 unused variables
- **Medium Risk**: Component files, files with >10 unused variables
- **Low Risk**: Utility files, test files, files with <10 unused variables

### Batch Size Limits

- **Standard Files**: Maximum 15 files per batch
- **High-Risk Files**: Maximum 8 files per batch
- **Critical Files**: Maximum 5 files per batch
- **Files with >20 variables**: Require manual review

### Safety Checkpoints

The system creates safety checkpoints at key points:

1. **Initial Checkpoint**: Before any processing begins
2. **Pre-Batch Checkpoints**: Before each batch is processed
3. **Post-Batch Checkpoints**: After each batch completes
4. **Validation Checkpoints**: After TypeScript compilation validation

### Rollback Mechanisms

Multiple rollback mechanisms ensure safety:

1. **Git Stash Rollback**: Automatic rollback using git stash on compilation errors
2. **File-Level Rollback**: Individual file restoration from backups
3. **Batch-Level Rollback**: Complete batch rollback on critical errors
4. **Campaign-Level Rollback**: Full campaign rollback on system failures

## Manual Review Workflow

### Triggering Manual Review

Manual review is automatically triggered for:

- Files with >20 unused variables
- Critical system files (calculations, core services)
- Files with complex dependency relationships
- Files containing astrological calculations
- Files with campaign system logic

### Review Process

1. **Assessment**: System generates risk assessment and review instructions
2. **Queue**: Review request is added to manual review queue
3. **Instructions**: Specific review instructions based on file type and risk factors
4. **Approval/Rejection**: Reviewer can approve or reject with notes
5. **Processing**: Approved files proceed to batch processing

### Review Instructions

The system generates specific review instructions based on file characteristics:

**For Core Calculation Files:**
- Verify that no planetary calculation variables are eliminated
- Ensure elemental property variables (Fire, Water, Earth, Air) are preserved
- Check that astronomical data processing remains intact

**For Service Layer Files:**
- Verify API integration points remain functional
- Check that error handling variables are preserved
- Ensure configuration and options variables are not eliminated

**For High Variable Count Files:**
- Manually review each variable for potential business value
- Consider transforming high-value variables instead of elimination
- Verify that no incomplete feature implementations are affected

## Enhanced Validation

### TypeScript Compilation Validation

After each batch, the system validates:
- Zero TypeScript compilation errors
- All imports resolve correctly
- No syntax errors introduced

### Service Layer Validation

For service layer files, additional validation includes:
- API endpoint functionality verification
- Error handling pattern preservation
- Configuration variable integrity

### Core Calculation Validation

For calculation files, enhanced validation includes:
- Elemental property preservation (Fire, Water, Earth, Air)
- Planetary calculation function integrity
- Astronomical data processing accuracy

### Dependency Validation

Cross-file dependency validation ensures:
- All imports remain functional
- Exported values are not undefined
- Module relationships are preserved

## Configuration Options

### Batch Processing Configuration

```typescript
interface BatchProcessingConfig {
  maxBatchSize: number;              // Default: 15
  maxBatchSizeCritical: number;      // Default: 5
  validateAfterEachBatch: boolean;   // Default: true
  autoRollbackOnError: boolean;      // Default: true
  createGitStash: boolean;           // Default: true
  logLevel: 'debug' | 'info' | 'warn' | 'error'; // Default: 'info'
}
```

### Safety Protocols Configuration

```typescript
interface HighImpactFileConfig {
  maxVariablesAutoProcess: number;   // Default: 20
  criticalFileBatchSize: number;     // Default: 5
  serviceLayerBatchSize: number;     // Default: 8
  requireManualReview: boolean;      // Default: true
  enhancedValidation: boolean;       // Default: true
  createDetailedBackups: boolean;    // Default: true
}
```

## Reporting and Monitoring

### Campaign Reports

The system generates comprehensive reports including:

- **Processing Plan**: Risk assessment and batch organization
- **Batch Results**: Success/failure status for each batch
- **Manual Reviews**: Pending and completed review requests
- **Final Statistics**: Elimination rates, success rates, time elapsed
- **Safety Events**: Rollbacks, validation failures, error recovery
- **Recommendations**: Suggested improvements and next steps

### Progress Tracking

Real-time progress tracking includes:
- Files processed vs. total files
- Variables eliminated vs. preserved
- Batch success rates
- Compilation validation status
- Manual review queue status

### Metrics Collection

Key metrics collected:
- Processing speed (files per minute)
- Elimination efficiency (variables eliminated per file)
- Safety event frequency
- Rollback occurrence rates
- Manual review approval rates

## Integration with Existing Systems

### Unused Variable Analysis Integration

The framework integrates seamlessly with the existing unused variable analysis system:

1. **Analysis Phase**: Uses existing `UnusedVariableAnalyzer`
2. **Data Conversion**: Converts analysis results to batch processing format
3. **Domain Preservation**: Leverages existing domain preservation patterns
4. **Reporting**: Extends existing reporting capabilities

### Campaign System Integration

Integration with the broader campaign system includes:
- **Progress Tracking**: Unified progress reporting
- **Safety Protocols**: Shared safety checkpoint mechanisms
- **Error Handling**: Consistent error handling patterns
- **Metrics Collection**: Integrated metrics and analytics

### Git Integration

Comprehensive git integration provides:
- **Stash Management**: Automatic stash creation and cleanup
- **Branch Protection**: Safe processing on feature branches
- **Commit Hooks**: Integration with pre-commit validation
- **History Preservation**: Maintains clean git history

## Testing

### Unit Tests

Comprehensive unit test coverage includes:
- Batch creation and sizing logic
- Safety protocol activation
- Risk assessment algorithms
- Rollback mechanism functionality
- Configuration option handling

### Integration Tests

Integration tests validate:
- End-to-end campaign execution
- Git stash creation and rollback
- TypeScript compilation validation
- Manual review workflow
- Report generation

### Performance Tests

Performance testing ensures:
- Batch processing completes within time limits
- Memory usage remains within acceptable bounds
- Large file sets are handled efficiently
- Rollback operations are fast and reliable

## Troubleshooting

### Common Issues

**Git Stash Creation Fails**
- Ensure git is properly configured
- Check for uncommitted changes
- Verify git repository is in clean state

**TypeScript Compilation Fails**
- Review compilation errors in batch results
- Check for missing imports or type definitions
- Verify tsconfig.json configuration

**Manual Review Queue Stuck**
- Check pending manual reviews with `yarn batch-process:review`
- Approve or reject pending reviews
- Consider adjusting manual review thresholds

**Batch Processing Stalls**
- Check system resources (memory, disk space)
- Review error logs for specific failures
- Consider reducing batch sizes

### Error Recovery

The system provides multiple error recovery mechanisms:

1. **Automatic Recovery**: Rollback and retry with smaller batch sizes
2. **Manual Recovery**: Manual intervention through CLI commands
3. **Emergency Recovery**: Complete campaign rollback and restart
4. **Partial Recovery**: Skip problematic files and continue processing

## Best Practices

### Before Running

1. **Backup**: Ensure all important changes are committed
2. **Analysis**: Run unused variable analysis first
3. **Review**: Check the processing plan before execution
4. **Configuration**: Adjust batch sizes based on system capacity

### During Execution

1. **Monitor**: Watch progress and error logs
2. **Review**: Handle manual review requests promptly
3. **Validate**: Check compilation status after each batch
4. **Intervene**: Stop processing if issues arise

### After Completion

1. **Validate**: Run full test suite to verify functionality
2. **Review**: Check campaign reports for insights
3. **Cleanup**: Remove temporary files and stashes
4. **Document**: Record lessons learned and improvements

## Future Enhancements

Planned enhancements include:

- **Parallel Processing**: Process multiple batches concurrently
- **Machine Learning**: Improve risk assessment with ML models
- **IDE Integration**: Direct integration with development environments
- **Cloud Processing**: Support for cloud-based batch processing
- **Advanced Analytics**: Enhanced metrics and predictive analytics

## Contributing

When contributing to the batch processing framework:

1. **Tests**: Add comprehensive tests for new features
2. **Documentation**: Update documentation for changes
3. **Safety**: Ensure all safety protocols are maintained
4. **Integration**: Test integration with existing systems
5. **Performance**: Validate performance impact of changes

## License

This framework is part of the WhatToEatNext project and follows the same licensing terms.

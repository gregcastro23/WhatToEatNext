# Configuration Management System

This directory contains the comprehensive configuration management system for the Unintentional Any Elimination campaign. The system provides centralized, environment-aware configuration with validation, schema enforcement, and CLI management tools.

## Overview

The configuration system manages four main areas:
- **Classification Rules**: Thresholds and patterns for identifying intentional vs unintentional `any` types
- **Domain-Specific Settings**: Type suggestions and patterns for different code domains
- **Safety Protocols**: Batch processing limits, validation frequencies, and rollback settings
- **Target Management**: Progress tracking intervals, success rate thresholds, and milestone definitions

## Architecture

### Core Components

- **`index.ts`**: Main configuration manager with CRUD operations
- **`loader.ts`**: Environment-specific configuration loading and merging
- **`schema.ts`**: Zod-based schema validation and type safety
- **`cli.ts`**: Command-line interface for configuration management

### Environment Configurations

- **`environments/development.json`**: Development-optimized settings
- **`environments/production.json`**: Production-safe, conservative settings
- **`environments/testing.json`**: Test-friendly, permissive settings

## Usage

### Basic Configuration Management

```typescript
import { configManager } from './config';

// Get current configuration
const config = configManager.getConfig();

// Update classification settings
configManager.updateClassificationConfig({
  intentionalThreshold: 0.85,
  minCommentLength: 15
});

// Update safety settings
configManager.updateSafetyConfig({
  maxBatchSize: 20,
  validationFrequency: 5
});

// Validate configuration
const validation = configManager.validateConfig();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

### Environment-Specific Configuration

```typescript
import { createEnvironmentConfigManager, getCurrentEnvironment } from './config/loader';

// Create manager for specific environment
const prodManager = createEnvironmentConfigManager('production');
const config = prodManager.getConfig();

// Get current environment
const env = getCurrentEnvironment(); // 'development' | 'production' | 'testing'

// Load environment-specific config
const envConfig = getEnvironmentConfig('production');
```

### CLI Usage

```bash
# Show current configuration
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts show

# Show specific section
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts show --section safety

# Update configuration value
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts set safety.maxBatchSize 30 --type number

# Validate configuration
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts validate

# Reset to defaults
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts reset --confirm

# Export configuration
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts export config-backup.json

# Import configuration
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts import config-backup.json --merge
```

## Configuration Sections

### Classification Configuration

Controls how `any` types are classified as intentional or unintentional:

```typescript
interface ClassificationConfig {
  intentionalThreshold: number;      // 0-1, confidence threshold for intentional
  unintentionalThreshold: number;    // 0-1, confidence threshold for unintentional
  minCommentLength: number;          // Minimum comment length to consider as documentation
  intentionalKeywords: string[];     // Keywords indicating intentional usage
  testFilePatterns: string[];        // Glob patterns for test files
  categoryDefaults: Record<AnyTypeCategory, number>; // Default confidence by category
}
```

**Key Settings:**
- `intentionalThreshold`: Higher values require stronger evidence for intentional classification
- `unintentionalThreshold`: Lower values make it easier to classify as unintentional
- `intentionalKeywords`: Words like "intentionally any", "external api", "dynamic" indicate intentional usage

### Domain Configuration

Provides domain-specific analysis and type suggestions:

```typescript
interface DomainConfig {
  typeSuggestions: Record<string, string[]>;    // Domain → suggested types
  pathPatterns: Record<string, string[]>;       // Domain → file path patterns
  contentPatterns: Record<string, string[]>;    // Domain → content patterns
  elementalAssociations: Record<string, Element[]>; // Domain → elemental associations
}
```

**Supported Domains:**
- **Astrological**: `PlanetaryPosition`, `ElementalProperties`, `AstrologicalData`
- **Recipe**: `Ingredient`, `Recipe`, `NutritionalInfo`, `CookingMethod`
- **Campaign**: `CampaignConfig`, `MetricsData`, `ProgressReport`
- **Service**: `ApiResponse`, `ServiceConfig`, `ErrorResponse`
- **Component**: `ComponentProps`, `ComponentState`, `EventHandler`
- **Utility**: `UtilityFunction`, `HelperType`, `GenericType`

### Safety Configuration

Controls batch processing safety and rollback mechanisms:

```typescript
interface SafetyConfig {
  maxBatchSize: number;              // Maximum files per batch
  validationFrequency: number;       // Files between validation checks
  compilationTimeout: number;        // TypeScript compilation timeout (ms)
  maxRollbackAttempts: number;       // Maximum rollback attempts
  safetyLevels: Record<string, SafetyLevel>; // Safety levels by operation
  backupRetentionDays: number;       // Backup retention period
}
```

**Safety Levels:**
- `MAXIMUM`: Strictest safety, frequent validation, immediate rollback
- `HIGH`: Conservative approach with regular validation
- `MEDIUM`: Balanced safety and performance
- `LOW`: Minimal safety checks (testing only)

### Target Configuration

Manages progress tracking and success criteria:

```typescript
interface TargetConfig {
  targetReductionPercentage: number; // Overall reduction target (0-100)
  minSuccessRate: number;            // Minimum success rate to continue (0-1)
  maxErrorIncrease: number;          // Maximum allowed error increase
  trackingIntervals: {
    metrics: number;                 // Metrics collection interval (minutes)
    reports: number;                 // Report generation interval (hours)
    checkpoints: number;             // Checkpoint interval (files processed)
  };
  milestones: Array<{
    name: string;                    // Milestone name
    targetReduction: number;         // Target reduction percentage
    timeframe: string;               // Expected timeframe
  }>;
}
```

## Environment-Specific Settings

### Development Environment

Optimized for rapid development and testing:
- Lower confidence thresholds for faster classification
- Smaller batch sizes for quicker feedback
- More frequent progress reporting
- Relaxed safety levels for development speed

### Production Environment

Conservative settings for maximum safety:
- Higher confidence thresholds for accuracy
- Maximum safety levels for all operations
- Longer backup retention periods
- Comprehensive validation and monitoring

### Testing Environment

Permissive settings for test execution:
- Lowest confidence thresholds
- Smallest batch sizes for test isolation
- Minimal safety overhead
- Rapid feedback cycles

## Validation and Schema

The configuration system uses Zod for runtime validation:

```typescript
import { validateCompleteConfig } from './config/schema';

const validation = validateCompleteConfig(config);
if (!validation.isValid) {
  console.error('Schema errors:', validation.schemaErrors);
  console.error('Business rule errors:', validation.businessErrors);
  console.warn('Warnings:', validation.warnings);
}
```

**Validation Levels:**
1. **Schema Validation**: Type checking, range validation, required fields
2. **Business Rule Validation**: Cross-field validation, logical consistency
3. **Environment Validation**: Environment-specific requirements

## Configuration File Locations

### Default Locations
- **Global Config**: `.kiro/campaign-configs/unintentional-any-elimination.json`
- **Environment Configs**: `src/services/campaign/unintentional-any-elimination/config/environments/`

### Custom Locations
```typescript
// Custom config path
const manager = new ConfigurationManager('/path/to/custom/config.json');

// Environment-specific custom path
const envManager = createEnvironmentConfigManager('production', '/path/to/prod-config.json');
```

## Best Practices

### Configuration Updates

1. **Always Validate**: Validate configuration after updates
2. **Use Environment Configs**: Prefer environment-specific configs over runtime updates
3. **Backup Before Changes**: Export configuration before major changes
4. **Test Changes**: Validate in testing environment before production

### Safety Considerations

1. **Production Safety**: Always use MAXIMUM safety levels in production
2. **Batch Size Limits**: Keep batch sizes reasonable (≤25 files)
3. **Validation Frequency**: Validate frequently in production (every 5 files)
4. **Rollback Readiness**: Ensure rollback mechanisms are tested

### Performance Optimization

1. **Appropriate Timeouts**: Set compilation timeouts based on project size
2. **Efficient Tracking**: Balance tracking frequency with performance
3. **Cache Configuration**: Configuration is cached, updates require restart
4. **Environment Matching**: Use appropriate environment for workload

## Troubleshooting

### Common Issues

**Configuration Not Loading**
```bash
# Check file permissions
ls -la .kiro/campaign-configs/

# Validate JSON syntax
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts validate
```

**Validation Errors**
```bash
# Show detailed validation errors
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts validate --environment production
```

**Environment Detection Issues**
```bash
# Check current environment
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts env current

# List available environments
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts env list
```

### Recovery Procedures

**Reset to Defaults**
```bash
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts reset --confirm
```

**Restore from Backup**
```bash
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts import backup-config.json
```

**Manual Configuration Fix**
```bash
# Export current config
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts export current-config.json

# Edit manually, then import
npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts import current-config.json
```

## Integration Points

### Campaign System Integration

The configuration system integrates with the broader campaign system:

```typescript
import { configManager } from './config';
import { UnintentionalAnyEliminationCampaign } from './UnintentionalAnyEliminationCampaign';

const campaign = new UnintentionalAnyEliminationCampaign(configManager.getConfig());
```

### CLI Tool Integration

Configuration can be managed through the main CLI:

```typescript
import { environmentConfigManager } from './config/loader';

// CLI tools use environment-aware configuration
const config = environmentConfigManager.getConfig();
```

### Testing Integration

Test suites use testing-specific configuration:

```typescript
import { testingConfigManager } from './config/loader';

// Tests use permissive testing configuration
const testConfig = testingConfigManager().getConfig();
```

## Future Enhancements

### Planned Features

1. **Configuration Profiles**: Named configuration profiles for different use cases
2. **Dynamic Configuration**: Runtime configuration updates without restart
3. **Configuration History**: Track configuration changes over time
4. **Advanced Validation**: Custom validation rules and plugins
5. **Configuration Templates**: Pre-built configurations for common scenarios

### Extension Points

1. **Custom Validators**: Add domain-specific validation rules
2. **Environment Plugins**: Support for additional environments
3. **Configuration Sources**: Support for remote configuration sources
4. **Integration Hooks**: Callbacks for configuration changes

## References

- **Main Campaign System**: `../UnintentionalAnyEliminationCampaign.ts`
- **Type Definitions**: `../types.ts`
- **CLI Tools**: `../cli/`
- **Test Suites**: `./__tests__/`

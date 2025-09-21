# Planetary Data Validation Hook

---

name: "Planetary Data Validator" triggers:

- file_change: "src/data/planets/\*.ts"
- file_change: "src/calculations/culinary/\*.ts"
- file_change: "src/utils/reliableAstronomy.ts" scope: "planetary-calculations"
  approval: auto rollback: git_stash priority: high timeout: 300

---

## Overview

This hook automatically validates planetary data integrity whenever planetary
data files or astronomical calculation utilities are modified. It ensures that
all astrological calculations maintain accuracy and consistency with established
astronomical principles.

## Trigger Conditions

### File Change Triggers

- **Planetary Data Files**: `src/data/planets/*.ts`
  - Validates transit dates against current astronomical data
  - Checks elemental property consistency
  - Verifies alchemical mapping accuracy
- **Culinary Calculation Files**: `src/calculations/culinary/*.ts`
  - Ensures astronomical calculations remain accurate
  - Validates planetary influence calculations
  - Checks elemental harmony computations

- **Astronomy Utilities**: `src/utils/reliableAstronomy.ts`
  - Validates fallback position accuracy
  - Tests API integration reliability
  - Ensures calculation consistency

## Validation Actions

### 1. Transit Date Validation

```typescript
// Validate that current transit dates are astronomically accurate
async function validateTransitDates(): Promise<ValidationResult> {
  const planets = ['mars', 'venus', 'mercury', 'jupiter', 'saturn'];
  const results: ValidationResult[] = [];

  for (const planet of planets) {
    const planetData = await import(`../../../src/data/planets/${planet}.ts`);
    const transitDates = planetData.default.PlanetSpecific?.TransitDates;

    if (transitDates) {
      const validation = await validatePlanetaryTransits(planet, transitDates);
      results.push(validation);
    }
  }

  return combineValidationResults(results);
}
```

### 2. Position Consistency Checking

```typescript
// Check that planetary positions are consistent with astronomical data
async function validatePositionConsistency(): Promise<ValidationResult> {
  const currentPositions = await getReliablePlanetaryPositions();
  const storedPositions = await getStoredPlanetaryData();

  return comparePositionalData(currentPositions, storedPositions);
}
```

### 3. Astronomical Test Execution

```typescript
// Run comprehensive astronomical calculation tests
async function runAstronomicalTests(): Promise<TestResult[]> {
  const testSuites = [
    'planetary-position-accuracy',
    'transit-date-validation',
    'retrograde-detection',
    'lunar-node-calculation',
    'elemental-property-consistency',
  ];

  const results = await Promise.all(
    testSuites.map(suite => runTestSuite(suite))
  );

  return results;
}
```

### 4. Fallback Position Updates

```typescript
// Update fallback positions if astronomical data has changed significantly
async function updateFallbackPositions(): Promise<UpdateResult> {
  const latestPositions = await getReliablePlanetaryPositions();
  const currentFallback = getMarch2025Positions();

  const significantChanges = detectSignificantChanges(
    latestPositions,
    currentFallback
  );

  if (significantChanges.length > 0) {
    return await updateFallbackData(latestPositions);
  }

  return { updated: false, reason: 'No significant changes detected' };
}
```

## Safety Protocols

### Git Stash Rollback

- Creates git stash before any modifications
- Automatically rolls back if validation fails
- Preserves working directory state
- Logs all rollback actions

### Validation Thresholds

- **Position Accuracy**: ±0.1 degrees tolerance
- **Transit Date Accuracy**: ±1 day tolerance
- **Test Pass Rate**: Minimum 95% pass rate required
- **API Response Time**: Maximum 5 seconds timeout

### Error Handling

```typescript
interface ValidationError {
  type: 'POSITION_DRIFT' | 'TRANSIT_MISMATCH' | 'TEST_FAILURE' | 'API_TIMEOUT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  planet?: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  message: string;
  timestamp: Date;
}
```

## Implementation Details

### Hook Execution Flow

1. **Pre-validation**: Create git stash checkpoint
2. **File Analysis**: Identify changed planetary data files
3. **Transit Validation**: Verify transit dates against astronomical data
4. **Position Checking**: Compare calculated vs stored positions
5. **Test Execution**: Run comprehensive astronomical test suite
6. **Fallback Updates**: Update fallback data if needed
7. **Result Reporting**: Generate validation report
8. **Rollback Decision**: Rollback if critical errors detected

### Test Suite Integration

```bash
# Astronomical calculation tests
npm run test:astronomical
npm run test:planetary-positions
npm run test:transit-validation
npm run test:elemental-consistency
```

### Monitoring and Alerts

- **Success Rate Tracking**: Monitor validation success rates
- **Performance Metrics**: Track validation execution time
- **Error Pattern Analysis**: Identify recurring validation issues
- **Alert Thresholds**: Notify on critical validation failures

## Configuration Options

### Sensitivity Settings

```yaml
validation_sensitivity:
  position_tolerance: 0.1 # degrees
  transit_tolerance: 1 # days
  test_pass_threshold: 95 # percentage
  api_timeout: 5 # seconds
```

### Notification Settings

```yaml
notifications:
  success: false
  warnings: true
  errors: true
  critical: true
  channels: ['log', 'console']
```

### Rollback Settings

```yaml
rollback:
  strategy: git_stash
  auto_rollback_on_critical: true
  preserve_stash_days: 7
  max_stash_entries: 10
```

## Integration Points

### Campaign System Integration

- Triggers TypeScript error analysis if validation introduces compilation errors
- Integrates with performance monitoring for calculation speed tracking
- Coordinates with build quality monitoring for overall system health

### External API Integration

- Validates against NASA JPL Horizons API when available
- Falls back to Swiss Ephemeris data for validation
- Uses TimeAndDate.com API as tertiary validation source

### Testing Framework Integration

- Integrates with Jest test runner for automated test execution
- Uses custom matchers for astronomical data validation
- Generates coverage reports for astronomical calculation code

## Troubleshooting

### Common Issues

1. **API Timeout Errors**: Increase timeout or use cached data
2. **Transit Date Mismatches**: Update transit data from astronomical sources
3. **Position Drift**: Recalibrate fallback positions
4. **Test Failures**: Review astronomical calculation logic

### Debug Commands

```bash
# Manual validation run
npm run validate:planetary-data

# Check current planetary positions
npm run check:positions

# Validate specific planet
npm run validate:planet -- mars

# Test astronomical calculations
npm run test:astronomy -- --verbose
```

## References

### Astronomical Data Sources

- NASA JPL Horizons API: Primary source for planetary positions
- Swiss Ephemeris: Secondary source for validation
- TimeAndDate.com API: Tertiary source with authentication

### Related Files

- `src/utils/reliableAstronomy.ts`: Core astronomical calculation utilities
- `src/data/planets/`: Planetary data files with transit information
- `src/calculations/culinary/`: Culinary astrology calculation implementations
- `.kiro/steering/astrology-rules.md`: Astrological calculation guidelines

# Ingredient Consistency Checker Hook

---

name: "Ingredient Consistency Checker" triggers:

- file_change: "src/data/ingredients/\*_/_.ts"
- file_change: "src/constants/elemental\*.ts"
- file_change: "src/utils/elementalUtils.ts" scope: "ingredient-data" approval:
  auto rollback: file_backup priority: high timeout: 180

---

## Overview

This hook automatically validates ingredient data integrity whenever ingredient
data files or elemental utility files are modified. It ensures that all
ingredient definitions maintain consistency with the four-element system
principles and alchemical mappings.

## Trigger Conditions

### File Change Triggers

- **Ingredient Data Files**: `src/data/ingredients/**/*.ts`
  - Validates elemental properties consistency
  - Checks compatibility score calculations
  - Verifies ingredient categorization accuracy
- **Elemental Constants**: `src/constants/elemental*.ts`
  - Ensures elemental property definitions remain valid
  - Validates compatibility matrix consistency
  - Checks self-reinforcement principle compliance

- **Elemental Utilities**: `src/utils/elementalUtils.ts`
  - Validates elemental calculation functions
  - Tests compatibility scoring algorithms
  - Ensures self-reinforcement logic integrity

## Validation Actions

### 1. Elemental Properties Validation

```typescript
// Validate that all ingredients have proper elemental properties
async function validateElementalProperties(): Promise<ValidationResult> {
  const ingredients = await getAllIngredients();
  const results: ValidationResult[] = [];

  for (const [name, ingredient] of Object.entries(ingredients)) {
    const validation = await validateIngredientElementalProperties(
      name,
      ingredient
    );
    results.push(validation);
  }

  return combineValidationResults(results);
}
```

### 2. Compatibility Score Checking

```typescript
// Check that compatibility scores follow self-reinforcement principles
async function validateCompatibilityScores(): Promise<ValidationResult> {
  const ingredients = await getAllIngredients();
  const compatibilityIssues: ValidationError[] = [];

  for (const ingredient of Object.values(ingredients)) {
    const selfCompatibility = calculateElementalCompatibility(
      ingredient.elementalProperties,
      ingredient.elementalProperties
    );

    // Self-reinforcement: same ingredient should have high compatibility (≥0.9)
    if (selfCompatibility < 0.9) {
      compatibilityIssues.push({
        type: 'COMPATIBILITY_VIOLATION',
        severity: 'HIGH',
        ingredient: ingredient.name,
        message: `Self-compatibility score ${selfCompatibility} below 0.9 threshold`,
        timestamp: new Date(),
      });
    }
  }

  return {
    isValid: compatibilityIssues.length === 0,
    errors: compatibilityIssues,
  };
}
```

### 3. Alchemical Mapping Verification

```typescript
// Verify alchemical properties are consistent with elemental properties
async function validateAlchemicalMappings(): Promise<ValidationResult> {
  const ingredients = await getAllIngredients();
  const mappingIssues: ValidationError[] = [];

  for (const [name, ingredient] of Object.entries(ingredients)) {
    if (ingredient.alchemicalProperties) {
      const validation = validateAlchemicalConsistency(ingredient);
      if (!validation.isValid) {
        mappingIssues.push(...validation.errors);
      }
    }
  }

  return { isValid: mappingIssues.length === 0, errors: mappingIssues };
}
```

### 4. Ingredient Test Execution

```typescript
// Run comprehensive ingredient data tests
async function runIngredientTests(): Promise<TestResult[]> {
  const testSuites = [
    'ingredient-elemental-properties',
    'ingredient-compatibility-scores',
    'ingredient-alchemical-mappings',
    'ingredient-categorization',
    'ingredient-data-integrity',
  ];

  const results = await Promise.all(
    testSuites.map(suite => runTestSuite(suite))
  );

  return results;
}
```

## Safety Protocols

### File Backup Rollback

- Creates file backups before any modifications
- Automatically rolls back if validation fails
- Preserves ingredient data integrity
- Logs all rollback actions with detailed reasons

### Validation Thresholds

- **Elemental Property Sum**: Must equal 1.0 (±0.01 tolerance)
- **Compatibility Scores**: Self-compatibility ≥0.9, cross-compatibility ≥0.7
- **Alchemical Consistency**: Properties must align with elemental dominance
- **Data Completeness**: Required fields must be present and valid

### Error Handling

```typescript
interface IngredientValidationError {
  type:
    | 'ELEMENTAL_INVALID'
    | 'COMPATIBILITY_VIOLATION'
    | 'ALCHEMICAL_MISMATCH'
    | 'DATA_INCOMPLETE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ingredient?: string;
  property?: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  message: string;
  timestamp: Date;
}
```

## Implementation Details

### Hook Execution Flow

1. **Pre-validation**: Create file backups
2. **File Analysis**: Identify changed ingredient files
3. **Elemental Validation**: Verify elemental properties consistency
4. **Compatibility Checking**: Test self-reinforcement principles
5. **Alchemical Verification**: Validate alchemical mappings
6. **Test Execution**: Run comprehensive ingredient test suite
7. **Result Reporting**: Generate validation report
8. **Rollback Decision**: Rollback if critical errors detected

### Test Suite Integration

```bash
# Ingredient data tests
npm run test:ingredients
npm run test:elemental-properties
npm run test:compatibility-scores
npm run test:alchemical-mappings
```

### Monitoring and Alerts

- **Data Integrity Tracking**: Monitor ingredient data consistency
- **Compatibility Metrics**: Track compatibility score distributions
- **Error Pattern Analysis**: Identify recurring validation issues
- **Performance Monitoring**: Track validation execution time

## Configuration Options

### Validation Settings

```yaml
validation_settings:
  elemental_sum_tolerance: 0.01 # Tolerance for elemental property sums
  self_compatibility_threshold: 0.9 # Minimum self-compatibility score
  cross_compatibility_threshold: 0.7 # Minimum cross-compatibility score
  alchemical_consistency_threshold: 0.8 # Alchemical mapping consistency
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
  strategy: file_backup
  auto_rollback_on_critical: true
  backup_retention_days: 7
  max_backup_files: 20
```

## Elemental Principles Enforcement

### Self-Reinforcement Validation

- **Same Element Combinations**: Must score ≥0.9 compatibility
- **Different Element Combinations**: Must score ≥0.7 compatibility
- **No Opposing Elements**: All combinations must have good compatibility
- **Elemental Dominance**: Strongest element should be clearly identifiable

### Compatibility Matrix Validation

```typescript
const EXPECTED_COMPATIBILITY_MATRIX = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 },
};
```

### Alchemical Consistency Rules

- **Spirit**: Should correlate with Air and Fire elements
- **Essence**: Should correlate with dominant elemental properties
- **Matter**: Should correlate with Earth and Water elements
- **Substance**: Should represent overall ingredient stability

## Integration Points

### Campaign System Integration

- Triggers ingredient data cleanup campaigns if validation fails
- Integrates with performance monitoring for data processing speed
- Coordinates with build quality monitoring for overall system health

### Elemental Utilities Integration

- Validates elemental calculation functions remain accurate
- Tests compatibility scoring algorithms for consistency
- Ensures self-reinforcement logic is properly implemented

### Testing Framework Integration

- Integrates with Jest test runner for automated test execution
- Uses custom matchers for ingredient data validation
- Generates coverage reports for ingredient data processing code

## Troubleshooting

### Common Issues

1. **Elemental Sum Errors**: Properties don't sum to 1.0
2. **Compatibility Violations**: Self-compatibility below 0.9
3. **Alchemical Mismatches**: Properties don't align with elements
4. **Data Completeness**: Missing required ingredient properties

### Debug Commands

```bash
# Manual validation run
npm run validate:ingredients

# Check specific ingredient
npm run validate:ingredient -- basil

# Test elemental calculations
npm run test:elemental -- --verbose

# Validate compatibility scores
npm run test:compatibility -- --ingredient=all
```

## References

### Elemental Principles

- `.kiro/steering/elemental-principles.md`: Four-element system rules
- `src/constants/elementalProperties.ts`: Elemental property constants
- `src/utils/elementalUtils.ts`: Elemental calculation utilities

### Ingredient Data Sources

- `src/data/ingredients/`: Complete ingredient database
- `src/data/ingredients/types.ts`: Ingredient type definitions
- `src/data/ingredients/elementalProperties.ts`: Elemental properties database

### Related Files

- `src/utils/ingredientUtils.ts`: Ingredient processing utilities
- `src/services/AlchemicalRecommendationService.ts`: Recommendation service
- `src/services/UnifiedRecommendationService.ts`: Unified recommendation system

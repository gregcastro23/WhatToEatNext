# Elemental Properties Denormalization Plan

**Removing Normalization Constraints to Enable True Calculated Values**

_Last Updated: January 2025_

## Executive Summary

Currently, all elemental properties (Fire, Water, Earth, Air) are normalized to sum to 1.0, constraining values to 0.0-1.0 and losing information about actual energetic intensity. This plan outlines the systematic removal of normalization to allow elements to express true calculated values, enabling more meaningful thermodynamic and alchemical calculations.

---

## Problem Statement

### Current Limitations

1. **Information Loss**: High-intensity recipes with multiple Fire-heavy ingredients get capped at 1.0 total, losing their true energetic signature
2. **Relative vs Absolute**: Values represent percentages rather than actual calculated intensities
3. **Truncation**: Recipes that should express Fire = 5.2 might be normalized to Fire = 0.45, obscuring true differences
4. **Calculation Constraints**: Thermodynamic formulas receive normalized inputs, potentially reducing their meaningfulness

### Example Problem

```typescript
// CURRENT (Normalized) - Information Loss
Recipe A: { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 } // Sum = 1.0
Recipe B: { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 } // Sum = 1.0
// These look identical but Recipe A might have 5x more Fire intensity!

// DESIRED (Actual Values) - True Intensity
Recipe A: { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 } // Total = 11.3
Recipe B: { Fire: 1.8, Water: 1.2, Earth: 0.6, Air: 0.4 } // Total = 4.0
// Now we can see Recipe A has 2.9x more Fire intensity
```

---

## Phase 1: Analysis & Documentation (Week 1)

### 1.1 Identify All Normalization Points

**Files with normalization functions:**

- `src/utils/elemental/core.ts` - `normalizeProperties()`
- `src/utils/elementalUtils.ts` - `normalizeProperties()`
- `src/constants/elementalCore.ts` - `normalizeElementalProperties()`
- `src/utils/ingredientUtils.ts` - `normalizeElementalProperties()`
- `src/utils/cuisine/culturalInfluenceEngine.ts` - `normalizeElementalProperties()`
- `src/lib/elementalSystem.ts` - `normalizeProperties()`
- `src/data/integrations/elementalBalance.ts` - `normalizeProperties()`

**Files that CALL normalization:**

- `src/utils/hierarchicalRecipeCalculations.ts` - Lines 208, 247
- `src/utils/elemental/core.ts` - Multiple locations
- `src/utils/elementalUtils.ts` - Lines 182-187
- `src/utils/elemental/transformations.ts` - Lines 246, 519
- `src/lib/recipeEngine.ts` - Lines 74-81
- And 50+ more locations (221 grep matches)

### 1.2 Categorize Normalization Usage

**Category A: Aggregation Points** (High Impact)

- Ingredient aggregation: `aggregateIngredientElementals()`
- Recipe calculation: `computeRecipeProperties()`
- Zodiac element combination

**Category B: Transformation Points** (Medium Impact)

- Cooking method transforms: `applyCookingMethodTransforms()`
- Seasonal adjustments
- Planetary modifiers

**Category C: Validation/Display** (Low Impact)

- Input validation
- UI display formatting
- Default value handling

### 1.3 Impact Analysis

**Thermodynamic Calculations:**

- Current: Uses normalized values (0.0-1.0)
- Impact: Formulas will need to handle values > 1.0
- Files:
  - `src/data/unified/alchemicalCalculations.ts`
  - `src/utils/monicaKalchmCalculations.ts`
  - `src/services/ThermodynamicClient.ts`

**Type Definitions:**

- Current: `ElementalProperties` interface (no constraints)
- Impact: Type system is already flexible
- Files:
  - `src/types/celestial.ts`
  - `src/types/alchemy.ts`

**Default Values:**

- Current: `DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }`
- Impact: Need new "zero state" defaults
- Files:
  - `src/constants/elementalCore.ts`
  - `src/types/unified.ts`

---

## Phase 2: Core System Changes (Week 2)

### 2.1 Update Type Definitions

**Create new type aliases for clarity:**

```typescript
// src/types/alchemy.ts

/**
 * Raw elemental properties - actual calculated values (not normalized)
 * Values can be any positive number representing true energetic intensity
 */
export interface RawElementalProperties {
  Fire: number; // >= 0, no upper bound
  Water: number; // >= 0, no upper bound
  Earth: number; // >= 0, no upper bound
  Air: number; // >= 0, no upper bound
}

/**
 * Normalized elemental properties - percentages (0.0-1.0, sum ≈ 1.0)
 * Used ONLY for display/UI purposes
 */
export interface NormalizedElementalProperties {
  Fire: number; // 0.0-1.0
  Water: number; // 0.0-1.0
  Earth: number; // 0.0-1.0
  Air: number; // 0.0-1.0
}

/**
 * ElementalProperties is now RawElementalProperties by default
 * (Backwards compatible alias)
 */
export type ElementalProperties = RawElementalProperties;
```

### 2.2 Update Default Values

```typescript
// src/constants/elementalCore.ts

/**
 * Zero state - no elemental properties
 */
export const ZERO_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
};

/**
 * Default balanced state - minimal baseline
 * (Changed from 0.25 each to 0.0 - let calculations determine actual values)
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
};

/**
 * Legacy normalized defaults (for backwards compatibility only)
 */
export const NORMALIZED_DEFAULT_PROPERTIES: NormalizedElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};
```

### 2.3 Create Utility Functions

**New normalization utilities (for display only):**

```typescript
// src/utils/elemental/normalization.ts

/**
 * Normalize raw elemental properties to percentages (0.0-1.0)
 * Used ONLY for display/UI purposes, NOT for calculations
 */
export function normalizeForDisplay(
  properties: RawElementalProperties,
): NormalizedElementalProperties {
  const total =
    properties.Fire + properties.Water + properties.Earth + properties.Air;

  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: properties.Fire / total,
    Water: properties.Water / total,
    Earth: properties.Earth / total,
    Air: properties.Air / total,
  };
}

/**
 * Get total elemental intensity (sum of all elements)
 */
export function getTotalIntensity(properties: RawElementalProperties): number {
  return properties.Fire + properties.Water + properties.Earth + properties.Air;
}

/**
 * Get dominant element by absolute value (not percentage)
 */
export function getDominantElementByIntensity(
  properties: RawElementalProperties,
): Element {
  const entries = Object.entries(properties) as [Element, number][];
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}
```

---

## Phase 3: Remove Normalization from Calculations (Week 3)

### 3.1 Core Aggregation Functions

**File: `src/utils/hierarchicalRecipeCalculations.ts`**

```typescript
// BEFORE (Line 207-208)
return normalizeElementalProperties(totals);

// AFTER
return totals; // Return raw aggregated values
```

**Changes:**

- `aggregateIngredientElementals()` - Remove normalization, return raw totals
- `applyCookingMethodTransforms()` - Remove re-normalization after each method
- `computeRecipeProperties()` - Return raw elemental values

### 3.2 Ingredient Calculations

**File: `src/utils/elementalUtils.ts`**

```typescript
// BEFORE (Line 182-187)
return normalizeProperties({
  Fire: totals.Fire / totalAmount,
  Water: totals.Water / totalAmount,
  Earth: totals.Earth / totalAmount,
  Air: totals.Air / totalAmount,
});

// AFTER
// Return raw weighted averages (already divided by totalAmount)
return {
  Fire: totals.Fire / totalAmount,
  Water: totals.Water / totalAmount,
  Earth: totals.Earth / totalAmount,
  Air: totals.Air / totalAmount,
};
// Note: This is already a weighted average, no need to normalize further
```

### 3.3 Cooking Method Transformations

**File: `src/utils/hierarchicalRecipeCalculations.ts` (Line 246-247)**

```typescript
// BEFORE
current = normalizeElementalProperties(current);

// AFTER
// Remove normalization - transformations should preserve absolute values
// Current values are already raw, just apply multiplicative modifiers
```

**Key Insight**: Cooking methods multiply values (e.g., `Fire: 1.4`), so raw values will scale correctly without normalization.

---

## Phase 4: Update Thermodynamic Calculations (Week 4)

### 4.1 Formula Adjustments

**File: `src/data/unified/alchemicalCalculations.ts`**

**Current formulas work with any positive values**, but we should verify:

```typescript
// Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
// This formula already handles values > 1.0 correctly
// No changes needed - it's a ratio formula

// However, we should add validation for edge cases:
function calculateThermodynamics(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties, // Now RawElementalProperties
): ThermodynamicMetrics {
  // Validate no negative values
  const { Fire, Water, Earth, Air } = elementalProps;
  if (Fire < 0 || Water < 0 || Earth < 0 || Air < 0) {
    throw new Error("Elemental properties cannot be negative");
  }

  // Formulas remain the same - they're ratios, not normalized
  // ... existing calculation logic
}
```

### 4.2 Quantity Scaling Adjustments

**File: `src/utils/hierarchicalRecipeCalculations.ts`**

**Current scaling factor (0.0-1.0) may need adjustment:**

```typescript
// BEFORE: Scaling factor caps at 1.0
const scalingFactor = calculateQuantityScalingFactor(quantityInGrams); // 0-1

// OPTION 1: Keep scaling factor (0-1) but understand it as intensity multiplier
// Recipe with 500g of chili: Fire = baseFire * 0.95 (not capped)

// OPTION 2: Remove scaling factor ceiling for very large quantities
// If quantity > 1000g, allow scalingFactor > 1.0

// RECOMMENDED: Option 1 (keep 0-1 scaling) but document that base values
// should reflect true ingredient intensity, not normalized percentages
```

---

## Phase 5: Migration Strategy (Week 5)

### 5.1 Backwards Compatibility Layer

**Create compatibility wrapper:**

```typescript
// src/utils/elemental/compatibility.ts

/**
 * Backwards compatibility: Convert old normalized data to raw values
 *
 * If we detect values sum to ~1.0 and all are 0.0-1.0, assume it's normalized
 * and convert to raw by scaling by a reference intensity
 */
export function convertNormalizedToRaw(
  properties: ElementalProperties,
  referenceIntensity = 4.0, // Default reference
): RawElementalProperties {
  const sum =
    properties.Fire + properties.Water + properties.Earth + properties.Air;

  // If sum ≈ 1.0, assume normalized and convert
  if (Math.abs(sum - 1.0) < 0.01) {
    return {
      Fire: properties.Fire * referenceIntensity,
      Water: properties.Water * referenceIntensity,
      Earth: properties.Earth * referenceIntensity,
      Air: properties.Air * referenceIntensity,
    };
  }

  // Otherwise, assume already raw
  return properties;
}
```

### 5.2 Data Migration Script

**Create migration utility:**

```typescript
// scripts/migrateElementalProperties.ts

/**
 * Migrate existing normalized elemental properties to raw values
 *
 * Strategy:
 * 1. Scan all ingredient/recipe data files
 * 2. Detect normalized properties (sum ≈ 1.0, all values 0.0-1.0)
 * 3. Convert to raw using reference intensities based on:
 *    - Ingredient type (spices = higher intensity)
 *    - Recipe complexity (more ingredients = higher total)
 *    - Historical usage patterns
 */
```

### 5.3 Feature Flags

**Implement gradual rollout:**

```typescript
// src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  USE_RAW_ELEMENTAL_VALUES: process.env.NEXT_PUBLIC_RAW_ELEMENTALS === "true",
  // Default to false during migration, then enable
};
```

---

## Phase 6: Testing & Validation (Week 6)

### 6.1 Unit Tests

**Test raw value calculations:**

```typescript
// __tests__/elemental/rawValues.test.ts

describe("Raw Elemental Values", () => {
  test("aggregateIngredientElementals returns raw totals", () => {
    const ingredients = [
      {
        elementalProperties: { Fire: 2.0, Water: 0.5, Earth: 0.3, Air: 0.2 },
        amount: 100,
      },
      {
        elementalProperties: { Fire: 1.5, Water: 1.0, Earth: 0.8, Air: 0.5 },
        amount: 200,
      },
    ];

    const result = aggregateIngredientElementals(ingredients);

    // Should NOT sum to 1.0
    const total = result.Fire + result.Water + result.Earth + result.Air;
    expect(total).toBeGreaterThan(1.0);

    // Fire should be dominant (highest absolute value)
    expect(result.Fire).toBeGreaterThan(result.Water);
  });

  test("cooking methods scale raw values correctly", () => {
    const base = { Fire: 3.0, Water: 2.0, Earth: 1.5, Air: 1.0 };
    const result = applyCookingMethodTransforms(base, ["grilling"]);

    // Grilling: Fire: 1.4x multiplier
    expect(result.Fire).toBeCloseTo(3.0 * 1.4, 2);
    // Should NOT be normalized
    expect(
      result.Fire + result.Water + result.Earth + result.Air,
    ).toBeGreaterThan(1.0);
  });
});
```

### 6.2 Integration Tests

**Test thermodynamic calculations with raw values:**

```typescript
// __tests__/thermodynamic/rawElementals.test.ts

describe("Thermodynamic with Raw Elementals", () => {
  test("formulas handle values > 1.0", () => {
    const alchemical = { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 };
    const elemental = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };

    const metrics = calculateThermodynamicMetrics(alchemical, elemental);

    // Heat calculation should work correctly
    expect(metrics.heat).toBeGreaterThan(0);
    expect(metrics.heat).toBeLessThan(Infinity);

    // Compare with normalized version
    const normalized = normalizeForDisplay(elemental);
    const normalizedMetrics = calculateThermodynamicMetrics(
      alchemical,
      normalized,
    );

    // Results should be different (demonstrating information preservation)
    expect(metrics.heat).not.toBeCloseTo(normalizedMetrics.heat);
  });
});
```

### 6.3 Regression Tests

**Ensure existing functionality still works:**

```typescript
// __tests__/regression/elementalCalculations.test.ts

describe("Regression: Elemental Calculations", () => {
  test("dominant element detection works with raw values", () => {
    const properties = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
    const dominant = getDominantElement(properties);
    expect(dominant).toBe("Fire");
  });

  test("compatibility calculations work with raw values", () => {
    const props1 = { Fire: 5.0, Water: 2.0, Earth: 1.0, Air: 1.0 };
    const props2 = { Fire: 4.5, Water: 2.5, Earth: 1.5, Air: 1.5 };

    // Compatibility should be based on ratios, not absolute values
    const compatibility = calculateElementalCompatibility(props1, props2);
    expect(compatibility).toBeGreaterThan(0.7);
  });
});
```

---

## Phase 7: Documentation & Communication (Week 7)

### 7.1 Update Documentation

**Files to update:**

- `docs/guides/elemental-fundamental-quantities.md` - Remove normalization sections
- `docs/guides/elemental-systems-guide.md` - Update calculation examples
- `docs/getting-started/architecture-guide.md` - Explain raw values
- Add new guide: `docs/guides/raw-elemental-values.md`

### 7.2 Code Comments

**Update function documentation:**

```typescript
/**
 * Aggregate elemental properties from multiple ingredients
 *
 * Returns RAW elemental values (not normalized).
 * Values represent actual calculated intensity and can exceed 1.0.
 *
 * @param ingredients - List of recipe ingredients with quantities
 * @returns Raw aggregated elemental properties (sum may be > 1.0)
 */
export function aggregateIngredientElementals(
  ingredients: RecipeIngredient[],
): ElementalProperties {
  // RawElementalProperties
  // ... implementation
}
```

---

## Phase 8: Rollout Plan (Week 8)

### 8.1 Staged Rollout

**Week 8.1: Internal Testing**

- Enable feature flag for dev environment only
- Run full test suite
- Manual testing of recipe calculations

**Week 8.2: Beta Testing**

- Enable for beta users
- Monitor calculation differences
- Collect feedback on recipe recommendations

**Week 8.3: Gradual Production Rollout**

- Enable for 10% of users
- Monitor for 3 days
- Increase to 50%, then 100%

### 8.2 Monitoring

**Key Metrics:**

- Recipe recommendation quality (A/B test)
- Calculation performance (should be same or faster)
- Error rates (should decrease - no normalization edge cases)
- User engagement with recommendations

---

## Implementation Checklist

### Core Changes

- [ ] Update type definitions (`ElementalProperties` → `RawElementalProperties`)
- [ ] Update default values (`ZERO_ELEMENTAL_PROPERTIES`)
- [ ] Create normalization utilities (for display only)
- [ ] Remove normalization from `aggregateIngredientElementals()`
- [ ] Remove normalization from `applyCookingMethodTransforms()`
- [ ] Remove normalization from `computeRecipeProperties()`
- [ ] Update `calculateElementalStateFromIngredients()`
- [ ] Update thermodynamic calculation validation

### Utilities

- [ ] Create `normalizeForDisplay()` function
- [ ] Create `getTotalIntensity()` function
- [ ] Create `getDominantElementByIntensity()` function
- [ ] Create backwards compatibility layer
- [ ] Create data migration script

### Testing

- [ ] Unit tests for raw value calculations
- [ ] Integration tests for thermodynamic formulas
- [ ] Regression tests for existing functionality
- [ ] Performance benchmarks
- [ ] A/B testing framework

### Documentation

- [ ] Update elemental quantities guide
- [ ] Update calculation examples
- [ ] Add raw values migration guide
- [ ] Update API documentation
- [ ] Add code comments

### Deployment

- [ ] Feature flag implementation
- [ ] Migration script testing
- [ ] Staged rollout plan
- [ ] Monitoring dashboard
- [ ] Rollback plan

---

## Risk Mitigation

### Risk 1: Breaking Changes

**Mitigation**: Backwards compatibility layer, feature flags, gradual rollout

### Risk 2: Calculation Instability

**Mitigation**: Extensive testing, validation in thermodynamic formulas

### Risk 3: Data Migration Issues

**Mitigation**: Careful detection logic, reference intensity calibration

### Risk 4: Performance Impact

**Mitigation**: Benchmarking, remove normalization overhead should improve performance

---

## Success Criteria

1. ✅ All elemental calculations return raw (non-normalized) values
2. ✅ Thermodynamic formulas work correctly with values > 1.0
3. ✅ Recipe recommendations maintain or improve quality
4. ✅ No performance degradation
5. ✅ Backwards compatibility maintained during transition
6. ✅ Full test coverage for raw value calculations
7. ✅ Documentation updated and accurate

---

## Timeline Summary

- **Week 1**: Analysis & Documentation
- **Week 2**: Core System Changes
- **Week 3**: Remove Normalization from Calculations
- **Week 4**: Update Thermodynamic Calculations
- **Week 5**: Migration Strategy
- **Week 6**: Testing & Validation
- **Week 7**: Documentation & Communication
- **Week 8**: Rollout Plan

**Total Duration**: 8 weeks

---

## Next Steps

1. Review and approve this plan
2. Create initial TODO list from checklist
3. Begin Phase 1 analysis
4. Set up feature flags infrastructure
5. Create test suite framework

---

_For questions or clarifications, refer to the elemental system documentation or create an issue for discussion._

# Ingredient Elemental Properties Enhancement Strategy

**Date:** October 2, 2025
**Goal:** Ensure all 500+ ingredients have robust, scientifically-grounded elemental properties

## Current State Analysis

### Issues Identified

1. **Normalization Problems**
   - Some ingredients have elemental properties that sum to > 1.0 (e.g., 1.10)
   - Should always sum to exactly 1.0 for proper weighting

2. **Incomplete Coverage**
   - Need to audit all 61 ingredient files
   - Ensure every ingredient has meaningful elemental properties

3. **Consistency Needed**
   - Elemental assignments should follow clear culinary/alchemical principles
   - Similar ingredients should have similar elemental patterns

## Enhancement Principles

### Elemental Assignment Guidelines

**Fire (Heat, Intensity, Stimulation)**

- High: Chili peppers (0.7-0.9), ginger (0.5-0.6), black pepper (0.5-0.7)
- Medium: Garlic (0.3-0.4), onions (0.2-0.3), mustard (0.4-0.5)
- Low: Lettuce (0.05-0.1), cucumber (0.05), yogurt (0.1)

**Water (Cooling, Fluidity, Moisture)**

- High: Cucumber (0.8-0.9), watermelon (0.9), coconut water (0.9)
- Medium: Tomatoes (0.5-0.6), citrus (0.4-0.5), yogurt (0.5-0.6)
- Low: Dried spices (0.05-0.1), nuts (0.1), grains (0.1-0.2)

**Earth (Grounding, Substance, Heaviness)**

- High: Root vegetables (0.6-0.8), potatoes (0.7), grains (0.6-0.7)
- Medium: Legumes (0.4-0.5), nuts (0.5-0.6), cheese (0.4-0.5)
- Low: Leafy greens (0.1-0.2), herbs (0.1-0.2), citrus (0.1)

**Air (Lightness, Aromatic, Volatile)**

- High: Fresh herbs (0.6-0.8), citrus zest (0.6-0.7), fennel (0.5-0.6)
- Medium: Aromatic vegetables (0.3-0.4), fermented foods (0.3-0.4)
- Low: Root vegetables (0.1-0.2), heavy proteins (0.1), dense grains (0.1)

### Normalization Rules

1. **Sum Must Equal 1.0**

   ```typescript
   const sum = Fire + Water + Earth + Air;
   if (sum !== 1.0) {
     // Normalize each value
     Fire = Fire / sum;
     Water = Water / sum;
     Earth = Earth / sum;
     Air = Air / sum;
   }
   ```

2. **Minimum Values**
   - Each element should be at least 0.05 (5%)
   - No element should be 0.0 (everything has trace amounts)

3. **Precision**
   - Round to 2 decimal places for readability
   - Ensure sum still equals 1.0 after rounding

## Category-Specific Patterns

### Herbs & Spices

**Fresh Herbs:**

- Primary: Air (0.4-0.6) - aromatic, volatile
- Secondary: Water (0.2-0.3) - fresh, cooling
- Tertiary: Fire or Earth (0.1-0.2)
- Example: Basil = { Air: 0.5, Water: 0.3, Fire: 0.1, Earth: 0.1 }

**Dried Herbs:**

- Primary: Air (0.4-0.5) - concentrated aroma
- Secondary: Earth (0.2-0.3) - dried, grounded
- Tertiary: Fire (0.1-0.2) - intensity
- Example: Dried Oregano = { Air: 0.45, Earth: 0.25, Fire: 0.15, Water: 0.15 }

**Hot Spices:**

- Primary: Fire (0.5-0.7) - heat dominant
- Secondary: Air (0.1-0.3) - aromatic
- Tertiary: Earth (0.1-0.2) - grounding
- Example: Cayenne = { Fire: 0.65, Air: 0.2, Earth: 0.1, Water: 0.05 }

### Vegetables

**Leafy Greens:**

- Primary: Air (0.4-0.5) - light, airy
- Secondary: Water (0.3-0.4) - moisture
- Tertiary: Earth (0.1-0.2) - minimal substance
- Example: Spinach = { Air: 0.45, Water: 0.35, Earth: 0.15, Fire: 0.05 }

**Root Vegetables:**

- Primary: Earth (0.5-0.7) - grounding, dense
- Secondary: Water (0.2-0.3) - moisture content
- Tertiary: Air or Fire (0.05-0.1)
- Example: Potato = { Earth: 0.6, Water: 0.25, Air: 0.1, Fire: 0.05 }

**Alliums (Onion family):**

- Primary: Fire (0.3-0.4) - pungency
- Secondary: Air (0.25-0.35) - aromatics
- Secondary: Water (0.2-0.3) - moisture
- Example: Garlic = { Fire: 0.35, Air: 0.3, Water: 0.25, Earth: 0.1 }

### Proteins

**Red Meat:**

- Primary: Fire (0.4-0.5) - warming energy
- Secondary: Earth (0.3-0.4) - dense, grounding
- Tertiary: Water (0.1-0.2)
- Example: Beef = { Fire: 0.45, Earth: 0.35, Water: 0.15, Air: 0.05 }

**Poultry:**

- Primary: Earth (0.35-0.45) - substance
- Secondary: Fire (0.2-0.3) - warming
- Secondary: Water (0.2-0.3) - moisture
- Example: Chicken = { Earth: 0.4, Fire: 0.25, Water: 0.25, Air: 0.1 }

**Fish/Seafood:**

- Primary: Water (0.5-0.6) - aquatic nature
- Secondary: Earth (0.2-0.3) - substance
- Tertiary: Air or Fire (0.1-0.15)
- Example: Salmon = { Water: 0.5, Earth: 0.25, Fire: 0.15, Air: 0.1 }

### Grains

**Whole Grains:**

- Primary: Earth (0.5-0.6) - grounding, sustaining
- Secondary: Air (0.2-0.3) - lightness when cooked
- Tertiary: Water (0.1-0.2)
- Example: Brown Rice = { Earth: 0.55, Air: 0.25, Water: 0.15, Fire: 0.05 }

**Refined Grains:**

- Primary: Earth (0.4-0.5) - lighter than whole
- Secondary: Air (0.3-0.4) - more airy
- Tertiary: Water (0.1-0.2)
- Example: White Rice = { Earth: 0.45, Air: 0.35, Water: 0.15, Fire: 0.05 }

### Fruits

**Citrus:**

- Primary: Air (0.4-0.5) - aromatic, uplifting
- Secondary: Water (0.3-0.4) - juicy
- Tertiary: Fire (0.1-0.2) - zesty
- Example: Lemon = { Air: 0.45, Water: 0.35, Fire: 0.15, Earth: 0.05 }

**Melons:**

- Primary: Water (0.7-0.8) - extremely hydrating
- Secondary: Air (0.1-0.2) - light
- Tertiary: Earth (0.05-0.1)
- Example: Watermelon = { Water: 0.75, Air: 0.15, Earth: 0.05, Fire: 0.05 }

**Berries:**

- Primary: Water (0.4-0.5) - juicy
- Secondary: Air (0.3-0.4) - delicate
- Tertiary: Fire (0.1-0.2) - tangy
- Example: Strawberry = { Water: 0.45, Air: 0.35, Fire: 0.15, Earth: 0.05 }

## Implementation Strategy

### Phase 1: Automated Normalization (High Priority)

Create a script to:

1. Parse all ingredient files
2. Extract elemental properties
3. Check if sum = 1.0 (tolerance ±0.01)
4. Auto-normalize if needed
5. Generate report of changes

**Tool:** `scripts/normalizeElementalProperties.ts`

### Phase 2: Category Review (Medium Priority)

Systematically review each category:

1. **Spices** (10 files) - Check hot vs. aromatic balance
2. **Herbs** (6 files) - Fresh vs. dried distinction
3. **Vegetables** (10 files) - Root vs. leaf vs. allium patterns
4. **Proteins** (7 files) - Meat vs. fish vs. plant-based
5. **Grains** (5 files) - Whole vs. refined
6. **Fruits** (6 files) - Citrus vs. berries vs. melons vs. stone
7. **Oils** (2 files) - Heating vs. finishing oils
8. **Others** (15 files) - Vinegars, seasonings, etc.

### Phase 3: Missing Properties (Low Priority)

Ensure all ingredients have:

- ✅ Elemental properties (normalized)
- ✅ Astrological profile (if relevant)
- ✅ Qualities array
- ✅ Category and subCategory
- ✅ Seasonal affinity

## Quality Assurance

### Validation Checks

1. **Normalization Test**

   ```typescript
   expect(Fire + Water + Earth + Air).toBeCloseTo(1.0, 2);
   ```

2. **Range Test**

   ```typescript
   expect(Fire).toBeGreaterThanOrEqual(0.05);
   expect(Fire).toBeLessThanOrEqual(0.95);
   // Same for all elements
   ```

3. **Pattern Consistency**
   ```typescript
   // All hot spices should have Fire > 0.4
   // All leafy greens should have Air > 0.3
   // All root vegetables should have Earth > 0.4
   ```

### Sample Validation Script

```typescript
import { validateIngredientElementals } from "@/utils/ingredientValidation";

const results = validateIngredientElementals({
  checkNormalization: true,
  checkPatterns: true,
  checkMissing: true,
});

console.log(`✅ Valid: ${results.valid}`);
console.log(`⚠️ Warnings: ${results.warnings.length}`);
console.log(`❌ Errors: ${results.errors.length}`);
```

## Example Enhancements

### Before (Incorrect)

```typescript
basil: {
  elementalProperties: { Air: 0.4, Water: 0.4, Earth: 0.2, Fire: 0.1 }, // Sum = 1.1
  // ...
}
```

### After (Corrected)

```typescript
basil: {
  elementalProperties: {
    Air: 0.36,    // 0.4/1.1 = 0.364 ≈ 0.36
    Water: 0.36,  // 0.4/1.1 = 0.364 ≈ 0.36
    Earth: 0.18,  // 0.2/1.1 = 0.182 ≈ 0.18
    Fire: 0.10    // 0.1/1.1 = 0.091 ≈ 0.10
  }, // Sum = 1.00
  // ...
}
```

## Success Metrics

- [ ] 100% of ingredients have elemental properties
- [ ] 100% of elemental properties sum to 1.0 (±0.01)
- [ ] 90%+ match category-specific patterns
- [ ] Zero ingredients with any element = 0.0
- [ ] All ingredients have minimum 0.05 per element
- [ ] Consistent patterns within categories

## Timeline

1. **Week 1:** Create normalization script and run
2. **Week 2:** Category-by-category review (spices, herbs)
3. **Week 3:** Category review (vegetables, proteins)
4. **Week 4:** Final validation and documentation

## Tools Needed

1. `scripts/normalizeElementalProperties.ts` - Auto-normalize
2. `scripts/validateIngredientElementals.ts` - Validation checks
3. `scripts/generateElementalReport.ts` - Generate statistics
4. `utils/ingredientValidation.ts` - Validation utilities

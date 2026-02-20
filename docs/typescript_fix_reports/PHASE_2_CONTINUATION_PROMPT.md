# Phase 2: Data Enhancement - Ingredient Quantity Mapping Implementation

## Current State Recap

**Phase 1 Complete ✅**: Scaling engine successfully implemented with:

- ✅ `QuantityScaledProperties` interface added to `src/types/alchemy.ts`
- ✅ Optional `scaledProperties` field added to `RecipeIngredient` interface
- ✅ Complete scaling engine in `src/utils/quantityScaling.ts` with logarithmic
  scaling, harmony enforcement, and kinetics integration
- ✅ Comprehensive unit tests in `src/utils/__tests__/quantityScaling.test.ts`
- ✅ Backup created at `src/data/ingredients_backup`
- ⚠️ Syntax errors in `proteins/seafood.ts` identified (deferred to Phase 2)

**Key Scaling Features Ready:**

- Non-linear logarithmic scaling (0.1-2.0 factor range)
- "Like reinforces like" elemental enhancement
- ESMS alchemical property derivation and scaling
- Kinetics integration (force adjustment, thermal shift)
- Harmony enforcement (sum normalization to ~1.0)
- Comprehensive validation and batch processing

## Phase 2 Objectives

Apply quantity-aware scaling to ingredient data files through systematic batch
processing, enabling dynamic recipe recommendations that account for ingredient
quantities.

### Success Metrics

- ✅ 100% of high-priority ingredients (proteins, fruits) have quantity metadata
- ✅ All scaled properties computed and validated for harmony
- ✅ Elemental sums validated (0.95-1.05 range)
- ✅ No TypeScript errors in processed ingredient files
- ✅ Ready for Phase 3 algorithm integration
- Target: 20-30% improvement in recommendation accuracy via quantity scaling

## Step-by-Step Implementation Plan

### Preparation (Pre-Phase Validation)

1. **Validate Scaling Engine**: Run scaling engine tests

   ```bash
   yarn test --testPathPattern=quantityScaling.test.ts
   ```

2. **Check Current State**: Verify Phase 1 files are intact

   ```bash
   ls -la src/utils/quantityScaling.ts src/utils/__tests__/quantityScaling.test.ts
   grep -n "QuantityScaledProperties" src/types/alchemy.ts
   ```

3. **Create Working Branch**: Ensure clean git state
   ```bash
   git status
   git checkout -b phase-2-quantity-data-enhancement
   ```

### Batch 1: High-Priority Ingredients (Proteins & Fruits)

#### Step 1: Fix seafood.ts Syntax Errors

**Objective**: Clean up structural corruption in proteins/seafood.ts before
adding quantity data

**Tools to Use:**

- `read_file` to identify corruption patterns
- `search_replace` for systematic fixes
- `grep` to validate fixes

**Approach:**

1. Identify broken object structures (missing braces, extra comments, malformed
   properties)
2. Fix syntax errors systematically
3. Validate with
   `yarn tsc --noEmit --skipLibCheck src/data/ingredients/proteins/seafood.ts`
4. Ensure file exports correctly

**Estimated Time**: 2-3 hours (structural fixes only)

#### Step 2: Add Quantity Metadata to Proteins

**Files**: `src/data/ingredients/proteins/seafood.ts`,
`src/data/ingredients/proteins/meat.ts`,
`src/data/ingredients/proteins/poultry.ts`

**For Each Ingredient Object:**

1. Add `quantityBase: { amount: number, unit: string }`
   - Use realistic serving sizes (e.g., salmon: 170g, chicken breast: 150g,
     shrimp: 100g)
   - Choose appropriate units (g, ml, pieces, etc.)

2. Compute and add `scaledElemental` using scaling functions
3. Derive and add alchemical properties (ESMS)
4. Add kinetics impact (thermalDirection, forceMagnitude)

**Example Addition:**

```typescript
// Before
elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 }

// After
elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
quantityBase: { amount: 170, unit: 'g' },
scaledElemental: { Water: 0.58, Earth: 0.21, Fire: 0.11, Air: 0.10 }, // Computed
alchemicalProperties: { Spirit: 0.105, Essence: 0.395, Matter: 0.21, Substance: 0.105 }, // Derived
kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 1.05 } // Computed
```

#### Step 3: Process Fruits Category

**Files**: All files in `src/data/ingredients/fruits/`

**For Each Fruit:**

1. Add quantity metadata (typical serving sizes)
2. Compute scaled properties
3. Validate harmony (elemental sums should be ~1.0)

**Special Considerations:**

- Fruits often have higher Water content
- Consider ripeness affecting elemental balance
- Smaller serving sizes (apples: 150g, berries: 100g)

#### Step 4: Validation & Harmony Pass

**Tools**: Custom validation script or manual checks

**Validation Steps:**

1. **Elemental Sum Check**: Ensure all scaled properties sum to 0.95-1.05

   ```bash
   grep -A 5 "scaledElemental" src/data/ingredients/proteins/* | head -20
   ```

2. **Harmony Verification**: Run validation function

   ```bash
   node -e "
   const { validateScalingIntegrity } = require('./src/utils/quantityScaling.ts');
   // Test sample scaled properties
   "
   ```

3. **Consistency Check**: Verify quantity units are appropriate
   ```bash
   grep "unit:" src/data/ingredients/proteins/* | sort | uniq -c
   ```

### Batch 2: Remaining Ingredient Categories

#### Step 5: Process Vegetables Category

**Files**: All subdirectories in `src/data/ingredients/vegetables/`

**Special Considerations:**

- Leafy greens: Small quantities, high Air/Water content
- Root vegetables: Higher Earth content, variable sizes
- Nightshades: Often Fire-dominant

#### Step 6: Process Herbs & Spices

**Files**: `src/data/ingredients/herbs/`, `src/data/ingredients/spices/`

**Special Considerations:**

- Very small quantities (teaspoons, pinches)
- High elemental intensity despite small amounts
- Spices often extremely Fire/Air dominant

#### Step 7: Process Grains, Dairy, Oils

**Files**: `grains/`, `proteins/dairy.ts`, `oils/`

**Special Considerations:**

- Volume vs weight conversions (oils: ml vs g)
- Dairy: Temperature affects elemental properties
- Grains: Cooking method affects final properties

### Automation & Quality Assurance

#### Step 8: Create Enhancement Script (Optional)

**Objective**: Semi-automate the quantity addition process

**Script Features:**

- Read existing ingredient data
- Prompt for realistic quantity values
- Auto-compute scaled properties using scaling engine
- Validate harmony before writing
- Batch process multiple files

**Location**: `scripts/enhance-ingredients-with-quantities.js`

#### Step 9: Final Validation Suite

**Comprehensive Testing:**

1. **Harmony Validation**:

   ```bash
   # Check all elemental sums are close to 1.0
   node scripts/validate-ingredient-harmony.js
   ```

2. **Quantity Distribution Analysis**:

   ```bash
   # Analyze quantity ranges by category
   node scripts/analyze-quantity-distribution.js
   ```

3. **Scaling Factor Analysis**:

   ```bash
   # Ensure scaling factors are reasonable
   node scripts/validate-scaling-factors.js
   ```

4. **TypeScript Validation**:
   ```bash
   yarn tsc --noEmit --skipLibCheck src/data/ingredients/**/*.ts
   ```

## Risk Mitigation

### Data Loss Prevention

- ✅ Phase 1 backup already created
- Create additional backup before Batch 1:
  `cp -r src/data/ingredients src/data/ingredients_pre_phase2`
- Git commit after each batch completion

### Quality Assurance

- Manual review of first 5 ingredients in each category
- Automated validation scripts for harmony checking
- TypeScript compilation checks after each batch

### Rollback Plan

- Git branches for each batch
- Script to remove quantity metadata if needed
- Backup restoration capability

## Expected Outcomes

### Functional Improvements

- **Recommendation Accuracy**: 20-30% improvement via quantity-aware scaling
- **Dynamic Recipes**: Ingredients scale appropriately based on amounts
- **Harmony Preservation**: All elemental balances maintained despite scaling

### Data Quality

- **Complete Coverage**: All major ingredients have quantity metadata
- **Validated Integrity**: All scaled properties pass harmony checks
- **Type Safety**: Full TypeScript compliance in ingredient files

### Development Readiness

- **Phase 3 Ready**: Algorithm integration can begin immediately
- **Testing Framework**: Validation scripts available for ongoing quality
  assurance
- **Documentation**: Enhanced codebase with quantity-aware capabilities

## Timeline & Milestones

### Week 1: Core Batch Processing

- Day 1-2: Fix seafood.ts syntax, process proteins
- Day 3-4: Process fruits, validate Batch 1
- Day 5: Quality assurance, git commit

### Week 2: Extended Categories

- Day 6-8: Process vegetables, herbs, spices
- Day 9-10: Process remaining categories (grains, dairy, oils)
- Day 11: Final validation suite

### Week 3: Quality Assurance & Optimization

- Day 12-13: Comprehensive testing, performance optimization
- Day 14-15: Documentation updates, Phase 3 preparation

**Total Estimated Time**: 2-3 weeks for complete Phase 2 execution

## Phase 3 Preview

Once Phase 2 completes, Phase 3 will:

- Update `IngredientService.ts` to use scaled properties
- Modify recommendation algorithms for quantity-aware calculations
- Integrate kinetics impact into recipe scoring
- Add user interface for quantity input
- Test end-to-end recommendation improvements

## Success Criteria

**Minimum Viable Product (MVP)**:

- Proteins and fruits have quantity metadata
- Scaling engine integrates correctly
- Basic harmony validation passes
- No TypeScript errors in processed files

**Full Success**:

- All ingredient categories processed
- Comprehensive validation suite passes
- 20%+ recommendation accuracy improvement
- Ready for Phase 3 algorithm integration

## Start Phase 2 Execution

Begin with Step 1: Fix seafood.ts syntax errors, then proceed systematically
through each ingredient category. Use the scaling engine functions to ensure
mathematical accuracy and harmony preservation.

**Ready to proceed with Phase 2 implementation?**

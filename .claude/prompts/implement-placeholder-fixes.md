# Comprehensive Placeholder Replacement Implementation Plan

## Context

This WhatToEatNext codebase has accumulated placeholder/default values during rapid development. An audit revealed 7 major categories of incomplete implementations that need proper functionality. This prompt guides the systematic replacement of these placeholders with real, working code.

## Critical Project Principles (from CLAUDE.md)

**MUST FOLLOW**:
- **NEVER use lazy fixes or placeholder functionality**
- **Always use existing codebase functionality**
- **Follow hierarchical data architecture**:
  - Tier 1 (Ingredients): Elemental properties ONLY
  - Tier 2 (Recipes): Computed alchemical properties from planetary positions
  - Tier 3 (Cuisines): Aggregated statistical properties
- **ESMS calculation**: ONLY from `calculateAlchemicalFromPlanets()` in `src/utils/planetaryAlchemyMapping.ts`
- **No opposing elements**: Fire doesn't oppose Water, elements reinforce themselves
- **Casing conventions**: Elements/Planets capitalized, zodiac lowercase

**Key Architecture Files**:
- `src/utils/planetaryAlchemyMapping.ts` - ESMS authority
- `src/utils/hierarchicalRecipeCalculations.ts` - Recipe computation
- `src/utils/cuisineAggregations.ts` - Statistical signatures
- `src/types/celestial.ts` - Core type definitions

## Implementation Plan

Work through phases sequentially. Each phase builds on the previous. Run `make check` and `make build` after each major change.

---

## PHASE 1: Critical Functionality (IMMEDIATE)

### 1.1 Fix Recipe Elemental Aggregation

**File**: `src/utils/hierarchicalRecipeCalculations.ts:185`

**Problem**: Returns balanced default instead of aggregating ingredient elementals
```typescript
return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
```

**Solution**:
1. Read the function context around line 185
2. Implement proper aggregation:
   - Get elemental properties from each ingredient
   - Weight by ingredient amount/prominence
   - Normalize the sum to 1.0
3. Use existing functions from `src/utils/elemental/core.ts` for normalization
4. Fall back to balanced only if NO ingredients have properties

**Test**: Verify recipe calculations use actual ingredient data

---

### 1.2 Fix Ingredient Harmony Calculation

**File**: `src/services/IngredientService.ts:576`

**Problem**:
```typescript
const overallHarmony = 0.8; // Placeholder
// Flavor profile (simplified)
const flavorProfile: { [key: string]: number } = {
  sweet: 0.2, sour: 0.1, salty: 0.3, bitter: 0.1, umami: 0.3,
};
```

**Solution**:
1. Read the function signature to understand what it returns
2. Calculate actual harmony from:
   - Elemental compatibility of ingredients
   - Flavor profile similarity
   - Thermodynamic balance if available
3. Use `calculateElementalCompatibility()` from elemental/core.ts
4. Calculate flavor profile from actual ingredient flavor data
5. Use weighted average for overall harmony

**Test**: Verify different ingredient combinations produce different harmony scores

---

### 1.3 Implement Astrological Service API Integration

**File**: `src/services/AstrologicalService.ts:324-334`

**Problem**:
```typescript
// TODO: Integrate with actual astrologize/alchemize API result cache or state management
// For now, return a minimal valid state as a placeholder
const astrologicalData = {
  planetaryPositions: DefaultPlanetaryPositions,
  zodiacSign: "aries" as StandardZodiacSign,
  lunarPhase: "new moon" as StandardLunarPhase,
  elementalInfluence: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
```

**Solution**:
1. Check if there's an API cache/state system already implemented
2. Look for existing astrologize API calls in `src/app/api/astrologize/route.ts`
3. Integrate with existing `AstrologizeApiCache` from `src/services/AstrologizeApiCache.ts`
4. Use real-time data from cache, fall back to API call if stale
5. Only use defaults if API is completely unavailable

**Test**: Verify service returns current astrological data, not static defaults

---

### 1.4 Complete or Remove Stub Services

**Files**: Multiple stub implementations:
- `src/services/EnhancedRecommendationService.ts:4`
- `src/services/RecipeElementalService.ts:4`
- `src/services/ConsolidatedRecipeService.ts:4`
- `src/services/ConsolidatedIngredientService.ts:4`
- `src/services/ElementalRecommendationService.ts:4, 22`

**Solution**:
1. **For each stub service**:
   - Search codebase for imports/usage
   - If heavily used: Implement proper functionality
   - If lightly used: Check if functionality exists elsewhere, redirect
   - If unused: Remove completely

2. **If implementing**:
   - Review similar non-stub services for patterns
   - Use existing calculation utilities
   - Follow the hierarchical data architecture

3. **If removing**:
   - Check all imports with `grep -r "ServiceName"`
   - Update/remove import statements
   - Ensure no runtime breakage

**Test**: Run full build and test suite after changes

---

## PHASE 2: Harmony & Scoring (HIGH PRIORITY)

### 2.1 Replace Hardcoded Harmony Values

**Files with hardcoded scores**:
- `src/calculations/culinary/recipeMatching.ts:28` - `temporalScore = 0.8`
- `src/services/RecommendationAnalyticsService.ts:177` - `elementalHarmony ?? 0.8`
- `src/services/PlanetaryAgentsAdapter.ts:447` - `harmony: 0.75`
- `src/hooks/useEnhancedRecommendations.ts:133, 175` - `harmony: 0.75`
- `src/services/CulturalAnalyticsService.ts:680, 696, 701` - values 0.7, 0.8
- `src/data/unified/recipeBuilding.ts:2155` - `zodiacHarmony = sign ? 0.85 : 0.7`

**Solution for each**:
1. **Temporal Score** (recipeMatching.ts:28):
   - Calculate from seasonal alignment
   - Use lunar phase compatibility
   - Consider astrological timing

2. **Elemental Harmony** (RecommendationAnalyticsService.ts:177):
   - Use `calculateElementalCompatibility()`
   - Factor in user's elemental affinities
   - Don't default to 0.8

3. **Planetary Agent Harmony** (PlanetaryAgentsAdapter.ts:447):
   - Calculate from planetary aspect relationships
   - Use aspect angles (trine=high, square=low, etc.)

4. **Recipe Recommendations** (useEnhancedRecommendations.ts):
   - Calculate from recipe-user compatibility
   - Factor in preferences and history
   - Use thermodynamic alignment

5. **Cultural Harmony** (CulturalAnalyticsService.ts):
   - Calculate from cuisine-user cultural affinity
   - Consider cuisine elemental signatures
   - Use z-score analysis

6. **Zodiac Harmony** (recipeBuilding.ts:2155):
   - Calculate from zodiac sign elemental alignment
   - Use actual sign-recipe compatibility
   - Not just 0.85 vs 0.7 binary

**Test**: Verify harmony scores vary based on actual inputs, not fixed values

---

### 2.2 Implement Cuisine Global Statistics

**File**: `src/utils/cuisineAggregations.ts:32-54, 200, 221`

**Problem**:
```typescript
// Values below are placeholders - update with actual global statistics
export const DEFAULT_GLOBAL_AVERAGES: GlobalPropertyAverages = {
  elementals: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  // ...
```

**Solution**:
1. Import all cuisine data from `src/data/cuisines.ts` or `src/data/unified/cuisineIntegrations.ts`
2. Calculate actual global averages:
   - Aggregate elemental properties across all cuisines
   - Calculate mean and standard deviation for each property
   - Compute thermodynamic averages if available
3. Replace DEFAULT_GLOBAL_AVERAGES with computed values
4. Consider caching this calculation or computing at build time
5. Update functions at lines 200 and 221 to use computed averages

**Implementation Pattern**:
```typescript
export const computeGlobalAverages = (allCuisines: CuisineData[]): GlobalPropertyAverages => {
  // Aggregate all properties
  // Calculate means and std devs
  // Return actual statistics
}

export const COMPUTED_GLOBAL_AVERAGES = computeGlobalAverages(getAllCuisines());
```

**Test**: Verify z-scores now reflect actual deviations from real averages

---

## PHASE 3: Data Completeness (MEDIUM PRIORITY)

### 3.1 Add Actual Elemental Properties to Misc Ingredients

**File**: `src/data/ingredients/misc/misc.ts`

**Problem**: 29 ingredients (lines 8, 19, 63, 74, 85, 96, 107, 118, 129, 140, 151, 162, 173, 184, 195, 206, 217, 228, 239, 250, 261, 272, 283, 294, 305, 316, 327, 338, 349, 360, 382) all have:
```typescript
elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
```

**Solution**:
1. Review each ingredient (Salt, Sugar, Honey, etc.)
2. Assign elemental properties based on characteristics:
   - **Fire**: Heat, intensity, stimulation (peppers, ginger, alcohol)
   - **Water**: Fluidity, cooling, emotion (water, milk, cucumber)
   - **Earth**: Grounding, stability, nourishment (roots, grains, meats)
   - **Air**: Lightness, clarity, movement (herbs, leafy greens, ferments)
3. Reference similar ingredients in `src/data/ingredients/` subdirectories
4. Ensure values sum to ~1.0 (normalized)
5. Focus on dominant 1-2 elements per ingredient

**Example**:
```typescript
{
  id: "salt",
  name: "Salt",
  elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.3, Air: 0.0 }, // Water-heavy (dissolves, flows), some Earth (mineral)
  // ...
}
```

**Test**: Verify recipes using these ingredients now have varied elemental profiles

---

### 3.2 Complete Import Statements in Unified Data Files

**Files with TODO import comments**:
- `src/data/unified/cuisineIntegrations.ts:18-20, 46`
- `src/data/unified/nutritional.ts:17-18`
- `src/data/unified/enhancedIngredients.ts:1-2, 19-22`

**Solution**:
1. Read each file to understand what's needed
2. Identify the actual exports from the target files
3. Add proper import statements
4. Remove TODO comments
5. Fix any type mismatches that arise

**Pattern**:
```typescript
// Before:
// TODO: Fix import - add what to import from './ingredients'

// After:
import { IngredientData, searchIngredients } from './ingredients';
```

**Test**: Run `make check` to ensure no module resolution errors

---

### 3.3 Implement Ascendant Calculation

**File**: `src/services/natalChartService.ts:138`

**Problem**:
```typescript
Ascendant: "aries" as ZodiacSign, // Placeholder - would need more calculation
```

**Solution**:
1. Ascendant requires birth time and location (latitude/longitude)
2. Check if this data is available in the function parameters
3. Use `astronomy-engine` package (already in project) for calculation:
   - Calculate local sidereal time
   - Determine degree of zodiac rising on eastern horizon
   - Map to zodiac sign
4. If time/location unavailable, return `undefined` instead of false "aries"
5. Update type to allow `Ascendant?: ZodiacSign`

**Reference**: Look at existing astronomy calculations in `src/app/api/astrologize/route.ts`

**Test**: Verify different birth times/locations produce different ascendants

---

### 3.4 Implement Planetary Position API Function

**File**: `src/utils/streamlinedPlanetaryPositions.ts:438-444`

**Problem**:
```typescript
function getAstrologizePositions(): any {
  // This should be implemented to call the actual API
  // For now, return empty object to trigger fallback
  return {};
}
```

**Solution**:
1. Check if this function is actually called (might be dead code)
2. If used, integrate with `src/app/api/astrologize/route.ts`
3. Make async API call to `/api/astrologize` endpoint
4. Cache results using `AstrologizeApiCache`
5. Return properly typed planetary positions, not `any`

**Pattern**:
```typescript
async function getAstrologizePositions(
  birthDate: Date,
  location: { lat: number; lng: number }
): Promise<PlanetaryPositions | null> {
  try {
    const response = await fetch('/api/astrologize', {
      method: 'POST',
      body: JSON.stringify({ birthDate, location })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return null;
  }
}
```

**Test**: Verify function returns real planetary data

---

### 3.5 Implement Ingredient Selection Criteria

**File**: `src/data/unified/recipeBuilding.ts:1834`

**Problem**:
```typescript
// TODO: Implement ingredient selection based on criteria
```

**Solution**:
1. Read surrounding context to understand what criteria are needed
2. Implement filtering logic based on:
   - Dietary restrictions
   - Seasonal availability
   - Elemental requirements
   - Flavor profiles
   - User preferences
3. Use existing `searchIngredients()` or similar functions
4. Return filtered ingredient list

**Test**: Verify recipe building respects selection criteria

---

## PHASE 4: Type Safety (LOW PRIORITY - Optional)

### 4.1 Replace `as any` with Proper Types

**Files**: 100+ occurrences, focus on high-impact files:
- `src/data/cuisineFlavorProfiles.ts` - 15+ occurrences
- `src/data/recipes.ts` - 20+ occurrences
- `src/services/adapters/*` - Multiple files

**Solution Strategy**:
1. Work file-by-file, not all at once
2. For each `as any`:
   - Understand what the actual type is
   - Check if type definition exists
   - Add proper type assertion or type guard
   - Only keep `as any` if truly necessary (external API, etc.)

3. **Common Patterns**:
   - `(error as any)` → `(error as Error)` or `(error: unknown)`
   - `(obj as any).prop` → Proper interface with optional property
   - Array/object access → Use proper index signatures

**Priority Order**:
1. Service files (user-facing impact)
2. Data files (data integrity)
3. Utility files (developer experience)
4. Test files (least critical)

**Test**: Run `make check` frequently to catch new type errors

---

## Execution Guidelines

### Before Starting
1. Read `CLAUDE.md` in the project root
2. Ensure you're on branch: `claude/replace-placeholder-defaults-011yokSCCf3BbZGt6NisUxno`
3. Run `make install` to ensure dependencies
4. Run `make check` to see baseline TypeScript errors

### During Implementation
1. **Work sequentially through phases** - don't skip ahead
2. **One logical change per commit**:
   ```bash
   git add <files>
   git commit -m "fix: implement actual elemental aggregation in recipe calculations"
   ```
3. **Test after each major change**:
   ```bash
   make check    # TypeScript errors
   make build    # Build succeeds
   make lint     # No lint errors
   ```
4. **If stuck**: Search codebase for similar existing implementations
5. **Use TodoWrite tool** to track progress through tasks

### After Each Phase
1. Run full test suite: `yarn test` (if tests exist)
2. Verify build: `make build`
3. Check error count: `make errors | grep "error TS" | wc -l`
4. Commit phase completion:
   ```bash
   git add .
   git commit -m "feat: complete phase N - [phase description]"
   git push -u origin claude/replace-placeholder-defaults-011yokSCCf3BbZGt6NisUxno
   ```

### Final Steps
1. Run comprehensive verification:
   ```bash
   make clean
   make install
   make check
   make build
   make lint
   ```
2. Create summary of changes
3. Document any remaining placeholders (if any)
4. Push final changes:
   ```bash
   git push -u origin claude/replace-placeholder-defaults-011yokSCCf3BbZGt6NisUxno
   ```

---

## Success Criteria

- [ ] Zero functions returning `{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }` without proper fallback logic
- [ ] Zero stub service implementations
- [ ] Harmony scores calculated from actual compatibility metrics
- [ ] API integration using real data, not placeholder responses
- [ ] Ingredient elemental properties reflect actual characteristics
- [ ] No TODO/FIXME comments for critical functionality
- [ ] TypeScript error count maintained or reduced
- [ ] Build completes successfully
- [ ] Zero regressions in existing functionality

---

## Notes

- **Estimated time**: 8-12 hours for Phases 1-3
- **Complexity**: Medium-High (requires understanding existing systems)
- **Risk level**: Medium (changes affect core recommendation logic)
- **Testing**: Manual testing recommended after each phase

**If you encounter blockers**:
1. Check if functionality already exists elsewhere in codebase
2. Review similar implementations for patterns
3. Consult CLAUDE.md for architecture guidance
4. Focus on correct implementation over speed

**Remember**: The goal is to eliminate placeholders with REAL functionality using EXISTING codebase patterns, not to add new placeholders or lazy fixes.

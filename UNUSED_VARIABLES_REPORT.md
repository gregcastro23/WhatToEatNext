# Unused Variables Analysis Report
## WhatToEatNext Codebase - Import Restoration Campaign

### Executive Summary

This analysis identifies files with the highest concentrations of unused variables in the TypeScript/JavaScript codebase. The analysis focuses on files that would benefit most from the Import Restoration Campaign transformation methodology.

**Key Statistics:**
- **Total files analyzed:** 1,010
- **Files with unused variables:** 464 (45.9%)
- **Total unused variables:** 1,268
- **Overall unused ratio:** 12.2%

### Top 10 Files with Highest Unused Variable Counts

#### 1. `src/types/alchemy.ts` (22 unused variables, 23.7% ratio)
**Impact:** High - Core type definitions file
**Unused variables:** LUNAR_PHASE_MAPPING, LUNAR_PHASE_REVERSE_MAPPING, COOKING_METHOD_THERMODYNAMICS, AlchemicalCalculationResult, BasicThermodynamicProperties, ElementalProfile, RecipeHarmonyResult, CombinationEffect, BirthInfo, PlanetaryHarmony, IngredientSearchCriteria, CelestialAlignment, TarotSuit, ChakraPosition, AstrologicalInfluence, PlanetaryPositionsType, AlchemicalState, CookingMethodProfile, timeFactors, alchemicalValues, BaseIngredient, RecipeData

**Recommendation:** Priority Target - This file contains many unused type definitions that should be systematically reviewed and either utilized or removed.

#### 2. `src/data/ingredients/proteins/index.ts` (15 unused variables, 39.5% ratio)
**Impact:** High - Data layer with many unused export functions
**Unused variables:** getProteinsBySeasonality, getProteinsBySustainability, getProteinsByRegionalCuisine, getProteinsByCategory, getProteinsByCookingMethod, getProteinsByNutrition, getCompatibleProteins, getProteinSubstitutes, validateProteinCombination, validateCookingMethod, getProteinsBySubCategory, getVeganProteins, CookingProfile, SafetyThresholds, SeasonalAdjustment

**Recommendation:** High Priority - Many utility functions are exported but never used, indicating over-engineering in the proteins data layer.

#### 3. `src/services/interfaces/RecipeApiInterfaces.ts` (15 unused variables, 62.5% ratio)
**Impact:** High - Service layer with unused API interfaces
**Unused variables:** ApiResponse, PaginationParams, GetRecipeByIdParams, GetRecipesByCuisineParams, GetRecipesByZodiacParams, GetRecipesBySeasonParams, GetRecipesByLunarPhaseParams, GetRecipesByMealTypeParams, GetRecipesForPlanetaryAlignmentParams, GetRecipesForFlavorProfileParams, GetBestRecipeMatchesParams, SearchRecipesParams, GenerateFusionRecipeParams, AdaptRecipeForSeasonParams, RecipeErrorCode

**Recommendation:** High Priority - This interface file has many unused type definitions that suggest incomplete API implementation.

#### 4. `src/utils/ingredientUtils.ts` (15 unused variables, 46.9% ratio)
**Impact:** Medium-High - Utility functions with many unused exports
**Unused variables:** calculateAlchemicalProperties, calculateThermodynamicProperties, determineIngredientModality, isRecipeIngredient, isFullIngredient, validateIngredient, validateRecipeIngredient, mergeElementalProperties, mapToIngredient, ingredientToRecipeIngredient, normalizeElementalProperties, toSimpleIngredients, isSimpleIngredient, fromSimpleIngredient, findCompatibleSimpleIngredients

**Recommendation:** Medium Priority - Utility functions that are defined but never used.

#### 5. `src/utils/recipe/recipeUtils.ts` (15 unused variables, 46.9% ratio)
**Impact:** Medium-High - Recipe utility functions with unused exports
**Unused variables:** isScoredRecipe, isRecipeIngredient, getRecipeMealTypes, getRecipeSeasons, getRecipeAstrologicalInfluences, getRecipeZodiacInfluences, getRecipeCookingTime, isRecipeCompatibleWithDiet, recipeHasIngredient, getRecipeDominantElement, getSafeRecipeName, getSafeRecipeDescription, toScoredRecipe, isRecipeDietaryCompatible, getRecipeIngredients

**Recommendation:** Medium Priority - Recipe utility functions that should be reviewed and consolidated.

#### 6. `src/data/ingredients/oils/index.ts` (13 unused variables, 81.3% ratio)
**Impact:** Medium - Data export file with high unused ratio
**Unused variables:** cookingOils, finishingOils, supplementOils, specialtyOils, fireOils, waterOils, earthOils, airOils, highHeatOils, bakingOils, dressingOils, nutOils, allOils

**Recommendation:** High Priority - Very high unused ratio (81.3%) indicates significant over-export of oil categorizations.

#### 7. `src/utils/elementalUtils.ts` (13 unused variables, 22.4% ratio)
**Impact:** Medium - Elemental calculations with unused utility functions
**Unused variables:** ELEMENT_WEIGHTS, applyNonLinearScaling, calculateUniquenessScore, fixIngredientMappings, calculateUniqueness, transformItemsWithPlanetaryPositions, getPrimaryElement, getElementStrength, fixRawIngredientMappings, getBalancingElement, getStrengtheningElement, enhanceVegetableTransformations, enhanceOilProperties

**Recommendation:** Medium Priority - Many utility functions for elemental calculations are unused.

#### 8. `src/data/recipes.ts` (12 unused variables, 22.2% ratio)
**Impact:** Medium - Recipe data with unused query functions
**Unused variables:** getRecipesForZodiac, getRecipesForSeason, getRecipesForLunarPhase, getRecipesForCuisine, getRecipesForPlanetaryAlignment, getDominantPlanetaryInfluence, getRecommendedCookingTechniques, getRecipesForFlavorProfile, getRecommendedCuisines, getFusionSuggestions, calculateCompatibilityScore, getRecipe

**Recommendation:** Medium Priority - Recipe query functions that appear to be unused.

#### 9. `src/types/shared.ts` (12 unused variables, 48.0% ratio)
**Impact:** Medium - Shared type definitions with high unused ratio
**Unused variables:** MOON_PHASE_MAP, MOON_PHASE_TO_DISPLAY, MOON_PHASE_TO_LOWERCASE, LOWERCASE_TO_MOON_PHASE, CelestialPosition, ElementalScore, ThermodynamicProperties, ZodiacSign, Season, ViewOption, ElementalFilter, CookingMethodRecord

**Recommendation:** Medium Priority - Shared types with nearly 50% unused ratio.

#### 10. `src/utils/seasonalCalculations.ts` (12 unused variables, 23.5% ratio)
**Impact:** Medium - Seasonal calculation utilities with unused functions
**Unused variables:** SEASONAL_MODIFIERS, getSeasonalEffectiveness, getSeasonalModifier, calculateSeasonalModifiers, getElementalBreakdown, applySeasonalInfluence, calculateLunarPhaseCompatibility, getComprehensiveSeasonalAnalysis, getElementalCompatibilityWithSeason, getEnhancedElementalBreakdown, getSeasonalCacheStats, Rating

**Recommendation:** Medium Priority - Seasonal calculation functions that are unused.

### Files with Extreme Unused Ratios (>80%)

These files have very high unused variable ratios and should be prioritized for cleanup:

1. **`src/constants/tarotCards.ts`** - 100% unused (5/5 variables)
2. **`src/types/common.ts`** - 100% unused (5/5 variables)
3. **`src/utils/constants.ts`** - 100% unused (5/5 variables)
4. **`src/data/planets/types.ts`** - 100% unused (4/4 variables)
5. **`src/constants/chakraSymbols.ts`** - 91.7% unused (11/12 variables)
6. **`src/data/integrations/types.ts`** - 85.7% unused (6/7 variables)
7. **`src/data/unified/constants/zodiac.js`** - 85.7% unused (6/7 variables)
8. **`src/data/ingredients/oils/index.ts`** - 81.3% unused (13/16 variables)

### Category Analysis

**Most Problematic Categories:**
1. **Types** - 27.2% unused ratio (172 unused variables across 99 files)
2. **Utils** - 17.8% unused ratio (373 unused variables across 165 files)
3. **Data** - 15.3% unused ratio (341 unused variables across 331 files)

**Least Problematic Categories:**
1. **Components** - 3.0% unused ratio (82 unused variables across 183 files)
2. **Services** - 7.1% unused ratio (75 unused variables across 64 files)
3. **Hooks** - 7.5% unused ratio (20 unused variables across 27 files)

### Patterns Identified

1. **Over-Engineering in Data Layer:** Many data files export numerous utility functions that are never used
2. **Type Definition Bloat:** Type files contain many unused interface and type definitions
3. **Incomplete API Implementations:** Service interface files have many unused parameter types
4. **Utility Function Proliferation:** Utils directories contain many unused helper functions
5. **Constant Over-Declaration:** Constants files define many unused values

### Import Restoration Campaign Recommendations

#### Phase 1: High-Priority Files (>15 unused variables)
- `src/types/alchemy.ts` (22 unused)
- `src/data/ingredients/proteins/index.ts` (15 unused)
- `src/services/interfaces/RecipeApiInterfaces.ts` (15 unused)
- `src/utils/ingredientUtils.ts` (15 unused)
- `src/utils/recipe/recipeUtils.ts` (15 unused)

#### Phase 2: Medium-Priority Files (10-15 unused variables)
- `src/data/ingredients/oils/index.ts` (13 unused)
- `src/utils/elementalUtils.ts` (13 unused)
- `src/data/recipes.ts` (12 unused)
- `src/types/shared.ts` (12 unused)
- `src/utils/seasonalCalculations.ts` (12 unused)

#### Phase 3: Complete Cleanup Files (100% unused)
- `src/constants/tarotCards.ts`
- `src/types/common.ts`
- `src/utils/constants.ts`
- `src/data/planets/types.ts`

### Methodology for Import Restoration

1. **Audit Phase:** Review each unused variable to determine if it's truly unused or just not detected
2. **Categorization:** Separate into "safe to remove" vs "potentially needed" categories
3. **Gradual Removal:** Start with 100% unused files, then work through high-priority files
4. **Testing:** Ensure no runtime errors after removal
5. **Documentation:** Update any documentation that references removed variables

### Expected Benefits

- **Reduced Bundle Size:** Removing unused code will decrease the final bundle size
- **Improved Maintainability:** Less code to maintain and understand
- **Better Performance:** Faster build times and reduced memory usage
- **Cleaner Architecture:** More focused and purposeful code structure

### Conclusion

The codebase shows significant potential for cleanup through the Import Restoration Campaign. With 1,268 unused variables across 464 files, there's substantial opportunity to improve code quality, reduce technical debt, and enhance maintainability. The identified patterns suggest systematic over-engineering in certain areas, particularly in data layer exports and type definitions.

The recommended phased approach will allow for systematic cleanup while maintaining system stability and functionality.
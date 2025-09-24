# High-Impact Files Priority List for Unused Variable Elimination

## Top Priority Files (>40 unused variables each)

### 1. AdvancedAnalyticsIntelligenceService.ts (91 unused variables)

**File**: `/src/services/AdvancedAnalyticsIntelligenceService.ts` **Impact**:
CRITICAL - Campaign system intelligence **Approach**: MANUAL REVIEW REQUIRED

- Contains campaign system intelligence variables
- Many variables may be used for future analytics features
- Preserve variables related to error analysis and progress tracking
- Safe to remove obvious unused imports and simple local variables

### 2. recipeBuilding.ts (67 unused variables)

**File**: `/src/data/unified/recipeBuilding.ts` **Impact**: HIGH - Core recipe
functionality **Approach**: CAREFUL AUTOMATED + MANUAL REVIEW

- Recipe building logic with many intermediate variables
- Some variables may be used in complex recipe algorithms
- Safe to remove unused imports and obvious unused variables
- Preserve variables related to elemental calculations

### 3. MLIntelligenceService.ts (63 unused variables)

**File**: `/src/services/MLIntelligenceService.ts` **Impact**: CRITICAL -
Machine learning intelligence **Approach**: MANUAL REVIEW REQUIRED

- Contains ML and predictive intelligence variables
- Many variables may be placeholders for future ML features
- Preserve variables related to pattern recognition and learning
- Safe to remove unused imports and type definitions

### 4. CuisineRecommender.tsx (52 unused variables)

**File**: `/src/components/recommendations/CuisineRecommender.tsx` **Impact**:
HIGH - User-facing recommendation component **Approach**: AUTOMATED + MANUAL
REVIEW

- React component with many unused state variables and props
- Safe to remove unused React hook returns
- Preserve variables related to astrological calculations
- Fix unused destructured variables

### 5. CookingMethods.tsx (50 unused variables)

**File**: `/src/components/CookingMethods.tsx` **Impact**: HIGH - Core cooking
method functionality **Approach**: CAREFUL AUTOMATED + MANUAL REVIEW

- Contains astrological cooking method calculations
- Preserve variables related to elemental properties
- Safe to remove unused React state and props
- Review planetary calculation variables carefully

## Medium Priority Files (15-40 unused variables each)

### 6. IngredientRecommender.migrated.tsx (41 unused variables)

**File**: `/src/components/recommendations/IngredientRecommender.migrated.tsx`
**Impact**: MEDIUM - Migrated component (may be temporary) **Approach**:
AUTOMATED CLEANUP

- Migrated component with legacy unused variables
- Safe to remove most unused variables
- Consider if this file is still needed

### 7. PredictiveIntelligenceService.ts (38 unused variables)

**File**: `/src/services/PredictiveIntelligenceService.ts` **Impact**:
CRITICAL - Predictive intelligence system **Approach**: MANUAL REVIEW REQUIRED

- Contains predictive analytics variables
- Preserve variables related to prediction algorithms
- Safe to remove unused imports and simple variables

### 8. IngredientRecommender.tsx (27 unused variables)

**File**: `/src/components/recommendations/IngredientRecommender.tsx`
**Impact**: HIGH - Core ingredient recommendation **Approach**: AUTOMATED +
MANUAL REVIEW

- Core ingredient recommendation component
- Safe to remove unused React variables
- Preserve astrological calculation variables

### 9. CookingMethodsSection.backup.tsx (27 unused variables)

**File**: `/src/components/CookingMethodsSection.backup.tsx` **Impact**: LOW -
Backup file **Approach**: CONSIDER DELETION

- Backup file that may not be needed
- Consider removing entire file if not used

### 10. cuisineRecommender.ts (24 unused variables)

**File**: `/src/utils/cuisineRecommender.ts` **Impact**: HIGH - Core cuisine
recommendation logic **Approach**: CAREFUL AUTOMATED + MANUAL REVIEW

- Core cuisine recommendation utility
- Preserve variables related to cultural and astrological calculations
- Safe to remove unused imports and simple variables

## Lower Priority Files (10-20 unused variables each)

### 11-20. Various Components and Utilities

- CuisineRecommenderDebug.tsx (23) - Debug component, safe to clean
- FoodRecommender/index.tsx (19) - Core component, careful review
- AlchemicalRecommendations.tsx (19) - Astrological component, preserve
  carefully
- cookingMethodRecommender.ts (18) - Core utility, careful review
- MainPageLayout.tsx (18) - Layout component, safe to clean
- astrologyUtils.ts (17) - CRITICAL - Preserve astrological variables
- recipeMatching.ts (16) - Core utility, careful review
- IngredientService.ts (16) - Core service, careful review
- ElementalEnergyDisplay.tsx (16) - Astrological component, preserve carefully
- RecipeBuilder.tsx (15) - Core component, careful review

## Implementation Strategy by Priority

### Phase 1: Quick Wins (Estimated 300-400 variable reduction)

**Target Files**: Backup files, debug components, migrated components

- Remove backup files if not needed
- Clean up debug components
- Remove obvious unused imports across all files

### Phase 2: Component Cleanup (Estimated 400-500 variable reduction)

**Target Files**: React components with unused state and props

- Fix unused React hook returns (useState, useEffect)
- Clean up unused props and destructured variables
- Organize imports properly

### Phase 3: Service Layer Review (Estimated 200-300 variable reduction)

**Target Files**: Service files with careful manual review

- Review intelligence service variables carefully
- Preserve campaign system and ML variables
- Remove obvious unused variables

### Phase 4: Core Utilities (Estimated 100-200 variable reduction)

**Target Files**: Core utility functions and astrological calculations

- Preserve all astrological calculation variables
- Remove unused imports and simple variables
- Manual review for complex calculations

## Critical Preservation Guidelines

### ALWAYS PRESERVE:

- Variables in astrological calculation files
- Campaign system intelligence variables
- ML and predictive analytics variables
- Elemental property calculations
- Planetary position variables

### SAFE TO REMOVE:

- Unused imports in non-critical files
- Unused React hook returns that aren't needed
- Local variables that are assigned but never read
- Backup and debug file variables

### REQUIRES MANUAL REVIEW:

- Variables in `/src/services/` intelligence services
- Variables in `/src/utils/` astrological utilities
- Variables in core recommendation components
- Variables with complex mathematical expressions

## Success Metrics by Phase

### Phase 1 Target: 300-400 variables removed

- Focus on safe, obvious removals
- No impact on functionality
- 100% automated with validation

### Phase 2 Target: 400-500 variables removed

- React component cleanup
- Improved code readability
- Maintained component functionality

### Phase 3 Target: 200-300 variables removed

- Service layer optimization
- Preserved critical intelligence variables
- Enhanced system maintainability

### Phase 4 Target: 100-200 variables removed

- Core utility optimization
- Preserved all astrological accuracy
- Final cleanup and validation

## Total Expected Reduction: 1,000-1,400 variables (54-75% of total)

## Preserved Critical Variables: ~400-500 variables

## Final Target: <500 unused variables remaining

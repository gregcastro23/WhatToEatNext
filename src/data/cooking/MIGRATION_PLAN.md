# Cooking Methods Migration Plan

## Current Status

We've migrated cooking methods from the monolithic `cookingMethods.ts` file to
individual files organized by category:

### Implemented Categories

- **Dry Methods**: baking, roasting, frying, stir-frying, grilling
- **Wet Methods**: sous-vide, boiling, steaming, braising
- **Molecular Methods**: spherification, gelification
- **Traditional Methods**: fermentation

### Methods Still to Migrate

- broiling (→ dry)
- pressure_cooking (→ wet)
- smoking (→ traditional)
- raw (→ basic)
- emulsification (→ molecular)
- cryo_cooking (→ molecular)

## Migration Strategy

1. **Phase 1: Structure and Initial Methods** (COMPLETED)
   - Set up directory structure for categories
   - Create template file
   - Implement initial methods in each category
   - Update index files

2. **Phase 2: Complete Migration** (IN PROGRESS)
   - Migrate remaining methods from `cookingMethods.ts`
   - Ensure all methods maintain the same data structure
   - Add more comprehensive data to each method file

3. **Phase 3: Code Updates** (COMPLETED)
   - Update imports in components to use the new module structure
   - Switch from using `cookingMethods` to `allCookingMethods`
   - Test all functionality with new imports

4. **Phase 4: Cleanup** (COMPLETED)
   - Remove backwards compatibility imports
   - Remove the old `cookingMethods.ts` file
   - Update documentation

## Implementation Notes

- Backwards compatibility is maintained through the `src/data/cooking/index.ts`
  file
- The new system provides better organization and more detailed data
- The modular approach makes it easier to add new methods
- Helper functions have been moved to proper locations

## Code Changes Completed

Components and utils updated:

- `src/data/recipes/elementalMappings.ts`
- `src/calculations/culinaryAstrology.ts`
- `src/components/AlchemicalRecommendations.tsx`
- `src/components/CookingMethods.tsx`
- `src/utils/culturalMethodsAggregator.ts`
- `src/utils/cookingMethodRecommender.ts`

All imports now use:

```javascript
// Before
import { cookingMethods } from "@/data/cooking/cookingMethods";

// After
import { allCookingMethods } from "@/data/cooking";
```

## Cleanup Completed

The following files have been removed:

- `src/data/cooking/cookingMethods.ts`
- `src/data/cooking/molecularMethods.ts`
- `src/data/cooking/alcmethods.ts`

Backwards compatibility maintained through the new modular structure.

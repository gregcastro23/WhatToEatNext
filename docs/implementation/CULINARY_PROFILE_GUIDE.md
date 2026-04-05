# Culinary Profile Enhancement & Category Alias Refactor Guide

## Overview

This guide documents the comprehensive refactor of all ingredient files to
implement standardized CulinaryProfile interfaces and type-safe category alias
types.

## New Type Definitions

### CulinaryProfile Interface

Located in `src/types/culinary.ts`, the new `CulinaryProfile` interface provides
a comprehensive structure for all culinary properties:

```typescript
export interface CulinaryProfile {
  flavorProfile: string[]; // e.g. ['sweet', 'tart', 'floral']
  texture: string[]; // e.g. ['crisp', 'juicy']
  bestCookingMethods: CookingMethod[]; // e.g. ['Roasting', 'Grilling']
  cuisineAffinity: CuisineType[]; // e.g. ['Italian', 'Japanese']
  classicPairings: string[]; // e.g. ['basil', 'mozzarella']
  culinaryUses: string[]; // e.g. ['salads', 'desserts']
  seasonality?: string[]; // e.g. ['spring', 'summer']
  shelfLife?: string; // e.g. '1 week refrigerated'
  substitutions?: string[]; // e.g. ['lemon', 'lime']
  notes?: string; // Freeform notes
  intensity?: "mild" | "moderate" | "strong";
  allergenInfo?: string[]; // e.g. ['nut-free', 'gluten-free']
  regionalVarieties?: string[]; // e.g. ['Italian basil', 'Thai basil']
  preparationTips?: string[]; // e.g. ['Wash just before use']
  umamiScore?: number; // 0-1 scale
}
```

### Category Alias Types

New type-safe category definitions using PascalCase per project conventions:

```typescript
export type IngredientCategory =
  | "Vegetable"
  | "Fruit"
  | "Grain"
  | "Protein"
  | "Dairy"
  | "Spice"
  | "Herb"
  | "Seasoning"
  | "Oil"
  | "Vinegar"
  | "Other";

export type FruitSubCategory =
  | "Berry"
  | "Citrus"
  | "Pome"
  | "Stone"
  | "Melon"
  | "Tropical"
  | "Other";
export type VegetableSubCategory =
  | "Root"
  | "Starchy"
  | "Leafy"
  | "Nightshade"
  | "Legume"
  | "Cruciferous"
  | "Allium"
  | "Other";
// ... additional subcategory types
```

## Migration Patterns

### Before (Old Structure)

```typescript
export const strawberry = {
  name: "Strawberry",
  category: "fruit", // lowercase, no type safety
  subCategory: "berry",
  // ... scattered culinary data
  affinities: ["lemon", "cream"],
  cookingMethods: ["raw", "baked"],
  culinaryApplications: {
    /* complex nested structure */
  },
};
```

### After (New Structure)

```typescript
import {
  IngredientCategory,
  FruitSubCategory,
  CulinaryProfile,
} from "@/types/culinary";

export const strawberry = {
  name: "Strawberry",
  category: "Fruit" as IngredientCategory,
  subCategory: "Berry" as FruitSubCategory,
  culinaryProfile: {
    flavorProfile: ["sweet", "tart", "floral"],
    texture: ["juicy", "tender"],
    bestCookingMethods: ["Raw", "Baking", "Macerating"],
    cuisineAffinity: ["French", "American", "Italian"],
    classicPairings: ["cream", "basil", "balsamic vinegar"],
    culinaryUses: ["desserts", "salads", "preserves"],
    seasonality: ["spring", "summer"],
    shelfLife: "2-3 days refrigerated",
    substitutions: ["raspberry", "blackberry"],
    notes: "Best in late spring and early summer.",
    intensity: "moderate",
    allergenInfo: ["nut-free", "gluten-free"],
    umamiScore: 0.1,
  } as CulinaryProfile,
  // ... other existing properties (astrologicalProfile, elementalProperties, etc.)
};
```

## Migration Checklist

### Phase 1: Type Definitions ✅

- [x] Create `src/types/culinary.ts` with new interfaces
- [x] Define `CulinaryProfile` interface
- [x] Define category and subcategory alias types
- [x] Ensure PascalCase conventions

### Phase 2: Sample Refactors

- [ ] Refactor 1 fruit file (berries.ts)
- [ ] Refactor 1 vegetable file (rootVegetables.ts)
- [ ] Validate build and type safety
- [ ] Test culinary profile access

### Phase 3: Batch Migration

- [ ] Fruits directory (berries.ts, citrus.ts, tropical.ts, pome.ts, melons.ts)
- [ ] Vegetables directory (rootVegetables.ts, starchy.ts, nightshades.ts,
      legumes.ts)
- [ ] Proteins directory (meat.ts, poultry.ts, seafood.ts, eggs.ts,
      plantBased.ts)
- [ ] Grains directory (wholeGrains.ts, refinedGrains.ts)
- [ ] Dairy directory (dairy.ts)
- [ ] Spices directory (warmSpices.ts, groundSpices.ts)
- [ ] Herbs directory (freshHerbs.ts, driedHerbs.ts)
- [ ] Seasonings directory (salts.ts)
- [ ] Oils directory (oils.ts)
- [ ] Vinegars directory (vinegars.ts)

### Phase 4: Service Updates

- [ ] Update ingredient utility functions
- [ ] Update recommendation services
- [ ] Update UI components
- [ ] Update tests and mocks

### Phase 5: Documentation & Validation

- [ ] Update this guide with final patterns
- [ ] Create validation utilities
- [ ] Document best practices
- [ ] Final build validation

## Best Practices

### Culinary Profile Data

1. **Flavor Profiles**: Use descriptive, consistent terms (sweet, tart, bitter,
   umami, etc.)
2. **Textures**: Include primary and secondary textures (crisp, tender, creamy,
   etc.)
3. **Cooking Methods**: Use standardized CookingMethod types from the system
4. **Cuisine Affinity**: Use PascalCase CuisineType values
5. **Classic Pairings**: Include both complementary and contrasting ingredients
6. **Culinary Uses**: Be specific about applications (salads, desserts, main
   dishes, etc.)

### Category Usage

1. **Always use type assertions**: `'Fruit' as IngredientCategory`
2. **Use appropriate subcategories**: `'Berry' as FruitSubCategory`
3. **Maintain PascalCase**: All category and subcategory values
4. **Extend when needed**: Add new subcategories to the union types

### Migration Safety

1. **Build validation**: Run `yarn build` after each batch
2. **Type checking**: Ensure no TypeScript errors
3. **Incremental approach**: Refactor 3-5 files at a time
4. **Backup strategy**: Use git commits between batches
5. **Test thoroughly**: Validate culinary profile access in components

## Validation Utilities

### Type Safety Check

```typescript
import { IngredientCategory, CulinaryProfile } from "@/types/culinary";

function validateIngredient(ingredient: any): boolean {
  return (
    typeof ingredient.category === "string" &&
    typeof ingredient.culinaryProfile === "object" &&
    Array.isArray(ingredient.culinaryProfile.flavorProfile) &&
    Array.isArray(ingredient.culinaryProfile.texture) &&
    Array.isArray(ingredient.culinaryProfile.bestCookingMethods) &&
    Array.isArray(ingredient.culinaryProfile.cuisineAffinity) &&
    Array.isArray(ingredient.culinaryProfile.classicPairings) &&
    Array.isArray(ingredient.culinaryProfile.culinaryUses)
  );
}
```

### Culinary Profile Completeness Check

```typescript
function checkCulinaryProfileCompleteness(profile: CulinaryProfile): string[] {
  const missing: string[] = [];

  if (!profile.flavorProfile?.length) missing.push("flavorProfile");
  if (!profile.texture?.length) missing.push("texture");
  if (!profile.bestCookingMethods?.length) missing.push("bestCookingMethods");
  if (!profile.cuisineAffinity?.length) missing.push("cuisineAffinity");
  if (!profile.classicPairings?.length) missing.push("classicPairings");
  if (!profile.culinaryUses?.length) missing.push("culinaryUses");

  return missing;
}
```

## Benefits Achieved

1. **Type Safety**: All category and subcategory fields are now type-safe
2. **Consistency**: Uniform culinary profile structure across all ingredients
3. **Discoverability**: All culinary data is organized and easily accessible
4. **Extensibility**: New fields can be added to CulinaryProfile without
   breaking changes
5. **Maintainability**: Clear structure makes updates and additions easier
6. **Performance**: Structured data enables better querying and filtering
7. **User Experience**: Rich culinary data enables better recommendations and
   pairing

## Future Enhancements

1. **Culinary Profile Validation**: Automated validation of profile completeness
2. **Dynamic Pairing**: Algorithm-based ingredient pairing using culinary
   profiles
3. **Seasonal Recommendations**: Enhanced seasonal cooking using seasonality
   data
4. **Cuisine-Specific Features**: Advanced cuisine affinity matching
5. **Allergen Filtering**: Enhanced allergen-aware recipe generation
6. **Umami Optimization**: Umami score-based recipe enhancement

## Migration Status

- **Total Files**: ~50 ingredient files across 10 directories
- **Completed**: 0 files
- **In Progress**: Type definitions and sample refactors
- **Remaining**: Full batch migration and service updates

This refactor establishes a solid foundation for advanced culinary features
while maintaining backward compatibility and build stability throughout the
migration process.

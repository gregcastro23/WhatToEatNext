# Type Alias Implementation Prompt for WhatToEatNext Project

## Project Context

You are working on the **WhatToEatNext** project, a sophisticated food
recommendation system that combines astrological data, alchemical principles,
and culinary knowledge. The project uses TypeScript with Next.js and has a
complex type system involving:

- **Alchemical calculations** with elemental properties (Fire, Water, Earth,
  Air)
- **Astrological data** with planetary positions and zodiac signs
- **Culinary ingredients** with nutritional, seasonal, and regional properties
- **Recipe recommendations** based on multiple factors

## Current State

- **Build Status**: ✅ Successful (0 errors, 0 warnings)
- **TypeScript Version**: Latest with strict mode enabled
- **Project Structure**: Well-organized with separate directories for types,
  data, services, and components
- **Goal**: Implement comprehensive type aliases to improve type safety, reduce
  code duplication, and make the codebase more maintainable

## Type Alias Opportunities Identified

### 1. Elemental Properties Types

**Location**: `src/types/alchemy.ts` and
`src/calculations/alchemicalTransformation.ts`

**Current Issues**:

- Repeated
  `{ Spirit: number, Essence: number, Matter: number, Substance: number }`
  patterns
- Inconsistent elemental property handling across files
- Complex nested type definitions

**Proposed Type Aliases**:

```typescript
// Core alchemical types
type AlchemicalProperties = {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
};

type ElementalProperties = {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
};

type ThermodynamicMetrics = {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
};

// Combined types
type AlchemicalState = AlchemicalProperties & ElementalProperties;
type CompleteAlchemicalResult = AlchemicalState & ThermodynamicMetrics;
```

### 2. Standardized Alchemical Result Types

**Location**: `src/calculations/alchemicalTransformation.ts` and related files

**Current Issues**:

- Complex return types with repeated patterns
- Inconsistent property naming
- Difficult to maintain across multiple calculation functions

**Proposed Type Aliases**:

```typescript
type AlchemicalTransformationResult = {
  originalProperties: AlchemicalProperties;
  transformedProperties: AlchemicalProperties;
  elementalShift: ElementalProperties;
  transformationScore: number;
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  dominantProperty: keyof AlchemicalProperties;
};

type PlanetaryInfluenceResult = {
  planetaryPositions: Record<string, string>;
  elementalBoost: ElementalProperties;
  alchemicalModifier: AlchemicalProperties;
  compatibilityScore: number;
};
```

### 3. Planetary Position Types

**Location**: `src/types/astrology.ts` and astrological calculation files

**Current Issues**:

- Repeated planetary position patterns
- Inconsistent zodiac sign handling
- Complex astrological state objects

**Proposed Type Aliases**:

```typescript
type PlanetaryPositions = Record<string, string>;
type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

type AstrologicalState = {
  planetaryPositions: PlanetaryPositions;
  currentZodiac: ZodiacSign;
  lunarPhase:
    | "new moon"
    | "waxing crescent"
    | "first quarter"
    | "waxing gibbous"
    | "full moon"
    | "waning gibbous"
    | "last quarter"
    | "waning crescent";
  elementalInfluence: ElementalProperties;
};
```

### 4. Ingredient Mapping Types

**Location**: `src/data/ingredients/` and related files

**Current Issues**:

- Repeated ingredient mapping patterns
- Complex nutritional content types
- Inconsistent category definitions

**Proposed Type Aliases**:

```typescript
type NutritionalContent = {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
};

type IngredientMapping = {
  name: string;
  category: string;
  season: string[];
  regionalOrigins: string[];
  nutritionalContent: NutritionalContent;
  elementalProperties: ElementalProperties;
  cookingMethods: string[];
  affinities: string[];
  sustainabilityScore: number;
  qualities: string[];
  culinaryApplications?: Record<string, any>;
};

type IngredientCollection = Record<string, IngredientMapping>;
```

### 5. Fallback Object Types

**Location**: Throughout the codebase for default values

**Current Issues**:

- Repeated empty object patterns
- Inconsistent fallback handling
- Type safety issues with default values

**Proposed Type Aliases**:

```typescript
type EmptyAlchemicalProperties = {
  Spirit: 0;
  Essence: 0;
  Matter: 0;
  Substance: 0;
};

type EmptyElementalProperties = {
  Fire: 0;
  Water: 0;
  Earth: 0;
  Air: 0;
};

type DefaultAstrologicalState = {
  planetaryPositions: {};
  currentZodiac: 'aries' as const;
  lunarPhase: 'new moon' as const;
  elementalInfluence: EmptyElementalProperties;
};
```

### 6. Service Response Types

**Location**: `src/services/` and API-related files

**Current Issues**:

- Inconsistent API response structures
- Complex nested response types
- Difficult error handling patterns

**Proposed Type Aliases**:

```typescript
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

type AlchemicalRecommendationResponse = ServiceResponse<{
  recommendations: AlchemicalTransformationResult[];
  compatibility: number;
  reasoning: string[];
}>;

type IngredientRecommendationResponse = ServiceResponse<{
  ingredients: IngredientMapping[];
  elementalMatch: ElementalProperties;
  seasonalScore: number;
}>;
```

## Implementation Strategy

### Phase 1: Core Type Definitions (Priority: High)

1. **Create/update `src/types/alchemy.ts`** with all alchemical type aliases
2. **Create/update `src/types/astrology.ts`** with astrological type aliases
3. **Create/update `src/types/ingredients.ts`** with ingredient type aliases
4. **Update existing type files** to use the new aliases

### Phase 2: Constants and Defaults (Priority: High)

1. **Create `src/constants/typeDefaults.ts`** with default values
2. **Update existing constants** to use type aliases
3. **Create fallback objects** using the new types

### Phase 3: Service and API Types (Priority: Medium)

1. **Update service files** to use new response types
2. **Create API response type aliases**
3. **Update error handling** with consistent types

### Phase 4: Component Types (Priority: Medium)

1. **Update component props** to use new type aliases
2. **Create component-specific type aliases**
3. **Update hook return types**

## Implementation Guidelines

### 1. File Organization

- Keep type aliases in appropriate type files
- Use barrel exports (`index.ts`) for easy importing
- Maintain clear separation between core types and derived types

### 2. Naming Conventions

- Use PascalCase for type names
- Use descriptive names that clearly indicate purpose
- Prefix related types (e.g., `Alchemical*`, `Astrological*`, `Ingredient*`)

### 3. Type Safety

- Use strict typing (avoid `any` where possible)
- Include proper generic constraints
- Use union types for finite sets of values

### 4. Documentation

- Add JSDoc comments for complex types
- Include usage examples in comments
- Document any constraints or assumptions

## Testing and Validation

### 1. Build Validation

```bash
yarn build
```

- Ensure build passes with no errors
- Check for any new type conflicts

### 2. Type Checking

```bash
npx tsc --noEmit
```

- Verify all types are properly resolved
- Check for any unused imports

### 3. Runtime Testing

- Test key functionality to ensure types work correctly
- Verify default values are properly typed
- Check that fallback objects work as expected

## Success Criteria

### Quantitative Metrics

- **Zero TypeScript errors** after implementation
- **Reduced code duplication** (measure lines of repeated type definitions)
- **Improved type coverage** (fewer `any` types)

### Qualitative Improvements

- **Better developer experience** with autocomplete
- **Clearer code intent** with descriptive type names
- **Easier maintenance** with centralized type definitions
- **Consistent patterns** across the codebase

## Files to Update

### Core Type Files

- `src/types/alchemy.ts`
- `src/types/astrology.ts`
- `src/types/ingredients.ts`
- `src/types/apiResponses.ts`

### Calculation Files

- `src/calculations/alchemicalTransformation.ts`
- `src/calculations/alchemicalEngine.ts`
- `src/calculations/core/`

### Service Files

- `src/services/AlchemicalService.ts`
- `src/services/AstrologicalService.ts`
- `src/services/IngredientService.ts`

### Component Files

- `src/components/AlchemicalRecommendations.tsx`
- `src/components/IngredientRecommender.tsx`
- `src/components/ElementalDisplay.tsx`

### Data Files

- `src/data/ingredients/proteins/index.ts`
- `src/data/ingredients/vegetables/index.ts`
- `src/data/ingredients/fruits/index.ts`

## Expected Benefits

1. **Reduced TypeScript Errors**: Centralized type definitions will eliminate
   inconsistencies
2. **Improved Maintainability**: Changes to types only need to be made in one
   place
3. **Better Developer Experience**: Clear type names and autocomplete
4. **Enhanced Type Safety**: Stricter typing reduces runtime errors
5. **Consistent Patterns**: Standardized approach across the codebase

## Implementation Notes

- **Start with Phase 1** (core types) as it provides the foundation
- **Test after each phase** to ensure no regressions
- **Use git commits** to track changes and enable rollback if needed
- **Document any breaking changes** for team awareness
- **Consider backward compatibility** for existing code

This comprehensive type alias implementation will significantly improve the
codebase's type safety, maintainability, and developer experience while reducing
TypeScript errors and code duplication.

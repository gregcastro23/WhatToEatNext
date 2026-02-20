# Type Alias Implementation Prompt for WhatToEatNext

## Project Context

**WhatToEatNext** - Food recommendation system combining astrology, alchemy, and
culinary knowledge. TypeScript/Next.js with complex type system.

**Current State**: ✅ Build successful (0 errors, 0 warnings) **Goal**:
Implement comprehensive type aliases for improved type safety and
maintainability

## Type Alias Opportunities

### 1. Elemental Properties Types

**Location**: `src/types/alchemy.ts`

```typescript
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
```

### 2. Astrological Types

**Location**: `src/types/astrology.ts`

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
  lunarPhase: "new moon" | "full moon" | "waxing crescent" | "waning crescent";
  elementalInfluence: ElementalProperties;
};
```

### 3. Ingredient Types

**Location**: `src/types/ingredients.ts`

```typescript
type NutritionalContent = {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
};

type IngredientMapping = {
  name: string;
  category: string;
  season: string[];
  nutritionalContent: NutritionalContent;
  elementalProperties: ElementalProperties;
  cookingMethods: string[];
  affinities: string[];
};
```

### 4. Service Response Types

**Location**: `src/types/apiResponses.ts`

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
```

## Implementation Strategy

### Phase 1: Core Types (High Priority)

1. Update `src/types/alchemy.ts` with alchemical aliases
2. Update `src/types/astrology.ts` with astrological aliases
3. Create `src/types/ingredients.ts` with ingredient aliases
4. Update existing files to use new aliases

### Phase 2: Constants & Defaults

1. Create `src/constants/typeDefaults.ts` with default values
2. Update existing constants to use type aliases
3. Create fallback objects using new types

### Phase 3: Services & APIs

1. Update service files with new response types
2. Create API response type aliases
3. Update error handling with consistent types

### Phase 4: Components

1. Update component props to use new aliases
2. Create component-specific type aliases
3. Update hook return types

## Key Files to Update

- `src/types/alchemy.ts`, `src/types/astrology.ts`
- `src/calculations/alchemicalTransformation.ts`
- `src/services/AlchemicalService.ts`, `src/services/AstrologicalService.ts`
- `src/components/AlchemicalRecommendations.tsx`
- `src/data/ingredients/proteins/index.ts`

## Success Criteria

- ✅ Zero TypeScript errors after implementation
- 📉 Reduced code duplication
- 🎯 Improved type coverage (fewer `any` types)
- 🚀 Better developer experience with autocomplete
- 🔧 Easier maintenance with centralized types

## Testing

```bash
yarn build          # Ensure build passes
npx tsc --noEmit    # Verify type resolution
```

Start with Phase 1 (core types) as foundation, test after each phase, use git
commits for tracking changes.

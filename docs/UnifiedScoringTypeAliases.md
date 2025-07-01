# Unified Scoring System Type Aliases Integration

## Overview

The UnifiedScoringService and UnifiedScoringAdapter have been updated to properly use our established type aliases from the `src/types/alchemy.ts` and `src/types/celestial.ts` files. This ensures consistency across the codebase and leverages our well-defined type system.

## Type Aliases Used

### From `src/types/alchemy.ts`

#### Core Elemental Types
```typescript
import type { 
  ElementalProperties, 
  AlchemicalProperties,
  ThermodynamicMetrics,
  Season, 
  CuisineType, 
  DietaryRestriction 
} from '../types/alchemy';
```

- **ElementalProperties**: `{ Fire: number; Water: number; Earth: number; Air: number }`
- **AlchemicalProperties**: `{ Spirit: number; Essence: number; Matter: number; Substance: number }`
- **ThermodynamicMetrics**: `{ heat: number; entropy: number; reactivity: number; gregsEnergy: number; kalchm: number; monica: number }`
- **Season**: `'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all'`
- **CuisineType**: `'Italian' | 'Mexican' | 'Asian' | 'Indian' | 'Mediterranean' | ...`
- **DietaryRestriction**: `'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | ...`

### From `src/types/celestial.ts`

#### Astrological Types
```typescript
import type { 
  Planet, 
  LunarPhase, 
  AspectType,
  PlanetaryPosition,
  PlanetaryAspect
} from '../types/celestial';
```

- **Planet**: `'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Ascendant'`
- **LunarPhase**: `'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent'`
- **AspectType**: `'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'`
- **PlanetaryPosition**: `{ sign: ZodiacSign; degree: number; minute?: number; isRetrograde?: boolean; exactLongitude?: number; speed?: number; element?: Element; dignity?: DignityType }`
- **PlanetaryAspect**: `{ planet1: string; planet2: string; type: AspectType; orb: number; strength: number; planets?: string[]; additionalInfo?: Record<string, unknown> }`

## Updated Interfaces

### ScoringContext Interface

```typescript
export interface ScoringContext {
  // Time and location
  dateTime: Date;
  location?: GeographicCoordinates;
  
  // Astrological data - Now using proper type aliases
  planetaryPositions?: Record<Planet, PlanetaryPosition>;
  currentTransits?: any;
  aspects?: PlanetaryAspect[];
  lunarPhase?: LunarPhase;
  
  // Target item data - Now using proper type aliases
  item: {
    name: string;
    type: 'ingredient' | 'recipe' | 'cuisine' | 'cooking_method';
    elementalProperties?: ElementalProperties;
    seasonality?: Season[];
    planetaryRulers?: Planet[];
    flavorProfile?: Record<string, number>;
    culturalOrigins?: string[];
    [key: string]: any;
  };
  
  // User preferences - Now using proper type aliases
  preferences?: {
    dietaryRestrictions?: DietaryRestriction[];
    culturalPreferences?: CuisineType[];
    intensityPreference?: 'mild' | 'moderate' | 'intense';
    complexityPreference?: 'simple' | 'moderate' | 'complex';
    [key: string]: any;
  };
  
  // Calculation options
  options?: {
    includeEffects?: string[];
    excludeEffects?: string[];
    weights?: Partial<ScoringBreakdown>;
    debugMode?: boolean;
  };
}
```

### AstrologicalData Interface

```typescript
export interface AstrologicalData {
  planetaryPositions: Record<Planet, PlanetaryPosition>;
  aspects: PlanetaryAspect[];
  transits: {
    active: Array<{ transitingPlanet: Planet; natalPlanet: Planet; aspect: AspectType; strength: number }>;
    seasonal: any;
  };
  lunarPhase: {
    name: LunarPhase;
    illumination: number;
    effect: string;
  };
  dignity: Record<Planet, number>;
  houses?: Record<string, number>;
  source: 'astrologize' | 'swiss_ephemeris' | 'fallback';
  confidence: number;
}
```

## Updated Adapter Methods

### scoreIngredient Method

```typescript
async scoreIngredient(
  ingredient: UnifiedIngredient,
  options: ScoringAdapterOptions = {}
): Promise<ScoredItem<UnifiedIngredient>> {
  const context: ScoringContext = {
    dateTime: new Date(),
    location: options.location || {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      name: 'New York City'
    },
    item: {
      name: ingredient.name,
      type: 'ingredient',
      elementalProperties: ingredient.elementalProperties || ingredient.elementalPropertiesState,
      seasonality: ingredient.seasonality || [],
      planetaryRulers: (ingredient.astrologicalProfile?.rulingPlanets || []) as Planet[],
      flavorProfile: ingredient.flavorProfile || {},
      culturalOrigins: ingredient.culturalOrigins || []
    },
    options: {
      debugMode: options.debugMode,
      weights: options.weights
    }
  };

  const result = await scoreRecommendation(context);
  
  return {
    item: ingredient,
    score: result.score,
    confidence: result.confidence,
    breakdown: result.breakdown,
    dominantEffects: result.metadata.dominantEffects,
    notes: result.notes,
    warnings: result.metadata.warnings
  };
}
```

## Benefits of Type Alias Integration

### 1. **Type Safety**
- All planetary positions now use the `Planet` type alias
- All lunar phases use the `LunarPhase` type alias
- All seasons use the `Season` type alias
- All dietary restrictions use the `DietaryRestriction` type alias

### 2. **Consistency**
- Ensures the same type definitions are used across the entire codebase
- Prevents mismatched types between different parts of the system
- Maintains the established naming conventions

### 3. **Maintainability**
- Changes to type definitions only need to be made in one place
- IDE autocomplete and type checking work correctly
- Easier to refactor and update types across the system

### 4. **Documentation**
- Type aliases serve as living documentation
- Clear indication of what values are expected
- Self-documenting code with proper type constraints

## Example Usage

### Test Component with Type Aliases

```typescript
// Sample ingredients for testing
const SAMPLE_INGREDIENTS: UnifiedIngredient[] = [
  {
    name: 'Basil',
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.2, Air: 0.4 },
    seasonality: ['summer', 'spring'] as Season[],
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Mars'] as Planet[]
    },
    category: 'herbs',
    flavorProfile: { sweet: 0.2, bitter: 0.1, spicy: 0.3, aromatic: 0.8 },
    culturalOrigins: ['Italian', 'Mediterranean']
  }
];
```

### Scoring with Type-Safe Options

```typescript
const result = await getRecommendedIngredients(
  ingredients,
  0.4, // Minimum score threshold
  10,  // Limit
  {
    debugMode: true,
    weights: {
      seasonalEffect: 1.2,
      elementalCompatibility: 1.1,
      transitEffect: 1.0
    }
  }
);
```

## Migration Notes

### Before (Generic Types)
```typescript
planetaryPositions?: Record<string, { sign: ZodiacSign; degree: number }>;
aspects?: Array<{ type: string; planet1: string; planet2: string; orb: number }>;
lunarPhase?: string;
seasonality?: string[];
planetaryRulers?: string[];
dietaryRestrictions?: string[];
```

### After (Type Aliases)
```typescript
planetaryPositions?: Record<Planet, PlanetaryPosition>;
aspects?: PlanetaryAspect[];
lunarPhase?: LunarPhase;
seasonality?: Season[];
planetaryRulers?: Planet[];
dietaryRestrictions?: DietaryRestriction[];
```

## Build Status

✅ **Build Successful**: The updated scoring system compiles successfully with all type aliases properly integrated.

✅ **Type Safety**: All interfaces now use the established type aliases from our type system.

✅ **Consistency**: The scoring system now follows the same type conventions as the rest of the codebase.

## Next Steps

1. **Test Integration**: Verify that the type aliases work correctly in runtime scenarios
2. **Update Other Services**: Apply similar type alias updates to other services
3. **Documentation**: Update other documentation to reflect the type alias usage
4. **Validation**: Ensure all type constraints are properly enforced at runtime 
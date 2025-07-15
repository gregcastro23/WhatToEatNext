# WhatToEatNext Type System

This directory contains all the type definitions used throughout the WhatToEatNext application. The type system is designed to ensure consistency and type safety across the codebase.

## Core Principles

1. **Single Source of Truth**: Each type has a canonical definition in one file
2. **Consistent Naming**: Follow naming conventions for each type category
3. **Type Guards**: Use type guards for runtime validation
4. **Validation**: Use validation functions when working with external data

## Directory Structure

- `constants.ts` - Defines all enums and constants
- `elemental.ts` - Elemental property types
- `lunar.ts` - Lunar phase types and conversions
- `state.ts` - State-related types (AstrologicalState, AlchemicalState)
- `recipe.ts` - Recipe and ingredient types
- `validation.ts` - Type validation functions
- `utils.ts` - Type guards and utility functions
- `index.ts` - Re-exports all public types

## Canonical Types

### Element

The canonical type for elements is the `Element` enum in `constants.ts`:

```typescript
export enum Element {
  Fire = 'Fire',
  Water = 'Water',
  Earth = 'Earth',
  Air = 'Air'
}
```

Always use this enum rather than string literals when working with elements.

### ZodiacSign

The canonical type for zodiac signs is the `ZodiacSign` enum in `constants.ts`:

```typescript
export enum ZodiacSign {
  Aries = 'aries',
  Taurus = 'taurus',
  // ... other signs
}
```

### LunarPhase

The canonical type for lunar phases is the `LunarPhase` enum in `constants.ts`:

```typescript
export enum LunarPhase {
  NewMoon = 'new moon',
  WaxingCrescent = 'waxing crescent',
  // ... other phases
}
```

### ElementalProperties

The canonical interface for elemental properties is in `elemental.ts`:

```typescript
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}
```

### AlchemicalState and AstrologicalState

The canonical interfaces for state are in `state.ts`:

```typescript
export interface AlchemicalState {
  currentZodiac: ZodiacSign;
  sunSign: ZodiacSign;
  lunarPhase: LunarPhase;
  elementalProperties: ElementalProperties;
  // ... other properties
}
```

## Type Guards and Validation

### Type Guards

Use type guards from `utils.ts` to check types at runtime:

```typescript
import { isElement, isZodiacSign } from './types';

// Check if a value is a valid Element
if (isElement(someValue)) {
  // someValue is now typed as Element
}
```

### Validation

Use validation functions from `validation.ts` to validate external data:

```typescript
import { validateRecipe, ValidationError } from './types';

try {
  const validatedRecipe = validateRecipe(apiResponse);
  // validatedRecipe is now typed as Recipe
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message);
  }
}
```

## Type Conversion

Use the conversion utilities to convert between different type formats:

```typescript
import { toElement, convertLunarPhaseFormat } from './types';

// Convert string to Element enum
const element = toElement('fire'); // Returns Element.Fire

// Convert between lunar phase formats
const { standard, withSpaces, withUnderscores } = convertLunarPhaseFormat('waxing_crescent');
```

## Best Practices

1. Always import types from `./types` rather than from individual files
2. Use type guards when working with dynamic data
3. Use validation functions for external/API data
4. Define new types in the appropriate file and re-export from `index.ts`
5. Add type guards and validation functions for new types
6. Document complex types with JSDoc comments 
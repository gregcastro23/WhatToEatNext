# Ingredient Data Structures

This document describes the TypeScript interfaces for ingredient data structures
used in the WhatToEatNext application.

## Core Ingredient Types

### `BaseIngredient`

The foundation for all ingredient types with essential properties:

```typescript
interface BaseIngredient {
  name: string;
  category: IngredientCategory;
  elementalProperties: ElementalProperties;
  qualities: string[];
  seasonality?: string[];
  lunarPhaseModifiers?: Record<string, LunarPhaseModifier>;
  sensoryProfile?: SensoryProfile;
  recommendedCookingMethods?: CookingMethod[];
}
```

### `Ingredient`

The full ingredient interface, extending `BaseIngredient` with additional
properties:

```typescript
interface Ingredient extends BaseIngredient {
  id?: string;
  description?: string;
  origin?: string[];
  subCategory?: string;
  varieties?: Record<string, VarietyDetails>;
  smokePoint?: Temperature;
  potency?: number;
  heatLevel?: number;
  preparation?: PreparationDetails;
  storage: StorageDetails;
  safetyThresholds?: SafetyThresholds;
  pairingRecommendations?: PairingRecommendations;
  elementalTransformation?: ElementalTransformation;
  modality?: Modality;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
}
```

### `RecipeIngredient`

Used specifically for ingredients within recipes:

```typescript
interface RecipeIngredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  category?: string;
  subCategory?: string;
  preparation?: string;
  optional?: boolean;
  substitutes?: string[];
  notes?: string;
  nutritionalProfile?: NutritionalProfile;
  elementalProperties?: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    elementalAffinity?: string | {
      base: string;
      secondary?: string;
    };
  };
  season?: string[];
  flavorProfile?: FlavorProfile;
}
```

### `SimpleIngredient`

A minimalist ingredient interface for basic recipe displays:

```typescript
interface SimpleIngredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
}
```

### `IngredientMapping`

Used primarily in data files for mapping ingredient data:

```typescript
interface IngredientMapping {
  name: string;
  elementalProperties: ElementalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  astrologicalProfile?: AstrologicalProfile;
  qualities?: string[];
  origin?: string[];
  category?: string;
  subCategory?: string;
  varieties?: Record<string, any>;
  nutritionalProfile?: NutritionalProfile;
  season?: string[];
  cookingMethods?: string[];
  // ... additional properties
  [key: string]: any;
}
```

## Supporting Types

### `IngredientCategory`

Defines the main categories of ingredients:

```typescript
type IngredientCategory =
  | 'culinary_herb'
  | 'spice'
  | 'vegetable'
  | 'fruit'
  | 'protein'
  | 'grain'
  | 'dairy'
  | 'oil';
```

### `SensoryProfile`

Describes the sensory characteristics of ingredients:

```typescript
interface SensoryProfile {
  taste: {
    sweet: number;
    salty: number;
    sour: number;
    bitter: number;
    umami: number;
    spicy: number;
  };
  aroma: {
    floral: number;
    fruity: number;
    herbal: number;
    spicy: number;
    earthy: number;
    woody: number;
  };
  texture: {
    crisp: number;
    tender: number;
    creamy: number;
    chewy: number;
    crunchy: number;
    silky: number;
  };
}
```

### `CookingMethod`

Describes cooking methods with their properties:

```typescript
interface CookingMethod {
  name: string;
  elementalEffect: Partial<ElementalProperties>;
  cookingTime: {
    min: number;
    max: number;
    unit: 'seconds' | 'minutes' | 'hours';
  };
  temperatures?: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  description: string;
}
```

### `AlchemicalProperties`

The alchemical properties of ingredients:

```typescript
interface AlchemicalProperties {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}
```

### `ThermodynamicProperties`

The thermodynamic properties of ingredients:

```typescript
interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
}
```

### `FlavorProfile`

Defines the flavor characteristics of ingredients:

```typescript
interface FlavorProfile {
  spicy: number;
  sweet: number;
  sour: number;
  bitter: number;
  salty: number;
  umami: number;
}
```

## Usage Examples

### Creating a Basic Ingredient

```typescript
import { Ingredient, IngredientCategory } from '@/types';

const basil: Ingredient = {
  name: 'Basil',
  category: 'culinary_herb',
  elementalProperties: {
    Fire: 0.2,
    Water: 0.3,
    Air: 0.4,
    Earth: 0.1
  },
  qualities: ['aromatic', 'sweet', 'fresh'],
  storage: {
    duration: '5-7 days',
    container: 'glass jar with water',
    temperature: 'room temperature',
    notes: 'Do not refrigerate, treat like fresh flowers'
  }
};
```

### Creating a Recipe Ingredient

```typescript
import { RecipeIngredient } from '@/types';

const basilInRecipe: RecipeIngredient = {
  name: 'Basil',
  amount: 2,
  unit: 'tbsp',
  preparation: 'chopped',
  elementalProperties: {
    Fire: 0.2,
    Water: 0.3,
    Air: 0.4,
    Earth: 0.1
  }
};
```

### Using the Ingredient Types in a Component

```tsx
import React from 'react';
import { Ingredient, RecipeIngredient } from '@/types';

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  showAmount = false
}) => {
  // Check if the ingredient is a RecipeIngredient by checking for 'amount' property
  const isRecipeIngredient = 'amount' in ingredient && 'unit' in ingredient;

  return (
    <div className="ingredient-card">
      <h3>{ingredient.name}</h3>

      {showAmount && isRecipeIngredient && (
        <div className="amount">
          {(ingredient as RecipeIngredient).amount} {(ingredient as RecipeIngredient).unit}
        </div>
      )}

      {/* Display elemental properties as color bars */}
      <div className="elemental-bars">
        <div
          className="fire-bar"
          style={{ width: `${ingredient.elementalProperties.Fire * 100}%` }}
        />
        <div
          className="water-bar"
          style={{ width: `${ingredient.elementalProperties.Water * 100}%` }}
        />
        <div
          className="earth-bar"
          style={{ width: `${ingredient.elementalProperties.Earth * 100}%` }}
        />
        <div
          className="air-bar"
          style={{ width: `${ingredient.elementalProperties.Air * 100}%` }}
        />
      </div>

      {/* Other ingredient details */}
    </div>
  );
};
```

## Best Practices

1. **Type Re-exports**: Import types from the central `@/types` index file
   rather than from individual files.

2. **Type Checking**: Use TypeScript's type guards to check which interface an
   object implements:

   ```typescript
   function isRecipeIngredient(ingredient: any): ingredient is RecipeIngredient {
     return ingredient && 'amount' in ingredient && 'unit' in ingredient;
   }
   ```

3. **Partial Data**: When working with partial ingredient data, use the
   `Partial<Ingredient>` type.

4. **Immutability**: Treat ingredient objects as immutable and create new
   objects when making changes.

5. **Validation**: Consider adding validation functions for ingredient data,
   especially when processing user input.

# Data Format Standards

This document outlines the standardized data formats used throughout the
application, with a focus on proper formatting, validation, and error handling.

## Table of Contents

1. [Introduction](#introduction)
2. [Using the Data Loader](#using-the-data-loader)
3. [Data Type Standards](#data-type-standards)
   - [Recipe Data](#recipe-data)
   - [Astrological Data](#astrological-data)
   - [Elemental Properties](#elemental-properties)
4. [Data Validation](#data-validation)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

## Introduction

Our application uses a standardized approach to data handling to ensure
consistency, type safety, and proper error handling across all components. This
document serves as a guide for contributors to understand and follow these
standards.

## Using the Data Loader

The `DataLoader` utility provides a robust way to load data with built-in
caching, validation, transformation, and error handling.

### Basic Usage

```typescript
import { createDataLoader } from '../utils/dataLoader';
import type { Recipe } from '../types/recipe';

// Create a loader for recipe data
const recipeLoader = createDataLoader<Recipe[]>({
  cacheKey: 'recipes',
  cacheTtl: 3600000, // 1 hour
  validator: (data) => Array.isArray(data) && data.length > 0,
  transformer: (data) => {
    // Transform the data as needed
    return (data as any[]).map(item => ({
      ...item,
      // Apply any additional transformations
    }));
  },
  fallback: [], // Fallback value if loading fails
  retry: {
    attempts: 3,
    delay: 1000
  }
});

// Load data
async function loadRecipes() {
  const result = await recipeLoader.loadData(async () => {
    const response = await fetch('/api/recipes');
    if (!response.ok) {
      throw new Error(`Failed to load recipes: ${response.statusText}`);
    }
    return response.json();
  });

  return result.data;
}
```

### Configuration Options

- `cacheKey`: Key to store/retrieve data from cache
- `cacheTtl`: Time-to-live for cached data in milliseconds
- `transformer`: Function to transform the loaded data
- `validator`: Function to validate the loaded data
- `fallback`: Default value to use if loading fails
- `throwOnError`: Whether to throw on error or use fallback
- `retry`: Configuration for retry attempts

## Data Type Standards

### Recipe Data

Recipes must follow this structure:

```typescript
interface Recipe {
  id: string;                     // Unique identifier
  name: string;                   // Recipe name (3-100 chars)
  description: string;            // Description
  cuisine: string;                // Cuisine type
  ingredients: RecipeIngredient[]; // List of ingredients
  instructions: string[];         // Step-by-step instructions
  timeToMake: string;             // Time to prepare and cook
  numberOfServings: number;       // Number of servings (1-12)
  elementalProperties: ElementalProperties; // Elemental properties

  // Optional properties
  mealType?: string | string[];   // Type of meal
  season?: string | string[];     // Season(s) the recipe is for
  isVegetarian?: boolean;         // Whether it's vegetarian
  isVegan?: boolean;              // Whether it's vegan
  isGlutenFree?: boolean;         // Whether it's gluten-free
  isDairyFree?: boolean;          // Whether it's dairy-free
  astrologicalInfluences?: string[]; // Astrological influences
  nutrition?: NutritionData;      // Nutritional information
  createdAt?: string;             // Creation timestamp
  updatedAt?: string;             // Last update timestamp
}
```

#### Ingredients Format

```typescript
interface RecipeIngredient {
  name: string;              // Ingredient name
  amount: number;            // Quantity
  unit: string;              // Unit of measurement
  category?: string;         // Category (e.g., "vegetable", "spice")
  optional?: boolean;        // Whether it's optional
  preparation?: string;      // Preparation instructions
  notes?: string;            // Additional notes
  elementalProperties?: ElementalProperties; // Elemental properties
}
```

### Astrological Data

Astrological data follows this structure:

```typescript
interface AstrologicalProfile {
  zodiac?: ZodiacSign[];          // Zodiac influences
  lunar?: LunarPhase[];           // Lunar phase influences
  planetary?: PlanetaryPosition[]; // Planetary positions
  aspects?: PlanetaryAspect[];    // Planetary aspects
}

interface PlanetaryPosition {
  planet: string;            // Planet name
  sign: ZodiacSign;          // Zodiac sign
  degree: number;            // Degree in sign (0-29)
  isRetrograde?: boolean;    // Whether the planet is retrograde
}

interface PlanetaryAspect {
  planetA: string;           // First planet
  planetB: string;           // Second planet
  aspect: string;            // Aspect type
  orb: number;               // Orb (deviation from exact aspect)
  influence: 'harmonious' | 'challenging' | 'neutral'; // Type of influence
}
```

### Elemental Properties

Elemental properties must always include all four elements:

```typescript
interface ElementalProperties {
  Fire: number;  // Fire element (0-1)
  Water: number; // Water element (0-1)
  Earth: number; // Earth element (0-1)
  Air: number;   // Air element (0-1)
}
```

## Data Validation

All data should be validated before use. The application provides type guards
for this purpose:

```typescript
import { isRecipe, isRecipeIngredient } from '../services/recipeData';
import {
  isAstrologicalProfile,
  isElementalProperties
} from '../utils/enhancedTypeGuards';

// Example validation
function processRecipe(data: unknown) {
  if (!isRecipe(data)) {
    throw new Error('Invalid recipe data');
  }

  // Now it's safe to use as Recipe
  const recipe: Recipe = data;

  // Process the recipe...
}
```

### Handling Unknown Data

Always use type guards when working with data that could be in an unknown
format:

```typescript
// Bad - assumes data structure is correct
function processBad(data: any) {
  return data.ingredients.map(i => i.name);
}

// Good - validates data before use
function processGood(data: unknown) {
  if (!isRecipe(data)) {
    return [];
  }

  return data.ingredients.map(i => i.name);
}
```

## Error Handling

Use the provided error handling utilities for consistent error management:

```typescript
import { AppError, errorCodes } from '../utils/errorHandling';

try {
  // Attempt to process data
} catch (error) {
  // Convert to AppError for consistent handling
  if (!(error instanceof AppError)) {
    throw new AppError(
      'Failed to process data',
      'DATA_ERROR',
      errorCodes.DATA_ERROR,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
  throw error;
}
```

### Error Types

Common error codes:

- `VALIDATION_ERROR`: For data validation failures
- `DATA_ERROR`: For general data processing errors
- `API_ERROR`: For API request failures
- `NOT_FOUND`: For resources that can't be found

## Best Practices

1. **Always validate data** before processing, especially data from external
   sources.

2. **Provide fallbacks** for all data loading operations to ensure the
   application remains functional.

3. **Use type guards** to ensure type safety when working with data of uncertain
   structure.

4. **Normalize data** to ensure consistency using the `dataTransformers`
   utilities.

5. **Handle errors gracefully** and provide meaningful feedback to users.

6. **Cache expensive operations** to improve performance.

7. **Use standardized formats** for all data structures.

8. **Document any deviations** from the standard formats with a clear
   explanation.

import { Element, ElementalProperties, ZodiacSign, LunarPhase } from '@/types/alchemy';

/**
 * 🚀 Phase 10: ExtendedRecipe Interface - Complete Property Access Support
 *
 * This interface extends the base Recipe with all properties that are accessed
 * across the codebase, preventing TS2339 property access errors.
 */

import {
  Recipe,
  RecipeIngredient,
  ElementalProperties as RecipeElementalProperties
} from './recipe';

/**
 * Extended Recipe Ingredient with all accessed properties
 */
export interface ExtendedRecipeIngredient extends RecipeIngredient {
  id?: string;
  preparation?: string;
  optional?: boolean;
  notes?: string,
  function?: string,
  cookingPoint?: string,
  substitutes?: string[]
}

/**
 * Extended Recipe Interface with all accessed properties
 */
export interface ExtendedRecipe extends Recipe {
  // Ensure core properties exist
  id: string;
  tags?: string[];
  notes?: string;
  preparation?: string;
  preparationNotes?: string;
  preparationSteps?: string[];
  procedure?: string | string[];
  prepTime?: string;
  preparation_time?: string;
  prep_time?: string;
  idealTimeOfDay?: string;

  // Enhanced ingredient support
  ingredients: ExtendedRecipeIngredient[];

  // Additional instruction variations
  instructions: string[];

  // Elemental properties with proper casing (Fire, Water, Earth, Air)
  elementalProperties: ElementalProperties;

  // Enhanced properties commonly accessed
  course?: string[];
  dishType?: string[];
  cookingMethod?: string[];
  cookingTechniques?: string[];
  equipmentNeeded?: string[];
  skillsRequired?: string[];

  // Flavor and texture
  flavorProfile?: {
    primary?: string[];
    accent?: string[];
    base?: string[];
    tasteBalance?: {
      sweet: number;
      salty: number,
      sour: number,
      bitter: number,
      umami: number
    };
  };

  texturalElements?: string[];
  aromatics?: string[];
  colorProfile?: string[];
  origin?: string;
  history?: string;
  traditionalOccasion?: string[];
  regionalVariations?: string[];

  pairingRecommendations?: {
    wines?: string[],
    beverages?: string[],
    sides?: string[],
    condiments?: string[]
  };

  nutrition?: {
    calories?: number;
    servingSize?: string;
    macronutrients?: {
      protein: number,
      carbs: number,
      fat: number,
      fiber: number
    };
  };

  seasonalIngredients?: string[];
  chefNotes?: string[];
  commonMistakes?: string[];
  tips?: string[];
  variations?: string[];

  presentationTips?: string[];
  sensoryIndicators?: {
    visual: string[],
    aroma: string[],
    texture: string[],
    sound: string[]
  };

  keywords?: string[];

  // Allow additional dynamic properties - this ensures compatibility
  [key: string]: unknown;
}

/**
 * Extended Scored Recipe
 */
export interface ExtendedScoredRecipe extends ExtendedRecipe {
  score: number;
  alchemicalScores?: {
    elementalScore: number;
    zodiacalScore: number,
    lunarScore: number,
    planetaryScore: number,
    seasonalScore: number
  };
}

/**
 * Type guard to check if a recipe is an ExtendedRecipe
 */
export function isExtendedRecipe(recipe: unknown): recipe is ExtendedRecipe {
  return (
    typeof recipe === 'object' &&;
    recipe !== null &&
    typeof (recipe as ExtendedRecipe).id === 'string' &&;
    typeof (recipe as ExtendedRecipe).name === 'string';
  )
}

/**
 * Convert a basic Recipe to ExtendedRecipe
 */
export function toExtendedRecipe(recipe: Recipe): ExtendedRecipe {
  return {
    ...recipe;
    id: recipe.id || 'recipe-' + Date.now();
    tags: recipe.tags || [],
    notes: recipe.notes || '';
    preparation: recipe.preparation || '';
    preparationNotes: recipe.preparationNotes || '';
    ingredients: (recipe.ingredients || []).map(ingredient => {
      const extendedIngredient = ingredient as unknown as any;
      return {
        ...ingredient;
        id:
          typeof extendedIngredient.id === 'string';
            ? extendedIngredient.id
            : 'ingredient-' + Date.now();
        preparation:
          typeof extendedIngredient.preparation === 'string' ? extendedIngredient.preparation : '',;
        optional:
          typeof extendedIngredient.optional === 'boolean' ? extendedIngredient.optional : false,,;
        notes: typeof extendedIngredient.notes === 'string' ? extendedIngredient.notes : '',,;
      };
    })
  } as ExtendedRecipe;
}

export default ExtendedRecipe;

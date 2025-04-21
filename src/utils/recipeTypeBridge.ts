/**
 * Recipe Type Bridge Utility
 * 
 * This utility provides functions to convert between different Recipe types
 * that exist in the codebase, primarily between Recipe from types/recipe.ts
 * and Recipe from types/alchemy.ts.
 */

import { Recipe as RecipeType } from '../types/recipe';
import { Recipe as AlchemyRecipe } from '../types/alchemy';

/**
 * Convert a Recipe from types/recipe.ts to a Recipe from types/alchemy.ts
 */
export function convertToAlchemyRecipe(recipe: RecipeType): AlchemyRecipe {
  const {
    id,
    name,
    description,
    cuisine,
    ingredients = [],
    instructions = [],
    prepTime = 0,
    cookTime = 0,
    numberOfServings = 0,
    elementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    mealType,
    season,
    cookingMethod,
    tags = [],
  } = recipe;

  // Convert ingredients
  const convertedIngredients = ingredients.map(ingredient => ({
    name: ingredient.name,
    amount: typeof ingredient.amount === 'string' ? parseFloat(ingredient.amount) : ingredient.amount,
    unit: ingredient.unit,
    category: ingredient.category,
    element: ingredient.elementalProperties 
      ? Object.entries(ingredient.elementalProperties)
          .sort(([, a], [, b]) => b - a)[0][0] 
      : 'Earth'
  }));
  
  // Calculate timeToMake
  const timeToMake = typeof prepTime === 'number' && typeof cookTime === 'number'
    ? prepTime + cookTime
    : typeof recipe.timeToMake === 'string'
    ? parseInt(recipe.timeToMake, 10) || 0
    : 0;

  return {
    id,
    name,
    description,
    cuisine,
    ingredients: convertedIngredients,
    cookingMethod: cookingMethod || 'baking', // Default to 'baking' if not specified
    timeToMake,
    numberOfServings: typeof numberOfServings === 'number' ? numberOfServings : recipe.servingSize || 0,
    elementalProperties,
    tags,
    season: Array.isArray(season) ? season : season ? [season] : [],
    mealType: Array.isArray(mealType) ? mealType : mealType ? [mealType] : [],
  };
}

/**
 * Convert a Recipe from types/alchemy.ts to a Recipe from types/recipe.ts
 */
export function convertToRecipeType(alchemyRecipe: AlchemyRecipe): RecipeType {
  const {
    id,
    name,
    description,
    cuisine,
    ingredients = [],
    cookingMethod,
    timeToMake,
    numberOfServings,
    elementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    tags = [],
    season = [],
    mealType = [],
  } = alchemyRecipe;

  // Convert ingredients
  const convertedIngredients = ingredients.map(ingredient => ({
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    category: ingredient.category,
    elementalProperties: {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
      [ingredient.element]: 1,
    }
  }));

  return {
    id,
    name,
    description: description || '',
    cuisine: cuisine || '',
    ingredients: convertedIngredients,
    instructions: alchemyRecipe.instructions || [],
    timeToMake: `${timeToMake}`,
    prepTime: Math.floor(timeToMake / 2),
    cookTime: Math.ceil(timeToMake / 2),
    servingSize: numberOfServings,
    elementalProperties,
    mealType,
    season,
    cookingMethod,
    tags,
    // Add other required properties with reasonable defaults
    image: ''
  };
}

/**
 * Check if a recipe is from types/alchemy.ts
 */
export function isAlchemyRecipe(recipe: RecipeType | AlchemyRecipe): recipe is AlchemyRecipe {
  return (
    recipe &&
    typeof recipe === 'object' &&
    'timeToMake' in recipe &&
    typeof recipe.timeToMake === 'number'
  );
}

/**
 * Check if a recipe is from types/recipe.ts
 */
export function isRecipeType(recipe: RecipeType | AlchemyRecipe): recipe is RecipeType {
  return (
    recipe &&
    typeof recipe === 'object' &&
    ('timeToMake' in recipe && typeof recipe.timeToMake === 'string' || 'prepTime' in recipe)
  );
} 
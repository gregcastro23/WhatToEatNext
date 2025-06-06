import type { Recipe, 
  RecipeIngredient, 
  ElementalProperties, 
  ScoredRecipe } from "@/types/recipe";

import { createElementalProperties, isElementalProperties } from '../elemental/elementalUtils';
import { isNonEmptyArray, safeSome, toArray } from '../common/arrayUtils';

import { Element } from "@/types/alchemy";

/**
 * Type guard to check if an object is a Recipe
 */
export function isRecipe(obj: unknown): obj is Recipe {
  if (!obj || typeof obj !== 'object') return false;
  
  const recipe = obj as Partial<Recipe>;
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.ingredients)
  );
}

/**
 * Type guard to check if an object is a ScoredRecipe
 */
export function isScoredRecipe(obj: any): obj is ScoredRecipe {
  if (!isRecipe(obj)) return false;
  
  const scoredRecipe = obj as Partial<ScoredRecipe>;
  return typeof scoredRecipe.score === 'number';
}

/**
 * Type guard to check if an ingredient is a RecipeIngredient object (not string)
 */
export function isRecipeIngredient(ingredient: any): ingredient is RecipeIngredient {
  return typeof ingredient === 'object' && 
         typeof (ingredient as RecipeIngredient).name === 'string' &&
         typeof (ingredient as RecipeIngredient).amount === 'number' &&
         typeof (ingredient as RecipeIngredient).unit === 'string';
}

/**
 * Gets the recipe's elemental properties safely with fallback to default values
 */
export function getRecipeElementalProperties(recipe: Recipe): ElementalProperties {
  if (!recipe) {
    return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  if (recipe.elementalState && isElementalProperties(recipe.elementalState)) {
    return recipe.elementalState;
  }

  // Try to get from elementalMapping if available
  if (recipe.elementalMapping?.elementalState && 
      isElementalProperties(recipe.elementalMapping.elementalState)) {
    return recipe.elementalMapping.elementalState;
  }

  return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
}

/**
 * Gets the cooking method(s) of a recipe safely
 */
export function getRecipeCookingMethods(recipe: Recipe): string[] {
  if (!recipe) return [];

  // Check cookingMethod (string or string[])
  if (typeof recipe.cookingMethods === 'string') {
    return [recipe.cookingMethods];
  }
  
  if (Array.isArray(recipe.cookingMethods)) {
    return recipe.cookingMethods;
  }

  // Check for backward compatibility with cookingMethods
  if (Array.isArray((recipe as Record<string, any>)?.cookingMethods)) {
    return (recipe as Record<string, any>).cookingMethods;
  }

  return [];
}

/**
 * Gets the meal type(s) of a recipe safely
 */
export function getRecipeMealTypes(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  if (recipe.mealType) {
    return toArray(recipe.mealType);
  }
  
  return [];
}

/**
 * Gets the season(s) of a recipe safely
 */
export function getRecipeSeasons(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  if (recipe.currentSeason) {
    return toArray(recipe.currentSeason);
  }
  
  return [];
}

/**
 * Gets the astrological influences of a recipe safely
 */
export function getRecipeAstrologicalInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  if (Array.isArray(recipe.astrologicalPropertiesInfluences)) {
    return recipe.astrologicalPropertiesInfluences;
  }
  
  // Try to get from elementalMapping if available
  if (recipe.elementalMapping?.astrologicalInfluences && 
      Array.isArray(recipe.elementalMapping.astrologicalInfluences)) {
    return recipe.elementalMapping.astrologicalInfluences;
  }
  
  return [];
}

/**
 * Gets the zodiac influences of a recipe safely
 */
export function getRecipeZodiacInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  if (Array.isArray(recipe.zodiacInfluences)) {
    return recipe.zodiacInfluences;
  }
  
  // Try to get from elementalMapping if available
  if (recipe.elementalMapping?.astrologicalProfile?.favorableZodiac && 
      Array.isArray(recipe?.elementalMapping?.astrologicalProfile?.favorableZodiac)) {
    return recipe?.elementalMapping?.astrologicalProfile?.favorableZodiac;
  }
  
  return [];
}

/**
 * Gets the cooking time of a recipe safely
 */
export function getRecipeCookingTime(recipe: Recipe): number {
  if (!recipe) return 0;
  
  if (typeof recipe.cookingTime === 'number') {
    return recipe.cookingTime;
  }
  
  if (typeof recipe.totalTime === 'number') {
    return recipe.totalTime;
  }
  
  if (typeof recipe.timeToMake === 'number') {
    return recipe.timeToMake;
  }
  
  if (typeof recipe.timeToMake === 'string') {
    // Try to extract number from string like "30 minutes"
    const match = recipe.timeToMake.match(/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return 0;
}

/**
 * Checks if a recipe has a specific tag
 */
export function recipeHasTag(recipe: Recipe, tag: string): boolean {
  if (!recipe || !tag) return false;
  
  return safeSome(Array.isArray(recipe.tags) ? recipe.tags : [recipe.tags], (t) => t === tag?.toLowerCase());
}

/**
 * Checks if a recipe is compatible with a dietary restriction
 */
export function isRecipeCompatibleWithDiet(recipe: Recipe, restriction: string): boolean {
  if (!recipe) return false;
  
  switch (restriction?.toLowerCase()) {
    case 'vegetarian':
      return recipe.isVegetarian === true;
    case 'vegan':
      return recipe.isVegan === true;
    case 'gluten-free':
    case 'glutenfree':
      return recipe.isGlutenFree === true;
    case 'dAiry-free':
    case 'dAiryfree':
      return recipe.isDAiryFree === true;
    case 'nut-free':
    case 'nutfree':
      return recipe.isNutFree === true;
    case 'low-carb':
    case 'lowcarb':
      return recipe.isLowCarb === true;
    case 'keto':
      return recipe.isKeto === true;
    case 'paleo':
      return recipe.isPaleo === true;
    default:
      return safeSome(recipe.dietaryTags, tag => tag?.toLowerCase() === restriction?.toLowerCase());
  }
}

/**
 * Checks if a recipe has a specific ingredient
 */
export function recipeHasIngredient(recipe: Recipe, ingredientName: string): boolean {
  if (!recipe || !ingredientName || !isNonEmptyArray(recipe.ingredients)) {
    return false;
  }
  
  const normalizedName = ingredientName?.toLowerCase();
  
  return recipe.ingredients  || [].some(ingredient => {
    if (typeof ingredient === 'string') {
      return ingredient?.toLowerCase()?.includes(normalizedName);
    }
    
    if (isRecipeIngredient(ingredient)) {
      return ingredient.name?.toLowerCase()?.includes(normalizedName);
    }
    
    return false;
  });
}

/**
 * Gets the dominant element from a recipe
 */
export function getRecipeDominantElement(recipe: Recipe): string {
  const elementalProperties = getRecipeElementalProperties(recipe);
  let maxElement = 'Fire';
  let maxValue = elementalProperties.Fire;
  
  if (elementalProperties.Water > maxValue) {
    maxElement = 'Water';
    maxValue = elementalProperties.Water;
  }
  
  if (elementalProperties.Earth > maxValue) {
    maxElement = 'Earth';
    maxValue = elementalProperties.Earth;
  }
  
  if (elementalProperties.Air > maxValue) {
    maxElement = 'Air';
    maxValue = elementalProperties.Air;
  }
  
  return maxElement;
}

/**
 * Gets a safe version of the recipe's name
 */
export function getSafeRecipeName(recipe: Recipe): string {
  if (!recipe) return 'Unknown Recipe';
  return recipe.name || 'Unnamed Recipe';
}

/**
 * Gets a safe version of the recipe's description
 */
export function getSafeRecipeDescription(recipe: Recipe): string {
  if (!recipe) return '';
  return recipe.description || '';
}

/**
 * Safely convert any Recipe to a ScoredRecipe with optional score
 */
export function toScoredRecipe(recipe: Recipe, score?: number): ScoredRecipe {
  if (isScoredRecipe(recipe)) {
    return recipe;
  }
  
  return {
    ...recipe,
    score: score ?? 0,
    alchemicalScores: recipe.alchemicalScores || {
      elementalScore: 0,
      zodiacalScore: 0,
      lunarScore: 0,
      planetaryScore: 0,
      seasonalScore: 0,
    }
  };
} 
/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(recipe: any, dietaryRestrictions: string[] = []): boolean {
  if (!recipe || !dietaryRestrictions.length) {
    return true;
  }
  
  // Check if recipe has dietary tags or properties
  const recipeTags = recipe.tags || recipe.dietaryTags || [];
  const recipeIngredients = recipe.ingredients || [];
  
  // Simple compatibility check
  for (const restriction of dietaryRestrictions) {
    const restrictionLower = restriction.toLowerCase();
    
    // Check if recipe explicitly supports this dietary restriction
    if (recipeTags.some((tag: string) => tag.toLowerCase().includes(restrictionLower))) {
      continue;
    }
    
    // Basic ingredient checks for common restrictions
    if (restrictionLower.includes('vegan') || restrictionLower.includes('vegetarian')) {
      const hasAnimalProducts = recipeIngredients.some((ing: any) => 
        (ing.name || ing).toLowerCase().includes('meat') ||
        (ing.name || ing).toLowerCase().includes('chicken') ||
        (ing.name || ing).toLowerCase().includes('beef') ||
        (ing.name || ing).toLowerCase().includes('pork')
      );
      if (hasAnimalProducts) return false;
    }
    
    if (restrictionLower.includes('gluten-free')) {
      const hasGluten = recipeIngredients.some((ing: any) => 
        (ing.name || ing).toLowerCase().includes('wheat') ||
        (ing.name || ing).toLowerCase().includes('flour') ||
        (ing.name || ing).toLowerCase().includes('bread')
      );
      if (hasGluten) return false;
    }
  }
  
  return true;
}

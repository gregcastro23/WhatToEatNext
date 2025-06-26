import type { Recipe, 
  RecipeIngredient, 
  ElementalProperties, 
  ScoredRecipe } from "@/types/recipe";

import { _createElementalProperties, _isElementalProperties } from '../elemental/elementalUtils';
import { _isNonEmptyArray, _safeSome, _toArray } from '../common/arrayUtils';

import { _Element } from "@/types/alchemy";

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
export function isScoredRecipe(obj: Record<string, unknown>): obj is ScoredRecipe {
  if (!isRecipe(obj)) return false;
  
  const scoredRecipe = obj as Partial<ScoredRecipe>;
  return typeof scoredRecipe.score === 'number';
}

/**
 * Type guard to check if an ingredient is a RecipeIngredient object (not string)
 */
export function isRecipeIngredient(ingredient: Record<string, unknown>): ingredient is RecipeIngredient {
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

  const recipeData = recipe as unknown;
  
  if (recipeData?.elementalState && isElementalProperties(recipeData.elementalState)) {
    return recipeData.elementalState;
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipeData?.elementalMapping;
  if (elementalMapping?.elementalState && 
      isElementalProperties(elementalMapping.elementalState)) {
    return elementalMapping.elementalState;
  }

  return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
}

/**
 * Gets the cooking method(s) of a recipe safely
 */
export function getRecipeCookingMethods(recipe: Recipe): string[] {
  if (!recipe) return [];

  const recipeData = recipe as unknown;
  
  // Check cookingMethod (string or string[])
  if (typeof recipeData?.cookingMethods === 'string') {
    return [recipeData.cookingMethods];
  }
  
  if (Array.isArray(recipeData?.cookingMethods)) {
    return recipeData.cookingMethods;
  }

  // Check for backward compatibility with cookingMethod
  if (typeof recipeData?.cookingMethod === 'string') {
    return [recipeData.cookingMethod];
  }

  return [];
}

/**
 * Gets the meal type(s) of a recipe safely
 */
export function getRecipeMealTypes(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const recipeData = recipe as unknown;
  
  if (recipeData?.mealType) {
    return toArray(recipeData.mealType);
  }
  
  return [];
}

/**
 * Gets the season(s) of a recipe safely
 */
export function getRecipeSeasons(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const recipeData = recipe as unknown;
  
  if (recipeData?.currentSeason) {
    return toArray(recipeData.currentSeason);
  }
  
  if (recipeData?.season) {
    return toArray(recipeData.season);
  }
  
  return [];
}

/**
 * Gets the astrological influences of a recipe safely
 */
export function getRecipeAstrologicalInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const recipeData = recipe as unknown;
  
  if (Array.isArray(recipeData?.astrologicalPropertiesInfluences)) {
    return recipeData.astrologicalPropertiesInfluences;
  }
  
  if (Array.isArray(recipeData?.astrologicalInfluences)) {
    return recipeData.astrologicalInfluences;
  }
  
  // Try to get from elementalMapping if available
  const elementalMapping = recipeData?.elementalMapping;
  if (elementalMapping?.astrologicalInfluences && 
      Array.isArray(elementalMapping.astrologicalInfluences)) {
    return elementalMapping.astrologicalInfluences;
  }
  
  return [];
}

/**
 * Gets the zodiac influences of a recipe safely
 */
export function getRecipeZodiacInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const recipeData = recipe as unknown;
  
  if (Array.isArray(recipeData?.zodiacInfluences)) {
    return recipeData.zodiacInfluences;
  }
  
  // Try to get from elementalMapping if available
  const elementalMapping = recipeData?.elementalMapping;
  const astrologicalProfile = elementalMapping?.astrologicalProfile;
  if (astrologicalProfile?.favorableZodiac && 
      Array.isArray(astrologicalProfile.favorableZodiac)) {
    return astrologicalProfile.favorableZodiac;
  }
  
  return [];
}

/**
 * Gets the cooking time of a recipe safely
 */
export function getRecipeCookingTime(recipe: Recipe): number {
  if (!recipe) return 0;
  
  const recipeData = recipe as unknown;
  
  if (typeof recipeData?.cookingTime === 'number') {
    return recipeData.cookingTime;
  }
  
  if (typeof recipeData?.totalTime === 'number') {
    return recipeData.totalTime;
  }
  
  if (typeof recipeData?.timeToMake === 'number') {
    return recipeData.timeToMake;
  }
  
  if (typeof recipeData?.timeToMake === 'string') {
    // Try to extract number from string like "30 minutes"
    const match = recipeData.timeToMake.match(/(\d+)/);
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
  
  const recipeData = recipe as unknown;
  const tags = Array.isArray(recipeData?.tags) ? recipeData.tags : [recipeData?.tags];
  
  return safeSome(tags, (t) => t === tag?.toLowerCase());
}

/**
 * Checks if a recipe is compatible with a dietary restriction
 */
export function isRecipeCompatibleWithDiet(recipe: Recipe, restriction: string): boolean {
  if (!recipe) return false;
  
  const recipeData = recipe as unknown;
  
  switch (restriction?.toLowerCase()) {
    case 'vegetarian':
      return recipeData?.isVegetarian === true;
    case 'vegan':
      return recipeData?.isVegan === true;
    case 'gluten-free':
      return recipeData?.isGlutenFree === true;
    case 'dairy-free':
      return recipeData?.isDairyFree === true;
    case 'keto':
      return recipeData?.isKeto === true;
    case 'paleo':
      return recipeData?.isPaleo === true;
    default:
      return true;
  }
}

/**
 * Checks if a recipe contains a specific ingredient
 */
export function recipeHasIngredient(recipe: Recipe, ingredientName: string): boolean {
  if (!recipe || !ingredientName) return false;
  
  const recipeData = recipe as unknown;
  const ingredients = recipeData?.ingredients || [];
  
  if (!Array.isArray(ingredients)) return false;
  
  const searchName = ingredientName.toLowerCase();
  
  return ingredients.some((ingredient: Record<string, unknown>) => {
    const ingredientData = ingredient as unknown;
    
    // Handle both string and object ingredients
    if (typeof ingredientData === 'string') {
      return ingredientData.toLowerCase().includes(searchName);
    }
    
    if (typeof ingredientData === 'object' && ingredientData?.name) {
      return ingredientData.name.toLowerCase().includes(searchName);
    }
    
    return false;
  });
}

/**
 * Gets the dominant element of a recipe
 */
export function getRecipeDominantElement(recipe: Recipe): string {
  if (!recipe) return 'Earth'; // Default element
  
  const elementalProperties = getRecipeElementalProperties(recipe);
  
  // Find the element with the highest value
  let maxElement = 'Earth';
  let maxValue = 0;
  
  (['Fire', 'Water', 'Earth', 'Air'] as const).forEach(element => {
    const elementData = elementalProperties as unknown;
    const value = elementData?.[element] || 0;
    if (value > maxValue) {
      maxValue = value;
      maxElement = element;
    }
  });
  
  return maxElement;
}

/**
 * Gets a safe recipe name with fallback
 */
export function getSafeRecipeName(recipe: Recipe): string {
  if (!recipe) return 'Unknown Recipe';
  
  const recipeData = recipe as unknown;
  return recipeData?.name || 'Unknown Recipe';
}

/**
 * Gets a safe recipe description with fallback
 */
export function getSafeRecipeDescription(recipe: Recipe): string {
  if (!recipe) return 'No description available';
  
  const recipeData = recipe as unknown;
  return recipeData?.description || 'No description available';
}

/**
 * Converts a Recipe to a ScoredRecipe with optional score
 */
export function toScoredRecipe(recipe: Recipe, score?: number): ScoredRecipe {
  if (!recipe) {
    throw new Error('Cannot convert null or undefined recipe to ScoredRecipe');
  }
  
  const defaultScore = score !== undefined ? score : 0.5;
  
  return {
    ...recipe,
    score: defaultScore
  } as ScoredRecipe;
}

/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(recipe: Record<string, unknown>, dietaryRestrictions: string[] = []): boolean {
  if (!recipe || !Array.isArray(dietaryRestrictions) || dietaryRestrictions.length === 0) {
    return true;
  }
  
  const recipeData = recipe as unknown;
  
  return dietaryRestrictions.every(restriction => {
    switch (restriction.toLowerCase()) {
      case 'vegetarian':
        return recipeData?.isVegetarian === true;
      case 'vegan':
        return recipeData?.isVegan === true;
      case 'gluten-free':
        return recipeData?.isGlutenFree === true;
      case 'dairy-free':
        return recipeData?.isDairyFree === true;
      case 'nut-free':
        return recipeData?.isNutFree === true;
      case 'keto':
        return recipeData?.isKeto === true;
      case 'paleo':
        return recipeData?.isPaleo === true;
      default:
        return true; // Unknown restrictions are ignored
    }
  });
}

/**
 * Gets safe ingredient list from recipe
 */
export function getRecipeIngredients(recipe: Recipe): RecipeIngredient[] {
  if (!recipe) return [];
  
  const recipeData = recipe as unknown;
  const ingredients = recipeData?.ingredients || [];
  
  if (!Array.isArray(ingredients)) return [];
  
  return ingredients.map((ingredient: Record<string, unknown>) => {
    const ingredientData = ingredient as unknown;
    
    // Handle both string and object ingredients
    if (typeof ingredientData === 'string') {
      return {
        name: ingredientData,
        amount: 1,
        unit: 'piece'
      } as RecipeIngredient;
    }
    
    if (typeof ingredientData === 'object') {
      return {
        name: ingredientData?.name || 'Unknown ingredient',
        amount: ingredientData?.amount || 1,
        unit: ingredientData?.unit || 'piece',
        optional: ingredientData?.optional || false,
        preparation: ingredientData?.preparation || undefined
      } as RecipeIngredient;
    }
    
    return {
      name: 'Unknown ingredient',
      amount: 1,
      unit: 'piece'
    } as RecipeIngredient;
  }).filter(ingredient => ingredient.name !== 'Unknown ingredient');
}

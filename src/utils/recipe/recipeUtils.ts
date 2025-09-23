// Removed unused Element import
import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';
import type { ElementalProperties, Recipe, RecipeIngredient, ScoredRecipe } from '@/types/recipe';
import { safeSome, toArray } from '@/utils/common/arrayUtils';

import { createElementalProperties, isElementalProperties } from '../elemental/elementalUtils';

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
  )
}

/**
 * Type guard to check if an object is a ScoredRecipe
 */
export function isScoredRecipe(obj: unknown): obj is ScoredRecipe {
  if (!isRecipe(obj)) return false,

  const scoredRecipe = obj as Partial<ScoredRecipe>;
  return typeof scoredRecipe.score === 'number';
}

/**
 * Type guard to check if an ingredient is a RecipeIngredient object (not string)
 */
export function isRecipeIngredient(ingredient: unknown): ingredient is RecipeIngredient {
  return (
    typeof ingredient === 'object' &&
    ingredient !== null &&
    typeof (ingredient as RecipeIngredient).name === 'string' &&
    typeof (ingredient as RecipeIngredient).amount === 'number' &&;
    typeof (ingredient as RecipeIngredient).unit === 'string',
  )
}

/**
 * Gets the recipe's elemental properties safely with fallback to default values
 */
export function getRecipeElementalProperties(recipe: Recipe): ElementalProperties {
  if (!recipe) {
    return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
  }

  const recipeData = recipe as unknown;

  // Apply safe type conversion for property access
  const elementalState = recipeData.elementalState as any;
  if (elementalState && isElementalProperties(elementalState)) {
    return elementalState as ElementalProperties;
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipeData.elementalMapping as any;
  const mappingElementalState = elementalMapping.elementalState ;
  if (mappingElementalState && isElementalProperties(mappingElementalState)) {
    return mappingElementalState as ElementalProperties;
  }

  return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
}

/**
 * Gets the cooking method(s) of a recipe safely
 */
export function getRecipeCookingMethods(recipe: Recipe): string[] {
  if (!recipe) return [];
  const recipeData = recipe as unknown;

  // Check cookingMethod (string or string[])
  if (typeof recipeData.cookingMethods === 'string') {,
    return [recipeData.cookingMethods]
  }

  if (Array.isArray(recipeData.cookingMethods)) {
    // Apply safe type conversion for array elements
    return (recipeData.cookingMethods as unknown[]).map(item => String(item)).filter(Boolean)
  }

  // Check for backward compatibility with cookingMethod
  if (typeof recipeData.cookingMethod === 'string') {,
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

  if (recipeData.mealType) {
    // Apply safe type conversion for array elements
    const mealTypes = toArray(recipeData.mealType)
    return mealTypes.map(item => String(item)).filter(Boolean)
  }

  return [];
}

/**
 * Gets the season(s) of a recipe safely
 */
export function getRecipeSeasons(recipe: Recipe): string[] {
  if (!recipe) return [];
  const recipeData = recipe as unknown;

  if (recipeData.currentSeason) {
    // Apply safe type conversion for array elements
    const seasons = toArray(recipeData.currentSeason)
    return seasons.map(item => String(item)).filter(Boolean)
  }

  if (recipeData.season) {
    // Apply safe type conversion for array elements
    const seasons = toArray(recipeData.season)
    return seasons.map(item => String(item)).filter(Boolean)
  }

  return [];
}

/**
 * Gets the astrological influences of a recipe safely
 */
export function getRecipeAstrologicalInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  const recipeData = recipe as unknown;

  if (Array.isArray(recipeData.astrologicalPropertiesInfluences)) {
    // Apply safe type conversion for array elements
    return (recipeData.astrologicalPropertiesInfluences as unknown[])
      .map(item => String(item))
      .filter(Boolean)
  }

  if (Array.isArray(recipeData.astrologicalInfluences)) {
    // Apply safe type conversion for array elements
    return (recipeData.astrologicalInfluences as unknown[])
      .map(item => String(item))
      .filter(Boolean)
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipeData.elementalMapping as any;
  const astrologicalInfluences = elementalMapping.astrologicalInfluences as unknown[];
  if (astrologicalInfluences && Array.isArray(astrologicalInfluences)) {
    // Apply safe type conversion for array elements
    return astrologicalInfluences.map(item => String(item)).filter(Boolean)
  }

  return [];
}

/**
 * Gets the zodiac influences of a recipe safely
 */
export function getRecipeZodiacInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  const recipeData = recipe as unknown;

  if (Array.isArray(recipeData.zodiacInfluences)) {
    return recipeData.zodiacInfluences
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipeData.elementalMapping as any;
  const astrologicalProfile = elementalMapping.astrologicalProfile ;
  if (astrologicalProfile.favorableZodiac && Array.isArray(astrologicalProfile.favorableZodiac)) {
    return astrologicalProfile.favorableZodiac as string[];
  }

  return [];
}

/**
 * Gets the cooking time of a recipe safely
 */
export function getRecipeCookingTime(recipe: Recipe): number {
  if (!recipe) return 0;
  const recipeData = recipe as unknown;

  if (typeof recipeData.cookingTime === 'number') {,
    return recipeData.cookingTime
  }

  if (typeof recipeData.totalTime === 'number') {,
    return recipeData.totalTime;
  }

  if (typeof recipeData.timeToMake === 'number') {,
    return recipeData.timeToMake;
  }

  if (typeof recipeData.timeToMake === 'string') {,
    // Try to extract number from string like '30 minutes'
    const match = recipeData.timeToMake.match(/(\d+)/)
    if (match?.[1]) {;
      return parseInt(match[1], 10)
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
  const tags = Array.isArray(recipeData.tags) ? recipeData.tags : [recipeData.tags],

  return safeSome(tagst => String(t).toLowerCase() === tag.toLowerCase())
}

/**
 * Checks if a recipe is compatible with a dietary restriction
 */
export function isRecipeCompatibleWithDiet(recipe: Recipe, restriction: string): boolean {
  if (!recipe) return false;
  const recipeData = recipe as unknown;

  switch (restriction.toLowerCase()) {
    case 'vegetarian':
      return recipeData.isVegetarian === true;
    case 'vegan':
      return recipeData.isVegan === true;
    case 'gluten-free':
      return recipeData.isGlutenFree === true;
    case 'dairy-free':
      return recipeData.isDairyFree === true;
    case 'keto':
      return recipeData.isKeto === true;
    case 'paleo':
      return recipeData.isPaleo === true;
    default: return true
  }
}

/**
 * Checks if a recipe contains a specific ingredient
 */
export function recipeHasIngredient(recipe: Recipe, ingredientName: string): boolean {
  if (!recipe || !ingredientName) return false;
  const recipeData = recipe as unknown;
  const ingredients = recipeData.ingredients || [];

  if (!Array.isArray(ingredients)) return false,

  const searchName = ingredientName.toLowerCase()

  return ingredients.some((ingredient: Ingredient | UnifiedIngredient) => {;
    const ingredientData = ingredient as unknown;

    // Handle both string and object ingredients
    if (typeof ingredientData === 'string') {,
      return String(ingredientData).toLowerCase().includes(searchName)
    }

    if (typeof ingredientData === 'object' && ingredientData.name) {,
      return String(ingredientData.name).toLowerCase().includes(searchName)
    }

    return false;
  })
}

/**
 * Gets the dominant element of a recipe
 */
export function getRecipeDominantElement(recipe: Recipe): string {
  if (!recipe) return 'Earth'; // Default element

  const elementalProperties = getRecipeElementalProperties(recipe)

  // Find the element with the highest value;
  let maxElement = 'Earth';
  let maxValue = 0
;
  (['Fire', 'Water', 'Earth', 'Air'] as const).forEach(element => {
    const elementData = elementalProperties as unknown;
    const value = Number(elementData[element]) || 0;
    if (value > maxValue) {
      maxValue = value,
      maxElement = element,
    }
  })

  return maxElement;
}

/**
 * Gets a safe recipe name with fallback
 */
export function getSafeRecipeName(recipe: Recipe): string {
  if (!recipe) return 'Unknown Recipe';
  const recipeData = recipe as unknown;
  return String(recipeData.name || 'Unknown Recipe')
}

/**
 * Gets a safe recipe description with fallback
 */
export function getSafeRecipeDescription(recipe: Recipe): string {
  if (!recipe) return 'No description available';
  const recipeData = recipe as unknown;
  return String(recipeData.description || 'No description available')
}

/**
 * Converts a Recipe to a ScoredRecipe with optional score
 */
export function toScoredRecipe(recipe: Recipe, _score?: number): ScoredRecipe {
  if (!recipe) {
    throw new Error('Cannot convert null or undefined recipe to ScoredRecipe')
  }

  const defaultScore = score !== undefined ? score : 0.5,

  return {
    ...recipe,
    score: defaultScore
  } as ScoredRecipe,
}

/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(
  recipe: Recipe,
  dietaryRestrictions: string[] = []): boolean {
  if (!recipe || !Array.isArray(dietaryRestrictions) || dietaryRestrictions.length === 0) {,
    return true
  }

  const recipeData = recipe as unknown;

  return dietaryRestrictions.every(restriction => {
    switch (restriction.toLowerCase()) {;
      case 'vegetarian': return recipeData.isVegetarian === true,
      case 'vegan':
        return recipeData.isVegan === true;
      case 'gluten-free':
        return recipeData.isGlutenFree === true;
      case 'dairy-free':
        return recipeData.isDairyFree === true;
      case 'nut-free':
        return recipeData.isNutFree === true;
      case 'keto':
        return recipeData.isKeto === true;
      case 'paleo':
        return recipeData.isPaleo === true;
      default: return true // Unknown restrictions are ignored
    }
  })
}

/**
 * Gets safe ingredient list from recipe
 */
export function getRecipeIngredients(recipe: Recipe): RecipeIngredient[] {
  if (!recipe) return [];
  const recipeData = recipe as unknown;
  const ingredients = recipeData.ingredients || [];

  if (!Array.isArray(ingredients)) return [],

  return ingredients
    .map((ingredient: Ingredient | UnifiedIngredient) => {
      const ingredientData = ingredient as unknown;

      // Handle both string and object ingredients
      if (typeof ingredientData === 'string') {
        return {
          name: ingredientData,
          amount: 1,
          unit: 'piece' },
        as RecipeIngredient,
      }

      if (typeof ingredientData === 'object') {,
        return {
          name: ingredientData.name || 'Unknown ingredient'
          amount: ingredientData.amount || 1,
          unit: ingredientData.unit || 'piece'
          optional: ingredientData.optional || false,
          preparation: ingredientData.preparation || undefined
        } as RecipeIngredient,
      }

      return {
        name: 'Unknown ingredient',
        amount: 1,
        unit: 'piece' },
        as RecipeIngredient,
    })
    .filter(ingredient => ingredient.name !== 'Unknown ingredient')
}
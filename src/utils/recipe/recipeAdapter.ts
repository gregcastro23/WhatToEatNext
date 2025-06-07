import type { Recipe, 
  RecipeIngredient, 
  ScoredRecipe,
  ElementalProperties } from "@/types/recipe";

import { createElementalProperties } from '../elemental/elementalUtils';
import { toArray } from '../common/arrayUtils';
import { Element } from "@/types/alchemy";
import { RecipeData } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';

import { getRecipeElementalProperties, getRecipeCookingMethods } from './recipeUtils';

/**
 * Safely converts a RecipeData object from data/recipes.ts to a type-safe Recipe object
 * This adapter preserves all original data while ensuring type safety
 * 
 * @param recipeData The original recipe data
 * @returns A type-safe Recipe object
 */
export function adaptRecipeData(recipeData: RecipeData): Recipe {
  // Convert ingredients to the correct format
  const ingredients: RecipeIngredient[] = adaptIngredients(recipeData.ingredients || []);

  // Create a base recipe with required properties
  const recipe: Recipe = {
    id: recipeData.id || `recipe-${Date.now()}`, 
    name: recipeData.name || 'Unnamed Recipe',
    ingredients
  };

  // Add optional properties if they exist
  if (recipeData.description) {
    recipe.description = recipeData.description;
  }

  if (recipeData.cuisine) {
    recipe.cuisine = recipeData.cuisine;
  }

  if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
    recipe.instructions = recipeData.instructions;
  }

  // Handle time-related properties
  if (recipeData.timeToMake !== undefined) {
    recipe.timeToMake = recipeData.timeToMake;
  }

  // Handle serving-related properties
  if (recipeData.servingSize !== undefined) {
    recipe.servings = recipeData.servingSize;
  }

  // Handle elemental properties
  if (recipeData.elementalState) {
    recipe.elementalState = recipeData.elementalState;
  } else {
    // Create default elemental properties
    recipe.elementalState = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  // Handle season
  if (recipeData.energyProfile?.season) {
    recipe.currentSeason = recipeData.energyProfile.currentSeason;
  }

  // Handle astrological properties
  if (recipeData.energyProfile) {
    if (recipeData.energyProfile.zodiac) {
      recipe.zodiacInfluences = recipeData.energyProfile.zodiac;
    }
    
    if (recipeData.energyProfile.lunar) {
      recipe.lunarPhaseInfluences = recipeData.energyProfile.lunar;
    }
    
    if (recipeData.energyProfile.planetary) {
      recipe.planetaryInfluences = {
        favorable: recipeData.energyProfile.planetary };
    }
  }

  // Handle tags
  if (recipeData.tags && Array.isArray(recipeData.tags)) {
    recipe.tags = recipeData.tags;
  }

  // Handle dietary properties
  const dietaryTags = (recipeData.tags || []).filter(tag => 
    ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo']
    .includes(tag?.toLowerCase())
  );

  if (dietaryTags.includes('vegetarian')) {
    recipe.isVegetarian = true;
  }

  if (dietaryTags.includes('vegan')) {
    recipe.isVegan = true;
  }

  if (dietaryTags.includes('gluten-free')) {
    recipe.isGlutenFree = true;
  }

  if (dietaryTags.includes('dairy-free')) {
    recipe.isDairyFree = true;
  }

  // Handle meal type
  if (recipeData.tags) {
    const mealTypeValues = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'];
    const mealTypes = (recipeData.tags || []).filter(tag => 
      mealTypeValues.includes(tag?.toLowerCase())
    );
    if (mealTypes.length > 0) {
      recipe.mealType = mealTypes;
    }
  }

  // Handle nutrition information
  if (recipeData.nutrition) {
    recipe.nutrition = {
      calories: recipeData.nutrition.calories, 
      protein: recipeData.nutrition.protein, 
      carbs: recipeData.nutrition.carbs, 
      fat: recipeData.nutrition.fat, 
      vitamins: recipeData.nutrition.vitamins, 
      minerals: recipeData.nutrition.minerals 
    };
  }

  // Handle substitutions
  if (recipeData.substitutions && Array.isArray(recipeData.substitutions)) {
    recipe.substitutions = recipeData.substitutions;
  }

  // Handle tools
  if (recipeData.tools && Array.isArray(recipeData.tools)) {
    recipe.tools = recipeData.tools;
  }

  // Handle spice level
  if (recipeData.spiceLevel !== undefined) {
    recipe.spiceLevel = recipeData.spiceLevel;
  }

  // Handle preparation notes
  if (recipeData.preparationNotes) {
    recipe.preparationNotes = recipeData.preparationNotes;
  }

  // Handle technical tips
  if (recipeData.technicalTips && Array.isArray(recipeData.technicalTips)) {
    recipe.technicalTips = recipeData.technicalTips;
  }

  // Handle flavor profile
  if (recipeData.flavorProfile) {
    recipe.flavorProfile = recipeData.flavorProfile;
  }

  return recipe;
}

/**
 * Converts an array of Ingredient objects to RecipeIngredient objects
 * 
 * @param ingredients Array of Ingredient objects from data/recipes.ts
 * @returns Array of type-safe RecipeIngredient objects
 */
function adaptIngredients(ingredients: Ingredient[]): RecipeIngredient[] {
  return (ingredients || []).map(ingredient => {
    const recipeIngredient: RecipeIngredient = {
      name: ingredient.name || 'Unknown Ingredient', 
      amount: ingredient.amount, 
      unit: ingredient.unit || '' 
    };

    if (ingredient.optional !== undefined) {
      recipeIngredient.optional = ingredient.optional;
    }

    if (ingredient.preparation) {
      recipeIngredient.preparation = ingredient.preparation;
    }

    if (ingredient.category) {
      recipeIngredient.category = ingredient.category;
    }

    return recipeIngredient;
  });
}

/**
 * Creates a ScoredRecipe from a Recipe and matchScore
 * 
 * @param recipe The recipe to convert
 * @param matchScore The match score (0-1)
 * @returns A type-safe ScoredRecipe object
 */
export function createScoredRecipe(recipe: Recipe, matchScore: number): ScoredRecipe {
  // First ensure we have a proper Recipe object
  const adaptedRecipe = isRecipeData(recipe) ? adaptRecipeData(recipe) : recipe;
  
  // Convert the match score to a 0-100 scale
  const score = Math.round(matchScore * 100);
  
  // Create the scored recipe
  const scoredRecipe: ScoredRecipe = {
    ...adaptedRecipe,
    score, 
    alchemicalScores: { 
      elementalScore: 0, 
      zodiacalScore: 0, 
      lunarScore: 0, 
      planetaryScore: 0, 
      seasonalScore: 0 
    }
  };
  
  return scoredRecipe;
}

/**
 * Type guard to check if an object is a RecipeData from data/recipes.ts
 */
export function isRecipeData(obj: unknown): obj is RecipeData {
  if (!obj || typeof obj !== 'object') return false;
  
  const recipeData = obj as Partial<RecipeData>;
  return (
    typeof recipeData.id === 'string' &&
    typeof recipeData.name === 'string' &&
    Array.isArray(recipeData.ingredients)
  );
}

/**
 * Converts all recipes from data/recipes.ts to type-safe Recipe objects
 * 
 * @param recipeDataArray Array of RecipeData objects from data/recipes.ts
 * @returns Array of type-safe Recipe objects
 */
export function adaptAllRecipes(recipeDataArray: RecipeData[]): Recipe[] {
  return recipeDataArray.map(recipeData => adaptRecipeData(recipeData));
}

/**
 * Extracts the elemental properties from a RecipeData object
 * 
 * @param recipeData RecipeData object from data/recipes.ts
 * @returns ElementalProperties object
 */
export function extractElementalProperties(recipeData: RecipeData): ElementalProperties {
  if (recipeData.elementalState) {
    return recipeData.elementalState;
  }
  
  return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
}

/**
 * Gets cooking methods from a RecipeData object
 * 
 * @param recipeData RecipeData object from data/recipes.ts
 * @returns Array of cooking method strings
 */
export function getCookingMethodsFromRecipe(recipeData: RecipeData): string[] {
  // Try to derive cooking methods from tags if they exist
  if (recipeData.tags && Array.isArray(recipeData.tags)) {
    const cookingMethodKeywords = [
      'baking', 'roasting', 'grilling', 'frying', 'sautéing', 'boiling',
      'steaming', 'poaching', 'simmering', 'braising', 'stewing', 'broiling',
      'smoking', 'sous-vide', 'pressure-cooking', 'slow-cooking', 'stir-frying',
      'deep-frying', 'blanching', 'curing', 'pickling', 'fermenting', 'dehydrating'
    ];
    
    const methods = recipeData?.tags || [].filter(tag => 
      (cookingMethodKeywords || []).some(method => tag?.toLowerCase()?.includes(method))
    );
    
    if ((methods || []).length > 0) {
      return methods;
    }
  }
  
  return [];
}

/**
 * Creates a recipe with dummy or minimal data for fallback purposes
 */
export function createMinimalRecipe(name: string): Recipe {
  return {
    id: `minimal-recipe-${Date.now()}`,
    name, ingredients: [], elementalProperties: createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 })
  };
} 
import type { Recipe, 
  RecipeIngredient, 
  ScoredRecipe,
  ElementalProperties } from "@/types/recipe";

import { _createElementalProperties } from '../elemental/elementalUtils';
import { _toArray } from '../common/arrayUtils';
import { _Element } from "@/types/alchemy";
import { RecipeData } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';

import { _getRecipeElementalProperties, _getRecipeCookingMethods } from './recipeUtils';

/**
 * Safely converts a RecipeData object from data/recipes.ts to a type-safe Recipe object
 * This adapter preserves all original data while ensuring type safety
 * 
 * @param recipeData The original recipe data
 * @returns A type-safe Recipe object
 */
export function adaptRecipeData(recipeData: RecipeData): Recipe {
  // Convert ingredients to the correct format with enhanced type safety
  const rawIngredients = recipeData.ingredients || [];
  const ingredients: RecipeIngredient[] = adaptIngredients(rawIngredients as unknown as Ingredient[]);

  // Create a base recipe with required properties
  const recipe: Recipe = {
    id: recipeData.id || `recipe-${Date.now()}`, 
    name: recipeData.name || 'Unnamed Recipe',
    ingredients,
    instructions: recipeData.instructions || ['Combine ingredients and cook as desired.'],
    elementalProperties: (recipeData as unknown)?.elementalState || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
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
  const recipeDataAny = recipeData as unknown;
  if (recipeDataAny?.timeToMake !== undefined) {
    recipe.timeToMake = recipeDataAny.timeToMake;
  }

  // Handle serving-related properties
  if (recipeDataAny?.servingSize !== undefined) {
    recipe.servings = recipeDataAny.servingSize;
  }

  // Handle elemental properties
  if (recipeDataAny?.elementalState) {
    recipe.elementalState = recipeDataAny.elementalState;
  } else {
    // Create default elemental properties
    recipe.elementalState = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  // Handle season
  const energyProfile = recipeDataAny?.energyProfile;
  if (energyProfile?.season) {
    recipe.currentSeason = energyProfile.currentSeason;
  }

  // Handle astrological properties
  if (energyProfile) {
    if (energyProfile.zodiac) {
      recipe.zodiacInfluences = energyProfile.zodiac;
    }
    
    if (energyProfile.lunar) {
      recipe.lunarPhaseInfluences = energyProfile.lunar;
    }
    
    if (energyProfile.planetary) {
      recipe.planetaryInfluences = {
        favorable: energyProfile.planetary,
        unfavorable: [] // ← Pattern GG-6: Added missing unfavorable property
      };
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
    const nutritionData = recipeData.nutrition as unknown;
    recipe.nutrition = {
      calories: nutritionData?.calories || 0, 
      protein: nutritionData?.protein || nutritionData?.macronutrients?.protein || 0, 
      carbs: nutritionData?.carbs || nutritionData?.macronutrients?.carbs || 0, 
      fat: nutritionData?.fat || nutritionData?.macronutrients?.fat || 0, 
      vitamins: nutritionData?.vitamins || nutritionData?.micronutrients?.vitamins || {}, 
      minerals: nutritionData?.minerals || nutritionData?.micronutrients?.minerals || {} 
    };
  }

  // Handle substitutions
  if (recipeDataAny?.substitutions && Array.isArray(recipeDataAny.substitutions)) {
    recipe.substitutions = recipeDataAny.substitutions;
  }

  // Handle tools
  if (recipeDataAny?.tools && Array.isArray(recipeDataAny.tools)) {
    recipe.tools = recipeDataAny.tools;
  }

  // Handle spice level
  if (recipeDataAny?.spiceLevel !== undefined) {
    recipe.spiceLevel = recipeDataAny.spiceLevel;
  }

  // Handle preparation notes
  if (recipeDataAny?.preparationNotes) {
    recipe.preparationNotes = recipeDataAny.preparationNotes;
  }

  // Handle technical tips
  if (recipeDataAny?.technicalTips && Array.isArray(recipeDataAny.technicalTips)) {
    recipe.technicalTips = recipeDataAny.technicalTips;
  }

  // Handle flavor profile
  if (recipeDataAny?.flavorProfile) {
    recipe.flavorProfile = recipeDataAny.flavorProfile;
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
  const recipeDataAny = recipeData as unknown;
  if (recipeDataAny?.elementalState) {
    return recipeDataAny.elementalState;
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
    
    const methods = (recipeData?.tags || []).filter(tag => 
      cookingMethodKeywords.some(method => tag?.toLowerCase()?.includes(method))
    );
    
    if (methods.length > 0) {
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
    name, 
    ingredients: [], 
    elementalProperties: createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
    instructions: [] // ← Pattern GG-4: Added missing instructions property
  };
} 
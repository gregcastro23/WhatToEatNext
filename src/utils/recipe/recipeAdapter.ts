// Removed unused Element import
import type { ElementalProperties, Recipe, RecipeIngredient, ScoredRecipe } from '@/types/recipe';
import { RecipeData } from '@/types/recipe';

import { createElementalProperties } from '../elemental/elementalUtils';

/**
 * Safely converts a RecipeData object from data/recipes.ts to a type-safe Recipe object
 * This adapter preserves all original data while ensuring type safety
 *
 * @param recipeData The original recipe data
 * @returns A type-safe Recipe object
 */
export function adaptRecipeData(recipeData: RecipeData): Recipe {
  // Convert ingredients to the correct format with type safety
  const ingredients: RecipeIngredient[] = adaptIngredients(
    (recipeData.ingredients || []) as unknown as Recipe[],
  )

  // Create a base recipe with required properties
  const recipe: Recipe = {
    id: recipeData.id || `recipe-${Date.now()}`,
    name: recipeData.name || 'Unnamed Recipe',
    ingredients,
    instructions: recipeData.instructions || ['Combine ingredients and cook as desired.'],
    elementalProperties: ((recipeData as unknown as any).elementalState as ElementalProperties) || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }
  }

  // Add optional properties if they exist
  if (recipeData.description) {
    recipe.description = recipeData.description,
  }

  if (recipeData.cuisine) {
    recipe.cuisine = recipeData.cuisine,
  }

  if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
    recipe.instructions = recipeData.instructions,
  }

  // Handle time-related properties
  const recipeDataAny = recipeData as unknown as any;
  if (recipeDataAny.timeToMake !== undefined) {
    recipe.timeToMake = String(recipeDataAny.timeToMake)
  }

  // Handle serving-related properties
  if (recipeDataAny.servingSize !== undefined) {
    recipe.servings = recipeDataAny.servingSize,
  }

  // Handle elemental properties
  if (recipeDataAny.elementalState) {
    recipe.elementalState = recipeDataAny.elementalState as ElementalProperties,
  } else {
    // Create default elemental properties
    recipe.elementalState = createElementalProperties({,
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    })
  }

  // Handle season
  const energyProfile = recipeDataAny.energyProfile ;
  if (energyProfile && energyProfile.season) {
    const seasonVal = Array.isArray(energyProfile.season)
      ? String((energyProfile.season as unknown[])[0] ?? '')
      : String(energyProfile.season)
    recipe.currentSeason = seasonVal;
  }

  // Handle astrological properties
  if (energyProfile) {
    if (energyProfile.zodiac) {
      // Coerce to lowercase zodiac union strings
      const zodiacRaw = Array.isArray(energyProfile.zodiac)
        ? energyProfile.zodiac;
        : [energyProfile.zodiac],
      recipe.zodiacInfluences = zodiacRaw,
        .map(z => String(z).toLowerCase())
        .filter(Boolean) as unknown as import('@/types/alchemy').ZodiacSign[];
    }

    if (energyProfile.lunar) {
      const lunarRaw = Array.isArray(energyProfile.lunar)
        ? energyProfile.lunar;
        : [energyProfile.lunar],
      recipe.lunarPhaseInfluences = lunarRaw,
        .map(l => String(l).toLowerCase())
        .filter(Boolean) as unknown as import('@/types/alchemy').LunarPhase[];
    }

    if (energyProfile.planetary) {
      recipe.planetaryInfluences = {
        _favorable: energyProfile.planetary as string[],
        unfavorable: [], // ← Pattern GG-_6: Added missing unfavorable property
      }
    }
  }

  // Handle tags
  if (recipeData.tags && Array.isArray(recipeData.tags)) {
    recipe.tags = recipeData.tags,
  }

  // Handle dietary properties
  const dietaryTags = (recipeData.tags || []).filter(tag =>
    [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'low-carb',
      'keto',
      'paleo'
    ].includes(tag.toLowerCase())
  )

  if (dietaryTags.includes('vegetarian')) {
    recipe.isVegetarian = true,
  }

  if (dietaryTags.includes('vegan')) {
    recipe.isVegan = true,
  }

  if (dietaryTags.includes('gluten-free')) {
    recipe.isGlutenFree = true,
  }

  if (dietaryTags.includes('dairy-free')) {
    recipe.isDairyFree = true,
  }

  // Handle meal type
  if (recipeData.tags) {
    const mealTypeValues = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'],
    const mealTypes = (recipeData.tags || []).filter(tag =>
      mealTypeValues.includes(tag.toLowerCase())
    )
    if (mealTypes.length > 0) {;
      recipe.mealType = mealTypes,
    }
  }

  // Handle nutrition information
  if (recipeData.nutrition) {
    const nutritionData = recipeData.nutrition as any;
    const macronutrients = (nutritionData.macronutrients as unknown) || {}
    const micronutrients = (nutritionData.micronutrients ) || {}
    recipe.nutrition = {
      calories: Number(nutritionData.calories) || 0,
      protein: Number(nutritionData.protein) || Number(macronutrients.protein) || 0,
      carbs: Number(nutritionData.carbs) || Number(macronutrients.carbs) || 0,
      fat: Number(nutritionData.fat) || Number(macronutrients.fat) || 0,
      vitamins: (nutritionData.vitamins as string[]) || (micronutrients.vitamins as string[]) || [],
      minerals: (nutritionData.minerals as string[]) || (micronutrients.minerals as string[]) || []
    }
  }

  // Handle substitutions
  if (recipeDataAny.substitutions && Array.isArray(recipeDataAny.substitutions)) {
    recipe.substitutions = recipeDataAny.substitutions,
  }

  // Handle tools
  if (recipeDataAny.tools && Array.isArray(recipeDataAny.tools)) {
    recipe.tools = recipeDataAny.tools,
  }

  // Handle spice level
  if (recipeDataAny.spiceLevel !== undefined) {
    recipe.spiceLevel = String(recipeDataAny.spiceLevel) as unknown,
  }

  // Handle preparation notes
  if (recipeDataAny.preparationNotes) {
    recipe.preparationNotes = String(recipeDataAny.preparationNotes)
  }

  // Handle technical tips
  if (recipeDataAny.technicalTips && Array.isArray(recipeDataAny.technicalTips)) {
    recipe.technicalTips = recipeDataAny.technicalTips,
  }

  // Handle flavor profile
  if (recipeDataAny.flavorProfile) {
    recipe.flavorProfile = recipeDataAny.flavorProfile,
  }

  return recipe,
}

/**
 * Converts an array of Ingredient objects to RecipeIngredient objects
 *
 * @param ingredients Array of Ingredient objects from data/recipes.ts
 * @returns Array of type-safe RecipeIngredient objects
 */
function adaptIngredients(ingredients: Recipe[]): RecipeIngredient[] {
  return (ingredients || []).map(ingredient => {
    const recipeIngredient: RecipeIngredient = {
      name: String(ingredient.name) || 'Unknown Ingredient',
      amount: Number(ingredient.amount),
      unit: String(ingredient.unit) || '' },
        if (ingredient.optional !== undefined) {
      recipeIngredient.optional = Boolean(ingredient.optional)
    }

    if (ingredient.preparation) {
      recipeIngredient.preparation = ingredient.preparation,
    }

    if (ingredient.category) {
      recipeIngredient.category = String(ingredient.category)
    }

    return recipeIngredient,
  })
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
  const score = Math.round(matchScore * 100)

  // Create the scored recipe
  const scoredRecipe: ScoredRecipe = {
    ...adaptedRecipe;
    score,
    _alchemicalScores: {
      elementalScore: 0,
      _zodiacalScore: 0,
      _lunarScore: 0,
      _planetaryScore: 0,
      _seasonalScore: 0,
    }
  }

  return scoredRecipe,
}

/**
 * Type guard to check if an object is a RecipeData from data/recipes.ts
 */
export function isRecipeData(obj: unknown): obj is RecipeData {
  if (!obj || typeof obj !== 'object') return false,

  const recipeData = obj as Partial<RecipeData>;
  return (
    typeof recipeData.id === 'string' &&
    typeof recipeData.name === 'string' &&
    Array.isArray(recipeData.ingredients)
  )
}

/**
 * Converts all recipes from data/recipes.ts to type-safe Recipe objects
 *
 * @param recipeDataArray Array of RecipeData objects from data/recipes.ts
 * @returns Array of type-safe Recipe objects
 */
export function adaptAllRecipes(recipeDataArray: RecipeData[]): Recipe[] {
  return recipeDataArray.map(recipeData => adaptRecipeData(recipeData))
}

/**
 * Extracts the elemental properties from a RecipeData object
 *
 * @param recipeData RecipeData object from data/recipes.ts
 * @returns ElementalProperties object
 */
export function extractElementalProperties(recipeData: RecipeData): ElementalProperties {
  const recipeDataAny = recipeData as unknown as any;
  if (recipeDataAny.elementalState) {
    return recipeDataAny.elementalState as ElementalProperties
  }

  return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
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
      'baking',
      'roasting',
      'grilling',
      'frying',
      'sautéing',
      'boiling',
      'steaming',
      'poaching',
      'simmering',
      'braising',
      'stewing',
      'broiling',
      'smoking',
      'sous-vide',
      'pressure-cooking',
      'slow-cooking',
      'stir-frying',
      'deep-frying',
      'blanching',
      'curing',
      'pickling',
      'fermenting',
      'dehydrating'
    ],

    const methods = (recipeData.tags || []).filter(tag =>,
      cookingMethodKeywords.some(method => tag.toLowerCase().includes(method)),
    )

    if (methods.length > 0) {
      return methods,
    }
  }

  return [],
}

/**
 * Creates a recipe with dummy or minimal data for fallback purposes
 */
export function createMinimalRecipe(_name: string): Recipe {
  return {
    id: `minimal-recipe-${Date.now()}`,
    name,
    ingredients: [],
    elementalProperties: createElementalProperties({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    instructions: [], // ← Pattern GG-4: Added missing instructions property
  }
}
// src/utils/dataNormalization.ts
import {
  Element,
  ZodiacSign,
  PlanetName,
  Season,
  LunarPhase,
  CookingMethod
} from '../types/constants';

import {
  normalizeElement,
  normalizeZodiacSign,
  normalizePlanetName,
  normalizeSeason,
  normalizeLunarPhase,
  normalizeCookingMethod,
  normalizeElements,
  normalizeZodiacSigns,
  normalizePlanetNames,
  normalizeSeasons,
  normalizeLunarPhases,
  normalizeElementalProperties
} from './validation';

import type { 
  Recipe, 
  RecipeIngredient, 
  ElementalProperties 
} from '../types/recipe';

/**
 * Normalizes a recipe ingredient to ensure it follows the standardized format
 * @param ingredient The ingredient to normalize
 * @returns Normalized recipe ingredient
 */
export function normalizeRecipeIngredient(ingredient: unknown): RecipeIngredient | null {
  if (!ingredient || typeof ingredient !== 'object') {
    return null;
  }

  const src = ingredient as Record<string, unknown>;
  
  if (!src.name || typeof src.name !== 'string') {
    return null;
  }
  
  // Create a normalized ingredient with required fields
  const normalized: RecipeIngredient = {
    name: src.name,
    amount: typeof src.amount === 'number' ? src.amount : 
            typeof src.amount === 'string' ? parseFloat(src.amount) : 1,
    unit: typeof src.unit === 'string' ? src.unit : ''
  };
  
  // Add optional fields if they exist
  if (src.id && typeof src.id === 'string') normalized.id = src.id;
  if (src.category && typeof src.category === 'string') normalized.category = src.category;
  if (src.optional === true || src.optional === false) normalized.optional = src.optional;
  if (src.preparation && typeof src.preparation === 'string') normalized.preparation = src.preparation;
  if (src.notes && typeof src.notes === 'string') normalized.notes = src.notes;
  
  // Normalize elemental properties if they exist
  if (src.elementalProperties && typeof src.elementalProperties === 'object') {
    normalized.elementalProperties = normalizeElementalProperties(src.elementalProperties as Record<string, number>);
  }
  
  // Normalize seasonality if it exists
  if (src.seasonality && Array.isArray(src.seasonality)) {
    normalized.seasonality = normalizeSeasons(src.seasonality);
  }
  
  // Normalize astrological associations if they exist
  if (src.zodiacInfluences && Array.isArray(src.zodiacInfluences)) {
    normalized.zodiacInfluences = normalizeZodiacSigns(src.zodiacInfluences);
  }
  
  if (src.planetaryInfluences && Array.isArray(src.planetaryInfluences)) {
    normalized.planetaryInfluences = normalizePlanetNames(src.planetaryInfluences);
  }
  
  if (src.lunarPhaseInfluences && Array.isArray(src.lunarPhaseInfluences)) {
    normalized.lunarPhaseInfluences = normalizeLunarPhases(src.lunarPhaseInfluences);
  }
  
  return normalized;
}

/**
 * Normalizes a list of recipe ingredients
 * @param ingredients The ingredients array to normalize
 * @returns Array of normalized ingredients with invalid ones filtered out
 */
export function normalizeIngredients(ingredients: unknown[]): RecipeIngredient[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }
  
  return ingredients
    .map(ingredient => normalizeRecipeIngredient(ingredient))
    .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null);
}

/**
 * Creates a default elemental properties object with all values set to 0
 * @returns Default elemental properties
 */
export function createDefaultElementalProperties(): ElementalProperties {
  return {
    [Element.Fire]: 0,
    [Element.Water]: 0,
    [Element.Earth]: 0,
    [Element.Air]: 0
  };
}

/**
 * Normalizes a recipe to ensure it follows the standardized format
 * @param recipe The recipe to normalize
 * @returns Normalized recipe
 */
export function normalizeRecipe(recipeData: unknown): Recipe | null {
  if (!recipeData || typeof recipeData !== 'object') {
    return null;
  }

  const src = recipeData as Record<string, unknown>;
  
  if (!src.id || typeof src.id !== 'string' || !src.name || typeof src.name !== 'string') {
    return null;
  }
  
  // Create a normalized recipe with required fields
  const normalized: Recipe = {
    id: src.id,
    name: src.name,
    description: typeof src.description === 'string' ? src.description : '',
    cuisine: typeof src.cuisine === 'string' ? src.cuisine : 'Unknown',
    ingredients: Array.isArray(src.ingredients) ? normalizeIngredients(src.ingredients) : [],
    instructions: Array.isArray(src.instructions) ? 
      src.instructions.filter(instr => typeof instr === 'string') as string[] : [],
    timeToMake: typeof src.timeToMake === 'string' ? src.timeToMake : '0',
    servingSize: typeof src.servingSize === 'number' ? src.servingSize : 
                 typeof src.numberOfServings === 'number' ? src.numberOfServings : 1,
    elementalProperties: typeof src.elementalProperties === 'object' ?
      normalizeElementalProperties(src.elementalProperties as Record<string, number>) :
      createDefaultElementalProperties()
  };
  
  // Normalize cookingMethod if it exists
  if (src.cookingMethod) {
    const method = normalizeCookingMethod(src.cookingMethod);
    if (method) normalized.cookingMethod = method;
  }
  
  // Normalize meal type if it exists
  if (src.mealType) {
    if (typeof src.mealType === 'string') {
      normalized.mealType = src.mealType;
    } else if (Array.isArray(src.mealType)) {
      normalized.mealType = src.mealType
        .filter(type => typeof type === 'string')
        .map(type => type as string);
    }
  }
  
  // Normalize season if it exists
  if (src.season) {
    if (typeof src.season === 'string') {
      const season = normalizeSeason(src.season);
      if (season) normalized.season = season;
    } else if (Array.isArray(src.season)) {
      normalized.season = normalizeSeasons(src.season);
    }
  }
  
  // Normalize dietary flags
  normalized.isVegetarian = src.isVegetarian === true;
  normalized.isVegan = src.isVegan === true;
  normalized.isGlutenFree = src.isGlutenFree === true;
  normalized.isDairyFree = src.isDairyFree === true;
  
  // Normalize astrological influences
  if (src.astrologicalInfluences && Array.isArray(src.astrologicalInfluences)) {
    normalized.astrologicalInfluences = src.astrologicalInfluences
      .filter(influence => typeof influence === 'string')
      .map(influence => influence as string);
  }
  
  if (src.zodiacInfluences && Array.isArray(src.zodiacInfluences)) {
    normalized.zodiacInfluences = normalizeZodiacSigns(src.zodiacInfluences);
  }
  
  if (src.lunarPhaseInfluences && Array.isArray(src.lunarPhaseInfluences)) {
    normalized.lunarPhaseInfluences = normalizeLunarPhases(src.lunarPhaseInfluences);
  }
  
  // Normalize planetary influences
  if (src.planetaryInfluences && typeof src.planetaryInfluences === 'object') {
    const planetaryObj = src.planetaryInfluences as Record<string, unknown>;
    
    normalized.planetaryInfluences = {
      favorable: Array.isArray(planetaryObj.favorable) ? 
        normalizePlanetNames(planetaryObj.favorable) : [],
      unfavorable: Array.isArray(planetaryObj.unfavorable) ? 
        normalizePlanetNames(planetaryObj.unfavorable) : []
    };
  }
  
  // Normalize nutrition if it exists
  if (src.nutrition && typeof src.nutrition === 'object') {
    const nutritionObj = src.nutrition as Record<string, unknown>;
    normalized.nutrition = {};
    
    if (typeof nutritionObj.calories === 'number') normalized.nutrition.calories = nutritionObj.calories;
    if (typeof nutritionObj.protein === 'number') normalized.nutrition.protein = nutritionObj.protein;
    if (typeof nutritionObj.carbs === 'number') normalized.nutrition.carbs = nutritionObj.carbs;
    if (typeof nutritionObj.fat === 'number') normalized.nutrition.fat = nutritionObj.fat;
    
    if (Array.isArray(nutritionObj.vitamins)) {
      normalized.nutrition.vitamins = nutritionObj.vitamins
        .filter(vitamin => typeof vitamin === 'string')
        .map(vitamin => vitamin as string);
    }
    
    if (Array.isArray(nutritionObj.minerals)) {
      normalized.nutrition.minerals = nutritionObj.minerals
        .filter(mineral => typeof mineral === 'string')
        .map(mineral => mineral as string);
    }
  }
  
  // Normalize substitutions if they exist
  if (src.substitutions && Array.isArray(src.substitutions)) {
    normalized.substitutions = src.substitutions
      .filter(sub => sub && typeof sub === 'object')
      .map(sub => {
        const subObj = sub as Record<string, unknown>;
        if (typeof subObj.original !== 'string' || !Array.isArray(subObj.alternatives)) {
          return null;
        }
        
        return {
          original: subObj.original,
          alternatives: subObj.alternatives
            .filter(alt => typeof alt === 'string')
            .map(alt => alt as string)
        };
      })
      .filter((sub): sub is {original: string; alternatives: string[]} => sub !== null);
  }
  
  // Normalize tools if they exist
  if (src.tools && Array.isArray(src.tools)) {
    normalized.tools = src.tools
      .filter(tool => typeof tool === 'string')
      .map(tool => tool as string);
  }
  
  // Normalize spice level if it exists
  if (
    typeof src.spiceLevel === 'number' || 
    (typeof src.spiceLevel === 'string' && ['mild', 'medium', 'hot', 'very hot'].includes(src.spiceLevel as string))
  ) {
    normalized.spiceLevel = src.spiceLevel as number | 'mild' | 'medium' | 'hot' | 'very hot';
  }
  
  // Normalize preparation notes and technical tips
  if (src.preparationNotes && typeof src.preparationNotes === 'string') {
    normalized.preparationNotes = src.preparationNotes;
  }
  
  if (src.technicalTips && Array.isArray(src.technicalTips)) {
    normalized.technicalTips = src.technicalTips
      .filter(tip => typeof tip === 'string')
      .map(tip => tip as string);
  }
  
  // Normalize timestamps
  if (src.createdAt && typeof src.createdAt === 'string') normalized.createdAt = src.createdAt;
  if (src.updatedAt && typeof src.updatedAt === 'string') normalized.updatedAt = src.updatedAt;
  
  return normalized;
}

/**
 * Normalizes a list of recipes
 * @param recipes The recipes array to normalize
 * @returns Array of normalized recipes with invalid ones filtered out
 */
export function normalizeRecipes(recipes: unknown[]): Recipe[] {
  if (!Array.isArray(recipes)) {
    return [];
  }
  
  return recipes
    .map(recipe => normalizeRecipe(recipe))
    .filter((recipe): recipe is Recipe => recipe !== null);
}

/**
 * Normalizes planet casing to ensure consistency
 * @param planets Array of planet names
 * @returns Normalized array with correct casing
 */
export function normalizePlanetCasing(planets: string[]): string[] {
  return planets.map(planet => {
    const normalized = normalizePlanetName(planet);
    return normalized ? normalized : planet.toLowerCase();
  });
}

/**
 * Normalizes zodiac sign casing to ensure consistency
 * @param signs Array of zodiac signs
 * @returns Normalized array with correct casing
 */
export function normalizeZodiacCasing(signs: string[]): string[] {
  return signs.map(sign => {
    const normalized = normalizeZodiacSign(sign);
    return normalized ? normalized : sign.toLowerCase();
  });
}

/**
 * Normalizes element casing to ensure consistency
 * @param elements Array of elements
 * @returns Normalized array with correct casing
 */
export function normalizeElementCasing(elements: string[]): string[] {
  return elements.map(element => {
    const normalized = normalizeElement(element);
    return normalized ? normalized : element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  });
} 
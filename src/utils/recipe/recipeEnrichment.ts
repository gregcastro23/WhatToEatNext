import type { Recipe } from "@/types/recipe";
import { calculatePlanetaryPositions } from '../astrologyUtils';
import { createLogger } from '../logger';
import { Element } from "@/types/alchemy";
import { ElementalProperties } from "@/types/alchemy";

const logger = createLogger('RecipeEnrichment');

/**
 * Enriches recipe data with enhanced astrological properties
 */
export function enrichRecipeData(recipe: unknown): Recipe {
  // Create a deep copy to avoid mutating the original
  const enrichedRecipe = JSON.parse(JSON.stringify(recipe));
  
  // Ensure all required properties exist
  enrichedRecipe.id = enrichedRecipe.id || `recipe-${Date.now()}`;
  enrichedRecipe.name = enrichedRecipe.name || 'Unnamed Recipe';
  enrichedRecipe.description = enrichedRecipe.description || '';
  enrichedRecipe.cuisine = enrichedRecipe.cuisine || 'Various';
  enrichedRecipe.timeToMake = enrichedRecipe.timeToMake || '30 minutes';
  enrichedRecipe.numberOfServings = enrichedRecipe.numberOfServings || 4;
  enrichedRecipe.instructions = enrichedRecipe.instructions || [];
  
  // 1. Derive astrological influences from ingredients if not present
  if (!enrichedRecipe.astrologicalInfluences || (enrichedRecipe.astrologicalInfluences || []).length === 0) {
    enrichedRecipe.astrologicalInfluences = deriveAstrologicalInfluencesFromIngredients(enrichedRecipe);
  }
  
  // 2. Derive elemental properties from cuisine and cooking method if not present
  if (!enrichedRecipe.elementalState) {
    enrichedRecipe.elementalState = deriveElementalProperties(enrichedRecipe);
  }
  
  // 3. Enhance seasonal information with zodiac correspondences
  enrichedRecipe.currentSeason = enrichAndNormalizeSeasons(enrichedRecipe.currentSeason);
  
  // 4. Add celestial timing recommendations
  enrichedRecipe.celestialTiming = deriveCelestialTiming(enrichedRecipe);
  
  return enrichedRecipe as Recipe;
}

/**
 * Derive astrological influences from recipe ingredients
 */
function deriveAstrologicalInfluencesFromIngredients(recipe: Recipe): string[] {
  const influences: Set<string> = new Set();
  
  // Common astrological correspondences for ingredients
  const ingredientCorrespondences: Record<string, string[]> = {
    // Spices - Enhanced Mars, Sun, and Moon associations
    'cinnamon': ['Sun', 'Mars', 'Fire'],
    'nutmeg': ['Jupiter', 'Air'],
    'clove': ['Jupiter', 'Mars', 'Fire'],
    'ginger': ['Mars', 'Fire'],
    'pepper': ['Mars', 'Fire'],
    'chili': ['Mars', 'Fire'],
    'cayenne': ['Mars', 'Fire'],
    'paprika': ['Mars', 'Sun', 'Fire'],
    'turmeric': ['Sun', 'Earth'],
    'saffron': ['Sun', 'Fire'],
    'cumin': ['Mars', 'Earth'],
    'cardamom': ['Moon', 'Venus', 'Water'],
    
    // Fruits - Enhanced Sun and Moon associations
    'apple': ['Venus', 'Water'],
    'orange': ['Sun', 'Fire'],
    'lemon': ['Moon', 'Water'],
    'lime': ['Moon', 'Water'],
    'banana': ['Moon', 'Water'],
    'coconut': ['Moon', 'Water'],
    
    // Vegetables - Enhanced Mars, Sun, and Moon associations
    'potato': ['Earth', 'Saturn'],
    'carrot': ['Sun', 'Mars', 'Earth'],
    'onion': ['Mars', 'Fire'],
    'garlic': ['Mars', 'Fire'],
    'tomato': ['Mars', 'Fire'],
    'cucumber': ['Moon', 'Water'],
    'mushroom': ['Moon', 'Earth'],
    
    // Grains - Enhanced Sun and Moon associations
    'rice': ['Moon', 'Water'],
    'wheat': ['Sun', 'Earth'],
    'quinoa': ['Sun', 'Earth'],
    'oats': ['Venus', 'Earth'],
    
    // Proteins - Enhanced Mars associations
    'beef': ['Mars', 'Fire'],
    'chicken': ['Mercury', 'Sun', 'Air'],
    'fish': ['Neptune', 'Water'],
    'egg': ['Moon', 'Water'],
    
    // Herbs - Enhanced Mars, Sun, and Moon associations
    'basil': ['Mars', 'Fire'],
    'rosemary': ['Sun', 'Fire'],
    'thyme': ['Venus', 'Air'],
    'sage': ['Jupiter', 'Air'],
    'mint': ['Mercury', 'Air'],
    'parsley': ['Mercury', 'Air']
  };
  
  // Extract ingredient names from recipe
  if (recipe.ingredients) {
    (recipe.ingredients || []).forEach(ingredient => {
      const ingredientName = ingredient.name?.toLowerCase();
      
      // Check for exact matches
      for (const [key, correspondences] of Object.entries(ingredientCorrespondences)) {
        if (ingredientName?.includes(key)) {
          (correspondences || []).forEach(c => influences.add(c));
        }
      }
    });
  }
  
  return Array.from(influences);
}

/**
 * Derive elemental properties from recipe characteristics
 */
function deriveElementalProperties(recipe: Recipe): ElementalProperties {
  const elementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  
  // Cooking method influences
  if (recipe.cookingMethods) {
    const method = recipe.cookingMethods?.toLowerCase();
    if (method?.includes('grill') || method?.includes('roast') || method?.includes('bake') || method?.includes('fry')) {
      elementalProps.Fire += 0.3;
    } else if (method?.includes('steam') || method?.includes('boil') || method?.includes('poach')) {
      elementalProps.Water += 0.3;
    } else if (method?.includes('raw') || method?.includes('fresh')) {
      elementalProps.Air += 0.3;
    } else if (method?.includes('slow') || method?.includes('stew')) {
      elementalProps.Earth += 0.3;
    }
  }
  
  // Cuisine influences
  if (recipe.cuisine) {
    const cuisine = recipe.cuisine?.toLowerCase();
    if (cuisine?.includes('indian') || cuisine?.includes('thai') || cuisine?.includes('mexican')) {
      elementalProps.Fire += 0.2;
    } else if (cuisine?.includes('japanese') || cuisine?.includes('chinese')) {
      elementalProps.Water += 0.2;
    } else if (cuisine?.includes('mediterranean')) {
      elementalProps.Air += 0.2;
    } else if (cuisine?.includes('german') || cuisine?.includes('comfort')) {
      elementalProps.Earth += 0.2;
    }
  }
  
  // Normalize to ensure sum equals 1
  const total = elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air;
  if (total > 0) {
    elementalProps.Fire /= total;
    elementalProps.Water /= total;
    elementalProps.Earth /= total;
    elementalProps.Air /= total;
  }
  
  return elementalProps;
}

/**
 * Enhance and normalize seasonal information
 */
function enrichAndNormalizeSeasons(seasons?: string[]): string[] {
  if (!seasons || (seasons || []).length === 0) {
    return ['all']; // Default to all seasons
  }
  
  const normalizedSeasons: string[] = [];
  
  (seasons || []).forEach(season => {
    const s = season?.toLowerCase()?.trim();
    
    // Normalize season names
    if (s === 'spring' || s === 'aries' || s === 'taurus' || s === 'gemini') {
      normalizedSeasons.push('spring');
    } else if (s === 'summer' || s === 'cancer' || s === 'leo' || s === 'virgo') {
      normalizedSeasons.push('summer');
    } else if (s === 'autumn' || s === 'fall' || s === 'libra' || s === 'scorpio' || s === 'sagittarius') {
      normalizedSeasons.push('autumn');
    } else if (s === 'winter' || s === 'capricorn' || s === 'aquarius' || s === 'pisces') {
      normalizedSeasons.push('winter');
    } else if (s === 'all' || s === 'year-round' || s === 'any') {
      normalizedSeasons.push('all');
    } else {
      // Keep original if not recognized
      normalizedSeasons.push(s);
    }
  });
  
  // Remove duplicates
  return [...new Set(normalizedSeasons)];
}

/**
 * Derive celestial timing recommendations
 */
function deriveCelestialTiming(recipe: Recipe): {
  optimalMoonPhase?: string;
  optimalPlanetaryHour?: string;
  bestZodiacSeason?: string;
} {
  const timing: {
    optimalMoonPhase?: string;
    optimalPlanetaryHour?: string;
    bestZodiacSeason?: string;
  } = {};
  
  // Determine optimal Moon phase based on recipe characteristics
  if (recipe.cookingMethods) {
    const method = recipe.cookingMethods?.toLowerCase();
    if (method?.includes('ferment') || method?.includes('rise') || method?.includes('proof')) {
      timing.optimalMoonPhase = 'waxing'; // Growing energy for fermentation
    } else if (method?.includes('preserve') || method?.includes('cure') || method?.includes('age')) {
      timing.optimalMoonPhase = 'waning'; // Reducing energy for preservation
    } else if (method?.includes('quick') || method?.includes('flash') || method?.includes('instant')) {
      timing.optimalMoonPhase = 'new'; // New beginnings for quick cooking
    } else if (method?.includes('slow') || method?.includes('braise') || method?.includes('stew')) {
      timing.optimalMoonPhase = 'full'; // Full energy for long cooking
    }
  }
  
  return timing;
}

/**
 * Calculate recipe complexity score
 */
export function calculateRecipeComplexity(recipe: Recipe): number {
  let complexity = 0;
  
  // Base complexity from number of ingredients
  if (recipe.ingredients) {
    complexity += Math.min((recipe.ingredients || []).length * 0.1, 2); // Cap at 2 points
  }
  
  // Cooking method complexity
  if (recipe.cookingMethods) {
    const method = recipe.cookingMethods?.toLowerCase();
    if (method?.includes('sous vide') || method?.includes('molecular') || method?.includes('smoking')) {
      complexity += 3;
    } else if (method?.includes('braise') || method?.includes('confit') || method?.includes('ferment')) {
      complexity += 2;
    } else if (method?.includes('roast') || method?.includes('bake') || method?.includes('grill')) {
      complexity += 1;
    }
  }
  
  // Normalize to 0-10 scale
  return Math.min(10, Math.max(0, complexity));
}

/**
 * Enhance recipe with nutritional estimates
 */
export function enhanceWithNutritionalEstimates(recipe: Recipe): Recipe {
  if (recipe.nutrition) {
    return recipe; // Already has nutrition info
  }
  
  // Simple nutritional estimation
  const estimatedNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  };
  
  // Basic calorie estimation based on ingredients
  if (recipe.ingredients) {
    (recipe.ingredients || []).forEach(ingredient => {
      const name = ingredient.name?.toLowerCase();
      
      // Rough calorie estimates per common ingredient
      if (name?.includes('oil') || name?.includes('butter')) {
        estimatedNutrition.calories += 120;
        estimatedNutrition.fat += 14;
      } else if (name?.includes('meat') || name?.includes('chicken') || name?.includes('beef')) {
        estimatedNutrition.calories += 200;
        estimatedNutrition.protein += 25;
      } else if (name?.includes('rice') || name?.includes('pasta') || name?.includes('bread')) {
        estimatedNutrition.calories += 150;
        estimatedNutrition.carbs += 30;
      } else if (name?.includes('vegetable') || name?.includes('fruit')) {
        estimatedNutrition.calories += 25;
        estimatedNutrition.carbs += 6;
        estimatedNutrition.fiber += 2;
      }
    });
  }
  
  // Normalize per serving
  if (recipe.numberOfServings && recipe.numberOfServings > 1) {
    Object.keys(estimatedNutrition).forEach(key => {
      estimatedNutrition[key] = Math.round(estimatedNutrition[key] / recipe.numberOfServings);
    });
  }
  
  return { ...recipe, nutrition: estimatedNutrition };
} 
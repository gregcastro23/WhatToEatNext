import type { ElementalProperties, Recipe } from '@/types/recipe';
import { isNonEmptyArray } from '../common/arrayUtils';
import { createLogger } from '../logger';

const _logger = createLogger('RecipeEnrichment');

/**
 * Enriches recipe data with enhanced astrological and elemental properties
 */
export function enrichRecipeData(recipe: Partial<Recipe>): Recipe {
  // Create a deep copy to avoid mutating the original
  const enrichedRecipe = JSON.parse(JSON.stringify(recipe)) as Partial<Recipe>;

  // Ensure all required properties exist with proper defaults
  const enriched: Recipe = {
    id: enrichedRecipe.id || `recipe-${Date.now()}`,
    name: enrichedRecipe.name || 'Unnamed Recipe',
    description: enrichedRecipe.description || '',
    cuisine: enrichedRecipe.cuisine || 'Various',
    ingredients: enrichedRecipe.ingredients || [],
    instructions: enrichedRecipe.instructions || [],
    elementalProperties: enrichedRecipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    timeToMake: enrichedRecipe.timeToMake || '30 minutes',
    numberOfServings: enrichedRecipe.numberOfServings || 4,
    // Copy over all other properties
    ...enrichedRecipe,
  };

  // 1. Derive astrological influences from ingredients if not present
  if (!enriched.astrologicalInfluences || enriched.astrologicalInfluences.length === 0) {
    enriched.astrologicalInfluences = deriveAstrologicalInfluencesFromIngredients(enriched);
  }

  // 2. Derive elemental properties from cuisine and cooking method if not present
  if (!enriched.elementalProperties || Object.keys(enriched.elementalProperties).length === 0) {
    enriched.elementalProperties = deriveElementalProperties(enriched);
  }

  // 3. Enhance seasonal information with normalization
  if (enriched.season) {
    enriched.season = enrichAndNormalizeSeasons(enriched.season);
  }

  // 4. Add celestial timing recommendations
  enriched.celestialTiming = deriveCelestialTiming(enriched);

  return enriched;
}

/**
 * Derive astrological influences from recipe ingredients
 */
function deriveAstrologicalInfluencesFromIngredients(recipe: Recipe): string[] {
  const influences: Set<string> = new Set();

  // Common astrological correspondences for ingredients
  const ingredientCorrespondences: Record<string, string[]> = {
    // Spices - Enhanced Mars, Sun, and Moon associations
    cinnamon: ['Sun', 'Mars', 'Fire'],
    nutmeg: ['Jupiter', 'Air'],
    clove: ['Jupiter', 'Mars', 'Fire'],
    ginger: ['Mars', 'Fire'],
    pepper: ['Mars', 'Fire'],
    chili: ['Mars', 'Fire'],
    cayenne: ['Mars', 'Fire'],
    paprika: ['Mars', 'Sun', 'Fire'],
    turmeric: ['Sun', 'Earth'],
    saffron: ['Sun', 'Fire'],
    cumin: ['Mars', 'Earth'],
    cardamom: ['Moon', 'Venus', 'Water'],

    // Fruits - Enhanced Sun and Moon associations
    apple: ['Venus', 'Water'],
    orange: ['Sun', 'Fire'],
    lemon: ['Moon', 'Water'],
    lime: ['Moon', 'Water'],
    banana: ['Moon', 'Water'],
    coconut: ['Moon', 'Water'],

    // Vegetables - Enhanced Mars, Sun, and Moon associations
    potato: ['Earth', 'Saturn'],
    carrot: ['Sun', 'Mars', 'Earth'],
    onion: ['Mars', 'Fire'],
    garlic: ['Mars', 'Fire'],
    tomato: ['Mars', 'Fire'],
    cucumber: ['Moon', 'Water'],
    mushroom: ['Moon', 'Earth'],

    // Grains - Enhanced Sun and Moon associations
    rice: ['Moon', 'Water'],
    wheat: ['Sun', 'Earth'],
    quinoa: ['Sun', 'Earth'],
    oats: ['Venus', 'Earth'],

    // Proteins - Enhanced Mars associations
    beef: ['Mars', 'Fire'],
    chicken: ['Mercury', 'Sun', 'Air'],
    fish: ['Neptune', 'Water'],
    egg: ['Moon', 'Water'],

    // Herbs - Enhanced Mars, Sun, and Moon associations
    basil: ['Mars', 'Fire'],
    rosemary: ['Sun', 'Fire'],
    thyme: ['Venus', 'Air'],
    sage: ['Jupiter', 'Air'],
    mint: ['Mercury', 'Air'],
    parsley: ['Mercury', 'Air'],
  };

  // Extract ingredient names from recipe
  if (isNonEmptyArray(recipe.ingredients)) {
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();

      // Check for matches in correspondences
      Object.entries(ingredientCorrespondences).forEach(([key, correspondences]) => {
        if (ingredientName.includes(key)) {
          correspondences.forEach(c => influences.add(c));
        }
      });
    });
  }

  return Array.from(influences);
}

/**
 * Derive elemental properties from recipe characteristics
 */
function deriveElementalProperties(recipe: Recipe): ElementalProperties {
  // Start with balanced elemental properties
  const elementalProps: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

  // Cooking method influences
  if (isNonEmptyArray(recipe.cookingMethod)) {
    const methodStr = recipe.cookingMethod.join(' ').toLowerCase();

    // Fire-enhancing methods
    if (
      methodStr.includes('grill') ||
      methodStr.includes('roast') ||
      methodStr.includes('bake') ||
      methodStr.includes('fry') ||
      methodStr.includes('broil')
    ) {
      elementalProps.Fire += 0.3;
    }
    // Water-enhancing methods
    else if (
      methodStr.includes('steam') ||
      methodStr.includes('boil') ||
      methodStr.includes('poach') ||
      methodStr.includes('simmer')
    ) {
      elementalProps.Water += 0.3;
    }
    // Air-enhancing methods
    else if (
      methodStr.includes('raw') ||
      methodStr.includes('fresh') ||
      methodStr.includes('salad') ||
      methodStr.includes('cold')
    ) {
      elementalProps.Air += 0.3;
    }
    // Earth-enhancing methods
    else if (
      methodStr.includes('slow') ||
      methodStr.includes('stew') ||
      methodStr.includes('braise') ||
      methodStr.includes('crock')
    ) {
      elementalProps.Earth += 0.3;
    }
  }

  // Cuisine influences
  if (recipe.cuisine) {
    const cuisine = recipe.cuisine.toLowerCase();

    // Fire cuisines
    if (
      cuisine.includes('indian') ||
      cuisine.includes('thai') ||
      cuisine.includes('mexican') ||
      cuisine.includes('korean') ||
      cuisine.includes('middle-eastern')
    ) {
      elementalProps.Fire += 0.2;
    }
    // Water cuisines
    else if (
      cuisine.includes('japanese') ||
      cuisine.includes('chinese') ||
      cuisine.includes('vietnamese') ||
      cuisine.includes('seafood')
    ) {
      elementalProps.Water += 0.2;
    }
    // Air cuisines
    else if (
      cuisine.includes('mediterranean') ||
      cuisine.includes('greek') ||
      cuisine.includes('italian') ||
      cuisine.includes('french')
    ) {
      elementalProps.Air += 0.2;
    }
    // Earth cuisines
    else if (
      cuisine.includes('german') ||
      cuisine.includes('comfort') ||
      cuisine.includes('american') ||
      cuisine.includes('british')
    ) {
      elementalProps.Earth += 0.2;
    }
  }

  // Normalize to ensure sum equals 1
  const total =
    elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air;
  if (total > 0) {
    elementalProps.Fire /= total;
    elementalProps.Water /= total;
    elementalProps.Earth /= total;
    elementalProps.Air /= total;
  }

  return elementalProps;
}

/**
 * Enhance and normalize seasonal information with zodiac correspondences
 */
function enrichAndNormalizeSeasons(seasons?: string | string[]): string[] {
  // Handle both string and string[] inputs
  const seasonArray = Array.isArray(seasons) ? seasons : seasons ? [seasons] : [];

  if (!isNonEmptyArray(seasonArray)) {
    return ['all']; // Default to all seasons
  }

  const normalizedSeasons: string[] = [];

  seasonArray.forEach(season => {
    const s = season.toLowerCase().trim();

    // Normalize season names and zodiac correspondences
    if (s === 'spring' || s === 'aries' || s === 'taurus' || s === 'gemini') {
      normalizedSeasons.push('spring');
    } else if (s === 'summer' || s === 'cancer' || s === 'leo' || s === 'virgo') {
      normalizedSeasons.push('summer');
    } else if (
      s === 'autumn' ||
      s === 'fall' ||
      s === 'libra' ||
      s === 'scorpio' ||
      s === 'sagittarius'
    ) {
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
 * Derive celestial timing recommendations for optimal recipe preparation
 */
function deriveCelestialTiming(recipe: Recipe): {
  optimalMoonPhase?: string,
  optimalPlanetaryHour?: string,
  bestZodiacSeason?: string;
} {
  const timing: {
    optimalMoonPhase?: string,
    optimalPlanetaryHour?: string,
    bestZodiacSeason?: string;
  } = {};

  // Determine optimal Moon phase based on recipe characteristics
  if (isNonEmptyArray(recipe.cookingMethod)) {
    const methodStr = recipe.cookingMethod.join(' ').toLowerCase();

    // Moon phase recommendations based on cooking process
    if (
      methodStr.includes('ferment') ||
      methodStr.includes('rise') ||
      methodStr.includes('proof') ||
      methodStr.includes('sourdough')
    ) {
      timing.optimalMoonPhase = 'waxing'; // Growing energy for fermentation
    } else if (
      methodStr.includes('preserve') ||
      methodStr.includes('cure') ||
      methodStr.includes('age') ||
      methodStr.includes('pickle')
    ) {
      timing.optimalMoonPhase = 'waning'; // Reducing energy for preservation
    } else if (
      methodStr.includes('quick') ||
      methodStr.includes('flash') ||
      methodStr.includes('instant') ||
      methodStr.includes('blanch')
    ) {
      timing.optimalMoonPhase = 'new moon'; // New beginnings for quick cooking
    } else if (
      methodStr.includes('slow') ||
      methodStr.includes('braise') ||
      methodStr.includes('stew') ||
      methodStr.includes('roast')
    ) {
      timing.optimalMoonPhase = 'full moon'; // Full energy for long cooking
    }
  }

  // Determine optimal planetary hour based on dominant element
  if (recipe.elementalProperties) {
    const dominantElement = Object.entries(recipe.elementalProperties).reduce(
      (max, [element, value]) => (value > max.value ? { element, value } : max),
      { element: 'Fire', value: 0 },
    ).element;

    // Planetary hour recommendations by dominant element
    const planetaryHours: Record<string, string> = {
      Fire: 'Mars hour',
      Water: 'Moon hour',
      Earth: 'Venus hour',
      Air: 'Mercury hour'
    };

    timing.optimalPlanetaryHour = planetaryHours[dominantElement];
  }

  // Determine best zodiac season based on cuisine type
  if (recipe.cuisine) {
    const cuisine = recipe.cuisine.toLowerCase();

    if (
      cuisine.includes('spring') ||
      cuisine.includes('fresh') ||
      cuisine.includes('light') ||
      cuisine.includes('mediterranean')
    ) {
      timing.bestZodiacSeason = 'aries-taurus-gemini';
    } else if (
      cuisine.includes('summer') ||
      cuisine.includes('grilled') ||
      cuisine.includes('barbecue') ||
      cuisine.includes('mexican')
    ) {
      timing.bestZodiacSeason = 'cancer-leo-virgo';
    } else if (
      cuisine.includes('autumn') ||
      cuisine.includes('comfort') ||
      cuisine.includes('hearty') ||
      cuisine.includes('indian')
    ) {
      timing.bestZodiacSeason = 'libra-scorpio-sagittarius';
    } else if (
      cuisine.includes('winter') ||
      cuisine.includes('warm') ||
      cuisine.includes('spiced') ||
      cuisine.includes('german')
    ) {
      timing.bestZodiacSeason = 'capricorn-aquarius-pisces';
    }
  }

  return timing;
}

/**
 * Calculate recipe complexity score based on ingredients and techniques
 */
export function calculateRecipeComplexity(recipe: Recipe): number {
  let complexity = 0;

  // Base complexity from number of ingredients (capped at 2 points)
  if (isNonEmptyArray(recipe.ingredients)) {
    complexity += Math.min(recipe.ingredients.length * 0.12, 2);
  }

  // Cooking method complexity
  if (isNonEmptyArray(recipe.cookingMethod)) {
    const methodStr = recipe.cookingMethod.join(' ').toLowerCase();

    // High complexity methods
    if (
      methodStr.includes('sous vide') ||
      methodStr.includes('molecular') ||
      methodStr.includes('smoking') ||
      methodStr.includes('curing')
    ) {
      complexity += 3;
    }
    // Medium complexity methods
    else if (
      methodStr.includes('braise') ||
      methodStr.includes('confit') ||
      methodStr.includes('ferment') ||
      methodStr.includes('pickling')
    ) {
      complexity += 2;
    }
    // Low complexity methods
    else if (
      methodStr.includes('roast') ||
      methodStr.includes('bake') ||
      methodStr.includes('grill') ||
      methodStr.includes('sauté')
    ) {
      complexity += 1;
    }
  }

  // Equipment complexity
  if (isNonEmptyArray(recipe.equipmentNeeded)) {
    complexity += Math.min(recipe.equipmentNeeded.length * 0.5, 1.5);
  }

  // Technique complexity
  if (isNonEmptyArray(recipe.cookingTechniques)) {
    complexity += Math.min(recipe.cookingTechniques.length * 0.3, 1);
  }

  // Time complexity (longer recipes are more complex)
  if (recipe.timeToMake) {
    const timeMatch = recipe.timeToMake.match(/(\d+)/);
    if (timeMatch) {
      const timeInMinutes = parseInt(timeMatch[1], 10);
      if (timeInMinutes > 120)
        complexity += 1; // Over 2 hours
      else if (timeInMinutes > 60) complexity += 0.5; // Over 1 hour
    }
  }

  // Normalize to 0-10 scale
  return Math.min(10, Math.max(0, complexity));
}

/**
 * Enhance recipe with nutritional estimates based on ingredients
 */
export function enhanceWithNutritionalEstimates(recipe: Recipe): Recipe {
  // Return early if nutrition already exists
  if (recipe.nutrition) {
    return recipe;
  }

  // Simple nutritional estimation based on ingredients
  const estimatedNutrition: Record<string, number> = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
};

  // Basic nutritional estimation based on ingredients
  if (isNonEmptyArray(recipe.ingredients)) {
    recipe.ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();

      // Rough nutritional estimates per 100g of common ingredients
      if (name.includes('oil') || name.includes('butter') || name.includes('fat')) {
        estimatedNutrition.calories += 120;
        estimatedNutrition.fat += 14;
      } else if (
        name.includes('chicken') ||
        name.includes('turkey') ||
        name.includes('beef') ||
        name.includes('pork') ||
        name.includes('fish') ||
        name.includes('meat')
      ) {
        estimatedNutrition.calories += 200;
        estimatedNutrition.protein += 25;
        estimatedNutrition.fat += 10;
      } else if (
        name.includes('rice') ||
        name.includes('pasta') ||
        name.includes('bread') ||
        name.includes('grain')
      ) {
        estimatedNutrition.calories += 150;
        estimatedNutrition.carbs += 30;
        estimatedNutrition.fiber += 3;
      } else if (name.includes('potato') || name.includes('sweet potato')) {
        estimatedNutrition.calories += 90;
        estimatedNutrition.carbs += 20;
        estimatedNutrition.fiber += 2;
      } else if (
        name.includes('vegetable') ||
        name.includes('broccoli') ||
        name.includes('carrot') ||
        name.includes('spinach') ||
        name.includes('lettuce') ||
        name.includes('cucumber')
      ) {
        estimatedNutrition.calories += 25;
        estimatedNutrition.carbs += 6;
        estimatedNutrition.fiber += 2;
      } else if (
        name.includes('fruit') ||
        name.includes('apple') ||
        name.includes('banana') ||
        name.includes('orange') ||
        name.includes('berry') ||
        name.includes('lemon')
      ) {
        estimatedNutrition.calories += 50;
        estimatedNutrition.carbs += 12;
        estimatedNutrition.sugar += 8;
        estimatedNutrition.fiber += 2;
      } else if (
        name.includes('cheese') ||
        name.includes('dairy') ||
        name.includes('milk') ||
        name.includes('cream')
      ) {
        estimatedNutrition.calories += 150;
        estimatedNutrition.protein += 8;
        estimatedNutrition.fat += 12;
      } else if (name.includes('egg')) {
        estimatedNutrition.calories += 70;
        estimatedNutrition.protein += 6;
        estimatedNutrition.fat += 5;
      } else if (
        name.includes('bean') ||
        name.includes('lentil') ||
        name.includes('pea') ||
        name.includes('tofu')
      ) {
        estimatedNutrition.calories += 100;
        estimatedNutrition.protein += 8;
        estimatedNutrition.carbs += 18;
        estimatedNutrition.fiber += 6;
      }
    });
  }

  // Normalize per serving if multiple servings
  const servings = recipe.numberOfServings || 1;
  if (servings > 1) {
    Object.keys(estimatedNutrition).forEach(key => {
      estimatedNutrition[key] = Math.round(estimatedNutrition[key] / servings);
    });
  }

  return { ...recipe, nutrition: estimatedNutrition };
}

import { _ElementalProperties } from '@/types/alchemy';
import { Recipe, RecipeElementalMapping } from '@/types/recipes';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * Utility functions for recipe calculations and alignments
 */
export const recipeCalculations = {
  /**
   * Calculate how well a recipe aligns with its cuisine's elemental properties
   * @param recipe Recipe with elemental properties and cuisine data
   * @returns Alignment score (higher is better)
   */
  calculateCuisineAlignment(recipe: RecipeElementalMapping): number {
    const cuisineElements = recipe.cuisine.elementalAlignment;
    const alignmentScore = Object.entries(recipe.elementalProperties).reduce((sum, [element, value]) => {
      return sum + (value * cuisineElements[element as keyof ElementalProperties]);
    }, 0);
    
    const recipeData = recipe as unknown;
    debugLog(`Cuisine alignment score for ${recipeData?.name || 'Unknown Recipe'}: ${alignmentScore.toFixed(2)}`);
    return alignmentScore;
  },

  /**
   * Get the optimal astrological windows for cooking a particular recipe
   * @param recipe Recipe with astrological profile
   * @returns Array of optimal times / (conditions || 1) for cooking
   */
  getOptimalCookingWindow(recipe: RecipeElementalMapping): string[] {
    const optimalTimes = [
      ...recipe.astrologicalProfile.rulingPlanets.map(p => `${p} dominant hours`),
      ...recipe.cuisine.astrologicalProfile.aspectEnhancers
    ];
    
    const recipeWindowData = recipe as unknown;
    debugLog(`Optimal cooking windows for ${recipeWindowData?.name || 'Unknown Recipe'}:`, optimalTimes);
    return optimalTimes;
  },

  /**
   * Determine how much an elemental boost a user would get from a recipe
   * based on their personal elemental profile
   * @param recipe Recipe with elemental properties
   * @param userElements User's elemental properties / (affinities || 1)
   * @returns Boost value (higher means more boost)
   */
  determineElementalBoost(recipe: RecipeElementalMapping, userElements: ElementalProperties): number {
    // Find the dominant element in the recipe
    const dominantElement = Object.entries(recipe.elementalProperties)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Calculate boost from the user's affinity with that element
    const boost = userElements[dominantElement] * 1.5;
    
    const recipeBoostData = recipe as unknown;
    debugLog(`Elemental boost for ${recipeBoostData?.name || 'Unknown Recipe'}: ${boost.toFixed(2)} (dominant: ${dominantElement})`);
    return boost;
  }
};

/**
 * Additional Recipe utility functions that work with the full Recipe type
 */
export const recipeAnalysis = {
  /**
   * Calculate the nutritional-elemental correlation for a recipe
   * @param recipe Full recipe with nutritional information
   * @returns Correlation score between nutrition and elemental properties
   */
  calculateNutritionalElementalCorrelation(recipe: Recipe): number {
    if (!recipe.nutritionalInfo || !recipe.elementalProperties) {
      return 0;
    }

    const nutrition = recipe.nutritionalInfo;
    const elements = recipe.elementalProperties;
    
    // Safe type casting for nutrition properties
    const nutritionData = nutrition as unknown;
    
    // Fire correlates with protein and spices (energy-giving)
    const fireCorrelation = (nutritionData?.protein || 0) * 0.4 + (nutritionData?.spiciness || 0) * 0.6;
    
    // Water correlates with hydration and cooling foods
    const waterCorrelation = (nutritionData?.water || 0) * 0.7 + (nutritionData?.cooling || 0) * 0.3;
    
    // Earth correlates with carbohydrates and fiber (grounding)
    const earthCorrelation = (nutritionData?.carbohydrates || 0) * 0.5 + (nutritionData?.fiber || 0) * 0.5;
    
    // Air correlates with lightness and digestibility
    const airCorrelation = (1 - (nutritionData?.heaviness || 0.5)) * 0.6 + (nutritionData?.digestibility || 0.5) * 0.4;
    
    // Calculate how well the elemental properties match these nutritional indicators
    const correlation = 
      Math.abs(elements.Fire - fireCorrelation) +
      Math.abs(elements.Water - waterCorrelation) +
      Math.abs(elements.Earth - earthCorrelation) +
      Math.abs(elements.Air - airCorrelation);
    
    // Return inverse correlation (lower difference = higher correlation)
    return Math.max(0, 1 - (correlation / 4));
  },

  /**
   * Analyze recipe complexity and recommend skill level
   * @param recipe Full recipe with instructions and ingredients
   * @returns Complexity analysis with skill recommendation
   */
  analyzeRecipeComplexity(recipe: Recipe): {
    complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    score: number;
    factors: string[];
  } {
    let complexityScore = 0;
    const factors: string[] = [];

    // Ingredient count complexity
    const ingredientCount = recipe.ingredients?.length || 0;
    if (ingredientCount > 15) {
      complexityScore += 2;
      factors.push('Many ingredients required');
    } else if (ingredientCount > 8) {
      complexityScore += 1;
      factors.push('Moderate ingredient count');
    }

    // Cooking time complexity
    const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);
    if (totalTime > 180) {
      complexityScore += 2;
      factors.push('Long cooking time');
    } else if (totalTime > 60) {
      complexityScore += 1;
      factors.push('Moderate cooking time');
    }

    // Technique complexity
    const instructions = recipe.instructions || [];
    const techniques = instructions.join(' ').toLowerCase();
    
    const advancedTechniques = [
      'sous vide', 'tempering', 'emulsification', 'fermentation',
      'clarification', 'molecular', 'spherification', 'gelification'
    ];
    
    const intermediateTechniques = [
      'braising', 'confit', 'reduction', 'roux', 'flambé',
      'julienne', 'brunoise', 'chiffonade', 'mise en place'
    ];

    advancedTechniques.forEach(technique => {
      if (techniques.includes(technique)) {
        complexityScore += 3;
        factors.push(`Advanced technique: ${technique}`);
      }
    });

    intermediateTechniques.forEach(technique => {
      if (techniques.includes(technique)) {
        complexityScore += 1;
        factors.push(`Intermediate technique: ${technique}`);
      }
    });

    // Equipment complexity
    const equipment = recipe.equipment || [];
    const specialEquipment = [
      'food processor', 'stand mixer', 'immersion blender',
      'mandoline', 'pasta machine', 'pressure cooker', 'smoker'
    ];
    
    // Safe array handling for equipment
    if (Array.isArray(equipment)) {
      equipment.forEach(item => {
        if (typeof item === 'string' && specialEquipment.includes(item.toLowerCase())) {
          complexityScore += 1;
          factors.push(`Special equipment: ${item}`);
        }
      });
    }

    // Determine complexity level
    let complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    if (complexityScore <= 2) {
      complexity = 'beginner';
    } else if (complexityScore <= 5) {
      complexity = 'intermediate';
    } else if (complexityScore <= 8) {
      complexity = 'advanced';
    } else {
      complexity = 'expert';
    }

    return {
      complexity,
      score: complexityScore,
      factors
    };
  },

  /**
   * Calculate the seasonal appropriateness of a recipe
   * @param recipe Recipe with seasonal information and elemental properties
   * @param season Current season
   * @returns Seasonal appropriateness score (0-1)
   */
  calculateSeasonalAppropriateness(recipe: Recipe, season: string): number {
    let score = 0.5; // Base score

    // Check explicit seasonal tags
    if (recipe.seasons && Array.isArray(recipe.seasons) && recipe.seasons.includes(season)) {
      score += 0.3;
    }

    // Check elemental alignment with season
    const seasonalElements = {
      spring: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
      summer: { Fire: 0.4, Air: 0.3, Water: 0.2, Earth: 0.1 },
      autumn: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
      winter: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 }
    };

    const seasonElements = seasonalElements[season as keyof typeof seasonalElements];
    if (seasonElements && recipe.elementalProperties) {
      const elementalAlignment = Object.entries(seasonElements)
        .reduce((sum, [element, weight]) => {
          return sum + (recipe.elementalProperties[element as keyof ElementalProperties] * weight);
        }, 0);
      
      score += elementalAlignment * 0.2;
    }

    // Check ingredient seasonality
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const seasonalIngredients = recipe.ingredients.filter(ingredient => 
        ingredient.seasonality && Array.isArray(ingredient.seasonality) && ingredient.seasonality.includes(season)
      );
      
      const seasonalRatio = seasonalIngredients.length / recipe.ingredients.length;
      score += seasonalRatio * 0.2;
    }

    return Math.min(1, Math.max(0, score));
  }
}; 
'use strict';
// ===== UNIFIED RECIPE SYSTEM - PHASE 3 =====
// Adds alchemical enhancements to existing cuisine recipes
// WITHOUT removing any data - purely additive system
Object.defineProperty(exports, '__esModule', { value: true });
exports.RecipeAnalyzer = exports.RecipeEnhancer = void 0;
const ingredients_js_1 = require('./ingredients.js');
// Recipe enhancement utilities
class RecipeEnhancer {
  /**
   * Calculate recipe Kalchm from ingredients using unified ingredients database
   */
  static calculateRecipeKalchm(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) {
      return {
        totalKalchm: 1.0,
        breakdown: [],
        matchedIngredients: 0,
      };
    }
    let totalKalchm = 0;
    let matchedIngredients = 0;
    const breakdown = [];
    for (const ingredient of ingredients) {
      const ingredientName = ingredient.name?.toLowerCase();
      let kalchm = 1.0; // Default Kalchm
      let elementalContribution = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      // Try to find ingredient in unified ingredients
      const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
      if (unifiedIngredient) {
        kalchm = unifiedIngredient.kalchm;
        elementalContribution = unifiedIngredient.elementalProperties;
        matchedIngredients++;
      } else {
        // Fallback: derive from element if available
        if (ingredient.element) {
          elementalContribution = this.elementToElementalProperties(ingredient.element);
          kalchm = this.estimateKalchmFromElement(ingredient.element);
        }
      }
      totalKalchm += kalchm;
      breakdown.push({
        name: ingredient.name,
        kalchm,
        contribution: kalchm / ingredients.length,
        elementalContribution,
      });
    }
    return {
      totalKalchm: ingredients.length > 0 ? totalKalchm / ingredients.length : 1.0,
      breakdown,
      matchedIngredients,
    };
  }
  /**
   * Find ingredient in unified ingredients database
   */
  static findUnifiedIngredient(ingredientName) {
    if (!ingredientName) return null;
    // Direct lookup
    const direct = ingredients_js_1.unifiedIngredients[ingredientName];
    if (direct) return direct;
    // Fuzzy matching
    const normalizedName = ingredientName.replace(/[^a-z0-9]/g, '').toLowerCase();
    for (const [key, ingredient] of Object.entries(ingredients_js_1.unifiedIngredients)) {
      const normalizedKey = key.replace(/[^a-z0-9]/g, '').toLowerCase();
      if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
        return ingredient;
      }
    }
    return null;
  }
  /**
   * Convert single element to elemental properties
   */
  static elementToElementalProperties(element) {
    const elementMap = {
      Fire: any,
      Water: any,
      Earth: any,
      Air: { Fire: 0.05, Water: 0.05, Earth: 0.1, Air: 0.8 },
    };
    return (
      elementMap[element?.toLowerCase()] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    );
  }
  /**
   * Estimate Kalchm from element
   */
  static estimateKalchmFromElement(element) {
    const elementKalchm = {
      Fire: 1.15,
      Water: 0.95,
      Earth: 0.85,
      Air: 1.05,
    };
    return elementKalchm[element?.toLowerCase()] || 1.0;
  }
  /**
   * Calculate elemental balance from ingredient breakdown
   */
  static calculateElementalBalance(breakdown) {
    if (!breakdown || breakdown.length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    let totalfire = 0,
      totalwater = 0,
      totalearth = 0,
      totalAir = 0;
    for (const item of breakdown) {
      const contribution = item.elementalContribution;
      const weight = item.contribution;
      totalfire += contribution.Fire * weight;
      totalwater += contribution.Water * weight;
      totalearth += contribution.Earth * weight;
      totalAir += contribution.Air * weight;
    }
    const total = totalfire + totalwater + totalearth + totalAir;
    if (total === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    return {
      Fire: totalfire / total,
      Water: totalwater / total,
      Earth: totalearth / total,
      Air: totalAir / total,
    };
  }
  /**
   * Calculate thermodynamic properties for recipe
   */
  static calculateRecipeThermodynamics(elementalBalance) {
    const { Fire, Water, Earth, Air } = elementalBalance;
    // Thermodynamic calculations based on elemental properties
    const heat = (fire * fire + 0.5) / (water + earth + Air + 1);
    const entropy = (fire + Air) / (water + earth + 1);
    const reactivity = (fire + Air + water) / (earth + 1);
    const gregsEnergy = heat - entropy * reactivity;
    return { heat, entropy, reactivity, gregsEnergy };
  }
  /**
   * Calculate Monica constant for recipe
   */
  static calculateRecipeMonica(thermodynamics, kalchm) {
    const { gregsEnergy, reactivity } = thermodynamics;
    if (kalchm <= 0 || reactivity === 0) {
      return null;
    }
    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0) {
      return null;
    }
    const monica = -gregsEnergy / (reactivity * lnKalchm);
    return isNaN(monica) ? null : monica;
  }
  /**
   * Determine alchemical classification
   */
  static determineAlchemicalClassification(kalchm, monica) {
    if (monica === null) {
      return kalchm > 1.0 ? 'Spirit-Dominant' : 'Matter-Dominant';
    }
    if (kalchm > 1.2) return 'Highly Volatile';
    if (kalchm > 1.0) return 'Transformative';
    if (kalchm > 0.8) return 'Balanced';
    return 'Grounding';
  }
  /**
   * Calculate optimal cooking temperature
   */
  static calculateOptimalTemperature(thermodynamics) {
    const { heat, reactivity } = thermodynamics;
    // Base temperature (350°F) adjusted by thermodynamic properties
    return Math.round(350 + heat * 50 - reactivity * 25);
  }
  /**
   * Determine elemental cooking method
   */
  static determineElementalCookingMethod(elementalBalance) {
    const { Fire, Water, Earth, Air } = elementalBalance;
    if (fire > 0.4) return 'fire-dominant'; // Grilling, roasting, searing
    if (water > 0.4) return 'water-dominant'; // Steaming, boiling, poaching
    if (earth > 0.4) return 'earth-dominant'; // Baking, slow cooking, braising
    if (Air > 0.4) return 'Air-dominant'; // Whipping, rising, frying
    return 'balanced'; // Multiple cooking methods
  }
  /**
   * Generate thermodynamic recommendations
   */
  static generateThermodynamicRecommendations(thermodynamics, monicaConstant) {
    const recommendations = [];
    const { heat, entropy, reactivity } = thermodynamics;
    // Heat-based recommendations
    if (heat > 0.7) {
      recommendations.push('Use high-heat cooking methods for optimal energy release');
    } else if (heat < 0.3) {
      recommendations.push('Gentle, low-heat cooking preserves delicate properties');
    }
    // Entropy-based recommendations
    if (entropy > 0.6) {
      recommendations.push('Quick cooking prevents energy dispersion');
    } else {
      recommendations.push('Slow cooking allows flavors to develop');
    }
    // Reactivity-based recommendations
    if (reactivity > 0.8) {
      recommendations.push('Monitor carefully - highly reactive ingredients');
    }
    // Monica constant recommendations
    if (monica !== null) {
      if (monica > 0) {
        recommendations.push('Increase cooking intensity for optimal results');
      } else {
        recommendations.push('Reduce cooking intensity to maintain balance');
      }
    }
    // Elemental recommendations
    const dominant = Object.entries(elementalBalance).reduce((a, b) =>
      elementalBalance[a[0]] > elementalBalance[b[0]] ? a : b,
    )[0];
    switch (dominant) {
      case 'Fire':
        recommendations.push('Fire-dominant: Best with direct heat methods');
        break;
      case 'Water':
        recommendations.push('Water-dominant: Excellent for moist heat cooking');
        break;
      case 'Earth':
        recommendations.push('Earth-dominant: Perfect for slow, steady cooking');
        break;
      case 'Air':
        recommendations.push('Air-dominant: Benefits from aeration and light cooking');
        break;
    }
    return recommendations;
  }
  /**
   * Calculate Monica adjustments
   */
  static calculateMonicaAdjustments(monica) {
    if (monica === null) {
      return {};
    }
    return {
      temperatureAdjustment: Math.round(monica * 10),
      timingAdjustment: Math.round(monica * 5),
      intensityModifier: monica > 0 ? 'increase' : 'decrease',
    };
  }
  /**
   * Calculate planetary timing
   */
  static calculatePlanetaryTiming(recipe) {
    // Use existing astrological data if available
    if (
      recipe.astrologicalAffinities?.planets &&
      recipe.astrologicalAffinities.planets.length > 0
    ) {
      return recipe.astrologicalAffinities.planets[0] + ' hour';
    }
    if (recipe.zodiacInfluences && recipe.zodiacInfluences.length > 0) {
      // Map zodiac to planetary rulers
      const zodiacPlanets = {
        aries: 'Mars',
        taurus: 'Venus',
        gemini: 'Mercury',
        cancer: 'Moon',
        leo: 'Sun',
        virgo: 'Mercury',
        libra: 'Venus',
        scorpio: 'Mars',
        sagittarius: 'Jupiter',
        capricorn: 'Saturn',
        aquarius: 'Saturn',
        pisces: 'Jupiter',
      };
      const planet = zodiacPlanets[recipe.zodiacInfluences[0].toLowerCase()];
      return planet ? planet + ' hour' : null;
    }
    return null;
  }
  /**
   * Enhance a recipe with alchemical properties (ADDITIVE - preserves all existing data)
   */
  static enhanceRecipe(recipe, sourceFile = 'unknown') {
    // Calculate recipe Kalchm from ingredients
    const kalchmResult = this.calculateRecipeKalchm(recipe.ingredients || []);
    // Calculate elemental balance// Calculate thermodynamic properties
    const thermodynamics = this.calculateRecipeThermodynamics(elementalBalance);
    // Calculate Monica constant
    const monicaConstant = this.calculateRecipeMonica(thermodynamics, kalchmResult.totalKalchm);
    // Determine alchemical classification
    const alchemicalClassification = this.determineAlchemicalClassification(
      kalchmResult.totalKalchm,
      monicaConstant,
    );
    // Calculate cooking optimization
    const optimalTemperature = this.calculateOptimalTemperature(thermodynamics);
    const planetaryTiming = this.calculatePlanetaryTiming(recipe);
    const monicaAdjustments = this.calculateMonicaAdjustments(monicaConstant);
    const elementalCookingMethod = this.determineElementalCookingMethod(elementalBalance);
    const thermodynamicRecommendations = this.generateThermodynamicRecommendations(
      thermodynamics,
      monicaConstant,
    );
    // Create enhanced recipe (PRESERVES ALL EXISTING DATA)
    const enhancedRecipe = {
      ...recipe,
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmResult.totalKalchm,
        monicaConstant,
        thermodynamicProfile: thermodynamics,
        ingredientKalchmBreakdown: kalchmResult.breakdown,
        alchemicalClassification,
      },
      // ADD cooking optimization
      cookingOptimization: {
        optimalTemperature,
        planetaryTiming,
        monicaAdjustments,
        elementalCookingMethod,
        thermodynamicRecommendations,
      },
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        monicaCalculated: monicaConstant !== null,
        enhancedAt: new Date().toISOString(),
        sourceFile,
        ingredientsMatched: kalchmResult.matchedIngredients,
        ingredientsTotal: recipe.ingredients?.length || 0,
      },
    };
    return enhancedRecipe;
  }
}
exports.RecipeEnhancer = RecipeEnhancer;
// Recipe compatibility and analysis utilities
class RecipeAnalyzer {
  /**
   * Calculate compatibility between two recipes based on Kalchm values
   */
  static calculateRecipeCompatibility(recipe1, recipe2) {
    const kalchm1 = recipe1.alchemicalProperties?.totalKalchm || 1.0;
    const kalchm2 = recipe2.alchemicalProperties?.totalKalchm || 1.0;
    // Self-reinforcement principle: similar Kalchm = higher compatibility
    const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);
    return 0.7 + ratio * 0.3; // Minimum 0.7 compatibility
  }
  /**
   * Find recipes with similar Kalchm values
   */
  static findKalchmSimilarRecipes(targetRecipe, recipePool, tolerance = 0.2) {
    const targetKalchm = targetRecipe.alchemicalProperties?.totalKalchm || 1.0;
    return recipePool.filter(recipe => {
      const recipeKalchm = recipe.alchemicalProperties?.totalKalchm || 1.0;
      return Math.abs(recipeKalchm - targetKalchm) <= tolerance;
    });
  }
  /**
   * Get recipes by elemental dominance
   */
  static getRecipesByElementalDominance(recipes, element, threshold = 0.4) {
    return recipes.filter(recipe => {
      return elementalBalance && elementalBalance[element] >= threshold;
    });
  }
  /**
   * Analyze recipe collection statistics
   */
  static analyzeRecipeCollection(recipes) {
    const enhanced = recipes.filter(r => r.enhancementMetadata?.phase3Enhanced);
    const kalchmValues = enhanced
      .map(r => r.alchemicalProperties?.totalKalchm)
      .filter(k => k !== undefined);
    const monicaCalculated = enhanced.filter(r => r.enhancementMetadata?.monicaCalculated).length;
    // Elemental distribution
    const elementalDistribution = {
      'Fire-dominant': 0,
      'Water-dominant': 0,
      'Earth-dominant': 0,
      'Air-dominant': 0,
      balanced: 0,
    };
    // Alchemical classifications
    const alchemicalClassifications = {};
    enhanced.forEach(recipe => {
      const cookingMethod = recipe.cookingOptimization?.elementalCookingMethod;
      if (cookingMethod && elementalDistribution[cookingMethod] !== undefined) {
        elementalDistribution[cookingMethod]++;
      }
      const classification = recipe.alchemicalProperties?.alchemicalClassification;
      if (classification) {
        alchemicalClassifications[classification] =
          (alchemicalClassifications[classification] || 0) + 1;
      }
    });
    return {
      totalRecipes: recipes.length,
      enhancedRecipes: enhanced.length,
      kalchmRange: {
        min: Math.min(...kalchmValues),
        max: Math.max(...kalchmValues),
        average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length,
      },
      monicaCalculated,
      elementalDistribution,
      alchemicalClassifications,
    };
  }
}
exports.RecipeAnalyzer = RecipeAnalyzer;
// RecipeEnhancer and RecipeAnalyzer are already exported as classes above
// Default export
exports.default = {
  RecipeEnhancer,
  RecipeAnalyzer,
};

import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { ElementalProperties, Element, Season } from '@/types/alchemy';
import { Recipe } from '@/types/recipe';

// ===== UNIFIED RECIPE SYSTEM - PHASE 3 =====;
// Adds alchemical enhancements to existing cuisine recipes
// WITHOUT removing any data - purely additive system

// Alchemical calculations will be imported as needed
import { unifiedIngredients } from './ingredients';

// Type guards for safe property access
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return isValidObject(obj) && prop in obj
}

// Type guard for ingredient-like objects
interface IngredientLike {
  name?: string,
  element?: string,
  [key: string]: unknown
}

function isIngredientLike(value: unknown): value is IngredientLike {
  return isValidObject(value)
}

// Enhanced recipe interface that extends existing recipe structure
export interface EnhancedRecipe {
  // ===== EXISTING RECIPE PROPERTIES (PRESERVED) =====
  name: string,
  description: string,
  cuisine: string,
  cookingMethods?: string[],
  tools?: string[],
  preparationSteps?: string[]
  ingredients: Array<{
    name: string,
    amount: string | number,
    unit: string,
    category?: string,
    element?: string,
    optional?: boolean,
    preparation?: string,
    seasonality?: Season | 'all' | Season[]
  }>,
  substitutions?: Record<string, string[]> | Array<{ original: string, alternatives: string[] }>,
  servingSize?: number,
  allergens?: string[],
  prepTime?: string,
  cookTime?: string,
  culturalNotes?: string,
  pairingSuggestions?: string[],
  dietaryInfo?: string[],
  spiceLevel?: string | number,
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number,
    fat?: number,
    vitamins?: string[],
    minerals?: string[]
  }
  season?: string[],
  seasonality?: Season | 'all' | Season[],
  mealType?: string[],
  elementalProperties?: ElementalProperties,
  lunarPhaseInfluences?: string[],
  zodiacInfluences?: string[]
  astrologicalAffinities?: {
    planets?: string[],
    signs?: string[],
    lunarPhases?: string[]
  }

  // ===== NEW ALCHEMICAL ENHANCEMENTS (ADDITIVE) =====
  alchemicalProperties?: {
    totalKalchm: number,
    monicaConstant: number | null,
    thermodynamicProfile: {
      heat: number,
      entropy: number,
      reactivity: number,
      gregsEnergy: number
    },
    ingredientKalchmBreakdown: Array<{
      name: string,
      kalchm: number,
      contribution: number,
      elementalContribution: ElementalProperties
    }>,
    alchemicalClassification: string
  }

  // ===== NEW COOKING OPTIMIZATION (ADDITIVE) =====
  cookingOptimization?: {
    optimalTemperature: number,
    planetaryTiming: string | null,
    monicaAdjustments: {
      temperatureAdjustment?: number,
      timingAdjustment?: number,
      intensityModifier?: string
    },
    elementalCookingMethod: string,
    thermodynamicRecommendations: string[]
  }

  // ===== NEW ENHANCEMENT METADATA (ADDITIVE) =====
  enhancementMetadata?: {
    phase3Enhanced: boolean,
    kalchmCalculated: boolean,
    monicaCalculated: boolean,
    enhancedAt: string,
    sourceFile: string,
    ingredientsMatched: number,
    ingredientsTotal: number
  }
}

// Recipe enhancement utilities
export class RecipeEnhancer {
  /**
   * Calculate recipe Kalchm from ingredients using unified ingredients database
   */
  static calculateRecipeKalchm(ingredients: unknown[]): {
    totalKalchm: number,
    breakdown: Array<{
      name: string,
      kalchm: number,
      contribution: number,
      elementalContribution: ElementalProperties
    }>,
    matchedIngredients: number
  } {
    if (!ingredients || !Array.isArray(ingredients)) {
      return {
        totalKalchm: 1.0,
        breakdown: [],
        matchedIngredients: 0
}
    }

    let totalKalchm = 0;
    let matchedIngredients = 0;
    const breakdown: Array<{
      name: string,
      kalchm: number,
      contribution: number,
      elementalContribution: ElementalProperties
    }> = [];

    for (const ingredient of ingredients) {
      if (!isIngredientLike(ingredient)) continue;

      const ingredientName =
        hasProperty(ingredient, 'name') && typeof ingredient.name === 'string'
          ? ingredient.name.toLowerCase()
          : undefined;
      let kalchm = 1.0; // Default Kalchm
      let elementalContribution: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };

      // Try to find ingredient in unified ingredients
      const unifiedIngredient = ingredientName ? this.findUnifiedIngredient(ingredientName) : null;
      if (unifiedIngredient) {
        kalchm = unifiedIngredient.kalchm ?? 1.0;
        const elementalState = unifiedIngredient.elementalState;
        if (elementalState && typeof elementalState === 'object') {
          elementalContribution = elementalState as ElementalProperties;
        }
        matchedIngredients++;
      } else {
        // Fallback: derive from element if available
        const elementValue =
          hasProperty(ingredient, 'element') && typeof ingredient.element === 'string'
            ? ingredient.element
            : null;
        if (elementValue) {
          elementalContribution = this.elementToElementalProperties(elementValue as Element);
          kalchm = this.estimateKalchmFromElement(elementValue as Element);
        }
      }

      totalKalchm += kalchm;
      const ingredientDisplayName =
        hasProperty(ingredient, 'name') && typeof ingredient.name === 'string'
          ? ingredient.name
          : 'unknown ingredient';
      breakdown.push({
        name: ingredientDisplayName,
        kalchm,
        contribution: kalchm / (ingredients || []).length,
        elementalContribution
      })
    }

    return {
      totalKalchm: (ingredients || []).length > 0 ? totalKalchm / (ingredients || []).length : 1.0,
      breakdown,
      matchedIngredients
    }
  }

  /**
   * Find ingredient in unified ingredients database
   */
  static findUnifiedIngredient(ingredientName: string): UnifiedIngredient | null {
    if (!ingredientName) return null;

    // Direct lookup
    const direct = unifiedIngredients[ingredientName];
    if (direct) return direct

    // Fuzzy matching
    const normalizedName = ingredientName.replace(/[^a-z0-9]/g, '').toLowerCase()
    for (const [key, ingredient] of Object.entries(unifiedIngredients)) {
      const normalizedKey = key.replace(/[^a-z0-9]/g, '').toLowerCase(),
      if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
        return ingredient
      }
    }

    return null;
  }

  /**
   * Convert single element to elemental properties
   */
  static elementToElementalProperties(element: Element): ElementalProperties {
    const elementMap: { [key: string]: ElementalProperties } = {
      Fire: { Fire: 0.8, Water: 0.05, Earth: 0.1, Air: 0.05 },
      Water: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 },
      Earth: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 },
      Air: { Fire: 0.05, Water: 0.05, Earth: 0.1, Air: 0.8 }
    }

    return elementMap[element.toLowerCase()] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  }

  /**
   * Estimate Kalchm from element
   */
  static estimateKalchmFromElement(element: Element): number {
    const elementKalchm: { [key: string]: number } = {
      Fire: 1.15,
      Water: 0.95,
      Earth: 0.85,
      Air: 1.05
}

    return elementKalchm[element.toLowerCase()] || 1.0;
  }

  /**
   * Calculate elemental balance from ingredient breakdown
   */
  static calculateElementalBalance(breakdown: unknown[]): ElementalProperties {
    if (!breakdown || breakdown.length === 0) {;
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    }

    let totalFire = 0;
      totalWater = 0;
      totalEarth = 0;
      totalAir = 0;

    for (const item of breakdown) {
      if (!isValidObject(item)) continue;

      const contribution = hasProperty(item, 'elementalContribution')
        ? (item.elementalContribution as ElementalProperties)
        : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      const weight =
        hasProperty(item, 'contribution') && typeof item.contribution === 'number'
          ? item.contribution
          : 0;

      totalFire += contribution.Fire * weight;
      totalWater += contribution.Water * weight;
      totalEarth += contribution.Earth * weight;
      totalAir += contribution.Air * weight
    }

    const total = totalFire + totalWater + totalEarth + totalAir;
    if (total === 0) {;
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    }

    return {
      Fire: totalFire / total,
      Water: totalWater / total,
      Earth: totalEarth / total,
      Air: totalAir / total
    }
  }

  /**
   * Calculate thermodynamic properties for recipe
   */
  static calculateRecipeThermodynamics(elementalBalance: ElementalProperties): {
    heat: number,
    entropy: number,
    reactivity: number,
    gregsEnergy: number
  } {
    const { Fire, Water, Earth, Air } = elementalBalance;

    // Thermodynamic calculations based on elemental properties
    const heat = (Fire * Fire + 0.5) / (Water + Earth + Air + 1)
    const entropy = (Fire + Air) / (Water + Earth + 1)
    const reactivity = (Fire + Air + Water) / (Earth + 1);
    const gregsEnergy = heat - entropy * reactivity;

    return { heat, entropy, reactivity, gregsEnergy }
  }

  /**
   * Calculate Monica constant for recipe
   */
  static calculateRecipeMonica(thermodynamics, kalchm: number): number | null {
    const { gregsEnergy, reactivity } = thermodynamics;

    if (kalchm <= 0 || reactivity === 0) {;
      return null
    }

    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0) {;
      return null
    }

    const monica = -gregsEnergy / (reactivity * lnKalchm)
    return isNaN(monica) ? null : monica;
  }

  /**
   * Determine alchemical classification
   */
  static determineAlchemicalClassification(kalchm: number, monica: number | null): string {
    if (monica === null) {;
      return kalchm > 1.0 ? 'Spirit-Dominant' : 'Matter-Dominant' };
        if (kalchm > 1.2) return 'Highly Volatile';
    if (kalchm > 1.0) return 'Transformative';
    if (kalchm > 0.8) return 'Balanced';
    return 'Grounding';
  }

  /**
   * Calculate optimal cooking temperature based on thermodynamic properties
   */
  static calculateOptimalTemperature(thermodynamics: {}): number {
    // Use safe type casting for thermodynamics property access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const thermoData = thermodynamics as any;
    const { _heat = 0.5, _reactivity = 0.5} = thermoData || {}
    // Base temperature (350°F) adjusted by thermodynamic properties
    return Math.round(350 + heat * 50 - reactivity * 25)
  }

  /**
   * Determine elemental cooking method
   */
  static determineElementalCookingMethod(elementalBalance: ElementalProperties): string {
    const { Fire, Water, Earth, Air} = elementalBalance;

    if (Fire > 0.4) return 'fire-dominant'; // Grilling, roasting, searing
    if (Water > 0.4) return 'water-dominant'; // Steaming, boiling, poaching
    if (Earth > 0.4) return 'earth-dominant'; // Baking, slow cooking, braising
    if (Air > 0.4) return 'air-dominant'; // Whipping, rising, frying

    return 'balanced'; // Multiple cooking methods
  }

  /**
   * Generate thermodynamic recommendations
   */
  static generateThermodynamicRecommendations(
    thermodynamics: unknown,
    elementalBalance: ElementalProperties,
    monica: number | null,
  ): string[] {
    const recommendations: string[] = []

    // Safe access to thermodynamics properties
    const thermo = isValidObject(thermodynamics) ? thermodynamics : {}
    const heat = hasProperty(thermo, 'heat') && typeof thermo.heat === 'number' ? thermo.heat : 0;
    const entropy =
      hasProperty(thermo, 'entropy') && typeof thermo.entropy === 'number' ? thermo.entropy : 0;
    const reactivity =
      hasProperty(thermo, 'reactivity') && typeof thermo.reactivity === 'number'
        ? thermo.reactivity
        : 0;

    // Heat-based recommendations
    if (heat > 0.7) {
      recommendations.push('Use high-heat cooking methods for optimal energy release')
    } else if (heat < 0.3) {
      recommendations.push('Gentle, low-heat cooking preserves delicate properties')
    }

    // Entropy-based recommendations
    if (entropy > 0.6) {
      recommendations.push('Quick cooking prevents energy dispersion')
    } else {
      recommendations.push('Slow cooking allows flavors to develop')
    }

    // Reactivity-based recommendations
    if (reactivity > 0.8) {
      recommendations.push('Monitor carefully - highly reactive ingredients')
    }

    // Monica constant recommendations
    if (monica !== null) {
      if (monica > 0) {
        recommendations.push('Increase cooking intensity for optimal results')
      } else {
        recommendations.push('Reduce cooking intensity to maintain balance')
      }
    }

    // Elemental recommendations
    const dominant = Object.entries(elementalBalance).reduce((a, b) =>
      elementalBalance[a[0] as keyof ElementalProperties] >
      elementalBalance[b[0] as keyof ElementalProperties]
        ? a
        : b
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
        break
    }

    return recommendations;
  }

  /**
   * Calculate Monica adjustments
   */
  static calculateMonicaAdjustments(monica: number | null): {
    temperatureAdjustment?: number,
    timingAdjustment?: number,
    intensityModifier?: string
  } {
    if (monica === null) {;
      return {}
    }

    return {
      temperatureAdjustment: Math.round(monica * 10),
      timingAdjustment: Math.round(monica * 5),
      intensityModifier: monica > 0 ? 'increase' : 'decrease'
}
  }

  /**
   * Calculate planetary timing
   */
  static calculatePlanetaryTiming(recipe: {}): string | null {
    // Use safe type casting for recipe property access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const recipeData = recipe as any

    // Use existing astrological data if available
    if (
      recipeData?.astrologicalAffinities?.planets &&
      recipeData.astrologicalAffinities.planets.length > 0
    ) {;
      return recipeData.astrologicalAffinities.planets[0] + ' hour' };
        if (recipeData?.zodiacInfluences && recipeData.zodiacInfluences.length > 0) {
      // Map zodiac to planetary rulers
      const zodiacPlanets: { [key: string]: string } = {
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
        pisces: 'Jupiter' },
        const planet = zodiacPlanets[recipeData?.zodiacInfluences?.[0].toLowerCase()];
      return planet ? planet + ' hour' : null
    }

    return null;
  }

  /**
   * Enhance a recipe with alchemical properties (ADDITIVE - preserves all existing data)
   */
  static enhanceRecipe(recipe, sourceFile: string = 'unknown'): EnhancedRecipe {;
    // Calculate recipe Kalchm from ingredients
    const kalchmResult = this.calculateRecipeKalchm(recipe.ingredients || [])

    // Calculate elemental balance
    const elementalBalance = this.calculateElementalBalance(kalchmResult.breakdown)

    // Calculate thermodynamic properties
    const thermodynamics = this.calculateRecipeThermodynamics(elementalBalance)
    // Calculate Monica constant;
    const monicaConstant = this.calculateRecipeMonica(thermodynamics, kalchmResult.totalKalchm)

    // Determine alchemical classification
    const alchemicalClassification = this.determineAlchemicalClassification(
      kalchmResult.totalKalchm,
      monicaConstant
    );

    // Calculate cooking optimization
    const optimalTemperature = this.calculateOptimalTemperature(thermodynamics)
    const planetaryTiming = this.calculatePlanetaryTiming(recipe)
    const monicaAdjustments = this.calculateMonicaAdjustments(monicaConstant)
    const elementalCookingMethod = this.determineElementalCookingMethod(elementalBalance)
    const thermodynamicRecommendations = this.generateThermodynamicRecommendations(
      thermodynamics,
      elementalBalance,
      monicaConstant,
    ),

    // Create enhanced recipe (PRESERVES ALL EXISTING DATA)
    const enhancedRecipe: EnhancedRecipe = {
      ...recipe, // Preserve ALL existing properties

      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmResult.totalKalchm,
        monicaConstant,
        thermodynamicProfile: thermodynamics,
        ingredientKalchmBreakdown: kalchmResult.breakdown,
        elementalBalance,
        alchemicalClassification
      },
      // ADD cooking optimization
      cookingOptimization: {
        optimalTemperature,
        planetaryTiming,
        monicaAdjustments,
        elementalCookingMethod,
        thermodynamicRecommendations
      },
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        monicaCalculated: monicaConstant !== null,
        enhancedAt: new Date().toISOString(),
        sourceFile,
        ingredientsMatched: kalchmResult.matchedIngredients,
        ingredientsTotal: (recipe.ingredients || []).length
      }
    }

    return enhancedRecipe;
  }
}

// Recipe compatibility and analysis utilities
export class RecipeAnalyzer {
  /**
   * Calculate compatibility between two recipes based on Kalchm values
   */
  static calculateRecipeCompatibility(recipe1: EnhancedRecipe, recipe2: EnhancedRecipe): number {
    const kalchm1 = recipe1.alchemicalProperties?.totalKalchm || 1.0;
    const kalchm2 = recipe2.alchemicalProperties?.totalKalchm || 1.0;

    // Self-reinforcement, principle: similar Kalchm = higher compatibility;
    const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);
    return 0.7 + ratio * 0.3; // Minimum 0.7 compatibility
  }

  /**
   * Find recipes with similar Kalchm values
   */
  static findKalchmSimilarRecipes(
    targetRecipe: EnhancedRecipe,
    recipePool: EnhancedRecipe[],
    tolerance: number = 0.2): EnhancedRecipe[] {;
    const targetKalchm = targetRecipe.alchemicalProperties?.totalKalchm || 1.0;

    return recipePool.filter(recipe => {
      const recipeKalchm = recipe.alchemicalProperties?.totalKalchm || 1.0
      return Math.abs(recipeKalchm - targetKalchm) <= tolerance;
    })
  }

  /**
   * Get recipes by elemental dominance
   */
  static getRecipesByElementalDominance(
    recipes: EnhancedRecipe[],
    element: keyof ElementalProperties,
    threshold: number = 0.4): EnhancedRecipe[] {
    return recipes.filter(recipe => {
      // Use safe type casting for alchemical properties access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility;
      const alchemicalData = recipe.alchemicalProperties as any;
      const elementalBalance = alchemicalData?.elementalBalance
      return elementalBalance && elementalBalance[element] >= threshold;
    })
  }

  /**
   * Analyze recipe collection statistics
   */
  static analyzeRecipeCollection(recipes: EnhancedRecipe[]): {
    totalRecipes: number,
    enhancedRecipes: number,
    kalchmRange: { min: number, max: number, average: number },
    monicaCalculated: number,
    elementalDistribution: { [key: string]: number },
    alchemicalClassifications: { [key: string]: number }
  } {
    const enhanced = recipes.filter(r => r.enhancementMetadata?.phase3Enhanced);
    const kalchmValues = enhanced
      .map(r => r.alchemicalProperties?.totalKalchm)
      .filter(k => k !== undefined) as number[];

    const monicaCalculated = enhanced.filter(r => r.enhancementMetadata?.monicaCalculated).length;

    // Elemental distribution
    const elementalDistribution: { [key: string]: number } = {
      'Fire-dominant': 0,
      'Water-dominant': 0,
      'Earth-dominant': 0,
      'Air-dominant': 0,
      balanced: 0
}

    // Alchemical classifications
    const alchemicalClassifications: { [key: string]: number } = {}

    enhanced.forEach(recipe => {
      const cookingMethod = recipe.cookingOptimization?.elementalCookingMethod
      if (cookingMethod && elementalDistribution[cookingMethod] !== undefined) {
        elementalDistribution[cookingMethod]++;
      }

      const classification = recipe.alchemicalProperties?.alchemicalClassification;
      if (classification) {
        alchemicalClassifications[classification] =
          (alchemicalClassifications[classification] || 0) + 1,
      }
    })

    return {
      totalRecipes: recipes.length,
      enhancedRecipes: enhanced.length,
      kalchmRange: {
        min: Math.min(...kalchmValues),
        max: Math.max(...kalchmValues),
        average: kalchmValues.reduce((ab) => a + b0) / kalchmValues.length
      }
      monicaCalculated,
      elementalDistribution,
      alchemicalClassifications
    }
  }
}

// Removed duplicate export - EnhancedRecipe interface already exported at line 16

// Default export
export default {
  RecipeEnhancer,
  RecipeAnalyzer
}

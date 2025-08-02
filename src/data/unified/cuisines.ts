import type { ElementalProperties, Element, AlchemicalProperties, ThermodynamicMetrics, CuisineType } from "@/types/alchemy";
import { FlavorProfileType } from "@/types/flavor";
import { Recipe, Ingredient, UnifiedIngredient } from '@/types/unified';

import { 
// ===== UNIFIED CUISINE SYSTEM - PHASE 3 ENHANCEMENT =====
// Adds Kalchm values to cuisines based on ingredient compositions and cooking methods
// Integrates with unified ingredients and recipe systems

  calculateKalchm, 
  deriveAlchemicalFromElemental
} from './alchemicalCalculations';
// Import needed from ./ingredients.js.ts
import { RecipeEnhancer } from './recipes';

// Enhanced cuisine interface with Kalchm integration
export interface EnhancedCuisine {
  // ===== EXISTING CUISINE PROPERTIES (PRESERVED) =====
  id: string;
  name: string;
  description: string;
  dishes?: any; // Preserve existing dish structure
  elementalProperties?: ElementalProperties;
  elementalState?: ElementalProperties;
  
  // ===== NEW ALCHEMICAL ENHANCEMENTS (ADDITIVE) =====
  alchemicalProperties?: {
    totalKalchm: number;                    // Cuisine Kalchm value
    averageRecipeKalchm: number;            // Average Kalchm of recipes
    ingredientKalchmProfile: {              // Common ingredient Kalchm analysis
      mostCommon: Array<{
        ingredient: string;
        kalchm: number;
        frequency: number;
      }>;
      kalchmRange: { min: number; max: number; average: number };
    };
    cookingMethodInfluence: {               // Cooking method impact on Kalchm
      primaryMethods: string[];
      methodKalchmModifiers: { [key: string]: number };
    };
    alchemicalClassification: string;       // Cuisine classification// Aggregate elemental composition
  };
  
  // ===== NEW CUISINE OPTIMIZATION (ADDITIVE) =====
  cuisineOptimization?: {
    optimalSeasons: string[];               // Best seasons for this cuisine
    planetaryAffinities: string[];          // Planetary alignments
    elementalCookingMethods: string[];      // Recommended cooking methods
    kalchmCompatibleCuisines: Array<{       // Compatible cuisines by Kalchm
      cuisine: string;
      compatibility: number;
      kalchmSimilarity: number;
    }>;
  };
  
  // ===== NEW ENHANCEMENT METADATA (ADDITIVE) =====
  enhancementMetadata?: {
    phase3Enhanced: boolean;
    kalchmCalculated: boolean;
    recipesAnalyzed: number;
    ingredientsAnalyzed: number;
    enhancedAt: string;
    sourceFile: string;
  };
}

// Cuisine enhancement utilities
export class CuisineEnhancer {
  
  /**
   * Calculate cuisine Kalchm from its recipes and common ingredients
   */
  static calculateCuisineKalchm(cuisine: {}): {
    totalKalchm: number;
    averageRecipeKalchm: number;
    ingredientKalchmProfile: Ingredient | UnifiedIngredient;
    cookingMethodInfluence: unknown;
    recipesAnalyzed: number;
    ingredientsAnalyzed: number;
  } {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map<string, number>();
    const ingredientKalchms = new Map<string, number>();
    const cookingMethods = new Map<string, number>();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = RecipeEnhancer.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = RecipeEnhancer.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm || 1.0);
        } else if (((ingredient as unknown) as Record<string, unknown>).element) {
          ingredientKalchms.set(ingredientName, RecipeEnhancer.estimateKalchmFromElement(((ingredient as unknown) as Record<string, unknown>).element  as Element));
        }
      }
      
      // Track cooking methods
      const recipeData = (recipe as unknown) as Record<string, unknown>;
      if (recipeData.cookingMethods && Array.isArray(recipeData.cookingMethods)) {
        for (const method of recipeData.cookingMethods as string[]) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  /**
   * Extract recipes from cuisine structure
   */
  static extractRecipesFromCuisine(cuisine: {}): Recipe[] {
    const recipes: Recipe[] = [];
    
    // Use safe type casting for cuisine property access
    const cuisineData = cuisine as Record<string, unknown>;
    if (!cuisineData.dishes || typeof cuisineData.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisineData.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData as { [key: string]: any })) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish?.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisineData.name || 'Unknown'
            });
          }
        }
      }
    }
    
    return recipes;
  }
  
  /**
   * Analyze ingredient Kalchm profile for cuisine
   */
  static analyzeIngredientKalchmProfile(
    ingredientFrequency: Map<string, number>,
    ingredientKalchms: Map<string, number>
  ): any {
    const mostCommon: Array<{ ingredient: string; kalchm: number; frequency: number }> = [];
    const kalchmValues: number[] = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = (kalchmValues || []).length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / (kalchmValues || []).length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  /**
   * Analyze cooking method influence on Kalchm
   */
  static analyzeCookingMethodInfluence(cookingMethods: Map<string, number>): any {
    const primaryMethods: string[] = [];
    const methodKalchmModifiers: { [key: string]: number } = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap: { [key: string]: number } = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // Water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // Earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  /**
   * Calculate elemental balance for cuisine
   */
  static calculateCuisineElementalBalance(cuisine: {}): ElementalProperties {
    // Use safe type casting for cuisine property access
    const cuisineData = cuisine as Record<string, unknown>;
    
    // Use existing elemental properties if available
    if (cuisineData.elementalState) {
      return cuisineData.elementalState as ElementalProperties;
    }
    
    if (cuisineData.elementalProperties) {
      return cuisineData.elementalProperties as ElementalProperties;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalWater = 0, totalEarth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      const recipeData = (recipe as unknown) as Record<string, unknown>;
      if (recipeData.elementalState) {
        const elementalData = recipeData.elementalState as ElementalProperties;
        totalFire += elementalData.Fire || 0;
        totalWater += elementalData.Water || 0;
        totalEarth += elementalData.Earth || 0;
        totalAir += elementalData.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return { 
      Fire: totalFire / validRecipes, 
      Water: totalWater / validRecipes, 
      Earth: totalEarth / validRecipes, 
      Air: totalAir / validRecipes
    };
  }
  
  /**
   * Determine alchemical classification for cuisine
   */
  static determineCuisineAlchemicalClassification(kalchm: number, cookingMethods: string[]): string {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = (cookingMethods || []).filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = (cookingMethods || []).filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (Water-Focused)';
    }
    
    return baseClassification;
  }
  
  /**
   * Calculate cuisine optimization data
   */
  static calculateCuisineOptimization(
    cuisine: CuisineType,
    kalchm: number,
    elementalBalance: ElementalProperties
  ): any {
    // Analyze optimal seasons
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const seasonFrequency = new Map<string, number>();
    const planetaryAffinities = new Set<string>();
    
    for (const recipe of recipes) {
      // Count seasons
      const recipeSeasonData = (recipe as unknown) as Record<string, unknown>;
      if (recipeSeasonData.currentSeason && Array.isArray(recipeSeasonData.currentSeason)) {
        for (const season of recipeSeasonData.currentSeason as string[]) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      const astroData = (recipe as unknown) as Record<string, unknown>;
      if ((astroData.astrologicalAffinities as Record<string, unknown>).planets) {
        for (const planet of ((astroData.astrologicalAffinities as Record<string, unknown>).planets as string[])) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, Water, Earth, Air } = elementalBalance;
    const elementalCookingMethods: string[] = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (Water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (Earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  /**
   * Enhance a cuisine with alchemical properties (ADDITIVE - preserves all existing data)
   */
  static enhanceCuisine(cuisine: CuisineType, sourceFile: string = 'unknown'): EnhancedCuisine {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      (kalchmAnalysis.cookingMethodInfluence as any)?.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...(cuisine as unknown as Record<string, unknown>), // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile as any,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence as any,
        alchemicalClassification
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    } as EnhancedCuisine;
    
    return enhancedCuisine;
  }
}

// Cuisine compatibility and analysis utilities
export class CuisineAnalyzer {
  
  /**
   * Calculate compatibility between two cuisines based on Kalchm values
   */
  static calculateCuisineCompatibility(cuisine1: EnhancedCuisine, cuisine2: EnhancedCuisine): number {
    const kalchm1 = cuisine1.alchemicalProperties?.totalKalchm || 1.0;
    const kalchm2 = cuisine2.alchemicalProperties?.totalKalchm || 1.0;
    
    // Self-reinforcement principle: similar Kalchm = higher compatibility
    const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);
    return 0.7 + (ratio * 0.3); // Minimum 0.7 compatibility
  }
  
  /**
   * Find cuisines with similar Kalchm values
   */
  static findKalchmSimilarCuisines(
    targetCuisine: EnhancedCuisine,
    cuisinePool: EnhancedCuisine[],
    tolerance: number = 0.2
  ): EnhancedCuisine[] {
    const targetKalchm = targetCuisine.alchemicalProperties?.totalKalchm || 1.0;
    
    return cuisinePool.filter(cuisine => {
      if (cuisine.id === targetCuisine.id) return false; // Exclude self
      const cuisineKalchm = cuisine.alchemicalProperties?.totalKalchm || 1.0;
      return Math.abs(cuisineKalchm - targetKalchm) <= tolerance;
    });
  }
  
  /**
   * Get cuisines by elemental dominance
   */
  static getCuisinesByElementalDominance(
    cuisines: EnhancedCuisine[],
    element: keyof ElementalProperties,
    threshold: number = 0.4
  ): EnhancedCuisine[] {
    return cuisines.filter(cuisine => {
      // Use safe type casting for alchemicalProperties access
      const alchemicalData = cuisine.alchemicalProperties as Record<string, unknown>;
      const elementalBalance = alchemicalData.elementalBalance;
      return elementalBalance?.[element] >= threshold;
    });
  }
  
  /**
   * Analyze cuisine collection statistics
   */
  static analyzeCuisineCollection(cuisines: EnhancedCuisine[]): {
    totalCuisines: number;
    enhancedCuisines: number;
    kalchmRange: { min: number; max: number; average: number };
    totalRecipesAnalyzed: number;
    totalIngredientsAnalyzed: number;
    elementalDistribution: { [key: string]: number };
    alchemicalClassifications: { [key: string]: number };
    topIngredients: Array<{ ingredient: string; cuisineCount: number; averageKalchm: number }>;
  } {
    const enhanced = (cuisines || []).filter(c => c.enhancementMetadata?.phase3Enhanced);
    const kalchmValues = enhanced
      .map(c => c.alchemicalProperties?.totalKalchm)
      .filter(k => k !== undefined) as number[];
    
    const totalRecipesAnalyzed = enhanced.reduce((sum, c) => 
      sum + (c.enhancementMetadata?.recipesAnalyzed || 0), 0);
    
    const totalIngredientsAnalyzed = enhanced.reduce((sum, c) => 
      sum + (c.enhancementMetadata?.ingredientsAnalyzed || 0), 0);
    
    // Elemental distribution
    const elementalDistribution: { [key: string]: number } = {
      'Fire-dominant': 0,
      'Water-dominant': 0,
      'Earth-dominant': 0,
      'Air-dominant': 0,
      'balanced': 0
    };
    
    // Alchemical classifications
    const alchemicalClassifications: { [key: string]: number } = {};
    
    // Ingredient analysis across cuisines
    const ingredientMap = new Map<string, { count: number; totalKalchm: number }>();
    
    enhanced.forEach(cuisine => {
      // Analyze elemental dominance with safe type casting
      const alchemicalData = cuisine.alchemicalProperties as Record<string, unknown>;
      const elementalBalance = alchemicalData.elementalBalance;
      if (elementalBalance) {
        const dominant = Object.entries(elementalBalance)
          .reduce((a, b) => elementalBalance[a[0] as keyof ElementalProperties] > elementalBalance[b[0] as keyof ElementalProperties] ? a : b)[0];
        
        const dominantKey = dominant.toLowerCase() + '-dominant';
        if (elementalDistribution[dominantKey] !== undefined) {
          elementalDistribution[dominantKey]++;
        } else {
          elementalDistribution['balanced']++;
        }
      }
      
      // Count classifications
      const classification = cuisine.alchemicalProperties?.alchemicalClassification;
      if (classification) {
        alchemicalClassifications[classification] = (alchemicalClassifications[classification] || 0) + 1;
      }
      
      // Aggregate ingredient data
      const ingredientProfile = cuisine.alchemicalProperties?.ingredientKalchmProfile;
      if (ingredientProfile?.mostCommon) {
        for (const item of ingredientProfile.mostCommon) {
          const existing = ingredientMap.get(item.ingredient);
          if (existing) {
            existing.count++;
            existing.totalKalchm += item.kalchm;
          } else {
            ingredientMap.set(item.ingredient, { count: 1, totalKalchm: item.kalchm });
          }
        }
      }
    });
    
    // Calculate top ingredients across all cuisines
    const topIngredients = Array.from(ingredientMap.entries())
      .map(([ingredient, data]) => ({
        ingredient,
        cuisineCount: data.count,
        averageKalchm: data.totalKalchm / data.count
      }))
      .sort((a, b) => b.cuisineCount - a.cuisineCount)
      .slice(0, 20);
    
    return {
      totalCuisines: cuisines.length,
      enhancedCuisines: enhanced.length,
      kalchmRange: kalchmValues.length > 0 ? {
        min: Math.min(...kalchmValues),
        max: Math.max(...kalchmValues),
        average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
      } : { min: 1.0, max: 1.0, average: 1.0 },
      totalRecipesAnalyzed,
      totalIngredientsAnalyzed,
      elementalDistribution,
      alchemicalClassifications,
      topIngredients
    };
  }
  
  /**
   * Update cuisine compatibility matrices
   */
  static updateCuisineCompatibilities(cuisines: EnhancedCuisine[]): any[] {
    return cuisines.map(cuisine => {
      if (!cuisine.alchemicalProperties) return cuisine;
      
      // Find compatible cuisines
      const compatibleCuisines = this.findKalchmSimilarCuisines(cuisine, cuisines, 0.15)
        .map(compatibleCuisine => ({
          cuisine: compatibleCuisine.name,
          compatibility: this.calculateCuisineCompatibility(cuisine, compatibleCuisine),
          kalchmSimilarity: 1 - Math.abs(
            (cuisine.alchemicalProperties?.totalKalchm || 1.0) - 
            (compatibleCuisine.alchemicalProperties?.totalKalchm || 1.0)
          )
        }))
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 5);
      
      // Update cuisine optimization with compatibility data
      return {
        ...cuisine,
        cuisineOptimization: {
          ...cuisine.cuisineOptimization,
          kalchmCompatibleCuisines: compatibleCuisines
        }
      };
    });
  }
}

// Removed duplicate export - EnhancedCuisine interface already exported at line 15

// Default export
export default {
  CuisineEnhancer,
  CuisineAnalyzer
}; 
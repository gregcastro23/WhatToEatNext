// TODO: Fix import - add what to import from "./unifiedTypes.ts"
// TODO: Fix import - add what to import from "./ingredients.ts"
import { 
// ===== ENHANCED UNIFIED INGREDIENTS SYSTEM =====
// Phase 5 of WhatToEatNext Data Consolidation
// Integrates with unified flavor profile system and adds comprehensive functionality

  createElementalProperties, 
  isElementalProperties, 
  calculateElementalCompatibility 
} from '../../utils/elemental/elementalUtils';
import type { ElementalProperties, 
  Season, 
  PlanetName, 
  ZodiacSign,
  CookingMethod,
  AlchemicalProperties,
  ThermodynamicProperties,
  FlavorProfile,
  LunarPhase,
  Element
} from "@/types/alchemy";
// TODO: Fix import - add what to import from "./flavorProfiles.ts"
// TODO: Fix import - add what to import from "./seasonal.ts"
// TODO: Fix import - add what to import from "./cuisineIntegrations.ts"
// TODO: Fix import - add what to import from "./nutritional.ts"

import type { UnifiedIngredient } from "./unifiedTypes";
import type { UnifiedFlavorProfile } from "./flavorProfiles";

// Import unified systems
import { unifiedFlavorProfileSystem } from "./flavorProfiles";
import { unifiedSeasonalSystem } from "./seasonal";
import { unifiedCuisineIntegrationSystem } from "./cuisineIntegrations";
import { unifiedNutritionalSystem } from "./nutritional";

// Import unified ingredients
import { unifiedIngredients } from "./ingredients";

// Enhanced ingredient interface with flavor profile integration
export interface EnhancedIngredient {
  // Core properties from UnifiedIngredient
  name: string;
  category: string;
  subcategory?: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  kalchm?: number;
  monica?: number;
  
  // Unified Flavor Profile Integration (from Phase 4)
  unifiedFlavorProfile?: UnifiedFlavorProfile;
  
  // Enhanced Culinary Properties
  culinaryProperties: {
    cookingMethods: string[];
    pAirings: string[];
    substitutions: string[];
    storage: {
      temperature: string;
      humidity: string;
      duration: string;
      method: string;
    };
    seasonality: {
      peak: string[];
      available: string[];
      optimal: string[];
    };
    preparationMethods: string[];
  };
  
  // Enhanced Astrological Properties
  astrologicalProfile: {
    planetaryRuler: string;
    zodiacRuler: string;
    element: Element;
    energyType: string;
    seasonalPeak: {
      northern: number[];
      southern: number[];
    };
    lunarAffinity: string[];
    planetaryHours: string[];
  };
  
  // Enhanced Nutritional Profile
  nutritionalProfile: {
    serving_size: string;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    vitamins: { [key: string]: number };
    minerals: { [key: string]: number };
    antioxidants?: { [key: string]: number };
    benefits: string[];
    source: string;
  };
  
  // Enhanced Metadata
  metadata: {
    sourceFile: string;
    enhancedAt: string;
    kalchmCalculated: boolean;
    flavorProfileLinked: boolean;
    dataQuality: 'high' | 'medium' | 'low';
    lastUpdated: string;
  };
  
  // Allow additional properties from UnifiedIngredient
  [key: string]: any;
}

// Ingredient search criteria
export interface IngredientSearchCriteria {
  category?: string;
  subcategory?: string;
  elementalFocus?: 'Fire' | 'Water' | 'Earth' | 'Air';
  kalchmRange?: { min: number; max: number };
  seasonalAlignment?: string;
  planetaryRuler?: string;
  cookingMethods?: string[];
  nutritionalFocus?: string[];
  flavorProfile?: string[];
  origin?: string[];
  qualities?: string[];
}

// Ingredient recommendations
export interface IngredientRecommendations {
  primary: EnhancedIngredient[];
  complementary: EnhancedIngredient[];
  seasonal: EnhancedIngredient[];
  substitutions: EnhancedIngredient[];
  kalchmBalanced: EnhancedIngredient[];
  flavorCompatible: EnhancedIngredient[];
}

// System conditions for dynamic recommendations
export interface IngredientSystemConditions {
  season: string;
  planetaryHour: string;
  temperature: number;
  lunarPhase: string;
  cookingMethod?: string;
  cuisineStyle?: string;
  nutritionalGoals?: string[];
  currentSeason?: string;
}

/**
 * Type guard to check if an object is a valid EnhancedIngredient
 */
export function isEnhancedIngredient(obj: unknown): obj is EnhancedIngredient {
  if (!obj || typeof obj !== 'object') return false;
  
  const ingredient = obj as Partial<EnhancedIngredient>;
  return (
    typeof ingredient.name === 'string' &&
    typeof ingredient.category === 'string' &&
    ingredient.elementalProperties !== undefined &&
    typeof ingredient.elementalProperties === 'object' &&
    ingredient.culinaryProperties !== undefined &&
    typeof ingredient.culinaryProperties === 'object' &&
    ingredient.astrologicalProfile !== undefined &&
    typeof ingredient.astrologicalProfile === 'object' &&
    ingredient.nutritionalProfile !== undefined &&
    typeof ingredient.nutritionalProfile === 'object' &&
    ingredient.metadata !== undefined &&
    typeof ingredient.metadata === 'object'
  );
}

export class EnhancedIngredientsSystem {
  private ingredients: { [key: string]: EnhancedIngredient };
  private flavorProfileSystem: typeof unifiedFlavorProfileSystem;
  private seasonalSystem: typeof unifiedSeasonalSystem;
  private cuisineSystem: typeof unifiedCuisineIntegrationSystem;
  private nutritionalSystem: typeof unifiedNutritionalSystem;
  
  // Indexed lookups for performance
  private categoryIndex: Map<string, string[]> = new Map();
  private elementalIndex: Map<string, string[]> = new Map();
  private kalchmIndex: Map<string, string[]> = new Map();
  private seasonalIndex: Map<string, string[]> = new Map();
  private planetaryIndex: Map<string, string[]> = new Map();

  constructor() {
    this.ingredients = this.enhanceExistingIngredients();
    this.flavorProfileSystem = unifiedFlavorProfileSystem;
    this.seasonalSystem = unifiedSeasonalSystem;
    this.cuisineSystem = unifiedCuisineIntegrationSystem;
    this.nutritionalSystem = unifiedNutritionalSystem;
    
    // Build indexes for fast lookups
    this.buildIndexes();
  }

  // ===== CORE INGREDIENT MANAGEMENT =====

  /**
   * Get an ingredient by name
   */
  getIngredient(name: string): EnhancedIngredient | undefined {
    return this?.ingredients?.[name];
  }

  /**
   * Get all ingredients in a category
   */
  getIngredientsByCategory(category: string): EnhancedIngredient[] {
    const ingredientNames = this.categoryIndex.get(category) || [];
    return ingredientNames
      .map(name => this?.ingredients?.[name])
      .filter((ingredient): ingredient is EnhancedIngredient => !!ingredient);
  }

  /**
   * Get all enhanced ingredients
   */
  getAllIngredients(): EnhancedIngredient[] {
    return Object.values(this.ingredients);
  }

  /**
   * Get ingredient count by data quality
   */
  getIngredientStats(): { total: number; high: number; medium: number; low: number } {
    const ingredients = Object.values(this.ingredients);
    return {
      total: (ingredients || []).length,
      high: (ingredients || []).filter(i => i.metadata.dataQuality === 'high')?.length,
      medium: (ingredients || []).filter(i => i.metadata.dataQuality === 'medium')?.length,
      low: (ingredients || []).filter(i => i.metadata.dataQuality === 'low')?.length
    };
  }

  /**
   * Search ingredients by criteria
   */
  searchIngredients(criteria: IngredientSearchCriteria): EnhancedIngredient[] {
    let results = Object.values(this.ingredients);

    // Filter by category
    if (criteria.category) {
      results = (results || []).filter(ingredient => ingredient.category === criteria.category);
    }

    // Filter by subcategory
    if (criteria.subcategory) {
      results = (results || []).filter(ingredient => 
        ingredient.subcategory === criteria.subcategory
      );
    }

    // Filter by elemental focus
    if (criteria.elementalFocus) {
      results = (results || []).filter(ingredient => {
        const elementValue = ingredient.elementalProperties[criteria.elementalFocus!] || 0;
        return elementValue > 0.3; // Must have significant presence
      });
    }

    // Filter by Kalchm range
    if (criteria.kalchmRange) {
      results = (results || []).filter(ingredient => 
        (ingredient.kalchm || 0) >= criteria.kalchmRange!.min && 
        (ingredient.kalchm || 0) <= criteria.kalchmRange!.max
      );
    }

    // Filter by seasonal alignment
    if (criteria.seasonalAlignment) {
      results = (results || []).filter(ingredient => 
        ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.peak) ? ingredient.culinaryProperties.seasonality.peak?.includes(season) : ingredient.culinaryProperties.seasonality.peak === season ||
        ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.optimal) ? ingredient.culinaryProperties.seasonality.optimal?.includes(season) : ingredient.culinaryProperties.seasonality.optimal === season
      );
    }

    // Filter by planetary ruler
    if (criteria.planetaryRuler) {
      results = (results || []).filter(ingredient => 
        ingredient.astrologicalProfile?.planetaryRuler === criteria.planetaryRuler
      );
    }

    // Filter by cooking methods
    if (criteria.cookingMethods && (criteria.cookingMethods  || []).length > 0) {
      results = (results || []).filter(ingredient => 
        (criteria.cookingMethods!  || []).some(method => 
          ingredient.culinaryProperties?.cookingMethods?.includes(method)
        )
      );
    }

    // Filter by qualities
    if (criteria.qualities && (criteria.qualities  || []).length > 0) {
      results = (results || []).filter(ingredient => 
        (criteria.qualities!  || []).some(quality => 
          (Array.isArray(ingredient.qualities) ? ingredient.qualities?.includes(quality) : ingredient.qualities === quality)
        )
      );
    }

    return results;
  }

  // ===== FLAVOR PROFILE INTEGRATION =====

  /**
   * Get ingredients compatible with a flavor profile
   */
  getIngredientsForFlavorProfile(flavorProfileId: string): EnhancedIngredient[] {
    const flavorProfile = this.flavorProfileSystem.getFlavorProfile(flavorProfileId);
    if (!flavorProfile) return [];
    
    // Get ingredients with connected flavor profiles
    return Object.values(this.ingredients)
      .filter(ingredient => {
        if (!ingredient.unifiedFlavorProfile) return false;
        
        // Calculate compatibility between the target flavor profile and this ingredient's profile
        const compatibility = this.flavorProfileSystem.calculateFlavorCompatibility(
          flavorProfile, 
          ingredient.unifiedFlavorProfile
        );
        
        return compatibility.compatibility > 0.7;
      });
  }

  /**
   * Find ingredients with similar flavor profiles
   */
  findFlavorCompatibleIngredients(targetIngredient: EnhancedIngredient, tolerance = 0.7): EnhancedIngredient[] {
    // Ensure ingredient has a flavor profile
    if (!targetIngredient.unifiedFlavorProfile) {
      // Try to find or create a flavor profile
      const ingredientName = targetIngredient.name;
      const flavorProfile = this.flavorProfileSystem.getFlavorProfile(ingredientName, 'ingredient');
      
      if (!flavorProfile) {
        // No flavor profile available, fall back to elemental comparison
        return this.findElementallyCompatibleIngredients(targetIngredient, tolerance);
      }
    }
    
    // Get the target flavor profile
    const targetProfile = targetIngredient.unifiedFlavorProfile;
    
    // Find compatible ingredients
    return Object.values(this.ingredients)
      .filter(ingredient => {
        // Skip the same ingredient
        if (ingredient.name === targetIngredient.name) return false;
        
        // Check if ingredient has a flavor profile
        if (!ingredient.unifiedFlavorProfile) return false;
        
        // Calculate compatibility
        const compatibility = this.flavorProfileSystem.calculateFlavorCompatibility(
          targetProfile!, 
          ingredient.unifiedFlavorProfile
        );
        
        return compatibility.compatibility >= tolerance;
      })
      .sort((a, b) => {
        const compatA = this.flavorProfileSystem.calculateFlavorCompatibility(
          targetProfile!, 
          a.unifiedFlavorProfile!
        )?.compatibility;
        
        const compatB = this.flavorProfileSystem.calculateFlavorCompatibility(
          targetProfile!, 
          b.unifiedFlavorProfile!
        )?.compatibility;
        
        return compatB - compatA;
      });
  }

  /**
   * Find elementally compatible ingredients
   */
  findElementallyCompatibleIngredients(targetIngredient: EnhancedIngredient, tolerance = 0.7): EnhancedIngredient[] {
    return Object.values(this.ingredients)
      .filter(ingredient => {
        // Skip the same ingredient
        if (ingredient.name === targetIngredient.name) return false;
        
        // Calculate elemental compatibility
        const compatibility = calculateElementalCompatibility(
          targetIngredient.elementalProperties,
          ingredient.elementalProperties
        );
        
        return compatibility >= tolerance;
      })
      .sort((a, b) => {
        const compatA = calculateElementalCompatibility(
          targetIngredient.elementalProperties,
          a.elementalProperties
        );
        
        const compatB = calculateElementalCompatibility(
          targetIngredient.elementalProperties,
          b.elementalProperties
        );
        
        return compatB - compatA;
      });
  }

  // ===== KALCHM-BASED OPERATIONS =====

  /**
   * Find ingredients with similar Kalchm values
   */
  findKalchmCompatibleIngredients(targetKalchm: number, tolerance = 0.2): EnhancedIngredient[] {
    const min = targetKalchm * (1 - tolerance);
    const max = targetKalchm * (1 + tolerance);
    
    return this.getIngredientsByKalchmRange(min, max);
  }

  /**
   * Get ingredients within a specific Kalchm range
   */
  getIngredientsByKalchmRange(min: number, max: number): EnhancedIngredient[] {
    return Object.values(this.ingredients)
      .filter(ingredient => {
        const kalchm = ingredient.kalchm || 0;
        return kalchm >= min && kalchm <= max;
      });
  }

  /**
   * Calculate the Kalchm harmony score for a set of ingredients
   */
  calculateKalchmHarmony(ingredients: EnhancedIngredient[]): number {
    if (!ingredients || (ingredients || []).length === 0) return 0;
    
    // Get kalchm values for each ingredient
    const kalchmValues = (ingredients || []).map(ingredient => ingredient.kalchm || 0);
    
    // Calculate geometric mean (Kalchm Harmony) using nth root of product
    const product = kalchmValues.reduce((p, k) => p * Math.max(k, 0.001), 1);
    const geometricMean = Math.pow(product, 1 / (kalchmValues || []).length);
    
    // Calculate standard deviation to assess balance
    const mean = kalchmValues.reduce((sum, k) => sum + k, 0) / (kalchmValues || []).length;
    const sumSquaredDiff = kalchmValues.reduce((sum, k) => sum + Math.pow(k - mean, 2), 0);
    const stdDev = Math.sqrt(sumSquaredDiff / (kalchmValues || []).length);
    
    // Normalize the standard deviation to a 0-1 scale (lower is better)
    const normalizedStdDev = 1 / (1 + stdDev);
    
    // Combine geometric mean and normalized standard deviation
    return (geometricMean * 0.7) + (normalizedStdDev * 0.3);
  }

  // ===== SEASONAL INTEGRATION =====

  /**
   * Get all ingredients suitable for a specific season
   */
  getSeasonalIngredients(season: string): EnhancedIngredient[] {
    // Use seasonal index if available
    const ingredientNames = this.seasonalIndex.get(season) || [];
    if ((ingredientNames || []).length > 0) {
      return ingredientNames
        .map(name => this?.ingredients?.[name])
        .filter((ingredient): ingredient is EnhancedIngredient => !!ingredient);
    }
    
    // Fall back to direct filtering
    return Object.values(this.ingredients)
      .filter(ingredient => 
        ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.peak) ? ingredient.culinaryProperties.seasonality.peak?.includes(season) : ingredient.culinaryProperties.seasonality.peak === season ||
        ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.optimal) ? ingredient.culinaryProperties.seasonality.optimal?.includes(season) : ingredient.culinaryProperties.seasonality.optimal === season ||
        ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.available) ? ingredient.culinaryProperties.seasonality.available?.includes(season) : ingredient.culinaryProperties.seasonality.available === season
      );
  }
  
  /**
   * Adapt ingredients for a specific season
   */
  adaptIngredientsForSeason(ingredients: EnhancedIngredient[], season: string): EnhancedIngredient[] {
    // Filter to keep only seasonally appropriate ingredients
    const seasonal = (ingredients || []).filter(ingredient =>
      ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.peak) ? ingredient.culinaryProperties.seasonality.peak?.includes(season) : ingredient.culinaryProperties.seasonality.peak === season ||
      ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.optimal) ? ingredient.culinaryProperties.seasonality.optimal?.includes(season) : ingredient.culinaryProperties.seasonality.optimal === season ||
      ingredient.culinaryProperties?.seasonality && Array.isArray(ingredient.culinaryProperties.seasonality.available) ? ingredient.culinaryProperties.seasonality.available?.includes(season) : ingredient.culinaryProperties.seasonality.available === season
    );
    
    // If we have enough seasonal ingredients, return them
    const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];
    if ((seasonal || []).length >= (Math.ceil(ingredientsArray.length * 0.7))) {
      return seasonal;
    }
    
    // Otherwise, blend seasonal with some out-of-season options
    return [...seasonal, ...this.findSubstitutions(ingredients)]
      .slice(0, (ingredients || []).length);
  }
  
  /**
   * Get ingredients that bridge seasonal transitions
   */
  getSeasonalTransitions(fromSeason: string, toSeason: string): EnhancedIngredient[] {
    // Get ingredients from both seasons
    const fromSeasonIngredients = this.getSeasonalIngredients(fromSeason);
    const toSeasonIngredients = this.getSeasonalIngredients(toSeason);
    
    // Find ingredients available in both seasons
    const transitionIngredients = (fromSeasonIngredients || []).filter(ingredient => 
      (toSeasonIngredients || []).some(i => i.name === ingredient.name)
    );
    
    // If we have enough transition ingredients, return them
    if ((transitionIngredients || []).length >= 10) {
      return transitionIngredients;
    }
    
    // Otherwise, prioritize 'to season' ingredients with highest quality
    return [...transitionIngredients, ...toSeasonIngredients]
      .sort((a, b) => {
        const qualityA = a.metadata.dataQuality === 'high' ? 3 : 
                        (a.metadata.dataQuality === 'medium' ? 2 : 1);
        const qualityB = b.metadata.dataQuality === 'high' ? 3 : 
                        (b.metadata.dataQuality === 'medium' ? 2 : 1);
        return qualityB - qualityA;
      })
      .slice(0, 20);
  }
  
  // ===== RECOMMENDATION ENGINE =====
  
  /**
   * Generate comprehensive ingredient recommendations based on criteria and conditions
   */
  generateIngredientRecommendations(
    criteria: IngredientSearchCriteria,
    conditions?: IngredientSystemConditions
  ): IngredientRecommendations {
    // Get base ingredients matching the criteria
    const baseIngredients = this.searchIngredients(criteria);
    
    // Apply seasonal adaptations if conditions specified
    const seasonallyAdjusted = conditions?.season
      ? this.adaptIngredientsForSeason(baseIngredients, conditions.currentSeason)
      : baseIngredients;
    
    // Find complementary ingredients
    const complementary = this.findComplementaryIngredients(seasonallyAdjusted);
    
    // Find seasonal ingredients that might not be in the base set
    const seasonal = conditions?.season
      ? this.getSeasonalIngredients(conditions.currentSeason)
        .filter(i => {
          const baseIngredientsArray = Array.isArray(baseIngredients) ? baseIngredients : [];
          return !baseIngredientsArray.some(bi => bi.name === i.name);
        })
        .slice(0, 10)
      : [];
    
    // Find substitutions
    const substitutions = this.findSubstitutions(seasonallyAdjusted);
    
    // Find Kalchm-balanced ingredients
    const kalchmValues = (seasonallyAdjusted || []).map(i => i.kalchm || 0);
    const avgKalchm = kalchmValues.reduce((sum, v) => sum + v, 0) / 
                      ((kalchmValues || []).length || 1);
    const kalchmBalanced = this.findKalchmCompatibleIngredients(avgKalchm, 0.2)
      .filter(i => {
        const baseIngredientsArray = Array.isArray(baseIngredients) ? baseIngredients : [];
        return !baseIngredientsArray.some(bi => bi.name === i.name);
      })
      .slice(0, 10);
    
    // Find flavor-compatible ingredients if we have at least one base ingredient
    const flavorCompatible = (seasonallyAdjusted || []).length > 0
      ? this.findFlavorCompatibleIngredients(seasonallyAdjusted[0])
        .filter(i => {
          const baseIngredientsArray = Array.isArray(baseIngredients) ? baseIngredients : [];
          return !baseIngredientsArray.some(bi => bi.name === i.name);
        })
        .slice(0, 10)
      : [];
    
    return {
      primary: baseIngredients,
      complementary,
      seasonal,
      substitutions,
      kalchmBalanced,
      flavorCompatible
    };
  }
  
  /**
   * Generate suggested pAirings for an ingredient
   */
  generateIngredientPAirings(targetIngredient: EnhancedIngredient): {
    traditional: EnhancedIngredient[];
    innovative: EnhancedIngredient[];
    seasonal: EnhancedIngredient[];
    kalchmHarmonious: EnhancedIngredient[];
  } {
    return {
      traditional: this.findTraditionalPAirings(targetIngredient),
      innovative: this.findInnovativePAirings(targetIngredient),
      seasonal: this.findSeasonalPAirings(targetIngredient),
      kalchmHarmonious: this.findKalchmCompatibleIngredients(targetIngredient.kalchm || 1.0, 0.15)
        .filter(i => i.name !== targetIngredient.name)
        .slice(0, 5)
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Enhance existing unified ingredients with additional properties
   */
  private enhanceExistingIngredients(): { [key: string]: EnhancedIngredient } {
    const enhanced: { [key: string]: EnhancedIngredient } = {};
    
    // Enhance each ingredient from the unified ingredients system
    Object.values(unifiedIngredients || {}).forEach(ingredient => {
      const enhancedIngredient = this.enhanceIngredient(ingredient as UnifiedIngredient);
      enhanced[enhancedIngredient.name] = enhancedIngredient;
    });
    
    return enhanced;
  }
  
  /**
   * Enhance a single unified ingredient with additional properties
   */
  private enhanceIngredient(ingredient: UnifiedIngredient): EnhancedIngredient {
    // Generate additional properties
    const culinaryProperties = this.generateCulinaryProperties(ingredient);
    const astrologicalProfile = this.generateAstrologicalProfile(ingredient);
    const nutritionalProfile = this.generateNutritionalProfile(ingredient);
    
    // Look up linked flavor profile if available
    const flavorProfile = this.flavorProfileSystem.getFlavorProfile(ingredient.name, 'ingredient');
    
    // Assess data quality
    const dataQuality = this.assessDataQuality(ingredient);
    
    // Create enhanced ingredient
    return {
      ...ingredient,
      culinaryProperties,
      astrologicalProfile,
      nutritionalProfile,
      unifiedFlavorProfile: flavorProfile,
      metadata: {
        sourceFile: ingredient.metadata?.sourceFile || 'unknown',
        enhancedAt: new Date()?.toISOString(),
        kalchmCalculated: !!ingredient.kalchm,
        flavorProfileLinked: !!flavorProfile,
        dataQuality,
        lastUpdated: new Date()?.toISOString()
      }
    } as EnhancedIngredient;
  }
  
  /**
   * Generate culinary properties for an ingredient
   */
  private generateCulinaryProperties(ingredient: UnifiedIngredient): EnhancedIngredient['culinaryProperties'] {
    const category = ingredient.category;
    const elementalProps = ingredient.elementalProperties;
    
    return {
      cookingMethods: this.getCookingMethodsForCategory(category, elementalProps),
      pAirings: ingredient.pAiringRecommendations || [],
      substitutions: ingredient.swaps || [],
      storage: this.getStorageForCategory(category),
      seasonality: this.getSeasonalityForIngredient(ingredient),
      preparationMethods: this.getPreparationMethodsForCategory(category)
    };
  }
  
  /**
   * Generate astrological profile for an ingredient
   */
  private generateAstrologicalProfile(ingredient: UnifiedIngredient): EnhancedIngredient['astrologicalProfile'] {
    // Get the dominant element
    const elementalProps = ingredient.elementalProperties;
    const dominantElement = Object.entries(elementalProps)
      .reduce((max, [element, value]) => value > max.value ? { element, value } : max, 
              { element: 'Fire', value: 0 })
      .element as Element;
    
    return {
      planetaryRuler: ingredient.planetaryRuler || this.getPlanetaryRulerForElement(dominantElement),
      zodiacRuler: this.getZodiacRulerForElement(dominantElement),
      element: dominantElement,
      energyType: this.getEnergyTypeForElement(dominantElement),
      seasonalPeak: this.getSeasonalPeakForElement(dominantElement),
      lunarAffinity: this.getLunarAffinityForElement(dominantElement),
      planetaryHours: this.getPlanetaryHoursForElement(dominantElement)
    };
  }
  
  /**
   * Generate nutritional profile for an ingredient
   */
  private generateNutritionalProfile(ingredient: UnifiedIngredient): EnhancedIngredient['nutritionalProfile'] {
    // Use existing nutritional profile if available
    if (ingredient.nutritionalProfile) {
      const existingProfile = ingredient.nutritionalProfile;
      
      return {
        serving_size: existingProfile.servingSize || '100g',
        calories: existingProfile.calories || 0,
        macros: {
          protein: existingProfile.macros?.protein || 0,
          carbs: existingProfile.macros?.carbs || 0,
          fat: existingProfile.macros?.fat || 0,
          fiber: existingProfile.macros?.fiber || 0
        },
        vitamins: existingProfile.vitamins || {},
        minerals: existingProfile.minerals || {},
        benefits: ingredient.healthBenefits || [],
        source: existingProfile.source || 'estimated'
      };
    }
    
    // Fall back to a placeholder profile
    return {
      serving_size: '100g',
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: {},
      benefits: ingredient.healthBenefits || [],
      source: 'placeholder'
    };
  }
  
  /**
   * Assess data quality for an ingredient
   */
  private assessDataQuality(ingredient: UnifiedIngredient): 'high' | 'medium' | 'low' {
    let qualityPoints = 0;
    
    // Check for essential properties
    if (ingredient.elementalProperties && 
        Object.values(ingredient.elementalProperties || {}).some(v => v > 0)) {
      qualityPoints += 1;
    }
    
    if (ingredient.alchemicalProperties &&
        Object.values(ingredient.alchemicalProperties || {}).some(v => v > 0)) {
      qualityPoints += 1;
    }
    
    // Check for additional data
    if (ingredient.nutritionalProfile) qualityPoints += 1;
    if ((ingredient.astrologicalPropertiesProfile?.rulingPlanets || []).length) qualityPoints += 1;
    if ((ingredient.qualities || []).length) qualityPoints += 1;
    if ((ingredient.seasonality || []).length) qualityPoints += 1;
    if ((ingredient.pAiringRecommendations || []).length) qualityPoints += 1;
    if (ingredient.description) qualityPoints += 1;
    if (ingredient.kalchm) qualityPoints += 1;
    if (ingredient.monica) qualityPoints += 1;
    
    // Determine quality level
    if (qualityPoints >= 7) return 'high';
    if (qualityPoints >= 4) return 'medium';
    return 'low';
  }
  
  /**
   * Build indexes for fast ingredient lookups
   */
  private buildIndexes(): void {
    this.categoryIndex = new Map<string, string[]>();
    this.elementalIndex = new Map<string, string[]>();
    this.kalchmIndex = new Map<string, string[]>();
    this.seasonalIndex = new Map<string, string[]>();
    this.planetaryIndex = new Map<string, string[]>();
    
    Object.values(this.ingredients || {}).forEach(ingredient => {
      // Index by category
      const category = ingredient.category;
      if (category) {
        const categoryIngredients = this.categoryIndex.get(category) || [];
        categoryIngredients?.push(ingredient.name);
        this.categoryIndex.set(category, categoryIngredients);
      }
      
      // Index by dominant element
      const elementalProps = ingredient.elementalProperties;
      if (elementalProps) {
        const dominantElement = Object.entries(elementalProps)
          .reduce((max, [element, value]) => value > max.value ? { element, value } : max, 
                  { element: 'Fire', value: 0 })
          .element;
        
        const elementIngredients = this.elementalIndex.get(dominantElement) || [];
        elementIngredients?.push(ingredient.name);
        this.elementalIndex.set(dominantElement, elementIngredients);
      }
      
      // Index by Kalchm range
      const kalchm = ingredient.kalchm;
      if (kalchm !== undefined) {
        const kalchmRange = this.getKalchmRange(kalchm);
        const kalchmIngredients = this.kalchmIndex.get(kalchmRange) || [];
        kalchmIngredients?.push(ingredient.name);
        this.kalchmIndex.set(kalchmRange, kalchmIngredients);
      }
      
      // Index by seasonality
      const seasonality = ingredient.culinaryProperties?.seasonality;
      if (seasonality) {
        const allSeasons = [
          ...(seasonality.peak || []), 
          ...(seasonality.optimal || [])
        ];
        
        (allSeasons || []).forEach(season => {
          const seasonalIngredients = this.seasonalIndex.get(season) || [];
          if (!seasonalIngredients.includes(ingredient.name)) {
            seasonalIngredients?.push(ingredient.name);
            this.seasonalIndex.set(season, seasonalIngredients);
          }
        });
      }
      
      // Index by planetary ruler
      const planetaryRuler = ingredient.astrologicalPropertiesProfile?.planetaryRuler;
      if (planetaryRuler) {
        const planetaryIngredients = this.planetaryIndex.get(planetaryRuler) || [];
        planetaryIngredients?.push(ingredient.name);
        this.planetaryIndex.set(planetaryRuler, planetaryIngredients);
      }
    });
  }

  /**
   * Find complementary ingredients for a set of ingredients
   */
  private findComplementaryIngredients(ingredients: EnhancedIngredient[]): EnhancedIngredient[] {
    if (!ingredients || (ingredients || []).length === 0) return [];
    
    // Get average elemental properties
    const avgElementalProperties = ingredients.reduce(
      (acc, ingredient) => {
        acc.Fire += ingredient.elementalProperties.Fire / (ingredients || []).length;
        acc.Water += ingredient.elementalProperties.Water / (ingredients || []).length;
        acc.Earth += ingredient.elementalProperties.Earth / (ingredients || []).length;
        acc.Air += ingredient.elementalProperties.Air / (ingredients || []).length;
        return acc;
      },
      createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  })
    );
    
    // Find ingredients with complementary elemental properties
    return Object.values(this.ingredients)
      // Exclude ingredients already in the set
      .filter(ingredient => {
        const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];
        return !ingredientsArray.some(i => i.name === ingredient.name);
      })
      // Score by compatibility
      .map(ingredient => ({
        ingredient,
        score: calculateElementalCompatibility(avgElementalProperties, ingredient.elementalProperties)
      }))
      // Sort by score (highest first)
      .sort((a, b) => b.score - a.score)
      // Take top matches
      .slice(0, 8)
      .map(({ ingredient }) => ingredient);
  }
  
  /**
   * Find substitutions for a set of ingredients
   */
  private findSubstitutions(ingredients: EnhancedIngredient[]): EnhancedIngredient[] {
    const substitutions: EnhancedIngredient[] = [];
    
    // For each ingredient, try to find possible substitutions
    (ingredients || []).forEach(ingredient => {
      // Skip if we already have substitutions for this category
      const category = ingredient.category;
      if ((substitutions || []).some(sub => sub.category === category)) return;
      
      // Find other ingredients in the same category with similar elemental properties
      const sameCategory = this.getIngredientsByCategory(category)
        .filter(other => other.name !== ingredient.name)
        .map(other => ({
          ingredient: other,
          score: calculateElementalCompatibility(ingredient.elementalProperties, other.elementalProperties)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ ingredient }) => ingredient);
      
      substitutions?.push(...sameCategory);
    });
    
    // Return unique substitutions (limit to 8)
    return Array.from(new Set(substitutions)).slice(0, 8);
  }
  
  /**
   * Find traditional pAirings for an ingredient
   */
  private findTraditionalPAirings(ingredient: EnhancedIngredient): EnhancedIngredient[] {
    // First check if the ingredient has defined pAirings
    if ((ingredient.culinaryProperties?.pAirings || []).length > 0) {
      return ingredient.culinaryProperties.pAirings
        .map(pAiring => this.getIngredient(pAiring))
        .filter((ingredient): ingredient is EnhancedIngredient => !!ingredient)
        .slice(0, 8);
    }
    
    // Otherwise, find ingredients that traditionally pAir well with this category
    return this.findElementallyCompatibleIngredients(ingredient, 0.8)
      .slice(0, 8);
  }
  
  /**
   * Find innovative pAirings for an ingredient
   */
  private findInnovativePAirings(ingredient: EnhancedIngredient): EnhancedIngredient[] {
    // Look for unexpected but harmonious combinations
    // Start with average elemental compatibility
    const compatibility = 0.75; // Minimum compatibility threshold
    
    // Find ingredients from different categories with compatible elemental properties
    const fromDifferentCategories = Object.values(this.ingredients)
      .filter(other => 
        other.name !== ingredient.name &&
        other.category !== ingredient.category &&
        calculateElementalCompatibility(ingredient.elementalProperties, other.elementalProperties) >= compatibility
      )
      .slice(0, 8);
    
    // If we don't have enough, add some based on Kalchm values
    if ((fromDifferentCategories || []).length < 5 && ingredient.kalchm) {
      const kalchmMatches = this.findKalchmCompatibleIngredients(ingredient.kalchm, 0.2)
        .filter(other => 
          other.name !== ingredient.name &&
          !(fromDifferentCategories || []).some(i => i.name === other.name)
        )
        .slice(0, 8 - (fromDifferentCategories || []).length);
      
      return [...fromDifferentCategories, ...kalchmMatches];
    }
    
    return fromDifferentCategories;
  }
  
  /**
   * Find seasonal pAirings for an ingredient
   */
  private findSeasonalPAirings(ingredient: EnhancedIngredient): EnhancedIngredient[] {
    // Get all seasons this ingredient is associated with
    const seasons = ingredient.culinaryProperties?.seasonality?.peak || [];
    
    // For each season, find other ingredients in that season
    const seasonalMatches = seasons.flatMap(season => 
      this.getSeasonalIngredients(season)
        .filter(other => other.name !== ingredient.name)
        .slice(0, 3)
    );
    
    // Return unique seasonal pAirings (limit to 8)
    return Array.from(new Set(seasonalMatches)).slice(0, 8);
  }
  
  /**
   * Get cooking methods appropriate for a category and elemental properties
   */
  private getCookingMethodsForCategory(category: string, elementalProps: ElementalProperties): string[] {
    // Default cooking methods by category
    const defaultMethods: Record<string, string[]> = {
      fruits: ['raw', 'baking', 'poaching', 'simmering'],
      vegetables: ['steaming', 'roasting', 'sauteing', 'grilling', 'raw'],
      herbs: ['raw', 'infusing', 'drying'],
      spices: ['toasting', 'infusing', 'grinding'],
      grains: ['boiling', 'steaming', 'pressure_cooking'],
      oils: ['raw', 'infusing'],
      proteins: ['roasting', 'grilling', 'braising', 'sauteing'],
      seasonings: ['infusing', 'raw']
    };
    
    // Get base methods for this category
    const baseMethods = defaultMethods[category] || ['raw', 'cooking'];
    
    // Add methods based on elemental properties
    const methodsByElement: Record<keyof ElementalProperties, string[]> = { Fire: ['grilling', 'roasting', 'frying'],
      Water: ['poaching', 'steaming', 'boiling'],
      Earth: ['braising', 'stewing', 'baking'],
      Air: ['raw', 'fermenting', 'drying']
    };
    
    // Find dominant element
    const dominantElement = Object.entries(elementalProps)
      .reduce((max, [element, value]) => value > max.value ? { element, value } : max, 
              { element: 'Fire', value: 0 })
      .element as "Fire" | "Water" | "Earth" | "Air";
    
    // Add methods for dominant element
    const elementMethods = methodsByElement[dominantElement] || [];
    
    // Combine and return unique methods
    return Array.from(new Set([...baseMethods, ...elementMethods]));
  }
  
  /**
   * Get storage recommendations for a category
   */
  private getStorageForCategory(category: string): any {
    // Default storage recommendations by category
    const storageRecs: { [key: string]: any } = {
      fruits: {
        temperature: 'cool',
        humidity: 'moderate',
        duration: '1-2 weeks',
        method: 'refrigerate'
      },
      vegetables: {
        temperature: 'cool',
        humidity: 'high',
        duration: '1-2 weeks',
        method: 'refrigerate'
      },
      herbs: {
        temperature: 'cool',
        humidity: 'moderate',
        duration: '5-7 days',
        method: 'refrigerate wrapped in damp paper towel'
      },
      spices: {
        temperature: 'room temperature',
        humidity: 'low',
        duration: '6-12 months',
        method: 'Airtight container in a dark place'
      },
      grains: {
        temperature: 'room temperature',
        humidity: 'low',
        duration: '6-12 months',
        method: 'Airtight container'
      },
      oils: {
        temperature: 'cool',
        humidity: 'low',
        duration: '3-6 months',
        method: 'dark bottle, away from heat'
      },
      proteins: {
        temperature: 'cold',
        humidity: 'low',
        duration: '2-4 days',
        method: 'refrigerate or freeze'
      },
      seasonings: {
        temperature: 'room temperature',
        humidity: 'low',
        duration: '6-12 months',
        method: 'Airtight container'
      }
    };
    
    return storageRecs[category] || {
      temperature: 'cool',
      humidity: 'moderate',
      duration: 'varies',
      method: 'appropriate container'
    };
  }
  
  /**
   * Get seasonality for an ingredient
   */
  private getSeasonalityForIngredient(ingredient: UnifiedIngredient): any {
    // Use existing seasonality if available
    if ((ingredient.seasonality || []).length) {
      return {
        peak: ingredient.seasonality,
        optimal: ingredient.seasonality,
        available: ['spring', 'summer', 'fall', 'winter']
      };
    }
    
    // Default seasonality by element
    const seasonalityByElement: { [key: string]: any } = { Fire: {
        peak: ['summer'],
        optimal: ['summer', 'fall'],
        available: ['spring', 'summer', 'fall']
      },
      Water: {
        peak: ['winter'],
        optimal: ['winter', 'spring'],
        available: ['fall', 'winter', 'spring']
      },
      Earth: {
        peak: ['fall'],
        optimal: ['fall', 'winter'],
        available: ['summer', 'fall', 'winter']
      },
      Air: {
        peak: ['spring'],
        optimal: ['spring', 'summer'],
        available: ['winter', 'spring', 'summer']
      }
    };
    
    // Find dominant element
    const elementalProps = ingredient.elementalProperties;
    const dominantElement = Object.entries(elementalProps)
      .reduce((max, [element, value]) => value > max.value ? { element, value } : max, 
              { element: 'Fire', value: 0 })
      .element;
    
    return seasonalityByElement[dominantElement] || {
      peak: ['summer'],
      optimal: ['spring', 'summer', 'fall'],
      available: ['spring', 'summer', 'fall', 'winter']
    };
  }
  
  /**
   * Get preparation methods for a category
   */
  private getPreparationMethodsForCategory(category: string): string[] {
    // Default preparation methods by category
    const prepMethods: Record<string, string[]> = {
      fruits: ['washing', 'peeling', 'slicing', 'juicing'],
      vegetables: ['washing', 'peeling', 'chopping', 'grating'],
      herbs: ['washing', 'chopping', 'mincing', 'drying'],
      spices: ['toasting', 'grinding', 'crushing'],
      grains: ['rinsing', 'soaking', 'grinding'],
      oils: ['measuring'],
      proteins: ['trimming', 'cutting', 'marinating', 'tenderizing'],
      seasonings: ['measuring', 'mixing']
    };
    
    return prepMethods[category] || ['washing', 'preparing'];
  }
  
  /**
   * Get planetary ruler for an element
   */
  private getPlanetaryRulerForElement(element: Element): string {
    const planetaryRulers: { [key: string]: string } = { Fire: 'Sun', Water: 'Moon', Earth: 'Saturn', Air: 'Mercury'
     };
    
    return planetaryRulers[element] || 'Sun';
  }
  
  /**
   * Get zodiac ruler for an element
   */
  private getZodiacRulerForElement(element: Element): string {
    const zodiacRulers: { [key: string]: string } = { Fire: 'leo', Water: 'cancer', Earth: 'taurus', Air: 'libra'
     };
    
    return zodiacRulers[element] || 'aries';
  }
  
  /**
   * Get energy type for an element
   */
  private getEnergyTypeForElement(element: Element): string {
    const energyTypes: { [key: string]: string } = { Fire: 'active', Water: 'receptive', Earth: 'stabilizing', Air: 'communicative'
     };
    
    return energyTypes[element] || 'neutral';
  }
  
  /**
   * Get seasonal peak for an element
   */
  private getSeasonalPeakForElement(element: Element): any {
    const seasonalPeaks: { [key: string]: any } = { Fire: { northern: [6, 7, 8], southern: [12, 1, 2] },
      Water: { northern: [12, 1, 2], southern: [6, 7, 8] },
      Earth: { northern: [9, 10, 11], southern: [3, 4, 5] },
      Air: { northern: [3, 4, 5], southern: [9, 10, 11] }
    };
    
    return seasonalPeaks[element] || { northern: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], southern: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
  }
  
  /**
   * Get lunar affinity for an element
   */
  private getLunarAffinityForElement(element: Element): string[] {
    const lunarAffinities: Record<string, string[]> = { Fire: ['full moon', 'waxing gibbous'],
      Water: ['new moon', 'waning crescent'],
      Earth: ['last quarter', 'waning gibbous'],
      Air: ['first quarter', 'waxing crescent']
    };
    
    return lunarAffinities[element] || ['full moon', 'new moon'];
  }
  
  /**
   * Get planetary hours for an element
   */
  private getPlanetaryHoursForElement(element: Element): string[] {
    const planetaryHours: Record<string, string[]> = { Fire: ['Sun', 'Mars', 'Jupiter'],
      Water: ['Moon', 'Venus', 'Neptune'],
      Earth: ['Saturn', 'Mercury', 'Venus'],
      Air: ['Mercury', 'Jupiter', 'Uranus']
    };
    
    return planetaryHours[element] || ['Sun', 'Moon'];
  }
  
  /**
   * Get Kalchm range string
   */
  private getKalchmRange(kalchm: number): string {
    if (kalchm <= 0.5) return 'very_low';
    if (kalchm <= 1.0) return 'low';
    if (kalchm <= 1.5) return 'moderate';
    if (kalchm <= 2.0) return 'high';
    return 'very_high';
  }
}

// ===== INITIALIZE SYSTEM =====

const enhancedIngredientsSystem = new EnhancedIngredientsSystem();

// ===== EXPORT INTERFACE =====

/**
 * Get an enhanced ingredient by name
 */
export const getEnhancedIngredient = (name: string): EnhancedIngredient | undefined => 
  enhancedIngredientsSystem.getIngredient(name);

/**
 * Get enhanced ingredients by category
 */
export const getIngredientsByCategory = (category: string): EnhancedIngredient[] => 
  enhancedIngredientsSystem.getIngredientsByCategory(category);

/**
 * Search for enhanced ingredients based on criteria
 */
export const searchIngredients = (criteria: IngredientSearchCriteria): EnhancedIngredient[] => 
  enhancedIngredientsSystem.searchIngredients(criteria);

/**
 * Get seasonal ingredients
 */
export const getSeasonalIngredients = (season: string): EnhancedIngredient[] => 
  enhancedIngredientsSystem.getSeasonalIngredients(season);

/**
 * Find ingredients with compatible Kalchm values
 */
export const findKalchmCompatibleIngredients = (kalchm: number, tolerance?: number): EnhancedIngredient[] => 
  enhancedIngredientsSystem.findKalchmCompatibleIngredients(kalchm, tolerance);

/**
 * Generate comprehensive ingredient recommendations
 */
export const generateIngredientRecommendations = (
  criteria: IngredientSearchCriteria, 
  conditions?: IngredientSystemConditions
): IngredientRecommendations => 
  enhancedIngredientsSystem.generateIngredientRecommendations(criteria, conditions);

/**
 * Generate ingredient pAirings for a specific ingredient
 */
export const generateIngredientPAirings = (ingredient: EnhancedIngredient) => 
  enhancedIngredientsSystem.generateIngredientPAirings(ingredient);

/**
 * Get all enhanced ingredients
 */
export const getAllEnhancedIngredients = (): EnhancedIngredient[] =>
  enhancedIngredientsSystem.getAllIngredients();

/**
 * Get ingredient statistics
 */
export const getIngredientStats = () =>
  enhancedIngredientsSystem.getIngredientStats();

export default enhancedIngredientsSystem; 
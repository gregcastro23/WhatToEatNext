// ===== UNIFIED CUISINE INTEGRATION SYSTEM =====;
// Phase 3 Step 2 of WhatToEatNext Data Consolidation
// Consolidates cuisineMatrix.ts and related files with Monica/Kalchm integration
// Integrates with unified seasonal system for dynamic cuisine recommendations

import type { UnifiedIngredient } from '@/types';
import type {
  CookingMethod,
  Element,
  ElementalProperties,
  LunarPhase,
  PlanetName
} from '@/types/alchemy';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import type { EnhancedCookingMethod } from '@/types/cooking';
import { FlavorProfileType } from '@/types/flavor';
import type { Season } from '@/types/seasons';
// TODO: Fix import - add what to import from './ingredients'
// TODO: Fix import - add what to import from './unifiedTypes'
// TODO: Fix import - add what to import from './seasonal'
// Import removed - function not yet implemented

// Fixed import path
import {
  getCuisinePAirings,
  getIngredientsForCuisine,
  getSharedIngredients
} from '../../utils/cuisine/cuisineUtils';
import { createElementalProperties } from '../../utils/elemental/elementalUtils';
// Cache import removed - not available
// import { cache } from '../utils/cache';

// Import shared utility functions

// Missing unified seasonal system variables
const unifiedSeasonalSystem = {
  spring: { dominantElement: 'Air', supportingElements: ['Water'] },
  summer: { dominantElement: 'Fire', supportingElements: ['Air'] },
  autumn: { dominantElement: 'Earth', supportingElements: ['Fire'] },
  winter: { dominantElement: 'Water', supportingElements: ['Earth'] }
};

const unifiedSeasonalProfiles = {
  spring: { ingredients: [], flavors: [], techniques: [] },
  summer: { ingredients: [], flavors: [], techniques: [] },
  autumn: { ingredients: [], flavors: [], techniques: [] },
  winter: { ingredients: [], flavors: [], techniques: [] }
};

const unifiedIngredients = {
  // Placeholder for unified ingredient system
  getAllIngredients: () => [],
  getIngredientsByCategory: (_category: string) => [],
  getIngredientProperties: (_ingredient: string) => ({})
};

// Import existing cuisine data
import { grainCuisineMatrix } from '../integrations/grainCuisineMatrix';
import { herbCuisineMatrix } from '../integrations/herbCuisineMatrix';

// ===== ENHANCED CUISINE INTEGRATION INTERFACES =====;

export interface CuisineMonicaProfile {
  baseMonicaConstant: number, // Base Monica constant for cuisine
  seasonalModifiers: Record<Season, number>, // Seasonal Monica adjustments
  cookingMethodOptimization: { [key: string]: number }; // Method-specific Monica optimization
  temperaturePreferences: {
    // Temperature preferences for Monica optimization
    optimal: number,
    range: { min: number, max: number };
  };
  timingAdjustments: {
    // Timing adjustments for Monica optimization
    preparationTime: number, // Preparation time modifier
    cookingTime: number, // Cooking time modifier
    restingTime: number, // Resting time modifier
  };
}

export interface CuisineCompatibilityProfile {
  monicaCompatibility: number; // Based on Monica constants
  kalchmHarmony: number; // Based on Kalchm values
  culturalSynergy: number; // Cultural compatibility
  fusionPotential: number; // Fusion cuisine potential
  recommendedBlendRatio: number, // Optimal blend ratio
  seasonalCompatibility: Record<Season, number>; // Seasonal integration
  sharedIngredients: string[], // Common ingredients
  sharedCookingMethods: CookingMethod[], // Common cooking methods
  elementalAlignment: number, // Elemental compatibility score
}

export interface CuisineSeasonalAdaptation {
  season: Season,
  adaptedIngredients: UnifiedIngredient[], // Season-appropriate ingredients
  adaptedCookingMethods: CookingMethod[]; // Season-appropriate methods
  seasonalModifiers: {
    temperatureAdjustment: number,
    timingAdjustment: number,
    intensityModifier: string,
    zodiacAlignment?: any, // Astrological alignment for season
  };
  traditionalSeasonalDishes: string[],
  monicaOptimization: number,
  kalchmHarmony: number
}

export interface FusionCuisineProfile {
  name: string,
  parentCuisines: string[],
  blendRatio: { [key: string]: number };
  fusionIngredients: UnifiedIngredient[],
  fusionCookingMethods: EnhancedCookingMethod[],
  fusionElementalProfile: ElementalProperties,
  fusionKalchm: number,
  fusionMonica: number,
  culturalNotes: string[],
  recommendedDishes: string[],
  seasonalAdaptations: Record<Season, CuisineSeasonalAdaptation>;
}

export interface MonicaBlendProfile {
  blendedMonica: number,
  contributingCuisines: Array<{
    cuisine: string,
    monica: number,
    weight: number,
    contribution: number
  }>;
  optimizationScore: number,
  recommendedConditions: {
    temperature: number,
    timing: string,
    planetaryHour?: PlanetName,
    lunarPhase?: LunarPhase
  };
}

export interface SeasonalFusionProfile {
  season: Season,
  fusionProfile: FusionCuisineProfile,
  seasonalOptimization: number,
  seasonalIngredients: UnifiedIngredient[],
  seasonalCookingMethods: EnhancedCookingMethod[],
  seasonalElementalBalance: ElementalProperties
}

export interface CookingMethodCulturalData {
  culturalOrigin: string[],
  traditionalUse: string[],
  modernAdaptations: string[],
  culturalSignificance: string,
  regionalVariations: { [key: string]: string };
}

export interface CuisineIngredientAnalysis {
  totalIngredients: number,
  categorizedIngredients: Record<string, UnifiedIngredient[]>,
  kalchmProfile: {
    averageKalchm: number,
    kalchmRange: { min: number, max: number };
    kalchmDistribution: { [key: string]: number }; // Kalchm ranges and their frequencies
  };
  elementalProfile: ElementalProperties,
  seasonalAvailability: Record<Season, number>;
  commonIngredients: UnifiedIngredient[],
  uniqueIngredients: UnifiedIngredient[],
}

// ===== UNIFIED CUISINE INTEGRATION INTERFACE =====;

export interface UnifiedCuisineIntegration {
  // Cuisine Compatibility Matrix
  cuisineCompatibility: Record<string, Record<string, CuisineCompatibilityProfile>>;

  // Cuisine-Specific Cooking Methods
  cuisineCookingMethods: Record<
    string,
    {
      traditional: EnhancedCookingMethod[],
      modern: EnhancedCookingMethod[],
      monicaOptimized: EnhancedCookingMethod[],
      seasonalAdaptations: Record<Season, EnhancedCookingMethod[]>,
      culturalSignificance: CookingMethodCulturalData
    }
  >;

  // Fusion Cuisine Generator
  fusionCuisineGenerator: {
    generateFusion: (cuisine1: string, cuisine2: string) => FusionCuisineProfile,
    optimizeMonicaBlend: (cuisines: string[]) => MonicaBlendProfile,
    calculateKalchmHarmony: (cuisines: string[]) => number,
    getSeasonalFusionRecommendations: (cuisines: string[], season: Season) => SeasonalFusionProfile
  };

  // Seasonal Cuisine Integration
  seasonalCuisineIntegration: {
    getCuisineSeasonalCompatibility: (cuisine: string, season: Season) => number,
    getSeasonalCuisineRecommendations: (season: Season) => string[],
    adaptCuisineForSeason: (cuisine: string, season: Season) => CuisineSeasonalAdaptation
  };

  // Cuisine Ingredient Analysis
  cuisineIngredientAnalysis: {
    analyzeCuisineIngredients: (cuisine: string) => CuisineIngredientAnalysis,
    findCuisinesByIngredient: (ingredient: string) => string[],
    getCuisineIngredientRecommendations: (cuisine: string, season?: Season) => UnifiedIngredient[]
  };
}

// ===== CONSOLIDATED CUISINE DATA =====;

// Enhanced cuisine matrix that includes all ingredient categories
export const enhancedCuisineMatrix = {
  // Consolidate existing matrices (with fallbacks in case imports fail)
  grain: grainCuisineMatrix || {
    white_rice: {
      cuisines: ['japanese', 'chinese', 'korean', 'indian', 'thai'],
      flavorProfileType: FlavorProfileType.SAVORY
    },
    brown_rice: {
      cuisines: ['american', 'macrobiotic', 'health_focused'],
      flavorProfileType: FlavorProfileType.NEUTRAL
    },
    quinoa: {
      cuisines: ['peruvian', 'bolivian', 'health_focused'],
      flavorProfileType: FlavorProfileType.HERBAL
    },
    semolina: {
      cuisines: ['italian', 'north_african', 'indian'],
      flavorProfileType: FlavorProfileType.WARM
    }
  },
  herb: herbCuisineMatrix || {
    basil: ['italian', 'thai', 'mediterranean'],
    cilantro: ['mexican', 'indian', 'thai', 'vietnamese'],
    parsley: ['middle-eastern', 'european', 'american'],
    oregano: ['italian', 'greek', 'mexican']
  },

  // Extended matrices for comprehensive coverage
  spice: {
    cumin: ['indian', 'middle-eastern', 'mexican', 'african'],
    cinnamon: ['indian', 'middle-eastern', 'mexican', 'american'],
    paprika: ['hungarian', 'spanish', 'american', 'african'],
    turmeric: ['indian', 'thai', 'middle-eastern'],
    garam_masala: ['indian'],
    five_spice: ['chinese', 'vietnamese'],
    za_atar: ['middle-eastern', 'greek'],
    berbere: ['african', 'ethiopian'],
    chili_powder: ['mexican', 'american', 'indian'],
    saffron: ['spanish', 'indian', 'middle-eastern', 'french']
  },

  protein: {
    beef: ['american', 'french', 'italian', 'mexican', 'korean'],
    chicken: ['american', 'french', 'italian', 'indian', 'chinese', 'thai'],
    pork: ['american', 'chinese', 'korean', 'german', 'italian'],
    lamb: ['middle-eastern', 'greek', 'indian', 'african'],
    fish: ['japanese', 'scandinavian', 'mediterranean', 'chinese'],
    tofu: ['chinese', 'japanese', 'korean', 'vietnamese', 'thai'],
    paneer: ['indian'],
    seafood: ['japanese', 'italian', 'spanish', 'thai', 'chinese']
  },

  vegetable: {
    tomato: ['italian', 'mexican', 'american', 'spanish', 'greek'],
    onion: ['french', 'indian', 'american', 'italian', 'chinese'],
    garlic: ['italian', 'chinese', 'korean', 'french', 'spanish'],
    ginger: ['chinese', 'indian', 'thai', 'japanese', 'korean'],
    bell_pepper: ['mexican', 'american', 'hungarian', 'chinese'],
    eggplant: ['italian', 'middle-eastern', 'indian', 'chinese'],
    mushroom: ['french', 'italian', 'chinese', 'japanese'],
    cabbage: ['korean', 'german', 'chinese', 'american'],
    spinach: ['indian', 'greek', 'italian', 'middle-eastern'],
    carrot: ['french', 'american', 'chinese', 'indian']
  }
};

// Cuisine Monica constants (estimated based on cooking methods and complexity)
export const cuisineMonicaConstants: { [key: string]: CuisineMonicaProfile } = {
  italian: {
    baseMonicaConstant: 1.15,
    seasonalModifiers: {
      spring: 1.1,
      summer: 1.2,
      autumn: 1.15,
      fall: 1.15,
      winter: 1.05,
      all: 1.15
    },
    cookingMethodOptimization: {
      pasta_making: 1.25,
      risotto: 1.2,
      grilling: 1.15,
      braising: 1.1,
      roasting: 1.18
    },
    temperaturePreferences: {
      optimal: 375,
      range: { min: 325, max: 425 }
    },
    timingAdjustments: {
      preparationTime: 1.1,
      cookingTime: 1.0,
      restingTime: 1.2
    }
  },

  chinese: {
    baseMonicaConstant: 1.25,
    seasonalModifiers: {
      spring: 1.3,
      summer: 1.2,
      autumn: 1.25,
      fall: 1.25,
      winter: 1.3,
      all: 1.25
    },
    cookingMethodOptimization: {
      stir_frying: 1.35,
      steaming: 1.15,
      braising: 1.2,
      deep_frying: 1.3,
      smoking: 1.1
    },
    temperaturePreferences: {
      optimal: 400,
      range: { min: 350, max: 500 }
    },
    timingAdjustments: {
      preparationTime: 1.3,
      cookingTime: 0.8,
      restingTime: 0.9
    }
  },

  indian: {
    baseMonicaConstant: 1.35,
    seasonalModifiers: {
      spring: 1.4,
      summer: 1.3,
      autumn: 1.35,
      fall: 1.35,
      winter: 1.4,
      all: 1.35
    },
    cookingMethodOptimization: {
      tempering: 1.45,
      slow_cooking: 1.25,
      tandoor: 1.4,
      curry_making: 1.35,
      pressure_cooking: 1.2
    },
    temperaturePreferences: {
      optimal: 350,
      range: { min: 300, max: 450 }
    },
    timingAdjustments: {
      preparationTime: 1.4,
      cookingTime: 1.2,
      restingTime: 1.1
    }
  },

  french: {
    baseMonicaConstant: 1.2,
    seasonalModifiers: {
      spring: 1.25,
      summer: 1.15,
      autumn: 1.2,
      fall: 1.2,
      winter: 1.25,
      all: 1.2
    },
    cookingMethodOptimization: {
      sauteing: 1.25,
      braising: 1.3,
      roasting: 1.2,
      poaching: 1.15,
      confit: 1.35
    },
    temperaturePreferences: {
      optimal: 350,
      range: { min: 300, max: 400 }
    },
    timingAdjustments: {
      preparationTime: 1.3,
      cookingTime: 1.1,
      restingTime: 1.3
    }
  },

  japanese: {
    baseMonicaConstant: 1.1,
    seasonalModifiers: {
      spring: 1.15,
      summer: 1.05,
      autumn: 1.1,
      fall: 1.1,
      winter: 1.15,
      all: 1.1
    },
    cookingMethodOptimization: {
      steaming: 1.2,
      grilling: 1.15,
      simmering: 1.1,
      raw: 1.25,
      tempura: 1.3
    },
    temperaturePreferences: {
      optimal: 325,
      range: { min: 275, max: 375 }
    },
    timingAdjustments: {
      preparationTime: 1.2,
      cookingTime: 0.9,
      restingTime: 1.4
    }
  },

  mexican: {
    baseMonicaConstant: 1.3,
    seasonalModifiers: {
      spring: 1.25,
      summer: 1.35,
      autumn: 1.3,
      fall: 1.3,
      winter: 1.25,
      all: 1.3
    },
    cookingMethodOptimization: {
      grilling: 1.35,
      roasting: 1.3,
      braising: 1.25,
      frying: 1.32,
      smoking: 1.2
    },
    temperaturePreferences: {
      optimal: 400,
      range: { min: 350, max: 450 }
    },
    timingAdjustments: {
      preparationTime: 1.1,
      cookingTime: 1.0,
      restingTime: 1.0
    }
  },

  thai: {
    baseMonicaConstant: 1.28,
    seasonalModifiers: {
      spring: 1.3,
      summer: 1.35,
      autumn: 1.25,
      fall: 1.25,
      winter: 1.2,
      all: 1.28
    },
    cookingMethodOptimization: {
      stir_frying: 1.35,
      steaming: 1.2,
      grilling: 1.3,
      curry_making: 1.32,
      raw: 1.25
    },
    temperaturePreferences: {
      optimal: 375,
      range: { min: 325, max: 425 }
    },
    timingAdjustments: {
      preparationTime: 1.2,
      cookingTime: 0.9,
      restingTime: 1.0
    }
  },

  'middle-eastern': {
    baseMonicaConstant: 1.22,
    seasonalModifiers: {
      spring: 1.2,
      summer: 1.25,
      autumn: 1.22,
      fall: 1.22,
      winter: 1.2,
      all: 1.22
    },
    cookingMethodOptimization: {
      grilling: 1.28,
      roasting: 1.25,
      braising: 1.2,
      baking: 1.15,
      smoking: 1.18
    },
    temperaturePreferences: {
      optimal: 375,
      range: { min: 325, max: 425 }
    },
    timingAdjustments: {
      preparationTime: 1.2,
      cookingTime: 1.1,
      restingTime: 1.2
    }
  },

  mediterranean: {
    baseMonicaConstant: 1.18,
    seasonalModifiers: {
      spring: 1.2,
      summer: 1.25,
      autumn: 1.15,
      fall: 1.15,
      winter: 1.1,
      all: 1.18
    },
    cookingMethodOptimization: {
      grilling: 1.25,
      roasting: 1.2,
      braising: 1.15,
      sauteing: 1.22,
      baking: 1.18
    },
    temperaturePreferences: {
      optimal: 375,
      range: { min: 325, max: 425 }
    },
    timingAdjustments: {
      preparationTime: 1.1,
      cookingTime: 1.0,
      restingTime: 1.2
    }
  },

  asian: {
    baseMonicaConstant: 1.2,
    seasonalModifiers: {
      spring: 1.25,
      summer: 1.2,
      autumn: 1.2,
      fall: 1.2,
      winter: 1.25,
      all: 1.2
    },
    cookingMethodOptimization: {
      stir_frying: 1.3,
      steaming: 1.2,
      braising: 1.18,
      grilling: 1.15,
      deep_frying: 1.25
    },
    temperaturePreferences: {
      optimal: 375,
      range: { min: 325, max: 450 }
    },
    timingAdjustments: {
      preparationTime: 1.2,
      cookingTime: 0.9,
      restingTime: 1.0
    }
  }
};

// ===== UNIFIED CUISINE INTEGRATION SYSTEM CLASS =====;

export class UnifiedCuisineIntegrationSystem {
  private enhancedCookingMethods: { [key: string]: EnhancedCookingMethod };
  private cuisineCompatibilityCache: Map<string, Record<string, CuisineCompatibilityProfile>>;

  constructor() {
    this.enhancedCookingMethods = {} as { [key: string]: EnhancedCookingMethod }; // getAllEnhancedCookingMethods() not yet implemented;
    this.cuisineCompatibilityCache = new Map();
  }

  /**
   * Get shared ingredients between cuisines using imported utility
   */
  getSharedIngredientsForCuisines(cuisine1: string, cuisine2: string): string[] {
    return getSharedIngredients(cuisine1, cuisine2)
  }

  /**
   * Create astrological bridge for cuisine analysis
   */
  createCuisineAstrologicalBridge(_cuisineProfile: unknown, _: unknown) {
    return createAstrologicalBridge()
  }

  // ===== CUISINE COMPATIBILITY CALCULATIONS =====;

  /**
   * Calculate comprehensive compatibility between two cuisines
   */
  calculateCuisineCompatibility(
    cuisine1: string,
    cuisine2: string,
    _options?: {
      includeSeasonalAnalysis?: boolean,
      season?: Season
    },
  ): CuisineCompatibilityProfile | null {
    // Validate input cuisines - only reject obviously invalid input
    if (
      !cuisine1 ||
      !cuisine2 ||
      typeof cuisine1 !== 'string' ||
      typeof cuisine2 !== 'string' ||
      cuisine1.trim() === '' ||
      cuisine2.trim() === '' ||
      cuisine1 === 'invalid_cuisine' ||;
      cuisine2 === 'invalid_cuisine';
    ) {
      return null
    }

    const cacheKey = `${cuisine1}-${cuisine2}`;

    // Check cache first
    if (this.cuisineCompatibilityCache.has(cacheKey)) {
      const cached = this.cuisineCompatibilityCache.get(cacheKey) ?? undefined;
      if (cached && cached[cuisine2]) {
        return cached[cuisine2]
      }
    }

    // Get Monica profiles
    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    // Calculate Monica compatibility
    const monicaCompatibility = this.calculateMonicaCompatibility(monica1, monica2);

    // Calculate Kalchm harmony (using existing cuisine Kalchm values)
    const kalchmHarmony = this.calculateKalchmHarmonyBetweenCuisines(cuisine1, cuisine2);

    // Calculate cultural synergy
    const culturalSynergy = this.calculateCulturalSynergy(cuisine1, cuisine2);

    // Calculate fusion potential
    const fusionPotential = this.calculateFusionPotential(;
      monicaCompatibility,
      kalchmHarmony,
      culturalSynergy,
    );

    // Calculate recommended blend ratio
    const recommendedBlendRatio = this.calculateBlendRatio(monicaCompatibility, kalchmHarmony);

    // Find shared ingredients and cooking methods
    const sharedIngredients = this.findSharedIngredients(cuisine1, cuisine2);
    const sharedCookingMethods = this.findSharedCookingMethods(cuisine1, cuisine2);

    // Calculate elemental alignment
    const elementalAlignment = this.calculateElementalAlignment(cuisine1, cuisine2);

    // Calculate seasonal compatibility
    const seasonalCompatibility = this.calculateSeasonalCompatibility(cuisine1, cuisine2);

    // Apply self-reinforcement principle: same cuisine should have higher compatibility
    let finalMonicaCompatibility = monicaCompatibility;
    let finalKalchmHarmony = kalchmHarmony;
    let finalCulturalSynergy = culturalSynergy;
    let finalElementalAlignment = elementalAlignment;

    if (cuisine1 === cuisine2) {
      // Self-reinforcement: same cuisine has perfect compatibility
      finalMonicaCompatibility = Math.max(0.9, monicaCompatibility);
      finalKalchmHarmony = Math.max(0.9, kalchmHarmony);
      finalCulturalSynergy = Math.max(0.9, culturalSynergy),;
      finalElementalAlignment = Math.max(0.9, elementalAlignment),;
    }

    const compatibility: CuisineCompatibilityProfile = {
      monicaCompatibility: finalMonicaCompatibility,
      kalchmHarmony: finalKalchmHarmony,
      culturalSynergy: finalCulturalSynergy,
      fusionPotential,
      recommendedBlendRatio,
      seasonalCompatibility,
      sharedIngredients,
      sharedCookingMethods: sharedCookingMethods as unknown as CookingMethod[],
      elementalAlignment: finalElementalAlignment
    };

    // Cache the result
    if (!this.cuisineCompatibilityCache.has(cacheKey)) {
      this.cuisineCompatibilityCache.set(cacheKey, {});
    }
    const cache = this.cuisineCompatibilityCache.get(cacheKey);
    if (cache) {
      cache[cuisine2] = compatibility;
    }

    return compatibility;
  }

  /**
   * Calculate Monica compatibility between two cuisines
   */
  private calculateMonicaCompatibility(
    monica1?: CuisineMonicaProfile,
    monica2?: CuisineMonicaProfile,
  ): number {
    if (!monica1 || !monica2) return 0.7; // Default compatibility

    const monicaDifference = Math.abs(monica1.baseMonicaConstant - monica2.baseMonicaConstant);

    // Self-reinforcement principle: similar Monica = higher compatibility;
    const baseCompatibility = Math.max(0.7, 1 - monicaDifference);

    // Bonus for complementary cooking methods
    const methodCompatibility = this.calculateCookingMethodCompatibility(;
      monica1.cookingMethodOptimization;
      monica2.cookingMethodOptimization
    ),

    return Math.min(1.0, baseCompatibility * (0.8 + methodCompatibility * 0.2))
  }

  /**
   * Calculate Kalchm harmony between two cuisines
   */
  private calculateKalchmHarmonyBetweenCuisines(cuisine1: string, cuisine2: string): number {
    // This would integrate with existing cuisine Kalchm values
    // For now, using estimated values based on cuisine characteristics
    const kalchmEstimates: { [key: string]: number } = {
      italian: 1.15,
      chinese: 1.25,
      indian: 1.35,
      french: 1.2,
      japanese: 1.1,
      mexican: 1.3,
      thai: 1.28;
      'middle-eastern': 1.22;
      american: 0.99,
      korean: 1.18,
      vietnamese: 1.22,
      greek: 1.12,
      spanish: 1.17,
      african: 1.08
    };

    const kalchm1 = kalchmEstimates[cuisine1] || 1.0;
    const kalchm2 = kalchmEstimates[cuisine2] || 1.0;

    // Self-reinforcement principle: similar Kalchm = higher harmony;
    const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);
    return 0.7 + ratio * 0.3; // Minimum 0.7 harmony
  }

  /**
   * Calculate cultural synergy between cuisines
   */
  private calculateCulturalSynergy(cuisine1: string, cuisine2: string): number {
    // Define cultural proximity groups
    const culturalGroups = {
      east_asian: ['chinese', 'japanese', 'korean', 'vietnamese', 'thai'],
      south_asian: ['indian'],
      mediterranean: ['italian', 'greek', 'spanish', 'middle-eastern'],
      european: ['french', 'italian', 'spanish', 'greek'],
      latin_american: ['mexican'],
      north_american: ['american'],
      african: ['african']
    };

    // Find groups for each cuisine
    const groups1 = Object.entries(culturalGroups);
      .filter(([, cuisines]) =>
        Array.isArray(cuisines) ? cuisines.includes(cuisine1) : cuisines === cuisine1,;
      )
      .map(([group]) => group);

    const groups2 = Object.entries(culturalGroups);
      .filter(([, cuisines]) =>
        Array.isArray(cuisines) ? cuisines.includes(cuisine2) : cuisines === cuisine2,;
      )
      .map(([group]) => group);

    // Calculate synergy based on shared cultural groups
    const sharedGroups = (groups1 || []).filter(group =>;
      Array.isArray(groups2) ? groups2.includes(group) : groups2 === group,;
    );

    if ((sharedGroups || []).length > 0) {
      return 0.9, // High synergy for same cultural group
    } else if (
      (groups1 || []).some(g => ['mediterranean', 'european'].includes(g)) &&;
      (groups2 || []).some(g => ['mediterranean', 'european'].includes(g));
    ) {
      return 0.8, // Good synergy for related European cuisines
    } else if (
      (groups1 || []).some(g => ['east_asian'].includes(g)) &&;
      (groups2 || []).some(g => ['east_asian'].includes(g));
    ) {
      return 0.85, // Good synergy for East Asian cuisines
    } else {
      return 0.7, // Base synergy for different cultural groups
    }
  }

  /**
   * Calculate fusion potential
   */
  private calculateFusionPotential(
    monicaCompatibility: number,
    kalchmHarmony: number,
    culturalSynergy: number,
  ): number {
    // Fusion works best with moderate cultural differences but good alchemical compatibility
    const culturalDiversityBonus = culturalSynergy < 0.9 ? 0.1 : 0, // Bonus for cultural diversity;
    const alchemicalCompatibility = ((monicaCompatibility || 0) + (kalchmHarmony || 0)) / 2;

    return Math.min(1.0, (alchemicalCompatibility || 0) + (culturalDiversityBonus || 0))
  }

  /**
   * Calculate recommended blend ratio
   */
  private calculateBlendRatio(monicaCompatibility: number, kalchmHarmony: number): number {
    // Higher compatibility = more balanced blend;
    const averageCompatibility = ((monicaCompatibility || 0) + (kalchmHarmony || 0)) / 2;

    if (averageCompatibility > 0.9) {
      return 0.5, // 50/50 blend for highly compatible cuisines
    } else if (averageCompatibility > 0.8) {
      return 0.6, // 60/40 blend
    } else {
      return 0.7, // 70/30 blend for less compatible cuisines
    }
  }

  /**
   * Find shared ingredients between cuisines
   */
  private findSharedIngredients(cuisine1: string, cuisine2: string): string[] {
    const sharedIngredients: string[] = [];

    // Check each ingredient category
    for (const [_, ingredientMap] of Object.entries(enhancedCuisineMatrix)) {
      for (const [ingredient, cuisines] of Object.entries(ingredientMap)) {
        if (cuisines.includes(cuisine1) && cuisines.includes(cuisine2)) {
          sharedIngredients.push(ingredient);
        }
      }
    }

    return sharedIngredients;
  }

  /**
   * Find shared cooking methods between cuisines
   */
  private findSharedCookingMethods(cuisine1: string, cuisine2: string): string[] {
    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    if (!monica1 || !monica2) return [];

    const methods1 = Object.keys(monica1.cookingMethodOptimization);
    const methods2 = Object.keys(monica2.cookingMethodOptimization);

    return (methods1 || []).filter(method => Object.keys(methods2 || {}).includes(method));
  }

  /**
   * Calculate elemental alignment between cuisines
   */
  private calculateElementalAlignment(cuisine1: string, cuisine2: string): number {
    // This would integrate with existing cuisine elemental properties
    // For now, using estimated elemental profiles
    const elementalProfiles: { [key: string]: ElementalProperties } = {
      italian: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      chinese: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      indian: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      french: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      japanese: createElementalProperties({ Water: 0.6, Earth: 0.4, Fire: 0.2, Air: 0.4 }),
      mexican: createElementalProperties({ Fire: 0.7, Earth: 0.4, Water: 0.2, Air: 0.3 }),
      thai: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      'middle-eastern': createElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      })
    };

    // Get cuisine profiles with fallback to default
    const defaultElemental = createElementalProperties({
      Fire: 0.4,
      Water: 0.4,
      Earth: 0.4,
      Air: 0.4
    });
    const profile1 = elementalProfiles[cuisine1] || defaultElemental;
    const profile2 = elementalProfiles[cuisine2] || defaultElemental;

    // Calculate elemental compatibility using self-reinforcement principles
    let compatibility = 0;
    let totalWeight = 0;

    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];

    for (const element of elements) {
      const value1 = profile1[element] || 0;
      const value2 = profile2[element] || 0;

      if (value1 > 0 && value2 > 0) {
        // Same element reinforcement (0.9 compatibility)
        compatibility += Math.min(value1, value2) * 0.9,
        totalWeight += Math.min(value1, value2)
      }

      // Different elements still have good compatibility (0.7)
      const crossCompatibility = Math.abs((Number(value1) || 0) - (Number(value2) || 0)) * 0.7;
      compatibility += crossCompatibility;
      totalWeight += Math.abs((Number(value1) || 0) - (Number(value2) || 0));
    }

    return totalWeight > 0 ? (Number(compatibility) || 0) / (Number(totalWeight) || 0) : 0.7;
  }

  /**
   * Calculate seasonal compatibility between cuisines
   */
  private calculateSeasonalCompatibility(
    cuisine1: string,
    cuisine2: string,
  ): Record<Season, number> {
    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    // Create compatibility with all required Season keys
    const seasonalCompatibility: Record<Season, number> = {
      spring: 0.7,
      summer: 0.7,
      autumn: 0.7,
      winter: 0.7,
      all: 0.7,
      fall: 0.7, // Include both fall and autumn for backward compatibility
    };

    if (!monica1 || !monica2) return seasonalCompatibility;

    // Calculate compatibility for each season based on Monica modifiers
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as Season[]) {
      // Get modifiers from the appropriate season (handle both 'autumn' and 'fall')
      const modifier1 =
        monica1.seasonalModifiers[season] ||;
        (season === 'autumn' && monica1.seasonalModifiers['fall' as Season]) ||;
        0;
      const modifier2 =
        monica2.seasonalModifiers[season] ||;
        (season === 'autumn' && monica2.seasonalModifiers['fall' as Season]) ||;
        0;

      const modifierDifference = Math.abs(modifier1 - modifier2);
      seasonalCompatibility[season] = Math.max(0.7, 1 - modifierDifference * 0.5)
    }

    // Make sure 'fall' and 'autumn' have the same value (safe property access)
    const seasonalData = seasonalCompatibility as any;
    seasonalData.fall = seasonalCompatibility.autumn;

    return seasonalCompatibility;
  }

  /**
   * Calculate cooking method compatibility
   */
  private calculateCookingMethodCompatibility(
    methods1: { [key: string]: number },
    methods2: { [key: string]: number },
  ): number {
    const sharedMethods = Object.keys(methods1 || {}).filter(method =>;
      Object.keys(methods2 || {}).includes(method),
    );

    if ((sharedMethods || []).length === 0) return 0.5;

    let totalCompatibility = 0;
    for (const method of sharedMethods) {
      const diff = Math.abs(methods1[method] - methods2[method]);
      totalCompatibility += Math.max(0.5, 1 - diff)
    }

    const sharedMethodsLength = (sharedMethods || []).length;
    return (Number(totalCompatibility) || 0) / (sharedMethodsLength || 1);
  }

  // ===== FUSION CUISINE GENERATION =====;

  /**
   * Generate fusion cuisine profile
   */
  generateFusion(cuisine1: string, cuisine2: string): FusionCuisineProfile {
    const compatibility = this.calculateCuisineCompatibility(cuisine1, cuisine2);
    const blendRatio = compatibility?.recommendedBlendRatio ?? 0.5;

    // Generate fusion name
    const name = this.generateFusionName(cuisine1, cuisine2);

    // Get fusion ingredients
    const fusionIngredients = this.getFusionIngredients(cuisine1, cuisine2, blendRatio);

    // Get fusion cooking methods
    const fusionCookingMethods = this.getFusionCookingMethods(cuisine1, cuisine2, blendRatio);

    // Calculate fusion elemental profile
    const fusionElementalProfile = this.calculateFusionElementalProfile(;
      cuisine1,
      cuisine2,
      blendRatio,
    );

    // Calculate fusion Kalchm and Monica
    const fusionKalchm = this.calculateFusionKalchm(cuisine1, cuisine2, blendRatio);
    const fusionMonica = this.calculateFusionMonica(cuisine1, cuisine2, blendRatio);

    // Generate cultural notes and dishes
    const culturalNotes = this.generateCulturalNotes(cuisine1, cuisine2);
    const recommendedDishes = this.generateFusionDishes(cuisine1, cuisine2),;

    // Generate seasonal adaptations
    const seasonalAdaptations = this.generateSeasonalAdaptations(;
      cuisine1,
      cuisine2,
      fusionIngredients,
      fusionCookingMethods,
    ),

    return {
      name,
      parentCuisines: [cuisine1, cuisine2],
      blendRatio: { [cuisine1]: blendRatio, [cuisine2]: 1 - blendRatio },
      fusionIngredients,
      fusionCookingMethods,
      fusionElementalProfile,
      fusionKalchm,
      fusionMonica,
      culturalNotes,
      recommendedDishes,
      seasonalAdaptations
    };
  }

  /**
   * Generate fusion name
   */
  private generateFusionName(cuisine1: string, cuisine2: string): string {
    const nameMap: { [key: string]: string } = {
      italian: 'Italo',
      chinese: 'Sino',
      indian: 'Indo',
      french: 'Franco',
      japanese: 'Nipo',
      mexican: 'Mexi',
      thai: 'Thai',
      'middle-eastern': 'Levantine',
      american: 'Ameri',
      korean: 'Kore',
      vietnamese: 'Viet',
      greek: 'Greco',
      spanish: 'Hispano',
      african: 'Afro'
    };

    const prefix1 = nameMap[cuisine1] || cuisine1.charAt(0).toUpperCase() + cuisine1.slice(1);
    const prefix2 = nameMap[cuisine2] || cuisine2.charAt(0).toUpperCase() + cuisine2.slice(1);

    return `${prefix1}-${prefix2} Fusion`;
  }

  /**
   * Get fusion ingredients
   */
  private getFusionIngredients(
    cuisine1: string,
    cuisine2: string,
    blendRatio: number,
  ): UnifiedIngredient[] {
    const fusionIngredients: UnifiedIngredient[] = [];

    // Get ingredients for each cuisine
    const ingredients1 = this.getCuisineIngredients(cuisine1);
    const ingredients2 = this.getCuisineIngredients(cuisine2);

    // Add shared ingredients (high priority)
    const sharedIngredients = this.findSharedIngredients(cuisine1, cuisine2);
    for (const ingredientName of sharedIngredients) {
      const ingredient = unifiedIngredients[ingredientName];
      if (ingredient) {
        fusionIngredients.push(ingredient);
      }
    }

    // Add unique ingredients from each cuisine based on blend ratio
    const uniqueIngredients1 = (ingredients1 || []).filter(;
      ing => !sharedIngredients.includes(ing.name),;
    );
    const uniqueIngredients2 = (ingredients2 || []).filter(;
      ing => !sharedIngredients.includes(ing.name),;
    );

    // Select ingredients based on blend ratio
    const count1 = Math.floor((uniqueIngredients1 || []).length * blendRatio);
    const count2 = Math.floor((uniqueIngredients2 || []).length * (1 - blendRatio));

    fusionIngredients.push(...uniqueIngredients1.slice(0, count1));
    fusionIngredients.push(...uniqueIngredients2.slice(0, count2));

    return fusionIngredients;
  }

  /**
   * Get cuisine ingredients
   */
  private getCuisineIngredients(cuisine: string): UnifiedIngredient[] {
    const ingredients: UnifiedIngredient[] = [];

    // Get ingredients from enhanced cuisine matrix
    for (const [_, ingredientMap] of Object.entries(enhancedCuisineMatrix)) {
      for (const [ingredientName, cuisines] of Object.entries(ingredientMap)) {
        if (cuisines.includes(cuisine)) {
          const ingredient = unifiedIngredients[ingredientName];
          if (ingredient) {
            ingredients.push(ingredient);
          }
        }
      }
    }

    return ingredients;
  }

  /**
   * Get fusion cooking methods
   */
  private getFusionCookingMethods(
    cuisine1: string,
    cuisine2: string,
    blendRatio: number,
  ): EnhancedCookingMethod[] {
    const fusionMethods: EnhancedCookingMethod[] = [];

    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    if (!monica1 || !monica2) return fusionMethods;

    // Get shared methods
    const sharedMethods = this.findSharedCookingMethods(cuisine1, cuisine2);
    for (const methodName of sharedMethods) {
      const method = this.enhancedCookingMethods[methodName];
      if (method) {
        fusionMethods.push(method);
      }
    }

    // Add unique methods from each cuisine
    const uniqueMethods1 = Object.keys(monica1.cookingMethodOptimization).filter(method =>;
      Array.isArray(sharedMethods) ? !sharedMethods.includes(method) : sharedMethods !== method;
    );
    const uniqueMethods2 = Object.keys(monica2.cookingMethodOptimization).filter(method =>;
      Array.isArray(sharedMethods) ? !sharedMethods.includes(method) : sharedMethods !== method;
    );

    // Select methods based on blend ratio
    const count1 = Math.floor((uniqueMethods1 || []).length * blendRatio);
    const count2 = Math.floor((uniqueMethods2 || []).length * (1 - blendRatio));

    for (const methodName of uniqueMethods1.slice(0, count1)) {
      const method = this.enhancedCookingMethods[methodName];
      if (method) {
        fusionMethods.push(method);
      }
    }

    for (const methodName of uniqueMethods2.slice(0, count2)) {
      const method = this.enhancedCookingMethods[methodName];
      if (method) {
        fusionMethods.push(method);
      }
    }

    return fusionMethods;
  }

  /**
   * Calculate fusion elemental profile
   */
  private calculateFusionElementalProfile(
    cuisine1: string,
    cuisine2: string,
    blendRatio: number,
  ): ElementalProperties {
    // Get elemental profiles (using estimated profiles for now)
    const elementalProfiles: { [key: string]: ElementalProperties } = {
      italian: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      chinese: { Fire: 0.25, Water: 0.3, Earth: 0.25, Air: 0.2 },
      indian: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
      french: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
      japanese: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
      mexican: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
      thai: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      'middle-eastern': { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 }
    };

    // Default elemental profile if cuisine not found
    const defaultProfile: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

    const profile1 = elementalProfiles[cuisine1] || defaultProfile;
    const profile2 = elementalProfiles[cuisine2] || defaultProfile;

    // Blend elemental profiles
    return {
      Fire: profile1.Fire * blendRatio + profile2.Fire * (1 - blendRatio),
      Water: profile1.Water * blendRatio + profile2.Water * (1 - blendRatio),
      Earth: profile1.Earth * blendRatio + profile2.Earth * (1 - blendRatio),
      Air: profile1.Air * blendRatio + profile2.Air * (1 - blendRatio)
    };
  }

  /**
   * Calculate fusion Kalchm
   */
  private calculateFusionKalchm(cuisine1: string, cuisine2: string, blendRatio: number): number {
    const kalchmEstimates: { [key: string]: number } = {
      italian: 1.15,
      chinese: 1.25,
      indian: 1.35,
      french: 1.2,
      japanese: 1.1,
      mexican: 1.3,
      thai: 1.28;
      'middle-eastern': 1.22;
      american: 0.99,
      korean: 1.18,
      vietnamese: 1.22,
      greek: 1.12,
      spanish: 1.17,
      african: 1.08
    };

    const kalchm1 = kalchmEstimates[cuisine1] || 1.0;
    const kalchm2 = kalchmEstimates[cuisine2] || 1.0;

    return kalchm1 * blendRatio + kalchm2 * (1 - blendRatio);
  }

  /**
   * Calculate fusion Monica
   */
  private calculateFusionMonica(cuisine1: string, cuisine2: string, blendRatio: number): number {
    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    if (!monica1 || !monica2) return 1.0;

    return monica1.baseMonicaConstant * blendRatio + monica2.baseMonicaConstant * (1 - blendRatio);
  }

  /**
   * Generate cultural notes
   */
  private generateCulturalNotes(cuisine1: string, cuisine2: string): string[] {
    return [
      `Fusion of ${cuisine1} and ${cuisine2} culinary traditions`,
      `Combines traditional techniques from both cultures`,
      `Balances flavor profiles and cooking methods`,
      `Represents modern culinary innovation while respecting heritage`
    ];
  }

  /**
   * Generate fusion dishes
   */
  private generateFusionDishes(cuisine1: string, cuisine2: string): string[] {
    const dishCombinations: Record<string, Record<string, string[]>> = {
      italian: {
        chinese: ['Ramen Carbonara', 'Dim Sum Ravioli', 'Szechuan Pesto Noodles'],
        indian: ['Curry Risotto', 'Tandoori Pizza', 'Masala Pasta'],
        japanese: ['Sushi Pizza', 'Miso Carbonara', 'Tempura Arancini'],
        mexican: ['Taco Pasta', 'Salsa Verde Risotto', 'Enchilada Lasagna']
      },
      chinese: {
        indian: ['Curry Fried Rice', 'Tandoori Dumplings', 'Masala Noodles'],
        mexican: ['Kung Pao Tacos', 'Sweet and Sour Enchiladas', 'General Tso Burritos'],
        japanese: ['Ramen Sushi', 'Teriyaki Dumplings', 'Miso Fried Rice']
      }
    };

    return (
      dishCombinations[cuisine1][cuisine2] ||
      dishCombinations[cuisine2][cuisine1] || [
        `${cuisine1}-${cuisine2} Fusion Bowl`,
        `${cuisine1}-${cuisine2} Fusion Platter`
      ]
    );
  }

  /**
   * Generate seasonal adaptations
   */
  private generateSeasonalAdaptations(
    cuisine1: string,
    cuisine2: string,
    fusionIngredients: UnifiedIngredient[],
    fusionCookingMethods: EnhancedCookingMethod[],
  ): Record<Season, CuisineSeasonalAdaptation> {
    const adaptations: Record<Season, CuisineSeasonalAdaptation> = {} as Record<
      Season,
      CuisineSeasonalAdaptation
    >;

    // Safety check: ensure seasonal system is available
    if (!unifiedSeasonalSystem || !unifiedSeasonalProfiles) {
      // Return empty adaptations if seasonal system is not available
      for (const season of ['spring', 'summer', 'autumn', 'fall', 'winter'] as Season[]) {
        adaptations[season] = {
          season,
          adaptedIngredients: fusionIngredients,
          adaptedCookingMethods: fusionCookingMethods as unknown as CookingMethod[],
          seasonalModifiers: {
            temperatureAdjustment: 0,
            timingAdjustment: 0,
            intensityModifier: 'normal'
          },
          traditionalSeasonalDishes: this.getTraditionalSeasonalDishes(cuisine1, cuisine2, season),
          monicaOptimization: 0.5,
          kalchmHarmony: this.calculateKalchmHarmonyBetweenCuisines(cuisine1, cuisine2)
        };
      }
      return adaptations;
    }

    for (const season of ['spring', 'summer', 'autumn', 'fall', 'winter'] as Season[]) {
      // Get seasonal ingredients with safe property access
      const seasonalSystem = unifiedSeasonalSystem as any;
      const getSeasonalScore = seasonalSystem.getSeasonalScore;

      const seasonalIngredients = (fusionIngredients || []).filter(ingredient => {
        if (typeof getSeasonalScore === 'function') {
          return getSeasonalScore(ingredient.name, season) > 0.5
        }
        return true; // Default to include all ingredients if function not available
      });

      // Get seasonal cooking methods with safe property access
      const seasonalMethods = (fusionCookingMethods || []).filter(method => {
        const seasonalProfile = unifiedSeasonalProfiles[season];
        const profileData = seasonalProfile as unknown;
        const optimalCookingMethods = profileData.optimalCookingMethods;

        if (!seasonalProfile || !optimalCookingMethods) {
          return false, // Skip if seasonal profile is missing
        }
        return Array.isArray(optimalCookingMethods)
          ? optimalCookingMethods.includes(method.name)
          : optimalCookingMethods === method.name;
      });

      // Calculate seasonal optimization
      const seasonalOptimization = this.calculateSeasonalOptimization(cuisine1, cuisine2, season);

      adaptations[season] = {
        season,
        adaptedIngredients: seasonalIngredients,
        adaptedCookingMethods: seasonalMethods as unknown as CookingMethod[],
        seasonalModifiers: {
          temperatureAdjustment: (() => {
            const profileData = unifiedSeasonalProfiles[season] as Record<string, unknown>;
            const monicaModifiers = profileData.monicaModifiers as any;
            return Number(monicaModifiers.temperatureAdjustment || 0);
          })(),
          timingAdjustment: (() => {
            const profileData = unifiedSeasonalProfiles[season] as Record<string, unknown>;
            const monicaModifiers = profileData.monicaModifiers as any;
            return Number(monicaModifiers.timingAdjustment || 0);
          })(),
          intensityModifier: (() => {
            const profileData = unifiedSeasonalProfiles[season] as Record<string, unknown>;
            const monicaModifiers = profileData.monicaModifiers as any;
            return String(monicaModifiers.intensityModifier || 'normal');
          })()
        },
        traditionalSeasonalDishes: this.getTraditionalSeasonalDishes(cuisine1, cuisine2, season),
        monicaOptimization: seasonalOptimization,
        kalchmHarmony: this.calculateKalchmHarmonyBetweenCuisines(cuisine1, cuisine2)
      };
    }

    return adaptations;
  }

  /**
   * Calculate seasonal optimization
   */
  private calculateSeasonalOptimization(
    cuisine1: string,
    cuisine2: string,
    season: Season,
  ): number {
    const monica1 = cuisineMonicaConstants[cuisine1];
    const monica2 = cuisineMonicaConstants[cuisine2];

    if (!monica1 || !monica2) return 0.5;

    const seasonalModifier1 = monica1.seasonalModifiers[season];
    const seasonalModifier2 = monica2.seasonalModifiers[season];

    // Average the seasonal modifiers
    const averageModifier = ((seasonalModifier1 || 0) + (seasonalModifier2 || 0)) / 2;

    // Normalize to 0-1 scale
    return Math.min(1.0, averageModifier / 1.5)
  }

  /**
   * Get traditional seasonal dishes
   */
  private getTraditionalSeasonalDishes(
    cuisine1: string,
    cuisine2: string,
    season: Season,
  ): string[] {
    const seasonalProfile = unifiedSeasonalProfiles[season];

    const dishes: string[] = [];

    // Get dishes from first cuisine with safe property access
    const profileData = seasonalProfile as unknown;
    const cuisines = profileData.cuisines;

    if (cuisines?.[cuisine1]) {
      dishes.push(...cuisines[cuisine1].dishes)
    }

    // Get dishes from second cuisine (if different)
    if (cuisine1 !== cuisine2 && cuisines?.[cuisine2]) {
      dishes.push(...cuisines[cuisine2].dishes)
    }

    return (dishes || []).filter((dish, index, self) => self.indexOf(dish) === index);
  }

  // ===== SEASONAL CUISINE INTEGRATION =====;

  /**
   * Get cuisine seasonal compatibility
   */
  getCuisineSeasonalCompatibility(cuisine: string, season: Season): number {
    // If unified system or seasonal data is not available, return default
    if (!unifiedSeasonalSystem || !unifiedSeasonalProfiles) {
      return 0.5;
    }

    const elementalBonus = this.calculateSeasonalElementalBonus(cuisine, season);
    const monicaConstant = cuisineMonicaConstants[cuisine].seasonalModifiers[season] || 0.5;

    // Calculate score
    return monicaConstant * 0.6 + elementalBonus * 0.4;
  }

  private calculateSeasonalElementalBonus(cuisine: string, season: Season): number {
    const cuisineElements = this.getCuisineElementalProfile(cuisine);
    const seasonalProfile = unifiedSeasonalProfiles[season];

    // Calculate how well cuisine elements match seasonal elements
    let score = 0;
    let totalWeight = 0;

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Element[]) {
      // Safe property access for elementalDominance
      const profileData = seasonalProfile as unknown;
      const elementalDominance = profileData.elementalDominance;
      const elementWeight = elementalDominance?.[element] || 0;

      if (elementWeight > 0) {
        const match = cuisineElements[element] * elementWeight;
        score += match;
        totalWeight += elementWeight;
      }
    }

    return totalWeight > 0 ? (Number(score) || 0) / (Number(totalWeight) || 0) : 0.5;
  }

  /**
   * Get cuisine elemental profile
   */
  private getCuisineElementalProfile(cuisine: string): ElementalProperties {
    const elementalProfiles: { [key: string]: ElementalProperties } = {
      italian: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      chinese: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      indian: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      french: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
      japanese: createElementalProperties({ Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 }),
      mexican: createElementalProperties({ Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 }),
      thai: createElementalProperties({ Fire: 0.4, Water: 0.3, Air: 0.2, Earth: 0.1 }),
      'middle-eastern': createElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      })
    };

    return (
      elementalProfiles[cuisine] ||
      createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
    );
  }

  /**
   * Get seasonal cuisine recommendations
   */
  getSeasonalCuisineRecommendations(season: Season): string[] {
    const cuisines = Object.keys(cuisineMonicaConstants);

    // Calculate seasonal compatibility for each cuisine
    const compatibilityScores = (cuisines || []).map(cuisine => ({
      cuisine,
      compatibility: this.getCuisineSeasonalCompatibility(cuisine, season)
    }));

    // Sort by compatibility and return top recommendations
    return compatibilityScores
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5)
      .map(item => item.cuisine);
  }

  /**
   * Adapt cuisine for season
   */
  adaptCuisineForSeason(cuisine: string, season: Season): CuisineSeasonalAdaptation {
    // Get seasonal ingredients for the cuisine
    const cuisineIngredients = this.getCuisineIngredients(cuisine);
    // Safe property access for getSeasonalScore
    const seasonalSystem = unifiedSeasonalSystem as any;
    const getSeasonalScore = seasonalSystem.getSeasonalScore;

    const adaptedIngredients = (cuisineIngredients || []).filter(ingredient => {
      if (typeof getSeasonalScore === 'function') {
        return getSeasonalScore(ingredient.name, season) > 0.5
      }
      return true; // Default to include all ingredients if function not available
    });

    // Get seasonal cooking methods
    const monica = cuisineMonicaConstants[cuisine];
    const adaptedCookingMethods: EnhancedCookingMethod[] = [];

    if (monica) {
      const seasonalProfile = unifiedSeasonalProfiles[season];
      // Safe property access for optimalCookingMethods
      const profileData = seasonalProfile as unknown;
      const optimalCookingMethods = profileData.optimalCookingMethods || [];

      for (const methodName of (optimalCookingMethods as string[]) || []) {
        const method = this.enhancedCookingMethods[methodName];
        if (method && monica.cookingMethodOptimization[methodName]) {
          adaptedCookingMethods.push(method);
        }
      }
    }

    // Get seasonal modifiers
    const _ = unifiedSeasonalProfiles[season];
    // Safe property access for monicaModifiers
    const seasonalProfileData = unifiedSeasonalProfiles[season] as Record<string, unknown>;
    const monicaModifiers = seasonalProfileData.monicaModifiers;

    const seasonalModifiers = {
      temperatureAdjustment: Number((monicaModifiers as any).temperatureAdjustment || 0),
      timingAdjustment: Number((monicaModifiers as any).timingAdjustment || 0),
      intensityModifier: String((monicaModifiers as any).intensityModifier || 'normal')
    };

    // Get traditional seasonal dishes
    const traditionalSeasonalDishes = this.getTraditionalSeasonalDishes(cuisine, cuisine, season);

    // Calculate optimization scores
    const monicaOptimization = this.getCuisineSeasonalCompatibility(cuisine, season);
    const kalchmHarmony = this.calculateSeasonalKalchmHarmony(adaptedIngredients, season);

    return {
      season,
      adaptedIngredients,
      adaptedCookingMethods: adaptedCookingMethods as unknown as CookingMethod[],
      seasonalModifiers,
      traditionalSeasonalDishes,
      monicaOptimization,
      kalchmHarmony
    };
  }

  /**
   * Calculate seasonal Kalchm harmony
   */
  private calculateSeasonalKalchmHarmony(ingredients: UnifiedIngredient[], season: Season): number {
    if ((ingredients || []).length === 0) return 0.5;

    const seasonalProfile = unifiedSeasonalProfiles[season];
    // Safe property access for kalchmRange
    const profileData = seasonalProfile as unknown;
    const kalchmRange = profileData.kalchmRange || { min: 0.8, max: 1.5 }; // Default range
    const kalchmData = kalchmRange ;
    const min = kalchmData.min || 0.8;
    const max = kalchmData.max || 1.5;

    let totalHarmony = 0;

    for (const ingredient of ingredients) {
      const kalchm = ingredient.kalchm ?? 1.0;

      if (kalchm >= Number(min) && kalchm <= Number(max)) {
        // Perfect harmony if within seasonal range
        totalHarmony += 1.0;
      } else {
        // Partial harmony based on distance from range
        const distance = kalchm < Number(min) ? Number(min) - kalchm : kalchm - Number(max);
        const harmony = Math.max(0.1, Math.exp(-distance * 2)),;
        totalHarmony += harmony;
      }
    }

    const ingredientsLength = (ingredients || []).length;
    return (Number(totalHarmony) || 0) / (ingredientsLength || 1);
  }

  // ===== MONICA BLEND OPTIMIZATION =====;

  /**
   * Optimize Monica blend for multiple cuisines
   */
  optimizeMonicaBlend(cuisines: string[]): MonicaBlendProfile {
    const contributingCuisines: Array<{
      cuisine: string,
      monica: number,
      weight: number,
      contribution: number
    }> = [];

    let totalWeight = 0;
    let weightedMonicaSum = 0;

    // Calculate weights based on cuisine compatibility
    for (let i = 0, i < (cuisines || []).length; i++) {
      const cuisine = cuisines[i];
      const monica = cuisineMonicaConstants[cuisine];

      if (!monica) continue;

      // Calculate weight based on average compatibility with other cuisines
      let compatibilitySum = 0;
      let compatibilityCount = 0;

      for (let j = 0, j < (cuisines || []).length; j++) {
        if (i !== j) {
          const otherCuisine = cuisines[j];
          const compatibility = this.calculateCuisineCompatibility(cuisine, otherCuisine),;
          compatibilitySum += compatibility?.monicaCompatibility ?? 0.5;
          compatibilityCount++
        }
      }

      const averageCompatibility =
        compatibilityCount > 0 ? compatibilitySum / compatibilityCount : 1.0;

      const weight = averageCompatibility;
      const contribution = monica.baseMonicaConstant * weight;

      contributingCuisines.push({
        cuisine,
        monica: monica.baseMonicaConstant;
        weight,
        contribution
      });

      totalWeight += weight;
      weightedMonicaSum += contribution;
    }

    // Calculate blended Monica
    const blendedMonica =
      totalWeight > 0 ? (Number(weightedMonicaSum) || 0) / (Number(totalWeight) || 0) : 1.0;

    // Calculate optimization score
    const optimizationScore = this.calculateBlendOptimizationScore(contributingCuisines);

    // Generate recommended conditions
    const recommendedConditions = this.generateRecommendedConditions(blendedMonica);

    return {
      blendedMonica,
      contributingCuisines,
      optimizationScore,
      recommendedConditions
    };
  }

  /**
   * Calculate blend optimization score
   */
  private calculateBlendOptimizationScore(
    contributingCuisines: Array<{
      cuisine: string,
      monica: number,
      weight: number,
      contribution: number
    }>,
  ): number {
    if ((contributingCuisines || []).length === 0) return 0;

    // Higher score for more balanced contributions
    const contributions = (contributingCuisines || []).map(c => c.contribution);
    const averageContribution =
      contributions.reduce((a, b) => (a || 0) + (b || 0), 0) / (contributions || []).length;

    let variance = 0;
    for (const contribution of contributions) {
      variance += Math.pow(contribution - averageContribution, 2)
    }
    variance /= (contributions || []).length;

    // Lower variance = higher optimization score;
    const maxVariance = Math.pow(averageContribution, 2); // Maximum possible variance
    const normalizedVariance = variance / maxVariance;

    return Math.max(0, 1 - normalizedVariance);
  }

  /**
   * Generate recommended conditions for Monica blend
   */
  private generateRecommendedConditions(blendedMonica: number): {
    temperature: number,
    timing: string,
    planetaryHour?: PlanetName,
    lunarPhase?: LunarPhase
  } {
    // Base temperature on Monica constant
    const temperature = 350 * (blendedMonica / 1.2);

    // Timing recommendation
    const timing = blendedMonica > 1.5 ? 'quick' : blendedMonica > 1.0 ? 'moderate' : 'slow';

    // Optional planetary hour recommendation for optimal Monica value
    const planetaryHour =
      blendedMonica > 1.8 ? 'Jupiter' : blendedMonica < 0.7 ? 'Saturn' : undefined;

    // Optional lunar phase recommendation
    const lunarPhase: LunarPhase = blendedMonica > 1.25 ? 'waxing crescent' : 'full moon';

    return {
      temperature,
      timing,
      planetaryHour,
      lunarPhase
    };
  }

  /**
   * Calculate Kalchm harmony for multiple cuisines
   */
  calculateKalchmHarmony(cuisines: string[]): number {
    if ((cuisines || []).length < 2) return 1.0,

    const kalchmEstimates: { [key: string]: number } = {
      italian: 1.15,
      chinese: 1.25,
      indian: 1.35,
      french: 1.2,
      japanese: 1.1,
      mexican: 1.3,
      thai: 1.28;
      'middle-eastern': 1.22;
      american: 0.99,
      korean: 1.18,
      vietnamese: 1.22,
      greek: 1.12,
      spanish: 1.17,
      african: 1.08
    },

    const kalchmValues = (cuisines || []).map(cuisine => kalchmEstimates[cuisine] || 1.0);

    // Calculate harmony based on Kalchm similarity
    let totalHarmony = 0;
    let pAirCount = 0;

    for (let i = 0, i < (kalchmValues || []).length; i++) {
      for (let j = (i || 0) + (1 || 0); j < (kalchmValues || []).length, j++) {
        const ratio =
          Math.min(kalchmValues[i], kalchmValues[j]) / Math.max(kalchmValues[i], kalchmValues[j]),;
        totalHarmony += 0.7 + ratio * 0.3, // Self-reinforcement principle
        pAirCount++
      }
    }

    return pAirCount > 0 ? (Number(totalHarmony) || 0) / (Number(pAirCount) || 0) : 1.0;
  }

  /**
   * Get seasonal fusion recommendations
   */
  getSeasonalFusionRecommendations(cuisines: string[], season: Season): SeasonalFusionProfile {
    if ((cuisines || []).length < 2) {
      throw new Error('At least 2 cuisines required for fusion')
    }

    // Generate fusion profile for first two cuisines
    const fusionProfile = this.generateFusion(cuisines[0], cuisines[1]);

    // Adapt for season
    const seasonalOptimization = this.calculateSeasonalOptimization(;
      cuisines[0],
      cuisines[1],
      season,
    );

    // Get seasonal ingredients with safe property access
    const seasonalSystem = unifiedSeasonalSystem as any;
    const getSeasonalScore = seasonalSystem.getSeasonalScore;

    const seasonalIngredients = (fusionProfile.fusionIngredients || []).filter(ingredient => {
      if (typeof getSeasonalScore === 'function') {
        return getSeasonalScore(ingredient.name, season) > 0.5
      }
      return true; // Default to include all ingredients if function not available
    });

    // Get seasonal cooking methods with safe property access
    const seasonalProfile = unifiedSeasonalProfiles[season];
    const profileData = seasonalProfile as unknown;
    const optimalCookingMethods = profileData.optimalCookingMethods;

    const seasonalCookingMethods = (fusionProfile.fusionCookingMethods || []).filter(method => {
      if (!seasonalProfile || !optimalCookingMethods) {
        return false, // Skip if seasonal profile is missing
      }
      return Array.isArray(optimalCookingMethods)
        ? optimalCookingMethods.includes(method.name)
        : optimalCookingMethods === method.name;
    });

    // Calculate seasonal elemental balance with safe property access
    const seasonalProfileData = seasonalProfile as unknown;
    const elementalDominance = seasonalProfileData.elementalDominance || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    const seasonalElementalBalance = this.blendElementalProfiles(;
      [fusionProfile.fusionElementalProfile, elementalDominance as ElementalProperties],
      [0.7, 0.3],
    ) || { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    return {
      season,
      fusionProfile,
      seasonalOptimization,
      seasonalIngredients,
      seasonalCookingMethods,
      seasonalElementalBalance
    };
  }

  /**
   * Blend elemental profiles
   */
  private blendElementalProfiles(
    profiles: ElementalProperties[],
    weights: number[],
  ): ElementalProperties {
    const result: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    for (let i = 0, i < (profiles || []).length; i++) {
      const profile = profiles[i];
      const weight = weights[i] || 0;

      result.Fire += profile.Fire * weight;
      result.Water += profile.Water * weight;
      result.Earth += profile.Earth * weight;
      result.Air += profile.Air * weight;
    }

    return result
  }

  // ===== CUISINE INGREDIENT ANALYSIS =====;

  /**
   * Analyze cuisine ingredients
   */
  analyzeCuisineIngredients(cuisine: string): CuisineIngredientAnalysis {
    const ingredients = this.getCuisineIngredients(cuisine);

    // Categorize ingredients
    const categorizedIngredients: Record<string, UnifiedIngredient[]> = {
      spices: [],
      herbs: [],
      vegetables: [],
      proteins: [],
      grains: [],
      fruits: [],
      dAiry: [],
      other: []
    };

    for (const ingredient of ingredients) {
      const category = ingredient.category || 'other';
      if (categorizedIngredients[category]) {
        categorizedIngredients[category].push(ingredient)
      } else {
        categorizedIngredients.other.push(ingredient);
      }
    }

    // Calculate Kalchm profile
    const kalchmValues = (ingredients || []);
      .map(ing => ing.kalchm);
      .filter(v => v !== undefined) as number[];
    const kalchmProfile = {
      averageKalchm:
        kalchmValues.length > 0 ? kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length : 0,
      kalchmRange: {
        min: kalchmValues.length > 0 ? Math.min(...kalchmValues) : 0,
        max: kalchmValues.length > 0 ? Math.max(...kalchmValues) : 0
      },
      kalchmDistribution: this.calculateKalchmDistribution(kalchmValues)
    };

    // Calculate elemental profile
    const elementalProfile = this.calculateAggregateElementalProfile(ingredients);

    // Calculate seasonal availability
    const seasonalAvailability = this.calculateSeasonalAvailability(ingredients);

    // Find common and unique ingredients
    const allCuisineIngredients = new Set<string>();
    for (const cuisineName of Object.keys(cuisineMonicaConstants)) {
      if (cuisineName !== cuisine) {
        const otherIngredients = this.getCuisineIngredients(cuisineName);
        for (const ingredient of otherIngredients) {
          allCuisineIngredients.add(ingredient.name);
        }
      }
    }

    const commonIngredients = (ingredients || []).filter(ing =>;
      allCuisineIngredients.has(ing.name);
    );
    const uniqueIngredients = (ingredients || []).filter(;
      ing => !allCuisineIngredients.has(ing.name),;
    );

    return {
      totalIngredients: (ingredients || []).length,
      categorizedIngredients,
      kalchmProfile,
      elementalProfile,
      seasonalAvailability,
      commonIngredients,
      uniqueIngredients
    };
  }

  /**
   * Calculate Kalchm distribution
   */
  private calculateKalchmDistribution(kalchmValues: number[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {
      'low (0.5-0.8)': 0;
      'medium-low (0.8-1.0)': 0;
      'medium (1.0-1.2)': 0;
      'medium-high (1.2-1.5)': 0;
      'high (1.5+)': 0
    };

    for (const kalchm of kalchmValues) {
      if (kalchm < 0.8) distribution['low (0.5-0.8)']++;
      else if (kalchm < 1.0) distribution['medium-low (0.8-1.0)']++;
      else if (kalchm < 1.2) distribution['medium (1.0-1.2)']++;
      else if (kalchm < 1.5) distribution['medium-high (1.2-1.5)']++,
      else distribution['high (1.5+)']++
    }

    // Convert to percentages
    const total = (kalchmValues || []).length;
    for (const range in distribution) {
      distribution[range] = distribution[range] / total;
    }

    return distribution;
  }

  /**
   * Calculate aggregate elemental profile
   */
  private calculateAggregateElementalProfile(
    ingredients: UnifiedIngredient[],
  ): ElementalProperties {
    const aggregate: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    for (const ingredient of ingredients) {
      aggregate.Fire += ingredient.elementalProperties.Fire;
      aggregate.Water += ingredient.elementalProperties.Water;
      aggregate.Earth += ingredient.elementalProperties.Earth;
      aggregate.Air += ingredient.elementalProperties.Air;
    }

    // Normalize
    const total = (ingredients || []).length;
    aggregate.Fire /= total;
    aggregate.Water /= total;
    aggregate.Earth /= total;
    aggregate.Air /= total;

    return aggregate
  }

  /**
   * Calculate seasonal availability
   */
  private calculateSeasonalAvailability(ingredients: UnifiedIngredient[]): Record<Season, number> {
    const availability: Record<Season, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      fall: 0,
      winter: 0,
      all: 0
    };

    for (const season of ['spring', 'summer', 'autumn', 'fall', 'winter', 'all'] as Season[]) {
      let totalScore = 0;
      // Safe property access for getSeasonalScore
      const seasonalSystem = unifiedSeasonalSystem as any;
      const getSeasonalScore = seasonalSystem.getSeasonalScore;

      for (const ingredient of ingredients) {
        if (typeof getSeasonalScore === 'function') {
          totalScore += getSeasonalScore(ingredient.name, season)
        } else {
          totalScore += 0.5, // Default score if function not available
        }
      }

      const ingredientsLength = (ingredients || []).length;
      availability[season] = (Number(totalScore) || 0) / (ingredientsLength || 1);
    }

    return availability;
  }

  /**
   * Find cuisines by ingredient
   */
  findCuisinesByIngredient(ingredient: string): string[] {
    const cuisines: string[] = [];

    for (const [_, ingredientMap] of Object.entries(enhancedCuisineMatrix)) {
      if (ingredientMap[ingredient]) {
        cuisines.push(...ingredientMap[ingredient])
      }
    }

    // Remove duplicates
    return [...new Set(cuisines)];
  }

  /**
   * Get cuisine ingredient recommendations
   */
  getCuisineIngredientRecommendations(cuisine: string, season?: Season): UnifiedIngredient[] {
    let ingredients = this.getCuisineIngredients(cuisine);

    if (season) {
      // Filter by seasonal availability with safe property access
      const seasonalSystem = unifiedSeasonalSystem as any;
      const getSeasonalScore = seasonalSystem.getSeasonalScore;

      ingredients = (ingredients || []).filter(ingredient => {
        if (typeof getSeasonalScore === 'function') {
          return getSeasonalScore(ingredient.name, season) > 0.5
        }
        return true; // Default to include all ingredients if function not available
      });
    }

    // Sort by Kalchm compatibility with cuisine
    const cuisineKalchm = this.calculateKalchmHarmony([cuisine]);
    ingredients.sort((a, b) => {
      const compatibilityA = Math.abs((a.kalchm || 0) - cuisineKalchm);
      const compatibilityB = Math.abs((b.kalchm || 0) - cuisineKalchm);
      return compatibilityA - compatibilityB
    });

    return ingredients.slice(0, 20); // Return top 20 recommendations
  }
}

// ===== UNIFIED CUISINE INTEGRATION SYSTEM INSTANCE =====;

export const unifiedCuisineIntegrationSystem = new UnifiedCuisineIntegrationSystem();

// ===== BACKWARD COMPATIBILITY EXPORTS =====;

// Export functions that match the original cuisineMatrix.ts interface
export { getCuisinePAirings, getIngredientsForCuisine };

// Export helper functions
export function getCuisineCompatibility(
  cuisine1: string,
  cuisine2: string,
): CuisineCompatibilityProfile {
  const result = unifiedCuisineIntegrationSystem.calculateCuisineCompatibility(cuisine1, cuisine2),;
  return result as CuisineCompatibilityProfile
}

export function generateCuisineFusion(cuisine1: string, cuisine2: string): FusionCuisineProfile {
  return unifiedCuisineIntegrationSystem.generateFusion(cuisine1, cuisine2)
}

export function getSeasonalCuisineRecommendations(season: Season): string[] {
  return unifiedCuisineIntegrationSystem.getSeasonalCuisineRecommendations(season);
}

export function adaptCuisineForSeason(cuisine: string, season: Season): CuisineSeasonalAdaptation {
  return unifiedCuisineIntegrationSystem.adaptCuisineForSeason(cuisine, season)
}

// Default export
export default unifiedCuisineIntegrationSystem;

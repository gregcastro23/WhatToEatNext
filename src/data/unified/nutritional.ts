import type { // ===== UNIFIED NUTRITIONAL SYSTEM =====
// Phase 3 Step 4 of WhatToEatNext Data Consolidation
// Enhances nutritional data with alchemical principles and Monica/Kalchm integration
// Integrates with unified seasonal, cuisine, ingredients, and recipe systems

  Element, 
  ElementalProperties, 
  PlanetName,
  AlchemicalProperties,
  ThermodynamicMetrics,
  CookingMethod,
  LunarPhase } from "@/types/alchemy";
import type { ZodiacSign } from "@/types/zodiac";
import type { Season } from "@/types/seasons";
import type { NutritionalProfile } from "@/types/nutrition";
// TODO: Fix import - add what to import from "./ingredients.ts"
// TODO: Fix import - add what to import from "./seasonal.ts"
import { 
  calculateKalchm, 
  calculateMonica, 
  performAlchemicalAnalysis
} from './alchemicalCalculations';
import { createElementalProperties } from '../../utils/elemental/elementalUtils';

import { AlchemicalProperties } from "@/types/alchemy";

// ===== ENHANCED NUTRITIONAL INTERFACES =====

export interface AlchemicalNutritionalProfile extends NutritionalProfile {
  // Enhanced Alchemical Properties
  alchemicalProperties: AlchemicalProperties;
  kalchm: number;                      // Nutritional Kalchm value
  
  // Elemental Nutritional Mapping
  elementalNutrients: {
    Fire: NutrientGroup;               // Energizing, warming nutrients
    Water: NutrientGroup;              // Cooling, flowing, cleansing nutrients
    Earth: NutrientGroup;              // Grounding, nourishing, stable nutrients
    Air: NutrientGroup;                // Light, uplifting, dispersing nutrients
  };
  
  // Monica-Enhanced Nutritional Optimization
  monicaOptimization: {
    baselineScore: number;             // Base nutritional score
    seasonalModifier: number;          // Seasonal adjustment
    planetaryModifier: number;         // Planetary influence
    cookingMethodModifier: number;     // Cooking method enhancement
    finalOptimizedScore: number;       // Monica-optimized final score
  };
  
  // Astrological Nutritional Correlations
  astrologicalProfile: {
    rulingPlanets: PlanetName[];       // Planets that rule these nutrients
    favorableZodiac: ZodiacSign[];     // Zodiac signs that benefit most
    seasonalPeak: Season[];            // Seasons when these nutrients are most beneficial
    elementalAffinity: ElementalProperties; // Elemental nutritional affinity
  };
  
  // Enhanced Metadata
  metadata: {
    kalchmCalculated: boolean;
    monicaOptimized: boolean;
    lastUpdated: Date;
    sourceData: string[];
  };
}

export interface NutrientGroup {
  macronutrients: { [key: string]: number };    // Protein, carbs, fats, fiber
  micronutrients: { [key: string]: number };    // Vitamins and minerals
  phytonutrients: { [key: string]: number };    // Antioxidants, flavonoids, etc.
  bioactiveCompounds: { [key: string]: number }; // Specialized compounds
  totalElementalValue: number;               // Combined elemental nutritional value
}

export interface NutritionalMonicaModifiers {
  temperatureOptimization: number;     // Temperature-based nutritional optimization
  timingOptimization: number;          // Timing-based absorption optimization
  combinationSynergy: number;          // Nutrient combination synergy
  bioavailabilityBonus: number;        // Enhanced bioavailability
  digestiveHarmony: number;            // Digestive system harmony
}

export interface SeasonalNutritionalProfile {
  season: Season;
  elementalNutritionalFocus: Element;
  priorityNutrients: string[];
  optimalFoods: string[];
  avoidanceFoods: string[];
  kalchmRange: { min: number; max: number };
  monicaModifiers: NutritionalMonicaModifiers;
  biorhythmAlignment: number;
}

export interface PlanetaryNutritionalProfile {
  planet: PlanetName;
  ruledNutrients: string[];
  healthDomains: string[];
  beneficialFoods: string[];
  optimalTimings: string[];
  kalchmResonance: number;
  monicaInfluence: number;
}

export interface ZodiacNutritionalProfile {
  sign: ZodiacSign;
  elementalNeeds: ElementalProperties;
  nutritionalFocus: string[];
  beneficialFoods: string[];
  challengeFoods: string[];
  kalchmCompatibility: number;
  monicaOptimization: number;
}

export interface NutritionalCompatibilityAnalysis {
  kalchmHarmony: number;               // Kalchm-based nutritional harmony// Elemental nutritional balance
  seasonalAlignment: number;           // Seasonal nutritional alignment
  planetaryResonance: number;          // Planetary nutritional resonance
  overallCompatibility: number;        // Combined compatibility score
  recommendations: string[];           // Specific recommendations
}

export interface NutritionalRecommendations {
  ingredients: UnifiedIngredient[];
  nutritionalProfiles: AlchemicalNutritionalProfile[];
  cookingMethods: string[];
  seasonalOptimization: number;
  kalchmHarmony: number;
  monicaOptimization: number;
  healthBenefits: string[];
  warnings: string[];
}

// ===== ALCHEMICAL NUTRITIONAL CATEGORIZATION =====

// Categorize nutrients by alchemical properties (Spirit, Essence, Matter, Substance)
export const alchemicalNutrientMapping: { [key: string]: AlchemicalProperties } = {
  // Spirit Nutrients (Volatile, transformative)
  'vitamin_c': { Spirit: 0.8, Essence: 0.2, Matter: 0.0, Substance: 0.0 },
  'caffeine': { Spirit: 0.9, Essence: 0.1, Matter: 0.0, Substance: 0.0 },
  'capsaicin': { Spirit: 0.7, Essence: 0.3, Matter: 0.0, Substance: 0.0 },
  'volatile_oils': { Spirit: 0.8, Essence: 0.2, Matter: 0.0, Substance: 0.0 },
  // Essence Nutrients (Active principles)
  'antioxidants': { Spirit: 0.3, Essence: 0.7, Matter: 0.0, Substance: 0.0 },
  'flavonoids': { Spirit: 0.2, Essence: 0.8, Matter: 0.0, Substance: 0.0 },
  'omega_3': { Spirit: 0.1, Essence: 0.7, Matter: 0.1, Substance: 0.1 },
  'probiotics': { Spirit: 0.2, Essence: 0.6, Matter: 0.2, Substance: 0.0 },
  'enzymes': { Spirit: 0.2, Essence: 0.8, Matter: 0.0, Substance: 0.0 },
  // Matter Nutrients (Physical structure)
  'protein': { Spirit: 0.0, Essence: 0.3, Matter: 0.7, Substance: 0.0 },
  'fiber': { Spirit: 0.0, Essence: 0.1, Matter: 0.8, Substance: 0.1 },
  'complex_carbs': { Spirit: 0.1, Essence: 0.2, Matter: 0.6, Substance: 0.1 },
  'calcium': { Spirit: 0.0, Essence: 0.0, Matter: 0.7, Substance: 0.3 },
  'iron': { Spirit: 0.0, Essence: 0.2, Matter: 0.7, Substance: 0.1 },
  // Substance Nutrients (Stable, enduring)
  'saturated_fats': { Spirit: 0.0, Essence: 0.1, Matter: 0.2, Substance: 0.7 },
  'minerals': { Spirit: 0.0, Essence: 0.1, Matter: 0.3, Substance: 0.6 },
  'vitamin_d': { Spirit: 0.0, Essence: 0.2, Matter: 0.2, Substance: 0.6 },
  'vitamin_k': { Spirit: 0.0, Essence: 0.2, Matter: 0.3, Substance: 0.5 },
  'magnesium': { Spirit: 0.0, Essence: 0.1, Matter: 0.2, Substance: 0.7 }
};

// Elemental nutritional categorization (Self-Reinforcement Compliant)
export const elementalNutrientMapping: Record<Element, NutrientGroup> = {
  Fire: {
    macronutrients: {
      'protein': 0.8,              // Building, energizing
      'simple_carbs': 0.6,         // Quick energy
      'spicy_compounds': 0.9       // Heating compounds
    },
    micronutrients: {
      'vitamin_b12': 0.8,          // Energy metabolism
      'iron': 0.9,                 // Circulation, energy
      'zinc': 0.7,                 // Immune function
      'vitamin_b6': 0.6            // Protein metabolism
    },
    phytonutrients: {
      'capsaicin': 0.9,            // Heat-generating
      'gingerol': 0.8,             // Warming
      'allicin': 0.7               // Stimulating
    },
    bioactiveCompounds: {
      'caffeine': 0.8,             // Stimulating
      'theobromine': 0.6           // Mild stimulant
    },
    totalElementalValue: 0.75
  },
  
  Water: {
    macronutrients: {
      'Water': 1.0,                // Hydration
      'electrolytes': 0.9,         // Fluid balance
      'omega_3': 0.8               // Flowing, cooling
    },
    micronutrients: {
      'potassium': 0.9,            // Fluid balance
      'sodium': 0.7,               // Electrolyte balance
      'vitamin_c': 0.8,            // Cleansing, immunity
      'folate': 0.6                // Cellular renewal
    },
    phytonutrients: {
      'anthocyanins': 0.8,         // Cooling, anti-inflammatory
      'cucurbitacins': 0.9,        // Cooling compounds
      'menthol': 0.8               // Cooling sensation
    },
    bioactiveCompounds: {
      'mucilage': 0.9,             // Soothing, hydrating
      'pectin': 0.7                // Cleansing
    },
    totalElementalValue: 0.8
  },
  
  Earth: {
    macronutrients: {
      'complex_carbs': 0.9,        // Grounding energy
      'fiber': 0.9,                // Structural support
      'healthy_fats': 0.7          // Stable energy
    },
    micronutrients: {
      'calcium': 0.9,              // Structural support
      'magnesium': 0.8,            // Grounding, calming
      'phosphorus': 0.8,           // Bone structure
      'vitamin_d': 0.7             // Bone health
    },
    phytonutrients: {
      'lignans': 0.8,              // Structural compounds
      'saponins': 0.7,             // Grounding compounds
      'tannins': 0.6               // Stabilizing compounds
    },
    bioactiveCompounds: {
      'sterols': 0.8,              // Structural support
      'cellulose': 0.9             // Fiber structure
    },
    totalElementalValue: 0.8
  },
  
  Air: {
    macronutrients: {
      'volatile_compounds': 0.9,   // Light, dispersing
      'essential_oils': 0.8,       // Aromatic, uplifting
      'simple_sugars': 0.6         // Quick, light energy
    },
    micronutrients: {
      'vitamin_c': 0.8,            // Antioxidant, cleansing
      'b_vitamins': 0.7,           // Mental clarity
      'folate': 0.8,               // Cellular communication
      'thiamine': 0.7              // Nerve function
    },
    phytonutrients: {
      'terpenes': 0.9,             // Aromatic compounds
      'limonene': 0.8,             // Uplifting citrus compounds
      'menthol': 0.7               // Refreshing compounds
    },
    bioactiveCompounds: {
      'alkaloids': 0.8,            // Stimulating compounds
      'phenols': 0.7               // Light antioxidants
    },
    totalElementalValue: 0.75
  }
};

// ===== UNIFIED NUTRITIONAL SYSTEM CLASS =====

export class UnifiedNutritionalSystem {
  private seasonalProfiles: Record<Season, SeasonalNutritionalProfile>;
  private planetaryProfiles: Record<PlanetName, PlanetaryNutritionalProfile>;
  private zodiacProfiles: Record<ZodiacSign, ZodiacNutritionalProfile>;
  
  constructor() {
    this.seasonalProfiles = {} as Record<Season, SeasonalNutritionalProfile>;
    this.planetaryProfiles = {} as Record<PlanetName, PlanetaryNutritionalProfile>;
    this.zodiacProfiles = {} as Record<ZodiacSign, ZodiacNutritionalProfile>;
    
    // Initialize with default profiles in a real implementation
  }
  
  // Calculate elemental balance
  private calculateElementalBalance(profiles?: AlchemicalNutritionalProfile[]): number {
    if (!profiles || profiles.length === 0) return 0;
    
    const totalElementalValues = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    profiles.forEach(profile => {
      (['Fire', 'Water', 'Earth', 'Air'] as Element[]).forEach(element => {
        if (profile?.elementalNutrients?.[element]?.totalElementalValue) {
          totalElementalValues[element] += profile.elementalNutrients[element].totalElementalValue;
        }
      });
    });
    
    const total = Object.values(totalElementalValues).reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    const idealBalance = 0.25;
    const balanceScore = Object.values(totalElementalValues).reduce((score, value) => {
      const proportion = value / total;
      return score + (1 - Math.abs(proportion - idealBalance) / idealBalance);
    }, 0) / 4;
    
    return balanceScore;
  }
  
  /**
   * Calculate seasonal alignment
   */
  private calculateSeasonalAlignment(profiles: AlchemicalNutritionalProfile[], season: Season): number {
    const seasonProfile = this?.seasonalProfiles?.[season];
    let alignmentScore = 0;
    
    (profiles || []).forEach(profile => {
      // Check if profile contains priority nutrients for the season
      const priorityNutrientScore = seasonProfile?.priorityNutrients?.reduce((score, nutrient) => {
        return score + (this.getNutrientValue(profile, nutrient) > 0 ? 1 : 0);
      }, 0) / seasonProfile.priorityNutrients  || [].length;
      
      // Check Kalchm range alignment
      const kalchmAlignment = (profile.kalchm >= seasonProfile.kalchmRange.min && 
                              profile.kalchm <= seasonProfile.kalchmRange.max) ? 1 : 0.5;
      
      alignmentScore += (priorityNutrientScore * 0.7 + kalchmAlignment * 0.3);
    });
    
    return alignmentScore / (profiles || []).length;
  }
  
  /**
   * Calculate planetary resonance
   */
  private calculatePlanetaryResonance(profiles: AlchemicalNutritionalProfile[], planet: PlanetName): number {
    const planetProfile = this?.planetaryProfiles?.[planet];
    let resonanceScore = 0;
    
    (profiles || []).forEach(profile => {
      // Check if profile contains ruled nutrients
      const ruledNutrientScore = planetProfile?.ruledNutrients?.reduce((score, nutrient) => {
        return score + (this.getNutrientValue(profile, nutrient) > 0 ? 1 : 0);
      }, 0) / planetProfile.ruledNutrients  || [].length;
      
      // Check Kalchm resonance
      const kalchmResonance = Math.abs(profile.kalchm - planetProfile.kalchmResonance) <= 0.2 ? 1 : 0.5;
      
      resonanceScore += (ruledNutrientScore * 0.7 + kalchmResonance * 0.3);
    });
    
    return resonanceScore / (profiles || []).length;
  }
  
  /**
   * Generate compatibility recommendations
   */
  private generateCompatibilityRecommendations(
    kalchmHarmony: number,
    seasonalAlignment: number,
    planetaryResonance: number,
    elementalBalance: number = 0.5
  ): string[] {
    const recommendations: string[] = [];
    
    if (kalchmHarmony < 0.7) {
      recommendations?.push('Consider ingredients with more similar Kalchm values for better harmony');
    }
    
    if (elementalBalance < 0.6) {
      recommendations?.push('Add ingredients to improve elemental balance across Fire, Water, Earth, and Air');
    }
    
    if (seasonalAlignment < 0.6) {
      recommendations?.push('Include more seasonally appropriate nutrients and ingredients');
    }
    
    if (planetaryResonance < 0.6) {
      recommendations?.push('Consider planetary timing and ruled nutrients for better resonance');
    }
    
    if ((recommendations || []).length === 0) {
      recommendations?.push('Excellent nutritional compatibility! This combination is well-balanced.');
    }
    
    return recommendations;
  }
  
  /**
   * Get nutritional recommendations based on criteria
   */
  getNutritionalRecommendations(
    criteria: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
      targetKalchm?: number;
      elementalFocus?: Element;
      healthGoals?: string[];
    }
  ): NutritionalRecommendations {
    const ingredients: UnifiedIngredient[] = [];
    const nutritionalProfiles: AlchemicalNutritionalProfile[] = [];
    const cookingMethods: string[] = [];
    const healthBenefits: string[] = [];
    const warnings: string[] = [];
    
    // Get seasonal recommendations
    if (criteria.currentSeason) {
      const seasonProfile = this.seasonalProfiles[criteria.currentSeason];
      seasonProfile.optimalFoods  || [].forEach(foodName => {
        const ingredient = unifiedIngredients[foodName];
        if (ingredient) {
          ingredients?.push(ingredient);
        }
      });
      
      healthBenefits?.push(`Seasonal alignment with ${criteria.currentSeason} nutritional needs`);
    }
    
    // Get zodiac recommendations
    if (criteria.currentZodiacSign) {
      const zodiacProfile = this.zodiacProfiles[criteria.currentZodiacSign];
      zodiacProfile.beneficialFoods  || [].forEach(foodName => {
        const ingredient = unifiedIngredients[foodName];
        if (ingredient) {
          ingredients?.push(ingredient);
        }
      });
      
      healthBenefits?.push(`Optimized for ${criteria.currentZodiacSign} nutritional needs`);
      
      // Add warnings for challenge foods
      zodiacProfile.challengeFoods  || [].forEach(food => {
        warnings?.push(`Limit ${food} for ${criteria.currentZodiacSign} constitution`);
              });
  }
    
    // Get planetary recommendations
    if (criteria.planetaryHour) {
      const planetProfile = this.planetaryProfiles[criteria.planetaryHour];
      planetProfile.beneficialFoods  || [].forEach(foodName => {
        const ingredient = unifiedIngredients[foodName];
        if (ingredient) {
          ingredients?.push(ingredient);
        }
      });
      
      healthBenefits?.push(`Enhanced by ${criteria.planetaryHour} planetary influence`);
    }
    
    // Filter by Kalchm if specified
    let filteredIngredients = ingredients;
    if (criteria.targetKalchm) {
      filteredIngredients = (ingredients || []).filter(ingredient => 
        Math.abs(ingredient.kalchm - criteria.targetKalchm!) <= 0.2
      );
    }
    
    // Remove duplicates
    const uniqueIngredients = Array.from(
      new (Map(filteredIngredients || []).map(ing => [ing.name, ing])).values()
    );
    
    // Create nutritional profiles for recommended ingredients
    (uniqueIngredients || []).forEach(ingredient => {
      if (ingredient.nutritionalPropertiesProfile) {
        const enhanced = this.enhanceNutritionalProfile(
          ingredient.nutritionalPropertiesProfile,
          {
            season: criteria.currentSeason,
            currentZodiacSign: criteria.currentZodiacSign,
            planetaryHour: criteria.planetaryHour
          }
        );
        nutritionalProfiles?.push(enhanced);
      }
    });
    
    // Calculate optimization scores
    const seasonalOptimization = criteria.currentSeason ? 
      this.seasonalProfiles[criteria.currentSeason].biorhythmAlignment : 0.5;
    
    const kalchmHarmony = (nutritionalProfiles || []).length > 0 ? 
      this.calculateKalchmHarmony(nutritionalProfiles  || [].map(p => p.kalchm)) : 0;
    
    const monicaOptimization = (nutritionalProfiles || []).length > 0 ?
      nutritionalProfiles.reduce((sum, p) => sum + p.monicaOptimization.finalOptimizedScore, 0) / (nutritionalProfiles || []).length : 0;
    
    return {
      ingredients: uniqueIngredients,
      nutritionalProfiles,
      cookingMethods,
      seasonalOptimization,
      kalchmHarmony,
      monicaOptimization,
      healthBenefits,
      warnings
    };
  }
}

// ===== UNIFIED NUTRITIONAL SYSTEM INSTANCE =====

export const unifiedNutritionalSystem = new UnifiedNutritionalSystem();

// ===== NUTRITIONAL UTILITY FUNCTIONS =====

/**
 * Calculate nutritional balance from a list of ingredients
 */
export const calculateNutritionalBalance = (ingredients: any[]): NutritionalProfile => {
  // This is a simplified implementation
  return {
    calories: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    vitamins: {},
    minerals: {},
    phytonutrients: {}
  };
};

/**
 * Convert a nutritional profile to elemental properties
 */
export const nutritionalToElemental = (profile: NutritionalProfile): ElementalProperties => {
  try {
    // Default values if profile is incomplete
    const protein = profile.macros?.protein ?? 0;
    const carbs = profile.macros?.carbs ?? 0;
    const fat = profile.macros?.fat ?? 0;
    const fiber = profile.macros?.fiber ?? 0;
    
    // Convert nutritional components to elemental properties
    return createElementalProperties({
      Fire: (protein * 0.3 + carbs * 0.2) / (protein + carbs + fat + fiber || 1),
      Water: (fat * 0.3 + fiber * 0.2) / (protein + carbs + fat + fiber || 1),
      Earth: (fiber * 0.5 + protein * 0.2) / (protein + carbs + fat + fiber || 1),
      Air: (carbs * 0.5 + fat * 0.2) / (protein + carbs + fat + fiber || 1)
            });
  } catch (error) {
    console.error('Error converting nutritional to elemental:', error);
    return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0         });
  }
};

/**
 * Get nutritional recommendations based on zodiac sign
 */
export const getZodiacNutritionalRecommendations = (sign: string): {focusNutrients: string[];
  recommendedFoods: string[];
  avoidFoods: string[];
} => {
  // Implementation would go here
  return {
    focusNutrients: [],
    recommendedFoods: [],
    avoidFoods: []
  };
};

/**
 * Get nutritional recommendations based on planetary influences
 */
export const getPlanetaryNutritionalRecommendations = (planets: string[]): {
  focusNutrients: string[];
  healthAreas: string[];
  recommendedFoods: string[];
} => {
  try {
    // Default response
    return {
      focusNutrients: [],
      healthAreas: [],
      recommendedFoods: []
    };
  } catch (error) {
    console.error('Error in getPlanetaryNutritionalRecommendations:', error);
    return {
      focusNutrients: [],
      healthAreas: [],
      recommendedFoods: []
    };
  }
};

/**
 * Get enhanced nutritional recommendations based on planetary day and hour
 */
export const getEnhancedPlanetaryNutritionalRecommendations = (
  planetaryDay: string,
  planetaryHour: string,
  currentTime: Date = new Date(),
): {
  elements: ElementalProperties;
  focusNutrients: string[];
  healthAreas: string[];
  recommendedFoods: string[];
} => {
  try {
    // Default response
    return {
      elements: createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
      focusNutrients: [],
      healthAreas: [],
      recommendedFoods: []
    };
  } catch (error) {
    console.error('Error in getEnhancedPlanetaryNutritionalRecommendations:', error);
    return {
      elements: createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
      focusNutrients: [],
      healthAreas: [],
      recommendedFoods: []
    };
  }
};

/**
 * Get nutritional recommendations based on season
 */
export const getSeasonalNutritionalRecommendations = (season: string): {
  element: Element;
  focusNutrients: string[];
  seasonalFoods: string[];
} => {
  try {
    // Default response
    return {
      element: 'balanced',
      focusNutrients: [],
      seasonalFoods: []
    };
  } catch (error) {
    console.error('Error in getSeasonalNutritionalRecommendations:', error);
    return {
      element: 'balanced',
      focusNutrients: [],
      seasonalFoods: []
    };
  }
};

/**
 * Evaluate how well a nutritional profile matches target elemental properties
 */
export const evaluateNutritionalElementalBalance = (
  profile: NutritionalProfile,
  targetElements: ElementalProperties,
): {
  score: number;
  imbalances: string[];
  recommendations: string[];
} => {
  try {
    // Convert nutritional profile to elemental properties
    const elementalProfile = nutritionalToElemental(profile);
    
    // Calculate score based on similarity between profiles
    const Fire = Math.min(elementalProfile.Fire, targetElements.Fire) / Math.max(elementalProfile.Fire, targetElements.Fire);
    const Water = Math.min(elementalProfile.Water, targetElements.Water) / Math.max(elementalProfile.Water, targetElements.Water);
    const Earth = Math.min(elementalProfile.Earth, targetElements.Earth) / Math.max(elementalProfile.Earth, targetElements.Earth);
    const Air = Math.min(elementalProfile.Air, targetElements.Air) / Math.max(elementalProfile.Air, targetElements.Air);
    
    const score = (Fire + Water + Earth + Air) / 4;
    
    // Identify imbalances
    const imbalances: string[] = [];
    if (elementalProfile.Fire < targetElements.Fire * 0.8) imbalances?.push('Low Fire element (energizing nutrients)');
    if (elementalProfile.Water < targetElements.Water * 0.8) imbalances?.push('Low Water element (hydrating nutrients)');
    if (elementalProfile.Earth < targetElements.Earth * 0.8) imbalances?.push('Low Earth element (grounding nutrients)');
    if (elementalProfile.Air < targetElements.Air * 0.8) imbalances?.push('Low Air element (light nutrients)');
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (elementalProfile.Fire < targetElements.Fire) recommendations?.push('Add more protein-rich foods');
    if (elementalProfile.Water < targetElements.Water) recommendations?.push('Increase hydrating foods');
    if (elementalProfile.Earth < targetElements.Earth) recommendations?.push('Add more fiber-rich foods');
    if (elementalProfile.Air < targetElements.Air) recommendations?.push('Include more complex carbohydrates');
    
    return {
      score,
      imbalances,
      recommendations
    };
  } catch (error) {
    console.error('Error in evaluateNutritionalElementalBalance:', error);
    return {
      score: 0,
      imbalances: [],
      recommendations: []
    };
  }
}; 
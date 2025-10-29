// ===== UNIFIED NUTRITIONAL SYSTEM =====;
// Phase 3 Step 4 of WhatToEatNext Data Consolidation
// Enhances nutritional data with alchemical principles and Monica/Kalchm integration
// Integrates with unified seasonal, cuisine, ingredients, and recipe systems

import type {
  Element,
  ElementalProperties,
  PlanetName,
  AlchemicalProperties,
  _,
  CookingMethod,
  _
} from '@/types/alchemy';
import type { NutritionalProfile } from '@/types/nutrition';
import type { Season } from '@/types/seasons';
import type { ZodiacSign } from '@/types/zodiac';

// TODO: Fix import - add what to import from './ingredients.ts'
// TODO: Fix import - add what to import from './seasonal.ts'
import { createElementalProperties } from '../../utils/elemental/elementalUtils';

import { calculateKalchm, _, _ } from './alchemicalCalculations';

// ===== ENHANCED NUTRITIONAL INTERFACES =====;

export interface AlchemicalNutritionalProfile extends NutritionalProfile {
  // Enhanced Alchemical Properties,
  alchemicalProperties: AlchemicalProperties,
  kalchm: number, // Nutritional Kalchm value,

  // Elemental Nutritional Mapping
  elementalNutrients: {
    Fire: NutrientGroup, // Energizing, warming nutrients,
    Water: NutrientGroup, // Cooling, flowing, cleansing nutrients,
    Earth: NutrientGroup, // Grounding, nourishing, stable nutrients,
    Air: NutrientGroup, // Light, uplifting, dispersing nutrients
  },
  // Monica-Enhanced Nutritional Optimization
  monicaOptimization: {
    baselineScore: number // Base nutritional score,
    seasonalModifier: number, // Seasonal adjustment,
    planetaryModifier: number, // Planetary influence,
    cookingMethodModifier: number, // Cooking method enhancement,
    finalOptimizedScore: number, // Monica-optimized final score
  },
  // Astrological Nutritional Correlations
  astrologicalProfile: {
    rulingPlanets: PlanetName[], // Planets that rule these nutrients,
    favorableZodiac: any[], // Zodiac signs that benefit most,
    seasonalPeak: Season[], // Seasons when these nutrients are most beneficial,
    elementalAffinity: ElementalProperties, // Elemental nutritional affinity
  },
  // Enhanced Metadata
  metadata: {
    kalchmCalculated: boolean,
    monicaOptimized: boolean,
    lastUpdated: Date,
    sourceData: string[]
  }
}

export interface NutrientGroup { macronutrients: { [key: string], number }; // Protein, carbs, fats, fiber
  micronutrients: { [key: string]: number }; // Vitamins and minerals
  phytonutrients: { [key: string]: number }; // Antioxidants, flavonoids, etc.
  bioactiveCompounds: { [key: string]: number }; // Specialized compounds,
  totalElementalValue: number // Combined elemental nutritional value
}

export interface NutritionalMonicaModifiers {
  temperatureOptimization: number // Temperature-based nutritional optimization;
  timingOptimization: number, // Timing-based absorption optimization,
  combinationSynergy: number, // Nutrient combination synergy,
  bioavailabilityBonus: number, // Enhanced bioavailability,
  digestiveHarmony: number, // Digestive system harmony
}

export interface SeasonalNutritionalProfile {
  season: Season;
  elementalNutritionalFocus: Element;
  priorityNutrients: string[];
  optimalFoods: string[];
  avoidanceFoods: string[];
  kalchmRange: { min: number, max: number },
  monicaModifiers: NutritionalMonicaModifiers,
  biorhythmAlignment: number
}

export interface PlanetaryNutritionalProfile {
  planet: PlanetName;
  ruledNutrients: string[];
  healthDomains: string[];
  beneficialFoods: string[];
  optimalTimings: string[];
  kalchmResonance: number;
  monicaInfluence: number
}

export interface ZodiacNutritionalProfile {
  sign: any;
  elementalNeeds: ElementalProperties;
  nutritionalFocus: string[];
  beneficialFoods: string[];
  challengeFoods: string[];
  kalchmCompatibility: number;
  monicaOptimization: number
}

export interface NutritionalCompatibilityAnalysis {
  kalchmHarmony: number // Kalchm-based nutritional harmony// Elemental nutritional balance;
  seasonalAlignment: number, // Seasonal nutritional alignment,
  planetaryResonance: number, // Planetary nutritional resonance,
  overallCompatibility: number, // Combined compatibility score,
  recommendations: string[], // Specific recommendations
}

export interface NutritionalRecommendations {
  ingredients: unknown[];
  nutritionalProfiles: AlchemicalNutritionalProfile[];
  cookingMethods: string[];
  seasonalOptimization: number;
  kalchmHarmony: number;
  monicaOptimization: number;
  healthBenefits: string[];
  warnings: string[]
}

// ===== ALCHEMICAL NUTRITIONAL CATEGORIZATION =====;

// Categorize nutrients by alchemical properties (Spirit, Essence, Matter, Substance)
export const _alchemicalNutrientMapping: { [key: string]: AlchemicalProperties } = {
  // Spirit Nutrients (Volatile, transformative)
  vitamin_c: { Spirit: 0.8, Essence: 0.2, Matter: 0.0, Substance: 0.0 },
  caffeine: { Spirit: 0.9, Essence: 0.1, Matter: 0.0, Substance: 0.0 },
  capsaicin: { Spirit: 0.7, Essence: 0.3, Matter: 0.0, Substance: 0.0 },
  volatile_oils: { Spirit: 0.8, Essence: 0.2, Matter: 0.0, Substance: 0.0 },
  // Essence Nutrients (Active principles)
  antioxidants: { Spirit: 0.3, Essence: 0.7, Matter: 0.0, Substance: 0.0 },
  flavonoids: { Spirit: 0.2, Essence: 0.8, Matter: 0.0, Substance: 0.0 },
  omega_3: { Spirit: 0.1, Essence: 0.7, Matter: 0.1, Substance: 0.1 },
  probiotics: { Spirit: 0.2, Essence: 0.6, Matter: 0.2, Substance: 0.0 },
  enzymes: { Spirit: 0.2, Essence: 0.8, Matter: 0.0, Substance: 0.0 },
  // Matter Nutrients (Physical structure)
  protein: { Spirit: 0.0, Essence: 0.3, Matter: 0.7, Substance: 0.0 },
  fiber: { Spirit: 0.0, Essence: 0.1, Matter: 0.8, Substance: 0.1 },
  complex_carbs: { Spirit: 0.1, Essence: 0.2, Matter: 0.6, Substance: 0.1 },
  calcium: { Spirit: 0.0, Essence: 0.0, Matter: 0.7, Substance: 0.3 },
  iron: { Spirit: 0.0, Essence: 0.2, Matter: 0.7, Substance: 0.1 },
  // Substance Nutrients (Stable, enduring)
  saturated_fats: { Spirit: 0.0, Essence: 0.1, Matter: 0.2, Substance: 0.7 },
  minerals: { Spirit: 0.0, Essence: 0.1, Matter: 0.3, Substance: 0.6 },
  vitamin_d: { Spirit: 0.0, Essence: 0.2, Matter: 0.2, Substance: 0.6 },
  vitamin_k: { Spirit: 0.0, Essence: 0.2, Matter: 0.3, Substance: 0.5 },
  magnesium: { Spirit: 0.0, Essence: 0.1, Matter: 0.2, Substance: 0.7 }
}

// Elemental nutritional categorization (Self-Reinforcement Compliant)
export const elementalNutrientMapping: Record<Element, NutrientGroup> = {
  Fire: {
    macronutrients: {
      protein: 0.8, // Building, energizing,
      simple_carbs: 0.6, // Quick energy,
      spicy_compounds: 0.9, // Heating compounds
    },
    micronutrients: {
      vitamin_b12: 0.8, // Energy metabolism,
      iron: 0.9, // Circulation, energy,
      zinc: 0.7, // Immune function,
      vitamin_b6: 0.6, // Protein metabolism
    },
    phytonutrients: {
      capsaicin: 0.9, // Heat-generating,
      gingerol: 0.8, // Warming,
      allicin: 0.7, // Stimulating
    },
    bioactiveCompounds: {
      caffeine: 0.8, // Stimulating,
      theobromine: 0.6, // Mild stimulant
    },
    totalElementalValue: 0.75
},
  Water: {
    macronutrients: {
      Water: 1.0, // Hydration,
      electrolytes: 0.9, // Fluid balance,
      omega_3: 0.8, // Flowing, cooling
    },
    micronutrients: {
      potassium: 0.9, // Fluid balance,
      sodium: 0.7, // Electrolyte balance,
      vitamin_c: 0.8, // Cleansing, immunity,
      folate: 0.6, // Cellular renewal
    },
    phytonutrients: {
      anthocyanins: 0.8, // Cooling, anti-inflammatory,
      cucurbitacins: 0.9, // Cooling compounds,
      menthol: 0.8, // Cooling sensation
    },
    bioactiveCompounds: {
      mucilage: 0.9, // Soothing, hydrating,
      pectin: 0.7, // Cleansing
    },
    totalElementalValue: 0.8
},
  Earth: {
    macronutrients: {
      complex_carbs: 0.9, // Grounding energy,
      fiber: 0.9, // Structural support,
      healthy_fats: 0.7, // Stable energy
    },
    micronutrients: {
      calcium: 0.9, // Structural support,
      magnesium: 0.8, // Grounding, calming,
      phosphorus: 0.8, // Bone structure,
      vitamin_d: 0.7, // Bone health
    },
    phytonutrients: {
      lignans: 0.8, // Structural compounds,
      saponins: 0.7, // Grounding compounds,
      tannins: 0.6, // Stabilizing compounds
    },
    bioactiveCompounds: {
      sterols: 0.8, // Structural support,
      cellulose: 0.9, // Fiber structure
    },
    totalElementalValue: 0.8
},
  Air: {
    macronutrients: {
      volatile_compounds: 0.9, // Light, dispersing,
      essential_oils: 0.8, // Aromatic, uplifting,
      simple_sugars: 0.6, // Quick, light energy
    },
    micronutrients: {
      vitamin_c: 0.8, // Antioxidant, cleansing,
      b_vitamins: 0.7, // Mental clarity,
      folate: 0.8, // Cellular communication,
      thiamine: 0.7, // Nerve function
    },
    phytonutrients: {
      terpenes: 0.9, // Aromatic compounds,
      limonene: 0.8, // Uplifting citrus compounds,
      menthol: 0.7, // Refreshing compounds
    },
    bioactiveCompounds: {
      alkaloids: 0.8, // Stimulating compounds,
      phenols: 0.7, // Light antioxidants
    },
    totalElementalValue: 0.75
}
}

// ===== CORE NUTRITIONAL ANALYSIS SYSTEM =====

export class UnifiedNutritionalSystem {
  private seasonalProfiles: Record<Season, SeasonalNutritionalProfile>;
  private planetaryProfiles: Record<PlanetName, PlanetaryNutritionalProfile>;
  private zodiacProfiles: Record<ZodiacSign, ZodiacNutritionalProfile>;

  constructor() {
    this.initializeProfiles()
  }

  private initializeProfiles() {
    // Initialize with basic profiles - would be expanded with actual data
    this.seasonalProfiles = {} as Record<Season, SeasonalNutritionalProfile>;
    this.planetaryProfiles = {} as Record<PlanetName, PlanetaryNutritionalProfile>;
    this.zodiacProfiles = {} as Record<ZodiacSign, ZodiacNutritionalProfile>;
  }

  private calculateElementalBalance(profiles?: AlchemicalNutritionalProfile[]): number {
    if (!profiles || profiles.length === 0) return 0.5;
    const totalElementalValues = { Fire: 0, Water: 0, Earth: 0, Air: 0 }

    profiles.forEach(profile => {
      const profileData = profile as unknown;
      const nutrients = profileData.elementalNutrients

      if (nutrients) {
        const nutrientData = nutrients as unknown;
        const fireNutrients = nutrientData.Fire as unknown;
        const waterNutrients = nutrientData.Water as unknown;
        const earthNutrients = nutrientData.Earth as unknown;
        const airNutrients = nutrientData.Air as any;

        totalElementalValues.Fire += Number(fireNutrients.totalElementalValue || 0)
        totalElementalValues.Water += Number(waterNutrients.totalElementalValue || 0)
        totalElementalValues.Earth += Number(earthNutrients.totalElementalValue || 0)
        totalElementalValues.Air += Number(airNutrients.totalElementalValue || 0)
      }
    })

    // Calculate balance as inverse of standard deviation
    const values = Object.values(totalElementalValues);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow((val as unknown) - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    // Higher balance = lower standard deviation
    return Math.max(0, 1 - stdDev / mean)
  }

  private calculateSeasonalAlignment()
    profiles: AlchemicalNutritionalProfile[],
    season: Season,
  ): number {
    if (!profiles || profiles.length === 0) return 0.5;
    let totalAlignment = 0;
    let validProfiles = 0;

    profiles.forEach(profile => {
      const profileData = profile as unknown;
      const astroProfile = profileData.astrologicalProfile

      const astroData = astroProfile as any
      if (astroData?.seasonalPeak) {
        validProfiles++;
        if (Array.isArray(astroData.seasonalPeak) && astroData.seasonalPeak.includes(season) {
          totalAlignment += 1.0;
        } else {
          totalAlignment += 0.3; // Partial alignment
        }
      }
    })

    return validProfiles > 0 ? totalAlignment / validProfiles : 0.5;
  }

  private calculatePlanetaryResonance()
    profiles: AlchemicalNutritionalProfile[],
    planet: PlanetName,
  ): number {
    if (!profiles || profiles.length === 0) return 0.5;
    let totalResonance = 0;
    let validProfiles = 0;

    profiles.forEach(profile => {
      const profileData = profile as unknown;
      const astroProfile = profileData.astrologicalProfile

      const astroData = astroProfile as any
      if (astroData?.rulingPlanets) {
        validProfiles++;
        if (Array.isArray(astroData.rulingPlanets) && astroData.rulingPlanets.includes(planet) {
          totalResonance += 1.0;
        } else {
          totalResonance += 0.2; // Minimal resonance
        }
      }
    })

    return validProfiles > 0 ? totalResonance / validProfiles : 0.5;
  }

  private generateCompatibilityRecommendations()
    kalchmHarmony: number,
    seasonalAlignment: number,
    planetaryResonance: number,
    elementalBalance: number = 0.5): string[] {
    const recommendations: string[] = []

    if (kalchmHarmony < 0.6) {
      recommendations.push()
        'Consider adjusting ingredient proportions to improve alchemical harmony',
      )
    }

    if (seasonalAlignment < 0.5) {
      recommendations.push('Incorporate more seasonal ingredients for better nutritional timing')
    }

    if (planetaryResonance < 0.4) {
      recommendations.push('Add ingredients with stronger planetary correspondences')
    }

    if (elementalBalance < 0.6) {
      recommendations.push('Balance elemental nutrients more evenly across all four elements')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent nutritional harmony - maintain current approach')
    }

    return recommendations;
  }

  getNutritionalRecommendations(_: {
    season?: Season;
    currentZodiacSign?: any;
    planetaryHour?: PlanetName;
    targetKalchm?: number;
    elementalFocus?: Element;
    healthGoals?: string[]
  }): NutritionalRecommendations {
    // Basic implementation - would be expanded with real data
    return {
      ingredients: [],
      nutritionalProfiles: [],
      cookingMethods: [],
      seasonalOptimization: 0.7,
      kalchmHarmony: 0.8,
      monicaOptimization: 0.75,
      healthBenefits: ['Improved elemental balance', 'Enhanced seasonal alignment'],
      warnings: []
    }
  }

  analyzeNutritionalCompatibility()
    profiles: AlchemicalNutritionalProfile[],
    criteria: {
      season?: Season,
      planetaryHour?: PlanetName,
      targetElements?: ElementalProperties
    }
  ): NutritionalCompatibilityAnalysis {
    // Calculate Kalchm harmony
    const kalchmHarmony =
      profiles.reduce((sum, profile) => {
        const profileData = profile as unknown;
        const kalchmValue = typeof profileData.kalchm === 'number' ? profileData.kalchm : 0.5
        return sum + kalchmValue;
      }, 0) / profiles.length,

    // Calculate elemental balance
    const elementalBalance = this.calculateElementalBalance(profiles)

    // Calculate seasonal alignment
    const seasonalAlignment = criteria.season
      ? this.calculateSeasonalAlignment(profiles, criteria.season)
      : 0.5;

    // Calculate planetary resonance
    const planetaryResonance = criteria.planetaryHour
      ? this.calculatePlanetaryResonance(profiles, criteria.planetaryHour)
      : 0.5;

    // Overall compatibility (weighted average)
    const overallCompatibility =
      kalchmHarmony * 0.3 +
      elementalBalance * 0.3 +
      seasonalAlignment * 0.2 +
      planetaryResonance * 0.2

    return {
      kalchmHarmony,
      seasonalAlignment,
      planetaryResonance,
      overallCompatibility,
      recommendations: this.generateCompatibilityRecommendations()
        kalchmHarmony,
        seasonalAlignment,
        planetaryResonance,
        elementalBalance,
      )
    }
  }

  createAlchemicalNutritionalProfile()
    baseProfile: NutritionalProfile,
    _ingredients: CookingMethod[],
    _cookingMethod?: CookingMethod,
  ): AlchemicalNutritionalProfile {
    const baseData = baseProfile as unknown;

    // Calculate alchemical properties from nutritional data
    const alchemicalProperties: AlchemicalProperties = {
      Spirit: Number(baseData.volatileCompounds || 0.2),
      Essence: Number(baseData.activeCompounds || 0.3),
      Matter: Number(baseData.structuralNutrients || 0.3),
      Substance: Number(baseData.stableNutrients || 0.2)
    }

    // Calculate Kalchm value
    const kalchm = calculateKalchm(alchemicalProperties)

    // Create elemental nutrient mapping
    const elementalNutrients = {
      Fire: elementalNutrientMapping.Fire,
      Water: elementalNutrientMapping.Water,
      Earth: elementalNutrientMapping.Earth,
      Air: elementalNutrientMapping.Air
    }

    return {
      ...baseProfile,
      alchemicalProperties,
      kalchm,
      elementalNutrients,
      monicaOptimization: {
        baselineScore: 0.7,
        seasonalModifier: 1.0,
        planetaryModifier: 1.0,
        cookingMethodModifier: 1.0,
        finalOptimizedScore: 0.7
},
      astrologicalProfile: {
        rulingPlanets: ['Sun'] as PlanetName[],
        favorableZodiac: ['Leo'] as unknown as any[],
        seasonalPeak: ['Summer'] as unknown as Season[],
        elementalAffinity: createElementalProperties({
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
})
      },
      metadata: {
        kalchmCalculated: true,
        monicaOptimized: false,
        lastUpdated: new Date(),
        sourceData: ['base_profile']
      }
    }
  }
}

// ===== EXPORTED UTILITY FUNCTIONS =====

export const _calculateNutritionalBalance = (_ingredients: unknown[]): NutritionalProfile => {
  if (!_ingredients || _ingredients.length === 0) {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      vitamins: {},
      minerals: {}
    }
  }

  // Aggregate nutritional values from ingredients
  const totals = _ingredients.reduce()
    ()
      acc: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
        vitamins: Record<string, unknown>;
        minerals: Record<string, unknown>
      },
      ingredient,
    ) => {
      const ingredientData = ingredient as any;
      const nutritionData = (ingredientData?.nutrition ? ingredientData.nutrition : {}) as Record<
        string,
        unknown
      >;
      return {
        calories: acc.calories + Number(nutritionData.calories || 0),
        protein: acc.protein + Number(nutritionData.protein || 0),
        carbohydrates: acc.carbohydrates + Number(nutritionData.carbohydrates || 0),
        fat: acc.fat + Number(nutritionData.fat || 0),
        fiber: acc.fiber + Number(nutritionData.fiber || 0),
        vitamins: {
          ...acc.vitamins,
          ...((nutritionData.vitamins) || {})
        },
        minerals: {
          ...acc.minerals,
          ...((nutritionData.minerals) || {})
        }
      }
    },
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      vitamins: {},
      minerals: {}
    })

  return totals as NutritionalProfile;
}

export const nutritionalToElemental = (profile: NutritionalProfile): ElementalProperties => {
  const profileData = profile as unknown;

  // Map nutritional components to elemental properties
  const protein = Number(profileData.protein || 0)
  const carbs = Number(profileData.carbohydrates || 0)
  const fat = Number(profileData.fat || 0)
  const fiber = Number(profileData.fiber || 0)

  // Normalize to total of 1.0
  const total = protein + carbs + fat + fiber || 1

  return {
    Fire: (protein * 0.6 + carbs * 0.4) / total, // Energizing nutrients
    Water: Number(profileData.waterContent || 0.3) / total, // Hydrating elements
    Earth: (fiber * 0.8 + fat * 0.2) / total, // Grounding nutrients
    Air: Number(profileData.volatiles || 0.1) / total // Light, dispersing elements
  }
}

export const _getZodiacNutritionalRecommendations = (
  _sign: string,
): {
  focusNutrients: string[],
  recommendedFoods: string[],
  avoidFoods: string[]
} => {
  // Basic mapping - would be expanded with comprehensive data
  const defaultRecommendations = {
    focusNutrients: ['balanced_nutrition'],
    recommendedFoods: ['seasonal_vegetables', 'whole_grains'],
    avoidFoods: ['processed_foods']
  }

  return defaultRecommendations;
}

export const _getPlanetaryNutritionalRecommendations = (
  _planets: string[],
): {
  focusNutrients: string[],
  healthAreas: string[],
  recommendedFoods: string[]
} => {
  return {
    focusNutrients: ['elemental_balance'],
    healthAreas: ['overall_vitality'],
    recommendedFoods: ['planetary_foods']
  }
}

export const _getEnhancedPlanetaryNutritionalRecommendations = (
  planetaryDay: string,
  planetaryHour: string,
  _: Date = new Date()
): {
  elements: ElementalProperties;
  focusNutrients: string[];
  healthAreas: string[];
  recommendedFoods: string[];
} => {
  return {
    elements: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
    focusNutrients: ['planetary_alignment'],
    healthAreas: ['temporal_health'],
    recommendedFoods: ['time_aligned_foods']
  }
}

export const _getSeasonalNutritionalRecommendations = (
  season: string,
): {
  element: Element,
  focusNutrients: string[],
  seasonalFoods: string[]
} => {
  const seasonLower = season.toLowerCase()

  // Map seasons to elements and recommendations
  switch (seasonLower) {
    case 'spring': return {
        element: 'Air',
        focusNutrients: ['cleansing_nutrients', 'vitamin_c'],
        seasonalFoods: ['spring_greens', 'citrus']
      }
    case 'summer':
      return {
        element: 'Fire',
        focusNutrients: ['hydrating_nutrients', 'cooling_foods'],
        seasonalFoods: ['summer_fruits', 'cooling_herbs']
      }
    case 'fall':
    case 'autumn':
      return {
        element: 'Earth',
        focusNutrients: ['grounding_nutrients', 'warming_spices'],
        seasonalFoods: ['root_vegetables', 'squashes']
      }
    case 'winter':
      return {
        element: 'Water',
        focusNutrients: ['warming_nutrients', 'stored_energy'],
        seasonalFoods: ['preserved_foods', 'warming_teas']
      }
    default: return {
        element: 'Earth',
        focusNutrients: ['balanced_nutrition'],
        seasonalFoods: ['year_round_foods']
      }
  }
}

export const _evaluateNutritionalElementalBalance = (
  profile: NutritionalProfile,
  targetElements: ElementalProperties,
): {
  score: number,
  imbalances: string[],
  recommendations: string[]
} => {
  const currentElements = nutritionalToElemental(profile)

  // Calculate deviation from target
  const deviations = {
    Fire: Math.abs(currentElements.Fire - targetElements.Fire),
    Water: Math.abs(currentElements.Water - targetElements.Water),
    Earth: Math.abs(currentElements.Earth - targetElements.Earth),
    Air: Math.abs(currentElements.Air - targetElements.Air)
  }

  const totalDeviation = Object.values(deviations).reduce((sum, dev) => sum + dev, 0)
  const score = Math.max(0, 1 - totalDeviation / 2); // Max deviation is 2

  const imbalances: string[] = [];
  const recommendations: string[] = []

  Object.entries(deviations).forEach(([element, deviation]) => {
    if (deviation > 0.2) {
      imbalances.push(`${element} element imbalance`)
      recommendations.push(`Adjust ${element} element through appropriate foods`)
    }
  })

  return { score, imbalances, recommendations }
}

// ===== SINGLETON INSTANCE =====;
export const _unifiedNutritionalSystem = new UnifiedNutritionalSystem()
;
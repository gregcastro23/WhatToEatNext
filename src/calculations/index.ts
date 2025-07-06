import { Recipe } from '@/types/recipe';

/**
 * Streamlined Alchemical Calculations Engine
 * 
 * Main entry point for all alchemical calculations, integrating:
 * - Kalchm and Monica Constants
 * - Elemental Properties
 * - Planetary Influences
 * - Recipe Matching
 * - Seasonal Adjustments
 */

import type { ElementalProperties, 
  PlanetaryPosition, 
  ZodiacSign, 
  LunarPhase,
  Season } from '@/types/alchemy';

// Core calculation modules
import kalchmEngine, { 
  type KalchmResult, 
  type AlchemicalProperties, 
  type ElementalValues,
  type ThermodynamicResults,
  calculateKalchmResults,
  toElementalProperties
} from './core/kalchmEngine';

import elementalCalculations, {
  calculateComprehensiveElementalProperties,
  calculateElementalCompatibility,
  getDominantElement,
  getElementalRecommendations,
  ZODIAC_ELEMENTS
} from './core/elementalCalculations';

import planetaryInfluences, {
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations
} from './core/planetaryInfluences';

// Culinary calculation modules
import { 
  calculateElementalRecipeCompatibility, 
  calculateAlchemicalRecipeAlignment 
} from './culinary/recipeMatching';
import { 
  getCuisineRecommendations, 
  generateElementalCuisineMapping 
} from './culinary/cuisineRecommendations';
import { 
  applySeasonalElementalAdjustments, 
  getSeasonalModifiers 
} from './culinary/seasonalAdjustments';

import { _Element } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";

// Import the missing function
import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';

/**
 * Complete alchemical calculation result
 */
export interface ComprehensiveAlchemicalResult {
  // Core calculations
  kalchm: KalchmResult;
  elementalProperties: ElementalProperties;
  
  // Planetary influences
  planetaryInfluences: {
    alchemicalInfluences: { [key: string]: number };
    elementalInfluences: { [key: string]: number };
    dominantPlanets: Array<{ planet: string; strength: number; element: Element }>;
    planetaryHours?: { dayRuler: string; hourRuler: string; influence: number };
  };
  
  // Recommendations
  recommendations: {
    elemental: {
      dominant: Element;
      balance: number;
      recommendations: string[];
    };
    culinary: {
      ingredients: string[];
      cookingMethods: string[];
      flavors: string[];
      timing: string[];
    };
    cuisines?: string[]; // Optional cuisine recommendations
  };
  
  // Metadata
  timestamp: string;
  cacheKey: string;
}

/**
 * Input parameters for comprehensive calculation
 */
export interface CalculationInput {
  planetaryPositions: { [key: string]: PlanetaryPosition };
  season?: Season;
  lunarPhase?: LunarPhase;
  isDaytime?: boolean;
  currentDate?: Date;
  currentZodiacSign?: ZodiacSign;
}

/**
 * Main calculation function that integrates all systems
 */
export async function calculateComprehensiveAlchemicalResult(
  input: CalculationInput
): Promise<ComprehensiveAlchemicalResult> {
  const {
    planetaryPositions,
    season = 'spring',
    lunarPhase = 'full moon',
    isDaytime = true,
    currentDate = new Date(),
    currentZodiacSign
  } = input;

  // Generate cache key
  const cacheKey = `comprehensive_${JSON.stringify(input)}`;

  try {
    // 1. Calculate Kalchm and Monica constants
    const kalchm = calculateKalchmResults(planetaryPositions);

    // 2. Calculate comprehensive elemental properties
    let elementalProperties = calculateComprehensiveElementalProperties(
      planetaryPositions,
      season,
      lunarPhase,
      isDaytime
    );

    // Apply seasonal and lunar adjustments
    elementalProperties = applySeasonalAdjustments(elementalProperties, season);
    if (lunarPhase) {
      elementalProperties = applyLunarPhaseAdjustments(elementalProperties, lunarPhase);
    }

    // 3. Calculate planetary influences
    const planetaryInfluencesResult = calculatePlanetaryInfluences(
      planetaryPositions,
      isDaytime,
      currentDate
    );

    // 4. Generate elemental recommendations
    const elementalRecommendations = getElementalRecommendations(elementalProperties);

    // 5. Generate culinary recommendations based on planetary influences
    const culinaryRecommendations = getPlanetaryCulinaryRecommendations(
      planetaryInfluencesResult.dominantPlanets
    );

    // 6. Generate cuisine recommendations
    const cuisineRecommendations = generateCuisineRecommendations(
      planetaryInfluencesResult.dominantPlanets,
      elementalProperties
    );

    // 6. Combine all results
    const result: ComprehensiveAlchemicalResult = {
      kalchm,
      elementalProperties,
      planetaryInfluences: planetaryInfluencesResult,
      recommendations: {
        elemental: elementalRecommendations,
        culinary: culinaryRecommendations,
        cuisines: cuisineRecommendations?.slice(0, 5) // Top 5 cuisine recommendations
      },
      timestamp: new Date()?.toISOString(),
      cacheKey
    };

    return result;

  } catch (error) {
    // console.error('Error in comprehensive alchemical calculation:', error);
    
    // Return fallback result
    return await getFallbackResult(input, cacheKey);
  }
}

/**
 * Calculate recipe compatibility using the streamlined system
 */
export function calculateRecipeCompatibility(
  recipeElementalProperties: ElementalProperties,
  currentMomentAlchemicalResult: ComprehensiveAlchemicalResult
): {
  compatibilityScore: number;
  kalchmAlignment: number;
  elementalAlignment: number;
  planetaryAlignment: number;
  recommendations: string[];
} {
  try {
    // Use the dedicated recipe matching module
    const recipeResult = recipeMatching.calculateRecipeCompatibility(
      recipeElementalProperties,
      currentMomentAlchemicalResult.kalchm
    );

    // Calculate planetary alignment
    const planetaryAlignment = calculatePlanetaryAlignment(
      recipeElementalProperties,
      currentMomentAlchemicalResult.planetaryInfluences
    );

    // Overall compatibility score (weighted average)
    const compatibilityScore = (
      recipeResult.elementalAlignment * 0.4 +
      recipeResult.alchemicalAlignment * 0.35 +
      planetaryAlignment * 0.25
    );

    // Combine recommendations
    const recommendations = [
      ...recipeResult.recommendations,
      ...generateCompatibilityRecommendations(
        compatibilityScore,
        recipeResult.elementalAlignment,
        recipeResult.alchemicalAlignment,
        planetaryAlignment
      )
    ];

    return {
      compatibilityScore,
      kalchmAlignment: recipeResult.alchemicalAlignment,
      elementalAlignment: recipeResult.elementalAlignment,
      planetaryAlignment,
      recommendations
    };

  } catch (error) {
    // console.error('Error calculating recipe compatibility:', error);
    return {
      compatibilityScore: 0.7,
      kalchmAlignment: 0.7,
      elementalAlignment: 0.7,
      planetaryAlignment: 0.7,
      recommendations: ['Recipe compatibility could not be fully calculated']
    };
  }
}

/**
 * Calculate Kalchm alignment between recipe and user
 */
function calculateKalchmAlignment(
  recipeProperties: ElementalProperties,
  currentMomentKalchm: KalchmResult
): number {
  // Convert recipe properties to approximate alchemical properties
  const recipeAlchemical = {
    Spirit: recipeProperties.Fire * 0.7 + recipeProperties.Air * 0.3,
    Essence: recipeProperties.Water * 0.7 + recipeProperties.Fire * 0.3,
    Matter: recipeProperties.Earth * 0.7 + recipeProperties.Water * 0.3,
    Substance: recipeProperties.Air * 0.7 + recipeProperties.Earth * 0.3
  };

  // Calculate similarity to current moment's alchemical properties
  let alignment = 0;
  let totalWeight = 0;

  Object.keys(recipeAlchemical || {}).forEach(property => {
    const key = property as keyof AlchemicalProperties;
    const recipeValue = recipeAlchemical[key];
    const currentMomentValue = currentMomentKalchm?.alchemicalProperties?.[key];
    const weight = (recipeValue + currentMomentValue) / 2;

    alignment += (1 - Math.abs(recipeValue - currentMomentValue) / Math.max(recipeValue, currentMomentValue)) * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? alignment / totalWeight : 0.7;
}

/**
 * Calculate planetary alignment between recipe and current moment
 */
export function calculatePlanetaryAlignment(
  recipeProperties: ElementalProperties,
  currentMomentPlanetary: {
    alchemicalInfluences: { [key: string]: number };
    elementalInfluences: { [key: string]: number };
    dominantPlanets: Array<{ planet: string; strength: number; element: Element }>;
    planetaryHours?: { dayRuler: string; hourRuler: string; influence: number };
  }
): number {
  const recipeDominant = getDominantElement(recipeProperties);
  const currentMomentDominantPlanets = currentMomentPlanetary.dominantPlanets?.slice(0, 3);

  let alignment = 0;
  let matches = 0;

  (currentMomentDominantPlanets || []).forEach((planet: { planet: string; strength: number; element: Element }) => {
    if (planet.element === recipeDominant) {
      alignment += planet.strength;
      matches++;
    }
  });

  // Base alignment plus bonus for matches
  const baseAlignment = 0.5;
  const matchBonus = matches > 0 ? (alignment / matches) * 0.3 : 0;

  return Math.min(1.0, baseAlignment + matchBonus);
}

/**
 * Generate compatibility recommendations
 */
function generateCompatibilityRecommendations(
  overall: number,
  elemental: number,
  kalchm: number,
  planetary: number
): string[] {
  const recommendations: string[] = [];

  if (overall >= 0.8) {
    recommendations?.push('Excellent compatibility - this recipe aligns perfectly with your current state');
  } else if (overall >= 0.6) {
    recommendations?.push('Good compatibility - this recipe should work well for you');
  } else if (overall >= 0.4) {
    recommendations?.push('Moderate compatibility - consider adjusting preparation or timing');
  } else {
    recommendations?.push('Lower compatibility - you might want to try a different recipe');
  }

  if (elemental < 0.5) {
    recommendations?.push('Consider adding ingredients that complement your dominant element');
  }

  if (kalchm < 0.5) {
    recommendations?.push('The alchemical properties may not align - try adjusting cooking methods');
  }

  if (planetary < 0.5) {
    recommendations?.push('Timing may be important - consider preparing during favorable planetary hours');
  }

  return recommendations;
}

/**
 * Get result when calculations fail - try astrologize API before pure fallback
 */
async function getFallbackResult(input: CalculationInput, cacheKey: string): Promise<ComprehensiveAlchemicalResult> {
  try {
    // Try to get real planetary positions from astrologize API

    const realPositions = await getCurrentPlanetaryPositions();
    
    // console.log('🌟 Using astrologize API for fallback calculations');
    
    // Create a new input with real positions
    const enhancedInput: CalculationInput = {
      ...input,
      planetaryPositions: realPositions as any // Type assertion for compatibility
    };
    
    // Try calculation again with real data
    return await calculateComprehensiveAlchemicalResult(enhancedInput);
    
  } catch (astrologizeError) {
    // console.warn('Astrologize API also failed in fallback, using static fallback:', astrologizeError);
    
    // Only use static fallback as last resort
    const fallbackElemental: ElementalProperties = { 
      Fire: 0.25, 
      Water: 0.25, 
      Air: 0.25,
      Earth: 0.25
    };

    return {
      kalchm: {
        alchemicalProperties: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        },
        elementalValues: fallbackElemental,
        thermodynamics: {
          heat: 0.5,
          entropy: 0.5,
          reactivity: 0.5,
          gregsEnergy: 0.5,
          kalchm: 1.0,
          monicaConstant: 0.5
        },
        dominantElement: 'Fire',
        dominantProperty: 'Essence',
        timestamp: new Date().toISOString()
      },
      elementalProperties: fallbackElemental,
      planetaryInfluences: {
        alchemicalInfluences: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        },
        elementalInfluences: fallbackElemental,
        dominantPlanets: [
          { planet: 'Sun', strength: 0.8, element: 'Fire' },
          { planet: 'Moon', strength: 0.7, element: 'Water' },
          { planet: 'Mercury', strength: 0.6, element: 'Air' }
        ]
      },
      recommendations: {
        elemental: {
          dominant: 'Fire',
          balance: 0.7,
          recommendations: ['⚠️ Using emergency calculations - results may be limited']
        },
        culinary: {
          ingredients: ['Warming spices (fallback)'],
          cookingMethods: ['Grilling', 'Roasting'],
          flavors: ['Spicy', 'Bold'],
          timing: ['Cook during daylight hours']
        }
      },
      timestamp: new Date().toISOString(),
      cacheKey
    };
  }
}

// Placeholder functions for missing implementations
function applySeasonalAdjustments(elementalProperties: ElementalProperties, season: string): ElementalProperties {
  // Simple seasonal adjustments - could be enhanced
  const adjustment = 0.1;
  const adjustedProps = { ...elementalProperties };
  
  switch (season?.toLowerCase()) {
    case 'spring':
      adjustedProps.Air += adjustment;
      break;
    case 'summer':
      adjustedProps.Fire += adjustment;
      break;
    case 'fall':
    case 'autumn':
      adjustedProps.Earth += adjustment;
      break;
    case 'winter':
      adjustedProps.Water += adjustment;
      break;
  }
  
  return adjustedProps;
}

function applyLunarPhaseAdjustments(elementalProperties: ElementalProperties, lunarPhase: string): ElementalProperties {
  // Simple lunar phase adjustments
  const adjustment = 0.05;
  const adjustedProps = { ...elementalProperties };
  
  switch (lunarPhase?.toLowerCase()) {
    case 'new moon':
      adjustedProps.Water += adjustment;
      break;
    case 'full moon':
      adjustedProps.Fire += adjustment;
      break;
    case 'waxing':
      adjustedProps.Air += adjustment;
      break;
    case 'waning':
      adjustedProps.Earth += adjustment;
      break;
  }
  
  return adjustedProps;
}

function generateCuisineRecommendations(dominantPlanets: unknown[], elementalProperties: ElementalProperties): string[] {
  // Simple cuisine recommendations based on dominant elements
  const dominantElement = getDominantElement(elementalProperties);
  
  switch (dominantElement) {
    case 'Fire':
      return ['Mexican', 'Indian', 'Thai', 'Cajun', 'Middle Eastern'];
    case 'Water':
      return ['Japanese', 'Seafood', 'Soup-based', 'Raw/Sushi', 'Steamed'];
    case 'Air':
      return ['Mediterranean', 'Light salads', 'Airy pastries', 'Whipped dishes'];
    case 'Earth':
      return ['Italian', 'Comfort food', 'Root vegetables', 'Grounding grains'];
    default:
      return ['Balanced fusion', 'Seasonal', 'Local cuisine'];
  }
}

// Simplified recipe matching object for compatibility
const recipeMatching = {
  calculateRecipeCompatibility: (recipeProps: ElementalProperties, kalchm: KalchmResult) => ({
    elementalAlignment: 0.7,
    alchemicalAlignment: 0.7,
    recommendations: ['Recipe compatibility calculated with simplified system']
  })
};

// Export all calculation functions and types
export {
  // Core engines
  kalchmEngine,
  elementalCalculations,
  planetaryInfluences,
  
  // Types (remove duplicate exports)
  type KalchmResult,

  type ElementalValues,
  type ThermodynamicResults,
  
  // Utility functions
  calculateKalchmResults,
  toElementalProperties,
  calculateComprehensiveElementalProperties,
  calculateElementalCompatibility,
  getDominantElement,
  getElementalRecommendations,
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations,
  ZODIAC_ELEMENTS
};

// Default export
export default {
  calculateComprehensiveAlchemicalResult,
  calculateRecipeCompatibility,
  kalchmEngine,
  elementalCalculations,
  planetaryInfluences
}; 
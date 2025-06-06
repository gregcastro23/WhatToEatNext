import type { ElementalProperties, ThermodynamicMetrics, LunarPhase, ZodiacSign, PlanetaryAspect } from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";
import { Recipe } from '@/types/recipe';

import { cuisinesMap } from '../../data/cuisines';
import { LUNAR_PHASES } from '../../constants/lunar';
import { cuisineFlavorProfiles } from '../../data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '../../data/planetaryFlavorProfiles';
import { allIngredients } from '../../data/ingredients';
import { calculateLunarPhase, calculatePlanetaryPositions, calculatePlanetaryAspects } from "../astrologyUtils";
import { createElementalProperties } from '../elemental/elementalUtils';

import { Element } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";
import { AstrologicalState } from '@/types/celestial';

import { PlanetaryPosition } from "@/types/celestial";
import { CelestialPosition } from "@/types/celestial";
// DUPLICATE: import { ElementalProperties } from "@/types/alchemy";
// DUPLICATE: import { Element } from "@/types/alchemy";

interface SauceData {
  id?: string;
  name?: string;
  elementalProperties?: ElementalProperties, planetaryInfluences?: string[];
  flavorProfile?: { [key: string]: number };
}
// Re-export types for convenience
export type PlanetaryDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type PlanetaryHour = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | null;

export interface TimeFactors { planetaryDay: PlanetaryDay, planetaryHour: PlanetaryHour, timeOfDay: TimeOfDay, season: Season, date: Date }

/**
 * Complete astrological state information
 */
, activePlanets: string[];
  dominantPlanets?: string[];
  
  // Elemental properties
  dominantElement?: Element, elementalProperties?: ElementalProperties,// Time-related
  isDaytime?: boolean;
  planetaryHour?: string;
  timeOfDay?: string;
  season?: string;
  
  // Modality
  dominantModality?: Modality;
  
  // Aspects
  aspects?: PlanetaryAspect[];
  
  // Additional data for specific implementations
  ascendantSign?: string;
  currentZodiacSign?: string;
  tarotPlanetaryBoosts?: { [key: string]: number };
  
  // Tracking fields
  loading?: boolean;
  isReady?: boolean;
  renderCount?: number;
  error?: string;
}

export interface EnhancedRecipeMatch { dish: any, matchPercentage: number, seasonalScore: number, planetaryDayScore: number, planetaryHourScore: number, astrologicalScore: number, timeOfDayScore: number, elementalScore: number }

export interface CuisineRecommendation {
  cuisine: string, score: number;
  lunarAffinity: number, seasonalAffinity: number;
  elementalAffinity: number, flavorAffinity: number;
  recommendedDishes: string[];
  scoreDetails?: { [key: string]: number };
}

export interface RecommendationOptions {
  season?: string;
  dietary?: string[];
  ingredients?: string[];
  mealType?: string;
  mood?: string;
  preferredElements?: { [key: string]: number };
  limit?: number;
}

interface DetailedScores { seasonal: number, planetaryDay: number, planetaryHour: number, astrological: number, timeOfDay: number, elemental: number }

// Enhanced Cuisine Recommender Class
export class EnhancedCuisineRecommender {
  private static instance: EnhancedCuisineRecommender;
  
  private constructor() {
    // Singleton pattern - no initialization needed
  }

  public static getInstance(): EnhancedCuisineRecommender { if (!EnhancedCuisineRecommender.instance) {
      EnhancedCuisineRecommender.instance = new EnhancedCuisineRecommender() }
    return EnhancedCuisineRecommender.instance;
  }

  /**
   * Get enhanced recipe recommendations for a specific cuisine
   */
  public getRecommendationsForCuisine(
    cuisineName: string, 
    astroState: AstrologicalState, 
    count = 5, 
    mealType: MealType = null, 
    dietaryRestrictions: string[] = []
  ): EnhancedRecipeMatch[] {
    const cuisine = cuisinesMap[cuisineName];
    if (!cuisine) {
      throw new Error(`Cuisine "${cuisineName}" not found`);
    }

    const timeFactors = this.getCurrentTimeFactors();

    // Filter recipes based on meal type and dietary restrictions
    const filteredDishes = cuisine.dishes?.filter((dish) => { 
      if (mealType && !dish.tags?.includes(mealType)) {
        return false;
      }

      if (dietaryRestrictions.length > 0) { 
        for (const restriction of dietaryRestrictions) {
          if (dish.tags && dish.tags.includes(restriction)) {
            return false;
          }
          if (dish.keyIngredients && dish.keyIngredients.some((ing) => 
            ing?.toLowerCase()?.includes(restriction?.toLowerCase())
          )) { 
            return false;
          }
        }
      }

      return true;
    }) || [];

    // Calculate match score for each dish
    const matches: EnhancedRecipeMatch[] = filteredDishes.map((dish) => { 
      const scores = this.calculateDetailedScores(dish, timeFactors, astroState);

      // Calculate total match percentage (weighted average of all scores)
      const totalScore = (
        scores.seasonal * 1.5 +
        scores.planetaryDay * 1.0 +
        scores.planetaryHour * 1.2 +
        scores.astrological * 2.0 +
        scores.timeOfDay * 1.0 +
        scores.elemental * 1.3
      ) / 8.0; // Sum of weights

      const matchPercentage = Math.min(Math.round(totalScore * 100), 100);

      return {
        dish,
        matchPercentage, 
        seasonalScore: Math.round(scores.seasonal * 100), 
        planetaryDayScore: Math.round(scores.planetaryDay * 100), 
        planetaryHourScore: Math.round(scores.planetaryHour * 100), 
        astrologicalScore: Math.round(scores.astrological * 100), 
        timeOfDayScore: Math.round(scores.timeOfDay * 100), 
        elementalScore: Math.round(scores.elemental * 100) 
      };
    });

    // Sort by match percentage (descending) and return top matches
    return matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, count);
  }

  /**
   * Get current time factors (day of week, planetary hour, season)
   */
  private getCurrentTimeFactors(): TimeFactors { 
    const now = new Date(); 
    // Get day of week (planetary day)
    const dayOfWeek = now.getDay(); 
    const planetaryDays: PlanetaryDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
    const planetaryDay = planetaryDays[dayOfWeek]; 
    
    // Calculate planetary hour (based on traditional astrology)
    const hour = now.getHours(); 
    const planetaryRulers: PlanetaryHour[] = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']; 
    const dayRulerIndex = dayOfWeek % planetaryRulers.length;
    const hourRulerIndex = (dayRulerIndex + hour) % planetaryRulers.length;
    const planetaryHour = planetaryRulers[hourRulerIndex]; 
    
    // Get time of day
    let timeOfDay: TimeOfDay;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'Morning';
    } else if (hour >= 12 && hour < 17) { 
      timeOfDay = 'Afternoon'; 
    } else if (hour >= 17 && hour < 21) { 
      timeOfDay = 'Evening'; 
    } else { 
      timeOfDay = 'Night'; 
    }

    // Get season (simplified - based on month)
    const month = now.getMonth();
    let season: Season;
    if (month >= 2 && month <= 4) {
      season = 'spring';
    } else if (month >= 5 && month <= 7) { 
      season = 'summer'; 
    } else if (month >= 8 && month <= 10) { 
      season = 'fall'; 
    } else { 
      season = 'winter'; 
    }

    return {
      planetaryDay,
      planetaryHour,
      timeOfDay,
      season, 
      date: now
    };
  }

  /**
   * Calculate detailed scores for a dish
   */
  private calculateDetailedScores(dish: any, timeFactors: TimeFactors, astroState: AstrologicalState): DetailedScores { 
    return {
      seasonal: this.calculateSeasonalScore(dish, timeFactors.season), 
      planetaryDay: this.calculatePlanetaryDayScore(dish, timeFactors.planetaryDay), 
      planetaryHour: this.calculatePlanetaryHourScore(dish, timeFactors.planetaryHour), 
      astrological: this.calculateAstrologicalScore(dish, astroState), 
      timeOfDay: this.calculateTimeOfDayScore(dish, timeFactors.timeOfDay), 
      elemental: this.calculateElementalScore(dish, astroState.currentZodiacSign || 'aries') 
    };
  }

  private calculateSeasonalScore(dish: any, currentSeason: Season): number { 
    if (!dish.seasonalAffinity) return 0.7; // Default score
    const seasonalScore = dish?.seasonalAffinity?.[currentSeason] || 0.5;
    return Math.min(seasonalScore, 1.0);
  }

  private calculatePlanetaryDayScore(dish: any, planetaryDay: PlanetaryDay): number { 
    if (!dish.planetaryInfluences) return 0.7; // Default score

    // Map planetary days to planets
    const dayToPlanet: Record<PlanetaryDay, string> = {
      Sunday: 'Sun', 
      Monday: 'Moon', 
      Tuesday: 'Mars', 
      Wednesday: 'Mercury', 
      Thursday: 'Jupiter', 
      Friday: 'Venus', 
      Saturday: 'Saturn' 
    };

    const planet = dayToPlanet[planetaryDay];
    if (dish.planetaryInfluences.includes(planet)) { 
      return 0.9; // High score for matching planetary influence 
    }

    return 0.6; // Lower score for non-matching
  }

  private calculatePlanetaryHourScore(dish: any, planetaryHour: PlanetaryHour): number { 
    if (!dish.planetaryInfluences) return 0.7; // Default score
    if (dish.planetaryInfluences.includes(planetaryHour)) {
      return 0.85; // Good score for matching planetary hour 
    }

    return 0.65; // Lower score for non-matching
  }

  private calculateAstrologicalScore(dish: any, astroState: AstrologicalState): number { 
    let score = 0.7; // Base score
    
    // Lunar phase influence
    if (dish.lunarAffinity && astroState.lunarPhase) {
      const lunarScore = dish.lunarAffinity[astroState.lunarPhase] || 0.5;
      score = (score + lunarScore) / 2;
    }

    // Zodiac sign influence
    if (dish.zodiacAffinity && astroState.currentZodiacSign) { 
      const zodiacScore = dish.zodiacAffinity[astroState.currentZodiacSign] || 0.5;
      score = (score + zodiacScore) / 2;
    }

    return Math.min(score, 1.0);
  }

  private calculateTimeOfDayScore(dish: any, timeOfDay: TimeOfDay): number { 
    if (!dish.timeOfDayAffinity) return 0.7; // Default score
    const timeScore = dish?.timeOfDayAffinity?.[timeOfDay] || 0.5;
    return Math.min(timeScore, 1.0);
  }

  private calculateElementalScore(dish: any, dominantElement: string): number { 
    if (!dish.elementalState) return 0.7; // Default score
    // Get the dominant element value
    const elementValue = dish?.elementalState?.[dominantElement] || 0.25;
    // Higher elemental alignment = higher score
    return Math.min(elementValue * 1.5, 1.0);
  }
}

// Basic Cuisine Recommendation Functions

/**
 * Generate top sauce recommendations based on elemental profile
 */
export function generateTopSauceRecommendations(currentElementalProfile: ElementalProperties | null = null, count = 5) {
  // Import sauce data
  const { allSauces } = require('@/data/sauces');
  
  // Use provided elemental profile or default
  const userProfile = currentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  
  // Get current date for planetary calculations
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Get planetary day influence
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetaryDay = planetaryDays[dayOfWeek];
  
  // Convert sauces object to array
  const saucesArray = Object.values(allSauces || {});
  
  // Map all sauces with scores
  const scoredSauces = saucesArray.map((sauce: any) => {
    // Calculate elemental match score
    const elementalMatchScore = calculateElementalMatch(
      (sauce as Record<string, any>)?.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      userProfile
    );
    
    // Calculate planetary day bonus
    let planetaryDayScore = 0.7; // base score
    if ((sauce as Record<string, any>).planetaryInfluences && 
        (sauce as Record<string, any>).planetaryInfluences.includes(currentPlanetaryDay)) { 
      planetaryDayScore = 0.9; // bonus for matching the day 
    }
    
    // Calculate flavor profile match if available
    let flavorMatchScore = 0.7; // base score
    if ((sauce as Record<string, any>).flavorProfile) {
      const planetaryFlavors: Record<string, Record<string, number>> = {
        Sun: {}, moon: {}, Mars: {}, Mercury: {}, Jupiter: {}, Venus: {}, Saturn: { bitter: 0.7, earthy: 0.8 }
      };
      
      const currentFlavors = planetaryFlavors[currentPlanetaryDay] || {};
      
      // Calculate flavor match
      let flavorMatch = 0;
      let flavorCount = 0;
      
      Object.entries(currentFlavors).forEach(([flavor, strength]) => { 
        if ((sauce as Record<string, any>).flavorProfile[flavor]) {
          flavorMatch += (1 - Math.abs((sauce as Record<string, any>)?.flavorProfile[flavor] - strength));
          flavorCount++;
        }
      });
      
      if (flavorCount > 0) { 
        flavorMatchScore = flavorMatch / flavorCount;
      }
    }
    
    // Calculate overall match percentage - weighted average of all scores
    const matchPercentage = Math.round(
      (elementalMatchScore * 0.5 + planetaryDayScore * 0.3 + flavorMatchScore * 0.2) * 100
    );
    
    return { 
      ...sauce,
      id: (sauce as Record<string, any>).id || (sauce as Record<string, any>).name?.replace(/\s+/g, '-')?.toLowerCase(), 
      matchPercentage, 
      elementalMatchScore: Math.round(elementalMatchScore * 100), 
      planetaryDayScore: Math.round(planetaryDayScore * 100), 
      planetaryHourScore: Math.round(flavorMatchScore * 100) // Using flavor match for hour score 
    };
  });
  
  // Sort by overall match percentage and return top results
  return scoredSauces
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, count);
}

/**
 * Recommend cuisines based on astrological state
 */
export function recommendCuisines(
  astroState: AstrologicalState, 
  options: RecommendationOptions = {}
): CuisineRecommendation[] {
  const { lunarPhase, currentZodiacSign } = astroState;
  const {
    season = 'any',
    dietary = [],
    ingredients = [],
    preferredElements = {},
    limit = 20
  } = options;

  // Initialize scores object
  const scores: { [key: string]: CuisineRecommendation } = {};

  // Process each cuisine
  for (const [cuisineName, cuisineData] of Object.entries(cuisineFlavorProfiles)) { 
    // Skip cuisines that don't meet dietary requirements
    if (dietary.length > 0 && !meetsAllDietaryRequirements(cuisineData, dietary)) {
      continue;
    }

    // Initialize the recommendation
    scores[cuisineName] = {
      cuisine: cuisineName, 
      score: 0.5, // Base score
      lunarAffinity: 0.5, 
      seasonalAffinity: 0.5, 
      elementalAffinity: 0.5, 
      flavorAffinity: 0.5, 
      recommendedDishes: [], 
      scoreDetails: {}
    };

    // Add some variation to scores
    scores[cuisineName].score += Math.random() * 0.3;
    
    // Find recommended dishes
    const dishes = findRecommendedDishes(
      cuisineData,
      lunarPhase,
      currentZodiacSign as ZodiacSign,
      ingredients,
      season
    );
    
    scores[cuisineName].recommendedDishes = dishes;
  }

  // Convert to array and sort by score
  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Check if cuisine meets dietary requirements
 */
function meetsAllDietaryRequirements(cuisineData: any, requirements: string[]): boolean { 
  // Simple implementation - can be enhanced based on actual cuisine data structure
  return requirements.every(req => {
    // Check if cuisine supports this dietary requirement
    return cuisineData.dietaryOptions?.includes(req) || true; // Default to true for now 
  });
}

/**
 * Find recommended dishes for a cuisine
 */
function findRecommendedDishes(
  cuisineData: any, 
  lunarPhase: LunarPhase, 
  zodiacSign?: ZodiacSign, 
  ingredients: string[] = [],
  season = 'any'
): string[] { 
  // Simple implementation - return some default dishes
  const defaultDishes = cuisineData.popularDishes || cuisineData.dishes || [];
  
  // Filter based on season if specified
  if (season !== 'any' && cuisineData.seasonalDishes) {
    const seasonalDishes = cuisineData?.seasonalDishes?.[season] || [];
    return seasonalDishes?.slice(0, 3);
  }
  
  // Return first few dishes as recommendations
  return Array.isArray(defaultDishes) ? defaultDishes?.slice(0, 3) : [];
}

/**
 * Get quick cuisine recommendation based on lunar phase
 */
export function getQuickCuisineRecommendation(lunarPhase: LunarPhase): string[] {
  const lunarCuisineMap: Record<LunarPhase, string[]> = {
    'new moon': ['Japanese', 'Korean', 'Vietnamese'],
    'waxing crescent': ['Italian', 'Mediterranean', 'Greek'],
    'first quarter': ['Mexican', 'Spanish', 'Peruvian'],
    'waxing gibbous': ['Indian', 'Thai', 'Chinese'],
    'full moon': ['French', 'German', 'Russian'],
    'waning gibbous': ['Middle Eastern', 'Turkish', 'Moroccan'],
    'last quarter': ['American', 'British', 'Australian'],
    'waning crescent': ['Scandinavian', 'Nordic', 'Finnish']
  };

  return lunarCuisineMap[lunarPhase] || ['Italian', 'Mediterranean', 'American'];
}

/**
 * Calculate elemental match between recipe and user elements
 * Following elemental principles: like reinforces like, all combinations work well
 */
export function calculateElementalMatch(
  recipeElements: ElementalProperties, 
  userElements: ElementalProperties
): number { 
  // Calculate compatibility for each element pAir
  let totalCompatibility = 0;
  let elementCount = 0;
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  
  for (const element of elements) {
    const recipeValue = recipeElements[element] || 0;
    const userValue = userElements[element] || 0;
    
    if (recipeValue > 0 && userValue > 0) {
      // Same element has highest compatibility (0.9)
      // Different elements have good compatibility (0.7)
      const compatibility = 0.9; // All elements work well together
      // Weight by the strength of both values
      const weight = (recipeValue + userValue) / 2;
      totalCompatibility += compatibility * weight;
      elementCount += weight;
    }
  }

  // Return average compatibility, defaulting to 0.7 if no matches
  return elementCount > 0 ? totalCompatibility / elementCount : 0.7;
}

/**
 * Get CSS class for match score display
 */
export function getMatchScoreClass(score: number): string {
  if (score >= 90) return 'match-excellent';
  if (score >= 80) return 'match-very-good';
  if (score >= 70) return 'match-good';
  if (score >= 60) return 'match-fair';
  return 'match-poor';
}

/**
 * Render score badge with appropriate styling
 */
export function renderScoreBadge(score: number, hasDualMatch: boolean = false): string {
  const scoreClass = getMatchScoreClass(score);
  const dualClass = hasDualMatch ? ' dual-match' : '';
  
  return `<span class="score-badge ${scoreClass}${dualClass}">${score}%</span>`;
}

/**
 * Calculate elemental profile from zodiac sign
 */
export function calculateElementalProfileFromZodiac(
  currentZodiacSign: ZodiacSign, 
  lunarPhase?: LunarPhase
): ElementalProperties {
  // Base elemental associations for zodiac signs
  const zodiacElements: Record<ZodiacSign, ElementalProperties> = {
    aries: createElementalProperties({ Fire: 0.8, Water: 0.05, Earth: 0.05, Air: 0.1 }), 
    taurus: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 }), 
    gemini: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 }), 
    cancer: createElementalProperties({ Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 }), 
    leo: createElementalProperties({ Fire: 0.8, Water: 0.05, Earth: 0.05, Air: 0.1 }), 
    virgo: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 }), 
    libra: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 }), 
    scorpio: createElementalProperties({ Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 }), 
    sagittarius: createElementalProperties({ Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 }), 
    capricorn: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 }), 
    aquarius: createElementalProperties({ Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 }), 
    pisces: createElementalProperties({ Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 })
  };

  let profile = zodiacElements[currentZodiacSign] || createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  });

  // Modify based on lunar phase if provided
  if (lunarPhase) {
    const lunarModifiers: Record<LunarPhase, ElementalProperties> = {
      'new moon': createElementalProperties({ Fire: 0.7, Water: 1.2, Earth: 0.9, Air: 1.0  }),
      'waxing crescent': createElementalProperties({ Fire: 0.8, Water: 1.1, Earth: 0.9, Air: 1.0  }),
      'first quarter': createElementalProperties({ Fire: 0.9, Water: 1.0, Earth: 0.9, Air: 1.0  }),
      'waxing gibbous': createElementalProperties({ Fire: 1.0, Water: 0.9, Earth: 1.0, Air: 1.0  }),
      'full moon': createElementalProperties({ Fire: 1.1, Water: 0.8, Earth: 1.0, Air: 1.1  }),
      'waning gibbous': createElementalProperties({ Fire: 1.0, Water: 0.9, Earth: 1.1, Air: 1.0  }),
      'last quarter': createElementalProperties({ Fire: 0.9, Water: 1.0, Earth: 1.1, Air: 1.0  }),
      'waning crescent': createElementalProperties({ Fire: 0.9, Water: 1.0, Earth: 1.1, Air: 1.0  })
    };

    const modifier = lunarModifiers[lunarPhase];
    profile = { Fire: profile.Fire * modifier.Fire, Water: profile.Water * modifier.Water, Earth: profile.Earth * modifier.Earth, Air: profile.Air * modifier.Air };

    // Normalize to ensure sum equals 1
    const total = profile.Fire + profile.Water + profile.Earth + profile.Air;
    profile = { Fire: profile.Fire / total, Water: profile.Water / total, Earth: profile.Earth / total, Air: profile.Air / total };
  }

  return profile;
}

/**
 * Calculate elemental contributions from planetary positions
 */
export function calculateElementalContributionsFromPlanets(
  positions: { [key: string]: any }
): ElementalProperties {
  // Simplified planetary elemental associations
  const planetaryElements: { [key: string]: ElementalProperties } = {
    Sun: createElementalProperties({ Fire: 0.8, Water: 0.05, Earth: 0.05, Air: 0.1 }),
    moon: createElementalProperties({ Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 }),
    Mercury: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 }),
    Venus: createElementalProperties({ Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 }),
    Mars: createElementalProperties({ Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 }),
    Jupiter: createElementalProperties({ Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 }),
    Saturn: createElementalProperties({ Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 })
  };

  let totalElements = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
  let planetCount = 0;

  for (const [planet, position] of Object.entries(positions)) { 
    if (planetaryElements[planet]) {
      const elements = planetaryElements[planet];
      totalElements.Fire += elements.Fire;
      totalElements.Water += elements.Water;
      totalElements.Earth += elements.Earth;
      totalElements.Air += elements.Air;
      planetCount++;
    }
  }

  // Average the contributions
  if (planetCount > 0) { 
    totalElements = { 
      Fire: totalElements.Fire / planetCount, 
      Water: totalElements.Water / planetCount, 
      Earth: totalElements.Earth / planetCount, 
      Air: totalElements.Air / planetCount 
    };
  } else {
    // Default balanced profile
    totalElements = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
  }

  return totalElements;
}

/**
 * Calculate base score for cuisine
 */
function calculateBaseScore(cuisineProfile: any, astroState: AstrologicalState): number { 
  // Simple base score calculation
  let score = 0.5;
  
  // Add lunar phase influence
  if (cuisineProfile.lunarAffinity && astroState.lunarPhase) {
    const lunarScore = cuisineProfile.lunarAffinity[astroState.lunarPhase] || 0.5;
    score = (score + lunarScore) / 2;
  }

  // Add zodiac influence
  if (cuisineProfile.zodiacAffinity && astroState.currentZodiacSign) { 
    const zodiacScore = cuisineProfile.zodiacAffinity[astroState.currentZodiacSign] || 0.5;
    score = (score + zodiacScore) / 2;
  }

  return Math.min(score, 1.0);
}

/**
 * Calculate cuisine score based on astrological state
 */
export function calculateCuisineScore(cuisine: any, astroState: AstrologicalState): number { 
  return calculateBaseScore(cuisine, astroState);
}

// This is a legacy function that we keep for backward compatibility
// It wraps the new service implementation
export async function getCuisineRecommendations({
  elements = null,
  planetaryPositions = {},
  limit = 10
}: {
  elements?: ElementalProperties | null;
  planetaryPositions?: Record<string, { sign: string, degree: number }>;
  limit?: number;
}) {
  try {
    // Lazy-import the recommendation service to avoid circular dependencies
    const { recommendationService } = await import('@/services/ConsolidatedRecommendationService');
    
    // Call the consolidated service with the provided parameters
    const result = await recommendationService.getRecommendedCuisines({ 
      elementalProperties: elements || undefined, 
      planetaryPositions, 
      limit 
    });
    
    // Transform the result to match the legacy format
    return { recommendations: result.items, scores: result.scores, details: result.context };
  } catch (error) {
    console.error('Error in getCuisineRecommendations:', error);
    
    // Return empty results on error
    return {
      recommendations: [], 
      scores: {}, 
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Export the enhanced recommender instance for convenience
export const enhancedCuisineRecommender = EnhancedCuisineRecommender.getInstance(); 
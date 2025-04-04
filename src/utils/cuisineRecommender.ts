import type { LunarPhase, ZodiacSign, PlanetaryAspect } from '@/types/alchemy';
import { LUNAR_PHASES } from '@/constants/lunar';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import type { Ingredient } from '@/data/ingredients/types';
import { calculateLunarPhase, calculatePlanetaryPositions, calculatePlanetaryAspects } from '@/utils/astrologyUtils';

interface AstrologicalState {
  lunarPhase: LunarPhase;
  zodiacSign?: ZodiacSign;
  celestialEvents?: string[];
  aspects?: PlanetaryAspect[];
}

interface CuisineRecommendation {
  cuisine: string;
  score: number;
  lunarAffinity: number;
  seasonalAffinity: number;
  elementalAffinity: number;
  flavorAffinity: number;
  recommendedDishes: string[];
}

interface RecommendationOptions {
  season?: string;
  dietary?: string[];
  ingredients?: string[];
  mealType?: string;
  mood?: string;
  preferredElements?: Record<string, number>;
}

/**
 * Recommend cuisines based on lunar phase, astrological state, and other factors
 */
export function recommendCuisines(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): CuisineRecommendation[] {
  const { 
    lunarPhase,
    zodiacSign,
    aspects = []
  } = astroState;
  
  const {
    season = 'any',
    dietary = [],
    ingredients = [],
    mealType = 'any',
    mood = 'any',
    preferredElements = {}
  } = options;
  
  // Get lunar phase data - convert spaces to camelCase format if needed
  const lunarPhaseKey = lunarPhase.replace(/\s+/g, '') as keyof typeof LUNAR_PHASES;
  const lunarPhaseData = LUNAR_PHASES[lunarPhaseKey] || LUNAR_PHASES.new;
  
  // Calculate base scores for each cuisine
  const scores: Record<string, CuisineRecommendation> = {};
  
  for (const [cuisineName, cuisineData] of Object.entries(cuisineFlavorProfiles)) {
    // Skip cuisines that don't meet dietary requirements
    if (dietary.length > 0 && !meetsAllDietaryRequirements(cuisineData, dietary)) {
      continue;
    }
    
    // Initialize the recommendation
    scores[cuisineName] = {
      cuisine: cuisineName,
      score: 0,
      lunarAffinity: 0,
      seasonalAffinity: 0,
      elementalAffinity: 0,
      flavorAffinity: 0,
      recommendedDishes: []
    };
    
    // Calculate lunar affinity
    const lunarAffinity = calculateLunarAffinity(cuisineData, lunarPhaseData);
    scores[cuisineName].lunarAffinity = lunarAffinity;
    scores[cuisineName].score += lunarAffinity * 2; // Weight lunar phase higher
    
    // Add aspect-based score adjustments
    if (aspects.length > 0 && cuisineData.planetaryResonance) {
      const aspectScore = calculateAspectAffinity(aspects, cuisineData.planetaryResonance);
      scores[cuisineName].score += aspectScore;
    }
    
    // Calculate seasonal affinity
    if (season !== 'any' && cuisineData.seasonalPreference) {
      const seasonalAffinity = cuisineData.seasonalPreference.includes(season) ? 0.8 : 0.5;
      scores[cuisineName].seasonalAffinity = seasonalAffinity;
      scores[cuisineName].score += seasonalAffinity;
    }
    
    // Calculate elemental affinity
    if (cuisineData.elementalAlignment && Object.keys(preferredElements).length > 0) {
      const elementalAffinity = calculateElementalAffinity(
        cuisineData.elementalAlignment,
        preferredElements
      );
      scores[cuisineName].elementalAffinity = elementalAffinity;
      scores[cuisineName].score += elementalAffinity;
    }
    
    // Calculate flavor affinity based on ingredients
    if (ingredients.length > 0 && cuisineData.flavorProfiles) {
      const flavorAffinity = calculateFlavorAffinity(cuisineData, ingredients);
      scores[cuisineName].flavorAffinity = flavorAffinity;
      scores[cuisineName].score += flavorAffinity;
    }
    
    // Add bonus for suitable meal types
    if (mealType !== 'any' && cuisineData.traditionalMealPatterns && cuisineData.traditionalMealPatterns.includes(mealType)) {
      scores[cuisineName].score += 0.5;
    }
    
    // Find recommended dishes based on factors
    const dishes = findRecommendedDishes(
      cuisineData, 
      lunarPhase, 
      zodiacSign, 
      ingredients, 
      season
    );
    
    scores[cuisineName].recommendedDishes = dishes;
  }
  
  // Sort cuisines by score and return top results
  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Calculate how well a cuisine aligns with the current lunar phase
 */
function calculateLunarAffinity(
  cuisineData: any,
  lunarPhaseData: any
): number {
  // Base affinity score
  let affinity = 0.5;
  
  // Check if the cuisine has specific lunar phase affinity
  if (cuisineData.lunarPhaseAffinity) {
    const phaseAffinity = cuisineData.lunarPhaseAffinity[lunarPhaseData.name];
    if (phaseAffinity) {
      affinity = phaseAffinity;
    }
  }
  
  // Check elements
  if (cuisineData.elementalAlignment && lunarPhaseData.elementalModifier) {
    let elementalMatch = 0;
    let totalWeight = 0;
    
    for (const [element, weight] of Object.entries(cuisineData.elementalAlignment)) {
      if (lunarPhaseData.elementalModifier[element]) {
        elementalMatch += (weight as number) * lunarPhaseData.elementalModifier[element];
      }
      totalWeight += weight as number;
    }
    
    // Normalize and add to affinity
    if (totalWeight > 0) {
      affinity += (elementalMatch / totalWeight) * 0.5;
    }
  }
  
  // Check enhanced categories
  if (cuisineData.specialties && lunarPhaseData.enhancedCategories) {
    const specialtyMatch = cuisineData.specialties.some(
      (specialty: string) => lunarPhaseData.enhancedCategories.includes(specialty)
    );
    
    if (specialtyMatch) {
      affinity += 0.2;
    }
  }
  
  // Check cooking methods
  if (cuisineData.cookingTechniques && lunarPhaseData.cookingMethods) {
    const techniqueMatch = cuisineData.cookingTechniques.some(
      (technique: string) => lunarPhaseData.cookingMethods.includes(technique)
    );
    
    if (techniqueMatch) {
      affinity += 0.2;
    }
  }
  
  return Math.min(1, affinity);
}

/**
 * Calculate how well a cuisine matches the preferred elemental properties
 */
function calculateElementalAffinity(
  cuisineElements: Record<string, number>,
  preferredElements: Record<string, number>
): number {
  let affinity = 0;
  let totalWeight = 0;
  
  for (const [element, weight] of Object.entries(preferredElements)) {
    if (cuisineElements[element]) {
      affinity += (weight * cuisineElements[element]);
    }
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? affinity / totalWeight : 0.5;
}

/**
 * Calculate how well a cuisine matches the flavor profile of the given ingredients
 */
function calculateFlavorAffinity(
  cuisineData: any,
  ingredientNames: string[]
): number {
  // If no flavor profile data available, return neutral score
  if (!cuisineData.flavorProfiles) {
    return 0.5;
  }
  
  // Get flavor profiles of ingredients
  const ingredientProfiles = ingredientNames.map(name => {
    try {
      // This should be replaced with actual ingredient lookup logic
      return getFlavorProfileForIngredient(name);
    } catch (e) {
      return null;
    }
  }).filter(profile => profile !== null);
  
  if (ingredientProfiles.length === 0) {
    return 0.5;
  }
  
  // Calculate average ingredient flavor profile
  const avgProfile = {
    spicy: 0,
    sweet: 0,
    sour: 0,
    bitter: 0,
    salty: 0,
    umami: 0
  };
  
  ingredientProfiles.forEach(profile => {
    if (!profile) return;
    avgProfile.spicy += profile.spicy || 0;
    avgProfile.sweet += profile.sweet || 0;
    avgProfile.sour += profile.sour || 0;
    avgProfile.bitter += profile.bitter || 0;
    avgProfile.salty += profile.salty || 0;
    avgProfile.umami += profile.umami || 0;
  });
  
  for (const flavor in avgProfile) {
    avgProfile[flavor as keyof typeof avgProfile] /= ingredientProfiles.length;
  }
  
  // Calculate similarity between cuisine and ingredient profiles
  let similarity = 0;
  let totalWeight = 0;
  
  for (const flavor in cuisineData.flavorProfiles) {
    const cuisineValue = cuisineData.flavorProfiles[flavor] || 0;
    const ingredientValue = avgProfile[flavor as keyof typeof avgProfile] || 0;
    
    // Calculate difference (0 = perfect match, 1 = complete mismatch)
    const difference = Math.abs(cuisineValue - ingredientValue);
    
    // Convert to similarity (1 = perfect match, 0 = complete mismatch)
    const flavorSimilarity = 1 - difference;
    
    // Weight by the importance of the flavor in the cuisine
    similarity += flavorSimilarity * cuisineValue;
    totalWeight += cuisineValue;
  }
  
  return totalWeight > 0 ? similarity / totalWeight : 0.5;
}

/**
 * Check if a cuisine meets all dietary requirements
 */
function meetsAllDietaryRequirements(cuisineData: any, requirements: string[]): boolean {
  if (!cuisineData.dietarySuitability) {
    return false;
  }
  
  return requirements.every(req => 
    cuisineData.dietarySuitability[req] && cuisineData.dietarySuitability[req] >= 0.6
  );
}

/**
 * Find recommended dishes from a cuisine based on various factors
 */
function findRecommendedDishes(
  cuisineData: any,
  lunarPhase: LunarPhase,
  zodiacSign?: ZodiacSign,
  ingredients: string[] = [],
  season: string = 'any'
): string[] {
  const recommendations: string[] = [];
  
  // Make sure cuisineData has dishes
  if (!cuisineData.dishes) {
    return recommendations;
  }
  
  // Go through all dishes in the cuisine
  Object.entries(cuisineData.dishes || {}).forEach(([dishName, dishData]) => {
    // Type the dishData properly
    const typedDishData = dishData as { 
      seasonal?: string[]; 
      ingredients?: string[]; 
      recommendedFor?: string[];
      lunarPhases?: string[];
      zodiacSigns?: string[];
      score?: number;
    };
    
    // Check if this dish matches the current season
    if (season !== 'any' && typedDishData.seasonal && !typedDishData.seasonal.includes(season)) {
      return; // Skip this dish
    }
    
    // Check if this dish uses the requested ingredients
    if (ingredients.length > 0 && typedDishData.ingredients) {
      const matchesIngredients = ingredients.some(ing => 
        typedDishData.ingredients?.includes(ing)
      );
      if (!matchesIngredients) {
        return; // Skip this dish
      }
    }
    
    // Check lunar phase compatibility
    if (typedDishData.lunarPhases && !typedDishData.lunarPhases.includes(lunarPhase)) {
      return; // Skip this dish
    }
    
    // Check zodiac compatibility
    if (zodiacSign && typedDishData.zodiacSigns && !typedDishData.zodiacSigns.includes(zodiacSign)) {
      return; // Skip this dish
    }
    
    // Add the dish to recommendations
    recommendations.push(dishName);
  });
  
  return recommendations;
}

/**
 * Mock function to get ingredient flavor profile
 * This should be replaced with actual data lookup
 */
function getFlavorProfileForIngredient(name: string) {
  // Default flavor profile
  return {
    spicy: 0.2,
    sweet: 0.3,
    sour: 0.2,
    bitter: 0.1,
    salty: 0.2,
    umami: 0.3
  };
}

/**
 * Recommend a cuisine based on current lunar phase only (simplified version)
 */
export function getQuickCuisineRecommendation(lunarPhase: LunarPhase): string {
  // Simple mapping of lunar phases to recommended cuisines
  const phaseToCuisine: Record<string, string[]> = {
    newMoon: ['Japanese', 'Nordic', 'Korean'],
    waxingCrescent: ['Vietnamese', 'Mediterranean', 'Persian'],
    firstQuarter: ['Italian', 'Spanish', 'Lebanese'],
    waxingGibbous: ['Mexican', 'Cajun', 'Thai'],
    fullMoon: ['Indian', 'Ethiopian', 'Brazilian'],
    waningGibbous: ['French', 'Moroccan', 'Turkish'],
    lastQuarter: ['Chinese', 'Greek', 'Caribbean'],
    waningCrescent: ['Indonesian', 'Filipino', 'Russian']
  };
  
  const options = phaseToCuisine[lunarPhase] || ['Mediterranean', 'Japanese', 'Italian'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Calculate how well a cuisine aligns with current planetary aspects
 */
function calculateAspectAffinity(
  aspects: PlanetaryAspect[],
  cuisinePlanets: string[]
): number {
  if (!cuisinePlanets || cuisinePlanets.length === 0) {
    return 0;
  }
  
  let aspectBonus = 0;
  
  // Loop through each aspect and check if it involves planets that rule this cuisine
  aspects.forEach(aspect => {
    const { planet1, planet2, type, strength } = aspect;
    
    // Count how many of the planets in this aspect rule the cuisine
    const relevantPlanetCount = [planet1, planet2].filter(planet => 
      cuisinePlanets.includes(planet)
    ).length;
    
    if (relevantPlanetCount > 0) {
      // Stronger boost if both planets rule the cuisine
      const planetMultiplier = relevantPlanetCount === 2 ? 1.5 : 1.0;
      
      // Different aspects have different effects
      switch (type.toLowerCase()) {
        case 'conjunction':
          aspectBonus += 0.3 * strength * planetMultiplier;
          break;
        case 'trine':
          aspectBonus += 0.25 * strength * planetMultiplier;
          break;
        case 'sextile':
          aspectBonus += 0.2 * strength * planetMultiplier;
          break;
        case 'square':
          aspectBonus += 0.1 * strength * planetMultiplier; // Less harmonious
          break;
        case 'opposition':
          aspectBonus += 0.05 * strength * planetMultiplier; // Challenging
          break;
        default:
          aspectBonus += 0.1 * strength * planetMultiplier;
      }
    }
  });
  
  // Cap the bonus at a reasonable level
  return Math.min(aspectBonus, 1);
}

/**
 * Get recommendations based on current date
 */
export function recommendCuisinesForCurrentDate(options: RecommendationOptions = {}): CuisineRecommendation[] {
  const date = new Date();
  // Since calculateLunarPhase returns a Promise<number>, we'll use a default lunar phase
  const lunarPhase: LunarPhase = 'full moon';
  const planetaryPositions = calculatePlanetaryPositions(date);
  
  // Calculate aspects from planetary positions
  const aspects = calculatePlanetaryAspects(planetaryPositions);
  
  // Get zodiac sign for current date (simplified approach)
  const monthToZodiac: Record<number, ZodiacSign> = {
    0: 'capricorn', 1: 'aquarius', 2: 'pisces',
    3: 'aries', 4: 'taurus', 5: 'gemini',
    6: 'cancer', 7: 'leo', 8: 'virgo',
    9: 'libra', 10: 'scorpio', 11: 'sagittarius'
  };
  const zodiacSign = monthToZodiac[date.getMonth()];
  
  // Create astrological state based on current date
  const astroState: AstrologicalState = {
    lunarPhase,
    zodiacSign,
    aspects
  };
  
  // Run the recommendation engine with the current state
  return recommendCuisines(astroState, options);
} 
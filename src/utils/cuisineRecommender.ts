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
  
  // Get lunar phase data
  const lunarPhaseData = LUNAR_PHASES[lunarPhase] || LUNAR_PHASES.new;
  
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
    if (aspects.length > 0 && cuisineData.planetaryRulers) {
      const aspectScore = calculateAspectAffinity(aspects, cuisineData.planetaryRulers);
      scores[cuisineName].score += aspectScore;
    }
    
    // Calculate seasonal affinity
    if (season !== 'any' && cuisineData.seasonalAppropriateness) {
      const seasonalAffinity = cuisineData.seasonalAppropriateness[season] || 0.5;
      scores[cuisineName].seasonalAffinity = seasonalAffinity;
      scores[cuisineName].score += seasonalAffinity;
    }
    
    // Calculate elemental affinity
    if (cuisineData.elementalInfluence && Object.keys(preferredElements).length > 0) {
      const elementalAffinity = calculateElementalAffinity(
        cuisineData.elementalInfluence,
        preferredElements
      );
      scores[cuisineName].elementalAffinity = elementalAffinity;
      scores[cuisineName].score += elementalAffinity;
    }
    
    // Calculate flavor affinity based on ingredients
    if (ingredients.length > 0 && cuisineData.flavorProfile) {
      const flavorAffinity = calculateFlavorAffinity(cuisineData, ingredients);
      scores[cuisineName].flavorAffinity = flavorAffinity;
      scores[cuisineName].score += flavorAffinity;
    }
    
    // Add bonus for suitable meal types
    if (mealType !== 'any' && cuisineData.idealMealTypes && cuisineData.idealMealTypes.includes(mealType)) {
      scores[cuisineName].score += 0.5;
    }
    
    // Add bonus for mood matching
    if (mood !== 'any' && cuisineData.suitableMoods && cuisineData.suitableMoods.includes(mood)) {
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
  if (cuisineData.elementalInfluence && lunarPhaseData.elementalModifier) {
    let elementalMatch = 0;
    let totalWeight = 0;
    
    for (const [element, weight] of Object.entries(cuisineData.elementalInfluence)) {
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
  if (!cuisineData.flavorProfile) {
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
  
  for (const flavor in cuisineData.flavorProfile) {
    const cuisineValue = cuisineData.flavorProfile[flavor] || 0;
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
 * Find recommended dishes for a cuisine based on various factors
 */
function findRecommendedDishes(
  cuisineData: any,
  lunarPhase: LunarPhase,
  zodiacSign?: ZodiacSign,
  ingredients: string[] = [],
  season: string = 'any'
): string[] {
  const recommendedDishes: string[] = [];
  
  if (!cuisineData.dishes) {
    return recommendedDishes;
  }
  
  // Filter dishes based on factors
  for (const [dishName, dishData] of Object.entries(cuisineData.dishes)) {
    let score = 0;
    
    // Lunar phase affinity
    if (dishData.lunarPhaseAffinity && dishData.lunarPhaseAffinity[lunarPhase]) {
      score += dishData.lunarPhaseAffinity[lunarPhase];
    }
    
    // Zodiac sign affinity
    if (zodiacSign && dishData.zodiacAffinity && dishData.zodiacAffinity[zodiacSign]) {
      score += dishData.zodiacAffinity[zodiacSign];
    }
    
    // Seasonal appropriateness
    if (season !== 'any' && dishData.seasonality && dishData.seasonality.includes(season)) {
      score += 0.5;
    }
    
    // Ingredient match
    if (ingredients.length > 0 && dishData.ingredients) {
      const matchingIngredients = ingredients.filter(ing => 
        dishData.ingredients.includes(ing)
      );
      
      if (matchingIngredients.length > 0) {
        score += (matchingIngredients.length / ingredients.length) * 0.5;
      }
    }
    
    // Add dish if score is good enough
    if (score >= 0.6) {
      recommendedDishes.push(dishName);
    }
  }
  
  // Limit to top 3 dishes
  return recommendedDishes.slice(0, 3);
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
 * Recommend cuisines based on current date if no lunar phase is provided
 */
export function recommendCuisinesForCurrentDate(options: RecommendationOptions = {}): CuisineRecommendation[] {
  // Get current lunar phase
  const currentLunarPhase = calculateLunarPhase();
  
  // Get current zodiac sign (simplified - in reality you'd calculate this)
  const currentDate = new Date();
  const zodiacSigns: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                                     'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const currentZodiacSign = zodiacSigns[currentDate.getMonth()]; // Simplified mapping
  
  // Calculate planetary positions
  const planetaryPositions = calculatePlanetaryPositions(currentDate);
  
  // Calculate aspects
  const aspects = calculatePlanetaryAspects(planetaryPositions);
  
  // Create astrological state
  const astroState: AstrologicalState = {
    lunarPhase: currentLunarPhase,
    zodiacSign: currentZodiacSign,
    aspects: aspects
  };
  
  // Get recommendations using this state
  return recommendCuisines(astroState, options);
} 
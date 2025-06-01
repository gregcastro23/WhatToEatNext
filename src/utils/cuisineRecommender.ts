import { LunarPhase, ZodiacSign, PlanetaryAspect, ElementalProperties } from '@/types/alchemy';
import { LUNAR_PHASES } from '@/constants/lunar';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import { allIngredients } from '@/data/ingredients';
import {
  calculateLunarPhase,
  calculatePlanetaryPositions,
  calculatePlanetaryAspects,
} from "@/utils/astrologyUtils";
// Import the planet data
import { 
  venusData, 
  marsData, 
  mercuryData, 
  jupiterData
} from '@/data/planets';

// Mock planetary data for calculations
const mockPlanetaryData = {
  flavorProfiles: {
    sweet: 0.7,
    sour: 0.4,
    salty: 0.5, 
    bitter: 0.2,
    umami: 0.6,
    spicy: 0.3
  },
  foodAssociations: ["vegetables", "grains", "fruits", "proteins"],
  herbalAssociations: { Herbs: ["basil", "thyme", "mint", "rosemary"] }
};

// Export the function that was previously defined but not exported
export function generateTopSauceRecommendations(currentElementalProfile = null, count = 5) {
  // Import sauce data
  const { allSauces } = require('@/data/sauces');
  
  // Use provided elemental profile from current moment's calculations, only fall back if absolutely necessary
  const userProfile = currentElementalProfile || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Get current date for planetary calculations
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Get planetary day influence
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetaryDay = planetaryDays[dayOfWeek];
  
  // Convert sauces object to array
  const saucesArray = Object.values(allSauces || {});
  
  // Map all sauces with scores
  const scoredSauces = saucesArray.map(sauce => {
    // Calculate elemental match score
    const elementalMatchScore = calculateElementalMatch(
      sauce.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      userProfile
    );
    
    // Calculate planetary day bonus - sauces that match the current planetary day get a bonus
    let planetaryDayScore = 0.7; // base score
    if (sauce.planetaryInfluences && sauce.planetaryInfluences.includes(currentPlanetaryDay)) {
      planetaryDayScore = 0.9; // bonus for matching the day
    }
    
    // Calculate flavor profile match if available
    let flavorMatchScore = 0.7; // base score
    if (sauce.flavorProfile) {
      // Use planetary flavor data to calculate preferred flavors
      const planetaryFlavors = {
        Sun: { spicy: 0.8, umami: 0.6 },
        Moon: { sweet: 0.7, creamy: 0.8 },
        Mars: { spicy: 0.9, sour: 0.6 },
        Mercury: { sour: 0.7, aromatic: 0.8 },
        Jupiter: { rich: 0.8, sweet: 0.7 },
        Venus: { sweet: 0.8, creamy: 0.7 },
        Saturn: { bitter: 0.7, earthy: 0.8 }
      };
      
      const currentFlavors = planetaryFlavors[currentPlanetaryDay] || {};
      
      // Calculate flavor match
      let flavorMatch = 0;
      let flavorCount = 0;
      
      Object.entries(currentFlavors).forEach(([flavor, strength]) => {
        if (sauce.flavorProfile[flavor]) {
          flavorMatch += (1 - Math.abs(sauce.flavorProfile[flavor] - strength));
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
      id: sauce.id || sauce.name?.replace(/\s+/g, '-').toLowerCase(),
      matchPercentage,
      elementalMatchScore: Math.round(elementalMatchScore * 100),
      planetaryDayScore: Math.round(planetaryDayScore * 100),
      planetaryHourScore: Math.round(flavorMatchScore * 100), // Using flavor match for hour score
    };
  });
  
  // Sort by overall match percentage and return top results
  return scoredSauces
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, count);
}

interface AstrologicalState {
  lunarPhase: LunarPhase;
  zodiacSign?: ZodiacSign;
  celestialEvents?: string[];
  aspects?: PlanetaryAspect[];
  retrograde?: string[];
}

interface CuisineRecommendation {
  cuisine: string;
  score: number;
  lunarAffinity: number;
  seasonalAffinity: number;
  elementalAffinity: number;
  flavorAffinity: number;
  recommendedDishes: string[];
  scoreDetails?: Record<string, number>;
}

interface RecommendationOptions {
  season?: string;
  dietary?: string[];
  ingredients?: string[];
  mealType?: string;
  mood?: string;
  preferredElements?: Record<string, number>;
  limit?: number;
}

// Simplified version of the cuisine recommendation function
export function recommendCuisines(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): CuisineRecommendation[] {
  const { lunarPhase, zodiacSign } = astroState;
  const {
    season = 'any',
    dietary = [],
    ingredients = [],
    preferredElements = {},
    limit = 20
  } = options;

  // Initialize scores object
  const scores: Record<string, CuisineRecommendation> = {};

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
      scoreDetails: {},
    };

    // Add some random variation to scores for testing
    scores[cuisineName].score += Math.random() * 0.3;
    
    // Find recommended dishes
    let dishes = findRecommendedDishes(
      cuisineData,
      lunarPhase,
      zodiacSign,
      ingredients,
      season
    );

    scores[cuisineName].recommendedDishes = dishes;
  }

  // Sort by score and return top recommendations
  return Object.values(scores)
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Simplified helper functions
function meetsAllDietaryRequirements(cuisineData: any, requirements: string[]): boolean {
  if (!cuisineData.dietarySuitability) {
    return false;
  }

  return requirements.every(
    (req) => cuisineData.dietarySuitability[req] && cuisineData.dietarySuitability[req] >= 0.6
  );
}

function findRecommendedDishes(
  cuisineData: any,
  lunarPhase: LunarPhase,
  zodiacSign?: ZodiacSign,
  ingredients: string[] = [],
  season = 'any'
): string[] {
  const recommendations: string[] = [];

  // Make sure cuisineData has dishes
  if (!cuisineData.dishes) {
    return recommendations;
  }

  // Go through all dishes in the cuisine
  Object.entries(cuisineData.dishes || {}).forEach(([dishName, dishData]) => {
    // Type the dishData properly
    let typedDishData = dishData as {
      seasonal?: string[];
      ingredients?: string[];
      recommendedFor?: string[];
      lunarPhases?: string[];
      zodiacSigns?: string[];
      score?: number;
    };

    // Simple filtering logic
    let shouldInclude = true;
    
    // Check season
    if (season !== 'any' && typedDishData.seasonal && !typedDishData.seasonal.includes(season)) {
      shouldInclude = false;
    }
    
    // Check ingredients
    if (ingredients.length > 0 && typedDishData.ingredients) {
      let matchesIngredients = ingredients.some((ing) => typedDishData.ingredients?.includes(ing));
      if (!matchesIngredients) {
        shouldInclude = false;
      }
    }
    
    if (shouldInclude) {
    recommendations.push(dishName);
    }
  });

  return recommendations;
}

// Simplified version to get quick cuisine recommendations
export function getQuickCuisineRecommendation(lunarPhase: LunarPhase): string[] {
  // Lunar phase preferences for different cuisine types
  const lunarPhaseCuisineMap: Record<string, string[]> = {
    'new moon': ['japanese', 'vietnamese', 'korean', 'mediterranean'],
    'waxing crescent': ['lebanese', 'turkish', 'greek', 'spanish'],
    'first quarter': ['italian', 'mexican', 'spanish', 'middle eastern'],
    'waxing gibbous': ['french', 'italian', 'spanish', 'greek'],
    'full moon': ['italian', 'french', 'spanish', 'indian', 'thai'],
    'waning gibbous': ['indian', 'french', 'cajun', 'southern'],
    'last quarter': ['mexican', 'tex-mex', 'cajun', 'southern'],
    'waning crescent': ['indian', 'thai', 'vietnamese', 'japanese'],
  };
  
  // Return recommendations for the phase or fallback
  return lunarPhaseCuisineMap[lunarPhase] || ['italian', 'japanese', 'mediterranean', 'indian', 'chinese'];
}

// Function to calculate elemental match between two profiles
export function calculateElementalMatch(
  recipeElements: ElementalProperties,
  userElements: ElementalProperties
): number {
  // Calculate similarity based on elemental profiles
  let matchSum = 0;
  let totalWeight = 0;
  
  // Get dominant elements
  const recipeDominant = Object.entries(recipeElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
    
  const userDominant = Object.entries(userElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
  
  // Calculate base match score (weighted sum of similarity)
  for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Array<keyof ElementalProperties>) {
    const recipeValue = recipeElements[element] || 0;
    const userValue = userElements[element] || 0;
    const weight = recipeDominant.includes(element) ? 1.5 : 1;
    
    matchSum += (1 - Math.abs(recipeValue - userValue)) * weight;
    totalWeight += weight;
  }
  
  // Calculate dominant element match bonus
  const dominantMatches = recipeDominant.filter(element => userDominant.includes(element)).length;
  const dominantBonus = dominantMatches * 0.1; // Add up to 0.2 bonus for matching dominant elements
  
  // Calculate final score
  const baseScore = matchSum / totalWeight;
  let finalScore = baseScore + dominantBonus;
  
  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, finalScore));
}

// Get CSS class based on match score
export function getMatchScoreClass(score: number) {
  if (score >= 0.96)
    return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
  if (score >= 0.9)
    return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
  if (score >= 0.85) return 'bg-green-200 text-green-800 font-semibold';
  if (score >= 0.8) return 'bg-green-100 text-green-700 font-medium';
  if (score >= 0.75) return 'bg-green-50 text-green-600';
  if (score >= 0.7) return 'bg-yellow-100 text-yellow-700';
  if (score >= 0.65) return 'bg-yellow-50 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
}

// Render score badge with stars
export function renderScoreBadge(score: number, hasDualMatch: boolean = false) {
  const formattedScore = Math.round(score * 100);
  let tooltipText = 'Match score based on cuisine, season, and elemental balance';

  if (score >= 0.96) {
    tooltipText = 'Perfect match: Highly recommended for your preferences';
  } else if (score >= 0.9) {
    tooltipText = 'Excellent match for your preferences';
  } else if (score >= 0.85) {
    tooltipText = 'Very good match for your preferences';
  }

  if (hasDualMatch) {
    tooltipText = `${tooltipText} (Matches multiple criteria)`;
  }

  return {
    className: getMatchScoreClass(score),
    score: formattedScore,
    tooltip: tooltipText,
    hasDualMatch
  };
}

// Calculate elemental profile from zodiac and lunar phase
export function calculateElementalProfileFromZodiac(
  zodiacSign: ZodiacSign,
  lunarPhase?: LunarPhase
): ElementalProperties {
  // Get zodiac element
  const zodiacElementMap: Record<string, keyof ElementalProperties> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water',
  };

  let primaryElement = zodiacElementMap[zodiacSign];

  // Start with base values
  const elementalProfile: ElementalProperties = {
    Fire: 0.15,
    Water: 0.15,
    Earth: 0.15,
    Air: 0.15,
  };

  // Boost primary element from zodiac
  elementalProfile[primaryElement] = 0.6;

  // Add lunar phase influence if available
  if (lunarPhase) {
    const lunarElementMap: Record<string, keyof ElementalProperties> = {
      'new moon': 'Fire',
      'waxing crescent': 'Fire',
      'first quarter': 'Air',
      'waxing gibbous': 'Air',
      'full moon': 'Water',
      'waning gibbous': 'Water',
      'last quarter': 'Earth',
      'waning crescent': 'Earth',
    };

    let lunarElement = lunarElementMap[lunarPhase];

    if (lunarElement) {
      // Increase the lunar element (avoid exceeding 1.0 total)
      elementalProfile[lunarElement] += 0.2;
    }
  }

  // Normalize to ensure sum is approximately 1.0
  let sum = Object.values(elementalProfile).reduce(
    (acc, val) => acc + val,
    0
  );
  if (sum > 0) {
    for (const element of Object.keys(elementalProfile) as Array<
      keyof ElementalProperties
    >) {
      elementalProfile[element] = elementalProfile[element] / (sum || 1);
    }
  }

  return elementalProfile;
}

// Calculate elemental contributions from planetary positions
export function calculateElementalContributionsFromPlanets(
  positions: Record<string, unknown>
): ElementalProperties {
  const contributions: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Planet to element mapping
  const planetElementMap: Record<string, keyof ElementalProperties> = {
    Sun: 'Fire',
    Moon: 'Water',
    Mercury: 'Air',
    Venus: 'Earth',
    Mars: 'Fire',
    Jupiter: 'Air',
    Saturn: 'Earth',
    Uranus: 'Air',
    Neptune: 'Water',
    Pluto: 'Water',
  };

  // Calculate contributions based on planet positions
  for (const [planet, position] of Object.entries(positions)) {
    let element = planetElementMap[planet];
    if (element) {
      // Weight by planet importance (Sun and Moon have higher influence)
      let weight = planet === 'Sun' || planet === 'Moon' ? 0.3 : 0.1;
      contributions[element] += weight;
    }
  }

  return contributions;
}

// Simplified calculation for base score
function calculateBaseScore(cuisineProfile: any, astroState: AstrologicalState): number {
  // Simple base score calculation
  let baseScore = 0.5; // Start with neutral score
  
  // Add some variation based on lunar phase
  if (astroState.lunarPhase === 'full moon') {
    baseScore += 0.1;
  } else if (astroState.lunarPhase === 'new moon') {
    baseScore += 0.05;
  }
  
  // Add zodiac influence
  if (astroState.zodiacSign && cuisineProfile.zodiacInfluences?.includes(astroState.zodiacSign)) {
    baseScore += 0.15;
  }
  
  return baseScore;
}

export function calculateCuisineScore(
  cuisine: any,
  astroState: AstrologicalState
): number {
  // Use simplified score calculation
  let baseScore = calculateBaseScore(cuisine, astroState);

  // Apply a multiplier for better differentiation
  let multiplier = 1.5;
  return Math.min(1.0, baseScore * multiplier); 
}

// Add the getCuisineRecommendations function
export function getCuisineRecommendations(astroState) {
  // Use the core recommendation engine from the codebase
  const cuisineRecs = recommendCuisines(astroState, {
    limit: 12, // Increase limit to get more variety
  });
  
  // Get actual cuisines data from the imported data
  const cuisineItems = Object.values(cuisineFlavorProfiles);
  
  // Ensure the returned cuisines have proper structure for the UI
  return cuisineRecs.map(rec => {
    // Find the full cuisine data from the flavorProfiles
    const fullCuisineData = cuisineItems.find(
      cuisine => cuisine.name && cuisine.name.toLowerCase() === rec.cuisine.toLowerCase()
    );
    
    // Calculate actual elemental properties from cuisine data
    let elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
    
    // If we have real elemental data, use it
    if (fullCuisineData && fullCuisineData.elementalProperties) {
      elementalProperties = { ...fullCuisineData.elementalProperties };
    } else if (rec.elementalAffinity) {
      // Use elementalAffinity data if available
      Object.entries(rec.elementalAffinity).forEach(([element, value]) => {
        elementalProperties[element] = value;
      });
    }
    
    // Calculate zodiac influences
    const zodiacInfluences = fullCuisineData?.zodiacInfluences || 
      (astroState.zodiacSign ? [astroState.zodiacSign] : []);
    
    // Calculate lunar influences
    const lunarInfluences = fullCuisineData?.lunarPhaseInfluences || 
      (astroState.lunarPhase ? [astroState.lunarPhase] : []);
    
    return {
      id: rec.cuisine.toLowerCase().replace(/\s+/g, '-'),
      name: rec.cuisine,
      description: fullCuisineData?.description || 
        `A flavorful ${rec.cuisine} cuisine with deep cultural roots and unique flavor combinations.`,
      elementalProperties,
      astrologicalInfluences: [...zodiacInfluences, ...lunarInfluences],
      zodiacInfluences: zodiacInfluences,
      lunarPhaseInfluences: lunarInfluences,
      score: rec.score,
      lunarAffinity: rec.lunarAffinity,
      seasonalAffinity: rec.seasonalAffinity,
      elementalAffinity: rec.elementalAffinity,
      flavorAffinity: rec.flavorAffinity,
      recommendedDishes: rec.recommendedDishes || [],
    };
  });
}

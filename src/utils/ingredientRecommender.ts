import { AstrologicalState } from '@/types';
import { ElementalProperties , ChakraEnergies } from '@/types/alchemy';
import type { Modality, Ingredient } from '@/data/ingredients/types';

// Import actual ingredient data
import { vegetables } from '@/data/ingredients/vegetables';
import { fruits } from '@/data/ingredients/fruits';
import { herbs } from '@/data/ingredients/herbs';
import { spices } from '@/data/ingredients/spices';
import { proteins } from '@/data/ingredients/proteins';
import { grains } from '@/data/ingredients/grains';
import { seasonings } from '@/data/ingredients/seasonings';
import { oils } from '@/data/ingredients/oils';

// Import planet data
import venusData from '@/data/planets/venus';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';
import saturnData from '@/data/planets/saturn';

import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from '@/constants/chakraSymbols';
import { LUNAR_PHASES } from '@/constants/lunar';
import { ingredientCategories } from '@/data/ingredientCategories';
import { calculateLunarPhase, calculatePlanetaryPositions } from '@/utils/astrologyUtils';

// Import the getAllIngredients function if it exists, otherwise we'll create our own
import { getAllIngredients as getIngredientsUtil } from '@/utils/foodRecommender';

// Export the necessary types needed by IngredientRecommendations.ts
export interface IngredientRecommendation extends Ingredient {
  matchScore: number;
  modality?: Modality;
  recommendations?: string[];
  qualities?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  seasonalScore?: number;
  sensoryProfile?: {
    taste: Record<string, number>;
    aroma: Record<string, number>;
    texture: Record<string, number>;
  };
  recommendedCookingMethods?: Array<{
    name: string;
    description: string;
    cookingTime: {
      min: number;
      max: number;
      unit: string;
    };
    elementalEffect: Record<string, number>;
  }>;
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
  };
}

export interface GroupedIngredientRecommendations {
  vegetables?: IngredientRecommendation[];
  fruits?: IngredientRecommendation[];
  proteins?: IngredientRecommendation[];
  grains?: IngredientRecommendation[];
  spices?: IngredientRecommendation[];
  herbs?: IngredientRecommendation[];
  [key: string]: IngredientRecommendation[] | undefined;
}

export interface RecommendationOptions {
  currentSeason?: string;
  dietaryPreferences?: string[];
  modalityPreference?: Modality;
  currentZodiac?: string;
  limit?: number;
  excludeIngredients?: string[];
  includeOnly?: string[];
  category?: string;
}

// Combine all real ingredients data
const allIngredients = [
  ...Object.values(vegetables || {}),
  ...Object.values(fruits || {}),
  ...Object.values(herbs || {}),
  ...Object.values(spices || {}),
  ...Object.values(proteins || {}),
  ...Object.values(grains || {}),
  ...Object.values(seasonings || {}),
  ...Object.values(oils || {})
].filter(Boolean);

// Fallback implementation of getAllIngredients that uses ingredientCategories
function getAllIngredients(): Ingredient[] {
  // If the imported function exists, use it
  if (typeof getIngredientsUtil === 'function') {
    return getIngredientsUtil();
  }
  
  // Otherwise, use our fallback implementation
  const allIngredients: Ingredient[] = [];
  
  // Process each category in ingredientCategories
  Object.entries(ingredientCategories).forEach(([category, ingredientsMap]) => {
    Object.entries(ingredientsMap).forEach(([name, data]) => {
      allIngredients.push({
        name,
        type: category.endsWith('s') ? category.slice(0, -1) : category,
        ...data as any
      });
    });
  });
  
  return allIngredients;
}

/**
 * Returns a list of ingredients that match the current astrological state
 */
export function getRecommendedIngredients(astroState: AstrologicalState): Ingredient[] {
  // Get the active planets from the astrological state
  const activePlanets = astroState.activePlanets || [];
  
  // If we don't have any active planets, use all planets by default
  const planetsToUse = activePlanets.length > 0 
    ? activePlanets 
    : ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  // Filter ingredients based on matching planetary rulers
  let filteredIngredients = allIngredients.filter(ingredient => {
    // Check if any of the ingredient's ruling planets are active
    return ingredient.astrologicalProfile?.rulingPlanets?.some(
      planet => planetsToUse.includes(planet)
    );
  });
  
  // If no matching ingredients, return a sample of all ingredients
  if (filteredIngredients.length === 0) {
    filteredIngredients = allIngredients.slice(0, 20);
  }
  
  // Special handling for Venus influence when present
  if (planetsToUse.includes('Venus')) {
    // Prioritize Venus-ruled ingredients with improved scoring based on detailed Venus data
    enhanceVenusIngredientBatch(filteredIngredients, astroState);
  }
  
  // Special handling for Mars influence when present
  if (planetsToUse.includes('Mars')) {
    // Prioritize Mars-ruled ingredients with improved scoring based on detailed Mars data
    enhanceMarsIngredientScoring(filteredIngredients, astroState);
  }
  
  // Special handling for Mercury influence when present
  if (planetsToUse.includes('Mercury')) {
    // Prioritize Mercury-ruled ingredients with improved scoring based on detailed Mercury data
    enhanceMercuryIngredientScoring(filteredIngredients, astroState);
  }
  
  // If we have a dominant element from the astro state, prioritize ingredients of that element
  if (astroState.dominantElement) {
    filteredIngredients.sort((a, b) => {
      const aValue = a.elementalProperties?.[astroState.dominantElement as keyof ElementalProperties] || 0;
      const bValue = b.elementalProperties?.[astroState.dominantElement as keyof ElementalProperties] || 0;
      return bValue - aValue;
    });
  }
  
  // If we have a current zodiac sign, prioritize ingredients with that affinity
  if (astroState.zodiacSign) {
    const zodiacSign = astroState.zodiacSign.toLowerCase();
    
    // Apply Venus's zodiac transit data if Venus is active and in this sign
    const venusBoost = planetsToUse.includes('Venus') && 
        venusData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign] ? 2 : 0;
    
    // Apply Mars's zodiac transit data if Mars is active and in this sign
    const marsBoost = planetsToUse.includes('Mars') && 
        marsData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign] ? 2 : 0;
    
    // Apply Mercury's zodiac transit data if Mercury is active and in this sign
    const mercuryBoost = planetsToUse.includes('Mercury') && 
        mercuryData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign] ? 2 : 0;
    
    filteredIngredients.sort((a, b) => {
      let aHasAffinity = a.astrologicalProfile?.signAffinities?.includes(zodiacSign) ? 1 : 0;
      let bHasAffinity = b.astrologicalProfile?.signAffinities?.includes(zodiacSign) ? 1 : 0;
      
      // Boost ingredients with Venus associations when Venus is active
      if (planetsToUse.includes('Venus')) {
        if (isVenusAssociatedIngredient(a.name)) aHasAffinity += venusBoost;
        if (isVenusAssociatedIngredient(b.name)) bHasAffinity += venusBoost;
      }
      
      // Boost ingredients with Mars associations when Mars is active
      if (planetsToUse.includes('Mars')) {
        if (isMarsAssociatedIngredient(a.name)) aHasAffinity += marsBoost;
        if (isMarsAssociatedIngredient(b.name)) bHasAffinity += marsBoost;
      }
      
      // Boost ingredients with Mercury associations when Mercury is active
      if (planetsToUse.includes('Mercury')) {
        if (isMercuryAssociatedIngredient(a.name)) aHasAffinity += mercuryBoost;
        if (isMercuryAssociatedIngredient(b.name)) bHasAffinity += mercuryBoost;
      }
      
      return bHasAffinity - aHasAffinity;
    });
  }
  
  return filteredIngredients;
}

/**
 * Returns recommendations grouped by category based on elemental properties and options
 */
export function getIngredientRecommendations(
  elementalProps: ElementalProperties & { 
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    zodiacSign: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string; }>;
  }, 
  options: RecommendationOptions
): GroupedIngredientRecommendations {
  // Get all ingredients
  const allIngredients = getAllIngredients();
  
  // Calculate ruling planet based on sun's position
  const sunSign = elementalProps.zodiacSign?.toLowerCase() as ZodiacSign;
  
  // Map of signs to their ruling planets
  const signRulers: Record<string, string> = {
    'aries': 'Mars',
    'taurus': 'Venus',
    'gemini': 'Mercury',
    'cancer': 'Moon',
    'leo': 'Sun',
    'virgo': 'Mercury',
    'libra': 'Venus',
    'scorpio': 'Mars',
    'sagittarius': 'Jupiter',
    'capricorn': 'Saturn',
    'aquarius': 'Saturn', // Traditional ruler
    'pisces': 'Jupiter'  // Traditional ruler
  };
  
  const rulingPlanet = signRulers[sunSign] || 'Sun';
  
  // Get decan information for each planet position
  const planetDecans: Record<string, { decanNum: number, decanRuler: string, tarotCard: string }> = {};
  
  Object.entries(elementalProps.planetaryAlignment || {}).forEach(([planet, position]) => {
    if (!position || !position.sign) return;
    
    const sign = position.sign.toLowerCase();
    const degree = position.degree || 0;
    
    // Determine which decan the planet is in
    let decanNum = 1;
    if (degree >= 10 && degree < 20) decanNum = 2;
    else if (degree >= 20) decanNum = 3;
    
    // Reference data for decan rulers and tarot cards based on sign and decan
    const decanRulerMap: Record<string, Record<number, string>> = {
      'aries': { 1: 'Mars', 2: 'Sun', 3: 'Venus' },
      'taurus': { 1: 'Mercury', 2: 'Moon', 3: 'Saturn' },
      'gemini': { 1: 'Jupiter', 2: 'Mars', 3: 'Sun' },
      'cancer': { 1: 'Venus', 2: 'Mercury', 3: 'Moon' },
      'leo': { 1: 'Saturn', 2: 'Jupiter', 3: 'Mars' },
      'virgo': { 1: 'Sun', 2: 'Venus', 3: 'Mercury' },
      'libra': { 1: 'Moon', 2: 'Saturn', 3: 'Jupiter' },
      'scorpio': { 1: 'Mars', 2: 'Sun', 3: 'Venus' },
      'sagittarius': { 1: 'Mercury', 2: 'Moon', 3: 'Saturn' },
      'capricorn': { 1: 'Jupiter', 2: 'Mars', 3: 'Sun' },
      'aquarius': { 1: 'Venus', 2: 'Mercury', 3: 'Moon' },
      'pisces': { 1: 'Saturn', 2: 'Jupiter', 3: 'Mars' }
    };
    
    const tarotCardMap: Record<string, Record<number, string>> = {
      'aries': { 1: '2 of Wands', 2: '3 of Wands', 3: '4 of Wands' },
      'taurus': { 1: '5 of Pentacles', 2: '6 of Pentacles', 3: '7 of Pentacles' },
      'gemini': { 1: '8 of Swords', 2: '9 of Swords', 3: '10 of Swords' },
      'cancer': { 1: '2 of Cups', 2: '3 of Cups', 3: '4 of Cups' },
      'leo': { 1: '5 of Wands', 2: '6 of Wands', 3: '7 of Wands' },
      'virgo': { 1: '8 of Pentacles', 2: '9 of Pentacles', 3: '10 of Pentacles' },
      'libra': { 1: '2 of Swords', 2: '3 of Swords', 3: '4 of Swords' },
      'scorpio': { 1: '5 of Cups', 2: '6 of Cups', 3: '7 of Cups' },
      'sagittarius': { 1: '8 of Wands', 2: '9 of Wands', 3: '10 of Wands' },
      'capricorn': { 1: '2 of Pentacles', 2: '3 of Pentacles', 3: '4 of Pentacles' },
      'aquarius': { 1: '5 of Swords', 2: '6 of Swords', 3: '7 of Swords' },
      'pisces': { 1: '8 of Cups', 2: '9 of Cups', 3: '10 of Cups' }
    };
    
    const decanRuler = decanRulerMap[sign]?.[decanNum] || '';
    const tarotCard = tarotCardMap[sign]?.[decanNum] || '';
    
    planetDecans[planet] = { decanNum, decanRuler, tarotCard };
  });
  
  // Filter and score ingredients
  const scoredIngredients = allIngredients
    .filter(ingredient => {
      // Apply basic filters
      if (options.excludeIngredients?.includes(ingredient.name)) return false;
      if (options.includeOnly && !options.includeOnly.includes(ingredient.name)) return false;
      if (options.category && ingredient.category !== options.category) return false;
      
      // Filter by dietary preference if specified
      if (options.dietaryPreferences && options.dietaryPreferences.length > 0) {
        const dietaryMatches = options.dietaryPreferences.some(pref => 
          ingredient.dietary?.includes(pref)
        );
        if (!dietaryMatches) return false;
      }
      
      // Filter by modality preference if specified
      if (options.modalityPreference) {
        const ingredientModality = ingredient.modality || 
          determineIngredientModality(ingredient.qualities, ingredient.elementalProperties);
        
        if (ingredientModality !== options.modalityPreference) return false;
      }
      
      return true;
    })
    .map(ingredient => {
      // Calculate elemental score (30% of total)
      const elementalScore = calculateElementalScore(
        ingredient.elementalProperties,
        elementalProps
      );
      
      // Calculate modality score (15% of total)
      const modalityScore = calculateModalityScore(
        ingredient.qualities || [],
        options.modalityPreference
      );
      
      // Calculate seasonal score (15% of total)
      const seasonalScore = calculateSeasonalScore(
        ingredient,
        elementalProps.timestamp
      );
      
      // Calculate planetary score (40% of total) - increased weight for planetary alignment
      const planetaryScore = calculateEnhancedPlanetaryScore(
        ingredient, 
        elementalProps.planetaryAlignment,
        planetDecans,
        rulingPlanet
      );
      
      // Calculate total score with weighted components
      const totalScore = (
        elementalScore * 0.30 + 
        modalityScore * 0.15 + 
        seasonalScore * 0.15 + 
        planetaryScore * 0.40
      );
      
      // Assign modality if not already present
      const modality = ingredient.modality || 
        determineIngredientModality(ingredient.qualities, ingredient.elementalProperties);
      
      return {
        ...ingredient,
        score: totalScore,
        elementalScore,
        modalityScore,
        seasonalScore,
        planetaryScore,
        modality
      };
    })
    .sort((a, b) => b.score - a.score);
  
  // Group ingredients by category
  const groupedRecommendations: GroupedIngredientRecommendations = {};
  
  // Apply limit per category before grouping to ensure diversity
  const limit = options.limit || 24;
  const categoryCounts: Record<string, number> = {};
  const categoryMaxItems = Math.ceil(limit / 8); // Max items per category
  
  scoredIngredients.forEach(ingredient => {
    const category = ingredient.category || 'other';
    
    if (!groupedRecommendations[category]) {
      groupedRecommendations[category] = [];
      categoryCounts[category] = 0;
    }
    
    if (categoryCounts[category] < categoryMaxItems) {
      groupedRecommendations[category].push(ingredient);
      categoryCounts[category]++;
    }
  });
  
  return groupedRecommendations;
}

// Helper function to calculate modality score
function calculateModalityScore(
  qualities: string[],
  preferredModality?: Modality
): number {
  // Get the ingredient's modality based on qualities
  const ingredientModality = determineIngredientModality(qualities);
  
  // If no preferred modality, return neutral score
  if (!preferredModality) return 0.5;
  
  // Return 1.0 for exact match, 0.5 for partial match, 0.0 for mismatch
  if (ingredientModality === preferredModality) return 1.0;
  
  // Consider partial matches based on modality compatibility
  const compatibleModalities = {
    Cardinal: ['Mutable'],
    Fixed: ['Mutable'],
    Mutable: ['Cardinal', 'Fixed']
  };
  
  if (compatibleModalities[preferredModality]?.includes(ingredientModality)) {
    return 0.7;
  }
  
  return 0.3;
}

/**
 * Calculate elemental score between ingredient and system elemental properties
 * @param ingredientProps Elemental properties of the ingredient
 * @param systemProps System elemental properties
 * @returns Score representing compatibility (0-1)
 */
function calculateElementalScore(
  ingredientProps?: ElementalProperties,
  systemProps?: ElementalProperties
): number {
  // Return neutral score if either properties are missing
  if (!ingredientProps || !systemProps) return 0.5;
  
  // Calculate similarity based on overlap of elemental properties
  let similarityScore = 0;
  let totalWeight = 0;
  
  // Process each element
  for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
    const ingredientValue = ingredientProps[element] || 0;
    const systemValue = systemProps[element] || 0;
    
    // Calculate similarity (1 - absolute difference)
    // This gives higher scores when values are closer together
    const similarity = 1 - Math.abs(ingredientValue - systemValue);
    
    // Weight by the system's value for this element
    // This gives more importance to elements that are dominant in the system
    const weight = systemValue + 0.25; // Add 0.25 to ensure all elements have some weight
    
    similarityScore += similarity * weight;
    totalWeight += weight;
  }
  
  // Normalize to 0-1 range
  return totalWeight > 0 ? similarityScore / totalWeight : 0.5;
}

/**
 * Calculate seasonal score for an ingredient based on current date
 * @param ingredient Ingredient to score
 * @param date Current date
 * @returns Seasonal score (0-1)
 */
function calculateSeasonalScore(ingredient: Ingredient, date: Date): number {
  // Default score if no seasonality data
  if (!ingredient.seasonality) return 0.5;
  
  // Get current month and convert to season
  const month = date.getMonth(); // 0-11
  let currentSeason: string;
  
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) {
    currentSeason = 'spring';
  } else if (month >= 5 && month <= 7) {
    currentSeason = 'summer';
  } else if (month >= 8 && month <= 10) {
    currentSeason = 'fall';
  } else {
    currentSeason = 'winter';
  }
  
  // Get seasonality score for current season
  const seasonScore = ingredient.seasonality[currentSeason] || 0.5;
  
  return seasonScore;
}

/**
 * Enhanced planetary score calculation that considers decans and tarot associations,
 * with special weight for the ruling planet determined by sun position
 */
function calculateEnhancedPlanetaryScore(
  ingredient: Ingredient,
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
  planetDecans: Record<string, { decanNum: number, decanRuler: string, tarotCard: string }>,
  rulingPlanet: string
): number {
  if (!ingredient.astrologicalProfile) return 0.5; // Neutral score for ingredients without profile
  
  let score = 0;
  let totalFactors = 0;
  
  // Check ruling planet correspondence - this gets extra weight
  if (ingredient.astrologicalProfile.rulingPlanets?.includes(rulingPlanet)) {
    score += 1.5; // Significant boost for ruling planet correspondence
    totalFactors += 1.5;
  }
  
  // Check planetary positions against ingredient affinities
  Object.entries(planetaryAlignment).forEach(([planet, position]) => {
    if (!position.sign) return;
    
    const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
    
    // Regular planetary ruler scoring
    if (ingredient.astrologicalProfile.rulingPlanets?.includes(planetName)) {
      score += 1;
      totalFactors += 1;
    }
    
    // Check sign affinities 
    if (ingredient.astrologicalProfile.signAffinities?.includes(position.sign.toLowerCase())) {
      score += 1;
      totalFactors += 1;
    }
    
    // Special handling for decan rulers
    const decanInfo = planetDecans[planet];
    if (decanInfo && ingredient.astrologicalProfile.rulingPlanets?.includes(decanInfo.decanRuler)) {
      score += 0.8; // Good bonus for decan ruler match
      totalFactors += 0.8;
    }
    
    // Tarot card associations - add subtle influence
    if (decanInfo?.tarotCard && ingredient.astrologicalProfile.tarotAssociations?.includes(decanInfo.tarotCard)) {
      score += 0.7;
      totalFactors += 0.7;
    }
  });
  
  // If there are no factors to consider, return neutral score
  if (totalFactors === 0) return 0.5;
  
  // Return normalized score (0-1 range)
  return Math.min(1, score / (totalFactors + 0.5));
}

/**
 * Calculate planetary influences based on planetary alignment
 * @param planetaryAlignment Current planetary positions
 * @returns Elemental influence values
 */
export function calculateElementalInfluences(
  planetaryAlignment: Record<string, { sign: string; degree: number }>
): ElementalProperties {
  // Define elemental affinities for each zodiac sign
  const zodiacElements: Record<string, keyof ElementalProperties> = {
    'aries': 'Fire',
    'taurus': 'Earth',
    'gemini': 'Air',
    'cancer': 'Water',
    'leo': 'Fire',
    'virgo': 'Earth',
    'libra': 'Air',
    'scorpio': 'Water',
    'sagittarius': 'Fire',
    'capricorn': 'Earth',
    'aquarius': 'Air',
    'pisces': 'Water',
    // Support for case variations
    'Aries': 'Fire',
    'Leo': 'Fire',
    'Libra': 'Air',
    'Scorpio': 'Water',
    'Cancer': 'Water'
  };

  // Define planet weights
  const planetWeights: Record<string, number> = {
    'sun': 5,
    'moon': 4,
    'mercury': 3,
    'venus': 3,
    'mars': 3,
    'jupiter': 2,
    'saturn': 2,
    'uranus': 1,
    'neptune': 1,
    'pluto': 1
  };

  // Initialize elemental influences
  const elementalInfluences: ElementalProperties = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };

  // Process each planetary position
  Object.entries(planetaryAlignment).forEach(([planet, position]) => {
    const planetLower = planet.toLowerCase();
    const weight = planetWeights[planetLower] || 1;
    const sign = position.sign.toLowerCase();
    const element = zodiacElements[position.sign] || zodiacElements[sign];

    if (element) {
      elementalInfluences[element] += weight;
    }
  });

  // Normalize values to sum to 1
  const total = Object.values(elementalInfluences).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(elementalInfluences).forEach(element => {
      elementalInfluences[element as keyof ElementalProperties] = 
        elementalInfluences[element as keyof ElementalProperties] / total;
    });
  }

  return elementalInfluences;
}

/**
 * Get ingredient recommendations based on chakra energies
 * @param chakraEnergies Current chakra energy levels
 * @param limit Maximum number of recommendations per chakra
 * @returns Grouped ingredient recommendations based on chakra influences
 */
export function getChakraBasedRecommendations(
  chakraEnergies: ChakraEnergies,
  limit = 3
): GroupedIngredientRecommendations {
  // Find the dominant chakras (highest energy levels)
  const chakraEntries = Object.entries(chakraEnergies);
  
  // Sort chakras by energy level (highest first)
  const sortedChakras = chakraEntries.sort(([, energyA], [, energyB]) => energyB - energyA);
  
  // Take only chakras with significant energy (> 0)
  const significantChakras = sortedChakras.filter(([, energy]) => energy > 0);
  
  // Prepare the result object
  const result: GroupedIngredientRecommendations = {};
  
  // For each significant chakra, add corresponding recommended ingredients
  significantChakras.forEach(([chakra, energy]) => {
    // Get nutritional correlations for this chakra
    const nutritionalCorrelations = CHAKRA_NUTRITIONAL_CORRELATIONS[chakra] || [];
    const herbRecommendations = CHAKRA_HERBS[chakra] || [];
    
    // Find ingredients that match these correlations
    const matchingIngredients = allIngredients.filter(ingredient => {
      // Check if ingredient name or type matches any nutritional correlation
      const matchesNutritional = nutritionalCorrelations.some(correlation => 
        ingredient.name.toLowerCase().includes(correlation.toLowerCase()) || 
        (ingredient.type ? ingredient.type.toLowerCase().includes(correlation.toLowerCase()) : false)
      );
      
      // Check if ingredient name matches any herb recommendation
      const matchesHerb = herbRecommendations.some(herb => 
        ingredient.name.toLowerCase().includes(herb.toLowerCase())
      );
      
      return matchesNutritional || matchesHerb;
    });
    
    // Add matching ingredients to the result, with a score based on chakra energy
    matchingIngredients.forEach(ingredient => {
      const recommendationKey = ingredient.type ? `${ingredient.type.toLowerCase()}s` : 'others';
      
      if (!result[recommendationKey]) {
        result[recommendationKey] = [];
      }
      
      // Create recommendation with chakra-based score
      const recommendation: IngredientRecommendation = {
        ...ingredient,
        matchScore: energy / 10, // Normalize to 0-1 range
        recommendations: [
          `Supports ${chakra} chakra energy`,
          ...nutritionalCorrelations.filter(corr => 
            ingredient.name.toLowerCase().includes(corr.toLowerCase()) ||
            (ingredient.type ? ingredient.type.toLowerCase().includes(corr.toLowerCase()) : false)
          )
        ]
      };
      
      // Only add if not already present
      if (!result[recommendationKey]?.some(rec => rec.name === ingredient.name)) {
        result[recommendationKey]?.push(recommendation);
      }
    });
  });
  
  // Apply limit to each category
  Object.keys(result).forEach(key => {
    if (result[key]?.length > limit) {
      result[key] = result[key]?.slice(0, limit);
    }
  });
  
  return result;
}

// Helper function to check if an ingredient is Venus-associated
function isVenusAssociatedIngredient(ingredientName: string): boolean {
  // Check if the ingredient appears in Venus's food associations
  if (venusData.FoodAssociations) {
    for (const food of venusData.FoodAssociations) {
      if (ingredientName.toLowerCase().includes(food.toLowerCase()) || 
          food.toLowerCase().includes(ingredientName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Check if the ingredient appears in Venus's herbal associations
  if (venusData.HerbalAssociations?.Herbs) {
    for (const herb of venusData.HerbalAssociations.Herbs) {
      if (ingredientName.toLowerCase().includes(herb.toLowerCase()) || 
          herb.toLowerCase().includes(ingredientName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Check if the ingredient appears in Venus's spice associations
  if (venusData.HerbalAssociations?.Spices) {
    for (const spice of venusData.HerbalAssociations.Spices) {
      if (ingredientName.toLowerCase().includes(spice.toLowerCase()) || 
          spice.toLowerCase().includes(ingredientName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Check if the ingredient appears in Venus's flower associations
  if (venusData.HerbalAssociations?.Flowers) {
    for (const flower of venusData.HerbalAssociations.Flowers) {
      if (ingredientName.toLowerCase().includes(flower.toLowerCase()) || 
          flower.toLowerCase().includes(ingredientName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Check against zodiac-specific Venus ingredients
  if (venusData.PlanetSpecific?.ZodiacTransit) {
    for (const zodiac in venusData.PlanetSpecific.ZodiacTransit) {
      const transitData = venusData.PlanetSpecific.ZodiacTransit[zodiac];
      if (transitData.Ingredients) {
        for (const ingredient of transitData.Ingredients) {
          if (ingredientName.toLowerCase().includes(ingredient.toLowerCase()) || 
              ingredient.toLowerCase().includes(ingredientName.toLowerCase())) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Determines if an ingredient is associated with Mars based on Mars data
 */
function isMarsAssociatedIngredient(ingredientName: string): boolean {
  // Normalize the ingredient name for comparison
  const normalizedName = ingredientName.toLowerCase();
  
  // Check if it's in Mars food associations
  if (marsData.FoodAssociations) {
    for (const food of marsData.FoodAssociations) {
      if (normalizedName.includes(food.toLowerCase()) || food.toLowerCase().includes(normalizedName)) {
        return true;
      }
    }
  }
  
  // Check if it's in Mars herbal associations
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (normalizedName.includes(herb.toLowerCase()) || herb.toLowerCase().includes(normalizedName)) {
        return true;
      }
    }
  }
  
  // Check all zodiac transits for ingredients
  if (marsData.PlanetSpecific?.ZodiacTransit) {
    for (const sign in marsData.PlanetSpecific.ZodiacTransit) {
      const transit = marsData.PlanetSpecific.ZodiacTransit[sign];
      if (transit.Ingredients) {
        for (const ingredient of transit.Ingredients) {
          if (normalizedName.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(normalizedName)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Calculate Venus influence score for an ingredient
 * @param ingredient The ingredient to calculate Venus influence for
 * @param zodiacSign Current zodiac sign Venus is in
 * @param isVenusRetrograde Whether Venus is retrograde
 * @returns Score representing Venus influence (higher is stronger)
 */
function calculateVenusInfluence(
  ingredient: Ingredient, 
  zodiacSign?: string,
  isVenusRetrograde = false
): number {
  let score = 0;
  
  // Base score for Venus association
  if (isVenusAssociatedIngredient(ingredient.name)) {
    score += 2.0;
  }
  
  // Check elemental properties alignment with Venus
  if (ingredient.elemental_properties) {
    // Venus favors Water and Earth elements
    score += (ingredient.elemental_properties.Water || 0) * 1.5;
    score += (ingredient.elemental_properties.Earth || 0) * 1.8;
    // Lesser affinities with Air and Fire
    score += (ingredient.elemental_properties.Air || 0) * 0.8;
    score += (ingredient.elemental_properties.Fire || 0) * 0.5;
  }
  
  // Check flavor profile alignment with Venus preferences
  if (ingredient.flavor_profile) {
    // Venus favors sweet, rich, creamy flavors
    if (ingredient.flavor_profile.sweet) {
      score += ingredient.flavor_profile.sweet * 2.0;
    }
    
    if (ingredient.flavor_profile.umami) {
      score += ingredient.flavor_profile.umami * 1.5;
    }
    
    if (ingredient.flavor_profile.creamy || ingredient.flavor_profile.rich) {
      score += ((ingredient.flavor_profile.creamy || 0) + (ingredient.flavor_profile.rich || 0)) * 1.7;
    }
    
    // Venus appreciates aromatic, fragrant qualities
    if (ingredient.flavor_profile.aromatic || ingredient.flavor_profile.fragrant) {
      score += ((ingredient.flavor_profile.aromatic || 0) + (ingredient.flavor_profile.fragrant || 0)) * 1.6;
    }
    
    // Venus is less interested in bitter or excessively spicy flavors
    if (ingredient.flavor_profile.bitter) {
      score -= ingredient.flavor_profile.bitter * 0.5;
    }
    
    if (ingredient.flavor_profile.spicy && ingredient.flavor_profile.spicy > 0.7) {
      score -= (ingredient.flavor_profile.spicy - 0.7) * 0.8;
    }
  }
  
  // Check texture alignment with Venus preferences
  if (ingredient.texture) {
    // Venus favors smooth, creamy, luscious textures
    const venusTextures = ['smooth', 'creamy', 'velvety', 'soft', 'tender', 'juicy', 'buttery'];
    const textureMatch = venusTextures.filter(texture => 
      ingredient.texture.includes(texture)
    ).length;
    
    score += textureMatch * 0.5;
  }
  
  // Check culinary technique alignment
  if (venusData.PlanetSpecific?.CulinaryTechniques && ingredient.culinary_uses) {
    // Check for aesthetic presentation techniques
    if (
      ingredient.culinary_uses.includes('garnish') || 
      ingredient.culinary_uses.includes('plating')
    ) {
      score += 1.8;
    }
    
    // Check for balance and harmony in flavor pairings
    if (ingredient.harmony_pairings && ingredient.harmony_pairings.length > 3) {
      score += 1.5;
    }
    
    // Sweet and indulgent preparation techniques
    if (
      ingredient.culinary_uses.includes('dessert') || 
      ingredient.culinary_uses.includes('baking') ||
      ingredient.culinary_uses.includes('confection')
    ) {
      score += 1.2;
    }
    
    // Check for fragrance and aroma enhancement
    if (
      ingredient.aromatic_properties || 
      (ingredient.flavor_profile?.aromatic && ingredient.flavor_profile.aromatic > 0.7)
    ) {
      score += 1.6;
    }
    
    // Check for textural contrast techniques
    if (
      ingredient.culinary_uses.includes('crispy') || 
      ingredient.culinary_uses.includes('crunchy') || 
      ingredient.texture?.includes('contrast')
    ) {
      score += 1.3;
    }
  }
  
  // Zodiac sign-specific preferences
  if (zodiacSign && venusData.PlanetSpecific?.ZodiacTransit) {
    const transitData = venusData.PlanetSpecific.ZodiacTransit[zodiacSign];
    
    // Check food focus alignment
    if (transitData.FoodFocus) {
      const foodFocus = transitData.FoodFocus.toLowerCase();
      const ingredientName = ingredient.name.toLowerCase();
      
      // Direct keywords match
      const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
      for (const keyword of keywords) {
        if (ingredientName.includes(keyword) || 
            ingredient.description?.toLowerCase().includes(keyword) ||
            ingredient.culinary_uses?.some(use => use.toLowerCase().includes(keyword))) {
          score += 2.0;
          break;
        }
      }
    }
    
    // Check Elements alignment
    if (transitData.Elements && ingredient.elemental_properties) {
      for (const element in transitData.Elements) {
        if (ingredient.elemental_properties[element]) {
          score += transitData.Elements[element] * ingredient.elemental_properties[element] * 0.7;
        }
      }
    }
    
    // Check ingredient alignment with transit preferences
    if (transitData.Ingredients) {
      const transitIngredients = transitData.Ingredients.map(i => i.toLowerCase());
      
      // Direct ingredient match
      if (transitIngredients.some(i => ingredient.name.toLowerCase().includes(i) || i.includes(ingredient.name.toLowerCase()))) {
        score += 3.0;
      }
      
      // Category match
      if (ingredient.category && transitIngredients.includes(ingredient.category.toLowerCase())) {
        score += 2.0;
      }
      
      // Related ingredient match
      if (ingredient.related_ingredients) {
        const relatedMatches = ingredient.related_ingredients.filter(related => 
          transitIngredients.some(i => related.toLowerCase().includes(i) || i.includes(related.toLowerCase()))
        ).length;
        
        score += relatedMatches * 0.7;
      }
      
      // Complementary ingredients match
      if (ingredient.complementary_ingredients) {
        const complementaryMatches = ingredient.complementary_ingredients.filter(complement => 
          transitIngredients.some(i => complement.toLowerCase().includes(i) || i.includes(complement.toLowerCase()))
        ).length;
        
        score += complementaryMatches * 0.5;
      }
    }
  }
  
  // Venus temperament based on sign type
  if (zodiacSign) {
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const lowerSign = zodiacSign.toLowerCase();
    
    // Earth Venus
    if (earthSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.EarthVenus) {
      const earthVenus = venusData.PlanetSpecific.CulinaryTemperament.EarthVenus;
      
      // Check for sensual, rich ingredients
      if (ingredient.flavor_profile?.rich > 0.5 || 
          ingredient.flavor_profile?.umami > 0.5 ||
          ingredient.culinary_uses?.includes('comfort food')) {
        score += 2.0;
      }
      
      // Food focus alignment
      if (earthVenus.FoodFocus) {
        const focusKeywords = earthVenus.FoodFocus.toLowerCase().split(/[\s,;]+/).filter(k => k.length > 3);
        if (focusKeywords.some(keyword => 
            ingredient.name.toLowerCase().includes(keyword) || 
            ingredient.description?.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
      }
      
      // Elements alignment
      if (earthVenus.Elements && ingredient.elemental_properties) {
        for (const element in earthVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score += earthVenus.Elements[element] * ingredient.elemental_properties[element] * 1.0;
          }
        }
      }
    }
    
    // Air Venus
    if (airSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.AirVenus) {
      const airVenus = venusData.PlanetSpecific.CulinaryTemperament.AirVenus;
      
      // Check for light, delicate ingredients
      if (ingredient.texture?.includes('light') || 
          ingredient.texture?.includes('crisp') ||
          ingredient.flavor_profile?.light > 0.5) {
        score += 2.0;
      }
      
      // Food focus alignment
      if (airVenus.FoodFocus) {
        const focusKeywords = airVenus.FoodFocus.toLowerCase().split(/[\s,;]+/).filter(k => k.length > 3);
        if (focusKeywords.some(keyword => 
            ingredient.name.toLowerCase().includes(keyword) || 
            ingredient.description?.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
      }
      
      // Elements alignment
      if (airVenus.Elements && ingredient.elemental_properties) {
        for (const element in airVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score += airVenus.Elements[element] * ingredient.elemental_properties[element] * 1.0;
          }
        }
      }
    }
    
    // Water Venus
    if (waterSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.WaterVenus) {
      const waterVenus = venusData.PlanetSpecific.CulinaryTemperament.WaterVenus;
      
      // Check for moist, juicy ingredients
      if (ingredient.texture?.includes('juicy') || 
          ingredient.texture?.includes('tender') ||
          ingredient.flavor_profile?.juicy > 0.5) {
        score += 2.0;
      }
      
      // Food focus alignment
      if (waterVenus.FoodFocus) {
        const focusKeywords = waterVenus.FoodFocus.toLowerCase().split(/[\s,;]+/).filter(k => k.length > 3);
        if (focusKeywords.some(keyword => 
            ingredient.name.toLowerCase().includes(keyword) || 
            ingredient.description?.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
      }
      
      // Elements alignment
      if (waterVenus.Elements && ingredient.elemental_properties) {
        for (const element in waterVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score += waterVenus.Elements[element] * ingredient.elemental_properties[element] * 1.0;
          }
        }
      }
    }
    
    // Fire Venus
    if (fireSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.FireVenus) {
      const fireVenus = venusData.PlanetSpecific.CulinaryTemperament.FireVenus;
      
      // Check for vibrant, spicy ingredients
      if (ingredient.flavor_profile?.spicy > 0.3 || 
          ingredient.flavor_profile?.vibrant > 0.5 ||
          ingredient.culinary_uses?.includes('stimulating')) {
        score += 2.0;
      }
      
      // Food focus alignment
      if (fireVenus.FoodFocus) {
        const focusKeywords = fireVenus.FoodFocus.toLowerCase().split(/[\s,;]+/).filter(k => k.length > 3);
        if (focusKeywords.some(keyword => 
            ingredient.name.toLowerCase().includes(keyword) || 
            ingredient.description?.toLowerCase().includes(keyword))) {
          score += 1.5;
        }
      }
      
      // Elements alignment
      if (fireVenus.Elements && ingredient.elemental_properties) {
        for (const element in fireVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score += fireVenus.Elements[element] * ingredient.elemental_properties[element] * 1.0;
          }
        }
      }
    }
  }

  // Retrograde modifiers
  if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
    // Increase score for preserved or dried herbs during retrograde
    if (
      ingredient.preservation_methods?.includes('dried') || 
      ingredient.category === 'herb' ||
      ingredient.categories?.includes('preserved')
    ) {
      score *= 1.5;
    } else {
      score *= 0.8; // Slightly reduce other ingredients
    }
    
    // Nostalgia foods get a boost during retrograde
    if (ingredient.cultural_significance?.includes('traditional') ||
        ingredient.cultural_significance?.includes('nostalgic')) {
      score += 1.8;
    }
    
    // Check retrograde food focus
    if (venusData.PlanetSpecific.Retrograde.FoodFocus) {
      const retroFocus = venusData.PlanetSpecific.Retrograde.FoodFocus.toLowerCase();
      const ingredientName = ingredient.name.toLowerCase();
      const ingredientDesc = ingredient.description?.toLowerCase() || '';
      
      // Check for keyword matches
      const retroKeywords = retroFocus.split(/[\s,;]+/).filter(k => k.length > 3);
      for (const keyword of retroKeywords) {
        if (ingredientName.includes(keyword) || ingredientDesc.includes(keyword)) {
          score += 1.7;
          break;
        }
      }
    }
    
    // Check retrograde elements
    if (venusData.PlanetSpecific.Retrograde.Elements && ingredient.elemental_properties) {
      for (const element in venusData.PlanetSpecific.Retrograde.Elements) {
        if (ingredient.elemental_properties[element]) {
          score += venusData.PlanetSpecific.Retrograde.Elements[element] * 
                   ingredient.elemental_properties[element] * 0.9;
        }
      }
    }
  }
  
  // Lunar phase connections with Venus
  if (venusData.LunarConnection) {
    // This would be checked against the current lunar phase in a full implementation
  }

  return score;
}

// Enhance ingredient scoring with Venus influence
function enhanceVenusIngredientScoring(
  ingredient: Ingredient,
  astroState: AstrologicalState,
  score: number
): number {
  // Only apply Venus scoring if Venus is active
  if (!astroState.activePlanets?.includes('Venus')) {
    return score;
  }
  
  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;
  
  // Check if Venus is retrograde
  const isVenusRetrograde = astroState.retrograde?.includes('Venus') || false;
  
  // Calculate Venus influence score
  const venusInfluence = calculateVenusInfluence(ingredient, zodiacSign, isVenusRetrograde);
  
  // Apply Venus influence to the base score (weight it appropriately)
  return score + (venusInfluence * 0.3);
}

// Enhanced function to boost Venus-ruled ingredients based on detailed Venus data
function enhanceVenusIngredientBatch(ingredients: Ingredient[], astroState: AstrologicalState): void {
  // Check if Venus is active
  const isVenusActive = astroState.activePlanets?.includes('Venus');
  if (!isVenusActive) {
    return; // Skip Venus scoring if Venus is not active
  }
  
  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;
  
  // Check if Venus is retrograde
  const isVenusRetrograde = astroState.retrograde?.includes('Venus') || false;
  
  // Add a "venusScore" property to each ingredient for sorting
  ingredients.forEach(ingredient => {
    // Use our comprehensive Venus influence calculation
    const venusScore = calculateVenusInfluence(ingredient, zodiacSign, isVenusRetrograde);
    
    // Store the Venus score with the ingredient
    (ingredient as any).venusScore = venusScore;
  });
  
  // Sort ingredients by Venus score
  ingredients.sort((a, b) => {
    const aScore = (a as any).venusScore || 0;
    const bScore = (b as any).venusScore || 0;
    return bScore - aScore;
  });
}

/**
 * Calculates a Mars influence score for an ingredient
 */
function calculateMarsInfluence(
  ingredient: Ingredient, 
  zodiacSign?: string,
  isMarsRetrograde = false
): number {
  let score = 0;
  
  // Get the name in lowercase for comparison
  const name = ingredient.name.toLowerCase();
  
  // Match with Mars food associations
  if (marsData.FoodAssociations) {
    for (const food of marsData.FoodAssociations) {
      if (name.includes(food.toLowerCase()) || food.toLowerCase().includes(name)) {
        score += 1.5;
        break;
      }
    }
  }
  
  // Match with Mars herb associations (stronger affinity)
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (name.includes(herb.toLowerCase()) || herb.toLowerCase().includes(name)) {
        score += 2.0;
        break;
      }
    }
  }
  
  // Flavor profile alignment
  if (marsData.FlavorProfiles && ingredient.flavorProfile) {
    for (const flavor in marsData.FlavorProfiles) {
      if (ingredient.flavorProfile[flavor]) {
        // Higher score when both have high values for same flavor
        score += marsData.FlavorProfiles[flavor] * ingredient.flavorProfile[flavor];
      }
    }
  }
  
  // Elemental alignment
  if (ingredient.elementalProperties) {
    // Mars is primarily Fire, secondarily Water
    const fireScore = ingredient.elementalProperties.Fire || 0;
    const waterScore = ingredient.elementalProperties.Water || 0;
    
    score += fireScore * 1.5; // Primary element gets higher weight
    score += waterScore * 0.8; // Secondary element
  }
  
  // Zodiac sign specific boost
  if (zodiacSign && marsData.PlanetSpecific?.ZodiacTransit) {
    const transit = marsData.PlanetSpecific.ZodiacTransit[zodiacSign];
    
    // Check if ingredient is in the transit's ingredient list
    if (transit && transit.Ingredients) {
      for (const transitIngredient of transit.Ingredients) {
        if (name.includes(transitIngredient.toLowerCase()) || 
            transitIngredient.toLowerCase().includes(name)) {
          score += 2.5; // Strong boost for exact ingredient match in current zodiac
          break;
        }
      }
    }
    
    // Check element alignment with transit
    if (transit && transit.Elements && ingredient.elementalProperties) {
      for (const element in transit.Elements) {
        const elemValue = element as keyof ElementalProperties;
        if (ingredient.elementalProperties[elemValue]) {
          score += transit.Elements[element] * ingredient.elementalProperties[elemValue] * 1.2;
        }
      }
    }
  }
  
  // Mars retrograde effects
  if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
    // During retrograde, Mars emphasizes dried herbs and spices
    if (ingredient.type === 'spice' || ingredient.type === 'herb' || ingredient.type === 'seasoning') {
      score += 1.5;
    }
    
    // Focus shifts to traditional uses
    if (ingredient.traditional) {
      score += 1.2;
    }
  }
  
  // Adjust for Mars temperament based on dominant element
  if (ingredient.elementalProperties) {
    const fireDominant = (ingredient.elementalProperties.Fire || 0) > 0.6;
    const waterDominant = (ingredient.elementalProperties.Water || 0) > 0.6;
    
    if (fireDominant && marsData.PlanetSpecific?.CulinaryTemperament?.FireMars) {
      score += 1.5;
    } else if (waterDominant && marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars) {
      score += 1.3;
    }
  }
  
  return score;
}

/**
 * Apply Mars-specific scoring to a collection of ingredients
 */
function enhanceMarsIngredientScoring(ingredients: Ingredient[], astroState: AstrologicalState): void {
  // Get Mars status info from astro state
  const isMarsRetrograde = astroState.retrograde?.includes('Mars') || false;
  const zodiacSign = astroState.zodiacSign;
  
  // Compute Mars influence for each ingredient
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    
    // Only process if it has necessary data
    if (!ingredient.name || !ingredient.matchScore) continue;
    
    // Calculate Mars influence
    const marsInfluence = calculateMarsInfluence(
      ingredient,
      zodiacSign,
      isMarsRetrograde
    );
    
    // Apply Mars boost to match score
    if (marsInfluence > 0) {
      // Include the original score, add the Mars influence
      ingredient.matchScore = (ingredient.matchScore || 0) + (marsInfluence * 1.8);
      
      // Add a flag or data point to indicate Mars influence was applied
      if (!ingredient.influences) {
        ingredient.influences = {};
      }
      ingredient.influences.mars = marsInfluence;
    }
  }
  
  // Re-sort the ingredients based on the updated scores
  ingredients.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

// Add the new function for Mercury associated ingredients
function isMercuryAssociatedIngredient(ingredientName: string): boolean {
  if (!ingredientName) return false;
  
  const lowerIngredient = ingredientName.toLowerCase();
  
  // Check direct Mercury food associations
  if (mercuryData.FoodAssociations && mercuryData.FoodAssociations.some(food => 
      food.toLowerCase() === lowerIngredient || 
      lowerIngredient.includes(food.toLowerCase()) ||
      food.toLowerCase().includes(lowerIngredient)
    )) {
    return true;
  }
  
  // Check Mercury herb associations
  if (mercuryData.HerbalAssociations?.Herbs && mercuryData.HerbalAssociations.Herbs.some(herb => 
      herb.toLowerCase() === lowerIngredient || 
      lowerIngredient.includes(herb.toLowerCase()) ||
      herb.toLowerCase().includes(lowerIngredient)
    )) {
    return true;
  }
  
  // Check for Mercury elemental connection through flavor profile
  // Mercury emphasizes complexity, variety, multiple ingredients, and contrasting flavors
  const mercuryFlavorSignals = [
    'mixed', 'blend', 'infused', 'complex', 'layered', 'aromatic', 
    'herb', 'mint', 'anise', 'fennel', 'dill', 'light', 'citrus',
    'varied', 'fusion', 'multi', 'fresh', 'stimulant', 'tea',
    'seeds', 'nuts', 'grain'
  ];
  
  if (mercuryFlavorSignals.some(signal => lowerIngredient.includes(signal))) {
    return true;
  }
  
  // Mercury is associated with Air and Earth elements
  // Lighter ingredients (Air) and grounding ingredients (Earth)
  if (lowerIngredient.includes('air') || lowerIngredient.includes('light') || 
      lowerIngredient.includes('puff') || lowerIngredient.includes('crisp') ||
      lowerIngredient.includes('earth') || lowerIngredient.includes('root') ||
      lowerIngredient.includes('tuber')) {
    return true;
  }
  
  // Check Mercury ZodiacTransit ingredient associations in current sign
  // This is a more dynamic way to check for transient associations
  const currentZodiacSign = getCurrentZodiacSign(); // Implement or use available function
  if (currentZodiacSign && mercuryData.PlanetSpecific?.ZodiacTransit?.[currentZodiacSign]?.Ingredients) {
    const transitIngredients = mercuryData.PlanetSpecific.ZodiacTransit[currentZodiacSign].Ingredients;
    if (transitIngredients.some(ingredient => 
        ingredient.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(lowerIngredient)
      )) {
      return true;
    }
  }
  
  return false;
}

// Add the function to calculate Mercury influence on ingredients
function calculateMercuryInfluence(
  ingredient: Ingredient, 
  zodiacSign?: string,
  isMercuryRetrograde = false
): number {
  let score = 0;
  
  // Base score for Mercury-ruled ingredients
  if (ingredient.astrologicalProfile?.rulingPlanets?.includes('Mercury')) {
    score += 3.0; // Strong baseline for Mercury-ruled ingredients
  }
  
  // Mercury food associations
  if (mercuryData.FoodAssociations) {
    for (const food of mercuryData.FoodAssociations) {
      if (ingredient.name.toLowerCase().includes(food.toLowerCase()) ||
          food.toLowerCase().includes(ingredient.name.toLowerCase())) {
        score += 2.0;
        break;
      }
    }
  }
  
  // Mercury herb associations
  if (mercuryData.HerbalAssociations?.Herbs && 
      (ingredient.type === 'herb' || ingredient.type === 'spice')) {
    for (const herb of mercuryData.HerbalAssociations.Herbs) {
      if (ingredient.name.toLowerCase().includes(herb.toLowerCase()) ||
          herb.toLowerCase().includes(ingredient.name.toLowerCase())) {
        score += 2.5; // Higher score for direct Mercury herb associations
        break;
      }
    }
  }
  
  // Elemental affinities based on Mercury's elements
  if (ingredient.elementalProperties) {
    // Mercury's primary elements are Air and Earth
    score += (ingredient.elementalProperties.Air || 0) * 2.0;
    score += (ingredient.elementalProperties.Earth || 0) * 1.8;
  }
  
  // Add scores based on zodiac sign if provided
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    
    // Boost if ingredient has affinity with the current sign
    if (ingredient.astrologicalProfile?.signAffinities?.includes(lowerSign)) {
      score += 1.5;
    }
    
    // Check Mercury's zodiac transit data for this sign
    const mercuryTransit = mercuryData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
    if (mercuryTransit) {
      // Boost for ingredients matching transit ingredients
      if (mercuryTransit.Ingredients && mercuryTransit.Ingredients.some(transitIngredient => 
          ingredient.name.toLowerCase().includes(transitIngredient.toLowerCase()) ||
          transitIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
        )) {
        score += 2.5;
      }
      
      // Element alignment with Mercury in this sign
      if (mercuryTransit.Elements && ingredient.elementalProperties) {
        for (const element in mercuryTransit.Elements) {
          const elemKey = element as keyof ElementalProperties;
          if (ingredient.elementalProperties[elemKey]) {
            score += mercuryTransit.Elements[element] * ingredient.elementalProperties[elemKey] * 1.2;
          }
        }
      }
    }
    
    // Special scoring for Mercury in its domicile signs
    if (lowerSign === 'gemini' || lowerSign === 'virgo') {
      if (ingredient.astrologicalProfile?.rulingPlanets?.includes('Mercury')) {
        score += 2.0; // Extra boost for Mercury ruling when Mercury is in domicile
      }
      
      // Special handling for Gemini (Air) and Virgo (Earth)
      if (lowerSign === 'gemini' && ingredient.elementalProperties?.Air) {
        score += ingredient.elementalProperties.Air * 1.8;
      } else if (lowerSign === 'virgo' && ingredient.elementalProperties?.Earth) {
        score += ingredient.elementalProperties.Earth * 1.8;
      }
    }
    
    // Special handling for Mercury in its detriment signs
    if (lowerSign === 'sagittarius' || lowerSign === 'pisces') {
      score *= 0.8; // Reduce score slightly when Mercury is in detriment
    }
  }
  
  // Adjust score based on Mercury retrograde status
  if (isMercuryRetrograde) {
    // During retrograde, Mercury emphasizes familiar, traditional ingredients
    if (ingredient.qualities?.includes('traditional') || 
        ingredient.qualities?.includes('nostalgic') ||
        ingredient.qualities?.includes('classic')) {
      score *= 1.25; // Boost for traditional ingredients during retrograde
    }
    
    // During retrograde, Mercury de-emphasizes complex or exotic ingredients
    if (ingredient.qualities?.includes('exotic') || 
        ingredient.qualities?.includes('complex') ||
        ingredient.qualities?.includes('novel')) {
      score *= 0.8; // Reduce score for complex/exotic ingredients during retrograde
    }
    
    // Apply Mercury's retrograde elemental shift if available
    if (mercuryData.RetrogradeEffect && ingredient.elementalProperties) {
      // Shift toward Matter and away from Spirit during retrograde
      if (ingredient.elementalProperties.Earth) {
        score += ingredient.elementalProperties.Earth * Math.abs(mercuryData.RetrogradeEffect.Matter);
      }
      if (ingredient.elementalProperties.Air) {
        score -= ingredient.elementalProperties.Air * Math.abs(mercuryData.RetrogradeEffect.Spirit);
      }
    }
  }
  
  // Adjust for Mercury's specific influence on certain ingredient qualities
  // Mercury emphasizes ingredients that involve mental stimulation and clarity
  if (ingredient.qualities) {
    const mercuryQualityBoosts = {
      'aromatic': 1.3,
      'complex': 1.4,
      'stimulating': 1.5,
      'adaptable': 1.3,
      'versatile': 1.4,
      'detailed': 1.2,
      'precise': 1.2
    };
    
    for (const quality of ingredient.qualities) {
      const lowerQuality = quality.toLowerCase();
      for (const [mercuryQuality, boost] of Object.entries(mercuryQualityBoosts)) {
        if (lowerQuality.includes(mercuryQuality)) {
          score += boost;
          break;
        }
      }
    }
  }
  
  return score;
}

// Add the function to enhance Mercury ingredient scoring
function enhanceMercuryIngredientScoring(ingredients: Ingredient[], astroState: AstrologicalState): void {
  // Check if Mercury is retrograde
  const isMercuryRetrograde = astroState.retrograde?.includes('Mercury') || false;
  
  // Get the current zodiac sign
  const zodiacSign = astroState.zodiacSign;
  
  // For each ingredient, calculate and apply Mercury influence score
  ingredients.forEach(ingredient => {
    const mercuryScore = calculateMercuryInfluence(ingredient, zodiacSign, isMercuryRetrograde);
    
    // Apply Mercury score as a multiplier to the ingredient's existing score
    if (ingredient.matchScore !== undefined) {
      ingredient.matchScore *= (1 + mercuryScore * 0.3);
    } else if ('score' in ingredient) {
      (ingredient as any).score *= (1 + mercuryScore * 0.3);
    }
    
    // If the ingredient has a Mercury score field, update it
    if ('mercuryAffinity' in ingredient) {
      (ingredient as any).mercuryAffinity = mercuryScore;
    }
    
    // If the ingredient has a detailed score breakdown, add Mercury score
    if ('scoreDetails' in ingredient) {
      (ingredient as any).scoreDetails = {
        ...(ingredient as any).scoreDetails,
        mercuryAffinity: mercuryScore
      };
    }
  });
}

/**
 * Determines the modality of an ingredient based on its qualities and elemental properties
 * Using the hierarchical affinities:
 * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 * 
 * @param qualities Array of quality descriptors
 * @param elementalProperties Optional elemental properties for more accurate determination
 * @returns The modality (Cardinal, Fixed, or Mutable)
 */
function determineIngredientModality(
  qualities: string[] = [],
  elementalProperties?: ElementalProperties
): Modality {
  // Ensure qualities is an array
  const qualitiesArray = Array.isArray(qualities) ? qualities : [];
  
  // Create normalized arrays of qualities for easier matching
  const normalizedQualities = qualitiesArray.map(q => q.toLowerCase());
  
  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = ['initiating', 'spicy', 'pungent', 'stimulating', 'invigorating', 'activating'];
  const fixedKeywords = ['grounding', 'stabilizing', 'nourishing', 'sustaining', 'foundational'];
  const mutableKeywords = ['adaptable', 'flexible', 'versatile', 'balancing', 'harmonizing'];
  
  const hasCardinalQuality = normalizedQualities.some(q => cardinalKeywords.includes(q));
  const hasFixedQuality = normalizedQualities.some(q => fixedKeywords.includes(q));
  const hasMutableQuality = normalizedQualities.some(q => mutableKeywords.includes(q));
  
  // If there's a clear quality indicator, use that
  if (hasCardinalQuality && !hasFixedQuality && !hasMutableQuality) {
    return 'Cardinal';
  }
  if (hasFixedQuality && !hasCardinalQuality && !hasMutableQuality) {
    return 'Fixed';
  }
  if (hasMutableQuality && !hasCardinalQuality && !hasFixedQuality) {
    return 'Mutable';
  }
  
  // If elemental properties are provided, use them to determine modality
  if (elementalProperties) {
    const { Fire, Water, Earth, Air } = elementalProperties;
    
    // Determine dominant element
    const dominantElement = getDominantElement(elementalProperties);
    
    // Use hierarchical element-modality affinities
    switch (dominantElement) {
      case 'Air':
        // Air has strongest affinity with Mutable, then Cardinal, then Fixed
        if (Air > 0.4) {
          return 'Mutable';
        }
        break;
      case 'Earth':
        // Earth has strongest affinity with Fixed, then Cardinal, then Mutable
        if (Earth > 0.4) {
          return 'Fixed';
        }
        break;
      case 'Fire':
        // Fire has balanced affinities but leans Cardinal
        if (Fire > 0.4) {
          return 'Cardinal';
        }
        break;
      case 'Water':
        // Water is balanced between Fixed and Mutable
        if (Water > 0.4) {
          // Slightly favor Mutable for Water, as per our hierarchy
          return Water > 0.6 ? 'Mutable' : 'Fixed';
        }
        break;
    }
    
    // Calculate modality scores based on hierarchical affinities
    const mutableScore = (Air * 0.9) + (Water * 0.8) + (Fire * 0.7) + (Earth * 0.5);
    const fixedScore = (Earth * 0.9) + (Water * 0.8) + (Fire * 0.6) + (Air * 0.5);
    const cardinalScore = (Fire * 0.8) + (Earth * 0.8) + (Water * 0.8) + (Air * 0.8);
    
    // Return the modality with the highest score
    if (mutableScore > fixedScore && mutableScore > cardinalScore) {
      return 'Mutable';
    } else if (fixedScore > mutableScore && fixedScore > cardinalScore) {
      return 'Fixed';
    } else {
      return 'Cardinal';
    }
  }
  
  // Default to Mutable if no clear indicators are found
  return 'Mutable';
}

/**
 * Helper function to get the dominant element from elemental properties
 */
function getDominantElement(elementalProperties: ElementalProperties): keyof ElementalProperties {
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let dominantElement: keyof ElementalProperties = 'Earth'; // Default
  let highestValue = 0;
  
  // Find the element with the highest value
  elements.forEach(element => {
    const value = elementalProperties[element] || 0;
    if (value > highestValue) {
      highestValue = value;
      dominantElement = element;
    }
  });
  
  return dominantElement;
}

export function recommendIngredients(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): IngredientRecommendation[] {
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
  
  const lunarPhaseKey = lunarPhase.replace(/\s+/g, '') as keyof typeof LUNAR_PHASES;
  const lunarPhaseData = LUNAR_PHASES[lunarPhaseKey] || LUNAR_PHASES.new;
  
  // Check if Venus is active in the current astrological state
  const isVenusActive = aspects.some(aspect => 
    aspect.planets.includes('Venus')
  );
  
  // Check if Venus is retrograde
  const isVenusRetrograde = astroState.retrograde?.includes('Venus') || false;
  
  // Check if Mars is active in the current astrological state
  const isMarsActive = aspects.some(aspect => 
    aspect.planets.includes('Mars')
  );
  
  // Check if Mars is retrograde
  const isMarsRetrograde = astroState.retrograde?.includes('Mars') || false;
  
  // Check if Mercury is active in the current astrological state
  const isMercuryActive = aspects.some(aspect => 
    aspect.planets.includes('Mercury')
  );
  
  // Check if Mercury is retrograde
  const isMercuryRetrograde = astroState.retrograde?.includes('Mercury') || false;
  
  // Check if Jupiter is active in the current astrological state
  const isJupiterActive = aspects.some(aspect => 
    aspect.planets.includes('Jupiter')
  );
  
  // Check if Jupiter is retrograde
  const isJupiterRetrograde = astroState.retrograde?.includes('Jupiter') || false;
  
  // Check if Saturn is active in the current astrological state
  const isSaturnActive = aspects.some(aspect => 
    aspect.planets.includes('Saturn')
  );
  
  // Check if Saturn is retrograde
  const isSaturnRetrograde = astroState.retrograde?.includes('Saturn') || false;
  
  // Get Venus-specific flavor recommendations based on current zodiac sign
  const venusZodiacTransit = zodiacSign && venusData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Mars-specific flavor recommendations based on current zodiac sign
  const marsZodiacTransit = zodiacSign && marsData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Mercury-specific flavor recommendations based on current zodiac sign
  const mercuryZodiacTransit = zodiacSign && mercuryData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Jupiter-specific flavor recommendations based on current zodiac sign
  const jupiterZodiacTransit = zodiacSign && jupiterData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Saturn-specific flavor recommendations based on current zodiac sign
  const saturnZodiacTransit = zodiacSign && saturnData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Identify Venus mood based on retrograde status and aspects
  // ... existing Venus mood code ...
  
  // Identify Mars mood based on retrograde status and aspects
  // ... existing Mars mood code ...
  
  // Identify Mercury mood based on retrograde status and aspects
  // ... existing Mercury mood code ...
  
  // Identify Jupiter mood based on retrograde status and aspects
  let jupiterMood = 'balanced';
  if (isJupiterActive) {
    if (isJupiterRetrograde) {
      jupiterMood = 'reflective';
      
      // Check if Jupiter is in challenging aspects (square, opposition)
      const hasChallengingAspects = aspects.some(aspect => 
        aspect.planets.includes('Jupiter') && 
        (aspect.type === 'square' || aspect.type === 'opposition')
      );
      
      if (hasChallengingAspects) {
        jupiterMood = 'restrained';
      }
    } else {
      jupiterMood = 'expansive';
      
      // Check if Jupiter is in harmonious aspects (trine, sextile)
      const hasHarmoniousAspects = aspects.some(aspect => 
        aspect.planets.includes('Jupiter') && 
        (aspect.type === 'trine' || aspect.type === 'sextile')
      );
      
      if (hasHarmoniousAspects) {
        jupiterMood = 'abundant';
      }
    }
  }
  
  // Identify Saturn mood based on retrograde status and aspects
  let saturnMood = 'structured';
  if (isSaturnActive) {
    if (isSaturnRetrograde) {
      saturnMood = 'revisionary';
      
      // Check if Saturn is in challenging aspects (square, opposition)
      const hasChallengingAspects = aspects.some(aspect => 
        aspect.planets.includes('Saturn') && 
        (aspect.type === 'square' || aspect.type === 'opposition')
      );
      
      if (hasChallengingAspects) {
        saturnMood = 'restrictive';
      }
    } else {
      saturnMood = 'disciplined';
      
      // Check if Saturn is in harmonious aspects (trine, sextile)
      const hasHarmoniousAspects = aspects.some(aspect => 
        aspect.planets.includes('Saturn') && 
        (aspect.type === 'trine' || aspect.type === 'sextile')
      );
      
      if (hasHarmoniousAspects) {
        saturnMood = 'stabilizing';
      }
    }
  }
  
  // Begin calculating scores
  const scores: Record<string, IngredientRecommendation> = {};
  
  // Iterate over all ingredient categories and individual ingredients
  for (const [categoryName, ingredients] of Object.entries(ingredientCategories)) {
    for (const ingredient of ingredients) {
      // ... existing ingredient scoring setup ...
      
      // ... existing Venus scoring code ...
      
      // ... existing Mars scoring code ...
      
      // ... existing Mercury scoring code ...
      
      // Calculate Jupiter-specific scoring
      if (isJupiterActive) {
        let jupiterScore = 0;
        
        // Check if ingredient is directly associated with Jupiter
        if (jupiterData.FoodAssociations && jupiterData.FoodAssociations.includes(ingredient.name)) {
          jupiterScore += 3.0; // Direct association is highly valued
        }
        
        // Check for ingredient quality match with Jupiter's properties
        if (jupiterData.AstrologicalProperties) {
          // Check if ingredient has expansive qualities (growth, abundance)
          if (ingredient.qualities?.includes('expansive') || 
              ingredient.qualities?.includes('abundant') ||
              ingredient.qualities?.includes('joyful')) {
            jupiterScore += 1.8;
          }
          
          // Check if ingredient has the lush, rich qualities of Jupiter
          if (ingredient.qualities?.includes('rich') || 
              ingredient.qualities?.includes('generous') ||
              ingredient.qualities?.includes('hearty')) {
            jupiterScore += 1.5;
          }
        }
        
        // Check for elemental connections to Jupiter
        if (jupiterData.ElementalConnections && ingredient.elementalProperties) {
          // Jupiter bridges Air and Fire
          if (ingredient.elementalProperties.air > 0.5 || ingredient.elementalProperties.fire > 0.5) {
            jupiterScore += 1.2;
          }
          
          // Check if ingredient aligns with Jupiter's associated qualities
          if (jupiterData.ElementalConnections.AssociatedQualities) {
            if ((jupiterData.ElementalConnections.AssociatedQualities.includes('Warm') && 
                ingredient.qualities?.includes('warming')) ||
                (jupiterData.ElementalConnections.AssociatedQualities.includes('Moist') && 
                ingredient.qualities?.includes('moist'))) {
              jupiterScore += 0.8;
            }
          }
        }
        
        // Check for alignment with Jupiter's flavor profile
        if (jupiterData.FlavorProfiles && ingredient.flavor) {
          // Jupiter tends to favor sweet, umami, and rich flavors
          if (ingredient.flavor.sweet > 0.5) jupiterScore += ingredient.flavor.sweet * 1.2;
          if (ingredient.flavor.umami > 0.5) jupiterScore += ingredient.flavor.umami * 1.0;
          if (ingredient.flavor.bitter < 0.3) jupiterScore += (1 - ingredient.flavor.bitter) * 0.5; // Jupiter disfavors bitter
        }
        
        // Check for zodiac transit recommendations
        if (jupiterZodiacTransit && jupiterZodiacTransit.Ingredients) {
          if (jupiterZodiacTransit.Ingredients.includes(ingredient.name)) {
            jupiterScore += 2.0; // Strong boost for transit-specific ingredients
          }
          
          // Check ingredient categories for matches
          if (jupiterZodiacTransit.FoodFocus && ingredient.categories) {
            const foodFocus = jupiterZodiacTransit.FoodFocus.toLowerCase();
            const matches = ingredient.categories.filter(category => 
              foodFocus.includes(category.toLowerCase())
            ).length;
            
            jupiterScore += matches * 0.7;
          }
        }
        
        // Apply Jupiter mood modifier
        switch (jupiterMood) {
          case 'abundant':
            // Boost rich, festive ingredients
            if (ingredient.qualities?.includes('festive') || 
                ingredient.qualities?.includes('celebratory') ||
                ingredient.qualities?.includes('luxurious')) {
              jupiterScore *= 1.3;
            }
            break;
          case 'expansive':
            // Boost growth-oriented ingredients
            if (ingredient.qualities?.includes('nourishing') || 
                ingredient.qualities?.includes('vitalizing')) {
              jupiterScore *= 1.2;
            }
            break;
          case 'reflective':
            // During reflective periods, moderate the excess
            if (ingredient.qualities?.includes('balanced') || 
                ingredient.qualities?.includes('harmonizing')) {
              jupiterScore *= 1.2;
            } else if (ingredient.qualities?.includes('excessive') || 
                      ingredient.qualities?.includes('indulgent')) {
              jupiterScore *= 0.8; // Reduce score for excessive ingredients
            }
            break;
          case 'restrained':
            // During challenging retrograde, favor simple ingredients
            if (ingredient.qualities?.includes('simple') || 
                ingredient.qualities?.includes('pure') ||
                ingredient.qualities?.includes('modest')) {
              jupiterScore *= 1.3;
            } else if (ingredient.qualities?.includes('rich') || 
                      ingredient.qualities?.includes('heavy')) {
              jupiterScore *= 0.7; // Significant reduction for heavy ingredients
            }
            break;
        }
        
        // Apply retrograde modifications
        if (isJupiterRetrograde && jupiterData.PlanetSpecific?.Retrograde) {
          // During retrograde, Jupiter calls for moderation and simplicity
          if (jupiterData.PlanetSpecific.Retrograde.ElementalShift) {
            const elementShift = jupiterData.PlanetSpecific.Retrograde.ElementalShift;
            
            // Check if ingredient aligns with Jupiter retrograde elemental shift
            for (const element in elementShift) {
              const elemProperty = element.toLowerCase() as keyof ElementalProperties;
              if (ingredient.elementalProperties && 
                  ingredient.elementalProperties[elemProperty] > 0.5) {
                jupiterScore += elementShift[element] * 0.5;
              }
            }
          }
        }
        
        // Apply Jupiter's influence
        if (isJupiterActive && jupiterData) {
          // ... existing code ...
          
          // Scale Jupiter's influence
          const scaledJupiterScore = jupiterScore * 1.8; // Jupiter has a strong influence
          scores[ingredient.name].score += scaledJupiterScore;
          
          // Add Jupiter score to details
          scores[ingredient.name].scoreDetails['jupiterAffinity'] = scaledJupiterScore;
        }
      }
      
      // Calculate Saturn-specific scoring
      if (isSaturnActive) {
        let saturnScore = 0;
        
        // Check if ingredient is directly associated with Saturn
        if (saturnData.FoodAssociations && saturnData.FoodAssociations.includes(ingredient.name)) {
          saturnScore += 3.0; // Direct association is highly valued
        }
        
        // Check for ingredient quality match with Saturn's properties
        if (saturnData.AstrologicalProperties) {
          // Check if ingredient has structured, traditional qualities
          if (ingredient.qualities?.includes('traditional') || 
              ingredient.qualities?.includes('grounding') ||
              ingredient.qualities?.includes('stabilizing')) {
            saturnScore += 1.8;
          }
          
          // Check if ingredient has the preservative qualities of Saturn
          if (ingredient.qualities?.includes('preserved') || 
              ingredient.qualities?.includes('aged') ||
              ingredient.qualities?.includes('fermented') ||
              ingredient.qualities?.includes('dried')) {
            saturnScore += 2.0; // Strong boost for preservation techniques
          }
        }
        
        // Check for elemental connections to Saturn
        if (saturnData.ElementalConnections && ingredient.elementalProperties) {
          // Saturn bridges Earth and Air
          if (ingredient.elementalProperties.earth > 0.5 || ingredient.elementalProperties.air > 0.5) {
            saturnScore += 1.2;
          }
          
          // Check if ingredient aligns with Saturn's associated qualities
          if (saturnData.ElementalConnections.AssociatedQualities) {
            if ((saturnData.ElementalConnections.AssociatedQualities.includes('Dry') && 
                ingredient.qualities?.includes('drying')) ||
                (saturnData.ElementalConnections.AssociatedQualities.includes('Cold') && 
                ingredient.qualities?.includes('cooling'))) {
              saturnScore += 0.8;
            }
          }
        }
        
        // Check for alignment with Saturn's flavor profile
        if (saturnData.FlavorProfiles && ingredient.flavor) {
          // Saturn tends to favor bitter, sour, and umami flavors
          if (ingredient.flavor.bitter > 0.5) saturnScore += ingredient.flavor.bitter * 1.2;
          if (ingredient.flavor.sour > 0.5) saturnScore += ingredient.flavor.sour * 1.0;
          if (ingredient.flavor.umami > 0.5) saturnScore += ingredient.flavor.umami * 0.8;
          if (ingredient.flavor.sweet > 0.7) saturnScore -= ingredient.flavor.sweet * 0.5; // Saturn disfavors overly sweet
        }
        
        // Check for zodiac transit recommendations
        if (saturnZodiacTransit && saturnZodiacTransit.Ingredients) {
          if (saturnZodiacTransit.Ingredients.includes(ingredient.name)) {
            saturnScore += 2.0; // Strong boost for transit-specific ingredients
          }
          
          // Check ingredient categories for matches
          if (saturnZodiacTransit.FoodFocus && ingredient.categories) {
            const foodFocus = saturnZodiacTransit.FoodFocus.toLowerCase();
            const matches = ingredient.categories.filter(category => 
              foodFocus.includes(category.toLowerCase())
            ).length;
            
            saturnScore += matches * 0.7;
          }
        }
        
        // Apply Saturn mood modifier
        switch (saturnMood) {
          case 'stabilizing':
            // Boost grounding, structural ingredients
            if (ingredient.qualities?.includes('grounding') || 
                ingredient.qualities?.includes('strengthening') ||
                ingredient.qualities?.includes('structural')) {
              saturnScore *= 1.3;
            }
            break;
          case 'disciplined':
            // Boost traditional, time-tested ingredients
            if (ingredient.qualities?.includes('traditional') || 
                ingredient.qualities?.includes('ancient') ||
                ingredient.qualities?.includes('time-honored')) {
              saturnScore *= 1.2;
            }
            break;
          case 'revisionary':
            // During reflective periods, revisit traditional preparations with a twist
            if (ingredient.qualities?.includes('versatile') || 
                ingredient.qualities?.includes('adaptable')) {
              saturnScore *= 1.2;
            }
            break;
          case 'restrictive':
            // During challenging retrograde, favor foundational ingredients
            if (ingredient.qualities?.includes('basic') || 
                ingredient.qualities?.includes('essential') ||
                ingredient.qualities?.includes('foundational')) {
              saturnScore *= 1.3;
            } else if (ingredient.qualities?.includes('exotic') || 
                      ingredient.qualities?.includes('unusual')) {
              saturnScore *= 0.7; // Significant reduction for exotic ingredients
            }
            break;
        }
        
        // Apply retrograde modifications
        if (isSaturnRetrograde && saturnData.PlanetSpecific?.Retrograde) {
          // During retrograde, Saturn calls for review of traditions
          if (saturnData.PlanetSpecific.Retrograde.ElementalShift) {
            const elementShift = saturnData.PlanetSpecific.Retrograde.ElementalShift;
            
            // Check if ingredient aligns with Saturn retrograde elemental shift
            for (const element in elementShift) {
              const elemProperty = element.toLowerCase() as keyof ElementalProperties;
              if (ingredient.elementalProperties && 
                  ingredient.elementalProperties[elemProperty] > 0.5) {
                saturnScore += elementShift[element] * 0.5;
              }
            }
          }
        }
        
        // Root vegetables get a special boost with Saturn
        if (ingredient.categories?.includes('root vegetable') || 
            ingredient.categories?.includes('tuber')) {
          saturnScore *= 1.5; // Major boost for root vegetables
        }
        
        // Apply Saturn's influence
        if (isSaturnActive && saturnData) {
          // ... existing code ...
          
          // Scale Saturn's influence
          const scaledSaturnScore = saturnScore * 1.7; // Saturn has a strong influence but slightly less than Jupiter
          scores[ingredient.name].score += scaledSaturnScore;
          
          // Add Saturn score to details
          scores[ingredient.name].scoreDetails['saturnAffinity'] = scaledSaturnScore;
        }
      }
      
      // ... existing code continuation ...
    }
  }
  
  // ... existing sorting and return code ...
} 
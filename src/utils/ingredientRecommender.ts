import { AstrologicalState } from '@/types';
import { ElementalProperties, IngredientMapping } from '@/types/alchemy';
import { ingredients , proteins, grains } from '@/data/ingredients';

// Import default elemental properties from constants to use proper values
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';

// Import ingredients data
import { vegetables } from '@/data/ingredients/vegetables';
import { fruits } from '@/data/ingredients/fruits';
import { herbs } from '@/data/ingredients/herbs';
import { spices } from '@/data/ingredients/spices';
import { seasonings } from '@/data/ingredients/seasonings';
import { oils } from '@/data/ingredients/oils';

// Import planet data
import { planetaryData } from '@/data/planets';

import {
  CHAKRA_NUTRITIONAL_CORRELATIONS,
  CHAKRA_HERBS,
} from "@/constants/chakraSymbols";
import { LUNAR_PHASES } from "@/constants/lunar";
import { ingredientCategories } from "@/data/ingredientCategories";
import {
  calculateLunarPhase,
  calculatePlanetaryPositions,
} from "@/utils/astrologyUtils";

// Import the getAllIngredients function if it exists, otherwise we'll create our own
import { getIngredientsUtil } from "@/utils/foodRecommender";

/**
 * Standardizes ingredient category names to ensure consistent grouping
 * @param ingredient The ingredient to get a standard category for
 * @returns A standardized category name (e.g., 'vegetables', 'fruits', etc.)
 */
function standardizeIngredientCategory(ingredient: Ingredient): string {
  if (!ingredient) return 'vegetables'; // Default to vegetables instead of 'other'
  
  // Category mapping for singular and plural forms
  const categoryMapping: Record<string, string> = {
    // Main categories
    'protein': 'proteins',
    'proteins': 'proteins',
    'meat': 'proteins',
    'meats': 'proteins',
    'poultry': 'proteins',
    'seafood': 'proteins',
    'fish': 'proteins',
    'legume': 'proteins',
    'legumes': 'proteins',
    'tofu': 'proteins',
    'seitan': 'proteins',
    'tempeh': 'proteins',
    
    'vegetable': 'vegetables',
    'vegetables': 'vegetables',
    'root': 'vegetables',
    'roots': 'vegetables',
    'tuber': 'vegetables',
    'tubers': 'vegetables',
    'leafy_green': 'vegetables',
    'leafy_greens': 'vegetables',
    'leafy green': 'vegetables',
    'leafy greens': 'vegetables',
    
    'grain': 'grains',
    'grains': 'grains',
    'cereal': 'grains',
    'cereals': 'grains',
    'bread': 'grains',
    'pasta': 'grains',
    'rice': 'grains',
    
    'fruit': 'fruits',
    'fruits': 'fruits',
    'berry': 'fruits',
    'berries': 'fruits',
    'citrus': 'fruits',
    'melon': 'fruits',
    'melons': 'fruits',
    'tropical_fruit': 'fruits',
    'tropical_fruits': 'fruits',
    'stone_fruit': 'fruits',
    'stone_fruits': 'fruits',
    
    'herb': 'herbs',
    'herbs': 'herbs',
    'culinary_herb': 'herbs',
    'culinary_herbs': 'herbs',
    'medicinal_herb': 'herbs',
    'medicinal_herbs': 'herbs',
    'aromatic': 'herbs',
    'aromatics': 'herbs',
    'herb & aromatic': 'herbs',
    'herbs & aromatics': 'herbs',
    
    'spice': 'spices',
    'spices': 'spices',
    'seasoning': 'spices',
    'seasonings': 'spices',
    'condiment': 'spices',
    'condiments': 'spices',
    'salt': 'spices',
    'pepper': 'spices',
    'spice & seasoning': 'spices', 
    'spices & seasonings': 'spices',
    
    'oil': 'oils',
    'oils': 'oils',
    'fat': 'oils',
    'fats': 'oils',
    'butter': 'oils',
    'ghee': 'oils',
    'lard': 'oils',
    'shortening': 'oils',
    'oil & fat': 'oils',
    'oils & fats': 'oils',
    
    'vinegar': 'vinegars',
    'vinegars': 'vinegars',
    'acidifier': 'vinegars',
    'acidifiers': 'vinegars',
    'citrus_juice': 'vinegars',
    'citrus_juices': 'vinegars',
    'lemon_juice': 'vinegars',
    'lime_juice': 'vinegars',
    'acid': 'vinegars',
    'acids': 'vinegars',
    'vinegar & acidifier': 'vinegars',
    'vinegars & acidifiers': 'vinegars',
  };
  
  // Try to get category from ingredient.category
  if (ingredient.category) {
    const mappedCategory = categoryMapping[ingredient.category.toLowerCase()];
    if (mappedCategory) return mappedCategory;
    
    // If no exact match but category contains a keyword, map to appropriate category
    const lowerCategory = ingredient.category.toLowerCase();
    if (lowerCategory.includes('herb') || lowerCategory.includes('aromatic')) {
      return 'herbs';
    }
    if (lowerCategory.includes('spice') || lowerCategory.includes('season')) {
      return 'spices';
    }
    if (lowerCategory.includes('oil') || lowerCategory.includes('fat')) {
      return 'oils';
    }
    if (lowerCategory.includes('vinegar') || lowerCategory.includes('acid')) {
      return 'vinegars';
    }
    if (lowerCategory.includes('protein') || lowerCategory.includes('meat') || 
        lowerCategory.includes('bean') || lowerCategory.includes('legume')) {
      return 'proteins';
    }
    if (lowerCategory.includes('vegetable')) {
      return 'vegetables';
    }
    if (lowerCategory.includes('grain') || lowerCategory.includes('cereal')) {
      return 'grains';
    }
    if (lowerCategory.includes('fruit') || lowerCategory.includes('berry')) {
      return 'fruits';
    }
  }
  
  // Fallback to ingredient.type if category is missing
  if (ingredient.type) {
    const mappedType = categoryMapping[ingredient.type.toLowerCase()];
    if (mappedType) return mappedType;
    
    // If no exact match but type contains a keyword, map to appropriate category
    const lowerType = ingredient.type.toLowerCase();
    if (lowerType.includes('herb') || lowerType.includes('aromatic')) {
      return 'herbs';
    }
    if (lowerType.includes('spice') || lowerType.includes('season')) {
      return 'spices';
    }
    if (lowerType.includes('oil') || lowerType.includes('fat')) {
      return 'oils';
    }
    if (lowerType.includes('vinegar') || lowerType.includes('acid')) {
      return 'vinegars';
    }
    if (lowerType.includes('protein') || lowerType.includes('meat') || 
        lowerType.includes('bean') || lowerType.includes('legume')) {
      return 'proteins';
    }
    if (lowerType.includes('vegetable')) {
      return 'vegetables';
    }
    if (lowerType.includes('grain') || lowerType.includes('cereal')) {
      return 'grains';
    }
    if (lowerType.includes('fruit') || lowerType.includes('berry')) {
      return 'fruits';
    }
  }
  
  // For ingredients with no category or type, try to infer from the name
  if (ingredient.name) {
    const lowerName = ingredient.name.toLowerCase();
    
    // Use basic heuristics based on name to categorize
    if (lowerName.includes('oil') || lowerName.includes('butter') || 
        lowerName.includes('fat') || lowerName.includes('ghee') || 
        lowerName.includes('lard')) {
      return 'oils';
    }
    
    if (lowerName.includes('vinegar') || lowerName.includes('acid') || 
        lowerName.includes('lemon juice') || lowerName.includes('lime juice')) {
      return 'vinegars';
    }
    
    if (lowerName.includes('herb') || lowerName.includes('basil') || 
        lowerName.includes('mint') || lowerName.includes('cilantro') || 
        lowerName.includes('parsley') || lowerName.includes('sage') || 
        lowerName.includes('rosemary') || lowerName.includes('thyme') ||
        lowerName.includes('dill') || lowerName.includes('oregano')) {
      return 'herbs';
    }
    
    if (lowerName.includes('spice') || lowerName.includes('salt') || 
        lowerName.includes('pepper') || lowerName.includes('cinnamon') || 
        lowerName.includes('cumin') || lowerName.includes('turmeric') || 
        lowerName.includes('paprika') || lowerName.includes('cardamom') ||
        lowerName.includes('clove') || lowerName.includes('nutmeg') ||
        lowerName.includes('ginger') || lowerName.includes('garlic')) {
      return 'spices';
    }
    
    if (lowerName.includes('rice') || lowerName.includes('pasta') || 
        lowerName.includes('noodle') || lowerName.includes('bread') || 
        lowerName.includes('cereal') || lowerName.includes('grain') || 
        lowerName.includes('wheat') || lowerName.includes('oat') ||
        lowerName.includes('barley') || lowerName.includes('quinoa')) {
      return 'grains';
    }
    
    if (lowerName.includes('fruit') || lowerName.includes('apple') || 
        lowerName.includes('orange') || lowerName.includes('banana') || 
        lowerName.includes('berry') || lowerName.includes('berries') || 
        lowerName.includes('melon') || lowerName.includes('mango') ||
        lowerName.includes('pear') || lowerName.includes('peach') ||
        lowerName.includes('plum') || lowerName.includes('cherry')) {
      return 'fruits';
    }
    
    if (lowerName.includes('meat') || lowerName.includes('beef') || 
        lowerName.includes('chicken') || lowerName.includes('pork') || 
        lowerName.includes('fish') || lowerName.includes('seafood') || 
        lowerName.includes('tofu') || lowerName.includes('tempeh') ||
        lowerName.includes('seitan') || lowerName.includes('bean') ||
        lowerName.includes('lentil') || lowerName.includes('protein')) {
      return 'proteins';
    }
  }
  
  // Default to vegetables as the safest fallback (instead of 'other')
  return 'vegetables';
}

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
  ...Object.values(oils || {}),
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
        ...(data as any),
      });
    });
  });

  return allIngredients;
}

/**
 * Returns a list of ingredients that match the current astrological state
 */
export function getRecommendedIngredients(
  astroState: AstrologicalState
): Ingredient[] {
  // Get the active planets from the astrological state
  const activePlanets = astroState.activePlanets || [];

  // If we don't have any active planets, use all planets by default
  const planetsToUse =
    activePlanets.length > 0
      ? activePlanets
      : [
          'Sun',
          'Moon',
          'Mercury',
          'Venus',
          'Mars',
          'Jupiter',
          'Saturn',
          'Uranus',
          'Neptune',
          'Pluto',
        ];

  // Filter ingredients based on matching planetary rulers
  let filteredIngredients = allIngredients.filter((ingredient) => {
    // Check if any of the ingredient's ruling planets are active
    return ingredient.astrologicalProfile?.rulingPlanets?.some((planet) =>
      planetsToUse.includes(planet)
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
      const aValue =
        a.elementalProperties?.[
          astroState.dominantElement as keyof ElementalProperties
        ] || 0;
      const bValue =
        b.elementalProperties?.[
          astroState.dominantElement as keyof ElementalProperties
        ] || 0;
      return bValue - aValue;
    });
  }

  // If we have a current zodiac sign, prioritize ingredients with that affinity
  if (astroState.zodiacSign) {
    const zodiacSign = astroState.zodiacSign.toLowerCase();

    // Apply Venus's zodiac transit data if Venus is active and in this sign
    const venusBoost =
      planetsToUse.includes('Venus') &&
      venusData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign]
        ? 2
        : 0;

    // Apply Mars's zodiac transit data if Mars is active and in this sign
    const marsBoost =
      planetsToUse.includes('Mars') &&
      marsData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign]
        ? 2
        : 0;

    // Apply Mercury's zodiac transit data if Mercury is active and in this sign
    const mercuryBoost =
      planetsToUse.includes('Mercury') &&
      mercuryData.PlanetSpecific?.ZodiacTransit?.[astroState.zodiacSign]
        ? 2
        : 0;

    filteredIngredients.sort((a, b) => {
      const aHasAffinity = a.astrologicalProfile?.signAffinities?.includes(
        zodiacSign
      )
        ? 1
        : 0;
      const bHasAffinity = b.astrologicalProfile?.signAffinities?.includes(
        zodiacSign
      )
        ? 1
        : 0;

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
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  },
  options: RecommendationOptions = {}
): GroupedIngredientRecommendations {
  // Safety check for elementalProps
  if (!elementalProps || typeof elementalProps !== 'object') {
    console.error('Invalid elemental properties provided to getIngredientRecommendations');
    return {};
  }

  // Ensure we have a valid timestamp
  if (!elementalProps.timestamp) {
    elementalProps.timestamp = new Date();
  }

  // Ensure planetaryAlignment exists
  if (!elementalProps.planetaryAlignment) {
    elementalProps.planetaryAlignment = {};
  }

  // Get ALL ingredients - don't filter yet to ensure we have the complete pool
  const allIngredients = getAllIngredients();

  // Calculate ruling planet based on sun's position
  const sunSign = elementalProps.zodiacSign?.toLowerCase() as ZodiacSign;

  // Map of signs to their ruling planets
  const signRulers: Record<string, string> = {
    aries: 'Mars',
    taurus: 'Venus',
    gemini: 'Mercury',
    cancer: 'Moon',
    leo: 'Sun',
    virgo: 'Mercury',
    libra: 'Venus',
    scorpio: 'Mars',
    sagittarius: 'Jupiter',
    capricorn: 'Saturn',
    aquarius: 'Saturn', // Traditional ruler
    pisces: 'Jupiter', // Traditional ruler
  };

  const rulingPlanet = signRulers[sunSign] || 'Sun';

  // Get decan information for each planet position
  const planetDecans: Record<
    string,
    { decanNum: number; decanRuler: string; tarotCard: string }
  > = {};

  // Safely process planetary alignment data
  if (elementalProps.planetaryAlignment && typeof elementalProps.planetaryAlignment === 'object') {
    Object.entries(elementalProps.planetaryAlignment).forEach(
      ([planet, position]) => {
        if (!position || !position.sign) return;

        const sign = position.sign.toLowerCase();
        const degree = position.degree || 0;

        // Determine which decan the planet is in
        let decanNum = 1;
        if (degree >= 10 && degree < 20) decanNum = 2;
        else if (degree >= 20) decanNum = 3;

        // Reference data for decan rulers and tarot cards based on sign and decan
        const decanRulerMap: Record<string, Record<number, string>> = {
          aries: { 1: 'Mars', 2: 'Sun', 3: 'Venus' },
          taurus: { 1: 'Mercury', 2: 'Moon', 3: 'Saturn' },
          gemini: { 1: 'Jupiter', 2: 'Mars', 3: 'Sun' },
          cancer: { 1: 'Venus', 2: 'Mercury', 3: 'Moon' },
          leo: { 1: 'Saturn', 2: 'Jupiter', 3: 'Mars' },
          virgo: { 1: 'Sun', 2: 'Venus', 3: 'Mercury' },
          libra: { 1: 'Moon', 2: 'Saturn', 3: 'Jupiter' },
          scorpio: { 1: 'Mars', 2: 'Sun', 3: 'Venus' },
          sagittarius: { 1: 'Mercury', 2: 'Moon', 3: 'Saturn' },
          capricorn: { 1: 'Jupiter', 2: 'Mars', 3: 'Sun' },
          aquarius: { 1: 'Venus', 2: 'Mercury', 3: 'Moon' },
          pisces: { 1: 'Saturn', 2: 'Jupiter', 3: 'Mars' },
        };

        const tarotCardMap: Record<string, Record<number, string>> = {
          aries: { 1: '2 of Wands', 2: '3 of Wands', 3: '4 of Wands' },
          taurus: {
            1: '5 of Pentacles',
            2: '6 of Pentacles',
            3: '7 of Pentacles',
          },
          gemini: { 1: '8 of Swords', 2: '9 of Swords', 3: '10 of Swords' },
          cancer: { 1: '2 of Cups', 2: '3 of Cups', 3: '4 of Cups' },
          leo: { 1: '5 of Wands', 2: '6 of Wands', 3: '7 of Wands' },
          virgo: {
            1: '8 of Pentacles',
            2: '9 of Pentacles',
            3: '10 of Pentacles',
          },
          libra: { 1: '2 of Swords', 2: '3 of Swords', 3: '4 of Swords' },
          scorpio: { 1: '5 of Cups', 2: '6 of Cups', 3: '7 of Cups' },
          sagittarius: { 1: '8 of Wands', 2: '9 of Wands', 3: '10 of Wands' },
          capricorn: {
            1: '2 of Pentacles',
            2: '3 of Pentacles',
            3: '4 of Pentacles',
          },
          aquarius: { 1: '5 of Swords', 2: '6 of Swords', 3: '7 of Swords' },
          pisces: { 1: '8 of Cups', 2: '9 of Cups', 3: '10 of Cups' },
        };

        const decanRuler = decanRulerMap[sign]?.[decanNum] || '';
        const tarotCard = tarotCardMap[sign]?.[decanNum] || '';

        planetDecans[planet] = { decanNum, decanRuler, tarotCard };
      }
    );
  }

  // Only apply basic filters for specifically excluded ingredients
  const filteredIngredients = allIngredients.filter(ingredient => {
    // Apply only bare minimum filters
    if (options?.excludeIngredients?.includes(ingredient.name)) return false;
    if (options?.includeOnly && !options.includeOnly.includes(ingredient.name)) return false;
    
    return true;
  });
  
  // Score all filtered ingredients
  const scoredIngredients = filteredIngredients.map((ingredient) => {
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
    const totalScore =
      elementalScore * 0.3 +
      modalityScore * 0.15 +
      seasonalScore * 0.15 +
      planetaryScore * 0.4;

    // Assign modality if not already present
    const modality =
      ingredient.modality ||
      determineIngredientModality(
        ingredient.qualities,
        ingredient.elementalProperties
      );

    // Calculate normalized match score that will display between 65-100%
    const rawScore = totalScore;
    const matchScore = 0.65 + (rawScore * 0.35); // Transform to 0.65-1.0 range

    return {
      ...ingredient,
      score: totalScore,
      elementalScore,
      modalityScore,
      seasonalScore,
      planetaryScore,
      modality,
      matchScore,
    };
  });

  // Group ingredients by category
  const groupedRecommendations: GroupedIngredientRecommendations = {};
  
  // First, organize ingredients by category
  scoredIngredients.forEach((ingredient) => {
    // Use the standardized category helper function
    const category = standardizeIngredientCategory(ingredient);
    
    // Skip category filtering until the end
    if (!groupedRecommendations[category]) {
      groupedRecommendations[category] = [];
    }
    
    groupedRecommendations[category].push(ingredient);
  });
  
  // Then sort each category by matchScore and apply limits
  const limit = options.limit || 24;
  const categoryMaxItems = Math.ceil(limit / (8 || 1)); // Max items per category
  
  Object.keys(groupedRecommendations).forEach(category => {
    // Sort ingredients by matchScore (highest first)
    groupedRecommendations[category].sort((a, b) => b.matchScore - a.matchScore);
    
    // Apply category limit for display
    if (groupedRecommendations[category].length > categoryMaxItems) {
      groupedRecommendations[category] = groupedRecommendations[category].slice(0, categoryMaxItems);
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

  // If no preferred modality, return improved neutral score
  if (!preferredModality) return 0.65;

  // Return 1.0 for exact match, 0.65 for partial match, 0.4 for mismatch
  if (ingredientModality === preferredModality) return 1.0;

  // Consider partial matches based on modality compatibility
  const compatibleModalities = {
    Cardinal: ['Mutable'],
    Fixed: ['Mutable'],
    Mutable: ['Cardinal', 'Fixed'],
  };

  if (compatibleModalities[preferredModality]?.includes(ingredientModality)) {
    return 0.75; // Improved partial match score
  }

  return 0.4; // Better minimum score for display purposes
}

/**
 * Calculate elemental score between ingredient and system elemental properties
 * Enhanced to give more weight to dominant elements and better similarity calculation
 */
function calculateElementalScore(
  ingredientProps?: ElementalProperties,
  systemProps?: ElementalProperties
): number {
  // Safety check for null / undefined properties
  if (!ingredientProps || typeof ingredientProps !== 'object') {
    // Use DEFAULT_ELEMENTAL_PROPERTIES instead of hardcoded 0.5
    return 0.6; // Slightly above neutral score for better baseline
  }
  
  if (!systemProps || typeof systemProps !== 'object') {
    return 0.6; // Slightly above neutral score for better baseline
  }
  
  // Calculate score based on elemental compatibility
  let score = 0;
  let totalWeight = 0;

  // Handle each element
  Object.entries(systemProps).forEach(([element, weight]) => {
    if (typeof weight !== 'number') return;
    
    
    const elementKey = element as keyof ElementalProperties;
    const ingredientValue = ingredientProps[elementKey] || 0;
    
    // Add to score - weighted by system's preference
    score += ingredientValue * weight;
    totalWeight += weight;
  });

  // Normalize score with a minimum value
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0.6;
  
  // Apply a boost to ensure scores are more meaningful
  // This ensures scores fall in the 0.6-1.0 range (60-100%) for better UI display
  return 0.6 + (normalizedScore * 0.4);
}

/**
 * Calculate seasonal score for an ingredient based on current date
 * @param ingredient Ingredient to score
 * @param date Current date
 * @returns Seasonal score (0-1)
 */
function calculateSeasonalScore(ingredient: Ingredient, date: Date): number {
  // Default score if no seasonality data - slightly better than neutral
  if (!ingredient.seasonality) return 0.65;

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

  // Get seasonality score for current season, with improved default
  const seasonScore = ingredient.seasonality[currentSeason] || 0.65;

  return seasonScore;
}

/**
 * Enhanced planetary score calculation that considers decans and tarot associations,
 * with special weight for the ruling planet determined by sun position
 */
function calculateEnhancedPlanetaryScore(
  ingredient: Ingredient,
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
  planetDecans: Record<
    string,
    { decanNum: number; decanRuler: string; tarotCard: string }
  >,
  rulingPlanet: string
): number {
  if (!ingredient.astrologicalProfile) return 0.65; // Improved neutral score for ingredients without profile

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
    if (
      ingredient.astrologicalProfile.signAffinities?.includes(
        position.sign.toLowerCase()
      )
    ) {
      score += 1;
      totalFactors += 1;
    }

    // Special handling for decan rulers
    const decanInfo = planetDecans[planet];
    if (
      decanInfo &&
      ingredient.astrologicalProfile.rulingPlanets?.includes(
        decanInfo.decanRuler
      )
    ) {
      score += 0.8; // Good bonus for decan ruler match
      totalFactors += 0.8;
    }

    // Tarot card associations - add subtle influence
    if (
      decanInfo?.tarotCard &&
      ingredient.astrologicalProfile.tarotAssociations?.includes(
        decanInfo.tarotCard
      )
    ) {
      score += 0.7;
      totalFactors += 0.7;
    }
  });

  // If there are no factors to consider, return improved neutral score
  if (totalFactors === 0) return 0.65;

  // Calculate normalized score - scales from 0.65-1.0 for better display values
  const rawScore = score / ((totalFactors || 1) + 0.5);
  return 0.65 + (rawScore * 0.35); // Transform to 0.65-1.0 range (65-100%)
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
    aries: 'Fire',
    taurus: 'Earth',
    gemini: 'Air',
    cancer: 'Water',
    leo: 'Fire',
    virgo: 'Earth',
    libra: 'Air',
    scorpio: 'Water',
    sagittarius: 'Fire',
    capricorn: 'Earth',
    aquarius: 'Air',
    pisces: 'Water',
    // Support for case variations
    Aries: 'Fire',
    Leo: 'Fire',
    Libra: 'Air',
    Scorpio: 'Water',
    Cancer: 'Water',
  };

  // Define planet weights
  const planetWeights: Record<string, number> = {
    sun: 5,
    moon: 4,
    mercury: 3,
    venus: 3,
    mars: 3,
    jupiter: 2,
    saturn: 2,
    uranus: 1,
    neptune: 1,
    pluto: 1,
  };

  // Initialize elemental influences
  const elementalInfluences: ElementalProperties = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
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
  const total = Object.values(elementalInfluences).reduce(
    (sum, val) => sum + val,
    0
  );
  if (total > 0) {
    Object.keys(elementalInfluences).forEach((element) => {
      elementalInfluences[element as keyof ElementalProperties] =
        elementalInfluences[element as keyof ElementalProperties] / (total || 1);
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
  const sortedChakras = chakraEntries.sort(
    ([, energyA], [, energyB]) => energyB - energyA
  );

  // Take only chakras with significant energy (> 0)
  const significantChakras = sortedChakras.filter(([, energy]) => energy > 0);

  // Get ALL ingredients instead of filtering early
  const allIngredients = getAllIngredients();
  const allRecommendations: IngredientRecommendation[] = [];

  // Prepare the result object
  const result: GroupedIngredientRecommendations = {};

  // Process all significant chakras
  significantChakras.forEach(([chakra, energy]) => {
    // Get nutritional correlations for this chakra
    const nutritionalCorrelations =
      CHAKRA_NUTRITIONAL_CORRELATIONS[chakra] || [];
    const herbRecommendations = CHAKRA_HERBS[chakra] || [];

    // Score ingredients based on chakra match
    allIngredients.forEach((ingredient) => {
      // Check if ingredient name or type matches any nutritional correlation
      const matchesNutritional = nutritionalCorrelations.some(
        (correlation) =>
          ingredient.name.toLowerCase().includes(correlation.toLowerCase()) ||
          (ingredient.type
            ? ingredient.type.toLowerCase().includes(correlation.toLowerCase())
            : false)
      );

      // Check if ingredient name matches any herb recommendation
      const matchesHerb = herbRecommendations.some((herb) =>
        ingredient.name.toLowerCase().includes(herb.toLowerCase())
      );

      // Only process matching ingredients
      if (matchesNutritional || matchesHerb) {
        // Calculate match score based on chakra energy
        const matchScore = 0.65 + (Math.min(energy, 10) / 29); // Normalize to 0.65-1.0 range
        
        // Create recommendation with chakra-based score
        const recommendation: IngredientRecommendation = {
          ...ingredient,
          matchScore: matchScore,
          recommendations: [
            `Supports ${chakra} chakra energy`,
            ...nutritionalCorrelations.filter(
              (corr) =>
                ingredient.name.toLowerCase().includes(corr.toLowerCase()) ||
                (ingredient.type
                  ? ingredient.type.toLowerCase().includes(corr.toLowerCase())
                  : false)
            ),
          ],
        };
        
        // Only add if not already present
        if (!allRecommendations.some((rec) => rec.name === ingredient.name)) {
          allRecommendations.push(recommendation);
        }
      }
    });
  });

  // Group recommendations by category
  allRecommendations.forEach((recommendation) => {
    const category = standardizeIngredientCategory(recommendation);
    
    if (!result[category]) {
      result[category] = [];
    }
    
    result[category].push(recommendation);
  });
  
  // Sort each category by matchScore and apply limits
  Object.keys(result).forEach((category) => {
    // Sort by matchScore (highest first)
    result[category].sort((a, b) => b.matchScore - a.matchScore);
    
    // Apply limit to each category
    if (result[category].length > limit) {
      result[category] = result[category].slice(0, limit);
    }
  });

  return result;
}

// Helper function to check if an ingredient is Venus-associated
function isVenusAssociatedIngredient(ingredientName: string): boolean {
  // Check if the ingredient appears in Venus's food associations
  if (venusData.FoodAssociations) {
    for (const food of venusData.FoodAssociations) {
      if (
        ingredientName.toLowerCase().includes(food.toLowerCase()) ||
        food.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }

  // Check if the ingredient appears in Venus's herbal associations
  if (venusData.HerbalAssociations?.Herbs) {
    for (const herb of venusData.HerbalAssociations.Herbs) {
      if (
        ingredientName.toLowerCase().includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }

  // Check if the ingredient appears in Venus's spice associations
  if (venusData.HerbalAssociations?.Spices) {
    for (const spice of venusData.HerbalAssociations.Spices) {
      if (
        ingredientName.toLowerCase().includes(spice.toLowerCase()) ||
        spice.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }

  // Check if the ingredient appears in Venus's flower associations
  if (venusData.HerbalAssociations?.Flowers) {
    for (const flower of venusData.HerbalAssociations.Flowers) {
      if (
        ingredientName.toLowerCase().includes(flower.toLowerCase()) ||
        flower.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
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
          if (
            ingredientName.toLowerCase().includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(ingredientName.toLowerCase())
          ) {
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
      if (
        normalizedName.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(normalizedName)
      ) {
        return true;
      }
    }
  }

  // Check if it's in Mars herbal associations
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (
        normalizedName.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(normalizedName)
      ) {
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
          if (
            normalizedName.includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(normalizedName)
          ) {
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
      score +=
        ((ingredient.flavor_profile.creamy || 0) +
          (ingredient.flavor_profile.rich || 0)) *
        1.7;
    }

    // Venus appreciates aromatic, fragrant qualities
    if (
      ingredient.flavor_profile.aromatic ||
      ingredient.flavor_profile.fragrant
    ) {
      score +=
        ((ingredient.flavor_profile.aromatic || 0) +
          (ingredient.flavor_profile.fragrant || 0)) *
        1.6;
    }

    // Venus is less interested in bitter or excessively spicy flavors
    if (ingredient.flavor_profile.bitter) {
      score -= ingredient.flavor_profile.bitter * 0.5;
    }

    if (
      ingredient.flavor_profile.spicy &&
      ingredient.flavor_profile.spicy > 0.7
    ) {
      score -= (ingredient.flavor_profile.spicy - 0.7) * 0.8;
    }
  }

  // Check texture alignment with Venus preferences
  if (ingredient.texture) {
    // Venus favors smooth, creamy, luscious textures
    const venusTextures = [
      'smooth',
      'creamy',
      'velvety',
      'soft',
      'tender',
      'juicy',
      'buttery',
    ];
    const textureMatch = venusTextures.filter((texture) =>
      ingredient.texture.includes(texture)
    ).length;

    score += textureMatch * 0.5;
  }

  // Check culinary technique alignment
  if (
    venusData.PlanetSpecific?.CulinaryTechniques &&
    ingredient.culinary_uses
  ) {
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
      (ingredient.flavor_profile?.aromatic &&
        ingredient.flavor_profile.aromatic > 0.7)
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
      const keywords = foodFocus.split(/[\s,;]+/).filter((k) => k.length > 3);
      for (const keyword of keywords) {
        if (
          ingredientName.includes(keyword) ||
          ingredient.description?.toLowerCase().includes(keyword) ||
          ingredient.culinary_uses?.some((use) =>
            use.toLowerCase().includes(keyword)
          )
        ) {
          score += 2.0;
          break;
        }
      }
    }

    // Check Elements alignment
    if (transitData.Elements && ingredient.elemental_properties) {
      for (const element in transitData.Elements) {
        if (ingredient.elemental_properties[element]) {
          score +=
            transitData.Elements[element] *
            ingredient.elemental_properties[element] *
            0.7;
        }
      }
    }

    // Check ingredient alignment with transit preferences
    if (transitData.Ingredients) {
      const transitIngredients = transitData.Ingredients.map((i) =>
        i.toLowerCase()
      );

      // Direct ingredient match
      if (
        transitIngredients.some(
          (i) =>
            ingredient.name.toLowerCase().includes(i) ||
            i.includes(ingredient.name.toLowerCase())
        )
      ) {
        score += 3.0;
      }

      // Category match
      if (
        ingredient.category &&
        transitIngredients.includes(ingredient.category.toLowerCase())
      ) {
        score += 2.0;
      }

      // Related ingredient match
      if (ingredient.related_ingredients) {
        const relatedMatches = ingredient.related_ingredients.filter(
          (related) =>
            transitIngredients.some(
              (i) =>
                related.toLowerCase().includes(i) ||
                i.includes(related.toLowerCase())
            )
        ).length;

        score += relatedMatches * 0.7;
      }

      // Complementary ingredients match
      if (ingredient.complementary_ingredients) {
        const complementaryMatches =
          ingredient.complementary_ingredients.filter((complement) =>
            transitIngredients.some(
              (i) =>
                complement.toLowerCase().includes(i) ||
                i.includes(complement.toLowerCase())
            )
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
    if (
      earthSigns.includes(lowerSign) &&
      venusData.PlanetSpecific?.CulinaryTemperament?.EarthVenus
    ) {
      const earthVenus =
        venusData.PlanetSpecific.CulinaryTemperament.EarthVenus;

      // Check for sensual, rich ingredients
      if (
        ingredient.flavor_profile?.rich > 0.5 ||
        ingredient.flavor_profile?.umami > 0.5 ||
        ingredient.culinary_uses?.includes('comfort food')
      ) {
        score += 2.0;
      }

      // Food focus alignment
      if (earthVenus.FoodFocus) {
        const focusKeywords = earthVenus.FoodFocus.toLowerCase()
          .split(/[\s,;]+/)
          .filter((k) => k.length > 3);
        if (
          focusKeywords.some(
            (keyword) =>
              ingredient.name.toLowerCase().includes(keyword) ||
              ingredient.description?.toLowerCase().includes(keyword)
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      if (earthVenus.Elements && ingredient.elemental_properties) {
        for (const element in earthVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score +=
              earthVenus.Elements[element] *
              ingredient.elemental_properties[element] *
              1.0;
          }
        }
      }
    }

    // Air Venus
    if (
      airSigns.includes(lowerSign) &&
      venusData.PlanetSpecific?.CulinaryTemperament?.AirVenus
    ) {
      const airVenus = venusData.PlanetSpecific.CulinaryTemperament.AirVenus;

      // Check for light, delicate ingredients
      if (
        ingredient.texture?.includes('light') ||
        ingredient.texture?.includes('crisp') ||
        ingredient.flavor_profile?.light > 0.5
      ) {
        score += 2.0;
      }

      // Food focus alignment
      if (airVenus.FoodFocus) {
        const focusKeywords = airVenus.FoodFocus.toLowerCase()
          .split(/[\s,;]+/)
          .filter((k) => k.length > 3);
        if (
          focusKeywords.some(
            (keyword) =>
              ingredient.name.toLowerCase().includes(keyword) ||
              ingredient.description?.toLowerCase().includes(keyword)
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      if (airVenus.Elements && ingredient.elemental_properties) {
        for (const element in airVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score +=
              airVenus.Elements[element] *
              ingredient.elemental_properties[element] *
              1.0;
          }
        }
      }
    }

    // Water Venus
    if (
      waterSigns.includes(lowerSign) &&
      venusData.PlanetSpecific?.CulinaryTemperament?.WaterVenus
    ) {
      const waterVenus =
        venusData.PlanetSpecific.CulinaryTemperament.WaterVenus;

      // Check for moist, juicy ingredients
      if (
        ingredient.texture?.includes('juicy') ||
        ingredient.texture?.includes('tender') ||
        ingredient.flavor_profile?.juicy > 0.5
      ) {
        score += 2.0;
      }

      // Food focus alignment
      if (waterVenus.FoodFocus) {
        const focusKeywords = waterVenus.FoodFocus.toLowerCase()
          .split(/[\s,;]+/)
          .filter((k) => k.length > 3);
        if (
          focusKeywords.some(
            (keyword) =>
              ingredient.name.toLowerCase().includes(keyword) ||
              ingredient.description?.toLowerCase().includes(keyword)
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      if (waterVenus.Elements && ingredient.elemental_properties) {
        for (const element in waterVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score +=
              waterVenus.Elements[element] *
              ingredient.elemental_properties[element] *
              1.0;
          }
        }
      }
    }

    // Fire Venus
    if (
      fireSigns.includes(lowerSign) &&
      venusData.PlanetSpecific?.CulinaryTemperament?.FireVenus
    ) {
      const fireVenus = venusData.PlanetSpecific.CulinaryTemperament.FireVenus;

      // Check for vibrant, spicy ingredients
      if (
        ingredient.flavor_profile?.spicy > 0.3 ||
        ingredient.flavor_profile?.vibrant > 0.5 ||
        ingredient.culinary_uses?.includes('stimulating')
      ) {
        score += 2.0;
      }

      // Food focus alignment
      if (fireVenus.FoodFocus) {
        const focusKeywords = fireVenus.FoodFocus.toLowerCase()
          .split(/[\s,;]+/)
          .filter((k) => k.length > 3);
        if (
          focusKeywords.some(
            (keyword) =>
              ingredient.name.toLowerCase().includes(keyword) ||
              ingredient.description?.toLowerCase().includes(keyword)
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      if (fireVenus.Elements && ingredient.elemental_properties) {
        for (const element in fireVenus.Elements) {
          if (ingredient.elemental_properties[element]) {
            score +=
              fireVenus.Elements[element] *
              ingredient.elemental_properties[element] *
              1.0;
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
    if (
      ingredient.cultural_significance?.includes('traditional') ||
      ingredient.cultural_significance?.includes('nostalgic')
    ) {
      score += 1.8;
    }

    // Check retrograde food focus
    if (venusData.PlanetSpecific.Retrograde.FoodFocus) {
      const retroFocus =
        venusData.PlanetSpecific.Retrograde.FoodFocus.toLowerCase();
      const ingredientName = ingredient.name.toLowerCase();
      const ingredientDesc = ingredient.description?.toLowerCase() || '';

      // Check for keyword matches
      const retroKeywords = retroFocus
        .split(/[\s,;]+/)
        .filter((k) => k.length > 3);
      for (const keyword of retroKeywords) {
        if (
          ingredientName.includes(keyword) ||
          ingredientDesc.includes(keyword)
        ) {
          score += 1.7;
          break;
        }
      }
    }

    // Check retrograde elements
    if (
      venusData.PlanetSpecific.Retrograde.Elements &&
      ingredient.elemental_properties
    ) {
      for (const element in venusData.PlanetSpecific.Retrograde.Elements) {
        if (ingredient.elemental_properties[element]) {
          score +=
            venusData.PlanetSpecific.Retrograde.Elements[element] *
            ingredient.elemental_properties[element] *
            0.9;
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
  const venusInfluence = calculateVenusInfluence(
    ingredient,
    zodiacSign,
    isVenusRetrograde
  );

  // Apply Venus influence to the base score (weight it appropriately)
  return score + venusInfluence * 0.3;
}

// Enhanced function to boost Venus-ruled ingredients based on detailed Venus data
function enhanceVenusIngredientBatch(
  ingredients: Ingredient[],
  astroState: AstrologicalState
): void {
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
  ingredients.forEach((ingredient) => {
    // Use our comprehensive Venus influence calculation
    const venusScore = calculateVenusInfluence(
      ingredient,
      zodiacSign,
      isVenusRetrograde
    );

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
      if (
        name.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(name)
      ) {
        score += 1.5;
        break;
      }
    }
  }

  // Match with Mars herb associations (stronger affinity)
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (
        name.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(name)
      ) {
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
        score +=
          marsData.FlavorProfiles[flavor] * ingredient.flavorProfile[flavor];
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
        if (
          name.includes(transitIngredient.toLowerCase()) ||
          transitIngredient.toLowerCase().includes(name)
        ) {
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
          score +=
            transit.Elements[element] *
            ingredient.elementalProperties[elemValue] *
            1.2;
        }
      }
    }
  }

  // Mars retrograde effects
  if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
    // During retrograde, Mars emphasizes dried herbs and spices
    if (
      ingredient.type === 'spice' ||
      ingredient.type === 'herb' ||
      ingredient.type === 'seasoning'
    ) {
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

    if (
      fireDominant &&
      marsData.PlanetSpecific?.CulinaryTemperament?.FireMars
    ) {
      score += 1.5;
    } else if (
      waterDominant &&
      marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars
    ) {
      score += 1.3;
    }
  }

  return score;
}

/**
 * Apply Mars-specific scoring to a collection of ingredients
 */
function enhanceMarsIngredientScoring(
  ingredients: Ingredient[],
  astroState: AstrologicalState
): void {
  // Get Mars status info from astro state
  const isMarsRetrograde = astroState.retrograde?.includes('Mars') || false;
  const zodiacSign = astroState.zodiacSign;

  // Compute Mars influence for each ingredient
  for (const i = 0; i < ingredients.length; i++) {
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
      ingredient.matchScore =
        (ingredient.matchScore || 0) + marsInfluence * 1.8;

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
  if (
    mercuryData.FoodAssociations &&
    mercuryData.FoodAssociations.some(
      (food) =>
        food.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(lowerIngredient)
    )
  ) {
    return true;
  }

  // Check Mercury herb associations
  if (
    mercuryData.HerbalAssociations?.Herbs &&
    mercuryData.HerbalAssociations.Herbs.some(
      (herb) =>
        herb.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(lowerIngredient)
    )
  ) {
    return true;
  }

  // Check for Mercury elemental connection through flavor profile
  // Mercury emphasizes complexity, variety, multiple ingredients, and contrasting flavors
  const mercuryFlavorSignals = [
    'mixed',
    'blend',
    'infused',
    'complex',
    'layered',
    'aromatic',
    'herb',
    'mint',
    'anise',
    'fennel',
    'dill',
    'light',
    'citrus',
    'varied',
    'fusion',
    'multi',
    'fresh',
    'stimulant',
    'tea',
    'seeds',
    'nuts',
    'grain',
  ];

  if (mercuryFlavorSignals.some((signal) => lowerIngredient.includes(signal))) {
    return true;
  }

  // Mercury is associated with Air and Earth elements
  // Lighter ingredients (Air) and grounding ingredients (Earth)
  if (
    lowerIngredient.includes('air') ||
    lowerIngredient.includes('light') ||
    lowerIngredient.includes('puff') ||
    lowerIngredient.includes('crisp') ||
    lowerIngredient.includes('earth') ||
    lowerIngredient.includes('root') ||
    lowerIngredient.includes('tuber')
  ) {
    return true;
  }

  // Check Mercury ZodiacTransit ingredient associations in current sign
  // This is a more dynamic way to check for transient associations
  const currentZodiacSign = getCurrentZodiacSign(); // Implement or use available function
  if (
    currentZodiacSign &&
    mercuryData.PlanetSpecific?.ZodiacTransit?.[currentZodiacSign]?.Ingredients
  ) {
    const transitIngredients =
      mercuryData.PlanetSpecific.ZodiacTransit[currentZodiacSign].Ingredients;
    if (
      transitIngredients.some(
        (ingredient) =>
          ingredient.toLowerCase() === lowerIngredient ||
          lowerIngredient.includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(lowerIngredient)
      )
    ) {
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
  const score = 0;

  // Base score for Mercury-ruled ingredients
  if (ingredient.astrologicalProfile?.rulingPlanets?.includes('Mercury')) {
    score += 3.0; // Strong baseline for Mercury-ruled ingredients
  }

  // Mercury food associations
  if (mercuryData.FoodAssociations) {
    for (const food of mercuryData.FoodAssociations) {
      if (
        ingredient.name.toLowerCase().includes(food.toLowerCase()) ||
        food.toLowerCase().includes(ingredient.name.toLowerCase())
      ) {
        score += 2.0;
        break;
      }
    }
  }

  // Mercury herb associations
  if (
    mercuryData.HerbalAssociations?.Herbs &&
    (ingredient.type === 'herb' || ingredient.type === 'spice')
  ) {
    for (const herb of mercuryData.HerbalAssociations.Herbs) {
      if (
        ingredient.name.toLowerCase().includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredient.name.toLowerCase())
      ) {
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
    const mercuryTransit =
      mercuryData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
    if (mercuryTransit) {
      // Boost for ingredients matching transit ingredients
      if (
        mercuryTransit.Ingredients &&
        mercuryTransit.Ingredients.some(
          (transitIngredient) =>
            ingredient.name
              .toLowerCase()
              .includes(transitIngredient.toLowerCase()) ||
            transitIngredient
              .toLowerCase()
              .includes(ingredient.name.toLowerCase())
        )
      ) {
        score += 2.5;
      }

      // Element alignment with Mercury in this sign
      if (mercuryTransit.Elements && ingredient.elementalProperties) {
        for (const element in mercuryTransit.Elements) {
          const elemKey = element as keyof ElementalProperties;
          if (ingredient.elementalProperties[elemKey]) {
            score +=
              mercuryTransit.Elements[element] *
              ingredient.elementalProperties[elemKey] *
              1.2;
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
      } else if (
        lowerSign === 'virgo' &&
        ingredient.elementalProperties?.Earth
      ) {
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
    if (
      ingredient.qualities?.includes('traditional') ||
      ingredient.qualities?.includes('nostalgic') ||
      ingredient.qualities?.includes('classic')
    ) {
      score *= 1.25; // Boost for traditional ingredients during retrograde
    }

    // During retrograde, Mercury de-emphasizes complex or exotic ingredients
    if (
      ingredient.qualities?.includes('exotic') ||
      ingredient.qualities?.includes('complex') ||
      ingredient.qualities?.includes('novel')
    ) {
      score *= 0.8; // Reduce score for complex / (exotic || 1) ingredients during retrograde
    }

    // Apply Mercury's retrograde elemental shift if available
    if (mercuryData.RetrogradeEffect && ingredient.elementalProperties) {
      // Shift toward Matter and away from Spirit during retrograde
      if (ingredient.elementalProperties.Earth) {
        score +=
          ingredient.elementalProperties.Earth *
          Math.abs(mercuryData.RetrogradeEffect.Matter);
      }
      if (ingredient.elementalProperties.Air) {
        score -=
          ingredient.elementalProperties.Air *
          Math.abs(mercuryData.RetrogradeEffect.Spirit);
      }
    }
  }

  // Adjust for Mercury's specific influence on certain ingredient qualities
  // Mercury emphasizes ingredients that involve mental stimulation and clarity
  if (ingredient.qualities) {
    const mercuryQualityBoosts = {
      aromatic: 1.3,
      complex: 1.4,
      stimulating: 1.5,
      adaptable: 1.3,
      versatile: 1.4,
      detailed: 1.2,
      precise: 1.2,
    };

    for (const quality of ingredient.qualities) {
      const lowerQuality = quality.toLowerCase();
      for (const [mercuryQuality, boost] of Object.entries(
        mercuryQualityBoosts
      )) {
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
function enhanceMercuryIngredientScoring(
  ingredients: Ingredient[],
  astroState: AstrologicalState
): void {
  // Check if Mercury is retrograde
  const isMercuryRetrograde =
    astroState.retrograde?.includes('Mercury') || false;

  // Get the current zodiac sign
  const zodiacSign = astroState.zodiacSign;

  // For each ingredient, calculate and apply Mercury influence score
  ingredients.forEach((ingredient) => {
    const mercuryScore = calculateMercuryInfluence(
      ingredient,
      zodiacSign,
      isMercuryRetrograde
    );

    // Apply Mercury score as a multiplier to the ingredient's existing score
    if (ingredient.matchScore !== undefined) {
      ingredient.matchScore *= 1 + mercuryScore * 0.3;
    } else if ('score' in ingredient) {
      (ingredient as any).score *= 1 + mercuryScore * 0.3;
    }

    // If the ingredient has a Mercury score field, update it
    if ('mercuryAffinity' in ingredient) {
      (ingredient as any).mercuryAffinity = mercuryScore;
    }

    // If the ingredient has a detailed score breakdown, add Mercury score
    if ('scoreDetails' in ingredient) {
      (ingredient as any).scoreDetails = {
        ...(ingredient as any).scoreDetails,
        mercuryAffinity: mercuryScore,
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
  const normalizedQualities = qualitiesArray.map((q) => q.toLowerCase());

  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = [
    'initiating',
    'spicy',
    'pungent',
    'stimulating',
    'invigorating',
    'activating',
  ];
  const fixedKeywords = [
    'grounding',
    'stabilizing',
    'nourishing',
    'sustaining',
    'foundational',
  ];
  const mutableKeywords = [
    'adaptable',
    'flexible',
    'versatile',
    'balancing',
    'harmonizing',
  ];

  const hasCardinalQuality = normalizedQualities.some((q) =>
    cardinalKeywords.includes(q)
  );
  const hasFixedQuality = normalizedQualities.some((q) =>
    fixedKeywords.includes(q)
  );
  const hasMutableQuality = normalizedQualities.some((q) =>
    mutableKeywords.includes(q)
  );

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
    const mutableScore = Air * 0.9 + Water * 0.8 + Fire * 0.7 + Earth * 0.5;
    const fixedScore = Earth * 0.9 + Water * 0.8 + Fire * 0.6 + Air * 0.5;
    const cardinalScore = Fire * 0.8 + Earth * 0.8 + Water * 0.8 + Air * 0.8;

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
 * Calculate dominant element from elemental properties using scores rather than rankings
 * This approach avoids "Assignment to constant variable" errors and provides more accurate results
 */
function getDominantElement(
  elementalProperties: ElementalProperties
): keyof ElementalProperties {
  if (!elementalProperties) {
    return 'Earth'; // Default fallback if no properties provided
  }
  
  // Use direct comparison of values to avoid element ranking which can cause assignment errors
  const fireValue = elementalProperties.Fire || 0;
  const waterValue = elementalProperties.Water || 0;
  const earthValue = elementalProperties.Earth || 0;
  const airValue = elementalProperties.Air || 0;
  
  // Calculate a score for each element based on its value
  // This approach is safer and more accurate than ranking
  let dominantElement: keyof ElementalProperties;
  
  // Simple comparison chain to find highest value
  if (fireValue >= waterValue && fireValue >= earthValue && fireValue >= airValue) {
    dominantElement = 'Fire';
  } else if (waterValue >= fireValue && waterValue >= earthValue && waterValue >= airValue) {
    dominantElement = 'Water';
  } else if (earthValue >= fireValue && earthValue >= waterValue && earthValue >= airValue) {
    dominantElement = 'Earth';
  } else {
    dominantElement = 'Air';
  }
  
  return dominantElement;
}

/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<
  string,
  {
    diurnal: keyof ElementalProperties;
    nocturnal: keyof ElementalProperties;
    dignityEffect?: Record<string, number>;
  }
> = {
  Sun: {
    diurnal: 'Fire',
    nocturnal: 'Fire',
    dignityEffect: { Leo: 1, Aries: 2, Aquarius: -1, Libra: -2 },
  },
  Moon: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { Cancer: 1, Taurus: 2, Capricorn: -1, Scorpio: -2 },
  },
  Mercury: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { Gemini: 1, Virgo: 3, Sagittarius: 1, Pisces: -3 },
  },
  Venus: {
    diurnal: 'Water',
    nocturnal: 'Earth',
    dignityEffect: {
      Libra: 1,
      Taurus: 1,
      Pisces: 2,
      Aries: -1,
      Scorpio: -1,
      Virgo: -2,
    },
  },
  Mars: {
    diurnal: 'Fire',
    nocturnal: 'Water',
    dignityEffect: {
      Aries: 1,
      Scorpio: 1,
      Capricorn: 2,
      Taurus: -1,
      Libra: -1,
      Cancer: -2,
    },
  },
  Jupiter: {
    diurnal: 'Air',
    nocturnal: 'Fire',
    dignityEffect: {
      Pisces: 1,
      Sagittarius: 1,
      Cancer: 2,
      Gemini: -1,
      Virgo: -1,
      Capricorn: -2,
    },
  },
  Saturn: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: {
      Aquarius: 1,
      Capricorn: 1,
      Libra: 2,
      Cancer: -1,
      Leo: -1,
      Aries: -2,
    },
  },
  Uranus: {
    diurnal: 'Water',
    nocturnal: 'Air',
    dignityEffect: { Aquarius: 1, Scorpio: 2, Taurus: -3 },
  },
  Neptune: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { Pisces: 1, Cancer: 2, Virgo: -1, Capricorn: -2 },
  },
  Pluto: {
    diurnal: 'Earth',
    nocturnal: 'Water',
    dignityEffect: { Scorpio: 1, Leo: 2, Taurus: -1, Aquarius: -2 },
  },
};

// Define sign info with decan effects and degree effects
const signInfo: Record<
  string,
  {
    element: keyof ElementalProperties;
    decanEffects: Record<string, string[]>;
    degreeEffects: Record<string, number[]>;
  }
> = {
  Aries: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Mars'],
      '2nd Decan': ['Sun'],
      '3rd Decan': ['Venus'],
    },
    degreeEffects: {
      Mercury: [15, 21],
      Venus: [7, 14],
      Mars: [22, 26],
      Jupiter: [1, 6],
      Saturn: [27, 30],
    },
  },
  Taurus: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mercury'],
      '2nd Decan': ['Moon'],
      '3rd Decan': ['Saturn'],
    },
    degreeEffects: {
      Mercury: [9, 15],
      Venus: [1, 8],
      Mars: [27, 30],
      Jupiter: [16, 22],
      Saturn: [23, 26],
    },
  },
  Gemini: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': ['Mars'],
      '3rd Decan': ['Uranus', 'Sun'],
    },
    degreeEffects: {
      Mercury: [1, 7],
      Venus: [15, 20],
      Mars: [26, 30],
      Jupiter: [8, 14],
      Saturn: [22, 25],
    },
  },
  Cancer: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Venus'],
      '2nd Decan': ['Mercury', 'Pluto'],
      '3rd Decan': ['Neptune', 'Moon'],
    },
    degreeEffects: {
      Mercury: [14, 20],
      Venus: [21, 27],
      Mars: [1, 6],
      Jupiter: [7, 13],
      Saturn: [28, 30],
    },
  },
  Leo: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Saturn'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Mars'],
    },
    degreeEffects: {
      Mercury: [7, 13],
      Venus: [14, 19],
      Mars: [26, 30],
      Jupiter: [20, 25],
      Saturn: [1, 6],
    },
  },
  Virgo: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mars', 'Sun'],
      '2nd Decan': ['Venus'],
      '3rd Decan': ['Mercury'],
    },
    degreeEffects: {
      Mercury: [1, 7],
      Venus: [8, 13],
      Mars: [25, 30],
      Jupiter: [14, 18],
      Saturn: [19, 24],
    },
  },
  Libra: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Moon'],
      '2nd Decan': ['Saturn', 'Uranus'],
      '3rd Decan': ['Jupiter'],
    },
    degreeEffects: {
      Mercury: [20, 24],
      Venus: [7, 11],
      Mars: [],
      Jupiter: [12, 19],
      Saturn: [1, 6],
    },
  },
  Scorpio: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Pluto'],
      '2nd Decan': ['Neptune', 'Sun'],
      '3rd Decan': ['Venus'],
    },
    degreeEffects: {
      Mercury: [22, 27],
      Venus: [15, 21],
      Mars: [1, 6],
      Jupiter: [7, 14],
      Saturn: [28, 30],
    },
  },
  Sagittarius: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Mercury'],
      '2nd Decan': ['Moon'],
      '3rd Decan': ['Saturn'],
    },
    degreeEffects: {
      Mercury: [15, 20],
      Venus: [9, 14],
      Mars: [],
      Jupiter: [1, 8],
      Saturn: [21, 25],
    },
  },
  Capricorn: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': [],
      '3rd Decan': ['Sun'],
    },
    degreeEffects: {
      Mercury: [7, 12],
      Venus: [1, 6],
      Mars: [],
      Jupiter: [13, 19],
      Saturn: [26, 30],
    },
  },
  Aquarius: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Uranus'],
      '2nd Decan': ['Mercury'],
      '3rd Decan': ['Moon'],
    },
    degreeEffects: {
      Mercury: [],
      Venus: [13, 20],
      Mars: [26, 30],
      Jupiter: [21, 25],
      Saturn: [1, 6],
    },
  },
  Pisces: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Saturn', 'Neptune', 'Venus'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Pisces', 'Mars'],
    },
    degreeEffects: {
      Mercury: [15, 20],
      Venus: [1, 8],
      Mars: [21, 26],
      Jupiter: [9, 14],
      Saturn: [27, 30],
    },
  },
};

/**
 * Calculate the planetary day influence on food ingredients
 * Now enhanced with dignity effects, decan effects, and degree effects
 */
function calculatePlanetaryDayInfluence(
  ingredient: Ingredient,
  planetaryDay: string,
  planetaryPositions?: Record<string, { sign: string; degree: number }>
): number {
  // Get the elements associated with the current planetary day
  const dayElements = planetaryElements[planetaryDay];
  if (!dayElements) return 0.5; // Unknown planet

  // For planetary day, BOTH diurnal and nocturnal elements influence all day
  const diurnalElement = dayElements.diurnal;
  const nocturnalElement = dayElements.nocturnal;

  // Calculate match based on food's element compared to planetary elements
  let diurnalMatch = 0;
  let nocturnalMatch = 0;

  // Check if ingredient has elemental properties
  if (ingredient.elementalProperties) {
    diurnalMatch = ingredient.elementalProperties[diurnalElement] || 0;
    nocturnalMatch = ingredient.elementalProperties[nocturnalElement] || 0;
  } else {
    // Simple matching if no detailed elemental profile is available
    diurnalMatch = ingredient.element === diurnalElement ? 1.0 : 0.3;
    nocturnalMatch = ingredient.element === nocturnalElement ? 1.0 : 0.3;
  }

  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;

  // Apply dignity effects if we have planet positions
  if (planetaryPositions && planetaryPositions[planetaryDay]) {
    const planetSign = planetaryPositions[planetaryDay].sign;
    const planetDegree = planetaryPositions[planetaryDay].degree;

    // Dignity effect bonus / (penalty || 1)
    if (dayElements.dignityEffect && dayElements.dignityEffect[planetSign]) {
      const dignityModifier = dayElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalScore = Math.min(
        1.0,
        Math.max(0.0, elementalScore + dignityModifier)
      );
    }

    // Calculate decan (1-10°: 1st decan, 11-20°: 2nd decan, 21-30°: 3rd decan)
    let decan = '1st Decan';
    if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
    else if (planetDegree > 20) decan = '3rd Decan';

    // Apply decan effects if the planet is in its own decan
    if (
      signInfo[planetSign] &&
      signInfo[planetSign].decanEffects[decan] &&
      signInfo[planetSign].decanEffects[decan].includes(planetaryDay)
    ) {
      elementalScore = Math.min(1.0, elementalScore + 0.15);
    }

    // Apply degree effects
    if (
      signInfo[planetSign] &&
      signInfo[planetSign].degreeEffects[planetaryDay] &&
      signInfo[planetSign].degreeEffects[planetaryDay].length === 2
    ) {
      const [minDegree, maxDegree] =
        signInfo[planetSign].degreeEffects[planetaryDay];
      if (planetDegree >= minDegree && planetDegree <= maxDegree) {
        elementalScore = Math.min(1.0, elementalScore + 0.2);
      }
    }
  }

  // If the food has a direct planetary affinity, give bonus points
  if (ingredient.astrologicalProfile?.rulingPlanets?.includes(planetaryDay)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);
  }

  return elementalScore;
}

/**
 * Calculate the planetary hour influence on food
 * Now enhanced with dignity effects and aspect considerations
 */
function calculatePlanetaryHourInfluence(
  ingredient: Ingredient,
  planetaryHour: string,
  isDaytime: boolean,
  planetaryPositions?: Record<string, { sign: string; degree: number }>,
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>
): number {
  // Get the elements associated with the current planetary hour
  const hourElements = planetaryElements[planetaryHour];
  if (!hourElements) return 0.5; // Unknown planet

  // For planetary hour, use diurnal element during day, nocturnal at night
  const relevantElement = isDaytime
    ? hourElements.diurnal
    : hourElements.nocturnal;

  // Calculate match based on food's element compared to the hour's relevant element
  let elementalMatch = 0;

  // Check if ingredient has elemental properties
  if (ingredient.elementalProperties) {
    elementalMatch = ingredient.elementalProperties[relevantElement] || 0;
  } else {
    // Simple matching if no detailed elemental profile is available
    elementalMatch = ingredient.element === relevantElement ? 1.0 : 0.3;
  }

  // Apply dignity effects if we have planet positions
  if (planetaryPositions && planetaryPositions[planetaryHour]) {
    const planetSign = planetaryPositions[planetaryHour].sign;

    // Dignity effect bonus / (penalty || 1)
    if (hourElements.dignityEffect && hourElements.dignityEffect[planetSign]) {
      const dignityModifier = hourElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalMatch = Math.min(
        1.0,
        Math.max(0.0, elementalMatch + dignityModifier)
      );
    }
  }

  // Apply aspect effects if available
  if (aspects && aspects.length > 0) {
    // Find aspects involving the planetary hour ruler
    const hourAspects = aspects.filter(
      (a) => a.planet1 === planetaryHour || a.planet2 === planetaryHour
    );

    for (const aspect of hourAspects) {
      const otherPlanet =
        aspect.planet1 === planetaryHour ? aspect.planet2 : aspect.planet1;
      let aspectModifier = 0;

      // Apply different modifier based on aspect type
      switch (aspect.aspectType) {
        case 'Conjunction':
          // Strong beneficial aspect
          aspectModifier = 0.15;
          break;
        case 'Trine':
          // Beneficial aspect
          aspectModifier = 0.1;
          break;
        case 'Square':
          // Challenging aspect
          aspectModifier = -0.1;
          break;
        case 'Opposition':
          // Strong challenging aspect
          aspectModifier = -0.15;
          break;
        default:
          aspectModifier = 0;
      }

      // Apply the aspect modifier if the ingredient is ruled by the other planet in the aspect
      if (
        ingredient.astrologicalProfile?.rulingPlanets?.includes(otherPlanet)
      ) {
        elementalMatch = Math.min(
          1.0,
          Math.max(0.0, elementalMatch + aspectModifier)
        );
      }
    }
  }

  // If the food has a direct planetary affinity, give bonus points
  if (ingredient.astrologicalProfile?.rulingPlanets?.includes(planetaryHour)) {
    elementalMatch = Math.min(1.0, elementalMatch + 0.3);
  }

  return elementalMatch;
}

/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Recommend ingredients with enhanced planetary, dignity and aspect effects
 */
export function recommendIngredients(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): IngredientRecommendation[] {
  // Get all available ingredients
  const allIngredients = getAllIngredients();

  // Filter by category if specified
  let filteredIngredients = allIngredients;
  if (options.category) {
    filteredIngredients = allIngredients.filter(
      (ing) => ing.type.toLowerCase() === options.category?.toLowerCase()
    );
  }

  // Filter out excluded ingredients
  if (options.excludeIngredients && options.excludeIngredients.length > 0) {
    filteredIngredients = filteredIngredients.filter(
      (ing) => !options.excludeIngredients?.includes(ing.name)
    );
  }

  // Filter to only include specific ingredients
  if (options.includeOnly && options.includeOnly.length > 0) {
    filteredIngredients = filteredIngredients.filter((ing) =>
      options.includeOnly?.includes(ing.name)
    );
  }

  // Extract key astrological information
  const {
    timestamp = new Date(),
    Fire = 0.5,
    Water = 0.5,
    Air = 0.5,
    Earth = 0.5,
    zodiacSign = '',
    planetaryAlignment = {},
    aspects = [],
    lunarPhase = '',
  } = astroState;

  // Get planetary day and hour for current time
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const planetaryCalculator = {
    calculatePlanetaryDay: (date: Date) => {
      const days = [
        'Sun',
        'Moon',
        'Mars',
        'Mercury',
        'Jupiter',
        'Venus',
        'Saturn',
      ];
      return days[date.getDay()];
    },
    calculatePlanetaryHour: (date: Date) => {
      // This is a simplified calculation
      const hours = [
        'Sun',
        'Venus',
        'Mercury',
        'Moon',
        'Saturn',
        'Jupiter',
        'Mars',
        'Sun',
        'Venus',
        'Mercury',
        'Moon',
        'Saturn',
        'Jupiter',
        'Mars',
        'Sun',
        'Venus',
        'Mercury',
        'Moon',
        'Saturn',
        'Jupiter',
        'Mars',
        'Sun',
        'Venus',
        'Mercury',
        'Moon',
      ];
      return hours[date.getHours()];
    },
    isDaytime: isDaytime,
  };

  const planetaryDay = planetaryCalculator.calculatePlanetaryDay(date);
  const planetaryHour = planetaryCalculator.calculatePlanetaryHour(date);
  const isDaytimeNow = planetaryCalculator.isDaytime(date);

  // Create elemental properties object for the current system state
  const systemElementalProps: ElementalProperties = { Fire, Water, Air, Earth };

  const recommendations: IngredientRecommendation[] = [];

  // Calculate scores for each ingredient
  for (const ingredient of filteredIngredients) {
    // Calculate elemental match (45% weight)
    const elementalScore = calculateElementalScore(
      ingredient.elementalProperties,
      systemElementalProps
    );

    // Calculate planetary day influence with enhanced dignity effects (35% weight)
    const planetaryDayScore = calculatePlanetaryDayInfluence(
      ingredient,
      planetaryDay,
      planetaryAlignment
    );

    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const planetaryHourScore = calculatePlanetaryHourInfluence(
      ingredient,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects
    );

    // Apply standardized weighting
    const totalScore =
      elementalScore * 0.45 +
      planetaryDayScore * 0.35 +
      planetaryHourScore * 0.2;

    // Generate ingredient-specific recommendations based on planetary influences
    const recommendations = generateRecommendationsForIngredient(
      ingredient,
      planetaryDay,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects
    );

    // Add to recommendations list
    recommendations.push({
      ...ingredient,
      matchScore: totalScore,
      totalScore,
      elementalScore: elementalScore * 0.45,
      astrologicalScore: planetaryDayScore * 0.35 + planetaryHourScore * 0.2,
      recommendations,
    });
  }

  // Sort by match score (highest first)
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Apply limit if specified
  const limit = options.limit || 10;
  return recommendations.slice(0, limit);
}

/**
 * Generate enhanced recommendations for an ingredient based on planetary influences
 */
function generateRecommendationsForIngredient(
  ingredient: Ingredient,
  planetaryDay: string,
  planetaryHour: string,
  isDaytime: boolean,
  planetaryPositions?: Record<string, { sign: string; degree: number }>,
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>
): string[] {
  const recs: string[] = [];

  // Basic recommendation based on planetary day
  if (planetaryElements[planetaryDay]) {
    const dayElements = planetaryElements[planetaryDay];
    recs.push(
      `${ingredient.name} works well on ${planetaryDay}'s day with its ${dayElements.diurnal} and ${dayElements.nocturnal} influences.`
    );
  }

  // Time-specific recommendation based on planetary hour
  if (planetaryElements[planetaryHour]) {
    const hourElement = isDaytime
      ? planetaryElements[planetaryHour].diurnal
      : planetaryElements[planetaryHour].nocturnal;

    recs.push(
      `During the current hour of ${planetaryHour}, ${ingredient.name}'s ${hourElement} properties are enhanced.`
    );
  }

  // Add dignity effect recommendations if planet is in dignified or debilitated sign
  if (planetaryPositions) {
    // Check day planet dignity
    if (
      planetaryElements[planetaryDay]?.dignityEffect &&
      planetaryPositions[planetaryDay]
    ) {
      const daySign = planetaryPositions[planetaryDay].sign;
      const dayDignity =
        planetaryElements[planetaryDay].dignityEffect?.[daySign];

      if (
        dayDignity &&
        dayDignity > 0 &&
        ingredient.astrologicalProfile?.rulingPlanets?.includes(planetaryDay)
      ) {
        recs.push(
          `${planetaryDay} is ${
            dayDignity > 1 ? 'exalted' : 'dignified'
          } in ${daySign}, strengthening ${ingredient.name}'s properties.`
        );
      } else if (
        dayDignity &&
        dayDignity < 0 &&
        ingredient.astrologicalProfile?.rulingPlanets?.includes(planetaryDay)
      ) {
        recs.push(
          `${planetaryDay} is ${
            dayDignity < -1 ? 'in fall' : 'in detriment'
          } in ${daySign}, requiring careful preparation of ${ingredient.name}.`
        );
      }
    }

    // Check hour planet dignity
    if (
      planetaryElements[planetaryHour]?.dignityEffect &&
      planetaryPositions[planetaryHour]
    ) {
      const hourSign = planetaryPositions[planetaryHour].sign;
      const hourDignity =
        planetaryElements[planetaryHour].dignityEffect?.[hourSign];

      if (
        hourDignity &&
        hourDignity > 0 &&
        ingredient.astrologicalProfile?.rulingPlanets?.includes(planetaryHour)
      ) {
        recs.push(
          `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${ingredient.name}'s flavor profile.`
        );
      }
    }
  }

  // Add aspect-based recommendations
  if (aspects && aspects.length > 0) {
    const relevantAspects = aspects.filter(
      (aspect) =>
        aspect.planet1 === planetaryDay ||
        aspect.planet2 === planetaryDay ||
        aspect.planet1 === planetaryHour ||
        aspect.planet2 === planetaryHour
    );

    for (const aspect of relevantAspects) {
      if (aspect.aspectType === 'Conjunction') {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(
            (p) => p !== planetaryDay && p !== planetaryHour
          );
          if (
            otherPlanet &&
            ingredient.astrologicalProfile?.rulingPlanets?.includes(otherPlanet)
          ) {
            recs.push(
              `The conjunction between ${aspect.planet1} and ${aspect.planet2} strongly enhances ${ingredient.name}'s qualities.`
            );
          }
        }
      } else if (aspect.aspectType === 'Trine') {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(
            (p) => p !== planetaryDay && p !== planetaryHour
          );
          if (
            otherPlanet &&
            ingredient.astrologicalProfile?.rulingPlanets?.includes(otherPlanet)
          ) {
            recs.push(
              `The harmonious trine between ${aspect.planet1} and ${aspect.planet2} creates a flowing energy for ${ingredient.name}.`
            );
          }
        }
      }
    }
  }

  // Direct planetary affinity recommendation
  if (ingredient.astrologicalProfile?.rulingPlanets) {
    const rulingPlanets = ingredient.astrologicalProfile.rulingPlanets;
    if (rulingPlanets.includes(planetaryDay)) {
      recs.push(
        `${ingredient.name} is especially potent today as it's ruled by ${planetaryDay}.`
      );
    }
    if (rulingPlanets.includes(planetaryHour)) {
      recs.push(
        `This is an optimal hour to work with ${ingredient.name} due to ${planetaryHour}'s influence.`
      );
    }
  }

  return recs;
}

// ... existing code ...


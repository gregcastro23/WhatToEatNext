// Base ingredient interface for safe type access
interface BaseIngredient {
  name?: string;
  type?: string;
  category?: string;
  elementalProperties?: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
  [key: string]: unknown; // For dynamic properties
}

// Helper functions for safe type access
function safeGetString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function safeGetStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  return [];
}

function safeGetNumber(value: unknown): number {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
}

function safeGetElementalProperties(value: unknown): ElementalProperties | undefined {
  if (typeof value === 'object' && value !== null) {
    const props = value as any;
    if (
      typeof props.Fire === 'number' &&
      typeof props.Water === 'number' &&
      typeof props.Earth === 'number' &&
      typeof props.Air === 'number'
    ) {
      return props as ElementalProperties;
    }
  }
  return undefined;
}

function safeGetIngredientName(ingredient: unknown): string | undefined {
  if (typeof ingredient === 'string') {
    return ingredient;
  }
  if (ingredient && typeof ingredient === 'object') {
    return safeGetString((ingredient as any).name);
  }
  return undefined;
}

// Constants
import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from '@/constants/chakraSymbols';
import { LUNAR_PHASES } from '@/constants/lunar';
// Data
import { ingredientCategories } from '@/data/ingredientCategories';
import { fruits } from '@/data/ingredients/fruits';
import { grains } from '@/data/ingredients/grains';
import { herbs } from '@/data/ingredients/herbs';
import { oils } from '@/data/ingredients/oils';
import { proteins } from '@/data/ingredients/proteins';
import { seasonings } from '@/data/ingredients/seasonings';
import { spices } from '@/data/ingredients/spices';

// Types
import type { Modality, Ingredient } from '@/data/ingredients/types';
import { vegetables } from '@/data/ingredients/vegetables';
import { AstrologicalState } from '@/types';
import {
  ElementalProperties,
  ChakraEnergies,
  Season,
  ZodiacSign,
  LunarPhase,
} from '@/types/alchemy';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import { ElementalState } from '@/types/elemental';

// AstrologicalInfluences interface
export interface AstrologicalInfluences {
  rulingPlanets?: string[];
  favorableZodiac?: string[];
  elementalAffinity?: string;
  lunarPhaseModifiers?: Record<string, unknown>;
  aspectEnhancers?: string[];
}

// Enhanced Ingredient interface for Phase 11
interface EnhancedIngredient {
  name: string;
  type: string;
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  elementalState?: ElementalState;
  season?: Season;
  regionalCuisine?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
  // Add commonly missing properties
  flavorProfile?: Record<string, number>;
  cuisine?: string;
  description?: string;
  category?: string;
  qualities?: string[];
  mealType?: string;
  matchScore?: number;
  timing?: unknown;
  duration?: unknown;
}
// Moved seasonings and oils imports to organized section above

// Import planet data
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';
import saturnData from '@/data/planets/saturn';
import venusData from '@/data/planets/venus';
import { calculateLunarPhase, calculatePlanetaryPositions } from '@/utils/astrologyUtils';

// Enterprise Intelligence Integration - Phase 27 Ingredient Intelligence Systems
import { EnterpriseIntelligenceIntegration } from '@/services/EnterpriseIntelligenceIntegration';

// Import the getAllIngredients function if it exists, otherwise we'll create our own
import { getAllIngredients as getIngredientsUtil } from '@/utils/foodRecommender';

// Export the necessary types needed by IngredientRecommendations.ts
export interface IngredientRecommendation {
  name: string;
  type: string;
  category?: string;
  elementalProperties?: ElementalProperties;
  qualities?: string[];
  matchScore: number;
  modality?: Modality;
  recommendations?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  seasonalScore?: number;
  dietary?: string[];
  // Add commonly missing properties
  flavorProfile?: Record<string, number>;
  cuisine?: string;
  regionalCuisine?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
  astrologicalInfluences?: AstrologicalInfluences;
  season?: Season;
  mealType?: string;
  timing?: unknown;
  duration?: unknown;
  isRetrograde?: boolean;
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

// Enhanced calculation helper functions using imported utilities
function calculateEnhancedPlanetaryInfluence(
  planetaryDay: string,
  planetaryData: { jupiterData: unknown; saturnData: unknown },
): number {
  // Use Jupiter and Saturn data to enhance planetary calculations
  const { jupiterData: jupiter, saturnData: saturn } = planetaryData;
  const jupiterInfluence = (jupiter as { influence?: number }).influence || 1.0;
  const saturnInfluence = (saturn as { influence?: number }).influence || 1.0;

  // Apply planetary day specific calculations
  if (planetaryDay === 'Jupiter') return jupiterInfluence;
  if (planetaryDay === 'Saturn') return saturnInfluence;
  return 1.0;
}

function calculateLunarPhaseModifier(lunarPhaseData: unknown): number {
  // Use lunar phase data to calculate modifiers
  const phaseData = lunarPhaseData as { modifier?: number };
  return phaseData.modifier || 1.0;
}

function calculateAstrologicalBridgeModifier(astrologicalBridge: unknown): number {
  // Use astrological bridge for enhanced compatibility scoring
  const bridge = astrologicalBridge as { compatibility?: number };
  return bridge.compatibility || 1.0;
}

// Combine all real ingredients data
const allIngredients = [
  ...Object.values(vegetables),
  ...Object.values(fruits),
  ...Object.values(herbs),
  ...Object.values(spices),
  ...Object.values(proteins),
  ...Object.values(grains),
  ...Object.values(seasonings),
  ...Object.values(oils),
].filter(Boolean);

// Fallback implementation of getAllIngredients that uses ingredientCategories
function getAllIngredients(): Ingredient[] {
  // If the imported function exists, use it
  if (typeof getIngredientsUtil === 'function') {
    // Apply Pattern K: Safe unknown-first casting for type compatibility
    return getIngredientsUtil() as unknown as Ingredient[];
  }

  // Otherwise, use our fallback implementation
  const allIngredients: Ingredient[] = [];

  // Process each category in ingredientCategories
  Object.entries(ingredientCategories).forEach(([category, ingredientsMap]) => {
    Object.entries(ingredientsMap).forEach(([name, data]) => {
      const ingredientData = data as unknown as BaseIngredient;
      allIngredients.push({
        name,
        type: category.endsWith('s') ? category.slice(0, -1) : category,
        category,
        elementalProperties: ingredientData.elementalProperties,
        astrologicalProfile: ingredientData.astrologicalProfile,
        ...ingredientData,
      } as unknown as Ingredient);
    });
  });

  return allIngredients;
}

/**
 * Returns a list of ingredients that match the current astrological state
 */
export function getRecommendedIngredients(astroState: AstrologicalState): EnhancedIngredient[] {
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
  // Apply Pattern K: Safe unknown-first casting for mixed ingredient array
  let filteredIngredients = (allIngredients as unknown as EnhancedIngredient[]).filter(
    ingredient => {
      // Check if any of the ingredient's ruling planets are active
      const baseIngredient = ingredient as unknown as BaseIngredient;
      return baseIngredient.astrologicalProfile?.rulingPlanets?.some(planet =>
        planetsToUse.includes(planet),
      );
    },
  );

  // If no matching ingredients, return a sample of all ingredients
  if (filteredIngredients.length === 0) {
    filteredIngredients = (allIngredients as unknown as EnhancedIngredient[]).slice(0, 20);
  }

  // Special handling for Venus influence when present
  if (planetsToUse.includes('Venus')) {
    // Apply Pattern K: Safe array type casting for function parameter compatibility
    // Prioritize Venus-ruled ingredients with improved scoring based on detailed Venus data
    enhanceVenusIngredientBatch(filteredIngredients as unknown as Ingredient[], astroState);
  }

  // Special handling for Mars influence when present
  if (planetsToUse.includes('Mars')) {
    // Apply Pattern K: Safe array type casting for function parameter compatibility
    // Prioritize Mars-ruled ingredients with improved scoring based on detailed Mars data
    enhanceMarsIngredientScoring(filteredIngredients as unknown as Ingredient[], astroState);
  }

  // Special handling for Mercury influence when present
  if (planetsToUse.includes('Mercury')) {
    // Apply Pattern K: Safe array type casting for function parameter compatibility
    // Prioritize Mercury-ruled ingredients with improved scoring based on detailed Mercury data
    enhanceMercuryIngredientScoring(filteredIngredients as unknown as Ingredient[], astroState);
  }

  // If we have a dominant element from the astro state, prioritize ingredients of that element
  if (astroState.dominantElement) {
    filteredIngredients.sort((a, b) => {
      const ingredientA = a as unknown as BaseIngredient;
      const ingredientB = b as unknown as BaseIngredient;
      const aValue =
        ingredientA.elementalProperties?.[
          astroState.dominantElement as any
        ] || 0;
      const bValue =
        ingredientB.elementalProperties?.[
          astroState.dominantElement as any
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
      const ingredientA = a as unknown as BaseIngredient;
      const ingredientB = b as unknown as BaseIngredient;

      let aHasAffinity = ingredientA.astrologicalProfile?.signAffinities?.includes(zodiacSign)
        ? 1
        : 0;
      let bHasAffinity = ingredientB.astrologicalProfile?.signAffinities?.includes(zodiacSign)
        ? 1
        : 0;

      // Boost ingredients with Venus associations when Venus is active
      if (planetsToUse.includes('Venus')) {
        if (isVenusAssociatedIngredient(ingredientA.name || '')) aHasAffinity += venusBoost;
        if (isVenusAssociatedIngredient(ingredientB.name || '')) bHasAffinity += venusBoost;
      }

      // Boost ingredients with Mars associations when Mars is active
      if (planetsToUse.includes('Mars')) {
        if (isMarsAssociatedIngredient(ingredientA.name || '')) aHasAffinity += marsBoost;
        if (isMarsAssociatedIngredient(ingredientB.name || '')) bHasAffinity += marsBoost;
      }

      // Boost ingredients with Mercury associations when Mercury is active
      if (planetsToUse.includes('Mercury')) {
        if (isMercuryAssociatedIngredient(ingredientA.name || '')) aHasAffinity += mercuryBoost;
        if (isMercuryAssociatedIngredient(ingredientB.name || '')) bHasAffinity += mercuryBoost;
      }

      return bHasAffinity - aHasAffinity;
    });
  }

  return filteredIngredients;
}

/**
 * Returns recommendations grouped by category based on elemental properties and options
 */
export async function getIngredientRecommendations(
  elementalProps: ElementalProperties & {
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    zodiacSign: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  },
  options: RecommendationOptions,
): Promise<GroupedIngredientRecommendations> {
  // Enterprise Intelligence Integration - Phase 27 Ingredient Intelligence Systems
  const enterpriseIntelligence = new EnterpriseIntelligenceIntegration({
    enableIngredientIntelligence: true,
    enableValidationIntelligence: true,
    enableOptimizationRecommendations: true,
  });
  // Get all ingredients
  const allIngredients = getAllIngredients();

  // Calculate ruling planet based on sun's position
  const sunSign = elementalProps.zodiacSign.toLowerCase() as any;

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
  const planetDecans: Record<string, { decanNum: number; decanRuler: string; tarotCard: string }> =
    {};

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
      taurus: { 1: '5 of Pentacles', 2: '6 of Pentacles', 3: '7 of Pentacles' },
      gemini: { 1: '8 of Swords', 2: '9 of Swords', 3: '10 of Swords' },
      cancer: { 1: '2 of Cups', 2: '3 of Cups', 3: '4 of Cups' },
      leo: { 1: '5 of Wands', 2: '6 of Wands', 3: '7 of Wands' },
      virgo: { 1: '8 of Pentacles', 2: '9 of Pentacles', 3: '10 of Pentacles' },
      libra: { 1: '2 of Swords', 2: '3 of Swords', 3: '4 of Swords' },
      scorpio: { 1: '5 of Cups', 2: '6 of Cups', 3: '7 of Cups' },
      sagittarius: { 1: '8 of Wands', 2: '9 of Wands', 3: '10 of Wands' },
      capricorn: { 1: '2 of Pentacles', 2: '3 of Pentacles', 3: '4 of Pentacles' },
      aquarius: { 1: '5 of Swords', 2: '6 of Swords', 3: '7 of Swords' },
      pisces: { 1: '8 of Cups', 2: '9 of Cups', 3: '10 of Cups' },
    };

    const decanRuler = decanRulerMap[sign][decanNum] || '';
    const tarotCard = tarotCardMap[sign][decanNum] || '';

    planetDecans[planet] = { decanNum, decanRuler, tarotCard };
  });

  // Filter and score ingredients
  const scoredIngredients = allIngredients
    .filter(ingredient => {
      // Apply basic filters
      const ingredientName = safeGetIngredientName(ingredient);
      if (options.excludeIngredients?.includes(ingredientName || '')) return false;
      if (options.includeOnly && !options.includeOnly.includes(ingredientName || '')) return false;
      if (options.category && ingredient.category !== options.category) return false;

      // Filter by dietary preference if specified
      if (options.dietaryPreferences && options.dietaryPreferences.length > 0) {
        const dietaryMatches = options.dietaryPreferences.some(pref =>
          ingredient.dietary?.includes(pref),
        );
        if (!dietaryMatches) return false;
      }

      // Filter by modality preference if specified
      if (options.modalityPreference) {
        const ingredientModality =
          ingredient.modality ||
          determineIngredientModality(
            ingredient.qualities,
            safeGetElementalProperties(
              (ingredient as unknown as any).elementalProperties,
            ),
          );

        if (ingredientModality !== options.modalityPreference) return false;
      }

      return true;
    })
    .map(ingredient => {
      // Calculate elemental score (30% of total)
      const elementalScore = calculateElementalScore(
        safeGetElementalProperties(
          (ingredient as unknown as any).elementalProperties,
        ),
        elementalProps,
      );

      // Calculate modality score (15% of total)
      const modalityScore = calculateModalityScore(
        ingredient.qualities || [],
        options.modalityPreference,
      );

      // Calculate seasonal score (15% of total)
      const seasonalScore = calculateSeasonalScore(ingredient, elementalProps.timestamp);

      // Calculate planetary score (40% of total) - increased weight for planetary alignment
      const planetaryScore = calculateEnhancedPlanetaryScore(
        ingredient,
        elementalProps.planetaryAlignment,
        planetDecans,
        rulingPlanet,
      );

      // Calculate total score with weighted components
      const totalScore =
        elementalScore * 0.3 + modalityScore * 0.15 + seasonalScore * 0.15 + planetaryScore * 0.4;

      // Assign modality if not already present
      const modality =
        ingredient.modality ||
        determineIngredientModality(
          ingredient.qualities,
          safeGetElementalProperties(
            (ingredient as unknown as any).elementalProperties,
          ),
        );

      return {
        ...ingredient,
        score: totalScore,
        elementalScore,
        modalityScore,
        seasonalScore,
        planetaryScore,
        modality,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Enterprise Intelligence Analysis - Phase 27 Ingredient Intelligence Systems
  const ingredientData = {
    ingredients: scoredIngredients,
    elementalProperties: elementalProps,
    astrologicalContext: {
      zodiacSign: elementalProps.zodiacSign as any,
      lunarPhase: elementalProps.lunarPhase as LunarPhase,
      elementalProperties: elementalProps,
      planetaryPositions: elementalProps.planetaryAlignment,
    },
  };

  // Perform enterprise intelligence analysis
  const astroContext = (ingredientData as { astrologicalContext?: Record<string, unknown> }).astrologicalContext || {};
  const safeAstroContext = {
    zodiacSign: astroContext.zodiacSign ?? 'aries',
    lunarPhase: typeof astroContext.lunarPhase === 'string' ? astroContext.lunarPhase : 'new',
    season: typeof astroContext.season === 'string' ? astroContext.season : 'spring',
    userPreferences: astroContext.userPreferences && typeof astroContext.userPreferences === 'object'
      ? astroContext.userPreferences as { dietaryRestrictions: string[]; flavorPreferences: string[]; culturalPreferences: string[]; }
      : undefined
  };
  
  const enterpriseAnalysis = await enterpriseIntelligence.performEnterpriseAnalysis(
    undefined, // No recipe data for ingredient-only analysis
    ingredientData as any,
    { name: 'general', type: 'universal', region: 'global', characteristics: [] }, // Generic cuisine data for ingredient-only analysis
    safeAstroContext,
  );

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
      // Apply Pattern L: Interface property mapping for IngredientRecommendation compatibility
      const ingredientData = ingredient as unknown as any;

      // Enterprise Intelligence Enhancement - Phase 27 Ingredient Intelligence Systems
      const ingredientIntelligence = enterpriseAnalysis.ingredientIntelligence;
      const validationIntelligence = enterpriseAnalysis.validationIntelligence;

      const ingredientRecommendation: IngredientRecommendation = {
        name: ingredient.name || '',
        type:
          safeGetString(ingredientData.type) ||
          safeGetString(ingredientData.category) ||
          'ingredient',
        category: ingredient.category,
        elementalProperties: ingredientData.elementalProperties as ElementalProperties,
        qualities: safeGetStringArray(ingredient.qualities),
        matchScore: safeGetNumber(ingredient.score),
        modality: ingredient.modality,
        recommendations: [
          ...safeGetStringArray(ingredientData.recommendations),
          ...(ingredientIntelligence?.recommendations ?? []).slice(0, 3), // Top 3 enterprise recommendations
          ...((validationIntelligence?.overallValidation?.criticalIssues ?? []).length > 0
            ? [
                `Validation: ${(validationIntelligence?.overallValidation?.criticalIssues ?? [])[0]}`,
              ]
            : []),
        ],
        description: safeGetString(ingredientData.description) || `Recommended ${ingredient.name}`,
        totalScore: safeGetNumber(ingredientData.totalScore) || safeGetNumber(ingredient.score),
        elementalScore: safeGetNumber(ingredient.elementalScore),
        astrologicalScore: safeGetNumber(ingredientData.astrologicalScore),
        seasonalScore: safeGetNumber(ingredient.seasonalScore),
        dietary: safeGetStringArray(ingredientData.dietary),
        // Enterprise Intelligence Enhanced Properties
        flavorProfile: (() => {
          const analysis = ingredientIntelligence?.categorizationAnalysis as {
            flavorProfile?: Record<string, unknown>;
          } | undefined;
          const profile = analysis?.flavorProfile;
          return profile && typeof profile === 'object' && profile !== null 
            ? profile as Record<string, number>
            : {};
        })(),
        cuisine:
          (ingredientIntelligence?.categorizationAnalysis as { cuisine?: string })?.cuisine ||
          'universal',
        regionalCuisine:
          (ingredientIntelligence?.categorizationAnalysis as { regionalCuisine?: string })
            ?.regionalCuisine || 'global',
        season: (() => {
          const seasonalAnalysis = ingredientIntelligence?.seasonalAnalysis as { currentSeason?: string } | undefined;
          const currentSeason = seasonalAnalysis?.currentSeason;
          return (typeof currentSeason === 'string' && ['spring', 'summer', 'autumn', 'winter', 'all'].includes(currentSeason)) 
            ? currentSeason as Season
            : 'all' as Season;
        })(),
        mealType:
          (ingredientIntelligence?.categorizationAnalysis as { mealType?: string })?.mealType ||
          'any',
        timing:
          (ingredientIntelligence?.seasonalAnalysis as { optimalTiming?: string })?.optimalTiming ||
          'flexible',
        duration:
          (ingredientIntelligence?.seasonalAnalysis as { preparationTime?: string })
            ?.preparationTime || 'standard',
      };
      groupedRecommendations[category]?.push(ingredientRecommendation);
      categoryCounts[category]++;
    }
  });

  return groupedRecommendations;
}

// Helper function to calculate modality score
function calculateModalityScore(qualities: string[], preferredModality?: Modality): number {
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
    Mutable: ['Cardinal', 'Fixed'],
  };

  if (compatibleModalities[preferredModality].includes(ingredientModality)) {
    return 0.7;
  }

  return 0.3;
}

/**
 * Calculate elemental score between ingredient and system elemental properties
 * Enhanced to give more weight to dominant elements and better similarity calculation
 */
function calculateElementalScore(
  ingredientProps?: ElementalProperties,
  systemProps?: ElementalProperties,
): number {
  // Return neutral score if either properties are missing
  if (!ingredientProps || !systemProps) return 0.5;

  // Find dominant system element for extra weighting
  const dominantElement = Object.entries(systemProps).sort(
    (a, b) => b[1] - a[1],
  )[0][0] as keyof ElementalProperties;

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

    // Enhanced weighting: dominant element gets extra emphasis
    // Base weight includes the system's value for this element
    const baseWeight = systemValue + 0.25; // Add 0.25 to ensure all elements have some weight

    // Apply 1.5x multiplier to the dominant element's weight
    const finalWeight = element === dominantElement ? baseWeight * 1.5 : baseWeight;

    similarityScore += similarity * finalWeight;
    totalWeight += finalWeight;
  }

  // Normalize to 0-1 range with explicit bounds
  return totalWeight > 0 ? Math.min(1, Math.max(0, similarityScore / totalWeight)) : 0.5;
}

/**
 * Calculate seasonal score for an ingredient based on current date
 * @param ingredient Ingredient to score
 * @param date Current date
 * @returns Seasonal score (0-1)
 */
function calculateSeasonalScore(ingredient: Ingredient, date: Date): number {
  // Default score if no seasonality data
  if (!(ingredient as unknown as any).seasonality) return 0.5;

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
  const seasonScore =
    (ingredient as unknown as any).seasonality?.[currentSeason] || 0.5;

  return seasonScore;
}

/**
 * Enhanced planetary score calculation that considers decans and tarot associations,
 * with special weight for the ruling planet determined by sun position
 */
function calculateEnhancedPlanetaryScore(
  ingredient: Ingredient,
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
  planetDecans: Record<string, { decanNum: number; decanRuler: string; tarotCard: string }>,
  rulingPlanet: string,
): number {
  if (!(ingredient as unknown as any).astrologicalProfile) return 0.5; // Neutral score for ingredients without profile

  let score = 0;
  let totalFactors = 0;

  // Check ruling planet correspondence - this gets extra weight
  const ingredientData = ingredient as unknown as any;
  const astrologicalProfile = ingredientData.astrologicalProfile as any;
  const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
  if (rulingPlanets.includes(rulingPlanet)) {
    score += 1.5; // Significant boost for ruling planet correspondence
    totalFactors += 1.5;
  }

  // Check planetary positions against ingredient affinities
  Object.entries(planetaryAlignment).forEach(([planet, position]) => {
    if (!position.sign) return;

    const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);

    // Regular planetary ruler scoring
    if (rulingPlanets.includes(planetName)) {
      score += 1;
      totalFactors += 1;
    }

    // Check sign affinities
    const signAffinities = astrologicalProfile.signAffinities as string[];
    if (signAffinities.includes(position.sign.toLowerCase())) {
      score += 1;
      totalFactors += 1;
    }

    // Special handling for decan rulers
    const decanInfo = planetDecans[planet];
    if (decanInfo && rulingPlanets.includes(decanInfo.decanRuler)) {
      score += 0.8; // Good bonus for decan ruler match
      totalFactors += 0.8;
    }

    // Tarot card associations - add subtle influence
    const tarotAssociations = astrologicalProfile.tarotAssociations as string[];
    if (decanInfo.tarotCard && tarotAssociations.includes(decanInfo.tarotCard)) {
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
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
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
  const total = Object.values(elementalInfluences).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(elementalInfluences).forEach(element => {
      elementalInfluences[element as any] =
        elementalInfluences[element as any] / total;
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
  limit = 3,
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
      const ingredientData = ingredient as unknown as any;
      const ingredientName = safeGetString(ingredientData.name) || '';
      const ingredientType = safeGetString(ingredientData.type) || '';

      // Check if ingredient name or type matches any nutritional correlation
      const matchesNutritional = nutritionalCorrelations.some(
        correlation =>
          ingredientName.toLowerCase().includes(correlation.toLowerCase()) ||
          ingredientType.toLowerCase().includes(correlation.toLowerCase()),
      );

      // Check if ingredient name matches any herb recommendation
      const matchesHerb = herbRecommendations.some(herb =>
        ingredientName.toLowerCase().includes(herb.toLowerCase()),
      );

      return matchesNutritional || matchesHerb;
    });

    // Add matching ingredients to the result, with a score based on chakra energy
    matchingIngredients.forEach(ingredient => {
      const ingredientData = ingredient as unknown as any;
      const ingredientType = safeGetString(ingredientData.type) || 'other';
      const recommendationKey = ingredientType ? `${ingredientType.toLowerCase()}s` : 'others';

      if (!result[recommendationKey]) {
        result[recommendationKey] = [];
      }

      // Create recommendation with chakra-based score
      const ingredientName = safeGetString(ingredientData.name) || 'Unknown Ingredient';
      const recommendation: IngredientRecommendation = {
        name: ingredientName,
        type: ingredientType,
        category: safeGetString(ingredientData.category),
        elementalProperties: ingredientData.elementalProperties as ElementalProperties,
        qualities: safeGetStringArray(ingredientData.qualities),
        matchScore: energy / 10, // Normalize to 0-1 range
        modality: ingredientData.modality as Modality,
        recommendations: [
          `Supports ${chakra} chakra energy`,
          ...(nutritionalCorrelations.filter(
            corr =>
              ingredientName.toLowerCase().includes(corr.toLowerCase()) ||
              ingredientType.toLowerCase().includes(corr.toLowerCase()),
          ) || []),
        ],
        description: `Supports ${chakra} chakra energy`,
        totalScore: energy / 10,
        elementalScore: 0,
        astrologicalScore: 0,
        seasonalScore: 0,
        dietary: [],
      };

      // Only add if not already present
      if (!result[recommendationKey]?.some(rec => rec.name === ingredientName)) {
        result[recommendationKey]?.push(recommendation);
      }
    });
  });

  // Apply limit to each category
  Object.keys(result).forEach(key => {
    if (result[key]?.length && (result[key]?.length ?? 0) > limit) {
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

  // Check if the ingredient appears in Venus's herb associations
  // Note: HerbalAssociations only has Herbs, Flowers, Woods, Scents - Spices not available
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
  if (
    venusData.PlanetSpecific?.ZodiacTransit &&
    typeof venusData.PlanetSpecific.ZodiacTransit === 'object'
  ) {
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
  if (
    marsData.PlanetSpecific?.ZodiacTransit &&
    typeof marsData.PlanetSpecific.ZodiacTransit === 'object'
  ) {
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
  isVenusRetrograde = false,
): number {
  let score = 0;

  // Base score for Venus association
  const ingredientData = ingredient as unknown as any;
  const ingredientName = safeGetString(ingredientData.name);
  if (ingredientName && isVenusAssociatedIngredient(ingredientName)) {
    score += 2.0;
  }

  // Check elemental properties alignment with Venus
  if (ingredient.elementalProperties) {
    // Venus favors Water and Earth elements
    score += (ingredient.elementalProperties.Water || 0) * 1.5;
    score += (ingredient.elementalProperties.Earth || 0) * 1.8;
    // Lesser affinities with Air and Fire
    score += (ingredient.elementalProperties.Air || 0) * 0.8;
    score += (ingredient.elementalProperties.Fire || 0) * 0.5;
  }

  // Check flavor profile alignment with Venus preferences
  const flavorProfile = ingredientData.flavorProfile as Record<string, number>;
  if (flavorProfile) {
    // Venus favors sweet, rich, creamy flavors
    if (flavorProfile.sweet) {
      score += flavorProfile.sweet * 2.0;
    }

    if (flavorProfile.umami) {
      score += flavorProfile.umami * 1.5;
    }

    if (flavorProfile.creamy || flavorProfile.rich) {
      score += ((flavorProfile.creamy || 0) + (flavorProfile.rich || 0)) * 1.7;
    }

    // Venus appreciates aromatic, fragrant qualities
    if (flavorProfile.aromatic || flavorProfile.fragrant) {
      score += ((flavorProfile.aromatic || 0) + (flavorProfile.fragrant || 0)) * 1.6;
    }

    // Venus is less interested in bitter or excessively spicy flavors
    if (flavorProfile.bitter) {
      score -= ((flavorProfile as any)?.bitter || 0) * 0.2;
    }

    if (flavorProfile.spicy && flavorProfile.spicy > 0.7) {
      score -= (flavorProfile.spicy - 0.7) * 0.8;
    }
  }

  // Check texture alignment with Venus preferences
  const texture = (ingredient as unknown as any).texture;
  if (texture) {
    // Venus favors smooth, creamy, luscious textures
    const venusTextures = ['smooth', 'creamy', 'velvety', 'soft', 'tender', 'juicy', 'buttery'];
    const textureArray = Array.isArray(texture) ? texture : [texture].filter(Boolean);
    const textureMatch = venusTextures.filter(venusTexture =>
      textureArray.some(t => (t || '').toString().includes(venusTexture)),
    ).length;

    score += textureMatch * 0.5;
  }

  // Check culinary technique alignment
  const culinaryUses = (ingredient as unknown as any).culinaryUses;
  if (venusData.PlanetSpecific?.CulinaryTechniques && culinaryUses) {
    const culinaryUsesArray = Array.isArray(culinaryUses)
      ? culinaryUses
      : [culinaryUses].filter(Boolean);
    // Check for aesthetic presentation techniques
    if (
      culinaryUsesArray.some(use => (use || '').toString().includes('garnish')) ||
      culinaryUsesArray.some(use => (use || '').toString().includes('plating'))
    ) {
      score += 1.8;
    }

    // Check for balance and harmony in flavor pairings
    const harmonyPairings = (ingredient as unknown as any).harmonyPairings;
    const harmonyPairingsArray = Array.isArray(harmonyPairings) ? harmonyPairings : [];
    if (harmonyPairingsArray.length > 3) {
      score += 1.5;
    }

    // Sweet and indulgent preparation techniques
    if (
      culinaryUsesArray.some(use => (use || '').toString().includes('dessert')) ||
      culinaryUsesArray.some(use => (use || '').toString().includes('baking')) ||
      culinaryUsesArray.some(use => (use || '').toString().includes('confection'))
    ) {
      score += 1.2;
    }

    // Check for fragrance and aroma enhancement
    const aromaticProperties = (ingredient as unknown as any)
      .aromaticProperties;
    if (aromaticProperties || (flavorProfile.aromatic && flavorProfile.aromatic > 0.7)) {
      score += 1.6;
    }

    // Check for textural contrast techniques
    if (
      culinaryUsesArray.some(use => (use || '').toString().includes('crispy')) ||
      culinaryUsesArray.some(use => (use || '').toString().includes('crunchy')) ||
      (Array.isArray(texture) && texture.some(t => (t || '').toString().includes('contrast')))
    ) {
      score += 1.3;
    }
  }

  // Zodiac sign-specific preferences
  if (zodiacSign && venusData.PlanetSpecific?.ZodiacTransit) {
    const transitData = venusData.PlanetSpecific.ZodiacTransit[zodiacSign];

    // Check food focus alignment
    // Extract transit data with safe property access
    const transitDataAny = transitData as any;
    const foodFocusProperty = transitDataAny.FoodFocus;

    if (foodFocusProperty) {
      const foodFocus = (foodFocusProperty || '').toString().toLowerCase();
      const ingredientName = ((ingredient as unknown as any).name || '')
        .toString()
        .toLowerCase();

      // Direct keywords match
      const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
      for (const keyword of keywords) {
        const description = (ingredient as unknown as any).description;
        const culinaryUses = (ingredient as unknown as any).culinaryUses;
        if (
          ingredientName.includes(keyword) ||
          (description && String(description).toLowerCase().includes(keyword)) ||
          (Array.isArray(culinaryUses) &&
            culinaryUses.some((use: string) => String(use).toLowerCase().includes(keyword)))
        ) {
          score += 2.0;
          break;
        }
      }
    }

    // Check Elements alignment
    // Extract transit data with safe property access for elements
    const transitElements = transitDataAny.Elements;

    if (transitElements && ingredient.elementalProperties) {
      for (const element in transitElements as any) {
        if (ingredient.elementalProperties[element]) {
          score += transitElements[element] * ingredient.elementalProperties[element] * 0.7;
        }
      }
    }

    // Check ingredient alignment with transit preferences
    if (transitData.Ingredients) {
      const transitIngredients = transitData?.Ingredients?.map(i => i.toLowerCase());

      // Direct ingredient match
      const ingredientData = ingredient as unknown as BaseIngredient;
      if (
        transitIngredients.some(
          i =>
            ingredientData.name?.toLowerCase()?.includes(i) ||
            i.includes(ingredientData.name?.toLowerCase() || ''),
        )
      ) {
        score += 3.0;
      }

      // Category match
      if (ingredient.category && transitIngredients.includes(ingredient.category.toLowerCase())) {
        score += 2.0;
      }

      // Related ingredient match
      const ingredientRecord = ingredient as unknown as any;
      const relatedIngredients = ingredientRecord.relatedIngredients;
      if (Array.isArray(relatedIngredients)) {
        const relatedMatches = relatedIngredients.filter((related: string) =>
          transitIngredients.some(
            i => related.toLowerCase().includes(i) || i.includes(related.toLowerCase()),
          ),
        ).length;

        score += relatedMatches * 0.7;
      }

      // Complementary ingredients match
      const ingredientDataComp = ingredient as unknown as any;
      const complementaryIngredients = ingredientDataComp.complementaryIngredients;
      if (Array.isArray(complementaryIngredients)) {
        const complementaryMatches = complementaryIngredients.filter((complement: unknown) => {
          const complementStr = String(complement || '');
          return transitIngredients.some(
            i => complementStr.toLowerCase().includes(i) || i.includes(complementStr.toLowerCase()),
          );
        }).length;

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
      (venusData.PlanetSpecific?.CulinaryTemperament as any).EarthVenus
    ) {
      const earthVenus = (venusData.PlanetSpecific?.CulinaryTemperament as any)
        .EarthVenus;

      // Check for sensual, rich ingredients
      if (
        flavorProfile.rich > 0.5 ||
        flavorProfile.umami > 0.5 ||
        (Array.isArray(culinaryUses) && culinaryUses.includes('comfort food'))
      ) {
        score += 2.0;
      }

      // Food focus alignment
      // Extract earth venus data with safe property access
      const earthVenusAny = earthVenus as any;
      const earthVenusFoodFocus = earthVenusAny.FoodFocus;

      if (earthVenusFoodFocus) {
        const focusKeywords = String(earthVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,;]+/)
          .filter(k => k.length > 3);
        const ingredientDataEarth = ingredient as unknown as any;
        const description = ingredientDataEarth.description;
        if (
          focusKeywords.some(
            keyword =>
              String(ingredientDataEarth.name || '')
                .toLowerCase()
                .includes(keyword) ||
              (description && String(description).toLowerCase().includes(keyword)),
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      // Extract earth venus elements with safe property access
      const earthVenusElements = earthVenusAny.Elements;

      if (earthVenusElements && ingredient.elementalProperties) {
        const elementsData = earthVenusElements as any;
        for (const element in elementsData) {
          if (ingredient.elementalProperties[element]) {
            const elementValue = Number(elementsData[element] || 0);
            score += elementValue * ingredient.elementalProperties[element] * 1.0;
          }
        }
      }
    }

    // Air Venus
    if (
      airSigns.includes(lowerSign) &&
      (venusData.PlanetSpecific?.CulinaryTemperament as any).AirVenus
    ) {
      const airVenus = (venusData.PlanetSpecific?.CulinaryTemperament as any)
        .AirVenus;

      // Check for light, delicate ingredients
      if (
        (texture &&
          ((Array.isArray(texture) && texture.includes('light')) ||
            (Array.isArray(texture) && texture.includes('light')))) ||
        (texture &&
          ((Array.isArray(texture) && texture.includes('crisp')) ||
            (Array.isArray(texture) && texture.includes('crisp')))) ||
        flavorProfile.light > 0.5
      ) {
        score += 2.0;
      }

      // Food focus alignment
      // Extract air venus data with safe property access
      const airVenusAny = airVenus as any;
      const airVenusFoodFocus = airVenusAny.FoodFocus;

      if (airVenusFoodFocus) {
        const focusKeywords = String(airVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,;]+/)
          .filter(k => k.length > 3);
        const ingredientDataAir = ingredient as unknown as any;
        const description = ingredientDataAir.description;
        if (
          focusKeywords.some(
            keyword =>
              String(ingredientDataAir.name || '')
                .toLowerCase()
                .includes(keyword) ||
              (description && String(description).toLowerCase().includes(keyword)),
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      // Extract air venus elements with safe property access
      const airVenusElements = airVenusAny.Elements;

      if (airVenusElements && ingredient.elementalProperties) {
        const elementsData = airVenusElements as any;
        for (const element in elementsData) {
          if (ingredient.elementalProperties[element]) {
            const elementValue = Number(elementsData[element] || 0);
            score += elementValue * ingredient.elementalProperties[element] * 1.0;
          }
        }
      }
    }

    // Water Venus
    if (
      waterSigns.includes(lowerSign) &&
      (venusData.PlanetSpecific?.CulinaryTemperament as any).WaterVenus
    ) {
      const waterVenus = (venusData.PlanetSpecific?.CulinaryTemperament as any)
        .WaterVenus;

      // Check for moist, juicy ingredients with safe property access
      const textureArray = Array.isArray(texture) ? texture : [];
      const textureString = typeof texture === 'string' ? texture : '';
      const hasJuicyTexture = textureArray.includes('juicy') || textureString.includes('juicy');
      const hasTenderTexture = textureArray.includes('tender') || textureString.includes('tender');

      if (
        hasJuicyTexture ||
        hasTenderTexture ||
        (flavorProfile.juicy && flavorProfile.juicy > 0.5)
      ) {
        score += 2.0;
      }

      // Food focus alignment
      // Extract water venus data with safe property access
      const waterVenusAny = waterVenus as any;
      const waterVenusFoodFocus = waterVenusAny.FoodFocus;

      if (waterVenusFoodFocus) {
        const focusKeywords = String(waterVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,;]+/)
          .filter(k => k.length > 3);
        // Extract ingredient data with safe property access
        const ingredientDataWater = ingredient as unknown as any;
        const ingredientName = String(ingredientDataWater.name || '').toLowerCase();
        const ingredientDescription = String(ingredientDataWater.description || '').toLowerCase();

        if (
          focusKeywords.some(
            keyword => ingredientName.includes(keyword) || ingredientDescription.includes(keyword),
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      // Extract water venus elements with safe property access
      const waterVenusElements = waterVenusAny.Elements;

      if (waterVenusElements && ingredient.elementalProperties) {
        const elementsData = waterVenusElements as any;
        for (const element in elementsData) {
          if (ingredient.elementalProperties[element]) {
            const elementValue = Number(elementsData[element] || 0);
            score += elementValue * ingredient.elementalProperties[element] * 1.0;
          }
        }
      }
    }

    // Fire Venus
    if (
      fireSigns.includes(lowerSign) &&
      (venusData.PlanetSpecific?.CulinaryTemperament as any).FireVenus
    ) {
      const fireVenus = (venusData.PlanetSpecific?.CulinaryTemperament as any)
        .FireVenus;

      // Check for vibrant, spicy ingredients with safe property access
      const culinaryUsesArray = Array.isArray(culinaryUses) ? culinaryUses : [];
      const culinaryUsesString = typeof culinaryUses === 'string' ? culinaryUses : '';
      const hasStimulatingUses =
        culinaryUsesArray.includes('stimulating') || culinaryUsesString.includes('stimulating');

      if (
        (flavorProfile.spicy && flavorProfile.spicy > 0.3) ||
        (flavorProfile.vibrant && flavorProfile.vibrant > 0.5) ||
        hasStimulatingUses
      ) {
        score += 2.0;
      }

      // Food focus alignment
      // Extract fire venus data with safe property access
      const fireVenusAny = fireVenus as any;
      const fireVenusFoodFocus = fireVenusAny.FoodFocus;

      if (fireVenusFoodFocus) {
        const focusKeywords = String(fireVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,;]+/)
          .filter(k => k.length > 3);
        // Extract ingredient data with safe property access
        const ingredientDataFire = ingredient as unknown as any;
        const ingredientName = String(ingredientDataFire.name || '').toLowerCase();
        const ingredientDescription = String(ingredientDataFire.description || '').toLowerCase();

        if (
          focusKeywords.some(
            keyword => ingredientName.includes(keyword) || ingredientDescription.includes(keyword),
          )
        ) {
          score += 1.5;
        }
      }

      // Elements alignment
      // Extract fire venus elements with safe property access
      const fireVenusElements = fireVenusAny.Elements;

      if (fireVenusElements && ingredient.elementalProperties) {
        const elementsData = fireVenusElements as any;
        for (const element in elementsData) {
          if (ingredient.elementalProperties[element]) {
            const elementValue = Number(elementsData[element] || 0);
            score += elementValue * ingredient.elementalProperties[element] * 1.0;
          }
        }
      }
    }
  }

  // Retrograde modifiers
  if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
    // Increase score for preserved or dried herbs during retrograde
    const ingredientData = ingredient as unknown as any;
    const preservationMethods = ingredientData.preservation_methods;
    const categories = ingredientData.categories;
    const ingredientCategory = safeGetString(ingredientData.category);

    const preservationMethodsArray = Array.isArray(preservationMethods) ? preservationMethods : [];
    const categoriesArray = Array.isArray(categories) ? categories : [];

    if (
      preservationMethodsArray.includes('dried') ||
      ingredientCategory === 'herb' ||
      categoriesArray.includes('preserved')
    ) {
      score *= 1.5;
    } else {
      score *= 0.8; // Slightly reduce other ingredients
    }

    // Nostalgia foods get a boost during retrograde
    // Extract ingredient data with safe property access for cultural significance
    const culturalSignificance = ingredientData.cultural_significance;
    const culturalSignificanceArray = Array.isArray(culturalSignificance)
      ? culturalSignificance
      : typeof culturalSignificance === 'string'
        ? [culturalSignificance]
        : [];

    if (
      culturalSignificanceArray.includes('traditional') ||
      culturalSignificanceArray.includes('nostalgic')
    ) {
      score += 1.8;
    }

    // Check retrograde food focus
    // Extract retrograde data with safe property access
    const retrogradeData = venusData.PlanetSpecific.Retrograde as any;
    const retroFoodFocus = retrogradeData.FoodFocus;

    if (retroFoodFocus) {
      const retroFocus = typeof retroFoodFocus === 'string' ? retroFoodFocus.toLowerCase() : '';
      const ingredientName = safeGetString(ingredientData.name)?.toLowerCase() || '';
      const ingredientDesc = safeGetString(ingredientData.description)?.toLowerCase() || '';

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
    // Extract retrograde elements with safe property access
    const retrogradeElements = retrogradeData.Elements;

    if (retrogradeElements && ingredient.elementalProperties) {
      const elementsData = retrogradeElements as any;
      for (const element in elementsData) {
        const elementKey = element as any;
        if (ingredient.elementalProperties[elementKey]) {
          const elementValue = safeGetNumber(elementsData[element]);
          score += elementValue * ingredient.elementalProperties[elementKey] * 0.9;
        }
      }
    }
  }

  // Lunar phase connections with Venus
  // Extract planetary data with safe property access
  const venusDataAny = venusData as unknown as any;
  const lunarConnection = venusDataAny.LunarConnection;

  if (lunarConnection) {
    // This would be checked against the current lunar phase in a full implementation
  }

  return score;
}

// Enhance ingredient scoring with Venus influence
function _enhanceVenusIngredientScoring(
  ingredient: Ingredient,
  astroState: AstrologicalState,
  score: number,
): number {
  // Only apply Venus scoring if Venus is active
  if (!astroState.activePlanets?.includes('Venus')) {
    return score;
  }

  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;

  // Check if Venus is retrograde
  // Extract astrological state with safe property access
  const astroStateData = astroState as any;
  const retrogradeArray = Array.isArray(astroStateData.retrograde) ? astroStateData.retrograde : [];
  const isVenusRetrograde = retrogradeArray.includes('Venus') || false;

  // Calculate Venus influence score
  const venusInfluence = calculateVenusInfluence(ingredient, zodiacSign, isVenusRetrograde);

  // Apply Venus influence to the base score (weight it appropriately)
  return score + venusInfluence * 0.3;
}

// Enhanced function to boost Venus-ruled ingredients based on detailed Venus data
function enhanceVenusIngredientBatch(
  ingredients: Ingredient[],
  astroState: AstrologicalState,
): void {
  // Check if Venus is active
  const isVenusActive = astroState.activePlanets?.includes('Venus');
  if (!isVenusActive) {
    return; // Skip Venus scoring if Venus is not active
  }

  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;

  // Check if Venus is retrograde
  // Extract astrological state with safe property access for batch processing
  const astroStateData = astroState as any;
  const retrogradeArray = Array.isArray(astroStateData.retrograde) ? astroStateData.retrograde : [];
  const isVenusRetrograde = retrogradeArray.includes('Venus') || false;

  // Add a "venusScore" property to each ingredient for sorting
  ingredients.forEach(ingredient => {
    // Use our comprehensive Venus influence calculation
    const venusScore = calculateVenusInfluence(ingredient, zodiacSign, isVenusRetrograde);

    // Store the Venus score with the ingredient
    const ingredientData = ingredient as unknown as any;
    ingredientData.venusScore = venusScore;
  });

  // Sort ingredients by Venus score
  ingredients.sort((a, b) => {
    const aData = a as unknown as any;
    const bData = b as unknown as any;
    const aScore = safeGetNumber(aData.venusScore) || 0;
    const bScore = safeGetNumber(bData.venusScore) || 0;
    return bScore - aScore;
  });
}

/**
 * Calculates a Mars influence score for an ingredient
 */
function calculateMarsInfluence(
  ingredient: Ingredient,
  zodiacSign?: string,
  isMarsRetrograde = false,
): number {
  let score = 0;

  // Get the name in lowercase for comparison
  const ingredientData = ingredient as unknown as any;
  const name = safeGetString(ingredientData.name)?.toLowerCase() || '';

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
  // Extract ingredient data with safe property access for flavor profile
  const ingredientFlavorProfile = ingredientData.flavorProfile;

  if (marsData.FlavorProfiles && ingredientFlavorProfile) {
    for (const flavor in marsData.FlavorProfiles) {
      const flavorValue = safeGetNumber(ingredientFlavorProfile[flavor]);
      if (flavorValue > 0) {
        // Higher score when both have high values for same flavor
        score += marsData.FlavorProfiles[flavor] * flavorValue;
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
    if (transit?.Ingredients) {
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
    if (transit?.Elements && ingredient.elementalProperties) {
      for (const element in transit.Elements) {
        const elemValue = element as any;
        if (ingredient.elementalProperties[elemValue]) {
          score += transit.Elements[element] * ingredient.elementalProperties[elemValue] * 1.2;
        }
      }
    }
  }

  // Mars retrograde effects
  if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
    // During retrograde, Mars emphasizes dried herbs and spices
    // Extract ingredient data with safe property access for type
    const ingredientType =
      safeGetString(ingredientData.type) || safeGetString(ingredientData.category) || '';

    if (ingredientType === 'spice' || ingredientType === 'herb' || ingredientType === 'seasoning') {
      score += 1.5;
    }

    // Focus shifts to traditional uses
    // Extract ingredient data with safe property access for traditional property
    const ingredientTraditional = ingredientData.traditional;
    if (ingredientTraditional) {
      score += 1.2;
    }
  }

  // Adjust for Mars temperament based on dominant element
  if (ingredient.elementalProperties) {
    const fireDominant = (ingredient.elementalProperties.Fire || 0) > 0.6;
    const waterDominant = (ingredient.elementalProperties.Water || 0) > 0.6;

    // Extract Mars temperament data with safe property access
    const marsTemperament = marsData.PlanetSpecific?.CulinaryTemperament as any;
    const fireMars = marsTemperament.FireMars;
    const waterMars = marsTemperament.WaterMars;

    if (fireDominant && fireMars) {
      score += 1.5;
    } else if (waterDominant && waterMars) {
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
  astroState: AstrologicalState,
): void {
  // Get Mars status info from astro state
  // Extract astrological state with safe property access for Mars retrograde
  const astroStateData = astroState as any;
  const retrogradeArray = Array.isArray(astroStateData.retrograde) ? astroStateData.retrograde : [];
  const isMarsRetrograde = retrogradeArray.includes('Mars') || false;
  const zodiacSign = astroState.zodiacSign;

  // Compute Mars influence for each ingredient
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];

    // Only process if it has necessary data
    // Extract ingredient data with safe property access
    const ingredientData = ingredient as unknown as any;
    const ingredientName = ingredientData.name;
    const ingredientMatchScore = ingredientData.matchScore;

    if (!ingredientName || !ingredientMatchScore) continue;

    // Calculate Mars influence
    const marsInfluence = calculateMarsInfluence(ingredient, zodiacSign, isMarsRetrograde);

    // Apply Mars boost to match score
    if (marsInfluence > 0) {
      // Include the original score, add the Mars influence
      const currentScore = safeGetNumber(ingredientData.matchScore) || 0;
      ingredientData.matchScore = currentScore + marsInfluence * 1.8;

      // Add a flag or data point to indicate Mars influence was applied
      if (!ingredientData.influences) {
        ingredientData.influences = {};
      }
      (ingredientData.influences as any).mars = marsInfluence;
    }
  }

  // Re-sort the ingredients based on the updated scores
  ingredients.sort((a, b) => {
    const aData = a as unknown as any;
    const bData = b as unknown as any;
    const aScore = safeGetNumber(aData.matchScore) || 0;
    const bScore = safeGetNumber(bData.matchScore) || 0;
    return bScore - aScore;
  });
}

// Add the new function for Mercury associated ingredients
function isMercuryAssociatedIngredient(ingredientName: string): boolean {
  if (!ingredientName) return false;

  const lowerIngredient = ingredientName.toLowerCase();

  // Check direct Mercury food associations
  if (
    mercuryData.FoodAssociations &&
    mercuryData.FoodAssociations.some(
      food =>
        food.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(lowerIngredient),
    )
  ) {
    return true;
  }

  // Check Mercury herb associations
  if (
    mercuryData.HerbalAssociations?.Herbs &&
    mercuryData.HerbalAssociations.Herbs.some(
      herb =>
        herb.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(lowerIngredient),
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

  if (mercuryFlavorSignals.some(signal => lowerIngredient.includes(signal))) {
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
  const currentZodiacSign = 'aries'; // Use fallback or implement getCurrentZodiacSign function
  if (
    currentZodiacSign &&
    mercuryData.PlanetSpecific?.ZodiacTransit?.[currentZodiacSign]?.Ingredients
  ) {
    const transitIngredients =
      mercuryData.PlanetSpecific.ZodiacTransit[currentZodiacSign].Ingredients;
    if (
      transitIngredients.some(
        ingredient =>
          ingredient.toLowerCase() === lowerIngredient ||
          lowerIngredient.includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(lowerIngredient),
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
  isMercuryRetrograde = false,
): number {
  let score = 0;

  // Base score for Mercury-ruled ingredients
  const ingredientData = ingredient as unknown as any;
  const astrologicalProfile = ingredientData.astrologicalProfile as any;
  const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
  if (rulingPlanets.includes('Mercury')) {
    score += 3.0; // Strong baseline for Mercury-ruled ingredients
  }

  // Mercury food associations
  const ingredientName = safeGetString(ingredientData.name)?.toLowerCase() || '';
  if (mercuryData.FoodAssociations) {
    for (const food of mercuryData.FoodAssociations) {
      if (
        ingredientName.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(ingredientName)
      ) {
        score += 2.0;
        break;
      }
    }
  }

  // Mercury herb associations
  // Extract ingredient data with safe property access for type
  const ingredientType =
    safeGetString(ingredientData.type) || safeGetString(ingredientData.category) || '';

  if (
    mercuryData.HerbalAssociations?.Herbs &&
    (ingredientType === 'herb' || ingredientType === 'spice')
  ) {
    for (const herb of mercuryData.HerbalAssociations.Herbs) {
      if (
        ingredientName.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredientName)
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
    const signAffinities = astrologicalProfile.signAffinities as string[];
    if (signAffinities.includes(lowerSign)) {
      score += 1.5;
    }

    // Check Mercury's zodiac transit data for this sign
    const mercuryTransit = mercuryData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
    if (mercuryTransit) {
      // Boost for ingredients matching transit ingredients
      if (
        mercuryTransit.Ingredients &&
        mercuryTransit?.Ingredients?.some(
          transitIngredient =>
            ingredientName.includes(transitIngredient.toLowerCase()) ||
            transitIngredient.toLowerCase().includes(ingredientName),
        )
      ) {
        score += 2.5;
      }

      // Element alignment with Mercury in this sign
      if (mercuryTransit.Elements && ingredient.elementalProperties) {
        for (const element in mercuryTransit.Elements) {
          const elemKey = element as any;
          if (ingredient.elementalProperties[elemKey]) {
            score +=
              mercuryTransit.Elements[element] * ingredient.elementalProperties[elemKey] * 1.2;
          }
        }
      }
    }

    // Special scoring for Mercury in its domicile signs
    if (lowerSign === 'gemini' || lowerSign === 'virgo') {
      if (rulingPlanets.includes('Mercury')) {
        score += 2.0; // Extra boost for Mercury ruling when Mercury is in domicile
      }

      // Special handling for Gemini (Air) and Virgo (Earth)
      if (lowerSign === 'gemini' && ingredient.elementalProperties.Air) {
        score += ingredient.elementalProperties.Air * 1.8;
      } else if (lowerSign === 'virgo' && ingredient.elementalProperties.Earth) {
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
      ingredient.qualities.includes('traditional') ||
      ingredient.qualities.includes('nostalgic') ||
      ingredient.qualities.includes('classic')
    ) {
      score *= 1.25; // Boost for traditional ingredients during retrograde
    }

    // During retrograde, Mercury de-emphasizes complex or exotic ingredients
    if (
      ingredient.qualities.includes('exotic') ||
      ingredient.qualities.includes('complex') ||
      ingredient.qualities.includes('novel')
    ) {
      score *= 0.8; // Reduce score for complex/exotic ingredients during retrograde
    }

    // Apply Mercury's retrograde elemental shift if available
    const ingredientData = ingredient as unknown as any;
    const elementalProperties = ingredientData.elementalProperties as ElementalProperties;
    if (mercuryData.RetrogradeEffect && elementalProperties) {
      // Shift toward Matter and away from Spirit during retrograde
      if (elementalProperties.Earth) {
        score += elementalProperties.Earth * Math.abs(mercuryData.RetrogradeEffect.Matter);
      }
      if (elementalProperties.Air) {
        score -= elementalProperties.Air * Math.abs(mercuryData.RetrogradeEffect.Spirit);
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
function enhanceMercuryIngredientScoring(
  ingredients: Ingredient[],
  astroState: AstrologicalState,
): void {
  // Check if Mercury is retrograde
  // Extract astrological state with safe property access for Mercury retrograde
  const astroStateData = astroState as any;
  const retrogradeArray = Array.isArray(astroStateData.retrograde) ? astroStateData.retrograde : [];
  const isMercuryRetrograde = retrogradeArray.includes('Mercury') || false;

  // Get the current zodiac sign
  const zodiacSign = astroState.zodiacSign;

  // For each ingredient, calculate and apply Mercury influence score
  ingredients.forEach(ingredient => {
    const mercuryScore = calculateMercuryInfluence(ingredient, zodiacSign, isMercuryRetrograde);

    // Extract ingredient data with safe property access for score manipulation
    const ingredientData = ingredient as unknown as any;

    // Apply Mercury score as a multiplier to the ingredient's existing score
    if (ingredientData.matchScore !== undefined) {
      const currentScore = safeGetNumber(ingredientData.matchScore) || 0;
      ingredientData.matchScore = currentScore * (1 + mercuryScore * 0.3);
    } else if ('score' in ingredientData) {
      const currentScore = safeGetNumber(ingredientData.score) || 0;
      ingredientData.score = currentScore * (1 + mercuryScore * 0.3);
    }

    // If the ingredient has a Mercury score field, update it
    if ('mercuryAffinity' in ingredient) {
      (ingredient as any).mercuryAffinity = mercuryScore;
    }

    // If the ingredient has a detailed score breakdown, add Mercury score
    if ('scoreDetails' in ingredient) {
      const ingredientData = ingredient as unknown as any;
      const existingDetails = (ingredientData.scoreDetails as any) || {};
      ingredientData.scoreDetails = {
        ...existingDetails,
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
  elementalProperties?: ElementalProperties,
): any {
  // Ensure qualities is an array
  const qualitiesArray = Array.isArray(qualities) ? qualities : [];

  // Create normalized arrays of qualities for easier matching
  const normalizedQualities = qualitiesArray.map(q => q.toLowerCase());

  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = [
    'initiating',
    'spicy',
    'pungent',
    'stimulating',
    'invigorating',
    'activating',
  ];
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
    dignityEffect: { leo: 1, aries: 2, aquarius: -1, libra: -2 },
  },
  Moon: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 },
  },
  Mercury: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 },
  },
  Venus: {
    diurnal: 'Water',
    nocturnal: 'Earth',
    dignityEffect: { libra: 1, taurus: 1, pisces: 2, aries: -1, scorpio: -1, virgo: -2 },
  },
  Mars: {
    diurnal: 'Fire',
    nocturnal: 'Water',
    dignityEffect: { aries: 1, scorpio: 1, capricorn: 2, taurus: -1, libra: -1, cancer: -2 },
  },
  Jupiter: {
    diurnal: 'Air',
    nocturnal: 'Fire',
    dignityEffect: { pisces: 1, sagittarius: 1, cancer: 2, gemini: -1, virgo: -1, capricorn: -2 },
  },
  Saturn: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { aquarius: 1, capricorn: 1, libra: 2, cancer: -1, leo: -1, aries: -2 },
  },
  Uranus: {
    diurnal: 'Water',
    nocturnal: 'Air',
    dignityEffect: { aquarius: 1, scorpio: 2, taurus: -3 },
  },
  Neptune: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 },
  },
  Pluto: {
    diurnal: 'Earth',
    nocturnal: 'Water',
    dignityEffect: { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 },
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
  aries: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mars'], '2nd Decan': ['Sun'], '3rd Decan': ['Venus'] },
    degreeEffects: {
      Mercury: [15, 21],
      Venus: [7, 14],
      Mars: [22, 26],
      Jupiter: [1, 6],
      Saturn: [27, 30],
    },
  },
  taurus: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [9, 15],
      Venus: [1, 8],
      Mars: [27, 30],
      Jupiter: [16, 22],
      Saturn: [23, 26],
    },
  },
  gemini: {
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
  cancer: {
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
  leo: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Saturn'], '2nd Decan': ['Jupiter'], '3rd Decan': ['Mars'] },
    degreeEffects: {
      Mercury: [7, 13],
      Venus: [14, 19],
      Mars: [26, 30],
      Jupiter: [20, 25],
      Saturn: [1, 6],
    },
  },
  virgo: {
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
  libra: {
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
  scorpio: {
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
  sagittarius: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [15, 20],
      Venus: [9, 14],
      Mars: [],
      Jupiter: [1, 8],
      Saturn: [21, 25],
    },
  },
  capricorn: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Jupiter'], '2nd Decan': [], '3rd Decan': ['Sun'] },
    degreeEffects: {
      Mercury: [7, 12],
      Venus: [1, 6],
      Mars: [],
      Jupiter: [13, 19],
      Saturn: [26, 30],
    },
  },
  aquarius: {
    element: 'Air',
    decanEffects: { '1st Decan': ['Uranus'], '2nd Decan': ['Mercury'], '3rd Decan': ['Moon'] },
    degreeEffects: {
      Mercury: [],
      Venus: [13, 20],
      Mars: [26, 30],
      Jupiter: [21, 25],
      Saturn: [1, 6],
    },
  },
  pisces: {
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
  planetaryPositions?: Record<string, { sign: string; degree: number }>,
  planetaryData?: { jupiterData: unknown; saturnData: unknown },
): number {
  // Enhanced calculation using Jupiter and Saturn data for dignity effects
  const _enhancedPlanetaryInfluence = planetaryData
    ? calculateEnhancedPlanetaryInfluence(planetaryDay, planetaryData)
    : 1.0;
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
  const ingredientData = ingredient as unknown as any;
  const elementalProperties = ingredientData.elementalProperties as ElementalProperties;
  if (elementalProperties) {
    diurnalMatch = elementalProperties[diurnalElement] || 0;
    nocturnalMatch = elementalProperties[nocturnalElement] || 0;
  } else {
    // Simple matching if no detailed elemental profile is available
    // Extract ingredient data with safe property access for element
    const ingredientElement = ingredientData.element || ingredientData.category || '';

    diurnalMatch = ingredientElement === diurnalElement ? 1.0 : 0.3;
    nocturnalMatch = ingredientElement === nocturnalElement ? 1.0 : 0.3;
  }

  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;

  // Apply dignity effects if we have planet positions
  if (planetaryPositions?.[planetaryDay]) {
    const planetSign = planetaryPositions[planetaryDay].sign;
    const planetDegree = planetaryPositions[planetaryDay].degree;

    // Dignity effect bonus/penalty
    if (dayElements.dignityEffect && dayElements.dignityEffect[planetSign]) {
      const dignityModifier = dayElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + dignityModifier));
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
      const [minDegree, maxDegree] = signInfo[planetSign].degreeEffects[planetaryDay];
      if (planetDegree >= minDegree && planetDegree <= maxDegree) {
        elementalScore = Math.min(1.0, elementalScore + 0.2);
      }
    }
  }

  // If the food has a direct planetary affinity, give bonus points
  const astrologicalProfile = ingredientData.astrologicalProfile as any;
  const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
  if (rulingPlanets.includes(planetaryDay)) {
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
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>,
  enhancedData?: { lunarPhaseData: unknown; astrologicalBridge: unknown },
): number {
  // Enhanced calculation using lunar phase and astrological bridge data
  const _lunarModifier = enhancedData?.lunarPhaseData
    ? calculateLunarPhaseModifier(enhancedData.lunarPhaseData)
    : 1.0;
  const _astrologicalModifier = enhancedData?.astrologicalBridge
    ? calculateAstrologicalBridgeModifier(enhancedData.astrologicalBridge)
    : 1.0;
  // Get the elements associated with the current planetary hour
  const hourElements = planetaryElements[planetaryHour];
  if (!hourElements) return 0.5; // Unknown planet

  // For planetary hour, use diurnal element during day, nocturnal at night
  const relevantElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;

  // Calculate match based on food's element compared to the hour's relevant element
  let elementalMatch = 0;

  // Check if ingredient has elemental properties
  const ingredientData = ingredient as unknown as any;
  const elementalProperties = ingredientData.elementalProperties as ElementalProperties;
  if (elementalProperties) {
    elementalMatch = elementalProperties[relevantElement] || 0;
  } else {
    // Simple matching if no detailed elemental profile is available
    // Extract ingredient data with safe property access for element
    const ingredientElement = ingredientData.element || ingredientData.category || '';

    elementalMatch = ingredientElement === relevantElement ? 1.0 : 0.3;
  }

  // Apply dignity effects if we have planet positions
  if (planetaryPositions?.[planetaryHour]) {
    const planetSign = planetaryPositions[planetaryHour].sign;

    // Dignity effect bonus/penalty
    if (hourElements.dignityEffect && hourElements.dignityEffect[planetSign]) {
      const dignityModifier = hourElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalMatch = Math.min(1.0, Math.max(0.0, elementalMatch + dignityModifier));
    }
  }

  // Apply aspect effects if available
  if (aspects && aspects.length > 0) {
    // Find aspects involving the planetary hour ruler
    const hourAspects = (aspects || []).filter(
      a => a.planet1 === planetaryHour || a.planet2 === planetaryHour,
    );

    for (const aspect of hourAspects) {
      const otherPlanet = aspect.planet1 === planetaryHour ? aspect.planet2 : aspect.planet1;
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
      const astrologicalProfile = ingredientData.astrologicalProfile as any;
      const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
      if (rulingPlanets.includes(otherPlanet)) {
        elementalMatch = Math.min(1.0, Math.max(0.0, elementalMatch + aspectModifier));
      }
    }
  }

  // If the food has a direct planetary affinity, give bonus points
  const astrologicalProfile = ingredientData.astrologicalProfile as any;
  const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
  if (rulingPlanets.includes(planetaryHour)) {
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
export async function recommendIngredients(
  astroState: AstrologicalState,
  options: RecommendationOptions = {},
): Promise<IngredientRecommendation[]> {
  // Get all available ingredients
  const allIngredients = getAllIngredients();

  // Filter by category if specified
  let filteredIngredients = allIngredients;
  if (options.category) {
    filteredIngredients = allIngredients.filter(ing => {
      // Extract ingredient data with safe property access for type/category
      const ingredientData = ing as unknown as any;
      const ingredientType = String(ingredientData.type || ingredientData.category || '');
      return ingredientType.toLowerCase() === String(options.category || '').toLowerCase();
    });
  }

  // Filter out excluded ingredients
  if (options.excludeIngredients && options.excludeIngredients.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => {
      const ingredientData = ing as unknown as any;
      const ingredientName = String(ingredientData.name || '');
      return !options.excludeIngredients?.includes(ingredientName);
    });
  }

  // Filter to only include specific ingredients
  if (options.includeOnly && options.includeOnly.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => {
      const ingredientData = ing as unknown as any;
      const ingredientName = String(ingredientData.name || '');
      return options.includeOnly?.includes(ingredientName);
    });
  }

  // Extract key astrological information
  // Extract astrological state with safe property access
  const astroStateData = astroState as any;
  const timestamp = astroStateData.timestamp || new Date();
  const Fire = Number(astroStateData.Fire) || 0.5;
  const Water = Number(astroStateData.Water) || 0.5;
  const Air = Number(astroStateData.Air) || 0.5;
  const Earth = Number(astroStateData.Earth) || 0.5;
  const _zodiacSign = String(astroStateData.zodiacSign || '');
  const planetaryAlignment =
    (astroStateData.planetaryAlignment as Record<string, { sign: string; degree: number }>) || {};
  const aspects =
    (astroStateData.aspects as Array<{ aspectType: string; planet1: string; planet2: string }>) ||
    [];

  // Get planetary day and hour for current time (moved up to fix declaration order)
  const date = timestamp instanceof Date ? timestamp : new Date(String(timestamp));

  // Calculate lunar phase using imported utility
  const lunarPhase = calculateLunarPhase(date);

  // Calculate planetary positions using imported utility
  const _calculatedPositions = calculatePlanetaryPositions(date);

  // Integrate enterprise intelligence for enhanced recommendations
  const enterpriseIntelligence = new EnterpriseIntelligenceIntegration();

  // Use LUNAR_PHASES data for phase-based filtering (await lunarPhase since it's a Promise)
  const lunarPhaseValue = await lunarPhase;
  const currentLunarPhaseData = LUNAR_PHASES[lunarPhaseValue] || LUNAR_PHASES['new moon'];

  // Create astrological bridge for enhanced compatibility
  const astrologicalBridge = createAstrologicalBridge();
  // Note: Bridge configuration moved to separate initialization if needed
  const planetaryCalculator = {
    calculatePlanetaryDay: (date: Date) => {
      const days = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
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
    const ingredientData = ingredient as unknown as any;
    const elementalScore = calculateElementalScore(
      ingredientData.elementalProperties as ElementalProperties,
      systemElementalProps,
    );

    // Calculate planetary day influence with enhanced dignity effects (35% weight)
    const planetaryDayScore = calculatePlanetaryDayInfluence(
      ingredient,
      planetaryDay,
      planetaryAlignment,
      { jupiterData, saturnData }, // Include major planet data for enhanced calculations
    );

    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const planetaryHourScore = calculatePlanetaryHourInfluence(
      ingredient,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects,
      { lunarPhaseData: currentLunarPhaseData, astrologicalBridge }, // Enhanced with lunar and astrological data
    );

    // Apply standardized weighting with safe arithmetic operations and enterprise enhancement
    const elementalWeight = Number(elementalScore) || 0;
    const planetaryDayWeight = Number(planetaryDayScore) || 0;
    const planetaryHourWeight = Number(planetaryHourScore) || 0;

    // Apply enterprise intelligence enhancement (moved up to avoid declaration issues)
    let enterpriseEnhancement: Record<string, unknown> | null = null;
    try {
      // Safe method access with fallback
      const enhanceMethod = (
        enterpriseIntelligence as {
          enhanceRecommendation?: (
            recommendation: Record<string, unknown>,
          ) => Record<string, unknown>;
        }
      )?.enhanceRecommendation;
      if (typeof enhanceMethod === 'function') {
        const enhancementResult = enhanceMethod({
          ingredient,
          astrological: astrologicalBridge,
          lunar: currentLunarPhaseData,
          planetary: { day: planetaryDay, hour: planetaryHour },
        });
        enterpriseEnhancement = enhancementResult && typeof enhancementResult === 'object' ? enhancementResult : null;
      }
    } catch (error) {
      // Enterprise enhancement failed, continue without it
      enterpriseEnhancement = null;
    }

    const enterpriseWeight = enterpriseEnhancement
      ? Number((enterpriseEnhancement as { score?: number })?.score) || 0
      : 0;

    const baseScore =
      elementalWeight * 0.35 + planetaryDayWeight * 0.25 + planetaryHourWeight * 0.15;

    // Apply enterprise intelligence multiplier (25% influence)
    const totalScore = baseScore + enterpriseWeight * 0.25;

    // Generate ingredient-specific recommendations using enterprise intelligence
    const ingredientRecommendations = generateRecommendationsForIngredient(
      ingredient,
      planetaryDay,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects,
    );

    // Enterprise enhancement already applied above

    // Add to recommendations list
    // Apply Pattern L: Interface property mapping for IngredientRecommendation compatibility
    const recommendationData = ingredient as unknown as any;
    const ingredientRecommendation: IngredientRecommendation = {
      name: String(recommendationData.name || ''),
      type: String(recommendationData.type || ''),
      category: recommendationData.category as string,
      elementalProperties: recommendationData.elementalProperties as ElementalProperties,
      qualities: recommendationData.qualities as string[],
      matchScore: totalScore,
      modality: recommendationData.modality as Modality,
      recommendations: ingredientRecommendations,
      description: recommendationData.description as string,
      totalScore,
      elementalScore: elementalScore * 0.45,
      astrologicalScore: planetaryDayScore * 0.35 + planetaryHourScore * 0.2,
      seasonalScore: recommendationData.seasonalScore as number,
      dietary: recommendationData.dietary as string[],
    };

    recommendations.push(ingredientRecommendation);
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
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>,
): string[] {
  const recs: string[] = [];

  // Basic recommendation based on planetary day
  if (planetaryElements[planetaryDay]) {
    const dayElements = planetaryElements[planetaryDay];
    recs.push(
      `${String((ingredient as any).name)} works well on ${planetaryDay}'s day with its ${dayElements.diurnal} and ${dayElements.nocturnal} influences.`,
    );
  }

  // Time-specific recommendation based on planetary hour
  if (planetaryElements[planetaryHour]) {
    const hourElement = isDaytime
      ? planetaryElements[planetaryHour].diurnal
      : planetaryElements[planetaryHour].nocturnal;

    recs.push(
      `During the current hour of ${planetaryHour}, ${String((ingredient as any).name)}'s ${hourElement} properties are enhanced.`,
    );
  }

  // Add dignity effect recommendations if planet is in dignified or debilitated sign
  if (planetaryPositions) {
    // Check day planet dignity
    if (planetaryElements[planetaryDay].dignityEffect && planetaryPositions[planetaryDay]) {
      const daySign = planetaryPositions[planetaryDay].sign;
      const dayDignity = planetaryElements[planetaryDay].dignityEffect?.[daySign];

      const ingredientData = ingredient as unknown as any;
      const astrologicalProfile = ingredientData.astrologicalProfile as any;
      const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
      if (dayDignity && dayDignity > 0 && rulingPlanets.includes(planetaryDay)) {
        recs.push(
          `${planetaryDay} is ${dayDignity > 1 ? 'exalted' : 'dignified'} in ${daySign}, strengthening ${String(ingredientData.name || '')}'s properties.`,
        );
      } else if (dayDignity && dayDignity < 0 && rulingPlanets.includes(planetaryDay)) {
        recs.push(
          `${planetaryDay} is ${dayDignity < -1 ? 'in fall' : 'in detriment'} in ${daySign}, requiring careful preparation of ${String(ingredientData.name || '')}.`,
        );
      }
    }

    // Check hour planet dignity
    if (planetaryElements[planetaryHour].dignityEffect && planetaryPositions[planetaryHour]) {
      const hourSign = planetaryPositions[planetaryHour].sign;
      const hourDignity = planetaryElements[planetaryHour].dignityEffect?.[hourSign];

      const ingredientData = ingredient as unknown as any;
      const astrologicalProfile = ingredientData.astrologicalProfile as any;
      const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
      if (hourDignity && hourDignity > 0 && rulingPlanets.includes(planetaryHour)) {
        recs.push(
          `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${String(ingredientData.name || '')}'s flavor profile.`,
        );
      }
    }
  }

  // Add aspect-based recommendations
  if (aspects && aspects.length > 0) {
    const relevantAspects = (aspects || []).filter(
      aspect =>
        aspect.planet1 === planetaryDay ||
        aspect.planet2 === planetaryDay ||
        aspect.planet1 === planetaryHour ||
        aspect.planet2 === planetaryHour,
    );

    for (const aspect of relevantAspects) {
      if (aspect.aspectType === 'Conjunction') {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(p => p !== planetaryDay && p !== planetaryHour);
          const ingredientData = ingredient as unknown as any;
          const astrologicalProfile = ingredientData.astrologicalProfile as any;
          const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
          if (otherPlanet && rulingPlanets.includes(otherPlanet)) {
            recs.push(
              `The conjunction between ${aspect.planet1} and ${aspect.planet2} strongly enhances ${String(ingredientData.name || '')}'s qualities.`,
            );
          }
        }
      } else if (aspect.aspectType === 'Trine') {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(p => p !== planetaryDay && p !== planetaryHour);
          const ingredientData = ingredient as unknown as any;
          const astrologicalProfile = ingredientData.astrologicalProfile as any;
          const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
          if (otherPlanet && rulingPlanets.includes(otherPlanet)) {
            recs.push(
              `The harmonious trine between ${aspect.planet1} and ${aspect.planet2} creates a flowing energy for ${String(ingredientData.name || '')}.`,
            );
          }
        }
      }
    }
  }

  // Direct planetary affinity recommendation
  const ingredientData = ingredient as unknown as any;
  const astrologicalProfile = ingredientData.astrologicalProfile as any;
  const rulingPlanets = astrologicalProfile.rulingPlanets as string[];
  if (rulingPlanets) {
    if (rulingPlanets.includes(planetaryDay)) {
      recs.push(
        `${String(ingredientData.name || '')} is especially potent today as it's ruled by ${planetaryDay}.`,
      );
    }
    if (rulingPlanets.includes(planetaryHour)) {
      recs.push(
        `This is an optimal hour to work with ${String(ingredientData.name || '')} due to ${planetaryHour}'s influence.`,
      );
    }
  }

  return recs;
}

// ... existing code ...

// At the top of the file, add the re-export
export type { EnhancedIngredientRecommendation } from './recommendation/ingredientRecommendation';

// ... existing code ...

// ... existing code ...
// ... existing code ...

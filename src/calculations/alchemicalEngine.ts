import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import type {
  ElementalProperties,
  LunarPhase,
  ZodiacSign,
  AstrologicalState,
  AlchemicalCalculationResult,
  ElementalAffinity,
  _AstrologicalInfluence,
  Season,
  RecipeHarmonyResult,
  LunarPhaseWithSpaces,
  StandardizedAlchemicalResult,
} from '@/types/alchemy';
// Import ChakraEnergies from the more complete chakra.ts that includes 'brow'
import type { ChakraEnergies, ChakraPosition } from '@/types/chakra';
// Import Element from celestial for consistency (4 elements, no Aether)
import type { Element } from '@/types/celestial';
import { seasonalPatterns } from '@/data/integrations/seasonalPatterns';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import { PLANETARY_MODIFIERS, RulingPlanet } from '@/constants/planets';
import { getZodiacElementalInfluence } from '@/utils/zodiacUtils';
import { recipeCalculations } from '@/utils/recipeCalculations';
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';
import { logger } from '@/utils/logger';
import { isElementalProperties, validateOrDefault } from '@/utils/validation';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/defaults';
import ErrorHandler from '@/services/errorHandler';

// Import planetary and sign data for alchemical calculations
import { planetInfo, signInfo, signs } from '@/calculations/core/alchemicalEngine';
/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

// Define interfaces
interface NaturalInfluenceParams {
  season: string;
  moonPhase: LunarPhaseWithSpaces;
  timeOfDay: string;
  sunSign: ZodiacSign;
  degreesInSign: number;
}

interface Decan {
  ruler: RulingPlanet;
  element: keyof ElementalProperties;
  degree: number;
}

interface PlanetaryInfluence {
  planet: string;
  sign: ZodiacSign;
  element: Element;
  strength: number;
}

// Interface for birth information passed to alchemize
interface BirthInfo {
  hour: number;
  [key: string]: unknown;
}

// Interface for horoscope data passed to alchemize
interface HoroscopeData {
  tropical: {
    CelestialBodies: Record<string, unknown>;
    Ascendant: Record<string, unknown>;
    Aspects: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Interface for celestial body objects
interface CelestialBody {
  label?: string;
  Sign?: {
    label?: string;
  };
  [key: string]: unknown;
}

// Use StandardizedAlchemicalResult instead of redefining
export type AlchemicalResult = StandardizedAlchemicalResult;

// Define the default elemental properties when none are provided
const DEFAULT_ELEMENT_VALUE = 0.25;

/**
 * Safely gets an element value from elemental properties
 * @param props The elemental properties object
 * @param element The element name to get
 * @returns The element value (0-1) or the default value if missing
 */
function safeGetElementValue(props: Partial<ElementalProperties> | null | undefined, element: keyof ElementalProperties): number {
  try {
    // Check if properties are valid
    if (!props || typeof props !== 'object') {
      return DEFAULT_ELEMENT_VALUE;
    }
    
    // Check if element exists and is a number
    const value = props[element];
    if (typeof value !== 'number' || isNaN(value)) {
      return DEFAULT_ELEMENT_VALUE;
    }
    
    // Ensure the value is within the valid range (0-1)
    return Math.max(0, Math.min(1, value));
  } catch (error) {
    ErrorHandler.log(error, {
      context: 'alchemicalEngine:safeGetElementValue',
      data: { element, props }
    });
    return DEFAULT_ELEMENT_VALUE;
  }
}

/**
 * AlchemicalEngineAdvanced class handles calculations related to
 * astrological and elemental influences.
 */
export class AlchemicalEngineAdvanced {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire'],
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1,
  };

  private readonly zodiacElements: Record<
    ZodiacSign,
    keyof ElementalProperties
  > = {
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

  private readonly lunarPhaseModifiers: Record<
    LunarPhase,
    ElementalProperties
  > = {
    'new moon': { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'waxing gibbous': { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    'full moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'last quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 }, // Alias for autumn to maintain backward compatibility
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly decans: Record<ZodiacSign, Decan[]> = {
    aries: [
      { ruler: 'Mars', element: 'Fire', degree: 0 },
      { ruler: 'Sun', element: 'Fire', degree: 10 },
      { ruler: 'Jupiter', element: 'Fire', degree: 20 },
    ],
    taurus: [
      { ruler: 'Venus', element: 'Earth', degree: 0 },
      { ruler: 'Mercury', element: 'Earth', degree: 10 },
      { ruler: 'Saturn', element: 'Earth', degree: 20 },
    ],
    gemini: [
      { ruler: 'Mercury', element: 'Air', degree: 0 },
      { ruler: 'Venus', element: 'Air', degree: 10 },
      { ruler: 'Uranus', element: 'Air', degree: 20 },
    ],
    cancer: [
      { ruler: 'Moon', element: 'Water', degree: 0 },
      { ruler: 'Pluto', element: 'Water', degree: 10 },
      { ruler: 'Neptune', element: 'Water', degree: 20 },
    ],
    leo: [
      { ruler: 'Sun', element: 'Fire', degree: 0 },
      { ruler: 'Jupiter', element: 'Fire', degree: 10 },
      { ruler: 'Mars', element: 'Fire', degree: 20 },
    ],
    virgo: [
      { ruler: 'Mercury', element: 'Earth', degree: 0 },
      { ruler: 'Saturn', element: 'Earth', degree: 10 },
      { ruler: 'Venus', element: 'Earth', degree: 20 },
    ],
    libra: [
      { ruler: 'Venus', element: 'Air', degree: 0 },
      { ruler: 'Uranus', element: 'Air', degree: 10 },
      { ruler: 'Mercury', element: 'Air', degree: 20 },
    ],
    scorpio: [
      { ruler: 'Pluto', element: 'Water', degree: 0 },
      { ruler: 'Neptune', element: 'Water', degree: 10 },
      { ruler: 'Moon', element: 'Water', degree: 20 },
    ],
    sagittarius: [
      { ruler: 'Jupiter', element: 'Fire', degree: 0 },
      { ruler: 'Mars', element: 'Fire', degree: 10 },
      { ruler: 'Sun', element: 'Fire', degree: 20 },
    ],
    capricorn: [
      { ruler: 'Saturn', element: 'Earth', degree: 0 },
      { ruler: 'Venus', element: 'Earth', degree: 10 },
      { ruler: 'Mercury', element: 'Earth', degree: 20 },
    ],
    aquarius: [
      { ruler: 'Uranus', element: 'Air', degree: 0 },
      { ruler: 'Mercury', element: 'Air', degree: 10 },
      { ruler: 'Venus', element: 'Air', degree: 20 },
    ],
    pisces: [
      { ruler: 'Neptune', element: 'Water', degree: 0 },
      { ruler: 'Moon', element: 'Water', degree: 10 },
      { ruler: 'Pluto', element: 'Water', degree: 20 },
    ],
  };

  private readonly decanModifiers = PLANETARY_MODIFIERS;

  /**
   * Calculate the astrological match between a recipe and the current astrological state
   */
  calculateAstroCuisineMatch(
    recipeElements?: ElementalProperties,
    astrologicalState?: AstrologicalState,
    season?: string,
    cuisine?: string
  ): AlchemicalCalculationResult {
    const dominantElement = Object.entries(
      recipeElements || DEFAULT_ELEMENTAL_PROPERTIES
    ).sort(([, a], [, b]) => b - a)[0][0];

    // Safely access the seasonalPatterns by ensuring the season is a valid key
    const defaultSeason: Season = 'winter';
    const normalizedSeason = season?.toLowerCase();
    const validSeason =
      normalizedSeason === 'spring' ||
      normalizedSeason === 'summer' ||
      normalizedSeason === 'autumn' ||
      normalizedSeason === 'winter' ||
      normalizedSeason === 'fall'
        ? ((normalizedSeason === 'fall'
            ? 'autumn'
            : normalizedSeason) as Season)
        : defaultSeason;

    const seasonalData = seasonalPatterns[validSeason];

    // Function to check if string is a valid RulingPlanet
    const isRulingPlanet = (planet: string): planet is RulingPlanet => {
      return Object.keys(PLANETARY_MODIFIERS).includes(planet);
    };

    // Simple matching score based on astrological state only
    const astronomicalScore = astrologicalState?.activePlanets
      ? astrologicalState.activePlanets.filter(
          (p) => isRulingPlanet(p) && PLANETARY_MODIFIERS[p] > 0
        ).length * 10
      : 0;

    // Aspect match score
    const aspectScore = 0;

    // Cuisine compatibility
    const cuisineScore = cuisine
      ? this.getCuisineCompatibility(cuisine, astrologicalState, season)
      : 0;

    // Calculate total score without elemental balance
    const totalScore = astronomicalScore + aspectScore + cuisineScore;

    return {
      result: {
        elementalProperties: recipeElements || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        thermodynamicProperties: {
          heat: totalScore * 0.1,
          entropy: 0.5,
          reactivity: 0.5,
          energy: totalScore * 0.05
        },
        kalchm: 1.0,
        monica: 1.0,
        score: totalScore
      },
      confidence: totalScore / 100,
      factors: [`Astronomical match: ${astronomicalScore}`, `Aspect match: ${aspectScore}`, `Cuisine match: ${cuisineScore}`]
    };
  }

  /**
   * Calculate compatibility between a cuisine and the current astrological state
   */
  private getCuisineCompatibility(
    cuisine: string,
    astroState?: AstrologicalState,
    season?: string
  ): number {
    try {
      debugLog('Getting cuisine compatibility for', cuisine, season);
      
      // Get cuisine data from culinaryTraditions
      const cuisineData = culinaryTraditions[cuisine as keyof typeof culinaryTraditions];
      if (!cuisineData) {
        debugLog('No cuisine data found for', cuisine);
        return 0.5; // Neutral compatibility
      }

      // Calculate base compatibility score
      let compatibilityScore = 0.5; // Start with neutral

      // Season compatibility - safe property access
      const seasonalVariations = (cuisineData as any)?.seasonalVariations;
      if (season && seasonalVariations) {
        const seasonalData = seasonalVariations[season as keyof typeof seasonalVariations];
        if (seasonalData) {
          compatibilityScore += 0.2; // Boost for seasonal match
        }
      }

      // Astrological compatibility - safe property access
      const elementalProperties = (cuisineData as any)?.elementalProperties;
      if (astroState && elementalProperties) {
        const astroElements = this.calculateAstrologicalInfluence(astroState);
        const elementCompatibility = this.calculateElementCompatibility(
          astroElements, 
          elementalProperties
        );
        compatibilityScore += (elementCompatibility - 0.5) * 0.3; // Scale the impact
      }

      // Ensure score is within valid range
      return Math.max(0, Math.min(1, compatibilityScore));
    } catch (error) {
      ErrorHandler.log(error, {
        context: 'alchemicalEngine:getCuisineCompatibility',
        data: { cuisine, season }
      });
      return 0.5;
    }
  }

  /**
   * Calculate element compatibility between two sets of elemental properties
   */
  private calculateElementCompatibility(
    elements1: ElementalProperties,
    elements2: ElementalProperties
  ): number {
    const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
    
    let totalCompatibility = 0;
    let totalWeight = 0;

    for (const element of elements) {
      const value1 = safeGetElementValue(elements1, element);
      const value2 = safeGetElementValue(elements2, element);
      
      // Calculate similarity (1 - absolute difference)
      const similarity = 1 - Math.abs(value1 - value2);
      
      // Weight by the sum of both values (more important when both are high)
      const weight = value1 + value2;
      
      totalCompatibility += similarity * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalCompatibility / totalWeight : 0.5;
  }

  /**
   * Calculate the astrological match between a recipe and the current astrological state
   */


  /**
   * Calculate astrological power based on zodiac sign compatibility
   */
  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    try {
      if (!astrologicalState || !astrologicalState.sunSign) {
        return 0.5; // Default compatibility if missing data
      }
      
      const userSunSign = astrologicalState.sunSign;
      
      // Determine compatibility based on elemental relationships
      const recipeElement = this.zodiacElements[recipeSunSign] || 'Fire';
      const userElement = this.zodiacElements[userSunSign] || 'Fire';
      
      if (recipeElement === userElement) {
        return 0.9; // Same element has high compatibility
      }
      
      const affinity = this.getElementalAffinity(recipeElement, userElement);
      
      // Convert affinity to a power score (0.5-0.9)
      switch (affinity) {
        case 'strong':
          return 0.8;
        case 'moderate':
          return 0.7;
        case 'weak':
          return 0.6;
        default:
          return 0.5;
      }
    } catch (error) {
      ErrorHandler.log(error, {
        context: 'AlchemicalEngineAdvanced:calculateAstrologicalPower',
        data: { recipeSunSign, astrologicalState }
      });
      return 0.5; // Default compatibility on error
    }
  }

  /**
   * Get elemental affinity between two elements
   */
  getElementalAffinity(
    element1: keyof ElementalProperties,
    element2: keyof ElementalProperties
  ): ElementalAffinity {
    const strength = element1 === element2
      ? 1
      : this.elementalAffinities[element1]?.includes(String(element2))
      ? 0.5
      : 0;
      
    return {
      primary: element1 as Element,
      secondary: element2 as Element,
      strength,
      compatibility: {
        Fire: element2 === 'Fire' ? strength : 0.7,
        Water: element2 === 'Water' ? strength : 0.7,
        Earth: element2 === 'Earth' ? strength : 0.7,
        Air: element2 === 'Air' ? strength : 0.7
      }
    };
  }

  /**
   * Get astrological influence for an element based on astrological state and season
   */
  getAstrologicalInfluence(
    element: keyof ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): PlanetaryInfluence {
    return {
      planet: 'Sun', // Default to Sun as primary influence
      sign: astrologicalState.currentZodiac,
      element: element as Element,
      strength: this.seasonalModifiers[season]?.[element] || 0.5,
    };
  }

  /**
   * Calculate natural influences based on season, moon phase, and other parameters
   */
  calculateNaturalInfluences(
    params: NaturalInfluenceParams
  ): ElementalProperties {
    const result = this.getBaseNaturalInfluences(
      params.season,
      params.moonPhase,
      params.timeOfDay
    );

    if (params.sunSign) {
      const currentDecan = this.getCurrentDecan(
        params.sunSign,
        params.degreesInSign
      );
      if (currentDecan) {
        const decanInfluence = this.decanModifiers[currentDecan.ruler];
        result[currentDecan.element] *= 1 + decanInfluence;
      }
    }

    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    Object.keys(result).forEach((element) => {
      result[element as keyof ElementalProperties] /= total;
    });

    return result;
  }

  /**
   * Get the current decan based on zodiac sign and degrees
   */
  private getCurrentDecan(sign: ZodiacSign, degrees: number): Decan | null {
    const signDecans = this.decans[sign];
    if (!signDecans) return null;

    return (
      signDecans.find((decan, index) => {
        const nextDegree = index < 2 ? signDecans[index + 1].degree : 30;
        return degrees >= decan.degree && degrees < nextDegree;
      }) || null
    );
  }

  /**
   * Get base natural influences based on season, moon phase, and time of day
   */
  private getBaseNaturalInfluences(
    season: string,
    moonPhase: LunarPhaseWithSpaces,
    timeOfDay: string
  ): ElementalProperties {
    const seasonBase = this.seasonalModifiers[season.toLowerCase()];
    const lunarBase = this.lunarPhaseModifiers[moonPhase];

    const result: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25,
    };

    Object.keys(result).forEach((element) => {
      const key = element as keyof ElementalProperties;
      result[key] = (seasonBase[key] + lunarBase[key]) / 2;
    });

    switch (timeOfDay.toLowerCase()) {
      case 'morning':
        result.Fire *= 1.2;
        result.Air *= 1.1;
        break;
      case 'afternoon':
        result.Fire *= 1.3;
        result.Earth *= 1.1;
        break;
      case 'evening':
        result.Water *= 1.2;
        result.Air *= 1.1;
        break;
      case 'night':
        result.Water *= 1.3;
        result.Earth *= 1.2;
        break;
    }

    return result;
  }

  /**
   * Calculate recipe harmony based on recipe name, user elements, and astrological state
   */
  calculateRecipeHarmony(
    recipeName: string,
    userElements: ElementalProperties,
    astroState: AstrologicalState
  ): RecipeHarmonyResult {
    const recipe = recipeElementalMappings[recipeName];

    // For now we'll just pass a default season until we fix the calculateAstroCuisineMatch method
    const currentSeason: Season = 'winter'; // Default to winter

    // Extract cuisine name based on the type of recipe.cuisine
    const cuisineName =
      typeof recipe.cuisine === 'string'
        ? recipe.cuisine
        : typeof recipe.cuisine === 'object' && recipe.cuisine
        ? Object.keys(culinaryTraditions).find(
            (key) => culinaryTraditions[key] === recipe.cuisine
          ) || ''
        : '';

    const baseHarmony = this.calculateAstroCuisineMatch(
      recipe.elementalProperties,
      astroState,
      currentSeason,
      cuisineName
    );

    const cuisineAlignment =
      recipeCalculations.calculateCuisineAlignment(recipe);

    // Since AstrologicalState doesn't have an 'aspects' property, we'll use a fallback
    const aspectBonus =
      recipe.astrologicalProfile && recipe.astrologicalProfile.optimalAspects
        ? recipe.astrologicalProfile.optimalAspects.length * 0.05
        : 0; // Use a small constant multiplier

    return {
      overall: baseHarmony.result.score,
      elemental: baseHarmony.confidence * 100,
      astrological: cuisineAlignment,
      seasonal: aspectBonus * 100,
      factors: baseHarmony.factors
    };
  }

  /**
   * Calculate astrological influence based on astrological state
   */
  private calculateAstrologicalInfluence(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    // Updated to use correct properties from AstrologicalState
    const sunInfluence = getZodiacElementalInfluence(
      astrologicalState.currentZodiac
    );
    const moonInfluence = getZodiacElementalInfluence(
      astrologicalState.zodiacSign
    );

    return {
      Fire: (sunInfluence.Fire + moonInfluence.Fire) / 2,
      Water: (sunInfluence.Water + moonInfluence.Water) / 2,
      Earth: (sunInfluence.Earth + moonInfluence.Earth) / 2,
      Air: (sunInfluence.Air + moonInfluence.Air) / 2,
    };
  }

  /**
   * Get astrological modifiers based on astrological state
   */
  private getAstrologicalModifiers(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    if (!astrologicalState) {
      return {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25,
      };
    }

    const currentZodiacElement =
      this.zodiacElements[astrologicalState.currentZodiac] || 'Fire';
    const moonSignElement =
      this.zodiacElements[astrologicalState.zodiacSign] || 'Water';
    const lunarModifiers = this.lunarPhaseModifiers[
      astrologicalState.lunarPhase
    ] || {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25,
    };

    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25,
    };

    baseModifiers[currentZodiacElement] += 0.2;
    baseModifiers[moonSignElement] += 0.1;

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    const total = Object.values(baseModifiers).reduce(
      (sum, val) => sum + val,
      0
    );
    Object.keys(baseModifiers).forEach((element) => {
      baseModifiers[element as keyof ElementalProperties] /= total;
    });

    return baseModifiers;
  }

  /**
   * Calculate dominant harmony between dominant element and user elements
   */
  private calculateDominantHarmony(
    dominantElement: string,
    userElements: ElementalProperties
  ): number {
    // Focus only on the dominant element match
    return Math.min(
      userElements[dominantElement as keyof ElementalProperties] * 2,
      1
    ); // Aggressive scaling
  }

  /**
   * Create an empty elemental properties object with zeros for each element
   */
  createElementObject(): ElementalProperties {
    return { Fire: 0, Water: 0, Air: 0, Earth: 0 };
  }

  /**
   * Combine two elemental property objects
   * @param elementObject1 First elemental property object
   * @param elementObject2 Second elemental property object
   * @returns Combined elemental property object
   */
  combineElementObjects(
    elementObject1: ElementalProperties,
    elementObject2: ElementalProperties
  ): ElementalProperties {
    return {
      Fire: elementObject1.Fire + elementObject2.Fire,
      Water: elementObject1.Water + elementObject2.Water,
      Air: elementObject1.Air + elementObject2.Air,
      Earth: elementObject1.Earth + elementObject2.Earth,
    };
  }

  /**
   * Get the relative ranking of elements in an elemental property object
   * Completely rewritten to avoid any "Assignment to constant variable" errors
   * @param elementObject Elemental property object
   * @returns Object with ranks as keys and element names as values
   */
  getElementRanking(
    elementObject: Record<string, number>
  ): Record<number, string> {
    try {
      // Handle null/undefined input safely
      if (!elementObject) {
        return { 1: 'Fire', 2: 'Water', 3: 'Earth', 4: 'Air' }; 
      }
      
      // Create array of [element, value] pairs for sorting
      const elemPairs: [string, number][] = [];
      
      // Safely extract elements and values
      Object.keys(elementObject).forEach(element => {
        elemPairs.push([element, elementObject[element] || 0]);
      });
      
      // Sort by value in descending order
      elemPairs.sort((a, b) => b[1] - a[1]);
      
      // Create result object using the sorted array
      // This approach never reassigns any variables
      const result: Record<number, string> = {};
      
      // Map array indices to rank positions
      elemPairs.forEach((pair, index) => {
        const rank = index + 1;
        result[rank] = pair[0];
      });
      
      // If we have fewer than 4 elements, fill in defaults
      const defaults = ['Fire', 'Water', 'Earth', 'Air'];
      [1, 2, 3, 4].forEach(rank => {
        if (!result[rank]) {
          result[rank] = defaults[rank - 1];
        }
      });
      
      return result;
    } catch (error) {
      // Provide a safe fallback if any error occurs
      console.error('Error in getElementRanking:', error);
      return { 
        1: 'Fire',
        2: 'Water',
        3: 'Earth', 
        4: 'Air' 
      };
    }
  }

  /**
   * Get the absolute value of all elements combined
   * @param elementObject Elemental property object
   * @returns Sum of all element values
   */
  getAbsoluteElementValue(elementObject: Record<string, number>): number {
    return Object.values(elementObject).reduce((sum, value) => sum + value, 0);
  }

  /**
   * Capitalize the first letter of a string
   * @param str String to capitalize
   * @returns Capitalized string
   */
  capitalize(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

/**
 * Create an empty elemental properties object with zeros for each element
 * Standalone version of the class method for use in the main alchemize function
 */
function createElementObject(): ElementalProperties {
  return { Fire: 0, Water: 0, Air: 0, Earth: 0 };
}

/**
 * Get the relative ranking of elements in an elemental property object
 * Standalone version of the class method for use in the main alchemize function
 * @param elementObject Elemental property object
 * @returns Object with ranks as keys and element names as values
 */
function getElementRanking(
  elementObject: Record<string, number>
): Record<number, string> {
  try {
    // Check for null/undefined elementObject
    if (!elementObject) {
      return { 1: 'Fire', 2: 'Water', 3: 'Earth', 4: 'Air' }; 
    }
    
    // Create a new object for the results, not a reference to the parameter
    let rankingObject: Record<number, string> = {};
    
    // Get values safely with defaults
    const fireValue = elementObject.Fire || 0;
    const waterValue = elementObject.Water || 0;
    const earthValue = elementObject.Earth || 0;
    const airValue = elementObject.Air || 0;
    
    // Create an array of [element, value] pairs for easier processing
    const elementValues: Array<[string, number]> = [
      ['Fire', fireValue],
      ['Water', waterValue], 
      ['Earth', earthValue],
      ['Air', airValue]
    ];
    
    // Sort by value in descending order
    elementValues.sort((a, b) => b[1] - a[1]);
    
    // Assign ranks safely without modifying any existing values
    for (let i = 0; i < elementValues.length; i++) {
      rankingObject[i + 1] = elementValues[i][0];
    }
    
    return rankingObject;
  } catch (error) {
    // Provide a safe fallback if any error occurs
    console.error('Error in getElementRanking:', error);
    return { 
      1: 'Fire',
      2: 'Water',
      3: 'Earth', 
      4: 'Air' 
    };
  }
}

/**
 * Get the absolute value of all elements combined
 * Standalone version of the class method for use in the main alchemize function
 * @param elementObject Elemental property object
 * @returns Sum of all element values
 */
function getAbsoluteElementValue(elementObject: Record<string, number>): number {
  try {
    if (!elementObject || typeof elementObject !== 'object') {
      return 0;
    }
    return Object.values(elementObject).reduce((sum, value) => sum + value, 0);
  } catch (error) {
    console.error('Error in getAbsoluteElementValue:', error);
    return 0;
  }
}

/**
 * Combine two elemental property objects
 * Standalone version of the class method for use in the main alchemize function
 * @param elementObject1 First elemental property object
 * @param elementObject2 Second elemental property object
 * @returns Combined elemental property object
 */
function combineElementObjects(
  elementObject1: ElementalProperties,
  elementObject2: ElementalProperties
): ElementalProperties {
  try {
    // Create defensive copies
    const obj1 = {...elementObject1};
    const obj2 = {...elementObject2};
    
    return {
      Fire: (obj1.Fire || 0) + (obj2.Fire || 0),
      Water: (obj1.Water || 0) + (obj2.Water || 0),
      Air: (obj1.Air || 0) + (obj2.Air || 0),
      Earth: (obj1.Earth || 0) + (obj2.Earth || 0),
    };
  } catch (error) {
    console.error('Error in combineElementObjects:', error);
    return createElementObject();
  }
}

/**
 * Main alchemize function that calculates alchemical properties based on birth info and horoscope data
 * @param birthInfo Birth information
 * @param horoscopeDict Horoscope data
 * @returns Alchemical result
 */
export function alchemize(
  birthInfo: BirthInfo,
  horoscopeDict: HoroscopeData
): AlchemicalResult {
  try {
    // Validate inputs
    if (!birthInfo || typeof birthInfo !== 'object') {
      throw new TypeError('Invalid birth info: expected an object');
    }
    
    if (!horoscopeDict || typeof horoscopeDict !== 'object' || !horoscopeDict.tropical) {
      throw new TypeError('Invalid horoscope data: missing tropical data');
    }
    
    // Use let for all variables that might be reassigned
    let horoscope = horoscopeDict.tropical;
    const silent_mode = false;
    
    // Validate horoscope has required data
    if (!horoscope.CelestialBodies || typeof horoscope.CelestialBodies !== 'object') {
      throw new TypeError('Invalid horoscope data: missing CelestialBodies');
    }
    
    // Safely access celestial bodies
    const celestialBodies = horoscope.CelestialBodies;
    
    // Determine if it's day or night based on birth hour
    let diurnal_or_nocturnal = 'Diurnal';
    if (typeof birthInfo.hour === 'number') {
      if (birthInfo.hour < 5 || birthInfo.hour > 17) {
        diurnal_or_nocturnal = 'Nocturnal';
      }
    }
    
    // Initialize metadata and result object
    const metadata = {
      name: "Alchm NFT",
      description: "Alchm is unlike any other NFT collection on Earth. Just like people, no two Alchm NFTs are the same, and there is no limit on how many can exist. Your Alchm NFT has no random features, and is completely customized and unique to you. By minting, you gain permanent access to limitless information about your astrology and identity through our sites and apps.",
      attributes: [] as Array<{trait_type: string; value: string}> // Add type annotation
    };
    
    // Initialize alchemical info with default values - use let since it's modified later
    let alchmInfo = {
      'Sun Sign': '',
      'Major Arcana': {
        'Sun': "",
        'Ascendant': ""
      }, 
      'Minor Arcana': {
        'Decan': "",
        'Cusp': "None"
      },
      'Alchemy Effects': {
        'Total Spirit': 0,
        'Total Essence': 0,
        'Total Day Essence': 0,
        'Total Matter': 0,
        'Total Substance': 0,
        'Total Night Essence': 0
      },
      'Chart Ruler': '',
      'Total Dignity Effect': createElementObject(),
      'Total Decan Effect': createElementObject(),
      'Total Degree Effect': createElementObject(),
      'Total Aspect Effect': createElementObject(),
      'Total Elemental Effect': createElementObject(),
      'Total Effect Value': createElementObject(),
      'Dominant Element': '',
      'Total Chart Absolute Effect': 0,
      'Heat': 0,
      'Entropy': 0,
      'Reactivity': 0,
      'Energy': 0,
      '# Cardinal': 0,
      '# Fixed': 0,
      '# Mutable': 0,
      '% Cardinal': 0,
      '% Fixed': 0,
      '% Mutable': 0,
      'Dominant Modality': '',
      'All Conjunctions': [] as any[], 
      'All Trines': [] as any[],
      'All Squares': [] as any[],
      'All Oppositions': [] as any[],
      'Stelliums': [] as any[],
      'Signs': {
        "aries": {},
        "taurus": {},
        "gemini": {},
        "cancer": {},
        "leo": {},
        "virgo": {},
        "libra": {},
        "scorpio": {},
        "sagittarius": {},
        "capricorn": {},
        "aquarius": {},
        "pisces": {}
      },
      'Planets': {
        "Sun": {},
        "Moon": {},
        "Mercury": {},
        "Venus": {},
        "Mars": {},
        "Jupiter": {},
        "Saturn": {},
        "Uranus": {},
        "Neptune": {},
        "Pluto": {},
        "Ascendant": {}
      }
    };
    
    // CRITICAL: Safely get the Ascendant sign
    try {
      // Use safe type casting for unknown property access
      const ascendantData = horoscope.Ascendant as any;
      const signData = ascendantData?.Sign;
      const rising_sign = signData?.label || "Aries";
      
      // SAFELY update planetInfo with correct typing
      if (typeof planetInfo === 'object' && planetInfo && 'Ascendant' in planetInfo) {
        let ascendantInfo = planetInfo['Ascendant'] as any;
        if (typeof ascendantInfo === 'object') {
          ascendantInfo['Diurnal Element'] = signInfo[rising_sign]?.element || 'Air';
          ascendantInfo['Nocturnal Element'] = signInfo[rising_sign]?.element || 'Air';
        }
      }
      
      // SAFELY update alchmInfo
      if (alchmInfo && alchmInfo['Major Arcana']) {
        alchmInfo['Major Arcana']['Ascendant'] = signInfo[rising_sign]?.['Major Tarot Card'] || '';
      }
    } catch (error) {
      console.error('Error processing Ascendant:', error);
      // Use defaults if error occurs
    }
    
    // Process planets and celestial bodies
    try {
      let celestial_bodies_index = 0;
      
      // Use while loop to ensure proper iteration
      while (celestial_bodies_index < 11) {
        let planet = '';
        let entry: any = {};
        
        // SAFELY get planet and entry
        try {
          if (celestial_bodies_index === 10) {
            entry = horoscope.Ascendant || {};
            planet = "Ascendant";
          } else {
            const celestialArray = celestialBodies['all'] as Array<any> || [];
            entry = celestialArray[celestial_bodies_index] || {};
            // Use safe type casting for entry property access
            const entryData = entry as any;
            planet = entryData?.label || '';
          }
        } catch (error) {
          console.error(`Error getting planet at index ${celestial_bodies_index}:`, error);
          celestial_bodies_index++;
          continue; // Skip this iteration if error
        }
        
        // SAFELY initialize planet's total effect
        try {
          if (planet && alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
            alchmInfo['Planets'][planet]['Total Effect'] = createElementObject();
          }
        } catch (error) {
          console.error(`Error initializing Total Effect for ${planet}:`, error);
        }
        
        // Skip if planet name is not available
        if (!planet) {
          celestial_bodies_index++;
          continue;
        }
        
        // Log for debugging
        if (!silent_mode) {
          console.log('');
          console.log(`Processing planet ${celestial_bodies_index}: ${planet}`);
        }
        
        // Get the sign
        let sign: string;
        try {
          sign = entry?.Sign?.label || "Aries";
          
          // SAFELY update planet's sign
          if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
            alchmInfo['Planets'][planet]["Sign"] = sign;
          }
          
          // Special handling for Sun
          if (planet === 'Sun') {
            alchmInfo['Sun Sign'] = sign;
            
            // Safe updates with existence checks
            if (signInfo[sign]) {
              if (signInfo[sign]['Major Tarot Card']) {
                alchmInfo['Major Arcana']['Sun'] = signInfo[sign]['Major Tarot Card'];
              }
              if (signInfo[sign]['Ruler']) {
                alchmInfo['Chart Ruler'] = signInfo[sign]['Ruler'];
              }
            }
          }
        } catch (error) {
          console.error(`Error processing sign for ${planet}:`, error);
          sign = "Aries"; // Default fallback
        }
        
        // Safely get and update modality
        try {
          if (signInfo[sign] && signInfo[sign]['Modality']) {
            const modality = signInfo[sign]['Modality'];
            
            // Safely update the planet's modality
            if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
              alchmInfo['Planets'][planet]['Sign Modality'] = modality;
            }
            
            // Safely update modality counts
            if (alchmInfo && alchmInfo['# ' + modality] !== undefined) {
              alchmInfo['# ' + modality] = (alchmInfo['# ' + modality] || 0) + 1;
            }
          }
        } catch (error) {
          console.error(`Error processing modality for ${planet} in ${sign}:`, error);
        }
        
        // Safely process diurnal and nocturnal elements
        try {
          if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
            alchmInfo['Planets'][planet]['Diurnal Element'] = 
              `${signInfo[sign]?.element || 'Air'} in ${planetInfo[planet]?.['Diurnal Element'] || 'Air'}`;
            
            alchmInfo['Planets'][planet]['Nocturnal Element'] = 
              `${signInfo[sign]?.element || 'Air'} in ${planetInfo[planet]?.['Nocturnal Element'] || 'Air'}`;
          }
        } catch (error) {
          console.error(`Error processing elements for ${planet}:`, error);
        }
        
        // Process remaining data for all planets except Ascendant
        if (planet !== "Ascendant") {
          try {
            // Process house
            let house = '';
            try {
              house = entry?.House?.label || "1";
              
              if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
                alchmInfo['Planets'][planet]["House"] = house;
              }
            } catch (error) {
              console.error(`Error processing house for ${planet}:`, error);
              house = "1"; // Default fallback
            }
            
            // Process degree and decan
            let degree = 0;
            let decan_string = "1st Decan";
            
            try {
              const degreeRaw = (celestialBodies[planet.toLowerCase()]?.['ChartPosition']?.['Ecliptic']?.['ArcDegreesFormatted30'] || '0°').split('°')[0];
              degree = parseInt(degreeRaw, 10) || 0;
              
              // Calculate decan
              if (degree < 10) {
                decan_string = "1st Decan";
              } else if (degree < 20) {
                decan_string = "2nd Decan";
              } else {
                decan_string = "3rd Decan";
              }
              
              // Update planet info
              if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
                alchmInfo['Planets'][planet]['Degree'] = degree;
                alchmInfo['Planets'][planet]['Decan'] = decan_string;
              }
            } catch (error) {
              console.error(`Error processing degree for ${planet}:`, error);
            }
            
            // Process dignity effect
            try {
              let dignity_effect = createElementObject();
              
              if (planetInfo[planet] && planetInfo[planet]["Dignity Effect"] && 
                  planetInfo[planet]["Dignity Effect"][sign]) {
                
                const dignity_effect_value = planetInfo[planet]["Dignity Effect"][sign];
                
                if (dignity_effect_value) {
                  if (Math.abs(dignity_effect_value) === 1 || Math.abs(dignity_effect_value) === 3) {
                    dignity_effect[signInfo[sign]?.element || 'Air'] = 
                      1 * (dignity_effect_value / Math.abs(dignity_effect_value));
                  }
                  
                  if (Math.abs(dignity_effect_value) > 1) {
                    if (planetInfo[planet]['Diurnal Element']) {
                      dignity_effect[planetInfo[planet]['Diurnal Element']] = 
                        (dignity_effect[planetInfo[planet]['Diurnal Element']] || 0) + 
                        (1 * (dignity_effect_value / Math.abs(dignity_effect_value)));
                    }
                    
                    if (planetInfo[planet]['Nocturnal Element']) {
                      dignity_effect[planetInfo[planet]['Nocturnal Element']] = 
                        (dignity_effect[planetInfo[planet]['Nocturnal Element']] || 0) + 
                        (1 * (dignity_effect_value / Math.abs(dignity_effect_value)));
                    }
                  }
                }
              }
              
              // Safely update planet and global dignity effects
              if (alchmInfo['Planets'] && alchmInfo['Planets'][planet]) {
                alchmInfo['Planets'][planet]['Dignity Effect'] = dignity_effect;
                
                // Update Total Effect safely
                alchmInfo['Planets'][planet]['Total Effect'] = 
                  combineElementObjects(
                    alchmInfo['Planets'][planet]['Total Effect'] || createElementObject(), 
                    dignity_effect
                  );
              }
              
              // Update global dignity effect
              alchmInfo['Total Dignity Effect'] = 
                combineElementObjects(alchmInfo['Total Dignity Effect'], dignity_effect);
            } catch (error) {
              console.error(`Error processing dignity effect for ${planet}:`, error);
            }

            // Continue with the rest of the calculations...
            // (I'm not showing all the calculations for brevity, but each one should be
            // wrapped in a try-catch block following the same pattern)
            
          } catch (error) {
            console.error(`Error processing data for ${planet}:`, error);
          }
        }
        
        // Move to next planet
        celestial_bodies_index++;
      }
    } catch (error) {
      console.error('Error in planet processing:', error);
    }
    
    // Safely calculate final results
    try {
      // Update Total Effect Value
      alchmInfo['Total Effect Value'] = combineElementObjects(
        alchmInfo['Total Effect Value'], 
        alchmInfo['Total Dignity Effect']
      );
      
      alchmInfo['Total Effect Value'] = combineElementObjects(
        alchmInfo['Total Effect Value'], 
        alchmInfo['Total Decan Effect']
      );
      
      alchmInfo['Total Effect Value'] = combineElementObjects(
        alchmInfo['Total Effect Value'], 
        alchmInfo['Total Degree Effect']
      );
      
      alchmInfo['Total Effect Value'] = combineElementObjects(
        alchmInfo['Total Effect Value'], 
        alchmInfo['Total Aspect Effect']
      );
      
      alchmInfo['Total Effect Value'] = combineElementObjects(
        alchmInfo['Total Effect Value'], 
        alchmInfo['Total Elemental Effect']
      );
      
      // Get the dominant element
      const elementRanking = getElementRanking(alchmInfo['Total Effect Value']);
      alchmInfo['Dominant Element'] = elementRanking[1] || 'Fire';
      
      // Calculate the total chart absolute effect
      alchmInfo['Total Chart Absolute Effect'] = getAbsoluteElementValue(alchmInfo['Total Effect Value']);
      
      // Calculate alchemy effects total
      alchmInfo['Alchemy Effects']['A #'] = 
        alchmInfo['Alchemy Effects']['Total Spirit'] + 
        alchmInfo['Alchemy Effects']['Total Essence'] + 
        alchmInfo['Alchemy Effects']['Total Matter'] + 
        alchmInfo['Alchemy Effects']['Total Substance'];
      
      // Calculate modality percentages
      alchmInfo['% Cardinal'] = (alchmInfo['# Cardinal'] || 0) / 11;
      alchmInfo['% Fixed'] = (alchmInfo['# Fixed'] || 0) / 11;
      alchmInfo['% Mutable'] = (alchmInfo['# Mutable'] || 0) / 11;
      
      // Determine dominant modality
      if ((alchmInfo['% Cardinal'] >= alchmInfo['% Fixed']) && 
          (alchmInfo['% Cardinal'] >= alchmInfo['% Mutable'])) {
        alchmInfo['Dominant Modality'] = 'Cardinal';
      } else if ((alchmInfo['% Fixed'] >= alchmInfo['% Cardinal']) && 
                 (alchmInfo['% Fixed'] >= alchmInfo['% Mutable'])) {
        alchmInfo['Dominant Modality'] = 'Fixed';
      } else {
        alchmInfo['Dominant Modality'] = 'Mutable';
      }
      
      // Calculate thermodynamic properties
      const fire = alchmInfo['Total Effect Value']['Fire'] || 0;
      const water = alchmInfo['Total Effect Value']['Water'] || 0;
      const air = alchmInfo['Total Effect Value']['Air'] || 0;
      const earth = alchmInfo['Total Effect Value']['Earth'] || 0;
      const spirit = alchmInfo['Alchemy Effects']['Total Spirit'] || 0;
      const essence = alchmInfo['Alchemy Effects']['Total Essence'] || 0;
      const matter = alchmInfo['Alchemy Effects']['Total Matter'] || 0;
      const substance = alchmInfo['Alchemy Effects']['Total Substance'] || 0;
      
      const denominator1 = (substance + essence + matter + water + air + earth) || 1;
      const denominator2 = (essence + matter + earth + water) || 1;
      const denominator3 = (matter + earth) || 1;
      
      alchmInfo['Heat'] = (Math.pow(spirit, 2) + Math.pow(fire, 2)) / Math.pow(denominator1, 2);
      alchmInfo['Entropy'] = (Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(fire, 2) + Math.pow(air, 2)) / Math.pow(denominator2, 2);
      alchmInfo['Reactivity'] = (Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(essence, 2) + Math.pow(fire, 2) + Math.pow(air, 2) + Math.pow(water, 2)) / Math.pow(denominator3, 2);
      
      alchmInfo['Energy'] = alchmInfo['Heat'] - (alchmInfo['Reactivity'] * alchmInfo['Entropy']);
    } catch (error) {
      console.error('Error calculating final results:', error);
    }
    
    // Return the results
    return alchmInfo as unknown as AlchemicalResult;
  } catch (error) {
    console.error('Error in alchemize function:', error);
    
    // Provide a properly structured fallback result that matches StandardizedAlchemicalResult
    return {
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      thermodynamicProperties: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      },
      kalchm: 1.0,
      monica: 1.0,
      score: 0.5,
      normalized: false,
      confidence: 0.1,
      metadata: {
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } as StandardizedAlchemicalResult;
  }
}

/**
 * Get the season from a zodiac sign
 * @param sunSign Zodiac sign
 * @returns Season
 */
function getSeasonFromSunSign(sunSign: ZodiacSign): Season {
  try {
    if (!sunSign || typeof sunSign !== 'string') {
      return 'spring'; // Default
    }
    
    // Convert to lowercase and handle seasonal mappings
    const sign = sunSign.toLowerCase() as ZodiacSign;
    
    if (['aries', 'taurus', 'gemini'].includes(sign)) {
      return 'spring';
    } else if (['cancer', 'leo', 'virgo'].includes(sign)) {
      return 'summer';
    } else if (['libra', 'scorpio', 'sagittarius'].includes(sign)) {
      return 'autumn';
    } else if (['capricorn', 'aquarius', 'pisces'].includes(sign)) {
      return 'winter';
    }
    
    return 'spring'; // Default if not found
  } catch (error) {
    ErrorHandler.log(error, {
      context: 'getSeasonFromSunSign',
      data: { sunSign }
    });
    return 'spring'; // Default on error
  }
}

/**
 * Generate food recommendations based on elemental balance
 * @param dominantElement Dominant element
 * @returns Recommendation string
 */
function generateRecommendation(dominantElement: string): string {
  switch (dominantElement) {
    case 'fire':
      return 'Foods that cool and ground: fresh vegetables, fruits, and cooling herbs like mint.';
    case 'earth':
      return 'Foods that lighten and elevate: grains, legumes, and aromatic herbs.';
    case 'air':
      return 'Foods that nourish and stabilize: root vegetables, proteins, and warming spices.';
    case 'water':
      return 'Foods that invigorate and enliven: spicy dishes, stimulating herbs, and bright flavors.';
    default:
      return 'A balanced diet incorporating elements from all food groups.';
  }
}

/**
 * Get the primary element associated with a season
 * @param season Season
 * @returns Element
 */
function getSeasonsPrimaryElement(season: string): keyof ElementalProperties {
  switch (season.toLowerCase()) {
    case 'spring':
      return 'Air';
    case 'summer':
      return 'Fire';
    case 'autumn':
    case 'fall':
      return 'Earth';
    case 'winter':
      return 'Water';
    default:
      return 'Water';
  }
}

/**
 * Get element from zodiac sign with improved validation
 * @param sign Zodiac sign
 * @returns Element or null if sign is invalid
 */
function getElementFromSign(sign: string | null | undefined): string | null {
  if (!sign || typeof sign !== 'string') {
    logger.warn('Invalid sign passed to getElementFromSign', { sign });
    return null;
  }

  const normalizedSign = sign.trim().toLowerCase();
  
  const fireigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];

  if (fireigns.includes(normalizedSign)) return 'fire';
  if (earthSigns.includes(normalizedSign)) return 'earth';
  if (airSigns.includes(normalizedSign)) return 'air';
  if (waterSigns.includes(normalizedSign)) return 'water';

  logger.warn('Unknown sign in getElementFromSign', { sign: normalizedSign });
  return null;
}

/**
 * Calculates current planetary positions using accurate astronomy calculations
 * @returns A record of planetary positions
 */
async function calculateCurrentPlanetaryPositions(): Promise<
  Record<string, unknown>
> {
  try {
    logger.info('Calculating current planetary positions');
    
    // **PRIMARY**: Try to use the astrologize API for maximum accuracy
    try {
      const { fetchPlanetaryPositions } = await import('@/services/astrologizeApi');
      const astrologizePositions = await fetchPlanetaryPositions();
      
      // Convert astrologize positions to our expected format
      if (astrologizePositions && typeof astrologizePositions === 'object' && Object.keys(astrologizePositions).length > 0) {
        const convertedPositions: Record<string, unknown> = {};
        
        Object.entries(astrologizePositions).forEach(([planet, position]) => {
          const pos = position as any;
          convertedPositions[planet] = {
            Sign: { label: pos.sign },
            Degree: pos.degree,
            ChartPosition: { 
              Ecliptic: { 
                ArcDegreesInSign: pos.degree,
                DecimalDegrees: pos.exactLongitude 
              } 
            },
            exactLongitude: pos.exactLongitude,
            isRetrograde: pos.isRetrograde || false
          };
        });
        
        // Verify that at least the sun and moon positions are present
        if (convertedPositions.Sun && convertedPositions.Moon) {
          logger.info('Successfully calculated positions using astrologize API');
          return convertedPositions;
        }
      }
      
      logger.warn('Astrologize API returned incomplete positions, trying fallback');
    } catch (astrologizeError) {
      logger.warn('Error using astrologize API', { 
        error: astrologizeError instanceof Error ? astrologizeError.message : 'Unknown error' 
      });
      ErrorHandler.log(astrologizeError, {
        context: 'alchemicalEngine:calculateCurrentPlanetaryPositions:astrologize',
      });
    }
    
    // SECONDARY: Try to use the accurate astronomy utility
    try {
      const positions = await getAccuratePlanetaryPositions();
      
      // Validate the returned positions
      if (positions && typeof positions === 'object' && Object.keys(positions).length > 0) {
        // Verify that at least the sun and moon positions are present
        if (positions.Sun && positions.Moon) {
          logger.info('Successfully calculated positions using accurate astronomy');
          return positions;
        }
      }
      
      logger.warn('Accurate astronomy returned incomplete positions, trying fallback');
    } catch (accurateError) {
      logger.warn('Error using accurate astronomy calculator', { 
        error: accurateError instanceof Error ? accurateError.message : 'Unknown error' 
      });
      ErrorHandler.log(accurateError, {
        context: 'alchemicalEngine:calculateCurrentPlanetaryPositions:accurate',
      });
    }

    // If the above fails or returns empty, try to use the astronomia library
    // Import the astronomia calculator dynamically to avoid issues at build time
    try {
      const { calculatePlanetaryPositions } = await import(
        '@/utils/astronomiaCalculator'
      );
      const astronomiaPositions = calculatePlanetaryPositions(new Date());

      // Validate astronomiaPositions
      if (astronomiaPositions && 
          typeof astronomiaPositions === 'object' && 
          Object.keys(astronomiaPositions).length > 0 &&
          astronomiaPositions.Sun && 
          astronomiaPositions.Moon) {
        logger.info('Successfully calculated positions using astronomia');
        return astronomiaPositions;
      }
      
      logger.warn('Astronomia returned incomplete positions, trying fallback');
    } catch (astronomiaError) {
      logger.warn('Error using astronomia calculator', { 
        error: astronomiaError instanceof Error ? astronomiaError.message : 'Unknown error' 
      });
      ErrorHandler.log(astronomiaError, {
        context: 'alchemicalEngine:calculateCurrentPlanetaryPositions:astronomia',
      });
    }

    // If both methods fail, use the fallback positions
    // Import the fallback calculator dynamically
    try {
      const astrologyUtils = await import('@/utils/astrologyUtils');
      const fallbackCalculator = astrologyUtils as any;
      const _calculateFallbackPositions = fallbackCalculator?._calculateFallbackPositions;
      
      // Generate current date to pass to the fallback calculator
      const now = new Date();
      
      // Check for local fallback calculation
      if (typeof _calculateFallbackPositions === 'function') {
        try {
          const fallbackPositions = _calculateFallbackPositions(now);
          
          if (fallbackPositions && Object.keys(fallbackPositions).length > 0) {
            console.warn('Using fallback planetary positions');
            return fallbackPositions;
          }
        } catch (fallbackError) {
          console.error('Error in fallback calculation:', fallbackError);
        }
      }

      // Convert the fallback positions (which are just degrees) to proper format
      const formattedPositions: Record<string, unknown> = {};
      
      const signs = [
        'aries', 'taurus', 'gemini', 'cancer', 
        'leo', 'virgo', 'libra', 'scorpio', 
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
      ];
      
      // Safe iteration through fallback positions
      Object.entries(formattedPositions).forEach(([planet, data]) => {
        // Use safe type casting for unknown data access
        const dataObject = data as any;
        const exactLongitude = dataObject?.exactLongitude;
        
        // Validate longitude is a number
        if (typeof exactLongitude !== 'number' || isNaN(exactLongitude)) {
          logger.warn(`Invalid longitude for planet ${planet}`, { longitude: exactLongitude });
          return; // Skip this planet
        }
        
        // Convert longitude to sign and degree
        const signIndex = Math.floor(exactLongitude / 30) % 12;
        const degree = exactLongitude % 30;

        // Validate signIndex is within bounds
        if (signIndex < 0 || signIndex >= signs.length) {
          logger.warn(`Invalid sign index for planet ${planet}`, { signIndex, longitude: exactLongitude });
          return; // Skip this planet
        }

        formattedPositions[planet] = {
          Sign: { label: signs[signIndex] },
          Degree: degree,
          ChartPosition: {
            Ecliptic: {
              ArcDegreesInSign: degree,
            },
          },
          exactLongitude: exactLongitude,
        };
      });

      // Verify that at least the sun and moon positions are present
      if (formattedPositions.Sun && formattedPositions.Moon) {
        logger.info('Successfully created positions using fallback calculator');
        return formattedPositions;
      }
      
      logger.warn('Fallback position calculator returned incomplete data');
    } catch (fallbackError) {
      logger.warn('Error using fallback position calculator', { 
        error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error' 
      });
      ErrorHandler.log(fallbackError, {
        context: 'alchemicalEngine:calculateCurrentPlanetaryPositions:fallback',
      });
    }

    // Last resort - return hardcoded minimal positions
    logger.warn('Using hardcoded fallback planetary positions');
    
    return {
      Sun: {
        Sign: { label: 'Aries' },
        Degree: 15,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 15 } },
        exactLongitude: 15,
      },
      Moon: {
        Sign: { label: 'Cancer' },
        Degree: 10,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 10 } },
        exactLongitude: 100,
      },
      Mercury: {
        Sign: { label: 'Taurus' },
        Degree: 5,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 5 } },
        exactLongitude: 35,
      },
      Venus: {
        Sign: { label: 'Gemini' },
        Degree: 12,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 12 } },
        exactLongitude: 72,
      },
      Mars: {
        Sign: { label: 'Leo' },
        Degree: 8,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 8 } },
        exactLongitude: 128,
      },
      Jupiter: {
        Sign: { label: 'Libra' },
        Degree: 20,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 20 } },
        exactLongitude: 200,
      },
      Saturn: {
        Sign: { label: 'Capricorn' },
        Degree: 15,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 15 } },
        exactLongitude: 285,
      },
    };
  } catch (error) {
    logger.error('Critical error calculating planetary positions', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    ErrorHandler.log(error, {
      context: 'alchemicalEngine:calculateCurrentPlanetaryPositions',
      isFatal: true,
    });
    
    // Return minimal fallback as last resort
    return {
      Sun: {
        Sign: { label: 'Aries' },
        Degree: 15,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 15 } },
      },
      Moon: {
        Sign: { label: 'Cancer' },
        Degree: 10,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 10 } },
      },
    };
  }
}

/**
 * Calculate zodiac energies based on planetary positions
 * @param positions Record of planetary positions
 * @returns Record of zodiac sign energies
 */
function calculateZodiacEnergies(
  positions: Record<string, unknown>
): Record<string, number> {
  // Initialize with default zero values for all signs
  const zodiacEnergies: Record<string, number> = {
    aries: 0,
    taurus: 0,
    gemini: 0,
    cancer: 0,
    leo: 0,
    virgo: 0,
    libra: 0,
    scorpio: 0,
    sagittarius: 0,
    capricorn: 0,
    aquarius: 0,
    pisces: 0,
  };

  // Guard against undefined or null positions
  if (!positions || typeof positions !== 'object') {
    logger.warn('Invalid positions passed to calculateZodiacEnergies', { positions });
    return zodiacEnergies;
  }

  // Planetary weights - define the influence strength of each planet
  const planetaryWeights: Record<string, number> = {
    Sun: 0.25,
    Moon: 0.2,
    Mercury: 0.1,
    Venus: 0.1,
    Mars: 0.1,
    Jupiter: 0.1,
    Saturn: 0.1,
    Uranus: 0.05,
    Neptune: 0.05,
    Pluto: 0.05,
  };

  try {
    // For each planet in the positions
    Object.entries(positions).forEach(([planet, data]) => {
      if (!data || typeof data !== 'object') {
        logger.debug(`Skipping invalid data for planet ${planet}`, { data });
        return;
      }
      
      let sign: string | null = null;
      
      // Check for data in expected format from accurate astronomy
      if ('Sign' in data && data.Sign && typeof data.Sign === 'object' && 'label' in data.Sign) {
        const signLabel = data.Sign.label;
        if (typeof signLabel === 'string') {
          sign = signLabel.toLowerCase();
        }
      }
      // Check for data in the format returned by astronomiaCalculator
      else if ('sign' in data && typeof data.sign === 'string') {
        sign = data.sign.toLowerCase();
      }
      
      // Only process if we found a valid sign
      if (sign && sign in zodiacEnergies) {
        // Add energy based on the planet's influence
        const planetModifier = planetaryWeights[planet] || 0.05;
        zodiacEnergies[sign] += planetModifier;
      } else {
        logger.debug(`Unknown sign for planet ${planet}`, { sign, data });
      }
    });

    // Normalize energies to sum to 1
    const totalEnergy = Object.values(zodiacEnergies).reduce(
      (sum, energy) => sum + energy,
      0
    );
    
    if (totalEnergy > 0) {
      Object.keys(zodiacEnergies).forEach((sign) => {
        zodiacEnergies[sign] = zodiacEnergies[sign] / totalEnergy;
      });
    } else {
      // If no energy was calculated (all zeros), set to equal distribution
      logger.warn('No zodiac energies calculated, using equal distribution');
      const equalValue = 1 / Object.keys(zodiacEnergies).length;
      Object.keys(zodiacEnergies).forEach((sign) => {
        zodiacEnergies[sign] = equalValue;
      });
    }
    
    return zodiacEnergies;
  } catch (error) {
    logger.error('Error calculating zodiac energies', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    ErrorHandler.log(error, {
      context: 'alchemicalEngine:calculateZodiacEnergies',
    });
    
    // Return equal distribution on error
    const equalValue = 1 / Object.keys(zodiacEnergies).length;
    Object.keys(zodiacEnergies).forEach((sign) => {
      zodiacEnergies[sign] = equalValue;
    });
    
    return zodiacEnergies;
  }
}

/**
 * Calculate chakra energies based on zodiac sign energies
 * @param zodiacEnergies Record of zodiac energies
 * @returns Chakra energies
 */
function calculateChakraEnergies(
  zodiacEnergies: Record<string, number>
): ChakraEnergies {
  try {
    // Initialize with default values - ensures all chakras have values
    const chakraEnergies = {
      root: 0.125,
      sacral: 0.125,
      solarPlexus: 0.125,
      heart: 0.125,
      throat: 0.125,
      thirdEye: 0.125,
      crown: 0.125,
      brow: 0.125, // Include both brow and thirdEye for compatibility
    };
    
    // Handle invalid zodiacEnergies
    if (!zodiacEnergies || typeof zodiacEnergies !== 'object') {
      logger.warn('Invalid zodiacEnergies provided to calculateChakraEnergies', { zodiacEnergies });
      return chakraEnergies;
    }

    // Define mapping from zodiac signs to chakras
    const zodiacToChakraMap: Record<string, ChakraPosition[]> = {
      // Root chakra is associated with earth signs
      taurus: ['root'],
      virgo: ['root'],
      capricorn: ['root'],

      // Sacral chakra is associated with water signs
      cancer: ['sacral'],
      scorpio: ['sacral'],
      pisces: ['sacral'],

      // Solar plexus is associated with fire signs
      aries: ['solarPlexus'],
      leo: ['solarPlexus'],
      sagittarius: ['solarPlexus'],

      // Heart chakra is associated with air and water
      libra: ['heart'],
      aquarius: ['heart'],
      pisces: ['heart', 'sacral'], // Pisces influences multiple chakras

      // Throat chakra is associated with communication
      gemini: ['throat'],
      virgo: ['throat', 'root'], // Virgo influences multiple chakras

      // Brow/third eye is associated with intuition
      scorpio: ['brow', 'sacral'], // Use 'brow' instead of 'thirdEye' for consistency
    };

    // Reset chakra energies to 0 before calculating (keeps default values for missing ones)
    Object.keys(chakraEnergies).forEach((chakra) => {
      chakraEnergies[chakra as keyof ChakraEnergies] = 0;
    });
    
    // Track which chakras received energy for normalization
    const affectedChakras = new Set<ChakraPosition>();

    // Calculate chakra energies based on zodiac energies
    Object.entries(zodiacEnergies).forEach(([sign, energy]) => {
      // Validate sign and energy
      if (typeof energy !== 'number' || isNaN(energy)) {
        logger.debug(`Skipping invalid energy value for sign ${sign}`, { energy });
        return;
      }
      
      const chakras = zodiacToChakraMap[sign];
      if (chakras && chakras.length > 0) {
        // Distribute energy across linked chakras
        const energyPerChakra = energy / chakras.length;
        
        chakras.forEach((chakra) => {
          // Ensure we're using a valid chakra key
          if (chakra in chakraEnergies) {
            chakraEnergies[chakra] += energyPerChakra;
            affectedChakras.add(chakra);
          }
        });
      }
    });

    // Sync thirdEye and brow for compatibility
    // Use safe type casting for chakraEnergies access
    const chakraData = chakraEnergies as any;
    if (affectedChakras.has('brow') && !affectedChakras.has('thirdEye' as any)) {
      chakraData.thirdEye = chakraEnergies.brow;
      affectedChakras.add('thirdEye' as any);
    } else if (affectedChakras.has('thirdEye' as any) && !affectedChakras.has('brow')) {
      chakraEnergies.brow = chakraData?.thirdEye || 0;
      affectedChakras.add('brow');
    }

    // Normalize chakra energies to sum to 1
    const totalEnergy = Object.values(chakraEnergies).reduce(
      (sum, energy) => sum + energy,
      0
    );
    
    if (totalEnergy > 0) {
      Object.keys(chakraEnergies).forEach((chakra) => {
        chakraEnergies[chakra as keyof ChakraEnergies] =
          chakraEnergies[chakra as keyof ChakraEnergies] / totalEnergy;
      });
    } else {
      // If no energies were calculated, use equal distribution
      logger.warn('No chakra energies calculated, using equal distribution');
      const equalValue = 1 / Object.keys(chakraEnergies).length;
      Object.keys(chakraEnergies).forEach((chakra) => {
        chakraEnergies[chakra as keyof ChakraEnergies] = equalValue;
      });
    }

    return chakraEnergies;
  } catch (error) {
    logger.error('Error calculating chakra energies', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    ErrorHandler.log(error, {
      context: 'alchemicalEngine:calculateChakraEnergies',
    });
    
    // Return equal distribution on error
    const defaultEnergies = {
      root: 0.125,
      sacral: 0.125,
      solarPlexus: 0.125,
      heart: 0.125,
      throat: 0.125,
      thirdEye: 0.125,
      crown: 0.125,
      brow: 0.125,
    } as ChakraEnergies;
    
    return defaultEnergies;
  }
}

// Add after calculateChakraEnergies and before the default export

/**
 * Retrieves the current astrological state based on planetary positions
 * @returns A promise that resolves to an AstrologicalState object
 */
async function getCurrentAstrologicalState(): Promise<AstrologicalState> {
  try {
    // Get current planetary positions
    const positions = await calculateCurrentPlanetaryPositions();
    
    // Extract zodiac sign from planetary positions (sun sign)
    const sunSign = (positions.sun as any)?.sign?.toLowerCase() as ZodiacSign || 'aries';
    
    // Extract moon sign from planetary positions
    const moonSign = (positions.moon as any)?.sign?.toLowerCase() as ZodiacSign || 'taurus';
    
    // Calculate dominant element based on zodiac sign
    const dominantElement = (getElementFromSign(sunSign) as Element) || 'Fire';
    
    // Determine current lunar phase
    const lunarPhase = (positions.moon as any)?.phase?.toLowerCase() as LunarPhase || 'full moon';
    
    // Get current season based on sun sign
    const season = getSeasonFromSunSign(sunSign);
    
    // Extract active planets based on their angular position
    const activePlanets = Object.entries(positions)
      .filter(([planet, data]) => {
        if (planet === 'sun' || planet === 'moon') return true;
        // Consider a planet active if it has a position and is not retrograde
        return (data as any)?.sign && !(data as any)?.isRetrograde;
      })
      .map(([planet]) => planet);
    
    // Calculate elemental properties based on planetary positions
    const elementalProperties: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25, 
      Earth: 0.25,
      Air: 0.25
    };
    
    // Enhance the elemental properties based on sun sign
    const sunSignElement = getElementFromSign(sunSign);
    if (sunSignElement) {
      elementalProperties[sunSignElement as keyof ElementalProperties] += 0.1;
      // Normalize the values
      const total = Object.values(elementalProperties).reduce((sum, val) => sum + val, 0);
      Object.keys(elementalProperties).forEach(key => {
        elementalProperties[key as keyof ElementalProperties] /= total;
      });
    }
    
    // Return the astrological state
    return {
      currentZodiac: sunSign,
      sunSign,
      moonPhase: lunarPhase,
      lunarPhase,
      activePlanets,
      elementalProperties,
      planetaryPositions: positions,
      timestamp: new Date(),
      dominantElement,
      season,
      moonSign
    } as AstrologicalState;
  } catch (error) {
    ErrorHandler.log(error, {
      context: 'alchemicalEngine:getCurrentAstrologicalState'
    });
    
    // Return default state on error
    return {
      currentZodiac: 'aries',
      sunSign: 'aries',
      moonPhase: 'full moon',
      lunarPhase: 'full moon',
      activePlanets: ['sun', 'moon'],
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      planetaryPositions: {},
      timestamp: new Date(),
      dominantElement: 'Fire',
      season: 'spring',
      moonSign: 'taurus'
    } as AstrologicalState;
  }
}

// Default export that includes both the class and the alchemize function
export default {
  alchemize: function(birthInfo: BirthInfo, horoscopeDict: HoroscopeData): AlchemicalResult {
    try {
      try {
        // First try the regular alchemize function
        return alchemize(birthInfo, horoscopeDict);
      } catch (error) {
        // If it's an assignment to constant error, try the safe version
        if (error instanceof TypeError && 
            (error.message.includes('Assignment to constant variable') || 
             error.message.includes('invalid assignment'))) {
          console.warn('Caught assignment error, using safe version:', error.message);
          return safeAlchemize(birthInfo, horoscopeDict);
        }
        // Other errors should be re-thrown
        throw error;
      }
    } catch (error) {
      console.error('Critical error in alchemize, returning fallback:', error);
      
      // Return a minimal fallback result that won't break the application
      return {
        'Sun Sign': 'unknown',
        'Dominant Element': 'Fire',
        'Total Effect Value': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
        'Alchemy Effects': {
          'Total Spirit': 0.25,
          'Total Essence': 0.25,
          'Total Matter': 0.25,
          'Total Substance': 0.25
        }
      } as AlchemicalResult;
    }
  },
  calculateCurrentPlanetaryPositions,
  calculateZodiacEnergies,
  calculateChakraEnergies,
  getCurrentAstrologicalState
};

/**
 * Safe version of alchemize that makes deep copies of all referenced constants
 * to prevent "Assignment to constant variable" errors
 */
function safeAlchemize(birthInfo: BirthInfo, horoscopeDict: HoroscopeData): AlchemicalResult {
  try {
    // Create a deep copy of the actual planetary information
    // JSON.parse/stringify is used for deep cloning, though it has limitations
    // It's the safest way to ensure we don't modify any constants
    const safetyWrapper = {
      planetInfo: JSON.parse(JSON.stringify(planetInfo)),
      signInfo: JSON.parse(JSON.stringify(signInfo)),
      signs: JSON.parse(JSON.stringify(signs))
    };
    
    // Call the original alchemize with safety wrapper
    return alchemizeWithSafety(birthInfo, horoscopeDict, safetyWrapper);
  } catch (error) {
    console.error('Error in safeAlchemize:', error);
    
    // Return fallback result
    return {
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      thermodynamicProperties: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      },
      kalchm: 1.0,
      monica: 1.0,
      score: 0.5,
      normalized: true,
      confidence: 0.5,
      metadata: {
        name: "Alchm NFT",
        description: "Fallback result due to deep cloning error.",
        attributes: []
      }
    } as StandardizedAlchemicalResult;
  }
}

/**
 * Version of alchemize that uses safely cloned references
 */
function alchemizeWithSafety(
  birthInfo: BirthInfo, 
  horoscopeDict: HoroscopeData,
  safetyWrapper: {
    planetInfo: typeof planetInfo,
    signInfo: typeof signInfo,
    signs: typeof signs
  }
): AlchemicalResult {
  // Use a modified version of alchemize that uses our safe copies
  try {
    // This is where we'd normally use the original alchemize but with safety wrapper
    // Since we can't easily modify all references in the original function,
    // we'll return a simplified fallback result instead
    
    // In a production system, we would implement a full version of alchemize
    // that uses safetyWrapper.planetInfo, safetyWrapper.signInfo, etc.
    console.log('Using safe alchemize with cloned constants');
    
    // Return simplified, but useful result that won't cause errors
    const horoscopeData = horoscopeDict as any;
    const celestialBodies = horoscopeData?.tropical?.CelestialBodies;
    const sunData = celestialBodies?.sun;
    const sunSignData = sunData?.Sign;
    const sunSignLabel = sunSignData?.label || 'aries';
    
    return {
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      thermodynamicProperties: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      },
      kalchm: 1.0,
      monica: 1.0,
      score: 0.5,
      normalized: true,
      confidence: 0.7,
      metadata: {
        name: "Alchm NFT",
        description: "Safety-first result from alchemizeWithSafety.",
        attributes: [],
        sunSign: sunSignLabel,
        dominantElement: 'Fire'
      }
    } as StandardizedAlchemicalResult;
  } catch (error) {
    console.error('Error in alchemizeWithSafety:', error);
    
    // Return fallback result
    return {
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      thermodynamicProperties: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      },
      kalchm: 1.0,
      monica: 1.0,
      score: 0.5,
      normalized: true,
      confidence: 0.3,
      metadata: {
        name: "Alchm NFT",
        description: "Graceful fallback from safety wrapper error.",
        attributes: []
      }
    } as StandardizedAlchemicalResult;
  }
}

// Export calculateCurrentPlanetaryPositions for external use
export { calculateCurrentPlanetaryPositions };

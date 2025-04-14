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
  Element,
  RecipeHarmonyResult,
  LunarPhaseWithSpaces,
  StandardizedAlchemicalResult,
  ChakraEnergies
} from '@/types/alchemy';
import { seasonalPatterns } from '@/data/integrations/seasonalPatterns';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import { PLANETARY_MODIFIERS, RulingPlanet } from '@/constants/planets';
import { getZodiacElementalInfluence } from '@/utils/zodiacUtils';
import { recipeCalculations } from '@/utils/recipeCalculations';
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';

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
const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

/**
 * AlchemicalEngineAdvanced class handles calculations related to
 * astrological and elemental influences.
 */
export class AlchemicalEngineAdvanced {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire']
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1
  };

  private readonly zodiacElements: Record<ZodiacSign, keyof ElementalProperties> = {
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
    pisces: 'Water'
  };

  private readonly lunarPhaseModifiers: Record<LunarPhase, ElementalProperties> = {
    'new moon': { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'waxing gibbous': { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    'full moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'last quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 }, // Alias for autumn to maintain backward compatibility
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly decans: Record<ZodiacSign, Decan[]> = {
    aries: [
      { ruler: 'Mars', element: 'Fire', degree: 0 },
      { ruler: 'Sun', element: 'Fire', degree: 10 },
      { ruler: 'Jupiter', element: 'Fire', degree: 20 }
    ],
    taurus: [
      { ruler: 'Venus', element: 'Earth', degree: 0 },
      { ruler: 'Mercury', element: 'Earth', degree: 10 },
      { ruler: 'Saturn', element: 'Earth', degree: 20 }
    ],
    gemini: [
      { ruler: 'Mercury', element: 'Air', degree: 0 },
      { ruler: 'Venus', element: 'Air', degree: 10 },
      { ruler: 'Uranus', element: 'Air', degree: 20 }
    ],
    cancer: [
      { ruler: 'Moon', element: 'Water', degree: 0 },
      { ruler: 'Pluto', element: 'Water', degree: 10 },
      { ruler: 'Neptune', element: 'Water', degree: 20 }
    ],
    leo: [
      { ruler: 'Sun', element: 'Fire', degree: 0 },
      { ruler: 'Jupiter', element: 'Fire', degree: 10 },
      { ruler: 'Mars', element: 'Fire', degree: 20 }
    ],
    virgo: [
      { ruler: 'Mercury', element: 'Earth', degree: 0 },
      { ruler: 'Saturn', element: 'Earth', degree: 10 },
      { ruler: 'Venus', element: 'Earth', degree: 20 }
    ],
    libra: [
      { ruler: 'Venus', element: 'Air', degree: 0 },
      { ruler: 'Uranus', element: 'Air', degree: 10 },
      { ruler: 'Mercury', element: 'Air', degree: 20 }
    ],
    scorpio: [
      { ruler: 'Pluto', element: 'Water', degree: 0 },
      { ruler: 'Neptune', element: 'Water', degree: 10 },
      { ruler: 'Moon', element: 'Water', degree: 20 }
    ],
    sagittarius: [
      { ruler: 'Jupiter', element: 'Fire', degree: 0 },
      { ruler: 'Mars', element: 'Fire', degree: 10 },
      { ruler: 'Sun', element: 'Fire', degree: 20 }
    ],
    capricorn: [
      { ruler: 'Saturn', element: 'Earth', degree: 0 },
      { ruler: 'Venus', element: 'Earth', degree: 10 },
      { ruler: 'Mercury', element: 'Earth', degree: 20 }
    ],
    aquarius: [
      { ruler: 'Uranus', element: 'Air', degree: 0 },
      { ruler: 'Mercury', element: 'Air', degree: 10 },
      { ruler: 'Venus', element: 'Air', degree: 20 }
    ],
    pisces: [
      { ruler: 'Neptune', element: 'Water', degree: 0 },
      { ruler: 'Moon', element: 'Water', degree: 10 },
      { ruler: 'Pluto', element: 'Water', degree: 20 }
    ]
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
    const dominantElement = Object.entries(recipeElements || DEFAULT_ELEMENTAL_PROPERTIES)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Safely access the seasonalPatterns by ensuring the season is a valid key
    const defaultSeason: Season = 'winter';
    const normalizedSeason = season?.toLowerCase();
    const validSeason = (normalizedSeason === 'spring' || 
                         normalizedSeason === 'summer' || 
                         normalizedSeason === 'autumn' || 
                         normalizedSeason === 'winter' || 
                         normalizedSeason === 'fall') 
                         ? (normalizedSeason === 'fall' ? 'autumn' : normalizedSeason) as Season 
                         : defaultSeason;
    
    const seasonalData = seasonalPatterns[validSeason];
    
    // Function to check if string is a valid RulingPlanet
    const isRulingPlanet = (planet: string): planet is RulingPlanet => {
      return Object.keys(PLANETARY_MODIFIERS).includes(planet);
    };
    
    // Simple matching score based on astrological state only
    const astronomicalScore = astrologicalState?.activePlanets
      ? astrologicalState.activePlanets
          .filter(p => isRulingPlanet(p) && PLANETARY_MODIFIERS[p] > 0)
          .length * 10
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
      score: totalScore,
      elementalMatch: 0, // We don't calculate elemental match here
      seasonalMatch: 0, // We don't calculate seasonal match here
      astronomicalMatch: astronomicalScore,
      aspectMatch: aspectScore,
      cuisineMatch: cuisineScore,
      dominantElement: dominantElement as keyof ElementalProperties,
      explanation: `Total astrological compatibility score: ${totalScore}`
    };
  }

  /**
   * Calculate compatibility between a cuisine and the current astrological state
   */
  private getCuisineCompatibility(cuisine: string, astroState?: AstrologicalState, season?: string): number {
    // Default score if no data is available
    if (!cuisine || !culinaryTraditions[cuisine]) return 0;
    
    // Get the culinary tradition
    const tradition = culinaryTraditions[cuisine];
    
    // Base score from the tradition's elemental properties
    let score = 0;
    
    // Add points for elemental matches with active planets
    if (astroState?.activePlanets && tradition.elementalProperties) {
      // Get the dominant element in the cuisine
      const dominantElement = Object.entries(tradition.elementalProperties)
        .sort(([,a], [,b]) => b - a)[0][0] as keyof ElementalProperties;
      
      // Get a list of planets that favor this element
      const favorablePlanets = Object.entries(PLANETARY_MODIFIERS)
        .filter(([_, modifiers]) => 
          modifiers[dominantElement] && modifiers[dominantElement] > 0
        )
        .map(([planet]) => planet);
      
      // Check for matches between favorable planets and active planets
      const matches = astroState.activePlanets.filter(p => 
        favorablePlanets.includes(p)
      ).length;
      
      // Add points for matches
      score += matches * 5;
    }
    
    // Seasonal compatibility
    if (season) {
      const normalizedSeason = season.toLowerCase();
      // If cuisine has a "preferredSeasons" property and it includes the current season
      if (tradition.preferredSeasons && 
          tradition.preferredSeasons.some(s => s.toLowerCase() === normalizedSeason)) {
        score += 15;
      }
    }
    
    // Normalize score to 0-100 range
    return Math.min(score, 100);
  }

  /**
   * Calculate astrological power based on recipe sun sign and astrological state
   */
  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    let power = 0;

    // Using properties that exist in AstrologicalState
    const recipeElement = this.zodiacElements[recipeSunSign];
    const currentZodiacElement = this.zodiacElements[astrologicalState.currentZodiac];
    const moonSignElement = this.zodiacElements[astrologicalState.zodiacSign];

    if (recipeElement === currentZodiacElement) power += 0.4;

    if (this.elementalAffinities[recipeElement]?.includes(String(moonSignElement))) {
      power += 0.3;
    }

    // Use the lunarPhase that exists in AstrologicalState
    if (astrologicalState.lunarPhase && this.lunarPhaseModifiers[astrologicalState.lunarPhase]) {
      const lunarModifier = this.lunarPhaseModifiers[astrologicalState.lunarPhase];
      power += lunarModifier[recipeElement] || 0;
    }

    return Math.min(power, 1);
  }

  /**
   * Get elemental affinity between two elements
   */
  getElementalAffinity(element1: keyof ElementalProperties, element2: keyof ElementalProperties): ElementalAffinity {
    return {
      base: element2 as string,
      element: element2 as Element,
      strength: element1 === element2 ? 1 : 
                this.elementalAffinities[element1]?.includes(String(element2)) ? 0.5 : 0,
      source: 'element-compatibility'
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
      strength: this.seasonalModifiers[season]?.[element] || 0.5
    };
  }

  /**
   * Calculate natural influences based on season, moon phase, and other parameters
   */
  calculateNaturalInfluences(params: NaturalInfluenceParams): ElementalProperties {
    const result = this.getBaseNaturalInfluences(params.season, params.moonPhase, params.timeOfDay);

    if (params.sunSign) {
      const currentDecan = this.getCurrentDecan(params.sunSign, params.degreesInSign);
      if (currentDecan) {
        const decanInfluence = this.decanModifiers[currentDecan.ruler];
        result[currentDecan.element] *= (1 + decanInfluence);
      }
    }

    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    Object.keys(result).forEach(element => {
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

    return signDecans.find((decan, index) => {
      const nextDegree = index < 2 ? signDecans[index + 1].degree : 30;
      return degrees >= decan.degree && degrees < nextDegree;
    }) || null;
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
      Earth: 0.25
    };

    Object.keys(result).forEach((element) => {
      const key = element as keyof ElementalProperties;
      result[key] = (seasonBase[key] + lunarBase[key]) / 2;
    });

    switch(timeOfDay.toLowerCase()) {
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
    const cuisineName = typeof recipe.cuisine === 'string' 
      ? recipe.cuisine 
      : (typeof recipe.cuisine === 'object' && recipe.cuisine ? Object.keys(culinaryTraditions).find(key => culinaryTraditions[key] === recipe.cuisine) || '' : '');
    
    const baseHarmony = this.calculateAstroCuisineMatch(
      recipe.elementalProperties,
      astroState,
      currentSeason,
      cuisineName
    );

    const cuisineAlignment = recipeCalculations.calculateCuisineAlignment(recipe);
    
    // Since AstrologicalState doesn't have an 'aspects' property, we'll use a fallback
    const aspectBonus = recipe.astrologicalProfile && recipe.astrologicalProfile.optimalAspects ? 
      recipe.astrologicalProfile.optimalAspects.length * 0.05 : 0; // Use a small constant multiplier

    return {
      ...baseHarmony,
      recipeSpecificBoost: cuisineAlignment + aspectBonus,
      optimalTimingWindows: recipe.astrologicalProfile?.optimalAspects?.map(a => `Optimal with ${a}`) || [],
      elementalMultipliers: {} // Return an empty object for now
    };
  }

  /**
   * Calculate astrological influence based on astrological state
   */
  private calculateAstrologicalInfluence(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    // Updated to use correct properties from AstrologicalState
    const sunInfluence = getZodiacElementalInfluence(astrologicalState.currentZodiac);
    const moonInfluence = getZodiacElementalInfluence(astrologicalState.zodiacSign);
    
    return {
      Fire: (sunInfluence.Fire + moonInfluence.Fire) / 2,
      Water: (sunInfluence.Water + moonInfluence.Water) / 2,
      Earth: (sunInfluence.Earth + moonInfluence.Earth) / 2,
      Air: (sunInfluence.Air + moonInfluence.Air) / 2
    };
  }

  /**
   * Get astrological modifiers based on astrological state
   */
  private getAstrologicalModifiers(astrologicalState: AstrologicalState): ElementalProperties {
    if (!astrologicalState) {
        return {
            Fire: 0.25,
            Water: 0.25,
            Air: 0.25,
            Earth: 0.25
        };
    }

    const currentZodiacElement = this.zodiacElements[astrologicalState.currentZodiac] || 'Fire';
    const moonSignElement = this.zodiacElements[astrologicalState.zodiacSign] || 'Water';
    const lunarModifiers = this.lunarPhaseModifiers[astrologicalState.lunarPhase] || {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25
    };

    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    };

    baseModifiers[currentZodiacElement] += 0.2;
    baseModifiers[moonSignElement] += 0.1;

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    const total = Object.values(baseModifiers).reduce((sum, val) => sum + val, 0);
    Object.keys(baseModifiers).forEach(element => {
      baseModifiers[element as keyof ElementalProperties] /= total;
    });

    return baseModifiers;
  }

  /**
   * Calculate dominant harmony between dominant element and user elements
   */
  private calculateDominantHarmony(dominantElement: string, userElements: ElementalProperties): number {
    // Focus only on the dominant element match
    return Math.min(userElements[dominantElement as keyof ElementalProperties] * 2, 1); // Aggressive scaling
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
  combineElementObjects(elementObject1: ElementalProperties, elementObject2: ElementalProperties): ElementalProperties {
    return {
      Fire: elementObject1.Fire + elementObject2.Fire,
      Water: elementObject1.Water + elementObject2.Water,
      Air: elementObject1.Air + elementObject2.Air,
      Earth: elementObject1.Earth + elementObject2.Earth
    };
  }

  /**
   * Get the relative ranking of elements in an elemental property object
   * @param elementObject Elemental property object
   * @returns Object with ranks as keys and element names as values
   */
  getElementRanking(elementObject: Record<string, number>): Record<number, string> {
    const sortedElements = Object.entries(elementObject)
      .sort(([_, valueA], [__, valueB]) => valueB - valueA);
    
    return sortedElements.reduce((acc, [element], index) => {
      acc[index + 1] = element;
      return acc;
    }, {} as Record<number, string>);
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
 * Main alchemize function that calculates alchemical properties based on birth info and horoscope data
 * @param birthInfo Birth information
 * @param horoscopeDict Horoscope data
 * @returns Alchemical result
 */
export function alchemize(birthInfo: BirthInfo, horoscopeDict: HoroscopeData): AlchemicalResult {
  try {
    debugLog("Starting alchemize calculation with birthInfo", birthInfo);
    
    // Initialize results with default values
    const elementalBalance = {
      fire: 0,
      earth: 0,
      air: 0,
      water: 0
    };
    
    let spirit = 0;
    let essence = 0;
    let matter = 0;
    let substance = 0;
    
    // Parse the horoscope data
    const bodies = horoscopeDict?.tropical?.CelestialBodies || {};
    
    // Extract Sun sign and degree
    let sunSign: ZodiacSign = 'aries'; // Default
    let sunDegree = 0;
    
    if (bodies.Sun) {
      const sun = bodies.Sun as CelestialBody;
      if (sun.Sign?.label) {
        sunSign = sun.Sign.label.toLowerCase() as ZodiacSign;
      }
      
      if ('ChartPosition' in sun && typeof sun.ChartPosition === 'object' && 
          'Ecliptic' in sun.ChartPosition && typeof sun.ChartPosition.Ecliptic === 'object' &&
          'ArcDegreesInSign' in sun.ChartPosition.Ecliptic && 
          typeof sun.ChartPosition.Ecliptic.ArcDegreesInSign === 'number') {
        sunDegree = sun.ChartPosition.Ecliptic.ArcDegreesInSign;
      }
    }
    
    // Calculate elemental contributions from each planet
    Object.entries(bodies).forEach(([planetName, planetData]) => {
      const planet = planetData as CelestialBody;
      
      if (!planet.Sign?.label) return;
      
      const sign = planet.Sign.label.toLowerCase() as ZodiacSign;
      const planetElement = getElementFromSign(sign);
      
      // Increase elemental balance based on the planet's sign
      if (planetElement) {
        elementalBalance[planetElement] += 1;
      }
      
      // Add alchemical property contributions
      switch (planetName) {
        case 'Sun':
          spirit += 1;
          break;
        case 'Moon':
          essence += 1;
          break;
        case 'Mercury':
          substance += 0.5;
          spirit += 0.5;
          break;
        case 'Venus':
          essence += 1;
          break;
        case 'Mars':
          matter += 0.5;
          essence += 0.5;
          break;
        case 'Jupiter':
          spirit += 0.5;
          essence += 0.5;
          break;
        case 'Saturn':
          matter += 1;
          break;
        case 'Uranus':
          substance += 1;
          break;
        case 'Neptune':
          essence += 0.5;
          substance += 0.5;
          break;
        case 'Pluto':
          matter += 0.5;
          essence += 0.5;
          break;
      }
    });
    
    // Apply seasonal adjustments
    const season = getSeasonFromSunSign(sunSign);
    const seasonElement = getSeasonsPrimaryElement(season);
    
    // Boost the elemental balance based on the current season
    if (seasonElement) {
      elementalBalance[seasonElement.toLowerCase() as keyof typeof elementalBalance] += 1;
    }
    
    // Calculate dominant element
    let dominantElement = 'balanced';
    let maxValue = 0;
    
    for (const [element, value] of Object.entries(elementalBalance)) {
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element;
      }
    }
    
    // Generate a recommendation based on the dominant element
    const recommendation = generateRecommendation(dominantElement);
    
    // Convert to upper case for ElementalProperties return
    const totalEffectValue: ElementalProperties = {
      Fire: elementalBalance.fire,
      Earth: elementalBalance.earth,
      Air: elementalBalance.air,
      Water: elementalBalance.water
    };
    
    debugLog("Alchemize calculation complete", {
      elementalBalance,
      dominantElement,
      spirit,
      essence,
      matter,
      substance
    });
    
    return {
      spirit,
      essence,
      matter,
      substance,
      elementalBalance,
      dominantElement,
      recommendation,
      'Total Effect Value': totalEffectValue
    };
  } catch (error) {
    debugLog("Error in alchemize calculation", error);
    
    // Return default values in case of error
    return {
      spirit: 1,
      essence: 1,
      matter: 1, 
      substance: 1,
      elementalBalance: {
        fire: 1,
        earth: 1,
        air: 1,
        water: 1
      },
      dominantElement: 'balanced',
      recommendation: "A balanced diet incorporating elements from all food groups.",
      'Total Effect Value': {
        Fire: 1,
        Earth: 1,
        Air: 1,
        Water: 1
      }
    };
  }
}

/**
 * Get the season from a zodiac sign
 * @param sunSign Zodiac sign
 * @returns Season
 */
function getSeasonFromSunSign(sunSign: ZodiacSign): Season {
  const springSigns = ['aries', 'taurus', 'gemini'];
  const summerSigns = ['cancer', 'leo', 'virgo'];
  const autumnSigns = ['libra', 'scorpio', 'sagittarius'];
  const winterSigns = ['capricorn', 'aquarius', 'pisces'];
  
  if (springSigns.includes(sunSign)) return 'spring';
  if (summerSigns.includes(sunSign)) return 'summer';
  if (autumnSigns.includes(sunSign)) return 'autumn';
  return 'winter';
}

/**
 * Generate food recommendations based on elemental balance
 * @param dominantElement Dominant element
 * @returns Recommendation string
 */
function generateRecommendation(dominantElement: string): string {
  switch (dominantElement) {
    case 'fire':
      return "Foods that cool and ground: fresh vegetables, fruits, and cooling herbs like mint.";
    case 'earth':
      return "Foods that lighten and elevate: grains, legumes, and aromatic herbs.";
    case 'air':
      return "Foods that nourish and stabilize: root vegetables, proteins, and warming spices.";
    case 'water':
      return "Foods that invigorate and enliven: spicy dishes, stimulating herbs, and bright flavors.";
    default:
      return "A balanced diet incorporating elements from all food groups.";
  }
}

/**
 * Get the primary element associated with a season
 * @param season Season
 * @returns Element
 */
function getSeasonsPrimaryElement(season: string): keyof ElementalProperties {
  switch (season.toLowerCase()) {
    case 'spring': return 'Air';
    case 'summer': return 'Fire';
    case 'autumn': 
    case 'fall': return 'Earth';
    case 'winter': return 'Water';
    default: return 'Water';
  }
}

/**
 * Get element from zodiac sign
 * @param sign Zodiac sign
 * @returns Element
 */
function getElementFromSign(sign: string): string | null {
  const fireigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  
  sign = sign.toLowerCase();
  
  if (fireigns.includes(sign)) return 'fire';
  if (earthSigns.includes(sign)) return 'earth';
  if (airSigns.includes(sign)) return 'air';
  if (waterSigns.includes(sign)) return 'water';
  
  return null;
}

/**
 * Calculates current planetary positions using accurate astronomy calculations
 * @returns A record of planetary positions
 */
async function calculateCurrentPlanetaryPositions(): Promise<Record<string, any>> {
  try {
    // First try to use the accurate astronomy utility
    const positions = await getAccuratePlanetaryPositions();
    
    if (Object.keys(positions).length > 0) {
      return positions;
    }
    
    // If the above fails or returns empty, try to use the astronomia library
    // Import the astronomia calculator dynamically to avoid issues at build time
    try {
      const { calculatePlanetaryPositions } = await import('@/utils/astronomiaCalculator');
      const astronomiaPositions = calculatePlanetaryPositions(new Date());
      
      if (Object.keys(astronomiaPositions).length > 0) {
        return astronomiaPositions;
      }
    } catch (error) {
      console.error('Error using astronomia calculator:', error);
    }
    
    // If both methods fail, use the fallback positions
    // Import the fallback calculator dynamically
    try {
      const { _calculateFallbackPositions } = await import('@/utils/astrologyUtils');
      const fallbackPositions = _calculateFallbackPositions(new Date());
      
      // Convert the fallback positions (which are just degrees) to proper format
      const formattedPositions: Record<string, any> = {};
      Object.entries(fallbackPositions).forEach(([planet, longitude]) => {
        // Convert longitude to sign and degree
        const signIndex = Math.floor(longitude / 30);
        const degree = longitude % 30;
        
        const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        
        formattedPositions[planet] = {
          Sign: { label: signs[signIndex] },
          Degree: degree,
          ChartPosition: {
            Ecliptic: {
              ArcDegreesInSign: degree
            }
          },
          exactLongitude: longitude
        };
      });
      
      return formattedPositions;
    } catch (error) {
      console.error('Error using fallback position calculator:', error);
    }
    
    // Last resort - return hardcoded minimal positions
    return {
      Sun: { 
        Sign: { label: 'Aries' }, 
        Degree: 15,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 15 } }
      },
      Moon: { 
        Sign: { label: 'Cancer' }, 
        Degree: 10,
        ChartPosition: { Ecliptic: { ArcDegreesInSign: 10 } }
      }
    };
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    // Return empty object as fallback
    return {};
  }
}

/**
 * Calculate zodiac energies based on planetary positions
 * @param positions Record of planetary positions
 * @returns Record of zodiac sign energies
 */
function calculateZodiacEnergies(positions: Record<string, any>): Record<string, number> {
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
    pisces: 0
  };

  // Planetary weights - define the influence strength of each planet
  const planetaryWeights: Record<string, number> = {
    Sun: 0.25,
    Moon: 0.20,
    Mercury: 0.10,
    Venus: 0.10,
    Mars: 0.10,
    Jupiter: 0.10,
    Saturn: 0.10,
    Uranus: 0.05,
    Neptune: 0.05,
    Pluto: 0.05
  };

  // For each planet in the positions
  Object.entries(positions).forEach(([planet, data]) => {
    // Check for data in expected format from accurate astronomy
    if (data && data.Sign && data.Sign.label) {
      const sign = data.Sign.label.toLowerCase();
      if (zodiacEnergies[sign] !== undefined) {
        // Add energy based on the planet's influence
        const planetModifier = planetaryWeights[planet] || 0.05;
        zodiacEnergies[sign] += planetModifier;
      }
    } 
    // Check for data in the format returned by astronomiaCalculator
    else if (data && data.sign) {
      const sign = data.sign.toLowerCase();
      if (zodiacEnergies[sign] !== undefined) {
        const planetModifier = planetaryWeights[planet] || 0.05;
        zodiacEnergies[sign] += planetModifier;
      }
    }
  });

  // Normalize energies to sum to 1
  const totalEnergy = Object.values(zodiacEnergies).reduce((sum, energy) => sum + energy, 0);
  if (totalEnergy > 0) {
    Object.keys(zodiacEnergies).forEach(sign => {
      zodiacEnergies[sign] = zodiacEnergies[sign] / totalEnergy;
    });
  }

  return zodiacEnergies;
}

/**
 * Calculate chakra energies based on zodiac sign energies
 * @param zodiacEnergies Record of zodiac energies
 * @returns Chakra energies
 */
function calculateChakraEnergies(zodiacEnergies: Record<string, number>): ChakraEnergies {
  // Initialize with default values
  const chakraEnergies: ChakraEnergies = {
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    brow: 0,
    crown: 0
  };
  
  // Define mapping from zodiac signs to chakras
  const zodiacToChakraMap: Record<string, keyof ChakraEnergies[]> = {
    // Root chakra is associated with earth signs
    'taurus': ['root'],
    'virgo': ['root'],
    'capricorn': ['root'],
    
    // Sacral chakra is associated with water signs
    'cancer': ['sacral'],
    'scorpio': ['sacral'],
    'pisces': ['sacral'],
    
    // Solar plexus is associated with fire signs
    'aries': ['solarPlexus'],
    'leo': ['solarPlexus'],
    'sagittarius': ['solarPlexus'],
    
    // Heart chakra is associated with air and water
    'libra': ['heart'],
    'aquarius': ['heart'],
    'pisces': ['heart', 'sacral'], // Pisces influences multiple chakras
    
    // Throat chakra is associated with communication
    'gemini': ['throat'],
    'virgo': ['throat', 'root'], // Virgo influences multiple chakras
    
    // Brow/third eye is associated with intuition
    'scorpio': ['brow', 'sacral'], // Scorpio influences multiple chakras
    'pisces': ['brow', 'sacral', 'heart'], // Pisces influences multiple chakras
    
    // Crown chakra is associated with spiritual connection
    'sagittarius': ['crown', 'solarPlexus'], // Sagittarius influences multiple chakras
    'aquarius': ['crown', 'heart'] // Aquarius influences multiple chakras
  };
  
  // Calculate chakra energies based on zodiac energies
  Object.entries(zodiacEnergies).forEach(([sign, energy]) => {
    const chakras = zodiacToChakraMap[sign];
    if (chakras) {
      chakras.forEach(chakra => {
        chakraEnergies[chakra] += energy / chakras.length;
      });
    }
  });
  
  // Normalize chakra energies to sum to 1
  const totalEnergy = Object.values(chakraEnergies).reduce((sum, energy) => sum + energy, 0);
  if (totalEnergy > 0) {
    Object.keys(chakraEnergies).forEach(chakra => {
      chakraEnergies[chakra as keyof ChakraEnergies] = chakraEnergies[chakra as keyof ChakraEnergies] / totalEnergy;
    });
  }
  
  return chakraEnergies;
}

// Default export that includes both the class and the alchemize function
export default { alchemize, calculateCurrentPlanetaryPositions, calculateZodiacEnergies, calculateChakraEnergies }; 
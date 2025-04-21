import { culinaryTraditions } from '../data/cuisines/culinaryTraditions';
import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState,
  AlchemicalCalculationResult,
  ElementalAffinity,
  AstrologicalInfluence,
  Season,
  Element,
  RecipeHarmonyResult,
  LunarPhaseWithSpaces,
  StandardizedAlchemicalResult,
  ChakraEnergies
} from '../types/alchemy';
import { seasonalPatterns } from '../data/integrations/seasonalPatterns';
import { recipeElementalMappings } from '../data/recipes/elementalMappings';
import { PLANETARY_MODIFIERS, RulingPlanet } from '../constants/planets';
import { getZodiacElementalInfluence } from '../utils/zodiacUtils';
import { recipeCalculations } from '../utils/recipeCalculations';
import { getAccuratePlanetaryPositions } from '../utils/accurateAstronomy';

// Import planet data files
import sunData from '../data/planets/sun';
import moonData from '../data/planets/moon';
import jupiterData from '../data/planets/jupiter';
import neptuneData from '../data/planets/neptune';
import plutoData from '../data/planets/pluto';
import uranusData from '../data/planets/uranus';
import ascendantData from '../data/planets/ascendant';
import mercuryData from '../data/planets/mercury';
import marsData from '../data/planets/mars';
import venusData from '../data/planets/venus';
import saturnData from '../data/planets/saturn';

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

// Create a map of planet data for easy access
const planetDataMap: Record<string, unknown> = {
  'sun': sunData,
  'moon': moonData,
  'jupiter': jupiterData, 
  'neptune': neptuneData,
  'pluto': plutoData,
  'uranus': uranusData,
  'ascendant': ascendantData,
  'mercury': mercuryData,
  'mars': marsData,
  'venus': venusData,
  'saturn': saturnData
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
      { ruler: 'mars', element: 'Fire', degree: 0 },
      { ruler: 'sun', element: 'Fire', degree: 10 },
      { ruler: 'jupiter', element: 'Fire', degree: 20 }
    ],
    taurus: [
      { ruler: 'venus', element: 'Earth', degree: 0 },
      { ruler: 'mercury', element: 'Earth', degree: 10 },
      { ruler: 'saturn', element: 'Earth', degree: 20 }
    ],
    gemini: [
      { ruler: 'mercury', element: 'Air', degree: 0 },
      { ruler: 'venus', element: 'Air', degree: 10 },
      { ruler: 'uranus', element: 'Air', degree: 20 }
    ],
    cancer: [
      { ruler: 'moon', element: 'Water', degree: 0 },
      { ruler: 'pluto', element: 'Water', degree: 10 },
      { ruler: 'neptune', element: 'Water', degree: 20 }
    ],
    leo: [
      { ruler: 'sun', element: 'Fire', degree: 0 },
      { ruler: 'jupiter', element: 'Fire', degree: 10 },
      { ruler: 'mars', element: 'Fire', degree: 20 }
    ],
    virgo: [
      { ruler: 'mercury', element: 'Earth', degree: 0 },
      { ruler: 'saturn', element: 'Earth', degree: 10 },
      { ruler: 'venus', element: 'Earth', degree: 20 }
    ],
    libra: [
      { ruler: 'venus', element: 'Air', degree: 0 },
      { ruler: 'uranus', element: 'Air', degree: 10 },
      { ruler: 'mercury', element: 'Air', degree: 20 }
    ],
    scorpio: [
      { ruler: 'pluto', element: 'Water', degree: 0 },
      { ruler: 'neptune', element: 'Water', degree: 10 },
      { ruler: 'moon', element: 'Water', degree: 20 }
    ],
    sagittarius: [
      { ruler: 'jupiter', element: 'Fire', degree: 0 },
      { ruler: 'mars', element: 'Fire', degree: 10 },
      { ruler: 'sun', element: 'Fire', degree: 20 }
    ],
    capricorn: [
      { ruler: 'saturn', element: 'Earth', degree: 0 },
      { ruler: 'venus', element: 'Earth', degree: 10 },
      { ruler: 'mercury', element: 'Earth', degree: 20 }
    ],
    aquarius: [
      { ruler: 'uranus', element: 'Air', degree: 0 },
      { ruler: 'mercury', element: 'Air', degree: 10 },
      { ruler: 'venus', element: 'Air', degree: 20 }
    ],
    pisces: [
      { ruler: 'neptune', element: 'Water', degree: 0 },
      { ruler: 'moon', element: 'Water', degree: 10 },
      { ruler: 'pluto', element: 'Water', degree: 20 }
    ]
  };

  private readonly decanModifiers = PLANETARY_MODIFIERS;
  
  // Add caching system for expensive calculations
  private cache: Record<string, unknown> = {};
  private cacheTimeout: Record<string, number> = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Current state to prevent redundant calculations
  private currentAstrologicalState?: AstrologicalState;
  private currentStateElements?: ElementalProperties;
  private lastPlanetaryUpdate: number = 0;
  private readonly PLANETARY_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  /**
   * Constructor for AlchemicalEngineAdvanced
   */
  constructor() {
    // Initialize the cache
    this.resetCache();
  }
  
  /**
   * Reset the calculation cache
   */
  public resetCache(): void {
    this.cache = {};
    this.cacheTimeout = {};
    this.lastPlanetaryUpdate = 0;
    this.currentAstrologicalState = undefined;
    this.currentStateElements = undefined;
  }
  
  /**
   * Get a cached value or calculate it if not cached
   * @param key - The cache key
   * @param calculateFn - Function to calculate the value if not cached
   * @param forceRefresh - Whether to force a fresh calculation
   * @returns The cached or freshly calculated value
   */
  private getCachedValue<T>(
    key: string, 
    calculateFn: () => T,
    forceRefresh: boolean = false
  ): T {
    const now = Date.now();
    
    // Check if we need to refresh the cached value
    if (
      forceRefresh || 
      this.cache[key] === undefined || 
      !this.cacheTimeout[key] || 
      now > this.cacheTimeout[key]
    ) {
      // Calculate fresh value
      const value = calculateFn();
      
      // Store in cache
      this.cache[key] = value;
      this.cacheTimeout[key] = now + this.CACHE_DURATION;
      
      return value;
    }
    
    // Return cached value
    return this.cache[key] as T;
  }
  
  /**
   * Helper function to safely access AstrologicalState properties
   */
  private getSafeZodiacSign(state: any): ZodiacSign {
    if (state && state.moonSign) {
      return state.moonSign as ZodiacSign;
    } else if (state && state.sunSign) {
      return state.sunSign as ZodiacSign;
    }
    return 'aries'; // Default
  }

  private getSafeLunarPhase(state: any): LunarPhase {
    if (state && state.lunarPhase) {
      return state.lunarPhase as LunarPhase;
    }
    if (state && state.moonPhase) {
      return state.moonPhase as LunarPhase;
    }
    return 'new moon'; // Default
  }

  /**
   * Get or calculate the elemental properties for an astrological state
   * @param astroState - The astrological state to analyze
   * @returns The elemental properties for the state
   */
  public getStateElementalProperties(astroState: AstrologicalState): ElementalProperties {
    // Use cache if state hasn't changed
    if (this.currentAstrologicalState &&
        this.currentStateElements &&
        ((this.currentAstrologicalState as any).moonSign === (astroState as any).moonSign ||
         this.currentAstrologicalState.sunSign === astroState.sunSign) &&
        this.currentAstrologicalState.lunarPhase === astroState.lunarPhase) {
      return this.currentStateElements;
    }
    
    // Create a unique cache key
    const zodiacSign = this.getSafeZodiacSign(astroState);
    const lunarPhase = this.getSafeLunarPhase(astroState);
    const cacheKey = `state_elements_${zodiacSign}_${lunarPhase}`;
    
    return this.getCachedValue(
      cacheKey,
      () => {
        // Calculate elemental properties
        const zodiacElement = this.zodiacElements[zodiacSign || 'aries'];
        const lunarModifier = this.lunarPhaseModifiers[lunarPhase || 'new moon'];
        
        // Create base properties weighted by zodiac
        const properties: ElementalProperties = {
          Fire: 0.1,
          Water: 0.1,
          Earth: 0.1,
          Air: 0.1
        };
        
        // Boost the zodiac element
        properties[zodiacElement] += 0.5;
        
        // Apply lunar phase modifiers
        for (const element of Object.keys(properties) as Array<keyof ElementalProperties>) {
          properties[element] += lunarModifier[element] * 0.2;
        }
        
        // Normalize to ensure sum is 1.0
        const sum = properties.Fire + properties.Water + properties.Earth + properties.Air;
        if (sum > 0) {
          const factor = 1.0 / sum;
          properties.Fire *= factor;
          properties.Water *= factor;
          properties.Earth *= factor;
          properties.Air *= factor;
        }
        
        // Cache for future use
        this.currentAstrologicalState = { ...astroState };
        this.currentStateElements = { ...properties };
        
        return properties;
      }
    );
  }
  
  /**
   * Safely update and normalize elemental properties
   * @param properties - The elemental properties to normalize
   * @returns Normalized elemental properties
   */
  public normalizeElementalProperties(properties: Partial<ElementalProperties>): ElementalProperties {
    // Ensure all properties exist
    const normalized: ElementalProperties = {
      Fire: properties.Fire ?? 0.25,
      Water: properties.Water ?? 0.25,
      Earth: properties.Earth ?? 0.25,
      Air: properties.Air ?? 0.25
    };
    
    // Calculate sum
    const sum = normalized.Fire + normalized.Water + normalized.Earth + normalized.Air;
    
    // Normalize if needed
    if (Math.abs(sum - 1.0) > 0.01) {
      const factor = 1.0 / sum;
      normalized.Fire *= factor;
      normalized.Water *= factor;
      normalized.Earth *= factor;
      normalized.Air *= factor;
    }
    
    return normalized;
  }
  
  /**
   * Get the current planetary positions with caching
   * @param forceRefresh - Whether to force a fresh calculation
   * @returns The current planetary positions
   */
  public async getCurrentPlanetaryPositions(forceRefresh: boolean = false): Promise<Record<string, unknown>> {
    const now = Date.now();
    
    // Check if we need to refresh
    if (forceRefresh || now - this.lastPlanetaryUpdate > this.PLANETARY_UPDATE_INTERVAL) {
      try {
        const positions = await getAccuratePlanetaryPositions();
        this.cache['planetary_positions'] = positions;
        this.lastPlanetaryUpdate = now;
        return positions;
      } catch (error) {
        console.error('Error getting planetary positions:', error);
        // Return cached value or empty object
        return (this.cache['planetary_positions'] || {}) as Record<string, unknown>;
      }
    }
    
    // Return cached value or get fresh one
    return (this.cache['planetary_positions'] || await getAccuratePlanetaryPositions()) as Record<string, unknown>;
  }

  /**
   * Calculate the astrological match between a recipe and the current astrological state
   * with improved error handling and state management
   */
  calculateAstroCuisineMatch(
    recipeElements?: ElementalProperties,
    astrologicalState?: AstrologicalState,
    season?: string,
    cuisine?: string
  ): AlchemicalCalculationResult {
    try {
      // Use a safe copy of recipe elements with default values
      const safeRecipeElements: ElementalProperties = recipeElements 
        ? { ...recipeElements } 
        : { ...DEFAULT_ELEMENTAL_PROPERTIES };
      
      // Ensure all elemental properties exist with defaults if missing
      safeRecipeElements.Fire = safeRecipeElements.Fire ?? 0.25;
      safeRecipeElements.Water = safeRecipeElements.Water ?? 0.25;
      safeRecipeElements.Earth = safeRecipeElements.Earth ?? 0.25;
      safeRecipeElements.Air = safeRecipeElements.Air ?? 0.25;
      
      // Normalize elements to ensure sum is 1.0
      const sum = safeRecipeElements.Fire + safeRecipeElements.Water + 
                 safeRecipeElements.Earth + safeRecipeElements.Air;
      
      if (sum > 0 && Math.abs(sum - 1.0) > 0.01) {
        // Normalize to ensure sum is 1.0
        const factor = 1.0 / sum;
        safeRecipeElements.Fire *= factor;
        safeRecipeElements.Water *= factor;
        safeRecipeElements.Earth *= factor;
        safeRecipeElements.Air *= factor;
      }

      // Find dominant element (safely)
      const dominantElement = Object.entries(safeRecipeElements)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      // Safely handle season normalization
      const defaultSeason: Season = 'winter';
      const normalizedSeason = season?.toLowerCase() || '';
      const validSeason = (normalizedSeason === 'spring' || 
                           normalizedSeason === 'summer' || 
                           normalizedSeason === 'autumn' || 
                           normalizedSeason === 'winter' || 
                           normalizedSeason === 'fall') 
                           ? (normalizedSeason === 'fall' ? 'autumn' : normalizedSeason) as Season 
                           : defaultSeason;
      
      // Safely access seasonal patterns
      const seasonalData = seasonalPatterns[validSeason] || seasonalPatterns.winter;
      
      // Create a safe copy of the astrological state
      const safeAstroState: any = {
        sunSign: this.getSafeZodiacSign(astrologicalState),
        lunarPhase: this.getSafeLunarPhase(astrologicalState),
        activePlanets: Array.isArray(astrologicalState?.activePlanets) 
          ? [...astrologicalState.activePlanets] 
          : ['sun'],
        dominantElement: 'Fire',
        dominantPlanets: []
      };
      
      // Copy over any aspects if they exist
      if (astrologicalState && Array.isArray((astrologicalState as any).aspects)) {
        safeAstroState.aspects = [...(astrologicalState as any).aspects];
      }
      
      // Function to check if string is a valid RulingPlanet
      const isRulingPlanet = (planet: string): planet is RulingPlanet => {
        return Object.keys(PLANETARY_MODIFIERS).includes(planet);
      };
      
      // Enhanced calculation that uses planet data files
      const astronomicalScore = Array.isArray(safeAstroState.activePlanets)
        ? safeAstroState.activePlanets
            .map(planet => {
              // Check if we have detailed planet data
              if (planetDataMap[planet]) {
                const planetData = planetDataMap[planet];
                
                // Check for zodiac-specific data
                const zodiacData = this.getZodiacFoodFocus(planet, safeAstroState.sunSign);
                if (zodiacData && zodiacData.Elements) {
                  // Calculate match with recipe elements
                  let matchScore = 0;
                  Object.entries(zodiacData.Elements).forEach(([element, value]) => {
                    if (safeRecipeElements[element as keyof ElementalProperties]) {
                      matchScore += 
                        (safeRecipeElements[element as keyof ElementalProperties] * 
                         (value as number) * 10);
                    }
                  });
                  return matchScore;
                }
                
                // If no zodiac data, use general planet data
                if (typeof planetData === 'object' && planetData !== null && 'Elements' in planetData) {
                  const elements = planetData.Elements;
                  let matchScore = 0;
                  
                  if (Array.isArray(elements)) {
                    elements.forEach((element: string) => {
                      if (safeRecipeElements[element as keyof ElementalProperties]) {
                        matchScore += safeRecipeElements[element as keyof ElementalProperties] * 5;
                      }
                    });
                  }
                  
                  return matchScore;
                }
              }
              
              // Fallback to original calculation
              const modifier = isRulingPlanet(planet) ? PLANETARY_MODIFIERS[planet] : 0;
              return modifier * 10;
            })
            .reduce((sum, score) => sum + score, 0)
        : 0;
        
      // Aspect match score - added with proper type checking
      const aspectScore = safeAstroState.aspects && Array.isArray(safeAstroState.aspects)
        ? safeAstroState.aspects.reduce((score, aspect) => {
            if (aspect && typeof aspect === 'object' && 'angle' in aspect) {
              // More harmonious aspects give higher scores
              if (aspect.angle === 0 || aspect.angle === 60 || aspect.angle === 120) {
                return score + 5;
              }
            }
            return score;
          }, 0)
        : 0;
      
      // Cuisine compatibility with cache for optimization
      let cuisineCompatibility = 0;
      if (cuisine) {
        cuisineCompatibility = this.getCuisineCompatibility(cuisine, safeAstroState, validSeason);
      }
      
      // Generate cuisine-specific recommendations based on planet data
      const recommendations: string[] = [];
      
      // Get dominant planet based on sign
      let dominantPlanet = 'sun'; // Default to sun
      if (safeAstroState.sunSign) {
        const signData = this.decans[safeAstroState.sunSign];
        if (signData && signData.length > 0) {
          dominantPlanet = signData[0].ruler;
        }
      }
      
      // Add recommendations from planet data
      if (planetDataMap[dominantPlanet]) {
        const planetData = planetDataMap[dominantPlanet];
        
        // Add food associations with proper type checking
        if (typeof planetData === 'object' && 
            planetData !== null && 
            'FoodAssociations' in planetData && 
            Array.isArray(planetData.FoodAssociations)) {
          const randomIndex = Math.floor(Math.random() * planetData.FoodAssociations.length);
          recommendations.push(
            `Consider adding ${planetData.FoodAssociations[randomIndex]} to enhance ${dominantPlanet}'s influence.`
          );
        }
        
        // Add culinary influence with proper type checking
        if (typeof planetData === 'object' && 
            planetData !== null && 
            'CulinaryInfluences' in planetData && 
            Array.isArray(planetData.CulinaryInfluences)) {
          const randomIndex = Math.floor(Math.random() * planetData.CulinaryInfluences.length);
          recommendations.push(planetData.CulinaryInfluences[randomIndex]);
        }
      }
      
      // Add recommendation based on dominant element
      recommendations.push(
        `Try focusing on ${dominantElement}-based dishes for optimal harmony.`
      );
      
      if (cuisine) {
        recommendations.push(
          `This ${cuisine} cuisine aligns well with your current astrological state.`
        );
      }
      
      // Calculate total score with weighted components
      // Use a more balanced approach that weights all factors appropriately
      const totalScore = (astronomicalScore * 0.4) + (aspectScore * 0.2) + (cuisineCompatibility * 0.4);
      const normalizedScore = Math.min(Math.max(totalScore / 100, 0), 1);
      
      // Return the result with proper type structure
      return {
        score: normalizedScore,
        elementalMatch: cuisineCompatibility,
        seasonalMatch: seasonalData.elementalInfluence[dominantElement] || 0.5,
        astrologicalMatch: astronomicalScore / 10, // Scale to 0-1 range
        dominantElement: dominantElement as keyof ElementalProperties,
        recommendations: recommendations,
        warnings: []
      };
    } catch (error) {
      // Graceful error handling
      console.error('Error in calculateAstroCuisineMatch:', error);
      // Return a safe default result
      return {
        score: 0.5,
        elementalMatch: 0.5,
        seasonalMatch: 0.5,
        astrologicalMatch: 0.5,
        dominantElement: 'Earth',
        recommendations: [
          'Balance your elemental energies',
          'Try focusing on Earth-based dishes for optimal harmony.'
        ],
        warnings: [
          'Failed to calculate astrological match due to error',
          error instanceof Error ? error.message : 'Unknown error'
        ]
      };
    }
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
    if (astroState?.activePlanets && tradition.elementalAlignment) {
      // Get the dominant element in the cuisine
      const dominantElement = Object.entries(tradition.elementalAlignment)
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
      if (tradition.seasonalPreferences && 
          tradition.seasonalPreferences.some(s => s.toLowerCase() === normalizedSeason)) {
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
    recipesunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    let power = 0;

    // Using properties that exist in AstrologicalState
    const recipeElement = this.zodiacElements[recipesunSign];
    const currentZodiacElement = this.zodiacElements[astrologicalState.sunSign];
    const moonSignElement = this.zodiacElements[astrologicalState.moonSign];

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
      planet: 'sun', // Default to sun as primary influence
      sign: astrologicalState.sunSign,
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
   * with enhanced planet data
   */
  private getCurrentDecan(sign: ZodiacSign, degrees: number): Decan | null {
    const signDecans = this.decans[sign];
    if (!signDecans) return null;

    const decan = signDecans.find((decan, index) => {
      const nextDegree = index < 2 ? signDecans[index + 1].degree : 30;
      return degrees >= decan.degree && degrees < nextDegree;
    }) || null;
    
    if (decan && planetDataMap[decan.ruler]) {
      // Enhance with detailed planet data if available
      const planetData = planetDataMap[decan.ruler];
      
      // Add proper type guard for planetData.Dignity
      if (typeof planetData === 'object' && 
          planetData !== null && 
          'Dignity' in planetData && 
          typeof planetData.Dignity === 'object' && 
          planetData.Dignity !== null &&
          'Effect' in planetData.Dignity &&
          typeof planetData.Dignity.Effect === 'object' &&
          planetData.Dignity.Effect !== null &&
          sign in planetData.Dignity.Effect) {
        // Add dignity effect if the planet is in its rulership, exaltation, etc.
        // Use a type assertion to add the property
        (decan as any).dignityEffect = planetData.Dignity.Effect[sign];
      }
    }
    
    return decan;
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
    // Create a unique cache key
    const cacheKey = `recipe_harmony_${recipeName}_${astroState.moonSign || astroState.sunSign}_${astroState.lunarPhase}`;
    
    return this.getCachedValue(
      cacheKey,
      () => {
        try {
          // Validate and normalize user elements
          const normalizedUserElements = this.normalizeElementalProperties(userElements);
          
          // Ensure recipe exists in mappings
          if (!recipeElementalMappings[recipeName]) {
            return {
              name: recipeName,
              score: 0.5,
              dominantElement: 'Earth',
              planetaryActivators: ['sun'],
              details: { error: 'Recipe not found in elemental mappings' },
              // Add missing properties required by RecipeHarmonyResult
              recipeSpecificBoost: 0,
              optimalTimingWindows: [],
              elementalMultipliers: {},
              // Add required properties from AlchemicalCalculationResult
              elementalMatch: 0,
              seasonalMatch: 0,
              astrologicalMatch: 0,
              recommendations: [],
              warnings: ['Recipe not found in elemental mappings']
            };
          }
          
          const recipe = recipeElementalMappings[recipeName];
          
          // Use cached or calculated astrological state elements
          const astroStateElements = this.getStateElementalProperties(astroState);
          
          // Ensure recipe elements are properly structured
          const recipeElements = this.normalizeElementalProperties(recipe.elementalProperties);
          
          // Calculate dominant element
          const dominantElement = Object.entries(recipeElements)
            .sort(([,a], [,b]) => b - a)[0][0];
          
          // Calculate harmony for different influence sources
          const elementHarmony = this.calculateElementalHarmony(recipeElements, normalizedUserElements);
          const astroHarmony = this.calculateElementalHarmony(recipeElements, astroStateElements);
          
          // Calculate zodiac matching score
          const zodiacScore = this.zodiacMatch(recipe, astroState);
          
          // Calculate planetary aspects matching
          let planetaryScore = 0;
          if (recipe.astrologicalProfile?.rulingPlanets && Array.isArray(astroState.activePlanets)) {
            const matchingPlanets = recipe.astrologicalProfile.rulingPlanets
              .filter(planet => astroState.activePlanets.includes(planet as any));
              
            planetaryScore = matchingPlanets.length / recipe.astrologicalProfile.rulingPlanets.length;
          }
          
          // Calculate season bonus (if available)
          let seasonBonus = 0;
          // Use seasonal recommendation if available
          if (recipe.seasonalRecommendation && recipe.seasonalRecommendation.length > 0) {
            // Give a small bonus if there are any seasonal recommendations
            seasonBonus = 0.1;
          }
          
          // Weight the different components
          const weightedScore = (
            (elementHarmony * 0.35) + // User preferences
            (astroHarmony * 0.25) +   // Astrological alignment
            (zodiacScore * 0.20) +    // Zodiac sign match
            (planetaryScore * 0.15) + // Planetary activators
            (seasonBonus * 0.05)      // Season bonus
          );
          
          // Ensure score is within 0-1 range
          const finalScore = Math.min(Math.max(weightedScore, 0), 1);
          
          // Get relevant planetary activators
          const planetaryActivators = recipe.astrologicalProfile?.rulingPlanets || ['sun'];
          
          // Generate recommendations based on the calculation
          const recommendations = [
            `This recipe has a ${(finalScore * 100).toFixed(0)}% harmony with your astrological state.`,
            `Best prepared when ${planetaryActivators[0]} is prominent.`
          ];
          
          // Generate warnings if score is low
          const warnings = finalScore < 0.4 ? 
            [`This recipe may not be ideal under the current astrological conditions.`] : [];
          
          // Calculate recipe specific boost based on element matching
          const recipeSpecificBoost = elementHarmony * 0.2;
          
          // Determine optimal timing windows based on the planetary activators
          const optimalTimingWindows = planetaryActivators.map(planet => 
            `During ${planet} hours (${this.getPlanetaryTimeWindow(planet)})`
          );
          
          // Create elemental multipliers
          const elementalMultipliers: Record<string, number> = {
            'Fire': recipeElements.Fire > 0.5 ? 1.2 : 0.9,
            'Water': recipeElements.Water > 0.5 ? 1.2 : 0.9,
            'Earth': recipeElements.Earth > 0.5 ? 1.2 : 0.9,
            'Air': recipeElements.Air > 0.5 ? 1.2 : 0.9,
          };
          
          return {
            name: recipeName,
            score: finalScore,
            dominantElement,
            planetaryActivators,
            details: {
              elementHarmony,
              astroHarmony,
              zodiacScore,
              planetaryScore,
              seasonBonus
            },
            // Add properties required by AlchemicalCalculationResult
            elementalMatch: elementHarmony,
            seasonalMatch: seasonBonus,
            astrologicalMatch: astroHarmony,
            recommendations,
            warnings,
            // Add properties required by RecipeHarmonyResult
            recipeSpecificBoost,
            optimalTimingWindows,
            elementalMultipliers
          };
        } catch (error) {
          console.error(`Error calculating recipe harmony for ${recipeName}:`, error);
          // Return a safe default result
          return {
            name: recipeName,
            score: 0.5,
            dominantElement: 'Earth',
            planetaryActivators: ['sun'],
            details: { 
              error: error instanceof Error ? error.message : 'Unknown error',
              elementHarmony: 0,
              astroHarmony: 0,
              zodiacScore: 0,
              planetaryScore: 0
            },
            // Add properties required by AlchemicalCalculationResult
            elementalMatch: 0,
            seasonalMatch: 0,
            astrologicalMatch: 0,
            recommendations: ['Unable to calculate recipe harmony.'],
            warnings: ['An error occurred while calculating recipe harmony.'],
            // Add properties required by RecipeHarmonyResult
            recipeSpecificBoost: 0,
            optimalTimingWindows: [],
            elementalMultipliers: {
              'Fire': 1.0,
              'Water': 1.0,
              'Earth': 1.0,
              'Air': 1.0
            }
          };
        }
      }
    );
  }
  
  /**
   * Helper method to get time window for a planetary hour
   * @param planet Name of the planet
   * @returns Time window description
   */
  private getPlanetaryTimeWindow(planet: string): string {
    const planetWindows: Record<string, string> = {
      'sun': 'sunrise to 1-2 hours after',
      'Moon': 'early evening and night',
      'Mercury': 'mid-morning to noon',
      'Venus': 'dawn and dusk',
      'Mars': 'mid-day',
      'Jupiter': 'late afternoon',
      'Saturn': 'late night',
      'Uranus': 'midnight',
      'Neptune': 'before dawn',
      'Pluto': 'during astronomical twilight'
    };
    
    return planetWindows[planet] || 'anytime';
  }
  
  /**
   * Calculate zodiac compatibility between recipe and current astrological state
   * @param recipe Recipe elemental mapping
   * @param astroState Current astrological state
   * @returns Compatibility score between 0-1
   */
  private zodiacMatch(recipe: any, astroState: AstrologicalState): number {
    // Return 0.5 if recipe doesn't have astrological profile
    if (!recipe.astrologicalProfile || !recipe.astrologicalProfile.favorableZodiac) {
      return 0.5;
    }
    
    const favorableZodiac = recipe.astrologicalProfile.favorableZodiac || [];
    const unfavorableZodiac = recipe.astrologicalProfile.unfavorableZodiac || [];
    
    // Check if current zodiac sign is in favorable list
    if (favorableZodiac.includes(astroState.sunSign)) {
      return 0.9;
    }
    
    // Check if current zodiac sign is in unfavorable list
    if (unfavorableZodiac.includes(astroState.sunSign)) {
      return 0.2;
    }
    
    // Check moon sign if available
    if (astroState.moonSign) {
      if (favorableZodiac.includes(astroState.moonSign)) {
        return 0.8;
      }
      if (unfavorableZodiac.includes(astroState.moonSign)) {
        return 0.3;
      }
    }
    
    // Default compatibility if no specific matches
    return 0.5;
  }
  
  /**
   * Calculate harmony between two elemental profiles
   * @param elements1 First elemental profile
   * @param elements2 Second elemental profile
   * @returns Harmony score between 0-1
   */
  private calculateElementalHarmony(
    elements1: ElementalProperties,
    elements2: ElementalProperties
  ): number {
    try {
      // Using cosine similarity with element-specific reinforcement
      const elementKeys = ['Fire', 'Water', 'Earth', 'Air'];
      
      // Extract values into vectors for cosine similarity calculation
      const vector1 = elementKeys.map(key => elements1[key as keyof ElementalProperties] || 0);
      const vector2 = elementKeys.map(key => elements2[key as keyof ElementalProperties] || 0);
      
      // Calculate dot product
      let dotProduct = 0;
      let magnitude1 = 0;
      let magnitude2 = 0;
      
      for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
      }
      
      // Avoid division by zero
      if (magnitude1 === 0 || magnitude2 === 0) {
        return 0.5; // Default score if either vector has zero magnitude
      }
      
      // Calculate cosine similarity (ranges from 0 to 1 for positive values)
      const similarity = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
      
      // Elemental reinforcement - add bonus when both profiles have high values
      // of the same element, following the principle that elements reinforce themselves
      let elementalReinforcementBonus = 0;
      
      for (const element of elementKeys) {
        const value1 = elements1[element as keyof ElementalProperties] || 0;
        const value2 = elements2[element as keyof ElementalProperties] || 0;
        
        // Calculate reinforcement - higher when both have significant amounts of the same element
        // We use the product which is highest when both values are high
        const reinforcement = value1 * value2 * 0.3;
        elementalReinforcementBonus += reinforcement;
      }
      
      // Cap the bonus to a reasonable range
      elementalReinforcementBonus = Math.min(0.3, elementalReinforcementBonus);
      
      // Calculate dominant elements for both profiles
      const dominant1 = this.getDominantElement(elements1);
      const dominant2 = this.getDominantElement(elements2);
      
      // Apply dominant element harmony - highest when the same element is dominant in both
      let dominantElementBonus = 0;
      if (dominant1 && dominant2 && dominant1 === dominant2) {
        // Same dominant element indicates strong harmony
        dominantElementBonus = 0.15;
      } else if (dominant1 && dominant2) {
        // Different dominant elements still have good compatibility
        dominantElementBonus = 0.05;
      }
      
      // Final harmony score combines all factors
      const harmonyScore = (
        similarity * 0.6 +                   // Base compatibility (60%)
        elementalReinforcementBonus +        // Element reinforcement bonus (up to 30%)
        dominantElementBonus                 // Dominant element bonus (5-15%)
      );
      
      // Normalize score to 0-1 range
      return Math.min(1.0, Math.max(0.0, harmonyScore));
    } catch (error) {
      console.error('Error calculating elemental harmony:', error);
      return 0.5; // Default score on error
    }
  }
  
  /**
   * Get the dominant element from an elemental profile
   * @param elements Elemental properties
   * @returns Dominant element name or null if all equal
   */
  private getDominantElement(elements: ElementalProperties): string | null {
    const entries = Object.entries(elements);
    if (entries.length === 0) return null;
    
    // Sort elements by value (descending)
    entries.sort((a, b) => b[1] - a[1]);
    
    // Check if the highest element is significantly larger than the second
    if (entries.length > 1 && entries[0][1] > entries[1][1] * 1.2) {
      return entries[0][0]; // Return dominant element name
    } else if (entries.length === 1) {
      return entries[0][0]; // Only one element
    }
    
    return null; // No clearly dominant element
  }

  /**
   * Calculate astrological influence based on astrological state
   * with improved planet-specific data
   */
  private calculateAstrologicalInfluence(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    try {
      // Updated to use planet-specific data
      const sunSign = this.getSafeZodiacSign(astrologicalState);
      const moonSign = astrologicalState.moonSign || 'cancer';
      
      // Initialize result with base values
      const result: ElementalProperties = {
        Fire: 0.1,
        Water: 0.1,
        Earth: 0.1,
        Air: 0.1
      };
      
      // Get sun influence from sun data
      if (sunData.PlanetSpecific && 
          sunData.PlanetSpecific.ZodiacTransit && 
          sunData.PlanetSpecific.ZodiacTransit[sunSign] && 
          sunData.PlanetSpecific.ZodiacTransit[sunSign].Elements) {
        
        const elements = sunData.PlanetSpecific.ZodiacTransit[sunSign].Elements;
        Object.entries(elements).forEach(([element, value]) => {
          if (result[element as keyof ElementalProperties] !== undefined) {
            result[element as keyof ElementalProperties] += (value as number) * 0.4; // sun has strong influence
          }
        });
      }
      
      // Get moon influence from moon data
      if (moonData.PlanetSpecific && 
          (moonData.PlanetSpecific as any).Lunar && 
          (moonData.PlanetSpecific as any).Lunar.Phases) {
        
        // Normalize lunar phase name to match the data structure (capitalization)
        const normalizedLunarPhase = this.normalizeLunarPhase(astrologicalState.lunarPhase);
        
        if ((moonData.PlanetSpecific as any).Lunar.Phases[normalizedLunarPhase]) {
          const phaseData = (moonData.PlanetSpecific as any).Lunar.Phases[normalizedLunarPhase];
          
          if (typeof phaseData === 'object') {
            // Add these properties to the result if they exist
            if (typeof phaseData.Spirit === 'number') result.Spirit += phaseData.Spirit * 0.3;
            if (typeof phaseData.Essence === 'number') result.Essence += phaseData.Essence * 0.3;
            if (typeof phaseData.Matter === 'number') result.Matter += phaseData.Matter * 0.3;
            if (typeof phaseData.Substance === 'number') result.Substance += phaseData.Substance * 0.3;
          }
        }
      }
      
      // Add influence from other active planets
      if (astrologicalState.activePlanets && Array.isArray(astrologicalState.activePlanets)) {
        astrologicalState.activePlanets.forEach(planet => {
          const planetData = planetDataMap[planet];
          if (typeof planetData === 'object' && 
              planetData !== null && 
              'Elements' in planetData && 
              Array.isArray(planetData.Elements)) {
            const elements = planetData.Elements;
            elements.forEach((element: string) => {
              if (result[element as keyof ElementalProperties] !== undefined) {
                result[element as keyof ElementalProperties] += 0.05;
              }
            });
          }
        });
      }
      
      // Normalize to ensure sum is 1.0
      const sum = result.Fire + result.Water + result.Earth + result.Air;
      if (sum > 0) {
        const factor = 1.0 / sum;
        result.Fire *= factor;
        result.Water *= factor;
        result.Earth *= factor;
        result.Air *= factor;
      }
      
      return result;
    } catch (error) {
      console.error('Error in calculateAstrologicalInfluence:', error);
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }
  }

  /**
   * Get astrological modifiers based on astrological state
   * with enhanced planet data
   */
  private getAstrologicalModifiers(astrologicalState: AstrologicalState): ElementalProperties {
    // Default modifiers
    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    // Current zodiac element can boost the corresponding element
    const currentZodiacElement = this.zodiacElements[astrologicalState.sunSign] || 'Fire';
    
    // Get moon sign element if available
    const moonSignElement = astrologicalState.moonSign ? this.zodiacElements[astrologicalState.moonSign] : undefined;
    
    // Additional code remained unchanged...
    
    // If solar data available, use it to influence elements
    if (sunData && 
      sunData.PlanetSpecific && 
      sunData.PlanetSpecific.ZodiacTransit && 
      sunData.PlanetSpecific.ZodiacTransit[astrologicalState.sunSign] &&
      sunData.PlanetSpecific.ZodiacTransit[astrologicalState.sunSign].Elements) {
      
      const elements = sunData.PlanetSpecific.ZodiacTransit[astrologicalState.sunSign].Elements;
      // Add solar element influence
      if (elements) {
        Object.entries(elements).forEach(([element, value]) => {
          if (baseModifiers[element as keyof ElementalProperties] !== undefined) {
            baseModifiers[element as keyof ElementalProperties] += Number(value);
          }
        });
      }
    }
    
    // Boost current zodiac element
    baseModifiers[currentZodiacElement] += 0.2;

    // Add moon influence using moon data
    if (moonData.PlanetSpecific && 
        (moonData.PlanetSpecific as any).Lunar && 
        (moonData.PlanetSpecific as any).Lunar.Phases) {
      
      // Normalize lunar phase name to match the data structure (capitalization)
      const normalizedLunarPhase = this.normalizeLunarPhase(astrologicalState.lunarPhase);
      
      if ((moonData.PlanetSpecific as any).Lunar.Phases[normalizedLunarPhase]) {
        const phaseData = (moonData.PlanetSpecific as any).Lunar.Phases[normalizedLunarPhase];
        // Apply the lunar phase data to the appropriate elements
        if (phaseData && typeof phaseData === 'object' && phaseData.CulinaryEffect) {
          baseModifiers.Water += 0.1; // Enhance water element for lunar influences
        }
      }
    } else {
      // Fallback to simple enhancement if moonSignElement is defined
      if (typeof moonSignElement !== 'undefined') {
        baseModifiers[moonSignElement] += 0.1;
      }
    }

    // Apply lunar phase modifiers as in the original code
    const lunarModifiers = this.lunarPhaseModifiers[astrologicalState.lunarPhase] || {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25
    };

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    // Normalize to sum to 1.0
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

  /**
   * Get planetary food associations based on planet name
   * @param planet The planet name
   * @returns Array of food associations
   */
  getPlanetaryFoodAssociations(planet: string): string[] {
    const planetData = planetDataMap[planet];
    if (planetData && 
        typeof planetData === 'object' && 
        'FoodAssociations' in planetData && 
        Array.isArray(planetData.FoodAssociations)) {
      return planetData.FoodAssociations;
    }
    return [];
  }

  /**
   * Get planetary flavor profile based on planet name
   * @param planet The planet name
   * @returns Flavor profile or null if not found
   */
  getPlanetaryFlavorProfile(planet: string): Record<string, number> | null {
    const planetData = planetDataMap[planet];
    if (planetData && 
        typeof planetData === 'object' && 
        'FlavorProfiles' in planetData && 
        planetData.FlavorProfiles &&
        typeof planetData.FlavorProfiles === 'object') {
      return planetData.FlavorProfiles as Record<string, number>;
    }
    return null;
  }

  /**
   * Get culinary influences for a planet
   * @param planet The planet name
   * @returns Array of culinary influences
   */
  getPlanetaryCulinaryInfluences(planet: string): string[] {
    const planetData = planetDataMap[planet];
    if (planetData && 
        typeof planetData === 'object' && 
        'CulinaryInfluences' in planetData && 
        Array.isArray(planetData.CulinaryInfluences)) {
      return planetData.CulinaryInfluences;
    }
    return [];
  }

  /**
   * Get zodiac-specific food focus for a planet
   * @param planet The planet name
   * @param sign The zodiac sign
   * @returns The food focus information or null if not found
   */
  getZodiacFoodFocus(planet: string, sign: ZodiacSign): Record<string, unknown> | null {
    const planetData = planetDataMap[planet.toLowerCase()];
    if (
      planetData && 
      typeof planetData === 'object' &&
      'PlanetSpecific' in planetData &&
      planetData.PlanetSpecific &&
      typeof planetData.PlanetSpecific === 'object' &&
      'ZodiacTransit' in planetData.PlanetSpecific &&
      planetData.PlanetSpecific.ZodiacTransit && 
      typeof planetData.PlanetSpecific.ZodiacTransit === 'object' &&
      sign in planetData.PlanetSpecific.ZodiacTransit
    ) {
      return planetData.PlanetSpecific.ZodiacTransit[sign] as Record<string, unknown>;
    }
    return null;
  }

  /**
   * Get planetary alchemical properties
   * @param planet The planet name
   * @returns Alchemical properties or null if not found
   */
  getPlanetaryAlchemicalProperties(planet: string): Record<string, number> | null {
    const planetData = planetDataMap[planet.toLowerCase()];
    if (
      planetData && 
      typeof planetData === 'object' &&
      'Alchemy' in planetData &&
      planetData.Alchemy
    ) {
      return planetData.Alchemy as Record<string, number>;
    }
    return null;
  }

  /**
   * Normalize lunar phase string to match the expected format in the data
   * @param phase The lunar phase to normalize
   * @returns Normalized lunar phase string
   */
  private normalizeLunarPhase(phase: string): string {
    // First convert to lowercase
    const lowercasePhase = phase.toLowerCase();
    
    // Map of lowercase phases to correctly capitalized phases
    const phaseMap: Record<string, string> = {
      'new moon': 'New Moon',
      'waxing crescent': 'Waxing Crescent',
      'first quarter': 'First Quarter',
      'waxing gibbous': 'Waxing Gibbous',
      'full moon': 'Full Moon',
      'waning gibbous': 'Waning Gibbous',
      'last quarter': 'Last Quarter',
      'waning crescent': 'Waning Crescent'
    };
    
    return phaseMap[lowercasePhase] || phase; // Return mapped value or original if not found
  }
}

/**
 * Calculate alchemical properties from birth information and horoscope data
 * with improved performance and error handling and planet data integration
 */
export function alchemize(
  birthInfo: BirthInfo, 
  horoscopeDict: HoroscopeData
): AlchemicalResult {
  try {
    // Start with default result to ensure we always return something valid
    const defaultResult: AlchemicalResult = {
      dominantElement: 'Fire',
      elementalState: { ...DEFAULT_ELEMENTAL_PROPERTIES },
      aspectStrengths: [],
      planetaryInfluences: [],
      moonPhase: 'new moon',
      recommendation: 'Balance your elemental energies',
      elementalDistribution: { ...DEFAULT_ELEMENTAL_PROPERTIES },
      season: 'spring',
      zodiacEnergies: {},
      // Add required properties from StandardizedAlchemicalResult
      elementalBalance: {
        fire: 0.25,
        earth: 0.25,
        air: 0.25,
        water: 0.25
      },
      spirit: 0.25,
      essence: 0.25,
      matter: 0.25,
      substance: 0.25,
      // Add optional properties with default values
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      energy: 0.5
    };

    // Validate input
    if (!birthInfo || !horoscopeDict || !horoscopeDict.tropical) {
      console.error('Invalid input to alchemize function');
      return {
        ...defaultResult,
        error: 'Invalid input data'
      };
    }

    // Process celestial bodies from tropical data safely
    const celestialBodies = horoscopeDict.tropical.CelestialBodies || {};
    
    // Extract sun data
    const sun = celestialBodies.sun as CelestialBody;
    if (!sun || !sun.Sign || !sun.Sign.label) {
      console.error('Missing sun sign data');
      return {
        ...defaultResult,
        error: 'Missing sun sign data'
      };
    }
    
    // Process sun sign
    const sunSign = sun.Sign.label.toLowerCase() as ZodiacSign;
    
    // Get element from sun sign
    const sunElement = getElementFromSign(sunSign);
    if (!sunElement) {
      console.error(`Invalid sun sign: ${sunSign}`);
      return {
        ...defaultResult,
        error: `Invalid sun sign: ${sunSign}`
      };
    }
    
    // Determine current season based on sun sign
    const season = getSeasonFromsunSign(sunSign);
    
    // Get moon data safely
    const moon = celestialBodies.moon as CelestialBody;
    const moonSign = moon?.Sign?.label?.toLowerCase() as ZodiacSign;
    const moonElement = getElementFromSign(moonSign || 'cancer');
    
    // Create a map to store element weights
    const elementWeights: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    // Use planet data files for more accurate elemental weights
    // Add sun influence using sun data
    if (sunData.PlanetSpecific && 
        sunData.PlanetSpecific.ZodiacTransit && 
        sunData.PlanetSpecific.ZodiacTransit[sunSign] && 
        sunData.PlanetSpecific.ZodiacTransit[sunSign].Elements) {
      
      const elements = sunData.PlanetSpecific.ZodiacTransit[sunSign].Elements;
      Object.entries(elements).forEach(([element, value]) => {
        if (elementWeights[element as keyof ElementalProperties] !== undefined) {
          elementWeights[element as keyof ElementalProperties] += (value as number) * 0.4;
        }
      });
    } else {
      // Fallback to simple addition
      elementWeights[sunElement as keyof ElementalProperties] += 0.4;
    }
    
    // Add moon influence using moon data
    if (moonSign && moonData.PlanetSpecific && 
        moonData.PlanetSpecific.ZodiacTransit && 
        moonData.PlanetSpecific.ZodiacTransit[moonSign] && 
        moonData.PlanetSpecific.ZodiacTransit[moonSign]) {
      
      // If specific moon sign data exists
      const moonInfluence = moonData.PlanetSpecific.ZodiacTransit[moonSign];
      if (moonInfluence.Elements) {
        Object.entries(moonInfluence.Elements).forEach(([element, value]) => {
          if (elementWeights[element as keyof ElementalProperties] !== undefined) {
            elementWeights[element as keyof ElementalProperties] += (value as number) * 0.3;
          }
        });
      }
    } else if (moonElement) {
      // Fallback to simple addition
      elementWeights[moonElement as keyof ElementalProperties] += 0.3;
    }
    
    // Process remaining planets with enhanced planet data
    const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const planetaryInfluences: AstrologicalInfluence[] = [];
    
    // Process each planet's elemental influence
    for (const planetName of planetNames) {
      try {
        const planet = celestialBodies[planetName] as CelestialBody;
        if (planet?.Sign?.label) {
          const planetSign = planet.Sign.label.toLowerCase() as ZodiacSign;
          
          // Check if we have detailed planet data
          if (planetDataMap[planetName]) {
            const planetData = planetDataMap[planetName];
            
            // Use zodiac-specific data if available
            if (planetData && 
                typeof planetData === 'object' && 
                'PlanetSpecific' in planetData &&
                planetData.PlanetSpecific && 
                typeof planetData.PlanetSpecific === 'object' &&
                'ZodiacTransit' in planetData.PlanetSpecific &&
                planetData.PlanetSpecific.ZodiacTransit && 
                typeof planetData.PlanetSpecific.ZodiacTransit === 'object' &&
                planetSign in planetData.PlanetSpecific.ZodiacTransit && 
                planetData.PlanetSpecific.ZodiacTransit[planetSign] &&
                typeof planetData.PlanetSpecific.ZodiacTransit[planetSign] === 'object' &&
                'Elements' in planetData.PlanetSpecific.ZodiacTransit[planetSign]) {
              
              const elements = planetData.PlanetSpecific.ZodiacTransit[planetSign].Elements;
              Object.entries(elements).forEach(([element, value]) => {
                if (elementWeights[element as keyof ElementalProperties] !== undefined) {
                  // Weight outer planets less
                  const weight = planetName === 'mercury' || planetName === 'venus' || planetName === 'mars' ? 0.05 : 0.025;
                  elementWeights[element as keyof ElementalProperties] += (value as number) * weight;
                }
              });
              
              // Store planetary influence with detailed information
              planetaryInfluences.push({
                planet: planetName,
                sign: planetSign,
                element: Object.entries(elements)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0][0] as Element,
                strength: Object.entries(elements)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0][1] as number
              });
              
              continue; // Skip the fallback
            }
          }
          
          // Fallback to original method
          const planetElement = getElementFromSign(planetSign);
          if (planetElement) {
            // Add to element weights (with diminishing influence for outer planets)
            const weight = planetName === 'mercury' || planetName === 'venus' || planetName === 'mars' ? 0.05 : 0.025;
            elementWeights[planetElement as keyof ElementalProperties] += weight;
            
            // Store planetary influence
            planetaryInfluences.push({
              planet: planetName,
              sign: planetSign,
              element: planetElement as Element,
              strength: weight * 10
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing planet ${planetName}:`, error);
        // Continue with other planets
      }
    }
    
    // Process aspects safely
    const aspects = horoscopeDict.tropical.Aspects || {};
    const aspectStrengths: AstrologicalInfluence[] = [];
    
    // Process key aspects
    for (const [aspectName, aspectData] of Object.entries(aspects)) {
      try {
        if (typeof aspectData === 'object' && aspectData && 'body1' in aspectData && 'body2' in aspectData) {
          const aspect = aspectData as any;
          
          // Only include significant aspects
          if (aspect.angle === 0 || aspect.angle === 60 || aspect.angle === 90 || 
              aspect.angle === 120 || aspect.angle === 180) {
            
            // Calculate aspect strength (keep this logic as it relates to astronomical principles)
            const harmonious = aspect.angle === 0 || aspect.angle === 60 || aspect.angle === 120;
            let strength = harmonious ? 0.1 : 0.05; // All aspects contribute positively, but harmonious ones more so
            
            // Extract the planetary bodies involved in the aspect
            const body1 = aspect.body1 as string;
            const body2 = aspect.body2 as string;
            const body1Sign = aspect.body1Sign?.toLowerCase() as ZodiacSign;
            const body2Sign = aspect.body2Sign?.toLowerCase() as ZodiacSign;
            
            // Get the default element for the first planet (or fallback to a default)
            let elementContribution: Element = 'Fire'; // Default fallback
            
            // Try to get proper planetary element from planetDataMap
            const planetData = planetDataMap[body1];
            if (planetData && 
                typeof planetData === 'object' && 
                planetData !== null && 
                'Elements' in planetData && 
                Array.isArray(planetData.Elements) && 
                planetData.Elements.length > 0) {
              // Use the first element associated with the planet (day element)
              elementContribution = planetData.Elements[0] as Element;
              
              // Check if planet is in its ruling sign to boost its elemental contribution
              const body1Element = getElementFromSign(body1Sign);
              if (body1Element && body1Element.toLowerCase() === elementContribution.toLowerCase()) {
                // Planet is in a sign of its own element, strengthening its contribution
                strength *= 1.2;
              }
            }
            
            aspectStrengths.push({
              planet: `${body1}-${body2}`,
              sign: body1Sign || 'aries',
              element: elementContribution,
              strength: strength * 10
            });
            
            // Modify element weights based on aspect
            const body1Element = getElementFromSign(aspect.body1Sign?.toLowerCase() as ZodiacSign);
            const body2Element = getElementFromSign(aspect.body2Sign?.toLowerCase() as ZodiacSign);
            
            if (body1Element && harmonious) {
              elementWeights[body1Element as keyof ElementalProperties] += 0.025;
            }
            
            if (body2Element && harmonious) {
              elementWeights[body2Element as keyof ElementalProperties] += 0.025;
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing aspect ${aspectName}:`, error);
        // Continue with other aspects
      }
    }
    
    // Normalize element weights
    const sum = Object.values(elementWeights).reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      for (const element of Object.keys(elementWeights) as Array<keyof ElementalProperties>) {
        elementWeights[element] /= sum;
      }
    } else {
      // If sum is 0, use default values
      Object.assign(elementWeights, DEFAULT_ELEMENTAL_PROPERTIES);
    }
    
    // Determine dominant element
    const dominantElement = Object.entries(elementWeights)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Generate recommendation based on dominant element
    const recommendation = generateRecommendation(dominantElement);
    
    // Create the result object
    const result: AlchemicalResult = {
      dominantElement,
      elementalState: { ...elementWeights },
      aspectStrengths,
      planetaryInfluences,
      moonPhase: 'new moon', // Default, would need calculation based on moon-sun angle
      recommendation,
      elementalDistribution: { ...elementWeights },
      season,
      zodiacEnergies: {
        [sunSign]: 0.4,
        [moonSign || 'cancer']: 0.3
      },
      // Add the missing properties from StandardizedAlchemicalResult
      elementalBalance: {
        fire: elementWeights.Fire || 0.25,
        earth: elementWeights.Earth || 0.25,
        air: elementWeights.Air || 0.25,
        water: elementWeights.Water || 0.25
      },
      spirit: elementWeights.Fire || 0.25,
      essence: elementWeights.Water || 0.25,
      matter: elementWeights.Earth || 0.25,
      substance: elementWeights.Air || 0.25
    };
    
    return result;
  } catch (error) {
    console.error('Error in alchemize function:', error);
    
    // Return a valid default result with error information
    return {
      dominantElement: 'Fire',
      elementalState: { ...DEFAULT_ELEMENTAL_PROPERTIES },
      aspectStrengths: [],
      planetaryInfluences: [],
      moonPhase: 'new moon',
      recommendation: 'Balance your elemental energies',
      elementalDistribution: { ...DEFAULT_ELEMENTAL_PROPERTIES },
      season: 'spring',
      zodiacEnergies: {},
      error: error instanceof Error ? error.message : 'Unknown error in alchemize function',
      // Add the missing properties from StandardizedAlchemicalResult
      elementalBalance: {
        fire: 0.25,
        earth: 0.25,
        air: 0.25,
        water: 0.25
      },
      spirit: 0.25,
      essence: 0.25,
      matter: 0.25,
      substance: 0.25
    };
  }
}

/**
 * Get the season from a zodiac sign
 * @param sunSign Zodiac sign
 * @returns Season
 */
function getSeasonFromsunSign(sunSign: ZodiacSign): Season {
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
 * Calculate current planetary positions with improved caching and error handling
 */
async function calculateCurrentPlanetaryPositions(): Promise<Record<string, unknown>> {
  try {
    // Static cache to prevent redundant calculations
    if (!calculateCurrentPlanetaryPositions.cache) {
      calculateCurrentPlanetaryPositions.cache = {
        lastUpdate: 0,
        data: {},
        updateInterval: 15 * 60 * 1000 // 15 minutes
      };
    }
    
    const now = Date.now();
    const cache = calculateCurrentPlanetaryPositions.cache;
    
    // Check if cache is still valid
    if (now - cache.lastUpdate < cache.updateInterval && Object.keys(cache.data).length > 0) {
      return { ...cache.data };
    }
    
    // Get accurate positions using utility function
    const positions = await getAccuratePlanetaryPositions();
    
    // Calculate important derived data
    const result: Record<string, unknown> = {
      ...positions,
      timestamp: now,
      calculationDate: new Date().toISOString()
    };
    
    // Extract zodiac signs from positions
    const zodiacSigns: Record<string, string> = {};
    const planetNames = ['sun', 'Moon', 'mercury', 'venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    for (const planet of planetNames) {
      const planetData = positions[planet];
      if (planetData && typeof planetData === 'object' && 'sign' in planetData) {
        zodiacSigns[planet] = String(planetData.sign);
      }
    }
    
    // Add zodiac signs to result
    result.zodiacSigns = zodiacSigns;
    
    // Calculate house positions if ascendant is available
    if (positions.Ascendant && typeof positions.Ascendant === 'object') {
      try {
        const ascendantDegree = 'longitude' in positions.Ascendant ? 
          Number(positions.Ascendant.longitude) : 0;
        
        const houses: Record<string, unknown> = {};
        
        // Calculate house cusps (simplified)
        for (let i = 1; i <= 12; i++) {
          const houseCusp = (ascendantDegree + (i - 1) * 30) % 360;
          houses[`house${i}`] = {
            cusp: houseCusp,
            sign: getSignFromDegree(houseCusp)
          };
        }
        
        result.houses = houses;
      } catch (error) {
        console.warn('Error calculating house positions:', error);
      }
    }
    
    // Update cache
    cache.data = { ...result };
    cache.lastUpdate = now;
    
    return result;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    
    // Return last cached data if available
    if (calculateCurrentPlanetaryPositions.cache?.data && 
        Object.keys(calculateCurrentPlanetaryPositions.cache.data).length > 0) {
      console.log('Returning cached planetary positions due to error');
      return { 
        ...calculateCurrentPlanetaryPositions.cache.data,
        error: 'Using cached data due to calculation error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Return minimal fallback data
    return {
      error: 'Failed to calculate planetary positions',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      calculationDate: new Date().toISOString(),
      sun: { sign: 'aries', degree: 15 },
      Moon: { sign: 'cancer', degree: 10 }
    };
  }
}

// Add cache property to function
calculateCurrentPlanetaryPositions.cache = {
  lastUpdate: 0,
  data: {},
  updateInterval: 15 * 60 * 1000 // 15 minutes
};

/**
 * Helper function to get zodiac sign from degree (0-359)
 */
function getSignFromDegree(degree: number): string {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  const signIndex = Math.floor(degree / 30) % 12;
  return signs[signIndex];
}

/**
 * Calculate zodiac energies based on planetary positions
 * @param positions Record of planetary positions
 * @returns Record of zodiac sign energies
 */
function calculateZodiacEnergies(positions: Record<string, unknown>): Record<string, number> {
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
    sun: 0.25,
    Moon: 0.20,
    mercury: 0.10,
    venus: 0.10,
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
    if (data && typeof data === 'object' && 'Sign' in data && 
        data.Sign && typeof data.Sign === 'object' && 'label' in data.Sign) {
      const signData = data.Sign as { label: string };
      const sign = signData.label.toLowerCase();
      if (zodiacEnergies[sign] !== undefined) {
        // Add energy based on the planet's influence
        const planetModifier = planetaryWeights[planet] || 0.05;
        zodiacEnergies[sign] += planetModifier;
      }
    } 
    // Check for data in the format returned by astronomiaCalculator
    else if (data && typeof data === 'object' && 'sign' in data) {
      const planetData = data as { sign: string };
      const sign = planetData.sign.toLowerCase();
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
  const zodiacToChakraMap: Record<string, Array<keyof ChakraEnergies>> = {
    // Root chakra is associated with earth signs
    'taurus': ['root'],
    'virgo': ['root', 'throat'], // Virgo influences multiple chakras
    'capricorn': ['root'],
    
    // Sacral chakra is associated with water signs
    'cancer': ['sacral'],
    'scorpio': ['sacral', 'brow'], // Scorpio influences multiple chakras
    
    // Solar plexus is associated with fire signs
    'aries': ['solarPlexus'],
    'leo': ['solarPlexus'],
    'sagittarius': ['solarPlexus', 'crown'], // Sagittarius influences multiple chakras
    
    // Heart chakra is associated with air and water
    'libra': ['heart'],
    'aquarius': ['heart', 'crown'], // Aquarius influences multiple chakras
    'pisces': ['sacral', 'heart', 'brow'], // Pisces influences multiple chakras
    
    // Throat chakra is associated with communication
    'gemini': ['throat']
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
// Phase 4: Enhanced interfaces for cookingMethodRecommender type safety
interface MethodWithElementalProperties {
  name?: string;
  elementalProperties?: ElementalProperties;
  elementalEffect?: ElementalProperties;
  preferences?: {
    seasonalPreference?: string[];
  };
  astrologicalInfluences?: {
    dominantPlanets?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface PlanetaryTemperamentData {
  EarthVenus?: unknown;
  AirVenus?: unknown;
  WaterVenus?: unknown;
  FireVenus?: unknown;
  FireMars?: unknown;
  WaterMars?: unknown;
  AirMercury?: unknown;
  EarthMercury?: unknown;
  FireJupiter?: unknown;
  AirJupiter?: unknown;
  EarthSaturn?: unknown;
  AirSaturn?: unknown;
}

interface PlanetaryDataStructure {
  PlanetSpecific?: {
    CulinaryTemperament?: PlanetaryTemperamentData;
  };
}

interface SignArrays {
  includes?: (sign: string) => boolean;
}

import { allCookingMethods, cookingMethods as detailedCookingMethods } from '@/data/cooking';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import jupiterData from '@/data/planets/jupiter';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import neptuneData from '@/data/planets/neptune';
import plutoData from '@/data/planets/pluto';
import saturnData from '@/data/planets/saturn';
import uranusData from '@/data/planets/uranus';
import venusData from '@/data/planets/venus';
import type { ZodiacSign, ElementalProperties } from '@/types';
import type { CookingMethod as CookingMethodEnum } from '@/types/alchemy';
import { PlanetaryAspect, LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import type { CookingMethod } from '@/types/cooking';
import { calculateLunarPhase, getLunarPhaseName } from '@/utils/astrologyUtils';
import { culturalCookingMethods, getCulturalVariations } from '@/utils/culturalMethodsAggregator';

// Define interfaces for the various method types we work with
interface BaseCookingMethod {
  id?: string;
  name?: string;
  description?: string;
  elementalEffect?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  suitable_for?: string[];
  benefits?: string[];
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  [key: string]: unknown; // For additional dynamic properties
}

interface CulturalMethod {
  id?: string;
  name?: string;
  description?: string;
  variationName?: string;
  elementalProperties?: ElementalProperties;
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  relatedToMainMethod?: string;
  astrologicalInfluences?: {
    favorableZodiac?: unknown[];
    unfavorableZodiac?: unknown[];
    dominantPlanets?: string[];
  };
  [key: string]: unknown;
}

// Define a proper interface for our cooking method objects
interface CookingMethodData {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties; // Some methods use this instead
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    dominantPlanets?: string[];
  };
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  seasonalRecommendations?: string[];
  score?: number;
  variations?: CookingMethodData[]; // Add variations property to store related cultural methods
  relatedToMainMethod?: string; // Track if this is a variation of another method
}

// Type for the dictionary of methods
type CookingMethodDictionary = Record<string, CookingMethodData>;

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...(Object.entries(allCookingMethods || {}).reduce((acc: CookingMethodDictionary, [id, method]) => {
    // ✅ Pattern MM-1: Safe type assertion for base cooking method
    const baseMethod = (method as unknown) as BaseCookingMethod;
    acc[id] = {
      id,
      name: baseMethod.name || id,
      description: baseMethod.description || '',
      elementalEffect: baseMethod.elementalEffect || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      duration: { min: 10, max: 30 }, // Default duration
      suitable_for: baseMethod.suitable_for || [],
      benefits: baseMethod.benefits || [],
      variations: [] // Initialize empty variations array
    };
    return acc;
  }, {})),
  
  // Add all cultural methods, making sure they don't override any existing methods
  // and properly organizing them into variations if they're related to main methods
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    // ✅ Pattern MM-1: Safe type assertion for cultural method
    const culturalMethod = (method as unknown) as CulturalMethod;
    
    // Check if this method is a variation of a main method
    if (culturalMethod.relatedToMainMethod) {
      // If the main method exists, add this as a variation
      if (methods[culturalMethod.relatedToMainMethod]) {
        // Add to variations if it doesn't exist yet
        const existingVariations = methods[culturalMethod.relatedToMainMethod].variations || [];
        if (!existingVariations.some(v => v.id === culturalMethod.id)) {
          methods[culturalMethod.relatedToMainMethod].variations = [
            ...existingVariations,
            {
              id: culturalMethod.id || '',
              name: culturalMethod.variationName || culturalMethod.name || '',
              description: culturalMethod.description || '',
              elementalEffect: culturalMethod.elementalProperties || {
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
              },
              toolsRequired: culturalMethod.toolsRequired || [],
              bestFor: culturalMethod.bestFor || [],
              culturalOrigin: culturalMethod.culturalOrigin,
              astrologicalInfluences: {
                favorableZodiac: (culturalMethod.astrologicalInfluences?.favorableZodiac as ZodiacSign[]) || [],
                unfavorableZodiac: (culturalMethod.astrologicalInfluences?.unfavorableZodiac as ZodiacSign[]) || [],
                dominantPlanets: culturalMethod.astrologicalInfluences?.dominantPlanets || []
              },
              duration: { min: 10, max: 30 },
              suitable_for: culturalMethod.bestFor || [],
              benefits: [],
              relatedToMainMethod: culturalMethod.relatedToMainMethod
            } as CookingMethodData
          ];
        }
        // Don't add as a standalone method
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[culturalMethod.id || ''] && !culturalMethod.relatedToMainMethod) {
      methods[culturalMethod.id || ''] = {
        id: culturalMethod.id || '',
        name: culturalMethod.name || '',
        description: culturalMethod.description || '',
        elementalEffect: culturalMethod.elementalProperties || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        toolsRequired: culturalMethod.toolsRequired || [],
        bestFor: culturalMethod.bestFor || [],
        culturalOrigin: culturalMethod.culturalOrigin,
        astrologicalInfluences: {
          favorableZodiac: (culturalMethod.astrologicalInfluences?.favorableZodiac as ZodiacSign[]) || [],
          unfavorableZodiac: (culturalMethod.astrologicalInfluences?.unfavorableZodiac as ZodiacSign[]) || [],
          dominantPlanets: culturalMethod.astrologicalInfluences?.dominantPlanets || []
        },
        duration: { min: 10, max: 30 },
        suitable_for: culturalMethod.bestFor || [],
        benefits: [],
        variations: [] // Initialize empty variations array
      } as CookingMethodData;
    }
    return methods;
  }, {})
};

// --- Added Thermodynamic Helpers ---

// Function to get thermodynamic properties for a method
// PRIORITIZES detailedCookingMethods from src/data/cooking/cookingMethods.ts
// FALLS BACK to COOKING_METHOD_THERMODYNAMICS constant from src/data/cooking/thermodynamics.ts
// FURTHER FALLS BACK to keyword-based logic
interface MethodWithThermodynamics {
  name?: string;
  thermodynamicProperties?: {
    heat?: number;
    entropy?: number;
    reactivity?: number;
    gregsEnergy?: number;
  };
  [key: string]: unknown;
}

function getMethodThermodynamics(method: CookingMethodProfile): BasicThermodynamicProperties {
  // ✅ Pattern MM-1: Safe type assertion for method with thermodynamics
  const methodData = (method as unknown) as MethodWithThermodynamics;
  const methodName = methodData.name || '';
  // ✅ Pattern KK-1: Safe string conversion for method name
  const methodNameLower = String(methodName || '').toLowerCase();

  // 1. Check the detailed data source first
  // ✅ Pattern KK-1: Safe type conversion for cooking method lookup
  const detailedMethodData = detailedCookingMethods[methodNameLower as keyof typeof detailedCookingMethods];
  if (detailedMethodData && detailedMethodData.thermodynamicProperties) {
    const thermoProps = detailedMethodData.thermodynamicProperties;
    return {
      heat: thermoProps.heat ?? 0.5,
      entropy: thermoProps.entropy ?? 0.5,
      reactivity: thermoProps.reactivity ?? 0.5,
      gregsEnergy: (thermoProps as { gregsEnergy?: number }).gregsEnergy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties defined (might be passed dynamically)
  if (methodData?.thermodynamicProperties) {
    const thermoProps = methodData.thermodynamicProperties;
    return {
      heat: thermoProps.heat ?? 0.5,
      entropy: thermoProps.entropy ?? 0.5,
      reactivity: thermoProps.reactivity ?? 0.5,
      gregsEnergy: thermoProps.gregsEnergy ?? 0.5,
    };
  }
  
  // 3. Check the explicitly defined mapping constant (COOKING_METHOD_THERMODYNAMICS)
  // ✅ Pattern KK-1: Safe type conversion for thermodynamics lookup
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - ENHANCED with more cooking methods
  // ✅ Pattern KK-1: Direct string access since methodNameLower is already string
  const nameStr = methodNameLower;
  if (nameStr.includes('grill') || nameStr.includes('roast') || 
      nameStr.includes('fry') || nameStr.includes('sear') || 
      nameStr.includes('broil') || nameStr.includes('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.6 }; // High heat methods
  } else if (nameStr.includes('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.55 }; // Medium-high heat, dry
  } else if (nameStr.includes('steam') || nameStr.includes('simmer') || 
             nameStr.includes('poach') || nameStr.includes('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 }; // Medium heat, lower entropy methods
  } else if (nameStr.includes('sous vide') || nameStr.includes('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.25 }; // Low heat, low reactivity
  } else if (nameStr.includes('raw') || nameStr.includes('ceviche') || 
             nameStr.includes('ferment') || nameStr.includes('pickle') || 
             nameStr.includes('cure') || nameStr.includes('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 }; // No/low heat methods
  } else if (nameStr.includes('braise') || nameStr.includes('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60, gregsEnergy: 0.5 }; // Moderate heat, high entropy
  } else if (nameStr.includes('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.6 }; // High heat/pressure, rapid breakdown
  } else if (nameStr.includes('smoke') || nameStr.includes('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.65 }; // Moderate heat, high reactivity
  } else if (nameStr.includes('confit') || nameStr.includes('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.4 }; // Low heat, gradual cooking
  } else if (nameStr.includes('dehydrat') || nameStr.includes('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 }; // Low heat, preservation
  } else if (nameStr.includes('toast') || nameStr.includes('brulee')) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8, gregsEnergy: 0.7 }; // High reactivity surface treatments
  }

  // Default values if no match found in any source
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0.5 };
}

// Calculate base score based on thermodynamic properties
// Adapted from calculateMatchScore in CookingMethods.tsx
function calculateThermodynamicBaseScore(thermodynamics: BasicThermodynamicProperties): number {
  const heatScore = thermodynamics.heat || 0;
  // Invert entropy score as lower entropy is often preferred for structure retention
  const entropyScore = 1 - (thermodynamics.entropy || 0);
  const reactivityScore = thermodynamics.reactivity || 0;

  // Weighted average - giving slightly more importance to heat and reactivity
  // Weights: Heat (0.4), Entropy (0.3), Reactivity (0.3)
  const rawScore = (heatScore * 0.4) + (entropyScore * 0.3) + (reactivityScore * 0.3);

  // Ensure a minimum base score to avoid scores of 0 before multiplier.
  return Math.max(0.05, rawScore); 
}

/**
 * Helper for normalizing cooking method names for comparison
 * This helps with duplicate detection and fuzzy matching
 */
function normalizeMethodName(methodName: string): string {
  return methodName
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two cooking methods are effectively the same or very similar
 */
function areSimilarMethods(method1: string, method2: string): boolean {
  // Normalize both names
  const normalized1 = normalizeMethodName(method1);
  const normalized2 = normalizeMethodName(method2);
  
  // If normalized names are identical, they're definitely similar
  if (normalized1 === normalized2) return true;
  
  // Check if one name is contained within the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  // Simple fuzzy matching - check if they share a significant number of characters
  const commonWords = normalized1.split(' ').filter(word => 
    word.length > 3 && normalized2.includes(word)
  );
  
  if (commonWords.length > 0) return true;
  
  // Check for common method variations
  const methodPairs = [
    ['grill', 'grilling', 'bbq', 'barbecue', 'barbequing'],
    ['fry', 'frying', 'pan fry', 'deep fry', 'stir fry', 'shallow fry'],
    ['boil', 'boiling', 'parboil', 'blanch'],
    ['roast', 'roasting', 'bake', 'baking'],
    ['steam', 'steaming', 'double steam'],
    ['ferment', 'fermentation', 'fermenting'],
    ['smoke', 'smoking', 'smoked', 'cold smoke'],
    ['braise', 'braising', 'pot roast'],
    ['poach', 'poaching', 'gentle poach'],
    ['pressure', 'pressure cook', 'instant pot', 'pressure cooking']
  ];
  
  // Check if both names are in the same cooking method family
  for (const group of methodPairs) {
    if (group.some(item => normalized1.includes(item)) && 
        group.some(item => normalized2.includes(item))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Enhanced elemental compatibility calculation
 */
function calculateEnhancedElementalCompatibility(
  methodProps: ElementalProperties,
  targetProps: ElementalProperties
): number {
  let compatibilityScore = 0;
  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  // Calculate weighted element-by-element compatibility
  elements.forEach(element => {
    // Get values (default to 0 if undefined)
    const methodValue = methodProps[element] || 0; 
    const targetValue = targetProps[element] || 0;
    
    // Basic compatibility - multiply the values
    // This rewards matching high values and reduces impact of low values
    const elementCompatibility = methodValue * targetValue;
    
    // Add to total score, weighting each element equally
    compatibilityScore += elementCompatibility;
  });
  
  // Normalize to 0-1 range
  // The theoretical maximum would be 4 (if all elements were 1.0 for both)
  return Math.min(1, compatibilityScore / 2.5);
}

// Add after line 205 (before calculateThermodynamicBaseScore function)
/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
  'Sun': { diurnal: 'Fire', nocturnal: 'Fire' },
  'Moon': { diurnal: 'Water', nocturnal: 'Water' },
  'Mercury': { diurnal: 'Air', nocturnal: 'Earth' },
  'Venus': { diurnal: 'Water', nocturnal: 'Earth' },
  'Mars': { diurnal: 'Fire', nocturnal: 'Water' },
  'Jupiter': { diurnal: 'Air', nocturnal: 'Fire' },
  'Saturn': { diurnal: 'Air', nocturnal: 'Earth' },
  'Uranus': { diurnal: 'Water', nocturnal: 'Air' },
  'Neptune': { diurnal: 'Water', nocturnal: 'Water' },
  'Pluto': { diurnal: 'Earth', nocturnal: 'Water' }
};

/**
 * Calculate the planetary day influence on a cooking method
 * The day's ruling planet contributes BOTH its diurnal and nocturnal elements all day
 * 
 * @param method The cooking method profile
 * @param planetaryDay The planetary day
 * @returns A score between 0 and 1 indicating the influence
 */
function calculatePlanetaryDayInfluence(
  method: CookingMethodProfile,
  planetaryDay: string
): number {
  // Get the elements associated with the current planetary day
  const dayElements = planetaryElements[planetaryDay];
  if (!dayElements) return 0.5; // Unknown planet
  
  // For planetary day, BOTH diurnal and nocturnal elements influence all day
  const diurnalElement = dayElements.diurnal;
  const nocturnalElement = dayElements.nocturnal;
  
  // Calculate how much of each planetary element is present in the method
  // ✅ Pattern MM-1: Safe type assertion for method with elemental properties
  const methodWithProps = (method as unknown) as MethodWithElementalProperties;
  const methodElementals = methodWithProps?.elementalProperties || methodWithProps?.elementalEffect || {};
  const diurnalMatch = methodElementals[diurnalElement] || 0;
  const nocturnalMatch = methodElementals[nocturnalElement] || 0;
  
  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
  
  // If the method has a direct planetary affinity, give bonus points
  // ✅ Pattern MM-1: Safe type assertion for method data access
  const methodData = (method as unknown) as MethodWithElementalProperties;
  if (methodData?.astrologicalInfluences?.dominantPlanets?.includes(planetaryDay)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);
  }
  
  return elementalScore;
}

/**
 * Calculate the planetary hour influence on a cooking method
 * The hour's ruling planet contributes only its diurnal element during day, nocturnal at night
 * 
 * @param method The cooking method profile
 * @param planetaryHour The planetary hour
 * @param isDaytime Whether it's currently daytime (6am-6pm)
 * @returns A score between 0 and 1 indicating the influence
 */
function calculatePlanetaryHourInfluence(
  method: CookingMethodProfile,
  planetaryHour: string,
  isDaytime: boolean
): number {
  // Get the elements associated with the current planetary hour
  const hourElements = planetaryElements[planetaryHour];
  if (!hourElements) return 0.5; // Unknown planet
  
  // For planetary hour, use diurnal element during day, nocturnal at night
  const relevantElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;
  
  // Calculate how much of the relevant planetary element is present in the method
  // ✅ Pattern MM-1: Safe type assertion for method with elemental properties
  const methodWithProps = (method as unknown) as MethodWithElementalProperties;
  const methodElementals = methodWithProps?.elementalProperties || methodWithProps?.elementalEffect || {};
  const elementalMatch = methodElementals[relevantElement] || 0;
  
  // Calculate score based on how well the method matches the planetary hour's element
  let elementalScore = elementalMatch;
  
  // If the method has a direct planetary affinity, give bonus points
  // ✅ Pattern MM-1: Safe type assertion for method hour data access
  const methodHourData = (method as unknown) as MethodWithElementalProperties;
  if (methodHourData?.astrologicalInfluences?.dominantPlanets?.includes(planetaryHour)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);
  }
  
  return elementalScore;
}

/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

// Improved scoring algorithm for cooking method recommendations
export async function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: ZodiacSign,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  dietaryPreferences?: string[],
  availableTools?: string[]
): Promise<CookingMethodData[]> {
  // Convert cooking methods to array for easier processing
  const methodsArray = Object.entries(allCookingMethodsCombined)
    .map(([_id, method]) => ({
      ...method,
      score: 0
    }))
    // Filter out methods that are variations of others to avoid duplication
    .filter(method => !method.relatedToMainMethod);
  
  // Apply cultural preference filter if specified
  const filteredMethods = culturalPreference
    ? methodsArray.filter(method => 
        // Include methods that match the culture OR have variations that match
        method.culturalOrigin === culturalPreference || 
        (method.variations && method.variations.some(v => v.culturalOrigin === culturalPreference))
      )
    : methodsArray;
  
  // Check if Venus is one of the active planets
  const isVenusActive = planets?.includes('Venus') || false;
  
  // Check if Venus is retrograde
  const isVenusRetrograde = planets?.includes('Venus-R') || false;
  
  // Check if Mars is one of the active planets
  const isMarsActive = planets?.includes('Mars') || false;
  
  // Check if Mars is retrograde
  const isMarsRetrograde = planets?.includes('Mars-R') || false;
  
  // Check if Mercury is one of the active planets
  const isMercuryActive = planets?.includes('Mercury') || false;
  
  // Check if Mercury is retrograde
  const isMercuryRetrograde = planets?.includes('Mercury-R') || false;
  
  // Check if Jupiter is one of the active planets
  const isJupiterActive = planets?.includes('Jupiter') || false;
  
  // Check if Jupiter is retrograde
  const isJupiterRetrograde = planets?.includes('Jupiter-R') || false;
  
  // Check if Saturn is one of the active planets
  const isSaturnActive = planets?.includes('Saturn') || false;
  
  // Check if Saturn is retrograde
  const _isSaturnRetrograde = planets?.includes('Saturn-R') || false;
  
  // Check if Uranus is one of the active planets
  const isUranusActive = planets?.includes('Uranus') || false;
  
  // Check if Uranus is retrograde
  const isUranusRetrograde = planets?.includes('Uranus-R') || false;
  
  // Check if Neptune is one of the active planets
  const isNeptuneActive = planets?.includes('Neptune') || false;
  
  // Check if Neptune is retrograde
  const isNeptuneRetrograde = planets?.includes('Neptune-R') || false;
  
  // Check if Pluto is one of the active planets
  const isPlutoActive = planets?.includes('Pluto') || false;
  
  // Check if Pluto is retrograde
  const isPlutoRetrograde = planets?.includes('Pluto-R') || false;
  
  // Get Venus transit data for current zodiac sign if applicable
  const venusZodiacTransit = isVenusActive && currentZodiac 
    ? venusData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Mars transit data for current zodiac sign if applicable
  const _marsZodiacTransit = isMarsActive && currentZodiac 
    ? marsData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Mercury transit data for current zodiac sign if applicable
  const mercuryZodiacTransit = isMercuryActive && currentZodiac 
    ? mercuryData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Jupiter transit data for current zodiac sign if applicable
  const _jupiterZodiacTransit = isJupiterActive && currentZodiac 
    ? jupiterData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Saturn transit data for current zodiac sign if applicable
  const _saturnZodiacTransit = isSaturnActive && currentZodiac 
    ? saturnData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Uranus transit data for current zodiac sign if applicable
  const uranusZodiacTransit = isUranusActive && currentZodiac 
    ? uranusData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Neptune transit data for current zodiac sign if applicable
  const neptuneZodiacTransit = isNeptuneActive && currentZodiac 
    ? neptuneData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Pluto transit data for current zodiac sign if applicable
  const plutoZodiacTransit = isPlutoActive && currentZodiac 
    ? plutoData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Venus sign-based temperament for current zodiac
  let venusTemperament = null;
  if (currentZodiac && isVenusActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    
    const venusDataTyped = venusData as unknown as PlanetaryDataStructure;
    const temperamentData = venusDataTyped.PlanetSpecific?.CulinaryTemperament;
    
    if (earthSigns.includes(lowerSign) && temperamentData?.EarthVenus) {
      venusTemperament = temperamentData.EarthVenus;
    } else if (airSigns.includes(lowerSign) && temperamentData?.AirVenus) {
      venusTemperament = temperamentData.AirVenus;
    } else if (waterSigns.includes(lowerSign) && temperamentData?.WaterVenus) {
      venusTemperament = temperamentData.WaterVenus;
    } else if (fireSigns.includes(lowerSign) && temperamentData?.FireVenus) {
      venusTemperament = temperamentData.FireVenus;
    }
  }
  
  // Get Mars sign-based temperament for current zodiac
  let _marsTemperament = null;
  if (currentZodiac && isMarsActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    const marsDataTyped = marsData as unknown as PlanetaryDataStructure;
    const temperamentData = marsDataTyped.PlanetSpecific?.CulinaryTemperament;
    
    if (fireSigns.includes(lowerSign) && temperamentData?.FireMars) {
      _marsTemperament = temperamentData.FireMars;
    } else if (waterSigns.includes(lowerSign) && temperamentData?.WaterMars) {
      _marsTemperament = temperamentData.WaterMars;
    }
  }
  
  // Get Mercury sign-based temperament for current zodiac
  let mercuryTemperament = null;
  if (currentZodiac && isMercuryActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    
    const mercuryDataTyped = mercuryData as unknown as PlanetaryDataStructure;
    const temperamentData = mercuryDataTyped.PlanetSpecific?.CulinaryTemperament;
    
    if (airSigns.includes(lowerSign) && temperamentData?.AirMercury) {
      mercuryTemperament = temperamentData.AirMercury;
    } else if (earthSigns.includes(lowerSign) && temperamentData?.EarthMercury) {
      mercuryTemperament = temperamentData.EarthMercury;
    }
  }
  
  // Get Jupiter sign-based temperament for current zodiac
  let jupiterTemperament = null;
  if (currentZodiac && isJupiterActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    const jupiterDataTyped = jupiterData as unknown as PlanetaryDataStructure;
    const temperamentData = jupiterDataTyped.PlanetSpecific?.CulinaryTemperament;
    
    if (fireSigns.includes(lowerSign) && temperamentData?.FireJupiter) {
      jupiterTemperament = temperamentData.FireJupiter;
    } else if (airSigns.includes(lowerSign) && temperamentData?.AirJupiter) {
      jupiterTemperament = temperamentData.AirJupiter;
    }
  }
  
  // Get Saturn sign-based temperament for current zodiac
  let _saturnTemperament = null;
  if (currentZodiac && isSaturnActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    const saturnDataTyped = saturnData as unknown as PlanetaryDataStructure;
    const temperamentData = saturnDataTyped.PlanetSpecific?.CulinaryTemperament;
    
    if (earthSigns.includes(lowerSign) && temperamentData?.EarthSaturn) {
      _saturnTemperament = temperamentData.EarthSaturn;
    } else if (airSigns.includes(lowerSign) && temperamentData?.AirSaturn) {
      _saturnTemperament = temperamentData.AirSaturn;
    }
  }
  
  // Get the current lunar phase for additional scoring
  const lunarPhaseValue = await calculateLunarPhase(new Date());
  const lunarPhase = getLunarPhaseName(lunarPhaseValue);

  // Track recommendations to prevent adding duplicates
  const recommendationsMap: Record<string, boolean> = {};
  const recommendations: CookingMethodData[] = [];
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Skip if we already have a similar method
    // ✅ Pattern MM-1: Safe type assertion for method with elemental properties
    const methodWithProps = (method as unknown) as MethodWithElementalProperties;
    const methodNameNorm = normalizeMethodName(methodWithProps?.name || '');
    if (Object.keys(recommendationsMap).some(existingMethod => 
      areSimilarMethods(existingMethod, methodNameNorm)
    )) {
      return;
    }
    
    // Initialize all component scores for transparency
    let elementalScore = 0;
    let astrologicalScore = 0;
    let seasonalScore = 0;
    let toolScore = 0;
    let dietaryScore = 0;
    let culturalScore = 0;
    let venusScore = 0;
    let lunarScore = 0;
    let score = 0;
    
    // Get element associated with the zodiac sign
    const signElement = currentZodiac ? getElementForSign(currentZodiac) : null;
    
    // Enhanced Elemental compatibility calculation (40% of score)
    if (methodWithProps?.elementalEffect || methodWithProps?.elementalProperties) {
      const elementalProps = methodWithProps?.elementalEffect || methodWithProps?.elementalProperties || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      };
      
      // Use enhanced calculation that considers element combinations
      elementalScore = calculateEnhancedElementalCompatibility(elementalProps, elementalComposition);
    }
    
    // Astrological compatibility (25% of score)
    if (method.astrologicalInfluences) {
      // Zodiac compatibility
      if (currentZodiac) {
        if (method.astrologicalInfluences.favorableZodiac?.includes(currentZodiac)) {
          astrologicalScore += 0.25;
        } else if (method.astrologicalInfluences.unfavorableZodiac?.includes(currentZodiac)) {
          astrologicalScore -= 0.2;
        }
      }
      
      // ---- Planetary compatibility - New approach ----
      
      // Calculate planetary day influence (35% of astrological score)
      let planetaryDayScore = 0;
      if (planets && planets.length > 0) {
        // Get the current day of the week
        const dayOfWeek = new Date().getDay();
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayRulers = {
          'Sunday': 'Sun',
          'Monday': 'Moon',
          'Tuesday': 'Mars',
          'Wednesday': 'Mercury',
          'Thursday': 'Jupiter',
          'Friday': 'Venus',
          'Saturday': 'Saturn'
        };
        
        const planetaryDay = dayRulers[weekDays[dayOfWeek]];
        if (planetaryDay) {
          planetaryDayScore = calculatePlanetaryDayInfluence(method as unknown as CookingMethodProfile, planetaryDay);
        }
      }
      
      // Calculate planetary hour influence (20% of astrological score)
      let planetaryHourScore = 0;
      if (planets && planets.length > 0) {
        // Simple approximation for the planetary hour
        // For a real app, you should use an accurate calculation based on sunrise/sunset
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        
        // Chaldean order of planets
        const planetaryOrder = [
          'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'
        ];
        
        // Starting planet for the day
        const dayRulerPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const startingPlanet = dayRulerPlanets[dayOfWeek];
        
        // Find starting position in the sequence
        const startingPosition = planetaryOrder.indexOf(startingPlanet);
        
        // Calculate hour position (0-23)
        const daytime = isDaytime(now);
        const hourPosition = daytime ? (hour - 6) : (hour < 6 ? hour + 18 : hour - 6);
        
        // Get the ruling planet for the current hour
        const hourPosition7 = (startingPosition + hourPosition) % 7;
        const planetaryHour = planetaryOrder[hourPosition7];
        
        if (planetaryHour) {
          planetaryHourScore = calculatePlanetaryHourInfluence(method as unknown as CookingMethodProfile, planetaryHour, daytime);
        }
      }
      
      // Add weighted planetary scores to the astrological score
      // Elemental match: 45%, Planetary day: 35%, Planetary hour: 20%
      if (planets && planets.length > 0) {
        // Base zodiac score already calculated (worth 45% of astrological score)
        // Add planetary day influence (35%)
        astrologicalScore += planetaryDayScore * 0.35;
        
        // Add planetary hour influence (20%)
        astrologicalScore += planetaryHourScore * 0.20;
      }
    }
    
    // Seasonal bonus (15% of score) - enhanced with more seasonal associations
    if (methodWithProps?.preferences?.seasonalPreference && methodWithProps?.preferences?.seasonalPreference?.includes(season)) {
      seasonalScore += 0.15;
    } else {
      // Enhanced default seasonal preferences
      const methodName = methodWithProps?.name?.toLowerCase() || '';
      if (season === 'winter') {
        if (methodName.includes('brais') || 
            methodName.includes('roast') ||
            methodName.includes('stew') ||
            methodName.includes('bake')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'summer') {
        if (methodName.includes('grill') || 
            methodName.includes('raw') ||
            methodName.includes('ceviche') ||
            methodName.includes('cold')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'spring') {
        if (methodName.includes('steam') || 
            methodName.includes('stir') ||
            methodName.includes('blanch') ||
            methodName.includes('quick')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'fall' || season === 'autumn') {
        if (methodName.includes('smoke') || 
            methodName.includes('brais') ||
            methodName.includes('slow') ||
            methodName.includes('roast')) {
          seasonalScore += 0.12;
        }
      }
    }
    
    // Tools availability (10% of score)
    if (availableTools && method.toolsRequired) {
      const requiredTools = method.toolsRequired;
      const availableRequiredTools = requiredTools.filter(tool => 
        availableTools.some(available => available.toLowerCase().includes(tool.toLowerCase()))
      );
      
      toolScore = (availableRequiredTools.length / requiredTools.length) * 0.1;
    } else {
      // Enhanced assumptions about basic tools availability
      const methodName = methodWithProps?.name?.toLowerCase() || '';
      if (methodName.includes('sous_vide') || methodName.includes('sous vide')) {
        toolScore = 0.01; // Specialized equipment
      } else if (methodName.includes('pressure') || methodName.includes('instant pot')) {
        toolScore = 0.03; // Somewhat specialized
      } else if (methodName.includes('smoker') || methodName.includes('smoke') || 
                 methodName.includes('molecular') || methodName.includes('spherification') ||
                 methodName.includes('thermal immersion') || methodName.includes('liquid nitrogen')) {
        toolScore = 0.02; // Quite specialized
      } else if (methodName.includes('grill') && !methodName.includes('stove top')) {
        toolScore = 0.05; // Common but not universal
      } else {
        toolScore = 0.08; // Most common methods
      }
    }
    
    // Dietary preferences (10% of score) - enhanced with more specific matching
    if (dietaryPreferences && method.suitable_for) {
      // Enhanced matching algorithm
      let matchStrength = 0;
      
      for (const pref of dietaryPreferences) {
        // Direct matches
        if (method.suitable_for.some(suitable => 
          (suitable )?.toLowerCase?.().includes((pref )?.toLowerCase?.())
        )) {
          matchStrength += 1.0;
          continue;
        }
        
        // Special case mappings - fixed type access
        const prefStr = typeof pref === 'string' ? pref.toLowerCase() : '';
        const methodName = typeof method.name === 'string' ? method.name.toLowerCase() : '';
        
        if (prefStr === 'vegetarian' && methodName.includes('veget')) {
          matchStrength += 0.8;
        } else if (prefStr === 'vegan' && 
                  !methodName.includes('meat') &&
                  !methodName.includes('fish')) {
          matchStrength += 0.6;
        } else if (prefStr.includes('gluten') && 
                  !methodName.includes('bread') &&
                  !methodName.includes('pasta') &&
                  !methodName.includes('flour')) {
          matchStrength += 0.7;
        }
      }
      
      // Normalize between 0-0.1
      dietaryScore = Math.min(0.1, matchStrength / dietaryPreferences.length * 0.1);
    }
    
    // Cultural preference bonus (add extra points for methods from preferred culture)
    if (culturalPreference && method.culturalOrigin === culturalPreference) {
      culturalScore = 0.05; // 5% boost for direct cultural match
    } else if (culturalPreference && method.variations && 
              method.variations.some(v => v.culturalOrigin === culturalPreference)) {
      culturalScore = 0.03; // 3% boost if a variation matches the culture
    }
    
    // Lunar phase influence (new component)
    if (lunarPhase) {
      const methodData = method as Record<string, unknown>;
      const methodNameLower = String(methodData?.name || '').toLowerCase();
      
      // New moon favors starting new methods, preparation methods
      if (lunarPhase === 'new moon') {
        if (methodNameLower.includes('prep') || 
            methodNameLower.includes('marinate') || 
            methodNameLower.includes('ferment') || 
            (methodNameLower )?.includes?.('cure')) {
          lunarScore += 0.03;
        }
      }
      // Full moon favors completion methods, preservation methods
      else if (lunarPhase === 'full moon') {
        if ((methodNameLower )?.includes?.('preserve') || 
            (methodNameLower )?.includes?.('smoke') || 
            (methodNameLower )?.includes?.('dry') || 
            (methodNameLower )?.includes?.('can') ||
            (methodNameLower )?.includes?.('finish')) {
          lunarScore += 0.03;
        }
      }
      // Waxing moon favors building methods, long-cooking methods
      else if (lunarPhase === 'waxing crescent' || lunarPhase === 'waxing gibbous') {
        if ((methodNameLower )?.includes?.('slow') || 
            (methodNameLower )?.includes?.('brais') || 
            (methodNameLower )?.includes?.('roast') || 
            (methodNameLower )?.includes?.('stew')) {
          lunarScore += 0.03;
        }
      }
      // Waning moon favors reduction methods, quick methods
      else if (lunarPhase === 'waning gibbous' || lunarPhase === 'waning crescent') {
        if ((methodNameLower )?.includes?.('reduce') || 
            (methodNameLower )?.includes?.('quick') || 
            (methodNameLower )?.includes?.('flash') || 
            (methodNameLower )?.includes?.('blanch')) {
          lunarScore += 0.03;
        }
      }
    }
    
    // Venus influence scoring
    if (isVenusActive) {
      // Check if method aligns with Venus culinary techniques
      if (venusData.PlanetSpecific?.CulinaryTechniques) {
        const methodData = method as Record<string, unknown>;
        const methodNameLower = String(methodData?.name || '').toLowerCase();
        const methodDescLower = String(methodData?.description || '').toLowerCase();
        
        // Check for aesthetic techniques
        if ((methodNameLower.includes('plate') || methodNameLower.includes('present') ||
           methodDescLower.includes('presentation') || methodDescLower.includes('aesthetic')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation'] * 1.5;
        }
        
        // Check for aroma techniques
        if (((methodNameLower )?.includes?.('aroma') || (methodNameLower )?.includes?.('infuse') ||
           (methodDescLower )?.includes?.('fragrant') || (methodDescLower )?.includes?.('scent')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion'] * 1.5;
        }
        
        // Check for flavor balancing techniques
        if (((methodNameLower )?.includes?.('balance') || (methodNameLower )?.includes?.('harmonize') ||
           (methodDescLower )?.includes?.('balanced') || (methodDescLower )?.includes?.('harmony')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing'] * 1.8;
        }
        
        // Check for textural contrast techniques
        if (((methodNameLower )?.includes?.('texture') || (methodNameLower )?.includes?.('contrast') ||
           (methodDescLower )?.includes?.('textural') || (methodDescLower )?.includes?.('crispy') ||
           (methodDescLower )?.includes?.('crunchy')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast'] * 1.6;
        }
        
        // Check for sensory harmony techniques
        if (((methodNameLower )?.includes?.('sensory') || (methodNameLower )?.includes?.('harmony') ||
           (methodDescLower )?.includes?.('sensory') || (methodDescLower )?.includes?.('experience')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony'] * 1.7;
        }
      }
      
      // Add score for culinary temperament alignment
      if (venusTemperament && venusTemperament.FoodFocus) {
        const foodFocus = String(venusTemperament.FoodFocus || '').toLowerCase();
        const methodData = method as Record<string, unknown>;
        const methodName = String(methodData?.name || '').toLowerCase();
        const methodDesc = String(methodData?.description || '').toLowerCase();
        
        // Check keyword matches between Venus temperament food focus and method description
        const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
        const matchCount = keywords.filter(keyword => 
          methodName.includes(keyword) || methodDesc.includes(keyword)
        ).length;
        
        venusScore += matchCount * 0.8;
        
        // Check elements alignment with Venus temperament
        if (venusTemperament.Elements && (method as Record<string, unknown>)?.elementalEffect) {
          for (const element in venusTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as Record<string, unknown>)?.elementalEffect[elementProperty]) {
              venusScore += venusTemperament.Elements[element] * (method as Record<string, unknown>)?.elementalEffect[elementProperty] * 1.2;
            }
          }
        }
      }
      
      // Add score for current zodiac transit data
      if (venusZodiacTransit) {
        // Check food focus alignment
        if (venusZodiacTransit.FoodFocus) {
          const transitFocus = (venusZodiacTransit.FoodFocus as string)?.toLowerCase?.();
          const methodData = method as Record<string, unknown>;
          const methodDesc = typeof methodData?.description === 'string' ? methodData.description.toLowerCase() : '';
          const methodName = typeof methodData?.name === 'string' ? methodData.name.toLowerCase() : '';
          
          // Check for keyword matches
          const focusKeywords = transitFocus.split(/[\s,;]+/).filter(k => k.length > 3);
          const focusMatchCount = focusKeywords.filter(keyword => 
            methodName.includes(keyword) || methodDesc.includes(keyword)
          ).length;
          
          venusScore += focusMatchCount * 1.0;
        }
        
        // Check elements alignment with transit
        if (venusZodiacTransit.Elements && (method as Record<string, unknown>)?.elementalEffect) {
          for (const element in venusZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as Record<string, unknown>)?.elementalEffect[elementProperty]) {
              venusScore += venusZodiacTransit.Elements[element] * (method as Record<string, unknown>)?.elementalEffect[elementProperty] * 0.8;
            }
          }
        }
      }
      
      // Apply Venus retrograde modifications
      if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
        // Check if cooking method aligns with retrograde focus
        // Extract retrograde data with safe property access
        const retrogradeData = venusData.PlanetSpecific.Retrograde as Record<string, unknown>;
        const foodFocus = retrogradeData?.FoodFocus;
        
        if (foodFocus) {
          const retroFocus = typeof foodFocus === 'string' ? foodFocus.toLowerCase() : '';
          const methodData = method as Record<string, unknown>;
          const methodName = typeof methodData?.name === 'string' ? methodData.name.toLowerCase() : '';
          const methodDesc = typeof methodData?.description === 'string' ? methodData.description.toLowerCase() : '';
          
          if (retroFocus.includes('traditional') && 
              (methodName.includes('traditional') || methodDesc.includes('classic') || 
               (typeof method.culturalOrigin === 'string' && method.culturalOrigin.includes('traditional')))) {
            venusScore *= 1.5; // Boost traditional methods during retrograde
          } else if (retroFocus.includes('slow') && 
                    (methodName.includes('slow') || methodDesc.includes('simmer') || 
                     (typeof method.duration?.min === 'number' && method.duration.min > 60))) {
            venusScore *= 1.4; // Boost slow cooking methods
          } else if (retroFocus.includes('revisit') && (typeof method.culturalOrigin === 'string' && method.culturalOrigin.includes('ancient'))) {
            venusScore *= 1.3; // Boost ancient methods
          } else {
            venusScore *= 0.9; // Slightly reduce other Venus influences
          }
        }
        
        // Apply retrograde elements influence
        const elements = retrogradeData?.Elements;
        if (elements && (method as Record<string, unknown>)?.elementalEffect) {
          const elementsData = elements as Record<string, unknown>;
          for (const element in elementsData) {
            const elementProperty = element as keyof ElementalProperties;
                          if ((method as Record<string, unknown>)?.elementalEffect[elementProperty]) {
                venusScore *= (1 + ((elementsData[element] as number || 0) * 
                                 (method as Record<string, unknown>)?.elementalEffect[elementProperty] * 0.15));
              }
          }
        }
      }
      
      // Special method bonuses for Venus-ruled techniques
      const venusMethodBoosts = {
        'sous_vide': 1.3,  // Precise temperature control for perfect results
        'confit': 1.4,     // Slow, luxurious preservation method
        'glaze': 1.5,      // Beautiful, glossy finish
        'caramelize': 1.3, // Brings out natural sweetness
        'infuse': 1.4,     // Subtle flavor development
        'braise': 1.2,     // Tender, succulent results
        'flambe': 1.3,     // Dramatic presentation
        'poach': 1.2,      // Gentle, delicate cooking
        'candy': 1.5       // Sweet preservation
      };
      
      for (const [methodName, boost] of Object.entries(venusMethodBoosts)) {
        const methodData = method as Record<string, unknown>;
        const methodNameStr = typeof methodData?.name === 'string' ? methodData.name.toLowerCase() : '';
        const methodDescStr = typeof methodData?.description === 'string' ? methodData.description.toLowerCase() : '';
        if (methodNameStr.includes(methodName) || methodDescStr.includes(methodName)) {
          venusScore *= boost;
          break; // Apply only one boost
        }
      }
      
      // Add Venus score to total method score (weighted at 15% of total)
      method.score += venusScore * 0.15;
    }
    
    // Calculate final score with proper weighting
    score = (
      elementalScore * 0.40 +
      astrologicalScore * 0.25 +
      seasonalScore * 0.15 +
      toolScore * 0.10 +
      dietaryScore * 0.10 +
      culturalScore +
      lunarScore +
      (venusScore * 0.15) // Venus influence as additional component
    );
    
    // Capture detailed scoring components for transparency
    // Extract method data with safe property access
    const methodData = method as Record<string, unknown>;
    const scoreDetails = {
      elemental: elementalScore * 0.40,
      astrological: astrologicalScore * 0.25,
      seasonal: seasonalScore * 0.15,
      tools: toolScore * 0.10,
      dietary: dietaryScore * 0.10,
      cultural: culturalScore,
      lunar: lunarScore,
      venus: venusScore * 0.15,
      total: Math.max(0, score) // Ensure score isn't negative
    };

    // Add the recommendation with calculated score
    // Extract affinity data with safe property access
    const planetaryAffinity = (methodData?.planetaryAffinity as number) || 0;
    const scoreDetailsForUI = scoreDetails;
    
    recommendations.push({
      method: (method as Record<string, unknown>)?.id,
      score: Math.max(0, score), // Ensure score isn't negative
      description: (method as Record<string, unknown>)?.description,
      benefits: method.benefits,
      lunarAffinity: calculateLunarMethodAffinity((method as unknown) as CookingMethod, lunarPhase),
      elementalAffinity: (method as Record<string, unknown>)?.elementalEffect?.[signElement] || 0,
      planetaryAffinity: planetaryAffinity,
      scoreDetails: scoreDetailsForUI // Include detailed scoring for UI display
    } as any);
    
    // Mark this method as processed to avoid duplicates
    recommendationsMap[methodNameNorm] = true;
  });

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

function calculateLunarMethodAffinity(method: CookingMethod, phase: LunarPhase): number {
  // Convert method to proper type with safe property access
  const methodData = method as unknown as Record<string, unknown>;
  const properties = methodData?.properties as Record<string, unknown>;
  const element = properties?.element as string;
  
  if (!element) return 0.5;

  // Lunar phase elemental associations
  const lunarElementMap: Record<string, string> = {
    'new moon': 'Water',
    'waxing crescent': 'Air',
    'first quarter': 'Fire',
    'waxing gibbous': 'Fire',
    'full moon': 'Water',
    'waning gibbous': 'Earth',
    'last quarter': 'Earth',
    'waning crescent': 'Air'
  };

  const lunarElement = lunarElementMap[phase] || 'Water';
  
  // Calculate affinity based on elemental compatibility
  if (element === lunarElement) {
    return 0.9; // High affinity for matching elements
  }
  
  // Check for complementary elements
  const complementaryPairs: Record<string, string> = {
    'Fire': 'Air',
    'Air': 'Fire',
    'Water': 'Earth',
    'Earth': 'Water'
  };
  
  if (complementaryPairs[element] === lunarElement) {
    return 0.7; // Good affinity for complementary elements
  }
  
  return 0.3; // Lower affinity for other combinations
}

function _calculateAspectMethodAffinity(aspects: PlanetaryAspect[], method: CookingMethod): number {
  if (!aspects || aspects.length === 0) return 0.5;

  let totalAffinity = 0;
  let aspectCount = 0;

  for (const aspect of aspects) {
    // Convert method to proper type with safe property access
    const methodData = method as unknown as Record<string, unknown>;
    const sensoryProfile = methodData?.sensoryProfile as Record<string, unknown>;
    const properties = methodData?.properties as Record<string, unknown>;
    
    if (!properties) continue;

    // Calculate aspect-specific affinity
    const aspectType = aspect.type;
    const aspectStrength = aspect.orb || 0;
    
    // Base affinity based on aspect type
    let baseAffinity = 0.5;
    switch (aspectType) {
      case 'conjunction':
        baseAffinity = 0.9;
        break;
      case 'trine':
        baseAffinity = 0.8;
        break;
      case 'sextile':
        baseAffinity = 0.7;
        break;
      case 'square':
        baseAffinity = 0.4;
        break;
      case 'opposition':
        baseAffinity = 0.3;
        break;
      default:
        baseAffinity = 0.5;
    }

    // Adjust for aspect strength
    const strengthMultiplier = Math.max(0.5, 1 - (aspectStrength / 10));
    const adjustedAffinity = baseAffinity * strengthMultiplier;

    totalAffinity += adjustedAffinity;
    aspectCount++;
  }

  return aspectCount > 0 ? totalAffinity / aspectCount : 0.5;
}

export function calculateMethodScore(method: CookingMethodProfile, astroState: AstrologicalState): number {
  // Convert method to proper type with safe property access
  // ✅ Pattern MM-1: Safe type assertion for method data access
  const methodData = (method as unknown) as Record<string, unknown>;
  const astrologicalInfluence = methodData?.astrologicalInfluence as Record<string, unknown>;
  
  let score = 0.5; // Base score

  // Elemental compatibility
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  const elementalScore = calculateElementalCompatibility(methodElemental, astroElemental);
  score += elementalScore * 0.4; // 40% weight

  // Astrological influence
  if (astrologicalInfluence) {
    // ✅ Pattern GG-6: Safe property access for astrological influences
    const zodiacCompatibility = (astrologicalInfluence?.zodiacCompatibility as Record<string, unknown>) || {};
    const planetaryAlignment = (astrologicalInfluence?.planetaryAlignment as Record<string, unknown>) || {};
    
    if (zodiacCompatibility) {
      const currentZodiac = astroState.currentZodiac;
      // ✅ Pattern KK-1: Safe number conversion for zodiac score
      const zodiacScore = Number(zodiacCompatibility[currentZodiac]) || 0.5;
      score += zodiacScore * 0.3; // 30% weight
    }
    
    if (planetaryAlignment) {
      const currentPlanets = astroState.currentPlanetaryAlignment;
      // ✅ Pattern KK-1: Safe number conversion for planet scores
      const planetScores = Object.entries(currentPlanets).map(([planet, _]) => 
        Number(planetaryAlignment[planet]) || 0.5
      );
      const avgPlanetScore = planetScores.reduce((sum, score) => sum + score, 0) / planetScores.length;
      score += avgPlanetScore * 0.3; // 30% weight
    }
  }

  return Math.min(1.0, Math.max(0.0, score));
}

// Helper function to get method elemental profile
function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  // ✅ Pattern GG-6: Safe property access for elemental profile
  const methodData = (method as unknown) as Record<string, unknown>;
  return (methodData?.elementalProperties as ElementalProperties) || 
         (methodData?.elementalEffect as ElementalProperties) || { 
    Fire: 0, 
    Water: 0, 
    Earth: 0, 
    Air: 0 
  };
}

// Helper function to get astrological elemental profile
// Now prioritizes a pre-calculated full elemental profile if available in astroState
function getAstrologicalElementalProfile(astroState: AstrologicalState): ElementalProperties | null {
  // 1. Check if a comprehensive elemental profile is provided directly in astroState
  //    (Names might be 'elementalProfile' or 'elementalState' based on usage elsewhere)
  // ✅ Pattern GG-6: Safe property access for astrological state elemental profile
  const astroData = (astroState as unknown) as Record<string, unknown>;
  if (astroData?.elementalProfile && Object.keys(astroData.elementalProfile as Record<string, unknown>).length > 0) {
    return astroData.elementalProfile as ElementalProperties;
  }
  if (astroData?.elementalState && Object.keys(astroData.elementalState as Record<string, unknown>).length > 0) {
    return astroData.elementalState as ElementalProperties;
  }

  // 2. Fallback: Calculate a simplified profile based only on the zodiac (Sun) sign
  //    This is less accurate but provides a default if the full profile is missing.
  if (astroState.zodiacSign) {
    // ✅ Pattern KK-1: Safe string conversion for zodiac sign
    const sign = String(astroState.zodiacSign || '').toLowerCase();
    return {
      Fire: (sign.includes('aries') || sign.includes('leo') || sign.includes('sagittarius')) ? 0.8 : 0.2,
      Water: (sign.includes('cancer') || sign.includes('scorpio') || sign.includes('pisces')) ? 0.8 : 0.2,
      Earth: (sign.includes('taurus') || sign.includes('virgo') || sign.includes('capricorn')) ? 0.8 : 0.2,
      Air: (sign.includes('gemini') || sign.includes('libra') || sign.includes('aquarius')) ? 0.8 : 0.2
    };
  }

  // 3. Return null if no profile can be determined
  return null;
}

// Helper function to calculate elemental compatibility
function calculateElementalCompatibility(elementalA: ElementalProperties | null, elementalB: ElementalProperties | null): number {
  // Return low compatibility if either profile is missing
  if (!elementalA || !elementalB) {
    return 0.2; // Low base compatibility if profiles are incomplete
  }

  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  let compatibilityScore = 0;
  let totalWeight = 0;
  
  for (const element of elements) {
    const valA = elementalA[element as keyof ElementalProperties];
    const valB = elementalB[element as keyof ElementalProperties];

    // Ensure both values are numbers before calculating
    if (typeof valA === 'number' && typeof valB === 'number') {
      // Calculate similarity (higher values = more similar)
      const similarity = 1 - Math.abs(valA - valB);
      compatibilityScore += similarity;
      totalWeight += 1;
    }
  }
  
  // Normalize the score based on how many elements were compared
  return totalWeight > 0 ? compatibilityScore / totalWeight : 0;
}

export function getCookingMethodRecommendations(
  astroState: AstrologicalState,
  options: MethodRecommendationOptions = {}
): MethodRecommendation[] {
  // Convert astroState to proper type with safe property access
  // ✅ Pattern MM-1: Safe type assertion for astrological state
  const astroData = (astroState as unknown) as Record<string, unknown>;
  const currentElementalProperties = astroData?.currentElementalProperties as ElementalProperties;
  
  if (!currentElementalProperties) {
    return [];
  }

  // Get all available cooking methods
  const allMethods = Object.values(allCookingMethodsCombined);
  
  // Calculate scores for each method
  const scoredMethods = allMethods.map(method => {
    const score = calculateMethodScore(method as unknown as CookingMethodProfile, astroState);
    return {
      method: method as unknown as CookingMethod,
      score,
      reasoning: `Elemental compatibility: ${score.toFixed(2)}`
    };
  });

  // ✅ Pattern KK-1: Safe number conversion for max recommendations
  const maxRecs = Number(options.maxRecommendations) || 5;
  
  // Sort by score and return top recommendations
  return scoredMethods
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecs)
    .map(({ method, score, reasoning }) => ({
      method,
      score,
      reasoning
    })) as unknown as MethodRecommendation[];
}

/**
 * Helper to get the element associated with a zodiac sign
 */
function getElementForSign(sign: ZodiacSign): keyof ElementalProperties {
  // ✅ Pattern KK-1: Safe string conversion for element lookup
  const signLower = String(sign || '').toLowerCase();
  const fireElements = ['aries', 'leo', 'sagittarius'];
  const earthElements = ['taurus', 'virgo', 'capricorn'];
  const airElements = ['gemini', 'libra', 'aquarius'];
  const waterElements = ['cancer', 'scorpio', 'pisces'];
  
  if (fireElements.includes(signLower)) return 'Fire';
  if (earthElements.includes(signLower)) return 'Earth';
  if (airElements.includes(signLower)) return 'Air';
  if (waterElements.includes(signLower)) return 'Water';
  
  return 'Fire'; // Default fallback
} 
import { allCookingMethods, cookingMethods as detailedCookingMethods } from '@/data/cooking';
import { culturalCookingMethods, getCulturalVariations } from '@/utils/culturalMethodsAggregator';
import type { ZodiacSign, ElementalProperties } from '@/types';
import type { CookingMethod as CookingMethodEnum } from '@/types/alchemy';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import venusData from '@/data/planets/venus';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';
import saturnData from '@/data/planets/saturn';
import uranusData from '@/data/planets/uranus';
import neptuneData from '@/data/planets/neptune';
import plutoData from '@/data/planets/pluto';
import { PlanetaryAspect, LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { CookingMethod } from '@/types/cooking';
import { calculateLunarPhase, getLunarPhaseName } from '@/utils/astrologyUtils';

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
    acc[id] = {
      id,
      ...(method as any),
      elementalEffect: (method as any)?.elementalEffect || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      suitable_for: (method as any)?.suitable_for || [],
      benefits: (method as any)?.benefits || [],
      variations: [] // Initialize empty variations array
    };
    return acc;
  }, {})),
  
  // Add all cultural methods, making sure they don't override any existing methods
  // and properly organizing them into variations if they're related to main methods
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    // Check if this method is a variation of a main method
    if (method.relatedToMainMethod) {
      // If the main method exists, add this as a variation
      if (methods[method.relatedToMainMethod]) {
        // Add to variations if it doesn't exist yet
        const existingVariations = methods[method.relatedToMainMethod].variations || [];
        if (!existingVariations.some(v => v.id === (method as any)?.id)) {
          methods[method.relatedToMainMethod].variations = [
            ...existingVariations,
            {
              id: (method as any)?.id,
              name: method.variationName || (method as any)?.name,
              description: (method as any)?.description,
              elementalEffect: (method as any)?.elementalProperties || {
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
              },
              toolsRequired: method.toolsRequired || [],
              bestFor: method.bestFor || [],
              culturalOrigin: method.culturalOrigin,
              astrologicalInfluences: {
                favorableZodiac: (method.astrologicalInfluences?.favorableZodiac as ZodiacSign[]) || [],
                unfavorableZodiac: (method.astrologicalInfluences?.unfavorableZodiac as ZodiacSign[]) || [],
                dominantPlanets: method.astrologicalInfluences?.dominantPlanets || []
              },
              duration: { min: 10, max: 30 },
              suitable_for: (method as any)?.bestFor || [],
              benefits: [],
              relatedToMainMethod: method.relatedToMainMethod
            } as CookingMethodData
          ];
        }
        // Don't add as a standalone method
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[(method as any)?.id] && !method.relatedToMainMethod) {
      methods[(method as any)?.id] = {
        id: (method as any)?.id,
        name: (method as any)?.name,
        description: (method as any)?.description,
        elementalEffect: (method as any)?.elementalProperties || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        toolsRequired: method.toolsRequired || [],
        bestFor: method.bestFor || [],
        culturalOrigin: method.culturalOrigin,
        astrologicalInfluences: {
          favorableZodiac: (method.astrologicalInfluences?.favorableZodiac as ZodiacSign[]) || [],
          unfavorableZodiac: (method.astrologicalInfluences?.unfavorableZodiac as ZodiacSign[]) || [],
          dominantPlanets: method.astrologicalInfluences?.dominantPlanets || []
        },
        duration: { min: 10, max: 30 },
        suitable_for: (method as any)?.bestFor || [],
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
function getMethodThermodynamics(method: CookingMethodProfile): BasicThermodynamicProperties {
  const methodNameLower = (method as any)?.(name as any)?.toLowerCase?.() as CookingMethodEnum; // Ensure correct type for lookup

  // 1. Check the detailed data source first
  const detailedMethodData = detailedCookingMethods[methodNameLower];
  if (detailedMethodData && detailedMethodData.thermodynamicProperties) {
    return {
      heat: detailedMethodData.thermodynamicProperties.heat ?? 0.5,
      entropy: detailedMethodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: detailedMethodData.thermodynamicProperties.reactivity ?? 0.5,
      gregsEnergy: (detailedMethodData.thermodynamicProperties as any).gregsEnergy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties defined (might be passed dynamically)
  const methodData = method as any;
  if (methodData?.thermodynamicProperties) {
    return {
      heat: methodData.thermodynamicProperties.heat ?? 0.5,
      entropy: methodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: methodData.thermodynamicProperties.reactivity ?? 0.5,
      gregsEnergy: (methodData.thermodynamicProperties as any).gregsEnergy ?? 0.5,
    };
  }
  
  // 3. Check the explicitly defined mapping constant (COOKING_METHOD_THERMODYNAMICS)
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - ENHANCED with more cooking methods
  if ((methodNameLower as any)?.includes?.('grill') || (methodNameLower as any)?.includes?.('roast') || 
      (methodNameLower as any)?.includes?.('fry') || (methodNameLower as any)?.includes?.('sear') || 
      (methodNameLower as any)?.includes?.('broil') || (methodNameLower as any)?.includes?.('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.6 }; // High heat methods
  } else if ((methodNameLower as any)?.includes?.('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.55 }; // Medium-high heat, dry
  } else if ((methodNameLower as any)?.includes?.('steam') || (methodNameLower as any)?.includes?.('simmer') || 
             (methodNameLower as any)?.includes?.('poach') || (methodNameLower as any)?.includes?.('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 }; // Medium heat, lower entropy methods
  } else if ((methodNameLower as any)?.includes?.('sous vide') || (methodNameLower as any)?.includes?.('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.25 }; // Low heat, low reactivity
  } else if ((methodNameLower as any)?.includes?.('raw') || (methodNameLower as any)?.includes?.('ceviche') || 
             (methodNameLower as any)?.includes?.('ferment') || (methodNameLower as any)?.includes?.('pickle') || 
             (methodNameLower as any)?.includes?.('cure') || (methodNameLower as any)?.includes?.('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 }; // No/low heat methods
  } else if ((methodNameLower as any)?.includes?.('braise') || (methodNameLower as any)?.includes?.('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60, gregsEnergy: 0.5 }; // Moderate heat, high entropy
  } else if ((methodNameLower as any)?.includes?.('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.6 }; // High heat/pressure, rapid breakdown
  } else if ((methodNameLower as any)?.includes?.('smoke') || (methodNameLower as any)?.includes?.('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.65 }; // Moderate heat, high reactivity
  } else if ((methodNameLower as any)?.includes?.('confit') || (methodNameLower as any)?.includes?.('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.4 }; // Low heat, gradual cooking
  } else if ((methodNameLower as any)?.includes?.('dehydrat') || (methodNameLower as any)?.includes?.('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 }; // Low heat, preservation
  } else if ((methodNameLower as any)?.includes?.('toast') || (methodNameLower as any)?.includes?.('brulee')) {
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
  if ((normalized1 as any)?.includes?.(normalized2) || (normalized2 as any)?.includes?.(normalized1)) {
    return true;
  }
  
  // Simple fuzzy matching - check if they share a significant number of characters
  const commonWords = normalized1.split(' ').filter(word => 
    word.length > 3 && (normalized2 as any)?.includes?.(word)
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
    if (group.some(item => (normalized1 as any)?.includes?.(item)) && 
        group.some(item => (normalized2 as any)?.includes?.(item))) {
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
  const methodElementals = (method as any)?.elementalProperties || (method as any)?.elementalEffect || {};
  const diurnalMatch = methodElementals[diurnalElement] || 0;
  const nocturnalMatch = methodElementals[nocturnalElement] || 0;
  
  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
  
  // If the method has a direct planetary affinity, give bonus points
  const methodData = method as any;
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
  const methodElementals = (method as any)?.elementalProperties || (method as any)?.elementalEffect || {};
  const elementalMatch = methodElementals[relevantElement] || 0;
  
  // Calculate score based on how well the method matches the planetary hour's element
  let elementalScore = elementalMatch;
  
  // If the method has a direct planetary affinity, give bonus points
  const methodHourData = method as any;
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
    const lowerSign = (currentZodiac as any)?.toLowerCase?.();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    
    if ((earthSigns as any)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as any)?.EarthVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as any).EarthVenus;
    } else if ((airSigns as any)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as any)?.AirVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as any).AirVenus;
    } else if ((waterSigns as any)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as any)?.WaterVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as any).WaterVenus;
    } else if ((fireSigns as any)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as any)?.FireVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as any).FireVenus;
    }
  }
  
  // Get Mars sign-based temperament for current zodiac
  let _marsTemperament = null;
  if (currentZodiac && isMarsActive) {
    const lowerSign = (currentZodiac as any)?.toLowerCase?.();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    if ((fireSigns as any)?.includes?.(lowerSign) && (marsData.PlanetSpecific?.CulinaryTemperament as any)?.FireMars) {
      _marsTemperament = (marsData.PlanetSpecific.CulinaryTemperament as any).FireMars;
    } else if ((waterSigns as any)?.includes?.(lowerSign) && (marsData.PlanetSpecific?.CulinaryTemperament as any)?.WaterMars) {
      _marsTemperament = (marsData.PlanetSpecific.CulinaryTemperament as any).WaterMars;
    }
  }
  
  // Get Mercury sign-based temperament for current zodiac
  let mercuryTemperament = null;
  if (currentZodiac && isMercuryActive) {
    const lowerSign = (currentZodiac as any)?.toLowerCase?.();
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    
    if ((airSigns as any)?.includes?.(lowerSign) && (mercuryData.PlanetSpecific?.CulinaryTemperament as any)?.AirMercury) {
      mercuryTemperament = (mercuryData.PlanetSpecific.CulinaryTemperament as any).AirMercury;
    } else if ((earthSigns as any)?.includes?.(lowerSign) && (mercuryData.PlanetSpecific?.CulinaryTemperament as any)?.EarthMercury) {
      mercuryTemperament = (mercuryData.PlanetSpecific.CulinaryTemperament as any).EarthMercury;
    }
  }
  
  // Get Jupiter sign-based temperament for current zodiac
  let jupiterTemperament = null;
  if (currentZodiac && isJupiterActive) {
    const lowerSign = (currentZodiac as any)?.toLowerCase?.();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if ((fireSigns as any)?.includes?.(lowerSign) && (jupiterData.PlanetSpecific?.CulinaryTemperament as any)?.FireJupiter) {
      jupiterTemperament = (jupiterData.PlanetSpecific.CulinaryTemperament as any).FireJupiter;
    } else if ((airSigns as any)?.includes?.(lowerSign) && (jupiterData.PlanetSpecific?.CulinaryTemperament as any)?.AirJupiter) {
      jupiterTemperament = (jupiterData.PlanetSpecific.CulinaryTemperament as any).AirJupiter;
    }
  }
  
  // Get Saturn sign-based temperament for current zodiac
  let _saturnTemperament = null;
  if (currentZodiac && isSaturnActive) {
    const lowerSign = (currentZodiac as any)?.toLowerCase?.();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if ((earthSigns as any)?.includes?.(lowerSign) && (saturnData.PlanetSpecific?.CulinaryTemperament as any)?.EarthSaturn) {
      _saturnTemperament = (saturnData.PlanetSpecific.CulinaryTemperament as any).EarthSaturn;
    } else if ((airSigns as any)?.includes?.(lowerSign) && (saturnData.PlanetSpecific?.CulinaryTemperament as any)?.AirSaturn) {
      _saturnTemperament = (saturnData.PlanetSpecific.CulinaryTemperament as any).AirSaturn;
    }
  }
  
  // Get the current lunar phase for additional scoring
  const lunarPhaseValue = await calculateLunarPhase(new Date());
  const lunarPhase = getLunarPhaseName(lunarPhaseValue);

  // Track recommendations to prevent adding duplicates
  const recommendationsMap: Record<string, boolean> = {};
  const recommendations: any[] = [];
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Skip if we already have a similar method
    const methodNameNorm = normalizeMethodName((method as any)?.name);
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
    if ((method as any)?.elementalEffect || (method as any)?.elementalProperties) {
      const elementalProps = (method as any)?.elementalEffect || (method as any)?.elementalProperties || {};
      
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
          planetaryDayScore = calculatePlanetaryDayInfluence(method, planetaryDay);
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
          planetaryHourScore = calculatePlanetaryHourInfluence(method, planetaryHour, daytime);
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
    if ((method as any)?.preferences?.seasonalPreference && (method as any)?.preferences?.seasonalPreference?.includes?.(season)) {
      seasonalScore += 0.15;
    } else {
      // Enhanced default seasonal preferences
      if (season === 'winter') {
        if ((method as any)?.(name as any)?.toLowerCase?.().includes('brais') || 
            (method as any)?.(name as any)?.toLowerCase?.().includes('roast') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('stew') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('bake')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'summer') {
        if ((method as any)?.(name as any)?.toLowerCase?.().includes('grill') || 
            (method as any)?.(name as any)?.toLowerCase?.().includes('raw') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('ceviche') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('cold')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'spring') {
        if ((method as any)?.(name as any)?.toLowerCase?.().includes('steam') || 
            (method as any)?.(name as any)?.toLowerCase?.().includes('stir') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('blanch') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('quick')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'fall' || season === 'autumn') {
        if ((method as any)?.(name as any)?.toLowerCase?.().includes('smoke') || 
            (method as any)?.(name as any)?.toLowerCase?.().includes('brais') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('slow') ||
            (method as any)?.(name as any)?.toLowerCase?.().includes('roast')) {
          seasonalScore += 0.12;
        }
      }
    }
    
    // Tools availability (10% of score)
    if (availableTools && method.toolsRequired) {
      const requiredTools = method.toolsRequired;
      const availableRequiredTools = requiredTools.filter(tool => 
        availableTools.some(available => (available as any)?.toLowerCase?.().includes((tool as any)?.toLowerCase?.()))
      );
      
      toolScore = (availableRequiredTools.length / requiredTools.length) * 0.1;
    } else {
      // Enhanced assumptions about basic tools availability
      const methodName = (method as any)?.(name as any)?.toLowerCase?.();
      if ((methodName as any)?.includes?.('sous_vide') || (methodName as any)?.includes?.('sous vide')) {
        toolScore = 0.01; // Specialized equipment
      } else if ((methodName as any)?.includes?.('pressure') || (methodName as any)?.includes?.('instant pot')) {
        toolScore = 0.03; // Somewhat specialized
      } else if ((methodName as any)?.includes?.('smoker') || (methodName as any)?.includes?.('smoke') || 
                 (methodName as any)?.includes?.('molecular') || (methodName as any)?.includes?.('spherification') ||
                 (methodName as any)?.includes?.('thermal immersion') || (methodName as any)?.includes?.('liquid nitrogen')) {
        toolScore = 0.02; // Quite specialized
      } else if ((methodName as any)?.includes?.('grill') && !(methodName as any)?.includes?.('stove top')) {
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
          (suitable as any)?.toLowerCase?.().includes((pref as any)?.toLowerCase?.())
        )) {
          matchStrength += 1.0;
          continue;
        }
        
        // Special case mappings
        if ((pref as any)?.toLowerCase?.() === 'vegetarian' && 
            (method as any)?.(name as any)?.toLowerCase?.().includes('veget')) {
          matchStrength += 0.8;
        } else if ((pref as any)?.toLowerCase?.() === 'vegan' && 
                  !(method as any)?.(name as any)?.toLowerCase?.().includes('meat') &&
                  !(method as any)?.(name as any)?.toLowerCase?.().includes('fish')) {
          matchStrength += 0.6;
        } else if ((pref as any)?.toLowerCase?.().includes('gluten') && 
                  !(method as any)?.(name as any)?.toLowerCase?.().includes('bread') &&
                  !(method as any)?.(name as any)?.toLowerCase?.().includes('pasta') &&
                  !(method as any)?.(name as any)?.toLowerCase?.().includes('flour')) {
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
      const methodNameLower = (method as any)?.(name as any)?.toLowerCase?.();
      
      // New moon favors starting new methods, preparation methods
      if (lunarPhase === 'new moon') {
        if ((methodNameLower as any)?.includes?.('prep') || 
            (methodNameLower as any)?.includes?.('marinate') || 
            (methodNameLower as any)?.includes?.('ferment') || 
            (methodNameLower as any)?.includes?.('cure')) {
          lunarScore += 0.03;
        }
      }
      // Full moon favors completion methods, preservation methods
      else if (lunarPhase === 'full moon') {
        if ((methodNameLower as any)?.includes?.('preserve') || 
            (methodNameLower as any)?.includes?.('smoke') || 
            (methodNameLower as any)?.includes?.('dry') || 
            (methodNameLower as any)?.includes?.('can') ||
            (methodNameLower as any)?.includes?.('finish')) {
          lunarScore += 0.03;
        }
      }
      // Waxing moon favors building methods, long-cooking methods
      else if (lunarPhase === 'waxing crescent' || lunarPhase === 'waxing gibbous') {
        if ((methodNameLower as any)?.includes?.('slow') || 
            (methodNameLower as any)?.includes?.('brais') || 
            (methodNameLower as any)?.includes?.('roast') || 
            (methodNameLower as any)?.includes?.('stew')) {
          lunarScore += 0.03;
        }
      }
      // Waning moon favors reduction methods, quick methods
      else if (lunarPhase === 'waning gibbous' || lunarPhase === 'waning crescent') {
        if ((methodNameLower as any)?.includes?.('reduce') || 
            (methodNameLower as any)?.includes?.('quick') || 
            (methodNameLower as any)?.includes?.('flash') || 
            (methodNameLower as any)?.includes?.('blanch')) {
          lunarScore += 0.03;
        }
      }
    }
    
    // Venus influence scoring
    if (isVenusActive) {
      // Check if method aligns with Venus culinary techniques
      if (venusData.PlanetSpecific?.CulinaryTechniques) {
        const methodNameLower = (method as any)?.(name as any)?.toLowerCase?.();
        const methodDescLower = (method as any)?.description?.toLowerCase?.();
        
        // Check for aesthetic techniques
        if (((methodNameLower as any)?.includes?.('plate') || (methodNameLower as any)?.includes?.('present') ||
           (methodDescLower as any)?.includes?.('presentation') || (methodDescLower as any)?.includes?.('aesthetic')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation'] * 1.5;
        }
        
        // Check for aroma techniques
        if (((methodNameLower as any)?.includes?.('aroma') || (methodNameLower as any)?.includes?.('infuse') ||
           (methodDescLower as any)?.includes?.('fragrant') || (methodDescLower as any)?.includes?.('scent')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion'] * 1.5;
        }
        
        // Check for flavor balancing techniques
        if (((methodNameLower as any)?.includes?.('balance') || (methodNameLower as any)?.includes?.('harmonize') ||
           (methodDescLower as any)?.includes?.('balanced') || (methodDescLower as any)?.includes?.('harmony')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing'] * 1.8;
        }
        
        // Check for textural contrast techniques
        if (((methodNameLower as any)?.includes?.('texture') || (methodNameLower as any)?.includes?.('contrast') ||
           (methodDescLower as any)?.includes?.('textural') || (methodDescLower as any)?.includes?.('crispy') ||
           (methodDescLower as any)?.includes?.('crunchy')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast'] * 1.6;
        }
        
        // Check for sensory harmony techniques
        if (((methodNameLower as any)?.includes?.('sensory') || (methodNameLower as any)?.includes?.('harmony') ||
           (methodDescLower as any)?.includes?.('sensory') || (methodDescLower as any)?.includes?.('experience')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony'] * 1.7;
        }
      }
      
      // Add score for culinary temperament alignment
      if (venusTemperament && venusTemperament.FoodFocus) {
        const foodFocus = (venusTemperament.FoodFocus as any)?.toLowerCase?.();
        const methodName = (method as any)?.(name as any)?.toLowerCase?.();
        const methodDesc = (method as any)?.description?.toLowerCase?.();
        
        // Check keyword matches between Venus temperament food focus and method description
        const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
        const matchCount = keywords.filter(keyword => 
          (methodName as any)?.includes?.(keyword) || (methodDesc as any)?.includes?.(keyword)
        ).length;
        
        venusScore += matchCount * 0.8;
        
        // Check elements alignment with Venus temperament
        if (venusTemperament.Elements && (method as any)?.elementalEffect) {
          for (const element in venusTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as any)?.elementalEffect[elementProperty]) {
              venusScore += venusTemperament.Elements[element] * (method as any)?.elementalEffect[elementProperty] * 1.2;
            }
          }
        }
      }
      
      // Add score for current zodiac transit data
      if (venusZodiacTransit) {
        // Check food focus alignment
        if (venusZodiacTransit.FoodFocus) {
          const transitFocus = (venusZodiacTransit.FoodFocus as any)?.toLowerCase?.();
          const methodDesc = (method as any)?.description?.toLowerCase?.();
          const methodName = (method as any)?.name?.toLowerCase?.();
          
          // Check for keyword matches
          const focusKeywords = transitFocus.split(/[\s,;]+/).filter(k => k.length > 3);
          const focusMatchCount = focusKeywords.filter(keyword => 
            (methodName as any)?.includes?.(keyword) || (methodDesc as any)?.includes?.(keyword)
          ).length;
          
          venusScore += focusMatchCount * 1.0;
        }
        
        // Check elements alignment with transit
        if (venusZodiacTransit.Elements && (method as any)?.elementalEffect) {
          for (const element in venusZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as any)?.elementalEffect[elementProperty]) {
              venusScore += venusZodiacTransit.Elements[element] * (method as any)?.elementalEffect[elementProperty] * 0.8;
            }
          }
        }
      }
      
      // Apply Venus retrograde modifications
      if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
        // Check if cooking method aligns with retrograde focus
        // Extract retrograde data with safe property access
        const retrogradeData = venusData.PlanetSpecific.Retrograde as any;
        const foodFocus = retrogradeData?.FoodFocus;
        
        if (foodFocus) {
          const retroFocus = foodFocus?.toLowerCase?.();
          const methodName = (method as any)?.name?.toLowerCase?.();
          const methodDesc = (method as any)?.description?.toLowerCase?.();
          
          if ((retroFocus as any)?.includes?.('traditional') && 
              ((methodName as any)?.includes?.('traditional') || (methodDesc as any)?.includes?.('classic') || 
               method.culturalOrigin?.includes('traditional'))) {
            venusScore *= 1.5; // Boost traditional methods during retrograde
          } else if ((retroFocus as any)?.includes?.('slow') && 
                    ((methodName as any)?.includes?.('slow') || (methodDesc as any)?.includes?.('simmer') || 
                     method.duration?.min > 60)) {
            venusScore *= 1.4; // Boost slow cooking methods
          } else if ((retroFocus as any)?.includes?.('revisit') && method.culturalOrigin?.includes('ancient')) {
            venusScore *= 1.3; // Boost ancient methods
          } else {
            venusScore *= 0.9; // Slightly reduce other Venus influences
          }
        }
        
        // Apply retrograde elements influence
        const elements = retrogradeData?.Elements;
        if (elements && (method as any)?.elementalEffect) {
          for (const element in elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as any)?.elementalEffect[elementProperty]) {
              venusScore *= (1 + (elements[element] * 
                               (method as any)?.elementalEffect[elementProperty] * 0.15));
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
        if ((method as any)?.name?.toLowerCase?.().includes(methodName) || 
            (method as any)?.description?.toLowerCase?.().includes(methodName)) {
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
    const methodData = method as any;
    if (!methodData.scoreDetails) {
      methodData.scoreDetails = {}; 
    }
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
    methodData.scoreDetails = scoreDetails;

    // Add the recommendation with calculated score
    // Extract affinity data with safe property access
    const planetaryAffinity = methodData?.planetaryAffinity || 0;
    const scoreDetailsForUI = methodData?.scoreDetails || {};
    
    recommendations.push({
      method: (method as any)?.id,
      score: Math.max(0, score), // Ensure score isn't negative
      description: (method as any)?.description,
      benefits: method.benefits,
      lunarAffinity: calculateLunarMethodAffinity(method as any, lunarPhase),
      elementalAffinity: (method as any)?.elementalEffect?.[signElement] || 0,
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
  let affinity = 0;

  // Extract method data with safe property access
  const methodData = method as any;
  const properties = methodData?.properties;
  const element = methodData?.element;

  switch (phase) {
    case 'New Moon':
      // New Moon favors gentle, water-based methods
      if (properties?.includes('gentle')) affinity += 0.5;
      if (element === 'water') affinity += 0.5;
      break;
    case 'Waxing Crescent':
      // Waxing Crescent favors methods that build flavor
      if (properties?.includes('builds flavor')) affinity += 0.7;
      break;
    case 'First Quarter':
      // First Quarter favors methods that transform 
      if (properties?.includes('transformative')) affinity += 0.7;
      break;
    case 'Waxing Gibbous':
      // Waxing Gibbous favors methods that intensify
      if (properties?.includes('intensifies flavor')) affinity += 0.8;
      break;
    case 'Full Moon':
      // Full Moon favors methods that fully express flavor
      if (properties?.includes('maximizes flavor')) affinity += 1.0;
      if (element === 'fire') affinity += 0.5;
      break;
    case 'Waning Gibbous':
      // Waning Gibbous favors methods that preserve
      if (properties?.includes('preserves nutrients')) affinity += 0.8;
      break;
    case 'Last Quarter':
      // Last Quarter favors methods that reduce and concentrate
      if (properties?.includes('concentrates')) affinity += 0.7;
      break;
    case 'Waning Crescent':
      // Waning Crescent favors subtle, gentle methods
      if (properties?.includes('subtle')) affinity += 0.7;
      if (element === 'water') affinity += 0.3;
      break;
    default:
      // Default minimal affinity
      affinity += 0.1;
  }

  return affinity;
}

function _calculateAspectMethodAffinity(aspects: PlanetaryAspect[], method: CookingMethod): number {
  let affinity = 0;

  for (const aspect of aspects) {
    // Check if this aspect involves planets that influence this method
    const planetaryInfluence = (aspect.planets as any[]).some(planet => 
      method.planetaryInfluences?.includes(planet)
    );

    if (planetaryInfluence) {
      // Base influence
      let baseInfluence = 0.5;

      // Stronger influence for conjunctions and oppositions
      if (aspect.type === 'conjunction') baseInfluence = 0.8;
      if (aspect.type === 'opposition') baseInfluence = 0.7;
      
      // Special consideration for Venus aspects
              if ((aspect.planets as any)?.includes?.('Venus')) {
        // Venus aspects boost methods that enhance aesthetic appeal or harmony
        // Extract method data with safe property access
        const aspectMethodData = method as any;
        const sensoryProfile = aspectMethodData?.sensoryProfile;
        const aspectProperties = aspectMethodData?.properties;
        
        if (sensoryProfile?.visual && sensoryProfile.visual > 0.6) {
          baseInfluence += 0.3;
        }
        if (aspectProperties?.includes('balances flavors')) {
          baseInfluence += 0.4;
        }
      }

      affinity += baseInfluence;
    }
  }

  return affinity;
}

export function calculateMethodScore(method: CookingMethodProfile, astroState: AstrologicalState): number {
  // Get thermodynamic properties for the method
  const thermodynamics = getMethodThermodynamics(method);
  
  // Calculate the base score using thermodynamic properties
  const baseScore = calculateThermodynamicBaseScore(thermodynamics);
  
  // Apply a lower multiplier to create more differentiation between methods
  const multiplier = 1.8;  // Reduced multiplier for more variance
  
  // Apply additional bonuses for specific astrological alignments
  let bonusScore = 0;
  
  // Add zodiac alignment bonus
  const methodAstroData = method as any;
  if (methodAstroData?.astrologicalInfluences?.favorableZodiac?.includes(astroState.zodiacSign)) {
    bonusScore += 0.15;  // Reduced bonus for zodiac alignment
  }
  
  // Add lunar phase bonus
  if (astroState.lunarPhase && methodAstroData?.astrologicalInfluences?.lunarPhaseEffect?.[astroState.lunarPhase] > 0) {
    bonusScore += 0.12;  // Reduced bonus for positive lunar phase effect
  }
  
  // Apply special multiplier for methods that are especially suited to the current elemental state
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  
  if (methodElemental && astroElemental) {
    const elementalCompatibility = calculateElementalCompatibility(methodElemental, astroElemental);
    if (elementalCompatibility > 0.7) {
      bonusScore += 0.13;  // Reduced bonus for strong elemental compatibility
    }
  }
  
  // Add a small method-specific variance to prevent identical scores
  // Use the method name length as a seed for the variance
  const methodNameLength = (method as any)?.name?.length || 10;
  const methodSpecificVariance = (methodNameLength % 7) * 0.02;
  
  // Ensure the final score is between 0.15 and 0.95 to show differentiation
  return Math.min(0.95, Math.max(0.15, (baseScore * multiplier) + bonusScore - methodSpecificVariance));
}

// Helper function to get method elemental profile
function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  return (method as any)?.elementalProperties || (method as any)?.elementalEffect || { 
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
  if ((astroState as any)?.elementalProfile && Object.keys((astroState as any)?.elementalProfile).length > 0) {
    return (astroState as any)?.elementalProfile;
  }
  if ((astroState as any)?.elementalState && Object.keys((astroState as any)?.elementalState).length > 0) {
    // Assuming elementalState has the same structure as ElementalProperties
    return (astroState as any)?.elementalState as ElementalProperties;
  }

  // 2. Fallback: Calculate a simplified profile based only on the zodiac (Sun) sign
  //    This is less accurate but provides a default if the full profile is missing.
  if (astroState.zodiacSign) {
    const sign = (astroState.zodiacSign as any)?.toLowerCase?.();
    return {
      Fire: (sign as any)?.includes?.('aries') || (sign as any)?.includes?.('leo') || (sign as any)?.includes?.('sagittarius') ? 0.8 : 0.2,
      Water: (sign as any)?.includes?.('cancer') || (sign as any)?.includes?.('scorpio') || (sign as any)?.includes?.('pisces') ? 0.8 : 0.2,
      Earth: (sign as any)?.includes?.('taurus') || (sign as any)?.includes?.('virgo') || (sign as any)?.includes?.('capricorn') ? 0.8 : 0.2,
      Air: (sign as any)?.includes?.('gemini') || (sign as any)?.includes?.('libra') || (sign as any)?.includes?.('aquarius') ? 0.8 : 0.2
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
  // Create recommendations with the enhanced score and interface compliance
  const recommendations = Object.entries(allCookingMethodsCombined).map(([name, method]) => {
    // Use our enhanced calculation with multiplier
    const score = calculateMethodScore(method, astroState);
    
    return {
      name,
      score,
      elementalAlignment: (method as any)?.elementalProperties,
      description: (method as any)?.description
    } as unknown as MethodRecommendation;
  })
  .filter(rec => rec.score > 0)
  .sort((a, b) => b.score - a.score);
  
  // Return top recommendations (limit if specified)
  const limit = (options as any)?.limit || 10;
  return recommendations.slice(0, limit);
}

/**
 * Helper to get the element associated with a zodiac sign
 */
function getElementForSign(sign: ZodiacSign): keyof ElementalProperties {
  const fireElements = ['Aries', 'Leo', 'Sagittarius'];
  const earthElements = ['Taurus', 'Virgo', 'Capricorn'];
  const airElements = ['Gemini', 'Libra', 'Aquarius'];
  const waterElements = ['Cancer', 'Scorpio', 'Pisces'];
  
  if ((fireElements as any)?.includes?.(sign)) return 'Fire';
  if ((earthElements as any)?.includes?.(sign)) return 'Earth';
  if ((airElements as any)?.includes?.(sign)) return 'Air';
  if ((waterElements as any)?.includes?.(sign)) return 'Water';
  
  return 'Fire'; // Default fallback
} 
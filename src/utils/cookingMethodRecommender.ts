import { allCookingMethods, cookingMethods as detailedCookingMethods } from '@/data/cooking';
import { culturalCookingMethods, _getCulturalVariations } from '@/utils/culturalMethodsAggregator';
import type { ZodiacSign, ElementalProperties } from '@/types';
import type { CookingMethod as CookingMethodEnum } from '@/types/alchemy';
import { getCurrentSeason } from '@/utils/dateUtils';
import venusData from '@/data/planets/venus';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';
import saturnData from '@/data/planets/saturn';
import uranusData from '@/data/planets/uranus';
import neptuneData from '@/data/planets/neptune';
import plutoData from '@/data/planets/pluto';
import { PlanetaryAspect, _LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { CookingMethod } from '@/types/cooking';
import { _calculateLunarPhase, getLunarPhaseName } from '@/utils/astrologyUtils';

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
      ...(method as unknown),
      elementalEffect: (method as unknown)?.elementalEffect || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      suitable_for: (method as unknown)?.suitable_for || [],
      benefits: (method as unknown)?.benefits || [],
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
        if (!existingVariations.some(v => v.id === (method as unknown)?.id)) {
          methods[method.relatedToMainMethod].variations = [
            ...existingVariations,
            {
              id: (method as unknown)?.id,
              name: method.variationName || (method as unknown)?.name,
              description: (method as unknown)?.description,
              elementalEffect: (method as unknown)?.elementalProperties || {
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
              suitable_for: (method as unknown)?.bestFor || [],
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
    if (!methods[(method as unknown)?.id] && !method.relatedToMainMethod) {
      methods[(method as unknown)?.id] = {
        id: (method as unknown)?.id,
        name: (method as unknown)?.name,
        description: (method as unknown)?.description,
        elementalEffect: (method as unknown)?.elementalProperties || {
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
        suitable_for: (method as unknown)?.bestFor || [],
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
  const methodNameLower = (method as unknown)?.(name as unknown)?.toLowerCase?.() as CookingMethodEnum; // Ensure correct type for lookup

  // 1. Check the detailed data source first
  const detailedMethodData = detailedCookingMethods[methodNameLower];
  if (detailedMethodData && detailedMethodData.thermodynamicProperties) {
    return {
      heat: detailedMethodData.thermodynamicProperties.heat ?? 0.5,
      entropy: detailedMethodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: detailedMethodData.thermodynamicProperties.reactivity ?? 0.5,
      gregsEnergy: (detailedMethodData.thermodynamicProperties as unknown).gregsEnergy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties defined (might be passed dynamically)
  const methodData = method as unknown;
  if (methodData?.thermodynamicProperties) {
    return {
      heat: methodData.thermodynamicProperties.heat ?? 0.5,
      entropy: methodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: methodData.thermodynamicProperties.reactivity ?? 0.5,
      gregsEnergy: (methodData.thermodynamicProperties as unknown).gregsEnergy ?? 0.5,
    };
  }
  
  // 3. Check the explicitly defined mapping constant (COOKING_METHOD_THERMODYNAMICS)
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - ENHANCED with more cooking methods
  if ((methodNameLower as unknown)?.includes?.('grill') || (methodNameLower as unknown)?.includes?.('roast') || 
      (methodNameLower as unknown)?.includes?.('fry') || (methodNameLower as unknown)?.includes?.('sear') || 
      (methodNameLower as unknown)?.includes?.('broil') || (methodNameLower as unknown)?.includes?.('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.6 }; // High heat methods
  } else if ((methodNameLower as unknown)?.includes?.('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.55 }; // Medium-high heat, dry
  } else if ((methodNameLower as unknown)?.includes?.('steam') || (methodNameLower as unknown)?.includes?.('simmer') || 
             (methodNameLower as unknown)?.includes?.('poach') || (methodNameLower as unknown)?.includes?.('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 }; // Medium heat, lower entropy methods
  } else if ((methodNameLower as unknown)?.includes?.('sous vide') || (methodNameLower as unknown)?.includes?.('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.25 }; // Low heat, low reactivity
  } else if ((methodNameLower as unknown)?.includes?.('raw') || (methodNameLower as unknown)?.includes?.('ceviche') || 
             (methodNameLower as unknown)?.includes?.('ferment') || (methodNameLower as unknown)?.includes?.('pickle') || 
             (methodNameLower as unknown)?.includes?.('cure') || (methodNameLower as unknown)?.includes?.('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 }; // No/low heat methods
  } else if ((methodNameLower as unknown)?.includes?.('braise') || (methodNameLower as unknown)?.includes?.('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60, gregsEnergy: 0.5 }; // Moderate heat, high entropy
  } else if ((methodNameLower as unknown)?.includes?.('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.6 }; // High heat/pressure, rapid breakdown
  } else if ((methodNameLower as unknown)?.includes?.('smoke') || (methodNameLower as unknown)?.includes?.('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.65 }; // Moderate heat, high reactivity
  } else if ((methodNameLower as unknown)?.includes?.('confit') || (methodNameLower as unknown)?.includes?.('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.4 }; // Low heat, gradual cooking
  } else if ((methodNameLower as unknown)?.includes?.('dehydrat') || (methodNameLower as unknown)?.includes?.('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 }; // Low heat, preservation
  } else if ((methodNameLower as unknown)?.includes?.('toast') || (methodNameLower as unknown)?.includes?.('brulee')) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8, gregsEnergy: 0.7 }; // High reactivity surface treatments
  }

  // Default values if no match found in any source
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0.5 };
}

// Enhanced base score calculation using Monica constants
function calculateEnhancedThermodynamicScore(method: CookingMethodProfile): number {
  const enhancedProps = getEnhancedMethodThermodynamics(method);
  
  // Calculate base thermodynamic score
  const heatScore = enhancedProps.heat || 0;
  const entropyScore = 1 - (enhancedProps.entropy || 0); // Lower entropy preferred
  const reactivityScore = enhancedProps.reactivity || 0;
  const efficiencyScore = enhancedProps.efficiency || 0.5;

  // Monica constant influence on scoring
  let monicaBonus = 0;
  if (!isNaN(enhancedProps.monicaConstant) && isFinite(enhancedProps.monicaConstant)) {
    // Higher Monica constants indicate better transformation potential
    // Scale to 0-0.15 bonus range for better balance
    monicaBonus = Math.min(0.15, Math.abs(enhancedProps.monicaConstant) / 67);
  }

  // Kalchm stability bonus
  let kalchmBonus = 0;
  if (enhancedProps.kalchm > 0) {
    // Values close to 1 are more stable and get bonus
    kalchmBonus = Math.max(0, 0.05 - Math.abs(enhancedProps.kalchm - 1) * 0.05);
  }

  // Weighted scoring with Monica enhancement
  // Heat (25%), Entropy (20%), Reactivity (20%), Efficiency (15%), Monica (15%), Kalchm (5%)
  const rawScore = (heatScore * 0.25) + (entropyScore * 0.2) + (reactivityScore * 0.2) + 
                   (efficiencyScore * 0.15) + monicaBonus + kalchmBonus;

  return Math.max(0.05, Math.min(1.0, rawScore));
}

// Legacy function for compatibility
function calculateThermodynamicBaseScore(thermodynamics: BasicThermodynamicProperties): number {
  const heatScore = thermodynamics.heat || 0;
  const entropyScore = 1 - (thermodynamics.entropy || 0);
  const reactivityScore = thermodynamics.reactivity || 0;

  const rawScore = (heatScore * 0.4) + (entropyScore * 0.3) + (reactivityScore * 0.3);
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
  if ((normalized1 as unknown)?.includes?.(normalized2) || (normalized2 as unknown)?.includes?.(normalized1)) {
    return true;
  }
  
  // Simple fuzzy matching - check if they share a significant number of characters
  const commonWords = normalized1.split(' ').filter(word => 
    word.length > 3 && (normalized2 as unknown)?.includes?.(word)
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
    if (group.some(item => (normalized1 as unknown)?.includes?.(item)) && 
        group.some(item => (normalized2 as unknown)?.includes?.(item))) {
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
  const methodElementals = (method as unknown)?.elementalProperties || (method as unknown)?.elementalEffect || {};
  const diurnalMatch = methodElementals[diurnalElement] || 0;
  const nocturnalMatch = methodElementals[nocturnalElement] || 0;
  
  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
  
  // If the method has a direct planetary affinity, give bonus points
  const methodData = method as unknown;
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
  const methodElementals = (method as unknown)?.elementalProperties || (method as unknown)?.elementalEffect || {};
  const elementalMatch = methodElementals[relevantElement] || 0;
  
  // Calculate score based on how well the method matches the planetary hour's element
  let elementalScore = elementalMatch;
  
  // If the method has a direct planetary affinity, give bonus points
  const methodHourData = method as unknown;
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
    const lowerSign = (currentZodiac as unknown)?.toLowerCase?.();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    
    if ((earthSigns as unknown)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as unknown)?.EarthVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as unknown).EarthVenus;
    } else if ((airSigns as unknown)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as unknown)?.AirVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as unknown).AirVenus;
    } else if ((waterSigns as unknown)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as unknown)?.WaterVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as unknown).WaterVenus;
    } else if ((fireSigns as unknown)?.includes?.(lowerSign) && (venusData.PlanetSpecific?.CulinaryTemperament as unknown)?.FireVenus) {
      venusTemperament = (venusData.PlanetSpecific.CulinaryTemperament as unknown).FireVenus;
    }
  }
  
  // Get Mars sign-based temperament for current zodiac
  let _marsTemperament = null;
  if (currentZodiac && isMarsActive) {
    const lowerSign = (currentZodiac as unknown)?.toLowerCase?.();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    if ((fireSigns as unknown)?.includes?.(lowerSign) && (marsData.PlanetSpecific?.CulinaryTemperament as unknown)?.FireMars) {
      _marsTemperament = (marsData.PlanetSpecific.CulinaryTemperament as unknown).FireMars;
    } else if ((waterSigns as unknown)?.includes?.(lowerSign) && (marsData.PlanetSpecific?.CulinaryTemperament as unknown)?.WaterMars) {
      _marsTemperament = (marsData.PlanetSpecific.CulinaryTemperament as unknown).WaterMars;
    }
  }
  
  // Get Mercury sign-based temperament for current zodiac
  let mercuryTemperament = null;
  if (currentZodiac && isMercuryActive) {
    const lowerSign = (currentZodiac as unknown)?.toLowerCase?.();
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    
    if ((airSigns as unknown)?.includes?.(lowerSign) && (mercuryData.PlanetSpecific?.CulinaryTemperament as unknown)?.AirMercury) {
      mercuryTemperament = (mercuryData.PlanetSpecific.CulinaryTemperament as unknown).AirMercury;
    } else if ((earthSigns as unknown)?.includes?.(lowerSign) && (mercuryData.PlanetSpecific?.CulinaryTemperament as unknown)?.EarthMercury) {
      mercuryTemperament = (mercuryData.PlanetSpecific.CulinaryTemperament as unknown).EarthMercury;
    }
  }
  
  // Get Jupiter sign-based temperament for current zodiac
  let jupiterTemperament = null;
  if (currentZodiac && isJupiterActive) {
    const lowerSign = (currentZodiac as unknown)?.toLowerCase?.();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if ((fireSigns as unknown)?.includes?.(lowerSign) && (jupiterData.PlanetSpecific?.CulinaryTemperament as unknown)?.FireJupiter) {
      jupiterTemperament = (jupiterData.PlanetSpecific.CulinaryTemperament as unknown).FireJupiter;
    } else if ((airSigns as unknown)?.includes?.(lowerSign) && (jupiterData.PlanetSpecific?.CulinaryTemperament as unknown)?.AirJupiter) {
      jupiterTemperament = (jupiterData.PlanetSpecific.CulinaryTemperament as unknown).AirJupiter;
    }
  }
  
  // Get Saturn sign-based temperament for current zodiac
  let _saturnTemperament = null;
  if (currentZodiac && isSaturnActive) {
    const lowerSign = (currentZodiac as unknown)?.toLowerCase?.();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if ((earthSigns as unknown)?.includes?.(lowerSign) && (saturnData.PlanetSpecific?.CulinaryTemperament as unknown)?.EarthSaturn) {
      _saturnTemperament = (saturnData.PlanetSpecific.CulinaryTemperament as unknown).EarthSaturn;
    } else if ((airSigns as unknown)?.includes?.(lowerSign) && (saturnData.PlanetSpecific?.CulinaryTemperament as unknown)?.AirSaturn) {
      _saturnTemperament = (saturnData.PlanetSpecific.CulinaryTemperament as unknown).AirSaturn;
    }
  }
  
  // Get the current lunar phase for additional scoring
  const lunarPhaseValue = await calculateLunarPhase(new Date());
  const _lunarPhase = getLunarPhaseName(lunarPhaseValue);

  // Track recommendations to prevent adding duplicates
  const recommendationsMap: Record<string, boolean> = {};
  const recommendations: unknown[] = [];
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Skip if we already have a similar method
    const methodNameNorm = normalizeMethodName((method as unknown)?.name);
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
    if ((method as unknown)?.elementalEffect || (method as unknown)?.elementalProperties) {
      const elementalProps = (method as unknown)?.elementalEffect || (method as unknown)?.elementalProperties || {};
      
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
          // Transform CookingMethodData to CookingMethodProfile interface
          const methodProfile: CookingMethodProfile = {
            name: method.name,
            elementalProperties: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            elementalEffect: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            astrologicalInfluences: method.astrologicalInfluences || {}
          } as unknown as CookingMethodProfile;
          
          planetaryDayScore = calculatePlanetaryDayInfluence(methodProfile, planetaryDay);
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
          // Transform CookingMethodData to CookingMethodProfile interface
          const methodProfileHour: CookingMethodProfile = {
            name: method.name,
            elementalProperties: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            elementalEffect: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            astrologicalInfluences: method.astrologicalInfluences || {}
          } as unknown as CookingMethodProfile;
          
          planetaryHourScore = calculatePlanetaryHourInfluence(methodProfileHour, planetaryHour, daytime);
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
    if ((method as unknown)?.preferences?.seasonalPreference && (method as unknown)?.preferences?.seasonalPreference?.includes?.(season)) {
      seasonalScore += 0.15;
    } else {
      // Enhanced default seasonal preferences
      if (season === 'winter') {
        if ((method as unknown)?.(name as unknown)?.toLowerCase?.().includes('brais') || 
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('roast') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('stew') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('bake')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'summer') {
        if ((method as unknown)?.(name as unknown)?.toLowerCase?.().includes('grill') || 
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('raw') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('ceviche') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('cold')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'spring') {
        if ((method as unknown)?.(name as unknown)?.toLowerCase?.().includes('steam') || 
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('stir') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('blanch') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('quick')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'fall' || season === 'autumn') {
        if ((method as unknown)?.(name as unknown)?.toLowerCase?.().includes('smoke') || 
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('brais') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('slow') ||
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('roast')) {
          seasonalScore += 0.12;
        }
      }
    }
    
    // Tools availability (10% of score)
    if (availableTools && method.toolsRequired) {
      const requiredTools = method.toolsRequired;
      const availableRequiredTools = requiredTools.filter(tool => 
        availableTools.some(available => (available as unknown)?.toLowerCase?.().includes((tool as unknown)?.toLowerCase?.()))
      );
      
      toolScore = (availableRequiredTools.length / requiredTools.length) * 0.1;
    } else {
      // Enhanced assumptions about basic tools availability
      const methodName = (method as unknown)?.(name as unknown)?.toLowerCase?.();
      if ((methodName as unknown)?.includes?.('sous_vide') || (methodName as unknown)?.includes?.('sous vide')) {
        toolScore = 0.01; // Specialized equipment
      } else if ((methodName as unknown)?.includes?.('pressure') || (methodName as unknown)?.includes?.('instant pot')) {
        toolScore = 0.03; // Somewhat specialized
      } else if ((methodName as unknown)?.includes?.('smoker') || (methodName as unknown)?.includes?.('smoke') || 
                 (methodName as unknown)?.includes?.('molecular') || (methodName as unknown)?.includes?.('spherification') ||
                 (methodName as unknown)?.includes?.('thermal immersion') || (methodName as unknown)?.includes?.('liquid nitrogen')) {
        toolScore = 0.02; // Quite specialized
      } else if ((methodName as unknown)?.includes?.('grill') && !(methodName as unknown)?.includes?.('stove top')) {
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
          (suitable as unknown)?.toLowerCase?.().includes((pref as unknown)?.toLowerCase?.())
        )) {
          matchStrength += 1.0;
          continue;
        }
        
        // Special case mappings
        if ((pref as unknown)?.toLowerCase?.() === 'vegetarian' && 
            (method as unknown)?.(name as unknown)?.toLowerCase?.().includes('veget')) {
          matchStrength += 0.8;
        } else if ((pref as unknown)?.toLowerCase?.() === 'vegan' && 
                  !(method as unknown)?.(name as unknown)?.toLowerCase?.().includes('meat') &&
                  !(method as unknown)?.(name as unknown)?.toLowerCase?.().includes('fish')) {
          matchStrength += 0.6;
        } else if ((pref as unknown)?.toLowerCase?.().includes('gluten') && 
                  !(method as unknown)?.(name as unknown)?.toLowerCase?.().includes('bread') &&
                  !(method as unknown)?.(name as unknown)?.toLowerCase?.().includes('pasta') &&
                  !(method as unknown)?.(name as unknown)?.toLowerCase?.().includes('flour')) {
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
      const methodNameLower = (method as unknown)?.(name as unknown)?.toLowerCase?.();
      
      // New moon favors starting new methods, preparation methods
      if (lunarPhase === 'new moon') {
        if ((methodNameLower as unknown)?.includes?.('prep') || 
            (methodNameLower as unknown)?.includes?.('marinate') || 
            (methodNameLower as unknown)?.includes?.('ferment') || 
            (methodNameLower as unknown)?.includes?.('cure')) {
          lunarScore += 0.03;
        }
      }
      // Full moon favors completion methods, preservation methods
      else if (lunarPhase === 'full moon') {
        if ((methodNameLower as unknown)?.includes?.('preserve') || 
            (methodNameLower as unknown)?.includes?.('smoke') || 
            (methodNameLower as unknown)?.includes?.('dry') || 
            (methodNameLower as unknown)?.includes?.('can') ||
            (methodNameLower as unknown)?.includes?.('finish')) {
          lunarScore += 0.03;
        }
      }
      // Waxing moon favors building methods, long-cooking methods
      else if (lunarPhase === 'waxing crescent' || lunarPhase === 'waxing gibbous') {
        if ((methodNameLower as unknown)?.includes?.('slow') || 
            (methodNameLower as unknown)?.includes?.('brais') || 
            (methodNameLower as unknown)?.includes?.('roast') || 
            (methodNameLower as unknown)?.includes?.('stew')) {
          lunarScore += 0.03;
        }
      }
      // Waning moon favors reduction methods, quick methods
      else if (lunarPhase === 'waning gibbous' || lunarPhase === 'waning crescent') {
        if ((methodNameLower as unknown)?.includes?.('reduce') || 
            (methodNameLower as unknown)?.includes?.('quick') || 
            (methodNameLower as unknown)?.includes?.('flash') || 
            (methodNameLower as unknown)?.includes?.('blanch')) {
          lunarScore += 0.03;
        }
      }
    }
    
    // Venus influence scoring
    if (isVenusActive) {
      // Check if method aligns with Venus culinary techniques
      if (venusData.PlanetSpecific?.CulinaryTechniques) {
        const methodNameLower = (method as unknown)?.(name as unknown)?.toLowerCase?.();
        const methodDescLower = (method as unknown)?.description?.toLowerCase?.();
        
        // Check for aesthetic techniques
        if (((methodNameLower as unknown)?.includes?.('plate') || (methodNameLower as unknown)?.includes?.('present') ||
           (methodDescLower as unknown)?.includes?.('presentation') || (methodDescLower as unknown)?.includes?.('aesthetic')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation'] * 1.5;
        }
        
        // Check for aroma techniques
        if (((methodNameLower as unknown)?.includes?.('aroma') || (methodNameLower as unknown)?.includes?.('infuse') ||
           (methodDescLower as unknown)?.includes?.('fragrant') || (methodDescLower as unknown)?.includes?.('scent')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion'] * 1.5;
        }
        
        // Check for flavor balancing techniques
        if (((methodNameLower as unknown)?.includes?.('balance') || (methodNameLower as unknown)?.includes?.('harmonize') ||
           (methodDescLower as unknown)?.includes?.('balanced') || (methodDescLower as unknown)?.includes?.('harmony')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing'] * 1.8;
        }
        
        // Check for textural contrast techniques
        if (((methodNameLower as unknown)?.includes?.('texture') || (methodNameLower as unknown)?.includes?.('contrast') ||
           (methodDescLower as unknown)?.includes?.('textural') || (methodDescLower as unknown)?.includes?.('crispy') ||
           (methodDescLower as unknown)?.includes?.('crunchy')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast'] * 1.6;
        }
        
        // Check for sensory harmony techniques
        if (((methodNameLower as unknown)?.includes?.('sensory') || (methodNameLower as unknown)?.includes?.('harmony') ||
           (methodDescLower as unknown)?.includes?.('sensory') || (methodDescLower as unknown)?.includes?.('experience')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony'] * 1.7;
        }
      }
      
      // Add score for culinary temperament alignment
      if (venusTemperament && venusTemperament.FoodFocus) {
        const foodFocus = (venusTemperament.FoodFocus as unknown)?.toLowerCase?.();
        const methodName = (method as unknown)?.(name as unknown)?.toLowerCase?.();
        const methodDesc = (method as unknown)?.description?.toLowerCase?.();
        
        // Check keyword matches between Venus temperament food focus and method description
        const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
        const matchCount = keywords.filter(keyword => 
          (methodName as unknown)?.includes?.(keyword) || (methodDesc as unknown)?.includes?.(keyword)
        ).length;
        
        venusScore += matchCount * 0.8;
        
        // Check elements alignment with Venus temperament
        if (venusTemperament.Elements && (method as unknown)?.elementalEffect) {
          for (const element in venusTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as unknown)?.elementalEffect[elementProperty]) {
              venusScore += venusTemperament.Elements[element] * (method as unknown)?.elementalEffect[elementProperty] * 1.2;
            }
          }
        }
      }
      
      // Add score for current zodiac transit data
      if (venusZodiacTransit) {
        // Check food focus alignment
        if (venusZodiacTransit.FoodFocus) {
          const transitFocus = (venusZodiacTransit.FoodFocus as unknown)?.toLowerCase?.();
          const methodDesc = (method as unknown)?.description?.toLowerCase?.();
          const methodName = (method as unknown)?.name?.toLowerCase?.();
          
          // Check for keyword matches
          const focusKeywords = transitFocus.split(/[\s,;]+/).filter(k => k.length > 3);
          const focusMatchCount = focusKeywords.filter(keyword => 
            (methodName as unknown)?.includes?.(keyword) || (methodDesc as unknown)?.includes?.(keyword)
          ).length;
          
          venusScore += focusMatchCount * 1.0;
        }
        
        // Check elements alignment with transit
        if (venusZodiacTransit.Elements && (method as unknown)?.elementalEffect) {
          for (const element in venusZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as unknown)?.elementalEffect[elementProperty]) {
              venusScore += venusZodiacTransit.Elements[element] * (method as unknown)?.elementalEffect[elementProperty] * 0.8;
            }
          }
        }
      }
      
      // Apply Venus retrograde modifications
      if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
        // Check if cooking method aligns with retrograde focus
        // Extract retrograde data with safe property access
        const retrogradeData = venusData.PlanetSpecific.Retrograde as unknown;
        const foodFocus = retrogradeData?.FoodFocus;
        
        if (foodFocus) {
          const retroFocus = foodFocus?.toLowerCase?.();
          const methodName = (method as unknown)?.name?.toLowerCase?.();
          const methodDesc = (method as unknown)?.description?.toLowerCase?.();
          
          if ((retroFocus as unknown)?.includes?.('traditional') && 
              ((methodName as unknown)?.includes?.('traditional') || (methodDesc as unknown)?.includes?.('classic') || 
               method.culturalOrigin?.includes('traditional'))) {
            venusScore *= 1.5; // Boost traditional methods during retrograde
          } else if ((retroFocus as unknown)?.includes?.('slow') && 
                    ((methodName as unknown)?.includes?.('slow') || (methodDesc as unknown)?.includes?.('simmer') || 
                     method.duration?.min > 60)) {
            venusScore *= 1.4; // Boost slow cooking methods
          } else if ((retroFocus as unknown)?.includes?.('revisit') && method.culturalOrigin?.includes('ancient')) {
            venusScore *= 1.3; // Boost ancient methods
          } else {
            venusScore *= 0.9; // Slightly reduce other Venus influences
          }
        }
        
        // Apply retrograde elements influence
        const elements = retrogradeData?.Elements;
        if (elements && (method as unknown)?.elementalEffect) {
          for (const element in elements) {
            const elementProperty = element as keyof ElementalProperties;
            if ((method as unknown)?.elementalEffect[elementProperty]) {
              venusScore *= (1 + (elements[element] * 
                               (method as unknown)?.elementalEffect[elementProperty] * 0.15));
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
        if ((method as unknown)?.name?.toLowerCase?.().includes(methodName) || 
            (method as unknown)?.description?.toLowerCase?.().includes(methodName)) {
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
    const methodData = method as unknown;
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
      method: (method as unknown)?.id,
      score: Math.max(0, score), // Ensure score isn't negative
      description: (method as unknown)?.description,
      benefits: method.benefits,
      lunarAffinity: calculateLunarMethodAffinity(method as unknown, lunarPhase),
      elementalAffinity: (method as unknown)?.elementalEffect?.[signElement] || 0,
      planetaryAffinity: planetaryAffinity,
      scoreDetails: scoreDetailsForUI // Include detailed scoring for UI display
    } as unknown);
    
    // Mark this method as processed to avoid duplicates
    recommendationsMap[methodNameNorm] = true;
  });

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

function calculateLunarMethodAffinity(method: CookingMethod, phase: LunarPhase): number {
  let affinity = 0;

  // Extract method data with safe property access
  const methodData = method as unknown;
  const properties = methodData?.properties;
  const element = methodData?.element;

  switch (phase) {
    case 'new moon':
      // New Moon favors gentle, water-based methods
      if (properties?.includes('gentle')) affinity += 0.5;
      if (element === 'water') affinity += 0.5;
      break;
    case 'waxing crescent':
      // Waxing Crescent favors methods that build flavor
      if (properties?.includes('builds flavor')) affinity += 0.7;
      break;
    case 'first quarter':
      // First Quarter favors methods that transform 
      if (properties?.includes('transformative')) affinity += 0.7;
      break;
    case 'waxing gibbous':
      // Waxing Gibbous favors methods that intensify
      if (properties?.includes('intensifies flavor')) affinity += 0.8;
      break;
    case 'full moon':
      // Full Moon favors methods that fully express flavor
      if (properties?.includes('maximizes flavor')) affinity += 1.0;
      if (element === 'fire') affinity += 0.5;
      break;
    case 'waning gibbous':
      // Waning Gibbous favors methods that preserve
      if (properties?.includes('preserves nutrients')) affinity += 0.8;
      break;
    case 'last quarter':
      // Last Quarter favors methods that reduce and concentrate
      if (properties?.includes('concentrates')) affinity += 0.7;
      break;
    case 'waning crescent':
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
              if ((aspect.planets as unknown)?.includes?.('Venus')) {
        // Venus aspects boost methods that enhance aesthetic appeal or harmony
        // Extract method data with safe property access
        const aspectMethodData = method as unknown;
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
  // Use enhanced thermodynamic scoring with Monica constants
  const enhancedScore = calculateEnhancedThermodynamicScore(method);
  const enhancedProps = getEnhancedMethodThermodynamics(method);
  
  // Apply a balanced multiplier for score enhancement
  const multiplier = 1.5;
  
  // Apply additional bonuses for specific astrological alignments
  let bonusScore = 0;
  
  // Add zodiac alignment bonus
  const methodAstroData = method as unknown;
  if (methodAstroData?.astrologicalInfluences?.favorableZodiac?.includes(astroState.zodiacSign)) {
    bonusScore += 0.12;
  }
  
  // Add lunar phase bonus
  if (astroState.lunarPhase && methodAstroData?.astrologicalInfluences?.lunarPhaseEffect?.[astroState.lunarPhase] > 0) {
    bonusScore += 0.10;
  }
  
  // Apply special multiplier for methods that are especially suited to the current elemental state
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  
  if (methodElemental && astroElemental) {
    const elementalCompatibility = calculateElementalCompatibility(methodElemental, astroElemental);
    if (elementalCompatibility > 0.7) {
      bonusScore += 0.11;
    }
  }
  
  // Monica constant bonus for transformation potential
  let monicaTransformationBonus = 0;
  if (!isNaN(enhancedProps.monicaConstant) && isFinite(enhancedProps.monicaConstant)) {
    // Methods with higher Monica constants get bonus for transformation effectiveness
    monicaTransformationBonus = Math.min(0.15, Math.abs(enhancedProps.monicaConstant) / 100);
  }
  
  // Kalchm stability bonus
  let kalchmStabilityBonus = 0;
  if (enhancedProps.kalchm > 0) {
    // Values closer to optimal Kalchm range (0.8-1.2) get bonus
    const kalchmOptimalRange = Math.max(0, 1 - Math.abs(enhancedProps.kalchm - 1) / 2);
    kalchmStabilityBonus = kalchmOptimalRange * 0.08;
  }
  
  // Method classification bonus
  let classificationBonus = 0;
  switch (enhancedProps.monicaClassification) {
    case 'Highly Transformative':
      classificationBonus = 0.12;
      break;
    case 'Transformative':
      classificationBonus = 0.08;
      break;
    case 'Moderately Active':
      classificationBonus = 0.05;
      break;
    case 'Stable':
    case 'Stable (NaN)':
      classificationBonus = 0.03;
      break;
  }
  
  // Add a small method-specific variance to prevent identical scores
  const methodNameLength = (method as unknown)?.name?.length || 10;
  const methodSpecificVariance = (methodNameLength % 7) * 0.01;
  
  // Calculate final score with all enhancements
  const finalScore = (enhancedScore * multiplier) + bonusScore + monicaTransformationBonus + 
                     kalchmStabilityBonus + classificationBonus - methodSpecificVariance;
  
  // Ensure the final score is between 0.20 and 0.98 to show clear differentiation
  return Math.min(0.98, Math.max(0.20, finalScore));
}

// Helper function to get method elemental profile
function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  return (method as unknown)?.elementalProperties || (method as unknown)?.elementalEffect || { 
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
  if ((astroState as unknown)?.elementalProfile && Object.keys((astroState as unknown)?.elementalProfile).length > 0) {
    return (astroState as unknown)?.elementalProfile;
  }
  if ((astroState as unknown)?.elementalState && Object.keys((astroState as unknown)?.elementalState).length > 0) {
    // Assuming elementalState has the same structure as ElementalProperties
    return (astroState as unknown)?.elementalState as ElementalProperties;
  }

  // 2. Fallback: Calculate a simplified profile based only on the zodiac (Sun) sign
  //    This is less accurate but provides a default if the full profile is missing.
  if (astroState.zodiacSign) {
    const sign = (astroState.zodiacSign as unknown)?.toLowerCase?.();
    return {
      Fire: (sign as unknown)?.includes?.('aries') || (sign as unknown)?.includes?.('leo') || (sign as unknown)?.includes?.('sagittarius') ? 0.8 : 0.2,
      Water: (sign as unknown)?.includes?.('cancer') || (sign as unknown)?.includes?.('scorpio') || (sign as unknown)?.includes?.('pisces') ? 0.8 : 0.2,
      Earth: (sign as unknown)?.includes?.('taurus') || (sign as unknown)?.includes?.('virgo') || (sign as unknown)?.includes?.('capricorn') ? 0.8 : 0.2,
      Air: (sign as unknown)?.includes?.('gemini') || (sign as unknown)?.includes?.('libra') || (sign as unknown)?.includes?.('aquarius') ? 0.8 : 0.2
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
    // Transform CookingMethodData to CookingMethodProfile interface
    const methodProfileScore: CookingMethodProfile = {
      name: method.name,
      elementalProperties: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      elementalEffect: method.elementalEffect || method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      astrologicalInfluences: method.astrologicalInfluences || {}
    } as unknown as CookingMethodProfile;
    
    // Use our enhanced calculation with multiplier
    const score = calculateMethodScore(methodProfileScore, astroState);
    
    return {
      name,
      score,
      elementalAlignment: (method as unknown)?.elementalProperties,
      description: (method as unknown)?.description
    } as unknown as MethodRecommendation;
  })
  .filter(rec => rec.score > 0)
  .sort((a, b) => b.score - a.score);
  
  // Return top recommendations (limit if specified)
  const limit = (options as unknown)?.limit || 10;
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
  
  if ((fireElements as unknown)?.includes?.(sign)) return 'Fire';
  if ((earthElements as unknown)?.includes?.(sign)) return 'Earth';
  if ((airElements as unknown)?.includes?.(sign)) return 'Air';
  if ((waterElements as unknown)?.includes?.(sign)) return 'Water';
  
  return 'Fire'; // Default fallback
}

// Enhanced Monica constant calculation functions based on user's Kalchm formulas
function calculateHeat(
  spirit: number, fire: number, substance: number, essence: number,
  matter: number, water: number, air: number, earth: number
): number {
  const numerator = Math.pow(spirit, 2) + Math.pow(fire, 2);
  const denominator = Math.pow(substance + essence + matter + water + air + earth, 2);
  return numerator / denominator;
}

function calculateEntropy(
  spirit: number, substance: number, fire: number, air: number,
  essence: number, matter: number, earth: number, water: number
): number {
  const numerator = Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(fire, 2) + Math.pow(air, 2);
  const denominator = Math.pow(essence + matter + earth + water, 2);
  return numerator / denominator;
}

function calculateReactivity(
  spirit: number, substance: number, essence: number, fire: number,
  air: number, water: number, matter: number, earth: number
): number {
  const numerator = Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(essence, 2)
    + Math.pow(fire, 2) + Math.pow(air, 2) + Math.pow(water, 2);
  const denominator = Math.pow(matter + earth, 2);
  return numerator / denominator;
}

function calculateGregsEnergy(
  heat: number, entropy: number, reactivity: number
): number {
  return heat - (entropy * reactivity);
}

function calculateKAlchm(
  spirit: number, essence: number, matter: number, substance: number
): number {
  // Avoid zero values that would cause infinite/NaN results
  const safeSpirit = Math.max(0.001, spirit);
  const safeEssence = Math.max(0.001, essence);
  const safeMatter = Math.max(0.001, matter);
  const safeSubstance = Math.max(0.001, substance);
  
  return (Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence)) /
         (Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance));
}

function calculateMonicaConstant(
  gregsEnergy: number, reactivity: number, K_alchm: number
): number {
  const ln_K = Math.log(K_alchm);
  if (K_alchm > 0 && ln_K !== 0 && reactivity !== 0) {
    return -gregsEnergy / (reactivity * ln_K);
  } else {
    return 0; // Return 0 instead of NaN for stable methods
  }
}

/**
 * Enhanced thermodynamic properties calculation with Monica constants
 */
interface EnhancedThermodynamicProperties extends BasicThermodynamicProperties {
  kalchm: number;
  monicaConstant: number;
  monicaClassification: string;
  efficiency: number;
}

function getEnhancedMethodThermodynamics(method: CookingMethodProfile): EnhancedThermodynamicProperties {
  const methodNameLower = (method as unknown)?.(name as unknown)?.toLowerCase?.() as CookingMethodEnum;

  // Get basic thermodynamic properties
  const basicProps = getMethodThermodynamics(method);
  
  // Get alchemical properties from the method data
  const methodData = method as unknown;
  const alchemicalProps = methodData?.alchemicalProperties || {
    Spirit: 0.5,
    Essence: 0.5,
    Matter: 0.5,
    Substance: 0.5
  };
  
  // Get elemental properties
  const elementalProps = methodData?.elementalEffect || methodData?.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };

  // Calculate enhanced thermodynamics using user's formulas
  const enhancedHeat = calculateHeat(
    alchemicalProps.Spirit, elementalProps.Fire, alchemicalProps.Substance,
    alchemicalProps.Essence, alchemicalProps.Matter, elementalProps.Water,
    elementalProps.Air, elementalProps.Earth
  );

  const enhancedEntropy = calculateEntropy(
    alchemicalProps.Spirit, alchemicalProps.Substance, elementalProps.Fire,
    elementalProps.Air, alchemicalProps.Essence, alchemicalProps.Matter,
    elementalProps.Earth, elementalProps.Water
  );

  const enhancedReactivity = calculateReactivity(
    alchemicalProps.Spirit, alchemicalProps.Substance, alchemicalProps.Essence,
    elementalProps.Fire, elementalProps.Air, elementalProps.Water,
    alchemicalProps.Matter, elementalProps.Earth
  );

  const enhancedGregsEnergy = calculateGregsEnergy(enhancedHeat, enhancedEntropy, enhancedReactivity);
  
  const kalchm = calculateKAlchm(
    alchemicalProps.Spirit, alchemicalProps.Essence,
    alchemicalProps.Matter, alchemicalProps.Substance
  );

  const monicaConstant = calculateMonicaConstant(enhancedGregsEnergy, enhancedReactivity, kalchm);

  // Determine Monica classification
  let monicaClassification = 'Stable';
  if (isNaN(monicaConstant) || !isFinite(monicaConstant)) {
    monicaClassification = 'Stable (NaN)';
  } else if (Math.abs(monicaConstant) > 10) {
    monicaClassification = 'Highly Transformative';
  } else if (Math.abs(monicaConstant) > 5) {
    monicaClassification = 'Transformative';
  } else if (Math.abs(monicaConstant) > 1) {
    monicaClassification = 'Moderately Active';
  }

  // Calculate cooking efficiency based on Monica constant
  let efficiency = 0.5; // Base efficiency
  if (!isNaN(monicaConstant) && isFinite(monicaConstant)) {
    // Higher absolute Monica values indicate more efficient transformation
    efficiency = Math.min(1.0, 0.3 + (Math.abs(monicaConstant) / 20));
  }

  return {
    heat: enhancedHeat,
    entropy: enhancedEntropy,
    reactivity: enhancedReactivity,
    gregsEnergy: enhancedGregsEnergy,
    kalchm,
    monicaConstant,
    monicaClassification,
    efficiency
  };
} 
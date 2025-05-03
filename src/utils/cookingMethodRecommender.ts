import { allCookingMethods, cookingMethods as detailedCookingMethods } from '@/data/cooking';
import { culturalCookingMethods, _getCulturalVariations } from '@/utils/culturalMethodsAggregator';
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
import { _calculateLunarSuitability } from '@/utils/lunarUtils';
import { PlanetaryAspect, LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { calculateLunarPhase } from '@/utils/astrologyUtils';

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
  seasonalPreference?: string[];
  score?: number;
  variations?: CookingMethodData[]; // Add variations property to store related cultural methods
  relatedToMainMethod?: string; // Track if this is a variation of another method
}

// Type for the dictionary of methods
type CookingMethodDictionary = Record<string, CookingMethodData>;

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...Object.entries(allCookingMethods).reduce((acc: CookingMethodDictionary, [id, method]) => {
    acc[id] = {
      id,
      ...method,
      elementalEffect: method.elementalEffect || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      suitable_for: method.suitable_for || [],
      benefits: method.benefits || [],
      variations: [] // Initialize empty variations array
    };
    return acc;
  }, {}),
  
  // Add all cultural methods, making sure they don't override any existing methods
  // and properly organizing them into variations if they're related to main methods
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    // Check if this method is a variation of a main method
    if (method.relatedToMainMethod) {
      // If the main method exists, add this as a variation
      if (methods[method.relatedToMainMethod]) {
        // Add to variations if it doesn't exist yet
        const existingVariations = methods[method.relatedToMainMethod].variations || [];
        if (!existingVariations.some(v => v.id === method.id)) {
          methods[method.relatedToMainMethod].variations = [
            ...existingVariations,
            {
              id: method.id,
              name: method.variationName || method.name,
              description: method.description,
              elementalEffect: method.elementalProperties || {
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
              },
              toolsRequired: method.toolsRequired || [],
              bestFor: method.bestFor || [],
              culturalOrigin: method.culturalOrigin,
              astrologicalInfluences: method.astrologicalInfluences,
              duration: { min: 10, max: 30 },
              suitable_for: method.bestFor || [],
              benefits: [],
              relatedToMainMethod: method.relatedToMainMethod
            }
          ];
        }
        // Don't add as a standalone method
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[method.id] && !method.relatedToMainMethod) {
      methods[method.id] = {
        id: method.id,
        name: method.name,
        description: method.description,
        elementalEffect: method.elementalProperties || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        toolsRequired: method.toolsRequired || [],
        bestFor: method.bestFor || [],
        culturalOrigin: method.culturalOrigin,
        astrologicalInfluences: {
          favorableZodiac: method.astrologicalInfluences?.favorableZodiac?.map(sign => sign as ZodiacSign) || [],
          unfavorableZodiac: method.astrologicalInfluences?.unfavorableZodiac?.map(sign => sign as ZodiacSign) || [],
          dominantPlanets: method.astrologicalInfluences?.dominantPlanets || []
        },
        duration: { min: 10, max: 30 },
        suitable_for: method.bestFor || [],
        benefits: [],
        variations: [] // Initialize empty variations array
      };
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
  const methodNameLower = method.name.toLowerCase() as CookingMethodEnum; // Ensure correct type for lookup

  // 1. Check the detailed data source first
  const detailedMethodData = detailedCookingMethods[methodNameLower];
  if (detailedMethodData && detailedMethodData.thermodynamicProperties) {
    return {
      heat: detailedMethodData.thermodynamicProperties.heat ?? 0.5,
      entropy: detailedMethodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: detailedMethodData.thermodynamicProperties.reactivity ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties defined (might be passed dynamically)
  if (method.thermodynamicProperties) {
    return {
      heat: method.thermodynamicProperties.heat ?? 0.5,
      entropy: method.thermodynamicProperties.entropy ?? 0.5,
      reactivity: method.thermodynamicProperties.reactivity ?? 0.5,
    };
  }
  
  // 3. Check the explicitly defined mapping constant (COOKING_METHOD_THERMODYNAMICS)
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - ENHANCED with more cooking methods
  if (methodNameLower.includes('grill') || methodNameLower.includes('roast') || 
      methodNameLower.includes('fry') || methodNameLower.includes('sear') || 
      methodNameLower.includes('broil') || methodNameLower.includes('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7 }; // High heat methods
  } else if (methodNameLower.includes('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6 }; // Medium-high heat, dry
  } else if (methodNameLower.includes('steam') || methodNameLower.includes('simmer') || 
             methodNameLower.includes('poach') || methodNameLower.includes('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5 }; // Medium heat, lower entropy methods
  } else if (methodNameLower.includes('sous vide') || methodNameLower.includes('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2 }; // Low heat, low reactivity
  } else if (methodNameLower.includes('raw') || methodNameLower.includes('ceviche') || 
             methodNameLower.includes('ferment') || methodNameLower.includes('pickle') || 
             methodNameLower.includes('cure') || methodNameLower.includes('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4 }; // No/low heat methods
  } else if (methodNameLower.includes('braise') || methodNameLower.includes('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60 }; // Moderate heat, high entropy
  } else if (methodNameLower.includes('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65 }; // High heat/pressure, rapid breakdown
  } else if (methodNameLower.includes('smoke') || methodNameLower.includes('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75 }; // Moderate heat, high reactivity
  } else if (methodNameLower.includes('confit') || methodNameLower.includes('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45 }; // Low heat, gradual cooking
  } else if (methodNameLower.includes('dehydrat') || methodNameLower.includes('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3 }; // Low heat, preservation
  } else if (methodNameLower.includes('toast') || methodNameLower.includes('brulee')) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8 }; // High reactivity surface treatments
  }

  // Default values if no match found in any source
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5 };
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

// Improved scoring algorithm for cooking method recommendations
export function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: ZodiacSign,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  dietaryPreferences?: string[],
  availableTools?: string[]
) {
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
    
    if (earthSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.EarthVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.EarthVenus;
    } else if (airSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.AirVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.AirVenus;
    } else if (waterSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.WaterVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.WaterVenus;
    } else if (fireSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.FireVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.FireVenus;
    }
  }
  
  // Get Mars sign-based temperament for current zodiac
  let _marsTemperament = null;
  if (currentZodiac && isMarsActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    if (fireSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.FireMars) {
      _marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.FireMars;
    } else if (waterSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars) {
      _marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.WaterMars;
    }
  }
  
  // Get Mercury sign-based temperament for current zodiac
  let mercuryTemperament = null;
  if (currentZodiac && isMercuryActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    
    if (airSigns.includes(lowerSign) && mercuryData.PlanetSpecific?.CulinaryTemperament?.AirMercury) {
      mercuryTemperament = mercuryData.PlanetSpecific.CulinaryTemperament.AirMercury;
    } else if (earthSigns.includes(lowerSign) && mercuryData.PlanetSpecific?.CulinaryTemperament?.EarthMercury) {
      mercuryTemperament = mercuryData.PlanetSpecific.CulinaryTemperament.EarthMercury;
    }
  }
  
  // Get Jupiter sign-based temperament for current zodiac
  let jupiterTemperament = null;
  if (currentZodiac && isJupiterActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if (fireSigns.includes(lowerSign) && jupiterData.PlanetSpecific?.CulinaryTemperament?.FireJupiter) {
      jupiterTemperament = jupiterData.PlanetSpecific.CulinaryTemperament.FireJupiter;
    } else if (airSigns.includes(lowerSign) && jupiterData.PlanetSpecific?.CulinaryTemperament?.AirJupiter) {
      jupiterTemperament = jupiterData.PlanetSpecific.CulinaryTemperament.AirJupiter;
    }
  }
  
  // Get Saturn sign-based temperament for current zodiac
  let _saturnTemperament = null;
  if (currentZodiac && isSaturnActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if (earthSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.EarthSaturn) {
      _saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.EarthSaturn;
    } else if (airSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.AirSaturn) {
      _saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.AirSaturn;
    }
  }
  
  // Get the current lunar phase for additional scoring
  const lunarPhase = calculateLunarPhase(new Date());

  // Track recommendations to prevent adding duplicates
  const recommendationsMap: Record<string, boolean> = {};
  const recommendations: any[] = [];
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Skip if we already have a similar method
    const methodNameNorm = normalizeMethodName(method.name);
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
    if (method.elementalEffect || method.elementalProperties) {
      const elementalProps = method.elementalEffect || method.elementalProperties || {};
      
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
      
      // Planetary compatibility - enhanced with strength calculation
      if (planets && planets.length > 0) {
        // Count direct matches
        const matchCount = planets.filter(planet => {
          // Strip off retrograde marker for matching
          const basePlanet = planet.replace(/-R$/, '');
          return method.astrologicalInfluences?.dominantPlanets?.includes(basePlanet);
        }).length;
        
        // Calculate base score from matches
        const baseScore = (matchCount / planets.length) * 0.25;
        
        // Adjust for retrograde status - retrograde planets may suggest 
        // more traditional or slower methods
        const retrogradeCount = planets.filter(planet => planet.endsWith('-R')).length;
        const retrogradeAdjustment = retrogradeCount > 0 ? 
          (method.name.toLowerCase().includes('slow') || 
           method.name.toLowerCase().includes('traditional') ? 0.05 : -0.05) : 0;
        
        astrologicalScore += baseScore + retrogradeAdjustment;
      }
    }
    
    // Seasonal bonus (15% of score) - enhanced with more seasonal associations
    if (method.seasonalPreference && method.seasonalPreference.includes(season)) {
      seasonalScore += 0.15;
    } else {
      // Enhanced default seasonal preferences
      if (season === 'winter') {
        if (method.name.toLowerCase().includes('brais') || 
            method.name.toLowerCase().includes('roast') ||
            method.name.toLowerCase().includes('stew') ||
            method.name.toLowerCase().includes('bake')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'summer') {
        if (method.name.toLowerCase().includes('grill') || 
            method.name.toLowerCase().includes('raw') ||
            method.name.toLowerCase().includes('ceviche') ||
            method.name.toLowerCase().includes('cold')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'spring') {
        if (method.name.toLowerCase().includes('steam') || 
            method.name.toLowerCase().includes('stir') ||
            method.name.toLowerCase().includes('blanch') ||
            method.name.toLowerCase().includes('quick')) {
          seasonalScore += 0.12;
        }
      } else if (season === 'fall' || season === 'autumn') {
        if (method.name.toLowerCase().includes('smoke') || 
            method.name.toLowerCase().includes('brais') ||
            method.name.toLowerCase().includes('slow') ||
            method.name.toLowerCase().includes('roast')) {
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
      const methodName = method.name.toLowerCase();
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
          suitable.toLowerCase().includes(pref.toLowerCase())
        )) {
          matchStrength += 1.0;
          continue;
        }
        
        // Special case mappings
        if (pref.toLowerCase() === 'vegetarian' && 
            method.name.toLowerCase().includes('veget')) {
          matchStrength += 0.8;
        } else if (pref.toLowerCase() === 'vegan' && 
                  !method.name.toLowerCase().includes('meat') &&
                  !method.name.toLowerCase().includes('fish')) {
          matchStrength += 0.6;
        } else if (pref.toLowerCase().includes('gluten') && 
                  !method.name.toLowerCase().includes('bread') &&
                  !method.name.toLowerCase().includes('pasta') &&
                  !method.name.toLowerCase().includes('flour')) {
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
      const methodNameLower = method.name.toLowerCase();
      
      // New moon favors starting new methods, preparation methods
      if (lunarPhase === 'New') {
        if (methodNameLower.includes('prep') || 
            methodNameLower.includes('marinate') || 
            methodNameLower.includes('ferment') || 
            methodNameLower.includes('cure')) {
          lunarScore += 0.03;
        }
      }
      // Full moon favors completion methods, preservation methods
      else if (lunarPhase === 'Full') {
        if (methodNameLower.includes('preserve') || 
            methodNameLower.includes('smoke') || 
            methodNameLower.includes('dry') || 
            methodNameLower.includes('can') ||
            methodNameLower.includes('finish')) {
          lunarScore += 0.03;
        }
      }
      // Waxing moon favors building methods, long-cooking methods
      else if (lunarPhase === 'Waxing') {
        if (methodNameLower.includes('slow') || 
            methodNameLower.includes('brais') || 
            methodNameLower.includes('roast') || 
            methodNameLower.includes('stew')) {
          lunarScore += 0.03;
        }
      }
      // Waning moon favors reduction methods, quick methods
      else if (lunarPhase === 'Waning') {
        if (methodNameLower.includes('reduce') || 
            methodNameLower.includes('quick') || 
            methodNameLower.includes('flash') || 
            methodNameLower.includes('blanch')) {
          lunarScore += 0.03;
        }
      }
    }
    
    // Venus influence scoring
    if (isVenusActive) {
      // Check if method aligns with Venus culinary techniques
      if (venusData.PlanetSpecific?.CulinaryTechniques) {
        const methodNameLower = method.name.toLowerCase();
        const methodDescLower = method.description.toLowerCase();
        
        // Check for aesthetic techniques
        if ((methodNameLower.includes('plate') || methodNameLower.includes('present') ||
           methodDescLower.includes('presentation') || methodDescLower.includes('aesthetic')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation'] * 1.5;
        }
        
        // Check for aroma techniques
        if ((methodNameLower.includes('aroma') || methodNameLower.includes('infuse') ||
           methodDescLower.includes('fragrant') || methodDescLower.includes('scent')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion'] * 1.5;
        }
        
        // Check for flavor balancing techniques
        if ((methodNameLower.includes('balance') || methodNameLower.includes('harmonize') ||
           methodDescLower.includes('balanced') || methodDescLower.includes('harmony')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing'] * 1.8;
        }
        
        // Check for textural contrast techniques
        if ((methodNameLower.includes('texture') || methodNameLower.includes('contrast') ||
           methodDescLower.includes('textural') || methodDescLower.includes('crispy') ||
           methodDescLower.includes('crunchy')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast'] * 1.6;
        }
        
        // Check for sensory harmony techniques
        if ((methodNameLower.includes('sensory') || methodNameLower.includes('harmony') ||
           methodDescLower.includes('sensory') || methodDescLower.includes('experience')) &&
           venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony'] * 1.7;
        }
      }
      
      // Add score for culinary temperament alignment
      if (venusTemperament && venusTemperament.FoodFocus) {
        const foodFocus = venusTemperament.FoodFocus.toLowerCase();
        const methodName = method.name.toLowerCase();
        const methodDesc = method.description.toLowerCase();
        
        // Check keyword matches between Venus temperament food focus and method description
        const keywords = foodFocus.split(/[\s,;]+/).filter(k => k.length > 3);
        const matchCount = keywords.filter(keyword => 
          methodName.includes(keyword) || methodDesc.includes(keyword)
        ).length;
        
        venusScore += matchCount * 0.8;
        
        // Check elements alignment with Venus temperament
        if (venusTemperament.Elements && method.elementalEffect) {
          for (const element in venusTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (method.elementalEffect[elementProperty]) {
              venusScore += venusTemperament.Elements[element] * method.elementalEffect[elementProperty] * 1.2;
            }
          }
        }
      }
      
      // Add score for current zodiac transit data
      if (venusZodiacTransit) {
        // Check food focus alignment
        if (venusZodiacTransit.FoodFocus) {
          const transitFocus = venusZodiacTransit.FoodFocus.toLowerCase();
          const methodDesc = method.description.toLowerCase();
          const methodName = method.name.toLowerCase();
          
          // Check for keyword matches
          const focusKeywords = transitFocus.split(/[\s,;]+/).filter(k => k.length > 3);
          const focusMatchCount = focusKeywords.filter(keyword => 
            methodName.includes(keyword) || methodDesc.includes(keyword)
          ).length;
          
          venusScore += focusMatchCount * 1.0;
        }
        
        // Check elements alignment with transit
        if (venusZodiacTransit.Elements && method.elementalEffect) {
          for (const element in venusZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (method.elementalEffect[elementProperty]) {
              venusScore += venusZodiacTransit.Elements[element] * method.elementalEffect[elementProperty] * 0.8;
            }
          }
        }
      }
      
      // Apply Venus retrograde modifications
      if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
        // Check if cooking method aligns with retrograde focus
        if (venusData.PlanetSpecific.Retrograde.FoodFocus) {
          const retroFocus = venusData.PlanetSpecific.Retrograde.FoodFocus.toLowerCase();
          const methodName = method.name.toLowerCase();
          const methodDesc = method.description.toLowerCase();
          
          if (retroFocus.includes('traditional') && 
              (methodName.includes('traditional') || methodDesc.includes('classic') || 
               method.culturalOrigin?.includes('traditional'))) {
            venusScore *= 1.5; // Boost traditional methods during retrograde
          } else if (retroFocus.includes('slow') && 
                    (methodName.includes('slow') || methodDesc.includes('simmer') || 
                     method.duration?.min > 60)) {
            venusScore *= 1.4; // Boost slow cooking methods
          } else if (retroFocus.includes('revisit') && method.culturalOrigin?.includes('ancient')) {
            venusScore *= 1.3; // Boost ancient methods
          } else {
            venusScore *= 0.9; // Slightly reduce other Venus influences
          }
        }
        
        // Apply retrograde elements influence
        if (venusData.PlanetSpecific.Retrograde.Elements && method.elementalEffect) {
          for (const element in venusData.PlanetSpecific.Retrograde.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (method.elementalEffect[elementProperty]) {
              venusScore *= (1 + (venusData.PlanetSpecific.Retrograde.Elements[element] * 
                               method.elementalEffect[elementProperty] * 0.15));
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
        if (method.name.toLowerCase().includes(methodName) || 
            method.description.toLowerCase().includes(methodName)) {
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
    if (!method.scoreDetails) {
      method.scoreDetails = {}; 
    }
    method.scoreDetails = {
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
    recommendations.push({
      method: method.id,
      score: Math.max(0, score), // Ensure score isn't negative
      description: method.description,
      benefits: method.benefits,
      lunarAffinity: calculateLunarMethodAffinity(method, lunarPhase),
      elementalAffinity: method.elementalEffect?.[signElement] || 0,
      planetaryAffinity: method.planetaryAffinity || 0,
      scoreDetails: method.scoreDetails // Include detailed scoring for UI display
    });
    
    // Mark this method as processed to avoid duplicates
    recommendationsMap[methodNameNorm] = true;
  });

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

function calculateLunarMethodAffinity(method: CookingMethod, phase: LunarPhase): number {
  let affinity = 0;

  switch (phase) {
    case 'New Moon':
      // New Moon favors gentle, water-based methods
      if (method.properties?.includes('gentle')) affinity += 0.5;
      if (method.element === 'water') affinity += 0.5;
      break;
    case 'Waxing Crescent':
      // Waxing Crescent favors methods that build flavor
      if (method.properties?.includes('builds flavor')) affinity += 0.7;
      break;
    case 'First Quarter':
      // First Quarter favors methods that transform 
      if (method.properties?.includes('transformative')) affinity += 0.7;
      break;
    case 'Waxing Gibbous':
      // Waxing Gibbous favors methods that intensify
      if (method.properties?.includes('intensifies flavor')) affinity += 0.8;
      break;
    case 'Full Moon':
      // Full Moon favors methods that fully express flavor
      if (method.properties?.includes('maximizes flavor')) affinity += 1.0;
      if (method.element === 'fire') affinity += 0.5;
      break;
    case 'Waning Gibbous':
      // Waning Gibbous favors methods that preserve
      if (method.properties?.includes('preserves nutrients')) affinity += 0.8;
      break;
    case 'Last Quarter':
      // Last Quarter favors methods that reduce and concentrate
      if (method.properties?.includes('concentrates')) affinity += 0.7;
      break;
    case 'Waning Crescent':
      // Waning Crescent favors subtle, gentle methods
      if (method.properties?.includes('subtle')) affinity += 0.7;
      if (method.element === 'water') affinity += 0.3;
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
    const planetaryInfluence = aspect.planets.some(planet => 
      method.planetaryInfluences?.includes(planet)
    );

    if (planetaryInfluence) {
      // Base influence
      let baseInfluence = 0.5;

      // Stronger influence for conjunctions and oppositions
      if (aspect.type === 'conjunction') baseInfluence = 0.8;
      if (aspect.type === 'opposition') baseInfluence = 0.7;
      
      // Special consideration for Venus aspects
      if (aspect.planets.includes('Venus')) {
        // Venus aspects boost methods that enhance aesthetic appeal or harmony
        if (method.sensoryProfile?.visual && method.sensoryProfile.visual > 0.6) {
          baseInfluence += 0.3;
        }
        if (method.properties?.includes('balances flavors')) {
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
  if (method.astrologicalInfluences?.favorableZodiac?.includes(astroState.zodiacSign)) {
    bonusScore += 0.15;  // Reduced bonus for zodiac alignment
  }
  
  // Add lunar phase bonus
  if (astroState.lunarPhase && method.astrologicalInfluences?.lunarPhaseEffect?.[astroState.lunarPhase] > 0) {
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
  const methodNameLength = method.name?.length || 10;
  const methodSpecificVariance = (methodNameLength % 7) * 0.02;
  
  // Ensure the final score is between 0.15 and 0.95 to show differentiation
  return Math.min(0.95, Math.max(0.15, (baseScore * multiplier) + bonusScore - methodSpecificVariance));
}

// Helper function to get method elemental profile
function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  return method.elementalProperties || method.elementalEffect || { 
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
  if (astroState.elementalProfile && Object.keys(astroState.elementalProfile).length > 0) {
    return astroState.elementalProfile;
  }
  if (astroState.elementalState && Object.keys(astroState.elementalState).length > 0) {
    // Assuming elementalState has the same structure as ElementalProperties
    return astroState.elementalState as ElementalProperties;
  }

  // 2. Fallback: Calculate a simplified profile based only on the zodiac (Sun) sign
  //    This is less accurate but provides a default if the full profile is missing.
  if (astroState.zodiacSign) {
    const sign = astroState.zodiacSign.toLowerCase();
    return {
      Fire: sign.includes('aries') || sign.includes('leo') || sign.includes('sagittarius') ? 0.8 : 0.2,
      Water: sign.includes('cancer') || sign.includes('scorpio') || sign.includes('pisces') ? 0.8 : 0.2,
      Earth: sign.includes('taurus') || sign.includes('virgo') || sign.includes('capricorn') ? 0.8 : 0.2,
      Air: sign.includes('gemini') || sign.includes('libra') || sign.includes('aquarius') ? 0.8 : 0.2
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
  // Create recommendations with the enhanced score
  const recommendations = Object.entries(cookingMethods).map(([name, method]) => {
    // Use our enhanced calculation with multiplier
    const score = calculateMethodScore(method, astroState);
    
    return {
      name,
      score,
      elementalAlignment: method.elementalProperties,
      description: method.description
    };
  })
  .filter(rec => rec.score > 0)
  .sort((a, b) => b.score - a.score);
  
  // Return top recommendations (limit if specified)
  const limit = options.limit || 10;
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
  
  if (fireElements.includes(sign)) return 'Fire';
  if (earthElements.includes(sign)) return 'Earth';
  if (airElements.includes(sign)) return 'Air';
  if (waterElements.includes(sign)) return 'Water';
  
  return 'Fire'; // Default fallback
} 
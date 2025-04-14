import { allCookingMethods } from '@/data/cooking';
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
import { cookingMethods as detailedCookingMethods } from '@/data/cooking';
import { calculateLunarSuitability } from '@/utils/lunarUtils';
import { PlanetaryAspect, LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { elementalFamilies } from '@/data/elementalFamilies';

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
  
  // 4. Fallback logic based on method name characteristics
  if (methodNameLower.includes('grill') || methodNameLower.includes('roast') || methodNameLower.includes('fry') || methodNameLower.includes('sear') || methodNameLower.includes('broil')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7 }; // High heat methods
  } else if (methodNameLower.includes('steam') || methodNameLower.includes('simmer') || methodNameLower.includes('poach') || methodNameLower.includes('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5 }; // Medium heat, lower entropy methods
  } else if (methodNameLower.includes('sous vide') || methodNameLower.includes('sous_vide')) {
      return { heat: 0.3, entropy: 0.35, reactivity: 0.2 }; // Low heat, low reactivity
  } else if (methodNameLower.includes('raw') || methodNameLower.includes('ceviche') || methodNameLower.includes('ferment') || methodNameLower.includes('pickle') || methodNameLower.includes('cure')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4 }; // No/low heat methods
  } else if (methodNameLower.includes('braise') || methodNameLower.includes('stew')) {
      return { heat: 0.55, entropy: 0.75, reactivity: 0.60 }; // Moderate heat, high entropy
  } else if (methodNameLower.includes('pressure')) {
      return { heat: 0.7, entropy: 0.8, reactivity: 0.65 }; // High heat/pressure, rapid breakdown
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

  // We return the raw weighted score here. The multiplier will be applied in calculateMethodScore.
  // Ensure a minimum base score to avoid scores of 0 before multiplier.
  return Math.max(0.05, rawScore); 
}

// --- End Added Thermodynamic Helpers ---

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
    .map(([id, method]) => ({
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
  const isSaturnRetrograde = planets?.includes('Saturn-R') || false;
  
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
  const marsZodiacTransit = isMarsActive && currentZodiac 
    ? marsData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Mercury transit data for current zodiac sign if applicable
  const mercuryZodiacTransit = isMercuryActive && currentZodiac 
    ? mercuryData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Jupiter transit data for current zodiac sign if applicable
  const jupiterZodiacTransit = isJupiterActive && currentZodiac 
    ? jupiterData.PlanetSpecific?.ZodiacTransit?.[currentZodiac]
    : undefined;
  
  // Get Saturn transit data for current zodiac sign if applicable
  const saturnZodiacTransit = isSaturnActive && currentZodiac 
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
  let marsTemperament = null;
  if (currentZodiac && isMarsActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    if (fireSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.FireMars) {
      marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.FireMars;
    } else if (waterSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars) {
      marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.WaterMars;
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
  let saturnTemperament = null;
  if (currentZodiac && isSaturnActive) {
    const lowerSign = currentZodiac.toLowerCase();
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if (earthSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.EarthSaturn) {
      saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.EarthSaturn;
    } else if (airSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.AirSaturn) {
      saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.AirSaturn;
    }
  }
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Elemental compatibility (40% of score)
    let elementalScore = 0;
    if (method.elementalEffect || method.elementalProperties) {
      const elementalProps = method.elementalEffect || method.elementalProperties || {};
      
      // Calculate similarity between method's elemental properties and user's elemental composition
      Object.entries(elementalProps).forEach(([element, value]) => {
        const numericValue = typeof value === 'number' ? value : 0;
        elementalScore += numericValue * (elementalComposition[element] || 0);
      });
    }
    
    // Astrological compatibility (25% of score)
    let astrologicalScore = 0;
    if (method.astrologicalInfluences) {
      // Zodiac compatibility
      if (currentZodiac) {
        if (method.astrologicalInfluences.favorableZodiac?.includes(currentZodiac)) {
          astrologicalScore += 0.25;
        } else if (method.astrologicalInfluences.unfavorableZodiac?.includes(currentZodiac)) {
          astrologicalScore -= 0.2;
        }
      }
      
      // Planetary compatibility
      if (planets && planets.length > 0) {
        const matchCount = planets.filter(planet => 
          method.astrologicalInfluences?.dominantPlanets?.includes(planet)
        ).length;
        
        astrologicalScore += (matchCount / planets.length) * 0.25;
      }
    }
    
    // Seasonal bonus (15% of score)
    let seasonalScore = 0;
    if (method.seasonalPreference && method.seasonalPreference.includes(season)) {
      seasonalScore += 0.15;
    } else {
      // Default seasonal preferences if not explicitly defined
      if (season === 'winter' && (method.name === 'braising' || method.name === 'roasting')) {
        seasonalScore += 0.1;
      } else if (season === 'summer' && (method.name === 'grilling' || method.name === 'raw')) {
        seasonalScore += 0.1;
      }
    }
    
    // Tools availability (10% of score)
    let toolScore = 0;
    if (availableTools && method.toolsRequired) {
      const requiredTools = method.toolsRequired;
      const availableRequiredTools = requiredTools.filter(tool => 
        availableTools.some(available => available.toLowerCase().includes(tool.toLowerCase()))
      );
      
      toolScore = (availableRequiredTools.length / requiredTools.length) * 0.1;
    } else {
      // Assume basic tools are available
      toolScore = method.name === 'sous_vide' || 
                  method.name === 'spherification' || 
                  method.name === 'cryo_cooking' ? 0.01 : 0.07;
    }
    
    // Dietary preferences (10% of score)
    let dietaryScore = 0;
    if (dietaryPreferences && method.suitable_for) {
      const preferenceMatch = dietaryPreferences.some(pref => 
        method.suitable_for.some(suitable => suitable.toLowerCase().includes(pref.toLowerCase()))
      );
      
      dietaryScore = preferenceMatch ? 0.1 : 0;
    }
    
    // Cultural preference bonus (add extra points for methods from preferred culture)
    let culturalScore = 0;
    if (culturalPreference && method.culturalOrigin === culturalPreference) {
      culturalScore = 0.05; // 5% boost for direct cultural match
    } else if (culturalPreference && method.variations && 
              method.variations.some(v => v.culturalOrigin === culturalPreference)) {
      culturalScore = 0.03; // 3% boost if a variation matches the culture
    }
    
    // Venus influence scoring
    let venusScore = 0;
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
    
    // Mars influence scoring
    if (isMarsActive) {
      let marsScore = 0;
      
      // Check method alignment with Mars culinary influences
      if (marsData.CulinaryInfluences && method.description) {
        const description = method.description.toLowerCase();
        
        for (const influence of marsData.CulinaryInfluences) {
          const influenceLower = influence.toLowerCase();
          const keywords = influenceLower.split(/\s+/)
            .filter(word => word.length > 4);
            
          for (const keyword of keywords) {
            if (description.includes(keyword)) {
              marsScore += 0.8;
              break;
            }
          }
        }
      }
      
      // Check method against Mars's culinary techniques
      if (marsData.PlanetSpecific?.CulinaryTechniques) {
        const techniques = marsData.PlanetSpecific.CulinaryTechniques;
        const methodName = method.name.toLowerCase();
        
        // Match with high heat cooking
        if (methodName.includes('high heat') || methodName.includes('sear') || 
            methodName.includes('grill') || methodName.includes('broil')) {
          marsScore += techniques['High Heat Cooking'] * 1.5;
        }
        
        // Match with grilling
        if (methodName.includes('grill')) {
          marsScore += techniques['Grilling'] * 1.8;
        }
        
        // Match with smoking
        if (methodName.includes('smoke')) {
          marsScore += techniques['Smoking'] * 1.5;
        }
        
        // Match with fermentation
        if (methodName.includes('ferment') || methodName.includes('pickle')) {
          marsScore += techniques['Fermentation'] * 1.3;
        }
      }
      
      // Check zodiac transit alignment
      if (astroState.zodiacSign && marsData.PlanetSpecific?.ZodiacTransit) {
        const transit = marsData.PlanetSpecific.ZodiacTransit[astroState.zodiacSign];
        
        if (transit && transit.FoodFocus) {
          const foodFocus = transit.FoodFocus.toLowerCase();
          const methodDesc = method.description?.toLowerCase() || '';
          
          // Check for keyword matches
          const keywords = foodFocus.split(/,|\s+/)
            .filter(word => word.length > 3);
            
          for (const keyword of keywords) {
            if (methodDesc.includes(keyword)) {
              marsScore += 0.7;
            }
          }
        }
      }
      
      // Add mars temperament based on current zodiac sign
      if (astroState.zodiacSign) {
        const sign = astroState.zodiacSign.toLowerCase();
        const fireSigns = ['aries', 'leo', 'sagittarius'];
        const waterSigns = ['cancer', 'scorpio', 'pisces'];
        
        // Get appropriate Mars temperament
        let temperament = null;
        if (fireSigns.includes(sign) && marsData.PlanetSpecific?.CulinaryTemperament?.FireMars) {
          temperament = marsData.PlanetSpecific.CulinaryTemperament.FireMars;
        } else if (waterSigns.includes(sign) && marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars) {
          temperament = marsData.PlanetSpecific.CulinaryTemperament.WaterMars;
        }
        
        // Apply temperament recommendations if available
        if (temperament && temperament.Recommendations) {
          for (const rec of temperament.Recommendations) {
            const recLower = rec.toLowerCase();
            if (method.name.toLowerCase().includes(recLower) || 
                (method.description?.toLowerCase() || '').includes(recLower)) {
              marsScore += 1.0;
            }
          }
        }
      }
      
      // Handle Mars retrograde if applicable
      if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
        // During retrograde, Mars favors traditional methods and slow cooking
        if ((method.description?.toLowerCase() || '').includes('traditional') || 
            method.name.toLowerCase().includes('slow')) {
          marsScore += 1.5;
        }
      }
      
      // Apply Mars score
      if (marsScore > 0) {
        method.score += marsScore * 1.5;
        method.planetaryAffinity = (method.planetaryAffinity || 0) + marsScore;
      }
    }
    
    // Mercury influence scoring
    if (isMercuryActive) {
      let mercuryScore = 0;
      
      // Mercury emphasizes precise, adaptable, and quick cooking methods
      const methodName = method.name.toLowerCase();
      const methodDesc = method.description.toLowerCase();
      
      // Check for Mercury-aligned cooking methods based on name/description
      const mercuryKeywords = [
        'quick', 'diverse', 'adaptable', 'precise', 'varied', 'infuse', 
        'multiple', 'blend', 'mix', 'complexity', 'fusion', 'herb', 
        'aromatic', 'fragrant', 'versatile', 'communication', 'detailed',
        'intricate', 'layered', 'balanced'
      ];
      
      // Count Mercury keyword matches in method name and description
      const nameMatchCount = mercuryKeywords.filter(kw => methodName.includes(kw)).length;
      const descMatchCount = mercuryKeywords.filter(kw => methodDesc.includes(kw)).length;
      
      // Add score based on keyword matches
      mercuryScore += nameMatchCount * 1.5; // Higher weight for matches in name
      mercuryScore += descMatchCount * 0.8; // Lower weight for matches in description
      
      // Check if method emphasizes Mercury's dual elements (Air and Earth)
      if (method.elementalEffect) {
        mercuryScore += (method.elementalEffect.Air || 0) * 1.2;
        mercuryScore += (method.elementalEffect.Earth || 0) * 1.1;
      }
      
      // Check for Mercury's food associations in method's suitable_for list
      if (method.suitable_for && mercuryData.FoodAssociations) {
        for (const item of method.suitable_for) {
          const matchingFoods = mercuryData.FoodAssociations.filter(food => 
            item.toLowerCase().includes(food.toLowerCase()) ||
            food.toLowerCase().includes(item.toLowerCase())
          ).length;
          
          mercuryScore += matchingFoods * 0.8;
        }
      }
      
      // Check for Mercury's herb associations in method description
      if (mercuryData.HerbalAssociations?.Herbs) {
        for (const herb of mercuryData.HerbalAssociations.Herbs) {
          if (methodDesc.includes(herb.toLowerCase())) {
            mercuryScore += 0.7;
          }
        }
      }
      
      // Apply Mercury transit data if available
      if (mercuryZodiacTransit) {
        // Check for transit food focus alignment
        if (mercuryZodiacTransit.FoodFocus) {
          const foodFocus = mercuryZodiacTransit.FoodFocus.toLowerCase();
          const focusKeywords = foodFocus.split(/[,\s]+/).filter(kw => kw.length > 3);
          
          // Score for keyword matches with the transit food focus
          const focusMatches = focusKeywords.filter(kw => methodDesc.includes(kw)).length;
          mercuryScore += focusMatches * 1.2;
        }
        
        // Check for transit elemental alignment
        if (mercuryZodiacTransit.Elements && method.elementalEffect) {
          for (const element in mercuryZodiacTransit.Elements) {
            const elementKey = element as keyof ElementalProperties;
            if (method.elementalEffect[elementKey]) {
              mercuryScore += mercuryZodiacTransit.Elements[element] * method.elementalEffect[elementKey] * 1.2;
            }
          }
        }
      }
      
      // Apply Mercury temperament data if available
      if (mercuryTemperament) {
        // Check for temperament food focus alignment
        if (mercuryTemperament.FoodFocus) {
          const tempFocus = mercuryTemperament.FoodFocus.toLowerCase();
          const tempKeywords = tempFocus.split(/[,\s]+/).filter(kw => kw.length > 3);
          
          // Score for keyword matches with the temperament food focus
          const tempMatches = tempKeywords.filter(kw => methodDesc.includes(kw)).length;
          mercuryScore += tempMatches * 1.3;
        }
        
        // Check for temperament elemental alignment
        if (mercuryTemperament.Elements && method.elementalEffect) {
          for (const element in mercuryTemperament.Elements) {
            const elementKey = element as keyof typeof methodData.elementalEffect;
            if (method.elementalEffect[elementKey]) {
              mercuryScore += mercuryTemperament.Elements[element] * method.elementalEffect[elementKey] * 1.3;
            }
          }
        }
      }
      
      // Apply Mercury retrograde adjustments if applicable
      if (isMercuryRetrograde) {
        // Mercury retrograde favors traditional, simpler cooking methods
        const retrogradeKeywords = ['traditional', 'simple', 'basic', 'classic', 'old-fashioned'];
        const retrogradeMatches = retrogradeKeywords.filter(kw => methodDesc.includes(kw)).length;
        
        // During retrograde, boost simpler traditional methods
        mercuryScore += retrogradeMatches * 1.4;
        
        // During retrograde, Mercury places emphasis on review and refinement
        if (methodDesc.includes('refine') || methodDesc.includes('review') || 
            methodDesc.includes('revise') || methodDesc.includes('repeat')) {
          mercuryScore += 1.2;
        }
        
        // During retrograde, Mercury warns against overly complex methods
        const complexityKeywords = ['complex', 'difficult', 'advanced', 'intricate', 'complicated'];
        const complexityMatches = complexityKeywords.filter(kw => methodDesc.includes(kw)).length;
        
        // Penalize complex methods during retrograde
        mercuryScore -= complexityMatches * 0.8;
        
        // Check for specific Mercury retrograde impact on cooking
        if (mercuryData.PlanetSpecific?.Mercury?.CommunicationEffects?.Retrograde) {
          const retroEffect = mercuryData.PlanetSpecific.Mercury.CommunicationEffects.Retrograde.toLowerCase();
          
          // Look for methods that align with the retrograde effect description
          const retroKeywords = retroEffect.split(/[,.\s]+/).filter(kw => kw.length > 4);
          const retroMentionCount = retroKeywords.filter(kw => methodDesc.includes(kw)).length;
          
          mercuryScore += retroMentionCount * 0.7;
        }
      } else {
        // When Mercury is direct, it favors innovation and experimentation
        const directKeywords = ['innovative', 'experimental', 'creative', 'modern', 'fusion'];
        const directMatches = directKeywords.filter(kw => methodDesc.includes(kw)).length;
        
        mercuryScore += directMatches * 1.2;
        
        // When direct, Mercury enhances communication and clarity in cooking
        if (mercuryData.PlanetSpecific?.Mercury?.CommunicationEffects?.Direct) {
          const directEffect = mercuryData.PlanetSpecific.Mercury.CommunicationEffects.Direct.toLowerCase();
          
          // Look for methods that align with the direct effect description
          const directKeywords = directEffect.split(/[,.\s]+/).filter(kw => kw.length > 4);
          const directMentionCount = directKeywords.filter(kw => methodDesc.includes(kw)).length;
          
          mercuryScore += directMentionCount * 0.7;
        }
      }
      
      // Add the Mercury score to the method's total score
      method.score += mercuryScore * 1.8; // Apply Mercury influence with appropriate weight
    }
    
    // Apply Jupiter-specific scoring
    if (isJupiterActive) {
      let jupiterScore = 0;
      
      // Check if method aligns with Jupiter's culinary techniques
      if (jupiterData.PlanetSpecific?.CulinaryTechniques) {
        const jupiterTechniques = jupiterData.PlanetSpecific.CulinaryTechniques;
        
        // Check for abundance and generosity in cooking approach
        if (method.description.toLowerCase().includes('generous') || 
            method.description.toLowerCase().includes('abundant') ||
            method.description.toLowerCase().includes('feast')) {
          jupiterScore += 2.5;
        }
        
        // Check for cultural fusion techniques
        if (method.description.toLowerCase().includes('fusion') || 
            method.description.toLowerCase().includes('multicultural') ||
            method.description.toLowerCase().includes('global')) {
          jupiterScore += 2.0;
        }
        
        // Check for educational or traditional cooking methods
        if (method.description.toLowerCase().includes('traditional') || 
            method.description.toLowerCase().includes('classic') ||
            method.description.toLowerCase().includes('educational')) {
          jupiterScore += 4 * jupiterTechniques['Educational Dining'];
        }
        
        // Check for festive preparation
        if (method.description.toLowerCase().includes('festive') || 
            method.description.toLowerCase().includes('celebratory') ||
            method.description.toLowerCase().includes('special occasion')) {
          jupiterScore += 5 * jupiterTechniques['Festive Preparation'];
        }
      }
      
      // Boost score for methods that align with Jupiter's elemental preferences
      // Jupiter bridges Air and Fire
      if (method.elementalEffect?.Air > 0.5 || method.elementalEffect?.Fire > 0.5) {
        jupiterScore += 1.5;
      }
      
      // Apply zodiac-specific Jupiter considerations
      if (zodiacSign && jupiterData.PlanetSpecific?.ZodiacTransit?.[zodiacSign]) {
        const transitData = jupiterData.PlanetSpecific.ZodiacTransit[zodiacSign];
        
        // Check if method aligns with Jupiter's focus for this zodiac sign
        if (transitData.FoodFocus && 
            method.description.toLowerCase().includes(transitData.FoodFocus.toLowerCase())) {
          jupiterScore += 2.0;
        }
        
        // Check elemental alignments specific to this transit
        if (transitData.Elements && method.elementalEffect) {
          for (const [element, value] of Object.entries(transitData.Elements)) {
            const elemKey = element.toLowerCase() as keyof typeof methodData.elementalEffect;
            if (methodData.elementalEffect && methodData.elementalEffect[elemKey] > 0.5) {
              jupiterScore += value as number;
            }
          }
        }
      }
      
      // Apply Jupiter temperament-specific modifications
      if (jupiterTemperament) {
        if (jupiterTemperament.Recommendations) {
          // Check for alignment with Jupiter's temperament recommendations
          jupiterTemperament.Recommendations.forEach(rec => {
            if (method.description.toLowerCase().includes(rec.toLowerCase())) {
              jupiterScore += 3;
            }
          });
        }
        
        // Apply elemental alignment from Jupiter temperament
        if (jupiterTemperament.Elements) {
          Object.entries(jupiterTemperament.Elements).forEach(([element, value]) => {
            const elementKey = element as keyof typeof methodData.elementalEffect;
            if (methodData.elementalEffect && methodData.elementalEffect[elementKey] > 0.4) {
              jupiterScore += 2 * (value as number);
            }
          });
        }
      }
      
      // Apply retrograde modifiers
      if (isJupiterRetrograde) {
        if (jupiterData.PlanetSpecific?.Retrograde?.CulinaryEffect) {
          const effect = jupiterData.PlanetSpecific.Retrograde.CulinaryEffect.toLowerCase();
          
          // During retrograde, favor moderation and simplicity
          if (method.description.toLowerCase().includes('simple') || 
              method.description.toLowerCase().includes('moderate') ||
              method.description.toLowerCase().includes('balanced')) {
            jupiterScore += 4;
          }
          
          // Reduce score for overly extravagant or excessive methods
          if (method.description.toLowerCase().includes('extravagant') || 
              method.description.toLowerCase().includes('excessive') ||
              method.description.toLowerCase().includes('decadent')) {
            jupiterScore -= 3;
          }
        }
      }
      
      // Scale Jupiter's influence
      jupiterScore *= 1.8;  // Jupiter has a strong influence
      
      // Add Jupiter score to the recommendation
      if (methodData.score) {
        methodData.score += jupiterScore;
        methodData.planetaryAffinity = (methodData.planetaryAffinity || 0) + jupiterScore;
      }
    }
    
    // Apply Saturn-specific scoring
    if (isSaturnActive) {
      let saturnScore = 0;
      
      // Check if method aligns with Saturn's culinary techniques
      if (saturnData.PlanetSpecific?.CulinaryTechniques) {
        // Saturn favors preservation techniques
        if (method.description.toLowerCase().includes('preserve') ||
            method.description.toLowerCase().includes('curing') ||
            method.description.toLowerCase().includes('drying') ||
            method.description.toLowerCase().includes('ferment') ||
            method.description.toLowerCase().includes('pickling')) {
          saturnScore += 3.0;
        }
        
        // Saturn favors traditional and time-tested methods
        if (method.description.toLowerCase().includes('traditional') ||
            method.description.toLowerCase().includes('ancient') ||
            method.description.toLowerCase().includes('classic')) {
          saturnScore += 2.5;
        }
        
        // Saturn rewards patience and slow cooking
        if (method.description.toLowerCase().includes('slow') ||
            method.description.toLowerCase().includes('patient') ||
            (methodData.duration && methodData.duration.min > 60)) {
          saturnScore += 2.5;
        }
      }
      
      // Boost score for methods that align with Saturn's elemental preferences
      // Saturn bridges Earth and Air
      if (method.elementalEffect?.Earth > 0.5 || method.elementalEffect?.Air > 0.5) {
        saturnScore += 1.5;
      }
      
      // Apply zodiac-specific Saturn considerations
      if (zodiacSign && saturnData.PlanetSpecific?.ZodiacTransit?.[zodiacSign]) {
        const transitData = saturnData.PlanetSpecific.ZodiacTransit[zodiacSign];
        
        // Check if method aligns with Saturn's focus for this zodiac sign
        if (transitData.FoodFocus && 
            method.description.toLowerCase().includes(transitData.FoodFocus.toLowerCase())) {
          saturnScore += 2.0;
        }
        
        // Check elemental alignments specific to this transit
        if (transitData.Elements && method.elementalEffect) {
          for (const [element, value] of Object.entries(transitData.Elements)) {
            const elemKey = element.toLowerCase() as keyof typeof methodData.elementalEffect;
            if (methodData.elementalEffect && methodData.elementalEffect[elemKey] > 0.5) {
              saturnScore += value as number;
            }
          }
        }
      }
      
      // Apply Saturn aspectual considerations
      const saturnAspects = aspects.filter(aspect => aspect.planets.includes('Saturn'));
      for (const aspect of saturnAspects) {
        const otherPlanet = aspect.planets.find(p => p !== 'Saturn');
        if (otherPlanet && saturnData.AspectsEffect?.[otherPlanet as keyof typeof saturnData.AspectsEffect]) {
          const aspectEffect = saturnData.AspectsEffect[otherPlanet as keyof typeof saturnData.AspectsEffect][aspect.type as keyof typeof saturnData.AspectsEffect[keyof typeof saturnData.AspectsEffect]];
          saturnScore += aspectEffect * 3;
        }
      }
      
      // Scale Saturn's influence
      saturnScore *= 1.7;  // Saturn has a strong but slightly less expansive influence than Jupiter
      
      // Add Saturn score to the recommendation
      if (methodData.score) {
        methodData.score += saturnScore;
        methodData.planetaryAffinity = (methodData.planetaryAffinity || 0) + saturnScore;
      }
    }
    
    // Add Uranus-specific scoring if applicable
    if (isUranusActive) {
      // Boost methods that align with Uranus' innovative nature
      methodsArray.forEach(method => {
        // Apply Uranus transit data if available
        if (uranusZodiacTransit) {
          // Boost methods mentioned in CookingMethods from the transit data
          if (uranusZodiacTransit.CookingMethods && 
              uranusZodiacTransit.CookingMethods.includes(method.name.toLowerCase())) {
            method.score += 0.15;
          }
          
          // Boost methods that align with the dominant elements for this zodiac transit
          if (uranusZodiacTransit.Elements) {
            const uranusElementBoost = 
              (method.elementalEffect.Fire * (uranusZodiacTransit.Elements.Fire || 0)) +
              (method.elementalEffect.Water * (uranusZodiacTransit.Elements.Water || 0)) +
              (method.elementalEffect.Earth * (uranusZodiacTransit.Elements.Earth || 0)) +
              (method.elementalEffect.Air * (uranusZodiacTransit.Elements.Air || 0));
            
            method.score += uranusElementBoost * 0.1;
          }
        }
        
        // Apply general Uranus influence - boost innovative and unusual methods
        if (method.description?.toLowerCase().includes('innovative') || 
            method.description?.toLowerCase().includes('modern') ||
            method.description?.toLowerCase().includes('unique') ||
            method.description?.toLowerCase().includes('unexpected')) {
          method.score += 0.1;
        }
        
        // If Uranus is retrograde, favor methods that blend tradition with innovation
        if (isUranusRetrograde) {
          if (method.description?.toLowerCase().includes('traditional') && 
              method.description?.toLowerCase().includes('modern')) {
            method.score += 0.15;
          }
        }
      });
    }
    
    // Add Neptune-specific scoring if applicable
    if (isNeptuneActive) {
      // Boost methods that align with Neptune's ethereal nature
      methodsArray.forEach(method => {
        // Apply Neptune transit data if available
        if (neptuneZodiacTransit) {
          // Boost methods mentioned in CookingMethods from the transit data
          if (neptuneZodiacTransit.CookingMethods && 
              neptuneZodiacTransit.CookingMethods.includes(method.name.toLowerCase())) {
            method.score += 0.15;
          }
          
          // Boost methods that align with the dominant elements for this zodiac transit
          if (neptuneZodiacTransit.Elements) {
            const neptuneElementBoost = 
              (method.elementalEffect.Fire * (neptuneZodiacTransit.Elements.Fire || 0)) +
              (method.elementalEffect.Water * (neptuneZodiacTransit.Elements.Water || 0)) +
              (method.elementalEffect.Earth * (neptuneZodiacTransit.Elements.Earth || 0)) +
              (method.elementalEffect.Air * (neptuneZodiacTransit.Elements.Air || 0));
            
            method.score += neptuneElementBoost * 0.1;
          }
        }
        
        // Apply general Neptune influence - boost subtle and water-based methods
        if (method.description?.toLowerCase().includes('subtle') || 
            method.description?.toLowerCase().includes('gentle') ||
            method.description?.toLowerCase().includes('infuse') ||
            method.description?.toLowerCase().includes('steam') ||
            method.description?.toLowerCase().includes('poach')) {
          method.score += 0.1;
        }
        
        // If Neptune is retrograde, favor methods that bring clarity to subtle flavors
        if (isNeptuneRetrograde) {
          if (method.description?.toLowerCase().includes('clarify') || 
              method.description?.toLowerCase().includes('precise') ||
              method.description?.toLowerCase().includes('pure')) {
            method.score += 0.15;
          }
        }
      });
    }
    
    // Add Pluto-specific scoring if applicable
    if (isPlutoActive) {
      // Boost methods that align with Pluto's transformative nature
      methodsArray.forEach(method => {
        // Apply Pluto transit data if available
        if (plutoZodiacTransit) {
          // Boost methods mentioned in CookingMethods from the transit data
          if (plutoZodiacTransit.CookingMethods && 
              plutoZodiacTransit.CookingMethods.includes(method.name.toLowerCase())) {
            method.score += 0.15;
          }
          
          // Boost methods that align with the dominant elements for this zodiac transit
          if (plutoZodiacTransit.Elements) {
            const plutoElementBoost = 
              (method.elementalEffect.Fire * (plutoZodiacTransit.Elements.Fire || 0)) +
              (method.elementalEffect.Water * (plutoZodiacTransit.Elements.Water || 0)) +
              (method.elementalEffect.Earth * (plutoZodiacTransit.Elements.Earth || 0)) +
              (method.elementalEffect.Air * (plutoZodiacTransit.Elements.Air || 0));
            
            method.score += plutoElementBoost * 0.1;
          }
        }
        
        // Apply general Pluto influence - boost transformative and intense methods
        if (method.description?.toLowerCase().includes('transform') || 
            method.description?.toLowerCase().includes('ferment') ||
            method.description?.toLowerCase().includes('age') ||
            method.description?.toLowerCase().includes('smoke') ||
            method.description?.toLowerCase().includes('intense')) {
          method.score += 0.1;
        }
        
        // If Pluto is retrograde, favor methods that connect to ancestral techniques
        if (isPlutoRetrograde) {
          if (method.description?.toLowerCase().includes('traditional') || 
              method.description?.toLowerCase().includes('ancient') ||
              method.description?.toLowerCase().includes('heritage')) {
            method.score += 0.15;
          }
        }
      });
    }
    
    // Calculate final score with proper weighting
    score = (
      elementalScore * 0.40 +
      astrologicalScore * 0.25 +
      seasonalScore * 0.15 +
      toolScore * 0.10 +
      dietaryScore * 0.10 +
      culturalScore +
      (venusScore * 0.15) // Venus influence as additional component
    );
    
    // Capture scoring details for transparency
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
      venus: venusScore * 0.15
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
    });
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

function calculateAspectMethodAffinity(aspects: PlanetaryAspect[], method: CookingMethod): number {
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
function getMethodElementalProfile(method: CookingMethodProfile): any {
  return method.elementalProperties || method.elementalEffect;
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
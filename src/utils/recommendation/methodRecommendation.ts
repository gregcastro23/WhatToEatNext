function getAstrologicalElementalProfile(astroState: unknown): ElementalProperties {
  if (astroState && typeof astroState === 'object' && 'elementalProperties' in astroState) {
    const props = (astroState as Record<string, unknown>).elementalProperties;
    if (props && typeof props === 'object') {
      return props as ElementalProperties;
    }
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function createElementalProperties(props: { Fire: number; Water: number; Earth: number; Air: number } = { Fire: 0, Water: 0, Earth: 0, Air: 0 }): ElementalProperties {
  return { Fire: props.Fire || 0, Water: props.Water || 0, Earth: props.Earth || 0, Air: props.Air || 0 };
}
import type { CookingMethod, CookingMethod as CookingMethodEnum } from "@/types/alchemy";
import { 
  PlanetaryAspect, 
  LunarPhase, 
  BasicThermodynamicProperties, 
  CookingMethodProfile, 
  MethodRecommendationOptions, 
  MethodRecommendation,
  COOKING_METHOD_THERMODYNAMICS,
  ElementalProperties
, Element } from "@/types/alchemy";
import type { AstrologicalState } from "@/types/celestial";
import type { Ingredient, UnifiedIngredient } from "@/types/ingredient";

import { allCookingMethods, cookingMethods as detailedCookingMethods } from '../../data/cooking';
import { getCurrentSeason } from '../../data/integrations/seasonal';
import jupiterData from '../../data/planets/jupiter';
import marsData from '../../data/planets/mars';
import mercuryData from '../../data/planets/mercury';
import neptuneData from '../../data/planets/neptune';
import plutoData from '../../data/planets/pluto';
import saturnData from '../../data/planets/saturn';
import uranusData from '../../data/planets/uranus';
import venusData from '../../data/planets/venus';
import type { ZodiacSign } from '../../types';
import { calculateLunarPhase } from '../astrologyUtils';
import { culturalCookingMethods, getCulturalVariations, CulturalCookingMethod } from '../culturalMethodsAggregator';
import { createElementalProperties as createElementalPropertiesFromUtils, isElementalProperties } from '../elemental/elementalUtils';

// Type guard for FlavorProperties
interface FlavorProperties {
  bitter?: number;
  sweet?: number;
  sour?: number;
  salty?: number;
  umami?: number;
  [key: string]: number | undefined;
}

function _hasFlavorProperties(obj: unknown): obj is FlavorProperties {
  if (!obj || typeof obj !== 'object') return false;
  
  const objRecord = obj as Record<string, unknown>;
  return (
    typeof objRecord.bitter === 'number' || 
    typeof objRecord.sweet === 'number' || 
    typeof objRecord.sour === 'number' || 
    typeof objRecord.salty === 'number' || 
    typeof objRecord.umami === 'number'
  );
}

// Safe access to elemental properties
function _getElementalProperty(obj: unknown, property: keyof ElementalProperties): number {
  if (isElementalProperties(obj) && typeof obj[property] === 'number') {
    return obj[property];
  }
  return 0;
}

// ===== TYPES AND INTERFACES =====

interface CookingMethodData {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties;
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
  variations?: CookingMethodData[];
  relatedToMainMethod?: string;
}

type CookingMethodDictionary = Record<string, CookingMethodData>;

// ===== DATA AGGREGATION =====

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...Object.entries(allCookingMethods).reduce((acc: CookingMethodDictionary, [id, method]) => {
    const methodData = method as unknown as Record<string, unknown>;
    acc[id] = {
      id,
      ...methodData,
      elementalEffect: (methodData.elementalEffect as ElementalProperties) || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
      name: id,
      description: '',
      duration: { min: 0, max: 60 },
      suitable_for: (methodData.suitable_for as string[]) || [],
      benefits: (methodData.benefits as string[]) || [],
      variations: [],
    };
    return acc;
  }, {}),
  
  // Add cultural methods with proper organization
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    const methodData = method as unknown as Record<string, unknown>;
    // Check if this method is a variation of a main method
    if (methodData.relatedToMainMethod) {
      // If the main method exists, add this as a variation
      const mainId = methodData.relatedToMainMethod as string;
      if (methods[mainId]) {
        const existingVariations = methods[mainId].variations || [];
        const existingVariationsArray = Array.isArray(existingVariations) ? existingVariations : [];
        if (!existingVariationsArray.some(v => v.id === methodData.id)) {
          methods[mainId].variations = [
            ...existingVariationsArray,
            {
              id: methodData.id as string,
              name: (methodData.variationName as string) || (methodData.name as string),
              description: methodData.description as string,
              elementalEffect: (methodData.elementalState as ElementalProperties) || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
              toolsRequired: (methodData.toolsRequired as Element[]) || [],
              bestFor: (methodData.bestFor as Element[]) || [],
              culturalOrigin: methodData.culturalOrigin as string,
              astrologicalInfluences: methodData.astrologicalInfluences as Record<string, unknown>,
              duration: {
                min: (methodData.duration as { min?: number }).min || 0,
                max: (methodData.duration as { max?: number }).max || 0
              },
              suitable_for: (methodData.bestFor as string[]) || [],
              benefits: [],
              relatedToMainMethod: mainId
            }
          ];
        }
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[methodData.id as string] && !methodData.relatedToMainMethod) {
      methods[methodData.id as string] = {
        id: methodData.id as string,
        name: methodData.name as string,
        description: methodData.description as string,
        elementalEffect: (methodData.elementalState as ElementalProperties) || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
        toolsRequired: (methodData.toolsRequired as Element[]) || [],
        bestFor: (methodData.bestFor as Element[]) || [],
        culturalOrigin: methodData.culturalOrigin as string,
        astrologicalInfluences: {
          favorableZodiac: (methodData.astrologicalInfluences as Record<string, unknown>).favorableZodiac as ZodiacSign[] || [],
          unfavorableZodiac: (methodData.astrologicalInfluences as Record<string, unknown>).unfavorableZodiac as ZodiacSign[] || [],
          dominantPlanets: (methodData.astrologicalInfluences as Record<string, unknown>).dominantPlanets as string[] || []
        },
        duration: {
          min: (methodData.duration as { min?: number }).min || 0,
          max: (methodData.duration as { max?: number }).max || 0
        },
        suitable_for: (methodData.bestFor as string[]) || [],
        benefits: [],
        variations: [],
      };
    }
    return methods;
  }, {})
};

// ===== THERMODYNAMIC HELPERS =====

/**
 * Get thermodynamic properties for a cooking method
 */
export function getMethodThermodynamics(method: CookingMethodProfile): BasicThermodynamicProperties {
  const methodNameLower = String(((method as unknown as Record<string, unknown>)).name).toLowerCase() || '';

  // 1. Check the detailed data source first
  const detailedMethodData = detailedCookingMethods[methodNameLower as keyof typeof detailedCookingMethods];
  if (detailedMethodData?.thermodynamicProperties) {
    return {
      heat: detailedMethodData.thermodynamicProperties.heat ?? 0.5,
      entropy: detailedMethodData.thermodynamicProperties.entropy ?? 0.5,
      reactivity: detailedMethodData.thermodynamicProperties.reactivity ?? 0.5,
      gregsEnergy: detailedMethodData.thermodynamicProperties.gregsEnergy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties
  const methodData = method as unknown as Record<string, unknown>;
  const thermodynamicProperties = methodData.thermodynamicProperties as Record<string, unknown>;
  if (thermodynamicProperties) {
    return {
      heat: Number(thermodynamicProperties.heat) || 0.5,
      entropy: Number(thermodynamicProperties.entropy) || 0.5,
      reactivity: Number(thermodynamicProperties.reactivity) || 0.5,
      gregsEnergy: Number(thermodynamicProperties.gregsEnergy) || 0.5
    };
  }
  
  // 3. Check the explicitly defined mapping constant
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - Safe string access
  if (methodNameLower.includes('grill') || methodNameLower.includes('roast') || 
      methodNameLower.includes('fry') || methodNameLower.includes('sear') || 
      methodNameLower.includes('broil') || methodNameLower.includes('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.7 };
  } else if (methodNameLower.includes('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('steam') || methodNameLower.includes('simmer') || 
             methodNameLower.includes('poach') || methodNameLower.includes('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 };
  } else if (methodNameLower.includes('sous vide') || methodNameLower.includes('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.3 };
  } else if (methodNameLower.includes('raw') || methodNameLower.includes('ceviche') || 
             methodNameLower.includes('ferment') || methodNameLower.includes('pickle') || 
             methodNameLower.includes('cure') || methodNameLower.includes('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 };
  } else if (methodNameLower.includes('braise') || methodNameLower.includes('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.7 };
  } else if (methodNameLower.includes('smoke') || methodNameLower.includes('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('confit') || methodNameLower.includes('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.5 };
  } else if (methodNameLower.includes('dehydrat') || methodNameLower.includes('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 };
  } else if (methodNameLower.includes('toast') || methodNameLower.includes('brulee')) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8, gregsEnergy: 0.7 };
  }

  // Default values if no match found
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0.5 };
}

/**
 * Calculate thermodynamic base score for a method
 */
export function calculateThermodynamicBaseScore(thermodynamics: BasicThermodynamicProperties): number {
  const { heat, entropy, reactivity } = thermodynamics;
  
  // Balanced thermodynamic properties generally score higher
  const balance = 1 - Math.abs(heat - 0.5) - Math.abs(entropy - 0.5) - Math.abs(reactivity - 0.5);
  const intensity = (heat + entropy + reactivity) / 3;
  
  return (balance * 0.6) + (intensity * 0.4);
}

// ===== UTILITY FUNCTIONS =====

export function normalizeMethodName(methodName: string): string {
  return methodName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function areSimilarMethods(method1: string, method2: string): boolean {
  const normalized1 = normalizeMethodName(method1);
  const normalized2 = normalizeMethodName(method2);
  
  // Check for exact match
  if (normalized1 === normalized2) return true;
  
  // Check for partial matches
  const similarityThreshold = 0.7;
  const longer = (normalized1 || []).length > (normalized2 || []).length ? normalized1 : normalized2;
  const shorter = (normalized1 || []).length <= (normalized2 || []).length ? normalized1 : normalized2;
  
  let matches = 0;
  for (let i = 0; i < (shorter || []).length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return (matches / (shorter || []).length) >= similarityThreshold;
}

// ===== COMPATIBILITY FUNCTIONS =====

/**
 * Calculate enhanced elemental compatibility between method and target properties
 */
export function calculateEnhancedElementalCompatibility(
  methodProps: ElementalProperties,
  targetProps: ElementalProperties,
): number {
  if (!methodProps || !targetProps) return 0.5;
  
  let totalCompatibility = 0;
  let elementCount = 0;
  
  Object.entries(methodProps || {}).forEach(([element, methodValue]) => {
    const targetValue = targetProps[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
    
    // Following elemental principles: higher compatibility for similar values
    const compatibility = 1 - Math.abs(methodValue - targetValue);
    
    // Weight by the target element's importance
    const weight = targetValue + 0.1; // Ensure minimum weight
    
    totalCompatibility += compatibility * weight;
    elementCount += weight;
  });
  
  return elementCount > 0 ? totalCompatibility / elementCount : 0.5;
}

/**
 * Calculate planetary day influence on cooking method
 */
export function calculatePlanetaryDayInfluence(
  method: CookingMethodProfile,
  planetaryDay: string,
): number {
  const planetaryMethodAffinities = {
    'Sun': ['grill', 'roast', 'bake', 'sear', 'broil'],
    'Moon': ['steam', 'poach', 'simmer', 'braise', 'slow cook'],
    'Mars': ['fry', 'sauté', 'stir fry', 'char', 'blacken'],
    'Mercury': ['julienne', 'dice', 'mince', 'chop', 'slice'],
    'Jupiter': ['feast', 'banquet', 'abundance', 'large batch'],
    'Venus': ['garnish', 'plate', 'present', 'decorate'],
    'Saturn': ['preserve', 'cure', 'age', 'ferment', 'pickle']
  };
  
  const methodData = method as unknown as Record<string, unknown>;
  const methodName = String(methodData.name || '').toLowerCase();
  const affinities = planetaryMethodAffinities[planetaryDay] || [];
  
  const hasAffinity = affinities.some(affinity => 
    methodName.includes(String(affinity || '').toLowerCase())
  );
  
  return hasAffinity ? 0.8 : 0.5;
}

/**
 * Calculate planetary hour influence on cooking method
 */
export function calculatePlanetaryHourInfluence(
  method: CookingMethodProfile,
  planetaryHour: string,
  isDaytime: boolean,
): number {
  const hourMethodAffinities = {
    'Sun': isDaytime ? ['grill', 'roast', 'bake'] : ['warm', 'heat'],
    'Moon': isDaytime ? ['steam', 'poach'] : ['simmer', 'braise'],
    'Mars': isDaytime ? ['fry', 'sear'] : ['char', 'blacken'],
    'Mercury': isDaytime ? ['chop', 'dice'] : ['mince', 'julienne'],
    'Jupiter': isDaytime ? ['feast', 'abundance'] : ['comfort', 'hearty'],
    'Venus': isDaytime ? ['garnish', 'present'] : ['delicate', 'refined'],
    'Saturn': isDaytime ? ['preserve', 'cure'] : ['age', 'ferment']
  };
  
  const methodData = method as unknown as Record<string, unknown>;
  const methodName = String(methodData.name || '').toLowerCase();
  const affinities = hourMethodAffinities[planetaryHour] || [];
  
  const hasAffinity = affinities.some(affinity => 
    methodName.includes(String(affinity || '').toLowerCase())
  );
  
  return hasAffinity ? 0.7 : 0.5;
}

export function isDaytime(date: Date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 6 && hours < 18;
}

// ===== MAIN RECOMMENDATION FUNCTION =====

/**
 * Get recommended cooking methods based on elemental composition and preferences
 */
export function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: ZodiacSign,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  dietaryPreferences?: string[],
  availableTools?: string[]
) {
  const recommendations: Array<{
    method: CookingMethodData;
    score: number;
    reasons: string[];
    thermodynamics: BasicThermodynamicProperties;
  }> = [];
  
  // Score each cooking method
  Object.values(allCookingMethodsCombined || {}).forEach(method => {
    let score = 0.5; // Base score
    const reasons: string[] = [];
    
    // Elemental compatibility (40% weight)
    const methodData = method as unknown as Record<string, unknown>;
    const elementalEffect = methodData.elementalEffect as ElementalProperties;
    const elementalScore = calculateEnhancedElementalCompatibility(
      elementalEffect,
      elementalComposition
    );
    score += elementalScore * 0.4;
    if (elementalScore > 0.7) {
      reasons.push('Strong elemental alignment');
    }
    
    // Zodiac compatibility (20% weight)
    const astrologicalInfluences = methodData.astrologicalInfluences as Record<string, unknown>;
    const favorableZodiac = astrologicalInfluences.favorableZodiac as string[];
    if (currentZodiac && favorableZodiac) {
      const zodiacMatch = favorableZodiac.includes(currentZodiac);
      if (zodiacMatch) {
        score += 0.2;
        reasons.push(`Favorable for ${currentZodiac}`);
      }
    }
    
    // Planetary compatibility (15% weight)
    const dominantPlanets = astrologicalInfluences.dominantPlanets as string[];
    if (planets && dominantPlanets) {
      const planetMatch = planets.some(planet => 
        dominantPlanets.includes(planet)
      );
      if (planetMatch) {
        score += 0.15;
        reasons.push('Planetary alignment');
      }
    }
    
    // Seasonal compatibility (10% weight)
    const seasonalPreference = methodData.seasonalPreference as string[];
    if (seasonalPreference.includes(season)) {
      score += 0.1;
      reasons.push(`Perfect for ${season}`);
    }
    
    // Cultural preference (10% weight)
    const culturalOrigin = String(methodData.culturalOrigin || '');
    if (culturalPreference && culturalOrigin === culturalPreference) {
      score += 0.1;
      reasons.push(`${culturalPreference} tradition`);
    }
    
    // Tool availability (5% weight)
    const toolsRequired = methodData.toolsRequired as string[];
    if (availableTools && toolsRequired) {
      const toolsAvailable = toolsRequired.every(tool => 
        availableTools.some(available => 
          String(available || '').toLowerCase().includes(String(tool || '').toLowerCase())
        )
      );
      if (toolsAvailable) {
        score += 0.05;
        reasons.push('Tools available');
      }
    }
    
    // Get thermodynamic properties
    const thermodynamics = getMethodThermodynamics(method as unknown as CookingMethodProfile);
    
    recommendations.push({
      method,
      score: Math.min(1, score),
      reasons,
      thermodynamics
    });
  });
  
  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 10)
    .map(rec => ({
      name: rec.method.name,
      score: rec.score,
      description: rec.method.description,
      reasons: rec.reasons,
      elementalEffect: rec.method.elementalEffect,
      duration: rec.method.duration,
      thermodynamics: rec.thermodynamics,
      variations: rec.method.variations || [],
    }));
}

// ===== LUNAR AND ASPECT CALCULATIONS =====

export function calculateLunarMethodAffinity(method: CookingMethodData, phase: LunarPhase): number {
  const lunarAffinities = {
    'new moon': ['ferment', 'pickle', 'cure', 'preserve'],
    'waxing crescent': ['steam', 'poach', 'simmer'],
    'first quarter': ['sauté', 'stir fry', 'quick cook'],
    'waxing gibbous': ['bake', 'roast', 'grill'],
    'full Moon': ['feast', 'celebration', 'abundance'],
    'waning gibbous': ['braise', 'slow cook', 'stew'],
    'last quarter': ['reduce', 'concentrate', 'intensify'],
    'waning crescent': ['rest', 'minimal cooking', 'raw']
  };
  
  const methodData = method as unknown as Record<string, unknown>;
  const methodName = String(methodData.name || '').toLowerCase();
  const phaseAffinities = lunarAffinities[phase] || [];
  
  const hasAffinity = phaseAffinities.some(affinity => 
    methodName.includes(String(affinity || ''))
  );
  
  return hasAffinity ? 0.8 : 0.5;
}

function _calculateAspectMethodAffinity(aspects: PlanetaryAspect[], method: CookingMethodData): number {
  if (!aspects || (aspects || []).length === 0) return 0.5;
  
  let totalAffinity = 0;
  let aspectCount = 0;
  
  (aspects || []).forEach(aspect => {
    // Different aspects favor different cooking approaches
    let affinity = 0.5;
    
    const methodData = method as unknown as Record<string, unknown>;
    const methodName = String(methodData.name || '').toLowerCase();
    
    if (aspect.type === 'conjunction' || aspect.type === 'trine') {
      // Harmonious aspects favor gentle, harmonious cooking methods
      if (methodName.includes('steam') || 
          methodName.includes('poach') ||
          methodName.includes('simmer')) {
        affinity = 0.8;
      }
    } else if (aspect.type === 'square' || aspect.type === 'opposition') {
      // Challenging aspects favor more intense cooking methods
      if (methodName.includes('grill') || 
          methodName.includes('fry') ||
          methodName.includes('sear')) {
        affinity = 0.8;
      }
    }
    
    totalAffinity += affinity;
    aspectCount++;
  });
  
  return aspectCount > 0 ? (Number(totalAffinity) || 0) / (Number(aspectCount) || 0) : 0.5;
}

// ===== ENHANCED SCORING FUNCTIONS =====

export function calculateMethodScore(method: CookingMethodProfile, astroState: AstrologicalState): number {
  let score = 0.5; // Base score
  
  // Elemental compatibility
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  
  if (methodElemental && astroElemental) {
    const elementalCompatibility = calculateElementalCompatibility(methodElemental, astroElemental);
    score += elementalCompatibility * 0.4;
  }
  
  // Lunar phase compatibility
  if (astroState.lunarPhase) {
    const lunarAffinity = calculateLunarMethodAffinity(method as unknown as CookingMethodData, astroState.lunarPhase);
    score += lunarAffinity * 0.3;
  }
  
  // Planetary aspects compatibility
  if (astroState.aspects) {
    // ✅ Pattern MM-1: Type assertion to resolve PlanetaryAspect[] import mismatch
    const aspectAffinity = _calculateAspectMethodAffinity((astroState.aspects as unknown) as PlanetaryAspect[], method as unknown as CookingMethodData);
    score += aspectAffinity * 0.3;
  }
  
  return Math.min(1, score);
}

export function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  const methodData = method as unknown as Record<string, unknown>;
  const elementalEffect = methodData.elementalEffect as ElementalProperties;
  const elementalState = methodData.elementalState as ElementalProperties;
  return elementalEffect || elementalState || createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
}

/**
 * Create elemental profile from astrological state
 */
export function createElementalProfileFromAstroState(astroState: AstrologicalState): ElementalProperties | null {
  if (!astroState.dominantElement) return null;
  
  // Create elemental profile based on dominant element
  const profile = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  });
  
  // Enhance the dominant element
  Object.keys(profile || {}).forEach(element => {
    if (element === astroState.dominantElement) {
      profile[element as Element] = Math.min(1.0, profile[element as Element] + 0.3);
    }
  });
  
  return profile;
}

/**
 * Calculate compatibility between two elemental properties
 */
export function calculateElementalCompatibility(elementalA: ElementalProperties, elementalB: ElementalProperties): number {
  if (!elementalA || !elementalB) return 0.5;
  
  let totalCompatibility = 0;
  let elementCount = 0;
  
  Object.entries(elementalA || {}).forEach(([element, valueA]) => {
    const valueB = elementalB[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
    
    // Higher compatibility for similar values (following elemental principles)
    const compatibility = 1 - Math.abs((Number(valueA) || 0) - (Number(valueB) || 0));
    totalCompatibility += compatibility;
    elementCount++;
  });
  
  return elementCount > 0 ? (Number(totalCompatibility) || 0) / (Number(elementCount) || 0) : 0.5;
}

/**
 * Get cooking method recommendations based on astrological state
 */
export function getCookingMethodRecommendations(
  astroState: AstrologicalState,
  options: MethodRecommendationOptions = {}
): MethodRecommendation[] {
  const methods = Object.values(allCookingMethodsCombined);
  
  const scoredMethods = (methods || []).map(method => {
    const score = calculateMethodScore(method as unknown as CookingMethodProfile, astroState);
    
    // Apply surgical type casting with variable extraction
    const methodData = (method as unknown) as Record<string, unknown>;
    const methodId = String(methodData.id || methodData.name || 'unknown');
    const methodName = String(methodData.name || 'Unknown Method');
    const elementalEffect = (methodData.elementalEffect as ElementalProperties) || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  });
    const astrologicalInfluences = (methodData.astrologicalInfluences as Record<string, unknown>) || {};
    const description = String(methodData.description || 'Recommended cooking method');
    
    return {
        method: {
          id: methodId,
          name: methodName,
          elementalEffect: elementalEffect,
          astrologicalInfluences: astrologicalInfluences
        },
        score: score,
        reasons: [description]
      } as unknown as MethodRecommendation;
  });
  
  const limit = Number(((options as unknown as Record<string, unknown>)).limit) || 5;
  return scoredMethods
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, limit);
}

export function getElementForSign(sign: string): Element {
  const fireSigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius']; // Fixed casing
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  
  const signLower = sign.toLowerCase();
  
  if (fireSigns.includes(signLower)) return 'Fire';
  if (earthSigns.includes(signLower)) return 'Earth';
  if (airSigns.includes(signLower)) return 'Air';
  if (waterSigns.includes(signLower)) return 'Water';
  
  return 'Fire'; // Default
}

// ===== EXPORTS =====

export type {
  CookingMethodData,
  CookingMethodDictionary
};

// Export the cooking method data
export { allCookingMethodsCombined as getAllCookingMethods };

// Add the missing functions needed by testRecommendations.ts

/**
 * Get holistic cooking recommendations based on ingredient properties
 * This function combines various factors for a more comprehensive recommendation
 */
export function getHolisticCookingRecommendations(
  ingredient: Ingredient | UnifiedIngredient,
  astroState?: Record<string, unknown>,
  season?: string,
  includeReasons = false,
  availableMethods: string[] = [],
  limit = 5
): { method: string; compatibility: number; reason?: string }[] {
  try {
    // Default to empty elementalProperties if not provided
    const elementalProperties = ingredient.transformedElementalProperties || 
                               { Fire: ingredient.Fire || 0.25, Water: ingredient.Water || 0.25, Earth: ingredient.Earth || 0.25, Air: ingredient.Air || 0.25  };
    
    // Get recommended methods
    const recommendations = getRecommendedCookingMethods(
      elementalProperties,
      undefined, // zodiac sign
      undefined, // planets
      (season as 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all') || 'spring'
    );
    
    // Filter by available methods if provided
    const filteredRecs = (availableMethods || []).length > 0
      ? (recommendations || []).filter(rec => 
          (availableMethods || []).some(method => 
            areSimilarMethods(String((rec as Record<string, unknown>).method || (rec as Record<string, unknown>).name || (rec as Record<string, unknown>).id), method)
          )
        )
      : recommendations;
    
    // Format the results with safe property access
    return filteredRecs.slice(0, limit || 5).map(rec => ({
      method: String(((rec as Record<string, unknown>).method as Record<string, unknown>).name || ((rec as Record<string, unknown>).method as Record<string, unknown>).id || (rec as Record<string, unknown>).name || (rec as Record<string, unknown>).id || 'unknown'),
      compatibility: (Number((rec as Record<string, unknown>).score) || 0) * 100,
      reason: includeReasons ? (String(((rec as Record<string, unknown>).reasons as string[])[0]) || `Good match for ${ingredient.name}`) : undefined
    }));
  } catch (error) {
    console.error('Error in getHolisticCookingRecommendations:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get recommended cooking methods specifically for an ingredient
 * This function focuses on elemental compatibility
 */
export function getRecommendedCookingMethodsForIngredient(
  ingredient: Ingredient | UnifiedIngredient,
  cookingMethods: Ingredient | UnifiedIngredient[],
  limit = 5
): { method: string; compatibility: number }[] {
  try {
    // Extract elemental properties from ingredient
    const elementalProps = {
      Fire: ingredient.Fire || 0.25,
      Water: ingredient.Water || 0.25,
      Earth: ingredient.Earth || 0.25,
      Air: ingredient.Air || 0.25,
    };
    
    // Calculate compatibility for each method
    const scoredMethods = (cookingMethods as unknown[]).map(method => {
      const methodData = method as Record<string, unknown>;
      const methodElement = String(methodData.element || '').toLowerCase();
      
      // Simple compatibility based on elemental harmony
      let compatibility = 0.5; // Base score
      
      // Boost score for matching element
      if (methodElement === String(ingredient.element || '').toLowerCase()) {
        compatibility += 0.3;
      }
      
      // Further adjust based on elemental values
      if (methodElement === 'Fire') compatibility += elementalProps.Fire * 0.2;
      if (methodElement === 'Water') compatibility += elementalProps.Water * 0.2;
      if (methodElement === 'Earth') compatibility += elementalProps.Earth * 0.2;
      if (methodElement === 'Air') compatibility += elementalProps.Air * 0.2;
      
      return {
        method: String(methodData.name || 'Unknown Method'),
        compatibility: Math.min(compatibility * 100, 100) // Cap at 100%
      };
    });
    
    // Sort by compatibility and limit results
    return scoredMethods
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getRecommendedCookingMethodsForIngredient:', error);
    // Return empty array as fallback
    return [];
  }
} 
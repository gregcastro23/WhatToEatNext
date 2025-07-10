// Enhanced interfaces for Phase 11 - CookingMethods component
interface _CookingMethodComponentProps {
  method?: {
    name?: string;
    description?: string;
    element?: string;
    season?: string | string[];
    astrologicalProfile?: Record<string, unknown>;
    elementalProperties?: {
      Fire?: number;
      Water?: number;
      Earth?: number;
      Air?: number;
    };
  };
  onMethodSelect?: (method: Record<string, unknown>) => void;
  selectedMethod?: string;
}

interface _CookingMethodData {
  id?: string;
  name?: string;
  description?: string;
  element?: string;
  season?: string | string[];
  cuisine?: string;
  mealType?: string | string[];
}

// Add proper interfaces for better type safety
interface CookingMethodBase {
  id: string;
  name: string;
  description?: string;
  elementalProperties?: ElementalProperties;
  elementalEffect?: ElementalProperties;
  idealIngredients?: string[];
  suitable_for?: string[];
  astrologicalInfluences?: AstrologicalInfluence;
  culturalOrigin?: string;
  duration?: {
    min: number;
    max: number;
  };
  toolsRequired?: string[];
  benefits?: string[];
}

interface CookingMethodWithScore extends CookingMethodBase {
  score?: number;
  gregsEnergy: number;
  matchReason: string;
  heat?: number;
  entropy?: number;
  reactivity?: number;
  energy?: number;
  thermodynamicProperties?: ThermodynamicProperties;
}

interface PlanetaryPositionData {
  sign: string;
  degree: number;
  exactLongitude?: number;
}

interface PlanetaryAlignment {
  sun?: PlanetaryPositionData;
  Sun?: PlanetaryPositionData;
  moon?: PlanetaryPositionData;
  Moon?: PlanetaryPositionData;
  mercury?: PlanetaryPositionData;
  Mercury?: PlanetaryPositionData;
  venus?: PlanetaryPositionData;
  Venus?: PlanetaryPositionData;
  mars?: PlanetaryPositionData;
  Mars?: PlanetaryPositionData;
  jupiter?: PlanetaryPositionData;
  Jupiter?: PlanetaryPositionData;
  saturn?: PlanetaryPositionData;
  Saturn?: PlanetaryPositionData;
  [key: string]: PlanetaryPositionData | undefined;
}

interface CookingMethodSourceData {
  description?: string;
  chemicalChanges?: Record<string, unknown>;
  safetyFeatures?: string[];
  nutrientRetention?: Record<string, unknown>;
  regionalVariations?: Record<string, unknown>;
  suitable_for?: string[];
}

interface IngredientCompatibilityData {
  name: string;
  elementalProperties?: ElementalProperties;
}
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, Globe, Clock, 
  Thermometer, Timer, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import styles from './CookingMethods.module.css';
import { RecommendationAdapter } from '@/services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty, _ElementalCharacter } from '@/constants/planetaryElements';
import { planetaryFoodAssociations, _Planet } from '@/constants/planetaryFoodAssociations';
import type { LunarPhase } from '@/types/celestial';
import type { ElementalProperties, ZodiacSign, CookingMethod, BasicThermodynamicProperties } from '@/types/alchemy';
import { formatLunarPhaseForDisplay } from '@/utils/lunarPhaseUtils';
import { COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { getCachedCalculation } from '@/utils/calculationCache';
import { useCurrentChart } from '@/hooks/useCurrentChart';
import { testCookingMethodRecommendations } from '../utils/testRecommendations';

// Import cooking methods from both traditional and cultural sources
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { culturalCookingMethods, _getCulturalVariations } from '@/utils/culturalMethodsAggregator';
import { allCookingMethods } from '@/data/cooking';
import { molecularCookingMethods } from '@/data/cooking/molecularMethods';

// Add this import at the top with the other imports
import { _getCurrentSeason } from '@/data/integrations/seasonal';
import { getLunarMultiplier } from '@/utils/lunarMultiplier';

// Add these imports or declarations at the top of the component
// import { useTarotContext } from '@/contexts/TarotContext/hooks';

// Add import for modality type and utils
import type { Modality } from '@/data/ingredients/types';
import { determineIngredientModality } from '@/utils/ingredientUtils';
import { _isElementalProperties } from '@/utils/elemental/elementalUtils';
import type { PlanetaryDignityDetails } from '@/constants/planetaryFoodAssociations';

// Utility functions for alchemical calculations
// Simple placeholder implementations if actual implementations aren't accessible
import { staticAlchemize } from '@/utils/alchemyInitializer';

// Implement the alchemize function using staticAlchemize
const alchemize = async (
  elements: ElementalProperties | Record<string, number>,
  astroState: unknown,
  thermodynamics: unknown
): Promise<Record<string, unknown>> => {
  try {
    // Create a simplified birthInfo object
    const birthInfo = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };

    // Create a simplified horoscope object
    const horoscopeDict = {
      tropical: {
        CelestialBodies: {},
        Ascendant: {},
        Aspects: {}
      }
    };

    // If astroState contains planetary positions, add them to the horoscope
    if (astroState && (astroState as Record<string, unknown>)?.planetaryPositions) {
      // Convert astroState planetary positions to the format expected by the alchemizer
      Object.entries((astroState as Record<string, unknown>)?.planetaryPositions as Record<string, unknown>).forEach(([planet, position]: [string, unknown]) => {
        if (position && (position as Record<string, unknown>)?.sign) {
          (horoscopeDict.tropical.CelestialBodies as Record<string, unknown>)[planet] = {
            Sign: { label: (position as Record<string, unknown>)?.sign },
            ChartPosition: {
              Ecliptic: {
                ArcDegreesInSign: (position as Record<string, unknown>)?.degree || 0
              }
            }
          };
        }
      });
    }

    // Use the static alchemize function to get the full result
    const alchemicalResult = staticAlchemize(birthInfo, horoscopeDict);

    // Safe type conversion with proper type guards
    const alchemicalResultObj = isStandardizedAlchemicalResult(alchemicalResult) 
      ? alchemicalResult 
      : {} as Record<string, unknown>;
    const thermodynamicsObj = thermodynamics as Record<string, unknown>;
    
    // Safe property access with type guards
    const elementalBalance = alchemicalResultObj?.elementalBalance as Record<string, unknown> | undefined;
    
    // Combine the result with the input elements and thermodynamics
    return {
      ...alchemicalResult,
      elementalProperties: elements,
      transformedElementalProperties: {
        Fire: (elementalBalance?.fire as number) || 0,
        Water: (elementalBalance?.water as number) || 0,
        Earth: (elementalBalance?.earth as number) || 0,
        Air: (elementalBalance?.air as number) || 0
      },
      // Extract thermodynamic properties with safe property access
      heat: (thermodynamicsObj?.heat as number) || (alchemicalResultObj?.heat as number) || 0.5,
      entropy: (thermodynamicsObj?.entropy as number) || (alchemicalResultObj?.entropy as number) || 0.5,
      reactivity: (thermodynamicsObj?.reactivity as number) || (alchemicalResultObj?.reactivity as number) || 0.5,
      energy: (thermodynamicsObj?.energy as number) || (alchemicalResultObj?.energy as number) || 0.5
    };
  } catch (error) {
    // console.error('Error in alchemize function:', error);
    // Fallback to simple implementation if there's an error
    const thermodynamicsObj = thermodynamics as Record<string, unknown>;
    return {
      ...elements,
      alchemicalProperties: {},
      transformedElementalProperties: elements,
      heat: (thermodynamicsObj?.heat as number) || 0.5,
      entropy: (thermodynamicsObj?.entropy as number) || 0.5,
      reactivity: (thermodynamicsObj?.reactivity as number) || 0.5,
      energy: 0.5
    };
  }
};

const calculateMatchScore = (elements: unknown): number => {
  if (!elements) return 0;
  
  // Extract elements data with safe property access
  const elementsData = elements as Record<string, unknown>;
  
  // More sophisticated calculation that weights the properties differently
  // Heat and reactivity are positive factors, while high entropy is generally a negative factor
  const heatScore = elementsData?.heat as number || 0;
  const entropyScore = 1 - (elementsData?.entropy as number || 0); // Invert entropy so lower is better
  const reactivityScore = elementsData?.reactivity as number || 0;
  
  // Calculate weighted average with more weight on heat and reactivity
  const rawScore = (heatScore * 0.4) + (entropyScore * 0.3) + (reactivityScore * 0.3);
  
  // Apply a higher multiplier to ensure clear differentiation between methods
  const multiplier = 2.5; // Higher multiplier for more obvious differences
  
  // Cap at 1.0 (100%) but ensure minimum of 0.1 (10%)
  return Math.min(1.0, Math.max(0.1, rawScore * multiplier));
};

// Define interfaces for thermodynamic properties
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  [key: string]: number;
}

// Define an interface for the astrologicalInfluences to fix the property access issue
export interface AstrologicalInfluence {
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  lunarPhaseEffect?: Record<string, number>;
  dominantPlanets?: string[];
  rulingPlanets?: string[] | string; // Allow both string and string array types
}

// Extend the AlchemicalItem interface to include astrologicalInfluences and culturalOrigin
export interface ExtendedAlchemicalItem extends AlchemicalItem {
  astrologicalInfluences?: AstrologicalInfluence;
  culturalOrigin?: string;
  bestFor?: string[];
  duration?: {
    min: number;
    max: number;
  };
  optimalTemperatures?: Record<string, number>;
  thermodynamicProperties?: ThermodynamicProperties;
  score?: number;
  scoreDetails?: {
    elemental?: number;
    astrological?: number;
    seasonal?: number;
    tools?: number;
    dietary?: number;
    cultural?: number;
    lunar?: number;
    venus?: number;
    total?: number;
  };
  // Ensure all AlchemicalItem properties are properly defined
  transformedElementalProperties: ElementalProperties;
  heat: number;
  entropy: number;
  reactivity: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  planetaryBoost: number;
  dominantPlanets: string[];
  kalchm: number;
  monica: number;
  // Add missing properties that are required
  elementalProperties: ElementalProperties;
  planetaryDignities: Record<string, PlanetaryDignityDetails>;
}

// Define cooking time recommendations by ingredient class
interface _CookingTimeRecommendation {
  ingredientClass: string;
  timeRange: string;
  tips: string;
}

// Add type-safe property access helper
function getMethodProperty<T extends keyof ExtendedAlchemicalItem>(
  method: ExtendedAlchemicalItem,
  property: T,
  defaultValue: ExtendedAlchemicalItem[T]
): ExtendedAlchemicalItem[T] {
  return method[property] !== undefined ? method[property] : defaultValue;
}

// Add this new interface for molecular gastronomy details
export interface MolecularGastronomyDetails {
  chemicalProcess: string;
  precisionRequirements: string;
  commonErrors: string[];
  advancedEquipment: string[];
  texturalOutcomes: string[];
}

// At the top level of your component file, before your component function
// Define the types if needed

// Add these methods if they're missing from your COOKING_METHOD_THERMODYNAMICS constant
const _ADDITIONAL_THERMODYNAMICS = Object.entries(allCookingMethods)
  .reduce((acc, [methodName, methodData]) => {
    // Extract method data with safe property access
    const methodDataObj = (methodData as unknown) as Record<string, unknown>;
    const thermodynamicProperties = methodDataObj?.thermodynamicProperties;
    
    if (methodData && thermodynamicProperties) {
      acc[methodName] = thermodynamicProperties as ThermodynamicProperties;
    }
    return acc;
  }, {} as Record<string, ThermodynamicProperties>);

// Merge with your existing COOKING_METHOD_THERMODYNAMICS constant

// Add this utility function to provide fallback information for any method
const _generateMethodInfo = (methodName: string): {
  description: string;
  technicalTips: string[];
  idealIngredients: string[];
  timing: {duration: string, temperature?: string};
  impact: {impact: string, benefits: string[], considerations: string[]};
} => {
  // Convert method name to human-readable form
  const readableName = methodName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Special case for hand pounding
  if (methodName === 'hand_pounding' || methodName === 'hand pounding') {
    return {
      description: "Hand pounding is an ancient culinary technique utilizing a mortar and pestle to crush, grind, and blend ingredients through direct mechanical force. This method releases aromatic compounds and creates unique textures that modern electric processors cannot replicate. Hand pounding preserves traditional knowledge and produces superior textural and flavor profiles in many global cuisines.",
      
      technicalTips: [
        "Use the weight of the pestle rather than excessive force - let gravity do the work",
        "Maintain proper grip to prevent fatigue and ensure control over the pounding motion",
        "Start with a gentle crushing motion before progressing to more forceful pounding",
        "Work in small batches for consistency and better control over the final texture",
        "Consider temperature - some ingredients release flavors better at room temperature"
      ],
      
      idealIngredients: [
        "Fresh herbs like basil, cilantro, and mint for vibrant pastes and sauces",
        "Whole spices requiring crushing (peppercorns, coriander, cumin)",
        "Fibrous aromatics such as lemongrass, galangal, and ginger",
        "Nuts and seeds for pastes and spreads (pine nuts, sesame)",
        "Starchy foods like boiled yams, plantains, and cassava for African fufu"
      ],
      
      timing: {
        duration: "2-15 minutes depending on desired texture and ingredient hardness",
        temperature: "Ambient temperature (most effective between 65-75°F/18-24°C)"
      },
      
      impact: {
        impact: "Significantly enhances flavor extraction and creates unique textures impossible with machine processing",
        benefits: [
          "Releases natural oils and aromatics through cell wall rupture",
          "Creates varied textural dimensions with both smooth and coarse elements",
          "Preserves heat-sensitive compounds that might be damaged by mechanical processing",
          "Develops complex emulsions through gradual ingredient incorporation",
          "Allows precise control over final consistency"
        ],
        considerations: [
          "Labor-intensive nature requires proper technique to prevent strain",
          "Small batch processing may extend overall preparation time for large quantities",
          "Different mortar materials (stone, wood, ceramic) interact differently with ingredients",
          "Requires washing between batches to prevent flavor contamination"
        ]
      }
    };
  }
  
  // Default values that make sense for most cooking methods
  return {
    description: `${readableName} is a cooking technique that transforms ingredients through specific application of heat, pressure, or chemical processes. It's characterized by its unique approach to food preparation that affects texture, flavor, and nutritional properties.`,
    
    technicalTips: [
      "Research proper temperature and timing for specific ingredients",
      "Ensure proper preparation of ingredients before cooking",
      "Monitor the cooking process regularly for best results",
      "Allow appropriate resting or cooling time after cooking",
      "Consider how this method interacts with your specific ingredients"
    ],
    
    idealIngredients: [
      "Ingredients suited to this specific cooking method",
      "Foods that benefit from this method's unique properties",
      "Items traditionally prepared with this technique",
      "Refer to specific recipes for best ingredient pairings"
    ],
    
    timing: {
      duration: "Varies by specific recipe and ingredient",
      temperature: "Refer to specific recipe for precise temperatures"
    },
    
    impact: {
      impact: "Variable impact depending on specific application",
      benefits: [
        "May enhance certain flavors or textures",
        "Could preserve specific nutrients depending on application",
        "Might improve digestibility of certain ingredients",
        "Often develops unique flavor compounds"
      ],
      considerations: [
        "Effects vary based on specific ingredients and timing",
        "Consider researching specific nutritional impacts for your ingredients",
        "Balance this cooking method with others for dietary variety"
      ]
    }
  };
};

// Add these at the top of the file (before the component function)
// Remove this placeholder constant
// const DEFAULT_TAROT_DATA = {
//   tarotCard: null,
//   tarotElementalInfluences: {
//     Fire: 0,
//     Water: 0,
//     Earth: 0,
//     Air: 0
//   }
// };

// First, let's add a utility function to convert between the different lunar phase formats
// Add this near the top of your file, after the imports

// Map between title case format and uppercase underscore format
// Lunar phase mapping for conversion
const LUNAR_PHASE_MAP: Record<string, LunarPhase> = {
  'FULL_MOON': 'full moon',
  'NEW_MOON': 'new moon',
  'WAXING_CRESCENT': 'waxing crescent',
  'FIRST_QUARTER': 'first quarter',
  'WAXING_GIBBOUS': 'waxing gibbous',
  'WANING_GIBBOUS': 'waning gibbous',
  'LAST_QUARTER': 'last quarter',
  'WANING_CRESCENT': 'waning crescent'
};

// For display purposes
const LUNAR_PHASE_DISPLAY: Record<LunarPhase, string> = {
  'full moon': 'Full Moon',
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous', 
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent'
};

// Function to safely convert any lunar phase string to the correct type
const _normalizeLunarPhase = (phase: string | null | undefined): LunarPhase | undefined => {
  if (!phase) return undefined;
  
  // Define valid lunar phases directly to avoid import conflicts
  const validLunarPhases: LunarPhase[] = [
    'new moon', 'waxing crescent', 'first quarter', 'waxing gibbous',
    'full moon', 'waning gibbous', 'last quarter', 'waning crescent'
  ];
  
  // If it's already a valid LunarPhase, return it
  if (validLunarPhases.includes(phase as LunarPhase)) {
    return phase as LunarPhase;
  }
  
  // Try to convert by looking for matching patterns
  const phaseLower = (phase as string)?.toLowerCase?.();
  
  if ((phaseLower as string)?.includes?.('full') && (phaseLower as string)?.includes?.('moon')) {
    return 'full moon';
  }
  if ((phaseLower as string)?.includes?.('new') && (phaseLower as string)?.includes?.('moon')) {
    return 'new moon';
  }
  if ((phaseLower as string)?.includes?.('waxing') && (phaseLower as string)?.includes?.('crescent')) {
    return 'waxing crescent';
  }
  if ((phaseLower as string)?.includes?.('first') && (phaseLower as string)?.includes?.('quarter')) {
    return 'first quarter';
  }
  if ((phaseLower as string)?.includes?.('waxing') && (phaseLower as string)?.includes?.('gibbous')) {
    return 'waxing gibbous';
  }
  if ((phaseLower as string)?.includes?.('waning') && (phaseLower as string)?.includes?.('gibbous')) {
    return 'waning gibbous';
  }
  if ((phaseLower as string)?.includes?.('last') && (phaseLower as string)?.includes?.('quarter')) {
    return 'last quarter';
  }
  if ((phaseLower as string)?.includes?.('waning') && (phaseLower as string)?.includes?.('crescent')) {
    return 'waning crescent';
  }
  
  return undefined;
};

// Helper for adapting between LunarPhase types
const _adaptLunarPhase = (phase: LunarPhase | undefined): unknown => {
  if (!phase) return undefined;
  // Convert from our uppercase format to the format expected by the API
  // This part needs to be adjusted based on what the external functions expect
  return formatLunarPhaseForDisplay(phase);
};


// Missing function definitions for CookingMethods component
function getIdealIngredients(method: ExtendedAlchemicalItem): string[] {
  // Replace placeholder implementation with proper ingredient extraction
  
  // First check if the method has an explicit idealIngredients property
  if (Array.isArray(method.idealIngredients)) {
    return method.idealIngredients;
  }
  
  // Check suitable_for property as it often contains ingredient categories
  if (method.suitable_for && isStringArray(method.suitable_for)) {
    return method.suitable_for;
  }
  
  // Extract from the cooking method's name and properties
  const methodName = getMethodProperty(method, 'name', '').toLowerCase();
  const methodId = getMethodProperty(method, 'id', '').toLowerCase();
  
  // Define ingredient associations based on cooking method characteristics
  const methodIngredientMap: Record<string, string[]> = {
    'baking': ['flour', 'eggs', 'dairy', 'sugars', 'bread', 'pastries', 'cakes'],
    'roasting': ['meat', 'poultry', 'vegetables', 'nuts', 'coffee beans'],
    'grilling': ['meat', 'fish', 'vegetables', 'corn', 'peppers'],
    'frying': ['potatoes', 'chicken', 'fish', 'tempura', 'doughnuts'],
    'steaming': ['vegetables', 'fish', 'dumplings', 'rice', 'dim sum'],
    'boiling': ['pasta', 'rice', 'eggs', 'vegetables', 'soup ingredients'],
    'sauteing': ['vegetables', 'mushrooms', 'garlic', 'onions', 'herbs'],
    'braising': ['tough meats', 'root vegetables', 'pot roasts', 'short ribs'],
    'poaching': ['eggs', 'fish', 'pears', 'delicate proteins'],
    'smoking': ['meats', 'fish', 'cheese', 'salt', 'salmon'],
    'fermenting': ['cabbage', 'milk', 'grapes', 'grains', 'vegetables'],
    'pickling': ['cucumbers', 'vegetables', 'fruits', 'vinegar solutions'],
    'raw': ['fish', 'vegetables', 'fruits', 'nuts', 'salad greens'],
    'sous_vide': ['precision proteins', 'vegetables', 'eggs', 'steaks'],
    'pressure_cooking': ['beans', 'grains', 'tough meats', 'stews'],
    'slow_cooking': ['stews', 'soups', 'pulled meats', 'casseroles']
  };
  
  // Check if we have a direct mapping
  for (const [cookingMethod, ingredients] of Object.entries(methodIngredientMap)) {
    if (methodName.includes(cookingMethod) || 
        methodId.includes(cookingMethod)) {
      return ingredients;
    }
  }
  
  // Extract from elemental properties if available
  const elementalProperties = getMethodProperty(method, 'elementalProperties', null) || getMethodProperty(method, 'elementalEffect', null);
  // Replace the problematic property access with safe access
  if (elementalProperties && isElementalPropertiesLocal(elementalProperties)) {
    const ingredients: string[] = [];
    
    // Map elements to ingredient types with safe access
    if (elementalProperties.Fire > 0.5) {
      ingredients.push('spices', 'peppers', 'grilled items', 'roasted foods');
    }
    if (elementalProperties.Water > 0.5) {
      ingredients.push('fish', 'seafood', 'soups', 'broths', 'steamed foods');
    }
    if (elementalProperties.Earth > 0.5) {
      ingredients.push('root vegetables', 'grains', 'legumes', 'mushrooms');
    }
    if (elementalProperties.Air > 0.5) {
      ingredients.push('leafy greens', 'herbs', 'light proteins', 'whipped items');
    }
    
    if (ingredients.length > 0) {
      return ingredients;
    }
  }
  
  // Fallback to general cooking ingredients
  return ['various ingredients', 'proteins', 'vegetables', 'seasonings'];
}

function determineMatchReason(method: ExtendedAlchemicalItem, zodiacSign?: string, lunarPhase?: string): string {
  // Enhanced match reason based on method properties and astrological factors
  const methodName = getMethodProperty(method, 'name', 'Unknown method');
  const reasons = [];
  
  // Check elemental properties
  const elementalEffect = getMethodProperty(method, 'elementalEffect', null);
  if (elementalEffect) {
    const dominantElement = Object.entries(elementalEffect)
      .reduce((max, [element, value]) => 
        (value as number) > (max.value as number) ? { element, value } : max, 
        { element: 'Fire', value: 0 }
      ).element;
    reasons.push(`Strong ${dominantElement} element alignment`);
  }
  
  // Check astrological factors
  const astrologicalInfluences = getMethodProperty(method, 'astrologicalInfluences', null);
  
  // Fix the astrological influences property access
  if (zodiacSign && astrologicalInfluences && 'favorableZodiac' in astrologicalInfluences && 
    Array.isArray(astrologicalInfluences.favorableZodiac) && 
    astrologicalInfluences.favorableZodiac.includes(zodiacSign as ZodiacSign)) {
    reasons.push(`Favorable for ${zodiacSign}`);
  }

  if (lunarPhase && astrologicalInfluences && 'lunarPhaseEffect' in astrologicalInfluences && 
    astrologicalInfluences.lunarPhaseEffect && 
    typeof astrologicalInfluences.lunarPhaseEffect === 'object' &&
    lunarPhase in astrologicalInfluences.lunarPhaseEffect) {
    const effect = (astrologicalInfluences.lunarPhaseEffect as Record<string, number>)[lunarPhase];
    if (effect > 1) {
      reasons.push(`Enhanced by ${lunarPhase} moon`);
    }
  }
  
  // Check thermodynamic properties
  const thermodynamicProperties = getMethodProperty(method, 'thermodynamicProperties', null);
  if (thermodynamicProperties) {
    const { heat, entropy, reactivity } = thermodynamicProperties;
    if (heat > 0.7) reasons.push('High energy transformation');
    if (entropy < 0.3) reasons.push('Stable cooking process');
    if (reactivity > 0.6) reasons.push('Dynamic flavor development');
  }
  
  return reasons.length > 0 
    ? reasons.join(', ')
    : `Compatible with ${methodName} technique`;
}

// Missing variable declarations
const planets = {
  Sun: "sun",
  Moon: "moon",
  Mercury: "mercury",
  Venus: "venus",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn"
};

// Add local type guard for isStringWithIncludes
function isStringWithIncludes(value: unknown): value is string {
  return typeof value === 'string';
}

// Add definition for getPlanetaryPositionSafely
function getPlanetaryPositionSafely(state: Record<string, unknown>, planet: string): unknown {
  return state?.planetaryPositions?.[planet] || {};
}

// Add type guard after imports
function isExtendedAlchemicalItem(value: unknown): value is ExtendedAlchemicalItem {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string';
}

// Add type guard after imports
function isStandardizedAlchemicalResult(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Add type guard for string array
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Rename the local function to avoid import conflict
function isElementalPropertiesLocal(value: unknown): value is ElementalProperties {
  return typeof value === 'object' && value !== null &&
    'Fire' in value && typeof (value as unknown).Fire === 'number' &&
    'Water' in value && typeof (value as unknown).Water === 'number' &&
    'Earth' in value && typeof (value as unknown).Earth === 'number' &&
    'Air' in value && typeof (value as unknown).Air === 'number';
}

// Add type guard for planetary position data
function isPlanetaryPositionData(value: unknown): value is PlanetaryPositionData {
  return typeof value === 'object' && value !== null &&
    'sign' in value && typeof (value as unknown).sign === 'string' &&
    'degree' in value && typeof (value as unknown).degree === 'number';
}

// Add type guard for source data
function isCookingMethodSourceData(value: unknown): value is CookingMethodSourceData {
  return typeof value === 'object' && value !== null;
}

// Add MethodDetails interface definition
interface MethodDetails {
  elementalProperties: ElementalProperties;
  elementalEffect: ElementalProperties;
  idealIngredients: string[];
  suitableFor: string[];
  benefits: string[];
  tools: string[];
  duration: { min: number; max: number };
  astrological: Record<string, unknown>;
  culturalOrigin: string;
}

export default function CookingMethods() {
  // Add renderCount ref for debugging
  const renderCount = useRef(0);
  // Use ref for tracking component mounted state
  const isMountedRef = useRef(false);
  const [_isMounted, setIsMounted] = useState(false);
  
  // Increment render count on each render for debugging
  useEffect(() => {
    renderCount.current += 1;
  });
  
  // Set mounted state when component mounts
  useEffect(() => {
    isMountedRef.current = true;
    setIsMounted(true);
    
    // Fetch methods when component mounts
    fetchMethods();
    
    return () => {
      isMountedRef.current = false;
      setIsMounted(false);
    };
  }, []); // Remove fetchMethods from dependency array to fix the issue
  
  // Get astrological state
  const {
    currentZodiac,
    currentPlanetaryAlignment,
    lunarPhase,
    activePlanets,
    domElements,
    isDaytime
  } = useAstrologicalState();
  
  const { chart } = useCurrentChart();
  
  // Define the list of 14 common cooking methods to prioritize
  const commonCookingMethods = useMemo(() => [
    'baking', 'roasting', 'grilling', 'broiling', 'sauteing', 
    'frying', 'stir_frying', 'boiling', 'simmering', 'steaming', 
    'poaching', 'sous_vide', 'stewing', 'blanching', 'microwaving'
  ], []);
  
  // Helper functions for the component
  const normalizeAstroState = () => {
    return {
      currentZodiac,
      lunarPhase,
      activePlanets,
      isDaytime,
      currentPlanetaryAlignment
    };
  };
  
  // Use the local ExtendedAlchemicalItem interface defined above
  const methodToThermodynamics = (method: ExtendedAlchemicalItem): BasicThermodynamicProperties => {
    const methodName = getMethodProperty(method, 'name', '').toLowerCase();
    // Check if the method has direct thermodynamic properties
    if (
      typeof method.heat === 'number' &&
      typeof method.entropy === 'number' &&
      typeof method.reactivity === 'number'
    ) {
      const heat = method.heat || 0.5;
      const entropy = method.entropy || 0.5;
      const reactivity = method.reactivity || 0.5;
      return {
        heat,
        entropy,
        reactivity,
        gregsEnergy: heat - (entropy * reactivity)
      };
    }
    // Look for the method in the COOKING_METHOD_THERMODYNAMICS constant
    for (const knownMethod of Object.keys(COOKING_METHOD_THERMODYNAMICS)) {
      if (methodName?.includes?.(knownMethod)) {
        return COOKING_METHOD_THERMODYNAMICS[knownMethod];
      }
    }
    // Fallback values based on method characteristics
    if (methodName?.includes?.('grill') || methodName?.includes?.('roast') || methodName?.includes?.('fry')) {
      const heat = 0.8, entropy = 0.6, reactivity = 0.7;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // High heat methods
    } else if (methodName?.includes?.('steam') || methodName?.includes?.('simmer') || methodName?.includes?.('poach')) {
      const heat = 0.4, entropy = 0.3, reactivity = 0.5;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // Medium heat methods
    } else if (methodName?.includes?.('raw') || methodName?.includes?.('ferment') || methodName?.includes?.('pickle')) {
      const heat = 0.1, entropy = 0.5, reactivity = 0.4;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // No/low heat methods
    }
    // Default values
    const heat = 0.5, entropy = 0.5, reactivity = 0.5;
    return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) };
  };

  const [loading, setLoading] = useState(true);
  const [recommendedMethods, setRecommendedMethods] = useState<ExtendedAlchemicalItem[]>([]);
  const [planetaryCookingMethods, setPlanetaryCookingMethods] = useState<Record<string, string[]>>({});
  const [selectedCulture, setSelectedCulture] = useState<string>(''); // For culture filtering
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [expandedMolecular, setExpandedMolecular] = useState<Record<string, boolean>>({});
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  // Add a new state to store the initial scores
  const [methodScores, setMethodScores] = useState<Record<string, number>>({});

  // Remove placeholder tarot data and use proper calculations
  // const [tarotData] = useState(DEFAULT_TAROT_DATA);
  // const { tarotCard, tarotElementalInfluences } = useTarotContext();
  
  // Replace temporary fallback values with proper tarot calculations
  // const tarotCard = null;
  // const tarotElementalInfluences = {
  //   Fire: 0,
  //   Water: 0,
  //   Earth: 0,
  //   Air: 0
  // };

  // Use proper tarot calculations based on current date and astrological state
  const [tarotCard, setTarotCard] = useState<unknown>(null);
  const [tarotElementalInfluences, setTarotElementalInfluences] = useState<{
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  }>({
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  });

  // Calculate tarot influences based on astrological state
  useEffect(() => {
    const calculateTarotInfluences = async () => {
      try {
        // Import tarot calculation functions
        const { getTarotCardsForDate } = await import('@/lib/tarotCalculations');
        const { getElementalAlignmentFromTarot } = await import('@/utils/tarotUtils');
        
        const _currentDate = new Date();
        
        // Get sun position from astrological state for more accurate calculations
        let sunPosition;
        const planetaryPositions = currentPlanetaryAlignment as unknown as Record<string, unknown>;
        const sunData = getPlanetaryPositionSafely({ planetaryPositions }, 'Sun') as Record<string, unknown>;
        const moonData = getPlanetaryPositionSafely({ planetaryPositions }, 'Moon') as Record<string, unknown>;

        if (sunData && isPlanetaryPositionData(sunData)) {
          sunPosition = {
            sign: sunData.sign || currentZodiac || 'aries',
            degree: sunData.degree || 15
          };
        }
        
        // Calculate tarot cards for current date
        const tarotCards = getTarotCardsForDate(currentDate, sunPosition);
        
        // Set the primary tarot card (minor arcana)
        setTarotCard(tarotCards.minorCard);
        
        // Calculate elemental influences from tarot cards
        const elementalInfluences = getElementalAlignmentFromTarot({
          majorArcana: tarotCards.majorCard ? [tarotCards.majorCard.name] : [],
          minorArcana: tarotCards.minorCard ? [tarotCards.minorCard.name] : []
        });
        
        setTarotElementalInfluences(elementalInfluences);
        
      } catch (error) {
        // console.error('Error calculating tarot influences:', error);
        // Only set minimal fallback values on error
        setTarotCard(null);
        setTarotElementalInfluences({
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        });
      }
    };

    calculateTarotInfluences();
  }, [currentPlanetaryAlignment, currentZodiac]);

  // Add state for modality filtering
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  // Add these near the top with other state variables
  const [searchIngredient, setSearchIngredient] = useState<string>('');
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});
  const [showDebug, setShowDebug] = useState(false);

  // Add this function to calculate ingredient compatibility with methods
  const calculateIngredientCompatibility = (ingredient: string) => {
    if (!ingredient.trim()) return;
    
    // Create a compatibility map
    const compatibilityMap: Record<string, number> = {};
    
    recommendedMethods.forEach(method => {
      if (isElementalPropertiesLocal(method.elementalProperties)) {
        // Create basic compatibility score based on elemental properties
        // This is a simplified version - you would use your actual compatibility calculation
        let compatibilityScore = 0.5; // Default medium compatibility
        
        // Check if ingredient is in the method's suitable_for list with safe array access
        const suitableFor = getMethodProperty(method, 'suitable_for', []);
        if (Array.isArray(suitableFor) && suitableFor.some(item => 
          isStringWithIncludes(item) && isStringWithIncludes(ingredient) && 
          item.toLowerCase().includes(ingredient.toLowerCase())
        )) {
          compatibilityScore += 0.3; // Big boost for explicitly suitable ingredients
        }
        
        // Store the compatibility score
        const methodKey = getMethodProperty(method, 'id', '') || getMethodProperty(method, 'name', '');
        compatibilityMap[methodKey] = Math.min(1.0, compatibilityScore);
      }
    });
    
    // Update state with the compatibility scores
    setIngredientCompatibility(compatibilityMap);
  };

  // Toggle molecular details expansion
  const toggleMolecular = useCallback((methodId: string) => {
    setExpandedMolecular(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  }, []);

  // Toggle method expansion
  const toggleMethodExpansion = useCallback((methodId: string) => {
    // Only toggle the expanded state without recalculating any scores
    setExpandedMethods(prev => {
      const newExpandedMethods = { ...prev };
      // Toggle the expanded state for this method
      newExpandedMethods[methodId] = !prev[methodId];
      return newExpandedMethods;
    });
    // No other state updates or calculations should happen here
  }, []);

  // Toggle show all methods
  const toggleShowAllMethods = useCallback(() => {
    setShowAllMethods(prev => !prev);
  }, []);

  // Initialize a culturalCookingMap for filtering
  const culturalCookingMap = useMemo(() => {
    // Create a map of culture -> method IDs
    const map: Record<string, string[]> = { 'Traditional': [] };
    
    try {
      culturalCookingMethods.forEach(method => {
        const culture = method.culturalOrigin || 'Traditional';
        if (!map[culture]) {
          map[culture] = [];
        }
        map[culture].push((method as unknown)?.id);
      });
      
      return map;
    } catch (error) {
      // console.error("Error initializing culture map:", error);
      return map;
    }
  }, []);

  // Get global astrological adjustment info
  const globalAstrologicalAdjustment = useMemo(() => {
    const _zodiacSign = currentZodiac;
    return { zodiacSign };
  }, [currentZodiac]);

  // Update getThermodynamicEffect to indicate transformation
  const getThermodynamicEffect = (value: number): {
    effect: 'increases' | 'slightly increases' | 'neutral' | 'slightly decreases' | 'decreases';
    intensity: number;
    description: string;
  } => {
    // Create more precise descriptions based on ranges
    if (value >= 0.9) {
      return {
        effect: 'increases',
        intensity: 5,
        description: 'Dramatically transforms through increased'
      };
    } else if (value >= 0.75) {
      return {
        effect: 'increases',
        intensity: 4,
        description: 'Significantly enhances'
      };
    } else if (value >= 0.6) {
      return {
        effect: 'increases',
        intensity: 3,
        description: 'Moderately elevates'
      };
    } else if (value >= 0.45) {
      return {
        effect: 'slightly increases',
        intensity: 2,
        description: 'Gently increases'
      };
    } else if (value >= 0.3) {
      return {
        effect: 'neutral',
        intensity: 1,
        description: 'Minimally affects'
      };
    } else if (value >= 0.15) {
      return {
        effect: 'slightly decreases',
        intensity: 1,
        description: 'Subtly reduces'
      };
    } else {
      return {
        effect: 'decreases',
        intensity: 0,
        description: 'Significantly limits'
      };
    }
  };

  // Improve access to thermodynamic properties
  function getThermodynamicValue(method: ExtendedAlchemicalItem, property: keyof ThermodynamicProperties): number {
    const thermodynamics = getMethodProperty(method, 'thermodynamicProperties', { heat: 0, entropy: 0, reactivity: 0 });
    return thermodynamics[property] || 0;
  }

  const getMolecularDetails = (method: ExtendedAlchemicalItem): MolecularGastronomyDetails | null => {
    if (!method || !method.name) return null;
    
    const name = getMethodProperty(method, 'name', '');
    switch (name.toLowerCase()) {
      case 'spherification':
        return {
          chemicalProcess: 'Ionic cross-linking of alginate with calcium ions',
          precisionRequirements: 'Exact ratios: 0.5% sodium alginate, 0.5% calcium chloride',
          commonErrors: ['Uneven spheres', 'Too soft centers', 'Air bubbles'],
          advancedEquipment: ['Precision scale (0.01g)', 'Immersion blender', 'Spherical molds'],
          texturalOutcomes: ['Liquid core with thin gel membrane', 'Burst-in-mouth effect']
        };
      case 'molecular_gelation':
        return {
          chemicalProcess: 'Cross-linking of proteins or polysaccharides',
          precisionRequirements: 'Precise pH, temperature, and time',
          commonErrors: ['Gel too soft or hard', 'Incomplete cross-linking'],
          advancedEquipment: ['pH meters', 'Immersion circulators', 'Precision scales'],
          texturalOutcomes: ['Unique textures and gels']
        };
      case 'cryo_emulsification':
        return {
          chemicalProcess: 'Freezing and thawing to break down fat globules',
          precisionRequirements: 'Exact freezing and thawing cycles',
          commonErrors: ['Ice crystals too large', 'Emulsion instability'],
          advancedEquipment: ['Immersion circulators', 'Precision scales', 'pH meters'],
          texturalOutcomes: ['Thin, stable emulsions']
        };
      case 'micro_dosing':
        return {
          chemicalProcess: 'Precise measurement of small quantities of ingredients',
          precisionRequirements: 'High-precision scales and equipment',
          commonErrors: ['Inaccurate measurements', 'Contamination'],
          advancedEquipment: ['Precision scales (0.001g)', 'pH meters', 'Immersion circulators'],
          texturalOutcomes: ['Novel textures and flavors']
        };
      case 'molecular_spherification':
        return {
          chemicalProcess: 'Ionic cross-linking of alginate with calcium ions',
          precisionRequirements: 'Exact ratios: 0.5% sodium alginate, 0.5% calcium chloride',
          commonErrors: ['Uneven spheres', 'Too soft centers', 'Air bubbles'],
          advancedEquipment: ['Precision scale (0.01g)', 'Immersion blender', 'Spherical molds'],
          texturalOutcomes: ['Liquid core with thin gel membrane', 'Burst-in-mouth effect']
        };
      case 'molecular_gellation':
        return {
          chemicalProcess: 'Cross-linking of proteins or polysaccharides',
          precisionRequirements: 'Precise pH, temperature, and time',
          commonErrors: ['Gel too soft or hard', 'Incomplete cross-linking'],
          advancedEquipment: ['pH meters', 'Immersion circulators', 'Precision scales'],
          texturalOutcomes: ['Unique textures and gels']
        };
      case 'molecular_cryo_emulsification':
        return {
          chemicalProcess: 'Freezing and thawing to break down fat globules',
          precisionRequirements: 'Exact freezing and thawing cycles',
          commonErrors: ['Ice crystals too large', 'Emulsion instability'],
          advancedEquipment: ['Immersion circulators', 'Precision scales', 'pH meters'],
          texturalOutcomes: ['Thin, stable emulsions']
        };
      case 'molecular_micro_dosing':
        return {
          chemicalProcess: 'Precise measurement of small quantities of ingredients',
          precisionRequirements: 'High-precision scales and equipment',
          commonErrors: ['Inaccurate measurements', 'Contamination'],
          advancedEquipment: ['Precision scales (0.001g)', 'pH meters', 'Immersion circulators'],
          texturalOutcomes: ['Novel textures and flavors']
        };
      default:
        return null;
    }
  };

  // Add this function to extract additional properties from source data
  const getMethodSpecificData = (method: ExtendedAlchemicalItem) => {
    const methodId = getMethodProperty(method, 'id', '');
    if (methodId && cookingMethods[methodId as keyof typeof cookingMethods]) {
      const sourceData = cookingMethods[methodId as keyof typeof cookingMethods] as Record<string, unknown>;
      
      return {
        benefits: Array.isArray(sourceData?.benefits) ? sourceData.benefits : [],
        chemicalChanges: sourceData?.chemicalChanges || {},
        safetyFeatures: Array.isArray(sourceData?.safetyFeatures) ? sourceData.safetyFeatures : [],
        nutrientRetention: sourceData?.nutrientRetention || {},
        regionalVariations: sourceData?.regionalVariations || {},
        astrologicalInfluences: sourceData?.astrologicalInfluences || {}
      };
    }
    
    // Check if it's a molecular method
    const methodName = getMethodProperty(method, 'name', '').toLowerCase();
    const isMolecular = isStringWithIncludes(methodName) && (
      methodName.includes('spher') || 
      methodName.includes('gel') || 
      methodName.includes('emuls') || 
      methodName.includes('cryo')
    );
    
    if (isMolecular) {
      // Try to find in molecular methods
      const molecularKey = Object.keys(molecularCookingMethods).find(
        key => isStringWithIncludes(methodName) && methodName.includes(key.toLowerCase())
      );
      
      if (molecularKey && molecularCookingMethods[molecularKey as keyof typeof molecularCookingMethods]) {
        const sourceData = molecularCookingMethods[molecularKey as keyof typeof molecularCookingMethods] as Record<string, unknown>;
        
        return {
          benefits: Array.isArray(sourceData?.benefits) ? sourceData.benefits : [],
          chemicalChanges: sourceData?.chemicalChanges || {},
          toolsRequired: Array.isArray(sourceData?.toolsRequired) ? sourceData.toolsRequired : [],
          optimalTemperatures: sourceData?.optimalTemperatures || {}
        };
      }
    }
    
    return null;
  };

  // First, add this new helper function to get detailed examples for each cooking method
  const getMethodDetails = (method: ExtendedAlchemicalItem): MethodDetails => {
    const _elementalProps = getMethodProperty(method, 'elementalProperties', { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as ElementalProperties;
    const elementalEffect = getMethodProperty(method, 'elementalEffect', { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as ElementalProperties;
    
    return {
      elementalProperties: elementalProps,
      elementalEffect: elementalEffect,
      idealIngredients: getMethodProperty(method, 'idealIngredients', []) as string[],
      suitableFor: getMethodProperty(method, 'suitable_for', []) as string[],
      benefits: getMethodProperty(method, 'benefits', []) as string[],
      tools: getMethodProperty(method, 'toolsRequired', []) as string[],
      duration: getMethodProperty(method, 'duration', { min: 0, max: 0 }) as { min: number; max: number },
      astrological: getMethodProperty(method, 'astrologicalInfluences', {}) as Record<string, unknown>,
      culturalOrigin: getMethodProperty(method, 'culturalOrigin', '') as string
    };
  };

  // Replace getNutritionalImpact function with getIngredientCompatibility
  const getIngredientCompatibility = (method: ExtendedAlchemicalItem): { 
    compatibility: string, 
    idealCharacteristics: string[],
    avoidCharacteristics: string[]
  } => {
    const name = getMethodProperty(method, 'name', '').toLowerCase();
    let compatibility = "";
    let idealCharacteristics: string[] = [];
    let avoidCharacteristics: string[] = [];
    
    // Generate compatibility based on method type
    if (isStringWithIncludes(name)) {
      if (name.includes('fry')) {
        compatibility = "High heat methods work best with ingredients that can withstand temperature shock";
        idealCharacteristics = ['High moisture foods', 'Sturdy proteins', 'Starchy vegetables'];
        avoidCharacteristics = ['Delicate herbs', 'Soft fruits', 'Thin fish fillets'];
      } else if (name.includes('roast')) {
        compatibility = "Dry heat methods enhance natural flavors through caramelization";
        idealCharacteristics = ['Dense vegetables', 'Whole proteins', 'Root vegetables'];
        avoidCharacteristics = ['Leafy greens', 'Soft cheeses', 'Liquid-based items'];
      } else if (name.includes('steam')) {
        compatibility = "Gentle cooking preserves nutrients and delicate textures";
        idealCharacteristics = ['Delicate vegetables', 'Fish', 'Dumplings'];
        avoidCharacteristics = ['Items needing browning', 'Tough meats', 'Dense root vegetables'];
      } else if (name.includes('braise')) {
        compatibility = "Combination method perfect for transforming tough ingredients";
        idealCharacteristics = ['Tough cuts of meat', 'Fibrous vegetables', 'Sturdy grains'];
        avoidCharacteristics = ['Delicate fish', 'Quick-cooking vegetables', 'Tender cuts'];
      } else {
        compatibility = `${getMethodProperty(method, 'name', 'Unknown method')} works best with ingredients suited to its thermal profile`;
        idealCharacteristics = ['Suitable proteins', 'Compatible vegetables', 'Appropriate seasonings'];
        avoidCharacteristics = ['Incompatible textures', 'Unsuitable moisture levels'];
      }
    } else {
      compatibility = "This cooking method requires careful ingredient selection";
      idealCharacteristics = ['Suitable ingredients'];
      avoidCharacteristics = ['Incompatible ingredients'];
    }
    
    return {
      compatibility,
      idealCharacteristics,
      avoidCharacteristics
    };
  };

  // Add this function to generate method-specific elemental properties
  const getMethodElementalProperties = (method: ExtendedAlchemicalItem) => {
    const methodName = getMethodProperty(method, 'name', '').toLowerCase();
    
    // First check if the method has explicit elemental properties
    const methodElementalProps = getMethodProperty(method, 'elementalProperties', null);
    if (isElementalPropertiesLocal(methodElementalProps)) {
      return methodElementalProps;
    }
    
    // Generate elemental properties based on method name patterns
    const elementalEffect: _ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
    
    if (isStringWithIncludes(methodName)) {
      if (methodName.includes('solenije') || methodName.includes('pickle')) {
        return {
          Fire: 0.1,
          Water: 0.4,
          Earth: 0.4,
          Air: 0.1
        };
      } else if (methodName.includes('confit')) {
        return {
          Fire: 0.3,
          Water: 0.1,
          Earth: 0.5,
          Air: 0.1
        };
      } else if (methodName.includes('tagine')) {
        return {
          Fire: 0.4,
          Water: 0.2,
          Earth: 0.3,
          Air: 0.1
        };
      } else if (methodName.includes('nixtamal')) {
        return {
          Fire: 0.2,
          Water: 0.3,
          Earth: 0.4,
          Air: 0.1
        };
      }
    }
    
    // Return default elemental effect if no specific patterns match
    const methodElementalEffect = getMethodProperty(method, 'elementalEffect', null);
    return methodElementalEffect || elementalEffect;
  };

  // Add import for our utility function at the top of the component
  const { getTechnicalTips: getMethodTips } = require('../utils/cookingMethodTips');

  // Add a function to determine which modality a cooking method best complements
  const getMethodModalityAffinity = (method: ExtendedAlchemicalItem): _Modality => {
    // If the method has higher Fire/Air values, it's likely Cardinal
    // If it has higher Earth/Water values, it's likely Fixed
    // If it has balanced elements, it's likely Mutable
    const elementalEffect = getMethodProperty(method, 'elementalEffect', {});
    
    let cardinalSum = 0;
    let fixedSum = 0;
    let mutableSum = 0;

    if (isElementalPropertiesLocal(elementalEffect)) {
      cardinalSum = elementalEffect.Fire + elementalEffect.Air;
      fixedSum = elementalEffect.Earth + elementalEffect.Water;
      mutableSum = (elementalEffect.Fire + elementalEffect.Water + elementalEffect.Earth + elementalEffect.Air) / 4;
    }
    
    if (cardinalSum > fixedSum + 0.2) {
      return 'Cardinal';
    } else if (fixedSum > cardinalSum + 0.2) {
      return 'Fixed';
    } else {
      return 'Mutable';
    }
  };

  // State for component expansion
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Function to toggle expansion
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Debug panel state is already declared above
  
  // Add this function to run our test
  const runDebugTest = useCallback(() => {
    // console.log("Running cooking method recommendations test...");
    testCookingMethodRecommendations();
  }, []);
  
  // Update the fetchMethods function to use isMountedRef
  const fetchMethods = async () => {
    try {
      setLoading(true);
      
      const astroState = normalizeAstroState();
      
      // Get the cooking methods with default thermodynamic properties
      const baseMethods: ExtendedAlchemicalItem[] = Object.entries(cookingMethods).map(([key, method]: [string, any]) => {
        return {
          ...method,
          id: key,
          name: key.replace(/_/g, ' '),
          gregsEnergy: 0.5, // Default value, will be updated below
          matchReason: '',
          // Ensure all required ExtendedAlchemicalItem properties are present
          elementalProperties: method.elementalProperties ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          alchemicalProperties: method.alchemicalProperties ?? { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
          transformedElementalProperties: method.transformedElementalProperties ?? method.elementalProperties ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          heat: method.heat ?? 0.5,
          entropy: method.entropy ?? 0.5,
          reactivity: method.reactivity ?? 0.5,
          dominantElement: method.dominantElement ?? 'Fire',
          dominantAlchemicalProperty: method.dominantAlchemicalProperty ?? 'Spirit',
          planetaryBoost: method.planetaryBoost ?? 1.0,
          dominantPlanets: method.dominantPlanets ?? (method.astrologicalInfluences?.dominantPlanets ?? []),
          kalchm: method.kalchm ?? 1.0,
          monica: method.monica ?? 1.0,
          planetaryDignities: method.planetaryDignities ?? {},
          energy: method.energy ?? 0.5
        } as ExtendedAlchemicalItem;
      });
      
      // Process methods in parallel using Promise.all
      const methodsWithScores = await Promise.all(
        baseMethods.map(async (method) => {
          // Get thermodynamic properties for this method
          const thermodynamics = methodToThermodynamics(method);
          
          // Create methodWithThermodynamics with proper type safety and all required properties
          const methodWithThermodynamics: ExtendedAlchemicalItem = {
            id: method.id || method.name || 'unknown',
            name: method.name || 'Unknown Method',
            elementalProperties: method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            alchemicalProperties: { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
            transformedElementalProperties: method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            heat: getThermodynamicValue(method, 'heat'),
            entropy: getThermodynamicValue(method, 'entropy'),
            reactivity: getThermodynamicValue(method, 'reactivity'),
            gregsEnergy: 0, // Will be calculated
            dominantElement: 'Fire' as ElementalCharacter,
            dominantAlchemicalProperty: 'Spirit' as AlchemicalProperty,
            planetaryBoost: 1.0,
            dominantPlanets: method.dominantPlanets || [],
            kalchm: 1.0,
            monica: 1.0,
            planetaryDignities: method.planetaryDignities || {} as Record<string, PlanetaryDignityDetails>,
            energy: 0.5,
            matchReason: '',
            thermodynamicProperties: {
              heat: getThermodynamicValue(method, 'heat'),
              entropy: getThermodynamicValue(method, 'entropy'),
              reactivity: getThermodynamicValue(method, 'reactivity'),
              gregsEnergy: 0 // Will be calculated
            } as ThermodynamicProperties,
            // Include all other properties from the original method
            ...method
          };
          
          try {
            // Calculate transformed alchemical properties
            const _elementalProps = method.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
            const elementalEffect = method.elementalEffect || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
            const alchemized = await alchemize(
              _elementalProps,
              astroState,
              thermodynamics
            );
            
            // Calculate match score with enhanced algorithm for better differentiation
            const baseScore = calculateMatchScore(alchemized);
            
            // Add additional factors to differentiate scores
            let adjustedScore = baseScore;
            
            // Add zodiac sign affinity bonus/penalty - larger bonus for better differentiation
            const astroStateTyped = astroState as Record<string, unknown> | null;
            const zodiacSign = astroStateTyped?.zodiacSign;
            const lunarPhase = astroStateTyped?.lunarPhase;
            
            // Safely check astrological influences with proper type guards
            if (zodiacSign && method.astrologicalInfluences && 
                'favorableZodiac' in method.astrologicalInfluences && 
                Array.isArray(method.astrologicalInfluences.favorableZodiac) &&
                method.astrologicalInfluences.favorableZodiac.includes(zodiacSign as ZodiacSign)) {
              adjustedScore += 0.2; // Increased from 0.15 for better differentiation
            } else if (zodiacSign && method.astrologicalInfluences && 
                       'unfavorableZodiac' in method.astrologicalInfluences && 
                       Array.isArray(method.astrologicalInfluences.unfavorableZodiac) &&
                       method.astrologicalInfluences.unfavorableZodiac.includes(zodiacSign as ZodiacSign)) {
              adjustedScore -= 0.15; // Made penalty stronger
            }
            
            // Add lunar phase adjustment with stronger effect
            if (lunarPhase) {
              const lunarMultiplier = getLunarMultiplier(lunarPhase as LunarPhase);
              // Apply a more significant adjustment
              adjustedScore = adjustedScore * (0.8 + (lunarMultiplier * 0.4)); // More impactful adjustment
            }
            
            // Add random variation to break up methods that would otherwise get the same score
            // But only during initial calculation, not on re-renders
            const jitter = Math.random() * 0.05; // Small random factor - will be saved in methodScores state
            adjustedScore += jitter;
            
            // Cap the score at 1.0 maximum and minimum of 0.1
            const finalScore = Math.min(1.0, Math.max(0.1, adjustedScore));
            
            // Generate a reason for the match
            const matchReason = determineMatchReason(methodWithThermodynamics, zodiacSign as string, lunarPhase as string);
            
            return {
              ...methodWithThermodynamics,
              alchemicalProperties: alchemized.alchemicalProperties,
              transformedElementalProperties: alchemized.transformedElementalProperties,
              heat: alchemized.heat,
              entropy: alchemized.entropy,
              reactivity: alchemized.reactivity,
              energy: alchemized.energy,
              gregsEnergy: finalScore,
              matchReason,
              // Ensure all required properties are present
              dominantElement: 'Fire' as ElementalCharacter, // Default value
              dominantAlchemicalProperty: 'Spirit' as AlchemicalProperty, // Default value
              planetaryBoost: 1.0, // Default value
              kalchm: 1.0, // Default value
              monica: 1.0, // Default value
              planetaryDignities: method.planetaryDignities || {} as Record<string, PlanetaryDignityDetails>,
            } as ExtendedAlchemicalItem;
          } catch (err) {
            // console.error(`Error processing method ${getMethodProperty(method, 'name', 'unknown')}:`, err);
            return {
              ...methodWithThermodynamics,
              gregsEnergy: 0.5, // Fallback
              matchReason: 'No specific cosmic alignment',
              // Ensure all required properties are present
              dominantElement: 'Fire' as ElementalCharacter, // Default value
              dominantAlchemicalProperty: 'Spirit' as AlchemicalProperty, // Default value
              planetaryBoost: 1.0, // Default value
              kalchm: 1.0, // Default value
              monica: 1.0, // Default value
              planetaryDignities: method.planetaryDignities || {} as Record<string, PlanetaryDignityDetails>,
            } as ExtendedAlchemicalItem;
          }
        })
      );
      
      // Sort methods by gregsEnergy score in descending order
      const sortedMethods = methodsWithScores
        .sort((a, b) => b.gregsEnergy - a.gregsEnergy);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setRecommendedMethods(sortedMethods);
        
        // Also set planetary cooking methods with safe array access
        const planetaryCookingMethodsMap: Record<string, string[]> = {};
        if (Array.isArray(planets)) {
          planets.forEach(planet => {
            const methodsForPlanet = sortedMethods
              .filter(method => 
                method.astrologicalInfluences?.dominantPlanets?.includes(planet)
              )
              .map(method => getMethodProperty(method, 'name', ''));
            
            if (methodsForPlanet.length > 0) {
              planetaryCookingMethodsMap[planet] = methodsForPlanet;
            }
          });
        }
        
        setPlanetaryCookingMethods(planetaryCookingMethodsMap);
        
        // Store the initial scores in our state AFTER sorting the methods
        // Use method id or name as a more reliable key instead of index
        const scoreMap: Record<string, number> = {};
        sortedMethods.forEach((method) => {
          const scoreKey = getMethodProperty(method, 'id', '') || getMethodProperty(method, 'name', '');
          scoreMap[scoreKey] = method.gregsEnergy || 0.5;
        });
        setMethodScores(scoreMap);
        
        setLoading(false);
      }
    } catch (error) {
      // console.error('Error fetching cooking methods:', error);
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-white text-lg">Aligning cooking methods with celestial energies...</p>
      </div>
    );
  }

  // Increment render count once per render, but don't log it
  renderCount.current += 1;

  // Add this at the end of the component, just before the final return
  const renderDebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-8 p-4 border border-gray-300 rounded">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Developer Tools</h3>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDebug ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showDebug && (
          <div className="mt-4">
            <button
              onClick={runDebugTest}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
            >
              Test Cooking Method Recommendations
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Check browser console for detailed logs
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Update the culture selector handler
  const handleCultureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCulture = e.target.value;
    setSelectedCulture(newCulture);
    // Refetch methods with the new culture filter
    fetchMethods();
  };
  
  // Add a new state to control the display of score details
  const [showScoreDetails, setShowScoreDetails] = useState<Record<string, boolean>>({});

  // Enhance the renderMethodCard function to display score details
  const renderMethodCard = (method: ExtendedAlchemicalItem) => {
    if (!method || !method.name) return null;

    const scoreDetails = getMethodProperty(method, 'scoreDetails', {});
    const totalScore = getMethodProperty(method, 'score', 0);

    const toggleScoreDetails = (e: React.MouseEvent, methodName: string) => {
      e.stopPropagation();
      setShowScoreDetails(prev => ({
        ...prev,
        [methodName]: !prev[methodName]
      }));
    };

    // Add this inside the method card JSX, before the closing div
    return (
      <div 
        key={getMethodName(method)}
        className={`${styles?.methodCard || ''} ${isExpanded[getMethodName(method)] ? styles.expanded : ''}`}
        onClick={() => toggleMethodExpansion(getMethodName(method))}
      >
        <div className={styles.methodHeader}>
          <h3 className={styles.methodName}>{getMethodName(method)}</h3>
          
          <div className={styles.scoreHeader} onClick={(e) => toggleScoreDetails(e, getMethodName(method))}>
            <span className={styles.scoreValue}>
              {(totalScore * 100).toFixed(0)}%
            </span>
            <span className={styles.scoreLabel}>Match</span>
            {showScoreDetails[getMethodName(method)] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        
        {showScoreDetails[getMethodName(method)] && scoreDetails && (
          <div className={styles.scoreBreakdown}>
            
            {getScoreDetail(method, 'elemental') !== 0 && (
              <div className={styles.scoreItem}>
                <span className={styles.scoreCategory}>Elemental</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreProgress}
                    style={{width: `${Math.min(100, getScoreDetail(method, 'elemental') * 100)}%`}}
                  />
                </div>
                <span>{(getScoreDetail(method, 'elemental') * 100).toFixed(0)}%</span>
              </div>
            )}
            
            {getScoreDetail(method, 'astrological') !== 0 && (
              <div className={styles.scoreItem}>
                <span className={styles.scoreCategory}>Astrological</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreProgress}
                    style={{width: `${Math.min(100, getScoreDetail(method, 'astrological') * 100)}%`}}
                  />
                </div>
                <span>{(getScoreDetail(method, 'astrological') * 100).toFixed(0)}%</span>
              </div>
            )}
            
            {getScoreDetail(method, 'seasonal') !== 0 && (
              <div className={styles.scoreItem}>
                <span className={styles.scoreCategory}>Seasonal</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreProgress}
                    style={{width: `${Math.min(100, getScoreDetail(method, 'seasonal') * 100)}%`}}
                  />
                </div>
                <span>{(getScoreDetail(method, 'seasonal') * 100).toFixed(0)}%</span>
              </div>
            )}
            
          </div>
        )}
        
        {/* Rest of card content */}
        {/* ... */}
      </div>
    );
  };

  // Helper function for safe score details access
  const getScoreDetail = (method: ExtendedAlchemicalItem, property: string): number => {
    if (!method.scoreDetails || typeof method.scoreDetails !== 'object') return 0;
    return (method.scoreDetails as Record<string, number>)[property] || 0;
  };
  
  // Helper function for safe method name access
  const getMethodName = (method: ExtendedAlchemicalItem): string => {
    return getMethodProperty(method, 'name', 'Unknown Method');
  };

  // ... rest of the component ...
}
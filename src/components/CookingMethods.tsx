

interface CookingMethodData {
  id?: string;
  name?: string;
  description?: string;
  element?: string;
  season?: string | string[];
  cuisine?: string;
  mealType?: string | string[];
}
'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { log } from '@/services/LoggingService';

// Type Harmony imports

import { AlchemicalItem } from '@/calculations/alchemicalTransformation';
import type { LunarPhase } from '@/constants/lunarPhases';
import { useTarotContext } from '@/contexts/TarotContext';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import type { Modality } from '@/data/ingredients/types';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import type { ElementalProperties, CookingMethod, BasicThermodynamicProperties } from '@/types/alchemy';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import { ZodiacSign, Ingredient, UnifiedIngredient } from '@/types/unified';
import { staticAlchemize } from '@/utils/alchemyInitializer';
import { getLunarMultiplier } from '@/utils/lunarMultiplier';
import { isValidAstrologicalState, safelyExtractElementalProperties, createDefaultElementalProperties } from '@/utils/typeGuards/astrologicalGuards';

import styles from './CookingMethods.module.css';

// TODO: Implement comprehensive alchemical transformation engine
// TODO: Add advanced thermodynamic property calculation
// TODO: Integrate with astrological state processing
const alchemize = async (
  elements: ElementalProperties | Record<string, number>,
  astroState: unknown,
  thermodynamics: unknown
): Promise<unknown> => {
  try {
    const birthInfo = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };

    const horoscopeDict = {
      tropical: {
        CelestialBodies: "{}",
        Ascendant: "{}",
        Aspects: "{}"
      }
    };

    if (astroState && (astroState as { planetaryPositions?: Record<string, unknown> }).planetaryPositions) {
      Object.entries((astroState as { planetaryPositions?: Record<string, unknown> }).planetaryPositions || {}).forEach(([planet, position]: [string, unknown]) => {
        if (position && (position as { sign?: string }).sign) {
          horoscopeDict.tropical.CelestialBodies[planet] = {
            Sign: { label: (position as { sign: string }).sign },
            ChartPosition: {
              Ecliptic: {
                ArcDegreesInSign: (position as { degree?: number }).degree || 0
              }
            }
          };
        }
      });
    }

    const alchemicalResult = staticAlchemize(birthInfo, horoscopeDict);

    return {
      ...alchemicalResult,
      elementalProperties: elements,
      transformedElementalProperties: {
        Fire: (alchemicalResult as { elementalBalance?: { fire?: number; water?: number; earth?: number; air?: number } }).elementalBalance?.fire || 0,
        Water: (alchemicalResult as { elementalBalance?: { fire?: number; water?: number; earth?: number; air?: number } }).elementalBalance?.water || 0,
        Earth: (alchemicalResult as { elementalBalance?: { fire?: number; water?: number; earth?: number; air?: number } }).elementalBalance?.earth || 0,
        Air: (alchemicalResult as { elementalBalance?: { fire?: number; water?: number; earth?: number; air?: number } }).elementalBalance?.air || 0
      },
      heat: (thermodynamics as { heat?: number }).heat || (alchemicalResult as { heat?: number }).heat || 0.5,
      entropy: (thermodynamics as { entropy?: number }).entropy || (alchemicalResult as { entropy?: number }).entropy || 0.5,
      reactivity: (thermodynamics as { reactivity?: number }).reactivity || (alchemicalResult as { reactivity?: number }).reactivity || 0.5,
      energy: (thermodynamics as { energy?: number }).energy || (alchemicalResult as { energy?: number }).energy || 0.5
    };
  } catch (error) {
    console.error('Error in alchemize function:', error);
    return {
      ...elements,
      alchemicalProperties: "{}",
      transformedElementalProperties: elements,
      heat: (thermodynamics as BasicThermodynamicProperties).heat || 0.5,
      entropy: (thermodynamics as BasicThermodynamicProperties).entropy || 0.5,
      reactivity: (thermodynamics as BasicThermodynamicProperties).reactivity || 0.5,
      energy: 0.5
    };
  }
};

const calculateMatchScore = (elements: unknown): number => {
  if (!elements) return 0;
  
  // Extract elements data with safe property access
  const elementsData = elements as ElementalProperties;
  
  // More sophisticated calculation that weights the properties differently
  // Heat and reactivity are positive factors, while high entropy is generally a negative factor
  const heatScore = elementsData.heat || 0;
  const entropyScore = 1 - (elementsData.entropy || 0); // Invert entropy so lower is better
  const reactivityScore = elementsData.reactivity || 0;
  
  // Calculate weighted average with more weight on heat and reactivity
  const rawScore = (heatScore * 0.4) + (entropyScore * 0.3) + (reactivityScore * 0.3);
  
  // Apply a higher multiplier to ensure clear differentiation between methods
  const multiplier = 2.5; // Higher multiplier for more obvious differences
  
  // Cap at 1.0 (100%) but ensure minimum of 0.1 (10%)
  return Math.min(1.0, Math.max(0.1, rawScore * multiplier));
};

// Define interfaces for thermodynamic properties
interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  [key: string]: number;
}

// TODO: Implement enhanced astrological influence calculation
interface AstrologicalInfluence {
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  lunarPhaseEffect?: Record<string, number>;
  dominantPlanets?: string[];
  rulingPlanets?: string[] | string;
}

// TODO: Extend for comprehensive alchemical transformation system
interface ExtendedAlchemicalItem extends AlchemicalItem {
  astrologicalInfluences?: AstrologicalInfluence;
  culturalOrigin?: string;
  bestFor?: string[];
  duration?: { min: number; max: number; };
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
}

// TODO: Implement comprehensive method information generation system
// TODO: Add specialized method descriptions for traditional and molecular techniques
// TODO: Create dynamic timing and temperature calculations based on ingredient profiles
const generateMethodInfo = (methodName: string) => {
  // TODO: Replace with comprehensive cooking method database integration
  const readableName = methodName.replace(/_/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    description: `${readableName} cooking technique - requires enterprise intelligence implementation`,
    technicalTips: ["Placeholder - implement comprehensive technique guidance"],
    idealIngredients: ["Placeholder - implement ingredient compatibility analysis"],
    timing: { duration: "Variable", temperature: "Method-specific" },
    impact: { 
      impact: "Requires implementation", 
      benefits: ["Placeholder"], 
      considerations: ["Placeholder"] 
    }
  };
};

// Add these at the top of the file (before the component function)
const DEFAULT_TAROT_DATA = {
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  }
};

// First, let's add a utility function to convert between the different lunar phase formats
// Add this near the top of your file, after the imports

// Map between title case format and uppercase underscore format
// Important: The values should match the LunarPhase type from constants/lunarPhases.ts
const LUNAR_PHASE_MAP: Record<string, LunarPhase> = {
  'FULL_MOON': 'FULL_MOON',
  'NEW_MOON': 'NEW_MOON',
  'WAXING_CRESCENT': 'WAXING_CRESCENT',
  'FIRST_QUARTER': 'FIRST_QUARTER',
  'WAXING_GIBBOUS': 'WAXING_GIBBOUS',
  'WANING_GIBBOUS': 'WANING_GIBBOUS',
  'LAST_QUARTER': 'LAST_QUARTER',
  'WANING_CRESCENT': 'WANING_CRESCENT'
};

// For display purposes
const LUNAR_PHASE_DISPLAY: Record<LunarPhase, string> = {
  'FULL_MOON': 'Full Moon',
  'NEW_MOON': 'New Moon',
  'WAXING_CRESCENT': 'Waxing Crescent',
  'FIRST_QUARTER': 'First Quarter',
  'WAXING_GIBBOUS': 'Waxing Gibbous', 
  'WANING_GIBBOUS': 'Waning Gibbous',
  'LAST_QUARTER': 'Last Quarter',
  'WANING_CRESCENT': 'Waning Crescent'
};

// Function to safely convert any lunar phase string to the correct type
const normalizeLunarPhase = (phase: string | null | undefined): LunarPhase | undefined => {
  if (!phase) return undefined;
  
  // If it's already a valid LunarPhase, return it
  if (Object.keys(LUNAR_PHASE_MAP).includes(phase)) {
    return phase as LunarPhase;
  }
  
  // Try to convert by looking for matching patterns
  const phaseLower = (phase ).toLowerCase();
  
  if ((phaseLower ).includes('full') && (phaseLower ).includes('moon')) {
    return 'FULL_MOON';
  }
  if ((phaseLower ).includes('new') && (phaseLower ).includes('moon')) {
    return 'NEW_MOON';
  }
  if ((phaseLower ).includes('waxing') && (phaseLower ).includes('crescent')) {
    return 'WAXING_CRESCENT';
  }
  if ((phaseLower ).includes('first') && (phaseLower ).includes('quarter')) {
    return 'FIRST_QUARTER';
  }
  if ((phaseLower ).includes('waxing') && (phaseLower ).includes('gibbous')) {
    return 'WAXING_GIBBOUS';
  }
  if ((phaseLower ).includes('waning') && (phaseLower ).includes('gibbous')) {
    return 'WANING_GIBBOUS';
  }
  if ((phaseLower ).includes('last') && (phaseLower ).includes('quarter')) {
    return 'LAST_QUARTER';
  }
  if ((phaseLower ).includes('waning') && (phaseLower ).includes('crescent')) {
    return 'WANING_CRESCENT';
  }
  
  return undefined;
};

// Helper for adapting between LunarPhase types
const adaptLunarPhase = (phase: LunarPhase | undefined): unknown => {
  if (!phase) return undefined;
  // Convert from our uppercase format to the format expected by the API
  // This part needs to be adjusted based on what the external functions expect
  return LUNAR_PHASE_DISPLAY[phase].toLowerCase();
};


// Missing function definitions for CookingMethods component
function getIdealIngredients(_method: CookingMethod): string[] {
  // Placeholder implementation
  return (_method as unknown as Record<string, unknown>).idealIngredients as string[] || [];
}

function determineMatchReason(_ingredient: Ingredient | UnifiedIngredient, _method: CookingMethod): string {
  // Placeholder implementation
  return "Compatible elemental properties";
}

// TODO: Implement comprehensive planetary association mapping
const planets = {
  Sun: "sun",
  Moon: "moon",
  Mercury: "mercury",
  Venus: "venus",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn"
};

export default function CookingMethods() {
  // TODO: Remove debug-specific refs after enterprise intelligence implementation
  const renderCount = useRef(0);
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // TODO: Consolidate mount state management
  useEffect(() => {
    renderCount.current += 1;
  });
  
  useEffect(() => {
    isMountedRef.current = true;
    setIsMounted(true);
    
    return () => {
      isMountedRef.current = false;
      setIsMounted(false);
    };
  }, []);
  
  // TODO: Integrate with enhanced astrological state processing
  const {
    isReady,
    currentZodiac,
    currentPlanetaryAlignment,
    lunarPhase,
    activePlanets,
    domElements,
    isDaytime
  } = useAstrologicalState();
  
  // Define the list of 14 common cooking methods to prioritize
  const commonCookingMethods = useMemo(() => [
    'baking', 'roasting', 'grilling', 'broiling', 'sauteing', 
    'frying', 'stir_frying', 'boiling', 'simmering', 'steaming', 
    'poaching', 'sous_vide', 'stewing', 'blanching', 'microwaving'
  ], []);
  
  // Helper functions for the component
  const normalizeAstroState = useCallback(() => {
    return {
      currentZodiac,
      lunarPhase: normalizeLunarPhase(lunarPhase) || lunarPhase,
      activePlanets,
      isDaytime,
      currentPlanetaryAlignment
    };
  }, [currentZodiac, lunarPhase, activePlanets, isDaytime, currentPlanetaryAlignment]);
  
  const methodToThermodynamics = (method: unknown): BasicThermodynamicProperties => {
    const methodName = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    
    // Check if the method has direct thermodynamic properties
    if (method && typeof method === 'object' && 'heat' in method && 'entropy' in method && 'reactivity' in method) {
      const methodObj = method as Record<string, unknown>;
      const heat = (methodObj.heat as number) || 0.5;
      const entropy = (methodObj.entropy as number) || 0.5;
      const reactivity = (methodObj.reactivity as number) || 0.5;
      return {
        heat,
        entropy,
        reactivity,
        gregsEnergy: heat - (entropy * reactivity)
      };
    }
    
    // Look for the method in the COOKING_METHOD_THERMODYNAMICS constant
    for (const knownMethod of Object.keys(COOKING_METHOD_THERMODYNAMICS)) {
      if ((methodName ).includes(knownMethod)) {
        const thermodynamicData = (COOKING_METHOD_THERMODYNAMICS as Record<string, Record<string, unknown>>)[knownMethod];
        return {
          heat: Number(thermodynamicData.heat) || 0.5,
          entropy: Number(thermodynamicData.entropy) || 0.5,
          reactivity: Number(thermodynamicData.reactivity) || 0.5,
          gregsEnergy: Number(thermodynamicData.gregsEnergy) || 0.5
        };
      }
    }
    
    // Fallback values based on method characteristics
    if (methodName.includes('grill') || methodName.includes('roast') || methodName.includes('fry')) {
      const heat = 0.8, entropy = 0.6, reactivity = 0.7;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // High heat methods
    } else if (methodName.includes('steam') || methodName.includes('simmer') || methodName.includes('poach')) {
      const heat = 0.4, entropy = 0.3, reactivity = 0.5;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // Medium heat methods
    } else if (methodName.includes('raw') || methodName.includes('ferment') || methodName.includes('pickle')) {
      const heat = 0.1, entropy = 0.5, reactivity = 0.4;
      return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) }; // No/low heat methods
    }
    
    // Default values
    const heat = 0.5, entropy = 0.5, reactivity = 0.5;
    return { heat, entropy, reactivity, gregsEnergy: heat - (entropy * reactivity) };
  };

  // TODO: Consolidate state management for enterprise intelligence system
  const [loading, setLoading] = useState(!isReady);
  const [recommendedMethods, setRecommendedMethods] = useState<ExtendedAlchemicalItem[]>([]);
  const [planetaryCookingMethods, setPlanetaryCookingMethods] = useState<Record<string, string[]>>({});
  const [selectedCulture, setSelectedCulture] = useState<string>('');
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  const [methodScores, setMethodScores] = useState<Record<string, number>>({});
  const [showScoreDetails, setShowScoreDetails] = useState<Record<string, boolean>>({});
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [searchIngredient, setSearchIngredient] = useState<string>('');
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});
  
  // TODO: Integrate with enhanced tarot context system
  const tarotContext = useTarotContext();
  const { tarotCard, tarotElementalInfluences } = tarotContext || DEFAULT_TAROT_DATA;

  // Add this function to calculate ingredient compatibility with methods
  const calculateIngredientCompatibility = (ingredient: string) => {
    if (!ingredient.trim()) return;
    
    // Create a compatibility map
    const compatibilityMap: Record<string, number> = {};
    
    recommendedMethods.forEach(method => {
      if ((method as Record<string, unknown>).elementalProperties) {
        // Create basic compatibility score based on elemental properties
        // This is a simplified version - you would use your actual compatibility calculation
        let compatibilityScore = 0.5; // Default medium compatibility
        
        // Check if ingredient is in the method's suitable_for list with safe array access
        const suitableFor = method.suitable_for;
        if (suitableFor && Array.isArray(suitableFor) && suitableFor.some(item => 
          (item as string).toLowerCase().includes((ingredient ).toLowerCase())
        )) {
          compatibilityScore += 0.3; // Big boost for explicitly suitable ingredients
        }
        
        // Store the compatibility score
        const methodId = String((method as Record<string, unknown>).id || (method as Record<string, unknown>).name || 'unknown');
        compatibilityMap[methodId] = Math.min(1.0, compatibilityScore);
      }
    });
    
    // Update state with the compatibility scores
    setIngredientCompatibility(compatibilityMap);
  };

  // TODO: Implement comprehensive method expansion system
  const toggleMethodExpansion = useCallback((methodId: string) => {
    setExpandedMethods(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  }, []);

  // TODO: Add filtering and display controls
  const toggleShowAllMethods = useCallback(() => {
    setShowAllMethods(prev => !prev);
  }, []);

  // TODO: Implement cultural cooking method mapping system
  const culturalCookingMap = useMemo(() => {
    // TODO: Replace with comprehensive cultural analysis
    return { 'Traditional': [] };
  }, []);

  // Get global astrological adjustment info
  const globalAstrologicalAdjustment = useMemo(() => {
    const zodiacSign = currentZodiac;
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
  const getThermodynamicValue = (method: ExtendedAlchemicalItem, property: string): number => {
    // First try to get from thermodynamicProperties
    if (method.thermodynamicProperties && 
        property in method.thermodynamicProperties) {
      return method.thermodynamicProperties[property as keyof ThermodynamicProperties];
    }
    
    // Fall back to direct property if exists
    if (property in method) {
      return method[property as keyof typeof method] as number || 0;
    }
    
    // Check COOKING_METHOD_THERMODYNAMICS constant
    const methodName = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    if (COOKING_METHOD_THERMODYNAMICS && (COOKING_METHOD_THERMODYNAMICS as Record<string, Record<string, unknown>>)[methodName]) {
      return Number((COOKING_METHOD_THERMODYNAMICS as Record<string, Record<string, unknown>>)[methodName][property as keyof BasicThermodynamicProperties]) || 0;
    }
    
    // Generate values based on method name keywords if no explicit values found
    // This ensures all methods have reasonable thermodynamic values
    const methodLower = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    
    if (property === 'heat') {
      if (methodLower.includes('boil') || methodLower.includes('fry') || 
          methodLower.includes('grill') || methodLower.includes('roast')) {
        return 0.8; // High heat methods
      } else if (methodLower.includes('steam') || methodLower.includes('simmer') || 
                 methodLower.includes('poach')) {
        return 0.4; // Medium heat methods
      } else if (methodLower.includes('ferment') || methodLower.includes('cure') || 
                 methodLower.includes('pickle') || methodLower.includes('raw')) {
        return 0.1; // Low/no heat methods
      }
      return 0.5; // Default medium heat
    }
    
    if (property === 'entropy') {
      if (methodLower.includes('ferment') || methodLower.includes('brais') || 
          methodLower.includes('stew')) {
        return 0.8; // High breakdown methods
      } else if (methodLower.includes('marinate') || methodLower.includes('tenderize')) {
        return 0.6; // Medium breakdown methods
      } else if (methodLower.includes('steam') || methodLower.includes('poach')) {
        return 0.3; // Low breakdown methods
      }
      return 0.5; // Default medium entropy
    }
    
    if (property === 'reactivity') {
      if (methodLower.includes('grill') || methodLower.includes('sear') || 
          methodLower.includes('roast') || methodLower.includes('broil')) {
        return 0.8; // High reactivity methods (Maillard reactions)
      } else if (methodLower.includes('ferment') || methodLower.includes('pickle') || 
                 methodLower.includes('cure')) {
        return 0.7; // Medium-high reactivity methods (chemical transformations)
      } else if (methodLower.includes('steam') || methodLower.includes('poach')) {
        return 0.3; // Low reactivity methods
      }
      return 0.5; // Default medium reactivity
    }
    
    return 0.5; // Default medium value
  };

  // TODO: Implement molecular gastronomy analysis system
  const getMolecularDetails = (method: ExtendedAlchemicalItem) => {
    // TODO: Add comprehensive molecular technique detection and analysis
    return null;
  };

  // TODO: Implement comprehensive method data extraction system
  const getMethodSpecificData = (method: ExtendedAlchemicalItem) => {
    // TODO: Add integration with cooking method database
    // TODO: Include molecular method detection and data extraction
    return null;
  };

  // TODO: Implement comprehensive method details system
  const getMethodDetails = (method: ExtendedAlchemicalItem): { examples: string[], fullDefinition: string } => {
    // TODO: Replace with database-driven method information system
    const methodName = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    // Use generateMethodInfo to enrich method details
    const methodInfo = generateMethodInfo(method.name || '');
    const description = method.description || methodInfo.description;

    
    // Default values
    let examples: string[] = [];
    let fullDefinition = (method as Record<string, unknown>).description || "";
    
    // Check if we have data from the source first
    const methodRecord = method as unknown as Record<string, unknown>;
    const methodId = methodRecord.id as string;
    const cookingMethodsRecord = cookingMethods as unknown as Record<string, Record<string, unknown>>;
    
    if (methodId && cookingMethodsRecord[methodId]) {
      const sourceMethod = cookingMethodsRecord[methodId];
      // Expand definition if needed
      const sourceDescription = (sourceMethod ).description as string;
      const methodDescription = (method as Record<string, unknown>).description as string;
      if (sourceDescription && sourceDescription.length > methodDescription.length) {
        fullDefinition = sourceDescription;
      }
      
      // Use existing suitable_for as examples if available
      const suitableFor = (sourceMethod ).suitable_for as unknown[];
      if (suitableFor && Array.isArray(suitableFor) && suitableFor.length > 0) {
        examples = suitableFor.map(item => {
          const itemStr = String(item || '');
          // Transform "pasta" to "Pasta dishes (spaghetti, lasagna)"
          if (itemStr === "pasta") return "Pasta dishes (spaghetti, lasagna, ravioli)";
          if (itemStr === "rice") return "Rice dishes (risotto, paella, biryani)";
          if (itemStr === "vegetables") return "Vegetables (carrots, broccoli, cauliflower)";
          if (itemStr === "meat") return "Meat (steak, chicken, pork chops)";
          if (itemStr === "fish") return "Fish (salmon, cod, trout)";
          if (itemStr === "eggs") return "Eggs (omelets, frittatas, poached eggs)";
          if (itemStr === "legumes") return "Legumes (beans, lentils, chickpeas)";
          return itemStr.charAt(0).toUpperCase() + itemStr.slice(1);
        });
        return { examples, fullDefinition: String(fullDefinition) || "Cooking method description" };
      }
    }
    
    // Method-specific information if not found in source data
    switch(methodName) {
      case 'baking':
        fullDefinition = "Cooking food with dry heat in an enclosed environment, usually an oven, where hot air surrounds the food and cooks it evenly. The process promotes browning via Maillard reactions and caramelization.";
        examples = [
          "Breads (sourdough, sandwich loaves, focaccia)",
          "Pastries (croissants, pies, tarts)",
          "Cakes and cookies",
          "Roasted vegetables (with olive oil and herbs)",
          "Casseroles and gratins"
        ];
        break;
        
      case 'boiling':
        fullDefinition = "Cooking food in water or liquid that's heated to 212°F (100°C) at sea level, causing large bubbles to rise rapidly to the surface. Heat is transferred through convection.";
        examples = [
          "Pasta (spaghetti, fettuccine, macaroni)",
          "Rice and grains",
          "Hard-boiled eggs",
          "Potatoes for mashing",
          "Dumplings (wontons, pierogi, gnocchi)"
        ];
        break;
        
      case 'grilling':
        fullDefinition = "Cooking food directly over high heat on an open grate, allowing fat to drip away. This creates distinctive char marks and imparts a smoky flavor through direct heat radiation and partial combustion.";
        examples = [
          "Steaks and burgers",
          "Chicken (breasts, thighs, whole spatchcocked)",
          "Seafood (salmon, shrimp, calamari)",
          "Vegetables (corn, zucchini, bell peppers)",
          "Kebabs and skewers"
        ];
        break;
        
      case 'roasting':
        fullDefinition = "Cooking food with dry heat, usually in an oven, where hot air circulates around the food. Typically used for larger cuts of meat or whole vegetables to create a browned exterior and tender interior.";
        examples = [
          "Whole chicken or turkey",
          "Prime rib or beef tenderloin",
          "Root vegetables (carrots, parsnips, potatoes)",
          "Whole fish (sea bass, snapper)",
          "Coffee beans"
        ];
        break;
        
      case 'steaming':
        fullDefinition = "Cooking food with the vapor from boiling water, without immersing the food in the water itself. This gentle method preserves nutrients, color, and texture without adding fat.";
        examples = [
          "Dumplings (xiaolongbao, steamed buns)",
          "Vegetables (broccoli, green beans, carrots)",
          "Fish fillets (delicate white fish)",
          "Rice (especially sticky rice)",
          "Puddings and custards"
        ];
        break;
        
      case 'frying':
      case 'deep frying':
        fullDefinition = "Cooking food by submerging it in hot oil or fat (deep-frying) or using a thin layer of oil (pan-frying). The high temperature quickly seals the surface, creating a crispy exterior while cooking the interior.";
        examples = [
          "Fried chicken and chicken cutlets",
          "French fries and potato chips",
          "Donuts and fritters",
          "Tempura vegetables and seafood",
          "Falafel and croquettes"
        ];
        break;
        
      case 'braising':
        fullDefinition = "A two-step cooking method that first sears food at high temperature, then finishes it in a covered pot with liquid at low temperature. This breaks down tough fibers in meat and develops rich flavors.";
        examples = [
          "Beef bourguignon",
          "Coq au vin",
          "Short ribs and osso buco",
          "Braised greens (collards, kale)",
          "Lamb shanks in red wine"
        ];
        break;
        
      case 'sous vide':
        fullDefinition = "Vacuum-sealing food in a bag and cooking it in a precisely temperature-controlled water bath. This method allows for exact doneness and retention of moisture and nutrients.";
        examples = [
          "Perfectly medium-rare steaks",
          "72-hour short ribs",
          "Poached eggs (63°C/145°F)",
          "Salmon with crispy skin (finished with searing)",
          "Custards and crème brûlée"
        ];
        break;
        
      case 'smoking':
        fullDefinition = "Cooking food by exposing it to smoke from burning or smoldering wood. Can be hot-smoking (cooking + flavor) or cold-smoking (flavor only). Adds complex flavors and acts as a preservative.";
        examples = [
          "Brisket and pulled pork",
          "Ribs (beef, pork)",
          "Salmon and trout",
          "Cheese (gouda, cheddar)",
          "Bacon and ham"
        ];
        break;
        
      case 'stir-frying':
      case 'stir frying':
        fullDefinition = "Quick cooking in a wok or pan over very high heat with constant motion. Food is cut into small, uniform pieces and cooked in a small amount of oil, often with aromatics.";
        examples = [
          "Kung Pao chicken",
          "Beef and broccoli",
          "Vegetable stir-fry with tofu",
          "Pad Thai and other noodle dishes",
          "Fried rice"
        ];
        break;
        
      case 'spherification':
        fullDefinition = "A molecular gastronomy technique that encapsulates liquids in a thin gel membrane, creating spheres that burst in the mouth. Uses sodium alginate and calcium to form a membrane through ionic gelation.";
        examples = [
          "Fruit juice caviar",
          "Liquid-filled olive spheres",
          "Yogurt pearls",
          "Cocktail spheres",
          "Sauce pearls for garnishing"
        ];
        break;
        
      case 'fermentation':
      case 'fermenting':
        fullDefinition = "The transformation of food through controlled microbial growth and enzymatic action. Can be lacto-fermentation (using lactic acid bacteria), alcoholic fermentation (using yeast), or other methods.";
        examples = [
          "Sauerkraut and kimchi",
          "Yogurt and kefir",
          "Sourdough bread",
          "Wine and beer",
          "Miso and tempeh"
        ];
        break;
        
      case 'solenije':
        fullDefinition = "Solenije (соленье) is a traditional Eastern European preservation technique that uses salt brine fermentation to preserve vegetables. Unlike Western pickling methods that rely heavily on vinegar, solenije uses a natural fermentation process where lactobacillus bacteria converts sugars to lactic acid, creating a tangy flavor and preservative environment. The term comes from the Russian word for salt - 'sol'.";
        examples = [
          "Sauerkraut (fermented cabbage with salt)",
          "Pickled cucumbers (salt-brined with dill and garlic)",
          "Marinated tomatoes (partially fermented in salt brine)",
          "Pickled mushrooms (traditional Russian forest varieties)",
          "Fermented bell peppers (with salt and spices)"
        ];
        break;
        
      case 'confit':
        fullDefinition = "Confit is a French preservation technique where food is slow-cooked in fat at low temperatures (typically around 200°F/93°C), then stored in the same fat. Originally developed as a preservation method, confit is now prized for creating exceptionally tender texture and rich flavor, especially in meats.";
        examples = [
          "Duck confit (duck legs preserved in duck fat)",
          "Garlic confit (cloves cooked slowly in olive oil)",
          "Tomato confit (slow-cooked in olive oil with herbs)",
          "Tuna confit (preserved in olive oil)",
          "Fruit confit (cooked in sugar syrup)"
        ];
        break;
        
      case 'tagine':
        fullDefinition = "Tagine refers both to a North African earthenware cooking vessel with a conical lid and the slow-cooked stews prepared in it. The unique shape creates a natural condensation cycle that returns moisture to the food, allowing aromatic stews to develop complex flavors while using minimal liquid.";
        examples = [
          "Chicken tagine with preserved lemon and olives",
          "Lamb tagine with apricots and almonds",
          "Vegetable tagine with chickpeas and spices",
          "Fish tagine with chermoula and vegetables",
          "Beef tagine with prunes and honey"
        ];
        break;
        
      case 'nixtamal':
        fullDefinition = "Nixtamalization is an ancient Mesoamerican technique where dried corn (maize) is soaked and cooked in an alkaline solution, typically limewater (calcium hydroxide). This process loosens the hulls, softens the corn, improves its nutritional value by releasing niacin, and imparts a distinctive flavor essential for authentic tortillas and masa products.";
        examples = [
          "Tortillas (from nixtamalized corn masa)",
          "Tamales (steamed corn masa dough with fillings)",
          "Pozole (hominy soup made with nixtamalized corn)",
          "Atole (traditional beverage made with masa)",
          "Arepas (when made with nixtamalized corn)"
        ];
        break;
        
      case 'poaching':
        fullDefinition = "A gentle cooking method where food is simmered in liquid at temperatures between 160-180°F (71-82°C). Unlike boiling, poaching uses minimal agitation and lower temperatures to preserve delicate textures and flavors.";
        examples = [
          "Poached eggs (breakfast classic)",
          "Poached fish (mild white fish like cod or sole)",
          "Poached chicken (tender, juicy chicken breasts)",
          "Poached fruit (pears in wine, apples in cider)",
          "Poached seafood (shrimp, scallops, lobster)"
        ];
        break;
        
      case 'simmering':
        fullDefinition = "Cooking food in liquid maintained just below the boiling point (185-200°F/85-93°C), where tiny bubbles form slowly. This gentle method prevents food from toughening or breaking apart while allowing flavors to develop fully.";
        examples = [
          "Stocks and broths (chicken, beef, vegetable)",
          "Soups and stews (minestrone, gumbo)",
          "Beans and legumes (slowly cooked for tenderness)",
          "Sauces (reduction sauces, marinara)",
          "Tough cuts of meat (chuck, brisket)"
        ];
        break;
        
      case 'pressure_cooking':
        fullDefinition = "Cooking food in a sealed vessel that prevents steam from escaping, creating pressure that raises the boiling point of water and significantly reduces cooking time. Modern pressure cookers have precise controls and safety features.";
        examples = [
          "Dried beans (cooked in 30-45 minutes instead of hours)",
          "Tough cuts of meat (quick beef stew, pulled pork)",
          "Whole grains (brown rice in 20 minutes)",
          "Root vegetables (potatoes, carrots, beets)",
          "Stocks and broths (intense flavor in 30-60 minutes)"
        ];
        break;
        
      case 'curing':
        fullDefinition = "Preserving food by drawing out moisture using salt, sugar, nitrates, or smoke. This ancient technique extends shelf life and develops unique flavors and textures through controlled dehydration and chemical transformations.";
        examples = [
          "Bacon and pancetta (cured pork belly)",
          "Prosciutto and jamón (dry-cured ham)",
          "Gravlax (salt and sugar-cured salmon)",
          "Corned beef (salt and spice-cured brisket)",
          "Preserved citrus (salt-cured lemons, oranges)"
        ];
        break;
        
      case 'broiling':
        fullDefinition = "Cooking food with intense direct heat from above, typically in an oven's broiler compartment. Similar to grilling but with the heat source above instead of below, creating quick browning and caramelization on food surfaces.";
        examples = [
          "Finishing gratins and casseroles (for golden tops)",
          "Thin steaks and chops (quick cooking for tender cuts)",
          "Seafood (fish fillets, shrimp, scallops)",
          "Toasting bread (garlic bread, bruschetta)",
          "Roasted vegetables (quick-charred peppers, tomatoes)"
        ];
        break;
        
      case 'cryogenic_cooking':
      case 'cryo_cooking':
        fullDefinition = "A molecular gastronomy technique using extremely low temperatures (usually with liquid nitrogen at -196°C/-321°F) to instantly freeze foods, creating unique textures and visual effects while preserving flavors and nutrients.";
        examples = [
          "Flash-frozen herbs (crushing into powder)",
          "Instant ice cream (made tableside with liquid nitrogen)",
          "Frozen cocktails (alcoholic slushies with perfect texture)",
          "Nitrogen-poached meringues (crisp exterior, airy interior)",
          "Flash-frozen foams (stable espuma with unique mouthfeel)"
        ];
        break;
        
      case 'emulsification':
        fullDefinition = "The process of combining two immiscible liquids (like oil and water) into a stable mixture using an emulsifier that prevents separation. This technique is fundamental in creating sauces, dressings, and many molecular gastronomy preparations.";
        examples = [
          "Mayonnaise (oil-in-water emulsion stabilized by egg yolks)",
          "Vinaigrettes (temporarily emulsified with mustard or honey)",
          "Hollandaise sauce (butter emulsified with egg yolks)",
          "Aioli (garlic-infused emulsified sauce)",
          "Culinary foams (air emulsified into liquids)"
        ];
        break;
        
      case 'distilling':
        fullDefinition = "A process of separating components by selective boiling and condensation, traditionally used for alcoholic beverages but also employed in modern cuisine for flavor extraction, concentration, and purification of essences.";
        examples = [
          "Essential oils (concentrated flavor extracts)",
          "Hydrosols (floral waters like rose water or orange blossom)",
          "Culinary alcohols (infused spirits, herbal liqueurs)",
          "Flavor concentrates (intense reductions for garnishes)",
          "Distilled vinegars (specialty flavor profiles)"
        ];
        break;
        
      case 'gelification':
        fullDefinition = "Using hydrocolloids (like agar-agar, gelatin, or carrageenan) to transform liquids into gels with various textures, from soft and yielding to firm and bouncy. A key technique in both traditional and modernist cuisine.";
        examples = [
          "Traditional jellies and aspics (meat or vegetable stock-based)",
          "Panna cotta (cream set with gelatin)",
          "Fluid gels (pourable yet stable sauce textures)",
          "Caviar pearls (small spheres with gel membranes)",
          "Edible cocktails (alcoholic jellies and gels)"
        ];
        break;
        
      case 'infusing':
        fullDefinition = "Extracting flavors, colors, and aromas from ingredients by steeping them in a liquid (water, oil, alcohol) at specific temperatures. The process transfers soluble compounds to create flavorful bases for cooking.";
        examples = [
          "Herbal infusions (teas, tisanes)",
          "Flavored oils (herb, chili, garlic)",
          "Alcoholic infusions (liqueurs, bitters)",
          "Infused vinegars (herb, fruit, spice)",
          "Aromatics in broths and stocks"
        ];
        break;
        
      case 'sushi':
      case 'sushi_making':
        fullDefinition = "A Japanese cooking technique that involves combining vinegar-seasoned rice with other ingredients, typically seafood, vegetables, and sometimes egg or tofu. The vinegar-seasoned rice, called 'sushi-meshi', is prepared with vinegar, sugar, and salt, and is usually wrapped in a sheet of nori (seaweed) before being eaten.";
        examples = [
          "Sushi rolls (California roll, Philadelphia roll, Dragon roll)",
          "Nigiri sushi (sushi with a slice of fish or seafood atop a small ball of sushi rice)",
          "Maki sushi (sushi rolls made with seaweed, rice, and fillings)",
          "Temaki (hand-pressed sushi)",
          "Sashimi (slices of raw fish or seafood)"
        ];
        break;
        
      case 'canning':
      case 'home_canning':
        fullDefinition = "The process of preserving food by sealing it in containers, usually glass jars, and processing it in a water bath or pressure canner. This process kills bacteria and extends the shelf life of the food. Canning is a common method of preserving food in many cultures.";
        examples = [
          "Canned fruits (peaches, pears, apples)",
          "Canned vegetables (green beans, corn, beets)",
          "Canned meats (spams, tuna, chicken)",
          "Canned fruits and vegetables (peach halves, corn kernels, diced tomatoes)",
          "Canned soups and stews (vegetable, chicken, beef)"
        ];
        break;
        
      case 'dehydrating':
        fullDefinition = "The process of removing water from food through a controlled drying process, usually in a dehydrator or under controlled heat. Dehydrating is a common method of preserving food by removing water, which inhibits bacterial growth and extends the shelf life of the food.";
        examples = [
          "Dehydrated fruits (apples, bananas, berries)",
          "Dehydrated vegetables (carrots, zucchini, mushrooms)",
          "Dehydrated meats (beef jerky, chicken strips)",
          "Dehydrated fruits and vegetables (apple chips, carrot sticks, zucchini chips)",
          "Dehydrated soups and stews (vegetable, chicken, beef)"
        ];
        break;
      
      default:
        // For methods not explicitly covered, return basic information
        examples = getIdealIngredients(method as any).map(ingredient => String(ingredient));
    }
    
    return { examples, fullDefinition: String(fullDefinition) || "Cooking method description" };
  };

  // Replace getNutritionalImpact function with getIngredientCompatibility
  const getIngredientCompatibility = (method: ExtendedAlchemicalItem): { 
    compatibility: string, 
    idealCharacteristics: string[],
    avoidCharacteristics: string[]
  } => {
    const methodName = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    let compatibility = "";
    let idealCharacteristics: string[] = [];
    let avoidCharacteristics: string[] = [];
    
    // Method-specific information with expanded coverage
    switch(methodName) {
      case 'steaming':
        compatibility = "Best for delicate ingredients that benefit from gentle cooking";
        idealCharacteristics = [
          "Delicate textures that would break under high heat",
          "Foods that benefit from moisture retention",
          "Ingredients where subtle flavors should be preserved",
          "Foods that might dry out with other cooking methods"
        ];
        avoidCharacteristics = [
          "Ingredients requiring browning or caramelization",
          "Foods that need to develop a crust",
          "Dishes where excess moisture would be problematic"
        ];
        break;
        
      case 'boiling':
        compatibility = "Ideal for ingredients requiring thorough hydration and even cooking";
        idealCharacteristics = [
          "Dry starches that need to absorb water (pasta, rice, grains)",
          "Foods that should be uniformly cooked throughout",
          "Ingredients where flavor extraction into water is desirable",
          "Hard vegetables that need to be softened quickly"
        ];
        avoidCharacteristics = [
          "Delicate proteins that toughen with high heat",
          "Ingredients where flavor would leach out excessively",
          "Foods where texture would become mushy or waterlogged"
        ];
        break;
        
      case 'baking':
        compatibility = "Perfect for items needing even heat distribution and surface browning";
        idealCharacteristics = [
          "Doughs and batters requiring rising and setting",
          "Foods that benefit from dry heat circulation",
          "Ingredients where gradual moisture evaporation creates texture",
          "Items that need even browning on all sides"
        ];
        avoidCharacteristics = [
          "Very moist ingredients without structural support",
          "Foods that dry out easily without protection",
          "Delicate items that cannot withstand prolonged heat"
        ];
        break;
      
      // Add more cases for other cooking methods...
      
      case 'solenije':
        compatibility = "Perfect for vegetables with high water content and natural sugars";
        idealCharacteristics = [
          "Vegetables with high moisture content (cabbage, cucumbers)",
          "Ingredients with natural sugars for fermentation",
          "Crisp vegetables that maintain structure during fermentation",
          "Foods that benefit from flavor development over time"
        ];
        avoidCharacteristics = [
          "Low-acid foods without proper acidity adjustment",
          "Ingredients with high oil content",
          "Vegetables too delicate to withstand fermentation pressure",
          "Leafy greens that wilt excessively"
        ];
        break;
      
      case 'grilling':
        compatibility = "Excellent for foods that benefit from high direct heat and smoke flavor";
        idealCharacteristics = [
          "Proteins with adequate fat content",
          "Foods that cook quickly and benefit from char marks",
          "Ingredients that release flavor when exposed to smoke",
          "Vegetables with sufficient structure to remain on grates"
        ];
        avoidCharacteristics = [
          "Very lean meats prone to drying out",
          "Delicate foods that fall apart easily",
          "Small items that might fall through grates",
          "Dishes requiring slow, gentle cooking"
        ];
        break;
      
      // Many more methods would be added here...
      
      case 'sous vide':
      case 'sous_vide':
        compatibility = "Perfect for precision cooking proteins and delicate items";
        idealCharacteristics = [
          "Tender cuts of meat requiring precise temperature control",
          "Delicate fish that would fall apart with other methods",
          "Foods that benefit from enhanced juiciness and even cooking",
          "Ingredients where textural precision is crucial"
        ];
        avoidCharacteristics = [
          "Foods where browning or crust is essential (unless finished separately)",
          "Dishes requiring complex flavor development from caramelization",
          "Recipes where varied textural contrasts are the goal"
        ];
        break;
      
      case 'smoking':
        compatibility = "Ideal for foods that absorb smoke compounds well";
        idealCharacteristics = [
          "Fatty meats that can absorb and carry smoke flavor",
          "Foods with robust structure that can withstand prolonged exposure",
          "Ingredients that complement woodsy, aromatic flavors",
          "Items where smoke acts as both flavor and preservative"
        ];
        avoidCharacteristics = [
          "Delicate items that would be overwhelmed by smoke",
          "Very lean proteins that might dry out during the process",
          "Foods where subtle natural flavors should be the highlight"
        ];
        break;
      
      case 'pressure cooking':
      case 'pressure_cooking':
        compatibility = "Excellent for tough ingredients needing quick tenderization";
        idealCharacteristics = [
          "Tough cuts of meat with collagen that converts to gelatin",
          "Dried beans and legumes requiring thorough hydration",
          "Dense root vegetables that would take long with other methods",
          "Recipes where flavor concentration is desirable"
        ];
        avoidCharacteristics = [
          "Delicate proteins that would overcook quickly",
          "Foods where textural integrity must be preserved",
          "Dishes where evaporation and reduction is part of the process"
        ];
        break;
      
      case 'fermentation':
      case 'fermenting':
        compatibility = "Best for foods with natural sugars and stable structure";
        idealCharacteristics = [
          "Vegetables with natural sugars for bacterial conversion",
          "Milk products for yogurt and cheese making",
          "Grains and flours for bread, beer, or spirits",
          "Ingredients that benefit from probiotic development"
        ];
        avoidCharacteristics = [
          "Foods with preservatives that inhibit microbial activity",
          "Items with extremely low sugar content",
          "Ingredients too delicate to withstand pH changes"
        ];
        break;
      
      case 'blanching':
        compatibility = "Ideal for vegetables needing brief heat exposure";
        idealCharacteristics = [
          "Green vegetables where color preservation is important",
          "Items being prepared for freezing or further cooking",
          "Foods where enzyme deactivation is necessary",
          "Ingredients where brief heat improves flavor or removes bitterness"
        ];
        avoidCharacteristics = [
          "Foods requiring thorough cooking throughout",
          "Items where surface browning is desirable",
          "Recipes where flavor development through prolonged cooking is needed"
        ];
        break;
      
      case 'hand pounding':
      case 'hand_pounding':
        compatibility = "Exceptional for ingredients where cell rupture enhances flavor release and textural complexity";
        idealCharacteristics = [
          "Fibrous aromatics like lemongrass, galangal, and ginger that release oils when crushed",
          "Fresh herbs whose volatile compounds are preserved with mechanical pressure versus heat",
          "Nuts and seeds that release oils gradually through pounding rather than immediate extraction",
          "Cooked starchy foods requiring texture transformation (yams, plantains for fufu)",
          "Spice blends where varying particle sizes create layered flavor release"
        ];
        avoidCharacteristics = [
          "Very watery ingredients that splash and are difficult to control",
          "Extremely hard items requiring excessive force that might damage equipment",
          "Ingredients requiring perfectly uniform particle size",
          "Highly acidic foods that might react with certain mortar materials"
        ];
        break;
      
      case 'braising':
        compatibility = "Perfect for tough cuts and ingredients needing flavor infusion";
        idealCharacteristics = [
          "Tough, collagen-rich meat cuts (short ribs, shanks, shoulder)",
          "Fibrous vegetables that soften with slow cooking",
          "Ingredients that benefit from absorbing surrounding flavors",
          "Foods that improve with low, slow moisture and heat"
        ];
        avoidCharacteristics = [
          "Tender cuts that would become overcooked",
          "Delicate vegetables that would disintegrate",
          "Items where distinct textural contrast should be maintained"
        ];
        break;
      
      // Many more specific methods would be added here...
      
      default:
        // Make the default case less generic by analyzing the method name
        if ((methodName ).includes('fry')) {
          compatibility = "Best for foods that benefit from crisp exterior and quick cooking";
          idealCharacteristics = [
            "Items with natural structure that can withstand hot oil",
            "Foods where crisp exterior and moist interior is desired",
            "Ingredients that cook quickly and evenly",
            "Battered or breaded items requiring rapid setting"
          ];
        } else if ((methodName ).includes('roast')) {
          compatibility = "Ideal for items needing even browning and slow moisture release";
          idealCharacteristics = [
            "Larger cuts of meat that benefit from even heat penetration",
            "Vegetables where caramelization enhances flavor",
            "Foods that benefit from fat rendering and self-basting",
            "Items where surface browning and flavor development is key"
          ];
        } else {
          // Truly generic fallback with helpful guidance
          compatibility = `${(method as Record<string, unknown>).name} works best with ingredients suited to its thermal profile`;
          idealCharacteristics = [
            "Ingredients with compatible texture and structure",
            "Foods traditionally prepared with this method in its cuisine of origin",
            "Items that respond well to this method's moisture and heat approach"
          ];
        }
    }
    
    return { compatibility, idealCharacteristics, avoidCharacteristics };
  };

  // Add this function to generate method-specific elemental properties
  const getMethodElementalProperties = (method: ExtendedAlchemicalItem) => {
    const methodName = ((method as Record<string, unknown>).name || '').toString().toLowerCase();
    
    // If the method already has valid elemental properties, use those
    if ((method as Record<string, unknown>).elementalProperties && 
        Object.values((method as Record<string, unknown>).elementalProperties || {}).some(val => Number(val) > 0)) {
      return (method as Record<string, unknown>).elementalProperties;
    }
    
    // Generate method-specific elemental properties
    const properties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    if ((methodName ).includes('solenije') || (methodName ).includes('pickle')) {
      properties.Water = 0.5;
      properties.Earth = 0.3;
      properties.Air = 0.1;
      properties.Fire = 0.1;
    } else if ((methodName ).includes('confit')) {
      properties.Fire = 0.4;
      properties.Earth = 0.4;
      properties.Water = 0.1;
      properties.Air = 0.1;
    } else if ((methodName ).includes('tagine')) {
      properties.Earth = 0.4;
      properties.Water = 0.3;
      properties.Fire = 0.2;
      properties.Air = 0.1;
    } else if ((methodName ).includes('nixtamal')) {
      properties.Water = 0.4;
      properties.Earth = 0.3;
      properties.Fire = 0.2;
      properties.Air = 0.1;
    }
    
    return properties;
  };

  // Add import for our utility function at the top of the component
  const { getTechnicalTips: getMethodTips } = require('../utils/cookingMethodTips');

  // Add a function to determine which modality a cooking method best complements
  const getMethodModalityAffinity = (method: ExtendedAlchemicalItem): Modality => {
    // If the method has higher Fire/Air values, it's likely Cardinal
    // If it has higher Earth/Water values, it's likely Fixed
    // If it has balanced elements, it's likely Mutable
    const elementalEffect = (method as Record<string, unknown>).elementalEffect || {};
    
    const elementalData = elementalEffect as Record<string, unknown>;
    const fireAirSum = (Number(elementalData.Fire) || 0) + (Number(elementalData.Air) || 0);
    const earthWaterSum = (Number(elementalData.Earth) || 0) + (Number(elementalData.Water) || 0);
    
    if (fireAirSum > earthWaterSum + 0.2) {
      return 'Cardinal';
    } else if (earthWaterSum > fireAirSum + 0.2) {
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

  // Add a state for the debug panel
  const [showDebug, setShowDebug] = useState(false);
  
  // Add this function to run our test
  const runDebugTest = useCallback(() => {
    log.info("Running cooking method recommendations test...");
    // testCookingMethodRecommendations(); // TODO: Implement or remove
  }, []);
  
  // Update the fetchMethods function to use isMountedRef
  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      
      const astroState = normalizeAstroState();
      
      // Get the cooking methods with default thermodynamic properties
      const baseMethods = Object.entries(cookingMethods).map(([key, method]) => {
        return {
          ...method,
          id: key,
          name: key.replace(/_/g, ' '),
          gregsEnergy: 0.5, // Default value, will be updated below
          matchReason: ''
        };
      });
      
      // Process methods in parallel using Promise.all
      const methodsWithScores = await Promise.all(
        (Array.isArray(baseMethods) ? baseMethods : []).map(async (method) => {
          // Get thermodynamic properties for this method
          const thermodynamics = methodToThermodynamics(method);
          
          // Include thermodynamic properties in the method data
          const methodWithThermodynamics = {
            ...method,
            thermodynamicProperties: thermodynamics,
            heat: thermodynamics.heat,
            entropy: thermodynamics.entropy,
            reactivity: thermodynamics.reactivity
          };
          
          try {
            // Calculate transformed alchemical properties
            const alchemized = await alchemize(
              (method as Record<string, unknown>).elementalProperties as Record<string, number> || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
              astroState,
              thermodynamics
            );
            
            // Calculate match score with enhanced algorithm for better differentiation
            const baseScore = calculateMatchScore(alchemized);
            
            // Add additional factors to differentiate scores
            let adjustedScore = baseScore;
            
            // Add zodiac sign affinity bonus/penalty - larger bonus for better differentiation
            const astroData = astroState as Record<string, unknown>;
            const zodiacSign = astroData.currentZodiac as string;
            const astroInfluences = method.astrologicalInfluences as Record<string, unknown>;
            if (zodiacSign && Array.isArray(astroInfluences.favorableZodiac) && astroInfluences.favorableZodiac.includes(zodiacSign)) {
              adjustedScore += 0.2; // Increased from 0.15 for better differentiation
            } else if (zodiacSign && Array.isArray(astroInfluences.unfavorableZodiac) && astroInfluences.unfavorableZodiac.includes(zodiacSign)) {
              adjustedScore -= 0.15; // Made penalty stronger
            }
            
            // Add lunar phase adjustment with stronger effect
            if (astroData.lunarPhase) {
              const adaptedPhase = adaptLunarPhase(astroData.lunarPhase as LunarPhase);
              const lunarMultiplier = getLunarMultiplier(adaptedPhase as any);
              // Apply a more significant adjustment
              adjustedScore = adjustedScore * (0.8 + (lunarMultiplier * 0.4)); // More impactful adjustment
            }
            
            // Apply dominant elements adjustment
            if (domElements && typeof domElements === 'object') {
              const elementEntries = Object.entries(domElements as Record<string, number>);
              if (elementEntries.length > 0) {
                const dominantElement = elementEntries.reduce((max, current) => 
                  current[1] > max[1] ? current : max
                )[0];
                const methodData = method as Record<string, unknown>;
                const methodElement = methodData.element || methodData.dominantElement;
                if (methodElement === dominantElement) {
                  adjustedScore *= 1.15; // 15% bonus for matching dominant element
                }
              }
            }
            
            // Apply bonus for common cooking methods
            const methodName = (method.name || '').toLowerCase();
            if (commonCookingMethods.some(common => methodName.includes(common))) {
              adjustedScore *= 1.05; // 5% bonus for being a common method
            }
            
            // Add random variation to break up methods that would otherwise get the same score
            // But only during initial calculation, not on re-renders
            const jitter = Math.random() * 0.05; // Small random factor - will be saved in methodScores state
            adjustedScore += jitter;
            
            // Cap the score at 1.0 maximum and minimum of 0.1
            const finalScore = Math.min(1.0, Math.max(0.1, adjustedScore));
            
            // Generate a reason for the match using Type Harmony bridge
            const bridge = createAstrologicalBridge();
            const matchReason = isValidAstrologicalState(astroState) 
              ? determineMatchReason(methodWithThermodynamics as any, astroState as any)
              : "Compatible elemental properties";
            
            return {
              ...methodWithThermodynamics,
              alchemicalProperties: (alchemized as Record<string, unknown>).alchemicalProperties,
              transformedElementalProperties: (alchemized as Record<string, unknown>).transformedElementalProperties,
              heat: (alchemized as Record<string, unknown>).heat,
              entropy: (alchemized as Record<string, unknown>).entropy,
              reactivity: (alchemized as Record<string, unknown>).reactivity,
              energy: (alchemized as Record<string, unknown>).energy,
              gregsEnergy: finalScore,
              matchReason
            };
          } catch (err) {
            console.error(`Error processing method ${(method as Record<string, unknown>).name}:`, err);
            return {
              ...methodWithThermodynamics,
              gregsEnergy: 0.5, // Fallback
              matchReason: 'No specific cosmic alignment'
            };
          }
        })
      );
      
      // Sort methods by gregsEnergy score in descending order
      const sortedMethods = methodsWithScores
        .sort((a, b) => b.gregsEnergy - a.gregsEnergy);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setRecommendedMethods(sortedMethods as any);
        
        // Also set planetary cooking methods with safe array access
        const planetaryCookingMethodsMap: Record<string, string[]> = {};
        if (Array.isArray(planets)) {
          planets.forEach(planet => {
            const methodsForPlanet = sortedMethods
              .filter(method => 
                method.astrologicalInfluences.dominantPlanets.includes(planet)
              )
              .map(method => String((method as Record<string, unknown>).name || ''));
            
            if (Array.isArray(methodsForPlanet) && methodsForPlanet.length > 0) {
              planetaryCookingMethodsMap[planet] = methodsForPlanet ;
            }
          });
        }
        
        setPlanetaryCookingMethods(planetaryCookingMethodsMap);
        
        // Store the initial scores in our state AFTER sorting the methods
        // Use method.id or name as a more reliable key instead of index
        const scoreMap: Record<string, number> = {};
        sortedMethods.forEach((method) => {
          const scoreKey = method.id || method.name || 'unknown';
          scoreMap[String(scoreKey)] = method.gregsEnergy || 0.5;
        });
        setMethodScores(scoreMap);
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching cooking methods:', error);
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isMountedRef, normalizeAstroState, commonCookingMethods, domElements]);

  // Fetch methods when component mounts or fetchMethods changes
  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

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

  // Enhance the renderMethodCard function to display score details
  const renderMethodCard = (method: ExtendedAlchemicalItem) => {
    // ... existing code ...

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
        className={`${(styles as Record<string, unknown>).methodCard} ${isExpanded[method.name || ''] ? styles.expanded : ''}`}
        onClick={() => toggleMethodExpansion(method.name || '')}
      >
        {/* Existing card content */}
        {/* ... */}
        
        {/* Add this new section for score details */}
        <div className={styles.scoreSection}>
          <div className={styles.scoreHeader} onClick={(e) => toggleScoreDetails(e, method.name || '')}>
            <span>Match Score: {((method.score || 0) * 100).toFixed(0)}%</span>
            <button 
              className={styles.scoreDetailsButton}
              aria-label="Toggle score details"
            >
              {showScoreDetails[method.name || ''] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {showScoreDetails[method.name || ''] && method.scoreDetails && (
            <div className={styles.scoreDetails}>
              <h4>Score Breakdown:</h4>
              <ul className={styles.scoreDetailsList}>
                {method.scoreDetails.elemental !== undefined && (
                  <li>
                    <span>Elemental:</span> 
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.elemental || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.elemental || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.astrological !== undefined && (
                  <li>
                    <span>Astrological:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.astrological || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.astrological || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.seasonal !== undefined && (
                  <li>
                    <span>Seasonal:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.seasonal || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.seasonal || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.tools !== undefined && (
                  <li>
                    <span>Tools:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.tools || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.tools || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.dietary !== undefined && (
                  <li>
                    <span>Dietary:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.dietary || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.dietary || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.cultural !== undefined && (method.scoreDetails.cultural || 0) > 0 && (
                  <li>
                    <span>Cultural:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.cultural || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.cultural || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.lunar !== undefined && (method.scoreDetails.lunar || 0) > 0 && (
                  <li>
                    <span>Lunar:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.lunar || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.lunar || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.venus !== undefined && (method.scoreDetails.venus || 0) > 0 && (
                  <li>
                    <span>Venus:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails.venus || 0) * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails.venus || 0) * 100).toFixed(0)}%</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        {/* Rest of card content */}
        {/* ... */}
      </div>
    );
  };

  // ... rest of the component ...
}
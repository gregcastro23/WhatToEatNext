
// Enhanced interfaces for Phase 11 - CookingMethods component
interface CookingMethodComponentProps {
  method?: {
    name?: string;
    description?: string;
    element?: string;
    season?: string | string[];
    astrologicalProfile?: Record<string, any>;
    elementalProperties?: {
      Fire?: number;
      Water?: number;
      Earth?: number;
      Air?: number;
    };
  };
  onMethodSelect?: (method: any) => void;
  selectedMethod?: string;
}

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

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, Globe, Clock, 
  Thermometer, Timer, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import styles from './CookingMethods.module.css';
import { RecommendationAdapter } from '@/services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty, ElementalCharacter } from '@/constants/planetaryElements';
import { planetaryFoodAssociations, Planet } from '@/constants/planetaryFoodAssociations';
import type { LunarPhase } from '@/constants/lunarPhases';
import type { ElementalProperties, ZodiacSign, CookingMethod, BasicThermodynamicProperties } from '@/types/alchemy';
import { COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { getCachedCalculation } from '@/utils/calculationCache';
import { useCurrentChart } from '@/hooks/useCurrentChart';
import { testCookingMethodRecommendations } from '../utils/testRecommendations';

// Import cooking methods from both traditional and cultural sources
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { culturalCookingMethods, getCulturalVariations } from '@/utils/culturalMethodsAggregator';
import { allCookingMethods } from '@/data/cooking';
import { molecularCookingMethods } from '@/data/cooking/molecularMethods';

// Add this import at the top with the other imports
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { getLunarMultiplier } from '@/utils/lunarMultiplier';

// Add these imports or declarations at the top of the component
import { useTarotContext } from '@/contexts/TarotContext'; // If this exists in your app

// Add import for modality type and utils
import type { Modality } from '@/data/ingredients/types';
import { determineIngredientModality } from '@/utils/ingredientUtils';

// Utility functions for alchemical calculations
// Simple placeholder implementations if actual implementations aren't accessible
import { staticAlchemize } from '@/utils/alchemyInitializer';

// Implement the alchemize function using staticAlchemize
const alchemize = async (
  elements: ElementalProperties | Record<string, number>,
  astroState: unknown,
  thermodynamics: unknown
): Promise<any> => {
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
    if (astroState && (astroState as any)?.planetaryPositions) {
      // Convert astroState planetary positions to the format expected by the alchemizer
      Object.entries((astroState as any)?.planetaryPositions).forEach(([planet, position]: [string, any]) => {
        if (position && position.sign) {
          horoscopeDict.tropical.CelestialBodies[planet] = {
            Sign: { label: position.sign },
            ChartPosition: {
              Ecliptic: {
                ArcDegreesInSign: position.degree || 0
              }
            }
          };
        }
      });
    }

    // Use the static alchemize function to get the full result
    const alchemicalResult = staticAlchemize(birthInfo, horoscopeDict);

    // Combine the result with the input elements and thermodynamics
    return {
      ...alchemicalResult,
      elementalProperties: elements,
      transformedElementalProperties: {
        Fire: (alchemicalResult as any)?.elementalBalance?.fire || 0,
        Water: (alchemicalResult as any)?.elementalBalance?.water || 0,
        Earth: (alchemicalResult as any)?.elementalBalance?.earth || 0,
        Air: (alchemicalResult as any)?.elementalBalance?.air || 0
      },
      heat: thermodynamics?.heat || alchemicalResult.heat || 0.5,
      entropy: thermodynamics?.entropy || alchemicalResult.entropy || 0.5,
      reactivity: thermodynamics?.reactivity || alchemicalResult.reactivity || 0.5,
      energy: thermodynamics?.energy || alchemicalResult.energy || 0.5
    };
  } catch (error) {
    console.error('Error in alchemize function:', error);
    // Fallback to simple implementation if there's an error
    return {
      ...elements,
      alchemicalProperties: {},
      transformedElementalProperties: elements,
      heat: thermodynamics?.heat || 0.5,
      entropy: thermodynamics?.entropy || 0.5,
      reactivity: thermodynamics?.reactivity || 0.5,
      energy: 0.5
    };
  }
};

const calculateMatchScore = (elements: unknown): number => {
  if (!elements) return 0;
  
  // More sophisticated calculation that weights the properties differently
  // Heat and reactivity are positive factors, while high entropy is generally a negative factor
  const heatScore = elements.heat || 0;
  const entropyScore = 1 - (elements.entropy || 0); // Invert entropy so lower is better
  const reactivityScore = elements.reactivity || 0;
  
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

// Define an interface for the astrologicalInfluences to fix the property access issue
interface AstrologicalInfluence {
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  lunarPhaseEffect?: Record<string, number>;
  dominantPlanets?: string[];
  rulingPlanets?: string[] | string; // Allow both string and string array types
}

// Extend the AlchemicalItem interface to include astrologicalInfluences and culturalOrigin
interface ExtendedAlchemicalItem extends AlchemicalItem {
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
}

// Define cooking time recommendations by ingredient class
interface CookingTimeRecommendation {
  ingredientClass: string;
  timeRange: string;
  tips: string;
}

// Add this new interface for molecular gastronomy details
interface MolecularGastronomyDetails {
  chemicalProcess: string;
  precisionRequirements: string;
  commonErrors: string[];
  advancedEquipment: string[];
  texturalOutcomes: string[];
}

// At the top level of your component file, before your component function
// Define the types if needed

// Add these methods if they're missing from your COOKING_METHOD_THERMODYNAMICS constant
const ADDITIONAL_THERMODYNAMICS = Object.entries(allCookingMethods)
  .reduce((acc, [methodName, methodData]) => {
    if (methodData && methodData.thermodynamicProperties) {
      acc[methodName] = methodData.thermodynamicProperties;
    }
    return acc;
  }, {} as Record<string, ThermodynamicProperties>);

// Merge with your existing COOKING_METHOD_THERMODYNAMICS constant

// Add this utility function to provide fallback information for any method
const generateMethodInfo = (methodName: string): {
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
  const phaseLower = (phase as any)?.toLowerCase?.();
  
  if ((phaseLower as any)?.includes?.('full') && (phaseLower as any)?.includes?.('moon')) {
    return 'FULL_MOON';
  }
  if ((phaseLower as any)?.includes?.('new') && (phaseLower as any)?.includes?.('moon')) {
    return 'NEW_MOON';
  }
  if ((phaseLower as any)?.includes?.('waxing') && (phaseLower as any)?.includes?.('crescent')) {
    return 'WAXING_CRESCENT';
  }
  if ((phaseLower as any)?.includes?.('first') && (phaseLower as any)?.includes?.('quarter')) {
    return 'FIRST_QUARTER';
  }
  if ((phaseLower as any)?.includes?.('waxing') && (phaseLower as any)?.includes?.('gibbous')) {
    return 'WAXING_GIBBOUS';
  }
  if ((phaseLower as any)?.includes?.('waning') && (phaseLower as any)?.includes?.('gibbous')) {
    return 'WANING_GIBBOUS';
  }
  if ((phaseLower as any)?.includes?.('last') && (phaseLower as any)?.includes?.('quarter')) {
    return 'LAST_QUARTER';
  }
  if ((phaseLower as any)?.includes?.('waning') && (phaseLower as any)?.includes?.('crescent')) {
    return 'WANING_CRESCENT';
  }
  
  return undefined;
};

// Helper for adapting between LunarPhase types
const adaptLunarPhase = (phase: LunarPhase | undefined): unknown => {
  if (!phase) return undefined;
  // Convert from our uppercase format to the format expected by the API
  // This part needs to be adjusted based on what the external functions expect
  return LUNAR_PHASE_DISPLAY[phase]?.toLowerCase();
};


// Missing function definitions for CookingMethods component
function getIdealIngredients(method: any): string[] {
  // Placeholder implementation
  return method?.idealIngredients || [];
}

function determineMatchReason(ingredient: any, method: any): string {
  // Placeholder implementation
  return "Compatible elemental properties";
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

export default function CookingMethods() {
  // Add renderCount ref for debugging
  const renderCount = useRef(0);
  // Use ref for tracking component mounted state
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  
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
  }, []);
  
  // Get astrological state
  const {
    isReady,
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
  
  const methodToThermodynamics = (method: unknown): BasicThermodynamicProperties => {
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
    
    // Check if the method has direct thermodynamic properties
    if ('heat' in method && 'entropy' in method && 'reactivity' in method) {
      return {
        heat: method.heat || 0.5,
        entropy: method.entropy || 0.5,
        reactivity: method.reactivity || 0.5
      };
    }
    
    // Look for the method in the COOKING_METHOD_THERMODYNAMICS constant
    for (const knownMethod of Object.keys(COOKING_METHOD_THERMODYNAMICS)) {
      if ((methodName as any)?.includes?.(knownMethod)) {
        return COOKING_METHOD_THERMODYNAMICS[knownMethod as CookingMethod];
      }
    }
    
    // Fallback values based on method characteristics
    if ((methodName as any)?.includes?.('grill') || (methodName as any)?.includes?.('roast') || (methodName as any)?.includes?.('fry')) {
      return { heat: 0.8, entropy: 0.6, reactivity: 0.7 }; // High heat methods
    } else if ((methodName as any)?.includes?.('steam') || (methodName as any)?.includes?.('simmer') || (methodName as any)?.includes?.('poach')) {
      return { heat: 0.4, entropy: 0.3, reactivity: 0.5 }; // Medium heat methods
    } else if ((methodName as any)?.includes?.('raw') || (methodName as any)?.includes?.('ferment') || (methodName as any)?.includes?.('pickle')) {
      return { heat: 0.1, entropy: 0.5, reactivity: 0.4 }; // No/low heat methods
    }
    
    // Default values
    return { heat: 0.5, entropy: 0.5, reactivity: 0.5 };
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

  // Add this simple fallback 
  const [tarotData] = useState(DEFAULT_TAROT_DATA);
  const { tarotCard, tarotElementalInfluences } = useTarotContext();

  // Add state for modality filtering
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  // Add these near the top with other state variables
  const [searchIngredient, setSearchIngredient] = useState<string>('');
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});

  // Add this function to calculate ingredient compatibility with methods
  const calculateIngredientCompatibility = (ingredient: string) => {
    if (!ingredient.trim()) return;
    
    // Create a compatibility map
    const compatibilityMap: Record<string, number> = {};
    
    recommendedMethods.forEach(method => {
      if ((method as any)?.elementalProperties) {
        // Create basic compatibility score based on elemental properties
        // This is a simplified version - you would use your actual compatibility calculation
        let compatibilityScore = 0.5; // Default medium compatibility
        
        // Check if ingredient is in the method's suitable_for list
        if (method.suitable_for && method.suitable_for.some(item => 
          (item as any)?.toLowerCase?.().includes((ingredient as any)?.toLowerCase?.())
        )) {
          compatibilityScore += 0.3; // Big boost for explicitly suitable ingredients
        }
        
        // Store the compatibility score
        compatibilityMap[(method as any)?.id || (method as any)?.name] = Math.min(1.0, compatibilityScore);
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
        map[culture].push((method as any)?.id);
      });
      
      return map;
    } catch (error) {
      console.error("Error initializing culture map:", error);
      return map;
    }
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
    const methodName = (method as any)?.(name as any)?.toLowerCase?.() as CookingMethod;
    if (COOKING_METHOD_THERMODYNAMICS && COOKING_METHOD_THERMODYNAMICS[methodName]) {
      return COOKING_METHOD_THERMODYNAMICS[methodName][property as keyof BasicThermodynamicProperties] || 0;
    }
    
    // Generate values based on method name keywords if no explicit values found
    // This ensures all methods have reasonable thermodynamic values
    const methodLower = (method as any)?.(name as any)?.toLowerCase?.();
    
    if (property === 'heat') {
      if ((methodLower as any)?.includes?.('boil') || (methodLower as any)?.includes?.('fry') || 
          (methodLower as any)?.includes?.('grill') || (methodLower as any)?.includes?.('roast')) {
        return 0.8; // High heat methods
      } else if ((methodLower as any)?.includes?.('steam') || (methodLower as any)?.includes?.('simmer') || 
                 (methodLower as any)?.includes?.('poach')) {
        return 0.4; // Medium heat methods
      } else if ((methodLower as any)?.includes?.('ferment') || (methodLower as any)?.includes?.('cure') || 
                 (methodLower as any)?.includes?.('pickle') || (methodLower as any)?.includes?.('raw')) {
        return 0.1; // Low/no heat methods
      }
      return 0.5; // Default medium heat
    }
    
    if (property === 'entropy') {
      if ((methodLower as any)?.includes?.('ferment') || (methodLower as any)?.includes?.('brais') || 
          (methodLower as any)?.includes?.('stew')) {
        return 0.8; // High breakdown methods
      } else if ((methodLower as any)?.includes?.('marinate') || (methodLower as any)?.includes?.('tenderize')) {
        return 0.6; // Medium breakdown methods
      } else if ((methodLower as any)?.includes?.('steam') || (methodLower as any)?.includes?.('poach')) {
        return 0.3; // Low breakdown methods
      }
      return 0.5; // Default medium entropy
    }
    
    if (property === 'reactivity') {
      if ((methodLower as any)?.includes?.('grill') || (methodLower as any)?.includes?.('sear') || 
          (methodLower as any)?.includes?.('roast') || (methodLower as any)?.includes?.('broil')) {
        return 0.8; // High reactivity methods (Maillard reactions)
      } else if ((methodLower as any)?.includes?.('ferment') || (methodLower as any)?.includes?.('pickle') || 
                 (methodLower as any)?.includes?.('cure')) {
        return 0.7; // Medium-high reactivity methods (chemical transformations)
      } else if ((methodLower as any)?.includes?.('steam') || (methodLower as any)?.includes?.('poach')) {
        return 0.3; // Low reactivity methods
      }
      return 0.5; // Default medium reactivity
    }
    
    return 0.5; // Default medium value
  };

  const getMolecularDetails = (method: ExtendedAlchemicalItem): MolecularGastronomyDetails | null => {
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
    
    // Only return molecular details for molecular gastronomy methods
    if (
      (methodName as any)?.includes?.('spher') || 
      (methodName as any)?.includes?.('molecular') || 
      (methodName as any)?.includes?.('gelif') || 
      (methodName as any)?.includes?.('emulsif') || 
      (methodName as any)?.includes?.('cryo') ||
      (methodName as any)?.includes?.('foam')
    ) {
      return {
        chemicalProcess: 'Manipulation of food structure at molecular level',
        precisionRequirements: 'High precision in temperature, timing, and ingredient ratios',
        commonErrors: [
          'Incorrect calcium bath concentration',
          'Improper pH balance',
          'Temperature fluctuations',
          'Inconsistent spherification timing'
        ],
        advancedEquipment: [
          'Precision scale',
          'pH meter',
          'Digital thermometer',
          'Immersion circulator',
          'Syringe or pipette set'
        ],
        texturalOutcomes: [
          'Gel-like exterior with liquid interior',
          'Stable foam structure',
          'Modified viscosity',
          'Controlled denaturation'
        ]
      };
    }
    
    // Return null for non-molecular cooking methods
    return null;
  };

  // Add this function to extract additional properties from source data
  const getMethodSpecificData = (method: ExtendedAlchemicalItem) => {
    if ((method as any)?.id && cookingMethods[(method as any)?.id as CookingMethod]) {
      const sourceData = cookingMethods[(method as any)?.id as CookingMethod];
      
      return {
        benefits: sourceData?.benefits || [],
        chemicalChanges: sourceData?.chemicalChanges || {},
        safetyFeatures: sourceData?.safetyFeatures || [],
        nutrientRetention: sourceData?.nutrientRetention || {},
        regionalVariations: sourceData?.regionalVariations || {},
        astrologicalInfluences: sourceData?.astrologicalInfluences || {}
      };
    }
    
    // Check if it's a molecular method
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
    if (
      (methodName as any)?.includes?.('spher') || 
      (methodName as any)?.includes?.('gel') || 
      (methodName as any)?.includes?.('emuls') || 
      (methodName as any)?.includes?.('cryo')
    ) {
      // Try to find in molecular methods
      const molecularKey = Object.keys(molecularCookingMethods).find(
        key => (key as any)?.toLowerCase?.().includes(methodName.split(' ')[0].toLowerCase())
      );
      
      if (molecularKey && molecularCookingMethods[molecularKey as CookingMethod]) {
        const sourceData = molecularCookingMethods[molecularKey as CookingMethod];
        return {
          benefits: sourceData?.benefits || [],
          chemicalChanges: sourceData?.chemicalChanges || {},
          toolsRequired: sourceData?.toolsRequired || [],
          optimalTemperatures: sourceData?.optimalTemperatures || {}
        };
      }
    }
    
    return null;
  }

  // First, add this new helper function to get detailed examples for each cooking method
  const getMethodDetails = (method: ExtendedAlchemicalItem): { examples: string[], fullDefinition: string } => {
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
    
    // Default values
    let examples: string[] = [];
    let fullDefinition = (method as any)?.description || "";
    
    // Check if we have data from the source first
    if ((method as any)?.id && cookingMethods[(method as any)?.id as CookingMethod]) {
      const sourceMethod = cookingMethods[(method as any)?.id as CookingMethod];
      // Expand definition if needed
      if (sourceMethod?.description && (sourceMethod as any)?.(description as any)?.length > (method as any)?.description?.length) {
        fullDefinition = (sourceMethod as any)?.description;
      }
      
      // Use existing suitable_for as examples if available
      if (sourceMethod?.suitable_for && (sourceMethod.suitable_for as any)?.length > 0) {
        examples = (sourceMethod.suitable_for as any)?.map?.(item => {
          // Transform "pasta" to "Pasta dishes (spaghetti, lasagna)"
          if (item === "pasta") return "Pasta dishes (spaghetti, lasagna, ravioli)";
          if (item === "rice") return "Rice dishes (risotto, paella, biryani)";
          if (item === "vegetables") return "Vegetables (carrots, broccoli, cauliflower)";
          if (item === "meat") return "Meat (steak, chicken, pork chops)";
          if (item === "fish") return "Fish (salmon, cod, trout)";
          if (item === "eggs") return "Eggs (omelets, frittatas, poached eggs)";
          if (item === "legumes") return "Legumes (beans, lentils, chickpeas)";
          return item.charAt(0).toUpperCase() + item.slice(1);
        });
        return { examples, fullDefinition };
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
        fullDefinition = "Solenije (солéнье) is a traditional Eastern European preservation technique that uses salt brine fermentation to preserve vegetables. Unlike Western pickling methods that rely heavily on vinegar, solenije uses a natural fermentation process where lactobacillus bacteria converts sugars to lactic acid, creating a tangy flavor and preservative environment. The term comes from the Russian word for salt - 'sol'.";
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
        examples = getIdealIngredients(method).map(ingredient => `${ingredient}`);
    }
    
    return { examples, fullDefinition };
  };

  // Replace getNutritionalImpact function with getIngredientCompatibility
  const getIngredientCompatibility = (method: ExtendedAlchemicalItem): { 
    compatibility: string, 
    idealCharacteristics: string[],
    avoidCharacteristics: string[]
  } => {
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
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
        if ((methodName as any)?.includes?.('fry')) {
          compatibility = "Best for foods that benefit from crisp exterior and quick cooking";
          idealCharacteristics = [
            "Items with natural structure that can withstand hot oil",
            "Foods where crisp exterior and moist interior is desired",
            "Ingredients that cook quickly and evenly",
            "Battered or breaded items requiring rapid setting"
          ];
        } else if ((methodName as any)?.includes?.('roast')) {
          compatibility = "Ideal for items needing even browning and slow moisture release";
          idealCharacteristics = [
            "Larger cuts of meat that benefit from even heat penetration",
            "Vegetables where caramelization enhances flavor",
            "Foods that benefit from fat rendering and self-basting",
            "Items where surface browning and flavor development is key"
          ];
        } else {
          // Truly generic fallback with helpful guidance
          compatibility = `${(method as any)?.name} works best with ingredients suited to its thermal profile`;
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
    const methodName = (method as any)?.(name as any)?.toLowerCase?.();
    
    // If the method already has valid elemental properties, use those
    if ((method as any)?.elementalProperties && 
        Object.values((method as any)?.elementalProperties).some(val => val > 0)) {
      return (method as any)?.elementalProperties;
    }
    
    // Generate method-specific elemental properties
    const properties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    if ((methodName as any)?.includes?.('solenije') || (methodName as any)?.includes?.('pickle')) {
      properties.Water = 0.5;
      properties.Earth = 0.3;
      properties.Air = 0.1;
      properties.Fire = 0.1;
    } else if ((methodName as any)?.includes?.('confit')) {
      properties.Fire = 0.4;
      properties.Earth = 0.4;
      properties.Water = 0.1;
      properties.Air = 0.1;
    } else if ((methodName as any)?.includes?.('tagine')) {
      properties.Earth = 0.4;
      properties.Water = 0.3;
      properties.Fire = 0.2;
      properties.Air = 0.1;
    } else if ((methodName as any)?.includes?.('nixtamal')) {
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
    const elementalEffect = (method as any)?.elementalEffect || {};
    
    const fireAirSum = (elementalEffect.Fire || 0) + (elementalEffect.Air || 0);
    const earthWaterSum = (elementalEffect.Earth || 0) + (elementalEffect.Water || 0);
    
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
    console.log("Running cooking method recommendations test...");
    testCookingMethodRecommendations();
  }, []);
  
  // Update the fetchMethods function to use isMountedRef
  const fetchMethods = async () => {
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
        (baseMethods as any)?.map?.(async (method) => {
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
              (method as any)?.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
              astroState,
              thermodynamics
            );
            
            // Calculate match score with enhanced algorithm for better differentiation
            const baseScore = calculateMatchScore(alchemized);
            
            // Add additional factors to differentiate scores
            let adjustedScore = baseScore;
            
            // Add zodiac sign affinity bonus/penalty - larger bonus for better differentiation
            if ((astroState as any)?.zodiacSign && method.astrologicalInfluences?.favorableZodiac?.includes((astroState as any)?.zodiacSign)) {
              adjustedScore += 0.2; // Increased from 0.15 for better differentiation
            } else if ((astroState as any)?.zodiacSign && method.astrologicalInfluences?.unfavorableZodiac?.includes((astroState as any)?.zodiacSign)) {
              adjustedScore -= 0.15; // Made penalty stronger
            }
            
            // Add lunar phase adjustment with stronger effect
            if ((astroState as any)?.lunarPhase) {
              const lunarMultiplier = getLunarMultiplier((astroState as any)?.lunarPhase);
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
            const matchReason = determineMatchReason(methodWithThermodynamics, (astroState as any)?.zodiacSign, (astroState as any)?.lunarPhase);
            
            return {
              ...methodWithThermodynamics,
              alchemicalProperties: alchemized.alchemicalProperties,
              transformedElementalProperties: alchemized.transformedElementalProperties,
              heat: alchemized.heat,
              entropy: alchemized.entropy,
              reactivity: alchemized.reactivity,
              energy: alchemized.energy,
              gregsEnergy: finalScore,
              matchReason
            };
          } catch (err) {
            console.error(`Error processing method ${(method as any)?.name}:`, err);
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
        setRecommendedMethods(sortedMethods);
        
        // Also set planetary cooking methods
        const planetaryCookingMethodsMap: Record<string, string[]> = {};
        planets.forEach(planet => {
          const methodsForPlanet = sortedMethods
            .filter(method => 
              method.astrologicalInfluences?.dominantPlanets?.includes(planet)
            )
            .map(method => (method as any)?.name);
          
          if ((methodsForPlanet as any)?.length > 0) {
            planetaryCookingMethodsMap[planet] = methodsForPlanet;
          }
        });
        
        setPlanetaryCookingMethods(planetaryCookingMethodsMap);
        
        // Store the initial scores in our state AFTER sorting the methods
        // Use (method as any)?.id or name as a more reliable key instead of index
        const scoreMap: Record<string, number> = {};
        sortedMethods.forEach((method) => {
          const scoreKey = (method as any)?.id || (method as any)?.name;
          scoreMap[scoreKey] = method.gregsEnergy || 0.5;
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
    const newCulture = (e as any)?.target?.value;
    setSelectedCulture(newCulture);
    // Refetch methods with the new culture filter
    fetchMethods();
  };
  
  // Add a new state to control the display of score details
  const [showScoreDetails, setShowScoreDetails] = useState<Record<string, boolean>>({});

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
        className={`${(styles as any)?.methodCard} ${isExpanded[(method as any)?.name] ? styles.expanded : ''}`}
        onClick={() => toggleMethodExpansion((method as any)?.name)}
      >
        {/* Existing card content */}
        {/* ... */}
        
        {/* Add this new section for score details */}
        <div className={styles.scoreSection}>
          <div className={styles.scoreHeader} onClick={(e) => toggleScoreDetails(e, (method as any)?.name)}>
            <span>Match Score: {(method.score * 100).toFixed(0)}%</span>
            <button 
              className={styles.scoreDetailsButton}
              aria-label="Toggle score details"
            >
              {showScoreDetails[(method as any)?.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {showScoreDetails[(method as any)?.name] && method.scoreDetails && (
            <div className={styles.scoreDetails}>
              <h4>Score Breakdown:</h4>
              <ul className={styles.scoreDetailsList}>
                {(method.scoreDetails as any)?.elemental !== undefined && (
                  <li>
                    <span>Elemental:</span> 
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails as any)?.elemental * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails as any)?.elemental * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.astrological !== undefined && (
                  <li>
                    <span>Astrological:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.astrological * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.astrological * 100).toFixed(0)}%</span>
                  </li>
                )}
                {(method.scoreDetails as any)?.seasonal !== undefined && (
                  <li>
                    <span>Seasonal:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, (method.scoreDetails as any)?.seasonal * 100)}%`}}
                      />
                    </div>
                    <span>{((method.scoreDetails as any)?.seasonal * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.tools !== undefined && (
                  <li>
                    <span>Tools:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.tools * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.tools * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.dietary !== undefined && (
                  <li>
                    <span>Dietary:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.dietary * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.dietary * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.cultural !== undefined && method.scoreDetails.cultural > 0 && (
                  <li>
                    <span>Cultural:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.cultural * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.cultural * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.lunar !== undefined && method.scoreDetails.lunar > 0 && (
                  <li>
                    <span>Lunar:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.lunar * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.lunar * 100).toFixed(0)}%</span>
                  </li>
                )}
                {method.scoreDetails.venus !== undefined && method.scoreDetails.venus > 0 && (
                  <li>
                    <span>Venus:</span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{width: `${Math.min(100, method.scoreDetails.venus * 100)}%`}}
                      />
                    </div>
                    <span>{(method.scoreDetails.venus * 100).toFixed(0)}%</span>
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
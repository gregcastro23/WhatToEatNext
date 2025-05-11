'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAstrologicalState } from '@/context/AstrologicalContext';
import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Globe,
  Clock,
  Thermometer,
  Timer,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import styles from './CookingMethods.module.css';
import { RecommendationAdapter } from '@/services';
import {
  ElementalItem,
  AlchemicalItem,
} from "@/calculations/alchemicalTransformation";
import {
  AlchemicalProperty,
  ElementalCharacter,
} from "@/constants/planetaryElements";
import {
  planetaryFoodAssociations,
  Planet,
} from "@/constants/planetaryFoodAssociations";
import { lunarPhases } from "@/constants";
import type {
  ElementalProperties,
  ZodiacSign,
  CookingMethod,
  BasicThermodynamicProperties,
} from "@/types/alchemy";
import { calculationCache } from "@/utils";
import { useCurrentChart } from '@/context/ChartContext';
import { testRecommendations } from "../utils";

// Import cooking methods from both traditional and cultural sources
import { cookingMethods, allCookingMethods } from '@/data/cooking';
import {
  culturalCookingMethods,
  getCulturalVariations,
} from "@/utils/culturalMethodsAggregator";
import { dryCookingMethods, moistCookingMethods } from '@/data/cooking';
import { herbalCookingMethods, exoticCookingMethods } from '@/data/cooking';

// Add this import at the top with the other imports
import { nutritionalCalculator } from '@/data/integrations';
import { lunarMultiplier } from '@/utils';

// Add these imports or declarations at the top of the component
import { TarotContext } from '@/contexts'; // If this exists in your app
import { useTarotContext, DEFAULT_TAROT_DATA } from '@/context/TarotContext';

// Add import for modality type and utils
import { ingredients } from '@/data';
import { ingredientUtils } from '@/utils';

// Import cookingMethodTips
import cookingMethodTips, { getTipsForMethod } from '@/utils/cookingMethodTips';

// Utility functions for alchemical calculations
// Simple placeholder implementations if actual implementations aren't accessible
import { staticAlchemize } from '@/utils/alchemyInitializer';

// Add these imports for calculation utilities
import { getHolisticCookingRecommendations, calculateCookingMethodCompatibility } from '@/utils/alchemicalPillarUtils';

// Implement the alchemize function using staticAlchemize
let alchemize = async (
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
      year: new Date().getFullYear(),
    };

    // Create a simplified horoscope object
    let horoscopeDict = {
      tropical: {
        CelestialBodies: {},
        Ascendant: {},
        Aspects: {},
      },
    };

    // If astroState contains planetary positions, add them to the horoscope
    if (astroState && astroState.planetaryPositions) {
      // Convert astroState planetary positions to the format expected by the alchemizer
      Object.entries(astroState.planetaryPositions).forEach(
        ([planet, position]: [string, any]) => {
          if (position && position.sign) {
            horoscopeDict.tropical.CelestialBodies[planet] = {
              Sign: { label: position.sign },
              ChartPosition: {
                Ecliptic: {
                  ArcDegreesInSign: position.degree || 0,
                },
              },
            };
          }
        }
      );
    }

    // Use the static alchemize function to get the full result
    let alchemicalResult = staticAlchemize(birthInfo, horoscopeDict);

    // Combine the result with the input elements and thermodynamics
    return {
      ...alchemicalResult,
      elementalProperties: elements,
      transformedElementalProperties: {
        Fire: alchemicalResult.elementalBalance?.fire || 0,
        Water: alchemicalResult.elementalBalance?.water || 0,
        Earth: alchemicalResult.elementalBalance?.earth || 0,
        Air: alchemicalResult.elementalBalance?.air || 0,
      },
      heat: thermodynamics?.heat || alchemicalResult.heat || 0.5,
      entropy: thermodynamics?.entropy || alchemicalResult.entropy || 0.5,
      reactivity:
        thermodynamics?.reactivity || alchemicalResult.reactivity || 0.5,
      energy: thermodynamics?.energy || alchemicalResult.energy || 0.5,
    };
  } catch (error) {
    // console.error('Error in alchemize function:', error);
    // Fallback to simple implementation if there's an error
    return {
      ...elements,
      alchemicalProperties: {},
      transformedElementalProperties: elements,
      heat: thermodynamics?.heat || 0.5,
      entropy: thermodynamics?.entropy || 0.5,
      reactivity: thermodynamics?.reactivity || 0.5,
      energy: 0.5,
    };
  }
};

// NOTE: normalizeAstroState and calculateMatchScore functions are defined inside the CookingMethods component

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
let ADDITIONAL_THERMODYNAMICS = Object.entries(allCookingMethods).reduce(
  (acc, [methodName, methodData]) => {
    if (methodData && methodData.thermodynamicProperties) {
      acc[methodName] = methodData.thermodynamicProperties;
    }
    return acc;
  },
  {} as Record<string, ThermodynamicProperties>
);

// Merge with your existing COOKING_METHOD_THERMODYNAMICS constant

// Add this utility function to provide fallback information for any method
let generateMethodInfo = (
  methodName: string
): {
  description: string;
  technicalTips: string[];
  idealIngredients: string[];
  timing: { duration: string; temperature?: string };
  impact: { impact: string; benefits: string[]; considerations: string[] };
} => {
  // Convert method name to human-readable form
  let readableName = methodName
    .replace(/_ / (g || 1), ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Special case for hand pounding
  if (methodName === 'hand_pounding' || methodName === 'hand pounding') {
    return {
      description:
        'Hand pounding is an ancient culinary technique utilizing a mortar and pestle to crush, grind, and blend ingredients through direct mechanical force. This method releases aromatic compounds and creates unique textures that modern electric processors cannot replicate. Hand pounding preserves traditional knowledge and produces superior textural and flavor profiles in many global cuisines.',

      technicalTips: [
        'Use the weight of the pestle rather than excessive force - let gravity do the work',
        'Maintain proper grip to prevent fatigue and ensure control over the pounding motion',
        'Start with a gentle crushing motion before progressing to more forceful pounding',
        'Work in small batches for consistency and better control over the final texture',
        'Consider temperature - some ingredients release flavors better at room temperature',
      ],

      idealIngredients: [
        'Fresh herbs like basil, cilantro, and mint for vibrant pastes and sauces',
        'Whole spices requiring crushing (peppercorns, coriander, cumin)',
        'Fibrous aromatics such as lemongrass, galangal, and ginger',
        'Nuts and seeds for pastes and spreads (pine nuts, sesame)',
        'Starchy foods like boiled yams, plantains, and cassava for African fufu',
      ],

      timing: {
        duration:
          '2-15 minutes depending on desired texture and ingredient hardness',
        temperature:
          'Ambient temperature (most effective between 65-75°F / (18 || 1)-24°C)',
      },

      impact: {
        impact:
          'Significantly enhances flavor extraction and creates unique textures impossible with machine processing',
        benefits: [
          'Releases natural oils and aromatics through cell wall rupture',
          'Creates varied textural dimensions with both smooth and coarse elements',
          'Preserves heat-sensitive compounds that might be damaged by mechanical processing',
          'Develops complex emulsions through gradual ingredient incorporation',
          'Allows precise control over final consistency',
        ],
        considerations: [
          'Labor-intensive nature requires proper technique to prevent strain',
          'Small batch processing may extend overall preparation time for large quantities',
          'Different mortar materials (stone, wood, ceramic) interact differently with ingredients',
          'Requires washing between batches to prevent flavor contamination',
        ],
      },
    };
  }

  // Default values that make sense for most cooking methods
  return {
    description: `${readableName} is a cooking technique that transforms ingredients through specific application of heat, pressure, or chemical processes. It's characterized by its unique approach to food preparation that affects texture, flavor, and nutritional properties.`,

    technicalTips: [
      'Research proper temperature and timing for specific ingredients',
      'Ensure proper preparation of ingredients before cooking',
      'Monitor the cooking process regularly for best results',
      'Allow appropriate resting or cooling time after cooking',
      'Consider how this method interacts with your specific ingredients',
    ],

    idealIngredients: [
      'Ingredients suited to this specific cooking method',
      "Foods that benefit from this method's unique properties",
      'Items traditionally prepared with this technique',
      'Refer to specific recipes for best ingredient pairings',
    ],

    timing: {
      duration: 'Varies by specific recipe and ingredient',
      temperature: 'Refer to specific recipe for precise temperatures',
    },

    impact: {
      impact: 'Variable impact depending on specific application',
      benefits: [
        'May enhance certain flavors or textures',
        'Could preserve specific nutrients depending on application',
        'Might improve digestibility of certain ingredients',
        'Often develops unique flavor compounds',
      ],
      considerations: [
        'Effects vary based on specific ingredients and timing',
        'Consider researching specific nutritional impacts for your ingredients',
        'Balance this cooking method with others for dietary variety',
      ],
    },
  };
};

// Add these at the top of the file (before the component function)
let DEFAULT_TAROT_DATA = {
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  },
};

// First, let's add a utility function to convert between the different lunar phase formats
// Add this near the top of your file, after the imports

// Map between title case format and uppercase underscore format
// Important: The values should match the LunarPhase type from constants / (lunarPhases || 1).ts
const LUNAR_PHASE_MAP: Record<string, LunarPhase> = {
  FULL_MOON: 'FULL_MOON',
  NEW_MOON: 'NEW_MOON',
  WAXING_CRESCENT: 'WAXING_CRESCENT',
  FIRST_QUARTER: 'FIRST_QUARTER',
  WAXING_GIBBOUS: 'WAXING_GIBBOUS',
  WANING_GIBBOUS: 'WANING_GIBBOUS',
  LAST_QUARTER: 'LAST_QUARTER',
  WANING_CRESCENT: 'WANING_CRESCENT',
};

// For display purposes
const LUNAR_PHASE_DISPLAY: Record<LunarPhase, string> = {
  FULL_MOON: 'Full Moon',
  NEW_MOON: 'New Moon',
  WAXING_CRESCENT: 'Waxing Crescent',
  FIRST_QUARTER: 'First Quarter',
  WAXING_GIBBOUS: 'Waxing Gibbous',
  WANING_GIBBOUS: 'Waning Gibbous',
  LAST_QUARTER: 'Last Quarter',
  WANING_CRESCENT: 'Waning Crescent',
};

// Function to safely convert any lunar phase string to the correct type
let normalizeLunarPhase = (
  phase: string | null | undefined
): LunarPhase | undefined => {
  if (!phase) return undefined;

  // If it's already a valid LunarPhase, return it
  if (Object.keys(LUNAR_PHASE_MAP).includes(phase)) {
    return phase as LunarPhase;
  }

  // Try to convert by looking for matching patterns
  let phaseLower = phase.toLowerCase();

  if (phaseLower.includes('full') && phaseLower.includes('moon')) {
    return 'FULL_MOON';
  }
  if (phaseLower.includes('new') && phaseLower.includes('moon')) {
    return 'NEW_MOON';
  }
  if (phaseLower.includes('waxing') && phaseLower.includes('crescent')) {
    return 'WAXING_CRESCENT';
  }
  if (phaseLower.includes('first') && phaseLower.includes('quarter')) {
    return 'FIRST_QUARTER';
  }
  if (phaseLower.includes('waxing') && phaseLower.includes('gibbous')) {
    return 'WAXING_GIBBOUS';
  }
  if (phaseLower.includes('waning') && phaseLower.includes('gibbous')) {
    return 'WANING_GIBBOUS';
  }
  if (phaseLower.includes('last') && phaseLower.includes('quarter')) {
    return 'LAST_QUARTER';
  }
  if (phaseLower.includes('waning') && phaseLower.includes('crescent')) {
    return 'WANING_CRESCENT';
  }

  return undefined;
};

// Helper for adapting between LunarPhase types
let adaptLunarPhase = (phase: LunarPhase | undefined): unknown => {
  if (!phase) return undefined;
  // Convert from our uppercase format to the format expected by the API
  // This part needs to be adjusted based on what the external functions expect
  return LUNAR_PHASE_DISPLAY[phase]?.toLowerCase();
};

// Add this constant for cooking method thermodynamics if it doesn't exist
const COOKING_METHOD_THERMODYNAMICS = {
  roasting: { heat: 0.8, entropy: 0.5, reactivity: 0.6 },
  steaming: { heat: 0.4, entropy: 0.2, reactivity: 0.3 },
  grilling: { heat: 0.9, entropy: 0.6, reactivity: 0.7 },
  boiling: { heat: 0.7, entropy: 0.4, reactivity: 0.5 },
  sauteing: { heat: 0.6, entropy: 0.5, reactivity: 0.7 },
  baking: { heat: 0.6, entropy: 0.4, reactivity: 0.5 },
  fermenting: { heat: 0.2, entropy: 0.8, reactivity: 0.9 },
  braising: { heat: 0.5, entropy: 0.3, reactivity: 0.4 },
  poaching: { heat: 0.3, entropy: 0.2, reactivity: 0.2 },
  smoking: { heat: 0.4, entropy: 0.6, reactivity: 0.7 },
  dehydrating: { heat: 0.3, entropy: 0.4, reactivity: 0.2 },
  pressure_cooking: { heat: 0.8, entropy: 0.5, reactivity: 0.6 },
  sous_vide: { heat: 0.3, entropy: 0.1, reactivity: 0.2 },
  pickling: { heat: 0.2, entropy: 0.7, reactivity: 0.8 }
};

// Define the Props interface for the component
interface CookingMethodsProps {
  onMethodsReady?: (methods: any[]) => void;
}

export default function CookingMethods({ onMethodsReady }: CookingMethodsProps = {}) {
  // Add renderCount ref for debugging
  let renderCount = useRef(0);
  // Use ref for tracking component mounted state
  let isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Add these state variables at the beginning of the component
  const [loading, setLoading] = useState(true);
  const [recommendedMethods, setRecommendedMethods] = useState<ExtendedAlchemicalItem[]>([]);
  const [methodScores, setMethodScores] = useState<Record<string, number>>({});
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  const [ingredient, setIngredient] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

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
    isDaytime,
  } = useAstrologicalState();

  const { chart } = useCurrentChart();

  // Fallback UI when no recommendations are available
  const renderFallback = () => (
    <div className={styles.cookingMethodsContainer}>
      <h2>Cooking Methods</h2>
      <p>Loading cooking method recommendations...</p>
    </div>
  );

  // Helper functions for the component
  const normalizeAstroState = () => {
    return {
      currentZodiac,
      lunarPhase,
      activePlanets,
      isDaytime,
      currentPlanetaryAlignment,
    };
  };

  // Calculate match score for cooking methods - single implementation
  const calculateMatchScore = (elements: any): number => {
    if (!elements) return 0.25; // Default score of 25% instead of 0

    // More sophisticated calculation that weights the properties differently
    // Heat and reactivity are positive factors, while high entropy is generally a negative factor
    let heatScore = elements.heat || 0;
    let entropyScore = 1 - (elements.entropy || 0); // Invert entropy so lower is better
    let reactivityScore = elements.reactivity || 0;

    // Calculate weighted average with more weight on heat and reactivity
    let rawScore = heatScore * 0.4 + entropyScore * 0.3 + reactivityScore * 0.3;

    // Apply a more moderate multiplier to ensure reasonable differentiation between methods
    // Using 1.8 instead of 2.5 to prevent extreme values
    let multiplier = 1.8;

    // Cap at 0.95 (95%) but ensure minimum of 0.15 (15%) for better score distribution
    return Math.min(0.95, Math.max(0.15, rawScore * multiplier));
  };

  // Replace the fetchMethods function with this improved version
  const fetchMethods = useCallback(() => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      
      // Get astrological data from context
      const astroState = normalizeAstroState();
      
      // Create a basic ingredient template if needed
      const basicIngredient = {
        name: 'Basic Ingredient',
        elementalProperties: {
          Fire: domElements?.fire || 0.25,
          Water: domElements?.water || 0.25,
          Earth: domElements?.earth || 0.25,
          Air: domElements?.air || 0.25
        }
      };

      setIngredient(basicIngredient);
      
      // Generate method recommendations using our enhanced alchemical utils
      const recommendations = getHolisticCookingRecommendations(basicIngredient);
      setRecommendations(recommendations || []);
      
      // Map recommendations to the expected structure with detailed scores
      const methodsList = recommendations.map(rec => {
        const methodName = rec.method;
        const methodData = cookingMethods[methodName];
        
        if (!methodData) return null;
        
        // Calculate detailed score components
        const elementalScore = domElements ? 
          calculateElementalScore(domElements, methodData.elementalEffect) : 0.5;
        
        const astrologicalScore = calculateAstrologicalScore(
          astroState, 
          methodData.astrologicalInfluences
        );
        
        const thermodynamicScore = methodData.thermodynamicProperties ? 
          calculateThermodynamicScore(methodData.thermodynamicProperties) : 0.5;
        
        // Add a small random variation to increase score diversity (0-10%)
        const variationFactor = Math.random() * 0.1;
        
        // Calculate combined score with weights
        const totalScore = (
          (elementalScore * 0.4) + 
          (astrologicalScore * 0.3) + 
          (thermodynamicScore * 0.3) +
          variationFactor
        );
        
        // Ensure score is valid number between 0.15-0.95
        const validScore = isNaN(totalScore) ? 0.5 : Math.max(0.15, Math.min(0.95, totalScore));
        
        return {
          ...methodData,
          name: methodName,
          score: validScore,
          scoreDetails: {
            elemental: elementalScore,
            astrological: astrologicalScore,
            thermodynamic: thermodynamicScore,
            variation: variationFactor,
            total: validScore
          }
        };
      }).filter(Boolean);
      
      // Sort by score
      const sortedMethods = methodsList.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setRecommendedMethods(sortedMethods);
      
      // Store initial scores for reference
      const scores = sortedMethods.reduce((acc, method) => {
        acc[method.name] = method.score || 0;
        return acc;
      }, {});
      
      setMethodScores(scores);
    } catch (error) {
      console.error('Error fetching cooking methods:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeAstroState, domElements]);

  // Add these helper functions for score calculation
  const calculateElementalScore = (domElements, methodElements) => {
    if (!domElements || !methodElements) return 0.5;
    
    // Calculate dot product for similarity
    let dotProduct = 0;
    let domMagnitude = 0;
    let methodMagnitude = 0;
    
    ['fire', 'water', 'earth', 'air'].forEach(elem => {
      const domValue = domElements[elem] || 0;
      // Map from lowercase to title case element names
      const methodElem = elem.charAt(0).toUpperCase() + elem.slice(1);
      const methodValue = methodElements[methodElem] || 0;
      
      dotProduct += domValue * methodValue;
      domMagnitude += domValue * domValue;
      methodMagnitude += methodValue * methodValue;
    });
    
    // Safety checks
    domMagnitude = Math.sqrt(domMagnitude || 0.0001);
    methodMagnitude = Math.sqrt(methodMagnitude || 0.0001);
    
    if (domMagnitude === 0 || methodMagnitude === 0) return 0.5;
    
    // Calculate cosine similarity and normalize to 0.2-0.9 range
    // This adjustment ensures more varied scores
    const similarity = dotProduct / (domMagnitude * methodMagnitude);
    return Math.max(0.2, Math.min(0.9, (similarity + 1) / 2));
  };

  const calculateAstrologicalScore = (astroState, methodAstro) => {
    if (!astroState || !methodAstro) return 0.5;
    
    let score = 0.4; // Start with a lower neutral score for more differentiation
    
    // Check for lunar phase compatibility
    if (astroState.lunarPhase && methodAstro.lunarPhaseEffect) {
      const lunarEffect = methodAstro.lunarPhaseEffect[astroState.lunarPhase] || 0;
      score += lunarEffect * 0.1; // Weight lunar phase as 10% of score
    }
    
    // Check for zodiac compatibility
    if (astroState.currentZodiac && methodAstro.favorableZodiac 
        && methodAstro.favorableZodiac.includes(astroState.currentZodiac)) {
      score += 0.15; // Boost score for favorable zodiac
    }
    
    if (astroState.currentZodiac && methodAstro.unfavorableZodiac 
        && methodAstro.unfavorableZodiac.includes(astroState.currentZodiac)) {
      score -= 0.1; // Reduce score for unfavorable zodiac
    }
    
    // Check for planet compatibility
    if (methodAstro.dominantPlanets && astroState.activePlanets) {
      const matchingPlanets = methodAstro.dominantPlanets.filter(
        planet => astroState.activePlanets.includes(planet)
      );
      
      if (matchingPlanets.length > 0) {
        score += 0.05 * matchingPlanets.length; // Each matching planet adds 5%
      }
    }
    
    // Ensure score is within bounds
    return Math.max(0.2, Math.min(0.9, score));
  };

  const calculateThermodynamicScore = (thermodynamics) => {
    if (!thermodynamics) return 0.5;
    
    // Calculate a balanced score based on heat, entropy, and reactivity
    const heatScore = thermodynamics.heat * 0.4; // Heat is 40% of score
    const entropyScore = (1 - thermodynamics.entropy) * 0.3; // Lower entropy is better (30%)
    const reactivityScore = thermodynamics.reactivity * 0.3; // Reactivity is 30%
    
    // Calculate weighted sum
    const score = heatScore + entropyScore + reactivityScore;
    
    // Normalize to 0.2-0.9 range for more variation
    return Math.max(0.2, Math.min(0.9, score * 1.2));
  };

  // Define the list of 14 common cooking methods to prioritize
  let commonCookingMethods = useMemo(
    () => [
      'baking',
      'roasting',
      'grilling',
      'broiling',
      'sauteing',
      'frying',
      'stir_frying',
      'boiling',
      'simmering',
      'steaming',
      'poaching',
      'sous_vide',
      'stewing',
      'blanching',
      'microwaving',
    ],
    []
  );

  let methodToThermodynamics = (
    method: unknown
  ): BasicThermodynamicProperties => {
    const methodName = (method as any)?.name || "";
    return cookingMethodThermodynamics[methodName.toLowerCase()] || {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
    };
  };

  const [planetaryCookingMethods, setPlanetaryCookingMethods] = useState<
    Record<string, string[]>
  >({});
  const [selectedCulture, setSelectedCulture] = useState<string>(''); // For culture filtering
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [expandedMolecular, setExpandedMolecular] = useState<
    Record<string, boolean>
  >({});
  const [showScoreDetails, setShowScoreDetails] = useState<
    {[key: string]: boolean}
  >({});

  // Toggle method expansion function
  const toggleMethodExpansion = (methodName: string) => {
    setShowScoreDetails(prev => ({
      ...prev,
      [methodName]: !prev[methodName],
    }));
  };

  // Render method card
  const renderMethodCard = (method: ExtendedAlchemicalItem) => {
    const toggleScoreDetails = (e: React.MouseEvent, methodName: string) => {
      e.stopPropagation();
      toggleMethodExpansion(methodName);
    };

    return (
      <div
        className={`${styles.methodCard} ${
          showScoreDetails[method.name as string] ? styles.expanded : ''
        }`}
        onClick={() => toggleScoreDetails(null, method.name as string)}
        key={method.name}
      >
        <h3>{method.name}</h3>
        <div className={styles.scoreContainer}>
          <div 
            className={styles.scoreBar}
            style={{ width: `${Math.round((method.score || 0) * 100)}%` }}
          />
          <span className={styles.scoreValue}>{Math.round((method.score || 0) * 100)}%</span>
        </div>
        
        <div className={styles.description}>
          {method.description || 'A cooking method that transforms ingredients through heat or other processes.'}
        </div>
        
        {/* Show elemental balance */}
        <div className={styles.elementalBalance}>
          {method.elementalEffect && Object.entries(method.elementalEffect).map(([element, value]) => 
            value > 0.2 && (
              <div key={element} className={`${styles.element} ${styles[element.toLowerCase()]}`}>
                {element === 'Fire' && <Flame size={16} />}
                {element === 'Water' && <Droplets size={16} />}
                {element === 'Earth' && <Mountain size={16} />}
                {element === 'Air' && <Wind size={16} />}
                <span>{Math.round((value as number) * 100)}%</span>
              </div>
            )
          )}
        </div>
        
        {/* Score details section */}
        <div className={styles.scoreSection}>
          <div
            className={styles.scoreHeader}
            onClick={(e) => toggleScoreDetails(e, method.name as string)}
          >
            <span>Match Details</span>
            <button
              className={styles.scoreDetailsButton}
              aria-label="Toggle score details"
            >
              {showScoreDetails[method.name as string] ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>

          {showScoreDetails[method.name as string] && method.scoreDetails && (
            <div className={styles.scoreDetails}>
              <ul className={styles.scoreDetailsList}>
                {method.scoreDetails.elemental !== undefined && (
                  <li>
                    <span>Elemental:</span>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{
                          width: `${Math.min(
                            100,
                            (method.scoreDetails.elemental || 0) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span>
                      {Math.round((method.scoreDetails.elemental || 0) * 100)}%
                    </span>
                  </li>
                )}
                {method.scoreDetails.astrological !== undefined && (
                  <li>
                    <span>Astrological:</span>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{
                          width: `${Math.min(
                            100,
                            (method.scoreDetails.astrological || 0) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span>
                      {Math.round((method.scoreDetails.astrological || 0) * 100)}%
                    </span>
                  </li>
                )}
                {method.scoreDetails.thermodynamic !== undefined && (
                  <li>
                    <span>Thermodynamic:</span>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{
                          width: `${Math.min(
                            100,
                            (method.scoreDetails.thermodynamic || 0) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span>
                      {Math.round((method.scoreDetails.thermodynamic || 0) * 100)}%
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        {/* Method benefits */}
        {method.benefits && method.benefits.length > 0 && (
          <div className={styles.benefits}>
            <strong>Benefits:</strong> {method.benefits.join(', ')}
          </div>
        )}
        
        {/* Tips for the method if expanded */}
        {showScoreDetails[method.name as string] && (
          <div className={styles.methodTips}>
            <h4>Tips:</h4>
            <ul>
              {getTipsForMethod(method.name as string).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Add a useEffect to pass the formatted methods to the parent component
  useEffect(() => {
    if (onMethodsReady && recommendedMethods && recommendedMethods.length > 0) {
      // Format methods for the CookingMethodsSection component
      const formattedMethods = recommendedMethods.map((method) => ({
        id: method.name.toLowerCase().replace(/\s+/g, '_'),
        name: method.name,
        description: method.description || 'A cooking method for food preparation',
        elementalEffect: method.elementalProperties || method.elementalEffect,
        duration: method.duration || { min: 10, max: 30 },
        suitable_for: method.bestFor || method.suitable_for || [],
        benefits: method.benefits || [],
        score: method.score !== undefined ? method.score : 0.5
      }));
      onMethodsReady(formattedMethods);
    }
  }, [recommendedMethods, onMethodsReady]);

  if (!ingredient || !recommendations || recommendations.length === 0) {
    return renderFallback();
  }
  
  // Actually render the cooking methods with scores
  return (
    <div className={styles.cookingMethodsContainer}>
      <h2>Recommended Cooking Methods</h2>
      {loading ? (
        <p>Loading cooking method recommendations...</p>
      ) : recommendedMethods.length === 0 ? (
        <p>No cooking methods found. Try selecting different ingredients.</p>
      ) : (
        <div className={styles.methodsGrid}>
          {recommendedMethods.slice(0, 8).map(renderMethodCard)}
        </div>
      )}
    </div>
  );
}

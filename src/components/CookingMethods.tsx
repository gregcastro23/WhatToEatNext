'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAstrologicalState } from '../hooks/useAstrologicalState';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, Globe, Clock, 
  Thermometer, Timer, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import styles from './CookingMethods.module.css';
import { RecommendationAdapter } from '../services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { AlchemicalProperty, ElementalCharacter } from '../constants/planetaryElements';
import { planetaryFoodAssociations, Planet } from '../constants/planetaryFoodAssociations';
import type { LunarPhase } from '../constants/lunarPhases';
import { 
  ElementalProperties, 
  ZodiacSign, 
  Element,
  Season,
  IngredientMapping
} from '../types/alchemy';
import { COOKING_METHOD_THERMODYNAMICS } from '../types/alchemy';
import { getCachedCalculation } from '../utils/calculationCache';
import { useCurrentChart } from '../hooks/useCurrentChart';
// Import similarity from ml-distance
import { similarity, distance } from 'ml-distance';
// Import ElementalCalculator
import { ElementalCalculator } from '../services/ElementalCalculator';

// Import cooking methods from both traditional and cultural sources
import { cookingMethods, getDetailedCookingMethod } from '../data/cooking/cookingMethods';
import { culturalCookingMethods, getCulturalVariations } from '../utils/culturalMethodsAggregator';
import { allCookingMethods } from '../data/cooking/methods';
import { molecularCookingMethods } from '../data/cooking/molecularMethods';

// Add this import at the top with the other imports
import { getCurrentSeason } from '../data/integrations/seasonal';
import { getLunarMultiplier } from '../utils/lunarMultiplier';

// Add these imports or declarations at the top of the component
import { useTarotContext } from '../contexts/TarotContext'; // If this exists in your app

// Add import for modality type and utils
import type { Modality } from '../data/ingredients/types';
import { determineIngredientModality } from '../utils/ingredientUtils';

// Utility functions for alchemical calculations
// Simple placeholder implementations if actual implementations aren't accessible
import { staticAlchemize } from '../utils/alchemyInitializer';

// Add the missing DEFAULT_TAROT_DATA constant near the top of the file
const DEFAULT_TAROT_DATA = {
  name: '',
  suits: [],
  majorArcana: [],
  elementalInfluences: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }
};

// Add tarot suit to elemental mapping
const TAROT_SUIT_TO_ELEMENT: Record<string, Element> = {
  'cups': 'Water',
  'swords': 'Air', 
  'pentacles': 'Earth',
  'wands': 'Fire'
};

// Reverse mapping for looking up suit by element
const ELEMENT_TO_TAROT_SUIT: Record<Element, string> = {
  'Water': 'cups',
  'Air': 'swords',
  'Earth': 'pentacles',
  'Fire': 'wands'
};

// Define ThermodynamicProperties interface
interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  energy?: number;
}

// Define BasicThermodynamicProperties interface
interface BasicThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
}

// Add CookingMethod type
type CookingMethod = string;

// Add MolecularGastronomyDetails interface
interface MolecularGastronomyDetails {
  technique: string;
  equipment: string[];
  principles: string[];
  examples: string[];
}

// Update the ExtendedAlchemicalItem interface to include all required properties
interface ExtendedAlchemicalItem extends Omit<AlchemicalItem, 'transformedElementalProperties'> {
  id: string;
  name: string;
  description?: string;
  elementalProperties: Record<string, number>;
  transformedElementalProperties: ElementalProperties;
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    lunarPhaseEffect?: Record<string, number>;
    dominantPlanets?: string[];
    rulingPlanets?: string[] | string;
  };
  culturalOrigin?: string;
  bestFor?: string[];
  duration?: {
    min: number;
    max: number;
  };
  optimalTemperatures?: Record<string, number>;
  thermodynamicProperties?: ThermodynamicProperties;
  suitable_for?: string[];
  benefits?: string[];
  score?: number;
  matchReason?: string;
  alchemicalProperties: Record<string, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  energy?: number;
  gregsEnergy: number;
  dominantElement: string;
  dominantAlchemicalProperty: string;
  planetaryBoost: number;
  dominantPlanets: string[];
  planetaryDignities: Record<string, unknown>;
}

// Define an interface for the elements parameter to ensure type safety
interface ElementData {
  elementalProperties?: ElementalProperties;
  transformedElementalProperties?: ElementalProperties;
  heat?: number;
  entropy?: number;
  reactivity?: number;
}

export default function CookingMethods() {
  // Add renderCount ref for debugging
  const renderCount = useRef(0);
  // Use ref for tracking component mounted state
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Get astrological state
  const {
    isReady,
    currentZodiac,
    currentPlanetaryAlignment,
    lunarPhase,
    activePlanets,
    domElements,
    isDaytime,
    currentPlanetaryHour
  } = useAstrologicalState();
  
  const { chart } = useCurrentChart();
  
  // Define states
  const [loading, setLoading] = useState(true);
  const [recommendedMethods, setRecommendedMethods] = useState<ExtendedAlchemicalItem[]>([]);
  const [planetaryCookingMethods, setPlanetaryCookingMethods] = useState<Record<string, string[]>>({});
  const [selectedCulture, setSelectedCulture] = useState<string>(''); // For culture filtering
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [expandedMolecular, setExpandedMolecular] = useState<Record<string, boolean>>({});
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  const [methodScores, setMethodScores] = useState<Record<string, number>>({});
  const [tarotData] = useState(DEFAULT_TAROT_DATA);
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [searchIngredient, setSearchIngredient] = useState<string>('');
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});
  
  // Create a fallback tarot context if real one isn't available
  const tarotContext = useMemo(() => ({
    tarotCard: null,
    tarotElementalInfluences: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  }), []);
  
  // Define the list of common cooking methods to prioritize
  const commonCookingMethods = useMemo(() => [
    'baking', 'roasting', 'grilling', 'broiling', 'sauteing', 
    'frying', 'stir_frying', 'boiling', 'simmering', 'steaming', 
    'poaching', 'sous_vide', 'stewing', 'blanching', 'microwaving'
  ], []);
  
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
        map[culture].push(method.id);
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
  
  // Increment render count on each render for debugging
  useEffect(() => {
    renderCount.current += 1;
  });
  
  // Helper functions for the component
  const normalizeAstroState = useCallback(() => {
    return {
      currentZodiac,
      lunarPhase,
      activePlanets: activePlanets || [],
      isDaytime: isDaytime || true,
      currentPlanetaryAlignment: currentPlanetaryAlignment || {},
      domElements: domElements || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      }
    };
  }, [currentZodiac, lunarPhase, activePlanets, isDaytime, currentPlanetaryAlignment, domElements]);
  
  // Calculate elemental similarity using ml-distance
  const calculateElementalSimilarity = useCallback((
    elementsA: ElementalProperties,
    elementsB: ElementalProperties
  ): number => {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    
    // Convert elemental properties to vectors for ml-distance
    const vectorA = elements.map(element => elementsA[element as keyof ElementalProperties] || 0);
    const vectorB = elements.map(element => elementsB[element as keyof ElementalProperties] || 0);
    
    // Use cosine similarity from ml-distance
    return similarity.cosine(vectorA, vectorB);
  }, []);
  
  // Get ideal ingredients for a cooking method
  const getIdealIngredients = useCallback((method: ExtendedAlchemicalItem | string): string[] => {
    const methodName = typeof method === 'string' ? method : method.name;
    
    // Default ingredients based on common cooking methods
    switch (methodName.toLowerCase()) {
      case 'roasting':
        return ['Meats', 'Root vegetables', 'Whole fish', 'Poultry', 'Winter squash'];
      case 'steaming':
        return ['Leafy greens', 'Fish fillets', 'Dumplings', 'Vegetables', 'Rice'];
      case 'grilling':
        return ['Steaks', 'Burgers', 'Kebabs', 'Bell peppers', 'Eggplant'];
      case 'frying':
        return ['Chicken cutlets', 'Potatoes', 'Fritters', 'Tempura vegetables', 'Seafood'];
      case 'baking':
        return ['Bread', 'Pastries', 'Casseroles', 'Pizza', 'Cakes'];
      case 'boiling':
        return ['Pasta', 'Eggs', 'Rice', 'Potatoes', 'Beans'];
      case 'braising':
        return ['Tough meat cuts', 'Short ribs', 'Chicken thighs', 'Cabbage', 'Root vegetables'];
      case 'sous vide':
        return ['Steaks', 'Fish', 'Eggs', 'Chicken breast', 'Vegetables'];
      case 'fermenting':
        return ['Cabbage', 'Milk', 'Grapes', 'Cucumbers', 'Soybeans'];
      case 'smoking':
        return ['Ribs', 'Brisket', 'Fish', 'Cheese', 'Sausages'];
      default:
        return ['Vegetables', 'Meat', 'Fish', 'Grains', 'Legumes'];
    }
  }, []);

  // Determine the match reason for a given method and astrological factors
  const determineMatchReason = useCallback((
    method: ExtendedAlchemicalItem, 
    zodiacSign?: ZodiacSign, 
    lunarPhase?: string
  ): string => {
    // Default reason
    let reason = "Based on your astrological profile";
    
    // Check if method is favorable for current zodiac sign
    if (zodiacSign && method.astrologicalInfluences?.favorableZodiac?.includes(zodiacSign as ZodiacSign)) {
      return `Highly compatible with ${zodiacSign}`;
    }
    
    // Check elemental influence
    if (method.elementalProperties) {
      // Find dominant element in the method
      const elements = ['Fire', 'Water', 'Earth', 'Air'];
      let dominantElement = elements[0];
      let maxValue = method.elementalProperties[dominantElement] || 0;
      
      elements.forEach(element => {
        const value = method.elementalProperties[element] || 0;
        if (value > maxValue) {
          maxValue = value;
          dominantElement = element;
        }
      });
      
      if (maxValue > 0.4) {
        reason = `Strong ${dominantElement} element`;
      }
    }
    
    return reason;
  }, []);
  
  // Method to thermodynamics mapping function
  const methodToThermodynamics = useCallback((method: unknown): BasicThermodynamicProperties => {
    // Use type assertion to access properties safely
    const typedMethod = method as { 
      name?: string; 
      heat?: number; 
      entropy?: number; 
      reactivity?: number 
    };
    const methodName = typedMethod.name?.toLowerCase() || '';
    
    // Check if the method has direct thermodynamic properties
    if (typedMethod.heat !== undefined && typedMethod.entropy !== undefined && typedMethod.reactivity !== undefined) {
      return {
        heat: typedMethod.heat,
        entropy: typedMethod.entropy,
        reactivity: typedMethod.reactivity
      };
    }
    
    // Look for the method in the COOKING_METHOD_THERMODYNAMICS constant
    for (const knownMethod of Object.keys(COOKING_METHOD_THERMODYNAMICS)) {
      if (methodName.includes(knownMethod)) {
        return COOKING_METHOD_THERMODYNAMICS[knownMethod as CookingMethod];
      }
    }
    
    // Fallback values based on method characteristics
    if (methodName.includes('grill') || methodName.includes('roast') || methodName.includes('fry')) {
      return { heat: 0.8, entropy: 0.6, reactivity: 0.7 }; // High heat methods
    } else if (methodName.includes('steam') || methodName.includes('simmer') || methodName.includes('poach')) {
      return { heat: 0.4, entropy: 0.3, reactivity: 0.5 }; // Medium heat methods
    } else if (methodName.includes('raw') || methodName.includes('ferment') || methodName.includes('pickle')) {
      return { heat: 0.1, entropy: 0.5, reactivity: 0.4 }; // No/low heat methods
    }
    
    // Default values
    return { heat: 0.5, entropy: 0.5, reactivity: 0.5 };
  }, []);
  
  // Get method modality affinity
  const getMethodModalityAffinity = useCallback((method: ExtendedAlchemicalItem): Modality => {
    // If method has explicit modality property, use it
    if (method.modality) {
      return method.modality as Modality;
    }
    
    // Otherwise calculate based on elemental properties
    const props = method.elementalProperties;
    const fireAirSum = (props.Fire || 0) + (props.Air || 0);
    const earthWaterSum = (props.Earth || 0) + (props.Water || 0);
    
    if (fireAirSum > earthWaterSum + 0.2) {
      return 'Cardinal';
    } else if (earthWaterSum > fireAirSum + 0.2) {
      return 'Fixed';
    } else {
      return 'Mutable';
    }
  }, []);
  
  // Calculate ingredient compatibility
  const calculateIngredientCompatibility = useCallback((ingredient: string) => {
    if (!ingredient.trim()) return;
    
    // Create a compatibility map
    const compatibilityMap: Record<string, number> = {};
    
    recommendedMethods.forEach(method => {
      if (method.elementalProperties) {
        // Create basic compatibility score based on elemental properties
        // This is a simplified version - you would use your actual compatibility calculation
        let compatibilityScore = 0.5; // Default medium compatibility
        
        // Check if ingredient is in the method's suitable_for list
        const suitableFor = method.suitable_for as string[] | undefined;
        if (suitableFor && Array.isArray(suitableFor)) {
          if (suitableFor.some(item => 
            item.toLowerCase().includes(ingredient.toLowerCase())
          )) {
            compatibilityScore += 0.3; // Big boost for explicitly suitable ingredients
          }
        }
        
        // Store the compatibility score
        compatibilityMap[method.id || method.name] = Math.min(1.0, compatibilityScore);
      }
    });
    
    // Update state with the compatibility scores
    setIngredientCompatibility(compatibilityMap);
  }, [recommendedMethods]);
  
  // Implement the alchemize function using staticAlchemize
  const alchemize = useCallback(async (
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
      if (astroState && (astroState as any).planetaryPositions) {
        // Convert astroState planetary positions to the format expected by the alchemizer
        Object.entries((astroState as any).planetaryPositions).forEach(([planet, position]: [string, any]) => {
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
          Fire: alchemicalResult.elementalBalance?.fire || 0,
          Water: alchemicalResult.elementalBalance?.water || 0,
          Earth: alchemicalResult.elementalBalance?.earth || 0,
          Air: alchemicalResult.elementalBalance?.air || 0
        },
        heat: (thermodynamics as any)?.heat || alchemicalResult.heat || 0.5,
        entropy: (thermodynamics as any)?.entropy || alchemicalResult.entropy || 0.5,
        reactivity: (thermodynamics as any)?.reactivity || alchemicalResult.reactivity || 0.5,
        energy: (thermodynamics as any)?.energy || alchemicalResult.energy || 0.5
      };
    } catch (error) {
      console.error('Error in alchemize function:', error);
      // Fallback to simple implementation if there's an error
      return {
        ...elements,
        alchemicalProperties: {},
        transformedElementalProperties: elements,
        heat: (thermodynamics as any)?.heat || 0.5,
        entropy: (thermodynamics as any)?.entropy || 0.5,
        reactivity: (thermodynamics as any)?.reactivity || 0.5,
        energy: 0.5
      };
    }
  }, []);
  
  // Process tarot cards into elemental influences
  const processTarotElementalInfluences = useCallback((tarotCards: any[]): ElementalProperties => {
    const influences: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
    
    if (!tarotCards || !Array.isArray(tarotCards) || tarotCards.length === 0) {
      return influences;
    }
    
    // Count occurrences of each element in the tarot cards
    let totalCards = 0;
    const elementCounts: Record<string, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    tarotCards.forEach(card => {
      if (card.suit && TAROT_SUIT_TO_ELEMENT[card.suit.toLowerCase()]) {
        const element = TAROT_SUIT_TO_ELEMENT[card.suit.toLowerCase()];
        elementCounts[element] = (elementCounts[element] || 0) + 1;
        totalCards++;
      } else if (card.arcana === 'major') {
        // For major arcana, can assign specific elemental associations
        // This is a simplified version - could be expanded with specific card mappings
        if (card.element) {
          elementCounts[card.element] = (elementCounts[card.element] || 0) + 1;
        }
        totalCards++;
      }
    });
    
    // Convert counts to normalized influences
    if (totalCards > 0) {
      Object.keys(elementCounts).forEach(element => {
        influences[element as keyof ElementalProperties] = 
          0.25 + ((elementCounts[element] / totalCards) * 0.5); // Base 0.25 + up to 0.5 influence
      });
    }
    
    return influences;
  }, []);

  // Update the fetchMethods function to incorporate tarot influences
  const fetchMethods = useCallback(async () => {
    // Don't check isMountedRef here, we'll check it in the state updates
    setLoading(true);
    
    try {
      console.log("Fetching cooking methods...");
      const astroState = normalizeAstroState();
      
      // Process tarot influences if available
      const tarotInfluences = tarotContext.tarotElementalInfluences || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
      
      // Get all cooking methods and apply elemental transformations
      const allMethodsWithDetails = allCookingMethods.map(method => {
        return {
          id: method.id || `method-${method.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: method.name,
          description: method.description,
          elementalEffect: method.elementalEffect,
          elementalProperties: method.elementalProperties || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
          benefits: method.benefits,
          astrologicalInfluences: method.astrologicalInfluences,
          suitable_for: method.suitable_for
        };
      });
      
      // Get thermodynamic properties for each method
      const methodsWithThermodynamics = allMethodsWithDetails.map(method => {
        const thermodynamicProps = methodToThermodynamics(method);
        // Create a simplified alchemical item with required properties
        return {
          ...method,
          transformedElementalProperties: method.elementalProperties as ElementalProperties,
          heat: thermodynamicProps.heat,
          entropy: thermodynamicProps.entropy,
          reactivity: thermodynamicProps.reactivity,
          gregsEnergy: 0.5, // Default value, will be calculated
          alchemicalProperties: {
            Spirit: 0.25,
            Essence: 0.25,
            Matter: 0.25,
            Substance: 0.25
          },
          dominantElement: 'Fire', // Default value
          dominantAlchemicalProperty: 'Spirit', // Default value
          planetaryBoost: 1.0,
          dominantPlanets: [],
          planetaryDignities: {}
        };
      });
      
      // Process methods with astrological, elemental, and tarot factors
      const methods = methodsWithThermodynamics.map(methodWithThermodynamics => {
        // Use local domElements from astroState instead of direct access
        const domElementsToUse = astroState.domElements || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        };
        
        // Blend tarot influences with astrological elements (simple 70/30 blend)
        const blendedElements: ElementalProperties = {
          Fire: (domElementsToUse.Fire * 0.7) + (tarotInfluences.Fire * 0.3),
          Water: (domElementsToUse.Water * 0.7) + (tarotInfluences.Water * 0.3),
          Earth: (domElementsToUse.Earth * 0.7) + (tarotInfluences.Earth * 0.3),
          Air: (domElementsToUse.Air * 0.7) + (tarotInfluences.Air * 0.3)
        };
        
        // Calculate elemental similarity with current astrological state
        const similarity = calculateElementalSimilarity(
          blendedElements, 
          methodWithThermodynamics.elementalProperties as ElementalProperties
        );
        
        // Adjust the score based on astrological state
        const baseScore = 0.5 + (similarity * 0.3);
        const zodiacBonus = astroState.currentZodiac && 
          methodWithThermodynamics.astrologicalInfluences?.favorableZodiac?.includes(astroState.currentZodiac as ZodiacSign)
          ? 0.15 : 0;
        
        // Calculate adjusted score
        const adjustedScore = Math.min(0.95, baseScore + zodiacBonus);
        
        // Generate a reason for the match
        const matchReason = determineMatchReason(methodWithThermodynamics, astroState.currentZodiac, astroState.lunarPhase);
        
        return {
          ...methodWithThermodynamics,
          gregsEnergy: adjustedScore,
          matchReason
        };
      });
      
      // Sort methods by score
      const sortedMethods = methods
        .filter(Boolean)
        .sort((a, b) => (b.gregsEnergy || 0) - (a.gregsEnergy || 0));
      
      // Only update state if component is still mounted - check here instead of at the beginning
      if (isMountedRef.current) {
        setRecommendedMethods(sortedMethods as ExtendedAlchemicalItem[]);
        
        // Also set planetary cooking methods
        const planetaryCookingMethodsMap: Record<string, string[]> = {};
        // Use astroState.activePlanets instead of planets
        (astroState.activePlanets || []).forEach(planet => {
          const methodsForPlanet = sortedMethods
            .filter(method => 
              method.astrologicalInfluences?.dominantPlanets?.includes(planet)
            )
            .map(method => method.name);
          
          if (methodsForPlanet.length > 0) {
            planetaryCookingMethodsMap[planet] = methodsForPlanet;
          }
        });
        
        setPlanetaryCookingMethods(planetaryCookingMethodsMap);
      }
    } catch (error) {
      console.error("Error fetching cooking methods:", error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [normalizeAstroState, methodToThermodynamics, calculateElementalSimilarity, determineMatchReason, setLoading, setRecommendedMethods, setPlanetaryCookingMethods, tarotContext]);
  
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
  }, [fetchMethods]);

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

  // Update getThermodynamicEffect to indicate transformation
  const getThermodynamicEffect = useCallback((value: number): {
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
  }, []);

  // Get dominant tarot suit for a cooking method
  const getDominantTarotSuit = useCallback((method: ExtendedAlchemicalItem): string => {
    if (!method.elementalProperties) {
      return ELEMENT_TO_TAROT_SUIT.Fire; // Default to wands/fire if no properties
    }
    
    const elements = Object.keys(method.elementalProperties) as Element[];
    let dominantElement: Element = 'Fire'; // Default
    let highestValue = 0;
    
    // Find the element with the highest value
    elements.forEach(element => {
      if (method.elementalProperties[element] > highestValue) {
        highestValue = method.elementalProperties[element];
        dominantElement = element;
      }
    });
    
    return ELEMENT_TO_TAROT_SUIT[dominantElement];
  }, []);

  // Get tarot card recommendations for a cooking method
  const getTarotRecommendations = useCallback((method: ExtendedAlchemicalItem): string[] => {
    const dominantSuit = getDominantTarotSuit(method);
    const recommendations: string[] = [];
    
    // Simplified recommendations based on suit
    switch (dominantSuit) {
      case 'cups':
        recommendations.push('Ace of Cups', 'Queen of Cups', 'Ten of Cups');
        break;
      case 'swords':
        recommendations.push('Ace of Swords', 'King of Swords', 'Eight of Swords');
        break;
      case 'pentacles':
        recommendations.push('Ace of Pentacles', 'Queen of Pentacles', 'Nine of Pentacles');
        break;
      case 'wands':
        recommendations.push('Ace of Wands', 'King of Wands', 'Six of Wands');
        break;
      default:
        recommendations.push('The Magician', 'The sun', 'The Star');
    }
    
    // If this is a transformative cooking method (high entropy), add major arcana
    if (method.entropy > 0.7) {
      recommendations.push('Death', 'The Tower', 'Temperance');
    }
    
    return recommendations;
  }, [getDominantTarotSuit]);

  // Culture change handler
  const handleCultureChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCulture(e.target.value);
  }, []);

  // Main render logic
  // For now just return placeholder content
  return (
    <div className={styles.container}>
      <h1>Cooking Methods</h1>
      {loading ? (
        <div className={styles.loading}>Loading recommendations...</div>
      ) : (
        <div className={styles.cookingMethodsList}>
          {recommendedMethods.length > 0 ? (
            recommendedMethods.map(method => (
              <div key={method.id || method.name} className={styles.methodItem}>
                <h3>{method.name}</h3>
                <p>{method.description}</p>
                
                {/* Add Tarot Recommendations */}
                <div className={styles.tarotRecommendations}>
                  <h4>Tarot Influences</h4>
                  <p>Dominant Suit: <strong>{getDominantTarotSuit(method)}</strong></p>
                  <p>Recommended Cards:</p>
                  <ul>
                    {getTarotRecommendations(method).map((card, index) => (
                      <li key={index}>{card}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Elemental Properties */}
                <div className={styles.elementalProperties}>
                  <h4>Elemental Properties</h4>
                  <div className={styles.elementGrid}>
                    <div className={styles.elementFire}>
                      Fire: {Math.round((method.elementalProperties.Fire || 0) * 100)}%
                    </div>
                    <div className={styles.elementWater}>
                      Water: {Math.round((method.elementalProperties.Water || 0) * 100)}%
                    </div>
                    <div className={styles.elementEarth}>
                      Earth: {Math.round((method.elementalProperties.Earth || 0) * 100)}%
                    </div>
                    <div className={styles.elementAir}>
                      Air: {Math.round((method.elementalProperties.Air || 0) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No cooking methods found.</div>
          )}
        </div>
      )}
    </div>
  );
}
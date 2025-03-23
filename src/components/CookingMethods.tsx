'use client';

import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, Globe, Clock, 
  Thermometer, Timer, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import styles from './CookingMethods.module.css';
import { useState, useEffect, useMemo } from 'react';
import { RecommendationAdapter } from '@/services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty, ElementalCharacter } from '@/constants/planetaryElements';
import { planetaryFoodAssociations, Planet, LunarPhase } from '@/constants/planetaryFoodAssociations';
import { CookingMethod, CookingMethodProperties, ZodiacSign, BasicThermodynamicProperties, ThermodynamicProperties, COOKING_METHOD_THERMODYNAMICS } from '@/types/alchemy';
import { useCurrentChart } from '@/context/CurrentChartContext';

// Import cooking methods from both traditional and cultural sources
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { culturalCookingMethods } from '@/utils/culturalMethodsAggregator';
import { allCookingMethods } from '@/data/cooking';
import { molecularCookingMethods } from '@/data/cooking/molecularMethods';

// Add this import at the top with the other imports
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { getLunarMultiplier } from '@/utils/lunarMultiplier';

// Add these imports or declarations at the top of the component
import { useTarotContext } from '@/context/TarotContext'; // If this exists in your app

// Define an interface for the astrologicalInfluences to fix the property access issue
interface AstrologicalInfluence {
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  lunarPhaseEffect?: Record<string, number>;
  dominantPlanets?: string[];
  rulingPlanets?: string[]; 
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
interface BasicThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
}

// Add these methods if they're missing from your COOKING_METHOD_THERMODYNAMICS constant
const ADDITIONAL_THERMODYNAMICS = {
  'blanching': { heat: 0.6, entropy: 0.3, reactivity: 0.2 },
  'dehydrating': { heat: 0.3, entropy: 0.2, reactivity: 0.1 },
  'flambe': { heat: 0.9, entropy: 0.4, reactivity: 0.8 },
  'marinating': { heat: 0.1, entropy: 0.5, reactivity: 0.6 },
  'candying': { heat: 0.5, entropy: 0.4, reactivity: 0.7 },
  'ceviche': { heat: 0.0, entropy: 0.6, reactivity: 0.7 }
};

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

// Add this function before the component or inside it
const getLunarMultiplier = (phase: LunarPhase): number => {
  switch(phase) {
    case 'full_moon':
      return 1.5; // Strongest influence
    case 'waxing_gibbous':
    case 'waning_gibbous':
      return 1.3; // Strong influence
    case 'first_quarter':
    case 'last_quarter':
      return 1.2; // Moderate influence
    case 'waxing_crescent':
    case 'waning_crescent':
      return 1.1; // Slight influence
    case 'new_moon':
    default:
      return 1.0; // Baseline influence
  }
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

export default function CookingMethods() {
  const { 
    currentPlanetaryAlignment, 
    currentZodiac, 
    activePlanets, 
    isDaytime,
    lunarPhase 
  } = useAstrologicalState();
  
  const { chart } = useCurrentChart();
  
  const [recommendedMethods, setRecommendedMethods] = useState<ExtendedAlchemicalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [planetaryCookingMethods, setPlanetaryCookingMethods] = useState<Record<string, string[]>>({});
  const [selectedCulture, setSelectedCulture] = useState<string>(''); // For culture filtering
  const [expandedMolecular, setExpandedMolecular] = useState<Record<string, boolean>>({});
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});

  // Add this simple fallback 
  const [tarotData] = useState(DEFAULT_TAROT_DATA);
  const { tarotCard, tarotElementalInfluences } = tarotData;

  // Toggle molecular details expansion
  const toggleMolecular = (methodId: string) => {
    setExpandedMolecular(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  // Toggle method expansion
  const toggleMethodExpansion = (methodId: string) => {
    setExpandedMethods(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  // Culture options for the dropdown
  const cultures = useMemo(() => {
    const uniqueCultures = Array.from(
      new Set(culturalCookingMethods.map(method => method.culturalOrigin))
    ).sort();
    return ['All Cultures', ...uniqueCultures];
  }, []);

  // Get global astrological adjustment info
  const globalAstrologicalAdjustment = useMemo(() => {
    const zodiacSign = currentZodiac;
    const isNighttime = !isDaytime;
    
    let adjustment = '';
    
    // Adjust timing based on zodiac
    if (zodiacSign) {
      if (['aries', 'leo', 'sagittarius'].includes(zodiacSign)) {
        // Fire signs: faster cooking
        adjustment = 'Reduce cooking time by 5-10% (fire sign influence)';
      } else if (['taurus', 'virgo', 'capricorn'].includes(zodiacSign)) {
        // Earth signs: more thorough cooking
        adjustment = 'Increase cooking time by 5-10% for thorough cooking (earth sign influence)';
      } else if (['gemini', 'libra', 'aquarius'].includes(zodiacSign)) {
        // Air signs: varied temperature
        adjustment = 'Use variable temperatures for complex flavor development (air sign influence)';
      } else if (['cancer', 'scorpio', 'pisces'].includes(zodiacSign)) {
        // Water signs: gentle cooking
        adjustment = 'Prefer gentle, slow cooking methods (water sign influence)';
      }
    }
    
    // Day/night adjustments
    if (isNighttime) {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'Night cooking: reduce heat slightly for better flavor integration';
    }
    
    // Lunar phase adjustments
    if (lunarPhase === 'full_moon') {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'Full moon: flavors intensify, reduce cooking time slightly';
    } else if (lunarPhase === 'new_moon') {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'New moon: flavors more subtle, extend cooking time slightly';
    }
    
    return adjustment || 'Standard timing recommended';
  }, [currentZodiac, isDaytime, lunarPhase]);

  // Aggregate cooking methods from planetary associations
  useEffect(() => {
    const methods: Record<string, string[]> = {};
    
    Object.entries(planetaryFoodAssociations).forEach(([planet, data]) => {
      if (data.cookingMethods && data.cookingMethods.length > 0) {
        methods[planet] = data.cookingMethods;
      }
    });
    
    setPlanetaryCookingMethods(methods);
  }, []);

  // Memoize the cooking methods data, including cultural methods
  const methodsAsElementalItems = useMemo(() => {
    // Start with traditional methods
    const methodItems = Object.entries(cookingMethods).map(([id, method]) => {
      // Find planetary associations for this cooking method
      const associatedPlanets: string[] = [];
      Object.entries(planetaryCookingMethods).forEach(([planet, methods]) => {
        const methodName = method.name?.toLowerCase() || id?.toLowerCase();
        if (methods.some(m => methodName.includes(m.toLowerCase()))) {
          associatedPlanets.push(planet);
        }
      });

      return {
        id,
        name: method.name || id?.split('_').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'Unknown Method',
        elementalProperties: method.elementalEffect || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        description: method.description,
        culturalOrigin: 'Traditional',
        bestFor: method.suitable_for || [],
        duration: method.duration,
        optimalTemperatures: method.optimalTemperatures,
        astrologicalInfluences: {
          ...method.astrologicalInfluences,
          rulingPlanets: associatedPlanets.length > 0 
            ? associatedPlanets 
            : method.astrologicalInfluences?.dominantPlanets
        }
      };
    });
    
    // Add cultural methods
    const culturalItems = culturalCookingMethods.map(method => {
      // Try to find planetary associations based on elemental properties
      const dominantElement = Object.entries(method.elementalProperties)
        .sort(([_a, a], [_b, b]) => b - a)[0][0];
      
      let associatedPlanets: string[] = [];
      switch(dominantElement) {
        case 'Fire': associatedPlanets = ['Mars', 'Sun']; break;
        case 'Water': associatedPlanets = ['Moon', 'Neptune']; break;
        case 'Earth': associatedPlanets = ['Saturn', 'Venus']; break;
        case 'Air': associatedPlanets = ['Mercury', 'Uranus']; break;
      }
      
      return {
        id: method.id,
        name: method.name,
        elementalProperties: method.elementalProperties,
        description: method.description,
        culturalOrigin: method.culturalOrigin,
        bestFor: method.bestFor || [],
        astrologicalInfluences: {
          ...method.astrologicalInfluences,
          rulingPlanets: associatedPlanets
        }
      };
    });
    
    return [...methodItems, ...culturalItems];
  }, [planetaryCookingMethods]);

  // Filter methods based on selected culture
  const filteredMethods = useMemo(() => {
    if (!selectedCulture || selectedCulture === 'All Cultures') {
      return methodsAsElementalItems;
    }
    return methodsAsElementalItems.filter(method => 
      method.culturalOrigin === selectedCulture
    );
  }, [methodsAsElementalItems, selectedCulture]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMethods = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        // Get current season
        const currentSeasonValue = getCurrentSeason();
        
        // Create elemental boosts from tarot if available - safe with fallbacks
        const tarotElementBoosts = tarotElementalInfluences 
          ? {
              Fire: tarotElementalInfluences.Fire || 0,
              Water: tarotElementalInfluences.Water || 0,
              Earth: tarotElementalInfluences.Earth || 0,
              Air: tarotElementalInfluences.Air || 0
            }
          : undefined;
        
        // Create planetary boosts from tarot if available
        const tarotPlanetaryBoosts = tarotCard?.planetaryInfluences || undefined;
        
        // Add error handling and logging
        console.log("Fetching cooking methods with:", { 
          seasonalContext: currentSeasonValue,
          zodiac: currentZodiac,
          lunar: lunarPhase,
          hasTarot: !!tarotElementBoosts
        });
        
        // Enhance adapter with more contextual information
        const adapter = new RecommendationAdapter([], filteredMethods, []);
        
        // Add more factors to the planetary data update
        await adapter.updatePlanetaryData(
          chart,
          isDaytime || true,
          currentZodiac || undefined,
          lunarPhase as LunarPhase || undefined,
          currentSeasonValue,
          tarotElementBoosts,
          tarotPlanetaryBoosts
        );
        
        // Enhance lunar influence on the scores
        const lunarMultiplier = getLunarMultiplier(lunarPhase as LunarPhase);
        
        // Get methods with improved scoring algorithm
        let transformedMethods = adapter.getRecommendedMethods(16, {
          // Increase importance of elemental alignment for better accuracy
          elementalWeight: 0.5,
          astrologicalWeight: 0.3,
          // Add lunar weight based on phase strength
          lunarWeight: 0.2 * lunarMultiplier,
          // Add user preferences weight if available
          userPreferencesWeight: 0.1,
          // Reduce randomness for more consistent results
          randomFactor: 0.03
        }) as ExtendedAlchemicalItem[];
        
        // Ensure score normalization for consistent percentages
        transformedMethods = transformedMethods.map(method => {
          // Scale scores to better distribute along the 0-100% range
          // Ensure minimum score of 25% and maximum of 98% for reasonable display
          const normalizedScore = 0.25 + (method.gregsEnergy * 0.73);
          return {
            ...method,
            gregsEnergy: normalizedScore,
            // Add a match reason for more context
            matchReason: determineMatchReason(method, currentZodiac, lunarPhase as LunarPhase)
          };
        });
        
        // Remove duplicates and ensure we have a good variety
        if (transformedMethods.length < 8) {
          const additionalMethods = Object.entries(allCookingMethods)
            .map(([id, method]) => ({
              id,
              name: method.name || id,
              description: method.description || '',
              elementalProperties: method.elementalEffect || {},
              gregsEnergy: 0.35 // Default score, higher than before
            }))
            .filter(method => !transformedMethods.some(m => m.name === method.name))
            .slice(0, 16 - transformedMethods.length) as ExtendedAlchemicalItem[];
          
          transformedMethods = [...transformedMethods, ...additionalMethods]
            .slice(0, 16);
        }
        
        if (isMounted) {
          setRecommendedMethods(transformedMethods);
        }
      } catch (error) {
        console.error("Error getting cooking methods:", error);
        // Ensure we're not stuck in loading state
        setLoading(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMethods();

    return () => {
      isMounted = false;
    };
  }, [filteredMethods, chart, isDaytime, currentZodiac, lunarPhase]);

  // Add this helper function for better match explanations
  const determineMatchReason = (
    method: ExtendedAlchemicalItem, 
    zodiac?: string, 
    lunarPhase?: LunarPhase
  ): string => {
    const methodName = method.name.toLowerCase();
    
    // Check for zodiac sign alignment
    if (zodiac && method.astrologicalInfluences?.favorableZodiac?.includes(zodiac as ZodiacSign)) {
      return `Aligned with ${zodiac} energy`;
    }
    
    // Enhanced lunar phase alignment
    if (lunarPhase) {
      if (lunarPhase === 'full_moon') {
        if (methodName.includes('grill') || methodName.includes('roast')) {
          return "Enhanced by full moon energy";
        }
        // Fire methods in general
        if (methodName.includes('flame') || methodName.includes('broil') || methodName.includes('sear')) {
          return "Intensified by full moon's radiance";
        }
      }
      
      if (lunarPhase === 'new_moon') {
        if (methodName.includes('steam') || methodName.includes('poach')) {
          return "Harmonious with new moon energy";
        }
        // Gentle methods
        if (methodName.includes('infuse') || methodName.includes('marinate') || methodName.includes('ferment')) {
          return "Aligned with new moon's subtle energies";
        }
      }
      
      if (lunarPhase.includes('waxing')) {
        if (methodName.includes('rise') || methodName.includes('ferment') || methodName.includes('brew')) {
          return "Empowered by waxing moon energy";
        }
      }
      
      if (lunarPhase.includes('waning')) {
        if (methodName.includes('preserve') || methodName.includes('pickle') || methodName.includes('cure')) {
          return "Balanced by waning moon energy";
        }
      }
    }
    
    // Check for planetary alignment
    if (method.astrologicalInfluences?.rulingPlanets?.[0]) {
      return `Ruled by ${method.astrologicalInfluences.rulingPlanets[0]}`;
    }
    
    // Elemental alignment
    const dominantElement = Object.entries(method.elementalProperties || {})
      .sort(([_a, a], [_b, b]) => b - a)[0];
    
    if (dominantElement) {
      return `Strong in ${dominantElement[0]} energy`;
    }
    
    return "Well-suited for current conditions";
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-5 h-5 text-red-400" />;
      case 'Water': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Earth': return <Mountain className="w-5 h-5 text-green-400" />;
      case 'Air': return <Wind className="w-5 h-5 text-purple-400" />;
      default: return null;
    }
  };

  const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
    return <Sparkles className="w-5 h-5 text-yellow-400" />;
  };
  
  // Get astrological timing adjustments
  const getAstrologicalTimingAdjustment = (method: ExtendedAlchemicalItem): string => {
    const zodiacSign = currentZodiac;
    const isNighttime = !isDaytime;
    
    let adjustment = '';
    
    // Adjust timing based on zodiac
    if (zodiacSign) {
      if (['aries', 'leo', 'sagittarius'].includes(zodiacSign)) {
        // Fire signs: faster cooking
        adjustment = 'Reduce cooking time by 5-10% (fire sign influence)';
      } else if (['taurus', 'virgo', 'capricorn'].includes(zodiacSign)) {
        // Earth signs: more thorough cooking
        adjustment = 'Increase cooking time by 5-10% for thorough cooking (earth sign influence)';
      } else if (['gemini', 'libra', 'aquarius'].includes(zodiacSign)) {
        // Air signs: varied temperature
        adjustment = 'Use variable temperatures for complex flavor development (air sign influence)';
      } else if (['cancer', 'scorpio', 'pisces'].includes(zodiacSign)) {
        // Water signs: gentle cooking
        adjustment = 'Prefer gentle, slow cooking methods (water sign influence)';
      }
    }
    
    // Day/night adjustments
    if (isNighttime) {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'Night cooking: reduce heat slightly for better flavor integration';
    }
    
    // Lunar phase adjustments
    if (lunarPhase === 'full_moon') {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'Full moon: flavors intensify, reduce cooking time slightly';
    } else if (lunarPhase === 'new_moon') {
      adjustment += adjustment ? ' • ' : '';
      adjustment += 'New moon: flavors more subtle, extend cooking time slightly';
    }
    
    return adjustment || 'Standard timing recommended';
  };
  
  // Update the thermodynamic effects section to be more method-specific
  const getThermalImplication = (property: string, effect: string, methodName: string): string => {
    const methodLower = methodName.toLowerCase();
    
    switch (property) {
      case 'heat':
        // Add many more specific methods
        if (methodLower.includes('broil'))
          return "Creates intense top-down heat for surface browning and caramelization";
        else if (methodLower.includes('saute') || methodLower.includes('sauté'))
          return "Rapidly conducts heat through oil for quick surface cooking while preserving texture";
        else if (methodLower.includes('brais'))
          return "Uses gentle, sustained heat to gradually break down tough fibers into tenderness";
        else if (methodLower.includes('blanch'))
          return "Brief heat exposure to set color, halt enzyme activity, and soften slightly";
        else if (methodLower.includes('infus'))
          return "Gentle heat transfers flavors from aromatics to carrying liquid without boiling";
        else if (methodLower.includes('dehydrat'))
          return "Low, sustained heat removes moisture while concentrating flavors";
        else if (methodLower.includes('smoke'))
          return "Indirect heat gently cooks while smoke particles adhere to food surface";
        // ... existing conditions ...
        
      case 'entropy':
        // Add more specific methods
        if (methodLower.includes('saute') || methodLower.includes('sauté'))
          return "Keeps cellular breakdown minimal while developing surface flavors";
        else if (methodLower.includes('ceviche'))
          return "Acid denatures proteins without heat, creating 'cooked' texture";
        else if (methodLower.includes('dry ag'))
          return "Controlled enzymatic breakdown enhances flavor and tenderness over time";
        else if (methodLower.includes('blanch'))
          return "Minimal structural changes, primarily affecting surface enzymes";
        else if (methodLower.includes('smoke'))
          return "Slow denaturation of proteins while maintaining structural integrity";
        else if (methodLower.includes('pressure cook'))
          return "Accelerated breakdown of tough fibers and collagen under pressure";
        // ... existing conditions ...
        
      case 'reactivity':
        // Add more specific methods
        if (methodLower.includes('marinate'))
          return "Acids, enzymes and oil carriers facilitate flavor penetration and protein transformation";
        else if (methodLower.includes('deglaze'))
          return "Rapid solvent action releases fond (browned bits) into flavorful solution";
        else if (methodLower.includes('ferment'))
          return "Microbial action transforms sugars into acids, alcohols, and complex flavors";
        else if (methodLower.includes('dry ag'))
          return "Controlled oxidation and enzymatic processes develop umami compounds";
        else if (methodLower.includes('infus'))
          return "Selective extraction of soluble compounds into carrying medium";
        // ... existing conditions ...
        
      default:
        return "";
    }
  };

  // Get enhanced technical tips that are practical and specific
  const getTechnicalTips = (method: ExtendedAlchemicalItem): string[] => {
    const methodName = method.name.toLowerCase();
    
    // First check if the method utility function can provide tips
    const utilityTips = getMethodTips(methodName);
    if (utilityTips && utilityTips.length > 0) {
      return utilityTips;
    }
    
    // Use source data if available
    if (method.id && cookingMethods[method.id as CookingMethod]?.commonMistakes) {
      // Convert common mistakes into proactive tips
      const commonMistakes = cookingMethods[method.id as CookingMethod].commonMistakes || [];
      return commonMistakes.map(mistake => {
        // Transform mistakes into proactive tips
        return mistake.replace(/^(not|inadequate|over|under|incorrect|improper)/i, 
          match => match === 'not' ? 'Always' : 
                  match === 'inadequate' ? 'Ensure adequate' :
                  match === 'over' ? 'Avoid over' :
                  match === 'under' ? 'Avoid under' :
                  match === 'incorrect' ? 'Use correct' :
                  'Maintain proper');
      });
    }
    
    // Fallback to default tips if none are found
    return [
      "Research proper temperature and timing for specific ingredients",
      "Ensure proper preparation of ingredients before cooking",
      "Monitor the cooking process regularly for best results",
      "Allow appropriate resting or cooling time after cooking",
      "Consider how this method interacts with your specific ingredients"
    ];
  };
  
  // Enhance ideal ingredients with specifically suitable items
  const getIdealIngredients = (method: ExtendedAlchemicalItem): string[] => {
    if (method.bestFor && method.bestFor.length > 0) {
      return method.bestFor.map(item => 
        item.charAt(0).toUpperCase() + item.slice(1)
      );
    }
    
    const methodName = method.name.toLowerCase();
    const ingredients: string[] = [];
    
    if (methodName.includes('baking')) {
      ingredients.push('Bread dough', 'Cookies', 'Cakes', 'Root vegetables');
    } else if (methodName.includes('roast')) {
      ingredients.push('Beef roasts', 'Whole chicken/turkey', 'Pork loin', 'Root vegetables');
    } else if (methodName.includes('grill')) {
      ingredients.push('Steaks', 'Burgers', 'Firm fish', 'Bell peppers');
    } else if (methodName.includes('steam')) {
      ingredients.push('Vegetables', 'Fish fillets', 'Dumplings', 'Rice');
    } else if (methodName.includes('fry')) {
      ingredients.push('Chicken pieces', 'Potatoes', 'Fritters', 'Tempura vegetables');
    } else if (methodName.includes('brais')) {
      ingredients.push('Tough meat cuts', 'Short ribs', 'Lamb shanks', 'Chicken thighs');
    } else if (methodName.includes('boil')) {
      ingredients.push('Pasta', 'Eggs', 'Potatoes', 'Hardy vegetables');
    } else if (methodName.includes('sous vide') || methodName.includes('sous_vide')) {
      ingredients.push('Steaks (129°F-135°F)', 'Fish (104°F-140°F)', 'Eggs (145°F)', 'Vegetables (183°F)');
    } else if (methodName.includes('spher')) {
      ingredients.push('Fruit juices', 'Yogurt', 'Purees', 'Sauces');
    } else if (methodName.includes('smoking')) {
      ingredients.push('Brisket', 'Pork shoulder', 'Ribs', 'Salmon');
    } else if (methodName.includes('pressure')) {
      ingredients.push('Beans', 'Tough meat cuts', 'Stews', 'Root vegetables');
    } else if (methodName.includes('stir-fry')) {
      ingredients.push('Thinly sliced meat', 'Firm vegetables', 'Tofu', 'Seafood');
    } else if (methodName.includes('emulsif')) {
      ingredients.push('Oils', 'Vinegars', 'Egg yolks', 'Lecithin-rich foods');
    } else if (methodName.includes('saut')) {
      ingredients.push('Thinly sliced meats', 'Vegetables', 'Mushrooms', 'Leafy greens');
    } else if (methodName.includes('broil')) {
      ingredients.push('Thin steaks', 'Fish fillets', 'Chicken breasts', 'Topped dishes');
    } else if (methodName.includes('poach')) {
      ingredients.push('Eggs', 'Fish fillets', 'Chicken breasts', 'Fruits');
    } else if (methodName.includes('ferment')) {
      ingredients.push('Cabbage', 'Milk', 'Dough', 'Vegetables');
    } else if (methodName.includes('solenije') || methodName.includes('pickle') || methodName.includes('ferment')) {
      ingredients.push('Cabbage (for sauerkraut, kimchi)', 'Cucumbers (for pickles)', 'Root vegetables (carrots, beets)', 'Tomatoes', 'Wild mushrooms');
    } else {
      ingredients.push('Various ingredients', 'Check recipe specifics', 'Adaptable to many foods');
    }
    
    return ingredients.slice(0, 4);
  };
  
  // Get precise timing information
  const getTimingInfo = (method: ExtendedAlchemicalItem): {duration: string, temperature?: string} => {
    const info: {duration: string, temperature?: string} = {
      duration: 'Varies by recipe'
    };
    
    const methodName = method.name.toLowerCase();
    
    if (methodName.includes('baking')) {
      info.duration = '15-60 minutes depending on item';
      info.temperature = '325°F-450°F (163°C-232°C)';
    } else if (methodName.includes('roast')) {
      info.duration = '15-20 minutes per pound for meats';
      info.temperature = '325°F-450°F (163°C-232°C)';
    } else if (methodName.includes('grill')) {
      info.duration = '3-15 minutes per side';
      info.temperature = 'High: 450°F-550°F (232°C-288°C), Medium: 350°F-450°F (177°C-232°C)';
    } else if (methodName.includes('steam')) {
      info.duration = '5-20 minutes';
      info.temperature = '212°F (100°C)';
    } else if (methodName.includes('fry')) {
      info.duration = '3-8 minutes for small items, 10-15 for larger';
      info.temperature = '350°F-375°F (177°C-190°C)';
    } else if (methodName.includes('brais')) {
      info.duration = '2-4 hours';
      info.temperature = '300°F-325°F (149°C-163°C)';
    } else if (methodName.includes('boil')) {
      info.duration = '1-15 minutes depending on item';
      info.temperature = '212°F (100°C)';
    } else if (methodName.includes('sous vide') || methodName.includes('sous_vide')) {
      info.duration = '1-4 hours for most items, up to 72 hours for tough cuts';
      info.temperature = '120°F-185°F (49°C-85°C) depending on item';
    } else if (methodName.includes('spher')) {
      info.duration = 'Prep: 5-10 minutes, Setting: 1-2 minutes';
      info.temperature = 'Cold bath: 35°F-45°F (2°C-7°C)';
    } else if (methodName.includes('smoking')) {
      info.duration = '2-14 hours depending on item';
      info.temperature = '225°F-250°F (107°C-121°C)';
    } else if (methodName.includes('pressure')) {
      info.duration = '5-60 minutes depending on ingredient';
      info.temperature = '235°F-250°F (113°C-121°C)';
    } else if (methodName.includes('stir-fry')) {
      info.duration = '3-8 minutes total';
      info.temperature = 'High heat: 400°F-450°F (204°C-232°C)';
    } else if (methodName.includes('emulsif')) {
      info.duration = '2-10 minutes of active mixing';
      info.temperature = 'Varies by application, usually 35°F-70°F (2°C-21°C)';
    } else if (methodName.includes('saut')) {
      info.duration = '2-7 minutes';
      info.temperature = 'Medium-high heat: 350°F-375°F (177°C-190°C)';
    } else if (methodName.includes('broil')) {
      info.duration = '3-10 minutes per side';
      info.temperature = '500°F-550°F (260°C-288°C)';
    } else if (methodName.includes('poach')) {
      info.duration = '2-10 minutes';
      info.temperature = '160°F-180°F (71°C-82°C)';
    } else if (methodName.includes('ferment')) {
      info.duration = 'Hours to weeks depending on item';
      info.temperature = 'Typically 65°F-80°F (18°C-27°C)';
    } else if (methodName.includes('solenije') || methodName.includes('pickle')) {
      info.duration = '3-14 days for active fermentation, weeks to months for aging';
      info.temperature = '65°F-75°F (18°C-24°C) for fermentation, 32°F-40°F (0°C-4°C) for storage';
    } else if (methodName.includes('confit')) {
      info.duration = '2-4 hours';
      info.temperature = '180°F-200°F (82°C-93°C)';
    } else if (methodName.includes('tagine')) {
      info.duration = '2-4 hours';
      info.temperature = '180°F-200°F (82°C-93°C)';
    } else if (methodName.includes('nixtamal')) {
      info.duration = '1-2 hours';
      info.temperature = '180°F-200°F (82°C-93°C)';
    }
    
    return info;
  };

  // Handle culture change
  const handleCultureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCulture(e.target.value);
  };

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
    const methodName = method.name.toLowerCase() as CookingMethod;
    if (COOKING_METHOD_THERMODYNAMICS && COOKING_METHOD_THERMODYNAMICS[methodName]) {
      return COOKING_METHOD_THERMODYNAMICS[methodName][property as keyof BasicThermodynamicProperties] || 0;
    }
    
    // Generate values based on method name keywords if no explicit values found
    // This ensures all methods have reasonable thermodynamic values
    const methodLower = method.name.toLowerCase();
    
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

  const getMolecularDetails = (method: ExtendedAlchemicalItem): MolecularGastronomyDetails | null => {
    const methodName = method.name.toLowerCase();
    
    // Only return molecular details for molecular gastronomy methods
    if (
      methodName.includes('spher') || 
      methodName.includes('molecular') || 
      methodName.includes('gelif') || 
      methodName.includes('emulsif') || 
      methodName.includes('cryo') ||
      methodName.includes('foam')
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
    if (method.id && cookingMethods[method.id as CookingMethod]) {
      const sourceData = cookingMethods[method.id as CookingMethod];
      
      return {
        benefits: sourceData.benefits || [],
        chemicalChanges: sourceData.chemicalChanges || {},
        safetyFeatures: sourceData.safetyFeatures || [],
        nutrientRetention: sourceData.nutrientRetention || {},
        regionalVariations: sourceData.regionalVariations || {},
        astrologicalInfluences: sourceData.astrologicalInfluences || {}
      };
    }
    
    // Check if it's a molecular method
    const methodName = method.name.toLowerCase();
    if (
      methodName.includes('spher') || 
      methodName.includes('gel') || 
      methodName.includes('emuls') || 
      methodName.includes('cryo')
    ) {
      // Try to find in molecular methods
      const molecularKey = Object.keys(molecularCookingMethods).find(
        key => key.toLowerCase().includes(methodName.split(' ')[0].toLowerCase())
      );
      
      if (molecularKey && molecularCookingMethods[molecularKey as CookingMethod]) {
        const sourceData = molecularCookingMethods[molecularKey as CookingMethod];
        return {
          benefits: sourceData.benefits || [],
          chemicalChanges: sourceData.chemicalChanges || {},
          toolsRequired: sourceData.toolsRequired || [],
          optimalTemperatures: sourceData.optimalTemperatures || {}
        };
      }
    }
    
    return null;
  }

  // First, add this new helper function to get detailed examples for each cooking method
  const getMethodDetails = (method: ExtendedAlchemicalItem): { examples: string[], fullDefinition: string } => {
    const methodName = method.name.toLowerCase();
    
    // Default values
    let examples: string[] = [];
    let fullDefinition = method.description || "";
    
    // Check if we have data from the source first
    if (method.id && cookingMethods[method.id as CookingMethod]) {
      const sourceMethod = cookingMethods[method.id as CookingMethod];
      // Expand definition if needed
      if (sourceMethod.description && sourceMethod.description.length > method.description?.length) {
        fullDefinition = sourceMethod.description;
      }
      
      // Use existing suitable_for as examples if available
      if (sourceMethod.suitable_for && sourceMethod.suitable_for.length > 0) {
        examples = sourceMethod.suitable_for.map(item => {
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
    const methodName = method.name.toLowerCase();
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
        if (methodName.includes('fry')) {
          compatibility = "Best for foods that benefit from crisp exterior and quick cooking";
          idealCharacteristics = [
            "Items with natural structure that can withstand hot oil",
            "Foods where crisp exterior and moist interior is desired",
            "Ingredients that cook quickly and evenly",
            "Battered or breaded items requiring rapid setting"
          ];
        } else if (methodName.includes('roast')) {
          compatibility = "Ideal for items needing even browning and slow moisture release";
          idealCharacteristics = [
            "Larger cuts of meat that benefit from even heat penetration",
            "Vegetables where caramelization enhances flavor",
            "Foods that benefit from fat rendering and self-basting",
            "Items where surface browning and flavor development is key"
          ];
        } else {
          // Truly generic fallback with helpful guidance
          compatibility = `${method.name} works best with ingredients suited to its thermal profile`;
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
    const methodName = method.name.toLowerCase();
    
    // If the method already has valid elemental properties, use those
    if (method.elementalProperties && 
        Object.values(method.elementalProperties).some(val => val > 0)) {
      return method.elementalProperties;
    }
    
    // Generate method-specific elemental properties
    const properties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    if (methodName.includes('solenije') || methodName.includes('pickle')) {
      properties.Water = 0.5;
      properties.Earth = 0.3;
      properties.Air = 0.1;
      properties.Fire = 0.1;
    } else if (methodName.includes('confit')) {
      properties.Fire = 0.4;
      properties.Earth = 0.4;
      properties.Water = 0.1;
      properties.Air = 0.1;
    } else if (methodName.includes('tagine')) {
      properties.Earth = 0.4;
      properties.Water = 0.3;
      properties.Fire = 0.2;
      properties.Air = 0.1;
    } else if (methodName.includes('nixtamal')) {
      properties.Water = 0.4;
      properties.Earth = 0.3;
      properties.Fire = 0.2;
      properties.Air = 0.1;
    }
    
    return properties;
  };

  // Add import for our utility function at the top of the component
  const { getTechnicalTips: getMethodTips } = require('@/utils/cookingMethodTips');

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-white text-lg">Aligning cooking methods with celestial energies...</p>
      </div>
    );
  }

  // Add this before the return statement
  console.log("CookingMethods rendering state:", {
    loading,
    hasRecommendations: recommendedMethods.length > 0,
    methods: recommendedMethods.map(m => m.name)
  });

  return (
    <div>
      <div className={styles.filterControls}>
        <select 
          className={styles.cultureSelector} 
          value={selectedCulture} 
          onChange={handleCultureChange}
          aria-label="Filter cooking methods by culture"
        >
          <option value="">All Cultures</option>
          {cultures.filter(c => c !== 'All Cultures').map(culture => (
            <option key={culture} value={culture}>{culture}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.globalAstrological}>
        <div className={styles.globalAstroHeader}>
          <Clock className="w-5 h-5 mr-2" />
          <h2>Current Astrological Cooking Adjustments</h2>
        </div>
        <div className={styles.globalAstroContent}>
          {globalAstrologicalAdjustment}
        </div>
      </div>
      
      <div className={styles.methodsContainer}>
        {recommendedMethods.length > 0 ? recommendedMethods.map((method, index) => {
          const timingInfo = getTimingInfo(method);
          const molecularDetails = getMolecularDetails(method);
          const methodId = `method-${index}`;
          const isExpanded = expandedMethods[methodId] || false;
          
          return (
            <div key={index} className={styles.methodCard}>
              <div 
                className={styles.methodHeader}
                onClick={() => toggleMethodExpansion(`method-${index}`)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className={styles.methodName}>{method.name}</h3>
                <div className={styles.headerControls}>
                  <div className={styles.matchInfo}>
                <span className={styles.matchScore}>
                      {/* More accurate display of match percentage */}
                      {Math.round(method.gregsEnergy * 100)}% match
                </span>
                    {/* Only show match reason if expanded or on hover */}
                    {(isExpanded || true) && method.matchReason && (
                      <span className={styles.matchReason}>
                        {method.matchReason}
                      </span>
                    )}
                  </div>
                  {isExpanded ? 
                    <ChevronUp className="w-4 h-4 ml-2" /> : 
                    <ChevronDown className="w-4 h-4 ml-2" />
                  }
                </div>
              </div>
              
              {/* Always show compact info */}
              <div className={styles.compactInfo}>
                <p className={styles.methodDescription}>
                  {method.description 
                    ? (method.description.length > 80 && !isExpanded) 
                      ? `${method.description.substring(0, 80)}...` 
                      : method.description
                    : ''}
                </p>
                
                <div className={styles.quickInfoTags}>
                  {/* Show key properties as compact tags */}
                  <span className={styles.quickTag}>
                    <Timer className="w-3 h-3 mr-1" />
                    {timingInfo.duration.split(' ')[0]}
                  </span>
                  {timingInfo.temperature && (
                    <span className={styles.quickTag}>
                      <Thermometer className="w-3 h-3 mr-1" />
                      {timingInfo.temperature.split(' ')[0]}°
                    </span>
                  )}
                  {getIdealIngredients(method).slice(0, 1).map((ingredient, i) => (
                    <span key={i} className={styles.quickTag}>{ingredient}</span>
                  ))}
                </div>
              </div>
              
              {/* Expanded details section */}
              {isExpanded && (
                <div className={styles.expandedDetails}>
                  {/* Cultural origin badge if applicable */}
              {method.culturalOrigin && method.culturalOrigin !== 'Traditional' && (
                <div className={styles.cultureBadge}>
                  <Globe className="w-4 h-4 mr-1" />
                  <span>{method.culturalOrigin} traditional technique</span>
                </div>
              )}
              
                  {/* Full definition with examples */}
                  <div className={styles.methodDetailSection}>
                    {(() => {
                      const { examples, fullDefinition } = getMethodDetails(method);
                      return (
                        <>
                          <p className={styles.methodFullDefinition}>{fullDefinition}</p>
                          
                          <div className={styles.examplesSection}>
                            <h4 className={styles.examplesTitle}>
                              <Info className="w-4 h-4 mr-1" /> 
                              Common Examples:
                </h4>
                            <ul className={styles.examplesList}>
                              {examples.map((example, i) => (
                                <li key={i} className={styles.exampleItem}>{example}</li>
                              ))}
                            </ul>
                        </div>
                        </>
                      );
                    })()}
              </div>
              
                  {/* Cooking information section */}
              <div className={styles.cookingInfo}>
                    {/* Timing information */}
                <div className={styles.cookingInfoRow}>
                  <div className={styles.infoIcon}>
                    <Timer className="w-4 h-4" />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Timing:</span>
                    <span className={styles.infoValue}>{timingInfo.duration}</span>
                  </div>
                </div>
                
                    {/* Temperature information */}
                {timingInfo.temperature && (
                  <div className={styles.cookingInfoRow}>
                    <div className={styles.infoIcon}>
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Temperature:</span>
                      <span className={styles.infoValue}>{timingInfo.temperature}</span>
                    </div>
                  </div>
                )}
                
                    {/* Ideal ingredients */}
                <div className={styles.cookingInfoRow}>
                  <div className={styles.infoIcon}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className={styles.infoContent}>
                        <span className={styles.infoLabel}>Ideal For:</span>
                    <div className={styles.tagList}>
                      {getIdealIngredients(method).map((ingredient, i) => (
                        <span key={i} className={styles.ingredientTag}>{ingredient}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                    {/* Benefits section - pulled from source data */}
                    {method.id && cookingMethods[method.id as CookingMethod]?.benefits && (
                      <div className={styles.cookingInfoRow}>
                        <div className={styles.infoIcon}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Benefits:</span>
                          <div className={styles.tagList}>
                            {cookingMethods[method.id as CookingMethod].benefits.map((benefit, i) => (
                              <span key={i} className={styles.benefitTag}>{benefit}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Technical tips */}
                <div className={styles.cookingInfoTips}>
                  <div className={styles.tipsHeader}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>Technical Tips</span>
                  </div>
                  <ul className={styles.tipsList}>
                    {getTechnicalTips(method).map((tip, i) => (
                      <li key={i} className={styles.tipItem}>{tip}</li>
                    ))}
                  </ul>
                </div>
                
                    {/* Element composition - shows the unique elemental balance */}
                    <div className={styles.elementalTags}>
                      {Object.entries(getMethodElementalProperties(method) || {})
                        .filter(([_, value]) => value > 0)
                        .sort(([_, valueA], [__, valueB]) => valueB - valueA)
                        .map(([element, value]) => (
                          <div key={element} className={styles.elementTag}>
                            {getElementIcon(element)}
                            <span>{element}</span>
                            <span className={styles.elementValue}>{Math.round(value * 100)}%</span>
                          </div>
                        ))}
                    </div>
                    
                    {/* Simplified thermodynamic effects */}
                    <div className={styles.simplifiedThermodynamics}>
                      <div className={styles.thermoDivider}></div>
                      <h4 className={styles.thermoTitle}>Method Properties</h4>
                      <div className={styles.thermoProperties}>
                        {['heat', 'entropy', 'reactivity'].map(property => {
                          const value = getThermodynamicValue(method, property);
                          const { effect } = getThermodynamicEffect(value);
                          
                          return (
                            <div key={property} className={styles.thermoProperty}>
                              <span className={styles.propertyName}>
                                {property.charAt(0).toUpperCase() + property.slice(1)}:
                              </span>
                              <span className={styles.propertyEffect}>
                                {getThermalImplication(property, effect, method.name)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Chemical changes - specific to each method */}
                    {method.id && cookingMethods[method.id as CookingMethod]?.chemicalChanges && (
                      <div className={styles.cookingInfoRow}>
                        <div className={styles.infoIcon}>
                          <Info className="w-4 h-4" />
                        </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Chemical Effects:</span>
                          <div className={styles.tagList}>
                            {Object.entries(cookingMethods[method.id as CookingMethod].chemicalChanges || {})
                              .filter(([_, active]) => active)
                              .map(([change, _]) => (
                                <span key={change} className={styles.chemicalTag}>
                                  {change.replace(/_/g, ' ')}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Molecular gastronomy details - only show if relevant */}
                {molecularDetails && (
                  <div className={styles.molecularDetailsWrapper}>
                    <button 
                      className={styles.molecularToggle}
                      onClick={() => toggleMolecular(methodId)}
                          aria-expanded={expandedMolecular[methodId]}
                      aria-controls={`molecular-details-${methodId}`}
                    >
                      <h4 className={styles.molecularTitle}>
                        <Sparkles className="w-4 h-4 mr-1" />
                            Molecular Details
                      </h4>
                          {expandedMolecular[methodId] ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    
                        {expandedMolecular[methodId] && (
                      <div 
                        id={`molecular-details-${methodId}`}
                        className={styles.molecularDetails}
                      >
                        <div className={styles.molecularSection}>
                              <span className={styles.molecularLabel}>Equipment:</span>
                          <div className={styles.tagList}>
                            {molecularDetails.advancedEquipment.map((item, i) => (
                              <span key={i} className={styles.molecularTag}>{item}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className={styles.molecularSection}>
                              <span className={styles.molecularLabel}>Watch Out For:</span>
                          <ul className={styles.molecularList}>
                                {molecularDetails.commonErrors.map((error, i) => (
                                  <li key={i} className={styles.molecularItem}>{error}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className={styles.molecularSection}>
                              <span className={styles.molecularLabel}>Textural Outcomes:</span>
                          <ul className={styles.molecularList}>
                                {molecularDetails.texturalOutcomes.map((outcome, i) => (
                                  <li key={i} className={styles.molecularItem}>{outcome}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                    
                    {/* Regional variations - specific to each method */}
                    {method.id && cookingMethods[method.id as CookingMethod]?.regionalVariations && (
                      <div className={styles.cookingInfoRow}>
                        <div className={styles.infoIcon}>
                          <Globe className="w-4 h-4" />
              </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Regional Variations:</span>
                          <div className={styles.regionList}>
                            {Object.entries(cookingMethods[method.id as CookingMethod].regionalVariations || {}).map(([region, variations]) => (
                              <div key={region} className={styles.regionItem}>
                                <span className={styles.regionName}>{region}:</span>
                                <span className={styles.regionVariation}>{Array.isArray(variations) ? variations.join(', ') : variations}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Replace Nutritional impact section with Ingredient Compatibility */}
                    <div className={styles.compatibilitySection}>
                      <h4 className={styles.sectionTitle}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Ingredient Compatibility
                      </h4>
                      {(() => {
                        const { compatibility, idealCharacteristics, avoidCharacteristics } = getIngredientCompatibility(method);
                        return (
                          <>
                            <div className={styles.compatibilityDescription}>{compatibility}</div>
                            
                            {idealCharacteristics.length > 0 && (
                              <div className={styles.compatibilityList}>
                                <span className={styles.compatibilityLabel}>Best For:</span>
                                <ul className={styles.detailList}>
                                  {idealCharacteristics.map((trait, i) => (
                                    <li key={i} className={styles.detailItem}>{trait}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {avoidCharacteristics.length > 0 && (
                              <div className={styles.compatibilityList}>
                                <span className={styles.compatibilityLabel}>Less Suitable For:</span>
                                <ul className={styles.detailList}>
                                  {avoidCharacteristics.map((trait, i) => (
                                    <li key={i} className={styles.detailItem}>{trait}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="p-6 text-center bg-gray-800 rounded-md">
            <p className="text-white text-lg">No cooking methods available</p>
            <p className="text-gray-300 text-sm mt-2">
              {loading ? "Still loading..." : "Check console for errors"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
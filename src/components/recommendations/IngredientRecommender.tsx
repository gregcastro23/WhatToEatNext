import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp, Beaker, Settings } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';



import { ingredientCategories } from "@/data/ingredientCategories";
import type { 
  ElementalProperties, 
  Element, 
  AstrologicalState, 
  ChakraEnergies,
  AlchemicalProperties,
  UnifiedFlavorProfile 
} from "@/types";
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';

import { normalizeChakraKey } from '../../constants/chakraSymbols';
import { useFlavorEngine } from '../../contexts/FlavorEngineContext';
import { herbsCollection, oilsCollection, vinegarsCollection, grainsCollection } from '../../data/ingredients';
import { useAlchemicalRecommendations } from '../../hooks/useAlchemicalRecommendations';
import { useAstrologicalState } from '../../hooks/useAstrologicalState';
import { ElementalCalculator } from '../../services/ElementalCalculator';
import { enhancedRecommendationService, EnhancedRecommendationResult } from '../../services/EnhancedRecommendationService';
import { 
  getChakraBasedRecommendations, 
  GroupedIngredientRecommendations, 
  getIngredientRecommendations, 
  IngredientRecommendation,
  EnhancedIngredientRecommendation 
} from '../../utils/ingredientRecommender';
import { IngredientCard } from '../IngredientCard';


// Import the useFlavorEngine hook from our new context
// TODO: Fix CSS module import - was: import from "./IngredientRecommender?.module?.css.ts"


import styles from './CookingMethods.module.css';
/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<string, { diurnal: Element, nocturnal: Element }> = {
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

// Chakra Indicator Component
interface ChakraIndicatorProps {
  chakra: string;
  energyLevel: number;
  balanceState: 'balanced' | 'underactive' | 'overactive';
}

const ChakraIndicator: React.FC<ChakraIndicatorProps> = ({ chakra, energyLevel, balanceState }) => {
  const getChakraColor = (chakra: string) => {
    const colors: { [key: string]: string } = {
      'Root': '#dc2626',
      'Sacral': '#ea580c',
      'Solar Plexus': '#ca8a04',
      'Heart': '#16a34a',
      'Throat': '#2563eb',
      'Third Eye': '#7c3aed',
      'Crown': '#9333ea'
    };
    return colors[chakra] || '#6b7280';
  };

  const getBalanceColor = (state: string) => {
    switch (state) {
      case 'underactive': return '#dc2626';
      case 'overactive': return '#ea580c';
      default: return '#16a34a';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '8px', 
      backgroundColor: '#f9fafb', 
      borderRadius: '8px' 
    }}>
      <div style={{ 
        width: '16px', 
        height: '16px', 
        borderRadius: '50%', 
        backgroundColor: getChakraColor(chakra) 
      }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>{chakra}</div>
        <div style={{ fontSize: '12px', color: getBalanceColor(balanceState) }}>
          {balanceState} ({energyLevel.toFixed(1)}/10)
        </div>
      </div>
    </div>
  );
};

// Define a styles object for animations and custom styles
const customStyles = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  },
  animateFadeIn: {
    animation: 'fadeIn 0.3s ease-in-out'
  }
};

// Define category display names
const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  proteins: 'Proteins',
  vegetables: 'Vegetables',
  grains: 'Grains & Starches',
  fruits: 'Fruits',
  herbs: 'Herbs & Aromatics',
  spices: 'Spices & Seasonings',
  oils: 'Oils & Fats',
  vinegars: 'Vinegars & Acidifiers'
};

// Define category display counts
const CATEGORY_DISPLAY_COUNTS: { [key: string]: number } = {
  proteins: 12,
  vegetables: 12,
  grains: 10,
  fruits: 12,
  herbs: 10,
  spices: 12,
  oils: 8,
  vinegars: 8
};

// Add interface for enhanced categorized recommendations
interface EnhancedGroupedRecommendations {
  [category: string]: EnhancedIngredientRecommendation[];
}

// Using inline styles to avoid CSS module conflicts
export default function IngredientRecommender() {
  // Use the hook to get astrological data
  const astroState = useAstrologicalState();
  const { 
    currentZodiac, 
    currentPlanetaryAlignment, 
    loading: astroLoading, 
    isDaytime 
  } = astroState;
  
  // Note: chakraEnergies are not available from useAstrologicalState
  // We'll rely on the useAlchemicalRecommendations hook for enhanced recommendations
  const contextChakraEnergies = null; // Not available from this hook
  const planetaryPositions = currentPlanetaryAlignment;
  const astroError = null; // Hook doesn't expose error state
  // Add flavor engine context
  const { calculateCompatibility } = useFlavorEngine();
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  // States for selected item and expansion
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  
  // Category organization states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['proteins', 'vegetables', 'herbs', 'spices']);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Astrological filtering states
  const [astrologicalFilter, setAstrologicalFilter] = useState<string>('all');
  const [elementalFilter, setElementalFilter] = useState<Element | 'all'>('all');
  const [planetaryFilter, setPlanetaryFilter] = useState<string>('all');
  const [showAstrologicalFilters, setShowAstrologicalFilters] = useState(false);
  
  // Enhanced recommendations state
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<EnhancedRecommendationResult | null>(null);
  const [showEnhancedFeatures, setShowEnhancedFeatures] = useState(false);
  const [showSensoryProfiles, setShowSensoryProfiles] = useState(false);
  const [showAlchemicalProperties, setShowAlchemicalProperties] = useState(false);
  
  // Flavor compatibility UI state
  const [showFlavorCompatibility, setShowFlavorCompatibility] = useState(false);
  const [selectedIngredientForComparison, setSelectedIngredientForComparison] = useState<IngredientRecommendation | null>(null);
  const [comparisonIngredients, setComparisonIngredients] = useState<IngredientRecommendation[]>([]);
  
  // Add a loading state for component-level loading management
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  // Use the custom hook for food recommendations - Pattern YYY: React Props and State Interface Resolution
  const alchemicalHookResult = useAlchemicalRecommendations({ 
    mode: 'standard',
    limit: 300 
  } as any);
  const foodRecommendations = (alchemicalHookResult as unknown as Record<string, unknown>)?.enhancedRecommendations;
  const chakraEnergies = (alchemicalHookResult as unknown as Record<string, unknown>)?.chakraEnergies;
  const foodLoading = (alchemicalHookResult as unknown as Record<string, unknown>)?.loading || false;
  const foodError = (alchemicalHookResult as unknown as Record<string, unknown>)?.error;
  const refreshRecommendations = (alchemicalHookResult as unknown as Record<string, unknown>)?.refreshRecommendations;

  // Add timeout for loading state
  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isComponentLoading) {
        setLoadingTimedOut(true);
        setIsComponentLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isComponentLoading]); // Explicitly list the dependency

  // Update loading state when data changes
  useEffect(() => {
    if (!astroLoading && Object.keys(astroRecommendations || {}).length > 0) {
      setIsComponentLoading(false);
    }
  }, [astroLoading, astroRecommendations]);
  
  // Helper function to get element icon with inline styles
  const getElementIcon = (element: Element) => {
    const iconStyle = { 
      marginRight: '2px',
      color: element === 'Fire' ? '#ff6b6b' : 
            element === 'Water' ? '#6bb5ff' :
            element === 'Earth' ? '#6bff8e' :
            '#d9b3ff' // Air
    };
    
    switch (element) {
      case 'Fire': return <Flame style={iconStyle} size={16} />;
      case 'Water': return <Droplets style={iconStyle} size={16} />;
      case 'Earth': return <Mountain style={iconStyle} size={16} />;
      case 'Air': return <Wind style={iconStyle} size={16} />;
      default: return null;
    }
  };
  
  // Handle ingredient selection to display details
  const handleIngredientSelect = (item: IngredientRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle selected ingredient
    if (selectedIngredient?.name === item.name) {
      setSelectedIngredient(null);
    } else {
      setSelectedIngredient(item);
    }
  };
  
  // Toggle expansion for a category
  const toggleCategoryExpansion = (_category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [_category]: !prev[_category]
    }));
  };
  
  // Reset selected ingredient when recommendations change
  useEffect(() => {
    setSelectedIngredient(null);
  }, [astroRecommendations, foodRecommendations]);
  
  // Load enhanced recommendations - memoize the async function
  const loadEnhancedRecommendations = useCallback(async () => {
    if (!astroLoading && !astroError && showEnhancedFeatures) {
      try {
        const astrologicalState: AstrologicalState = {
          planetaryPositions: Object.fromEntries(
            Object.entries(planetaryPositions || {}).map(([planet, position]) => [
              planet,
              typeof position === 'object' ? position : { sign: 'aries', degree: 0 }
            ])
          ),
          currentZodiac,
          loading: false,
          sunSign: currentZodiac || 'aries', // Default fallback
          lunarPhase: 'new moon', // Default fallback
          activePlanets: [],
          dominantElement: 'Fire' // Default fallback
        };
        
        const result = await enhancedRecommendationService.getEnhancedRecommendations(
          astrologicalState,
          {
            dietary: [],
            taste: {} as unknown as { [key: string]: number },
            chakraFocus: []
          }
        );
        
        setEnhancedRecommendations(result);
      } catch (err) {
        console.error('Error loading enhanced recommendations:', err);
      }
    }
  }, [astroLoading, astroError, showEnhancedFeatures, contextChakraEnergies, planetaryPositions, currentZodiac]);

  useEffect(() => {
    loadEnhancedRecommendations();
  }, [loadEnhancedRecommendations]);
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  const generateRecommendations = useCallback(async () => {
    if (astroLoading || foodLoading) return;
    
    try {
      // Get chakra-based recommendations if chakra energies are available with enhanced null safety
      let chakraRecommendations: GroupedIngredientRecommendations = {};
      
      if (contextChakraEnergies && Object.keys(contextChakraEnergies || {}).length > 0) {
        try {
          const rawRecommendations = await getChakraBasedRecommendations(contextChakraEnergies);
          // Ensure we get a valid object, not undefined or array
          chakraRecommendations = rawRecommendations && typeof rawRecommendations === 'object' && !Array.isArray(rawRecommendations) 
            ? rawRecommendations 
            : {};
        } catch (error) {
          console.warn('Error getting chakra recommendations:', error);
          chakraRecommendations = {};
        }
      }
      
      // Combine chakra and food recommendations with enhanced safety
      const combinedRecommendations = {
        ...chakraRecommendations
      };
      
      // Apply safe type conversion to resolve array vs object mismatch
      const astroRecommendationsData = combinedRecommendations || {};
      
      // Ensure the data matches GroupedIngredientRecommendations structure
      const convertedRecommendations: GroupedIngredientRecommendations = {};
      
      // Convert data to proper GroupedIngredientRecommendations format
      Object.entries(astroRecommendationsData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Ensure each array item has the required IngredientRecommendation structure
          convertedRecommendations[key] = value.map(item => ({
            ...item,
            name: item?.name || 'Unknown',
            type: item?.type || 'ingredient',
            matchScore: item?.matchScore || 0.5
          })) as IngredientRecommendation[];
        } else {
          convertedRecommendations[key] = [];
        }
      });
      
      setAstroRecommendations(convertedRecommendations as unknown as GroupedIngredientRecommendations); // Pattern HH-3: Safe type conversion
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }, [astroLoading, foodLoading, contextChakraEnergies]);
  
  // Effect to generate recommendations when loading state changes
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);
  
  // Define herb names array for checking herb categories
  const herbNames = useMemo(() => {
    return Array.isArray(herbsCollection) ? 
      (herbsCollection || []).map((herb: unknown) => {
        // Apply surgical type casting with variable extraction
        const herbData = herb as Record<string, unknown>;
        return herbData?.name;
      }) : 
      Object.values(herbsCollection || {}).map((herb: unknown) => {
        const herbData = herb as Record<string, unknown>;
        return herbData?.name;
      });
  }, []);

  // Define oil types array for checking oil categories
  const oilTypes = useMemo(() => {
    return Array.isArray(oilsCollection) ? 
      (oilsCollection || []).map((oil: unknown) => {
        // Apply surgical type casting with variable extraction
        const oilData = oil as Record<string, unknown>;
        return String(oilData?.name || '').toLowerCase();
      }) : 
      Object.values(oilsCollection || {}).map((oil: unknown) => {
        const oilData = oil as Record<string, unknown>;
        return String(oilData?.name || '').toLowerCase();
      });
  }, []);

  // Define vinegar types array for checking vinegar categories
  const vinegarTypes = useMemo(() => {
    return Array.isArray(vinegarsCollection) ? 
      (vinegarsCollection || []).map((vinegar: unknown) => {
        // Apply surgical type casting with variable extraction
        const vinegarData = vinegar as Record<string, unknown>;
        return String(vinegarData?.name || '').toLowerCase();
      }) : 
      Object.values(vinegarsCollection || {}).map((vinegar: unknown) => {
        const vinegarData = vinegar as Record<string, unknown>;
        return String(vinegarData?.name || '').toLowerCase();
      });
  }, []);
  
  // Helper function to check if an ingredient is an oil
  const isOil = (ingredient: IngredientRecommendation): boolean => {
    if (!ingredient) return false;
    
    const name = ingredient.name?.toLowerCase();
    // Check if the name contains any oil type
    const containsOilName = (oilTypes || []).some(oil => name?.includes?.(oil));
    
    // Check if the category is specified as oil
    const isOilCategory = ingredient.category?.toLowerCase() === 'oil' || 
                         ingredient.category?.toLowerCase() === 'oils' ||
                         ingredient.category?.toLowerCase() === 'fat' ||
                         ingredient.category?.toLowerCase() === 'fats';
    
    return containsOilName || isOilCategory || name.endsWith(' oil');
  };
  
  // Helper function to check if an ingredient is a vinegar
  const isVinegar = (ingredient: IngredientRecommendation): boolean => {
    if (!ingredient) return false;
    
    const name = ingredient.name?.toLowerCase();
    // Check if the name contains any vinegar type
    const containsVinegarName = (vinegarTypes || []).some(vinegar => name?.includes?.(vinegar));
    
    // Check if the category is specified as vinegar
    const isVinegarCategory = ingredient.category?.toLowerCase() === 'vinegar' || 
                             ingredient.category?.toLowerCase() === 'vinegars' || 
                             ingredient.category?.toLowerCase() === 'acidifier' ||
                             ingredient.category?.toLowerCase() === 'acidifiers';
    
    return containsVinegarName || isVinegarCategory || name.endsWith(' vinegar');
  };
  
  // Helper function to get normalized category
  const getNormalizedCategory = (ingredient: IngredientRecommendation): string => {
    if (!ingredient.category) return 'other';
    
    const _category = ingredient.category?.toLowerCase();
    
    // Map categories to our standard ones
    if (['vegetable', 'vegetables'].includes(_category)) return 'vegetables';
    if (['protein', 'meat', 'seafood', 'fish', 'poultry'].includes(_category)) return 'proteins';
    if (['herb', 'herbs', 'culinary_herb', 'medicinal_herb'].includes(_category)) return 'herbs';
    if (['spice', 'spices', 'seasoning', 'seasonings'].includes(_category)) return 'spices';
    if (['grain', 'grains', 'pasta', 'rice', 'cereal'].includes(_category)) return 'grains';
    if (['fruit', 'fruits', 'berry', 'berries'].includes(_category)) return 'fruits';
    if (['oil', 'oils', 'fat', 'fats'].includes(_category)) return 'oils';
    if (['vinegar', 'vinegars', 'acid', 'acids'].includes(_category)) return 'vinegars';
    
    return 'other';
  };

  // Category management functions
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    if (category !== 'all') {
      setActiveCategory(category);
    }
  };

  // Astrological filtering functions
  const handleAstrologicalFilter = (filter: string) => {
    setAstrologicalFilter(filter);
  };

  const handleElementalFilter = (element: Element | 'all') => {
    setElementalFilter(element);
  };

  const handlePlanetaryFilter = (planet: string) => {
    setPlanetaryFilter(planet);
  };

  // Calculate astrological score for an ingredient
  const calculateAstrologicalScore = (ingredient: EnhancedIngredientRecommendation): number => {
    let score = ingredient.matchScore || 0.5;
    
    // Enhance score based on current astrological conditions
    if (ingredient.elementalProperties && currentZodiac) {
      const zodiacElement = getZodiacElement(currentZodiac);
      if (zodiacElement && ingredient.elementalProperties[zodiacElement]) {
        score += (ingredient.elementalProperties[zodiacElement] || 0) * 0.2;
      }
    }
    
    // Enhance score based on planetary influences
    if (planetaryPositions && Object.keys(planetaryPositions).length > 0) {
      Object.entries(planetaryPositions).forEach(([planet, position]) => {
        const planetElement = getPlanetaryElement(planet);
        if (planetElement && ingredient.elementalProperties?.[planetElement]) {
          score += (ingredient.elementalProperties[planetElement] || 0) * 0.1;
        }
      });
    }
    
    // Enhance score based on time of day (diurnal/nocturnal)
    if (ingredient.elementalProperties) {
      const timeBonus = isDaytime ? 
        (ingredient?.elementalProperties?.Fire || 0) * 0.1 + (ingredient?.elementalProperties?.Air || 0) * 0.05 :
        (ingredient?.elementalProperties?.Water || 0) * 0.1 + (ingredient?.elementalProperties?.Earth || 0) * 0.05;
      score += timeBonus;
    }
    
    return Math.min(1.0, score);
  };

  // Get zodiac element helper
  const getZodiacElement = (zodiac: string): Element | null => {
    const zodiacElements: Record<string, Element> = {
      'aries': 'Fire', 'leo': 'Fire', 'sagittarius': 'Fire',
      'taurus': 'Earth', 'virgo': 'Earth', 'capricorn': 'Earth',
      'gemini': 'Air', 'libra': 'Air', 'aquarius': 'Air',
      'cancer': 'Water', 'scorpio': 'Water', 'pisces': 'Water'
    };
    return zodiacElements[zodiac.toLowerCase()] || null;
  };

  // Get planetary element helper
  const getPlanetaryElement = (planet: string): Element | null => {
    const planetElements: Record<string, Element> = {
      'Sun': 'Fire', 'Mars': 'Fire', 'Jupiter': 'Fire',
      'Moon': 'Water', 'Venus': 'Water', 'Neptune': 'Water',
      'Mercury': 'Air', 'Uranus': 'Air',
      'Saturn': 'Earth', 'Pluto': 'Earth'
    };
    return planetElements[planet] || null;
  };

  // Filter ingredients based on astrological criteria
  const applyAstrologicalFiltering = (ingredients: EnhancedIngredientRecommendation[]): EnhancedIngredientRecommendation[] => {
    return ingredients.filter(ingredient => {
      // Apply elemental filter
      if (elementalFilter !== 'all' && ingredient.elementalProperties) {
        const elementValue = ingredient.elementalProperties[elementalFilter] || 0;
        if (elementValue < 0.3) return false; // Must have significant elemental presence
      }
      
      // Apply planetary filter
      if (planetaryFilter !== 'all') {
        const planetElement = getPlanetaryElement(planetaryFilter);
        if (planetElement && ingredient.elementalProperties) {
          const elementValue = ingredient.elementalProperties[planetElement] || 0;
          if (elementValue < 0.2) return false;
        }
      }
      
      // Apply astrological compatibility filter
      if (astrologicalFilter === 'high-compatibility') {
        const astroScore = calculateAstrologicalScore(ingredient);
        if (astroScore < 0.7) return false;
      } else if (astrologicalFilter === 'current-zodiac') {
        const zodiacElement = getZodiacElement(currentZodiac || 'aries');
        if (zodiacElement && ingredient.elementalProperties) {
          const elementValue = ingredient.elementalProperties[zodiacElement] || 0;
          if (elementValue < 0.25) return false;
        }
      }
      
      return true;
    }).map(ingredient => ({
      ...ingredient,
      matchScore: calculateAstrologicalScore(ingredient)
    })).sort((a, b) => b.matchScore - a.matchScore);
  };

  // Helper function to determine category from ingredient name
  const determineCategoryArrow = (name: string): string => {
    const lowercaseName = name?.toLowerCase();
    
    // Proteins
    if (
      lowercaseName?.includes('beef') || lowercaseName?.includes('chicken') || 
      lowercaseName?.includes('pork') || lowercaseName?.includes('lamb') || 
      lowercaseName?.includes('fish') || lowercaseName?.includes('seafood') ||
      lowercaseName?.includes('tofu') || lowercaseName?.includes('tempeh') ||
      lowercaseName?.includes('seitan') || lowercaseName?.includes('protein')
    ) {
      return 'proteins';
    }
    
    // Vegetables
    if (
      lowercaseName?.includes('carrot') || lowercaseName?.includes('broccoli') || 
      lowercaseName?.includes('tomato') || lowercaseName?.includes('onion') ||
      lowercaseName?.includes('garlic') || lowercaseName?.includes('spinach') ||
      lowercaseName?.includes('lettuce') || lowercaseName?.includes('pepper')
    ) {
      return 'vegetables';
    }
    
    // Fruits
    if (
      lowercaseName?.includes('apple') || lowercaseName?.includes('orange') || 
      lowercaseName?.includes('lemon') || lowercaseName?.includes('berry') ||
      lowercaseName?.includes('melon') || lowercaseName?.includes('grape')
    ) {
      return 'fruits';
    }
    
    // Herbs
    if (
      lowercaseName?.includes('basil') || lowercaseName?.includes('oregano') || 
      lowercaseName?.includes('thyme') || lowercaseName?.includes('rosemary') ||
      lowercaseName?.includes('sage') || lowercaseName?.includes('parsley')
    ) {
      return 'herbs';
    }
    
    // Spices
    if (
      lowercaseName?.includes('cinnamon') || lowercaseName?.includes('cumin') || 
      lowercaseName?.includes('turmeric') || lowercaseName?.includes('paprika') ||
      lowercaseName?.includes('cardamom') || lowercaseName?.includes('ginger')
    ) {
      return 'spices';
    }
    
    // Grains
    if (
      lowercaseName?.includes('rice') || lowercaseName?.includes('wheat') || 
      lowercaseName?.includes('oat') || lowercaseName?.includes('barley') ||
      lowercaseName?.includes('quinoa') || lowercaseName?.includes('pasta')
    ) {
      return 'grains';
    }
    
    // Default to vegetables
    return 'vegetables';
  };

  // Helper function to check if ingredients are similar (for deduplication)
  const areSimilarIngredients = (name1: string, name2: string): boolean => {
    if (!name1 || !name2) return false;
    
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Exact match
    if (n1 === n2) return true;
    
    // Check if one contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Check for common variations
    const variations = [
      [' oil', ''],
      [' vinegar', ''],
      ['fresh ', ''],
      ['dried ', ''],
      ['ground ', ''],
      ['whole ', '']
    ];
    
    let modified1 = n1;
    let modified2 = n2;
    
    variations.forEach(([from, to]) => {
      modified1 = modified1.replace(from, to);
      modified2 = modified2.replace(from, to);
    });
    
    return modified1 === modified2;
  };
  
  // Combine and categorize all recommendations
  const combinedCategorizedRecommendations = useMemo(() => {
    // Start with empty categories
    const categories: EnhancedGroupedRecommendations = {
      proteins: [],
      vegetables: [],
      fruits: [],
      grains: [],
      herbs: [],
      spices: [],
      oils: [],
      vinegars: []
    };
    
    // Skip if still loading
    if (isComponentLoading) return categories;
    
    // Process food recommendations
    if (foodRecommendations && Array.isArray(foodRecommendations)) {
      (foodRecommendations || []).forEach(ingredient => {
        // Skip items with no name
        if (!ingredient.name) return;
        
        const name = ingredient.name?.toLowerCase();
        
        // Proteins
        if (
          name?.includes?.('beef') || name?.includes?.('chicken') || 
          name?.includes?.('pork') || name?.includes?.('lamb') || 
          (Array.isArray(name) ? name.includes('fish') : name === 'fish') || (Array.isArray(name) ? name.includes('seafood') : name === 'seafood') ||
          (Array.isArray(name) ? name.includes('tofu') : name === 'tofu') || (Array.isArray(name) ? name.includes('tempeh') : name === 'tempeh') ||
          (Array.isArray(name) ? name.includes('seitan') : name === 'seitan') || (Array.isArray(name) ? name.includes('protein') : name === 'protein') ||
          ingredient.category?.toLowerCase() === 'protein' ||
          ingredient.category?.toLowerCase() === 'proteins'
        ) {
          categories.proteins?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          } as EnhancedIngredientRecommendation);
        }
        // Spices and seasonings
        else if (
          // Exclude common vegetable peppers
          (name?.includes?.('pepper') && 
           !name?.includes?.('bell pepper') && 
           (Array.isArray(name) ? !name.includes('sweet pepper') : name !== 'sweet pepper') && 
           (Array.isArray(name) ? !name.includes('jalapeno') : name !== 'jalapeno') && 
           (Array.isArray(name) ? !name.includes('poblano') : name !== 'poblano') && 
           (Array.isArray(name) ? !name.includes('anaheim') : name !== 'anaheim') && 
           (Array.isArray(name) ? !name.includes('banana pepper') : name !== 'banana pepper') && 
           (Array.isArray(name) ? !name.includes('chili pepper') : name !== 'chili pepper') && 
           (Array.isArray(name) ? !name.includes('paprika') : name !== 'paprika')) || 
          (Array.isArray(name) ? name.includes('cinnamon') : name === 'cinnamon') || 
          (Array.isArray(name) ? name.includes('nutmeg') : name === 'nutmeg') || 
          (Array.isArray(name) ? name.includes('cumin') : name === 'cumin') || 
          (Array.isArray(name) ? name.includes('turmeric') : name === 'turmeric') || 
          (Array.isArray(name) ? name.includes('cardamom') : name === 'cardamom') ||
          (Array.isArray(name) ? name.includes('spice') : name === 'spice') || 
          (Array.isArray(name) ? name.includes('seasoning') : name === 'seasoning')
        ) {
          categories.spices?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Vegetable Peppers
        else if (
          (Array.isArray(name) ? name.includes('bell pepper') : name === 'bell pepper') || 
          (Array.isArray(name) ? name.includes('sweet pepper') : name === 'sweet pepper') || 
          (Array.isArray(name) ? name.includes('jalapeno') : name === 'jalapeno') || 
          (Array.isArray(name) ? name.includes('poblano') : name === 'poblano') || 
          (Array.isArray(name) ? name.includes('anaheim') : name === 'anaheim') || 
          (Array.isArray(name) ? name.includes('banana pepper') : name === 'banana pepper') || 
          (Array.isArray(name) ? name.includes('chili pepper') : name === 'chili pepper') || 
          (Array.isArray(name) ? name.includes('paprika') : name === 'paprika')
        ) {
          categories.vegetables?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Oils
        else if (isOil(ingredient)) {
          categories.oils?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Vinegars
        else if (isVinegar(ingredient)) {
          categories.vinegars?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Herbs
        else if (ingredient.category === 'herb' || (Array.isArray(name) ? name.includes('herb') : name === 'herb') || (herbNames || []).some(herb => name?.includes?.(String(herb || '').toLowerCase()))) {
          categories.herbs?.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // For other ingredients, use explicit category if available
        else {
          const _category = getNormalizedCategory(ingredient);
          if (categories[_category]) {
            categories[_category].push({
              ...ingredient,
              matchScore: ingredient.score || 0.5
            });
          } else {
            if (
              (Array.isArray(name) ? name.includes('ginger') : name === 'ginger') || (Array.isArray(name) ? name.includes('garlic') : name === 'garlic') || (Array.isArray(name) ? name.includes('onion') : name === 'onion') || 
              (Array.isArray(name) ? name.includes('carrot') : name === 'carrot') || (Array.isArray(name) ? name.includes('broccoli') : name === 'broccoli') || (Array.isArray(name) ? name.includes('tomato') : name === 'tomato') ||
              (Array.isArray(name) ? name.includes('zucchini') : name === 'zucchini') || (Array.isArray(name) ? name.includes('cucumber') : name === 'cucumber') || (Array.isArray(name) ? name.includes('lettuce') : name === 'lettuce') ||
              (Array.isArray(name) ? name.includes('spinach') : name === 'spinach') || (Array.isArray(name) ? name.includes('kale') : name === 'kale') || (Array.isArray(name) ? name.includes('cabbage') : name === 'cabbage') ||
              (Array.isArray(name) ? name.includes('cauliflower') : name === 'cauliflower') || (Array.isArray(name) ? name.includes('celery') : name === 'celery') || (Array.isArray(name) ? name.includes('potato') : name === 'potato') ||
              (Array.isArray(name) ? name.includes('squash') : name === 'squash') || (Array.isArray(name) ? name.includes('eggplant') : name === 'eggplant') || (Array.isArray(name) ? name.includes('beet') : name === 'beet') ||
              (Array.isArray(name) ? name.includes('asparagus') : name === 'asparagus') || (Array.isArray(name) ? name.includes('artichoke') : name === 'artichoke') || (Array.isArray(name) ? name.includes('radish') : name === 'radish') ||
              (Array.isArray(name) ? name.includes('arugula') : name === 'arugula') || (Array.isArray(name) ? name.includes('turnip') : name === 'turnip') || (Array.isArray(name) ? name.includes('leek') : name === 'leek') ||
              ingredient.category?.toLowerCase() === 'vegetable' || ingredient.category?.toLowerCase() === 'vegetables'
            ) {
              categories.vegetables?.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            } else if (
              (Array.isArray(name) ? name.includes('apple') : name === 'apple') || (Array.isArray(name) ? name.includes('orange') : name === 'orange') || (Array.isArray(name) ? name.includes('lemon') : name === 'lemon') || 
              (Array.isArray(name) ? name.includes('melon') : name === 'melon') || (Array.isArray(name) ? name.includes('berry') : name === 'berry') || (Array.isArray(name) ? name.includes('pineapple') : name === 'pineapple')
            ) {
              categories.fruits?.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            } else {
              // Default to vegetables for unmatched items
              categories.vegetables?.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            }
          }
        }
      });
    }
    
    // Now add the astrological recommendations
    Object.entries(astroRecommendations || {}).forEach(([_category, items]) => {
      (items || []).forEach(item => {
        const normalizedCategory = getNormalizedCategory(item);
        const targetCategory = normalizedCategory === 'other' ? determineCategory(item.name) : normalizedCategory;
        
        if (categories[targetCategory]) {
          // Check if this item already exists in the category (with improved duplicate detection)
          const existingItemIndex = categories[targetCategory].findIndex(
            existing => areSimilarIngredients(existing.name, item.name)
          );
          
          if (existingItemIndex >= 0) {
            // Update the existing item with better score if needed
            if (item.matchScore > categories[targetCategory][existingItemIndex].matchScore) {
              categories[targetCategory][existingItemIndex] = {
                ...item,
                category: targetCategory
              };
            }
          } else {
            // Add as a new item
            categories[targetCategory].push({
              ...item,
              category: targetCategory
            });
          }
        }
      });
    });
    
    // Ensure vinegars are always present by adding them from the collection if needed
    if (!categories.vinegars || categories.vinegars  || [].length === 0) {
      categories.vinegars = Object.entries(vinegarsCollection || {}).map(([key, vinegarData]) => {
        const displayName = vinegarData.name || key.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase());
        return {
          name: displayName,
          type: 'vinegars',
          category: 'vinegars',
          matchScore: 0.6,
          elementalProperties: vinegarData.elementalProperties || { 
            Water: 0.4, 
            Earth: 0.3, 
            Air: 0.2, 
            Fire: 0.1 
          },
                      qualities: ((vinegarData as unknown as Record<string, unknown>).qualities as string[]) || ['acidic', 'tangy', 'flavorful'],
          description: `${displayName} - A versatile acidic component for your culinary creations.`
        } as IngredientRecommendation;
      });
    }
    
    // Add any missing oils from the oils collection
    if (!categories.oils || categories.oils  || [].length < 3) {
      const existingOilNames = new Set((categories.oils || [])?.map(oil => oil.name?.toLowerCase()));
      const additionalOils = Object.entries(oilsCollection)
        .filter(([_, oilData]) => 
          !existingOilNames.has(oilData.name?.toLowerCase() || '')
        )
        .slice(0, 10) // Limit to 10 additional oils
        .map(([key, oilData]) => {
          return {
            name: oilData.name || key.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
            type: 'oils',
            category: 'oils',
            matchScore: 0.6,
            elementalProperties: oilData.elementalProperties || { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 
             },
            qualities: ((oilData as unknown as Record<string, unknown>).qualities as string[]) || ['cooking', 'flavoring'],
            description: `${oilData.name || key.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase())} - ${String((oilData as unknown as Record<string, unknown>)?.description || "A versatile cooking oil with various applications.")}`
          } as IngredientRecommendation;
        });
      
      categories.oils = [...(categories.oils || []), ...additionalOils]
        .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Sort each category by matchScore
    Object.keys(categories || {}).forEach(category => {
      categories[category] = categories[category]
        .sort((a, b) => b.matchScore - a.matchScore)
        .filter(item => item.matchScore > 0);
    });
    
    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(categories || {}).filter(([_, items]) => (items || []).length > 0)
    );
  }, [foodRecommendations, astroRecommendations, herbNames, oilTypes, vinegarTypes, isComponentLoading]);
  
  // Helper function to determine the category of a food by name
  function determineCategory(name: string): string {
    const lowercaseName = name?.toLowerCase();
    
    // Proteins
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('beef') : lowercaseName === 'beef') || (Array.isArray(lowercaseName) ? lowercaseName.includes('chicken') : lowercaseName === 'chicken') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('pork') : lowercaseName === 'pork') || (Array.isArray(lowercaseName) ? lowercaseName.includes('lamb') : lowercaseName === 'lamb') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('fish') : lowercaseName === 'fish') || (Array.isArray(lowercaseName) ? lowercaseName.includes('seafood') : lowercaseName === 'seafood') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('tofu') : lowercaseName === 'tofu') || (Array.isArray(lowercaseName) ? lowercaseName.includes('tempeh') : lowercaseName === 'tempeh') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('seitan') : lowercaseName === 'seitan') || (Array.isArray(lowercaseName) ? lowercaseName.includes('protein') : lowercaseName === 'protein')
    ) {
      return 'proteins';
    }
    
    // Herbs
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('basil') : lowercaseName === 'basil') || (Array.isArray(lowercaseName) ? lowercaseName.includes('oregano') : lowercaseName === 'oregano') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('thyme') : lowercaseName === 'thyme') || (Array.isArray(lowercaseName) ? lowercaseName.includes('rosemary') : lowercaseName === 'rosemary') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('mint') : lowercaseName === 'mint') || (Array.isArray(lowercaseName) ? lowercaseName.includes('cilantro') : lowercaseName === 'cilantro') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('sage') : lowercaseName === 'sage') || (Array.isArray(lowercaseName) ? lowercaseName.includes('herb') : lowercaseName === 'herb')
    ) {
      return 'herbs';
    }
    
    // Spices
    if (
      (lowercaseName.includes('pepper') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('bell pepper') : lowercaseName !== 'bell pepper') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('sweet pepper') : lowercaseName !== 'sweet pepper') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('jalapeno') : lowercaseName !== 'jalapeno') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('poblano') : lowercaseName !== 'poblano') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('anaheim') : lowercaseName !== 'anaheim') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('banana pepper') : lowercaseName !== 'banana pepper') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('chili pepper') : lowercaseName !== 'chili pepper') && 
       (Array.isArray(lowercaseName) ? !lowercaseName.includes('paprika') : lowercaseName !== 'paprika')) || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('cinnamon') : lowercaseName === 'cinnamon') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('nutmeg') : lowercaseName === 'nutmeg') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('cumin') : lowercaseName === 'cumin') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('turmeric') : lowercaseName === 'turmeric') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('cardamom') : lowercaseName === 'cardamom') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('spice') : lowercaseName === 'spice') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('seasoning') : lowercaseName === 'seasoning')
    ) {
      return 'spices';
    }
    
    // Vegetable Peppers
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('bell pepper') : lowercaseName === 'bell pepper') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('sweet pepper') : lowercaseName === 'sweet pepper') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('jalapeno') : lowercaseName === 'jalapeno') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('poblano') : lowercaseName === 'poblano') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('anaheim') : lowercaseName === 'anaheim') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('banana pepper') : lowercaseName === 'banana pepper') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('chili pepper') : lowercaseName === 'chili pepper') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('paprika') : lowercaseName === 'paprika')
    ) {
      return 'vegetables';
    }
    
    // Vinegars
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('vinegar') : lowercaseName === 'vinegar') || (Array.isArray(lowercaseName) ? lowercaseName.includes('balsamic') : lowercaseName === 'balsamic') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('cider') : lowercaseName === 'cider') || (Array.isArray(lowercaseName) ? lowercaseName.includes('rice wine') : lowercaseName === 'rice wine') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('sherry vinegar') : lowercaseName === 'sherry vinegar') || (Array.isArray(lowercaseName) ? lowercaseName.includes('red wine vinegar') : lowercaseName === 'red wine vinegar') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('white wine vinegar') : lowercaseName === 'white wine vinegar') || (Array.isArray(lowercaseName) ? lowercaseName.includes('champagne vinegar') : lowercaseName === 'champagne vinegar')
    ) {
      return 'vinegars';
    }
    
    // Grains
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('rice') : lowercaseName === 'rice') || (Array.isArray(lowercaseName) ? lowercaseName.includes('pasta') : lowercaseName === 'pasta') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('bread') : lowercaseName === 'bread') || (Array.isArray(lowercaseName) ? lowercaseName.includes('quinoa') : lowercaseName === 'quinoa') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('barley') : lowercaseName === 'barley') || (Array.isArray(lowercaseName) ? lowercaseName.includes('oat') : lowercaseName === 'oat') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('grain') : lowercaseName === 'grain') || (Array.isArray(lowercaseName) ? lowercaseName.includes('wheat') : lowercaseName === 'wheat')
    ) {
      return 'grains';
    }
    
    // Fruits
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('apple') : lowercaseName === 'apple') || (Array.isArray(lowercaseName) ? lowercaseName.includes('orange') : lowercaseName === 'orange') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('banana') : lowercaseName === 'banana') || (Array.isArray(lowercaseName) ? lowercaseName.includes('berry') : lowercaseName === 'berry') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('melon') : lowercaseName === 'melon') || (Array.isArray(lowercaseName) ? lowercaseName.includes('pear') : lowercaseName === 'pear') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('grape') : lowercaseName === 'grape') || (Array.isArray(lowercaseName) ? lowercaseName.includes('fruit') : lowercaseName === 'fruit')
    ) {
      return 'fruits';
    }
    
    // Vegetables
    if (
      (Array.isArray(lowercaseName) ? lowercaseName.includes('ginger') : lowercaseName === 'ginger') || (Array.isArray(lowercaseName) ? lowercaseName.includes('garlic') : lowercaseName === 'garlic') || (Array.isArray(lowercaseName) ? lowercaseName.includes('onion') : lowercaseName === 'onion') || 
      (Array.isArray(lowercaseName) ? lowercaseName.includes('carrot') : lowercaseName === 'carrot') || (Array.isArray(lowercaseName) ? lowercaseName.includes('broccoli') : lowercaseName === 'broccoli') || (Array.isArray(lowercaseName) ? lowercaseName.includes('tomato') : lowercaseName === 'tomato') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('zucchini') : lowercaseName === 'zucchini') || (Array.isArray(lowercaseName) ? lowercaseName.includes('cucumber') : lowercaseName === 'cucumber') || (Array.isArray(lowercaseName) ? lowercaseName.includes('lettuce') : lowercaseName === 'lettuce') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('spinach') : lowercaseName === 'spinach') || (Array.isArray(lowercaseName) ? lowercaseName.includes('kale') : lowercaseName === 'kale') || (Array.isArray(lowercaseName) ? lowercaseName.includes('cabbage') : lowercaseName === 'cabbage') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('cauliflower') : lowercaseName === 'cauliflower') || (Array.isArray(lowercaseName) ? lowercaseName.includes('celery') : lowercaseName === 'celery') || (Array.isArray(lowercaseName) ? lowercaseName.includes('potato') : lowercaseName === 'potato') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('squash') : lowercaseName === 'squash') || (Array.isArray(lowercaseName) ? lowercaseName.includes('eggplant') : lowercaseName === 'eggplant') || (Array.isArray(lowercaseName) ? lowercaseName.includes('beet') : lowercaseName === 'beet') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('asparagus') : lowercaseName === 'asparagus') || (Array.isArray(lowercaseName) ? lowercaseName.includes('artichoke') : lowercaseName === 'artichoke') || (Array.isArray(lowercaseName) ? lowercaseName.includes('radish') : lowercaseName === 'radish') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('arugula') : lowercaseName === 'arugula') || (Array.isArray(lowercaseName) ? lowercaseName.includes('turnip') : lowercaseName === 'turnip') || (Array.isArray(lowercaseName) ? lowercaseName.includes('leek') : lowercaseName === 'leek') ||
      (Array.isArray(lowercaseName) ? lowercaseName.includes('vegetable') : lowercaseName === 'vegetable')
    ) {
      return 'vegetables';
    }
    
    // Default to vegetables for anything else
    return 'vegetables';
  }
  
  // Helper function to get the CSS class for match score display
  const getMatchScoreClass = (matchScore?: number): string => {
    if (matchScore === undefined) return 'match-average';
    
    if (matchScore >= 0.85) return 'match-excellent';
    if (matchScore >= 0.7) return 'match-good';
    if (matchScore >= 0.5) return 'match-average';
    if (matchScore >= 0.3) return 'match-poor';
    return 'match-not-recommended';
  };
  
  // Helper function to format match score for display
  const formatMatchScore = (matchScore?: number): string => {
    if (matchScore === undefined) return 'Average';
    
    if (matchScore >= 0.85) return 'Excellent';
    if (matchScore >= 0.7) return 'Good';
    if (matchScore >= 0.5) return 'Average';
    if (matchScore >= 0.3) return 'Poor';
    return 'Not Recommended';
  };
  
  // Effect to load enhanced recommendations when features are toggled
  useEffect(() => {
    if (showEnhancedFeatures) {
      loadEnhancedRecommendations();
    }
  }, [showEnhancedFeatures, loadEnhancedRecommendations]);
  
  // Function to compare two ingredients for flavor compatibility
  const compareIngredients = useCallback((ingredient1: IngredientRecommendation, ingredient2: IngredientRecommendation) => {
    // Use flavor engine context for comparison if available
    if (calculateCompatibility) {
      try {
        return calculateCompatibility(ingredient1 as any, ingredient2 as any);
      } catch (error) {
        console.error('Error calculating compatibility:', error);
        return 0.5; // Default compatibility
      }
    }
    
    // Fallback comparison using elemental properties
    if (ingredient1.elementalProperties && ingredient2.elementalProperties) {
      const fire1 = ingredient1?.elementalProperties?.Fire || 0;
      const water1 = ingredient1?.elementalProperties?.Water || 0;
      const earth1 = ingredient1?.elementalProperties?.Earth || 0;
      const Air1 = ingredient1?.elementalProperties?.Air || 0;
      
      const fire2 = ingredient2?.elementalProperties?.Fire || 0;
      const water2 = ingredient2?.elementalProperties?.Water || 0;
      const earth2 = ingredient2?.elementalProperties?.Earth || 0;
      const Air2 = ingredient2?.elementalProperties?.Air || 0;
      
      // Calculate simple compatibility based on elemental similarity
      const fireDiff = Math.abs(fire1 - fire2);
      const waterDiff = Math.abs(water1 - water2);
      const earthDiff = Math.abs(earth1 - earth2);
      const AirDiff = Math.abs(Air1 - Air2);
      
      // Calculate average difference (0-1 scale)
      const avgDiff = (fireDiff + waterDiff + earthDiff + AirDiff) / 4;
      
      // Convert to compatibility score (1 - avgDiff)
      return 1 - avgDiff;
    }
    
    return 0.5; // Default compatibility score
  }, [calculateCompatibility]);
  
  // Function to render different ingredient categories
  const renderContent = () => {
    // Show ingredient compatibility UI if in that mode
    if (showFlavorCompatibility && selectedIngredientForComparison) {
                      return (
        <div className={'flavorCompatibilityContainer-class'}>
          <h3 className={'sectionTitle-class'}>
            Flavor Compatibility with {selectedIngredientForComparison.name}
          </h3>
                    <button
                      onClick={() => {
              setShowFlavorCompatibility(false);
                        setSelectedIngredientForComparison(null);
                      }}
            className={'backButton-class'}
                    >
            Back to Recommendations
                    </button>
          
          <div className={'compatibilityList-class'}>
            {(comparisonIngredients || []).map(ingredient => {
              const compatibilityScore = compareIngredients(
                selectedIngredientForComparison, 
                ingredient
              );
            
            return (
                <div 
                  key={ingredient.name} 
                  className={'compatibilityItem-class'}
                  style={{ 
                    '--compatibility': `${compatibilityScore * 100}%`,
                    opacity: 0.5 + (compatibilityScore * 0.5)
                  } as React.CSSProperties}
                >
                  <span className={'ingredientName-class'}>{ingredient.name}</span>
                  <div className={'compatibilityBar-class'}>
                    <div 
                      className={'compatibilityFill-class'}
                      style={{ width: `${compatibilityScore * 100}%` }}
                    />
                  </div>
                  <span className={'compatibilityScore-class'}>
                    {Math.round(compatibilityScore * 100)}%
                  </span>
                </div>
            );
          })}
        </div>
      </div>
      );
    }
    
    // Default view - show ingredient recommendations by category
    return (
      <div className={'ingredientCategories-class'}>
        {Object.entries(combinedCategorizedRecommendations || {}).map(([category, ingredients]) => {
          // Skip empty categories
          if (!ingredients || (ingredients || []).length === 0) return null;
          
          // Get display name for category
          const categoryDisplayName = CATEGORY_DISPLAY_NAMES[category] || category;
          
          // Limit items displayed based on category display counts
          const displayCount = expanded[category] 
            ? (ingredients || []).length 
            : (CATEGORY_DISPLAY_COUNTS[category] || 6);
          
          const displayedItems = ingredients?.slice(0, displayCount);
            
            return (
            <div key={category} className={'categorySection-class'}>
                <div 
                className={'categoryHeader-class'}
                  onClick={(e) => toggleCategoryExpansion(category, e)}
                >
                <h3 className={'categoryTitle-class'}>{categoryDisplayName}</h3>
                <button className={'expandButton-class'}>
                  {expanded[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                
              <div className={'ingredientList-class'}>
                {(displayedItems || []).map((item) => (
                  <div 
                    key={item.name}
                    className={`${'ingredientCard-class'} ${selectedIngredient?.name === item.name ? 'selected-class' : ''}`}
                        onClick={(e) => handleIngredientSelect(item as IngredientRecommendation, e)}
                      >
                    <div className={'ingredientHeader-class'}>
                      <h4 className={'ingredientName-class'}>{item.name}</h4>
                      <div className={`${'matchScore-class'} ${styles[getMatchScoreClass(item.matchScore)]}`}>
                            {formatMatchScore(item.matchScore)}
                      </div>
                        </div>
                        
                    {item.elementalProperties && (
                      <div className={'elementalState-class'}>
                        {getElementIcon('Fire')}
                        <span className={'elementValue-class'}>
                          {Math.round((item?.elementalProperties?.Fire || 0) * 100)}%
                            </span>
                        {getElementIcon('Water')}
                        <span className={'elementValue-class'}>
                          {Math.round((item?.elementalProperties?.Water || 0) * 100)}%
                        </span>
                        {getElementIcon('Earth')}
                        <span className={'elementValue-class'}>
                          {Math.round((item?.elementalProperties?.Earth || 0) * 100)}%
                        </span>
                        {getElementIcon('Air')}
                        <span className={'elementValue-class'}>
                          {Math.round((item?.elementalProperties?.Air || 0) * 100)}%
                        </span>
                          </div>
                        )}
                        
                    {selectedIngredient?.name === item.name && (
                      <div className={'ingredientDetails-class'}>
                              {item.description && (
                          <p className={'description-class'}>{item.description}</p>
                              )}
                              
                              {item.qualities && item.qualities  || [].length > 0 && (
                          <div className={'qualities-class'}>
                            <span className={'detailLabel-class'}>Qualities:</span>
                            <div className={'tagsList-class'}>
                              {item?.qualities || [].map(quality => (
                                <span key={quality} className={'tag-class'}>
                                  {quality}
                                      </span>
                              ))}
                                </div>
                                </div>
                              )}

                        {/* Add enhanced features if enabled */}
                            {showEnhancedFeatures && enhancedRecommendations && (
                          <div className={'enhancedFeatures-class'}>
                            {/* Find matching enhanced recommendation */}
                            {enhancedRecommendations.recommendations
                              .filter(rec => 
                                rec?.ingredient?.name?.toLowerCase() === item.name?.toLowerCase())
                              .map(enhancedRec => (
                                <div key={`enhanced-${enhancedRec?.ingredient?.name}`} className={'enhancedDetails-class'}>
                                  {enhancedRec.chakraAlignment && (
                                    <div className={'chakraAlignment-class'}>
                                    <ChakraIndicator 
                                        chakra={enhancedRec?.chakraAlignment?.dominantChakra}
                                        energyLevel={enhancedRec?.chakraAlignment?.energyLevel}
                                        balanceState={enhancedRec?.chakraAlignment?.balanceState}
                                    />
                                  </div>
                                )}
                                
                                  {enhancedRec.reasons && enhancedRec.reasons  || [].length > 0 && (
                                    <div className={'recommendations-class'}>
                                      <h5 className={'recommendationsTitle-class'}>Why this ingredient:</h5>
                                      <ul className={'reasonsList-class'}>
                                        {enhancedRec?.reasons || [].map((reason, idx) => (
                                          <li key={idx} className={'reason-class'}>{reason}</li>
                                        ))}
                                      </ul>
                                  </div>
                                )}
                                    </div>
                              ))}
                                  </div>
                                )}
                              </div>
                            )}
                                        </div>
                                      ))}
                
                {/* Show "See More" button if there are more items */}
                {(ingredients || []).length > (displayedItems || []).length && !expanded[category] && (
                  <button 
                    className={'seeMoreButton-class'}
                    onClick={(e) => toggleCategoryExpansion(category, e)}
                  >
                    See {(ingredients || []).length - (displayedItems || []).length} more
                    <ChevronDown size={14} />
                  </button>
                )}
                              </div>
                                      </div>
          );
        })}
                                    </div>
                                  );
  };
  
  // Replace the loading UI with a more resilient version
  if (isComponentLoading && !loadingTimedOut) {
                                  return (
      <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="h-12 w-12 rounded-full bg-blue-400/30"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-blue-400/30 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-blue-400/30 rounded"></div>
                <div className="h-4 bg-blue-400/30 rounded w-5/6"></div>
                                        </div>
                                        </div>
                                        </div>
          <p className="text-indigo-200 text-center">Loading celestial influences...</p>
                                      </div>
                                    </div>
                                  );
  }

  // If loading timed out or there's an error, show a graceful fallback
  if (loadingTimedOut || astroError || foodError) {
    return (
      <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-red-300 mb-4">
            {loadingTimedOut ? "Loading took too long" : "Something went wrong"}
          </h3>
          <p className="text-indigo-200 mb-6">
            {loadingTimedOut 
              ? "We couldn't load your celestial influences in time. Please try again." 
              : "We couldn't properly calculate your ingredient recommendations."}
          </p>
          <button 
            onClick={() => {
              setLoadingTimedOut(false);
              setIsComponentLoading(true);
              (refreshRecommendations as () => void)();
              generateRecommendations();
            }}
            className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Try Again
                      </button>
                </div>
              </div>
            );
  }
  
  // Category Selection Component
  const CategorySelector = () => {
    const availableCategories = Object.keys(combinedCategorizedRecommendations || {});
    
    return (
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            Ingredient Categories
          </h3>
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            style={{
              padding: '6px 12px',
              backgroundColor: showAllCategories ? '#3b82f6' : '#e2e8f0',
              color: showAllCategories ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {showAllCategories ? 'Show Selected' : 'Show All'}
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {availableCategories.map(category => {
            const isSelected = selectedCategories.includes(category);
            const count = combinedCategorizedRecommendations[category]?.length || 0;
            
            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isSelected ? '#3b82f6' : '#ffffff',
                  color: isSelected ? 'white' : '#475569',
                  border: `1px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && e?.currentTarget) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && e?.currentTarget) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
              >
                {CATEGORY_DISPLAY_NAMES[category] || category}
                <span style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: isSelected ? 'white' : '#64748b',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Quick filter buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => handleCategoryFilter('all')}
            style={{
              padding: '6px 12px',
              backgroundColor: categoryFilter === 'all' ? '#10b981' : '#f3f4f6',
              color: categoryFilter === 'all' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            All Categories
          </button>
          {['proteins', 'vegetables', 'herbs', 'spices'].map(category => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              style={{
                padding: '6px 12px',
                backgroundColor: categoryFilter === category ? '#10b981' : '#f3f4f6',
                color: categoryFilter === category ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {CATEGORY_DISPLAY_NAMES[category]}
            </button>
          ))}
        </div>
        
        {/* Astrological Filters Toggle */}
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setShowAstrologicalFilters(!showAstrologicalFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: showAstrologicalFilters ? '#7c3aed' : '#f8fafc',
              color: showAstrologicalFilters ? 'white' : '#64748b',
              border: `1px solid ${showAstrologicalFilters ? '#7c3aed' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Beaker size={16} />
            Astrological Filters
            {showAstrologicalFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {/* Astrological Filter Options */}
          {showAstrologicalFilters && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: '#faf5ff',
              borderRadius: '8px',
              border: '1px solid #e9d5ff'
            }}>
              {/* Astrological Compatibility Filter */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  marginBottom: '8px'
                }}>
                  Astrological Compatibility
                </label>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { value: 'all', label: 'All Ingredients' },
                    { value: 'high-compatibility', label: 'High Compatibility (70%+)' },
                    { value: 'current-zodiac', label: `Current ${currentZodiac || 'Aries'} Energy` }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAstrologicalFilter(option.value)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: astrologicalFilter === option.value ? '#7c3aed' : '#ffffff',
                        color: astrologicalFilter === option.value ? 'white' : '#64748b',
                        border: `1px solid ${astrologicalFilter === option.value ? '#7c3aed' : '#d1d5db'}`,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Elemental Filter */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  marginBottom: '8px'
                }}>
                  Elemental Focus
                </label>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handleElementalFilter('all')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: elementalFilter === 'all' ? '#6b7280' : '#ffffff',
                      color: elementalFilter === 'all' ? 'white' : '#64748b',
                      border: `1px solid ${elementalFilter === 'all' ? '#6b7280' : '#d1d5db'}`,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    All Elements
                  </button>
                  {(['Fire', 'Water', 'Earth', 'Air'] as Element[]).map(element => (
                    <button
                      key={element}
                      onClick={() => handleElementalFilter(element)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: elementalFilter === element ? 
                          (element === 'Fire' ? '#ef4444' : 
                           element === 'Water' ? '#3b82f6' :
                           element === 'Earth' ? '#10b981' : '#8b5cf6') : '#ffffff',
                        color: elementalFilter === element ? 'white' : '#64748b',
                        border: `1px solid ${elementalFilter === element ? 
                          (element === 'Fire' ? '#ef4444' : 
                           element === 'Water' ? '#3b82f6' :
                           element === 'Earth' ? '#10b981' : '#8b5cf6') : '#d1d5db'}`,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {getElementIcon(element)}
                      {element}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Planetary Filter */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  marginBottom: '8px'
                }}>
                  Planetary Influence
                </label>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handlePlanetaryFilter('all')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: planetaryFilter === 'all' ? '#6b7280' : '#ffffff',
                      color: planetaryFilter === 'all' ? 'white' : '#64748b',
                      border: `1px solid ${planetaryFilter === 'all' ? '#6b7280' : '#d1d5db'}`,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    All Planets
                  </button>
                  {['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map(planet => (
                    <button
                      key={planet}
                      onClick={() => handlePlanetaryFilter(planet)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: planetaryFilter === planet ? '#f59e0b' : '#ffffff',
                        color: planetaryFilter === planet ? 'white' : '#64748b',
                        border: `1px solid ${planetaryFilter === planet ? '#f59e0b' : '#d1d5db'}`,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {planet}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Astrological State Display */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e9d5ff'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#7c3aed',
                  fontWeight: '600',
                  marginBottom: '6px'
                }}>
                  Current Cosmic Conditions
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b46c1',
                  lineHeight: '1.4'
                }}>
                  <div>Zodiac: {currentZodiac || 'Aries'} ({getZodiacElement(currentZodiac || 'aries')} element)</div>
                  <div>Time: {isDaytime ? 'Diurnal (Day)' : 'Nocturnal (Night)'}</div>
                  <div>Active Planets: {Object.keys(planetaryPositions || {}).length} planetary influences</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Ingredient Card Wrapper Component
  const EnhancedIngredientCard = ({ ingredient, category }: { ingredient: EnhancedIngredientRecommendation, category: string }) => {
    const isSelected = selectedIngredient?.name === ingredient.name;
    
    return (
      <IngredientCard
        ingredient={ingredient as any}
        isSelected={isSelected}
        isExpandable={true}
        showAstrologicalInfo={true}
        matchScore={ingredient.matchScore}
        category={category}
        currentZodiac={currentZodiac || 'aries'}
        isDaytime={isDaytime}
        onClick={(ing) => handleIngredientSelect(ing as unknown as IngredientRecommendation, {} as React.MouseEvent)}
      />
    );
  };

  // Filter recommendations based on selected categories and astrological filters
  const filteredRecommendations = useMemo(() => {
    if (!combinedCategorizedRecommendations) return {};
    
    const filtered: EnhancedGroupedRecommendations = {};
    
    Object.entries(combinedCategorizedRecommendations).forEach(([category, ingredients]) => {
      // Apply category filter
      if (categoryFilter !== 'all' && category !== categoryFilter) return;
      
      // Apply selected categories filter
      if (!showAllCategories && !selectedCategories.includes(category)) return;
      
      // Apply astrological filtering
      let filteredIngredients = ingredients;
      
      // Apply astrological filters if any are active
      if (astrologicalFilter !== 'all' || elementalFilter !== 'all' || planetaryFilter !== 'all') {
        filteredIngredients = applyAstrologicalFiltering(ingredients);
      }
      
      // Only include categories with ingredients after filtering
      if (filteredIngredients.length > 0) {
        filtered[category] = filteredIngredients;
      }
    });
    
    return filtered;
  }, [
    combinedCategorizedRecommendations, 
    categoryFilter, 
    selectedCategories, 
    showAllCategories,
    astrologicalFilter,
    elementalFilter,
    planetaryFilter,
    currentZodiac,
    planetaryPositions,
    isDaytime
  ]);

  // Display the recommendations
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <div style={{
            padding: '24px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Ingredient Recommendations</h3>
            <p style={{ color: '#7f1d1d' }}>{error.message}</p>
          </div>
        )}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Astrological Ingredient Recommendations
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover ingredients aligned with your current astrological state and cosmic influences
            </p>
          </div>

          {/* Category Selector */}
          <CategorySelector />

          {/* Recommendations Grid */}
          <div style={{
            display: 'grid',
            gap: '32px'
          }}>
            {Object.entries(filteredRecommendations).map(([category, ingredients]) => {
              if (!ingredients || ingredients.length === 0) return null;
              
              const displayCount = expanded[category] ? ingredients.length : (CATEGORY_DISPLAY_COUNTS[category] || 6);
              const displayedItems = ingredients.slice(0, displayCount);
              
              return (
                <div key={category} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}>
                  {/* Category Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      {CATEGORY_DISPLAY_NAMES[category] || category}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        {ingredients.length} ingredients
                      </span>
                      <button
                        onClick={(e) => toggleCategoryExpansion(category, e)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#475569'
                        }}
                      >
                        {expanded[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Ingredients Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                  }}>
                    {displayedItems.map((ingredient) => (
                      <EnhancedIngredientCard
                        key={ingredient.name}
                        ingredient={ingredient}
                        category={category}
                      />
                    ))}
                  </div>

                  {/* Show More Button */}
                  {ingredients.length > displayedItems.length && !expanded[category] && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '20px'
                    }}>
                      <button
                        onClick={(e) => toggleCategoryExpansion(category, e)}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          margin: '0 auto'
                        }}
                      >
                        Show {ingredients.length - displayedItems.length} more ingredients
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Helper function to check if ingredients are similar (to avoid duplicates)
function areSimilarIngredients(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  
  // Normalize both names
  const normalized1 = name1?.toLowerCase()?.trim();
  const normalized2 = name2?.toLowerCase()?.trim();
  
  // Direct match
  if (normalized1 === normalized2) return true;
  
  // One is a substring of the other
  if ((normalized1.includes && normalized1.includes(normalized2)) || (normalized1 === normalized2) || (normalized2.includes && normalized2.includes(normalized1)) || (normalized2 === normalized1)) {
    return true;
  }
  
  // Levenshtein distance for similar names
  // Simple implementation for similar strings
  const maxLen = Math.max(normalized1.length || 0, normalized2.length || 0);
  let diffCount = 0;
  
  for (let i = 0; i < Math.min(normalized1.length || 0, normalized2.length || 0); i++) {
    if (normalized1[i] !== normalized2[i]) {
      diffCount++;
    }
  }
  
  // Add remaining characters as differences
  diffCount += Math.abs((normalized1.length || 0) - (normalized2.length || 0));
  
  // If less than 20% different, consider similar
  return diffCount / maxLen < 0.2;
} 
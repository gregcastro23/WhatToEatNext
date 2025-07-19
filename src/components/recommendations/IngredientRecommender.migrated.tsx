'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useServices } from '@/hooks/useServices';
import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp, Beaker, Settings } from 'lucide-react';
import { normalizeChakraKey } from '@/constants/chakraSymbols';
import type { 
  ElementalProperties, 
  Element, 
  ChakraEnergies, 
  AstrologicalState 
} from '@/types/alchemy';

import type { 
  GroupedIngredientRecommendations,
  IngredientRecommendation,
  EnhancedIngredientRecommendation 
} from '@/utils/recommendation/ingredientRecommendation';

import { ErrorBoundary } from 'react-error-boundary';
// TODO: Fix CSS module import - was: import from "./IngredientRecommender.module.css.ts"
import { AlchemicalProperties } from "@/types/alchemy";

import { PlanetaryPosition } from "@/types/celestial";
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

const IngredientRecommenderMigrated: React.FC = () => {
  // Replace context hooks with services hook
  const servicesData = useServices();
  const servicesLoading = servicesData?.isLoading || false;
  const servicesError = servicesData?.error || null;
  const astrologyService = (servicesData as Record<string, unknown>)?.astrologyService;
  const chakraService = (servicesData as Record<string, unknown>)?.chakraService;
  const ingredientService = (servicesData as Record<string, unknown>)?.ingredientService;
  const recommendationService = (servicesData as Record<string, unknown>)?.recommendationService;
  const flavorProfileService = (servicesData as Record<string, unknown>)?.flavorProfileService;
  const elementalCalculator = (servicesData as Record<string, unknown>)?.elementalCalculator;

  // State variables
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<any | null>(null);
  const [showEnhancedFeatures, setShowEnhancedFeatures] = useState(false);
  const [showSensoryProfiles, setShowSensoryProfiles] = useState(false);
  const [showAlchemicalProperties, setShowAlchemicalProperties] = useState(false);
  const [showFlavorCompatibility, setShowFlavorCompatibility] = useState(false);
  const [selectedIngredientForComparison, setSelectedIngredientForComparison] = useState<IngredientRecommendation | null>(null);
  const [comparisonIngredients, setComparisonIngredients] = useState<IngredientRecommendation[]>([]);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [foodRecommendations, setFoodRecommendations] = useState<EnhancedIngredientRecommendation[]>([]);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(null);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, any>>({});
  const [currentZodiac, setCurrentZodiac] = useState<string | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean>(true);
  
  // Herb names, oil types, and vinegar types
  const [herbNames, setHerbNames] = useState<string[]>([]);
  const [oilTypes, setOilTypes] = useState<string[]>([]);
  const [vinegarTypes, setVinegarTypes] = useState<string[]>([]);

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
  }, [isComponentLoading]);

  // Load astrological data and chakra energies when services are available
  useEffect(() => {
    if (servicesLoading || !astrologyService || !chakraService) {
      return;
    }

    const loadAstrologicalData = async () => {
      try {
        // Get planetary positions
        // Apply Pattern GG-6: Enhanced property access with type guards
        const astrologyServiceData = astrologyService as Record<string, unknown>;
        if (typeof astrologyServiceData?.getCurrentPlanetaryPositions === 'function') {
          const positions = await astrologyServiceData.getCurrentPlanetaryPositions();
          setPlanetaryPositions(positions);
        }
        
        // Get daytime status
        if (typeof astrologyServiceData?.isDaytime === 'function') {
          const daytime = await astrologyServiceData.isDaytime();
          setIsDaytime(daytime);
        }
        
        // Get current zodiac
        if (typeof astrologyServiceData?.getChartData === 'function') {
          const chartData = await astrologyServiceData.getChartData();
          const chartDataObj = chartData as Record<string, unknown>;
          const sunData = chartDataObj?.Sun as Record<string, unknown>;
          if (sunData?.sign) {
            setCurrentZodiac(sunData.sign as string);
          }
        }
        
        // Get chakra energies
        const chakraServiceData = chakraService as Record<string, unknown>;
        if (typeof chakraServiceData?.getChakraEnergies === 'function') {
          const energies = await chakraServiceData.getChakraEnergies();
          setChakraEnergies(energies as ChakraEnergies);
        }
      } catch (err) {
        console.error('Error loading astrological data:', err);
      }
    };
    
    loadAstrologicalData();
  }, [servicesLoading, astrologyService, chakraService]);

  // Load ingredient data when services are available
  useEffect(() => {
    if (servicesLoading || !ingredientService) {
      return;
    }

    const loadIngredientData = async () => {
      try {
        // Get herbs collection
        // Apply Pattern GG-6: Enhanced property access with type guards
        const ingredientServiceData = ingredientService as Record<string, unknown>;
        if (typeof ingredientServiceData?.getAllIngredientsByCategory === 'function') {
          const herbs = await ingredientServiceData.getAllIngredientsByCategory('herbs');
          const herbsArray = Array.isArray(herbs) ? herbs : [];
          setHerbNames(herbsArray.map((herb: unknown) => {
            const herbData = herb as Record<string, unknown>;
            return typeof herbData?.name === 'string' ? herbData.name : '';
          }));
          
          // Get oils collection
          const oils = await ingredientServiceData.getAllIngredientsByCategory('oils');
          const oilsArray = Array.isArray(oils) ? oils : [];
          setOilTypes(oilsArray.map((oil: unknown) => {
            const oilData = oil as Record<string, unknown>;
            return typeof oilData?.name === 'string' ? oilData.name : '';
          }));
          
          // Get vinegars collection
          const vinegars = await ingredientServiceData.getAllIngredientsByCategory('vinegars');
          const vinegarsArray = Array.isArray(vinegars) ? vinegars : [];
          setVinegarTypes(vinegarsArray.map((vinegar: unknown) => {
            const vinegarData = vinegar as Record<string, unknown>;
            return typeof vinegarData?.name === 'string' ? vinegarData.name : '';
          }));
        }
      } catch (err) {
        console.error('Error loading ingredient data:', err);
      }
    };
    
    loadIngredientData();
  }, [servicesLoading, ingredientService]);

  // Load ingredient recommendations when services and data are available
  useEffect(() => {
    if (
      servicesLoading || 
      !recommendationService || 
      !planetaryPositions || 
      Object.keys(planetaryPositions || {}).length === 0 ||
      !chakraEnergies
    ) {
      return;
    }

    const loadRecommendations = async () => {
      try {
        // Get ingredient recommendations based on astrological data
        const recommendationServiceData = recommendationService as Record<string, unknown>;
        if (typeof recommendationServiceData?.getIngredientRecommendations === 'function') {
          // Apply Pattern GG-6: Enhanced property access with type guards
          const elementalCalculatorData = elementalCalculator as Record<string, unknown>;
          let elementalProperties = null;
          
          if (typeof elementalCalculatorData?.calculateElementalProperties === 'function') {
            elementalProperties = await elementalCalculatorData.calculateElementalProperties(
              planetaryPositions,
              isDaytime
            );
          }
          
          const recommendations = await recommendationServiceData.getIngredientRecommendations({
            elementalProperties: elementalProperties,
          chakraEnergies: chakraEnergies,
          limit: 300
          });
          
          setFoodRecommendations(recommendations as EnhancedIngredientRecommendation[]);
        }
        setIsComponentLoading(false);
      } catch (err) {
        console.error('Error loading ingredient recommendations:', err);
        setIsComponentLoading(false);
      }
    };
    
    loadRecommendations();
  }, [
    servicesLoading,
    recommendationService,
    elementalCalculator,
    planetaryPositions,
    chakraEnergies,
    isDaytime
  ]);

  // Helper function to check if an ingredient is an oil
  const isOil = (ingredient: IngredientRecommendation): boolean => {
    if (!ingredient.name) return false;
    
    const name = ingredient.name?.toLowerCase();
    return (oilTypes || []).some(oil => name.includes(oil?.toLowerCase() || '')) ||
      name.includes('oil') || 
      name.includes('fat') || 
      name.includes('butter') || 
      name.includes('ghee') || 
      name.includes('lard') ||
      name.includes('shortening');
  };

  // Helper function to check if an ingredient is a vinegar
  const isVinegar = (ingredient: IngredientRecommendation): boolean => {
    if (!ingredient.name) return false;
    
    const name = ingredient.name?.toLowerCase();
    return (vinegarTypes || []).some(vinegar => name.includes(vinegar?.toLowerCase() || '')) ||
      name.includes('vinegar') || 
      name.includes('acid') || 
      name.includes('lemon juice') || 
      name.includes('lime juice') ||
      name.includes('citrus juice');
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
        const category = determineCategory(name);
        
        if (categories[category]) {
          categories[category].push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
      });
    }
    
    // Sort each category by match score
    Object.keys(categories || {}).forEach(category => {
      categories[category].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    });
    
    return categories;
  }, [foodRecommendations, isComponentLoading]);

  // Helper function to determine the category of a food by name
  function determineCategory(name: string): string {
    const lowercaseName = name?.toLowerCase();
    
    // Proteins
    if (
      lowercaseName.includes('beef') || lowercaseName.includes('chicken') || 
      lowercaseName.includes('pork') || lowercaseName.includes('lamb') || 
      lowercaseName.includes('fish') || lowercaseName.includes('seafood') ||
      lowercaseName.includes('tofu') || lowercaseName.includes('tempeh') ||
      lowercaseName.includes('seitan') || lowercaseName.includes('protein')
    ) {
      return 'proteins';
    }
    
    // Herbs
    if (
      lowercaseName.includes('basil') || lowercaseName.includes('oregano') || 
      lowercaseName.includes('thyme') || lowercaseName.includes('rosemary') || 
      lowercaseName.includes('mint') || lowercaseName.includes('cilantro') ||
      lowercaseName.includes('sage') || lowercaseName.includes('herb')
    ) {
      return 'herbs';
    }
    
    // Spices (check for spice peppers but exclude vegetable peppers)
    if (
      (lowercaseName.includes('pepper') && 
       !lowercaseName.includes('bell pepper') && 
       !lowercaseName.includes('sweet pepper') && 
       !lowercaseName.includes('jalapeno') && 
       !lowercaseName.includes('poblano') && 
       !lowercaseName.includes('anaheim') && 
       !lowercaseName.includes('banana pepper') && 
       !lowercaseName.includes('chili pepper')) || 
      lowercaseName.includes('cinnamon') || 
      lowercaseName.includes('nutmeg') || 
      lowercaseName.includes('cumin') || 
      lowercaseName.includes('turmeric') || 
      lowercaseName.includes('cardamom') ||
      lowercaseName.includes('spice') || 
      lowercaseName.includes('seasoning')
    ) {
      return 'spices';
    }
    
    // Vegetable Peppers
    if (
      lowercaseName.includes('bell pepper') || 
      lowercaseName.includes('sweet pepper') || 
      lowercaseName.includes('jalapeno')
    ) {
      return 'vegetables';
    }
    
    // Grains
    if (
      lowercaseName.includes('rice') || lowercaseName.includes('pasta') || 
      lowercaseName.includes('bread') || lowercaseName.includes('quinoa')
    ) {
      return 'grains';
    }
    
    // Fruits
    if (
      lowercaseName.includes('apple') || lowercaseName.includes('orange') || 
      lowercaseName.includes('banana') || lowercaseName.includes('berry')
    ) {
      return 'fruits';
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

  // Helper function to get element icon
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
  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Show loading state
  if (servicesLoading || isComponentLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mx-auto mb-4"></div>
        <div className="animate-pulse h-32 bg-gray-100 rounded w-full mx-auto"></div>
      </div>
    );
  }

  // Show error state
  if (servicesError) {
    return (
      <div className="p-6 text-center text-red-500">
        <p className="font-medium">Error loading recommendations</p>
        <p className="text-sm mt-1">{servicesError.message}</p>
      </div>
    );
  }

  // Show timeout message
  if (loadingTimedOut) {
    return (
      <div className="p-6 text-center text-amber-600">
        <p className="font-medium">Recommendations are taking longer than expected</p>
        <p className="text-sm mt-1">Please try refreshing the page or check back later.</p>
      </div>
    );
  }

  // Simplified rendering of the component (for brevity)
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Ingredient Recommendations</h2>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(CATEGORY_DISPLAY_NAMES || {}).map(category => (
          <button
            key={category}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {CATEGORY_DISPLAY_NAMES[category]}
          </button>
        ))}
      </div>
      
      {/* Active category recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{CATEGORY_DISPLAY_NAMES[activeCategory]}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combinedCategorizedRecommendations[activeCategory]?.slice(0, CATEGORY_DISPLAY_COUNTS[activeCategory] || 6).map((item, index) => (
            <div 
              key={`${item.name}-${index}`}
              className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={(e) => handleIngredientSelect(item, e)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getMatchScoreClass(item.matchScore)}`}>
                  {formatMatchScore(item.matchScore)}
                </span>
              </div>
              
              {item.elementalState && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(item.elementalState)
                    .filter(([_, value]) => {
                      // Pattern KK-10: Final Arithmetic Elimination for filtering operations
                      const numericValue = Number(value) || 0;
                      return numericValue > 0.1;
                    })
                    .sort(([_, a], [__, b]) => {
                      // Pattern KK-10: Final Arithmetic Elimination for sort operations
                      const numericA = Number(a) || 0;
                      const numericB = Number(b) || 0;
                      return numericB - numericA;
                    })
                    .map(([element, value]) => (
                      <span 
                        key={element} 
                        className="flex items-center text-xs bg-gray-50 px-1.5 py-0.5 rounded"
                      >
                        {getElementIcon(element as Element)}
                        {Math.round((Number(value) || 0) * 100)}%
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(IngredientRecommenderMigrated); 
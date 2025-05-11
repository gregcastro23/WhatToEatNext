import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState, useMemo } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations, IngredientRecommendation } from '@/utils/ingredientRecommender';
import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { normalizeChakraKey } from '@/constants/chakraSymbols';
import { allIngredients, herbsCollection, oilsCollection, vinegarsCollection, grainsCollection } from '@/data/ingredients';

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
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  proteins: 'Proteins',
  vegetables: 'Vegetables',
  grains: 'Grains & Starches',
  fruits: 'Fruits',
  herbs: 'Herbs & Aromatics',
  spices: 'Spices & Seasonings',
  oils: 'Oils & Fats',
  vinegars: 'Vinegars & Acidifiers',
  dairy: 'Dairy',
  others: 'Other Ingredients'
};

// Define category display counts - increased to show more ingredients
const CATEGORY_DISPLAY_COUNTS: Record<string, number> = {
  proteins: 24,
  vegetables: 24,
  grains: 16,
  fruits: 16,
  herbs: 20,
  spices: 20,
  oils: 12,
  vinegars: 12,
  dairy: 12,
  others: 12
};

// Using inline styles to avoid CSS module conflicts
export default function IngredientRecommender() {
  // Use the context to get astrological data including chakra energies
  const { chakraEnergies: contextChakraEnergies, planetaryPositions, isLoading: astroLoading, error: astroError, currentZodiac } = useAstrologicalState();
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  // States for selected item and expansion
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  const [showAll, setShowAll] = useState<boolean>(false);
  
  // Use the custom hook for food recommendations
  const { 
    recommendations: foodRecommendations, 
    chakraEnergies,
    loading: foodLoading, 
    error: foodError,
    refreshRecommendations
  } = useChakraInfluencedFood({ limit: 500 }); // Increased from 300 to 500 to ensure all categories have plenty of items
  
  // Helper function to get element icon with inline styles
  const getElementIcon = (element: string) => {
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
  
  // Toggle show all ingredients
  const toggleShowAll = () => {
    setShowAll(prev => !prev);
  };
  
  // Reset selected ingredient when recommendations change
  useEffect(() => {
    setSelectedIngredient(null);
  }, [astroRecommendations, foodRecommendations]);
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  useEffect(() => {
    if (!astroLoading && !astroError) {
      // Create a combined approach using both chakra and standard recommendations
      const chakraRecommendations = contextChakraEnergies ? getChakraBasedRecommendations(contextChakraEnergies, 24) : {};
      
      // Get elemental properties from planetary positions
      let elementalProps: ElementalProperties | undefined;
      if (planetaryPositions) {
        const calculator = new ElementalCalculator();
        elementalProps = calculator.calculateElementalState(planetaryPositions);
      }
      
      // Create an object with astrological state data
      const astroState = {
        elementalProperties: elementalProps || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        timestamp: new Date(),
        currentStability: 1.0,
        planetaryAlignment: planetaryPositions || {},
        dominantElement: elementalProps ? 
          Object.entries(elementalProps).sort((a, b) => b[1] - a[1])[0][0] : 'Fire',
        zodiacSign: currentZodiac || 'aries',
        activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
      };
      
      // Get standard recommendations with all planets and increased limit
      const standardRecommendations = getIngredientRecommendations(astroState, { limit: 80 });
      
      // Merge the recommendations, prioritizing chakra-based ones
      const mergedRecommendations: GroupedIngredientRecommendations = {};
      
      // Process all categories
      const allCategories = new Set([
        ...Object.keys(chakraRecommendations),
        ...Object.keys(standardRecommendations)
      ]);
      
      allCategories.forEach(category => {
        const chakraItems = chakraRecommendations[category] || [];
        const standardItems = standardRecommendations[category] || [];
        
        // Create a unique set of items using name as the key
        const uniqueItems = new Map();
        
        // Add chakra items first (higher priority)
        chakraItems.forEach(item => {
          uniqueItems.set(item.name, item);
        });
        
        // Add standard items that aren't already included
        standardItems.forEach(item => {
          if (!uniqueItems.has(item.name)) {
            uniqueItems.set(item.name, item);
          }
        });
        
        // Convert back to array - increased limit to show more ingredients
        const categoryDisplayCount = CATEGORY_DISPLAY_COUNTS[category] || 24;
        mergedRecommendations[category] = Array.from(uniqueItems.values()).slice(0, showAll ? 100 : categoryDisplayCount);
      });
      
      setAstroRecommendations(mergedRecommendations);
    }
  }, [astroLoading, contextChakraEnergies, planetaryPositions, astroError, currentZodiac, showAll]);
  
  // Render loading state if needed
  if (astroLoading || foodLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-800 dark:text-indigo-300">Loading celestial influences...</p>
        </div>
      </div>
    );
  }
  
  if (astroError || foodError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
        <p className="font-medium">Error: {astroError || foodError}</p>
      </div>
    );
  }
  
  // Display the recommendations
  return (
    <div className="mt-6 w-full max-w-none">
      <div className="bg-gradient-to-r from-indigo-800/10 via-purple-800/10 to-indigo-800/10 p-4 rounded-xl backdrop-blur-sm border border-indigo-100 dark:border-indigo-950 mb-6">
        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">Celestial Ingredient Recommendations</h2>
        <p className="text-indigo-700 dark:text-indigo-400 text-sm">
          Ingredients aligned with your current celestial influences for optimal alchemical harmony.
        </p>
        <p className="text-indigo-600 dark:text-indigo-500 text-xs mt-1 italic">
          Click on any ingredient card to view detailed information.
        </p>
        
        {/* Toggle to show all ingredients */}
        <div className="flex justify-end mt-2">
          <button 
            onClick={toggleShowAll}
            className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
          >
            {showAll ? "Show Recommended Only" : "Show All Ingredients"}
          </button>
        </div>
        
        {/* Category navigation links */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg shadow-sm">
          {Object.entries(CATEGORY_DISPLAY_NAMES).map(([category, displayName]) => {
            const hasItems = astroRecommendations[category]?.length > 0;
            const isActive = category === activeCategory;
            
            // Define icons for each category
            let icon;
            if (category === 'proteins') icon = <Tag className="mr-1 text-rose-500" size={14} />;
            else if (category === 'vegetables') icon = <Leaf className="mr-1 text-emerald-500" size={14} />;
            else if (category === 'grains') icon = <Wind className="mr-1 text-amber-500" size={14} />;
            else if (category === 'herbs') icon = <Leaf className="mr-1 text-green-500" size={14} />;
            else if (category === 'spices') icon = <Flame className="mr-1 text-orange-500" size={14} />;
            else if (category === 'fruits') icon = <Droplets className="mr-1 text-cyan-500" size={14} />;
            else if (category === 'oils') icon = <Droplets className="mr-1 text-yellow-500" size={14} />;
            else if (category === 'vinegars') icon = <Beaker className="mr-1 text-purple-500" size={14} />;
            else if (category === 'dairy') icon = <Droplets className="mr-1 text-blue-300" size={14} />;
            else icon = <Info className="mr-1 text-gray-500" size={14} />;
            
            if (!hasItems && !showAll) return null;
            
            return (
              <a 
                key={`nav-${category}`}
                href={`#${category}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(category);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setActiveCategory(category);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-sm transition-colors duration-200 ${
                  isActive 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300'
                }`}
              >
                {icon}
                {displayName}
              </a>
            );
          })}
        </div>
      </div>
      
      {/* Categories */}
      <div className="space-y-8">
        {Object.entries(CATEGORY_DISPLAY_NAMES).map(([category, displayName]) => {
          const items = astroRecommendations[category] || [];
          const isExpanded = expanded[category] || false;
          const displayCount = isExpanded ? items.length : Math.min(items.length, 6);
          
          // Skip empty categories if not showing all
          if (items.length === 0 && !showAll) return null;
          
          return (
            <div key={category} id={category} className="scroll-mt-20">
              <div 
                className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-100 dark:border-indigo-900"
                onClick={(e) => toggleCategoryExpansion(category, e)}
              >
                <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 flex items-center">
                  {displayName}
                  <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400 font-normal">
                    ({items.length} items)
                  </span>
                </h3>
                <button className="p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              
              {items.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.slice(0, displayCount).map((item, index) => (
                      <div 
                        key={`${category}-${item.name}-${index}`}
                        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col h-full"
                        onClick={(e) => handleIngredientSelect(item, e)}
                      >
                        {/* Elemental indicator */}
                        <div 
                          className="absolute top-0 right-0 w-2 h-full rounded-tr-lg rounded-br-lg" 
                          style={{ 
                            background: item.elementalProperties.Fire > 0.4 ? '#ff6b6b' :
                                      item.elementalProperties.Water > 0.4 ? '#6bb5ff' :
                                      item.elementalProperties.Earth > 0.4 ? '#6bff8e' :
                                      '#d9b3ff'
                          }}
                        ></div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                        
                        {item.matchScore !== undefined && (
                          <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                            Match: {Math.round(item.matchScore * 100)}%
                          </div>
                        )}
                        
                        {/* Show category only if different from main category */}
                        {item.category && item.category.toLowerCase() !== category.toLowerCase() && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                            {item.category}
                          </div>
                        )}
                        
                        {/* Elemental properties */}
                        <div className="mt-2 flex space-x-2">
                          {Object.entries(item.elementalProperties).map(([element, value]) => (
                            <div key={element} className="flex items-center">
                              {getElementIcon(element)}
                              <span className="text-xs">{Math.round(value * 100)}%</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Cooking methods */}
                        {item.recommendedCookingMethods && item.recommendedCookingMethods.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cooking methods:</div>
                            <div className="flex flex-wrap gap-1">
                              {item.recommendedCookingMethods.slice(0, 3).map((method, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded"
                                >
                                  {typeof method === 'string' ? method : method.name}
                                </span>
                              ))}
                              {item.recommendedCookingMethods.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">+{item.recommendedCookingMethods.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Show more/less button if needed */}
                  {items.length > 6 && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryExpansion(category, e);
                        }}
                        className="px-4 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        {isExpanded ? 'Show Less' : `Show All ${items.length} Items`}
                      </button>
                    </div>
                  )}
                </>
              ) : showAll ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading more {category}...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    No {category} recommended for current celestial alignments
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Selected ingredient modal */}
      {selectedIngredient && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedIngredient(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedIngredient.name}</h3>
              <button 
                onClick={() => setSelectedIngredient(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {/* Render selected ingredient details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                  <p>{selectedIngredient.category}{selectedIngredient.subCategory ? ` (${selectedIngredient.subCategory})` : ''}</p>
                </div>
                
                {selectedIngredient.origin && selectedIngredient.origin.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</span>
                    <p>{selectedIngredient.origin.join(', ')}</p>
                  </div>
                )}
                
                {selectedIngredient.modality && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Modality</span>
                    <p>{selectedIngredient.modality}</p>
                  </div>
                )}
                
                {selectedIngredient.matchScore !== undefined && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</span>
                    <p>{Math.round(selectedIngredient.matchScore * 100)}%</p>
                  </div>
                )}
              </div>
              
              {/* Elemental Properties */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Elemental Properties</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(selectedIngredient.elementalProperties).map(([element, value]) => (
                    <div key={element} className="flex flex-col items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ 
                          background: element === 'Fire' ? '#ff6b6b' :
                                    element === 'Water' ? '#6bb5ff' :
                                    element === 'Earth' ? '#6bff8e' :
                                    '#d9b3ff'
                        }}
                      >
                        {element.charAt(0)}
                      </div>
                      <div className="mt-1 text-center">
                        <div className="text-sm font-medium">{element}</div>
                        <div className="text-sm">{Math.round(value * 100)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Thermodynamic Properties */}
              {selectedIngredient.thermodynamicProperties && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Thermodynamic Properties</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(selectedIngredient.thermodynamicProperties).map(([property, value]) => (
                      <div key={property} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
                        <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 capitalize">{property}</div>
                        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">{value.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommended Cooking Methods */}
              {selectedIngredient.recommendedCookingMethods && selectedIngredient.recommendedCookingMethods.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Recommended Cooking Methods</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredient.recommendedCookingMethods.map((method, idx) => (
                      <div 
                        key={idx} 
                        className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-300"
                      >
                        {typeof method === 'string' ? method : method.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sensory Profile */}
              {selectedIngredient.sensoryProfile && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Sensory Profile</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedIngredient.sensoryProfile).map(([category, traits]) => (
                      <div key={category}>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 capitalize mb-2">{category}</h5>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(traits).map(([trait, value]) => (
                            <div 
                              key={trait} 
                              className="px-3 py-1 rounded-full text-sm"
                              style={{
                                backgroundColor: `rgba(79, 70, 229, ${Math.max(0.1, value as number / 10)})`,
                                color: (value as number) > 0.5 ? 'white' : '#4f46e5'
                              }}
                            >
                              {trait} {typeof value === 'number' ? `(${value.toFixed(1)})` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pairing Recommendations */}
              {selectedIngredient.pairingRecommendations && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Pairing Recommendations</h4>
                  
                  {selectedIngredient.pairingRecommendations.complementary && selectedIngredient.pairingRecommendations.complementary.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Complementary</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredient.pairingRecommendations.complementary.map((item) => (
                          <div key={item} className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-green-700 dark:text-green-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedIngredient.pairingRecommendations.contrasting && selectedIngredient.pairingRecommendations.contrasting.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Interesting Contrasts</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredient.pairingRecommendations.contrasting.map((item) => (
                          <div key={item} className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-amber-700 dark:text-amber-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedIngredient.pairingRecommendations.toAvoid && selectedIngredient.pairingRecommendations.toAvoid.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Avoid Combining With</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredient.pairingRecommendations.toAvoid.map((item) => (
                          <div key={item} className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-red-700 dark:text-red-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Culinary Applications */}
              {selectedIngredient.culinaryApplications && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Culinary Applications</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedIngredient.culinaryApplications).map(([method, details]) => (
                      <div key={method} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded">
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">{method}</h5>
                        
                        {details.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                            {Array.isArray(details.notes) ? details.notes.join(', ') : details.notes}
                          </p>
                        )}
                        
                        {details.dishes && details.dishes.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Example Dishes:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {details.dishes.map((dish) => (
                                <span key={dish} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded">
                                  {dish}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

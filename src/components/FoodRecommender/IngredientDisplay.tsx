'use client';

import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations } from '@/utils/ingredientRecommender';
import { Flame, Droplets, Mountain, Wind, Tag, Clock } from 'lucide-react';

export default function IngredientDisplay() {
  // Use the context to get astrological data including chakra energies
  const { chakraEnergies, planetaryPositions, isLoading, error, currentZodiac } = useAstrologicalState();
  const [recommendations, setRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  useEffect(() => {
    if (!isLoading && !error) {
      // Create a combined approach using both chakra and standard recommendations
      const chakraRecommendations = chakraEnergies ? getChakraBasedRecommendations(chakraEnergies, 16) : {};
      
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
      
      // Get standard recommendations with all planets
      const standardRecommendations = getIngredientRecommendations(astroState, { limit: 40 });
      
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
        
        // Convert back to array and limit to prevent overwhelming the user
        mergedRecommendations[category] = Array.from(uniqueItems.values()).slice(0, 32);
      });
      
      setRecommendations(mergedRecommendations);
    }
  }, [isLoading, chakraEnergies, planetaryPositions, error, currentZodiac]);
  
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
  
  // Render loading state if needed
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-800 dark:text-indigo-300">Loading celestial influences...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
        <p className="font-medium">Error: {error}</p>
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
        
        {/* Category navigation links */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg shadow-sm">
          {Object.entries(recommendations).map(([category]) => {
            const displayName = category.charAt(0).toUpperCase() + category.slice(1);
            const isActive = category === activeCategory;
            
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
                {displayName}
              </a>
            );
          })}
        </div>
      </div>
      
      {Object.keys(recommendations).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(recommendations).map(([category, items]) => (
            <div id={category} key={category} className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 scroll-mt-16">
              <h3 className="text-lg font-semibold capitalize mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                {category}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                {items?.map((item) => {
                  // Get element color class
                  const elementalProps = item.elementalProperties || {
                    Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
                  };
                  
                  // Find dominant element
                  const dominantElement = Object.entries(elementalProps)
                    .sort((a, b) => b[1] - a[1])[0][0];
                  
                  const elementColor = {
                    'Fire': 'border-red-400 bg-red-50/70 dark:bg-red-900/30',
                    'Water': 'border-blue-400 bg-blue-50/70 dark:bg-blue-900/30',
                    'Earth': 'border-green-400 bg-green-50/70 dark:bg-green-900/30',
                    'Air': 'border-purple-400 bg-purple-50/70 dark:bg-purple-900/30'
                  }[dominantElement] || 'border-gray-400 bg-gray-50/70 dark:bg-gray-900/30';
                  
                  // Find sensory properties if available
                  const seasonality = item.seasonality || ['Spring', 'Summer', 'Fall', 'Winter'][Math.floor(Math.random() * 4)];
                  const qualities = item.qualities || [];
                  
                  // Ensure matchScore is a valid number
                  const safeMatchScore = typeof item.matchScore === 'number' && !isNaN(item.matchScore) 
                    ? item.matchScore 
                    : 0.5;
                  
                  const matchPercentage = Math.round(safeMatchScore * 100);
                  
                  let matchScoreClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                  
                  if (matchPercentage >= 90) {
                    matchScoreClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold";
                  } else if (matchPercentage >= 80) {
                    matchScoreClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
                  } else if (matchPercentage >= 70) {
                    matchScoreClass = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
                  } else if (matchPercentage >= 60) {
                    matchScoreClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
                  } else if (matchPercentage >= 50) {
                    matchScoreClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
                  }
                  
                  return (
                    <div 
                      key={item.name} 
                      className={`p-3 rounded-lg border-l-4 ${elementColor} hover:shadow-md transition-all flex flex-col h-full`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.name}</h4>
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-sm ${matchScoreClass}`}>
                          {matchPercentage}%
                        </span>
                      </div>
                      
                      {/* Quick info row */}
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1 gap-2">
                        {item.category && (
                          <span className="flex items-center">
                            <Tag size={10} className="mr-0.5" />
                            {item.category.split(' ')[0]}
                          </span>
                        )}
                        
                        {seasonality && (
                          <span className="flex items-center">
                            <Clock size={10} className="mr-0.5" />
                            {seasonality}
                          </span>
                        )}
                      </div>
                      
                      {/* Elemental properties */}
                      <div className="mt-2 pt-1 space-y-1">
                        {Object.entries(elementalProps).map(([element, value]) => (
                          <div key={element} className="flex items-center text-xs">
                            {getElementIcon(element)}
                            <div className="flex-grow ml-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${value * 100}%`,
                                  backgroundColor: 
                                    element === 'Fire' ? '#ff6b6b' : 
                                    element === 'Water' ? '#6bb5ff' :
                                    element === 'Earth' ? '#6bff8e' :
                                    '#d9b3ff' // Air
                                }}
                              ></div>
                            </div>
                            <span className="ml-1 w-7 text-right text-gray-600 dark:text-gray-400">{Math.round(value * 100)}%</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Qualities tags if space allows */}
                      {qualities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {qualities.slice(0, 2).map(quality => (
                            <span key={quality} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-[10px]">
                              {quality}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">No recommendations available. Try refreshing your astrological data.</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button 
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all"
          onClick={() => window.location.reload()}
        >
          Refresh Celestial Recommendations
        </button>
      </div>
    </div>
  );
} 
import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations } from '@/utils/ingredientRecommender';
import styles from './IngredientRecommendations.module.css';
import { Flame, Droplets, Mountain, Wind } from 'lucide-react';

export default function IngredientRecommender() {
  // Use the context to get astrological data including chakra energies
  const { chakraEnergies, planetaryPositions, isLoading, error, currentZodiac } = useAstrologicalState();
  const [recommendations, setRecommendations] = useState<GroupedIngredientRecommendations>({});
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  useEffect(() => {
    if (!isLoading && !error) {
      // Create a combined approach using both chakra and standard recommendations
      const chakraRecommendations = chakraEnergies ? getChakraBasedRecommendations(chakraEnergies, 16) : {};
      
      // Get elemental properties from planetary positions
      let elementalProps: ElementalProperties | undefined;
      if (planetaryPositions) {
        const calculator = new ElementalCalculator();
        elementalProps = calculator.calculateElementalProperties(planetaryPositions);
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
  
  // Helper function to get element icon
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className={styles.tagIcon} style={{ color: '#ff6b6b' }} size={16} />;
      case 'Water': return <Droplets className={styles.tagIcon} style={{ color: '#6bb5ff' }} size={16} />;
      case 'Earth': return <Mountain className={styles.tagIcon} style={{ color: '#6bff8e' }} size={16} />;
      case 'Air': return <Wind className={styles.tagIcon} style={{ color: '#d9b3ff' }} size={16} />;
      default: return null;
    }
  };
  
  // Render loading state if needed
  if (isLoading) {
    return <div className="p-4">Loading celestial influences...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  // Display the recommendations
  return (
    <div className="mt-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Celestial Ingredient Recommendations</h2>
      
      {Object.keys(recommendations).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(recommendations).map(([category, items]) => (
            <div key={category} className="bg-opacity-10 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium capitalize mb-2">{category}</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {items?.map((item) => {
                  // Get element color class
                  const elementalProps = item.elementalProperties || {
                    Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
                  };
                  
                  // Find dominant element
                  const dominantElement = Object.entries(elementalProps)
                    .sort((a, b) => b[1] - a[1])[0][0];
                  
                  const elementColor = {
                    'Fire': 'border-red-500',
                    'Water': 'border-blue-500',
                    'Earth': 'border-green-500',
                    'Air': 'border-purple-500'
                  }[dominantElement] || 'border-gray-500';
                  
                  return (
                    <div 
                      key={item.name} 
                      className={`p-2 bg-opacity-5 bg-white rounded border-l-4 ${elementColor} hover:bg-opacity-10 transition-all flex flex-col h-full text-xs`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-xs truncate">{item.name}</h4>
                        {item.matchScore > 0.5 && (
                          <span className="ml-1 text-xs bg-green-900 bg-opacity-20 text-green-300 px-1 py-0.5 rounded">
                            {Math.round(item.matchScore * 100)}%
                          </span>
                        )}
                      </div>
                      
                      {/* Simple elemental bars */}
                      <div className="mt-1 space-y-1 flex-grow">
                        {Object.entries(elementalProps).map(([element, value]) => (
                          <div key={element} className="flex items-center text-xs">
                            <span className="w-4">{getElementIcon(element)}</span>
                            <div className="flex-grow bg-black bg-opacity-20 h-1 rounded-full overflow-hidden">
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
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No recommendations available. Try refreshing your astrological data.</p>
      )}
      
      <button 
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={() => window.location.reload()}
      >
        Refresh Recommendations
      </button>
    </div>
  );
} 
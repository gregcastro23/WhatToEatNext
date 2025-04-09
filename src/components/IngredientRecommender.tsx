import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations } from '@/utils/ingredientRecommender';

export default function IngredientRecommender() {
  // Use the context to get astrological data including chakra energies
  const { chakraEnergies, planetaryPositions, isLoading, error } = useAstrologicalState();
  const [recommendations, setRecommendations] = useState<GroupedIngredientRecommendations>({});
  
  // Use chakra energies to generate ingredient recommendations
  useEffect(() => {
    if (!isLoading && chakraEnergies && !error) {
      // Get chakra-based recommendations
      const chakraRecommendations = getChakraBasedRecommendations(chakraEnergies);
      setRecommendations(chakraRecommendations);
    }
  }, [isLoading, chakraEnergies, error]);
  
  // Render loading state if needed
  if (isLoading) {
    return <div>Loading celestial influences...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  if (!chakraEnergies) {
    return <div>No chakra data available</div>;
  }
  
  // Display the recommendations
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Celestial Ingredient Recommendations</h2>
      
      {Object.keys(recommendations).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(recommendations).map(([category, items]) => (
            <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium capitalize mb-2">{category}</h3>
              <ul className="space-y-2">
                {items?.map((item) => (
                  <li key={item.name} className="flex items-start">
                    <span className="font-medium">{item.name}</span>
                    {item.matchScore > 0.5 && (
                      <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Strong match
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No recommendations available. Try refreshing your astrological data.</p>
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
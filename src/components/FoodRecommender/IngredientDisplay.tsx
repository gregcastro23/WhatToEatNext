import React, { useEffect, useState } from 'react';
import { useAstrologicalState } from '../../contexts';

// Basic types for ingredients
interface Ingredient {
  name: string;
  category: string;
  element?: string;
  energyLevel?: number;
  score?: number;
}

// Display a list of ingredient recommendations based on astrological state
export default function IngredientDisplay() {
  const astroData = useAstrologicalState();
  const elementalProperties = (astroData as unknown)?.elementalProperties || (astroData as unknown)?.state?.elementalProperties;
  const planetaryPositions = (astroData as unknown)?.planetaryPositions || (astroData as unknown)?.positions;
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This simulates fetching ingredient recommendations
    const loadIngredients = async () => {
      try {
        setIsLoading(true);
        
        // Use real ingredient data from ConsolidatedIngredientService
        const { ConsolidatedIngredientService } = await import('@/services/ConsolidatedIngredientService');
        const ingredientService = ConsolidatedIngredientService.getInstance();
        
        // Get recommendations based on current astrological state
        if (elementalProperties) {
          const recommendations = ingredientService.getRecommendedIngredients(
            elementalProperties,
            { maxResults: 6, sortByScore: true }
          );
          
          // Convert to component interface
          const realIngredients: Ingredient[] = recommendations.map(ing => {
            // Determine dominant element from elemental properties
            const elemental = ing.elementalProperties || { Fire: 0, Water: 0, Earth: 1, Air: 0 };
            let dominantElement = 'Earth';
            let maxValue = elemental.Earth;
            
            if (elemental.Fire > maxValue) {
              dominantElement = 'Fire';
              maxValue = elemental.Fire;
            }
            if (elemental.Water > maxValue) {
              dominantElement = 'Water';
              maxValue = elemental.Water;
            }
            if (elemental.Air > maxValue) {
              dominantElement = 'Air';
            }
            
            return {
              name: ing.name,
              category: ing.category,
              element: dominantElement,
              energyLevel: ing.kalchm ? Math.min(1, ing.kalchm / 2) : 0.6,
              score: (ing as any).score || 0.8
            };
          });
          
          setIngredients(realIngredients);
        } else {
          // Fallback to getting all ingredients
          const allIngredients = ingredientService.getAllIngredientsFlat();
          const selectedIngredients = allIngredients.slice(0, 6).map(ing => ({
            name: ing.name,
            category: ing.category,
            element: 'Earth', // fallback
            energyLevel: 0.6,
            score: 0.8
          }));
          
          setIngredients(selectedIngredients);
        }
      } catch (error) {
        // console.error('Error loading ingredients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, [elementalProperties, planetaryPositions]); // Re-run when these change

  // Helper function to get element color
  const getElementColor = (element?: string) => {
    switch (element) {
      case 'fire': return 'text-red-600';
      case 'water': return 'text-blue-600';
      case 'earth': return 'text-green-600';
      case 'air': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="mt-4 text-blue-600">Loading ingredients...</p>
      </div>
    );
  }

  return (
    <div className="ingredient-display">
      <h3 className="text-xl font-semibold mb-4">Current Ingredient Recommendations</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ingredients.map((ingredient, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-lg">{ingredient.name}</h4>
              <span className={`text-sm font-semibold ${getElementColor(ingredient.element)}`}>
                {ingredient.element}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{ingredient.category}</p>
            
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Energy Level:</span>
                <span className="font-medium">{ingredient.energyLevel ? (ingredient.energyLevel * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${ingredient.energyLevel ? ingredient.energyLevel * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Compatibility:</span>
                <span className="font-medium">{ingredient.score ? (ingredient.score * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${ingredient.score ? ingredient.score * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { stateManager } from '@/utils/stateManager';
import { logger } from '@/utils/logger';
import { Heart, Clock, Users, ChefHat, Flame } from 'lucide-react';
import type { ScoredRecipe } from '@/types/recipe';

interface RecipeProps {
  recipe: ScoredRecipe;
  isExpanded?: boolean;
  onToggle?: () => void;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
}

interface Cuisine {
  name: string;
  description: string;
  dishes: {
    breakfast: { all: Dish[], summer?: Dish[], winter?: Dish[] },
    lunch: { all: Dish[], summer?: Dish[], winter?: Dish[] },
    dinner: { all: Dish[], summer?: Dish[], winter?: Dish[] },
    dessert?: { all: Dish[], summer?: Dish[], winter?: Dish[] }
  };
  elementalState: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
}

export default function Recipe({ recipe, isExpanded = false, onToggle }: RecipeProps) {
  // Either fix the useAlchemical hook or remove it if not needed
  // const { state, dispatch } = useAlchemical();
  
  // Temporary solution: Comment out or remove the hook usage
  const [isLoading, setIsLoading] = useState(false);
  const [servings, setServings] = useState(recipe.numberOfServings || 2);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Get the actual stateManager instance first
        const manager = await stateManager;
        const userState = await manager.getState();
        const favorites = userState.recipes.favorites || [];
        setIsFavorite(favorites.includes(recipe.id));
      } catch (error) {
        logger.error('Error getting favorites:', error);
      }
    };
    
    checkFavoriteStatus();
    
    if (isExpanded) {
      try {
        // Get the actual stateManager instance first
        (async () => {
          const manager = await stateManager;
          await manager.addToHistory('viewed', recipe.id);
        })();
      } catch (error) {
        logger.error('Error adding to history:', error);
      }
    }
  }, [isExpanded, recipe.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      setIsLoading(true);
      
      // Toggle local state immediately for better UX
      setIsFavorite(!isFavorite);
      
      // Get the actual stateManager instance first
      const manager = await stateManager;
      const userState = await manager.getState();
      const favorites = [...(userState.recipes.favorites || [])];
      
      const index = favorites.indexOf(recipe.id);
      if (index >= 0) {
        favorites.splice(index, 1);
      } else {
        favorites.push(recipe.id);
      }
      
      await manager.setState({
        recipes: {
          ...userState.recipes,
          favorites
        }
      });
    } catch (error) {
      // Revert UI state if operation failed
      setIsFavorite(isFavorite);
      logger.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustServings = (newServings: number) => {
    if (newServings < 1 || newServings > 12) return;
    setServings(newServings);
  };

  const calculateAdjustedAmount = (amount: number) => {
    const ratio = servings / (recipe.numberOfServings || 2);
    return (amount * ratio).toFixed(1).replace(/\.0$/, '');
  };

  const renderelementalState = () => {
    const elements = Object.entries(recipe.elementalProperties || {});
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {elements.map(([element, value]) => (
          <div 
            key={element}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
            title={`${element}: ${(value * 100).toFixed(0)}%`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 bg-${element.toLowerCase()}`} />
            <span className="text-sm font-medium">{element}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-opacity duration-300 ease-in-out opacity-100">
      <div 
        onClick={onToggle}
        className="cursor-pointer p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {recipe.name}
            </h3>
            <p className="text-gray-600 mt-1">{recipe.description}</p>
          </div>
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {recipe.timeToMake}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {recipe.numberOfServings} servings
          </div>
        </div>

        {renderelementalState()}
      </div>

      <div 
        className={`border-t overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            <label htmlFor="servings" className="mr-2 text-sm text-gray-600">
              Adjust servings:
            </label>
            <input
              type="number"
              id="servings"
              min="1"
              max="12"
              value={servings}
              onChange={(e) => adjustServings(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded"
            />
          </div>

          <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
          <ul className="space-y-2 mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-600">
                <div className="flex items-start">
                  <span className="font-medium mr-1">
                    {calculateAdjustedAmount(ingredient.amount)} {ingredient.unit}
                  </span>
                  <div>
                    <span className="font-medium">{ingredient.name}</span>
                    
                    {/* Display preparation method if available */}
                    {ingredient.preparation && (
                      <span className="ml-1 text-gray-500">({ingredient.preparation})</span>
                    )}
                    
                    {/* Display ingredient notes if available */}
                    {ingredient.notes && (
                      <p className="text-xs text-gray-500 mt-1">{ingredient.notes}</p>
                    )}
                    
                    {/* Display ingredient category if available */}
                    {ingredient.category && ingredient.category !== 'other' && (
                      <div className="mt-1">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {ingredient.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Display elemental properties if available */}
                    {ingredient.elementalProperties && (
                      <div className="mt-1 flex space-x-1">
                        {Object.entries(ingredient.elementalProperties)
                          .filter(([_, value]) => value > 0.2) // Only show significant elements
                          .sort(([_, a], [__, b]) => b - a) // Sort by value descending
                          .slice(0, 2) // Only show top 2 elements
                          .map(([element, value]) => (
                            <span 
                              key={element} 
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                element === 'Fire' ? 'bg-red-100 text-red-800' :
                                element === 'Water' ? 'bg-blue-100 text-blue-800' :
                                element === 'Earth' ? 'bg-green-100 text-green-800' :
                                element === 'Air' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {element}: {Math.round(value * 100)}%
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Show optional badge if ingredient is optional */}
                  {ingredient.optional && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-auto">
                      Optional
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ol className="space-y-2 list-decimal list-inside">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-gray-600">{step}</li>
            ))}
          </ol>

          {recipe.notes && (
            <>
              <h4 className="font-medium text-gray-900 mt-4 mb-2">Notes:</h4>
              <p className="text-gray-600">{recipe.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
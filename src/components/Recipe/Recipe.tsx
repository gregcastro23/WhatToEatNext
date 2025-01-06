'use client';

import React, { useState, useEffect } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { stateManager } from '@/utils/stateManager';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, Users, ChefHat, Flame } from 'lucide-react';
import type { ScoredRecipe } from '@/types/recipe';

interface RecipeProps {
  recipe: ScoredRecipe;
  isExpanded?: boolean;
  onToggle?: () => void;
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
  elementalBalance: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
}

export default function Recipe({ recipe, isExpanded = false, onToggle }: RecipeProps) {
  const { state, dispatch } = useAlchemical();
  const [isLoading, setIsLoading] = useState(false);
  const [servings, setServings] = useState(recipe.servings || 2);
  const isFavorite = state.favorites.includes(recipe.id);

  useEffect(() => {
    if (isExpanded) {
      stateManager.addToHistory('viewed', recipe.id);
    }
  }, [isExpanded, recipe.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      setIsLoading(true);
      
      dispatch({ type: 'TOGGLE_FAVORITE', payload: recipe.id });
      await stateManager.toggleFavorite(recipe.id);
      
      stateManager.addNotification(
        'success',
        `${recipe.name} ${isFavorite ? 'removed from' : 'added to'} favorites`
      );
    } catch (error) {
      logger.error('Error toggling favorite:', error);
      stateManager.addNotification('error', 'Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustServings = (newServings: number) => {
    if (newServings < 1 || newServings > 12) return;
    setServings(newServings);
  };

  const calculateAdjustedAmount = (amount: number) => {
    const ratio = servings / (recipe.servings || 2);
    return (amount * ratio).toFixed(1).replace(/\.0$/, '');
  };

  const renderElementalBalance = () => {
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
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
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
            {recipe.servings} servings
          </div>
          <div className="flex items-center">
            <ChefHat className="w-4 h-4 mr-1" />
            {recipe.difficulty || 'moderate'}
          </div>
          {recipe.spiciness && (
            <div className="flex items-center">
              <Flame className="w-4 h-4 mr-1" />
              {recipe.spiciness}
            </div>
          )}
        </div>

        {renderElementalBalance()}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
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
                    {calculateAdjustedAmount(ingredient.amount)} {ingredient.unit} {ingredient.name}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 
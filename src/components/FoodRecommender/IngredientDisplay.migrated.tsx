'use client';

import React, { useEffect, useState } from 'react';
import { useServices } from '@/hooks/useServices';

import { _Element , _ElementalProperties } from "@/types/alchemy";
import { _PlanetaryPosition } from "@/types/celestial";
// Basic types for ingredients
interface Ingredient {
  name: string;
  category: string;
  element?: string;
  energyLevel?: number;
  score?: number;
}

/**
 * IngredientDisplay Component - Migrated Version
 * 
 * Displays a list of ingredient recommendations based on astrological data.
 * Migrated from using context-based data access to service-based architecture.
 */
export default function IngredientDisplayMigrated() {
  // Replace context hooks with services
  const { 
    isLoading: servicesLoading, 
    error: servicesError, 
    astrologyService,
    ingredientService,
    recommendationService
  } = useServices();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if services aren't loaded yet
    if (servicesLoading || servicesError || !astrologyService || !recommendationService) {
      return;
    }

    // Load ingredient recommendations
    const loadIngredients = async () => {
      try {
        setIsLoading(true);
        
        // Get current planetary positions
        const planetaryPositions = await astrologyService.getCurrentPlanetaryPositions();
        
        // Get whether it's daytime
        const _isDaytime = await astrologyService.isDaytime();
        
        // Calculate elemental properties (simplified for now)
        const elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        
        // Get the dominant element (simplified)
        const dominantElement = 'Fire';
        
        // Get ingredient recommendations
        const recommendations = await recommendationService.getRecommendedIngredients({
          _elementalProperties,
          limit: 6 // Just get a few for display
        });
        
        // Transform to expected format
        const transformedIngredients = (recommendations?.items || []).map((item: Record<string, unknown>) => ({
          name: item.name,
          category: item.category || 'Uncategorized',
          element: item.elementalState ? 
            'Fire' : // Simplified for now
            dominantElement?.toLowerCase(),
          energyLevel: item.elementalState ? 
            (((item.elementalState as unknown)?.Fire || 0) + ((item.elementalState as unknown)?.Water || 0) + 
             ((item.elementalState as unknown)?.Earth || 0) + ((item.elementalState as unknown)?.Air || 0)) / 4 : 
            0.6,
          score: item.score || 0.7
        }));
        
        setIngredients(transformedIngredients as Ingredient[]);
      } catch (err) {
        // console.error('Error loading ingredients:', err);
        setError(err instanceof Error ? err : new Error('Error loading ingredients'));
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, [servicesLoading, servicesError, astrologyService, recommendationService]);

  // Helper function to get element color
  const getElementColor = (element?: string) => {
    switch (element) {
      case 'Fire': return 'text-red-600';
      case 'Water': return 'text-blue-600';
      case 'Earth': return 'text-green-600';
      case 'Air': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Show loading state
  if (servicesLoading || isLoading) {
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

  // Show error state
  if (servicesError || error) {
    return (
      <div className="p-4 text-center text-red-600 border border-red-200 rounded bg-red-50">
        <p>Error loading ingredients: {(servicesError || error)?.message}</p>
        <p className="text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  // Show empty state
  if (ingredients.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600 border border-gray-200 rounded bg-gray-50">
        <p>No ingredient recommendations available.</p>
        <p className="text-sm mt-2">Try adjusting your filters or try again later.</p>
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
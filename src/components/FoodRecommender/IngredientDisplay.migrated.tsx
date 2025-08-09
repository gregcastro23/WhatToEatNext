'use client';

import React, { useEffect, useState } from 'react';

import { useServices } from '@/hooks/useServices';
import { Element, ElementalProperties } from '@/types/alchemy';
import { PlanetaryPosition } from '@/types/celestial';
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
    recommendationService,
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
        const isDaytime = await astrologyService.isDaytime();

        // Calculate elemental properties (simplified for now)
        const elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

        // Get the dominant element (simplified)
        const dominantElement = 'Fire';

        // Get ingredient recommendations
        const recommendations = await recommendationService.getRecommendedIngredients({
          elementalProperties,
          limit: 6, // Just get a few for display
        });

        // Transform to expected format
        const transformedIngredients: Ingredient[] = (recommendations.items || []).map(
          (item: any) => ({
            name: item.name,
            category: item.category || 'Uncategorized',
            element: item.elementalState
              ? 'Fire' // Simplified for now
              : dominantElement.toLowerCase(),
            energyLevel: item.elementalState
              ? (item.elementalState.Fire +
                  item.elementalState.Water +
                  item.elementalState.Earth +
                  item.elementalState.Air) /
                4
              : 0.6,
            score: item.score || 0.7,
          }),
        );

        setIngredients(transformedIngredients);
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setError(err instanceof Error ? err : new Error('Error loading ingredients'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadIngredients();
  }, [servicesLoading, servicesError, astrologyService, recommendationService]);

  // Helper function to get element color
  const getElementColor = (element?: string) => {
    switch (element) {
      case 'Fire':
        return 'text-red-600';
      case 'Water':
        return 'text-blue-600';
      case 'Earth':
        return 'text-green-600';
      case 'Air':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Show loading state
  if (servicesLoading || isLoading) {
    return (
      <div className='p-4 text-center'>
        <div className='animate-pulse'>
          <div className='mx-auto mb-2 h-4 w-3/4 rounded bg-blue-200'></div>
          <div className='mx-auto h-4 w-1/2 rounded bg-blue-200'></div>
        </div>
        <p className='mt-4 text-blue-600'>Loading ingredients...</p>
      </div>
    );
  }

  // Show error state
  if (servicesError || error) {
    return (
      <div className='rounded border border-red-200 bg-red-50 p-4 text-center text-red-600'>
        <p>Error loading ingredients: {(servicesError || error)?.message}</p>
        <p className='mt-2 text-sm'>Please try refreshing the page.</p>
      </div>
    );
  }

  // Show empty state
  if (ingredients.length === 0) {
    return (
      <div className='rounded border border-gray-200 bg-gray-50 p-4 text-center text-gray-600'>
        <p>No ingredient recommendations available.</p>
        <p className='mt-2 text-sm'>Try adjusting your filters or try again later.</p>
      </div>
    );
  }

  return (
    <div className='ingredient-display'>
      <h3 className='mb-4 text-xl font-semibold'>Current Ingredient Recommendations</h3>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className='rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
          >
            <div className='flex items-start justify-between'>
              <h4 className='text-lg font-medium'>{ingredient.name}</h4>
              <span className={`text-sm font-semibold ${getElementColor(ingredient.element)}`}>
                {ingredient.element}
              </span>
            </div>

            <p className='mb-2 text-sm text-gray-600'>{ingredient.category}</p>

            <div className='mt-2'>
              <div className='mb-1 flex justify-between text-sm'>
                <span>Energy Level:</span>
                <span className='font-medium'>
                  {ingredient.energyLevel ? (ingredient.energyLevel * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-600'
                  style={{ width: `${ingredient.energyLevel ? ingredient.energyLevel * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className='mt-2'>
              <div className='mb-1 flex justify-between text-sm'>
                <span>Compatibility:</span>
                <span className='font-medium'>
                  {ingredient.score ? (ingredient.score * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-green-600'
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

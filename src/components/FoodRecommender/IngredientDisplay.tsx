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
  const elementalProperties =
    (astroData as any)?.elementalProperties || (astroData as any)?.state?.elementalProperties;
  const planetaryPositions =
    (astroData as any)?.planetaryPositions || (astroData as any)?.positions;
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This simulates fetching ingredient recommendations
    const loadIngredients = async () => {
      try {
        setIsLoading(true);

        // Simple mock data for display purposes
        const mockIngredients: Ingredient[] = [
          { name: 'Ginger', category: 'Herbs', element: 'Fire', energyLevel: 0.8, score: 0.9 },
          {
            name: 'Spinach',
            category: 'Vegetables',
            element: 'Earth',
            energyLevel: 0.6,
            score: 0.85,
          },
          { name: 'Salmon', category: 'Proteins', element: 'Water', energyLevel: 0.7, score: 0.8 },
          {
            name: 'Bell Pepper',
            category: 'Vegetables',
            element: 'Fire',
            energyLevel: 0.75,
            score: 0.78,
          },
          { name: 'Quinoa', category: 'Grains', element: 'Earth', energyLevel: 0.65, score: 0.77 },
          {
            name: 'Cucumber',
            category: 'Vegetables',
            element: 'Water',
            energyLevel: 0.5,
            score: 0.75,
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setIngredients(mockIngredients);
      } catch (error) {
        console.error('Error loading ingredients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadIngredients();
  }, [elementalProperties, planetaryPositions]); // Re-run when these change

  // Helper function to get element color
  const getElementColor = (element?: string) => {
    switch (element) {
      case 'fire':
        return 'text-red-600';
      case 'water':
        return 'text-blue-600';
      case 'earth':
        return 'text-green-600';
      case 'air':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
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

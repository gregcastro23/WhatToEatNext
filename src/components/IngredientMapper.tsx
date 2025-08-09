'use client';

import React, { useState } from 'react';

import { cuisinesMap } from '@/data/cuisines';
import { useIngredientMapping } from '@/hooks/useIngredientMapping';

/**
 * Component that demonstrates the universal ingredient mapping functionality
 */
export default function IngredientMapper() {
  const {
    isLoading,
    error,
    mapRecipeIngredients,
    findMatchingRecipes,
    suggestAlternatives,
    calculateCompatibility,
  } = useIngredientMapping();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [mappedRecipes, setMappedRecipes] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [compatibilityResult, setCompatibilityResult] = useState<unknown>(null);
  const [secondIngredient, setSecondIngredient] = useState('');

  // Find recipes with good ingredient mappings
  const handleFindRecipes = () => {
    const elementalTarget = {
      // Can be customized based on user preferences or context
      Fire: 0.3,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.2,
    };

    const results = findMatchingRecipes({
      elementalTarget,
      requiredIngredients: searchTerm ? [searchTerm] : undefined,
      cuisineType: selectedCuisine || undefined,
    });

    setMappedRecipes(results);
  };

  // Find alternative ingredients
  const handleFindAlternatives = () => {
    if (!selectedIngredient) return;
    const result = suggestAlternatives(selectedIngredient);
    setAlternatives(result.success ? result.suggestions : []);
  };

  // Calculate compatibility between two ingredients
  const handleCalculateCompatibility = () => {
    if (!selectedIngredient || !secondIngredient) return;
    const result = calculateCompatibility(selectedIngredient, secondIngredient);
    setCompatibilityResult(result);
  };

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Ingredient Mapping Explorer</h1>

      {error && <div className='mb-4 rounded bg-red-100 p-3 text-red-800'>Error: {error}</div>}

      {/* Recipe Search Section */}
      <div className='mb-8 rounded border p-4'>
        <h2 className='mb-2 text-xl font-semibold'>Find Recipes</h2>
        <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block'>Ingredient</label>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Enter ingredient (optional)'
              className='w-full rounded border p-2'
            />
          </div>
          <div>
            <label className='mb-1 block'>Cuisine</label>
            <select
              value={selectedCuisine}
              onChange={e => setSelectedCuisine(e.target.value)}
              className='w-full rounded border p-2'
            >
              <option value=''>All Cuisines</option>
              {Object.keys(cuisinesMap).map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleFindRecipes}
          disabled={isLoading}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300'
        >
          {isLoading ? 'Loading...' : 'Find Recipes'}
        </button>

        {/* Display Results */}
        {mappedRecipes.length > 0 && (
          <div className='mt-4'>
            <h3 className='mb-2 font-semibold'>Found {mappedRecipes.length} Recipes</h3>
            <div className='max-h-96 space-y-3 overflow-y-auto'>
              {mappedRecipes.map((result, index) => (
                <div key={index} className='rounded border p-3'>
                  <div className='font-medium'>{result.recipe.name}</div>
                  <div className='text-sm text-gray-600'>
                    {result.recipe.cuisine || 'Unknown Cuisine'}
                  </div>
                  <div className='text-sm'>
                    Match Quality: <span className='font-semibold'>{result.matchQuality}</span>
                  </div>
                  <div className='text-sm'>Score: {(result.score * 100).toFixed(0)}%</div>
                  <div className='mt-2'>
                    <div className='text-sm font-medium'>Mapped Ingredients:</div>
                    <div className='mt-1 grid grid-cols-2 gap-2'>
                      {result.matchedIngredients
                        .filter((ing: unknown) => {
                          // Apply surgical type casting with variable extraction
                          const ingData = ing as Record<string, unknown>;
                          return ingData.matchedTo;
                        })
                        .map((ing: unknown, i: number) => {
                          // Apply surgical type casting with variable extraction
                          const ingData = ing as Record<string, unknown>;
                          const name = String(ingData.name || '');
                          const confidence = Number(ingData.confidence) || 0;

                          return (
                            <div key={i} className='rounded bg-green-100 p-1 text-xs'>
                              {name} ({(confidence * 100).toFixed(0)}%)
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternative Ingredients Section */}
      <div className='mb-8 rounded border p-4'>
        <h2 className='mb-2 text-xl font-semibold'>Find Alternative Ingredients</h2>
        <div className='mb-4'>
          <label className='mb-1 block'>Ingredient</label>
          <input
            type='text'
            value={selectedIngredient}
            onChange={e => setSelectedIngredient(e.target.value)}
            placeholder='Enter ingredient name'
            className='w-full rounded border p-2'
          />
        </div>
        <button
          onClick={handleFindAlternatives}
          disabled={isLoading || !selectedIngredient}
          className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-green-300'
        >
          {isLoading ? 'Loading...' : 'Find Alternatives'}
        </button>

        {/* Display Results */}
        {alternatives.length > 0 && (
          <div className='mt-4'>
            <h3 className='mb-2 font-semibold'>Alternative Ingredients</h3>
            <div className='space-y-2'>
              {alternatives.map((alt, index) => (
                <div key={index} className='flex items-center justify-between rounded border p-2'>
                  <div>
                    <div className='font-medium'>{alt.name}</div>
                    <div className='text-xs text-gray-600'>
                      {alt.mapping.category || 'Unknown Category'}
                    </div>
                  </div>
                  <div className='text-sm font-semibold'>
                    {(alt.similarity * 100).toFixed(0)}% Similar
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compatibility Calculator Section */}
      <div className='rounded border p-4'>
        <h2 className='mb-2 text-xl font-semibold'>Ingredient Compatibility</h2>
        <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block'>First Ingredient</label>
            <input
              type='text'
              value={selectedIngredient}
              onChange={e => setSelectedIngredient(e.target.value)}
              placeholder='Enter first ingredient'
              className='w-full rounded border p-2'
            />
          </div>
          <div>
            <label className='mb-1 block'>Second Ingredient</label>
            <input
              type='text'
              value={secondIngredient}
              onChange={e => setSecondIngredient(e.target.value)}
              placeholder='Enter second ingredient'
              className='w-full rounded border p-2'
            />
          </div>
        </div>
        <button
          onClick={handleCalculateCompatibility}
          disabled={isLoading || !selectedIngredient || !secondIngredient}
          className='rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:bg-purple-300'
        >
          Calculate Compatibility
        </button>

        {/* Display Result */}
        {Boolean(compatibilityResult) && (
          <div className='mt-4'>
            {(compatibilityResult as Record<string, unknown>).success ? (
              <div className='rounded border p-3'>
                <div className='mb-1 text-lg font-semibold'>
                  {String((compatibilityResult as Record<string, unknown>).type || '')
                    .charAt(0)
                    .toUpperCase() +
                    String((compatibilityResult as Record<string, unknown>).type || '').slice(
                      1,
                    )}{' '}
                  Compatibility
                </div>
                <div className='relative mt-2 h-4 overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className='absolute left-0 top-0 h-full bg-blue-500'
                    style={{
                      width: `${Number((compatibilityResult as Record<string, unknown>).compatibility || 0) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className='mt-1 text-right text-sm'>
                  {(
                    Number((compatibilityResult as Record<string, unknown>).compatibility || 0) *
                    100
                  ).toFixed(0)}
                  %
                </div>
              </div>
            ) : (
              <div className='rounded bg-red-100 p-3 text-red-800'>
                {String((compatibilityResult as Record<string, unknown>).message || '')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

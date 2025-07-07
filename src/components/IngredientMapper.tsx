'use client';

import React, { useState } from 'react';
import { useIngredientMapping } from '@/hooks/useIngredientMapping';
import { cuisinesMap } from '@/data/cuisines';

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
    calculateCompatibility
  } = useIngredientMapping();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [mappedRecipes, setMappedRecipes] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [secondIngredient, setSecondIngredient] = useState('');

  // Find recipes with good ingredient mappings
  const handleFindRecipes = () => {
    const elementalTarget = {
      // Can be customized based on user preferences or context
      Fire: 0.3, 
      Water: 0.3,
      Earth: 0.2,
      Air: 0.2
    };

    const results = findMatchingRecipes({
      elementalTarget,
      requiredIngredients: searchTerm ? [searchTerm] : undefined,
      cuisineType: selectedCuisine || undefined
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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ingredient Mapping Explorer</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      {/* Recipe Search Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Find Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Ingredient</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter ingredient (optional)"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Cuisine</label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Cuisines</option>
              {Object.keys(cuisinesMap).map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleFindRecipes}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Loading...' : 'Find Recipes'}
        </button>
        
        {/* Display Results */}
        {mappedRecipes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Found {mappedRecipes.length} Recipes</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mappedRecipes.map((result, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="font-medium">{result.recipe.name}</div>
                  <div className="text-sm text-gray-600">{result.recipe.cuisine || 'Unknown Cuisine'}</div>
                  <div className="text-sm">Match Quality: <span className="font-semibold">{result.matchQuality}</span></div>
                  <div className="text-sm">Score: {(result.score * 100).toFixed(0)}%</div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">Mapped Ingredients:</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {result.matchedIngredients
                        .filter((ing: unknown) => {
                          // Apply surgical type casting with variable extraction
                          const ingData = ing as Record<string, unknown>;
                          return ingData?.matchedTo;
                        })
                        .map((ing: unknown, i: number) => {
                          // Apply surgical type casting with variable extraction
                          const ingData = ing as Record<string, unknown>;
                          const name = ingData?.name;
                          const confidence = ingData?.confidence;
                          
                          return (
                            <div key={i} className="text-xs p-1 bg-green-100 rounded">
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
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Find Alternative Ingredients</h2>
        <div className="mb-4">
          <label className="block mb-1">Ingredient</label>
          <input
            type="text"
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
            placeholder="Enter ingredient name"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleFindAlternatives}
          disabled={isLoading || !selectedIngredient}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {isLoading ? 'Loading...' : 'Find Alternatives'}
        </button>
        
        {/* Display Results */}
        {alternatives.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Alternative Ingredients</h3>
            <div className="space-y-2">
              {alternatives.map((alt, index) => (
                <div key={index} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{alt.name}</div>
                    <div className="text-xs text-gray-600">{alt.mapping.category || 'Unknown Category'}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {(alt.similarity * 100).toFixed(0)}% Similar
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Compatibility Calculator Section */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Ingredient Compatibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">First Ingredient</label>
            <input
              type="text"
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              placeholder="Enter first ingredient"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Second Ingredient</label>
            <input
              type="text"
              value={secondIngredient}
              onChange={(e) => setSecondIngredient(e.target.value)}
              placeholder="Enter second ingredient"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleCalculateCompatibility}
          disabled={isLoading || !selectedIngredient || !secondIngredient}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
        >
          Calculate Compatibility
        </button>
        
        {/* Display Result */}
        {compatibilityResult && (
          <div className="mt-4">
            {compatibilityResult.success ? (
              <div className="p-3 border rounded">
                <div className="text-lg font-semibold mb-1">
                  {compatibilityResult.type.charAt(0).toUpperCase() + compatibilityResult.type.slice(1)} Compatibility
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500"
                    style={{ width: `${compatibilityResult.compatibility * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm mt-1">
                  {(compatibilityResult.compatibility * 100).toFixed(0)}%
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-100 text-red-800 rounded">
                {compatibilityResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
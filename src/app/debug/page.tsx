'use client';

import React, { useState, useEffect } from 'react';
import { testCookingMethodRecommendations, testIngredientRecommendations } from '../../utils/testRecommendations';
import CookingMethodsSection from '@/components/CookingMethodsSection';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { Loader2 } from 'lucide-react';
import CuisineRecommenderDebug from '@/components/debug/CuisineRecommenderDebug';

interface TestResult {
  ingredient: unknown;
  holisticRecommendations: Array<{
    method: string;
    score: string;
    reason: string;
  }>;
  standardRecommendations: Array<{ method: string; score: string }>;
}

interface IngredientTestResult {
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  season: string;
  timeOfDay: string;
  zodiacSign: string;
  directRecommendations: Record<string, Array<any>>;
  balancedRecommendations: Array<any>;
}

export default function DebugPage() {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [ingredientResults, setIngredientResults] = useState<IngredientTestResult | null>(null);
  const [loading, setLoading] = useState<{cooking: boolean; ingredients: boolean}>({
    cooking: false,
    ingredients: false
  });
  const [error, setError] = useState<{cooking: string | null; ingredients: string | null}>({
    cooking: null,
    ingredients: null
  });
  const [methods, setMethods] = useState<any[]>([]);

  // Run the test on first load
  useEffect(() => {
    runCookingTest();
  }, []);

  const runCookingTest = () => {
    setLoading(prev => ({ ...prev, cooking: true }));
    setError(prev => ({ ...prev, cooking: null }));

    try {
      const results = testCookingMethodRecommendations();
      setTestResults(results);
      
      // Format methods for the section component
      const formattedMethods = Object.entries(cookingMethods).map(([id, method]) => ({
        id,
        name: method.name,
        description: method.description || 'A cooking method for food preparation',
        elementalEffect: method.elementalEffect,
        duration: method.duration,
        suitable_for: method.suitable_for || [],
        benefits: method.benefits || [],
        score: parseFloat(results.holisticRecommendations.find(rec => rec.method === id)?.score || '0') / 100
      }));
      
      setMethods(formattedMethods);
    } catch (err) {
      console.error('Error running cooking test:', err);
      setError(prev => ({ 
        ...prev,
        cooking: err instanceof Error ? err.message : 'Unknown error'
      }));
    } finally {
      setLoading(prev => ({ ...prev, cooking: false }));
    }
  };
  
  const runIngredientTest = () => {
    setLoading(prev => ({ ...prev, ingredients: true }));
    setError(prev => ({ ...prev, ingredients: null }));

    try {
      const results = testIngredientRecommendations();
      setIngredientResults(results);
    } catch (err) {
      console.error('Error running ingredient test:', err);
      setError(prev => ({ 
        ...prev,
        ingredients: err instanceof Error ? err.message : 'Unknown error'
      }));
    } finally {
      setLoading(prev => ({ ...prev, ingredients: false }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>

      {/* CuisineRecommender Debug Component */}
      <CuisineRecommenderDebug />

      {/* CookingMethodsSection Component Test */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">CookingMethodsSection Component</h2>
        {methods.length > 0 ? (
          <CookingMethodsSection 
            methods={methods} 
            showToggle={true}
            initiallyExpanded={true}
          />
        ) : (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
            <p>No methods available. Run the test to load methods.</p>
          </div>
        )}
      </div>

      {/* Cooking Methods Test Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Cooking Methods Debug</h2>

        <div className="mb-4">
          <button
            onClick={runCookingTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={loading.cooking}
          >
            {loading.cooking ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Test...
              </span>
            ) : (
              'Test Cooking Method Recommendations'
            )}
          </button>
        </div>

        {error.cooking && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
            <p className="font-bold">Error:</p>
            <p>{error.cooking}</p>
          </div>
        )}

        {testResults && (
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">IngredientCookingMethods Test</h3>

            <details className="mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
              <summary className="font-bold cursor-pointer py-1">
                Test Ingredient: {(testResults.ingredient as any).name} Details
              </summary>
              <div className="pt-2 pl-2">
                <p>Element: {(testResults.ingredient as any).element}</p>
                <p>Elemental Character: {(testResults.ingredient as any).elementalCharacter}</p>
              </div>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <h4 className="font-bold">Holistic Recommendations:</h4>
                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {testResults.holisticRecommendations.map((rec, index) => (
                    <li key={`holistic-${index}`}>
                      {rec.method} - {rec.score} - {rec.reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-bold">Standard Recommendations:</h4>
                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {testResults.standardRecommendations.map((rec, index) => (
                    <li key={`standard-${index}`}>
                      {rec.method} - {rec.score}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Recommender Test Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Ingredient Recommender Debug</h2>

        <div className="mb-4">
          <button
            onClick={runIngredientTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            disabled={loading.ingredients}
          >
            {loading.ingredients ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Test...
              </span>
            ) : (
              'Test Ingredient Recommendations'
            )}
          </button>
        </div>

        {error.ingredients && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded">
            <p className="font-bold">Error:</p>
            <p>{error.ingredients}</p>
          </div>
        )}

        {ingredientResults && (
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Ingredient Recommendation Results</h3>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h4 className="font-bold">Test Parameters</h4>
                <p>Season: {ingredientResults.season}</p>
                <p>Time of Day: {ingredientResults.timeOfDay}</p>
                <p>Zodiac Sign: {ingredientResults.zodiacSign}</p>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h4 className="font-bold">Elemental Properties</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Fire: {(ingredientResults.elementalProperties.Fire * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Water: {(ingredientResults.elementalProperties.Water * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Earth: {(ingredientResults.elementalProperties.Earth * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span>Air: {(ingredientResults.elementalProperties.Air * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold">Balanced Ingredients:</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2">
                <p className="text-sm mb-2">Ingredients that balance elemental properties</p>
                <ul className="grid grid-cols-2 gap-2">
                  {ingredientResults.balancedRecommendations.map((rec, index) => (
                    <li key={`balanced-${index}`} className="flex items-center p-2 bg-white dark:bg-gray-600 rounded shadow-sm">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        rec.element === 'fire' ? 'bg-red-500' :
                        rec.element === 'water' ? 'bg-blue-500' :
                        rec.element === 'earth' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></span>
                      <span className="font-medium">{rec.name}</span>
                      <span className="ml-auto text-xs opacity-75">
                        {rec.balanceScore ? `Score: ${(rec.balanceScore * 100).toFixed(0)}%` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold">Direct Recommendations by Category:</h4>
              <div className="mt-2 space-y-4">
                {Object.entries(ingredientResults.directRecommendations).map(([category, ingredients]) => (
                  <div key={`category-${category}`} className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <h5 className="font-semibold capitalize mb-2">{category} ({ingredients.length})</h5>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ingredients.slice(0, 9).map((ingredient, index) => (
                        <li key={`ingredient-${category}-${index}`} className="p-2 bg-white dark:bg-gray-600 rounded text-sm">
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-xs opacity-75 flex justify-between">
                            <span>{ingredient.element}</span>
                            <span>{ingredient.matchScore ? `${(ingredient.matchScore * 100).toFixed(0)}%` : '-'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {ingredients.length > 9 && (
                      <p className="text-xs mt-2 text-gray-500">{ingredients.length - 9} more ingredients...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
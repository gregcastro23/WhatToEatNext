'use client';

import React, { useState, useEffect } from 'react';

import { CuisineSection } from '@/components/CuisineSection';
import { CuisineSectionMigrated } from '@/components/CuisineSection/CuisineSection.migrated';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useServices } from '@/hooks/useServices';
import { logger } from '@/utils/logger';

// DUPLICATE: import { Element } from "@/types/alchemy";
export default function CuisineSectionTestPage() {
  // Sample cuisine and elemental state for testing
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Italian');
  const availableCuisines = ['Italian', 'French', 'Japanese', 'Indian', 'Thai', 'Mexican', 'Mediterranean', 'Chinese', 'Korean'];
  
  // Use context for the original component
  const { state } = useAlchemical();
  
  // Use services for both components
  const { recipeService } = useServices();
  
  // Component state
  const [recipes, setRecipes] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<Error | null>(null);
  
  // Load recipes for the selected cuisine
  useEffect(() => {
    const loadRecipes = async () => {
      if (!recipeService) return;
      
      try {
        setIsLoading(true);
        const cuisineRecipes = await recipeService.getRecipesForCuisine(selectedCuisine);
        setRecipes(cuisineRecipes);
        setError(null);
      } catch (err) {
        logger.error('Error loading recipes:', err);
        setError(err instanceof Error ? err : new Error('Error loading recipes'));
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    void loadRecipes();
  }, [selectedCuisine, recipeService]);
  
  // Element color classes for better visualization
  const elementColorClasses = { Fire: 'bg-red-500', Water: 'bg-blue-500', Earth: 'bg-amber-700', Air: 'bg-sky-300'
   };
  
  // Render elemental state visualization
  const renderElementalState = (elementalState: { [key: string]: number }) => {
    return (
      <div className="flex h-4 w-full rounded-full overflow-hidden">
        {Object.entries(elementalState || {}).map(([element, value]) => (
          element in elementColorClasses && (
            <div
              key={element}
              className={`${elementColorClasses[element as keyof typeof elementColorClasses]}`}
              style={{ width: `${value * 100}%` }}
              title={`${element}: ${Math.round(value * 100)}%`}
            />
          )
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">CuisineSection Component Migration Test</h1>
      
      {/* Cuisine Selector */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Select a Cuisine to Test</h2>
        <div className="flex flex-wrap gap-2">
          {(availableCuisines || []).map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full ${
                selectedCuisine === cuisine
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-100'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
        
        {/* Show current elemental state */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Current Elemental State:</h3>
          {renderElementalState({
            Fire: state.elementalState.Fire ?? 0.25,
            Water: state.elementalState.Water ?? 0.25,
            Earth: state.elementalState.Earth ?? 0.25,
            Air: state.elementalState.Air ?? 0.25
          })}
          <div className="mt-2 text-sm text-gray-600">
            Season: {state.currentSeason || "spring"}, Time of Day: {state.timeOfDay}
          </div>
        </div>
      </div>
      
      {/* Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Implementation */}
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">🔄 Original Implementation</h2>
          <div className="bg-white rounded-lg">
            <CuisineSection
              cuisine={selectedCuisine}
              recipes={recipes}
              elementalState={{
                Fire: state.elementalState.Fire ?? 0.25,
                Water: state.elementalState.Water ?? 0.25,
                Earth: state.elementalState.Earth ?? 0.25,
                Air: state.elementalState.Air ?? 0.25,
                season: state.currentSeason || "spring",
                timeOfDay: (state.timeOfDay || "morning") ?? "morning"
              }}
            />
          </div>
        </div>
        
        {/* Migrated Implementation */}
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">✨ Migrated Implementation</h2>
          <div className="bg-white rounded-lg">
            <CuisineSectionMigrated
              cuisine={selectedCuisine}
              recipes={recipes}
              elementalState={{
                Fire: state.elementalState.Fire ?? 0.25,
                Water: state.elementalState.Water ?? 0.25,
                Earth: state.elementalState.Earth ?? 0.25,
                Air: state.elementalState.Air ?? 0.25,
                season: state.currentSeason || "spring",
                timeOfDay: (state.timeOfDay || "morning") ?? "morning"
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💡 Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Replaced direct imports from <code>getRelatedCuisines</code>, <code>getRecipesForCuisineMatch</code>, and <code>getBestRecipeMatches</code> with service calls</li>
          <li>Replaced direct cuisineMap access with cuisineService.getAllCuisines()</li>
          <li>Added proper loading, error, and empty states</li>
          <li>Enhanced async recipe fetching with better error handling</li>
          <li>Maintained all UI functionality including traditional sauces and regional variants</li>
          <li>Improved filtering and sorting logic with proper type safety</li>
        </ul>
      </div>
    </div>
  );
} 
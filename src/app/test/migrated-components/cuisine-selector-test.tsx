'use client';

import React, { useState } from 'react';
import CuisineSelector from '@/components/CuisineSelector';
import CuisineSelectorMigrated from '@/components/CuisineSelector.migrated';
import { Recipe } from '@/types/recipe';

/**
 * Test page to compare the original CuisineSelector with the migrated version
 */
export default function CuisineSelectorTestPage() {
  // State for the original component
  const [originalSelectedCuisine, setOriginalSelectedCuisine] = useState<string | null>(null);
  const [originalRecipes, setOriginalRecipes] = useState<Recipe[]>([]);
  
  // State for the migrated component
  const [migratedSelectedCuisine, setMigratedSelectedCuisine] = useState<string | null>(null);
  const [migratedRecipes, setMigratedRecipes] = useState<Recipe[]>([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">CuisineSelector Migration Test</h1>
      
      <div className="mb-8">
        <div className="bg-blue-100 p-3 mb-4 rounded">
          <p className="font-medium">This page compares the original context-based CuisineSelector with the migrated service-based version.</p>
          <p className="text-sm mt-1">Both components should display identical UI but with different data sources.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original component */}
          <div className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Original Component (Context-based)</h2>
            <CuisineSelector
              selectedCuisine={originalSelectedCuisine}
              onCuisineChange={setOriginalSelectedCuisine}
              onRecipesChange={setOriginalRecipes}
            />
            
            {originalSelectedCuisine && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Selected Cuisine: {originalSelectedCuisine}</h3>
                <p>Recipes found: {(originalRecipes || []).length}</p>
                {(originalRecipes || []).length > 0 && (
                  <ul className="list-disc pl-5 mt-2">
                    {(originalRecipes || []).slice(0, 5).map((recipe, index) => (
                      <li key={index}>{recipe.name}</li>
                    ))}
                    {(originalRecipes || []).length > 5 && <li>...and {(originalRecipes || []).length - 5} more</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {/* Migrated component */}
          <div className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Migrated Component (Service-based)</h2>
            <CuisineSelectorMigrated
              selectedCuisine={migratedSelectedCuisine}
              onCuisineChange={setMigratedSelectedCuisine}
              onRecipesChange={setMigratedRecipes}
            />
            
            {migratedSelectedCuisine && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Selected Cuisine: {migratedSelectedCuisine}</h3>
                <p>Recipes found: {(migratedRecipes || []).length}</p>
                {(migratedRecipes || []).length > 0 && (
                  <ul className="list-disc pl-5 mt-2">
                    {(migratedRecipes || []).slice(0, 5).map((recipe, index) => (
                      <li key={index}>{recipe.name}</li>
                    ))}
                    {(migratedRecipes || []).length > 5 && <li>...and {(migratedRecipes || []).length - 5} more</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Migration Notes</h2>
        <ul className="list-disc pl-5">
          <li>Replaced direct data imports with service calls</li>
          <li>Added proper loading, error, and empty states</li>
          <li>Used async/await pattern for data fetching</li>
          <li>Improved type safety with explicit typing</li>
          <li>Added fallback values for when service data is not available</li>
        </ul>
      </div>
    </div>
  );
} 
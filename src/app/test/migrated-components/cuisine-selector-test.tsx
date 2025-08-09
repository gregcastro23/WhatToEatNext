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
    <div className='p-4'>
      <h1 className='mb-6 text-2xl font-bold'>CuisineSelector Migration Test</h1>

      <div className='mb-8'>
        <div className='mb-4 rounded bg-blue-100 p-3'>
          <p className='font-medium'>
            This page compares the original context-based CuisineSelector with the migrated
            service-based version.
          </p>
          <p className='mt-1 text-sm'>
            Both components should display identical UI but with different data sources.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Original component */}
          <div className='rounded-lg border p-4 shadow'>
            <h2 className='mb-4 border-b pb-2 text-xl font-semibold'>
              Original Component (Context-based)
            </h2>
            <CuisineSelector
              selectedCuisine={originalSelectedCuisine}
              onCuisineChange={setOriginalSelectedCuisine}
              onRecipesChange={setOriginalRecipes}
            />

            {originalSelectedCuisine && (
              <div className='mt-6 border-t pt-4'>
                <h3 className='mb-2 text-lg font-medium'>
                  Selected Cuisine: {originalSelectedCuisine}
                </h3>
                <p>Recipes found: {(originalRecipes || []).length}</p>
                {(originalRecipes || []).length > 0 && (
                  <ul className='mt-2 list-disc pl-5'>
                    {(originalRecipes || []).slice(0, 5).map((recipe, index) => (
                      <li key={index}>{recipe.name}</li>
                    ))}
                    {(originalRecipes || []).length > 5 && (
                      <li>...and {(originalRecipes || []).length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Migrated component */}
          <div className='rounded-lg border p-4 shadow'>
            <h2 className='mb-4 border-b pb-2 text-xl font-semibold'>
              Migrated Component (Service-based)
            </h2>
            <CuisineSelectorMigrated
              selectedCuisine={migratedSelectedCuisine}
              onCuisineChange={setMigratedSelectedCuisine}
              onRecipesChange={setMigratedRecipes}
            />

            {migratedSelectedCuisine && (
              <div className='mt-6 border-t pt-4'>
                <h3 className='mb-2 text-lg font-medium'>
                  Selected Cuisine: {migratedSelectedCuisine}
                </h3>
                <p>Recipes found: {(migratedRecipes || []).length}</p>
                {(migratedRecipes || []).length > 0 && (
                  <ul className='mt-2 list-disc pl-5'>
                    {(migratedRecipes || []).slice(0, 5).map((recipe, index) => (
                      <li key={index}>{recipe.name}</li>
                    ))}
                    {(migratedRecipes || []).length > 5 && (
                      <li>...and {(migratedRecipes || []).length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='rounded-lg bg-gray-100 p-4'>
        <h2 className='mb-2 text-lg font-semibold'>Migration Notes</h2>
        <ul className='list-disc pl-5'>
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

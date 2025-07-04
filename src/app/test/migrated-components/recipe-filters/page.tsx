'use client';

import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import RecipeFiltersMigrated, { FilterState, initialFilters } from '@/components/Recipe/RecipeFilters.migrated';
import { logger } from '@/utils/logger';

export default function RecipeFiltersTestPage() {
  // State for original filters
  const [originalFilters, setOriginalFilters] = useState<FilterState>(initialFilters);
  const [showOriginalFilters, setShowOriginalFilters] = useState(false);

  // State for migrated filters
  const [migratedFilters, setMigratedFilters] = useState<FilterState>(initialFilters);
  const [showMigratedFilters, setShowMigratedFilters] = useState(false);

  // Update filters for original implementation
  const updateOriginalFilters = (updates: Partial<FilterState>) => {
    setOriginalFilters(prev => ({ ...prev, ...updates }));
    logger.info('Original filters updated:', updates);
  };

  // Reset filters for original implementation
  const resetOriginalFilters = () => {
    setOriginalFilters(initialFilters);
    setShowOriginalFilters(false);
    logger.info('Original filters reset');
  };

  // Update filters for migrated implementation
  const updateMigratedFilters = (updates: Partial<FilterState>) => {
    setMigratedFilters(prev => ({ ...prev, ...updates }));
    logger.info('Migrated filters updated:', updates);
  };

  // Reset filters for migrated implementation
  const resetMigratedFilters = () => {
    setMigratedFilters(initialFilters);
    setShowMigratedFilters(false);
    logger.info('Migrated filters reset');
  };

  // For monitoring filter changes
  const renderFilterState = (filters: FilterState) => {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm font-mono overflow-auto">
        <h3 className="font-bold mb-2">Current Filter State:</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">RecipeFilters Component Migration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The original implementation is embedded in RecipeList, so we're only showing the migrated component */}
        <div className="border p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">⚠️ Note: Original Implementation</h2>
          <p className="mb-4 text-gray-700">
            The original implementation of recipe filters is embedded directly in the RecipeList 
            component rather than existing as a standalone component. We've extracted the filtering 
            functionality into a new RecipeFilters component as part of the migration process.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              See <code>src/components/RecipeList/RecipeList.tsx</code> for the original implementation.
            </p>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🔄 Migrated Implementation</h2>
          
          {/* Migrated RecipeFilters component */}
          <RecipeFiltersMigrated
            filters={migratedFilters}
            updateFilters={updateMigratedFilters}
            resetFilters={resetMigratedFilters}
            showFilters={showMigratedFilters}
            setShowFilters={setShowMigratedFilters}
          />
          
          {renderFilterState(migratedFilters)}
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💡 Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>The original filtering functionality was embedded within the RecipeList component</li>
          <li>We've extracted this into a separate RecipeFilters component following the service-based architecture pattern</li>
          <li>The migrated component uses the useServices hook to fetch reference data (cuisines, meal types, dietary _options)</li>
          <li>Proper loading, error, and empty states have been implemented</li>
          <li>The component maintains all original filtering functionality</li>
          <li>Added improved TypeScript typing with proper interfaces</li>
        </ul>
      </div>
    </div>
  );
} 
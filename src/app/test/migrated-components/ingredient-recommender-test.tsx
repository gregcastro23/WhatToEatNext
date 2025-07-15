'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IngredientRecommender from '@/components/recommendations/IngredientRecommender';
// import IngredientRecommenderMigrated from '@/components/recommendations/IngredientRecommender.migrated';

export default function IngredientRecommenderTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ingredient Recommender Component Test</h1>
      
      <Tabs defaultValue="original" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="original">Original (Context-based)</TabsTrigger>
          <TabsTrigger value="migrated">Migrated (Service-based)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="original" className="space-y-8">
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Original Implementation</h2>
            <IngredientRecommender />
          </div>
        </TabsContent>
        
        <TabsContent value="migrated" className="space-y-8">
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Migrated Implementation</h2>
            {/* <IngredientRecommenderMigrated /> */}
            <div className="p-4 text-center text-gray-500">Migrated component not available</div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Migration Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Replaced multiple contexts with useServices hook</li>
          <li>Added service dependency checks for loading/error states</li>
          <li>Implemented robust loading handling with timeout fallback</li>
          <li>Maintained complex categorization and filtering logic</li>
          <li>Preserved UI presentation with a cleaner service-based implementation</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> The ingredient recommendation algorithm relies on multiple services 
          and may take longer to load than other components. Both the original and migrated versions 
          include timeout handling to prevent the UI from being stuck in a loading state indefinitely.
        </p>
      </div>
    </div>
  );
} 
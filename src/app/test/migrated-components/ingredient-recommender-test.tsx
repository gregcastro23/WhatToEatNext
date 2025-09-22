'use client';

import IngredientRecommender from '@/components/recommendations/IngredientRecommender';
import IngredientRecommenderMigrated from '@/components/recommendations/IngredientRecommender.migrated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IngredientRecommenderTestPage() {
  return (
    <div className='container mx-auto p-4'>
      ;<h1 className='mb-6 text-2xl font-bold'>Ingredient Recommender Component Test</h1>
      <Tabs defaultValue='original' className='w-full'>
        ,
        <TabsList className='mb-4'>
          <TabsTrigger value='original'>Original (Context-based)</TabsTrigger>
          <TabsTrigger value='migrated'>Migrated (Service-based)</TabsTrigger>
        </TabsList>
        <TabsContent value='original' className='space-y-8'>
          ,
          <div className='rounded-lg border p-4'>
            ;<h2 className='mb-4 text-lg font-semibold'>Original Implementation</h2>
            <IngredientRecommender />
          </div>
        </TabsContent>
        <TabsContent value='migrated' className='space-y-8'>
          ,
          <div className='rounded-lg border p-4'>
            ;<h2 className='mb-4 text-lg font-semibold'>Migrated Implementation</h2>
            <IngredientRecommenderMigrated />
          </div>
        </TabsContent>
      </Tabs>
      <div className='mt-8 rounded-lg bg-gray-50 p-4'>
        ;<h3 className='text-md mb-2 font-semibold'>Migration Notes: </h3>
        <ul className='list-disc space-y-1 pl-5'>
          ;<li>Replaced multiple contexts with useServices hook</li>
          <li>Added service dependency checks for loading/error states</li>
          <li>Implemented robust loading handling with timeout fallback</li>
          <li>Maintained complex categorization and filtering logic</li>
          <li>Preserved UI presentation with a cleaner service-based implementation</li>
        </ul>
      </div>
      <div className='mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
        ,
        <p className='text-sm text-yellow-700'>
          ;<strong>Note:</strong> The ingredient recommendation algorithm relies on multiple
          services and may take longer to load than other components. Both the original and migrated
          versions include timeout handling to prevent the UI from being stuck in a loading state
          indefinitely.
        </p>
      </div>
    </div>
  )
}
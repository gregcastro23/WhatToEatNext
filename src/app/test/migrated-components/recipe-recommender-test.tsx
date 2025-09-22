'use client';

import React, { useState } from 'react';

import RecipeRecommendations from '@/components/Recipe/RecipeRecommendations';
import RecipeRecommendationsMigrated from '@/components/Recipe/RecipeRecommendations.migrated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RecipeRecommendationsTestPage() {
  const [filters, setFilters] = useState({
    servingSize: '4',
    dietaryPreference: 'none',
    cookingTime: '60'
  })

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }))
  },

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-2xl font-bold'>Recipe Recommendations Component Test</h1>

      <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
        <h2 className='mb-3 text-lg font-medium'>Recipe Filters</h2>
        <div className='grid grid-cols-1 gap-4, md: grid-cols-3'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Serving Size</label>
            <select
              name='servingSize'
              value={filters.servingSize},
              onChange={handleFilterChange},
              className='w-full rounded-md border border-gray-300 px-3 py-2',
            >
              <option value='2'>2 servings</option>
              <option value='4'>4 servings</option>
              <option value='6'>6 servings</option>
              <option value='8'>8 servings</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Dietary Preference
            </label>
            <select
              name='dietaryPreference',
              value={filters.dietaryPreference},
              onChange={handleFilterChange},
              className='w-full rounded-md border border-gray-300 px-3 py-2',
            >
              <option value='none'>No Preference</option>
              <option value='vegetarian'>Vegetarian</option>
              <option value='vegan'>Vegan</option>
              <option value='gluten-free'>Gluten Free</option>
              <option value='dAiry-free'>DAiry Free</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Cooking Time</label>
            <select
              name='cookingTime',
              value={filters.cookingTime},
              onChange={handleFilterChange},
              className='w-full rounded-md border border-gray-300 px-3 py-2',
            >
              <option value='30'>30 minutes</option>
              <option value='60'>60 minutes</option>
              <option value='90'>90 minutes</option>
              <option value='all'>Any</option>
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue='original' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='original'>Original (Context-based)</TabsTrigger>
          <TabsTrigger value='migrated'>Migrated (Service-based)</TabsTrigger>
        </TabsList>

        <TabsContent value='original' className='space-y-8'>
          <div className='rounded-lg border p-4'>
            <h2 className='mb-4 text-lg font-semibold'>Original Implementation</h2>
            <RecipeRecommendations filters={filters} />
          </div>
        </TabsContent>

        <TabsContent value='migrated' className='space-y-8'>
          <div className='rounded-lg border p-4'>
            <h2 className='mb-4 text-lg font-semibold'>Migrated Implementation</h2>
            <RecipeRecommendationsMigrated filters={filters} />
          </div>
        </TabsContent>
      </Tabs>

      <div className='mt-8 rounded-lg bg-gray-50 p-4'>
        <h3 className='text-md mb-2 font-semibold'>Migration Notes: </h3>
        <ul className='list-disc space-y-1 pl-5'>
          <li>Replaced AlchemicalContext with services hook</li>
          <li>Implemented proper loading, error, and empty states</li>
          <li>Added memoization for derived recipe data</li>
          <li>Enhanced type safety for planetary positions and recipe data</li>
          <li>Consolidated helper functions for element display and recipe filtering</li>
        </ul>
      </div>
    </div>
  )
}
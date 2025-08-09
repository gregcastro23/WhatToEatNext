'use client';

import React from 'react';

import IngredientRecommender from '@/components/IngredientRecommender';

export function IngredientRecommenderDebug() {
  return (
    <div className='rounded-lg border border-green-500 p-4'>
      <h4 className='mb-2 text-lg font-bold text-green-400'>Ingredient Recommender</h4>
      <IngredientRecommender />
    </div>
  );
}

'use client';

import React from 'react';
import IngredientRecommender from '@/components/IngredientRecommender';

export function IngredientRecommenderDebug() {
  return (
    <div className="border border-green-500 p-4 rounded-lg">
      <h4 className="text-lg font-bold mb-2 text-green-400">Ingredient Recommender</h4>
      <IngredientRecommender />
    </div>
  );
} 
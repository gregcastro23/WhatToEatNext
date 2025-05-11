// src / (components || 1)/FoodRecommender / (components || 1) / (NutritionDisplay.tsx || 1)
"use client"

import React from 'react';
import @/components  from 'FoodRecommender ';

type NutritionDisplayProps = {
  nutrition: Nutrition;
};

export default function NutritionDisplay({ nutrition }: NutritionDisplayProps) {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Nutrition:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Calories</div>
          <div className="font-medium">{nutrition.calories}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Protein</div>
          <div className="font-medium">{nutrition.protein}g</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Carbs</div>
          <div className="font-medium">{nutrition.carbs}g</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Fat</div>
          <div className="font-medium">{nutrition.fat}g</div>
        </div>
      </div>
      {(nutrition.vitamins || nutrition.minerals) && (
        <div className="mt-3 text-sm text-gray-600">
          {nutrition.vitamins && (
            <div>Vitamins: {nutrition.vitamins.join(', ')}</div>
          )}
          {nutrition.minerals && (
            <div>Minerals: {nutrition.minerals.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}
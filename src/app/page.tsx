// src/app/page.tsx

'use client';

import { useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import RecipeGrid from '@/components/Recipe/RecipeGrid';
import { cuisines } from '@/data/cuisines';

export default function Home() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const { state } = useAlchemical();

  // Get all recipes from all cuisines
  const allRecipes = Object.values(cuisines).flatMap(cuisine => {
    if (!cuisine?.dishes) return [];
    
    return Object.entries(cuisine.dishes).flatMap(([mealType, seasonDishes]) => {
      if (!seasonDishes) return [];
      
      return Object.values(seasonDishes).flat().map(recipe => ({
        ...recipe,
        mealType: recipe.mealType.map(type => type.replace("all-", ""))
      }));
    });
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RecipeGrid 
          recipes={allRecipes}
          selectedCuisine={selectedCuisine}
          mealType={getCurrentMealType(new Date().getHours())}
        />
      </div>
    </main>
  );
}

function getCurrentMealType(hour: number): string {
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
}
// src/components/FoodRecommender/components/CuisineGroup.tsx

import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import type { Dish } from '@/types/alchemy';
import RecipeCard from '../../Recipe/RecipeCard';

interface CuisineGroupProps {
  cuisineName: string;
  recipes: Dish[];
  expandedRecipe: string | null;
  setExpandedRecipe: (id: string | null) => void;
}

export default function CuisineGroup({
  cuisineName,
  recipes,
  expandedRecipe,
  setExpandedRecipe
}: CuisineGroupProps) {
  const { state } = useAlchemical();
  
  const sortedRecipes = React.useMemo(() => {
    return [...recipes].sort((a, b) => {
      // Sort by elemental alignment with current sign
      const aAlignment = calculateElementalAlignment(a.elementalBalance, state.elementalPreference);
      const bAlignment = calculateElementalAlignment(b.elementalBalance, state.elementalPreference);
      return bAlignment - aAlignment;
    });
  }, [recipes, state.elementalPreference]);

  const handleToggleRecipe = (idx: number) => {
    const recipeId = `${cuisineName}-${idx}`;
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{cuisineName}</h2>
        <span className="text-sm text-gray-600">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} available
        </span>
      </div>
      
      <div className="divide-y">
        {sortedRecipes.map((dish, idx) => (
          <RecipeCard
            key={`${cuisineName}-${idx}`}
            dish={dish}
            isExpanded={expandedRecipe === `${cuisineName}-${idx}`}
            onToggle={() => handleToggleRecipe(idx)}
            currentSign={state.currentSign}
            currentSeason={state.currentSeason}
          />
        ))}
      </div>
    </div>
  );
}

function calculateElementalAlignment(
  recipeBalance?: { [key: string]: number },
  userPreference?: { [key: string]: number }
): number {
  if (!recipeBalance || !userPreference) return 0;
  
  let alignment = 0;
  let total = 0;
  
  Object.keys(userPreference).forEach(element => {
    const recipeValue = recipeBalance[element] || 0;
    const preferenceValue = userPreference[element] || 0;
    
    // Calculate how well they match (0-1 scale)
    alignment += 1 - Math.abs(recipeValue - preferenceValue);
    total += 1;
  });
  
  return total > 0 ? alignment / total : 0;
}
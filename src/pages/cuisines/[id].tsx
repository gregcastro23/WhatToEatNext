import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { CuisineSection } from '@/components/CuisineSection';
import { cuisines } from '@/data/cuisines';
import { allRecipes, getBestRecipeMatches } from '@/data/recipes';
import { getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import { getCurrentElementalState } from '@/utils/elementalUtils';
import type { Recipe } from '@/types/recipe';
import type { Season } from '@/types/common';
import type { Cuisine } from '@/types/alchemy';

const CuisineDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch',
  });

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = getCurrentElementalState();
    setElementalState(currentState as unknown);
  }, []);

  // Memoize the cuisine data with safe property access
  const cuisine = React.useMemo(() => {
    if (!id) return null;
    const cuisineData = cuisines[id as string] as Cuisine;
    return cuisineData || null;
  }, [id]);

  // Memoize the recipe calculation
  const combinedRecipes = React.useMemo<Recipe[]>(() => {
    if (!cuisine) return [];

    // Safe property access for cuisine name
    const cuisineName = cuisine.name || id as string;

    // 1. Get recipe matches based on cuisine flavor profiles
    const cuisineMatchedRecipes = getRecipesForCuisineMatch(cuisineName, allRecipes, 20);
  
    // 2. Get recipe matches based on current elemental state - Safe array access
    const elementalMatchedRecipesResult = getBestRecipeMatches({
      cuisine: cuisineName,
      season: elementalState.season as Season,
      mealType: elementalState.timeOfDay
    }, 20);
    
    // Ensure we have an array, not a Promise
    const elementalMatchedRecipes = Array.isArray(elementalMatchedRecipesResult) 
      ? elementalMatchedRecipesResult 
      : [];
    
    // Combine and deduplicate recipes
    const recipeIds = new Set<string>();
    const combined: Recipe[] = [];
    
    // Add recipes that match both criteria - Safe array method access
    for (const recipe1 of cuisineMatchedRecipes) {
      const recipe1Data = recipe1 as unknown;
      const matchingRecipe = elementalMatchedRecipes.find((r: Record<string, unknown>) => r?.name === recipe1Data?.name);
      if (matchingRecipe) {
        const matchingRecipeData = matchingRecipe as unknown;
        const baseScore = Math.max(Number(recipe1Data?.matchScore) || 0, Number(matchingRecipeData?.matchScore) || 0);
        const secondScore = Math.min(Number(recipe1Data?.matchScore) || 0, Number(matchingRecipeData?.matchScore) || 0);
        const randomFactor = 0.95 + (Math.random() * 0.1);
        const enhancedScore = Math.min(1.0, (baseScore * 0.7 + secondScore * 0.5 + 0.15) * randomFactor);
        
        combined.push({
          ...recipe1Data, 
          matchScore: enhancedScore,
          dualMatch: true
        });
        recipeIds.add(recipe1Data?.name);
      }
    }
    
    // Add remaining cuisine-matched recipes
    for (const recipe of cuisineMatchedRecipes) {
      const recipeData = recipe as unknown;
      if (!recipeIds.has(recipeData?.name)) {
        const baseScore = Math.pow(recipeData?.matchScore || 0, 0.8);
        const randomFactor = 0.9 + (Math.random() * 0.2);
        const finalScore = Math.max(baseScore * randomFactor, 0.35);
        
        combined.push({
          ...recipeData, 
          matchScore: Math.min(finalScore, 0.92),
          cuisineMatch: true
        });
        recipeIds.add(recipeData?.name);
      }
    }
    
    // Add remaining elemental-matched recipes
    for (const recipe of elementalMatchedRecipes) {
      const recipeData = recipe as unknown;
      if (!recipeIds.has(recipeData?.name)) {
        const baseScore = recipeData?.matchScore || 0;
        const sigmoidScore = baseScore < 0.5 
          ? baseScore * 1.4 
          : 0.7 + (baseScore - 0.5) * 0.6;
        const randomFactor = 0.9 + (Math.random() * 0.2);
        const finalScore = Math.min(Math.max(sigmoidScore * randomFactor, 0.3), 0.85);
        
        combined.push({
          ...recipeData, 
          matchScore: finalScore,
          elementalMatch: true
        });
        recipeIds.add(recipeData?.name);
      }
    }
    
    // Sort by match score
    combined.sort((a, b) => (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0));
    
    return combined;

  }, [cuisine, elementalState]); // Dependencies: cuisine object and elementalState

  // Only render content when we have the ID and cuisine data
  if (!id) {
    return <div>Loading...</div>;
  }

  if (!cuisine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cuisine not found</h1>
        <p>The cuisine you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {cuisine?.name || id as string} Cuisine
      </h1>
      
      <div className="mb-8">
        {cuisine?.description && (
          <p className="text-lg text-gray-700 mb-4">{cuisine.description}</p>
        )}
        
        {cuisine?.history && (
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">Historical Context</h2>
            <p className="text-gray-800">{cuisine.history}</p>
          </div>
        )}
        
        {cuisine?.culturalImportance && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">Cultural Significance</h2>
            <p className="text-gray-800">{cuisine.culturalImportance}</p>
          </div>
        )}
      </div>
      
      <CuisineSection 
        cuisine={cuisine?.name || id as string} 
        recipes={combinedRecipes} // Pass the memoized recipes
        elementalState={elementalState}
      />
    </div>
  );
};

export default CuisineDetailsPage; 
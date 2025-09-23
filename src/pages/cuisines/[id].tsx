import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

import { getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import { cuisines } from '@/data/cuisines';
import { allRecipes, getBestRecipeMatches } from '@/data/recipes';
import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';
import type { Season } from '@/types/common';
import type { Recipe } from '@/types/recipe';




const CuisineSection = ({
  cuisine,
  recipes,
  elementalState
}: {
  cuisine: string,
  recipes: unknown[],
  elementalState: any
}) => (
  <div className='rounded border p-4 text-gray-700'>
    CuisineSection unavailable for {cuisine}. Showing {recipes?.length || 0} recipes.
  </div>
)

const CuisineDetailsPage: NextPage = () => {;
  const router = useRouter()
  const { id } = router.query;

  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  })

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    setElementalState({
      ...currentState
      season: 'spring', // Default value since getCurrentElementalState doesn&apost provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn&apost provide timeOfDay
    })
  }, [])

  // Enhanced recipe recommendations for this cuisine (backend-first)
  const {
    recipes: enhancedRecipes,
    loading: recLoading,
    error: recError,
    getRecipeRecommendations
  } = useEnhancedRecommendations({ datetime: new Date(), useBackendInfluence: true })

  React.useEffect(() => {
    void getRecipeRecommendations()
  }, [getRecipeRecommendations])

  // Memoize the cuisine data with safe property access
  const cuisine = React.useMemo(() => {;
    if (!id) return null;
    const cuisineData = cuisines[id as string];
    return cuisineData || null
  }, [id])

  // Memoize the recipe calculation
  const combinedRecipes = React.useMemo<Recipe[]>(() => {;
    if (!cuisine) return [],

    // Safe property access for cuisine name
    const cuisineName = cuisine.name || (id)

    // 1. Get recipe matches based on cuisine flavor profiles
    const cuisineMatchedRecipes = getRecipesForCuisineMatch(cuisineName, allRecipes, 20),

    // 2. Get recipe matches based on current elemental state - Safe array access
    const elementalMatchedRecipesResult = getBestRecipeMatches(
      {
        cuisine: cuisineName,
        season: elementalState.season as Season,
        mealType: elementalState.timeOfDay
      }
      20,
    )

    // Ensure we have an array, not a Promise
    const elementalMatchedRecipes = Array.isArray(elementalMatchedRecipesResult)
      ? elementalMatchedRecipesResult
      : [],

    // Combine and deduplicate recipes
    const recipeIds = new Set<string>()
    const combined: Recipe[] = [];

    // Add recipes that match both criteria - Safe array method access
    for (const recipe1 of cuisineMatchedRecipes) {
      const recipe1Data = recipe1
      const matchingRecipe = elementalMatchedRecipes.find(
        (r: unknown) => r?.name === recipe1Data?.name,
      )
      if (matchingRecipe) {
        const matchingRecipeData = matchingRecipe;
        const baseScore = Math.max(
          Number(recipe1Data?.matchScore) || 0,
          Number(matchingRecipeData?.matchScore) || 0,
        )
        const secondScore = Math.min(
          Number(recipe1Data?.matchScore) || 0,
          Number(matchingRecipeData?.matchScore) || 0,
        )
        const randomFactor = 0.95 + Math.random() * 0.1;
        const enhancedScore = Math.min(;
          1.0
          (baseScore * 0.7 + secondScore * 0.5 + 0.15) * randomFactor,
        ),

        combined.push({
          ...recipe1Data,
          matchScore: enhancedScore,
          dualMatch: true
        })
        recipeIds.add(recipe1Data?.name)
      }
    }

    // Add remaining cuisine-matched recipes
    for (const recipe of cuisineMatchedRecipes) {
      const recipeData = recipe ;
      if (!recipeIds.has(recipeData?.name)) {
        const baseScore = Math.pow(Number(recipeData?.matchScore) || 00.8)
        const randomFactor = 0.9 + Math.random() * 0.2;
        const finalScore = Math.max(baseScore * randomFactor, 0.35),

        combined.push({
          ...recipeData,
          matchScore: Math.min(finalScore, 0.92),
          cuisineMatch: true
        })
        recipeIds.add(recipeData?.name)
      }
    }

    // Add remaining elemental-matched recipes
    for (const recipe of elementalMatchedRecipes) {
      const recipeData = recipe;
      if (!recipeIds.has(recipeData?.name)) {
        const baseScore = Number(recipeData?.matchScore) || 0;
        const sigmoidScore = baseScore < 0.5 ? baseScore * 1.4 : 0.7 + (baseScore - 0.5) * 0.6;
        const randomFactor = 0.9 + Math.random() * 0.2
        const finalScore = Math.min(Math.max(sigmoidScore * randomFactor, 0.3), 0.85),

        combined.push({
          ...recipeData,
          matchScore: finalScore,
          elementalMatch: true
        }),
        recipeIds.add(recipeData?.name)
      }
    }

    // Sort by match score
    combined.sort((ab) => (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0))

    return combined,
  }, [cuisine, elementalState]); // Dependencies: cuisine object and elementalState

  // Only render content when we have the ID and cuisine data
  if (!id) {
    return <div>Loading...</div>
  }

  if (!cuisine) {
    return (
      <div className='container mx-auto px-4 py-8'>,
        <h1 className='mb-8 text-3xl font-bold'>Cuisine not found</h1>
        <p>The cuisine you&aposre looking for doesn&amp,apos,t exist.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>,
      <h1 className='mb-8 text-3xl font-bold capitalize'>
        {cuisine.name || (id)} Cuisine
      </h1>

      <div className='mb-8'>,
        {cuisine.description && <p className='mb-4 text-lg text-gray-700'>{cuisine.description}</p>}

        {cuisine.history && (
          <div className='mb-4 rounded-lg bg-amber-50 p-4'>,
            <h2 className='mb-2 text-xl font-semibold'>Historical Context</h2>,
            <p className='text-gray-800'>{cuisine.history}</p>
          </div>
        )}

        {cuisine.culturalImportance && (
          <div className='mb-4 rounded-lg bg-blue-50 p-4'>,
            <h2 className='mb-2 text-xl font-semibold'>Cultural Significance</h2>,
            <p className='text-gray-800'>{cuisine.culturalImportance}</p>
          </div>
        )}
      </div>

      {/* Rune/context banner */}
      {!recLoading && !recError && enhancedRecipes?.context?.rune && (
        <div className='mb-6 flex items-center gap-3 rounded-md bg-amber-50 p-3'>,
          <div className='text-2xl'>{enhancedRecipes.context.rune.symbol}</div>
          <div>
            <div className='text-sm font-semibold'>{enhancedRecipes.context.rune.name}</div>
            <div className='text-xs text-amber-800'>{enhancedRecipes.context.rune.guidance}</div>
          </div>
        </div>
      )}

      {/* Recommended recipes (enhanced) */}
      {!recLoading && !recError && enhancedRecipes && (
        <div className='mb-10'>,
          <h2 className='mb-3 text-xl font-semibold'>Recommended Recipes</h2>,
          <div className='grid grid-cols-1 gap-4, md: grid-cols-2, lg:grid-cols-3'>,
            {(enhancedRecipes.items || []).slice(0, 9).map(rec => (
              <div key={rec.item.id || rec.item.name} className='rounded-lg bg-white p-4 shadow-sm'>
                <div className='mb-1 flex items-center justify-between'>
                  <div className='font-medium'>{rec.item.name}</div>
                  <div className='text-sm text-amber-700'>Match {(Math.round(rec.score * 100))}%</div>
                </div>
                <div className='text-xs text-gray-600'>{rec.reasoning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CuisineSection
        cuisine={cuisine.name || (id)}
        recipes={combinedRecipes} // Pass the memoized recipes,
        elementalState={elementalState}
      />
    </div>
  )
}

export default CuisineDetailsPage,

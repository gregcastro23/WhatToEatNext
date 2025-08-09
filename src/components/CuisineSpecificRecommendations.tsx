import React, { useState, useEffect } from 'react';

import { enhancedCuisineRecommender } from '@/calculations/enhancedCuisineRecommender';
import { cuisinesMap } from '@/data/cuisines';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { getTimeFactors } from '@/types/time';

import PlanetaryTimeDisplay from './PlanetaryTimeDisplay';

interface CuisineSpecificRecommendationsProps {
  cuisineName: string;
  count?: number;
  mealType?: string;
  dietaryRestrictions?: string[];
  showDetailedScores?: boolean;
}

const CuisineSpecificRecommendations: React.FC<CuisineSpecificRecommendationsProps> = ({
  cuisineName,
  count = 5,
  mealType,
  dietaryRestrictions,
  showDetailedScores = false,
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current astrological state from a custom hook
  // Apply safe type casting for astrology hook data access
  const astroHookData = useAstrologicalState() as any;
  const {
    astroState,
    loading: astroLoading,
    error: astroError,
  } = {
    astroState: astroHookData?.astroState,
    loading: astroHookData?.loading || false,
    error: astroHookData?.error,
  };

  // Get time-based factors for display - replaced with getTimeFactors function
  const timeFactors = getTimeFactors();

  useEffect(() => {
    // Get recommendations when astroState is available
    if (astroLoading) return;

    if (astroError) {
      setError('Error loading astrological data. Using default values.');
    }

    try {
      setLoading(true);
      // Get recommendations from the enhanced recommender
      const results = enhancedCuisineRecommender.getRecommendationsForCuisine(
        cuisineName,
        astroState,
        count,
        mealType,
        dietaryRestrictions,
      );

      setRecommendations(results);
      setLoading(false);
    } catch (err) {
      setError(
        `Error getting recommendations: ${err instanceof Error ? err.message : String(err)}`,
      );
      setLoading(false);
    }
  }, [astroState, astroLoading, cuisineName, count, mealType, dietaryRestrictions]);

  // Function to get color based on match percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-yellow-600';
  };

  // Function to format score for display
  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  // Function to determine if a planet is favorable/unfavorable for a recipe
  const getPlanetaryAlignment = (recipe: unknown, _planetName: string) => {
    // Apply safe type casting for recipe property access
    const recipeData = recipe as any;
    if ((recipeData?.planetaryDayScore || 0) >= 0.7) return 'favorable';
    if ((recipeData?.planetaryDayScore || 0) <= 0.3) return 'unfavorable';
    return 'neutral';
  };

  if (loading || astroLoading) {
    return <div className='p-4 text-center'>Loading recommendations...</div>;
  }

  if (error || recommendations.length === 0) {
    return (
      <div className='p-4 text-center text-red-500'>
        {error || `No recommendations found for ${cuisineName} cuisine.`}
      </div>
    );
  }

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <h2 className='mb-2 text-xl font-semibold'>Personalized {cuisineName} Recommendations</h2>
        <div className='mb-4 text-sm text-gray-600'>
          <PlanetaryTimeDisplay />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {recommendations.map(recipe => (
          <div
            key={recipe.recipeId}
            className='rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md'
          >
            <h3 className='mb-2 text-lg font-medium'>{recipe.recipeName}</h3>
            <div className={`text-lg font-bold ${getMatchColor(recipe.matchPercentage)}`}>
              {formatScore(recipe.matchPercentage)}% Match
            </div>

            {/* Planetary influence badges */}
            <div className='mt-2 flex flex-wrap gap-1'>
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs ${
                  recipe.planetaryDayScore >= 0.7
                    ? 'bg-green-100 text-green-800'
                    : recipe.planetaryDayScore <= 0.3
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {timeFactors.planetaryDay.planet} Day{' '}
                {recipe.planetaryDayScore >= 0.7 ? '✓' : recipe.planetaryDayScore <= 0.3 ? '✗' : ''}
              </span>

              <span
                className={`inline-block rounded-full px-2 py-1 text-xs ${
                  recipe.planetaryHourScore >= 0.7
                    ? 'bg-green-100 text-green-800'
                    : recipe.planetaryHourScore <= 0.3
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {timeFactors.planetaryHour.planet} Hour{' '}
                {recipe.planetaryHourScore >= 0.7
                  ? '✓'
                  : recipe.planetaryHourScore <= 0.3
                    ? '✗'
                    : ''}
              </span>
            </div>

            <p className='mb-3 mt-2 text-gray-600'>{recipe.description}</p>

            {showDetailedScores && (
              <div className='mt-3 text-sm'>
                <h4 className='mb-1 font-medium'>Match Details:</h4>
                <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                  <span className='text-gray-600'>Seasonal:</span>
                  <span className='text-right'>{formatScore(recipe.seasonalScore)}%</span>

                  <span className='text-gray-600'>Planetary Day:</span>
                  <span className='text-right'>{formatScore(recipe.planetaryDayScore)}%</span>

                  <span className='text-gray-600'>Planetary Hour:</span>
                  <span className='text-right'>{formatScore(recipe.planetaryHourScore)}%</span>

                  <span className='text-gray-600'>Elemental:</span>
                  <span className='text-right'>{formatScore(recipe.elementalScore)}%</span>

                  <span className='text-gray-600'>Astrological:</span>
                  <span className='text-right'>{formatScore(recipe.astrologicalScore)}%</span>

                  <span className='text-gray-600'>Time of Day:</span>
                  <span className='text-right'>{formatScore(recipe.timeOfDayScore)}%</span>
                </div>
              </div>
            )}

            <div className='mt-3'>
              <h4 className='mb-1 font-medium'>Key Ingredients:</h4>
              <div className='flex flex-wrap gap-1'>
                {recipe.ingredients &&
                  recipe.ingredients.slice(0, 3).map((ingredient: unknown, idx: number) => {
                    // Apply safe type casting for ingredient property access
                    const ingredientData = ingredient as any;
                    return (
                      <span
                        key={idx}
                        className='inline-block rounded-full bg-gray-100 px-2 py-1 text-xs'
                      >
                        {ingredientData?.name || 'Unknown'}
                      </span>
                    );
                  })}
                {recipe.ingredients && recipe.ingredients.length > 3 && (
                  <span className='inline-block rounded-full bg-gray-100 px-2 py-1 text-xs'>
                    +{recipe.ingredients.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className='mt-3 flex flex-wrap gap-1'>
              {recipe.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className='inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'
                >
                  {tag}
                </span>
              ))}
              {recipe.season.includes(timeFactors.season.toLowerCase()) && (
                <span className='inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
                  In Season
                </span>
              )}
              {recipe.mealType.map((type: string, idx: number) => (
                <span
                  key={idx}
                  className='inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800'
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuisineSpecificRecommendations;

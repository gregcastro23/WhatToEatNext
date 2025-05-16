import React, { useState, useEffect } from 'react';
import @/calculations  from 'enhancedCuisineRecommender ';
import @/hooks  from 'useAstrologicalState ';
import @/data  from 'cuisines ';
import @/types  from 'time ';
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
  showDetailedScores = false
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current astrological state from a custom hook
  const { astroState, loading: astroLoading, error: astroError } = useAstrologicalState();
  
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
        dietaryRestrictions
      );
      
      setRecommendations(results);
      setLoading(false);
    } catch (err) {
      setError(`Error getting recommendations: ${err instanceof Error ? err.message : String(err)}`);
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

  // Function to determine if a planet is favorable / (unfavorable || 1) for a recipe
  const getPlanetaryAlignment = (recipe: unknown, planetName: string) => {
    if (recipe.planetaryDayScore >= 0.7) return 'favorable';
    if (recipe.planetaryDayScore <= 0.3) return 'unfavorable';
    return 'neutral';
  };
  
  if (loading || astroLoading) {
    return <div className="p-4 text-center">Loading recommendations...</div>;
  }
  
  if (error || recommendations.length === 0) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || `No recommendations found for ${cuisineName} cuisine.`}
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Personalized {cuisineName} Recommendations</h2>
        <div className="text-sm text-gray-600 mb-4">
          <PlanetaryTimeDisplay />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(recipe => (
          <div key={recipe.recipeId} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium mb-2">{recipe.recipeName}</h3>
            <div className={`text-lg font-bold ${getMatchColor(recipe.matchPercentage)}`}>
              {formatScore(recipe.matchPercentage)}% Match
            </div>
            
            {/* Planetary influence badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                recipe.planetaryDayScore >= 0.7 ? 'bg-green-100 text-green-800' :
                recipe.planetaryDayScore <= 0.3 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {timeFactors.planetaryDay.planet} Day {recipe.planetaryDayScore >= 0.7 ? '✓' : recipe.planetaryDayScore <= 0.3 ? '✗' : ''}
              </span>
              
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                recipe.planetaryHourScore >= 0.7 ? 'bg-green-100 text-green-800' :
                recipe.planetaryHourScore <= 0.3 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {timeFactors.planetaryHour.planet} Hour {recipe.planetaryHourScore >= 0.7 ? '✓' : recipe.planetaryHourScore <= 0.3 ? '✗' : ''}
              </span>
            </div>
            
            <p className="text-gray-600 mt-2 mb-3">{recipe.description}</p>
            
            {showDetailedScores && (
              <div className="mt-3 text-sm">
                <h4 className="font-medium mb-1">Match Details:</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span className="text-gray-600">Seasonal:</span>
                  <span className="text-right">{formatScore(recipe.seasonalScore)}%</span>
                  
                  <span className="text-gray-600">Planetary Day:</span>
                  <span className="text-right">{formatScore(recipe.planetaryDayScore)}%</span>
                  
                  <span className="text-gray-600">Planetary Hour:</span>
                  <span className="text-right">{formatScore(recipe.planetaryHourScore)}%</span>
                  
                  <span className="text-gray-600">Elemental:</span>
                  <span className="text-right">{formatScore(recipe.elementalScore)}%</span>
                  
                  <span className="text-gray-600">Astrological:</span>
                  <span className="text-right">{formatScore(recipe.astrologicalScore)}%</span>
                  
                  <span className="text-gray-600">Time of Day:</span>
                  <span className="text-right">{formatScore(recipe.timeOfDayScore)}%</span>
                </div>
              </div>
            )}
            
            <div className="mt-3">
              <h4 className="font-medium mb-1">Key Ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients && recipe.ingredients.slice(0, 3).map((ingredient: unknown, idx: number) => (
                  <span 
                    key={idx} 
                    className="inline-block px-2 py-1 rounded-full bg-gray-100 text-xs"
                  >
                    {ingredient.name}
                  </span>
                ))}
                {recipe.ingredients && recipe.ingredients.length > 3 && (
                  <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-xs">
                    +{recipe.ingredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {recipe.tags.map((tag: string, idx: number) => (
                <span 
                  key={idx} 
                  className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                >
                  {tag}
                </span>
              ))}
              {recipe.season.includes(timeFactors.season.toLowerCase()) && (
                <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                  In Season
                </span>
              )}
              {recipe.mealType.map((type: string, idx: number) => (
                <span 
                  key={idx} 
                  className="inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs"
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
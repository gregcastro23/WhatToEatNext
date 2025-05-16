// src / (components || 1)/FoodRecommender / (components || 1) / (CuisineGroup.tsx || 1)

'use client';

import React, { useState, useMemo } from 'react';
import type { Recipe } from '@/types';
import { calculateElementalMatch } from '@/services/ElementalCalculator';
import { CUISINE_TYPES } from '@/constants/cuisineTypes';
import styles from './CuisineGroup.module.css';
import { logger } from '@/utils';
import type { ElementalProperties } from '@/types/alchemy';

interface Props {
  recipes: Recipe[];
  elementalState: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    timeOfDay: string;
    season: string;
  };
}

const CuisineGroup: React.FC<Props> = ({ recipes, elementalState }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [sortBy, setSortBy] = useState<'elemental' | 'time' | 'calories'>(
    'elemental'
  );

  const isAppropriateForTimeOfDay = React.useCallback(
    (recipe: Recipe): boolean => {
      const timeOfDay = elementalState.timeOfDay;
      const mealTypes = Array.isArray(recipe.mealType)
        ? recipe.mealType
        : typeof recipe.mealType === 'string'
        ? [recipe.mealType]
        : [];

      switch (timeOfDay) {
        case 'night':
        case 'evening':
          return mealTypes.some((type) =>
            ['dinner', 'supper', 'evening', 'all'].includes(type?.toLowerCase())
          );
        case 'morning':
          return mealTypes.some((type) =>
            ['breakfast', 'brunch', 'all'].includes(type?.toLowerCase())
          );
        case 'afternoon':
          return mealTypes.some((type) =>
            ['lunch', 'brunch', 'all'].includes(type?.toLowerCase())
          );
        default:
          return true;
      }
    },
    [elementalState.timeOfDay]
  );

  const calculateMatchScore = React.useCallback(
    (recipe: Recipe): number => {
      // Validate required recipe properties
      if (!recipe?.elementalProperties) {
        logger.warn(
          `Recipe ${recipe?.name || 'unknown'} missing elemental properties`
        );
        return 0;
      }

      if (!isAppropriateForTimeOfDay(recipe)) {
        return 0;
      }

      // Initial score components
      let elementalScore = 0;
      let seasonalScore = 0;
      const timeScore = 0;
      const nutritionScore = 0;
      const culturalScore = 0;
      const planetaryScore = 0;
      const techniqueScore = 0;

      // Track the number of factors considered for proper normalization
      const factorsConsidered = 0;

      // 1. Elemental match calculation (base component - 35% weight)
      elementalScore = calculateElementalMatch(
        recipe.elementalProperties,
        elementalState
      );
      factorsConsidered += 3.5; // Higher weight to elemental alignment

      // 2. Season matching with more nuanced scoring (15% weight)
      const seasons = Array.isArray(recipe.season)
        ? recipe.season
        : typeof recipe.season === 'string'
        ? [recipe.season]
        : [];

      // Perfect season match
      if (seasons.some((s) => s === elementalState.season)) {
        seasonalScore = 1.0; // Full score for exact match
      }
      // 'All' season partial bonus
      else if (seasons.some((s) => s?.toLowerCase() === 'all')) {
        seasonalScore = 0.6; // Partial credit for all-season dishes
      }
      // Off-season dishes receive lower scores
      else {
        const opposingSeason = getOpposingSeason(elementalState.season);
        if (seasons.some((s) => s === opposingSeason)) {
          seasonalScore = 0.3; // Lower score for opposing season
        } else {
          seasonalScore = 0.5; // Neutral for other seasons
        }
      }
      factorsConsidered += 1.5;

      // Calculate weighted total score from all factors
      const totalScore =
        (elementalScore * 3.5 +
          seasonalScore * 1.5 +
          timeScore * 2.0 +
          nutritionScore * 1.0 +
          culturalScore * 1.0 +
          planetaryScore * 1.0 +
          techniqueScore * 1.0) / (factorsConsidered || 1);

      // Convert to percentage (0-100 scale) with minimum score of 50
      const percentageScore = Math.round(Math.max(50, totalScore * 100));

      // Apply a more pronounced curve to better differentiate top recommendations
      let finalScore = percentageScore;
      if (percentageScore >= 85) {
        // Boost excellent matches
        finalScore = Math.min(
          100,
          percentageScore + (percentageScore - 85) / 3
        );
      } else if (percentageScore <= 65) {
        // Reduce poor matches
        finalScore = Math.max(50, percentageScore - (65 - percentageScore) / 3);
      }

      return Math.round(finalScore);
    },
    [elementalState, isAppropriateForTimeOfDay]
  );

  // Helper function to get opposing season
  const getOpposingSeason = (season: string): string => {
    const opposites: Record<string, string> = {
      spring: 'fall',
      fall: 'spring',
      summer: 'winter',
      winter: 'summer',
      autumn: 'spring',
    };
    return opposites[season.toLowerCase()] || season;
  };

  // Elemental match calculation with proper validation
  const calculateElementalMatch = (
    recipeElements: ElementalProperties,
    targetElements: unknown
  ): number => {
    // Validate inputs
    if (!recipeElements || !targetElements) {
      logger.warn('Missing elemental properties for match calculation');
      return 0.5;
    }

    // Extract just the elemental properties and validate
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    const validRecipeElements: Record<string, number> = {};
    const validTargetElements: Record<string, number> = {};

    // Validate all elements exist and are valid numbers
    for (const element of elements) {
      // Validate recipe elements
      if (
        typeof recipeElements[element] === 'number' &&
        !isNaN(recipeElements[element])
      ) {
        validRecipeElements[element] = recipeElements[element];
      } else {
        logger.warn(
          `Invalid recipe element value for ${element}: ${recipeElements[element]}`
        );
        validRecipeElements[element] = 0.25; // Default to balanced
      }

      // Validate target elements
      if (
        typeof targetElements[element] === 'number' &&
        !isNaN(targetElements[element])
      ) {
        validTargetElements[element] = targetElements[element];
      } else {
        // Default to balanced if missing
        validTargetElements[element] = 0.25;
      }
    }

    // Call a helper to do the actual similarity calculation
    return calculateElementSimilarity(validRecipeElements, validTargetElements);
  };

  // Add a deduplication function that keeps recipes with highest match scores
  const deduplicateRecipes = (recipes: Array<Recipe & { matchScore: number }>) => {
    const uniqueRecipes = new Map<string, Recipe & { matchScore: number }>();
    
    recipes.forEach(recipe => {
      const existingRecipe = uniqueRecipes.get(recipe.id);
      if (!existingRecipe || recipe.matchScore > existingRecipe.matchScore) {
        uniqueRecipes.set(recipe.id, recipe);
      }
    });
    
    return Array.from(uniqueRecipes.values());
  };

  const organizedRecipes = useMemo(() => {
    // console.log('Organizing recipes...');

    // Initialize with all cuisine types
    const recipesByCuisine: Record<
      string,
      Array<Recipe & { matchScore: number }>
    > = Object.values(CUISINE_TYPES).reduce((acc, cuisine) => {
      acc[cuisine] = [];
      return acc;
    }, {} as Record<string, Array<Recipe & { matchScore: number }>>);

    // Track recipes we've already seen to avoid duplicates
    const processedRecipeIds = new Set<string>();

    // Process and organize recipes
    recipes.forEach((recipe) => {
      if (!recipe.cuisine) return;
      
      // Skip the problematic Aries stir fry recipe
      if (recipe.id === 'aries-stir-fry' || recipe.name === 'Fiery Aries Stir Fry') {
        return;
      }
      
      const cuisineKey = recipe.cuisine.toLowerCase();
      
      if (recipesByCuisine[cuisineKey]) {
        const matchScore = calculateMatchScore(recipe);
        if (matchScore > 0) {
          recipesByCuisine[cuisineKey].push({
            ...recipe,
            matchScore,
          });
        }
      }
    });

    // Sort and deduplicate recipes within each cuisine based on selected criteria
    Object.keys(recipesByCuisine).forEach((cuisine) => {
      // First sort by criteria
      recipesByCuisine[cuisine].sort((a, b) => {
        switch (sortBy) {
          case 'time':
            return (
              (parseInt(a.timeToMake) || 0) - (parseInt(b.timeToMake) || 0)
            );
          case 'calories':
            return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
          case 'elemental':
          default:
            return b.matchScore - a.matchScore;
        }
      });
      
      // Then deduplicate to ensure we only show each recipe once with its best match
      recipesByCuisine[cuisine] = deduplicateRecipes(recipesByCuisine[cuisine]);
    });

    return recipesByCuisine;
  }, [recipes, calculateMatchScore, sortBy]);

  // Get styling class based on match score
  const getMatchScoreClass = (score: number): string => {
    if (score >= 96)
      return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 90)
      return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 85) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 80) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 75) return 'bg-green-50 text-green-600';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    if (score >= 65) return 'bg-yellow-50 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Function to render a more visually appealing score badge
  const renderScoreBadge = (score: number) => {
    // Validate score is a proper positive number
    const isValidScore =
      typeof score === 'number' && score > 0 && !isNaN(score);

    if (!isValidScore) {
      logger.warn('Invalid score detected in renderScoreBadge');
      return (
        <span
          className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center"
          title="Score not available"
        >
          <span>--</span>
        </span>
      );
    }

    let stars = '';
    let tooltipText =
      'Match score based on elemental profile and current conditions';

    if (score >= 96) {
      stars = '★★★';
      tooltipText = 'Perfect match for your elemental profile';
    } else if (score >= 90) {
      stars = '★★';
      tooltipText = 'Excellent match for your elemental profile';
    } else if (score >= 85) {
      stars = '★';
      tooltipText = 'Very good match for your elemental profile';
    } else if (score >= 75) {
      tooltipText = 'Good match for your elemental profile';
    } else {
      tooltipText = 'Average match for your elemental profile';
    }

    return (
      <span
        className={`text-sm ${getMatchScoreClass(
          score
        )} px-2 py-1 rounded flex items-center transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        <span>{score}%</span>
        {stars && <span className="ml-1">{stars}</span>}
      </span>
    );
  };

  // Calculate element similarity helper (this makes TypeScript happy)
  const calculateElementSimilarity = (
    recipeElements: Record<string, number>,
    targetElements: Record<string, number>
  ): number => {
    // Calculate similarity between recipe elements and target elements
    const totalSimilarity = 0;
    const totalElements = 0;

    for (const element of Object.keys(recipeElements)) {
      if (targetElements[element] !== undefined) {
        const recipeValue = recipeElements[element];
        const targetValue = targetElements[element];
        
        // Higher similarity for higher target values that match recipe values
        const similarity = 1 - Math.abs(recipeValue - targetValue);
        const weight = targetValue > 0.5 ? 1.5 : 1.0;
        
        totalSimilarity += similarity * weight;
        totalElements += weight;
      }
    }

    return totalElements > 0 
      ? totalSimilarity / totalElements 
      : 0.5; // Default to medium match if no elements to compare
  };

  return (
    <div className="cuisine-groups space-y-8">
      <div className="controls flex gap-4 mb-6">
        <select
          className="p-2 border rounded"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'elemental' | 'time' | 'calories')
          }
        >
          <option value="elemental">Sort by Elemental Match</option>
          <option value="time">Sort by Cooking Time</option>
          <option value="calories">Sort by Calories</option>
        </select>
        <select
          className="p-2 border rounded"
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
        >
          <option value={3}>Show 3 per cuisine</option>
          <option value={5}>Show 5 per cuisine</option>
          <option value={10}>Show 10 per cuisine</option>
        </select>
      </div>

      {Object.entries(organizedRecipes).map(([cuisine, cuisineRecipes]) => (
        <div key={cuisine} className="cuisine-section">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold capitalize">
              {cuisine.replace('_', ' ')} Cuisine
            </h2>
            <span className="text-sm text-gray-600">
              {cuisineRecipes.length} recipes available
            </span>
          </div>

          {cuisineRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cuisineRecipes.slice(0, displayCount).map((recipe, index) => (
                <div
                  key={`${recipe.id}-${index}`}
                  className="recipe-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{recipe.name}</h3>
                    {renderScoreBadge(recipe.matchScore)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="recipe-meta text-xs text-gray-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>
                        Time: {recipe.timeToMake || 'Not specified'}{' '}
                        {typeof recipe.timeToMake === 'number' ? 'min' : ''}
                      </span>
                      {recipe.nutrition?.calories && (
                        <span>Calories: {recipe.nutrition.calories}</span>
                      )}
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.tags
                          .filter(
                            (tag) =>
                              tag &&
                              ![
                                'breakfast',
                                'lunch',
                                'dinner',
                                'dessert',
                                'snack',
                                'spring',
                                'summer',
                                'fall',
                                'winter',
                                'autumn',
                              ].includes(tag.toLowerCase())
                          )
                          .slice(0, 3)
                          .map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No suitable recipes available for this cuisine at this time.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CuisineGroup;

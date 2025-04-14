// src/components/FoodRecommender/components/CuisineGroup.tsx

'use client'

import React, { useState, useMemo } from 'react';
import type { Recipe } from '@/types/recipe';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { CUISINE_TYPES } from '@/constants/cuisineTypes';
import styles from './CuisineGroup.module.css';
import { logger } from '@/utils/logger';
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
    const [sortBy, setSortBy] = useState<'elemental' | 'time' | 'calories'>('elemental');

    const isAppropriateForTimeOfDay = React.useCallback((recipe: Recipe): boolean => {
        const timeOfDay = elementalState.timeOfDay;
        const mealTypes = Array.isArray(recipe.mealType) 
            ? recipe.mealType 
            : typeof recipe.mealType === 'string'
                ? [recipe.mealType]
                : [];

        switch(timeOfDay) {
            case 'night':
            case 'evening':
                return mealTypes.some(type => 
                    ['dinner', 'supper', 'evening', 'all'].includes(type?.toLowerCase())
                );
            case 'morning':
                return mealTypes.some(type => 
                    ['breakfast', 'brunch', 'all'].includes(type?.toLowerCase())
                );
            case 'afternoon':
                return mealTypes.some(type => 
                    ['lunch', 'brunch', 'all'].includes(type?.toLowerCase())
                );
            default:
                return true;
        }
    }, [elementalState.timeOfDay]);

    const calculateMatchScore = React.useCallback((recipe: Recipe): number => {
        // Validate required recipe properties
        if (!recipe?.elementalProperties) {
            logger.warn(`Recipe ${recipe?.name || 'unknown'} missing elemental properties`);
            return 0;
        }
        
        if (!isAppropriateForTimeOfDay(recipe)) {
            return 0;
        }

        // Initial score components
        let elementalScore = 0;
        let seasonalScore = 0;
        let timeScore = 0;
        let nutritionScore = 0;
        let culturalScore = 0;
        let planetaryScore = 0;
        let techniqueScore = 0;
        
        // Track the number of factors considered for proper normalization
        let factorsConsidered = 0;
        
        // 1. Elemental match calculation (base component - 35% weight)
        elementalScore = calculateElementalMatch(recipe.elementalProperties, elementalState);
        factorsConsidered += 3.5; // Higher weight to elemental alignment
        
        // 2. Season matching with more nuanced scoring (15% weight)
        const seasons = Array.isArray(recipe.season) 
            ? recipe.season 
            : typeof recipe.season === 'string'
                ? [recipe.season]
                : [];

        // Perfect season match
        if (seasons.some(s => s === elementalState.season)) {
            seasonalScore = 1.0; // Full score for exact match
        }
        // 'All' season partial bonus
        else if (seasons.some(s => s?.toLowerCase() === 'all')) {
            seasonalScore = 0.6; // Partial credit for all-season dishes
        }
        // Off-season dishes receive lower scores
        else {
            const opposingSeason = getOpposingSeason(elementalState.season);
            if (seasons.some(s => s === opposingSeason)) {
                seasonalScore = 0.3; // Lower score for opposing season
            } else {
                seasonalScore = 0.5; // Neutral for other seasons
            }
        }
        factorsConsidered += 1.5;
        
        // Calculate weighted total score from all factors
        const totalScore = (
            (elementalScore * 3.5) +
            (seasonalScore * 1.5) +
            (timeScore * 2.0) +
            (nutritionScore * 1.0) +
            (culturalScore * 1.0) +
            (planetaryScore * 1.0) +
            (techniqueScore * 1.0)
        ) / factorsConsidered;
        
        // Convert to percentage (0-100 scale) with minimum score of 50
        const percentageScore = Math.round(Math.max(50, totalScore * 100));
        
        // Apply a more pronounced curve to better differentiate top recommendations
        let finalScore = percentageScore;
        if (percentageScore >= 85) {
            // Boost excellent matches
            finalScore = Math.min(100, percentageScore + (percentageScore - 85) / 3);
        } else if (percentageScore <= 65) {
            // Reduce poor matches
            finalScore = Math.max(50, percentageScore - (65 - percentageScore) / 3);
        }
        
        return Math.round(finalScore);
    }, [elementalState, isAppropriateForTimeOfDay]);

    // Helper function to get opposing season
    const getOpposingSeason = (season: string): string => {
        const opposites: Record<string, string> = {
            'spring': 'fall',
            'fall': 'spring',
            'summer': 'winter',
            'winter': 'summer',
            'autumn': 'spring'
        };
        return opposites[season.toLowerCase()] || season;
    };

    // Elemental match calculation with proper validation
    const calculateElementalMatch = (
        recipeElements: ElementalProperties,
        targetElements: any
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
            if (typeof recipeElements[element] === 'number' && !isNaN(recipeElements[element])) {
                validRecipeElements[element] = recipeElements[element];
            } else {
                logger.warn(`Invalid recipe element value for ${element}: ${recipeElements[element]}`);
                validRecipeElements[element] = 0.25; // Default to balanced
            }
            
            // Validate target elements
            if (typeof targetElements[element] === 'number' && !isNaN(targetElements[element])) {
                validTargetElements[element] = targetElements[element];
            } else {
                logger.warn(`Invalid target element value for ${element}: ${targetElements[element]}`);
                validTargetElements[element] = 0.25; // Default to balanced
            }
        }
        
        // Calculate similarity using validated data
        let totalSimilarity = 0;
        let count = 0;
        
        for (const element of elements) {
            const recipeValue = validRecipeElements[element];
            const targetValue = validTargetElements[element];
            
            // For very close matches, give extra credit
            const difference = Math.abs(recipeValue - targetValue);
            let similarity = 0;
            
            if (difference < 0.1) {
                // Excellent match (90-100% similarity)
                similarity = 1 - (difference * 0.5);
            } else if (difference < 0.2) {
                // Good match (80-90% similarity)
                similarity = 0.9 - (difference - 0.1) * 1;
            } else if (difference < 0.3) {
                // Decent match (70-80% similarity)
                similarity = 0.8 - (difference - 0.2) * 1;
            } else {
                // Basic linear scaling for larger differences
                similarity = Math.max(0.5, 1 - difference);
            }
            
            // Weight by the target element's importance
            const elementWeight = targetValue > 0.3 ? 1.5 : 1.0;
            totalSimilarity += similarity * elementWeight;
            count += elementWeight;
        }
        
        // Return normalized score - guaranteed to be valid due to input validation
        return count > 0 ? Math.min(1, Math.max(0, totalSimilarity / count)) : 0.5;
    };

    const calculatePlanetaryHour = (date: Date, isDaytime: boolean): string => {
        // Simple implementation based on traditional planetary hours
        const daysOfWeek = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const dayRulers = {
            0: 'Sun',     // Sunday
            1: 'Moon',    // Monday
            2: 'Mars',    // Tuesday
            3: 'Mercury', // Wednesday
            4: 'Jupiter', // Thursday
            5: 'Venus',   // Friday
            6: 'Saturn'   // Saturday
        };
        
        const day = date.getDay();
        const hour = date.getHours();
        
        // Map hour of day to planetary hour
        const daySequence = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
        const nightSequence = ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'];
        
        // Calculate hour index (0-11)
        const hourIndex = isDaytime 
            ? (hour - 6) % 12  // Daytime hours (6am-6pm)
            : (hour - 18 + 24) % 12;  // Nighttime hours (6pm-6am)
        
        // Get the sequence based on daytime
        const sequence = isDaytime ? daySequence : nightSequence;
        
        // Map hour index to actual planetary ruler
        return sequence[hourIndex % 7];
    };

    const organizedRecipes = useMemo(() => {
        console.log('Organizing recipes...');
        
        // Initialize with all cuisine types
        const recipesByCuisine: Record<string, Array<Recipe & { matchScore: number }>> = 
            Object.values(CUISINE_TYPES).reduce((acc, cuisine) => {
                acc[cuisine] = [];
                return acc;
            }, {} as Record<string, Array<Recipe & { matchScore: number }>>);

        // Process and organize recipes
        recipes.forEach(recipe => {
            if (!recipe.cuisine) return;
            const cuisineKey = recipe.cuisine.toLowerCase();
            if (recipesByCuisine[cuisineKey]) {
                const matchScore = calculateMatchScore(recipe);
                if (matchScore > 0) {
                    recipesByCuisine[cuisineKey].push({
                        ...recipe,
                        matchScore
                    });
                }
            }
        });

        // Sort recipes within each cuisine based on selected criteria
        Object.keys(recipesByCuisine).forEach(cuisine => {
            recipesByCuisine[cuisine].sort((a, b) => {
                switch(sortBy) {
                    case 'time':
                        return (parseInt(a.timeToMake) || 0) - (parseInt(b.timeToMake) || 0);
                    case 'calories':
                        return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
                    case 'elemental':
                    default:
                        return b.matchScore - a.matchScore;
                }
            });
        });

        return recipesByCuisine;
    }, [recipes, calculateMatchScore, sortBy]);

    // Get styling class based on match score
    const getMatchScoreClass = (score: number): string => {
        if (score >= 96) return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
        if (score >= 90) return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
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
        const isValidScore = typeof score === 'number' && score > 0 && !isNaN(score);
        
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
        let tooltipText = 'Match score based on elemental profile and current conditions';
        
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
                className={`text-sm ${getMatchScoreClass(score)} px-2 py-1 rounded flex items-center transition-all duration-300 hover:scale-105`}
                title={tooltipText}
            >
                <span>{score}%</span>
                {stars && <span className="ml-1">{stars}</span>}
            </span>
        );
    };

    return (
        <div className="cuisine-groups space-y-8">
            <div className="controls flex gap-4 mb-6">
                <select 
                    className="p-2 border rounded"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'elemental' | 'time' | 'calories')}
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
                                <div key={`${recipe.name}-${index}`} 
                                     className="recipe-card p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold">{recipe.name}</h3>
                                        {renderScoreBadge(recipe.matchScore)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                                    <div className="text-sm space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Season:</span>
                                            <span>{Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Type:</span>
                                            <span>{Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Time:</span>
                                            <span>{recipe.timeToMake}</span>
                                        </div>
                                        {recipe.nutrition?.calories && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Calories:</span>
                                                <span>{recipe.nutrition.calories}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4 border rounded">
                            No recipes available for this cuisine at this time
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CuisineGroup;
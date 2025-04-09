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
        if (!recipe?.elementalProperties) return 0;
        if (!isAppropriateForTimeOfDay(recipe)) return 0;

        try {
            // Base elemental match calculation
            const elementalScore = calculateElementalMatch(recipe.elementalProperties, elementalState);
            let score = elementalScore * 100;
            
            // Enhanced scoring factors
            const bonusFactors = {
                seasonMatch: 10,        // Season matching bonus
                timeMatch: 15,          // Perfect time of day match
                balancedNutrition: 8,   // Well-balanced nutritional profile
                quickPrep: 5,           // Quick preparation time bonus
                traditionalMatch: 7,    // Traditional for the time/season
                planetaryHour: 8        // Planetary hour influence bonus
            };

            // Season matching with more nuanced scoring
            const seasons = Array.isArray(recipe.season) 
                ? recipe.season 
                : typeof recipe.season === 'string'
                    ? [recipe.season]
                    : [];

            // Perfect season match
            if (seasons.some(s => s === elementalState.season)) {
                score += bonusFactors.seasonMatch;
            }
            // 'All' season partial bonus
            else if (seasons.some(s => s?.toLowerCase() === 'all')) {
                score += bonusFactors.seasonMatch * 0.5;
            }

            // Time of day matching with granular scoring
            const timeOfDay = elementalState.timeOfDay;
            const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];
            
            if (timeOfDay === 'morning' && mealTypes.includes('breakfast')) {
                score += bonusFactors.timeMatch;
            } else if (timeOfDay === 'afternoon' && mealTypes.includes('lunch')) {
                score += bonusFactors.timeMatch;
            } else if (['evening', 'night'].includes(timeOfDay) && mealTypes.includes('dinner')) {
                score += bonusFactors.timeMatch;
            }

            // Add planetary hour influence
            const planetaryInfluenceMap: Record<string, string[]> = {
                'Sun': ['energizing', 'vitality', 'warming', 'bright', 'spicy', 'golden'],
                'Moon': ['cooling', 'soothing', 'mild', 'creamy', 'soft', 'white'],
                'Mercury': ['light', 'quick', 'varied', 'mixed', 'fresh', 'aromatic'],
                'Venus': ['sweet', 'pleasant', 'balanced', 'fragrant', 'mild', 'rich'],
                'Mars': ['spicy', 'hot', 'bold', 'intense', 'red', 'stimulating'],
                'Jupiter': ['abundant', 'rich', 'festive', 'hearty', 'generous', 'wholesome'],
                'Saturn': ['traditional', 'preserved', 'aged', 'structured', 'dense', 'earthy']
            };

            // Get current planetary hour
            const currentHour = new Date().getHours();
            const isDaytime = currentHour >= 6 && currentHour < 18;
            const planetaryHour = calculatePlanetaryHour(new Date(), isDaytime);
            
            if (planetaryHour) {
                const hourKeywords = planetaryInfluenceMap[planetaryHour] || [];
                
                // Check recipe characteristics against planetary influences
                const matchingInfluences = recipe.characteristics?.filter((char: string) => 
                    hourKeywords.some(keyword => 
                        char.toLowerCase().includes(keyword.toLowerCase())
                    )
                ) || [];

                // Add bonus for each matching characteristic
                if (matchingInfluences.length > 0) {
                    score += matchingInfluences.length * bonusFactors.planetaryHour;
                }

                // Check elemental alignment with planetary hour
                const planetaryElements: Record<string, keyof ElementalProperties> = {
                    'Sun': 'Fire',
                    'Moon': 'Water',
                    'Mercury': 'Air',
                    'Venus': 'Water',
                    'Mars': 'Fire',
                    'Jupiter': 'Air',
                    'Saturn': 'Earth'
                };

                const planetaryElement = planetaryElements[planetaryHour];
                if (planetaryElement && recipe.elementalProperties[planetaryElement] > 0.3) {
                    score += bonusFactors.planetaryHour;
                }
            }

            // Nutrition scoring with type safety
            if (recipe.nutrition) {
                const nutrition = recipe.nutrition;
                const hasBalancedNutrition = 
                    (nutrition.protein ?? 0) > 15 && 
                    (nutrition.protein ?? 0) < 40 &&
                    (nutrition.carbs ?? 0) > 30 && 
                    (nutrition.carbs ?? 0) < 65 &&
                    (nutrition.fat ?? 0) > 20 && 
                    (nutrition.fat ?? 0) < 35;
                
                if (hasBalancedNutrition) {
                    score += bonusFactors.balancedNutrition;
                }

                const calories = nutrition.calories ?? 0;
                const isAppropriateCalories = 
                    (timeOfDay === 'morning' && calories >= 300 && calories <= 500) ||
                    (timeOfDay === 'afternoon' && calories >= 400 && calories <= 700) ||
                    (timeOfDay === 'evening' && calories >= 400 && calories <= 800);
                
                if (isAppropriateCalories) {
                    score += 5;
                }
            }

            // Preparation time bonus for quick meals during busy times
            const prepTime = parseInt(recipe.timeToMake) || 0;
            if (prepTime <= 30) {
                score += bonusFactors.quickPrep;
            } else if (prepTime <= 45) {
                score += bonusFactors.quickPrep * 0.5;
            }

            // Traditional/Cultural appropriateness for time and season
            if (recipe.traditional_time_of_day === elementalState.timeOfDay ||
                recipe.traditional_season === elementalState.season) {
                score += bonusFactors.traditionalMatch;
            }

            return Math.min(100, Math.max(60, Math.round(score)));
        } catch (error) {
            logger.error(`Error scoring ${recipe.name}:`, error);
            return 0;
        }
    }, [elementalState, isAppropriateForTimeOfDay]);

    // Add proper types for the helper function
    const calculateElementalMatch = (
        recipeElements: ElementalProperties,
        targetElements: any // Change type to avoid incompatibility
    ): number => {
        if (!recipeElements || !targetElements) return 0.6;
        
        let totalSimilarity = 0;
        let count = 0;
        
        // Only use the elemental properties from targetElements
        const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
        
        for (const element of elements) {
            if (typeof recipeElements[element] === 'number' && 
                typeof targetElements[element] === 'number') {
                const difference = Math.abs(recipeElements[element] - targetElements[element]);
                const similarity = 1 - difference;
                totalSimilarity += similarity;
                count++;
            }
        }
        
        return count > 0 ? totalSimilarity / count : 0.6;
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
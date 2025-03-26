// src/components/FoodRecommender/components/CuisineGroup.tsx

'use client'

import React, { useState } from 'react';
import type { Recipe } from '@/types/recipe';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import styles from './CuisineGroup.module.css';

type Props = {
    recipes: Recipe[];
    elementalBalance: ReturnType<typeof ElementalCalculator.getCurrentElementalBalance>;
};

const CuisineGroup: React.FC<Props> = ({ recipes, elementalBalance }) => {
    const [selectedCuisine, setSelectedCuisine] = useState<string>('best');

    const isAppropriateForTimeOfDay = React.useCallback((recipe: Recipe): boolean => {
        const timeOfDay = elementalBalance.timeOfDay as string;
        
        // Normalize meal types to array
        const mealTypes = Array.isArray(recipe.mealType) 
            ? recipe.mealType 
            : typeof recipe.mealType === 'string'
                ? [recipe.mealType]
                : [];

        console.log(`Recipe ${recipe.name}:`, {
            mealTypes,
            timeOfDay,
            season: recipe.season
        });

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
    }, [elementalBalance.timeOfDay]);

    const calculateMatchScore = React.useCallback((recipe: Recipe): number => {
        if (!recipe?.elementalProperties) {
            console.log(`${recipe.name}: No elemental properties`);
            return 0;
        }

        // Check time appropriateness first
        if (!isAppropriateForTimeOfDay(recipe)) {
            console.log(`${recipe.name}: Not appropriate for ${elementalBalance.timeOfDay}`);
            return 0;
        }

        try {
            const baseScore = ElementalCalculator.calculateMatchScore(
                recipe.elementalProperties,
                elementalBalance,
                {
                    mealType: recipe.mealType,
                    season: recipe.season
                }
            );

            let score = baseScore * 100;
            
            // Season matching bonus
            const seasons = Array.isArray(recipe.season) 
                ? recipe.season 
                : typeof recipe.season === 'string'
                    ? [recipe.season]
                    : [];

            if (seasons.some(s => 
                s === elementalBalance.season || 
                s?.toLowerCase() === 'all'
            )) {
                score += 10;
            }

            const finalScore = Math.min(100, Math.max(60, Math.round(score)));
            console.log(`${recipe.name} score: ${finalScore}%`);
            return finalScore;
        } catch (error) {
            console.error(`Error scoring ${recipe.name}:`, error);
            return 0;
        }
    }, [elementalBalance, isAppropriateForTimeOfDay]);

    const organizedRecipes = React.useMemo(() => {
        console.log('Current time:', elementalBalance.timeOfDay);
        console.log('Total recipes:', recipes.length);
        
        // Score and filter recipes
        const validRecipes = recipes
            .map(recipe => ({
                ...recipe,
                matchScore: calculateMatchScore(recipe)
            }))
            .filter(recipe => recipe.matchScore > 0);

        console.log('Valid recipes after filtering:', validRecipes.length);

        // Organize by cuisine
        const recipesByCuisine: Record<string, typeof validRecipes> = {};
        const bestMatches = [...validRecipes]
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        validRecipes.forEach(recipe => {
            if (!recipe.cuisine) return;
            if (!recipesByCuisine[recipe.cuisine]) {
                recipesByCuisine[recipe.cuisine] = [];
            }
            recipesByCuisine[recipe.cuisine].push(recipe);
        });

        // Sort cuisines
        Object.keys(recipesByCuisine).forEach(cuisine => {
            recipesByCuisine[cuisine].sort((a, b) => b.matchScore - a.matchScore);
            recipesByCuisine[cuisine] = recipesByCuisine[cuisine].slice(0, 5);
        });

        console.log('Best matches:', bestMatches.map(r => `${r.name} (${r.matchScore}%)`));

        return {
            best: bestMatches,
            ...recipesByCuisine
        };
    }, [recipes, calculateMatchScore]);

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {Object.keys(organizedRecipes).map(cuisine => (
                    <button
                        key={cuisine}
                        className={`${styles.tab} ${selectedCuisine === cuisine ? styles.active : ''}`}
                        onClick={() => setSelectedCuisine(cuisine)}
                    >
                        {cuisine === 'best' ? 'Best Matches' : cuisine}
                    </button>
                ))}
            </div>

            <div className={styles.recipeGrid}>
                {organizedRecipes[selectedCuisine]?.map((recipe, index) => (
                    <div 
                        key={`${recipe.name}-${index}`} 
                        className={styles.recipeCard}
                    >
                        <h3>{recipe.name}</h3>
                        {recipe.description && (
                            <p className={styles.description}>{recipe.description}</p>
                        )}
                        <div className={styles.recipeDetails}>
                            {recipe.timeToMake && <p>Time: {recipe.timeToMake}</p>}
                            {recipe.season && <p>Season: {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}</p>}
                            {recipe.mealType && <p>Type: {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CuisineGroup;
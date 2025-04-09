"use client"

import React, { useState, useEffect } from 'react';
import CuisineGroup from './components/CuisineGroup';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import styles from './FoodRecommender.module.css';
import { cuisinesMap, type CuisineName } from '@/data/cuisines/index';
import type { Recipe } from '@/types/recipe';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'dessert'] as const;
const SEASONS = ['all', 'summer', 'winter'] as const;

const FoodRecommender = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCuisine, setSelectedCuisine] = useState<CuisineName | null>(null);
    const [selectedMealType, setSelectedMealType] = useState<typeof MEAL_TYPES[number] | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<typeof SEASONS[number]>('all');
    const [elementalBalance, setElementalBalance] = useState(ElementalCalculator.getCurrentElementalBalance());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // Load recipes from cuisines
    useEffect(() => {
        try {
            if (!cuisinesMap) {
                throw new Error('Cuisines data is not available');
            }

            const allRecipes: Recipe[] = [];
            
            // Extract recipes from cuisines
            Object.entries(cuisinesMap).forEach(([cuisineName, cuisine]) => {
                if (!cuisine?.dishes) {
                    console.warn(`No dishes found for cuisine: ${cuisineName}`);
                    return;
                }

                // For each meal type
                MEAL_TYPES.forEach(mealType => {
                    // Add null check for dishes[mealType]
                    if (!cuisine.dishes[mealType]) {
                        console.warn(`No ${mealType} dishes found for ${cuisineName}`);
                        return;
                    }

                    const mealTypeData = cuisine.dishes[mealType];

                    // For each season
                    if (mealTypeData.all && Array.isArray(mealTypeData.all)) {
                        mealTypeData.all.forEach(recipe => {
                            if (recipe) {
                                allRecipes.push({
                                    ...recipe,
                                    cuisine: cuisineName,
                                    mealType: [mealType],
                                    season: ['all']
                                });
                            }
                        });
                    }

                    ['summer', 'winter'].forEach(season => {
                        if (mealTypeData[season] && Array.isArray(mealTypeData[season])) {
                            mealTypeData[season]?.forEach(recipe => {
                                if (recipe) {
                                    allRecipes.push({
                                        ...recipe,
                                        cuisine: cuisineName,
                                        mealType: [mealType],
                                        season: [season]
                                    });
                                }
                            });
                        }
                    });
                });
            });

            console.log('Loaded recipes:', allRecipes.length);
            setRecipes(allRecipes);
            setLoading(false);
        } catch (err) {
            console.error('Error loading recipes:', err);
            setError(err instanceof Error ? err.message : 'Unknown error loading recipes');
            setLoading(false);
        }
    }, []);

    // Filter recipes based on selection
    const filteredRecipes = React.useMemo(() => {
        if (!recipes.length) return [];
        
        return recipes.filter(recipe => {
            if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false;
            if (selectedMealType && !recipe.mealType?.includes(selectedMealType)) return false;
            if (selectedSeason !== 'all' && !recipe.season?.includes(selectedSeason)) return false;
            return true;
        });
    }, [recipes, selectedCuisine, selectedMealType, selectedSeason]);

    return (
        <div className={styles.container}>
            <h1>Discover Recipes From Around The World</h1>
            <p>
                Personalized recommendations based on {elementalBalance.timeOfDay} during {elementalBalance.season}
            </p>

            <button 
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? 'Hide' : 'Show'} Filters
            </button>

            {showFilters && (
                <div className={styles.filters}>
                    <div className={styles.filterSection}>
                        <h3>Meal Type</h3>
                        <div className={styles.filterButtons}>
                            {MEAL_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`${styles.filterButton} ${selectedMealType === type ? styles.active : ''}`}
                                    onClick={() => setSelectedMealType(selectedMealType === type ? null : type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h3>Season</h3>
                        <div className={styles.filterButtons}>
                            {SEASONS.map(season => (
                                <button
                                    key={season}
                                    className={`${styles.filterButton} ${selectedSeason === season ? styles.active : ''}`}
                                    onClick={() => setSelectedSeason(season)}
                                >
                                    {season}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Debug information */}
            <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
                <h3>Debug Info</h3>
                <pre>
                    {JSON.stringify({
                        mounted: true,
                        renders: 1,
                        availableCuisines: Object.keys(cuisinesMap || {}),
                        selectedCuisine,
                        selectedMealType,
                        selectedSeason,
                        elementalBalance,
                        loading,
                        error,
                        recipesCount: filteredRecipes.length,
                        totalRecipes: recipes.length,
                        cuisinesLoaded: Boolean(cuisinesMap)
                    }, null, 2)}
                </pre>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <CuisineGroup
                    recipes={filteredRecipes}
                    elementalBalance={elementalBalance}
                />
            )}
        </div>
    );
};

export default FoodRecommender;
"use client";

import { useEffect, useState } from 'react';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { getRecipesForTarotCard } from '@/lib/recipeCalculations';
import styles from './AlchmKitchen.module.css';

interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    preparation: string;
    astrologicalInfluences: string[];
}

export default function AlchmKitchen() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
        setMounted(true);
        setRenderCount(prev => prev + 1);
        
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get current tarot cards
                const currentDate = new Date();
                const cards = getTarotCardsForDate(currentDate);
                
                // Get recipes based on tarot cards
                const recipes = await getRecipesForTarotCard(cards);
                setRecipes(recipes);
                setFilteredRecipes(recipes);
                
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setLoading(false);
                console.error(err);
            }
        };

        fetchData();
        
        return () => {
            setMounted(false);
        };
    }, []);

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Alchm Kitchen</h1>
            <h2>The Menu of the Moment in the Stars and Elements</h2>
            
            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.recipeList}>
                        {filteredRecipes.map(recipe => (
                            <div key={recipe.id} className={styles.recipeCard}>
                                <h3>{recipe.name}</h3>
                                <div className={styles.ingredients}>
                                    {recipe.ingredients.join(', ')}
                                </div>
                                <div className={styles.preparation}>
                                    {recipe.preparation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className={styles.debugInfo}>
                <div>Mounted: {mounted.toString()}</div>
                <div>Renders: {renderCount}</div>
                <div>Loading: {loading.toString()}</div>
                <div>Recipes: {recipes.length}</div>
                <div>Filtered: {filteredRecipes.length}</div>
                <div>Error: {error || 'none'}</div>
            </div>
        </div>
    );
} 
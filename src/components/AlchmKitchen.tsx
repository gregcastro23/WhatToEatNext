"use client";

import { useEffect, useState } from 'react';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { getRecipesForTarotCard } from '@/lib/recipeCalculations';
import styles from './AlchmKitchen.module.css';
import type { TarotCardResult } from '@/lib/recipeCalculations';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { createLogger } from '@/utils/logger';
import { PlanetaryPosition } from '@/types/celestial';
import { staticAlchemize } from '@/utils/alchemyInitializer';
import { StateDebugger } from '@/components/debug/StateDebugger';

const logger = createLogger('AlchmKitchen');

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
    
    // Get state from AlchemicalContext
    const { 
        planetaryPositions, 
        state,
        isDaytime
    } = useAlchemical();

    const { elementalState, alchemicalValues, astrologicalState } = state;

    // Current Sun sign from astrologicalState
    const currentSign = astrologicalState?.sunSign || 'unknown';
    // Planetary hour from astrologicalState
    const planetaryHour = astrologicalState?.planetaryHour || 'Unknown';
    // Lunar phase from astrologicalState
    const _lunarPhase = astrologicalState?.lunarPhase || 'Unknown';

    useEffect(() => {
        setMounted(true);
        if (renderCount === 0) {
            setRenderCount(prev => prev + 1);
        }
        
        const fetchData = async () => {
            try {
                setLoading(true);
                logger.debug('Fetching tarot data for recipes', { currentSign, planetaryHour });
                
                // Get current tarot cards
                const currentDate = new Date();
                const cards = getTarotCardsForDate(currentDate, planetaryPositions.sun && {
                    sign: (planetaryPositions.sun as unknown as unknown as PlanetaryPosition)?.sign || 'aries',
                    degree: (planetaryPositions.sun as unknown as unknown as PlanetaryPosition)?.degree || 0
                });
                
                // Get recipes based on tarot cards
                const fetchedRecipes = await getRecipesForTarotCard({
                    minorCard: {
                        name: cards.minorCard.name || "",
                        suit: cards.minorCard.suit,
                        number: cards.minorCard.number,
                        keywords: cards.minorCard.keywords || [],
                        quantum: cards.minorCard.quantum || 0,
                        element: cards.minorCard.element,
                        associatedRecipes: cards.minorCard.associatedRecipes
                    },
                    majorCard: cards.majorCard
                });
                
                setRecipes(fetchedRecipes);
                setFilteredRecipes(fetchedRecipes);
                
                setLoading(false);
            } catch (err) {
                logger.error('Error fetching recipe data', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
        
        return () => {
            logger.debug('AlchmKitchen component unmounting');
        };
    }, [planetaryPositions.sun, currentSign, planetaryHour, renderCount]);

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    // Format elemental balance for display
    const elementalBalance = elementalState ? {
        Fire: Math.round(elementalState.Fire * 100),
        Water: Math.round(elementalState.Water * 100),
        Earth: Math.round(elementalState.Earth * 100),
        Air: Math.round(elementalState.Air * 100)
    } : { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    return (
        <div className={styles.container}>
            <h1>Alchm Kitchen</h1>
            <h2>The Menu of the Moment in the Stars and Elements</h2>
            
            {loading ? (
                <div className={styles.loading}>Loading application...</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.recipeList}>
                        {filteredRecipes.map(recipe => (
                            <div key={recipe.id} className={styles.recipeCard}>
                                <h3>{recipe.name}</h3>
                                <div className={styles.ingredients}>
                                    <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                                </div>
                                <div className={styles.preparation}>
                                    <strong>Preparation:</strong> {recipe.preparation}
                                </div>
                                <div className={styles.astrologicalInfluences}>
                                    <strong>Astrological Influences:</strong> {recipe.astrologicalInfluences.join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Use the comprehensive StateDebugger component instead of basic debug info */}
            <StateDebugger />
        </div>
    );
} 
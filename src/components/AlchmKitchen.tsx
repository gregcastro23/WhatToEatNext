"use client";

import { useEffect, useState } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getRecipesForTarotCard } from '@/lib/recipeCalculations';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { createLogger } from '@/utils/logger';

import styles from './AlchmKitchen.module.css';


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
    const currentSign = astrologicalState.sunSign || astrologicalState.currentZodiac || 'unknown';
    // Planetary hour from astrologicalState
    const planetaryHour = astrologicalState.planetaryHour || 'Unknown';
    // Lunar phase from astrologicalState
    const lunarPhase = astrologicalState.lunarPhase || 'Unknown';

    // Mount effect - runs only once
    useEffect(() => {
        setMounted(true);
        setRenderCount(1);
        logger.debug('AlchmKitchen component mounted');
    }, []); // Empty deps array - runs only once

    // Data fetching effect - depends on planetary positions
    useEffect(() => {
        if (!mounted) return; // Don't fetch until mounted
        
        const fetchData = async () => {
            try {
                setLoading(true);
                logger.debug('Fetching tarot data for recipes', { currentSign, planetaryHour });
                
                // Get current tarot cards
                const currentDate = new Date();
                const cards = getTarotCardsForDate(currentDate, planetaryPositions.Sun ? {
                    sign: (planetaryPositions.Sun as any)?.sign || 'aries',
                    degree: (planetaryPositions.Sun as any)?.degree || 0
                } : undefined);
                
                // Get recipes based on tarot cards
                const fetchedRecipes = await getRecipesForTarotCard({
                    minorCard: {
                        name: cards.minorCard.name,
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
    }, [mounted, planetaryPositions.Sun, currentSign, planetaryHour]); // Added planetaryHour to deps

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    // Format elemental properties for display
    const elementalProperties = elementalState ? {
        Fire: Math.round(elementalState.Fire * 100),
        Water: Math.round(elementalState.Water * 100),
        Earth: Math.round(elementalState.Earth * 100),
        Air: Math.round(elementalState.Air * 100)
    } : { Fire: 0, Water: 0, Earth: 0, Air: 0 }; // Use zero values if no state

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
            
            <div className={styles.debugInfo}>
                <h3>Debug Info</h3>
                <div>Mounted: {mounted.toString()}</div>
                <div>Renders: {renderCount}</div>
                <div>Current Sign: {currentSign}</div>
                <div>Planetary Hour: {planetaryHour as string}</div>
                <div>Lunar Phase: {lunarPhase}</div>
                <h4>Alchemical Tokens:</h4>
                <div>⦿ Spirit: {alchemicalValues.Spirit.toFixed(4) || '0.0000'}</div>
                <div>⦿ Essence: {alchemicalValues.Essence.toFixed(4) || '0.0000'}</div>
                <div>⦿ Matter: {alchemicalValues.Matter.toFixed(4) || '0.0000'}</div>
                <div>⦿ Substance: {alchemicalValues.Substance.toFixed(4) || '0.0000'}</div>
                <h4>Elemental Balance:</h4>
                <div>Fire: {elementalProperties.Fire}%</div>
                <div>Water: {elementalProperties.Water}%</div>
                <div>Earth: {elementalProperties.Earth}%</div>
                <div>Air: {elementalProperties.Air}%</div>
            </div>
        </div>
    );
} 
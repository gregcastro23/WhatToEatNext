"use client";

import { useEffect, useState, useMemo } from 'react';
import { getTarotCardsForDate } from '../lib/tarotCalculations';
import { getRecipesForTarotCard } from '../lib/recipeCalculations';
import styles from './AlchmKitchen.module.css';
import type { TarotCardResult } from '../lib/recipeCalculations';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { createLogger } from '../utils/logger';
import { staticAlchemize } from '../utils/alchemyInitializer';
// Import cosine similarity from ml-distance
import { similarity } from 'ml-distance';
// Import the correct types from AlchemicalContext
import type { AlchemicalState, AstrologicalState, AlchemicalValues } from '../contexts/AlchemicalContext/types';
import type { ElementalProperties } from '../types/celestial';

const logger = createLogger('AlchmKitchen');

// Explicit typing for Recipe including elementalProperties
interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    preparation: string;
    astrologicalInfluences: string[];
    elementalProperties?: ElementalProperties;
}

// Define type for getRecipesForTarotCard response
type RecipeResponse = {
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
    const [similarRecipes, setSimilarRecipes] = useState<{recipe: Recipe, similarity: number}[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [renderCount, setRenderCount] = useState(0);
    
    // Get state from AlchemicalContext
    const alchemical = useAlchemical();
    const planetaryPositions = alchemical?.planetaryPositions || {};
    const state = alchemical?.state || {} as AlchemicalState;
    const isDaytime = alchemical?.isDaytime || true;

    // Current sun sign from astrologicalState
    const currentSign = state?.astrologicalState?.sunSign || state?.astrologicalState?.currentZodiac ||
 'unknown';
    // Planetary hour from astrologicalState
    const planetaryHour = state?.astrologicalState?.planetaryHour || 'unknown';
    // Lunar phase from astrologicalState
    const lunarPhase = state?.astrologicalState?.lunarPhase || 'unknown';
    
    // Extract elemental state and alchemical values from state
    const elementalState: ElementalProperties = state?.elementalState || {
        Fire: 0.25, 
        Water: 0.25, 
        Earth: 0.25, 
        Air: 0.25
    };
    
    const alchemicalValues = state?.alchemicalValues || {
        Spirit: 0,
        Essence: 0,
        Matter: 0,
        Substance: 0
    };

    // Helper function to calculate elemental similarity between two elemental profiles
    const calculateElementalSimilarity = (recipe: Recipe): number => {
        if (!recipe.elementalProperties) return 0.5; // Default similarity if no properties

        // Extract values from elemental properties into vectors for similarity calculation
        const recipeVector = [
            recipe.elementalProperties.Fire || 0,
            recipe.elementalProperties.Water || 0, 
            recipe.elementalProperties.Earth || 0,
            recipe.elementalProperties.Air || 0
        ];
        
        const currentVector = [
            elementalState.Fire || 0,
            elementalState.Water || 0,
            elementalState.Earth || 0,
            elementalState.Air || 0
        ];
        
        // Calculate cosine similarity using ml-distance
        try {
            return similarity.cosine(recipeVector, currentVector);
        } catch (err) {
            logger.error('Error calculating similarity', err);
            return 0.5; // Default if calculation fails
        }
    };
    
    // Calculate astrological compatibility score
    const calculateAstrologicalCompatibility = (recipe: Recipe): number => {
        if (!recipe.astrologicalInfluences || recipe.astrologicalInfluences.length === 0) {
            return 0.5; // Default compatibility
        }
        
        // Get current active planetary influences
        const activePlanets = [planetaryHour.toLowerCase()];
        
        // Add sun and moon signs as influences
        if (currentSign) activePlanets.push(currentSign.toLowerCase());
        
        // Count matches between recipe's astrological influences and current influences
        const matchCount = recipe.astrologicalInfluences.filter(influence => 
            activePlanets.includes(influence.toLowerCase())
        ).length;
        
        // Calculate score based on matches (with normalized scaling)
        return Math.min(1, matchCount / Math.max(1, recipe.astrologicalInfluences.length));
    };
    
    // Combined scoring function that considers both elemental and astrological compatibility
    const calculateTotalCompatibility = (recipe: Recipe): number => {
        const elementalScore = calculateElementalSimilarity(recipe);
        const astrologicalScore = calculateAstrologicalCompatibility(recipe);
        
        // Combined weighted score (elemental 60%, astrological 40%)
        return (elementalScore * 0.6) + (astrologicalScore * 0.4);
    };

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
                    sign: planetaryPositions.sun.sign || 'aries',
                    degree: planetaryPositions.sun.degree || 0
                });
                
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
                
                // Add mock elemental properties if missing
                const recipesWithProperties = fetchedRecipes.map((recipeData: RecipeResponse): Recipe => {
                    // Create a new Recipe object with proper typing
                    const recipe: Recipe = {
                        id: recipeData.id,
                        name: recipeData.name,
                        ingredients: recipeData.ingredients,
                        preparation: recipeData.preparation,
                        astrologicalInfluences: recipeData.astrologicalInfluences,
                        elementalProperties: {
                            Fire: Math.random() * 0.5,
                            Water: Math.random() * 0.5,
                            Earth: Math.random() * 0.5,
                            Air: Math.random() * 0.5
                        }
                    };
                    
                    // Normalize to ensure sum is approximately 1.0
                    const sum = recipe.elementalProperties.Fire + 
                                recipe.elementalProperties.Water + 
                                recipe.elementalProperties.Earth + 
                                recipe.elementalProperties.Air;
                                
                    if (sum > 0) {
                        recipe.elementalProperties.Fire = recipe.elementalProperties.Fire / sum;
                        recipe.elementalProperties.Water = recipe.elementalProperties.Water / sum;
                        recipe.elementalProperties.Earth = recipe.elementalProperties.Earth / sum;
                        recipe.elementalProperties.Air = recipe.elementalProperties.Air / sum;
                    }
                    
                    return recipe;
                });
                
                setRecipes(recipesWithProperties);
                
                // Calculate compatibility scores and filter recipes
                const scoredRecipes = recipesWithProperties.map(recipe => ({
                    recipe,
                    similarity: calculateTotalCompatibility(recipe)
                })).sort((a, b) => b.similarity - a.similarity);
                
                setSimilarRecipes(scoredRecipes);
                
                // Filter recipes by compatibility threshold
                const compatibleRecipes = recipesWithProperties.filter(
                    recipe => calculateTotalCompatibility(recipe) >= 0.6
                );
                
                setFilteredRecipes(compatibleRecipes.length > 0 ? compatibleRecipes : recipesWithProperties);
                
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
    }, [planetaryPositions.sun, currentSign, planetaryHour, renderCount, elementalState]);

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
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(recipe => (
                                <div key={recipe.id} className={styles.recipeCard}>
                                    <h3>{recipe.name}</h3>
                                    <div className={styles.compatibilityScore}>
                                        Compatibility: {Math.round(calculateTotalCompatibility(recipe) * 100)}%
                                    </div>
                                    <div className={styles.ingredients}>
                                        <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                                    </div>
                                    <div className={styles.preparation}>
                                        <strong>Preparation:</strong> {recipe.preparation}
                                    </div>
                                    <div className={styles.astrologicalInfluences}>
                                        <strong>Astrological Influences:</strong> {recipe.astrologicalInfluences.join(', ')}
                                    </div>
                                    {recipe.elementalProperties && (
                                        <div className={styles.elementalProperties}>
                                            <strong>Elemental Balance:</strong>
                                            <div>Fire: {Math.round(recipe.elementalProperties.Fire * 100)}%</div>
                                            <div>Water: {Math.round(recipe.elementalProperties.Water * 100)}%</div>
                                            <div>Earth: {Math.round(recipe.elementalProperties.Earth * 100)}%</div>
                                            <div>Air: {Math.round(recipe.elementalProperties.Air * 100)}%</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noRecipes}>
                                No recipes available for the current astrological configuration.
                                Try again later as the stars change their positions.
                            </div>
                        )}
                    </div>
                    
                    {similarRecipes.length > 0 && (
                        <div className={styles.similarRecipes}>
                            <h3>Similarity-Based Recommendations</h3>
                            <div className={styles.recipeGrid}>
                                {similarRecipes.slice(0, 3).map(({recipe, similarity}) => (
                                    <div key={recipe.id} className={styles.similarRecipeCard}>
                                        <h4>{recipe.name}</h4>
                                        <div className={styles.similarityScore}>
                                            Similarity: {Math.round(similarity * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 
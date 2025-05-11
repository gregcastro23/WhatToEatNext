'use client';

import { useEffect, useState } from 'react';
import { tarotCalculations } from '@/lib';
import { recipeCalculations } from '@/lib';
import styles from './AlchmKitchen.module.css';
import { useAstrologicalState } from '@/hooks';
import { ElementalProperties } from '@/types/alchemy';
import { useAlchemicalRecommendations } from '@/hooks/useAlchemicalRecommendations';
import { RecipeRecommendations } from '@/components/Recipe/RecipeRecommendations';
import { getChakraBasedRecommendations } from '@/utils/ingredientRecommender';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import { CHAKRA_SYMBOLS } from '@/constants/chakraSymbols';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { createLogger } from '@/utils/logger';
import { initializeAlchemy } from '@/utils/alchemyInitializer';

let logger = createLogger('AlchmKitchen');

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
  const { planetaryPositions, state, isDaytime } = useAlchemicalRecommendations();

  const { elementalState, alchemicalValues, astrologicalState } = state;

  // Current Sun sign from astrologicalState
  let currentSign = astrologicalState?.sunSign || 'unknown';
  // Planetary hour from astrologicalState
  let planetaryHour = astrologicalState?.planetaryHour || 'Unknown';
  // Lunar phase from astrologicalState
  let lunarPhase = astrologicalState?.lunarPhase || 'Unknown';

  useEffect(() => {
    setMounted(true);
    if (renderCount === 0) {
      setRenderCount((prev) => prev + 1);
    }

    let fetchData = async () => {
      try {
        setLoading(true);
        logger.debug('Fetching tarot data for recipes', {
          currentSign,
          planetaryHour,
        });

        // Get current tarot cards
        let currentDate = new Date();
        let cards = getTarotCardsForDate(
          currentDate,
          planetaryPositions.sun && {
            sign: planetaryPositions.sun.sign || 'aries',
            degree: planetaryPositions.sun.degree || 0,
          }
        );

        // Get recipes based on tarot cards
        let fetchedRecipes = await getRecipesForTarotCard({
          minorCard: {
            name: cards.minorCard.name,
            suit: cards.minorCard.suit,
            number: cards.minorCard.number,
            keywords: cards.minorCard.keywords || [],
            quantum: cards.minorCard.quantum || 0,
            element: cards.minorCard.element,
            associatedRecipes: cards.minorCard.associatedRecipes,
          },
          majorCard: cards.majorCard,
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
  let elementalBalance = elementalState
    ? {
        Fire: Math.round(elementalState.Fire * 100),
        Water: Math.round(elementalState.Water * 100),
        Earth: Math.round(elementalState.Earth * 100),
        Air: Math.round(elementalState.Air * 100),
      }
    : { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  return (
    <div className={styles.container}>
      <h1>Alchm Kitchen</h1>
      <h2>The Menu of the Moment in the Stars and Elements</h2>

      {loading ? (
        <div className={styles.loading}>Loading application...</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.recipeList}>
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className={styles.recipeCard}>
                <h3>{recipe.name}</h3>
                <div className={styles.ingredients}>
                  <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                </div>
                <div className={styles.preparation}>
                  <strong>Preparation:</strong> {recipe.preparation}
                </div>
                <div className={styles.astrologicalInfluences}>
                  <strong>Astrological Influences:</strong>{' '}
                  {recipe.astrologicalInfluences.join(', ')}
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
        <div>Planetary Hour: {planetaryHour}</div>
        <div>Lunar Phase: {lunarPhase}</div>
        <h4>Alchemical Tokens:</h4>
        <div>⦿ Spirit: {alchemicalValues?.Spirit.toFixed(4) || '0.0000'}</div>
        <div>⦿ Essence: {alchemicalValues?.Essence.toFixed(4) || '0.0000'}</div>
        <div>⦿ Matter: {alchemicalValues?.Matter.toFixed(4) || '0.0000'}</div>
        <div>
          ⦿ Substance: {alchemicalValues?.Substance.toFixed(4) || '0.0000'}
        </div>
        <h4>Elemental Balance:</h4>
        <div>Fire: {elementalBalance.Fire}%</div>
        <div>Water: {elementalBalance.Water}%</div>
        <div>Earth: {elementalBalance.Earth}%</div>
        <div>Air: {elementalBalance.Air}%</div>
      </div>
    </div>
  );
}

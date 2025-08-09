import React, { useMemo } from 'react';

import type { AstrologicalState } from '@/types';
import { getTopIngredientMatches } from '@/utils/foodRecommender';

import styles from './IngredientRecommendations.module.css';

interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
  astrologicalState,
}) => {
  const recommendedIngredients = useMemo(() => {
    return getTopIngredientMatches(astrologicalState, 5);
  }, [astrologicalState]);

  if (recommendedIngredients.length === 0) {
    return <div className={styles.empty}>No recommended ingredients found</div>;
  }

  return (
    <div className={styles.container}>
      <h3>Recommended Ingredients</h3>
      <ul className={styles.list}>
        {recommendedIngredients.map(ingredient => (
          <li key={ingredient.name} className={styles.item}>
            <div className={styles.name}>{ingredient.name}</div>

            {/* Show elemental properties if available */}
            {ingredient.elementalProperties && (
              <div className={styles.elementalProperties}>
                {Object.entries(ingredient.elementalProperties)
                  .sort(([_keyA, a], [_keyB, b]) => {
                    // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
                    const valueA = Number(a) || 0;
                    const valueB = Number(b) || 0;
                    return valueB - valueA;
                  })
                  .map(([element, value]) => (
                    <div key={element} className={styles.elementalProperty}>
                      <span className={styles.elementName}>{element}</span>
                      <div
                        className={styles.elementBar}
                        style={{ width: `${Math.round((Number(value) || 0) * 100)}%` }}
                      />
                      <span className={styles.elementValue}>
                        {Math.round((Number(value) || 0) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Show energy metrics if available */}
            {ingredient.heat !== undefined && (
              <div className={styles.energyMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Heat:</span>
                  <span className={styles.metricValue}>
                    {Math.round((Number(ingredient.heat) || 0) * 100)}%
                  </span>
                </div>
                {ingredient.entropy !== undefined && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Entropy:</span>
                    <span className={styles.metricValue}>
                      {Math.round((Number(ingredient.entropy) || 0) * 100)}%
                    </span>
                  </div>
                )}
                {ingredient.reactivity !== undefined && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Reactivity:</span>
                    <span className={styles.metricValue}>
                      {Math.round((Number(ingredient.reactivity) || 0) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className={styles.details}>
              <div>Element: {ingredient.astrologicalProfile.elementalAffinity.base}</div>
              <div>Planets: {ingredient.astrologicalProfile.rulingPlanets.join(', ')}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientRecommendations;

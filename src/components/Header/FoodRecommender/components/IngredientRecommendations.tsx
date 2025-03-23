import React, { useMemo } from 'react';
import { getTopIngredientMatches } from '@/utils/ingredientRecommender';
import styles from './IngredientRecommendations.module.css';
import type { AstrologicalState } from '@/types';

interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
  astrologicalState
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
                  .sort(([_keyA, a], [_keyB, b]) => b - a)
                  .map(([element, value]) => (
                    <div key={element} className={styles.elementalProperty}>
                      <span className={styles.elementName}>{element}</span>
                      <div 
                        className={styles.elementBar}
                        style={{ width: `${Math.round(value * 100)}%` }}
                      />
                      <span className={styles.elementValue}>
                        {Math.round(value * 100)}%
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
                  <span className={styles.metricValue}>{Math.round(ingredient.heat * 100)}%</span>
                </div>
                {ingredient.entropy !== undefined && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Entropy:</span>
                    <span className={styles.metricValue}>{Math.round(ingredient.entropy * 100)}%</span>
                  </div>
                )}
                {ingredient.reactivity !== undefined && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Reactivity:</span>
                    <span className={styles.metricValue}>{Math.round(ingredient.reactivity * 100)}%</span>
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
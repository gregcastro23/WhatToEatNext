import React, { useMemo } from 'react';

import type { AstrologicalState } from '@/types';
import { getTopIngredientMatches } from '@/utils/foodRecommender';

import styles from './IngredientRecommendations.module.css';

interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

export const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
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
            <div className={styles.details}>
              <div>Element: {typeof ingredient.astrologicalProfile.elementalAffinity === 'object' 
                ? ingredient.astrologicalProfile.elementalAffinity.base 
                : (typeof ingredient.astrologicalProfile.elementalAffinity === 'string' 
                  ? ingredient.astrologicalProfile.elementalAffinity 
                  : 'Unknown')}</div>
              <div>Planets: {Array.isArray(ingredient.astrologicalProfile.rulingPlanets) 
                ? ingredient.astrologicalProfile.rulingPlanets.join(', ') 
                : 'Unknown'}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

import React, { useMemo } from 'react';
import @/utils  from 'foodRecommender ';
import styles from './IngredientRecommendations.module.css';
import type { AstrologicalState } from '@/types';

interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
  astrologicalState
}) => {
  let recommendedIngredients = useMemo(() => {
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
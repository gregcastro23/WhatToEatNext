import React from 'react';
import styles from './IngredientRecommendations.module.css';
import { AstrologicalState } from '@/types/state';
import { getRecommendedIngredients } from '@/utils/ingredientRecommender';

interface IngredientRecommendationsProps {
  astrologicalState: AstrologicalState;
}

// Define extended ingredient type that includes the heat, entropy, and reactivity properties
interface ExtendedIngredient {
  name: string;
  type?: string;
  elementalProperties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    [key: string]: number;
  };
  heat?: number;
  entropy?: number;
  reactivity?: number;
  astrologicalProfile?: {
    elementalAffinity?: {
      base?: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
  };
  [key: string]: any;
}

// Type guard to check if an object has a property
function hasProperty<K extends string>(obj: unknown, key: K): obj is { [P in K]: unknown } {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Type guard for thermodynamic properties
function hasThermodynamicProperty(ingredient: unknown, property: string): boolean {
  return typeof ingredient === 'object' && 
         ingredient !== null && 
         property in ingredient && 
         typeof ingredient[property as keyof typeof ingredient] === 'number';
}

const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
  astrologicalState
}) => {
  // Get recommended ingredients directly using the AstrologicalState
  const ingredients = getRecommendedIngredients(astrologicalState) as ExtendedIngredient[];

  return (
    <div className={styles.recommendationsContainer}>
      <h3>Recommended Ingredients</h3>
      <ul className={styles.ingredientList}>
        {ingredients.map((ingredient, index) => (
          <li key={index} className={styles.ingredientCard}>
            <h4 className={styles.ingredientName}>{ingredient.name}</h4>
            
            {/* Show elemental properties if available */}
            {hasProperty(ingredient, 'elementalProperties') && (
              <div className={styles.elementalProperties}>
                {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
                  <div key={element} className={styles.element}>
                    <span className={styles.elementName}>
                      {element}:
                    </span>
                    <div 
                      className={styles.elementBar}
                      style={{ 
                        width: `${Math.round(Number(value) * 100)}%`,
                        backgroundColor: element === 'Fire' ? '#ff6b6b' : 
                                         element === 'Water' ? '#4dabf7' : 
                                         element === 'Earth' ? '#82c91e' : 
                                         element === 'Air' ? '#da77f2' : '#adb5bd'
                      }}
                    />
                    <span className={styles.elementValue}>
                      {Math.round(Number(value) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show energy metrics if available */}
            {hasThermodynamicProperty(ingredient, 'heat') && (
              <div className={styles.energyMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Heat:</span>
                  <span className={styles.metricValue}>
                    {Math.round(Number(ingredient.heat) * 100)}%
                  </span>
                </div>
                {hasThermodynamicProperty(ingredient, 'entropy') && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Entropy:</span>
                    <span className={styles.metricValue}>
                      {Math.round(Number(ingredient.entropy) * 100)}%
                    </span>
                  </div>
                )}
                {hasThermodynamicProperty(ingredient, 'reactivity') && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Reactivity:</span>
                    <span className={styles.metricValue}>
                      {Math.round(Number(ingredient.reactivity) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className={styles.details}>
              {hasProperty(ingredient, 'astrologicalProfile') && 
               hasProperty(ingredient.astrologicalProfile, 'elementalAffinity') && 
               hasProperty(ingredient.astrologicalProfile.elementalAffinity, 'base') && (
                <div>Element: {String(ingredient.astrologicalProfile.elementalAffinity.base)}</div>
              )}
              
              {hasProperty(ingredient, 'astrologicalProfile') && 
               hasProperty(ingredient.astrologicalProfile, 'rulingPlanets') && 
               Array.isArray(ingredient.astrologicalProfile.rulingPlanets) && (
                <div>Planets: {ingredient.astrologicalProfile.rulingPlanets.join(', ')}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientRecommendations; 
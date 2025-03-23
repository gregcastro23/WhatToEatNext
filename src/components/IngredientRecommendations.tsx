'use client';

import { useState, useEffect } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { getIngredientRecommendations, IngredientRecommendation, RecommendationOptions } from '@/utils/ingredientRecommender';
import styles from './IngredientRecommendations.module.css';
import type { ElementalProperties, ZodiacSign, Season, ElementalState } from '@/types/alchemy';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import { toZodiacSign } from '@/utils/zodiacUtils';

// Helper function to adapt the elemental properties for the recommender system
function getRecommendations(
  elementalProps: ElementalProperties | undefined,
  options: RecommendationOptions
): IngredientRecommendation[] {
  // Create a basic object with the required properties
  const adaptedProps = {
    Fire: elementalProps?.Fire || 0.25,
    Water: elementalProps?.Water || 0.25,
    Earth: elementalProps?.Earth || 0.25,
    Air: elementalProps?.Air || 0.25,
    fire: elementalProps?.Fire || 0.25, // Add lowercase versions too
    water: elementalProps?.Water || 0.25,
    earth: elementalProps?.Earth || 0.25,
    air: elementalProps?.Air || 0.25,
    timestamp: new Date(),
    currentStability: 1.0,
    planetaryAlignment: {
      sun: { sign: options.currentZodiac || 'aries', degree: 0 },
      moon: { sign: options.currentZodiac || 'aries', degree: 0 },
      mercury: { sign: options.currentZodiac || 'aries', degree: 0 },
      venus: { sign: options.currentZodiac || 'aries', degree: 0 },
      mars: { sign: options.currentZodiac || 'aries', degree: 0 },
      jupiter: { sign: options.currentZodiac || 'aries', degree: 0 },
      saturn: { sign: options.currentZodiac || 'aries', degree: 0 },
      uranus: { sign: options.currentZodiac || 'aries', degree: 0 },
      neptune: { sign: options.currentZodiac || 'aries', degree: 0 },
      pluto: { sign: options.currentZodiac || 'aries', degree: 0 }
    }
  };
  
  // Use the adapted properties and type assertion to make TypeScript happy
  return getIngredientRecommendations(adaptedProps as any, options);
}

interface IngredientRecommendationsProps {
  targetElements?: ElementalProperties;
}

export default function IngredientRecommendations({ 
  targetElements 
}: IngredientRecommendationsProps) {
  const { currentZodiac } = useAstrologicalState();
  
  // Use the helper function to ensure valid ZodiacSign
  const zodiacSign = toZodiacSign(currentZodiac);
  
  const [recommendations, setRecommendations] = useState<IngredientRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season>('summer');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [showSensoryProfiles, setShowSensoryProfiles] = useState(false);
  const [showCookingMethods, setShowCookingMethods] = useState(false);
  
  useEffect(() => {
    // Get recommendations with current filters
    setLoading(true);
    
    const options = {
      currentSeason: selectedSeason,
      dietaryPreferences: dietaryFilter !== 'all' ? [dietaryFilter] : [],
      currentZodiac: zodiacSign,
      limit: 12
    };
    
    // Use our adapter function instead of direct call
    const recommendedIngredients = getRecommendations(targetElements, options);
    setRecommendations(recommendedIngredients);
    setLoading(false);
  }, [targetElements, currentZodiac, selectedSeason, dietaryFilter, zodiacSign]);
  
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className={`${styles.tagIcon} ${styles.fire}`} size={16} />;
      case 'Water': return <Droplets className={`${styles.tagIcon} ${styles.water}`} size={16} />;
      case 'Earth': return <Mountain className={`${styles.tagIcon} ${styles.earth}`} size={16} />;
      case 'Air': return <Wind className={`${styles.tagIcon} ${styles.air}`} size={16} />;
      default: return null;
    }
  };
  
  // Update the alchemical properties calculation to be more accurate
  const calculateAlchemicalProperties = (elementalProps: ElementalProperties) => {
    // Calculate derived properties based on elemental combinations with improved formulas
    return {
      spirit: (elementalProps.Fire * 0.6) + (elementalProps.Air * 0.4),  // Adjusted ratio
      essence: (elementalProps.Water * 0.5) + (elementalProps.Air * 0.5), // Balanced ratio
      matter: (elementalProps.Earth * 0.8) + (elementalProps.Water * 0.2), // More earth influence
      substance: (elementalProps.Earth * 0.4) + (elementalProps.Fire * 0.6) // More fire influence
    };
  };
  
  const getSensoryProfileBar = (value: number, type: string) => {
    return (
      <div className={styles.sensoryBar}>
        <span className={styles.sensoryLabel}>{type}</span>
        <div className={styles.sensoryBarContainer}>
          <div 
            className={`${styles.sensoryBarFill} ${styles[type.toLowerCase()]}`}
            style={{ width: `${Math.round(value * 100)}%` }}
          ></div>
        </div>
        <span className={styles.sensoryBarValue}>{Math.round(value * 100)}%</span>
      </div>
    );
  };
  
  if (loading) {
    return <div className={styles.loading}>Finding suitable ingredients...</div>;
  }
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recommended Ingredients</h2>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="season-filter" className={styles.filterLabel}>Season:</label>
          <select 
            id="season-filter" 
            className={styles.select}
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value as Season)}
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="autumn">Autumn</option>
            <option value="winter">Winter</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="dietary-filter" className={styles.filterLabel}>Dietary:</label>
          <select 
            id="dietary-filter" 
            className={styles.select}
            value={dietaryFilter}
            onChange={(e) => setDietaryFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
          </select>
        </div>

        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleButton} ${showSensoryProfiles ? styles.active : ''}`}
            onClick={() => setShowSensoryProfiles(!showSensoryProfiles)}
          >
            {showSensoryProfiles ? 'Hide Sensory Profiles' : 'Show Sensory Profiles'}
          </button>
          
          <button 
            className={`${styles.toggleButton} ${showCookingMethods ? styles.active : ''}`}
            onClick={() => setShowCookingMethods(!showCookingMethods)}
          >
            {showCookingMethods ? 'Hide Cooking Methods' : 'Show Cooking Methods'}
          </button>
        </div>
      </div>
      
      <div className={styles.list}>
        {recommendations.map((ingredient) => (
          <div key={ingredient.name} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.ingredientName}>{ingredient.name}</h3>
              <span className={styles.score}>{Math.round(ingredient.totalScore * 100)}% Match</span>
            </div>
            
            {ingredient.description && (
              <p className={styles.description}>{ingredient.description}</p>
            )}
            
            <div className={styles.elementalTags}>
              {Object.entries(ingredient.elementalProperties)
                .filter(([_, value]) => (value as number) > 0)
                .sort(([_, a], [__, b]) => (b as number) - (a as number))
                .map(([element, value]) => (
                  <div key={element} className={styles.elementBar}>
                    <div className={styles.elementBarLabel}>
                      {getElementIcon(element)}
                      <span>{element}</span>
                    </div>
                    <div className={styles.elementBarContainer}>
                      <div 
                        className={`${styles.elementBarFill} ${styles[element.toLowerCase()]}`}
                        style={{ width: `${Math.round((value as number) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={styles.elementBarValue}>{Math.round((value as number) * 100)}%</span>
                  </div>
                ))}
            </div>
            
            {/* Alchemical properties section */}
            <div className={styles.alchemicalProperties}>
              <h4 className={styles.sectionTitle}>Alchemical Properties</h4>
              
              {(() => {
                const alchemicalProps = calculateAlchemicalProperties(ingredient.elementalProperties);
                return Object.entries(alchemicalProps).map(([property, value]) => (
                  <div key={property} className={styles.elementBar}>
                    <div className={styles.elementBarLabel}>
                      <span>{property.charAt(0).toUpperCase() + property.slice(1)}</span>
                    </div>
                    <div className={styles.elementBarContainer}>
                      <div 
                        className={`${styles.elementBarFill} ${styles[property.toLowerCase()]}`}
                        style={{ width: `${Math.round(value * 100)}%` }}
                      ></div>
                    </div>
                    <span className={styles.elementBarValue}>{Math.round(value * 100)}%</span>
                  </div>
                ));
              })()}
            </div>
            
            {/* Display sensory profiles if available and toggle is on */}
            {showSensoryProfiles && ingredient.sensoryProfile && (
              <div className={styles.sensoryProfiles}>
                <h4 className={styles.sectionTitle}>Sensory Profile</h4>
                
                {/* Taste profiles */}
                <div className={styles.sensorySection}>
                  <h5 className={styles.sensoryTitle}>Taste</h5>
                  {Object.entries(ingredient.sensoryProfile.taste)
                    .filter(([_, value]) => (value as number) > 0)
                    .sort(([_, a], [__, b]) => (b as number) - (a as number))
                    .map(([type, value]) => getSensoryProfileBar(value as number, type))}
                </div>
                
                {/* Aroma profiles */}
                <div className={styles.sensorySection}>
                  <h5 className={styles.sensoryTitle}>Aroma</h5>
                  {Object.entries(ingredient.sensoryProfile.aroma)
                    .filter(([_, value]) => (value as number) > 0)
                    .sort(([_, a], [__, b]) => (b as number) - (a as number))
                    .slice(0, 3) // Show only top 3
                    .map(([type, value]) => getSensoryProfileBar(value as number, type))}
                </div>
                
                {/* Texture profiles */}
                <div className={styles.sensorySection}>
                  <h5 className={styles.sensoryTitle}>Texture</h5>
                  {Object.entries(ingredient.sensoryProfile.texture)
                    .filter(([_, value]) => (value as number) > 0)
                    .sort(([_, a], [__, b]) => (b as number) - (a as number))
                    .slice(0, 2) // Show only top 2
                    .map(([type, value]) => getSensoryProfileBar(value as number, type))}
                </div>
              </div>
            )}
            
            {/* Display cooking methods if available and toggle is on */}
            {showCookingMethods && ingredient.recommendedCookingMethods && (
              <div className={styles.cookingMethods}>
                <h4 className={styles.sectionTitle}>Recommended Cooking Methods</h4>
                <div className={styles.methodsList}>
                  {ingredient.recommendedCookingMethods.map((method, index) => (
                    <div key={index} className={styles.methodCard}>
                      <div className={styles.methodHeader}>
                        <h5 className={styles.methodName}>{method.name}</h5>
                        <span className={styles.methodTime}>
                          {method.cookingTime.min}-{method.cookingTime.max} {method.cookingTime.unit}
                        </span>
                      </div>
                      <p className={styles.methodDescription}>{method.description}</p>
                      
                      {/* Show elemental effects of cooking method */}
                      {Object.entries(method.elementalEffect).length > 0 && (
                        <div className={styles.methodEffects}>
                          <span className={styles.effectsLabel}>Elemental Effect:</span>
                          <div className={styles.effectsList}>
                            {Object.entries(method.elementalEffect).map(([element, value]) => (
                              <span key={element} className={`${styles.effectTag} ${styles[element.toLowerCase()]}`}>
                                {element} {(value as number) > 0 ? '+' : ''}{Math.round((value as number) * 100)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pairing recommendations if available */}
            {ingredient.pairingRecommendations && (
              <div className={styles.pairings}>
                <h4 className={styles.sectionTitle}>Pairing Suggestions</h4>
                
                {ingredient.pairingRecommendations.complementary.length > 0 && (
                  <div className={styles.pairingGroup}>
                    <span className={styles.pairingLabel}>Complementary:</span>
                    <div className={styles.pairingTags}>
                      {ingredient.pairingRecommendations.complementary.slice(0, 3).map((item, index) => (
                        <span key={index} className={`${styles.pairingTag} ${styles.complementary}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {ingredient.pairingRecommendations.contrasting.length > 0 && (
                  <div className={styles.pairingGroup}>
                    <span className={styles.pairingLabel}>Contrasting:</span>
                    <div className={styles.pairingTags}>
                      {ingredient.pairingRecommendations.contrasting.slice(0, 2).map((item, index) => (
                        <span key={index} className={`${styles.pairingTag} ${styles.contrasting}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className={styles.scoreDetails}>
              <div className={styles.scoreCategory}>
                <span className={styles.scoreLabel}>Elemental</span>
                <span className={styles.scoreValue}>{Math.round(ingredient.elementalScore * 100)}%</span>
              </div>
              
              <div className={styles.scoreCategory}>
                <span className={styles.scoreLabel}>Astrological</span>
                <span className={styles.scoreValue}>{Math.round(ingredient.astrologicalScore * 100)}%</span>
              </div>
              
              <div className={styles.scoreCategory}>
                <span className={styles.scoreLabel}>Seasonal</span>
                <span className={styles.scoreValue}>{Math.round(ingredient.seasonalScore * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
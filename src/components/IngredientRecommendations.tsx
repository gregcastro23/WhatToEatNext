'use client';

import { useState, useEffect } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { getIngredientRecommendations, IngredientRecommendation, RecommendationOptions, GroupedIngredientRecommendations } from '@/utils/ingredientRecommender';
import styles from './IngredientRecommendations.module.css';
import type { ElementalProperties, ZodiacSign, Season, ElementalState } from '@/types/alchemy';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import { toZodiacSign } from '@/utils/zodiacUtils';
import type { Ingredient } from '@/types/ingredient';
import { calculateAlchemicalProperties, calculateThermodynamicProperties, determineIngredientModality } from '@/utils/ingredientUtils';
import type { Modality } from '@/data/ingredients/types';

// Helper function to adapt the elemental properties for the recommender system
function getRecommendations(
  elementalProps: ElementalProperties | undefined,
  options: RecommendationOptions
): GroupedIngredientRecommendations {
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
  
  const [recommendations, setRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season>('summer');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [showSensoryProfiles, setShowSensoryProfiles] = useState(false);
  const [showCookingMethods, setShowCookingMethods] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  useEffect(() => {
    // Get recommendations with current filters
    setLoading(true);
    
    // Add this debugging code
    console.log("Modal filter:", modalityFilter);
    
    const options = {
      currentSeason: selectedSeason,
      dietaryPreferences: dietaryFilter !== 'all' ? [dietaryFilter] : [],
      modalityPreference: modalityFilter !== 'all' ? modalityFilter as Modality : undefined,
      currentZodiac: zodiacSign,
      limit: 12
    };
    
    // Use our adapter function with modality filtering
    const recommendedIngredients = getRecommendations(targetElements, options);
    
    // Debug the results
    console.log("Filtered ingredients:", 
      Object.entries(recommendedIngredients).reduce((total, [_, ingredients]) => 
        total + (ingredients?.length || 0), 0)
    );
    console.log("Modality distribution:", 
      Object.entries(recommendedIngredients).flatMap(([_, ingredients]) => ingredients || [])
        .reduce((counts, ingredient) => {
          const modality = ingredient.modality || 'Unknown';
          counts[modality] = (counts[modality] || 0) + 1;
          return counts;
        }, {} as Record<string, number>)
    );
    
    setRecommendations(recommendedIngredients);
    setLoading(false);
  }, [targetElements, currentZodiac, selectedSeason, dietaryFilter, modalityFilter, zodiacSign]);
  
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className={`${styles.tagIcon} ${styles.fire}`} size={16} />;
      case 'Water': return <Droplets className={`${styles.tagIcon} ${styles.water}`} size={16} />;
      case 'Earth': return <Mountain className={`${styles.tagIcon} ${styles.earth}`} size={16} />;
      case 'Air': return <Wind className={`${styles.tagIcon} ${styles.air}`} size={16} />;
      default: return null;
    }
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
  
  const renderIngredientDetails = (ingredient: Ingredient) => {
    // Calculate properties 
    const alchemicalProps = calculateAlchemicalProperties(ingredient);
    const thermodynamicProps = calculateThermodynamicProperties(alchemicalProps, ingredient.elementalProperties);
    
    // Determine modality if not already present
    const modality = ingredient.modality || 
      determineIngredientModality(ingredient.elementalProperties, ingredient.qualities || []);
    
    return (
      <div className="ingredient-details">
        <h3>{ingredient.name}</h3>
        <p>{ingredient.description}</p>
        
        {/* Basic Properties */}
        <div className={styles.basicProperties}>
          <div className={styles.modalityTag}>
            <span className={styles.propertyLabel}>Quality:</span>
            <span className={`${styles.modalityValue} ${styles[modality.toLowerCase()]}`}>
              {modality}
            </span>
          </div>
        </div>
        
        {/* Flavor Profile */}
        <div className="flavor-profile">
          <h4>Flavor Profile</h4>
          {ingredient.sensoryProfile && (
            <div className={styles.sensoryHighlights}>
              {Object.entries(ingredient.sensoryProfile.taste)
                .filter(([_, value]) => (value as number) > 0.6)
                .slice(0, 3)
                .map(([type, value]) => (
                  <span key={type} className={styles.flavorTag}>
                    {type}: {Math.round((value as number) * 100)}%
                  </span>
                ))}
            </div>
          )}
        </div>
        
        {/* Alchemical Properties - using calculated values */}
        <div className="alchemical-properties">
          <h4>Alchemical Properties</h4>
          <div className="properties-grid">
            <div className="property">
              <span>Spirit:</span> {alchemicalProps.spirit.toFixed(1)}
            </div>
            <div className="property">
              <span>Essence:</span> {alchemicalProps.essence.toFixed(1)}
            </div>
            <div className="property">
              <span>Matter:</span> {alchemicalProps.matter.toFixed(1)}
            </div>
            <div className="property">
              <span>Substance:</span> {alchemicalProps.substance.toFixed(1)}
            </div>
          </div>
        </div>
        
        {/* Thermodynamic Properties - using calculated values */}
        <div className="thermodynamic-properties">
          <h4>Thermodynamic Properties</h4>
          <div className="properties-grid">
            <div className="property">
              <span>Heat:</span> {thermodynamicProps.heat.toFixed(2)}
            </div>
            <div className="property">
              <span>Entropy:</span> {thermodynamicProps.entropy.toFixed(2)}
            </div>
            <div className="property">
              <span>Reactivity:</span> {thermodynamicProps.reactivity.toFixed(2)}
            </div>
            <div className="property">
              <span>Energy:</span> {thermodynamicProps.energy.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const calculateAlchemicalPropertiesForDisplay = (elementalProperties: ElementalProperties) => {
    // Use the imported calculation function
    const ingredient = { elementalProperties } as Ingredient;
    return calculateAlchemicalProperties(ingredient);
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

        <div className={styles.filterGroup}>
          <label htmlFor="modality-filter" className={styles.filterLabel}>Quality:</label>
          <select 
            id="modality-filter" 
            className={`${styles.select} ${styles.modalitySelect}`}
            value={modalityFilter}
            onChange={(e) => {
              console.log("Setting modality filter to:", e.target.value);
              setModalityFilter(e.target.value);
            }}
          >
            <option value="all">All Qualities</option>
            <option value="Cardinal">Cardinal (Initiating)</option>
            <option value="Fixed">Fixed (Stabilizing)</option>
            <option value="Mutable">Mutable (Adaptable)</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category-filter" className={styles.filterLabel}>Category:</label>
          <select 
            id="category-filter" 
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="proteins">Proteins</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="herbs">Herbs</option>
            <option value="spices">Spices</option>
            <option value="grains">Grains</option>
            <option value="oils">Oils</option>
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
      
      {modalityFilter !== 'all' && (
        <div className={styles.activeFilter}>
          <div className={styles.filterBadge}>
            <span className={styles.filterBadgeLabel}>Quality:</span>
            <span className={`${styles.modalityBadge} ${styles[modalityFilter.toLowerCase()]}`}>
              {modalityFilter}
            </span>
          </div>
          <button 
            className={styles.clearFilterButton}
            onClick={() => setModalityFilter('all')}
          >
            Clear
          </button>
        </div>
      )}
      
      <div className={styles.categorizedList}>
        {Object.entries(recommendations)
          .filter(([category]) => categoryFilter === 'all' || 
            category.toLowerCase().includes(categoryFilter.toLowerCase()))
          .map(([category, ingredients]) => (
            <div 
              key={category} 
              className={styles.categorySection}
              data-category={category}
            >
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.list}>
                {ingredients?.map((ingredient) => {
                  // Determine modality for each ingredient if not already defined
                  const modality = ingredient.modality || 
                    determineIngredientModality(ingredient.elementalProperties, ingredient.qualities || []);
                  
                  return (
                    <div key={ingredient.name} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.ingredientName}>{ingredient.name}</h3>
                        <span className={styles.score}>{Math.round((ingredient.totalScore || 0.75) * 100)}% Match</span>
                      </div>
                      
                      {ingredient.description && (
                        <p className={styles.description}>{ingredient.description}</p>
                      )}
                      
                      {/* Add modality display with properly defined modality variable */}
                      <div className={styles.modalityContainer}>
                        <span className={styles.modalityLabel}>Quality:</span>
                        <span className={`${styles.modalityBadge} ${styles[modality.toLowerCase()]}`}>
                          {modality}
                        </span>
                      </div>
                      
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
                          const alchemicalProps = calculateAlchemicalPropertiesForDisplay(ingredient.elementalProperties);
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
                          <span className={styles.scoreValue}>{Math.round((ingredient.elementalScore || 0.7) * 100)}%</span>
                        </div>
                        
                        <div className={styles.scoreCategory}>
                          <span className={styles.scoreLabel}>Astrological</span>
                          <span className={styles.scoreValue}>{Math.round((ingredient.astrologicalScore || 0.6) * 100)}%</span>
                        </div>
                        
                        <div className={styles.scoreCategory}>
                          <span className={styles.scoreLabel}>Seasonal</span>
                          <span className={styles.scoreValue}>{Math.round((ingredient.seasonalScore || 0.8) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 
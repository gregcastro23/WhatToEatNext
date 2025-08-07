'use client';

import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import { useState, useEffect } from 'react';


import type { Modality } from '@/data/ingredients/types';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { log } from '@/services/LoggingService';
import type { ElementalProperties, Season, Ingredient } from '@/types/alchemy';
import { getIngredientRecommendations, IngredientRecommendation, RecommendationOptions, GroupedIngredientRecommendations } from '@/utils/ingredientRecommender';
import { toZodiacSign } from '@/utils/zodiacUtils';

import styles from './IngredientRecommendations.module.css';

// Helper function to adapt the elemental properties for the recommender system
async function getRecommendations(
  elementalProps: ElementalProperties | undefined,
  options: RecommendationOptions
): Promise<GroupedIngredientRecommendations> {
  const astroData = useAstrologicalState();
  
  // ✅ Pattern MM-1: Safe type assertion for astrological data access
  const astroState = (astroData as unknown) as ElementalProperties;
  const planetaryPositions = astroState.planetaryPositions;
  const moonPhase = astroState.moonPhase;
  const aspects = astroState.aspects;
  const currentZodiac = astroState.currentZodiac;
  
  // Create an object with real astrological state data
  const astroStateData = {
    elementalProperties: elementalProps || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    timestamp: new Date(),
    currentStability: 1.0,
    // Use actual planetary alignment data from astrological context
    planetaryAlignment: (planetaryPositions as unknown as ElementalProperties) || {},
    dominantElement: Object.entries(elementalProps || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([element]) => element)[0] || 'Fire',
    zodiacSign: String(options.currentZodiac || currentZodiac || 'aries'),
    // Use actual active planets from planetary positions
    activePlanets: planetaryPositions ? Object.keys(planetaryPositions as unknown as ElementalProperties) : 
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
    // Use actual moon phase
    lunarPhase: String(moonPhase || 'full moon'),
    // Add aspects for additional context
    aspects: Array.isArray(aspects) ? aspects : []
  };
  
  // ✅ Pattern MM-1: Safe type assertion for ingredient recommendations
  return await getIngredientRecommendations(astroStateData as unknown as ElementalProperties & {
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number; }>;
    zodiacSign: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<any>;
  }, options);
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
  const [showAlchemicalProperties, setShowAlchemicalProperties] = useState(false);
  
  useEffect(() => {
    // Get recommendations with current filters
    setLoading(true);
    
    const options = {
      currentSeason: selectedSeason,
      dietaryPreferences: dietaryFilter !== 'all' ? [dietaryFilter] : [],
      modalityPreference: modalityFilter !== 'all' ? modalityFilter as Modality : undefined,
      currentZodiac: zodiacSign,
      limit: 48 // Doubled from 24 to show more recommendations
    };
    
    // ✅ Pattern GG-6: Safe async function call with proper error handling
    const loadRecommendations = async () => {
      try {
        const recommendedIngredients = await getRecommendations(targetElements, options);
        setRecommendations(recommendedIngredients);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations({});
      } finally {
        setLoading(false);
      }
    };
    
    void loadRecommendations();
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
  
  const _getSensoryProfileBar = (value: number, type: string) => {
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
  
  const _renderIngredientDetails = (ingredient: Ingredient) => {
    // Get the elemental properties
    const elementalProps = ingredient.elementalProperties || {
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    };
    
    // Calculate alchemical properties 
    const alchemicalProps = calculateAlchemicalPropertiesForDisplay(elementalProps);
    
    // Calculate thermodynamic properties based on elemental properties
    const thermodynamicProps = {
      heat: elementalProps.Fire * 1.2 + elementalProps.Air * 0.4,
      entropy: elementalProps.Air * 1.1 + elementalProps.Fire * 0.5,
      reactivity: elementalProps.Water * 0.8 + elementalProps.Fire * 0.7,
      energy: elementalProps.Fire * 0.9 + elementalProps.Air * 0.8
    };
    
    // ✅ Pattern MM-1: Safe type assertion for ingredient score
    const ingredientData = (ingredient as unknown) as ElementalProperties;
    const score = Number(ingredientData.score) || 0;
    const matchPercentage = !isNaN(score) 
      ? `${Math.round(score * 100)}%`
      : '50%';
    
    return (
      <div className={styles.ingredientDetails} key={ingredient.name}>
        <div className={styles.header}>
          <h3 className={styles.ingredientName}>{ingredient.name}</h3>
          <div className={styles.category}>{ingredient.category}</div>
          {score > 0 && (
            <div className={styles.matchScore}>
              Match: <span className={styles.scoreValue}>{matchPercentage}</span>
            </div>
          )}
        </div>
        
        {/* Elemental Balance */}
        <div className={styles.elementalBalance}>
          <h4>Elemental Balance</h4>
          <div className={styles.elementBars}>
            <div className={styles.elementBar}>
              <span className={styles.elementIcon}>{getElementIcon('Fire')}</span>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.fireBar}`}
                  style={{ width: `${elementalProps.Fire * 100}%` }}
                ></div>
              </div>
              <span className={styles.elementValue}>{Math.round(elementalProps.Fire * 100)}%</span>
            </div>
            <div className={styles.elementBar}>
              <span className={styles.elementIcon}>{getElementIcon('Water')}</span>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.waterBar}`}
                  style={{ width: `${elementalProps.Water * 100}%` }}
                ></div>
              </div>
              <span className={styles.elementValue}>{Math.round(elementalProps.Water * 100)}%</span>
            </div>
            <div className={styles.elementBar}>
              <span className={styles.elementIcon}>{getElementIcon('Earth')}</span>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.earthBar}`}
                  style={{ width: `${elementalProps.Earth * 100}%` }}
                ></div>
              </div>
              <span className={styles.elementValue}>{Math.round(elementalProps.Earth * 100)}%</span>
            </div>
            <div className={styles.elementBar}>
              <span className={styles.elementIcon}>{getElementIcon('Air')}</span>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${styles.airBar}`}
                  style={{ width: `${elementalProps.Air * 100}%` }}
                ></div>
              </div>
              <span className={styles.elementValue}>{Math.round(elementalProps.Air * 100)}%</span>
            </div>
          </div>
        </div>
        
        {/* Flavor Profile */}
        <div className="flavor-profile">
          <h4>Flavor Profile</h4>
          {ingredientData.sensoryProfile && (
            <div className={styles.sensoryHighlights}>
              {Object.entries(((ingredientData.sensoryProfile as unknown as ElementalProperties).taste as unknown as ElementalProperties) || {})
                .filter(([_, value]) => Number(value || 0) > 0.6)
                .slice(0, 3)
                .map(([type, value]) => (
                  <span key={type} className={styles.flavorTag}>
                    {type}: {Math.round(Number(value) * 100)}%
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
  
  const _calculateAlchemicalPropertiesForDisplay = (elementalProperties: ElementalProperties) => {
    // Default values with proper elemental calculations
    return {
      spirit: elementalProperties.Fire * 0.7 + elementalProperties.Air * 0.3,
      essence: elementalProperties.Water * 0.6 + elementalProperties.Fire * 0.4,
      matter: elementalProperties.Earth * 0.8 + elementalProperties.Water * 0.2,
      substance: elementalProperties.Earth * 0.5 + elementalProperties.Air * 0.5
    };
  };
  
  // Display a compact ingredient card
  const renderCompactIngredientCard = (ingredient: IngredientRecommendation) => {
    // ✅ Pattern MM-1: Safe type assertion for ingredient access
    const ingredientData = (ingredient as unknown) as ElementalProperties;
    const score = Number(ingredientData.score) || 0;
    
    // Get elemental properties
    const elementalProps = ingredient.elementalProperties || {
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    };
    
    // ✅ Pattern KK-1: Safe number conversion for match percentage
    const matchPercentage = !isNaN(score)
      ? `${Math.round(score * 100)}%`
      : '50%';
    
    // Get dominant element for styling
    const dominantElement = Object.entries(elementalProps)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return (
      <div 
        className={`${styles.compactCard} ${styles[`element${dominantElement}`]}`} 
        key={ingredient.name}
      >
        <div className={styles.compactCardHeader}>
          <h3 className={styles.compactIngredientName}>{ingredient.name}</h3>
          {matchPercentage && (
            <span className={styles.compactScore}>{matchPercentage}</span>
          )}
        </div>
        
        {/* Simplified Element Display */}
        <div className={styles.compactElementBars}>
          <div className={styles.elementBar}>
            <span className={styles.elementIcon}>{getElementIcon('Fire')}</span>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.bar} ${styles.fireBar}`}
                style={{ width: `${elementalProps.Fire * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.elementBar}>
            <span className={styles.elementIcon}>{getElementIcon('Water')}</span>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.bar} ${styles.waterBar}`}
                style={{ width: `${elementalProps.Water * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.elementBar}>
            <span className={styles.elementIcon}>{getElementIcon('Earth')}</span>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.bar} ${styles.earthBar}`}
                style={{ width: `${elementalProps.Earth * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.elementBar}>
            <span className={styles.elementIcon}>{getElementIcon('Air')}</span>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.bar} ${styles.airBar}`}
                style={{ width: `${elementalProps.Air * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Show category or modality */}
        <div className={styles.compactFooter}>
          {ingredient.category && (
            <span className={styles.compactCategory}>{ingredient.category}</span>
          )}
          {ingredient.modality && (
            <span className={`${styles.modalityBadge} ${styles[ingredient.modality.toLowerCase()]}`}>
              {ingredient.modality}
            </span>
          )}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return <div className={styles.loading}>Finding suitable ingredients...</div>;
  }
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Celestial Ingredient Recommendations</h2>
      
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
            <option value="fall">Fall</option>
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
            <option value="pescatarian">Pescatarian</option>
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
              log.info("Setting modality filter to:", { value: e.target.value });
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
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="proteins">Proteins</option>
            <option value="grains">Grains</option>
            <option value="herbs">Herbs</option>
            <option value="spices">Spices</option>
            <option value="seasonings">Seasonings</option>
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
            className={`${styles.toggleButton} ${showAlchemicalProperties ? styles.active : ''}`}
            onClick={() => setShowAlchemicalProperties(!showAlchemicalProperties)}
          >
            {showAlchemicalProperties ? 'Hide Alchemical Properties' : 'Show Alchemical Properties'}
          </button>
        </div>
      </div>
      
      {Object.entries(recommendations).length > 0 ? (
        <div className={styles.recommendationsContainer}>
          {/* Render recommendations by category */}
          {categoryFilter === 'all' ? (
            // Render all categories
            Object.entries(recommendations)
              .filter(([_category, items]) => items && items.length > 0)
              .map(([category, items]) => (
                <div key={category} className={styles.categorySection} data-category={category}>
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  <div className={styles.compactGrid}>
                    {items?.map(item => renderCompactIngredientCard(item))}
                  </div>
                </div>
              ))
          ) : (
            // Render only the selected category
            recommendations[categoryFilter] && (recommendations[categoryFilter]?.length ?? 0) > 0 ? (
              <div className={styles.categorySection} data-category={categoryFilter}>
                <h3 className={styles.categoryTitle}>{categoryFilter}</h3>
                <div className={styles.compactGrid}>
                  {recommendations[categoryFilter]?.map(item => renderCompactIngredientCard(item))}
                </div>
              </div>
            ) : (
              <div className={styles.error}>
                No ingredients found in the {categoryFilter} category.
              </div>
            )
          )}
          
          {/* Show message if no recommendations */}
          {Object.keys(recommendations).length === 0 && (
            <div className={styles.error}>
              No ingredients found with the current filters. Try changing your criteria.
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noResults}>
          No ingredients found matching your filters.
        </div>
      )}
    </div>
  );
}
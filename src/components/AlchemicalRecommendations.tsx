import React, { useState, useMemo } from 'react';
import { RulingPlanet } from '@/constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import { useAlchemicalRecommendations } from '@/hooks/useAlchemicalRecommendations';
import { ElementalItem } from '@/calculations/alchemicalTransformation';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { LunarPhase, LunarPhaseWithSpaces, ZodiacSign, PlanetaryAspect } from '@/types/alchemy';

// Import the correct data sources
import allIngredients from '@/data/ingredients';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { cuisines } from '@/data/cuisines';

// Add import for modality type and utils
import type { Modality } from '@/data/ingredients/types';
import { determineIngredientModality } from '@/utils/ingredientUtils';

interface AlchemicalRecommendationsProps {
  // If these aren't passed, the component will use current astronomical conditions
  planetPositions?: Record<RulingPlanet, number>;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[];
}

const AlchemicalRecommendationsView: React.FC<AlchemicalRecommendationsProps> = ({
  planetPositions,
  isDaytime = true,
  currentZodiac,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = []
}) => {
  // Use AlchemicalContext to get current astronomical state if not provided
  const alchemicalContext = useAlchemical();
  
  // Use context values as fallbacks if props aren't provided
  const resolvedPlanetaryPositions = useMemo(() => {
    if (planetPositions) {
      return planetPositions;
    }
    
    // Convert from PlanetaryPositionsType to Record<RulingPlanet, number>
    if (alchemicalContext.planetaryPositions) {
      const positions: Record<RulingPlanet, number> = {
        Sun: 0,
        Moon: 0,
        Mercury: 0,
        Venus: 0,
        Mars: 0,
        Jupiter: 0,
        Saturn: 0,
        Uranus: 0,
        Neptune: 0,
        Pluto: 0
      };
      
      // Extract degrees from the planetary positions
      Object.entries(alchemicalContext.planetaryPositions).forEach(([planet, data]) => {
        if (planet in positions) {
          // Fix TS2339: Property 'degree' does not exist on type 'unknown'
          const planetData = data as any;
          const degree = planetData?.degree;
          positions[planet as RulingPlanet] = degree || 0;
        }
      });
      
      return positions;
    }
    
    // Default fallback
    return {
      Sun: 0,
      Moon: 0,
      Mercury: 0,
      Venus: 0,
      Mars: 0,
      Jupiter: 0,
      Saturn: 0,
      Uranus: 0,
      Neptune: 0,
      Pluto: 0
    };
  }, [planetPositions, alchemicalContext.planetaryPositions]);
  
  const resolvedIsDaytime = isDaytime !== undefined ? isDaytime : alchemicalContext.isDaytime;
  const resolvedCurrentZodiac = currentZodiac || 
    (alchemicalContext.state?.astrologicalState?.zodiacSign as ZodiacSign) || null;
  
  // Fix the lunar phase type resolution
  const resolvedLunarPhase: LunarPhaseWithSpaces = lunarPhase || 
    (alchemicalContext.state?.astrologicalState?.lunarPhase as LunarPhaseWithSpaces) || 
    'new moon';
  
  // State for targeting specific elements or properties
  const [targetElement, setTargetElement] = useState<ElementalCharacter | undefined>(undefined);
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty | undefined>(undefined);
  
  // Add state for modality filtering
  const [modalityFilter, setModalityFilter] = useState<Modality | 'all'>('all');
  
  // Convert ingredients object to an array of ElementalItem objects
  const ingredientsArray = useMemo(() => {
    return Object.entries(allIngredients).map(([key, ingredient]) => {
      // Get ingredient elemental properties or calculate them
      let elementalProps;
      if ((ingredient as any).elementalProperties) {
        elementalProps = (ingredient as any).elementalProperties;
      } else {
        // Calculate based on ingredient category and attributes
        const category = (ingredient as any).category || '';
        const rulingPlanets = (ingredient as any).astrologicalProfile?.rulingPlanets || [];
        
        // Start with empty properties
        elementalProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        // Adjust by category
        if (category.toLowerCase().includes('vegetable')) {
          elementalProps.Earth += 0.5;
          elementalProps.Water += 0.3;
        } else if (category.toLowerCase().includes('fruit')) {
          elementalProps.Water += 0.4;
          elementalProps.Air += 0.3;
        } else if (category.toLowerCase().includes('protein') || category.toLowerCase().includes('meat')) {
          elementalProps.Fire += 0.4;
          elementalProps.Earth += 0.3;
        } else if (category.toLowerCase().includes('grain')) {
          elementalProps.Earth += 0.5;
          elementalProps.Air += 0.2;
        } else if (category.toLowerCase().includes('herb') || category.toLowerCase().includes('spice')) {
          elementalProps.Fire += 0.3;
          elementalProps.Air += 0.4;
        }
        
        // Adjust by ruling planets
        rulingPlanets.forEach((planet: string) => {
          switch (planet.toLowerCase()) {
            case 'sun':
              elementalProps.Fire += 0.2;
              break;
            case 'moon':
              elementalProps.Water += 0.2;
              break;
            case 'mercury':
              elementalProps.Air += 0.2;
              break;
            case 'venus':
              elementalProps.Earth += 0.1;
              elementalProps.Water += 0.1;
              break;
            case 'mars':
              elementalProps.Fire += 0.2;
              break;
            case 'jupiter':
              elementalProps.Air += 0.1;
              elementalProps.Fire += 0.1;
              break;
            case 'saturn':
              elementalProps.Earth += 0.2;
              break;
          }
        });
        
        // Normalize values
        const total = Object.values(elementalProps).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          for (const element in elementalProps) {
            elementalProps[element as keyof typeof elementalProps] /= total;
          }
        } else {
          // If nothing was calculated, use balanced elements
          elementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        }
      }
      
      return {
        id: key,
        name: (ingredient as any)?.name || key,
        elementalProperties: elementalProps,
        qualities: (ingredient as any).qualities || [],
        modality: (ingredient as any).modality
      } as ElementalItem;
    });
  }, []);
  
  // Convert cooking methods to ElementalItem array
  const cookingMethodsArray = useMemo(() => {
    return Object.entries(cookingMethods).map(([key, method]) => {
      // Get cooking method elemental effect or calculate it
      let elementalEffect;
      if ((method as any).elementalEffect) {
        elementalEffect = (method as any).elementalEffect;
      } else {
        // Calculate based on cooking method characteristics
        elementalEffect = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        const methodName = ((method as any).name || key).toLowerCase();
        
        // Adjust by cooking method type
        if (methodName.includes('grill') || methodName.includes('roast') || methodName.includes('bake') ||
            methodName.includes('broil') || methodName.includes('fry')) {
          elementalEffect.Fire += 0.6;
          elementalEffect.Air += 0.2;
        } else if (methodName.includes('steam') || methodName.includes('boil') || methodName.includes('poach') ||
                  methodName.includes('simmer')) {
          elementalEffect.Water += 0.6;
          elementalEffect.Air += 0.2;
        } else if (methodName.includes('saute') || methodName.includes('stir-fry')) {
          elementalEffect.Fire += 0.4;
          elementalEffect.Air += 0.4;
        } else if (methodName.includes('braise') || methodName.includes('stew')) {
          elementalEffect.Water += 0.4;
          elementalEffect.Earth += 0.4;
        } else if (methodName.includes('smoke') || methodName.includes('cure')) {
          elementalEffect.Air += 0.5;
          elementalEffect.Fire += 0.3;
        } else if (methodName.includes('ferment') || methodName.includes('pickle')) {
          elementalEffect.Water += 0.4;
          elementalEffect.Earth += 0.4;
        } else {
          // Generic cooking method - slight emphasis on fire
          elementalEffect.Fire += 0.3;
          elementalEffect.Earth += 0.3;
          elementalEffect.Water += 0.2;
          elementalEffect.Air += 0.2;
        }
        
        // Normalize values
        const total = Object.values(elementalEffect).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          for (const element in elementalEffect) {
            elementalEffect[element as keyof typeof elementalEffect] /= total;
          }
        }
      }
      
      return {
        id: key,
        name: (method as any).name || key,
        elementalProperties: elementalEffect
      } as ElementalItem;
    });
  }, []);
  
  // Convert cuisines to ElementalItem array
  const cuisinesArray = useMemo(() => {
    return Object.entries(cuisines).map(([key, cuisine]) => {
      // Get cuisine elemental state or calculate it
      let elementalState;
      if ((cuisine as any).elementalState) {
        elementalState = (cuisine as any).elementalState;
      } else {
        // Calculate based on cuisine characteristics
        elementalState = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        const cuisineName = ((cuisine as any).name || key).toLowerCase();
        const region = ((cuisine as any).region || '').toLowerCase();
        
        // Adjust by cuisine type/region
        if (cuisineName.includes('indian') || cuisineName.includes('thai') || 
            cuisineName.includes('mexican') || cuisineName.includes('cajun')) {
          // Spicy cuisines tend to have more Fire
          elementalState.Fire += 0.5;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('japanese') || cuisineName.includes('nordic') ||
                  cuisineName.includes('korean')) {
          // More balanced cuisines
          elementalState.Water += 0.4;
          elementalState.Earth += 0.3;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('french') || cuisineName.includes('italian')) {
          // Hearty European cuisines
          elementalState.Earth += 0.4;
          elementalState.Fire += 0.3;
          elementalState.Water += 0.2;
        } else if (cuisineName.includes('mediter')) {
          // Mediterranean cuisines
          elementalState.Earth += 0.3;
          elementalState.Air += 0.3;
          elementalState.Fire += 0.2;
        } else if (cuisineName.includes('greek') || cuisineName.includes('spanish')) {
          // Mediterranean cuisines
          elementalState.Earth += 0.3;
          elementalState.Fire += 0.3;
          elementalState.Air += 0.2;
        } else {
          // Default profile with slight Earth emphasis for unknown cuisines
          elementalState.Earth += 0.3;
          elementalState.Water += 0.3;
          elementalState.Fire += 0.2;
          elementalState.Air += 0.2;
        }
        
        // Normalize values
        const total = Object.values(elementalState).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          for (const element in elementalState) {
            elementalState[element as keyof typeof elementalState] /= total;
          }
        }
      }
      
      return {
        id: key,
        name: (cuisine as any).name || key,
        elementalProperties: elementalState
      } as ElementalItem;
    });
  }, []);
  
  // Filter ingredients array by modality
  const filteredIngredientsArray = useMemo(() => {
    if (modalityFilter === 'all') return ingredientsArray;
    
    return ingredientsArray.filter(ingredient => {
      const elementalProps = ingredient.elementalProperties;
      const qualities = ingredient.qualities || [];
      const modality = ingredient.modality || 
        determineIngredientModality(elementalProps, qualities);
      return modality === modalityFilter;
    });
  }, [ingredientsArray, modalityFilter]);
  
  // Get recommendations using our hook
  const {
    recommendations,
    transformedIngredients,
    transformedMethods,
    transformedCuisines,
    loading,
    error,
    energeticProfile
  } = useAlchemicalRecommendations({
    ingredients: filteredIngredientsArray,
    cookingMethods: cookingMethodsArray,
    cuisines: cuisinesArray,
    planetPositions: resolvedPlanetaryPositions,
    isDaytime: resolvedIsDaytime,
    targetElement,
    targetAlchemicalProperty: targetProperty,
    count: 5,
    currentZodiac: resolvedCurrentZodiac,
    lunarPhase: resolvedLunarPhase,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    aspects
  });
  
  if (loading) return <div>Loading alchemical recommendations...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="alchemical-recommendations">
      <h2>Alchemical Recommendations</h2>
      
      <div className="alchemical-stats">
        <h3>Dominant Influences</h3>
        <div className="stat-grid">
          <div className="stat">
            <span className="label">Dominant Element:</span>
            <span className="value">{recommendations.dominantElement}</span>
          </div>
          <div className="stat">
            <span className="label">Dominant Alchemical Property:</span>
            <span className="value">{recommendations.dominantAlchemicalProperty}</span>
          </div>
          {resolvedCurrentZodiac && (
            <div className="stat">
              <span className="label">Current Zodiac:</span>
              <span className="value">{resolvedCurrentZodiac}</span>
            </div>
          )}
          {resolvedLunarPhase && (
            <div className="stat">
              <span className="label">Lunar Phase:</span>
              <span className="value">{resolvedLunarPhase}</span>
            </div>
          )}
        </div>
        
        <h3>Energetic Profile</h3>
        <div className="stat-grid">
          <div className="stat">
            <span className="label">Heat:</span>
            <span className="value">{recommendations.heat.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Entropy:</span>
            <span className="value">{recommendations.entropy.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Reactivity:</span>
            <span className="value">{recommendations.reactivity.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Greg's Energy:</span>
            <span className="value">{recommendations.gregsEnergy.toFixed(2)}</span>
          </div>
        </div>
        
        {/* New section to display the energetic profile details */}
        {energeticProfile && (
          <div className="elemental-balance">
            <h3>Elemental Balance</h3>
            <div className="balance-bars">
              {Object.entries(energeticProfile.elementalBalance).map(([element, value]) => (
                <div key={element} className="balance-bar">
                  <span className="element-label">{element}</span>
                  <div className="bar-container">
                    <div 
                      className={`bar-fill ${element.toLowerCase()}`} 
                      style={{ width: `${Math.min(100, value * 100)}%` }}
                    />
                  </div>
                  <span className="percentage">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
            
            <h3>Alchemical Properties</h3>
            <div className="balance-bars">
              {Object.entries(energeticProfile.alchemicalProperties).map(([property, value]) => (
                <div key={property} className="balance-bar">
                  <span className="property-label">{property}</span>
                  <div className="bar-container">
                    <div 
                      className={`bar-fill ${property.toLowerCase()}`} 
                      style={{ width: `${Math.min(100, value * 100)}%` }}
                    />
                  </div>
                  <span className="percentage">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="recommendations-filters">
        <h3>Filter Recommendations</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Element:</label>
            <select 
              value={targetElement || ''} 
              onChange={(e) => setTargetElement(e.target.value as ElementalCharacter || undefined)}
            >
              <option value="">Any Element</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Air">Air</option>
              <option value="Earth">Earth</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Alchemical Property:</label>
            <select 
              value={targetProperty || ''} 
              onChange={(e) => setTargetProperty(e.target.value as AlchemicalProperty || undefined)}
            >
              <option value="">Any Property</option>
              <option value="Spirit">Spirit</option>
              <option value="Essence">Essence</option>
              <option value="Matter">Matter</option>
              <option value="Substance">Substance</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="modality-filter">Quality:</label>
            <select 
              id="modality-filter" 
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as Modality | 'all')}
            >
              <option value="all">All</option>
              <option value="Cardinal">Cardinal</option>
              <option value="Fixed">Fixed</option>
              <option value="Mutable">Mutable</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="recommendation-sections">
        {/* Recommended Ingredients */}
        <div className="recommendation-section">
          <h3>Recommended Ingredients</h3>
          {recommendations.topIngredients.length > 0 ? (
            <ul className="recommendation-list">
              {recommendations.topIngredients.map(ingredient => (
                <li key={ingredient.id} className="recommendation-item">
                  <h4>{ingredient.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{ingredient.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{ingredient.dominantAlchemicalProperty}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Greg's Energy:</span>
                      <span className="value">{ingredient.gregsEnergy.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = ingredient.modality as any;
                      const modalityStr = modalityData?.toLowerCase ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {ingredient.modality}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredient recommendations available.</p>
          )}
        </div>
        
        {/* Recommended Cooking Methods */}
        <div className="recommendation-section">
          <h3>Recommended Cooking Methods</h3>
          {recommendations.topMethods.length > 0 ? (
            <ul className="recommendation-list">
              {recommendations.topMethods.map(method => (
                <li key={method.id} className="recommendation-item">
                  <h4>{method.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{method.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{method.dominantAlchemicalProperty}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = method.modality as any;
                      const modalityStr = modalityData?.toLowerCase ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {method.modality}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No cooking method recommendations available.</p>
          )}
        </div>
        
        {/* Recommended Cuisines */}
        <div className="recommendation-section">
          <h3>Recommended Cuisines</h3>
          {recommendations.topCuisines.length > 0 ? (
            <ul className="recommendation-list">
              {recommendations.topCuisines.map(cuisine => (
                <li key={cuisine.id} className="recommendation-item">
                  <h4>{cuisine.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{cuisine.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{cuisine.dominantAlchemicalProperty}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = cuisine.modality as any;
                      const modalityStr = modalityData?.toLowerCase ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {cuisine.modality}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No cuisine recommendations available.</p>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .alchemical-recommendations {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .label {
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
        }
        
        .value {
          font-size: 1.2rem;
          color: #222;
        }
        
        .filter-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          min-width: 150px;
        }
        
        .recommendation-sections {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .recommendation-section {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          padding: 1.5rem;
        }
        
        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .recommendation-item {
          border-bottom: 1px solid #eee;
          padding: 1rem 0;
        }
        
        .recommendation-item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .detail {
          font-size: 0.9rem;
        }
        
        .item-modality {
          margin-top: 0.5rem;
          text-align: right;
        }
        
        .modality-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background-color: #f0f0f0;
          color: #555;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default AlchemicalRecommendationsView; 
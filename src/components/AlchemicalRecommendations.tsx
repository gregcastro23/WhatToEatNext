import React, { useState, useMemo } from 'react';
import { RulingPlanet } from '../constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { useAlchemicalRecommendations } from '../hooks/useAlchemicalRecommendations';
import { ElementalItem } from '../calculations/alchemicalTransformation';

// Import the correct data sources
import allIngredients from '@/data/ingredients';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { cuisines } from '@/data/cuisines';

interface AlchemicalRecommendationsProps {
  // If these aren't passed, the component will use current astronomical conditions
  planetPositions?: Record<RulingPlanet, number>;
  isDaytime?: boolean;
}

const AlchemicalRecommendationsView: React.FC<AlchemicalRecommendationsProps> = ({
  planetPositions = {
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
  },
  isDaytime = true,
}) => {
  // State for targeting specific elements or properties
  const [targetElement, setTargetElement] = useState<ElementalCharacter | undefined>(undefined);
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty | undefined>(undefined);
  
  // Convert ingredients object to an array of ElementalItem objects
  const ingredientsArray = useMemo(() => {
    return Object.entries(allIngredients).map(([key, ingredient]) => ({
      id: key,
      name: ingredient.name || key,
      elementalProperties: (ingredient as any).elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      }
    })) as ElementalItem[];
  }, []);
  
  // Convert cooking methods to ElementalItem array
  const cookingMethodsArray = useMemo(() => {
    return Object.entries(cookingMethods).map(([key, method]) => ({
      id: key,
      name: (method as any).name || key,
      elementalProperties: (method as any).elementalEffect || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      }
    })) as ElementalItem[];
  }, []);
  
  // Convert cuisines to ElementalItem array
  const cuisinesArray = useMemo(() => {
    return Object.entries(cuisines).map(([key, cuisine]) => ({
      id: key,
      name: (cuisine as any).name || key,
      elementalProperties: (cuisine as any).elementalState || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      }
    })) as ElementalItem[];
  }, []);
  
  // Get recommendations using our hook
  const {
    recommendations,
    loading,
    error
  } = useAlchemicalRecommendations({
    ingredients: ingredientsArray,
    cookingMethods: cookingMethodsArray,
    cuisines: cuisinesArray,
    planetPositions,
    isDaytime,
    targetElement,
    targetAlchemicalProperty: targetProperty,
    count: 5
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
      `}</style>
    </div>
  );
};

export default AlchemicalRecommendationsView; 
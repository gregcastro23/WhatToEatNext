import React from 'react';
import { Ingredient, RecipeIngredient, ElementalProperties } from '@/types';
import { isRecipeIngredient, getDominantElement } from '@/utils/ingredientUtils';

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
  onClick?: (ingredient: Ingredient | RecipeIngredient) => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient, 
  showAmount = false,
  onClick
}) => {
  // Determine the dominant element to style the card
  const dominantElement = getDominantElement(ingredient.elementalProperties || {
    Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
  });

  // Get class based on dominant element
  const elementClass = `element-${dominantElement.toLowerCase()}`;

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(ingredient);
    }
  };

  return (
    <div 
      className={`ingredient-card ${elementClass}`}
      onClick={handleClick}
    >
      <h3 className="ingredient-name">{ingredient.name}</h3>
      
      {showAmount && isRecipeIngredient(ingredient) && (
        <div className="ingredient-amount">
          {ingredient.amount} {ingredient.unit}
          {ingredient.preparation && <span className="ingredient-prep"> ({ingredient.preparation})</span>}
        </div>
      )}
      
      {ingredient.elementalProperties && (
        <div className="element-bars">
          <div className="element-bar">
            <span className="element-label">Fire</span>
            <div 
              className="bar fire-bar" 
              style={{ width: `${(ingredient.elementalProperties.Fire || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((ingredient.elementalProperties.Fire || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Water</span>
            <div 
              className="bar water-bar" 
              style={{ width: `${(ingredient.elementalProperties.Water || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((ingredient.elementalProperties.Water || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Earth</span>
            <div 
              className="bar earth-bar" 
              style={{ width: `${(ingredient.elementalProperties.Earth || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((ingredient.elementalProperties.Earth || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Air</span>
            <div 
              className="bar air-bar" 
              style={{ width: `${(ingredient.elementalProperties.Air || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((ingredient.elementalProperties.Air || 0) * 100)}%
            </span>
          </div>
        </div>
      )}
      
      {/* Display additional properties based on the ingredient type */}
      {isRecipeIngredient(ingredient) ? (
        <div className="recipe-ingredient-details">
          {ingredient.notes && (
            <div className="ingredient-notes">
              <em>{ingredient.notes}</em>
            </div>
          )}
          {ingredient.optional && (
            <div className="ingredient-optional">Optional</div>
          )}
        </div>
      ) : (
        <div className="full-ingredient-details">
          <div className="ingredient-category">
            {ingredient.category}{ingredient.subCategory ? ` (${ingredient.subCategory})` : ''}
          </div>
          
          {/* Apply safe type casting for ingredient properties access */}
          {(() => {
            const ingredientData = ingredient as any;
            const qualities = ingredientData?.qualities;
            const seasonality = ingredientData?.seasonality;
            
            return (
              <>
                {qualities && qualities.length > 0 && (
                  <div className="ingredient-qualities">
                    {qualities.join(', ')}
                  </div>
                )}
                
                {seasonality && seasonality.length > 0 && (
                  <div className="ingredient-seasonality">
                    <strong>Season:</strong> {seasonality.join(', ')}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// CSS styles for the component (can be moved to a separate CSS file)
const styles = `
.ingredient-card {
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ingredient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.ingredient-name {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.ingredient-amount {
  font-size: 1rem;
  margin-bottom: 12px;
}

.ingredient-prep {
  font-style: italic;
}

.ingredient-optional {
  font-style: italic;
  color: #666;
  margin-top: 8px;
}

.element-bars {
  margin: 12px 0;
}

.element-bar {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.element-label {
  width: 50px;
  font-size: 0.8rem;
}

.element-value {
  margin-left: 8px;
  font-size: 0.8rem;
  width: 40px;
}

.bar {
  height: 8px;
  border-radius: 4px;
  flex: 1;
  min-width: 5px;
}

.fire-bar {
  background: linear-gradient(to right, #ff8c00, #ff4500);
}

.water-bar {
  background: linear-gradient(to right, #00bfff, #1e90ff);
}

.earth-bar {
  background: linear-gradient(to right, #8b4513, #556b2f);
}

.air-bar {
  background: linear-gradient(to right, #f0f8ff, #b0c4de);
}

.element-fire {
  background-color: #fff0e8;
  border-left: 4px solid #ff4500;
}

.element-water {
  background-color: #e8f4ff;
  border-left: 4px solid #1e90ff;
}

.element-earth {
  background-color: #f0f2e8;
  border-left: 4px solid #556b2f;
}

.element-air {
  background-color: #f8faff;
  border-left: 4px solid #b0c4de;
}

.element-balanced {
  background-color: #f9f9f9;
  border-left: 4px solid #a9a9a9;
}

.ingredient-category {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin-top: 12px;
}

.ingredient-qualities {
  font-size: 0.9rem;
  margin-top: 8px;
  font-style: italic;
}

.ingredient-seasonality {
  font-size: 0.9rem;
  margin-top: 8px;
}
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default IngredientCard; 
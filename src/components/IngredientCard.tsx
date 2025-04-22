import React from 'react';
import { Ingredient, RecipeIngredient } from '../types';
import { ElementalProperties } from '../types/alchemy';
import { isRecipeIngredient, getDominantElement } from '../utils/ingredientUtils';

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
  onClick?: (ingredient: Ingredient | RecipeIngredient) => void;
}

// Extended ingredient interface to handle optional properties safely
interface ExtendedIngredient extends Ingredient {
  subCategory?: string;
  qualities?: string[];
  seasonality?: string[];
  preparation?: string;
}

// Extended RecipeIngredient interface with preparation
interface ExtendedRecipeIngredient extends RecipeIngredient {
  preparation?: string;
  subCategory?: string;
  qualities?: string[];
}

// Type guard for ExtendedIngredient
function isExtendedIngredient(ingredient: ExtendedIngredient | ExtendedRecipeIngredient): ingredient is ExtendedIngredient {
  return !isRecipeIngredient(ingredient as Ingredient | RecipeIngredient);
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient, 
  showAmount = false,
  onClick
}) => {
  // Determine the dominant element to style the card
  const defaultProps: ElementalProperties = {
    Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
  };

  // Cast elementalProperties to ElementalProperties type
  const elementalProps = (ingredient.elementalProperties || defaultProps) as ElementalProperties;
  const dominantElement = getDominantElement(elementalProps);

  // Get class based on dominant element (dominantElement is already a string key)
  const elementClass = `element-${dominantElement.toString().toLowerCase()}`;

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(ingredient);
    }
  };

  // Safely handle possible extended properties
  const extendedIngredient = ingredient as (ExtendedIngredient | ExtendedRecipeIngredient);

  // Safe property checks
  const hasSubCategory = 'subCategory' in extendedIngredient && typeof extendedIngredient.subCategory === 'string';
  const hasQualities = 'qualities' in extendedIngredient && Array.isArray(extendedIngredient.qualities);
  const hasSeasonality = 'seasonality' in extendedIngredient && 
    (Array.isArray(extendedIngredient.seasonality) || typeof extendedIngredient.seasonality === 'string');

  return (
    <div 
      className={`ingredient-card ${elementClass}`}
      onClick={handleClick}
    >
      <h3 className="ingredient-name">{ingredient.name}</h3>
      
      {showAmount && isRecipeIngredient(ingredient) && (
        <div className="ingredient-amount">
          {ingredient.amount} {ingredient.unit}
          {extendedIngredient.preparation && (
            <span className="ingredient-prep"> ({extendedIngredient.preparation})</span>
          )}
        </div>
      )}
      
      {ingredient.elementalProperties && (
        <div className="element-bars">
          <div className="element-bar">
            <span className="element-label">Fire</span>
            <div 
              className="bar fire-bar" 
              style={{ width: `${(elementalProps.Fire || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((elementalProps.Fire || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Water</span>
            <div 
              className="bar water-bar" 
              style={{ width: `${(elementalProps.Water || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((elementalProps.Water || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Earth</span>
            <div 
              className="bar earth-bar" 
              style={{ width: `${(elementalProps.Earth || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((elementalProps.Earth || 0) * 100)}%
            </span>
          </div>
          
          <div className="element-bar">
            <span className="element-label">Air</span>
            <div 
              className="bar air-bar" 
              style={{ width: `${(elementalProps.Air || 0) * 100}%` }}
            />
            <span className="element-value">
              {Math.round((elementalProps.Air || 0) * 100)}%
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
          {('isOptional' in ingredient ? ingredient.isOptional : 'optional' in ingredient ? ingredient.optional : false) && (
            <div className="ingredient-optional">Optional</div>
          )}
        </div>
      ) : (
        <div className="full-ingredient-details">
          <div className="ingredient-category">
            {ingredient.category}
            {hasSubCategory && ` (${extendedIngredient.subCategory})`}
          </div>
          
          {hasQualities && extendedIngredient.qualities && extendedIngredient.qualities.length > 0 && (
            <div className="ingredient-qualities">
              {extendedIngredient.qualities.join(', ')}
            </div>
          )}
          
          {hasSeasonality && (
            <div className="ingredient-seasonality">
              <strong>Season:</strong> {
                Array.isArray(extendedIngredient.seasonality) 
                  ? extendedIngredient.seasonality.join(', ')
                  : typeof extendedIngredient.seasonality === 'string' 
                    ? extendedIngredient.seasonality
                    : ''
              }
            </div>
          )}
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
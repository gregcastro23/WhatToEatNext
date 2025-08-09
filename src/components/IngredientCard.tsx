import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  ChevronDown,
  ChevronUp,
  Beaker,
  Tag,
  Clock,
  Info,
} from 'lucide-react';
import React, { useState } from 'react';

import { Ingredient, RecipeIngredient } from '@/types';
import { isRecipeIngredient, getDominantElement } from '@/utils/ingredientUtils';

import ingredientCardStyles from './IngredientCard.module.css';

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
  onClick?: (ingredient: Ingredient | RecipeIngredient) => void;
  isSelected?: boolean;
  isExpandable?: boolean;
  showAstrologicalInfo?: boolean;
  matchScore?: number;
  category?: string;
  currentZodiac?: string;
  isDaytime?: boolean;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  showAmount = false,
  onClick,
  isSelected = false,
  isExpandable = true,
  showAstrologicalInfo = true,
  matchScore,
  category,
  currentZodiac,
  isDaytime = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the dominant element to style the card
  const dominantElement = getDominantElement(
    (ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }) as any,
  );

  // Get element icon helper
  const getElementIcon = (element: string) => {
    const iconProps = { size: 16, style: { marginRight: '4px' } };
    switch (element.toLowerCase()) {
      case 'fire':
        return <Flame {...iconProps} style={{ ...iconProps.style, color: '#ef4444' }} />;
      case 'water':
        return <Droplets {...iconProps} style={{ ...iconProps.style, color: '#3b82f6' }} />;
      case 'earth':
        return <Mountain {...iconProps} style={{ ...iconProps.style, color: '#10b981' }} />;
      case 'air':
        return <Wind {...iconProps} style={{ ...iconProps.style, color: '#8b5cf6' }} />;
      default:
        return null;
    }
  };

  // Handle click event
  const handleClick = () => {
    if (isExpandable) {
      setIsExpanded(!isExpanded);
    }
    if (onClick) {
      onClick(ingredient);
    }
  };

  // Get match score color
  const getMatchScoreColor = (score?: number) => {
    if (!score) return '#6b7280';
    if (score > 0.8) return '#10b981';
    if (score > 0.6) return '#f59e0b';
    return '#6b7280';
  };

  // Get category display name
  const getCategoryDisplayName = (cat?: string) => {
    const categoryNames: Record<string, string> = {
      proteins: 'Proteins',
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      herbs: 'Herbs & Aromatics',
      spices: 'Spices & Seasonings',
      grains: 'Grains & Starches',
      oils: 'Oils & Fats',
      vinegars: 'Vinegars & Acidifiers',
    };
    return categoryNames[cat || ''] || cat || ingredient.category || 'Ingredient';
  };

  return (
    <div
      className={`${ingredientCardStyles.ingredientCard} ${ingredientCardStyles[`element${dominantElement}`]} ${isSelected ? ingredientCardStyles.selected : ''}`}
      onClick={handleClick}
      style={{
        cursor: isExpandable ? 'pointer' : 'default',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected
          ? '0 8px 25px rgba(59, 130, 246, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 4px 0',
            }}
          >
            {ingredient.name}
          </h3>
          <div
            style={{
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '500',
            }}
          >
            {getCategoryDisplayName(category)}
          </div>
        </div>

        {/* Match Score Badge */}
        {matchScore && (
          <div
            style={{
              backgroundColor: getMatchScoreColor(matchScore),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {Math.round(matchScore * 100)}%
          </div>
        )}

        {/* Expand/Collapse Button */}
        {isExpandable && (
          <button
            onClick={e => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              marginLeft: '8px',
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Recipe Amount Display */}
      {showAmount && isRecipeIngredient(ingredient) && (
        <div
          style={{
            fontSize: '14px',
            color: '#475569',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
          }}
        >
          <strong>
            {ingredient.amount} {ingredient.unit}
          </strong>
          {ingredient.preparation && (
            <span style={{ fontStyle: 'italic' }}> ({ingredient.preparation})</span>
          )}
          {ingredient.optional && (
            <span className={ingredientCardStyles.optionalBadge}>Optional</span>
          )}
        </div>
      )}

      {/* Elemental Properties Visualization */}
      {ingredient.elementalProperties && (
        <div style={{ marginBottom: '12px' }}>
          {/* Compact Elemental Bar */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              height: '6px',
              backgroundColor: '#f1f5f9',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: `${(ingredient.elementalProperties.Fire || 0) * 100}%`,
                backgroundColor: '#ef4444',
                transition: 'width 0.3s ease',
              }}
            />
            <div
              style={{
                width: `${(ingredient.elementalProperties.Water || 0) * 100}%`,
                backgroundColor: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
            <div
              style={{
                width: `${(ingredient.elementalProperties.Earth || 0) * 100}%`,
                backgroundColor: '#10b981',
                transition: 'width 0.3s ease',
              }}
            />
            <div
              style={{
                width: `${(ingredient.elementalProperties.Air || 0) * 100}%`,
                backgroundColor: '#8b5cf6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Elemental Values (shown when expanded or always for detailed view) */}
          {(isExpanded || !isExpandable) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                fontSize: '12px',
              }}
            >
              {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
                <div
                  key={element}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {getElementIcon(element)}
                  <span style={{ color: '#64748b' }}>
                    {element}: {Math.round((value || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable Details */}
      {isExpanded && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          {/* Enhanced Ingredient Details */}
          {!isRecipeIngredient(ingredient) && (
            <>
              {/* Qualities */}
              {(() => {
                const ingredientData = ingredient as any;
                const qualities = ingredientData?.qualities;

                return (
                  qualities &&
                  qualities.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div className={ingredientCardStyles.sectionHeader}>
                        <Tag size={14} />
                        Qualities
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                        }}
                      >
                        {qualities.map((quality: string, index: number) => (
                          <span key={index} className={ingredientCardStyles.tagQuality}>
                            {quality}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}

              {/* Seasonality */}
              {(() => {
                const ingredientData = ingredient as any;
                const seasonality = ingredientData?.seasonality;

                return (
                  seasonality &&
                  seasonality.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div className={ingredientCardStyles.sectionHeader}>
                        <Clock size={14} />
                        Seasonality
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                        }}
                      >
                        {seasonality.map((season: string, index: number) => (
                          <span key={index} className={ingredientCardStyles.tagSeason}>
                            {season}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}

              {/* Astrological Information */}
              {showAstrologicalInfo && (
                <div
                  style={{
                    backgroundColor: '#faf5ff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <Beaker size={16} style={{ color: '#8b5cf6' }} />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#7c3aed',
                      }}
                    >
                      Astrological Alignment
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b46c1',
                      lineHeight: '1.4',
                    }}
                  >
                    Optimally aligned with current {currentZodiac || 'cosmic'} energy and{' '}
                    {isDaytime ? 'solar' : 'lunar'} influences.
                    {matchScore &&
                      ` Match score reflects ${Math.round(matchScore * 100)}% cosmic harmony.`}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recipe Ingredient Details */}
          {isRecipeIngredient(ingredient) && (
            <div className={ingredientCardStyles.recipeDetails}>
              {ingredient.notes && (
                <div
                  style={{
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: '#64748b',
                    marginBottom: '8px',
                  }}
                >
                  <Info size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {ingredient.notes}
                </div>
              )}
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

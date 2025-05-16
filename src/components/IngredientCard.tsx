import React from 'react';
import { Ingredient, RecipeIngredient, ElementalProperties } from '@/types';
import { ChefHat, Utensils, Scale, Heart, Star, Thermometer, Leaf, Info, Calendar, AlignJustify } from 'lucide-react';
import styles from './IngredientCard.module.css';

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
  const elementClass = styles[`element${dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1)}`];

  // Handle click event
  const handleClick = (event: React.MouseEvent) => {
    // Prevent event propagation to ensure the click event doesn't trigger parent handlers
    event.stopPropagation();
    
    console.log('[IngredientCard] Click detected on ingredient:', ingredient.name);
    
    if (onClick) {
      console.log('[IngredientCard] Calling provided onClick handler');
      onClick(ingredient);
    } else {
      console.log('[IngredientCard] No onClick handler provided');
    }
  };

  return (
    <div 
      className={`${styles.ingredientCard} ${elementClass} p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
      onClick={handleClick}
      data-expandable="true"
      data-ingredient-id={ingredient.id || ingredient.name}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{ingredient.name}</h3>
        {showAmount && isRecipeIngredient(ingredient) && (
          <div className="text-sm text-gray-600">
            {ingredient.amount} {ingredient.unit}
            {ingredient.preparation && <span className="italic"> ({ingredient.preparation})</span>}
          </div>
        )}
      </div>
      
      {/* Description */}
      {ingredient.description && (
        <p className="text-sm text-gray-600 mb-4 italic">{ingredient.description}</p>
      )}
      
      {/* Category and Subcategory */}
      <div className="mb-4">
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          {ingredient.category}{ingredient.subCategory ? ` • ${ingredient.subCategory}` : ''}
        </span>
      </div>
      
      {/* Origin Information */}
      {ingredient.origin && ingredient.origin.length > 0 && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Info className="w-4 h-4" />
            Origin
          </h4>
          <div className="flex flex-wrap gap-1">
            {ingredient.origin.map((place) => (
              <span key={place} className={`${styles.tag} ${styles.tagOrigin}`}>
                {place}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Elemental Properties */}
      {ingredient.elementalProperties && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
              <div key={element} className="text-center">
                <div className={`${styles.elementBadge} ${styles[element.toLowerCase()]}`}>
                  {element.charAt(0)}
                </div>
                <div className="text-xs mt-1">{Math.round(value * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Alchemical Properties if available */}
      {ingredient.alchemicalProperties && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Beaker className="w-4 h-4" />
            Alchemical
          </h4>
          <div className={styles.alchemicalGrid}>
            {Object.entries(ingredient.alchemicalProperties).map(([property, value]) => (
              <div key={property} className="text-xs">
                <span className="font-medium">{property}:</span> {value.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Modality if available */}
      {ingredient.modality && (
        <div className="mb-3">
          <span className={`${styles.tag} ${styles.tagModality}`}>
            {ingredient.modality}
          </span>
        </div>
      )}
      
      {/* Thermodynamic Properties if available */}
      {ingredient.thermodynamicProperties && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Thermometer className="w-4 h-4" />
            Thermodynamic
          </h4>
          <div className={styles.thermodynamicGrid}>
            {Object.entries(ingredient.thermodynamicProperties).map(([property, value]) => (
              <div key={property} className="text-xs">
                <span className="font-medium">{property}:</span> {value.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sensory Profile */}
      {ingredient.sensoryProfile && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Utensils className="w-4 h-4" />
            Sensory Profile
          </h4>
          <div className={styles.sensoryGrid}>
            {Object.entries(ingredient.sensoryProfile).map(([category, traits]) => (
              <div key={category} className="mb-2">
                <span className="text-xs font-semibold">{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(traits).map(([trait, value]) => (
                    <span key={trait} className={`${styles.sensoryTag}`} 
                      style={{opacity: value > 0 ? Math.max(0.5, value) : 0.5}}>
                      {trait} {typeof value === 'number' ? `(${value.toFixed(1)})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Qualities */}
      {ingredient.qualities && ingredient.qualities.length > 0 && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <AlignJustify className="w-4 h-4" />
            Qualities
          </h4>
          <div className="flex flex-wrap gap-1">
            {ingredient.qualities.map((quality) => (
              <span key={quality} className={`${styles.tag} ${styles.tagQuality}`}>
                {quality}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Seasonality */}
      {ingredient.seasonality && ingredient.seasonality.length > 0 && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Calendar className="w-4 h-4" />
            Seasonality
          </h4>
          <div className="flex flex-wrap gap-1">
            {ingredient.seasonality.map((season) => (
              <span key={season} className={`${styles.tag} ${styles.tagSeason}`}>
                {season}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommended Cooking Methods */}
      {ingredient.recommendedCookingMethods && ingredient.recommendedCookingMethods.length > 0 && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <ChefHat className="w-4 h-4" />
            Cooking Methods
          </h4>
          <div className="flex flex-wrap gap-2">
            {ingredient.recommendedCookingMethods.map((method) => (
              <span key={typeof method === 'string' ? method : method.name} className={`${styles.tag} ${styles.tagCooking}`}>
                {typeof method === 'string' ? method : method.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Pairing Recommendations */}
      {ingredient.pairingRecommendations && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Heart className="w-4 h-4" />
            Pairings
          </h4>
          {ingredient.pairingRecommendations.complementary && ingredient.pairingRecommendations.complementary.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium">Goes well with:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {ingredient.pairingRecommendations.complementary.map((item) => (
                  <span key={item} className={`${styles.tag} ${styles.tagComplementary}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ingredient.pairingRecommendations.contrasting && ingredient.pairingRecommendations.contrasting.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium">Interesting contrasts:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {ingredient.pairingRecommendations.contrasting.map((item) => (
                  <span key={item} className={`${styles.tag} ${styles.tagContrasting}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ingredient.pairingRecommendations.toAvoid && ingredient.pairingRecommendations.toAvoid.length > 0 && (
            <div>
              <span className="text-xs font-medium">Avoid with:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {ingredient.pairingRecommendations.toAvoid.map((item) => (
                  <span key={item} className={`${styles.tag} ${styles.tagAvoid}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Storage information */}
      {ingredient.storage && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Info className="w-4 h-4" />
            Storage
          </h4>
          <div className="text-xs">
            {ingredient.storage.container && <div><span className="font-medium">Container:</span> {ingredient.storage.container}</div>}
            {ingredient.storage.duration && <div><span className="font-medium">Duration:</span> {ingredient.storage.duration}</div>}
            {ingredient.storage.temperature && <div><span className="font-medium">Temperature:</span> {
              typeof ingredient.storage.temperature === 'string' 
                ? ingredient.storage.temperature 
                : `${ingredient.storage.temperature.celsius}°C / ${ingredient.storage.temperature.fahrenheit}°F`
            }</div>}
            {ingredient.storage.notes && <div className="italic mt-1">{ingredient.storage.notes}</div>}
          </div>
        </div>
      )}
      
      {/* Preparation information */}
      {ingredient.preparation && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Utensils className="w-4 h-4" />
            Preparation
          </h4>
          <div className="text-xs">
            {ingredient.preparation.methods && ingredient.preparation.methods.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">Methods:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ingredient.preparation.methods.map((method) => (
                    <span key={method} className={`${styles.tag} ${styles.tagMethod}`}>
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ingredient.preparation.fresh && (
              <div className="mb-1">
                <span className="font-medium">Fresh:</span> {ingredient.preparation.fresh.duration} 
                {ingredient.preparation.fresh.storage && ` (${ingredient.preparation.fresh.storage})`}
                {ingredient.preparation.fresh.tips && ingredient.preparation.fresh.tips.length > 0 && (
                  <ul className="list-disc pl-4 mt-1">
                    {ingredient.preparation.fresh.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {ingredient.preparation.dried && (
              <div>
                <span className="font-medium">Dried:</span> {ingredient.preparation.dried.duration}
                {ingredient.preparation.dried.storage && ` (${ingredient.preparation.dried.storage})`}
                {ingredient.preparation.dried.tips && ingredient.preparation.dried.tips.length > 0 && (
                  <ul className="list-disc pl-4 mt-1">
                    {ingredient.preparation.dried.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Nutritional Information */}
      {ingredient.nutrition && (
        <div className="mb-4">
          <h4 className={styles.sectionHeader}>
            <Scale className="w-4 h-4" />
            Nutrition
          </h4>
          <div className={styles.nutritionGrid}>
            <div>Calories: {ingredient.nutrition.calories}</div>
            <div>Protein: {ingredient.nutrition.protein}g</div>
            <div>Carbs: {ingredient.nutrition.carbs}g</div>
            <div>Fat: {ingredient.nutrition.fat}g</div>
          </div>
        </div>
      )}
      
      {/* Culinary Applications */}
      {ingredient.culinaryApplications && (
        <div className={`${styles.culinarySection} mb-4`}>
          <h4 className={styles.sectionHeader}>
            <Star className="w-4 h-4" />
            Culinary Uses
          </h4>
          <div className="space-y-2">
            {Object.entries(ingredient.culinaryApplications).map(([method, details]) => (
              <div key={method} className={styles.culinaryMethod}>
                <span className="text-xs font-medium">{method}:</span>
                {details.notes && (
                  <p className={styles.culinaryNotes}>{Array.isArray(details.notes) ? details.notes.join(', ') : details.notes}</p>
                )}
                {details.dishes && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {details.dishes.map((dish) => (
                      <span key={dish} className={`${styles.tag} ${styles.tagDish}`}>
                        {dish}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recipe-specific details */}
      {isRecipeIngredient(ingredient) && (
        <div className={styles.recipeDetails}>
          {ingredient.notes && (
            <div className="text-sm text-gray-600 italic">{ingredient.notes}</div>
          )}
          {ingredient.optional && (
            <div className={styles.optionalBadge}>Optional</div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to determine dominant element
function getDominantElement(elementalProperties: ElementalProperties): string {
  const elements = Object.entries(elementalProperties);
  if (elements.length === 0) return 'balanced';
  
  const sorted = [...elements].sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// Helper function to check if ingredient is a RecipeIngredient
function isRecipeIngredient(ingredient: Ingredient | RecipeIngredient): ingredient is RecipeIngredient {
  return 'amount' in ingredient && 'unit' in ingredient;
}

// Missing Beaker import
const Beaker = (props: any) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
      style={props.style}
    >
      <path d="M9 3h6v2H9z"></path>
      <path d="M7 5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z"></path>
      <path d="M10 15a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2z"></path>
    </svg>
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
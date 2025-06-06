// Import our targeted fixes for FoodRecommender
import '../../utils/foodRecommenderFix';
// Import the fix first before anything else
import '../../utils/fixAssignmentError';
// Import the IngredientDisplay component which has more detailed information
import IngredientDisplay from './IngredientDisplay';
// Import our fixed alchemical functions
import { 
  calculateElementalScore,
  getElementRanking, 
  getDominantElement,
  createElementObject, 
  combineElementObjects, 
  getAbsoluteElementValue 
} from '../../utils/alchemicalFunctions';
import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useState, useEffect, useMemo } from 'react';
// Import getAllIngredients from our utils
import { getAllIngredients } from '@/utils/foodRecommender';
// Import ingredient data types
import { vegetables } from '@/data/ingredients/vegetables';
import { fruits } from '@/data/ingredients/fruits';
import { herbs } from '@/data/ingredients/herbs';
import { spices } from '@/data/ingredients/spices';
import { proteins } from '@/data/ingredients/proteins';
import { grains } from '@/data/ingredients/grains';

// Make the fixed functions available globally to ensure they're used instead of any problematic ones
if (typeof window !== 'undefined') {
  // Use declaration merged Window type
  window.calculateElementalScore = calculateElementalScore;
  window.getElementRanking = getElementRanking;
  window.getDominantElement = getDominantElement;
  window.createElementObject = createElementObject;
  window.combineElementObjects = combineElementObjects;
  window.getAbsoluteElementValue = getAbsoluteElementValue;
  
  // Override the ElementalCalculator methods if they exist
  if (window.ElementalCalculator) {
    window.ElementalCalculator.calculateElementalBalance = 
      (props: any) => calculateElementalScore(props) * 100; // Convert to 0-100 scale
  }
  
  // Log that our component is initializing correctly
  console.log('[FoodRecommender] Component loaded with fixes applied');
}

// Create wrapper component to combine both implementations
const FoodRecommender = () => {
  const { planetaryPositions, elementalProperties, activePlanets, zodiacSign, lunarPhase } = useAstrologicalState();
  
  // Create a full astrological state object to pass to components
  const astrologicalState = useMemo(() => ({
    planetaryPositions,
    elementalProperties,
    activePlanets,
    zodiacSign,
    lunarPhase,
    dominantElement: getDominantElement(elementalProperties),
    timestamp: new Date()
  }), [planetaryPositions, elementalProperties, activePlanets, zodiacSign, lunarPhase]);
  
  return (
    <div className="food-recommender-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Ingredient Recommendations</h2>
        <p className="text-gray-600">
          Discover ingredients that align with current celestial influences, with detailed cooking methods and culinary applications.
        </p>
      </div>
      
      {/* Use IngredientDisplay for a comprehensive display with all 8 categories */}
      <IngredientDisplay />
    </div>
  );
};

export default FoodRecommender;

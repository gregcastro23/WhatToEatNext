// Import our targeted fixes for FoodRecommender
import '../../utils/foodRecommenderFix';
// Import the fix first before anything else
import '../../utils/fixAssignmentError';
// Import the IngredientDisplay component which has more detailed information
import { useMemo } from 'react';
import { log } from '@/services/LoggingService';

import { useAstrologicalState } from '@/context/AstrologicalContext';

import { 
  calculateElementalScore,
  getElementRanking, 
  getDominantElement,
  createElementObject, 
  combineElementObjects, 
  getAbsoluteElementValue 
} from '../../utils/alchemicalFunctions';

import IngredientDisplay from './IngredientDisplay';
// Import our fixed alchemical functions

// Import getAllIngredients from our utils
// Import ingredient data types

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
      (props: Record<string, unknown>) => calculateElementalScore(props) * 100; // Convert to 0-100 scale
  }
  
  // Log that our component is initializing correctly
  log.info('[FoodRecommender] Component loaded with fixes applied');
}

// Create wrapper component to combine both implementations
const FoodRecommender = () => {
  const astroState = useAstrologicalState();
  const planetaryPositions = (astroState as unknown as Record<string, unknown>).planetaryPositions;
  const elementalProperties = (astroState as unknown as Record<string, unknown>).elementalProperties;
  const activePlanets = (astroState as unknown as Record<string, unknown>).activePlanets;
  const zodiacSign = (astroState as unknown as Record<string, unknown>).zodiacSign;
  const lunarPhase = (astroState as unknown as Record<string, unknown>).lunarPhase;
  
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
      <h2>Ingredient Recommendations</h2>
      <p>Based on current celestial influences</p>
      
      {/* Only use the IngredientDisplay component to avoid duplicates */}
      <IngredientDisplay />
    </div>
  );
};

export default FoodRecommender;

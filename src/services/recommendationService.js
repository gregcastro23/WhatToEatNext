/**
 * Recommendation Service
 * Provides food recommendations based on astrological data and user preferences
 */

import { createFuseInstance, getStringSimilarity, createRecommender } from '../utils/searchConfig';
import { formatDate, getSeason, isDateInZodiacRange } from '../utils/dateUtils';

/**
 * Enhances ingredient data by adding compatibility scores based on elemental properties
 * @param {Array} ingredients - List of ingredients to enhance
 * @param {Object} userProfile - User's profile with elemental preferences
 * @returns {Array} Enhanced ingredients with compatibility scores
 */
export function enhanceIngredientData(ingredients, userProfile) {
  if (!ingredients || !ingredients.length) return [];
  if (!userProfile) return ingredients;

  return ingredients.map(ingredient => {
    // Calculate elemental compatibility
    const compatibilityScore = calculateElementalCompatibility(
      ingredient.attributes?.elements || {},
      userProfile.elements || {}
    );

    return {
      ...ingredient,
      compatibilityScore,
      recommended: compatibilityScore > 0.7
    };
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Calculates elemental compatibility between ingredient elements and user preferences
 * @param {Object} ingredientElements - Element values of the ingredient
 * @param {Object} userElements - Element values from user profile
 * @returns {number} Compatibility score (0-1)
 */
function calculateElementalCompatibility(ingredientElements, userElements) {
  // Following our project principles: each element is independently valuable
  // Elements aren't opposing forces - they each contribute positively
  
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  let totalScore = 0;
  let count = 0;
  
  elements.forEach(element => {
    const ingredientValue = ingredientElements[element] || 0;
    const userValue = userElements[element] || 0;
    
    if (ingredientValue > 0 || userValue > 0) {
      // Same element has highest compatibility (like reinforces like)
      if (ingredientValue > 0 && userValue > 0) {
        totalScore += 0.9;
      } else {
        // Different elements still have good compatibility
        totalScore += 0.7;
      }
      count++;
    }
  });
  
  return count > 0 ? totalScore / count : 0;
}

/**
 * Gets food recommendations based on astrological data and preferences
 * @param {Object} astroData - Astrological data for the user
 * @param {Object} userPreferences - User preferences and dietary restrictions
 * @param {Array} foodDatabase - Database of food items
 * @returns {Array} Recommended food items
 */
export function getRecommendations(astroData, userPreferences, foodDatabase) {
  if (!astroData || !foodDatabase || !foodDatabase.length) return [];
  
  // Determine user's zodiac sign and current season
  const currentDate = new Date();
  const season = getSeason(currentDate);
  
  // Find user's zodiac sign
  let userSign = null;
  Object.entries(astroData.signInfo || {}).forEach(([sign, info]) => {
    if (isDateInZodiacRange(currentDate, info)) {
      userSign = sign;
    }
  });
  
  // Get planetary influences
  const planetaryInfluences = getPlanetaryInfluences(astroData);
  
  // Filter out items based on dietary restrictions
  const filteredFood = filterByDietaryRestrictions(foodDatabase, userPreferences.restrictions || []);
  
  // Create user profile based on astrological data
  const userProfile = createUserProfile(userSign, planetaryInfluences, season);
  
  // Enhance food data with compatibility scores
  const enhancedFood = enhanceIngredientData(filteredFood, userProfile);
  
  // Return top recommendations
  return enhancedFood.slice(0, userPreferences.resultCount || 10);
}

/**
 * Filters food items based on dietary restrictions
 * @param {Array} foodItems - List of food items
 * @param {Array} restrictions - List of dietary restrictions
 * @returns {Array} Filtered food items
 */
function filterByDietaryRestrictions(foodItems, restrictions) {
  if (!restrictions || !restrictions.length) return foodItems;
  
  return foodItems.filter(item => {
    // Check if the item matches any restrictions
    for (const restriction of restrictions) {
      if (restriction === 'vegetarian' && item.attributes?.nonVegetarian) {
        return false;
      }
      if (restriction === 'vegan' && (item.attributes?.nonVegan || item.attributes?.nonVegetarian)) {
        return false;
      }
      if (restriction === 'glutenFree' && item.attributes?.containsGluten) {
        return false;
      }
      // Add other restrictions as needed
    }
    return true;
  });
}

/**
 * Creates a user profile based on astrological data
 * @param {string} sign - User's zodiac sign
 * @param {Object} planetaryInfluences - Planetary influences
 * @param {string} season - Current season
 * @returns {Object} User profile with elemental preferences
 */
function createUserProfile(sign, planetaryInfluences, season) {
  // Default elemental values
  const elements = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Adjust based on zodiac sign
  if (sign) {
    const signElements = {
      'Aries': { Fire: 0.6 },
      'Taurus': { Earth: 0.6 },
      'Gemini': { Air: 0.6 },
      'Cancer': { Water: 0.6 },
      'Leo': { Fire: 0.6 },
      'Virgo': { Earth: 0.6 },
      'Libra': { Air: 0.6 },
      'Scorpio': { Water: 0.6 },
      'Sagittarius': { Fire: 0.6 },
      'Capricorn': { Earth: 0.6 },
      'Aquarius': { Air: 0.6 },
      'Pisces': { Water: 0.6 }
    };
    
    if (signElements[sign]) {
      Object.entries(signElements[sign]).forEach(([element, value]) => {
        elements[element] = value;
      });
    }
  }
  
  // Adjust based on season
  const seasonElements = {
    'spring': { Air: 0.2 },
    'summer': { Fire: 0.2 },
    'autumn': { Earth: 0.2 },
    'winter': { Water: 0.2 }
  };
  
  if (seasonElements[season]) {
    Object.entries(seasonElements[season]).forEach(([element, value]) => {
      elements[element] += value;
    });
  }
  
  // Normalize values
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  Object.keys(elements).forEach(key => {
    elements[key] = elements[key] / total;
  });
  
  return {
    sign,
    season,
    elements,
    planetaryInfluences
  };
}

/**
 * Extracts planetary influences from astrological data
 * @param {Object} astroData - Astrological data
 * @returns {Object} Planetary influences
 */
function getPlanetaryInfluences(astroData) {
  const influences = {};
  
  if (astroData.planetInfo) {
    Object.entries(astroData.planetInfo).forEach(([planet, info]) => {
      if (info.Alchemy) {
        influences[planet] = info.Alchemy;
      }
    });
  }
  
  return influences;
}

export default {
  getRecommendations,
  enhanceIngredientData
}; 
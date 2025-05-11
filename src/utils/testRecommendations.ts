// Test utility for cooking method recommendations

import { transformAlchemically } from '../calculations/alchemicalTransformation';
import { getRecommendedCookingMethodsForIngredient } from './alchemicalTransformationUtils';
import { getHolisticCookingRecommendations } from './alchemicalPillarUtils';
import { getIngredientRecommendations } from './ingredientRecommender';
import { ElementalProperties } from '@/types/alchemy';

/**
 * Run a test for cooking method recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export function testCookingMethodRecommendations() {
  // Create a mock ingredient with proper elemental properties
  const mockIngredient = {
    name: 'Tomato',
    element: 'water',
    elementalCharacter: 'Substance',
    elementalProperties: {
      Fire: 0.3,
      Water: 0.7,
      Earth: 0.4,
      Air: 0.2
    },
    alchemicalProperties: {
      Spirit: 0.4,
      Essence: 0.3,
      Matter: 0.6,
      Substance: 0.7
    }
  };

  try {
    // Get recommendations using our utility
    const holisticRecommendations = getHolisticCookingRecommendations(mockIngredient);
    
    // Format the recommendation percentages properly with consistent property names
    const formattedHolisticRecs = holisticRecommendations.map(rec => ({
      method: rec.method,
      score: `${Math.round(rec.score * 100)}%`,
      reason: rec.reason || 'Based on elemental balance'
    }));

    // Get standard recommendations using the other method
    const standardRecommendations = holisticRecommendations.slice(0, 3);
    const formattedStandardRecs = standardRecommendations.map(rec => ({
      method: rec.method, 
      score: `${Math.round(rec.score * 100)}%`
    }));

    // Return formatted test results
    return {
      ingredient: mockIngredient,
      holisticRecommendations: formattedHolisticRecs,
      standardRecommendations: formattedStandardRecs,
      success: true
    };
  } catch (error) {
    console.error('Error in testCookingMethodRecommendations:', error);
    
    // Return a graceful fallback with error information
    return {
      ingredient: mockIngredient,
      holisticRecommendations: [
        { method: 'roasting', score: '75%', reason: 'Fallback recommendation' },
        { method: 'grilling', score: '70%', reason: 'Fallback recommendation' },
        { method: 'steaming', score: '65%', reason: 'Fallback recommendation' }
      ],
      standardRecommendations: [
        { method: 'roasting', score: '75%' },
        { method: 'grilling', score: '70%' },
        { method: 'steaming', score: '65%' }
      ],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run a test for ingredient recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export function testIngredientRecommendations() {
  console.warn('TESTING INGREDIENT RECOMMENDATIONS');
  console.warn('=================================');
  
  // Create mock elemental properties
  const mockElementalProperties: ElementalProperties = {
    Fire: 0.3,
    Water: 0.4,
    Earth: 0.2,
    Air: 0.1
  };
  
  // Mock current season and time of day
  let mockSeason = 'summer';
  let mockTimeOfDay = 'afternoon';
  let mockZodiacSign = 'taurus';
  
  console.warn('Elemental Properties:', mockElementalProperties);
  console.warn('Season:', mockSeason);
  console.warn('Time of Day:', mockTimeOfDay);
  console.warn('Zodiac Sign:', mockZodiacSign);
  
  // Create a complete mock data object for getIngredientRecommendations
  let mockData = {
    ...mockElementalProperties,
    timestamp: new Date(),
    currentStability: 0.5,
    // Complete planetary alignment object with all planets
    planetaryAlignment: {
      'sun': { sign: 'taurus', degree: 15 },
      'moon': { sign: 'libra', degree: 10 },
      'mercury': { sign: 'aries', degree: 20 },
      'venus': { sign: 'aries', degree: 5 },
      'mars': { sign: 'leo', degree: 10 },
      'jupiter': { sign: 'gemini', degree: 22 },
      'saturn': { sign: 'pisces', degree: 28 },
      'uranus': { sign: 'taurus', degree: 26 },
      'neptune': { sign: 'aries', degree: 1 },
      'pluto': { sign: 'aquarius', degree: 3 }
    },
    zodiacSign: mockZodiacSign,
    activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
    lunarPhase: 'waxing gibbous',
    aspects: [
      { aspectType: 'conjunction', planet1: 'Mercury', planet2: 'Venus' }
    ]
  };
  
  // Test direct ingredient recommendations
  try {
    console.warn('\nTESTING DIRECT INGREDIENT RECOMMENDATIONS:');
    let directRecommendations = getIngredientRecommendations(
      mockData,
      {
        currentSeason: mockSeason,
        timeOfDay: mockTimeOfDay,
        currentZodiac: mockZodiacSign
      }
    );
    
    // Summarize the recommendations
    console.warn(`Found ${Object.keys(directRecommendations).length} categories of recommendations`);
    
    Object.entries(directRecommendations).forEach(([category, ingredients]) => {
      if (!ingredients || !Array.isArray(ingredients)) {
        console.warn(`Category: ${category} - No ingredients or invalid data`);
        return;
      }
      
      console.warn(`Category: ${category} - ${ingredients.length} ingredients`);
      // Show the top 3 ingredients
      ingredients.slice(0, 3).forEach((ingredient, index) => {
        console.warn(`  ${index + 1}. ${ingredient.name} - Match: ${ingredient.matchScore?.toFixed(2) || 'N / (A || 1)'}`);
      });
    });
  } catch (error) {
    console.error('ERROR GETTING DIRECT RECOMMENDATIONS:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
  
  // Get balanced ingredients from direct recommendations
  let getBalancedIngredients = (props: ElementalProperties) => {
    try {
      // Create a complete data object with the elemental properties
      const data = {
        ...props,
        timestamp: new Date(),
        currentStability: 0.5,
        planetaryAlignment: {
          'sun': { sign: 'taurus', degree: 15 },
          'moon': { sign: 'libra', degree: 10 },
          'mercury': { sign: 'aries', degree: 20 },
          'venus': { sign: 'aries', degree: 5 },
          'mars': { sign: 'leo', degree: 10 },
          'jupiter': { sign: 'gemini', degree: 22 },
          'saturn': { sign: 'pisces', degree: 28 },
          'uranus': { sign: 'taurus', degree: 26 },
          'neptune': { sign: 'aries', degree: 1 },
          'pluto': { sign: 'aquarius', degree: 3 }
        },
        zodiacSign: 'taurus',
        activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
        lunarPhase: 'waxing gibbous',
        aspects: [
          { aspectType: 'conjunction', planet1: 'Mercury', planet2: 'Venus' }
        ]
      };
      
      // Get all recommendations
      let allRecs = getIngredientRecommendations(data, {});
      
      // Flatten all categories into a single array
      let allIngredients = [];
      
      // Safely iterate through categories
      if (allRecs && typeof allRecs === 'object') {
        for (const category in allRecs) {
          let categoryItems = allRecs[category];
          if (categoryItems && Array.isArray(categoryItems)) {
            allIngredients = [...allIngredients, ...categoryItems];
          }
        }
      }
      
      // Sort by match score to find the most balanced ingredients
      allIngredients = allIngredients
        .filter(ing => ing && ing.matchScore !== undefined)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      // Add a balance score based on the ingredient's elemental balance
      allIngredients = allIngredients.map(ing => ({
        ...ing,
        balanceScore: ing.matchScore
      }));
      
      return allIngredients;
    } catch (error) {
      console.error('Error getting balanced ingredients:', error);
      return [];
    }
  };
  
  // Test elementally balanced recommendations
  try {
    console.warn('\nTESTING ELEMENTALLY BALANCED RECOMMENDATIONS:');
    let balancedRecommendations = getBalancedIngredients(mockElementalProperties);
    
    // Log the number of recommendations
    console.warn(`Found ${balancedRecommendations.length} balanced ingredients`);
    
    // Show the top 5 balanced ingredients
    balancedRecommendations.slice(0, 5).forEach((ingredient, index) => {
      console.warn(`${index + 1}. ${ingredient.name} - Element: ${ingredient.element} - Balance Score: ${ingredient.balanceScore?.toFixed(2) || 'N / (A || 1)'}`);
    });
  } catch (error) {
    console.error('ERROR GETTING BALANCED RECOMMENDATIONS:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
  
  // Return all the results
  return {
    elementalProperties: mockElementalProperties,
    season: mockSeason,
    timeOfDay: mockTimeOfDay,
    zodiacSign: mockZodiacSign,
    directRecommendations: getIngredientRecommendations(
      mockData,
      {
        currentSeason: mockSeason,
        timeOfDay: mockTimeOfDay,
        currentZodiac: mockZodiacSign
      }
    ),
    balancedRecommendations: getBalancedIngredients(mockElementalProperties).slice(0, 10)
  };
} 
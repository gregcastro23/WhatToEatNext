// Simple test script to verify cooking method recommendations
import { cookingMethods } from '../data/cooking/cookingMethods';

// Create a mock ingredient
const mockIngredient = {
  name: 'Tomato',
  element: 'water',
  elementalCharacter: 'Substance',
  spirit: 0.4,
  essence: 0.3,
  matter: 0.6,
  substance: 0.7,
  water: 0.7,
  fire: 0.3,
  earth: 0.4,
  air: 0.2
};

// Function to get cooking method recommendations
export function testCookingMethodRecommendations() {
  try {
    // Get cooking methods from imported data
    const methods = Object.entries(cookingMethods).map(([key, method]) => ({
      name: method.name,
      element: Object.entries(method.elementalEffect).reduce(
        (max, [element, value]) => (value > max.value ? { element, value } : max),
        { element: 'none', value: 0 }
      ).element.toLowerCase()
    }));
    
    // Calculate compatibility for each method
    const holisticRecommendations = methods.map(method => {
      // Prioritize methods that match the ingredient's element
      const elementMatch = method.element === mockIngredient.element ? 0.7 : 0.3;
      
      // Create a compatibility score based on element match and other factors
      const compatibility = elementMatch * 100;
      
      // Generate a reason for the recommendation
      const reason = method.element === mockIngredient.element 
        ? `${method.name} works well with ${mockIngredient.element}-element foods like ${mockIngredient.name}`
        : `${method.name} provides a complementary balance to ${mockIngredient.name}`;
      
      return {
        method: method.name,
        compatibility,
        reason
      };
    }).sort((a, b) => b.compatibility - a.compatibility).slice(0, 5);
    
    // Calculate standard recommendations (simpler version)
    const standardRecommendations = methods.map(method => {
      const compatibility = method.element === mockIngredient.element ? 80 : 40;
      return {
        method: method.name,
        compatibility
      };
    }).sort((a, b) => b.compatibility - a.compatibility).slice(0, 5);
    
    return {
      ingredient: mockIngredient,
      holisticRecommendations,
      standardRecommendations
    };
  } catch (error) {
    console.error('ERROR GETTING RECOMMENDATIONS:', error);
    throw error;
  }
} 
// Test utility for cooking method recommendations

import { AlchemicalItem } from '../calculations/alchemicalTransformation';
import { getRecommendedCookingMethodsForIngredient } from './alchemicalTransformationUtils';
import { getHolisticCookingRecommendations } from './alchemicalPillarUtils';
import type { CookingMethod } from '@/types/alchemy';

/**
 * Run a test for cooking method recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export async function testCookingMethodRecommendations(): Promise<{
  ingredient: AlchemicalItem,
  holisticRecommendations: any,
  standardRecommendations: any
}> {
  // Create a mock ingredient
  const mockIngredient: AlchemicalItem = {
    name: 'Tomato',
    element: 'Water',
    elementalCharacter: 'Substance',
    Spirit: 0.4,
    Essence: 0.3,
    Matter: 0.6,
    Substance: 0.7,
    Fire: 0.3,
    Water: 0.7,
    Earth: 0.4,
    Air: 0.2,
    alchemicalProperties: { Spirit: 0.4, Essence: 0.3, Matter: 0.6, Substance: 0.7 },
    transformedElementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.4, Air: 0.2 },
    heat: 0.5,
    entropy: 0.5,
    reactivity: 0.5,
    gregsEnergy: 0.5,
    dominantElement: 'Water',
    dominantAlchemicalProperty: 'Substance',
    planetaryBoost: 0,
    dominantPlanets: [],
    planetaryDignities: {}
  };

  // Create mock cooking methods
  const mockCookingMethods: CookingMethod[] = [
    { id: 'baking', name: 'baking', element: 'Fire', category: 'dry', intensity: 0.8 },
    { id: 'boiling', name: 'boiling', element: 'Water', category: 'wet', intensity: 0.6 },
    { id: 'grilling', name: 'grilling', element: 'Fire', category: 'dry', intensity: 0.9 },
    { id: 'steaming', name: 'steaming', element: 'Water', category: 'wet', intensity: 0.5 },
    { id: 'sauteing', name: 'sauteing', element: 'Air', category: 'dry', intensity: 0.7 },
    { id: 'roasting', name: 'roasting', element: 'Fire', category: 'dry', intensity: 0.85 },
    { id: 'braising', name: 'braising', element: 'Water', category: 'wet', intensity: 0.65 },
    { id: 'poaching', name: 'poaching', element: 'Water', category: 'wet', intensity: 0.55 },
    { id: 'frying', name: 'frying', element: 'Fire', category: 'dry', intensity: 0.95 },
    { id: 'fermenting', name: 'fermenting', element: 'Earth', category: 'slow', intensity: 0.3 }
  ];

  // Run the test
  console.warn('TESTING COOKING METHOD RECOMMENDATIONS');
  console.warn('=====================================');
  console.warn('Ingredient:', mockIngredient.name);
  console.warn('Element:', mockIngredient.element);
  console.warn('Elemental Character:', mockIngredient.elementalCharacter);

  // Test holistic recommendations directly
  try {
    console.warn('\nTESTING HOLISTIC RECOMMENDATIONS DIRECTLY:');
    const methods = mockCookingMethods.map(m => m.name);
    const holisticRecs = await getHolisticCookingRecommendations(mockIngredient, undefined, undefined, true, methods, 5);
    holisticRecs.forEach((rec: any, index: number) => {
      console.warn(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`);
    });
  } catch (error) {
    console.error('ERROR GETTING HOLISTIC RECOMMENDATIONS:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  // Test the ingredient-specific function - Pattern ZZZ: Array Object Interface Expansion
  try {
    console.warn('\nTESTING INGREDIENT-SPECIFIC RECOMMENDATIONS:');
    const recommendations = await getRecommendedCookingMethodsForIngredient(mockIngredient, mockCookingMethods as any, 5);
    recommendations.forEach((rec: any, index: number) => {
      console.warn(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`);
    });
  } catch (error) {
    console.error('ERROR GETTING RECOMMENDATIONS:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
  
  const holisticRecs = await getHolisticCookingRecommendations(mockIngredient, undefined, undefined, true, mockCookingMethods.map(m => m.name), 5);
  const standardRecs = await getRecommendedCookingMethodsForIngredient(mockIngredient, mockCookingMethods as any, 5); // Pattern ZZZ: Array Object Interface Expansion
  
  return {
    ingredient: mockIngredient,
    holisticRecommendations: holisticRecs,
    standardRecommendations: standardRecs
  };
} 
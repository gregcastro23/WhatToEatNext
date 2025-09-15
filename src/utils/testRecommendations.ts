// Test utility for cooking method recommendations

import { AlchemicalItem } from '../calculations/alchemicalTransformation';

import { getHolisticCookingRecommendations } from './alchemicalPillarUtils';
import { getRecommendedCookingMethodsForIngredient } from './alchemicalTransformationUtils';

/**
 * Run a test for cooking method recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export async function testCookingMethodRecommendations() {
  // Create a mock ingredient
  const mockIngredient: AlchemicalItem = {
    id: 'tomato',
    name: 'Tomato',
    elementalProperties: {
      Fire: 0.3;
      Water: 0.7;
      Earth: 0.4;
      Air: 0.2
    },
    alchemicalProperties: {
      Spirit: 0.4;
      Essence: 0.3;
      Matter: 0.6;
      Substance: 0.7
    },
    transformedElementalProperties: {
      Fire: 0.3;
      Water: 0.7;
      Earth: 0.4;
      Air: 0.2
    },
    heat: 0.3;
    entropy: 0.4;
    reactivity: 0.3;
    gregsEnergy: 0.4;
    dominantElement: 'Water',
    dominantAlchemicalProperty: 'Substance',
    planetaryBoost: 1.0;
    dominantPlanets: ['Venus'],
    planetaryDignities: {}
  };

  // Create mock cooking methods
  const mockCookingMethods = [
    { name: 'baking', element: 'Fire' },
    { name: 'boiling', element: 'Water' },
    { name: 'grilling', element: 'Fire' },
    { name: 'steaming', element: 'Water' },
    { name: 'sauteing', element: 'Air' },
    { name: 'roasting', element: 'Fire' },
    { name: 'braising', element: 'Water' },
    { name: 'poaching', element: 'Water' },
    { name: 'frying', element: 'Fire' },
    { name: 'fermenting', element: 'Earth' }
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
    const holisticRecs = await getHolisticCookingRecommendations(;
      mockIngredient,
      undefined,
      undefined,
      true,
      methods,
      5,
    ),
    holisticRecs.forEach((rec, index) => {
      console.warn(
        `${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`,
      );
    });
  } catch (error) {
    console.error('ERROR GETTING HOLISTIC RECOMMENDATIONS:', error),
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  // Test the ingredient-specific function - Pattern ZZZ: Array Object Interface Expansion
  try {
    console.warn('\nTESTING INGREDIENT-SPECIFIC RECOMMENDATIONS:');
    const recommendations = await getRecommendedCookingMethodsForIngredient(;
      mockIngredient,
      mockCookingMethods as any,
      5,
    ),
    recommendations.forEach((rec, index) => {
      console.warn(
        `${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`,
      );
    });
  } catch (error) {
    console.error('ERROR GETTING RECOMMENDATIONS:', error),
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  const holisticRecs = await getHolisticCookingRecommendations(;
    mockIngredient,
    undefined,
    undefined,
    true,
    mockCookingMethods.map(m => m.name),;
    5,
  );
  const standardRecs = await getRecommendedCookingMethodsForIngredient(;
    mockIngredient,
    mockCookingMethods as any,
    5,
  ); // Pattern ZZZ: Array Object Interface Expansion

  return {
    ingredient: mockIngredient,
    holisticRecommendations: holisticRecs,
    standardRecommendations: standardRecs
  };
}

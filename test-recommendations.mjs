// Simple test script to verify cooking method recommendations
// Using ESM imports for Next.js compatibility

import { getRecommendedCookingMethodsForIngredient } from './src/utils/alchemicalTransformationUtils.js';
import { getHolisticCookingRecommendations } from './src/utils/alchemicalPillarUtils.js';

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
  air: 0.2,
};

// Create mock cooking methods
const mockCookingMethods = [
  { name: 'baking', element: 'fire' },
  { name: 'boiling', element: 'water' },
  { name: 'grilling', element: 'fire' },
  { name: 'steaming', element: 'water' },
  { name: 'sauteing', element: 'air' },
  { name: 'roasting', element: 'fire' },
  { name: 'braising', element: 'water' },
  { name: 'poaching', element: 'water' },
  { name: 'frying', element: 'fire' },
  { name: 'fermenting', element: 'earth' },
];

// Run the test
console.log('TESTING COOKING METHOD RECOMMENDATIONS');
console.log('=====================================');
console.log('Ingredient:', mockIngredient.name);
console.log('Element:', mockIngredient.element);
console.log('Elemental Character:', mockIngredient.elementalCharacter);

// Test holistic recommendations directly
try {
  console.log('\nTESTING HOLISTIC RECOMMENDATIONS DIRECTLY:');
  const methods = mockCookingMethods.map(m => m.name);
  const holisticRecs = getHolisticCookingRecommendations(
    mockIngredient,
    undefined,
    undefined,
    true,
    methods,
    5,
  );
  holisticRecs.forEach((rec, index) => {
    console.log(
      `${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`,
    );
  });
} catch (error) {
  console.error('ERROR GETTING HOLISTIC RECOMMENDATIONS:', error);
  if (error.stack) {
    console.error(error.stack);
  }
}

// Test the ingredient-specific function
try {
  console.log('\nTESTING INGREDIENT-SPECIFIC RECOMMENDATIONS:');
  const recommendations = getRecommendedCookingMethodsForIngredient(
    mockIngredient,
    mockCookingMethods,
    5,
  );
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`);
  });
} catch (error) {
  console.error('ERROR GETTING RECOMMENDATIONS:', error);
  if (error.stack) {
    console.error(error.stack);
  }
}

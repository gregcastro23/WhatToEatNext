// Simple test script to verify cooking method recommendations

// Import the functions we want to test
const { getRecommendedCookingMethodsForIngredient } = require('./src/utils/alchemicalTransformationUtils');
const { getCookingMethods } = require('./src/constants/alchemicalPillars');

// Create a mock ingredient
const mockIngredient = {
  name: 'Tomato',
  element: 'Water',
  elementalCharacter: 'Substance',
  Spirit: 0.4,
  Essence: 0.3,
  Matter: 0.6,
  Substance: 0.7,
  Water: 0.7,
  Fire: 0.3,
  Earth: 0.4,
  Air: 0.2
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
console.log('TESTING COOKING METHOD RECOMMENDATIONS');
console.log('=====================================');
console.log('Ingredient:', mockIngredient.name);
console.log('Element:', mockIngredient.element);
console.log('Elemental Character:', mockIngredient.elementalCharacter);

// Get recommendations
try {
  const recommendations = getRecommendedCookingMethodsForIngredient(mockIngredient, mockCookingMethods, 5);
  console.log('\nRECOMMENDATIONS:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`);
  });
} catch (error) {
  console.error('ERROR GETTING RECOMMENDATIONS:', error);
  if (error.stack) {
    console.error(error.stack);
  }
} 
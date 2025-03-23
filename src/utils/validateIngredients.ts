import { allIngredients } from '@/data/ingredients/ingredients';

export function validateIngredientData() {
  const missingElementals: string[] = [];
  
  Object.entries(allIngredients).forEach(([category, ingredients]) => {
    ingredients.forEach(ingredient => {
      if (!ingredient.elementalProperties) {
        missingElementals.push(`${ingredient.name} (${category})`);
        // Set default values to prevent runtime errors
        ingredient.elementalProperties = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
      } else {
        // Ensure all elemental properties exist
        const elements = ['Fire', 'Water', 'Air', 'Earth'];
        elements.forEach(element => {
          if (ingredient.elementalProperties[element] === undefined) {
            ingredient.elementalProperties[element] = 0;
          }
        });
      }
    });
  });
  
  if (missingElementals.length > 0) {
    console.warn(`Found ${missingElementals.length} ingredients with missing elemental properties:`, missingElementals);
  }
  
  return missingElementals.length === 0;
} 
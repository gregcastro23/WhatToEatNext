import { allIngredients } from '@/data/ingredients/ingredients';
import { logger } from '@/utils/logger';
import type { ElementalProperties } from '@/types/alchemy';

/**
 * Validate and clean up the ingredients database
 * Ensures all required properties exist and have appropriate values
 */
export function cleanupIngredientsDatabase() {
  let fixedEntries = 0;
  const invalidEntries = 0;
  
  try {
    // Process each category
    Object.entries(allIngredients).forEach(([category, ingredients]) => {
      ingredients.forEach((ingredient, index) => {
        // Ensure ingredient has a name
        if (!ingredient.name) {
          ingredient.name = `Unknown ${category} ${index}`;
          fixedEntries++;
          logger.warn(`Added missing name to ingredient at ${category}[${index}]`);
        }
        
        // Ensure elemental properties exist and are valid
        if (!ingredient.elementalProperties) {
          ingredient.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
          fixedEntries++;
          logger.warn(`Added default elemental properties to ${ingredient.name}`);
        } else {
          const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
          let modified = false;
          
          // Ensure all elemental properties are present and normalized
          elements.forEach(element => {
            if (typeof ingredient.elementalProperties[element] !== 'number') {
              ingredient.elementalProperties[element] = 0.25;
              modified = true;
            }
          });
          
          // Normalize to ensure sum = 1
          const sum = Object.values(ingredient.elementalProperties).reduce((acc, val) => acc + val, 0);
          if (Math.abs(sum - 1) > 0.01) {
            elements.forEach(element => {
              ingredient.elementalProperties[element] = ingredient.elementalProperties[element] / sum;
            });
            modified = true;
          }
          
          if (modified) {
            fixedEntries++;
            logger.debug(`Normalized elemental properties for ${ingredient.name}`);
          }
        }
        
        // Ensure astrologicalProfile exists
        if (!ingredient.astrologicalProfile) {
          ingredient.astrologicalProfile = {
            elementalAffinity: { base: Object.entries(ingredient.elementalProperties)
              .reduce((a, b) => a[1] > b[1] ? a : b)[0] }, // Use highest element as affinity
            rulingPlanets: []
          };
          fixedEntries++;
          logger.warn(`Added default astrological profile to ${ingredient.name}`);
        }
        
        // Check for other required properties based on your schema
        // Add more validation as needed
      });
    });
    
    logger.info(`Database cleanup complete: Fixed ${fixedEntries} entries, found ${invalidEntries} invalid entries`);
    return { success: true, fixedEntries, invalidEntries };
  } catch (error) {
    logger.error('Error during database cleanup:', error);
    return { success: false, error };
  }
}

/**
 * Run this function during application initialization
 */
export function initializeDatabaseIntegrity() {
  return cleanupIngredientsDatabase();
} 
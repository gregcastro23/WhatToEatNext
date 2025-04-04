import { allIngredients } from '@/data/ingredients/ingredients';
import { logger } from '@/utils/logger';
import type { ElementalProperties, Ingredient, AstrologicalProfile } from '@/types/alchemy';

// Extended ingredient type for our cleanup function
interface IngredientWithAstrology extends Ingredient {
  astrologicalProfile?: AstrologicalProfile;
}

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
      if (!ingredients || !Array.isArray(ingredients)) {
        logger.warn(`Invalid ingredients structure in category ${category}`);
        return;
      }

      ingredients.forEach((ingredient, index) => {
        // Cast to our extended type for this function
        const ingredientWithAstrology = ingredient as unknown as IngredientWithAstrology;
        
        // Ensure ingredient has a name
        if (!ingredientWithAstrology.name) {
          ingredientWithAstrology.name = `Unknown ${category} ${index}`;
          fixedEntries++;
          logger.warn(`Added missing name to ingredient at ${category}[${index}]`);
        }
        
        // Ensure elemental properties exist and are valid
        if (!ingredientWithAstrology.elementalProperties) {
          ingredientWithAstrology.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
          fixedEntries++;
          logger.warn(`Added default elemental properties to ${ingredientWithAstrology.name}`);
        } else {
          const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
          let modified = false;
          
          // Ensure all elemental properties are present and normalized
          elements.forEach(element => {
            if (typeof ingredientWithAstrology.elementalProperties![element] !== 'number') {
              ingredientWithAstrology.elementalProperties![element] = 0.25;
              modified = true;
            }
          });
          
          // Normalize to ensure sum = 1
          const sum = Object.values(ingredientWithAstrology.elementalProperties).reduce((acc, val) => acc + (val || 0), 0);
          if (Math.abs(sum - 1) > 0.01) {
            elements.forEach(element => {
              ingredientWithAstrology.elementalProperties![element] = ingredientWithAstrology.elementalProperties![element] / sum;
            });
            modified = true;
          }
          
          if (modified) {
            fixedEntries++;
            logger.debug(`Normalized elemental properties for ${ingredientWithAstrology.name}`);
          }
        }
        
        // Ensure astrologicalProfile exists
        if (!ingredientWithAstrology.astrologicalProfile) {
          const dominantElement = ingredientWithAstrology.elementalProperties ? 
            Object.entries(ingredientWithAstrology.elementalProperties)
              .reduce((a, b) => a[1] > b[1] ? a : b, ['Fire', 0])[0] : 'Fire';
              
          ingredientWithAstrology.astrologicalProfile = {
            elementalAffinity: { base: dominantElement },
            rulingPlanets: []
          };
          fixedEntries++;
          logger.warn(`Added default astrological profile to ${ingredientWithAstrology.name}`);
        } else if (!ingredientWithAstrology.astrologicalProfile.elementalAffinity) {
          // Ensure elementalAffinity exists within the profile
          const dominantElement = ingredientWithAstrology.elementalProperties ? 
            Object.entries(ingredientWithAstrology.elementalProperties)
              .reduce((a, b) => a[1] > b[1] ? a : b, ['Fire', 0])[0] : 'Fire';
              
          ingredientWithAstrology.astrologicalProfile.elementalAffinity = { base: dominantElement };
          fixedEntries++;
          logger.warn(`Added elementalAffinity to astrological profile for ${ingredientWithAstrology.name}`);
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
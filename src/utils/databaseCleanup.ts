import { allIngredients } from '@/data/ingredients/ingredients';
import { logger } from @/utils/logger';
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
        
        // Safe property access using type assertion
        const data = ingredientWithAstrology as unknown;
        const name = data?.name;
        
        // Ensure ingredient has a name
        if (!name) {
          data.name = `Unknown ${category} ${index}`;
          fixedEntries++;
          logger.warn(`Added missing name to ingredient at ${category}[${index}]`);
        }
        
        // Ensure elemental properties exist and are valid
        const elementalProps = data?.elementalProperties;
        if (!elementalProps) {
          data.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
          fixedEntries++;
          logger.warn(`Added default elemental properties to ${data.name || name || 'unknown ingredient'}`);
        } else {
          const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
          let modified = false;
          
          // Ensure all elemental properties are present and normalized
          elements.forEach(element => {
            const elementalProperties = data?.elementalProperties;
            if (typeof elementalProperties?.[element] !== 'number') {
              if (elementalProperties) {
                elementalProperties[element] = 0.25;
              }
              modified = true;
            }
          });
          
          // Normalize to ensure sum = 1
          const currentElementalProps = data?.elementalProperties;
          // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
          const sum = Object.values(currentElementalProps ?? {}).reduce((acc, val) => {
            const accValue = Number(acc) || 0;
            const valValue = Number(val) || 0;
            return accValue + valValue;
          }, 0);
          if (Math.abs(Number(sum) - 1) > 0.01) {
            elements.forEach(element => {
              const props = data?.elementalProperties;
              if (props) {
                const currentValue = Number(props[element]) || 0;
                const sumValue = Number(sum) || 1;
                props[element] = currentValue / sumValue;
              }
            });
            modified = true;
          }
          
          if (modified) {
            fixedEntries++;
            logger.debug(`Normalized elemental properties for ${data.name || name || 'unknown ingredient'}`);
          }
        }
        
        // Ensure astrologicalProfile exists
        if (!ingredientWithAstrology.astrologicalProfile) {
          const currentElementalProps = data?.elementalProperties;
          const dominantElement = currentElementalProps ? 
            Object.entries(currentElementalProps)
              .reduce((a, b) => a[1] > b[1] ? a : b, ['Fire', 0])[0] : 'Fire';
              
          ingredientWithAstrology.astrologicalProfile = {
            elementalAffinity: { base: dominantElement },
            rulingPlanets: []
          } as AstrologicalProfile;
          fixedEntries++;
          logger.warn(`Added default astrological profile to ${data.name || name || 'unknown ingredient'}`);
        } else if (!(ingredientWithAstrology.astrologicalProfile as unknown)?.elementalAffinity) {
          // Ensure elementalAffinity exists within the profile - safe property access
          const currentElementalProps = data?.elementalProperties;
          const dominantElement = currentElementalProps ? 
            Object.entries(currentElementalProps)
              .reduce((a, b) => a[1] > b[1] ? a : b, ['Fire', 0])[0] : 'Fire';
              
          (ingredientWithAstrology.astrologicalProfile as unknown).elementalAffinity = { base: dominantElement };
          fixedEntries++;
          logger.warn(`Added elementalAffinity to astrological profile for ${data.name || name || 'unknown ingredient'}`);
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
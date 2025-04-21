/**
 * Example of using the improved data loading and type guards
 * 
 * This file provides examples of how to use the new data utilities
 * for robust loading and type safety.
 */

import { createDataLoader, dataTransformers, loadJsonData } from './dataLoader';
import { logger } from './logger';
import { isRecipe, isRecipeIngredient } from '../services/recipeData';
import { 
  isAstrologicalProfile, 
  isElementalProperties,
  hasRequiredProperties,
  isArrayOf,
  validateNestedObject
} from './enhancedTypeGuards';
import type { Recipe } from '../types/recipe';
import type { AstrologicalProfile } from '../types/astrology';

/**
 * Example 1: Load recipe data with fallback and validation
 */
async function loadRecipeData() {
  const recipeLoader = createDataLoader<Recipe[]>({
    cacheKey: 'recipes',
    cacheTtl: 3600000, // 1 hour
    validator: (data) => {
      // Ensure we have an array of valid recipes
      return Array.isArray(data) && data.length > 0 && 
        data.every(item => isRecipe(item));
    },
    transformer: (data) => {
      if (!Array.isArray(data)) {
        logger.warn('Recipe data is not an array, returning empty array');
        return [];
      }
      
      // Filter out invalid recipes and standardize the valid ones
      return data
        .filter(item => isRecipe(item))
        .map(recipe => ({
          ...recipe,
          // Apply standard formatting to all properties
          name: dataTransformers.normalizeString(recipe.name),
          description: dataTransformers.normalizeString(recipe.description),
          // Ensure elemental properties are normalized
          elementalProperties: isElementalProperties(recipe.elementalProperties) 
            ? recipe.elementalProperties 
            : { Fire: 0, Water: 0, Earth: 0, Air: 0 }
        }));
    },
    fallback: [], // Provide empty array as fallback
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
  
  try {
    // Load data from a remote source with all the configured handling
    const result = await recipeLoader.loadData(async () => {
      // This could be a fetch call to an API
      const response = await fetch('/api/recipes');
      
      if (!response.ok) {
        throw new Error(`Failed to load recipes: ${response.statusText}`);
      }
      
      return response.json();
    });
    
    logger.info(`Loaded ${result.data.length} recipes from ${result.source}`);
    
    // Use the loaded data safely, knowing it's been validated and transformed
    return result.data;
  } catch (error) {
    logger.error('Failed to load recipe data:', error);
    return []; // Return empty array if all else fails
  }
}

/**
 * Example 2: Type guard usage for complex data validation
 */
function processAstrologicalData(data: unknown) {
  // First, check if it's a valid astrological profile
  if (!isAstrologicalProfile(data)) {
    logger.error('Invalid astrological profile data');
    return null;
  }
  
  // Now we can safely work with it as a typed object
  const profile: AstrologicalProfile = data;
  
  // Process zodiac influences if present
  if (profile.zodiac && profile.zodiac.length > 0) {
    logger.info(`Profile has ${profile.zodiac.length} zodiac influences`);
  }
  
  // Process planetary positions if present
  if (profile.planetary && profile.planetary.length > 0) {
    // Extract the planets in their signs
    const planetarySummary = profile.planetary.map(pos => 
      `${pos.planet} in ${pos.sign} at ${pos.degree}°${pos.isRetrograde ? ' (R)' : ''}`
    );
    
    logger.info(`Planetary positions: ${planetarySummary.join(', ')}`);
  }
  
  return profile;
}

/**
 * Example 3: Validate nested complex objects
 */
function validateComplexData(data: unknown) {
  // Validate a deeply nested object structure
  const validation = validateNestedObject(
    data,
    (obj): obj is Recipe => isRecipe(obj)
  );
  
  if (!validation.valid) {
    logger.error(`Validation failed at path: ${validation.path?.join('.')}`, {
      message: validation.message
    });
    return false;
  }
  
  return true;
}

/**
 * Example 4: Working with transformers
 */
function transformData() {
  // Convert array of items to a record by key
  const itemsArray = [
    { id: 'a1', name: 'Item 1' },
    { id: 'b2', name: 'Item 2' },
    { id: 'c3', name: 'Item 3' }
  ];
  
  const itemsById = dataTransformers.arrayToRecord(
    itemsArray, 
    item => item.id
  );
  
  // Normalize user input
  const userInput = {
    name: '  John Doe  ',
    age: '42',
    isAdmin: 'yes'
  };
  
  const normalizedInput = {
    name: dataTransformers.normalizeString(userInput.name),
    age: dataTransformers.normalizeNumber(userInput.age),
    isAdmin: dataTransformers.normalizeBoolean(userInput.isAdmin)
  };
  
  // Apply defaults for missing values
  const partialConfig = {
    theme: 'dark',
    fontSize: null
  };
  
  const fullConfig = dataTransformers.applyDefaults(
    partialConfig,
    {
      theme: 'light',
      fontSize: 16,
      showSidebar: true,
      animations: true
    }
  );
  
  return {
    itemsById,
    normalizedInput,
    fullConfig
  };
}

/**
 * Example 5: Using JSON data loader with error handling
 */
async function fetchCuisineData() {
  try {
    const result = await loadJsonData(
      () => fetch('/api/cuisines'),
      {
        cacheKey: 'cuisines',
        fallback: [],
        retry: { attempts: 2, delay: 500 }
      }
    );
    
    return result.data;
  } catch (error) {
    logger.error('Failed to load cuisine data:', error);
    return [];
  }
}

export {
  loadRecipeData,
  processAstrologicalData,
  validateComplexData,
  transformData,
  fetchCuisineData
}; 
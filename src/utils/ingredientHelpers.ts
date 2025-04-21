import { Ingredient } from '../types/commonTypes';

/**
 * Creates a default ingredient with a unique ID
 * @param name Optional ingredient name
 * @returns A new ingredient object with default values
 */
export function createDefaultIngredient(name = ''): Ingredient {
  return {
    id: `ingredient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    amount: 1,
    unit: 'unit'
  };
}

/**
 * Normalizes an ingredient by ensuring all required properties are present
 * @param ingredient The ingredient to normalize
 * @returns A normalized ingredient with all required properties
 */
export function normalizeIngredient(ingredient: Partial<Ingredient>): Ingredient {
  return {
    id: ingredient.id || `ingredient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: ingredient.name || '',
    amount: ingredient.amount || 1,
    unit: ingredient.unit || 'unit'
  };
}

/**
 * Parses an ingredient string (e.g., "2 cups flour") into an Ingredient object
 * @param ingredientStr The ingredient string to parse
 * @returns A parsed Ingredient object
 */
export function parseIngredientString(ingredientStr: string): Ingredient {
  // Simple regex to extract quantity, unit, and name - fixed to avoid ESLint warning
  const regex = /^([\d.]+)?\s*([a-zA-Z]+)?\s*(.+)$/;
  const match = ingredientStr.match(regex);
  
  if (!match) {
    return createDefaultIngredient(ingredientStr.trim());
  }
  
  const [_, quantity, unit, name] = match;
  
  return {
    id: `ingredient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    amount: quantity ? parseFloat(quantity) : 1,
    unit: unit || 'unit'
  };
} 